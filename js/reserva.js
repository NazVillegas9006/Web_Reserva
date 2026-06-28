// Este script depende de utils.js, que debe ser incluido primero.
// Las variables API_BASE y traducciones, y la función cambiarIdioma se obtienen de utils.js

const paisEl = document.getElementById("pais"),
    metodoEl = document.getElementById("metodoPago"),
    cubosEl = document.getElementById("cubos"),
    totalEl = document.getElementById("totalUSD"),
    btnReserva = document.getElementById("btnReservar"),
    aceptoEl = document.getElementById("acepto"),
    horarios = document.querySelectorAll(".horario-btn"),
    fechaTourInput = document.getElementById("fechaTour");


let datos = {
    pais: "",
    metodo: "efectivo",
    horario: "",
    counts: { adulto: 0, nino: 0, infante: 0, adulto_mayor: 0 }
};

// ====================================================================
// --- Funciones de Llenado y Autocompletado ---
// ====================================================================

window.addEventListener("DOMContentLoaded", async () => {
    const idioma = localStorage.getItem("idioma") || "es";
    const languageSelector = document.getElementById("languageSelector");
    if (languageSelector) {
        languageSelector.value = idioma;
        cambiarIdioma(idioma); 
    }

    flatpickr("#fechaTour", { minDate: "today", dateFormat: "Y-m-d" });
    generarContadores();
    await llenarPaises();
    verificarSesionYAutocompletar();
});

async function verificarSesionYAutocompletar() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario || !localStorage.getItem("token")) {
        alert("⚠️ Debes iniciar sesión para hacer una reserva.");
        window.location.href = "login.html";
        return;
    }

    if (usuario && usuario.pais_procedencia) {
        const paisGuardado = usuario.pais_procedencia;
        const paisSelect = document.getElementById("pais");

        const opcion = Array.from(paisSelect.options).find(opt =>
            opt.value === paisGuardado || opt.text === paisGuardado
        );

        if (opcion) {
            paisSelect.value = opcion.value;
            $('#pais').val(opcion.value).trigger("change.select2");
            datos.pais = opcion.value;
            calcular();
        } else {
            console.warn("🌍 País guardado no se encontró en la lista:", paisGuardado);
        }
    }
}

async function llenarPaises() {
    const idioma = localStorage.getItem("idioma") || "es";
    const paisSelect = document.getElementById("pais");
    const selectedValue = paisSelect.value;
    paisSelect.innerHTML = `<option value="" disabled selected>${traducciones[idioma].placeholderPais}</option>`;
    try {
        const response = await fetch("paises.json");
        const paises = await response.json();
        paises.forEach(pais => {
            const option = document.createElement("option");
            option.value = pais.text;
            option.textContent = pais.text;
            paisSelect.appendChild(option);
        });
        if (selectedValue) {
            $(paisSelect).val(selectedValue).trigger('change');
        }
        aplicarSelect2();
    } catch (error) {
        console.error("❌ Error al cargar países desde paises.json:", error);
    }
}

function aplicarSelect2() {
    $('#pais').select2({
        placeholder: traducciones[localStorage.getItem("idioma") || "es"].placeholderPais,
        width: '100%'
    });
}

function generarContadores() {
    cubosEl.innerHTML = "";
    ["adulto", "nino", "infante", "adulto_mayor"].forEach(k => {
        const idioma = localStorage.getItem("idioma") || "es";
        const keyMap = {
            "adulto": "adultosLabel",
            "nino": "ninosLabel",
            "infante": "infantesLabel",
            "adulto_mayor": "mayoresLabel"
        };
        const labelText = traducciones[idioma][keyMap[k]];

        const div = document.createElement("div");
        div.className = "col-md-3";
        div.innerHTML = `
            <label class="form-label fw-bold" data-i18n="${keyMap[k]}">${labelText}</label>
            <div class="input-group">
                <button class="btn btn-outline-secondary btn-sm minus" data-key="${k}">−</button>
                <input data-key="${k}" class="form-control text-center" value="0" readonly>
                <button class="btn btn-outline-secondary btn-sm plus" data-key="${k}">+</button>
                <span class="input-group-text" id="precio-${k}">$0 USD</span>
            </div>`;
        cubosEl.append(div);
    });
}

