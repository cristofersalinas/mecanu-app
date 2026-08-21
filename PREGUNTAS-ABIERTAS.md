# Preguntas abiertas

Todo lo que el frontend deja ambiguo y que el backend real tendrá que decidir.
Cada punto sin anotar aquí es un bug futuro — por eso esta lista intenta ser
exhaustiva en vez de solo cómoda. Ordenada de más a menos urgente/bloqueante.

## Bloqueantes para un backend real

### 1. Autenticación
**Conductor:** magic link solo (`/entrar` → `/conductor`).
**Panel:** email+contraseña, registro con verificación de email, recuperación,
Google OAuth, y teléfono/SMS si Phone provider está activo en Supabase.
Rutas: `/panel/entrar`, `/panel/registro`, `/panel/recuperar`,
`/panel/nueva-contrasena`. Botón «Entrar» en la landing → `/panel/entrar`.
`npm run demo` sigue sin exigir login. Con keys Supabase y sin demo, `/panel`
exige sesión y crea taller+perfil (`ensurePerfilPanel`).
**Backoffice:** pendiente.
**Dashboard:** activar «Allow new users to sign up» (panel); Google provider;
Redirect URLs con `/auth/callback`. Phone opcional (Twilio).
Hasta RLS+login estables en prod: no `MECANU_EXPONER_APPS=1` a ciegas — el
proxy ya deja pasar `/panel/*` auth y el panel con sesión.

### 2. `crearRutaDesdeCampana` — HECHO (mock + supabase)
Lógica pura en `crear-ruta-desde-campana.ts`; mock y `repo-supabase` persisten
(este último cuando `MECANU_USE_SUPABASE=1`).

### 3. Los `data.ts` de los portales — puente parcial (ago 2026)
Con `MECANU_USE_SUPABASE=1` + `NEXT_PUBLIC_MECANU_USE_SUPABASE=1` el panel
hidrata rutas/campañas/clientes/vehículos/conductores/servicios desde
`GET /api/v1/panel/snapshot` (repo → Postgres). El resto de helpers síncronos
de `data.ts` sigue en mock. Migración UI completa pendiente.
Seed: `npm run db:seed` (incluye ruta demo `TR-SEED-1001`).

### 4. `getTrasladosDisponibles` es una aproximación, no el modelo real
No existe un campo "disponible" en `Tramo`. El mock aproxima con "agendado y sin
conductor asignado" (`repo-mock.ts`). El prototipo del conductor
(`src/components/conductor/constants.ts`, `POOL`) usa una lista hardcodeada
completamente distinta. Hay que decidir: ¿es un booleano explícito
(`traslados.disponible`) que el taller activa a mano, o se deriva de reglas
(agendado + sin conductor + dentro de X horas)? Afecta directamente a R8 (solape al
tomar un disponible) y a la métrica "Disponibles" del header del conductor.

### 5. `registrarHallazgoCampana` no crea campaña para testigos ámbar (sí para ITV)
`testigo: "itv"` (pegatina ausente, vencida o <60 días) **sí crea** una oferta
`SV-04` (revisión pre-ITV) en el mock — ver `campanaDesdeItvCheckin` y
`src/lib/mecanu/oferta-itv.ts`. El resto de testigos ámbar del check-in sigue
devolviendo `null`: falta un catálogo testigo→servicio de tempario resuelto en
tiempo de ejecución (`CATALOGO_DETECCION` mapea *tipos* de oportunidad, no los
8 testigos del conductor).

## Casos borde del modelo sin cubrir explícitamente

### 6. Kilometraje descendente
`HANDOFF.md` describe una UI que "avisa, no bloquea" si el km nuevo es menor que el
actual (`PRUEBA-MANUAL.md` bloque A, paso 7). El mock (`repo-mock.actualizarKmVehiculo`)
no valida nada — acepta cualquier valor. `LOOP-ESTADO.md` (hallazgo [C] número 3)
ya señalaba: "Kilometraje a la baja solo avisa, no bloquea — es lo correcto, pero
el panel debería marcarlo en rojo." Sin resolver: ¿qué hace el backend? ¿Solo
registra un log de anomalía, o hay un umbral que sí bloquea (ej. -1000 km)?

### 7. Testigo rojo → "no rodante": ¿cuánto puede tardar el taller en responder?
SLA cerrado en el backoffice (`SLA_NO_RODANTE_MIN = 15`): a los 15 min la solicitud
salta como alerta crítica y el cron deja un log de escalada (no la resuelve solo).
Sigue abierto: canal de aviso al dueño (push/WhatsApp) y qué hace el conductor si
el taller no contesta en X horas — hoy sigue parado.

### 8. Vídeo obligatorio en el check-in: ¿siempre?
`LOOP-ESTADO.md` [C] número 1 y `PRUEBA-MANUAL.md` lo marcan como pregunta de
producto abierta, no de ingeniería — "30 s son ~25 MB, con 9 traslados y sin wifi
es mucha cola". Recomendación ya escrita en el propio material: exigirlo solo en
vehículos de más de 10 años o valor declarado alto. No implementado.

### 9. Inspección repetida en cada recogida para un mismo cliente recurrente
`LOOP-ESTADO.md` [C] número 4: no hay pre-relleno con la última inspección. Afecta
tiempo por check-in, que el propio material de pruebas identifica como la métrica
crítica ("si son más de 3-4 minutos por coche... el flujo no aguanta").

