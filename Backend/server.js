const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

// CONFIGURACIÓN DE CORS FINAL Y FLEXIBLE PARA DESARROLLO
const allowedOrigins = [
    'http://localhost:5500', 
    'http://127.0.0.1:5500',
    'http://localhost:5501', 
    'http://127.0.0.1:5501'
];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));


const JWT_SECRET = process.env.JWT_SECRET || "super-secreto-y-seguro";

let db;

async function connectToDatabase() {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        console.log("✅ Conectado a la base de datos MySQL");
    } catch (err) {
        console.error("❌ Error al conectar a la base de datos:", err);
        process.exit(1);
    }
}
connectToDatabase();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        return res.status(401).json({ mensaje: "Token no proporcionado" });
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ mensaje: "Token no válido o expirado" });
        }
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.rol !== "admin") {
        return res
            .status(403)
            .json({ mensaje: "Acceso denegado: solo para administradores" });
    }
    next();
};

app.post("/registro", async (req, res) => {
    const { nombre, correo, contrasena, pais_procedencia, nacionalidad } =
        req.body;
    if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }
    try {
        const hash = await bcrypt.hash(contrasena, 10);
        const [result] = await db.execute(
            `INSERT INTO usuarios (nombre, correo, contraseña, rol, pais_procedencia, nacionalidad)
             VALUES (?, ?, ?, 'cliente', ?, ?)`,
            [nombre, correo, hash, pais_procedencia, nacionalidad]
        );
        res.json({ mensaje: "Usuario registrado correctamente" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ mensaje: "El correo ya está registrado" });
        }
        res.status(500).json({ mensaje: "Error al registrar el usuario" });
    }
});

app.post("/login", async (req, res) => {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
        return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }
    try {
        const [rows] = await db.execute("SELECT * FROM usuarios WHERE correo = ?", [
            correo,
        ]);
        if (rows.length === 0) {
            return res
                .status(401)
                .json({ mensaje: "Correo o contraseña incorrectos" });
        }
        const usuario = rows[0];
        const isMatch = await bcrypt.compare(contrasena, usuario.contraseña);
        if (!isMatch) {
            return res
                .status(401)
                .json({ mensaje: "Correo o contraseña incorrectos" });
        }
        const token = jwt.sign(
            { id: usuario.id_usuario, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(200).json({ mensaje: "Login exitoso", usuario, token });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ mensaje: "Error del servidor" });
    }
});

app.post("/recuperar", async (req, res) => {
    const { correo, nuevaContrasena } = req.body;
    if (!correo || !nuevaContrasena) {
        return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }
    try {
        const [rows] = await db.execute("SELECT * FROM usuarios WHERE correo = ?", [
            correo,
        ]);
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: "El correo no está registrado" });
        }
        const nuevaHash = await bcrypt.hash(nuevaContrasena, 10);
        await db.execute("UPDATE usuarios SET contraseña = ? WHERE correo = ?", [
            nuevaHash,
            correo,
        ]);
        res.json({ mensaje: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error("❌ Error al actualizar la contraseña:", error);
        res.status(500).json({ mensaje: "Error del servidor" });
    }
});

app.get("/usuarios", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { nombre, correo } = req.query;
        let query =
            "SELECT id_usuario, nombre, correo, rol, pais_procedencia, nacionalidad FROM usuarios WHERE 1=1";
        const params = [];
        if (nombre) {
            query += " AND nombre LIKE ?";
            params.push(`%${nombre}%`);
        }
        if (correo) {
            query += " AND correo LIKE ?";
            params.push(`%${correo}%`);
        }
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ mensaje: "Error al obtener usuarios" });
    }
});

