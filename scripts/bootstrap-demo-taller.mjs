#!/usr/bin/env node
/**
 * Prepara mecanu-dev para probar el panel con datos demo + un usuario taller.
 *
 *   npm run db:bootstrap
 *
 * Lee de .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   DEMO_PANEL_EMAIL (default c@mecanu.com)
 *   DEMO_PANEL_PASSWORD (obligatoria)
 *
 * 1) Seed de taller-rodriguez (clientes, rutas mínimas, campaña…)
 * 2) Usuario panel vinculado a ese taller
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

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

const email = (process.env.DEMO_PANEL_EMAIL || 'c@mecanu.com').trim().toLowerCase();
const password = process.env.DEMO_PANEL_PASSWORD || '';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}
if (!password) {
  console.error('Falta DEMO_PANEL_PASSWORD en .env.local');
  process.exit(1);
}

console.log('→ seed mock completo');
execFileSync('npx', ['tsx', join(ROOT, 'scripts', 'seed-mock-full.ts')], {
  stdio: 'inherit',
  env: process.env,
  cwd: ROOT,
});

console.log('→ usuario panel', email);
execFileSync(process.execPath, [
  join(ROOT, 'scripts', 'invitar-usuario.mjs'),
  '--email', email,
  '--nombre', 'Taller demo Mecanu',
  '--rol', 'operacion',
  '--password', password,
], {
  stdio: 'inherit',
  env: process.env,
});

console.log('');
console.log('Listo. En .env.local pon también:');
console.log('  MECANU_USE_SUPABASE=1');
console.log('  NEXT_PUBLIC_MECANU_USE_SUPABASE=1');
console.log('');
console.log('Entra: http://localhost:3000/panel/entrar');
