/**
 * Implementación mock de `MecanuRepo`: envuelve la capa de modelo en memoria
 * (`mecanu-rutas.ts`, `mecanu-data.ts`, `mecanu-whatsapp.ts`) con la interfaz async
 * que usará el backend real. No hay base de datos: las escrituras mutan arrays en
 * memoria del proceso y se pierden en cada redeploy — eso es correcto para un mock.
 *
 * Sustituir esto por Supabase: crear `repo-supabase.ts` implementando `MecanuRepo`
 * y cambiar el import en `./index.ts`. Nada más debería cambiar.
 *
 * `mecanu-rutas.ts` es JavaScript sin tipos propios más allá de lo que TS puede
 * inferir; aquí se estrecha una sola vez contra `types.ts`, igual que ya hacían
 * `src/components/taller/data.ts` y `src/components/conductor/data.ts` (que ahora
 * deberían pasar a consumir este repo en vez de importar `mecanu-rutas.ts` directo).
 */
import * as M from '../mecanu-rutas';
import * as W from '../mecanu-whatsapp';
import { crearRutaDesdeCampana as construirRutaDesdeCampana } from '../crear-ruta-desde-campana';
import { cliente as lookupCliente } from '../mecanu-data';
import type {
  Actividad, AutomatizacionEjecucion, Campana, Cliente, Conductor, Inspeccion, Log, Parada, Presupuesto,
  Ruta, RutaVista, Servicio, Solicitud, TagRuta, Tramo, UsuarioBackoffice, Vehiculo,
} from '../types';
import {
  aplicarAutomatizaciones, buildSnapshot, conflictoAlAsignar, invitarUsuario, puede,
  proponerAutomatizaciones, transicionarProceso, transicionarUsuario,
} from '../backoffice';
import type { MundoBackoffice } from '../backoffice';
import type {
  AsignarConductorInput, CambiarEstadoPresupuestoInput, CambiarSubestadoTramoInput,
  CancelarRutaInput, CheckinInput, ConfirmacionInput, CrearRutaDesdeCampanaInput,
  EntregaInput, HallazgoCampanaInput, IncidenciaInput, MecanuRepo,
  ReasignarConductorInput, SolicitudInput,
} from './repo';

/* El modelo es JS sin tipos: se estrecha una sola vez, aquí — mismo patrón que
   `src/components/taller/data.ts` / `src/components/conductor/data.ts`. */
const m = M as unknown as {
  CLIENTES: Cliente[];
  VEHICULOS: Vehiculo[];
  CONDUCTORES: Conductor[];
  SERVICIOS: Servicio[];
  RUTAS: Ruta[];
  RUTAS_VISTA: RutaVista[];
  CAMPANAS: Campana[];
  cliente: (id: string) => Cliente | null;
  vehiculo: (id: string) => Vehiculo | null;
  conductor: (id: string) => Conductor | null;
  servicio: (id: string) => Servicio | null;
  ruta: (id: string) => Ruta | null;
  rutaVista: (id: string) => RutaVista | null;
  tramo: (id: string) => Tramo | null;
  parada: (id: string) => Parada | null;
  presupuesto: (id: string) => Presupuesto | null;
  campana: (id: string) => Campana | null;
  paradasDeRuta: (rutaId: string) => Parada[];
  tramosDeRuta: (rutaId: string) => Tramo[];
  tramoActivo: (rutaId: string) => Tramo | null;
  logsDeTramo: (trasladoId: string) => Log[];
  actividadDeRuta: (rutaId: string) => Actividad[];
  tagsDeRuta: (r: Ruta, ahora?: number) => TagRuta[];
  rutasDeCliente: (id: string) => RutaVista[];
  rutasDeVehiculo: (id: string) => RutaVista[];
  rutasDeConductor: (id: string) => RutaVista[];
  inspeccionesDeRuta: (rutaId: string) => Inspeccion[];
  TRASLADOS: Tramo[];
  LOGS: Log[];
  PARADAS: Parada[];
  PRESUPUESTOS: Presupuesto[];
  campanaDesdeItvCheckin: (input: {
    rutaId: string;
    motivo: 'sin_pegatina' | 'vencida' | 'por_vencer';
    dias: number | null;
  }) => Campana | null;
};

const w = W as unknown as {
  campanaDesdeInspeccion?: (insp: unknown, rutaId: string) => Campana | null;
};
void w;

