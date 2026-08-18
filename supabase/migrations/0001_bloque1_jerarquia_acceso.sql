-- Bloque 1 — Jerarquía organizativa y modelo de acceso.
-- Tablas: grupos, sucursales, usuarios, user_org_roles, user_sucursal_access.
-- Funciones: private.es_mecanu_admin, private.alcance_sucursales,
--            private.puede_ver_sucursal, private.puede_ver_grupo,
--            private.es_staff_del_grupo, private.validar_acceso_sucursal,
--            private.handle_new_user, private.set_updated_at.
-- Seed: grupo singleton mecanu (tipo = 'mecanu').
--
-- NO APLICA esta migración: es un archivo para revisión. Especialmente las
-- políticas RLS — son la única barrera entre datos de talleres distintos.
--
-- Reversa: 0001_bloque1_jerarquia_acceso.down.sql

begin;

create extension if not exists pgcrypto;

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- updated_at genérico. Evita depender de la extensión moddatetime.
-- ---------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon;
grant execute on function private.set_updated_at() to authenticated;

-- ===========================================================================
-- grupos
-- Mecanu es una fila más (tipo = 'mecanu'). El índice único parcial garantiza
-- el singleton: no puede haber dos filas mecanu.
-- ===========================================================================
create table public.grupos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('taller', 'mecanu')),
  nombre text not null,
  nif text,
  email_facturacion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create unique index grupos_singleton_mecanu on public.grupos ((tipo)) where tipo = 'mecanu';

create trigger trg_grupos_updated_at
before update on public.grupos
for each row execute function private.set_updated_at();

alter table public.grupos enable row level security;
revoke all on public.grupos from public, anon;
grant select, insert, update on public.grupos to authenticated;

-- ===========================================================================
-- sucursales
-- ===========================================================================
create table public.sucursales (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id),
  nombre text not null,
  direccion text,
  telefono text,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index sucursales_grupo_id_idx on public.sucursales (grupo_id);

create trigger trg_sucursales_updated_at
before update on public.sucursales
for each row execute function private.set_updated_at();

alter table public.sucursales enable row level security;
revoke all on public.sucursales from public, anon;
grant select, insert, update on public.sucursales to authenticated;

-- ===========================================================================
-- usuarios (espejo de auth.users; id = auth.users.id)
-- ===========================================================================
create table public.usuarios (
  id uuid primary key,
  email text not null unique,
  nombre text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_usuarios_updated_at
before update on public.usuarios
for each row execute function private.set_updated_at();

alter table public.usuarios enable row level security;
revoke all on public.usuarios from public, anon;
grant select, update on public.usuarios to authenticated;

-- El insert lo hace el trigger sobre auth.users, no el cliente.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usuarios (id, email, nombre)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'nombre',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger trg_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

-- ===========================================================================
-- user_org_roles
-- PK (usuario_id, grupo_id): un único rol por persona por grupo.
-- alcance_todas_sucursales default false → fail-closed.
-- ===========================================================================
create table public.user_org_roles (
  usuario_id uuid not null references public.usuarios (id),
  grupo_id uuid not null references public.grupos (id),
  rol text not null check (rol in (
    'mecanu_admin',
    'grupo_admin',
    'sucursal_admin',
    'conductor_interno',
    'conductor_flota'
  )),
  alcance_todas_sucursales boolean not null default false,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id),
  primary key (usuario_id, grupo_id),
  -- mecanu_admin y conductor_flota siempre cuelgan del grupo mecanu.
  -- Se valida en trigger más abajo (hace falta leer grupos.tipo).
  constraint user_org_roles_rol_coherente check (
    (rol in ('mecanu_admin', 'conductor_flota'))
    or (rol in ('grupo_admin', 'sucursal_admin', 'conductor_interno'))
  )
);

create index user_org_roles_grupo_id_idx on public.user_org_roles (grupo_id);
create index user_org_roles_rol_idx on public.user_org_roles (rol) where activo = true;

create trigger trg_user_org_roles_updated_at
before update on public.user_org_roles
for each row execute function private.set_updated_at();

