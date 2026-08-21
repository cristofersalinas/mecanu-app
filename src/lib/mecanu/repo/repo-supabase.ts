/**
 * Implementación Postgres de `MecanuRepo` (service_role en servidor).
 * Activar con MECANU_USE_SUPABASE=1 y credenciales de mecanu-dev.
 *
 * La UI del panel/conductor sigue en mock hasta migrar data.ts (async).
 * APIs y Server Actions que usen `repo` sí pueden apuntar aquí.
 */
import { getSupabaseServer } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { crearRutaDesdeCampana as construirRutaDesdeCampana } from '../crear-ruta-desde-campana';
import {
  aplicarAutomatizaciones, buildSnapshot, conflictoAlAsignar, invitarUsuario, puede,
  proponerAutomatizaciones, transicionarProceso, transicionarUsuario,
} from '../backoffice';
import type { MundoBackoffice } from '../backoffice';
import type {
  Actividad, Campana, Conductor, Inspeccion, Log, Parada,
  Presupuesto, ProcesoConductor, RutaVista, Solicitud, TagRuta, Tramo,
  UsuarioBackoffice, Vehiculo, EstadoUsuarioBackoffice,
} from '../types';
import type {
  AsignarConductorInput, CambiarEstadoPresupuestoInput, CambiarSubestadoTramoInput,
  CancelarRutaInput, CheckinInput, ConfirmacionInput, CrearRutaDesdeCampanaInput,
  EntregaInput, HallazgoCampanaInput, IncidenciaInput, MecanuRepo,
  ReasignarConductorInput, SolicitudInput,
} from './repo';
import {
  construirVista, mapCampana, mapCliente, mapConductor, mapLog, mapParada, mapPerfilAUsuario,
  mapPresupuesto, mapRuta, mapServicio, mapSolicitud, mapTramo, mapVehiculo,
} from './mappers-supabase';

const TALLER_DEFAULT = 'taller-rodriguez';

function sb(): SupabaseClient {
  const c = getSupabaseServer();
  if (!c) throw new Error('Supabase no configurado (faltan URL o SERVICE_ROLE)');
  return c;
}

function throwPg(error: { message: string } | null, ctx: string): void {
  if (error) throw new Error(`${ctx}: ${error.message}`);
}

async function cargarParadas(rutaId: string): Promise<Parada[]> {
  const client = sb();
  const { data, error } = await client.from('paradas').select('*').eq('ruta_id', rutaId).order('orden');
  throwPg(error, 'paradas');
  const ids = (data ?? []).map((r) => r.id as string);
  const serviciosBy: Record<string, Parada['servicios']> = {};
  if (ids.length) {
    const { data: svcs } = await client.from('parada_servicios').select('*').in('parada_id', ids);
    for (const s of svcs ?? []) {
      const pid = String(s.parada_id);
      (serviciosBy[pid] ??= []).push({
        descripcion: String(s.descripcion),
        presupuestoId: '',
      });
    }
  }
  return (data ?? []).map((r) => mapParada(r, serviciosBy[String(r.id)] ?? []));
}

async function cargarTramos(rutaId: string): Promise<Tramo[]> {
  const { data, error } = await sb().from('traslados').select('*').eq('ruta_id', rutaId).order('orden');
  throwPg(error, 'traslados');
  return (data ?? []).map((r) => mapTramo(r));
}

async function cargarPresupuesto(id: string | null | undefined): Promise<Presupuesto | null> {
  if (!id) return null;
  const client = sb();
  const { data, error } = await client.from('presupuestos').select('*').eq('id', id).maybeSingle();
  throwPg(error, 'presupuesto');
  if (!data) return null;
  const { data: lineas } = await client
    .from('presupuesto_lineas')
    .select('*')
    .eq('presupuesto_id', id);
  return mapPresupuesto(
    data,
    (lineas ?? []).map((l) => ({
      descripcion: String(l.descripcion),
      importe: Number(l.importe),
      origen: l.origen as Presupuesto['lineas'][0]['origen'],
      servicioTemparioId: l.servicio_tempario_id == null ? null : String(l.servicio_tempario_id),
    })),
  );
}

