import type { Metadata } from "next";
import { copyFor } from "./copy";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, pathFor, type Locale } from "./locales";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mecanu.com";
const OG_IMAGE = `${SITE}/og-image.png`;

/** Keywords por idioma — incluyen long-tail local y semántica por ciudad */
const KEYWORDS: Record<Locale, string> = {
  es: [
    // Marca
    "Mecanu", "Mecanu taller", "Mecanu Madrid", "Mecanu Barcelona", "Mecanu logística",
    // Intención principal
    "recogida coches talleres Madrid", "recogida coches talleres Barcelona",
    "entrega vehículos taller mecánico Madrid", "entrega vehículos taller mecánico Barcelona",
    "recogida domicilio taller mecánico", "dejar coche en taller sin ir",
    "recoger coche taller a domicilio", "taller mecánico recoge el coche",
    // Conductor externo
    "conductor externo taller mecánico", "conductor externo Madrid", "conductor externo Barcelona",
    "conductor para taller mecánico España",
    // Grúa alternativa
    "grúa coches Madrid", "grúa coches Barcelona", "grúa particular Madrid",
    "grúa particular Barcelona", "alternativa grúa taller", "grúa alternativa taller mecánico",
    "grúa barata Madrid", "grúa barata Barcelona", "servicio grúa sin avería",
    // Mecánico a domicilio
    "mecánico a domicilio Madrid", "mecánico a domicilio Barcelona",
    "mecánico a domicilio España", "servicio mecánico domicilio",
    // Servicio automotriz por ciudad
    "servicio automotriz Madrid", "servicio automotriz Barcelona",
    "taller mecánico Madrid", "taller mecánico Barcelona", "taller mecánico Valencia",
    "mejor taller mecánico Madrid 2026", "mejor taller mecánico Barcelona 2026",
    "taller mecánico barato Madrid", "taller mecánico barato Barcelona",
    "taller multimarca Madrid", "taller multimarca Barcelona",
    // Escáner y diagnóstico
    "escáner automotriz Madrid", "escáner automotriz Barcelona",
    "escaner automotriz Madrid", "escaner automotriz Barcelona",
    "diagnóstico electrónico coche Madrid", "diagnóstico electrónico coche Barcelona",
    "diagnóstico OBD Madrid", "diagnóstico OBD Barcelona",
    // Mantenimiento por marca
    "mantenimiento Volkswagen Madrid", "mantenimiento BMW Madrid", "mantenimiento Toyota Madrid",
    "mantenimiento Renault Madrid", "mantenimiento Seat Madrid", "mantenimiento Peugeot Madrid",
    "mantenimiento Ford Madrid", "mantenimiento Audi Madrid", "mantenimiento Mercedes Madrid",
    "mantenimiento Volkswagen Barcelona", "mantenimiento BMW Barcelona",
    "mantenimiento Toyota Barcelona", "mantenimiento Renault Barcelona",
    // ITV y asistencia
    "ITV a domicilio Madrid", "ITV a domicilio Barcelona", "gestión ITV taller",
    "asistencia en carretera Madrid", "asistencia en carretera Barcelona",
    // Software y logística
    "software gestión taller mecánico", "panel digital taller mecánico",
    "logística vehículos talleres España", "logística automotriz B2B España",
    "liberar plaza taller mecánico", "traslado vehículos taller",
    "seguro responsabilidad civil traslado vehículos",
    // ITV y dolor operativo del dueño
    "ITV a domicilio Madrid", "ITV a domicilio Barcelona", "taller lleva coche a la ITV",
    "cliente no recoge el coche del taller", "coche terminado en el taller",
    // Software y herramientas que busca el dueño
    "software taller mecánico", "software gestión taller España", "DMS taller",
    "tempario taller", "WhatsApp taller mecánico", "programa facturación taller",
    // Marcas (intención del conductor que el taller quiere capturar)
    "mantenimiento Volkswagen Madrid", "mantenimiento BMW Barcelona",
    "taller independiente BMW garantía", "revisión Audi taller de confianza",
  ].join(", "),
  ca: [
    "taller mecànic Barcelona", "taller mecànic Madrid", "mecànic a domicili",
    "recollida de vehicles per a tallers", "lliurament cotxes taller",
    "servei automotriu Barcelona", "logística per a tallers mecànics",
    "grua alternativa taller", "Mecanu", "trasllat de vehicles Barcelona",
    "conductor extern per a taller", "manteniment cotxe a domicili",
    "escàner automotriu Barcelona", "millor taller mecànic Barcelona",
  ].join(", "),
  en: [
    "auto repair shop London", "car collection delivery service", "mechanic at home London",
    "car pickup service workshop", "vehicle logistics for garages", "Mecanu",
    "best auto repair shop London", "car diagnostics London", "MOT service London",
    "tow truck alternative London", "car recovery London", "car service pickup",
    "workshop management software", "vehicle collection delivery London",
    "auto repair San Francisco", "car repair New York", "auto shop logistics",
  ].join(", "),
  pt: [
    "oficina mecânica Lisboa", "oficina mecânica Porto", "mecânico ao domicílio",
    "recolha de veículos para oficinas", "entrega de carros oficina",
    "serviço automóvel Lisboa", "Mecanu", "diagnóstico carros Lisboa",
    "melhor oficina mecânica Lisboa", "logística para oficinas mecânicas",
  ].join(", "),
};

export function landingMetadata(locale: Locale): Metadata {
  const copy = copyFor(locale);
  const languages: Record<string, string> = {
    "x-default": new URL(pathFor(DEFAULT_LOCALE), SITE).href,
  };
  for (const id of LOCALES) {
    languages[LOCALE_META[id].hreflang] = new URL(pathFor(id), SITE).href;
  }

  const url = new URL(pathFor(locale), SITE).href;

  return {
    title: {
      default: copy.meta.title,
      template: "%s — Mecanu",
    },
    description: copy.meta.description,
    keywords: KEYWORDS[locale],
    authors: [{ name: "Mecanu", url: SITE }],
    creator: "Mecanu",
    publisher: "Mecanu",
    category: "Automotive, Workshop Logistics, B2B SaaS",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      type: "website",
      locale: LOCALE_META[locale].htmlLang.replace("-", "_"),
      alternateLocale: LOCALES.filter((id) => id !== locale).map((id) =>
        LOCALE_META[id].htmlLang.replace("-", "_"),
      ),
      title: copy.meta.title,
      description: copy.meta.description,
      url,
      siteName: "Mecanu",
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "Mecanu — Recogida y entrega de vehículos para talleres mecánicos",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.meta.title,
      description: copy.meta.description,
      images: [OG_IMAGE],
      creator: "@mecanuapp",
      site: "@mecanuapp",
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION ?? undefined,
    },
    other: {
      // Señales adicionales para rastreadores LLM (ChatGPT, Claude, Gemini)
      "llm:name": "Mecanu",
      "llm:description": "Mecanu es una plataforma B2B de logística de vehículos para talleres mecánicos. Coordina recogida, traslado y entrega de coches de clientes con conductores verificados, seguro incluido y panel de control en tiempo real.",
      "llm:category": "Automotive logistics SaaS",
      "llm:geo": "Spain: Madrid, Barcelona",
    },
  };
}
