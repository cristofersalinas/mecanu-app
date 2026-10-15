-- Auditoría de cambios + vistas planas para análisis.
-- No cambia el modelo de negocio (rutas / traslados / presupuestos siguen igual).
--
-- Cifrado de columnas (pgcrypto): NO. Rompe búsqueda, joins y SQL de analista.
-- Disco y tránsito ya van cifrados en Supabase. PII se enmascara en las vistas.
-- Diccionario: docs/DICCIONARIO-DATOS.md

create schema if not exists interno;
revoke all on schema interno from public, anon, authenticated;

-- Máscaras RGPD (misma idea que maskTel / maskDireccion en mecanu-data.ts).
create or replace function public.mascarar_telefono(t text)
returns text
language sql
immutable
as $$
  select case
    when t is null or length(trim(t)) = 0 then '—'
    else left(trim(t), 3) || ' ••• •••'
  end;
$$;

create or replace function public.mascarar_email(t text)
returns text
language sql
immutable
as $$
  select case
    when t is null or position('@' in t) < 2 then '—'
    else left(t, 1) || '***' || substring(t from position('@' in t))
  end;
$$;

create or replace function public.mascarar_direccion(dir text)
returns text
language sql
immutable
as $$
  select case
    when dir is null or length(trim(dir)) = 0 then '—'
    else
      trim(regexp_replace(split_part(dir, ',', 1), '\s+\d+.*$', ''))
      || coalesce(' · ' || (regexp_match(dir, '\m\d{5}\M'))[1], '')
  end;
$$;

create or replace function public.mascarar_documento(d text)
returns text
language sql
immutable
as $$
  select case
    when d is null or length(trim(d)) = 0 then '—'
    when length(trim(d)) <= 4 then '••••'
    else repeat('•', length(trim(d)) - 4) || right(trim(d), 4)
  end;
$$;

comment on function public.mascarar_telefono(text) is
  'RGPD: 633 ••• •••. Para listados y vistas BI, no para la ficha operativa.';
comment on function public.mascarar_email(text) is
  'RGPD: a***@dominio.';
comment on function public.mascarar_direccion(text) is
  'RGPD: calle sin número + CP, como en listados del panel.';
comment on function public.mascarar_documento(text) is
  'RGPD: DNI/NIE con solo los 4 últimos visibles.';

