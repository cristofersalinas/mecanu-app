# Decisiones estratégicas — Mecanu

Este archivo es el **razonamiento**: qué se eligió, qué se descartó y por qué.
No sustituye las reglas operativas (`AGENTS.md`), el modelo de producto
(`CLAUDE.md`), ni el schema (`MODELO-DATOS.md`). Si una propuesta contradice
este archivo, no se improvisa: se discute y se actualiza aquí.

Formato de cada entrada: **decidido** / **descartado** / **por qué**.
Las que tocan schema, permisos o migraciones siguen siendo propuestas hasta
que el fundador confirme aplicarlas. Los 4 bloques SQL están **escritos y no
aplicados**.

---

## D1. Multi-tenant desde el día uno

**Decidido.** Un solo proyecto Supabase para todos los grupos, con
`grupo_id` / `sucursal_id` y RLS separando filas. Mecanu es un grupo más
(`grupos.tipo = 'mecanu'`, índice único parcial). Clientes y vehículos
cuelgan del **grupo**; las rutas, de la **sucursal**. Dos proyectos
Supabase: `mecanu-dev` y producción. Nunca apuntar desarrollo a prod.

**Descartado.** Un proyecto Supabase por taller (aislamiento “fácil” a
costa de ops). Tenant solo en aplicación, sin RLS. Cliente/vehículo por
sucursal (duplicaba al cliente que va a dos sedes). Empezar en single-tenant
“y ya lo partimos”.

**Por qué.** El aislamiento real está en Postgres, no en un `if` de
Next. Un schema multi-tenant después de tener datos es de lo más caro de
revertir. Mecanu-como-fila evita FKs polimórficas y casos especiales de
soporte. Dev/prod separados porque un `service_role` o un seed a destiempo
en producción no tiene marcha atrás limpia.

---

## D2. Autorización en tres capas

**Decidido.** Una acción solo pasa si las **tres** capas la permiten, en
este orden:

1. **Permisos del rol** — código (`permisos.ts` / `autorizar()`).
2. **Features del grupo** — BD (`org_feature_switches` + catálogo; un
   `activo_global = false` apaga el producto para todos).
3. **Invariantes del pipeline** — código de dominio. Nadie las anula, ni
   `mecanu_admin`. Prospectos es la única columna arrastrable; los
   subestados de EN RUTA solo los mueve el conductor; ventana de 1 h;
   cancelado exige motivo; evidencia de inspección sellada.

**Descartado.** Roles en BD editables por el taller. “El admin se salta
el kanban.” Features hardcodeadas en el plan. Permisos solo en RLS o solo
en UI.

**Por qué.** El rol responde “¿puedes intentarlo?”. El feature responde
“¿este taller tiene ese producto?”. El pipeline responde “¿el mundo físico
de Mecanu lo permite?”. Mezclar las tres produce o agujeros (el admin
arrastrando Agendado) o producto rígido (apagar WhatsApp exige deploy).
Límites, cuotas y precios viven en BD; strings de estado, en
`mecanu-pipeline.ts`.

---

## D3. App del conductor = PWA, no nativa

**Decidido.** `/conductor` es PWA instalable, offline-first: cola local,
reintento de la misma tarea, `Idempotency-Key` en `/api/v1/*`. El panel
es web de escritorio, Server Actions, sin offline.

**Descartado.** App nativa (React Native / Flutter) en esta fase. Un
único cliente “responsive” para taller y conductor. Service Worker que
reintente POST (competiría con la cola de React).

**Por qué.** Un fundador solo no mantiene dos codebases nativas. La PWA
cubre calle + mala red sin App Store. El conductor necesita un contrato
HTTP versionado porque reintenta horas después; el panel no. Native se
reabre si un día el offline-en-pestaña o el GPS en segundo plano no
bastan — no ahora.

---

## D4. Un solo Next.js, dos route groups

**Decidido.** Un proyecto, dos superficies:
`(taller)/panel` y `(conductor)/conductor`. Comparten `src/lib/mecanu` y
el design system. No comparten pantallas ni estado de UI. Manifest y SW
solo se registran en el layout del conductor.

**Descartado.** Dos repos / dos apps Next. Un solo árbol de componentes
con `if (esConductor)`. PWA en el layout raíz (ensuciaría `/panel`).

**Por qué.** Un `npm run build`, un preview de Vercel, un design system.
Separar portales en carpetas evita que un cambio de kanban rompa el
check-in. Dos repos duplicarían tipos y pipeline — el cuello de botella
es revisión humana, no el bundler.

