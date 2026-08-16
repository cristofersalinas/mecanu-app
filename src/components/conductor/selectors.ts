/**
 * Derivaciones puras sobre el estado. Aquí viven las reglas R1, R2, R5, R7 y R8:
 * son funciones sin React para poder razonarlas (y probarlas) por separado.
 */
import {
  EN_RUTA,
  MARGEN_MIN,
  POOL,
  SUB_META,
  TESTIGOS,
  TURNO,
  type EntradaTurno,
} from './constants';
import * as D from './data';
import type { AppState, Accion, Job, Subestado, Ventana } from './types';

/* --------- tiempo --------- */

/** Las ventanas del mock se anclan a la hora en curso para leerse igual siempre. */
export const ancla = (): Date => {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  return d;
};

const hh = (d: Date): string =>
  String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');

export const hhmm = (f: Date, texto: string): Date => {
  const p = String(texto).split(':').map(Number);
  return new Date(f.getFullYear(), f.getMonth(), f.getDate(), p[0] ?? 0, p[1] ?? 0, 0, 0);
};

export const fechaLbl = (f: Date | null): string => {
  if (!f) return '';
  const dd = new Date(f.getFullYear(), f.getMonth(), f.getDate());
  const h = new Date();
  h.setHours(0, 0, 0, 0);
  const diff = Math.round((dd.getTime() - h.getTime()) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff === -1) return 'Ayer';
  return dd
    .toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace('.', '');
};

/* --------- direcciones --------- */

export const dirCorta = (dir: string | null): string => {
  if (!dir) return 'Sin dirección';
  return (dir.split(',')[0] ?? dir).trim();
};

/** Red externa: se ve la calle, no el portal, hasta que el viaje empieza. */
export const dirVaga = (dir: string | null): string => dirCorta(dir).replace(/\s+\d+\S*$/, '');

/* --------- traslados del turno --------- */

export const misIds = (s: AppState): string[] =>
  TURNO.map((e) => e.tid)
    .concat(s.tomados)
    .filter((v, i, a) => a.indexOf(v) === i);

export const cfgDe = (tid: string): EntradaTurno | null =>
  TURNO.find((e) => e.tid === tid) ?? POOL.find((e) => e.tid === tid) ?? null;

export const subDe = (tid: string, s: AppState): Subestado => {
  const ov = s.jobOv[tid];
  if (ov?.sub) return ov.sub;
  const t = D.tramo(tid);
  if (!t) return 'agendado';
  if (t.estado === 'completado') return 'completado';
  if (t.estado === 'en_curso') return (t.subestado as Subestado) || 'en_camino_origen';
  return 'agendado';
};

export const hechoDe = (tid: string, s: AppState): boolean => {
  const ov = s.jobOv[tid];
  if (ov) return !!ov.done;
  return D.tramo(tid)?.estado === 'completado';
};

/** R1: como máximo un traslado EN RUTA por conductor, a la vez. */
export const activoId = (s: AppState): string | null =>
  misIds(s).find((tid) => !hechoDe(tid, s) && EN_RUTA.includes(subDe(tid, s))) ?? null;

/** R2: sin ventana comprometida no hay hueco en la jornada; el traslado existe aparte. */
export const winDe = (tid: string): Ventana | null => {
  const cfg = cfgDe(tid);
  if (cfg && cfg.off === null) return null;
  if (cfg?.off) {
    const a = ancla().getTime();
    const ini = new Date(a + cfg.off[0] * 60000);
    const fin = new Date(a + cfg.off[1] * 60000);
    return {
      fecha: new Date(ini.getFullYear(), ini.getMonth(), ini.getDate()),
      inicio: hh(ini),
      fin: hh(fin),
    };
  }
  return D.tramo(tid)?.ventana ?? null;
};

const rolLabel = (rol: string): string =>
  rol === 'vuelta' ? 'Devolución ↑' : rol === 'ida' ? 'Recogida ↓' : 'Movimiento →';

export const nivelDeTestigo = (key: string): 'rojo' | 'ambar' | null =>
  TESTIGOS.find((t) => t.key === key)?.nivel ?? null;

