/* Fachada tipada sobre la capa de datos JS (`src/lib/mecanu`).
   La capa de datos es JavaScript sin tipos: aquí se declara el contrato que consume el panel
   y se re-exporta con tipos explícitos. No hay backend: todo vive en memoria.
   // TODO API: sustituir estos imports por el cliente HTTP real. */

import * as M from '@/lib/mecanu/mecanu-rutas';
import * as W from '@/lib/mecanu/mecanu-whatsapp';

/* ------------------------- Entidades ------------------------- */

export interface Cliente {
  id: string;
  nombre: string;
  tipo: string;
  telefono: string;
  email: string;
  direccion: string;
  desde: Date;
}

export interface UsuarioVehiculo {
  clienteId: string;
  relacion: string;
  principal: boolean;
}

export interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  matricula: string;
  km: number;
  color: string;
  usuarios: UsuarioVehiculo[];
}

export interface IncidenciaConductor {
  fecha: Date;
  tipo: string;
  gravedad: string;
  detalle: string;
}

export interface Conductor {
  id: string;
  nombre: string;
  telefono: string;
  red: string;
  furgoneta: string;
  proceso: 'documentos_pendientes' | 'en_supervision' | 'activo';
  supervisados: number;
  requeridos: number;
  alta: Date;
  calificacion: number;
  valoraciones: number;
  docs: { dni: boolean; carnet: boolean; iban: boolean; seguro: boolean };
  incidencias: IncidenciaConductor[];
}

export interface Servicio {
  id: string;
  nombre: string;
  categoria: string;
  horas: number;
  manoObra: number;
  materiales: number;
  aplica: string[];
  garantia: string;
  notas: string;
  total: number;
  totalIva: number;
}

export interface Parada {
  id: string;
  rutaId: string;
  orden: number;
  tipo: 'cliente' | 'proveedor';
  subtipo: string | null;
  etiqueta: string;
  direccion: string | null;
  localidad: string | null;
  sublocalidad: string | null;
  servicios: { descripcion: string; presupuestoId: string }[];
  llegadaReal: Date | null;
  salidaReal: Date | null;
}

export interface Ventana {
  fecha: Date;
  inicio: string;
  fin: string;
}

export interface Tramo {
  id: string;
  rutaId: string;
  orden: number;
  rol: 'ida' | 'vuelta' | 'interno';
  paradaOrigenId: string | null;
  paradaDestinoId: string | null;
  conductorId: string | null;
  ventana: Ventana | null;
  ventanaPropuesta: Ventana | null;
  ventanaModo: 'slots_cliente' | 'propuesta_taller' | 'fija_taller';
  clienteConfirmo: boolean | null;
  estado: 'sin_agenda' | 'agendado' | 'en_curso' | 'completado' | 'cancelado';
  subestado: string | null;
  seguro: boolean;
  importe: number;
  reprogramaciones: number;
  comunicaAlCliente: boolean;
}

export type OrigenLinea = 'inspeccion' | 'manual' | 'traslado';

export interface LineaPresupuesto {
  descripcion: string;
  importe: number;
  origen: OrigenLinea;
  servicioTemparioId: string | null;
}

export type PresupuestoEstado = 'nueva' | 'valorada' | 'enviada' | 'aceptada' | 'rechazada' | 'caducada';

export interface Presupuesto {
  id: string;
  campanaId: string | null;
  vehiculoId: string | null;
  rutaOrigenId: string | null;
  rutaGeneradaId: string | null;
  modo: 'detallado' | 'solo_total';
  lineas: LineaPresupuesto[];
  estado: PresupuestoEstado;
  ivaIncluido: boolean;
  creado: Date | null;
  actualizado: Date | null;
  total: number;
}

export type EstadoRuta = 'prospectos' | 'agendado' | 'en_ruta' | 'en_taller' | 'completado' | 'cancelado';

