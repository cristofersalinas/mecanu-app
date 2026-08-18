# Permisos, roles y autorización — Mecanu

## Separación en tres capas

Una acción se autoriza solo si las **tres** capas la permiten. No hay atajos ni
orden alternativo:

| Capa | Responde | Dónde vive |
|---|---|---|
| **Permisos del rol** | ¿Este rol puede intentarlo? | Código (`src/lib/mecanu/permisos.ts`) |
| **Features de la organización** | ¿Este grupo tiene ese producto activado? | Base de datos (`org_feature_switches`, ver `MODELO-DATOS.md`) |
| **Invariantes del pipeline** | ¿Es posible en absoluto, sin importar quién lo pida? | Código (`src/lib/mecanu/`) |

**Las invariantes del pipeline no las anula ningún permiso ni ningún plan — ni el
admin de Mecanu.** Que Prospectos sea la única columna arrastrable, o que solo el
conductor mueva los subestados de EN RUTA, no son reglas que un rol de más
privilegio pueda saltarse. Ver la sección dedicada al final de este documento.

---

## Los cinco roles

Fijos, definidos por Mecanu. Ningún taller crea roles propios.

| Rol | Quién lo tiene | Grupo al que pertenece (`user_org_roles.grupo_id`) |
|---|---|---|
| `mecanu_admin` | Empleados de Mecanu (soporte, operaciones) | Siempre el grupo `tipo='mecanu'` |
| `grupo_admin` | Dueño o gestor de un Grupo de Talleres | El grupo del taller |
| `sucursal_admin` | Responsable operativo — cubre tanto administración como el día a día del Panel | El grupo del taller |
| `conductor_interno` | Conductor empleado/contratado directo del taller | El grupo del taller |
| `conductor_flota` | Conductor de la red Mecanu, asignado puntualmente a talleres | Siempre el grupo `tipo='mecanu'` |

**Nota de diseño**: la versión anterior de este documento tenía un rol `operador`
separado de `sucursal_admin`, y un rol único `conductor` sin distinguir interno de
flota. Esta pasada los consolida: `operador` se pliega en `sucursal_admin` (el
alcance granular ya lo resuelve `user_sucursal_access`, no hacía falta un rol
aparte para eso — ver `MODELO-DATOS.md`), y `conductor` se divide en
`conductor_interno`/`conductor_flota` porque, aunque ambos tienen los mismos
permisos, difieren en membresía de grupo y en la matriz de responsabilidad de
seguro (`SEGUROS.md`). Si en el futuro hace falta un rol de menor privilegio que
`sucursal_admin` para el día a día, se reintroduce explícitamente — no se
resuelve con un `if` ad-hoc en el código.

---

## Catálogo de permisos

| Permiso | Descripción |
|---|---|
| `ruta.crear` | Crear una nueva ruta (prospecto o agendado) |
| `ruta.cancelar.cualquiera` | Cancelar cualquier ruta |
| `ruta.mover` | Arrastrar rutas en el kanban — invariante: solo funciona en Prospectos |
| `traslado.asignar.cualquiera` | Asignar cualquier conductor a un traslado desde el Panel |
| `traslado.avanzar.propio` | Avanzar el subestado del propio traslado (invariante: solo el conductor, R7) |
| `traslado.solicitar` | Crear una `solicitud` (propuesta que el taller ejecuta) |
| `solicitud.resolver` | Resolver solicitudes pendientes del conductor |
| `campana.crear` | Crear campañas manuales |
| `campana.avanzar` | Mover campañas entre estados |
| `presupuesto.ver` | Ver el desglose de presupuesto |
| `presupuesto.editar` | Editar líneas del presupuesto |
| `presupuesto.solo_total` | Activar modo solo-total |
| `cliente.ver_datos_reales` | Ver teléfono y dirección sin enmascarar |
| `conductor.ver` | Ver la lista de conductores y sus datos |
| `conductor.crear` | Añadir un conductor nuevo |
| `conductor.asignar_ruta` | Asignar conductor a un traslado desde el Panel |
| `vehiculo.actualizar_km` | Actualizar km del vehículo vía API del conductor |
| `incidencia.reportar` | Reportar un siniestro o incidencia |
| `configuracion.ver_plan` | Ver plan actual, contadores de uso y excedentes |
| `configuracion.cambiar_plan` | Cambiar el plan del Grupo |
| `configuracion.switches` | Activar / desactivar feature switches del Grupo |
| `impersonacion.usar` | Actuar como otro usuario (soporte Mecanu) |
| `audit.ver` | Ver el log de auditoría del Grupo |
| `panel.acceder` | Acceder a `/panel` |
| `conductor_app.acceder` | Acceder a `/conductor` |

