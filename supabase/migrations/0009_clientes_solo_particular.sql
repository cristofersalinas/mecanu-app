-- Clientes del taller: solo personas (Particular). Sin tipo Empresa.
update public.clientes set tipo = 'Particular' where tipo = 'Empresa';

do $$
declare
  cname text;
begin
  select con.conname into cname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'clientes'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%tipo%';
  if cname is not null then
    execute format('alter table public.clientes drop constraint %I', cname);
  end if;
end $$;

alter table public.clientes
  add constraint clientes_tipo_check check (tipo = 'Particular');
