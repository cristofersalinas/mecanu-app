# Modelo de datos — propuesta para PostgreSQL / Supabase

Traduce `MODELO.md` (el modelo de negocio, ya cerrado y verificado) y el briefing de
jerarquía organizativa / planes / seguros a tablas, columnas, tipos, relaciones e
índices. Es una **propuesta**, no una migración ejecutada — quien construya el backend
real la revisa, ajusta y la convierte en archivos `.sql` versionados en
`supabase/migrations/` (ver `AGENTS.md`).

## Convenciones generales

- **IDs de entidades de negocio**: `text primary key` con el prefijo del dominio original
  (`TR-*`, `PD-*`, `TS-*`, `LG-*`, `PR-*`, `CMP-*`) para no romper continuidad con los
  datos de ejemplo — **decisión cerrada** (`MODELO.md` §7: "Ids conservados").
- **IDs de tablas nuevas** (org, infraestructura): `uuid primary key default gen_random_uuid()`.
- **Timestamps**: `created_at timestamptz not null default now()` y `updated_at timestamptz
  not null default now()` en toda tabla. Trigger `moddatetime` estándar de Supabase.
- **Trazabilidad de autoría**: `created_by uuid references usuarios(id)` y `updated_by uuid
  references usuarios(id)` (ambos nullable — `null` = acción del sistema) en toda tabla
  de datos operativos.
- **Dinero: `int` (céntimos), nunca `float`, nunca `numeric(10,2)`**. 2,90 € = `290`.
  374,50 € = `37450`. La conversión a display vive en `fmtDinero` (`mecanu-data.ts`).
- **Enums de estado**: `text` con `check` constraint apuntando a los valores de
  `mecanu-pipeline.ts`, NO `enum` nativo de Postgres — los estados son config de
  producto editable; un `enum` nativo requiere migración DDL para añadir un valor.
- **Nivel de tenant por tabla — no es uniforme**: `clientes` y `vehiculos` cuelgan de
  `grupo_id` (un cliente se reconoce en todo el grupo, no por sucursal — ver sección
  "Jerarquía organizativa"). `rutas` cuelga de `sucursal_id` (registra dónde ocurre
  físicamente la operación). Las tablas hijas de `rutas` (`paradas`, `traslados`,
  `logs`, `inspecciones`) heredan el tenant a través de la FK a `rutas`, no llevan
  columna de tenant propia.

---

## Jerarquía organizativa

### `grupos`
Unidad de facturación y titular del seguro/plan. Un cliente de Mecanu es un Grupo.
**Mecanu mismo es también una fila de esta tabla** (`tipo = 'mecanu'`) — así
`grupo_id` en `user_org_roles` es siempre una FK real a una tabla real, sin caso
especial en ningún sitio del esquema ni del código.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| tipo | text not null check in ('taller','mecanu') | |
| nombre | text not null | "Talleres Rodríguez" / "Mecanu" |
| nif | text | Para facturación. Null para el grupo `mecanu` |
| email_facturacion | text | |
| created_at | timestamptz not null | |
| updated_at | timestamptz not null | |

Constraint: `create unique index grupos_singleton_mecanu on grupos ((tipo)) where tipo = 'mecanu'`
— garantiza que solo puede existir una fila `tipo = 'mecanu'`. Se crea por seed al
provisionar el proyecto, no por signup.

### `sucursales`
Unidad operativa dentro de un Grupo. Cada sucursal tiene su propio Panel
(`/panel`). El plan Alta admite 1; Lujo admite 2; Hyper, las que el contrato diga.
El grupo `mecanu` también puede tener sucursales si en el futuro Mecanu organiza
su plantilla de soporte por sede — hoy no es necesario, no se crea ninguna.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| grupo_id | uuid fk → grupos.id not null | |
| nombre | text not null | "Sede Madrid" |
| direccion | text | |
| telefono | text | |
| activa | boolean not null default true | Desactivar no borra datos, pero libera cuota de sucursales |
| created_at | timestamptz not null | |
| updated_at | timestamptz not null | |

Índice: `(grupo_id)`.

---

## Autenticación y modelo de acceso

Reemplaza el diseño anterior (FK polimórfica `org_tipo`/`org_id`). El nuevo modelo
separa **membresía** (a qué grupo perteneces y con qué rol) de **alcance**
(a qué sucursales concretas de ese grupo puedes llegar). Ninguna de las dos tablas
usa polimorfismo ni columnas nullable condicionales — ambas son FKs reales,
validadas por Postgres.

### `usuarios`
Espejo de `auth.users` de Supabase. La fila se crea mediante un trigger al
registrar el usuario en Auth. `id` coincide con `auth.users.id`.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | = auth.users.id |
| email | text not null unique | |
| nombre | text not null | |
| avatar_url | text | |
| created_at | timestamptz not null | |
| updated_at | timestamptz not null | |

### `user_org_roles`
Membresía: a qué grupo pertenece el usuario y con qué rol. Un usuario puede tener
varias filas si trabaja para más de un grupo (caso raro pero no prohibido, ej. un
consultor) — **pero como máximo una fila por grupo**. Los cinco roles son fijos,
definidos por Mecanu — ningún taller crea roles propios.

