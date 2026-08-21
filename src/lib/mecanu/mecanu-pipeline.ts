/* Mecanu — CONFIG DECLARATIVA DEL PIPELINE.
   Añadir o quitar un estado, un subestado, una columna del kanban, un tag o un estado de
   presupuesto = editar SOLO este archivo. Fuera de aquí no debe quedar ningún string de
   estado escrito a mano: todo se lee de estas tablas.

   El estado vive en la RUTA. El TRASLADO (tramo) tiene su propio estado de ejecución.

   Los tipos de este archivo son CONFIG, no entidades de datos: por eso viven aquí como
   interfaces TS planas y no como schemas Zod en `types.ts` (allí solo van los registros
   que en producción vendrían de la base de datos). Los enums de dominio sí se importan
   de `types.ts`, que sigue siendo la fuente única de verdad de las formas del modelo. */

import type {
  EstadoRuta, EstadoTramo, LogTipo, OrigenLinea, Parada, ParadaSubtipo, ParadaTipo,
  PresupuestoEstado, PresupuestoModo, RolTramo, Ruta, Tramo, TriggerSource, VentanaModo,
} from './types';

/** Tono visual del design system con el que se pinta un badge/columna. */
export type Kind = 'brand' | 'info' | 'warning' | 'positive' | 'alert' | 'neutral';

/* --------------------------------------------------------------
   1 · ESTADOS DE RUTA (= columnas del kanban, en este orden)
   -------------------------------------------------------------- */

export interface SubestadoCfg {
  id: string;
  label: string;
  desc: string;
  /** true = no se muestra en el pipeline activo (vista "Leads fríos") */
  fueraDelPipeline?: boolean;
}

/** Subestado ya indexado por `SUBESTADO`, que le añade a qué estado pertenece. */
export interface SubestadoMeta extends SubestadoCfg {
  estadoId: EstadoRuta;
}

/** `'todo'` = todo editable · `'bloqueado'` = solo tags · lista = campos concretos. */
export type EdicionModo = 'todo' | 'bloqueado' | string[];

export interface EstadoCfg {
  id: EstadoRuta;
  label: string;
  kind: Kind;
  desc: string;
  paso: number;
  /** se puede sacar una card de esta columna */
  arrastrable: boolean;
  /** se puede soltar una card aquí */
  aceptaDrop: boolean;
  dropAccion?: 'agendar' | 'cancelar';
  exigeMotivo?: boolean;
  /** los subestados solo los mueve el conductor */
  soloConductor?: boolean;
  edicion: EdicionModo;
  subestados: SubestadoCfg[];
}

