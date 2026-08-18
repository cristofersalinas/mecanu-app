# Mecanu Design System v1.1 (compacto)

Mecanu (mecanu.com) — logística B2B para talleres: recogida/devolución de coches a domicilio con seguro en todo el traslado ("tu taller con experiencia a domicilio"). WhatsApp = solo notificaciones al dueño. Modular: hoy logística; luego comunicación, presupuestos, integración DMS. Mecanu = capa de relación con el cliente, nunca inventario. Fórmula: color+tipo Škoda (sust. Plus Jakarta Sans) · componentes/layout/motion Uber Base. Dos superficies: panel desktop taller (grid Standard, denso, sidebar oscura) y app web móvil conductor (grid Compact, táctil ≥48px, exterior).
Fuente original: `uploads/mecanu-design-system-skoda:uber-V1.md` (40 componentes) + `uploads/Logo Mecanu negro.svg`. Refs: base.uber.com, baseweb.design.

**Copy (es-ES):** tuteo, nunca voseo. Euros "4.820 €". Matrículas "1234 BCD". Sentence case; UPPERCASE solo siglas y Labels 11 ExtraBold. Verbo primero: "Iniciar Viaje", "Entregar Vehículo". Estados canónicos: En Ruta / En Taller / Terminado. Vocabulario: Matrícula, Recogida, Devolución, Siniestro, Cobertura, Upselling. Sin emoji. Datos primero (número Display 40, label Caption).

## 1 · TOKENS (canónico — ver `tokens/*.css` y cards "Color tokens" / "Foundations tokens")

```json
{"color":{"brand":{"600":"#419468","300":"#78FAAE","100":"#CFFFE3","em800":"#0E3A2F","hover":"color-mix 300+900 10%/18%"},"neutral":{"900":"#161718","800":"#303132","700":"#464748","300":"#9E9FA0","200":"#C4C6C7","25":"#F1F1F1","0":"#FFFFFF"},"semantic":{"alert":"#E82B37","warning":"#EC6513","positive":"#1E7300","info":"#2D71D7"},"aliases":{"text":"900/700/300(disabled)","bg":"0/25 · dark 900/800","border":"200","borderSubtle":"25"}},
"type":{"family":"Plus Jakarta Sans (Google Fonts; sust. Škoda Next)","weights":{"body":400,"title":700,"label":800},"scale":{"display":"40/48","h1":"28/36","h2":"24/32","h3":"20/24","h4":"16/24","h5":"14/20","body":"16/24","caption":"12/16","label":"11/14 EB UPPER"}},
"spacing":{"base":4,"scale":[4,8,12,16,20,24,32,40,48,64],"touchMin":48},
"grid":{"standard":"desktop 12col g36 m64","compact":"mobile g16 m24"},
"radius":{"input":4,"button":8,"card":12,"sheet":16,"pill":999,"never":0},
"elevation":{"shallow":"±2px 8px .12","deep":"8px 24px .18","rule":"solo si flota; cards→borde/fondo"},
"motion":{"default":"quintic(.83,0,.17,1) 500ms","enter":"(.22,1,.36,1)","exit":"(.64,0,.78,0) 400ms","dismiss":"(.11,0,.5,0) 200ms","linear":"solo opacity/color","web":"solo transform/opacity ≤200ms"}}
```

**Reglas de contraste:** texto sobre verdes de marca siempre Neutral 900 (nunca blanco) · positive #1E7300 es funcional, jamás identidad.

## 2 · ÍNDICE DE COMPONENTES

