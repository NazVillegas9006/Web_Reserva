const traducciones = {
  es: {
    inicio: "Inicio", galeria: "Galería", reserva: "Reserva", ayuda: "Ayuda", reportes: "Reportes",
    tituloReserva: "Reserva tu Tour", fechaTour:"Fecha del Tour:", paisVives:"País donde vives:",
    metodoPago:"Método de pago:", pagoEfectivo:"Efectivo", pagoTarjeta:"Tarjeta",
    pagoOnline:"Pago en línea", horarioTour:"Horario de Tour:", adultosLabel:"Adultos (19‑64 años)",
    ninosLabel:"Niños (9‑17 años)", infantesLabel:"Infantes (0‑8 años)", mayoresLabel:"Adultos Mayores (65+)",
    aceptoTerminos:"Acepto términos y condiciones", botonReservar:"Reservar Tiquetes", contactanos:"Contáctanos",
    tituloPago: "RESERVACIÓN #00000", datosReserva: "Tus reservas:", numTarjeta: "Número de Tarjeta",
    direccion: "Dirección", cvc: "CVC (Código de seguridad)", expDate: "Fecha de expiración",
    btnPay: "Pagar $0 USD »"
  },
  en: {
    inicio: "Home", galeria: "Gallery", reserva: "Booking", ayuda: "Help", reportes: "Reports",
    tituloReserva: "Book Your Tour", fechaTour:"Tour Date:", paisVives:"Country you live in:",
    metodoPago:"Payment Method:", pagoEfectivo:"Cash", pagoTarjeta:"Card", pagoOnline:"Online",
    horarioTour:"Tour Time:", adultosLabel:"Adults (19‑64 yrs)", ninosLabel:"Children (9‑17 yrs)",
    infantesLabel:"Infants (0‑8 yrs)", mayoresLabel:"Seniors (65+ yrs)", aceptoTerminos:"I agree with terms and conditions",
    botonReservar:"Reserve Tickets", contactanos:"Contact Us",
    tituloPago: "RESERVATION #00000", datosReserva: "Your reservation:", numTarjeta: "Card Number",
    direccion: "Address", cvc: "CVC (Secure Code)", expDate: "Expiration Date",
    btnPay: "Pay $0 USD »"
  }
};

function cambiarIdioma(id) {
  console.log(`Cambiando idioma a: ${id}`);
  localStorage.setItem("idioma", id);
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    console.log(`Traduciendo clave: ${key} a: ${traducciones[id][key]}`);
    el.textContent = traducciones[id][key];
  });
  // La línea de llenarPaises() ha sido eliminada de aquí
}
