#!/usr/bin/env node
/**
 * Seed mínimo en mecanu-dev para probar APIs con MECANU_USE_SUPABASE=1.
 * No borra datos. Upsert por id.
 *
 *   npm run db:seed
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TALLER = 'taller-rodriguez';

function loadEnv() {
  try {
    for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m || process.env[m[1]]) continue;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* */ }
}

loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(url, service, { auth: { persistSession: false } });

const ahora = new Date().toISOString();

const { error: tErr } = await sb.from('talleres').upsert({
  id: TALLER,
  nombre: 'Talleres Rodríguez',
  direccion: 'Calle de la Princesa 12, Madrid',
});
if (tErr) throw tErr;

const clientes = [
  {
    id: 'c-seed-1', taller_id: TALLER, nombre: 'Ana Ruiz', tipo: 'Particular',
    telefono: '600111222', email: 'ana@ejemplo.com', direccion: 'Calle Mayor 1, Madrid', desde: ahora,
  },
  {
    id: 'c-seed-2', taller_id: TALLER, nombre: 'Autoflot SL', tipo: 'Empresa',
    telefono: '910000111', email: 'flota@ejemplo.com', direccion: 'Polígono Norte 8, Madrid', desde: ahora,
  },
];
const { error: cErr } = await sb.from('clientes').upsert(clientes);
if (cErr) throw cErr;

const vehiculos = [
  {
    id: 'v-seed-1', taller_id: TALLER, marca: 'Seat', modelo: 'León', anio: 2019,
    matricula: '1234 ABC', km: 82000, color: 'Gris',
  },
  {
    id: 'v-seed-2', taller_id: TALLER, marca: 'VW', modelo: 'Golf', anio: 2021,
    matricula: '5678 DEF', km: 41000, color: 'Blanco',
  },
];
const { error: vErr } = await sb.from('vehiculos').upsert(vehiculos);
if (vErr) throw vErr;

await sb.from('vehiculo_clientes').upsert([
  { vehiculo_id: 'v-seed-1', cliente_id: 'c-seed-1', relacion: 'Titular', principal: true },
  { vehiculo_id: 'v-seed-2', cliente_id: 'c-seed-2', relacion: 'Empresa', principal: true },
]);

const { error: dErr } = await sb.from('conductores').upsert({
  id: 'd1',
  taller_id: TALLER,
  nombre: 'Javier Molina',
  telefono: '600999888',
  red: 'Interna',
  furgoneta: 'Furgón 1',
  proceso: 'activo',
  supervisados: 12,
  requeridos: 5,
  alta: ahora,
  calificacion: 4.8,
  valoraciones: 40,
  docs_dni: true,
  docs_carnet: true,
  docs_iban: true,
  docs_seguro: true,
});
if (dErr) throw dErr;

const { error: sErr } = await sb.from('servicios').upsert({
  id: 'SV-seed-1',
  taller_id: TALLER,
  nombre: 'Revisión básica',
  categoria: 'Mantenimiento',
  horas: 1.5,
  mano_obra: 90,
  materiales: 25,
  aplica: ['Particular', 'Empresa'],
  garantia: '3 meses',
  notas: 'Seed demo',
});
if (sErr) throw sErr;

const manana = new Date();
manana.setDate(manana.getDate() + 1);
const fecha = manana.toISOString().slice(0, 10);

await sb.from('presupuestos').upsert({
  id: 'PR-SEED-1001',
  taller_id: TALLER,
  vehiculo_id: 'v-seed-1',
  modo: 'detallado',
  estado: 'aceptada',
  iva_incluido: true,
  total: 205,
});
await sb.from('presupuesto_lineas').delete().eq('presupuesto_id', 'PR-SEED-1001');
await sb.from('presupuesto_lineas').insert([
  {
    presupuesto_id: 'PR-SEED-1001',
    descripcion: 'Revisión básica',
    importe: 115,
    origen: 'manual',
    servicio_tempario_id: 'SV-seed-1',
  },
  {
    presupuesto_id: 'PR-SEED-1001',
    descripcion: 'Traslado ida',
    importe: 90,
    origen: 'traslado',
    servicio_tempario_id: null,
  },
]);

