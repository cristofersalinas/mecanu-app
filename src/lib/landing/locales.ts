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

export function contactoPathFor(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/contacto" : `/${locale}/contacto`;
}

export function localeFromPathname(pathname: string): Locale {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) return locale;
  }
  return DEFAULT_LOCALE;
}

export const LOCALE_COOKIE = "mecanu_locale";

/**
 * Países donde el inglés es el idioma principal del público al que apuntamos.
 * La lista es deliberadamente explícita: el país puede tener inglés como
 * idioma oficial sin que sea la opción más natural para todo su público.
 */
export const ENGLISH_COUNTRIES = ["AU", "CA", "GB", "IE", "NZ", "US"] as const;
const ENGLISH_COUNTRY_SET = new Set<string>(ENGLISH_COUNTRIES);

/**
 * Elige idioma sin tocar el navegador. Vercel adjunta estas cabeceras en el
 * servidor; en local no están y el fallback seguro es español.
 *
 * `x-vercel-ip-country-region` es el tramo regional de ISO 3166-2: Catalunya
 * es `CT` dentro de España (`ES-CT`).
 */
export function localeFromGeoHeaders(headers: Headers): Locale {
  const country = headers.get("x-vercel-ip-country")?.trim().toUpperCase() ?? "";
  const region = headers.get("x-vercel-ip-country-region")?.trim().toUpperCase() ?? "";

  if (country === "ES" && (region === "CT" || region === "ES-CT")) return "ca";
  if (country === "PT") return "pt";
  if (ENGLISH_COUNTRY_SET.has(country)) return "en";
  return DEFAULT_LOCALE;
}

/**
 * La elección manual gana a la geolocalización. Se toleran espacios, valores
 * URL-encoded y cookies mal formadas sin convertirlas en una redirección.
 */
export function localeFromCookieHeader(cookieHeader: string | null | undefined): Locale | null {
  if (!cookieHeader) return null;

  for (const fragmento of cookieHeader.split(";")) {
    const [nombre, ...resto] = fragmento.trim().split("=");
    if (nombre !== LOCALE_COOKIE || resto.length === 0) continue;

    try {
      const valor = decodeURIComponent(resto.join("=")).trim();
      return isLocale(valor) ? valor : null;
    } catch {
      return null;
    }
  }

  return null;
}

export function preferredLocaleFromRequest(
  headers: Headers,
  cookieHeader: string | null | undefined,
): Locale {
  return localeFromCookieHeader(cookieHeader) ?? localeFromGeoHeaders(headers);
}
