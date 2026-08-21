import { NextResponse } from "next/server";
import { z } from "zod";
import { google } from "googleapis";
import { Resend } from "resend";
import { avisarLead } from "@/lib/slack/notify";
import {
  enlaceWhatsApp,
  telefonoConPrefijo,
  textoLeadContacto,
} from "@/lib/slack/leads";

const schema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  email: z.email(),
  paisCodigo: z.string().min(2).max(4).optional(),
  telefono: z.string().min(6),
  objetivo: z.string().min(1),
  tipoTaller: z.string().min(1),
  uso: z.array(z.string()).min(1).max(3),
  ciudad: z.string().min(1),
  volumen: z.string().min(1),
  negocio: z.string().min(1),
  canal: z.string().min(1),
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
    range: "A:L",
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
          data.tipoTaller,
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

async function sendNotificationEmail(data: z.infer<typeof schema>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);

  const telefono = telefonoConPrefijo(data.paisCodigo, data.telefono);
  const wa = enlaceWhatsApp(data.paisCodigo, data.telefono);

  const rows = [
    ["Nombre", `${data.nombre} ${data.apellido}`],
    ["Email", data.email],
    ["Teléfono", telefono],
    ...(wa ? [["WhatsApp", wa] as [string, string]] : []),
    ["Objetivo", data.objetivo],
    ["Tipo de taller", data.tipoTaller],
    ["Uso previsto", data.uso.join(", ")],
    ["Ciudad", data.ciudad],
    ["Vehículos/mes", data.volumen],
    ["Nombre del taller", data.negocio],
    ["Canal de origen", data.canal],
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#374151;white-space:nowrap;">${label}</td><td style="padding:6px 12px;color:#0f0f0f;">${value}</td></tr>`
    )
    .join("");

  await resend.emails.send({
    from: "Mecanu Formulario <formulario@mecanu.com>",
    to: "cris@mecanu.com",
    subject: `Nueva solicitud de taller — ${data.nombre} ${data.apellido} (${data.negocio})`,
    html: `
      <div style="font-family:'Inter Tight',Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px;">
        <div style="margin-bottom:24px;">
          <span style="font-size:18px;font-weight:700;color:#0f0f0f;">Mecanu</span>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#0f0f0f;margin:0 0 20px;">Nueva solicitud de taller</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
          <tbody>${tableRows}</tbody>
        </table>
        <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
          Enviado el ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}
        </p>
      </div>
    `,
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

  const [sheetsError, emailError, slackError] = await Promise.allSettled([
    appendToSheet(data),
    sendNotificationEmail(data),
    avisarLead(textoLeadContacto(data)),
  ]);

  if (sheetsError.status === "rejected") {
    console.error("[contacto] Google Sheets error:", sheetsError.reason);
  }
  if (emailError.status === "rejected") {
    console.error("[contacto] Resend error:", emailError.reason);
  }
  if (slackError.status === "rejected") {
    console.error("[contacto] Slack error:", slackError.reason);
  }

  return NextResponse.json({ ok: true });
}
