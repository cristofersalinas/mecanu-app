# Campañas — rediseño del modelo

**Estado de este documento:** propuesta de modelo. No es un cambio de schema
aplicado. La UI del prototipo sí implementa ya el cálculo puro descrito aquí;
no toca `MODELO-DATOS.md`, ni migraciones, ni backend.

| Tema | Estado |
|---|---|
| Dos ejes; semáforo calculado; `es_actual` en capa operativa; evidencia sellada | Cerrado |
| Nombres: `es_actual` vs semáforo `vigente` / `por_vencer` / `vencido` / `caducado` | **Cerrado** (§13.2) |
| Presupuesto en vuelo + check-in que cambia el coche → `cancelado` con motivo + aviso al taller | **Cerrado** (§13.5) |
| ¿Tabla `servicio_alertas` o reusar `campana_items`? | **Pendiente tuyo** — recomendación CTO en §13.1, no aplicada |
| Catálogo y grano de `componente_key` | **Pendiente tuyo** — recomendación CTO en §13.4, no aplicada |
| Resto de §13.3, §13.6–§13.13 | Abierto |

El módulo de Campañas es un sistema de **alertas de servicio proactivas**
que nacen de la inspección visual, más el presupuesto que se envía al
cliente. Lo que cambia es la unidad atómica, los ejes de estado y cómo se
versionan los datos cuando el coche vuelve.

---

## 0. Briefing de producto (aplicado)

Los seis puntos de abajo son la spec. Donde el briefing decía `vigente =
true/false` para el flag de versionado, el modelo usa **`es_actual`**
(§13.2, cerrado): `vigente` queda reservado al semáforo. El resto se
aplica tal cual. Schema: §8, propuesta, no aplicada.

### 0.1 La unidad atómica es el servicio-alerta, no la campaña

Cada ítem de la inspección visual (cada hallazgo) es una alerta de
servicio independiente, con su propia fecha recomendada y su propio
semáforo. Un mismo coche puede tener varias alertas con fechas distintas
(neumáticos recomendados para septiembre, batería para agosto). El dato
vive **por servicio**, no por coche ni por campaña.

### 0.2 Dos ejes independientes, no una jerarquía de estados

- **Vigencia (semáforo):** `vigente` / `por_vencer` / `vencido` /
  `caducado`. Vive en el servicio-alerta. **No es manual** — se calcula a
  partir de la fecha recomendada: `vigente` si faltan más de 45 días,
  `por_vencer` desde 45 días antes hasta el día anterior, `vencido` desde el
  día de vencimiento hasta 44 días después y `caducado` desde 45 días después.
- **Avance comercial:** `sin_valorar` / `estimado` / `enviado` /
  `confirmado` / `rechazado`. Vive en la campaña (el presupuesto que
  agrupa servicios para enviar al cliente). Es el progreso de la gestión
  de venta. `cancelado` (con motivo) se añade después, §13.5, para el
  presupuesto en vuelo que un check-in deja obsoleto — no forma parte del
  pipeline comercial que el taller recorre a mano.

Una card tiene un valor de cada eje a la vez (ej. `Enviado · Por vencer`).

Por qué van separados: la vigencia es del **problema físico del coche**
(se degrada con el tiempo). El avance es de la **gestión comercial**
(¿ya mandé el presupuesto?). Un solo pipeline mentiría en los dos
relojes.

### 0.3 Agrupación por auto en la presentación

Los servicios-alerta se individualizan en los datos (cada uno su fila, su
fecha, su semáforo) y se agrupan por vehículo en la vista (el taller ve
“este coche tiene 3 alertas pendientes”). La agrupación es de
presentación, no de datos.

### 0.4 Bloqueo de las vigentes

Una alerta con semáforo `vigente` (fecha aún lejana) es **visible** pero
con acciones comerciales **bloqueadas**: no se manda presupuesto de algo
que aún no toca. Si el cliente se adelanta y llega antes de la fecha, eso
**no** es una acción comercial normal: dispara el versionado del §0.5 /
§7, no un envío de presupuesto.

### 0.5 Versionado (regla crítica de datos)

Los registros de inspección **nunca se borran ni se sobrescriben**.
Cuando un coche vuelve y hay un check-in/check-out nuevo:

- Las alertas anteriores de ese coche que el match de componente alcance
  pasan a `es_actual = false` (en el briefing: “vigente = false”). No se
  borran: son evidencia histórica, también para seguro.
- Las nuevas entran como `es_actual = true`.
- **Con detalle** del componente (estado actual del neumático, mm,
  voltaje…): la alerta se **reemplaza** con el dato fresco.
- **Sin detalle** (solo se sabe que hubo incidencia en ese componente):
  la alerta anterior se marca `es_actual = false` **sin** crear
  reemplazo; el resto de alertas del coche se mantienen intactas.

Consultas operativas: filtrar `es_actual = true` por defecto, o el taller
ve datos obsoletos mezclados. Cómo garantizarlo: §7.4 (vista SQL + filtro
en el repo).

### 0.6 Vista

- Por defecto: **lista**, no kanban.
- Filtro maestro tipo semáforo arriba: Vigente / Por vencer / Vencido.
  Diseño propio Mecanu — no copiar ningún diseño externo.
- Dentro: agrupación por auto.

### Mapa de este archivo (lo que el briefing pedía)

