# Modelo de datos — propuesta para PostgreSQL / Supabase

Traduce `MODELO.md` (el modelo de negocio, ya cerrado y verificado) a tablas,
columnas, tipos, relaciones e índices. Es una **propuesta**, no una migración
ejecutada — quien construya el backend real la revisa, ajusta y la convierte en
archivos `.sql` versionados en `supabase/migrations/` (ver `AGENTS.md`).

Cada tabla indica qué columnas vienen de una **decisión de producto cerrada**
(documentada en `CLAUDE.md`/`MODELO.md`, no negociable) frente a las que son una
**inferencia razonable del código** (el schema Zod en `src/lib/mecanu/types.ts` lo
implica, pero nadie lo decidió explícitamente como columna de base de datos — hay
margen de criterio al implementarla). Las marcadas `// REVISAR` en el modelo
original (`ventanaPropuesta`, `vehiculoListo`, `incidencia`, `matriculaLead`/
`linkToken`/`linkEnviadoEn`) se listan con su ubicación provisional intacta —
moverlas a una tabla `ofertas` es una decisión pendiente, no tomada aquí.

## Convenciones generales

- Toda tabla tiene `id text primary key` con el prefijo del dominio original
  (`TR-*`, `PD-*`, `TS-*`, `LG-*`, `PR-*`) para no romper continuidad con los datos
  de ejemplo — **decisión cerrada** (`MODELO.md` §7: "Ids conservados").
- Toda tabla de negocio tiene `created_at timestamptz not null default now()` y
  `updated_at timestamptz not null default now()` (trigger de actualización
  estándar) aunque el modelo original no siempre las nombre así — **inferencia**:
  necesarias para auditoría/sync, no estaban en el modelo en memoria porque ahí
  todo es efímero.
