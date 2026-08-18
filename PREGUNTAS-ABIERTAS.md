# Preguntas abiertas

Todo lo que el frontend deja ambiguo y que el backend real tendrá que decidir.
Cada punto sin anotar aquí es un bug futuro — por eso esta lista intenta ser
exhaustiva en vez de solo cómoda.

Las §1–19 son las preguntas originales del modelo de conductores y rutas.
Las §20+ son preguntas nuevas surgidas del diseño del backend (jerarquía
organizativa, planes, seguros, auditoría). Ordenadas de más a menos urgente.

---

## Bloqueantes para un backend real

### 1. No hay autenticación, roles ni permisos
El prototipo entero asume un único usuario implícito por superficie: el operador
del taller en `/panel`, el conductor `d1` (Javier Molina) hardcodeado en
`/conductor` (`MI_ID = 'd1'` en `src/components/conductor/constants.ts`).
Ninguna API route verifica quién llama. Antes de tener datos reales de clientes
en producción esto tiene que existir. Preguntas concretas sin responder:
- El diseño de jerarquía Grupo → Sucursal está en `MODELO-DATOS.md`, pero el
  primer Grupo / Sucursal / usuario real hay que crearlo manualmente — ¿hay un
  flujo de onboarding (signup del taller)? ¿Quién hace el primer `INSERT`?
- ¿Cómo se autentica un conductor en su móvil? ¿Magic link, código SMS, app?

### 2. `crearRutaDesdeCampana` no está implementado en el mock
`src/lib/mecanu/repo/repo-mock.ts` lanza un error explícito si se llama. El
modelo en memoria construye TODAS las rutas al arrancar — no hay una función que
sepa construir una ruta nueva completa (paradas + tramos + presupuesto) desde una
campaña aceptada en runtime. Hay que escribirla desde cero contra Postgres.

### 3. Los `data.ts` de los portales no pasan por `repo` todavía
Ver `ARQUITECTURA.md` — excepción documentada y deliberada de esta etapa.
Plan de migración: Server Components para el panel, diseño explícito de
caché/offline para el conductor.

### 4. `getTrasladosDisponibles` es una aproximación
No existe campo "disponible" en `Tramo`. El mock aproxima con "agendado + sin
conductor". ¿Booleano explícito que el taller activa, o regla derivada?

### 5. `registrarHallazgoCampana` no crea una `Campana` real
El mock devuelve `null` siempre. Falta catálogo testigo → servicio de tempario.

---

## Casos borde del modelo

### 6. Kilometraje descendente
¿El servidor solo logea anomalía, o hay un umbral que sí bloquea (ej. -1000 km)?

### 7. Testigo rojo → "no rodante": ¿cuánto puede tardar el taller en responder?
No hay SLA ni escalada definida. El conductor queda parado indefinidamente.

### 8. Vídeo obligatorio en el check-in: ¿siempre o condicionado?
"30 s ≈ 25 MB con datos móviles" — recomendación previa: exigirlo solo en
vehículos de más de 10 años o valor declarado alto.

### 9. Inspección repetida para un cliente recurrente sin pre-relleno
No hay reutilización de la última inspección del mismo vehículo.

### 10. Nota de voz sin transcripción
¿Transcribir con Whisper API? Decisión de producto + coste.

### 11. Sin foto guía en la cámara del check-in
Afecta calidad de evidencia, no lógica de negocio.

---

## Preguntas de infraestructura (originales)

### 12. Multi-tenancy de Supabase
**Parcialmente respondida**: la jerarquía Grupo → Sucursal y la columna
`sucursal_id` en todas las tablas operativas están diseñadas en `MODELO-DATOS.md`.
Lo que queda abierto: el primer tenant se registra manualmente (ver §1). El
diseño asume un solo Supabase project para todos los grupos, con RLS separando
los datos — confirmar que esta es la arquitectura elegida vs. un proyecto Supabase
por tenant.

### 13. Almacenamiento de fotos / vídeo / firmas
¿Supabase Storage? La política de retención está documentada en `MODELO-DATOS.md`
(14 meses para evidencia de check-in). Queda abierto: ¿se comprimen antes de
subir desde el móvil del conductor?

### 14. Cola offline: hoy vive solo en memoria de React
La cola no sobrevive un cierre de pestaña. Se necesita IndexedDB o `localStorage`
antes de production-ready.

### 15. Idempotencia hoy es un `Map` en memoria del proceso
La tabla `idempotency_keys` de `MODELO-DATOS.md` resuelve esto. Migración:
cambiar `src/lib/mecanu/idempotency.ts` para leer/escribir en Postgres en vez
del Map.

