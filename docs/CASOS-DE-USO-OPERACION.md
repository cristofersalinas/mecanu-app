# Casos de uso — operar Mecanu (fundador)

Para actuar, no solo leer. Cada caso: **qué ves → dónde → qué haces**.

Formato del vocabulario: **`término técnico`** = qué significa en cristiano.

Links rápidos:

| Herramienta | Para qué | Link |
|---|---|---|
| Sentry Issues | Errores de la app | https://mecanu.sentry.io/issues/ |
| Vercel Logs | Sondeos / seguridad | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/logs |
| Firewall | Bots / IPs | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/firewall |
| Usage | Cuota del mes | https://vercel.com/cristofersalar-4089s-projects/usage |
| Variables | Secretos / DSN / WhatsApp | https://vercel.com/cristofersalar-4089s-projects/mecanu-app/settings/environment-variables |
| Web | Probar como cliente | https://mecanu.com |
| Correo privacidad | Derechos RGPD | `privacidad@mecanu.com` |

---

## Vocabulario base (léelo una vez)

| Técnico | En cristiano |
|---|---|
| **`Issue`** (Sentry) | Un tipo de error repetible; “esta cosa se rompe” |
| **`DSN`** | Dirección secreta a la que la app manda errores a Sentry |
| **`Deploy` / `Redeploy`** | Publicar (o volver a publicar) la web en Vercel |
| **`Production`** | Lo que ve la gente en mecanu.com |
| **`Preview`** | Copia de prueba de una rama (no es la web oficial) |
| **`Env var` / variable de entorno** | Ajuste secreto o config sin tocar código |
| **`WAF` / Firewall** | Filtro delante de la web que reta o bloquea bots |
| **`Challenge`** | Captcha / prueba “¿eres humano?” |
| **`Deny` / `403`** | Puerta cerrada; no pasa |
| **`Rate limit`** | Tope de peticiones por minuto desde la misma IP |
| **`Bot Protection` / Attack Mode** | Modo “hay mucho bot”: más retos a tráfico sospechoso |
| **`Honeypot` / señuelo** | Ruta falsa (`/wp-admin`, `/.env`) para pillar escáneres |
| **`IP block`** | Bloquear una dirección concreta a mano |
| **`Cuota` / Usage** | Límite mensual gratis de Vercel (visitas, CPU…) |
| **`Lead`** | Alguien que rellenó el formulario (taller o ITV) |
| **`RGPD` / GDPR** | Ley europea de datos personales |
| **`Stack trace`** | Lista de “en qué línea del código petó” |

---

## A. Sentry — la app se rompe

### A1. Sale un Issue nuevo en Sentry

