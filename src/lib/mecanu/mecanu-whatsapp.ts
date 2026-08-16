/* Mecanu — capa de mensajería WhatsApp (recordatorio proactivo post-inspección).
   No es marketing: cada mensaje sale de los hallazgos de la última inspección visual
   del vehículo — servicios confirmados en la revisión o sugeridos por desgaste estimado.
   Modela el contrato real de WhatsApp Cloud API (Graph v20.0): ventana de servicio de
   24 h, opt-in/opt-out, estados de entrega vía webhook y catálogo de errores. Al
   conectar la API real solo se sustituye `enviar()` por el POST a /messages. */

import {
  cliente, vehiculo, etiquetaVehiculo, fmtDinero, fmtDia, foto,
  historialInspeccionesVehiculo, labelRegistro, inspeccionesDeRuta,
} from './mecanu-rutas';

import type {
  Campana, CampanaItem, CanalWa, EstadoMensajeWa, HallazgoInspeccion, Inspeccion,
  MensajeWa, OrigenAgenda, Servicio,
} from './types';

export const WABA: { version: string; phoneNumberId: string; display: string; nombre: string } = {
  version: 'v20.0',
  phoneNumberId: '109377885466211',
  display: '+34 910 87 65 43',
  nombre: 'Taller Central Mecanu',
};

export const VENTANA_MS = 24 * 60 * 60 * 1000;
export const MAX_CUERPO = 1024;

/* ---------- Formato ---------- */

export function e164(tel: string | null | undefined, prefijo = '34'): string | null {
  const d = (tel || '').replace(/\D/g, '');
  if (!d) return null;
  return d.startsWith(prefijo) ? `+${d}` : `+${prefijo}${d}`;
}
/** Solo para mostrar: la API siempre recibe el E.164 sin espacios. */
export function fmtTel(tel: string | null | undefined): string {
  const e = e164(tel);
  if (!e) return '—';
  const n = e.slice(3);
  return `+34 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`.trim();
}
export function fmtReloj(d: Date | null | undefined): string {
  return d ? d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
}
/** ISO yyyy-mm-dd para el <input type="date">; el resto de la UI sigue mostrando fmtDia (es-ES). */
export function toISO(d: Date): string { return d.toISOString().slice(0, 10); }
export function fromISO(s: string): Date { return new Date(s + 'T00:00:00'); }
export function rangoFecha(base: Date): { min: string; max: string } {
  const MS = 14 * 86400000;
  return { min: toISO(new Date(base.getTime() - MS)), max: toISO(new Date(base.getTime() + MS)) };
}
export function fmtRestante(ms: number): string {
  if (ms <= 0) return 'cerrada';
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return h ? `${h} h ${m} min` : `${m} min`;
}
function wamid(): string {
  return 'wamid.HBg' + Math.random().toString(36).slice(2, 12).toUpperCase() + '==';
}

/* ---------- Mensaje base del recordatorio ----------
   Cuerpo único de Mecanu. El operador no reescribe el texto: ajusta el saludo,
   la fecha recomendada y qué hallazgos entran. */

export interface PlantillaMensaje {
  id: string;
  body: string;
  /** Variante cuando no hay hallazgos sugeridos. */
  bodySoloPendientes: string;
  footer: string;
  respuestas: string[];
}