async function vistaDeRuta(rutaRow: Record<string, unknown>): Promise<RutaVista> {
  const ruta = mapRuta(rutaRow);
  const [tramos, paradas, presupuesto] = await Promise.all([
    cargarTramos(ruta.id),
    cargarParadas(ruta.id),
    cargarPresupuesto(ruta.presupuestoId || null),
  ]);
  return construirVista(ruta, tramos, paradas, presupuesto);
}

async function requireTramo(id: string): Promise<Tramo> {
  const { data, error } = await sb().from('traslados').select('*').eq('id', id).maybeSingle();
  throwPg(error, 'tramo');
  if (!data) throw new Error(`Tramo ${id} no encontrado`);
  return mapTramo(data);
}

async function insertLog(
  trasladoId: string,
  tipo: Log['tipo'],
  actor: string,
  triggerSource: Log['triggerSource'],
  payload: Log['payload'],
): Promise<void> {
  const id = `LG-${Date.now().toString(36)}`;
  const { error } = await sb().from('logs').insert({
    id,
    traslado_id: trasladoId,
    tipo,
    ts: new Date().toISOString(),
    actor,
    trigger_source: triggerSource,
    payload: payload ?? {},
  });
  throwPg(error, 'log');
}

function mundoDesde(
  rutas: RutaVista[],
  tramos: Tramo[],
  logs: Log[],
  campanas: Campana[],
  presupuestos: Presupuesto[],
  conductores: Conductor[],
  solicitudes: Solicitud[],
  usuarios: UsuarioBackoffice[],
  ahora: Date,
): MundoBackoffice {
  return {
    ahora,
    rutas,
    tramos,
    logs,
    campanas,
    presupuestos,
    conductores,
    solicitudes,
    usuarios,
    ejecuciones: [],
  };
}

function inspeccionMinima(row: Record<string, unknown>): Inspeccion {
  const km = Number(row.km ?? 0);
  const combustible = String(row.combustible ?? '');
  const combustiblePct = Number(row.combustible_pct ?? 0);
  return {
    id: String(row.id),
    tipo: row.tipo as Inspeccion['tipo'],
    rutaId: String(row.ruta_id),
    trasladoId: row.traslado_id == null ? null : String(row.traslado_id),
    fecha: new Date(String(row.fecha ?? row.created_at)),
    inspector: String(row.inspector_id ?? ''),
    inspectorNombre: '',
    sede: '',
    km,
    combustible,
    combustiblePct,
    limpieza: String(row.limpieza ?? ''),
    vehiculo: {
      matricula: '',
      modelo: '',
      vin: String(row.vin ?? ''),
      km,
      combustible,
      combustiblePct,
    },
    itv: { estado: String(row.itv_estado ?? 'desconocido'), vence: [] },
    itvVence: row.itv_vence ? new Date(String(row.itv_vence)) : new Date(),
    zonas: [],
    danos: [],
    hallazgos: [],
    firmas: {
      cliente: row.firma_cliente == null ? null : String(row.firma_cliente),
      conductor: row.firma_conductor == null ? null : String(row.firma_conductor),
    },
  };
}

