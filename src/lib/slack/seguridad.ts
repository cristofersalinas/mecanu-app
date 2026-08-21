/**
 * Alertas de seguridad P0 → Slack `#alertas`.
 * Solo tres tipos (mismo criterio que Sentry). Dedupe por tipo+IP para no
 * inundar el canal si un escáner insiste.
 */
import type { EventoSeguridad } from "@/lib/security/events";
import { publicarSlack, slackEscape } from "./notify";

export const TIPOS_P0_SLACK: EventoSeguridad["tipo"][] = [
  "canary_used",
  "assistant_injection",
  "sondeo_sistematico",
];

/** No reavisar el mismo tipo+IP en esta ventana (ms). */
export const DEDUPE_P0_MS = 15 * 60 * 1000;

const TAG: Record<(typeof TIPOS_P0_SLACK)[number], string> = {
  canary_used: "#canary",
  assistant_injection: "#inyeccion",
  sondeo_sistematico: "#sondeo",
};

const TITULO: Record<(typeof TIPOS_P0_SLACK)[number], string> = {
  canary_used: "Canary usado — alguien reutilizó una trampa del .env falso",
  assistant_injection: "Inyección contra el asistente señuelo",
  sondeo_sistematico: "Sondeo sistemático — varios señuelos desde la misma IP",
};

const QUE_HACER: Record<(typeof TIPOS_P0_SLACK)[number], string> = {
  canary_used:
    "Vercel Firewall → IP Blocking → Deny esa IP. No hace falta rotar secretos (canaries inertes).",
  assistant_injection:
    "Leer el resumen/técnica. Si insiste: Deny IP. El asistente no tiene modelo real.",
  sondeo_sistematico:
    "Vercel Firewall → IP Blocking → Deny. No hace falta rotar secretos.",
};

const ultimosAvisos = new Map<string, number>();

export function esTipoP0Slack(tipo: EventoSeguridad["tipo"]): boolean {
  return (TIPOS_P0_SLACK as readonly string[]).includes(tipo);
}

export function claveDedupeP0(evento: EventoSeguridad): string {
  return `${evento.tipo}:${evento.ip}`;
}

/** true = aún no avisamos (o caducó el dedupe) → hay que publicar. */
export function debeAvisarP0Slack(
  evento: EventoSeguridad,
  ahora = Date.now(),
  store: Map<string, number> = ultimosAvisos,
): boolean {
  if (!esTipoP0Slack(evento.tipo)) return false;
  const clave = claveDedupeP0(evento);
  const prev = store.get(clave);
  if (prev !== undefined && ahora - prev < DEDUPE_P0_MS) return false;
  store.set(clave, ahora);
  return true;
}

export function textoAlertaSeguridadP0(
  evento: EventoSeguridad,
  extra?: Record<string, unknown>,
): string {
  const tipo = evento.tipo as (typeof TIPOS_P0_SLACK)[number];
  const geo = [evento.geo.pais, evento.geo.region, evento.geo.ciudad]
    .filter(Boolean)
    .join(" / ");
  const lineas = [
    `[P0 · CRITICA]  #seguridad  ${TAG[tipo]}  ·  ${slackEscape(evento.ip)}`,
    TITULO[tipo],
    `IP: ${slackEscape(evento.ip)}${geo ? ` · ${slackEscape(geo)}` : ""}`,
    `Ruta: ${slackEscape(evento.ruta)} · ${slackEscape(evento.metodo)}`,
    evento.userAgent
      ? `UA: ${slackEscape(evento.userAgent.slice(0, 160))}`
      : "UA: (vacío)",
    `Resumen: ${slackEscape(evento.resumen.slice(0, 240))}`,
  ];
  if (evento.tecnica && evento.tecnica !== "ninguna") {
    lineas.push(`Técnica: ${slackEscape(evento.tecnica)}`);
  }
  if (extra && Object.keys(extra).length > 0) {
    const preview = JSON.stringify(extra).slice(0, 280);
    lineas.push(`Evidencia: ${slackEscape(preview)}`);
  }
  lineas.push(`Qué hacer: ${QUE_HACER[tipo]}`);
  return lineas.join("\n");
}

/**
 * Publica a `#alertas` solo P0 y con dedupe. Nunca lanza: un fallo de Slack
 * no debe tumbar el proxy.
 */
export async function avisarSeguridadP0Slack(
  evento: EventoSeguridad,
  extra?: Record<string, unknown>,
): Promise<"skipped" | "ok" | "deduped" | "error"> {
  if (!debeAvisarP0Slack(evento)) return "deduped";
  try {
    const r = await publicarSlack({
      channel: process.env.SLACK_CHANNEL_ALERTAS,
      text: textoAlertaSeguridadP0(evento, extra),
    });
    return r.status;
  } catch (err) {
    console.error("[slack.seguridad]", err);
    return "error";
  }
}
