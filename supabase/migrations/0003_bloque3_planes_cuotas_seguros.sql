-- Bloque 3 — Planes, cuotas, feature switches y seguros.
-- Seeds: tres planes, plan_limites (fila explícita por dimensión, null =
-- ilimitado), overages Alta/Lujo (nada Hyper), recargo flota Alta 35% sobre
-- Lujo, catálogo con seguro_demanda activo_global = false.
-- Trigger de reversión de traslados_creados (línea de corte por día de servicio).
--
-- Depende de bloques 1 y 2. El INSERT en audit_events del trigger se salta
-- si el bloque 4 aún no se ha aplicado (to_regclass).
-- Reversa: 0003_bloque3_planes_cuotas_seguros.down.sql
-- NO APLICA esta migración.

begin;

create or replace function private.es_grupo_admin_de(p_grupo_id uuid)
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
      and rol = 'grupo_admin'
      and activo = true
  );
$$;

revoke all on function private.es_grupo_admin_de(uuid) from public, anon;
grant execute on function private.es_grupo_admin_de(uuid) to authenticated;

-- ===========================================================================
-- Catálogo de planes
-- ===========================================================================
create table public.planes_config (
  nombre text primary key check (nombre in ('alta', 'lujo', 'hyper')),
  descripcion text not null,
  precio_mensual_cents int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_planes_config_updated_at
before update on public.planes_config
for each row execute function private.set_updated_at();

alter table public.planes_config enable row level security;
revoke all on public.planes_config from public, anon;
grant select on public.planes_config to authenticated;
grant insert, update on public.planes_config to authenticated;

create policy planes_config_select on public.planes_config
for select to authenticated
using (true);
-- Previene: nada en SELECT — el catálogo de planes es público para cualquier
-- usuario autenticado (la UI de upgrade lo necesita). anon sigue sin GRANT.
-- Roles: authenticated.

create policy planes_config_write on public.planes_config
for all to authenticated
using (private.es_mecanu_admin())
with check (private.es_mecanu_admin());
-- Previene: que un taller se baje el precio o se ponga limite=null a sí mismo.
-- Roles: solo mecanu_admin. SELECT ya cubierto por la política anterior (OR).

create table public.plan_limites (
  plan text not null references public.planes_config (nombre),
  dimension text not null check (dimension in (
    'traslados_creados', 'conductores_activos', 'sucursales_activas', 'whatsapp_msgs_mes'
  )),
  limite int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (plan, dimension)
);

create trigger trg_plan_limites_updated_at
before update on public.plan_limites
for each row execute function private.set_updated_at();

alter table public.plan_limites enable row level security;
revoke all on public.plan_limites from public, anon;
grant select on public.plan_limites to authenticated;
grant insert, update on public.plan_limites to authenticated;

create policy plan_limites_select on public.plan_limites
for select to authenticated
using (true);

create policy plan_limites_write on public.plan_limites
for all to authenticated
using (private.es_mecanu_admin())
with check (private.es_mecanu_admin());
-- Previene: un taller ampliándose el cupo (limite = null) sin pasar por Mecanu.

create table public.plan_precios_overage (
  plan text not null references public.planes_config (nombre),
  dimension text not null,
  precio_unitario_cents int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (plan, dimension)
);

create trigger trg_plan_precios_overage_updated_at
before update on public.plan_precios_overage
for each row execute function private.set_updated_at();

alter table public.plan_precios_overage enable row level security;
revoke all on public.plan_precios_overage from public, anon;
grant select on public.plan_precios_overage to authenticated;
grant insert, update on public.plan_precios_overage to authenticated;

create policy plan_precios_overage_select on public.plan_precios_overage
for select to authenticated
using (true);

create policy plan_precios_overage_write on public.plan_precios_overage
for all to authenticated
using (private.es_mecanu_admin())
with check (private.es_mecanu_admin());
-- Previene: reescribir el céntimo del excedente. Hyper no tiene filas a propósito.

create table public.plan_precios_flota (
  plan text primary key references public.planes_config (nombre),
  tarifa_base_cents int,
  recargo_pct numeric(5, 2),
  recargo_sobre_plan text references public.planes_config (nombre),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plan_precios_flota_modo check (
    (tarifa_base_cents is not null)
    <> (recargo_pct is not null and recargo_sobre_plan is not null)
  )
);

create trigger trg_plan_precios_flota_updated_at
before update on public.plan_precios_flota
for each row execute function private.set_updated_at();

alter table public.plan_precios_flota enable row level security;
revoke all on public.plan_precios_flota from public, anon;
grant select on public.plan_precios_flota to authenticated;
grant insert, update on public.plan_precios_flota to authenticated;

create policy plan_precios_flota_select on public.plan_precios_flota
for select to authenticated
using (true);

create policy plan_precios_flota_write on public.plan_precios_flota
for all to authenticated
using (private.es_mecanu_admin())
with check (private.es_mecanu_admin());

-- ===========================================================================
-- org_plan / contadores / overages
-- ===========================================================================
create table public.org_plan (
  grupo_id uuid primary key references public.grupos (id),
  plan text not null references public.planes_config (nombre),
  periodo_inicio date not null,
  periodo_fin date not null,
  actualizado_por uuid references public.usuarios (id),
  actualizado_en timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_org_plan_updated_at
before update on public.org_plan
for each row execute function private.set_updated_at();

alter table public.org_plan enable row level security;
revoke all on public.org_plan from public, anon;
grant select, insert, update on public.org_plan to authenticated;

create policy org_plan_select on public.org_plan
for select to authenticated
using (private.puede_ver_grupo(grupo_id));
-- Previene: espiar qué plan (y por tanto qué cuota) tiene otro taller.

create policy org_plan_insert on public.org_plan
for insert to authenticated
with check (private.es_mecanu_admin());
-- Previene: auto-provisionarse un plan Hyper. El alta inicial la hace Mecanu.

create policy org_plan_update on public.org_plan
for update to authenticated
using (
  private.es_mecanu_admin() or private.es_grupo_admin_de(grupo_id)
)
with check (
  private.es_mecanu_admin() or private.es_grupo_admin_de(grupo_id)
);
-- Previene: que un sucursal_admin (tiene ver_plan, NO cambiar_plan) cambie el
-- plan, o que un grupo_admin cambie el de OTRO grupo.
-- Roles: grupo_admin del propio grupo; mecanu_admin. El downgrade con
-- sucursales de más es invariante de aplicación, no RLS.

create table public.usage_counters (
  grupo_id uuid not null references public.grupos (id),
  periodo date not null,
  dimension text not null,
  contador int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (grupo_id, periodo, dimension)
);

create index usage_counters_grupo_periodo_idx on public.usage_counters (grupo_id, periodo);

create trigger trg_usage_counters_updated_at
before update on public.usage_counters
for each row execute function private.set_updated_at();

alter table public.usage_counters enable row level security;
revoke all on public.usage_counters from public, anon;
grant select, insert, update on public.usage_counters to authenticated;

create policy usage_counters_select on public.usage_counters
for select to authenticated
using (private.puede_ver_grupo(grupo_id));
-- Previene: leer cuotas/consumo de otro taller (dato comercial).

create policy usage_counters_write on public.usage_counters
for all to authenticated
using (
  private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id)
)
with check (
  private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id)
);
-- Previene: inflar o resetear el contador de otro grupo. El trigger de
-- reversión corre como el usuario que cancela (staff), y entra por aquí.

