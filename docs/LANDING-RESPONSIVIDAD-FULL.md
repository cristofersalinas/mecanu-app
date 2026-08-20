# Landing — ResponsividadFull

Snapshot de la landing pública en el commit etiquetado **`ResponsividadFull`**
(20 ago 2026, merge a `main` + esta nota). Rama de respaldo:
`respaldo/ResponsividadFull`.

Archivos: `src/app/landing.module.css`, `src/components/landing/LandingPage.tsx`,
`src/components/landing/MadridMap.tsx`, `src/lib/landing/copy.ts`.

No iterar a ciegas los controles del mapa ni el hero: las reglas de abajo son
decisiones ya cerradas en esta versión.

## Hero (`#inicio`)

Layout horizontal (texto | imagen) por encima de **720px**. A **≤720px** pasa a
columna: texto arriba, foto abajo.

### Altura (721px–1200px)

`min-height` / `max-height` del `.heroGrid` interpolan de 545/595px a un **12%
menos** en 720px (`clamp` con `(100vw - 720px) / 480px`).

Espaciados que se compactan en el mismo rango, con tope en 720px:

- kicker (`.backedBy`) → titular: **−30%** (`1.5rem` → `1.05rem`)
- titular → descripción: **−30%** del margen móvil (`1.15rem` → `0.805rem`)
- descripción → botones: **mitad** del margen móvil (`1.5rem` → `0.75rem`)

Por encima de 1200px: valores fijos de desktop.

### Foto (≤720px)

Altura según el **ancho del bloque**, no `100vw` (si no, se desencaja y asoma
`--warm`). Parte un **~36% más baja** que el `4/3.35` original (`0.75 * 0.85`)
y sube hacia **1:1** al llegar a ~320px.

`object-fit: cover` + `scale(1.14)` y `object-position: 65% 78%` para que el
recorte no deje franjas grises.

### Botones del hero

| Ancho | Comportamiento |
|---|---|
| **≤449px** | Columna, `width: 100%`, padding interno `calc(1.5rem * 0.7)` |
| **450px–720px** | En fila, `nowrap`, padding `calc(1.5rem * 2.15)` |
| **721px–919px** | En fila, ancho fijo ~290px |
| **≥920px** | En fila, **190px** cada uno |

Titular y descripción comparten el mismo `max-width` / `width: 100%` (sin el
truco `105%` + `margin-left` negativo: desalinea).

`.page button` solo hereda `font-family`, **no** `font: inherit` — si no, anula
el `font-size` de las pestañas del mapa.

## Mapa — selector de ciudades

Cápsula blanca (`.mapCityTabs`, `border-radius: 999px`, `padding: 3px`,
`inline-flex` / `width: auto`). Cada ciudad es una subcápsula.

- Activa: pastilla negra **`.mapCityThumb`** que se desliza (`transform` +
  `width`, 0,4s). En la primera y la última ciudad el thumb llega al borde de
  la cápsula mayor (`height: 100%`, `border-radius: inherit`) para que la curva
  coincida. No aplicar `margin-left: -10px` al primer botón (el thumb es el
  primer hijo): el solape va en `.mapCityTabs > button + button`.
- Si no caben: `.mapCitySelect` (cápsula). Medición: `.mapCityTabsMeasure` +
  `ResizeObserver`.
- En móvil las pestañas miden según el texto (`min-width: max-content`) para
  que «Barcelona» no se corte.
- Tipografía: **`.72rem`** desktop, **`.7rem`** ≤720px.
- Altura de pestaña: `39px * 1.07` (desktop), `44px * 1.07` (móvil).

Cambio de ciudad: `map.stop()` + `easeTo` 1100ms ease-out cúbico.

## Mapa — reset, zoom, atribución

Todo en React salvo la «i» de MapLibre (compact attrib).

- Misma vertical derecha: `--map-control-right`.
- Hueco entre piezas: `--map-control-gap: .5rem`.
- Tamaño botón / atribución: **32px** (`--map-control-btn`,
  `--map-control-attrib-size`).
- Columna (reset + zoom) `bottom: bottom + attrib-size + gap` para no pisar la i.
- Anular margen MapLibre `10px` en `.maplibregl-ctrl-bottom-right .maplibregl-ctrl`.

## Otras piezas de esta versión

- Stat 03: valor **`12-30%`**, etiqueta «Más rotación de coches», descripción
  desarrollada a partir de rotación (4 idiomas en `copy.ts`).
- `#flota` (¿Pico de trabajo?): padding horizontal **igual** que `.stepsRow`
  (`2rem` desktop, `1.25rem` ≤720px) para alinear con la 1ª y la última tarjeta
  de pasos.

## Cómo volver a este punto

```bash
git checkout ResponsividadFull          # tag anotado
# o
git checkout respaldo/ResponsividadFull # rama de respaldo
```

Producción: merge del PR #15 en `main` (`8055b55` + commits de esta nota).
URL: https://mecanu.com
