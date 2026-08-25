'use client';

import { useCallback } from 'react';
import { usePanel } from './store';

/** Filtros del módulo activo sincronizados con la URL (`f.q`, `f.estado`, …). */
export function usePanelUrlFiltros() {
  const p = usePanel();

  const filtro = useCallback(
    (key: string, fallback = '') => p.filtrosUrl[key] ?? fallback,
    [p.filtrosUrl],
  );

  const setFiltro = useCallback(
    (key: string, value: string | undefined) => p.setFiltroUrl(key, value),
    [p.setFiltroUrl],
  );

  return {
    filtros: p.filtrosUrl,
    filtro,
    setFiltro,
    limpiar: p.limpiarFiltrosUrl,
  };
}
