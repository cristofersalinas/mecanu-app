# Mecanu — contexto del proyecto

Panel de taller + modelo de logística. Design system **Mecanu** (bindeado, ver skill).
Idioma: **es-ES, tuteo**. Sin emoji. Dinero `1.234,56 €` con IVA siempre indicado.

## Archivos

| Archivo | Qué es |
|---|---|
| `Mecanu Panel.dc.html` | La app. Único entrypoint. ~6.600 líneas. |
| `mecanu-pipeline.js` | **Config declarativa**: estados, subestados, columnas, tags, presupuestos, reglas. |
| `mecanu-rutas.js` | **Modelo**: construye RUTAS/PARADAS/TRASLADOS/LOGS/PRESUPUESTOS/CAMPAÑAS. Re-exporta los otros dos. |
| `mecanu-data.js` | Entidades base: CLIENTES, VEHICULOS, CONDUCTORES, TEMPARIO, INSPECCIONES_RAW, OPORTUNIDADES_BASE. |
| `mecanu-whatsapp.js` | Simulación de WhatsApp Cloud API para Campañas. |

El panel importa **solo** `mecanu-rutas.js`.

## Modelo

```
RUTA (card del kanban, id TR-*)
 ├── N PARADAS (PD-*)      tipo: cliente | proveedor(taller/itv/chapista/otro)
 ├── N-1 TRASLADOS (TS-*)  rol: ida | vuelta | interno · ventana {fecha,inicio,fin}
 │    └── LOGS (LG-*)      tipo · actor · triggerSource(manual/conductor/api/cron)
 └── PRESUPUESTO (PR-*)    vive en CAMPAÑAS · fuente única
```

- **El estado vive en la RUTA** (6 estados × 3-4 subestados). El TRASLADO tiene su propio estado de ejecución.
- **Vista para la UI**: `RUTAS_VISTA` / `vistaRuta(r)` aplanan tramo activo, ventana, conductor, seguro, presupuesto.
- Volumen: 29 rutas · 70 paradas · 41 traslados · ~290 logs · 40 presupuestos · 11 campañas.

## Decisiones cerradas (NO volver a preguntar)

1. **El total INCLUYE la línea de traslado.** El traslado es un ítem del tempario del taller (`SV-11`), una línea más del presupuesto junto a las reparaciones. TR-1042 = 284,50 reparación + 90 traslados = **374,50 €**.
2. **Un solo dinero.** No separar "importe del traslado" de "presupuesto de reparación". Un bloque "Presupuesto" en la ficha, solo lectura, con desglose por origen.
3. **El presupuesto vive en Campañas**, fuente única. Estados: `nueva → valorada → enviada → aceptada|rechazada|caducada`. Desde Traslados solo se lee.
4. **Líneas con origen visible**: `inspeccion` (icono photo_camera) · `manual` (edit) · `traslado` (local_shipping).
5. **Modo `solo_total`**: el taller borra el desglose y deja la cifra. La ruta se crea igual.
6. **Ids conservados**: los traslados antiguos son ahora rutas con el mismo id (TR-1042…).
7. **Tags**: derivados (calculados, sin borde, no editables) vs manuales (borde de color, persisten en `ruta.tagsManual`).
8. **`contactos` del vehículo son derivados** de la relación m2m vehículo↔clientes. No se duplica el dato.
9. **Campaña aceptada → modal Crear ruta** con 3 salidas (tal cual / editar líneas / solo total), luego tipo + fecha. Con fecha → AGENDADO, sin fecha → PROSPECTOS.
10. **Avance de campaña 100 % manual**, un botón por transición, cada una deja log. Desacoplado a propósito.

## Invariantes (regla dura del design system + producto)

- **Solo Prospectos es arrastrable.** Agendado/En ruta/En taller/Completado avanzan por confirmación de conductor o cliente. Cancelado exige motivo.
- **Los 4 subestados de EN RUTA solo los mueve el conductor** (en el mock, botón "Simular" en la ficha).
- **Ventana horaria**: siempre rango de 1 h, nunca hora exacta. **Si no hay ventana comprometida, no se inventa** — se dice "Pendiente de agendar" o "Propuesta: …".
- **Cobertura de seguro siempre visible** en cualquier vista del viaje.
- **Nada de datos de relleno.** Sin dato → decirlo explícitamente.
- Añadir un estado / subestado / tag / columna = editar **solo** `mecanu-pipeline.js`.
- Sin roles ni permisos todavía. Donde iría el backend: `// TODO API:`.

## Campos marcados `// REVISAR: ubicación provisional`

`ventanaPropuesta` (TRASLADO) · `vehiculoListo` (RUTA) · `incidencia` (RUTA) · `matriculaLead`/`linkToken`/`linkEnviadoEn` (RUTA, se mudarían a una entidad OFERTA).

## Estado

Las 5 fases entregadas y verificadas: modelo, datos, tablero de 6 columnas, ficha extendida, Campañas + Vista Simulada de Cliente. Panel carga sin errores de consola ni holes sin resolver.

## Implementación frontend (Next.js)

Este repo es la implementación en Next.js 15 (App Router, TypeScript strict, Tailwind) del handoff de
diseño construido en Claude Design (formato `.dc.html`). Estructura:

| Ruta | Qué es |
|---|---|
| `src/app/(taller)/panel` | Panel de administración del taller (desktop) |
| `src/app/(conductor)/conductor` | App web del conductor (móvil) |
| `src/app/(backoffice)/backoffice` | Cockpit del dueño: alertas, bandeja, cobertura, dinero, equipo, cron |
| `src/components/ds` | Librería de 47 componentes del design system Mecanu |
| `src/components/taller` | Componentes propios del panel |
| `src/components/conductor` | Componentes propios de la app del conductor |
| `src/components/backoffice` | UI del backoffice (solo `repo`) |
| `src/lib/mecanu` | Capa de datos y modelo (mecanu-data / mecanu-pipeline / mecanu-rutas / mecanu-whatsapp / backoffice), sin backend |
| `src/styles/ds` | Tokens CSS del design system (colores, tipografía, espaciado, radios, elevación, motion, iconos) |

## Landing page pública

Implementada. Snapshot de responsive: tag **`ResponsividadFull`**,
`docs/LANDING-RESPONSIVIDAD-FULL.md`. Copy comercial: `docs/PROPUESTA-VALOR.md`
antes de un claim nuevo en `src/lib/landing/copy.ts`.