### 16. Notificaciones (WhatsApp real, push al conductor)
`mecanu-whatsapp.ts` es simulación. El switch `notificaciones_push` está en el
catálogo pero no implementado. Conectar Kapso / Meta requiere credenciales de
WABA aún no disponibles.

---

## Ambigüedades menores de tipo/forma (originales)

### 17. Config del pipeline sin Zod
`mecanu-pipeline.ts` se tipó con TS plano, no Zod. Aceptable mientras sea código
versionado; reconsiderar si se vuelve editable desde un panel de admin.

### 18. `Ruta.subestado` es `string`, no unión estricta por estado
La validación real de "este subestado es válido para este estado" vive en código
(`subestadoMeta`), no en el schema.

### 19. Prefijos de id duplicados en campañas (`OP-*` vs `CMP-*`)
Unificar antes de que el prefijo filtre a lógica de negocio.

---

## Preguntas surgidas del diseño del backend (§20+)

### 20. ~~¿A qué nivel viven clientes y vehículos — sucursal o grupo?~~ — RESUELTA
**Decisión cerrada**: cliente y vehículo cuelgan del **grupo** (`grupo_id`), no de
la sucursal. Un cliente habitual que va a dos sucursales del mismo grupo es un
solo registro — nunca se duplica. Cada traslado sigue registrando en qué
sucursal ocurrió (`rutas.sucursal_id`), pero el cliente/vehículo en sí es un pool
compartido a nivel de grupo. Ver `MODELO-DATOS.md` tablas `clientes`/`vehiculos`.

### 21. ¿Qué muestra exactamente la degustación de IA en plan Alta?
El switch `ia_diagnostico` está documentado pero el comportamiento Alta vs. Lujo
no está decidido. ¿El plan Alta ve un bloque de IA con resultado visible pero
"bloqueado" (requiere Lujo)? ¿O ve el resultado completo pero con marca "beta"?
¿O no ve nada del módulo IA hasta Lujo? Afecta al diseño del componente
`HallazgosIA` (por construir).

### 22. ¿La UI advierte al asignar `conductor_flota` a traslado con seguro propio?
Un conductor de la flota Mecanu asignado a un traslado cubierto por el seguro
propio del Grupo puede no estar cubierto por esa póliza — depende de cada
aseguradora. ¿Muestra la UI una advertencia en el paso de asignación?
¿Es un soft-warning o bloquea hasta que el operador confirme explícitamente?
Ver `SEGUROS.md` matriz de responsabilidad.

### 23. `conductor_flota` + sin cobertura Mecanu: ¿hard block o soft warning?
`SEGUROS.md` propone bloquear en el servidor. ¿O el operador puede ignorar la
advertencia bajo su responsabilidad? (Hay casos de urgencia donde el taller
quiere asignar al conductor que tiene disponible aunque no haya cobertura.)

### 24. ¿El precio del seguro bajo demanda varía o es fijo por traslado?
El diseño actual usa un único `precio_unitario_cents` en `plan_precios_overage`.
Si el precio varía por tipo de vehículo, distancia o valor declarado, se necesita
una función de tarificación, no un precio plano.

### 25. ¿El contador de WhatsApp de 10 msgs (plan Alta) es por grupo o por sucursal?
El diseño de `PLANES.md` propone contadores al nivel del Grupo (un pool de 10
msgs compartido entre todas las sucursales del mismo Grupo en plan Alta). ¿Es
correcto? ¿O cada sucursal tiene sus 10 mensajes independientes?

### 26. ¿Qué pasa con el asiento de un conductor cuando se desactiva a mitad de mes?
Un `conductor_interno` desactivado en `user_org_roles.activo = false` libera un
asiento del contador `conductores_activos`. Si el Grupo en plan Alta tiene 3
conductores activos, desactiva uno (bajando a 2) y activa uno nuevo al día siguiente:
¿se registra un overage por el día del 4.º conductor, o no?
El gauge de conductores activos no acumula días — revisa el estado actual.
La respuesta correcta probablemente sea "no hay overage si nunca se superó el
límite simultáneamente", pero hay que explicitarlo para el código del contador.

### 27. ¿Los precios de los planes Alta y Lujo ya están decididos?
`planes_config.precio_mensual_cents = 0` en los valores iniciales de `PLANES.md`
— es un placeholder. Antes de la primera factura real, los precios tienen que
estar en la BD. ¿Cuándo se toma esa decisión? **Ampliada tras la revisión de
`MODELO-DATOS.md`**: la misma pregunta aplica a
`plan_precios_flota.tarifa_base_cents` para `'lujo'` — el recargo de flota de
Alta (35%, ver `PLANES.md` "Recargo de flota Mecanu") se calcula sobre esa
tarifa, así que tampoco se puede facturar de verdad hasta que tenga un valor.

