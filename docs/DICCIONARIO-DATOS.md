# Diccionario de datos — hechos

Qué significa cada palabra del modelo. No es una opinión ni un plan: es lo
que hay hoy en `supabase/migrations/` y en la UI de Supabase (descripción de
tabla y de columna, migraciones `0010` y `0011`).

Las formas TypeScript siguen en `src/lib/mecanu/types.ts`. Los estados y tags
siguen en `src/lib/mecanu/mecanu-pipeline.ts`. Si una frase de aquí choca con
una migración, gana la migración.

Cómo verlo en Supabase: Table Editor → elige la tabla → el texto bajo el
nombre es el comentario. Cada columna tiene el suyo en el inspector.

## Palabras que se confunden

| Palabra | Qué es | Qué no es |
|---|---|---|
| **Taller** (`talleres`) | Un negocio cliente de Mecanu. Un tenant. | Un sitio físico genérico. El local del proveedor en una parada es otro dato. |
| **Ruta** (`rutas`, id `TR-*`) | La orden. La card del kanban. Aquí vive el estado del negocio. | El tramo que conduce alguien. Eso es un traslado. |
| **Parada** (`paradas`, id `PD-*`) | Un sitio en la ruta (casa del cliente, taller, ITV…). | Un viaje. |
| **Traslado / tramo** (`traslados`, id `TS-*`) | Un desplazamiento entre dos paradas (ida, vuelta o interno). Tiene su propio estado de ejecución. | La orden. El dinero de la reparación. |
| **Ventana** | Franja de 1 hora (`inicio`–`fin`), nunca una hora exacta. Si no hay ventana comprometida, no se inventa. | «A las 10:00». |
| **Campaña** (`campanas`, id `OP-*` / `CMP-*`) | Oportunidad de upsell (algo detectado o creado a mano). | El presupuesto. La ruta. |
| **Presupuesto** (`presupuestos`, id `PR-*`) | La cifra. Fuente única de dinero. Vive en Campañas. El total incluye el traslado. | Un importe suelto en la ruta. Un «precio del traslado» aparte. |
| **Línea** (`presupuesto_lineas`) | Un renglón del presupuesto. Origen: inspección, manual o traslado. | El total. |
| **Tempario / servicio** (`servicios`, id `SV-*`) | Catálogo de precios del taller. `SV-11` es el traslado. | El presupuesto de una ruta concreta. |
| **Inspección** (`inspecciones`, id `CHK-*`) | Check-in o check-out del coche. Una vez creada, no se edita (evidencia sellada). | Una foto suelta. Una campaña. |
| **Solicitud** (`solicitudes`) | El conductor pide algo al taller: reagendar, rechazo, origen fallido, no rodante. | Un log. Un cambio de estado ya hecho. |
| **Log** (`logs`, id `LG-*`) | Qué pasó, cuándo, quién lo disparó. Cuelga del traslado. | El estado actual. |
| **Contacto** | Persona ligada a un coche. Se deriva de `vehiculo_clientes`. | Una copia del cliente pegada en el vehículo. |
| **Cliente** (`clientes`) | Persona (Particular). No hay tipo Empresa. | El taller. El conductor. |
| **Perfil** (`perfiles`) | Quién puede entrar (login). Apunta a `auth.users`. | El cliente del coche. |
| **Tag** | Etiqueta de la ruta. Los **manuales** se guardan; los **derivados** se calculan al leer y no se persisten. | Un estado. |

## Cómo se encajan

```
taller
 └── cliente ──┐
 └── vehiculo ─┴── vehiculo_clientes (quién es quién en ese coche)
 └── ruta (la orden, estado del negocio)
      ├── paradas (sitios)
      ├── traslados (tramos; estado de ejecución + ventana + seguro)
      │    └── logs
      ├── solicitudes (el conductor pide; el taller resuelve)
      └── presupuesto_id → presupuesto (se lee; no se duplica el dinero)
 campaña (upsell)
      ├── campana_items (neumáticos, frenos…)
      └── presupuestos.campana_id  (el dinero vive aquí)
 inspección (check-in / check-out, inmutable)
      ├── inspeccion_danos
      └── inspeccion_hallazgos  → puede originar una campaña
```

