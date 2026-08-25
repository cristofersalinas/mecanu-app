#!/usr/bin/env npx tsx
/**
 * Volca el mock completo (mecanu-data + mecanu-rutas) a mecanu-dev.
 *
 *   npm run db:seed:full
 *
 * Requiere .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Los traslados `agendado` cuya franja mock ya pasó se reescriben a ventanas
 * futuras (≈20 min + escalonado) para que el conductor no muestre «Atrasado».
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CLIENTES, CONDUCTORES, SERVICIOS, TALLER, VEHICULOS,
} from '../src/lib/mecanu/mecanu-data';
import {
  CAMPANAS, LOGS, PARADAS, PRESUPUESTOS, RUTAS, TRASLADOS, inspeccionesDeRuta,
} from '../src/lib/mecanu/mecanu-rutas';
import type { CampanaItem, Inspeccion, Log, Parada, Presupuesto, Ruta, Tramo } from '../src/lib/mecanu/types';
import { ventanaComprometidaParaPrueba } from './ventana-demo.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TALLER_ID = 'taller-rodriguez';

function loadEnv() {
  try {
    for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m || process.env[m[1]]) continue;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* */ }
}

/** Fecha civil local (no UTC): evita que un seed a las 23:00 en ES escriba el día de mañana. */
function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isoTs(d: Date | null | undefined): string | null {
  return d ? d.toISOString() : null;
}

function hhmmAFecha(base: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const out = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h || 0, m || 0, 0, 0);
  return out;
}

/** Slots futuros escalonados para traslados agendados cuya franja mock ya pasó. */
let slotAgendadoFuturo = 0;

function ventanaAgendadaFresca(t: Tramo): { fecha: string; inicio: string; fin: string } | null {
  if (!t.ventana?.inicio || !t.ventana?.fin) return null;
  if (t.estado !== 'agendado') {
    return {
      fecha: isoDate(t.ventana.fecha),
      inicio: t.ventana.inicio,
      fin: t.ventana.fin,
    };
  }
  const ini = hhmmAFecha(t.ventana.fecha, t.ventana.inicio);
  if (ini.getTime() >= Date.now()) {
    return {
      fecha: isoDate(t.ventana.fecha),
      inicio: t.ventana.inicio,
      fin: t.ventana.fin,
    };
  }
  /* Margen 20 min + 70 min por cada agendado ya reubicado (sin solapes R5). */
  const ancla = new Date(Date.now() + slotAgendadoFuturo * 70 * 60_000);
  slotAgendadoFuturo += 1;
  return ventanaComprometidaParaPrueba(ancla, { margenMin: 20 });
}

