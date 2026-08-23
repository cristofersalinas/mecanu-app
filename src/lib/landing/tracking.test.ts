import { describe, expect, it } from "vitest";
import {
  contextoPagina,
  dispositivoDesdeUA,
  esRutaPublicaMedible,
  eventoGenerateLead,
  eventoMetaLead,
  eventoMetaPageView,
  eventoPageView,
  metaPixelSnippet,
  payloadConsentMode,
} from "./tracking";

describe("payloadConsentMode", () => {
  it("concede ads solo si hay publicidad, analítica por su lado", () => {
    expect(payloadConsentMode({ analitica: true, publicidad: false })).toEqual({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    expect(payloadConsentMode({ analitica: false, publicidad: true })).toEqual({
      analytics_storage: "denied",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  });
});

describe("dispositivoDesdeUA", () => {
  it("detecta iPhone aunque el UA mencione Mac OS X", () => {
    const iphone =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    expect(dispositivoDesdeUA(iphone)).toEqual({
      device: "iPhone",
      operating_system: "iOS",
      device_category: "mobile",
    });
  });

  it("distingue iPad, Android y escritorio", () => {
    expect(dispositivoDesdeUA("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toMatchObject({
      device: "iPad",
      device_category: "tablet",
    });
    expect(dispositivoDesdeUA("Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile")).toEqual({
      device: "Android",
      operating_system: "Android",
      device_category: "mobile",
    });
    expect(dispositivoDesdeUA("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toEqual({
      device: "desktop",
      operating_system: "macOS",
      device_category: "desktop",
    });
  });
});

describe("eventos GA4 y Meta", () => {
  const ctx = contextoPagina({
    href: "https://mecanu.com/madrid",
    title: "Traslados Madrid",
    referrer: "https://google.com/",
    language: "es",
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
  });

  it("page_view lleva dispositivo e idioma al estilo GA4", () => {
    expect(eventoPageView(ctx)).toMatchObject({
      event: "page_view",
      page_location: "https://mecanu.com/madrid",
      page_title: "Traslados Madrid",
      language: "es",
      device: "iPhone",
      operating_system: "iOS",
      device_category: "mobile",
    });
    expect(eventoPageView(ctx)).not.toHaveProperty("hero_ab");
  });

  it("PageView y Lead usan el catálogo de Meta", () => {
    expect(eventoMetaPageView(ctx)).toEqual({ event: "PageView", content_name: "Traslados Madrid" });
    expect(eventoMetaLead("contacto")).toEqual({
      event: "Lead",
      content_name: "contacto_taller",
      content_category: "lead",
    });
    expect(eventoGenerateLead("itv")).toEqual({
      event: "generate_lead",
      lead_type: "itv",
      currency: "EUR",
    });
  });
});

describe("esRutaPublicaMedible", () => {
  it("no mide panel, conductor ni backoffice", () => {
    expect(esRutaPublicaMedible("/")).toBe(true);
    expect(esRutaPublicaMedible("/madrid")).toBe(true);
    expect(esRutaPublicaMedible("/panel")).toBe(false);
    expect(esRutaPublicaMedible("/conductor/hoy")).toBe(false);
    expect(esRutaPublicaMedible("/backoffice")).toBe(false);
  });
});

describe("metaPixelSnippet", () => {
  it("es el snippet oficial con consent grant e init", () => {
    const snippet = metaPixelSnippet("1234567890");
    expect(snippet).toContain("https://connect.facebook.net/en_US/fbevents.js");
    expect(snippet).toContain("fbq('init','1234567890')");
    expect(snippet).toContain("fbq('consent','grant')");
    expect(snippet.match(/1234567890/g)).toHaveLength(1);
  });
});
