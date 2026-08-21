/**
 * Filas Postgres (snake_case) → tipos de dominio (`types.ts`).
 */
import type {
  Campana, Cliente, Conductor, Log, Parada, Presupuesto, Ruta, RutaVista,
  Servicio, Solicitud, Tramo, UsuarioBackoffice, Vehiculo,
} from '../types';

function asDate(v: string | null | undefined): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function requireDate(v: string | null | undefined, fallback = new Date()): Date {
  return asDate(v) ?? fallback;
}

export function mapCliente(row: Record<string, unknown>): Cliente {
  return {
    id: String(row.id),
    nombre: String(row.nombre),
    tipo: row.tipo === 'Empresa' ? 'Empresa' : 'Particular',
    telefono: String(row.telefono ?? ''),
    email: String(row.email ?? ''),
    direccion: String(row.direccion ?? ''),
    desde: requireDate(row.desde as string),
  };
}

export function mapVehiculo(
  row: Record<string, unknown>,
  usuarios: Vehiculo['usuarios'] = [],
): Vehiculo {
  return {
    id: String(row.id),
    marca: String(row.marca),
    modelo: String(row.modelo),
    anio: Number(row.anio),
    matricula: String(row.matricula),
    km: Number(row.km),
    color: String(row.color ?? ''),
    usuarios,
  };
}

export function mapConductor(
  row: Record<string, unknown>,
  incidencias: Conductor['incidencias'] = [],
): Conductor {
  const proceso = row.proceso as Conductor['proceso'];
  return {
    id: String(row.id),
    nombre: String(row.nombre),
    telefono: String(row.telefono ?? ''),
    red: (row.red as Conductor['red']) || 'Interna',
    furgoneta: String(row.furgoneta ?? ''),
    proceso: proceso || 'activo',
    supervisados: Number(row.supervisados ?? 0),
    requeridos: Number(row.requeridos ?? 0),
    alta: requireDate(row.alta as string),
    calificacion: row.calificacion == null ? 0 : Number(row.calificacion),
    valoraciones: Number(row.valoraciones ?? 0),
    docs: {
      dni: Boolean(row.docs_dni),
      carnet: Boolean(row.docs_carnet),
      iban: Boolean(row.docs_iban),
      seguro: Boolean(row.docs_seguro),
    },
    incidencias,
  };
}

export function mapServicio(row: Record<string, unknown>): Servicio {
  const mano = Number(row.mano_obra ?? 0);
  const mat = Number(row.materiales ?? 0);
  const total = mano + mat;
  return {
    id: String(row.id),
    nombre: String(row.nombre),
    categoria: String(row.categoria ?? ''),
    horas: Number(row.horas ?? 0),
    manoObra: mano,
    materiales: mat,
    aplica: Array.isArray(row.aplica) ? (row.aplica as string[]) : [],
    garantia: String(row.garantia ?? ''),
    notas: String(row.notas ?? ''),
    total,
    totalIva: Math.round(total * 1.21 * 100) / 100,
  };
}

export function mapParada(
  row: Record<string, unknown>,
  servicios: Parada['servicios'] = [],
): Parada {
  return {
    id: String(row.id),
    rutaId: String(row.ruta_id),
    orden: Number(row.orden),
    tipo: row.tipo === 'proveedor' ? 'proveedor' : 'cliente',
    subtipo: (row.subtipo as Parada['subtipo']) ?? null,
    etiqueta: String(row.localidad ?? row.direccion ?? 'Parada'),
    direccion: row.direccion == null ? null : String(row.direccion),
    localidad: row.localidad == null ? null : String(row.localidad),
    sublocalidad: row.sublocalidad == null ? null : String(row.sublocalidad),
    servicios,
    llegadaReal: asDate(row.llegada_real as string),
    salidaReal: asDate(row.salida_real as string),
  };
}

