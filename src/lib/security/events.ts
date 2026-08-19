/**
 * Eventos de seguridad. Forma estable para el futuro panel del backoffice
 * (MODELO-DATOS.md no cubre esta tabla: es infraestructura, no negocio).
 *
 * `payload` no incluye secretos reales. Sí puede incluir credenciales *intentadas*
 * contra el login señuelo y el texto de un prompt contra el asistente señuelo:
 * eso es evidencia, y la política de privacidad lo declara.
 */

export const TIPOS_EVENTO = [
  "honeypot_hit",
  "fake_login",
  "canary_used",
  "rate_limited",
  "assistant_prompt",
  "assistant_injection",
  "sondeo_sistematico",
] as const;

export type TipoEvento = (typeof TIPOS_EVENTO)[number];

export const TECNICAS_INJECTION = [
  "system_prompt",
  "credenciales",
  "ejecucion",
  "exfiltracion",
  "jailbreak",
  "ninguna",
] as const;

export type TecnicaInjection = (typeof TECNICAS_INJECTION)[number];

export type GeoPasiva = {
  pais: string | null;
  region: string | null;
  ciudad: string | null;
};

export type EventoSeguridad = {
  tipo: TipoEvento;
  ts: string;
  ip: string;
  geo: GeoPasiva;
  userAgent: string | null;
  metodo: string;
  ruta: string;
  tecnica: TecnicaInjection | null;
  /** Recorte. El registro largo vive en el log estructurado, no en Sentry. */
  resumen: string;
};
