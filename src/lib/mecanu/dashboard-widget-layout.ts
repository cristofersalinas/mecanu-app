/**
 * Reglas visuales por tipo de widget: columnas rectangulares (sin resto)
 * y altura mínima coherente con el contenido.
 */

/** Nº fijo de ítems por métrica de grupo (plantillas + catálogo). */
export const CONTEO_ITEMS_GRUPO: Record<string, number> = {
  kpis_generales: 5,
  kpis_traslados: 4,
  kpis_tareas: 4,
  kpis_campanas: 4,
  indicadores_traslado: 4,
};

export function conteoItemsGrupo(metricaId: string): number | null {
  return CONTEO_ITEMS_GRUPO[metricaId] ?? null;
}

/** Divisores de n en [1..n], p. ej. 4 → [1,2,4]. */
export function divisoresDe(n: number): number[] {
  if (n <= 1) return [1];
  const out: number[] = [];
  for (let d = 1; d <= n; d++) {
    if (n % d === 0) out.push(d);
  }
  return out;
}

/**
 * Columnas para un grupo de N métricas.
 * Solo divisores de N → layouts 1×N, 2×(N/2), …, N×1. Nunca 3+1.
 */
export function columnasGrupo(n: number, w: number): number {
  if (n <= 1) return 1;
  const divisores = divisoresDe(n);

  if (w >= 10) {
    return n; // una fila
  }
  if (w >= 6) {
    const medios = divisores.filter((d) => d > 1 && d < n);
    if (medios.length === 0) return 1; // p. ej. n=5 → apilar
    const target = Math.sqrt(n);
    return medios.reduce((a, b) =>
      Math.abs(a - target) <= Math.abs(b - target) ? a : b);
  }
  return 1; // una columna
}

/**
 * Filas de grid mínimas para caber header + filas de cards.
 * ~28px/fila: header≈2, cada fila de cards≈3.
 */
export function minHGrupo(n: number, w: number): number {
  const cols = columnasGrupo(n, w);
  const rows = Math.ceil(n / Math.max(1, cols));
  return Math.max(3, 2 + rows * 3);
}
