#!/usr/bin/env node
/**
 * Escenario aditivo para probar agendado → en_ruta de punta a punta.
 * No borra el seed completo: upsert por ids propios (TR-AVANCE-1, d-avance, …).
 * Si el escenario ya existía (p. ej. el viaje se inició), lo deja otra vez en agendado.
 * Cada ejecución recalcula la ventana (inicio ~20 min en el futuro) para que el
 * conductor no muestre «Atrasado» al abrir la demo.
 *
 *   npm run db:seed:avance
 *
 * Pensado para correr encima de `npm run db:seed:full`. También funciona solo
 * (crea el taller si falta).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUERTO_DEMO, PUERTO_DEV } from './dev-puertos.mjs';
import { ventanaComprometidaParaPrueba } from './ventana-demo.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TALLER = 'taller-rodriguez';

const RUTA_ID = 'TR-AVANCE-1';
const TRASLADO_ID = 'TS-AVANCE-1-1';
const CONDUCTOR_ID = 'd-avance';
const CLIENTE_ID = 'c-avance-1';
const VEHICULO_ID = 'v-avance-1';
const PRESUPUESTO_ID = 'PR-AVANCE-1';
const PARADA_ORIGEN_ID = 'PD-AVANCE-1-1';
const PARADA_DESTINO_ID = 'PD-AVANCE-1-2';

const ORIGEN_DIR = 'Carrer de l\'Escorial 50, 1ºB, 08023 Barcelona';
const DESTINO_DIR = 'Carrer de Numància 105, Nau 3, 08029 Barcelona';

function loadEnv() {
  try {
    for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m || process.env[m[1]]) continue;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* .env.local opcional si las vars ya están en el entorno */ }
}

function throwIf(error, donde) {
  if (error) throw new Error(`${donde}: ${error.message}`);
}

function ignorableSchema(error) {
  const msg = error?.message ?? '';
  return /could not find|does not exist|schema cache|relation .* does not exist/i.test(msg);
}

loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const sb = createClient(url, service, { auth: { persistSession: false } });
const ahora = new Date().toISOString();
/* Cada seed recalcula la ventana: si no, al abrir el conductor sale «Atrasado». */
const { fecha, inicio, fin } = ventanaComprometidaParaPrueba();
const originDev = `http://localhost:${PUERTO_DEV}`;
const originDemo = `http://localhost:${PUERTO_DEMO}`;
const emailPanel = (process.env.DEMO_PANEL_EMAIL || 'c@mecanu.com').trim().toLowerCase();
const supabaseUi =
  process.env.MECANU_USE_SUPABASE === '1' && process.env.NEXT_PUBLIC_MECANU_USE_SUPABASE === '1';

const { data: tallerExistente, error: tallerGetErr } = await sb
  .from('talleres')
  .select('id')
  .eq('id', TALLER)
  .maybeSingle();
throwIf(tallerGetErr, 'talleres.select');
if (!tallerExistente) {
  const { error } = await sb.from('talleres').insert({
    id: TALLER,
    nombre: 'Talleres Rodríguez',
    direccion: DESTINO_DIR,
  });
  throwIf(error, 'talleres.insert');
}

const { error: cErr } = await sb.from('clientes').upsert({
  id: CLIENTE_ID,
  taller_id: TALLER,
  nombre: 'Elena Vives Serra',
  tipo: 'Particular',
  telefono: '655 441 220',
  email: 'elena.vives@ejemplo.com',
  direccion: ORIGEN_DIR,
  documento: '43218765X',
  desde: ahora,
});
throwIf(cErr, 'clientes');

const { error: vErr } = await sb.from('vehiculos').upsert({
  id: VEHICULO_ID,
  taller_id: TALLER,
  marca: 'Seat',
  modelo: 'León',
  anio: 2022,
  matricula: '8888 AVA',
  km: 24100,
  color: 'Gris',
});
throwIf(vErr, 'vehiculos');

const { error: vcErr } = await sb.from('vehiculo_clientes').upsert({
  vehiculo_id: VEHICULO_ID,
  cliente_id: CLIENTE_ID,
  relacion: 'Titular',
  principal: true,
});
throwIf(vcErr, 'vehiculo_clientes');

const { error: dErr } = await sb.from('conductores').upsert({
  id: CONDUCTOR_ID,
  taller_id: TALLER,
  nombre: 'Nora Avance',
  telefono: '600 220 110',
  documento: '99887766N',
  red: 'Interna',
  furgoneta: 'Furgón avance',
  proceso: 'activo',
  supervisados: 0,
  requeridos: 5,
  alta: ahora,
  calificacion: 5.0,
  valoraciones: 0,
  docs_dni: true,
  docs_carnet: true,
  docs_iban: true,
  docs_seguro: true,
});
throwIf(dErr, 'conductores');

