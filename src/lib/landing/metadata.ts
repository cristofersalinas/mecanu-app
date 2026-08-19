import type { Metadata } from "next";
import { copyFor } from "./copy";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, pathFor, type Locale } from "./locales";
import { SITE_URL, absoluteUrl } from "./site";

/** Imagen social compartida por los cuatro idiomas. El texto que lleva encima
 *  es la marca, no copy traducible, así que no se duplica por idioma. */
const OG_IMAGE = {
  url: absoluteUrl("/landing/hero-calle.jpg"),
  width: 1200,
  height: 630,
};

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
      locale: LOCALE_META[locale].htmlLang.replace("-", "_"),
      alternateLocale: LOCALES.filter((id) => id !== locale).map((id) =>
        LOCALE_META[id].htmlLang.replace("-", "_"),
      ),
      title: copy.meta.title,
      description: copy.meta.description,
      url: absoluteUrl(pathFor(locale)),
      type: "website",
      images: [{ ...OG_IMAGE, alt: copy.hero.photoAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.meta.title,
      description: copy.meta.description,
      images: [{ ...OG_IMAGE, alt: copy.hero.photoAlt }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}