## Hechos cerrados (no se reabren)

1. El estado del negocio vive en la **ruta**, no en el traslado.
2. El traslado tiene estado de ejecución propio (`sin_agenda` → `agendado` → `en_curso` → `completado` / `cancelado`).
3. Solo Prospectos se arrastra en el kanban. En ruta, los subestados los mueve el conductor.
4. Un solo dinero: el total del presupuesto **incluye** la línea de traslado (`SV-11`).
5. El presupuesto vive en Campañas. Desde Traslados / la ficha de ruta solo se lee.
6. Contactos del vehículo = relación m2m. No se duplican.
7. Sin dato → se dice «no hay dato». Nunca relleno inventado.
8. Cancelar una ruta exige `motivo`.
9. Cobertura de seguro es un dato del traslado y tiene que poder verse siempre en la UI.
10. Cada taller ve solo lo suyo (`taller_id`). Dueño / ops del backoffice puede ver todos.
11. Cliente = Particular. Migración `0009`.
12. Ids conservados: `TR-*` ruta, `PD-*` parada, `TS-*` traslado, `LG-*` log, `PR-*` presupuesto.

## Tablas (una frase)

| Tabla | Prefijo / clave | Significado |
|---|---|---|
| `talleres` | `taller-…` | Tenant. Negocio que usa Mecanu. |
| `clientes` | `c…` | Persona del coche. Siempre Particular. |
| `vehiculos` | `v…` | El coche. El km vive aquí, no en el traslado. |
| `vehiculo_clientes` | par (vehículo, cliente) | Titular, cónyuge, autorizada… |
| `conductores` | `d…` | Quien mueve el coche. Interna o Externo Mecanu. |
| `conductor_incidencias` | uuid | Historial de incidencias del conductor. |
| `servicios` | `SV-…` | Tempario. `total` / `total_iva` no se guardan: se calculan. |
| `perfiles` | uuid = `auth.users` | Login: dueño, operación, conductor, ops. |
| `impersonation_sessions` | uuid | El dueño entra «como» un taller o un conductor. |
| `rutas` | `TR-…` | La orden. Kanban. |
| `paradas` | `PD-…` | Sitios de la ruta. `etiqueta` no se guarda: se calcula. |
| `parada_servicios` | uuid | Qué se hace en esa parada (texto). |
| `traslados` | `TS-…` | Tramo. Ventana, conductor, seguro, importe de esa línea. |
| `logs` | `LG-…` | Cronología del tramo. |
| `solicitudes` | texto | Petición del conductor al taller. |
| `campanas` | `OP-…` / `CMP-…` | Upsell. El presupuesto no se guarda aquí como columna: está al revés (`presupuestos.campana_id`). |
| `campana_items` | `OP-…-n` | Hallazgos de la campaña (confirmado vs estimado). |
| `presupuestos` | `PR-…` | El dinero. |
| `presupuesto_lineas` | uuid | Renglones. Origen visible. |
| `inspecciones` | `CHK-…` | Check-in / check-out. Sin UPDATE. |
| `inspeccion_danos` | uuid | Golpes / zonas. |
| `inspeccion_hallazgos` | uuid | Wear & tear. Precio copiado en el momento (no FK viva al tempario). |
| `idempotency_keys` | la key | Para no duplicar escrituras del conductor sin red. Purgar a las 48 h. |
| `security_events` | identity | Señuelos y abuso. Migración `0005`: existe en repo; el script de migrate **no** la aplica hasta que el acceso esté testeado. |
| `auditoria` | identity | Quién cambió clientes, coches, presupuestos o perfiles. No es el timeline de un viaje. |
| `vista_rutas` | vista | Una fila por orden, lista para SQL. PII enmascarada. |
| `vista_presupuestos` | vista | Una fila por presupuesto + cliente + matrícula + desglose traslado/reparación (análisis; el total sigue siendo uno). |
| `vista_campanas` | vista | Una fila por upsell. |
| `vista_clientes` | vista | Clientes con teléfono/email/dirección/documento enmascarados. |

