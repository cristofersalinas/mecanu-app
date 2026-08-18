# Estado del loop — app del conductor (ronda 2)

Última actualización: 2026-08-11
Iteración completada: **2 de 3**

## Puntuación actual

C1 **100**/100 · C2 **100**/100 · C3 **89**/100 · C4 **95**/100 · C5 **95**/100 · C6 **100**/100

**Cinco de seis en 90 o más.** No escribo "LOOP COMPLETADO": C3 se queda en 89
por un motivo concreto y honesto, explicado abajo.

### C1 · Densidad y jerarquía — 100
6 traslados sin scroll (último borde 743 px de 756) · 88 px antes del primero ·
6 datos por card · 0 redundantes · 0 datos sin acción · banner solo si no está
sincronizado · cabecera solo con métrica y SOS · métrica "Disponibles" (ahora
marca 2) · todo lo demás en Nivel 2.

### C2 · Reglas de negocio — 100 · las 10 ejercitadas
| Regla | Cómo se comprobó |
|---|---|
| R1 | Botón "Iniciar viaje" deshabilitado + "Termina el Kia Ceed primero" |
| R2 | El de sin fecha vive en colapsable; 6 cards en agenda, no 7 |
| R3 | Medido card a card: máximo 1 estado por card, nunca dos |
| R4 | Wizard abre con pie bloqueado y "Te faltan 4 fotos, el vídeo y el combustible" |
| R5 | Banda naranja + "Reagendar" a 1 click |
| R6 | Menú con las 4 solicitudes, cada una con motivos |
| R7 | Sin otra vía de mover EN RUTA en toda la interfaz |
| R8 | Diálogo: "2276 JVN · Kia Ceed ya ocupa hoy de 15:15 a 16:15…" · Cancelar no toma |
| R9 | 0 cards con texto de seguro; solo icono |
| R10 | Offline → "1 cambio(s) en cola" · reconectar → "Todo sincronizado" |

### C3 · Flujos y clicks — 89
**Flujos 6,5 de 8 (45 pts).** Completos: F3, F4, F5, F6, F7, F8.
**F1 recogida: verificado hasta el gate**, no hasta el sellado — la vista previa
del navegador no concede permiso de cámara, así que no se pueden hacer las 4
fotos. No es un fallo de la app: la pantalla de permiso denegado aparece con su
copy correcto y su botón de reintento. **F2 devolución: no ejercitado**, porque
cuelga de F1.

**Clicks 44 de 44.** Ninguno subió; tres bajaron.
| Acción | Tope | Antes | Ahora |
|---|---|---|---|
| Abrir Maps con la ruta lista | ≤1 | 2 | **1** |
| Llamar al cliente | ≤1 | 1 | **1** |
| Iniciar traslado | ≤2 | 2 | **1** |
| Pedir reagendar | ≤2 | 2 | **1** |
| Reportar incidencia | ≤1 | 2 | **1** |

### C4 · Cobertura — 95
11 de 13 vistas auditadas (25). Sin auditar: inspección pág. 2 y entrega+firma,
por la misma razón que F1. 0 hallazgos [A] sin resolver (30) · todos con
categoría y veredicto (20) · [C] con recomendación (20).

### C5 · Permisos y riesgo — 95
Matriz tal cual (30) · confirmación en toda acción de riesgo (25) · 0
irreversibles a un toque (20) · `tel:` y Maps con destino cargado (15) ·
limpieza recontada solo en parte (5).

### C6 · Feedback, continuidad y campo — 100
FLIP + flash 2,6 s (25) · estados distinguibles sin leer (20) · **latencia
medida: 5,1 ms y 7,6 ms** (20) · **0 objetivos <48 px** (15) · **74 textos
medidos, 0 con contraste <4,5:1** (10) · ninguna acción a dos manos (10).

## Tabla de números de la última medición

- Traslados visibles sin scroll: **6** · Altura antes del 1º: **88 px**
- Datos por card: **6** · Redundantes: **0**
- Reglas que pasan: **10/10**
- Flujos que se completan: **6,5/8** (F1 parcial, F2 sin ejercitar)
- Vistas auditadas: **11/13** · Hallazgos: **4 [A]** · 0 [B] · 6 [C]
- Hallazgos [A] sin resolver: **0**
- Objetivos táctiles <48 px: **0** · Contrastes <4,5:1: **0 de 74**
- Latencia de feedback: **5,1 ms / 7,6 ms**

## Qué hice en esta iteración

