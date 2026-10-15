/**
 * Efecto de avanzar un subestado de EN RUTA sobre tramo y ruta.
 *
 * El POST /api/v1/traslados/:id/subestado no solo pinta el peldaño del tramo:
 * el primer paso (y cualquiera de los cuatro) promociona la ruta a `en_ruta`.
 * Vive aquí para que mock y Supabase apliquen el mismo parche.
 */
import { PASOS_EN_RUTA } from './mecanu-pipeline';
import type { EstadoRuta, EstadoTramo, RolTramo } from './types';

export interface EfectoAvanceSubestadoEnRuta {
  tramo: { estado: EstadoTramo; subestado: string };
  ruta: { estado: EstadoRuta; subestado: string };
}

export function esPasoEnRuta(a: string): boolean {
  return PASOS_EN_RUTA.includes(a);
}

/** `null` si `a` no es un peldaño de EN RUTA (el caller no debe tocar la ruta). */
export function efectoAvanceSubestadoEnRuta(a: string): EfectoAvanceSubestadoEnRuta | null {
  if (!esPasoEnRuta(a)) return null;
  return {
    tramo: { estado: 'en_curso', subestado: a },
    ruta: { estado: 'en_ruta', subestado: a },
  };
}

/**
 * Entrega del tramo (taller o cliente). El kanban lee `ruta.estado`, no el del
 * traslado: sin este parche la card se queda en EN RUTA aunque el móvil diga
 * Completado.
 */
export function efectoEntregaRuta(rol: RolTramo): { estado: EstadoRuta; subestado: string } {
  if (rol === 'vuelta') {
    return { estado: 'completado', subestado: 'ok' };
  }
  return { estado: 'en_taller', subestado: 'esperando_agenda_vuelta' };
}
