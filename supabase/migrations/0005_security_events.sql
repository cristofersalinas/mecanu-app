-- Eventos de seguridad. NO APLICAR hasta que el bloque 1 de acceso esté
-- testeado en mecanu-dev. Esta migración existe para no improvisar el schema
-- el día que haga falta consultar 90 días de señuelos.
--
-- Numerada 0005 para no chocar con 0001–0004 del trabajo de datos, que aún
-- no está en esta rama.
--
-- RLS encendido, cero políticas para anon/authenticated: nadie del cliente
-- lee esto. Escribe el backend con service_role (bypasea RLS). No se hace
-- FORCE RLS para no cegar al service_role.

create table if not exists security_events (
  id bigint generated always as identity primary key,
  tipo text not null
    check (tipo in (
      'honeypot_hit',
      'fake_login',
      'canary_used',
      'rate_limited',
      'assistant_prompt',
      'assistant_injection',
      'sondeo_sistematico'
    )),
  ts timestamptz not null default now(),
  ip text not null,
  pais text,
  region text,
  ciudad text,
  user_agent text,
  metodo text not null,
  ruta text not null,
  tecnica text
    check (tecnica is null or tecnica in (
      'system_prompt',
      'credenciales',
      'ejecucion',
      'exfiltracion',
      'jailbreak',
      'ninguna'
    )),
  resumen text not null default '',
  extra jsonb not null default '{}'::jsonb
);

create index security_events_ts_idx on security_events (ts desc);
create index security_events_tipo_ts_idx on security_events (tipo, ts desc);
create index security_events_ip_ts_idx on security_events (ip, ts desc);

comment on table security_events is
  'Registro de señuelos y abuso. Base legal: interés legítimo de seguridad. Retención 90 días.';

alter table security_events enable row level security;

create or replace function security_events_purge()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  borradas integer;
begin
  delete from security_events
  where ts < now() - interval '90 days';
  get diagnostics borradas = row_count;
  return borradas;
end;
$$;

comment on function security_events_purge() is
  'Borra eventos de más de 90 días. Llamar a diario desde un cron cuando este schema esté aplicado.';