| Columna | Tipo | Notas |
|---|---|---|
| usuario_id | uuid fk → usuarios.id not null | |
| grupo_id | uuid fk → grupos.id not null | FK real — sin polimorfismo. `mecanu_admin` y `conductor_flota` siempre apuntan al grupo `tipo='mecanu'` |
| rol | text not null check in ('mecanu_admin','grupo_admin','sucursal_admin','conductor_interno','conductor_flota') | |
| alcance_todas_sucursales | boolean not null default false | **Default restrictivo, deliberado.** `true` → el usuario ve todas las sucursales de `grupo_id`, se ignoran las filas de `user_sucursal_access`. `false` → el alcance viene exclusivamente de `user_sucursal_access`; cero filas ahí significa **cero acceso**, no acceso total. Un fallo de alta deja al usuario sin acceso y visible como tal, nunca con acceso ampliado en silencio. |
| activo | boolean not null default true | Desactivar sin borrar — preserva historial de auditoría |
| created_at | timestamptz not null | |
| updated_at | timestamptz not null | |
| | | `primary key (usuario_id, grupo_id)` |

**La PK es `(usuario_id, grupo_id)`, no `(usuario_id, rol, grupo_id)`** —
corregido tras esta pasada. Con `rol` dentro de la PK, la misma persona podía
tener dos roles distintos en el mismo grupo (ej. `conductor_interno` y
`conductor_flota` a la vez, prohibido por regla de negocio), y
`alcance_sucursales(usuario_id, grupo_id)` no tenía forma de saber cuál de los
dos `alcance_todas_sucursales` aplicaba — el grano de la función de alcance y el
grano de la tabla no coincidían. Con `(usuario_id, grupo_id)` como PK, **un
usuario tiene como máximo un rol por grupo**, sin ambigüedad posible. Si alguna
vez una persona necesitara operar con dos roles en el mismo grupo, la solución
es dos cuentas (dos `usuario_id`) — no una fila adicional aquí.

### `user_sucursal_access`
Alcance explícito: sucursales concretas a las que llega el usuario cuando
`user_org_roles.alcance_todas_sucursales = false` para esa membresía. Si
`alcance_todas_sucursales = true`, esta tabla se ignora por completo — no hace
falta ni tiene sentido tener filas.

| Columna | Tipo | Notas |
|---|---|---|
| usuario_id | uuid fk → usuarios.id not null | |
| sucursal_id | uuid fk → sucursales.id not null | |
| created_at | timestamptz not null | |
| | | `primary key (usuario_id, sucursal_id)` |

No lleva `grupo_id` — se deriva uniendo `sucursales.grupo_id`. Esto es lo que
permite que un `conductor_flota` (cuya fila en `user_org_roles` apunta al grupo
`mecanu`) tenga acceso a una sucursal de un taller cliente sin ningún caso
especial estructural: su fila en `user_sucursal_access` apunta directamente a
esa sucursal, sin necesidad de que coincida con su `grupo_id` de membresía. La
pertenencia (quién eres) y el alcance (dónde puedes actuar) son preguntas
independientes.

**Por qué no "cero filas = todas"**: esa versión anterior del diseño era
fail-open — la omisión de datos (olvidar insertar las filas de restricción)
otorgaba el acceso más amplio posible sin que nada lo señalara. Con
`alcance_todas_sucursales` como columna explícita y default `false`, la omisión
de datos ahora falla hacia **cero acceso**, el resultado seguro. Ver
`PREGUNTAS-ABIERTAS.md` §32 (resuelta) y el test obligatorio descrito en
`PERMISOS.md`.

**Validación obligatoria — el mismo principio, en la otra dirección.** Que
`user_sucursal_access` no lleve `grupo_id` resuelve el caso legítimo de
`conductor_flota`, pero sin ninguna restricción adicional, nada impide insertar
una fila que dé a un `sucursal_admin` de un taller acceso a la sucursal de
**otro** taller — un segundo fail-open, ahora en sentido contrario al de §32
(ahí la omisión de datos ampliaba el acceso; aquí sería un dato mal insertado el
que lo amplía). La tabla necesita un trigger de validación:

```sql
create or replace function validar_acceso_sucursal() returns trigger as $$
declare
  v_grupo_sucursal uuid;
  v_es_miembro_del_grupo boolean;
  v_es_conductor_flota boolean;
begin
  select grupo_id into v_grupo_sucursal
  from sucursales where id = new.sucursal_id;

  -- Caso normal: el usuario es miembro (tiene fila en user_org_roles) del
  -- mismo grupo al que pertenece la sucursal.
  select exists(
    select 1 from user_org_roles
    where usuario_id = new.usuario_id and grupo_id = v_grupo_sucursal
  ) into v_es_miembro_del_grupo;

  if v_es_miembro_del_grupo then
    return new;
  end if;

  -- Única excepción declarada: un conductor_flota (grupo_id = grupo Mecanu)
  -- accediendo a la sucursal de un taller cliente, fuera de su propio grupo.
  select exists(
    select 1 from user_org_roles
    where usuario_id = new.usuario_id and rol = 'conductor_flota'
  ) into v_es_conductor_flota;

  if v_es_conductor_flota then
    return new;
  end if;

  raise exception
    'user_sucursal_access: el usuario % no pertenece al grupo de la sucursal % y no es conductor_flota',
    new.usuario_id, new.sucursal_id;
end;
$$ language plpgsql;

create trigger trg_validar_acceso_sucursal
before insert or update on user_sucursal_access
for each row execute function validar_acceso_sucursal();
```

**Por qué `conductor_flota` es la única excepción, escrita explícitamente**: es
el único caso de negocio donde el acceso entre grupos es correcto por diseño —
un conductor de la red Mecanu opera puntualmente en talleres que no son el suyo
(`grupo_id` = grupo `mecanu`), y `SEGUROS.md`/`PLANES.md` ya asumen ese cruce
como normal. Cualquier otra fila que cruce de grupo es, con la información
disponible hoy, un error de datos o un intento de acceso indebido — no una
variante legítima sin descubrir todavía. Si en el futuro aparece un segundo caso
de negocio real que necesite acceso entre grupos, se añade como una segunda
rama explícita en esta función, nunca quitando la validación por completo.

