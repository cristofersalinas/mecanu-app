/**
 * Cuándo el kanban del panel debe volver a pedir el snapshot
 * tras un evento Realtime de `public.rutas`.
 */

export const PANEL_REALTIME_DEBOUNCE_MS = 400;
/**
 * Red de seguridad mientras el websocket no entrega el WAL (RLS sin JWT,
 * publication no aplicada, TIMED_OUT). El canal adelanta el mismo refresco.
 */
export const PANEL_REALTIME_POLL_MS = 1_200;

/** Snapshot completo: menos frecuente; el poll vivo usa /panel/kanban. */
export const PANEL_SNAPSHOT_POLL_MS = 15_000;

/** Misma pestaña / otro tab en el mismo origen: el conductor avisa al panel. */
export const PANEL_SYNC_CHANNEL = 'mecanu-panel-sync';

export type PanelSyncRuta = {
  id: string;
  estado: string;
  subestado: string;
};

export type PanelSyncMensaje =
  | { type: 'ruta-changed'; at: number }
  | { type: 'ruta-patch'; at: number; rutas: PanelSyncRuta[] };

export function avisarPanelTrasEscritura(patch?: PanelSyncRuta[]): void {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
  try {
    const bc = new BroadcastChannel(PANEL_SYNC_CHANNEL);
    const msg: PanelSyncMensaje = patch?.length
      ? { type: 'ruta-patch', at: Date.now(), rutas: patch }
      : { type: 'ruta-changed', at: Date.now() };
    bc.postMessage(msg);
    bc.close();
  } catch {
    /* Safari privado / entornos sin BroadcastChannel */
  }
}

export type EventoRutaRealtime = {
  eventType: string;
  newRow?: { estado?: unknown; subestado?: unknown } | null;
  oldRow?: { estado?: unknown; subestado?: unknown } | null;
};

/**
 * INSERT/DELETE siempre. UPDATE si cambió estado o subestado, o si Postgres
 * no mandó el `old` (replica identity default: solo PK) — en ese caso no
 * podemos discriminar y refrescamos.
 */
export function cambioRutaAfectaKanban(ev: EventoRutaRealtime): boolean {
  if (ev.eventType === 'INSERT' || ev.eventType === 'DELETE') return true;
  if (ev.eventType !== 'UPDATE') return false;
  const n = ev.newRow ?? {};
  const o = ev.oldRow ?? {};
  if (o.estado === undefined && o.subestado === undefined) return true;
  return n.estado !== o.estado || n.subestado !== o.subestado;
}

export function tallerIdDesdeAppMetadata(meta: unknown): string | null {
  if (!meta || typeof meta !== 'object') return null;
  const id = (meta as { taller_id?: unknown }).taller_id;
  return typeof id === 'string' && id.trim() ? id.trim() : null;
}

export function crearRefrescoDebounced(
  fn: () => void,
  ms: number = PANEL_REALTIME_DEBOUNCE_MS,
): { ping: () => void; cancel: () => void } {
  let t: ReturnType<typeof setTimeout> | null = null;
  return {
    ping() {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        t = null;
        fn();
      }, ms);
    },
    cancel() {
      if (t) clearTimeout(t);
      t = null;
    },
  };
}
