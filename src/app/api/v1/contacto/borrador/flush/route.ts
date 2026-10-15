import { NextResponse } from "next/server";
import {
  sheetsConfigurado,
  listarBorradoresAbandonados,
  marcarBorradorNotificado,
  borradorALead,
} from "@/lib/landing/contacto-borrador";
import { notificarLeadContacto } from "@/lib/landing/contacto-notify";

function autorizado(request: Request): boolean {
  const secret = process.env.CONTACTO_CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const query = new URL(request.url).searchParams.get("secret") ?? "";
  return bearer === secret || query === secret;
}

/** Cron (GitHub Actions): envía borradores abandonados ≥1 h. */
export async function POST(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!sheetsConfigurado()) {
    return NextResponse.json({ ok: true, flushed: 0, reason: "no_sheets" });
  }

  let pendientes;
  try {
    pendientes = await listarBorradoresAbandonados();
  } catch (err) {
    console.error("[contacto/borrador/flush] leer:", err);
    return NextResponse.json({ error: "sheets_failed" }, { status: 502 });
  }

  let enviados = 0;
  const errores: string[] = [];

  for (const b of pendientes) {
    try {
      await notificarLeadContacto(borradorALead(b));
      await marcarBorradorNotificado(b.clientId);
      enviados += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "error";
      errores.push(`${b.clientId}: ${msg}`);
      console.error("[contacto/borrador/flush] notify:", err);
    }
  }

  return NextResponse.json({
    ok: errores.length === 0,
    flushed: enviados,
    pendientes: pendientes.length,
    errores,
  });
}
