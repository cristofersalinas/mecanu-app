/**
 * Verificación y normalización de webhooks Kapso.
 */
import { createHmac, timingSafeEqual } from 'crypto';

export function verificarFirmaKapso(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader?.trim()) return false;
  const sig = signatureHeader.replace(/^sha256=/i, '').trim();
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  try {
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export interface EventoKapsoEntrante {
  kind: 'mensaje';
  wamid: string;
  telefonoE164: string;
  texto: string;
  ts: Date;
}

export interface EventoKapsoEstado {
  kind: 'estado';
  wamid: string;
  estado: 'sent' | 'delivered' | 'read' | 'failed';
  errorCode?: number;
  ts: Date;
}

export type EventoKapso = EventoKapsoEntrante | EventoKapsoEstado;

function soloDigitos(tel: string): string {
  return tel.replace(/\D/g, '');
}

function normalizarTelefono(raw: string | undefined): string | null {
  if (!raw) return null;
  const d = soloDigitos(raw);
  if (!d) return null;
  return d.startsWith('34') ? `+${d}` : `+34${d}`;
}

function parseTs(raw: unknown): Date {
  if (typeof raw === 'string' || typeof raw === 'number') {
    const n = Number(raw);
    if (!Number.isNaN(n)) {
      return n < 1e12 ? new Date(n * 1000) : new Date(n);
    }
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

/** Acepta payload Kapso v2 o envoltorio Meta clásico. */
export function parsearEventosKapso(eventName: string, payload: unknown): EventoKapso[] {
  const out: EventoKapso[] = [];
  const root = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};

  const batches = Array.isArray(root.data) ? root.data : [root];

  for (const batch of batches) {
    if (!batch || typeof batch !== 'object') continue;
    const b = batch as Record<string, unknown>;

    if (eventName.includes('message.received') || b.type === 'message') {
      const msg = (b.message ?? b) as Record<string, unknown>;
      const from = normalizarTelefono(
        String(msg.from ?? msg.waId ?? msg.wa_id ?? ''),
      );
      const textoObj = msg.text && typeof msg.text === 'object'
        ? msg.text as Record<string, unknown>
        : null;
      const texto = typeof textoObj?.body === 'string'
        ? textoObj.body
        : typeof msg.body === 'string'
          ? msg.body
          : '';
      const wamid = String(msg.id ?? msg.messageId ?? msg.message_id ?? '');
      if (from && wamid) {
        out.push({
          kind: 'mensaje',
          wamid,
          telefonoE164: from,
          texto,
          ts: parseTs(msg.timestamp ?? b.timestamp),
        });
      }
      continue;
    }

    if (eventName.includes('status') || b.type === 'status') {
      const st = (b.status ?? b) as Record<string, unknown>;
      const wamid = String(st.id ?? st.messageId ?? st.message_id ?? '');
      const estadoRaw = String(st.status ?? st.messageStatus ?? '');
      const estado = ['sent', 'delivered', 'read', 'failed'].includes(estadoRaw)
        ? estadoRaw as EventoKapsoEstado['estado']
        : null;
      if (wamid && estado) {
        const errors = Array.isArray(st.errors) ? st.errors : [];
        const first = errors[0] && typeof errors[0] === 'object'
          ? errors[0] as Record<string, unknown>
          : null;
        out.push({
          kind: 'estado',
          wamid,
          estado,
          errorCode: typeof first?.code === 'number' ? first.code : undefined,
          ts: parseTs(st.timestamp ?? b.timestamp),
        });
      }
    }

    // Meta envelope: entry[].changes[].value.messages | statuses
    const entry = Array.isArray(b.entry) ? b.entry : [];
    for (const e of entry) {
      if (!e || typeof e !== 'object') continue;
      const changes = Array.isArray((e as Record<string, unknown>).changes)
        ? (e as Record<string, unknown>).changes as unknown[]
        : [];
      for (const ch of changes) {
        if (!ch || typeof ch !== 'object') continue;
        const value = (ch as Record<string, unknown>).value as Record<string, unknown> | undefined;
        if (!value) continue;
        const mensajes = Array.isArray(value.messages) ? value.messages : [];
        for (const msg of mensajes) {
          if (!msg || typeof msg !== 'object') continue;
          const m = msg as Record<string, unknown>;
          const from = normalizarTelefono(String(m.from ?? ''));
          const textoObj = m.text && typeof m.text === 'object' ? m.text as Record<string, unknown> : null;
          const texto = typeof textoObj?.body === 'string' ? textoObj.body : '';
          const wamid = String(m.id ?? '');
          if (from && wamid) {
            out.push({ kind: 'mensaje', wamid, telefonoE164: from, texto, ts: parseTs(m.timestamp) });
          }
        }
        const statuses = Array.isArray(value.statuses) ? value.statuses : [];
        for (const st of statuses) {
          if (!st || typeof st !== 'object') continue;
          const s = st as Record<string, unknown>;
          const wamid = String(s.id ?? '');
          const estadoRaw = String(s.status ?? '');
          const estado = ['sent', 'delivered', 'read', 'failed'].includes(estadoRaw)
            ? estadoRaw as EventoKapsoEstado['estado']
            : null;
          if (wamid && estado) {
            const errors = Array.isArray(s.errors) ? s.errors : [];
            const first = errors[0] && typeof errors[0] === 'object'
              ? errors[0] as Record<string, unknown>
              : null;
            out.push({
              kind: 'estado',
              wamid,
              estado,
              errorCode: typeof first?.code === 'number' ? first.code : undefined,
              ts: parseTs(s.timestamp),
            });
          }
        }
      }
    }
  }

  return out;
}
