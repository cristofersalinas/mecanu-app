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
} from './constants';
import * as D from './data';
import {
  accionDe,
  activoId,
  buildJob,
  fechaLbl,
  itvDias,
  nivelDeTestigo,
  siguienteVentanaLibre,
  solapa,
} from './selectors';
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
};

export type OpcionesConductor = {
  politica?: Politica;
  redExterna?: boolean;
  sinConexion?: boolean;
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
const CALL_UMBRAL = 0.3;

/** El "estoy montado" no cambia nunca, así que no hay a qué suscribirse. */
const suscribirNada = () => () => {};

export function useConductor(opts: OpcionesConductor = {}) {
  const { politica = 'horario', redExterna = false, sinConexion = false } = opts;

  const [s, setS] = useState<AppState>(() => estadoInicial(sinConexion));

  /**
   * El render depende de la hora actual (ventanas, riesgo, "atrasado"), así que
   * el servidor no puede pintarlo: hasta que el cliente monta se muestran
   * esqueletos. `useSyncExternalStore` da ese "ya estoy en el cliente" sin
   * ensuciar el estado ni provocar un desajuste de hidratación.
   */
  const montado = useSyncExternalStore(suscribirNada, () => true, () => false);
  const cargando = !montado;

  /* Espejo del estado para leerlo desde callbacks sin recrearlos en cada render. */
  const ref = useRef(s);
  useEffect(() => {
    ref.current = s;
  });

  const patch = useCallback((p: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => {
    setS((prev) => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) }));
  }, []);

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
    const q = st.queue;
    patch({ online: true, sync: q > 0 ? 'syncing' : 'synced' });
    if (q > 0) {
      window.clearTimeout(timers.current.sync);
      timers.current.sync = window.setTimeout(sincronizado, 1700);
    }
  }, [patch, sincronizado]);

  const encolar = useCallback(
    (bytes = 0) => {
      if (ref.current.online) return;
      patch((prev) => ({ queue: prev.queue + 1, bytes: prev.bytes + bytes, sync: 'offline' }));
    },
    [patch],
  );

  const sufijoCola = useCallback(() => (ref.current.online ? '' : ' · en cola'), []);

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
      conductorId: MI_ID,
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
  }, []);

  const pedirGps = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => patch({ gps: { lat: p.coords.latitude, lon: p.coords.longitude } }),
      () => patch({ gps: null }),
      { timeout: 4000 },
    );
  }, [patch]);

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
      if (-dx >= d.anchoCard * CALL_UMBRAL) {
        d.disparado = true;
        patch({ callAbierto: tid, dragDx: null });
        llamar(d.tel);
      }
    },
    [llamar, patch],
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
      // TODO API: POST /api/traslados/{tid}/asignar { conductorId }
      patch((prev) => ({ tomados: prev.tomados.concat([tid]), dialogo: null }));
      log(tid, 'cambio_estado', 'Traslado tomado de la bolsa por el conductor');
      encolar();
      flash(tid);
      toast('Traslado añadido a tu jornada' + sufijoCola());
    },
    [encolar, flash, log, patch, sufijoCola, toast],
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
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: FOTO_LADO } },
        audio: cam.modo === 'video',
      })
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
      const mr = new MediaRecorder(media.current.stream);
      media.current.rec = mr;
      media.current.chunks = [];
      mr.ondataavailable = (ev) => {
        if (ev.data?.size) media.current.chunks.push(ev.data);
      };
      mr.onstop = () => {
        const blob = new Blob(media.current.chunks, { type: 'video/webm' });
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
    if (dias != null && dias < 60) hallazgos++;
    /* TODO API: POST /api/traslados/{tid}/checkin (evidencia sellada, inmutable)
       TODO API: PATCH /api/vehiculos/{id} { km } — el km vive en el VEHÍCULO.
       TODO API: POST /api/campanas/hallazgos — ámbar, niveles 2-4 e ITV < 60 días. */
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
    encolar();
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
      toast('Check-in sellado · en tránsito' + sufijoCola());
    }
  }, [encolar, flash, log, patch, setSub, sufijoCola, toast]);

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
    // TODO API: POST /api/traslados/{tid}/entrega { fotos, firma } → completa el traslado
    patch((prev) => ({
      ent: null,
      jobOv: { ...prev.jobOv, [ent.tid]: { ...prev.jobOv[ent.tid], sub: 'completado', done: true } },
    }));
    log(
      ent.tid,
      'cambio_estado',
      pideFirma ? 'Vehículo devuelto y firmado por el cliente' : 'Vehículo entregado en el taller',
    );
    encolar();
    flash(ent.tid);
    toast('Traslado completado' + sufijoCola());
  }, [encolar, flash, log, patch, sufijoCola, toast]);

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
        // TODO API: POST /api/traslados/{tid}/subestado { a, triggerSource:'conductor' }
        const prev = j.sub;
        setSub(tid, a.to as Subestado);
        encolar();
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
        toast(msg + sufijoCola(), () => {
          setSub(tid, prev);
          patch({ toast: null });
        });
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
    [encolar, flash, log, patch, pedirGps, setSub, sufijoCola, toast],
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
      log(tid, 'cambio_estado', 'Simulado: ' + siguiente.replace(/_/g, ' '));
      flash(tid);
      toast('Simulado · ' + siguiente.replace(/_/g, ' '));
    },
    [flash, log, setSub, toast],
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
      // TODO API: POST /api/traslados/{tid}/confirmaciones { tipo:'llegada_a_tiempo', nota }
      log(tid, 'nota', 'Confirma que llega a la hora' + (nota ? ' · "' + nota + '"' : ''));
      encolar();
      flash(tid);
      patch({ sheet: null, atrasoNota: '' });
      toast('Confirmación enviada al taller' + sufijoCola());
    },
    [encolar, flash, log, patch, sufijoCola, toast],
  );

  const enviarSol = useCallback(
    (tipo: TipoSolicitud, motivoId: string) => {
      const sheet = ref.current.sheet;
      if (!sheet) return;
      const tid = sheet.tid;
      /* TODO API: POST /api/traslados/{tid}/solicitudes
         { tipo, trasladoId, rutaId, conductorId, motivo, ventanaActual, evidenciaIds, origen:'conductor' }
         R6: esto solo crea una petición. Ni cambia la fecha ni el estado. */
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
      encolar();
      flash(tid);
      toast('Solicitud enviada al taller' + sufijoCola());
    },
    [encolar, flash, log, patch, sufijoCola, toast],
  );

  /** Mock: en producción la respuesta del taller llega por push. */
  const simularTaller = useCallback(() => {
    const st = ref.current;
    const tid = Object.keys(st.solicitudes).find((k) => st.solicitudes[k]?.estado === 'pendiente');
    if (!tid) return;
    const j = buildJob(tid, st);
    if (!j) return;
    const sol = st.solicitudes[tid]!;
    let toastTxt = 'El taller ha respondido';
    let logTxt = 'El taller respondió a tu solicitud';

    patch((prev) => {
      const baseSol = { ...sol, estado: 'resuelta' as const, resolucion: 'El taller revisó tu solicitud.' };
      const next: Partial<AppState> = {
        solicitudes: { ...prev.solicitudes, [tid]: baseSol },
      };

      if (sol.tipo === 'reagenda') {
        const actual = j.win;
        const motivo = (MOTIVOS.reagenda.find((m) => m.label === sol.motivo)?.id ?? 'otro') as
          | 'solape'
          | 'retraso'
          | 'cliente_ausente'
          | 'otro';

        const candidata =
          actual == null
            ? null
            : motivo === 'cliente_ausente'
              ? siguienteVentanaLibre(actual, prev, tid, 24 * 60)
              : motivo === 'otro'
                ? null
                : siguienteVentanaLibre(actual, prev, tid, motivo === 'retraso' ? 120 : 90);

        if (candidata) {
          const dia = fechaLbl(candidata.fecha);
          const resolucion = `El taller te lo ha movido a ${dia.toLowerCase()} · ${candidata.inicio}-${candidata.fin}.`;
          next.jobOv = {
            ...prev.jobOv,
            [tid]: { ...prev.jobOv[tid], win: candidata },
          };
          next.solicitudes = {
            ...prev.solicitudes,
            [tid]: { ...baseSol, resolucion },
          };
          toastTxt = `El taller reagendó a ${dia} · ${candidata.inicio}`;
          logTxt = `El taller reagendó el servicio a ${dia.toLowerCase()} de ${candidata.inicio} a ${candidata.fin}`;
        } else {
          const resolucion = 'El taller lo ha reasignado a otro conductor para evitar solapes.';
          next.jobOv = {
            ...prev.jobOv,
            [tid]: { ...prev.jobOv[tid], oculto: true },
          };
          next.solicitudes = {
            ...prev.solicitudes,
            [tid]: { ...baseSol, resolucion },
          };
          next.vista = prev.sel === tid ? 'lista' : prev.vista;
          next.sel = prev.sel === tid ? null : prev.sel;
          next.sheet = prev.sheet?.tid === tid ? null : prev.sheet;
          toastTxt = 'El taller lo ha reasignado a otro conductor';
          logTxt = 'El taller reasignó el servicio a otro conductor para no crear un solape';
        }
      }

      if (sol.tipo === 'rechazo') {
        const resolucion = 'El taller lo ha retirado de tu jornada y lo revisará con otra asignación.';
        next.jobOv = {
          ...prev.jobOv,
          [tid]: { ...prev.jobOv[tid], oculto: true },
        };
        next.solicitudes = {
          ...prev.solicitudes,
          [tid]: { ...baseSol, resolucion },
        };
        next.vista = prev.sel === tid ? 'lista' : prev.vista;
        next.sel = prev.sel === tid ? null : prev.sel;
        next.sheet = prev.sheet?.tid === tid ? null : prev.sheet;
        toastTxt = 'El taller ha retirado este traslado de tu jornada';
        logTxt = 'El taller aceptó tu rechazo y retiró el traslado de tu jornada';
      }

      if (sol.tipo === 'fallido') {
        const resolucion = 'El taller confirmó el fallido y cierra este intento.';
        next.jobOv = {
          ...prev.jobOv,
          [tid]: { ...prev.jobOv[tid], done: true },
        };
        next.solicitudes = {
          ...prev.solicitudes,
          [tid]: { ...baseSol, resolucion },
        };
        toastTxt = 'El taller confirmó el fallido';
        logTxt = 'El taller confirmó el fallido en origen';
      }

      if (sol.tipo === 'no_rodante' && prev.checkins[tid]) {
        const resolucion = 'El taller revisó el aviso y libera el coche para circular.';
        next.checkins = {
          ...prev.checkins,
          [tid]: {
            ...prev.checkins[tid]!,
            testigos: (prev.checkins[tid]!.testigos ?? []).filter((k) => nivelDeTestigo(k) !== 'rojo'),
            rojoResuelto: true,
          },
        };
        next.solicitudes = {
          ...prev.solicitudes,
          [tid]: { ...baseSol, resolucion },
        };
        toastTxt = 'El taller liberó el coche para circular';
        logTxt = 'El taller revisó el testigo: el coche puede circular';
      }

      return next;
    });
    log(tid, 'cambio_estado', logTxt);
    flash(tid);
    toast(toastTxt);
  }, [flash, log, patch, toast]);

  /* --------- incidencias --------- */

  const reportar = useCallback(
    (tid: string) => {
      // TODO API: POST /api/traslados/{tid}/incidencias { tipo:'siniestro', origen:'conductor' }
      patch((prev) => ({
        incidentes: { ...prev.incidentes, [tid]: { ts: new Date(), tipo: 'siniestro' } },
      }));
      log(tid, 'incidencia', 'Siniestro reportado por el conductor · viaje congelado');
      encolar();
      toast('Siniestro reportado · Mecanu ya lo está viendo');
    },
    [encolar, log, patch, toast],
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
