/**
 * CSX del dueño: upsell de plan, llamada si no ofrecen, Destacados semanales
 * y lista de accionables. Lógica pura — Slack solo formatea y publica.
 *
 * Contamos autos trasladados (ida, vuelta o ambos = 1 auto por ruta con
 * al menos un tramo completado/en curso en la ventana), no tramos sueltos.
 */
import { slackEscape } from "./notify";

export type PlanTaller = "basico" | "pro" | "flota";

export const PLAN_LABEL: Record<PlanTaller, string> = {
  basico: "Básico",
  pro: "Pro",
  flota: "Flota",
};

export const PLAN_SIGUIENTE: Partial<Record<PlanTaller, PlanTaller>> = {
  basico: "pro",
  pro: "flota",
};

/** Referencia de producto: ≥7 autos/semana en Básico = está usándolo de verdad. */
export const UMBRAL_AUTOS_SEMANA_USO = 7;

/** Conversión enviada→aceptada a partir de la cual sugerimos upsell. */
export const UMBRAL_CONVERSION_UPSELL_PCT = 35;

/** Campañas enviadas a mano (no origen automático) en la semana. */
export const UMBRAL_CAMPANAS_MANUALES = 5;

/** Deberes / tareas manuales abiertas que podrían automatizarse. */
export const UMBRAL_TAREAS_MANUALES = 8;

/** Conductores activos usados (con ≥1 auto) / total activos. */
export const UMBRAL_USO_FLOTA_PCT = 80;

/** Por debajo de esto y sin ofertas enviadas → llamada “cómo te va”. */
export const UMBRAL_AUTOS_SUBUSO = 2;

export type MotivoUpsell =
  | "volumen_autos"
  | "campanas_manuales"
  | "tareas_manuales"
  | "conversion"
  | "flota_llena";

export type MotivoCsx =
  | MotivoUpsell
  | "subuso_llamar"
  | "oportunidad_estancada"
  | "lead_sin_llamar"
  | "onboarding_incompleto";

export interface SnapshotTallerSemana {
  tallerId: string;
  taller: string;
  sucursal: string;
  plan: PlanTaller;
  contactoNombre: string;
  contactoTelefono: string;
  /** Autos distintos con traslado en la semana (ruta con actividad). */
  autosTrasladados: number;
  /** Campañas creadas/enviadas por el taller a mano (no check-in auto). */
  campanasManualesEnviadas: number;
  /** Ofertas enviadas (cualquier origen) en la ventana. */
  ofertasEnviadas: number;
  ofertasAceptadas: number;
  /** Deberes/tareas abiertas de tipo manual repetitivo. */
  tareasManualesAbiertas: number;
  conductoresActivos: number;
  conductoresUsadosEnSemana: number;
  /** Citas cortas de clientes o del taller (WhatsApp, notas). */
  citas: { quien: string; texto: string }[];
  /** Oportunidades abiertas demasiado tiempo. */
  oportunidadesEstancadas: number;
  onboardingCompleto: boolean;
}

export interface SenalUpsell {
  tipo: "upsell";
  motivo: MotivoUpsell;
  planActual: PlanTaller;
  planSugerido: PlanTaller;
  titulo: string;
  detalle: string;
  evidencia: string;
}

export interface SenalSubuso {
  tipo: "subuso_llamar";
  titulo: string;
  detalle: string;
  scriptLlamada: string;
}

export interface AccionableCsx {
  id: string;
  prioridad: "P0" | "P1" | "P2";
  motivo: MotivoCsx;
  titulo: string;
  porQue: string;
  queDecir: string;
}

export interface DestacadosSemana {
  periodoLabel: string;
  taller: SnapshotTallerSemana;
  metricas: { label: string; valor: string }[];
  citas: { quien: string; texto: string }[];
  upsell: SenalUpsell | null;
  subuso: SenalSubuso | null;
  accionables: AccionableCsx[];
}

export function conversionPct(enviadas: number, aceptadas: number): number | null {
  if (enviadas <= 0) return null;
  return Math.round((aceptadas / enviadas) * 1000) / 10;
}