### Mapeo de ejemplo

| Persona | `user_org_roles` (rol, grupo, `alcance_todas_sucursales`) | `user_sucursal_access` |
|---|---|---|
| Admin maestro del grupo | `grupo_admin`, su grupo, `true` | irrelevante (ignorada) |
| Admin de grupo con visión reducida | `grupo_admin`, su grupo, `false` | N filas — ver §33 en `PREGUNTAS-ABIERTAS.md`, ya no es un rol especial |
| Admin de una sucursal | `sucursal_admin`, su grupo, `false` | 1 fila |
| Admin de dos sucursales | `sucursal_admin`, su grupo, `false` | 2 filas |
| Conductor interno | `conductor_interno`, su grupo, `false` (típico) o `true` si el taller solo tiene una sucursal | filas según sucursal(es) asignadas por el onboarding, si `alcance_todas_sucursales = false` |
| Conductor de la flota Mecanu | `conductor_flota`, grupo Mecanu, `false` | 1 fila por sucursal de taller cliente donde opera |
| Empleado de soporte Mecanu | `mecanu_admin`, grupo Mecanu, cualquier valor (irrelevante — la política RLS concede acceso completo a `mecanu_admin` por una condición explícita, no por bypass de motor, ver RLS más abajo) | irrelevante |

El alcance de un `conductor_interno`/`conductor_flota` recién creado nunca es
automático: el flujo de onboarding tiene que insertar explícitamente o bien
`alcance_todas_sucursales = true`, o bien las filas de `user_sucursal_access`
correspondientes. Sin ese paso, el conductor queda con cero acceso — visible y
corregible, no un bug silencioso.

---

## Feature switches

### `feature_switches_catalog`
Catálogo maestro de funcionalidades activables. Solo Mecanu lo modifica.

| Columna | Tipo | Notas |
|---|---|---|
| feature | text pk | `'checkin_video'`, `'ia_diagnostico'`, `'seguro_demanda'`, `'whatsapp_propio'`, `'gps_tracking'`, `'campanas_auto'`, `'notificaciones_push'` |
| descripcion | text not null | |
| activo_global | boolean not null default false | Si `false`: NADIE lo ve, sin importar el plan ni ningún override. `seguro_demanda` empieza aquí. |
| updated_at | timestamptz not null | |

### `org_feature_switches`
Estado del feature para un Grupo concreto. Solo tiene efecto si
`feature_switches_catalog.activo_global = true`.

| Columna | Tipo | Notas |
|---|---|---|
| grupo_id | uuid fk → grupos.id not null | |
| feature | text fk → feature_switches_catalog.feature not null | |
| activo | boolean not null | |
| origen | text not null check in ('plan','excepcion') | `'plan'`: la fila la generó automáticamente el sistema al incluirse el feature en el plan del grupo. `'excepcion'`: la activó/desactivó manualmente `mecanu_admin` o `grupo_admin`, fuera de lo que el plan incluye por defecto. |
| activado_por | uuid fk → usuarios.id | Null si `origen = 'plan'` (lo hizo el sistema) |
| activado_en | timestamptz not null default now() | |
| | | `primary key (grupo_id, feature)` |

**Cascada de evaluación** (orden estricto):
1. `feature_switches_catalog.activo_global = false` → OFF para todos, sin excepción.
2. Existe fila en `org_feature_switches` para este `(grupo_id, feature)` → usa
   `org_feature_switches.activo` tal cual, sin importar `origen`.
3. Sin fila → OFF por defecto (no asumir ON — ausencia de dato nunca es "sí").

**De dónde salen las filas `origen = 'plan'`**: qué features incluye cada plan por
defecto es una constante en código
(`PLAN_FEATURES_DEFAULT: Record<Plan, FeatureName[]>` en `src/lib/mecanu/planes.ts`,
por crear) — misma razón que los permisos: los planes los define Mecanu, no cada
taller, así que el mapeo vive en código versionado, no en una tabla editable.
Cuando `org_plan.plan` cambia (upgrade/downgrade), una función de reconciliación
actualiza las filas `origen = 'plan'` de `org_feature_switches` para reflejar el
nuevo plan — sin tocar nunca las filas `origen = 'excepcion'`, que son overrides
deliberados que sobreviven a un cambio de plan.

**Ejemplo — `seguro_demanda`**: hoy `activo_global = false` en el catálogo. Aunque
el plan Lujo lo incluyera en `PLAN_FEATURES_DEFAULT`, ningún grupo lo ve hasta que
Mecanu active el catálogo globalmente. Ver `AGENTS.md` — este feature está
completamente modelado pero inactivo a propósito, "en espera de producto".

---

## Planes y cuotas

### `planes_config`
Catálogo de planes. Los precios son datos configurables, nunca constantes en código.

| Columna | Tipo | Notas |
|---|---|---|
| nombre | text pk check in ('alta','lujo','hyper') | |
| descripcion | text not null | |
| precio_mensual_cents | int | Precio base mensual. `null` para Hyper — negociado y facturado 100% fuera de la plataforma, no se modela precio en BD (ver `PLANES.md`) |
| updated_at | timestamptz not null | |

