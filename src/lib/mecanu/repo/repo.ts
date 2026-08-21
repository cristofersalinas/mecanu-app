/**
 * Mecanu — interfaz de acceso a datos (el "repo pattern").
 *
 * Este es el ÚNICO contrato que el resto de la app debe conocer para leer o escribir
 * datos de negocio. Ningún componente de `src/components/**` ni ninguna API route de
 * `src/app/api/**` debe importar `mecanu-rutas.ts`/`mecanu-data.ts`/`mecanu-whatsapp.ts`
 * directamente — todos pasan por un objeto que implementa `MecanuRepo`.
 *
 * Hoy la única implementación es `repo-mock.ts` (datos en memoria, ver ese archivo).
 * Sustituirla por Supabase es escribir un `repo-supabase.ts` nuevo que implemente esta
 * misma interfaz y cambiar un import en `repo/index.ts` — cero cambios en componentes,
 * cero cambios en API routes.
 *
 * Todo método es async a propósito, aunque el mock resuelva al instante: así el
 * contrato ya es el correcto para una base de datos real sin tener que tocarlo el
 * día que Supabase entre en juego.
 *
 * // TODO API: cuando exista backend real, cada método de escritura debe:
 *   1) validar el payload con el schema Zod correspondiente (ya definido en `types.ts`
 *      o en las rutas de `src/app/api/v1/*`),
 *   2) persistir en Postgres,
 *   3) escribir el LOG correspondiente (tabla `logs`, ver MODELO-DATOS.md),
 *   4) devolver la entidad actualizada.
 * El mock de hoy hace (3) y (4) pero no (1)/(2) porque no hay base de datos.
 */
import type {
  Actividad, AutomatizacionEjecucion, Campana, Cliente, Conductor, Inspeccion, Log, Parada, Presupuesto,
  ProcesoConductor, Ruta, RutaVista, Servicio, Solicitud, TagRuta, Tramo, UsuarioBackoffice, Vehiculo,
  EstadoUsuarioBackoffice,
} from '../types';
import type { SnapshotBackoffice } from '../backoffice';

/* ==============================================================
   Payloads de escritura
   Reflejan 1:1 los endpoints documentados en HANDOFF.md §7.2.
   ============================================================== */

export interface AsignarConductorInput {
  trasladoId: string;
  conductorId: string;
}

export interface CambiarSubestadoTramoInput {
  trasladoId: string;
  a: string;
  /** quién dispara el cambio — el backend real lo derivaría de la sesión autenticada */
  triggerSource: 'manual' | 'conductor' | 'api' | 'cron';
}

export interface CheckinInput {
  trasladoId: string;
  km: number;
  combustible: string;
  combustiblePct: number;
  limpieza: string;
  fotos: { slot: string; url: string }[];
  videoUrl: string | null;
  testigos: Record<string, boolean>;
  itemsInspeccion: Record<string, number>;
  ruedas: Record<string, number>;
  nota: string | null;
  notaVozUrl: string | null;
  firmaConductor: string | null;
}

export interface EntregaInput {
  trasladoId: string;
  fotos: { slot: string; url: string }[];
  /** obligatoria en devolución (rol vuelta), ausente en entrega en taller */
  firmaCliente: string | null;
}

export interface ConfirmacionInput {
  trasladoId: string;
  tipo: 'llegada_a_tiempo';
  nota: string | null;
  origen: 'conductor' | 'cliente' | 'api';
}

export interface SolicitudInput {
  trasladoId: string;
  rutaId: string;
  conductorId: string;
  tipo: Solicitud['tipo'];
  motivo: string;
  nota: string | null;
  ventanaActual: string | null;
  conflictoCon: string | null;
  evidenciaIds: string[];
}

export interface IncidenciaInput {
  trasladoId: string;
  tipo: 'siniestro';
  origen: 'conductor';
  detalle: string | null;
}

export interface HallazgoCampanaInput {
  rutaId: string;
  trasladoId: string;
  testigo: string;
  nivel: number;
  /** ITV: por qué se abre la oferta. El resto de testigos lo ignoran. */
  detalle?: 'sin_pegatina' | 'vencida' | 'por_vencer' | null;
  dias?: number | null;
}

export interface ReasignarConductorInput {
  tramoId: string;
  conductorId: string | null;
}

export interface CambiarEstadoPresupuestoInput {
  presupuestoId: string;
  estado: Presupuesto['estado'];
}

export interface CrearRutaDesdeCampanaInput {
  campanaId: string;
  modo: 'tal_cual' | 'editar_lineas' | 'solo_total';
  lineas?: { descripcion: string; importe: number; origen: string }[];
  tipoServicio: string;
  /** null = sin fecha → nace en Prospectos; con fecha → nace en Agendado */
  fecha: Date | null;
  franja: string | null;
}

export interface ActualizarTagsManualInput {
  rutaId: string;
  tagsManual: string[];
}

export interface CancelarRutaInput {
  rutaId: string;
  subestado: 'por_cliente' | 'por_taller' | 'fallido_origen' | 'fallido_ruta';
  /** obligatorio — regla dura del producto */
  motivo: string;
}

/* ==============================================================
   La interfaz
   ============================================================== */

