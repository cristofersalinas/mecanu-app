# Mecanu — Modelo de datos y reglas

Documento de referencia para quien retome el proyecto. Describe **qué es cada
entidad, qué campos tiene, cómo avanza el estado, cómo se calculan los tags y por
qué se tomaron las decisiones que se tomaron.** El objetivo es que no haya que
deducir nada del código.

> Idioma de la UI: **es-ES, tuteo**, sin emoji. Dinero `1.234,56 €`, **siempre**
> indicando si incluye IVA. Ciudad de los datos de ejemplo: **Barcelona** (Zona Alta:
> Sarrià-Sant Gervasi, Pedralbes, Les Corts, El Putxet, Eixample).

## Archivos

| Archivo | Rol |
|---|---|
| `Mecanu Panel.dc.html` | La app. Único entrypoint (~6.700 líneas). Importa **solo** `mecanu-rutas.js`. |
| `mecanu-pipeline.js` | **Config declarativa**: estados, subestados, columnas, tags, presupuestos, reglas. Fuente única de cualquier string de estado. |
| `mecanu-rutas.js` | **Modelo**: construye RUTAS / PARADAS / TRASLADOS / LOGS / PRESUPUESTOS / CAMPAÑAS. Re-exporta los otros dos. |
| `mecanu-data.js` | Entidades base: CLIENTES, VEHICULOS, CONDUCTORES, TEMPARIO, INSPECCIONES, OPORTUNIDADES + geocoder simulado (direcciones, barrio por CP). |
| `mecanu-whatsapp.js` | Simulación de WhatsApp Cloud API para Campañas. |

**Regla dura:** añadir/quitar un estado, subestado, tag, columna del kanban o
estado de presupuesto = editar **solo `mecanu-pipeline.js`**. Fuera de ahí no debe
quedar ningún string de estado escrito a mano.

---

## 1 · Diagrama del modelo

```
RUTA (card del kanban, id TR-*)           ← el ESTADO del negocio vive aquí
 ├── N PARADAS (PD-*)        tipo: cliente | proveedor(taller/itv/chapista/otro)
 ├── N-1 TRASLADOS (TS-*)    rol: ida | vuelta | interno · tiene su propio estado de ejecución
 │    └── LOGS (LG-*)        tipo · actor · triggerSource (manual/conductor/api/cron)
 └── PRESUPUESTO (PR-*)      vive en CAMPAÑAS · fuente única de verdad
```

Volumen del mock: **29 rutas · 70 paradas · 41 traslados · ~290 logs · 40
presupuestos · 11 campañas.**

**Vista para la UI:** `RUTAS_VISTA` / `vistaRuta(r)` aplanan la ruta a lo que la
card y la ficha necesitan (tramo activo, ventana, conductor, seguro, presupuesto,
origen/destino). La UI **nunca** lee la ruta cruda; siempre la vista.

---

## 2 · Entidades y campos

### Vehículo (`VEHICULOS`, `mecanu-data.js`)
`id · matricula ("1234 BCD") · marca · modelo · anio · color · combustible ·
bastidor · contactos (derivado) · relacion`.
- **`contactos` es derivado** de la relación m2m vehículo↔clientes. No se duplica
  el dato: un coche puede tener varios clientes asociados (titular, conductor
  habitual, empresa).

### Cliente (`CLIENTES`, `mecanu-data.js`)
`id · nombre · tipo (Particular|Empresa) · telefono · email · direccion · desde`.
- La **dirección** es un string real de Barcelona. El barrio (sublocalidad) y la
  ciudad (localidad) se **derivan** de la dirección vía `localizarDireccion()`
  (mapa `BARRIOS_BCN` por código postal). No hay campo de barrio aparte.

### Ruta (`RUTAS`, construida en `mecanu-rutas.js`)
`id (TR-*) · clienteId · vehiculoId · conductorId · estado · subestado · fecha ·
franja · seguro · importe · tagsManual[] · paradas[] · traslados[] · presupuestoId`.
- **El estado del negocio vive aquí** (6 estados × 3-4 subestados, §3).
- `tagsManual` persiste los tags que pone el taller (§5). Los derivados no se
  guardan.

### Parada (`PARADAS`, `PD-*`)
`id · rutaId · orden · tipo (cliente|proveedor) · subtipo (taller|itv|chapista|otro) ·
etiqueta · direccion · localidad · sublocalidad · servicios[] · llegadaReal ·
salidaReal`.
- `sublocalidad`/`localidad` se derivan de `direccion`. La card muestra el barrio;
  para paradas del **taller** muestra **solo la sublocalidad** (sucursal), sin la
  ciudad, porque el taller ya sabe en qué ciudad opera y a futuro habrá varias
  sucursales.
