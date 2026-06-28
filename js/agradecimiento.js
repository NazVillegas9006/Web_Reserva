document.addEventListener("DOMContentLoaded", () => {
  // Obtener los datos de la reserva confirmada desde localStorage
  const reservaConfirmada = JSON.parse(localStorage.getItem("reservaConfirmada"));

  // Verificar si la reserva no está disponible
  if (!reservaConfirmada) {
    mostrarMensajeError();  // Mostrar mensaje de error si no hay reserva
    return;  // No continuar si no hay reserva
  }

  // Si la reserva está disponible, mostrar los datos
  const fecha = reservaConfirmada.fecha_visita;
  const codigo = reservaConfirmada.id_reserva;

  const fechaElemento = document.getElementById("fechaTour");
  const codigoElemento = document.getElementById("codigoReserva");

  if (fechaElemento) {
    fechaElemento.textContent = formatearFecha(fecha);
  }
  if (codigoElemento) {
    codigoElemento.textContent = "#" + codigo;
  }

  // Limpiar después de mostrar para no repetir
  localStorage.removeItem("reservaConfirmada");
});

function mostrarMensajeError() {
  const mensajeError = document.createElement("p");
  mensajeError.textContent = "No se encontró una reserva confirmada. Por favor, realiza una reserva para continuar.";
  mensajeError.style.color = "red";
  document.body.appendChild(mensajeError);  // Mostrar el mensaje en el body de la página
  console.error("❌ No se encontró la reserva en localStorage.");
}

function formatearFecha(fechaISO) {
  const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
  const fechaObj = new Date(fechaISO);
  return fechaObj.toLocaleDateString("es-ES", opciones);
}