### `plan_limites`
Límites por plan y dimensión. `null` = ilimitado — **pero eso solo aplica a una
fila que existe**. Toda combinación `(plan, dimension)` debe tener una fila
explícita, incluida `limite = null` para "sin límite" (así están sembradas Alta,
Lujo e Hyper en `PLANES.md`). El código que consulta el límite debe tratar
"no existe fila" como error de configuración — nunca como sinónimo de
ilimitado. Es el mismo principio que la cascada de `org_feature_switches`:
la ausencia de dato nunca es la respuesta más permisiva. Un plan nuevo o una
dimensión nueva sin fila sembrada no debe otorgar acceso ilimitado por omisión.

| Columna | Tipo | Notas |
|---|---|---|
| plan | text fk → planes_config.nombre not null | |
| dimension | text not null | `'traslados_creados'`, `'conductores_activos'`, `'sucursales_activas'`, `'whatsapp_msgs_mes'` |
| limite | int | `null` = sin límite (fila presente, valor explícito) |
| | | `primary key (plan, dimension)` |

### `plan_precios_overage`
Precio por unidad de excedente. **Sin filas para Hyper** — confirmado, es
negociado y facturado 100% fuera de la plataforma; el sistema nunca genera
overages automáticos para ese plan.

| Columna | Tipo | Notas |
|---|---|---|
| plan | text fk → planes_config.nombre not null | Solo `'alta'` y `'lujo'` tienen filas |
| dimension | text not null | |
| precio_unitario_cents | int not null | |
| | | `primary key (plan, dimension)` |

### `plan_precios_flota`
Precio de solicitar un conductor de la red Mecanu (`conductor_flota`), por plan.
**No modela un excedente** — `plan_precios_overage` es para superar un límite ya
incluido en el plan; esto es el precio de un servicio adicional que el plan no
incluye por defecto. Nuevo tras esta pasada: el plan Alta puede pedir flota
Mecanu pagando un recargo del 35% sobre la tarifa de Lujo, y ese dato no vivía
en ninguna tabla.

| Columna | Tipo | Notas |
|---|---|---|
| plan | text pk fk → planes_config.nombre | Solo `'alta'` y `'lujo'` tienen fila — Hyper es negociado, mismo criterio que `plan_precios_overage` |
| tarifa_base_cents | int | Precio por traslado con conductor de flota. `null` si este plan no tiene tarifa propia y depende de `recargo_sobre_plan` |
| recargo_pct | numeric(5,2) | `null` si el plan tiene tarifa propia (`tarifa_base_cents` no nulo). Si no es nulo, el precio efectivo es `tarifa_base_cents` del plan referenciado en `recargo_sobre_plan`, multiplicado por `(1 + recargo_pct / 100)` |
| recargo_sobre_plan | text fk → planes_config.nombre | Plan cuya `tarifa_base_cents` sirve de referencia. `null` si el plan tiene tarifa propia |
| updated_at | timestamptz not null | |

Constraint: exactamente uno de los dos modos debe estar completo —
`check ((tarifa_base_cents is not null) <> (recargo_pct is not null and recargo_sobre_plan is not null))`.

```sql
-- Lujo tiene tarifa propia; Alta se define como recargo sobre la de Lujo.
-- El 35% es la decisión de negocio de esta pasada; el valor base de Lujo
-- queda pendiente — ver PREGUNTAS-ABIERTAS.md §27.
INSERT INTO plan_precios_flota (plan, tarifa_base_cents, recargo_pct, recargo_sobre_plan, updated_at) VALUES
  ('lujo', <pendiente>, null, null, now()),
  ('alta', null, 35.00, 'lujo', now());
-- Hyper: sin fila — negociado, mismo criterio que plan_precios_overage.
```

Modelar el recargo como referencia relativa (`recargo_pct` + `recargo_sobre_plan`)
en vez de guardar directamente el precio resuelto de Alta responde a como está
enunciada la regla de negocio: "35% sobre la tarifa de Lujo", no "Alta cuesta
X€". Si Lujo cambia su tarifa, Alta la sigue automáticamente sin una segunda
edición manual — y el cargo real se snapshotea de todas formas en
`usage_overages.precio_unitario_cents` en el momento de la asignación, así que
un cambio de tarifa nunca es retroactivo sobre cargos ya facturados. Ver
`PLANES.md` "Recargo de flota Mecanu (plan Alta)" para el flujo de facturación.

### `org_plan`
El plan activo de un Grupo y su período de facturación en curso.

| Columna | Tipo | Notas |
|---|---|---|
| grupo_id | uuid pk fk → grupos.id | |
| plan | text fk → planes_config.nombre not null | |
| periodo_inicio | date not null | Primer día del mes |
| periodo_fin | date not null | Último día del mes |
| actualizado_por | uuid fk → usuarios.id | |
| actualizado_en | timestamptz not null | |

### `usage_counters`
Contadores de uso mensual por Grupo.

| Columna | Tipo | Notas |
|---|---|---|
| grupo_id | uuid fk → grupos.id not null | |
| periodo | date not null | Primer día del mes del período |
| dimension | text not null | |
| contador | int not null default 0 | |
| | | `primary key (grupo_id, periodo, dimension)` |

