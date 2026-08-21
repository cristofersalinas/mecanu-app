/**
 * Cliente Supabase solo servidor. Nunca importar desde componentes de cliente.
 * service_role bypasea RLS — solo API routes / scripts.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null | undefined;

function leerEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
  return { url, service };
}

/** true si hay URL + service_role reales (no placeholder). */
export function supabaseServerConfigured(): boolean {
  const { url, service } = leerEnv();
  if (!url || !service) return false;
  if (url.includes('your-project') || service === '[SENSITIVE]' || service === 'undefined') {
    return false;
  }
  try {
    new URL(url);
  } catch {
    return false;
  }
  return service.startsWith('eyJ') || service.startsWith('sb_secret');
}

/**
 * Cliente con service_role, o null si no hay credenciales (local sin keys).
 * Fail-soft: el mock e idempotencia en memoria siguen funcionando.
 */
export function getSupabaseServer(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  if (!supabaseServerConfigured()) {
    cached = null;
    return null;
  }
  const { url, service } = leerEnv();
  cached = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** Solo tests: limpia el singleton. */
export function resetSupabaseServerForTests(): void {
  cached = undefined;
}