create table public.usage_overages (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id),
  periodo date not null,
  dimension text not null,
  entidad_id text,
  precio_unitario_cents int not null,
  facturado boolean not null default false,
  facturado_en timestamptz,
  revertido boolean not null default false,
  revertido_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index usage_overages_grupo_periodo_idx on public.usage_overages (grupo_id, periodo);
create index usage_overages_entidad_idx
  on public.usage_overages (grupo_id, dimension, entidad_id)
  where revertido = false;

create trigger trg_usage_overages_updated_at
before update on public.usage_overages
for each row execute function private.set_updated_at();

alter table public.usage_overages enable row level security;
revoke all on public.usage_overages from public, anon;
grant select, insert, update on public.usage_overages to authenticated;

create policy usage_overages_select on public.usage_overages
for select to authenticated
using (private.puede_ver_grupo(grupo_id));
-- Previene: ver cargos de excedente (y por tanto volumen) de otro taller.

create policy usage_overages_write on public.usage_overages
for all to authenticated
using (
  private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id)
)
with check (
  private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id)
);
-- Previene: marcar facturado=true en cargos ajenos, o borrar un cargo
-- (no hay DELETE concedido). revertido se marca, no se borra la fila.

-- ===========================================================================
-- Feature switches
-- ===========================================================================
create table public.feature_switches_catalog (
  feature text primary key,
  descripcion text not null,
  activo_global boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_feature_switches_catalog_updated_at
before update on public.feature_switches_catalog
for each row execute function private.set_updated_at();

alter table public.feature_switches_catalog enable row level security;
revoke all on public.feature_switches_catalog from public, anon;
grant select on public.feature_switches_catalog to authenticated;
grant insert, update on public.feature_switches_catalog to authenticated;

create policy feature_switches_catalog_select on public.feature_switches_catalog
for select to authenticated
using (true);

create policy feature_switches_catalog_write on public.feature_switches_catalog
for all to authenticated
using (private.es_mecanu_admin())
with check (private.es_mecanu_admin());
-- Previene: activar seguro_demanda (u otro feature en espera de producto)
-- desde un taller. activo_global solo lo mueve Mecanu.

create table public.org_feature_switches (
  grupo_id uuid not null references public.grupos (id),
  feature text not null references public.feature_switches_catalog (feature),
  activo boolean not null,
  origen text not null check (origen in ('plan', 'excepcion')),
  activado_por uuid references public.usuarios (id),
  activado_en timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (grupo_id, feature)
);

create trigger trg_org_feature_switches_updated_at
before update on public.org_feature_switches
for each row execute function private.set_updated_at();

alter table public.org_feature_switches enable row level security;
revoke all on public.org_feature_switches from public, anon;
grant select, insert, update on public.org_feature_switches to authenticated;

create policy org_feature_switches_select on public.org_feature_switches
for select to authenticated
using (private.puede_ver_grupo(grupo_id));
-- Previene: ver qué productos tiene contratados otro taller.

create policy org_feature_switches_write on public.org_feature_switches
for all to authenticated
using (
  private.es_mecanu_admin() or private.es_grupo_admin_de(grupo_id)
)
with check (
  private.es_mecanu_admin() or private.es_grupo_admin_de(grupo_id)
);
-- Previene: sucursal_admin activando switches (permiso configuracion.switches
-- es grupo_admin / mecanu_admin). La cascada activo_global=false → OFF para
-- todos vive en aplicación, no en RLS.

-- ===========================================================================
-- Seguros externos (histórico) + WhatsApp config
-- ===========================================================================
create table public.seguros_externos (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id),
  aseguradora text not null,
  numero_poliza text not null,
  vigente_desde date not null,
  vigente_hasta date not null,
  cobertura_descripcion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.usuarios (id),
  updated_by uuid references public.usuarios (id)
);

