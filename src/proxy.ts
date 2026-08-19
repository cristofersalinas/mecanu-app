import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { localeFromPathname } from "@/lib/landing/locales";
import { defenderPeticion } from "@/lib/security/proxy-defensa";
import {
  comprobarRateLimit,
  ipDeRequest,
  metodoEsEscritura,
  REGLA_API_ESCRITURA,
  REGLA_API_LECTURA,
} from "@/lib/security/rate-limit";

/**
 * Hace dos cosas, ambas antes de que se renderice nada:
 *
 * 1. Fuera de tu máquina, la única superficie pública es la landing.
 *    `/panel`, `/conductor` y `/api/v1/*` sirven datos mock. El corte cubre
 *    producción **y** los previews de Vercel. Local (`next dev` / `next start`)
 *    no tiene `VERCEL=1` y sigue sirviendo las tres apps.
 *
 *    Para verificar panel/conductor en un preview de staging, pon
 *    `MECANU_EXPONER_APPS=1` solo en el entorno Preview, o entra con SSO.
 * 2. Marca el idioma de `/`, `/en` y `/pt` en una cabecera para que el layout
 *    raíz pueda poner el `lang` correcto en el `<html>`.
 *
 * Sobre el corte: en Vercel siempre, a propósito. Un preview de rama es una
 * URL pública (o pública el día que se apague el SSO) y el mock del panel no
 * debe colgar ahí. Local no se toca.
 *
 * Es fail-closed: no depende de acordarse de poner una variable en Vercel.
 * Abrir las apps al público hay que pedirlo explícitamente con
 * `MECANU_EXPONER_APPS=1`.
 *
 * (Este archivo era `middleware.ts`. Next.js 16 renombró la convención a
 * `proxy`; la vieja sigue funcionando pero avisa de deprecación en cada build.)
 */
const soloLanding =
  process.env.VERCEL === "1" &&
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

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-mecanu-pathname", pathname);
  requestHeaders.set("x-mecanu-locale", localeFromPathname(pathname));

  const defensa = await defenderPeticion(request);
  if (defensa) return defensa;

  if (soloLanding && esAppProtegida(pathname)) {
    // Un 302 a la landing desde una llamada de datos rompería el cliente del
    // conductor en silencio: recibiría HTML donde espera JSON.
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    const ip = ipDeRequest(request.headers);
    const regla = metodoEsEscritura(request.method) ? REGLA_API_ESCRITURA : REGLA_API_LECTURA;
    const limite = comprobarRateLimit(`api:${ip}`, Date.now(), regla);
    if (!limite.permitido) {
      return NextResponse.json(
        { error: { code: "rate_limited", message: "Demasiadas peticiones. Espera un momento." } },
        {
          status: 429,
          headers: { "Retry-After": String(limite.retryAfterSeg) },
        },
      );
    }
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
    "/wp-admin",
    "/wp-admin/:path*",
    "/wp-login.php",
    "/xmlrpc.php",
    "/.env",
    "/.git/:path*",
    "/phpmyadmin",
    "/phpmyadmin/:path*",
    "/admin.php",
    "/config.php",
    "/backup.sql",
    "/.aws/:path*",
    "/assistant",
    "/assistant/:path*",
    "/internal/:path*",
  ],
};
