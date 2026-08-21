# Contratos de API — `/api/v1`

Superficie HTTP que usa la app del conductor (offline-first, ver `ARQUITECTURA.md`
para por qué el panel no usa esto). Todas las rutas viven bajo
`src/app/api/v1/`, validan el body con Zod (`src/lib/mecanu/api-helpers.ts`) y
devuelven JSON.

## Convenciones

- **Idempotencia**: todo POST/PATCH de escritura acepta un header
  `Idempotency-Key: <string>` opcional pero fuertemente recomendado. Si se repite la
  misma clave, se devuelve la respuesta guardada de la primera vez sin re-ejecutar
  la mutación. La app del conductor debe generar una clave (ej. un UUID) por acción
  encolada offline, no por intento de red — así reintentos automáticos son
  idempotentes de verdad. Ver `src/lib/mecanu/idempotency.ts`.
- **Errores**: siempre `{ "error": { "code": string, "message": string } }` con el
  status HTTP correspondiente:
  - `400` — body no es JSON válido.
  - `422` — el body es JSON pero no cumple el schema Zod (`code: "validation_error"`,
    `message` lista los campos que fallaron).
  - `404` — la entidad referenciada no existe (`code: "not_found"`).
  - `500` — error inesperado del servidor (`code: "internal_error"`).
- **Fechas**: en el mock viajan como objetos `Date` de JS internamente; en la API
  real HTTP van como string ISO-8601 en el JSON (estándar `JSON.stringify`/`Date`).
  El cliente debe parsear con `new Date(str)`.

## Endpoints

### `POST /api/v1/traslados/:id/asignar`
El conductor toma un traslado de la bolsa de disponibles.
```json
// Request
{ "conductorId": "d1" }
// Response 200 → Tramo actualizado (ver types.ts TramoSchema)
```

### `POST /api/v1/traslados/:id/subestado`
Avance de EN_RUTA. **R7: solo el conductor dispara este endpoint** — el backend real
debería verificar que el `conductorId` autenticado coincide con `tramo.conductorId`.
```json
// Request
{ "a": "en_origen", "triggerSource": "conductor" }
// a ∈ en_camino_origen | en_origen | en_transito | en_destino
// Response 200 → Tramo actualizado
```

### `POST /api/v1/traslados/:id/checkin`
Evidencia de recogida, sellada e inmutable tras enviar. **R4: gate de evidencia** —
el schema exige mínimo 4 fotos; el backend real debe además rechazar si faltan
testigos/km/combustible antes de aceptar.
```json
// Request
{
  "km": 68500,
  "combustible": "3/4", "combustiblePct": 75,
  "limpieza": "Limpio",
  "fotos": [{ "slot": "frontal", "url": "https://..." }, ...],   // mínimo 4
  "videoUrl": "https://..." | null,
  "testigos": { "temp": false, "aceite": false, ... },            // 8 claves, true = testigo encendido
  "itemsInspeccion": { "plumillas": 1, "focos": 2, ... },         // escala 1-4, 6 ítems
  "ruedas": { "di": 1, "dd": 1, "ti": 2, "td": 1 },               // escala 1-4, 4 posiciones
  "nota": "..." | null,
  "notaVozUrl": "https://..." | null,
  "firmaConductor": "data:image/..." | null
}
// Response 200 → { tramo: Tramo, inspeccion: Inspeccion }
```

### `POST /api/v1/traslados/:id/entrega`
Completa el tramo (entrega en taller o devolución al cliente).
```json
// Request
{
  "fotos": [{ "slot": "estado", "url": "..." }, { "slot": "entorno", "url": "..." }], // mínimo 2
  "firmaCliente": "data:image/..." | null   // obligatoria si rol=vuelta, el backend real debe validarlo cruzando el tramo
}
// Response 200 → Tramo actualizado
```

### `POST /api/v1/traslados/:id/confirmaciones`
Informativa, no bloquea el flujo (a diferencia de `/solicitudes`).
```json
// Request
{ "tipo": "llegada_a_tiempo", "nota": "..." | null, "origen": "conductor" }
// Response 200 → { "ok": true }
```

### `POST /api/v1/traslados/:id/solicitudes`
El conductor **propone**, el taller **ejecuta** — esta llamada NUNCA cambia la
ventana/fecha directamente (R6). Solo crea una `Solicitud` en estado `pendiente`
que el taller resuelve vía `/api/v1/solicitudes/:id/resolver`.
```json
// Request
{
  "rutaId": "TR-1056", "conductorId": "d1",
  "tipo": "reagenda",  // reagenda | rechazo | fallido_origen | no_rodante
  "motivo": "solape",  // de una lista cerrada por tipo, ver MOTIVOS en src/components/conductor/constants.ts
  "nota": "..." | null,
  "ventanaActual": "16:00 - 17:00" | null,
  "conflictoCon": "TS-1058-1" | null,
  "evidenciaIds": []
}
// Response 200 → Solicitud creada
```