### `usage_overages`
Cada unidad de excedente registrada, y también cada cargo de servicio adicional
que no corresponde a superar un límite de `plan_limites` — por ejemplo
`dimension = 'conductor_flota_uso'` (recargo de flota, ver `plan_precios_flota`
más arriba y `PLANES.md`). No todo `dimension` de esta tabla tiene una fila
equivalente en `plan_limites`: los excedentes de cuota sí la tienen, los cargos
de servicio adicional no — no hay un "límite" que superar, es un servicio que se
paga cada vez que se usa. La acción se ejecuta siempre primero; el cargo se
registra después.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| grupo_id | uuid fk → grupos.id not null | |
| periodo | date not null | |
| dimension | text not null | |
| entidad_id | text | El traslado, conductor o sucursal que generó el excedente. Para `dimension = 'traslados_creados'` es el `rutas.id` — la clave que permite localizar y revertir exactamente esta unidad al cancelar, ver más abajo |
| precio_unitario_cents | int not null | Snapshot al momento — el precio puede cambiar |
| facturado | boolean not null default false | |
| facturado_en | timestamptz | |
| revertido | boolean not null default false | La unidad que generó este cargo fue revertida (ver "Reversión de `traslados_creados` al cancelar" más abajo). **No se borra la fila** — se marca, para dejar rastro. Un cargo `revertido = true` se excluye de la facturación pendiente. |
| revertido_en | timestamptz | |
| created_at | timestamptz not null | |

Facturación pendiente de un grupo: `WHERE facturado = false AND revertido = false`.

---

## Reversión de `traslados_creados` al cancelar

**Regla de la línea de corte — escríbela así, no la infieras del nombre de la
columna.** El contador `traslados_creados` suma al **crear** la ruta (ver
`PLANES.md`). Al **cancelar** una ruta, ese incremento se revierte o no según
una única condición, evaluada sobre el **día de servicio de la ruta**:

- **Sin día de servicio comprometido** (la ruta seguía en Prospectos, nunca tuvo
  un `traslados.ventana_fecha` asignado) → **siempre se revierte**. Nunca llegó
  a comprometer un día, así que cancelarla no consume nada.
- **Cancelada antes del día de servicio** → **se revierte**.
- **Cancelada el mismo día del servicio o después** → **NO se revierte, el
  cargo se mantiene**. A esa altura ya hay conductor y cliente comprometidos —
  una cancelación tardía consume recurso real.

**El "día de servicio de la ruta" no es una columna almacenada** — se deriva
como el más temprano de los `traslados.ventana_fecha` no nulos de esa ruta
(`MIN(ventana_fecha)` entre los tramos de la ruta). Es un valor calculado en el
momento de la cancelación, no un snapshot fijado al crear la ruta, porque una
reprogramación (`traslados.reprogramaciones`) puede haber movido la fecha desde
entonces — la línea de corte usa la fecha vigente en ese instante, no la
original. "Hoy" se evalúa en la zona horaria de negocio (Europe/Madrid), para
que la comparación de "mismo día" no dependa de en qué huso corre el servidor.

```sql
create or replace function revertir_contador_traslados_creados() returns trigger as $$
declare
  v_fecha_servicio date;
  v_grupo_id uuid;
  v_periodo date;
  v_hoy date := (now() at time zone 'Europe/Madrid')::date;
  v_overage_id uuid;
begin
  -- Solo actúa en la transición hacia 'cancelado'
  if new.estado <> 'cancelado' or old.estado = 'cancelado' then
    return new;
  end if;

  select grupo_id into v_grupo_id from sucursales where id = new.sucursal_id;
  v_periodo := date_trunc('month', new.creada_en)::date;

  select min(ventana_fecha) into v_fecha_servicio
  from traslados
  where ruta_id = new.id and ventana_fecha is not null;

  -- Línea de corte: sin fecha, o cancelada antes del día de servicio → revertir.
  -- Fecha de servicio <= hoy (mismo día o después) → NO revertir.
  if v_fecha_servicio is not null and v_fecha_servicio <= v_hoy then
    return new; -- se mantiene el cargo, no hay nada que revertir
  end if;

  update usage_counters
  set contador = contador - 1
  where grupo_id = v_grupo_id and periodo = v_periodo
    and dimension = 'traslados_creados';

  select id into v_overage_id
  from usage_overages
  where grupo_id = v_grupo_id and periodo = v_periodo
    and dimension = 'traslados_creados' and entidad_id = new.id
    and revertido = false
  limit 1;

  if v_overage_id is not null then
    update usage_overages
    set revertido = true, revertido_en = now()
    where id = v_overage_id;
  end if;

  insert into audit_events (
    actor_id, actor_rol, grupo_id, sucursal_id, entidad, entidad_id, accion,
    payload_antes, payload_despues
  ) values (
    new.updated_by, null, v_grupo_id, new.sucursal_id, 'ruta', new.id,
    'contador_traslado_revertido',
    jsonb_build_object('fecha_servicio', v_fecha_servicio, 'motivo', case when v_fecha_servicio is null then 'sin_fecha_comprometida' else 'cancelada_antes_del_servicio' end),
    jsonb_build_object('overage_revertido', v_overage_id is not null, 'overage_id', v_overage_id)
  );

  return new;
end;
$$ language plpgsql;

create trigger trg_revertir_contador_traslados_creados
before update on rutas
for each row execute function revertir_contador_traslados_creados();
```

**La reversión es siempre un evento auditable**, tanto si había un
`usage_overages` que anular como si solo tocaba decrementar el contador — el
`INSERT` en `audit_events` ocurre en los dos casos, no solo cuando hay dinero de
por medio. `payload_antes` guarda por qué se revirtió (sin fecha comprometida,
o cancelada antes del servicio); `payload_despues` guarda si además anuló un
cargo de excedente.

**Qué queda fuera de esta pasada**: si el cargo asociado ya estaba
`facturado = true` cuando se cancela la ruta (factura ya emitida), esta lógica
igual lo marca `revertido = true`, pero no genera automáticamente una nota de
crédito ni ajusta la factura ya emitida — eso es un flujo de facturación
aparte, no resuelto aquí. En la práctica esto solo puede pasar si la
cancelación llega después de cerrado el período de facturación, un caso
suficientemente raro (la línea de corte por día de servicio ya descarta la
mayoría de cancelaciones tardías) como para no bloquear el cierre de esta fase
de diseño por él.

