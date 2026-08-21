/**
 * Mecanu — fuente única de verdad de tipos y validación de datos.
 *
 * Todo lo que en producción vendría de la base de datos (Postgres/Supabase) está
 * declarado aquí como un schema Zod. El resto del código —la capa de modelo en
 * memoria (`mecanu-data.ts`/`mecanu-pipeline.ts`/`mecanu-rutas.ts`/`mecanu-whatsapp.ts`),
 * la interfaz de repositorio (`repo/repo.ts`) y las API routes (`src/app/api/v1/`)—
 * importa sus tipos de aquí, nunca los redeclara.
 *
 * Regla dura (ver AGENTS.md): un cambio de forma de una entidad se hace SOLO en
 * este archivo. Todo lo demás se re-tipa solo.
 */
import { z } from 'zod';

/* ==============================================================
   Primitivas y enums compartidos
   ============================================================== */

/** Fecha en memoria; en la API real viaja como ISO-8601 string y se parsea al leer. */
export const FechaSchema = z.date();

export const EstadoRutaSchema = z.enum([
  'prospectos', 'agendado', 'en_ruta', 'en_taller', 'completado', 'cancelado',
]);
export type EstadoRuta = z.infer<typeof EstadoRutaSchema>;

export const EstadoTramoSchema = z.enum(['sin_agenda', 'agendado', 'en_curso', 'completado', 'cancelado']);
export type EstadoTramo = z.infer<typeof EstadoTramoSchema>;

export const RolTramoSchema = z.enum(['ida', 'vuelta', 'interno']);
export type RolTramo = z.infer<typeof RolTramoSchema>;

export const VentanaModoSchema = z.enum(['slots_cliente', 'propuesta_taller', 'fija_taller']);
export type VentanaModo = z.infer<typeof VentanaModoSchema>;

export const ParadaTipoSchema = z.enum(['cliente', 'proveedor']);
export type ParadaTipo = z.infer<typeof ParadaTipoSchema>;

export const ParadaSubtipoSchema = z.enum(['taller', 'itv', 'chapista', 'otro']);
export type ParadaSubtipo = z.infer<typeof ParadaSubtipoSchema>;

export const LogTipoSchema = z.enum(['cambio_estado', 'gps', 'evidencia', 'comunicacion', 'incidencia', 'nota']);
export type LogTipo = z.infer<typeof LogTipoSchema>;

export const TriggerSourceSchema = z.enum(['manual', 'conductor', 'api', 'cron']);
export type TriggerSource = z.infer<typeof TriggerSourceSchema>;

export const OrigenLineaSchema = z.enum(['inspeccion', 'manual', 'traslado']);
export type OrigenLinea = z.infer<typeof OrigenLineaSchema>;

export const PresupuestoEstadoSchema = z.enum([
  'nueva', 'valorada', 'enviada', 'aceptada', 'rechazada', 'caducada',
]);
export type PresupuestoEstado = z.infer<typeof PresupuestoEstadoSchema>;

export const PresupuestoModoSchema = z.enum(['detallado', 'solo_total']);
export type PresupuestoModo = z.infer<typeof PresupuestoModoSchema>;

export const RedConductorSchema = z.enum(['Interna', 'Externo Mecanu']);
export type RedConductor = z.infer<typeof RedConductorSchema>;

export const ProcesoConductorSchema = z.enum(['documentos_pendientes', 'en_supervision', 'activo']);
export type ProcesoConductor = z.infer<typeof ProcesoConductorSchema>;

export const OrigenAgendaSchema = z.enum(['confirmado', 'estimado']);
export type OrigenAgenda = z.infer<typeof OrigenAgendaSchema>;

export const SeveridadInspeccionSchema = z.enum(['ok', 'warning', 'danger']);
export type SeveridadInspeccion = z.infer<typeof SeveridadInspeccionSchema>;