const { error: prErr } = await sb.from('presupuestos').upsert({
  id: PRESUPUESTO_ID,
  taller_id: TALLER,
  vehiculo_id: VEHICULO_ID,
  modo: 'detallado',
  estado: 'aceptada',
  iva_incluido: true,
  total: 280,
});
throwIf(prErr, 'presupuestos');

const { error: plDelErr } = await sb.from('presupuesto_lineas').delete().eq('presupuesto_id', PRESUPUESTO_ID);
throwIf(plDelErr, 'presupuesto_lineas.delete');
const { error: plErr } = await sb.from('presupuesto_lineas').insert([
  {
    presupuesto_id: PRESUPUESTO_ID,
    descripcion: 'Revisión básica',
    importe: 190,
    origen: 'manual',
    servicio_tempario_id: null,
  },
  {
    presupuesto_id: PRESUPUESTO_ID,
    descripcion: 'Traslado ida',
    importe: 90,
    origen: 'traslado',
    servicio_tempario_id: null,
  },
]);
throwIf(plErr, 'presupuesto_lineas.insert');

const { error: rErr } = await sb.from('rutas').upsert({
  id: RUTA_ID,
  taller_id: TALLER,
  vehiculo_id: VEHICULO_ID,
  cliente_id: CLIENTE_ID,
  perfil_servicio: 'estimable',
  estado: 'agendado',
  subestado: 'asignado',
  tags_manual: [],
  vehiculo_listo: true,
  presupuesto_id: PRESUPUESTO_ID,
  motivo: null,
  incidencia: null,
  creada_en: ahora,
});
throwIf(rErr, 'rutas');

const { error: pErr } = await sb.from('paradas').upsert([
  {
    id: PARADA_ORIGEN_ID,
    ruta_id: RUTA_ID,
    orden: 1,
    tipo: 'cliente',
    subtipo: null,
    direccion: ORIGEN_DIR,
    localidad: 'Barcelona',
    llegada_real: null,
    salida_real: null,
  },
  {
    id: PARADA_DESTINO_ID,
    ruta_id: RUTA_ID,
    orden: 2,
    tipo: 'proveedor',
    subtipo: 'taller',
    direccion: DESTINO_DIR,
    localidad: 'Barcelona',
    llegada_real: null,
    salida_real: null,
  },
]);
throwIf(pErr, 'paradas');

const { error: geoOrigenErr } = await sb.from('paradas').update({
  lat: 41.4084, lng: 2.1596,
}).eq('id', PARADA_ORIGEN_ID);
if (geoOrigenErr && !ignorableSchema(geoOrigenErr)) throwIf(geoOrigenErr, 'paradas.origen.coords');
const { error: geoDestErr } = await sb.from('paradas').update({
  lat: 41.3851, lng: 2.1364,
}).eq('id', PARADA_DESTINO_ID);
if (geoDestErr && !ignorableSchema(geoDestErr)) throwIf(geoDestErr, 'paradas.destino.coords');

const { error: psDelErr } = await sb.from('parada_servicios').delete().eq('parada_id', PARADA_DESTINO_ID);
throwIf(psDelErr, 'parada_servicios.delete');
const { error: psErr } = await sb.from('parada_servicios').insert({
  parada_id: PARADA_DESTINO_ID,
  descripcion: 'Revisión básica',
});
throwIf(psErr, 'parada_servicios.insert');

const { error: tErr } = await sb.from('traslados').upsert({
  id: TRASLADO_ID,
  ruta_id: RUTA_ID,
  orden: 1,
  rol: 'ida',
  parada_origen_id: PARADA_ORIGEN_ID,
  parada_destino_id: PARADA_DESTINO_ID,
  conductor_id: CONDUCTOR_ID,
  ventana_fecha: fecha,
  ventana_inicio: inicio,
  ventana_fin: fin,
  propuesta_fecha: null,
  propuesta_inicio: null,
  propuesta_fin: null,
  ventana_modo: 'fija_taller',
  cliente_confirmo: true,
  estado: 'agendado',
  subestado: null,
  seguro: true,
  importe: 90,
  reprogramaciones: 0,
});
throwIf(tErr, 'traslados');

const { error: posErr } = await sb.from('traslados').update({
  pos_lat: null,
  pos_lng: null,
  pos_precision_m: null,
  pos_actualizada_en: null,
}).eq('id', TRASLADO_ID);
if (posErr && !ignorableSchema(posErr)) throwIf(posErr, 'traslados.pos');

const { error: gpsErr } = await sb.from('traslado_ubicaciones').delete().eq('traslado_id', TRASLADO_ID);
if (gpsErr && !ignorableSchema(gpsErr)) throwIf(gpsErr, 'traslado_ubicaciones.delete');

