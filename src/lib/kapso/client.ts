/**
 * Cliente HTTP de Kapso (WhatsApp Cloud API).
 * Server-only: nunca importar desde componentes de cliente.
 */
import { requireKapsoConfig, type KapsoConfig } from './config';
import type { ErrorWa, PayloadWa, RespuestaEnvio } from '@/lib/mecanu/mecanu-whatsapp';

const BASE = 'https://api.kapso.ai/meta/whatsapp';

export class KapsoError extends Error {
  code: number;
  status: number;

  constructor(status: number, code: number, message: string) {
    super(message);
    this.name = 'KapsoError';
    this.status = status;
    this.code = code;
  }
}

function mapKapsoError(status: number, body: unknown): KapsoError {
  const rec = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  const err = rec.error && typeof rec.error === 'object' ? rec.error as Record<string, unknown> : rec;
  const code = typeof err.code === 'number' ? err.code : 0;
  const message = typeof err.message === 'string'
    ? err.message
    : typeof rec.message === 'string'
      ? rec.message
      : `Kapso respondió ${status}`;
  return new KapsoError(status, code, message);
}

export function toErrorWa(err: unknown): ErrorWa {
  if (err instanceof KapsoError) {
    const e = new Error(err.message) as ErrorWa;
    e.code = err.code || undefined;
    return e;
  }
  const e = new Error(err instanceof Error ? err.message : 'Error al enviar por WhatsApp') as ErrorWa;
  return e;
}

export async function enviarMensajeKapso(
  payload: PayloadWa,
  cfg: KapsoConfig = requireKapsoConfig(),
): Promise<RespuestaEnvio> {
  const url = `${BASE}/${cfg.phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': cfg.apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw mapKapsoError(res.status, data);
  }
  return data as RespuestaEnvio;
}
