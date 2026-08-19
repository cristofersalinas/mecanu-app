import { describe, expect, it } from "vitest";
import {
  CONSENT_COOKIE,
  consentCookieHeader,
  parseConsent,
  readConsentFromCookieString,
} from "./consent";

describe("parseConsent", () => {
  it("acepta un sí o un no de la versión actual", () => {
    expect(parseConsent(JSON.stringify({ analitica: true, version: 1 }))).toEqual({
      analitica: true,
      version: 1,
    });
    expect(parseConsent(JSON.stringify({ analitica: false, version: 1 }))).toEqual({
      analitica: false,
      version: 1,
    });
  });

  it("nunca trata basura, versiones viejas o un sí a medias como concedido", () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent("")).toBeNull();
    expect(parseConsent("granted")).toBeNull();
    expect(parseConsent("{")).toBeNull();
    expect(parseConsent(JSON.stringify({ analitica: true, version: 0 }))).toBeNull();
    expect(parseConsent(JSON.stringify({ analitica: "true", version: 1 }))).toBeNull();
    expect(parseConsent(JSON.stringify({ version: 1 }))).toBeNull();
  });
});

describe("readConsentFromCookieString", () => {
  it("lee mecanu_consent y ignora el resto", () => {
    const valor = encodeURIComponent(JSON.stringify({ analitica: true, version: 1 }));
    expect(
      readConsentFromCookieString(`otro=1; ${CONSENT_COOKIE}=${valor}; tema=oscuro`),
    ).toEqual({ analitica: true, version: 1 });
  });

  it("devuelve null si la cookie no está o no se entiende", () => {
    expect(readConsentFromCookieString("otro=1")).toBeNull();
    expect(readConsentFromCookieString(`${CONSENT_COOKIE}=no-es-json`)).toBeNull();
  });
});

describe("consentCookieHeader", () => {
  it("escribe Path=/, SameSite=Lax y un año", () => {
    const header = consentCookieHeader(false);
    expect(header).toContain(`${CONSENT_COOKIE}=`);
    expect(header).toContain("Path=/");
    expect(header).toContain("SameSite=Lax");
    expect(header).toContain("Max-Age=31536000");
    expect(parseConsent(decodeURIComponent(header.split(";")[0].split("=")[1]))).toEqual({
      analitica: false,
      version: 1,
    });
  });
});
