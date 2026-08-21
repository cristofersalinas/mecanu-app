# Señales Slack — mapa operativo (talleres + conductores)

Slack es el canal único de notificación del dueño. Cada mensaje tiene que
permitir decidir en &lt;10 s: ¿llamo, asigno, espero o ignoro?

Los leads comerciales viven en `#leads`. La infra (CI / deploy) sigue en
`#alertas` / `#deploys`. Las señales de **taller** y **conductor** van a
`#alertas` cuando son P0/P1, y a un digest en `#senales` cuando son P2/P3
(canal a crear cuando arranque el backend real; hasta entonces el plan
queda aquí).

Detalle de montaje técnico: [`SLACK.md`](./SLACK.md).
Abuso / sondeo (IP, evidencia, sensores): [`SLACK-SEGURIDAD.md`](./SLACK-SEGURIDAD.md).
Reglas de SLA ya en código: `src/lib/mecanu/backoffice/reglas.ts` y
`alertas.ts`.

---

## 1. Formato fijo de cada mensaje

```
[P0 · CRITICA]  #conductor  #no_rodante  ·  TR-1042
Conductor parado — Javier Molina
Taller: Talleres Rodríguez · Madrid
SLA 15 min · lleva 18 min · abierto 11:42
Qué hacer: llamar al taller o resolver en /backoffice
```

| Bloque | Qué lleva | Por qué |
|---|---|---|
| Cabecera | `P0–P3` + severidad + tags + id entidad | Ordenas sin leer el cuerpo |
| Título | Una línea, verbo + sujeto | Escaneable en el móvil |
| Contexto | Quién + taller + ciudad | Sabes a quién llamar |
| Reloj | SLA + tiempo transcurrido + hora de apertura | Sabes si ya vas tarde |
| Qué hacer | 1 acción concreta | No “revisar” genérico |

**Tags canónicos** (siempre con `#`, máximo 3 por mensaje):

| Tag | Significa |
|---|---|
| `#taller` | Origen / actor: panel del taller |
| `#conductor` | Origen / actor: app del conductor |
| `#ruta` | Entidad: ruta / tramo (TR-*, TS-*) |
| `#oferta` | Entidad: campaña / presupuesto |
| `#cobertura` | Hueco de agenda o conductor |
| `#onboarding` | Alta / papeles de conductor |
| `#lead` | Formulario web (solo `#leads`) |
| `#infra` | CI / deploy (solo `#alertas` / `#deploys`) |
| `#no_rodante` | Tipo concreto de solicitud (además del tag actor) |

**Prioridad → canal → comportamiento del dueño**

| P | Severidad | Canal | Push | Qué haces |
|---|---|---|---|---|
| **P0** | CRITICA | `#alertas` | Ya | Actúas tú o llamas; no lo dejas para después |
| **P1** | ALTA | `#alertas` | Ya | Hoy, en la siguiente franja libre |
| **P2** | MEDIA | `#senales` (digest 09:00) | No | Lista del día; no interrumpe |
| **P3** | INFO | `#senales` (digest) o silencio | No | Contexto; no exige acción |

Regla dura: **si no hay acción humana posible, no se notifica**.
Los cambios de subestado EN RUTA que hace el conductor no pican Slack
(van al panel). Solo pica cuando se rompe un SLA o alguien pide algo.

---

## 2. Casos de uso — Conductor (app `/conductor`)

