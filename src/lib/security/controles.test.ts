import { describe, expect, it } from "vitest";
import {
  bearerValido,
  coordenadasStreetView,
  cronBearerPermitido,
  debeExigirSesion,
  mensajeProductoOInterno,
  pareceFugaInterna,
  secretoIgual,
} from "./controles";

describe("debeExigirSesion", () => {
  it("exige sesión con Supabase y sin demo", () => {
    expect(debeExigirSesion({ supabaseConfigurado: true, demo: false })).toBe(true);
  });

  it("no exige sesión en demo ni sin Supabase", () => {
    expect(debeExigirSesion({ supabaseConfigurado: true, demo: true })).toBe(false);
    expect(debeExigirSesion({ supabaseConfigurado: false, demo: false })).toBe(false);
  });
});

describe("secretoIgual", () => {
  it("acepta el mismo secreto y rechaza otro o longitud distinta", () => {
    expect(secretoIgual("cron-secreto", "cron-secreto")).toBe(true);
    expect(secretoIgual("cron-secreto", "cron-secret0")).toBe(false);
    expect(secretoIgual("cron-secreto", "corto")).toBe(false);
    expect(secretoIgual("", "")).toBe(false);
  });
});

describe("bearerValido", () => {
  it("solo acepta Authorization Bearer", () => {
    expect(bearerValido("Bearer abcdef", "abcdef")).toBe(true);
    expect(bearerValido("Bearer abcdef extra", "abcdef")).toBe(false);
    expect(bearerValido("abcdef", "abcdef")).toBe(false);
    expect(bearerValido("Bearer abcdef", "")).toBe(false);
    expect(bearerValido(null, "abcdef")).toBe(false);
  });
});

describe("cronBearerPermitido", () => {
  it("falla cerrado si hay que exigir y falta el secreto", () => {
    expect(
      cronBearerPermitido({ exigir: true, secreto: undefined, authorization: "Bearer x" }),
    ).toBe(false);
    expect(
      cronBearerPermitido({ exigir: true, secreto: "s3cret", authorization: "Bearer s3cret" }),
    ).toBe(true);
  });

  it("en demo no exige bearer", () => {
    expect(
      cronBearerPermitido({ exigir: false, secreto: undefined, authorization: null }),
    ).toBe(true);
  });
});

describe("mensajeProductoOInterno", () => {
  const permitidos = /Arranca el puente|Máximo 5/i;

  it("deja pasar el copy de producto", () => {
    expect(mensajeProductoOInterno(new Error("Arranca el puente Baileys"), permitidos)).toBe(
      "Arranca el puente Baileys",
    );
  });

  it("no devuelve mensajes de base de datos ni tokens", () => {
    expect(mensajeProductoOInterno(new Error('relation "rutas" does not exist'), permitidos)).toBe(
      null,
    );
    expect(pareceFugaInterna("postgres: password authentication failed")).toBe(true);
    expect(mensajeProductoOInterno(new Error("eyJhbGciOiJIUzI1NiJ9.aaaa"), permitidos)).toBe(null);
    expect(mensajeProductoOInterno(new Error("otro fallo"), permitidos)).toBe(null);
  });
});

describe("coordenadasStreetView", () => {
  it("acepta lat, lng y heading de un taller", () => {
    expect(
      coordenadasStreetView({ lat: "40.4168", lng: "-3.7038", heading: "270" }),
    ).toEqual({ lat: 40.4168, lng: -3.7038, heading: 270 });
  });

  it("normaliza el heading y usa 0 si falta", () => {
    expect(coordenadasStreetView({ lat: "40", lng: "-3", heading: null })?.heading).toBe(0);
    expect(coordenadasStreetView({ lat: "40", lng: "-3", heading: "370" })?.heading).toBe(10);
  });

  it("rechaza basura, rangos imposibles y notación científica", () => {
    expect(coordenadasStreetView({ lat: "40;drop", lng: "-3", heading: "0" })).toBeNull();
    expect(coordenadasStreetView({ lat: "91", lng: "0", heading: "0" })).toBeNull();
    expect(coordenadasStreetView({ lat: "40", lng: "1e2", heading: "0" })).toBeNull();
    expect(coordenadasStreetView({ lat: null, lng: "-3", heading: "0" })).toBeNull();
  });
});