let logSeq = 90000; // por encima de los ids sembrados (LG-0001..LG-0290 aprox) para no colisionar
function nuevoLog(trasladoId: string, tipo: Log['tipo'], actor: string, triggerSource: Log['triggerSource'], payload: Log['payload']): Log {
  const log: Log = { id: `LG-M${++logSeq}`, trasladoId, tipo, ts: new Date(), actor, triggerSource, payload };
  m.LOGS.push(log);
  return log;
}

function requireTramo(id: string): Tramo {
  const t = m.tramo(id);
  if (!t) throw new Error(`Tramo ${id} no encontrado`);
  return t;
}

function requireRuta(id: string): Ruta {
  const r = m.ruta(id);
  if (!r) throw new Error(`Ruta ${id} no encontrada`);
  return r;
}

/* -- Solicitudes del conductor: HANDOFF.md §7.3, entidad decidida pero no construida
   en el prototipo original. Vive en memoria aquí porque es infraestructura nueva. -- */
const SOLICITUDES: Solicitud[] = [];
let solicitudSeq = 0;

const USUARIOS: UsuarioBackoffice[] = [];
const EJECUCIONES: AutomatizacionEjecucion[] = [];

function sembrarBackoffice() {
  if (USUARIOS.length > 0) return;
  const alta = new Date();
  USUARIOS.push(
    {
      id: 'u-dueno', nombre: 'Cristofer Salinas', email: 'crist@mecanu.com',
      telefono: null, documento: '00000000T', rol: 'dueno', estado: 'activo', conductorId: null,
      invitadEn: alta, activadoEn: alta,
    },
    {
      id: 'u-op', nombre: 'Rubén Ortega', email: 'ruben@talleres.es',
      telefono: '910 220 900', documento: '12345678Z', rol: 'operacion', estado: 'activo', conductorId: null,
      invitadEn: alta, activadoEn: alta,
    },
    ...m.CONDUCTORES.map((c, i) => ({
      id: `u-${c.id}`,
      nombre: c.nombre,
      email: `${c.id}@conductores.mecanu.com`,
      telefono: c.telefono,
      documento: `${10000000 + i}A`,
      rol: 'conductor' as const,
      estado: 'activo' as const,
      conductorId: c.id,
      invitadEn: c.alta,
      activadoEn: c.alta,
    })),
  );

  const enCurso = m.TRASLADOS.find((t) => t.estado === 'en_curso') ?? m.TRASLADOS[0];
  const hueco = m.TRASLADOS.find((t) => t.estado === 'agendado' && !t.conductorId);
  if (enCurso) {
    SOLICITUDES.push({
      id: 'SOL-0001',
      trasladoId: enCurso.id,
      rutaId: enCurso.rutaId,
      conductorId: enCurso.conductorId ?? 'd1',
      tipo: 'no_rodante',
      motivo: 'Testigo de aceite en rojo: el vehículo no debe rodar',
      nota: 'Esperando respuesta del taller',
      ts: new Date(Date.now() - 22 * 60000),
      estado: 'pendiente',
      resolucion: null,
      resueltaEn: null,
    });
    solicitudSeq = 1;
  }
  if (hueco) {
    SOLICITUDES.push({
      id: 'SOL-0002',
      trasladoId: hueco.id,
      rutaId: hueco.rutaId,
      conductorId: 'd1',
      tipo: 'reagenda',
      motivo: 'Ventana imposible: el cliente no está',
      nota: null,
      ts: new Date(Date.now() - 8 * 60000),
      estado: 'pendiente',
      resolucion: null,
      resueltaEn: null,
    });
    solicitudSeq = 2;
  }
}
sembrarBackoffice();

function requireActor(actorId: string): UsuarioBackoffice {
  const u = USUARIOS.find((x) => x.id === actorId);
  if (!u) throw new Error(`Usuario ${actorId} no encontrado`);
  if (u.estado !== 'activo') throw new Error('Tu usuario no está activo');
  return u;
}

function mundoAhora(ahora: Date): MundoBackoffice {
  return {
    ahora,
    rutas: m.RUTAS_VISTA,
    tramos: m.TRASLADOS,
    logs: m.LOGS,
    campanas: m.CAMPANAS,
    presupuestos: m.PRESUPUESTOS,
    conductores: m.CONDUCTORES,
    solicitudes: SOLICITUDES,
    usuarios: USUARIOS,
    ejecuciones: EJECUCIONES,
  };
}

