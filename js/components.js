// js/components.js
(function() {
    // Check if user is admin
    const getUsuario = () => {
        const usuarioString = localStorage.getItem("usuario");
        try {
            return usuarioString ? JSON.parse(usuarioString) : null;
        } catch (e) {
            return null;
        }
    };
    const usuario = getUsuario();
    const isAdmin = usuario && usuario.rol === "admin";
    
    // Determine active page
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    // Inject Navbar
    const navbarPlaceholder = document.getElementById("navbar-placeholder");
    if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = `
<nav class="navbar navbar-expand-lg navbar-dark">
  <div class="container">
    <a class="navbar-brand d-flex align-items-center" href="index.html">
      <img src="assets/img/Logo.png" alt="Logo" width="50" class="me-2 rounded-circle">
      <span class="fw-bold text-white">Mariposario</span>
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse justify-content-between" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link ${page === 'index.html' ? 'active' : ''}" href="index.html" data-i18n="inicio">Inicio</a></li>
        <li class="nav-item"><a class="nav-link ${page === 'galeria.html' ? 'active' : ''}" href="galeria.html" data-i18n="galeria">Galería</a></li>
        <li class="nav-item"><a class="nav-link ${page === 'reserva.html' ? 'active' : ''}" href="reserva.html" data-i18n="reserva">Reserva</a></li>
        ${isAdmin ? `
        <li class="nav-item"><a class="nav-link ${page === 'gestionAdmin.html' ? 'active' : ''}" href="gestionAdmin.html" data-i18n="tituloGestion">Gestión</a></li>
        <li class="nav-item"><a class="nav-link ${page === 'reportes.html' ? 'active' : ''}" href="reportes.html" data-i18n="reportes">Reportes</a></li>
        ` : ''}
        <li class="nav-item"><a class="nav-link" href="#" data-i18n="ayuda">Ayuda</a></li>
      </ul>
      <div class="d-flex align-items-center ms-3">
        <div class="language-switcher">
          <select id="languageSelector" class="form-select form-select-sm">
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
        <a href="login.html" class="btn btn-outline-light ms-3">Iniciar sesión</a>
      </div>
    </div>
  </div>
</nav>
        `;

        // Synchronize and listen to language selector
        const languageSelector = navbarPlaceholder.querySelector("#languageSelector");
        if (languageSelector) {
            const currentLang = localStorage.getItem("idioma") || "es";
            languageSelector.value = currentLang;
            
            languageSelector.addEventListener("change", function(e) {
                const newLang = e.target.value;
                localStorage.setItem("idioma", newLang);
                
                // Propagate language change event to other scripts
                if (typeof cambiarIdioma === "function") {
                    cambiarIdioma(newLang);
                } else if (typeof translations !== "undefined" && translations[newLang]) {
                    document.querySelectorAll("[data-i18n]").forEach(el => {
                        const key = el.getAttribute("data-i18n");
                        if (translations[newLang][key]) {
                            el.innerHTML = translations[newLang][key];
                        }
                    });
                }
            });
        }
    }

    // Inject Footer
    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
<footer class="text-white text-center">
  <div class="container">
    <img src="assets/img/Logo.png" alt="Logo" width="70" class="rounded-circle mb-2" />
    <h5 class="mt-2">Mariposario</h5>
    <p class="mb-1">Connect with Us and Explore</p>
    <p class="mb-1"><span data-i18n="contactanos">Contáctanos</span></p>
    <p class="mb-1">📧 contacto@mariposario.com</p>
    <p class="mb-0">📞 +506 8888-8888</p>
  </div>
</footer>
        `;
    }
})();