- **Qué es:** un **`error`** = fallo no controlado (pantalla en blanco, botón que no responde, 500).
- **Dónde:** [Issues](https://mecanu.sentry.io/issues/)
- **Actúas así:**
  1. Abre el Issue → mira **`url`** (página) y **`stack trace`** (dónde en el código).
  2. Si es un visitante real en `/` o `/contacto`: priorízalo.
  3. Si es un bot golpeando basura: puedes **`resolve`** (dar por cerrado) o ignorar.
  4. Pásame el título del Issue o captura → lo arreglamos en código.

### A2. Issues está vacío

- **Normal.** Significa: no hay errores capturados (o aún nadie disparó ninguno).
- **No hagas nada.** No inventes la página de ejemplo de Sentry.

### A3. Email de Sentry “high priority”

- **Qué es:** alerta de **`high priority issue`** = error gordo o que se repite mucho.
- **Actúas:** abre el link del mail → mismo flujo que A1.

---

## B. Seguridad — alguien hurga

### B1. En Logs aparece `mecanu.security`

- **Qué es:** nuestro registro de abuso (no es un crash de la web).
- **Dónde:** [Logs](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/logs) → busca `mecanu.security`
- **También Slack:** si el tipo es P0 (`canary_used`, `sondeo_sistematico`, `assistant_injection`) → mensaje en **`#alertas`** (máx. 1 por IP+tipo cada 15 min). Honeypots sueltos **no** van a Slack.
- **Campos útiles:**
  - **`tipo`** = clase de abuso  
  - **`ip`** = de dónde viene  
  - **`ruta`** = qué URL golpeó  
  - **`geo`** = país/ciudad aproximados del hosting (no GPS)

### B2. Tipos y qué hacer

| `tipo` (técnico) | En cristiano | ¿Actúas? |
|---|---|---|
| `honeypot_hit` | Tocaron un señuelo (`/wp-admin`, etc.) | Casi nunca. Ruido normal de internet. |
| `fake_login` | Intentaron login falso | Igual: ruido. Si es el mismo IP cientos de veces → B3. |
| `canary_used` | Usaron una “credencial trampa” del `.env` falso | **Sí, mira.** Alguien se creyó el señuelo. Anota IP. |
| `sondeo_sistematico` | Escaneo sistemático de muchas rutas | **Sí.** Valora **IP block** (B3). |
| `assistant_injection` | Intentaron inyectar prompts al `/assistant` | **Sí, mira.** El asistente no tiene IA real; igual es sondeo. |
| `assistant_prompt` | Escribieron al asistente señuelo | Bajo. |
| `rate_limited` | Les cortamos por pasarse de peticiones | Informativo; el sistema ya actuó. |

**Sentry también** puede recibir los tres graves (`canary_used`, `assistant_injection`, `sondeo_sistematico`) si el DSN está bien.

### B3. Bloquear una IP

- **Cuándo:** misma IP martillea señuelos o te come cuota.
- **Dónde:** [Firewall → IP Blocking](https://vercel.com/cristofersalar-4089s-projects/mecanu-app/firewall) (Hobby: **3** bloqueos).
- **Qué haces:** Add → pega la `ip` del log → **Deny** (no Challenge).
- **`Deny`** = fuera del todo. **`Challenge`** = captcha (para un atacante no sirve).

### B4. Un humano ve captcha en mecanu.com

- **Qué es:** **`Bot Protection` / Challenge`**, no un bug.
- **Actúas:** si te pasa a ti de vez en cuando, OK. Si a todos los clientes les pide captcha siempre y se quejan: bajar Attack Mode cuando el pico de bots pase (Firewall).

---

## C. Negocio — leads y privacidad

### C1. Alguien pide “hablar con Mecanu” (`/contacto`)

- **Lead** = ficha de interés.
- Hoy: formulario → API → Sheet / email / Slack (si está cableado).
- **Actúas:** responde en &lt;24 h (lo promete el copy). Si no llega el aviso: revisa Slack canales LEADS o el mail `cris@` / Resend.

### C2. Alguien pide ITV a domicilio

- Formulario → WhatsApp (`wa.me`) **si** existe `NEXT_PUBLIC_ITV_WHATSAPP`.
- Si falta la variable: el usuario ve error “WhatsApp no configurado”.
- **Actúas (pendiente):** Variables → `NEXT_PUBLIC_ITV_WHATSAPP=346…` → Redeploy.

### C3. Mail a `privacidad@mecanu.com`

- **Derechos RGPD** = alguien pide ver/borrar/oponerse a sus datos.
- **Actúas:** responde (no ignores). Datos típicos: leads del formulario, cookies si aceptó analítica. Plazo razonable (días, no meses). Si no sabes el alcance, pregúntame y miramos qué guardamos.

### C4. Banner de cookies

- **Consent** = permiso para analítica (GA / Clarity).
- Rechazar = web igual; no cargas tracking.
- **Actúas:** casi nunca. Si alguien se queja, apunta a `/cookies` y `/privacidad`.

---

## D. Cuota y dinero de infraestructura

### D1. Usage al 50 % / 80 %

- **Cuota Hobby** = límite mensual de Vercel.
- **Actúas:** mira [Usage](https://vercel.com/cristofersalar-4089s-projects/usage). Si sube por bots: Firewall / Attack Mode (ya ON) + IP block. Pon alertas si aún no (pendiente en la lista).

### D2. Spend Management

- Tope de gasto extra (ideal **0 $** en Hobby).
- En Hobby el riesgo real es **quedarte sin servicio el resto del mes**, no la tarjeta.

---

## E. Lo que NO es un caso de uso tuyo aún

| Cosa | Por qué no actúas ahora |
|---|---|
| Aplicar migración `0005_security_events` | A propósito aparcada hasta `mecanu-dev` + auth |
| Abrir `/panel` en internet | Cortado a propósito (`proxy`). Solo local / preview con flag |
| Facturar talleres UE | Aparcado → `docs/FACTURACION-CHILE.md` cuando digas |
| Sentry → Slack | Opcional; seguridad P0 ya va a `#alertas` por código |

---

## Cheatsheet: “veo X → hago Y”

| Ves esto | Haces esto |
|---|---|
| Mensaje en `#alertas` con `[P0 · CRITICA]` | Leer → Deny IP en Firewall si dice qué hacer |
| Issue rojo en Sentry | Abrir → URL + stack → pasármelo |
| Log `canary_used` / `sondeo_sistematico` (sin Slack) | Comprobar que `SLACK_CHANNEL_ALERTAS` está en Vercel |
| Captcha en la home | Normal con Bot Protection |
| Lead de taller | Contestar comercialmente |
| Mail a privacidad@ | Responder derechos RGPD |
| Usage disparado | Usage + Firewall + IPs |
| Formulario ITV sin WhatsApp | Poner env `NEXT_PUBLIC_ITV_WHATSAPP` |

Más detalle técnico de sensores: `docs/SLACK-SEGURIDAD.md` · Runbook: `SEGURIDAD-RUNBOOK.md` · Pendientes: `TAREAS-MAÑANA.md`.