export const ESTADOS: EstadoCfg[] = [
  {
    id: 'prospectos', label: 'Prospectos', kind: 'brand',
    desc: 'Todavía sin fecha agendada',
    paso: 0,
    arrastrable: true,          // se puede sacar una card de esta columna
    aceptaDrop: false,          // no se puede soltar aquí
    edicion: 'todo',
    subestados: [
      { id: 'sin_fecha',      label: 'Sin fecha',       desc: 'Matrícula registrada, sin cita' },
      { id: 'oferta_enviada', label: 'Oferta enviada',  desc: 'Esperando que el cliente elija horario' },
      { id: 'propuesto',      label: 'Fecha propuesta', desc: 'El taller propuso ventana, falta que el cliente confirme' },
      { id: 'caducado',       label: 'Caducado',        desc: '14 días sin respuesta a la oferta', fueraDelPipeline: true },
    ],
  },
  {
    id: 'agendado', label: 'Agendado', kind: 'info',
    desc: 'Ventana comprometida con el cliente',
    paso: 1,
    arrastrable: false,
    aceptaDrop: true,           // soltar aquí abre el formulario de agendar
    dropAccion: 'agendar',
    edicion: ['ventana', 'conductor', 'tags'],
    subestados: [
      { id: 'sin_conductor', label: 'Sin conductor', desc: 'Ventana fijada, falta asignar conductor' },
      { id: 'asignado',      label: 'Asignado',      desc: 'Conductor asignado, pendiente de que acepte' },
      { id: 'aceptado',      label: 'Aceptado',      desc: 'El conductor aceptó el servicio' },
    ],
  },
  {
    id: 'en_ruta', label: 'En ruta', kind: 'info',
    desc: 'Hay un tramo ejecutándose',
    paso: 2,
    arrastrable: false,
    aceptaDrop: false,
    edicion: 'bloqueado',
    soloConductor: true,        // los subestados solo los mueve el conductor
    subestados: [
      { id: 'en_camino_origen', label: 'En camino',  desc: 'El conductor va hacia el punto de recogida' },
      { id: 'en_origen',        label: 'En origen',  desc: 'Conductor en el punto de recogida' },
      { id: 'en_transito',      label: 'En tránsito', desc: 'Vehículo en movimiento hacia el destino' },
      { id: 'en_destino',       label: 'En destino', desc: 'Conductor en el punto de entrega' },
    ],
  },
  {
    id: 'en_taller', label: 'En taller', kind: 'warning',
    desc: 'El vehículo reposa en una parada de proveedor',
    paso: 3,
    arrastrable: false,
    aceptaDrop: false,
    edicion: ['clienteTieneAuto', 'tags', 'vuelta'],
    subestados: [
      { id: 'esperando_agenda_vuelta',    label: 'Vuelta sin fecha', desc: 'La vuelta existe pero no tiene ventana' },
      { id: 'oportunidad_vuelta',         label: 'Sin vuelta',       desc: 'No hay vuelta creada: se puede ofrecer el retorno' },
      { id: 'pendiente_confirmar_retiro', label: 'Confirmar retiro', desc: 'Fue solo ida; falta confirmar si el cliente ya retiró el coche' },
    ],
  },
  {
    id: 'completado', label: 'Completado', kind: 'positive',
    desc: 'Servicio cerrado',
    paso: 4,
    arrastrable: false,
    aceptaDrop: false,
    edicion: 'bloqueado',
    subestados: [
      { id: 'ok',                   label: 'Terminado',     desc: 'Devuelto al cliente y firmado' },
      { id: 'retirado_por_cliente', label: 'Retirado',      desc: 'El cliente se llevó el coche sin vuelta' },
      { id: 'con_incidencia',       label: 'Con incidencia', desc: 'Cerrado con una incidencia registrada' },
      { id: 'pendiente_cierre',     label: 'Por cerrar',    desc: 'Falta documentación para cerrar' },
    ],
  },
  {
    id: 'cancelado', label: 'Cancelado', kind: 'alert',
    desc: 'Servicio anulado',
    paso: 0,
    arrastrable: false,
    aceptaDrop: true,           // soltar aquí pide motivo
    dropAccion: 'cancelar',
    exigeMotivo: true,
    edicion: 'bloqueado',
    subestados: [
      { id: 'por_cliente',    label: 'Por cliente',     desc: 'El cliente anuló el servicio' },
      { id: 'por_taller',     label: 'Por taller',      desc: 'El taller anuló el servicio' },
      { id: 'fallido_origen', label: 'Fallido origen',  desc: 'No-show del cliente en la recogida' },
      { id: 'fallido_ruta',   label: 'Fallido en ruta', desc: 'El tramo no se pudo completar' },
    ],
  },
];

export const ORDEN_ESTADOS: EstadoRuta[] = ESTADOS.map((e) => e.id);

/* Indexados por string, no por `EstadoRuta`: son tablas de consulta y se preguntan con
   estados que pueden venir de fuera (una URL, un drop, un dato viejo). Un id desconocido
   devuelve undefined y cada accesor lo traduce a null. */
export const ESTADO = {} as Record<string, EstadoCfg>;
ESTADOS.forEach((e) => { ESTADO[e.id] = e; });

export const SUBESTADO = {} as Record<string, SubestadoMeta>;
ESTADOS.forEach((e) => e.subestados.forEach((s) => { SUBESTADO[`${e.id}.${s.id}`] = Object.assign({ estadoId: e.id }, s); }));

export const subestadoMeta = (estadoId: string, subId: string): SubestadoMeta | null =>
  SUBESTADO[`${estadoId}.${subId}`] || null;
export const estadoMeta = (estadoId: string): EstadoCfg | null => ESTADO[estadoId] || null;

