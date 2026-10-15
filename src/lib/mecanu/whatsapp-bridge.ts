import { e164 } from './mecanu-whatsapp';

/**
 * Cliente del puente Baileys (WhatsApp Web embebido).
 * El protocolo vive en `scripts/whatsapp-sesion-bridge.ts` (proceso largo).
 * Next no abre web.whatsapp.com: pide QR en PNG y lo pinta en el panel.
 *
 * Repo: https://github.com/WhiskeySockets/Baileys
 */
export const WHATSAPP_BRIDGE_DEFAULT = 'http://127.0.0.1:3781';
export const MAX_SESIONES_BRIDGE = 5;

export type EstadoBridge = 'idle' | 'qr' | 'open' | 'close' | 'error';

export interface ChatBridge {
  jid: string;
  nombre: string;
  telefono: string;
  ultimoTexto: string | null;
  actualizadoEn: string;
}

export interface MensajeBridge {
  id: string;
  jid: string;
  direccion: 'salida' | 'entrada';
  texto: string;
  ts: string;
}

export interface SesionBridge {
  id: string;
  estado: EstadoBridge;
  qrDataUrl: string | null;
  pairingCode?: string | null;
  error: string | null;
  desde?: string;
  chats: ChatBridge[];
}

export function urlPuenteWhatsApp(): string {
  return (process.env.WHATSAPP_BRIDGE_URL ?? WHATSAPP_BRIDGE_DEFAULT).replace(/\/$/, '');
}

export function conversacionIdDeJid(jid: string): string {
  const user = jid.split('@')[0]?.replace(/\D/g, '') || 'desconocido';
  return `wac-jid-${user}`;
}

/**
 * JID de chat 1:1. Los teléfonos que ya vienen de WhatsApp son E.164 sin «+»
 * (p. ej. 569… Chile, 346… España): no se les fuerza el prefijo ES.
 * Solo números locales cortos (≤9 dígitos) asumen España.
 */
export function jidDeTelefono(telefono: string): string | null {
  const digits = telefono.replace(/\D/g, '');
  if (!digits || digits.length < 8) return null;
  if (digits.length >= 10) return `${digits}@s.whatsapp.net`;
  const e = e164(telefono);
  if (!e) return null;
  return `${e.replace(/\D/g, '')}@s.whatsapp.net`;
}

export function telefonoDeJid(jid: string): string {
  if (jid.endsWith('@lid')) return '';
  const user = jid.split('@')[0] ?? '';
  return user.replace(/\D/g, '');
}

async function puenteFetch(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<Response | null> {
  const timeoutMs = init?.timeoutMs ?? 4000;
  const rest = { ...(init ?? {}) };
  delete (rest as { timeoutMs?: number }).timeoutMs;
  try {
    return await fetch(`${urlPuenteWhatsApp()}${path}`, {
      ...rest,
      headers: { 'content-type': 'application/json', ...(rest.headers ?? {}) },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return null;
  }
}

export async function puenteActivo(): Promise<boolean> {
  const res = await puenteFetch('/health');
  if (!res?.ok) return false;
  const data = await res.json().catch(() => ({}));
  return data.ok === true;
}

export async function puenteArrancar(
  id: string,
  opts?: { desde?: string },
): Promise<SesionBridge> {
  const res = await puenteFetch('/sessions', {
    method: 'POST',
    body: JSON.stringify({ id, desde: opts?.desde }),
    timeoutMs: 15000,
  });
  if (!res) throw new Error('Arranca el puente: npm run wa:bridge');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'No se pudo abrir la sesión');
  return data as SesionBridge;
}

export async function puenteEstado(id: string): Promise<SesionBridge | null> {
  const res = await puenteFetch(`/sessions/${encodeURIComponent(id)}`);
  if (!res?.ok) return null;
  return (await res.json()) as SesionBridge;
}

export async function puenteMensajes(id: string, jid: string): Promise<MensajeBridge[]> {
  const res = await puenteFetch(
    `/sessions/${encodeURIComponent(id)}/messages?jid=${encodeURIComponent(jid)}`,
  );
  if (!res?.ok) return [];
  const data = await res.json().catch(() => ({}));
  return Array.isArray(data.mensajes) ? data.mensajes : [];
}

export async function puenteEnviar(id: string, jid: string, texto: string): Promise<void> {
  const res = await puenteFetch(`/sessions/${encodeURIComponent(id)}/send`, {
    method: 'POST',
    body: JSON.stringify({ jid, texto }),
  });
  if (!res) throw new Error('Arranca el puente: npm run wa:bridge');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'No se pudo enviar');
}

export async function puenteCerrar(id: string): Promise<void> {
  await puenteFetch(`/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/** Código de emparejamiento (alternativa al QR). Teléfono solo dígitos + país. */
export async function puentePedirCodigo(id: string, telefono: string): Promise<SesionBridge> {
  const res = await puenteFetch(`/sessions/${encodeURIComponent(id)}/pair`, {
    method: 'POST',
    body: JSON.stringify({ telefono }),
    timeoutMs: 20000,
  });
  if (!res) throw new Error('Arranca el puente: npm run wa:bridge');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'No se pudo pedir el código');
  }
  return data as SesionBridge;
}

/** Normaliza a dígitos con país para Baileys (sin +). Local ES → 34…. */
export function digitosEmparejarWhatsApp(telefono: string, prefijoDefault = '34'): string | null {
  const d = telefono.replace(/\D/g, '');
  if (!d) return null;
  if (d.length >= 10 && d.length <= 15) return d;
  if (d.length === 9) return `${prefijoDefault}${d}`;
  return null;
}
