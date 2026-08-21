# Tareas de la mañana

## Lo que haces tú (21 ago) — enlaces directos

El código ya corta `/panel`, `/conductor`, `/backoffice` y `/api` en Vercel.
Auth de producto **no** está: no lo actives en producción. Esto es para
**publicar la landing** con defensa, no para abrir el panel.

Hazlo **en este orden**. Attack Mode **antes** de quitar el SSO.

1. **Attack Mode ON**  
   [Firewall → Bot Management → Attack Mode](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/firewall)  
   Enable. Los buscadores conocidos pasan. Un visitante real puede ver captcha: es esto, no un bug.

2. **Tres reglas del firewall** (Hobby solo tiene 3) — misma pantalla, pestaña de reglas:  
   [Firewall de mecanu-app](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/firewall)  
   - Challenge (o Deny) a **POST** a cualquier ruta.  
   - Deny o rate-limit a `/wp-admin`, `/.env`, `/wp-login.php`.  
   - Rate limit por IP en `/assistant` (tope duro; en código ya hay 8/min).  
   Publica las reglas si Vercel las deja en borrador.

3. **Alertas de uso 50 % y 80 %**  
   [Usage](https://vercel.com/cristofersalar-4089s-projects/usage) → Notifications / Usage alerts.

4. **Tope de gasto**  
   [Billing → Spend Management](https://vercel.com/dashboard/billing)  
   En Hobby el riesgo no es la tarjeta: es quedarte sin cuota el resto del mes. Tope extra a 0 $ si te deja.

5. **Quitar el SSO** (cuando Attack Mode ya esté ON)  
   [Deployment Protection](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/settings/deployment-protection)  
   Standard Protection / Vercel Authentication → Off en **Production**.  
   Comprueba en una ventana de incógnito: [mecanu.com](https://mecanu.com) carga sin login de Vercel, y [mecanu.com/panel](https://mecanu.com/panel) no enseña el mock.

6. **DSN de Sentry** (opcional, avisos al momento)  
   [Crear proyecto / copiar DSN](https://sentry.io/) → Settings → Projects → Client Keys (DSN).  
   Pégalo en [Variables de entorno de Vercel](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/settings/environment-variables) como `SENTRY_DSN` y `NEXT_PUBLIC_SENTRY_DSN` (Production). Redeploy.

7. **Buzón `privacidad@mecanu.com`**  
   Si el correo es Google Workspace: [Admin → Usuarios](https://admin.google.com/ac/users) → crear o alias hacia el que leas.  
   Si es el dominio en otro sitio: panel DNS / correo del registrador. La web ya lo cita en privacidad.

8. **No hagas**  
   - No apliques `supabase/migrations/0005_security_events.sql` hasta el bloque de acceso en **mecanu-dev**.  
   - No pongas `MECANU_EXPONER_APPS=1` en Production.  
   - Auth del panel/conductor: cuando quieras, dime las 3 decisiones (un taller = un tenant; cómo entra el conductor; red vs interno) y lo abro yo.

Logs de sondeo: [Vercel Logs](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/logs) busca `mecanu.security`.

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

## Qué necesito de ti (histórico 19 ago — sustituido por la lista de arriba)

1. **Firewall de Vercel (3 reglas)** — ver lista del 21 ago.
2. **Attack Mode ON** antes de quitar el SSO y hacer la web pública.
3. **Alertas de uso** al 50 % y 80 % + spend cap. Runbook.
4. **DSN de Sentry** si quieres las alertas inmediatas. Sin DSN el SDK no sale a la red.
5. **Texto legal** — páginas + `docs/CUMPLIMIENTO-UE.md` + identidad SpA chilena
   en código. Queda: buzón `privacidad@mecanu.com` y revisión contable IVA/giro.
6. **No aplicar** `0005_security_events.sql` hasta el bloque 1 de acceso en `mecanu-dev`.
7. El botón de WhatsApp está en `feature/landing-whatsapp`, no en esta rama.

## Procesos Node colgados

Había un `next-server` del 10 de julio en el puerto 3000, de **otro** proyecto (`auto-job-app-crm`). Se mató.

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:3001 -sTCP:LISTEN
ps -p PID -o command
kill PID
```
