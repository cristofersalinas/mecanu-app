# Propuesta de valor y beneficios — Mecanu

Fuente de verdad comercial. El copy de la landing (`src/lib/landing/copy.ts`,
bloque `close.beneficios`) **elige** de este catálogo; no lo duplica entero.
Cuando el fundador identifique un beneficio nuevo, se anota **aquí primero**
(dolor, prueba, claim permitido) y luego se decide si sube a la web.

Idioma de producto: es-ES, tuteo. Sin emoji. Sin cifras inventadas.

## Cita corta

Mecanu es la capa de logística del taller: recoger el coche en la puerta del
cliente, llevarlo a la nave, devolverlo cuando la OR está cerrada. Conductor
verificado, evidencia en cada trayecto, seguro de RC. El taller sigue
reparando; el cliente no tiene que ir.

## Para quién

Dueño o recepción de taller independiente / cadena multimarca, 3–30 personas,
flujo de particulares. Madrid y Barcelona, radio 40 km. No es para flotas
propias ni para concesionario con logística interna.

## Dolor que ataca (agudo)

1. **La plaza ocupada.** El trabajo está facturado y el coche sigue ahí días.
2. **La coordinación.** “Estuve siete días quedando con el cliente para ver
   cuándo podía traer el auto.” Eso no es servicio: es fricción.
3. **La grúa mal usada.** Pocas, caras, hay que agendar con antelación, y
   el coche a menudo sí circula.
4. **La recepción como centralita.** WhatsApp y llamadas de “¿ya está mi
   coche?” y “¿me lo podéis devolver?”.
5. **La zona gris del seguro.** El RC del taller no cubre el trayecto; el
   del cliente no cubre a quien conduce.

## Catálogo de beneficios

Cada fila: **claim** (cómo se dice) · **ancla** (por qué es creíble) ·
**web** (si está ahora en el CTA de cierre).

### Operación y capacidad

| Claim | Ancla | Web |
|---|---|---|
| Se acabó esperar 7 días a que el cliente pueda traer el coche. Se recoge en su puerta. | Dolor típico de recepción, no media estadística. El producto elimina esa espera: ventana de 1 h y recogida en domicilio. | Sí |
| El cliente se queda en casa o en el trabajo. Tú recuperas plaza y horas de recepción. | Comodidad del cliente + plaza libre el mismo día que cierra la OR. | Sí |
| Más plazas disponibles para reparar el mismo día. | Efecto de devolver el coche terminado en vez de usarlo de parking. | Catálogo |

### Precio y disponibilidad vs grúa

| Claim | Ancla | Web |
|---|---|---|
| Más barato que una grúa, y con mejor disponibilidad: no hace falta agendar con días de antelación. | Grúa = camión + operario + escasez urbana. Mecanu mueve coches que circulan, con conductor, en ventana de 1 h. **No sustituye** la grúa si el coche no arranca. | Sí |

### Garantía y seguro

| Claim | Ancla | Web |
|---|---|---|
| Flota externa 100 % con seguro. Si pasa algo en el trayecto, lo cubre Mecanu. | Conductores verificados bajo demanda; RC de custodia activa de llaves a firma. | Sí |
| Seguro de RC flexible: para el taller o por traslado. | Dos modos de cobertura, no un único paquete rígido. | Sí |
| Cobertura y evidencia en cada traslado (fotos + firma). | Check-in / check-out documentado. | JSON-LD / FAQ |

### Features de producto (no solo “la plataforma”)

| Claim | Ancla | Web |
|---|---|---|
| Check-in con inspección visual: hasta 20 puntos registrados. | Capacidad del flujo de inspección del conductor. | Sí |
| CRM con WhatsApp: automatiza la atención al cliente y ahorra horas de llamadas. | Campañas y recordatorios desde hallazgos, no un chat genérico. | Sí |
| Predicción inteligente de próximos servicios y avisos al cliente. | Los hallazgos de la inspección alimentan recordatorios de mantenimiento. Palabras de posicionamiento: automatización, servicio al cliente, predicción. No vender “IA mágica” si el motor es reglas + historial. | Sí |
| Ventana horaria de 1 h, nunca hora exacta. | Invariante de producto. | Cómo funciona |
| Estado visible 24/7 (conductor, fotos, firma). | Panel del taller. | Cómo funciona |
| Tu equipo o flota externa, cuando haga falta. | Pico de trabajo sin nómina fija. | Pico de trabajo |

## Qué no decir

- Cifras de ahorro en € u horas **sin** medición (nada de “ahorras 12 h/semana”
  hasta tener dato de talleres reales).
- Que Mecanu repara, pasa la ITV en el portal, o sustituye a Autel / GT Motive.
- Que sustituye a la grúa en siniestros o coches inmovilizados.
- “IA” como badge vacío. Si se usa, atarlo a predicción de servicio a partir
  de la inspección.

## Dónde vive cada capa de copy

| Superficie | Archivo |
|---|---|
| CTA de cierre (lista visible) | `src/lib/landing/copy.ts` → `close.beneficios` |
| FAQ pública + rich results | `src/lib/landing/faq.ts` |
| JSON-LD `featureList` | `src/components/landing/JsonLd.tsx` |
| Cita para LLMs | `public/llms.txt`, `public/llms-full.txt` |
| Tarjetas numéricas (bloque stats) | `src/lib/landing/copy.ts` → `stats` |

## Tarjetas numéricas (landing, bloque stats)

Tres claims visibles con cifra grande. Las imágenes no cambian; solo valor + etiqueta + texto.

| Valor | Etiqueta | Claim | Ancla |
|---|---|---|---|
| 7 días | Sin esperar al cliente | Se acabó la semana típica coordinando cuándo trae el coche. | Dolor de recepción (catálogo), no media medida. |
| 50% | Menos que una grúa | Más barato, asegurado y disponible el mismo día en traslados urbanos con coche circulando. | **Pendiente validar** con comparativa real grúa vs Mecanu. No sustituye grúa si no arranca. |
| +1 plaza | Capacidad al día | Devolver el coche terminado el mismo día libera una plaza para otra OR. | Efecto operativo, no % de ingresos medido. |

**No usar** en stats: “+20% ingresos”, “ahorras X h/semana” u otras cifras sin dato de talleres reales.