### 10. Nota de voz sin transcripción
`LOOP-ESTADO.md` [C] número 5: el taller la escucha entera hoy. Transcribir en
servidor (Whisper API o similar) es una decisión de producto + costo, no tomada.

### 11. Sin foto de ejemplo/silueta guía en la cámara del check-in
`LOOP-ESTADO.md` [C] número 6. Afecta calidad de evidencia, no lógica de negocio.

## Preguntas de infraestructura

### 12. Multi-tenancy de Supabase
Si Mecanu vende a más de un taller, el schema de `MODELO-DATOS.md` necesita una
columna `taller_id`/`tenant_id` en (casi) todas las tablas y políticas RLS por
tenant. Hoy no existe ese concepto en ningún sitio del modelo — todo asume un único
taller. Decidir esto ANTES de escribir migraciones reales; añadirlo después es
mucho más caro.

### 13. Almacenamiento de fotos/vídeo/firmas
Hoy son URLs/data-URIs simulados (`picsum.photos`, SVG inline). En producción:
¿Supabase Storage? ¿Qué política de retención (evidencia legal de siniestros,
¿cuánto tiempo se guarda)? ¿Se comprimen antes de subir (relevante para la cola
offline con datos móviles)?

### 14. Cola offline: hoy vive solo en memoria de React
El agente que construyó `/conductor` lo señaló explícitamente en su reporte: la
cola de sincronización no sobrevive un cierre de pestaña/recarga — no hay
IndexedDB ni `localStorage` detrás. `HANDOFF.md` §7.5 exige que "nunca se pierden
ni bloquean al conductor", lo que en la práctica requiere persistencia local real
antes de production-ready. Es la brecha más grande entre "lo que dice el
handoff" y "lo que hay construido" en toda la app del conductor.

### 15. Idempotencia hoy es un `Map` en memoria del proceso
`src/lib/mecanu/idempotency.ts` lo dice explícitamente en su comentario — se vacía
en cada redeploy, no se comparte entre instancias serverless. Para Vercel
(serverless, múltiples instancias) esto necesita una tabla Postgres real (ver
`MODELO-DATOS.md` nota sobre esto) antes de confiar en la idempotencia en
producción con más de una instancia sirviendo tráfico a la vez.

### 16. Notificaciones (WhatsApp real, push al conductor)
`readme.md` del design system y `HANDOFF.md` §8 son explícitos: "fuera del scope
de este design system, lo gestiona otra capa". `mecanu-whatsapp.ts` es una
simulación completa de la API de WhatsApp Cloud (payloads, ventana de 24h, estados
de entrega) pero `enviar()` nunca llama a Meta de verdad. Conectar la API real es
straightforward (el propio código lo dice: "solo se sustituye `enviar()` por el
POST a /messages") pero requiere credenciales de WABA que no existen todavía.
Notificaciones push al móvil del conductor (para solicitudes resueltas, nuevos
traslados) no están ni simuladas.

## Ambigüedades menores de tipo/forma

### 17. Config del pipeline (`ESTADOS`, `TAGS_*`, `PRESUPUESTO_ESTADOS`) no tiene Zod
`src/lib/mecanu/types.ts` solo valida entidades de datos (lo que sería una fila de
tabla). La configuración declarativa de `mecanu-pipeline.ts` se tipó con TS plano,
no Zod — es intencional (es config de código, no datos de usuario) pero significa
que no hay validación en runtime si alguien edita mal ese archivo. Aceptable
mientras sea código versionado; reconsiderar si algún día se vuelve editable desde
un panel de administración.

### 18. `Ruta.subestado` es `string`, no una unión estricta por estado
En `types.ts`, `RutaSchema.subestado` es `z.string()` en vez de un enum, porque los
subestados válidos dependen del `estado` (una unión discriminada sería más
correcta pero bastante más compleja de mantener sincronizada con
`mecanu-pipeline.ts`). La validación real de "este subestado es válido para este
estado" vive en código (`subestadoMeta`), no en el schema. Documentado aquí para
que quien construya el backend no asuma que el schema ya garantiza esa invariante.

### 19. Prefijos de id duplicados en campañas (`OP-*` vs `CMP-*`)
Ver nota en `MODELO-DATOS.md` tabla `campanas` — dos prefijos sin diferencia
semántica clara en el mock (oportunidades auto-detectadas vs. creadas a mano).
Unificar antes de que el prefijo se filtre a lógica de negocio real en algún sitio.

### 20. Identidad societaria para LSSI-CE / RGPD — resuelto (2026-08-20)
Titular publicado: **Automotive Technologies SpA**, RUT **77.620.433-1**, Las Bellotas
199 of. 91, Providencia, Chile (marca Mecanu). Vive en
`src/lib/landing/legal-entidad.ts` (`LEGAL_DEFAULTS`). Buzón
`privacidad@mecanu.com` activo (2026-08-21). Sigue abierto: confirmación
contable del giro/IVA en servicios al exterior (ver §21).

### 21. Facturación Chile → UE — aparcado a pedido del fundador
Contexto guardado en `docs/FACTURACION-CHILE.md` (SpA vs persona natural, impuestos
a alto nivel, checklist). **No implementar facturación en producto** hasta que el
fundador vuelva con el detalle de cómo quiere cobrar.
