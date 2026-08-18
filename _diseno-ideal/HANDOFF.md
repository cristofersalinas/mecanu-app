# HANDOFF — Mecanu

Documento de traspaso para implementación. Cubre: pantallas, componentes, tokens visuales, flujos de navegación y todo dato mockeado que en producción debe venir de una API.

**Producto**: Mecanu (mecanu.com) — logística B2B para talleres. Recogida y devolución de coches a domicilio, con seguro durante todo el traslado. Mecanu es la capa de relación con el cliente del taller; **nunca** gestiona inventario ni facturación del taller.

**Idioma**: es-ES, tuteo, sin emoji. Dinero formato `1.234,56 €`, **siempre** indicando si incluye IVA. Estados canónicos de cara al usuario: En Ruta / En Taller / Terminado.

---

## 1 · Superficies y archivos

| Archivo | Superficie | Usuario | Grid |
|---|---|---|---|
| `Mecanu Panel.dc.html` | Panel de administración web (desktop) | Operador del taller | Standard, denso, ratón |
| `Mecanu Conductor.dc.html` | App web móvil | Conductor (interno o red externa Mecanu) | Compact, táctil ≥48px |
| `mecanu-pipeline.js` | Config declarativa | — | estados, subestados, columnas, tags, presupuestos, reglas |
| `mecanu-rutas.js` | Modelo de dominio | — | construye RUTAS/PARADAS/TRASLADOS/LOGS/PRESUPUESTOS/CAMPAÑAS; re-exporta los otros dos |
| `mecanu-data.js` | Entidades base | — | CLIENTES, VEHICULOS, CONDUCTORES, TEMPARIO, INSPECCIONES_RAW, OPORTUNIDADES_BASE |
| `mecanu-whatsapp.js` | Simulación WhatsApp Cloud API | — | solo para el módulo Campañas |

El panel importa **solo** `mecanu-rutas.js`. Ambas superficies comparten el mismo modelo.

---

## 2 · Modelo de dominio (esto es lo que el backend debe implementar)

```
RUTA (id TR-*)  ← la card del kanban; el ESTADO vive aquí
 ├── N PARADAS (PD-*)      tipo: cliente | proveedor(taller|itv|chapista|otro)
 ├── N-1 TRASLADOS (TS-*)  rol: ida | vuelta | interno
 │     ├── ventana { fecha, inicio, fin }   ← SIEMPRE rango de 1 h
 │     ├── estado de ejecución propio (independiente del estado de la RUTA)
 │     └── LOGS (LG-*)     tipo · actor · triggerSource(manual|conductor|api|cron)
 └── PRESUPUESTO (PR-*)    vive en CAMPAÑAS · fuente única de verdad
```

**Reglas duras del modelo:**

1. El estado vive en la **RUTA**: 6 estados × 3-4 subestados. El TRASLADO tiene su propio estado de ejecución.
2. `RUTAS_VISTA` / `vistaRuta(r)` son la fachada de lectura: aplanan tramo activo, ventana, conductor, seguro y presupuesto para la UI. El backend debería exponer un equivalente (un `GET /rutas` ya aplanado) para no obligar al cliente a recomponer.
3. **El total del presupuesto INCLUYE la línea de traslado.** El traslado es un ítem del tempario del taller (`SV-11`), una línea más junto a las reparaciones. Ej: TR-1042 = 284,50 reparación + 90 traslados = **374,50 €**.
4. **Un solo dinero.** No se separa "importe del traslado" de "presupuesto de reparación".
5. El presupuesto **vive en Campañas** y es la fuente única. Estados: `nueva → valorada → enviada → aceptada | rechazada | caducada`.
6. Líneas de presupuesto con origen visible: `inspeccion` · `manual` · `traslado`.
7. Modo `solo_total`: el taller puede borrar el desglose y dejar solo la cifra. La ruta se crea igual.
8. `contactos` del vehículo son **derivados** de la relación m2m vehículo↔clientes. No se duplica el dato.
9. Ids conservados: los traslados antiguos son ahora rutas con el mismo id (TR-1042…).
10. Tags: **derivados** (calculados, no editables) vs **manuales** (persisten en `ruta.tagsManual`).

**Volumen del mock**: 29 rutas · 70 paradas · 41 traslados · ~290 logs · 40 presupuestos · 11 campañas · 14 clientes · 18 vehículos · 6 conductores.

