// ✅ Detecta si es localhost o IP y adapta la URL automáticamente
const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE = isLocalhost
  ? "http://localhost:3000"
  : "http://" + window.location.hostname + ":3000";

document.getElementById("recuperarForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const correo = document.getElementById("email").value.trim();
  const nueva = document.getElementById("newPassword").value.trim();
  const confirmar = document.getElementById("confirmPassword").value.trim();

  const emailValido = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo);
  const passValida = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(nueva);

  if (!emailValido) {
    alert("Por favor, ingrese un correo válido.");
    return;
  }

  if (!passValida) {
    alert("La contraseña debe tener al menos 6 caracteres, incluyendo letras y números.");
    return;
  }

  if (nueva !== confirmar) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  const data = {
    correo: correo,
    nuevaContrasena: nueva
  };

  try {
    const response = await fetch(`${API_BASE}/recuperar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      alert("✅ Contraseña actualizada correctamente. Puedes iniciar sesión.");
      window.location.href = "login.html";
    } else {
      alert("❌ " + result.mensaje);
    }

  } catch (error) {
    alert("Error al conectar con el servidor");
    console.error("❌ Error:", error);
  }
});