export const TipoInspeccionSchema = z.enum(['check-in', 'check-out']);
export type TipoInspeccion = z.infer<typeof TipoInspeccionSchema>;

export const EstadoMensajeWaSchema = z.enum(['pending', 'sent', 'delivered', 'read', 'failed']);
export type EstadoMensajeWa = z.infer<typeof EstadoMensajeWaSchema>;

/** Columnas del kanban de tareas (Tablero → Tareas). No es el kanban de rutas.
    La card no avanza por arrastre: Pendiente → Hecho solo al cerrar el hueco. */
export const ColumnaTareaPipelineSchema = z.enum(['pendiente', 'hecho', 'cancelado']);
export type ColumnaTareaPipeline = z.infer<typeof ColumnaTareaPipelineSchema>;

export const ViaCierreTareaSchema = z.enum(['accion', 'archivada', 'cancelada']);
export type ViaCierreTarea = z.infer<typeof ViaCierreTareaSchema>;

/* ==============================================================
   Entidades base
   ============================================================== */

export const ClienteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  tipo: z.enum(['Particular', 'Empresa']),
  telefono: z.string(),
  email: z.string(),
  direccion: z.string(),
  desde: FechaSchema,
});
export type Cliente = z.infer<typeof ClienteSchema>;

export const UsuarioVehiculoSchema = z.object({
  clienteId: z.string(),
  relacion: z.string(),
  principal: z.boolean(),
});
export type UsuarioVehiculo = z.infer<typeof UsuarioVehiculoSchema>;

export const VehiculoSchema = z.object({
  id: z.string(),
  marca: z.string(),
  modelo: z.string(),
  anio: z.number().int(),
  matricula: z.string(),
  km: z.number().int().nonnegative(),
  color: z.string(),
  usuarios: z.array(UsuarioVehiculoSchema),
});
export type Vehiculo = z.infer<typeof VehiculoSchema>;

export const IncidenciaConductorSchema = z.object({
  fecha: FechaSchema,
  tipo: z.string(),
  gravedad: z.string(),
  detalle: z.string(),
});
export type IncidenciaConductor = z.infer<typeof IncidenciaConductorSchema>;

export const ConductorDocsSchema = z.object({
  dni: z.boolean(),
  carnet: z.boolean(),
  iban: z.boolean(),
  seguro: z.boolean(),
});

export const ConductorSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  telefono: z.string(),
  red: RedConductorSchema,
  furgoneta: z.string(),
  proceso: ProcesoConductorSchema,
  supervisados: z.number().int(),
  requeridos: z.number().int(),
  alta: FechaSchema,
  calificacion: z.number().min(0).max(5),
  valoraciones: z.number().int().nonnegative(),
  docs: ConductorDocsSchema,
  incidencias: z.array(IncidenciaConductorSchema),
});
export type Conductor = z.infer<typeof ConductorSchema>;

export const ServicioSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  categoria: z.string(),
  horas: z.number().positive(),
  manoObra: z.number().nonnegative(),
  materiales: z.number().nonnegative(),
  aplica: z.array(z.string()),
  garantia: z.string(),
  notas: z.string(),
  /** manoObra + materiales, sin IVA */
  total: z.number().nonnegative(),
  /** total * (1 + IVA), redondeado a céntimos */
  totalIva: z.number().nonnegative(),
});
export type Servicio = z.infer<typeof ServicioSchema>;

/* ==============================================================
   Ruta / Parada / Traslado / Log — el núcleo del modelo de logística
   ============================================================== */

export const ParadaServicioSchema = z.object({
  descripcion: z.string(),
  presupuestoId: z.string(),
});