| Componente | Props clave | Alias / notas |
|---|---|---|
| Button | kind(primary/secondary/tertiary/negative) size(compact36/default48/large56) icon fullWidth | rectangular r8 único; sin pills |
| OversizedButton | anchored + ButtonProps | = Button(size:large, fullWidth, r12) ctx conductor |
| IncidentButton | label holdMs onActivate | hold-to-activate siniestro (único) |
| QuickCallButton / CameraTrigger | — | FABs circulares, SOLO ctx conductor |
| Icon | name size(16/20/24/32) filled | outlined default; filled=activo |
| Logo | variant(dark/light) height | wordmark; nunca blanco sobre verdes |
| Input / Select / Checkbox / Radio / Switch | label error icon · options agrupadas (Select) | focus borde verde; error alert |
| DateRangePicker / Attachment | range · files onRemove | forms |
| Badge | kind(info/warning/positive/alert/neutral/brand) dot icon | pill de estado; En Ruta=info, En Taller=warning, Terminado=positive |
| Tag / FilterChip | onClose · active | tag borde r4 · chip pill filtrado |
| Avatar / AvatarGroup | name src size square · max | iniciales fallback |
| ListItem / Card / CardList | leading title subtitle trailing divider · padding r12 | densidad 14px vert |
| ProgressBar | value warningThreshold | capacidad taller |
| Skeleton / Divider | — | shimmer lineal · 1px neutral-50 |
| Toast / StatusBanner / Modal | kind · destructive→AlertDialog | sombra deep (flotan) |
| UpsellAlertCard | title detail amount onApprove | hallazgo→presupuesto |
| DataTable | columns rows onRowClick | filas 14px, hover neutral-25 |
| MetricsCard | value label delta deltaDirection | delta nowrap; flex 1 1 0 |
| StatusTimeline | steps current | Recogida→Tránsito→En Taller→Devolución |
| CustomerMiniCard | name phone emergencyContact history | ctx taller |
| SidebarNav / Tabs / BottomNav / Breadcrumbs / SearchInput / FilterBar | items active onChange | sidebar 240px oscura, labels bold siempre (sin reflow) |
| SlideToConfirm / EvidenceGrid / SignatureCanvas / BottomSheet / TireSelector | — | ctx conductor táctil |
| ErrorState | variant(empty/error/offline/permission) onAction | estado obligatorio; icono + reintento |
| ConnectionBanner | status(offline/syncing/synced) queuedCount | offline-first; barra persistente no bloqueante |
| TimeWindow | start end date size | rango 1h al cliente (nunca hora exacta) |

Compartidos entre contextos: Badge, Card, ListItem, estados — un solo componente genérico; el contexto lo da el grid (Standard/Compact) y el size, no forks duplicados.

## 3 · SPECS COMPACTAS (base / variants / states)

- **Base global:** font family token · border 1px `--mecanu-border` · focus outline 2px offset 2px verde (nunca eliminar) · hover = fondo un paso más oscuro · press = otro paso, sin shrink · disabled opacity .5 + not-allowed · errores junto a la acción · destructivo/irreversible → AlertDialog (Modal kind=alert).
- **Button:** base r8 bold; primary bg #78FAAE fg 900 (hover 400→active 500) · secondary bg 900 fg 0 · tertiary transparente hover 25 · negative bg alert fg 0. Sizes solo altura+padding.
- **Inputs:** 48px, r4, placeholder neutral-300; error = borde+caption alert.
- **Superficies:** card = bg 0/25 + borde, r12, SIN sombra; flotantes (Modal/Toast/Sheet) = sombra deep + overlay 900 40-60%.
- **Mobile ctx:** todo control ≥48px; OversizedButton 56px; BottomSheet r16 arriba.

## 4 · TEMPLATES (composición, sin specs repetidas)

- **Landing hero** (`ui_kits/landing/index.html`): marco 900 p12 → hero r24 bg850 + dotgrid + glow verde inferior → [nav: Logo(light) / links+chevrons / píldora demo] + [badge píldora lanzamiento → H 84/92 EB 2 líneas → sub 20 → CTA píldora blanca 56] → panel claro r24: grid 4×[Icon+h4+p] → grid 2col [3×MetricsCard | h2+p+Card(StatusTimeline+Badge)] → banda electric-50 [shield+h2+CTA 900] → footer. Píldoras SOLO en capa marketing.
- **Dashboard taller** (`ui_kits/dashboard/index.html`): grid [SidebarNav 240 | main]: header(SearchInput+Avatar) → grid 4×MetricsCard stretch → FilterBar+Tabs → DataTable(matrícula/estado Badge/conductor/ETA/acciones) → CustomerMiniCard drawer.
- v1 archivada: `ui_kits/landing/landing-v1.html`.

## 5 · REGLAS DURAS DE PRODUCTO (invariantes — la IA nunca las rompe)

