let reservas = [];
let usuarios = [];

let filtroReserva = {
    id_usuario: null,
    fecha_visita: null,
};

let filtroUsuario = {
    nombre: null,
    correo: null,
};

// ====================================================================
// --- Funciones de Autenticación y Carga Inicial ---
// ====================================================================

const getToken = () => localStorage.getItem("token");
const getUsuario = () => {
    const usuarioString = localStorage.getItem("usuario");
    return usuarioString ? JSON.parse(usuarioString) : null;
};

const verificarAutenticacion = (requiredRole) => {
    const token = getToken();
    const usuario = getUsuario();

    if (!token || !usuario || usuario.rol !== requiredRole) {
        mostrarMensaje(traducciones[localStorage.getItem("idioma") || "es"].accesoDenegado, "danger");
        window.location.href = "login.html";
        return false;
    }
    return true;
};

async function cargarDatos() {
    if (!verificarAutenticacion("admin")) {
        return;
    }

    const token = getToken();
    const idioma = localStorage.getItem("idioma") || "es";

    try {
        const fetchOptions = {
            headers: { Authorization: `Bearer ${token}` },
        };

        const paramsUsuarios = new URLSearchParams();
        if (filtroUsuario.nombre)
            paramsUsuarios.append("nombre", filtroUsuario.nombre);
        if (filtroUsuario.correo)
            paramsUsuarios.append("correo", filtroUsuario.correo);
        const usuariosUrl = `${API_BASE}/usuarios?${paramsUsuarios.toString()}`;

        const paramsReservas = new URLSearchParams();
        if (filtroReserva.id_usuario)
            paramsReservas.append("id_usuario", filtroReserva.id_usuario);
        if (filtroReserva.fecha_visita)
            paramsReservas.append("fecha_visita", filtroReserva.fecha_visita);
        const reservasUrl = `${API_BASE}/reservas?${paramsReservas.toString()}`;

        const [usuariosRes, reservasRes] = await Promise.all([
            fetch(usuariosUrl, fetchOptions),
            fetch(reservasUrl, fetchOptions),
        ]);

        if (!usuariosRes.ok) {
            const errorText = await usuariosRes.text();
            throw new Error(errorText);
        }
        if (!reservasRes.ok) {
            const errorText = await reservasRes.text();
            throw new Error(errorText);
        }

        usuarios = await usuariosRes.json();
        reservas = await reservasRes.json();

        renderizarTablaUsuarios();
        renderizarTablaReservas();
        llenarFiltroUsuarios();
    } catch (error) {
        console.error("Error al cargar datos:", error);
        // El mensaje de error ahora será más limpio
        mostrarMensaje(`${traducciones[idioma].errorCargarDatos}: ${error.message}`, "danger");
        if (error.message.includes("Token") || error.message.includes("denegado")) {
            window.location.href = "login.html";
        }
    }
}

// ====================================================================
// --- Funciones de Renderizado y Traducciones ---
// ====================================================================

function renderizarTablaUsuarios() {
    const tbodyUsuarios = document.querySelector("#tablaUsuarios tbody");
    tbodyUsuarios.innerHTML = "";
    const idioma = localStorage.getItem("idioma") || "es";
    if (usuarios.length === 0) {
        tbodyUsuarios.innerHTML = `<tr><td colspan="6" class="text-center">${traducciones[idioma].noResultados}</td></tr>`;
    } else {
        usuarios.forEach((u) => {
            const fila = document.createElement("tr");
            fila.setAttribute("data-id", u.id_usuario);
            fila.innerHTML = `
                <td>${u.id_usuario}</td>
                <td class="editable-cell" data-field="nombre">${u.nombre}</td>
                <td class="editable-cell" data-field="correo">${u.correo}</td>
                <td class="editable-cell" data-field="rol">${u.rol}</td>
                <td class="editable-cell" data-field="pais_procedencia">${u.pais_procedencia || "-"}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editarUsuario(${u.id_usuario})">${traducciones[idioma].editar}</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${u.id_usuario})">${traducciones[idioma].eliminar}</button>
                </td>
            `;
            tbodyUsuarios.appendChild(fila);
        });
    }
    agregarManejadoresEdicion("tablaUsuarios");
}

