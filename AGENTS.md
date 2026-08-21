# Reglas para quien continúe este proyecto

Mecanu. Panel del taller (`/panel`) + app del conductor (`/conductor`, PWA
offline-first) + backoffice del dueño (`/backoffice`). Backend futuro: Supabase (Postgres) + Vercel. El fundador trabaja
solo y no es ingeniero — estas reglas existen para que nada dependa de memoria o
criterio implícito.

## No negociables

1. **Todo cambio de esquema de base de datos es un archivo SQL versionado en
   `supabase/migrations/`.** Cero clicks en el dashboard de Supabase. Si cambiaste
   algo a mano en el dashboard para probar, la migración `.sql` que lo reproduce
   tiene que existir antes de dar el cambio por terminado.

2. **La clave `service_role` de Supabase nunca aparece en código de cliente, nunca
   en un commit.** Solo en variables de entorno de servidor
   (`SUPABASE_SERVICE_ROLE_KEY`, sin prefijo `NEXT_PUBLIC_`). Si un `git diff` la
   muestra, para y rota la clave antes de seguir.

3. **Dos proyectos Supabase separados: dev y producción.** Nunca apuntar
   desarrollo a la base de producción, ni para "probar algo rápido".

4. **No añadir dependencias nuevas sin justificarlo explícitamente en el mensaje
   del commit.** Una línea basta: qué hace, por qué no se podía evitar.

5. **Todo cambio en `src/lib/mecanu/` requiere un test que lo cubra.** Esa carpeta
   es la lógica de negocio pura (reglas de estado, cálculo de presupuesto,
   validaciones) — es la que un bug ahí cuesta dinero real o un cliente enfadado.
   Ver Bloque C / `PREGUNTAS-ABIERTAS.md` para el estado actual de cobertura.

6. **`src/lib/mecanu/types.ts` es la fuente única de verdad de las formas de
   datos.** Un cambio de forma de entidad se hace ahí primero, todo lo demás se
   re-tipa solo. No redeclarar un tipo que ya existe en `types.ts` en otro archivo.

7. **Ningún componente de UI importa `mecanu-rutas.ts`/`mecanu-data.ts`/
   `mecanu-whatsapp.ts` directamente.** Todo pasa por `src/lib/mecanu/repo`
   (`import { repo } from '@/lib/mecanu/repo'`). Excepción documentada y temporal:
   `src/components/taller/data.ts` y `src/components/conductor/data.ts` — ver
   "Migrar los data.ts de los portales" en `PREGUNTAS-ABIERTAS.md`.

8. **La app del conductor es offline-first.** Cualquier escritura nueva que le
   añadas necesita: (a) encolarse localmente si no hay red, (b) ser idempotente en
   el servidor vía `Idempotency-Key` (`src/lib/mecanu/api-helpers.ts`), (c)
   ofrecer "reintentar la misma tarea" en la UI, nunca "empezar de cero".

9. **Archivos `'use server'`: solo `export async function`.** Nada de
   `export const`, `export function` síncrona ni clases. Next lo convierte en un
   500 opaco (pasó con `/backoffice`). Las constantes van en otro archivo
   (p. ej. `session.ts`). Lo verifica `src/lib/next-invariants/` en `npm test`.

10. **URLs de portales: no inventar ni adivinar.** La tabla canónica está en
    `src/lib/next-invariants/mapa-portales.ts` (`PORTALES`). Si añades un portal,
    una fila ahí + `page.tsx` + entrada en `proxy.ts` y `robots.ts`. El test
    comprueba que la URL, el archivo y el componente de entrada existen y que
    los imports `@/` no apuntan al vacío.

## Portales (dónde abrir qué)

| URL | Quién | Archivo |
|---|---|---|
| `/panel` | Operador del taller | `src/app/(taller)/panel/page.tsx` → `PanelApp` |
| `/conductor` | Conductor (PWA) | `src/app/(conductor)/conductor/page.tsx` → `ConductorApp` |
| `/backoffice` | Dueño / operación | `src/app/(backoffice)/backoffice/page.tsx` → `BackofficeApp` |

En local: `http://localhost:3000` + la URL. En Vercel están cortados (mock).

## Qué leer primero, en orden

1. `CLAUDE.md` — contexto de producto y decisiones cerradas. Léelo antes que nada:
 ahí está la mitad de las respuestas a preguntas que podrías estar a punto de
 volver a hacer. Beneficios y propuesta de valor comercial:
 `docs/PROPUESTA-VALOR.md` — anotar ahí un claim nuevo antes de subirlo a la
 landing. Responsive de la landing pública: `docs/LANDING-RESPONSIVIDAD-FULL.md`
 (snapshot **ResponsividadFull**). Cumplimiento UE/ES (RGPD, cookies, LSSI):
 `docs/CUMPLIMIENTO-UE.md`.
2. `ARQUITECTURA.md` — qué vive dónde y por qué.
3. `src/lib/mecanu/types.ts` — las formas de datos reales, con comentarios de qué
   es decisión de producto y qué es campo `// REVISAR`.
4. `MODELO-DATOS.md` — si vas a tocar el esquema de Postgres.
5. `CONTRATOS-API.md` — si vas a tocar `/api/v1/*` o el cliente que las llama desde
   el conductor.
6. `PREGUNTAS-ABIERTAS.md` — antes de asumir cualquier cosa que el código deja
   ambigua, comprueba si ya está anotada ahí. Si no está y tú también la
   encontraste ambigua, añádela — no la resuelvas en silencio con una suposición.
