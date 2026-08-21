/**
 * Pipeline de tareas del taller (Tablero → Tareas, antes de Traslados).
 *
 * Objetivo: el operador cierra huecos (agendar, asignar, valorar, enviar,
 * crear ruta). No es un kanban de rutas. Las cards nacen de los deberes
 * derivados y mueren cuando el hueco deja de existir.
 *
 * Decisiones cerradas:
 * 1. Tres columnas: Pendiente · Hecho · Cancelado.
 * 2. Toda card nueva entra en Pendiente. La urgencia va en la card.
 * 3. La tarjeta NO avanza por arrastre. Solo pasa a Hecho cuando el hueco
 *    se cierra de verdad (agendar, asignar, valorar…). Abrirla no cambia
 *    de columna: el resalte «en curso» es la ficha abierta, no un estado.
 * 4. Excepción: un seguimiento al cliente (`recordar_oferta`) sí se puede
 *    archivar arrastrando a Hecho, porque espera respuesta ajena.
 * 5. Cancelado = no la hago. Se arrastra desde Pendiente. Se puede reabrir.
 *    No anula el traslado.
 * 6. Lo hecho se ve 24 h y luego sale. Si el hueco reaparece, vuelve a Pendiente.
 */

import type { ColumnaTareaPipeline, ViaCierreTarea } from './types';
import { URGENCIA_ORDEN, type DeberTaller, type TipoDeberTaller } from './deberes-taller';

export const HECHO_VENTANA_MS = 24 * 3600000;

export const COLUMNAS_TAREA: {
  id: ColumnaTareaPipeline;
  label: string;
  hint: string;
  kind: 'brand' | 'positive' | 'alert';
  empty: string;
}[] = [
  { id: 'pendiente', label: 'Pendiente', kind: 'brand', hint: '', empty: 'Nada por hacer.' },
  { id: 'hecho', label: 'Hecho', kind: 'positive', hint: '', empty: 'Aún no has cerrado ninguna.' },
  { id: 'cancelado', label: 'Cancelado', kind: 'alert', hint: '', empty: 'Ninguna cancelada.' },
];

export const TIPO_TAREA_META: Record<TipoDeberTaller, { corto: string; icono: string }> = {
  agendar: { corto: 'Agendar', icono: 'event' },
  asignar_conductor: { corto: 'Conductor', icono: 'person' },
  agendar_vuelta: { corto: 'Vuelta', icono: 'undo' },
  valorar_oferta: { corto: 'Valorar', icono: 'edit' },
  enviar_oferta: { corto: 'Enviar', icono: 'send' },
  crear_ruta: { corto: 'Ruta', icono: 'add_road' },
  recordar_oferta: { corto: 'Seguir', icono: 'schedule' },
  responder_oferta: { corto: 'Responder', icono: 'reply' },
};

export interface EstadoPipelineTareas {
  historico: Record<string, DeberTaller>;
  archivadas: Record<string, number>;
  canceladas: Record<string, number>;
  cierres: Record<string, { en: number; via: ViaCierreTarea }>;
}

export const PIPELINE_TAREAS_VACIO: EstadoPipelineTareas = {
  historico: {},
  archivadas: {},
  canceladas: {},
  cierres: {},
};

export interface TareaKanban {
  id: string;
  deber: DeberTaller;
  columna: ColumnaTareaPipeline;
  via?: ViaCierreTarea;
  cerradoEn?: Date;
  arrastrable: boolean;
}

export function columnaPorDefecto(): 'pendiente' {
  return 'pendiente';
}

export function puedeArrastrarTarea(columna: ColumnaTareaPipeline): boolean {
  return columna === 'pendiente';
}

