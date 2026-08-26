'use client';

import { useEffect } from 'react';
import { usePanel } from './store';

/** Cierra la sidebar compacta al pulsar fuera de ella y fuera de la tarjeta que la abrió. */
export function useCerrarSidebarClickFuera(activo: boolean, onCerrar?: () => void) {
  const { seleccionar } = usePanel();

  useEffect(() => {
    if (!activo) return;

    const onDown = (e: MouseEvent) => {
      const el = e.target as Element | null;
      if (!el) return;
      if (el.closest('[data-sidebar-compact]')) return;
      if (el.closest('[data-abre-ficha-panel]')) return;
      if (onCerrar) onCerrar();
      else seleccionar(null);
    };

    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [activo, onCerrar, seleccionar]);
}
