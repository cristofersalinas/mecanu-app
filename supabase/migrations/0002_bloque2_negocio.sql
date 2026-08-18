-- Bloque 2 — Tablas de negocio.
-- clientes/vehiculos (tenant = grupo_id), rutas (tenant = sucursal_id),
-- hijas de rutas por FK (paradas, traslados, logs, inspecciones, solicitudes),
-- presupuestos y campañas (sucursal_id denormalizado), tempario, conductores
-- con usuario_id NOT NULL, traslados.seguro_tipo (ya no boolean).
--
-- Depende del bloque 1 (grupos, sucursales, usuarios, funciones de alcance).
-- Reversa: 0002_bloque2_negocio.down.sql
-- NO APLICA esta migración.

begin;

-- ===========================================================================
-- clientes / vehiculos — pool del grupo, no de la sucursal
-- ===========================================================================
create table public.clientes (
  id text primary key,
  grupo_id uuid not null references public.grupos (id),
  nombre text not null,
  tipo text not null check (tipo in ('Particular', 'Empresa')),
  telefono text not null default '',
  email text not null default '',
  direccion text not null default '',
  desde date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index clientes_grupo_id_idx on public.clientes (grupo_id);

create trigger trg_clientes_updated_at
before update on public.clientes
for each row execute function private.set_updated_at();

alter table public.clientes enable row level security;
revoke all on public.clientes from public, anon;
grant select, insert, update on public.clientes to authenticated;

create table public.vehiculos (
  id text primary key,
  grupo_id uuid not null references public.grupos (id),
  marca text not null default '',
  modelo text not null default '',
  anio int,
  matricula text not null default '',
  matricula_normalizada text,
  km int not null default 0 check (km >= 0),
  color text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index vehiculos_grupo_id_idx on public.vehiculos (grupo_id);
create index vehiculos_matricula_normalizada_idx on public.vehiculos (matricula_normalizada);

create trigger trg_vehiculos_updated_at
before update on public.vehiculos
for each row execute function private.set_updated_at();

alter table public.vehiculos enable row level security;
revoke all on public.vehiculos from public, anon;
grant select, insert, update on public.vehiculos to authenticated;

-- m2m vehículo ↔ clientes. contactos del vehículo son derivados, no se duplican.
create table public.vehiculo_clientes (
  vehiculo_id text not null references public.vehiculos (id),
  cliente_id text not null references public.clientes (id),
  relacion text not null default '',
  principal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id),
  primary key (vehiculo_id, cliente_id)
);

create trigger trg_vehiculo_clientes_updated_at
before update on public.vehiculo_clientes
for each row execute function private.set_updated_at();

alter table public.vehiculo_clientes enable row level security;
revoke all on public.vehiculo_clientes from public, anon;
grant select, insert, update, delete on public.vehiculo_clientes to authenticated;

-- ===========================================================================
-- tempario (servicios) — cuelga del grupo
-- ===========================================================================
create table public.servicios (
  id text primary key,
  grupo_id uuid not null references public.grupos (id),
  nombre text not null,
  categoria text not null default '',
  horas numeric,
  mano_obra_cents int not null default 0,
  materiales_cents int not null default 0,
  aplica text[] not null default '{}',
  garantia text not null default '',
  notas text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index servicios_grupo_id_idx on public.servicios (grupo_id);

create trigger trg_servicios_updated_at
before update on public.servicios
for each row execute function private.set_updated_at();

alter table public.servicios enable row level security;
revoke all on public.servicios from public, anon;
grant select, insert, update on public.servicios to authenticated;

-- ===========================================================================
-- conductores — sin columna de tenant; pertenencia vía usuario_id → user_org_roles
-- usuario_id NOT NULL: la cuenta se crea en el primer paso del onboarding.
-- ===========================================================================
create table public.conductores (
  id text primary key,
  usuario_id uuid not null references public.usuarios (id),
  nombre text not null,
  telefono text not null default '',
  red text not null check (red in ('Interna', 'Externo Mecanu')),
  furgoneta text not null default '',
  proceso text not null check (proceso in ('documentos_pendientes', 'en_supervision', 'activo')),
  supervisados int not null default 0,
  requeridos int not null default 0,
  alta date,
  calificacion numeric not null default 0,
  valoraciones int not null default 0,
  docs jsonb not null default '{}'::jsonb,
  incidencias jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create unique index conductores_usuario_id_uidx on public.conductores (usuario_id);

create trigger trg_conductores_updated_at
before update on public.conductores
for each row execute function private.set_updated_at();

alter table public.conductores enable row level security;
revoke all on public.conductores from public, anon;
grant select, insert, update on public.conductores to authenticated;

-- ===========================================================================
-- rutas — tenant = sucursal_id. Estado vive AQUÍ.
-- ===========================================================================
create table public.rutas (
  id text primary key,
  sucursal_id uuid not null references public.sucursales (id),
  vehiculo_id text references public.vehiculos (id),
  cliente_id text references public.clientes (id),
  perfil_servicio text not null default '',
  modelo_precio text not null default '',
  precio_total_cents int not null default 0,
  estado text not null check (estado in (
    'prospectos', 'agendado', 'en_ruta', 'en_taller', 'completado', 'cancelado'
  )),
  subestado text not null default '',
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
  creada_en timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id),
  constraint rutas_cancelado_exige_motivo check (
    estado <> 'cancelado' or motivo is not null
  )
);

create index rutas_sucursal_id_estado_idx on public.rutas (sucursal_id, estado);
create index rutas_estado_subestado_idx on public.rutas (estado, subestado);
create index rutas_vehiculo_id_idx on public.rutas (vehiculo_id);
create index rutas_cliente_id_idx on public.rutas (cliente_id);

create trigger trg_rutas_updated_at
before update on public.rutas
for each row execute function private.set_updated_at();

alter table public.rutas enable row level security;
revoke all on public.rutas from public, anon;
grant select, insert, update on public.rutas to authenticated;

-- ===========================================================================
-- paradas
-- ===========================================================================
create table public.paradas (
  id text primary key,
  ruta_id text not null references public.rutas (id),
  orden int not null check (orden > 0),
  tipo text not null check (tipo in ('cliente', 'proveedor')),
  subtipo text check (subtipo in ('taller', 'itv', 'chapista', 'otro')),
  etiqueta text not null default '',
  direccion text,
  servicios jsonb not null default '[]'::jsonb,
  llegada_real timestamptz,
  salida_real timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id),
  unique (ruta_id, orden)
);

create index paradas_ruta_id_idx on public.paradas (ruta_id);

create trigger trg_paradas_updated_at
before update on public.paradas
for each row execute function private.set_updated_at();

alter table public.paradas enable row level security;
revoke all on public.paradas from public, anon;
grant select, insert, update on public.paradas to authenticated;

-- ===========================================================================
-- traslados (tramos). seguro_tipo reemplaza seguro boolean.
-- ===========================================================================
create table public.traslados (
  id text primary key,
  ruta_id text not null references public.rutas (id),
  orden int not null check (orden > 0),
  rol text not null check (rol in ('ida', 'vuelta', 'interno')),
  parada_origen_id text references public.paradas (id),
  parada_destino_id text references public.paradas (id),
  conductor_id text references public.conductores (id),
  ventana_fecha date,
  ventana_inicio text,
  ventana_fin text,
  ventana_propuesta_fecha date,
  ventana_propuesta_inicio text,
  ventana_propuesta_fin text,
  ventana_modo text check (ventana_modo in ('slots_cliente', 'propuesta_taller', 'fija_taller')),
  cliente_confirmo boolean,
  estado text not null check (estado in (
    'sin_agenda', 'agendado', 'en_curso', 'completado', 'cancelado'
  )),
  subestado text,
  seguro_tipo text not null default 'ninguno' check (seguro_tipo in (
    'externo', 'mecanu_mensual', 'mecanu_demanda', 'ninguno'
  )),
  seguro_demanda_activado_en timestamptz,
  seguro_demanda_precio_cents int,
  importe_cents int not null default 0,
  reprogramaciones int not null default 0,
  comunica_al_cliente boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id),
  constraint traslados_ventana_rango check (
    (ventana_inicio is null and ventana_fin is null)
    or (
      ventana_inicio is not null
      and ventana_fin is not null
      and ventana_inicio <> ventana_fin
    )
  )
);

