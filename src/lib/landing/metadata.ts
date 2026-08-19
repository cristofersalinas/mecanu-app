import type { Metadata } from "next";
import { copyFor } from "./copy";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, pathFor, type Locale } from "./locales";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mecanu.com";

export function landingMetadata(locale: Locale): Metadata {
  const copy = copyFor(locale);
  const languages: Record<string, string> = { "x-default": new URL(pathFor(DEFAULT_LOCALE), SITE).href };
  for (const id of LOCALES) {
    languages[LOCALE_META[id].hreflang] = new URL(pathFor(id), SITE).href;
  }

  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: {
      canonical: pathFor(locale),
      languages,
    },
    openGraph: {
      locale: LOCALE_META[locale].htmlLang.replace("-", "_"),
      alternateLocale: LOCALES.filter((id) => id !== locale).map((id) =>
        LOCALE_META[id].htmlLang.replace("-", "_"),
      ),
      title: copy.meta.title,
      description: copy.meta.description,
      url: pathFor(locale),
      type: "website",
    },
  };
}
