import * as Sentry from "@sentry/nextjs";
import type { EventoSeguridad } from "./events";

/**
 * Persistencia mientras Supabase no está aplicado:
 *
 * 1. Una línea JSON en stdout con marca `mecanu.security`. En Vercel se busca
 *    en el log drain. No es 90 días — Hobby guarda poco; la retención real
 *    llega con la tabla `security_events` (migración escrita, no aplicada).
 * 2. Sentry, si hay DSN, para los tipos que piden alerta inmediata.
 *
 * No hay contraataque. No se llama a ningún servicio con la IP del visitante.
 */

const ALERTA_INMEDIATA: EventoSeguridad["tipo"][] = [
  "canary_used",
  "assistant_injection",
  "sondeo_sistematico",
];

export function registrarEvento(evento: EventoSeguridad, extra?: Record<string, unknown>): void {
  const linea = { src: "mecanu.security", ...evento, extra: extra ?? {} };
  console.info(JSON.stringify(linea));

  if (!ALERTA_INMEDIATA.includes(evento.tipo)) return;

  Sentry.captureMessage(`security:${evento.tipo}`, {
    level: "warning",
    tags: {
      tipo: evento.tipo,
      ruta: evento.ruta,
      tecnica: evento.tecnica ?? "ninguna",
      pais: evento.geo.pais ?? "?",
    },
    extra: { ip: evento.ip, userAgent: evento.userAgent, resumen: evento.resumen },
  });
}

const HONEYPOTS_POR_IP = new Map<string, Set<string>>();

/** Varios señuelos distintos desde la misma IP en poco tiempo = escáner. */
export function anotarSondeo(ip: string, ruta: string): boolean {
  const set = HONEYPOTS_POR_IP.get(ip) ?? new Set<string>();
  set.add(ruta);
  HONEYPOTS_POR_IP.set(ip, set);
  return set.size >= 3;
}
