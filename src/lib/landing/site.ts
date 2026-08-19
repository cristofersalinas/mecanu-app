/**
 * Origen público de la landing. En Vercel se define `NEXT_PUBLIC_SITE_URL`;
 * el valor por defecto existe para que `next build` en local no genere URLs
 * relativas rotas en el sitemap y en los `hreflang`.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mecanu.com";

/** `new URL()` normaliza la barra final, que en `hreflang` cuenta como otra URL. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}