export function mapTramo(row: Record<string, unknown>): Tramo {
  const vf = row.ventana_fecha as string | null;
  const ventana = vf
    ? {
        fecha: requireDate(vf),
        inicio: String(row.ventana_inicio ?? ''),
        fin: String(row.ventana_fin ?? ''),
      }
    : null;
  const pf = row.propuesta_fecha as string | null;
  const ventanaPropuesta = pf
    ? {
        fecha: requireDate(pf),
        inicio: String(row.propuesta_inicio ?? ''),
        fin: String(row.propuesta_fin ?? ''),
      }
    : null;
  return {
    id: String(row.id),
    rutaId: String(row.ruta_id),
    orden: Number(row.orden),
    rol: row.rol as Tramo['rol'],
    paradaOrigenId: row.parada_origen_id == null ? null : String(row.parada_origen_id),
    paradaDestinoId: row.parada_destino_id == null ? null : String(row.parada_destino_id),
    conductorId: row.conductor_id == null ? null : String(row.conductor_id),
    ventana,
    ventanaPropuesta,
    ventanaModo: (row.ventana_modo as Tramo['ventanaModo']) ?? null,
    clienteConfirmo: row.cliente_confirmo == null ? null : Boolean(row.cliente_confirmo),
    estado: row.estado as Tramo['estado'],
    subestado: row.subestado == null ? null : String(row.subestado),
    seguro: Boolean(row.seguro),
    importe: Number(row.importe ?? 0),
    reprogramaciones: Number(row.reprogramaciones ?? 0),
    comunicaAlCliente: true,
  };
}

export function mapLog(row: Record<string, unknown>): Log {
  return {
    id: String(row.id),
    trasladoId: String(row.traslado_id),
    tipo: row.tipo as Log['tipo'],
    ts: requireDate(row.ts as string),
    actor: String(row.actor),
    triggerSource: row.trigger_source as Log['triggerSource'],
    payload: (row.payload as Log['payload']) ?? null,
  };
}

export function mapRuta(row: Record<string, unknown>): Ruta {
  return {
    id: String(row.id),
    vehiculoId: row.vehiculo_id == null ? null : String(row.vehiculo_id),
    clienteId: row.cliente_id == null ? null : String(row.cliente_id),
    perfilServicio: String(row.perfil_servicio ?? ''),
    modeloPrecio: 'taller',
    precioTotal: 0,
    estado: row.estado as Ruta['estado'],
    subestado: String(row.subestado),
    tagsManual: Array.isArray(row.tags_manual) ? (row.tags_manual as string[]) : [],
    clienteTieneAuto: row.cliente_tiene_auto == null ? null : Boolean(row.cliente_tiene_auto),
    vehiculoListo: row.vehiculo_listo == null ? null : Boolean(row.vehiculo_listo),
    campanaOrigenId: row.campana_origen_id == null ? null : String(row.campana_origen_id),
    presupuestoId: String(row.presupuesto_id ?? ''),
    motivo: row.motivo == null ? null : String(row.motivo),
    canceladaEn: asDate(row.cancelada_en as string),
    incidencia: row.incidencia == null ? null : String(row.incidencia),
    matriculaLead: row.matricula_lead == null ? null : String(row.matricula_lead),
    linkToken: row.link_token == null ? null : String(row.link_token),
    linkEnviadoEn: asDate(row.link_enviado_en as string),
    creadaEn: requireDate(row.creada_en as string),
  };
}

export function mapPresupuesto(
  row: Record<string, unknown>,
  lineas: Presupuesto['lineas'] = [],
): Presupuesto {
  return {
    id: String(row.id),
    campanaId: row.campana_id == null ? null : String(row.campana_id),
    vehiculoId: row.vehiculo_id == null ? null : String(row.vehiculo_id),
    rutaOrigenId: row.ruta_origen_id == null ? null : String(row.ruta_origen_id),
    rutaGeneradaId: row.ruta_generada_id == null ? null : String(row.ruta_generada_id),
    modo: row.modo === 'solo_total' ? 'solo_total' : 'detallado',
    lineas,
    estado: row.estado as Presupuesto['estado'],
    ivaIncluido: row.iva_incluido !== false,
    creado: asDate(row.created_at as string),
    actualizado: asDate(row.updated_at as string),
    total: Number(row.total ?? 0),
  };
}