| Pedido | Dónde |
|---|---|
| Tres niveles (alerta → auto → vigencia) | §2 |
| Dos ejes, valores, por qué son independientes | §0.2, §3 |
| Fórmula del semáforo (umbrales 45/60 días) | §4 |
| Versionado y obsolescencia (con detalle / sin detalle) | §0.5, §7 |
| Schema: `campana_items` / `inspeccion_hallazgos` (fecha recomendada, semáforo derivado, flag) — propuesta, no aplicada | §8 |
| Frontend: lista, agrupación, bloqueo | §9 |
| Preguntas abiertas | §13 |

---

## 1. Cómo está hoy (antes de rediseñar)

Hoy la unidad de trabajo es la **campaña**. El taller ve un kanban de un
solo eje (avance comercial). Pipeline de producto, con ids actuales entre
paréntesis:

```
NUEVA (nueva) → ESTIMADO (valorada) → ENVIADO (enviada)
  → CONFIRMADO (aceptada) | RECHAZADO (rechazada) | CADUCADO (caducada)
```

Fuente: `PRESUPUESTO_ESTADOS` en `mecanu-pipeline.ts`. Una inspección con
hallazgos genera **una** campaña que agrupa todos los ítems del mismo
coche. El avance es 100 % manual, un botón por transición.

| Dónde | Qué hay hoy |
|---|---|
| `campana_items.fecha` | fecha del ítem (date) |
| `campana_items.dias` | días hasta esa fecha **en el momento de crear** el ítem — se queda viejo |
| `campanas.fecha` | una sola fecha para toda la campaña |
| `inspeccion_hallazgos` | `vida`, `cambio`, `prediccion` como texto. **No hay fecha recomendada.** |
| `campanas.estado` y `presupuestos.estado` | el mismo pipeline comercial |

Consecuencias del modelo actual:

- Un coche con neumáticos para septiembre y batería para agosto es **una card
  con una fecha**. El taller no puede tratar cada servicio por su calendario.
- “Caducado” mezcla el tiempo (ya pasó la fecha) con la gestión comercial
  (no contestó / no se hizo nada).
- Un check-in nuevo no versiona hallazgos anteriores. `inspecciones` e
  `inspeccion_hallazgos` son **evidencia sellada** (solo `INSERT`, sin
  `UPDATE`/`DELETE` — `PERMISOS.md` invariante 7). Eso es correcto para
  seguro; no hay aún un flag de “esta observación sigue siendo la vigente”.

Las campañas manuales (sin inspección, p. ej. cotización a un coche nuevo)
siguen existiendo. Este rediseño no las elimina; las deja como caso borde
(pregunta abierta §13.8).

---

## 2. Modelo de tres niveles

Hay tres capas. Solo la primera es una fila de datos. Las otras dos son
lectura.

```
servicio-alerta          ← unidad atómica (fila)
        ↓
agrupación por auto      ← presentación (no se persiste)
        ↓
vigencia (semáforo)      ← derivada de la fecha recomendada
```

### Nivel 1 — servicio-alerta (dato)

Cada hallazgo de la inspección visual que recomienda un servicio es una
**alerta independiente**. Tiene:

- el componente (`neumaticos`, `bateria`, `frenos`…)
- la evidencia (foto, métrica, severidad) — vive en `inspeccion_hallazgos`
- **su propia fecha recomendada**
- su propio semáforo de vigencia (calculado)
- el vínculo opcional a una campaña / presupuesto, cuando el taller decide
  agrupar y vender

Un mismo coche puede tener N alertas con fechas distintas. El dato vive **por
servicio**, no por coche ni por campaña.

Mapeo al schema (propuesta, **no aplicada**; cuelga de §13.1):

- La **observación** sigue siendo `inspeccion_hallazgos` (inmutable).
- La **alerta operativa** (fecha recomendada, `es_actual`, semáforo derivado)
  es una fila propia. Recomendación CTO: tabla nueva `servicio_alertas`.
  Alternativa: reusar `campana_items` con `campana_id` nullable. Tú decides
  en §13.1; §8 describe las dos formas.
- La **campaña / presupuesto** agrupa alertas para vender. `campana_items`
  queda como línea comercial (o como la alerta, si eliges reusar).

### Nivel 2 — agrupación por auto (presentación)

En datos, cada alerta es una fila. En la vista, el taller ve **este coche
tiene 3 alertas pendientes**. La agrupación es un `GROUP BY vehiculo_id` (o
equivalente en la capa de datos), no una entidad `campana-por-coche`.

Una campaña (presupuesto) **puede** agrupar varias alertas del mismo coche
para mandarlas juntas. Eso es una decisión comercial, no la forma en que se
almacenan.

### Nivel 3 — vigencia / semáforo (derivada)

No es un estado que el taller elija. Se calcula a partir de la fecha
recomendada de **esa** alerta. Fórmula en §4. La UI solo muestra la ventana
operativa de menos de 60 días y no muestra alertas `caducado`.

---

## 3. Dos ejes independientes

Una card (o una fila de alerta) tiene **un valor de cada eje a la vez**.
Ejemplo: `Enviado · Por vencer`.

### Eje A — vigencia (semáforo)

Vive en el **servicio-alerta**. No es manual.

| Valor | Cuándo |
|---|---|
| `vigente` | faltan **más de 45 días** para la fecha recomendada |
| `por_vencer` | faltan **45 días o menos**, pero aún queda al menos un día |
| `vencido` | es el día recomendado o han pasado entre 1 y 44 días |
| `caducado` | han pasado **45 días o más** desde la fecha recomendada |

