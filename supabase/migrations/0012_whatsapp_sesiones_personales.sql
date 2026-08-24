-- WhatsApp personal (sesión web): hasta 5 sesiones por taller + bandeja propia.
-- No es Cloud API / Kapso. Sync no oficial del protocolo Web = fuera de alcance.

create table if not exists public.whatsapp_sesiones (
  id text primary key,
  taller_id text not null references public.talleres (id),
  etiqueta text not null,
  estado text not null check (estado in ('pendiente', 'activa', 'desconectada')),
  creada_en timestamptz not null default now(),
  ultima_actividad timestamptz not null default now()
);

create index if not exists whatsapp_sesiones_taller_idx
  on public.whatsapp_sesiones (taller_id, estado);

create or replace function public.whatsapp_sesiones_tope_5()
returns trigger
language plpgsql
as $$
declare
  n int;
begin
  if tg_op = 'UPDATE' and new.estado = 'desconectada' then
    return new;
  end if;
  if new.estado = 'desconectada' then
    return new;
  end if;
  select count(*) into n
  from public.whatsapp_sesiones
  where taller_id = new.taller_id
    and estado in ('pendiente', 'activa')
    and (tg_op = 'INSERT' or id <> new.id);
  if n >= 5 then
    raise exception 'Máximo 5 sesiones de WhatsApp por taller';
  end if;
  return new;
end;
$$;

drop trigger if exists whatsapp_sesiones_tope_5_trg on public.whatsapp_sesiones;
create trigger whatsapp_sesiones_tope_5_trg
  before insert or update of estado on public.whatsapp_sesiones
  for each row execute function public.whatsapp_sesiones_tope_5();

alter table public.whatsapp_sesiones enable row level security;

drop policy if exists whatsapp_sesiones_select_tenant on public.whatsapp_sesiones;
drop policy if exists whatsapp_sesiones_write_tenant on public.whatsapp_sesiones;

create policy whatsapp_sesiones_select_tenant on public.whatsapp_sesiones
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy whatsapp_sesiones_write_tenant on public.whatsapp_sesiones
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create table if not exists public.whatsapp_conversaciones (
  id text primary key,
  taller_id text not null references public.talleres (id),
  sesion_id text references public.whatsapp_sesiones (id) on delete set null,
  cliente_id text references public.clientes (id) on delete set null,
  nombre text not null,
  telefono text not null,
  actualizado_en timestamptz not null default now()
);

create index if not exists whatsapp_conversaciones_taller_idx
  on public.whatsapp_conversaciones (taller_id, actualizado_en desc);

alter table public.whatsapp_conversaciones enable row level security;

drop policy if exists whatsapp_conversaciones_select_tenant on public.whatsapp_conversaciones;
drop policy if exists whatsapp_conversaciones_write_tenant on public.whatsapp_conversaciones;

create policy whatsapp_conversaciones_select_tenant on public.whatsapp_conversaciones
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy whatsapp_conversaciones_write_tenant on public.whatsapp_conversaciones
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create table if not exists public.whatsapp_mensajes (
  id text primary key,
  conversacion_id text not null references public.whatsapp_conversaciones (id) on delete cascade,
  direccion text not null check (direccion in ('salida', 'entrada')),
  texto text not null,
  ts timestamptz not null default now()
);

create index if not exists whatsapp_mensajes_conv_ts_idx
  on public.whatsapp_mensajes (conversacion_id, ts);

alter table public.whatsapp_mensajes enable row level security;

drop policy if exists whatsapp_mensajes_via_conv on public.whatsapp_mensajes;

create policy whatsapp_mensajes_via_conv on public.whatsapp_mensajes
  for all to authenticated
  using (
    exists (
      select 1 from public.whatsapp_conversaciones c
      where c.id = conversacion_id
        and (public.es_dueno_o_ops() or c.taller_id = public.jwt_taller_id())
    )
  )
  with check (
    exists (
      select 1 from public.whatsapp_conversaciones c
      where c.id = conversacion_id
        and (public.es_dueno_o_ops() or c.taller_id = public.jwt_taller_id())
    )
  );

comment on table public.whatsapp_sesiones is
  'Sesiones WhatsApp personal (web). Máx 5 activas/pendientes por taller. No Kapso.';