create or replace function private.validar_rol_grupo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipo text;
begin
  select tipo into v_tipo from public.grupos where id = new.grupo_id;
  if new.rol in ('mecanu_admin', 'conductor_flota') and v_tipo is distinct from 'mecanu' then
    raise exception
      'user_org_roles: el rol % solo puede pertenecer al grupo tipo=mecanu',
      new.rol;
  end if;
  if new.rol in ('grupo_admin', 'sucursal_admin', 'conductor_interno') and v_tipo is not distinct from 'mecanu' then
    raise exception
      'user_org_roles: el rol % no pertenece al grupo mecanu',
      new.rol;
  end if;
  return new;
end;
$$;

revoke all on function private.validar_rol_grupo() from public, anon, authenticated;

create trigger trg_validar_rol_grupo
before insert or update on public.user_org_roles
for each row execute function private.validar_rol_grupo();

alter table public.user_org_roles enable row level security;
revoke all on public.user_org_roles from public, anon;
grant select, insert, update on public.user_org_roles to authenticated;

-- ===========================================================================
-- user_sucursal_access
-- Sin grupo_id: el grupo se deriva de sucursales. Eso permite conductor_flota.
-- ===========================================================================
create table public.user_sucursal_access (
  usuario_id uuid not null references public.usuarios (id),
  sucursal_id uuid not null references public.sucursales (id),
  created_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  primary key (usuario_id, sucursal_id)
);

create index user_sucursal_access_usuario_id_idx on public.user_sucursal_access (usuario_id);
create index user_sucursal_access_sucursal_id_idx on public.user_sucursal_access (sucursal_id);

-- Única excepción declarada al cruce de grupo: conductor_flota.
-- Cualquier otra fila cross-grupo es error de datos o acceso indebido.
create or replace function private.validar_acceso_sucursal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_grupo_sucursal uuid;
  v_es_miembro_del_grupo boolean;
  v_es_conductor_flota boolean;
begin
  select grupo_id into v_grupo_sucursal
  from public.sucursales where id = new.sucursal_id;

  select exists(
    select 1 from public.user_org_roles
    where usuario_id = new.usuario_id and grupo_id = v_grupo_sucursal
  ) into v_es_miembro_del_grupo;

  if v_es_miembro_del_grupo then
    return new;
  end if;

  select exists(
    select 1 from public.user_org_roles
    where usuario_id = new.usuario_id and rol = 'conductor_flota'
  ) into v_es_conductor_flota;

  if v_es_conductor_flota then
    return new;
  end if;

  raise exception
    'user_sucursal_access: el usuario % no pertenece al grupo de la sucursal % y no es conductor_flota',
    new.usuario_id, new.sucursal_id;
end;
$$;

revoke all on function private.validar_acceso_sucursal() from public, anon, authenticated;

create trigger trg_validar_acceso_sucursal
before insert or update on public.user_sucursal_access
for each row execute function private.validar_acceso_sucursal();

alter table public.user_sucursal_access enable row level security;
revoke all on public.user_sucursal_access from public, anon;
grant select, insert, update, delete on public.user_sucursal_access to authenticated;

-- FKs de trazabilidad en grupos/sucursales ahora que usuarios existe.
alter table public.grupos
  add constraint grupos_created_by_fkey foreign key (created_by) references public.usuarios (id),
  add constraint grupos_updated_by_fkey foreign key (updated_by) references public.usuarios (id);

alter table public.sucursales
  add constraint sucursales_created_by_fkey foreign key (created_by) references public.usuarios (id),
  add constraint sucursales_updated_by_fkey foreign key (updated_by) references public.usuarios (id);

-- ===========================================================================
-- Funciones de alcance (SECURITY DEFINER, schema private).
-- Siempre leen auth.uid() por dentro: un usuario autenticado no puede preguntar
-- el alcance de otro uuid. Desviación deliberada de la firma de MODELO-DATOS.md
-- (allí el uid iba por parámetro) — ver MIGRACIONES-RESUMEN.md.
-- (select auth.uid()) para que Postgres cachee el valor una vez por query.
-- ===========================================================================

create or replace function private.es_mecanu_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_org_roles
    where usuario_id = (select auth.uid())
      and rol = 'mecanu_admin'
      and activo = true
  );
$$;

revoke all on function private.es_mecanu_admin() from public, anon;
grant execute on function private.es_mecanu_admin() to authenticated;

create or replace function private.es_staff_del_grupo(p_grupo_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_org_roles
    where usuario_id = (select auth.uid())
      and grupo_id = p_grupo_id
      and rol in ('grupo_admin', 'sucursal_admin')
      and activo = true
  );