export function usoFlotaPct(activos: number, usados: number): number | null {
  if (activos <= 0) return null;
  return Math.round((usados / activos) * 1000) / 10;
}

export function evaluarUpsell(s: SnapshotTallerSemana): SenalUpsell | null {
  const siguiente = PLAN_SIGUIENTE[s.plan];
  if (!siguiente) return null;

  const conv = conversionPct(s.ofertasEnviadas, s.ofertasAceptadas);
  const flota = usoFlotaPct(s.conductoresActivos, s.conductoresUsadosEnSemana);

  const candidatos: { motivo: MotivoUpsell; titulo: string; detalle: string; evidencia: string }[] = [];

  if (s.autosTrasladados >= UMBRAL_AUTOS_SEMANA_USO) {
    candidatos.push({
      motivo: "volumen_autos",
      titulo: "Volumen alto en plan Básico",
      detalle: `Lleva ${s.autosTrasladados} autos trasladados esta semana (umbral ${UMBRAL_AUTOS_SEMANA_USO}). Está ofreciendo el servicio a clientes de verdad.`,
      evidencia: `${s.autosTrasladados} autos · plan ${PLAN_LABEL[s.plan]}`,
    });
  }
  if (s.campanasManualesEnviadas >= UMBRAL_CAMPANAS_MANUALES) {
    candidatos.push({
      motivo: "campanas_manuales",
      titulo: "Muchas campañas a mano",
      detalle: `Ha enviado ${s.campanasManualesEnviadas} ofertas manuales. En ${PLAN_LABEL[siguiente]} puede automatizar recordatorios y reglas.`,
      evidencia: `${s.campanasManualesEnviadas} envíos manuales`,
    });
  }
  if (s.tareasManualesAbiertas >= UMBRAL_TAREAS_MANUALES) {
    candidatos.push({
      motivo: "tareas_manuales",
      titulo: "Cola de tareas manuales",
      detalle: `${s.tareasManualesAbiertas} deberes abiertos que piden automatización (avisos, asignación, seguimiento).`,
      evidencia: `${s.tareasManualesAbiertas} tareas abiertas`,
    });
  }
  if (conv != null && conv >= UMBRAL_CONVERSION_UPSELL_PCT) {
    candidatos.push({
      motivo: "conversion",
      titulo: "Buena conversión de ofertas",
      detalle: `${conv.toLocaleString("es-ES")} % de enviadas → aceptadas. Merece herramientas de Pro para escalar sin más trabajo manual.`,
      evidencia: `${conv} % conversión · ${s.ofertasAceptadas}/${s.ofertasEnviadas}`,
    });
  }
  if (
    flota != null &&
    flota >= UMBRAL_USO_FLOTA_PCT &&
    s.conductoresActivos >= 2 &&
    s.autosTrasladados >= UMBRAL_AUTOS_SEMANA_USO
  ) {
    candidatos.push({
      motivo: "flota_llena",
      titulo: "Flota casi al completo",
      detalle: `Usa ${s.conductoresUsadosEnSemana}/${s.conductoresActivos} conductores (${flota} %). El plan siguiente desbloquea más cobertura y reglas.`,
      evidencia: `${s.conductoresUsadosEnSemana}/${s.conductoresActivos} conductores activos en la semana`,
    });
  }

  if (candidatos.length === 0) return null;

  // Prioridad: volumen > flota > conversión > campañas > tareas
  const orden: MotivoUpsell[] = [
    "volumen_autos",
    "flota_llena",
    "conversion",
    "campanas_manuales",
    "tareas_manuales",
  ];
  candidatos.sort((a, b) => orden.indexOf(a.motivo) - orden.indexOf(b.motivo));
  const top = candidatos[0]!;

  return {
    tipo: "upsell",
    motivo: top.motivo,
    planActual: s.plan,
    planSugerido: siguiente,
    titulo: top.titulo,
    detalle: top.detalle,
    evidencia: top.evidencia,
  };
}

