# Señales de abuso / sondeo — inventario profundo

Cómo te enteras de que alguien está hurgando, escaneando o intentando
explotar Mecanu. No hay contraataque: se registra, se retrasa (tarpit) y,
si hace falta, se bloquea a mano en el firewall de Vercel.

Base legal: interés legítimo de seguridad (RGPD art. 6.1.f). Declarado en
`/privacidad`. Retención objetivo: 90 días (`security_events_purge`).
Hoy la retención real es la de **logs de Vercel** (corta en Hobby) +
Sentry si hay DSN. La tabla `supabase/migrations/0005_security_events.sql`
está escrita y **no aplicada**.

Runbook operativo: [`SEGURIDAD-RUNBOOK.md`](../SEGURIDAD-RUNBOOK.md).
Mapa Slack de producto: [`SLACK-SENALES.md`](./SLACK-SENALES.md).

---

## 1. Dónde vive cada dato hoy

| Destino | Qué guarda | Retención | Quién lo mira |
|---|---|---|---|
| `console.info` JSON con `"src":"mecanu.security"` | Evento completo + `extra` | Logs de Vercel (días, no 90) | Tú en Vercel → Logs |
| Sentry (si hay DSN) | Solo `canary_used`, `assistant_injection`, `sondeo_sistematico` | Según plan Sentry | Alertas inmediatas |
| Tabla `security_events` | Misma forma + `extra` jsonb | 90 días (cuando exista) | Backoffice futuro / SQL |
| Vercel Firewall → Logs | Challenge / Deny a nivel edge | Según Vercel | Antes de que llegue a Next |
| Slack `#alertas` | **P0 cableado:** `canary_used`, `assistant_injection`, `sondeo_sistematico` (dedupe 15 min/IP). P1/P2 no. | — | Actuar ya |

Una línea típica en Vercel Logs:

```json
{
  "src": "mecanu.security",
  "tipo": "sondeo_sistematico",
  "ts": "2026-08-21T10:12:03.441Z",
  "ip": "203.0.113.44",
  "geo": { "pais": "RU", "region": "MOW", "ciudad": "Moscow" },
  "userAgent": "Mozilla/5.0 (compatible; Nmap…)",
  "metodo": "GET",
  "ruta": "/.env",
  "tecnica": null,
  "resumen": "/.env",
  "extra": { "bodyPreview": "" }
}
```

### Campos canónicos de todo evento (`EventoSeguridad`)

| Campo | Origen | Qué te dice |
|---|---|---|
| `tipo` | Clasificador | Qué clase de abuso es |
| `ts` | Reloj del edge | Cuándo |
| `ip` | `x-forwarded-for` (primera) o `x-real-ip` | Quién (según Vercel; no DNS inverso) |
| `geo.pais` | `x-vercel-ip-country` | País ISO |
| `geo.region` | `x-vercel-ip-country-region` | Región / comunidad |
| `geo.ciudad` | `x-vercel-ip-city` | Ciudad aproximada del hosting |
| `userAgent` | `User-Agent` | Navegador, scraper, vacío, curl |
| `metodo` | HTTP | GET vs POST (POST a login = más grave) |
| `ruta` | pathname | Qué señuelo o superficie |
| `tecnica` | Solo asistente | Tipo de inyección LLM |
| `resumen` | Texto corto | Para listados / Sentry |
| `extra.*` | Según el tipo | Evidencia (prompt, credenciales intentadas, preview del body) |

**Qué no se captura a propósito:** cookies de sesión reales (no hay),
fingerprinting de dispositivo, GPS del navegador, WHOIS, ni llamadas a
servicios de reputación de IP. La geo es solo la que Vercel ya adjunta.

---

## 2. Sensores (puntos de información), uno a uno

### S1 — Honeypots de ruta (`honeypot_hit`)

**Dónde:** `defenderPeticion` → `esHoneypot(pathname)`.
**Rutas señuelo** (`RUTAS_HONEYPOT` + prefijos):