export const supabaseRepo: MecanuRepo = {
  async listClientes() {
    const { data, error } = await sb().from('clientes').select('*').order('nombre');
    throwPg(error, 'clientes');
    return (data ?? []).map((r) => mapCliente(r));
  },
  async getCliente(id) {
    const { data, error } = await sb().from('clientes').select('*').eq('id', id).maybeSingle();
    throwPg(error, 'cliente');
    return data ? mapCliente(data) : null;
  },

  async listVehiculos() {
    const client = sb();
    const { data, error } = await client.from('vehiculos').select('*').order('matricula');
    throwPg(error, 'vehiculos');
    const ids = (data ?? []).map((v) => v.id as string);
    const usuariosBy: Record<string, Vehiculo['usuarios']> = {};
    if (ids.length) {
      const { data: links } = await client.from('vehiculo_clientes').select('*').in('vehiculo_id', ids);
      for (const l of links ?? []) {
        const vid = String(l.vehiculo_id);
        (usuariosBy[vid] ??= []).push({
          clienteId: String(l.cliente_id),
          relacion: String(l.relacion),
          principal: Boolean(l.principal),
        });
      }
    }
    return (data ?? []).map((r) => mapVehiculo(r, usuariosBy[String(r.id)] ?? []));
  },
  async getVehiculo(id) {
    const all = await this.listVehiculos();
    return all.find((v) => v.id === id) ?? null;
  },

  async listConductores() {
    const client = sb();
    const { data, error } = await client.from('conductores').select('*').order('nombre');
    throwPg(error, 'conductores');
    const ids = (data ?? []).map((c) => c.id as string);
    const incBy: Record<string, Conductor['incidencias']> = {};
    if (ids.length) {
      const { data: incs } = await client.from('conductor_incidencias').select('*').in('conductor_id', ids);
      for (const i of incs ?? []) {
        const cid = String(i.conductor_id);
        (incBy[cid] ??= []).push({
          fecha: new Date(String(i.fecha)),
          tipo: String(i.tipo),
          gravedad: String(i.gravedad),
          detalle: String(i.detalle),
        });
      }
    }
    return (data ?? []).map((r) => mapConductor(r, incBy[String(r.id)] ?? []));
  },
  async getConductor(id) {
    const all = await this.listConductores();
    return all.find((c) => c.id === id) ?? null;
  },

  async listServicios() {
    const { data, error } = await sb().from('servicios').select('*').order('nombre');
    throwPg(error, 'servicios');
    return (data ?? []).map((r) => mapServicio(r));
  },
  async getServicio(id) {
    const { data, error } = await sb().from('servicios').select('*').eq('id', id).maybeSingle();
    throwPg(error, 'servicio');
    return data ? mapServicio(data) : null;
  },

  async listRutas() {
    const { data, error } = await sb().from('rutas').select('*').order('creada_en', { ascending: false });
    throwPg(error, 'rutas');
    return (data ?? []).map((r) => mapRuta(r));
  },
  async listRutasVista() {
    const { data, error } = await sb().from('rutas').select('*').order('creada_en', { ascending: false });
    throwPg(error, 'rutas');
    return Promise.all((data ?? []).map((r) => vistaDeRuta(r)));
  },
  async getRuta(id) {
    const { data, error } = await sb().from('rutas').select('*').eq('id', id).maybeSingle();
    throwPg(error, 'ruta');
    return data ? mapRuta(data) : null;
  },
  async getRutaVista(id) {
    const { data, error } = await sb().from('rutas').select('*').eq('id', id).maybeSingle();
    throwPg(error, 'ruta');
    return data ? vistaDeRuta(data) : null;
  },
  async getParada(id) {
    const { data, error } = await sb().from('paradas').select('*').eq('id', id).maybeSingle();
    throwPg(error, 'parada');
    if (!data) return null;
    const list = await cargarParadas(String(data.ruta_id));
    return list.find((p) => p.id === id) ?? null;
  },
  async listParadasDeRuta(rutaId) {
    return cargarParadas(rutaId);
  },
  async getTramo(id) {
    try {
      return await requireTramo(id);
    } catch {
      return null;
    }
  },
  async listTramosDeRuta(rutaId) {
    return cargarTramos(rutaId);
  },
  async getTramoActivo(rutaId) {
    const tramos = await cargarTramos(rutaId);
    return (
      tramos.find((t) => t.estado === 'en_curso')
      ?? tramos.find((t) => t.estado === 'agendado')
      ?? tramos[0]
      ?? null
    );
  },
  async listLogsDeTramo(trasladoId) {
    const { data, error } = await sb()
      .from('logs')
      .select('*')
      .eq('traslado_id', trasladoId)
      .order('ts', { ascending: false });
    throwPg(error, 'logs');
    return (data ?? []).map((r) => mapLog(r));
  },
  async listActividadDeRuta(rutaId) {
    const tramos = await cargarTramos(rutaId);
    const out: Actividad[] = [];
    for (const t of tramos) {
      const logs = await this.listLogsDeTramo(t.id);
      for (const l of logs) {
        out.push({
          id: l.id,
          fecha: l.ts,
          tipo: l.tipo,
          actor: l.actor,
          triggerSource: l.triggerSource,
          label: l.payload?.texto ?? l.tipo,
          detalle: l.payload?.detalle ?? null,
          tipoEvidencia: l.payload?.tipoEvidencia ?? null,
          trasladoId: t.id,
        });
      }
    }
    return out.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  },
  async listTagsDeRuta(rutaId) {
    const ruta = await this.getRuta(rutaId);
    if (!ruta) return [];
    return ruta.tagsManual.map((id): TagRuta => ({
      id,
      label: id,
      color: 'neutral',
      derivado: false,
    }));
  },
  async listRutasDeCliente(clienteId) {
    const vistas = await this.listRutasVista();
    return vistas.filter((r) => r.clienteId === clienteId);
  },
  async listRutasDeVehiculo(vehiculoId) {
    const vistas = await this.listRutasVista();
    return vistas.filter((r) => r.vehiculoId === vehiculoId);
  },
  async listRutasDeConductor(conductorId) {
    const vistas = await this.listRutasVista();
    return vistas.filter((r) => r.conductorId === conductorId);
  },

  async getPresupuesto(id) {
    return cargarPresupuesto(id);
  },
  async listCampanas() {
    const { data, error } = await sb().from('campanas').select('*').order('fecha', { ascending: false });
    throwPg(error, 'campanas');
    const out: Campana[] = [];
    for (const row of data ?? []) {
      const { data: pr } = await sb()
        .from('presupuestos')
        .select('*')
        .eq('campana_id', row.id)
        .limit(1)
        .maybeSingle();
      const presupuesto = pr
        ? await cargarPresupuesto(String(pr.id))
        : mapPresupuesto({
          id: `PR-tmp-${row.id}`,
          modo: 'detallado',
          estado: 'nueva',
          total: 0,
          iva_incluido: true,
        });
      out.push(mapCampana(row, presupuesto!));
    }
    return out;
  },
  async getCampana(id) {
    const all = await this.listCampanas();
    return all.find((c) => c.id === id) ?? null;
  },

  async listInspeccionesDeRuta(rutaId) {
    const { data, error } = await sb().from('inspecciones').select('*').eq('ruta_id', rutaId);
    throwPg(error, 'inspecciones');
    return (data ?? []).map((row) => inspeccionMinima(row));
  },

  async getTurnoConductor(conductorId) {
    const vistas = await this.listRutasDeConductor(conductorId);
    const ids: string[] = [];
    for (const v of vistas) {
      const tramos = await this.listTramosDeRuta(v.id);
      for (const t of tramos) {
        if (t.conductorId === conductorId) ids.push(t.id);
      }
    }
    return { trasladoIds: ids };
  },
  async getTrasladosDisponibles() {
    const { data, error } = await sb()
      .from('traslados')
      .select('id')
      .eq('estado', 'agendado')
      .is('conductor_id', null);
    throwPg(error, 'disponibles');
    return { trasladoIds: (data ?? []).map((r) => String(r.id)) };
  },

  async asignarConductor({ trasladoId, conductorId }: AsignarConductorInput) {
    const t = await requireTramo(trasladoId);
    const [conductores, rutas, tramosRaw] = await Promise.all([
      this.listConductores(),
      this.listRutasVista(),
      sb().from('traslados').select('*'),
    ]);
    throwPg(tramosRaw.error, 'traslados');
    const tramos = (tramosRaw.data ?? []).map((x) => mapTramo(x));
    const mundo = mundoDesde(rutas, tramos, [], [], [], conductores, [], [], new Date());
    const check = conflictoAlAsignar(mundo, t, conductorId);
    if (!check.ok) throw new Error(check.motivo);
    const { error } = await sb()
      .from('traslados')
      .update({ conductor_id: conductorId })
      .eq('id', trasladoId);
    throwPg(error, 'asignar');
    await insertLog(trasladoId, 'cambio_estado', conductorId, 'conductor', {
      texto: `Conductor asignado: ${conductorId}`,
    });
    return requireTramo(trasladoId);
  },

  async cambiarSubestadoTramo({ trasladoId, a, triggerSource }: CambiarSubestadoTramoInput) {
    const t = await requireTramo(trasladoId);
    const patch: Record<string, unknown> = { subestado: a };
    if (a === 'en_destino') patch.estado = 'en_curso';
    const { error } = await sb().from('traslados').update(patch).eq('id', trasladoId);
    throwPg(error, 'subestado');
    await insertLog(
      trasladoId,
      'cambio_estado',
      triggerSource === 'conductor' ? (t.conductorId ?? 'conductor') : 'Sistema',
      triggerSource,
      { a, texto: `Subestado → ${a}` },
    );
    return requireTramo(trasladoId);
  },

  async checkin({ trasladoId, ...evidencia }: CheckinInput) {
    const t = await requireTramo(trasladoId);
    await insertLog(trasladoId, 'evidencia', t.conductorId ?? 'conductor', 'conductor', {
      texto: 'Check-in con fotos, testigos e inspección',
      tipoEvidencia: 'check-in',
    });
    const id = `IN-${Date.now().toString(36)}`;
    const row = {
      id,
      taller_id: TALLER_DEFAULT,
      ruta_id: t.rutaId,
      traslado_id: trasladoId,
      tipo: 'check-in',
      fecha: new Date().toISOString(),
      inspector_id: t.conductorId,
      km: evidencia.km,
      combustible: evidencia.combustible,
      combustible_pct: evidencia.combustiblePct,
      limpieza: evidencia.limpieza,
      firma_conductor: evidencia.firmaConductor,
      firma_cliente: null,
    };
    const { error } = await sb().from('inspecciones').insert(row);
    throwPg(error, 'checkin');
    return { tramo: await requireTramo(trasladoId), inspeccion: inspeccionMinima(row) };
  },

  async actualizarKmVehiculo(vehiculoId, km) {
    const { error } = await sb().from('vehiculos').update({ km }).eq('id', vehiculoId);
    throwPg(error, 'km');
    const v = await this.getVehiculo(vehiculoId);
    if (!v) throw new Error(`Vehículo ${vehiculoId} no encontrado`);
    return v;
  },

  async registrarHallazgoCampana(input: HallazgoCampanaInput) {
    await insertLog(input.trasladoId, 'incidencia', 'conductor', 'conductor', {
      texto: `Hallazgo: ${input.testigo} nivel ${input.nivel}`,
      rutaId: input.rutaId,
      detalle: input.detalle ?? undefined,
    });
    // Catálogo testigo→campaña en Postgres: pendiente de seed + reglas (PREGUNTAS-ABIERTAS).
    return null;
  },

  async entregar({ trasladoId, firmaCliente }: EntregaInput) {
    const { error } = await sb()
      .from('traslados')
      .update({ estado: 'completado', subestado: null })
      .eq('id', trasladoId);
    throwPg(error, 'entrega');
    await insertLog(trasladoId, 'evidencia', 'conductor', 'conductor', {
      texto: firmaCliente ? 'Entrega con firma' : 'Entrega en taller',
      tipoEvidencia: 'entrega',
    });
    return requireTramo(trasladoId);
  },

  async registrarConfirmacion({ trasladoId, nota }: ConfirmacionInput) {
    await insertLog(trasladoId, 'comunicacion', 'cliente', 'api', {
      texto: 'Confirmación llegada a tiempo',
      detalle: nota,
    });
  },

  async crearSolicitud(input: SolicitudInput) {
    const id = `SO-${Date.now().toString(36)}`;
    const row = {
      id,
      traslado_id: input.trasladoId,
      ruta_id: input.rutaId,
      conductor_id: input.conductorId,
      tipo: input.tipo,
      motivo: input.motivo,
      nota: input.nota,
      ts: new Date().toISOString(),
      estado: 'pendiente',
      resolucion: null,
      resuelta_en: null,
    };
    const { error } = await sb().from('solicitudes').insert(row);
    throwPg(error, 'solicitud');
    return mapSolicitud(row);
  },

  async registrarIncidencia({ trasladoId, detalle }: IncidenciaInput) {
    await sb().from('rutas').update({ incidencia: detalle }).eq(
      'id',
      (await requireTramo(trasladoId)).rutaId,
    );
    await insertLog(trasladoId, 'incidencia', 'conductor', 'conductor', {
      texto: detalle ?? 'Incidencia',
    });
  },

  async reasignarConductorTramo({ tramoId, conductorId }: ReasignarConductorInput) {
    const { error } = await sb()
      .from('traslados')
      .update({ conductor_id: conductorId })
      .eq('id', tramoId);
    throwPg(error, 'reasignar');
    await insertLog(tramoId, 'cambio_estado', 'taller', 'manual', {
      texto: conductorId ? `Reasignado a ${conductorId}` : 'Conductor quitado',
    });
    return requireTramo(tramoId);
  },

  async cambiarEstadoPresupuesto({ presupuestoId, estado }: CambiarEstadoPresupuestoInput) {
    const { error } = await sb().from('presupuestos').update({ estado }).eq('id', presupuestoId);
    throwPg(error, 'presupuesto estado');
    const p = await cargarPresupuesto(presupuestoId);
    if (!p) throw new Error(`Presupuesto ${presupuestoId} no encontrado`);
    return p;
  },

  async crearRutaDesdeCampana(input: CrearRutaDesdeCampanaInput) {
    const campana = await this.getCampana(input.campanaId);
    if (!campana) throw new Error(`Campaña ${input.campanaId} no encontrada`);
    const cliente = campana.clienteId ? await this.getCliente(campana.clienteId) : null;
    const { count } = await sb().from('rutas').select('*', { count: 'exact', head: true });
    let seq = 1100 + (count ?? 0);
    const built = construirRutaDesdeCampana(campana, input, {
      nextRutaId: () => {
        const id = `TR-${seq}`;
        seq += 1;
        return id;
      },
      direccionCliente: cliente?.direccion ?? null,
    });
    const client = sb();
    const tallerId = TALLER_DEFAULT;
    const pr = built.presupuesto;
    const { error: e1 } = await client.from('presupuestos').upsert({
      id: pr.id,
      taller_id: tallerId,
      campana_id: campana.id,
      vehiculo_id: campana.vehiculoId,
      modo: pr.modo,
      estado: pr.estado,
      iva_incluido: pr.ivaIncluido,
      total: pr.total,
      ruta_generada_id: built.ruta.id,
    });
    throwPg(e1, 'presupuesto upsert');
    if (pr.lineas.length) {
      await client.from('presupuesto_lineas').delete().eq('presupuesto_id', pr.id);
      const { error: e2 } = await client.from('presupuesto_lineas').insert(
        pr.lineas.map((l) => ({
          presupuesto_id: pr.id,
          descripcion: l.descripcion,
          importe: l.importe,
          origen: l.origen,
          servicio_tempario_id: l.servicioTemparioId,
        })),
      );
      throwPg(e2, 'lineas');
    }
    const r = built.ruta;
    const { error: e3 } = await client.from('rutas').insert({
      id: r.id,
      taller_id: tallerId,
      vehiculo_id: r.vehiculoId,
      cliente_id: r.clienteId,
      perfil_servicio: r.perfilServicio,
      estado: r.estado,
      subestado: r.subestado,
      tags_manual: r.tagsManual,
      cliente_tiene_auto: r.clienteTieneAuto,
      vehiculo_listo: r.vehiculoListo,
      campana_origen_id: campana.id,
      presupuesto_id: r.presupuestoId,
      motivo: r.motivo,
      creada_en: r.creadaEn.toISOString(),
    });
    throwPg(e3, 'ruta insert');
    for (const p of built.paradas) {
      const { error: ep } = await client.from('paradas').insert({
        id: p.id,
        ruta_id: r.id,
        orden: p.orden,
        tipo: p.tipo,
        subtipo: p.subtipo,
        direccion: p.direccion,
        localidad: p.localidad,
        sublocalidad: p.sublocalidad,
      });
      throwPg(ep, 'parada');
      for (const s of p.servicios) {
        await client.from('parada_servicios').insert({
          parada_id: p.id,
          descripcion: s.descripcion,
        });
      }
    }
    for (const t of built.tramos) {
      const { error: et } = await client.from('traslados').insert({
        id: t.id,
        ruta_id: r.id,
        orden: t.orden,
        rol: t.rol,
        parada_origen_id: t.paradaOrigenId,
        parada_destino_id: t.paradaDestinoId,
        conductor_id: t.conductorId,
        ventana_fecha: t.ventana?.fecha.toISOString().slice(0, 10) ?? null,
        ventana_inicio: t.ventana?.inicio ?? null,
        ventana_fin: t.ventana?.fin ?? null,
        estado: t.estado,
        subestado: t.subestado,
        seguro: t.seguro,
        importe: t.importe,
        reprogramaciones: t.reprogramaciones,
      });
      throwPg(et, 'traslado');
    }
    await client.from('campanas').update({ ruta_generada_id: r.id }).eq('id', campana.id);
    return r;
  },

  async actualizarTagsManual({ rutaId, tagsManual }: { rutaId: string; tagsManual: string[] }) {
    const { error } = await sb().from('rutas').update({ tags_manual: tagsManual }).eq('id', rutaId);
    throwPg(error, 'tags');
    const r = await this.getRuta(rutaId);
    if (!r) throw new Error(`Ruta ${rutaId} no encontrada`);
    return r;
  },

  async cancelarRuta({ rutaId, subestado, motivo }: CancelarRutaInput) {
    const { error } = await sb().from('rutas').update({
      estado: 'cancelado',
      subestado,
      motivo,
      cancelada_en: new Date().toISOString(),
    }).eq('id', rutaId);
    throwPg(error, 'cancelar');
    const r = await this.getRuta(rutaId);
    if (!r) throw new Error(`Ruta ${rutaId} no encontrada`);
    return r;
  },

  async listSolicitudesPendientes() {
    const { data, error } = await sb().from('solicitudes').select('*').eq('estado', 'pendiente');
    throwPg(error, 'solicitudes');
    return (data ?? []).map((r) => mapSolicitud(r));
  },
  async listSolicitudes() {
    const { data, error } = await sb().from('solicitudes').select('*').order('ts', { ascending: false });
    throwPg(error, 'solicitudes');
    return (data ?? []).map((r) => mapSolicitud(r));
  },
  async resolverSolicitud(id, resolucion, estado) {
    const { error } = await sb().from('solicitudes').update({
      resolucion,
      estado,
      resuelta_en: new Date().toISOString(),
    }).eq('id', id);
    throwPg(error, 'resolver');
    const { data } = await sb().from('solicitudes').select('*').eq('id', id).single();
    return mapSolicitud(data!);
  },

  async listUsuariosBackoffice() {
    const { data, error } = await sb().from('perfiles').select('*').order('nombre');
    throwPg(error, 'perfiles');
    return (data ?? []).map((r) => mapPerfilAUsuario(r));
  },
  async getUsuarioBackoffice(id) {
    const { data, error } = await sb().from('perfiles').select('*').eq('id', id).maybeSingle();
    throwPg(error, 'perfil');
    return data ? mapPerfilAUsuario(data) : null;
  },
  async invitarUsuarioBackoffice(actorId, input) {
    const actor = await this.getUsuarioBackoffice(actorId);
    if (!actor || !puede(actor.rol, 'gestionar_usuarios')) {
      throw new Error('Sin permiso para invitar');
    }
    const existentes = await this.listUsuariosBackoffice();
    const draft = invitarUsuario(existentes, input, new Date());
    const client = sb();
    const { data: created, error: authErr } = await client.auth.admin.createUser({
      email: draft.email,
      email_confirm: true,
      app_metadata: {
        taller_id: TALLER_DEFAULT,
        rol: draft.rol,
        conductor_id: draft.conductorId,
        nombre: draft.nombre,
      },
    });
    if (authErr || !created.user) {
      throw new Error(authErr?.message ?? 'No se pudo crear el usuario Auth');
    }
    const { error } = await client.from('perfiles').upsert({
      id: created.user.id,
      taller_id: TALLER_DEFAULT,
      rol: draft.rol,
      nombre: draft.nombre,
      email: draft.email,
      telefono: draft.telefono,
      documento: draft.documento,
      conductor_id: draft.conductorId,
      estado: 'invitado',
    });
    throwPg(error, 'invitar perfil');
    return { ...draft, id: created.user.id };
  },
  async transicionarUsuarioBackoffice(actorId, usuarioId, hacia: EstadoUsuarioBackoffice) {
    const actor = await this.getUsuarioBackoffice(actorId);
    if (!actor || !puede(actor.rol, 'gestionar_usuarios')) {
      throw new Error('Sin permiso');
    }
    const usuarios = await this.listUsuariosBackoffice();
    const next = transicionarUsuario(usuarios, usuarioId, hacia, new Date());
    const { error } = await sb().from('perfiles').update({ estado: next.estado }).eq('id', usuarioId);
    throwPg(error, 'transicion usuario');
    return next;
  },
  async transicionarProcesoConductor(actorId, conductorId, hacia: ProcesoConductor) {
    const actor = await this.getUsuarioBackoffice(actorId);
    if (!actor || !puede(actor.rol, 'cambiar_proceso_conductor')) {
      throw new Error('Sin permiso');
    }
    const conductor = await this.getConductor(conductorId);
    if (!conductor) throw new Error('Conductor no encontrado');
    const next = transicionarProceso(conductor, hacia);
    const { error } = await sb().from('conductores').update({ proceso: next.proceso }).eq('id', conductorId);
    throwPg(error, 'proceso');
    return next;
  },
  async getBackofficeSnapshot(actorId, ahora = new Date()) {
    const actor = await this.getUsuarioBackoffice(actorId);
    if (!actor || !puede(actor.rol, 'ver_backoffice')) throw new Error('No puedes entrar al backoffice');
    const [rutas, conductores, solicitudes, usuarios, campanas, tramosRaw, logsRaw] = await Promise.all([
      this.listRutasVista(),
      this.listConductores(),
      this.listSolicitudes(),
      this.listUsuariosBackoffice(),
      this.listCampanas(),
      sb().from('traslados').select('*'),
      sb().from('logs').select('*').limit(500),
    ]);
    throwPg(tramosRaw.error, 'tramos snap');
    throwPg(logsRaw.error, 'logs snap');
    const tramos = (tramosRaw.data ?? []).map((r) => mapTramo(r));
    const logs = (logsRaw.data ?? []).map((r) => mapLog(r));
    const presupuestos = campanas.map((c) => c.presupuesto);
    const mundo = mundoDesde(
      rutas, tramos, logs, campanas, presupuestos, conductores, solicitudes, usuarios, ahora,
    );
    return buildSnapshot(mundo, actorId);
  },
  async ejecutarAutomatizacionesBackoffice(actorId, ahora = new Date()) {
    const actor = await this.getUsuarioBackoffice(actorId);
    if (!actor || !puede(actor.rol, 'ejecutar_automatizaciones')) {
      throw new Error('Sin permiso');
    }
    const snap = await this.getBackofficeSnapshot(actorId, ahora);
    const [tramosRaw, logsRaw, usuarios] = await Promise.all([
      sb().from('traslados').select('*'),
      sb().from('logs').select('*').limit(500),
      this.listUsuariosBackoffice(),
    ]);
    const mundo = mundoDesde(
      await this.listRutasVista(),
      (tramosRaw.data ?? []).map((r) => mapTramo(r)),
      (logsRaw.data ?? []).map((r) => mapLog(r)),
      snap.campanas,
      snap.campanas.map((c) => c.presupuesto),
      await this.listConductores(),
      snap.solicitudes,
      usuarios,
      ahora,
    );
    return aplicarAutomatizaciones(mundo, proponerAutomatizaciones(mundo));
  },
};