app.post("/usuarios", authenticateToken, isAdmin, async (req, res) => {
    const { nombre, correo, contrasena, rol, pais_procedencia, nacionalidad } =
        req.body;
    if (!nombre || !correo || !contrasena || !rol) {
        return res
            .status(400)
            .json({ mensaje: "Faltan campos obligatorios para el usuario" });
    }
    try {
        const hash = await bcrypt.hash(contrasena, 10);
        const [result] = await db.execute(
            `INSERT INTO usuarios (nombre, correo, contraseña, rol, pais_procedencia, nacionalidad)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, correo, hash, rol, pais_procedencia, nacionalidad]
        );
        res
            .status(201)
            .json({ mensaje: "Usuario creado exitosamente", id: result.insertId });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ mensaje: "El correo ya está registrado" });
        }
        res.status(500).json({ mensaje: "Error al crear usuario" });
    }
});

app.put("/usuarios/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, correo, contrasena, rol, pais_procedencia, nacionalidad } =
        req.body;
    let query = `UPDATE usuarios SET nombre = ?, correo = ?, rol = ?, pais_procedencia = ?, nacionalidad = ?`;
    const params = [nombre, correo, rol, pais_procedencia, nacionalidad, id];
    if (contrasena) {
        const hash = await bcrypt.hash(contrasena, 10);
        query += `, contraseña = ?`;
        params.splice(5, 0, hash); // Inserta el hash antes del id
    }
    query += ` WHERE id_usuario = ?`;
    try {
        await db.execute(query, params);
        res.json({ mensaje: "Usuario actualizado exitosamente" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ mensaje: "El correo ya está registrado" });
        }
        res.status(500).json({ mensaje: "Error al actualizar usuario" });
    }
});

app.delete("/usuarios/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [reservasToDelete] = await db.execute(
            "SELECT id_reserva FROM reservas WHERE id_usuario = ?",
            [id]
        );

        if (reservasToDelete.length > 0) {
            const idsReservas = reservasToDelete.map((reserva) => reserva.id_reserva);

            const placeholders = idsReservas.map(() => "?").join(", ");
            await db.query(
                `DELETE FROM visitantes_categoria WHERE id_reserva IN (${placeholders})`,
                idsReservas
            );

            await db.execute("DELETE FROM reservas WHERE id_usuario = ?", [id]);
        }

        await db.execute("DELETE FROM usuarios WHERE id_usuario = ?", [id]);

        res.json({
            mensaje: "Usuario y sus datos relacionados eliminados exitosamente",
        });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({
            mensaje:
                "Error del servidor al intentar eliminar el usuario. Intente de nuevo más tarde.",
        });
    }
});

app.get("/reservas", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id_usuario, fecha_visita } = req.query;
        let query = `
            SELECT r.*, u.nombre AS nombre_usuario, u.pais_procedencia AS pais_usuario, u.nacionalidad AS nacionalidad_usuario
            FROM reservas r
            JOIN usuarios u ON r.id_usuario = u.id_usuario
            WHERE 1=1
        `;
        const params = [];
        if (id_usuario) {
            query += " AND r.id_usuario = ?";
            params.push(id_usuario);
        }
        if (fecha_visita) {
            query += " AND r.fecha_visita = ?";
            params.push(fecha_visita);
        }
        query += " ORDER BY r.fecha_visita, r.hora_visita";
        const [reservasRows] = await db.execute(query, params);

        const reservaIds = reservasRows.map((r) => r.id_reserva);
        let visitantesCounts = {};
        if (reservaIds.length > 0) {
            const [visitantesRows] = await db.query(
                "SELECT id_reserva, categoria, cantidad FROM visitantes_categoria WHERE id_reserva IN (?)",
                [reservaIds]
            );
            visitantesRows.forEach((v) => {
                if (!visitantesCounts[v.id_reserva]) {
                    visitantesCounts[v.id_reserva] = {};
                }
                visitantesCounts[v.id_reserva][v.categoria] = v.cantidad;
            });
        }

        const reservas = reservasRows.map((row) => {
            return {
                ...row,
                visitantes_counts: visitantesCounts[row.id_reserva] || {},
            };
        });

        res.json(reservas);
    } catch (error) {
        console.error("Error al obtener reservas:", error);
        res.status(500).json({ mensaje: "Error al obtener reservas" });
    }
});

app.post("/reservas", authenticateToken, isAdmin, async (req, res) => {
    const {
        id_usuario,
        fecha_visita,
        hora_visita,
        metodo_pago,
        estado_pago,
        tipo_cambio,
        precio_total,
        visitantes_counts,
    } = req.body;
    if (!["tarjeta", "efectivo", "online"].includes(metodo_pago)) {
        return res.status(400).json({ mensaje: "Método de pago no válido." });
    }
    try {
        const [result] = await db.execute(
            `INSERT INTO reservas (id_usuario, fecha_visita, hora_visita, fecha_reserva, metodo_pago, estado_pago, tipo_cambio, precio_total, acepta_terminos)
             VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
            [
                id_usuario,
                fecha_visita,
                hora_visita,
                metodo_pago,
                estado_pago,
                tipo_cambio,
                precio_total,
                true,
            ]
        );
        const id_reserva = result.insertId;
        if (visitantes_counts && Object.keys(visitantes_counts).length > 0) {
            const values = Object.entries(visitantes_counts).map(
                ([categoria, cantidad]) => [id_reserva, categoria, cantidad]
            );
            await db.query(
                "INSERT INTO visitantes_categoria (id_reserva, categoria, cantidad) VALUES ?",
                [values]
            );
        }
        res
            .status(201)
            .json({ mensaje: "Reserva creada exitosamente", id_reserva });
    } catch (error) {
        console.error("Error al crear reserva:", error);
        res.status(500).json({ mensaje: "Error al crear la reserva" });
    }
});