- Si no hay dato de barrio → `null`, nunca relleno.

### Traslado / tramo (`TRASLADOS`, `TS-*`)
`id · rutaId · orden · rol (ida|vuelta|interno) · estadoEjecucion
(sin_agenda|agendado|en_curso|completado|cancelado) · ventana {fecha,inicio,fin} ·
ventanaModo (slots_cliente|propuesta_taller|fija_taller) · conductorId · logs[] ·
reprogramaciones`.
- Un tramo une dos paradas consecutivas. Una ruta de ida+vuelta tiene 2 tramos; una
  de solo ida, 1.
- **El tramo tiene su propio estado de ejecución**, distinto del estado de negocio
  de la ruta.
- La **ventana es siempre un rango de 1 h**, nunca una hora exacta. Si no hay
  ventana comprometida, **no se inventa**: se dice "Agendamiento pendiente" o
  "Propuesta: …".

### Log (`LOGS`, `LG-*`)
`id · trasladoId · ts · tipo (cambio_estado|gps|evidencia|comunicacion|incidencia|nota) ·
actor · triggerSource (manual|conductor|api|cron) · detalle`.
- Cada transición de estado deja un log. El `triggerSource` distingue quién la
  disparó (taller, conductor, API, cron).

### Presupuesto (`PRESUPUESTOS`, `PR-*`) — vive en Campañas
`id · campanaId · estado · modo (detallado|solo_total) · lineas[] · total`.
Cada **línea**: `descripcion · importe · origen (inspeccion|manual|traslado)`.
- **Fuente única de verdad del dinero.** Desde Traslados solo se **lee**.
- Ver §6 para el detalle del ciclo y las decisiones de dinero.

---

## 3 · Estados y subestados de la ruta (`ESTADOS`)

Los 6 estados **son** las columnas del kanban, en este orden:

| Estado | paso | Arrastrable | Acepta drop | Edición | Subestados |
|---|---|---|---|---|---|
| **Prospectos** | 0 | **Sí** | No | todo | sin_fecha · oferta_enviada · propuesto · **caducado** (fuera del pipeline) |
| **Agendado** | 1 | No | Sí → *agendar* | ventana, conductor, tags | sin_conductor · asignado · aceptado |
| **En ruta** | 2 | No | No | bloqueado | en_camino_origen · en_origen · en_transito · en_destino |
| **En taller** | 3 | No | No | clienteTieneAuto, tags, vuelta | esperando_agenda_vuelta · oportunidad_vuelta · pendiente_confirmar_retiro |
| **Completado** | 4 | No | No | bloqueado | ok · retirado_por_cliente · con_incidencia · pendiente_cierre |
| **Cancelado** | 0 | No | Sí → *cancelar* (exige motivo) | bloqueado | por_cliente · por_taller · fallido_origen · fallido_ruta |

### Reglas de avance (invariantes)

1. **Solo Prospectos es arrastrable.** Agendado / En ruta / En taller / Completado
   avanzan por **confirmación** (del conductor o del cliente), no arrastrando.
   - En el mock, al intentar arrastrar una card bloqueada se cancela el drag y sale
     un toast con el motivo del bloqueo.
2. **Los 4 subestados de EN RUTA solo los mueve el conductor** (`soloConductor:true`).
   En el mock hay un botón "Simular" en la ficha que emula al conductor.
3. **Soltar en Agendado** abre el formulario de agendar (`dropAccion:'agendar'`).
   **Soltar en Cancelado** exige un motivo (`exigeMotivo:true`).
4. **`caducado`** (14 días sin respuesta a la oferta, `DIAS_CADUCIDAD_OFERTA`) es un
   subestado de Prospectos marcado `fueraDelPipeline`: **sale del tablero activo**
   (por eso el tablero muestra "28 de 29") pero **sigue accesible** en la vista
   "Leads fríos". No es una pérdida de datos: es la regla de leads fríos
   (`SUBESTADOS_FRIOS`).
5. `puedeEditar(estado, campo)` decide qué se puede tocar en cada estado; en
   estados `bloqueado` solo se pueden editar tags.

---

## 4 · Ventana horaria (card y ficha)

