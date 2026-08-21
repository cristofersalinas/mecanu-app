/**
 * Avisos paternalistas de oportunidades (campañas) del taller → Slack.
 * Un hilo por oportunidad: el primer mensaje es la alerta; cada acción
 * del taller o del sistema se comenta en el mismo hilo.
 */
import { PRESUPUESTO_META } from "@/lib/mecanu/mecanu-pipeline";
import type { PresupuestoEstado } from "@/lib/mecanu/types";
import { slackEscape } from "./notify";

export type ActorOportunidad = {
  nombre: string;
  rol: string;
};

export type ContextoTaller = {
  taller: string;
  sucursal: string;
};

export type DatosOportunidad = {
  id: string;
  estado: PresupuestoEstado;
  /** Importe con IVA, número. */
  valor: number;
  matricula: string;
  vehiculoLabel: string;
  servicioLabel: string;
  creadaEn: Date;
  /** Último cambio de estado relevante (si no, = creadaEn). */
  actualizadaEn: Date;
  taller: ContextoTaller;
};

export type TipoEventoOportunidad =
  | "creada"
  | "cambio_estado"
  | "ruta_creada"
  | "nudge";

export type EventoOportunidad = {
  tipo: TipoEventoOportunidad;
  oportunidad: DatosOportunidad;
  actor?: ActorOportunidad;
  /** Estado previo en un cambio. */
  desde?: PresupuestoEstado;
  /** Texto libre opcional (motivo, nota). */
  detalle?: string;
  ahora?: Date;
};

/** Umbrales de “sugerir seguimiento” si el taller no actúa. */
export const NUDGE_HORAS: Partial<Record<PresupuestoEstado, number>> = {
  nueva: 24,
  valorada: 24,
  enviada: 72,
  aceptada: 4,
};

export const LABEL_ESTADO: Record<PresupuestoEstado, string> = {
  nueva: PRESUPUESTO_META.nueva?.label ?? "Nueva",
  valorada: PRESUPUESTO_META.valorada?.label ?? "Estimado",
  enviada: PRESUPUESTO_META.enviada?.label ?? "Enviado",
  aceptada: PRESUPUESTO_META.aceptada?.label ?? "Confirmado",
  rechazada: PRESUPUESTO_META.rechazada?.label ?? "Rechazado",
  caducada: PRESUPUESTO_META.caducada?.label ?? "Caducado",
};

export function formatearEuros(valor: number): string {
  return (
    new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor) + " €"
  );
}

export function horasEntre(desde: Date, hasta: Date): number {
  return (hasta.getTime() - desde.getTime()) / 3_600_000;
}

export function sugerenciaParaEstado(estado: PresupuestoEstado): string {
  switch (estado) {
    case "nueva":
      return "sugerir valorar el presupuesto";
    case "valorada":
      return "sugerir enviar al cliente";
    case "enviada":
      return "sugerir seguimiento al cliente";
    case "aceptada":
      return "sugerir crear la ruta";
    case "rechazada":
      return "oportunidad cerrada — sin acción";
    case "caducada":
      return "oportunidad caducada — revisar si conviene reabrir";
    default:
      return "revisar en el panel";
  }
}

export function debeNudge(opts: {
  estado: PresupuestoEstado;
  desde: Date;
  ahora: Date;
}): boolean {
  const umbral = NUDGE_HORAS[opts.estado];
  if (umbral == null) return false;
  return horasEntre(opts.desde, opts.ahora) >= umbral;
}

function bloqueContexto(o: DatosOportunidad): string {
  return [
    `*Taller:* ${slackEscape(o.taller.taller)}`,
    `*Sucursal:* ${slackEscape(o.taller.sucursal)}`,
    `*Vehículo:* ${slackEscape(o.matricula)} · ${slackEscape(o.vehiculoLabel)}`,
    `*Servicio:* ${slackEscape(o.servicioLabel)}`,
    `*Importe:* ${formatearEuros(o.valor)} (IVA incl.)`,
    `*Estado:* ${LABEL_ESTADO[o.estado]}`,
    `*Id:* \`${slackEscape(o.id)}\``,
  ].join("\n");
}

/** Primer mensaje del hilo (alerta). */
export function textoAperturaOportunidad(ev: EventoOportunidad): string {
  const o = ev.oportunidad;
  const ahora = ev.ahora ?? new Date();
  const h = Math.max(0, Math.round(horasEntre(o.creadaEn, ahora)));
  const edad =
    h < 1 ? "hace menos de 1 h" : h < 48 ? `hace ${h} h` : `hace ${Math.round(h / 24)} días`;

  const titulo =
    ev.tipo === "nudge"
      ? `*Oportunidad sin movimiento* — ${slackEscape(o.matricula)}`
      : `*Oportunidad ${ev.tipo === "creada" ? "nueva" : "abierta"}* — ${slackEscape(o.matricula)}`;

  const paternal =
    ev.tipo === "nudge"
      ? `Lleva ${edad} en «${LABEL_ESTADO[o.estado]}». ${sugerenciaParaEstado(o.estado)}.`
      : `Creada ${edad}. Valor ${formatearEuros(o.valor)}. ${sugerenciaParaEstado(o.estado)}.`;

  return [titulo, paternal, "", bloqueContexto(o)].join("\n");
}

/** Comentario en el hilo (acción del taller o del sistema). */
export function textoComentarioOportunidad(ev: EventoOportunidad): string {
  const o = ev.oportunidad;
  const actor = ev.actor
    ? `Usuario ${slackEscape(ev.actor.nombre)} [${slackEscape(ev.actor.rol)}]`
    : "Sistema Mecanu";

  if (ev.tipo === "ruta_creada") {
    return `*Comentario:* ${actor} creó la ruta desde la oportunidad. Estado → «${LABEL_ESTADO.aceptada}» (hecho operativo).`;
  }

  if (ev.tipo === "cambio_estado" && ev.desde) {
    const detalle = ev.detalle ? ` — ${slackEscape(ev.detalle)}` : "";
    return (
      `*Comentario:* ${actor} movió la oportunidad de «${LABEL_ESTADO[ev.desde]}» a «${LABEL_ESTADO[o.estado]}»${detalle}.\n` +
      `Siguiente: ${sugerenciaParaEstado(o.estado)}.`
    );
  }

  if (ev.tipo === "nudge") {
    const h = Math.round(horasEntre(o.actualizadaEn, ev.ahora ?? new Date()));
    return (
      `*Recordatorio:* sin acción del taller desde hace ~${h} h.\n` +
      `${sugerenciaParaEstado(o.estado)}. ` +
      `Si no ves movimiento, conviene avisar a ${slackEscape(o.taller.taller)} (${slackEscape(o.taller.sucursal)}).`
    );
  }

  return `*Comentario:* ${actor} actualizó la oportunidad → «${LABEL_ESTADO[o.estado]}».`;
}

/** ¿Este evento abre hilo nuevo o es reply? */
export function esAperturaHilo(_tipo: TipoEventoOportunidad, yaHayHilo: boolean): boolean {
  return !yaHayHilo;
}
