const translations = {
  en: {
    inicio: "Home",
    galeria: "Gallery",
    reserva: "Booking",
    ayuda: "Help",
    titulo: "See Different Species of Butterflies",
    horario: "Opening hours: <strong>8:00 a.m. to 4:00 p.m.</strong>",
    descripcion1: "Our tropical butterfly garden is one of the newest attractions in the region, offering a unique experience in contact with tropical nature.",
    descripcion2: "This small yet innovative garden is home to about 20 local butterfly species, including the majestic Blue Morpho and the iconic Owl Butterfly.",
    descripcion3: "The tour includes shaded areas where cool-loving species live and sunny areas for observing butterflies that enjoy light.",
    descripcion4: "We recommend visiting in the morning when butterflies are most active thanks to the warmth of the sun.",
    descripcion5: "Live an unforgettable experience surrounded by Costa Rica’s most beautiful butterflies.",
    galeriaTitulo: "PHOTO GALLERY",
    verGaleria: "View Gallery"
  },
  es: {
    inicio: "Inicio",
    galeria: "Galería",
    reserva: "Reserva",
    ayuda: "Ayuda",
    titulo: "Observa Mariposas de Distintas Especies",
    horario: "Horario de visita: <strong>8:00 a.m. a 4:00 p.m.</strong>",
    descripcion1: "Nuestro mariposario tropical es una de las atracciones más recientes en la región, ofreciendo una experiencia única en contacto con la naturaleza tropical.",
    descripcion2: "Este pequeño pero innovador jardín alberga cerca de 20 especies locales de mariposas, entre ellas la majestuosa Morfo azul y la emblemática mariposa ojo de búho.",
    descripcion3: "El recorrido incluye zonas de sombra donde habitan especies que prefieren ambientes frescos, y sectores iluminados por el sol, ideales para observar mariposas activas que buscan la luz.",
    descripcion4: "Recomendamos realizar la visita por la mañana, cuando la actividad de las mariposas es más intensa gracias al calor matutino.",
    descripcion5: "Vive una experiencia inolvidable rodeado de las especies más hermosas de Costa Rica.",
    galeriaTitulo: "GALERÍA FOTOGRÁFICA",
    verGaleria: "Ver Galería"
  }
};

document.getElementById("languageSelector").addEventListener("change", function () {
  const lang = this.value;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });
});