| Ruta | Qué finge | Por qué la golpean |
|---|---|---|
| `/wp-admin`, `/wp-admin/*` | Login WordPress | Escáneres WP masivos |
| `/wp-login.php` | Formulario de login | Fuerza bruta de WP |
| `/xmlrpc.php` | XML-RPC WordPress | Amplificación / fuerza bruta |
| `/.env` | Fichero de entorno falso con **canaries** | Robo de secretos |
| `/.git/config` | Config git falsa | Exfiltración de repo |
| `/phpmyadmin`, `/phpmyadmin/*` | Error MySQL | Paneles de BD abandonados |
| `/admin.php`, `/config.php` | JSON “Cannot connect…” | CMS PHP genéricos |
| `/backup.sql` | Dump truncado | Backups públicos |
| `/.aws/credentials` | Credenciales AWS falsas | Robo cloud |
| `/internal/ops` | JSON “ops endpoint” | Enumeración de rutas internas |

**También:** cualquier `pathname` que empiece por `/wp-admin/` o `/phpmyadmin/`.

**Datos registrados en cada hit:**

- Todos los campos canónicos.
- `extra.bodyPreview`: hasta 400 chars del body (si no es GET/HEAD).
- Tarpit: espera creciente por IP, tope 1,5 s (`delayTarpitMs`).
- Rate limit honeypot: 10 req/min/IP/instancia → si se pasa, evento
  `rate_limited` con resumen `"honeypot"`.

**Severidad Slack propuesta:** P2 suelto; **P0** si acumula a S3.

**Qué hacer:** no alarmarse por un hit aislado a `/wp-admin` (ruido
internet). Si es la misma IP + varias rutas → ver S3.

---

### S2 — Login falso (`fake_login`)

**Dónde:** POST a ruta que contiene `wp-login`.
**Qué pasa:** se sirve el mismo HTML siempre; **nunca** se valida contra
nada. Las credenciales intentadas se guardan como evidencia.

**Datos extra:**

- `extra.attempted`: hasta 500 chars del body (user/password que escribieron).

**Severidad:** P1 (alguien está intentando autenticarse, no solo
escaneando).
**Qué hacer:** mirar user/pass (¿reutilizan credenciales reales de otro
sitio?), IP → bloquear si insiste, no “cerrar” una cuenta que no existe.

---

### S3 — Sondeo sistemático (`sondeo_sistematico`)

**Dónde:** `anotarSondeo(ip, ruta)` tras un honeypot hit.
**Regla:** misma IP ha tocado **≥ 3 rutas honeypot distintas** en la
vida del proceso (mapa en memoria).

**Limitación dura:** el mapa es por instancia serverless. Un cold start
borra el contador. Un escáner lento o repartido entre IPs no dispara S3.
Por eso el muro real de flood es el **Firewall de Vercel**, no este
contador.

**Datos:** mismos que S1; el `tipo` pasa a `sondeo_sistematico`.
**Severidad:** **P0** → Slack `#alertas` + Sentry (si DSN).
**Qué hacer:** Firewall → IP Blocking (Deny). Anotar IP en el runbook.
No contraatacar.

---

### S4 — Canary usado (`canary_used`)

**Dónde:** cualquier petición; se mira pathname + query +
`Authorization` + body (hasta 8 KB) buscando tokens inertes.

**Canaries** (no abren nada; están en el `.env` señuelo):

| Nombre | Valor (inertes) | Señuelo en |
|---|---|---|
| `AI_ASSISTANT_KEY` | `mk_live_canary_a7f3e91c` | `/.env` falso + asistente |
| `AI_ASSISTANT_ENDPOINT` | `https://mecanu.com/assistant` | `/.env` falso |
| `BILLING_ACCOUNT` | `ba_4c2e8f01` | `/.env` falso |

**Significado:** alguien **leyó** el señuelo y **reutilizó** la cadena
en una petición posterior (header, query o body). Eso es más grave que
un GET a `/.env`: implica interés y seguimiento.

**Datos:** canónico + `resumen: "canary mk_live_…"`; `extra.ruta`.
**Severidad:** **P0**.
**Qué hacer:** tratar la IP como hostil; Deny en firewall; revisar si
pegó también a `/assistant`.

---

### S5 — Asistente señuelo (`assistant_prompt` / `assistant_injection`)

**Dónde:** `/assistant` y `/assistant/*`. HTML + POST JSON `{ q }` sin
modelo (plantillas). Rate limit 8/min/IP.

**Clasificación de inyección** (`clasificarPrompt`):

