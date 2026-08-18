# Seguros y cobertura — Mecanu

## Los tres tipos de cobertura

### 1. Seguro propio externo
El Grupo tiene contratada su propia póliza con una aseguradora externa. Mecanu no
intermedia ni gestiona la póliza — solo registra los datos de vigencia en
`seguros_externos` para mostrar el escudo de cobertura y advertir de caducidad.

Características:
- El `grupo_admin` o `sucursal_admin` introduce los datos manualmente
  (permiso `configuracion.switches` no aplica aquí — es una tabla de datos propia,
  no un feature switch; el permiso relevante lo cubre el acceso general al Panel).
- Cubre todos los traslados de todas las sucursales del Grupo mientras la póliza
  esté vigente.
- La UI muestra advertencia ámbar cuando queden ≤ 30 días para `vigente_hasta`.
- `traslados.seguro_tipo = 'externo'` en todos los traslados mientras la póliza
  esté vigente y ninguna otra cobertura Mecanu esté activa.

### 2. Seguro Mecanu mensual fijo
Mecanu actúa como proveedor de cobertura para los traslados del Grupo. El Grupo
paga una cuota fija mensual y todos sus traslados quedan cubiertos automáticamente.

Características:
- No tiene tabla propia: la fuente de verdad es la fila en `org_feature_switches`
  con `feature = 'seguro_mecanu_mensual'` y `activo = true`.
- El cargo mensual se registra en `usage_overages` como `dimension =
  'seguro_mecanu_mensual'` con el precio fijo como `precio_unitario_cents`.
- Al crear un traslado mientras el switch esté activo: `seguro_tipo = 'mecanu_mensual'`
  se asigna automáticamente.
- Si el Grupo también tiene un seguro externo vigente: el mensual de Mecanu
  tiene prioridad (es la cobertura activa). Se documenta en `audit_events`.

### 3. Seguro Mecanu bajo demanda
Cobertura por traslado, activada en el momento de la asignación del conductor.

Características:
- **Default global: OFF** (`feature_switches_catalog.activo_global = false` para
  `seguro_demanda`). El taller no sabe que existe mientras Mecanu no lo active.
  **Estado actual: en espera de producto** — el modelo de datos, el precio y el
  flujo de UI están completos, pero el switch permanece apagado hasta que Mecanu
  tenga el producto asegurador listo. Ver `AGENTS.md`.
- Incluido por defecto en plan Lujo (vía `PLAN_FEATURES_DEFAULT` en código, no en
  esta tabla — ver `PERMISOS.md`).
- Al activar globalmente: en la pantalla de asignación del conductor (Panel),
  `sucursal_admin` o `grupo_admin` ve "Activar cobertura Mecanu para este
  traslado (X,XX €)".
- Al confirmar: `traslados.seguro_tipo = 'mecanu_demanda'`,
  `seguro_demanda_activado_en = now()`,
  `seguro_demanda_precio_cents = <precio del catálogo en ese momento>`.
- El precio se toma de `plan_precios_overage` con `dimension = 'seguro_demanda'`.
- Se registra en `usage_overages` para facturación y en `audit_events` para
  trazabilidad legal.

---

## Matriz de responsabilidad

Dos variables determinan quién responde ante un siniestro:

**A. Tipo de conductor** — determinado por el rol en `user_org_roles`, no por un
campo suelto:
- **`conductor_interno`**: empleado o contratado directo del Grupo/Sucursal.
- **`conductor_flota`**: conductor de la red Mecanu (pertenece al grupo
  `tipo='mecanu'`), asignado puntualmente al taller vía `user_sucursal_access`.

`conductores.red` (si se mantiene como campo informativo denormalizado) debe
coincidir con el rol del `usuario_id` vinculado — el rol es la fuente de verdad
para efectos de seguro y permisos, no el campo de texto libre.

**B. Cobertura activa en el traslado** (`traslados.seguro_tipo`):

| | `externo` (seguro propio) | `mecanu_mensual` | `mecanu_demanda` | `ninguno` |
|---|---|---|---|---|
| **`conductor_interno`** | Seguro del Grupo responde | Mecanu responde | Mecanu responde | Grupo responde sin red |
| **`conductor_flota`** | Seguro del Grupo responde ⚠️ | Mecanu responde | Mecanu responde | Bloqueado — no asignar |