/* -- Bolsa de "disponibles": ver TODO en la propia API route — no hay campo real en
   el modelo hoy, así que exponemos los ids que ya no tienen conductor asignado y
   siguen en agendado como aproximación razonable del mock. -- */
function calcularDisponibles(): string[] {
  return m.TRASLADOS
    .filter((t) => t.estado === 'agendado' && !t.conductorId)
    .map((t) => t.id);
}

export const mockRepo: MecanuRepo = {
  async listClientes() { return m.CLIENTES; },
  async getCliente(id) { return m.cliente(id); },
  async listVehiculos() { return m.VEHICULOS; },
  async getVehiculo(id) { return m.vehiculo(id); },
  async listConductores() { return m.CONDUCTORES; },
  async getConductor(id) { return m.conductor(id); },
  async listServicios() { return m.SERVICIOS; },
  async getServicio(id) { return m.servicio(id); },

  async listRutas() { return m.RUTAS; },
  async listRutasVista() { return m.RUTAS_VISTA; },
  async getRuta(id) { return m.ruta(id); },
  async getRutaVista(id) { return m.rutaVista(id); },
  async getParada(id) { return m.parada(id); },
  async listParadasDeRuta(rutaId) { return m.paradasDeRuta(rutaId); },
  async getTramo(id) { return m.tramo(id); },
  async listTramosDeRuta(rutaId) { return m.tramosDeRuta(rutaId); },
  async getTramoActivo(rutaId) { return m.tramoActivo(rutaId); },
  async listLogsDeTramo(trasladoId) { return m.logsDeTramo(trasladoId); },
  async listActividadDeRuta(rutaId) { return m.actividadDeRuta(rutaId); },
  async listTagsDeRuta(rutaId, ahora) {
    const r = m.ruta(rutaId);
    return r ? m.tagsDeRuta(r, ahora) : [];
  },
  async listRutasDeCliente(clienteId) { return m.rutasDeCliente(clienteId); },
  async listRutasDeVehiculo(vehiculoId) { return m.rutasDeVehiculo(vehiculoId); },
  async listRutasDeConductor(conductorId) { return m.rutasDeConductor(conductorId); },

  async getPresupuesto(id) { return m.presupuesto(id); },
  async listCampanas() { return m.CAMPANAS; },
  async getCampana(id) { return m.campana(id); },

  async listInspeccionesDeRuta(rutaId) { return m.inspeccionesDeRuta(rutaId); },

  async getTurnoConductor() {
    // `TURNO`/`POOL` del conductor hoy viven hardcodeados en
    // `src/components/conductor/constants.ts` (offsets relativos a "ahora"), no en
    // este repo — ver PREGUNTAS-ABIERTAS.md. Este método existe para documentar la
    // forma del endpoint futuro; hoy devuelve todos los tramos del conductor d1.
    const rutas = m.rutasDeConductor('d1');
    const ids = rutas.flatMap((r) => m.tramosDeRuta(r.id).filter((t) => t.conductorId === 'd1').map((t) => t.id));
    return { trasladoIds: ids };
  },
  async getTrasladosDisponibles() {
    return { trasladoIds: calcularDisponibles() };
  },

  async asignarConductor({ trasladoId, conductorId }: AsignarConductorInput) {
    const t = requireTramo(trasladoId);
    const check = conflictoAlAsignar(mundoAhora(new Date()), t, conductorId);
    if (!check.ok) throw new Error(check.motivo);
    t.conductorId = conductorId;
    nuevoLog(trasladoId, 'cambio_estado', conductorId, 'conductor', { texto: `Conductor asignado: ${conductorId}` });
    return t;
  },

  async cambiarSubestadoTramo({ trasladoId, a, triggerSource }: CambiarSubestadoTramoInput) {
    const t = requireTramo(trasladoId);
    t.subestado = a;
    if (a === 'en_destino') t.estado = 'en_curso';
    nuevoLog(trasladoId, 'cambio_estado', triggerSource === 'conductor' ? (t.conductorId ?? 'conductor') : 'Sistema', triggerSource, { a, texto: `Subestado → ${a}` });
    return t;
  },

  async checkin({ trasladoId, ...evidencia }: CheckinInput) {
    const t = requireTramo(trasladoId);
    nuevoLog(trasladoId, 'evidencia', t.conductorId ?? 'conductor', 'conductor', {
      texto: 'Check-in con fotos, testigos e inspección', tipoEvidencia: 'check-in',
    });
    const r = m.RUTAS.find((x) => m.tramosDeRuta(x.id).some((tr) => tr.id === trasladoId));
    const inspecciones = r ? m.inspeccionesDeRuta(r.id) : [];
    const inspeccion = inspecciones[inspecciones.length - 1] ?? null;
    if (!inspeccion) {
      throw new Error('El mock no genera inspecciones nuevas dinámicamente — ver PREGUNTAS-ABIERTAS.md');
    }
    void evidencia;
    return { tramo: t, inspeccion };
  },

  async actualizarKmVehiculo(vehiculoId, km) {
    const v = m.vehiculo(vehiculoId);
    if (!v) throw new Error(`Vehículo ${vehiculoId} no encontrado`);
    v.km = km;
    return v;
  },

  async registrarHallazgoCampana({ rutaId, trasladoId, testigo, nivel, detalle, dias }: HallazgoCampanaInput) {
    nuevoLog(trasladoId, 'incidencia', 'conductor', 'conductor', {
      texto: `Hallazgo: ${testigo} nivel ${nivel}`, rutaId,
      detalle: detalle ?? undefined,
    });
    if (testigo !== 'itv') {
      // El resto de testigos ámbar sigue sin catálogo testigo→servicio. Ver PREGUNTAS-ABIERTAS.md #5.
      return null;
    }
    const motivo = detalle === 'sin_pegatina' || detalle === 'vencida' || detalle === 'por_vencer'
      ? detalle
      : 'vencida';
    return m.campanaDesdeItvCheckin({ rutaId, motivo, dias: dias ?? null });
  },

  async entregar({ trasladoId, firmaCliente }: EntregaInput) {
    const t = requireTramo(trasladoId);
    t.estado = 'completado';
    nuevoLog(trasladoId, 'evidencia', t.conductorId ?? 'conductor', 'conductor', {
      texto: firmaCliente ? 'Entrega con firma del cliente' : 'Entrega en taller', tipoEvidencia: 'check-out',
    });
    return t;
  },

  async registrarConfirmacion({ trasladoId, nota }: ConfirmacionInput) {
    nuevoLog(trasladoId, 'comunicacion', 'Cliente', 'api', { texto: 'Confirmación de llegada a tiempo', detalle: nota ?? undefined });
  },

  async crearSolicitud(input: SolicitudInput) {
    const s: Solicitud = {
      id: `SOL-${String(++solicitudSeq).padStart(4, '0')}`,
      trasladoId: input.trasladoId,
      rutaId: input.rutaId,
      conductorId: input.conductorId,
      tipo: input.tipo,
      motivo: input.motivo,
      nota: input.nota,
      ts: new Date(),
      estado: 'pendiente',
      resolucion: null,
      resueltaEn: null,
    };
    SOLICITUDES.push(s);
    nuevoLog(input.trasladoId, 'comunicacion', input.conductorId, 'conductor', { texto: `Solicitud: ${input.tipo}`, motivo: input.motivo });
    return s;
  },

  async registrarIncidencia({ trasladoId, detalle }: IncidenciaInput) {
    const t = requireTramo(trasladoId);
    t.estado = 'cancelado'; // "congela" el tramo — decisión de mock: cancelado bloquea avance
    nuevoLog(trasladoId, 'incidencia', t.conductorId ?? 'conductor', 'conductor', { texto: 'Siniestro reportado', detalle: detalle ?? undefined });
  },

  async reasignarConductorTramo({ tramoId, conductorId }: ReasignarConductorInput) {
    const t = requireTramo(tramoId);
    if (conductorId) {
      const check = conflictoAlAsignar(mundoAhora(new Date()), t, conductorId);
      if (!check.ok) throw new Error(check.motivo);
    }
    t.conductorId = conductorId;
    nuevoLog(tramoId, 'cambio_estado', 'Rubén Ortega', 'manual', { texto: conductorId ? `Reasignado a ${conductorId}` : 'Conductor retirado' });
    return t;
  },

  async cambiarEstadoPresupuesto({ presupuestoId, estado }: CambiarEstadoPresupuestoInput) {
    const p = m.presupuesto(presupuestoId);
    if (!p) throw new Error(`Presupuesto ${presupuestoId} no encontrado`);
    p.estado = estado;
    p.actualizado = new Date();
    return p;
  },

  async crearRutaDesdeCampana(input: CrearRutaDesdeCampanaInput) {
    const campana = m.campana(input.campanaId);
    if (!campana) throw new Error(`Campaña ${input.campanaId} no encontrada`);
    let seq = 1100 + m.RUTAS.length;
    const built = construirRutaDesdeCampana(campana, input, {
      nextRutaId: () => {
        const id = `TR-${seq}`;
        seq += 1;
        return id;
      },
      direccionCliente: campana.clienteId
        ? (lookupCliente(campana.clienteId)?.direccion ?? null)
        : null,
    });
    m.PARADAS.push(...built.paradas);
    m.TRASLADOS.push(...built.tramos);
    m.PRESUPUESTOS.push(built.presupuesto);
    m.RUTAS.push(built.ruta);
    campana.rutaGeneradaId = built.ruta.id;
    campana.presupuesto = built.presupuesto;
    campana.presupuestoId = built.presupuesto.id;
    campana.estado = 'aceptada';
    const vista = m.rutaVista(built.ruta.id);
    if (vista) m.RUTAS_VISTA.push(vista);
    const t0 = built.tramos[0];
    if (t0) {
      nuevoLog(t0.id, 'cambio_estado', 'Rubén Ortega', 'manual', {
        a: 'creado',
        texto: `Ruta ${built.ruta.id} creada desde campaña ${campana.id}`,
        rutaId: built.ruta.id,
      });
    }
    return built.ruta;
  },

  async actualizarTagsManual({ rutaId, tagsManual }) {
    const r = requireRuta(rutaId);
    r.tagsManual = tagsManual;
    return r;
  },

  async cancelarRuta({ rutaId, subestado, motivo }: CancelarRutaInput) {
    const r = requireRuta(rutaId);
    r.estado = 'cancelado';
    r.subestado = subestado;
    r.motivo = motivo;
    r.canceladaEn = new Date();
    const tramos = m.tramosDeRuta(rutaId);
    const ultimo = tramos[tramos.length - 1];
    if (ultimo) nuevoLog(ultimo.id, 'incidencia', 'Rubén Ortega', 'manual', { texto: 'Ruta cancelada', motivo });
    return r;
  },

  async listSolicitudesPendientes() {
    return SOLICITUDES.filter((s) => s.estado === 'pendiente');
  },

  async listSolicitudes() {
    return SOLICITUDES;
  },

  async resolverSolicitud(id, resolucion, estado) {
    const s = SOLICITUDES.find((x) => x.id === id);
    if (!s) throw new Error(`Solicitud ${id} no encontrada`);
    s.estado = estado;
    s.resolucion = resolucion;
    s.resueltaEn = new Date();
    return s;
  },

  async listUsuariosBackoffice() { return USUARIOS; },
  async getUsuarioBackoffice(id) { return USUARIOS.find((u) => u.id === id) ?? null; },

  async invitarUsuarioBackoffice(actorId, input) {
    const actor = requireActor(actorId);
    if (!puede(actor.rol, 'gestionar_usuarios')) throw new Error('No puedes invitar usuarios');
    return invitarUsuario(USUARIOS, input, new Date());
  },

  async transicionarUsuarioBackoffice(actorId, usuarioId, hacia) {
    const actor = requireActor(actorId);
    if (!puede(actor.rol, 'gestionar_usuarios')) throw new Error('No puedes cambiar usuarios');
    return transicionarUsuario(USUARIOS, usuarioId, hacia, new Date());
  },

  async transicionarProcesoConductor(actorId, conductorId, hacia) {
    const actor = requireActor(actorId);
    if (!puede(actor.rol, 'cambiar_proceso_conductor')) throw new Error('No puedes cambiar el onboarding');
    const c = m.conductor(conductorId);
    if (!c) throw new Error(`Conductor ${conductorId} no encontrado`);
    return transicionarProceso(c, hacia);
  },

  async getBackofficeSnapshot(actorId, ahora) {
    const actor = requireActor(actorId);
    if (!puede(actor.rol, 'ver_backoffice')) throw new Error('No puedes entrar al backoffice');
    return buildSnapshot(mundoAhora(ahora ?? new Date()), actorId);
  },

  async ejecutarAutomatizacionesBackoffice(actorId, ahora) {
    const actor = requireActor(actorId);
    if (!puede(actor.rol, 'ejecutar_automatizaciones')) throw new Error('No puedes ejecutar automatizaciones');
    const mundo = mundoAhora(ahora ?? new Date());
    return aplicarAutomatizaciones(mundo, proponerAutomatizaciones(mundo));
  },
};