---

## Seguros

### `seguros_externos`
Histórico de pólizas propias del Grupo contratadas con aseguradoras externas.

**PK propia `id uuid`, no `grupo_id` — corregido tras esta pasada.** Con
`grupo_id` como PK solo cabía una fila por grupo: al renovar la póliza, la
anterior se sobrescribía y con ella se perdía la evidencia de qué cubría un
traslado de hace ocho meses — información con implicación legal si hay que
resolver un siniestro pasado. Ahora es un histórico normal.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk default gen_random_uuid() | |
| grupo_id | uuid fk → grupos.id not null | |
| aseguradora | text not null | |
| numero_poliza | text not null | |
| vigente_desde | date not null | |
| vigente_hasta | date not null | UI muestra ámbar cuando queden ≤ 30 días para la póliza vigente |
| cobertura_descripcion | text | |
| created_at | timestamptz not null | |
| updated_at | timestamptz not null | |
| updated_by | uuid fk → usuarios.id | |

Índice: `(grupo_id, vigente_desde desc)` — soporta tanto el histórico completo
como la resolución rápida de "la póliza vigente" sin escanearlo entero.

**La póliza vigente se deriva, no se guarda como flag.** Una vista simple la
resuelve sin tener que repetir la lógica en cada consultante:

```sql
create view seguros_externos_vigente as
select distinct on (grupo_id) *
from seguros_externos
where vigente_desde <= current_date
order by grupo_id, vigente_desde desc;
```

Toma, por grupo, la póliza más reciente que ya empezó — incluso si su
`vigente_hasta` ya pasó (en cuyo caso el escudo de `SEGUROS.md` la muestra en
rojo como "seguro caducado" en vez de no encontrar ninguna). Todo lo que en
`SEGUROS.md` lee `seguros_externos.vigente_hasta` para el árbol de decisión del
escudo debe leerlo a través de esta vista, no de la tabla directamente.

El seguro Mecanu mensual y el seguro bajo demanda no tienen tabla propia — ver
`SEGUROS.md`. El primero es un `org_feature_switches` con
`feature = 'seguro_mecanu_mensual'`; el segundo se registra por traslado en
`traslados.seguro_tipo` (ver más abajo).

### `whatsapp_config`
Config del proveedor WhatsApp por Grupo. Solo existe si el Grupo tiene activado
`whatsapp_propio`.

| Columna | Tipo | Notas |
|---|---|---|
| grupo_id | uuid pk fk → grupos.id | |
| proveedor | text not null check in ('kapso','meta_cloud_api') | Abstracción del proveedor |
| numero_telefono | text not null | |
| credenciales_ref | text not null | Referencia al secreto en el gestor de secretos — NUNCA el token raw en esta tabla |
| activo | boolean not null default true | |
| updated_at | timestamptz not null | |
| updated_by | uuid fk → usuarios.id | |

---

## Tablas de negocio (actualizadas)

Cambios aplicados a las tablas que ya existían en la versión anterior de este
documento:

**1. Dinero → céntimos**: todos los campos `numeric(10,2)` pasan a `int`.
Afecta: `servicios.mano_obra`, `servicios.materiales`, `presupuestos.total`,
`presupuesto_lineas.importe`, `traslados.importe`, `campana_items.valor`,
`inspeccion_hallazgos.servicio_precio`.

**2. Trazabilidad**: añadir `created_by uuid fk → usuarios(id)` y `updated_by uuid
fk → usuarios(id)` (nullable) a `clientes`, `vehiculos`, `conductores`, `rutas`,
`paradas`, `traslados`, `presupuestos`, `presupuesto_lineas`, `campanas`, `campana_items`,
`inspecciones`, `solicitudes`.

**3. Tenant — corregido tras esta pasada**:
- `clientes` y `vehiculos`: `grupo_id uuid fk → grupos(id) not null`
  (**no** `sucursal_id`). Decisión: el cliente y el vehículo se reconocen en todo
  el grupo — un cliente habitual que va a dos sucursales del mismo grupo es un
  solo registro, no uno por sucursal.
- `rutas`: `sucursal_id uuid fk → sucursales(id) not null`. Cada traslado registra
  en qué sucursal ocurrió — esto no cambia. `paradas`, `traslados`, `logs`,
  `inspecciones` heredan el tenant vía su FK a `rutas`, sin columna propia.
- `campanas`, `presupuestos`: mantienen `sucursal_id` (denormalizado desde la
  ruta de origen, para no forzar un join en cada query del Panel).
- `conductores`: **no lleva columna de tenant propia**. Su pertenencia (grupo) y
  su alcance (sucursales donde opera) se leen enteramente de `user_org_roles` /
  `user_sucursal_access` a través de `conductores.usuario_id` — igual que
  cualquier otro usuario del sistema.

**Cambio específico en `traslados`**: el campo `seguro boolean not null default false`
se reemplaza por:

| Columna nueva | Tipo | Notas |
|---|---|---|
| seguro_tipo | text not null check in ('externo','mecanu_mensual','mecanu_demanda','ninguno') | Reemplaza `seguro boolean`. La invariante "cobertura siempre visible" sigue en pie — con más granularidad. |
| seguro_demanda_activado_en | timestamptz | Solo si `seguro_tipo = 'mecanu_demanda'` |
| seguro_demanda_precio_cents | int | Snapshot del precio al momento de la compra |

El árbol de decisión del escudo de color a partir de `seguro_tipo` está en `SEGUROS.md`.

