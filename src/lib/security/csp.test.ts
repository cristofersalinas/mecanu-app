import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "./csp";

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

  it("deja pasar el mapa de la landing", () => {
    expect(prod).toContain("basemaps.cartocdn.com");
    expect(prod).toContain("demotiles.maplibre.org");
  });

  it("no permite embeber la página en un iframe ajeno", () => {
    expect(prod).toContain("frame-ancestors 'none'");
  });

  it("permite el iframe de GTM y de Facebook (píxel), no un embed ajeno", () => {
    expect(prod).toContain("frame-src https://www.googletagmanager.com https://www.facebook.com");
    expect(prod).toContain("frame-ancestors 'none'");
    expect(prod).not.toContain("kapso.ai");
  });

  it("unsafe-eval solo en desarrollo", () => {
    expect(dev).toContain("unsafe-eval");
    expect(prod).not.toContain("unsafe-eval");
  });
});
