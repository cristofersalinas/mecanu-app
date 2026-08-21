-- Campañas, presupuestos e inspecciones.

create table if not exists public.campanas (
  id text primary key,
  taller_id text not null references public.talleres (id),
  cliente_id text references public.clientes (id),
  vehiculo_id text references public.vehiculos (id),
  ruta_origen_id text references public.rutas (id),
  ruta_generada_id text references public.rutas (id),
  inspeccion_id text,
  falla text not null,
  evidencia text not null,
  urgente boolean not null default false,
  fecha timestamptz not null,
  foto_url text,
  origen_automatico boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campanas_taller_idx on public.campanas (taller_id);

drop trigger if exists campanas_set_updated_at on public.campanas;
create trigger campanas_set_updated_at
  before update on public.campanas
  for each row execute function public.set_updated_at();

alter table public.campanas enable row level security;

-- FK diferida: campana_origen en rutas
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'rutas_campana_origen_id_fkey'
  ) then
    alter table public.rutas
      add constraint rutas_campana_origen_id_fkey
      foreign key (campana_origen_id) references public.campanas (id);
  end if;
end $$;

create table if not exists public.presupuestos (
  id text primary key,
  taller_id text not null references public.talleres (id),
  campana_id text references public.campanas (id),
  vehiculo_id text references public.vehiculos (id),
  ruta_origen_id text references public.rutas (id),
  ruta_generada_id text references public.rutas (id),
  modo text not null check (modo in ('detallado', 'solo_total')),
  estado text not null check (estado in (
    'nueva', 'valorada', 'enviada', 'aceptada', 'rechazada', 'caducada'
  )),
  iva_incluido boolean not null default true,
  total numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists presupuestos_campana_idx on public.presupuestos (campana_id);

drop trigger if exists presupuestos_set_updated_at on public.presupuestos;
create trigger presupuestos_set_updated_at
  before update on public.presupuestos
  for each row execute function public.set_updated_at();

alter table public.presupuestos enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'rutas_presupuesto_id_fkey'
  ) then
    alter table public.rutas
      add constraint rutas_presupuesto_id_fkey
      foreign key (presupuesto_id) references public.presupuestos (id);
  end if;
end $$;

create table if not exists public.presupuesto_lineas (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id text not null references public.presupuestos (id) on delete cascade,
  descripcion text not null,
  importe numeric(10, 2) not null,
  origen text not null check (origen in ('inspeccion', 'manual', 'traslado')),
  servicio_tempario_id text references public.servicios (id)
);

alter table public.presupuesto_lineas enable row level security;

create table if not exists public.campana_items (
  id text primary key,
  campana_id text not null references public.campanas (id) on delete cascade,
  tipo text not null,
  origen text not null check (origen in ('confirmado', 'estimado')),
  dias int not null,
  falla text not null,
  registro_idx int not null default 0,
  datos jsonb not null default '{}'::jsonb,
  servicio_id text references public.servicios (id),
  valor numeric(10, 2) not null
);

alter table public.campana_items enable row level security;

create table if not exists public.inspecciones (
  id text primary key,
  taller_id text not null references public.talleres (id),
  tipo text not null check (tipo in ('check-in', 'check-out')),
  ruta_id text not null references public.rutas (id),
  traslado_id text references public.traslados (id),
  fecha timestamptz not null,
  inspector_id text references public.conductores (id),
  km int not null,
  combustible text not null,
  combustible_pct int not null,
  limpieza text not null,
  vin text,
  itv_estado text,
  itv_vence date,
  firma_cliente text,
  firma_conductor text,
  created_at timestamptz not null default now()
);

create index if not exists inspecciones_ruta_idx on public.inspecciones (ruta_id);

alter table public.inspecciones enable row level security;

-- Evidencia sellada: sin UPDATE para authenticated (solo service_role bypass).
revoke update on public.inspecciones from authenticated, anon;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'campanas_inspeccion_id_fkey'
  ) then
    alter table public.campanas
      add constraint campanas_inspeccion_id_fkey
      foreign key (inspeccion_id) references public.inspecciones (id);
  end if;
end $$;

create table if not exists public.inspeccion_danos (
  id uuid primary key default gen_random_uuid(),
  inspeccion_id text not null references public.inspecciones (id) on delete cascade,
  zona text not null,
  tipo text not null,
  descripcion text not null,
  ubicacion text not null,
  foto_url text
);

alter table public.inspeccion_danos enable row level security;

create table if not exists public.inspeccion_hallazgos (
  id uuid primary key default gen_random_uuid(),
  inspeccion_id text not null references public.inspecciones (id) on delete cascade,
  categoria text not null,
  item text not null,
  metrica text not null,
  severidad text not null check (severidad in ('ok', 'warning', 'danger')),
  servicio_nombre text,
  servicio_precio numeric(10, 2),
  foto_url text
);

alter table public.inspeccion_hallazgos enable row level security;
