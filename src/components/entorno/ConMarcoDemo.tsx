'use client';

import { useSyncExternalStore } from 'react';
import { esModoDemo } from '@/lib/entorno';
import css from './ConMarcoDemo.module.css';

const PUERTO_DEMO_FALLBACK = '3001';

function suscribirNada() {
  return () => {};
}

function puertoEnCliente(): string {
  return window.location.port || PUERTO_DEMO_FALLBACK;
}

/**
 * Cinta fija e imposible de ignorar con `npm run demo`.
 * No se pinta en mecanu.com ni con `npm run dev`.
 */
export function ConMarcoDemo({ children }: { children: React.ReactNode }) {
  const puerto = useSyncExternalStore(suscribirNada, puertoEnCliente, () => PUERTO_DEMO_FALLBACK);

  if (!esModoDemo()) return children;

  return (
    <div className={css.marco}>
      <div className={css.barra} role="status" aria-live="polite">
        <span className={css.texto}>MODO DEMO · puerto {puerto}</span>
        <span className={css.sub} aria-hidden>
          No es mecanu.com · Simular activo · npm run dev para salir
        </span>
      </div>
      <div className={css.contenido}>{children}</div>
    </div>
  );
}
