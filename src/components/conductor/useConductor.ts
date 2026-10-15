'use client';

/**
 * Todo el estado de la app del conductor. Traducción directa de la clase
 * `Component` del prototipo: un único objeto de estado con un `patch` que imita
 * `setState`, más los efectos (relojes, cámara, cola de sincronización) en refs.
 *
 * Las reglas duras viven repartidas entre este archivo (las que mueven estado:
 * R1, R4, R6, R7, R8, R10) y `selectors.ts` (las que solo derivan: R2, R5, R9).
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  COLA_MAX_MB,
  COLA_MAX_N,
  ENT_SLOTS,
  FOTO_LADO,
  FOTO_Q,
  ITEMS,
  MI_ID,
  MI_NOMBRE,
  MOTIVOS,
  RUEDAS,
  SLOTS,
  SOL_META,
  TELEFONO_MECANU,
  TESTIGOS,
  TURNO,
  VIDEO_MAX_S,
  EN_RUTA,
  recordarConductorId,
  conductorIdRecordado,
  reemplazarTurnoYPool,
  type EntradaTurno,
} from './constants';
import * as D from './data';
import { aplicarSnapshotConductor } from './vivo';
import {
  accionDe,
  activoId,
  buildJob,
  fechaLbl,
  itvDias,
  nivelDeTestigo,
  solapa,
} from './selectors';
import { motivoOfertaItv, nivelHallazgoItv } from '@/lib/mecanu/oferta-itv';
import { escribirCola, leerCola, vaciarCola } from '@/lib/mecanu/cola-offline';
import {
  combustiblePct,
  tipoSolicitudApi,
  urlEvidenciaPublicable,
} from '@/lib/mecanu/etiqueta-en-ruta';
import {
  postConCola,
  flushColaPendiente,
  escrituraOk,
  type ResultadoEscritura,
} from './escritura-api';
import { efectoAvanceSubestadoEnRuta, efectoEntregaRuta } from '@/lib/mecanu/transicion-en-ruta';
import {
  debeEnviarPing,
  geolocationDisponible,
  GPS_WATCH_OPTIONS,
  mensajeErrorGps,
  puntoDesdePosition,
  type GpsPunto,
} from '@/lib/mecanu/gps-conductor';
import type {
  AppState,
  Foto,
  Job,
  ModoCamara,
  Nivel,
  EntState,
  Politica,
  Sello,
  SheetState,
  Subestado,
  TipoLog,
  TipoSolicitud,
  Vista,
  WizState,
} from './types';

/**
 * Semillas del mock: un check-in con testigo rojo ya sellado (y su solicitud de
 * "no rodante" esperando al taller) y una inspección hecha en un traslado
 * cerrado. Se calculan una sola vez, al crear el estado.
 * TODO API: esto llegaría de GET /api/conductores/{id}/turno.
 */
function semillas(): Pick<AppState, 'jobOv' | 'checkins' | 'inspecciones' | 'solicitudes'> {
  const selloSemilla = (tid: string): Sello => {
    const ts = new Date();
    return {
      ts,
      tid,
      conductorId: MI_ID,
      gps: null,
      linea: D.fmtHora(ts) + ' · GPS no disponible · ' + tid + ' · ' + MI_NOMBRE,
    };
  };
  const jobOv: AppState['jobOv'] = {};
  const checkins: AppState['checkins'] = {};
  const inspecciones: AppState['inspecciones'] = {};
  const solicitudes: AppState['solicitudes'] = {};
  TURNO.forEach((e) => {
    jobOv[e.tid] = { sub: e.sub, done: e.sub === 'completado' };
    if (e.testigoRojo) {
      const t = D.tramo(e.tid);
      const r = t ? D.ruta(t.rutaId) : null;
      const v = r ? D.vehiculo(r.vehiculoId) : null;
      const fotos: Record<string, Foto> = {};
      SLOTS.forEach((sl) => {
        fotos[sl.key] = {
          src: D.foto('cond-' + e.tid + '-checkin-' + sl.key),
          bytes: 430 * 1024,
          sello: selloSemilla(e.tid),
        };
      });
      checkins[e.tid] = {
        fotos,
        extras: [],
        video: { url: null, simulado: true, seg: 22, bytes: 24 * 1024 * 1024, sello: selloSemilla(e.tid) },
        km: String(v?.km ?? 0),
        combustible: '1/2',
        testigos: [e.testigoRojo],
        sellado: true,
        ts: new Date(Date.now() - 5400000),
      };
      solicitudes[e.tid] = {
        tipo: 'no_rodante',
        motivo: 'Testigo rojo encendido',
        ts: new Date(Date.now() - 5300000),
        estado: 'pendiente',
      };
    }
    if (e.inspeccionHecha) {
      inspecciones[e.tid] = {
        items: { plumillas: 3, focos: 1, bateria: 2, carroceria: 2, cristales: 1, limpieza: 1 },
        ruedas: { di: 3, dd: 3, ti: 2, td: 2 },
        itv: '2026-11',
        itvSinDato: false,
        nota: 'El cliente comenta que las plumillas chirrían desde el invierno.',
        voz: null,
        sellado: true,
        ts: new Date(Date.now() - 7200000),
      };
    }
  });
  return { jobOv, checkins, inspecciones, solicitudes };
}

const estadoInicial = (sinConexion: boolean): AppState => ({
  ...ESTADO_INICIAL,
  ...semillas(),
  ...(sinConexion ? { online: false, sync: 'offline' as const } : {}),
});

const ESTADO_INICIAL: AppState = {
  vista: 'lista',
  sel: null,
  online: true,
  sync: 'synced',
  queue: 0,
  bytes: 0,
  jobOv: {},
  tomados: [],
  incidentes: {},
  solicitudes: {},
  logsLocal: {},
  checkins: {},
  inspecciones: {},
  kmVehiculo: {},
  wiz: null,
  ent: null,
  cam: null,
  sheet: null,
  dialogo: null,
  atrasoNota: '',
  verHechos: false,
  verSinFecha: false,
  verHistorial: false,
  callAbierto: null,
  dragDx: null,
  toast: null,
  flash: null,
  voz: null,
  gps: null,
  gpsPermiso: 'pendiente',
  gpsError: null,
};

export type OpcionesConductor = {
  politica?: Politica;
  redExterna?: boolean;
  sinConexion?: boolean;
  /** Si viene en la URL, el snapshot hidrata ese conductor en lugar de d1. */
  conductorId?: string;
  /** Tras hidratar, abre este traslado en detalle. */
  trasladoId?: string;
};

type Arrastre = {
  tid: string;
  tel: string | null;
  x0: number;
  y0: number;
  anchoCard: number;
  base: number;
  activo: boolean;
  disparado: boolean;
};

/** Deslizar revela; tocar llama (o pasar del 30 % del ancho, que marca solo). */
export const CALL_W = 78;
const CALL_UMBRAL = 0.55;

const CONSTRAINTS_VIDEO = {
  facingMode: { ideal: 'environment' as const },
  width: { ideal: FOTO_LADO },
};

/** Safari de Mac no graba WebM; Chrome sí. Sin mimeType el constructor a veces tira. */
function mimeGrabacionVideo(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }
  return ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'].find((t) =>
    MediaRecorder.isTypeSupported(t),
  );
}

/** El "estoy montado" no cambia nunca, así que no hay a qué suscribirse. */
const suscribirNada = () => () => {};

