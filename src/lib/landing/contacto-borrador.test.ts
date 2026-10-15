import { describe, expect, it } from "vitest";
import {
  borradorALead,
  esBorradorAbandonado,
  type ContactoBorrador,
} from "./contacto-borrador";
import { CONTACTO_ABANDONO_MS, borradorTieneDatosUtiles } from "./contacto-notify";

const base: ContactoBorrador = {
  clientId: "abc-12345678",
  updatedAt: new Date(Date.now() - CONTACTO_ABANDONO_MS - 1000).toISOString(),
  createdAt: new Date().toISOString(),
  notifiedAt: "",
  completedAt: "",
  nombre: "Ana",
  telefono: "600111222",
  paisCodigo: "ES",
  ciudad: "Madrid",
  volumen: "",
  step: 2,
  locale: "es",
};

describe("esBorradorAbandonado", () => {
  it("es true tras 1 h sin completar ni notificar", () => {
    expect(esBorradorAbandonado(base)).toBe(true);
  });

  it("es false si aún no pasó 1 h", () => {
    expect(
      esBorradorAbandonado({
        ...base,
        updatedAt: new Date().toISOString(),
      })
    ).toBe(false);
  });

  it("es false si ya se notificó o completó", () => {
    expect(esBorradorAbandonado({ ...base, notifiedAt: new Date().toISOString() })).toBe(false);
    expect(esBorradorAbandonado({ ...base, completedAt: new Date().toISOString() })).toBe(false);
  });
});

describe("borradorALead", () => {
  it("marca canal abandono", () => {
    expect(borradorALead(base).canal).toBe("abandono");
  });
});

describe("borradorTieneDatosUtiles", () => {
  it("exige nombre o teléfono", () => {
    expect(borradorTieneDatosUtiles({ nombre: "", telefono: "" })).toBe(false);
    expect(borradorTieneDatosUtiles({ nombre: "Ana", telefono: "" })).toBe(true);
  });
});