function renderizarTablaReservas() {
    const tbodyReservas = document.querySelector("#tablaReservas tbody");
    if (!tbodyReservas) {
        console.error("No se encontró el tbody de la tabla de reservas.");
        return;
    }
    tbodyReservas.innerHTML = "";
    const idioma = localStorage.getItem("idioma") || "es";
    if (reservas.length === 0) {
        tbodyReservas.innerHTML = `<tr><td colspan="12" class="text-center">${traducciones[idioma].noResultados}</td></tr>`;
    } else {
        reservas.forEach((r) => {
            const nombreUsuario = usuarios.find(u => u.id_usuario === r.id_usuario)?.nombre || "Desconocido";
            const fechaReservaFormato = r.fecha_reserva ? new Date(r.fecha_reserva).toLocaleString(idioma) : "";
            const adultos = r.visitantes_counts ? r.visitantes_counts.adulto || 0 : 0;
            const ninos = r.visitantes_counts ? r.visitantes_counts.niño || 0 : 0;
            const infantes = r.visitantes_counts ? r.visitantes_counts.infante || 0 : 0;
            const mayores = r.visitantes_counts ? r.visitantes_counts.adulto_mayor || 0 : 0;
            const estado_pago = r.estado_pago || "pendiente";

            const fila = document.createElement("tr");
            fila.setAttribute("data-id", r.id_reserva);
            fila.innerHTML = `
                <td>${r.id_reserva}</td>
                <td class="editable-cell" data-field="id_usuario">${nombreUsuario}</td>
                <td class="editable-cell" data-field="fecha_visita">${r.fecha_visita}</td>
                <td class="editable-cell" data-field="hora_visita">${r.hora_visita}</td>
                <td>${fechaReservaFormato}</td>
                <td class="editable-cell" data-field="metodo_pago">${r.metodo_pago}</td>
                <td class="editable-cell" data-field="estado_pago">${estado_pago}</td>
                <td>${r.precio_total}</td>
                <td>${adultos}</td>
                <td>${ninos}</td>
                <td>${infantes}</td>
                <td>${mayores}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editarReserva(${r.id_reserva})">${traducciones[idioma].editar}</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarReserva(${r.id_reserva})">${traducciones[idioma].eliminar}</button>
                </td>
            `;
            tbodyReservas.appendChild(fila);
        });
    }
    agregarManejadoresEdicion("tablaReservas");
}

function agregarManejadoresEdicion(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    table.querySelectorAll(".editable-cell").forEach((cell) => {
        cell.removeEventListener("click", handleCellClick);
        cell.addEventListener("click", handleCellClick);
    });
}

function handleCellClick(event) {
    const cell = event.target;
    if (
        cell.children.length > 0 &&
        (cell.children[0].tagName === "INPUT" || cell.children[0].tagName === "SELECT")
    ) {
        return;
    }

    const originalValue = cell.textContent.trim();
    const field = cell.getAttribute("data-field");
    const rowId = cell.closest("tr").getAttribute("data-id");
    const isUserTable = cell.closest("table").id === "tablaUsuarios";

    let inputElement;
    const idioma = localStorage.getItem("idioma") || "es";

    switch (field) {
        case "fecha_visita":
        case "hora_visita":
            inputElement = document.createElement("input");
            inputElement.type = field === "fecha_visita" ? "date" : "time";
            inputElement.value = originalValue;
            break;
        case "id_usuario":
            inputElement = document.createElement("select");
            inputElement.className = "form-select form-select-sm";
            const currentReserva = reservas.find(r => r.id_reserva == rowId);
            if (currentReserva) {
                llenarUsuariosEnSelect(inputElement, currentReserva.id_usuario);
            }
            break;
        case "rol":
            inputElement = document.createElement("select");
            inputElement.className = "form-select form-select-sm";
            ["cliente", "admin"].forEach(option => {
                const opt = document.createElement("option");
                opt.value = option;
                opt.textContent = option.charAt(0).toUpperCase() + option.slice(1);
                if (originalValue.toLowerCase() === option) {
                    opt.selected = true;
                }
                inputElement.appendChild(opt);
            });
            break;
        case "metodo_pago":
            inputElement = document.createElement("select");
            inputElement.className = "form-select form-select-sm";
            ["tarjeta", "efectivo", "online"].forEach(option => {
                const opt = document.createElement("option");
                opt.value = option;
                opt.textContent = traducciones[idioma][`pago${option.charAt(0).toUpperCase() + option.slice(1)}`] || option;
                if (originalValue.toLowerCase() === option) {
                    opt.selected = true;
                }
                inputElement.appendChild(opt);
            });
            break;
        case "estado_pago":
            inputElement = document.createElement("select");
            inputElement.className = "form-select form-select-sm";
            ["pendiente", "exitoso", "fallido"].forEach(option => {
                const opt = document.createElement("option");
                opt.value = option;
                opt.textContent = option.charAt(0).toUpperCase() + option.slice(1);
                if (originalValue.toLowerCase() === option) {
                    opt.selected = true;
                }
                inputElement.appendChild(opt);
            });
            break;
        case "pais_procedencia":
            inputElement = document.createElement("select");
            inputElement.className = "form-select form-select-sm";
            const currentCountryUser = usuarios.find(u => u.id_usuario == rowId)?.pais_procedencia;
            llenarPaises(inputElement, currentCountryUser);
            break;
        default:
            inputElement = document.createElement("input");
            inputElement.type = "text";
            inputElement.value = originalValue;
            break;
    }

    cell.textContent = "";
    cell.appendChild(inputElement);
    inputElement.focus();

    if (inputElement.tagName === "SELECT" && typeof $.fn.select2 !== "undefined") {
        $(inputElement).select2({
            placeholder: `Seleccionar ${field}`,
            allowClear: true,
            width: "100%",
            dropdownParent: $(cell).closest(".modal-body").length ? $(cell).closest(".modal-body") : $('body')
        });
        $(inputElement).on('select2:close', function () {
            saveInlineEdit(cell, rowId, field, inputElement.value, isUserTable);
        });
    } else {
        inputElement.addEventListener("blur", () =>
            saveInlineEdit(cell, rowId, field, inputElement.value, isUserTable)
        );
        inputElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                inputElement.blur();
            }
        });
    }
}