### 2.1 · Estados y subestados de RUTA (`mecanu-pipeline.js` → `ESTADOS`)

| Estado | Subestados | Arrastrable en kanban | Quién lo mueve |
|---|---|---|---|
| `prospectos` | `sin_fecha`, `oferta_enviada`, `link_enviado`, `caducado`* | **Sí** (único) | Taller |
| `agendado` | `sin_conductor`, `asignado`, `aceptado` | No | Taller asigna; conductor acepta |
| `en_ruta` | `en_camino_origen`, `en_origen`, `en_transito`, `en_destino` | No | **Solo el conductor** |
| `en_taller` | `esperando_agenda_vuelta`, `oportunidad_vuelta`, `pendiente_confirmar_retiro` | No | Taller / cliente |
| `completado` | `ok`, `pendiente_cierre` | No | — |
| `cancelado` | `por_cliente`, `por_taller`, … | No | Taller, **motivo obligatorio** |

\* Subestados marcados `fueraDelPipeline` salen del tablero activo y viven en "Leads fríos" (`SUBESTADOS_FRIOS`). Caducado **no** es cancelado.

**Invariantes de producto (no negociables):**

- Solo Prospectos es arrastrable. El resto avanza por confirmación de conductor o cliente.
- Los 4 subestados de EN RUTA los mueve **solo el conductor** (en el mock hay un botón "Simular" en la ficha del panel que emula el webhook).
- Ventana horaria: **siempre** un rango de 1 h, nunca hora exacta. Si no hay ventana comprometida, **no se inventa**: se dice "Pendiente de agendar" o "Propuesta: …".
- Cobertura de seguro **siempre visible** en cualquier vista del viaje.
- Sin dato → decirlo explícitamente. Nunca datos de relleno.
- Añadir un estado / subestado / tag / columna = editar **solo** `mecanu-pipeline.js`.
- No hay roles ni permisos implementados todavía (ver §7).

### 2.2 · Tags derivados (calculados por el backend, no editables)

Definidos en `TAGS_DERIVADOS` con una función `calc(ctx)` cada uno. El backend debe calcular estos mismos:

| id | Condición |
|---|---|
| `sin_conductor` | ruta `agendado` + tramo activo sin `conductorId` |
| `en_riesgo` | igual que arriba y la ventana empieza en <24 h |
| `retrasado` | ruta `agendado` y la ventana empezó hace >15 min |
| `entrega_en_riesgo` | vuelta agendada + `ruta.vehiculoListo !== true` + algún tramo previo completado |
| `oportunidad_vuelta` | ruta `en_taller` sin tramo de vuelta (upsell vivo) |
| `larga_custodia` | en taller, en proveedor, con llegada y sin salida, >7 días |
| `sin_confirmar_cliente` | tramo con `ventanaModo: 'fija_taller'` y `clienteConfirmo !== true` |
| `inestable` | algún tramo con `reprogramaciones >= 2` |
| `doc_pendiente` | ruta `completado` + subestado `pendiente_cierre` |

Tags manuales preset (no se borran): `urgente`, `vip`, `no_rodante`, `cobro_pendiente`. Más los de la casa (editables).

**Contador de pestañas**: el badge numérico de las pestañas de sub-ambiente cuenta cards con acción pendiente del taller. Traslados usa el subconjunto `['sin_conductor','retrasado','entrega_en_riesgo','oportunidad_vuelta','sin_confirmar_cliente','inestable','doc_pendiente']`; Campañas usa los estados de presupuesto marcados `pendienteTaller` (`nueva`, `valorada`); Conductores usa `proceso === 'documentos_pendientes'` o algún `docs.*` en false. Cuando el número es 1 o 2 se muestra el detalle en tooltip; con 3+ solo la cifra.

---

## 3 · Pantallas

### 3.1 · Panel del taller (`Mecanu Panel.dc.html`)

Navegación lateral (6 módulos, `NAV_ITEMS`). Sidebar oscura de 240px, colapsable.