Esto describe el **problema físico del coche**. El neumático se gasta, la
batería envejece, la ITV caduca, tanto si el taller ha mandado un presupuesto
como si no. El tiempo no espera a la gestión comercial.

### Eje B — avance comercial

Vive en la **campaña** (el presupuesto que agrupa servicios para enviar al
cliente). Es el progreso de la venta. Propuesta de valores (nombres de
producto; ids actuales entre paréntesis):

| Producto | Id actual (`presupuestos.estado`) | Quién actúa |
|---|---|---|
| `sin_valorar` | `nueva` | taller: valorar |
| `estimado` | `valorada` | taller: enviar |
| `enviado` | `enviada` | cliente (o taller marca) |
| `confirmado` | `aceptada` | taller: crear ruta |
| `rechazado` | `rechazada` | fin comercial (el cliente dijo no) |
| `cancelado` | **nuevo** (no existe hoy) | sistema o taller: el dato del coche cambió, o se retira el envío. Exige **motivo**. La fila se conserva. |

`caducada` **sale de este eje**. Caducar por tiempo es el semáforo `vencido`,
no un estado comercial. Qué hacer con las campañas ya marcadas `caducada` en
datos de prototipo es pregunta abierta (§13.3).

`cancelado` no es `rechazado` ni “anulado”. Rechazado = el cliente no quiere.
Cancelado = este presupuesto ya no vale (dato fresco, u otro motivo), y queda
historia para no fingir que nunca existió. Tras §13.5, un check-in que
versiona alertas ligadas a un presupuesto **abierto** (`nueva` / `valorada` /
`enviada`) lo pasa a `cancelado` con motivo estándar y avisa al taller.

El avance sigue siendo **100 % manual**, un botón por transición, cada una
deja log. Eso no cambia.

### Por qué no es una jerarquía de estados

Si fueran un solo pipeline, pasarían cosas falsas:

- Un presupuesto **enviado** de una batería que aún no toca (fecha en 4 meses)
  parecería “en curso”, cuando comercialmente no debería haberse mandado.
- Un presupuesto **sin valorar** de unos frenos **ya vencidos** parecería
  “nuevo y tranquilo”, cuando el problema físico ya está tarde.
- Al volver el coche, el dato físico se actualiza (eje A) **sin** resetear
  ni avanzar la negociación (eje B), y al revés: mandar el WhatsApp no
  cambia cuándo toca cambiar el neumático.

Son dos relojes. El del coche y el de la venta. La vigencia es del
problema físico (se degrada con el tiempo); el avance es de la gestión
comercial (¿ya mandé el presupuesto?).

### Dónde se pinta cada eje

- Filtro maestro de la vista: **solo eje A** (Vigente / Por vencer / Vencido).
- Dentro de cada grupo-coche: cada alerta muestra su semáforo; el bloque
  comercial (Valorar / Enviar / …) muestra el eje B de la campaña a la que
  pertenezca, o `sin_valorar` si aún no hay campaña.
- La card del grupo puede resumir: el semáforo **más urgente** de sus alertas
  actuales + el avance de la campaña abierta, si hay una. Eso es presentación;
  no se persiste un “estado del coche”.

---

## 4. Cómo se calcula la vigencia

Constantes de producto: `UMBRAL_POR_VENCER_DIAS = 45`,
`UMBRAL_CADUCADO_DIAS = 45` y `UMBRAL_VISIBILIDAD_DIAS = 60`.

Sea `F` la fecha recomendada (date, sin hora) y `H` la fecha de hoy en la
zona del taller (propuesta: calendario de la sucursal, no UTC del servidor —
§13.9).

```
delta = F - H   (días de calendario, con signo)

si delta ≤ -45         → caducado
si -44 ≤ delta ≤ 0     → vencido
si 1 ≤ delta ≤ 45      → por_vencer
si delta > 45          → vigente
```

Casos borde de la fórmula:

- `delta = 0` (es el día recomendado) → `vencido`.
- `delta = 45` → `por_vencer`; `delta = 46` → `vigente`.
- `delta = -44` → `vencido`; `delta = -45` → `caducado`.
- La vista operativa muestra solo `delta < 60` y excluye `caducado`.
- Sin fecha recomendada → **no hay semáforo**. La UI dice “Pendiente de
  fecha”, no se inventa. Coherente con la invariante de ventanas horarias
  del resto del producto.

**No se almacena el semáforo.** Es una columna generada, una vista SQL, o un
cálculo en `src/lib/mecanu`. Si se materializa, se desincroniza a medianoche.
`campana_items.dias` deja de usarse como fuente: era un snapshot y miente al
día siguiente.

---

## 5. Agrupación por auto

Solo en la vista.

- Clave de grupo: `vehiculo_id`.
- Dentro del grupo, las alertas se ordenan por urgencia del semáforo
  (`vencido` → `por_vencer` → `vigente`) y, a igualdad, por fecha
  recomendada ascendente.
- El grupo hereda el semáforo más urgente: si tiene un vencido, el auto se
  trata como vencido aunque también tenga servicios por vencer o vigentes.
- El filtro maestro aplica a ese semáforo agregado y la expansión mantiene
  todos los servicios visibles del auto como contexto.

La campaña no es el grupo. Un coche puede tener alertas aún sin campaña, una
campaña abierta, o una campaña ya confirmada más alertas nuevas que aún no
han salido.