async function saveInlineEdit(cell, id, field, newValue, isUserTable) {
    const currentInput = cell.querySelector("input, select");
    if (!currentInput) return;

    let cellTextContent = newValue;
    if (currentInput.tagName === "SELECT") {
        const selectedOption = currentInput.options[currentInput.selectedIndex];
        if (selectedOption) {
            cellTextContent = selectedOption.textContent;
        }
    }
    cell.textContent = cellTextContent;

    let originalRecord;
    let originalValueForComparison;

    if (isUserTable) {
        originalRecord = usuarios.find((u) => u.id_usuario == id);
        originalValueForComparison = originalRecord ? originalRecord[field] : undefined;
    } else {
        originalRecord = reservas.find((r) => r.id_reserva == id);
        if (field.startsWith("visitantes_")) {
            const categoria = field.replace("visitantes_", "");
            originalValueForComparison = originalRecord?.visitantes_counts?.[categoria];
        } else {
            originalValueForComparison = originalRecord ? originalRecord[field] : undefined;
        }
    }

    if (originalValueForComparison !== undefined && originalValueForComparison.toString().trim() === newValue.toString().trim()) {
        cargarDatos();
        return;
    }

    const token = getToken();
    const idioma = localStorage.getItem("idioma") || "es";
    if (!token) {
        mostrarMensaje(traducciones[idioma].sesionExpirada, "danger");
        window.location.href = "login.html";
        return;
    }

    let url;
    let updatedData = {};
    const record = isUserTable ?
        usuarios.find((u) => u.id_usuario == id) :
        reservas.find((r) => r.id_reserva == id);
    if (!record) {
        console.error("Registro no encontrado para actualizar.", id);
        mostrarMensaje(traducciones[idioma].errorGeneral, "danger");
        return;
    }

    if (isUserTable) {
        url = `${API_BASE}/usuarios/${id}`;
        updatedData = { ...record };
        if (field === "contrasena") {
            console.warn("La contraseña no se puede editar inline.");
            mostrarMensaje(traducciones[idioma].errorGeneral, "danger");
            return;
        } else {
            updatedData[field] = newValue;
        }
    } else {
        url = `${API_BASE}/reservas/${id}`;
        updatedData = { ...record };

        if (field.startsWith("visitantes_")) {
            const categoria = field.replace("visitantes_", "");
            if (!updatedData.visitantes_counts) {
                updatedData.visitantes_counts = {};
            }
            updatedData.visitantes_counts[categoria] = parseInt(newValue) || 0;
        } else {
            updatedData[field] = newValue;
        }
    }

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || `Error al actualizar ${field}.`);
        }
        
        mostrarMensaje(traducciones[idioma].reservaActualizada, "success");
        cargarDatos();
    } catch (error) {
        console.error("Error al guardar en línea:", error);
        mostrarMensaje(`${traducciones[idioma].errorGuardarReserva}: ${error.message}`, "danger");
        cargarDatos();
    }
}

