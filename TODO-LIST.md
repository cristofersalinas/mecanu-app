# TODO-LIST

Lista unificada. Marca `[x]` cuando esté hecho de verdad (código en `main` o click ops confirmado).  
Al cerrar un tema en chat, **actualiza este archivo** en el mismo commit o en el siguiente.

**Orden sugerido hoy:** probar crear ruta → commit del fix → commit auth (aparte de WhatsApp) → dominio + Google «Mecanu». WhatsApp embebido (Baileys) va en su propio hilo.

---

## Decisión WhatsApp (panel)

**Elegido:** WhatsApp **embebido** ligero (QR + bandeja CRM).  
Baileys: solo chats 1:1, sin grupos, sin historial completo; mensajes desde la
vinculación. Contactos primero. Ciclo de vida en ficha + etiqueta. Máx. **5**
sesiones. Sin Kapso.

### WhatsApp · trabajo
- [x] QR embebido ligero (Baileys) + fases QR → sincronizando → bandeja
- [x] UI gestión: buscador, ciclo de vida, sidebar, respuestas rápidas
- [x] Migración `0012` sesiones + `0013` ciclo_vida clientes
- [ ] Aplicar migraciones `0012`/`0013` en mecanu-dev
- [x] Campaña: chat del contacto + enlace a bandeja personal
- [x] Aparcado: PR #30 Kapso Inbox

---

## A · Esta rama / trabajo local (código)

### Auth / URLs negocio (local, sin commit limpio)
- [ ] Commit aparte de login/registro (globo, card blanca, quitar «Entrar» de la landing, rutas `negocio.mecanu.com`) — hecho en local, mezclado con otros cambios
- [ ] Commit aparte del resto (clientes Particular, seed full, panel URLs sin IDs, etc.) o PRs partidos

### Crear ruta desde campaña
- [x] Parche del 500 de presupuesto en `repo-supabase.ts` (local)
- [ ] Probar otra vez en el panel con `c@mecanu.com`
- [ ] Commit del fix

### UX / producto en código
- [ ] Deshacer acciones (hoy solo toast corto en conductor)
- [ ] Hallazgo de check-in → crear campaña en Postgres (`registrarHallazgoCampana` aún devuelve `null`)
- [ ] WhatsApp de campañas: unificar `CANALES_SEED` con `whatsapp_conversaciones` (bandeja personal ya existe)
- [ ] Migrar del todo `data.ts` → `repo` (tablero ya hidrata Postgres; el resto a medias)

---

## B · Tú (ops / clicks)

- [ ] Dominio `negocio.mecanu.com` en Vercel + DNS
- [ ] Supabase → Redirect URLs: `https://negocio.mecanu.com/auth/callback` (+ local si hace falta)
- [ ] Google Cloud Branding: nombre **Mecanu**, logo, privacidad/términos (el consentimiento no puede decir solo `….supabase.co` desde Next)
- [ ] Alertas de uso / tope de gasto en Vercel
- [ ] De vez en cuando: revisar logs `mecanu.security` en Vercel

---

## C · Backend / datos (estado actual)

### Hecho (usable en Mac con usuario test)
- [x] Migraciones Postgres (`0001`–`0012` en repo; WhatsApp = `0012`)
- [x] Auth taller: usuario test `c@mecanu.com` → taller `taller-rodriguez`
- [x] Seed completo del mock en Supabase (`npm run db:seed:full` / bootstrap)
- [x] `repo-supabase` + APIs panel/conductor con `MECANU_USE_SUPABASE=1`
- [x] Panel hidratado desde Postgres (snapshot)
- [x] WhatsApp embebido: Baileys (QR en panel) + bandeja (API + UI; DB vía `0012`)

### Pendiente
- [ ] Backoffice del dueño: login + datos reales (hoy sin login / mock)
- [ ] Conductor: magic link de verdad (lo manda el taller; no «pídemelo otra vez» en web)
- [ ] Login conductor + impersonación con cookie (hoy «Ver usuario» es mock)
- [ ] WhatsApp: aplicar `0012` en mecanu-dev si aún no está; puente `npm run wa:bridge` en local
- [ ] Fotos / vídeo / firmas en Storage (bucket `evidencias` migrado; flujo UI/API completo pendiente)
- [ ] Exponer panel en producción (`negocio.mecanu.com`) cuando ops + auth estén listos — hoy `mecanu.com` es landing

---

## D · Producto aparcado a propósito

- [ ] Cobro / SII
- [ ] DPO
- [ ] Partir el repo

---

## Cómo actualizar los checkboxes

No se actualizan solos. Criterio:

| Marca | Cuándo |
|---|---|
| `[x]` | Hecho y verificable (mergeado, click ops hecho, o seed/auth probado) |
| `[ ]` | Falta código, prueba, commit o click |

Si algo de A queda en `main` y B lo confirmas, márcalo `[x]` en el mismo mensaje en que digas «listo».