const { error: logErr } = await sb.from('logs').delete().eq('traslado_id', TRASLADO_ID);
throwIf(logErr, 'logs.delete');

const { error: idempErr } = await sb.from('idempotency_keys').delete().like('key', `%${TRASLADO_ID}%`);
if (idempErr && !ignorableSchema(idempErr)) throwIf(idempErr, 'idempotency_keys.delete');

const { error: solErr } = await sb.from('solicitudes').delete().eq('traslado_id', TRASLADO_ID);
throwIf(solErr, 'solicitudes.delete');

const { error: resetRutaErr } = await sb.from('rutas').update({
  estado: 'agendado',
  subestado: 'asignado',
  motivo: null,
  incidencia: null,
}).eq('id', RUTA_ID);
throwIf(resetRutaErr, 'rutas.reset');

const { data: enCurso, error: r1Err } = await sb
  .from('traslados')
  .select('id')
  .eq('conductor_id', CONDUCTOR_ID)
  .eq('estado', 'en_curso');
throwIf(r1Err, 'r1.check');
if ((enCurso ?? []).length > 0) {
  throw new Error(
    `R1: ${CONDUCTOR_ID} tiene traslados en_curso (${enCurso.map((r) => r.id).join(', ')}). El escenario no está listo.`,
  );
}

const { data: rutaOk, error: rutaGetErr } = await sb
  .from('rutas')
  .select('id, estado, subestado')
  .eq('id', RUTA_ID)
  .single();
throwIf(rutaGetErr, 'rutas.verify');
if (rutaOk.estado !== 'agendado' || rutaOk.subestado !== 'asignado') {
  throw new Error(`Ruta ${RUTA_ID} no quedó en agendado/asignado (${rutaOk.estado}/${rutaOk.subestado}).`);
}

const panelDemoUrl = `${originDemo}/panel?ruta=${encodeURIComponent(RUTA_ID)}`;
const panelLoginUrl = `${originDev}/panel/entrar`;
const conductorUrl = `${originDemo}/conductor?conductorId=${encodeURIComponent(CONDUCTOR_ID)}&traslado=${encodeURIComponent(TRASLADO_ID)}`;
const apiDemoUrl = `${originDemo}/api/v1/panel/rutas/${encodeURIComponent(RUTA_ID)}`;
const apiDevUrl = `${originDev}/api/v1/panel/rutas/${encodeURIComponent(RUTA_ID)}`;

console.log('');
console.log('Escenario avance listo. No se han borrado otros datos.');
console.log('');
console.log(`  Ruta:      ${RUTA_ID}`);
console.log(`  Traslado:  ${TRASLADO_ID}`);
console.log(`  Conductor: ${CONDUCTOR_ID} (Nora Avance) — sin otros viajes en_curso (R1)`);
console.log(`  Cliente:   ${CLIENTE_ID} (Elena Vives Serra — teléfono, email y dirección completos)`);
console.log(`  Ventana:   ${fecha} ${inicio}–${fin} (recalculada ahora; no uses un seed viejo)`);
console.log('');
console.log('Panel');
console.log(`  Demo:  ${panelDemoUrl}`);
console.log(`        npm run demo  → puerto ${PUERTO_DEMO}, entra directo, sin login.`);
console.log(`  Login: ${panelLoginUrl}`);
console.log(`        npm run dev   → puerto ${PUERTO_DEV}, pide sesión.`);
console.log(`        email ${emailPanel}`);
console.log('        contraseña: DEMO_PANEL_PASSWORD en .env.local (no se imprime).');
console.log('');
console.log('Conductor');
console.log(`  URL:  ${conductorUrl}`);
console.log(`  Modo: npm run demo (puerto ${PUERTO_DEMO}). La página no pide login, pero el snapshot`);
console.log('        del conductor solo se sirve sin sesión si MECANU_DEMO=1. Con npm run dev');
console.log(`        (puerto ${PUERTO_DEV}) el snapshot responde 401 y la app cae al mock de d1`);
console.log('        (R1 te bloquea).');
console.log('        Acepta el GPS cuando la app lo pida; si no, GpsGate bloquea el viaje.');
console.log('');
console.log('Para ver estos datos (y no el mock de d1):');
console.log('  MECANU_USE_SUPABASE=1');
console.log('  NEXT_PUBLIC_MECANU_USE_SUPABASE=1');
if (!supabaseUi) {
  console.log('  AVISO: esas flags no están a 1 en este entorno. El seed está en Postgres,');
  console.log('         pero /panel y /conductor seguirán el mock hasta que las actives y rearranques.');
}
console.log('');
console.log('Verificar después:');
console.log(`  GET ${apiDemoUrl}   (npm run demo, sin sesión)`);
console.log(`  GET ${apiDevUrl}   (npm run dev, con cookie del panel)`);
console.log('');