create index seguros_externos_grupo_vigente_idx
  on public.seguros_externos (grupo_id, vigente_desde desc);

create trigger trg_seguros_externos_updated_at
before update on public.seguros_externos
for each row execute function private.set_updated_at();

alter table public.seguros_externos enable row level security;
revoke all on public.seguros_externos from public, anon;
grant select, insert, update on public.seguros_externos to authenticated;

create policy seguros_externos_select on public.seguros_externos
for select to authenticated
using (private.puede_ver_grupo(grupo_id));
-- Previene: leer número de póliza / aseguradora de otro taller (dato legal).

create policy seguros_externos_write on public.seguros_externos
for all to authenticated
using (private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id))
with check (private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id));
-- Previene: interpolar una póliza en el histórico de otro grupo. Sin DELETE:
-- el histórico se conserva (PK propia id, no grupo_id).

create view public.seguros_externos_vigente
with (security_invoker = true) as
select distinct on (grupo_id) *
from public.seguros_externos
where vigente_desde <= current_date
order by grupo_id, vigente_desde desc;
-- security_invoker: la vista NO bypasea RLS de seguros_externos.
-- Toma la póliza más reciente que ya empezó, incluso si vigente_hasta pasó
-- (el escudo la pinta en rojo como caducada, no como "sin seguro").

