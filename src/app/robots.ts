import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/landing/site";

/**
 * Solo la landing es indexable. `/panel`, `/conductor` y `/api` sirven datos
 * mock y además están cortados en producción por `src/proxy.ts` (ver D13 en
 * `DECISIONES.md`); bloquearlos aquí evita que queden rastros en el índice si
 * algún día se abren o si un buscador ya los vio.
 *
 * Las cuatro versiones de idioma cuelgan de `/`, `/ca`, `/en` y `/pt`, así que
 * el `Allow: /` las cubre sin enumerarlas.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel", "/panel/", "/conductor", "/conductor/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
