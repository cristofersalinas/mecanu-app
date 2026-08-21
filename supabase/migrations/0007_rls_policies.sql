-- RLS + helpers de tenant. Aplicar en mecanu-dev tras 0001–0006.

-- taller_id del JWT (app_metadata.taller_id). Nunca user_metadata.
create or replace function public.jwt_taller_id()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'taller_id', '');
$$;

create or replace function public.jwt_rol()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'rol', '');
$$;

create or replace function public.es_dueno_o_ops()
returns boolean
language sql
stable
as $$
  select public.jwt_rol() in ('dueno', 'ops');
$$;

-- Política genérica: mismo taller, o dueño/ops ve todo.
-- Se aplica a tablas con columna taller_id.

-- Idempotente: se puede re-ejecutar si un Run anterior se quedó a medias.
drop policy if exists talleres_select_tenant on public.talleres;
drop policy if exists talleres_write_tenant on public.talleres;
drop policy if exists clientes_select_tenant on public.clientes;
drop policy if exists clientes_write_tenant on public.clientes;
drop policy if exists vehiculos_select_tenant on public.vehiculos;
drop policy if exists vehiculos_write_tenant on public.vehiculos;
drop policy if exists conductores_select_tenant on public.conductores;
drop policy if exists conductores_write_tenant on public.conductores;
drop policy if exists servicios_select_tenant on public.servicios;
drop policy if exists servicios_write_tenant on public.servicios;
drop policy if exists rutas_select_tenant on public.rutas;
drop policy if exists rutas_write_tenant on public.rutas;
drop policy if exists campanas_select_tenant on public.campanas;
drop policy if exists campanas_write_tenant on public.campanas;
drop policy if exists presupuestos_select_tenant on public.presupuestos;
drop policy if exists presupuestos_write_tenant on public.presupuestos;
drop policy if exists inspecciones_select_tenant on public.inspecciones;
drop policy if exists inspecciones_insert_tenant on public.inspecciones;
drop policy if exists inspecciones_write_tenant on public.inspecciones;
drop policy if exists perfiles_select_tenant on public.perfiles;
drop policy if exists perfiles_write_self on public.perfiles;
drop policy if exists perfiles_write_tenant on public.perfiles;
drop policy if exists paradas_via_ruta on public.paradas;
drop policy if exists traslados_via_ruta on public.traslados;
drop policy if exists logs_via_traslado on public.logs;
drop policy if exists vehiculo_clientes_via_vehiculo on public.vehiculo_clientes;
drop policy if exists presupuesto_lineas_via_presupuesto on public.presupuesto_lineas;
drop policy if exists campana_items_via_campana on public.campana_items;
drop policy if exists solicitudes_via_ruta on public.solicitudes;
drop policy if exists impersonation_dueno on public.impersonation_sessions;

-- talleres: id = taller_id
create policy talleres_select_tenant on public.talleres
  for select to authenticated
  using (public.es_dueno_o_ops() or id = public.jwt_taller_id());

create policy talleres_write_tenant on public.talleres
  for all to authenticated
  using (public.es_dueno_o_ops())
  with check (public.es_dueno_o_ops());

-- tablas con taller_id
create policy clientes_select_tenant on public.clientes
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());
create policy clientes_write_tenant on public.clientes
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy vehiculos_select_tenant on public.vehiculos
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());
create policy vehiculos_write_tenant on public.vehiculos
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy conductores_select_tenant on public.conductores
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());
create policy conductores_write_tenant on public.conductores
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy servicios_select_tenant on public.servicios
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());
create policy servicios_write_tenant on public.servicios
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy rutas_select_tenant on public.rutas
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());
create policy rutas_write_tenant on public.rutas
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy campanas_select_tenant on public.campanas
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());
create policy campanas_write_tenant on public.campanas
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy presupuestos_select_tenant on public.presupuestos
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());
create policy presupuestos_write_tenant on public.presupuestos
  for all to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id())
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());

create policy inspecciones_select_tenant on public.inspecciones
  for select to authenticated
  using (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());
create policy inspecciones_insert_tenant on public.inspecciones
  for insert to authenticated
  with check (public.es_dueno_o_ops() or taller_id = public.jwt_taller_id());
-- UPDATE ya revocado en 0004 (evidencia sellada)

create policy perfiles_select_tenant on public.perfiles
  for select to authenticated
  using (
    public.es_dueno_o_ops()
    or id = auth.uid()
    or taller_id = public.jwt_taller_id()
  );
create policy perfiles_write_self on public.perfiles
  for update to authenticated
  using (id = auth.uid() or public.es_dueno_o_ops())
  with check (id = auth.uid() or public.es_dueno_o_ops());

-- Hijos sin taller_id: vía join a rutas / vehiculos
create policy paradas_via_ruta on public.paradas
  for all to authenticated
  using (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.rutas r
      where r.id = paradas.ruta_id and r.taller_id = public.jwt_taller_id()
    )
  )
  with check (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.rutas r
      where r.id = paradas.ruta_id and r.taller_id = public.jwt_taller_id()
    )
  );

create policy traslados_via_ruta on public.traslados
  for all to authenticated
  using (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.rutas r
      where r.id = traslados.ruta_id and r.taller_id = public.jwt_taller_id()
    )
  )
  with check (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.rutas r
      where r.id = traslados.ruta_id and r.taller_id = public.jwt_taller_id()
    )
  );

create policy logs_via_traslado on public.logs
  for all to authenticated
  using (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.traslados t
      join public.rutas r on r.id = t.ruta_id
      where t.id = logs.traslado_id and r.taller_id = public.jwt_taller_id()
    )
  )
  with check (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.traslados t
      join public.rutas r on r.id = t.ruta_id
      where t.id = logs.traslado_id and r.taller_id = public.jwt_taller_id()
    )
  );

create policy vehiculo_clientes_via_vehiculo on public.vehiculo_clientes
  for all to authenticated
  using (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.vehiculos v
      where v.id = vehiculo_clientes.vehiculo_id and v.taller_id = public.jwt_taller_id()
    )
  )
  with check (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.vehiculos v
      where v.id = vehiculo_clientes.vehiculo_id and v.taller_id = public.jwt_taller_id()
    )
  );

create policy presupuesto_lineas_via_presupuesto on public.presupuesto_lineas
  for all to authenticated
  using (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.presupuestos p
      where p.id = presupuesto_lineas.presupuesto_id and p.taller_id = public.jwt_taller_id()
    )
  )
  with check (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.presupuestos p
      where p.id = presupuesto_lineas.presupuesto_id and p.taller_id = public.jwt_taller_id()
    )
  );

create policy campana_items_via_campana on public.campana_items
  for all to authenticated
  using (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.campanas c
      where c.id = campana_items.campana_id and c.taller_id = public.jwt_taller_id()
    )
  )
  with check (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.campanas c
      where c.id = campana_items.campana_id and c.taller_id = public.jwt_taller_id()
    )
  );

create policy solicitudes_via_ruta on public.solicitudes
  for all to authenticated
  using (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.rutas r
      where r.id = solicitudes.ruta_id and r.taller_id = public.jwt_taller_id()
    )
  )
  with check (
    public.es_dueno_o_ops()
    or exists (
      select 1 from public.rutas r
      where r.id = solicitudes.ruta_id and r.taller_id = public.jwt_taller_id()
    )
  );

-- Impersonación: solo dueno/ops
create policy impersonation_dueno on public.impersonation_sessions
  for all to authenticated
  using (public.es_dueno_o_ops() and actor_real_id = auth.uid())
  with check (public.es_dueno_o_ops() and actor_real_id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
