-- Reversa del bloque 2.
-- Quita tablas de negocio y helpers añadidos, en orden inverso a las FKs.
-- No toca el schema private ni las funciones del bloque 1.
-- Debe ejecutarse ANTES de 0001_*.down.sql si se revierte la pila entera.
-- NO APLICA: archivo para revisión.

begin;

drop policy if exists solicitudes_update on public.solicitudes;
drop policy if exists solicitudes_insert on public.solicitudes;
drop policy if exists solicitudes_select on public.solicitudes;
drop policy if exists campana_items_write on public.campana_items;
drop policy if exists campana_items_select on public.campana_items;
drop policy if exists campanas_write on public.campanas;
drop policy if exists campanas_select on public.campanas;
drop policy if exists presupuesto_lineas_write on public.presupuesto_lineas;
drop policy if exists presupuesto_lineas_select on public.presupuesto_lineas;
drop policy if exists presupuestos_write on public.presupuestos;
drop policy if exists presupuestos_select on public.presupuestos;
drop policy if exists inspeccion_hallazgos_insert on public.inspeccion_hallazgos;
drop policy if exists inspeccion_hallazgos_select on public.inspeccion_hallazgos;
drop policy if exists inspeccion_danos_insert on public.inspeccion_danos;
drop policy if exists inspeccion_danos_select on public.inspeccion_danos;
drop policy if exists inspecciones_insert on public.inspecciones;
drop policy if exists inspecciones_select on public.inspecciones;
drop policy if exists logs_insert on public.logs;
drop policy if exists logs_select on public.logs;
drop policy if exists traslados_update on public.traslados;
drop policy if exists traslados_insert on public.traslados;
drop policy if exists traslados_select on public.traslados;
drop policy if exists paradas_write on public.paradas;
drop policy if exists paradas_select on public.paradas;
drop policy if exists rutas_update on public.rutas;
drop policy if exists rutas_insert on public.rutas;
drop policy if exists rutas_select on public.rutas;
drop policy if exists conductores_update on public.conductores;
drop policy if exists conductores_insert on public.conductores;
drop policy if exists conductores_select on public.conductores;
drop policy if exists servicios_write on public.servicios;
drop policy if exists servicios_select on public.servicios;
drop policy if exists vehiculo_clientes_write on public.vehiculo_clientes;
drop policy if exists vehiculo_clientes_select on public.vehiculo_clientes;
drop policy if exists vehiculos_update on public.vehiculos;
drop policy if exists vehiculos_insert on public.vehiculos;
drop policy if exists vehiculos_select on public.vehiculos;
drop policy if exists clientes_update on public.clientes;
drop policy if exists clientes_insert on public.clientes;
drop policy if exists clientes_select on public.clientes;

alter table if exists public.rutas drop constraint if exists rutas_presupuesto_id_fkey;
alter table if exists public.presupuestos drop constraint if exists presupuestos_campana_id_fkey;

drop table if exists public.solicitudes;
drop table if exists public.campana_items;
drop table if exists public.campanas;
drop table if exists public.presupuesto_lineas;
drop table if exists public.presupuestos;
drop table if exists public.inspeccion_hallazgos;
drop table if exists public.inspeccion_danos;
drop table if exists public.inspecciones;
drop table if exists public.logs;
drop table if exists public.traslados;
drop table if exists public.paradas;
drop table if exists public.rutas;
drop table if exists public.conductores;
drop table if exists public.servicios;
drop table if exists public.vehiculo_clientes;
drop table if exists public.vehiculos;
drop table if exists public.clientes;

drop function if exists private.puede_escribir_ruta(text);
drop function if exists private.puede_ver_ruta(text);
drop function if exists private.conductor_id();

commit;