export const MENSAJE: PlantillaMensaje = {
  id: 'recordatorio_inspeccion',
  body:
    'Hola {{nombre}} 👋.\n' +
    'Ya es momento de realizar {{pendientes}} de tu {{vehiculo}} ({{matricula}}), y también dado el tiempo transcurrido, te sugerimos realizar {{sugeridos}} para que siga funcionando en óptimas condiciones.\n\n' +
    '¿Te agendamos el servicio con recogida a domicilio o en el trabajo? Responde SÍ y te enviamos el enlace para agendar.\n\n' +
    'Presupuesto estimado total: {{importe}} (incluye IVA y traslado).\n' +
    'Fecha recomendada: antes del {{fecha}}.',
  /** Variante cuando no hay hallazgos sugeridos, para no dejar la frase colgando. */
  bodySoloPendientes:
    'Hola {{nombre}} 👋.\n' +
    'Ya es momento de realizar {{pendientes}} de tu {{vehiculo}} ({{matricula}}), según lo que vimos en la última inspección de tu coche.\n\n' +
    '¿Te agendamos el servicio con recogida a domicilio o en el trabajo? Responde SÍ y te enviamos el enlace para agendar.\n\n' +
    'Presupuesto estimado total: {{importe}} (incluye IVA y traslado).\n' +
    'Fecha recomendada: antes del {{fecha}}.',
  footer: 'Taller Central Mecanu',
  respuestas: ['Sí, agendar', 'Ver presupuesto', 'Ahora no'],
};

/** Qué campos puede ajustar el operador y qué viene fijo del sistema. */
export const META_VARIABLES: Record<string, { label: string; editable: boolean; fuente: string }> = {
  nombre:     { label: 'Nombre en el saludo', editable: true,  fuente: 'Ficha del cliente' },
  fecha:      { label: 'Fecha recomendada',   editable: true,  fuente: 'Urgencia detectada + hábito del cliente' },
  pendientes: { label: 'Servicios confirmados', editable: false, fuente: 'Hallazgos marcados de la inspección' },
  sugeridos:  { label: 'Servicios sugeridos',   editable: false, fuente: 'Hallazgos marcados de la inspección' },
  vehiculo:   { label: 'Vehículo',            editable: false, fuente: 'Ficha del vehículo' },
  matricula:  { label: 'Matrícula',           editable: false, fuente: 'Ficha del vehículo' },
  importe:    { label: 'Presupuesto total',   editable: false, fuente: 'Tempario · suma de servicios marcados' },
};

export function validarVariable(valor: unknown): { ok: boolean; motivo?: string } {
  const v = valor == null ? '' : String(valor);
  if (!v.trim()) return { ok: false, motivo: 'No puede quedar vacío' };
  if (/[\n\t]/.test(v)) return { ok: false, motivo: 'Sin saltos de línea ni tabulaciones' };
  if (/ {4,}/.test(v)) return { ok: false, motivo: 'Sin 4 o más espacios seguidos' };
  return { ok: true };
}

/** Cómo se nombra cada servicio dentro de la frase del mensaje. */
export const FRASE_SERVICIO: Record<string, string> = {
  'Neumáticos': 'el cambio de neumáticos',
  'Pastillas': 'el cambio de pastillas de freno',
  'Focos': 'el pulido de faros',
  'ITV': 'la revisión pre-ITV',
  'Alineación': 'la alineación de la dirección',
  'Aceite': 'el cambio de aceite y filtro',
  'Batería': 'la sustitución de la batería',
  'Escobillas': 'el cambio de escobillas',
  'Filtros': 'el cambio de filtros',
  'Refrigerante': 'la revisión del circuito de refrigeración',
};
export const frase = (etiqueta: string): string => FRASE_SERVICIO[etiqueta] || etiqueta.toLowerCase();

export const ETIQUETA_ORIGEN: Record<OrigenAgenda, string> = { confirmado: 'Confirmado', estimado: 'Sugerido' };

export function enumerar(lista: (string | null | undefined)[]): string {
  const l = lista.filter(Boolean) as string[];
  if (!l.length) return '';
  if (l.length === 1) return l[0];
  return `${l.slice(0, -1).join(', ')} y ${l[l.length - 1]}`;
}

/** Inspección visual que originó la oportunidad. */
export function inspeccionDe(o: Campana): Inspeccion | null {
  const lista = inspeccionesDeRuta(o.rutaOrigenId) || [];
  return lista.find((i) => i.id === o.inspeccionId) || lista[lista.length - 1] || null;
}