### `POST /api/v1/incidencias`
Reporte de siniestro (hold-to-activate en la UI, ver `IncidentButton`). Congela el
tramo — no se puede avanzar hasta que el taller responda.
```json
// Request
{ "trasladoId": "TS-1042-1", "tipo": "siniestro", "detalle": "..." | null }
// Response 200 → { "ok": true }
```

### `PATCH /api/v1/vehiculos/:id`
El km vive en el VEHÍCULO, no en el traslado (HANDOFF.md §7.2).
```json
// Request
{ "km": 68550 }
// Response 200 → Vehiculo actualizado
// El backend real debe avisar (no bloquear) si km < vehiculo.km actual — hoy el
// mock no valida esto, ver PREGUNTAS-ABIERTAS.md.
```

### `POST /api/v1/campanas/hallazgos`
Un testigo ámbar (nivel 2-4) durante el check-in genera/alimenta una campaña.
`testigo: "itv"` crea una oferta de revisión pre-ITV (`SV-04`) si la pegatina no
está, la ITV está vencida o vence en menos de 60 días.
```json
// Request
{ "rutaId": "TR-1056", "trasladoId": "TS-1056-1", "testigo": "presion", "nivel": 3 }
{ "rutaId": "TR-1055", "trasladoId": "TS-1055-1", "testigo": "itv", "nivel": 4,
  "detalle": "vencida", "dias": -12 }
// Response 200 → Campana | null
// ITV: Campana real (o la oferta de ITV ya abierta de ese vehículo).
// Resto de testigos: el mock sigue devolviendo null — ver PREGUNTAS-ABIERTAS.md #5.
```

### `GET /api/v1/traslados/disponibles`
Bolsa de traslados libres que el conductor puede tomar.
```json
// Response 200 → { "trasladoIds": ["TS-1055-1", "TS-1050-1"] }
// Ver PREGUNTAS-ABIERTAS.md: no hay un campo "disponible" real en el modelo hoy;
// el mock aproxima con tramos agendados sin conductorId asignado.
```

### `GET /api/v1/conductores/:id/turno?dia=hoy`
El reparto del día lo decide el taller.
```json
// Response 200 → { "trasladoIds": ["TS-1042-1", "TS-1039-1", ...] }
```

### `GET /api/v1/solicitudes`
Bandeja del taller: solicitudes `pendiente` creadas por conductores.
```json
// Response 200 → { "solicitudes": Solicitud[] }
```

### `POST /api/v1/solicitudes/:id/resolver`
El taller resuelve una solicitud.
```json
// Request
{ "estado": "resuelta_reagenda", "resolucion": "Reagendado a 16:00-17:00" }
// estado ∈ resuelta_reagenda | resuelta_reasignada | resuelta_cancelada | descartada
// Response 200 → Solicitud actualizada
```

### `POST /api/v1/oportunidades/slack-evento`
Aviso paternalista a Slack `#oportunidades` (hilo por campaña). Sin
`SLACK_BOT_TOKEN` / `SLACK_CHANNEL_OPORTUNIDADES` responde 200 con
`slack: "skipped"`. Tipos: `creada` | `cambio_estado` | `ruta_creada` |
`nudge` | `escanear_nudges`. Ver `docs/SLACK.md`.

### `POST /api/v1/csx/slack`
Destacados / upsell / subuso → `#csx`. Body:
`{ "tipo": "paquete_semanal" | "destacados" | "upsell" | "subuso" }`.
Ver `docs/SLACK-CSX.md`.

### `GET /api/v1/panel/snapshot`
Hidrata el panel (rutas, campañas, clientes, vehículos, conductores, servicios).
Con Supabase configurado (sin demo) exige sesión.

### `POST /api/v1/panel/rutas/desde-campana`
Crea ruta desde campaña aceptada. Body: `campanaId`, `modo`, `lineas?`,
`tipoServicio`, `fecha` (ISO|null), `franja`. Idempotency-Key recomendado.

### `POST /api/v1/panel/rutas/:id/agendar` · `/cancelar` · `/tags` · `/asignar-conductor`
Mutaciones del panel sobre una ruta. Idempotency-Key recomendado.

### `POST /api/v1/panel/campanas/:id/estado`
`{ "estado": "valorada" | "enviada" | "aceptada" | … }` sobre el presupuesto ligado.

### `GET /api/v1/conductor/snapshot?conductorId=d1`
Turno + pool + entidades para hidratar la app del conductor.

## Lo que falta y por qué (resumen — ver PREGUNTAS-ABIERTAS.md)

- Auth fina en APIs del conductor (JWT debe coincidir con `conductorId`).
- Escrituras del conductor (check-in, subestado, cola offline) aún no persisten
  todas vía panel/repo en el mismo ciclo que el snapshot.
- Migración UI completa: helpers síncronos de `data.ts` siguen como puente.