export interface Ruta {
  id: string;
  vehiculoId: string | null;
  clienteId: string | null;
  perfilServicio: string;
  modeloPrecio: string;
  precioTotal: number;
  estado: EstadoRuta;
  subestado: string;
  tagsManual: string[];
  clienteTieneAuto: boolean | null;
  vehiculoListo: boolean | null;
  campanaOrigenId: string | null;
  presupuestoId: string;
  motivo: string | null;
  canceladaEn: Date | null;
  incidencia: string | null;
  matriculaLead: string | null;
  linkToken: string | null;
  linkEnviadoEn: Date | null;
  creadaEn: Date;
}

export interface RutaVista extends Ruta {
  tramoActivoId: string | null;
  paradaOrigen: Parada | null;
  paradaDestino: Parada | null;
  etiquetaOrigen: string | null;
  etiquetaDestino: string | null;
  direccionOrigen: string | null;
  direccionDestino: string | null;
  direccion: string | null;
  conductorId: string | null;
  fecha: Date | null;
  fechaPropuesta: Date | null;
  franja: string | null;
  franjaPropuesta: string | null;
  ventanaModo: Tramo['ventanaModo'] | null;
  seguro: boolean;
  reprogramaciones: number;
  descripcionServicio: string;
  presupuesto: Presupuesto | null;
  importe: number | null;
}

export interface TagRuta {
  id: string;
  label: string;
  color: string;
  emoji?: string;
  derivado: boolean;
}

export interface Actividad {
  id: string;
  fecha: Date;
  tipo: string;
  actor: string;
  triggerSource: string;
  label: string;
  detalle: string | null;
  tipoEvidencia: string | null;
  trasladoId: string;
}

export interface HallazgoInspeccion {
  categoria: string;
  item: string;
  metrica: string;
  severidad: 'ok' | 'warning' | 'danger';
  prediccion: string;
  vida: string;
  cambio: string;
  servicio: { nombre: string; precio: number } | null;
  foto: string | null;
  fotoUrl: string | null;
}

export interface DanoInspeccion {
  zona: string;
  tipo: string;
  descripcion: string;
  ubicacion: string;
  foto: string | null;
  fotoUrl: string | null;
}

export interface Inspeccion {
  id: string;
  tipo: 'check-in' | 'check-out';
  rutaId: string;
  trasladoId: string | null;
  fecha: Date;
  inspector: string;
  inspectorNombre: string;
  sede: string;
  km: number;
  combustible: string;
  combustiblePct: number;
  limpieza: string;
  vehiculo: { matricula: string; modelo: string; vin: string; km: number; combustible: string; combustiblePct: number };
  itv: { estado: string; vence: number[] };
  itvVence: Date;
  zonas: { zona: string; dano: DanoInspeccion | null }[];
  danos: DanoInspeccion[];
  hallazgos: HallazgoInspeccion[];
  firmas: { cliente: string | null; conductor: string | null };
}

export interface CampanaItem {
  id: string;
  tipo: string;
  origen: 'confirmado' | 'estimado';
  dias: number;
  falla: string;
  registroIdx: number;
  datos: Record<string, string | number>;
  etiqueta: string;
  servicio: Servicio | null;
  valor: number;
  fecha: Date;
}

export interface Campana {
  id: string;
  clienteId: string;
  vehiculoId: string;
  rutaOrigenId: string | null;
  rutaGeneradaId: string | null;
  inspeccionId: string | null;
  items: CampanaItem[];
  tipos: string[];
  etiquetas: string[];
  falla: string;
  evidencia: string;
  valor: number;
  servicio: Servicio | null;
  urgente: boolean;
  severidad: string;
  fecha: Date;
  habito: string;
  motivoFecha: string;
  fotoUrl: string;
  estadoEnvio: string;
  presupuestoId: string;
  presupuesto: Presupuesto;
  estado: PresupuestoEstado;
  origenAutomatico: boolean;
}

/* ------------------------- Config del pipeline ------------------------- */

export interface SubestadoCfg {
  id: string;
  label: string;
  desc: string;
  kind: 'brand' | 'info' | 'warning' | 'positive' | 'alert' | 'neutral';
  fueraDelPipeline?: boolean;
  estadoId?: string;
}

