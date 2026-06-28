// Este script asume que las variables `API_BASE` y `traducciones`
// ya están disponibles globalmente, cargadas desde `utils.js`.

// Cargar reserva desde localStorage
const reserva = JSON.parse(localStorage.getItem("reservaConfirmada"));

document.addEventListener("DOMContentLoaded", () => {
    // Llenar los selects de expiración
    const expMonth = document.getElementById("expMonth");
    const expYear = document.getElementById("expYear");

    if (expMonth && expYear) {
        for (let i = 1; i <= 12; i++) {
            const mes = i.toString().padStart(2, "0");
            expMonth.innerHTML += `<option value="${mes}">${mes}</option>`;
        }

        const year = new Date().getFullYear();
        for (let i = 0; i < 10; i++) {
            expYear.innerHTML += `<option value="${year + i}">${year + i}</option>`;
        }
    }


    // Verificar que la reserva esté cargada
    if (!reserva) {
        const infoReserva = document.getElementById("infoReserva");
        if(infoReserva) infoReserva.innerHTML = "<p>No hay reserva cargada.</p>";
        const btnPay = document.getElementById("btnPay");
        if(btnPay) btnPay.disabled = true;
        console.error("❌ No se encontró la reserva en localStorage.");
        return;
    }
    
    // Obtener el usuario del localStorage para la validación
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.id_usuario !== reserva.id_usuario) {
        console.error("❌ El usuario autenticado no coincide con el dueño de la reserva.");
        const infoReserva = document.getElementById("infoReserva");
        if(infoReserva) infoReserva.innerHTML = "<p>Esta reserva no pertenece al usuario actual.</p>";
        const btnPay = document.getElementById("btnPay");
        if(btnPay) btnPay.disabled = true;
        mostrarMensaje("Acceso denegado. Esta reserva no te pertenece.", "danger");
        return;
    }


    // Si la reserva se carga correctamente, muestra la información
    document.getElementById("tituloPago").textContent = `RESERVACIÓN #${reserva.id_reserva || "No disponible"}`;

    const visitantesInfo = Object.entries(reserva.visitantes || {})
        .filter(([_, cantidad]) => cantidad > 0)
        .map(([categoria, cantidad]) => `${categoria.charAt(0).toUpperCase() + categoria.slice(1)}: ${cantidad}`)
        .join(", ");

    document.getElementById("infoReserva").innerHTML = `
        <ul>
            <li><strong>Fecha:</strong> ${reserva.fecha_visita}</li>
            <li><strong>Hora:</strong> ${reserva.hora_visita}</li>
            <li><strong>Visitantes:</strong> ${visitantesInfo || "No hay visitantes"}</li>
            <li><strong>Total:</strong> $${reserva.precio_total} USD</li>
        </ul>
    `;
    document.getElementById("btnPay").textContent = `Pagar $${reserva.precio_total} USD »`;

    // Deshabilitar el botón de pago por defecto
    const btnPay = document.getElementById("btnPay");
    if(btnPay) btnPay.disabled = true;

    // Evento de cambio de entrada para validar en tiempo real
    const form = document.getElementById("formPago");
    if(form) {
        form.addEventListener("input", () => {
            const payBtn = document.getElementById("btnPay");
            if(payBtn) payBtn.disabled = !validarFormulario();
        });
    }

    if(form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!validarFormulario()) {
                console.log("❌ Formulario no válido.");
                mostrarMensaje("Por favor, complete correctamente los datos de pago.", "danger");
                return;
            }

            const reserva = JSON.parse(localStorage.getItem("reservaConfirmada"));
            if (!reserva || !reserva.id_reserva) {
                console.error("❌ No se encontró la reserva o su ID en localStorage.");
                mostrarMensaje("No se pudo procesar el pago. Reserva no encontrada.", "danger");
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE}/reservas/client/${reserva.id_reserva}/estado`, {
                    method: "PUT",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify({
                        estado_pago: "exitoso",
                    })
                });

                const result = await response.json();

            if (response.ok) {
                // Guardar la reserva confirmada en localStorage antes de redirigir
                localStorage.setItem("reservaConfirmada", JSON.stringify(reserva));  // Guardar la reserva en localStorage

                mostrarMensaje("Pago procesado con éxito.", "success");

                // Borra la reserva anterior del localStorage (opcional, si no necesitas la reserva original ya)
                localStorage.removeItem("reserva");

                // Redirigir a la página de agradecimiento
                window.location.href = "agradecimiento.html";  
            } else {
                mostrarMensaje(result.mensaje || "Error desconocido al procesar el pago.", "danger");
                console.error("Error del servidor:", result.mensaje || "Error desconocido");
            }
            } catch (error) {
                mostrarMensaje("Error de conexión. Intente de nuevo más tarde.", "danger");
                console.error("Error al enviar la solicitud:", error);
            }
        });
    }
});

function validarFormulario() {
    let valido = true;

    const tarjeta = document.getElementById("cardNumber");
    const direccion = document.getElementById("address");
    const cvc = document.getElementById("cvc");
    const mes = document.getElementById("expMonth");
    const anio = document.getElementById("expYear");
    const hoy = new Date();
    
    if (!tarjeta || !direccion || !cvc || !mes || !anio) return false;

    const expiracion = new Date(parseInt(anio.value), parseInt(mes.value) - 1);

    if (!/^\d{16}$/.test(tarjeta.value)) {
        tarjeta.classList.add("is-invalid");
        valido = false;
    } else {
        tarjeta.classList.remove("is-invalid");
    }

    if (direccion.value.trim() === "") {
        direccion.classList.add("is-invalid");
        valido = false;
    } else {
        direccion.classList.remove("is-invalid");
    }

    if (!/^\d{3,4}$/.test(cvc.value)) {
        cvc.classList.add("is-invalid");
        valido = false;
    } else {
        cvc.classList.remove("is-invalid");
    }

    if (expiracion < hoy) {
        mes.classList.add("is-invalid");
        anio.classList.add("is-invalid");
        valido = false;
    } else {
        mes.classList.remove("is-invalid");
        anio.classList.remove("is-invalid");
    }

    return valido;
}