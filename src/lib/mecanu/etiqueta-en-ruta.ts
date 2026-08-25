/**
 * Capa de vista: lo que ve el taller / el cliente sobre un viaje EN RUTA.
 * No toca labels de pipeline; el kanban pinta el hecho, no el nombre interno.
 */

const FRASES: Record<string, string> = {
  en_camino_origen: 'en camino',
  en_origen: 'en origen',
  en_transito: 'en tránsito',
  en_destino: 'en destino',
};

export const PASOS_STEPPER_EN_RUTA = ['En camino', 'En origen', 'En tránsito', 'En destino'] as const;

const ORDEN_STEPPER = ['en_camino_origen', 'en_origen', 'en_transito', 'en_destino'] as const;

export function primerNombre(nombre: string | null | undefined): string | null {
  const n = nombre?.trim().split(/\s+/)[0];
  return n || null;
}

/**
 * Pill del kanban y de la ficha en EN RUTA: solo la frase («En camino», «En origen»…).
 * El nombre del conductor no se muestra en la píldora.
 */
export function etiquetaEnRutaKanban(
  estado: string,
  subestado: string,
  _nombreConductor?: string | null,
): string | null {
  if (estado !== 'en_ruta') return null;
  const frase = FRASES[subestado];
  if (!frase) return null;
  return frase.charAt(0).toUpperCase() + frase.slice(1);
}

/** Índice del stepper del móvil. `agendado` → -1 (ningún peldaño activo). */
export function indiceStepperEnRuta(sub: string, hecho: boolean): number {
  if (hecho || sub === 'completado') return 4;
  const i = (ORDEN_STEPPER as readonly string[]).indexOf(sub);
  return i >= 0 ? i : -1;
}

export function combustiblePct(combustible: string | null | undefined): number {
  if (combustible === '1/4') return 25;
  if (combustible === '1/2') return 50;
  if (combustible === '3/4') return 75;
  if (combustible === 'Lleno') return 100;
  return 0;
}

export function tipoSolicitudApi(
  tipo: 'reagenda' | 'rechazo' | 'fallido' | 'no_rodante',
): 'reagenda' | 'rechazo' | 'fallido_origen' | 'no_rodante' {
  return tipo === 'fallido' ? 'fallido_origen' : tipo;
}

/** blob: no viaja al servidor; data: y https sí. */
export function urlEvidenciaPublicable(url: string | null | undefined): string | null {
  if (!url || url.startsWith('blob:')) return null;
  return url;
}
