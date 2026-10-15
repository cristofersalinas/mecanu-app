/**
 * Ciclo de vida del cliente (etiquetas WhatsApp + campo en `clientes`).
 * Una sola regla: la usan la bandeja, el CRM y futuras vistas de contactos.
 */
export const CICLOS_VIDA = [
  'prospecto',
  'registrado',
  'nuevo',
  'recompra',
  'fidelizado',
  'en_riesgo',
  'perdido',
] as const;

export type CicloVidaCliente = (typeof CICLOS_VIDA)[number];

export const CICLO_VIDA_LABEL: Record<CicloVidaCliente, string> = {
  prospecto: 'Prospecto',
  registrado: 'Registrado',
  nuevo: 'Nuevo',
  recompra: 'Recompra',
  fidelizado: 'Fidelizado',
  en_riesgo: 'En riesgo',
  perdido: 'Perdido',
};

/** Meses sin compra → en riesgo / perdido. */
export const MESES_EN_RIESGO = 13;
export const MESES_PERDIDO = 20;

export interface EntradaCicloVida {
  /** Está en la tabla `clientes` del taller. */
  registrado: boolean;
  /** Órdenes de traslado completadas (rutas `completado`). */
  ordenesCompletadas: number;
  /** Fecha de la última orden completada. */
  ultimaOrdenEn: Date | null;
  ahora?: Date;
}

function mesesEntre(desde: Date, hasta: Date): number {
  const ms = hasta.getTime() - desde.getTime();
  if (ms <= 0) return 0;
  return ms / (1000 * 60 * 60 * 24 * 30.4375);
}

/**
 * Prioridad: sin ficha → prospecto; con ficha y 0 órdenes → registrado;
 * con órdenes, primero recencia (perdido / en riesgo), luego volumen.
 */
export function cicloVidaCliente(e: EntradaCicloVida): CicloVidaCliente {
  if (!e.registrado) return 'prospecto';
  const n = Math.max(0, Math.floor(e.ordenesCompletadas));
  if (n === 0) return 'registrado';

  const ahora = e.ahora ?? new Date();
  if (e.ultimaOrdenEn) {
    const meses = mesesEntre(e.ultimaOrdenEn, ahora);
    if (meses > MESES_PERDIDO) return 'perdido';
    if (meses > MESES_EN_RIESGO) return 'en_riesgo';
  }

  if (n >= 3) return 'fidelizado';
  if (n === 2) return 'recompra';
  return 'nuevo';
}

/** Dígitos para cruzar WhatsApp ↔ ficha (últimos 9 si hay país). */
export function digitosTelefonoClave(tel: string): string {
  const d = tel.replace(/\D/g, '');
  if (d.length > 9) return d.slice(-9);
  return d;
}

export function telefonosCoinciden(a: string, b: string): boolean {
  const x = digitosTelefonoClave(a);
  const y = digitosTelefonoClave(b);
  if (!x || !y) return false;
  return x === y || a.replace(/\D/g, '').endsWith(y) || b.replace(/\D/g, '').endsWith(x);
}