---

## Matriz rol → permisos (tal como quedará en `permisos.ts`)

| Permiso | mecanu_admin | grupo_admin | sucursal_admin | conductor_interno | conductor_flota |
|---|:---:|:---:|:---:|:---:|:---:|
| `ruta.crear` | ✓ | ✓ | ✓ | — | — |
| `ruta.cancelar.cualquiera` | ✓ | ✓ | ✓ | — | — |
| `ruta.mover` | ✓ | ✓ | ✓ | — | — |
| `traslado.asignar.cualquiera` | ✓ | ✓ | ✓ | — | — |
| `traslado.avanzar.propio` | ✓ | — | — | ✓ | ✓ |
| `traslado.solicitar` | — | — | — | ✓ | ✓ |
| `solicitud.resolver` | ✓ | ✓ | ✓ | — | — |
| `campana.crear` | ✓ | ✓ | ✓ | — | — |
| `campana.avanzar` | ✓ | ✓ | ✓ | — | — |
| `presupuesto.ver` | ✓ | ✓ | ✓ | — | — |
| `presupuesto.editar` | ✓ | ✓ | ✓ | — | — |
| `presupuesto.solo_total` | ✓ | ✓ | ✓ | — | — |
| `cliente.ver_datos_reales` | ✓ | ✓ | ✓ | — | — |
| `conductor.ver` | ✓ | ✓ | ✓ | — | — |
| `conductor.crear` | ✓ | ✓ | ✓ | — | — |
| `conductor.asignar_ruta` | ✓ | ✓ | ✓ | — | — |
| `vehiculo.actualizar_km` | ✓ | — | — | ✓ | ✓ |
| `incidencia.reportar` | ✓ | — | — | ✓ | ✓ |
| `configuracion.ver_plan` | ✓ | ✓ | ✓ | — | — |
| `configuracion.cambiar_plan` | ✓ | ✓ | — | — | — |
| `configuracion.switches` | ✓ | ✓ | — | — | — |
| `impersonacion.usar` | ✓ | — | — | — | — |
| `audit.ver` | ✓ | ✓ | — | — | — |
| `panel.acceder` | ✓ | ✓ | ✓ | — | — |
| `conductor_app.acceder` | ✓ | — | — | ✓ | ✓ |

`conductor_interno` y `conductor_flota` tienen el mismo conjunto de permisos —
la diferencia entre ellos no es de capacidad, es de membresía de grupo (afecta
`user_sucursal_access` y RLS) y de qué cobertura de seguro aplica por defecto
(`SEGUROS.md`). Si algún día necesitan permisos distintos, la matriz cambia sin
tocar el resto del sistema.

---

## `src/lib/mecanu/permisos.ts` (por crear)