grant select on public.seguros_externos_vigente to authenticated;
revoke all on public.seguros_externos_vigente from public, anon;

create table public.whatsapp_config (
  grupo_id uuid primary key references public.grupos (id),
  proveedor text not null check (proveedor in ('kapso', 'meta_cloud_api')),
  numero_telefono text not null,
  credenciales_ref text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.usuarios (id)
);

create trigger trg_whatsapp_config_updated_at
before update on public.whatsapp_config
for each row execute function private.set_updated_at();

alter table public.whatsapp_config enable row level security;
revoke all on public.whatsapp_config from public, anon;
grant select, insert, update on public.whatsapp_config to authenticated;

create policy whatsapp_config_select on public.whatsapp_config
for select to authenticated
using (private.es_mecanu_admin() or private.es_staff_del_grupo(grupo_id));
-- Previene: leer el número / la referencia al secreto de otro taller.
-- credenciales_ref NUNCA es el token; el token vive en el gestor de secretos.

create policy whatsapp_config_write on public.whatsapp_config
for all to authenticated
using (private.es_mecanu_admin() or private.es_grupo_admin_de(grupo_id))
with check (private.es_mecanu_admin() or private.es_grupo_admin_de(grupo_id));
-- Previene: sucursal_admin reescribiendo el WABA, o un grupo apuntando
-- credenciales_ref al secreto de otro.

-- ===========================================================================
-- Trigger: reversión de traslados_creados al cancelar
-- Línea de corte = día de servicio = MIN(traslados.ventana_fecha) no nulo.
-- Hoy se evalúa en Europe/Madrid.
-- ===========================================================================
create or replace function private.revertir_contador_traslados_creados()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fecha_servicio date;
  v_grupo_id uuid;
  v_periodo date;
  v_hoy date := (now() at time zone 'Europe/Madrid')::date;
  v_overage_id uuid;
  v_motivo text;
begin
  if new.estado <> 'cancelado' or old.estado = 'cancelado' then
    return new;
  end if;

  select s.grupo_id into v_grupo_id
  from public.sucursales s
  where s.id = new.sucursal_id;

  v_periodo := date_trunc('month', new.creada_en)::date;

  select min(t.ventana_fecha) into v_fecha_servicio
  from public.traslados t
  where t.ruta_id = new.id
    and t.ventana_fecha is not null;

  -- Con fecha de servicio <= hoy (mismo día o después) → el cargo se mantiene.
  if v_fecha_servicio is not null and v_fecha_servicio <= v_hoy then
    return new;
  end if;

  v_motivo := case
    when v_fecha_servicio is null then 'sin_fecha_comprometida'
    else 'cancelada_antes_del_servicio'
  end;

  update public.usage_counters
  set contador = contador - 1
  where grupo_id = v_grupo_id
    and periodo = v_periodo
    and dimension = 'traslados_creados'
    and contador > 0;

  select uo.id into v_overage_id
  from public.usage_overages uo
  where uo.grupo_id = v_grupo_id
    and uo.periodo = v_periodo
    and uo.dimension = 'traslados_creados'
    and uo.entidad_id = new.id
    and uo.revertido = false
  limit 1;

  if v_overage_id is not null then
    update public.usage_overages
    set revertido = true, revertido_en = now()
    where id = v_overage_id;
  end if;

  -- audit_events llega en el bloque 4. Si aún no existe, no rompemos el cancel.
  if to_regclass('public.audit_events') is not null then
    insert into public.audit_events (
      actor_id, actor_rol, grupo_id, sucursal_id, entidad, entidad_id, accion,
      payload_antes, payload_despues
    ) values (
      new.updated_by,
      null,
      v_grupo_id,
      new.sucursal_id,
      'ruta',
      new.id,
      'contador_traslado_revertido',
      jsonb_build_object('fecha_servicio', v_fecha_servicio, 'motivo', v_motivo),
      jsonb_build_object(
        'overage_revertido', v_overage_id is not null,
        'overage_id', v_overage_id
      )
    );
  end if;

  return new;