// ====================================================================
// --- Lógica de cálculo y eventos ---
// ====================================================================

function calcular() {
    const esNacional = datos.pais === "Costa Rica" || datos.pais === "Costa Rica (CR)";
    const tarifas = esNacional
        ? { adulto: 8, nino: 6, infante: 0, adulto_mayor: 8 }
        : { adulto: 15, nino: 8, infante: 0, adulto_mayor: 15 };

    let subtotalEntradas = 0;
    for (let k in datos.counts) {
        const cnt = datos.counts[k];
        const tarifaBase = tarifas[k];
        const prec = tarifaBase * cnt;
        const precioDisplayEl = document.getElementById(`precio-${k}`);
        if(precioDisplayEl) precioDisplayEl.textContent = `$${prec.toFixed(2)} USD`;
        subtotalEntradas += prec;
    }

    const comision = (datos.metodo === "tarjeta" || datos.metodo === "online") ? 3 : 0;
    const total = subtotalEntradas + comision;

    totalEl.textContent = `$${total.toFixed(2)} USD`;
    btnReserva.disabled = !(
        total > 0 &&
        aceptoEl.checked &&
        datos.pais &&
        fechaTourInput.value &&
        datos.horario
    );
}

// Event Listeners
cubosEl.addEventListener("click", e => {
    if (e.target.matches(".plus, .minus")) {
        const k = e.target.dataset.key;
        const input = cubosEl.querySelector(`input[data-key="${k}"]`);
        if (input) {
            let value = parseInt(input.value) || 0;
            if (e.target.matches(".plus")) {
                value++;
            } else if (value > 0) {
                value--;
            }
            datos.counts[k] = value;
            input.value = value;
            calcular();
        }
    }
});

paisEl.addEventListener("change", e => {
    datos.pais = e.target.value;
    calcular();
});

metodoEl.addEventListener("change", e => {
    datos.metodo = e.target.value;
    localStorage.setItem("metodo_pago", e.target.value);
    calcular();
});

aceptoEl.addEventListener("change", calcular);

horarios.forEach(b => b.addEventListener("click", () => {
    horarios.forEach(bt => bt.classList.remove("btn-primary"));
    b.classList.add("btn-primary");
    datos.horario = b.textContent;
    calcular();
}));

fechaTourInput.addEventListener("change", calcular);
btnReserva.addEventListener("click", async () => {
    if (btnReserva.disabled) return;
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.id_usuario) {
        alert("Debes iniciar sesión para hacer una reserva.");
        return;
    }
    const reservaParaBackend = {
        id_usuario: usuario.id_usuario,
        fecha_visita: fechaTourInput.value,
        hora_visita: datos.horario,
        metodo_pago: datos.metodo,
        precio_total: parseFloat(totalEl.textContent.replace(/\$|\sUSD/g, "")),
        visitantes_counts: datos.counts
    };

    try {
        const res = await fetch(`${API_BASE}/reservas/client`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(reservaParaBackend)
        });

        const result = await res.json();
        if (!res.ok) {
            throw new Error(result.mensaje || "Error al crear la reserva.");
        }

        // Guardar la reserva en localStorage antes de redirigir
        localStorage.setItem("reservaConfirmada", JSON.stringify({
            id_reserva: result.id_reserva,
            id_usuario: usuario.id_usuario,
            precio_total: reservaParaBackend.precio_total,
            fecha_visita: reservaParaBackend.fecha_visita,
            hora_visita: reservaParaBackend.hora_visita,
            metodo_pago: reservaParaBackend.metodo_pago,
            visitantes: reservaParaBackend.visitantes_counts
        }));

        mostrarMensaje("Reserva creada con éxito. Redirigiendo...", "success");

        // Redirigir dependiendo del método de pago
        if (reservaParaBackend.metodo_pago === "online") {
            setTimeout(() => {
                window.location.href = "pago.html";  // Redirigir a pago.html si es online
            }, 2000);
        } else {
            setTimeout(() => {
                window.location.href = "agradecimiento.html";  // Redirigir a agradecimiento.html si es efectivo o tarjeta
            }, 2000);
        }

    } catch (err) {
        alert("❌ No se pudo guardar la reserva en el servidor: " + err.message);
        console.error(err);
    }
});