export interface EstadoCfg {
  id: EstadoRuta;
  label: string;
  kind: 'brand' | 'info' | 'warning' | 'positive' | 'alert' | 'neutral';
  desc: string;
  paso: number;
  arrastrable: boolean;
  aceptaDrop: boolean;
  dropAccion?: 'agendar' | 'cancelar';
  exigeMotivo?: boolean;
  soloConductor?: boolean;
  edicion: string | string[];
  subestados: SubestadoCfg[];
}

export interface TagManualCfg {
  id: string;
  label: string;
  color: string;
  emoji: string;
  preset?: boolean;
}

export interface PresupuestoEstadoCfg {
  id: PresupuestoEstado;
  label: string;
  corto: string;
  kind: 'neutral' | 'brand' | 'info' | 'positive' | 'alert' | 'warning';
  pendienteTaller?: boolean;
  siguiente?: PresupuestoEstado;
  accion?: string;
  creaRuta?: boolean;
}

/* ------------------------- Re-exportación tipada ------------------------- */

const m = M as unknown as Record<string, unknown>;
const w = W as unknown as Record<string, unknown>;

export const CLIENTES = m.CLIENTES as Cliente[];
export const VEHICULOS = m.VEHICULOS as Vehiculo[];
export const CONDUCTORES = m.CONDUCTORES as Conductor[];
export const SERVICIOS = m.SERVICIOS as Servicio[];
export const CATEGORIAS_SERVICIO = m.CATEGORIAS_SERVICIO as string[];
export const RUTAS_VISTA = m.RUTAS_VISTA as RutaVista[];
export const RUTAS = m.RUTAS as Ruta[];
export const CAMPANAS = m.CAMPANAS as Campana[];
export const TALLER = m.TALLER as { nombre: string; direccion: string };
export const IVA = m.IVA as number;
export const FRANJAS = m.FRANJAS as string[];
export const DIAS_SEMANA = m.DIAS_SEMANA as string[];

export const ESTADOS = m.ESTADOS as EstadoCfg[];
export const ESTADO = m.ESTADO as Record<string, EstadoCfg>;
export const ORDEN_ESTADOS = m.ORDEN_ESTADOS as EstadoRuta[];
export const SUBESTADO = m.SUBESTADO as Record<string, SubestadoCfg>;
export const ESTADOS_TRAMO = m.ESTADOS_TRAMO as Record<string, { label: string; kind: string }>;
export const ROLES_TRAMO = m.ROLES_TRAMO as Record<string, { label: string; icono: string; corto: string }>;
export const VENTANA_MODOS = m.VENTANA_MODOS as Record<string, { label: string; corto: string }>;
export const PARADA_SUBTIPOS = m.PARADA_SUBTIPOS as Record<string, { label: string; etiqueta: string; icono: string; enTaller: string }>;
export const TAGS_MANUALES = m.TAGS_MANUALES as TagManualCfg[];
export const PALETA_TAGS = m.PALETA_TAGS as string[];
export const PRESUPUESTO_ESTADOS = m.PRESUPUESTO_ESTADOS as PresupuestoEstadoCfg[];
export const PRESUPUESTO_META = m.PRESUPUESTO_META as Record<string, PresupuestoEstadoCfg>;
export const PRESUPUESTO_PENDIENTES = m.PRESUPUESTO_PENDIENTES as PresupuestoEstado[];
export const ORIGEN_LINEA = m.ORIGEN_LINEA as Record<OrigenLinea, { label: string; corto: string; icono: string; color: string }>;
export const ONBOARDING_META = m.ONBOARDING_META as Record<string, { label: string; kind: string; paso: number; desc: string }>;
export const ORDEN_ONBOARDING = m.ORDEN_ONBOARDING as string[];
export const KPIS_RUTAS = m.KPIS_RUTAS as { id: string; label: string; hoy?: boolean; estado?: string; delta?: string; dir?: 'up' | 'down' }[];
export const LOG_TIPOS = m.LOG_TIPOS as Record<string, { label: string; icono: string }>;
export const TRIGGERS = m.TRIGGERS as Record<string, { label: string }>;
export const SEVERIDAD_META = m.SEVERIDAD_META as Record<string, { kind: string; label: string }>;
export const SERVICIO_TRASLADO_ID = m.SERVICIO_TRASLADO_ID as string;

