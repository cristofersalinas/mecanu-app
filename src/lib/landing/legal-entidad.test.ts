import { describe, expect, it } from "vitest";
import {
  ENCARGADOS_TRATAMIENTO,
  LEGAL_DEFAULTS,
  PLAZOS_RETENCION,
  entidadIdentificada,
  legalEntidad,
} from "./legal-entidad";

describe("legalEntidad", () => {
  it("publica Automotive Technologies SpA por defecto", () => {
    const e = legalEntidad();
    expect(e.nombreComercial).toBe("Mecanu");
    expect(e.razonSocial).toBe(LEGAL_DEFAULTS.razonSocial);
    expect(e.nif).toBe(LEGAL_DEFAULTS.rut);
    expect(e.idFiscalLabel).toBe("RUT");
    expect(e.domicilio).toContain("Providencia");
    expect(e.pais).toBe("Chile");
    expect(e.emailContacto).toContain("@mecanu.com");
    expect(e.autoridadControl.url).toContain("aepd.es");
  });

  it("entidadIdentificada exige los tres campos societarios", () => {
    expect(
      entidadIdentificada({
        ...legalEntidad(),
        razonSocial: null,
        nif: null,
        domicilio: null,
      }),
    ).toBe(false);
    expect(entidadIdentificada(legalEntidad())).toBe(true);
  });

  it("lista encargados y plazos usados en la política", () => {
    expect(ENCARGADOS_TRATAMIENTO.length).toBeGreaterThanOrEqual(4);
    expect(ENCARGADOS_TRATAMIENTO.some((x) => x.nombre.includes("Slack"))).toBe(true);
    expect(PLAZOS_RETENCION.registrosSeguridad).toMatch(/90/);
  });
});