create index traslados_ruta_id_idx on public.traslados (ruta_id);
create index traslados_conductor_id_idx on public.traslados (conductor_id);
create index traslados_ventana_fecha_idx on public.traslados (ventana_fecha);

create trigger trg_traslados_updated_at
before update on public.traslados
for each row execute function private.set_updated_at();

alter table public.traslados enable row level security;
revoke all on public.traslados from public, anon;
grant select, insert, update on public.traslados to authenticated;

-- ===========================================================================
-- Helpers de negocio (tras conductores / rutas / traslados)
-- ===========================================================================
create or replace function private.conductor_id()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select c.id
  from public.conductores c
  where c.usuario_id = (select auth.uid())
  limit 1;
$$;

revoke all on function private.conductor_id() from public, anon;
grant execute on function private.conductor_id() to authenticated;

create or replace function private.puede_ver_ruta(p_ruta_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.rutas r
    join public.sucursales s on s.id = r.sucursal_id
    where r.id = p_ruta_id
      and (
        private.es_mecanu_admin()
        or (
          private.puede_ver_sucursal(r.sucursal_id)
          and (
            private.es_staff_del_grupo(s.grupo_id)
            or exists (
              select 1
              from public.traslados t
              where t.ruta_id = r.id
                and t.conductor_id = private.conductor_id()
            )
          )
        )
      )
  );
