# Cumplimiento UE / España — Mecanu

Documento vivo. Última revisión: **2026-08-20**.

Qué normas aplican a la plataforma hoy, qué ya está en el código, qué falta
del fundador (datos societarios) y qué queda para cuando haya backend real con
clientes. Las páginas públicas enlazan desde el footer: `/aviso-legal`,
`/privacidad`, `/cookies`, `/terminos`, `/accesibilidad`.

> Esto no es asesoramiento jurídico. Es el inventario técnico del producto para
> que un abogado o el fundador vean el estado real sin depender de memoria.

## Normas en alcance

| Norma | Ámbito en Mecanu | Estado |
|---|---|---|
| **RGPD** (UE 2016/679) + **LOPDGDD** (LO 3/2018) | Visitantes web, leads, registros de seguridad, futuro panel | En curso — política publicada; identidad societaria pendiente de env |
| **ePrivacy** + art. 22.2 **LSSI-CE** (cookies) | Analítica (GTM, GA4, Clarity, Vercel Analytics/SI) | OK — consentimiento previo, reject igual de fácil, Consent Mode v2 denegado |
| **LSSI-CE** (aviso del prestador) | Titular del sitio | Parcial — página lista; NIF/razón/domicilio vía env |
| **Condiciones de uso** | Web + solicitudes comerciales | OK — `/terminos` |
| **Directiva accesibilidad / EAA** (UE 2019/882) | Web pública | Declaración de conformidad parcial en `/accesibilidad` |
| **DSA** (UE 2022/2065) | Intermediarios de contenidos a gran escala | No aplica como plataforma VLOP; Mecanu es B2B logística + web corporativa |
| **NIS2** | Operadores esenciales / importantes | Fuera de umbral actual; revisar al crecer |
| **Transferencias fuera del EEE** | Google, Microsoft, Meta, Vercel, Resend, Slack, Sentry | Declaradas en `/privacidad` + SCC |

## Qué hace ya el código

### Cookies y analítica

- Cookie `mecanu_consent` (versión en `src/lib/landing/consent.ts`).
- Banner con Aceptar / Rechazar / Más info (`GoogleTag.tsx`).
- `CONSENT_DEFAULT` en el layout: Consent Mode v2 todo denegado salvo `security_storage`.
- GTM, Clarity, Vercel Analytics y Speed Insights **solo** tras `analitica: true`.
- Analítica limitada a producción (`analiticaHabilitada()`); no corre en panel/conductor/backoffice.
- Preferencia de idioma `mecanu_locale`: cookie de preferencia, no de tracking.

### Datos personales en producto

- Enmascarado de teléfono y dirección en listados del panel (`mecanu-data.ts`, tests RGPD).
- Formularios `/contacto` e ITV: checkbox de aceptación de privacidad + validación en API (`aceptaPrivacidad: true`). Aviso interno a Slack `#leads` además de Sheet y email.
- Registro de seguridad (IP/geo hosting, honeypots): base art. 6.1.f, retención 90 días — declarado en privacidad.
- CSP, HSTS, rate limit API — ver `SEGURIDAD-AUDITORIA.md`.

### Páginas legales

| URL | Contenido |
|---|---|
| `/aviso-legal` | LSSI-CE: titular, objeto, PI, responsabilidad |
| `/privacidad` | RGPD arts. 13-14: finalidades, bases, encargados, derechos, plazos |
| `/cookies` | Inventario, duración, cómo retirar consentimiento |
| `/terminos` | Condiciones de uso / precontrato web |
| `/accesibilidad` | Declaración EAA/WCAG (parcial) |

Identidad societaria (por defecto en `src/lib/landing/legal-entidad.ts`):

| Campo | Valor |
|---|---|
| Razón social | Automotive Technologies SpA |
| RUT | 77.620.433-1 |
| Domicilio | Las Bellotas 199, of. 91, Providencia, Santiago, Chile |
| Marca | Mecanu |

Opcional en Vercel: `NEXT_PUBLIC_LEGAL_*` para sobrescribir sin tocar código.

## Librerías open source evaluadas

| Opción | Decisión |
|---|---|
| [vanilla-cookieconsent](https://github.com/orestbida/cookieconsent) (MIT) | No adoptada: el CMP propio ya cumple reject-as-easy-as-accept + Consent Mode v2 y está cableado a GTM/Clarity/Vercel |
| [c15t](https://github.com/c15t/c15t) | No adoptada: overhead de dependencia para un banner ya estable |
| Zod (ya en el repo) | Usado para exigir `aceptaPrivacidad` en APIs de leads |

Criterio AGENTS.md: no añadir dependencia sin justificación. Aquí no hacía falta.

## Comunicación en la web

Footer de la landing:

- Enlaces a aviso legal, privacidad, cookies, términos, accesibilidad.
- Franja de cumplimiento («RGPD · ePrivacy · LSSI-CE») con enlace a este criterio vía `/privacidad` (sin logos de certificaciones que no tenemos).

## Pendiente del fundador

1. ~~Crear buzón `privacidad@mecanu.com`~~ — hecho (2026-08-21). Seguir monitorizándolo.
2. Revisar textos con asesoría si el volumen de leads o el panel real lo exige.
3. Decidir DPO: hoy no es obligatorio por perfil; reevaluar con tratamiento a gran escala.
4. Contabilidad Chile: confirmar giro SII de la SpA y si los servicios a talleres UE llevan IVA chileno (servicios al exterior). Cuando toque facturar: ver `docs/FACTURACION-CHILE.md` (aparcado a pedido).

## Pendiente de producto / backend

- Auth, roles, RLS y multi-tenant antes de datos reales de clientes (PREGUNTAS-ABIERTAS §1, §12).
- Encargo de tratamiento (DPA) con cada taller cliente cuando Mecanu trate datos por cuenta del taller.
- Política de retención de fotos/vídeo/firmas de check-in (PREGUNTAS-ABIERTAS §13).
- Registro de actividades de tratamiento (art. 30) cuando haya operaciones reales.
- Auditoría de accesibilidad formal (teclado + lector de pantalla).

## Cómo verificar

```bash
npm test          # incluye legal-entidad.test.ts y consent
npm run build
# Abrir /, aceptar/rechazar cookies, /privacidad, /cookies, formulario contacto paso final
```

Checklist rápido:

- [ ] Sin consentimiento → Network sin gtm.js / clarity
- [ ] Rechazar → misma web usable
- [ ] Formulario contacto sin checkbox → 422
- [ ] Footer muestra franja de cumplimiento y cinco enlaces legales
- [ ] `/aviso-legal` muestra RUT 77.620.433-1 y Automotive Technologies SpA

## Historial

| Fecha | Cambio |
|---|---|
| 2026-08-20 | Auditoría inicial, páginas legales, consentimiento en formularios, franja footer, este doc |
| 2026-08-20 | Titular: Automotive Technologies SpA (RUT 77.620.433-1, Providencia, Chile) |
