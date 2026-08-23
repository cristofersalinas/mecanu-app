import { describe, expect, it } from "vitest";
import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  consentCookieHeader,
  consentDenegar,
  consentPersonalizado,
  consentTodas,
  hayAnalitica,
  hayPublicidad,
  parseConsent,
  readConsentFromCookieString,
} from "./consent";

describe("parseConsent", () => {
  it("acepta analítica y publicidad por separado en v2", () => {
    expect(
      parseConsent(JSON.stringify({ analitica: true, publicidad: false, version: 2 })),
    ).toEqual({ analitica: true, publicidad: false, version: 2 });
    expect(
      parseConsent(JSON.stringify({ analitica: false, publicidad: true, version: 2 })),
    ).toEqual({ analitica: false, publicidad: true, version: 2 });
  });

  it("nunca trata basura, v1 ni un sí a medias como concedido", () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent("")).toBeNull();
    expect(parseConsent("granted")).toBeNull();
    expect(parseConsent("{")).toBeNull();
    expect(parseConsent(JSON.stringify({ analitica: true, version: 1 }))).toBeNull();
    expect(parseConsent(JSON.stringify({ analitica: true, publicidad: true, version: 1 }))).toBeNull();
    expect(parseConsent(JSON.stringify({ analitica: "true", publicidad: false, version: 2 }))).toBeNull();
    expect(parseConsent(JSON.stringify({ analitica: true, version: 2 }))).toBeNull();
  });
});

describe("presets", () => {
  it("denegar es solo esenciales; todas enciende medición y ads", () => {
    expect(consentDenegar()).toEqual({ version: CONSENT_VERSION, analitica: false, publicidad: false });
    expect(consentTodas()).toEqual({ version: CONSENT_VERSION, analitica: true, publicidad: true });
    const mixto = consentPersonalizado(true, false);
    expect(hayAnalitica(mixto)).toBe(true);
    expect(hayPublicidad(mixto)).toBe(false);
    expect(hayAnalitica(consentDenegar())).toBe(false);
    expect(hayPublicidad(consentDenegar())).toBe(false);
  });
});

describe("readConsentFromCookieString", () => {
  it("lee mecanu_consent y ignora el resto", () => {
    const valor = encodeURIComponent(
      JSON.stringify({ analitica: true, publicidad: false, version: 2 }),
    );
    expect(
      readConsentFromCookieString(`otro=1; ${CONSENT_COOKIE}=${valor}; tema=oscuro`),
    ).toEqual({ analitica: true, publicidad: false, version: 2 });
  });

  it("devuelve null si la cookie no está o no se entiende", () => {
    expect(readConsentFromCookieString("otro=1")).toBeNull();
    expect(readConsentFromCookieString(`${CONSENT_COOKIE}=no-es-json`)).toBeNull();
  });
});

describe("consentCookieHeader", () => {
  it("escribe Path=/, SameSite=Lax y un año", () => {
    const header = consentCookieHeader(consentDenegar());
    expect(header).toContain(`${CONSENT_COOKIE}=`);
    expect(header).toContain("Path=/");
    expect(header).toContain("SameSite=Lax");
    expect(header).toContain("Max-Age=31536000");
    expect(parseConsent(decodeURIComponent(header.split(";")[0].split("=")[1]))).toEqual({
      analitica: false,
      publicidad: false,
      version: 2,
    });
  });
});