export function mapCampana(
  row: Record<string, unknown>,
  presupuesto: Presupuesto,
): Campana {
  return {
    id: String(row.id),
    clienteId: row.cliente_id == null ? null : String(row.cliente_id),
    vehiculoId: row.vehiculo_id == null ? null : String(row.vehiculo_id),
    rutaOrigenId: row.ruta_origen_id == null ? null : String(row.ruta_origen_id),
    rutaGeneradaId: row.ruta_generada_id == null ? null : String(row.ruta_generada_id),
    inspeccionId: row.inspeccion_id == null ? null : String(row.inspeccion_id),
    items: [],
    tipos: [],
    etiquetas: [],
    falla: String(row.falla),
    evidencia: String(row.evidencia),
    valor: presupuesto.total,
    servicio: null,
    urgente: Boolean(row.urgente),
    severidad: Boolean(row.urgente) ? 'alta' : 'media',
    fecha: requireDate(row.fecha as string),
    habito: '',
    motivoFecha: '',
    fotoUrl: row.foto_url == null ? null : String(row.foto_url),
    estadoEnvio: 'pendiente',
    presupuestoId: presupuesto.id,
    presupuesto,
    estado: presupuesto.estado,
    origenAutomatico: Boolean(row.origen_automatico),
  };
}

export function mapSolicitud(row: Record<string, unknown>): Solicitud {
  return {
    id: String(row.id),
    trasladoId: String(row.traslado_id),
    rutaId: String(row.ruta_id),
    conductorId: String(row.conductor_id),
    tipo: row.tipo as Solicitud['tipo'],
    motivo: String(row.motivo),
    nota: row.nota == null ? null : String(row.nota),
    ts: requireDate(row.ts as string),
    estado: row.estado as Solicitud['estado'],
    resolucion: row.resolucion == null ? null : String(row.resolucion),
    resueltaEn: asDate(row.resuelta_en as string),
  };
}

export function mapPerfilAUsuario(row: Record<string, unknown>): UsuarioBackoffice {
  return {
    id: String(row.id),
    nombre: String(row.nombre),
    email: String(row.email),
    telefono: row.telefono == null ? null : String(row.telefono),
    documento: row.documento == null ? null : String(row.documento),
    rol: row.rol as UsuarioBackoffice['rol'],
    estado: (row.estado as UsuarioBackoffice['estado']) || 'activo',
    conductorId: row.conductor_id == null ? null : String(row.conductor_id),
    invitadEn: requireDate(row.created_at as string),
    activadoEn: row.estado === 'activo' ? requireDate(row.updated_at as string) : null,
  };
}

export function construirVista(
  ruta: Ruta,
  tramos: Tramo[],
  paradas: Parada[],
  presupuesto: Presupuesto | null,
): RutaVista {
  const activos = tramos
    .filter((t) => t.estado === 'en_curso' || t.estado === 'agendado')
    .sort((a, b) => a.orden - b.orden);
  const tramo = activos[0] ?? tramos.sort((a, b) => a.orden - b.orden)[0] ?? null;
  const origen = tramo?.paradaOrigenId
    ? paradas.find((p) => p.id === tramo.paradaOrigenId) ?? null
    : null;
  const destino = tramo?.paradaDestinoId
    ? paradas.find((p) => p.id === tramo.paradaDestinoId) ?? null
    : null;
  const franja = tramo?.ventana ? `${tramo.ventana.inicio}–${tramo.ventana.fin}` : null;
  const franjaPropuesta = tramo?.ventanaPropuesta
    ? `${tramo.ventanaPropuesta.inicio}–${tramo.ventanaPropuesta.fin}`
    : null;
  return {
    ...ruta,
    precioTotal: presupuesto?.total ?? ruta.precioTotal,
    tramoActivoId: tramo?.id ?? null,
    paradaOrigen: origen,
    paradaDestino: destino,
    etiquetaOrigen: origen?.etiqueta ?? null,
    etiquetaDestino: destino?.etiqueta ?? null,
    direccionOrigen: origen?.direccion ?? null,
    direccionDestino: destino?.direccion ?? null,
    direccion: destino?.direccion ?? origen?.direccion ?? null,
    conductorId: tramo?.conductorId ?? null,
    fecha: tramo?.ventana?.fecha ?? null,
    fechaPropuesta: tramo?.ventanaPropuesta?.fecha ?? null,
    franja,
    franjaPropuesta,
    ventanaModo: tramo?.ventanaModo ?? null,
    seguro: tramo?.seguro ?? false,
    reprogramaciones: tramo?.reprogramaciones ?? 0,
    descripcionServicio:
      (destino?.servicios?.[0]?.descripcion ?? ruta.perfilServicio) || 'Servicio',
    presupuesto,
    importe: presupuesto?.total ?? tramo?.importe ?? null,
  };
}
