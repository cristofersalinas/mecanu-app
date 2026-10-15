import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  localeFromPathname,
  pathFor,
  preferredLocaleFromRequest,
} from "@/lib/landing/locales";
import { defenderPeticion } from "@/lib/security/proxy-defensa";
import {
  comprobarRateLimit,
  ipDeRequest,
  metodoEsEscritura,
  REGLA_API_ESCRITURA,
  REGLA_API_LECTURA,
} from "@/lib/security/rate-limit";
import {
  actualizarSesionSupabase,
  esPanelApp,
  esRutaAuthPanel,
} from "@/lib/supabase/session-proxy";
import {
  esHostNegocio,
  esHostPublicoMarketing,
  origenNegocio,
  pathInternoAuthDesdeBonito,
} from "@/lib/mecanu/host-negocio";
import {
  esRutaAuthBonita,
  esRutaPanelBonita,
  pathBonitoDesdeUbicacionInterna,
} from "@/lib/mecanu/panel-rutas";

/**
 * 1. Fuera de local: corte fail-closed de apps mock, salvo auth pública del panel
 *    y panel con sesión válida.
 * 2. Locale en `/`.
 * 3. Refresco de cookies Supabase en rutas de panel/auth.
 */
const soloLanding =
  process.env.VERCEL === "1" &&
  process.env.MECANU_EXPONER_APPS !== "1";

function esApiPublica(pathname: string) {
  return (
    pathname === "/api/v1/contacto" ||
    pathname.startsWith("/api/v1/contacto/") ||
    pathname === "/api/v1/itv-leads" ||
    pathname.startsWith("/api/v1/itv-leads/") ||
    pathname === "/api/v1/webhooks/kapso" ||
    pathname.startsWith("/api/v1/webhooks/kapso/") ||
    pathname === "/api/v1/panel/snapshot" ||
    pathname.startsWith("/api/v1/panel/") ||
    pathname === "/api/v1/conductor/snapshot" ||
    pathname.startsWith("/api/v1/conductor/") ||
    pathname.startsWith("/api/v1/s/")
  );
}

function aplicarCookies(desde: NextResponse, hacia: NextResponse): NextResponse {
  desde.cookies.getAll().forEach((c) => {
    hacia.cookies.set(c.name, c.value);
  });
  return hacia;
}

/** Rewrite interno conservando `x-mecanu-pathname` (path bonito → `/panel`). */
function rewriteConPathname(
  url: URL,
  requestHeaders: Headers,
  sesionRes: NextResponse,
): NextResponse {
  return aplicarCookies(
    sesionRes,
    NextResponse.rewrite(url, { request: { headers: requestHeaders } }),
  );
}

/** Borra la cookie del A/B retirado para que nadie se quede en la foto antigua. */
function sinCookieHeroAb(request: NextRequest, response: NextResponse): NextResponse {
  if (request.cookies.has("mecanu_hero_ab")) {
    response.cookies.set("mecanu_hero_ab", "", {
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.VERCEL === "1",
    });
  }
  return response;
}

