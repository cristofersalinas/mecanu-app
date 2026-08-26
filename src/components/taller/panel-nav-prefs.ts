/**
 * Preferencia de UI: menú lateral del panel comprimido o expandido.
 * Cookie para que el SSR pinte el mismo estado al recargar; localStorage
 * como respaldo entre pestañas.
 */

export const PANEL_NAV_MIN_COOKIE = 'mcn_panel_nav_min';
const STORAGE_KEY = 'mecanu.panel.nav:v1';

export function setPanelNavMinimizado(minimizado: boolean) {
  const raw = minimizado ? '1' : '0';
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, raw);
    }
  } catch {
    /* privado / cuota */
  }
  if (typeof document !== 'undefined') {
    const maxAge = 60 * 60 * 24 * 400; // ~13 meses
    document.cookie = `${PANEL_NAV_MIN_COOKIE}=${raw};path=/;max-age=${maxAge};SameSite=Lax`;
  }
}
