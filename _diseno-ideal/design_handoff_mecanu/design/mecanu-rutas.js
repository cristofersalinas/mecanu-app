/* Mecanu — MODELO DE LOGÍSTICA.
   RUTA (card del kanban) = N PARADAS + (N-1) TRASLADOS. Cada TRASLADO tiene sus LOGS.
   Ids: TR-* rutas (conservados de los traslados antiguos) · PD-* paradas · TS-* traslados · LG-* logs.

   Este módulo re-exporta todo mecanu-data.js y mecanu-pipeline.js: el panel importa solo este.
   No hay backend: las mutaciones las hace el panel sobre una capa de actualizaciones en memoria.
   // TODO API: cada constructor de log marca el punto donde iría el POST real. */

export * from './mecanu-data.js';
export * from './mecanu-pipeline.js';

import {
  HOY, at, CLIENTES, VEHICULOS, CONDUCTORES, TALLER, cliente, vehiculo, conductor,
  servicio, INSPECCIONES_RAW, ZONAS_CARROCERIA, foto, OPORTUNIDADES_BASE, DIAS_SEMANA,
  localizarDireccion,
} from './mecanu-data.js';

import {
  ESTADO, subestadoMeta, etiquetaParada, etiquetaPaso, PARADA_SUBTIPOS, ROLES_TRAMO,
  INDICADOR_TRAMO, TAGS_DERIVADOS, TAGS_MANUALES, PRESUPUESTO_META, PRESUPUESTO_PENDIENTES,
  DIAS_CADUCIDAD_OFERTA, SERVICIO_TRASLADO_ID, seComunicaAlCliente,
} from './mecanu-pipeline.js';

const DIA = 86400000;

/* Direcciones de proveedores que no son el taller propio. */
export const PROVEEDORES = {
  taller:   TALLER.direccion,
  itv:      'Estació ITV Gran Via, Carrer del Foc 68, 08038 Barcelona',
  chapista: 'Xapa i Pintura Delgado, Carrer de Sants 210, 08028 Barcelona',
  otro:     'Carrer de Numància 105, Nau 3, 08029 Barcelona',
};

const dirCliente = (id) => { const c = cliente(id); return c ? c.direccion : null; };
const franjaStr = (v) => (v && v.inicio ? `${v.inicio} - ${v.fin}` : null);
const horaNum = (hhmm) => Number(String(hhmm).split(':')[0]);
const fechaEn = (dia, hhmm) => at(horaNum(hhmm), Number(String(hhmm).split(':')[1] || 0), dia);

/* ══════════════════════════════════════════════════════════════
   1 · ESPECIFICACIÓN DE RUTAS
   Las 15 primeras son la migración 1:1 de los traslados dummy antiguos
   (mismos ids, clientes, vehículos, conductores, fechas, franjas, seguro e importes).
   Las siguientes cubren las casuísticas que no estaban representadas.
   ══════════════════════════════════════════════════════════════ */

const P = (tipo, subtipo, extra) => Object.assign({ tipo, subtipo: subtipo || null }, extra || {});
const cli = (extra) => P('cliente', null, extra);
const prov = (subtipo, extra) => P('proveedor', subtipo, extra);