export const ParadaSchema = z.object({
  id: z.string(),
  rutaId: z.string(),
  orden: z.number().int().positive(),
  tipo: ParadaTipoSchema,
  subtipo: ParadaSubtipoSchema.nullable(),
  etiqueta: z.string(),
  direccion: z.string().nullable(),
  /** derivado de `direccion` vía geocoder — nunca se persiste como dato propio */
  localidad: z.string().nullable(),
  sublocalidad: z.string().nullable(),
  servicios: z.array(ParadaServicioSchema),
  llegadaReal: FechaSchema.nullable(),
  salidaReal: FechaSchema.nullable(),
});
export type Parada = z.infer<typeof ParadaSchema>;

export const VentanaSchema = z.object({
  fecha: FechaSchema,
  /** "HH:MM" */
  inicio: z.string(),
  /** "HH:MM" — siempre inicio + 1h, nunca hora exacta suelta */
  fin: z.string(),
});
export type Ventana = z.infer<typeof VentanaSchema>;

export const TramoSchema = z.object({
  id: z.string(),
  rutaId: z.string(),
  orden: z.number().int().positive(),
  rol: RolTramoSchema,
  paradaOrigenId: z.string().nullable(),
  paradaDestinoId: z.string().nullable(),
  conductorId: z.string().nullable(),
  ventana: VentanaSchema.nullable(),
  /** REVISAR: ubicación provisional — ventana tentativa de un prospecto, se mudaría a OFERTA */
  ventanaPropuesta: VentanaSchema.nullable(),
  ventanaModo: VentanaModoSchema.nullable(),
  clienteConfirmo: z.boolean().nullable(),
  estado: EstadoTramoSchema,
  /** solo se rellena mientras `estado === 'en_curso'`; refleja el subestado EN_RUTA de la ruta */
  subestado: z.string().nullable(),
  seguro: z.boolean(),
  importe: z.number().nonnegative(),
  reprogramaciones: z.number().int().nonnegative(),
  comunicaAlCliente: z.boolean(),
});
export type Tramo = z.infer<typeof TramoSchema>;

export const LogPayloadSchema = z.object({
  a: z.string().optional(),
  texto: z.string().optional(),
  /** nullable: los logs de comunicación guardan aquí la franja, que puede no existir */
  detalle: z.string().nullable().optional(),
  /** nullable: se copia de `ruta.motivo`, que es nullable */
  motivo: z.string().nullable().optional(),
  canal: z.string().optional(),
  tipoEvidencia: z.string().optional(),
  rutaId: z.string().optional(),
}).nullable();

export const LogSchema = z.object({
  id: z.string(),
  trasladoId: z.string(),
  tipo: LogTipoSchema,
  ts: FechaSchema,
  actor: z.string(),
  triggerSource: TriggerSourceSchema,
  payload: LogPayloadSchema,
});
export type Log = z.infer<typeof LogSchema>;

export const LineaPresupuestoSchema = z.object({
  descripcion: z.string(),
  importe: z.number(),
  origen: OrigenLineaSchema,
  servicioTemparioId: z.string().nullable(),
});
export type LineaPresupuesto = z.infer<typeof LineaPresupuestoSchema>;

export const PresupuestoSchema = z.object({
  id: z.string(),
  campanaId: z.string().nullable(),
  vehiculoId: z.string().nullable(),
  rutaOrigenId: z.string().nullable(),
  rutaGeneradaId: z.string().nullable(),
  modo: PresupuestoModoSchema,
  lineas: z.array(LineaPresupuestoSchema),
  estado: PresupuestoEstadoSchema,
  /** el total SIEMPRE incluye la línea de traslado — decisión cerrada, ver CLAUDE.md */
  ivaIncluido: z.boolean(),
  creado: FechaSchema.nullable(),
  actualizado: FechaSchema.nullable(),
  total: z.number(),
});
export type Presupuesto = z.infer<typeof PresupuestoSchema>;

