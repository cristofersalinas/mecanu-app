/**
 * Defensa del formulario de contacto, para cuando exista.
 *
 * Hoy la landing no tiene formulario: los CTA son anclas. No se abre un POST
 * público vacío (eso sería superficie nueva). Quien añada el form debe pasar
 * el body por `validarContacto` antes de enviar nada.
 */

import { comprobarRateLimit, REGLA_CONTACTO } from "./rate-limit";

export const CAMPO_HONEYPOT = "company_website";
const MAX_BYTES = 8_000;

export type ContactoInvalido = { ok: false; codigo: "honeypot" | "too_large" | "rate_limited" | "invalid" };
export type ContactoValido = { ok: true; mensaje: string; email: string };

export function validarContacto(
  ip: string,
  body: Record<string, unknown>,
  rawLength: number,
): ContactoValido | ContactoInvalido {
  if (rawLength > MAX_BYTES) return { ok: false, codigo: "too_large" };

  const trampa = body[CAMPO_HONEYPOT];
  if (typeof trampa === "string" && trampa.trim() !== "") {
    return { ok: false, codigo: "honeypot" };
  }

  const limite = comprobarRateLimit(`contacto:${ip}`, Date.now(), REGLA_CONTACTO);
  if (!limite.permitido) return { ok: false, codigo: "rate_limited" };

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const mensaje = typeof body.mensaje === "string" ? body.mensaje.trim() : "";
  if (!email.includes("@") || mensaje.length < 3 || mensaje.length > 2000) {
    return { ok: false, codigo: "invalid" };
  }

  return { ok: true, email, mensaje };
}