| `tecnica` | Patrones (idea) | Qué intenta el atacante |
|---|---|---|
| `system_prompt` | ignore previous, reveal instructions… | Sacarte el system prompt |
| `credenciales` | api key, password, billing.account… | Robar secretos |
| `ejecucion` | shell, eval, rm -rf, curl… | Ejecutar comandos |
| `exfiltracion` | webhook, pastebin, send to… | Sacarte datos fuera |
| `jailbreak` | DAN mode, no restrictions… | Saltar restricciones |
| `ninguna` | resto | Curiosidad o ruido |

**Datos extra:**

- GET: `resumen: "open"` (abrió la UI).
- POST: `extra.prompt` = hasta 2000 chars de lo que escribió.
- Respuesta: guion que **no** entrega claves ni confirma el señuelo.

**Severidad:**

- `assistant_prompt` → P3 (abrió / preguntó normal).
- `assistant_injection` → **P0** (intento claro).

**Qué hacer en P0:** leer el `prompt` completo en logs; Deny IP si
repite; no hace falta “parchear” el asistente (ya es mentira).

---

### S6 — Rate limit honeypot / API (`rate_limited`)

**Hoy se registra como evento solo** cuando el rate limit salta en
**honeypot** (`resumen: "honeypot"`).

**También existe pero NO llama a `registrarEvento` hoy:**

| Superficie | Regla | ¿Log `mecanu.security`? |
|---|---|---|
| Honeypot | 10/min | Sí |
| `/assistant` | 8/min | No (solo 429 JSON) |
| `/api/v1/*` | 60 GET / 20 escritura /min | No (solo 429) |
| Formulario contacto (lib) | 3 / 10 min | No cableado al proxy de eventos |

**Hueco a cerrar:** un flood a `/api/v1/contacto` o al asistente que
dispare 429 debería generar `rate_limited` con IP/geo/ruta para Slack P1
si el volumen es alto.

**Severidad propuesta:** P1 si ≥ N 429 en 5 min desde la misma IP;
P2 suelto.

---

### S7 — Formularios públicos (spam / abuso, no “hack” clásico)

**Rutas:** `POST /api/v1/contacto`, `POST /api/v1/itv-leads`.
**Defensas hoy:** Zod + `aceptaPrivacidad` + Resend/Sheet + (contacto)
rate limit en lib antigua `validarContacto` **no** unificada con las
rutas actuales del form multi-paso.

**Señal de abuso (a añadir):**

- Muchos POST válidos o 422 desde la misma IP en poco tiempo.
- Campo honeypot relleno (si se añade `company_website` al form real).
- Payloads enormes / JSON malformado en bucle.

**Datos a registrar:** IP, geo, UA, ruta, código de rechazo
(`honeypot` | `rate_limited` | `validation`), preview sin PII completa
en Slack (en Slack: ciudad + “payload inválido”; PII completa solo en
log / Sheet si el lead es real).

**Severidad:** P1 si flood; lead legítimo → `#leads`, no seguridad.

---

### S8 — Superficies cortadas (`/panel`, `/conductor`, `/backoffice`, `/api` mock)

En Vercel (`VERCEL=1` sin `MECANU_EXPONER_APPS`): redirect a `/` o 404 JSON.
**Hoy no se registra** un evento cuando alguien pide `/panel` desde
fuera.

**Hueco útil:** loguear `tipo: "surface_probe"` (nuevo) cuando una IP
pide rutas de app protegida en producción. Eso distingue “escáner WP”
de “alguien que conoce Mecanu y busca el panel”.

**Severidad propuesta:** P2 suelto; P1 si la misma IP pide panel +
conductor + api.

---

### S9 — Capas **fuera** del código Next (igual de importantes)

| Fuente | Qué ves | Cómo |
|---|---|---|
| Vercel Firewall Logs | Challenge / Deny antes del proxy | Dashboard → Firewall |
| Attack Mode | Captcha a bots; no cuenta cuota | Activar en lanzamiento |
| IP Blocking (máx. 3 en Hobby) | Deny duro a una IP | Pegar IP del log |
| Vercel Usage / Spend | Pico de invocaciones o transferencia | Alerta 50 % / 80 % |
| Sentry | Errores + 3 tipos security | DSN en env |
| gitleaks / historial git | Secretos en commits | Ya auditado: 0 fugas |

