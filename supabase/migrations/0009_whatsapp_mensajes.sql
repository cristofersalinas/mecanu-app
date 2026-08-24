-- Conversaciones WhatsApp de campañas (Kapso / Cloud API).

create table if not exists public.whatsapp_canales (
  campana_id text primary key references public.campanas (id) on delete cascade,
  taller_id text not null references public.talleres (id),
  telefono_e164 text not null,
  opt_in text not null default 'IN' check (opt_in in ('IN', 'OUT')),
  ultima_entrada_cliente timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists whatsapp_canales_telefono_idx on public.whatsapp_canales (telefono_e164);
create index if not exists whatsapp_canales_taller_idx on public.whatsapp_canales (taller_id);

drop trigger if exists whatsapp_canales_set_updated_at on public.whatsapp_canales;
create trigger whatsapp_canales_set_updated_at
  before update on public.whatsapp_canales
  for each row execute function public.set_updated_at();

alter table public.whatsapp_canales enable row level security;

create table if not exists public.whatsapp_mensajes (
  id text primary key,
  campana_id text not null references public.campanas (id) on delete cascade,
  taller_id text not null references public.talleres (id),
  dir text not null check (dir in ('in', 'out', 'sistema')),
  tipo text not null,
  texto text,
  estado text check (
    estado is null or estado in ('pending', 'sent', 'delivered', 'read', 'failed')
  ),
  error_code int,
  ts timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_mensajes_campana_ts_idx on public.whatsapp_mensajes (campana_id, ts desc);
create index if not exists whatsapp_mensajes_taller_idx on public.whatsapp_mensajes (taller_id);

alter table public.whatsapp_mensajes enable row level security;

-- RLS: mismo patrón que campañas (taller_id).
drop policy if exists whatsapp_canales_select_tenant on public.whatsapp_canales;
drop policy if exists whatsapp_canales_write_tenant on public.whatsapp_canales;
drop policy if exists whatsapp_mensajes_select_tenant on public.whatsapp_mensajes;
drop policy if exists whatsapp_mensajes_write_tenant on public.whatsapp_mensajes;

create policy whatsapp_canales_select_tenant on public.whatsapp_canales
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy whatsapp_canales_write_tenant on public.whatsapp_canales
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy whatsapp_mensajes_select_tenant on public.whatsapp_mensajes
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy whatsapp_mensajes_write_tenant on public.whatsapp_mensajes
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());
