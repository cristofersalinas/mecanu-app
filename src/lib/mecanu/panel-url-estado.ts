/**
 * Estado completo del panel en la URL: módulo, subsección, entidad abierta y filtros.
 *
 * En negocio.mecanu.com el path lleva nav/sub; ids y filtros van en query (`ruta=`, `f.q=`, …).
 * En local (/panel) nav/sub también van en query.
 */

import { esHostNegocio } from './host-negocio';
import {
  esRutaPanelBonita,
  parsePathBonitoPanel,
  pathBonitoPanel,
  SUBNAV_DEFAULT,
  type PanelNavId,
} from './panel-rutas';

export type SeleccionKindUrl = 'ruta' | 'cliente' | 'vehiculo' | 'conductor' | 'servicio';

const ENTIDAD_KEYS: SeleccionKindUrl[] = ['ruta', 'cliente', 'vehiculo', 'conductor', 'servicio'];
const NAV_IDS: PanelNavId[] = [
  'general', 'tablero', 'contactos', 'tempario', 'conductores', 'whatsapp', 'config',
];

export interface PanelUrlEstado {
  nav: PanelNavId;
  sub: string;
  seleccion: { kind: SeleccionKindUrl; id: string } | null;
  modoFicha: 'panel' | 'ficha';
  filtros: Record<string, string>;
}

export interface PanelUrlLocation {
  pathname: string;
  search: string;
  host: string;
}

function paramsFromSearch(search: string): URLSearchParams {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  return new URLSearchParams(raw);
}

function navValido(nav: string | null | undefined): PanelNavId {
  if (nav && NAV_IDS.includes(nav as PanelNavId)) return nav as PanelNavId;
  return 'general';
}

function parseFiltros(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of params.entries()) {
    if (k.startsWith('f.') && v) out[k.slice(2)] = v;
  }
  return out;
}

function parseSeleccion(params: URLSearchParams): PanelUrlEstado['seleccion'] {
  for (const kind of ENTIDAD_KEYS) {
    const id = params.get(kind)?.trim();
    if (id) return { kind, id };
  }
  return null;
}

/** Si la URL trae entidad pero no módulo, infiere el módulo coherente (deep-links cortos). */
function inferirNavDesdeSeleccion(
  seleccion: PanelUrlEstado['seleccion'],
  nav: PanelNavId,
  sub: string,
  params: URLSearchParams,
): { nav: PanelNavId; sub: string } {
  if (params.get('nav') || !seleccion) return { nav, sub };
  switch (seleccion.kind) {
    case 'ruta':
      return { nav: 'tablero', sub: 'traslados' };
    case 'cliente':
    case 'vehiculo':
      return { nav: 'contactos', sub: 'clientes' };
    case 'conductor':
      return { nav: 'conductores', sub: 'conductores' };
    case 'servicio':
      return { nav: 'tempario', sub: 'tempario' };
    default:
      return { nav, sub };
  }
}

export function panelSoportaUrlEstado(loc: Pick<PanelUrlLocation, 'pathname'>): boolean {
  const p = loc.pathname;
  return p === '/panel' || p.startsWith('/panel/') || esRutaPanelBonita(p);
}

export function leerEstadoUrl(loc: PanelUrlLocation): PanelUrlEstado {
  const params = paramsFromSearch(loc.search);
  const pretty = parsePathBonitoPanel(loc.pathname);

  let nav: PanelNavId;
  let sub: string;

  if (pretty) {
    nav = pretty.nav;
    sub = pretty.sub;
  } else if (loc.pathname === '/panel' || loc.pathname.startsWith('/panel/')) {
    nav = navValido(params.get('nav'));
    sub = params.get('sub') ?? SUBNAV_DEFAULT[nav];
  } else {
    nav = 'general';
    sub = SUBNAV_DEFAULT.general;
  }

  const seleccion = parseSeleccion(params);
  ({ nav, sub } = inferirNavDesdeSeleccion(seleccion, nav, sub, params));

  const modoFicha = params.get('ficha') === '1' && seleccion ? 'ficha' : 'panel';
  const filtros = parseFiltros(params);

  return { nav, sub, seleccion, modoFicha, filtros };
}

export function serializarEstadoUrl(
  estado: PanelUrlEstado,
  loc: PanelUrlLocation,
): { pathname: string; search: string } {
  const enNegocio = esHostNegocio(loc.host);
  let pathname: string;

  if (enNegocio && (esRutaPanelBonita(loc.pathname) || loc.pathname === '/' || loc.pathname === '')) {
    pathname = pathBonitoPanel({ nav: estado.nav, sub: estado.sub });
  } else if (loc.pathname === '/panel' || loc.pathname.startsWith('/panel/')) {
    pathname = '/panel';
  } else {
    pathname = loc.pathname;
  }

  const params = new URLSearchParams();

  if (!enNegocio && (pathname === '/panel' || pathname.startsWith('/panel/'))) {
    params.set('nav', estado.nav);
    params.set('sub', estado.sub);
  }

  if (estado.seleccion) {
    params.set(estado.seleccion.kind, estado.seleccion.id);
  }
  if (estado.modoFicha === 'ficha' && estado.seleccion) {
    params.set('ficha', '1');
  }

  for (const [k, v] of Object.entries(estado.filtros)) {
    if (v) params.set(`f.${k}`, v);
  }

  const qs = params.toString();
  return { pathname, search: qs ? `?${qs}` : '' };
}

export function urlCompletaEstado(estado: PanelUrlEstado, loc: PanelUrlLocation): string {
  const { pathname, search } = serializarEstadoUrl(estado, loc);
  return pathname + search;
}

/** Query string desde `searchParams` de una page.tsx (App Router). */
export function searchDesdeParams(
  sp: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) {
      for (const item of v) {
        if (item) params.append(k, item);
      }
    } else if (v) {
      params.set(k, v);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