| Módulo | Sub-ambiente | Descripción |
|---|---|---|
| **General** | — | Dashboard: métricas del rango (7d/30d/…), km recorridos, ranking de conductores y de clientes, calificación media. Solo lectura. |
| **Tablero** | `Traslados` | Kanban de 6 columnas (una por estado) con cards de RUTA, o vista tabla/lista conmutable. Drag & drop solo desde Prospectos. Filtros + búsqueda con tolerancia a errores de tipeo y normalización de matrícula. |
| | `Campañas` | Presupuestos y oportunidades de upsell. Fuente única del dinero. Avance manual estado por estado, cada transición deja log. Panel lateral de simulación de WhatsApp. |
| **Contactos** | `Clientes` | Tabla de clientes con teléfono enmascarado, zona y vehículos asociados (m2m). |
| | `Conductores` | Tabla de conductores con proceso de onboarding, red (interna/externa), calificación. |
| **Tempario** | — | Catálogo de servicios y precios del taller. Incluye `SV-11` (el traslado como servicio). |
| **Conductores** (flota) | `Conductores` | Gestión de la flota interna: alta/edición de conductor, política de asignación, horario laborable, anulaciones puntuales, activación. |
| | `Agendar con Mecanu` | Asistente de 4 pasos para solicitar un conductor de la red externa Mecanu. Precio dinámico según día/hora/festivo, IVA 21 % incluido. |
| **Configuración** | `Perfil` | Datos del usuario, notificaciones, cambio de contraseña. |
| | `Empresa` | Datos fiscales del taller. |
| | `Sucursales` | Alta/edición de sucursales, zona horaria heredada. |
| | `Recepción` | Plantillas de check-in configurables (ítems e campos a inspeccionar). |

**Superficies secundarias del panel:**

- **Ficha de registro** (drawer ancho o pantalla completa) para ruta / cliente / vehículo / conductor. Pestañas: Actividad, Notas, Email\*, Llamada\* (\* bloqueadas, futura capa de comunicación). Rail derecho con tareas, logs y relacionados. Bloque "Presupuesto" solo lectura con desglose por origen.
- **Panel compacto lateral** (420px) al hacer clic en una fila de tabla.
- **Panel de WhatsApp** (420px) en Campañas: previa de plantilla y chat simulado.
- **Modal de inspección**: check-in completo del conductor con fotos, testigos, km, combustible, firmas de cliente y conductor.
- **Modales**: agendar (asistente), crear ruta desde campaña aceptada (3 salidas: tal cual / editar líneas / solo total), cancelar ruta (motivo obligatorio), confirmar entrega, editor de conductor, editor de tags, cambio de contraseña, simulador de cliente, visor de foto.

### 3.2 · App del conductor (`Mecanu Conductor.dc.html`)

Marco de iPhone 390×844. Offline-first.

| Pantalla | `data-screen-label` | Descripción |
|---|---|---|
| **Jornada** (lista) | `Jornada` | Pantalla raíz. KPI de traslados disponibles, botón SOS, card destacada del servicio actual (fondo degradado oscuro, botón de acción + Maps/Llamar verticales), lista del resto agrupada por día. Gesto: arrastrar una card >30 % de su ancho llama al cliente. |
| **Traslado** (detalle) | `Traslado` | Ficha del traslado: timeline Recogida→Tránsito→En Taller→Devolución, ventana, cobertura de seguro, origen/destino, acción principal, menú de solicitudes al taller, aviso de atraso, botón "Simular" del avance. |
| **Disponibles** | — | Bolsa de traslados que el taller deja libres; el conductor puede tomarlos. Avisa si solapa con su agenda. |
| **Emergencias** | `Emergencias` | Asistencia en carretera y parte del seguro. `IncidentButton` hold-to-activate para reportar siniestro (congela el viaje). Llamada directa a Mecanu. |
| **Check-in** (wizard) | — | Pantalla completa por pasos: 4 fotos obligatorias (frontal, trasera, lateral izq., lateral der.) + fotos extra + vídeo opcional + km + combustible (1/4, 1/2, 3/4, Lleno) + 8 testigos del cuadro. Evidencia sellada e inmutable al cerrar. |
| **Entrega / Devolución** | — | 2 fotos obligatorias (estado del coche, dónde lo dejas). La **devolución** exige además firma del cliente en canvas. |
| **Cámara** | — | Captura in-app con estados de permiso denegado y error de dispositivo. |
| **Bottom sheets** | — | `menu` (solicitar al taller), `atraso` (confirmar llegada con comentario o pedir reagenda), `reagenda`, `rechazo`, `fallido`, `no_rodante` — cada uno con su lista cerrada de motivos. |

