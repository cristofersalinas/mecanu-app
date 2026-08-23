import { describe, expect, it } from "vitest";
import {
  elegirHeroAb,
  esLandingHomePath,
  heroAbDesdeCookieString,
  HERO_AB_COOKIE,
  parseHeroAb,
  resolverHeroAb,
} from "./hero-ab";

describe("parseHeroAb", () => {
  it("acepta solo las dos variantes", () => {
    expect(parseHeroAb("calle")).toBe("calle");
    expect(parseHeroAb("volvo")).toBe("volvo");
    expect(parseHeroAb("otro")).toBeNull();
    expect(parseHeroAb("")).toBeNull();
    expect(parseHeroAb(null)).toBeNull();
  });
});

describe("elegirHeroAb", () => {
  it("parte 50/50 según el random", () => {
    expect(elegirHeroAb(0)).toBe("calle");
    expect(elegirHeroAb(0.49)).toBe("calle");
    expect(elegirHeroAb(0.5)).toBe("volvo");
    expect(elegirHeroAb(0.99)).toBe("volvo");
  });
});

describe("resolverHeroAb", () => {
  it("prioriza el force sobre la cookie", () => {
    expect(resolverHeroAb("calle", "volvo")).toBe("volvo");
    expect(resolverHeroAb("volvo", "calle")).toBe("calle");
  });

  it("usa la cookie si no hay force", () => {
    expect(resolverHeroAb("volvo")).toBe("volvo");
    expect(resolverHeroAb(undefined)).toBe("calle");
  });
});

describe("esLandingHomePath", () => {
  it("solo homes de la landing pública", () => {
    expect(esLandingHomePath("/")).toBe(true);
    expect(esLandingHomePath("/en")).toBe(true);
    expect(esLandingHomePath("/ca")).toBe(true);
    expect(esLandingHomePath("/pt")).toBe(true);
    expect(esLandingHomePath("/en/contacto")).toBe(false);
    expect(esLandingHomePath("/panel")).toBe(false);
  });
});

describe("heroAbDesdeCookieString", () => {
  it("lee la cookie entre otras", () => {
    expect(heroAbDesdeCookieString(`${HERO_AB_COOKIE}=volvo; other=1`)).toBe("volvo");
    expect(heroAbDesdeCookieString("other=1")).toBeNull();
  });
});
