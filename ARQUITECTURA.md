# Arquitectura — Mecanu

Este documento explica cómo está organizado el repo, qué vive dónde y por qué, y qué
consume cada portal. Está escrito para alguien que no ha visto este código antes —
otro modelo en Cursor, o el fundador revisando qué se hizo.

## Los dos portales

Mecanu tiene dos superficies completamente independientes que comparten un mismo
proyecto Next.js:

| Portal | Ruta | Quién lo usa | Naturaleza |
|---|---|---|---|
| **Panel del taller** | `/panel` | Operador del taller, en un ordenador | Web de escritorio normal. Sin instalación, sin offline. |
| **App del conductor** | `/conductor` | Conductor, en la calle con el móvil | PWA instalable, offline-first (ver "PWA" abajo). |

No comparten pantallas, componentes visuales ni estado de UI. Lo único que
comparten es la capa de datos y el design system — exactamente como en el handoff
de diseño original (`HANDOFF.md`: "Ambas superficies comparten el mismo modelo").

## Estructura de carpetas

```
src/
├── app/
│   ├── (taller)/panel/          Ruta del panel. page.tsx monta <PanelApp />.
│   ├── (conductor)/conductor/   Ruta del conductor. layout.tsx (metadata PWA) + page.tsx monta <ConductorApp />.
│   ├── api/v1/                  API routes REST que usa la app del conductor (ver CONTRATOS-API.md).
│   ├── layout.tsx               Layout raíz. NO tiene nada de PWA — eso vive solo en (conductor)/conductor/layout.tsx.
│   ├── page.tsx                 Landing pública — hoy un selector simple entre los dos portales (diseño real: pendiente, ver CLAUDE.md).
│   └── globals.css              Importa los tokens del design system y Tailwind, en ese orden (ver nota CSS abajo).
│
├── components/
│   ├── ds/                      Los 47 componentes del design system Mecanu (Button, Badge, DataTable, SlideToConfirm, ...). Puros, sin lógica de negocio. Barrel en index.ts.
│   ├── taller/                  Componentes propios del panel (kanban, campañas, fichas, wizard de agendar...). Su único punto de entrada a los datos es taller/data.ts.
│   └── conductor/                Componentes propios de la app del conductor (jornada, check-in, bottom sheets...). Su único punto de entrada a los datos es conductor/data.ts.
│
├── lib/mecanu/
│   ├── types.ts                 FUENTE ÚNICA DE VERDAD de las formas de datos. Schemas Zod + tipos inferidos. Todo lo demás importa de aquí.
│   ├── mecanu-data.ts           Entidades base: CLIENTES, VEHICULOS, CONDUCTORES, TEMPARIO, inspecciones, oportunidades.
│   ├── mecanu-pipeline.ts       Config declarativa: estados, subestados, tags, reglas del kanban.
│   ├── mecanu-rutas.ts          Construye RUTAS/PARADAS/TRASLADOS/LOGS/PRESUPUESTOS/CAMPAÑAS a partir de los dos anteriores.
│   ├── mecanu-whatsapp.ts       Simulación de WhatsApp Cloud API para el panel de Campañas.
│   ├── idempotency.ts           Store en memoria para deduplicar escrituras reintentadas (ver "Idempotencia" abajo).
│   ├── api-helpers.ts           Wrapper compartido por las API routes: valida con Zod, aplica idempotencia, formatea errores.
│   └── repo/
│       ├── repo.ts              La interfaz `MecanuRepo` — el contrato real. Léelo primero.
│       ├── repo-mock.ts         Única implementación hoy. Envuelve mecanu-rutas.ts/mecanu-whatsapp.ts con la interfaz async de repo.ts.
│       └── index.ts             `export const repo: MecanuRepo = mockRepo`. Todo el código importa `repo` de aquí, nunca de repo-mock.ts directamente.
│
└── styles/ds/                   Tokens CSS del design system (colores, tipografía, espaciado, radios, elevación, motion, iconos).
```

## Por qué el conductor va por API y el taller por Server Actions

**El conductor llama a `/api/v1/*` (REST, con `Idempotency-Key`).** Es offline-first:
encola acciones localmente cuando no hay red y las reintenta al reconectar (ver
`HANDOFF.md` §7.5). Necesita una superficie HTTP estable, versionada, con un
contrato de payload explícito e idempotente — un Server Action no da eso: es una
llamada RPC atada al árbol de componentes de esa sesión, no algo que una cola
offline pueda serializar y reintentar de forma fiable horas después. Por eso el
conductor tiene su propia carpeta `src/app/api/v1/` con rutas REST documentadas en
`CONTRATOS-API.md`.

**El panel usa Server Actions libremente.** Es una sesión de escritorio síncrona,
sin cola offline, sin necesidad de un contrato HTTP versionado hacia fuera — solo
necesita mutar datos y refrescar la UI. Server Actions es el patrón nativo de
Next.js 15 para eso y evita construir/mantener una capa REST paralela sin ningún
beneficio real para este caso de uso.

Ambos —Server Actions del panel y API routes del conductor— deben pasar por el
mismo `repo` (`src/lib/mecanu/repo`). Ninguno debe leer ni escribir en
`mecanu-rutas.ts` directamente.

## El patrón repo

`src/lib/mecanu/repo/repo.ts` declara la interfaz `MecanuRepo`: todos los métodos
de lectura y escritura que la app necesita, cada uno `async` (aunque el mock
resuelva al instante) porque ese es el contrato correcto para una base de datos
real sin tener que tocarlo el día que llegue.

