/**
 * Preferencia de UI: icono de conductor en el mapa de flota (General).
 * Solo localStorage — no afecta backend.
 */

export type IconoConductorFlota = 'auto' | 'volante' | 'persona';

export const ICONO_CONDUCTOR_DEFAULT: IconoConductorFlota = 'auto';

export const ICONOS_CONDUCTOR_FLOTA: readonly {
  id: IconoConductorFlota;
  label: string;
  /** Material Symbol; null = SVG volante propio. */
  icon: string | null;
}[] = [
  { id: 'auto', label: 'Auto', icon: 'directions_car' },
  { id: 'volante', label: 'Volante', icon: null },
  { id: 'persona', label: 'Persona', icon: 'person' },
];

const STORAGE_KEY = 'mecanu.flota.iconoConductor:v1';

export function etiquetaIconoConductor(id: IconoConductorFlota): string {
  return ICONOS_CONDUCTOR_FLOTA.find((x) => x.id === id)?.label ?? 'Auto';
}

export function leerIconoConductorFlota(): IconoConductorFlota {
  try {
    if (typeof window === 'undefined') return ICONO_CONDUCTOR_DEFAULT;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'auto' || raw === 'volante' || raw === 'persona') return raw;
  } catch {
    /* privado / cuota */
  }
  return ICONO_CONDUCTOR_DEFAULT;
}

export function guardarIconoConductorFlota(id: IconoConductorFlota) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  } catch {
    /* privado / cuota */
  }
}