// ====================================================================
// --- Lógica para modals de usuarios ---
// ====================================================================

function abrirFormularioUsuario() {
    const idioma = localStorage.getItem("idioma") || "es";
    document.getElementById("tituloModalUsuario").textContent = `+ ${traducciones[idioma].añadirUsuario}`;
    document.querySelector("#modalUsuario form").reset();
    document.getElementById("id_usuario_modal").value = "";
    document.getElementById("contrasena_usuario").required = true;

    const paisSelect = document.getElementById("pais_procedencia_usuario");
    llenarPaises(paisSelect);

    const nacionalidadSelect = document.getElementById("nacionalidad_usuario");
    if (nacionalidadSelect) {
        nacionalidadSelect.innerHTML = `<option value="">${traducciones[idioma].placeholderNacionalidad || "Seleccione"}</option>`;
        ['nacional', 'extranjero'].forEach(opt => {
            const option = document.createElement("option");
            option.value = opt;
            option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
            nacionalidadSelect.appendChild(option);
        });
    }

    const modal = new bootstrap.Modal(document.getElementById("modalUsuario"));
    modal.show();
}

function editarUsuario(id) {
    const u = usuarios.find((user) => user.id_usuario === id);
    if (!u) return mostrarMensaje(traducciones[localStorage.getItem("idioma") || "es"].usuarioNoEncontrado, "danger");
    const idioma = localStorage.getItem("idioma") || "es";

    document.getElementById("tituloModalUsuario").textContent = `${traducciones[idioma].editar} ${traducciones[idioma].usuario}`;
    document.getElementById("id_usuario_modal").value = u.id_usuario;
    document.getElementById("nombre_usuario").value = u.nombre;
    document.getElementById("correo_usuario").value = u.correo;
    document.getElementById("rol_usuario").value = u.rol;

    const paisSelect = document.getElementById("pais_procedencia_usuario");
    llenarPaises(paisSelect, u.pais_procedencia);

    const nacionalidadSelect = document.getElementById("nacionalidad_usuario");
    if (nacionalidadSelect) {
        nacionalidadSelect.innerHTML = `<option value="">${traducciones[idioma].placeholderNacionalidad || "Seleccione"}</option>`;
        ['nacional', 'extranjero'].forEach(opt => {
            const option = document.createElement("option");
            option.value = opt;
            option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
            if (u.nacionalidad && u.nacionalidad.toLowerCase() === opt) {
                option.selected = true;
            }
            nacionalidadSelect.appendChild(option);
        });
    }

    document.getElementById("contrasena_usuario").value = "";
    document.getElementById("contrasena_usuario").required = false;

    const modal = new bootstrap.Modal(document.getElementById("modalUsuario"));
    modal.show();
}

