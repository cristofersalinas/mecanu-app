'use client';

import {
  leerEstadoUrl,
  panelSoportaUrlEstado,
  urlCompletaEstado,
  type PanelUrlEstado,
} from '@/lib/mecanu/panel-url-estado';
import type { PanelUbicacion } from '@/lib/mecanu/panel-rutas';
import type { NavId, Seleccion } from './store';

export { leerEstadoUrl, panelSoportaUrlEstado, type PanelUrlEstado };

export function urlsPanelActivas(): boolean {
  if (typeof window === 'undefined') return false;
  return panelSoportaUrlEstado({ pathname: window.location.pathname });
}

function locActual() {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    host: window.location.host,
  };
}

export function ubicacionDesdeUrl(): PanelUbicacion | null {
  if (!urlsPanelActivas()) return null;
  const e = leerEstadoUrl(locActual());
  return { nav: e.nav, sub: e.sub };
}

export function estadoCompletoDesdeUrl(): PanelUrlEstado | null {
  if (!urlsPanelActivas()) return null;
  return leerEstadoUrl(locActual());
}

/** Sincroniza módulo, subsección, ficha abierta y filtros con la barra de direcciones. */
export function sincronizarEstadoUrlPanel(
  input: {
    nav: NavId;
    sub: string;
    seleccion: Seleccion | null;
    modoFicha: 'panel' | 'ficha';
    filtros: Record<string, string>;
  },
  opts?: { replace?: boolean },
): void {
  if (!urlsPanelActivas()) return;

  const estado: PanelUrlEstado = {
    nav: input.nav as PanelUrlEstado['nav'],
    sub: input.sub,
    seleccion: input.seleccion,
    modoFicha: input.modoFicha,
    filtros: input.filtros,
  };

  const url = urlCompletaEstado(estado, locActual()) + window.location.hash;
  const actual = window.location.pathname + window.location.search + window.location.hash;
  if (actual === url) return;

  if (opts?.replace) {
    window.history.replaceState(null, '', url);
  } else {
    window.history.pushState(null, '', url);
  }
}

/** @deprecated Usar sincronizarEstadoUrlPanel */
export function sincronizarUrlPanel(input: { nav: NavId; sub: string }, opts?: { replace?: boolean }): void {
  sincronizarEstadoUrlPanel(
    { ...input, seleccion: null, modoFicha: 'panel', filtros: {} },
    opts,
  );
}

export function subInicialDesdeUrl(nav: NavId, fallback: string): string {
  const u = ubicacionDesdeUrl();
  if (!u || u.nav !== nav) return fallback;
  return u.sub || fallback;
}
