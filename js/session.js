window.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const loginBtn = document.querySelector(".navbar .btn-outline-light");
    
    // Solo proceder si el botón de login/logout existe en la página
    if (loginBtn) { 
        // Cambiar el texto y funcionalidad del botón según si el usuario está logueado
        if (usuario) {
            loginBtn.textContent = "Cerrar sesión";
            loginBtn.setAttribute("id", "logoutBtn");
            loginBtn.setAttribute("href", "#");
            
            const logout = () => {
                localStorage.removeItem("usuario");
                localStorage.removeItem("token"); // Asegurarse de remover el token
                
                loginBtn.textContent = "Iniciar sesión";
                loginBtn.setAttribute("href", "login.html");
                loginBtn.removeEventListener("click", logout);
                
                window.location.href = "index.html";
            };

            loginBtn.addEventListener("click", logout);
        } else {
            loginBtn.textContent = "Iniciar sesión";
            loginBtn.setAttribute("href", "login.html");
        }
    }

    const reservarBtn = document.querySelector(".btn-reservar");

    if (reservarBtn) {
        reservarBtn.addEventListener("click", (event) => {
            if (!usuario) {
                event.preventDefault();
                alert("⚠️ Debes iniciar sesión para hacer una reserva.");
                window.location.href = "login.html";
            }
        });
    }
});