function esAppProtegida(pathname: string) {
  if (esApiPublica(pathname)) return false;
  if (esRutaAuthPanel(pathname)) return false;
  if (pathname === "/auth" || pathname.startsWith("/auth/")) return false;
  if (pathname === "/entrar" || pathname.startsWith("/entrar/")) return false;
  if (esRutaPanelBonita(pathname)) return true;
  return (
    pathname === "/panel" ||
    pathname.startsWith("/panel/") ||
    pathname === "/conductor" ||
    pathname.startsWith("/conductor/") ||
    pathname === "/backoffice" ||
    pathname.startsWith("/backoffice/") ||
    pathname === "/api" ||
    pathname.startsWith("/api/")
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-mecanu-pathname", pathname);
  requestHeaders.set("x-mecanu-locale", localeFromPathname(pathname));

  const defensa = await defenderPeticion(request);
  if (defensa) return defensa;

  if (pathname === "/") {
    const locale = preferredLocaleFromRequest(request.headers, request.headers.get("cookie"));
    if (locale !== "es" && !esHostNegocio(host)) {
      const destino = new URL(pathFor(locale), request.url);
      destino.search = request.nextUrl.search;
      const respuesta = NextResponse.redirect(destino);
      respuesta.cookies.set(LOCALE_COOKIE, locale, {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
        secure: process.env.VERCEL === "1",
      });
      respuesta.headers.set("Cache-Control", "private, no-store");
      return sinCookieHeroAb(request, respuesta);
    }
  }

  const tocaSupabase =
    esHostNegocio(host) ||
    pathname.startsWith("/panel") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/entrar") ||
    esRutaAuthBonita(pathname) ||
    esRutaPanelBonita(pathname);
  const { response: sesionRes, user } = tocaSupabase
    ? await actualizarSesionSupabase(request)
    : { response: NextResponse.next({ request: { headers: requestHeaders } }), user: null };

  if (esHostPublicoMarketing(host)) {
    if (
      pathname === "/panel" ||
      pathname.startsWith("/panel/") ||
      pathInternoAuthDesdeBonito(pathname) ||
      esRutaPanelBonita(pathname)
    ) {
      const dest = new URL(origenNegocio());
      dest.pathname = pathBonitoDesdeUbicacionInterna(
        pathInternoAuthDesdeBonito(pathname) ?? pathname,
      );
      dest.search = request.nextUrl.search;
      return NextResponse.redirect(dest, 308);
    }
  }

  if (esHostNegocio(host)) {
    const internoAuth = pathInternoAuthDesdeBonito(pathname);

    if (pathname === "/panel" || pathname === "/panel/") {
      const dest = request.nextUrl.clone();
      dest.pathname = user ? "/general" : "/";
      return NextResponse.redirect(dest);
    }

    if (pathname.startsWith("/panel/") && !esRutaAuthPanel(pathname)) {
      const dest = request.nextUrl.clone();
      dest.pathname = pathBonitoDesdeUbicacionInterna(pathname);
      dest.search = request.nextUrl.search;
      return NextResponse.redirect(dest);
    }

    if (pathname === "/" || pathname === "") {
      if (user) {
        const dest = request.nextUrl.clone();
        dest.pathname = "/general";
        dest.search = request.nextUrl.search;
        return NextResponse.redirect(dest);
      }
      const u = request.nextUrl.clone();
      u.pathname = "/panel/entrar";
      return rewriteConPathname(u, requestHeaders, sesionRes);
    }

    if (internoAuth) {
      const u = request.nextUrl.clone();
      u.pathname = internoAuth;
      return rewriteConPathname(u, requestHeaders, sesionRes);
    }

    if (esRutaPanelBonita(pathname)) {
      if (!user) {
        const dest = request.nextUrl.clone();
        dest.pathname = "/";
        dest.search = "";
        return NextResponse.redirect(dest);
      }
      const u = request.nextUrl.clone();
      u.pathname = "/panel";
      return rewriteConPathname(u, requestHeaders, sesionRes);
    }

    if (!user && esPanelApp(pathname)) {
      const dest = request.nextUrl.clone();
      dest.pathname = "/";
      dest.search = "";
      return NextResponse.redirect(dest);
    }

    if (user && pathname === "/panel/entrar") {
      const dest = request.nextUrl.clone();
      dest.pathname = "/general";
      return NextResponse.redirect(dest);
    }
  }

  if (soloLanding && esPanelApp(pathname)) {
    if (user) {
      return sesionRes;
    }
    if (esHostNegocio(host)) {
      const dest = request.nextUrl.clone();
      dest.pathname = "/";
      return NextResponse.redirect(dest);
    }
    return NextResponse.redirect(new URL("/panel/entrar", request.url));
  }

  if (soloLanding && esAppProtegida(pathname)) {
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    /* En demo local el poll del panel + GPS + clicks del conductor
       saturan el cupo de escritura y el móvil encola «falsos» fallos. */
    const demoLocal =
      process.env.MECANU_DEMO === "1" || process.env.NEXT_PUBLIC_MECANU_DEMO === "1";
    const esGps =
      pathname.includes("/traslados/") && pathname.endsWith("/gps");
    if (!demoLocal && !esGps) {
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
  }

  if (tocaSupabase) return sinCookieHeroAb(request, sesionRes);
  return sinCookieHeroAb(
    request,
    NextResponse.next({ request: { headers: requestHeaders } }),
  );
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
    "/entrar",
    "/entrar/:path*",
    "/auth",
    "/auth/:path*",
    "/registro",
    "/recuperar",
    "/nueva-contrasena",
    "/general",
    "/tablero",
    "/tablero/:path*",
    "/contactos",
    "/contactos/:path*",
    "/tempario",
    "/tempario/:path*",
    "/conductores",
    "/conductores/:path*",
    "/whatsapp",
    "/config",
    "/config/:path*",
    "/conductor",
    "/conductor/:path*",
    "/backoffice",
    "/backoffice/:path*",
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