export function puedeMoverTarea(opts: {
  tipo: TipoDeberTaller;
  desde: ColumnaTareaPipeline;
  hacia: ColumnaTareaPipeline;
}): { ok: true } | { ok: false; motivo: string } {
  if (opts.desde === opts.hacia) return { ok: true };
  if (opts.desde === 'hecho' || opts.desde === 'cancelado') {
    return {
      ok: false,
      motivo: 'Reábrela con el botón. No se arrastra desde aquí.',
    };
  }
  if (opts.hacia === 'hecho') {
    if (opts.tipo === 'recordar_oferta') return { ok: true };
    return {
      ok: false,
      motivo: 'Ábrela y cierra el hueco. La tarjeta solo avanza cuando la tarea está hecha.',
    };
  }
  if (opts.hacia === 'cancelado') return { ok: true };
  return {
    ok: false,
    motivo: 'Ese avance no está permitido.',
  };
}

function deberCambio(a: DeberTaller | undefined, b: DeberTaller): boolean {
  if (!a) return true;
  return a.titulo !== b.titulo || a.detalle !== b.detalle || a.urgencia !== b.urgencia || a.tipo !== b.tipo;
}

function mismosCierres(
  a: EstadoPipelineTareas['cierres'],
  b: EstadoPipelineTareas['cierres'],
): boolean {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => a[k]?.en === b[k]?.en && a[k]?.via === b[k]?.via);
}

function mismosNums(a: Record<string, number>, b: Record<string, number>): boolean {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => a[k] === b[k]);
}

function mismoHistorico(a: Record<string, DeberTaller>, b: Record<string, DeberTaller>): boolean {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => !deberCambio(a[k], b[k]));
}

export function reconciliarPipelineTareas(
  estado: EstadoPipelineTareas,
  derivados: DeberTaller[],
  ahora: Date,
): EstadoPipelineTareas {
  const derivadosIds = new Set(derivados.map((d) => d.id));
  const historico: Record<string, DeberTaller> = { ...estado.historico };
  for (const d of derivados) historico[d.id] = d;

  const cierres: EstadoPipelineTareas['cierres'] = { ...estado.cierres };
  const canceladas: Record<string, number> = { ...estado.canceladas };
  const ts = ahora.getTime();
  const corte = ts - HECHO_VENTANA_MS;

  for (const id of Object.keys(historico)) {
    if (!derivadosIds.has(id) && !cierres[id] && !estado.archivadas[id] && !canceladas[id]) {
      cierres[id] = { en: ts, via: 'accion' };
    }
    if (derivadosIds.has(id) && !estado.archivadas[id] && cierres[id]?.via === 'accion') {
      delete cierres[id];
    }
  }

  for (const id of Object.keys(cierres)) {
    if (cierres[id].en < corte) {
      delete cierres[id];
      if (!derivadosIds.has(id)) delete historico[id];
    }
  }

  for (const id of Object.keys(canceladas)) {
    if (!derivadosIds.has(id)) {
      delete canceladas[id];
      delete historico[id];
    }
  }

  if (
    mismoHistorico(historico, estado.historico)
    && mismosNums(estado.archivadas, estado.archivadas)
    && mismosNums(canceladas, estado.canceladas)
    && mismosCierres(cierres, estado.cierres)
  ) {
    return estado;
  }

  return { historico, archivadas: estado.archivadas, canceladas, cierres };
}

export function aplicarMovimientoTarea(
  estado: EstadoPipelineTareas,
  card: TareaKanban,
  hacia: ColumnaTareaPipeline,
  ahora: Date,
): { ok: true; estado: EstadoPipelineTareas } | { ok: false; motivo: string } {
  const check = puedeMoverTarea({ tipo: card.deber.tipo, desde: card.columna, hacia });
  if (!check.ok) return check;
  if (card.columna === hacia) return { ok: true, estado };

  if (hacia === 'hecho') {
    return {
      ok: true,
      estado: {
        ...estado,
        archivadas: { ...estado.archivadas, [card.id]: ahora.getTime() },
        cierres: { ...estado.cierres, [card.id]: { en: ahora.getTime(), via: 'archivada' } },
        canceladas: Object.fromEntries(Object.entries(estado.canceladas).filter(([k]) => k !== card.id)),
      },
    };
  }

  if (hacia === 'cancelado') {
    return {
      ok: true,
      estado: {
        ...estado,
        canceladas: { ...estado.canceladas, [card.id]: ahora.getTime() },
        archivadas: Object.fromEntries(Object.entries(estado.archivadas).filter(([k]) => k !== card.id)),
      },
    };
  }

  return { ok: false, motivo: 'Ese avance no está permitido.' };
}