**Escala de inspección**: el dato guardado es siempre **1-4**; la etiqueta que lee el conductor cambia según el ítem.

**Testigos del cuadro (lista cerrada de 8):**

- Rojos (**impiden conducir**, bloquean el avance): temperatura del motor, presión de aceite, frenos/ABS, airbag/SRS.
- Ámbar (**generan hallazgo** → campaña): check engine, presión de neumáticos, batería/carga, avería general.

---

## 4 · Flujos de navegación

### 4.1 · Ciclo de vida de una ruta (flujo troncal del negocio)

```
Inspección con hallazgos  →  CAMPAÑA (presupuesto)
                                 │  nueva → valorada → enviada
                                 ▼
                          cliente acepta
                                 │
                    modal "Crear ruta" (3 salidas)
                    tal cual · editar líneas · solo total
                                 │
                    ┌────────────┴────────────┐
              con fecha                   sin fecha
                    ▼                          ▼
               AGENDADO                   PROSPECTOS
                    │                          │ (arrastrable)
                    │  taller asigna conductor │
                    ▼                          │
            conductor acepta  ◄────────────────┘
                    │
                    ▼  (solo el conductor mueve esto)
     EN RUTA: en_camino_origen → en_origen → [CHECK-IN] → en_transito → en_destino
                    │
        ┌───────────┴───────────┐
   destino proveedor      destino cliente
        ▼                       ▼
    EN TALLER            [ENTREGA + FIRMA] → COMPLETADO
        │
   ¿hay vuelta?  sí → esperando_agenda_vuelta   no → oportunidad_vuelta (upsell)
```

Cancelado es una salida posible desde cualquier estado activo, **siempre con motivo**.

### 4.2 · Panel: navegación

- Sidebar → módulo. Dentro del módulo, pestañas de sub-ambiente (Traslados/Campañas, Clientes/Conductores, secciones de Configuración).
- Clic en fila de tabla → panel compacto lateral. Clic en el nombre o id → ficha completa con migas de pan e historial de navegación.
- Card del kanban → ficha de la ruta. Arrastre entre columnas → solo desde Prospectos; soltar en Agendado abre el asistente de agendar, soltar en Cancelado abre el modal de motivo.
- Campaña aceptada → modal Crear ruta → tipo de servicio + fecha → la ruta aparece en Tablero.
- Módulo Conductores → botón "Agendar con Mecanu" → asistente; enlace "← Conductores" para volver.

### 4.3 · Conductor: navegación

- Jornada ⇄ Traslado (detalle) · Jornada → Disponibles · Jornada → Emergencias (icono SOS).
- Detalle → acción principal, que según subestado: avanza subestado, abre el wizard de **check-in**, o abre el flujo de **entrega/firma**.
- Detalle → menú de solicitudes → bottom sheet del tipo elegido → motivo → solicitud enviada al taller (queda pendiente hasta que el taller responde).
- Card con aviso de atraso → sheet "Vas atrasado" → confirmar llegada con comentario **o** pedir reagenda.
- Gate de evidencia: sin las fotos (y la firma en devolución) el botón de avanzar queda deshabilitado.

### 4.4 · Comunicación conductor ⇄ taller (asimétrica a propósito)

El conductor **propone**, el taller **modifica**. Solo el panel del taller tiene permiso para cancelar, reagendar, cambiar hora, reasignar conductor o tocar el presupuesto. Ninguna solicitud del conductor se ejecuta sola.

> **Estado actual del prototipo**: las solicitudes del conductor viven solo en el estado local de la app del conductor y el panel **todavía no las muestra**. En producción deben persistirse (ver `SOLICITUDES` en §6.3) y el panel debe exponerlas con acción guiada por tipo.

---

## 5 · Sistema visual

Design System **Mecanu** (fórmula: color y tipografía Škoda con sustituto libre + componentes/layout/motion Uber Base). Tokens en `_ds/mecanu-design-system-*/tokens/*.css`.

### 5.1 · Color

