import { NextResponse } from "next/server";
import {
  sheetsConfigurado,
  listarBorradoresAbandonados,
  marcarBorradorNotificado,
  borradorALead,
} from "@/lib/landing/contacto-borrador";
import { notificarLeadContacto } from "@/lib/landing/contacto-notify";
import { bearerValido } from "@/lib/security/controles";

function autorizado(request: Request): boolean {
  return bearerValido(
    request.headers.get("authorization"),
    process.env.CONTACTO_CRON_SECRET,
  );
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
  let fallos = 0;

  for (const b of pendientes) {
    try {
      await notificarLeadContacto(borradorALead(b));
      await marcarBorradorNotificado(b.clientId);
      enviados += 1;
    } catch (err) {
      fallos += 1;
      console.error("[contacto/borrador/flush] notify:", b.clientId, err);
    }
  }

  return NextResponse.json({
    ok: fallos === 0,
    flushed: enviados,
    pendientes: pendientes.length,
    fallos,
  });
}