export interface EstadoMetaCompat {
  label: string;
  kind: Kind;
  paso: number;
  desc: string;
}

/** Compatibilidad con los componentes que solo necesitan label + kind + paso. */
export const ESTADO_META = ESTADOS.reduce<Record<string, EstadoMetaCompat>>((acc, e) => {
  acc[e.id] = { label: e.label, kind: e.kind, paso: e.paso, desc: e.desc };
  return acc;
}, {});

/** Estados que NO se muestran en el pipeline activo (vista "Leads fríos"). */
export const SUBESTADOS_FRIOS = ESTADOS
  .reduce<string[]>((acc, e) => acc.concat(e.subestados.filter((s) => s.fueraDelPipeline).map((s) => `${e.id}.${s.id}`)), []);

/** Orden en el que avanza el conductor dentro de EN RUTA. */
export const PASOS_EN_RUTA = ESTADO.en_ruta.subestados.map((s) => s.id);

/* --------------------------------------------------------------
   2 · TRASLADOS (tramos): estado de ejecución
   -------------------------------------------------------------- */

export const ESTADOS_TRAMO: Record<EstadoTramo, { label: string; kind: Kind }> = {
  sin_agenda:  { label: 'Sin agenda',  kind: 'neutral' },
  agendado:    { label: 'Agendado',    kind: 'info' },
  en_curso:    { label: 'En curso',    kind: 'info' },
  completado:  { label: 'Completado',  kind: 'positive' },
  cancelado:   { label: 'Cancelado',   kind: 'alert' },
};

export const ROLES_TRAMO: Record<RolTramo, { label: string; icono: string; corto: string }> = {
  ida:     { label: 'Recogiendo',  icono: 'arrow_downward', corto: 'Ida' },
  vuelta:  { label: 'Entregando',  icono: 'arrow_upward',   corto: 'Vuelta' },
  interno: { label: 'Movimiento',  icono: 'swap_horiz',     corto: 'Interno' },
};

/** Indicador de tramo activo de la card. Sin emoji: iconos Material (regla del design system). */
export const INDICADOR_TRAMO: Record<RolTramo | 'reposo', { label: string; icono: string }> = {
  ida:     { label: 'Recogiendo', icono: 'arrow_downward' },
  vuelta:  { label: 'Entregando', icono: 'arrow_upward' },
  interno: { label: 'Movimiento', icono: 'swap_horiz' },
  reposo:  { label: 'En taller',  icono: 'local_parking' },
};

export const VENTANA_MODOS: Record<VentanaModo, { label: string; corto: string }> = {
  slots_cliente:   { label: 'El cliente eligió franja', corto: 'Elegida por el cliente' },
  propuesta_taller:{ label: 'Propuesta del taller',     corto: 'Propuesta, sin confirmar' },
  fija_taller:     { label: 'Fijada por el taller',     corto: 'Fijada por el taller' },
};

/* --------------------------------------------------------------
   3 · PARADAS
   -------------------------------------------------------------- */

export const PARADA_TIPOS: Record<ParadaTipo, { label: string; etiqueta: string; icono: string }> = {
  cliente:   { label: 'Cliente', etiqueta: 'Casa', icono: 'home' },
  proveedor: { label: 'Proveedor', etiqueta: 'Taller', icono: 'garage' },
};

export const PARADA_SUBTIPOS: Record<ParadaSubtipo, { label: string; etiqueta: string; icono: string; enTaller: string }> = {
  taller:    { label: 'Taller',    etiqueta: 'Taller',    icono: 'garage',        enTaller: 'En taller' },
  itv:       { label: 'ITV',       etiqueta: 'ITV',       icono: 'fact_check',    enTaller: 'En ITV' },
  chapista:  { label: 'Chapista',  etiqueta: 'Chapista',  icono: 'format_paint',  enTaller: 'En chapista' },
  otro:      { label: 'Otro',      etiqueta: 'Proveedor', icono: 'store',         enTaller: 'En proveedor' },
};

/** Lo mínimo que necesita el pipeline de una parada: sirve tanto para una `Parada` ya
    construida como para la especificación en crudo con la que se construye. */