```
brand.600      #419468   verde Mecanu
brand.300      #78FAAE   primario de acción (botones primary)
brand.100      #CFFFE3
emerald.800    #0E3A2F   verde profundo (fondos oscuros)
neutral.900    #161718   texto principal / fondos oscuros
neutral.800    #303132
neutral.700    #464748
neutral.300    #9E9FA0   texto deshabilitado / secundario sobre oscuro
neutral.200    #C4C6C7   bordes
neutral.25     #F1F1F1   fondos suaves
neutral.0      #FFFFFF
semantic.alert     #E82B37
semantic.warning   #EC6513
semantic.positive  #1E7300
semantic.info      #2D71D7
```

**Reglas de contraste (duras):** el texto sobre los verdes de marca es **siempre** Neutral 900, nunca blanco. `positive #1E7300` es funcional, jamás identidad. Máximo 1-2 colores de fondo por vista.

Variantes oscuras usadas en la app del conductor: naranja de aviso `#9C420B` sobre `#FDEBDD` (borde `#DDA57A`), rojo `#A81823`, verde de seguro `#1E7300` (claro) / `brand-primary-dark` (sobre oscuro).

### 5.2 · Tipografía

Familia **Plus Jakarta Sans** (Google Fonts; sustituto de Škoda Next). Pesos: body 400, title 700, label 800.

```
display  40/48       h1  28/36       h2  24/32       h3  20/24
h4       16/24       h5  14/20       body 16/24
caption  12/16       label 11/14 ExtraBold MAYÚSCULAS
```

Mínimos: texto en documento impreso 12 pt; hit targets móviles nunca <44px (el sistema exige ≥48px).

### 5.3 · Espaciado, radios, elevación, motion

```
spacing   base 4 · escala 4 8 12 16 20 24 32 40 48 64 · touch mínimo 48
grid      standard: desktop 12 col, gutter 36, margen 64
          compact:  móvil, gutter 16, margen 24
radius    input 4 · button 8 · card 12 · sheet 16 · pill 999 · nunca 0
elevación shallow ±2px 8px .12 · deep 8px 24px .18 — solo si flota;
          las cards usan borde/fondo, no sombra
motion    default quintic(.83,0,.17,1) 500ms · enter (.22,1,.36,1)
          exit (.64,0,.78,0) 400ms · dismiss (.11,0,.5,0) 200ms
          en web: solo transform/opacity, ≤200ms
```

**Iconografía**: Material Symbols Rounded vía CDN (`.mecanu-icon`, `.is-filled` para estado activo). Sin emoji ni unicode decorativo.

---

## 6 · Componentes reutilizables

### 6.1 · Del design system (ya construidos, 40 componentes)

**Acciones**: `Button` (primary/secondary/tertiary/negative × compact36/default48/large56), `OversizedButton` (56px, full width, contexto conductor), `IncidentButton` (hold-to-activate, siniestro), `QuickCallButton`, `CameraTrigger`.

**Formularios**: `Input`, `Select` (con opciones agrupadas), `Checkbox`, `Radio`, `Switch`, `DateRangePicker`, `Attachment` (con estado "Falló la subida" + reintento).

**Display**: `Badge` (info/warning/positive/alert/neutral/brand), `Tag`, `FilterChip`, `Avatar`, `AvatarGroup`, `ListItem`, `Card`, `CardList`, `ProgressBar`, `Skeleton`, `Divider`, `Icon`, `Logo`.

**Feedback**: `Toast`, `StatusBanner`, `Modal` (kind=alert → AlertDialog), `UpsellAlertCard`, `ErrorState` (empty/error/offline/permission), `ConnectionBanner` (offline→syncing→synced).

**Navegación**: `SidebarNav`, `Tabs`, `BottomNav`, `Breadcrumbs`, `SearchInput`, `FilterBar`.

**Desktop**: `DataTable`, `MetricsCard`, `StatusTimeline`, `CustomerMiniCard`.

**Móvil/conductor**: `SlideToConfirm`, `EvidenceGrid`, `SignatureCanvas`, `BottomSheet`, `TireSelector`, `TimeWindow` (rango de 1 h).

Un solo componente genérico por concepto: el contexto lo da el grid (Standard/Compact) y el `size`, no forks duplicados.

### 6.2 · Patrones propios de la app (a extraer como componentes al implementar)