export function useConductor(opts: OpcionesConductor = {}) {
  const { politica = 'horario', redExterna = false, sinConexion = false } = opts;
  const trasladoInicial = opts.trasladoId?.trim() || '';
  const conductorId =
    opts.conductorId?.trim()
    || (typeof window !== 'undefined' ? conductorIdRecordado() : null)
    || MI_ID;

  useEffect(() => {
    if (conductorId) recordarConductorId(conductorId);
  }, [conductorId]);

  const [s, setS] = useState<AppState>(() => estadoInicial(sinConexion));

  /**
   * El render depende de la hora actual (ventanas, riesgo, "atrasado"), así que
   * el servidor no puede pintarlo: hasta que el cliente monta se muestran
   * esqueletos. `useSyncExternalStore` da ese "ya estoy en el cliente" sin
   * ensuciar el estado ni provocar un desajuste de hidratación.
   */
  const montado = useSyncExternalStore(suscribirNada, () => true, () => false);
  const [hidrandoSupabase, setHidrandoSupabase] = useState(false);
  const cargando = !montado || hidrandoSupabase;

  /* Espejo del estado para leerlo desde callbacks sin recrearlos en cada render. */
  const ref = useRef(s);
  useEffect(() => {
    ref.current = s;
  });

  const patch = useCallback((p: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => {
    setS((prev) => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) }));
  }, []);

  useEffect(() => {
    if (!montado) return;
    if (process.env.NEXT_PUBLIC_MECANU_USE_SUPABASE !== '1') return;
    let cancelado = false;
    setHidrandoSupabase(true);
    (async () => {
      try {
        const res = await fetch(`/api/v1/conductor/snapshot?conductorId=${encodeURIComponent(conductorId)}`);
        if (!res.ok) throw new Error(`snapshot ${res.status}`);
        const raw = await res.json();
        if (cancelado) return;
        const revive = <T,>(v: T): T => {
          if (v == null || typeof v !== 'object') return v;
          if (Array.isArray(v)) return v.map((x) => revive(x)) as T;
          const out: Record<string, unknown> = {};
          for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
            if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
              const d = new Date(val);
              out[k] = Number.isNaN(d.getTime()) ? val : d;
            } else if (val && typeof val === 'object') out[k] = revive(val);
            else out[k] = val;
          }
          return out as T;
        };
        aplicarSnapshotConductor({
          tramos: revive(raw.tramos ?? []),
          rutas: revive(raw.rutas ?? []),
          vehiculos: revive(raw.vehiculos ?? []),
          paradas: revive(raw.paradas ?? []),
          clientesPorVehiculo: revive(raw.clientesPorVehiculo ?? {}),
        });
        const turno = (raw.turno ?? []) as EntradaTurno[];
        const pool = (raw.pool ?? []) as EntradaTurno[];
        reemplazarTurnoYPool(turno, pool);
        const jobOv: AppState['jobOv'] = {};
        TURNO.forEach((e) => {
          jobOv[e.tid] = { sub: e.sub, done: e.sub === 'completado' };
        });
        const abrir = trasladoInicial && TURNO.some((e) => e.tid === trasladoInicial);
        patch({
          jobOv,
          checkins: {},
          inspecciones: {},
          solicitudes: {},
          ...(abrir ? { vista: 'detalle' as const, sel: trasladoInicial } : {}),
        });
      } catch (e) {
        console.warn('[conductor] hidratar Supabase falló, sigo con mock', e);
      } finally {
        if (!cancelado) setHidrandoSupabase(false);
      }
    })();
    return () => { cancelado = true; };
  }, [montado, patch, conductorId, trasladoInicial]);

  const timers = useRef<{ toast?: number; flash?: number; sync?: number; rec?: number; voz?: number }>({});
  const media = useRef<{
    stream: MediaStream | null;
    video: HTMLVideoElement | null;
    rec: MediaRecorder | null;
    chunks: Blob[];
    vozRec: MediaRecorder | null;
    vozChunks: Blob[];
    vozStream: MediaStream | null;
  }>({ stream: null, video: null, rec: null, chunks: [], vozRec: null, vozChunks: [], vozStream: null });

  /* --------- reloj de la barra de estado --------- */

  const [ahora, setAhora] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setAhora(Date.now()), 20000);
    return () => window.clearInterval(id);
  }, []);
  const d = new Date(ahora);
  const clock = montado
    ? String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
    : '';

  useEffect(() => {
    const t = timers.current;
    const m = media.current;
    return () => {
      Object.values(t).forEach((id) => {
        if (id) window.clearTimeout(id);
      });
      if (t.rec) window.clearInterval(t.rec);
      if (t.voz) window.clearInterval(t.voz);
      m.stream?.getTracks().forEach((tr) => tr.stop());
      m.vozStream?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  /* --------- feedback --------- */

  const toast = useCallback(
    (texto: string, deshacer?: () => void) => {
      window.clearTimeout(timers.current.toast);
      patch({ toast: { texto, deshacer: deshacer ?? null } });
      timers.current.toast = window.setTimeout(
        () => patch({ toast: null }),
        deshacer ? 5000 : 2800,
      );
    },
    [patch],
  );

  const marcarCola = useCallback((n: number) => {
    if (!ref.current.online) {
      patch({ queue: n, sync: 'offline' });
      return;
    }
    patch({ queue: n, sync: 'synced' });
  }, [patch]);

  const ackTaller = useCallback(
    (
      r: ResultadoEscritura,
      falloCola = 'Sin red o el servidor falló. Queda en cola; reintenta.',
    ) => {
      if (r.tipo === 'ok') {
        toast('El taller ya lo ve');
        return;
      }
      if (r.tipo === 'error') {
        toast(r.mensaje || 'El taller rechazó el cambio. No queda en cola.');
        return;
      }
      toast(falloCola);
    },
    [toast],
  );

  const flash = useCallback(
    (tid: string) => {
      window.clearTimeout(timers.current.flash);
      patch({ flash: tid });
      timers.current.flash = window.setTimeout(() => patch({ flash: null }), 2600);
    },
    [patch],
  );

  /* --------- R10 · offline-first ---------
     Nada se pierde y nada bloquea: si no hay red, la acción se aplica en local
     y engorda la cola; al reconectar se envía sola. */

  const sincronizado = useCallback(() => {
    escribirCola(vaciarCola(), typeof window === 'undefined' ? null : window.localStorage);
    setS((prev) => {
      const logsLocal: AppState['logsLocal'] = {};
      Object.keys(prev.logsLocal).forEach((k) => {
        logsLocal[k] = (prev.logsLocal[k] ?? []).map((l) => ({ ...l, cola: false }));
      });
      return { ...prev, sync: 'synced', queue: 0, bytes: 0, logsLocal };
    });
    toast('Todo sincronizado con el taller');
  }, [toast]);

  const toggleOnline = useCallback(() => {
    const st = ref.current;
    if (st.online) {
      patch({ online: false, sync: 'offline' });
      return;
    }
    patch({ online: true, sync: st.queue > 0 ? 'syncing' : 'synced' });
    if (st.queue > 0) {
      void flushColaPendiente().then((quedan) => {
        if (quedan === 0) sincronizado();
        else patch({ queue: quedan, sync: 'synced' });
      });
    }
  }, [patch, sincronizado]);

  /** Solo marca bytes locales (fotos/vídeo). No mete basura en la cola. */
  const encolar = useCallback(
    (bytes = 0) => {
      if (ref.current.online || !bytes) return;
      patch((prev) => ({ bytes: prev.bytes + bytes, sync: 'offline' }));
    },
    [patch],
  );

  const reintentarCola = useCallback(() => {
    if (!ref.current.online) {
      toast('Estás en «Simular sin conexión». Pulsa Reconectar abajo y luego reintenta.');
      return;
    }
    if (ref.current.queue === 0) {
      toast('No hay nada pendiente de enviar');
      return;
    }
    patch({ sync: 'syncing' });
    void flushColaPendiente().then((quedan) => {
      if (quedan === 0) {
        sincronizado();
        return;
      }
      patch({ queue: quedan, sync: 'synced' });
      toast(`${quedan} cambio(s) siguen sin llegar. Prueba otra vez.`);
    });
  }, [patch, sincronizado, toast]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const items = leerCola(window.localStorage);
      if (!items.length) {
        patch({
          queue: 0,
          sync: ref.current.online ? 'synced' : 'offline',
        });
        return;
      }
      if (!ref.current.online) {
        patch({ queue: items.length, sync: 'offline' });
        return;
      }
      /* Con red y cola residual: reenvía sin fingir offline. */
      patch({ queue: items.length, sync: 'syncing' });
      void flushColaPendiente().then((quedan) => {
        if (quedan === 0) {
          patch({ queue: 0, sync: 'synced' });
          return;
        }
        patch({ queue: quedan, sync: 'synced' });
      });
    }, 0);
    return () => window.clearTimeout(t);
  }, [patch]);

  useEffect(() => {
    const onOnline = () => {
      if (ref.current.queue > 0) {
        patch({ online: true, sync: 'syncing' });
        void flushColaPendiente().then((quedan) => {
          if (quedan === 0) sincronizado();
          else patch({ queue: quedan, sync: 'synced' });
        });
      } else {
        patch({ online: true, sync: 'synced' });
      }
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [patch, sincronizado]);

  const log = useCallback(
    (tid: string, tipo: TipoLog, texto: string) => {
      const entrada = { ts: new Date(), tipo, texto, cola: !ref.current.online };
      patch((prev) => ({
        logsLocal: { ...prev.logsLocal, [tid]: (prev.logsLocal[tid] ?? []).concat([entrada]) },
      }));
    },
    [patch],
  );

  /* --------- sello inmutable --------- */

  const sello = useCallback((tid: string): Sello => {
    const g = ref.current.gps;
    const ts = new Date();
    return {
      ts,
      tid,
      conductorId,
      gps: g ? g.lat.toFixed(5) + ', ' + g.lon.toFixed(5) : null,
      linea:
        D.fmtHora(ts) +
        ' · ' +
        (g ? g.lat.toFixed(4) + ',' + g.lon.toFixed(4) : 'GPS no disponible') +
        ' · ' +
        tid +
        ' · ' +
        MI_NOMBRE,
    };
  }, [conductorId]);

  const ultimoPingRef = useRef<GpsPunto | null>(null);
  const ultimaUbicacionAppRef = useRef<GpsPunto | null>(null);
  const watchIdRef = useRef<number | null>(null);

  /**
   * GPS es telemetría: gana el último punto. Nunca va a la cola offline
   * (un ping cada 20 s la hinchaba a decenas de «cambios» inútiles).
   */
  const enviarGpsPing = useCallback(
    async (tid: string, punto: GpsPunto) => {
      if (!ref.current.online) return;
      const key = `gps-${tid}-${punto.ts}`;
      const body = {
        lat: punto.lat,
        lng: punto.lng,
        accuracy: punto.accuracy,
        heading: punto.heading,
        speed: punto.speed,
        ts: punto.ts,
      };
      try {
        const res = await fetch(`/api/v1/traslados/${encodeURIComponent(tid)}/gps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': key,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) return;
        ultimoPingRef.current = punto;
      } catch {
        /* Sin cola: el siguiente ping lo intenta de nuevo. */
      }
    },
    [],
  );

  const enviarSubestado = useCallback(
    async (tid: string, a: Subestado, triggerSource: 'conductor' | 'manual' = 'conductor') => {
      if (!EN_RUTA.includes(a)) {
        return {
          tipo: 'error',
          mensaje: 'Subestado no válido para EN RUTA.',
        } satisfies ResultadoEscritura;
      }
      const j = buildJob(tid, ref.current);
      const efecto = efectoAvanceSubestadoEnRuta(a);
      const panelPatch =
        j && efecto
          ? [{ id: j.rutaId, estado: efecto.ruta.estado, subestado: efecto.ruta.subestado }]
          : undefined;
      return postConCola({
        url: `/api/v1/traslados/${encodeURIComponent(tid)}/subestado`,
        prefijoClave: `subestado-${tid}-${a}`,
        body: { a, triggerSource },
        online: ref.current.online,
        tipoCola: 'subestado',
        onCola: marcarCola,
        panelPatch,
      });
    },
    [marcarCola],
  );

  const enviarEntrega = useCallback(
    async (tid: string, fotos: Record<string, Foto>, firmaCliente: string | null) => {
      const payload = {
        fotos: Object.entries(fotos).flatMap(([slot, f]) => {
          const url = urlEvidenciaPublicable(f.src);
          return url ? [{ slot, url }] : [];
        }),
        firmaCliente,
      };
      const j = buildJob(tid, ref.current);
      const efecto = j ? efectoEntregaRuta(j.rolTipo) : null;
      const panelPatch =
        j && efecto
          ? [{ id: j.rutaId, estado: efecto.estado, subestado: efecto.subestado }]
          : undefined;
      return postConCola({
        url: `/api/v1/traslados/${encodeURIComponent(tid)}/entrega`,
        prefijoClave: `entrega-${tid}`,
        body: payload,
        online: ref.current.online,
        tipoCola: 'entrega',
        onCola: marcarCola,
        panelPatch,
      });
    },
    [marcarCola],
  );

  const aplicarFixGps = useCallback(
    (pos: GeolocationPosition) => {
      const punto = puntoDesdePosition(pos);
      patch({
        gps: { lat: punto.lat, lon: punto.lng },
        gpsPermiso: 'concedido',
        gpsError: null,
      });
      /* Última vista para el mapa del taller (aunque no haya viaje activo). */
      if (
        conductorId
        && debeEnviarPing(ultimaUbicacionAppRef.current, punto, Date.parse(punto.ts), {
          throttleMs: 60_000,
          throttleM: 80,
        })
      ) {
        ultimaUbicacionAppRef.current = punto;
        void fetch(`/api/v1/conductores/${encodeURIComponent(conductorId)}/ubicacion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': `ubicacion-${conductorId}-${punto.ts}`,
          },
          body: JSON.stringify({
            lat: punto.lat,
            lng: punto.lng,
            accuracy: punto.accuracy,
            ts: punto.ts,
          }),
        }).catch(() => { /* best-effort */ });
      }
      const tid = activoId(ref.current);
      if (!tid) return;
      const j = buildJob(tid, ref.current);
      if (!j || j.congelado || j.sub === 'completado') return;
      const enRuta = ['en_camino_origen', 'en_origen', 'en_transito', 'en_destino'].includes(j.sub);
      if (!enRuta) return;
      if (!debeEnviarPing(ultimoPingRef.current, punto)) return;
      void enviarGpsPing(tid, punto);
    },
    [conductorId, enviarGpsPing, patch],
  );

  const pedirGps = useCallback(() => {
    if (!geolocationDisponible()) {
      patch({
        gps: null,
        gpsPermiso: 'no_soportado',
        gpsError: mensajeErrorGps(null),
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => aplicarFixGps(p),
      (err) => {
        /* Si ya hubo un fix, no tumbamos la sesión por un timeout puntual. */
        if (ref.current.gps) return;
        if (err.code !== 1 && ref.current.gpsPermiso === 'concedido') {
          patch({ gpsError: mensajeErrorGps(err.code) });
          return;
        }
        patch({
          gps: null,
          gpsPermiso: err.code === 1 ? 'denegado' : 'pendiente',
          gpsError: mensajeErrorGps(err.code),
        });
      },
      GPS_WATCH_OPTIONS,
    );
  }, [aplicarFixGps, patch]);

  const activarGps = useCallback(() => {
    patch({ gpsPermiso: 'pendiente', gpsError: null });
    pedirGps();
  }, [patch, pedirGps]);

  /* Gate + watch continuo mientras la app está montada. */
  useEffect(() => {
    if (!geolocationDisponible()) {
      patch({
        gpsPermiso: 'no_soportado',
        gpsError: mensajeErrorGps(null),
      });
      return;
    }
    /* Si el navegador ya tiene el permiso, no fingimos que hay que «activarlo». */
    if (typeof navigator.permissions?.query === 'function') {
      void navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          if (status.state === 'granted' && !ref.current.gps) {
            patch({ gpsPermiso: 'concedido', gpsError: null });
          }
        })
        .catch(() => {});
    }
    pedirGps();
    const id = navigator.geolocation.watchPosition(
      (p) => aplicarFixGps(p),
      (err) => {
        if (ref.current.gps) return;
        if (ref.current.gpsPermiso === 'concedido') return;
        patch({
          gpsPermiso: err.code === 1 ? 'denegado' : 'pendiente',
          gpsError: mensajeErrorGps(err.code),
        });
      },
      GPS_WATCH_OPTIONS,
    );
    watchIdRef.current = id;
    return () => {
      navigator.geolocation.clearWatch(id);
      watchIdRef.current = null;
    };
  }, [aplicarFixGps, patch, pedirGps]);

  /* --------- navegación --------- */

  const job = useCallback((tid: string | null): Job | null => (tid ? buildJob(tid, ref.current) : null), []);

  const irA = useCallback((vista: Vista) => patch({ vista, sheet: null }), [patch]);
  const abrir = useCallback(
    (tid: string) => patch({ vista: 'detalle', sel: tid, verHistorial: false }),
    [patch],
  );
  const volver = useCallback(() => patch({ vista: 'lista', sel: null }), [patch]);

  const llamar = useCallback(
    (tel: string | null) => {
      if (!tel) {
        toast('Este traslado no tiene teléfono de contacto');
        return;
      }
      window.open('tel:' + String(tel).replace(/\s/g, ''), '_self');
    },
    [toast],
  );

  const llamarMecanu = useCallback(() => llamar(TELEFONO_MECANU), [llamar]);

  const navegar = useCallback((j: Job) => {
    const destino = j.sub === 'agendado' || j.sub === 'en_camino_origen' ? j.oDireccion : j.dDireccion;
    window.open(
      'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' +
        encodeURIComponent(destino),
      '_blank',
      'noopener',
    );
  }, []);

  /* --------- deslizar para revelar "Llamar" --------- */

  const arrastre = useRef<Arrastre | null>(null);

  const callDown = useCallback((tid: string, tel: string | null, e: ReactPointerEvent) => {
    const card = (e.currentTarget as HTMLElement).closest('[data-tid]');
    arrastre.current = {
      tid,
      tel,
      x0: e.clientX,
      y0: e.clientY,
      anchoCard: card ? card.getBoundingClientRect().width : 350,
      base: ref.current.callAbierto === tid ? -CALL_W : 0,
      activo: false,
      disparado: false,
    };
  }, []);

  const callMove = useCallback(
    (tid: string, e: ReactPointerEvent) => {
      const d = arrastre.current;
      if (!d || d.tid !== tid || d.disparado) return;
      const dx = e.clientX - d.x0;
      const dy = e.clientY - d.y0;
      if (!d.activo) {
        if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 8) return;
        d.activo = true;
      }
      const v = Math.max(-CALL_W, Math.min(0, d.base + dx));
      patch({ dragDx: { tid, v } });
      /* Solo abre el cajón. Llamar es el botón, no el desliz. */
      if (-dx >= d.anchoCard * CALL_UMBRAL) {
        d.disparado = true;
        patch({ callAbierto: tid, dragDx: null });
      }
    },
    [patch],
  );

  const callUp = useCallback(
    (tid: string) => {
      const d = arrastre.current;
      arrastre.current = null;
      if (!d || d.disparado) return;
      const dd = ref.current.dragDx;
      if (!d.activo || !dd || dd.tid !== tid) {
        patch({ dragDx: null });
        return;
      }
      patch({ callAbierto: dd.v < -CALL_W / 2 ? tid : null, dragDx: null });
    },
    [patch],
  );

  const cerrarCajonLlamar = useCallback(() => patch({ callAbierto: null }), [patch]);

  /* --------- R8 · tomar de la bolsa --------- */

  const tomarYa = useCallback(
    (tid: string) => {
      patch((prev) => ({ tomados: prev.tomados.concat([tid]), dialogo: null }));
      log(tid, 'cambio_estado', 'Traslado tomado de la bolsa por el conductor');
      flash(tid);
      void postConCola({
        url: `/api/v1/traslados/${encodeURIComponent(tid)}/asignar`,
        prefijoClave: `asignar-${tid}`,
        body: { conductorId },
        online: ref.current.online,
        tipoCola: 'asignar',
        onCola: marcarCola,
      }).then((r) => ackTaller(r, 'Tomado en el móvil. Queda en cola para el taller.'));
    },
    [ackTaller, conductorId, flash, log, marcarCola, patch],
  );

  const tomar = useCallback(
    (tid: string) => {
      const j = buildJob(tid, ref.current);
      if (!j) return;
      const choque = solapa(j.win, ref.current);
      if (choque) {
        /* R8: solaparse es legítimo, pero nunca por accidente. */
        patch({
          dialogo: {
            tipo: 'solape',
            tid,
            titulo: 'Solapa con otro traslado',
            texto:
              choque.matricula +
              ' · ' +
              choque.veh +
              ' ya ocupa ' +
              fechaLbl(choque.win.fecha).toLowerCase() +
              ' de ' +
              choque.win.inicio +
              ' a ' +
              choque.win.fin +
              '. Si tomas este, tendrás que pedir reagendar uno de los dos.',
            boton: 'Tomar igualmente',
          },
        });
        return;
      }
      tomarYa(tid);
    },
    [patch, tomarYa],
  );

  /* --------- wizard y entrega: parches --------- */

  const w = useCallback(
    (p: Partial<WizState>) => patch((prev) => ({ wiz: prev.wiz ? { ...prev.wiz, ...p } : null })),
    [patch],
  );
  const e = useCallback(
    (p: Partial<EntState>) => patch((prev) => ({ ent: prev.ent ? { ...prev.ent, ...p } : null })),
    [patch],
  );

  /* --------- cámara ---------
     Captura SOLO desde la cámara de la app: nunca <input type=file>, nunca galería. */

  const pararStream = useCallback(() => {
    media.current.stream?.getTracks().forEach((t) => t.stop());
    media.current.stream = null;
  }, []);

  const arrancarStream = useCallback(() => {
    const cam = ref.current.cam;
    if (!cam) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      patch((prev) => ({ cam: prev.cam ? { ...prev.cam, error: 'nodisp' } : null }));
      return;
    }
    const pedir = (audio: boolean) =>
      navigator.mediaDevices.getUserMedia({ video: CONSTRAINTS_VIDEO, audio });
    /* El vídeo pide micrófono. Si el usuario lo niega (o no hay mic en el
       portátil), seguimos con imagen sola: el check-in no puede quedarse ciego. */
    const intento = cam.modo === 'video' ? pedir(true).catch(() => pedir(false)) : pedir(false);
    intento
      .then((stream) => {
        media.current.stream = stream;
        const v = media.current.video;
        if (v) {
          v.srcObject = stream;
          void v.play().catch(() => {});
        }
        patch((prev) => ({ cam: prev.cam ? { ...prev.cam, listo: true } : null }));
      })
      .catch((err: unknown) => {
        const nombre = err instanceof Error ? err.name : '';
        patch((prev) => ({
          cam: prev.cam ? { ...prev.cam, error: nombre === 'NotAllowedError' ? 'permiso' : 'nodisp' } : null,
        }));
      });
  }, [patch]);

  const abrirCam = useCallback(
    (modo: ModoCamara, slot: string | null) => {
      patch({ cam: { modo, slot, listo: false, error: null, grabando: false, seg: 0 } });
    },
    [patch],
  );

  /* El stream arranca cuando la vista de cámara ya está montada. */
  useEffect(() => {
    if (s.cam && !s.cam.error && !s.cam.listo && !media.current.stream) arrancarStream();
  }, [s.cam, arrancarStream]);

  const cerrarCam = useCallback(() => {
    window.clearInterval(timers.current.rec);
    pararStream();
    patch({ cam: null });
  }, [pararStream, patch]);

  const reintentarCam = useCallback(() => {
    pararStream();
    patch((prev) => ({ cam: prev.cam ? { ...prev.cam, error: null, listo: false } : null }));
  }, [pararStream, patch]);

  const videoRef = useCallback((el: HTMLVideoElement | null) => {
    media.current.video = el;
    if (!el) return;
    el.autoplay = true;
    el.muted = true;
    el.setAttribute('playsinline', 'true');
    if (media.current.stream) {
      el.srcObject = media.current.stream;
      void el.play().catch(() => {});
    }
  }, []);

  const guardarFoto = useCallback(
    (foto: Foto) => {
      const cam = ref.current.cam;
      if (!cam) return;
      if (cam.modo === 'ent') {
        e({ fotos: { ...(ref.current.ent?.fotos ?? {}), [cam.slot ?? '']: foto } });
      } else if (cam.modo === 'extra') {
        w({ extras: (ref.current.wiz?.extras ?? []).concat([foto]) });
      } else {
        w({ fotos: { ...(ref.current.wiz?.fotos ?? {}), [cam.slot ?? '']: foto } });
      }
      encolar(foto.bytes);
      cerrarCam();
    },
    [cerrarCam, e, encolar, w],
  );

  const tidEnCurso = useCallback(
    () => ref.current.wiz?.tid ?? ref.current.ent?.tid ?? '',
    [],
  );

  const dispararFoto = useCallback(() => {
    const v = media.current.video;
    if (!ref.current.cam || !v || !v.videoWidth) {
      toast('La cámara aún no está lista');
      return;
    }
    const k = Math.min(1, FOTO_LADO / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(v.videoWidth * k);
    c.height = Math.round(v.videoHeight * k);
    c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height);
    const src = c.toDataURL('image/jpeg', FOTO_Q);
    guardarFoto({ src, bytes: Math.round(src.length * 0.75), sello: sello(tidEnCurso()) });
  }, [guardarFoto, sello, tidEnCurso, toast]);

  /**
   * Salida del prototipo cuando el dispositivo no tiene cámara: permite recorrer
   * el check-in en escritorio. En producción no existe — la foto solo puede
   * venir del sensor.
   */
  const simularFoto = useCallback(() => {
    const cam = ref.current.cam;
    if (!cam) return;
    const tid = tidEnCurso();
    guardarFoto({
      src: D.foto('cond-' + tid + '-' + cam.modo + '-' + (cam.slot ?? 'extra') + '-' + Date.now()),
      bytes: 430 * 1024,
      sello: sello(tid),
    });
  }, [guardarFoto, sello, tidEnCurso]);

  const pararVideo = useCallback(() => {
    window.clearInterval(timers.current.rec);
    if (media.current.rec && media.current.rec.state !== 'inactive') media.current.rec.stop();
  }, []);

  const grabarVideo = useCallback(() => {
    if (ref.current.cam?.grabando) {
      pararVideo();
      return;
    }
    if (!media.current.stream || typeof MediaRecorder === 'undefined') {
      toast('Este dispositivo no puede grabar vídeo');
      return;
    }
    try {
      const mime = mimeGrabacionVideo();
      const mr = mime
        ? new MediaRecorder(media.current.stream, { mimeType: mime })
        : new MediaRecorder(media.current.stream);
      media.current.rec = mr;
      media.current.chunks = [];
      mr.ondataavailable = (ev) => {
        if (ev.data?.size) media.current.chunks.push(ev.data);
      };
      mr.onstop = () => {
        const blob = new Blob(media.current.chunks, { type: mime ?? 'video/webm' });
        const seg = ref.current.cam?.seg ?? 0;
        w({
          video: {
            url: URL.createObjectURL(blob),
            seg,
            bytes: blob.size,
            sello: sello(ref.current.wiz?.tid ?? ''),
          },
        });
        encolar(blob.size);
        cerrarCam();
      };
      mr.start();
      patch((prev) => ({ cam: prev.cam ? { ...prev.cam, grabando: true, seg: 0 } : null }));
      timers.current.rec = window.setInterval(() => {
        setS((prev) => {
          if (!prev.cam) return prev;
          const n = prev.cam.seg + 1;
          if (n >= VIDEO_MAX_S) window.setTimeout(pararVideo, 0);
          return { ...prev, cam: { ...prev.cam, seg: n } };
        });
      }, 1000);
    } catch {
      toast('Este dispositivo no puede grabar vídeo');
    }
  }, [cerrarCam, encolar, pararVideo, patch, sello, toast, w]);

  /** Vídeo simulado, misma salida de prototipo que `simularFoto`. */
  const simularVideo = useCallback(() => {
    const tid = ref.current.wiz?.tid ?? '';
    w({ video: { url: null, simulado: true, seg: 18, bytes: 18 * 1024 * 1024, sello: sello(tid) } });
    encolar(18 * 1024 * 1024);
    cerrarCam();
  }, [cerrarCam, encolar, sello, w]);

  /* --------- nota de voz --------- */

  const vozParar = useCallback(() => {
    window.clearInterval(timers.current.voz);
    if (media.current.vozRec && media.current.vozRec.state !== 'inactive') media.current.vozRec.stop();
  }, []);

  const vozGrabar = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof MediaRecorder === 'undefined') {
      toast('Este dispositivo no puede grabar audio');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        media.current.vozStream = stream;
        const mr = new MediaRecorder(stream);
        media.current.vozRec = mr;
        media.current.vozChunks = [];
        mr.ondataavailable = (ev) => {
          if (ev.data?.size) media.current.vozChunks.push(ev.data);
        };
        mr.onstop = () => {
          const blob = new Blob(media.current.vozChunks, { type: 'audio/webm' });
          const seg = ref.current.voz?.seg ?? 0;
          stream.getTracks().forEach((t) => t.stop());
          media.current.vozStream = null;
          w({ voz: { url: URL.createObjectURL(blob), seg, bytes: blob.size } });
          encolar(blob.size);
          patch({ voz: null });
        };
        mr.start();
        patch({ voz: { seg: 0 } });
        timers.current.voz = window.setInterval(
          () => setS((prev) => (prev.voz ? { ...prev, voz: { seg: prev.voz.seg + 1 } } : prev)),
          1000,
        );
      })
      .catch(() => toast('Sin permiso de micrófono'));
  }, [encolar, patch, toast, w]);

  const vozPlay = useCallback(() => {
    const v = ref.current.wiz?.voz;
    if (v?.url) void new Audio(v.url).play().catch(() => {});
  }, []);

  const vozBorrar = useCallback(() => w({ voz: null }), [w]);

  /* --------- R4 · el check-in no se cierra sin evidencia --------- */

  const wizListo1 = useCallback((wiz: WizState | null): boolean => {
    if (!wiz) return false;
    return (
      SLOTS.every((sl) => wiz.fotos[sl.key]) &&
      !!wiz.video &&
      !!wiz.km &&
      Number(wiz.km) > 0 &&
      !!wiz.combustible
    );
  }, []);

  const wizListo2 = useCallback((wiz: WizState | null): boolean => {
    if (!wiz) return false;
    return ITEMS.every((i) => wiz.items[i.key]) && RUEDAS.every((r) => wiz.ruedas[r.key]);
  }, []);

  const setSub = useCallback(
    (tid: string, ns: Subestado, extra?: { done?: boolean }) => {
      patch((prev) => ({
        jobOv: { ...prev.jobOv, [tid]: { ...prev.jobOv[tid], sub: ns, ...(extra ?? {}) } },
      }));
    },
    [patch],
  );

  const sellarCheckin = useCallback(() => {
    const wiz = ref.current.wiz;
    if (!wiz) return;
    const j = buildJob(wiz.tid, ref.current);
    if (!j) return;
    const rojos = wiz.testigos.filter((k) => nivelDeTestigo(k) === 'rojo');
    const ambar = wiz.testigos.filter((k) => nivelDeTestigo(k) === 'ambar');
    let hallazgos = ambar.length;
    ITEMS.forEach((i) => {
      if ((wiz.items[i.key] ?? 0) >= 2) hallazgos++;
    });
    RUEDAS.forEach((r) => {
      if ((wiz.ruedas[r.key] ?? 0) >= 2) hallazgos++;
    });
    const dias = itvDias(wiz.itv);
    const motivoItv = motivoOfertaItv({ itvSinDato: wiz.itvSinDato, dias: wiz.itvSinDato ? null : dias });
    if (motivoItv) hallazgos++;
    const fotos = [
      ...Object.entries(wiz.fotos).flatMap(([slot, f]) => {
        const url = urlEvidenciaPublicable(f.src) ?? (f.src.startsWith('data:') ? f.src : null);
        return url ? [{ slot, url }] : [];
      }),
      ...wiz.extras.flatMap((f, i) => {
        const url = urlEvidenciaPublicable(f.src) ?? (f.src.startsWith('data:') ? f.src : null);
        return url ? [{ slot: `extra-${i}`, url }] : [];
      }),
    ];
    if (fotos.length < 4) {
      toast('Las fotos no se pueden enviar (formato local). Vuelve a capturarlas o usa Simular foto.');
      return;
    }
    const testigos: Record<string, boolean> = {};
    for (const t of TESTIGOS) testigos[t.key] = wiz.testigos.includes(t.key);
    const bodyCheckin = {
      km: Number(wiz.km) || 0,
      combustible: wiz.combustible ?? 'Sin dato',
      combustiblePct: combustiblePct(wiz.combustible),
      limpieza: 'Sin dato',
      fotos,
      videoUrl: urlEvidenciaPublicable(wiz.video?.url),
      testigos,
      itemsInspeccion: wiz.items,
      ruedas: wiz.ruedas,
      nota: wiz.nota.trim() ? wiz.nota : null,
      notaVozUrl: urlEvidenciaPublicable(wiz.voz?.url),
      firmaConductor: null,
    };
    const tid = wiz.tid;
    const vehiculoId = j.vehiculoId;
    const postHallazgo = (body: Record<string, unknown>, prefijo: string) => {
      void postConCola({
        url: '/api/v1/campanas/hallazgos',
        prefijoClave: `${prefijo}-${tid}`,
        body: { rutaId: j.rutaId, trasladoId: tid, ...body },
        online: ref.current.online,
        tipoCola: 'hallazgo',
        onCola: marcarCola,
      });
    };
    if (motivoItv) {
      postHallazgo(
        {
          testigo: 'itv',
          nivel: nivelHallazgoItv(motivoItv),
          detalle: motivoItv,
          dias: wiz.itvSinDato ? null : dias,
        },
        'itv',
      );
    }
    for (const k of ambar) {
      postHallazgo({ testigo: k, nivel: 3 }, `hallazgo-${k}`);
    }
    for (const i of ITEMS) {
      const n = wiz.items[i.key] ?? 0;
      if (n >= 2) postHallazgo({ testigo: `item:${i.key}`, nivel: n }, `hallazgo-item-${i.key}`);
    }
    for (const rueda of RUEDAS) {
      const n = wiz.ruedas[rueda.key] ?? 0;
      if (n >= 2) postHallazgo({ testigo: `rueda:${rueda.key}`, nivel: n }, `hallazgo-rueda-${rueda.key}`);
    }
    void (async () => {
      const escrituras = [
        postConCola({
          url: `/api/v1/traslados/${encodeURIComponent(tid)}/checkin`,
          prefijoClave: `checkin-${tid}`,
          body: bodyCheckin,
          online: ref.current.online,
          tipoCola: 'checkin',
          onCola: marcarCola,
        }),
      ];
      if (vehiculoId) {
        escrituras.push(
          postConCola({
            url: `/api/v1/vehiculos/${encodeURIComponent(vehiculoId)}`,
            metodo: 'PATCH',
            prefijoClave: `km-${vehiculoId}`,
            body: { km: Number(wiz.km) || 0 },
            online: ref.current.online,
            tipoCola: 'km',
            onCola: marcarCola,
          }),
        );
      }
      const rs = await Promise.all(escrituras);
      if (!rojos.length) {
        const sub = await enviarSubestado(tid, 'en_transito');
        const todosOk = rs.every(escrituraOk) && escrituraOk(sub);
        if (todosOk) ackTaller({ tipo: 'ok' });
        else {
          const err = [...rs, sub].find((x) => x.tipo === 'error');
          if (err && err.tipo === 'error') ackTaller(err);
          else if (rs.some((x) => x.tipo === 'cola') || sub.tipo === 'cola') {
            ackTaller({ tipo: 'cola' }, 'Check-in en el móvil. Queda en cola; reintenta.');
          } else ackTaller({ tipo: 'cola' });
        }
      } else if (rs.some((x) => x.tipo === 'cola')) {
        toast('Check-in sellado. El taller lo recibirá al reenviar la cola.');
      } else if (rs.some((x) => x.tipo === 'error')) {
        const err = rs.find((x) => x.tipo === 'error');
        if (err) ackTaller(err);
      }
    })();
    patch((prev) => ({
      checkins: {
        ...prev.checkins,
        [wiz.tid]: {
          fotos: wiz.fotos,
          extras: wiz.extras,
          video: wiz.video,
          km: wiz.km,
          combustible: wiz.combustible,
          testigos: wiz.testigos,
          sellado: true,
          ts: new Date(),
        },
      },
      inspecciones: {
        ...prev.inspecciones,
        [wiz.tid]: {
          items: wiz.items,
          ruedas: wiz.ruedas,
          itv: wiz.itv,
          itvSinDato: wiz.itvSinDato,
          nota: wiz.nota,
          voz: wiz.voz,
          sellado: true,
          ts: new Date(),
        },
      },
      kmVehiculo: j.vehiculoId
        ? { ...prev.kmVehiculo, [j.vehiculoId]: Number(wiz.km) }
        : prev.kmVehiculo,
      wiz: null,
    }));
    log(
      wiz.tid,
      'nota',
      'Check-in sellado · ' +
        (SLOTS.length + wiz.extras.length) +
        ' fotos, vídeo, ' +
        Number(wiz.km).toLocaleString('es-ES') +
        ' km, ' +
        wiz.combustible,
    );
    if (hallazgos) {
      log(
        wiz.tid,
        'nota',
        hallazgos + (hallazgos === 1 ? ' hallazgo enviado' : ' hallazgos enviados') + ' a Campañas',
      );
    }
    if (rojos.length) {
      log(
        wiz.tid,
        'incidencia',
        'Testigo rojo al recoger: ' +
          rojos.map((k) => TESTIGOS.find((x) => x.key === k)?.label ?? k).join(', '),
      );
      patch({ sheet: { tid: wiz.tid, tipo: 'no_rodante' } });
      toast('Check-in sellado · testigo rojo: no arranques');
    } else {
      setSub(wiz.tid, 'en_transito');
      flash(wiz.tid);
    }
  }, [ackTaller, enviarSubestado, flash, log, marcarCola, patch, setSub, toast]);

  const wizSiguiente = useCallback(() => {
    const wiz = ref.current.wiz;
    if (!wiz) return;
    const j = buildJob(wiz.tid, ref.current);
    if (!j) return;
    if (wiz.pagina === 1) {
      if (!wizListo1(wiz)) return;
      if (Number(wiz.km) < j.kmVehiculo && !wiz.kmConfirmado) {
        patch({
          dialogo: {
            tipo: 'km',
            titulo: 'El cuentakilómetros ha bajado',
            texto:
              'La ficha tiene ' +
              j.kmVehiculo.toLocaleString('es-ES') +
              ' km y tú has puesto ' +
              Number(wiz.km).toLocaleString('es-ES') +
              '. Vuelve a mirar el cuadro antes de seguir.',
            boton: 'Lo he comprobado',
          },
        });
        return;
      }
      w({ pagina: 2 });
      return;
    }
    if (!wizListo2(wiz)) return;
    sellarCheckin();
  }, [patch, sellarCheckin, w, wizListo1, wizListo2]);

  const wizSalir = useCallback(() => {
    const wiz = ref.current.wiz;
    if (!wiz) return;
    if (wiz.pagina === 2) {
      w({ pagina: 1 });
      return;
    }
    if (Object.keys(wiz.fotos).length || wiz.video || wiz.testigos.length) {
      patch({
        dialogo: {
          tipo: 'salirWiz',
          titulo: 'Salir del check-in',
          texto: 'Se pierden las fotos y el vídeo que todavía no has sellado. Tendrás que repetirlos.',
          boton: 'Salir igualmente',
        },
      });
      return;
    }
    patch({ wiz: null });
  }, [patch, w]);

  /* --------- entrega y devolución --------- */

  const entSalir = useCallback(() => {
    const ent = ref.current.ent;
    if (!ent) return;
    if (Object.keys(ent.fotos).length || ent.firma) {
      patch({
        dialogo: {
          tipo: 'salirEnt',
          titulo: 'Salir de la entrega',
          texto: 'Se pierden las fotos y la firma que todavía no has sellado.',
          boton: 'Salir igualmente',
        },
      });
      return;
    }
    patch({ ent: null });
  }, [patch]);

  const entCerrar = useCallback(() => {
    const ent = ref.current.ent;
    if (!ent) return;
    const nf = Object.keys(ent.fotos).length;
    const pideFirma = ent.tipo === 'devolucion';
    /* R4: sin las fotos (y sin la firma en devolución) esto no se cierra. */
    if (nf < ENT_SLOTS.length || (pideFirma && !ent.firma)) return;
    void enviarEntrega(ent.tid, ent.fotos, pideFirma ? 'firmado' : null).then((r) =>
      ackTaller(
        r,
        pideFirma
          ? 'Entrega firmada en el móvil. Queda en cola.'
          : 'Entregado en el móvil. Queda en cola.',
      ),
    );
    patch((prev) => ({
      ent: null,
      jobOv: { ...prev.jobOv, [ent.tid]: { ...prev.jobOv[ent.tid], sub: 'completado', done: true } },
    }));
    log(
      ent.tid,
      'cambio_estado',
      pideFirma ? 'Vehículo devuelto y firmado por el cliente' : 'Vehículo entregado en el taller',
    );
    flash(ent.tid);
  }, [ackTaller, enviarEntrega, flash, log, patch]);

  const setFirma = useCallback((firma: boolean) => e({ firma }), [e]);

  /* --------- R1 + R7 · avance de estado --------- */

  const avanzar = useCallback(
    (tidArg?: string) => {
      const st = ref.current;
      const tid = tidArg ?? st.sel;
      if (!tid) return;
      const j = buildJob(tid, st);
      if (!j || j.congelado) return;
      if (j.bloqueoRojo) {
        toast('Testigo rojo encendido: no puedes conducir este coche');
        return;
      }
      /* R1: con un viaje ya en ruta, el segundo no arranca. Sin alerta: el botón
         está deshabilitado y una línea neutra lo explica en la ficha. */
      const activo = activoId(st);
      if (j.sub === 'agendado' && activo && activo !== tid) return;
      /* R2: sin ventana comprometida no se inicia. */
      if (j.sub === 'agendado' && !j.win) return;
      const a = accionDe(j);
      if (!a) return;
      if (a.kind === 'sub') {
        setSub(tid, a.to as Subestado);
        flash(tid);
        const msg =
          (
            {
              en_camino_origen: 'Viaje iniciado',
              en_origen: 'Estás en el punto de recogida',
              en_destino: 'Estás en el destino',
            } as Record<string, string>
          )[a.to] ?? 'Estado actualizado';
        log(tid, 'cambio_estado', msg);
        void enviarSubestado(tid, a.to as Subestado).then((r) => ackTaller(r));
      } else if (a.kind === 'wiz') {
        pedirGps();
        patch({
          wiz: {
            tid,
            pagina: 1,
            fotos: {},
            extras: [],
            video: null,
            km: String(j.kmVehiculo),
            kmConfirmado: false,
            combustible: null,
            testigos: [],
            items: {},
            abierto: null,
            ruedas: {},
            ruedaSel: null,
            itv: '',
            itvSinDato: false,
            nota: '',
            voz: null,
          },
        });
      } else {
        pedirGps();
        patch({ ent: { tid, tipo: a.to as 'entrega' | 'devolucion', fotos: {}, firma: false } });
      }
    },
    [ackTaller, enviarSubestado, flash, log, patch, pedirGps, setSub, toast],
  );

  const deshacer = useCallback(() => {
    ref.current.toast?.deshacer?.();
  }, []);

  /**
   * Mock de desarrollo: empuja el subestado un peldaño sin pasar por las
   * evidencias. Existe para recorrer el flujo en una demo; se salta R4 a
   * propósito y no tiene equivalente en producción.
   */
  const simularAvance = useCallback(
    (tid: string) => {
      const j = buildJob(tid, ref.current);
      if (!j || j.hecho) return;
      const orden: Subestado[] = [
        'agendado',
        'en_camino_origen',
        'en_origen',
        'en_transito',
        'en_destino',
      ];
      const i = orden.indexOf(j.sub);
      if (i < 0) return;
      const siguiente = i === orden.length - 1 ? 'completado' : orden[i + 1]!;
      setSub(tid, siguiente, siguiente === 'completado' ? { done: true } : undefined);
      if (EN_RUTA.includes(siguiente)) void enviarSubestado(tid, siguiente, 'manual');
      if (siguiente === 'completado') {
        const pix =
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        const s = sello(tid);
        void enviarEntrega(
          tid,
          {
            estado: { src: pix, bytes: 32, sello: s },
            entorno: { src: pix, bytes: 32, sello: s },
          },
          null,
        );
      }
      log(tid, 'cambio_estado', 'Simulado: ' + siguiente.replace(/_/g, ' '));
      flash(tid);
      toast('Simulado · ' + siguiente.replace(/_/g, ' '));
    },
    [enviarEntrega, enviarSubestado, flash, log, sello, setSub, toast],
  );

  /* --------- R6 · solicitudes al taller --------- */

  const abrirSol = useCallback(
    (tid: string, tipo: SheetState['tipo']) => patch({ sheet: { tid, tipo }, atrasoNota: '' }),
    [patch],
  );

  const abrirMenuSol = useCallback((tid: string) => patch({ sheet: { tid, tipo: 'menu' } }), [patch]);
  const cerrarSheet = useCallback(() => patch({ sheet: null }), [patch]);
  const setAtrasoNota = useCallback((v: string) => patch({ atrasoNota: v }), [patch]);

  const confirmarLlegada = useCallback(
    (tid: string) => {
      const nota = (ref.current.atrasoNota || '').trim();
      log(tid, 'nota', 'Confirma que llega a la hora' + (nota ? ' · "' + nota + '"' : ''));
      flash(tid);
      patch({ sheet: null, atrasoNota: '' });
      void postConCola({
        url: `/api/v1/traslados/${encodeURIComponent(tid)}/confirmaciones`,
        prefijoClave: `confirmacion-${tid}`,
        body: { tipo: 'llegada_a_tiempo', nota: nota || null, origen: 'conductor' },
        online: ref.current.online,
        tipoCola: 'confirmacion',
        onCola: marcarCola,
      }).then((r) => ackTaller(r));
    },
    [ackTaller, flash, log, marcarCola, patch],
  );

  const enviarSol = useCallback(
    (tipo: TipoSolicitud, motivoId: string) => {
      const sheet = ref.current.sheet;
      if (!sheet) return;
      const tid = sheet.tid;
      const j = buildJob(tid, ref.current);
      const m = (MOTIVOS[tipo] ?? []).find((x) => x.id === motivoId);
      patch((prev) => ({
        solicitudes: {
          ...prev.solicitudes,
          [tid]: {
            tipo,
            motivo: m?.label ?? 'Sin motivo',
            ts: new Date(),
            estado: 'pendiente',
          },
        },
        sheet: null,
      }));
      log(tid, 'nota', SOL_META[tipo].titulo + ' · ' + (m?.label ?? 'Sin motivo'));
      flash(tid);
      void postConCola({
        url: `/api/v1/traslados/${encodeURIComponent(tid)}/solicitudes`,
        prefijoClave: `solicitud-${tid}-${tipo}`,
        body: {
          rutaId: j?.rutaId ?? '',
          conductorId,
          tipo: tipoSolicitudApi(tipo),
          motivo: m?.label ?? 'Sin motivo',
          nota: null,
          ventanaActual: j?.win ? `${j.win.inicio}–${j.win.fin}` : null,
          conflictoCon: null,
          evidenciaIds: [],
        },
        online: ref.current.online,
        tipoCola: 'solicitud',
        onCola: marcarCola,
      }).then((r) => ackTaller(r));
    },
    [ackTaller, conductorId, flash, log, marcarCola, patch],
  );

  /** Mock: en producción la respuesta del taller llega por push. */
  const simularTaller = useCallback(() => {
    const st = ref.current;
    const tid = Object.keys(st.solicitudes).find((k) => st.solicitudes[k]?.estado === 'pendiente');
    if (!tid) return;
    const sol = st.solicitudes[tid]!;
    patch((prev) => ({
      solicitudes: { ...prev.solicitudes, [tid]: { ...sol, estado: 'resuelta' } },
      ...(sol.tipo === 'no_rodante' && prev.checkins[tid]
        ? {
            checkins: {
              ...prev.checkins,
              [tid]: {
                ...prev.checkins[tid]!,
                testigos: (prev.checkins[tid]!.testigos ?? []).filter(
                  (k) => nivelDeTestigo(k) !== 'rojo',
                ),
                rojoResuelto: true,
              },
            },
          }
        : {}),
    }));
    log(
      tid,
      'cambio_estado',
      sol.tipo === 'no_rodante'
        ? 'El taller revisó el testigo: el coche puede circular'
        : 'El taller respondió a tu solicitud',
    );
    flash(tid);
    toast('El taller ha respondido');
  }, [flash, log, patch, toast]);

  /* --------- incidencias --------- */

  const reportar = useCallback(
    (tid: string) => {
      patch((prev) => ({
        incidentes: { ...prev.incidentes, [tid]: { ts: new Date(), tipo: 'siniestro' } },
      }));
      log(tid, 'incidencia', 'Siniestro reportado por el conductor · viaje congelado');
      void postConCola({
        url: '/api/v1/incidencias',
        prefijoClave: `incidencia-${tid}`,
        body: { trasladoId: tid, tipo: 'siniestro', detalle: null },
        online: ref.current.online,
        tipoCola: 'incidencia',
        onCola: marcarCola,
      }).then((r) => ackTaller(r, 'Siniestro anotado. Queda en cola.'));
    },
    [ackTaller, log, marcarCola, patch],
  );

  /* --------- diálogos --------- */

  const dlgCancelar = useCallback(() => patch({ dialogo: null }), [patch]);

  const dlgConfirmar = useCallback(() => {
    const d = ref.current.dialogo;
    if (!d) return;
    if (d.tipo === 'solape' && d.tid) tomarYa(d.tid);
    else if (d.tipo === 'km') {
      patch({ dialogo: null });
      w({ kmConfirmado: true, pagina: 2 });
    } else if (d.tipo === 'salirWiz') patch({ dialogo: null, wiz: null });
    else if (d.tipo === 'salirEnt') patch({ dialogo: null, ent: null });
  }, [patch, tomarYa, w]);

  /* --------- plegables --------- */

  const toggleHechos = useCallback(() => patch((p) => ({ verHechos: !p.verHechos })), [patch]);
  const toggleSinFecha = useCallback(() => patch((p) => ({ verSinFecha: !p.verSinFecha })), [patch]);
  const toggleHistorial = useCallback(() => patch((p) => ({ verHistorial: !p.verHistorial })), [patch]);

  /* --------- avisos derivados --------- */

  const avisoCola = useMemo(() => {
    const mb = s.bytes / 1048576;
    if (s.online || (s.queue <= COLA_MAX_N && mb <= COLA_MAX_MB)) return null;
    return (
      'Cola grande: ' + s.queue + ' elementos · ' + Math.round(mb) + ' MB. Busca cobertura para enviarla.'
    );
  }, [s.bytes, s.online, s.queue]);

  const haySolPendiente = useMemo(
    () => Object.values(s.solicitudes).some((x) => x.estado === 'pendiente'),
    [s.solicitudes],
  );

  return {
    s,
    cargando,
    clock,
    politica,
    redExterna,
    avisoCola,
    haySolPendiente,
    conductorId,
    listo1: wizListo1(s.wiz),
    listo2: wizListo2(s.wiz),
    acciones: {
      abrir,
      volver,
      irA,
      llamar,
      llamarMecanu,
      navegar,
      job,
      toggleOnline,
      reintentarCola,
      toggleHechos,
      toggleSinFecha,
      toggleHistorial,
      callDown,
      callMove,
      callUp,
      cerrarCajonLlamar,
      tomar,
      avanzar,
      simularAvance,
      deshacer,
      abrirSol,
      abrirMenuSol,
      cerrarSheet,
      setAtrasoNota,
      confirmarLlegada,
      enviarSol,
      simularTaller,
      reportar,
      dlgCancelar,
      dlgConfirmar,
      activarGps,
      abrirCam,
      cerrarCam,
      reintentarCam,
      videoRef,
      dispararFoto,
      simularFoto,
      grabarVideo,
      simularVideo,
      pararVideo,
      vozGrabar,
      vozParar,
      vozPlay,
      vozBorrar,
      w,
      wizSalir,
      wizSiguiente,
      entSalir,
      entCerrar,
      setFirma,
      setNivelItem: (key: string, n: Nivel) =>
        w({ items: { ...(ref.current.wiz?.items ?? {}), [key]: n }, abierto: null }),
      setNivelRueda: (key: string, n: Nivel) =>
        w({ ruedas: { ...(ref.current.wiz?.ruedas ?? {}), [key]: n }, ruedaSel: null }),
      toggleTestigo: (key: string) => {
        const actuales = ref.current.wiz?.testigos ?? [];
        w({ testigos: actuales.includes(key) ? actuales.filter((k) => k !== key) : actuales.concat([key]) });
      },
    },
  };
}

export type Conductor = ReturnType<typeof useConductor>;
export type AccionesConductor = Conductor['acciones'];
