import { describe, expect, it } from "vitest";
import {
  CONSENT_VERSION,
  DENIED_ALL,
  GRANTED_ALL,
  consentCookieValue,
  consentModeSignals,
  parseConsent,
  puedeCargarAnalitica,
  puedeCargarMarketing,
  readConsentFromCookieString,
  serializeConsent,
} from "./consent";

/**
 * Estas pruebas cubren la puerta legal: si `puedeCargarAnalitica` devolviera
 * `true` sin consentimiento explícito, GA4 y Clarity cargarían y eso es un
 * incumplimiento del RGPD en producción, no un bug cosmético.
 */
describe("estado por defecto", () => {
  it("deniega todo salvo seguridad antes de que el usuario decida", () => {
    expect(consentModeSignals(DENIED_ALL)).toEqual({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
    });
  });

  it("no permite analítica ni marketing sin preferencia guardada", () => {
    expect(puedeCargarAnalitica(null)).toBe(false);
    expect(puedeCargarMarketing(null)).toBe(false);
  });
});

describe("aceptar y rechazar", () => {
  it("concede analítica solo cuando el usuario la acepta", () => {
    expect(puedeCargarAnalitica(GRANTED_ALL)).toBe(true);
    expect(puedeCargarAnalitica(DENIED_ALL)).toBe(false);
  });

  it("aceptar solo analítica no concede marketing", () => {
    const soloAnalitica = { analitica: true, marketing: false };
    expect(puedeCargarAnalitica(soloAnalitica)).toBe(true);
    expect(puedeCargarMarketing(soloAnalitica)).toBe(false);
    expect(consentModeSignals(soloAnalitica).ad_storage).toBe("denied");
    expect(consentModeSignals(soloAnalitica).analytics_storage).toBe("granted");
  });
});

describe("persistencia entre visitas", () => {
  it("recupera lo guardado", () => {
    const guardado = serializeConsent({ analitica: true, marketing: false });
    expect(parseConsent(guardado)).toEqual({ analitica: true, marketing: false });
  });

  it("deja constancia de la fecha, que el RGPD exige poder demostrar", () => {
    const guardado = JSON.parse(serializeConsent(GRANTED_ALL));
    expect(typeof guardado.fecha).toBe("string");
    expect(Number.isNaN(Date.parse(guardado.fecha))).toBe(false);
  });

  it("lee la cookie entre otras cookies", () => {
    const cookie = consentCookieValue(GRANTED_ALL).split(";")[0];
    const todas = `mecanu_locale=ca; ${cookie}; otra=1`;
    expect(readConsentFromCookieString(todas)).toEqual(GRANTED_ALL);
  });
});

describe("ante la duda, vuelve a preguntar", () => {
  it.each([
    ["sin cookie", null],
    ["cadena vacía", ""],
    ["JSON corrupto", "{no-es-json"],
    ["JSON que no es objeto", '"cadena"'],
    ["sin el campo analitica", JSON.stringify({ marketing: true, version: CONSENT_VERSION })],
    ["analitica no booleana", JSON.stringify({ analitica: "sí", marketing: false, version: CONSENT_VERSION })],
    ["versión anterior", JSON.stringify({ analitica: true, marketing: true, version: CONSENT_VERSION - 1 })],
  ])("devuelve null con %s", (_caso, valor) => {
    expect(parseConsent(valor)).toBeNull();
  });

  it("null significa preguntar, nunca cargar", () => {
    expect(puedeCargarAnalitica(parseConsent("{corrupto"))).toBe(false);
  });
});