export const buildJob = (tid: string, s: AppState): Job | null => {
  const t = D.tramo(tid);
  if (!t) return null;
  const r = D.ruta(t.rutaId);
  if (!r) return null;
  const v = D.vehiculo(r.vehiculoId);
  const cls = D.clientesDeVehiculo(r.vehiculoId);
  const cl = cls.find((c) => c.principal) ?? cls[0] ?? null;
  const ps = D.paradasDeRuta(r.id);
  const o = ps.find((p) => p.id === t.paradaOrigenId) ?? ps[0] ?? null;
  const dst = ps.find((p) => p.id === t.paradaDestinoId) ?? ps[ps.length - 1] ?? null;
  const sub = subDe(tid, s);
  const hecho = hechoDe(tid, s);
  const meta = SUB_META[hecho ? 'completado' : sub];
  const cfg = cfgDe(tid);
  const seguro = cfg && cfg.seguro != null ? cfg.seguro : !!t.seguro;
  const chk = s.checkins[tid] ?? null;
  const testigosRojos = chk ? (chk.testigos ?? []).filter((k) => nivelDeTestigo(k) === 'rojo') : [];
  const yendoAlDestino = EN_RUTA.indexOf(sub) >= 2;

  return {
    tid,
    rutaId: r.id,
    vehiculoId: r.vehiculoId,
    rolTipo: t.rol,
    rol: rolLabel(t.rol),
    veh: v ? D.etiquetaVehiculo(v) : 'Sin ficha',
    matricula: v ? v.matricula : (r.matriculaLead ?? '—'),
    kmVehiculo:
      r.vehiculoId != null && s.kmVehiculo[r.vehiculoId] != null
        ? s.kmVehiculo[r.vehiculoId]!
        : (v?.km ?? 0),
    cliente: cl ? D.nombreCorto(cl.nombre) : 'Sin identificar',
    tel: cl ? cl.telefono : null,
    servicio: D.descripcionServicioDeRuta(r.id),
    oEtiqueta: o ? o.etiqueta : '—',
    dEtiqueta: dst ? dst.etiqueta : '—',
    oDireccion: o?.direccion ? o.direccion : 'Sin dirección registrada',
    dDireccion: dst?.direccion ? dst.direccion : 'Sin dirección registrada',
    destinoCliente: dst?.tipo === 'cliente',
    dirProxima: dirCorta(yendoAlDestino ? (dst?.direccion ?? null) : (o?.direccion ?? null)),
    sub,
    hecho,
    estado: meta.label,
    estadoKind: meta.kind,
    ribbon: meta.ribbon,
    win: winDe(tid),
    seguro,
    /* R9: la cobertura se comunica con icono, nunca icono + texto. */
    segIcon: seguro ? 'verified_user' : 'gpp_maybe',
    segColor: seguro ? '#1E7300' : '#A81823',
    segColorDark: seguro ? 'var(--mecanu-brand-primary-dark)' : '#FF8A93',
    segTitulo: seguro ? 'Traslado con cobertura' : 'Traslado sin cobertura',
    congelado: !!s.incidentes[tid],
    solicitud: s.solicitudes[tid] ?? null,
    checkin: chk,
    inspeccion: s.inspecciones[tid] ?? null,
    testigosRojos,
    bloqueoRojo: testigosRojos.length > 0,
    riesgo: null,
  };
};

type JobConVentana = Job & { win: Ventana };

const tieneVentana = (j: Job): j is JobConVentana => j.win !== null;

/**
 * Agenda ordenada + riesgo (R5): si B empieza antes de que A pueda cerrarse
 * de verdad (fin de A + margen de desplazamiento y evidencias), B va en riesgo.
 */
export const agenda = (s: AppState): JobConVentana[] => {
  const jobs = misIds(s)
    .map((tid) => buildJob(tid, s))
    .filter((j): j is Job => j !== null)
    .filter((j) => !j.hecho)
    .filter(tieneVentana)
    .sort(
      (a, b) =>
        hhmm(a.win.fecha, a.win.inicio).getTime() - hhmm(b.win.fecha, b.win.inicio).getTime(),
    );
  jobs.forEach((j, i) => {
    if (!i) return;
    const prev = jobs[i - 1]!;
    const finPrev = hhmm(prev.win.fecha, prev.win.fin).getTime() + MARGEN_MIN * 60000;
    if (hhmm(j.win.fecha, j.win.inicio).getTime() < finPrev) {
      j.riesgo = {
        con: prev.matricula + ' · ' + prev.veh,
        hasta: prev.win.fin,
        dia: fechaLbl(prev.win.fecha),
      };
    }
  });
  return jobs;
};

/** R8: tomar de la bolsa algo que pisa un traslado ya asignado exige confirmar. */
export const solapa = (win: Ventana | null, s: AppState): JobConVentana | null => {
  if (!win) return null;
  const ini = hhmm(win.fecha, win.inicio).getTime();
  const fin = hhmm(win.fecha, win.fin).getTime();
  return (
    agenda(s).find((j) => {
      const a = hhmm(j.win.fecha, j.win.inicio).getTime();
      const b = hhmm(j.win.fecha, j.win.fin).getTime();
      return ini < b && a < fin;
    }) ?? null
  );
};

