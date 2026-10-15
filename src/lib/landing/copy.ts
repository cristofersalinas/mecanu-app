import { DEFAULT_LOCALE, type Locale } from "./locales";

export type LandingMapCityId = "madrid" | "barcelona";

export type LandingCopy = {
  meta: { title: string; description: string };
  nav: {
    homeAria: string;
    mainAria: string;
    mobileAria: string;
    openMenu: string;
    closeMenu: string;
    inicio: string;
    solucion: string;
    recursos: string;
    productos: string;
    cta: string;
    langLabel: string;
    como: string;
    cobertura: string;
    preguntas: string;
  };
  productos: { label: string; href: string }[];
  hero: {
    kicker: string;
    kickerBrand: string;
    headline: string;
    subtext: string;
    primary: string;
    secondary: string;
    /** Alt de la foto del hero. */
    photoAlt: string;
  };
  logosAria: string;
  logosLabel: string;
  map: {
    /** Plantilla, no función: `{city}` lo sustituye el cliente. El copy cruza
     *  la frontera servidor→cliente y una función no es serializable. */
    heading: string;
    subtext: string;
    sectionAria: string;
    citySwitchAria: string;
    ciudades: Record<LandingMapCityId, string>;
    details: string;
    /** CTA del formulario corto en la ficha del mapa. */
    talk: string;
    comingSoon: string;
    postular: {
      nombrePlaceholder: string;
      telefonoPlaceholder: string;
      tallerPlaceholder: string;
      privacidadLabel: string;
      privacidadError: string;
      gracias: string;
      error: string;
      enviando: string;
    };
    resetAria: string;
    zoomInAria: string;
    zoomOutAria: string;
  };
  faq: {
    eyebrow: string;
    heading: string;
    more: string;
    less: string;
    links: { href: string; label: string }[];
  };
  statsAria: string;
  stats?: { numero: string; valor: string; etiqueta: string; texto: string; enlace?: string }[];
  specsAria: string;
  specs: {
    eyebrow: string;
    heading: string;
    items: { valor: string; etiqueta: string }[];
  };
  faq: {
    eyebrow: string;
    heading: string;
  };
  hiw: {
    eyebrow: string;
    heading: string;
    cta: string;
    subtext: string;
    pasos: { numero: string; titulo: string; texto: string }[];
  };
  hiring: { heading: string; subtext: string; cta: string; photoAlt: string };
  news: {
    eyebrow: string;
    heading: string;
    cta: string;
    read: string;
    items: { categoria: string; titulo: string; icono: string; visual: "articleWorkshop" | "articleWindow" | "articleFleet" }[];
  };
  close: {
    eyebrow: string;
    heading: string;
    subtext: string;
    primary: string;
    secondary: string;
    featuresLabel: string;
    beneficios: { icono: string; texto: string }[];
  };
  footer: {
    tagline: string;
    contacto: string;
    producto: string;
    solucion: string;
    como: string;
    cobertura: string;
    queEsMecanu: string;
    recursos: string;
    ideas: string;
    paraTalleres: string;
    trasladosMadrid: string;
    trasladosBarcelona: string;
    hablar: string;
    arriba: string;
    copyright: string;
    cta: string;
    langLabel: string;
    privacidad: string;
    avisoLegal: string;
    cookies: string;
    terminos: string;
    accesibilidad: string;
    cumplimientoTitulo: string;
    cumplimientoTexto: string;
    comparativas: string;
    comparativaLinks: { href: string; label: string }[];
  };
  errors: {
    notFound: { kicker: string; headline: string; subtext: string; cta: string };
    server: { kicker: string; headline: string; subtext: string; cta: string; retry: string };
  };
  consent: {
    titulo: string;
    cuerpo: string;
    aceptar: string;
    rechazar: string;
    gestionar: string;
    configurar: string;
    guardar: string;
    esencialesTitulo: string;
    esencialesCuerpo: string;
    analiticaTitulo: string;
    analiticaCuerpo: string;
    publicidadTitulo: string;
    publicidadCuerpo: string;
    coreEtiqueta: string;
    siempreActivas: string;
  };
  contacto: {
    eyebrow: string;
    heading: string;
    subtext: string;
    aceptar: string;
    enviar: string;
    anterior: string;
    privacidadLabel: string;
    privacidadError: string;
    gracias: { heading: string; subtext: string };
    pasos: {
      nombre: { pregunta: string };
      apellido: { pregunta: string };
      email: { pregunta: string; aviso: string };
      telefono: { pregunta: string; selectorPais: string };
      objetivo: {
        pregunta: string;
        opciones: [string, string];
      };
      uso: {
        pregunta: string;
        aviso: string;
        opciones: [string, string, string, string, string, string, string, string, string];
      };
      ciudad: {
        pregunta: string;
        opciones: [string, string, string];
      };
      volumen: {
        pregunta: string;
        aviso: string;
        opciones: [string, string, string, string, string];
      };
      negocio: { pregunta: string; placeholder: string };
      canal: {
        pregunta: string;
        opciones: [string, string, string, string, string, string, string, string, string, string, string];
      };
    };
  };
};

