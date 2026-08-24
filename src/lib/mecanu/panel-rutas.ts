/**
 * URLs bonitas del panel en negocio.mecanu.com (y negocio.localhost).
 *
 * Solo módulos y subsecciones — nunca ids de entidades (ruta, cliente, etc.).
 * Los ids en la barra filtrarían negocio en historial, logs y referrer.
 * En local sin subdominio de negocio sigue /panel con estado en memoria.
 */

export type PanelNavId =
  | 'general'
  | 'tablero'
  | 'contactos'
  | 'tempario'
  | 'conductores'
  | 'whatsapp'
  | 'config';

export interface PanelUbicacion {
  nav: PanelNavId;
  sub: string;
}

export const SUBNAV_DEFAULT: Record<PanelNavId, string> = {
  general: 'general',
  tablero: 'tareas',
  contactos: 'clientes',
  tempario: 'tempario',
  conductores: 'conductores',
  whatsapp: 'whatsapp',
  config: 'perfil',
};

const NAV_IDS: PanelNavId[] = [
  'general', 'tablero', 'contactos', 'tempario', 'conductores', 'whatsapp', 'config',
];

const SUBS_TABLERO = new Set(['tareas', 'traslados', 'campanas']);
const SUBS_CONFIG = new Set(['perfil', 'aprender', 'empresa', 'sucursales', 'recepcion', 'whatsapp']);

/** Raíces del panel en el subdominio negocio (para matcher/proxy/robots). */
export const RAICES_PANEL_NEGOCIO = [
  '/general',
  '/tablero',
  '/contactos',
  '/tempario',
  '/conductores',
  '/whatsapp',
  '/config',
] as const;

export function esRutaPanelBonita(pathname: string): boolean {
  const seg = segmentos(pathname);
  if (!seg.length) return false;
  return NAV_IDS.includes(seg[0] as PanelNavId);
}

export function esRutaAuthBonita(pathname: string): boolean {
  return (
    pathname === '/registro' ||
    pathname === '/recuperar' ||
    pathname === '/nueva-contrasena'
  );
}

/** Construye la URL bonita a partir del estado del panel (solo nav/sub). */
export function pathBonitoPanel(u: PanelUbicacion): string {
  switch (u.nav) {
    case 'general':
      return '/general';
    case 'tablero': {
      const sub = SUBS_TABLERO.has(u.sub) ? u.sub : SUBNAV_DEFAULT.tablero;
      return `/tablero/${sub}`;
    }
    case 'contactos':
      return '/contactos';
    case 'tempario':
      return '/tempario';
    case 'conductores':
      return u.sub === 'agendar' ? '/conductores/agendar' : '/conductores';
    case 'whatsapp':
      return '/whatsapp';
    case 'config': {
      const sub = SUBS_CONFIG.has(u.sub) ? u.sub : SUBNAV_DEFAULT.config;
      return `/config/${sub}`;
    }
    default:
      return '/general';
  }
}

/** Parsea una URL bonita del subdominio negocio. Ignora segmentos de entidad. */
export function parsePathBonitoPanel(pathname: string): PanelUbicacion | null {
  const seg = segmentos(pathname);
  if (!seg.length) return null;

  const nav = seg[0] as PanelNavId;
  if (!NAV_IDS.includes(nav)) return null;

  const def = SUBNAV_DEFAULT[nav];

  if (nav === 'general') return { nav, sub: 'general' };
  if (nav === 'whatsapp') return { nav, sub: 'whatsapp' };
  if (nav === 'contactos') return { nav, sub: 'clientes' };
  if (nav === 'tempario') return { nav, sub: 'tempario' };

  if (nav === 'config') {
    const sub = seg[1] && SUBS_CONFIG.has(seg[1]) ? seg[1] : def;
    return { nav, sub };
  }

  if (nav === 'tablero') {
    const sub = seg[1] && SUBS_TABLERO.has(seg[1]) ? seg[1] : def;
    return { nav, sub };
  }

  if (nav === 'conductores') {
    if (seg[1] === 'agendar') return { nav, sub: 'agendar' };
    return { nav, sub: 'conductores' };
  }

  return null;
}

/** Estado del panel → URL bonita (para redirects desde mecanu.com/panel). */
export function pathBonitoDesdeUbicacionInterna(
  pathname: string,
  ubic?: Partial<PanelUbicacion> | null,
): string {
  if (pathname === '/panel/entrar' || pathname.startsWith('/panel/entrar/')) return '/';
  if (pathname === '/panel/registro' || pathname.startsWith('/panel/registro/')) return '/registro';
  if (pathname === '/panel/recuperar' || pathname.startsWith('/panel/recuperar/')) return '/recuperar';
  if (pathname === '/panel/nueva-contrasena' || pathname.startsWith('/panel/nueva-contrasena/')) {
    return '/nueva-contrasena';
  }
  if (pathname === '/panel' || pathname.startsWith('/panel/')) {
    if (ubic?.nav) {
      return pathBonitoPanel({
        nav: ubic.nav,
        sub: ubic.sub ?? SUBNAV_DEFAULT[ubic.nav],
      });
    }
    return '/general';
  }
  // Normaliza deep-links viejos con ids: solo deja módulo/sub.
  const parseada = parsePathBonitoPanel(pathname);
  if (parseada) return pathBonitoPanel(parseada);
  return pathname;
}

function segmentos(pathname: string): string[] {
  return pathname.split('/').filter(Boolean);
}