export const RutaSchema = z.object({
  id: z.string(),
  vehiculoId: z.string().nullable(),
  clienteId: z.string().nullable(),
  perfilServicio: z.string(),
  modeloPrecio: z.string(),
  precioTotal: z.number().nonnegative(),
  estado: EstadoRutaSchema,
  subestado: z.string(),
  /** tags manuales del taller, persistidos. Los derivados NUNCA se persisten — se calculan. */
  tagsManual: z.array(z.string()),
  clienteTieneAuto: z.boolean().nullable(),
  /** REVISAR: ubicación provisional — alimenta el tag `entrega_en_riesgo` */
  vehiculoListo: z.boolean().nullable(),
  campanaOrigenId: z.string().nullable(),
  presupuestoId: z.string(),
  motivo: z.string().nullable(),
  canceladaEn: FechaSchema.nullable(),
  /** REVISAR: ubicación provisional — resumen de COMPLETADO.con_incidencia */
  incidencia: z.string().nullable(),
  /** REVISAR: ubicación provisional — se mudaría a una entidad OFERTA */
  matriculaLead: z.string().nullable(),
  linkToken: z.string().nullable(),
  linkEnviadoEn: FechaSchema.nullable(),
  creadaEn: FechaSchema,
});
export type Ruta = z.infer<typeof RutaSchema>;

/** Fachada de lectura (`vistaRuta()`): lo que el kanban, la tabla y los KPIs consumen.
    Nunca se persiste tal cual — se deriva de Ruta + Tramo activo + Parada + Presupuesto. */
export const RutaVistaSchema = RutaSchema.extend({
  tramoActivoId: z.string().nullable(),
  paradaOrigen: ParadaSchema.nullable(),
  paradaDestino: ParadaSchema.nullable(),
  etiquetaOrigen: z.string().nullable(),
  etiquetaDestino: z.string().nullable(),
  direccionOrigen: z.string().nullable(),
  direccionDestino: z.string().nullable(),
  direccion: z.string().nullable(),
  conductorId: z.string().nullable(),
  fecha: FechaSchema.nullable(),
  fechaPropuesta: FechaSchema.nullable(),
  franja: z.string().nullable(),
  franjaPropuesta: z.string().nullable(),
  ventanaModo: VentanaModoSchema.nullable(),
  seguro: z.boolean(),
  reprogramaciones: z.number().int().nonnegative(),
  descripcionServicio: z.string(),
  presupuesto: PresupuestoSchema.nullable(),
  importe: z.number().nullable(),
});
export type RutaVista = z.infer<typeof RutaVistaSchema>;

export const TagRutaSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
  emoji: z.string().optional(),
  /** true = calculado por el sistema, no editable, no se persiste. false = persiste en `ruta.tagsManual`. */
  derivado: z.boolean(),
});
export type TagRuta = z.infer<typeof TagRutaSchema>;

export const ActividadSchema = z.object({
  id: z.string(),
  fecha: FechaSchema,
  tipo: z.string(),
  actor: z.string(),
  triggerSource: z.string(),
  label: z.string(),
  detalle: z.string().nullable(),
  /** opcional: se copia de `log.payload.tipoEvidencia`, que solo traen los logs de evidencia */
  tipoEvidencia: z.string().nullable().optional(),
  trasladoId: z.string(),
});
export type Actividad = z.infer<typeof ActividadSchema>;

/* ==============================================================
   Inspección (check-in / check-out del conductor)
   ============================================================== */

export const HallazgoInspeccionSchema = z.object({
  categoria: z.string(),
  item: z.string(),
  metrica: z.string(),
  severidad: SeveridadInspeccionSchema,
  prediccion: z.string(),
  vida: z.string(),
  cambio: z.string(),
  servicio: z.object({ nombre: z.string(), precio: z.number() }).nullable(),
  foto: z.string().nullable(),
  fotoUrl: z.string().nullable(),
});
export type HallazgoInspeccion = z.infer<typeof HallazgoInspeccionSchema>;