/** Ventana de la card: tamaño constante, solo cambia el color. */
export const ventana = (job: Job): { texto: string; color: string } => {
  const gris = 'var(--mecanu-neutral-700)';
  const naranja = '#9C420B';
  if (!job.win) return { texto: 'Sin agendar', color: gris };
  const ini = hhmm(job.win.fecha, job.win.inicio);
  const fin = hhmm(job.win.fecha, job.win.fin);
  /* Al conductor solo se le da la hora de inicio: el rango de 1 h es interno. */
  const rango = job.win.inicio;
  const dia = fechaLbl(job.win.fecha);
  const ahora = new Date();
  if (job.hecho) return { texto: dia + ' · ' + rango, color: gris };
  /* "Atrasado" se dispara al pasar la HORA DE INICIO, no la de cierre. */
  if (ini < ahora && job.sub === 'agendado') {
    const min = Math.round((ahora.getTime() - ini.getTime()) / 60000);
    const cuanto = min < 1 ? '' : ' hace ' + (min < 60 ? min + ' min' : Math.floor(min / 60) + ' h');
    return { texto: 'Atrasado' + cuanto, color: '#A81823' };
  }
  if (job.riesgo) return { texto: 'Atrasado · ' + rango, color: naranja };
  if (ini <= ahora && ahora <= fin) {
    const q = Math.round((fin.getTime() - ahora.getTime()) / 60000);
    return { texto: 'Cierra en ' + q + ' min · ' + rango, color: naranja };
  }
  const faltan = Math.round((ini.getTime() - ahora.getTime()) / 60000);
  if (faltan > 0 && faltan < 120) {
    const h = Math.floor(faltan / 60);
    const m = faltan % 60;
    const t =
      faltan < 60 ? 'En ' + faltan + ' min' : m ? 'En ' + h + ' h ' + m + ' min' : 'En ' + h + ' h';
    return { texto: t + ' · ' + rango, color: naranja };
  }
  return { texto: dia + ' · ' + rango, color: gris };
};

/** R7: la única escalera de subestados, y solo la sube el conductor. */
export const accionDe = (job: Job): Accion | null => {
  switch (job.sub) {
    case 'agendado':
      return { label: 'Iniciar viaje', corta: 'Iniciar viaje', icon: 'navigation', kind: 'sub', to: 'en_camino_origen' };
    case 'en_camino_origen':
      return { label: 'He llegado a la recogida', corta: 'He llegado', icon: 'where_to_vote', kind: 'sub', to: 'en_origen' };
    case 'en_origen':
      /* R4: del origen no se sale sin evidencia sellada. */
      return { label: 'Hacer el check-in', corta: 'Check-in', icon: 'photo_camera', kind: 'wiz', to: 'checkin' };
    case 'en_transito':
      return { label: 'He llegado al destino', corta: 'He llegado', icon: 'where_to_vote', kind: 'sub', to: 'en_destino' };
    case 'en_destino':
      return job.destinoCliente
        ? { label: 'Entregar y firmar', corta: 'Entregar', icon: 'draw', kind: 'ent', to: 'devolucion' }
        : { label: 'Entregar en el taller', corta: 'Entregar', icon: 'garage', kind: 'ent', to: 'entrega' };
    default:
      return null;
  }
};

export const pasoTimeline = (job: Job): number => {
  if (job.hecho) return 4;
  const mapa: Record<Subestado, number> = {
    agendado: 0,
    en_camino_origen: 0,
    en_origen: 0,
    en_transito: 1,
    en_destino: 2,
    completado: 4,
  };
  return mapa[job.sub];
};

/** Bolsa del taller: lo que nadie ha tomado todavía. */
export const poolJobs = (s: AppState): Job[] => {
  const mios = misIds(s);
  return POOL.filter((e) => !mios.includes(e.tid))
    .map((e) => buildJob(e.tid, s))
    .filter((j): j is Job => j !== null);
};

export const itvDias = (itv: string): number | null => {
  if (!itv) return null;
  const p = String(itv).split('-');
  if (p.length < 2) return null;
  const fin = new Date(Number(p[0]), Number(p[1]), 0);
  return Math.round((fin.getTime() - Date.now()) / 86400000);
};

export const historialDe = (tid: string, s: AppState) => {
  const base = D.logsDeTramo(tid).map((l) => ({
    ts: l.ts,
    tipo: l.tipo,
    texto: l.payload?.texto ?? l.tipo,
    cola: false,
  }));
  return base
    .concat(s.logsLocal[tid] ?? [])
    .sort((x, y) => y.ts.getTime() - x.ts.getTime());
};