**Revisado — agosto 2026, durante el primer deploy.** Se evaluó separar las
tres superficies a raíz de que el primer deploy publicara panel y conductor
sin quererlo. **Se mantiene el repo único.** Ese problema era de publicación,
no de estructura, y se resolvió con una condición de entorno (D13).

Que en producción solo se sirva la landing no reabre D4: son cosas distintas.
D4 es dónde vive el código; D13 es qué se sirve.

Quedan dos caminos anotados, por orden de coste:

| Opción | Cuándo | Coste |
|---|---|---|
| **Subdominios sobre el mismo deploy** — `mecanu.es` / `panel.mecanu.es` / `conductor.mecanu.es`, enrutado por host en `src/proxy.ts`. Un repo, una build, un deploy. | Si el motivo es **solo** tener URLs distintas por superficie. | Bajo. Un archivo + DNS, se revierte borrando líneas. |
| **Monorepo real** — `apps/web` + `apps/panel` + `apps/conductor`, design system y dominio como paquetes, tres proyectos de Vercel. | Solo cuando haga falta **desplegar cada superficie por separado de verdad** (deploys que se pisan, permisos de build distintos, alguien más tocando una sola superficie). | Alto. ~150 archivos movidos, imports reescritos, tres configs de Next y TS, layout raíz partido, CI rehecha. |

No se hace ninguna de las dos por incomodidad de que todo salga junto. El
orden mental no paga el coste de partir el repo trabajando solo.

---

## D5. Contador de traslados: se revierte si se cancela antes del día de servicio

**Decidido.** `traslados_creados` suma al **crear** la ruta (no al
completarla). Al cancelar:

| Situación | ¿Se revierte? |
|---|---|
| Sin día de servicio (sigue en Prospectos) | Sí |
| Antes del día de servicio | Sí |
| El mismo día o después | No — el cargo se queda |

Día de servicio = el `traslados.ventana_fecha` más temprano **en el
momento de cancelar**. Se decrementa el mes de **creación**. Un overage
ya escrito se marca `revertido = true` (no se borra). Queda
`audit_events`.

**Descartado.** Contar al completar (regalas el mes a quien crea y no
ejecuta). No revertir nunca (castigas un agendado que se cae con
margen). Borrar el overage. Revertir también el día D (el recurso ya
estaba reservado).

**Por qué.** El plan vende capacidad de crear trabajo. Cancelar con
margen no consume conductor ni calle; cancelar el día D sí. Historia de
facturación > “dejar la tabla limpia”.

---

## D6. Impersonación auditada, sin `BYPASSRLS`

**Decidido.** Soporte (`mecanu_admin`) entra a datos de un taller por
una rama `OR private.es_mecanu_admin()` **dentro de cada política RLS**.
Impersonar a un conductor para mover EN RUTA es `impersonacion.usar`:
actúas como él, no te saltas la invariante. Cada acceso de soporte deja
`audit_events`. Sin excepción, sin switch.

**Descartado.** `BYPASSRLS` / `service_role` en el cliente o en la
sesión de soporte. Un “modo dios” en aplicación que no pasa por RLS. Que
`mecanu_admin` mueva subestados de EN RUTA sin impersonar.

**Por qué.** `BYPASSRLS` es atributo del rol de Postgres; en Supabase
todos los `authenticated` lo comparten. Dárselo de verdad es ejecutar
como `service_role`, prohibido fuera de servidor. Un bypass de motor
**no puede** obligar a escribir auditoría: el agujero es silencioso.
Soporte que se salta el pipeline inventa estados que el producto no
contempla. El bloque 1 tiene riesgo de **recursión RLS**
(`es_mecanu_admin` lee `user_org_roles`, cuyas policies pueden volver a
llamar la función): tests de RLS **antes** de aplicar, y solo contra
`mecanu-dev`.

---

## D7. Jerarquía grupo → sucursal, un rol por grupo, alcance fail-closed

**Decidido.**

- `grupos` factura y tiene el plan/seguro; `sucursales` operan.
- `user_org_roles` PK `(usuario_id, grupo_id)`: **un rol por persona por
  grupo**. Roles fijos (no los crea el taller): `mecanu_admin`,
  `grupo_admin`, `sucursal_admin`, `conductor_interno`, `conductor_flota`.
- Alcance: `alcance_todas_sucursales boolean not null default false`.
  Cero filas en `user_sucursal_access` + default false = **cero acceso**.
- `conductor_flota` es miembro del grupo Mecanu; llega al taller por
  `user_sucursal_access` (pertenencia ≠ alcance). Trigger impide cruzar
  grupos salvo esa excepción.

