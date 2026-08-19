# Auditoría de seguridad — bloque 1

Fecha: 19 de agosto de 2026.
Rama de trabajo: `feature/capa-seguridad`, partiendo de `origin/main` (`aabde5b`).
Herramienta: gitleaks 8.30.1 sobre **todo** el historial (`--log-opts=--all`). 31 commits, 0 fugas.

No se reproduce ningún secreto en este archivo. Donde hay un hallazgo de credencial, solo se indica el sitio para rotar.

## Credenciales en el historial de git

El repositorio estuvo público. Se barreó el historial completo, no solo HEAD.

| Qué se buscó | Resultado |
|---|---|
| gitleaks (reglas por defecto: AWS, JWT, tokens GitHub, claves privadas, etc.) | 0 hallazgos |
| Archivos `.env`, `.env.local`, `.env.production` commiteados | Nunca se añadieron |
| `SUPABASE_SERVICE_ROLE_KEY` con valor | Solo aparece vacía en `.env.example` (commit `d9a2519`) y mencionada en `AGENTS.md` |
| JWT tipo `eyJ…` | Un falso positivo en `package-lock.json` (integrity de npm, no una clave) |

**Nada que rotar por fuga en git**, a día de hoy, en los 31 commits de este remoto.

Eso no cubre: variables pegadas en el dashboard de Vercel, chats, capturas, o un `.env.local` que alguien copió fuera del repo. Si el repo fue público *antes* de estos 31 commits (historial reescrito o repo distinto), este escaneo no lo ve.

## Variables en código vs entorno

Revisión del árbol actual:

- `SUPABASE_SERVICE_ROLE_KEY` no se usa en ningún `.ts`/`.tsx`. El cliente de Supabase aún no está cableado.
- `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` se leen de entorno. Sin DSN, el SDK es un no-op documentado.
- IDs de GTM/GA4/Clarity **no están en esta rama**. Están en `feature/landing-seo-analitica` (PR #5, no mergeado) como `NEXT_PUBLIC_*`. Son identificadores públicos a propósito, no secretos; el riesgo es otro (cargar analítica sin consentimiento), no la filtración de la clave.

Ninguna variable sensible está hardcodeada en el código de `main`.

## Superficie pública: `/panel`, `/conductor`, `/api`

### En el código (lo que pasará el día que se quite el SSO de Vercel)

`src/proxy.ts` corta esas rutas **solo** cuando `VERCEL_ENV === "production"` y no hay `MECANU_EXPONER_APPS=1`.

Consecuencia: en **previews** de Vercel (staging, cada PR) el panel, el conductor y la API mock **sí se sirven**, si alguien pasa la Deployment Protection. El corte no cubre preview. Eso es un hueco abierto, se cierra en el bloque 3.5.

`public/robots.txt` sí los bloquea:

```
User-agent: *
Disallow: /conductor
Disallow: /panel
Disallow: /api
```

`robots.txt` no es un control de acceso. Un atacante no lo respeta. Es solo para no indexar.

### En internet, ahora mismo (19 ago 2026)

Producción: `https://mecanu-eeq95ssua-cristofersalar-4089s-projects.vercel.app`
Preview de staging: `https://mecanu-app-git-staging-cristofersalar-4089s-projects.vercel.app`

Ambas, **incluida la landing**, responden 302 a `vercel.com/sso-api`. La Deployment Protection está encendida en todo el proyecto. Desde fuera no se alcanza ni `/` ni `/panel`. El proxy no llega a ejecutarse para un anónimo: Vercel corta antes.

Eso es bueno mientras tanto. El día que se quite el SSO para publicar la web, el hueco de los previews pasa a ser real.

No hay dominio propio (`mecanu.com` no apunta aquí todavía). `layout.tsx` usa `https://mecanu.com` como `metadataBase` por defecto.

## Cabeceras que ya pone Vercel (antes de este trabajo)

En la respuesta del SSO, Vercel ya manda:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `server: Vercel`
- `x-robots-tag: noindex` (mientras hay Protection)

No hay CSP. No hay `X-Content-Type-Options` visible en esa capa. `X-Powered-By` no salió en el SSO; Next sí lo pone cuando la app responde.

## Hallazgos que no son credenciales pero importan

1. **`headers()` en el layout raíz.** `src/app/layout.tsx` lee una cabecera en cada petición. Eso obliga a Next a no prerenderizar la landing: cada visita a `/` invoca una función. En Hobby, un flood contra la home consume invocaciones, no se queda en el CDN. Se corrige en el bloque 3.8.
2. **Sentry `tracesSampleRate: 1.0`.** Si se configura un DSN, cada petición genera traza. Cuota y coste. Se baja en 3.8.
3. **Analítica de anoche no está en producción.** GTM, GA4, Clarity y el banner de cookies viven en el PR #5, no en `main`. La CSP de esta rama se escribe para no romperlos *cuando* aterrizen. Verificar contra código que no está desplegado es un riesgo del bloque 5.
4. **No hay formulario de contacto.** Los CTA son anclas a `#contacto`. El vector "llenar el buzón" aún no existe. Se deja la defensa lista, no se inventa un endpoint POST público solo para tener algo que limitar (eso ampliaría superficie).
5. **API mock sin autenticación** (`/api/v1/*`). En local y en preview (hoy) cualquiera lee traslados, vehículos, conductores de ejemplo. Datos inventados, no de clientes reales — pero sirven de mapa de la API futura.
6. **MapLibre carga tiles de `basemaps.cartocdn.com` y glifos de `demotiles.maplibre.org`.** La CSP tiene que dejarlos pasar o el mapa de la landing se queda en blanco.
7. **Proceso Node colgado.** Había un `next-server` del 10 de julio en `:3000`, de *otro* repo (`auto-job-app-crm`), PID 72825. Se mató al empezar. Cómo limpiarlos: ver `TAREAS-MAÑANA.md`.

## Qué no se ha hecho en este bloque (a propósito)

No se ha escaneado hacia fuera (subdominios de terceros, IPs ajenas, puertos). Solo se ha mirado este repo, este historial y las URLs de Vercel del propio proyecto, con GET/HEAD.

## Acciones que salen de aquí

| # | Qué | Bloque |
|---|---|---|
| A | Extender el corte de `/panel` `/conductor` `/api` a todo Vercel, no solo production | 3.5 |
| B | Quitar `headers()` del layout para que la landing sea estática | 3.8 |
| C | CSP + resto de cabeceras, compatible con GTM/Clarity/mapa | 2 |
| D | Rate limit en `/api/v1/*` | 2 |
| E | No hay secretos que rotar en git | — |
