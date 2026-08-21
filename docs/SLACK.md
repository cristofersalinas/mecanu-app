# Slack — cómo te aviso y cómo me das trabajo

Cuatro canales de operación + `#oportunidades` para el funnel del taller.
Cuando exista backend real, las señales P2/P3 de conductor irán a un
digest `#senales`. Mapas:
[`SLACK-SENALES.md`](./SLACK-SENALES.md) ·
[`SLACK-SEGURIDAD.md`](./SLACK-SEGURIDAD.md).

Slack en silencio salvo lead, oportunidad, actuación urgente o tarea al agente.

| Canal | Para qué | Quién escribe |
|---|---|---|
| `#ordenes` | Órdenes al agente (`@Cursor …`) | Tú y Cursor |
| `#leads` | Habla con Mecanu o ITV a domicilio | Mecanu Bot |
| `#oportunidades` | Campañas del taller: creación, estados, nudges | Mecanu Bot |
| `#csx` | Destacados semanales, upsell, llamada si no ofrecen | Mecanu Bot |
| `#alertas` | Actúa ahora: CI / deploy / seguridad P0 | Mecanu Bot |
| `#deploys` | mecanu.com publicado (informativo) | Mecanu Bot |

`#general` se deja con un topic que apunta a esos canales. No se trabaja ahí.

Cursor (el `@Cursor` de Slack) y Mecanu Bot son **dos apps distintas**:
Cursor ejecuta Cloud Agents. Mecanu Bot publica avisos.

## Cómo darme instrucciones desde Slack

En `#ordenes`, un hilo nuevo:

```
@Cursor en mecanu-app: [una sola tarea]. Abre un PR a main. No mergees.
Si algo no está en CLAUDE.md o PREGUNTAS-ABIERTAS.md, anótalo; no lo inventes.
```

Reglas:

1. **Una tarea por hilo.** El siguiente `@Cursor` en el mismo hilo es una
   instrucción extra al mismo agente, no uno nuevo.
2. **Otro agente en el mismo hilo:** `@Cursor agent [otra tarea]`.
3. **No pidas merge a `main`.** CI rojo no se mergea. Tú mergeas con
   `./scripts/merge-pr-if-green.sh <n>` cuando esté verde.
4. **Repo por defecto del canal:** `@Cursor settings` →
   `cristofersalinas/mecanu-app`, rama `main`. Solo hace falta una vez.
5. Este chat de Cursor en el Mac y `@Cursor` en Slack **no son la misma
   conversación**. Slack arranca un Cloud Agent; el resultado llega como
   PR + aviso en el hilo.

Primera vez en `#ordenes`: `/invite @Mecanu`, `/invite @Cursor`, luego `@Cursor settings`.

(No uses el nombre `#cursor`: Slack lo reserva para la app Cursor.)

Comandos útiles: `@Cursor help`, `@Cursor list my agents`.

## Qué te llega solo (sin pedir nada)

| Evento | Canal | También |
|---|---|---|
| Formulario Habla con Mecanu (`/contacto`) | `#leads` | Email + Sheet |
| Formulario ITV a domicilio | `#leads` | Email + Sheet |
| Oportunidad creada / cambio de estado / nudge | `#oportunidades` | Hilo por `CMP-*` |
| Destacados / upsell / subuso CSX | `#csx` | Cron lunes + `npm run csx:semanal` |
| `production-gate` o tests rojos **en `main`** | `#alertas` | GitHub Actions |
| Deploy de producción **fallido** | `#alertas` | Issue `deploy-production` |
| Deploy de producción **OK** | `#deploys` | — |
| CI rojo en una rama `feature/…` | (nada) | Se ve en el PR |
| Preview de Vercel | (nada) | URL del PR |

### `#oportunidades` — experiencia de hilo

1. **Apertura:** taller, sucursal, matrícula, importe (IVA incl.), estado, sugerencia
   («sugerir valorar / enviar / seguimiento / crear ruta»).
2. **Comentario:** `Usuario X [rol] movió de «Estimado» a «Enviado»`.
3. **Nudge:** si Nueva/Estimado ≥24 h, Enviado ≥72 h, Confirmado sin ruta ≥4 h,
   el bot comenta en el hilo (o abre uno). Al abrir el panel se escanea una vez al día.
4. Check-in ITV que crea oferta → apertura desde `/api/v1/campanas/hallazgos`.

Variables Vercel: `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_OPORTUNIDADES`
(+ `SLACK_CHANNEL_LEADS` para formularios).

### `#csx` — relación con el taller

Upsell (≥7 autos/semana en Básico, campañas/tareas manuales, conversión,
flota llena), llamada semanal si no ofrecen, y **Destacados** con métricas,
citas y accionables CSX. Detalle: [`SLACK-CSX.md`](./SLACK-CSX.md).

No actives también el Slack de Vercel hacia `#alertas` o `#deploys`:
duplicarías el mismo aviso. El watcher del repo
(`.github/workflows/production-deploy-watch.yml`) es la fuente.