/** Sinónimos entre el tipo de la oportunidad y la categoría que usa el inspector en el check-in. */
const SINONIMO_CATEGORIA: Record<string, string[]> = {
  neumaticos: ['neumáticos'], frenos: ['frenos'], focos: ['visibilidad', 'iluminación'],
  alineacion: ['neumáticos'], aceite: ['motor'], bateria: ['eléctrico', 'batería'],
  escobillas: ['visibilidad'], filtros: ['motor'], refrigerante: ['motor'], itv: ['seguridad'],
};

/** Encuentra el hallazgo real del check-in que dio origen a este servicio sugerido. */
function buscarHallazgo(insp: Inspeccion | null, it: CampanaItem): HallazgoInspeccion | null {
  if (!insp || !insp.hallazgos || !insp.hallazgos.length) return null;
  const etq = it.etiqueta.toLowerCase();
  const sin = SINONIMO_CATEGORIA[it.tipo] || [];
  return insp.hallazgos.find((h) => {
    const cat = h.categoria.toLowerCase();
    return cat === etq || cat.includes(etq) || etq.includes(cat) || sin.indexOf(cat) >= 0;
  }) || null;
}

/** Título corto (1-2 palabras) para el hallazgo, pensado para alguien sin contexto técnico. */
export const TITULO_HALLAZGO: Record<string, string> = {
  neumaticos: 'Neumáticos', frenos: 'Pastillas', focos: 'Faros', itv: 'ITV',
  alineacion: 'Alineación', aceite: 'Aceite', bateria: 'Batería',
  escobillas: 'Escobillas', filtros: 'Filtros', refrigerante: 'Refrigerante',
};

/** Medidas del hallazgo. Qué claves vienen rellenas depende del `tipo` del ítem: cada ficha
    de `FICHA_TIPO` lee solo las suyas, así que se declaran como presentes en lugar de
    obligar a cada lectura a comprobar un `undefined` que su propia rama descarta. */
export interface DatosHallazgo {
  posicion: string;
  marca: string;
  vidaPct: number;
  mm: number;
  tipoPastilla: string;
  tipoLuz: string;
  opacidadPct: number;
  estado: string;
  medida: string;
  desviacion: string;
  eje: string;
  kmActual: number;
  kmProximo: number;
  voltaje: number;
  antiguedad: string;
  tipo: string;
  nivelPct: number;
  tipoRefrigerante: string;
  foto: string;
}

const fmtKm = (n: number) => `${n.toLocaleString('es-ES')} km`;
const fmtV = (v: number | string) => String(v).replace('.', ',') + ' V';
const compact = <T,>(arr: (T | null | undefined | '')[]): T[] => arr.filter((x) => x != null && x !== '') as T[];
/** Specs que ya viven en el catálogo de tempario (medida, capacidad, tipo de aceite) — siempre
    disponibles porque son datos de la plataforma, no del check-in puntual. */
const medidaNeumatico = (sv: Servicio | null) => { const m = sv && sv.nombre.match(/(\d{3}\/\d{2}\s?R\d{2})/); return m ? m[1] : null; };
const capacidadBateria = (sv: Servicio | null) => { const m = sv && sv.nombre.match(/(\d+\s?Ah)/i); return m ? m[1] : null; };
const tipoAceiteCatalogo = (sv: Servicio | null) => (sv && sv.notas && /aceite/i.test(sv.notas)) ? sv.notas : null;

/** Ficha por tipo de servicio: qué tags mostrar (además del plazo, que se añade siempre) y,
    cuando existe una forma clara de proyectar el dato, el movimiento visual antes → después.
    Si el tipo no tiene forma de proyectarse (estado binario sin medición), se muestra igual
    como transición de estado; si de plano no aplica, `movimiento` se omite. */
export interface MovimientoHallazgo {
  de: string;
  a: string;
  item: string;
}

export interface FichaTipo {
  tags: (d: DatosHallazgo, it: CampanaItem) => string[];
  movimiento?: (d: DatosHallazgo, origen: OrigenAgenda) => MovimientoHallazgo;
}

