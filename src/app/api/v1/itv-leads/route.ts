import { NextResponse } from "next/server";
import { z } from "zod";
import { google } from "googleapis";
import { Resend } from "resend";

const schema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().min(6),
  ciudad: z.string().min(1),
  fecha: z.string().optional().default(""),
  caducada: z.enum(["si", "no", "proximo"]),
  vehiculo: z.string().min(1),
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
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "ITV!A:H",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        new Date().toISOString(),
        data.nombre,
        data.telefono,
        data.ciudad,
        data.fecha,
        data.caducada,
        data.vehiculo,
        "itv-a-domicilio",
      ]],
    },
  });
}

async function notify(data: z.infer<typeof schema>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "Mecanu Formulario <formulario@mecanu.com>",
    to: ["cris@mecanu.com"],
    subject: `Lead ITV a domicilio — ${data.nombre} (${data.ciudad})`,
    text: [
      `Nombre: ${data.nombre}`,
      `Teléfono: ${data.telefono}`,
      `Ciudad: ${data.ciudad}`,
      `Fecha: ${data.fecha || "sin fecha"}`,
      `ITV: ${data.caducada}`,
      `Vehículo: ${data.vehiculo}`,
    ].join("\n"),
  });
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    await appendToSheet(parsed.data);
  } catch (error) {
    console.error("[itv-leads] sheet", error);
  }
  try {
    await notify(parsed.data);
  } catch (error) {
    console.error("[itv-leads] email", error);
  }
  return NextResponse.json({ ok: true });
}