---

## 6. Bloqueo de las vigentes

Una alerta con semáforo `vigente` (fecha aún lejana, más de 45 días) es
**visible** y **no es accionable en comercial**.

Bloqueado, mientras el semáforo sea `vigente`:

- valorar / estimar
- enviar presupuesto (WhatsApp u otro canal)
- marcar confirmado / rechazado
- crear ruta desde esa alerta

No bloqueado:

- ver evidencia, foto, métrica, fecha
- el cliente llega al taller **antes** de la fecha (adelanto físico)

Ese adelanto **no** es “enviar el presupuesto de algo que aún no toca”. Es
una visita real: se hace check-in/check-out y corren las reglas de versionado
del §7. El dato fresco sustituye o invalida la alerta; no se usa el envío
comercial como atajo.

`por_vencer` y `vencido` sí desbloquean las acciones comerciales, salvo las
reglas ya existentes de presupuesto (no reenviar una rechazada, etc.).

Si un grupo-coche mezcla alertas vigentes con otras por vencer, las acciones
aplican **por alerta**, no al bloque entero: se puede presupuestar la batería
de agosto y dejar bloqueados los neumáticos de noviembre.

---

## 7. Versionado por vigencia (regla crítica de datos)

Los registros de inspección **nunca se borran ni se sobrescriben**. Son
evidencia, también para seguro. Lo que cambia es **cuál observación cuenta
como actual** para operar.

Flag de versionado (**cerrado**, §13.2): `es_actual`.
El semáforo **no** usa esa palabra como flag: sus valores son `vigente` /
`por_vencer` / `vencido`. No compartir nombre.

- `es_actual = true`  → esta alerta es la lectura que cuenta hoy para ese componente
- `es_actual = false` → evidencia histórica; no sale en la vista operativa

### Qué pasa cuando el coche vuelve (nuevo check-in / check-out)

1. Se inserta una `inspecciones` nueva (sellada) con sus
   `inspeccion_hallazgos` nuevos.
2. Se recorre cada hallazgo **nuevo** y se aplica la regla fina de
   obsolescencia (§7.1) contra las alertas `es_actual = true` del mismo
   `vehiculo_id` + `componente_key`.
3. Las alertas de **otros** componentes del mismo coche no se tocan.
4. Nadie hace `DELETE` ni `UPDATE` del cuerpo de un hallazgo (categoría,
   métrica, foto, texto). Solo se baja el flag `es_actual` en la capa
   operativa.

### 7.1 Obsolescencia fina — dos casos

Clave de match: `vehiculo_id` + `componente_key` (p. ej. `neumaticos`,
`bateria`, `frenos` — grano pendiente de §13.4). El `item` libre de hoy
no basta: hay que normalizar.

**Caso A — el nuevo check-in trae detalle del componente**
(hay medición, foto de estado, % de vida, mm de pastilla, voltaje, etc.;
propuesta: `tiene_detalle = true`).

- La alerta anterior de ese componente pasa a `es_actual = false`.
- Se crea una alerta nueva `es_actual = true` con el dato fresco y su
  nueva fecha recomendada.
- Linaje (opcional): `reemplaza_item_id` apunta a la alerta que sustituye.

**Caso B — se sabe que hubo incidencia en ese componente, sin detalle**
(el conductor o el taller marcan el componente pero no hay métrica ni
estado actual utilizable; `tiene_detalle = false`).

- La alerta anterior de ese componente pasa a `es_actual = false`.
- **No se crea reemplazo.** Dejamos de afirmar un estado que ya no
  podemos sostener.
- El resto de alertas del coche siguen `es_actual = true`.

En ambos casos la fila histórica permanece. Un perito o el propio taller
puede reconstruir: “el 12 de marzo el delantero derecho estaba al 20 %; el
8 de agosto se invalidó porque volvió a entrar y solo se anotó incidencia
sin medida”.

### 7.2 Presupuesto en vuelo (cerrado, §13.5)

Si el versionado apaga o reemplaza alertas que están dentro de un
presupuesto **abierto** (`nueva` / `valorada` / `enviada`):

1. Ese presupuesto (y su campaña) pasa a `cancelado`, con **motivo**
   obligatorio. Texto propuesto de sistema: *«El estado del vehículo
   cambió en un check-in posterior; este presupuesto ya no describe el
   coche.»* No se borra ni se “anula”: la fila, las líneas y el envío
   (si lo hubo) siguen siendo historia.
2. El sistema **avisa al taller** de que ese presupuesto quedó obsoleto.
   El taller decide si re-cotiza con el dato fresco (nueva campaña /
   nuevo presupuesto sobre las alertas `es_actual`). No hay recotización
   automática.
3. Las alertas nuevas (caso A) nacen `es_actual = true` y **sin**
   campaña. El avance comercial no se hereda del presupuesto cancelado.

No aplica (aún) a `aceptada` / `confirmado` con ruta ya creada: eso es
§13.12. `rechazada` ya está cerrada comercialmente; no se recancela.

### 7.3 Qué no hace esta regla

- No convierte un check-in adelantado en un envío de presupuesto.
- No toca daños de carrocería (`inspeccion_danos`). Este rediseño es de
  **servicios recomendados**, no del parte de golpes.
- No recotiza sola. Cancela y avisa.

### 7.4 Consultas operativas: filtrar `es_actual = true`