| # | Señal | P | Tags | Cuándo salta | Datos obligatorios | Decisión |
|---|---|---|---|---|---|---|
| C1 | **No rodante sin respuesta** | P0 | `#conductor` `#no_rodante` `#ruta` | Solicitud `no_rodante` pendiente &gt; 15 min (`SLA_NO_RODANTE_MIN`) | Conductor, ruta, taller, motivo testigo, minutos | Llamar taller / autorizar / rechazar; conductor sigue parado |
| C2 | **Reagenda sin resolver** | P1 | `#conductor` `#ruta` | Solicitud `reagenda` pendiente &gt; 60 min | Conductor, ruta, ventana pedida, motivo | Aceptar nueva ventana o cancelar tramo |
| C3 | **Rechazo de traslado** | P1 | `#conductor` `#cobertura` | Solicitud `rechazo` pendiente &gt; 60 min | Conductor, tramo, motivo | Reasignar otro conductor o devolver a disponibles |
| C4 | **Fallido en origen** | P1 | `#conductor` `#ruta` | Solicitud `fallido_origen` pendiente &gt; 60 min | Conductor, dirección, qué falló (nadie, llaves, coche no) | Reagendar o cerrar con incidencia |
| C5 | **En ruta sin avance** | P1 | `#conductor` `#ruta` | Tramo `en_curso` sin cambio de subestado &gt; 45 min (`SLA_EN_RUTA_SIN_AVANCE_MIN`) | Conductor, tramo, subestado actual, minutos | Llamar conductor; ¿atasco, incidente, app colgada? |
| C6 | **Check-in con hallazgo crítico** | P1 | `#conductor` `#oferta` | Testigo rojo / no rodante detectado en check-in (además de C1 si abre solicitud) | Matrícula, hallazgo, fotos disponibles sí/no | Abrir oferta urgente o parar el viaje |
| C7 | **Cola offline atascada** | P2 | `#conductor` `#infra` | Ítems en cola &gt; N min sin sync (cuando exista persistencia real) | Conductor, nº ítems, último error | Pedir Wi‑Fi / revisar API; no es cliente esperando |
| C8 | **Onboarding docs atrasado** | P2 | `#conductor` `#onboarding` | Conductor en `documentos_pendientes` &gt; 7 días | Nombre, docs que faltan | Empujar WhatsApp / dar de baja del pool |
| C9 | **Primera jornada OK** | P3 | `#conductor` `#onboarding` | Primer traslado completado del conductor | Nombre, ruta | Nada urgente; celebra y sigue |

Hoy en mock ya existen C1–C5 y C8 como `AlertaOperativa` en
`buildAlertas`. C6–C7 y C9 son producto futuro cuando haya backend +
cola offline real.

---

## 3. Casos de uso — Taller (panel `/panel`)