```typescript
export type Rol =
  | 'mecanu_admin'
  | 'grupo_admin'
  | 'sucursal_admin'
  | 'conductor_interno'
  | 'conductor_flota';

export type Permiso =
  | 'ruta.crear'
  | 'ruta.cancelar.cualquiera'
  | 'ruta.mover'
  | 'traslado.asignar.cualquiera'
  | 'traslado.avanzar.propio'
  | 'traslado.solicitar'
  | 'solicitud.resolver'
  | 'campana.crear'
  | 'campana.avanzar'
  | 'presupuesto.ver'
  | 'presupuesto.editar'
  | 'presupuesto.solo_total'
  | 'cliente.ver_datos_reales'
  | 'conductor.ver'
  | 'conductor.crear'
  | 'conductor.asignar_ruta'
  | 'vehiculo.actualizar_km'
  | 'incidencia.reportar'
  | 'configuracion.ver_plan'
  | 'configuracion.cambiar_plan'
  | 'configuracion.switches'
  | 'impersonacion.usar'
  | 'audit.ver'
  | 'panel.acceder'
  | 'conductor_app.acceder';

const PERMISOS_PANEL_COMPLETO: Permiso[] = [
  'ruta.crear', 'ruta.cancelar.cualquiera', 'ruta.mover',
  'traslado.asignar.cualquiera', 'solicitud.resolver',
  'campana.crear', 'campana.avanzar',
  'presupuesto.ver', 'presupuesto.editar', 'presupuesto.solo_total',
  'cliente.ver_datos_reales', 'conductor.ver', 'conductor.crear',
  'conductor.asignar_ruta', 'panel.acceder',
];

const PERMISOS_CONDUCTOR: Permiso[] = [
  'traslado.avanzar.propio', 'traslado.solicitar',
  'vehiculo.actualizar_km', 'incidencia.reportar', 'conductor_app.acceder',
];

const MATRIZ: Record<Rol, ReadonlySet<Permiso>> = {
  mecanu_admin: new Set([
    ...PERMISOS_PANEL_COMPLETO, ...PERMISOS_CONDUCTOR,
    'configuracion.ver_plan', 'configuracion.cambiar_plan', 'configuracion.switches',
    'impersonacion.usar', 'audit.ver',
  ]),
  grupo_admin: new Set([
    ...PERMISOS_PANEL_COMPLETO,
    'configuracion.ver_plan', 'configuracion.cambiar_plan', 'configuracion.switches',
    'audit.ver',
  ]),
  sucursal_admin: new Set([
    ...PERMISOS_PANEL_COMPLETO,
    'configuracion.ver_plan',
  ]),
  conductor_interno: new Set(PERMISOS_CONDUCTOR),
  conductor_flota: new Set(PERMISOS_CONDUCTOR),
};

export function rolTienePermiso(rol: Rol, permiso: Permiso): boolean {
  return MATRIZ[rol].has(permiso);
}
```

Ningún string suelto en código de negocio: siempre se importa `Permiso` y se
llama a `rolTienePermiso`, nunca se compara `rol === 'admin'` a mano. **Si
aparece un `if (rol === 'algo')` fuera de este archivo, es un bug a corregir** —
ver la función de autorización única más abajo, que es el único punto de entrada
permitido.

---

## Features en base de datos

Catálogo y estado por grupo — esquema completo en `MODELO-DATOS.md`
(`feature_switches_catalog`, `org_feature_switches`).

| Feature | `activo_global` | Incluido por defecto en | Descripción |
|---|:---:|---|---|
| `gps_tracking` | OFF | Alta | Trail GPS del conductor durante el traslado |
| `campanas_auto` | ON | Alta | Campañas automáticas desde hallazgos de check-in |
| `checkin_video` | OFF | Alta | Video de 30 s obligatorio en el check-in |
| `ia_diagnostico` | OFF | Alta | Preview de diagnóstico IA en hallazgos de inspección |
| `seguro_demanda` | **OFF** | Lujo | Seguro Mecanu bajo demanda por traslado — **en espera de producto**, ver `AGENTS.md` |
| `whatsapp_propio` | OFF | Lujo | Número WhatsApp Business propio del Grupo |
| `notificaciones_push` | OFF | Lujo | Push al conductor |

**Cascada** (repetida aquí por claridad, detalle completo en `MODELO-DATOS.md`):
1. `activo_global = false` → nadie lo ve, sin importar plan ni override.
2. `activo_global = true` → el acceso lo determina el plan del grupo (mapeo
   `PLAN_FEATURES_DEFAULT` en código) o una fila `origen = 'excepcion'` en
   `org_feature_switches` que lo activa/desactiva manualmente fuera de lo que el
   plan incluye.

---

## Estructura organizativa y de acceso (resumen — ver `MODELO-DATOS.md`)

```sql
grupos (id, tipo, nombre, ...)         -- tipo: 'taller' | 'mecanu'
sucursales (id, grupo_id, ...)
user_org_roles (usuario_id, grupo_id, rol, alcance_todas_sucursales)  -- PK (usuario_id, grupo_id): un rol por persona por grupo
user_sucursal_access (usuario_id, sucursal_id)                       -- alcance explícito, usado solo si alcance_todas_sucursales = false; validado contra el grupo de la membresía (ver MODELO-DATOS.md)
```

Sin FK polimórfica, sin columnas nullable condicionales. `grupo_id` siempre
referencia una fila real de `grupos` — Mecanu es un grupo más (`tipo = 'mecanu'`),
no un caso especial.