Si una query de Campañas no filtra, el taller ve neumáticos de hace tres
visitas mezclados con los de hoy. Eso es un bug de producto, no un
detalle de SQL.

**Propuesta para garantizarlo** (elegir una; recomendación: A + B):

| Capa | Qué |
|---|---|
| **A. Vista SQL** `…_actuales` | `where es_actual = true` sobre la tabla de alertas que salga de §13.1. El panel y el repo leen la vista por defecto. Histórico: tabla base, explícito. |
| **B. Repo** | `listAlertas({ actuales: true })` por defecto. `actuales: false` solo para ficha de evidencia / seguro. Un test en `src/lib/mecanu` que falle si alguien lista sin el filtro. |
| **C. RLS** (no recomendada como única barrera) | Una policy que esconda `es_actual = false` rompería la ficha histórica y el uso para seguro. El histórico tiene que poder leerse **a propósito**. |

Índice propuesto (cuando se migre):
`(vehiculo_id, componente_key) where es_actual = true`.

**Choque con evidencia sellada.** Hoy `inspeccion_hallazgos` no tiene
`UPDATE`. El flag `es_actual` vive en la **capa operativa** (tabla de
alertas), no en el hallazgo. El hallazgo permanece tal cual se insertó;
la alerta es la que se apaga. Abrir `UPDATE` en el hallazgo rompería (en
parte) el invariante 7 — no lo recomiendo. Pasada B podrá plantear
`es_actual` también en hallazgos; eso es otra tarea, y chocaría con el
sello.

---

## 8. Propuesta de schema (no aplicada)

Todo lo de esta sección es **propuesta a revisar**. Cero migraciones.
No se toca `MODELO-DATOS.md` ni los bloques SQL ya escritos hasta que
confirmes §13.1 y §13.4 y autorices DDL.

Leyenda: **N** = columna nueva a almacenar · **R** = reutilizar columna
existente con semántica nueva · **D** = derivada, no se persiste · **—** =
no tocar.

### 8.0 Lo que pedía el briefing, mapeado

Tres conceptos. El briefing los llamaba fecha recomendada, vigencia
derivada y flag `vigente`. El flag, en el modelo, es `es_actual`.

| Concepto del briefing | ¿Se guarda? | Dónde (propuesta) |
|---|---|---|
| Fecha recomendada | **Sí** | `inspeccion_hallazgos.fecha_recomendada` **N** (snapshot de la observación) y la misma fecha en la alerta operativa (`campana_items.fecha` **R**, o `servicio_alertas.fecha_recomendada` si §13.1 elige tabla nueva) |
| Vigencia derivada (semáforo `vigente` / `por_vencer` / `vencido`) | **No** | Función / vista a partir de la fecha y `today`. Nunca columna persistida. |
| Flag `vigente` del briefing (¿esta lectura cuenta hoy?) | **Sí**, como `es_actual` | Capa operativa: `campana_items.es_actual` **N** *o* `servicio_alertas.es_actual` **N**. **No** en `inspeccion_hallazgos` (evidencia sellada, sin UPDATE). |

`inspeccion_hallazgos` además necesita `componente_key` **N** (match de
obsolescencia) y `tiene_detalle` **N** (caso A / caso B). Eso no estaba
en la lista corta del briefing; sin esas dos el versionado fino no
arranca.

### 8.1 `inspeccion_hallazgos` (evidencia, inmutable)

Hoy: `categoria`, `item`, `metrica`, `severidad`, `prediccion`, `vida`,
`cambio`, `servicio_nombre`, `servicio_precio_cents`, `foto_url`.

| Columna | Tipo | Qué |
|---|---|---|
| `componente_key` **N** | text not null | Clave estable para match de obsolescencia (`neumaticos`, `bateria`, …). Catálogo cerrado, no el `item` libre. |
| `fecha_recomendada` **N** | date | Cuándo toca el servicio, según esta observación. Nullable si el hallazgo no recomienda servicio (severidad `ok`). |
| `tiene_detalle` **N** | boolean not null default true | Distingue caso A / caso B del §7.1. Default `true`: la vía normal del check-in visual trae métrica. |

No se añade `es_actual` aquí (evidencia sellada). No se añade el semáforo
(derivado de la fecha).

`vehiculo_id` no hace falta en el hallazgo: se alcanza por
`inspeccion → ruta → vehiculo_id`. Si las queries de versionado se vuelven
caras, denormalizarlo es un extra, no el núcleo.

### 8.2 `campana_items` — solo si §13.1 elige reusar (alternativa)

Si se acepta la recomendación CTO (`servicio_alertas` nueva), estas
columnas van a esa tabla y `campana_items` se queda como línea de
campaña (`alerta_id` + importe), sin `es_actual`. Lo de abajo describe
la **alternativa** de reusar.

Hoy: `tipo`, `origen` (`confirmado`\|`estimado`), `dias`, `falla`,
`registro_idx`, `datos`, `etiqueta`, `servicio_id`, `valor_cents`, `fecha`.