await sb.from('rutas').upsert({
  id: 'TR-SEED-1001',
  taller_id: TALLER,
  vehiculo_id: 'v-seed-1',
  cliente_id: 'c-seed-1',
  perfil_servicio: 'estimable',
  estado: 'agendado',
  subestado: 'sin_conductor',
  tags_manual: [],
  presupuesto_id: 'PR-SEED-1001',
  creada_en: ahora,
});

await sb.from('paradas').upsert([
  {
    id: 'PD-SEED-1001-1',
    ruta_id: 'TR-SEED-1001',
    orden: 1,
    tipo: 'cliente',
    subtipo: null,
    direccion: 'Calle Mayor 1, Madrid',
    localidad: 'Madrid',
  },
  {
    id: 'PD-SEED-1001-2',
    ruta_id: 'TR-SEED-1001',
    orden: 2,
    tipo: 'proveedor',
    subtipo: 'taller',
    direccion: 'Calle de la Princesa 12, Madrid',
    localidad: 'Madrid',
  },
]);

await sb.from('parada_servicios').delete().eq('parada_id', 'PD-SEED-1001-2');
await sb.from('parada_servicios').insert({
  parada_id: 'PD-SEED-1001-2',
  descripcion: 'Revisión básica',
});

await sb.from('traslados').upsert({
  id: 'TS-SEED-1001-1',
  ruta_id: 'TR-SEED-1001',
  orden: 1,
  rol: 'ida',
  parada_origen_id: 'PD-SEED-1001-1',
  parada_destino_id: 'PD-SEED-1001-2',
  conductor_id: 'd1',
  ventana_fecha: fecha,
  ventana_inicio: '10:00',
  ventana_fin: '11:00',
  ventana_modo: 'fija_taller',
  estado: 'agendado',
  subestado: null,
  seguro: true,
  importe: 90,
  reprogramaciones: 0,
});

await sb.from('rutas').update({
  estado: 'agendado',
  subestado: 'asignado',
}).eq('id', 'TR-SEED-1001');

const { error: campErr } = await sb.from('campanas').upsert({
  id: 'OP-SEED-1',
  taller_id: TALLER,
  cliente_id: 'c-seed-2',
  vehiculo_id: 'v-seed-2',
  falla: 'Pastillas de freno delanteras',
  evidencia: 'Ruido al frenar · inspección visual',
  urgente: false,
  fecha: ahora,
  origen_automatico: false,
});
if (campErr) throw campErr;

await sb.from('presupuestos').upsert({
  id: 'PR-SEED-OP1',
  taller_id: TALLER,
  campana_id: 'OP-SEED-1',
  vehiculo_id: 'v-seed-2',
  modo: 'detallado',
  estado: 'aceptada',
  iva_incluido: true,
  total: 320,
});
await sb.from('presupuesto_lineas').delete().eq('presupuesto_id', 'PR-SEED-OP1');
await sb.from('presupuesto_lineas').insert([
  {
    presupuesto_id: 'PR-SEED-OP1',
    descripcion: 'Pastillas delanteras',
    importe: 230,
    origen: 'manual',
    servicio_tempario_id: null,
  },
  {
    presupuesto_id: 'PR-SEED-OP1',
    descripcion: 'Traslado ida',
    importe: 90,
    origen: 'traslado',
    servicio_tempario_id: null,
  },
]);

console.log('OK seed', TALLER, '→ clientes, vehículos, conductor d1, ruta TR-SEED-1001, campaña OP-SEED-1');
console.log('En .env.local:');
console.log('  MECANU_USE_SUPABASE=1');
console.log('  NEXT_PUBLIC_MECANU_USE_SUPABASE=1');