**Cambio específico en `conductores`**: añadir `usuario_id uuid fk → usuarios(id)
not null`. **No es nullable** — la cuenta del conductor se crea desde el primer
paso del onboarding, no después. Ver "Onboarding de un conductor" más abajo.

El resto de columnas de cada tabla permanece como estaba documentado — ver
`src/lib/mecanu/types.ts` como fuente viva.

### Onboarding de un conductor

Resuelve `PREGUNTAS-ABIERTAS.md` §31. Flujo:

1. El taller invita a un conductor (email o el mecanismo de invitación que use
   Supabase Auth).
2. Al aceptar, se crea `usuarios` + una fila en `user_org_roles`
   (`rol = 'conductor_interno'` o `'conductor_flota'`, `grupo_id` del taller o
   de Mecanu según corresponda) + su alcance de sucursales
   (`alcance_todas_sucursales` o filas en `user_sucursal_access`) + la fila en
   `conductores` con `usuario_id` ya poblado y `proceso = 'documentos_pendientes'`.
3. Estos cuatro inserts ocurren en la misma transacción — no existe un estado
   intermedio donde el conductor tenga identidad pero no cuenta, ni cuenta sin
   identidad.

**El estado del conductor (`conductores.proceso`) controla qué puede hacer, no
quién es.** Un conductor en `documentos_pendientes` ya tiene rol, grupo y alcance
completos desde el primer momento — lo que le bloquea operar (tomar traslados,
avanzar subestados, actualizar km) es la capa de autorización, que verifica
`proceso = 'activo'` como parte de `autorizar()`, no la ausencia de una fila en
`user_org_roles`/`user_sucursal_access`. Ver `PERMISOS.md`, función `autorizar()`.

---

## Trazabilidad de acciones sensibles

### `audit_events`
Tabla **inmutable**: solo `INSERT`, nunca `UPDATE` ni `DELETE`. Registra acciones
con impacto de negocio o legal (cancelaciones, cambios de plan, impersonaciones,
siniestros). No es un log de debug.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk default gen_random_uuid() | |
| ts | timestamptz not null default now() | |
| actor_id | uuid fk → usuarios(id) | `null` = acción del sistema. Ver `PREGUNTAS-ABIERTAS.md` §29 sobre RGPD — este campo se anonimiza (no se borra la fila) cuando aplique |
| actor_rol | text | Snapshot del rol al momento — el rol puede cambiar después |
| grupo_id | uuid fk → grupos(id) | |
| sucursal_id | uuid fk → sucursales(id) | |
| entidad | text not null | `'ruta'`, `'traslado'`, `'presupuesto'`, `'conductor'`, `'org_plan'`, `'seguro'`... |
| entidad_id | text not null | |
| accion | text not null | `'cancelacion'`, `'cambio_plan'`, `'impersonacion'`, `'incidencia_reportada'`, `'seguro_externo_actualizado'`, `'contador_traslado_revertido'`... |
| payload_antes | jsonb | Snapshot del estado anterior |
| payload_despues | jsonb | |
| ip | text | |
| user_agent | text | |

Política de BD: `REVOKE UPDATE, DELETE ON audit_events FROM PUBLIC`.
Política RLS: solo `INSERT` para roles operativos; `SELECT` para `grupo_admin`
y `mecanu_admin`.

---

## GPS y localización

### `conductor_locations`
Trail GPS durante un traslado activo. Inserciones cada ~30 s desde la Geolocation
API del móvil vía Supabase Realtime.

| Columna | Tipo | Notas |
|---|---|---|
| conductor_id | text fk → conductores(id) not null | |
| traslado_id | text fk → traslados(id) not null | |
| ts | timestamptz not null | |
| lat | double precision not null | |
| lng | double precision not null | |
| accuracy | real | Metros, de la Geolocation API |
| | | `primary key (conductor_id, ts)` |

Retención: **30 días**. Auto-purga vía `pg_cron` o Edge Function con Schedule.
Índice: `(traslado_id, ts desc)`.

---

## Infraestructura

### `idempotency_keys`
Reemplaza el `Map` en memoria de `src/lib/mecanu/idempotency.ts` para entornos
serverless donde múltiples instancias no comparten memoria.

**PK compuesta `(grupo_id, key)`, no `key` sola — corregido tras esta pasada.**
Con PK solo en `key`, dos grupos distintos que generaran por azar (o por un
cliente HTTP con lógica predecible, ej. UUID v5 determinista) la misma cadena de
idempotencia recibirían la respuesta cacheada el uno del otro — datos ajenos
dentro de la respuesta de una petición propia. Aislar por `grupo_id` cierra esto.

| Columna | Tipo | Notas |
|---|---|---|
| grupo_id | uuid fk → grupos.id not null | |
| key | text not null | Valor del header `Idempotency-Key` |
| response_status | int not null | HTTP status de la primera respuesta |
| response_body | jsonb not null | Body completo para devolver en reintentos |
| created_at | timestamptz not null default now() | |
| expires_at | timestamptz not null | `created_at + interval '24 hours'` |
| | | `primary key (grupo_id, key)` |

INSERT con `ON CONFLICT (grupo_id, key) DO NOTHING`. Auto-purga:
`DELETE FROM idempotency_keys WHERE expires_at < now()`.

Implica que `src/lib/mecanu/idempotency.ts` (hoy un `Map<string, Respuesta>`
solo por `key`) también necesita el `grupo_id` del actor autenticado al migrar a
esta tabla — `getIdempotentResponse`/`saveIdempotentResponse` pasan a recibir
`(grupoId, key)`, no solo `key`. Cambio de código pendiente cuando se implemente
esta tabla, fuera de alcance de este documento de diseño.