**Descartado.** FK polimórfica `org_tipo`/`org_id`. PK con `rol` dentro
(permitía ser interno y flota a la vez). “Cero filas = ve todas”
(fail-open: olvidar el recorte regalaba el grupo entero). Rol `operador`
aparte de `sucursal_admin` (el recorte de sucursales ya lo resuelve el
alcance). Rol único `conductor`.

**Por qué.** Membresía y alcance son preguntas distintas. Fail-open en
permisos es el bug más caro y más invisible. Un rol por grupo hace
`ctx.rol` no ambiguo. Flota vs interno importa para seguro y para
cuotas, no para la matriz de botones.

---

## D8. Planes Alta / Lujo / Hyper: el límite no bloquea, cobra excedente

**Decidido.** Tres planes. Cuotas en BD (`plan_limites`), no en código.
Alta 20 rutas/mes, 3 conductores internos, 1 sucursal, 10 WhatsApp
(número Mecanu). Lujo 100 / 8 / 2 / WhatsApp ilimitado (número propio).
Hyper: límites y precio `null`, se factura fuera. El excedente de
traslados / conductores / sucursales **no bloquea** la acción: se crea
y se registra `usage_overages` con precio snapshot. Excepción: WhatsApp
en Alta es tope duro (`429`) — es el argumento de venta de Lujo.

**Descartado.** Soft-block con banner y “no puedes crear”. Un solo plan.
Límites por sucursal (el pool es del grupo). Precio de planes en
constantes TS. Contar `conductor_flota` contra la plantilla del taller.

**Por qué.** Un taller en hora punta no puede quedarse sin crear una
ruta por un paywall. El excedente es el producto; el bloqueo es
fricción que se lleva el cliente a otro. WhatsApp sí se corta en Alta
porque si se cobra por mensaje desaparece la razón de subir a Lujo.
Hyper negociado a mano: no fingir un catálogo que no existe.

---

## D9. Seguro en producto: cubierto / no cubierto

**Decidido (capa de producto / UI).** En cualquier vista de viaje el
taller y el conductor ven **cubierto o no cubierto**. La invariante
“cobertura siempre visible” se mantiene. El seguro Mecanu bajo demanda
sigue **apagado** (`seguro_demanda.activo_global = false`) hasta que
exista el producto asegurador.

**Descartado (en la UI).** Enseñar de entrada el árbol fino
(externo / mensual Mecanu / demanda / ninguno) y los semáforos de
caducidad de póliza como si fueran el modelo mental del operador.
Activar demanda “para verlo” en desarrollo normal.

**Por qué.** El operador necesita saber si ese viaje va cubierto, no
qué póliza legal hay detrás. El tipo fino (`traslados.seguro_tipo`)
**sigue en datos** para responsabilidad, facturación y el caso flota sin
cobertura Mecanu (eso no se colapsa en schema — Pasada B / `SEGUROS.md`).
Simplificar la UI no autoriza borrar la matriz legal.

---

## D10. Campañas: dos ejes, versionado por `es_actual`

**Decidido.** Detalle en `CAMPANAS-MODELO.md` (propuesta de schema, no
aplicada).

- Unidad atómica: **servicio-alerta** (cada hallazgo), no la campaña.
  Agrupar por coche es presentación. Vista: lista + filtro semáforo
  Mecanu, no kanban.
- Eje A, semáforo **calculado** (no se guarda): `vigente` / `por_vencer`
  / `vencido` según fecha recomendada y umbral 20 días.
- Eje B, avance comercial en la campaña/presupuesto: `sin_valorar` /
  `estimado` / `enviado` / `confirmado` / `rechazado`. El pipeline de
  hoy incluye además CADUCADO; en el rediseño el tiempo vive en el
  semáforo. `cancelado` (con motivo) es solo para presupuesto en vuelo
  que un check-in deja obsoleto.
- Alertas con semáforo `vigente` (fecha lejana): visibles, comercial
  bloqueado. Cliente que se adelanta → versionado, no envío.
- Nombres que no se mezclan: `es_actual` = esta lectura sigue valiendo
  (en el briefing, el flag “vigente = true/false”); `vigente` = semáforo
  de urgencia.
- Inspecciones y hallazgos **nunca** se borran ni se sobrescriben
  (evidencia sellada, también para seguro). El flag `es_actual` vive en
  la capa operativa, no en el hallazgo.

**Descartado.** Un solo pipeline de estados de campaña (mezclaba tiempo
del coche con gestión de venta). Sobrescribir el hallazgo al volver el
coche. Llamar `vigente` al flag y al semáforo. Anular/borrar el
presupuesto en vuelo.

**Por qué.** El neumático se gasta aunque no hayas mandado el WhatsApp.
La evidencia de una visita anterior es prueba. Si un presupuesto enviado
sigue vivo sobre un estado del coche que ya cambió, el cliente puede
aceptar un precio mentira — por eso se cancela con historia, no se
borra.

