import { slackEscape } from "./notify";

export type LeadContacto = {
  nombre: string;
  apellido: string;
  email: string;
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

export function textoLeadContacto(data: LeadContacto): string {
  const telefono = data.paisCodigo
    ? `${data.paisCodigo} ${data.telefono}`
    : data.telefono;
  return [
    "*Habla con Mecanu* — nueva solicitud",
    lineas([
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
    ]),
  ].join("\n");
}

export function textoLeadItv(data: LeadItv): string {
  return [
    "*ITV a domicilio* — nuevo lead",
    lineas([
      ["Nombre", data.nombre],
      ["Teléfono", data.telefono],
      ["Ciudad", data.ciudad],
      ["Vehículo", data.vehiculo],
      ["ITV", ITV_CADUCADA[data.caducada]],
      ["Fecha", data.fecha?.trim() ? data.fecha : "lo antes posible"],
    ]),
  ].join("\n");
}
