import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { localeFromPathname } from "@/lib/landing/locales";

/**
 * Hace dos cosas, ambas antes de que se renderice nada:
 *
 * 1. En producción la única superficie pública es la landing. `/panel`,
 *    `/conductor` y `/api/v1/*` todavía sirven datos mock y no deben ser
 *    alcanzables desde internet.
 * 2. Marca el idioma de `/`, `/en` y `/pt` en una cabecera para que el layout
 *    raíz pueda poner el `lang` correcto en el `<html>`.
 *
 * Sobre el corte: depende del entorno **a propósito**. En local (`next dev`,
 * `next start`) y en los previews de Vercel las tres superficies funcionan con
 * normalidad, porque el preview de `staging` es donde se verifica el panel y el
 * conductor antes de mergear a `main` (ver `docs/BRANCHING.md`). Una versión
 * anterior cortaba sin mirar el entorno y dejó el desarrollo local inservible.
 *
 * Es fail-closed: no depende de acordarse de poner una variable en Vercel.
 * Abrir las apps al público hay que pedirlo explícitamente con
 * `MECANU_EXPONER_APPS=1`.
 *
 * (Este archivo era `middleware.ts`. Next.js 16 renombró la convención a
 * `proxy`; la vieja sigue funcionando pero avisa de deprecación en cada build.)
 */
const soloLanding =
  process.env.VERCEL_ENV === "production" &&
  process.env.MECANU_EXPONER_APPS !== "1";

function esAppProtegida(pathname: string) {
  return (
    pathname === "/panel" ||
    pathname.startsWith("/panel/") ||
    pathname === "/conductor" ||
    pathname.startsWith("/conductor/") ||
    pathname === "/api" ||
    pathname.startsWith("/api/")
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-mecanu-pathname", pathname);
  requestHeaders.set("x-mecanu-locale", localeFromPathname(pathname));

  if (soloLanding && esAppProtegida(pathname)) {
    // Un 302 a la landing desde una llamada de datos rompería el cliente del
    // conductor en silencio: recibiría HTML donde espera JSON.
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/",
    "/ca",
    "/ca/:path*",
    "/en",
    "/en/:path*",
    "/pt",
    "/pt/:path*",
    "/panel",
    "/panel/:path*",
    "/conductor",
    "/conductor/:path*",
    "/api/:path*",
  ],
};
