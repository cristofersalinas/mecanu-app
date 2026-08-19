import { DEFAULT_LOCALE, type Locale } from "./locales";

export type LandingMapCityId =
  | "madrid"
  | "londres"
  | "sao-paulo"
  | "san-francisco"
  | "nueva-york";

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
  };
  productos: { label: string; href: string }[];
  hero: {
    kicker: string;
    kickerBrand: string;
    headline: string;
    subtext: string;
    primary: string;
    secondary: string;
    photoAlt: string;
  };
  logosAria: string;
  map: {
    /** Plantilla, no función: `{city}` lo sustituye el cliente. El copy cruza
     *  la frontera servidor→cliente y una función no es serializable. */
    sectionAria: string;
    citySwitchAria: string;
    ciudades: Record<LandingMapCityId, string>;
    details: string;
    talk: string;
  };
  statsAria: string;
  stats: { numero: string; valor: string; etiqueta: string; texto: string; enlace?: string }[];
  hiw: {
    eyebrow: string;
    heading: string;
    cta: string;
    subtext: string;
    pasos: { numero: string; titulo: string; texto: string }[];
  };
  hiring: { heading: string; subtext: string; cta: string };
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
    beneficios: string[];
  };
  footer: {
    tagline: string;
    contacto: string;
    producto: string;
    solucion: string;
    como: string;
    cobertura: string;
    recursos: string;
    ideas: string;
    hablar: string;
    arriba: string;
    copyright: string;
    cta: string;
    langLabel: string;
    privacidad: string;
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
  };
  contacto: {
    eyebrow: string;
    heading: string;
    subtext: string;
    aceptar: string;
    enviar: string;
    anterior: string;
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
      tipoTaller: {
        pregunta: string;
        opciones: [string, string, string, string, string];
      };
      uso: {
        pregunta: string;
        aviso: string;
        opciones: [string, string, string, string, string, string, string, string, string];
      };
      ciudad: {
        pregunta: string;
        opciones: [string, string, string, string, string, string];
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
    title: "Mecanu | Recogida y entrega de coches para talleres mecánicos",
    description:
      "Mecanu coordina la recogida y entrega de vehículos para talleres mecánicos en Madrid, Barcelona, Londres y más. Conductores verificados, ventanas de 1 hora, seguro incluido. Sin grúas caras.",
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
  },
  productos: [
    { label: "Logística", href: "#solucion" },
    { label: "Seguros", href: "#cobertura" },
    { label: "Marketplace", href: "#contacto" },
    { label: "Flota externa", href: "#flota" },
    { label: "Ecommerce", href: "#contacto" },
    { label: "Atención de cliente", href: "#contacto" },
  ],
  hero: {
    kicker: "DISEÑADO PARA",
    kickerBrand: "TALLERES EN MOVIMIENTO",
    headline: "Los coches se mueven. Tu taller no para.",
    subtext:
      "Despacha vehículos donde los necesites, libera espacio en tu taller y ofrece una experiencia a tus clientes, con control de cada traslado. Sin fricciones.",
    primary: "Ver cómo funciona",
    secondary: "Hablar con nosotros",
    photoAlt: "Volvo recorriendo una calle estrecha al atardecer",
  },
  logosAria: "Logos de talleres clientes de referencia",
  map: {
    sectionAria: "Mapa de talleres en {city}",
    citySwitchAria: "Ciudad del mapa",
    ciudades: {
      madrid: "Madrid",
      londres: "Londres",
      "sao-paulo": "São Paulo",
      "san-francisco": "San Francisco",
      "nueva-york": "New York",
    },
    details: "Detalles",
    talk: "Hablar con Mecanu",
  },
  statsAria: "Resultados de Mecanu",
  stats: [
    {
      numero: "01",
      valor: "1 h",
      etiqueta: "VENTANA HORARIA",
      texto:
        "Recogidas y entregas coordinadas en un rango claro, para que el cliente y el taller sepan cuándo ocurre.",
      enlace: "Ver cómo funciona",
    },
    {
      numero: "02",
      valor: "24/7",
      etiqueta: "ESTADO VISIBLE",
      texto:
        "Cada movimiento queda registrado: conductor, estado, fotos y firma desde la recogida hasta la entrega.",
      enlace: "Ver cómo funciona",
    },
    {
      numero: "03",
      valor: "40 km",
      etiqueta: "PRUEBA EN RUTA",
      texto:
        "Cobertura pensada para el riesgo real de mover vehículos bajo custodia del taller, también en pruebas.",
    },
  ],
  hiw: {
    eyebrow: "OPERACIÓN",
    heading: "Cómo funciona",
    cta: "Hablar con Mecanu →",
    subtext:
      "Tres pasos para pasar de la llamada del cliente a una entrega registrada, sin perder el hilo del traslado.",
    pasos: [
      {
        numero: "01",
        titulo: "Indica dónde está el coche",
        texto:
          "Elige cliente, taller, fecha y ventana. El traslado queda registrado desde el primer momento.",
      },
      {
        numero: "02",
        titulo: "Mecanu coordina la ruta",
        texto:
          "Los conductores gestionan todo el traslado, desde la inspección hasta la entrega, con geolocalización en tiempo real.",
      },
      {
        numero: "03",
        titulo: "Entrega y vuelve a producir",
        texto:
          "El cliente recibe avisos desde la comodidad de su casa o trabajo, y el taller queda libre para seguir operando.",
      },
    ],
  },
  hiring: {
    heading: "¿Pico de trabajo?",
    subtext: "Tu capacidad puede crecer sin ampliar la nave.",
    cta: "Pide apoyo a Mecanu",
  },
  news: {
    eyebrow: "MECANU / IDEAS PARA EL TALLER",
    heading: "Novedades para mover mejor tu taller",
    cta: "Ver todas →",
    read: "Leer →",
    items: [
      {
        categoria: "GUÍA",
        titulo: "Cómo liberar una plaza cuando el coche ya está terminado",
        icono: "garage",
        visual: "articleWorkshop",
      },
      {
        categoria: "OPERATIVA",
        titulo: "Ventanas horarias: una forma más clara de coordinar cada traslado",
        icono: "schedule",
        visual: "articleWindow",
      },
      {
        categoria: "MECANU",
        titulo: "Flota externa para absorber picos sin perder el control",
        icono: "local_shipping",
        visual: "articleFleet",
      },
    ],
  },
  close: {
    eyebrow: "PONLO EN MARCHA",
    heading: "Si tus clientes no pueden ir al taller por falta de tiempo.",
    subtext:
      "Despacha vehículos donde los necesites, libera espacio en tu taller y ofrece una experiencia a tus clientes, con control de cada traslado. Sin fricciones.",
    primary: "Hablar con Mecanu",
    secondary: "Ver cómo funciona",
    featuresLabel: "LO QUE OBTIENES",
    beneficios: [
      "Más plazas disponibles para reparar.",
      "Ventanas claras y estados visibles.",
      "Tu equipo o flota externa cuando haga falta.",
      "Cobertura y evidencia en cada traslado.",
      "Un solo hilo de información para todos.",
    ],
  },
  footer: {
    tagline: "Logística B2B para talleres que quieren seguir reparando.",
    contacto: "Contacto",
    producto: "Producto",
    solucion: "La solución",
    como: "Cómo funciona",
    cobertura: "Cobertura",
    recursos: "Recursos",
    ideas: "Ideas para el taller",
    hablar: "Hablar con Mecanu",
    arriba: "Volver arriba",
    copyright: "© 2026 Mecanu",
    cta: "Hablar con Mecanu →",
    langLabel: "Idioma",
    privacidad: "Privacidad",
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
      "Si nos lo permites, usamos Google Analytics y Microsoft Clarity para saber qué páginas se leen y cómo se usa la web. Puedes decir que no y la web funciona igual.",
    aceptar: "Aceptar",
    rechazar: "Rechazar",
    gestionar: "Más info",
    configurar: "Configurar cookies",
  },
  contacto: {
    eyebrow: "EMPIEZA AQUÍ",
    heading: "Cuéntanos un poco sobre tu taller.",
    subtext: "Son solo unos minutos. Nos ayuda a preparar la conversación.",
    aceptar: "Aceptar",
    enviar: "Enviar",
    anterior: "Anterior",
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
        opciones: ["Digitalizar mi taller actual", "Abrir un nuevo taller"],
      },
      tipoTaller: {
        pregunta: "¿Qué tipo de **taller** tienes?",
        opciones: [
          "Mecánica general",
          "Carrocería y pintura",
          "ITV / revisiones",
          "Taller de flota",
          "Otro",
        ],
      },
      uso: {
        pregunta: "¿Qué **problema quieres resolver** con Mecanu?",
        aviso: "Selecciona hasta 3 opciones.",
        opciones: [
          "Despachar autos a domicilio",
          "Retirar autos del cliente",
          "Ofrecer mejor experiencia al cliente",
          "Contratar conductores externos",
          "Seguro de responsabilidad civil",
          "Automatizar la atención al cliente",
          "Tener página web para el taller",
          "Ofrecer crédito a mis clientes",
          "Fidelizar clientes y repetir visitas",
        ],
      },
      ciudad: {
        pregunta: "¿En qué **ciudad** está tu taller?",
        opciones: ["Madrid", "Barcelona", "Valencia", "Bilbao", "Sevilla", "Otra"],
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
      "Mecanu coordina la recollida i lliurament de vehicles per a tallers mecànics a Barcelona, Madrid i més. Conductors verificats, finestres d'1 hora, assegurança inclosa. Sense grues cares.",
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
  },
  productos: [
    { label: "Logística", href: "#solucion" },
    { label: "Assegurances", href: "#cobertura" },
    { label: "Marketplace", href: "#contacto" },
    { label: "Flota externa", href: "#flota" },
    { label: "Ecommerce", href: "#contacto" },
    { label: "Atenció al client", href: "#contacto" },
  ],
  hero: {
    kicker: "DISSENYAT PER A",
    kickerBrand: "TALLERS EN MOVIMENT",
    headline: "Els cotxes es mouen. El teu taller no s'atura.",
    subtext:
      "Despatxa vehicles on els necessitis, allibera espai al teu taller i ofereix una experiència als teus clients, amb control de cada trasllat. Sense friccions.",
    primary: "Veure com funciona",
    secondary: "Parlar amb nosaltres",
    photoAlt: "Volvo recorrent un carrer estret al capvespre",
  },
  logosAria: "Logotips de tallers clients de referència",
  map: {
    sectionAria: "Mapa de tallers a {city}",
    citySwitchAria: "Ciutat del mapa",
    ciudades: {
      madrid: "Madrid",
      londres: "Londres",
      "sao-paulo": "São Paulo",
      "san-francisco": "San Francisco",
      "nueva-york": "New York",
    },
    details: "Detalls",
    talk: "Parlar amb Mecanu",
  },
  statsAria: "Resultats de Mecanu",
  stats: [
    {
      numero: "01",
      valor: "1 h",
      etiqueta: "FRANJA HORÀRIA",
      texto:
        "Recollides i lliuraments coordinats en una franja clara, perquè el client i el taller sàpiguen quan passa.",
      enlace: "Veure com funciona",
    },
    {
      numero: "02",
      valor: "24/7",
      etiqueta: "ESTAT VISIBLE",
      texto:
        "Cada moviment queda registrat: conductor, estat, fotos i signatura des de la recollida fins al lliurament.",
      enlace: "Veure com funciona",
    },
    {
      numero: "03",
      valor: "40 km",
      etiqueta: "PROVA EN RUTA",
      texto:
        "Cobertura pensada per al risc real de moure vehicles sota custòdia del taller, també en proves.",
    },
  ],
  hiw: {
    eyebrow: "OPERACIÓ",
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
    heading: "Pic de feina?",
    subtext: "La teva capacitat pot créixer sense ampliar la nau.",
    cta: "Demana suport a Mecanu",
  },
  news: {
    eyebrow: "MECANU / IDEES PER AL TALLER",
    heading: "Novetats per moure millor el teu taller",
    cta: "Veure-les totes →",
    read: "Llegir →",
    items: [
      {
        categoria: "GUIA",
        titulo: "Com alliberar una plaça quan el cotxe ja està acabat",
        icono: "garage",
        visual: "articleWorkshop",
      },
      {
        categoria: "OPERATIVA",
        titulo: "Franges horàries: una manera més clara de coordinar cada trasllat",
        icono: "schedule",
        visual: "articleWindow",
      },
      {
        categoria: "MECANU",
        titulo: "Flota externa per absorbir pics sense perdre el control",
        icono: "local_shipping",
        visual: "articleFleet",
      },
    ],
  },
  close: {
    eyebrow: "POSA-HO EN MARXA",
    heading: "Si els teus clients no poden anar al taller per falta de temps.",
    subtext:
      "Despatxa vehicles on els necessitis, allibera espai al teu taller i ofereix una experiència als teus clients, amb control de cada trasllat. Sense friccions.",
    primary: "Parlar amb Mecanu",
    secondary: "Veure com funciona",
    featuresLabel: "QUÈ HI GUANYES",
    beneficios: [
      "Més places disponibles per reparar.",
      "Franges clares i estats visibles.",
      "El teu equip o flota externa quan calgui.",
      "Cobertura i evidència en cada trasllat.",
      "Un sol fil d'informació per a tothom.",
    ],
  },
  footer: {
    tagline: "Logística B2B per a tallers que volen seguir reparant.",
    contacto: "Contacte",
    producto: "Producte",
    solucion: "La solució",
    como: "Com funciona",
    cobertura: "Cobertura",
    recursos: "Recursos",
    ideas: "Idees per al taller",
    hablar: "Parlar amb Mecanu",
    arriba: "Tornar a dalt",
    copyright: "© 2026 Mecanu",
    cta: "Parlar amb Mecanu →",
    langLabel: "Idioma",
    privacidad: "Privacitat",
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
      "Si ens ho permets, fem servir Google Analytics i Microsoft Clarity per saber quines pàgines es llegeixen i com s'usa el web. Pots dir que no i el web funciona igual.",
    aceptar: "Acceptar",
    rechazar: "Rebutjar",
    gestionar: "Més info",
    configurar: "Configurar galetes",
  },
  contacto: {
    eyebrow: "COMENÇA AQUÍ",
    heading: "Explica'ns una mica el teu taller.",
    subtext: "Són uns minuts. Ens ajuda a preparar la conversa.",
    aceptar: "Acceptar",
    enviar: "Enviar",
    anterior: "Anterior",
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
      tipoTaller: {
        pregunta: "Quin tipus de **taller** tens?",
        opciones: [
          "Mecànica general",
          "Carrosseria i pintura",
          "ITV / revisions",
          "Taller de flota",
          "Altre",
        ],
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
        opciones: ["Madrid", "Barcelona", "València", "Bilbao", "Sevilla", "Altra"],
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
      "Mecanu coordinates vehicle collection and delivery for auto repair workshops in London, Madrid, Barcelona and more. Verified drivers, 1-hour windows, insurance included. No expensive recovery trucks.",
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
  },
  productos: [
    { label: "Logistics", href: "#solucion" },
    { label: "Insurance", href: "#cobertura" },
    { label: "Marketplace", href: "#contacto" },
    { label: "External fleet", href: "#flota" },
    { label: "Ecommerce", href: "#contacto" },
    { label: "Customer service", href: "#contacto" },
  ],
  hero: {
    kicker: "DESIGNED FOR",
    kickerBrand: "SHOPS THAT MOVE",
    headline: "Cars move. Your shop never stops.",
    subtext:
      "Send cars where you need them, free the shop, and look after the customer. Every run under control. No friction.",
    primary: "See how it works",
    secondary: "Talk to us",
    photoAlt: "Volvo on a narrow street at dusk",
  },
  logosAria: "Shop logos",
  map: {
    sectionAria: "Shops in {city}",
    citySwitchAria: "City",
    ciudades: {
      madrid: "Madrid",
      londres: "London",
      "sao-paulo": "São Paulo",
      "san-francisco": "San Francisco",
      "nueva-york": "New York",
    },
    details: "Details",
    talk: "Talk to Mecanu",
  },
  statsAria: "What Mecanu does",
  stats: [
    {
      numero: "01",
      valor: "1 h",
      etiqueta: "TIME WINDOW",
      texto: "Collections and deliveries in a clear window. Shop and customer both know when.",
      enlace: "See how it works",
    },
    {
      numero: "02",
      valor: "24/7",
      etiqueta: "VISIBLE STATUS",
      texto: "Every run is logged: driver, status, photos and signature, collection to delivery.",
      enlace: "See how it works",
    },
    {
      numero: "03",
      valor: "40 km",
      etiqueta: "ROAD TEST",
      texto: "Cover for the real risk of moving cars in the shop’s care — including road tests.",
    },
  ],
  hiw: {
    eyebrow: "OPS",
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
    heading: "Workload spike?",
    subtext: "Grow capacity without a bigger shop.",
    cta: "Bring Mecanu in",
  },
  news: {
    eyebrow: "MECANU / IDEAS FOR THE SHOP",
    heading: "What’s new to keep the shop moving",
    cta: "See all →",
    read: "Read →",
    items: [
      {
        categoria: "GUIDE",
        titulo: "How to free a bay when the car is done",
        icono: "garage",
        visual: "articleWorkshop",
      },
      {
        categoria: "OPS",
        titulo: "Time windows: a clearer way to coordinate each run",
        icono: "schedule",
        visual: "articleWindow",
      },
      {
        categoria: "MECANU",
        titulo: "External fleet for peaks, without losing control",
        icono: "local_shipping",
        visual: "articleFleet",
      },
    ],
  },
  close: {
    eyebrow: "GET IT RUNNING",
    heading: "When customers have no time to come in.",
    subtext:
      "Send cars where you need them, free the shop, and look after the customer. Every run under control. No friction.",
    primary: "Talk to Mecanu",
    secondary: "See how it works",
    featuresLabel: "WHAT YOU GET",
    beneficios: [
      "More bays to repair.",
      "Clear windows. Visible status.",
      "Your drivers or ours, when you need them.",
      "Cover and evidence on every run.",
      "One record for everyone.",
    ],
  },
  footer: {
    tagline: "Logistics for shops that keep repairing.",
    contacto: "Contact",
    producto: "Product",
    solucion: "The solution",
    como: "How it works",
    cobertura: "Cover",
    recursos: "Resources",
    ideas: "Ideas for the shop",
    hablar: "Talk to Mecanu",
    arriba: "Back to top",
    copyright: "© 2026 Mecanu",
    cta: "Talk to Mecanu →",
    langLabel: "Language",
    privacidad: "Privacy",
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
      "If you let us, we use Google Analytics and Microsoft Clarity to see which pages get read and how the site is used. You can say no and the site still works.",
    aceptar: "Accept",
    rechazar: "Reject",
    gestionar: "More info",
    configurar: "Cookie settings",
  },
  contacto: {
    eyebrow: "GET STARTED",
    heading: "Tell us a bit about your shop.",
    subtext: "Just a few minutes. Helps us prepare the conversation.",
    aceptar: "OK",
    enviar: "Submit",
    anterior: "Back",
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
      tipoTaller: {
        pregunta: "What type of **workshop** do you run?",
        opciones: [
          "General mechanics",
          "Bodywork and paint",
          "MOT / inspections",
          "Fleet workshop",
          "Other",
        ],
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
        opciones: ["Madrid", "Barcelona", "Valencia", "Bilbao", "Seville", "Other"],
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
      "Mecanu coordena a recolha e entrega de veículos para oficinas em Lisboa, Madrid, Barcelona e mais. Condutores verificados, janelas de 1 hora, seguro incluído. Sem reboques caros.",
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
  },
  productos: [
    { label: "Logística", href: "#solucion" },
    { label: "Seguros", href: "#cobertura" },
    { label: "Marketplace", href: "#contacto" },
    { label: "Frota externa", href: "#flota" },
    { label: "Ecommerce", href: "#contacto" },
    { label: "Apoio ao cliente", href: "#contacto" },
  ],
  hero: {
    kicker: "DESENHADO PARA",
    kickerBrand: "OFICINAS EM MOVIMENTO",
    headline: "Os carros movem-se. A tua oficina não para.",
    subtext:
      "Envia os carros para onde precisares, liberta a oficina e cuida do cliente. Cada recolha controlada. Sem atrito.",
    primary: "Ver como funciona",
    secondary: "Falar connosco",
    photoAlt: "Volvo numa rua estreita ao entardecer",
  },
  logosAria: "Logótipos de oficinas",
  map: {
    sectionAria: "Oficinas em {city}",
    citySwitchAria: "Cidade",
    ciudades: {
      madrid: "Madrid",
      londres: "Londres",
      "sao-paulo": "São Paulo",
      "san-francisco": "San Francisco",
      "nueva-york": "New York",
    },
    details: "Detalhes",
    talk: "Falar com Mecanu",
  },
  statsAria: "O que a Mecanu faz",
  stats: [
    {
      numero: "01",
      valor: "1 h",
      etiqueta: "JANELA HORÁRIA",
      texto: "Recolhas e entregas numa janela clara. Oficina e cliente sabem quando.",
      enlace: "Ver como funciona",
    },
    {
      numero: "02",
      valor: "24/7",
      etiqueta: "ESTADO À VISTA",
      texto: "Cada movimento fica registado: condutor, estado, fotos e assinatura, da recolha à entrega.",
      enlace: "Ver como funciona",
    },
    {
      numero: "03",
      valor: "40 km",
      etiqueta: "TESTE EM ESTRADA",
      texto: "Cobertura para o risco real de mover carros à guarda da oficina — também em testes.",
    },
  ],
  hiw: {
    eyebrow: "OPERAÇÃO",
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
    heading: "Pico de trabalho?",
    subtext: "Aumenta a capacidade sem alargar a oficina.",
    cta: "Chama a Mecanu",
  },
  news: {
    eyebrow: "MECANU / IDEIAS PARA A OFICINA",
    heading: "Novidades para a oficina continuar a andar",
    cta: "Ver todas →",
    read: "Ler →",
    items: [
      {
        categoria: "GUIA",
        titulo: "Como libertar um lugar quando o carro já está pronto",
        icono: "garage",
        visual: "articleWorkshop",
      },
      {
        categoria: "OPERAÇÃO",
        titulo: "Janelas horárias: uma forma mais clara de coordenar cada recolha",
        icono: "schedule",
        visual: "articleWindow",
      },
      {
        categoria: "MECANU",
        titulo: "Frota externa para picos, sem perder o controlo",
        icono: "local_shipping",
        visual: "articleFleet",
      },
    ],
  },
  close: {
    eyebrow: "PÕE ISTO A ANDAR",
    heading: "Quando o cliente não tem tempo de ir à oficina.",
    subtext:
      "Envia os carros para onde precisares, liberta a oficina e cuida do cliente. Cada recolha controlada. Sem atrito.",
    primary: "Falar com Mecanu",
    secondary: "Ver como funciona",
    featuresLabel: "O QUE OBTÉNS",
    beneficios: [
      "Mais lugares para reparar.",
      "Janelas claras. Estado à vista.",
      "Os teus condutores ou os nossos, quando for preciso.",
      "Cobertura e prova em cada recolha.",
      "Um só registo para todos.",
    ],
  },
  footer: {
    tagline: "Logística para oficinas que querem continuar a reparar.",
    contacto: "Contacto",
    producto: "Produto",
    solucion: "A solução",
    como: "Como funciona",
    cobertura: "Cobertura",
    recursos: "Recursos",
    ideas: "Ideias para a oficina",
    hablar: "Falar com Mecanu",
    arriba: "Voltar ao topo",
    copyright: "© 2026 Mecanu",
    cta: "Falar com Mecanu →",
    langLabel: "Idioma",
    privacidad: "Privacidade",
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
      "Se nos autorizares, usamos o Google Analytics e o Microsoft Clarity para saber que páginas são lidas e como o site é usado. Podes dizer que não e o site funciona na mesma.",
    aceptar: "Aceitar",
    rechazar: "Rejeitar",
    gestionar: "Mais info",
    configurar: "Configurar cookies",
  },
  contacto: {
    eyebrow: "COMEÇA AQUI",
    heading: "Conta-nos um pouco sobre a tua oficina.",
    subtext: "São apenas alguns minutos. Ajuda-nos a preparar a conversa.",
    aceptar: "Aceitar",
    enviar: "Enviar",
    anterior: "Anterior",
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
      tipoTaller: {
        pregunta: "Que tipo de **oficina** tens?",
        opciones: [
          "Mecânica geral",
          "Carroçaria e pintura",
          "IPO / inspeções",
          "Oficina de frota",
          "Outro",
        ],
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
        opciones: ["Madrid", "Barcelona", "Valencia", "Bilbao", "Sevilha", "Outra"],
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
