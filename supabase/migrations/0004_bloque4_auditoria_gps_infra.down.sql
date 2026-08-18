-- Reversa del bloque 4.
-- Quita jobs de pg_cron (si existen), funciones de purga, políticas y tablas
-- de auditoría / GPS / idempotencia.
-- Ejecutar PRIMERO si se revierte la pila 4→1.
-- NO APLICA: archivo para revisión.

begin;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('mecanu-purgar-idempotency-keys');
    perform cron.unschedule('mecanu-purgar-conductor-locations');
  end if;
exception
  when others then
    -- El job puede no existir si pg_cron no estaba al aplicar.
    null;
end;
$$;

drop trigger if exists trg_audit_events_inmutable on public.audit_events;
drop function if exists private.reject_audit_mutation();
drop function if exists private.purgar_idempotency_keys();
drop function if exists private.purgar_conductor_locations();

drop policy if exists idempotency_keys_insert on public.idempotency_keys;
drop policy if exists idempotency_keys_select on public.idempotency_keys;
drop policy if exists conductor_locations_insert on public.conductor_locations;
drop policy if exists conductor_locations_select on public.conductor_locations;
drop policy if exists audit_events_select on public.audit_events;
drop policy if exists audit_events_insert on public.audit_events;

drop table if exists public.idempotency_keys;
drop table if exists public.conductor_locations;
drop table if exists public.audit_events;

commit;