Schema de alertas (`campana_items` vs tabla `servicio_alertas`) y
catálogo de `componente_key`: **recomendados, no cerrados** — el
fundador decide (§13.1 y §13.4 de `CAMPANAS-MODELO.md`).

---

## D11. Diseño: ideal congelado, código como fuente de verdad

**Decidido.** `_diseno-ideal/` es el archivo visual de referencia
(Claude Design, congelado). El Cubo A (fidelidad de cards) ya se aplicó.
A partir de aquí **el código es la fuente de verdad del diseño**. Cubo B
(funciones de interfaz perdidas) se ataca contra `AUDITORIA-DISENO.md`,
no reabriendo el `.dc.html` como sitio donde “sigue viviendo” el
producto.

**Descartado.** Seguir iterando producto en Claude Design y re-traducir.
Tratar el DC como spec viva.

**Por qué.** Dos fuentes de verdad visual divergen en una semana. El
fundador solo puede mantener una, y esa es la app que corre.

---

## D12. Datos y migraciones: SQL versionado, no el dashboard

**Decidido.** Todo cambio de schema es un archivo en
`supabase/migrations/`. Cero clicks en el dashboard de Supabase (si se
probó a mano, la migración que lo reproduce existe antes de darlo por
cerrado). `service_role` nunca en cliente ni en commits.
`src/lib/mecanu/types.ts` es la forma de los datos; la UI no importa
`mecanu-rutas.ts` (excepción temporal: los `data.ts` de portales). Los 4
bloques se aplican, cuando el fundador lo confirme, **primero a
mecanu-dev**. Coherencia con `MODELO-DATOS.md`: si el código no encaja,
pararse, no inventar estructura.

**Descartado.** Ajustes “rápidos” en Table Editor. Enums nativos de
Postgres para estados de producto. Dinero en `numeric`/`float`.

**Por qué.** El dashboard no deja historial revisable. Un enum nativo
exige DDL para añadir `cancelado`. El céntimo entero evita errores de
redondeo en facturación.

---

## D13. En producción solo se publica la landing, y se corta en `src/proxy.ts`

**Decidido.** Una sola build y un solo deploy siguen conteniendo las tres
superficies (ver D4), pero en el entorno **Production** de Vercel solo `/`
responde: `/panel` y `/conductor` redirigen a la landing y `/api/v1/*`
devuelve `404 {"error":"not_found"}` — un 302 desde una llamada de datos le
daría HTML al cliente del conductor donde espera JSON y rompería en silencio.

El corte es **fail-closed**: se activa solo con `VERCEL_ENV === "production"`
y no depende de acordarse de configurar nada. `next dev`, `next start` y los
previews de Vercel sirven las tres superficies enteras — el preview de
`staging` es donde se verifica el panel antes de mergear a `main`, así que no
puede estar capado. Para abrir el panel y el conductor al público el día que
toque: `MECANU_EXPONER_APPS=1` en Vercel (Production).

**Descartado.** Cortar sin condición de entorno (fue lo primero que se hizo:
también mataba `localhost`, que es el bug que originó esta decisión). Borrar
las rutas del árbol. Basic auth sobre `/panel`. Un proyecto de Vercel aparte
solo para la landing.

**Por qué.** El panel y el conductor funcionan hoy con datos mock y con
`// TODO API:` donde irá el backend; no son un producto que se pueda enseñar.
Lo que hacía falta era publicar la landing sin publicar lo demás, y eso es
una condición de entorno de una línea, no una reorganización del repo.

---

## Radar — no ahora

Anotado para no perderlo; no se construye en esta pasada.

| Qué | Dónde |
|---|---|
| **Pasada B** — convención `created_at/updated_at/created_by/updated_by` en todas las tablas; `es_actual` en entidades con historial versionable (inspecciones, hallazgos, alertas, presupuestos), no en las estables. Toca migraciones ya escritas. | `MODELO-DATOS.md` |
| **Cubo B** — personalización de tablas, flujo completo “Agendar con Mecanu”, taxonomía de tabs de ficha | `AUDITORIA-DISENO.md` |
| **Calle de sucursal** — cards: cliente = barrio+ciudad; taller = “Taller” + calle. Falta modelar la calle de sucursal (`sucursales.direccion` existe como texto libre; hay que decidir grano) | UI de Traslados |
| Tests RLS del bloque 1 (recursión) antes de aplicar | `MIGRACIONES-RESUMEN.md` |
| `seguro_demanda` como producto | `SEGUROS.md`, `AGENTS.md` regla 9 |