export interface ParadaLike {
  tipo: ParadaTipo;
  subtipo: ParadaSubtipo | null;
  etiqueta?: string;
}

/** Etiqueta corta para el "origen → destino" de la card. */
export function etiquetaParada(p: ParadaLike | null | undefined): string {
  if (!p) return '—';
  if (p.etiqueta) return p.etiqueta;
  if (p.tipo === 'cliente') return PARADA_TIPOS.cliente.etiqueta;
  return (PARADA_SUBTIPOS[p.subtipo as ParadaSubtipo] || PARADA_SUBTIPOS.otro).etiqueta;
}

/** Paso del StatusTimeline correspondiente a una parada (los pasos salen de la ruta, no de una lista fija). */
export function etiquetaPaso(p: ParadaLike, i: number, total: number): string {
  if (i === 0) return 'Recogida';
  if (i === total - 1) return p.tipo === 'cliente' ? 'Devolución' : 'Entrega';
  return (PARADA_SUBTIPOS[p.subtipo as ParadaSubtipo] || PARADA_SUBTIPOS.otro).label;
}

/* --------------------------------------------------------------
   4 · LOGS
   -------------------------------------------------------------- */

export const LOG_TIPOS: Record<LogTipo, { label: string; icono: string }> = {
  cambio_estado: { label: 'Cambio de estado', icono: 'swap_horiz' },
  gps:           { label: 'Posición',         icono: 'location_on' },
  evidencia:     { label: 'Evidencia',        icono: 'photo_camera' },
  comunicacion:  { label: 'Comunicación',     icono: 'chat' },
  incidencia:    { label: 'Incidencia',       icono: 'report' },
  nota:          { label: 'Nota',             icono: 'sticky_note_2' },
};

export const TRIGGERS: Record<TriggerSource, { label: string }> = {
  manual:    { label: 'Taller' },
  conductor: { label: 'Conductor' },
  api:       { label: 'API' },
  cron:      { label: 'Automático' },
};

/* --------------------------------------------------------------
   5 · TAGS
   Derivados: los calcula el sistema, no se persisten, no se pueden quitar.
   Manuales: los pone el taller y sí se persisten en la ruta.
   -------------------------------------------------------------- */

const H = 3600000, DIA = 86400000;

/** Contexto que `tagsDeRuta()` (en mecanu-rutas) arma para evaluar los tags derivados. */
export interface TagCtx {
  ruta: Ruta;
  tramos: Tramo[];
  /** tramo activo de la ruta */
  activo: Tramo | null;
  vuelta: Tramo | null;
  paradaActual: Parada | null;
  /** ms del inicio de la ventana del tramo activo */
  inicioActivo: number | null;
  /** ms de "ahora" (inyectable para los tests) */
  ahora: number;
}

export interface TagDerivadoCfg {
  id: string;
  label: string;
  color: string;
  calc: (c: TagCtx) => boolean;
}

