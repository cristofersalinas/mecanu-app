# Auditoría de diseño ideal vs código construido

Fecha: 2026-08-18  
Alcance: comparación diagnóstica entre `_diseno-ideal/` y `src/`.  
No se ha modificado ningún archivo de código del proyecto para esta auditoría.

## Fuente de verdad revisada

- Diseño ideal:
  - `_diseno-ideal/Mecanu Panel.dc.html`
  - `_diseno-ideal/design_handoff_mecanu/design/Mecanu Panel.dc.html`
  - `_diseno-ideal/Mecanu Conductor.dc.html`
  - `_diseno-ideal/design_handoff_mecanu/design/Mecanu Conductor.dc.html`
  - `_diseno-ideal/Canvas.dc.html`
  - `_diseno-ideal/HANDOFF.md`
  - `_diseno-ideal/CONTEXTO-CHAT.md`
  - `_diseno-ideal/CLAUDE.md`
  - `_diseno-ideal/_ds/.../tokens/*`
- Código construido:
  - `src/app/(taller)/panel/*`
  - `src/components/taller/**/*`
  - `src/app/(conductor)/conductor/*`
  - `src/components/conductor/**/*`

## Criterio de clasificación

- `solo_ui`: la diferencia es de layout, componente, estado local, microinteracción o navegación de frontend. Podría vivir enteramente en cliente.
- `requiere_backend`: para ser fiel al ideal hace falta persistencia, modelo, permisos, colas, notificaciones o contratos API además de UI.

---

## Visión general

La reconstrucción en `src/` **sí cubre los dos portales y sus flujos troncales**, pero no es fiel al diseño ideal exportado en `_diseno-ideal/`. La divergencia más clara está en `/panel`: se conservaron los módulos base, pero se simplificaron varias capas que en Claude Design ya estaban refinadas:

- personalización de propiedades de ficha/panel
- personalización avanzada de tablas
- tooltips y estados operativos de pestañas
- flujo rico de “Agendar con Mecanu”
- taxonomía y navegación interna de la ficha completa

En `/conductor` la cobertura es mucho más cercana: las diferencias detectadas son sobre todo de chrome visual y composición de pantallas, no de lógica principal.

---

## `/panel`

### Shell general del panel

Estado actual en `src/components/taller/PanelApp.tsx`: existen sidebar, colapso, migas, módulos principales, panel compacto, drawer completo e inspección.

Diferencias:

- Falta una capa homogénea de estados `offline` y `permiso denegado` en las vistas del panel.
  - Impacto: `requiere_backend`
  - Motivo: para ser real no basta con pintar el estado; hace falta señalizar red/autorización y exponer errores coherentes desde la futura API.

- La navegación y los paneles laterales están más planos que en el ideal: menos densidad visual, menos microestados y menor riqueza en badges/tooltips.
  - Impacto: `solo_ui`

- La traducción del diseño ideal al shell React conserva módulos, pero pierde parte del acabado específico del DC iterado.
  - Impacto: `solo_ui`

### General

Comparado con `src/components/taller/general/GeneralDashboard.tsx`.

Diferencias:

- El ideal contempla un dashboard de rango más rico (`7d/30d/...`); en React los rangos están simplificados.
  - Impacto: `solo_ui`

- La vista construida conserva KPIs y ranking, pero con menos pulido visual y menos riqueza de estados.
  - Impacto: `solo_ui`

- No se ve una cobertura explícita y homogénea de estados de error/carga/permiso al nivel que el ideal sugiere.
  - Impacto: `solo_ui`

### Tablero > Traslados

Comparado con:

- `src/components/taller/tablero/TrasladosView.tsx`
- `src/components/taller/tablero/KanbanCard.tsx`
- `src/components/taller/tablero/ColumnFilterMenu.tsx`
- `src/components/taller/tablero/AgendarModal.tsx`

Funciones o controles presentes en el ideal pero ausentes o simplificados:

- Falta una superficie explícita de `Leads fríos` / `SUBESTADOS_FRIOS` como subentorno visible del tablero.
  - Impacto: `solo_ui`