Sentry (errores de código) se puede enlazar en la UI de Sentry → `#alertas`
solo *high priority* si quieres; no es obligatorio. La **seguridad P0**
(`canary_used`, `assistant_injection`, `sondeo_sistematico`) ya publica a
`#alertas` desde código (`src/lib/slack/seguridad.ts`, dedupe 15 min).
Inventario de sensores: [`SLACK-SEGURIDAD.md`](./SLACK-SEGURIDAD.md).

## Montaje (una vez)

Hace falta un bot token. Cursor conectado **no** vale: esa app no crea
canales ni publica desde GitHub. Tres clics y un comando.

### 1. Crear Mecanu Bot

1. Abre [api.slack.com/apps](https://api.slack.com/apps?new_app=1).
2. **From a manifest**.
3. Pega `scripts/slack/app-manifest.yaml`.
4. Instálalo en el workspace.
5. **OAuth & Permissions** → *Bot User OAuth Token* (`xoxb-…`).
   Esa cadena no se pega en un chat ni se commitea.

### 2. Crear canales y pinear el playbook

En el Mac, en la raíz del repo:

```bash
# Opción A — token solo en la sesión
SLACK_BOT_TOKEN=xoxb-… npm run slack:bootstrap -- --github

# Opción B — token en .env.local (git-ignored) como SLACK_BOT_TOKEN=xoxb-…
npm run slack:bootstrap -- --github
```

Eso:

- crea `#ordenes`, `#leads`, `#oportunidades`, `#csx`, `#alertas`, `#deploys`
- escribe purpose, topic y un mensaje pineado en cada uno
- pone el mapa en el topic de `#general`
- guarda en GitHub el secret `SLACK_BOT_TOKEN` y las variables
  `SLACK_CHANNEL_ALERTAS`, `SLACK_CHANNEL_DEPLOYS`, `SLACK_CHANNEL_LEADS`,
  `SLACK_CHANNEL_OPORTUNIDADES`, `SLACK_CHANNEL_CSX`

Sin `--github` solo toca Slack y te imprime los `gh` para copiar.

Los formularios, oportunidades y CSX avisan desde **Vercel / cron / panel**.
En Vercel Production: `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_LEADS`,
`SLACK_CHANNEL_OPORTUNIDADES`, `SLACK_CHANNEL_CSX`.

### 3. Invitar a Cursor y probar el cable

En Slack, `#ordenes`:

```
/invite @Mecanu
/invite @Cursor
@Cursor settings
```

En GitHub: **Actions → Slack ping → Run workflow**. Elige `alertas`.
Si el mensaje aparece, está listo.

## Buenas prácticas (no negociables)

- **Cuatro canales, no treinta.** Un canal nuevo solo si el silencio de
  los actuales se rompe. Campañas, legal, backoffice: se discuten en
  `#ordenes` como tareas, no como canales.
- **`#leads` no se silencia** si quieres enterarte al momento. Hay
  datos personales (nombre, teléfono, email): no invites a terceros.
- **`#alertas` no se silencia.** Si te molesta el volumen, el volumen
  está mal (un aviso por incidente, no un diario).
- **`#deploys` sí se puede silenciar.** Es el "ya salió".
- **Nada de `@channel` / `@here`.** El bot no los usa. Tú tampoco.
- **No charla en `#ordenes`.** Un hilo = un encargo. La conversación
  humana, si hace falta, va a `#general` o a un DM.
- **No pongas secretos en Slack.** Ni `.env`, ni `service_role`, ni el
  `xoxb-`. Si se cuela, se rota antes de seguir.
- **No pidas al agente que mergee `main` ni que empuje a producción.**
  El ruleset y `merge-pr-if-green.sh` existen para eso.
- **Un Cloud Agent no sustituye `npm run build && npm test` en el Mac**
  cuando el cambio toca fuentes, CSS global o `layout.tsx` (ver
  AGENTS.md: `next dev` y `next build` no siempre coinciden).

## Dónde está cada pieza

| Pieza | Archivo |
|---|---|
| Nombres y textos pineados | `scripts/slack/canales.json` |
| Manifiesto de la app | `scripts/slack/app-manifest.yaml` |
| Crear canales | `scripts/slack-bootstrap.mjs` (`npm run slack:bootstrap`) |
| Aviso de formularios | `src/lib/slack/` + `/api/v1/contacto` y `/api/v1/itv-leads` |
| Hilos de oportunidades | `src/lib/slack/oportunidades*.ts` + `/api/v1/oportunidades/slack-evento` |
| CSX / Destacados | `src/lib/slack/csx*.ts` + cron `csx-semanal.yml` + `npm run csx:semanal` |
| Publicar desde CI | `.github/actions/notify-slack/` |
| CI rojo en `main` | `.github/workflows/ci.yml` (job `notify-slack-main`) |
| Deploy prod OK / KO | `.github/workflows/production-deploy-watch.yml` |
| Ping manual | `.github/workflows/slack-ping.yml` |

Añadir un canal: una fila en `canales.json`, volver a correr el
bootstrap, y —solo si GitHub tiene que escribir ahí— una variable
`SLACK_CHANNEL_*` más un job que la use. No hace falta otra app Slack.
