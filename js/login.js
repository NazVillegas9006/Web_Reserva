// login.js
// Las variables API_BASE y traducciones son cargadas desde utils.js
// Asegúrate de que utils.js se cargue antes en el HTML

// Validación y manejo del formulario de login
document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const emailValido = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    const passValida = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(password);

    if (!emailValido || !passValida) {
        alert("Por favor, ingrese un correo válido y una contraseña segura (letras y números).");
        return;
    }

    const data = {
        correo: email,
        contrasena: password
    };

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            const usuario = result.usuario;
            const token = result.token;

            localStorage.setItem("usuario", JSON.stringify(usuario));
            localStorage.setItem("token", token);

            if (usuario.rol === "admin") {
                window.location.href = "gestionAdmin.html";
            } else {
                window.location.href = "reserva.html";
            }
        } else {
            alert(result.mensaje);
        }
    } catch (error) {
        console.error("❌ Error en la conexión:", error);
        alert("Error de conexión. Asegúrese de que el servidor esté encendido y que la URL sea la correcta.");
    }
});

// Lógica para el cambio de idioma
document.getElementById("languageSelector").addEventListener("change", e => {
    cambiarIdioma(e.target.value);
});

const idiomaGuardado = localStorage.getItem("idioma") || "es";
document.getElementById("languageSelector").value = idiomaGuardado;
cambiarIdioma(idiomaGuardado);