import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, permissionsPolicyPortal } from "./csp";

describe("contentSecurityPolicy", () => {
  const prod = contentSecurityPolicy({ desarrollo: false });
  const dev = contentSecurityPolicy({ desarrollo: true });

  it("no hardcodea ningún puerto de localhost", () => {
    expect(prod).not.toMatch(/localhost:\d+/);
    expect(dev).not.toMatch(/localhost:\d+/);
  });

  it("deja pasar GTM, GA4, Clarity, Vercel Analytics y píxeles de ads", () => {
    for (const origen of [
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://www.clarity.ms",
      "https://va.vercel-scripts.com",
      "https://connect.facebook.net",
      "https://www.googleadservices.com",
    ]) {
      expect(prod).toContain(origen);
    }
  });

  it("deja pasar el websocket Realtime de Supabase", () => {
    expect(prod).toContain("https://*.supabase.co");
    expect(prod).toContain("wss://*.supabase.co");
  });

  it("no permite embeber la página en un iframe ajeno", () => {
    expect(prod).toContain("frame-ancestors 'none'");
  });

  it("deja pasar GTM, Facebook y los iframes de Kapso", () => {
    expect(prod).toContain("https://www.googletagmanager.com");
    expect(prod).toContain("https://www.facebook.com");
    expect(prod).toContain("https://inbox.kapso.ai");
    expect(prod).toContain("https://app.kapso.ai");
    expect(prod).toContain("frame-src");
    expect(prod).toContain("frame-ancestors 'none'");
  });

  it("unsafe-eval solo en desarrollo", () => {
    expect(dev).toContain("unsafe-eval");
    expect(prod).not.toContain("unsafe-eval");
  });
});

describe("permissionsPolicyPortal", () => {
  it("permite geolocation, cámara y micrófono en conductor", () => {
    const p = permissionsPolicyPortal("conductor");
    expect(p).toContain("geolocation=(self)");
    expect(p).toContain("camera=(self)");
    expect(p).toContain("microphone=(self)");
  });

  it("deniega geolocation, cámara y micrófono fuera de conductor", () => {
    const p = permissionsPolicyPortal("default");
    expect(p).toContain("geolocation=()");
    expect(p).toContain("camera=()");
    expect(p).toContain("microphone=()");
  });
});
