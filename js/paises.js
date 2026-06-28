let paises = [];

/**
 * Carga los datos de paises.json y llena un select con ellos.
 * @param {string} selectElementId - El ID del elemento <select> a llenar.
 * @param {string} selectedCountry - El país que debe estar seleccionado.
 */
async function llenarPaises(selectElementId, selectedCountry = '') {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) {
        console.error(`Elemento con ID "${selectElementId}" no encontrado.`);
        return;
    }

    // Limpiar el select antes de llenarlo
    selectElement.innerHTML = `<option value="">-- Seleccione un país --</option>`;

    if (paises.length === 0) {
        try {
            const response = await fetch('paises.json');
            if (!response.ok) {
                throw new Error('Error al cargar el archivo de países.');
            }
            paises = await response.json();
            console.log('✅ Países cargados exitosamente.');
        } catch (error) {
            console.error('❌ Error al cargar los países:', error);
            return;
        }
    }

    paises.forEach(pais => {
        const option = document.createElement('option');
        option.value = pais.nombre_en; // O pais.nombre_es, según lo que prefieras guardar en la BD
        option.textContent = pais.nombre_es;
        if (pais.nombre_en === selectedCountry) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}