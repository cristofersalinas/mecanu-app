import { describe, expect, it } from "vitest";
import { clasificarNumeroKapso, tallerWhatsappConectado } from "./numeros";

describe("clasificarNumeroKapso", () => {
  it("marca el sandbox", () => {
    const n = clasificarNumeroKapso({
      id: "597907523413541",
      phone_number_id: "597907523413541",
      kind: "sandbox",
    });
    expect(n?.sandbox).toBe(true);
    expect(tallerWhatsappConectado(n ? [n] : [])).toBe(false);
  });

  it("detecta un Business real", () => {
    const n = clasificarNumeroKapso({
      phone_number_id: "111",
      kind: "production",
      display_phone_number: "+34 633 760 969",
    });
    expect(n?.sandbox).toBe(false);
    expect(tallerWhatsappConectado(n ? [n] : [])).toBe(true);
  });
});
