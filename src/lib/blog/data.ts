/** Datos estáticos del blog de Mecanu.
 *  Sin backend por ahora — se reemplaza por Supabase cuando haya más posts. */

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
    slug: "talleres-que-pierden-clientes",
    title: "Por qué los talleres pierden clientes sin saberlo",
    excerpt:
      "La mayoría de los talleres mecánicos en España son buenos técnicamente. El problema no está en el motor — está en la logística de la experiencia.",
    category: "Operaciones",
    coverImage: "/blog/hero-rueda-vintage.png",
    coverAlt: "Mujer con ropa de época ajustando la rueda de un automóvil clásico, fotografía vintage en blanco y negro.",
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
    coverImage: "/blog/hero-conductor-vintage.png",
    coverAlt: "Mujer de época apoyada en un automóvil descapotable clásico, fotografía vintage en blanco y negro.",
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
    coverImage: "/blog/hero-taller-vintage.png",
    coverAlt: "Interior de taller mecánico vintage con herramientas y piezas de automóvil.",
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
