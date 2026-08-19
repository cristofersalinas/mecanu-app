/**
 * Capa de eventos hacia GTM. Todo pasa por `dataLayer`, nunca se llama a GA4
 * directamente: así el consentimiento y el enrutado de eventos viven en GTM y
 * no hay una segunda vía que se salte el banner.
 *
 * Empujar a `dataLayer` antes de que GTM cargue es seguro y deliberado: es un
 * array normal, GTM lo procesa entero al arrancar. Si el usuario nunca acepta,
 * GTM no carga y el array se queda en memoria sin salir del navegador.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "";

/**
 * La analítica solo se activa en producción. `NEXT_PUBLIC_ANALYTICS_DEBUG=1`
 * es la puerta para la verificación automatizada del consentimiento, que
 * necesita ejecutar los scripts fuera de producción — ver
 * `scripts/verificar-consentimiento.mjs`.
 */
export function analiticaHabilitada(): boolean {
  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "1") return true;
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
}

export function pushDataLayer(evento: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(evento);
}

export type ConversionEvent =
  | "cta_principal"
  | "envio_formulario"
  | "clic_whatsapp"
  | "clic_saliente"
  | "profundidad_scroll";

export function trackConversion(
  event: ConversionEvent,
  params: Record<string, unknown> = {},
): void {
  pushDataLayer({ event, ...params });
}