export const cliente = m.cliente as (id: string | null) => Cliente | null;
export const vehiculo = m.vehiculo as (id: string | null) => Vehiculo | null;
export const conductor = m.conductor as (id: string | null) => Conductor | null;
export const servicio = m.servicio as (id: string) => Servicio | null;
export const ruta = m.ruta as (id: string) => Ruta | null;
export const tramo = m.tramo as (id: string) => Tramo | null;
export const parada = m.parada as (id: string) => Parada | null;
export const presupuesto = m.presupuesto as (id: string) => Presupuesto | null;
export const campana = m.campana as (id: string) => Campana | null;
export const paradasDeRuta = m.paradasDeRuta as (rutaId: string) => Parada[];
export const tramosDeRuta = m.tramosDeRuta as (rutaId: string) => Tramo[];
export const tramoActivo = m.tramoActivo as (rutaId: string) => Tramo | null;
export const pasosDeRuta = m.pasosDeRuta as (rutaId: string) => string[];
export const pasoActualDeRuta = m.pasoActualDeRuta as (r: Ruta) => number;
export const tagsDeRuta = m.tagsDeRuta as (r: Ruta, ahora?: number) => TagRuta[];
export const actividadDeRuta = m.actividadDeRuta as (rutaId: string) => Actividad[];
export const inspeccionesDeRuta = m.inspeccionesDeRuta as (rutaId: string) => Inspeccion[];
export const contactosDeVehiculo = m.contactosDeVehiculo as (vehiculoId: string) => {
  clienteId: string; nombre: string; rol: string; relacion: string; telefono: string | null; email: string | null;
}[];
export const vehiculosDeCliente = m.vehiculosDeCliente as (clienteId: string) => (Vehiculo & { relacion: string })[];
export const rutasDeCliente = m.rutasDeCliente as (id: string) => RutaVista[];
export const rutasDeVehiculo = m.rutasDeVehiculo as (id: string) => RutaVista[];
export const rutasDeConductor = m.rutasDeConductor as (id: string) => RutaVista[];
export const diasEnParada = m.diasEnParada as (p: Parada | null) => number | null;
export const paradaActual = m.paradaActual as (rutaId: string) => Parada | null;
export const tramoActivoVista = m.tramoActivoVista as (r: Ruta) => {
  label: string; icono: string; origen: string; destino: string | null; trayecto: string; esReposo: boolean;
} | null;
export const etiquetaVehiculo = m.etiquetaVehiculo as (v: Vehiculo | null) => string;
export const conflictoConductor = m.conflictoConductor as (
  todas: RutaVista[], conductorId: string | null, fecha: Date, franja: string, excluirId?: string,
) => RutaVista | null;
export const generarLinkToken = m.generarLinkToken as () => string;
export const buscarMatricula = m.buscarMatricula as (q: string) => { exactas: Vehiculo[]; sugerida: Vehiculo | null };
export const fuzzyScore = m.fuzzyScore as (q: string, target: string) => number;
export const sugerirDirecciones = m.sugerirDirecciones as (q: string, limit?: number) => string[];
export const puedeEditar = m.puedeEditar as (estadoId: string, campo: string) => boolean;
export const esArrastrable = m.esArrastrable as (estadoId: string) => boolean;
export const aceptaDrop = m.aceptaDrop as (estadoId: string) => boolean;
export const colorDeKind = m.colorDeKind as (kind: EstadoCfg['kind'] | undefined | null) => string;
export const campanasPendientes = m.campanasPendientes as (lista?: Campana[]) => number;
export const historialInspeccionesVehiculo = m.historialInspeccionesVehiculo as (vehiculoId: string) => Date[];