export const FICHA_TIPO: Record<string, FichaTipo> = {
  neumaticos: {
    tags: (d, it) => compact([d.posicion, medidaNeumatico(it.servicio), d.marca, `${d.vidaPct} % de vida útil`]),
    movimiento: (d, origen) => ({ de: `${d.vidaPct} %`, a: `${Math.max(0, Math.round(d.vidaPct * (origen === 'confirmado' ? 0.3 : 0.55)))} %`, item: 'Vida útil restante' }),
  },
  frenos: {
    tags: (d) => compact([d.posicion, `${d.mm} mm restantes`, d.tipoPastilla]),
    movimiento: (d, origen) => ({ de: `${d.mm} mm`, a: `${Math.max(0, Math.round(d.mm * (origen === 'confirmado' ? 0.25 : 0.5) * 10) / 10)} mm`, item: 'Espesor restante' }),
  },
  focos: {
    tags: (d) => compact([d.posicion, d.tipoLuz, `Opacidad ${d.opacidadPct} %`]),
    movimiento: (d) => ({ de: `${d.opacidadPct} % opaco`, a: `${Math.min(97, d.opacidadPct + Math.round((100 - d.opacidadPct) * 0.4))} % opaco`, item: 'Opacidad proyectada' }),
  },
  itv: {
    tags: (d) => compact(['ITV', d.estado]),
    movimiento: () => ({ de: 'Vigente', a: 'Vencida', item: 'Estado de la ITV' }),
  },
  alineacion: {
    tags: (d) => compact(['Convergencia', `Desviación ${d.desviacion}`, d.eje]),
    movimiento: () => ({ de: 'Dentro de rango', a: 'Fuera de rango', item: 'Alineación de dirección' }),
  },
  aceite: {
    tags: (d, it) => compact([fmtKm(d.kmActual), tipoAceiteCatalogo(it.servicio), `Cambio cada ${fmtKm(d.kmProximo)}`]),
    movimiento: (d) => ({ de: fmtKm(d.kmActual), a: fmtKm(d.kmProximo), item: 'Próximo cambio' }),
  },
  bateria: {
    tags: (d, it) => compact([capacidadBateria(it.servicio), `Arranque ${fmtV(d.voltaje)}`, d.antiguedad]),
    movimiento: (d) => ({ de: '12,6 V', a: fmtV(d.voltaje), item: 'Voltaje de arranque' }),
  },
  escobillas: {
    tags: (d) => compact([d.estado, d.medida]),
    movimiento: () => ({ de: 'Flexible', a: 'Endurecida', item: 'Estado de la goma' }),
  },
  filtros: {
    tags: (d) => compact([d.tipo, d.estado, d.marca]),
    movimiento: () => ({ de: 'Limpio', a: 'Saturado', item: 'Estado del filtro' }),
  },
  refrigerante: {
    tags: (d) => compact([`Nivel ${d.nivelPct} %`, d.tipoRefrigerante]),
    movimiento: (d) => ({ de: `${d.nivelPct} %`, a: `${Math.max(0, d.nivelPct - 15)} %`, item: 'Nivel de refrigerante' }),
  },
};

/** Vista previa simplificada del input específico que sustenta este output (el hallazgo incluido en el mensaje).
    Todo lo mostrado aquí es dato tabulado de la inspección — nunca el comentario libre general de la
    inspección completa, que es a nivel de vehículo y solo pertenece a su historial. */
export interface DetalleHallazgo {
  titulo: string;
  tags: string[];
  movimientoTexto: string | null;
  fotos: { url: string; label: string }[];
  detalles: { label: string; valor: string; servicioId?: string }[];
}

