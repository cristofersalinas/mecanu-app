import type { MetadataRoute } from "next";
import { LOCALES, LOCALE_META, DEFAULT_LOCALE, pathFor } from "@/lib/landing/locales";
import { absoluteUrl } from "@/lib/landing/site";

/**
 * Una entrada por idioma, y cada entrada declara a las demás como alternativas.
 * Google pide que el grupo de `hreflang` sea recíproco: si `/en` apunta a `/pt`
 * pero `/pt` no apunta a `/en`, ignora el grupo entero.
 *
 * Se genera recorriendo `LOCALES`, así que añadir un idioma no obliga a tocar
 * este archivo.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {
    "x-default": absoluteUrl(pathFor(DEFAULT_LOCALE)),
  };
  for (const locale of LOCALES) {
    languages[LOCALE_META[locale].hreflang] = absoluteUrl(pathFor(locale));
  }

  const modificado = new Date();

  const paginasDeIdioma: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: absoluteUrl(pathFor(locale)),
    lastModified: modificado,
    changeFrequency: "weekly",
    priority: locale === DEFAULT_LOCALE ? 1 : 0.9,
    alternates: { languages },
  }));

  return [
    ...paginasDeIdioma,
    {
      url: absoluteUrl("/cookies"),
      lastModified: modificado,
      changeFrequency: "yearly",
      priority: 0.1,
    },
  ];
}