**PK de `user_org_roles` es `(usuario_id, grupo_id)`, no `(usuario_id, rol,
grupo_id)`** — corregido tras la revisión de esta pasada. Con `rol` dentro de la
PK, la misma persona podía tener dos roles simultáneos en el mismo grupo (por
ejemplo `conductor_interno` y `conductor_flota` a la vez, algo prohibido por
regla de negocio), y la función de alcance por sucursal no tenía forma de saber
cuál de los dos aplicaba. Con la PK corregida, **un usuario tiene como máximo un
rol por grupo** — `ctx.rol` en `ContextoUsuario` (más abajo) ya no es ambiguo
por construcción, es literalmente el único rol posible para esa combinación
usuario/grupo.

**El alcance por sucursal ya no es "cero filas = todas".** Es una columna
explícita: `alcance_todas_sucursales boolean not null default false`. Con el
default en `false`, una fila de membresía recién creada sin filas de
`user_sucursal_access` no ve ninguna sucursal — el fallo de datos más probable
(olvidar insertar el alcance) deja al usuario sin acceso, nunca con acceso
ampliado. Esto también resuelve lo que antes era un caso especial de `grupo_admin`
en RLS: un `grupo_admin` con visión reducida a un subconjunto de sucursales es,
sencillamente, `alcance_todas_sucursales = false` más sus filas — no hace falta
un sexto rol, y la política RLS ya no distingue `grupo_admin` de `sucursal_admin`
(ver `MODELO-DATOS.md`, sección RLS).

---

## Función de autorización única

Toda comprobación de permisos pasa por una sola función en
`src/lib/mecanu/autorizacion.ts` (por crear). Ningún endpoint ni componente
comprueba roles a mano.

```typescript
export interface ContextoUsuario {
  usuarioId: string;
  rol: Rol;
  grupoId: string;
}

export type ResultadoAutorizacion =
  | { autorizado: true }
  | {
      autorizado: false;
      motivo: 'permiso_denegado' | 'feature_no_disponible' | 'fuera_de_alcance' | 'conductor_no_activo';
    };

export async function autorizar(
  ctx: ContextoUsuario,
  permiso: Permiso,
  opciones?: { feature?: FeatureName; sucursalId?: string },
): Promise<ResultadoAutorizacion> {
  // 1. Permisos del rol
  if (!rolTienePermiso(ctx.rol, permiso)) {
    return { autorizado: false, motivo: 'permiso_denegado' };
  }

  // 2. Features de la organización
  if (opciones?.feature && !(await featureActivaParaGrupo(ctx.grupoId, opciones.feature))) {
    return { autorizado: false, motivo: 'feature_no_disponible' };
  }

  // 3. Sucursal dentro del alcance del usuario
  if (opciones?.sucursalId && !(await sucursalEnAlcance(ctx.usuarioId, ctx.grupoId, opciones.sucursalId))) {
    return { autorizado: false, motivo: 'fuera_de_alcance' };
  }

  // 4. Estado operativo del conductor — NO es opcional, no depende de que el
  //    caller lo pida. Ver nota "Por qué este chequeo no es un parámetro" abajo.
  if (esRolConductor(ctx.rol) && !(await conductorPuedeOperar(ctx.usuarioId))) {
    return { autorizado: false, motivo: 'conductor_no_activo' };
  }

  return { autorizado: true };
  // 5. La operación de dominio, si autorizado === true, sigue con sus propias
  //    invariantes de pipeline (ver sección siguiente) — esta función no las
  //    conoce ni las evalúa, son incondicionales para cualquier rol.
}

function esRolConductor(rol: Rol): boolean {
  return rol === 'conductor_interno' || rol === 'conductor_flota';
}

async function conductorPuedeOperar(usuarioId: string): Promise<boolean> {
  const conductor = await repo.getConductorPorUsuario(usuarioId);
  return conductor?.proceso === 'activo';
}

async function sucursalEnAlcance(usuarioId: string, grupoId: string, sucursalId: string): Promise<boolean> {
  const membresia = await repo.getMembresia(usuarioId, grupoId);
  if (membresia.alcanceTodasSucursales) {
    return repo.sucursalPerteneceAGrupo(sucursalId, grupoId);
  }
  const accesos = await repo.listSucursalAccess(usuarioId);
  // Sin filas + alcanceTodasSucursales = false → cero acceso, no acceso total.
  return accesos.some((a) => a.sucursalId === sucursalId);
}
```

