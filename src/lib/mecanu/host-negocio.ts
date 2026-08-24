/**
 * Host del panel (login + app del taller).
 * Marketing: mecanu.com. Negocio: negocio.mecanu.com.
 * En local y en previews de Vercel no se fuerza el subdominio.
 */

export const HOST_NEGOCIO = "negocio.mecanu.com";
export const HOSTS_PUBLICOS = ["mecanu.com", "www.mecanu.com"] as const;

export type PaginaAuthPanel = "entrar" | "registro" | "recuperar" | "nueva-contrasena";

export function hostSinPuerto(host: string): string {
  return host.split(":")[0].toLowerCase();
}

export function esHostNegocio(host: string | null | undefined): boolean {
  const h = hostSinPuerto(host ?? "");
  return h === HOST_NEGOCIO || h === "negocio.localhost";
}

export function esHostPublicoMarketing(host: string | null | undefined): boolean {
  const h = hostSinPuerto(host ?? "");
  return (HOSTS_PUBLICOS as readonly string[]).includes(h);
}

export function origenNegocio(): string {
  const env = process.env.NEXT_PUBLIC_NEGOCIO_URL?.trim().replace(/\/$/, "");
  if (env) return env;
  return `https://${HOST_NEGOCIO}`;
}

export function origenSitioPublico(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (env) return env;
  return "https://mecanu.com";
}

/** Rutas cortas en el subdominio; en local siguen bajo /panel/… */
export function pathAuthPanel(pagina: PaginaAuthPanel, host: string | null | undefined): string {
  if (esHostNegocio(host)) {
    if (pagina === "entrar") return "/";
    return pagina === "nueva-contrasena" ? "/nueva-contrasena" : `/${pagina}`;
  }
  return `/panel/${pagina}`;
}

export function pathAuthPanelCliente(pagina: PaginaAuthPanel): string {
  if (typeof window === "undefined") return pathAuthPanel(pagina, null);
  return pathAuthPanel(pagina, window.location.host);
}

/** Auth interno → URL bonita en negocio. */
export function pathBonitoAuthDesdeInterno(pathname: string): string {
  if (pathname === "/panel/entrar" || pathname.startsWith("/panel/entrar/")) return "/";
  if (pathname === "/panel/registro" || pathname.startsWith("/panel/registro/")) return "/registro";
  if (pathname === "/panel/recuperar" || pathname.startsWith("/panel/recuperar/")) return "/recuperar";
  if (
    pathname === "/panel/nueva-contrasena" ||
    pathname.startsWith("/panel/nueva-contrasena/")
  ) {
    return "/nueva-contrasena";
  }
  return pathname;
}

/** Pretty path de auth en negocio → ruta real de Next. `/` lo decide el proxy (login o panel). */
export function pathInternoAuthDesdeBonito(pathname: string): string | null {
  if (pathname === "/registro") return "/panel/registro";
  if (pathname === "/recuperar") return "/panel/recuperar";
  if (pathname === "/nueva-contrasena") return "/panel/nueva-contrasena";
  return null;
}

/** @deprecated Usar pathBonitoAuthDesdeInterno o pathBonitoDesdeUbicacionInterna */
export function pathBonitoDesdeInterno(pathname: string): string {
  return pathBonitoAuthDesdeInterno(pathname);
}

/** @deprecated Usar pathInternoAuthDesdeBonito */
export function pathInternoDesdeBonito(pathname: string): string | null {
  return pathInternoAuthDesdeBonito(pathname);
}
