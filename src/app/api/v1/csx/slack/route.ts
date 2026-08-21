import { z } from "zod";
import { NextResponse } from "next/server";
import { withIdempotency } from "@/lib/mecanu/api-helpers";
import { ejecutarCsxSemanal, snapshotDemoDesdeRepo } from "@/lib/slack/csx-desde-repo";
import {
  publicarDestacadosSemana,
  publicarSubusoSiToca,
  publicarUpsellSiToca,
} from "@/lib/slack/csx-flujo";

const BodySchema = z.object({
  tipo: z.enum(["destacados", "upsell", "subuso", "paquete_semanal"]),
  /** ISO — por defecto ahora. */
  ahora: z.string().datetime().optional(),
});

/**
 * POST /api/v1/csx/slack
 * Destacados semanales, upsell y llamada por subuso → canal #csx.
 * Protegido como el resto de /api (solo local / MECANU_EXPONER_APPS).
 */
export async function POST(request: Request) {
  return withIdempotency(request, BodySchema, async (body) => {
    const ahora = body.ahora ? new Date(body.ahora) : new Date();
    const snap = await snapshotDemoDesdeRepo(ahora);

    if (body.tipo === "paquete_semanal") {
      const r = await ejecutarCsxSemanal(ahora);
      return { ok: true as const, ...r, taller: snap.taller };
    }
    if (body.tipo === "destacados") {
      const r = await publicarDestacadosSemana(snap, ahora);
      return { ok: true as const, slack: r.status, taller: snap.taller };
    }
    if (body.tipo === "upsell") {
      const r = await publicarUpsellSiToca(snap);
      return { ok: true as const, slack: r.status, emitido: r.emitido, taller: snap.taller };
    }
    const r = await publicarSubusoSiToca(snap);
    return { ok: true as const, slack: r.status, emitido: r.emitido, taller: snap.taller };
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    canal: "SLACK_CHANNEL_CSX",
    configurado: Boolean(
      process.env.SLACK_BOT_TOKEN?.trim() && process.env.SLACK_CHANNEL_CSX?.trim(),
    ),
  });
}
