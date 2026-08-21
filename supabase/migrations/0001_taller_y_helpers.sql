-- Bloque 1: taller (tenant) + helpers.
-- Aplicar solo en mecanu-dev. Un taller = un tenant (PREGUNTAS-ABIERTAS / plan).

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.talleres (
  id text primary key,
  nombre text not null,
  direccion text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists talleres_set_updated_at on public.talleres;
create trigger talleres_set_updated_at
  before update on public.talleres
  for each row execute function public.set_updated_at();

alter table public.talleres enable row level security;

insert into public.talleres (id, nombre, direccion)
values (
  'taller-rodriguez',
  'Talleres Rodríguez',
  'Calle de Embajadores 178, 28045 Madrid'
)
on conflict (id) do nothing;

comment on table public.talleres is
  'Tenant. Toda fila de negocio lleva taller_id apuntando aquí.';
