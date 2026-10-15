import { describe, expect, it } from "vitest";
import {
  esHostNegocio,
  esHostPublicoMarketing,
  pathAuthPanel,
  pathBonitoAuthDesdeInterno,
  pathInternoAuthDesdeBonito,
} from "./host-negocio";
import { pathBonitoDesdeUbicacionInterna } from "./panel-rutas";

describe("host del panel", () => {
  it("reconoce negocio.mecanu.com y no la web pública", () => {
    expect(esHostNegocio("negocio.mecanu.com")).toBe(true);
    expect(esHostNegocio("negocio.localhost:3000")).toBe(true);
    expect(esHostNegocio("mecanu.com")).toBe(false);
    expect(esHostPublicoMarketing("www.mecanu.com")).toBe(true);
    expect(esHostPublicoMarketing("negocio.mecanu.com")).toBe(false);
  });

  it("en el subdominio el login es la raíz, no /panel/entrar", () => {
    expect(pathAuthPanel("entrar", "negocio.mecanu.com")).toBe("/");
    expect(pathAuthPanel("registro", "negocio.mecanu.com")).toBe("/registro");
    expect(pathAuthPanel("entrar", "localhost:3000")).toBe("/panel/entrar");
    expect(pathAuthPanel("registro", "localhost")).toBe("/panel/registro");
  });

  it("traduce rutas de auth internas a las cortas del subdominio", () => {
    expect(pathBonitoAuthDesdeInterno("/panel/entrar")).toBe("/");
    expect(pathBonitoAuthDesdeInterno("/panel/registro")).toBe("/registro");
    expect(pathInternoAuthDesdeBonito("/registro")).toBe("/panel/registro");
    expect(pathBonitoDesdeUbicacionInterna("/panel")).toBe("/general");
  });
});