const es: LandingCopy = {
  meta: {
    title: "Mecanu | Logística de coches para talleres mecánicos",
    description:
      "Plataforma logística para talleres. Recoge y entrega con la flota del taller o la de Mecanu. El seguro de traslado se añade si lo quieres.",
  },
  nav: {
    homeAria: "Mecanu, inicio",
    mainAria: "Navegación principal",
    mobileAria: "Navegación móvil",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    inicio: "Inicio",
    solucion: "Solución",
    recursos: "Recursos",
    productos: "Productos",
    cta: "Hablar con Mecanu",
    langLabel: "Idioma",
    como: "Cómo funciona",
    cobertura: "Cobertura",
    preguntas: "Preguntas",
  },
  productos: [
    { label: "Logística", href: "#solucion" },
    { label: "Flota propia", href: "#solucion" },
    { label: "Flota externa", href: "#solucion" },
    { label: "Seguro de traslado", href: "#cobertura" },
    { label: "Seguimiento", href: "#solucion" },
    { label: "Frente a la grúa", href: "#solucion" },
  ],
  hero: {
    kicker: "",
    kickerBrand: "Logística para talleres mecánicos",
    headline: "El cliente no tiene que ir al taller.",
    subtext:
      "Recoges y entregas con tus conductores o con los de Mecanu. Más barato que una grúa, con el coche georreferenciado en tiempo real y control de cada entrega.",
    primary: "Hablar con nosotros",
    secondary: "Ver cómo funciona",
    photoAlt: "Volvo blanco visto desde arriba en una calle urbana",
  },
  logosAria: "Aseguradoras",
  logosLabel: "Cobertura con",
  map: {
    heading: "Nuestros clientes alrededor de Madrid y Barcelona.",
    subtext: "Desde una sucursal, atiende sin fricción en toda la ciudad.",
    sectionAria: "Mapa de talleres en {city}",
    citySwitchAria: "Ciudad del mapa",
    ciudades: {
      madrid: "Madrid",
      barcelona: "Barcelona",
    },
    details: "Detalles",
    talk: "Postular taller",
    comingSoon: "Recogida y entrega en el área metropolitana.",
    postular: {
      nombrePlaceholder: "Tu nombre",
      telefonoPlaceholder: "Teléfono",
      tallerPlaceholder: "Nombre del taller",
      privacidadLabel: "Acepto la política de privacidad",
      privacidadError: "Marca la casilla de privacidad para enviar.",
      gracias: "Recibido. Te contactamos en menos de 24 h.",
      error: "Algo ha ido mal. Inténtalo de nuevo.",
      enviando: "Enviando…",
    },
    resetAria: "Volver a la vista de ciudad",
    zoomInAria: "Acercar el mapa",
    zoomOutAria: "Alejar el mapa",
  },
  statsAria: "Resultados de Mecanu",
  specsAria: "Rendimiento y especificaciones de Mecanu",
  specs: {
    eyebrow: "Rendimiento",
    heading: "Lo que cambia en tu taller",
    items: [
      {
        valor: "7 días",
        etiqueta: "Cuadrando con quien no puede ir",
      },
      {
        valor: "4 días",
        etiqueta: "El coche listo ocupando plaza",
      },
      {
        valor: "1 grúa",
        etiqueta: "Un camión por coche. Nosotros, una flota",
      },
      {
        valor: "En vivo",
        etiqueta: "Ves dónde va cada conductor",
      },
      {
        valor: "Seguro",
        etiqueta: "De traslado, si el taller lo añade",
      },
      {
        valor: "Predicción",
        etiqueta: "El siguiente servicio, desde el check-in",
      },
    ],
  },
  faq: {
    eyebrow: "Preguntas frecuentes",
    heading: "Preguntas frecuentes",
  },
  stats: [
    {
      numero: "01",
      valor: "7 días",
      etiqueta: "En coordinar la entrega",
      texto:
        "Quien no puede ir al taller —por trabajo o por lo que sea— alarga el cuadre hasta una semana. Recoges y entregas en una ventana de una hora.",
      enlace: "Ver cómo funciona",
    },
    {
      numero: "02",
      valor: "4 días",
      etiqueta: "Con el coche listo parado",
      texto:
        "El trabajo está hecho y el coche sigue en la plaza. Lo devuelves y liberas el sitio.",
      enlace: "Ver cómo funciona",
    },
    {
      numero: "03",
      valor: "Flota",
      etiqueta: "No un camión por coche",
      texto:
        "Una grúa mueve un coche cada vez. Tus conductores o los de Mecanu llevan el coche del cliente, con más hueco y más barato.",
    },
  ],
  hiw: {
    eyebrow: "Operación",
    heading: "Cómo funciona",
    cta: "Hablar con Mecanu →",
    subtext:
      "De la llamada del cliente a una entrega que ves en el mapa.",
    pasos: [
      {
        numero: "01",
        titulo: "El taller abre el traslado",
        texto:
          "Con tus conductores o con los de Mecanu. Dirección y ventana de una hora. El seguro de traslado, solo si lo añades.",
      },
      {
        numero: "02",
        titulo: "Ves dónde va",
        texto:
          "Cada conductor lleva la app. El coche se sigue en tiempo real, georreferenciado, y queda la rutina de entregas a domicilio.",
      },
      {
        numero: "03",
        titulo: "El taller sigue",
        texto:
          "La plaza queda libre. La inteligencia del check-in predice el siguiente servicio y el cliente vuelve.",
      },
    ],
  },
  hiring: {
    heading: "¿El coche listo sigue en la plaza?",
    subtext:
      "Hasta cuatro días esperando a quien no puede pasar. Lo devuelves y el taller sigue.",
    cta: "Pide apoyo a Mecanu",
    photoAlt: "Coche clásico partido en collage vintage.",
  },
  news: {
    eyebrow: "Ideas para el taller",
    heading: "Ideas para modernizar tu taller",
    cta: "Ver todas →",
    read: "Leer →",
    items: [
      {
        categoria: "Experiencia",
        titulo: "El cliente se acostumbró al delivery y los talleres no se quedan atrás",
        icono: "schedule",
        visual: "articleWindow",
      },
      {
        categoria: "Guía",
        titulo: "Cómo liberar una plaza cuando el coche ya está terminado",
        icono: "garage",
        visual: "articleWorkshop",
      },
      {
        categoria: "Mecanu",
        titulo: "Flota del taller o flota de Mecanu, en la misma plataforma",
        icono: "local_shipping",
        visual: "articleFleet",
      },
    ],
  },
  close: {
    eyebrow: "Contacto",
    heading: "Ofrece la recogida sin miedo.",
    subtext: "Dinos cómo mueves los coches hoy. Te llamamos y lo vemos con un traslado.",
    primary: "Hablar con Mecanu",
    secondary: "Ver cómo funciona",
    featuresLabel: "Beneficios",
    beneficios: [
      {
        icono: "door_front",
        texto: "Se acabó cuadrar hasta 7 días con quien no puede ir.",
      },
      {
        icono: "home_work",
        texto: "El coche listo no se queda hasta 4 días en la plaza.",
      },
      {
        icono: "local_shipping",
        texto: "Más barato y con más hueco que una grúa: una flota, no un camión por coche.",
      },
      {
        icono: "verified_user",
        texto: "Ves dónde va cada conductor. El seguro de traslado, si lo quieres.",
      },
      {
        icono: "my_location",
        texto: "Seguimiento en tiempo real, georreferenciado, desde la app.",
      },
      {
        icono: "chat",
        texto: "Inteligencia del check-in: predice el siguiente servicio.",
      },
    ],
  },
  faq: {
    eyebrow: "MECANU / PREGUNTAS FRECUENTES",
    heading: "Preguntas frecuentes",
    more: "Ver más",
    less: "Ver menos",
    links: [
      { href: "/madrid", label: "Mecanu en Madrid" },
      { href: "/barcelona", label: "Mecanu en Barcelona" },
      { href: "/para-talleres", label: "Cómo funciona para tu taller" },
      { href: "/alternativa-grua", label: "Comparado con una grúa" },
      { href: "/alternativa-mecanico-a-domicilio", label: "Comparado con un mecánico a domicilio" },
      { href: "/itv-para-talleres", label: "ITV para talleres" },
      { href: "/software-taller", label: "Software de taller" },
      { href: "/mantenimiento-marcas", label: "Mantenimiento por marca" },
      { href: "/cliente-no-recoge-coche", label: "Cliente no recoge el coche" },
      { href: "/blog", label: "Blog de operaciones" },
    ],
  },
  footer: {
    tagline: "Logística con control. El coche a la vista. El taller crece.",
    contacto: "Contacto",
    producto: "Producto",
    solucion: "La solución",
    como: "Cómo funciona",
    cobertura: "Cobertura",
    queEsMecanu: "Qué es Mecanu",
    recursos: "Recursos",
    ideas: "Ideas para el taller",
    paraTalleres: "Para talleres",
    trasladosMadrid: "Traslados en Madrid",
    trasladosBarcelona: "Traslados en Barcelona",
    hablar: "Hablar con Mecanu",
    arriba: "Volver arriba",
    copyright: "© 2026 Mecanu",
    cta: "Hablar con Mecanu →",
    langLabel: "Idioma",
    privacidad: "Privacidad",
    avisoLegal: "Aviso legal",
    cookies: "Cookies",
    terminos: "Términos",
    accesibilidad: "Accesibilidad",
    cumplimientoTitulo: "Cumplimiento UE",
    cumplimientoTexto: "RGPD · ePrivacy · LSSI-CE",
    comparativas: "Comparativas",
    comparativaLinks: [
      { href: "/alternativa-grua", label: "Grúa o conductor" },
      { href: "/alternativa-mecanico-a-domicilio", label: "Mecánico a domicilio" },
      { href: "/taller-oficial-o-multimarca", label: "Oficial o multimarca" },
      { href: "/capacidad-taller", label: "Capacidad del taller" },
      { href: "/itv-para-talleres", label: "ITV para talleres" },
      { href: "/software-taller", label: "Software de taller" },
      { href: "/mantenimiento-marcas", label: "Mantenimiento por marca" },
      { href: "/cliente-no-recoge-coche", label: "Cliente no recoge el coche" },
    ],
  },
  errors: {
    notFound: {
      kicker: "ERROR 404",
      headline: "Los coches no se detienen. Esta página, sí.",
      subtext: "Hemos buscado esta ruta en el recinto. No está. Ni en el patio de espera.",
      cta: "Volver a la portada",
    },
    server: {
      kicker: "ERROR 500",
      headline: "El taller sigue abierto. El servidor, de momento, no.",
      subtext: "Hemos dejado el vehículo en zona segura. Puedes reintentar o volver al inicio.",
      cta: "Volver a la portada",
      retry: "Reintentar",
    },
  },
  consent: {
    titulo: "Cookies en Mecanu",
    cuerpo:
      "Las esenciales van siempre (idioma, seguridad). Si nos dejas, medimos páginas y dispositivo — si entras con iPhone, qué lees — al estilo de Google Analytics. La publicidad (Google Ads y Meta) es aparte. Puedes denegar y la web funciona igual.",
    aceptar: "Aceptar todas",
    rechazar: "Solo esenciales",
    gestionar: "Política",
    configurar: "Configurar",
    guardar: "Guardar selección",
    esencialesTitulo: "Esenciales",
    esencialesCuerpo: "Idioma, seguridad y recordar tu elección. Sin ellas la web no funciona.",
    analiticaTitulo: "Analítica",
    analiticaCuerpo:
      "Páginas que visitas, dispositivo (iPhone, Android, ordenador) e idioma. Google Analytics 4, Clarity y Vercel. Es la medición del negocio.",
    publicidadTitulo: "Publicidad",
    publicidadCuerpo:
      "Google Ads y Meta (Facebook/Instagram). Eventos PageView, ViewContent y Lead para saber si una campaña sirve. Apagado = cero píxeles de anuncios.",
    coreEtiqueta: "Medición",
    siempreActivas: "Siempre activas",
  },
  contacto: {
    eyebrow: "Empieza aquí",
    heading: "Cuatro datos y te llamamos.",
    subtext: "Nombre, teléfono, ciudad y cuántos coches mueves.",
    aceptar: "Aceptar",
    enviar: "Enviar",
    anterior: "Anterior",
    privacidadLabel: "He leído y acepto la política de privacidad.",
    privacidadError: "Marca la casilla de privacidad para enviar.",
    gracias: {
      heading: "Recibido.",
      subtext: "Te contactaremos en menos de 24 horas.",
    },
    pasos: {
      nombre: { pregunta: "Empecemos. ¿Cuál es tu **nombre**?" },
      apellido: { pregunta: "Mucho gusto, {nombre}. ¿Cuál es tu **apellido**?" },
      email: {
        pregunta: "¿Cuál es tu **correo electrónico**?",
        aviso:
          "Al enviar este formulario, aceptas que Mecanu se ponga en contacto contigo para hablar de tu taller.",
      },
      telefono: {
        pregunta: "¿Cuál es tu **número de teléfono**?",
        selectorPais: "País",
      },
      objetivo: {
        pregunta: "¿Qué quieres **hacer**?",
        opciones: ["Usar a mis conductores", "Usar la flota de Mecanu"],
      },

      uso: {
        pregunta: "¿Qué **problema quieres resolver** con Mecanu?",
        aviso: "Selecciona hasta 3 opciones.",
        opciones: [
          "Recoger coches en casa del cliente",
          "Entregar coches cuando están listos",
          "Ordenar los traslados de mis conductores",
          "Cubrir picos con la flota externa",
          "Seguro de traslado",
          "Registrar el coche en cada viaje",
          "Detectar el siguiente servicio",
          "Avisar al cliente para que vuelva",
          "Ver el estado de cada traslado",
        ],
      },
      ciudad: {
        pregunta: "¿En qué **ciudad** está tu taller?",
        opciones: ["Madrid", "Barcelona", "Otra"],
      },
      volumen: {
        pregunta: "¿Cuántos **coches atiendes** normalmente al mes?",
        aviso: "Cuenta los que entran al taller, no solo los traslados a domicilio.",
        opciones: [
          "Menos de 20 (micro)",
          "20 – 60 (pequeño)",
          "60 – 150 (mediano)",
          "150 – 400 (grande)",
          "Más de 400 (flota / cadena)",
        ],
      },
      negocio: {
        pregunta: "¿Cuál es el **nombre de tu taller**?",
        placeholder: "Escribe el nombre aquí…",
      },
      canal: {
        pregunta: "¿Cómo **nos conociste**?",
        opciones: [
          "Google / búsqueda online",
          "LinkedIn",
          "Instagram / redes sociales",
          "Radio La Clave",
          "Startupslatam.com",
          "Tech Barcelona",
          "Vendedor en terreno",
          "Referido de otro taller",
          "Email o newsletter",
          "Evento o feria",
          "Otro",
        ],
      },
    },
  },
};

