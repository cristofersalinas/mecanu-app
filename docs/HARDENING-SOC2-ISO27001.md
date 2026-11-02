# Endurecimiento Mecanu (SOC 2 e ISO 27001)

Esto es el proceso de controles del producto. **No es un certificado SOC 2 ni
ISO 27001.** Nadie ha auditado Mecanu contra esos marcos. El documento dice qué
está hecho en el código, qué ya había, y qué riesgo sigue abierto.

Alcance: landing (`mecanu.com`), panel del taller (`negocio.mecanu.com`),
app del conductor (`/conductor`), backoffice (`/backoffice`) y `/api/v1`.

Fuera de alcance, a propósito: políticas de personal, oficina física, informes
SOC de proveedores (Vercel, Supabase, Google, Slack) y un programa formal de
auditoría. Sin eso no hay certificación.

## Cómo leer los controles

| Marco | Qué pide, en corto | Dónde vive en Mecanu |
|---|---|---|
| SOC 2 CC6 | Quién entra y a qué | Sesión de Supabase en panel, conductor, backoffice y APIs de escritura. Demo y local sin keys siguen abiertos. |
| SOC 2 CC6.7 / ISO A.8.24 | Secretos y cifrado en tránsito | HTTPS y HSTS en Vercel. Secretos solo en env de servidor. Comparación del cron en tiempo constante. La `service_role` no sale al cliente. |
| SOC 2 CC7 / ISO A.8.15 y A.5.24 | Detectar y responder | Sentry, eventos de seguridad, runbook `SEGURIDAD-RUNBOOK.md`, avisos en `#alertas` (`docs/SLACK-SEGURIDAD.md`). |
| SOC 2 CC8 | El cambio pasa por revisión | Rama → PR → CI `production-gate` → merge. Esquema solo con SQL en `supabase/migrations/`. |
| ISO A.8.20 / A.8.26 | Red y aplicación | `src/proxy.ts` corta panel, conductor, backoffice y el resto de `/api` en Vercel salvo allowlist. Cabeceras en `src/lib/security/csp.ts`. |
| ISO A.8.5 | Identificación | Misma regla en todos los portales operativos: Supabase configurado y `MECANU_DEMO` distinto de `1`. |
| ISO A.8.28 | Codificación segura | Zod en escrituras, idempotencia, webhook de Kapso con HMAC, errores 500 sin mensaje interno. |

La función pura está en `src/lib/security/controles.ts`. La puerta de sesión,
en `src/lib/security/sesion-operativa.ts`.

## Qué ya estaba

- Cabeceras: CSP, HSTS, `nosniff`, Referrer-Policy, Permissions-Policy. Sin
  `X-Powered-By`. No se añade COOP/COEP: rompería los iframes de Kapso, el
  mapa y el OAuth.
- En Vercel, sin `MECANU_EXPONER_APPS=1`, el proxy responde 404 al API que no
  está en la lista pública y redirige las apps. La landing, el contacto, los
  leads de ITV, el webhook de Kapso, el seguimiento `/api/v1/s/` y el panel
  (ese con su propia sesión) siguen.
- Límite de peticiones en memoria por instancia (no es un muro global).
- Honeypots, canario y tope del asistente.
- Panel: `requirePanelSession()` en las mutaciones. La página redirige a
  `/panel/entrar`.
- Idempotency-Key en las escrituras del conductor.
- El cron de borradores de contacto ya exigía `CONTACTO_CRON_SECRET`. El
  workflow de GitHub lo manda en `Authorization: Bearer`.

## Qué cambia este proceso

1. **Escrituras y lecturas operativas** (subestado, check-in, GPS, entrega,
   solicitudes, incidencias, km, bolsa de disponibles, turno, ubicación,
   snapshot del conductor) exigen sesión cuando hay Supabase y no es demo.
   `npm run demo` y un local sin keys no cambian.
2. Si el perfil tiene `conductor_id`, no puede leer ni escribir como otro
   conductor. Si el campo está vacío, la sesión vale igual para el id que
   mande la app. Eso queda abierto hasta que el login del conductor rellene
   el vínculo.
3. **Backoffice:** la página redirige a `/panel/entrar` y cada server action
   comprueba la sesión por su cuenta. No hay rol de dueño: entra quien tenga
   sesión de panel. Las acciones siguen firmando como `u-dueno`.
4. **Slack de oportunidades** (`POST /api/v1/oportunidades/slack-evento`)
   usa la sesión del panel. El navegador ya manda la cookie.
5. **CSX por HTTP** (`POST /api/v1/csx/slack`), con Supabase y sin demo, exige
   `Authorization: Bearer` igual a `CSX_CRON_SECRET`. Si el secreto no está,
   la ruta deniega. El cron de los lunes no llama a esta URL: ejecuta
   `scripts/csx-semanal.ts` con el token de Slack en el workflow.
6. **Flush de borradores:** solo bearer, comparación en tiempo constante.
   El secreto ya no se acepta en `?secret=` (eso queda en los access logs).
   La respuesta cuenta fallos y no pega el mensaje de Sheets.
7. **Errores 500** del kanban, snapshots, flota, WhatsApp del panel y
   presupuesto público no devuelven `e.message`. El detalle se queda en el
   log del servidor. El copy de producto del puente de WhatsApp (puente
   apagado, máximo de sesiones, teléfono inválido) sí sale, porque la UI lo
   enseña.
8. **Street View** de la landing acepta solo lat/lng/heading numéricos y
   acotados, tamaño fijo, y entra en la allowlist pública del proxy para que
   el mapa siga cargando en producción. La key no se reenvía al navegador en
   el cuerpo de error.
9. El snapshot del conductor lleva `Cache-Control: no-store`.

## Riesgo que sigue

- El límite de peticiones es por instancia de Vercel, no un contador único.
  No se añade Redis en este cambio.
- Una cuenta con sesión y sin `conductor_id` puede pedir el snapshot de otro
  conductor. Hace falta el login del conductor y rellenar ese campo.
- Las escrituras de un tramo (subestado, GPS, check-in) comprueban que hay
  sesión, no que ese tramo esté asignado a esa persona.
- El backoffice no distingue dueño de operario.
- La idempotencia recuerda la respuesta por clave. Quien tenga la clave y una
  sesión puede releer esa respuesta. Las claves tienen que ser impredecibles.
- `SEGURIDAD-AUDITORIA.md` (agosto 2026) describe un producto anterior. Este
  archivo es el que vale para el estado actual.
- No hay informe de proveedores, política de retención firmada ni prueba de
  restauración de backups en este repositorio. Supabase y Vercel lo cubren
  en sus propios planes; hay que pedirlo cuando se vaya a auditar de verdad.

## Cómo comprobarlo

```bash
npm test
```

Los controles puros están en `src/lib/security/controles.test.ts`.

En local, `npm run demo` abre panel, conductor y backoffice sin login.
Con Supabase y sin `MECANU_DEMO=1`, una llamada anónima a
`POST /api/v1/traslados/TS-1/subestado` responde 401, y `/backoffice`
redirige a `/panel/entrar`.
