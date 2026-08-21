#!/usr/bin/env node
/**
 * Invita un usuario a mecanu-dev (Auth + perfiles + app_metadata).
 *
 *   node scripts/invitar-usuario.mjs \
 *     --email tu@taller.es --nombre "Nombre" --rol operacion
 *
 * Roles: dueno | operacion | conductor | ops
 * Conductor: añade --conductor-id d1
 *
 * Lee URL + SERVICE_ROLE de .env.local. No imprime secretos.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TALLER = 'taller-rodriguez';

function loadEnv() {
  try {
    const raw = readFileSync(join(ROOT, '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m || process.env[m[1]]) continue;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* */ }
}

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

loadEnv();

const email = (arg('email') || '').trim().toLowerCase();
const nombre = arg('nombre') || email;
const rol = arg('rol') || 'operacion';
const conductorId = arg('conductor-id');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !url || !service) {
  console.error('Falta --email o NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!['dueno', 'operacion', 'conductor', 'ops'].includes(rol)) {
  console.error('rol inválido');
  process.exit(1);
}
if (rol === 'conductor' && !conductorId) {
  console.error('conductor necesita --conductor-id');
  process.exit(1);
}

const sb = createClient(url, service, { auth: { persistSession: false } });

const { data: created, error: authErr } = await sb.auth.admin.createUser({
  email,
  email_confirm: true,
  app_metadata: {
    taller_id: TALLER,
    rol,
    conductor_id: conductorId || null,
    nombre,
  },
});

if (authErr || !created?.user) {
  console.error('Auth:', authErr?.message || 'sin user');
  process.exit(1);
}

const { error: perfilErr } = await sb.from('perfiles').upsert({
  id: created.user.id,
  taller_id: TALLER,
  rol,
  nombre,
  email,
  conductor_id: conductorId || null,
  estado: 'activo',
});

if (perfilErr) {
  console.error('Perfil:', perfilErr.message);
  process.exit(1);
}

console.log('OK', email, '→', created.user.id, `(${rol})`);
console.log('Prueba magic link en http://localhost:3000/entrar');
