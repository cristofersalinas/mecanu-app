/**
 * Registro del service worker de la app del conductor.
 *
 * Se llama SOLO desde `ConductorApp` (ver `useEffect` ahí abajo), nunca desde
 * el layout raíz ni desde ningún componente de `/panel` — así el registro
 * queda acotado a `scope: '/conductor'` y el service worker nunca llega a
 * controlar el panel del taller.
 */
export function registerConductorServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  // No tiene sentido registrar un SW mientras se desarrolla con `next dev`:
  // el hot-reload y el SW compiten por el mismo caché. Solo en producción.
  if (process.env.NODE_ENV !== 'production') return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw-conductor.js', { scope: '/conductor' })
      .catch(() => {
        // Registro best-effort: si falla (navegador sin soporte, HTTP sin
        // TLS, etc.) la app sigue funcionando online, solo sin caché offline.
      });
  });
}
