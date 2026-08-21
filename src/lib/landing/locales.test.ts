import { describe, expect, it } from "vitest";
import {
  localeFromAcceptLanguage,
  localeFromCookieHeader,
  localeFromPathname,
  preferredLocaleFromRequest,
} from "./locales";

function conAccept(acceptLanguage?: string): Headers {
  const headers = new Headers();
  if (acceptLanguage) headers.set("accept-language", acceptLanguage);
  return headers;
}

describe("localeFromAcceptLanguage", () => {
  it("elige el primer idioma soportado respetando q", () => {
    expect(localeFromAcceptLanguage("ca-ES,ca;q=0.9,es;q=0.8")).toBe("ca");
    expect(localeFromAcceptLanguage("es-ES,es;q=0.9,ca;q=0.8")).toBe("es");
    expect(localeFromAcceptLanguage("en-US,en;q=0.9")).toBe("en");
    expect(localeFromAcceptLanguage("pt-PT,pt;q=0.9,en;q=0.8")).toBe("pt");
  });

  it("prioriza por calidad aunque el orden del header diga otra cosa", () => {
    expect(localeFromAcceptLanguage("es;q=0.5,ca;q=0.9")).toBe("ca");
    expect(localeFromAcceptLanguage("en;q=0.2,pt-BR;q=0.8")).toBe("pt");
  });

  it("hace fallback a español sin cabecera o sin coincidencia", () => {
    expect(localeFromAcceptLanguage(undefined)).toBe("es");
    expect(localeFromAcceptLanguage("")).toBe("es");
    expect(localeFromAcceptLanguage("de-DE,de;q=0.9,fr;q=0.8")).toBe("es");
    expect(localeFromAcceptLanguage("*")).toBe("es");
  });
});

describe("localeFromCookieHeader", () => {
  it("lee la elección manual y tolera cookies vecinas", () => {
    expect(localeFromCookieHeader("otra=1; mecanu_locale=ca; tema=claro")).toBe("ca");
    expect(localeFromCookieHeader("mecanu_locale=%65%6e")).toBe("en");
  });

  it("ignora una cookie ausente o inválida", () => {
    expect(localeFromCookieHeader("otra=1")).toBeNull();
    expect(localeFromCookieHeader("mecanu_locale=xx")).toBeNull();
    expect(localeFromCookieHeader("mecanu_locale=%")).toBeNull();
  });
});

describe("preferredLocaleFromRequest", () => {
  it("prioriza siempre la elección manual sobre Accept-Language", () => {
    expect(preferredLocaleFromRequest(conAccept("ca"), "mecanu_locale=en")).toBe("en");
    expect(preferredLocaleFromRequest(conAccept("en-US"), "mecanu_locale=pt")).toBe("pt");
  });

  it("usa Accept-Language si no hay una elección manual válida", () => {
    expect(preferredLocaleFromRequest(conAccept("pt-PT,pt;q=0.9"), "")).toBe("pt");
    expect(preferredLocaleFromRequest(conAccept("ca-ES"), "mecanu_locale=xx")).toBe("ca");
  });
});

describe("localeFromPathname", () => {
  it("mantiene las rutas explícitas por encima de cualquier detección", () => {
    expect(localeFromPathname("/ca")).toBe("ca");
    expect(localeFromPathname("/en/")).toBe("en");
    expect(localeFromPathname("/pt/recursos")).toBe("pt");
    expect(localeFromPathname("/")).toBe("es");
  });
});