const ca: LandingCopy = {
  meta: {
    title: "Mecanu | Recollida i lliurament de cotxes per a tallers mecànics",
    description:
      "Mecanu recull i torna el cotxe del client per a tallers a Madrid i Barcelona. Franja d'1 hora, conductor verificat, assegurança de responsabilitat civil.",
  },
  nav: {
    homeAria: "Mecanu, inici",
    mainAria: "Navegació principal",
    mobileAria: "Navegació mòbil",
    openMenu: "Obrir menú",
    closeMenu: "Tancar menú",
    inicio: "Inici",
    solucion: "Solució",
    recursos: "Recursos",
    productos: "Productes",
    cta: "Parlar amb Mecanu",
    langLabel: "Idioma",
    como: "Com funciona",
    cobertura: "Cobertura",
    preguntas: "Preguntes",
  },
  productos: [
    { label: "Logística", href: "#solucion" },
    { label: "Flota pròpia", href: "#solucion" },
    { label: "Flota externa", href: "#solucion" },
    { label: "Assegurança de trasllat", href: "#cobertura" },
    { label: "Check-in", href: "#solucion" },
    { label: "Clients que tornen", href: "#contacto" },
  ],
  hero: {
    kicker: "",
    kickerBrand: "Logística per a tallers mecànics",
    headline: "Trasllada cotxes amb la teva flota o amb la nostra.",
    subtext:
      "Plataforma de logística per a tallers. Assegurança de trasllat a cada viatge, i un check-in visual que converteix cada cotxe en el següent servei.",
    primary: "Parlar amb nosaltres",
    secondary: "Veure com funciona",
    photoAlt: "Volvo blanc vist des de dalt en un carrer urbà",
  },
  logosAria: "Asseguradores",
  logosLabel: "Cobertura amb",
  map: {
    heading: "Les nostres ubicacions",
    subtext:
      "Des d'una sucursal, atens sense fricció a tota la ciutat.\nEls nostres clients al voltant de Madrid i Barcelona.",
    sectionAria: "Mapa de tallers a {city}",
    citySwitchAria: "Ciutat del mapa",
    ciudades: {
      madrid: "Madrid",
      barcelona: "Barcelona",
    },
    details: "Detalls",
    talk: "Postular taller",
    comingSoon: "Recollida i lliurament a l'àrea metropolitana.",
    postular: {
      nombrePlaceholder: "El teu nom",
      telefonoPlaceholder: "Telèfon",
      tallerPlaceholder: "Nom del taller",
      privacidadLabel: "Accepto la política de privacitat",
      privacidadError: "Marca la casella de privacitat per enviar.",
      gracias: "Rebut. Et contactem en menys de 24 h.",
      error: "Alguna cosa ha fallat. Torna-ho a provar.",
      enviando: "Enviant…",
    },
    resetAria: "Tornar a la vista de ciutat",
    zoomInAria: "Apropar el mapa",
    zoomOutAria: "Allunyar el mapa",
  },
  statsAria: "Resultats de Mecanu",
  specsAria: "Rendiment i especificacions de Mecanu",
  specs: {
    eyebrow: "Rendiment",
    heading: "Logística i el següent servei",
    items: [
      {
        valor: "2 flotes",
        etiqueta: "La del taller o la de Mecanu",
      },
      {
        valor: "1 hora",
        etiqueta: "Franja de recollida i lliurament",
      },
      {
        valor: "Assegurança",
        etiqueta: "De trasllat, a cada viatge",
      },
      {
        valor: "Check-in",
        etiqueta: "Foto, estat i registre",
      },
      {
        valor: "Check-out",
        etiqueta: "El mateix control en lliurar",
      },
      {
        valor: "Tornada",
        etiqueta: "Avisos i següent servei",
      },
    ],
  },
  faq: {
    eyebrow: "Preguntes freqüents",
    heading: "Preguntes freqüents",
  },
  stats: [
    {
      numero: "01",
      valor: "Pròpia",
      etiqueta: "Flota del taller",
      texto:
        "Els teus conductors fan servir la plataforma logística: rutes, franja i check-in. L'assegurança de trasllat és opcional.",
      enlace: "Veure com funciona",
    },
    {
      numero: "02",
      valor: "Externa",
      etiqueta: "Flota de Mecanu",
      texto:
        "Quan no arribes, el trasllat el fa un conductor de Mecanu. L'assegurança de trasllat, només si l'afegeixes.",
      enlace: "Veure com funciona",
    },
    {
      numero: "03",
      valor: "Check-in",
      etiqueta: "El client torna",
      texto:
        "Foto, estat del component i registre. D'aquí surten l'avís, el següent servei i la tornada al taller.",
    },
  ],
  hiw: {
    eyebrow: "Operació",
    heading: "Com funciona",
    cta: "Parlar amb Mecanu →",
    subtext:
      "Tres passos per anar de la trucada del client a un lliurament registrat, sense perdre el fil del trasllat.",
    pasos: [
      {
        numero: "01",
        titulo: "Indica on és el cotxe",
        texto:
          "Tria client, taller, data i franja. El trasllat queda registrat des del primer moment.",
      },
      {
        numero: "02",
        titulo: "Mecanu coordina la ruta",
        texto:
          "Els conductors gestionen tot el trasllat, des de la inspecció fins al lliurament, amb geolocalització en temps real.",
      },
      {
        numero: "03",
        titulo: "Lliura i torna a produir",
        texto:
          "El client rep avisos des de la comoditat de casa seva o de la feina, i el taller queda lliure per seguir operant.",
      },
    ],
  },
  hiring: {
    heading: "El teu taller ple de cotxes a punt?",
    subtext:
      "Creix sense ampliar la nau: despacha a l'instant els cotxes a punt i lliura'ls a la porta, amb una experiència que es nota.",
    cta: "Demana suport a Mecanu",
    photoAlt: "Cotxe clàssic partit en collage vintage.",
  },
  news: {
    eyebrow: "Idees per al taller",
    heading: "Idees per modernitzar el teu taller",
    cta: "Veure-les totes →",
    read: "Llegir →",
    items: [
      {
        categoria: "Experiència",
        titulo: "El client s'ha acostumat al delivery i els tallers no es queden enrere",
        icono: "schedule",
        visual: "articleWindow",
      },
      {
        categoria: "Guia",
        titulo: "Com alliberar una plaça quan el cotxe ja està acabat",
        icono: "garage",
        visual: "articleWorkshop",
      },
      {
        categoria: "Mecanu",
        titulo: "Flota externa per absorbir pics sense perdre el control",
        icono: "local_shipping",
        visual: "articleFleet",
      },
    ],
  },
  close: {
    eyebrow: "Contacte",
    heading: "El client no ha d'anar al taller.",
    subtext: "Digues on és el taller. Et truquem i ho veiem amb un trasllat real.",
    primary: "Parlar amb Mecanu",
    secondary: "Veure com funciona",
    featuresLabel: "Beneficis",
    beneficios: [
      {
        icono: "door_front",
        texto: "S'ha acabat esperar 7 dies: el cotxe es recull a la porta.",
      },
      {
        icono: "home_work",
        texto: "El client es queda a casa. Tu recuperes plaça.",
      },
      {
        icono: "savings",
        texto: "Més barat i més disponible que una grua.",
      },
      {
        icono: "verified_user",
        texto: "Flota externa amb assegurança i RC flexible, per al taller o per trasllat.",
      },
      {
        icono: "photo_camera",
        texto: "Check-in visual: fins a 20 punts.",
      },
      {
        icono: "chat",
        texto: "Automatitza l'atenció i els avisos de pròxims serveis.",
      },
    ],
  },
  faq: {
    eyebrow: "MECANU / PREGUNTES FREQÜENTS",
    heading: "Preguntes freqüents",
    more: "Veure més",
    less: "Veure menys",
    links: [
      { href: "/madrid", label: "Mecanu a Madrid" },
      { href: "/barcelona", label: "Mecanu a Barcelona" },
      { href: "/para-talleres", label: "Com funciona per al teu taller" },
      { href: "/alternativa-grua", label: "Comparat amb una grua" },
      { href: "/alternativa-mecanico-a-domicilio", label: "Comparat amb un mecànic a domicili" },
      { href: "/itv-para-talleres", label: "ITV per a tallers" },
      { href: "/software-taller", label: "Programari de taller" },
      { href: "/mantenimiento-marcas", label: "Manteniment per marca" },
      { href: "/cliente-no-recoge-coche", label: "El client no recull el cotxe" },
      { href: "/blog", label: "Blog d'operacions" },
    ],
  },
  footer: {
    tagline: "Logística B2B per a tallers que volen seguir reparant.",
    contacto: "Contacte",
    producto: "Producte",
    solucion: "La solució",
    como: "Com funciona",
    cobertura: "Cobertura",
    queEsMecanu: "Què és Mecanu",
    recursos: "Recursos",
    ideas: "Idees per al taller",
    paraTalleres: "Per a tallers",
    trasladosMadrid: "Trasllats a Madrid",
    trasladosBarcelona: "Trasllats a Barcelona",
    hablar: "Parlar amb Mecanu",
    arriba: "Tornar a dalt",
    copyright: "© 2026 Mecanu",
    cta: "Parlar amb Mecanu →",
    langLabel: "Idioma",
    privacidad: "Privacitat",
    avisoLegal: "Avís legal",
    cookies: "Galetes",
    terminos: "Termes",
    accesibilidad: "Accessibilitat",
    cumplimientoTitulo: "Compliment UE",
    cumplimientoTexto: "RGPD · ePrivacy · LSSI-CE",
    comparativas: "Comparatives",
    comparativaLinks: [
      { href: "/alternativa-grua", label: "Grua o conductor" },
      { href: "/alternativa-mecanico-a-domicilio", label: "Mecànic a domicili" },
      { href: "/taller-oficial-o-multimarca", label: "Oficial o multimarca" },
      { href: "/capacidad-taller", label: "Capacitat del taller" },
      { href: "/itv-para-talleres", label: "ITV per a tallers" },
      { href: "/software-taller", label: "Programari de taller" },
      { href: "/mantenimiento-marcas", label: "Manteniment per marca" },
      { href: "/cliente-no-recoge-coche", label: "El client no recull el cotxe" },
    ],
  },
  errors: {
    notFound: {
      kicker: "ERROR 404",
      headline: "Els cotxes no s'aturen. Aquesta pàgina, sí.",
      subtext: "Hem buscat aquesta ruta al recinte. No hi és. Ni al pati d'espera.",
      cta: "Tornar a la portada",
    },
    server: {
      kicker: "ERROR 500",
      headline: "El taller continua obert. El servidor, de moment, no.",
      subtext: "Hem deixat el vehicle en zona segura. Pots tornar-ho a provar o tornar a l'inici.",
      cta: "Tornar a la portada",
      retry: "Tornar-ho a provar",
    },
  },
  consent: {
    titulo: "Galetes a Mecanu",
    cuerpo:
      "Les essencials van sempre (idioma, seguretat). Si ens ho deixes, mesurem pàgines i dispositiu — si entres amb iPhone, què llegeixes — a l'estil de Google Analytics. La publicitat (Google Ads i Meta) va a part. Pots denegar i el web funciona igual.",
    aceptar: "Acceptar-les totes",
    rechazar: "Només essencials",
    gestionar: "Política",
    configurar: "Configurar",
    guardar: "Desar la selecció",
    esencialesTitulo: "Essencials",
    esencialesCuerpo: "Idioma, seguretat i recordar la teva tria. Sense elles el web no funciona.",
    analiticaTitulo: "Analítica",
    analiticaCuerpo:
      "Pàgines que visites, dispositiu (iPhone, Android, ordinador) i idioma. Google Analytics 4, Clarity i Vercel. És la mesura del negoci.",
    publicidadTitulo: "Publicitat",
    publicidadCuerpo:
      "Google Ads i Meta (Facebook/Instagram). Esdeveniments PageView, ViewContent i Lead per saber si una campanya serveix. Apagat = zero píxels d'anuncis.",
    coreEtiqueta: "Mesura",
    siempreActivas: "Sempre actives",
  },
  contacto: {
    eyebrow: "Comença aquí",
    heading: "Quatre dades i et truquem.",
    subtext: "Nom, telèfon, ciutat i quants cotxes mous.",
    aceptar: "Acceptar",
    enviar: "Enviar",
    anterior: "Anterior",
    privacidadLabel: "He llegit i accepto la política de privacitat.",
    privacidadError: "Marca la casella de privacitat per enviar.",
    gracias: {
      heading: "Rebut.",
      subtext: "Et contactarem en menys de 24 hores.",
    },
    pasos: {
      nombre: { pregunta: "Comencem. Com et **dius**?" },
      apellido: { pregunta: "Molt de gust, {nombre}. Quin és el teu **cognom**?" },
      email: {
        pregunta: "Quin és el teu **correu electrònic**?",
        aviso:
          "En enviar aquest formulari, acceptes que Mecanu es posi en contacte amb tu per parlar del teu taller.",
      },
      telefono: {
        pregunta: "Quin és el teu **número de telèfon**?",
        selectorPais: "País",
      },
      objetivo: {
        pregunta: "Què vols **fer**?",
        opciones: ["Digitalitzar el meu taller actual", "Obrir un taller nou"],
      },

      uso: {
        pregunta: "Quin **problema vols resoldre** amb Mecanu?",
        aviso: "Selecciona fins a 3 opcions.",
        opciones: [
          "Despatxar cotxes a domicili",
          "Recollir cotxes del client",
          "Oferir millor experiència al client",
          "Contractar conductors externs",
          "Assegurança de responsabilitat civil",
          "Automatitzar l'atenció al client",
          "Tenir pàgina web per al taller",
          "Oferir crèdit als meus clients",
          "Fidelitzar clients i repetir visites",
        ],
      },
      ciudad: {
        pregunta: "En quina **ciutat** és el teu taller?",
        opciones: ["Madrid", "Barcelona", "Altra"],
      },
      volumen: {
        pregunta: "Quants **cotxes atens** normalment al mes?",
        aviso: "Compta els que entren al taller, no només els trasllats a domicili.",
        opciones: [
          "Menys de 20 (micro)",
          "20 – 60 (petit)",
          "60 – 150 (mitjà)",
          "150 – 400 (gran)",
          "Més de 400 (flota / cadena)",
        ],
      },
      negocio: {
        pregunta: "Quin és el **nom del teu taller**?",
        placeholder: "Escriu el nom aquí…",
      },
      canal: {
        pregunta: "Com ens has **conegut**?",
        opciones: [
          "Google / cerca en línia",
          "LinkedIn",
          "Instagram / xarxes socials",
          "Radio La Clave",
          "Startupslatam.com",
          "Tech Barcelona",
          "Venedor en terreny",
          "Referit d'un altre taller",
          "Email o newsletter",
          "Esdeveniment o fira",
          "Altre",
        ],
      },
    },
  },
};