| Patrón | Dónde | Notas |
|---|---|---|
| Card de ruta del kanban | Panel · Tablero | subestado + tags + seguro + origen/destino + ventana + acciones al hover |
| Pestañas de sub-ambiente con contador | Panel · todos los módulos | activa: negrita + píldora oscura; inactiva: gris + número plano; subrayado bajo la activa; tooltip con detalle si el contador es 1-2 |
| Celda expandible de tags | Panel · tabla | se superpone a las vecinas sin alterar el layout de la fila |
| Filtros de cabecera tipo hoja de cálculo | Panel · tabla | menú por columna |
| Card del servicio actual | Conductor · Jornada | degradado diagonal neutral-700 → negro → emerald-800, acción principal + Maps/Llamar en columna vertical |
| Fila de traslado con cajón de llamada | Conductor · Jornada | arrastrar >30 % del ancho dispara la llamada; dos pasos deliberados para evitar llamadas accidentales |
| Wizard de evidencia | Conductor · check-in y entrega | slots de foto obligatorios, gate de avance |
| Sheet de solicitud al taller | Conductor | título + subtítulo + lista cerrada de motivos |

### 6.3 · Estados obligatorios de toda vista de datos

Ninguna vista se entrega sin: **vacío**, **cargando** (`Skeleton`), **error**, **offline**, **permiso denegado**. Usar `ErrorState` (icono + reintento) y `Skeleton`. Nunca una tabla o lista "pelada".

---

## 7 · Datos mockeados y hardcodeados → qué debe venir de la API

Todos los marcadores `// TODO API:` del código señalan el punto exacto donde iría la llamada real.

### 7.1 · Entidades completas hoy en ficheros locales

| Constante | Fichero | Endpoint sugerido |
|---|---|---|
| `CLIENTES` (14) | `mecanu-data.js` | `GET /clientes`, `GET /clientes/:id` |
| `VEHICULOS` (18, m2m con clientes vía `usuarios[]`) | `mecanu-data.js` | `GET /vehiculos`, `GET /vehiculos/:id` |
| `CONDUCTORES` (6) | `mecanu-data.js` | `GET /conductores` |
| `TEMPARIO` / `SERVICIOS` | `mecanu-data.js` | `GET /tempario` |
| `INSPECCIONES_RAW` | `mecanu-data.js` | `GET /inspecciones/:id` |
| `OPORTUNIDADES_BASE` | `mecanu-data.js` | `GET /campanas` |
| `RUTAS` + `PARADAS` + `TRASLADOS` + `LOGS` + `PRESUPUESTOS` + `CAMPANAS` | construidas en `mecanu-rutas.js` | `GET /rutas?…` (devolver ya aplanado, ver §2.2) |
| `TALLER` (nombre y dirección fijos: Talleres Rodríguez) | `mecanu-data.js` | `GET /taller` (del tenant autenticado) |
| `DIRECCIONES_POOL` | `mecanu-data.js` | **geocoder real** (Google Places / similar). Hoy es un pool filtrado que simula autocompletado |
| `FESTIVOS_2026` | Panel (`valoresFlota`) | calendario de festivos por región desde el backend |
| `MB_BASE = 45` y multiplicadores de precio | Panel | tarifario real de la red Mecanu |
| Turno del conductor (9 traslados de `d1`, Javier Molina) | Conductor | `GET /api/conductores/:id/turno?dia=hoy` |
| `POOL` de traslados disponibles | Conductor | `GET /api/traslados/disponibles` |

**Ojo con las fechas**: todo el mock calcula ventanas y timestamps **relativos a `Date.now()`** (helper `at()`), para que la jornada se lea coherente a cualquier hora. En producción son fechas absolutas del backend, en la zona horaria de la sucursal.

**Teléfono de Mecanu hardcodeado**: `+34 910 220 900` (llamada de emergencias y del asistente de agendar).

### 7.2 · Escrituras que hoy solo mutan estado local

**Desde la app del conductor:**

```
POST   /api/traslados/{tid}/asignar        { conductorId }         tomar del pool
POST   /api/traslados/{tid}/subestado      { a, triggerSource:'conductor' }
POST   /api/traslados/{tid}/checkin        evidencia sellada, inmutable
PATCH  /api/vehiculos/{id}                 { km }   ← el km vive en el VEHÍCULO
POST   /api/campanas/hallazgos             testigos ámbar, niveles 2-4, ITV <60 días
POST   /api/traslados/{tid}/entrega        { fotos, firma } → completa el traslado
POST   /api/traslados/{tid}/confirmaciones { tipo:'llegada_a_tiempo', nota, origen }
POST   /api/traslados/{tid}/solicitudes    { tipo, motivo, ventanaActual, conflictoCon, … }
POST   /api/traslados/{tid}/incidencias    { tipo:'siniestro', origen:'conductor' }
```

