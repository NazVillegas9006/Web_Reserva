// Detecta si es localhost, 127.0.0.1 o IP y adapta la URL automáticamente
const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE = isLocalhost
    ? "http://localhost:3000"
    : "http://" + window.location.hostname + ":3000";

// Traducciones de la página
const traducciones = {
    es: {
        inicio: "Inicio", galeria: "Galería", reserva: "Reserva", ayuda: "Ayuda",
        tituloReserva: "Reserva tu Tour", fechaTour: "Fecha del Tour:", paisVives: "País donde vives:",
        metodoPago: "Método de pago:", pagoEfectivo: "Efectivo", pagoTarjeta: "Tarjeta",
        pagoOnline: "Pago en línea", horarioTour: "Horario de Tour:",
        adultosLabel: "Adultos (19-64 años)", ninosLabel: "Niños (9-17 años)",
        infantesLabel: "Infantes (0-8 años)", mayoresLabel: "Adultos Mayores (65+)",
        aceptoTerminos: "Acepto términos y condiciones", botonReservar: "Reservar Tiquetes",
        contactanos: "Contáctanos", placeholderPais: "Seleccione una opción",

        // Gestión Admin
        tituloGestion: "Gestión de Datos",
        tituloPrincipal: "Datos del sistema",
        usuariosRegistrados: "Usuarios Registrados",
        añadirUsuario: "Añadir Usuario",
        filtrarPorNombre: "Filtrar por Nombre",
        buscarPorNombre: "Buscar por nombre...",
        filtrarPorCorreo: "Filtrar por Correo",
        buscarPorCorreo: "Buscar por correo...",
        id: "ID",
        nombre: "Nombre",
        correo: "Correo",
        rol: "Rol",
        pais: "País",
        acciones: "Acciones",
        reservasRealizadas: "Reservas Realizadas",
        añadirReserva: "Añadir Reserva",
        filtrarPorUsuario: "Filtrar por Usuario",
        todosLosUsuarios: "Todos los usuarios",
        fechaDeVisita: "Fecha de Visita",
        aplicar: "Aplicar",
        usuario: "Usuario",
        fechaVisita: "Fecha Visita",
        hora: "Hora",
        fechaReserva: "Fecha Reserva",
        estadoPago: "Estado Pago",
        total: "Total",
        adultos: "Adultos",
        ninos: "Niños",
        infantes: "Infantes",
        mayores: "Mayores",
        
        // Modals
        editar: "Editar",
        eliminar: "Eliminar",
        guardar: "Guardar",
        cancelar: "Cancelar",
        seleccione: "Seleccione",
        contrasena: "Contraseña",
        contrasenaTexto: "Solo es necesario si creas un nuevo usuario o cambias la contraseña.",
        paisProcedencia: "País de Procedencia",
        nacionalidad: "Nacionalidad",
        paisDeLaReserva: "País de la reserva:",
        visitantes: "Visitantes",
        adultosLabelModal: "Adultos (19-64 años)",
        ninosLabelModal: "Niños (9-17 años)",
        infantesLabelModal: "Infantes (0-8 años)",
        mayoresLabelModal: "Adultos Mayores (65+)",
        totalModal: "Total:",

        // Mensajes de Alerta
        noResultados: "No se encontraron resultados relacionados.",
        accesoDenegado: "Acceso denegado. Por favor, inicie sesión como administrador.",
        errorCargarDatos: "Hubo un error al cargar los datos.",
        sesionExpirada: "Sesión expirada. Por favor, inicia sesión de nuevo.",
        confirmEliminarUsuario: "¿Está seguro que desea eliminar este usuario?",
        accesoDenegadoPropietario: "Acceso denegado: Esta reserva no te pertenece.",
        atencionReservas: "Atención: Las reservas de este usuario",
        seranEliminadas: "también serán eliminadas",
        errorEliminarUsuario: "Error al eliminar usuario",
        usuarioCreado: "Usuario creado exitosamente",
        usuarioActualizado: "Usuario actualizado exitosamente",
        errorGuardarUsuario: "Error al guardar usuario",
        reservaNoEncontrada: "Reserva no encontrada",
        reservaActualizada: "Reserva actualizada exitosamente",
        errorGuardarReserva: "Error al guardar la reserva",
        reservaEliminada: "Reserva eliminada exitosamente",
        usuarioEliminado: "Usuario y sus datos relacionados eliminados exitosamente",
        pagoExitoso: "Pago procesado con éxito.",
        errorGeneral: "Ha ocurrido un error. Intente de nuevo.",
        errorProcesarPago: "Error al procesar el pago. Intente de nuevo.",
        errorConexion: "Error de conexión. Intente más tarde.",
        reservaNoEncontradaPago: "No se encontró la reserva para procesar el pago."
    },
    en: {
        inicio: "Home", galeria: "Gallery", reserva: "Booking", ayuda: "Help",
        tituloReserva: "Book Your Tour", fechaTour: "Tour Date:", paisVives: "Country you live in:",
        metodoPago: "Payment Method:", pagoEfectivo: "Cash", pagoTarjeta: "Card", pagoOnline: "Online",
        horarioTour: "Tour Time:", adultosLabel: "Adults (19-64 yrs)", ninosLabel: "Children (9-17 yrs)",
        infantesLabel: "Infants (0-8 yrs)", mayoresLabel: "Seniors (65+ yrs)",
        aceptoTerminos: "I agree with terms and conditions", botonReservar: "Reserve Tickets",
        contactanos: "Contact Us", placeholderPais: "Select an option",

        // Admin Management
        tituloGestion: "Data Management",
        tituloPrincipal: "System Data",
        usuariosRegistrados: "Registered Users",
        añadirUsuario: "Add User",
        filtrarPorNombre: "Filter by Name",
        buscarPorNombre: "Search by name...",
        filtrarPorCorreo: "Filter by Email",
        buscarPorCorreo: "Search by email...",
        id: "ID",
        nombre: "Name",
        correo: "Email",
        rol: "Role",
        pais: "Country",
        acciones: "Actions",
        reservasRealizadas: "Completed Bookings",
        añadirReserva: "Add Booking",
        filtrarPorUsuario: "Filter by User",
        todosLosUsuarios: "All users",
        fechaDeVisita: "Visit Date",
        aplicar: "Apply",
        usuario: "User",
        fechaVisita: "Visit Date",
        hora: "Time",
        fechaReserva: "Booking Date",
        estadoPago: "Payment Status",
        total: "Total",
        adultos: "Adults",
        ninos: "Children",
        infantes: "Infants",
        mayores: "Seniors",

        // Modals
        editar: "Edit",
        eliminar: "Delete",
        guardar: "Save",
        cancelar: "Cancel",
        seleccione: "Select",
        contrasena: "Password",
        contrasenaTexto: "Only required for new users or password changes.",
        paisProcedencia: "Country of Origin",
        nacionalidad: "Nationality",
        paisDeLaReserva: "Country of booking:",
        visitantes: "Visitors",
        adultosLabelModal: "Adults (19-64 yrs)",
        ninosLabelModal: "Children (9-17 yrs)",
        infantesLabelModal: "Infants (0-8 yrs)",
        mayoresLabelModal: "Seniors (65+ yrs)",
        totalModal: "Total:",

        // Alert Messages
        noResultados: "No related results were found.",
        accesoDenegado: "Access denied. Please log in as an administrator.",
        errorCargarDatos: "There was an error loading the data.",
        sesionExpirada: "Session expired. Please log in again.",
        confirmEliminarUsuario: "Are you sure you want to delete this user?",
        accesoDenegadoPropietario: "Access denied: This reservation doesn't belong to you.",
        atencionReservas: "Warning: This user's reservations",
        seranEliminadas: "will also be deleted",
        errorEliminarUsuario: "Error deleting user",
        usuarioCreado: "User created successfully",
        usuarioActualizado: "User updated successfully",
        errorGuardarUsuario: "Error saving user",
        reservaNoEncontrada: "Booking not found",
        reservaActualizada: "Booking updated successfully",
        errorGuardarReserva: "Error saving booking",
        reservaEliminada: "Booking deleted successfully",
        usuarioEliminado: "User and related data deleted successfully",
        pagoExitoso: "Payment processed successfully.",
        errorGeneral: "An error has occurred. Please try again.",
        errorProcesarPago: "Error processing payment. Please try again.",
        errorConexion: "Connection error. Please try again later.",
        reservaNoEncontradaPago: "Booking not found to process payment."
    }
};

function cambiarIdioma(id) {
    localStorage.setItem("idioma", id);
    // Cambiar textos de elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (traducciones[id][key]) {
            el.textContent = traducciones[id][key];
        }
    });

    // Cambiar placeholders de inputs con data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (traducciones[id][key]) {
            el.placeholder = traducciones[id][key];
        }
    });

    // Actualizar select2 en la página de reserva si está inicializado
    const paisSelect = $('#pais');
    if (paisSelect.data('select2')) {
        const placeholder = traducciones[id].placeholderPais || "Seleccione una opción";
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
                const placeholder = traducciones[id][placeholderKey] || $select.attr('placeholder');
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