export function reabrirTareaArchivada(
  estado: EstadoPipelineTareas,
  id: string,
): EstadoPipelineTareas {
  if (!estado.archivadas[id] && !estado.canceladas[id]) return estado;
  const archivadas = { ...estado.archivadas };
  delete archivadas[id];
  const canceladas = { ...estado.canceladas };
  delete canceladas[id];
  const cierres = { ...estado.cierres };
  if (cierres[id]?.via === 'archivada') delete cierres[id];
  return { ...estado, archivadas, canceladas, cierres };
}

export function proyectarPipelineTareas(
  estado: EstadoPipelineTareas,
  derivados: DeberTaller[],
): Record<ColumnaTareaPipeline, TareaKanban[]> {
  const out: Record<ColumnaTareaPipeline, TareaKanban[]> = {
    pendiente: [], hecho: [], cancelado: [],
  };
  const pendientesIds = new Set(
    derivados.filter((d) => !estado.archivadas[d.id] && !estado.canceladas[d.id]).map((d) => d.id),
  );

  for (const d of derivados) {
    if (estado.archivadas[d.id] || estado.canceladas[d.id]) continue;
    out.pendiente.push({
      id: d.id,
      deber: d,
      columna: 'pendiente',
      arrastrable: true,
    });
  }

  const idsHecho = new Set<string>();
  for (const [id, meta] of Object.entries(estado.cierres)) {
    if (pendientesIds.has(id)) continue;
    const deber = estado.historico[id] ?? derivados.find((d) => d.id === id);
    if (!deber) continue;
    idsHecho.add(id);
    out.hecho.push({
      id,
      deber,
      columna: 'hecho',
      via: meta.via,
      cerradoEn: new Date(meta.en),
      arrastrable: false,
    });
  }
  for (const [id, en] of Object.entries(estado.archivadas)) {
    if (idsHecho.has(id)) continue;
    const deber = estado.historico[id] ?? derivados.find((d) => d.id === id);
    if (!deber) continue;
    out.hecho.push({
      id,
      deber,
      columna: 'hecho',
      via: 'archivada',
      cerradoEn: new Date(en),
      arrastrable: false,
    });
  }
  for (const [id, en] of Object.entries(estado.canceladas)) {
    const deber = estado.historico[id] ?? derivados.find((d) => d.id === id);
    if (!deber) continue;
    out.cancelado.push({
      id,
      deber,
      columna: 'cancelado',
      via: 'cancelada',
      cerradoEn: new Date(en),
      arrastrable: false,
    });
  }

  const pesoTipo: Record<TipoDeberTaller, number> = {
    crear_ruta: 0,
    asignar_conductor: 1,
    agendar: 2,
    agendar_vuelta: 3,
    enviar_oferta: 4,
    valorar_oferta: 5,
    recordar_oferta: 6,
    responder_oferta: 0,
  };
  const pesoUrgencia = Object.fromEntries(URGENCIA_ORDEN.map((u, i) => [u, i])) as Record<string, number>;
  for (const col of COLUMNAS_TAREA) {
    out[col.id].sort((a, b) =>
      (pesoUrgencia[a.deber.urgencia] ?? 9) - (pesoUrgencia[b.deber.urgencia] ?? 9)
      || pesoTipo[a.deber.tipo] - pesoTipo[b.deber.tipo]
      || a.deber.titulo.localeCompare(b.deber.titulo, 'es'),
    );
  }
  return out;
}

export function contarPendientesPipeline(
  porColumna: Record<ColumnaTareaPipeline, TareaKanban[]>,
): number {
  return porColumna.pendiente.length;
}
