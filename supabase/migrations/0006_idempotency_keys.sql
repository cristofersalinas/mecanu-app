-- Idempotencia para escrituras offline-first (conductor).
-- TTL ~48h: limpiar con cron cuando exista.

create table if not exists public.idempotency_keys (
  key text primary key,
  status int not null,
  response jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idempotency_keys_created_idx
  on public.idempotency_keys (created_at);

alter table public.idempotency_keys enable row level security;

-- Solo service_role escribe/lee (bypasea RLS). Cero policies para anon/authenticated.

comment on table public.idempotency_keys is
  'Respuestas cacheadas por Idempotency-Key. Purgar filas > 48h.';

create or replace function public.idempotency_keys_purge(older_than interval default interval '48 hours')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  borradas integer;
begin
  delete from public.idempotency_keys
  where created_at < now() - older_than;
  get diagnostics borradas = row_count;
  return borradas;
end;
$$;

revoke all on function public.idempotency_keys_purge(interval) from public;
grant execute on function public.idempotency_keys_purge(interval) to service_role;