| Columna | Tipo | Qué |
|---|---|---|
| `fecha` **R** | date | Pasa a ser **la** fecha recomendada de la alerta (misma semántica que `inspeccion_hallazgos.fecha_recomendada` en el momento del alta). Dejar de tratarla como “fecha de la campaña”. |
| `dias` **R** | int | Deja de ser fuente de verdad. Se puede calcular; a medio plazo, deprecar. |
| `tipo` **R** | text | Alinear con `componente_key` o sustituir. Hoy es cercano (`neumaticos`, `bateria`) pero no está garantizado. |
| `hallazgo_id` **N** | uuid fk → inspeccion_hallazgos.id, nullable | Origen de evidencia. Null en campañas manuales. |
| `vehiculo_id` **N** | text fk → vehiculos.id, not null | Denormalizado para agrupar y versionar sin join a `campanas`. |
| `es_actual` **N** | boolean not null default true | Flag de versionado. **Todas** las queries operativas filtran `true`. |
| `reemplaza_item_id` **N** (opcional) | text fk → campana_items.id | Linaje caso A. Se puede posponer. |
| semáforo | — **D** | `vigente` \| `por_vencer` \| `vencido` según §4. Vista o función, no columna. |

`campana_id`: hoy `not null`. Con alertas que existen **antes** de haber
presupuesto, esta FK tiene que pasar a **nullable**. Eso no es una columna
nueva; es un cambio de nulabilidad. Sin él, no se puede individualizar el
servicio-alerta respecto de la campaña.

### 8.2.bis `servicio_alertas` — si §13.1 elige la tabla nueva (recomendado)

Núcleo: `id`, `vehiculo_id`, `sucursal_id` (o heredado), `hallazgo_id`
nullable, `componente_key`, `fecha_recomendada`, `es_actual`,
`tiene_detalle` (o se lee del hallazgo), `reemplaza_alerta_id` opcional,
`servicio_id` / importe snapshot nullable. Semáforo **D**. Sin
`campana_id`: la campaña apunta a la alerta vía `campana_items.alerta_id`.

### 8.3 `campanas` y `presupuestos`

Sin columnas nuevas de vigencia. El eje B sigue en `estado`.

**Añadir** valor `cancelado` al check de `estado`, con la misma regla
que las rutas: `cancelado` exige `motivo` (columna nueva `motivo text`
nullable + check). No es `caducada` ni `rechazada`.

Cambio de producto, no de schema: dejar de usar `caducada` como estado
comercial; el tiempo vive en el semáforo del ítem. `campanas.fecha` (una
fecha para toda la campaña) deja de ser la fuente del calendario: cada
ítem trae la suya. Se puede conservar como “fecha de envío” o deprecada
(§13.7).

Nombres `sin_valorar` / `estimado` / … vs ids `nueva` / `valorada` / …:
se pueden dejar los ids actuales (menos riesgo) y cambiar solo labels, o
renombrar en una migración posterior. No hace falta para el rediseño de
datos. `cancelado` sí es id nuevo: no hay label viejo que reciclar.

### 8.4 Qué se calcula vs qué se almacena

| Concepto | ¿Se guarda? |
|---|---|
| Fecha recomendada | Sí (en la alerta; copia en el hallazgo al nacer) |
| Semáforo vigente / por_vencer / vencido | No. Función de `fecha` y `today` |
| `es_actual` (¿esta lectura sigue valiendo?) | Sí |
| Agrupación por coche | No. Query |
| Avance comercial | Sí, en la campaña / presupuesto |
| `dias` hasta la fecha | No como fuente; derivable |

### 8.5 Conteo de columnas nuevas (núcleo)

Cuelga de §13.1. No se propone columna de semáforo persistida.

**Si se reusa `campana_items` (alternativa):** 6 columnas nuevas +
`campana_id` nullable + `presupuestos.motivo` + valor `cancelado` en el
check.

**Si se crea `servicio_alertas` (recomendado):** tabla nueva (esas 6
ideas viven ahí) + `campana_items.alerta_id` + `presupuestos.motivo` +
`cancelado` en el check. `campana_items` no necesita `es_actual`.

Hasta que decidas §13.1, **cero DDL**.

---

## 9. Implicaciones para el frontend

Nada de esto se construye todavía; es el contrato de UI del rediseño
(§0.6).

- **Vista por defecto: lista**, no kanban. **Ya en `CampanasView`** (presentación
  sobre el mock actual; el schema de §8 sigue sin aplicar). El kanban de
  avance comercial mezclaba los ejes y ocultaba el calendario del coche.
- **Filtro maestro arriba**, tipo semáforo: Vigente / Por vencer / Vencido.
  Diseño propio Mecanu (tokens `kind`: positive / warning / alert). **No
  copiar ningún diseño externo.** Un cuarto chip “Todos” es razonable; no
  es un quinto estado.
- **Dentro: agrupación por auto.** Cabecera del grupo = vehículo + cliente
  + recuento de alertas actuales (“este coche tiene 3 alertas pendientes”).
  Cuerpo = una fila por servicio-alerta (componente, fecha recomendada,
  semáforo, avance si ya hay campaña). La card muestra los dos ejes a la
  vez (`Enviado · Por vencer`).
- **Bloqueo visual de semáforo `vigente`:** la alerta se ve; botones
  Valorar / Enviar deshabilitados, con el motivo (“aún no toca — fecha
  recomendada el …”). No esconderla.
- **Acciones por alerta, no por coche**, cuando el semáforo es mixto.
- KPIs actuales (Sin valorar, Listas para enviar, Esperando respuesta,
  Aceptadas sin ruta, Volumen activo) miden el eje B. Segunda fila o
  filtro secundario; el filtro maestro es el semáforo.