const en: LandingCopy = {
  meta: {
    title: "Mecanu | Car Collection & Delivery Service for Auto Repair Shops",
    description:
      "Mecanu collects and returns the customer's car for shops in Madrid and Barcelona. A 1-hour window, a verified driver and liability cover.",
  },
  nav: {
    homeAria: "Mecanu, home",
    mainAria: "Main navigation",
    mobileAria: "Mobile navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    inicio: "Home",
    solucion: "Solution",
    recursos: "Resources",
    productos: "Products",
    cta: "Talk to Mecanu",
    langLabel: "Language",
    como: "How it works",
    cobertura: "Coverage",
    preguntas: "Questions",
  },
  productos: [
    { label: "Logistics", href: "#solucion" },
    { label: "Own fleet", href: "#solucion" },
    { label: "External fleet", href: "#solucion" },
    { label: "Transit cover", href: "#cobertura" },
    { label: "Check-in", href: "#solucion" },
    { label: "Customers who return", href: "#contacto" },
  ],
  hero: {
    kicker: "",
    kickerBrand: "Logistics for auto repair shops",
    headline: "Move cars with your drivers or with ours.",
    subtext:
      "A logistics platform for workshops. Pickup and delivery with your drivers or Mecanu's. Transit cover only if you add it.",
    primary: "Talk to us",
    secondary: "See how it works",
    photoAlt: "White Volvo seen from above on an urban street",
  },
  logosAria: "Insurers",
  logosLabel: "Covered with",
  map: {
    heading: "Where we operate",
    subtext:
      "From one branch, serve the whole city without friction.\nOur customers around Madrid and Barcelona.",
    sectionAria: "Shops in {city}",
    citySwitchAria: "City",
    ciudades: {
      madrid: "Madrid",
      barcelona: "Barcelona",
    },
    details: "Details",
    talk: "Apply as a shop",
    comingSoon: "Pickup and delivery across the metro area.",
    postular: {
      nombrePlaceholder: "Your name",
      telefonoPlaceholder: "Phone",
      tallerPlaceholder: "Shop name",
      privacidadLabel: "I accept the privacy policy",
      privacidadError: "Check the privacy box to send.",
      gracias: "Got it. We'll reach out within 24 hours.",
      error: "Something went wrong. Try again.",
      enviando: "Sending…",
    },
    resetAria: "Back to the city view",
    zoomInAria: "Zoom in",
    zoomOutAria: "Zoom out",
  },
  statsAria: "What Mecanu does",
  specsAria: "Mecanu performance and specifications",
  specs: {
    eyebrow: "Performance",
    heading: "Logistics and the next job",
    items: [
      {
        valor: "2 fleets",
        etiqueta: "The workshop's or Mecanu's",
      },
      {
        valor: "1 hour",
        etiqueta: "Pickup and delivery window",
      },
      {
        valor: "Cover",
        etiqueta: "Transit insurance, only if the workshop adds it",
      },
      {
        valor: "Check-in",
        etiqueta: "Photo, condition and record",
      },
      {
        valor: "Check-out",
        etiqueta: "The same check on handover",
      },
      {
        valor: "Return",
        etiqueta: "Reminders and the next job",
      },
    ],
  },
  faq: {
    eyebrow: "Frequently asked questions",
    heading: "Frequently asked questions",
  },
  stats: [
    {
      numero: "01",
      valor: "Own",
      etiqueta: "Workshop drivers",
      texto:
        "Your drivers use the platform: routes, window, check-in and transit cover.",
      enlace: "See how it works",
    },
    {
      numero: "02",
      valor: "External",
      etiqueta: "Mecanu drivers",
      texto:
        "When you can't cover it, a Mecanu driver runs the car. Transit cover is part of the run.",
      enlace: "See how it works",
    },
    {
      numero: "03",
      valor: "Check-in",
      etiqueta: "The customer comes back",
      texto:
        "Photo, component condition and a record. That feeds the reminder, the next job and the return visit.",
    },
  ],
  hiw: {
    eyebrow: "Operations",
    heading: "How it works",
    cta: "Talk to Mecanu →",
    subtext: "Three steps from the call to a signed delivery. The run never goes missing.",
    pasos: [
      {
        numero: "01",
        titulo: "Say where the car is",
        texto: "Customer, shop, date and window. The run is logged from the start.",
      },
      {
        numero: "02",
        titulo: "Mecanu runs the route",
        texto: "Drivers take it from inspection to delivery, with live location.",
      },
      {
        numero: "03",
        titulo: "Deliver. Get the bay back.",
        texto: "The customer gets updates at home or work. The shop keeps repairing.",
      },
    ],
  },
  hiring: {
    heading: "Shop packed with cars ready to go?",
    subtext:
      "Grow without a bigger bay: dispatch ready cars right away and deliver to the door—an experience customers notice.",
    cta: "Bring Mecanu in",
    photoAlt: "Classic car split in vintage collage.",
  },
  news: {
    eyebrow: "Ideas for the shop",
    heading: "Ideas to modernize your shop",
    cta: "See all →",
    read: "Read →",
    items: [
      {
        categoria: "Experience",
        titulo: "Customers got used to delivery. Shops aren't staying behind.",
        icono: "schedule",
        visual: "articleWindow",
      },
      {
        categoria: "Guide",
        titulo: "How to free a bay when the car is done",
        icono: "garage",
        visual: "articleWorkshop",
      },
      {
        categoria: "Mecanu",
        titulo: "External fleet for peaks, without losing control",
        icono: "local_shipping",
        visual: "articleFleet",
      },
    ],
  },
  close: {
    eyebrow: "Contact",
    heading: "The customer doesn't have to come to the shop.",
    subtext: "Tell us where the shop is. We'll call and look at a real transfer.",
    primary: "Talk to Mecanu",
    secondary: "See how it works",
    featuresLabel: "Benefits",
    beneficios: [
      {
        icono: "door_front",
        texto: "No more waiting 7 days: we collect the car at their door.",
      },
      {
        icono: "home_work",
        texto: "The customer stays home. You get the bay back.",
      },
      {
        icono: "savings",
        texto: "Cheaper and more available than a recovery truck.",
      },
      {
        icono: "verified_user",
        texto: "Insured external fleet and flexible liability, for the shop or per transfer.",
      },
      {
        icono: "photo_camera",
        texto: "Visual check-in: up to 20 points.",
      },
      {
        icono: "chat",
        texto: "Automate customer care and upcoming-service alerts.",
      },
    ],
  },
  faq: {
    eyebrow: "MECANU / FAQ",
    heading: "Frequently asked questions",
    more: "Show more",
    less: "Show less",
    links: [
      { href: "/madrid", label: "Mecanu in Madrid" },
      { href: "/barcelona", label: "Mecanu in Barcelona" },
      { href: "/para-talleres", label: "How it works for your shop" },
      { href: "/alternativa-grua", label: "Compared with a tow truck" },
      { href: "/alternativa-mecanico-a-domicilio", label: "Compared with a mobile mechanic" },
      { href: "/itv-para-talleres", label: "ITV for workshops" },
      { href: "/software-taller", label: "Workshop software" },
      { href: "/mantenimiento-marcas", label: "Service by brand" },
      { href: "/cliente-no-recoge-coche", label: "Customer doesn't collect the car" },
      { href: "/blog", label: "Operations blog" },
    ],
  },
  footer: {
    tagline: "Logistics for shops that keep repairing.",
    contacto: "Contact",
    producto: "Product",
    solucion: "The solution",
    como: "How it works",
    cobertura: "Cover",
    queEsMecanu: "What is Mecanu",
    recursos: "Resources",
    ideas: "Ideas for the shop",
    paraTalleres: "For workshops",
    trasladosMadrid: "Vehicle moves in Madrid",
    trasladosBarcelona: "Vehicle moves in Barcelona",
    hablar: "Talk to Mecanu",
    arriba: "Back to top",
    copyright: "© 2026 Mecanu",
    cta: "Talk to Mecanu →",
    langLabel: "Language",
    privacidad: "Privacy",
    avisoLegal: "Legal notice",
    cookies: "Cookies",
    terminos: "Terms",
    accesibilidad: "Accessibility",
    cumplimientoTitulo: "EU compliance",
    cumplimientoTexto: "GDPR · ePrivacy · LSSI-CE",
    comparativas: "Comparisons",
    comparativaLinks: [
      { href: "/alternativa-grua", label: "Tow truck or driver" },
      { href: "/alternativa-mecanico-a-domicilio", label: "Mobile mechanic" },
      { href: "/taller-oficial-o-multimarca", label: "Dealer or independent" },
      { href: "/capacidad-taller", label: "Shop capacity" },
      { href: "/itv-para-talleres", label: "ITV for workshops" },
      { href: "/software-taller", label: "Workshop software" },
      { href: "/mantenimiento-marcas", label: "Service by brand" },
      { href: "/cliente-no-recoge-coche", label: "Customer doesn't collect the car" },
    ],
  },
  errors: {
    notFound: {
      kicker: "ERROR 404",
      headline: "Cars don't stop. This page did.",
      subtext: "We looked for this route on the lot. It isn't there. Not even in the waiting bay.",
      cta: "Back to the home page",
    },
    server: {
      kicker: "ERROR 500",
      headline: "The shop is still open. The server, for now, is not.",
      subtext: "We parked the vehicle somewhere safe. You can try again or go home.",
      cta: "Back to the home page",
      retry: "Try again",
    },
  },
  consent: {
    titulo: "Cookies at Mecanu",
    cuerpo:
      "Essential cookies always run (language, security). If you allow it, we measure pages and device — iPhone or not, what you read — the Google Analytics way. Ads (Google Ads and Meta) are separate. You can deny them and the site still works.",
    aceptar: "Accept all",
    rechazar: "Essentials only",
    gestionar: "Policy",
    configurar: "Customize",
    guardar: "Save choices",
    esencialesTitulo: "Essential",
    esencialesCuerpo: "Language, security and remembering your choice. The site needs them to work.",
    analiticaTitulo: "Analytics",
    analiticaCuerpo:
      "Pages you visit, device (iPhone, Android, desktop) and language. Google Analytics 4, Clarity and Vercel. This is the business measurement.",
    publicidadTitulo: "Advertising",
    publicidadCuerpo:
      "Google Ads and Meta (Facebook/Instagram). PageView, ViewContent and Lead events so campaigns are not a black box. Off = no ad pixels.",
    coreEtiqueta: "Measurement",
    siempreActivas: "Always on",
  },
  contacto: {
    eyebrow: "Get started",
    heading: "Four details and we'll call.",
    subtext: "Name, phone, city and how many cars you move.",
    aceptar: "OK",
    enviar: "Submit",
    anterior: "Back",
    privacidadLabel: "I have read and accept the privacy policy.",
    privacidadError: "Tick the privacy box to submit.",
    gracias: {
      heading: "Got it.",
      subtext: "We will get back to you within 24 hours.",
    },
    pasos: {
      nombre: { pregunta: "Let's start. What is your **first name**?" },
      apellido: { pregunta: "Nice to meet you, {nombre}. What is your **last name**?" },
      email: {
        pregunta: "What is your **email address**?",
        aviso:
          "By submitting this form, you agree that Mecanu may contact you to discuss your shop.",
      },
      telefono: {
        pregunta: "What is your **phone number**?",
        selectorPais: "Country",
      },
      objetivo: {
        pregunta: "What do you want to **do**?",
        opciones: ["Digitise my current shop", "Open a new workshop"],
      },

      uso: {
        pregunta: "What **problem do you want to solve** with Mecanu?",
        aviso: "Select up to 3 options.",
        opciones: [
          "Drop off cars at the customer's door",
          "Pick up cars from the customer",
          "Offer a better customer experience",
          "Hire external drivers",
          "Civil liability insurance",
          "Automate customer communication",
          "Get a website for the workshop",
          "Offer financing to customers",
          "Build loyalty and repeat visits",
        ],
      },
      ciudad: {
        pregunta: "What **city** is your shop in?",
        opciones: ["Madrid", "Barcelona", "Other"],
      },
      volumen: {
        pregunta: "How many **cars do you normally service** per month?",
        aviso: "Count cars that come into the shop, not just home-collection runs.",
        opciones: [
          "Under 20 (micro)",
          "20 – 60 (small)",
          "60 – 150 (medium)",
          "150 – 400 (large)",
          "Over 400 (fleet / chain)",
        ],
      },
      negocio: {
        pregunta: "What is the **name of your workshop**?",
        placeholder: "Type the name here…",
      },
      canal: {
        pregunta: "How did you **find us**?",
        opciones: [
          "Google / online search",
          "LinkedIn",
          "Instagram / social media",
          "Radio La Clave",
          "Startupslatam.com",
          "Tech Barcelona",
          "Field sales rep",
          "Referral from another shop",
          "Email or newsletter",
          "Event or trade fair",
          "Other",
        ],
      },
    },
  },
};

