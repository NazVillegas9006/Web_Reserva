// ✅ Detecta si es localhost, 127.0.0.1 o IP y adapta la URL automáticamente
const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE = isLocalhost
  ? "http://localhost:3000"
  : "http://" + window.location.hostname + ":3000";

let paisesValidos = [];

fetch("paises.json")
  .then(res => res.json())
  .then(data => {
    paisesValidos = data.map(p => p.text.toLowerCase());
    const datalist = document.getElementById("sugerencias-pais");
    data.forEach(pais => {
      const option = document.createElement("option");
      option.value = pais.text;
      datalist.appendChild(option);
    });
  });

document.getElementById("registroForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const mostrarError = mensaje => {
    const div = document.getElementById("mensajeError");
    div.textContent = mensaje;
    div.classList.remove("d-none");
  };

  const ocultarError = () => {
    document.getElementById("mensajeError").classList.add("d-none");
  };

  // Obtener los valores de los campos
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const pais = document.getElementById("pais").value.trim();
  const nacionalidad = document.getElementById("nacionalidad").value;

  // Validación de nacionalidad según el país seleccionado
  if (pais.toLowerCase() === "costa rica" && nacionalidad !== "nacional") {
    mostrarError("⚠️ Si eres de Costa Rica, debes elegir 'Nacional'.");
    return;  // Detener si la validación no pasa
  }

  // Validación para otros países
  if (paisesValidos.includes(pais.toLowerCase()) && nacionalidad !== "extranjero" && pais.toLowerCase() !== "costa rica") {
    mostrarError("⚠️ Si seleccionas otro país, debes elegir 'Extranjero'.");
    return;  // Detener si la validación no pasa
  }

  ocultarError(); // Si la validación de nacionalidad es correcta, ocultamos el error

  // Validación de campos vacíos
  if (!nombre || !correo || !contrasena || !pais || !nacionalidad) {
    mostrarError("⚠️ Todos los campos son obligatorios.");
    return;  // Detener si hay campos vacíos
  }

  // Validación de formato de correo electrónico
  const emailValido = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo);
  if (!emailValido) {
    mostrarError("⚠️ Ingrese un correo electrónico válido.");
    return;  // Detener si el correo no es válido
  }

  // Validación de la contraseña
  const passValida = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(contrasena);
  if (!passValida) {
    mostrarError("⚠️ La contraseña debe tener al menos 6 caracteres con letras y números.");
    return;  // Detener si la contraseña no es válida
  }

  // Validación de país
  if (!paisesValidos.includes(pais.toLowerCase())) {
    mostrarError("⚠️ El país ingresado no es válido.");
    return;  // Detener si el país no es válido
  }

  ocultarError(); // Ocultamos el mensaje de error si todo está bien

  // Enviar los datos al servidor
  const data = {
    nombre: nombre,
    correo: correo,
    contrasena: contrasena,
    pais_procedencia: pais,
    nacionalidad: nacionalidad
  };

  try {
    const response = await fetch(`${API_BASE}/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.mensaje);
    if (response.ok) {
      window.location.href = "login.html";
    }
  } catch (error) {
    mostrarError("❌ Error al conectar con el servidor.");
    console.error(error);
  }
});

// Evento para detectar cambios en el país y ajustar las opciones de nacionalidad
document.getElementById("pais").addEventListener("input", function () {
  const paisSeleccionado = this.value.trim().toLowerCase();
  const tipoSelect = document.getElementById("nacionalidad");
  const errorMsg = document.getElementById("mensajeError");

  // Si el país seleccionado es Costa Rica
  if (paisSeleccionado === "costa rica") {
    tipoSelect.disabled = false;
    tipoSelect.value = "nacional";
    errorMsg.classList.add("d-none");  // Ocultar el error si es Costa Rica
  }
  // Si el país seleccionado es otro
  else if (paisesValidos.includes(paisSeleccionado)) {
    tipoSelect.disabled = false;
    tipoSelect.value = "extranjero";
    errorMsg.classList.add("d-none");  // Ocultar el error si es un país válido
  } 
  else {
    tipoSelect.disabled = true;
    errorMsg.classList.add("d-none");  // Ocultar el error si el país no es válido
  }
});
