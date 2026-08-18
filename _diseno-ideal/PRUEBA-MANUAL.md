# Prueba de usuario manual — app del conductor

Objetivo de esta sesión: **cerrar lo único que no se puede medir desde el
navegador de escritorio** — el check-in con cámara real y la devolución con
firma. Todo lo demás ya está verificado; si te sobra tiempo, los bloques C a J
son confirmación en condiciones reales, no descubrimiento.

Ponte en el papel: eres Javier Molina, conductor, de pie en la calle, con prisa,
una mano ocupada y sol en la pantalla.

---

## 0 · Antes de empezar

**Requisito técnico:** la cámara y el micrófono solo funcionan si abres la app
por **https** o desde **localhost**. Por http plano el navegador deniega el
permiso sin preguntar y verás la pantalla de "Sin permiso de cámara" — que es
correcta, pero te impide probar F1.

- Teléfono real, no simulador. Chrome o Safari.
- Concede permiso de **cámara**, **micrófono** y **ubicación** cuando los pida.
- Sal a la calle, a ser posible con sol directo. Si puedes, ponte guantes finos.
- Ten a mano un coche cualquiera, aunque no sea de la flota: necesitas algo que
  fotografiar y rodear.
- Lleva papel y boli, o notas de voz. **No confíes en la memoria**: lo que no
  anotas en el momento se pierde.

**Cómo anotar cada fallo.** Tres líneas, sin más:
1. Dónde estabas (pantalla y traslado).
2. Qué hiciste.
3. Qué esperabas y qué pasó en su lugar.

Y una cuarta si aplica: **¿te bloqueó?** Si no pudiste seguir trabajando, márcalo
con una estrella. Eso es lo que arreglo primero.

---

## BLOQUE A · Recogida completa (prioridad máxima)

Este es el flujo que falta medir. Tómatelo con calma y anota tiempos.

**Traslado:** el que aparece fijado arriba en la card oscura.

1. Pulsa **"He llegado"** en la card oscura.
   → Debe cambiar el estado y aparecer un aviso abajo con opción de deshacer.
2. Pulsa **"Check-in"**.
   → Se abre a pantalla completa, "Check-in · paso 1 de 2", pie bloqueado.
3. Toca el hueco **"Frontal"**.
   → Se abre la cámara con un rótulo explicando qué encuadrar.
4. Haz las **4 fotos**: frontal, trasera, lateral izquierda, lateral derecha.
   → Cada una vuelve al paso 1 y deja el hueco con la miniatura y "sellada".
5. Añade **una foto extra**.
6. Pulsa **"Grabar vídeo del vehículo"** y da una vuelta completa al coche.
   → Contador en rojo, se corta solo a los 30 s. Prueba también **detenerlo tú**
     antes de tiempo.
7. Escribe el **kilometraje**. Pon primero un número **más bajo** que el de la
   ficha y sigue: debe salir un diálogo pidiéndote que lo compruebes.
8. Elige **nivel de combustible**.
9. **No toques ningún testigo** (eso es el bloque C).
10. Pulsa **"Continuar a la inspección"**.
11. Responde los **6 ítems** y las **4 ruedas** tocando el diagrama.
12. Pon una **fecha de ITV** próxima (menos de 2 meses) y comprueba que avisa.
13. Escribe una nota y **graba una nota de voz**: inicia, mira el contador,
    detén, reprodúcela, bórrala, grábala otra vez.
14. Pulsa **"Sellar y salir a ruta"**.
    → El traslado pasa a "En tránsito" y vuelves a la lista.
15. Sigue hasta el final: **"He llegado"** → **"Entregar en el taller"** → 2
    fotos → confirmar.

**Qué mirar con lupa en este bloque:**
- ¿Cuánto tarda el check-in completo, de reloj? Apunta el número.
- ¿Se ve la pantalla con sol? ¿Y los huecos de foto vacíos?
- ¿Puedes hacer las 4 fotos **con una sola mano**?
- ¿El encuadre te queda claro sin foto de ejemplo, o dudas?
- ¿Alguna foto sale girada, borrosa o al revés?
- ¿El diagrama de las ruedas se entiende sin leer? ¿Aciertas la rueda que
  quieres tocar a la primera, o fallas y das a la de al lado?
- ¿El paso 2 se hace largo? ¿En qué ítem te cansas?

---

## BLOQUE B · Devolución al cliente con firma (prioridad máxima)

**Traslado:** uno cuyo rol sea **"Devolución ↑"** (flecha hacia arriba).

1. Llévalo hasta el final: iniciar → he llegado → check-in → tránsito → he
   llegado al destino.
2. Pulsa **"Entregar y firmar"**.
3. Haz las **2 fotos**.
4. **Pásale el teléfono a otra persona** para que firme. Esto es importante: no
   firmes tú. Quieres ver si un desconocido entiende qué hacer sin que se lo
   expliques.
5. Prueba **"Borrar"** y que vuelva a firmar.
6. Confirma.

**Qué mirar:**
- ¿La persona que firma entiende dónde firmar sin instrucciones?
- ¿El trazo sigue al dedo o va con retraso?
- ¿Se puede firmar cómodamente con el teléfono en horizontal? ¿Y en vertical?
- ¿El botón de confirmar queda tapado por el teclado o por la mano?

