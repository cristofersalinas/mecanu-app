import { describe, expect, it, beforeEach } from "vitest";
import {
  comprobarRateLimit,
  ipDeRequest,
  metodoEsEscritura,
  resetRateLimitForTests,
} from "./rate-limit";

describe("comprobarRateLimit", () => {
  beforeEach(() => resetRateLimitForTests());

  it("deja pasar hasta el máximo y luego responde 429 lógico", () => {
    const regla = { ventanaMs: 1_000, max: 3 };
    expect(comprobarRateLimit("a", 0, regla).permitido).toBe(true);
    expect(comprobarRateLimit("a", 1, regla).permitido).toBe(true);
    expect(comprobarRateLimit("a", 2, regla).permitido).toBe(true);
    const bloqueado = comprobarRateLimit("a", 3, regla);
    expect(bloqueado.permitido).toBe(false);
    expect(bloqueado.retryAfterSeg).toBeGreaterThan(0);
  });

  it("no comparte el cubo entre claves (IPs distintas)", () => {
    const regla = { ventanaMs: 1_000, max: 1 };
    expect(comprobarRateLimit("1.1.1.1", 0, regla).permitido).toBe(true);
    expect(comprobarRateLimit("8.8.8.8", 0, regla).permitido).toBe(true);
  });

  it("libera el hueco al salir la marca de la ventana", () => {
    const regla = { ventanaMs: 100, max: 1 };
    expect(comprobarRateLimit("b", 0, regla).permitido).toBe(true);
    expect(comprobarRateLimit("b", 50, regla).permitido).toBe(false);
    expect(comprobarRateLimit("b", 101, regla).permitido).toBe(true);
  });
});

describe("ipDeRequest", () => {
  it("usa el primer hop de x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": " 1.2.3.4 , 10.0.0.1" });
    expect(ipDeRequest(h)).toBe("1.2.3.4");
  });

  it("no inventa una IP si no hay cabecera", () => {
    expect(ipDeRequest(new Headers())).toBe("unknown");
  });
});

describe("metodoEsEscritura", () => {
  it("GET y HEAD no cuentan como escritura", () => {
    expect(metodoEsEscritura("GET")).toBe(false);
    expect(metodoEsEscritura("POST")).toBe(true);
  });
});
