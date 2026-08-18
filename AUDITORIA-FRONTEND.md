# Auditoría frontend — fuentes, revert y design system

Fecha: 2026-08-18.
Alcance: reparación visual de fuentes/iconos + comparación de `/panel` y `/conductor` contra los `.dc.html` originales. Sin cambios de lógica de negocio ni backend.

**Build:** `npm run build` pasó el 2026-08-18 (Next.js 16.3.1, TypeScript limpio, `/panel` y `/conductor` estáticos).

**Check visual de producción:** `npx next start --port 3001` (el 3000 ya estaba ocupado). HTML servido:

- `/panel` y `/conductor` → 200
- `<html>` y `<body>` con las clases `variable` + `className` de Plus Jakarta Sans, woff2 precargado
- `<link rel="stylesheet" href="/fonts/material-symbols-rounded.css" data-precedence="high">` en el head
- `/fonts/material-symbols-rounded.css` → 200
- Iconos del sidenav siguen siendo ligatures en el HTML (`view_kanban`, `menu_book`, `local_shipping`, `chevron_left`) — correcto: el glifo lo pinta la fuente en el navegador

Ábrelo tú: [http://localhost:3001/panel](http://localhost:3001/panel) y [http://localhost:3001/conductor](http://localhost:3001/conductor).

---

## 1. Qué cargaban los originales

Archivos leídos:

- `_source/Mecanu Panel.dc.html` (termina en la línea 2454, cortado a mitad de un atributo CSS)
- `_source/Mecanu Conductor.dc.html` (~1963 líneas, completo)

Ninguno de los dos pone un `<link>` directo a Google Fonts en el `<helmet>`. Los dos cargan el design system igual:

```
_ds/mecanu-design-system-bf03e05c-be32-4c2f-a9a5-ed714f5f188a/tokens/fonts.css
…/colors.css, typography.css, spacing.css, radius.css, elevation.css, motion.css, icons.css, base.css
…/styles.css
…/_ds_bundle.js
```

Esa carpeta `_ds/` **no está en el repo** (ni siquiera dentro de `_source/`, que además está en `.gitignore`). `fonts.css` original no se puede abrir. Por el contrato del design system Mecanu y por lo que el Next.js ya documentaba, ese archivo era el que hacía los `@import` a:

- **Plus Jakarta Sans** — pesos 400, 500, 700, 800 (Regular / Medium / Bold / ExtraBold; el ExtraBold sustituye Škoda Black 900, uso en Label)
- **Material Symbols Rounded** — variable font, ejes `opsz 20..48`, `wght 300..500`, `FILL 0..1`, `GRAD 0`

Los iconos del HTML se pintan de dos formas: `<x-import … Icon name="arrow_back">` y, en el conductor, `<span class="mecanu-icon">sos</span>`. En ambos casos el glifo es una ligature: si la fuente no carga, se lee el nombre (`arrow_back`, `view_kanban`, `search`, `add`, `menu_book`, `local_shipping`, `chevron_left`).

`body` usa `font-family: var(--mecanu-font-family)`. Sin Plus Jakarta, cae al system font.

No hay `@font-face` locales en los `.dc.html`.

---

## 2. Tokens en el proyecto Next.js

`src/styles/ds/styles.css` sí importa los 9 tokens, en el mismo orden que el helmet original:

`fonts.css` → `colors.css` → `typography.css` → `spacing.css` → `radius.css` → `elevation.css` → `motion.css` → `icons.css` → `base.css`

`src/app/globals.css` importa ese `styles.css` **antes** de Tailwind. Los tokens están en el bundle.

Lo que **no** estaba en el CSS bundleado (a propósito, ver `ARQUITECTURA.md`):

- `fonts.css` estaba vacío de `@import`. Un `@import url(fonts.googleapis.com)` dentro de CSS que pasa por Turbopack **desaparece en `next build`** aunque funcione en `next dev`. Eso cuadra con el síntoma.
- `.mecanu-icon` sí existía en `icons.css` (`font-family: 'Material Symbols Rounded'` + `font-variation-settings`). La clase CSS de los iconos no se había perdido. Faltaba la fuente.
- `--mecanu-font-family` apuntaba a `var(--font-plus-jakarta-sans)` **sin fallback dentro del `var()`**. Si next/font no define esa custom property, toda la declaración queda inválida y el body cae al system font. Eso también cuadra.

`src/app/layout.tsx` **ya intentaba** cargar las dos fuentes (next/font para Plus Jakarta + `<link>` a Google Fonts dentro de un `<head>` manual). Ese intento no era suficiente en Next.js 16:

1. El root layout usa la Metadata API. Un `<head>` manual no está garantizado en el HTML servido.
2. Next.js recorta `<link>` a `fonts.googleapis.com` (regla `no-page-custom-font` / font optimizer). Material Symbols **no existe** en `next/font/google` (comprobado en `node_modules`: no hay `Material_Symbols_Rounded`), así que el optimizer quita el link y no pone nada en su lugar.
3. Plus Jakarta solo aplicaba `.variable` en `<html>`, no `.className`. La cadena de custom properties era el único camino hacia `font-family`.

Aplica a **los dos portales**: `/panel` y `/conductor` cuelgan del mismo `src/app/layout.tsx`. El layout de `/conductor` solo añade metadata PWA; no toca fuentes.

---

## 3. Qué se reparó (solo fuentes)

| Pieza | Cambio |
|---|---|
| `src/app/layout.tsx` | Plus Jakarta: `.variable` **y** `.className` en `<html>` y `<body>`. Material Symbols: `<link precedence="high">` a un CSS **same-origin**. `preconnect` a Google Fonts. Se elimina el `<head>` manual. |
| `public/fonts/material-symbols-rounded.css` | Nuevo. Fuera del bundler. El `@import` a Google Fonts vive aquí; el navegador lo resuelve en runtime con su User-Agent (variable font, no TTF estático). `display=block` para no pintar ligatures como texto mientras carga. |
| `src/styles/ds/tokens/typography.css` | `--mecanu-font-family: var(--font-plus-jakarta-sans, "Plus Jakarta Sans"), …` — fallback dentro del `var()`. |
| `src/styles/ds/tokens/icons.css` | Se añade `font-feature-settings: "liga"` (sin ligatures, el nombre del icono se lee aunque la fuente esté cargada). |
| `src/styles/ds/tokens/fonts.css` | Sigue sin `@import` (Turbopack). Comentario actualizado al mecanismo nuevo. |

No se ha añadido ninguna dependencia npm.

`ARQUITECTURA.md` § «Cómo cargan las fuentes» describe el `<head>` manual. Queda desactualizado; no lo toqué (esta auditoría es la fuente de verdad del cambio).

---

## 4. Auditoría de alcance del revert

Comparación hecha leyendo los `.dc.html` y el árbol `src/components/{taller,conductor,ds}`. Sin `git log` / `git diff` (terminal). No pude identificar el commit del revert.

### 4.1 No es un revert que se haya llevado pantallas enteras

Los dos portales están montados y cubren las superficies del prototipo:

**`/panel`** — shell (logo, sidenav, toggle, tooltip, header con migas `arrow_back`, Agendar / Añadir servicio, avatar Rubén Ortega) + General, Tablero (Traslados + Campañas), Contactos, Tempario, Conductores, Configuración, ficha lateral, drawer, modal de inspección, toasts, modal Agendar, WhatsApp / previa de campaña, Crear ruta desde campaña aceptada.

**`/conductor`** — marco de dispositivo, jornada, detalle de traslado, disponibles, emergencias, solicitud, check-in, entrega, cámara, diálogos, banner de conexión, cola offline. Navegación por estado, no por rutas, igual que el original.

`InspeccionModal.tsx` está completo (~192 líneas: carrocería, hallazgos, vehículo, firmas, visor de foto) aunque el `.dc.html` del panel se corte a mitad de ese modal. El port no depende de ese recorte.

### 4.2 El `.dc.html` del panel termina en la línea 2454

`_source/Mecanu Panel.dc.html` acaba en esa línea. **Es el límite del archivo original, no una pérdida de un revert.** `CLAUDE.md` sigue diciendo «~6.600 líneas» porque describe el handoff de Claude Design, no el recuento de esta copia. No hay nada que reconstruir a partir de ahí.

### 4.3 Diferencias visuales / de port que **no** son un agujero de revert

Anotarlas; no reconstruir sin tu criterio.

| Diferencia | Dónde | Lectura |
|---|---|---|
| Panel de «Propiedades de ficha» (`propPanelAbierto`: ocultar / renombrar / crear propiedades) | HTML del panel, no está en `PanelApp.tsx` | Parece herramienta de edición del prototipo Claude Design, no producto. |
| `ConnectionBanner` en el panel (`mostrarBanner`, default false) | HTML sí, Next no | En Next solo vive en `/conductor`, que es donde el offline importa. |
| Buscador del header del HTML (CSS `.mcn-search`) | El header Next no tiene SearchInput global | La búsqueda está dentro de cada vista (Traslados, Campañas, Contactos…). |
| `SidebarNav` / `Input` / `Select` / `SearchInput` / `Tabs` / `FilterBar` | Existen en `@/components/ds` **y** en `taller/ui/Primitives.tsx` | El comentario de Primitives dice que «todavía no están publicados en ds». **Sí lo están.** El panel usa las copias locales porque el DS no cubre API extra (p. ej. `SidebarNav.minimizado`). |
| `SignatureCanvas`, `OversizedButton`, `EvidenceGrid`, `IncidentButton`, `TireSelector` | Copias locales en `/conductor` | `SignatureCanvas` del conductor dice `TODO DS: sustituir cuando exista` — **ya existe** en ds. Misma historia: copias de port, no archivos borrados. |
| Vista simulada de cliente | `CLAUDE.md` la da por entregada | En Next es la pestaña `previa` de `WhatsAppPanel`, no una ruta aparte. |
| Landing `/` | HTML no la tenía | Página puente «la landing no está diseñada» + links a los dos portales. Coherente con `CLAUDE.md`. |

Ninguna de estas es «se revirtió un componente y la pantalla quedó en blanco». Son divergencias de port o copias locales deliberadas.

**Criterio cerrado el 2026-08-18:** se quedan documentadas aquí y **no se tocan**. Las copias locales de componentes y el `ConnectionBanner` del panel las revisas tú más adelante — ninguna bloquea el backend.

### 4.4 Los 47 componentes del design system

`src/components/ds/index.ts` exporta **47** componentes (el 48.º archivo es el barrel). Están todos en disco con su CSS módulo cuando aplica.

**En uso real en `/panel` o `/conductor` (import desde `@/components/ds/…`):**
Avatar, Badge, Button, Checkbox, ConnectionBanner, DataTable, ErrorState, Icon, ListItem, Logo, MetricsCard, ProgressBar, Radio, Skeleton, StatusTimeline, Switch, TimeWindow, Toast.

**Presentes y exportados, no importados por los portales:**
Attachment, AvatarGroup, BottomNav, BottomSheet, Breadcrumbs, CameraTrigger, Card, CardList, CustomerMiniCard, DateRangePicker, Divider, FilterBar, FilterChip, Input, Modal, OversizedButton, QuickCallButton, SearchInput, Select, SidebarNav, SignatureCanvas, SlideToConfirm, StatusBanner, Tabs, Tag, TireSelector, UpsellAlertCard — y los equivalentes locales del conductor (EvidenceGrid, IncidentButton).

Eso no es un revert: es la librería publicada y un port que a veces duplica. No unifiqué las copias.

`Icon` (`mecanu-icon` + ligature) es el que ambos portales usan para `arrow_back`, `view_kanban`, `chevron_left`, `search`, `add`, `menu_book`, `local_shipping`. Con la fuente cargada, esos nombres dejan de verse como texto.

### 4.5 Tokens del DS

Los 9 archivos de `src/styles/ds/tokens/` están y se importan. Colores, spacing, radius, elevation, motion coinciden con lo que el HTML usa (`--mecanu-neutral-25`, `--mecanu-electric-600`, etc.). No hay indicios de un revert que hubiera vaciado tokens — solo `fonts.css` se vació de `@import`, y eso fue una decisión documentada (incorrecta a medias: vaciar el `@import` era necesario; no dejar una vía que sobreviviera a Next 16 no lo era).

### 4.6 Qué **no** toqué a propósito

Cualquier unificación Primitives ↔ ds, cualquier recreación del panel de propiedades, cualquier búsqueda global del header, ConnectionBanner en el panel, o «Vista Simulada» como pantalla aparte. Si el revert se hubiera llevado lógica, lo habría dejado aquí y parado. No lo vi.

---

## 5. Cómo verificar (cuando confirmes terminal)

1. `npm run build` — tiene que pasar.
2. `npx next start` y abrir `/panel` y `/conductor` (el fallo original era de producción, no de `next dev`).
3. En `/panel`: los iconos del sidenav (`dashboard`, `view_kanban`, `contacts`, `menu_book`, `local_shipping`, `settings`) y el `chevron_left` del toggle se dibujan, no se leen. Plus Jakarta en títulos y body (no San Francisco / Arial).
4. En `/conductor`: `wifi` / `battery_full` / `sos` / `call` se dibujan.
5. En DevTools → Network: `/fonts/material-symbols-rounded.css` 200, y a continuación un woff2 de `fonts.gstatic.com`. En el CSS compilado de Next **no** debe hacer falta un `@import` a Google Fonts (sigue sin sobrevivir).

Si tras el build de producción los iconos siguen siendo texto, el siguiente sospechoso es red (Google Fonts bloqueado) o CSP — no el bundler. En ese caso habría que autoalojar el woff2 en `public/fonts/`.
