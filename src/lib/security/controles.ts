import { timingSafeEqual } from "node:crypto";

/**
 * Controles puros del endurecimiento (SOC 2 CC6/CC7, ISO 27001 A.8).
 * Sin I/O: los routes deciden cuándo llamarlos.
 */

export const MENSAJE_ERROR_INTERNO = "Error inesperado del servidor.";

export function debeExigirSesion(input: {
  supabaseConfigurado: boolean;
  demo: boolean;
}): boolean {
  return input.supabaseConfigurado && !input.demo;
}

/** Comparación en tiempo constante. Longitud distinta o vacío → false, sin lanzar. */
export function secretoIgual(esperado: string, recibido: string): boolean {
  const a = Buffer.from(esperado);
  const b = Buffer.from(recibido);
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Solo `Authorization: Bearer`. El secreto en la query se queda en los logs. */
export function bearerValido(
  authorization: string | null | undefined,
  secreto: string | undefined,
): boolean {
  const secret = secreto?.trim() ?? "";
  if (!secret) return false;
  const header = authorization ?? "";
  if (!header.startsWith("Bearer ")) return false;
  return secretoIgual(secret, header.slice(7).trim());
}

/**
 * Con sesión obligatoria, el cron tiene que presentar el bearer.
 * Sin esa obligación (demo o sin Supabase) la ruta sigue abierta.
 * Secreto vacío y obligación activa → denegado.
 */
export function cronBearerPermitido(opts: {
  exigir: boolean;
  secreto: string | undefined;
  authorization: string | null | undefined;
}): boolean {
  if (!opts.exigir) return true;
  return bearerValido(opts.authorization, opts.secreto);
}

const FUGA_INTERNA =
  /postgres|supabase|sqlstate|syntax error|relation "|column "|service_role|password|bearer |eyJ[A-Za-z0-9_-]{8,}/i;

export function pareceFugaInterna(texto: string): boolean {
  return FUGA_INTERNA.test(texto);
}

/**
 * Copy de producto que ya enseña la UI, si encaja en la lista blanca.
 * Cualquier otro mensaje (Postgres, stacks, tokens) no sale al cliente.
 */
export function mensajeProductoOInterno(err: unknown, permitidos: RegExp): string | null {
  const raw = err instanceof Error ? err.message.trim() : "";
  if (!raw || raw.length > 180) return null;
  if (pareceFugaInterna(raw)) return null;
  if (!permitidos.test(raw)) return null;
  return raw;
}

export type CoordsStreetView = { lat: number; lng: number; heading: number };

const NUMERO = /^-?\d{1,3}(\.\d{1,8})?$/;

/**
 * Lat/lng/heading numéricos y acotados. Rechaza notación científica,
 * comas y cualquier cosa que no sea un número (la key de Google no viaja en la query).
 */
export function coordenadasStreetView(input: {
  lat: string | null;
  lng: string | null;
  heading: string | null;
}): CoordsStreetView | null {
  const latRaw = input.lat?.trim() ?? "";
  const lngRaw = input.lng?.trim() ?? "";
  if (!NUMERO.test(latRaw) || !NUMERO.test(lngRaw)) return null;
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return null;
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return null;

  const hRaw = (input.heading ?? "0").trim() || "0";
  if (!NUMERO.test(hRaw)) return null;
  const h = Number(hRaw);
  if (!Number.isFinite(h)) return null;
  const heading = ((h % 360) + 360) % 360;
  return { lat, lng, heading };
}