- Siempre rango de 1 h. La card formatea según la **distancia temporal** — el
  **tamaño del texto nunca cambia, solo el color**:

  | Situación | Texto | Color |
  |---|---|---|
  | Falta < 2 h | `En 1 h 20 · 10:00–11:00` | naranja (`--mecanu-warning`) |
  | Hoy | `Hoy · 10:00–11:00` | gris |
  | Mañana | `Mañana · 10:00–11:00` | gris |
  | En 2-6 días | `Jue 6 · 10:00–11:00` | gris |
  | En 7+ días | `12 ago · 10:00–11:00` | gris |
  | Vencida sin iniciar | `Vencida hace 45 min` | rojo (`--mecanu-alert`) |
  | Sin agendar | `Agendamiento pendiente` | gris |

  ("Vencida sin iniciar" = la ventana pasó y la ruta sigue en `agendado`, no
  avanzó a en_ruta/taller/completado.) Implementado en `fmtVentanaCard()`.
- **Cobertura de seguro siempre visible** en cualquier vista del viaje.

---

## 5 · Tags: derivados vs manuales (`mecanu-pipeline.js`)

- **Derivados** (`TAGS_DERIVADOS`): los **calcula el sistema** con la función
  `calc(contexto)`, **no se persisten y no se pueden quitar**. Visualmente van
  **sin borde, fondo plano al 8 %**. Ejemplos: `sin_conductor`, `en_riesgo`,
  `retrasado`, `entrega_en_riesgo`, `oportunidad_vuelta`, `larga_custodia`
  (> 7 días en proveedor, `DIAS_LARGA_CUSTODIA`), `sin_confirmar_cliente`,
  `inestable`, `doc_pendiente`.
- **Manuales** (`TAGS_MANUALES`): los pone el taller y **persisten en
  `ruta.tagsManual`**. Van con **borde de color**. Los 4 primeros
  (Urgente, VIP, No rodante, Cobro pendiente) son presets del sistema (no se
  borran); el resto son de la casa. Paleta en `PALETA_TAGS`.

La distinción visual (borde sí/no) es una regla dura del design system: un tag con
borde es accionable/editable; uno sin borde es informativo y calculado.

---

## 6 · Relación con Campañas y el dinero

- **El presupuesto vive en Campañas**, es la **fuente única**. Estados
  (`PRESUPUESTO_ESTADOS`): `nueva → valorada → enviada → aceptada | rechazada |
  caducada`. Desde Traslados solo se lee.
- **Avance de campaña 100 % manual**: un botón por transición, cada una deja log.
  Desacoplado a propósito (no hay automatismo que empuje una campaña sola).
- **Campaña aceptada → modal "Crear ruta"** con 3 salidas: *tal cual* / *editar
  líneas* / *solo total*. Luego se elige tipo + fecha. **Con** fecha → la ruta nace
  en **Agendado**; **sin** fecha → nace en **Prospectos**.
- **Líneas con origen visible**: `inspeccion` (icono `photo_camera`), `manual`
  (`edit`), `traslado` (`local_shipping`).
- **Modo `solo_total`**: el taller borra el desglose y deja solo la cifra. La ruta
  se crea igual.

### Decisiones cerradas sobre el dinero (no volver a abrir)

1. **El total INCLUYE la línea de traslado.** El traslado es un ítem del tempario
   del taller (`SV-11`, `SERVICIO_TRASLADO_ID`), **una línea más** del presupuesto
   junto a las reparaciones. Ej. TR-1042 = 284,50 (reparación) + 90 (traslados) =
   **374,50 €**.
2. **Un solo dinero.** No se separa "importe del traslado" de "presupuesto de
   reparación". En la ficha hay **un** bloque "Presupuesto", solo lectura, con
   desglose por origen.
3. **Mecanu no fija precios.** La tarifa logística se toma del tempario del taller.

---

## 7 · Decisiones de arquitectura y por qué

- **Ids conservados:** los traslados antiguos son ahora rutas con el **mismo id**
  (TR-1042…). Facilita continuidad con datos previos.
- **`contactos` del vehículo son derivados** de la relación m2m vehículo↔clientes:
  no se duplica un dato que ya vive en la relación.
- **El estado en la ruta, no en el tramo:** el negocio razona sobre "el servicio"
  (la ruta); el tramo es ejecución. Por eso el kanban es de rutas y el tramo solo
  tiene un estado de ejecución interno.
- **Sin capa visual paralela para las direcciones:** las direcciones de ejemplo son
  Barcelona **de verdad** en la metadata; el barrio se deriva de la dirección. (Se
  descartó una capa "visual" que mostraba un barrio distinto al de la dirección
  real porque generaba incoherencias card ↔ ficha.)
