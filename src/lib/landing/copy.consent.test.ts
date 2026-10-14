import { describe, expect, it } from "vitest";
import { copyFor } from "./copy";
import { LOCALES } from "./locales";

describe("copy.consent", () => {
  it("tiene las tres acciones y las tres finalidades en todos los idiomas", () => {
    for (const locale of LOCALES) {
      const c = copyFor(locale).consent;
      expect(c.aceptar.length).toBeGreaterThan(2);
      expect(c.rechazar.length).toBeGreaterThan(2);
      expect(c.configurar.length).toBeGreaterThan(2);
      expect(c.guardar.length).toBeGreaterThan(2);
      expect(c.esencialesTitulo.length).toBeGreaterThan(2);
      expect(c.analiticaTitulo.length).toBeGreaterThan(2);
      expect(c.publicidadTitulo.length).toBeGreaterThan(2);
      expect(c.coreEtiqueta.length).toBeGreaterThan(2);
    }
  });
});
