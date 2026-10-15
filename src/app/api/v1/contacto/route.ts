import { NextResponse } from "next/server";
import { z } from "zod";
import { google } from "googleapis";
import { marcarBorradorCompletado } from "@/lib/landing/contacto-borrador";
import { notificarLeadContacto } from "@/lib/landing/contacto-notify";
import { telefonoConPrefijo } from "@/lib/slack/leads";

const schema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().optional().default(""),
  email: z.union([z.literal(""), z.email()]).optional().default(""),
  paisCodigo: z.string().min(2).max(4).optional(),
  telefono: z.string().min(6),
  objetivo: z.string().optional().default(""),
  uso: z.array(z.string()).max(3).optional().default([]),
  ciudad: z.string().min(1),
  volumen: z.string().min(1),
  negocio: z.string().optional().default(""),
  canal: z.string().optional().default(""),
  clientId: z.string().min(8).max(80).optional(),
  /** RGPD: el envío exige aceptación explícita de la política. */
  aceptaPrivacidad: z.literal(true),
});

async function appendToSheet(data: z.infer<typeof schema>) {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!serviceAccountJson || !sheetId) return;

  const credentials = JSON.parse(serviceAccountJson) as {
    client_email: string;
    private_key: string;
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const timestamp = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "A:K",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          timestamp,
          data.nombre,
          data.apellido,
          data.email,
          data.paisCodigo
            ? telefonoConPrefijo(data.paisCodigo, data.telefono)
            : data.telefono,
          data.objetivo,
          data.uso.join(" / "),
          data.ciudad,
          data.volumen,
          data.negocio,
          data.canal,
        ],
      ],
    },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "validation", issues: result.error.issues }, { status: 422 });
  }

  const data = result.data;

  try {
    await notificarLeadContacto({
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      paisCodigo: data.paisCodigo,
      telefono: data.telefono,
      objetivo: data.objetivo,
      uso: data.uso,
      ciudad: data.ciudad,
      volumen: data.volumen,
      negocio: data.negocio,
      canal: data.canal,
    });
  } catch (emailError) {
    console.error("[contacto] Resend error:", emailError);
    return NextResponse.json({ error: "email_failed" }, { status: 502 });
  }

  const [sheetsError, borradorError] = await Promise.allSettled([
    appendToSheet(data),
    data.clientId ? marcarBorradorCompletado(data.clientId) : Promise.resolve(),
  ]);

  if (sheetsError.status === "rejected") {
    console.error("[contacto] Google Sheets error:", sheetsError.reason);
  }
  if (borradorError.status === "rejected") {
    console.error("[contacto] borrador complete:", borradorError.reason);
  }

  return NextResponse.json({ ok: true });
}