- Dinero: `numeric(10,2)`, nunca `float`. — **inferencia** (estándar para importes).
- Todo enum de estado es un `text` con `check` constraint apuntando a los valores de
  `mecanu-pipeline.ts`, NO un enum nativo de Postgres — **decisión de diseño**: los
  estados/subestados/tags son config declarativa editable (`MODELO.md`: "Añadir un
  estado/subestado/tag/columna = editar solo mecanu-pipeline.js"); un `enum` nativo
  de Postgres requiere una migración para añadir un valor, un `check` constraint es
  una migración igual de simple pero dice la intención correctamente: esto es
  config de producto, no un tipo del lenguaje.

## `clientes`
**Decisiones cerradas**: RGPD — teléfono/dirección se enmascaran en la UI hasta que
la tarea lo requiera (`maskTel`, `maskDireccion` en `mecanu-data.ts`); eso es lógica
de presentación, no de esta tabla (aquí se guarda el dato real).

| Columna | Tipo | Notas |
|---|---|---|
| id | text pk | `c1`, `c2`... |
| nombre | text not null | |
| tipo | text not null check in ('Particular','Empresa') | |
| telefono | text not null | |
| email | text not null | |
| direccion | text not null | dirección completa; barrio/ciudad se derivan (ver `localizarDireccion`), no se duplican — **decisión cerrada** (`MODELO.md` §2: "el barrio se deriva de la dirección") |
| desde | timestamptz not null | alta del cliente |

## `vehiculos`
| Columna | Tipo | Notas |
|---|---|---|
| id | text pk | `v1`, `v2`... |
| marca | text not null | |
| modelo | text not null | |
| anio | int not null | |
| matricula | text not null unique | normalizada sin espacios para búsqueda, ver `normalizePlate` — **inferencia**: añadir columna generada `matricula_normalizada text generated always as (upper(replace(matricula,' ',''))) stored` con índice, para la búsqueda fuzzy/tolerante a tipeo (`buscarMatricula`) |
| km | int not null | vive en el vehículo, no en el traslado — **decisión cerrada** (HANDOFF §7.2) |
| color | text not null | |

## `vehiculo_clientes` (m2m)
**Decisión cerrada** (`MODELO.md` §2, §7): `contactos` del vehículo son
**derivados** de esta relación — nunca se duplica el dato en otra tabla.

| Columna | Tipo | Notas |
|---|---|---|
| vehiculo_id | text fk → vehiculos.id | |
| cliente_id | text fk → clientes.id | |
| relacion | text not null | "Titular", "Cónyuge", "Autorizada"... texto libre en el mock |
| principal | boolean not null default false | |
| | | `primary key (vehiculo_id, cliente_id)` |

## `conductores`
| Columna | Tipo | Notas |
|---|---|---|
| id | text pk | `d1`... |
| nombre | text not null | |
| telefono | text not null | |
| red | text not null check in ('Interna','Externo Mecanu') | **decisión cerrada**: solo interna aparece en Flota (CONTEXTO-CHAT.md), externa sí en Contactos |
| furgoneta | text | |
| proceso | text not null check in ('documentos_pendientes','en_supervision','activo') | onboarding |
| supervisados | int not null default 0 | |
| requeridos | int not null default 0 | |
| alta | timestamptz not null | |
| calificacion | numeric(2,1) | |
| valoraciones | int not null default 0 | |
| docs_dni / docs_carnet / docs_iban / docs_seguro | boolean not null default false | o una tabla `conductor_documentos` aparte si el set de documentos crece — **inferencia**, hoy es un objeto fijo de 4 booleans en el mock |

## `conductor_incidencias`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk default gen_random_uuid() | no tenía id propio en el mock — **inferencia** |
| conductor_id | text fk → conductores.id | |
| fecha | timestamptz not null | |
| tipo | text not null | |
| gravedad | text not null | |
| detalle | text not null | |

## `servicios` (tempario)
| Columna | Tipo | Notas |
|---|---|---|
| id | text pk | `SV-01`... `SV-11` es el traslado — **decisión cerrada** (`SERVICIO_TRASLADO_ID`) |
| nombre | text not null | |
| categoria | text not null | |
| horas | numeric(4,2) not null | |
| mano_obra | numeric(10,2) not null | |
| materiales | numeric(10,2) not null | |
| aplica | text[] not null | tipos de vehículo |
| garantia | text | |
| notas | text | |

`total`/`total_iva` NO se guardan como columnas — son derivados (`mano_obra +
materiales`, `* (1 + IVA)`) y deben calcularse en la query o en una vista, para que
un cambio de tarifa de IVA no deje datos desincronizados. **Decisión de diseño**
basada en que el modelo en memoria ya los trata como derivados (`SERVICIOS =
SERVICIOS_RAW.map(...)`).

## `rutas`
El núcleo del modelo (`MODELO.md` §3). El estado del negocio vive aquí, no en el
traslado — **decisión cerrada**, la más importante de todo el schema.

| Columna | Tipo | Notas |
|---|---|---|
| id | text pk | `TR-1042`... — **decisión cerrada**: ids conservados de los traslados antiguos |
| vehiculo_id | text fk → vehiculos.id, nullable | null en prospectos sin matrícula confirmada |
| cliente_id | text fk → clientes.id, nullable | idem |
| perfil_servicio | text | `estimable`/`mismo_dia`/`abierto` — clasificación interna del mock, **inferencia**, revisar si sigue siendo útil sin el generador de datos sintéticos |
| estado | text not null check in ('prospectos','agendado','en_ruta','en_taller','completado','cancelado') | **decisión cerrada**: la lista viene de `mecanu-pipeline.ts ESTADOS`, cualquier cambio ahí debe reflejarse aquí |
| subestado | text not null | validar contra `SUBESTADO[estado.subestado]` en la capa de aplicación, no con un check SQL (la combinación válida depende del estado, ver nota de enums arriba) |
| tags_manual | text[] not null default '{}' | **decisión cerrada**: los derivados NUNCA se guardan aquí, se calculan en cada lectura desde `tags_derivados` en código |
| cliente_tiene_auto | boolean | nullable = desconocido, no false |
| vehiculo_listo | boolean | `// REVISAR: ubicación provisional` en el modelo original — se queda aquí por ahora |
| campana_origen_id | text fk → campanas.id, nullable | |
| presupuesto_id | text fk → presupuestos.id | **decisión cerrada**: 1:1, el presupuesto vive en Campañas pero cada ruta tiene el suyo |
| motivo | text | motivo de cancelación — **decisión cerrada**: obligatorio si `estado = 'cancelado'`, validar en la capa de aplicación (un check constraint condicional es posible en Postgres con `check (estado <> 'cancelado' or motivo is not null)`) |
| cancelada_en | timestamptz | |
| incidencia | text | `// REVISAR: ubicación provisional` |
| matricula_lead | text | `// REVISAR` — se mudaría a `ofertas` |
| link_token | text | `// REVISAR` — idem |
| link_enviado_en | timestamptz | idem |
| creada_en | timestamptz not null | |

Índices: `(estado, subestado)` para el kanban, `(vehiculo_id)`, `(cliente_id)`.

## `paradas`
| Columna | Tipo | Notas |
|---|---|---|
| id | text pk | `PD-1042-1`... |
| ruta_id | text fk → rutas.id not null | |
| orden | int not null | |
| tipo | text not null check in ('cliente','proveedor') | |
| subtipo | text check in ('taller','itv','chapista','otro') | solo si tipo='proveedor' |
| direccion | text | nullable — **decisión cerrada**: "sin dato → decirlo explícitamente, nunca relleno" |
| localidad | text | derivado de direccion, se puede recalcular con un trigger o guardar en el insert |
| sublocalidad | text | idem |
| llegada_real | timestamptz | |
| salida_real | timestamptz | |

`etiqueta` NO se guarda — es derivada (`etiquetaParada()`), depende de tipo/subtipo,
recalcularla en código es más seguro que dejarla desincronizarse.

## `parada_servicios`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| parada_id | text fk → paradas.id | |
| descripcion | text not null | |

## `traslados` (tramos)
**Decisión cerrada**: estado de ejecución propio, independiente del estado de la
ruta.

| Columna | Tipo | Notas |
|---|---|---|
| id | text pk | `TS-1042-1`... |
| ruta_id | text fk → rutas.id not null | |
| orden | int not null | |
| rol | text not null check in ('ida','vuelta','interno') | |
| parada_origen_id | text fk → paradas.id | |
| parada_destino_id | text fk → paradas.id | |
| conductor_id | text fk → conductores.id, nullable | |
| ventana_fecha | date | **decisión cerrada**: ventana SIEMPRE rango de 1h, nunca hora exacta |
| ventana_inicio | text (HH:MM) | |
| ventana_fin | text (HH:MM) | inicio + 1h, validar en aplicación |
| ventana_propuesta_fecha/inicio/fin | mismas columnas, prefijo `propuesta_` | `// REVISAR: ubicación provisional` |
| ventana_modo | text check in ('slots_cliente','propuesta_taller','fija_taller') | |
| cliente_confirmo | boolean | nullable |
| estado | text not null check in ('sin_agenda','agendado','en_curso','completado','cancelado') | |
| subestado | text | solo relevante si estado='en_curso'; **decisión cerrada** — solo el conductor lo mueve, la API debe verificarlo (ver CONTRATOS-API.md) |
| seguro | boolean not null default false | **decisión cerrada**: cobertura siempre visible en la UI, este es el dato fuente |
| importe | numeric(10,2) not null | línea de traslado del presupuesto — **decisión cerrada**: el total del presupuesto SIEMPRE la incluye |
| reprogramaciones | int not null default 0 | alimenta el tag `inestable` |

Índice: `(conductor_id, ventana_fecha)` para detectar solapes (`conflictoConductor`).

## `logs`
| Columna | Tipo | Notas |
|---|---|---|
| id | text pk | `LG-0001`... |
| traslado_id | text fk → traslados.id not null | |
| tipo | text not null check in ('cambio_estado','gps','evidencia','comunicacion','incidencia','nota') | |
| ts | timestamptz not null | |
| actor | text not null | nombre o "Sistema" |
| trigger_source | text not null check in ('manual','conductor','api','cron') | |
| payload | jsonb | `{a, texto, detalle, motivo, canal, tipoEvidencia, rutaId}` — jsonb porque el payload varía por tipo, no vale la pena una tabla por tipo de log |

Índice: `(traslado_id, ts)`.

## `presupuestos`
**Decisión cerrada, la más importante del dinero**: fuente única de verdad, vive
conceptualmente en Campañas; el total SIEMPRE incluye la línea de traslado, nunca
se separa "traslado" de "reparación".

| Columna | Tipo | Notas |
|---|---|---|
| id | text pk | `PR-TR-1042`... |
| campana_id | text fk → campanas.id, nullable | |
| vehiculo_id | text fk → vehiculos.id, nullable | |
| ruta_origen_id | text fk → rutas.id, nullable | |
| ruta_generada_id | text fk → rutas.id, nullable | |
| modo | text not null check in ('detallado','solo_total') | **decisión cerrada**: el taller puede borrar el desglose |
| estado | text not null check in ('nueva','valorada','enviada','aceptada','rechazada','caducada') | **decisión cerrada**: transición 100% manual, cada una deja un log |
| iva_incluido | boolean not null default true | |
| total | numeric(10,2) not null | suma de líneas — considerar columna generada o recalcular siempre en query, no confiar en que el cliente la mande correcta |

## `presupuesto_lineas`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| presupuesto_id | text fk → presupuestos.id not null | |
| descripcion | text not null | |
| importe | numeric(10,2) not null | |
| origen | text not null check in ('inspeccion','manual','traslado') | **decisión cerrada**: origen siempre visible con su icono |
| servicio_tempario_id | text fk → servicios.id, nullable | |

## `campanas`
| Columna | Tipo | Notas |
|---|---|---|
| id | text pk | `OP-3001`/`CMP-3008`... — dos prefijos distintos en el mock (oportunidades auto-detectadas vs. creadas a mano); **inferencia**: unificar a un solo prefijo en producción, no hay razón de negocio para mantener dos |
| cliente_id | text fk → clientes.id | |
| vehiculo_id | text fk → vehiculos.id | |
| ruta_origen_id | text fk → rutas.id, nullable | qué ruta/check-in la generó |
| ruta_generada_id | text fk → rutas.id, nullable | qué ruta creó al aceptarse |
| inspeccion_id | text fk → inspecciones.id, nullable | |
| falla | text not null | resumen legible |
| evidencia | text not null | |
| urgente | boolean not null default false | |
| fecha | timestamptz not null | fecha recomendada |
| foto_url | text | |
| origen_automatico | boolean not null default false | true si vino de una inspección |

`presupuesto_id`/`presupuesto` no son columnas — la relación es
`presupuestos.campana_id`, no al revés (una campaña tiene un presupuesto, evitar
duplicar la FK en ambos sentidos).

## `campana_items`
| Columna | Tipo | Notas |
|---|---|---|
| id | text pk | `OP-3001-1`... |
| campana_id | text fk → campanas.id not null | |
| tipo | text not null | `neumaticos`, `frenos`... — catálogo en `CATALOGO_DETECCION` |
| origen | text not null check in ('confirmado','estimado') | rojo vs ámbar en la UI |
| dias | int not null | días hasta la fecha recomendada |
| falla | text not null | |
| registro_idx | int not null default 0 | |
| datos | jsonb | shape libre por tipo (posición, vidaPct, mm...) |
| servicio_id | text fk → servicios.id, nullable | |
| valor | numeric(10,2) not null | |

## `inspecciones`
| Columna | Tipo | Notas |
|---|---|---|
| id | text pk | `CHK-9920`... |
| tipo | text not null check in ('check-in','check-out') | |
| ruta_id | text fk → rutas.id not null | |
| traslado_id | text fk → traslados.id | |
| fecha | timestamptz not null | |
| inspector_id | text fk → conductores.id | |
| km | int not null | |
| combustible | text not null | |
| combustible_pct | int not null | |
| limpieza | text not null | |
| vin | text | |
| itv_estado | text | |
| itv_vence | date | |
| firma_cliente | text | data URL o (mejor en real) URL a storage |
| firma_conductor | text | idem |

**Evidencia sellada e inmutable** (HANDOFF.md §3.2): en producción, una vez creada
una fila de `inspecciones` no debería permitir `UPDATE` desde la aplicación — un
`REVOKE UPDATE` a nivel de rol o una política RLS que solo permita `INSERT` es la
forma correcta de aplicar esto a nivel de base de datos, no solo en la UI.

## `inspeccion_danos`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| inspeccion_id | text fk → inspecciones.id | |
| zona | text not null | |
| tipo | text not null | |
| descripcion | text not null | |
| ubicacion | text not null | |
| foto_url | text | |

## `inspeccion_hallazgos`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| inspeccion_id | text fk → inspecciones.id | |
| categoria | text not null | |
| item | text not null | |
| metrica | text not null | |
| severidad | text not null check in ('ok','warning','danger') | |
| servicio_nombre | text | del catálogo de tempario en el momento de la inspección — texto libre, no FK, porque el precio pudo cambiar desde entonces |
| servicio_precio | numeric(10,2) | idem |
| foto_url | text | |

## `solicitudes` (HANDOFF.md §7.3 — decidida, no construida en el prototipo)
La única tabla que este bloque de trabajo modela desde cero, sin un equivalente en
el mock original más allá del shape documentado en `HANDOFF.md`.

| Columna | Tipo | Notas |
|---|---|---|
| id | text pk o uuid | |
| traslado_id | text fk → traslados.id not null | |
| ruta_id | text fk → rutas.id not null | |
| conductor_id | text fk → conductores.id not null | |
| tipo | text not null check in ('reagenda','rechazo','fallido_origen','no_rodante') | |
| motivo | text not null | de una lista cerrada por tipo — la lista vive en código (`MOTIVOS`), no en esta tabla |
| nota | text | texto libre opcional |
| ts | timestamptz not null default now() | |
| estado | text not null check in ('pendiente','resuelta_reagenda','resuelta_reasignada','resuelta_cancelada','descartada') | |
| resolucion | text | texto que el conductor lee |
| resuelta_en | timestamptz | |

## Índices adicionales recomendados
- `rutas (estado, subestado)` — el kanban filtra por esto constantemente.
- `vehiculos (matricula_normalizada)` — búsqueda tolerante a tipeo.
- `logs (traslado_id, ts desc)` — el timeline de actividad siempre pide "más reciente primero".
- `solicitudes (estado)` donde `estado = 'pendiente'` (índice parcial) — la bandeja del taller filtra por esto en cada carga.

## Lo que NO está en este documento
Autenticación/roles/permisos (no existen en el modelo actual, ver `PREGUNTAS-ABIERTAS.md`),
políticas RLS concretas (dependen de cómo se modele multi-tenant si Mecanu sirve a
más de un taller — hoy todo el mock asume un único taller, "Talleres Rodríguez").