export function evaluarSubuso(s: SnapshotTallerSemana): SenalSubuso | null {
  const noOfrece =
    s.ofertasEnviadas === 0 &&
    s.campanasManualesEnviadas === 0 &&
    s.autosTrasladados < UMBRAL_AUTOS_SUBUSO;

  if (!noOfrece) return null;

  return {
    tipo: "subuso_llamar",
    titulo: "No está ofreciendo Mecanu a sus clientes",
    detalle:
      `Esta semana: ${s.autosTrasladados} autos, ${s.ofertasEnviadas} ofertas enviadas. ` +
      `Conviene una llamada de CSX, no un upsell.`,
    scriptLlamada:
      `Hola ${s.contactoNombre}, soy de Mecanu. ¿Cómo te ha ido la semana en ${s.taller}? ` +
      `Vi poco movimiento de traslados/ofertas — ¿te encaja que te muestre en 10 min cómo proponerlo al cliente en el check-in?`,
  };
}

export function construirAccionables(s: SnapshotTallerSemana): AccionableCsx[] {
  const out: AccionableCsx[] = [];
  const upsell = evaluarUpsell(s);
  const subuso = evaluarSubuso(s);

  if (upsell) {
    out.push({
      id: `upsell-${s.tallerId}-${upsell.motivo}`,
      prioridad: "P1",
      motivo: upsell.motivo,
      titulo: `Ofrecer plan ${PLAN_LABEL[upsell.planSugerido]} a ${s.taller}`,
      porQue: upsell.detalle,
      queDecir:
        `Lleváis ritmo de ${PLAN_LABEL[upsell.planSugerido]} en uso real (${upsell.evidencia}). ` +
        `Te propongo subir desde ${PLAN_LABEL[upsell.planActual]} para quitaros trabajo manual.`,
    });
  }

  if (subuso) {
    out.push({
      id: `subuso-${s.tallerId}`,
      prioridad: "P0",
      motivo: "subuso_llamar",
      titulo: `Llamar a ${s.contactoNombre} (${s.taller})`,
      porQue: subuso.detalle,
      queDecir: subuso.scriptLlamada,
    });
  }

  if (s.oportunidadesEstancadas > 0) {
    out.push({
      id: `estancadas-${s.tallerId}`,
      prioridad: "P1",
      motivo: "oportunidad_estancada",
      titulo: `Revisar ${s.oportunidadesEstancadas} oportunidades paradas`,
      porQue: "Hay valor en el pipeline sin movimiento del taller.",
      queDecir:
        `Tienes ${s.oportunidadesEstancadas} ofertas sin avanzar. ¿Te ayudo a valorar/enviar la de más importe esta tarde?`,
    });
  }

  if (!s.onboardingCompleto) {
    out.push({
      id: `onboarding-${s.tallerId}`,
      prioridad: "P2",
      motivo: "onboarding_incompleto",
      titulo: `Cerrar onboarding de ${s.taller}`,
      porQue: "Sin sucursal/horario/hábitos claros cuesta que ofrezcan el servicio.",
      queDecir: "Te dejo el checklist de 10 minutos: sucursal, horario y primera oferta de prueba.",
    });
  }

  const prio = { P0: 0, P1: 1, P2: 2 };
  return out.sort((a, b) => prio[a.prioridad] - prio[b.prioridad]);
}

export function construirDestacados(
  s: SnapshotTallerSemana,
  periodoLabel: string,
): DestacadosSemana {
  const conv = conversionPct(s.ofertasEnviadas, s.ofertasAceptadas);
  const flota = usoFlotaPct(s.conductoresActivos, s.conductoresUsadosEnSemana);

  return {
    periodoLabel,
    taller: s,
    metricas: [
      { label: "Autos trasladados", valor: String(s.autosTrasladados) },
      { label: "Ofertas enviadas", valor: String(s.ofertasEnviadas) },
      { label: "Ofertas aceptadas", valor: String(s.ofertasAceptadas) },
      {
        label: "Conversión",
        valor: conv == null ? "Sin dato" : `${conv.toLocaleString("es-ES")} %`,
      },
      {
        label: "Conductores usados",
        valor: `${s.conductoresUsadosEnSemana}/${s.conductoresActivos}${flota != null ? ` (${flota} %)` : ""}`,
      },
      { label: "Campañas manuales", valor: String(s.campanasManualesEnviadas) },
      { label: "Tareas manuales abiertas", valor: String(s.tareasManualesAbiertas) },
      { label: "Plan", valor: PLAN_LABEL[s.plan] },
    ],
    citas: s.citas.slice(0, 5),
    upsell: evaluarUpsell(s),
    subuso: evaluarSubuso(s),
    accionables: construirAccionables(s),
  };
}