**Por qué el chequeo de estado del conductor no es un parámetro opcional**: la
primera versión de este diseño lo hacía condicional a que el caller pasara
`opciones.conductorId` — y eso es, en sí mismo, otra forma de fail-open: un
endpoint que se olvida de pasar ese dato salta el bloqueo en silencio, sin que
sea un problema de datos en la base sino un bug de un desarrollador futuro. La
versión de arriba lo corrige derivando la comprobación directamente de
`ctx.rol`: si el actor tiene un rol de conductor, el chequeo de `proceso =
'activo'` **siempre** se ejecuta dentro de `autorizar()`, sin que ningún caller
tenga que acordarse de pedirlo.

Los pasos 1 a 4 son el filtro genérico; el quinto (invariantes) vive dentro de
la propia operación de dominio (`crearRuta`, `avanzarSubestado`...) y se ejecuta
siempre, sin excepción de rol, después de que `autorizar()` devuelva
`autorizado: true`.

---

## Tests obligatorios de `autorizacion.ts`

Por la regla 5 de `AGENTS.md` ("todo cambio en `src/lib/mecanu/` requiere un
test que lo cubra"). Al crear `autorizacion.ts`, `src/lib/mecanu/autorizacion.test.ts`
debe cubrir explícitamente, como mínimo:

1. **Fail-closed por defecto (caso central de §32)**: un `sucursal_admin` con
   `alcance_todas_sucursales = false` y **cero filas** en `user_sucursal_access`
   no ve ningún traslado — `sucursalEnAlcance` devuelve `false` para cualquier
   `sucursalId`, y `autorizar()` devuelve `motivo: 'fuera_de_alcance'`. Este es
   el test que verifica que el default restrictivo funciona como se diseñó, no
   solo que existe en el schema.
2. `alcance_todas_sucursales = true` → `sucursalEnAlcance` es `true` para
   cualquier sucursal del grupo, incluso con cero filas en `user_sucursal_access`.
3. `grupo_admin` con `alcance_todas_sucursales = false` y N filas → solo ve esas
   N sucursales, exactamente igual que un `sucursal_admin` en la misma situación
   (la política ya no distingue por rol).
4. Un `conductor_interno` con `proceso = 'documentos_pendientes'` → `autorizar()`
   devuelve `motivo: 'conductor_no_activo'` para `traslado.avanzar.propio`,
   aunque el rol tenga el permiso y la sucursal esté en su alcance.
5. El mismo conductor con `proceso = 'activo'` → autorizado, mismo permiso.
6. `seguro_demanda` en espera de producto: un test fuerza
   `feature_switches_catalog.activo_global = true` solo en el entorno de test
   (nunca en el catálogo real) para mantener ejercitada la ruta de asignación de
   seguro bajo demanda — ver `AGENTS.md` regla 9.

---

## Invariantes de pipeline (capa 3 — no son permisos)

Estas reglas se aplican independientemente del rol del usuario. No hay permiso
ni feature que las desbloquee. Viven en `src/lib/mecanu/` y se verifican en el
servidor antes de cualquier mutación:

1. **Solo Prospectos es arrastrable.** El drag & drop de Kanban está desactivado
   para todas las columnas excepto Prospectos, para cualquier rol.

2. **Los 4 subestados de EN RUTA solo los mueve el conductor.** `POST
   /api/v1/traslados/:id/subestado` verifica que el usuario autenticado tiene
   `conductor_id = tramo.conductorId`. No existe override de Panel para este
   endpoint, ni siquiera para `mecanu_admin` actuando por soporte — si hace
   falta simular esto en soporte, se usa `impersonacion.usar` para actuar
   literalmente como ese conductor, no un bypass de la regla.

3. **Ventana horaria: siempre rango de 1 h, nunca hora exacta.** El servidor
   rechaza `ventana_inicio == ventana_fin`.

4. **Cancelado exige motivo.** Constraint en BD:
   `check (estado <> 'cancelado' OR motivo IS NOT NULL)`.

5. **Check-in: mínimo 4 fotos.** El schema Zod del endpoint `/checkin` valida
   `fotos.length >= 4` antes de persistir.

6. **El total del presupuesto siempre incluye la línea de traslado.**

7. **Evidencia sellada.** `REVOKE UPDATE ON inspecciones FROM authenticated`.
