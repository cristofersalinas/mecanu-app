-- Ciclo de vida del cliente (etiquetas WhatsApp + CRM).
-- Calculado en app a partir de órdenes completadas + recencia; se persiste para filtrar.

alter table public.clientes
  add column if not exists ciclo_vida text;

alter table public.clientes
  drop constraint if exists clientes_ciclo_vida_check;

alter table public.clientes
  add constraint clientes_ciclo_vida_check
  check (
    ciclo_vida is null
    or ciclo_vida in (
      'prospecto',
      'registrado',
      'nuevo',
      'recompra',
      'fidelizado',
      'en_riesgo',
      'perdido'
    )
  );

create index if not exists clientes_ciclo_vida_idx
  on public.clientes (taller_id, ciclo_vida);

comment on column public.clientes.ciclo_vida is
  'Ciclo de vida comercial: prospecto|registrado|nuevo|recompra|fidelizado|en_riesgo|perdido. Reglas en src/lib/mecanu/cliente-ciclo-vida.ts.';
