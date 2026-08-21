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
 * Primer idioma soportado según Accept-Language (RFC 7231). Preferimos esto a
 * la IP: refleja la preferencia del visitante (p. ej. catalán o inglés en ES)
 * y funciona igual en local y en Vercel. Sin cabecera o sin coincidencia → es.
 */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;

  const candidatos = header
    .split(",")
    .map((parte) => {
      const [tagRaw, ...params] = parte.trim().split(";");
      const tag = tagRaw?.trim().toLowerCase() ?? "";
      let q = 1;
      for (const param of params) {
        const [clave, valor] = param.trim().split("=");
        if (clave === "q" && valor != null) {
          const n = Number(valor);
          if (!Number.isNaN(n)) q = n;
        }
      }
      return { tag, q };
    })
    .filter((c) => c.tag.length > 0 && c.tag !== "*" && c.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of candidatos) {
    const primario = tag.split("-")[0] ?? "";
    if (isLocale(primario)) return primario;
  }

  return DEFAULT_LOCALE;
}

/**
 * La elección manual gana a Accept-Language. Se toleran espacios, valores
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
  return localeFromCookieHeader(cookieHeader) ?? localeFromAcceptLanguage(headers.get("accept-language"));
}