- **Sin roles ni permisos todavía.** Donde iría el backend hay marcas `// TODO API:`.
- **Nada de datos de relleno.** Si no hay dato, se dice explícitamente.

### Campos marcados `// REVISAR: ubicación provisional`
Viven en una entidad que quizá cambie: `ventanaPropuesta` (TRASLADO) ·
`vehiculoListo` (RUTA) · `incidencia` (RUTA) · `matriculaLead` / `linkToken` /
`linkEnviadoEn` (RUTA — se mudarían a una entidad `OFERTA` cuando exista).

---

## 8 · Invariantes del producto (resumen para no romper)

- Solo Prospectos se arrastra. El resto avanza por confirmación. Cancelado exige
  motivo.
- Los subestados de EN RUTA solo los mueve el conductor.
- Ventana = siempre rango de 1 h. Sin ventana comprometida → no se inventa.
- Cobertura de seguro siempre visible.
- Sin dato → decirlo; nunca relleno.
- Añadir estado/subestado/tag/columna = editar solo `mecanu-pipeline.js`.


---

# Anexo · App del conductor (ronda 2)

## Reglas R1-R10

| # | Regla |
|---|---|
| R1 | Máximo **1 traslado en EN RUTA** por conductor. El segundo no se permite: botón deshabilitado y una línea neutra ("Termina el Kia Ceed primero"). Nunca alerta grande ni redirección. |
| R2 | Un traslado **sin ventana agendada no aparece** entre los de hoy. Vive en un colapsable aparte, etiquetado "Pendiente de agendar". |
| R3 | Nunca **dos estados contradictorios** a la vez en la misma card. Si hay solicitud pendiente, su badge sustituye al de estado. |
| R4 | **Evidencia como gate**: no se completa la recogida sin la página 1 íntegra (4 fotos + vídeo + km + combustible + testigos), ni la devolución sin fotos + firma. |
| R5 | Si la ventana de B empieza antes de que A pueda cerrarse (fin + **35 min** de margen), B se marca **en riesgo** y ofrece "Pedir reagendar". |
| R6 | "Pedir reagendar" **genera solicitud al taller**, nunca cambia la fecha. |
| R7 | **Solo el conductor** mueve los subestados de EN RUTA. |
| R8 | Un traslado disponible que **solape** con uno asignado no se puede tomar sin confirmación explícita. |
| R9 | El seguro se comunica **solo por icono**, nunca icono + texto. |
| R10 | Sin conexión, las acciones se **encolan** y se sincronizan al recuperar red. Aviso al superar 200 MB o 10 elementos. |

## Matriz de permisos del conductor

**Puede hacer solo:** avanzar subestados EN RUTA · subir fotos, vídeo y firma ·
completar la inspección · tomar traslado disponible si no solapa · llamar al
cliente y al taller · reportar incidencia.

**Solicita al taller** (propone, no ejecuta): reagendar · rechazar un traslado
asignado · marcar fallido en origen · marcar el vehículo como no rodante.

**No puede:** cambiar ventana o fecha · cancelar · editar dirección o contacto ·
reasignarse · ver el presupuesto de reparación.

Cada solicitud emite:
`{ tipo, trasladoId, rutaId, conductorId, motivo, ventanaActual, conflictoCon,
evidenciaIds, creadoEn, origen:'conductor' }`

## Escala de inspección

El dato guardado es siempre **1-4**. Lo que lee el conductor cambia por ítem.
No se pregunta cuánto le queda a una pieza, sino **hasta cuándo aguanta**.

| Nivel | Título | Significado | Genera |
|---|---|---|---|
| 1 | Bien | Sin observaciones | Nada |
| 2 | Vigilar | Llega a la próxima visita | Campaña diferida |
| 3 | Cambiar pronto | No llega a la próxima | Campaña activa hoy |
| 4 | Cambiar ya | Riesgo o fallo inminente | Campaña urgente + aviso |

**7 ítems**: plumillas · neumáticos (4 posiciones) · focos y mica · batería ·
carrocería · cristales · limpieza interior.

**8 testigos** — rojos (impiden conducir): temperatura del motor, presión de
aceite, frenos/ABS, airbag/SRS. Ámbar (generan hallazgo): check engine, presión
de neumáticos, batería/carga, avería general.

**ITV**: vigente / por vencer / vencida. A menos de 60 días genera campaña.

**Límites de captura**: foto 1920 px lado largo JPEG 80% · vídeo 30 s a 720p ·
captura solo desde la cámara de la app, jamás desde galería · cada archivo
sellado con hora, GPS, id de traslado y conductor, inmutable tras enviar.
