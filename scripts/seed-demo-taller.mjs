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

console.log('OK seed', TALLER, '→ 2 clientes, 2 vehículos, 1 conductor (d1)');
console.log('Activa MECANU_USE_SUPABASE=1 en .env.local para APIs/repo Postgres');