const RUTAS_RAW = [
  /* ───── MIGRADAS ───── */
  { id: 'TR-1042', clienteId: 'c1', vehiculoId: 'v1', perfil: 'estimable',
    estado: 'completado', subestado: 'ok', servicio: 'Revisión de 60.000 km',
    reparacion: 284.5, presEstado: 'aceptada', tagsManual: ['vip'], clienteTieneAuto: false, vehiculoListo: true,
    paradas: [cli(), prov('taller'), cli()],
    tramos: [
      { rol: 'ida',    conductorId: 'd1', dia: 0, franja: '08:00 - 09:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 45, confirmado: true },
      { rol: 'vuelta', conductorId: 'd1', dia: 0, franja: '13:00 - 14:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 45, confirmado: true },
    ] },

  { id: 'TR-1041', clienteId: 'c9', vehiculoId: 'v9', perfil: 'mismo_dia',
    estado: 'completado', subestado: 'ok', servicio: 'ITV y pastillas de freno',
    reparacion: 196.0, presEstado: 'aceptada', clienteTieneAuto: false, vehiculoListo: true,
    paradas: [cli(), prov('taller'), cli()],
    tramos: [
      { rol: 'ida',    conductorId: 'd3', dia: -1, franja: '09:00 - 10:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 42, confirmado: true },
      { rol: 'vuelta', conductorId: 'd3', dia: -1, franja: '17:00 - 18:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 42, confirmado: true },
    ] },

  { id: 'TR-1040', clienteId: 'c4', vehiculoId: 'v4', perfil: 'mismo_dia',
    estado: 'completado', subestado: 'ok', servicio: 'Cambio de aceite y filtros',
    reparacion: 132.9, presEstado: 'aceptada', clienteTieneAuto: false, vehiculoListo: true,
    paradas: [cli(), prov('taller'), cli()],
    tramos: [
      { rol: 'ida',    conductorId: 'd2', dia: -1, franja: '11:00 - 12:00', seguro: false, estado: 'completado', modo: 'fija_taller', importe: 38, confirmado: true },
      { rol: 'vuelta', conductorId: 'd2', dia: -1, franja: '16:00 - 17:00', seguro: false, estado: 'completado', modo: 'fija_taller', importe: 38, confirmado: true },
    ] },

  { id: 'TR-1039', clienteId: 'c6', vehiculoId: 'v8', perfil: 'estimable',
    estado: 'completado', subestado: 'ok', servicio: 'Mantenimiento de flota',
    reparacion: 410.25, presEstado: 'aceptada', tagsManual: ['tg-flota'], clienteTieneAuto: false, vehiculoListo: true,
    paradas: [cli(), prov('taller'), cli()],
    tramos: [
      { rol: 'ida',    conductorId: 'd1', dia: -2, franja: '16:00 - 17:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 55, confirmado: true },
      { rol: 'vuelta', conductorId: 'd1', dia: -2, franja: '19:00 - 20:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 55, confirmado: true },
    ] },

  /* Ida completada + vuelta creada sin fecha, con conductor distinto en cada tramo (casos 1 y 5). */
  { id: 'TR-1043', clienteId: 'c2', vehiculoId: 'v2', perfil: 'estimable',
    estado: 'en_taller', subestado: 'esperando_agenda_vuelta', servicio: 'Ruido en tren delantero',
    reparacion: 340.0, presEstado: 'aceptada', clienteTieneAuto: null, vehiculoListo: false,
    paradas: [cli(), prov('taller'), cli()],
    tramos: [
      { rol: 'ida',    conductorId: 'd2', dia: 0, franja: '09:00 - 10:00', seguro: false, estado: 'completado', modo: 'fija_taller', importe: 40, confirmado: true },
      { rol: 'vuelta', conductorId: 'd1', dia: null, franja: null, seguro: false, estado: 'sin_agenda', modo: 'propuesta_taller', importe: 40 },
    ] },

  /* Solo ida completada, sin vuelta creada → upsell vivo (caso parcial 3, sin larga custodia). */
  { id: 'TR-1044', clienteId: 'c3', vehiculoId: 'v3', perfil: 'abierto',
    estado: 'en_taller', subestado: 'oportunidad_vuelta', servicio: 'Neumáticos y alineación',
    reparacion: 620.75, presEstado: 'aceptada', clienteTieneAuto: null, vehiculoListo: false,
    lineasExtra: [{ descripcion: 'Revisión de fugas en amortiguador delantero', importe: 45, origen: 'manual' }],
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd3', dia: 0, franja: '10:00 - 11:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 48, confirmado: true },
    ] },

  /* Solo ida, el taller aún no sabe si el cliente retiró el coche (caso 4). */
  { id: 'TR-1045', clienteId: 'c7', vehiculoId: 'v6', perfil: 'abierto',
    estado: 'en_taller', subestado: 'pendiente_confirmar_retiro', servicio: 'Diagnóstico de testigo motor',
    reparacion: 95.0, presEstado: 'aceptada', clienteTieneAuto: null, vehiculoListo: true,
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd1', dia: 0, franja: '12:00 - 13:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 36, confirmado: true },
    ] },

  /* Nacida de una campaña aceptada (caso: campaña aceptada → ruta en AGENDADO). */
  { id: 'TR-1046', clienteId: 'c5', vehiculoId: 'v5', perfil: 'estimable',
    estado: 'agendado', subestado: 'aceptado', servicio: 'Revisión de garantía',
    reparacion: 0, presEstado: 'valorada', campanaOrigenId: 'CMP-3008',
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd2', dia: 0, franja: '16:00 - 17:00', seguro: true, estado: 'agendado', modo: 'slots_cliente', importe: 44, confirmado: true },
    ] },

  /* Dos reprogramaciones → tag derivado "inestable" (caso 13). */
  { id: 'TR-1047', clienteId: 'c6', vehiculoId: 'v7', perfil: 'estimable',
    estado: 'agendado', subestado: 'asignado', servicio: 'Cambio de embrague',
    reparacion: 0, presEstado: 'valorada', tagsManual: ['tg-flota'],
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd4', dia: 1, franja: '09:00 - 10:00', seguro: false, estado: 'agendado', modo: 'fija_taller', importe: 52, reprogramaciones: 2, confirmado: true },
    ] },

  { id: 'TR-1048', clienteId: 'c8', vehiculoId: 'v1', perfil: 'estimable',
    estado: 'agendado', subestado: 'aceptado', servicio: 'Aire acondicionado',
    reparacion: 0, presEstado: 'valorada',
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd3', dia: 1, franja: '11:00 - 12:00', seguro: true, estado: 'agendado', modo: 'slots_cliente', importe: 41, confirmado: true },
    ] },

  /* Ventana fijada por el taller sin confirmación del cliente → tag "sin_confirmar_cliente". */
  { id: 'TR-1049', clienteId: 'c9', vehiculoId: 'v9', perfil: 'mismo_dia',
    estado: 'agendado', subestado: 'asignado', servicio: 'Pre-ITV',
    reparacion: 0, presEstado: 'valorada',
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd5', dia: 1, franja: '17:00 - 18:00', seguro: true, estado: 'agendado', modo: 'fija_taller', importe: 39, confirmado: false },
    ] },

  { id: 'TR-1050', clienteId: 'c4', vehiculoId: 'v4', perfil: 'abierto',
    estado: 'prospectos', subestado: 'propuesto', servicio: 'Consulta por embrague',
    reparacion: 0, presEstado: 'nueva',
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: null, dia: null, franja: null, seguro: false, estado: 'sin_agenda',
        modo: 'propuesta_taller', importe: 40, propuesta: { dia: 2, franja: '10:00 - 11:00' } },
    ] },

  { id: 'TR-1051', clienteId: null, vehiculoId: null, matriculaLead: '9012 XYZ', perfil: 'abierto',
    estado: 'prospectos', subestado: 'sin_fecha', servicio: 'Matrícula 9012 XYZ sin cita',
    reparacion: 0, presEstado: 'nueva',
    paradas: [cli({ direccion: null })],
    tramos: [] },

  /* Oferta enviada nacida de una campaña (caso 8). */
  { id: 'TR-1052', clienteId: null, vehiculoId: null, matriculaLead: '3312 HGF', perfil: 'abierto',
    estado: 'prospectos', subestado: 'oferta_enviada', servicio: 'Link enviado, matrícula 3312 HGF',
    reparacion: 0, presEstado: 'enviada', campanaOrigenId: 'OP-3001',
    link: { token: 'K7QM2X', dia: 0, hora: '09:30' }, tagsManual: ['tg-att'],
    paradas: [cli({ direccion: null }), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: null, dia: null, franja: null, seguro: false, estado: 'sin_agenda', modo: 'slots_cliente', importe: 40 },
    ] },

  { id: 'TR-1038', clienteId: 'c3', vehiculoId: 'v8', perfil: 'estimable',
    estado: 'cancelado', subestado: 'por_cliente', servicio: 'Revisión anual',
    reparacion: 0, presEstado: 'caducada',
    motivo: 'El cliente cambió de planes y prefiere llevarlo él mismo',
    cancelada: { dia: -1, hora: '09:15' },
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd2', dia: -1, franja: '09:00 - 10:00', seguro: false, estado: 'cancelado', modo: 'fija_taller', importe: 40, confirmado: true },
    ] },

  /* ───── NUEVAS (casuísticas no cubiertas) ───── */

  /* Caso 2 · ITV el mismo día: Cliente → ITV → Cliente, ambos tramos agendados, mismo conductor. */
  { id: 'TR-1053', clienteId: 'c3', vehiculoId: 'v8', perfil: 'mismo_dia',
    estado: 'agendado', subestado: 'aceptado', servicio: 'Inspección técnica (ITV)',
    reparacion: 0, presEstado: 'valorada',
    paradas: [cli(), prov('itv'), cli()],
    tramos: [
      { rol: 'ida',    conductorId: 'd2', dia: 1, franja: '08:00 - 09:00', seguro: true, estado: 'agendado', modo: 'slots_cliente', importe: 40, confirmado: true },
      { rol: 'vuelta', conductorId: 'd2', dia: 1, franja: '13:00 - 14:00', seguro: true, estado: 'agendado', modo: 'slots_cliente', importe: 40, confirmado: true },
    ] },

  /* Caso 3 · 11 días en la parada, sin vuelta creada → oportunidad_vuelta + larga_custodia. */
  { id: 'TR-1054', clienteId: 'c10', vehiculoId: 'v10', perfil: 'abierto',
    estado: 'en_taller', subestado: 'oportunidad_vuelta', servicio: 'Reparación de caja de cambios',
    reparacion: 980.0, presEstado: 'enviada', presModo: 'solo_total', clienteTieneAuto: null, vehiculoListo: false,
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd1', dia: -11, franja: '09:00 - 10:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 43, confirmado: true },
    ] },

  /* Caso 6 · agendado a menos de 24 h sin conductor → sin_conductor + en_riesgo. */
  { id: 'TR-1055', clienteId: 'c11', vehiculoId: 'v11', perfil: 'estimable',
    estado: 'agendado', subestado: 'sin_conductor', servicio: 'Sustitución de amortiguadores',
    reparacion: 465.0, presEstado: 'aceptada',
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: null, dia: 1, franja: '08:00 - 09:00', seguro: true, estado: 'agendado', modo: 'slots_cliente', importe: 47, confirmado: true },
    ] },

  /* Caso 7 · un tramo en cada uno de los 4 subestados de EN RUTA. */
  { id: 'TR-1056', clienteId: 'c12', vehiculoId: 'v12', perfil: 'mismo_dia',
    estado: 'en_ruta', subestado: 'en_camino_origen', servicio: 'Cambio de batería',
    reparacion: 148.0, presEstado: 'aceptada',
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd1', dia: 0, franja: '10:00 - 11:00', seguro: true, estado: 'en_curso', modo: 'slots_cliente', importe: 44, confirmado: true },
    ] },

  { id: 'TR-1057', clienteId: 'c13', vehiculoId: 'v13', perfil: 'mismo_dia',
    estado: 'en_ruta', subestado: 'en_origen', servicio: 'Revisión de frenos',
    reparacion: 210.0, presEstado: 'aceptada',
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd2', dia: 0, franja: '11:00 - 12:00', seguro: true, estado: 'en_curso', modo: 'fija_taller', importe: 47, confirmado: true },
    ] },

  { id: 'TR-1058', clienteId: 'c5', vehiculoId: 'v14', perfil: 'estimable',
    estado: 'en_ruta', subestado: 'en_transito', servicio: 'Diagnóstico de climatizador',
    reparacion: 0, presEstado: 'valorada',
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd3', dia: 0, franja: '12:00 - 13:00', seguro: true, estado: 'en_curso', modo: 'slots_cliente', importe: 51, confirmado: true },
    ] },

  /* Vuelta en curso: la ida ya se completó hace 3 días. */
  { id: 'TR-1059', clienteId: 'c2', vehiculoId: 'v15', perfil: 'estimable',
    estado: 'en_ruta', subestado: 'en_destino', servicio: 'Sustitución de embrague',
    reparacion: 890.0, presEstado: 'aceptada', vehiculoListo: true,
    paradas: [cli(), prov('taller'), cli()],
    tramos: [
      { rol: 'ida',    conductorId: 'd4', dia: -3, franja: '09:00 - 10:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 46, confirmado: true },
      { rol: 'vuelta', conductorId: 'd4', dia: 0, franja: '13:00 - 14:00', seguro: true, estado: 'en_curso', modo: 'slots_cliente', importe: 46, confirmado: true },
    ] },

  /* Caso 9 · oferta de hace 20 días sin respuesta → el cron la marca caducada. */
  { id: 'TR-1060', clienteId: null, vehiculoId: null, matriculaLead: '7734 PKR', perfil: 'abierto',
    estado: 'prospectos', subestado: 'oferta_enviada', servicio: 'Presupuesto de embrague',
    reparacion: 0, presEstado: 'caducada', link: { token: 'B3ZR9T', dia: -20, hora: '11:05' },
    paradas: [cli({ direccion: null }), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: null, dia: null, franja: null, seguro: false, estado: 'sin_agenda', modo: 'slots_cliente', importe: 40 },
    ] },

  /* Caso 11 · no-show del cliente en la recogida. */
  { id: 'TR-1061', clienteId: 'c4', vehiculoId: 'v4', perfil: 'mismo_dia',
    estado: 'cancelado', subestado: 'fallido_origen', servicio: 'Cambio de escobillas y filtro',
    reparacion: 0, presEstado: 'caducada',
    motivo: 'El cliente no estaba en el punto de recogida y no contestó al teléfono',
    cancelada: { dia: -3, hora: '10:35' },
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd5', dia: -3, franja: '10:00 - 11:00', seguro: true, estado: 'cancelado', modo: 'fija_taller', importe: 40, confirmado: true },
    ] },

  /* Caso 12 · el cliente se llevó el coche sin vuelta. */
  { id: 'TR-1062', clienteId: 'c9', vehiculoId: 'v9', perfil: 'abierto',
    estado: 'completado', subestado: 'retirado_por_cliente', servicio: 'Cambio de correa de distribución',
    reparacion: 545.0, presEstado: 'aceptada', clienteTieneAuto: true, vehiculoListo: true,
    paradas: [cli(), prov('taller')],
    tramos: [
      { rol: 'ida', conductorId: 'd3', dia: -6, franja: '08:00 - 09:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 37, confirmado: true },
    ] },

  /* Caso 14 · multi-parada: Cliente → Taller → Chapista → Taller → Cliente (5 paradas, 4 tramos). */
  { id: 'TR-1063', clienteId: 'c6', vehiculoId: 'v16', perfil: 'abierto',
    estado: 'en_taller', subestado: 'esperando_agenda_vuelta', servicio: 'Siniestro: mecánica y chapa',
    reparacion: 1240.0, presEstado: 'aceptada', tagsManual: ['tg-flota', 'no_rodante'],
    clienteTieneAuto: null, vehiculoListo: false,
    paradas: [
      cli(),
      prov('taller',   { servicios: ['Diagnóstico y desmontaje de lateral derecho'] }),
      prov('chapista', { servicios: ['Chapa y pintura del lateral derecho'] }),
      prov('taller',   { servicios: ['Montaje y revisión final'] }),
      cli(),
    ],
    tramos: [
      { rol: 'ida',     conductorId: 'd1', dia: -9, franja: '08:00 - 09:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 45, confirmado: true },
      { rol: 'interno', conductorId: 'd1', dia: -6, franja: '10:00 - 11:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 60 },
      { rol: 'interno', conductorId: 'd2', dia: -1, franja: '09:00 - 10:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 60 },
      { rol: 'vuelta',  conductorId: null, dia: null, franja: null, seguro: true, estado: 'sin_agenda', modo: 'propuesta_taller', importe: 45 },
    ] },

  /* Subestados de COMPLETADO que faltaban. */
  { id: 'TR-1064', clienteId: 'c7', vehiculoId: 'v6', perfil: 'estimable',
    estado: 'completado', subestado: 'con_incidencia', servicio: 'Cambio de embrague',
    reparacion: 720.0, presEstado: 'aceptada', clienteTieneAuto: false, vehiculoListo: true,
    incidencia: 'Rayón leve en el retrovisor derecho detectado en la entrega. Abierto parte con el seguro.',
    paradas: [cli(), prov('taller'), cli()],
    tramos: [
      { rol: 'ida',    conductorId: 'd4', dia: -15, franja: '09:00 - 10:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 43, confirmado: true },
      { rol: 'vuelta', conductorId: 'd4', dia: -14, franja: '17:00 - 18:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 43, confirmado: true },
    ] },

  /* Vuelta ya agendada pero el taller no ha confirmado que el coche esté listo → entrega_en_riesgo. */
  { id: 'TR-1066', clienteId: 'c12', vehiculoId: 'v18', perfil: 'estimable',
    estado: 'agendado', subestado: 'aceptado', servicio: 'Distribución y bomba de agua',
    reparacion: 615.0, presEstado: 'aceptada', clienteTieneAuto: null, vehiculoListo: false,
    paradas: [cli(), prov('taller'), cli()],
    tramos: [
      { rol: 'ida',    conductorId: 'd2', dia: -2, franja: '08:00 - 09:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 41, confirmado: true },
      { rol: 'vuelta', conductorId: 'd3', dia: 1, franja: '18:00 - 19:00', seguro: true, estado: 'agendado', modo: 'propuesta_taller', importe: 41, confirmado: true },
    ] },

  { id: 'TR-1065', clienteId: 'c1', vehiculoId: 'v1', perfil: 'estimable',
    estado: 'completado', subestado: 'pendiente_cierre', servicio: 'Cambio de neumáticos',
    reparacion: 310.0, presEstado: 'aceptada', clienteTieneAuto: false, vehiculoListo: true,
    paradas: [cli(), prov('taller'), cli()],
    tramos: [
      { rol: 'ida',    conductorId: 'd2', dia: -4, franja: '10:00 - 11:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 42, confirmado: true },
      { rol: 'vuelta', conductorId: 'd2', dia: -4, franja: '18:00 - 19:00', seguro: true, estado: 'completado', modo: 'fija_taller', importe: 42, confirmado: true },
    ] },
];

/* ══════════════════════════════════════════════════════════════
   2 · CONSTRUCCIÓN DEL MODELO
   ══════════════════════════════════════════════════════════════ */

export const PARADAS = [];
export const TRASLADOS = [];
export const LOGS = [];
export const RUTAS = [];
export const PRESUPUESTOS = [];

let logSeq = 0;
function log(trasladoId, tipo, ts, actor, triggerSource, payload) {
  const l = { id: `LG-${String(++logSeq).padStart(4, '0')}`, trasladoId, tipo, ts, actor, triggerSource, payload: payload || null };
  LOGS.push(l);
  return l;
}

function linea(descripcion, importe, origen, servicioTemparioId) {
  return { descripcion, importe, origen, servicioTemparioId: servicioTemparioId || null };
}

function crearPresupuesto(id, spec) {
  const p = Object.assign({
    id, campanaId: null, vehiculoId: null, rutaOrigenId: null, rutaGeneradaId: null,
    modo: 'detallado', lineas: [], estado: 'nueva', ivaIncluido: true, creado: null, actualizado: null,
  }, spec);
  p.total = Math.round(p.lineas.reduce((a, l) => a + l.importe, 0) * 100) / 100;
  PRESUPUESTOS.push(p);
  return p;
}

RUTAS_RAW.forEach((raw) => {
  const dirCli = raw.clienteId ? dirCliente(raw.clienteId) : null;

  /* — PARADAS — */
  const paradas = raw.paradas.map((p, i) => {
    const direccion = p.direccion !== undefined ? p.direccion : (p.tipo === 'cliente' ? dirCli : PROVEEDORES[p.subtipo || 'taller']);
    const loc = localizarDireccion(direccion);
    return {
      id: `PD-${raw.id.replace('TR-', '')}-${i + 1}`,
      rutaId: raw.id,
      orden: i + 1,
      tipo: p.tipo,
      subtipo: p.subtipo,
      etiqueta: etiquetaParada(p),
      direccion,
      localidad: loc.localidad,
      sublocalidad: loc.sublocalidad,
      servicios: (p.servicios || (p.tipo === 'proveedor' && i === 1 ? [raw.servicio] : []))
        .map((s) => ({ descripcion: s, presupuestoId: `PR-${raw.id}` })),
      llegadaReal: null,
      salidaReal: null,
    };
  });

  /* — TRASLADOS (tramos) — */
  const tramos = raw.tramos.map((t, i) => {
    const origen = paradas[i], destino = paradas[i + 1] || null;
    const ventana = t.dia !== null && t.franja
      ? { fecha: fechaEn(t.dia, t.franja.split(' - ')[0]), inicio: t.franja.split(' - ')[0], fin: t.franja.split(' - ')[1] }
      : null;
    const propuesta = t.propuesta
      ? { fecha: fechaEn(t.propuesta.dia, t.propuesta.franja.split(' - ')[0]), inicio: t.propuesta.franja.split(' - ')[0], fin: t.propuesta.franja.split(' - ')[1] }
      : null;
    return {
      id: `TS-${raw.id.replace('TR-', '')}-${i + 1}`,
      rutaId: raw.id,
      orden: i + 1,
      rol: t.rol,
      paradaOrigenId: origen ? origen.id : null,
      paradaDestinoId: destino ? destino.id : null,
      conductorId: t.conductorId || null,
      ventana,
      ventanaPropuesta: propuesta,   // REVISAR: ubicación provisional — fecha tentativa de un prospecto
      ventanaModo: t.modo,
      clienteConfirmo: t.confirmado === undefined ? null : t.confirmado,
      estado: t.estado,
      subestado: t.estado === 'en_curso' ? raw.subestado : null,
      seguro: !!t.seguro,
      importe: t.importe,
      reprogramaciones: t.reprogramaciones || 0,
      comunicaAlCliente: seComunicaAlCliente(origen, destino),
    };
  });

  /* Llegadas y salidas reales de cada parada, deducidas de los tramos completados. */
  tramos.forEach((t) => {
    if (t.estado !== 'completado' || !t.ventana) return;
    const salida = new Date(t.ventana.fecha);
    const llegada = new Date(t.ventana.fecha.getTime() + 45 * 60000);
    const o = paradas.find((p) => p.id === t.paradaOrigenId);
    const d = paradas.find((p) => p.id === t.paradaDestinoId);
    if (o && !o.salidaReal) o.salidaReal = salida;
    if (d && !d.llegadaReal) d.llegadaReal = llegada;
  });

  /* — RUTA — */
  const cancelada = raw.cancelada ? fechaEn(raw.cancelada.dia, raw.cancelada.hora) : null;
  const linkEnviadoEn = raw.link ? fechaEn(raw.link.dia, raw.link.hora) : null;

  const ruta = {
    id: raw.id,
    vehiculoId: raw.vehiculoId || null,
    clienteId: raw.clienteId || null,
    perfilServicio: raw.perfil,
    modeloPrecio: 'paquete',
    precioTotal: Math.round(tramos.reduce((a, t) => a + (t.importe || 0), 0) * 100) / 100,
    estado: raw.estado,
    subestado: raw.subestado,
    tagsManual: (raw.tagsManual || []).slice(),
    clienteTieneAuto: raw.clienteTieneAuto === undefined ? null : raw.clienteTieneAuto,
    vehiculoListo: raw.vehiculoListo === undefined ? null : raw.vehiculoListo,  // REVISAR: ubicación provisional — alimenta el tag entrega_en_riesgo
    campanaOrigenId: raw.campanaOrigenId || null,
    presupuestoId: `PR-${raw.id}`,
    motivo: raw.motivo || null,
    canceladaEn: cancelada,
    incidencia: raw.incidencia || null,   // REVISAR: ubicación provisional — resumen de COMPLETADO.con_incidencia
    matriculaLead: raw.matriculaLead || null,
    linkToken: raw.link ? raw.link.token : null,
    linkEnviadoEn,
    creadaEn: tramos[0] && tramos[0].ventana ? new Date(tramos[0].ventana.fecha.getTime() - DIA) : (linkEnviadoEn || at(9, 0, -1)),
  };

  /* — PRESUPUESTO de la ruta (una línea por reparación + una línea por tramo) — */
  const lineas = [];
  if (raw.reparacion) lineas.push(linea(raw.servicio, raw.reparacion, 'manual'));
  (raw.lineasExtra || []).forEach((l) => lineas.push(linea(l.descripcion, l.importe, l.origen, l.servicioTemparioId)));
  tramos.forEach((t) => lineas.push(linea(
    `Traslado ${ROLES_TRAMO[t.rol].corto.toLowerCase()} · ${etiquetaParada(paradas.find((p) => p.id === t.paradaOrigenId))} → ${etiquetaParada(paradas.find((p) => p.id === t.paradaDestinoId))}`,
    t.importe, 'traslado', SERVICIO_TRASLADO_ID)));

  crearPresupuesto(`PR-${raw.id}`, {
    vehiculoId: ruta.vehiculoId, rutaOrigenId: null, rutaGeneradaId: raw.id,
    campanaId: raw.campanaOrigenId || null,
    modo: raw.presModo || 'detallado',
    lineas, estado: raw.presEstado, creado: ruta.creadaEn, actualizado: ruta.creadaEn,
  });

  /* — LOGS retroactivos, coherentes con el estado y las fechas del registro — */
  tramos.forEach((t) => {
    const base = t.ventana ? t.ventana.fecha : (linkEnviadoEn || ruta.creadaEn);
    const menos = (min) => new Date(base.getTime() - min * 60000);
    const mas = (min) => new Date(base.getTime() + min * 60000);
    const d = t.conductorId ? conductor(t.conductorId) : null;
    const nombreCond = d ? d.nombre : null;

    log(t.id, 'cambio_estado', menos(16 * 60), 'Rubén Ortega', 'manual',
      { a: 'creado', texto: `Tramo ${ROLES_TRAMO[t.rol].corto.toLowerCase()} creado desde el mostrador del taller` });

    if (ruta.linkToken && t.orden === 1) {
      log(t.id, 'comunicacion', linkEnviadoEn, 'Sistema', 'api',
        { canal: 'whatsapp', texto: `Link de autoagendamiento enviado al cliente`, detalle: `Matrícula pre-registrada: ${ruta.matriculaLead || '—'}` });
    }

    if (t.ventana && t.ventanaModo === 'slots_cliente') {
      log(t.id, 'comunicacion', menos(14 * 60), 'Cliente', 'api',
        { canal: 'link', texto: 'El cliente eligió franja de recogida', detalle: franjaStr(t.ventana) });
    }
    if (t.ventana && t.ventanaModo !== 'slots_cliente') {
      log(t.id, 'comunicacion', menos(13 * 60), 'Rubén Ortega', 'manual',
        { canal: 'whatsapp', texto: 'Ventana comunicada al cliente', detalle: franjaStr(t.ventana) });
    }
    if (t.reprogramaciones) {
      for (let i = 0; i < t.reprogramaciones; i++) {
        log(t.id, 'cambio_estado', menos((12 - i * 3) * 60), 'Rubén Ortega', 'manual',
          { a: 'agendado', texto: 'Ventana reprogramada a petición del cliente' });
      }
    }
    if (nombreCond) {
      log(t.id, 'cambio_estado', menos(11 * 60), 'Rubén Ortega', 'manual',
        { a: 'asignado', texto: `Conductor asignado: ${nombreCond}` });
    }
    if (t.estado === 'en_curso' || t.estado === 'completado') {
      log(t.id, 'cambio_estado', menos(20), nombreCond || 'Conductor', 'conductor',
        { a: 'en_camino_origen', texto: 'El conductor va camino del origen' });
      log(t.id, 'gps', menos(6), nombreCond || 'Conductor', 'conductor', { texto: 'Posición actualizada a 2,1 km del origen' });
      log(t.id, 'cambio_estado', mas(2), nombreCond || 'Conductor', 'conductor', { a: 'en_origen', texto: 'Conductor en el punto de recogida' });
    }
    if (t.estado === 'completado') {
      log(t.id, 'evidencia', mas(18), nombreCond || 'Conductor', 'conductor',
        { texto: 'Check-in con fotos y firma de estado', tipoEvidencia: t.rol === 'vuelta' ? 'check-out' : 'check-in', rutaId: ruta.id });
      log(t.id, 'cambio_estado', mas(24), nombreCond || 'Conductor', 'conductor', { a: 'en_transito', texto: 'Vehículo en tránsito' });
      log(t.id, 'cambio_estado', mas(41), nombreCond || 'Conductor', 'conductor', { a: 'en_destino', texto: 'Conductor en el destino' });
      log(t.id, 'cambio_estado', mas(45), nombreCond || 'Conductor', 'conductor', { a: 'completado', texto: 'Tramo completado' });
    }
    if (t.estado === 'cancelado') {
      log(t.id, 'incidencia', cancelada || mas(15), 'Rubén Ortega', 'manual',
        { texto: `Ruta cancelada · ${subestadoMeta(ruta.estado, ruta.subestado).label}`, motivo: ruta.motivo });
    }
  });

  if (ruta.incidencia) {
    const ult = tramos[tramos.length - 1];
    log(ult.id, 'incidencia', ult.ventana ? new Date(ult.ventana.fecha.getTime() + 50 * 60000) : ruta.creadaEn,
      'Rubén Ortega', 'manual', { texto: 'Incidencia registrada en la entrega', detalle: ruta.incidencia });
  }

  PARADAS.push.apply(PARADAS, paradas);
  TRASLADOS.push.apply(TRASLADOS, tramos);
  RUTAS.push(ruta);
});

/* ── Cron simulado: ofertas sin respuesta pasadas de plazo → caducado ── */
RUTAS.forEach((r) => {
  if (r.estado !== 'prospectos' || r.subestado !== 'oferta_enviada' || !r.linkEnviadoEn) return;
  if (Date.now() - r.linkEnviadoEn.getTime() < DIAS_CADUCIDAD_OFERTA * DIA) return;
  r.subestado = 'caducado';
  const primero = TRASLADOS.find((t) => t.rutaId === r.id);
  if (primero) {
    log(primero.id, 'cambio_estado', new Date(r.linkEnviadoEn.getTime() + DIAS_CADUCIDAD_OFERTA * DIA), 'Sistema', 'cron',
      { a: 'caducado', texto: `Oferta sin respuesta ${DIAS_CADUCIDAD_OFERTA} días: pasa a leads fríos` });
  }
});

LOGS.sort((a, b) => a.ts - b.ts);

/* ══════════════════════════════════════════════════════════════
   3 · ACCESO Y DERIVACIONES
   ══════════════════════════════════════════════════════════════ */

export const ruta = (id) => RUTAS.find((r) => r.id === id) || null;
export const rutaVista = (id) => { const r = ruta(id); return r ? vistaRuta(r) : null; };
export const parada = (id) => PARADAS.find((p) => p.id === id) || null;
export const tramo = (id) => TRASLADOS.find((t) => t.id === id) || null;
export const presupuesto = (id) => PRESUPUESTOS.find((p) => p.id === id) || null;

export const paradasDeRuta = (rutaId) => PARADAS.filter((p) => p.rutaId === rutaId).sort((a, b) => a.orden - b.orden);
export const tramosDeRuta = (rutaId) => TRASLADOS.filter((t) => t.rutaId === rutaId).sort((a, b) => a.orden - b.orden);
export const logsDeTramo = (tramoId) => LOGS.filter((l) => l.trasladoId === tramoId);
export const logsDeRuta = (rutaId) => {
  const ids = tramosDeRuta(rutaId).map((t) => t.id);
  return LOGS.filter((l) => ids.indexOf(l.trasladoId) >= 0);
};

export const rutasDeCliente = (id) => RUTAS.filter((r) => r.clienteId === id).map(vistaRuta);
export const rutasDeVehiculo = (id) => RUTAS.filter((r) => r.vehiculoId === id).map(vistaRuta);
export const rutasDeConductor = (id) => {
  const rutaIds = TRASLADOS.filter((t) => t.conductorId === id).map((t) => t.rutaId);
  return RUTAS.filter((r) => rutaIds.indexOf(r.id) >= 0).map(vistaRuta);
};

const ESTADOS_ABIERTOS = ['prospectos', 'agendado', 'en_ruta', 'en_taller'];
export const rutaAbiertaDeVehiculo = (vehiculoId, excluirId) =>
  RUTAS.find((r) => r.vehiculoId === vehiculoId && r.id !== excluirId && ESTADOS_ABIERTOS.indexOf(r.estado) >= 0) || null;

/** Tramo activo: el primero no completado ni cancelado; si todos cerraron, el último. */
export function tramoActivo(rutaId) {
  const ts = tramosDeRuta(rutaId);
  if (!ts.length) return null;
  const enCurso = ts.find((t) => t.estado === 'en_curso');
  if (enCurso) return enCurso;
  const pendiente = ts.find((t) => t.estado === 'agendado' || t.estado === 'sin_agenda');
  return pendiente || ts[ts.length - 1];
}

/** Parada en la que reposa el coche ahora mismo (la última con llegada y sin salida). */
export function paradaActual(rutaId) {
  const ps = paradasDeRuta(rutaId);
  for (let i = ps.length - 1; i >= 0; i--) if (ps[i].llegadaReal && !ps[i].salidaReal) return ps[i];
  return null;
}

export function destinoDeTramoActivo(rutaId) {
  const t = tramoActivo(rutaId); if (!t) return null;
  return PARADAS.find((p) => p.id === t.paradaDestinoId) || null;
}

export function diasEnParada(p) {
  if (!p || !p.llegadaReal) return null;
  const fin = p.salidaReal ? p.salidaReal.getTime() : Date.now();
  return Math.floor((fin - p.llegadaReal.getTime()) / DIA);
}

/** Derivado: dónde está el vehículo. */
export function ubicacionVehiculo(vehiculoId) {
  const r = rutaAbiertaDeVehiculo(vehiculoId);
  if (!r) return { ubicacionActual: 'con_cliente', paradaActualId: null, rutaId: null };
  if (r.estado === 'en_ruta') return { ubicacionActual: 'en_viaje', paradaActualId: null, rutaId: r.id };
  const p = paradaActual(r.id);
  if (p && p.tipo === 'proveedor') return { ubicacionActual: 'en_parada', paradaActualId: p.id, rutaId: r.id };
  return { ubicacionActual: 'con_cliente', paradaActualId: p ? p.id : null, rutaId: r.id };
}

/** Contactos del vehículo, derivados de la relación muchos-a-muchos con CLIENTES. */
export function contactosDeVehiculo(vehiculoId) {
  const v = vehiculo(vehiculoId);
  if (!v) return [];
  return v.usuarios.map((u) => {
    const c = cliente(u.clienteId);
    return {
      clienteId: u.clienteId, nombre: c ? c.nombre : '—',
      rol: u.principal ? 'titular' : 'otro', relacion: u.relacion,
      telefono: c ? c.telefono : null, email: c ? c.email : null,
    };
  });
}

/* ── Tags ── */

export function tagsDeRuta(r, ahora) {
  if (!r) return [];
  const now = ahora || Date.now();
  const tramos = tramosDeRuta(r.id);
  const activo = tramoActivo(r.id);
  const ctx = {
    ruta: r, tramos, activo,
    vuelta: tramos.find((t) => t.rol === 'vuelta') || null,
    paradaActual: paradaActual(r.id),
    inicioActivo: activo && activo.ventana ? activo.ventana.fecha.getTime() : null,
    ahora: now,
  };
  const derivados = TAGS_DERIVADOS.filter((t) => {
    try { return !!t.calc(ctx); } catch (e) { return false; }
  }).map((t) => ({ id: t.id, label: t.label, color: t.color, derivado: true }));
  const manuales = (r.tagsManual || []).map((id) => TAGS_MANUALES.find((t) => t.id === id))
    .filter(Boolean).map((t) => ({ id: t.id, label: t.label, color: t.color, emoji: t.emoji || '', derivado: false }));
  return derivados.concat(manuales);
}

/* ── Indicador de tramo activo y trayecto de la card ── */

export function tramoActivoVista(r) {
  if (!r) return null;
  const activo = tramoActivo(r.id);
  const ps = paradasDeRuta(r.id);
  if (r.estado === 'en_taller') {
    const p = paradaActual(r.id);
    const sub = PARADA_SUBTIPOS[(p && p.subtipo) || 'taller'];
    return {
      label: sub.enTaller, icono: INDICADOR_TRAMO.reposo.icono,
      origen: p ? p.etiqueta : '—', destino: null,
      trayecto: p ? p.etiqueta : '—', esReposo: true,
    };
  }
  if (!activo) return null;
  const o = ps.find((p) => p.id === activo.paradaOrigenId);
  const d = ps.find((p) => p.id === activo.paradaDestinoId);
  const ind = INDICADOR_TRAMO[activo.rol] || INDICADOR_TRAMO.interno;
  return {
    label: ind.label, icono: ind.icono,
    origen: o ? o.etiqueta : '—', destino: d ? d.etiqueta : '—',
    trayecto: `${o ? o.etiqueta : '—'} → ${d ? d.etiqueta : '—'}`, esReposo: false,
  };
}

/** Pasos del StatusTimeline: salen de las paradas de la ruta, no de una lista fija. */
export function pasosDeRuta(rutaId) {
  const ps = paradasDeRuta(rutaId);
  return ps.map((p, i) => etiquetaPaso(p, i, ps.length));
}

export function pasoActualDeRuta(r) {
  const ps = paradasDeRuta(r.id);
  if (!ps.length) return 0;
  if (r.estado === 'completado') return ps.length - 1;
  const actual = paradaActual(r.id);
  if (actual) return actual.orden - 1;
  const activo = tramoActivo(r.id);
  if (!activo) return 0;
  const o = ps.find((p) => p.id === activo.paradaOrigenId);
  return o ? o.orden - 1 : 0;
}

/* ── Fachada de lectura: lo que la tabla, el kanban y los KPIs necesitan de una ruta ── */

export function vistaRuta(r) {
  if (!r) return null;
  const activo = tramoActivo(r.id);
  const tramos = tramosDeRuta(r.id);
  const pres = presupuesto(r.presupuestoId);
  const ventana = activo && activo.ventana ? activo.ventana : (activo && activo.ventanaPropuesta ? activo.ventanaPropuesta : null);
  /* La dirección es un dato físico de la PARADA: no depende de que haya ventana comprometida.
     Origen/destino del tramo activo; sin tramo activo, la primera y la última parada de la ruta. */
  const ps = paradasDeRuta(r.id);
  const pOrigen = (activo && ps.find((p) => p.id === activo.paradaOrigenId)) || ps[0] || null;
  const pDestino = (activo && ps.find((p) => p.id === activo.paradaDestinoId)) || ps[ps.length - 1] || null;
  return Object.assign({}, r, {
    tramoActivoId: activo ? activo.id : null,
    paradaOrigen: pOrigen,
    paradaDestino: pDestino,
    etiquetaOrigen: pOrigen ? pOrigen.etiqueta : null,
    etiquetaDestino: pDestino ? pDestino.etiqueta : null,
    direccionOrigen: pOrigen ? pOrigen.direccion : null,
    direccionDestino: pDestino ? pDestino.direccion : null,
    direccion: pOrigen ? pOrigen.direccion : null,
    conductorId: activo ? activo.conductorId : null,
    fecha: activo && activo.ventana ? activo.ventana.fecha : null,
    fechaPropuesta: ventana ? ventana.fecha : null,
    franja: activo && activo.ventana ? franjaStr(activo.ventana) : null,
    franjaPropuesta: ventana ? franjaStr(ventana) : null,
    ventanaModo: activo ? activo.ventanaModo : null,
    seguro: tramos.length ? tramos.every((t) => t.seguro) : false,
    reprogramaciones: tramos.reduce((a, t) => Math.max(a, t.reprogramaciones || 0), 0),
    descripcionServicio: descripcionServicioDeRuta(r.id),
    presupuesto: pres,
    importe: pres && pres.total ? pres.total : null,
  });
}

export function descripcionServicioDeRuta(rutaId) {
  const servicios = paradasDeRuta(rutaId).reduce((acc, p) => acc.concat(p.servicios.map((s) => s.descripcion)), []);
  return servicios.length ? servicios.join(' · ') : '—';
}

/** Las rutas tal y como las consume el panel (tabla, kanban, KPIs). */
export const RUTAS_VISTA = RUTAS.map(vistaRuta)
  .sort((a, b) => (a.fecha ? a.fecha.getTime() : 8.64e15) - (b.fecha ? b.fecha.getTime() : 8.64e15));

/** Actividad de la ficha: sale de logs[] reales, no de un array de demo. */
export function actividadDeRuta(rutaId) {
  return logsDeRuta(rutaId).slice().reverse().map((l) => ({
    id: l.id, fecha: l.ts, tipo: l.tipo, actor: l.actor, triggerSource: l.triggerSource,
    label: (l.payload && l.payload.texto) || l.tipo,
    detalle: (l.payload && (l.payload.detalle || l.payload.motivo)) || null,
    tipoEvidencia: l.payload ? l.payload.tipoEvidencia : null,
    trasladoId: l.trasladoId,
  }));
}

/* ══════════════════════════════════════════════════════════════
   4 · INSPECCIONES (evidencia del check-in / check-out del conductor)
   Están indexadas por ruta; cada una pertenece al tramo que la generó.
   ══════════════════════════════════════════════════════════════ */

export function inspeccionesDeRuta(rutaId) {
  const r = ruta(rutaId);
  const raw = INSPECCIONES_RAW[rutaId] || [];
  const tramos = tramosDeRuta(rutaId);
  return raw.map((i) => {
    const v = r && vehiculo(r.vehiculoId);
    const d = conductor(i.inspector);
    const t = i.tipo === 'check-out'
      ? (tramos.filter((x) => x.rol === 'vuelta')[0] || tramos[tramos.length - 1])
      : (tramos[0] || null);
    return Object.assign({}, i, {
      rutaId, trasladoId: t ? t.id : null,
      fecha: at(i.fechaH[0], i.fechaH[1], i.dia),
      inspectorNombre: d ? d.nombre : '—',
      sede: `${TALLER.nombre} · ${TALLER.direccion}`,
      vehiculo: {
        matricula: v ? v.matricula : '—',
        modelo: v ? `${v.marca} ${v.modelo} ${v.anio}` : '—',
        vin: i.vin, km: i.km, combustible: i.combustible, combustiblePct: i.combustiblePct,
      },
      itvVence: new Date(i.itv.vence[2], i.itv.vence[1] - 1, i.itv.vence[0]),
      zonas: ZONAS_CARROCERIA.map((z) => ({ zona: z, dano: i.danos.find((x) => x.zona === z) || null })),
      danos: i.danos.map((x) => Object.assign({}, x, { fotoUrl: x.foto ? foto(x.foto) : null })),
      hallazgos: i.hallazgos.map((x) => Object.assign({}, x, { fotoUrl: x.foto ? foto(x.foto) : null })),
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   5 · CAMPAÑAS · el presupuesto vive aquí (fuente única de verdad)
   Una inspección con hallazgos crea automáticamente una campaña.
   ══════════════════════════════════════════════════════════════ */

/* Estado y vínculos de cada campaña. `rutaOrigen` = la ruta cuyo check-in la generó. */
const CAMPANA_META = {
  'OP-3001': { estado: 'enviada',   rutaOrigenId: 'TR-1040', rutaGeneradaId: 'TR-1052', inspeccionId: null, modo: 'detallado' },
  'OP-3002': { estado: 'valorada',  rutaOrigenId: 'TR-1042', inspeccionId: 'CHK-9982', modo: 'detallado' },
  'OP-3003': { estado: 'enviada',   rutaOrigenId: 'TR-1041', inspeccionId: null, modo: 'detallado' },
  'OP-3004': { estado: 'nueva',     rutaOrigenId: 'TR-1044', inspeccionId: 'CHK-9973', modo: 'detallado',
               lineasExtra: [{ descripcion: 'Limpieza de inyectores', importe: 89, origen: 'manual' }], conTraslado: true },
  'OP-3005': { estado: 'rechazada', rutaOrigenId: 'TR-1043', inspeccionId: 'CHK-9971', modo: 'detallado' },
  'OP-3006': { estado: 'valorada',  rutaOrigenId: 'TR-1047', inspeccionId: null, modo: 'detallado' },
  'OP-3007': { estado: 'nueva',     rutaOrigenId: 'TR-1045', inspeccionId: null, modo: 'detallado' },
};

/* Campañas nuevas que cubren los estados y los casos que faltaban. */
const CAMPANAS_EXTRA = [
  { id: 'CMP-3008', clienteId: 'c5', vehiculoId: 'v5', estado: 'aceptada',
    rutaOrigenId: null, rutaGeneradaId: 'TR-1046', modo: 'detallado',
    falla: 'Revisión de garantía de los 2 años', fotoSeed: 'cmp3008-garantia', ultimo: { dow: 2, hora: 16 },
    lineas: [{ descripcion: 'Revisión oficial de garantía', importe: 0, origen: 'manual' }] },

  { id: 'CMP-3009', clienteId: 'c10', vehiculoId: 'v10', estado: 'enviada',
    rutaOrigenId: 'TR-1054', modo: 'solo_total',
    falla: 'Presupuesto cerrado de caja de cambios', fotoSeed: 'cmp3009-caja', ultimo: { dow: 3, hora: 11 },
    lineas: [{ descripcion: 'Presupuesto cerrado (sin desglose)', importe: 1180, origen: 'manual' }] },

  { id: 'CMP-3010', clienteId: 'c14', vehiculoId: 'v17', estado: 'nueva',
    rutaOrigenId: null, modo: 'detallado',
    falla: 'Cotización propuesta al taller · vehículo sin traslados previos',
    fotoSeed: 'cmp3010-nuevo', ultimo: { dow: 5, hora: 10 },
    lineas: [{ descripcion: 'Revisión de 30.000 km', importe: 165, origen: 'manual' }] },

  { id: 'CMP-3011', clienteId: 'c6', vehiculoId: 'v8', estado: 'aceptada',
    rutaOrigenId: 'TR-1039', inspeccionId: 'CHK-9920', modo: 'detallado',
    falla: 'Focos opacos y extintor caducado detectados en el check-in de hace 2 días',
    fotoSeed: 'chk9920-focos', ultimo: { dow: 2, hora: 8 },
    lineas: [
      { descripcion: 'Pulido y sellado cerámico de focos', importe: 45, origen: 'inspeccion' },
      { descripcion: 'Recarga o venta de extintor PQS 1 kg', importe: 25, origen: 'inspeccion' },
    ] },
];

function lineasDeOportunidad(o, meta) {
  const lineas = (o.items || []).map((it) => linea(
    it.servicio ? it.servicio.nombre : it.falla, it.valor, 'inspeccion', it.servicio ? it.servicio.id : null));
  (meta.lineasExtra || []).forEach((l) => lineas.push(linea(l.descripcion, l.importe, l.origen)));
  if (meta.conTraslado) {
    const sv = servicio(SERVICIO_TRASLADO_ID);
    lineas.push(linea('Traslado a domicilio · ida y vuelta', sv ? Math.round(sv.totalIva * 2 * 100) / 100 : 88, 'traslado', SERVICIO_TRASLADO_ID));
  }
  return lineas;
}

const DOW = DIAS_SEMANA;

/** Campañas = oportunidades del pipeline de Campañas, cada una con SU presupuesto. */
export const CAMPANAS = OPORTUNIDADES_BASE.map((o) => {
  const meta = CAMPANA_META[o.id] || { estado: 'nueva', modo: 'detallado' };
  const p = crearPresupuesto(`PR-${o.id}`, {
    campanaId: o.id, vehiculoId: o.vehiculoId,
    rutaOrigenId: meta.rutaOrigenId || null, rutaGeneradaId: meta.rutaGeneradaId || null,
    modo: meta.modo, lineas: lineasDeOportunidad(o, meta), estado: meta.estado,
    creado: o.fecha, actualizado: o.fecha,
  });
  return Object.assign({}, o, {
    rutaOrigenId: meta.rutaOrigenId || null,
    rutaGeneradaId: meta.rutaGeneradaId || null,
    inspeccionId: meta.inspeccionId !== undefined ? meta.inspeccionId : o.inspeccionId,
    presupuestoId: p.id, presupuesto: p, estado: meta.estado,
    origenAutomatico: !!meta.inspeccionId,
  });
}).concat(CAMPANAS_EXTRA.map((c) => {
  const items = [];
  const p = crearPresupuesto(`PR-${c.id}`, {
    campanaId: c.id, vehiculoId: c.vehiculoId,
    rutaOrigenId: c.rutaOrigenId || null, rutaGeneradaId: c.rutaGeneradaId || null,
    modo: c.modo, lineas: c.lineas.map((l) => linea(l.descripcion, l.importe, l.origen)),
    estado: c.estado, creado: at(9, 0, -3), actualizado: at(9, 0, -1),
  });
  const habito = `${DOW[c.ultimo.dow]} ${String(c.ultimo.hora).padStart(2, '0')}:00`;
  return {
    id: c.id, clienteId: c.clienteId, vehiculoId: c.vehiculoId,
    rutaOrigenId: c.rutaOrigenId || null, rutaGeneradaId: c.rutaGeneradaId || null,
    inspeccionId: c.inspeccionId || null,
    items, tipos: [], etiquetas: [], falla: c.falla,
    evidencia: c.inspeccionId ? 'Detectado en la inspección visual' : 'Cotización propuesta por el taller',
    valor: p.total, servicio: null, urgente: false, severidad: 'warning',
    fecha: at(9, 0, 12), habito, motivoFecha: `Su horario habitual · ${habito}`,
    fotoUrl: foto(c.fotoSeed), estadoEnvio: 'pendiente',
    presupuestoId: p.id, presupuesto: p, estado: c.estado,
    origenAutomatico: !!c.inspeccionId,
  };
}));

/** Alias histórico: el pipeline de Campañas trabaja con estas mismas cards. */
export const OPORTUNIDADES = CAMPANAS;

export const campana = (id) => CAMPANAS.find((c) => c.id === id) || null;
export const oportunidadesPorTipo = (tipo) =>
  tipo === 'todas' ? CAMPANAS : CAMPANAS.filter((o) => (o.tipos || []).indexOf(tipo) >= 0);

/** Badge de la pestaña Campañas: campañas pendientes de acción del taller. */
export const campanasPendientes = (lista) =>
  (lista || CAMPANAS).filter((c) => PRESUPUESTO_PENDIENTES.indexOf(c.estado) >= 0).length;

/** Una inspección con hallazgos crea campaña automáticamente.
    // TODO API: en producción lo dispara el webhook del check-in del conductor. */
export function campanaDesdeInspeccion(insp, rutaId) {
  const hallazgos = (insp.hallazgos || []).filter((h) => h.servicio);
  if (!hallazgos.length) return null;
  const r = ruta(rutaId);
  const id = `CMP-${Math.floor(Math.random() * 9000 + 1000)}`;
  const p = crearPresupuesto(`PR-${id}`, {
    campanaId: id, vehiculoId: r ? r.vehiculoId : null, rutaOrigenId: rutaId,
    modo: 'detallado', estado: 'nueva', creado: new Date(), actualizado: new Date(),
    lineas: hallazgos.map((h) => linea(h.servicio.nombre, h.servicio.precio, 'inspeccion')),
  });
  return {
    id, clienteId: r ? r.clienteId : null, vehiculoId: r ? r.vehiculoId : null,
    rutaOrigenId: rutaId, rutaGeneradaId: null, inspeccionId: insp.id,
    items: [], tipos: [], etiquetas: [],
    falla: hallazgos.map((h) => h.item).join(' · '),
    evidencia: `${hallazgos.length} servicios detectados en la inspección`,
    valor: p.total, servicio: null, urgente: false, severidad: 'warning',
    fecha: at(9, 0, 14), habito: '—', motivoFecha: 'Detectado en el check-in',
    fotoUrl: insp.hallazgos[0] && insp.hallazgos[0].fotoUrl, estadoEnvio: 'pendiente',
    presupuestoId: p.id, presupuesto: p, estado: 'nueva', origenAutomatico: true,
  };
}