$$;

revoke all on function private.puede_ver_ruta(text) from public, anon;
grant execute on function private.puede_ver_ruta(text) to authenticated;

create or replace function private.puede_escribir_ruta(p_ruta_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.rutas r
    join public.sucursales s on s.id = r.sucursal_id
    where r.id = p_ruta_id
      and (
        private.es_mecanu_admin()
        or (
          private.puede_ver_sucursal(r.sucursal_id)
          and private.es_staff_del_grupo(s.grupo_id)
        )
      )
  );
$$;

revoke all on function private.puede_escribir_ruta(text) from public, anon;
grant execute on function private.puede_escribir_ruta(text) to authenticated;

-- ===========================================================================
-- logs (timeline del traslado)
-- ===========================================================================
create table public.logs (
  id text primary key,
  traslado_id text not null references public.traslados (id),
  tipo text not null check (tipo in (
    'cambio_estado', 'gps', 'evidencia', 'comunicacion', 'incidencia', 'nota'
  )),
  ts timestamptz not null default now(),
  actor text not null default '',
  trigger_source text not null check (trigger_source in ('manual', 'conductor', 'api', 'cron')),
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index logs_traslado_id_ts_idx on public.logs (traslado_id, ts desc);

create trigger trg_logs_updated_at
before update on public.logs
for each row execute function private.set_updated_at();

alter table public.logs enable row level security;
revoke all on public.logs from public, anon;
grant select, insert on public.logs to authenticated;

-- ===========================================================================
-- inspecciones — evidencia sellada: REVOKE UPDATE
-- ===========================================================================
create table public.inspecciones (
  id text primary key,
  tipo text not null check (tipo in ('check-in', 'check-out')),
  ruta_id text not null references public.rutas (id),
  traslado_id text references public.traslados (id),
  fecha timestamptz not null,
  inspector_id text,
  inspector_nombre text not null default '',
  sede text not null default '',
  km int not null default 0,
  combustible text not null default '',
  combustible_pct int,
  limpieza text not null default '',
  vehiculo jsonb not null default '{}'::jsonb,
  itv jsonb not null default '{}'::jsonb,
  itv_vence date,
  zonas jsonb not null default '[]'::jsonb,
  firmas jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index inspecciones_ruta_id_idx on public.inspecciones (ruta_id);
create index inspecciones_traslado_id_idx on public.inspecciones (traslado_id);

alter table public.inspecciones enable row level security;
revoke all on public.inspecciones from public, anon;
grant select, insert on public.inspecciones to authenticated;
-- Sin UPDATE ni DELETE: evidencia sellada (PERMISOS.md invariante 7).

create table public.inspeccion_danos (
  id uuid primary key default gen_random_uuid(),
  inspeccion_id text not null references public.inspecciones (id),
  zona text not null,
  tipo text not null default '',
  descripcion text not null default '',
  ubicacion text not null default '',
  foto_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index inspeccion_danos_inspeccion_id_idx on public.inspeccion_danos (inspeccion_id);

alter table public.inspeccion_danos enable row level security;
revoke all on public.inspeccion_danos from public, anon;
grant select, insert on public.inspeccion_danos to authenticated;

create table public.inspeccion_hallazgos (
  id uuid primary key default gen_random_uuid(),
  inspeccion_id text not null references public.inspecciones (id),
  categoria text not null default '',
  item text not null,
  metrica text not null default '',
  severidad text not null check (severidad in ('ok', 'warning', 'danger')),
  prediccion text not null default '',
  vida text not null default '',
  cambio text not null default '',
  servicio_nombre text,
  servicio_precio_cents int,
  foto_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index inspeccion_hallazgos_inspeccion_id_idx on public.inspeccion_hallazgos (inspeccion_id);

alter table public.inspeccion_hallazgos enable row level security;
revoke all on public.inspeccion_hallazgos from public, anon;
grant select, insert on public.inspeccion_hallazgos to authenticated;

-- ===========================================================================
-- presupuestos (viven en campañas; sucursal_id denormalizado)
-- ===========================================================================
create table public.presupuestos (
  id text primary key,
  sucursal_id uuid not null references public.sucursales (id),
  campana_id text,
  vehiculo_id text references public.vehiculos (id),
  ruta_origen_id text references public.rutas (id),
  ruta_generada_id text references public.rutas (id),
  modo text not null check (modo in ('detallado', 'solo_total')),
  estado text not null check (estado in (
    'nueva', 'valorada', 'enviada', 'aceptada', 'rechazada', 'caducada'
  )),
  iva_incluido boolean not null default true,
  total_cents int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index presupuestos_sucursal_id_idx on public.presupuestos (sucursal_id);
create index presupuestos_campana_id_idx on public.presupuestos (campana_id);

create trigger trg_presupuestos_updated_at
before update on public.presupuestos
for each row execute function private.set_updated_at();

alter table public.presupuestos enable row level security;
revoke all on public.presupuestos from public, anon;
grant select, insert, update on public.presupuestos to authenticated;

create table public.presupuesto_lineas (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id text not null references public.presupuestos (id),
  descripcion text not null,
  importe_cents int not null default 0,
  origen text not null check (origen in ('inspeccion', 'manual', 'traslado')),
  servicio_tempario_id text references public.servicios (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index presupuesto_lineas_presupuesto_id_idx on public.presupuesto_lineas (presupuesto_id);

create trigger trg_presupuesto_lineas_updated_at
before update on public.presupuesto_lineas
for each row execute function private.set_updated_at();

alter table public.presupuesto_lineas enable row level security;
revoke all on public.presupuesto_lineas from public, anon;
grant select, insert, update, delete on public.presupuesto_lineas to authenticated;

-- ===========================================================================
-- campañas
-- ===========================================================================
create table public.campanas (
  id text primary key,
  sucursal_id uuid not null references public.sucursales (id),
  cliente_id text references public.clientes (id),
  vehiculo_id text references public.vehiculos (id),
  ruta_origen_id text references public.rutas (id),
  ruta_generada_id text references public.rutas (id),
  inspeccion_id text references public.inspecciones (id),
  presupuesto_id text references public.presupuestos (id),
  tipos text[] not null default '{}',
  etiquetas text[] not null default '{}',
  falla text not null default '',
  evidencia text not null default '',
  valor_cents int not null default 0,
  urgente boolean not null default false,
  severidad text not null default '',
  fecha date,
  habito text not null default '',
  motivo_fecha text not null default '',
  foto_url text,
  estado_envio text not null default '',
  estado text not null check (estado in (
    'nueva', 'valorada', 'enviada', 'aceptada', 'rechazada', 'caducada'
  )),
  origen_automatico boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index campanas_sucursal_id_idx on public.campanas (sucursal_id);
create index campanas_estado_idx on public.campanas (estado);

create trigger trg_campanas_updated_at
before update on public.campanas
for each row execute function private.set_updated_at();

alter table public.campanas enable row level security;
revoke all on public.campanas from public, anon;
grant select, insert, update on public.campanas to authenticated;

create table public.campana_items (
  id text primary key,
  campana_id text not null references public.campanas (id),
  tipo text not null default '',
  origen text not null check (origen in ('confirmado', 'estimado')),
  dias int,
  falla text not null default '',
  registro_idx int not null default 0,
  datos jsonb not null default '{}'::jsonb,
  etiqueta text not null default '',
  servicio_id text references public.servicios (id),
  valor_cents int not null default 0,
  fecha date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index campana_items_campana_id_idx on public.campana_items (campana_id);

create trigger trg_campana_items_updated_at
before update on public.campana_items
for each row execute function private.set_updated_at();

alter table public.campana_items enable row level security;
revoke all on public.campana_items from public, anon;
grant select, insert, update, delete on public.campana_items to authenticated;

alter table public.presupuestos
  add constraint presupuestos_campana_id_fkey
  foreign key (campana_id) references public.campanas (id);

alter table public.rutas
  add constraint rutas_presupuesto_id_fkey
  foreign key (presupuesto_id) references public.presupuestos (id);

-- ===========================================================================
-- solicitudes del conductor al taller
-- ===========================================================================
create table public.solicitudes (
  id text primary key,
  traslado_id text not null references public.traslados (id),
  ruta_id text not null references public.rutas (id),
  conductor_id text not null references public.conductores (id),
  tipo text not null check (tipo in (
    'reagenda', 'rechazo', 'fallido_origen', 'no_rodante'
  )),
  motivo text not null default '',
  nota text,
  ts timestamptz not null default now(),
  estado text not null check (estado in (
    'pendiente', 'resuelta_reagenda', 'resuelta_reasignada',
    'resuelta_cancelada', 'descartada'
  )),
  resolucion text,
  resuelta_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index solicitudes_estado_pendiente_idx
  on public.solicitudes (estado) where estado = 'pendiente';
create index solicitudes_traslado_id_idx on public.solicitudes (traslado_id);

create trigger trg_solicitudes_updated_at
before update on public.solicitudes
for each row execute function private.set_updated_at();

alter table public.solicitudes enable row level security;
revoke all on public.solicitudes from public, anon;
grant select, insert, update on public.solicitudes to authenticated;

-- ===========================================================================
-- RLS de negocio
-- ===========================================================================

-- clientes: visible si el usuario tiene alcance (o membresía staff) en ese grupo.
-- Un cliente no se duplica por sucursal.
create policy clientes_select on public.clientes
for select to authenticated
using (private.puede_ver_grupo(grupo_id));
-- Previene: leer agenda de clientes (teléfono, dirección, email) de otro taller.
-- Roles: cualquier usuario con visibilidad en el grupo (staff con alcance,
-- conductor_flota asignado a una sucursal de ese grupo, mecanu_admin).
-- Enmascarar teléfono es capa de permiso `cliente.ver_datos_reales`, no RLS.

create policy clientes_insert on public.clientes
for insert to authenticated
with check (
  private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id)
);
-- Previene: un conductor (o un admin de otro grupo) crear clientes en un
-- tenant ajeno.
-- Roles: staff del grupo / mecanu_admin.

create policy clientes_update on public.clientes
for update to authenticated
using (private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id))
with check (private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id));
-- Previene: reasignar grupo_id (mover el cliente a otro taller) o editar
-- datos desde un rol de conductor.
-- Roles: staff del grupo / mecanu_admin.

create policy vehiculos_select on public.vehiculos
for select to authenticated
using (private.puede_ver_grupo(grupo_id));
-- Previene: enumerar matrículas / VIN / km de la flota de otro taller.

create policy vehiculos_insert on public.vehiculos
for insert to authenticated
with check (
  private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id)
);

create policy vehiculos_update on public.vehiculos
for update to authenticated
using (
  private.es_mecanu_admin()
  or private.es_staff_del_grupo(grupo_id)
  or (
    -- El conductor actualiza km de UN vehículo que está llevando.
    exists (
      select 1
      from public.traslados t
      join public.rutas r on r.id = t.ruta_id
      where r.vehiculo_id = vehiculos.id
        and t.conductor_id = private.conductor_id()
        and t.estado = 'en_curso'
    )
  )
)
with check (
  private.es_mecanu_admin()
  or private.es_staff_del_grupo(grupo_id)
  or exists (
    select 1
    from public.traslados t
    join public.rutas r on r.id = t.ruta_id
    where r.vehiculo_id = vehiculos.id
      and t.conductor_id = private.conductor_id()
      and t.estado = 'en_curso'
  )
);
-- Previene: un conductor reescribiendo marca/modelo de cualquier vehículo del
-- grupo, o staff de otro taller tocando la flota.
-- Roles: staff del grupo; conductor solo sobre el vehículo de su traslado en
-- curso (el permiso fino `vehiculo.actualizar_km` vive en aplicación).

create policy vehiculo_clientes_select on public.vehiculo_clientes
for select to authenticated
using (
  exists (
    select 1 from public.vehiculos v
    where v.id = vehiculo_id and private.puede_ver_grupo(v.grupo_id)
  )
);

create policy vehiculo_clientes_write on public.vehiculo_clientes
for all to authenticated
using (
  exists (
    select 1 from public.vehiculos v
    where v.id = vehiculo_id
      and (private.es_mecanu_admin() or private.es_staff_del_grupo(v.grupo_id))
  )
)
with check (
  exists (
    select 1 from public.vehiculos v
    where v.id = vehiculo_id
      and (private.es_mecanu_admin() or private.es_staff_del_grupo(v.grupo_id))
  )
);
-- Previene: vincular un cliente de taller A a un vehículo de taller B
-- (y filtrar relaciones de un grupo ajeno).
-- FOR ALL cubre insert/update/delete. SELECT tiene política propia más amplia.

create policy servicios_select on public.servicios
for select to authenticated
using (
  private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id)
);
-- Previene: que un conductor (u otro taller) lea precios de mano de obra /
-- materiales. presupuesto.ver no es permiso de conductor.

create policy servicios_write on public.servicios
for all to authenticated
using (private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id))
with check (private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id));

create policy conductores_select on public.conductores
for select to authenticated
using (
  usuario_id = (select auth.uid())
  or private.es_mecanu_admin()
  or exists (
    select 1 from public.user_org_roles r
    where r.usuario_id = conductores.usuario_id
      and private.es_staff_del_grupo(r.grupo_id)
  )
  or exists (
    select 1
    from public.user_sucursal_access usa
    join public.sucursales s on s.id = usa.sucursal_id
    where usa.usuario_id = conductores.usuario_id
      and private.es_staff_del_grupo(s.grupo_id)
  )
);
-- Previene: listar la plantilla (teléfono, docs, incidencias, calificación)
-- de otro taller o de la flota Mecanu entera.
-- Roles: uno mismo; staff del grupo de membresía (internos); staff del taller
-- donde un conductor_flota tiene sucursal asignada; mecanu_admin.

create policy conductores_insert on public.conductores
for insert to authenticated
with check (
  private.es_mecanu_admin()
  or exists (
    select 1 from public.user_org_roles r
    where r.usuario_id = conductores.usuario_id
      and private.es_staff_del_grupo(r.grupo_id)
  )
);
-- Previene: auto-alta de un conductor sin pasar por el onboarding del taller,
-- o colgar un conductor de un usuario de otro grupo.

create policy conductores_update on public.conductores
for update to authenticated
using (
  usuario_id = (select auth.uid())
  or private.es_mecanu_admin()
  or exists (
    select 1 from public.user_org_roles r
    where r.usuario_id = conductores.usuario_id
      and private.es_staff_del_grupo(r.grupo_id)
  )
)
with check (
  usuario_id = (select auth.uid())
  or private.es_mecanu_admin()
  or exists (
    select 1 from public.user_org_roles r
    where r.usuario_id = conductores.usuario_id
      and private.es_staff_del_grupo(r.grupo_id)
  )
);
-- Previene: que un taller edite el perfil de un conductor de otro.
-- El conductor puede tocar su propia fila (docs); `proceso = activo` lo
-- mueve el taller via autorizar(), no RLS.

create policy rutas_select on public.rutas
for select to authenticated
using (private.puede_ver_ruta(id));
-- Previene: ver el kanban (cliente, vehículo, presupuesto_id, motivo de
-- cancelación) de otra sucursal / otro taller.
-- Roles: staff con esa sucursal en alcance; conductor solo si tiene un
-- traslado asignado en esa ruta; mecanu_admin todas.

create policy rutas_insert on public.rutas
for insert to authenticated
with check (
  -- En INSERT la fila aún no existe: puede_escribir_ruta(id) miraría un SELECT
  -- vacío. Se evalúa contra NEW.sucursal_id.
  private.es_mecanu_admin()
  or (
    private.puede_ver_sucursal(sucursal_id)
    and private.es_staff_del_grupo(
      (select s.grupo_id from public.sucursales s where s.id = sucursal_id)
    )
  )
);
-- Previene: crear una ruta en la sucursal de otro taller (el atajo de
-- copiar un TR-* a otro tenant).
-- Roles: staff de la sucursal destino / mecanu_admin. Conductor no crea rutas.

create policy rutas_update on public.rutas
for update to authenticated
using (private.puede_escribir_ruta(id))
with check (private.puede_escribir_ruta(id));
-- Previene: que el conductor mueva el estado de la RUTA (los 4 subestados
-- de EN RUTA viven en traslados, no aquí) o que staff de otra sucursal
-- cancele. Cancelar exige motivo (check SQL, no RLS).

create policy paradas_select on public.paradas
for select to authenticated
using (private.puede_ver_ruta(ruta_id));

create policy paradas_write on public.paradas
for all to authenticated
using (private.puede_escribir_ruta(ruta_id))
with check (private.puede_escribir_ruta(ruta_id));
-- Previene: reescribir direcciones de recogida/entrega de una ruta ajena.

create policy traslados_select on public.traslados
for select to authenticated
using (private.puede_ver_ruta(ruta_id));

create policy traslados_insert on public.traslados
for insert to authenticated
with check (private.puede_escribir_ruta(ruta_id));
-- Previene: colar un tramo en la ruta de otro taller.

create policy traslados_update on public.traslados
for update to authenticated
using (
  private.puede_escribir_ruta(ruta_id)
  or conductor_id = private.conductor_id()
)
with check (
  private.puede_escribir_ruta(ruta_id)
  or conductor_id = private.conductor_id()
);
-- Previene: que un conductor avance el subestado de UN TRASLADO QUE NO ES
-- EL SUYO (invariante R7, segunda red; la primera es autorizar()).
-- Roles: staff de la ruta; el conductor asignado a ESA fila.

create policy logs_select on public.logs
for select to authenticated
using (
  exists (
    select 1 from public.traslados t
    where t.id = traslado_id and private.puede_ver_ruta(t.ruta_id)
  )
);

create policy logs_insert on public.logs
for insert to authenticated
with check (
  exists (
    select 1 from public.traslados t
    where t.id = traslado_id
      and (
        private.puede_escribir_ruta(t.ruta_id)
        or t.conductor_id = private.conductor_id()
      )
  )
);
-- Previene: inyectar un log (evidencia, incidencia) en el timeline de un
-- traslado ajeno. Sin UPDATE/DELETE: el timeline no se reescribe.

create policy inspecciones_select on public.inspecciones
for select to authenticated
using (private.puede_ver_ruta(ruta_id));

create policy inspecciones_insert on public.inspecciones
for insert to authenticated
with check (
  private.puede_escribir_ruta(ruta_id)
  or exists (
    select 1 from public.traslados t
    where t.id = traslado_id
      and t.conductor_id = private.conductor_id()
  )
);
-- Previene: plantar un check-in firmado en una ruta de otro taller.
-- Sin política UPDATE: grant tampoco lo permite. Evidencia sellada.

create policy inspeccion_danos_select on public.inspeccion_danos
for select to authenticated
using (
  exists (
    select 1 from public.inspecciones i
    where i.id = inspeccion_id and private.puede_ver_ruta(i.ruta_id)
  )
);

create policy inspeccion_danos_insert on public.inspeccion_danos
for insert to authenticated
with check (
  exists (
    select 1 from public.inspecciones i
    where i.id = inspeccion_id
      and (
        private.puede_escribir_ruta(i.ruta_id)
        or exists (
          select 1 from public.traslados t
          where t.id = i.traslado_id and t.conductor_id = private.conductor_id()
        )
      )
  )
);

create policy inspeccion_hallazgos_select on public.inspeccion_hallazgos
for select to authenticated
using (
  exists (
    select 1 from public.inspecciones i
    where i.id = inspeccion_id and private.puede_ver_ruta(i.ruta_id)
  )
);

create policy inspeccion_hallazgos_insert on public.inspeccion_hallazgos
for insert to authenticated
with check (
  exists (
    select 1 from public.inspecciones i
    where i.id = inspeccion_id
      and (
        private.puede_escribir_ruta(i.ruta_id)
        or exists (
          select 1 from public.traslados t
          where t.id = i.traslado_id and t.conductor_id = private.conductor_id()
        )
      )
  )
);

create policy presupuestos_select on public.presupuestos
for select to authenticated
using (
  private.es_mecanu_admin()
  or (
    private.puede_ver_sucursal(sucursal_id)
    and private.es_staff_del_grupo(
      (select s.grupo_id from public.sucursales s where s.id = sucursal_id)
    )
  )
);
-- Previene: que un conductor (u otro taller) vea desglose e importes.
-- Roles: staff de la sucursal / mecanu_admin. Coherente con presupuesto.ver.

create policy presupuestos_write on public.presupuestos
for all to authenticated
using (
  private.es_mecanu_admin()
  or (
    private.puede_ver_sucursal(sucursal_id)
    and private.es_staff_del_grupo(
      (select s.grupo_id from public.sucursales s where s.id = sucursal_id)
    )
  )
)
with check (
  private.es_mecanu_admin()
  or (
    private.puede_ver_sucursal(sucursal_id)
    and private.es_staff_del_grupo(
      (select s.grupo_id from public.sucursales s where s.id = sucursal_id)
    )
  )
);

create policy presupuesto_lineas_select on public.presupuesto_lineas
for select to authenticated
using (
  exists (
    select 1 from public.presupuestos p
    where p.id = presupuesto_id
      and (
        private.es_mecanu_admin()
        or (
          private.puede_ver_sucursal(p.sucursal_id)
          and private.es_staff_del_grupo(
            (select s.grupo_id from public.sucursales s where s.id = p.sucursal_id)
          )
        )
      )
  )
);

create policy presupuesto_lineas_write on public.presupuesto_lineas
for all to authenticated
using (
  exists (
    select 1 from public.presupuestos p
    where p.id = presupuesto_id
      and (
        private.es_mecanu_admin()
        or (
          private.puede_ver_sucursal(p.sucursal_id)
          and private.es_staff_del_grupo(
            (select s.grupo_id from public.sucursales s where s.id = p.sucursal_id)
          )
        )
      )
  )
)
with check (
  exists (
    select 1 from public.presupuestos p
    where p.id = presupuesto_id
      and (
        private.es_mecanu_admin()
        or (
          private.puede_ver_sucursal(p.sucursal_id)
          and private.es_staff_del_grupo(
            (select s.grupo_id from public.sucursales s where s.id = p.sucursal_id)
          )
        )
      )
  )
);

create policy campanas_select on public.campanas
for select to authenticated
using (
  private.es_mecanu_admin()
  or (
    private.puede_ver_sucursal(sucursal_id)
    and private.es_staff_del_grupo(
      (select s.grupo_id from public.sucursales s where s.id = sucursal_id)
    )
  )
);

create policy campanas_write on public.campanas
for all to authenticated
using (
  private.es_mecanu_admin()
  or (
    private.puede_ver_sucursal(sucursal_id)
    and private.es_staff_del_grupo(
      (select s.grupo_id from public.sucursales s where s.id = sucursal_id)
    )
  )
)
with check (
  private.es_mecanu_admin()
  or (
    private.puede_ver_sucursal(sucursal_id)
    and private.es_staff_del_grupo(
      (select s.grupo_id from public.sucursales s where s.id = sucursal_id)
    )
  )
);
-- Previene: ver o avanzar campañas (WhatsApp, presupuestos) de otro taller.

create policy campana_items_select on public.campana_items
for select to authenticated
using (
  exists (
    select 1 from public.campanas c
    where c.id = campana_id
      and (
        private.es_mecanu_admin()
        or (
          private.puede_ver_sucursal(c.sucursal_id)
          and private.es_staff_del_grupo(
            (select s.grupo_id from public.sucursales s where s.id = c.sucursal_id)
          )
        )
      )
  )
);

create policy campana_items_write on public.campana_items
for all to authenticated
using (
  exists (
    select 1 from public.campanas c
    where c.id = campana_id
      and (
        private.es_mecanu_admin()
        or (
          private.puede_ver_sucursal(c.sucursal_id)
          and private.es_staff_del_grupo(
            (select s.grupo_id from public.sucursales s where s.id = c.sucursal_id)
          )
        )
      )
  )
)
with check (
  exists (
    select 1 from public.campanas c
    where c.id = campana_id
      and (
        private.es_mecanu_admin()
        or (
          private.puede_ver_sucursal(c.sucursal_id)
          and private.es_staff_del_grupo(
            (select s.grupo_id from public.sucursales s where s.id = c.sucursal_id)
          )
        )
      )
  )
);

create policy solicitudes_select on public.solicitudes
for select to authenticated
using (
  conductor_id = private.conductor_id()
  or private.puede_escribir_ruta(ruta_id)
);
-- Previene: ver la bandeja de solicitudes (reagenda, no rodante) de otro
-- taller, o las de otro conductor.
-- Roles: el conductor autor; staff de la ruta; mecanu_admin (vía escribir_ruta).

create policy solicitudes_insert on public.solicitudes
for insert to authenticated
with check (
  conductor_id = private.conductor_id()
  or private.puede_escribir_ruta(ruta_id)
);
-- Previene: plantar una solicitud en nombre de otro conductor.

create policy solicitudes_update on public.solicitudes
for update to authenticated
using (private.puede_escribir_ruta(ruta_id))
with check (private.puede_escribir_ruta(ruta_id));
-- Previene: que el conductor "resuelva" su propia solicitud (eso es
-- solicitud.resolver, solo staff). El conductor no actualiza tras insertar.

commit;