export function detalleHallazgo(o: Campana, it: CampanaItem): DetalleHallazgo {
  const ficha = FICHA_TIPO[it.tipo];
  const d = (it.datos || {}) as unknown as DatosHallazgo;
  const esVencimiento = it.origen === 'confirmado';

  const tags = ficha ? ficha.tags(d, it) : [it.etiqueta];
  tags.push(`${esVencimiento ? 'Vence' : 'Sugerido'} antes del ${fmtDia(it.fecha)}`);

  const mov = ficha && ficha.movimiento ? ficha.movimiento(d, it.origen) : null;
  const movimientoTexto = mov ? `${mov.de} → ${mov.a} · ${mov.item}` : null;

  const insp = inspeccionDe(o);
  const h = buscarHallazgo(insp, it); // best-effort: solo para reusar una foto real si existe
  const posicionLabel = d.posicion || d.tipo || it.etiqueta;
  const fotoUrl = (h && h.fotoUrl) || (d.foto ? foto(d.foto) : null);
  const fotos = fotoUrl ? [{ url: fotoUrl, label: posicionLabel }] : [];

  const veh = vehiculo(o.vehiculoId);
  const historial = veh ? historialInspeccionesVehiculo(veh.id) : [];

  const detalles: DetalleHallazgo['detalles'] = [
    { label: 'Registro de incidente', valor: labelRegistro(it.registroIdx || 0) },
    { label: 'Última inspección', valor: historial.length ? fmtDia(historial[0]) : '—' },
  ];
  if (it.servicio) detalles.push({ label: 'Cód. tempario', valor: it.servicio.id, servicioId: it.servicio.id });

  return { titulo: TITULO_HALLAZGO[it.tipo] || it.etiqueta, tags, movimientoTexto, fotos, detalles };
}

/** Valores con los que se rellena la plantilla del recordatorio. */
export interface ValoresMensaje {
  nombre: string;
  pendientes: string;
  sugeridos: string;
  vehiculo: string;
  matricula: string;
  importe: string;
  fecha: string;
  /** total en euros de los ítems marcados (no se interpola: lo usa la UI) */
  _total: number;
  _items: CampanaItem[];
}

/** Lo que el operador puede ajustar a mano antes de enviar. */
export interface OverridesMensaje {
  nombre?: string;
  /** ISO yyyy-mm-dd, tal cual sale del <input type="date"> */
  fecha?: string;
}

/** Diccionario de valores según los hallazgos marcados. */
export function valoresOportunidad(o: Campana, seleccion: string[], overrides?: OverridesMensaje): ValoresMensaje {
  const ov = overrides || {};
  const c = cliente(o.clienteId), v = vehiculo(o.vehiculoId);
  const items = o.items.filter((it) => seleccion.indexOf(it.id) >= 0);
  const conf = items.filter((it) => it.origen === 'confirmado');
  const est = items.filter((it) => it.origen !== 'confirmado');
  const principales = conf.length ? conf : items.slice(0, 1);
  const secundarios = conf.length ? est : items.slice(1);
  const total = Math.round(items.reduce((a, it) => a + it.valor, 0) * 100) / 100;
  return {
    nombre: ov.nombre != null ? ov.nombre : (c ? c.nombre.split(' ')[0] : ''),
    pendientes: enumerar(principales.map((it) => frase(it.etiqueta))) || 'la revisión pendiente',
    sugeridos: enumerar(secundarios.map((it) => frase(it.etiqueta))),
    vehiculo: etiquetaVehiculo(v),
    matricula: v ? v.matricula : '—',
    importe: fmtDinero(total),
    fecha: ov.fecha != null ? fmtDia(fromISO(ov.fecha)) : fmtDia(o.fecha),
    _total: total,
    _items: items,
  };
}

export function renderMensaje(valores: ValoresMensaje): string {
  const body = valores.sugeridos ? MENSAJE.body : MENSAJE.bodySoloPendientes;
  /* Todos los placeholders de la plantilla son campos de texto de `ValoresMensaje`;
     el acceso dinámico se estrecha aquí en vez de abrir la interfaz con un index signature. */
  const texto = valores as unknown as Record<string, string | undefined>;
  return body.replace(/\{\{(\w+)\}\}/g, (_, k: string) => {
    const val = texto[k];
    return val == null || val === '' ? `{{${k}}}` : val;
  });
}