$$;

revoke all on function private.es_staff_del_grupo(uuid) from public, anon;
grant execute on function private.es_staff_del_grupo(uuid) to authenticated;

-- Devuelve las sucursal_id visibles para el usuario actual en ese grupo.
-- Vacío = cero acceso (fail-closed). Nunca "vacío = todas".
create or replace function private.alcance_sucursales(p_grupo_id uuid)
returns setof uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_todas boolean;
  v_activo boolean;
begin
  if v_uid is null then
    return;
  end if;

  select r.alcance_todas_sucursales, r.activo
    into v_todas, v_activo
  from public.user_org_roles r
  where r.usuario_id = v_uid
    and r.grupo_id = p_grupo_id;

  if found then
    if v_activo is not true then
      return;
    end if;
    if v_todas then
      return query
        select s.id from public.sucursales s where s.grupo_id = p_grupo_id;
      return;
    end if;
    return query
      select usa.sucursal_id
      from public.user_sucursal_access usa
      join public.sucursales s on s.id = usa.sucursal_id
      where usa.usuario_id = v_uid
        and s.grupo_id = p_grupo_id;
    return;
  end if;

  -- Sin membresía en este grupo. Única excepción: conductor_flota (grupo mecanu)
  -- con filas de acceso a sucursales de un taller cliente.
  if exists (
    select 1
    from public.user_org_roles r
    where r.usuario_id = v_uid
      and r.rol = 'conductor_flota'
      and r.activo = true
  ) then
    return query
      select usa.sucursal_id
      from public.user_sucursal_access usa
      join public.sucursales s on s.id = usa.sucursal_id
      where usa.usuario_id = v_uid
        and s.grupo_id = p_grupo_id;
  end if;
end;
$$;

revoke all on function private.alcance_sucursales(uuid) from public, anon;
grant execute on function private.alcance_sucursales(uuid) to authenticated;

