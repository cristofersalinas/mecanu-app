-- Bloque 4 — Auditoría inmutable, GPS (retención 30 días) e idempotencia.
-- audit_events: REVOKE UPDATE, DELETE. Solo INSERT + SELECT.
-- Depende de bloques 1–3 (grupos, sucursales, usuarios, conductores, traslados).
-- Reversa: 0004_bloque4_auditoria_gps_infra.down.sql
-- NO APLICA esta migración.

begin;

-- ===========================================================================
-- audit_events — inmutable
-- ===========================================================================
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  ts timestamptz not null default now(),
  actor_id uuid references public.usuarios (id),
  actor_rol text,
  grupo_id uuid references public.grupos (id),
  sucursal_id uuid references public.sucursales (id),
  entidad text not null,
  entidad_id text not null,
  accion text not null,
  payload_antes jsonb,
  payload_despues jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index audit_events_grupo_ts_idx on public.audit_events (grupo_id, ts desc);
create index audit_events_entidad_idx on public.audit_events (entidad, entidad_id);

alter table public.audit_events enable row level security;

revoke all on public.audit_events from public, anon, authenticated;
grant insert, select on public.audit_events to authenticated;
-- Sin UPDATE ni DELETE para nadie de authenticated. Tampoco PUBLIC.
revoke update, delete on public.audit_events from public, anon, authenticated;

create or replace function private.reject_audit_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_events es inmutable: no se permite %', tg_op;
end;
$$;

revoke all on function private.reject_audit_mutation() from public, anon, authenticated;

create trigger trg_audit_events_inmutable
before update or delete on public.audit_events
for each row execute function private.reject_audit_mutation();
-- Segunda red por si alguien reconcede UPDATE/DELETE a mano.

create policy audit_events_insert on public.audit_events
for insert to authenticated
with check (
  private.es_mecanu_admin()
  or (grupo_id is not null and private.puede_ver_grupo(grupo_id))
);
-- Previene: escribir un evento de auditoría colgando de un grupo_id ajeno
-- (fabricar prueba de que "el otro taller canceló"). El trigger de reversión
-- del bloque 3 es SECURITY DEFINER y no pasa por esta política.
-- Roles: usuario autenticado sobre un grupo que ya puede ver; mecanu_admin.

create policy audit_events_select on public.audit_events
for select to authenticated
using (
  private.es_mecanu_admin()
  or (grupo_id is not null and private.es_grupo_admin_de(grupo_id))
);
-- Previene: que un sucursal_admin o un conductor lea el log legal del grupo
-- (impersonaciones, cambios de plan, siniestros).
-- Roles: grupo_admin del propio grupo (permiso audit.ver); mecanu_admin todos.
-- Sin política UPDATE/DELETE: aunque alguien conceda el GRANT a mano, RLS
-- niega (ENABLE RLS + cero políticas = deny).

-- ===========================================================================
-- conductor_locations — trail GPS, retención 30 días
-- ===========================================================================
create table public.conductor_locations (
  conductor_id text not null references public.conductores (id),
  traslado_id text not null references public.traslados (id),
  ts timestamptz not null default now(),
  lat double precision not null,
  lng double precision not null,
  accuracy real,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id),
  primary key (conductor_id, ts)
);

create index conductor_locations_traslado_ts_idx
  on public.conductor_locations (traslado_id, ts desc);

alter table public.conductor_locations enable row level security;
revoke all on public.conductor_locations from public, anon;
grant select, insert on public.conductor_locations to authenticated;

create policy conductor_locations_select on public.conductor_locations
for select to authenticated
using (
  conductor_id = private.conductor_id()
  or exists (
    select 1 from public.traslados t
    where t.id = traslado_id
      and private.puede_escribir_ruta(t.ruta_id)
  )
);
-- Previene: seguir en tiempo real a un conductor de otro taller (dato
-- especialmente sensible, RGPD).
-- Roles: el propio conductor; staff de la ruta; mecanu_admin (vía escribir_ruta).

create policy conductor_locations_insert on public.conductor_locations
for insert to authenticated
with check (
  conductor_id = private.conductor_id()
  and exists (
    select 1 from public.traslados t
    where t.id = traslado_id
      and t.conductor_id = private.conductor_id()
  )
);
-- Previene: inyectar puntos GPS en el trail de otro conductor, o en un
-- traslado que no es el suyo. Sin UPDATE/DELETE: el trail no se reescribe.
-- La retención de 30 días la aplica private.purgar_conductor_locations.

create or replace function private.purgar_conductor_locations()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_n integer;
begin
  delete from public.conductor_locations
  where ts < now() - interval '30 days';
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

revoke all on function private.purgar_conductor_locations() from public, anon, authenticated;
-- Solo un rol con BYPASSRLS / dueño (migración, cron) puede ejecutarla.
-- No se concede a authenticated: un taller no puede vaciar el trail de otro
-- invocando la función.

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'mecanu-purgar-conductor-locations',
      '15 3 * * *',
      $cron$select private.purgar_conductor_locations()$cron$
    );
  end if;
end;
$$;
-- Si pg_cron no está habilitado en el proyecto, la función queda lista para
-- un job externo. No falla la migración.

-- ===========================================================================
-- idempotency_keys — PK (grupo_id, key), no key sola
-- ===========================================================================
create table public.idempotency_keys (
  grupo_id uuid not null references public.grupos (id),
  key text not null,
  response_status int not null,
  response_body jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (grupo_id, key)
);

create index idempotency_keys_expires_at_idx on public.idempotency_keys (expires_at);

alter table public.idempotency_keys enable row level security;
revoke all on public.idempotency_keys from public, anon;
grant select, insert on public.idempotency_keys to authenticated;

create policy idempotency_keys_select on public.idempotency_keys
for select to authenticated
using (
  private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id)
  or private.puede_ver_grupo(grupo_id)
);
-- Previene: leer el response_body cacheado de una petición de otro taller
-- (puede contener datos del cliente, km, firmas).
-- La PK (grupo_id, key) evita además que dos grupos que generen la misma
-- cadena de Idempotency-Key se sirvan la respuesta el uno al otro.

create policy idempotency_keys_insert on public.idempotency_keys
for insert to authenticated
with check (
  private.es_mecanu_admin()
  or private.puede_ver_grupo(grupo_id)
);
-- Previene: ensuciar (o envenenar) la caché de idempotencia de otro grupo.
-- Sin UPDATE/DELETE: el reintento hace SELECT; la purga es función definer.

create or replace function private.purgar_idempotency_keys()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_n integer;
begin
  delete from public.idempotency_keys where expires_at < now();
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

revoke all on function private.purgar_idempotency_keys() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'mecanu-purgar-idempotency-keys',
      '20 3 * * *',
      $cron$select private.purgar_idempotency_keys()$cron$
    );
  end if;
end;
$$;

commit;
