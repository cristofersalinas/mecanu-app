-- GPS en vivo: coords de paradas, posición actual del traslado y trail append-only.
-- Lectura pública del cliente: solo vía API server filtrada por link_token (sin grant anon).

alter table public.paradas
  add column if not exists lat numeric(9, 6),
  add column if not exists lng numeric(9, 6);

comment on column public.paradas.lat is
  'Latitud WGS84 de la parada (geocodificada). Nullable si aún no se geocodificó.';
comment on column public.paradas.lng is
  'Longitud WGS84 de la parada (geocodificada). Nullable si aún no se geocodificó.';

alter table public.traslados
  add column if not exists pos_lat numeric(9, 6),
  add column if not exists pos_lng numeric(9, 6),
  add column if not exists pos_precision_m numeric,
  add column if not exists pos_actualizada_en timestamptz;

comment on column public.traslados.pos_lat is
  'Última latitud reportada por el conductor en este tramo.';
comment on column public.traslados.pos_lng is
  'Última longitud reportada por el conductor en este tramo.';
comment on column public.traslados.pos_precision_m is
  'Precisión del fix GPS en metros (accuracy del navegador).';
comment on column public.traslados.pos_actualizada_en is
  'Cuándo se recibió el último ping GPS de este tramo.';

create table if not exists public.traslado_ubicaciones (
  id uuid primary key default gen_random_uuid(),
  traslado_id text not null references public.traslados (id) on delete cascade,
  conductor_id text references public.conductores (id),
  ruta_id text not null references public.rutas (id) on delete cascade,
  lat numeric(9, 6) not null,
  lng numeric(9, 6) not null,
  precision_m numeric,
  heading numeric,
  speed_mps numeric,
  ts timestamptz not null,
  recibido_en timestamptz not null default now(),
  fuente text not null default 'conductor'
    check (fuente in ('conductor', 'api', 'cron'))
);

create index if not exists traslado_ubicaciones_traslado_ts_idx
  on public.traslado_ubicaciones (traslado_id, ts desc);

create index if not exists traslado_ubicaciones_ruta_ts_idx
  on public.traslado_ubicaciones (ruta_id, ts desc);

comment on table public.traslado_ubicaciones is
  'Trail GPS append-only del conductor durante un traslado. La posición actual vive en traslados.pos_*.';

alter table public.traslado_ubicaciones enable row level security;

-- Token de seguimiento único cuando existe (evita colisiones en /s/{token}).
create unique index if not exists rutas_link_token_uidx
  on public.rutas (link_token)
  where link_token is not null;

-- RLS: mismo patrón que logs/traslados (vía ruta → taller). Sin grant a anon.
create policy traslado_ubicaciones_via_ruta on public.traslado_ubicaciones
  for all to authenticated
  using (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.rutas r
      where r.id = traslado_ubicaciones.ruta_id
        and r.taller_id = public.jwt_taller_id()
    )
  )
  with check (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.rutas r
      where r.id = traslado_ubicaciones.ruta_id
        and r.taller_id = public.jwt_taller_id()
    )
  );

grant select, insert, update, delete on public.traslado_ubicaciones to authenticated;