Un ataque de cuota (flood a `/`) puede **no** tocar honeypots: come
invocaciones del layout. Señal: Usage, no `mecanu.security`.

---

## 3. Matriz “tipo → urgencia Slack → acción”

| Tipo | P | Canal | Acción del dueño |
|---|---|---|---|
| `canary_used` | P0 | `#alertas` | Deny IP; revisar si también `/assistant` |
| `sondeo_sistematico` | P0 | `#alertas` | Deny IP; anotar en runbook |
| `assistant_injection` | P0 | `#alertas` | Leer prompt; Deny si insiste |
| `fake_login` | P1 | `#alertas` | Ver credenciales intentadas; Deny si volumen |
| `rate_limited` (honeypot/api flood) | P1 | `#alertas` | Firewall path deny / IP |
| `honeypot_hit` aislado | P2 | digest `#senales` o silencio | Nada si no se acumula |
| `assistant_prompt` | P3 | silencio / digest | Curiosidad |
| Pico Usage Vercel | P0 | `#alertas` (manual o alerta Vercel→Slack) | Attack Mode ON |

---

## 4. Formato Slack de seguridad (cuando se cablee)

```
[P0 · CRITICA]  #seguridad  #sondeo  ·  203.0.113.44
Sondeo sistemático — 5 señuelos en <2 min
IP: 203.0.113.44 · RU / Moscow
UA: python-requests/2.31.0
Rutas: /.env · /wp-admin · /.git/config · /phpmyadmin · /backup.sql
Qué hacer: Vercel Firewall → IP Blocking → Deny. No hace falta rotar secretos (canaries inertes).
```

Si es `canary_used` o `assistant_injection`, el bloque **Evidencia**
lleva el `resumen` / técnica / preview del prompt (recortado), nunca un
secreto real.

Tags: `#seguridad` + uno de `#sondeo` `#canary` `#inyeccion` `#login_falso` `#flood`.

---

## 5. Profundidad de evidencia por fase

| Fase del atacante | Sensor | Evidencia que tienes |
|---|---|---|
| Escaneo masivo de internet | S1 | IP, geo, UA, ruta, método |
| Recorrido de varias rutas | S3 | Conjunto de rutas por IP |
| Descarga de “secretos” | S1 en `/.env` | Hit + body vacío típico |
| Reutilización del señuelo | S4 | Canary en header/query/body |
| Intento de login | S2 | User/pass intentados |
| Interacción con “IA interna” | S5 | Prompt completo + técnica |
| Flood / agotar cuota | S6 + S9 | 429 + Usage + Firewall |
| Buscar panel Mecanu | S8 (hueco) | Path `/panel` etc. (a loguear) |

---

## 6. Huecos conocidos (para no autoengañarse)

1. **`security_events` no aplicada** → no hay 90 días consultables.
2. **Sondeo y rate limit en memoria** → no son muro global entre
   instancias; el firewall sí.
3. **API 429 y asistente 429** no siempre dejan rastro `mecanu.security`.
4. **Probe a `/panel` en prod** no deja evento dedicado.
5. **Formularios reales** aún no unifican honeypot de campo + evento
   security.
7. **Slack seguridad P0** → `#alertas` vía `avisarSeguridadP0Slack` (dedupe 15 min
   por tipo+IP). P1/honeypot suelto siguen en silencio.
8. **Probe a `/panel` en prod** no deja evento dedicado.

---

## 7. Orden de cableado a Slack

1. ~~Publicar a `#alertas` en P0~~ — **hecho** (`src/lib/slack/seguridad.ts`).
2. P1: `fake_login` + `rate_limited` de honeypot (solo si hace falta; hoy silencio a propósito).
3. Registrar también 429 de `/api` y `/assistant` como `rate_limited`.
4. Nuevo tipo `surface_probe` para `/panel|/conductor|/backoffice` en Vercel.
5. Aplicar `0005` en `mecanu-dev` cuando el acceso esté listo.

Requisito env: `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_ALERTAS` en Vercel Production.
Silencia notificaciones push de `#alertas` en el móvil si quieres; el canal
sigue siendo el historial de “actuar ya”.
