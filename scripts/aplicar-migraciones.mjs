#!/usr/bin/env node
/**
 * Aplica supabase/migrations/*.sql a mecanu-dev vía Management API
 * o DATABASE_URL (postgres). No imprime secretos.
 *
 *   DATABASE_URL=postgres://... node scripts/aplicar-migraciones.mjs
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/aplicar-migraciones.mjs
 *
 * Orden: 0001, 0002, 0003, 0004, 0006 (salta 0005 a propósito).
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIG_DIR = join(ROOT, 'supabase', 'migrations');
const REF = 'tacbxioroopotvpkwmsj';

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(ROOT, '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m || process.env[m[1]]) continue;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* no .env.local */ }
}

loadEnvLocal();

const files = readdirSync(MIG_DIR)
  .filter((f) => /^\d{4}_.*\.sql$/.test(f) && !f.startsWith('0005_'))
  .sort();

async function viaDatabaseUrl(sql) {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  // psql si existe
  try {
    execFileSync('psql', [url, '-v', 'ON_ERROR_STOP=1', '-c', sql], {
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    return true;
  } catch (e) {
    console.error('psql falló; ¿está instalado y es válida DATABASE_URL?');
    throw e;
  }
}

async function viaManagementApi(sql) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) return false;
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${text.slice(0, 400)}`);
  }
  return true;
}

async function main() {
  console.log('Migraciones a aplicar:', files.join(', '));
  for (const f of files) {
    const sql = readFileSync(join(MIG_DIR, f), 'utf8');
    console.log('→', f);
    let ok = false;
    try {
      ok = await viaManagementApi(sql);
    } catch (e) {
      console.error(e.message || e);
      process.exit(1);
    }
    if (!ok) {
      try {
        ok = await viaDatabaseUrl(sql);
      } catch {
        process.exit(1);
      }
    }
    if (!ok) {
      console.error(`
No hay SUPABASE_ACCESS_TOKEN ni DATABASE_URL.

Opciones:
  1) Dashboard Supabase → SQL Editor → pegar el contenido de cada archivo en orden
     (0001, 0002, 0003, 0004, 0006; NO 0005).
  2) supabase.com/dashboard/account/tokens → crear token → 
     SUPABASE_ACCESS_TOKEN=sbp_… node scripts/aplicar-migraciones.mjs
  3) DATABASE_URL=postgresql://postgres.… node scripts/aplicar-migraciones.mjs
`);
      process.exit(2);
    }
    console.log('  ok');
  }
  console.log('Listo.');
}

main();
