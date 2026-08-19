export const LOCALES = ["es", "en", "pt"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_META: Record<
  Locale,
  { htmlLang: string; hreflang: string; name: string; nativeName: string }
> = {
  es: { htmlLang: "es-ES", hreflang: "es-ES", name: "Spanish", nativeName: "Español" },
  en: { htmlLang: "en", hreflang: "en", name: "English", nativeName: "English" },
  pt: { htmlLang: "pt-PT", hreflang: "pt-PT", name: "Portuguese", nativeName: "Português" },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "es" || value === "en" || value === "pt";
}

export function pathFor(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
}

export function localeFromPathname(pathname: string): Locale {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/pt" || pathname.startsWith("/pt/")) return "pt";
  return DEFAULT_LOCALE;
}

export const LOCALE_COOKIE = "mecanu_locale";