export const DanoInspeccionSchema = z.object({
  zona: z.string(),
  tipo: z.string(),
  descripcion: z.string(),
  ubicacion: z.string(),
  foto: z.string().nullable(),
  /** derivado de `foto` al leer: el daño que cuelga de `zonas[]` es el crudo y no lo trae */
  fotoUrl: z.string().nullable().optional(),
});
export type DanoInspeccion = z.infer<typeof DanoInspeccionSchema>;

export const InspeccionVehiculoSchema = z.object({
  matricula: z.string(),
  modelo: z.string(),
  vin: z.string(),
  km: z.number().int().nonnegative(),
  combustible: z.string(),
  combustiblePct: z.number().min(0).max(100),
});

export const InspeccionSchema = z.object({
  id: z.string(),
  tipo: TipoInspeccionSchema,
  rutaId: z.string(),
  trasladoId: z.string().nullable(),
  fecha: FechaSchema,
  inspector: z.string(),
  inspectorNombre: z.string(),
  sede: z.string(),
  km: z.number().int().nonnegative(),
  combustible: z.string(),
  combustiblePct: z.number().min(0).max(100),
  limpieza: z.string(),
  vehiculo: InspeccionVehiculoSchema,
  itv: z.object({ estado: z.string(), vence: z.array(z.number()) }),
  itvVence: FechaSchema,
  zonas: z.array(z.object({ zona: z.string(), dano: DanoInspeccionSchema.nullable() })),
  danos: z.array(DanoInspeccionSchema),
  hallazgos: z.array(HallazgoInspeccionSchema),
  firmas: z.object({ cliente: z.string().nullable(), conductor: z.string().nullable() }),
});
export type Inspeccion = z.infer<typeof InspeccionSchema>;

/* ==============================================================
   Campañas (upsell) — el presupuesto vive aquí, fuente única
   ============================================================== */

export const CampanaItemSchema = z.object({
  id: z.string(),
  tipo: z.string(),
  origen: OrigenAgendaSchema,
  dias: z.number(),
  falla: z.string(),
  registroIdx: z.number().int().nonnegative(),
  datos: z.record(z.string(), z.union([z.string(), z.number()])),
  etiqueta: z.string(),
  servicio: ServicioSchema.nullable(),
  valor: z.number().nonnegative(),
  fecha: FechaSchema,
});
export type CampanaItem = z.infer<typeof CampanaItemSchema>;

export const CampanaSchema = z.object({
  id: z.string(),
  clienteId: z.string().nullable(),
  vehiculoId: z.string().nullable(),
  rutaOrigenId: z.string().nullable(),
  rutaGeneradaId: z.string().nullable(),
  inspeccionId: z.string().nullable(),
  items: z.array(CampanaItemSchema),
  tipos: z.array(z.string()),
  etiquetas: z.array(z.string()),
  falla: z.string(),
  evidencia: z.string(),
  valor: z.number().nonnegative(),
  servicio: ServicioSchema.nullable(),
  urgente: z.boolean(),
  severidad: z.string(),
  fecha: FechaSchema,
  habito: z.string(),
  motivoFecha: z.string(),
  /** nullable: una campaña creada desde un check-in hereda la foto del hallazgo, que puede no tenerla */
  fotoUrl: z.string().nullable(),
  estadoEnvio: z.string(),
  presupuestoId: z.string(),
  presupuesto: PresupuestoSchema,
  estado: PresupuestoEstadoSchema,
  origenAutomatico: z.boolean(),
});
export type Campana = z.infer<typeof CampanaSchema>;

/* ==============================================================
   WhatsApp (recordatorio de campaña)
   ============================================================== */

export const MensajeWaSchema = z.object({
  id: z.string(),
  dir: z.enum(['in', 'out', 'sistema']),
  tipo: z.string(),
  texto: z.string().nullable(),
  ts: FechaSchema,
  /** opcional: los mensajes de sistema (avisos de la propia app) no tienen estado de entrega */
  estado: EstadoMensajeWaSchema.nullable().optional(),
  error: z.number().optional(),
});
export type MensajeWa = z.infer<typeof MensajeWaSchema>;

