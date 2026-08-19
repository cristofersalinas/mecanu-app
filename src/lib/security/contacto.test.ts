import { describe, expect, it, beforeEach } from "vitest";
import { CAMPO_HONEYPOT, validarContacto } from "./contacto";
import { resetRateLimitForTests } from "./rate-limit";

describe("validarContacto", () => {
  beforeEach(() => resetRateLimitForTests());

  it("rechaza el campo trampa relleno", () => {
    const r = validarContacto("1.1.1.1", { email: "a@b.co", mensaje: "hola hola", [CAMPO_HONEYPOT]: "http://spam" }, 20);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe("honeypot");
  });

  it("acepta un envío mínimo válido", () => {
    const r = validarContacto("1.1.1.1", { email: "a@b.co", mensaje: "hola taller" }, 30);
    expect(r.ok).toBe(true);
  });
});