7. `docs/SLACK.md` — avisos a Slack y trabajo con `@Cursor` desde un canal.
   Canales: `#ordenes`, `#leads`, `#oportunidades`, `#csx`, `#alertas`, `#deploys`.
   El bot de avisos no es Cursor. CSX/Destacados: `docs/SLACK-CSX.md`.
   Señales taller/conductor: `docs/SLACK-SENALES.md`. Seguridad: `docs/SLACK-SEGURIDAD.md`.

## Cómo verificar que un cambio no rompe nada

```bash
npm run build   # build de producción — si falla, no sigas
npm run lint    # eslint
npm test        # vitest sobre src/lib/mecanu — ver Bloque C
```

Los tres corren en CI en cada push (`.github/workflows/ci.yml`). El job se llama
**`production-gate`**. En `main` es un check **obligatorio** (ruleset de GitHub):
un PR en rojo no se puede mergear, ni siquiera a mano.

**Nunca** `gh pr merge` hasta que CI esté verde. Usa:

```bash
./scripts/merge-pr-if-green.sh <numero-pr>
```

Si Vercel falla *después* del merge, mecanu.com se queda en el deploy anterior.
El workflow `production-deploy-watch.yml` abre un issue `deploy-production` y
avisa en Slack `#alertas`. Un deploy OK avisa en `#deploys`. Confirma el alias:
`npx vercel inspect mecanu.com` (status Ready, commit nuevo). Mapa Slack:
`docs/SLACK.md`.

Para verificar visualmente que el panel y el conductor siguen viéndose igual tras
un cambio de infraestructura (no de producto): `npm run dev`, abre `/panel` y
`/conductor`, compara con capturas anteriores si las tienes. No hay tests
visuales/e2e todavía — es una `PREGUNTA-ABIERTA` sobre si merece la pena montarlos.

**`next dev` y `next build` no siempre se comportan igual** — ya pasó una vez con
la carga de fuentes (ver `ARQUITECTURA.md`, "Cómo cargan las fuentes"): algo
funcionaba en dev y se rompía en el build de producción sin ningún error visible,
solo un CSS distinto. Si tocas `globals.css`, `layout.tsx`, o cualquier cosa que
cargue un recurso externo, verifica contra `npm run build && npx next start`, no
solo contra `npm run dev`.

## Landing — hero, mapa y controles (ResponsividadFull)

Archivos: `src/components/landing/MadridMap.tsx`, `LandingPage.tsx`,
`src/app/landing.module.css`. Detalle y cómo restaurar el snapshot:
`docs/LANDING-RESPONSIVIDAD-FULL.md`. Tag git: `ResponsividadFull`.

### Hero

- Horizontal **>720px**; columna (texto / foto) **≤720px**.
- 721–1200px: altura del grid −12% hacia 720px; márgenes kicker/titular/descripción
  se compactan (ver el doc). No usar `width: 105%` en el titular: desalinea.
- Foto ≤720px: altura con `aspect-ratio` del contenedor (no `100vw`) + `cover` y
  `scale(1.14)` para no dejar fondo gris.
- Botones: columna a **≤449px**; fila 450–720; ~290px en 721–919; **190px** ≥920px.
- `.page button` solo `font-family: inherit` (nunca `font: inherit`: pisa el
  `font-size` de las ciudades).

### Ciudades (cápsula)

- `.mapCityTabs` es `inline-flex` / `width: auto` (no estirar a 760px).
- Activo: `.mapCityThumb` deslizante. Primera/última ciudad: thumb a `top: 0` /
  `height: 100%` para igualar la curva. Solape −10px solo en
  `.mapCityTabs > button + button`.
- Compacto: `.mapCitySelect` si no caben (`.mapCityTabsMeasure`).

### Reset, zoom, atribución

Hay **tres piezas**, las tres en la vertical derecha (`--map-control-right`):

1. **React** — `.mapCitySwitcher` arriba (cápsula o select).
2. **React** — `.mapControlsColumn`: reset (`.mapResetBtn`) + zoom (`.mapZoomGroup`).
3. **MapLibre** — atribución compacta («i») en `.maplibregl-ctrl-bottom-right`.

**Reglas de alineación (no iterar a ciegas):**

- Hueco `--map-control-gap: .5rem`. Tamaño botón y «i»: **32px**.
- La columna va `bottom: bottom + attrib-size + gap` para no pisar la i.
- MapLibre CSS global gana si no se anula con la misma especificidad:
  - `.maplibregl-ctrl-group:not(:empty)` — anillo; usar `--map-control-surface-shadow`.
  - `.maplibregl-ctrl-bottom-right .maplibregl-ctrl { margin: 0 10px 10px 0 }` —
    anular a `margin: 0` y `right`/`bottom` con las variables.
- Borde, sombra y hover del zoom = mismas variables que `.mapResetBtn`.

Si tocas esto, verifica en `/`: ciudades centradas arriba; reset, +/- e i en la
misma vertical derecha, sin solaparse; hero en 720 / 450 / <450.

## Ramas

`feature/<nombre>` → PR a `main` → CI verde → merge → producción.
No hay staging permanente. Local: `npm run demo` (con Simular) o `npm run dev`.
`npm run entorno` te dice el mundo. Detalle: `docs/BRANCHING.md` y `docs/ENTORNOS.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