1. **Estados obligatorios:** ninguna vista de datos se entrega sin sus estados vacío / cargando (Skeleton) / error / offline / permiso denegado. Usar `ErrorState` (con icono + reintento) y `Skeleton`. Nunca una tabla o lista "pelada".
2. **Offline-first (app conductor):** la app funciona sin señal. Fotos, firma y cambios de estado se **encolan localmente y se sincronizan solos** al recuperar conexión — jamás se pierden ni se bloquean. Mostrar `ConnectionBanner` (offline → syncing → synced) anclado arriba, no bloqueante.
3. **Persistencia de tareas fallidas:** toda acción que puede fallar (subir archivo, guardar) ofrece **reintentar la misma tarea** con icono `refresh` — nunca obliga a rehacer desde cero. Ref: `Attachment` (estado "Falló la subida" + reintento), `ErrorState onAction`.
4. **Evidencia como gate:** no se avanza de estado sin evidencia. `Recogida` y `Entrega` requieren foto(s) de estado; la `Entrega` además requiere firma. Sin ellas, el botón de avanzar queda disabled.
5. **Cobertura siempre visible:** el estado de seguro del viaje se muestra de forma **persistente** en cualquier vista del viaje (Badge `positive`+shield "Seguro activo" / `alert` "No cubierto"). Nunca oculto en un submenú.
6. **Ventana horaria de 1 hora:** al cliente SIEMPRE se le comunica un rango de 1h (`TimeWindow`), nunca una hora exacta de recogida/entrega.
7. **Minimización de datos (RGPD):** mostrar solo lo necesario por rol; enmascarar teléfono y dirección exacta hasta que la tarea lo requiera (p.ej. dirección completa solo al aceptar el viaje). El conductor de **red externa** ve menos que el interno: nunca ingresos/presupuestos del taller ni otras órdenes.
8. **Dinero (España):** euros formato es-ES `1.234,56 €`; **siempre indicar si incluye o no IVA**. "Presupuesto" es estimación — nunca llamarlo "factura" hasta que el taller lo apruebe.
9. **Destructivo/irreversible → AlertDialog** (Modal kind=alert) con confirmación explícita.
10. **Contraste de marca:** texto sobre verdes siempre Neutral 900, nunca blanco.

## 6 · MARCO DE JUEGO (guías flexibles — la IA decide dentro de estos límites)

- **Elegir superficie/grid:** operador de taller (mucha info, ratón, pantalla grande) → grid Standard, densidad alta, `DataTable`/`MetricsCard`/`SidebarNav`. Conductor (una tarea a la vez, en la calle, pulgar) → grid Compact, `OversizedButton`/`BottomSheet`/`SlideToConfirm`, controles ≥48px.
- **Emergencias/siniestro:** vive en una sección de "Emergencias" accesible pero no intrusiva (no ocurre a menudo); `IncidentButton` hold-to-activate para evitar disparos accidentales.
- **Copy operativo:** verbo primero, factual, sin marketing en flujos de trabajo. Estados canónicos: En Ruta / En Taller / Terminado.
- **Formato de error (a criterio de la IA, según severidad):** bloqueo de conexión persistente → `ConnectionBanner` (arriba, no modal). Fallo puntual de una acción → `Toast` con reintento. Fallo de una vista entera → `ErrorState` en el cuerpo. Nunca un `alert()` nativo ni un popup para algo que se resuelve solo.
- **Notificaciones WhatsApp/push: fuera del scope de este design system** (las gestiona otra capa) — no diseñar aquí su contenido.

## 7 · PLAYBOOK PARA LA IA (intención → pantalla)

Zona dura (§5, obligatorio) · Zona de marco (§6, elegir con criterio) · Zona libre (la IA compone layout, microcopy y jerarquía nuevos siempre que respete tokens + §5).

1. **Intención:** ¿quién la usa (taller/conductor) y qué tarea única resuelve? → fija grid y set de componentes (§6).
2. **Estructura:** reusar componentes del índice (§2); no reinventar primitivas. Layout con flex/grid + gap.
3. **Datos:** definir de una vez los 5 estados (§5.1) antes de maquetar el caso feliz.
4. **Confianza:** ¿toca seguro, dinero, datos personales o cambio de estado? → aplicar §5.4–5.8.
5. **Copy:** es-ES, tuteo, verbo primero, vocabulario canónico.
6. **Motion:** transición según relación de pantallas (fade/slide/drill); web solo transform/opacity ≤200ms.
7. **Revisión:** ¿rompe alguna regla de §5? Si sí, rehacer. Si es solo estético dentro de tokens, es zona libre.


## ÍNDICE DE ARCHIVOS

`styles.css`→`tokens/` (fonts·colors·typography·spacing·radius·elevation·motion·icons·base) · `assets/` logo.svg + logo-white.svg · `components/{brand,actions,forms,display,feedback,navigation,desktop,mobile}` (jsx + d.ts + prompt.md + card) · `guidelines/` colors.html, foundations.html, type-*, icons, logo · `ui_kits/{landing,dashboard}` · `SKILL.md`. Capa de producto: §5 reglas duras, §6 marco de juego, §7 playbook IA.

**Iconografía:** Material Symbols Rounded CDN (sustituto de Uber Base Icons — flag: reemplazar si llega set propio). `.mecanu-icon` / `.is-filled`. Sin emoji/unicode.
**Intentional additions:** Icon, Logo. No construidos (pantallas, no primitivas): #4 Fleet Split-Screen, #24 Map Viewport, #28 Check-in Summary.
**Caveats:** fuentes vía CDN; logo blanco generado por recoloreo.