---

## BLOQUE C · Testigo rojo

1. Empieza un check-in nuevo.
2. Completa fotos, vídeo, km y combustible.
3. Toca un testigo **rojo** (temperatura, aceite, frenos o airbag).
   → Debe salir un aviso de que no podrás iniciar la marcha.
4. Sella.
   → Se abre la hoja para **proponer no rodante** al taller.
5. Elige un motivo y envía.
6. Vuelve al traslado.
   → El botón de avanzar debe estar **bloqueado**, con el motivo escrito.

**Qué mirar:** ¿queda claro que **tú informas y el taller decide**? ¿O parece que
tú has cancelado el traslado? ¿Sabes qué hacer mientras esperas?

---

## BLOQUE D · Sin conexión

Hazlo **de verdad**, en modo avión, no con el simulador de la app.

1. Pon el teléfono en **modo avión** a mitad de un check-in.
2. Termina el check-in completo.
   → No debe bloquearte en ningún momento.
3. Cambia de estado un par de veces más.
   → Arriba debe verse la barra con lo que queda en cola.
4. Quita el modo avión.
   → Debe sincronizar solo y avisarte de que ya está.
5. Repite pero **cierra la app** antes de recuperar señal, y vuelve a abrirla.

**Qué mirar:** ¿confías en que no se ha perdido nada? ¿Se entiende la barra de
arriba? Si cerraste la app, ¿seguían ahí las fotos?

---

## BLOQUE E · No puedes llevar dos coches a la vez

1. Con un traslado en ruta, abre **otro** de la lista.
2. Intenta iniciarlo.
   → Botón apagado + una línea diciendo qué coche tienes que terminar primero.

**Qué mirar:** ¿lo entiendes sin que nadie te lo explique? ¿Te molesta o te
parece razonable? ¿Echas de menos un atajo para volver al coche activo?

---

## BLOQUE F · Vas justo de tiempo

1. Busca en la lista una card con **banda naranja** y "Vas justo".
2. Pulsa **"Reagendar"** desde la propia lista.
3. Elige un motivo y envía.
   → La card debe pasar a "Reagenda pedida".

**Qué mirar:** ¿el aviso de riesgo llega **antes** de que sea tarde? ¿Entiendes
que el taller tiene que confirmar, y que la hora no ha cambiado todavía?

---

## BLOQUE G · Coger un traslado libre

1. Baja hasta **"Disponibles para tomar"**.
2. Pulsa **"Tomar"** en el primero.
   → Debe avisarte de que **solapa** con otro y pedirte confirmación.
3. Cancela.
4. Pulsa **"Tomar"** en el segundo.
   → Ese entra directo en tu jornada.

**Qué mirar:** ¿el aviso de solape te da datos suficientes para decidir, o te
falta información?

---

## BLOQUE H · Incidencia y siniestro

1. Toca **SOS** arriba a la derecha.
2. Prueba **llamar a la central** (cuelga antes de que entre).
3. **Mantén pulsado** el botón de reportar siniestro.
   → No debe dispararse con un toque suelto. Intenta que salte sin querer.
4. Reporta.
5. Vuelve al traslado.
   → Debe quedar congelado, sin poder avanzar.

**Qué mirar:** ¿el hold es demasiado largo o demasiado corto? Con guantes, ¿lo
consigues? Después de reportar, ¿sabes qué hacer?

---

## BLOQUE I · Atajos de una mano

Con el teléfono en **una sola mano**, sin la otra:

1. Desde la lista, abre **Maps** hacia un destino. Debe ser **un toque**.
2. Desde la lista, **llama al cliente**. Un toque.
3. Comprueba que Maps abre con el destino **ya cargado**, sin escribir nada.
4. Comprueba que el marcador abre con el **número ya puesto**.

**Qué mirar:** ¿alcanzas los botones con el pulgar sin recolocar la mano? ¿Los
confundes entre sí? ¿Le das al de al lado?

---

## BLOQUE J · Condiciones de calle

Recorre la lista y un detalle mientras:

1. Estás a **pleno sol**, con el brillo al máximo.
2. Llevas **guantes**.
3. **Caminas**.
4. Tienes el teléfono con **poca batería** (modo de ahorro activado).

**Qué mirar:** ¿qué texto deja de leerse primero? ¿Qué botón falla más con
guantes? ¿Alguna animación estorba al caminar?

---

## Lo que más me interesa que me cuentes

Por encima de los fallos concretos, tres preguntas de fondo:

1. **¿Cuánto se tarda en un check-in completo?** Si son más de 3 o 4 minutos por
   coche, con 9 traslados al día el flujo no aguanta y hay que recortarlo.
2. **¿El vídeo obligatorio en toda recogida es sostenible?** Es la decisión [C]
   número 1 y solo se responde probándolo con datos móviles reales.
3. **¿Echas de menos una silueta guía en la cámara?** Es la [C] número 6. Si
   dudas del encuadre en las 4 fotos, la respuesta es sí.

Cuando termines, pásame las notas como estén — sin ordenar. Yo las clasifico en
bug, mejora y decisión de producto, y las meto en el loop.