async function upsertBatch(
  sb: SupabaseClient,
  table: string,
  rows: Record<string, unknown>[],
  size = 80,
) {
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const { error } = await sb.from(table).upsert(chunk);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

async function wipeTaller(sb: SupabaseClient) {
  const { data: rutas } = await sb.from('rutas').select('id').eq('taller_id', TALLER_ID);
  const rutaIds = (rutas ?? []).map((r) => r.id as string);

  if (rutaIds.length) {
    await sb.from('solicitudes').delete().in('ruta_id', rutaIds);
    const { data: insps } = await sb.from('inspecciones').select('id').in('ruta_id', rutaIds);
    const inspIds = (insps ?? []).map((i) => i.id as string);
    if (inspIds.length) {
      await sb.from('inspeccion_danos').delete().in('inspeccion_id', inspIds);
      await sb.from('inspeccion_hallazgos').delete().in('inspeccion_id', inspIds);
      await sb.from('inspecciones').delete().in('id', inspIds);
    }
  }

  await sb.from('rutas').update({ presupuesto_id: null, campana_origen_id: null }).eq('taller_id', TALLER_ID);
  await sb.from('campanas').update({
    inspeccion_id: null, ruta_origen_id: null, ruta_generada_id: null,
  }).eq('taller_id', TALLER_ID);
  await sb.from('presupuestos').update({
    campana_id: null, ruta_origen_id: null, ruta_generada_id: null,
  }).eq('taller_id', TALLER_ID);

  await sb.from('rutas').delete().eq('taller_id', TALLER_ID);

  const { data: camps } = await sb.from('campanas').select('id').eq('taller_id', TALLER_ID);
  const campIds = (camps ?? []).map((c) => c.id as string);
  if (campIds.length) {
    await sb.from('campana_items').delete().in('campana_id', campIds);
    await sb.from('campanas').delete().in('id', campIds);
  }

  const { data: pres } = await sb.from('presupuestos').select('id').eq('taller_id', TALLER_ID);
  const presIds = (pres ?? []).map((p) => p.id as string);
  if (presIds.length) {
    await sb.from('presupuesto_lineas').delete().in('presupuesto_id', presIds);
    await sb.from('presupuestos').delete().in('id', presIds);
  }

  const { data: vehs } = await sb.from('vehiculos').select('id').eq('taller_id', TALLER_ID);
  const vehIds = (vehs ?? []).map((v) => v.id as string);
  if (vehIds.length) {
    await sb.from('vehiculo_clientes').delete().in('vehiculo_id', vehIds);
    await sb.from('vehiculos').delete().in('id', vehIds);
  }

  await sb.from('clientes').delete().eq('taller_id', TALLER_ID);

  const { data: conds } = await sb.from('conductores').select('id').eq('taller_id', TALLER_ID);
  const condIds = (conds ?? []).map((c) => c.id as string);
  if (condIds.length) {
    await sb.from('conductor_incidencias').delete().in('conductor_id', condIds);
    await sb.from('conductores').delete().in('id', condIds);
  }

  await sb.from('servicios').delete().eq('taller_id', TALLER_ID);
}

function tramoRow(t: Tramo) {
  const win = t.ventana ? ventanaAgendadaFresca(t) : null;
  return {
    id: t.id,
    ruta_id: t.rutaId,
    orden: t.orden,
    rol: t.rol,
    parada_origen_id: t.paradaOrigenId,
    parada_destino_id: t.paradaDestinoId,
    conductor_id: t.conductorId,
    ventana_fecha: win?.fecha ?? null,
    ventana_inicio: win?.inicio ?? null,
    ventana_fin: win?.fin ?? null,
    propuesta_fecha: t.ventanaPropuesta ? isoDate(t.ventanaPropuesta.fecha) : null,
    propuesta_inicio: t.ventanaPropuesta?.inicio ?? null,
    propuesta_fin: t.ventanaPropuesta?.fin ?? null,
    ventana_modo: t.ventanaModo,
    cliente_confirmo: t.clienteConfirmo,
    estado: t.estado,
    subestado: t.subestado,
    seguro: t.seguro,
    importe: t.importe,
    reprogramaciones: t.reprogramaciones,
    pos_lat: t.posLat ?? null,
    pos_lng: t.posLng ?? null,
    pos_precision_m: t.posPrecisionM ?? null,
    pos_actualizada_en: isoTs(t.posActualizadaEn ?? null),
  };
}

function logRow(l: Log) {
  return {
    id: l.id,
    traslado_id: l.trasladoId,
    tipo: l.tipo,
    ts: isoTs(l.ts)!,
    actor: l.actor,
    trigger_source: l.triggerSource,
    payload: l.payload ?? {},
  };
}

function presupuestoRow(p: Presupuesto, withLinks = false) {
  return {
    id: p.id,
    taller_id: TALLER_ID,
    campana_id: withLinks ? p.campanaId : null,
    vehiculo_id: p.vehiculoId,
    ruta_origen_id: withLinks ? p.rutaOrigenId : null,
    ruta_generada_id: withLinks ? p.rutaGeneradaId : null,
    modo: p.modo,
    estado: p.estado,
    iva_incluido: p.ivaIncluido,
    total: p.total,
  };
}

function campanaItemRow(campanaId: string, it: CampanaItem) {
  return {
    id: it.id,
    campana_id: campanaId,
    tipo: it.tipo,
    origen: it.origen,
    dias: it.dias,
    falla: it.falla,
    registro_idx: it.registroIdx,
    servicio_id: it.servicio?.id ?? null,
    valor: it.valor,
    datos: {
      ...it.datos,
      etiqueta: it.etiqueta,
      fecha: it.fecha.toISOString(),
    },
  };
}

function inspeccionRows(insp: Inspeccion) {
  const row = {
    id: insp.id,
    taller_id: TALLER_ID,
    tipo: insp.tipo,
    ruta_id: insp.rutaId,
    traslado_id: insp.trasladoId,
    fecha: isoTs(insp.fecha)!,
    inspector_id: insp.inspector || null,
    km: insp.km,
    combustible: insp.combustible,
    combustible_pct: insp.combustiblePct,
    limpieza: insp.limpieza,
    vin: insp.vehiculo?.vin ?? null,
    itv_estado: insp.itv?.estado ?? null,
    itv_vence: insp.itvVence ? isoDate(insp.itvVence) : null,
    firma_cliente: insp.firmas?.cliente ?? null,
    firma_conductor: insp.firmas?.conductor ?? null,
  };
  const danos = (insp.danos ?? []).map((d) => ({
    inspeccion_id: insp.id,
    zona: d.zona,
    tipo: d.tipo,
    descripcion: d.descripcion,
    ubicacion: d.ubicacion,
    foto_url: d.fotoUrl ?? null,
  }));
  const hallazgos = (insp.hallazgos ?? []).map((h) => ({
    inspeccion_id: insp.id,
    categoria: h.categoria,
    item: h.item,
    metrica: h.metrica,
    severidad: h.severidad,
    servicio_nombre: h.servicio?.nombre ?? null,
    servicio_precio: h.servicio?.precio ?? null,
    foto_url: h.fotoUrl ?? null,
  }));
  return { row, danos, hallazgos };
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const sb = createClient(url, service, { auth: { persistSession: false } });

  console.log('→ limpiar', TALLER_ID);
  await wipeTaller(sb);

  console.log('→ taller + base');
  await sb.from('talleres').upsert({
    id: TALLER_ID,
    nombre: TALLER.nombre,
    direccion: TALLER.direccion,
  });

  await upsertBatch(sb, 'clientes', CLIENTES.map((c) => ({
    id: c.id,
    taller_id: TALLER_ID,
    nombre: c.nombre,
    tipo: 'Particular',
    telefono: c.telefono,
    email: c.email,
    direccion: c.direccion,
    desde: isoTs(c.desde)!,
  })));

  await upsertBatch(sb, 'conductores', CONDUCTORES.map((d) => ({
    id: d.id,
    taller_id: TALLER_ID,
    nombre: d.nombre,
    telefono: d.telefono,
    red: d.red,
    furgoneta: d.furgoneta,
    proceso: d.proceso,
    supervisados: d.supervisados,
    requeridos: d.requeridos,
    alta: isoTs(d.alta)!,
    calificacion: d.calificacion,
    valoraciones: d.valoraciones,
    docs_dni: d.docs.dni,
    docs_carnet: d.docs.carnet,
    docs_iban: d.docs.iban,
    docs_seguro: d.docs.seguro,
  })));

  const incRows = CONDUCTORES.flatMap((d) => d.incidencias.map((inc) => ({
    conductor_id: d.id,
    fecha: isoTs(inc.fecha)!,
    tipo: inc.tipo,
    gravedad: inc.gravedad,
    detalle: inc.detalle,
  })));
  if (incRows.length) await upsertBatch(sb, 'conductor_incidencias', incRows);

  await upsertBatch(sb, 'servicios', SERVICIOS.map((s) => ({
    id: s.id,
    taller_id: TALLER_ID,
    nombre: s.nombre,
    categoria: s.categoria,
    horas: s.horas,
    mano_obra: s.manoObra,
    materiales: s.materiales,
    aplica: s.aplica,
    garantia: s.garantia,
    notas: s.notas,
  })));

  await upsertBatch(sb, 'vehiculos', VEHICULOS.map((v) => ({
    id: v.id,
    taller_id: TALLER_ID,
    marca: v.marca,
    modelo: v.modelo,
    anio: v.anio,
    matricula: v.matricula,
    km: v.km,
    color: v.color,
  })));

  await upsertBatch(sb, 'vehiculo_clientes', VEHICULOS.flatMap((v) =>
    v.usuarios.map((u) => ({
      vehiculo_id: v.id,
      cliente_id: u.clienteId,
      relacion: u.relacion,
      principal: u.principal,
    }))));

  console.log('→ campañas + presupuestos');
  await upsertBatch(sb, 'campanas', CAMPANAS.map((c) => ({
    id: c.id,
    taller_id: TALLER_ID,
    cliente_id: c.clienteId,
    vehiculo_id: c.vehiculoId,
    ruta_origen_id: null,
    ruta_generada_id: null,
    inspeccion_id: null,
    falla: c.falla,
    evidencia: c.evidencia,
    urgente: c.urgente,
    fecha: isoTs(c.fecha)!,
    foto_url: c.fotoUrl,
    origen_automatico: c.origenAutomatico,
  })));

  await upsertBatch(sb, 'presupuestos', PRESUPUESTOS.map((p) => presupuestoRow(p, false)));

  const lineas = PRESUPUESTOS.flatMap((p) =>
    p.lineas.map((l) => ({
      presupuesto_id: p.id,
      descripcion: l.descripcion,
      importe: l.importe,
      origen: l.origen,
      servicio_tempario_id: l.servicioTemparioId,
    })));
  if (lineas.length) await upsertBatch(sb, 'presupuesto_lineas', lineas);

  const items = CAMPANAS.flatMap((c) => c.items.map((it) => campanaItemRow(c.id, it)));
  if (items.length) await upsertBatch(sb, 'campana_items', items);

  console.log('→ rutas + paradas + traslados + logs');
  await upsertBatch(sb, 'rutas', RUTAS.map((r: Ruta) => ({
    id: r.id,
    taller_id: TALLER_ID,
    vehiculo_id: r.vehiculoId,
    cliente_id: r.clienteId,
    perfil_servicio: r.perfilServicio,
    estado: r.estado,
    subestado: r.subestado,
    tags_manual: r.tagsManual,
    cliente_tiene_auto: r.clienteTieneAuto,
    vehiculo_listo: r.vehiculoListo,
    campana_origen_id: r.campanaOrigenId,
    presupuesto_id: r.presupuestoId,
    motivo: r.motivo,
    cancelada_en: isoTs(r.canceladaEn),
    incidencia: r.incidencia,
    matricula_lead: r.matriculaLead,
    link_token: r.linkToken,
    link_enviado_en: isoTs(r.linkEnviadoEn),
    creada_en: isoTs(r.creadaEn)!,
  })));

  for (const p of PRESUPUESTOS) {
    const { error } = await sb.from('presupuestos').update({
      campana_id: p.campanaId,
      ruta_origen_id: p.rutaOrigenId,
      ruta_generada_id: p.rutaGeneradaId,
    }).eq('id', p.id);
    if (error) throw new Error(`presupuesto link ${p.id}: ${error.message}`);
  }

  for (const c of CAMPANAS) {
    const { error } = await sb.from('campanas').update({
      ruta_origen_id: c.rutaOrigenId,
      ruta_generada_id: c.rutaGeneradaId,
    }).eq('id', c.id);
    if (error) throw new Error(`campana link ${c.id}: ${error.message}`);
  }

  await upsertBatch(sb, 'paradas', PARADAS.map((p: Parada) => ({
    id: p.id,
    ruta_id: p.rutaId,
    orden: p.orden,
    tipo: p.tipo,
    subtipo: p.subtipo,
    direccion: p.direccion,
    localidad: p.localidad,
    sublocalidad: p.sublocalidad,
    lat: p.lat ?? null,
    lng: p.lng ?? null,
    llegada_real: isoTs(p.llegadaReal),
    salida_real: isoTs(p.salidaReal),
  })));

  const paradaSvcs = PARADAS.flatMap((p) =>
    p.servicios.map((s) => ({
      parada_id: p.id,
      descripcion: s.descripcion,
    })));
  if (paradaSvcs.length) await upsertBatch(sb, 'parada_servicios', paradaSvcs);

  await upsertBatch(sb, 'traslados', TRASLADOS.map(tramoRow));
  await upsertBatch(sb, 'logs', LOGS.map(logRow));

  console.log('→ inspecciones');
  const inspDanos: Record<string, unknown>[] = [];
  const inspHall: Record<string, unknown>[] = [];
  const inspRows: Record<string, unknown>[] = [];
  const campInspUpdates: { id: string; inspeccion_id: string | null }[] = [];

  for (const r of RUTAS) {
    for (const insp of inspeccionesDeRuta(r.id)) {
      const { row, danos, hallazgos } = inspeccionRows(insp);
      inspRows.push(row);
      inspDanos.push(...danos);
      inspHall.push(...hallazgos);
    }
  }
  if (inspRows.length) await upsertBatch(sb, 'inspecciones', inspRows);
  if (inspDanos.length) await upsertBatch(sb, 'inspeccion_danos', inspDanos);
  if (inspHall.length) await upsertBatch(sb, 'inspeccion_hallazgos', inspHall);

  for (const c of CAMPANAS) {
    if (c.inspeccionId) {
      campInspUpdates.push({ id: c.id, inspeccion_id: c.inspeccionId });
    }
  }
  for (const u of campInspUpdates) {
    const { error } = await sb.from('campanas').update({ inspeccion_id: u.inspeccion_id }).eq('id', u.id);
    if (error) throw new Error(`campana insp ${u.id}: ${error.message}`);
  }

  console.log('');
  console.log('OK mock completo →', TALLER_ID);
  console.log(`  ${CLIENTES.length} clientes · ${VEHICULOS.length} vehículos · ${CONDUCTORES.length} conductores`);
  console.log(`  ${RUTAS.length} rutas · ${TRASLADOS.length} traslados · ${LOGS.length} logs`);
  console.log(`  ${CAMPANAS.length} campañas · ${PRESUPUESTOS.length} presupuestos · ${inspRows.length} inspecciones`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
