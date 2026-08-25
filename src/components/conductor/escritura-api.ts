import { encolarItem, escribirCola, leerCola, type ItemColaOffline } from '@/lib/mecanu/cola-offline';
import { nuevaClaveIdempotencia } from '@/lib/mecanu/idempotency';
import { avisarPanelTrasEscritura } from '@/lib/mecanu/panel-realtime';

/**
 * ok — el taller ya lo tiene.
 * cola — sin red / 5xx / 429; se reintenta la misma tarea.
 * error — 4xx permanente (validación, not found); NO encolar (reintentar no arregla).
 */
export type ResultadoEscritura =
  | { tipo: 'ok' }
  | { tipo: 'cola' }
  | { tipo: 'error'; mensaje: string };

type PayloadCola = {
  url: string;
  metodo?: 'POST' | 'PATCH';
  body: unknown;
};

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function payloadDeItem(item: ItemColaOffline): PayloadCola | null {
  const p = item.payload;
  if (!p || typeof p !== 'object') return null;
  const o = p as Record<string, unknown>;
  if (typeof o.url !== 'string') return null;
  return {
    url: o.url,
    metodo: o.metodo === 'PATCH' ? 'PATCH' : 'POST',
    body: o.body,
  };
}

async function mensajeDeRespuesta(res: Response): Promise<string> {
  try {
    const raw = (await res.json()) as { error?: { message?: string } | string };
    if (typeof raw.error === 'string' && raw.error.trim()) return raw.error;
    if (raw.error && typeof raw.error === 'object' && typeof raw.error.message === 'string') {
      return raw.error.message;
    }
  } catch {
    /* ignore */
  }
  return `Error ${res.status}`;
}

/** 4xx salvo 429: el servidor rechazó la tarea; reencolar no ayuda. */
function esRechazoPermanente(status: number): boolean {
  return status >= 400 && status < 500 && status !== 429;
}

/** Reenvía la cola real. Devuelve cuántos quedan pendientes. */
export async function flushColaPendiente(
  storage: StorageLike | null | undefined = typeof window === 'undefined' ? null : window.localStorage,
): Promise<number> {
  const items = leerCola(storage);
  if (!items.length) {
    escribirCola([], storage);
    return 0;
  }
  const restantes: ItemColaOffline[] = [];
  let huboOk = false;
  for (const item of items) {
    const p = payloadDeItem(item);
    if (!p) continue;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (item.idempotencyKey) headers['Idempotency-Key'] = item.idempotencyKey;
      const res = await fetch(p.url, {
        method: p.metodo ?? 'POST',
        headers,
        body: JSON.stringify(p.body ?? {}),
      });
      if (res.ok) {
        huboOk = true;
        continue;
      }
      if (esRechazoPermanente(res.status)) {
        /* Descarta: no tiene sentido reintentar una validación fallida. */
        continue;
      }
      restantes.push(item);
    } catch {
      restantes.push(item);
    }
  }
  escribirCola(restantes, storage);
  if (huboOk) avisarPanelTrasEscritura();
  return restantes.length;
}

/**
 * POST/PATCH con Idempotency-Key por toque. Si no hay red o el servidor falla
 * de forma recuperable, encola la misma tarea (misma clave) para reintentar.
 */
export async function postConCola(opts: {
  url: string;
  metodo?: 'POST' | 'PATCH';
  prefijoClave: string;
  body: unknown;
  online: boolean;
  tipoCola: string;
  onCola: (n: number) => void;
  panelPatch?: { id: string; estado: string; subestado: string }[];
}): Promise<ResultadoEscritura> {
  const key = nuevaClaveIdempotencia(opts.prefijoClave);
  const st = typeof window === 'undefined' ? null : window.localStorage;
  const payload = { url: opts.url, metodo: opts.metodo ?? 'POST', body: opts.body };
  const encolar = () => {
    const cola = encolarItem(leerCola(st), opts.tipoCola, new Date(), {
      payload,
      idempotencyKey: key,
    });
    escribirCola(cola, st);
    opts.onCola(cola.length);
  };
  if (!opts.online) {
    encolar();
    return { tipo: 'cola' };
  }
  try {
    const res = await fetch(opts.url, {
      method: opts.metodo ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify(opts.body),
    });
    if (res.ok) {
      avisarPanelTrasEscritura(opts.panelPatch);
      opts.onCola(leerCola(st).length);
      return { tipo: 'ok' };
    }
    if (esRechazoPermanente(res.status)) {
      return { tipo: 'error', mensaje: await mensajeDeRespuesta(res) };
    }
    encolar();
    return { tipo: 'cola' };
  } catch {
    encolar();
    return { tipo: 'cola' };
  }
}

/** Compat: muchos call sites solo miran si llegó o no. */
export function escrituraOk(r: ResultadoEscritura): boolean {
  return r.tipo === 'ok';
}
