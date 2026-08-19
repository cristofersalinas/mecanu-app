/**
 * Rate limiting en memoria, por proceso.
 *
 * En Vercel Hobby cada invocación puede caer en una instancia distinta, así
 * que esto no es un muro global: es un freno por instancia más el 429 con
 * Retry-After. El muro de verdad, cuando hace falta, son las 3 reglas del
 * firewall (ver SEGURIDAD-RUNBOOK.md).
 *
 * No hay Redis ni dependencia nueva: el backend aún no está desplegado y un
 * store externo sería otro secreto y otra cuota.
 */

export type RateLimitResultado = {
  permitido: boolean;
  restante: number;
  retryAfterSeg: number;
};

type Cubo = { marcas: number[] };

const cubos = new Map<string, Cubo>();

const LIMITE_POR_DEFECTO = { ventanaMs: 60_000, max: 60 };

export type RateLimitRegla = {
  ventanaMs: number;
  max: number;
};

/** Más estricto en escrituras: un humano no hace 60 POST por minuto; un script sí. */
export const REGLA_API_LECTURA: RateLimitRegla = { ventanaMs: 60_000, max: 60 };
export const REGLA_API_ESCRITURA: RateLimitRegla = { ventanaMs: 60_000, max: 20 };
export const REGLA_HONEYPOT: RateLimitRegla = { ventanaMs: 60_000, max: 10 };
export const REGLA_ASISTENTE: RateLimitRegla = { ventanaMs: 60_000, max: 8 };
export const REGLA_CONTACTO: RateLimitRegla = { ventanaMs: 10 * 60_000, max: 3 };

export function comprobarRateLimit(
  clave: string,
  ahora = Date.now(),
  regla: RateLimitRegla = LIMITE_POR_DEFECTO,
): RateLimitResultado {
  const cubo = cubos.get(clave) ?? { marcas: [] };
  const desde = ahora - regla.ventanaMs;
  cubo.marcas = cubo.marcas.filter((t) => t > desde);

  if (cubo.marcas.length >= regla.max) {
    cubos.set(clave, cubo);
    const masAntigua = cubo.marcas[0] ?? ahora;
    const retryAfterSeg = Math.max(1, Math.ceil((masAntigua + regla.ventanaMs - ahora) / 1000));
    return { permitido: false, restante: 0, retryAfterSeg };
  }

  cubo.marcas.push(ahora);
  cubos.set(clave, cubo);
  return {
    permitido: true,
    restante: regla.max - cubo.marcas.length,
    retryAfterSeg: 0,
  };
}

/** Solo tests: el mapa vive el tiempo del proceso. */
export function resetRateLimitForTests(): void {
  cubos.clear();
}

/**
 * IP del cliente según las cabeceras que Vercel (o un proxy) ya rellenó.
 * No se resuelve DNS ni se llama a ningún geo-IP de terceros.
 */
export function ipDeRequest(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const primera = forwarded.split(",")[0]?.trim();
    if (primera) return primera;
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

export function metodoEsEscritura(metodo: string): boolean {
  return metodo !== "GET" && metodo !== "HEAD" && metodo !== "OPTIONS";
}