export function textoSenalUpsell(s: SnapshotTallerSemana, u: SenalUpsell): string {
  return [
    `*Upsell* — ${slackEscape(s.taller)} · ${slackEscape(s.sucursal)}`,
    `${PLAN_LABEL[u.planActual]} → *${PLAN_LABEL[u.planSugerido]}* · ${slackEscape(u.titulo)}`,
    slackEscape(u.detalle),
    `*Evidencia:* ${slackEscape(u.evidencia)}`,
    `*Contacto:* ${slackEscape(s.contactoNombre)} · ${slackEscape(s.contactoTelefono)}`,
    `*Qué hacer:* llamar o escribir ofreciendo ${PLAN_LABEL[u.planSugerido]}.`,
  ].join("\n");
}

export function textoSenalSubuso(s: SnapshotTallerSemana, u: SenalSubuso): string {
  return [
    `*CSX semanal — llamar* — ${slackEscape(s.taller)}`,
    slackEscape(u.titulo),
    slackEscape(u.detalle),
    `*Script:* ${slackEscape(u.scriptLlamada)}`,
    `*Tel:* ${slackEscape(s.contactoTelefono)}`,
  ].join("\n");
}

export function textoDestacados(d: DestacadosSemana): string {
  const s = d.taller;
  const lineasMetricas = d.metricas
    .map((m) => `• *${slackEscape(m.label)}:* ${slackEscape(m.valor)}`)
    .join("\n");

  const citas =
    d.citas.length === 0
      ? "_Sin citas esta semana._"
      : d.citas
          .map((c) => `> _«${slackEscape(c.texto)}»_ — ${slackEscape(c.quien)}`)
          .join("\n");

  const acciones =
    d.accionables.length === 0
      ? "_Nada urgente. Sigue el ritmo._"
      : d.accionables
          .map(
            (a, i) =>
              `${i + 1}. *[${a.prioridad}]* ${slackEscape(a.titulo)}\n` +
              `   Por qué: ${slackEscape(a.porQue)}\n` +
              `   Qué decir: ${slackEscape(a.queDecir)}`,
          )
          .join("\n");

  const bloqueUpsell = d.upsell
    ? `\n*Señal upsell:* ${PLAN_LABEL[d.upsell.planActual]} → ${PLAN_LABEL[d.upsell.planSugerido]} (${d.upsell.motivo})\n${slackEscape(d.upsell.detalle)}`
    : "";

  const bloqueSubuso = d.subuso
    ? `\n*Señal subuso:* ${slackEscape(d.subuso.titulo)}`
    : "";

  return [
    `*Destacados ${slackEscape(d.periodoLabel)}* — ${slackEscape(s.taller)} · ${slackEscape(s.sucursal)}`,
    "",
    "*Métricas*",
    lineasMetricas,
    bloqueUpsell,
    bloqueSubuso,
    "",
    "*Citas*",
    citas,
    "",
    "*Accionables CSX*",
    acciones,
  ]
    .filter((x) => x !== "")
    .join("\n");
}

/** Etiqueta de semana ISO simple (lun–dom) en es-ES. */
export function labelSemana(ref: Date = new Date()): string {
  const d = new Date(ref);
  const day = d.getUTCDay() || 7;
  if (day !== 1) d.setUTCDate(d.getUTCDate() - (day - 1));
  const fin = new Date(d);
  fin.setUTCDate(d.getUTCDate() + 6);
  const fmt = (x: Date) =>
    x.toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
  return `${fmt(d)} – ${fmt(fin)}`;
}
