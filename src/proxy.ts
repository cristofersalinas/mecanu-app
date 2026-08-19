import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * En producción la única superficie pública es la landing: `/panel`,
 * `/conductor` y `/api/v1/*` todavía sirven datos mock y no deben ser
 * alcanzables desde internet.
 *
 * En local (`next dev`, `next start`) y en los previews de Vercel las tres
 * superficies funcionan con normalidad — el preview de `staging` es donde se
 * verifica el panel y el conductor antes de mergear a `main`, así que no puede
 * estar capado.
 *
 * Fail-closed: no depende de acordarse de poner una variable en Vercel. Para
 * exponer las apps en producción hay que pedirlo explícitamente con
 * `MECANU_EXPONER_APPS=1`.
 *
 * (Este archivo era `middleware.ts`. Next.js 16 renombró la convención a
 * `proxy`; `middleware` sigue funcionando pero avisa de deprecación en cada
 * build.)
 */
const soloLanding =
  process.env.VERCEL_ENV === "production" &&
  process.env.MECANU_EXPONER_APPS !== "1";

export function proxy(request: NextRequest) {
  if (!soloLanding) return NextResponse.next();

  // Un 302 a la landing desde una llamada de datos rompería el cliente del
  // conductor en silencio: recibiría HTML donde espera JSON.
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/panel/:path*", "/conductor/:path*", "/api/:path*"],
};
