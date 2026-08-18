-- Reversa del bloque 3.
-- Quita trigger de reversión, vista, tablas de planes/cuotas/seguros y
-- private.es_grupo_admin_de. Orden inverso a las FKs.
-- Ejecutar ANTES de 0002_*.down.sql.
-- NO APLICA: archivo para revisión.

begin;

drop trigger if exists trg_revertir_contador_traslados_creados on public.rutas;
drop function if exists private.revertir_contador_traslados_creados();

drop view if exists public.seguros_externos_vigente;

drop policy if exists whatsapp_config_write on public.whatsapp_config;
drop policy if exists whatsapp_config_select on public.whatsapp_config;
drop policy if exists seguros_externos_write on public.seguros_externos;
drop policy if exists seguros_externos_select on public.seguros_externos;
drop policy if exists org_feature_switches_write on public.org_feature_switches;
drop policy if exists org_feature_switches_select on public.org_feature_switches;
drop policy if exists feature_switches_catalog_write on public.feature_switches_catalog;
drop policy if exists feature_switches_catalog_select on public.feature_switches_catalog;
drop policy if exists usage_overages_write on public.usage_overages;
drop policy if exists usage_overages_select on public.usage_overages;
drop policy if exists usage_counters_write on public.usage_counters;
drop policy if exists usage_counters_select on public.usage_counters;
drop policy if exists org_plan_update on public.org_plan;
drop policy if exists org_plan_insert on public.org_plan;
drop policy if exists org_plan_select on public.org_plan;
drop policy if exists plan_precios_flota_write on public.plan_precios_flota;
drop policy if exists plan_precios_flota_select on public.plan_precios_flota;
drop policy if exists plan_precios_overage_write on public.plan_precios_overage;
drop policy if exists plan_precios_overage_select on public.plan_precios_overage;
drop policy if exists plan_limites_write on public.plan_limites;
drop policy if exists plan_limites_select on public.plan_limites;
drop policy if exists planes_config_write on public.planes_config;
drop policy if exists planes_config_select on public.planes_config;

drop table if exists public.whatsapp_config;
drop table if exists public.seguros_externos;
drop table if exists public.org_feature_switches;
drop table if exists public.feature_switches_catalog;
drop table if exists public.usage_overages;
drop table if exists public.usage_counters;
drop table if exists public.org_plan;
drop table if exists public.plan_precios_flota;
drop table if exists public.plan_precios_overage;
drop table if exists public.plan_limites;
drop table if exists public.planes_config;

drop function if exists private.es_grupo_admin_de(uuid);

commit;