**Desde el panel del taller:**

```
PATCH  /traslados/{tramoActivoId}   { conductorId }     reasignar conductor
PATCH  /presupuestos/{id}           { estado }          avance manual de campaña
POST   /rutas                       crea ruta + paradas + traslados desde presupuesto aceptado
PATCH  /rutas/{id}                  { tagsManual }
POST   /rutas/{id}/cancelar         { subestado, motivo }   motivo OBLIGATORIO
```

**Webhooks entrantes que el backend debe emitir:**

- Avance de subestado disparado por el conductor (el panel lo pinta en vivo; en el mock hay un botón "Simular").
- Aceptación del presupuesto y elección de franja por parte del cliente (hoy `simularCliente`, `triggerSource: 'api'`).
- Recepción de mensajes de WhatsApp del cliente (hoy botón "Simular"; en producción webhook de WhatsApp Cloud API).

### 7.3 · Entidad `SOLICITUDES` — falta implementar (decidida, no construida)

Las solicitudes del conductor al taller son hoy estado local de la app del conductor. Deben persistirse como entidad hermana de LOGS:

```
SOLICITUD {
  id, trasladoId, rutaId, conductorId,
  tipo: 'reagenda' | 'rechazo' | 'fallido_origen' | 'no_rodante',
  motivo,               // de una lista cerrada por tipo
  nota,                 // texto libre opcional del conductor
  ts,
  estado: 'pendiente' | 'resuelta_reagenda' | 'resuelta_reasignada'
        | 'resuelta_cancelada' | 'descartada',
  resolucion,           // texto que el conductor lee: "Reagendado a 16:00-17:00"
  resueltaEn
}
```

Cada creación y cada resolución deja un LOG (`tipo:'solicitud'`, `actor: conductor|taller`). El panel debe listar las `pendiente` y, al resolver, disparar la acción del taller correspondiente al tipo. Notificaciones MVP: 3 tipos que exigen acción (reagenda, rechazo/fallido, no rodante — este último de prioridad alta) + 1 informativa (confirmación de llegada, no bloquea).

### 7.4 · Campos con ubicación provisional (`// REVISAR:`)

Marcados en el código como pendientes de decidir dónde viven:

- `ventanaPropuesta` (en TRASLADO)
- `vehiculoListo` (en RUTA) — alimenta el tag `entrega_en_riesgo`
- `incidencia` (en RUTA)
- `matriculaLead`, `linkToken`, `linkEnviadoEn` (en RUTA) — se mudarían a una entidad `OFERTA` propia

### 7.5 · Comportamiento offline (app del conductor, requisito duro)

La app funciona sin señal. Fotos, firma y cambios de estado se **encolan localmente y se sincronizan solos** al recuperar conexión; jamás se pierden ni bloquean al conductor. `ConnectionBanner` anclado arriba (offline → syncing → synced), no bloqueante. Toda acción que puede fallar ofrece **reintentar la misma tarea**, nunca rehacer desde cero. El backend debe aceptar escrituras idempotentes con id de cliente para deduplicar la cola.

### 7.6 · Privacidad (RGPD) — implementar en el backend, no solo en la UI

- Minimización por rol: teléfono y dirección exacta enmascarados hasta que la tarea lo requiera (dirección completa solo al aceptar el traslado).
- El conductor de **red externa** ve menos que el interno: **nunca** ingresos, presupuestos del taller ni otras órdenes. En el mock esto es `esExterno()` + `_dirVaga()`; en producción debe filtrarlo el backend, no el cliente.

---

## 8 · Lo que este prototipo NO cubre

- Autenticación, roles y permisos (hoy no existen; el punto donde irían está marcado).
- Facturación real: "Presupuesto" es estimación y **nunca** se llama factura hasta que el taller lo aprueba.
- Contenido de notificaciones WhatsApp/push: lo gestiona otra capa, fuera del scope del design system.
- Integración con DMS del taller (fase futura del roadmap modular).
- Inventario: Mecanu nunca lo toca.