export const HOY = m.HOY as Date;
export const at = m.at as (h: number, min: number, offsetDias?: number) => Date;
export const fmtHora = m.fmtHora as (d: Date) => string;
export const fmtDia = m.fmtDia as (d: Date | null) => string;
export const fmtDiaHora = m.fmtDiaHora as (d: Date | null) => string;
export const fmtDinero = m.fmtDinero as (n: number | null | undefined, sinDecimales?: boolean) => string;
export const fmtHoras = m.fmtHoras as (h: number) => string;
export const maskTel = m.maskTel as (t: string | null) => string;
export const maskDireccion = m.maskDireccion as (d: string | null) => string;
export const nombreCorto = m.nombreCorto as (n: string | null) => string;
export const nombreCliente1 = m.nombreCliente1 as (n: string | null) => string;

/* ------------------------- WhatsApp ------------------------- */

export interface ValoresMensaje {
  nombre: string;
  pendientes: string;
  sugeridos: string;
  vehiculo: string;
  matricula: string;
  importe: string;
  fecha: string;
  _total: number;
  _items: CampanaItem[];
}

export interface MensajeWa {
  id: string;
  dir: 'in' | 'out' | 'sistema';
  tipo: string;
  texto: string | null;
  ts: Date;
  estado: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | null;
  error?: number;
}

export interface CanalWa {
  optIn: 'IN' | 'OUT';
  mensajes: MensajeWa[];
}

export const WABA = w.WABA as { version: string; phoneNumberId: string; display: string; nombre: string };
export const MENSAJE = w.MENSAJE as { id: string; body: string; bodySoloPendientes: string; footer: string; respuestas: string[] };
export const MAX_CUERPO = w.MAX_CUERPO as number;
export const CANALES_SEED = w.CANALES_SEED as Record<string, CanalWa>;
export const RESPUESTAS_DEMO = w.RESPUESTAS_DEMO as string[];
export const ERRORES = w.ERRORES as Record<number, { titulo: string; detalle: string }>;
export const ESTADO_MENSAJE = w.ESTADO_MENSAJE as Record<string, { icono: string; color: string; label: string }>;
export const valoresOportunidad = w.valoresOportunidad as (
  o: Campana, seleccion: string[], overrides?: { nombre?: string; fecha?: string },
) => ValoresMensaje;
export const renderMensaje = w.renderMensaje as (valores: ValoresMensaje) => string;
export const detalleHallazgo = w.detalleHallazgo as (o: Campana, it: CampanaItem) => {
  titulo: string;
  tags: string[];
  movimientoTexto: string | null;
  fotos: { url: string; label: string }[];
  detalles: { label: string; valor: string; servicioId?: string }[];
};
export const enviar = w.enviar as (
  payload: unknown,
  opts?: { forzarError?: number; onEstado?: (id: string, estado: string) => void },
) => Promise<{ messages: { id: string }[] }>;
export const payloadRecordatorio = w.payloadRecordatorio as (to: string, valores: ValoresMensaje) => unknown;
export const payloadTexto = w.payloadTexto as (to: string, body: string) => unknown;
export const estadoVentana = w.estadoVentana as (
  ultimaEntrada: Date | null, ahora?: Date,
) => { abierta: boolean; restanteMs: number; etiqueta: string; detalle: string };
export const e164 = w.e164 as (tel: string | null, prefijo?: string) => string | null;
export const fmtTel = w.fmtTel as (tel: string | null) => string;
export const fmtReloj = w.fmtReloj as (d: Date | null) => string;
export const toISO = w.toISO as (d: Date) => string;
export const fromISO = w.fromISO as (s: string) => Date;
export const rangoFecha = w.rangoFecha as (base: Date) => { min: string; max: string };
export const ETIQUETA_ORIGEN = w.ETIQUETA_ORIGEN as Record<string, string>;
