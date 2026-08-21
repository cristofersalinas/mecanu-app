/**
 * Construye el snapshot semanal CSX a partir del mundo mock / backoffice.
 * Cuando haya multi-taller real, cada fila vendrá de Postgres.
 */
import type { Campana, Conductor, RutaVista } from "@/lib/mecanu/types";
import {
  type PlanTaller,
  type SnapshotTallerSemana,
  UMBRAL_AUTOS_SEMANA_USO,
} from "./csx";

const DIA_MS = 86_400_000;

export function inicioSemanaUtc(ref: Date): Date {
  const d = new Date(ref);
  const day = d.getUTCDay() || 7;
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return d;
}

function enVentana(ts: Date | null | undefined, desde: Date, hasta: Date): boolean {
  if (!ts) return false;
  const t = ts.getTime();
  return t >= desde.getTime() && t < hasta.getTime();
}

export function construirSnapshotTallerSemana(opts: {
  tallerId?: string;
  taller: string;
  sucursal: string;
  plan?: PlanTaller;
  contactoNombre: string;
  contactoTelefono: string;
  rutas: Pick<RutaVista, "id" | "vehiculoId" | "estado" | "fecha" | "creadaEn">[];
  campanas: Pick<
    Campana,
    "id" | "estado" | "origenAutomatico" | "fecha" | "presupuesto" | "valor"
  >[];
  conductores: Pick<Conductor, "id" | "proceso">[];
  /** tramos con conductor asignado en la ventana (para uso de flota) */
  conductorIdsUsados: string[];
  tareasManualesAbiertas: number;
  oportunidadesEstancadas: number;
  onboardingCompleto: boolean;
  citas: { quien: string; texto: string }[];
  ahora?: Date;
}): SnapshotTallerSemana {
  const ahora = opts.ahora ?? new Date();
  const desde = inicioSemanaUtc(ahora);
  const hasta = new Date(desde.getTime() + 7 * DIA_MS);

  const rutasSemana = opts.rutas.filter((r) => {
    if (r.estado === "cancelado") return false;
    const ref = r.fecha ?? r.creadaEn;
    return enVentana(ref, desde, hasta);
  });

  const autos = new Set(
    rutasSemana.map((r) => r.vehiculoId).filter((id): id is string => Boolean(id)),
  );

  const campanasSemana = opts.campanas.filter((c) => {
    const ref = c.presupuesto.actualizado ?? c.presupuesto.creado ?? c.fecha;
    return enVentana(ref, desde, hasta);
  });

  const ofertasEnviadas = campanasSemana.filter((c) =>
    ["enviada", "aceptada", "rechazada", "caducada"].includes(c.estado),
  ).length;
  const ofertasAceptadas = campanasSemana.filter((c) => c.estado === "aceptada").length;
  const campanasManualesEnviadas = campanasSemana.filter(
    (c) =>
      !c.origenAutomatico &&
      ["enviada", "aceptada", "rechazada", "caducada"].includes(c.estado),
  ).length;

  const activos = opts.conductores.filter((c) => c.proceso === "activo");
  const usados = new Set(
    opts.conductorIdsUsados.filter((id) => activos.some((c) => c.id === id)),
  );

  return {
    tallerId: opts.tallerId ?? "taller-demo",
    taller: opts.taller,
    sucursal: opts.sucursal,
    plan: opts.plan ?? "basico",
    contactoNombre: opts.contactoNombre,
    contactoTelefono: opts.contactoTelefono,
    autosTrasladados: autos.size || rutasSemana.length,
    campanasManualesEnviadas,
    ofertasEnviadas,
    ofertasAceptadas,
    tareasManualesAbiertas: opts.tareasManualesAbiertas,
    conductoresActivos: activos.length,
    conductoresUsadosEnSemana: usados.size,
    citas: opts.citas,
    oportunidadesEstancadas: opts.oportunidadesEstancadas,
    onboardingCompleto: opts.onboardingCompleto,
  };
}

/** Demo: si el mock no llega a 7 autos, documentamos el umbral en tests con datos sintéticos. */
export { UMBRAL_AUTOS_SEMANA_USO };
