import { describe, expect, it } from "vitest";
import {
  localeFromCookieHeader,
  localeFromGeoHeaders,
  localeFromPathname,
  preferredLocaleFromRequest,
} from "./locales";

function geo(country?: string, region?: string): Headers {
  const headers = new Headers();
  if (country) headers.set("x-vercel-ip-country", country);
  if (region) headers.set("x-vercel-ip-country-region", region);
  return headers;
}

describe("localeFromGeoHeaders", () => {
  it("pone Catalunya entera en catalán, incluida Barcelona", () => {
    expect(localeFromGeoHeaders(geo("ES", "CT"))).toBe("ca");
    expect(localeFromGeoHeaders(geo("es", "es-ct"))).toBe("ca");
  });

  it("deja el resto de España y toda Latinoamérica en español", () => {
    expect(localeFromGeoHeaders(geo("ES", "MD"))).toBe("es");
    expect(localeFromGeoHeaders(geo("MX"))).toBe("es");
    expect(localeFromGeoHeaders(geo("AR"))).toBe("es");
    expect(localeFromGeoHeaders(geo("BR"))).toBe("es");
  });

  it("usa portugués en Portugal", () => {
    expect(localeFromGeoHeaders(geo("PT"))).toBe("pt");
  });

  it("usa inglés en los países anglófonos definidos", () => {
    for (const country of ["US", "GB", "IE", "CA", "AU", "NZ"]) {
      expect(localeFromGeoHeaders(geo(country))).toBe("en");
    }
  });

  it("hace fallback a español sin cabeceras o con un país no definido", () => {
    expect(localeFromGeoHeaders(geo())).toBe("es");
    expect(localeFromGeoHeaders(geo("DE"))).toBe("es");
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
  it("prioriza siempre la elección manual sobre la IP", () => {
    expect(preferredLocaleFromRequest(geo("ES", "CT"), "mecanu_locale=en")).toBe("en");
    expect(preferredLocaleFromRequest(geo("US"), "mecanu_locale=pt")).toBe("pt");
  });

  it("usa la ubicación si no hay una elección manual válida", () => {
    expect(preferredLocaleFromRequest(geo("PT"), "")).toBe("pt");
    expect(preferredLocaleFromRequest(geo("ES", "CT"), "mecanu_locale=xx")).toBe("ca");
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