### 28. ¿El modelo de Flota Mecanu (`conductor_flota`) requiere nuevas tablas?
Hoy el rol `conductor_flota` en `user_org_roles` (con `grupo_id` = grupo
`tipo='mecanu'`) es el único marcador. En el futuro, ¿Mecanu gestiona su propia
lista de conductores freelance (con sus propias calificaciones, disponibilidad,
zonas de cobertura)? Si es así, la tabla `conductores` no es suficiente — se
necesita una entidad `flota_mecanu` separada. ¿Se construye algo ahora o se
pospone? Relacionado: si algún día Mecanu cobra por uso de flota, `PLANES.md`
señala que sería un `dimension` nuevo en `usage_counters`, no una variante de
`conductores_activos`.

### 29. Tabla `audit_events` es inmutable: ¿cómo se gestiona el derecho de supresión RGPD?
**Dirección decidida, sin resolver del todo todavía**: la solución futura es
**anonimizar `actor_id`** (ponerlo a `null`, preservando `actor_rol` como
snapshot) en vez de borrar o modificar la fila — la tabla sigue siendo
`INSERT`-only en el sentido de que ninguna fila desaparece; el paso de anonimización
sería una operación administrativa aparte, fuera del flujo normal de escritura,
ejecutada una sola vez por solicitud de supresión. Lo que falta decidir: ¿quién
dispara ese proceso (automático al procesar la baja del usuario, o manual por
`mecanu_admin`)? ¿Se anonimiza también `entidad_id` cuando la entidad referenciada
es la persona que pide la supresión (ej. un `cliente_id`), o solo `actor_id`?
No bloquea el diseño actual — se resuelve antes de que entre en producción el
primer usuario real, no antes.

### 30. ¿Quién crea el usuario del conductor — el taller o el conductor mismo?
El diseño propone que `conductores.usuario_id` apunte a `usuarios.id` (nullable
durante onboarding). Flujos posibles: (a) el taller invita al conductor por email
(Supabase Auth magic link), (b) el conductor se registra solo con un código que
le da el taller, (c) el taller crea la cuenta directamente. Afecta al onboarding
y a qué datos introduce quién.

---

## Preguntas surgidas del rediseño del modelo de acceso (§31+)

### 31. ~~Conductor sin cuenta de usuario todavía (onboarding)~~ — RESUELTA
**Decisión cerrada**: la cuenta del conductor se crea desde el **primer paso**
del onboarding, no después. Flujo: invitación → creación de cuenta con
`usuario_id`, rol (`conductor_interno`/`conductor_flota`), `grupo_id` y alcance
de sucursales, todo en la misma transacción → `conductores.proceso =
'documentos_pendientes'`. No existe columna transitoria ni estado intermedio sin
cuenta. `conductores.usuario_id` es `not null`. El estado (`proceso`) controla
qué puede hacer el conductor, no quién es — el bloqueo de operar mientras está
`documentos_pendientes` vive como un chequeo explícito dentro de `autorizar()`
(motivo `conductor_no_activo`), no como ausencia de fila. Ver `MODELO-DATOS.md`
"Onboarding de un conductor" y `PERMISOS.md` función `autorizar()`.

### 32. ~~`user_sucursal_access` con cero filas = todas las sucursales: riesgo de fail-open~~ — RESUELTA
**Decisión cerrada, riesgo corregido**: se reemplazó el diseño por una columna
explícita `user_org_roles.alcance_todas_sucursales boolean not null default
false`. `true` → ve todas las sucursales del grupo, se ignora
`user_sucursal_access`. `false` (default) → el alcance es exactamente lo que
haya en `user_sucursal_access`; cero filas ahí significa **cero acceso**, no
acceso total. El default restrictivo es deliberado: un fallo de alta deja al
usuario sin acceso y visible como tal, nunca con acceso ampliado en silencio.
Test obligatorio añadido en `PERMISOS.md` ("Tests obligatorios de
`autorizacion.ts`", punto 1): un `sucursal_admin` sin filas de acceso no debe
ver ningún traslado.

### 33. ~~¿`grupo_admin` con visión reducida necesita un rol nuevo?~~ — RESUELTA
**Decisión cerrada**: no. Se resuelve con la misma columna de §32 —
`alcance_todas_sucursales = false` más las filas correspondientes en
`user_sucursal_access`, sobre el rol `grupo_admin` existente. No se crea un
sexto rol. Como consecuencia, la política RLS ya no trata a `grupo_admin` como
caso especial: `sucursal_admin` y `grupo_admin` comparten exactamente la misma
regla de alcance (`sucursal_id IN alcance_sucursales(...)`), y lo que distingue
a un admin de grupo completo de uno con visión reducida es el valor de la
columna en su fila de `user_org_roles`, no el rol. Ver `MODELO-DATOS.md` sección
RLS y `PERMISOS.md`.
