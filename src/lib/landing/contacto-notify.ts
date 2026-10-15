import { Resend } from "resend";
import { avisarLead } from "@/lib/slack/notify";
import {
  enlaceWhatsApp,
  telefonoConPrefijo,
  textoLeadContacto,
  type LeadContacto,
} from "@/lib/slack/leads";

export const LEAD_EMAIL_TO = "cris@mecanu.com";

/** Umbral de abandono del wizard de /contacto. */
export const CONTACTO_ABANDONO_MS = 60 * 60 * 1000;

function tituloEmail(canal: string | undefined): string {
  if (canal === "abandono") return "Formulario incompleto (1 h)";
  if (canal === "mapa") return "Postular taller (mapa)";
  return "Nueva solicitud de taller";
}

function asuntoEmail(data: LeadContacto): string {
  const quien = data.nombre?.trim() || "sin nombre";
  const donde = data.ciudad?.trim() || "sin ciudad";
  if (data.canal === "abandono") {
    return `Formulario incompleto — ${quien} (${donde})`;
  }
  if (data.canal === "mapa") {
    return `Postular taller (mapa) — ${quien} (${donde})`;
  }
  return `Nueva solicitud de taller — ${quien} (${donde})`;
}

/** Envía el lead a cris@mecanu.com. Falla si falta RESEND o Resend rechaza. */
export async function enviarLeadPorEmail(data: LeadContacto): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY no configurada");
  }

  const resend = new Resend(apiKey);
  const telefono = telefonoConPrefijo(data.paisCodigo, data.telefono);
  const wa = enlaceWhatsApp(data.paisCodigo, data.telefono);

  const rows = (
    [
      ["Nombre", [data.nombre, data.apellido].filter(Boolean).join(" ")],
      ["Email", data.email],
      ["Teléfono", telefono],
      ...(wa ? [["WhatsApp", wa] as [string, string]] : []),
      ["Objetivo", data.objetivo],
      ["Uso previsto", data.uso?.join(", ")],
      ["Ciudad", data.ciudad],
      ["Vehículos/mes", data.volumen],
      ["Nombre del taller", data.negocio],
      ["Canal de origen", data.canal],
    ] as [string, string | undefined][]
  ).filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()));

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#374151;white-space:nowrap;">${label}</td><td style="padding:6px 12px;color:#0f0f0f;">${value}</td></tr>`
    )
    .join("");

  const { error } = await resend.emails.send({
    from: "Mecanu Formulario <formulario@mecanu.com>",
    to: [LEAD_EMAIL_TO],
    subject: asuntoEmail(data),
    html: `
      <div style="font-family:'Inter Tight',Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px;">
        <div style="margin-bottom:24px;">
          <span style="font-size:18px;font-weight:700;color:#0f0f0f;">Mecanu</span>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#0f0f0f;margin:0 0 20px;">${tituloEmail(data.canal)}</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
          <tbody>${tableRows}</tbody>
        </table>
        <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
          Enviado el ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message ?? "Resend rechazó el envío");
  }
}

/** Correo (obligatorio) + Slack (best-effort). */
export async function notificarLeadContacto(data: LeadContacto): Promise<void> {
  await enviarLeadPorEmail(data);
  try {
    await avisarLead(textoLeadContacto(data));
  } catch (err) {
    console.error("[contacto] Slack error:", err);
  }
}

export function borradorTieneDatosUtiles(data: {
  nombre?: string;
  telefono?: string;
}): boolean {
  return Boolean(data.nombre?.trim() || data.telefono?.trim());
}