end;
$$;

revoke all on function private.revertir_contador_traslados_creados() from public, anon, authenticated;

create trigger trg_revertir_contador_traslados_creados
before update on public.rutas
for each row execute function private.revertir_contador_traslados_creados();

-- ===========================================================================
-- Seeds
-- ===========================================================================
insert into public.planes_config (nombre, descripcion, precio_mensual_cents) values
  ('alta',  'Plan de entrada para talleres pequeños', 0),
  ('lujo',  'Plan para talleres en crecimiento',      0),
  ('hyper', 'Plan enterprise — precio negociado',     null);
-- precio_mensual_cents 0 de alta/lujo es placeholder (PREGUNTAS-ABIERTAS.md §27).
-- hyper es null a propósito: negociado fuera de la plataforma.

insert into public.plan_limites (plan, dimension, limite) values
  ('alta',  'traslados_creados',     20),
  ('alta',  'conductores_activos',    3),
  ('alta',  'sucursales_activas',     1),
  ('alta',  'whatsapp_msgs_mes',     10),
  ('lujo',  'traslados_creados',    100),
  ('lujo',  'conductores_activos',    8),
  ('lujo',  'sucursales_activas',     2),
  ('lujo',  'whatsapp_msgs_mes',   null),
  ('hyper', 'traslados_creados',   null),
  ('hyper', 'conductores_activos', null),
  ('hyper', 'sucursales_activas',  null),
  ('hyper', 'whatsapp_msgs_mes',   null);
-- Toda combinación plan × dimensión tiene fila. null = ilimitado, NUNCA ausencia.

insert into public.plan_precios_overage (plan, dimension, precio_unitario_cents) values
  ('alta', 'traslados_creados',    290),
  ('alta', 'conductores_activos',  490),
  ('alta', 'sucursales_activas',  1390),
  ('lujo', 'traslados_creados',    290),
  ('lujo', 'conductores_activos',  490),
  ('lujo', 'sucursales_activas',  1390);
-- WhatsApp Alta: tope duro, sin fila aquí. Hyper: sin filas.

insert into public.plan_precios_flota (
  plan, tarifa_base_cents, recargo_pct, recargo_sobre_plan
) values
  ('lujo', 0,    null,  null),
  ('alta', null, 35.00, 'lujo');
-- tarifa_base_cents de Lujo = 0 es placeholder (§27), NO null: null + sin recargo
-- violaría el check XOR. Hyper: sin fila.

insert into public.feature_switches_catalog (feature, descripcion, activo_global) values
  ('gps_tracking',           'Trail GPS del conductor durante el traslado',            false),
  ('campanas_auto',          'Campañas automáticas desde hallazgos de check-in',       true),
  ('checkin_video',          'Video obligatorio en el check-in del conductor',         false),
  ('ia_diagnostico',         'Preview de diagnóstico IA en hallazgos',                 false),
  ('seguro_demanda',         'Seguro Mecanu bajo demanda por traslado',                false),
  ('seguro_mecanu_mensual',  'Seguro Mecanu de cuota mensual fija',                    false),
  ('whatsapp_propio',        'Número WhatsApp Business propio del Grupo',              false),
  ('notificaciones_push',    'Push al conductor para nuevos traslados y resoluciones', false);
-- seguro_demanda activo_global = false: en espera de producto (AGENTS.md).
-- seguro_mecanu_mensual no estaba en el seed de PLANES.md; se añade porque
-- SEGUROS.md lo usa como fuente de verdad del mensual. Revisar.

commit;
