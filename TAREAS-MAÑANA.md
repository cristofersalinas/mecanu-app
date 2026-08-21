# Lo que queda — una sola lista

Nada de esto es decorativo. **Sentry, WhatsApp, giro SII, auth y el resto
cuentan.** Si un enlace pide login, entra con Vercel y ábrelo otra vez.

Proyecto: [cristofersalar-4089s-projects / mecanu-app](https://vercel.com/cristofersalar-4089s-projects/mecanu-app)

**Casos de uso para actuar (vocabulario técnico + en cristiano):**  
[`docs/CASOS-DE-USO-OPERACION.md`](docs/CASOS-DE-USO-OPERACION.md)

| Sitio | Link |
|---|---|
| Proyecto | https://vercel.com/cristofersalar-4089s-projects/mecanu-app |
| Firewall | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/firewall |
| SSO / Deployment Protection | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/settings/deployment-protection |
| Variables | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/settings/environment-variables |
| Deployments | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/deployments |
| Usage | https://vercel.com/cristofersalar-4089s-projects/usage |
| Billing / spend | https://vercel.com/dashboard/billing |
| Logs (`mecanu.security`) | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/logs |
| Web | https://mecanu.com |
| Slack ping (Actions) | https://github.com/cristofersalinas/mecanu-app/actions/workflows/slack-ping.yml |
| PR #20 (mergeado) | https://github.com/cristofersalinas/mecanu-app/pull/20 |

**Orden de lanzamiento (ya cumplido):** Slack A0 → Firewall 1 → Attack Mode / Bot Protection 2 → quitar SSO.

---

## Hecho — corroborado 21 ago (16:50 CEST)

Esto es lo que pediste que cruzara. No lo doy por hecho de oídas: lo comprobé
en Vercel CLI, `curl` a mecanu.com y GitHub.

| Objetivo | Estado | Cómo se ve |
|---|---|---|
| Landing pública (mecanu.com) | **Hecho** | Alias `mecanu.com` en Production Ready (`dpl_HY1VEP72…`, 16:22). Curl desde datacenter recibe **429 + challenge** de Vercel (Bot Protection), no login SSO. En el navegador (incógnito) deberías pasar el captcha y ver la home. |
| Firewall: 3 reglas + Bot Protection | **Hecho** | Las 3 reglas están **live / Enabled**. `/wp-admin` y `/.env` → **403 deny**. GET a `/`, `/panel`, `/assistant` → **429 challenge**. |
| `/panel` no enseña el mock a internet | **Hecho (código, no SSO)** | `src/proxy.ts`: con `VERCEL=1` y sin `MECANU_EXPONER_APPS` corta panel / conductor / backoffice / API (excepto contacto e ITV). `MECANU_EXPONER_APPS` **no** está en env de Production. El WAF reta antes; el proxy es la red de seguridad. |
| Slack / leads | **Hecho (infra)** | `SLACK_BOT_TOKEN` + canales LEADS / OPORTUNIDADES / CSX en Vercel Production. Secret en GitHub. Canales creados. Slack ping en `main` **verde** (run `32484830990`). Un lead de prueba en el navegador (después del captcha) es la prueba humana que curl no puede hacer. |

Las tres reglas, tal cual están publicadas:

1. **Challenge POST except `/api/v1/contacto` y `/api/v1/itv-leads`** — Challenge, Enabled  
2. **Deny scrapers WP** (`/wp-admin`, `/.env`, `/wp-login`) — Deny, Enabled — **403 confirmado**  
3. **Rate limit `/assistant`** — 8/60s por IP, Enabled  

Bot Protection / Attack Mode: ON. Eso es el 429 de curl. Un visitante real puede ver captcha: es esto, no un bug. Las peticiones desafiadas no cuentan para la cuota.

**Sentry DSN** también está ya en Production y Preview (`SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN`, desde hace 3 días). Lo marco hecho abajo.

---

## A0. Slack — HECHO

Token en Vercel Production, canales, secret de GitHub, ping verde.  
`.env.local` en el Mac (gitignored). No vuelvas a pegar el `xoxb-…` en el chat.

### 4. Dos respuestas para mí (chat) — sigue abierto

| Decisión | Default si no eliges |
|---|---|
| **T3** — horas tras oferta aceptada sin ruta | **4 h laborables** |
| **`#senales`** — ¿crear ya vacío? | **No**: solo cuando haya cron/backend; P0/P1 → `#alertas` |

Yo en código: ~~P0 seguridad → Slack + dedupe~~ **hecho** (`src/lib/slack/seguridad.ts`). Pendiente: `surface_probe`. Docs: [SLACK-SEGURIDAD.md](docs/SLACK-SEGURIDAD.md) §7.

---

## A. Tú, ahora (Vercel + correo)

### 1. Tres reglas del firewall — HECHO

[Firewall](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/firewall). Hobby solo tiene **3**. Publicadas, no en borrador.

No gastes una regla en `/panel`: el proxy ya la cierra. Hobby también tiene **3 bloqueos de IP** en caliente (Firewall → IP Blocking).

### 2. Attack Mode / Bot Protection, luego quitar el SSO — HECHO

Misma pantalla: Bot Management → **Attack Mode / Bot Protection → On**.  
Curl no ve SSO (`vercel.com/sso`); ve challenge de Vercel. Eso encaja con SSO **Off** en Production.

Incógnito (tú): [mecanu.com](https://mecanu.com) carga tras el captcha. [mecanu.com/panel](https://mecanu.com/panel) **no** enseña el mock (404 / corte del proxy, no el kanban).

Apágalo cuando el pico de gente real haya pasado y los logs se vean humanos. Docs: [Attack Mode](https://vercel.com/docs/vercel-firewall/attack-mode).

### 3. Alertas de uso + tope de gasto — PENDIENTE

| Qué | Dónde |
|---|---|
| Uso del equipo | [Usage](https://vercel.com/cristofersalar-4089s-projects/usage) |
| Avisos 50 % y 80 % | Usage → Notifications / alertas, o notificaciones de la cuenta |
| Tope 0 $ extra | [Billing → Spend Management](https://vercel.com/dashboard/billing) (o team → Settings → Billing) |

En Hobby el riesgo no es la tarjeta: es quedarte sin cuota el resto del mes. Docs: [Spend Management](https://vercel.com/docs/limits/spend-management).

### 4. Sentry (DSN) — HECHO

Está en [Variables](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/settings/environment-variables) Production y Preview: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` (y org/project/auth token). El SDK puede salir a la red.

### 5. Correo `privacidad@mecanu.com` — HECHO

Buzón / alias activo. La web ya lo cita en `/privacidad`. Seguir mirando ese inbox cuando lleguen derechos RGPD.
### 6. WhatsApp ITV — PENDIENTE

No está en las variables de Vercel (lo busqué por nombre).  
[Variables](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/settings/environment-variables) Production:  
`NEXT_PUBLIC_ITV_WHATSAPP` = `346XXXXXXXX` (solo dígitos, con 34) → Redeploy.

### 7. Comprobar el PR y el panel en local — PENDIENTE (tú)

- PR: https://github.com/cristofersalinas/mecanu-app/pull/20 — **mergeado** 21 ago 15:02.  
  Tablero de Tareas (Pendiente → En curso → Hecho / Cancelado), cabeceras sticky, subestados cortos, backoffice, legales, Slack.
- En tu Mac: `npm run demo` → `/panel` (Tareas) y `/conductor` (En camino / En origen / En tránsito / En destino).

### 8. Logs de sondeo — PENDIENTE (tú, de vez en cuando)

[Logs](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/logs) → busca `mecanu.security`.  
Campos: `ip`, `geo`, `ruta`, `tipo`. Tipos: `honeypot_hit`, `fake_login`, `canary_used`, `assistant_prompt`, `assistant_injection`, `sondeo_sistematico`, `rate_limited`. Runbook: `SEGURIDAD-RUNBOOK.md`.

---

## B. Tú, no es un click en Vercel (sigue contando)

### 9. Giro SII + IVA de servicios al exterior

Cuando factures a talleres UE. Contexto: [docs/FACTURACION-CHILE.md](docs/FACTURACION-CHILE.md).  
No implementar cobro en producto hasta que traigas cómo quieres cobrar (SpA, impuestos, checklist).

### 10. Auth — tres decisiones, luego lo abro yo

Hoy no hay login. `/panel` y `/conductor` en internet siguen cortados a propósito.

1. Un taller = un tenant, o varios en la misma instancia.
2. Cómo entra el conductor al móvil (magic link, código, app).
3. Qué ve un conductor de red vs uno interno (eso va a RLS, no al cliente).

Hasta entonces: **no** pongas `MECANU_EXPONER_APPS=1` en Production.

### 11. No aplicar `0005_security_events.sql`

Hasta el bloque 1 de acceso en **mecanu-dev**. La tabla es para un panel futuro. Hoy: logs de Vercel + Sentry.

### 12. Subdominios / partir el repo

Aparcado a propósito (ago 2026): un repo, un deploy.  
Más adelante: `panel.mecanu…` sobre el mismo deploy (barato). Monorepo real solo si hay deploys independientes de verdad.

### 13. Revisión legal / DPO

Páginas ya publicadas (aviso, privacidad, cookies, términos, accesibilidad; titular SpA RUT 77.620.433-1).  
Buzón `privacidad@mecanu.com` **activo**. Sigue: revisar textos con asesoría si sube el volumen de leads; DPO no es obligatorio hoy. `docs/CUMPLIMIENTO-UE.md`.

---

## C. Yo (código) — estado

| Qué | Estado |
|---|---|
| Corte de panel/conductor/API en Vercel | Hecho (`proxy.ts`; contacto e ITV públicos) |
| Pipeline Tareas de avance, sticky, subestados cortos | Hecho, mergeado en #20 |
| Copy conductor = panel (En origen / En destino) | Hecho |
| Páginas legales + identidad SpA | Hecho |
| Backoffice mock, onboarding, Slack bot | Hecho, mergeado en #20 |
| Auth (login, sesión, RLS) | Pendiente de las 3 decisiones del §10 |
| `crearRutaDesdeCampana` de verdad | Pendiente (el mock lanza error) |
| Migrar `data.ts` al `repo` | Pendiente (~30 pantallas) |
| Cola offline del conductor en IndexedDB | Pendiente (hoy se pierde al recargar) |
| WhatsApp Cloud API de verdad | Pendiente (hoy es simulación; el número ITV es el §6) |
| Fotos/vídeo/firmas en Storage | Pendiente |
| Idempotencia en Postgres | Pendiente (`Map` en memoria) |
| P0 seguridad → Slack + dedupe (T3 / `#senales`) | Pendiente de tus 2 respuestas A0.4 |

---

## D. Notas de la noche del 19 ago (capa de seguridad)

Rama de entonces: `feature/capa-seguridad`. Auditoría gitleaks: 0 secretos.  
CSP, HSTS, honeypots, rate limit, corte fail-closed: en código. Detalle: `SEGURIDAD-AUDITORIA.md`.

Si al abrir un link no ves el menú, dime qué pantalla te sale.
