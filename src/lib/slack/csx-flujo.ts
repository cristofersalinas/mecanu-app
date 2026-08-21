/**
 * Publica señales CSX (upsell, subuso, Destacados) en Slack #csx.
 */
import {
  construirDestacados,
  evaluarSubuso,
  evaluarUpsell,
  labelSemana,
  textoDestacados,
  textoSenalSubuso,
  textoSenalUpsell,
  type SnapshotTallerSemana,
} from "./csx";
import { avisarCsxSlack, type SlackPostResult } from "./notify";

export async function publicarUpsellSiToca(
  s: SnapshotTallerSemana,
): Promise<SlackPostResult & { emitido: boolean }> {
  const u = evaluarUpsell(s);
  if (!u) return { status: "skipped", emitido: false };
  const r = await avisarCsxSlack(textoSenalUpsell(s, u));
  return { ...r, emitido: r.status === "ok" };
}

export async function publicarSubusoSiToca(
  s: SnapshotTallerSemana,
): Promise<SlackPostResult & { emitido: boolean }> {
  const u = evaluarSubuso(s);
  if (!u) return { status: "skipped", emitido: false };
  const r = await avisarCsxSlack(textoSenalSubuso(s, u));
  return { ...r, emitido: r.status === "ok" };
}

export async function publicarDestacadosSemana(
  s: SnapshotTallerSemana,
  ahora: Date = new Date(),
): Promise<SlackPostResult> {
  const d = construirDestacados(s, labelSemana(ahora));
  return avisarCsxSlack(textoDestacados(d));
}

/** Paquete semanal: Destacados (incluye upsell/subuso/accionables en el cuerpo). */
export async function publicarPaqueteCsxSemanal(
  snapshots: SnapshotTallerSemana[],
  ahora: Date = new Date(),
): Promise<{ publicados: number; skipped: number }> {
  let publicados = 0;
  let skipped = 0;
  for (const s of snapshots) {
    const r = await publicarDestacadosSemana(s, ahora);
    if (r.status === "ok") publicados += 1;
    else skipped += 1;
  }
  return { publicados, skipped };
}
