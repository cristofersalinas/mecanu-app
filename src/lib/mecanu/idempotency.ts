/**
 * Idempotencia: Postgres `idempotency_keys` si hay Supabase; si no, Map en memoria.
 * Misma API pública que usaba el placeholder (api-helpers / withIdempotency).
 */
import { getSupabaseServer, supabaseServerConfigured } from '@/lib/supabase/server';

export const IDEMPOTENCY_HEADER = 'Idempotency-Key';

interface CachedResponse {
  status: number;
  body: unknown;
  storedAt: number;
}

const TTL_MS = 48 * 60 * 60 * 1000;
const store = new Map<string, CachedResponse>();

function purgeExpired(now: number) {
  for (const [key, entry] of store) {
    if (now - entry.storedAt > TTL_MS) store.delete(key);
  }
}

export function getIdempotentResponse(key: string): CachedResponse | null {
  purgeExpired(Date.now());
  return store.get(key) ?? null;
}

export function saveIdempotentResponse(key: string, status: number, body: unknown): void {
  store.set(key, { status, body, storedAt: Date.now() });
}

/** Lectura async (Postgres o memoria). */
export async function getIdempotentResponseAsync(key: string): Promise<CachedResponse | null> {
  if (supabaseServerConfigured()) {
    const sb = getSupabaseServer();
    if (sb) {
      const { data, error } = await sb
        .from('idempotency_keys')
        .select('status, response, created_at')
        .eq('key', key)
        .maybeSingle();
      if (!error && data) {
        const storedAt = new Date(data.created_at as string).getTime();
        if (Date.now() - storedAt <= TTL_MS) {
          return {
            status: data.status as number,
            body: data.response,
            storedAt,
          };
        }
      }
    }
  }
  return getIdempotentResponse(key);
}

/** Escritura async (Postgres + memoria de respaldo). */
export async function saveIdempotentResponseAsync(
  key: string,
  status: number,
  body: unknown,
): Promise<void> {
  saveIdempotentResponse(key, status, body);
  if (!supabaseServerConfigured()) return;
  const sb = getSupabaseServer();
  if (!sb) return;
  const { error } = await sb.from('idempotency_keys').upsert(
    {
      key,
      status,
      response: body as object,
      created_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  );
  if (error) {
    console.error('idempotency_keys upsert failed', error.message);
  }
}

/** Tests: vacía el Map en memoria. */
export function clearIdempotencyMemoryForTests(): void {
  store.clear();
}