Hoy `repo-mock.ts` es la única implementación: envuelve las funciones síncronas de
`mecanu-rutas.ts` (que siguen siendo la fuente de datos real del mock — no se han
duplicado) con la forma async de `MecanuRepo`. El día que exista Supabase: se
escribe `repo-supabase.ts` implementando la misma interfaz, y se cambia una línea
en `repo/index.ts`. Cero cambios en componentes, cero cambios en API routes.

**Excepción documentada, no accidental:** `src/components/taller/data.ts` y
`src/components/conductor/data.ts` (las fachadas tipadas que ya existían antes de
este bloque de trabajo) hoy siguen leyendo de `mecanu-rutas.ts`/`mecanu-whatsapp.ts`
de forma síncrona en el momento de import, no a través de `await repo.algo()`. Es
una decisión deliberada de esta etapa: forzar esos ~30 componentes de UI ya
construidos y verificados a un patrón de datos asíncrono (con estados de carga)
habría sido una reescritura de UI de alto riesgo, y el encargo de este bloque es
preparar el terreno para el backend, no tocar lógica de negocio ni UI. Ver
`PREGUNTAS-ABIERTAS.md` para el plan concreto de migración de esos dos archivos
cuando el backend real (async de verdad, con latencia) llegue.

## Idempotencia

`src/lib/mecanu/idempotency.ts` + `api-helpers.ts` implementan una clave de
idempotencia en memoria: si el cliente manda el header `Idempotency-Key` en un
POST/PATCH de `/api/v1/*` y esa clave ya se procesó, se devuelve la respuesta
guardada sin re-ejecutar nada. Es necesario porque la app del conductor reintenta
la misma tarea encolada tras reconectar (HANDOFF.md §7.5: "nunca rehace desde
cero"), y una petición de red puede reenviarse sin que el cliente sepa con certeza
si la primera llegó.

El store de hoy es un `Map` en memoria del proceso — se vacía en cada redeploy. En
producción es una tabla Postgres con constraint único en la clave (detalle en
`MODELO-DATOS.md`).

## PWA (`/conductor`)

Manifest + service worker + iconos viven en `public/` y solo se registran/enlazan
desde `src/app/(conductor)/conductor/layout.tsx` y
`src/components/conductor/registerSW.ts` — nunca desde el layout raíz. El service
worker (`public/sw-conductor.js`) es network-first con fallback a caché para
navegación y lecturas GET; nunca intercepta POST/PATCH, porque esas ya tienen su
propia cola offline en memoria de React (duplicar la cola en el Service Worker
generaría dos sistemas de reintento compitiendo entre sí).

## Cómo cargan las fuentes (y cómo NO cargarlas)

`src/styles/ds/tokens/fonts.css` está deliberadamente vacío de `@import url(...)`.
Se probó primero con un `@import` remoto a Google Fonts ahí dentro (con el orden de
`globals.css` ajustado para que precediera a `"tailwindcss"`, ya que Turbopack
exige que todo `@import` vaya antes que cualquier otra regla en el CSS aplanado).
Funcionaba en `next dev` — pero **no sobrevive a `next build`**: se inspeccionó el
CSS de producción compilado y el `@import` simplemente no está en el archivo final,
aunque todos los demás tokens sí. Turbopack lo descarta en el paso de build, no en
dev. Esto se descubrió comparando el proyecto contra los `.dc.html` originales: los
iconos se veían como texto literal (`arrow_back`, `search`...) y la tipografía caía
al system font — solo en el build de producción, nunca en dev, lo que llevó a
comparar ambos CSS compilados directamente.

La carga real hoy, en `src/app/layout.tsx`:
- **Plus Jakarta Sans** vía `next/font/google` — se descarga y autoaloja en build
  time (queda en `.next/static/media/*.woff2`), cero dependencia de red en
  runtime. Expone `var(--font-plus-jakarta-sans)`, que `tokens/typography.css`
  usa dentro de `--mecanu-font-family`.
- **Material Symbols Rounded** vía un `<link rel="stylesheet">` real en el
  `<head>` del layout raíz — un `<link>` nativo lo resuelve el navegador en
  runtime y nunca pasa por el bundler de CSS, así que sí sobrevive al build. Es
  además el mismo patrón que usaban los `.dc.html` originales (un `<link>` de
  verdad en su `<helmet>`, nunca una importación empaquetada).

Regla para quien toque esto: **cualquier fuente/recurso remoto nuevo va como
`<link>` en el `<head>` o vía `next/font`, nunca como `@import url()` dentro de un
archivo CSS que pase por el pipeline de Turbopack.** Verificar siempre contra
`next build` + `next start`, no solo contra `next dev` — el comportamiento difiere.

## Qué NO cubre este bloque de trabajo

Ver `PREGUNTAS-ABIERTAS.md` para la lista completa y honesta de lo que queda
ambiguo o sin resolver. En resumen: no hay base de datos real, no hay
autenticación/roles, `crearRutaDesdeCampana` no está implementado en el mock (crear
una ruta nueva completa requiere la misma lógica de construcción que hoy solo corre
una vez al arrancar el proceso), y los dos `data.ts` de los portales siguen leyendo
síncronamente en vez de a través de `repo` — ambas cosas están documentadas como
trabajo pendiente explícito, no como bugs escondidos.
