/**
 * Test A/B de la foto del hero en la landing.
 *
 * Cookie sticky (proxy la asigna): la misma visita vuelve a ver la misma
 * variante. Forzar con `?hero=calle` o `?hero=volvo` (también reescribe la cookie).
 *
 * Recorte / zoom de la variante nueva: CSS `.heroPhotoVolvo` en
 * `src/app/landing.module.css` (variables `--hero-volvo-x/y/zoom`).
 */

export const HERO_AB_COOKIE = "mecanu_hero_ab";
export const HERO_AB_EXPERIMENT = "landing_hero_foto";
/** 90 días — suficiente para un test sin eternizar un perdedor. */
export const HERO_AB_MAX_AGE_SEG = 60 * 60 * 24 * 90;

export const HERO_AB_VARIANTES = ["calle", "volvo"] as const;
export type HeroAbVariant = (typeof HERO_AB_VARIANTES)[number];

export type HeroAbFoto = {
  src: "/landing/hero-calle.jpg" | "/landing/hero-volvo.jpg";
  /** Píxeles del archivo en public/ — evita reescalado en el optimizador. */
  width: number;
  height: number;
  /** Clave CSS en landing.module.css */
  styleKey: "heroPhotoCalle" | "heroPhotoVolvo";
  /** Campo de alt en copy.hero */
  altKey: "photoAlt" | "photoAltVolvo";
};

export const HERO_AB_FOTOS: Record<HeroAbVariant, HeroAbFoto> = {
  calle: {
    src: "/landing/hero-calle.jpg",
    width: 1024,
    height: 765,
    styleKey: "heroPhotoCalle",
    altKey: "photoAlt",
  },
  volvo: {
    src: "/landing/hero-volvo.jpg",
    width: 800,
    height: 600,
    styleKey: "heroPhotoVolvo",
    altKey: "photoAltVolvo",
  },
};

export function parseHeroAb(raw: string | null | undefined): HeroAbVariant | null {
  if (raw === "calle" || raw === "volvo") return raw;
  return null;
}

/** 50/50. `rand` inyectable en tests. */
export function elegirHeroAb(rand = Math.random()): HeroAbVariant {
  return rand < 0.5 ? "calle" : "volvo";
}

/**
 * Prioridad: query `?hero=` → cookie → fallback `calle` (si el proxy aún no
 * escribió; no debería pasar en rutas de home).
 */
export function resolverHeroAb(
  cookie: string | null | undefined,
  force?: string | null,
): HeroAbVariant {
  return parseHeroAb(force) ?? parseHeroAb(cookie) ?? "calle";
}

export function esLandingHomePath(pathname: string): boolean {
  return pathname === "/" || pathname === "/en" || pathname === "/ca" || pathname === "/pt";
}

export function heroAbDesdeCookieString(cookieString: string | null | undefined): HeroAbVariant | null {
  if (!cookieString) return null;
  for (const trozo of cookieString.split(";")) {
    const [nombre, ...resto] = trozo.trim().split("=");
    if (nombre !== HERO_AB_COOKIE) continue;
    try {
      return parseHeroAb(decodeURIComponent(resto.join("=")));
    } catch {
      return null;
    }
  }
  return null;
}
