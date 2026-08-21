-- Logística: rutas, paradas, traslados, logs, solicitudes.

create table if not exists public.rutas (
  id text primary key,
  taller_id text not null references public.talleres (id),
  vehiculo_id text references public.vehiculos (id),
  cliente_id text references public.clientes (id),
  perfil_servicio text,
  estado text not null check (estado in (
    'prospectos', 'agendado', 'en_ruta', 'en_taller', 'completado', 'cancelado'
  )),
  subestado text not null,
  tags_manual text[] not null default '{}',
  cliente_tiene_auto boolean,
  vehiculo_listo boolean,
  campana_origen_id text,
  presupuesto_id text,
  motivo text,
  cancelada_en timestamptz,
  incidencia text,
  matricula_lead text,
  link_token text,
  link_enviado_en timestamptz,
  creada_en timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (estado <> 'cancelado' or motivo is not null)
);

create index if not exists rutas_taller_estado_idx on public.rutas (taller_id, estado, subestado);
create index if not exists rutas_vehiculo_idx on public.rutas (vehiculo_id);
create index if not exists rutas_cliente_idx on public.rutas (cliente_id);

drop trigger if exists rutas_set_updated_at on public.rutas;
create trigger rutas_set_updated_at
  before update on public.rutas
  for each row execute function public.set_updated_at();

alter table public.rutas enable row level security;

create table if not exists public.paradas (
  id text primary key,
  ruta_id text not null references public.rutas (id) on delete cascade,
  orden int not null,
  tipo text not null check (tipo in ('cliente', 'proveedor')),
  subtipo text check (subtipo is null or subtipo in ('taller', 'itv', 'chapista', 'otro')),
  direccion text,
  localidad text,
  sublocalidad text,
  llegada_real timestamptz,
  salida_real timestamptz
);

create index if not exists paradas_ruta_idx on public.paradas (ruta_id, orden);

alter table public.paradas enable row level security;

create table if not exists public.parada_servicios (
  id uuid primary key default gen_random_uuid(),
  parada_id text not null references public.paradas (id) on delete cascade,
  descripcion text not null
);

alter table public.parada_servicios enable row level security;

create table if not exists public.traslados (
  id text primary key,
  ruta_id text not null references public.rutas (id) on delete cascade,
  orden int not null,
  rol text not null check (rol in ('ida', 'vuelta', 'interno')),
  parada_origen_id text references public.paradas (id),
  parada_destino_id text references public.paradas (id),
  conductor_id text references public.conductores (id),
  ventana_fecha date,
  ventana_inicio text,
  ventana_fin text,
  propuesta_fecha date,
  propuesta_inicio text,
  propuesta_fin text,
  ventana_modo text check (
    ventana_modo is null
    or ventana_modo in ('slots_cliente', 'propuesta_taller', 'fija_taller')
  ),
  cliente_confirmo boolean,
  estado text not null check (estado in (
    'sin_agenda', 'agendado', 'en_curso', 'completado', 'cancelado'
  )),
  subestado text,
  seguro boolean not null default false,
  importe numeric(10, 2) not null,
  reprogramaciones int not null default 0
);

create index if not exists traslados_ruta_idx on public.traslados (ruta_id, orden);
create index if not exists traslados_conductor_fecha_idx
  on public.traslados (conductor_id, ventana_fecha);

alter table public.traslados enable row level security;

create table if not exists public.logs (
  id text primary key,
  traslado_id text not null references public.traslados (id) on delete cascade,
  tipo text not null check (tipo in (
    'cambio_estado', 'gps', 'evidencia', 'comunicacion', 'incidencia', 'nota'
  )),
  ts timestamptz not null,
  actor text not null,
  trigger_source text not null check (trigger_source in ('manual', 'conductor', 'api', 'cron')),
  payload jsonb not null default '{}'::jsonb,
  actor_real_id uuid,
  actor_efectivo_id text
);

create index if not exists logs_traslado_ts_idx on public.logs (traslado_id, ts desc);

alter table public.logs enable row level security;

create table if not exists public.solicitudes (
  id text primary key,
  traslado_id text not null references public.traslados (id),
  ruta_id text not null references public.rutas (id),
  conductor_id text not null references public.conductores (id),
  tipo text not null check (tipo in ('reagenda', 'rechazo', 'fallido_origen', 'no_rodante')),
  motivo text not null,
  nota text,
  ts timestamptz not null default now(),
  estado text not null check (estado in (
    'pendiente', 'resuelta_reagenda', 'resuelta_reasignada', 'resuelta_cancelada', 'descartada'
  )),
  resolucion text,
  resuelta_en timestamptz
);

create index if not exists solicitudes_pendientes_idx
  on public.solicitudes (estado)
  where estado = 'pendiente';

alter table public.solicitudes enable row level security;
