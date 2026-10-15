#!/usr/bin/env node
/**
 * Invita un usuario a mecanu-dev (Auth + perfiles + app_metadata).
 *
 *   node scripts/invitar-usuario.mjs \
 *     --email tu@taller.es --nombre "Nombre" --rol operacion
 *
 * Con contraseña (login email+password en /panel/entrar):
 *   --password '********'
 *
 * Si el email ya existe, actualiza contraseña y perfil.
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
const password = arg('password');
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

async function findUserByEmail(target) {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

const appMeta = {
  taller_id: TALLER,
  rol,
  conductor_id: conductorId || null,
  nombre,
};

let userId = null;

const createPayload = {
  email,
  email_confirm: true,
  app_metadata: appMeta,
};
if (password) createPayload.password = password;

const { data: created, error: authErr } = await sb.auth.admin.createUser(createPayload);

if (authErr) {
  const exists = /already|registered|exists/i.test(authErr.message);
  if (!exists) {
    console.error('Auth:', authErr.message || 'sin user');
    process.exit(1);
  }
  const existing = await findUserByEmail(email);
  if (!existing) {
    console.error('Auth: email duplicado pero no encontrado en listUsers');
    process.exit(1);
  }
  userId = existing.id;
  const { error: updErr } = await sb.auth.admin.updateUserById(userId, {
    email_confirm: true,
    app_metadata: { ...existing.app_metadata, ...appMeta },
    ...(password ? { password } : {}),
  });
  if (updErr) {
    console.error('Auth update:', updErr.message);
    process.exit(1);
  }
} else if (!created?.user) {
  console.error('Auth: sin user');
  process.exit(1);
} else {
  userId = created.user.id;
}

const { error: perfilErr } = await sb.from('perfiles').upsert({
  id: userId,
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

console.log('OK', email, '→', userId, `(${rol}, ${TALLER})`);
console.log('Entra en http://localhost:3000/panel/entrar');
