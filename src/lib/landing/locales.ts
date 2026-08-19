/**
 * El orden de `LOCALES` es el orden en que salen en el desplegable de idioma:
 * español, català, English y después el resto. Es una decisión de producto, no
 * alfabética — no la reordenes sin preguntar.
 */
export const LOCALES = ["es", "ca", "en", "pt"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_META: Record<
  Locale,
  { htmlLang: string; hreflang: string; name: string; nativeName: string }
> = {
  es: { htmlLang: "es-ES", hreflang: "es-ES", name: "Spanish", nativeName: "Español" },
  ca: { htmlLang: "ca-ES", hreflang: "ca-ES", name: "Catalan", nativeName: "Català" },
  en: { htmlLang: "en", hreflang: "en", name: "English", nativeName: "English" },
  pt: { htmlLang: "pt-PT", hreflang: "pt-PT", name: "Portuguese", nativeName: "Português" },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function pathFor(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
}

export function localeFromPathname(pathname: string): Locale {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) return locale;
  }
  return DEFAULT_LOCALE;
}

export const LOCALE_COOKIE = "mecanu_locale";

/** Política de cookies del idioma: `/cookies`, `/ca/cookies`, `/en/cookies`… */
export function cookiesPathFor(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/cookies" : `/${locale}/cookies`;
}
