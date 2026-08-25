-- Realtime del panel: el kanban se entera cuando cambia una ruta (p. ej. conductor
-- pasa agendado → en_ruta). RLS de `rutas` sigue filtrando por jwt_taller_id().
-- Idempotente: reaplicar no falla si la tabla ya está en la publication.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rutas'
  ) then
    execute 'alter publication supabase_realtime add table public.rutas';
  end if;
end $$;