## SQL de analista (sin encadenar joins)

En el SQL Editor de Supabase:

```sql
-- Kanban: cuántas órdenes hay en cada estado
select estado, count(*) from vista_rutas group by 1 order by 1;

-- Dinero aceptado
select sum(total) from vista_presupuestos where estado = 'aceptada';

-- Qué campañas siguen abiertas
select id, cliente, matricula, presupuesto_estado, presupuesto_total
from vista_campanas
where presupuesto_estado in ('nueva', 'valorada', 'enviada');
```

Las tablas de negocio no se aplanan: se duplicaría el dinero y se romperían las reglas. Las `vista_*` calculan al vuelo (`security_invoker`: sigue valiendo el RLS del taller).

## Auditoría vs log de viaje

| | `logs` | `auditoria` |
|---|---|---|
| Qué | El conductor llegó, cambió de estado, mandó una foto | Alguien cambió un cliente, un coche, un presupuesto o un perfil |
| Cuándo mirarla | Ficha de la ruta | «¿Quién tocó este DNI / este total?» |

`created_at` / `updated_at` dicen *cuándo*, no *quién*. Eso lo cubre `auditoria.actor_id`.

## Cifrado (hecho, no plan)

- Disco y tránsito: los cifra Supabase (AES en reposo, TLS).
- Contraseñas: las guarda Auth, hasheadas. No están en `perfiles`.
- Fotos y firmas: bucket privado `evidencias`.
- **No se cifran columnas** de teléfono, email, matrícula ni dirección. Si se cifraran, un analista no podría hacer `where matricula = …` ni un join, que es justo lo contrario de lo que pedimos.
- PII en listados y en `vista_*`: enmascarada. El dato real sigue en `clientes` para operar (llamar, navegar) y queda en `auditoria` cuando cambia.

## Campos provisionales (`REVISAR`)

Siguen en la ruta / el traslado porque nadie los ha mudado aún. No son el diseño final:

- En **ruta**: `vehiculo_listo`, `incidencia`, `matricula_lead`, `link_token`, `link_enviado_en` (estos tres últimos irían a una entidad Oferta).
- En **traslado**: `propuesta_fecha` / `propuesta_inicio` / `propuesta_fin` (ventana tentativa).

## Lo que no es una tabla

- **Ruta vista**: en la app, `vistaRuta()` / `RUTAS_VISTA`. En SQL, `vista_rutas`. No se guarda una copia: se calcula.
- **Tags derivados**: se calculan. No hay columna.
- **Barrio / ciudad del cliente**: se derivan de `direccion`. No se duplican.
- **Etiqueta de parada**: se calcula de tipo + subtipo.
- **Total IVA del tempario**: `mano_obra + materiales` × IVA. No hay columnas `total` / `total_iva` en `servicios`.
- **Contactos del vehículo**: no hay tabla `contactos`.

## Auth y aislamiento (hechos de acceso)

- `perfiles.rol`: `dueno` | `operacion` | `conductor` | `ops`.
- El taller del usuario va en el JWT (`app_metadata.taller_id`), nunca en `user_metadata`.
- RLS: misma fila de taller, o dueño/ops ve todo. Hijos sin `taller_id` (paradas, traslados, logs…) entran por la ruta padre.
- Fotos de inspección: bucket privado `evidencias`, ruta `{taller_id}/{ruta_id}/{filename}`.

## Dinero

- Tipo: `numeric(10,2)`, nunca float.
- IVA: el presupuesto declara `iva_incluido` (por defecto sí). En UI, siempre se indica.
- Formato en pantalla: `1.234,56 €`.
