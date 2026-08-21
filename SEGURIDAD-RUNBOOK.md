# Runbook de seguridad — Mecanu en Vercel Hobby

Para el fundador, en un lanzamiento. Nada de esto contraataca: solo se cierra, se retrasa o se mira.

## Cómo se sirve cada ruta pública (coste)

| Ruta | Qué pasa en cada visita | Cuota que come |
|---|---|---|
| `/`, `/ca`, `/en`, `/pt` | Layout lee una cabecera para poner el `lang` del HTML, así que **no es estática pura**. El HTML de la página sí se puede cachear en el CDN de Vercel después de la primera. El mapa y las fotos salen de `/landing/*` y `/maplibre/*` con caché larga. | Invocación de función en el documento (layout). Fotos: transferencia, no invocación. |
| `/landing/*`, `/icons/*`, `/maplibre/*` | Estático, `Cache-Control` 1 año. | Solo transferencia. |
| `/_next/static/*` | Estático (Next). | Transferencia. |
| `/panel`, `/conductor`, `/api/*` en Vercel | 404/redirect en el proxy. El mock **no se ejecuta**. | Invocación edge del proxy, barata. |
| Señuelos (`/wp-admin`, `/.env`, `/assistant`, …) | Proxy + posible espera de hasta 1,5 s. | Edge + tiempo de CPU. Superficie de riesgo. Rate limit 10/min. |
| `/assistant` POST | Función. Respuestas de plantilla, sin modelo. | Edge. Rate limit 8/min. |

**Objetivo de un flood contra la home:** que Vercel sirva el HTML cacheado. El layout dinámico es el hueco que queda: se documenta aquí y no se cambia esta noche porque quitar `headers()` pondría `lang=es` también en `/en` y rompería el SEO multiidioma.

Sentry traza al 5 % (antes 100 %). Sin DSN configurado, no sale nada.

## Las 3 reglas del firewall (Hobby)

En Vercel → Project → Firewall. Solo hay 3. Prioridad:

1. **Challenge (o Deny si ya duele) a POST hacia cualquier ruta.** La landing no tiene formulario; un POST masivo solo pega a señuelos o a la API, que en Vercel ni se sirve. Máximo impacto, mínimo daño colateral.
2. **Deny o rate-limit a paths de señuelo** si el Attack Challenge no basta: `/wp-admin`, `/.env`, `/wp-login.php`. Un escáner que los recorre en bucle es puro gasto. Los señuelos *quieren* hits lentos de humanos; un bot a 100 req/s no aporta y sí agota cuota — bloquea el flood, no el golpe suelto.
3. **Rate limit por IP en `/assistant`.** Es la única ruta de señuelo que ejecuta lógica de verdad. 8/min en código; la regla 3 del firewall es el tope duro.

No gastes una regla en `/panel`: el proxy ya la cierra en Vercel.

## Attack Mode (gratis en todos los planes)

1. Vercel dashboard → el proyecto `mecanu-app` → **Firewall**.
2. **Attack Challenge Mode** / Attack Mode → On.
3. Las peticiones desafiadas **no cuentan** para la cuota. Los buscadores conocidos pasan.
4. Para un lanzamiento: actívalo **antes** de quitar el SSO, no después de que ya duela.
5. Apágalo cuando el pico de gente real haya pasado y los logs se vean humanos.

Si un visitante real ve un captcha, es Attack Mode, no un bug de la landing.

## Bloquear una IP en caliente

Hobby: 3 bloqueos de IP.

1. Firewall → IP Blocking → Add.
2. Pega la IP (la ves en el log `mecanu.security` o en Firewall → Logs).
3. Deny, no Challenge: quien ya te está tirando abajo no merece un captcha.

Cuando se llenen las 3, deja la más antigua que ya no pegue y documenta cuáles son en este archivo.

## Consultar quién te está sondeando

Inventario completo de sensores, campos y qué hacer:
[`docs/SLACK-SEGURIDAD.md`](./docs/SLACK-SEGURIDAD.md).

Hasta que se aplique la migración `0005_security_events.sql` (no está aplicada):

1. Vercel → Logs. Filtro de texto: `mecanu.security`.
2. Cada línea es un JSON: `tipo`, `ip`, `geo`, `ruta`, `userAgent`, `ts`, `extra`.
3. Tipos: `honeypot_hit`, `fake_login`, `canary_used`, `assistant_prompt`, `assistant_injection`, `sondeo_sistematico`, `rate_limited`.
4. Alertas inmediatas (si hay DSN de Sentry): `canary_used`, `assistant_injection`, `sondeo_sistematico`.
5. Objetivo Slack: esos tres P0 a `#alertas` con el formato de `docs/SLACK-SEGURIDAD.md` §4.

## Cuota y gasto

- Vercel → Usage. Transferencia 100 GB, 1M invocaciones, 1M edge en Hobby.
- Notifications → Usage alerts. Pon aviso al 50 % y al 80 %.
- Spend management: Vercel → Settings → Billing → Spend Management. Un tope en 0 $ extra evita que un ataque te pase a factura sin querer. En Hobby no hay pago por exceso: el riesgo es **quedar fuera el resto del mes**, no la tarjeta.

## Tráfico de lanzamiento vs ataque

| Señales de gente real | Señales de ataque |
|---|---|
| `/`, `/ca`, `/en`, `/pt`, fotos, mapa | `/wp-admin`, `/.env`, `/xmlrpc.php` |
| User-agents de móvil/WhatsApp/Safari | Un mismo UA de scraper, o vacío |
| Varias IPs, varios países si hay prensa | Una IP o un /24 contra muchas rutas |
| POST = 0 | POST a login o al asistente |

## Procesos Node colgados en local

`next dev` a veces deja un `next-server` escuchando en 3000/3001 después de cerrar la terminal. Otro proyecto puede ocupar el 3000 (pasó: un `next` de julio de `auto-job-app-crm`).

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:3001 -sTCP:LISTEN
# mira COMMAND y la ruta en ps -p PID -o command
kill PID
```

No mates un `next dev` que hayas abierto tú hace diez minutos para ver la landing.

## Abrir panel en un preview (staging)

Por defecto, en Vercel no se sirve. Si hay que clickar el panel en el preview de `staging`:

1. Vercel → Env → Preview → `MECANU_EXPONER_APPS=1`.
2. Redeploy de ese preview.
3. Quítalo al terminar. No lo pongas en Production.
