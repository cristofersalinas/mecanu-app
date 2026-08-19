import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { detectarCanary } from "./canary";
import type { EventoSeguridad } from "./events";
import { geoDeRequest, userAgentDeRequest } from "./geo";
import {
  delayTarpitMs,
  esHoneypot,
  htmlLoginFalso,
  htmlNoEncontradoAburrido,
  jsonPhpMyAdminFalso,
  sleep,
  textoEnvSenuelo,
  textoGitConfigFalso,
} from "./honeypots";
import { anotarSondeo, registrarEvento } from "./log";
import { clasificarPrompt, HTML_ASISTENTE, respuestaAsistente } from "./assistant";
import { comprobarRateLimit, ipDeRequest, REGLA_ASISTENTE, REGLA_HONEYPOT } from "./rate-limit";

function baseEvento(request: NextRequest, tipo: EventoSeguridad["tipo"], resumen: string): EventoSeguridad {
  return {
    tipo,
    ts: new Date().toISOString(),
    ip: ipDeRequest(request.headers),
    geo: geoDeRequest(request.headers),
    userAgent: userAgentDeRequest(request.headers),
    metodo: request.method,
    ruta: request.nextUrl.pathname,
    tecnica: null,
    resumen,
  };
}

async function leerCuerpoCorto(request: NextRequest): Promise<string> {
  if (request.method === "GET" || request.method === "HEAD") return "";
  try {
    const texto = await request.clone().text();
    return texto.slice(0, 8000);
  } catch {
    return "";
  }
}

export async function defenderPeticion(request: NextRequest): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;
  const cuerpo = await leerCuerpoCorto(request);
  const haystack = `${pathname}?${request.nextUrl.search}\n${request.headers.get("authorization") ?? ""}\n${cuerpo}`;

  const canary = detectarCanary(haystack);
  if (canary) {
    registrarEvento(baseEvento(request, "canary_used", `canary ${canary}`), { ruta: pathname });
  }

  if (pathname === "/assistant" || pathname.startsWith("/assistant/")) {
    return responderAsistente(request, cuerpo);
  }

  if (pathname === "/internal/ops") {
    return responderOps(request);
  }

  if (!esHoneypot(pathname)) return null;

  const ip = ipDeRequest(request.headers);
  const limite = comprobarRateLimit(`hp:${ip}`, Date.now(), REGLA_HONEYPOT);
  if (!limite.permitido) {
    registrarEvento(baseEvento(request, "rate_limited", "honeypot"));
    return new NextResponse("Not found.\n", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8", "Retry-After": String(limite.retryAfterSeg) },
    });
  }

  await sleep(delayTarpitMs(ip));

  const sistematico = anotarSondeo(ip, pathname);
  registrarEvento(
    baseEvento(request, sistematico ? "sondeo_sistematico" : "honeypot_hit", pathname),
    { bodyPreview: cuerpo.slice(0, 400) },
  );

  return respuestaHoneypot(request, pathname, cuerpo);
}

function responderOps(request: NextRequest): NextResponse {
  registrarEvento(baseEvento(request, "honeypot_hit", "/internal/ops"));
  return NextResponse.json({
    status: "ok",
    build: "internal",
    notes: "ops endpoint — not for public use",
  });
}

async function responderAsistente(request: NextRequest, cuerpo: string): Promise<NextResponse> {
  const ip = ipDeRequest(request.headers);
  const limite = comprobarRateLimit(`as:${ip}`, Date.now(), REGLA_ASISTENTE);
  if (!limite.permitido) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Demasiadas peticiones. Espera un momento." } },
      { status: 429, headers: { "Retry-After": String(limite.retryAfterSeg) } },
    );
  }

  if (request.method === "GET" || request.method === "HEAD") {
    registrarEvento(baseEvento(request, "assistant_prompt", "open"));
    return new NextResponse(HTML_ASISTENTE, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
        "cache-control": "no-store",
      },
    });
  }

  let pregunta = "";
  try {
    const json = JSON.parse(cuerpo || "{}") as { q?: unknown };
    pregunta = typeof json.q === "string" ? json.q.slice(0, 2000) : "";
  } catch {
    pregunta = cuerpo.slice(0, 2000);
  }

  const tecnica = clasificarPrompt(pregunta);
  const turno = Math.abs(pregunta.length);
  registrarEvento(
    {
      ...baseEvento(request, tecnica === "ninguna" ? "assistant_prompt" : "assistant_injection", tecnica),
      tecnica,
    },
    { prompt: pregunta },
  );

  return NextResponse.json({ a: respuestaAsistente(tecnica, turno) });
}

function respuestaHoneypot(request: NextRequest, pathname: string, cuerpo: string): NextResponse {
  const headers = { "cache-control": "no-store", "x-robots-tag": "noindex" as const };

  if (pathname.endsWith("/.env") || pathname === "/.env") {
    return new NextResponse(textoEnvSenuelo(), {
      status: 200,
      headers: { ...headers, "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (pathname.includes(".git")) {
    return new NextResponse(textoGitConfigFalso(), {
      status: 200,
      headers: { ...headers, "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (pathname.includes("backup.sql")) {
    return new NextResponse("-- dump truncated\n", {
      status: 200,
      headers: { ...headers, "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (pathname.includes(".aws")) {
    return new NextResponse("[default]\nregion = eu-west-1\n", {
      status: 200,
      headers: { ...headers, "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (pathname.includes("phpmyadmin") || pathname.endsWith("config.php") || pathname.endsWith("admin.php")) {
    return new NextResponse(jsonPhpMyAdminFalso(), {
      status: 503,
      headers: { ...headers, "content-type": "application/json" },
    });
  }

  if (pathname.includes("xmlrpc.php")) {
    return new NextResponse("<?xml version=\"1.0\"?><methodResponse><fault></fault></methodResponse>", {
      status: 200,
      headers: { ...headers, "content-type": "text/xml" },
    });
  }

  if (pathname.includes("wp-login")) {
    if (request.method === "POST") {
      registrarEvento(baseEvento(request, "fake_login", "wp-login"), {
        attempted: cuerpo.slice(0, 500),
      });
    }
    return new NextResponse(htmlLoginFalso(), {
      status: 200,
      headers: { ...headers, "content-type": "text/html; charset=utf-8" },
    });
  }

  if (pathname.includes("wp-admin")) {
    return new NextResponse(htmlLoginFalso(), {
      status: 200,
      headers: { ...headers, "content-type": "text/html; charset=utf-8" },
    });
  }

  return new NextResponse(htmlNoEncontradoAburrido(), {
    status: 404,
    headers: { ...headers, "content-type": "text/html; charset=utf-8" },
  });
}