export const TAGS_DERIVADOS: TagDerivadoCfg[] = [
  { id: 'sin_conductor', label: 'Sin conductor', color: 'var(--mecanu-warning)',
    calc: (c) => c.ruta.estado === 'agendado' && !!c.activo && !c.activo.conductorId },

  { id: 'en_riesgo', label: 'En riesgo', color: 'var(--mecanu-alert)',
    calc: (c) => c.ruta.estado === 'agendado' && !!c.activo && !c.activo.conductorId
      && !!c.inicioActivo && (c.inicioActivo - c.ahora) < 24 * H && (c.inicioActivo - c.ahora) > 0 },

  { id: 'retrasado', label: 'Retrasado', color: 'var(--mecanu-alert)',
    calc: (c) => c.ruta.estado === 'agendado' && !!c.inicioActivo && (c.ahora - c.inicioActivo) > 15 * 60000 },

  { id: 'entrega_en_riesgo', label: 'Entrega en riesgo', color: 'var(--mecanu-warning)',
    calc: (c) => !!c.vuelta && c.vuelta.estado === 'agendado' && c.ruta.vehiculoListo !== true
      /* `c.vuelta!`: el `!!c.vuelta` de arriba ya lo garantiza, pero TS pierde el
         estrechamiento al entrar en el callback de `some`. */
      && c.tramos.some((t) => t.orden < c.vuelta!.orden && t.estado === 'completado') },

  { id: 'oportunidad_vuelta', label: 'Oportunidad de vuelta', color: 'var(--mecanu-electric-600)',
    calc: (c) => c.ruta.estado === 'en_taller' && !c.vuelta },

  { id: 'larga_custodia', label: 'Larga custodia', color: 'var(--mecanu-warning)',
    calc: (c) => c.ruta.estado === 'en_taller' && !!c.paradaActual && c.paradaActual.tipo === 'proveedor'
      && !!c.paradaActual.llegadaReal && !c.paradaActual.salidaReal
      && (c.ahora - c.paradaActual.llegadaReal.getTime()) > 7 * DIA },

  { id: 'sin_confirmar_cliente', label: 'Sin confirmar', color: 'var(--mecanu-info)',
    calc: (c) => !!c.activo && c.activo.ventanaModo === 'fija_taller' && c.activo.clienteConfirmo !== true
      && c.ruta.estado === 'agendado' },

  { id: 'inestable', label: 'Inestable', color: 'var(--mecanu-alert)',
    calc: (c) => c.tramos.some((t) => (t.reprogramaciones || 0) >= 2) },

  { id: 'doc_pendiente', label: 'Documentación pendiente', color: 'var(--mecanu-warning)',
    calc: (c) => c.ruta.estado === 'completado' && c.ruta.subestado === 'pendiente_cierre' },
];

export interface TagManualCfg {
  id: string;
  label: string;
  color: string;
  emoji: string;
  /** preset del sistema: no se puede borrar */
  preset?: boolean;
}

/** Manuales. Los 4 primeros son presets del sistema (no se borran); el resto son de la casa. */
export const TAGS_MANUALES: TagManualCfg[] = [
  { id: 'urgente',         label: 'Urgente',         color: '#E82B37', emoji: '', preset: true },
  { id: 'vip',             label: 'VIP',             color: '#7C4DFF', emoji: '', preset: true },
  { id: 'no_rodante',      label: 'No rodante',      color: '#161718', emoji: '', preset: true },
  { id: 'cobro_pendiente', label: 'Cobro pendiente', color: '#EC6513', emoji: '', preset: true },
  { id: 'tg-att',          label: 'Atención',        color: '#EC6513', emoji: '⚠️' },
  { id: 'tg-flota',        label: 'Flota',           color: '#419468', emoji: '🚚' },
  { id: 'tg-garantia',     label: 'Garantía',        color: '#7C4DFF', emoji: '🛡️' },
];

export const PALETA_TAGS: string[] = ['#E82B37', '#EC6513', '#419468', '#2D71D7', '#7C4DFF', '#161718'];

/* --------------------------------------------------------------
   6 · PRESUPUESTOS (viven en Campañas · fuente única de verdad)
   -------------------------------------------------------------- */

export interface PresupuestoEstadoCfg {
  id: PresupuestoEstado;
  label: string;
  corto: string;
  kind: Kind;
  /** cuenta para el badge de "pendientes de acción del taller" */
  pendienteTaller?: boolean;
  siguiente?: PresupuestoEstado;
  accion?: string;
  creaRuta?: boolean;
}

export const PRESUPUESTO_ESTADOS: PresupuestoEstadoCfg[] = [
  { id: 'nueva',     label: 'Nueva',      corto: 'Sin valorar', kind: 'neutral',  pendienteTaller: true,
    siguiente: 'valorada', accion: 'Valorar' },
  { id: 'valorada',  label: 'Estimado',   corto: 'Estimado',    kind: 'brand',    pendienteTaller: true,
    siguiente: 'enviada',  accion: 'Enviar al cliente' },
  { id: 'enviada',   label: 'Enviado',    corto: 'Enviado',     kind: 'info',
    siguiente: 'aceptada', accion: 'Marcar aceptada' },
  { id: 'aceptada',  label: 'Confirmado', corto: 'Confirmado',  kind: 'positive', creaRuta: true },
  { id: 'rechazada', label: 'Rechazado',  corto: 'Rechazado',   kind: 'alert' },
  { id: 'caducada',  label: 'Caducado',   corto: 'Caducado',    kind: 'neutral' },
];