revoke all on function public.mascarar_telefono(text) from public;
revoke all on function public.mascarar_email(text) from public;
revoke all on function public.mascarar_direccion(text) from public;
revoke all on function public.mascarar_documento(text) from public;
grant execute on function public.mascarar_telefono(text) to authenticated;
grant execute on function public.mascarar_email(text) to authenticated;
grant execute on function public.mascarar_direccion(text) to authenticated;
grant execute on function public.mascarar_documento(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Auditoría: quién cambió PII o dinero. Los movimientos de ruta siguen en logs.
-- ---------------------------------------------------------------------------

create table if not exists public.auditoria (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  tabla text not null,
  fila_id text not null,
  accion text not null check (accion in ('INSERT', 'UPDATE', 'DELETE')),
  actor_id uuid,
  taller_id text,
  antes jsonb,
  despues jsonb
);

create index if not exists auditoria_ts_idx on public.auditoria (ts desc);
create index if not exists auditoria_tabla_fila_idx on public.auditoria (tabla, fila_id, ts desc);
create index if not exists auditoria_taller_idx on public.auditoria (taller_id, ts desc)
  where taller_id is not null;

alter table public.auditoria enable row level security;

comment on table public.auditoria is
  'Quién cambió qué en clientes, coches, presupuestos y perfiles. No es el timeline de un viaje (eso es logs). Solo lectura para dueño/ops.';
comment on column public.auditoria.id is
  'Identidad autoincremental.';
comment on column public.auditoria.ts is
  'Cuándo.';
comment on column public.auditoria.tabla is
  'Tabla tocada (clientes, vehiculos, presupuestos…).';
comment on column public.auditoria.fila_id is
  'id de la fila, o vehiculo_id/cliente_id en vehiculo_clientes.';
comment on column public.auditoria.accion is
  'INSERT, UPDATE o DELETE.';
comment on column public.auditoria.actor_id is
  'auth.uid() de quien hizo el cambio. Null si fue service_role o un job.';
comment on column public.auditoria.taller_id is
  'Taller de la fila, para filtrar.';
comment on column public.auditoria.antes is
  'Fila completa antes. Null en INSERT.';
comment on column public.auditoria.despues is
  'Fila completa después. Null en DELETE.';

drop policy if exists auditoria_select_dueno on public.auditoria;
create policy auditoria_select_dueno on public.auditoria
  for select to authenticated
  using (public.es_dueno_o_ops());

grant select on public.auditoria to authenticated;

create or replace function interno.auditar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text;
  v_taller text;
  v_antes jsonb;
  v_despues jsonb;
begin
  if tg_op = 'DELETE' then
    v_antes := to_jsonb(old);
    v_despues := null;
    if tg_table_name = 'vehiculo_clientes' then
      v_id := old.vehiculo_id || '/' || old.cliente_id;
      select v.taller_id into v_taller from public.vehiculos v where v.id = old.vehiculo_id;
    elsif tg_table_name = 'presupuesto_lineas' then
      v_id := old.id::text;
      select p.taller_id into v_taller from public.presupuestos p where p.id = old.presupuesto_id;
    else
      v_id := old.id::text;
      v_taller := to_jsonb(old) ->> 'taller_id';
    end if;
  else
    v_antes := case when tg_op = 'UPDATE' then to_jsonb(old) else null end;
    v_despues := to_jsonb(new);
    if tg_table_name = 'vehiculo_clientes' then
      v_id := new.vehiculo_id || '/' || new.cliente_id;
      select v.taller_id into v_taller from public.vehiculos v where v.id = new.vehiculo_id;
    elsif tg_table_name = 'presupuesto_lineas' then
      v_id := new.id::text;
      select p.taller_id into v_taller from public.presupuestos p where p.id = new.presupuesto_id;
    else
      v_id := new.id::text;
      v_taller := to_jsonb(new) ->> 'taller_id';
    end if;
  end if;

  insert into public.auditoria (tabla, fila_id, accion, actor_id, taller_id, antes, despues)
  values (tg_table_name, v_id, tg_op, auth.uid(), v_taller, v_antes, v_despues);

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function interno.auditar() from public, anon, authenticated;
comment on function interno.auditar() is
  'Trigger interno. Escribe en auditoria. No llamar desde la API.';

drop trigger if exists clientes_auditoria on public.clientes;
create trigger clientes_auditoria
  after insert or update or delete on public.clientes
  for each row execute function interno.auditar();

drop trigger if exists vehiculos_auditoria on public.vehiculos;
create trigger vehiculos_auditoria
  after insert or update or delete on public.vehiculos
  for each row execute function interno.auditar();

drop trigger if exists vehiculo_clientes_auditoria on public.vehiculo_clientes;
create trigger vehiculo_clientes_auditoria
  after insert or update or delete on public.vehiculo_clientes
  for each row execute function interno.auditar();

drop trigger if exists presupuestos_auditoria on public.presupuestos;
create trigger presupuestos_auditoria
  after insert or update or delete on public.presupuestos
  for each row execute function interno.auditar();

drop trigger if exists presupuesto_lineas_auditoria on public.presupuesto_lineas;
create trigger presupuesto_lineas_auditoria
  after insert or update or delete on public.presupuesto_lineas
  for each row execute function interno.auditar();

drop trigger if exists perfiles_auditoria on public.perfiles;
create trigger perfiles_auditoria
  after insert or update or delete on public.perfiles
  for each row execute function interno.auditar();

-- ---------------------------------------------------------------------------
-- Vistas BI (security_invoker = respeta RLS de las tablas).
-- Un SELECT, sin joins a mano. El analista consulta vista_*.
-- ---------------------------------------------------------------------------

create or replace view public.vista_rutas
with (security_invoker = true) as
with tramo_activo as (
  select distinct on (t.ruta_id)
    t.ruta_id,
    t.id as tramo_id,
    t.rol,
    t.estado as tramo_estado,
    t.subestado as tramo_subestado,
    t.conductor_id,
    t.ventana_fecha,
    t.ventana_inicio,
    t.ventana_fin,
    t.propuesta_fecha,
    t.propuesta_inicio,
    t.propuesta_fin,
    t.ventana_modo,
    t.cliente_confirmo,
    t.parada_origen_id,
    t.parada_destino_id
  from public.traslados t
  order by
    t.ruta_id,
    case
      when t.estado = 'en_curso' then 0
      when t.estado in ('agendado', 'sin_agenda') then 1
      else 2
    end,
    case
      when t.estado in ('en_curso', 'agendado', 'sin_agenda') then t.orden
      else -t.orden
    end
)
select
  r.id,
  r.taller_id,
  r.estado,
  r.subestado,
  r.creada_en,
  r.motivo as motivo_cancelacion,
  r.cancelada_en,
  c.nombre as cliente,
  public.mascarar_telefono(c.telefono) as cliente_telefono,
  public.mascarar_email(c.email) as cliente_email,
  public.mascarar_direccion(c.direccion) as cliente_direccion,
  v.matricula,
  v.marca,
  v.modelo,
  v.anio as vehiculo_anio,
  v.km as vehiculo_km,
  d.nombre as conductor,
  d.red as conductor_red,
  ta.tramo_id,
  ta.rol as tramo_rol,
  ta.tramo_estado,
  ta.tramo_subestado,
  ta.ventana_fecha,
  ta.ventana_inicio,
  ta.ventana_fin,
  ta.propuesta_fecha,
  ta.ventana_modo,
  ta.cliente_confirmo,
  po.tipo as origen_tipo,
  po.subtipo as origen_subtipo,
  po.direccion as origen_direccion,
  pd.tipo as destino_tipo,
  pd.subtipo as destino_subtipo,
  pd.direccion as destino_direccion,
  p.total as presupuesto_total,
  p.estado as presupuesto_estado,
  p.modo as presupuesto_modo,
  p.iva_incluido,
  coalesce((
    select bool_and(t.seguro) from public.traslados t where t.ruta_id = r.id
  ), false) as seguro_todos_los_tramos,
  coalesce((
    select max(t.reprogramaciones) from public.traslados t where t.ruta_id = r.id
  ), 0) as reprogramaciones,
  (
    select string_agg(ps.descripcion, ' · ' order by par.orden)
    from public.paradas par
    join public.parada_servicios ps on ps.parada_id = par.id
    where par.ruta_id = r.id
  ) as descripcion_servicio,
  r.campana_origen_id,
  r.presupuesto_id
from public.rutas r
left join public.clientes c on c.id = r.cliente_id
left join public.vehiculos v on v.id = r.vehiculo_id
left join public.presupuestos p on p.id = r.presupuesto_id
left join tramo_activo ta on ta.ruta_id = r.id
left join public.conductores d on d.id = ta.conductor_id
left join lateral (
  select par.*
  from public.paradas par
  where par.ruta_id = r.id
  order by
    case when ta.parada_origen_id is not null and par.id = ta.parada_origen_id then 0 else 1 end,
    par.orden
  limit 1
) po on true
left join lateral (
  select par.*
  from public.paradas par
  where par.ruta_id = r.id
  order by
    case when ta.parada_destino_id is not null and par.id = ta.parada_destino_id then 0 else 1 end,
    par.orden desc
  limit 1
) pd on true;

comment on view public.vista_rutas is
  'Una fila por orden (ruta), lista para SQL de analista. PII de cliente enmascarada. Equivale a vistaRuta() del panel.';

create or replace view public.vista_presupuestos
with (security_invoker = true) as
select
  p.id,
  p.taller_id,
  p.estado,
  p.modo,
  p.total,
  p.iva_incluido,
  p.created_at,
  p.updated_at,
  p.campana_id,
  ca.falla as campana_falla,
  ca.urgente as campana_urgente,
  ca.origen_automatico,
  c.nombre as cliente,
  public.mascarar_telefono(c.telefono) as cliente_telefono,
  v.matricula,
  v.marca,
  v.modelo,
  p.ruta_origen_id,
  p.ruta_generada_id,
  (
    select count(*)::int from public.presupuesto_lineas l where l.presupuesto_id = p.id
  ) as lineas,
  (
    select coalesce(sum(l.importe), 0) from public.presupuesto_lineas l
    where l.presupuesto_id = p.id and l.origen = 'traslado'
  ) as total_traslado,
  (
    select coalesce(sum(l.importe), 0) from public.presupuesto_lineas l
    where l.presupuesto_id = p.id and l.origen <> 'traslado'
  ) as total_reparacion
from public.presupuestos p
left join public.campanas ca on ca.id = p.campana_id
left join public.clientes c on c.id = ca.cliente_id
left join public.vehiculos v on v.id = coalesce(p.vehiculo_id, ca.vehiculo_id);

comment on view public.vista_presupuestos is
  'Una fila por presupuesto: estado, total, cliente, matrícula, desglose traslado vs reparación. El total sigue siendo uno solo; el desglose es para análisis.';

create or replace view public.vista_campanas
with (security_invoker = true) as
select
  ca.id,
  ca.taller_id,
  ca.falla,
  ca.urgente,
  ca.fecha as fecha_recomendada,
  ca.origen_automatico,
  ca.created_at,
  c.nombre as cliente,
  v.matricula,
  v.marca,
  v.modelo,
  p.id as presupuesto_id,
  p.estado as presupuesto_estado,
  p.total as presupuesto_total,
  ca.ruta_origen_id,
  ca.ruta_generada_id,
  ca.inspeccion_id,
  (
    select count(*)::int from public.campana_items i where i.campana_id = ca.id
  ) as items,
  (
    select count(*)::int from public.campana_items i
    where i.campana_id = ca.id and i.origen = 'confirmado'
  ) as items_confirmados
from public.campanas ca
left join public.clientes c on c.id = ca.cliente_id
left join public.vehiculos v on v.id = ca.vehiculo_id
left join public.presupuestos p on p.campana_id = ca.id;

comment on view public.vista_campanas is
  'Una fila por campaña de upsell, con estado del presupuesto y matrícula. Sin joins a mano.';

create or replace view public.vista_clientes
with (security_invoker = true) as
select
  c.id,
  c.taller_id,
  c.nombre,
  c.tipo,
  c.desde,
  public.mascarar_telefono(c.telefono) as telefono,
  public.mascarar_email(c.email) as email,
  public.mascarar_direccion(c.direccion) as direccion,
  public.mascarar_documento(c.documento) as documento,
  (
    select count(*)::int from public.vehiculo_clientes vc where vc.cliente_id = c.id
  ) as vehiculos,
  (
    select count(*)::int from public.rutas r where r.cliente_id = c.id
  ) as rutas
from public.clientes c;

comment on view public.vista_clientes is
  'Clientes con teléfono, email, dirección y documento enmascarados. Para recuentos y listados, no para llamar al cliente.';

grant select on public.vista_rutas to authenticated;
grant select on public.vista_presupuestos to authenticated;
grant select on public.vista_campanas to authenticated;
grant select on public.vista_clientes to authenticated;
