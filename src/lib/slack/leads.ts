import { PHONE_COUNTRIES } from "@/lib/landing/phone-countries";
import { slackEscape } from "./notify";

export type LeadContacto = {
  nombre: string;
  apellido: string;
  email: string;
  /** ISO (ES) o prefijo (+34). El formulario manda ISO. */
  paisCodigo?: string;
  telefono: string;
  objetivo: string;
  tipoTaller: string;
  uso: string[];
  ciudad: string;
  volumen: string;
  negocio: string;
  canal: string;
};

export type LeadItv = {
  nombre: string;
  telefono: string;
  /** Si no viene, asumimos España (ITV a domicilio ES). */
  paisCodigo?: string;
  ciudad: string;
  fecha?: string;
  caducada: "si" | "no" | "proximo";
  vehiculo: string;
};

const ITV_CADUCADA: Record<LeadItv["caducada"], string> = {
  si: "Ya está caducada",
  no: "Todavía en vigor",
  proximo: "Caduca en los próximos 30 días",
};

function lineas(pares: [string, string][]): string {
  return pares.map(([k, v]) => `*${k}:* ${slackEscape(v)}`).join("\n");
}

/** Prefijo internacional (+34) desde ISO o desde un valor que ya trae +. */
export function prefijoTelefonico(paisCodigo?: string): string | null {
  if (!paisCodigo?.trim()) return null;
  const raw = paisCodigo.trim();
  if (raw.startsWith("+")) return raw;
  const pais = PHONE_COUNTRIES.find((c) => c.code === raw.toUpperCase());
  return pais?.prefix ?? null;
}

/** Texto legible: "+34 633760969" (nunca "ES 633…"). */
export function telefonoConPrefijo(paisCodigo: string | undefined, telefono: string): string {
  const pref = prefijoTelefonico(paisCodigo);
  const local = telefono.trim();
  return pref ? `${pref} ${local}` : local;
}

/**
 * Dígitos E.164 sin +: "34633760969".
 * Si el número ya trae el prefijo del país, no lo duplica.
 */
export function digitosWhatsApp(paisCodigo: string | undefined, telefono: string): string | null {
  let d = telefono.replace(/\D/g, "");
  if (!d) return null;
  const pref = prefijoTelefonico(paisCodigo);
  if (pref) {
    const prefD = pref.replace(/\D/g, "");
    if (d.startsWith(prefD)) return d;
    d = d.replace(/^0+/, "");
    return `${prefD}${d}`;
  }
  return d.length >= 8 ? d : null;
}

export function enlaceWhatsApp(paisCodigo: string | undefined, telefono: string): string | null {
  const d = digitosWhatsApp(paisCodigo, telefono);
  return d ? `https://wa.me/${d}` : null;
}

export function textoLeadContacto(data: LeadContacto): string {
  const telefono = telefonoConPrefijo(data.paisCodigo, data.telefono);
  const wa = enlaceWhatsApp(data.paisCodigo, data.telefono);
  const pares: [string, string][] = [
    ["Nombre", `${data.nombre} ${data.apellido}`],
    ["Taller", data.negocio],
    ["Ciudad", data.ciudad],
    ["Teléfono", telefono],
    ["Email", data.email],
    ["Objetivo", data.objetivo],
    ["Tipo", data.tipoTaller],
    ["Uso", data.uso.join(", ")],
    ["Volumen", data.volumen],
    ["Cómo nos conoció", data.canal],
  ];
  const cuerpo = [
    "*Habla con Mecanu* — nueva solicitud",
    lineas(pares),
  ];
  if (wa) {
    // mrkdwn de Slack: <url|etiqueta>
    cuerpo.push(`*WhatsApp:* <${wa}|Abrir chat>`);
  }
  return cuerpo.join("\n");
}

export function textoLeadItv(data: LeadItv): string {
  const pais = data.paisCodigo ?? "ES";
  const telefono = telefonoConPrefijo(pais, data.telefono);
  const wa = enlaceWhatsApp(pais, data.telefono);
  const cuerpo = [
    "*ITV a domicilio* — nuevo lead",
    lineas([
      ["Nombre", data.nombre],
      ["Teléfono", telefono],
      ["Ciudad", data.ciudad],
      ["Vehículo", data.vehiculo],
      ["ITV", ITV_CADUCADA[data.caducada]],
      ["Fecha", data.fecha?.trim() ? data.fecha : "lo antes posible"],
    ]),
  ];
  if (wa) {
    cuerpo.push(`*WhatsApp:* <${wa}|Abrir chat>`);
  }
  return cuerpo.join("\n");
}
