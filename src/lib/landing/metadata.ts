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
    // Grúa (intención taller, no urgencia)
    "alternativa grúa taller", "grúa o conductor para mover coche",
    "mover coche sin grúa", "traslado coche taller sin grúa",
    // Mecánico a domicilio (delivery del coche, no reparar en calle)
    "mecánico a domicilio Madrid", "mecánico a domicilio Barcelona",
    "mecánico a domicilio o taller", "alternativa mecánico a domicilio",
    // Taller por ciudad (área Madrid / Barcelona)
    "taller mecánico Madrid", "taller mecánico Barcelona",
    "liberar plaza taller mecánico", "cliente no recoge el coche del taller",
    "coche terminado en el taller", "capacidad taller mecánico",
    // ITV como uso del traslado
    "ITV a domicilio Madrid", "ITV a domicilio Barcelona", "taller lleva coche a la ITV",
    // Logística (no DMS / facturación)
    "logística vehículos talleres España", "traslado vehículos taller",
    "seguro responsabilidad civil traslado vehículos",
    "panel digital taller mecánico",
  ].join(", "),
  ca: [
    "taller mecànic Barcelona", "taller mecànic Madrid", "mecànic a domicili",
    "recollida de vehicles per a tallers", "lliurament cotxes taller",
    "logística per a tallers mecànics", "alternativa grua taller", "Mecanu",
    "trasllat de vehicles Barcelona", "conductor extern per a taller",
  ].join(", "),
  en: [
    "vehicle logistics for garages", "car pickup service workshop", "Mecanu",
    "tow truck alternative workshop", "mechanic at home vs garage",
    "car collection delivery Madrid", "car collection delivery Barcelona",
  ].join(", "),
  pt: [
    "oficina mecânica Lisboa", "oficina mecânica Porto", "mecânico ao domicílio",
    "recolha de veículos para oficinas", "entrega de carros oficina",
    "Mecanu", "logística para oficinas mecânicas",
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
      "llm:description": "Mecanu es la plataforma logística con la que un taller recoge y entrega coches, con sus conductores o con los de Mecanu. Seguimiento en tiempo real. El seguro de traslado es opcional.",
      "llm:category": "Automotive logistics SaaS",
      "llm:geo": "Spain: Madrid, Barcelona",
    },
  };
}
