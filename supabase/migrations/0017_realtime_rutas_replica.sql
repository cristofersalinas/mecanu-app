-- Realtime: el UPDATE de una ruta tiene que llevar estado/subestado en el WAL.
-- Con replica identity default el `old` solo trae la PK y el panel no ve el cambio
-- (o el filtro por columnas falla). Idempotente si 0016 ya añadió la tabla.

alter table public.rutas replica identity full;

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