export const PRESUPUESTO_META = PRESUPUESTO_ESTADOS
  .reduce<Record<string, PresupuestoEstadoCfg>>((a, e) => { a[e.id] = e; return a; }, {});
export const ORDEN_PRESUPUESTO: PresupuestoEstado[] = PRESUPUESTO_ESTADOS.map((e) => e.id);

/** Estados que cuentan para el badge de la pestaña Campañas (pendientes de acción del taller). */
export const PRESUPUESTO_PENDIENTES: PresupuestoEstado[] = PRESUPUESTO_ESTADOS.filter((e) => e.pendienteTaller).map((e) => e.id);

export const ORIGEN_LINEA: Record<OrigenLinea, { label: string; corto: string; icono: string; color: string }> = {
  inspeccion: { label: 'Detectado en la inspección', corto: 'Inspección', icono: 'photo_camera', color: 'var(--mecanu-warning)' },
  manual:     { label: 'Añadido por el taller',      corto: 'Manual',     icono: 'edit',         color: 'var(--mecanu-neutral-300)' },
  traslado:   { label: 'Servicio de traslado',       corto: 'Traslado',   icono: 'local_shipping', color: 'var(--mecanu-electric-600)' },
};

export const PRESUPUESTO_MODOS: Record<PresupuestoModo, { label: string }> = {
  detallado:   { label: 'Con desglose' },
  solo_total:  { label: 'Solo total' },
};

/* --------------------------------------------------------------
   7 · REGLAS DE NEGOCIO (declarativas)
   -------------------------------------------------------------- */

/** ¿Se puede arrastrar una card en este estado? */
export const esArrastrable = (estadoId: string): boolean => !!(ESTADO[estadoId] && ESTADO[estadoId].arrastrable);

/** ¿Esta columna acepta que le suelten una card? */
export const aceptaDrop = (estadoId: string): boolean => !!(ESTADO[estadoId] && ESTADO[estadoId].aceptaDrop);

/** ¿Se puede editar la propiedad `campo` con la ruta en este estado? */
export function puedeEditar(estadoId: string, campo: string): boolean {
  const e = ESTADO[estadoId];
  if (!e) return false;
  if (e.edicion === 'todo') return true;
  if (e.edicion === 'bloqueado') return campo === 'tags';
  return e.edicion.indexOf(campo) >= 0;
}

/** Se comunica al cliente si y solo si el origen o el destino del tramo es una parada de tipo cliente. */
export const seComunicaAlCliente = (
  paradaOrigen: ParadaLike | null | undefined,
  paradaDestino: ParadaLike | null | undefined,
): boolean =>
  !!(paradaOrigen && paradaOrigen.tipo === 'cliente') || !!(paradaDestino && paradaDestino.tipo === 'cliente');

/** Caducidad de ofertas sin respuesta. */
export const DIAS_CADUCIDAD_OFERTA = 14;

/** Umbral de "larga custodia" en una parada. */
export const DIAS_LARGA_CUSTODIA = 7;

export interface KpiRutaCfg {
  id: string;
  label: string;
  /** el KPI cuenta las rutas de hoy en vez de las de un estado */
  hoy?: boolean;
  estado?: EstadoRuta;
  delta?: string;
  dir?: 'up' | 'down';
}

/* KPIs de la cabecera de Traslados: se declaran aquí, no en el panel. */
export const KPIS_RUTAS: KpiRutaCfg[] = [
  { id: 'hoy',        label: 'Hoy',        hoy: true, delta: '2', dir: 'up' },
  { id: 'agendado',   label: 'Agendados',  estado: 'agendado' },
  { id: 'en_taller',  label: 'En taller',  estado: 'en_taller' },
  { id: 'prospectos', label: 'Prospectos', estado: 'prospectos' },
];

/** Tarifa logística del taller: se toma del tempario (servicio "Traslado"). Mecanu no fija precios. */
export const SERVICIO_TRASLADO_ID = 'SV-11';
