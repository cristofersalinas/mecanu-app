/**
 * Idempotencia en memoria para las API routes de `src/app/api/v1/`.
 *
 * La app del conductor es offline-first: encola acciones localmente y las reintenta
 * al recuperar conexión (ver HANDOFF.md §7.5). Un reintento de red puede reenviar la
 * misma petición dos veces (el cliente nunca sabe con certeza si la primera llegó).
 * Cada escritura debe poder repetirse sin duplicar su efecto.
 *
 * Este módulo es un placeholder de desarrollo: un `Map` en memoria del proceso, que
 * se vacía en cada redeploy y no se comparte entre instancias serverless.
 *
 * // TODO API: sustituir por una tabla Postgres `idempotency_keys(key text primary key,
 * // response jsonb, created_at timestamptz)` con un índice único en `key` y un cron/TTL
 * // que la limpie pasadas ~48h. La escritura de la fila y la mutación de negocio deben
 * // ir en la misma transacción para que sean atómicas.
 */

interface CachedResponse {
  status: number;
  body: unknown;
  storedAt: number;
}

const TTL_MS = 24 * 60 * 60 * 1000;
const store = new Map<string, CachedResponse>();

function purgeExpired(now: number) {
  for (const [key, entry] of store) {
    if (now - entry.storedAt > TTL_MS) store.delete(key);
  }
}

/** Devuelve la respuesta cacheada para esta clave, si existe y no ha expirado. */
export function getIdempotentResponse(key: string): CachedResponse | null {
  purgeExpired(Date.now());
  return store.get(key) ?? null;
}

/** Registra la respuesta de una escritura contra su clave de idempotencia. */
export function saveIdempotentResponse(key: string, status: number, body: unknown): void {
  store.set(key, { status, body, storedAt: Date.now() });
}

/** Header que el cliente debe enviar en cada escritura. Ver CONTRATOS-API.md. */
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';