create or replace function private.puede_ver_sucursal(p_sucursal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.es_mecanu_admin()
    or exists (
      select 1
      from public.sucursales s
      where s.id = p_sucursal_id
        and s.id in (select private.alcance_sucursales(s.grupo_id))
    );
$$;

revoke all on function private.puede_ver_sucursal(uuid) from public, anon;
grant execute on function private.puede_ver_sucursal(uuid) to authenticated;

create or replace function private.puede_ver_grupo(p_grupo_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.es_mecanu_admin()
    or exists (
      select 1
      from public.user_org_roles r
      where r.usuario_id = (select auth.uid())
        and r.grupo_id = p_grupo_id
        and r.activo = true
    )
    or exists (
      select 1 from private.alcance_sucursales(p_grupo_id)
    );
$$;

revoke all on function private.puede_ver_grupo(uuid) from public, anon;
grant execute on function private.puede_ver_grupo(uuid) to authenticated;

-- ===========================================================================
-- Políticas RLS
-- anon: cero políticas → no ve nada.
-- authenticated: cada política declara qué previene y contra qué rol.
-- mecanu_admin NO usa BYPASSRLS: entra por una rama OR explícita, auditable.
-- ===========================================================================

-- ----- grupos --------------------------------------------------------------

create policy grupos_select
on public.grupos
for select
to authenticated
using (private.puede_ver_grupo(id));
-- Previene: que un taller lea la ficha (NIF, email de facturación, nombre) de
-- otro taller, o el catálogo entero de clientes Mecanu.
-- Roles: cualquier miembro activo del grupo ve SU grupo; conductor_flota ve
-- el grupo mecanu (membresía) y el grupo del taller donde tiene sucursal
-- asignada; mecanu_admin ve todos.

create policy grupos_insert
on public.grupos
for insert
to authenticated
with check (private.es_mecanu_admin());
-- Previene: que un grupo_admin se fabrique un segundo grupo (segundo tenant)
-- o se auto-asigne tipo='mecanu'.
-- Roles: solo mecanu_admin (alta de un taller cliente).

create policy grupos_update
on public.grupos
for update
to authenticated
using (
  private.es_mecanu_admin()
  or private.es_staff_del_grupo(id)
)
with check (
  private.es_mecanu_admin()
  or private.es_staff_del_grupo(id)
);
-- Previene: editar la ficha de otro grupo.
-- Roles: mecanu_admin cualquier fila; grupo_admin/sucursal_admin solo la suya.
-- `tipo` es inmutable salvo mecanu_admin (trigger trg_proteger_tipo_grupo).
-- No hay DELETE: un grupo no se borra, se deja de facturar.

create or replace function private.proteger_tipo_grupo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.tipo is distinct from new.tipo and not private.es_mecanu_admin() then
    raise exception 'grupos.tipo es inmutable salvo para mecanu_admin';
  end if;
  return new;
end;
$$;

revoke all on function private.proteger_tipo_grupo() from public, anon, authenticated;

create trigger trg_proteger_tipo_grupo
before update on public.grupos
for each row execute function private.proteger_tipo_grupo();

-- ----- sucursales ----------------------------------------------------------

create policy sucursales_select
on public.sucursales
for select
to authenticated
using (private.puede_ver_sucursal(id));
-- Previene: enumerar sucursales de otro taller (dirección, teléfono, si está
-- activa — dato de cuota).
-- Roles: alcance_sucursales del grupo de la fila; mecanu_admin todas.
-- Fail-closed: membresía sin filas de acceso y alcance_todas=false → cero filas.

create policy sucursales_insert
on public.sucursales
for insert
to authenticated
with check (
  private.es_mecanu_admin()
  or private.es_staff_del_grupo(grupo_id)
);
-- Previene: crear una sucursal colgando del grupo de otro taller (el INSERT
-- con grupo_id ajeno).
-- Roles: staff del grupo destino o mecanu_admin.
-- La cuota (plan Alta = 1 sucursal) NO se enforcea aquí: es capa de aplicación
-- + usage_counters. RLS no es lógica de plan.

create policy sucursales_update
on public.sucursales
for update
to authenticated
using (
  private.es_mecanu_admin()
  or (
    private.es_staff_del_grupo(grupo_id)
    and private.puede_ver_sucursal(id)
  )
)
with check (
  private.es_mecanu_admin()
  or (
    private.es_staff_del_grupo(grupo_id)
    and private.puede_ver_sucursal(id)
  )
);
-- Previene: que un conductor (que PUEDE ver la sucursal) edite nombre/dirección;
-- y que staff de un taller edite sucursales de otro.
-- Roles: staff del grupo con esa sucursal en alcance; mecanu_admin todas.
-- `grupo_id` es inmutable (trigger trg_proteger_sucursal_grupo): un WITH CHECK
-- comparando contra la misma fila no funciona en UPDATE — vería el NEW.

create or replace function private.proteger_sucursal_grupo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.grupo_id is distinct from new.grupo_id then
    raise exception 'sucursales.grupo_id es inmutable';
  end if;
  return new;
end;
$$;

revoke all on function private.proteger_sucursal_grupo() from public, anon, authenticated;

create trigger trg_proteger_sucursal_grupo
before update on public.sucursales
for each row execute function private.proteger_sucursal_grupo();

-- ----- usuarios ------------------------------------------------------------

create policy usuarios_select
on public.usuarios
for select
to authenticated
using (
  id = (select auth.uid())
  or private.es_mecanu_admin()
  or exists (
    select 1
    from public.user_org_roles mine
    join public.user_org_roles theirs
      on theirs.grupo_id = mine.grupo_id
    where mine.usuario_id = (select auth.uid())
      and mine.activo = true
      and theirs.usuario_id = usuarios.id
  )
);
-- Previene: descargar el listado global de emails/nombres de todos los
-- usuarios de la plataforma (otros talleres, flota, soporte).
-- Roles: uno mismo; compañeros de grupo (el panel lista conductores y
-- admins de SU grupo); mecanu_admin todos.

create policy usuarios_update
on public.usuarios
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));
-- Previene: que un admin de taller reescriba el email/nombre de otro usuario
-- (suplantación de identidad en el espejo de Auth).
-- Roles: solo el propio usuario. El alta la hace private.handle_new_user.

-- ----- user_org_roles ------------------------------------------------------

create policy user_org_roles_select
on public.user_org_roles
for select
to authenticated
using (
  usuario_id = (select auth.uid())
  or private.es_mecanu_admin()
  or private.es_staff_del_grupo(grupo_id)
);
-- Previene: que un conductor (u otro taller) lea la matriz de roles de un
-- grupo ajeno — quién es admin, quién está desactivado.
-- Roles: la propia membresía (necesaria para que el cliente sepa su rol);
-- staff del grupo; mecanu_admin.