| # | Señal | P | Tags | Cuándo salta | Datos obligatorios | Decisión |
|---|---|---|---|---|---|---|
| T1 | **Tramo agendado sin conductor (&lt;4 h)** | P0 | `#taller` `#cobertura` `#ruta` | Hueco `sin_conductor` urgente y ventana &lt; 4 h | Ruta, ventana, taller, matrícula | Asignar ya o cancelar / avisar cliente |
| T2 | **Tramo sin conductor (&lt;24 h)** | P1 | `#taller` `#cobertura` `#ruta` | Hueco urgente en próximas 24 h (`SLA_HUECO_SIN_CONDUCTOR_H`) | Igual | Cubrir en el día |
| T3 | **Oferta aceptada sin crear ruta** | P1 | `#taller` `#oferta` `#ruta` | Campaña `aceptada` sin `rutaGeneradaId` &gt; X h (propuesto: 4 h laborables) | Campaña, cliente, total IVA, matrícula | Abrir modal Crear ruta (decisión #9) |
| T4 | **Cliente respondió a la oferta** | P1 | `#taller` `#oferta` | Mensaje `in` en campaña enviada (acepta / duda / rechazo) | Campaña, texto corto, teléfono | Contestar o avanzar estado a mano |
| T5 | **Estimado valorado sin enviar** | P2 | `#taller` `#oferta` | Campaña `valorada` &gt; 2 días (`DIAS_VALORADA_SIN_ENVIAR`) | Campaña, total, matrícula | Enviar o archivar; el avance es manual a propósito |
| T6 | **Oferta a punto de caducar** | P2 | `#taller` `#oferta` | Campaña `enviada` cerca de `DIAS_CADUCIDAD_OFERTA` | Campaña, días, cliente | Recordar al cliente o dejar caducar |
| T7 | **Ruta en Prospectos sin ventana** | P2 | `#taller` `#ruta` | Deber `agendar` con urgencia `hoy`/`ahora` | Ruta, matrícula | Agendar o cancelar prospecto |
| T8 | **Vuelta sin agendar (coche listo)** | P1 | `#taller` `#ruta` | Deber `agendar_vuelta` urgencia `ahora` | Ruta, `vehiculoListo` | Agendar vuelta; el coche ocupa plaza |
| T9 | **Incidencia en entrega** | P1 | `#taller` `#ruta` | Ruta completada `con_incidencia` o log `incidencia` | Ruta, texto incidencia, fotos sí/no | Abrir parte / avisar seguro / contactar cliente |
| T10 | **Taller inactivo (churn)** | P2 | `#taller` | Sin agendar traslado &gt; 7 días (plantilla churn del outbox) | Taller, último agendado | Llamada comercial / soporte, no alarma operativa |
| T11 | **Onboarding taller incompleto** | P2 | `#taller` `#onboarding` | Pasos de `OnboardingTaller` sin cerrar &gt; N días | Taller, paso pendiente | Empujar configuración (sucursal, horario) |

T1–T2, T5–T6 ya alimentan alertas o deberes en mock. T3, T4, T8–T11 se
cablean cuando haya eventos reales de escritura (no solo snapshot).

---

## 4b. Oportunidades del taller → `#oportunidades`

Un hilo por `CMP-*`. Control paternalista del funnel:

| Evento | Qué ves |
|---|---|
| Creada (check-in ITV / panel) | Taller, sucursal, matrícula, € IVA, sugerencia |
| Cambio de estado | `Usuario X [rol] movió de A a B` |
| Ruta creada | Comentario de cierre operativo |
| Sin movimiento (24h / 72h / 4h) | Nudge en el mismo hilo |

Detalle de montaje: [`SLACK.md`](./SLACK.md) §oportunidades.


| # | Señal | P | Canal | Tags |
|---|---|---|---|---|
| L1 | Habla con Mecanu | P1 | `#leads` | `#lead` `#taller` |
| L2 | ITV a domicilio | P1 | `#leads` | `#lead` |

El email y la Sheet siguen. Slack es el aviso inmediato.

---

## 5. Casos de uso — Infra (ya en marcha)

| # | Señal | P | Canal | Tags |
|---|---|---|---|---|
| I1 | CI rojo en `main` | P0 | `#alertas` | `#infra` |
| I2 | Deploy producción fallido | P0 | `#alertas` | `#infra` |
| I3 | Deploy producción OK | P3 | `#deploys` | `#infra` |

---

## 6. Qué NO notificar (anti-ruido)

- Cada cambio de subestado EN RUTA (`yendo` → `en_origen` → …): eso es el panel.
- Cada log interno del mock / cron sin acción humana.
- CI rojo en ramas `feature/*`: se ve en el PR.
- Preview de Vercel.
- Digest de “todo OK” diario vacío.
- `@channel` / `@here` nunca.

Si una señal P2 empieza a llegar más de ~5/día, baja a digest o sube el umbral;
no abras un quinto canal.

---

## 7. Orden de implementación (cuando haya backend)

1. **P0 de verdad:** C1 (no rodante), T1 (hueco &lt;4 h), I1–I2.
2. **P1 operativo:** C2–C5, T2–T4, T8–T9, L1–L2 (L ya).
3. **Digest `#senales` 09:00 Europe/Madrid:** T5–T7, T10–T11, C8.
4. **P3 opcional:** C9, I3 (I3 ya en `#deploys`).

Hasta que exista Postgres + cron real, el backoffice mock ya calcula C1–C5,
C8, T1–T2, T5–T6: el trabajo es **publicar** esas `AlertaOperativa` a Slack
con el formato de la §1, no inventar otra taxonomía.

---

## 8. Matriz rápida “veo el tag → hago”

| Si el mensaje lleva… | Tu primera acción |
|---|---|
| `#no_rodante` | Llamar taller; el conductor está parado |
| `#cobertura` | Asignar conductor o cancelar ventana |
| `#oferta` + P1 | Abrir campaña / contestar cliente |
| `#ruta` + incidencia | Leer detalle; decidir parte / cliente |
| `#onboarding` | Empujar papeles o configuración |
| `#lead` | Llamar / WhatsApp comercial |
| `#infra` | Abrir Actions / Vercel; no es un cliente |

Si tras leer la cabecera no sabes qué hacer, el mensaje está mal formado:
falta el bloque **Qué hacer**.