async function eliminarUsuario(id) {
    const idioma = localStorage.getItem("idioma") || "es";
    const token = getToken();

    if (!token) {
        mostrarMensaje(traducciones[idioma].sesionExpirada, "danger");
        window.location.href = "login.html";
        return;
    }

    const reservasDelUsuario = reservas.filter(r => r.id_usuario === id);
    let mensajeConfirmacion = traducciones[idioma].confirmEliminarUsuario;

    if (reservasDelUsuario.length > 0) {
        const plural = reservasDelUsuario.length > 1 ? 's' : '';
        mensajeConfirmacion = `${traducciones[idioma].confirmEliminarUsuario}
        ${traducciones[idioma].atencionReservas} (${reservasDelUsuario.length} reserva${plural}) ${traducciones[idioma].seranEliminadas}.
        ¿Desea continuar?`;
    }

    if (confirm(mensajeConfirmacion)) {
        try {
            const res = await fetch(`${API_BASE}/usuarios/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.mensaje || "Error al eliminar el usuario.");
            }

            mostrarMensaje(traducciones[idioma].usuarioEliminado, "success");
            cargarDatos();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            mostrarMensaje(`${traducciones[idioma].errorEliminarUsuario}: ${error.message}`, "danger");
        }
    }
}

async function guardarUsuario(event) {
    event.preventDefault();
    const id = document.getElementById("id_usuario_modal").value;
    const contrasena = document.getElementById("contrasena_usuario").value;
    const idioma = localStorage.getItem("idioma") || "es";
    const token = getToken();
    if (!token) {
        mostrarMensaje(traducciones[idioma].sesionExpirada, "danger");
        window.location.href = "login.html";
        return;
    }

    const usuario = {
        nombre: document.getElementById("nombre_usuario").value,
        correo: document.getElementById("correo_usuario").value,
        rol: document.getElementById("rol_usuario").value,
        pais_procedencia: document.getElementById("pais_procedencia_usuario").value,
        nacionalidad: document.getElementById("nacionalidad_usuario").value,
    };

    if (contrasena || !id) {
        usuario.contrasena = contrasena;
    }

    const url = id ? `${API_BASE}/usuarios/${id}` : `${API_BASE}/usuarios`;
    const method = id ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(usuario),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.mensaje || "Error al guardar el usuario.");
        }
        
        mostrarMensaje(id ? traducciones[idioma].usuarioActualizado : traducciones[idioma].usuarioCreado, "success");
        const modal = bootstrap.Modal.getInstance(document.getElementById("modalUsuario"));
        modal.hide();
        cargarDatos();
    } catch (error) {
        console.error("Error al guardar usuario:", error);
        mostrarMensaje(`${traducciones[idioma].errorGuardarUsuario}: ${error.message}`, "danger");
    }
}

// ====================================================================
// --- Lógica para modals de reservas ---
// ====================================================================

function calcularTotal() {
    const paisReserva = document.getElementById("pais_reserva_modal")?.value;
    const metodoPago = document.getElementById("metodo_pago")?.value;

    let esNacional = paisReserva === "Costa Rica" || paisReserva === "Costa Rica (CR)";
    if (!paisReserva) {
        const selectedUserId = document.getElementById("id_usuario_reserva")?.value;
        const selectedUser = usuarios.find(u => u.id_usuario == selectedUserId);
        if (selectedUser) {
            esNacional = selectedUser.pais_procedencia === "Costa Rica" || selectedUser.pais_procedencia === "Costa Rica (CR)";
        }
    }

    const tarifas = esNacional ?
        { adulto: 8, niño: 6, infante: 0, adulto_mayor: 8 } :
        { adulto: 15, niño: 8, infante: 0, adulto_mayor: 15 };

    let subtotalEntradas = 0;

    const counts = {
        adulto: parseInt(document.getElementById("adulto_cantidad")?.value) || 0,
        niño: parseInt(document.getElementById("niño_cantidad")?.value) || 0,
        infante: parseInt(document.getElementById("infante_cantidad")?.value) || 0,
        adulto_mayor: parseInt(document.getElementById("adulto_mayor_cantidad")?.value) || 0,
    };

    for (const categoria in counts) {
        const cantidad = counts[categoria];
        subtotalEntradas += tarifas[categoria] * cantidad;
    }

    let comision = 0;
    if (metodoPago === "tarjeta" || metodoPago === "online") {
        comision = 3;
    }

    const total = subtotalEntradas + comision;

    const totalElement = document.getElementById("total_modal");
    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)} USD`;
    }
    const precioHidden = document.getElementById("precio_total_hidden");
    if (precioHidden) {
        precioHidden.value = total.toFixed(2);
    }
}

function abrirFormularioReserva() {
    const idioma = localStorage.getItem("idioma") || "es";
    const modalReserva = document.getElementById('modalReserva');
    const form = document.querySelector("#formularioReservaModal");
    
    document.getElementById("tituloModalReserva").textContent = `+ ${traducciones[idioma].añadirReserva}`;
    form.reset();
    document.getElementById("id_reserva").value = "";
    
    const selectUsuario = document.getElementById("id_usuario_reserva");
    if ($(selectUsuario).data('select2')) {
      $(selectUsuario).select2('destroy');
    }
    llenarUsuariosEnSelect(selectUsuario, null);

    const selectPais = document.getElementById("pais_reserva_modal");
    if ($(selectPais).data('select2')) {
      $(selectPais).select2('destroy');
    }
    llenarPaises(selectPais, null);
    
    flatpickr(document.getElementById("fecha_visita"), {
        dateFormat: "Y-m-d",
        minDate: "today"
    });

    document.querySelectorAll('input[name="horario_tour_modal"]').forEach(radio => radio.checked = false);

    document.getElementById("adulto_cantidad").value = 0;
    document.getElementById("niño_cantidad").value = 0;
    document.getElementById("infante_cantidad").value = 0;
    document.getElementById("adulto_mayor_cantidad").value = 0;
    
    const modal = new bootstrap.Modal(modalReserva);
    modal.show();
    
    modalReserva.addEventListener('shown.bs.modal', function onModalShown() {
        calcularTotal();
        
        document.getElementById("id_usuario_reserva").addEventListener('change', calcularTotal);
        document.getElementById("pais_reserva_modal").addEventListener('change', calcularTotal);
        document.getElementById("metodo_pago").addEventListener('change', calcularTotal);
        
        document.querySelectorAll('.visitor-count-input').forEach(input => {
            input.addEventListener('input', calcularTotal);
        });
        
    });
}

function editarReserva(id) {
    const r = reservas.find((res) => res.id_reserva === id);
    if (!r) return mostrarMensaje(traducciones[localStorage.getItem("idioma") || "es"].reservaNoEncontrada, "danger");
    const idioma = localStorage.getItem("idioma") || "es";

    document.getElementById("tituloModalReserva").textContent = `${traducciones[idioma].editar} ${traducciones[idioma].reserva}`;
    document.getElementById("id_reserva").value = r.id_reserva;

    llenarUsuariosEnSelect(document.getElementById("id_usuario_reserva"), r.id_usuario);
    const usuarioReserva = usuarios.find(u => u.id_usuario === r.id_usuario);
    const paisUsuario = usuarioReserva ? usuarioReserva.pais_procedencia : "";
    llenarPaises(document.getElementById("pais_reserva_modal"), paisUsuario);


    document.getElementById("fecha_visita").value = r.fecha_visita;
    document.getElementById("metodo_pago").value = r.metodo_pago;
    document.getElementById("estado_pago").value = r.estado_pago;

    flatpickr(document.getElementById("fecha_visita"), {
        dateFormat: "Y-m-d",
        minDate: "today"
    }).setDate(r.fecha_visita);

    const selectedHorario = document.querySelector(`input[name="horario_tour_modal"][value="${r.hora_visita}"]`);
    if (selectedHorario) {
        selectedHorario.checked = true;
    } else {
        document.querySelectorAll('input[name="horario_tour_modal"]').forEach(radio => radio.checked = false);
    }

    document.getElementById("adulto_cantidad").value = r.visitantes_counts.adulto || 0;
    document.getElementById("niño_cantidad").value = r.visitantes_counts.niño || 0;
    document.getElementById("infante_cantidad").value = r.visitantes_counts.infante || 0;
    document.getElementById("adulto_mayor_cantidad").value = r.visitantes_counts.adulto_mayor || 0;

    calcularTotal();

    const modal = new bootstrap.Modal(document.getElementById("modalReserva"));
    modal.show();
}

async function eliminarReserva(id) {
    const idioma = localStorage.getItem("idioma") || "es";
    const token = getToken();
    if (!token) {
        mostrarMensaje(traducciones[idioma].sesionExpirada, "danger");
        window.location.href = "login.html";
        return;
    }
    if (confirm(traducciones[idioma].confirmEliminarReserva)) {
        try {
            const res = await fetch(`${API_BASE}/reservas/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.mensaje || "Error al eliminar la reserva.");
            }
            mostrarMensaje(traducciones[idioma].reservaEliminada, "success");
            cargarDatos();
        } catch (error) {
            console.error("Error al eliminar reserva:", error);
            mostrarMensaje(`${traducciones[idioma].errorEliminarReserva}: ${error.message}`, "danger");
        }
    }
}

async function guardarReserva(event) {
    event.preventDefault();
    const id = document.getElementById("id_reserva").value;
    const idioma = localStorage.getItem("idioma") || "es";
    const token = getToken();
    if (!token) {
        mostrarMensaje(traducciones[idioma].sesionExpirada, "danger");
        window.location.href = "login.html";
        return;
    }

    const visitantes_counts = {};
    const adultoCount = parseInt(document.getElementById("adulto_cantidad").value);
    const niñoCount = parseInt(document.getElementById("niño_cantidad").value);
    const infanteCount = parseInt(document.getElementById("infante_cantidad").value);
    const mayorCount = parseInt(document.getElementById("adulto_mayor_cantidad").value);

    if (adultoCount > 0) visitantes_counts.adulto = adultoCount;
    if (niñoCount > 0) visitantes_counts.niño = niñoCount;
    if (infanteCount > 0) visitantes_counts.infante = infanteCount;
    if (mayorCount > 0) visitantes_counts.adulto_mayor = mayorCount;

    const reserva = {
        id_usuario: parseInt(document.getElementById("id_usuario_reserva").value),
        fecha_visita: document.getElementById("fecha_visita").value,
        hora_visita: document.querySelector('input[name="horario_tour_modal"]:checked')?.value,
        metodo_pago: document.getElementById("metodo_pago").value,
        estado_pago: document.getElementById("estado_pago").value,
        tipo_cambio: parseFloat(document.getElementById("tipo_cambio")?.value || '1.0'),
        precio_total: parseFloat(document.getElementById("precio_total_hidden").value),
        acepta_terminos: true,
        visitantes_counts: visitantes_counts,
    };

    const url = id ? `${API_BASE}/reservas/${id}` : `${API_BASE}/reservas`;
    const method = id ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(reserva),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.mensaje || "Error al guardar la reserva. Verifique los datos e intente de nuevo.");
        }

        mostrarMensaje(id ? traducciones[idioma].reservaActualizada : traducciones[idioma].reservaCreada, "success");
        const modal = bootstrap.Modal.getInstance(document.getElementById("modalReserva"));
        modal.hide();
        cargarDatos();
    } catch (error) {
        console.error("Error al guardar reserva:", error);
        mostrarMensaje(`${traducciones[idioma].errorGuardarReserva}: ${error.message}`, "danger");
    }
}

// ====================================================================
// --- Lógica de filtrado de Tablas ---
// ====================================================================

async function aplicarFiltroUsuarios() {
    const nombre = document.getElementById("filtroNombreUsuario").value.trim();
    const correo = document.getElementById("filtroCorreoUsuario").value.trim();

    filtroUsuario = { nombre: nombre, correo: correo };
    cargarDatos();
}

async function aplicarFiltroReservas() {
    const usuarioSeleccionado = document.getElementById("filtroUsuario").value;
    const fechaVisita = document.getElementById("filtroFechaVisita").value;

    filtroReserva = {
        id_usuario: usuarioSeleccionado || null,
        fecha_visita: fechaVisita || null,
    };
    cargarDatos();
}

// ====================================================================
// --- Funciones de Utilidad ---
// ====================================================================

function llenarUsuariosEnSelect(selectElement, selectedId = null) {
    const idioma = localStorage.getItem("idioma") || "es";
    if (typeof $.fn.select2 !== "undefined" && $(selectElement).data("select2")) {
        $(selectElement).select2("destroy");
    }
    selectElement.innerHTML = `<option value="">${traducciones[idioma].seleccioneUsuario || "Seleccione un usuario"}</option>`;

    usuarios.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id_usuario;
        option.textContent = `${user.nombre} (ID: ${user.id_usuario})`;
        if (selectedId !== null && user.id_usuario === parseInt(selectedId)) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });

    if (typeof $.fn.select2 !== "undefined") {
        $(selectElement).select2({
            placeholder: traducciones[idioma].filtrarPorUsuario || "Seleccione un usuario",
            allowClear: true,
            width: "100%",
            dropdownParent: $(selectElement).closest(".modal-body").length ? $(selectElement).closest(".modal-body") : $('body')
        });
    }
}

function llenarFiltroUsuarios() {
    const filtroUsuarioSelect = document.getElementById("filtroUsuario");
    if (!filtroUsuarioSelect) return;
    const idioma = localStorage.getItem("idioma") || "es";

    if (typeof $.fn.select2 !== "undefined" && $(filtroUsuarioSelect).data("select2")) {
        $(filtroUsuarioSelect).select2("destroy");
    }
    filtroUsuarioSelect.innerHTML = `<option value="">${traducciones[idioma].todosLosUsuarios || "Todos los usuarios"}</option>`;

    usuarios.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id_usuario;
        option.textContent = `${user.nombre} (ID: ${user.id_usuario})`;
        filtroUsuarioSelect.appendChild(option);
    });

    if (typeof $.fn.select2 !== "undefined") {
        $(filtroUsuarioSelect).select2({
            placeholder: traducciones[idioma].filtrarPorUsuario,
            allowClear: true,
            width: "100%",
            dropdownParent: $('#filtroUsuario').parent()
        });
    }
}

async function llenarPaises(selectElement, selectedValue = null) {
    const idioma = localStorage.getItem("idioma") || "es";
    selectElement.innerHTML = `<option value="">${traducciones[idioma].placeholderPais || "Seleccione un país"}</option>`;

    try {
        const response = await fetch("paises.json");
        const paises = await response.json();

        paises.forEach(pais => {
            const option = document.createElement("option");
            option.value = pais.text;
            option.textContent = pais.text;
            if (selectedValue && pais.text === selectedValue) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });

        if (typeof $.fn.select2 !== "undefined") {
            $(selectElement).select2({
                placeholder: traducciones[idioma].placeholderPais || "Seleccione un país",
                dropdownParent: $(selectElement).closest(".modal-body"),
                width: '100%'
            });
        }

    } catch (error) {
        console.error("❌ Error al cargar países desde paises.json:", error);
    }
}

// ====================================================================
// --- Inicialización del Script ---
// ====================================================================

window.addEventListener("DOMContentLoaded", () => {
    if (!verificarAutenticacion("admin")) {
        return;
    }

    cargarDatos();

    document.getElementById("btnAddUsuario").addEventListener("click", abrirFormularioUsuario);
    document.getElementById("btnAddReserva").addEventListener("click", abrirFormularioReserva);

    document.getElementById("filtroNombreUsuario").addEventListener("input", aplicarFiltroUsuarios);
    document.getElementById("filtroCorreoUsuario").addEventListener("input", aplicarFiltroUsuarios);
    
    document.getElementById("btnFiltrarReservas").addEventListener("click", aplicarFiltroReservas);

    document.querySelectorAll('.plus-btn-modal, .minus-btn-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            const input = document.getElementById(`${type}_cantidad`);
            if (input) {
                let value = parseInt(input.value) || 0;
                if (e.target.classList.contains('plus-btn-modal')) {
                    value++;
                } else if (value > 0) {
                    value--;
                }
                input.value = value;
                calcularTotal();
            }
        });
    });

    const modalReserva = document.getElementById('modalReserva');
    if (modalReserva) {
        modalReserva.addEventListener('shown.bs.modal', function () {
            flatpickr(document.getElementById("fecha_visita"), {
                dateFormat: "Y-m-d",
                minDate: "today"
            });
            calcularTotal();
            
            document.getElementById("id_usuario_reserva").addEventListener('change', calcularTotal);
            document.getElementById("pais_reserva_modal").addEventListener('change', calcularTotal);
            document.getElementById("metodo_pago").addEventListener('change', calcularTotal);
            
            document.querySelectorAll('.visitor-count-input').forEach(input => {
                input.addEventListener('input', calcularTotal);
            });
        });
    }

    const modalUsuario = document.getElementById('modalUsuario');
    if (modalUsuario) {
        modalUsuario.addEventListener('shown.bs.modal', function () {
            const idUsuarioModal = document.getElementById("id_usuario_modal").value;
            if (idUsuarioModal) {
                document.getElementById("contrasena_usuario").value = "";
                document.getElementById("contrasena_usuario").required = false;
            } else {
                document.getElementById("contrasena_usuario").required = true;
            }
        });

        modalUsuario.addEventListener('hidden.bs.modal', function () {
            const focusedElement = document.activeElement;
            if (modalUsuario.contains(focusedElement)) {
                focusedElement.blur();
            }
        });
    }

    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        languageSelector.addEventListener('change', (e) => {
            cambiarIdioma(e.target.value);
        });
    }

    window.addEventListener('languageChanged', () => {
        const idioma = localStorage.getItem("idioma") || "es";
        document.querySelector('[data-i18n="tituloPrincipal"]').textContent = traducciones[idioma].tituloPrincipal;
        document.querySelector('[data-i18n="usuariosRegistrados"]').textContent = traducciones[idioma].usuariosRegistrados;
        document.querySelector('[data-i18n="reservasRealizadas"]').textContent = traducciones[idioma].reservasRealizadas;
        document.querySelector('#btnAddUsuario').textContent = `+ ${traducciones[idioma].añadirUsuario}`;
        document.querySelector('#btnAddReserva').textContent = `+ ${traducciones[idioma].añadirReserva}`;
        document.querySelector('[data-i18n="filtrarPorNombre"]').textContent = traducciones[idioma].filtrarPorNombre;
        document.querySelector('[data-i18n-placeholder="buscarPorNombre"]').placeholder = traducciones[idioma].buscarPorNombre;
        document.querySelector('[data-i18n="filtrarPorCorreo"]').textContent = traducciones[idioma].filtrarPorCorreo;
        document.querySelector('[data-i18n-placeholder="buscarPorCorreo"]').placeholder = traducciones[idioma].buscarPorCorreo;
        document.querySelector('[data-i18n="filtrarPorUsuario"]').textContent = traducciones[idioma].filtrarPorUsuario;
        document.querySelector('[data-i18n="fechaDeVisita"]').textContent = traducciones[idioma].fechaDeVisita;
        document.querySelector('[data-i18n="aplicar"]').textContent = traducciones[idioma].aplicar;
        renderizarTablaUsuarios();
        renderizarTablaReservas();
    });
});