create policy user_org_roles_insert
on public.user_org_roles
for insert
to authenticated
with check (
  private.es_mecanu_admin()
  or (
    private.es_staff_del_grupo(grupo_id)
    and rol not in ('mecanu_admin', 'conductor_flota')
  )
);
-- Previene: auto-asignarse mecanu_admin; dar de alta un conductor_flota desde
-- el taller (la flota es de Mecanu); insertar una membresía en un grupo ajeno.
-- Roles: mecanu_admin cualquier rol; staff del grupo solo
-- grupo_admin/sucursal_admin/conductor_interno sobre SU grupo.

create policy user_org_roles_update
on public.user_org_roles
for update
to authenticated
using (
  private.es_mecanu_admin()
  or private.es_staff_del_grupo(grupo_id)
)
with check (
  private.es_mecanu_admin()
  or (
    private.es_staff_del_grupo(grupo_id)
    and rol not in ('mecanu_admin', 'conductor_flota')
    and grupo_id = (select r.grupo_id from public.user_org_roles r
                    where r.usuario_id = user_org_roles.usuario_id
                      and r.grupo_id = user_org_roles.grupo_id)
  )
);
-- Previene: escalada a mecanu_admin; convertir un interno en conductor_flota
-- (cambiaría de tenant); mover la membresía a otro grupo_id.
-- Roles: staff del grupo, sin tocar roles Mecanu; mecanu_admin sin traba.
-- No hay DELETE: se desactiva con `activo = false` para preservar auditoría.

-- ----- user_sucursal_access ------------------------------------------------

create policy user_sucursal_access_select
on public.user_sucursal_access
for select
to authenticated
using (
  usuario_id = (select auth.uid())
  or private.es_mecanu_admin()
  or private.puede_ver_sucursal(sucursal_id)
);
-- Previene: mapear qué conductores de flota operan en otros talleres, o el
-- alcance interno de un grupo ajeno.
-- Roles: las propias filas; staff que ya ve esa sucursal; mecanu_admin.

create policy user_sucursal_access_insert
on public.user_sucursal_access
for insert
to authenticated
with check (
  private.es_mecanu_admin()
  or private.es_staff_del_grupo(
    (select s.grupo_id from public.sucursales s where s.id = sucursal_id)
  )
);
-- Previene: un sucursal_admin de taller A otorgándose acceso a una sucursal
-- de taller B (el trigger validar_acceso_sucursal es la segunda red; esta
-- política es la primera: ni siquiera puede INSERTAR la fila).
-- Roles: staff del grupo DUEÑO de la sucursal, o mecanu_admin (quién asigna
-- conductor_flota a un taller cliente).
-- El trigger sigue siendo necesario: cubre service-side inserts y el caso
-- staff-del-grupo-mecanu intentando colar una sucursal de taller sin ser
-- conductor_flota.

create policy user_sucursal_access_update
on public.user_sucursal_access
for update
to authenticated
using (
  private.es_mecanu_admin()
  or private.es_staff_del_grupo(
    (select s.grupo_id from public.sucursales s where s.id = sucursal_id)
  )
)
with check (
  private.es_mecanu_admin()
  or private.es_staff_del_grupo(
    (select s.grupo_id from public.sucursales s where s.id = sucursal_id)
  )
);
-- Previene: reescribir usuario_id/sucursal_id para "mover" un acceso a otro
-- taller. Misma audiencia que INSERT.

create policy user_sucursal_access_delete
on public.user_sucursal_access
for delete
to authenticated
using (
  private.es_mecanu_admin()
  or private.es_staff_del_grupo(
    (select s.grupo_id from public.sucursales s where s.id = sucursal_id)
  )
);
-- Previene: que un conductor se borre a sí mismo el alcance (o el de un
-- compañero) para eludir una restricción de sucursal.
-- Roles: staff del grupo dueño / mecanu_admin. Quitar acceso SÍ es DELETE
-- (no hay flag activo en esta tabla).

-- ===========================================================================
-- Seed: singleton mecanu. Sin sucursales hoy.
-- ===========================================================================
insert into public.grupos (tipo, nombre, nif, email_facturacion)
values ('mecanu', 'Mecanu', null, null);

commit;