/* ---------- Errores que devuelve la API ---------- */

export const ERRORES: Record<number, { titulo: string; detalle: string }> = {
  131047: { titulo: 'Ventana de 24 h cerrada', detalle: 'Reabre la conversación enviando de nuevo el recordatorio.' },
  131026: { titulo: 'Número sin WhatsApp', detalle: 'El número no tiene cuenta de WhatsApp o no admite mensajes.' },
  131049: { titulo: 'Límite diario del usuario', detalle: 'Meta ha limitado los mensajes proactivos a este cliente hoy. Reintenta mañana.' },
  132000: { titulo: 'Variables incompletas', detalle: 'Falta rellenar algún dato del mensaje.' },
  63016:  { titulo: 'Mensaje libre fuera de ventana', detalle: 'Fuera de las 24 h solo se admite el recordatorio.' },
  368:    { titulo: 'Cliente dado de baja', detalle: 'El cliente respondió BAJA. No se le puede volver a escribir hasta que él inicie la conversación.' },
};

/* ---------- Transporte ---------- */

/** Cuerpo de un POST a /messages de la Cloud API. */
export interface PayloadWa {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: { preview_url: boolean; body: string };
}

export function payloadRecordatorio(to: string, valores: ValoresMensaje): PayloadWa {
  return { messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text',
    text: { preview_url: false, body: renderMensaje(valores) } };
}
export function payloadTexto(to: string, body: string): PayloadWa {
  return { messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { preview_url: false, body } };
}

/** Simula la API: resuelve como Graph (messages[0].id) y emite los estados que en
    producción llegan por webhook: sent → delivered → read. */
/** Respuesta de Graph al POST de /messages. */
export interface RespuestaEnvio {
  messaging_product: string;
  contacts: { wa_id: string }[];
  messages: { id: string; message_status: string }[];
}

export interface OpcionesEnvio {
  /** código de `ERRORES` con el que forzar un fallo (modo demo) */
  forzarError?: number;
  /** en producción estos estados llegan por webhook */
  onEstado?: (id: string, estado: EstadoMensajeWa) => void;
}

/** Error de la Cloud API: un Error normal con el código de Meta colgado. */
export type ErrorWa = Error & { code?: number };

export function enviar(payload: PayloadWa, opts?: OpcionesEnvio): Promise<RespuestaEnvio> {
  const o = opts || {};
  return new Promise<RespuestaEnvio>((resolve, reject) => {
    setTimeout(() => {
      if (o.forzarError) {
        const err: ErrorWa = new Error(ERRORES[o.forzarError].titulo);
        err.code = o.forzarError;
        reject(err);
        return;
      }
      const id = wamid();
      resolve({ messaging_product: 'whatsapp', contacts: [{ wa_id: payload.to }], messages: [{ id, message_status: 'accepted' }] });
      if (o.onEstado) {
        /* `o.onEstado!`: comprobado justo arriba, pero TS pierde el estrechamiento dentro
           de los callbacks de setTimeout. */
        setTimeout(() => o.onEstado!(id, 'sent'), 400);
        setTimeout(() => o.onEstado!(id, 'delivered'), 1600);
        setTimeout(() => o.onEstado!(id, 'read'), 4200);
      }
    }, 280);
  });
}

/* ---------- Ventana de servicio de 24 h ---------- */

/** Estado de la ventana de servicio de 24 h de la Cloud API. */
export interface EstadoVentana {
  abierta: boolean;
  restanteMs: number;
  etiqueta: string;
  detalle: string;
}

export function estadoVentana(ultimaEntrada: Date | null | undefined, ahora?: Date): EstadoVentana {
  const now = ahora || new Date();
  if (!ultimaEntrada) {
    return { abierta: false, restanteMs: 0, etiqueta: 'Sin conversación abierta',
      detalle: 'El primer contacto se hace con el recordatorio de la inspección.' };
  }
  const restanteMs = VENTANA_MS - (now.getTime() - ultimaEntrada.getTime());
  return restanteMs > 0
    ? { abierta: true, restanteMs, etiqueta: `Ventana abierta · quedan ${fmtRestante(restanteMs)}`,
        detalle: 'Puedes escribir mensajes libres hasta que se cierre.' }
    : { abierta: false, restanteMs: 0, etiqueta: 'Ventana de 24 h cerrada',
        detalle: 'Para reabrir la conversación hay que reenviar el recordatorio.' };
}