export interface MecanuRepo {
  /* ---------- Lecturas: entidades base ---------- */
  listClientes(): Promise<Cliente[]>;
  getCliente(id: string): Promise<Cliente | null>;
  listVehiculos(): Promise<Vehiculo[]>;
  getVehiculo(id: string): Promise<Vehiculo | null>;
  listConductores(): Promise<Conductor[]>;
  getConductor(id: string): Promise<Conductor | null>;
  listServicios(): Promise<Servicio[]>;
  getServicio(id: string): Promise<Servicio | null>;

  /* ---------- Lecturas: logística ---------- */
  listRutas(): Promise<Ruta[]>;
  listRutasVista(): Promise<RutaVista[]>;
  getRuta(id: string): Promise<Ruta | null>;
  getRutaVista(id: string): Promise<RutaVista | null>;
  getParada(id: string): Promise<Parada | null>;
  listParadasDeRuta(rutaId: string): Promise<Parada[]>;
  getTramo(id: string): Promise<Tramo | null>;
  listTramosDeRuta(rutaId: string): Promise<Tramo[]>;
  getTramoActivo(rutaId: string): Promise<Tramo | null>;
  listLogsDeTramo(trasladoId: string): Promise<Log[]>;
  listActividadDeRuta(rutaId: string): Promise<Actividad[]>;
  listTagsDeRuta(rutaId: string, ahora?: number): Promise<TagRuta[]>;
  listRutasDeCliente(clienteId: string): Promise<RutaVista[]>;
  listRutasDeVehiculo(vehiculoId: string): Promise<RutaVista[]>;
  listRutasDeConductor(conductorId: string): Promise<RutaVista[]>;

  /* ---------- Lecturas: presupuestos y campañas ---------- */
  getPresupuesto(id: string): Promise<Presupuesto | null>;
  listCampanas(): Promise<Campana[]>;
  getCampana(id: string): Promise<Campana | null>;

  /* ---------- Lecturas: inspecciones ---------- */
  listInspeccionesDeRuta(rutaId: string): Promise<Inspeccion[]>;

  /* ---------- Lecturas: turno del conductor (app móvil) ---------- */
  /** `// TODO API: GET /api/conductores/:id/turno?dia=hoy` — hoy viene de `TURNO`/`POOL`
      hardcodeados en `src/components/conductor/constants.ts`, no de este repo. */
  getTurnoConductor(conductorId: string): Promise<{ trasladoIds: string[] }>;
  /** `// TODO API: GET /api/traslados/disponibles` — ver nota en la propia route sobre
      qué marca a un traslado como "disponible" (pregunta abierta, no modelada aún). */
  getTrasladosDisponibles(): Promise<{ trasladoIds: string[] }>;

  /* ---------- Escrituras: app del conductor ---------- */
  asignarConductor(input: AsignarConductorInput): Promise<Tramo>;
  cambiarSubestadoTramo(input: CambiarSubestadoTramoInput): Promise<Tramo>;
  checkin(input: CheckinInput): Promise<{ tramo: Tramo; inspeccion: Inspeccion }>;
  actualizarKmVehiculo(vehiculoId: string, km: number): Promise<Vehiculo>;
  registrarHallazgoCampana(input: HallazgoCampanaInput): Promise<Campana | null>;
  entregar(input: EntregaInput): Promise<Tramo>;
  registrarConfirmacion(input: ConfirmacionInput): Promise<void>;
  crearSolicitud(input: SolicitudInput): Promise<Solicitud>;
  registrarIncidencia(input: IncidenciaInput): Promise<void>;

  /* ---------- Escrituras: panel del taller ---------- */
  reasignarConductorTramo(input: ReasignarConductorInput): Promise<Tramo>;
  cambiarEstadoPresupuesto(input: CambiarEstadoPresupuestoInput): Promise<Presupuesto>;
  crearRutaDesdeCampana(input: CrearRutaDesdeCampanaInput): Promise<Ruta>;
  actualizarTagsManual(input: ActualizarTagsManualInput): Promise<Ruta>;
  cancelarRuta(input: CancelarRutaInput): Promise<Ruta>;

  /* ---------- Solicitudes del conductor: bandeja del taller ---------- */
  /** `HANDOFF.md §7.3` — entidad decidida pero no construida en el prototipo original.
      Aquí SÍ vive (en memoria) porque es infraestructura nueva que este bloque añade. */
  listSolicitudesPendientes(): Promise<Solicitud[]>;
  listSolicitudes(): Promise<Solicitud[]>;
  resolverSolicitud(id: string, resolucion: string, estado: Solicitud['estado']): Promise<Solicitud>;

  /* ---------- Backoffice (dueño / operación) ---------- */
  listUsuariosBackoffice(): Promise<UsuarioBackoffice[]>;
  getUsuarioBackoffice(id: string): Promise<UsuarioBackoffice | null>;
  invitarUsuarioBackoffice(actorId: string, input: {
    nombre: string; email: string; rol: UsuarioBackoffice['rol'];
    telefono?: string | null; conductorId?: string | null;
  }): Promise<UsuarioBackoffice>;
  transicionarUsuarioBackoffice(
    actorId: string, usuarioId: string, hacia: EstadoUsuarioBackoffice,
  ): Promise<UsuarioBackoffice>;
  transicionarProcesoConductor(
    actorId: string, conductorId: string, hacia: ProcesoConductor,
  ): Promise<Conductor>;
  getBackofficeSnapshot(actorId: string, ahora?: Date): Promise<SnapshotBackoffice>;
  ejecutarAutomatizacionesBackoffice(actorId: string, ahora?: Date): Promise<AutomatizacionEjecucion[]>;
}
