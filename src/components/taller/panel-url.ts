'use client';

import { esHostNegocio } from '@/lib/mecanu/host-negocio';
import {
  parsePathBonitoPanel,
  pathBonitoPanel,
  type PanelNavId,
  type PanelUbicacion,
  SUBNAV_DEFAULT,
} from '@/lib/mecanu/panel-rutas';
import type { NavId } from './store';

export function urlsPanelActivas(): boolean {
  if (typeof window === 'undefined') return false;
  return esHostNegocio(window.location.host);
}

export function ubicacionDesdeUrl(): PanelUbicacion | null {
  if (!urlsPanelActivas()) return null;
  return parsePathBonitoPanel(window.location.pathname);
}

/** Solo sincroniza nav/sub. La ficha abierta vive en memoria, no en la URL. */
export function sincronizarUrlPanel(input: {
  nav: NavId;
  sub: string;
}, opts?: { replace?: boolean }): void {
  if (!urlsPanelActivas()) return;
  const path = pathBonitoPanel({
    nav: input.nav as PanelNavId,
    sub: input.sub,
  });
  const url = path + window.location.search + window.location.hash;
  if (window.location.pathname + window.location.search + window.location.hash === url) return;
  if (opts?.replace) {
    window.history.replaceState(null, '', url);
  } else {
    window.history.pushState(null, '', url);
  }
}

export function subInicialDesdeUrl(nav: NavId, fallback: string): string {
  const u = ubicacionDesdeUrl();
  if (!u || u.nav !== nav) return fallback;
  return u.sub || SUBNAV_DEFAULT[nav as PanelNavId] || fallback;
}
