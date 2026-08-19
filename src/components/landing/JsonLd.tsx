/**
 * Datos estructurados JSON-LD para Mecanu.
 * Render en servidor — zero JS en el cliente.
 *
 * Esquemas incluidos:
 *  - Organization       → quién es Mecanu
 *  - WebSite            → sitelinks searchbox en Google
 *  - SoftwareApplication → product card en LLMs y SGE
 *  - FAQPage            → rich results de preguntas frecuentes
 *  - ItemList           → lista de ciudades con LocalBusiness
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mecanu.com";

// Entidad de la persona fundadora — ayuda a desambiguar "Mecanu" de la empresa
// chilena anterior que cerró en 2024 y aparece en los primeros resultados
const founder = {
  "@type": "Person",
  "@id": `${SITE}/#founder`,
  name: "Cristofer Salinas",
  url: "https://www.linkedin.com/in/cristofersalinas",
  sameAs: ["https://www.linkedin.com/in/cristofersalinas"],
  jobTitle: "Founder & CEO",
  worksFor: { "@id": `${SITE}/#organization` },
  description: "Emprendedor por afición, vocación y profesión. Fundador de Mecanu.",
  knowsAbout: [
    "Logística automotriz",
    "Talleres mecánicos",
    "Operaciones B2B",
    "Producto digital",
  ],
};

const organization = {
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "Mecanu",
  alternateName: ["Mecanu.com", "Mecanu logística talleres"],
  url: SITE,
  logo: {
    "@type": "ImageObject",
    "@id": `${SITE}/#logo`,
    url: `${SITE}/og-image.png`,
    width: 1200,
    height: 630,
    caption: "Mecanu — Logística de vehículos para talleres mecánicos",
  },
  image: `${SITE}/og-image.png`,
  description:
    "Mecanu es una plataforma B2B de logística de vehículos para talleres mecánicos en España. Coordina la recogida, traslado y entrega de coches de clientes con conductores externos verificados, seguro de responsabilidad civil incluido y panel de control en tiempo real. Fundada en España en 2024.",
  foundingDate: "2024",
  foundingLocation: {
    "@type": "Place",
    name: "España",
    address: { "@type": "PostalAddress", addressCountry: "ES" },
  },
  founder: { "@id": `${SITE}/#founder` },
  areaServed: [
    { "@type": "City", name: "Madrid", "@id": "https://www.wikidata.org/wiki/Q2807" },
    { "@type": "City", name: "Barcelona", "@id": "https://www.wikidata.org/wiki/Q1492" },
    { "@type": "AdministrativeArea", name: "España" },
    { "@type": "City", name: "London" },
    { "@type": "City", name: "São Paulo" },
  ],
  knowsAbout: [
    "Logística de vehículos para talleres mecánicos",
    "Recogida y entrega de coches a domicilio",
    "Conductores externos para talleres",
    "Software de gestión de traslados de vehículos",
    "Alternativa a grúas para talleres",
    "Vehicle collection and delivery for auto repair shops",
    "Taller mecánico Madrid",
    "Taller mecánico Barcelona",
    "Traslado de vehículos España",
  ],
  sameAs: [
    "https://twitter.com/mecanuapp",
    "https://www.linkedin.com/company/mecanu",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    url: `${SITE}/contacto`,
    availableLanguage: ["Spanish", "Catalan", "English", "Portuguese"],
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios de logística de vehículos",
    itemListElement: [
      { "@type": "Offer", name: "Recogida y entrega de vehículos para talleres en Madrid", url: `${SITE}/madrid` },
      { "@type": "Offer", name: "Recogida y entrega de vehículos para talleres en Barcelona", url: `${SITE}/barcelona` },
      { "@type": "Offer", name: "Panel de gestión para talleres mecánicos", url: `${SITE}/para-talleres` },
    ],
  },
};

const website = {
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: SITE,
  name: "Mecanu",
  publisher: { "@id": `${SITE}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE}/blog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const softwareApp = {
  "@type": "SoftwareApplication",
  "@id": `${SITE}/#app`,
  name: "Mecanu",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "Solicita una demo gratuita",
  },
  description:
    "Panel de gestión de traslados de vehículos para talleres mecánicos. Recogida y entrega a domicilio, conductores verificados, seguro incluido, ventanas horarias de 1 hora.",
  featureList: [
    "Recogida y entrega de vehículos a domicilio",
    "Panel de control en tiempo real",
    "Conductores externos verificados",
    "Seguro de responsabilidad civil incluido",
    "Ventanas horarias de 1 hora",
    "Registro de cada traslado con fotos y firma digital",
    "Sin grúas caras ni llamadas telefónicas",
  ],
  screenshot: `${SITE}/landing/stat-tablero.png`,
};

const faqPage = {
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué es Mecanu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mecanu es una plataforma B2B de logística de vehículos diseñada para talleres mecánicos. Permite coordinar la recogida y entrega de los coches de los clientes mediante conductores externos verificados, con seguro incluido y panel de control en tiempo real.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo funciona la recogida de vehículos con Mecanu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El taller crea un traslado en el panel de Mecanu indicando la dirección del cliente y la ventana horaria preferida (franjas de 1 hora). Un conductor verificado recoge el vehículo, lo fotografía, solicita la firma digital del cliente y lo entrega en el taller. El taller ve el estado en tiempo real.",
      },
    },
    {
      "@type": "Question",
      name: "¿Mecanu es una alternativa a las grúas para talleres?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Mecanu reemplaza el uso de grúas caras y lentas para mover coches funcionales entre el domicilio del cliente y el taller. No es un servicio de asistencia en carretera: es logística de vehículos programada para talleres.",
      },
    },
    {
      "@type": "Question",
      name: "¿En qué ciudades opera Mecanu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mecanu opera actualmente en Madrid y Barcelona, con presencia en proceso en Londres, São Paulo, San Francisco y Nueva York.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué seguro cubre los traslados de Mecanu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cada traslado coordinado a través de Mecanu incluye cobertura de responsabilidad civil específica para el vehículo durante el trayecto, activa desde que el conductor recoge las llaves hasta que el cliente firma la entrega.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo usar Mecanu sin contratar conductores propios?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Mecanu funciona con conductores externos verificados que se activan bajo demanda. El taller no necesita contratar personal fijo — solo paga por los traslados realizados.",
      },
    },
    {
      "@type": "Question",
      name: "¿Mecanu sirve para talleres pequeños o solo para grandes cadenas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mecanu está diseñado para talleres independientes y medianos. Un taller que hace entre 5 y 50 traslados a la semana obtiene el mayor beneficio. También funciona para cadenas multimarca.",
      },
    },
  ],
};

const localBusinesses = [
  {
    city: "Madrid",
    postalCode: "28001",
    addressRegion: "Comunidad de Madrid",
    addressCountry: "ES",
    lat: 40.4168,
    lng: -3.7038,
    keywords: "taller mecánico Madrid, grúa coches Madrid, mecánico a domicilio Madrid, recogida coches Madrid, escáner automotriz Madrid",
  },
  {
    city: "Barcelona",
    postalCode: "08001",
    addressRegion: "Cataluña",
    addressCountry: "ES",
    lat: 41.3851,
    lng: 2.1734,
    keywords: "taller mecánico Barcelona, grúa coches Barcelona, mecánico a domicilio Barcelona, recogida coches Barcelona, escáner automotriz Barcelona, taller Barcelona, servicio automotriz Barcelona",
  },
  {
    city: "London",
    postalCode: "EC1A 1BB",
    addressRegion: "England",
    addressCountry: "GB",
    lat: 51.5074,
    lng: -0.1278,
    keywords: "auto repair London, car collection delivery London, vehicle logistics London, best mechanic London",
  },
];

const itemList = {
  "@type": "ItemList",
  name: "Ciudades donde opera Mecanu",
  itemListElement: localBusinesses.map((lb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "LocalBusiness",
      "@id": `${SITE}/#localbusiness-${lb.city.toLowerCase()}`,
      name: `Mecanu — ${lb.city}`,
      description: `Servicio de recogida y entrega de vehículos para talleres mecánicos en ${lb.city}. ${lb.keywords}`,
      url: SITE,
      address: {
        "@type": "PostalAddress",
        addressLocality: lb.city,
        postalCode: lb.postalCode,
        addressRegion: lb.addressRegion,
        addressCountry: lb.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: lb.lat,
        longitude: lb.lng,
      },
      priceRange: "€€",
      servesCuisine: undefined,
      hasMap: `https://www.google.com/maps/search/?api=1&query=${lb.lat},${lb.lng}`,
    },
  })),
};

const graph = [founder, organization, website, softwareApp, faqPage, itemList];

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}

/** JSON-LD para una entrada de blog */
export function BlogPostJsonLd({
  title,
  description,
  slug,
  publishedAt,
  authorName,
  image,
}: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  authorName: string;
  image: string;
}) {
  const url = `${SITE}/blog/${slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: title,
    description,
    url,
    datePublished: publishedAt,
    dateModified: publishedAt,
    image: image.startsWith("http") ? image : `${SITE}${image}`,
    author: {
      "@type": "Person",
      name: authorName,
      url: `${SITE}/blog/author/${authorName.toLowerCase().split(" ")[0]}`,
    },
    publisher: {
      "@id": `${SITE}/#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    inLanguage: "es-ES",
    isPartOf: {
      "@type": "Blog",
      "@id": `${SITE}/blog#blog`,
      name: "Blog Mecanu",
      publisher: { "@id": `${SITE}/#organization` },
    },
    keywords: [
      "taller mecánico", "logística vehículos", "recogida coches",
      "Mecanu", "conductores externos", "grúa alternativa",
      title,
    ].join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** JSON-LD para páginas de ciudad (LocalBusiness + Service) */
export function CityPageJsonLd({
  city,
  slug,
  description,
  lat,
  lng,
  postalCode,
  addressRegion,
  addressCountry = "ES",
}: {
  city: string;
  slug: string;
  description: string;
  lat: number;
  lng: number;
  postalCode: string;
  addressRegion: string;
  addressCountry?: string;
}) {
  const url = `${SITE}/${slug}`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: `Mecanu — Recogida y entrega de vehículos para talleres en ${city}`,
        description,
        provider: { "@id": `${SITE}/#organization` },
        areaServed: {
          "@type": "City",
          name: city,
          address: { "@type": "PostalAddress", addressLocality: city, addressRegion, addressCountry },
        },
        url,
        serviceType: "Logística de vehículos",
        audience: { "@type": "BusinessAudience", audienceType: "Talleres mecánicos" },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE}/#localbusiness-${city.toLowerCase()}`,
        name: `Mecanu ${city}`,
        description,
        url,
        image: `${SITE}/og-image.png`,
        address: {
          "@type": "PostalAddress",
          addressLocality: city,
          postalCode,
          addressRegion,
          addressCountry,
        },
        geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
        priceRange: "€€",
        parentOrganization: { "@id": `${SITE}/#organization` },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** JSON-LD para la página de perfil de autor */
export function AuthorJsonLd({ name, bio, slug }: { name: string; bio: string; slug: string }) {
  const url = `${SITE}/blog/author/${slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name,
    description: bio,
    url,
    worksFor: { "@id": `${SITE}/#organization` },
    sameAs: [`${SITE}/blog/author/${slug}`],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
