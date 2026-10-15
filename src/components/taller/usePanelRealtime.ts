'use client';

/**
 * El kanban se actualiza cuando Postgres cambia una ruta del taller
 * (conductor: agendado → en_ruta). Una sola suscripción por PanelProvider.
 *
 * Poll ligero (`refrescarKanban`) cada ~1,2 s: solo estado/subestado.
 * Snapshot completo periódicamente y al volver a la pestaña.
 * BroadcastChannel: el conductor avisa al instante tras un POST ok.
 */
import { useEffect, useRef } from 'react';
import {
  PANEL_REALTIME_DEBOUNCE_MS,
  PANEL_REALTIME_POLL_MS,
  PANEL_SNAPSHOT_POLL_MS,
  PANEL_SYNC_CHANNEL,
  cambioRutaAfectaKanban,
  crearRefrescoDebounced,
  type PanelSyncMensaje,
  type PanelSyncRuta,
} from '@/lib/mecanu/panel-realtime';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { supabasePanelActivo } from './hidratar-panel';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function usePanelKanbanRealtime(
  refrescarKanban: () => void | Promise<void>,
  refrescarSnapshot: () => void | Promise<void>,
  parchearKanban: (rutas: PanelSyncRuta[]) => void,
  activo: boolean,
): void {
  const kanbanRef = useRef(refrescarKanban);
  const snapRef = useRef(refrescarSnapshot);
  const patchRef = useRef(parchearKanban);

  useEffect(() => {
    kanbanRef.current = refrescarKanban;
    snapRef.current = refrescarSnapshot;
    patchRef.current = parchearKanban;
  }, [refrescarKanban, refrescarSnapshot, parchearKanban]);

  useEffect(() => {
    if (!activo || !supabasePanelActivo()) return;

    let cancelado = false;
    let enVueloKanban = false;
    let enVueloSnap = false;

    const lanzarKanban = () => {
      if (enVueloKanban) return;
      enVueloKanban = true;
      Promise.resolve(kanbanRef.current()).finally(() => {
        enVueloKanban = false;
      });
    };

    const lanzarSnapshot = () => {
      if (enVueloSnap) return;
      enVueloSnap = true;
      Promise.resolve(snapRef.current()).finally(() => {
        enVueloSnap = false;
      });
    };

    const pingDebounced = crearRefrescoDebounced(lanzarKanban, PANEL_REALTIME_DEBOUNCE_MS);

    /* Primer poll en cuanto monta — no esperar al snapshot de 3 s. */
    lanzarKanban();

    const pollKanban = setInterval(lanzarKanban, PANEL_REALTIME_POLL_MS);
    const pollSnap = setInterval(lanzarSnapshot, PANEL_SNAPSHOT_POLL_MS);

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      lanzarKanban();
      lanzarSnapshot();
    };
    document.addEventListener('visibilitychange', onVisible);

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel(PANEL_SYNC_CHANNEL);
        bc.onmessage = (ev: MessageEvent<PanelSyncMensaje>) => {
          const msg = ev.data;
          if (msg?.type === 'ruta-patch' && msg.rutas?.length) {
            patchRef.current(msg.rutas);
            return;
          }
          lanzarKanban();
        };
      } catch {
        bc = null;
      }
    }

    let sb: ReturnType<typeof createSupabaseBrowser> | null = null;
    let channel: ReturnType<ReturnType<typeof createSupabaseBrowser>['channel']> | null = null;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      sb = createSupabaseBrowser();
      channel = sb.channel('panel-kanban-rutas');

      void (async () => {
        const { data: { session } } = await sb!.auth.getSession();
        if (cancelado) return;
        if (session?.access_token) {
          await sb!.realtime.setAuth(session.access_token);
        }

        channel!.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rutas' },
          (payload: RealtimePostgresChangesPayload<FilaRuta>) => {
            if (!cambioRutaAfectaKanban({
              eventType: payload.eventType,
              newRow: payload.new as EventoRuta,
              oldRow: payload.old as EventoRuta,
            })) return;
            pingDebounced.ping();
          },
        );

        channel!.subscribe((status: string) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.warn('[panel] Realtime rutas:', status);
          }
        });
      })();
    }

    return () => {
      cancelado = true;
      pingDebounced.cancel();
      clearInterval(pollKanban);
      clearInterval(pollSnap);
      document.removeEventListener('visibilitychange', onVisible);
      bc?.close();
      if (sb && channel) void sb.removeChannel(channel);
    };
  }, [activo]);
}

type FilaRuta = { id?: string; estado?: unknown; subestado?: unknown };
type EventoRuta = { estado?: unknown; subestado?: unknown } | null;
