-- Última ubicación del conductor (Find My / compartir ubicación).
-- Se actualiza al abrir la app o al ping GPS de un traslado.

alter table public.conductores
  add column if not exists pos_lat numeric(9, 6),
  add column if not exists pos_lng numeric(9, 6),
  add column if not exists pos_precision_m numeric,
  add column if not exists pos_actualizada_en timestamptz;

comment on column public.conductores.pos_lat is
  'Última latitud conocida del conductor (app abierta o ping en ruta).';
comment on column public.conductores.pos_lng is
  'Última longitud conocida del conductor.';
comment on column public.conductores.pos_precision_m is
  'Precisión del último fix GPS en metros.';
comment on column public.conductores.pos_actualizada_en is
  'Cuándo se vio por última vez la ubicación del conductor.';
