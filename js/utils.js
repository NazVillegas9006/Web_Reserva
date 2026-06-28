// Detecta si es localhost, 127.0.0.1 o IP y adapta la URL automáticamente
const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE = isLocalhost
    ? "http://localhost:3000"
    : "http://" + window.location.hostname + ":3000";

// Capa de compatibilidad sobre i18next:
// "traducciones" (Proxy) y "cambiarIdioma" interceptan las llamadas del sistema anterior
// y las redirigen al nuevo motor i18next de forma transparente para evitar romper scripts legados.
const traducciones = new Proxy({}, {
    get(target, lang) {
        return new Proxy({}, {
            get(innerTarget, key) {
                if (window.i18next && typeof window.i18next.t === 'function') {
                    return window.i18next.t(key);
                }
                return "";
            }
        });
    }
});

function cambiarIdioma(id) {
    localStorage.setItem("idioma", id);
    if (window.i18next && typeof window.i18next.changeLanguage === 'function') {
        window.i18next.changeLanguage(id, (err, t) => {
            if (err) return console.error('Error al cambiar idioma:', err);
            translateDOM();
        });
    } else {
        const event = new Event('languageChanged');
        window.dispatchEvent(event);
    }
}

function translateDOM() {
    if (!window.i18next || typeof window.i18next.t !== 'function') return;
    const t = window.i18next.t;

    // Cambiar textos de elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = t(key);
        if (val && val !== key) {
            el.innerHTML = val;
        }
    });

    // Cambiar placeholders de inputs con data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const val = t(key);
        if (val && val !== key) {
            el.placeholder = val;
        }
    });

    // Actualizar select2 en la página de reserva si está inicializado
    const paisSelect = $('#pais');
    if (paisSelect.data('select2')) {
        const placeholder = t("placeholderPais") || "Seleccione una opción";
        paisSelect.select2({
            placeholder: placeholder,
            width: '100%'
        });
    }

    // Actualizar selectores en modales de admin
    const adminModals = document.querySelectorAll('.modal');
    adminModals.forEach(modal => {
        const selects = modal.querySelectorAll('select.select2-hidden-accessible');
        selects.forEach(select => {
            const $select = $(select);
            if ($select.data('select2')) {
                const placeholderKey = $select.attr('data-placeholder-i18n');
                const placeholder = t(placeholderKey) || $select.attr('placeholder');
                $select.select2({
                    placeholder: placeholder,
                    width: '100%',
                    dropdownParent: $select.closest(".modal-body")
                });
            }
        });
    });

    // Disparar evento para que otros scripts reaccionen al cambio de idioma
    const event = new Event('languageChanged');
    window.dispatchEvent(event);
}

// Inicialización de i18next
if (window.i18next && window.i18nextHttpBackend) {
    window.i18next
        .use(window.i18nextHttpBackend)
        .init({
            lng: localStorage.getItem("idioma") || "es",
            fallbackLng: "es",
            backend: {
                loadPath: 'locales/{{lng}}/translation.json',
            }
        }, function(err, t) {
            if (err) return console.error('Error al inicializar i18next:', err);
            translateDOM();
        });
}


/**
 * Muestra un mensaje de alerta tipo "toast" en la parte superior derecha de la página.
 * @param {string} mensaje El texto del mensaje a mostrar.
 * @param {'success' | 'danger' | 'warning'} tipo El tipo de alerta.
 */
function mostrarMensaje(mensaje, tipo) {
    const contenedor = document.getElementById('toast-container') || (() => {
        const div = document.createElement('div');
        div.id = 'toast-container';
        div.style.position = 'fixed';
        div.style.top = '1rem';
        div.style.right = '1rem';
        div.style.zIndex = '1050';
        document.body.appendChild(div);
        return div;
    })();

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.setAttribute('role', 'alert');
    alerta.style.minWidth = '250px';

    alerta.innerHTML = `
        <div>${mensaje}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    contenedor.appendChild(alerta);

    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alerta);
        bsAlert.close();
    }, 5000); // 5 segundos
}