- WhatsApp / `CrearRutaModal`: solo sobre alertas `por_vencer` o `vencido`,
  y solo si el avance comercial lo permite. Una campaña no debería poder
  enviarse si **todos** sus ítems siguen `vigente`; si mezcla, enviar solo
  los desbloqueados (pregunta §13.10).
- Un presupuesto `cancelado` sigue visible en histórico, no en la lista
  operativa. El aviso al taller (“este presupuesto quedó obsoleto, ¿re-cotizas?”)
  es una notificación de producto, no un estado más del semáforo.

---

## 10. Flujo resumido

```
check-in / check-out
    → inspeccion + hallazgos (INSERT, sellado)
    → por cada hallazgo con servicio:
          match (vehiculo, componente) en alertas es_actual
          si hay match:
                caso A (con detalle) → apagar anterior, crear alerta nueva
                caso B (sin detalle) → apagar anterior, no crear
          si no hay match → crear alerta nueva es_actual
    → si esas alertas estaban en un presupuesto abierto
          (nueva | valorada | enviada):
          presupuesto → cancelado + motivo; aviso al taller; no recotiza solo
    → la alerta actual nace sin campaña, semáforo derivado
    → si semáforo = vigente: visible, comercial bloqueado
    → si por_vencer | vencido: el taller valora → crea/usa campaña
          → envía → confirma | rechaza | (sistema: cancelado si el coche cambia)
    → confirmado → modal crear ruta (sin cambio respecto a hoy)
```

Cliente se adelanta y entra al taller antes de la fecha: no hay envío; hay
otro check-in y este mismo flujo.

---

## 11. Relación con decisiones ya cerradas

Esto **no reabre** el dinero:

- El presupuesto sigue viviendo en Campañas, fuente única.
- El total incluye la línea de traslado.
- Un solo bloque de presupuesto en la ficha de ruta, solo lectura.
- Líneas con origen `inspeccion` | `manual` | `traslado`.
- Campaña aceptada (`confirmado`) → modal Crear ruta, 3 salidas, con/sin
  fecha → Agendado / Prospectos.

Lo que sí cambia: la campaña deja de ser “el saco de todo lo del coche” y
pasa a ser “el presupuesto que agrupa las alertas que el taller elige
vender ahora”.

---

## 12. Lo que este documento no cubre

- Copy, layout pixel-perfect, ni tokens nuevos del semáforo.
- Automatizar el envío (`campanas_auto` sigue apagado en feature switches).
- Seguros bajo demanda.
- Migración de los seeds actuales (`OP-3001`…): se diseña cuando se
  construya, no ahora.

---

## 13. Preguntas abiertas (decidir antes de construir)

### 13.1 ¿`campana_items` es la alerta, o hace falta `servicio_alertas`?

**Pendiente de tu decisión. Recomendación CTO: tabla nueva `servicio_alertas`.
No aplicada.**

Cambio respecto a la versión anterior de este doc (que recomendaba reusar):
§13.5 ya cerró que un presupuesto en vuelo se **cancela** y la alerta
**sigue** (o se reemplaza). Eso son dos ciclos de vida. Meterlos en la
misma fila es el atajo que luego duele.

**Opción A — reusar `campana_items`** (más simple ahora)

- Pros: una tabla menos; `fecha` / `tipo` / `valor` ya existen; la UI
  actual ya itera `campana.items`.
- Contras: `campana_id` nullable (un “ítem de campaña” sin campaña).
  `cancelado` del presupuesto y `es_actual` de la alerta pelean en la
  misma fila: ¿apagas el ítem, cancelas la campaña, o las dos? Recotizar
  obliga a clonar líneas o a “des-cancelar”. `solo_total` no es 1:1 con
  alertas. Una alerta no puede pasar de un presupuesto cancelado a uno
  nuevo sin duplicar o mutar historia comercial.

**Opción B — `servicio_alertas` + `campana_items` como línea** (recomendado)

- Pros: la alerta es el problema del coche (`es_actual`, fecha, semáforo).
  La campaña es el presupuesto (avance, `cancelado` con motivo). Recotizar
  = nueva campaña que apunta a las mismas o nuevas alertas. El sello de
  inspección no se toca. Encaja con Pasada B (`es_actual` en lo
  versionable). Las migraciones **aún no están aplicadas**: el coste de
  la tabla extra es ahora, no dentro de un año con datos reales.
- Contras: un join más; hay que explicar tres niveles al construir
  (hallazgo → alerta → línea). Más DDL en el bloque que toque Campañas.

Si eliges A para ir más rápido, lo acepto, pero deja por escrito que
recotizar clona ítems y que `campana_id` null es deuda. No lo parchees
después con una cuarta semántica sobre la misma tabla.

### 13.2 Nombre del flag vs nombre del semáforo — CERRADO

`es_actual` = esta lectura cuenta hoy.
Semáforo = `vigente` / `por_vencer` / `vencido` / `caducado` (urgencia por
fecha). No comparten nombre. No usar `vigente` como boolean.

### 13.3 ¿Qué pasa con `caducada`? — CERRADO PARA LA UI

`caducado` es el semáforo físico cuando han pasado 45 días desde la fecha
recomendada. Se clasifica para no mezclarlo con `vencido`, pero la tabla
operativa actual no lo muestra ni lo suma al presupuesto. Queda para histórico
o perfil del cliente. No confundirlo con `cancelado` (§13.5): ese es “este
presupuesto ya no describe el coche”.

### 13.4 Catálogo de `componente_key`

