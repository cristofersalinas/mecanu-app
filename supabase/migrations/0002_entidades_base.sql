-- Entidades base + perfiles (auth futuro / impersonación).
-- taller_id desde el día 1.

create table if not exists public.clientes (
  id text primary key,
  taller_id text not null references public.talleres (id),
  nombre text not null,
  tipo text not null check (tipo in ('Particular', 'Empresa')),
  telefono text not null,
  email text not null,
  direccion text not null,
  documento text,
  desde timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clientes_taller_idx on public.clientes (taller_id);
create index if not exists clientes_documento_idx on public.clientes (taller_id, documento);

drop trigger if exists clientes_set_updated_at on public.clientes;
create trigger clientes_set_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

alter table public.clientes enable row level security;

create table if not exists public.vehiculos (
  id text primary key,
  taller_id text not null references public.talleres (id),
  marca text not null,
  modelo text not null,
  anio int not null,
  matricula text not null,
  matricula_normalizada text generated always as (upper(replace(matricula, ' ', ''))) stored,
  km int not null check (km >= 0),
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (taller_id, matricula_normalizada)
);

create index if not exists vehiculos_taller_idx on public.vehiculos (taller_id);
create index if not exists vehiculos_matricula_norm_idx on public.vehiculos (matricula_normalizada);

drop trigger if exists vehiculos_set_updated_at on public.vehiculos;
create trigger vehiculos_set_updated_at
  before update on public.vehiculos
  for each row execute function public.set_updated_at();

alter table public.vehiculos enable row level security;

create table if not exists public.vehiculo_clientes (
  vehiculo_id text not null references public.vehiculos (id) on delete cascade,
  cliente_id text not null references public.clientes (id) on delete cascade,
  relacion text not null,
  principal boolean not null default false,
  primary key (vehiculo_id, cliente_id)
);

alter table public.vehiculo_clientes enable row level security;

create table if not exists public.conductores (
  id text primary key,
  taller_id text not null references public.talleres (id),
  nombre text not null,
  telefono text not null,
  documento text,
  red text not null check (red in ('Interna', 'Externo Mecanu')),
  furgoneta text,
  proceso text not null check (proceso in ('documentos_pendientes', 'en_supervision', 'activo')),
  supervisados int not null default 0,
  requeridos int not null default 0,
  alta timestamptz not null,
  calificacion numeric(2, 1),
  valoraciones int not null default 0,
  docs_dni boolean not null default false,
  docs_carnet boolean not null default false,
  docs_iban boolean not null default false,
  docs_seguro boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conductores_taller_idx on public.conductores (taller_id);
create index if not exists conductores_documento_idx on public.conductores (taller_id, documento);

drop trigger if exists conductores_set_updated_at on public.conductores;
create trigger conductores_set_updated_at
  before update on public.conductores
  for each row execute function public.set_updated_at();

alter table public.conductores enable row level security;

create table if not exists public.conductor_incidencias (
  id uuid primary key default gen_random_uuid(),
  conductor_id text not null references public.conductores (id) on delete cascade,
  fecha timestamptz not null,
  tipo text not null,
  gravedad text not null,
  detalle text not null
);

alter table public.conductor_incidencias enable row level security;

create table if not exists public.servicios (
  id text primary key,
  taller_id text not null references public.talleres (id),
  nombre text not null,
  categoria text not null,
  horas numeric(4, 2) not null,
  mano_obra numeric(10, 2) not null,
  materiales numeric(10, 2) not null,
  aplica text[] not null default '{}',
  garantia text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists servicios_taller_idx on public.servicios (taller_id);

drop trigger if exists servicios_set_updated_at on public.servicios;
create trigger servicios_set_updated_at
  before update on public.servicios
  for each row execute function public.set_updated_at();

alter table public.servicios enable row level security;

-- Perfiles de login (magic link / backoffice). documento = DNI/NIE searchable.
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  taller_id text references public.talleres (id),
  rol text not null check (rol in ('dueno', 'operacion', 'conductor', 'ops')),
  nombre text not null,
  email text not null,
  telefono text,
  documento text,
  conductor_id text references public.conductores (id),
  estado text not null default 'activo'
    check (estado in ('invitado', 'activo', 'suspendido', 'baja')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists perfiles_taller_idx on public.perfiles (taller_id);
create index if not exists perfiles_documento_idx on public.perfiles (documento);
create index if not exists perfiles_email_idx on public.perfiles (email);

drop trigger if exists perfiles_set_updated_at on public.perfiles;
create trigger perfiles_set_updated_at
  before update on public.perfiles
  for each row execute function public.set_updated_at();

alter table public.perfiles enable row level security;

-- Impersonación: contexto activo del dueño (cookie/sesión lo rellena la app).
create table if not exists public.impersonation_sessions (
  id uuid primary key default gen_random_uuid(),
  actor_real_id uuid not null references public.perfiles (id),
  tipo text not null check (tipo in ('taller', 'conductor')),
  taller_id text references public.talleres (id),
  conductor_id text references public.conductores (id),
  usuario_efectivo_id text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ended_at timestamptz
);

create index if not exists impersonation_actor_idx
  on public.impersonation_sessions (actor_real_id)
  where ended_at is null;

alter table public.impersonation_sessions enable row level security;
