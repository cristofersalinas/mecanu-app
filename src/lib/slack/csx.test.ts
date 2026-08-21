import { describe, expect, it } from "vitest";
import {
  construirAccionables,
  construirDestacados,
  evaluarSubuso,
  evaluarUpsell,
  textoDestacados,
  textoSenalUpsell,
  UMBRAL_AUTOS_SEMANA_USO,
  type SnapshotTallerSemana,
} from "./csx";

function snap(p: Partial<SnapshotTallerSemana> = {}): SnapshotTallerSemana {
  return {
    tallerId: "t1",
    taller: "Talleria",
    sucursal: "Les Corts",
    plan: "basico",
    contactoNombre: "Juan Carlos",
    contactoTelefono: "600111222",
    autosTrasladados: 0,
    campanasManualesEnviadas: 0,
    ofertasEnviadas: 0,
    ofertasAceptadas: 0,
    tareasManualesAbiertas: 0,
    conductoresActivos: 3,
    conductoresUsadosEnSemana: 0,
    citas: [],
    oportunidadesEstancadas: 0,
    onboardingCompleto: true,
    ...p,
  };
}

describe("evaluarUpsell", () => {
  it("dispara por volumen ≥7 autos en básico", () => {
    const u = evaluarUpsell(snap({ autosTrasladados: UMBRAL_AUTOS_SEMANA_USO }));
    expect(u).not.toBeNull();
    expect(u!.motivo).toBe("volumen_autos");
    expect(u!.planSugerido).toBe("pro");
  });

  it("dispara por conversión alta", () => {
    const u = evaluarUpsell(
      snap({ ofertasEnviadas: 10, ofertasAceptadas: 5, autosTrasladados: 3 }),
    );
    expect(u?.motivo).toBe("conversion");
  });

  it("no upsell en flota (no hay siguiente)", () => {
    expect(evaluarUpsell(snap({ plan: "flota", autosTrasladados: 20 }))).toBeNull();
  });
});

describe("evaluarSubuso", () => {
  it("pide llamar si no ofrecen", () => {
    const s = evaluarSubuso(snap({ autosTrasladados: 1, ofertasEnviadas: 0 }));
    expect(s?.tipo).toBe("subuso_llamar");
    expect(s?.scriptLlamada).toContain("Juan Carlos");
  });

  it("no pide llamar si hay volumen", () => {
    expect(evaluarSubuso(snap({ autosTrasladados: 8 }))).toBeNull();
  });
});

describe("destacados + accionables", () => {
  it("incluye citas y CSX priorizado", () => {
    const d = construirDestacados(
      snap({
        autosTrasladados: 1,
        ofertasEnviadas: 0,
        citas: [{ quien: "Cliente Ana", texto: "¿Pasáis a buscarlo el jueves?" }],
        oportunidadesEstancadas: 2,
        onboardingCompleto: false,
      }),
      "14 – 20 ago",
    );
    expect(d.accionables[0]?.prioridad).toBe("P0");
    expect(d.citas[0]?.texto).toContain("jueves");
    const t = textoDestacados(d);
    expect(t).toContain("Destacados");
    expect(t).toContain("Accionables CSX");
    expect(t).toContain("Ana");
  });

  it("upsell genera accionable P1", () => {
    const a = construirAccionables(snap({ autosTrasladados: 9 }));
    expect(a.some((x) => x.motivo === "volumen_autos")).toBe(true);
    const msg = textoSenalUpsell(
      snap({ autosTrasladados: 9 }),
      evaluarUpsell(snap({ autosTrasladados: 9 }))!,
    );
    expect(msg).toContain("Upsell");
    expect(msg).toContain("Pro");
  });
});
