-- Contactos: origen + teléfono normalizado + lotes de importación (WA / Excel / Sheets).
-- Deduplicación por (taller_id, telefono_digitos). Historial de importaciones en lotes/filas.

-- ---------------------------------------------------------------------------
-- clientes: origen y dígitos
-- ---------------------------------------------------------------------------
alter table public.clientes
  add column if not exists origen text;

alter table public.clientes
  add column if not exists origen_detalle text;

alter table public.clientes
  add column if not exists origen_en timestamptz;

alter table public.clientes
  add column if not exists origen_ultimo text;

alter table public.clientes
  add column if not exists origen_ultimo_en timestamptz;

alter table public.clientes
  add column if not exists telefono_digitos text
    generated always as (nullif(regexp_replace(telefono, '\D', '', 'g'), '')) stored;

update public.clientes
set
  origen = coalesce(origen, 'manual'),
  origen_en = coalesce(origen_en, desde, created_at, now()),
  origen_ultimo = coalesce(origen_ultimo, origen, 'manual'),
  origen_ultimo_en = coalesce(origen_ultimo_en, origen_en, desde, created_at, now())
where origen is null;

alter table public.clientes
  alter column origen set default 'manual';

alter table public.clientes
  alter column origen set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'clientes_origen_check'
      and conrelid = 'public.clientes'::regclass
  ) then
    alter table public.clientes
      add constraint clientes_origen_check
      check (
        origen in (
          'manual',
          'whatsapp_sync',
          'whatsapp_mensaje',
          'excel',
          'gsheets',
          'api',
          'campana',
          'lead'
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'clientes_origen_ultimo_check'
      and conrelid = 'public.clientes'::regclass
  ) then
    alter table public.clientes
      add constraint clientes_origen_ultimo_check
      check (
        origen_ultimo is null
        or origen_ultimo in (
          'manual',
          'whatsapp_sync',
          'whatsapp_mensaje',
          'excel',
          'gsheets',
          'api',
          'campana',
          'lead'
        )
      );
  end if;
end $$;

-- Único por taller + dígitos (ignora filas sin dígitos).
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'clientes_taller_tel_digitos_uidx'
  ) then
    -- Si hay duplicados previos, el índice único fallará: limpia a mano y reintenta.
    execute $sql$
      create unique index clientes_taller_tel_digitos_uidx
        on public.clientes (taller_id, telefono_digitos)
        where telefono_digitos is not null
    $sql$;
  end if;
end $$;

create index if not exists clientes_origen_idx
  on public.clientes (taller_id, origen);

comment on column public.clientes.origen is
  'Canal de alta del contacto: manual|whatsapp_sync|whatsapp_mensaje|excel|gsheets|api|campana|lead. No se pisa al reimportar.';
comment on column public.clientes.origen_detalle is
  'Referencia del alta: id de lote, archivo, hoja o sesión WhatsApp.';
comment on column public.clientes.origen_en is
  'Momento del primer alta por origen.';
comment on column public.clientes.origen_ultimo is
  'Último canal que tocó el contacto (import/merge).';
comment on column public.clientes.origen_ultimo_en is
  'Momento del último import/merge.';
comment on column public.clientes.telefono_digitos is
  'Teléfono solo dígitos (generado). Clave de deduplicación por taller.';

-- ---------------------------------------------------------------------------
-- Lotes de importación
-- ---------------------------------------------------------------------------
create table if not exists public.contacto_import_lotes (
  id text primary key,
  taller_id text not null references public.talleres (id),
  origen text not null
    check (origen in (
      'manual',
      'whatsapp_sync',
      'whatsapp_mensaje',
      'excel',
      'gsheets',
      'api',
      'campana',
      'lead'
    )),
  origen_ref text,
  actor_id text,
  total int not null default 0,
  creados int not null default 0,
  actualizados int not null default 0,
  omitidos int not null default 0,
  errores int not null default 0,
  creado_en timestamptz not null default now()
);

create index if not exists contacto_import_lotes_taller_idx
  on public.contacto_import_lotes (taller_id, creado_en desc);

alter table public.contacto_import_lotes enable row level security;

drop policy if exists contacto_import_lotes_select_tenant on public.contacto_import_lotes;
drop policy if exists contacto_import_lotes_write_tenant on public.contacto_import_lotes;

create policy contacto_import_lotes_select_tenant on public.contacto_import_lotes
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy contacto_import_lotes_write_tenant on public.contacto_import_lotes
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

comment on table public.contacto_import_lotes is
  'Cada importación de contactos (WhatsApp sync, Excel, Google Sheets, API).';

-- ---------------------------------------------------------------------------
-- Filas del lote (auditoría / repeticiones)
-- ---------------------------------------------------------------------------
create table if not exists public.contacto_import_filas (
  id uuid primary key default gen_random_uuid(),
  lote_id text not null references public.contacto_import_lotes (id) on delete cascade,
  taller_id text not null references public.talleres (id),
  cliente_id text references public.clientes (id) on delete set null,
  telefono text not null,
  telefono_digitos text,
  nombre text,
  resultado text not null
    check (resultado in (
      'creado',
      'actualizado',
      'omitido_duplicado_lote',
      'omitido_sin_cambios',
      'omitido_invalido',
      'error'
    )),
  detalle text,
  creado_en timestamptz not null default now()
);

create index if not exists contacto_import_filas_lote_idx
  on public.contacto_import_filas (lote_id);

create index if not exists contacto_import_filas_taller_idx
  on public.contacto_import_filas (taller_id, creado_en desc);

alter table public.contacto_import_filas enable row level security;

drop policy if exists contacto_import_filas_select_tenant on public.contacto_import_filas;
drop policy if exists contacto_import_filas_write_tenant on public.contacto_import_filas;

create policy contacto_import_filas_select_tenant on public.contacto_import_filas
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy contacto_import_filas_write_tenant on public.contacto_import_filas
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

comment on table public.contacto_import_filas is
  'Resultado fila a fila de un lote: creado, merge, omitido (dup en lote / sin cambios / inválido) o error.';

grant select, insert, update, delete on public.contacto_import_lotes to authenticated;
grant select, insert, update, delete on public.contacto_import_filas to authenticated;
grant select, insert, update, delete on public.contacto_import_lotes to service_role;
grant select, insert, update, delete on public.contacto_import_filas to service_role;
