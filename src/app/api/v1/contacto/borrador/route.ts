import { NextResponse } from "next/server";
import { z } from "zod";
import {
  marcarBorradorNotificado,
  sheetsConfigurado,
  upsertBorrador,
} from "@/lib/landing/contacto-borrador";
import {
  borradorTieneDatosUtiles,
  notificarLeadContacto,
} from "@/lib/landing/contacto-notify";

const schema = z.object({
  clientId: z.string().min(8).max(80),
  nombre: z.string().optional().default(""),
  telefono: z.string().optional().default(""),
  paisCodigo: z.string().min(2).max(4).optional().default("ES"),
  ciudad: z.string().optional().default(""),
  volumen: z.string().optional().default(""),
  step: z.number().int().min(1).max(4).optional().default(1),
  locale: z.string().min(2).max(5).optional().default("es"),
  /** El cliente pide aviso inmediato de abandono (p. ej. volvió tras 1 h). */
  forzarAbandono: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }

  const data = parsed.data;
  if (!borradorTieneDatosUtiles(data)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (sheetsConfigurado()) {
    try {
      await upsertBorrador({
        clientId: data.clientId,
        nombre: data.nombre.trim(),
        telefono: data.telefono.trim(),
        paisCodigo: data.paisCodigo,
        ciudad: data.ciudad.trim(),
        volumen: data.volumen.trim(),
        step: data.step,
        locale: data.locale,
      });
    } catch (err) {
      console.error("[contacto/borrador] sheets:", err);
    }
  }

  if (data.forzarAbandono) {
    try {
      await notificarLeadContacto({
        nombre: data.nombre.trim() || "Sin nombre",
        telefono: data.telefono.trim() || "sin teléfono",
        paisCodigo: data.paisCodigo,
        ciudad: data.ciudad.trim() || "Sin ciudad",
        volumen: data.volumen.trim() || "Sin indicar",
        canal: "abandono",
      });
      if (sheetsConfigurado()) {
        await marcarBorradorNotificado(data.clientId).catch((err) => {
          console.error("[contacto/borrador] mark notified:", err);
        });
      }
    } catch (err) {
      console.error("[contacto/borrador] abandono email:", err);
      return NextResponse.json({ error: "email_failed" }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
