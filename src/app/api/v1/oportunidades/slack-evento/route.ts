import { z } from "zod";
import { NextResponse } from "next/server";
import { withIdempotency } from "@/lib/mecanu/api-helpers";
import { PresupuestoEstadoSchema } from "@/lib/mecanu/types";
import { publicarEventoOportunidad } from "@/lib/slack/oportunidades-flujo";
import { debeNudge, type DatosOportunidad, type EventoOportunidad } from "@/lib/slack/oportunidades";

const ActorSchema = z.object({
  nombre: z.string().min(1),
  rol: z.string().min(1),
});

const TallerSchema = z.object({
  taller: z.string().min(1),
  sucursal: z.string().min(1),
});

const OportunidadSchema = z.object({
  id: z.string().min(1),
  estado: PresupuestoEstadoSchema,
  valor: z.number().nonnegative(),
  matricula: z.string().min(1),
  vehiculoLabel: z.string().min(1),
  servicioLabel: z.string().min(1),
  creadaEn: z.string().datetime(),
  actualizadaEn: z.string().datetime(),
  taller: TallerSchema,
});

const BodySchema = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("creada"),
    oportunidad: OportunidadSchema,
    actor: ActorSchema.optional(),
  }),
  z.object({
    tipo: z.literal("cambio_estado"),
    oportunidad: OportunidadSchema,
    desde: PresupuestoEstadoSchema,
    actor: ActorSchema,
    detalle: z.string().optional(),
  }),
  z.object({
    tipo: z.literal("ruta_creada"),
    oportunidad: OportunidadSchema,
    actor: ActorSchema,
  }),
  z.object({
    tipo: z.literal("nudge"),
    oportunidad: OportunidadSchema,
  }),
  z.object({
    tipo: z.literal("escanear_nudges"),
    ahora: z.string().datetime().optional(),
    oportunidades: z.array(OportunidadSchema).max(200),
  }),
]);

function aDatos(o: z.infer<typeof OportunidadSchema>): DatosOportunidad {
  return {
    ...o,
    creadaEn: new Date(o.creadaEn),
    actualizadaEn: new Date(o.actualizadaEn),
  };
}

/**
 * POST /api/v1/oportunidades/slack-evento
 * El panel (y hallazgos) notifican aquí. Sin token Slack → 200 skipped.
 */
export async function POST(request: Request) {
  return withIdempotency(request, BodySchema, async (body) => {
    if (body.tipo === "escanear_nudges") {
      const ahora = body.ahora ? new Date(body.ahora) : new Date();
      const publicados: string[] = [];
      for (const raw of body.oportunidades) {
        const o = aDatos(raw);
        if (!debeNudge({ estado: o.estado, desde: o.actualizadaEn, ahora })) continue;
        const ev: EventoOportunidad = { tipo: "nudge", oportunidad: o, ahora };
        const r = await publicarEventoOportunidad(ev);
        if (r.status === "ok") publicados.push(o.id);
      }
      return { ok: true as const, modo: "nudges" as const, publicados };
    }

    const oportunidad = aDatos(body.oportunidad);
    const ev: EventoOportunidad =
      body.tipo === "creada"
        ? { tipo: "creada", oportunidad, actor: body.actor }
        : body.tipo === "cambio_estado"
          ? {
              tipo: "cambio_estado",
              oportunidad,
              desde: body.desde,
              actor: body.actor,
              detalle: body.detalle,
            }
          : body.tipo === "ruta_creada"
            ? { tipo: "ruta_creada", oportunidad, actor: body.actor }
            : { tipo: "nudge", oportunidad };

    const r = await publicarEventoOportunidad(ev);
    return {
      ok: true as const,
      slack: r.status,
      modo: "modo" in r ? r.modo : undefined,
    };
  });
}

/** Health: sin body no aplica; evita 405 confuso en probes. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    canal: "SLACK_CHANNEL_OPORTUNIDADES",
    configurado: Boolean(
      process.env.SLACK_BOT_TOKEN?.trim() && process.env.SLACK_CHANNEL_OPORTUNIDADES?.trim(),
    ),
  });
}
