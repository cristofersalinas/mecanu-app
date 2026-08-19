import type { Metadata } from "next";
import { copyFor } from "./copy";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, pathFor, type Locale } from "./locales";
import { SITE_URL, absoluteUrl } from "./site";

/**
 * Tarjeta de vista previa, una por idioma, generada por
 * `scripts/generar-og.mjs`.
 *
 * Las medidas tienen que coincidir con el archivo de verdad. Antes esto
 * apuntaba a la foto del héroe, que es 1024x765, mientras declaraba 1200x630:
 * WhatsApp se fía de lo declarado para decidir el hueco y recortaba mal.
 *
 * 1200x630 es lo que esperan WhatsApp, LinkedIn, Slack y Telegram. Cada archivo
 * pesa menos de 50 KB, holgadamente por debajo del límite a partir del cual
 * WhatsApp deja de mostrar la imagen grande.
 */
function ogImage(locale: Locale, alt: string) {
  return {
    url: absoluteUrl(`/og/${locale}.png`),
    width: 1200,
    height: 630,
    type: "image/png",
    alt,
  };
}

export function landingMetadata(locale: Locale): Metadata {
  const copy = copyFor(locale);

  // Grupo recíproco de hreflang: cada idioma declara a todos, incluido él
  // mismo, más el x-default que apunta al idioma por defecto.
  const languages: Record<string, string> = {
    "x-default": absoluteUrl(pathFor(DEFAULT_LOCALE)),
  };
  for (const id of LOCALES) {
    languages[LOCALE_META[id].hreflang] = absoluteUrl(pathFor(id));
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: {
      canonical: pathFor(locale),
      languages,
    },
    openGraph: {
      siteName: "Mecanu",
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((id) => id !== locale).map((id) => LOCALE_META[id].ogLocale),
      title: copy.meta.title,
      description: copy.meta.description,
      url: absoluteUrl(pathFor(locale)),
      type: "website",
      images: [ogImage(locale, copy.hero.headline)],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.meta.title,
      description: copy.meta.description,
      images: [ogImage(locale, copy.hero.headline)],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}
