# Lo que haces tú — una sola lista

Proyecto Vercel: [cristofersalar-4089s-projects / mecanu-app](https://vercel.com/cristofersalar-4089s-projects/mecanu-app).  
Si un enlace pide login, entra con Vercel y ábrelo otra vez.

El código ya corta `/panel`, `/conductor`, `/backoffice` y `/api` en Vercel
(excepto los POST públicos de contacto e ITV). Auth de producto **no** está:
esto es para **publicar la landing**, no para abrir el panel.

**Orden:** Firewall + Attack Mode **antes** de quitar el SSO.

| Sitio | Link |
|---|---|
| Proyecto | https://vercel.com/cristofersalar-4089s-projects/mecanu-app |
| Firewall | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/firewall |
| SSO / Deployment Protection | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/settings/deployment-protection |
| Variables | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/settings/environment-variables |
| Deployments | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/deployments |
| Usage | https://vercel.com/cristofersalar-4089s-projects/usage |
| Billing / spend | https://vercel.com/dashboard/billing |
| Logs (busca `mecanu.security`) | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/logs |
| Web | https://mecanu.com |

---

### 1. Tres reglas del firewall

Abre [Firewall](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/firewall) → Configure / Add rule (Custom rules). Hobby solo tiene **3**. Docs: [Custom rules](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules). Publica si quedan en borrador.

| # | Qué poner | Notas |
|---|---|---|
| 1 | Challenge (o Deny) a **POST**, **excepto** `/api/v1/contacto` y `/api/v1/itv-leads` | Si challengeas todos los POST, rompes los formularios |
| 2 | Deny o rate-limit a `/wp-admin`, `/.env`, `/wp-login.php` | Flood de bots. Señuelos quieren hits lentos, no 100 req/s |
| 3 | Rate limit por IP en `/assistant` (~8/min) | Señuelo con lógica; en código ya hay 8/min |

No gastes una regla en `/panel`: el proxy ya la cierra.

### 2. Attack Mode, luego quitar el SSO

Misma pantalla: [Firewall](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/firewall) → Bot Management → **Attack Mode → On**.  
Docs: [Attack Mode](https://vercel.com/docs/vercel-firewall/attack-mode). Buscadores conocidos pasan. Un visitante real puede ver captcha: es esto, no un bug.

Cuando Attack Mode esté ON, quita el SSO:

[Deployment Protection](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/settings/deployment-protection)  
Standard Protection / Vercel Authentication → **Off en Production** (previews pueden seguir con SSO).  
Docs: [Deployment Protection](https://vercel.com/docs/deployment-protection).

Incógnito: [mecanu.com](https://mecanu.com) carga sin login de Vercel. [mecanu.com/panel](https://mecanu.com/panel) **no** enseña el mock.

### 3. Alertas de uso + tope de gasto

| Qué | Dónde |
|---|---|
| Uso del equipo | [Usage](https://vercel.com/cristofersalar-4089s-projects/usage) |
| Avisos 50 % y 80 % | Usage → Notifications / alertas, o notificaciones de la cuenta |
| Tope 0 $ extra | [Billing → Spend Management](https://vercel.com/dashboard/billing) (o team → Settings → Billing) |

En Hobby el riesgo no es la tarjeta: es quedarte sin cuota el resto del mes. Docs: [Spend Management](https://vercel.com/docs/limits/spend-management).

### 4. Sentry (opcional)

1. [sentry.io](https://sentry.io/) → proyecto Next.js (si no hay org, créala).  
2. Settings → Client Keys (DSN). Ruta típica: `https://sentry.io/settings/<org>/projects/<proyecto>/keys/`
3. Pega el mismo DSN en [Variables](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/settings/environment-variables) (Production **y** Preview):
   - `SENTRY_DSN`
   - `NEXT_PUBLIC_SENTRY_DSN`
4. [Deployments](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/deployments) → menú del último Production → Redeploy.

Sin DSN el SDK no sale a la red.

### 5. Correo `privacidad@mecanu.com`

Resend ([Domains](https://resend.com/domains)) sirve para **enviar** (`formulario@mecanu.com`). El buzón de **recibir** es Google Workspace o el DNS del dominio.

- Google Workspace: [Admin → Usuarios](https://admin.google.com/ac/users) → usuario o alias `privacidad@` → el correo que leas (p. ej. cris@).
- Otro DNS (Cloudflare, registrador): crea el buzón o la redirección ahí.
- Prueba mandándote un mail a `privacidad@mecanu.com`.

Giro SII + IVA exportación: no es un click en Vercel. Cuando factures, [docs/FACTURACION-CHILE.md](docs/FACTURACION-CHILE.md).

### 6. WhatsApp ITV (opcional)

[Variables](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/settings/environment-variables) Production:  
`NEXT_PUBLIC_ITV_WHATSAPP` = `346XXXXXXXX` (solo dígitos, con 34) → Redeploy.

### 7. No hagas esto

- **No** apliques `supabase/migrations/0005_security_events.sql` hasta el bloque de acceso en **mecanu-dev**.
- **No** pongas `MECANU_EXPONER_APPS=1` en Production.
- Auth del panel/conductor: cuando quieras, tres respuestas (un taller = un tenant; cómo entra el conductor; red vs interno) y lo abro yo.

Si al abrir un link no ves el menú, dime qué pantalla te sale.

---

# Notas del 19 de agosto de 2026 (capa de seguridad)

Rama de entonces: `feature/capa-seguridad`.

## Auditoría (bloque 1)


gitleaks 8.30.1 sobre los 31 commits del remoto: **0 secretos**. No hay `.env` en git. `service_role` solo aparece vacía en `.env.example`. **Nada que rotar por fuga en este historial.**

Hoy producción y previews están detrás del SSO de Vercel: desde fuera no se ve ni la landing. El hueco real era de código: el corte de `/panel` `/conductor` `/api` solo actuaba en `VERCEL_ENV=production`. Un preview, el día que apagues el SSO, serviría el mock. Eso ya está cerrado (`VERCEL=1`).

Detalle en `SEGURIDAD-AUDITORIA.md`.

## Qué se desplegó (si el PR a main está mergeado)

Defensa pasiva: CSP (GTM, GA4, Clarity, mapa, Vercel Analytics allowlisted; ningún puerto de localhost), HSTS, frame deny, nosniff, sin `X-Powered-By`, 429 en `/api` con Retry-After.

Señuelos en `/wp-admin`, `/wp-login.php`, `/.env`, `/.git/config`, etc. Login falso. Tarpit ≤ 1,5 s. Canaries inertes. Asistente interno en `/assistant` **sin modelo**. Corte de panel/conductor/api en **todo** Vercel.

No se aplicó ninguna migración SQL. No se tocó RLS.

**No está en este despliegue** el banner de cookies ni GTM (siguen en el PR #5). La CSP está escrita para no romperlos cuando aterrizen. Hay que volver a pasar `scripts/verificar-seguridad.mjs` el día que se mergee el #5.

## Dónde se guardan los eventos

Hasta aplicar `supabase/migrations/0005_security_events.sql` (no aplicada):

1. Logs de Vercel, líneas JSON con `"src":"mecanu.security"`.
2. Sentry (si pones el DSN) para `canary_used`, `assistant_injection`, `sondeo_sistematico`.

La tabla `security_events` es la forma del futuro panel. RLS on, anon no lee. Purga a 90 días vía `security_events_purge()`.

## Cómo ves quién te está sondeando

Vercel → Logs → busca `mecanu.security`. Campos `ip`, `geo`, `ruta`, `tipo`. Runbook: `SEGURIDAD-RUNBOOK.md`.

## Condición de bloqueo — resultado

| Comprobación | Resultado |
|---|---|
| CSP no rompe la landing; allowlista GTM/Clarity/VA; cero `localhost:puerto` | OK en local (`next start` :4022) |
| Banner/GTM/Clarity **cargando de verdad** | No comprobable aquí: no están en `main`. Allowlista sí. Re-verificar al mergear PR #5 |
| Honeypots señuelo, sin secretos reales; asistente no cede | OK |
| 25 GET a `/` sin 429 | OK |
| Con `VERCEL=1`, `/panel` y `/conductor` → 307 a `/`; `/api` → 404 | OK (simula preview y prod) |

Se despliega. El único asterisco es el banner de anoche, que no está en esta rama.

## Procesos Node colgados

Había un `next-server` del 10 de julio en el puerto 3000, de **otro** proyecto (`auto-job-app-crm`). Se mató.

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:3001 -sTCP:LISTEN
ps -p PID -o command
kill PID
```