- La personalización de tabla existe, pero le faltan piezas del ideal:
  - arrastrar cabeceras para reordenar
  - elegir “filtros visibles” con máximo 4
  - indicador visual de “vista personalizada”
  - feedback claro de “se guarda solo”
  - Impacto: `solo_ui`

- El buscador del ideal está descrito con tolerancia a errores de tipeo y normalización de matrícula como rasgo central; la reconstrucción parece más simple.
  - Impacto: `solo_ui`

- Faltan parte de los tooltips/contexto operacional en pestañas y contadores cuando hay 1-2 pendientes.
  - Impacto: `solo_ui`

Componentes presentes en ambos pero distintos:

- El kanban de 6 columnas sí está, con drag restringido y colapso, pero el nivel de detalle de affordances, hover, badges y densidad es menor.
  - Impacto: `solo_ui`

- La vista lista/kanban existe, pero el control visual y la integración con la personalización del ideal son menos fieles.
  - Impacto: `solo_ui`

- El menú por columna en React se acerca al comportamiento hoja de cálculo, pero sin la integración total con el sistema de vista personalizada del diseño ideal.
  - Impacto: `solo_ui`

Diferencias visuales generales:

- El panel compacto lateral es más estrecho que el ideal.
  - Ideal: 420 px
  - Construido: 340 px (`src/components/taller/ficha/SidePanel.tsx`)
  - Impacto: `solo_ui`

- Tabs, badges y controles del tablero están más sobrios y menos “sheet-like”.
  - Impacto: `solo_ui`

Implicación backend futura:

- Reordenar columnas **en la sesión**: `solo_ui`
- Guardar esa configuración por usuario entre sesiones: `requiere_backend`
- Tooltips de recuento con detalle de pendientes: `solo_ui`
- Exponer `Leads fríos` como vista separada, si es solo derivado en cliente: `solo_ui`
- Persistir una preferencia de vista por usuario: `requiere_backend`

### Tablero > Campañas

Comparado con:

- `src/components/taller/campanas/CampanasView.tsx`
- `src/components/taller/campanas/WhatsAppPanel.tsx`
- `src/components/taller/campanas/CrearRutaModal.tsx`

Funciones o controles presentes en el ideal pero ausentes o simplificados:

- Falta el botón o salida explícita de `Vista de cliente` tal como aparece en el ideal.
  - Impacto: `solo_ui`

- Falta parte del flujo “Ir al recordatorio” y una integración más visible entre ficha, campaña y panel de WhatsApp.
  - Impacto: `solo_ui`

- La simulación de WhatsApp está bastante trasladada, pero con menos densidad visual y menos microestados alrededor de hallazgos, preview y conversación.
  - Impacto: `solo_ui`

Componentes presentes en ambos pero distintos:

- Avance manual del estado de campaña existe, pero el ideal transmite mejor la idea de transición deliberada estado por estado con log asociado.
  - Impacto: `solo_ui`

- Selección y envío masivo existen, pero el acabado y la jerarquía editorial del ideal son más ricos.
  - Impacto: `solo_ui`

Diferencias visuales generales:

- El panel lateral de WhatsApp en React está resuelto como `aside` menos integrado que en el ideal.
  - Impacto: `solo_ui`

- Las cards de campaña son más sobrias que en el ideal.
  - Impacto: `solo_ui`

Implicación backend futura:

- Vista simulada del cliente como UI local: `solo_ui`
- Un “recordatorio” real con persistencia/historial: `requiere_backend`
- Logs reales de transición de campaña: `requiere_backend`

### Contactos > Clientes

Comparado con `src/components/taller/contactos/ContactosView.tsx`.

Diferencias:

- Faltan filtros de cabecera tipo hoja de cálculo al nivel del ideal.
  - Impacto: `solo_ui`

- Faltan contadores de pestaña más operativos y tooltips contextuales.
  - Impacto: `solo_ui`

- No aparece el conjunto completo de estados `error` / `offline` / `permiso`.
  - Impacto: `requiere_backend`

- La tabla base sí existe y conserva teléfono enmascarado, zona y vehículos, pero con menos riqueza interactiva.
  - Impacto: `solo_ui`

Implicación backend futura:

- Filtrar/ordenar en memoria: `solo_ui`
- Persistir vistas o preferencias de tabla por usuario: `requiere_backend`

### Contactos > Conductores

Comparado con `src/components/taller/contactos/ContactosView.tsx`.

Diferencias:

- Faltan filtros de cabecera tipo hoja de cálculo también aquí.
  - Impacto: `solo_ui`

- Falta el tratamiento más fino del contador de onboarding/documentación pendiente.
  - Impacto: `solo_ui`

- No se ve la capa completa de estados `error` / `offline` / `permiso`.
  - Impacto: `requiere_backend`

- El contenido base está, pero con menos sofisticación en ordenación y filtrado.
  - Impacto: `solo_ui`

### Tempario

Comparado con `src/components/taller/tempario/TemparioView.tsx`.

Diferencias:

- Faltan filtros de cabecera tipo hoja de cálculo.
  - Impacto: `solo_ui`

- Falta personalización de columnas/vista al nivel del ideal.
  - Impacto: `solo_ui`

- No se ve una familia completa de estados de error/permiso/offline.
  - Impacto: `requiere_backend`

- La estructura de categorías existe, pero el ideal integra mejor este módulo en el sistema general de tablas del panel.
  - Impacto: `solo_ui`

Implicación backend futura:

- Añadir o editar servicios en sesión/mock: `solo_ui`
- Persistir el tempario real del taller: `requiere_backend`

### Conductores (flota) > Conductores

Comparado con `src/components/taller/conductores/ConductoresModule.tsx`.

Diferencias:

- Es uno de los módulos más completos, pero pierde parte del look “cards estilo Calendly” del ideal.
  - Impacto: `solo_ui`

- La edición de disponibilidad y política individual existe, aunque con algo menos de refinamiento visual.
  - Impacto: `solo_ui`

- No están claramente modelados los estados `error` / `offline` / `permiso`.
  - Impacto: `requiere_backend`

- La nomenclatura de políticas y algunos microdetalles del editor difieren del ideal/handoff.
  - Impacto: `solo_ui`

Implicación backend futura:

- Editar horario, anulaciones y política solo en memoria: `solo_ui`
- Guardarlas por conductor y sincronizarlas entre sesiones: `requiere_backend`

### Conductores (flota) > Agendar con Mecanu

Comparado con `src/components/taller/conductores/AgendarMecanuWizard.tsx`.

Esta es una de las divergencias más grandes del panel.

Funciones o controles presentes en el ideal pero ausentes:

- Falta el paso previo de intención:
  - `Agendar traslado completo`
  - `Enviar link al cliente`
  - Impacto: `solo_ui`

- Falta el subflujo de `Link listo / compartir`:
  - copiar
  - WhatsApp
  - correo
  - enviar otro link
  - feedback de lead / link enviado
  - Impacto: `requiere_backend`
  - Motivo: compartir un link puede ser UI, pero el link/lead y su estado necesitan persistencia futura.

- Falta el reconocimiento/autocompletado rico por matrícula:
  - sugerencias
  - “te reconocimos”
  - cliente único / selector
  - editar teléfono
  - alta inline de cliente
  - avisos de matrícula distinta
  - Impacto: `solo_ui` si es solo un mock local; `requiere_backend` si debe apoyarse en datos reales
  - Para el backend futuro: **sí toca backend** en cuanto el dato salga del mock.

Componentes presentes en ambos pero distintos:

- El stepper de 4 pasos existe, pero no coincide con el flujo ideal: el construido es más corto y operacional; el ideal es más rico y orientado a decisión y onboarding del lead.
  - Impacto: `solo_ui`

- El cálculo dinámico de precio sí está trasladado.
  - Impacto: `solo_ui`

Conclusión:

- `Agendar con Mecanu` es la vista del panel donde más claramente se perdió diseño iterado más allá del design system base.

### Configuración > Perfil

Comparado con `src/components/taller/config/ConfiguracionView.tsx`.

Diferencias:

- Cobertura funcional bastante cercana.
  - datos del usuario
  - notificaciones
  - cambio de contraseña

- Menor riqueza visual y menor pulido en tabs/badges que en el ideal.
  - Impacto: `solo_ui`