export const CanalWaSchema = z.object({
  optIn: z.enum(['IN', 'OUT']),
  mensajes: z.array(MensajeWaSchema),
});
export type CanalWa = z.infer<typeof CanalWaSchema>;

/* ==============================================================
   Solicitudes del conductor al taller — decidida, no construida (ver HANDOFF.md §7.3)
   Documentada aquí porque el backend la necesita desde el día uno: hoy solo vive
   como estado local de la app del conductor.
   ============================================================== */

export const TipoSolicitudSchema = z.enum(['reagenda', 'rechazo', 'fallido_origen', 'no_rodante']);
export type TipoSolicitud = z.infer<typeof TipoSolicitudSchema>;

export const EstadoSolicitudSchema = z.enum([
  'pendiente', 'resuelta_reagenda', 'resuelta_reasignada', 'resuelta_cancelada', 'descartada',
]);
export type EstadoSolicitud = z.infer<typeof EstadoSolicitudSchema>;

export const SolicitudSchema = z.object({
  id: z.string(),
  trasladoId: z.string(),
  rutaId: z.string(),
  conductorId: z.string(),
  tipo: TipoSolicitudSchema,
  motivo: z.string(),
  nota: z.string().nullable(),
  ts: FechaSchema,
  estado: EstadoSolicitudSchema,
  resolucion: z.string().nullable(),
  resueltaEn: FechaSchema.nullable(),
});
export type Solicitud = z.infer<typeof SolicitudSchema>;

/* ==============================================================
   Backoffice — usuarios internos, alertas y log de automatizaciones
   El cliente del taller no es un usuario de esta superficie (WhatsApp / link).
   ============================================================== */

export const RolBackofficeSchema = z.enum(['dueno', 'operacion', 'conductor']);
export type RolBackoffice = z.infer<typeof RolBackofficeSchema>;

export const EstadoUsuarioBackofficeSchema = z.enum(['invitado', 'activo', 'suspendido', 'baja']);
export type EstadoUsuarioBackoffice = z.infer<typeof EstadoUsuarioBackofficeSchema>;

export const AccionBackofficeSchema = z.enum([
  'ver_backoffice',
  'resolver_solicitud',
  'asignar_conductor',
  'gestionar_usuarios',
  'ejecutar_automatizaciones',
  'cambiar_proceso_conductor',
]);
export type AccionBackoffice = z.infer<typeof AccionBackofficeSchema>;

export const UsuarioBackofficeSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  email: z.string(),
  telefono: z.string().nullable(),
  rol: RolBackofficeSchema,
  estado: EstadoUsuarioBackofficeSchema,
  /** si rol=conductor, apunta a Conductor.id — un conductor sin usuario no entra al PWA */
  conductorId: z.string().nullable(),
  invitadEn: FechaSchema,
  activadoEn: FechaSchema.nullable(),
});
export type UsuarioBackoffice = z.infer<typeof UsuarioBackofficeSchema>;

export const SeveridadAlertaSchema = z.enum(['critica', 'alta', 'media', 'info']);
export type SeveridadAlerta = z.infer<typeof SeveridadAlertaSchema>;

export const AlertaOperativaSchema = z.object({
  id: z.string(),
  severidad: SeveridadAlertaSchema,
  titulo: z.string(),
  detalle: z.string(),
  entidadTipo: z.string(),
  entidadId: z.string(),
  reglaId: z.string(),
  abiertaDesde: FechaSchema,
});
export type AlertaOperativa = z.infer<typeof AlertaOperativaSchema>;

export const AutomatizacionEjecucionSchema = z.object({
  id: z.string(),
  reglaId: z.string(),
  ts: FechaSchema,
  entidadId: z.string(),
  resultado: z.string(),
  idempotencyKey: z.string(),
});
export type AutomatizacionEjecucion = z.infer<typeof AutomatizacionEjecucionSchema>;