const pt: LandingCopy = {
  meta: {
    title: "Mecanu | Recolha e entrega de veículos para oficinas mecânicas",
    description:
      "A Mecanu recolhe e devolve o carro do cliente para oficinas em Madrid e Barcelona. Janela de 1 hora, condutor verificado, seguro de responsabilidade civil.",
  },
  nav: {
    homeAria: "Mecanu, início",
    mainAria: "Navegação principal",
    mobileAria: "Navegação móvel",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    inicio: "Início",
    solucion: "Solução",
    recursos: "Recursos",
    productos: "Produtos",
    cta: "Falar com Mecanu",
    langLabel: "Idioma",
    como: "Como funciona",
    cobertura: "Cobertura",
    preguntas: "Perguntas",
  },
  productos: [
    { label: "Logística", href: "#solucion" },
    { label: "Frota própria", href: "#solucion" },
    { label: "Frota externa", href: "#solucion" },
    { label: "Seguro de traslado", href: "#cobertura" },
    { label: "Check-in", href: "#solucion" },
    { label: "Clientes que voltam", href: "#contacto" },
  ],
  hero: {
    kicker: "",
    kickerBrand: "Logística para oficinas mecânicas",
    headline: "Leva carros com a tua frota ou com a nossa.",
    subtext:
      "Plataforma logística para oficinas. Recolha e entrega com a tua frota ou a da Mecanu. O seguro de traslado acrescenta-se se o quiseres.",
    primary: "Falar connosco",
    secondary: "Ver como funciona",
    photoAlt: "Volvo branco visto de cima numa rua urbana",
  },
  logosAria: "Seguradoras",
  logosLabel: "Cobertura com",
  map: {
    heading: "As nossas localizações",
    subtext:
      "A partir de uma sucursal, atende sem atrito em toda a cidade.\nOs nossos clientes à volta de Madrid e Barcelona.",
    sectionAria: "Oficinas em {city}",
    citySwitchAria: "Cidade",
    ciudades: {
      madrid: "Madrid",
      barcelona: "Barcelona",
    },
    details: "Detalhes",
    talk: "Candidatar oficina",
    comingSoon: "Recolha e entrega na área metropolitana.",
    postular: {
      nombrePlaceholder: "O teu nome",
      telefonoPlaceholder: "Telefone",
      tallerPlaceholder: "Nome da oficina",
      privacidadLabel: "Aceito a política de privacidade",
      privacidadError: "Marca a caixa de privacidade para enviar.",
      gracias: "Recebido. Contactamos-te em menos de 24 h.",
      error: "Algo correu mal. Tenta outra vez.",
      enviando: "A enviar…",
    },
    resetAria: "Voltar à vista da cidade",
    zoomInAria: "Aproximar o mapa",
    zoomOutAria: "Afastar o mapa",
  },
  statsAria: "O que a Mecanu faz",
  specsAria: "Rendimento e especificações da Mecanu",
  specs: {
    eyebrow: "Rendimento",
    heading: "O que muda na tua oficina",
    items: [
      {
        valor: "1 hora",
        etiqueta: "Janela de recolha e entrega",
      },
      {
        valor: "7 dias",
        etiqueta: "Antecipação de entrada na oficina",
      },
      {
        valor: "-50%",
        etiqueta: "Custo face a um reboque urbano",
      },
      {
        valor: "12–30%",
        etiqueta: "Maior rotação de viaturas na oficina",
      },
      {
        valor: "20 pontos",
        etiqueta: "Check-in visual com foto e assinatura",
      },
      {
        valor: "100%",
        etiqueta: "Cobertura RC em custódia e trajeto",
      },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    heading: "Perguntas frequentes",
  },
  stats: [
    {
      numero: "01",
      valor: "Própria",
      etiqueta: "Frota da oficina",
      texto:
        "Os teus condutores usam a plataforma logística: rotas, janela e check-in. O seguro de traslado é opcional.",
      enlace: "Ver como funciona",
    },
    {
      numero: "02",
      valor: "Externa",
      etiqueta: "Frota da Mecanu",
      texto:
        "Quando não chegas, a viagem fica com um condutor da Mecanu. O seguro de traslado só se o acrescentares.",
      enlace: "Ver como funciona",
    },
    {
      numero: "03",
      valor: "Check-in",
      etiqueta: "O cliente volta",
      texto:
        "Foto, estado do componente e registo. Daí saem o aviso, o serviço seguinte e a volta à oficina.",
    },
  ],
  hiw: {
    eyebrow: "Operação",
    heading: "Como funciona",
    cta: "Falar com Mecanu →",
    subtext: "Três passos da chamada à entrega assinada. A recolha não se perde.",
    pasos: [
      {
        numero: "01",
        titulo: "Diz onde está o carro",
        texto: "Cliente, oficina, data e janela. A recolha fica registada desde o início.",
      },
      {
        numero: "02",
        titulo: "A Mecanu trata da rota",
        texto: "Os condutores levam da inspeção à entrega, com posição em tempo real.",
      },
      {
        numero: "03",
        titulo: "Entrega. Recupera o lugar.",
        texto: "O cliente recebe avisos em casa ou no trabalho. A oficina continua a reparar.",
      },
    ],
  },
  hiring: {
    heading: "Oficina cheia de carros prontos?",
    subtext:
      "Cresce sem alargar a oficina: despacha já os carros prontos e entrega à porta, com uma experiência que se nota.",
    cta: "Chama a Mecanu",
    photoAlt: "Carro clássico partido em collage vintage.",
  },
  news: {
    eyebrow: "Ideias para a oficina",
    heading: "Ideias para modernizar a tua oficina",
    cta: "Ver todas →",
    read: "Ler →",
    items: [
      {
        categoria: "Experiência",
        titulo: "O cliente habituou-se ao delivery e as oficinas não ficam atrás",
        icono: "schedule",
        visual: "articleWindow",
      },
      {
        categoria: "Guia",
        titulo: "Como libertar um lugar quando o carro já está pronto",
        icono: "garage",
        visual: "articleWorkshop",
      },
      {
        categoria: "Mecanu",
        titulo: "Frota externa para picos, sem perder o controlo",
        icono: "local_shipping",
        visual: "articleFleet",
      },
    ],
  },
  close: {
    eyebrow: "Contacto",
    heading: "O cliente não tem de ir à oficina.",
    subtext: "Diz-nos onde fica a oficina. Ligamos e vemos isto com uma recolha real.",
    primary: "Falar com Mecanu",
    secondary: "Ver como funciona",
    featuresLabel: "Benefícios",
    beneficios: [
      {
        icono: "door_front",
        texto: "Acabou esperar 7 dias: o carro recolhe-se à porta.",
      },
      {
        icono: "home_work",
        texto: "O cliente fica em casa. Tu recuperas o lugar.",
      },
      {
        icono: "savings",
        texto: "Mais barato e mais disponível do que um reboque.",
      },
      {
        icono: "verified_user",
        texto: "Frota externa com seguro e RC flexível, para a oficina ou por recolha.",
      },
      {
        icono: "photo_camera",
        texto: "Check-in visual: até 20 pontos.",
      },
      {
        icono: "chat",
        texto: "Automatiza o atendimento e os avisos dos próximos serviços.",
      },
    ],
  },
  faq: {
    eyebrow: "MECANU / PERGUNTAS FREQUENTES",
    heading: "Perguntas frequentes",
    more: "Ver mais",
    less: "Ver menos",
    links: [
      { href: "/madrid", label: "Mecanu em Madrid" },
      { href: "/barcelona", label: "Mecanu em Barcelona" },
      { href: "/para-talleres", label: "Como funciona para a tua oficina" },
      { href: "/alternativa-grua", label: "Comparado com um reboque" },
      { href: "/alternativa-mecanico-a-domicilio", label: "Comparado com um mecânico ao domicílio" },
      { href: "/itv-para-talleres", label: "Inspeção para oficinas" },
      { href: "/software-taller", label: "Software de oficina" },
      { href: "/mantenimiento-marcas", label: "Manutenção por marca" },
      { href: "/cliente-no-recoge-coche", label: "O cliente não levanta o carro" },
      { href: "/blog", label: "Blog de operações" },
    ],
  },
  footer: {
    tagline: "Logística para oficinas que querem continuar a reparar.",
    contacto: "Contacto",
    producto: "Produto",
    solucion: "A solução",
    como: "Como funciona",
    cobertura: "Cobertura",
    queEsMecanu: "O que é a Mecanu",
    recursos: "Recursos",
    ideas: "Ideias para a oficina",
    paraTalleres: "Para oficinas",
    trasladosMadrid: "Traslados em Madrid",
    trasladosBarcelona: "Traslados em Barcelona",
    hablar: "Falar com Mecanu",
    arriba: "Voltar ao topo",
    copyright: "© 2026 Mecanu",
    cta: "Falar com Mecanu →",
    langLabel: "Idioma",
    privacidad: "Privacidade",
    avisoLegal: "Aviso legal",
    cookies: "Cookies",
    terminos: "Termos",
    accesibilidad: "Acessibilidade",
    cumplimientoTitulo: "Cumprimento UE",
    cumplimientoTexto: "RGPD · ePrivacy · LSSI-CE",
    comparativas: "Comparações",
    comparativaLinks: [
      { href: "/alternativa-grua", label: "Reboque ou condutor" },
      { href: "/alternativa-mecanico-a-domicilio", label: "Mecânico ao domicílio" },
      { href: "/taller-oficial-o-multimarca", label: "Oficial ou multimarca" },
      { href: "/capacidad-taller", label: "Capacidade da oficina" },
      { href: "/itv-para-talleres", label: "Inspeção para oficinas" },
      { href: "/software-taller", label: "Software de oficina" },
      { href: "/mantenimiento-marcas", label: "Manutenção por marca" },
      { href: "/cliente-no-recoge-coche", label: "O cliente não levanta o carro" },
    ],
  },
  errors: {
    notFound: {
      kicker: "ERROR 404",
      headline: "Os carros não param. Esta página, sim.",
      subtext: "Procurámos esta rota no recinto. Não está. Nem no pátio de espera.",
      cta: "Voltar à página inicial",
    },
    server: {
      kicker: "ERROR 500",
      headline: "A oficina continua aberta. O servidor, por agora, não.",
      subtext: "Deixámos o veículo em zona segura. Podes tentar de novo ou voltar ao início.",
      cta: "Voltar à página inicial",
      retry: "Tentar de novo",
    },
  },
  consent: {
    titulo: "Cookies na Mecanu",
    cuerpo:
      "As essenciais estão sempre ligadas (idioma, segurança). Se nos deixares, medimos páginas e dispositivo — se entras com iPhone, o que lês — ao estilo do Google Analytics. A publicidade (Google Ads e Meta) é à parte. Podes recusar e o site funciona na mesma.",
    aceptar: "Aceitar todas",
    rechazar: "Só essenciais",
    gestionar: "Política",
    configurar: "Configurar",
    guardar: "Guardar seleção",
    esencialesTitulo: "Essenciais",
    esencialesCuerpo: "Idioma, segurança e lembrar a tua escolha. Sem elas o site não funciona.",
    analiticaTitulo: "Analítica",
    analiticaCuerpo:
      "Páginas que visitas, dispositivo (iPhone, Android, computador) e idioma. Google Analytics 4, Clarity e Vercel. É a medição do negócio.",
    publicidadTitulo: "Publicidade",
    publicidadCuerpo:
      "Google Ads e Meta (Facebook/Instagram). Eventos PageView, ViewContent e Lead para saber se uma campanha serve. Desligado = zero píxeis de anúncios.",
    coreEtiqueta: "Medição",
    siempreActivas: "Sempre ativas",
  },
  contacto: {
    eyebrow: "Começa aqui",
    heading: "Quatro dados e ligamos.",
    subtext: "Nome, telefone, cidade e quantos carros moves.",
    aceptar: "Aceitar",
    enviar: "Enviar",
    anterior: "Anterior",
    privacidadLabel: "Li e aceito a política de privacidade.",
    privacidadError: "Marca a caixa de privacidade para enviar.",
    gracias: {
      heading: "Recebido.",
      subtext: "Entraremos em contacto contigo em menos de 24 horas.",
    },
    pasos: {
      nombre: { pregunta: "Vamos começar. Qual é o teu **nome**?" },
      apellido: { pregunta: "Muito prazer, {nombre}. Qual é o teu **apelido**?" },
      email: {
        pregunta: "Qual é o teu **email**?",
        aviso:
          "Ao enviares este formulário, aceitas que a Mecanu entre em contacto contigo para falar da tua oficina.",
      },
      telefono: {
        pregunta: "Qual é o teu **número de telemóvel**?",
        selectorPais: "País",
      },
      objetivo: {
        pregunta: "O que queres **fazer**?",
        opciones: ["Digitalizar a minha oficina atual", "Abrir uma nova oficina"],
      },

      uso: {
        pregunta: "Que **problema queres resolver** com a Mecanu?",
        aviso: "Seleciona até 3 opções.",
        opciones: [
          "Levar carros a casa do cliente",
          "Ir buscar carros ao cliente",
          "Oferecer melhor experiência ao cliente",
          "Contratar condutores externos",
          "Seguro de responsabilidade civil",
          "Automatizar o atendimento ao cliente",
          "Ter página web para a oficina",
          "Oferecer crédito aos clientes",
          "Fidelizar clientes e repetir visitas",
        ],
      },
      ciudad: {
        pregunta: "Em que **cidade** está a tua oficina?",
        opciones: ["Madrid", "Barcelona", "Outra"],
      },
      volumen: {
        pregunta: "Quantos **carros atende** normalmente por mês?",
        aviso: "Conta os que entram na oficina, não só as recolhas ao domicílio.",
        opciones: [
          "Menos de 20 (micro)",
          "20 – 60 (pequena)",
          "60 – 150 (média)",
          "150 – 400 (grande)",
          "Mais de 400 (frota / cadeia)",
        ],
      },
      negocio: {
        pregunta: "Qual é o **nome da tua oficina**?",
        placeholder: "Escreve o nome aqui…",
      },
      canal: {
        pregunta: "Como nos **conheceste**?",
        opciones: [
          "Google / pesquisa online",
          "LinkedIn",
          "Instagram / redes sociais",
          "Radio La Clave",
          "Startupslatam.com",
          "Tech Barcelona",
          "Vendedor em terreno",
          "Referência de outra oficina",
          "Email ou newsletter",
          "Evento ou feira",
          "Outro",
        ],
      },
    },
  },
};

const COPIES: Record<Locale, LandingCopy> = { es, ca, en, pt };

export function copyFor(locale: Locale): LandingCopy {
  return COPIES[locale] ?? COPIES[DEFAULT_LOCALE];
}
