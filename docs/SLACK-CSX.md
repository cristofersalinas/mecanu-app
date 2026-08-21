# CSX Slack — Destacados, upsell y llamadas

Canal `#csx`. Relación con el taller (no el funnel de una campaña: eso es
`#oportunidades`).

## Señales

### Upsell (Básico → Pro, o Pro → Flota)

Se dispara si el plan actual tiene siguiente y ocurre alguna de:

| Motivo | Umbral |
|---|---|
| `volumen_autos` | ≥ **7 autos** trasladados en la semana (ida/vuelta/ambos = 1 auto) |
| `campanas_manuales` | ≥ 5 ofertas enviadas a mano |
| `tareas_manuales` | ≥ 8 deberes abiertos automatizables |
| `conversion` | ≥ 35 % enviada → aceptada |
| `flota_llena` | ≥ 80 % conductores activos usados **y** ≥ 7 autos |

Mensaje: taller, sucursal, evidencia, contacto, “qué hacer: ofrecer Pro”.

### Subuso — llamar (semanal)

Si casi no ofrece el servicio: &lt; 2 autos, 0 ofertas enviadas.
Incluye **script de llamada** (“cómo te ha ido…”).

### Destacados (lunes)

Un mensaje con:

1. **Métricas** (autos, ofertas, conversión, conductores, plan…)
2. **Citas** de clientes (texto entrecomillado)
3. **Señal upsell / subuso** si aplica
4. **Accionables CSX** priorizados P0–P2 (qué decir a cada usuario)

## Cómo corre

| Pieza | Dónde |
|---|---|
| Lógica | `src/lib/slack/csx.ts` |
| Snapshot desde mock | `src/lib/slack/csx-desde-repo.ts` |
| Cron lunes | `.github/workflows/csx-semanal.yml` |
| Manual | `npm run csx:semanal` |
| API | `POST /api/v1/csx/slack` |

Env: `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_CSX` (bootstrap + Vercel + GitHub var).

Hasta multi-taller real el snapshot es el taller demo (Talleres Rodríguez,
plan Básico). La taxonomía ya está lista para N talleres.