app.post("/reservas/client", authenticateToken, async (req, res) => {
    const {
        id_usuario,
        fecha_visita,
        hora_visita,
        metodo_pago,
        precio_total,
        visitantes_counts,
    } = req.body;
    if (req.user.id !== id_usuario) {
        return res
            .status(403)
            .json({
                mensaje:
                    "Acceso denegado: El ID de usuario no coincide con el autenticado.",
            });
    }

    try {
        const tipo_cambio = 1.0;
        const estado_pago = "pendiente";
        const acepta_terminos = true;

        const [result] = await db.execute(
            `INSERT INTO reservas (id_usuario, fecha_visita, hora_visita, fecha_reserva, metodo_pago, estado_pago, tipo_cambio, precio_total, acepta_terminos)
             VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
            [
                id_usuario,
                fecha_visita,
                hora_visita,
                metodo_pago,
                estado_pago,
                tipo_cambio,
                precio_total,
                acepta_terminos,
            ]
        );
        const id_reserva = result.insertId;

        if (visitantes_counts && Object.keys(visitantes_counts).length > 0) {
            const values = Object.entries(visitantes_counts).map(
                ([categoria, cantidad]) => [id_reserva, categoria, cantidad]
            );
            await db.query(
                "INSERT INTO visitantes_categoria (id_reserva, categoria, cantidad) VALUES ?",
                [values]
            );
        }
        res
            .status(201)
            .json({ mensaje: "Reserva creada exitosamente", id_reserva });
    } catch (error) {
        console.error("Error al crear reserva (cliente):", error);
        res.status(500).json({ mensaje: "Error al crear la reserva" });
    }
});

app.put("/reservas/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const {
        id_usuario,
        fecha_visita,
        hora_visita,
        metodo_pago,
        estado_pago,
        precio_total,
        visitantes_counts,
    } = req.body;
    if (!["tarjeta", "efectivo", "online"].includes(metodo_pago)) {
        return res.status(400).json({ mensaje: "Método de pago no válido." });
    }
    try {
        await db.execute(
            `UPDATE reservas SET id_usuario = ?, fecha_visita = ?, hora_visita = ?, metodo_pago = ?, estado_pago = ?, precio_total = ?
             WHERE id_reserva = ?`,
            [
                id_usuario,
                fecha_visita,
                hora_visita,
                metodo_pago,
                estado_pago,
                precio_total,
                id,
            ]
        );
        await db.execute("DELETE FROM visitantes_categoria WHERE id_reserva = ?", [
            id,
        ]);
        if (visitantes_counts && Object.keys(visitantes_counts).length > 0) {
            const values = Object.entries(visitantes_counts).map(
                ([categoria, cantidad]) => [id, categoria, cantidad]
            );
            await db.query(
                "INSERT INTO visitantes_categoria (id_reserva, categoria, cantidad) VALUES ?",
                [values]
            );
        }
        res.json({ mensaje: "Reserva actualizada exitosamente" });
    } catch (error) {
        console.error("Error al actualizar reserva:", error);
        res.status(500).json({ mensaje: "Error al actualizar la reserva" });
    }
});

app.put("/reservas/client/:id/estado", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { estado_pago } = req.body;

    if (!estado_pago) {
        return res.status(400).json({ mensaje: "Falta el estado de pago." });
    }

    try {
        const [reserva] = await db.execute('SELECT id_usuario FROM reservas WHERE id_reserva = ?', [id]);
        if (reserva.length === 0) {
            return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
        }
        if (reserva[0].id_usuario !== req.user.id) {
            return res.status(403).json({ mensaje: 'Acceso denegado: no es el propietario de la reserva.' });
        }

        const [result] = await db.execute(
            `UPDATE reservas SET estado_pago = ? WHERE id_reserva = ?`,
            [estado_pago, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Reserva no encontrada." });
        }

        res.json({ mensaje: "Estado de reserva actualizado correctamente." });
    } catch (error) {
        console.error("Error al actualizar el estado de la reserva:", error);
        res.status(500).json({ mensaje: "Error del servidor." });
    }
});


app.delete("/reservas/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute("DELETE FROM visitantes_categoria WHERE id_reserva = ?", [
            id,
        ]);
        await db.execute("DELETE FROM reservas WHERE id_reserva = ?", [id]);
        res.json({ mensaje: "Reserva eliminada exitosamente" });
    } catch (error) {
        console.error("Error al eliminar reserva:", error);
        res.status(500).json({ mensaje: "Error al eliminar reserva" });
    }
});

app.listen(3000, () => {
    console.log("🚀 Servidor corriendo en http://localhost:3000");
});