- Faltan estados formales de error/permiso.
  - Impacto: `requiere_backend`

### Configuración > Empresa

Comparado con `src/components/taller/config/ConfiguracionView.tsx`.

Diferencias:

- Cobertura funcional cercana, pero con layout de secciones y acciones más austero que en el ideal.
  - Impacto: `solo_ui`

- Faltan estados de error/permiso.
  - Impacto: `requiere_backend`

### Configuración > Sucursales

Comparado con `src/components/taller/config/ConfiguracionView.tsx`.

Diferencias:

- Alta, edición, borrado, principal/activa y horario están presentes.

- El editor de sucursal y de horario semanal parece menos rico/pulido que en el ideal.
  - Impacto: `solo_ui`

- La comunicación visual de herencia de zona horaria y detalle de sucursal está más explicitada en el ideal.
  - Impacto: `solo_ui`

Implicación backend futura:

- Editar la sucursal en la sesión: `solo_ui`
- Guardar sucursales reales y horarios: `requiere_backend`

### Configuración > Recepción

Comparado con `src/components/taller/config/ConfiguracionView.tsx`.

Diferencias:

- La vista construida sí permite plantillas, preview, puntos base y campos personalizados.

- Aun así, el editor del ideal se comporta más como un constructor de formulario; la reconstrucción es una versión más reducida.
  - Impacto: `solo_ui`

- Faltan parte de la densidad y del acabado de editor configurable.
  - Impacto: `solo_ui`

Implicación backend futura:

- Diseñar el constructor en cliente: `solo_ui`
- Persistir plantillas y su versión activa por grupo/sucursal: `requiere_backend`

### Panel compacto lateral

Comparado con `src/components/taller/ficha/SidePanel.tsx`.

Funciones o controles del ideal ausentes:

- `Personalizar propiedades`
- ocultar propiedades
- renombrar propiedades
- crear propiedades nuevas
- borrar propiedades custom
- copy de “se guarda solo”

Impacto:

- Configuración solo en la sesión: `solo_ui`
- Guardarla por usuario o por grupo: `requiere_backend`

Diferencias visuales:

- Más estrecho que en el ideal.
- Menor jerarquía tipográfica y menos aire.

### Ficha completa / drawer

Comparado con `src/components/taller/ficha/RecordDrawer.tsx`.

Funciones o controles del ideal ausentes o cambiados:

- La taxonomía de tabs no coincide:
  - Ideal: `Actividad`, `Notas`, `Email` bloqueada, `Llamada` bloqueada
  - Construido: `Resumen`, `Actividad`, `Notas`, `Facturación` bloqueada, `Documentos` bloqueada
  - Impacto: `solo_ui`

- Falta el botón de personalización de propiedades y toda su capa asociada.
  - Impacto: `solo_ui` / `requiere_backend` si hubiera que persistirla

- Falta parte de los relacionados/tablas internas avanzadas del ideal.
  - Impacto: `solo_ui`

- Falta `Reenviar resumen al cliente`.
  - Impacto: `requiere_backend`
  - Motivo: enviar de verdad ese resumen requiere canal y trazabilidad.

Presentes en ambos:

- resumen
- actividad
- notas
- conductor
- presupuesto
- simulación de avance

Diferencias visuales:

- Rail derecho más estrecho.
- Menor riqueza visual en bloques y jerarquía.

### Modal de inspección

Comparado con `src/components/taller/ficha/InspeccionModal.tsx`.

Presentes en ambos:

- daños/fotos
- hallazgos
- km/combustible
- firmas
- visor ampliado

Diferencias:

- El ideal añade acciones accesorias alrededor de la inspección, como `Reenviar resumen al cliente`.
  - Impacto: `requiere_backend`

- El layout de evidencia/informe está más trabajado en el ideal.
  - Impacto: `solo_ui`

### Modal de cancelar

Comparado con el `CancelarModal` interno del tablero.

Diferencias:

- El construido exige mínimo de texto en una nota, mientras el ideal está más centrado en selección cerrada de motivo + comentario opcional.
  - Impacto: `solo_ui`

- El ideal comunica mejor el aviso al cliente; hacerlo real tocará backend.
  - Impacto: `requiere_backend`