export const ESTADO_MENSAJE: Record<EstadoMensajeWa, { icono: string; color: string; label: string }> = {
  pending:   { icono: 'schedule', color: 'var(--mecanu-neutral-300)', label: 'Enviando' },
  sent:      { icono: 'done',     color: 'var(--mecanu-neutral-300)', label: 'Enviado' },
  delivered: { icono: 'done_all', color: 'var(--mecanu-neutral-300)', label: 'Entregado' },
  read:      { icono: 'done_all', color: 'var(--mecanu-info)',        label: 'Leído' },
  failed:    { icono: 'error',    color: 'var(--mecanu-alert)',       label: 'No entregado' },
};

/* ---------- Conversaciones sembradas (histórico de demo) ---------- */

const T0 = Date.now();
const hace = (min: number) => new Date(T0 - min * 60000);
const msg = (dir: MensajeWa['dir'], texto: string | null, min: number, extra?: Partial<MensajeWa>): MensajeWa =>
  Object.assign<MensajeWa, Partial<MensajeWa>>({
    id: wamid(), dir, tipo: 'text', texto, ts: hace(min), estado: dir === 'out' ? 'read' : null,
  }, extra || {});

/** clave = id de oportunidad. optIn: 'IN' | 'OUT' (respondió BAJA) */
export const CANALES_SEED: Record<string, CanalWa> = {
  'OP-3001': { optIn: 'IN', mensajes: [] },
  'OP-3002': { optIn: 'IN', mensajes: [
    msg('out', null, 190, { tipo: 'recordatorio', estado: 'read' }),
    msg('in', 'Buenas, ¿cuánto tardaría el pulido de faros? El coche lo necesito por la tarde.', 44),
  ] },
  'OP-3003': { optIn: 'IN', mensajes: [
    msg('out', null, 1620, { tipo: 'recordatorio', estado: 'delivered' }),
  ] },
  'OP-3004': { optIn: 'IN', mensajes: [
    msg('out', null, 96, { tipo: 'recordatorio', estado: 'read' }),
    msg('in', 'SÍ', 12),
    msg('in', '¿Podéis recogerlo en la oficina en vez de en casa?', 11),
  ] },
  'OP-3005': { optIn: 'IN', mensajes: [
    msg('out', null, 25, { tipo: 'recordatorio', estado: 'failed', error: 131026 }),
  ] },
  'OP-3006': { optIn: 'OUT', mensajes: [
    msg('out', null, 4300, { tipo: 'recordatorio', estado: 'read' }),
    msg('in', 'BAJA', 4260),
    { id: wamid(), dir: 'sistema', tipo: 'sistema', texto: 'El cliente se dio de baja de los avisos (BAJA).', ts: hace(4260) },
  ] },
  'OP-3007': { optIn: 'IN', mensajes: [
    msg('out', null, 300, { tipo: 'recordatorio', estado: 'read' }),
    msg('in', 'Me interesa la batería, lo de las escobillas lo dejo para más adelante.', 128),
    msg('out', 'Perfecto, te preparo el presupuesto solo con la batería y te paso el enlace para agendar.', 120, { estado: 'read' }),
  ] },
};

/** Respuestas simuladas del cliente (en producción llegan por webhook). */
export const RESPUESTAS_DEMO: string[] = [
  'SÍ, me viene bien. ¿Qué día tenéis libre?',
  'Vale, ¿lo podéis recoger por la mañana?',
  '¿El presupuesto incluye el traslado?',
  'De acuerdo, mándame el enlace para agendar.',
];
