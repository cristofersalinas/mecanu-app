/**
 * Reemplaza el contenido de arrays exportados por data.ts (mutación in-place)
 * para que los imports síncronos vean datos de Postgres tras hidratar.
 */
export function reemplazarArray<T>(destino: T[], fuente: T[]): void {
  destino.splice(0, destino.length, ...fuente);
}

export function revivirFechas<T>(valor: T): T {
  if (valor == null || typeof valor !== 'object') return valor;
  if (Array.isArray(valor)) return valor.map((x) => revivirFechas(x)) as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
      const d = new Date(v);
      out[k] = Number.isNaN(d.getTime()) ? v : d;
    } else if (v && typeof v === 'object') {
      out[k] = revivirFechas(v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

export function supabasePanelActivo(): boolean {
  return (
    process.env.NEXT_PUBLIC_MECANU_USE_SUPABASE === '1'
    || process.env.MECANU_USE_SUPABASE === '1'
  );
}