⚠️ **Advertencia en `conductor_flota` + seguro propio**: si el seguro propio del
Grupo cubre o no a conductores de la flota Mecanu depende de cada póliza. Mecanu
no puede garantizarlo. La UI debe advertir al operador cuando asigne un
`conductor_flota` a un traslado con `seguro_tipo = 'externo'` — ver
`PREGUNTAS-ABIERTAS.md §22`.

**Bloqueado — no asignar**: un `conductor_flota` no debe operar sin cobertura
Mecanu. Si `seguro_demanda` está OFF globalmente (estado actual — en espera de
producto) y el Grupo no tiene `seguro_mecanu_mensual` activo, el endpoint de
asignación rechaza con:
```json
{ "error": { "code": "cobertura_requerida",
  "message": "Este traslado no tiene cobertura Mecanu activa. Solo puedes asignar conductores internos." } }
```
La validación vive en el servidor, no solo en la UI.

---

## Escudo de color — árbol de decisión

El escudo de cobertura se muestra en toda vista de traslado activo (Panel y
conductor). Se calcula en tiempo real a partir de `traslados.seguro_tipo` y el
estado actual del seguro del Grupo.

```
¿Estado de la ruta es 'prospectos' o 'cancelado'?
  → Sin escudo (no hay conductor ni cobertura comprometida)

Para cualquier otro estado (agendado, en_ruta, en_taller, completado):

  seguro_tipo = 'externo'
    seguros_externos.vigente_hasta < hoy
      → ROJO: "Seguro caducado"
    seguros_externos.vigente_hasta < hoy + 30 días
      → ÁMBAR: "Seguro vence en X días"
    → VERDE: "Cubierto por seguro propio"

  seguro_tipo = 'mecanu_mensual'
    org_feature_switches.activo = true para feature = 'seguro_mecanu_mensual'
      → VERDE: "Cubierto por Mecanu mensual"
    (el switch se desactivó después de crear el traslado — caso anómalo)
      → ROJO: "Error de cobertura — revisar"

  seguro_tipo = 'mecanu_demanda'
    → VERDE: "Cubierto por Mecanu (bajo demanda)"

  seguro_tipo = 'ninguno'
    → ROJO: "Sin cobertura"
```

### Tokens del design system

| Color | Token | Icono Material Symbols |
|---|---|---|
| VERDE | `--mecanu-emerald-600` | `verified_user` |
| ÁMBAR | `--mecanu-amber-600` | `warning` |
| ROJO | `--mecanu-red-600` | `gpp_bad` |

---

## Eventos en `audit_events`

Toda acción sobre seguros con impacto legal deja traza inmutable:

| Acción | `accion` en audit_events |
|---|---|
| Introducir / actualizar datos de seguro externo | `seguro_externo_actualizado` |
| Activar seguro Mecanu mensual | `seguro_mecanu_mensual_activado` |
| Desactivar seguro Mecanu mensual | `seguro_mecanu_mensual_desactivado` |
| Comprar seguro bajo demanda para un traslado | `seguro_demanda_activado` |
| Reporte de siniestro (`POST /api/v1/incidencias`) | `incidencia_reportada` |
| Resolución de incidencia por el taller | `incidencia_resuelta` |

Estas filas son inmutables y sirven como prueba de que la cobertura existía en el
momento del traslado, aunque la póliza expire o el switch se desactive después.

El `payload_antes` incluye el snapshot del `seguro_tipo` del traslado y la
vigencia del seguro externo (si aplica) en el momento del evento.

---

## Preguntas abiertas de este módulo

Ver `PREGUNTAS-ABIERTAS.md`:
- §22: ¿Debe la UI advertir al asignar conductor externo a traslado con seguro propio?
- §23: Conductor externo + `seguro_tipo = 'ninguno'`: ¿el bloqueo es hard (servidor)
  o soft (UI advierte pero deja continuar)?
- §24: ¿El precio del seguro bajo demanda es fijo (constante por traslado) o varía
  por tipo de vehículo, distancia u otras variables?
