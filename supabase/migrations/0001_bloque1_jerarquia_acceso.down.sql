-- Reversa del bloque 1.
-- Elimina políticas, triggers, tablas y funciones de jerarquía/acceso,
-- en orden inverso a 0001_bloque1_jerarquia_acceso.sql, respetando FKs.
-- NO APLICA: archivo para revisión.

begin;

drop trigger if exists trg_auth_user_created on auth.users;

drop policy if exists user_sucursal_access_delete on public.user_sucursal_access;
drop policy if exists user_sucursal_access_update on public.user_sucursal_access;
drop policy if exists user_sucursal_access_insert on public.user_sucursal_access;
drop policy if exists user_sucursal_access_select on public.user_sucursal_access;

drop policy if exists user_org_roles_update on public.user_org_roles;
drop policy if exists user_org_roles_insert on public.user_org_roles;
drop policy if exists user_org_roles_select on public.user_org_roles;

drop policy if exists usuarios_update on public.usuarios;
drop policy if exists usuarios_select on public.usuarios;

drop policy if exists sucursales_update on public.sucursales;
drop policy if exists sucursales_insert on public.sucursales;
drop policy if exists sucursales_select on public.sucursales;

drop policy if exists grupos_update on public.grupos;
drop policy if exists grupos_insert on public.grupos;
drop policy if exists grupos_select on public.grupos;

drop trigger if exists trg_proteger_sucursal_grupo on public.sucursales;
drop trigger if exists trg_proteger_tipo_grupo on public.grupos;
drop trigger if exists trg_validar_acceso_sucursal on public.user_sucursal_access;
drop trigger if exists trg_validar_rol_grupo on public.user_org_roles;
drop trigger if exists trg_user_org_roles_updated_at on public.user_org_roles;
drop trigger if exists trg_usuarios_updated_at on public.usuarios;
drop trigger if exists trg_sucursales_updated_at on public.sucursales;
drop trigger if exists trg_grupos_updated_at on public.grupos;

drop table if exists public.user_sucursal_access;
drop table if exists public.user_org_roles;
drop table if exists public.sucursales;
drop table if exists public.grupos;
drop table if exists public.usuarios;

drop function if exists private.puede_ver_grupo(uuid);
drop function if exists private.puede_ver_sucursal(uuid);
drop function if exists private.alcance_sucursales(uuid);
drop function if exists private.es_staff_del_grupo(uuid);
drop function if exists private.es_mecanu_admin();
drop function if exists private.proteger_sucursal_grupo();
drop function if exists private.proteger_tipo_grupo();
drop function if exists private.validar_acceso_sucursal();
drop function if exists private.validar_rol_grupo();
drop function if exists private.handle_new_user();
drop function if exists private.set_updated_at();

drop schema if exists private;

commit;
