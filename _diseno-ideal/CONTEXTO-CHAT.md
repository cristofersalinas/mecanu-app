# Mecanu — contexto para nuevo chat

Panel de taller (logística B2B) sobre el **design system Mecanu** (bindeado). Idioma **es-ES, tuteo**, sin emoji, dinero `1.234,56 €` con IVA indicado. Lee siempre `CLAUDE.md` (decisiones cerradas) y `MODELO.md`.

## Archivos
| Archivo | Qué es |
|---|---|
| `Mecanu Panel.dc.html` | La app. Único entrypoint (~8.100 líneas). Un solo DC. |
| `mecanu-rutas.js` | Modelo: RUTAS/PARADAS/TRASLADOS/LOGS/PRESUPUESTOS/CAMPAÑAS. Re-exporta los otros. |
| `mecanu-pipeline.js` | Config declarativa: estados, subestados, columnas, tags, reglas. |
| `mecanu-data.js` | Entidades base: CLIENTES, VEHICULOS, CONDUCTORES, TEMPARIO, INSPECCIONES, TALLER. |
| `mecanu-whatsapp.js` | Simulación WhatsApp Cloud API (Campañas). |

El panel importa **solo** `mecanu-rutas.js`. Estado y lógica viven en la clase `Component` (renderVals → template con holes `{{ }}`, dotted-lookup only). Estilos inline. Marcadores `// TODO API:` donde iría backend.

## Módulos entregados y verificados
- **Tablero de traslados** (kanban 6 columnas + vista lista), ficha extendida, Campañas + Vista Simulada de Cliente. (fases previas)
- **Configuración** (`nav === 'configuracion'`, sub-nav de solapas): Perfil (editar datos, notificaciones, seguridad + modal cambiar contraseña), Empresa (ver/editar), **Sucursales** (alta/editar/borrar con AlertDialog, editor de horario semanal, principal/activa), Recepción (plantillas). Estado en `perfil/empresa/sucursales/passForm`.
- **Flota** (`nav === 'flota'`, icono `group` en sidebar). Sub-nav solapas: **Conductores** y **Agendar con Mecanu**. (Se eliminó la solapa global "Reglas de asignación": ahora es individual por conductor.)

## Flota — modelo actual (importante)
- `_flotaConductores(D)`: **solo internos** (`red === 'Interna'`). Overlay admin en `state.condCfg[id]` = `{ activo, politica, horario, anulaciones }`. Altas de sesión en `state.condNuevos`. Default de horario en `condDefaultHorario()` (L–V 08:00–18:00), con `state.horarioDefault` si algún conductor se marcó "predeterminado". Fix aplicado: `horario: this._normHorario(cfg.horario || c.horario || this.condDefaultHorario())`.
- Conductores no tienen vehículo ni zona; **sí horario**. Cards estilo Calendly: tira de disponibilidad semanal (L M X J V S D), resumen de horas, badge de anulaciones, regla de asignación, switch activo.
- **Editor "Horas laborables"** (modal `condEditor`): multi-tramo por día (`horario[dia] = { abre, rangos:[{de,a}] }`), botón `+` añadir tramo, copiar día al resto, toggle "Predeterminado", **Anular fechas** (`anulaciones:[{id,fecha,cerrado,de,a}]`), y **regla de asignación individual** (`politica`: `manual` | `horario` | `libre`, en `POLITICAS_COND`). `resumenHorario(h)` soporta ambos formatos (`{de,a}` de sucursales y `{rangos}` de conductores).
- **Agendar con Mecanu**: asistente 4 pasos con stepper de línea de tiempo (círculos+check). Precios dinámicos `mbPrecio(iso,ventana)`: base 45 € × día (laborable 1.0 / sábado 1.25 / domingo·festivo 1.6) × franja (fuera de horario 1.35) × urgencia (mismo día ×2). Regla: estándar desde día siguiente si reservas antes de 17 h; urgencia mismo día +100 %, mín 2 h, sujeta a disponibilidad, con botón llamar a Mecanu. Paso 3 vehículo: radio "Traslado existente" / "Crear traslado". IVA 21 % siempre visible.

## Datos de conductores (mecanu-data.js CONDUCTORES)
- d1 Javier Molina, d2 Ana Belén Torres, d3 Lucía Fernández, d4 Rachid El Amrani, d5 Sergio Delgado → **Interna**, activos, docs completos, furgoneta asignada, con valoraciones.
- d6 Yolanda Prieto Cano → **Externo Mecanu** (flota bajo demanda). Único externo. No aparece en Flota (solo internos), sí en Contactos.

## Sucursales / taller
- `TALLER` = Talleres Rodríguez, Carrer de Numància 105, Nau 3, 08029 Barcelona. El barrio 08029 = **Les Corts** (mapa de barrios en mecanu-data.js).
- Sucursal principal (seed en `state.sucursales`, SUC-01) renombrada **"Sede central · Les Corts"**, misma dirección que el TALLER del tablero, para que se lean como el mismo sitio. SUC-02 Sant Andreu, SUC-03 L'Hospitalet.

## Filtros de cabecera estilo hoja de cálculo (tablas de lista)
- En cada columna con contenido filtrable, icono de filtro en la cabecera (verde si activo) que abre menú flotante (posición fija por `getBoundingClientRect`): **Ordenar A→Z / Z→A** (o menor→mayor / más antiguo→reciente) + filtro de contenido por tipo.
- Motor: columnas llevan `ft` (`text|enum|number|date`) y `fv(row)` (valor comparable). `aplicarColumnas(nav, filas, columnas)` filtra+ordena; `conCabecerasFiltro(nav, columnas)` inyecta el nodo de cabecera; `valoresHFiltro(D)` alimenta el menú. Estado: `hFiltro`, `hRect`, `colSort`, `colFiltros`. Contexto por render en `this._cfCtx`.
- Aplica a tablas: traslados, clientes, conductores, tempario, campañas (no kanban). Se combinan entre columnas y con el buscador y filtros existentes.
- Tipos por columna: text (id, matrícula, cliente, nombre, teléfono, zona, servicio), enum con recuento (estado, cobertura, conductor, categoría, garantía, alta, presupuesto, conversación), number mín/máx (presupuesto/importe, horas, valor total/ticket, calificación, traslados), date desde/hasta (fecha propuesta).

## Convenciones al editar
- `.dc.html` → usa `dc_write` / `dc_html_str_replace` / `dc_js_str_replace` (o `str_replace_edit`). No `write_file` en el DC.
- Holes `{{ }}` solo dotted-lookup; calcula en `renderVals()`. Estilos por hole solo para valores runtime (posiciones, %). No expresiones en holes.
- Añadir estado/subestado/tag/columna = editar solo `mecanu-pipeline.js`.
- Componentes DS vía `<x-import component-from-global-scope="MecanuDesignSystem_bf03e0.X" hint-size="...">`.

## Posibles siguientes pasos (sin hacer)
App web del conductor (móvil, offline-first, evidencia como gate), Emergencias/siniestro (IncidentButton), roles y permisos (RGPD: externo ve menos), vista calendario/agenda, detalle de sucursal (drill-down), export de presupuestos a PDF, buscador global.
