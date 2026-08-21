/**
 * Cuándo el check-in del conductor crea una oferta de revisión pre-ITV (SV-04).
 * Pura: sin repo, sin fechas de reloj salvo las que le pases.
 */

export const UMBRAL_DIAS_ITV = 60;
export const SERVICIO_ITV_ID = 'SV-04';

export type MotivoOfertaItv = 'sin_pegatina' | 'vencida' | 'por_vencer';

export function motivoOfertaItv(input: {
  itvSinDato: boolean;
  /** Días hasta el fin de mes de la pegatina. `null` = no hay fecha. */
  dias: number | null;
}): MotivoOfertaItv | null {
  if (input.itvSinDato) return 'sin_pegatina';
  if (input.dias == null) return null;
  if (input.dias < 0) return 'vencida';
  if (input.dias < UMBRAL_DIAS_ITV) return 'por_vencer';
  return null;
}

export function debeCrearOfertaItv(input: {
  itvSinDato: boolean;
  dias: number | null;
}): boolean {
  return motivoOfertaItv(input) !== null;
}

/** Nivel del hallazgo para `POST /api/v1/campanas/hallazgos`. */
export function nivelHallazgoItv(motivo: MotivoOfertaItv): 3 | 4 {
  return motivo === 'por_vencer' ? 3 : 4;
}

export function etiquetaCheckinItv(motivo: MotivoOfertaItv | null, dias: number | null): string | null {
  if (motivo === 'sin_pegatina') return 'Sin pegatina · se crea oferta de revisión pre-ITV';
  if (motivo === 'vencida') {
    return 'ITV no hecha · vencida hace ' + Math.abs(dias ?? 0) + ' días · se crea oferta';
  }
  if (motivo === 'por_vencer') {
    return 'Por vencer · quedan ' + dias + ' días · se crea oferta de revisión pre-ITV';
  }
  if (dias != null) return 'Vigente · quedan ' + dias + ' días';
  return null;
}

export function fallaOfertaItv(motivo: MotivoOfertaItv): string {
  if (motivo === 'sin_pegatina') return 'ITV sin pegatina en el parabrisas';
  if (motivo === 'vencida') return 'ITV no hecha / vencida';
  return 'ITV por vencer';
}

export function evidenciaOfertaItv(motivo: MotivoOfertaItv, dias: number | null): string {
  if (motivo === 'sin_pegatina') return 'Check-in: el conductor no vio la pegatina de ITV';
  if (motivo === 'vencida') return 'Check-in: ITV vencida hace ' + Math.abs(dias ?? 0) + ' días';
  return 'Check-in: ITV vence en ' + (dias ?? UMBRAL_DIAS_ITV) + ' días';
}
