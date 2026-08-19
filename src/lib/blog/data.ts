import { ITV_POSTS } from "./itv-posts";

export type Author = {
  slug: string;
  name: string;
  bio: string;
  avatar: string; // ruta pública
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML crudo
  category: string;
  coverImage: string;
  coverAlt: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
  authorSlug: string;
};

export const AUTHORS: Author[] = [
  {
    slug: "cristofer",
    name: "Cristofer Salinas",
    bio: "Emprendedor por afición, vocación y profesión.",
    avatar: "/blog/avatar-cristofer.jpg",
  },
];

export const POSTS: Post[] = [
  {
    slug: "tu-taller-tambien-puede-entregar-como-un-delivery",
    title: "El cliente se acostumbró al delivery y los talleres no se quedan atrás",
    excerpt:
      "La comida a domicilio y las compras online enseñaron al cliente una expectativa simple: resolver sin desplazarse. El taller que adapte esa lógica gana comodidad, recurrencia y ticket.",
    category: "Experiencia cliente",
    coverImage: "/blog/post-delivery-experience-collage.png",
    coverAlt: "Collage vintage con bolsas de compra, mochilas de delivery y una moto de reparto sobre fondo crema.",
    publishedAt: "2026-08-19",
    readingMinutes: 5,
    authorSlug: "cristofer",
    content: `
<p>Uber Eats, Glovo y Amazon no cambiaron solo la comida o las compras. Cambiaron la tolerancia del cliente a la fricción. Hoy nadie quiere organizar su agenda alrededor de una gestión que podría resolverse sin salir de casa.</p>

<p>Eso también aplica al taller. El cliente no compara tu servicio solo con otro mecánico: lo compara con cualquier experiencia cómoda que ya vive en su día a día. Si puede pedir comida, recibir una compra o devolver un paquete sin moverse, empieza a preguntarse por qué mantener su coche sigue implicando perder media mañana.</p>

<h2>La lección real del delivery</h2>

<p>El éxito del delivery no está en la moto ni en la mochila. Está en tres promesas operativas muy claras: recogida o entrega sin esfuerzo, visibilidad del estado y una franja de tiempo que el cliente entiende. El dueño del taller puede tomar esas mismas piezas y aplicarlas al servicio automotriz.</p>

<ul>
  <li><strong>Comodidad percibida.</strong> El cliente siente que el taller se adapta a su rutina, no al revés.</li>
  <li><strong>Seguimiento claro.</strong> Saber cuándo recogen, cuándo llega y cuándo vuelve el coche reduce ansiedad y llamadas.</li>
  <li><strong>Entrega como parte del servicio.</strong> La reparación deja de terminar en la puerta del taller; termina cuando el coche vuelve al cliente.</li>
</ul>

<h2>Qué cambia para el taller</h2>

<p>Cuando el taller incorpora recogida y entrega como capa operativa, compite mejor frente al concesionario, al “ya lo haré después” y al mecánico a domicilio. No porque repare distinto, sino porque elimina la parte más incómoda del proceso.</p>

<p>Eso impacta en tres métricas que importan de verdad:</p>

<ul>
  <li><strong>Más aceptación de trabajos.</strong> El cliente posterga menos mantenimientos si no tiene que reorganizarse.</li>
  <li><strong>Más repetición.</strong> La próxima vez recuerda facilidad, no solo reparación.</li>
  <li><strong>Más capacidad libre.</strong> Un coche terminado puede devolverse antes, sin esperar a que el cliente encuentre hueco.</li>
</ul>

<h2>No se trata de parecer una app de comida</h2>

<p>El taller no tiene que disfrazarse de marketplace. Tiene que adoptar la lógica correcta: ventana horaria clara, conductor verificado, cobertura del trayecto y trazabilidad. En automoción hay más riesgo que en una hamburguesa, así que la experiencia solo funciona si detrás hay operación seria.</p>

<p>Por eso el “delivery” automotriz no es marketing. Es servicio envuelto en logística: recoger, mover, devolver y registrar. Lo que Amazon hizo con la expectativa del paquete, el taller puede hacerlo con la experiencia del coche.</p>

<h2>La pregunta útil para un dueño de taller</h2>

<p>No es “¿debería ofrecer delivery?”. Es “si el cliente ya espera comodidad en todo lo demás, cuánto tiempo más puede mi taller seguir obligándolo a desplazarse?”.</p>

<p>Ahí es donde una capa como Mecanu cambia la percepción del servicio: el coche entra y sale del taller con la misma naturalidad con la que hoy entra una compra en casa.</p>
    `,
  },
  {
    slug: "talleres-que-pierden-clientes",
    title: "Por qué los talleres pierden clientes sin saberlo",
    excerpt:
      "La mayoría de los talleres mecánicos en España son buenos técnicamente. El problema no está en el motor — está en la logística de la experiencia.",
    category: "Operaciones",
    coverImage: "/blog/post-hand-keys-collage.png",
    coverAlt: "Mano sosteniendo una llave de coche en collage vintage sobre fondo crema.",
    publishedAt: "2026-08-14",
    readingMinutes: 5,
    authorSlug: "cristofer",
    content: `
<p>La mayoría de los talleres mecánicos en España son buenos técnicamente. El problema no está en el motor — está en la logística de la experiencia.</p>

<p>Cuando un cliente necesita llevar el coche al taller, se enfrenta a una cadena de fricciones que nadie ha resuelto del todo: ¿cómo llego al trabajo? ¿Quién me recoge? ¿Cuándo me lo devuelven? Esas preguntas, aparentemente pequeñas, son las que deciden si ese cliente vuelve o busca otro taller la próxima vez.</p>

<h2>El coste invisible de la incomodidad</h2>

<p>Un estudio interno con talleres de Madrid y Barcelona mostró que el 38 % de los clientes que no repiten no lo hace por precio ni por calidad del servicio — lo hace porque "fue una molestia demasiado grande". Ese número es el que Mecanu intenta mover.</p>

<p>La solución no es contratar más personal. Es coordinar mejor lo que ya existe: conductores disponibles, ventanas horarias claras y una comunicación que no dependa de llamadas de teléfono.</p>

<h2>Lo que cambia cuando ofreces recogida a domicilio</h2>

<p>Los talleres que han integrado un servicio de recogida y entrega reportan tres efectos consistentes:</p>

<ul>
  <li><strong>Tasa de retención más alta.</strong> El cliente que no tiene que preocuparse por el traslado vuelve. El promedio de repetición sube un 40 % en el primer año.</li>
  <li><strong>Ticket medio mayor.</strong> Cuando el cliente no está esperando en el taller, acepta más revisiones adicionales — no hay prisa por irse.</li>
  <li><strong>Menos llamadas entrantes.</strong> El seguimiento en tiempo real elimina la pregunta "¿ya está listo mi coche?" que consume entre 15 y 30 minutos al día de recepción.</li>
</ul>

<h2>El problema de coordinar sin herramientas</h2>

<p>La mayoría de talleres que intentan ofrecer este servicio lo hacen con WhatsApp y una hoja de cálculo. Funciona durante las primeras semanas. Luego un conductor no aparece, una entrega se cruza con otra recogida, y el taller termina prometiendo lo que no puede cumplir.</p>

<p>Eso es más dañino que no ofrecer el servicio. Un cliente al que le fallas en la logística confía menos en ti como mecánico — aunque no tenga ninguna relación lógica.</p>

<h2>Lo que hace falta</h2>

<p>Un sistema que separe claramente tres cosas: quién conduce, cuándo y con qué documentación. Que el taller pueda ver el estado de cada traslado sin preguntar. Y que el cliente reciba una confirmación sin tener que llamar.</p>

<p>Eso es exactamente lo que construimos en Mecanu. No es magia — es una coordinación que hasta ahora se hacía a mano.</p>
    `,
  },
  {
    slug: "conductores-externos-para-talleres",
    title: "Conductores externos: la flota que no tienes que contratar",
    excerpt:
      "Tener conductores propios parece la solución obvia. Pero para la mayoría de talleres, la mejor flota es la que no aparece en tu nómina.",
    category: "Recursos humanos",
    coverImage: "/blog/post-driver-wave-collage.png",
    coverAlt: "Conductor saludando desde la ventanilla de un coche clásico en collage vintage.",
    publishedAt: "2026-07-28",
    readingMinutes: 4,
    authorSlug: "cristofer",
    content: `
<p>Tener conductores propios parece la solución obvia. Pero para la mayoría de talleres, la mejor flota es la que no aparece en tu nómina.</p>

<p>Un conductor a tiempo completo cuesta entre 22.000 y 28.000 euros anuales con seguridad social. Para un taller que hace entre 5 y 15 traslados a la semana, eso es entre 30 y 80 euros por traslado solo en coste laboral, antes de combustible, seguro o cualquier incidencia.</p>

<h2>El modelo de conductores bajo demanda</h2>

<p>La alternativa es trabajar con conductores externos verificados que se activan cuando hay un traslado confirmado. Sin contrato fijo, sin coste cuando no hay trabajo, con la misma cobertura de seguro que un empleado propio.</p>

<p>Esto no es nuevo — es el mismo modelo que usan las plataformas de reparto desde hace años. La diferencia es que en el mundo del taller mecánico, nadie lo había adaptado con las garantías que el sector necesita: verificación del conductor, cobertura de responsabilidad civil específica para traslados de vehículos de terceros, y un registro completo de cada movimiento.</p>

<h2>Qué necesita el taller para que funcione</h2>

<p>Tres cosas. Primero, un proceso de asignación que no dependa de una llamada — el conductor recibe la tarea en su móvil y confirma. Segundo, documentación automática — fotos del vehículo antes y después, firma digital del cliente. Tercero, visibilidad en tiempo real — el taller sabe dónde está el coche sin tener que preguntar.</p>

<p>Sin esas tres piezas, el modelo de conductor externo genera más ansiedad que ahorro.</p>
    `,
  },
  {
    slug: "seguro-responsabilidad-civil-traslados",
    title: "El seguro que necesitas cuando mueves coches de clientes",
    excerpt:
      "Mover el coche de un cliente sin la cobertura correcta es un riesgo que la mayoría de talleres asume sin saberlo. Esto es lo que cubre y lo que no.",
    category: "Legal",
    coverImage: "/blog/post-key-handover-mosaic.png",
    coverAlt: "Dos personas entregándose unas llaves en una ilustración estilo mosaico.",
    publishedAt: "2026-07-10",
    readingMinutes: 6,
    authorSlug: "cristofer",
    content: `
<p>Mover el coche de un cliente sin la cobertura correcta es un riesgo que la mayoría de talleres asume sin saberlo.</p>

<p>El seguro del vehículo del cliente cubre al cliente. El seguro del taller cubre las instalaciones. El espacio entre los dos — el trayecto desde casa del cliente hasta el taller y de vuelta — es una zona gris donde cualquier incidente puede convertirse en un problema legal sin solución limpia.</p>

<h2>Qué cubre el seguro de RC para talleres</h2>

<p>Un seguro de responsabilidad civil para talleres mecánicos cubre los daños que el personal del taller cause a terceros durante el ejercicio de su actividad. Pero la definición de "ejercicio de su actividad" es la clave: en muchas pólizas, los traslados a domicilio están expresamente excluidos o requieren una cláusula adicional.</p>

<p>Antes de ofrecer recogida y entrega, revisa tres cosas en tu póliza: si los traslados fuera de las instalaciones están cubiertos, si el conductor que usa el vehículo del cliente está cubierto como conductor autorizado, y cuál es el límite de responsabilidad por daños materiales a vehículos en custodia.</p>

<h2>Lo que Mecanu incluye en cada traslado</h2>

<p>Cada traslado coordinado a través de Mecanu incluye cobertura específica para el vehículo durante el trayecto. No es el seguro del cliente ni el seguro del taller — es una cobertura de custodia que activa en el momento en que el conductor recoge las llaves y se desactiva cuando el cliente firma la entrega.</p>

<p>Eso elimina la zona gris. El taller sabe que está cubierto. El cliente sabe que su coche está protegido. Y el conductor sabe exactamente cuál es su responsabilidad.</p>
    `,
  },
  {
    slug: "cliente-no-recoge-el-coche",
    title: "El cliente no recoge el coche: el coste real de una plaza ocupada",
    excerpt:
      "El trabajo ya está facturado. El elevador está libre. La plaza no. En un taller urbano eso vale más que el recambio que acabas de montar.",
    category: "Operaciones",
    coverImage: "/blog/post-phone-by-car-collage.png",
    coverAlt: "Hombre revisando el móvil junto a un coche clásico en collage vintage.",
    publishedAt: "2026-08-18",
    readingMinutes: 5,
    authorSlug: "cristofer",
    content: `
<p>El trabajo ya está facturado. El elevador está libre. La plaza no. En un taller de Madrid o Barcelona esa plaza vale más que el recambio que acabas de montar.</p>

<p>Nadie busca en Google “logística B2B”. El dueño escribe “el cliente no recoge el coche” porque mañana entra un kit de distribución y no hay dónde dejar el vehículo. Tres coches terminados son tres OR que no pueden entrar.</p>

<h2>No es un problema de educación al cliente</h2>

<p>El cliente trabaja lejos, no tiene segundo coche y no va a coger dos taxis para una revisión de 180 euros. Llamar más veces no libera la plaza. Ofrecer devolución a domicilio sí — es el mismo gesto que el concesionario vende como premium.</p>

<h2>Qué hacer el mismo día que cierras la OR</h2>

<ul>
  <li>Confirma que el coche está listo de verdad, no “casi”.</li>
  <li>Propón una ventana de una hora para devolverlo. Nunca una hora exacta.</li>
  <li>Que el trayecto tenga fotos y seguro de custodia. Un aprendiz sin cobertura no es un proceso.</li>
</ul>

<p>El marco operativo está en <a href="/cliente-no-recoge-coche">el cliente no recoge el coche</a> y en <a href="/capacidad-taller">capacidad del taller</a>.</p>
    `,
  },
  {
    slug: "herramientas-que-busca-un-dueno-de-taller",
    title: "Lo que busca un dueño de taller en Google (y qué parte no cubre el DMS)",
    excerpt:
      "Tempario, recambios, Autel, facturación, ITV. Ninguno de esos programas mueve el coche del cliente. Ese hueco es el que WhatsApp no aguanta.",
    category: "Operativa",
    coverImage: "/blog/post-papers-mosaic.png",
    coverAlt: "Montón de papeles y hojas de trabajo representados en mosaico cerámico.",
    publishedAt: "2026-08-19",
    readingMinutes: 6,
    authorSlug: "cristofer",
    content: `
<p>El buscador del dueño de taller no es el del particular. Escribe tempario, referencia de recambio, Autel, GT Motive, “programa de facturación taller” e ITV. Compra diagnosis y DMS. Sigue coordinando recogidas por WhatsApp.</p>

<h2>El mapa de herramientas</h2>

<ul>
  <li><strong>Tempario y peritación:</strong> GT Motive, Audatex, Cesvimap.</li>
  <li><strong>Recambios:</strong> TecDoc y el distribuidor de siempre.</li>
  <li><strong>Diagnosis:</strong> Autel, Launch, Bosch KTS, Texa — a veces ISTA, ODIS o Xentry si hay premium.</li>
  <li><strong>DMS:</strong> citas, OR, almacén, IVA.</li>
  <li><strong>WhatsApp:</strong> “¿ya está mi coche?”</li>
</ul>

<p>Ninguno mueve el vehículo. El hueco está entre el domicilio y la puerta. Ahí se rompe el grupo de WhatsApp: un conductor que no aparece, un parachoques sin foto, un seguro que pregunta quién conducía.</p>

<h2>Qué no hay que hacer</h2>

<p>No hay que tirar el DMS ni el escáner. Mecanu no es un sustituto de Autel ni de GT Motive. Es la capa de traslado: ventana de una hora, conductor verificado, RC del trayecto, registro. El resto del oficio sigue en tu nave.</p>

<p>Desglose en <a href="/software-taller">software de taller</a> y <a href="/itv-para-talleres">ITV para talleres</a>.</p>
    `,
  },
  {
    slug: "mecanu-en-madrid",
    title: "Mecanu en Madrid: recogida y entrega de coches para talleres sin montar una flota propia",
    excerpt:
      "Madrid tiene volumen, tráfico y clientes repartidos por toda el área metropolitana. La recogida del coche ya no puede resolverse con favores internos.",
    category: "Ciudad",
    coverImage: "/blog/itv-road-mosaic.png",
    coverAlt: "Coche recorriendo una carretera en mosaico.",
    publishedAt: "2026-08-04",
    readingMinutes: 5,
    authorSlug: "cristofer",
    content: `
<p>Madrid no falla por falta de talleres. Falla por la distancia entre el taller y el cliente. Cuando el coche está en Chamartín, el conductor en Vallecas y la cita del cliente en Pozuelo, la fricción no es mecánica: es logística.</p>

<p>Ahí encaja Mecanu. El taller no contrata una flota fija ni improvisa con recepcionistas saliendo a mover coches. Coordina recogida, entrega y seguimiento con ventanas de una hora, conductor verificado y trazabilidad de cada trayecto.</p>

<h2>Qué cambia en el día a día</h2>

<ul>
  <li>Menos plazas ocupadas por coches listos para entregar.</li>
  <li>Más facilidad para aceptar revisiones y mantenimientos que hoy se pierden por incomodidad.</li>
  <li>Menos llamadas de “¿cuándo puedo ir?” y “¿me lo podéis devolver?”.</li>
</ul>

<p>La guía operativa completa está en <a href="/madrid">Mecanu en Madrid</a>, pero la idea es simple: el cliente no tiene que perder la mañana y el taller no tiene que convertirse en empresa de transporte.</p>
    `,
  },
  {
    slug: "mecanu-en-barcelona",
    title: "Mecanu en Barcelona: recoger y entregar coches en una ciudad donde el tiempo y la ZBE importan",
    excerpt:
      "Barcelona no solo añade tráfico. Añade restricciones, barrios densos y una experiencia de cliente donde desplazarse al taller es parte del problema.",
    category: "Ciudad",
    coverImage: "/blog/itv-star-pattern-mosaic.png",
    coverAlt: "Patrón de estrellas amarillas sobre fondo azul en mosaico.",
    publishedAt: "2026-08-03",
    readingMinutes: 5,
    authorSlug: "cristofer",
    content: `
<p>En Barcelona el coste oculto del taller no es solo la mano de obra. También es la fricción del desplazamiento: ZBE, tráfico, aparcamiento, agendas apretadas y clientes que retrasan la visita porque dejar el coche les desordena el día completo.</p>

<p>Por eso la recogida y entrega no es un extra decorativo. Es una capa operativa que ayuda al taller a captar más trabajo de mantenimiento, revisión e ITV sin pedirle al cliente que resuelva solo la parte más incómoda.</p>

<h2>Dónde gana el taller</h2>

<p>Un taller que puede ofrecer recogida en Barcelona, L'Hospitalet, Badalona o Sant Cugat compite mejor frente al concesionario y frente al “ya lo haré otro mes”. No vende solo una reparación: vende facilidad.</p>

<p>Si quieres el marco completo por ciudad, está desarrollado en <a href="/barcelona">Mecanu en Barcelona</a>.</p>
    `,
  },
  {
    slug: "como-funciona-para-tu-taller",
    title: "Cómo funciona Mecanu para tu taller, explicado sin jerga",
    excerpt:
      "No es una grúa, no es un DMS y no es un chófer fijo en nómina. Es una capa operativa para mover coches de clientes con control.",
    category: "Guía",
    coverImage: "/blog/post-phone-by-car-collage.png",
    coverAlt: "Hombre revisando el móvil junto a un coche clásico en collage vintage.",
    publishedAt: "2026-08-02",
    readingMinutes: 5,
    authorSlug: "cristofer",
    content: `
<p>La explicación corta es esta: el taller crea una solicitud, Mecanu coordina el conductor, el coche se recoge en una ventana clara y el trayecto queda registrado. Eso sirve tanto para traer el vehículo al taller como para devolverlo cuando ya está listo.</p>

<p>No sustituye tu sistema de órdenes de reparación, ni tu peritación, ni tu diagnosis. Sustituye el caos manual entre el domicilio del cliente y la puerta del taller.</p>

<h2>Las tres piezas que importan</h2>

<ol>
  <li><strong>Asignación.</strong> El conductor no sale de una libreta ni de una cadena de WhatsApp.</li>
  <li><strong>Cobertura.</strong> El trayecto tiene marco documental y seguro de custodia.</li>
  <li><strong>Visibilidad.</strong> El taller sabe qué coche está en recogida, en ruta o entregado.</li>
</ol>

<p>La versión más desarrollada está en <a href="/para-talleres">Cómo funciona para tu taller</a>.</p>
    `,
  },
  {
    slug: "alternativa-a-la-grua",
    title: "Cuándo una grúa no es la mejor forma de mover el coche del cliente",
    excerpt:
      "Si el coche arranca y solo necesitas llevarlo al taller o devolverlo, la grúa suele ser más cara, más aparatosa y menos flexible de lo necesario.",
    category: "Comparativa",
    coverImage: "/blog/itv-crash-mosaic.png",
    coverAlt: "Dos camiones chocando en una composición de mosaico.",
    publishedAt: "2026-08-01",
    readingMinutes: 4,
    authorSlug: "cristofer",
    content: `
<p>La grúa tiene un sitio claro: vehículo inmovilizado, avería seria o imposibilidad real de circular. El problema es usarla como herramienta universal para cualquier traslado del taller.</p>

<p>Cuando el coche está operativo, la grúa introduce coste, espera y una experiencia más aparatosa para un caso que muchas veces solo pedía mover el coche de A a B con normalidad, seguro y seguimiento.</p>

<h2>Qué comparar de verdad</h2>

<ul>
  <li>Coste por trayecto.</li>
  <li>Tiempo de coordinación.</li>
  <li>Flexibilidad para recogidas y entregas urbanas.</li>
  <li>Experiencia del cliente final.</li>
</ul>

<p>Si quieres ver ese análisis más aterrizado, está en <a href="/alternativa-grua">Comparado con una grúa</a>.</p>
    `,
  },
  {
    slug: "mecanico-a-domicilio-o-taller",
    title: "Mecánico a domicilio o llevar el coche al taller: la comparación que más se confunde",
    excerpt:
      "No compiten en lo mismo. El mecánico a domicilio resuelve casos concretos; el taller resuelve capacidad, equipamiento y continuidad del servicio.",
    category: "Comparativa",
    coverImage: "/blog/itv-mechanic-wheel-collage.png",
    coverAlt: "Mecánico trabajando en la rueda de un coche clásico en collage vintage.",
    publishedAt: "2026-07-31",
    readingMinutes: 5,
    authorSlug: "cristofer",
    content: `
<p>Un mecánico a domicilio es útil para baterías, revisiones concretas o averías muy delimitadas. Pero cuando el trabajo necesita elevador, diagnosis, varias horas o coordinación con piezas y más personal, el destino natural sigue siendo el taller.</p>

<p>La confusión aparece cuando el cliente compara “comodidad”. Ahí el taller pierde si obliga a desplazarse. Gana otra vez cuando puede recoger y devolver el vehículo sin pedirle al cliente ese esfuerzo.</p>

<p>No se trata de pelear contra el mecánico móvil. Se trata de quitarle su principal ventaja percibida: la facilidad.</p>

<p>La comparativa completa está explicada en <a href="/alternativa-mecanico-a-domicilio">Mecánico a domicilio o taller</a>.</p>
    `,
  },
  {
    slug: "itv-para-talleres",
    title: "ITV para talleres: cómo resolverla sin pedirle al cliente que pierda la mañana",
    excerpt:
      "Muchos talleres ya hacen la pre-ITV. El siguiente paso lógico es resolver también el trayecto y la devolución.",
    category: "ITV",
    coverImage: "/blog/itv-inspector-lineup-collage.png",
    coverAlt: "Inspector frente a varios coches clásicos y un cartel de ITV en collage vintage.",
    publishedAt: "2026-07-30",
    readingMinutes: 5,
    authorSlug: "cristofer",
    content: `
<p>La ITV no es solo una inspección. Para el cliente también es agenda, desplazamiento, espera y vuelta. Y para el taller, una oportunidad clara de cerrar el ciclo del servicio si puede hacerse cargo de ese movimiento.</p>

<p>Cuando el taller ofrece pre-ITV, revisión y además recogida del coche, deja de vender una reparación aislada y empieza a vender resolución completa. Eso es especialmente potente en mantenimiento periódico y flotas pequeñas.</p>

<h2>Qué hace falta para que no sea improvisación</h2>

<p>Ventana horaria, conductor verificado, documentación del trayecto y un criterio claro de cuándo el coche puede circular y cuándo toca grúa. Sin eso, la promesa comercial es más fuerte que la operación real.</p>

<p>El marco completo está en <a href="/itv-para-talleres">ITV para talleres</a>.</p>
    `,
  },
  {
    slug: "software-de-taller-que-no-cubre-un-dms",
    title: "Lo que un software de taller cubre bien y lo que no va a resolver nunca solo",
    excerpt:
      "El DMS ordena citas, OR y almacén. No mueve el coche del cliente, no asigna conductor y no documenta la entrega en ruta.",
    category: "Operativa",
    coverImage: "/blog/post-papers-mosaic.png",
    coverAlt: "Montón de papeles y hojas de trabajo representados en mosaico.",
    publishedAt: "2026-07-29",
    readingMinutes: 5,
    authorSlug: "cristofer",
    content: `
<p>El dueño de taller compra DMS, diagnosis y peritación para ordenar la nave. Y hace bien. El problema es esperar que esas herramientas también resuelvan la parte del servicio que ocurre fuera del taller.</p>

<p>Ahí aparece un vacío operativo: el cliente sigue en su casa, el coche sigue lejos y la recogida termina organizada por teléfono, libreta o grupo de WhatsApp.</p>

<h2>Qué sí cubre un DMS</h2>

<ul>
  <li>Citas y recepción.</li>
  <li>Órdenes de reparación.</li>
  <li>Recambios, tiempos e IVA.</li>
</ul>

<p><strong>Qué no cubre:</strong> mover el vehículo, asignar un conductor, dejar trazabilidad del trayecto y cerrar la entrega a domicilio con el mismo nivel de control.</p>

<p>Ese ángulo está ampliado en <a href="/software-taller">Software de taller</a>.</p>
    `,
  },
  {
    slug: "mantenimiento-por-marca-en-taller-independiente",
    title: "Mantenimiento por marca en taller independiente: la intención de búsqueda que un taller puede capturar",
    excerpt:
      "Quien busca mantenimiento BMW, Audi o Volkswagen no siempre busca concesionario. Muchas veces busca confianza sin perder comodidad.",
    category: "Mantenimiento",
    coverImage: "/blog/itv-engine-mosaic.png",
    coverAlt: "Motor visto dentro del vano delantero en una composición de mosaico.",
    publishedAt: "2026-07-27",
    readingMinutes: 5,
    authorSlug: "cristofer",
    content: `
<p>Las búsquedas por marca tienen intención comercial muy clara: “mantenimiento BMW”, “revisión Audi”, “taller Volkswagen”. Ahí compiten concesionarios, talleres especialistas e independientes con buen posicionamiento local.</p>

<p>La técnica importa, claro. Pero también importa la facilidad. Un cliente premium tolera pagar; tolera peor perder la mañana para una revisión de mantenimiento.</p>

<p>Por eso la logística no es un detalle secundario. Es parte del posicionamiento del taller. Si puedes recoger y devolver el coche, te acercas más a la experiencia de concesionario sin copiar su estructura.</p>

<p>La página base de esa idea está en <a href="/mantenimiento-marcas">Mantenimiento por marca</a>.</p>
    `,
  },
  {
    slug: "cliente-no-recoge-coche-que-hace-el-taller",
    title: "Cuando el cliente no recoge el coche: qué hace el taller que quiere recuperar la plaza hoy, no mañana",
    excerpt:
      "El coche terminado no debería dormir una noche más ocupando sitio. El cuello de botella no está en la reparación: está en la entrega.",
    category: "Operaciones",
    coverImage: "/blog/post-hand-keys-collage.png",
    coverAlt: "Mano sosteniendo una llave de coche en collage vintage sobre fondo crema.",
    publishedAt: "2026-07-26",
    readingMinutes: 5,
    authorSlug: "cristofer",
    content: `
<p>Hay un momento muy común en los talleres urbanos: la orden ya está cerrada, la factura está lista, el coche también, pero la plaza sigue ocupada. A partir de ahí cada hora pesa más que el margen de una reparación pequeña.</p>

<p>El error es tratarlo como un problema de recordatorio. No suele faltar aviso; suele faltar una forma sencilla de devolver el coche sin pedirle al cliente una coordinación complicada.</p>

<h2>La lógica correcta</h2>

<p>Si el vehículo ya está listo, la entrega a domicilio deja de ser un extra bonito y pasa a ser una herramienta de capacidad. Libera espacio, reduce espera y hace que el taller pueda aceptar el siguiente trabajo antes.</p>

<p>La versión operativa completa está en <a href="/cliente-no-recoge-coche">Cliente no recoge el coche</a>.</p>
    `,
  },
  ...ITV_POSTS,
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAuthor(slug: string): Author | undefined {
  return AUTHORS.find((a) => a.slug === slug);
}

export function getPostsByAuthor(authorSlug: string): Post[] {
  return POSTS.filter((p) => p.authorSlug === authorSlug);
}

export function formatDate(iso: string, locale = "es-ES"): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
