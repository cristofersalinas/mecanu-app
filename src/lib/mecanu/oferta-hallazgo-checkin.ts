/**
 * Catálogo check-in del conductor → servicio del tempario.
 * Solo claves con mapeo generan campaña automática (el resto se registra en log).
 */
import { CATALOGO_DETECCION } from './mecanu-data';

/** Testigos ámbar del conductor → id de CATALOGO_DETECCION / SV-*. */
const TESTIGO_A_DETECCION: Record<string, string> = {
  motor: 'aceite',
  presion: 'neumaticos',
  bateria: 'bateria',
  general: 'aceite',
};

/** Ítems de inspección visual (nivel ≥ 2) → detección. */
const ITEM_A_DETECCION: Record<string, string> = {
  plumillas: 'escobillas',
  focos: 'focos',
  bateria: 'bateria',
  carroceria: 'carroceria',
  cristales: 'cristales',
  limpieza: 'limpieza',
};

/** Cualquier rueda con nivel ≥ 2 → neumáticos. */
const RUEDA_DETECCION = 'neumaticos';

export function claveHallazgoNormalizada(testigo: string): {
  kind: 'itv' | 'testigo' | 'item' | 'rueda' | 'otro';
  key: string;
} {
  if (testigo === 'itv') return { kind: 'itv', key: 'itv' };
  if (testigo.startsWith('item:')) return { kind: 'item', key: testigo.slice(5) };
  if (testigo.startsWith('rueda:')) return { kind: 'rueda', key: testigo.slice(6) };
  return { kind: 'testigo', key: testigo };
}

/** Clave de `CATALOGO_DETECCION` (neumaticos, focos…). `null` = sin oferta automática. */
export function tipoDeteccionParaHallazgo(testigo: string): string | null {
  const { kind, key } = claveHallazgoNormalizada(testigo);
  if (kind === 'itv') return 'itv';
  if (kind === 'rueda') return RUEDA_DETECCION;
  if (kind === 'item') return ITEM_A_DETECCION[key] ?? null;
  if (kind === 'testigo') return TESTIGO_A_DETECCION[key] ?? null;
  return null;
}

/** `null` = no hay oferta automática (solo log). */
export function servicioIdParaHallazgoCheckin(testigo: string): string | null {
  const tipo = tipoDeteccionParaHallazgo(testigo);
  if (!tipo) return null;
  return CATALOGO_DETECCION[tipo]?.servicioId ?? null;
}

export function etiquetaHallazgoCheckin(testigo: string): string {
  const { kind, key } = claveHallazgoNormalizada(testigo);
  if (kind === 'itv') return 'ITV';
  if (kind === 'rueda') {
    const labels: Record<string, string> = {
      di: 'Neumático del. izq.',
      dd: 'Neumático del. der.',
      ti: 'Neumático tras. izq.',
      td: 'Neumático tras. der.',
    };
    return labels[key] ?? `Neumático (${key})`;
  }
  if (kind === 'item') {
    const labels: Record<string, string> = {
      plumillas: 'Plumillas',
      focos: 'Focos y mica',
      bateria: 'Batería',
      carroceria: 'Carrocería',
      cristales: 'Cristales',
      limpieza: 'Limpieza interior',
    };
    return labels[key] ?? key;
  }
  const labels: Record<string, string> = {
    motor: 'Check engine',
    presion: 'Presión de neumáticos',
    bateria: 'Batería / carga',
    general: 'Avería general',
  };
  return labels[key] ?? key;
}

export function severidadDesdeNivel(nivel: number): 'warning' | 'alert' {
  return nivel >= 4 ? 'alert' : 'warning';
}