**Pendiente de tu decisión. Recomendación CTO abajo. No aplicada.**

Hoy `CATALOGO_DETECCION` ya es un catálogo cerrado de **tipo de servicio**,
no de posición:

`neumaticos`, `frenos`, `focos`, `itv`, `alineacion`, `aceite`, `bateria`,
`escobillas`, `filtros`, `refrigerante`.

**Recomiendo adoptar ese grano como `componente_key`.** Es el mismo que
el tempario (`SV-02` neumáticos, `SV-03` pastillas…). La obsolescencia
casa con “el servicio que venderíamos”, que es lo que el taller opera.

| Grano | Pros | Contras |
|---|---|---|
| **Tipo de servicio (recomendado)** — `neumaticos`, `frenos` | Match de caso B trivial (“incidencia en neumáticos” apaga la alerta de neumáticos). Una fecha recomendada por servicio. El catálogo ya existe. | No puedes tener el delantero derecho para septiembre y el trasero para diciembre como dos alertas. La posición vive en `datos` / métrica, como hoy. |
| Posición dentro de la clave — `neumaticos:delantero_derecho` | Más fiel al coche. | Caso B sin posición no sabe cuál apagar: o apagas las cuatro, o no apagas ninguna. El conductor no mide por esquina siempre. Cuatro veces más filas. |
| Texto libre de `item` | Cero catálogo. | El versionado no puede hacer match. Inviable. |

Frenos: el catálogo actual unifica `frenos` → pastillas (`SV-03`). Si un
día pastillas delanteras y traseras son dos servicios del tempario con
fechas distintas, se parte la clave entonces (`frenos_delanteros` /
`frenos_traseros`), no ahora. No adelantes grano que el check-in no
captura.

La posición (delantero derecho, mm, %) **sí se guarda** en el hallazgo /
`datos`; solo no entra en la clave de match.

Lo que necesito que confirmes: ¿aceptas el catálogo de `CATALOGO_DETECCION`
como lista cerrada de `componente_key`, o quieres partir neumáticos o
frenos por eje desde el día uno?

### 13.5 Presupuesto ya enviado + dato físico nuevo — CERRADO

No se anula ni se borra. El presupuesto abierto (`nueva` | `valorada` |
`enviada`) pasa a **`cancelado` con motivo**. El sistema avisa al taller
de que quedó obsoleto; el taller decide re-cotizar con el dato fresco.
Detalle operativo en §7.2. Confirmado con ruta sigue en §13.12.

### 13.6 Filtro semáforo y grupos mixtos

Si un coche tiene 1 vencido y 2 vigentes, ¿aparece en “Vencido” con las
tres alertas visibles, o solo la vencida, o en todos los chips que le
toquen? Recomendación: aparece en el chip filtrado; dentro se ven todas
las actuales, con las que no coinciden atenuadas.

### 13.7 `campanas.fecha` y `campana_items.dias`

¿Se deprecan o se les da otro significado (fecha de envío, snapshot
informativo)?

### 13.8 Campañas sin inspección

Garantía, cotización a un lead, `solo_total` cerrado a mano. ¿Nacen como
alertas `es_actual` sin `hallazgo_id`, con fecha que pone el taller, y el
semáforo corre igual? ¿O el bloqueo de vigentes **no** aplica a lo
manual, porque no es un problema físico detectado?

### 13.9 Zona horaria y “hoy”

¿Calendario de la sucursal? ¿Europe/Madrid fijo? A las 00:10 un ítem puede
pasar de `por_vencer` a `vencido` para un taller y no para otro si usamos
UTC.

### 13.10 Envío parcial

¿Una campaña puede mezclar ítems vigentes (bloqueados) con ítems
enviables, o al armar el presupuesto solo entran los desbloqueados?

### 13.11 Check-in y check-out

¿Los dos disparan versionado, o solo el check-in (estado al recoger) / solo
el check-out (estado al dejar)? Si los dos, un mismo viaje puede
obsolescer dos veces el mismo componente en el mismo día.

### 13.12 Alertas confirmadas (ya hay ruta)

Cuando `es_actual` se baja porque el coche volvió, ¿la ruta generada sigue
ligada a la campaña, y la alerta nueva es otra historia? ¿O el confirmado
congela esa alerta y el versionado no la apaga (ya se vendió, ya se
agendó)?

### 13.13 `tiene_detalle`

¿Quién lo marca? ¿Regla automática (hay `metrica` no vacía, o `foto_url`,
o `severidad != ok`)? ¿El conductor elige “vi el componente pero no pude
medir”? Sin criterio cerrado, el caso B no es implementable.

---

## 14. Lecturas de origen

- `DECISIONES.md` D10 — dos ejes, `es_actual`, presupuesto en vuelo cancelado.
- `_diseno-ideal/MODELO.md` §6 — presupuesto en Campañas, avance manual.
- `MODELO-DATOS.md` — dinero en céntimos; `campanas` con `sucursal_id`;
  inspecciones heredan tenant por la ruta.
- `supabase/migrations/0002_bloque2_negocio.sql` — DDL actual de
  `inspecciones`, `inspeccion_hallazgos` (sin UPDATE), `campanas`,
  `campana_items`.
- `src/lib/mecanu/types.ts` — `Campana`, `CampanaItem`, `HallazgoInspeccion`.
- `src/components/taller/campanas/` — kanban por estado de presupuesto.
- `PERMISOS.md` invariante 7 — evidencia sellada.