Solo medir y auditar, sin reescribir — salvo un arreglo obligado:

**[A] Hallazgo nuevo, resuelto: la bolsa de disponibles estaba vacía.** El pool
se construía filtrando el dataset por franja 8-18 de lunes a viernes, y con los
datos actuales no quedaba ningún candidato: la métrica de cabecera marcaba 0 y
**R8 y F6 no se podían ejercitar**. Añadí una lista `POOL` explícita con dos
traslados libres: uno que solapa con la agenda (para R8) y otro limpio (para
F6). Ahora la cabecera marca 2.

## Qué falla ahora mismo y por qué

**Una sola cosa: F1 y F2 necesitan una cámara real.** La vista previa del
navegador no concede permiso, así que el check-in no se puede sellar y la
devolución no se puede alcanzar. Todo lo demás está medido.

## Siguiente paso planificado

**Iteración 3 — probar en un teléfono con cámara.** Recorrer F1 de punta a punta
(4 fotos, vídeo, km, combustible, testigos, sellado) y F2 (2 fotos + firma).
Con eso C3 sube a 100 y C4 a 100. Es lo único que separa la ronda del cierre.

Antes conviene decidir los [C] 1 y 6: afectan al peso de la evidencia.

## Hallazgos [A] pendientes

Ninguno. Los 4 de la ronda están resueltos:
1. Foto en `src` con hueco sin resolver rompía la carga — resuelto.
2. Copy sin concordancia de número — resuelto.
3. Objetivo táctil de 46 px en la card activa — resuelto.
4. Bolsa de disponibles vacía, R8 y F6 no ejercitables — resuelto.

## Hallazgos [C] para decisión del PO

1. **Vídeo obligatorio en toda recogida** — 30 s son ~25 MB. Con 9 traslados y
   sin wifi es mucha cola. *Recomiendo* exigirlo solo en vehículos de más de 10
   años o valor declarado alto.
2. **Testigo rojo bloquea, pero el taller puede tardar** — el conductor queda
   parado sin plazo. *Recomiendo* un tiempo máximo de respuesta y una salida que
   escale a la central.
3. **Kilometraje a la baja solo avisa, no bloquea** — es lo correcto, pero el
   panel debería marcarlo en rojo.
4. **La inspección se repite en cada recogida** — para un cliente recurrente es
   lo mismo cada mes. *Recomiendo* prellenar con la última y pedir confirmación
   solo de los ítems que estaban en nivel 2 o superior.
5. **Nota de voz sin transcripción** — el taller la escucha entera.
   *Recomiendo* transcribir en servidor y guardar ambas.
6. **Sin foto de ejemplo, el encuadre queda al criterio de cada conductor** —
   *recomiendo* una silueta guía superpuesta en la cámara: no es una foto de
   galería y no contamina la evidencia.

## CAMBIOS NECESARIOS EN EL PANEL DEL TALLER

1. **Bandeja de solicitudes del conductor.** Tipos: `reagenda`, `rechazo`,
   `fallido_origen`, `no_rodante`. Payload:
   `{ tipo, trasladoId, rutaId, conductorId, motivo, ventanaActual, conflictoCon,
   evidenciaIds, creadoEn, origen:'conductor' }`. Lo piden F4 y la Parte 4.
2. **Testigo rojo → decisión de no rodante.** Llega como propuesta con evidencia
   sellada; hasta que el taller responda, el conductor no arranca.
3. **Kilometraje al vehículo**, no al traslado. El panel debe aceptar la
   escritura en la ficha.
4. **Hallazgos a Campañas.** Ítems en nivel 2-4, testigos ámbar e ITV a menos de
   60 días, cada uno con su horizonte.
5. **Evidencia sellada e inmutable.** Hora, GPS, id de traslado y conductor. El
   panel muestra el sello y no permite editar ni borrar.
6. **Refresco de estado en vivo.** "Entregar en taller" → EN TALLER; firma de
   devolución → COMPLETADO.
7. **Bolsa de traslados disponibles.** El panel decide qué deja libre; hoy la app
   lo simula con una lista fija.
8. **Enmascarado para red externa.** Teléfono y dirección exacta ocultos hasta
   que el conductor externo inicia el viaje.

## Archivos tocados

- `Mecanu Conductor.dc.html` — reescrito en 6 tramos + arreglo de la bolsa.
- `LOOP-ESTADO.md` — este archivo.
- `MODELO.md` — R1-R10, matriz de permisos y escala de inspección.
