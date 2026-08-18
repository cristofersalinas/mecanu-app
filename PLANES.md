# Planes, cuotas y excedentes — Mecanu

## Los tres planes

| | Alta | Lujo | Hyper |
|---|---|---|---|
| **Traslados creados / mes** | 20 | 100 | custom (sin límite fijo) |
| **Conductores registrados** | 3 | 8 | custom |
| **Sucursales activas** | 1 | 2 | custom |
| **WhatsApp msgs / mes** | 10 (número Mecanu) | ilimitado (número propio) | custom |
| **Precio base mensual** | configurable en BD | configurable en BD | `null` — negociado y facturado 100% fuera de la plataforma |

Los precios viven en `planes_config.precio_mensual_cents` — nunca como constantes
en código (`AGENTS.md`: "Límites, cuotas y precios de excedente son datos
configurables, nunca constantes en el código").

**Hyper confirmado como negociado y facturado 100% fuera de la plataforma**: no
tiene límites numéricos fijos (todas las filas de `plan_limites` para este plan
tienen `limite = null`), no tiene precio base en BD
(`planes_config.precio_mensual_cents = null`), y no se crea ninguna tabla de
precios de excedente para él — simplemente no hay filas en `plan_precios_overage`
con `plan = 'hyper'`. El sistema nunca genera un `usage_overages` para Hyper.

---

## Dimensiones de cuota

| Clave en BD (`dimension`) | Qué cuenta | Cuándo incrementa |
|---|---|---|
| `traslados_creados` | Rutas creadas — cada ruta es un "traslado" en el sentido comercial del plan (ver `MODELO.md`, decisión #6: los antiguos traslados son ahora rutas con el mismo id) | Al insertar una fila en `rutas` |
| `conductores_activos` | Conductores con rol `conductor_interno` y `user_org_roles.activo = true` en el grupo del taller | Al activar/desactivar un conductor (gauge, no acumulativo) |
| `sucursales_activas` | Sucursales con `sucursales.activa = true` | Al activar/desactivar una sucursal (gauge) |
| `whatsapp_msgs_mes` | Mensajes enviados con confirmación del proveedor | Al recibir confirmación de envío exitoso |

**Renombrado de `traslados_completados` a `traslados_creados` — corregido tras
esta pasada.** El nombre anterior contradecía la decisión de que el contador
suma al **crear** la ruta, no al completarla — y también se refería, por su
nombre, a la tabla técnica `traslados` (los tramos TS-*) en vez de a `rutas`
(el "traslado" en el sentido comercial del plan, id TR-*). Quien implemente esto
sigue el nombre de la columna, no una nota al pie que lo contradiga — de ahí que
el cambio sea de nombre y de trigger, no solo documentación aclaratoria.

**`conductores_activos` cuenta solo `conductor_interno`, nunca `conductor_flota`.**
Un conductor de la flota Mecanu pertenece al grupo `tipo='mecanu'`
(`user_org_roles.grupo_id`), no al grupo del taller, aunque tenga una fila en
`user_sucursal_access` apuntando a una sucursal del taller — por eso nunca cuenta
contra la cuota de "conductores registrados" del plan. Es coherente con la idea
de que un conductor de flota se pide bajo demanda, no se "registra" en la
plantilla del taller. Si en el futuro Mecanu cobra por uso de flota, será un
dimension distinto (ver `PREGUNTAS-ABIERTAS.md` §28), no una variante de este contador.

`conductores_activos` y `sucursales_activas` son **gauges** (estado actual, no
acumulado): `usage_counters.contador` se actualiza con un `SET contador = (subquery
de count)`, no con `contador + 1`. Esto evita derivas si un conductor se activa
y desactiva varias veces en el mismo mes.

---

## Precios de excedente

Todos los importes en **céntimos** (`int`). La columna en BD es
`plan_precios_overage.precio_unitario_cents`.

| Dimensión | Alta | Lujo | Hyper |
|---|---|---|---|
| `traslados_creados` | 290 cts/traslado | 290 cts/traslado | fuera de plataforma |
| `conductores_activos` | 490 cts/mes | 490 cts/mes | fuera de plataforma |
| `sucursales_activas` | 1.390 cts/mes | 1.390 cts/mes | fuera de plataforma |
| `whatsapp_msgs_mes` | tope duro (no excedente) | ilimitado | fuera de plataforma |

WhatsApp en plan Alta es la excepción: **no hay excedente de pago**. El mensaje
11.º no se envía y el servidor responde `429` con `code: "quota_exceeded"`. El
motivo es de negocio: el WhatsApp ilimitado es el argumento de venta del plan Lujo
— cobrar el excedente quitaría urgencia al upgrade.

Para los otros tres: **el excedente nunca bloquea la acción**. La ruta se crea,
el conductor se activa, la sucursal se habilita — y luego se registra el
overage en `usage_overages`.

---

## Lógica de contadores

### Ciclo mensual y nivel Grupo

Los contadores de `usage_counters` tienen clave `(grupo_id, periodo, dimension)`.
`periodo` es siempre el primer día del mes (`date_trunc('month', now())`).

No hay reset explícito a comienzo de mes: el primer evento del mes genera una
fila nueva con el período actual. Los eventos del mes anterior quedan en filas
de períodos anteriores — el historial permanece íntegro.

Los contadores son al nivel del **Grupo**, no por sucursal. Un Grupo con 2
sucursales en plan Lujo comparte los 100 traslados/mes entre las dos. No existen
límites por sucursal.

### INSERT atómico

```sql
INSERT INTO usage_counters (grupo_id, periodo, dimension, contador)
VALUES ($1, date_trunc('month', now()), $2, 1)
ON CONFLICT (grupo_id, periodo, dimension)
DO UPDATE SET contador = usage_counters.contador + 1;
```

Para gauges (`conductores_activos`, `sucursales_activas`):

```sql
UPDATE usage_counters
SET contador = (
  SELECT count(*) FROM user_org_roles
  WHERE grupo_id = $1
    AND rol = 'conductor_interno'
    AND activo = true
)
WHERE grupo_id = $1 AND periodo = date_trunc('month', now())
  AND dimension = 'conductores_activos';
```

Nótese que esta query filtra por `grupo_id = $1` directamente en
`user_org_roles`, sin pasar por `sucursales` — un `conductor_interno` pertenece
al grupo del taller sin importar a cuántas sucursales tenga acceso (ver
`user_sucursal_access` en `MODELO-DATOS.md`). `conductor_flota` queda excluido
por el filtro `rol = 'conductor_interno'`, coherente con la nota de la sección
anterior.

### Registro de excedente

Cuando `contador` supera `plan_limites.limite` (y la dimensión tiene fila en
`plan_precios_overage`):

1. La acción se ejecuta igualmente.
2. Se inserta una fila en `usage_overages` con el precio unitario snapshot del
   momento (el precio puede cambiar en el futuro sin retroactividad).
3. Al final del período de facturación, todas las filas `WHERE facturado = false
   AND revertido = false` del Grupo se agregan a la factura.

---

## Reversión de `traslados_creados` al cancelar una ruta

`traslados_creados` suma al crear la ruta, no al completarla. Pero una ruta se
puede cancelar después de creada, y no toda cancelación debe seguir contando
contra la cuota del mes — depende de cuándo se cancela respecto al día de
servicio.

**Regla de la línea de corte — documentada aquí explícitamente para que quien
implemente no la infiera de un nombre de columna o de un comentario suelto:**

| Situación al cancelar | ¿Se revierte el contador? |
|---|---|
| La ruta no tenía día de servicio comprometido (seguía en Prospectos) | **Sí, siempre** |
| Se cancela **antes** del día de servicio | **Sí** |
| Se cancela **el mismo día del servicio o después** | **No** — el cargo se mantiene |

La razón de negocio: el día de servicio es cuando ya hay conductor y cliente
comprometidos. Cancelar con margen no consume nada real; cancelar el mismo día
o después sí consume un recurso que el taller ya había reservado, así que el
cargo se queda.

El "día de servicio" es el más temprano de los `traslados.ventana_fecha` de esa
ruta, calculado en el momento de la cancelación (no fijado al crear la ruta —
una reprogramación puede haberlo movido desde entonces). Ver
`MODELO-DATOS.md` sección "Reversión de `traslados_creados` al cancelar" para
el trigger completo.

Qué toca la reversión cuando aplica:
1. **`usage_counters.contador`** del mes en que se **creó** la ruta (no el mes
   de la cancelación, si son distintos) se decrementa en 1.
2. Si esa unidad concreta ya había generado un cargo de excedente
   (`usage_overages` con `entidad_id = ruta.id`), esa fila se marca
   `revertido = true` — **nunca se borra**, queda como rastro de que hubo un
   cargo y se anuló, y por qué.
3. Se registra un evento en `audit_events` (`accion =
   'contador_traslado_revertido'`) en los dos casos — haya o no un cargo de
   excedente de por medio. La reversión del contador es auditable siempre, no
   solo cuando hay dinero involucrado.

Caso fuera de esta pasada: si el cargo ya estaba `facturado = true` cuando
llega la reversión (factura ya emitida), se marca `revertido = true` igualmente
pero no se genera automáticamente una nota de crédito — es un flujo de
facturación aparte, no resuelto aquí. Solo puede pasar si la cancelación llega
después de cerrado el período, un caso ya poco común porque la línea de corte
por día de servicio descarta la mayoría de cancelaciones tardías.

---

## Recargo de flota Mecanu (plan Alta)

Nuevo tras esta pasada — no vivía en ninguna tabla. El plan Alta puede solicitar
un conductor de la red Mecanu (`conductor_flota`) pagando un **recargo del 35%
sobre la tarifa de Lujo**, en vez de tener vetado el servicio o pagar una tarifa
propia independiente.

Modelo: `plan_precios_flota` (ver `MODELO-DATOS.md`). Lujo tiene una tarifa
propia (`tarifa_base_cents`); Alta no tiene tarifa propia, sino una referencia
relativa (`recargo_pct = 35`, `recargo_sobre_plan = 'lujo'`). El precio efectivo
para Alta se resuelve en el momento de la asignación:

```
precio_flota(plan) →
  SI plan_precios_flota.tarifa_base_cents no es null para este plan
    → ese valor
  SI NO
    → precio_flota(recargo_sobre_plan) * (1 + recargo_pct / 100)
```

Flujo de asignación:
1. El taller en plan Alta solicita un `conductor_flota` para un traslado.
2. El servidor resuelve `precio_flota('alta')` → tarifa de Lujo × 1,35.
3. El traslado se asigna igualmente — el recargo no bloquea, igual que el resto
   de excedentes de este documento.
4. Se registra en `usage_overages` con `dimension = 'conductor_flota_uso'` y
   `precio_unitario_cents` = el precio resuelto en el paso 2, snapshoteado en
   ese momento (si la tarifa de Lujo cambia después, el cargo ya registrado no
   cambia retroactivamente).

No es una fila de `plan_limites`/`plan_precios_overage` porque no hay un límite
que superar — es un servicio que Alta no incluye por defecto y paga cada vez que
lo usa, disponible desde la primera solicitud, no solo al agotar una cuota.

La tarifa base de Lujo (`plan_precios_flota.tarifa_base_cents` para `'lujo'`)
está pendiente de decisión de pricing — mismo estado que los precios base de
`planes_config`, ver `PREGUNTAS-ABIERTAS.md` §27 (ampliada a incluir esta tarifa).

---

## WhatsApp en plan Alta: degustación

El plan Alta incluye 10 mensajes WhatsApp/mes a través del **número de Mecanu**
(no el número propio del taller). Sirve para que el taller vea el flujo completo
de Campañas antes de contratar Lujo.

Comportamiento paso a paso:
1. El taller envía un mensaje de campaña → `whatsapp_msgs_mes.contador` sube.
2. Antes del envío, el servidor consulta `usage_counters` y `plan_limites`.
3. Si `contador < limite` (10) → envía con el número de Mecanu.
4. Si `contador >= 10`:
   - El servidor responde `429 Too Many Requests`:
     ```json
     { "error": { "code": "quota_exceeded", "plan_actual": "alta",
       "dimension": "whatsapp_msgs_mes", "limite": 10 } }
     ```
   - La UI del Panel deshabilita el botón de enviar y muestra el aviso de upgrade.
   - No se registra overage — no hay cargo.
5. En plan Lujo: el switch `whatsapp_propio` permite configurar el número propio
   del grupo en `whatsapp_config`. Mensajes ilimitados.

---

## Degustación de IA (`ia_diagnostico`)

Estado actual: `feature_switches_catalog.global_activo = false`. Mecanu lo
activará cuando el producto IA esté listo.

Comportamiento previsto cuando se active:
- Plan Alta: los hallazgos de check-in muestran un bloque "Diagnóstico preliminar
  (beta)" con una marca visual de IA — el servicio recomendado y el precio estimado
  están visibles pero marcados como "vista previa".
- Plan Lujo+: los resultados completos (recomendación confirmada, integración con
  tempario) sin marca de beta.

La distinción exacta Alta/Lujo para IA está en **PREGUNTAS-ABIERTAS.md §21** —
no está decidida todavía.

---

## Cambio de plan

Solo `grupo_admin` y `mecanu_admin` pueden cambiar el plan (`configuracion.cambiar_plan`).

Flujo de upgrade (Alta → Lujo):
1. `grupo_admin` selecciona Lujo en la configuración.
2. El servidor actualiza `org_plan.plan = 'lujo'` y registra en `audit_events`
   con `accion = 'cambio_plan'`, `payload_antes = {plan: 'alta'}`,
   `payload_despues = {plan: 'lujo'}`.
3. Los contadores del mes en curso **no se resetean** — el nuevo plan aplica
   desde el momento del cambio. Los traslados ya completados ese mes cuentan.

Flujo de downgrade (Lujo → Alta):
1. El servidor verifica que `sucursales_activas ≤ 1` antes de confirmar.
2. Si el Grupo tiene 2 sucursales activas: la UI pide desactivar una primero.
   El servidor valida este mismo check — la UI no puede omitirlo.
3. El servidor verifica que `conductores_activos ≤ 3`.
4. Si el mes en curso ya tiene > 20 rutas creadas (`traslados_creados`): no se
   bloquea el downgrade, pero el excedente del mes ya registrado en
   `usage_overages` permanece.
5. Los switches que requieren plan Lujo (`whatsapp_propio`, `seguro_demanda`)
   se desactivan automáticamente para el Grupo — la función de reconciliación
   actualiza sus filas `origen = 'plan'` a `activo = false`. Las filas
   `origen = 'excepcion'` (activadas manualmente fuera del plan) no se tocan.

---

## Valores iniciales de la BD (semilla de migración)

```sql
-- planes_config
INSERT INTO planes_config (nombre, descripcion, precio_mensual_cents, updated_at) VALUES
  ('alta',  'Plan de entrada para talleres pequeños',       0,    now()),
  ('lujo',  'Plan para talleres en crecimiento',            0,    now()),
  ('hyper', 'Plan enterprise — precio negociado',           null, now());
-- (precio_mensual_cents de alta/lujo pendiente de decisión de pricing — ver PREGUNTAS-ABIERTAS.md §27.
--  hyper es null a propósito: negociado y facturado 100% fuera de la plataforma, no en BD.)

-- plan_limites
INSERT INTO plan_limites (plan, dimension, limite) VALUES
  ('alta',  'traslados_creados',      20),
  ('alta',  'conductores_activos',    3),
  ('alta',  'sucursales_activas',     1),
  ('alta',  'whatsapp_msgs_mes',     10),
  ('lujo',  'traslados_creados',     100),
  ('lujo',  'conductores_activos',     8),
  ('lujo',  'sucursales_activas',      2),
  ('lujo',  'whatsapp_msgs_mes',    null),  -- ilimitado
  ('hyper', 'traslados_creados',    null),
  ('hyper', 'conductores_activos',   null),
  ('hyper', 'sucursales_activas',    null),
  ('hyper', 'whatsapp_msgs_mes',     null);

-- plan_precios_overage
-- WhatsApp de Alta NO tiene fila aquí (tope duro, no excedente de pago)
INSERT INTO plan_precios_overage (plan, dimension, precio_unitario_cents) VALUES
  ('alta',  'traslados_creados',      290),
  ('alta',  'conductores_activos',    490),
  ('alta',  'sucursales_activas',    1390),
  ('lujo',  'traslados_creados',      290),
  ('lujo',  'conductores_activos',    490),
  ('lujo',  'sucursales_activas',    1390);
-- Hyper: sin filas — el sistema no genera overages automáticos para Hyper

-- plan_precios_flota
INSERT INTO plan_precios_flota (plan, tarifa_base_cents, recargo_pct, recargo_sobre_plan, updated_at) VALUES
  ('lujo',  null, null, null, now()),  -- tarifa_base_cents pendiente, ver PREGUNTAS-ABIERTAS.md §27
  ('alta',  null, 35.00, 'lujo', now());
-- Hyper: sin fila — negociado, mismo criterio que plan_precios_overage.
-- NOTA: la fila de 'lujo' de arriba viola el constraint (tarifa_base_cents
-- pendiente de decidir un valor real antes de poder insertarla — ver PLANES.md
-- "Recargo de flota Mecanu (plan Alta)").

-- feature_switches_catalog
-- Sin columna plan_minimo: qué features incluye cada plan por defecto vive en
-- código (PLAN_FEATURES_DEFAULT en src/lib/mecanu/planes.ts), no en esta tabla —
-- ver PERMISOS.md "Features en base de datos".
INSERT INTO feature_switches_catalog (feature, descripcion, activo_global, updated_at) VALUES
  ('gps_tracking',        'Trail GPS del conductor durante el traslado',            false, now()),
  ('campanas_auto',       'Campañas automáticas desde hallazgos de check-in',       true,  now()),
  ('checkin_video',       'Video obligatorio en el check-in del conductor',         false, now()),
  ('ia_diagnostico',      'Preview de diagnóstico IA en hallazgos',                 false, now()),
  ('seguro_demanda',      'Seguro Mecanu bajo demanda por traslado',                false, now()),
  ('whatsapp_propio',     'Número WhatsApp Business propio del Grupo',              false, now()),
  ('notificaciones_push', 'Push al conductor para nuevos traslados y resoluciones', false, now());
```
