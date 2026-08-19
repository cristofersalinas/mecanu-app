import { DEFAULT_LOCALE, type Locale } from "./locales";

export type ConsentCopy = {
  titulo: string;
  cuerpo: string;
  enlacePolitica: string;
  aceptar: string;
  rechazar: string;
  gestionar: string;
  guardar: string;
  necesarias: string;
  necesariasNota: string;
  analitica: string;
  analiticaNota: string;
  marketing: string;
  marketingNota: string;
};

export type CookiesPageCopy = {
  titulo: string;
  intro: string;
  placeholder: string;
  volver: string;
};

export type LandingCopy = {
  consent: ConsentCopy;
  cookiesPage: CookiesPageCopy;
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
    details: string;
    talk: string;
  };
  statsAria: string;
  stats: {
    numero: string;
    valor: string;
    etiqueta: string;
    texto: string;
    enlace?: string;
    /** Alt de la foto de la tarjeta, en el idioma de la versión. */
    fotoAlt: string;
  }[];
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
  };
};

const es: LandingCopy = {
  consent: {
    titulo: "Cookies en Mecanu",
    cuerpo:
      "Usamos cookies propias para que el sitio funcione y, solo si nos lo permites, cookies de análisis para entender qué partes de la web resultan útiles. Puedes cambiar de opinión cuando quieras.",
    enlacePolitica: "Ver la política de cookies",
    aceptar: "Aceptar todo",
    rechazar: "Rechazar todo",
    gestionar: "Gestionar categorías",
    guardar: "Guardar preferencias",
    necesarias: "Necesarias",
    necesariasNota: "Hacen funcionar el sitio. No se pueden desactivar.",
    analitica: "Analítica",
    analiticaNota: "Nos dicen qué páginas se leen y dónde se atasca la gente.",
    marketing: "Marketing",
    marketingNota: "Permiten medir campañas y mostrar anuncios relevantes.",
  },
  cookiesPage: {
    titulo: "Política de cookies",
    intro:
      "Esta página explica qué cookies usa mecanu.com, para qué sirven y cómo cambiar tu elección.",
    placeholder:
      "PENDIENTE: texto legal por redactar. Debe detallar el responsable del tratamiento, la lista de cookies con proveedor, finalidad y caducidad, la base jurídica de cada categoría y cómo ejercer los derechos del RGPD.",
    volver: "Volver a la portada",
  },
  meta: {
    title: "Mecanu | Logística para talleres",
    description:
      "Recoge y entrega vehículos, libera espacio en tu taller y controla cada traslado con Mecanu.",
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
    details: "Detalles",
    talk: "Hablar con Mecanu",
  },
  statsAria: "Resultados de Mecanu",
  stats: [
    {
      numero: "01",
      valor: "1 h",
      etiqueta: "VENTANA HORARIA",
      fotoAlt: "Tablero de traslados con las paradas del día",
      texto:
        "Recogidas y entregas coordinadas en un rango claro, para que el cliente y el taller sepan cuándo ocurre.",
      enlace: "Ver cómo funciona",
    },
    {
      numero: "02",
      valor: "24/7",
      etiqueta: "ESTADO VISIBLE",
      fotoAlt: "Conductor de Mecanu al volante durante un traslado",
      texto:
        "Cada movimiento queda registrado: conductor, estado, fotos y firma desde la recogida hasta la entrega.",
      enlace: "Ver cómo funciona",
    },
    {
      numero: "03",
      valor: "40 km",
      etiqueta: "PRUEBA EN RUTA",
      fotoAlt: "Malla de cobertura de Mecanu sobre el mapa",
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
  },
};

const ca: LandingCopy = {
  consent: {
    titulo: "Galetes a Mecanu",
    cuerpo:
      "Fem servir galetes pròpies perquè el lloc funcioni i, només si ens ho permets, galetes d'anàlisi per entendre quines parts del web resulten útils. Pots canviar d'opinió quan vulguis.",
    enlacePolitica: "Veure la política de galetes",
    aceptar: "Acceptar-ho tot",
    rechazar: "Rebutjar-ho tot",
    gestionar: "Gestionar categories",
    guardar: "Desar preferències",
    necesarias: "Necessàries",
    necesariasNota: "Fan funcionar el lloc. No es poden desactivar.",
    analitica: "Analítica",
    analiticaNota: "Ens diuen quines pàgines es llegeixen i on s'encalla la gent.",
    marketing: "Màrqueting",
    marketingNota: "Permeten mesurar campanyes i mostrar anuncis rellevants.",
  },
  cookiesPage: {
    titulo: "Política de galetes",
    intro:
      "Aquesta pàgina explica quines galetes fa servir mecanu.com, per a què serveixen i com canviar la teva elecció.",
    placeholder:
      "PENDENT: text legal per redactar. Ha de detallar el responsable del tractament, la llista de galetes amb proveïdor, finalitat i caducitat, la base jurídica de cada categoria i com exercir els drets del RGPD.",
    volver: "Tornar a la portada",
  },
  meta: {
    title: "Mecanu | Logística per a tallers",
    description:
      "Recull i lliura vehicles, allibera espai al teu taller i controla cada trasllat amb Mecanu.",
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
    details: "Detalls",
    talk: "Parlar amb Mecanu",
  },
  statsAria: "Resultats de Mecanu",
  stats: [
    {
      numero: "01",
      valor: "1 h",
      etiqueta: "FRANJA HORÀRIA",
      fotoAlt: "Tauler de trasllats amb les parades del dia",
      texto:
        "Recollides i lliuraments coordinats en una franja clara, perquè el client i el taller sàpiguen quan passa.",
      enlace: "Veure com funciona",
    },
    {
      numero: "02",
      valor: "24/7",
      etiqueta: "ESTAT VISIBLE",
      fotoAlt: "Conductor de Mecanu al volant durant un trasllat",
      texto:
        "Cada moviment queda registrat: conductor, estat, fotos i signatura des de la recollida fins al lliurament.",
      enlace: "Veure com funciona",
    },
    {
      numero: "03",
      valor: "40 km",
      etiqueta: "PROVA EN RUTA",
      fotoAlt: "Malla de cobertura de Mecanu sobre el mapa",
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
  },
};

const en: LandingCopy = {
  consent: {
    titulo: "Cookies at Mecanu",
    cuerpo:
      "We use our own cookies to keep the site working and, only if you let us, analytics cookies to understand which parts of the site are useful. You can change your mind at any time.",
    enlacePolitica: "Read the cookie policy",
    aceptar: "Accept all",
    rechazar: "Reject all",
    gestionar: "Manage categories",
    guardar: "Save preferences",
    necesarias: "Necessary",
    necesariasNota: "They keep the site working. These cannot be turned off.",
    analitica: "Analytics",
    analiticaNota: "They tell us which pages get read and where people get stuck.",
    marketing: "Marketing",
    marketingNota: "They let us measure campaigns and show relevant ads.",
  },
  cookiesPage: {
    titulo: "Cookie policy",
    intro:
      "This page explains which cookies mecanu.com uses, what they are for, and how to change your choice.",
    placeholder:
      "PENDING: legal text to be written. It must set out the data controller, the list of cookies with provider, purpose and expiry, the legal basis for each category, and how to exercise GDPR rights.",
    volver: "Back to the home page",
  },
  meta: {
    title: "Mecanu | Logistics for shops",
    description:
      "Collect and deliver cars, free up bays, and keep every run under control.",
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
    details: "Details",
    talk: "Talk to Mecanu",
  },
  statsAria: "What Mecanu does",
  stats: [
    {
      numero: "01",
      valor: "1 h",
      etiqueta: "TIME WINDOW",
      fotoAlt: "Transfer board showing the day's stops",
      texto: "Collections and deliveries in a clear window. Shop and customer both know when.",
      enlace: "See how it works",
    },
    {
      numero: "02",
      valor: "24/7",
      etiqueta: "VISIBLE STATUS",
      fotoAlt: "A Mecanu driver at the wheel during a transfer",
      texto: "Every run is logged: driver, status, photos and signature, collection to delivery.",
      enlace: "See how it works",
    },
    {
      numero: "03",
      valor: "40 km",
      etiqueta: "ROAD TEST",
      fotoAlt: "Mecanu's coverage mesh over the map",
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
  },
};

const pt: LandingCopy = {
  consent: {
    titulo: "Cookies na Mecanu",
    cuerpo:
      "Usamos cookies próprios para o site funcionar e, apenas se nos autorizares, cookies de análise para perceber que partes do site são úteis. Podes mudar de ideias quando quiseres.",
    enlacePolitica: "Ver a política de cookies",
    aceptar: "Aceitar tudo",
    rechazar: "Rejeitar tudo",
    gestionar: "Gerir categorias",
    guardar: "Guardar preferências",
    necesarias: "Necessárias",
    necesariasNota: "Fazem o site funcionar. Não podem ser desativadas.",
    analitica: "Análise",
    analiticaNota: "Dizem-nos que páginas são lidas e onde as pessoas encalham.",
    marketing: "Marketing",
    marketingNota: "Permitem medir campanhas e mostrar anúncios relevantes.",
  },
  cookiesPage: {
    titulo: "Política de cookies",
    intro:
      "Esta página explica que cookies o mecanu.com usa, para que servem e como alterar a tua escolha.",
    placeholder:
      "PENDENTE: texto legal por redigir. Deve indicar o responsável pelo tratamento, a lista de cookies com fornecedor, finalidade e validade, a base jurídica de cada categoria e como exercer os direitos do RGPD.",
    volver: "Voltar à página inicial",
  },
  meta: {
    title: "Mecanu | Logística para oficinas",
    description:
      "Recolhe e entrega carros, liberta lugares e controla cada recolha.",
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
    details: "Detalhes",
    talk: "Falar com Mecanu",
  },
  statsAria: "O que a Mecanu faz",
  stats: [
    {
      numero: "01",
      valor: "1 h",
      etiqueta: "JANELA HORÁRIA",
      fotoAlt: "Painel de transferências com as paragens do dia",
      texto: "Recolhas e entregas numa janela clara. Oficina e cliente sabem quando.",
      enlace: "Ver como funciona",
    },
    {
      numero: "02",
      valor: "24/7",
      etiqueta: "ESTADO À VISTA",
      fotoAlt: "Condutor da Mecanu ao volante durante uma transferência",
      texto: "Cada movimento fica registado: condutor, estado, fotos e assinatura, da recolha à entrega.",
      enlace: "Ver como funciona",
    },
    {
      numero: "03",
      valor: "40 km",
      etiqueta: "TESTE EM ESTRADA",
      fotoAlt: "Malha de cobertura da Mecanu sobre o mapa",
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
  },
};

const COPIES: Record<Locale, LandingCopy> = { es, ca, en, pt };

export function copyFor(locale: Locale): LandingCopy {
  return COPIES[locale] ?? COPIES[DEFAULT_LOCALE];
}
