import { z } from "zod";
import { NextResponse } from "next/server";
import { withIdempotency } from "@/lib/mecanu/api-helpers";
import { cronBearerPermitido } from "@/lib/security/controles";
import { sesionOperativaObligatoria } from "@/lib/security/sesion-operativa";
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
 * El cron de GitHub no llama aquí: ejecuta `scripts/csx-semanal.ts`.
 * Esta ruta, con Supabase y sin demo, exige `Authorization: Bearer`
 * con `CSX_CRON_SECRET`. Sin el secreto configurado, deniega.
 */
export async function POST(request: Request) {
  if (
    !cronBearerPermitido({
      exigir: sesionOperativaObligatoria(),
      secreto: process.env.CSX_CRON_SECRET,
      authorization: request.headers.get("authorization"),
    })
  ) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sesión requerida." } },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
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
  return NextResponse.json({ ok: true });
}