### Modal Crear ruta

Comparado con `src/components/taller/campanas/CrearRutaModal.tsx`.

Diagnóstico:

- Es una de las piezas más fieles.
- Se conservan las tres salidas cerradas:
  - tal cual
  - editar líneas
  - solo total
- Se conserva la bifurcación:
  - con fecha → Agendado
  - sin fecha → Prospectos

Diferencias:

- Menos guiado visualmente y menos refinado que el ideal.
  - Impacto: `solo_ui`

---

## `/conductor`

### Shell general del conductor

Comparado con `src/components/conductor/ConductorApp.tsx`.

Diferencias:

- Falta el notch superior del marco ideal.
  - Impacto: `solo_ui`

- Falta la barra/home indicator inferior del dispositivo ideal.
  - Impacto: `solo_ui`

- La PWA y las capas de overlays sí están trasladadas.

### Jornada

Comparado con:

- `src/components/conductor/JornadaScreen.tsx`
- `src/components/conductor/JobCard.tsx`

Diferencias:

- En el ideal, `Disponibles para tomar` está visible inline dentro de `Jornada`.
- En el construido se reemplaza por una fila-resumen que navega a otra pantalla.
  - Impacto: `solo_ui`

- El resto del núcleo del flujo está bastante alineado:
  - card activa destacada
  - CTA principal
  - Maps/Llamar
  - swipe para llamar
  - agrupación por día
  - banner de conexión
  - cola/sync

### Disponibles

Comparado con `src/components/conductor/DisponiblesScreen.tsx`.

Diferencias:

- El construido crea una pantalla separada más explícita; el ideal operativo lo integraba más en `Jornada`.
  - Impacto: `solo_ui`

- Se añade copy explicativa extra en React.
  - Impacto: `solo_ui`

Diagnóstico:

- No parece faltar capacidad principal; cambia la composición.

### Traslado

Comparado con `src/components/conductor/TrasladoScreen.tsx`.

Diferencias:

- El construido añade `Simular · avanzar subestado` como control de demo.
  - Impacto: `solo_ui`

- Hay matices de presentación/privacidad del teléfono que no aparecen igual en el ideal.
  - Impacto: `solo_ui`

Presente en ambos de forma bastante fiel:

- timeline
- cobertura
- bloqueo rojo / viaje congelado
- riesgo y atraso
- solicitudes al taller
- Maps / llamar
- historial

### Emergencias

Comparado con `src/components/conductor/EmergenciasScreen.tsx`.

Diferencias:

- React añade el teléfono inline en la tarjeta de central.
  - Impacto: `solo_ui`

- El botón `hold-to-activate` está implementado con componente local, no con el mismo encapsulado del ideal.
  - Impacto: `solo_ui`

Presente en ambos:

- llamar a Mecanu
- reportar siniestro
- congelar viaje

### Solicitudes / bottom sheets

Comparado con:

- `src/components/conductor/SolicitudSheet.tsx`
- `src/components/conductor/ConfirmDialog.tsx`

Diagnóstico:

- No he detectado ausencias funcionales claras respecto al ideal.
- `menu`, `atraso`, `reagenda`, `rechazo`, `fallido`, `no_rodante` están trasladados con bastante fidelidad.

Impacto:

- Diferencias, si las hay, son `solo_ui`.

### Check-in

Comparado con:

- `src/components/conductor/CheckinWizard.tsx`
- `src/components/conductor/EvidenceGrid.tsx`
- `src/components/conductor/TestigosGrid.tsx`
- `src/components/conductor/NivelSelector.tsx`
- `src/components/conductor/TireSelector.tsx`

Diferencias:

- La safe area superior del overlay no respeta la misma zona que el ideal.
  - Impacto: `solo_ui`

- Falta la barra/home indicator inferior del overlay ideal.
  - Impacto: `solo_ui`

En lo funcional está casi íntegro:

- 4 fotos obligatorias
- fotos extra
- vídeo
- km
- combustible
- 8 testigos cerrados
- paso 2 con 6 ítems
- neumáticos
- ITV
- gate final

### Entrega / Devolución

Comparado con:

- `src/components/conductor/EntregaWizard.tsx`
- `src/components/conductor/SignatureCanvas.tsx`

Diferencias:

- Misma divergencia de safe area superior.
  - Impacto: `solo_ui`

- Falta la barra/home indicator inferior ideal.
  - Impacto: `solo_ui`

- React añade un bloque informativo extra cuando faltan fotos o firma.
  - Impacto: `solo_ui`

Presente en ambos:

- fotos obligatorias
- firma del cliente en devolución
- CTA bloqueado hasta completar evidencia

### Cámara

Comparado con `src/components/conductor/CameraCapture.tsx`.

Diferencias:

- React añade `Simular captura (solo prototipo)` en error.
  - Impacto: `solo_ui`

Presente en ambos:

- permiso denegado
- error de dispositivo
- reintentar
- captura foto
- vídeo con contador

### Diferencias visuales generales del conductor

- El construido es bastante fiel en layout funcional, pero menos fiel en chrome del dispositivo.
- Las mayores diferencias son:
  - notch y barra inferior
  - padding de safe area
  - composición de `Disponibles`
  - algunos controles extra de demo

No he detectado en `/conductor` una ausencia importante del ideal que, por sí sola, abra una necesidad nueva de backend no prevista ya en el handoff.

---

## `Canvas.dc.html`

Archivo revisado: `_diseno-ideal/Canvas.dc.html`

Contenido encontrado:

- HTML base vacío.
- Dentro de `<x-dc>` no hay ningún nodo, componente, script ni vista.

Diagnóstico:

- **No contiene una pantalla, flujo ni funcionalidad construida**.
- A día de hoy parece un contenedor vacío exportado por Claude Design, no una superficie real de producto.
- No he encontrado un equivalente funcional en `src/` más allá de referencias genéricas a `canvas` del componente de firma (`SignatureCanvas`) y a canvas DOM para generar imágenes, que no tienen relación con un “Canvas” de producto.

Conclusión sobre `Canvas.dc.html`:

- No parece una vista perdida del producto.
- No parece una funcionalidad no trasladada.
- En su estado actual, es un archivo vacío sin traducción necesaria.
  - Impacto: `solo_ui` / nulo

---

## Diferencias con implicación de backend futuro

Lista consolidada de diferencias que **sí** tocarían el backend cuando quieras fidelidad total:

- Guardar personalización de columnas/filtros/orden entre sesiones y por usuario.
- Guardar personalización de propiedades del panel compacto o la ficha.
- Flujo real de “Enviar link al cliente” en `Agendar con Mecanu`:
  - generar link
  - persistir lead/oferta
  - registrar `link_enviado`
  - reenvíos/canales
- `Reenviar resumen al cliente` desde inspección/ficha.
- Historial/log real de acciones de campaña y comunicación.
- Estados formales de `permiso denegado` y errores conectados a autorizaciones reales.
- Persistencia real de:
  - horario/políticas de conductor
  - plantillas de recepción
  - sucursales
  - tempario
  - configuración de vistas por usuario

## Diferencias puramente frontend / estado local

- Ancho de paneles y drawers.
- Notch / barra inferior del conductor.
- Safe areas y paddings.
- Reordenar columnas solo en la sesión.
- Indicadores visuales de vista personalizada.
- Tooltips de recuento en pestañas.
- Integrar `Disponibles` dentro de `Jornada` o mantenerlo aparte.
- Controles de demo (`Simular`, `Simular captura`, copy extra).
- Taxonomía visual de tabs de ficha y paneles.

---

## Resumen final

La reconstrucción en `src/` es **funcionalmente suficiente** para enseñar el producto, pero **no es fiel** al diseño ideal de `_diseno-ideal/`, sobre todo en `/panel`.

Las pérdidas más relevantes frente a tu diseño iterado son:

- personalización de propiedades de ficha/panel
- personalización avanzada de tablas
- refinamiento de tabs, contadores y microestados
- flujo completo de `Agendar con Mecanu`
- fidelidad de la ficha completa y de algunas superficies laterales

En `/conductor`, en cambio, el port es bastante más fiel y las divergencias son mayoritariamente visuales o de composición.
