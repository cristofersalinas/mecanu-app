/** Semáforo de vigencia de un servicio-alerta. Calculado, nunca persistido.
    La fecha recomendada es inclusiva en el día de vencimiento. */

export const UMBRAL_POR_VENCER_DIAS = 45;
export const UMBRAL_CADUCADO_DIAS = 45;
export const UMBRAL_VISIBILIDAD_DIAS = 60;

export type SemaforoVigencia = 'vigente' | 'por_vencer' | 'vencido' | 'caducado';

export const SEMAFORO_META: Record<SemaforoVigencia, {
  label: string;
  kind: 'positive' | 'warning' | 'alert';
  color: string;
}> = {
  vigente:    { label: 'Vigente',    kind: 'positive', color: 'var(--mecanu-positive)' },
  por_vencer: { label: 'Por vencer', kind: 'warning',  color: 'var(--mecanu-warning)' },
  vencido:    { label: 'Vencido',    kind: 'alert',    color: 'var(--mecanu-alert)' },
  caducado:   { label: 'Caducado',   kind: 'alert',    color: 'var(--mecanu-alert)' },
};

export const ORDEN_URGENCIA: Record<SemaforoVigencia, number> = {
  caducado: -1,
  vencido: 0,
  por_vencer: 1,
  vigente: 2,
};

function inicioDia(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Días de calendario con signo: fecha recomendada − hoy. */
export function diasHastaFecha(fecha: Date, hoy: Date): number {
  return Math.round((inicioDia(fecha) - inicioDia(hoy)) / 86_400_000);
}

/** `null` si no hay fecha — la UI dice "Pendiente de fecha", no inventa semáforo. */
export function semaforoVigencia(fecha: Date | null | undefined, hoy: Date): SemaforoVigencia | null {
  if (!fecha) return null;
  const delta = diasHastaFecha(fecha, hoy);
  if (delta <= -UMBRAL_CADUCADO_DIAS) return 'caducado';
  if (delta <= 0) return 'vencido';
  if (delta <= UMBRAL_POR_VENCER_DIAS) return 'por_vencer';
  return 'vigente';
}

export function comercialBloqueado(semaforo: SemaforoVigencia | null): boolean {
  return semaforo === 'vigente';
}

/** La tabla solo enseña oportunidades dentro de los próximos 60 días
    y conserva hasta 44 días de retraso antes de ocultarlas como caducadas. */
export function visibleEnTabla(fecha: Date | null | undefined, hoy: Date): boolean {
  if (!fecha) return false;
  const delta = diasHastaFecha(fecha, hoy);
  return delta < UMBRAL_VISIBILIDAD_DIAS && delta > -UMBRAL_CADUCADO_DIAS;
}