---

## Retención de medios

No es una tabla, sino una política de ciclo de vida en **Supabase Storage**:

- **Fotos de check-in, firmas, nota de voz, vídeo**: retención de **14 meses**
  desde la fecha del check-in.
- **Trail GPS** (`conductor_locations`): 30 días.

Ver `PREGUNTAS-ABIERTAS.md` §29 sobre el cruce con RGPD y `audit_events`.

---

## Principios RLS y el modelo de acceso

RLS controla acceso a **filas**, no lógica de negocio — eso sigue igual. El
alcance ya no depende del rol (ver revisión de §33 en `PREGUNTAS-ABIERTAS.md`):
lo determina exclusivamente la columna `user_org_roles.alcance_todas_sucursales`,
igual para cualquier rol que la tenga en `false` o en `true`. Ningún rol recibe
trato especial en la política — **ni siquiera `mecanu_admin`**, ver más abajo.

**Función de alcance** (usada dentro de las políticas RLS vía `EXISTS`/`IN`, se
define como función SQL `security definer` cuando se escriban las migraciones):

```
alcance_sucursales(usuario_id, grupo_id) →
  SI user_org_roles.alcance_todas_sucursales = true para (usuario_id, grupo_id)
    → todas las sucursal_id donde sucursales.grupo_id = grupo_id
  SI NO
    → exactamente las sucursal_id en user_sucursal_access para usuario_id
      (puede ser el conjunto vacío = cero acceso)
```

**`mecanu_admin` no usa `BYPASSRLS` — corregido tras esta pasada.**
`BYPASSRLS` es un atributo de rol de Postgres, no algo que se pueda asignar a
una persona concreta dentro de `authenticated` (en Supabase todos los usuarios
autenticados comparten ese mismo rol de base de datos); dárselo de verdad
exigiría ejecutar como `service_role`, que `AGENTS.md` prohíbe exponer fuera del
servidor. Y hay un problema más de fondo: esquivar RLS a nivel de motor saca la
comprobación de acceso de la maquinaria normal de consultas — contradice la
decisión de que la impersonación (y cualquier acceso de soporte) se audita
siempre, sin switch, porque un bypass de motor no dependería de que el código de
aplicación recuerde escribir en `audit_events`.

En su lugar, `mecanu_admin` se resuelve con una función de condición explícita,
usada como una rama `OR` dentro de cada política:

```sql
create or replace function es_mecanu_admin(p_usuario_id uuid) returns boolean as $$
  select exists(
    select 1 from user_org_roles
    where usuario_id = p_usuario_id
      and rol = 'mecanu_admin'
      and activo = true
  );
$$ language sql stable security definer;
```

Política general por tabla (uniforme, sin caso especial de rol):
```sql
using (
  es_mecanu_admin(auth.uid())
  or sucursal_id in (select alcance_sucursales(auth.uid(), <grupo_id de la fila>))
)
```

- `conductor_interno` / `conductor_flota` → además de la rama `mecanu_admin`,
  filas donde `conductor_id` corresponde al `conductores.usuario_id = auth.uid()`,
  Y la sucursal de esa fila está dentro de `alcance_sucursales(...)`.
- `sucursal_admin` / `grupo_admin` → filas donde `sucursal_id IN
  alcance_sucursales(...)`. Misma política exacta para ambos roles — la
  diferencia entre "admin de una sucursal" y "admin de grupo con visión completa"
  ya no es el rol, es el valor de `alcance_todas_sucursales` y las filas de
  `user_sucursal_access` de esa membresía concreta.
- `mecanu_admin` → la rama `es_mecanu_admin(auth.uid())` de la condición es
  verdadera y la política concede la fila sin evaluar el resto — sigue viendo
  todo, pero pasando por la misma maquinaria de políticas que cualquier otro
  rol, consulta por consulta, auditable de la misma forma.

La lógica "puede cancelar porque tiene el permiso `ruta.cancelar.cualquiera`" NO
va en RLS — va en la capa de autorización de aplicación (`src/lib/mecanu/`, ver
`PERMISOS.md`), evaluada antes de llamar al repo. RLS es la última línea de
defensa a nivel de fila, no la única.

---

## Índices adicionales recomendados

- `rutas (estado, subestado)` — el kanban filtra por esto constantemente.
- `rutas (sucursal_id, estado)` — el kanban de una sucursal.
- `clientes (grupo_id)`, `vehiculos (grupo_id)` — filtro de tenant a nivel de grupo.
- `vehiculos (matricula_normalizada)` — búsqueda tolerante a tipeo.
- `logs (traslado_id, ts desc)` — timeline de actividad siempre más reciente primero.
- `solicitudes (estado)` WHERE `estado = 'pendiente'` (índice parcial) — bandeja del taller.
- `conductor_locations (traslado_id, ts desc)` — posición en tiempo real.
- `usage_counters (grupo_id, periodo)` — consulta de cuota actual.
- `audit_events (grupo_id, ts desc)` — log de auditoría del grupo.
- `user_sucursal_access (usuario_id)` — resolución de alcance en cada request.
- `seguros_externos (grupo_id, vigente_desde desc)` — resolución de la póliza vigente sin escanear el histórico.

---

## Lo que NO está en este documento

- Historial de mensajes WhatsApp — pendiente de decidir si se almacena aquí o se
  delega al proveedor.
- Triggers de `updated_at` (función `moddatetime` estándar de Supabase).
- Políticas RLS concretas por tabla — la lógica de alcance está descrita arriba,
  el SQL exacto se escribe con las migraciones.
- Migraciones SQL — este documento es la propuesta.
