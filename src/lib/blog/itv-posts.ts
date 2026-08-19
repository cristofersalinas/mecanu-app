import type { Post } from "./data";

const CTA = `<p><a href="/itv-a-domicilio">Pasa la ITV sin ir a la estación. Mecanu recoge tu coche, lo lleva y te lo devuelve.</a></p>`;

function post(
  slug: string,
  title: string,
  excerpt: string,
  publishedAt: string,
  readingMinutes: number,
  content: string,
): Post {
  return {
    slug,
    title,
    excerpt,
    content: `${content}\n${CTA}`,
    category: "ITV",
    coverImage: "/landing/hero-calle.jpg",
    coverAlt: "Coche en la calle listo para recoger y llevar a la estación de ITV.",
    publishedAt,
    readingMinutes,
    authorSlug: "cristofer",
  };
}

/** Artículos B2C de ITV. Se mezclan en el índice del blog principal. */
export const ITV_POSTS: Post[] = [
  post(
    "itv-a-domicilio-como-funciona",
    "ITV a domicilio: qué es (y qué no es) pasar la inspección sin ir tú",
    "Nadie inspecciona el coche en tu portal. Un conductor lo lleva a una estación autorizada, espera el resultado y te lo devuelve.",
    "2026-08-19",
    6,
    `
<p>En España no existe una ITV “en casa”. La inspección solo la puede hacer una estación autorizada. Lo que sí existe —y es lo que ofrece Mecanu— es <strong>no tener que ir tú</strong>: recogemos el coche, lo llevamos, y te lo devolvemos.</p>
<h2>Cómo es el servicio</h2>
<ol>
<li>Eliges día. Ventana de una hora, no un minuto exacto.</li>
<li>Un conductor verificado recoge el vehículo en tu domicilio o trabajo.</li>
<li>Lo lleva a una estación de Madrid o Barcelona, con cita.</li>
<li>Si sale favorable, te lo devuelve con la ITV al día.</li>
<li>Si sale desfavorable, te avisamos con el informe para reparar y repetir.</li>
</ol>
<h2>Qué no prometemos</h2>
<p>No homologamos escapes. No somos la estación. No podemos circular legalmente un coche que no está en condiciones de ir a la ITV. Si está caducada, el trayecto hasta la estación es el único desplazamiento previsto.</p>
    `,
  ),
  post(
    "itv-caducada-puedo-circular",
    "¿Puedo circular con la ITV caducada si tengo cita previa?",
    "No. La DGT multa igual. Tener cita no autoriza a usar el coche para ir al trabajo.",
    "2026-08-18",
    4,
    `
<p>La respuesta corta: <strong>no</strong>. Circular con la ITV caducada es infracción grave aunque tengas cita impresa en el móvil. La multa habitual son 200 € (100 € por pronto pago).</p>
<p>La excepción práctica es llevar el vehículo <em>directamente</em> a la estación o al taller para reparar. No es un salvoconducto para el resto del día.</p>
<h2>Qué hacer si ya se te pasó</h2>
<p>Pide cita ya (puedes adelantarte 30 días a la próxima, pero si ya caducó, cuanto antes). Si no puedes desplazarte, un servicio de recogida reduce el tiempo que el coche está en la calle sin ITV válida.</p>
    `,
  ),
  post(
    "multa-itv-caducada",
    "Multa por ITV caducada en 2026: 200 €, y 500 € si es negativa",
    "Caducada no es lo mismo que desfavorable ni que negativa. Las sanciones y lo que puedes hacer con el coche cambian.",
    "2026-08-17",
    5,
    `
<p>Tres situaciones distintas:</p>
<ul>
<li><strong>Caducada:</strong> no la has pasado a tiempo. Multa típica 200 €. El coche no debería circular salvo hacia la estación o el taller.</li>
<li><strong>Desfavorable:</strong> fallos graves pero te dan plazo (normalmente dos meses) para reparar y volver. Circulación limitada.</li>
<li><strong>Negativa:</strong> el vehículo es un riesgo. Multa de 500 € si circulas. Solo taller o estación, a menudo en grúa.</li>
</ul>
<p>El seguro puede complicarse si hay un accidente con la ITV fuera de plazo. No es el momento de “ya lo haré el mes que viene”.</p>
    `,
  ),
  post(
    "itv-desfavorable-o-negativa",
    "ITV desfavorable o negativa: plazos, segunda inspección y qué no hacer",
    "Desfavorable te deja un margen. Negativa te deja el coche parado. Confundirlas sale caro.",
    "2026-08-16",
    5,
    `
<p>Si el resultado es <strong>desfavorable</strong>, tienes un plazo legal (habitualmente dos meses) para reparar los defectos graves y repetir la inspección, a menudo solo de los puntos fallados y a menor coste.</p>
<p>Si es <strong>negativa</strong>, el vehículo no está apto. No lo conduzcas a casa “que ya lo miro”. Taller, y si no arranca o no es seguro, grúa — no un conductor.</p>
<p>Mecanu cubre el coche que <em>puede circular</em> hasta la estación. Una negativa con frenos rotos no es nuestro caso; es plataforma.</p>
    `,
  ),
  post(
    "segunda-inspeccion-itv",
    "Segunda inspección de ITV: cuánto tarda, cuánto cuesta, misma estación",
    "Tras un desfavorable, la repetición suele ser más barata y más corta si vuelves a tiempo y al mismo centro.",
    "2026-08-15",
    4,
    `
<p>La segunda inspección no es “pasar la ITV otra vez entera” si cumples plazo y estación. Revisan los defectos anotados. El precio de esa repetición lo fija cada operador; en Madrid (tarifas libres) conviene preguntar al pedir la primera cita.</p>
<p>Si dejas pasar el plazo, pagas inspección completa de nuevo. Si cambias de estación, también.</p>
<p>Un traslado de ida y vuelta para la segunda visita es el mismo servicio que la primera: el cuello de botella sigue siendo tu tiempo, no la tasa.</p>
    `,
  ),
  post(
    "adelantar-itv-30-dias",
    "Puedes pasar la ITV 30 días antes sin perder la fecha",
    "La DGT permite adelantar un mes. La caducidad siguiente no se come esos días.",
    "2026-08-14",
    3,
    `
<p>Si tu ITV vence el 18 de marzo, puedes pasarla desde el 16 de febrero (30 días naturales antes) y la próxima caducidad sigue anclada al 18 de marzo del ciclo que te toque, no se adelanta al 16 de febrero.</p>
<p>Eso sirve para coger hueco en estación, para que coincida con un hueco en el trabajo, o para que recojamos el coche un martes flojo en vez del último día del mes.</p>
    `,
  ),
  post(
    "cita-previa-itv-madrid",
    "Cita previa ITV Madrid: estaciones, precios libres y colas",
    "En Madrid cada estación pone precio. La cita online evita la cola; no evita tener que llevar el coche.",
    "2026-08-13",
    5,
    `
<p>La Comunidad de Madrid liberalizó tarifas: gasolina, diésel e híbrido no cuestan lo mismo ni en el mismo polígono. Rango orientativo 2026 para turismo: unos 40–65 € según combustible y estación, más descuentos entre semana.</p>
<p>Applus, Iteuve, SGS y operadores privados publican cita online. Sin cita, en algunas estaciones se espera. Con cita, sigues siendo tú quien pierde la mañana — salvo que alguien lleve el coche por ti.</p>
<p>Mecanu opera recogidas en Madrid capital y área (Alcobendas, Pozuelo, Getafe, Leganés, etc.).</p>
    `,
  ),
  post(
    "cita-previa-itv-barcelona",
    "Cita previa ITV Barcelona: red pública, precio y ZBE",
    "En Catalunya las tarifas están más reguladas. El problema no es tanto el euro como el desplazamiento y la ZBE.",
    "2026-08-12",
    5,
    `
<p>En Barcelona y área, la cita previa en la red de estaciones (Applus y otras) se agota en determinados meses. El turismo diésel paga más que el gasolina por emisiones.</p>
<p>Si tu distintivo ambiental no te deja entrar a ciertas zonas, hay que elegir estación compatible. El conductor que lleva el coche tiene que poder circular; el tuyo también.</p>
<p>Mecanu cubre Barcelona, L'Hospitalet, Badalona, Sabadell, Terrassa, Sant Cugat y el resto del radio de 40 km.</p>
    `,
  ),
  post(
    "precio-itv-2026-madrid-barcelona",
    "Precio de la ITV en 2026: Madrid vs Barcelona",
    "La tasa de la estación no es el coste real. El coste real es la mañana que pierdes.",
    "2026-08-11",
    4,
    `
<p>La inspección de un turismo en 2026 se mueve, según comunidad y combustible, entre unos 35 y 65 €. Madrid es liberalizado (cada estación decide). Catalunya aplica tarifas más homogéneas, con subidas recientes.</p>
<p>Eso es la tasa. Si sumas taxi de ida y vuelta, parking, o media jornada laboral, el “precio de la ITV” se parece más a 80–150 € de fricción. El servicio de recogida cobra esa fricción, no sustituye la tasa de la estación (va aparte o incluida según lo que te cotemos por WhatsApp).</p>
    `,
  ),
  post(
    "que-revisan-en-la-itv",
    "Qué revisan en la ITV: luces, frenos, gases, chasis",
    "La lista es aburrida y es la que te saca desfavorable. Un vistazo en el taller el día de antes evita la segunda visita.",
    "2026-08-10",
    6,
    `
<p>Inspección visual y de equipos, en este orden típico:</p>
<ul>
<li>Identificación: matrícula, número de bastidor, documentación.</li>
<li>Alumbrado y señalización: todas las lámparas, altura de faros.</li>
<li>Frenos: eficacia y equilibrio en banco.</li>
<li>Emisiones / OBD: más estricto en diésel.</li>
<li>Neumáticos: dibujo mínimo 1,6 mm, medidas homologadas.</li>
<li>Dirección, suspensión, fugas, corrosión estructural.</li>
<li>Cinturones, claxon, limpiaparabrisas, luna.</li>
</ul>
<p>Un pre-chequeo de luces y neumáticos en el taller evita el 80 % de los desfavorables tontos. Mecanu no sustituye ese chequeo; si quieres, el taller lo hace antes de que recojamos.</p>
    `,
  ),
  post(
    "pre-itv-taller",
    "Pre-ITV en el taller: 25–30 € que evitan una segunda estación",
    "Luces fundidas y un testigo de motor son el clásico. Se ven en el elevador, no en la cola de la ITV.",
    "2026-08-09",
    4,
    `
<p>Muchos talleres venden una pre-ITV barata: lectura de averías, luces, frenos de mano, fugas evidentes. Cuesta menos que repetir la inspección.</p>
<p>El flujo inteligente: pre-ITV → recogida → estación → (si hace falta) vuelta al taller → segunda inspección. Todo eso se coordina. Tú no haces de mensajero entre tres sitios.</p>
    `,
  ),
  post(
    "itv-diesel-emisiones",
    "ITV diésel: el filtro FAP y los gases que te sacan desfavorable",
    "El diésel paga más tasa y falla más en emisiones. Un regenerado a tiempo no es opcional.",
    "2026-08-08",
    5,
    `
<p>Las estaciones miden opacidad y, en muchos casos, leen el OBD. Un FAP tapado, un EGR sucio o un testigo de motor encendido son causa típica de desfavorable en diésel de más de diez años.</p>
<p>Si el coche hace trayectos cortos por ciudad, el FAP no regenera. Un viaje de carretera o una limpieza en taller antes de la cita es más barato que dos inspecciones + traslado.</p>
<p>El precio de la ITV diésel en Madrid suele ir por encima del gasolina. Cuéntalo al pedir presupuesto de recogida.</p>
    `,
  ),
  post(
    "itv-moto-a-domicilio",
    "ITV de moto: también se puede no ir tú (si la moto puede circular)",
    "Misma estación, menos sitio en cola, mismo problema de calendario. El traslado es un conductor, no una furgoneta-grúa salvo que no arranque.",
    "2026-08-07",
    4,
    `
<p>Las motos también tienen ITV periódica (plazos distintos según cilindrada y antigüedad). La tasa es más baja que la del turismo. El dolor es el mismo: cita, desplazamiento, espera.</p>
<p>Si la moto circula y está asegurada, un conductor con carnet adecuado puede llevarla. Si no arranca, es grúa de moto, no Mecanu.</p>
<p>Dilo en el formulario: tipo de vehículo. El WhatsApp sale ya con ese dato.</p>
    `,
  ),
  post(
    "lunas-tintadas-escape-itv",
    "Lunas tintadas, escape y xenón: lo que la ITV no te va a colar",
    "Si no está homologado y en la ficha, sale desfavorable. Homologar no es un traslado: es un taller y un laboratorio.",
    "2026-08-06",
    5,
    `
<p>Láminas no homologadas, escape “deportivo” sin ficha, faros no e-mark: la estación no negocia. O está en la documentación o no pasa.</p>
<p>Mecanu no homologa. Si tu coche tiene reformas, resuélvelas <em>antes</em> de pedirnos la recogida. Si no, pagas el viaje para un desfavorable anunciado.</p>
    `,
  ),
  post(
    "cada-cuantos-anos-itv",
    "Cada cuántos años se pasa la ITV: 4, 2 y 1",
    "Turismo particular: primera a los 4 años, luego cada 2 hasta los 10, después cada año. Vehículos de servicio, otro calendario.",
    "2026-08-05",
    4,
    `
<p>Para turismos de uso particular en España:</p>
<ul>
<li>Hasta 4 años desde la primera matriculación: exento.</li>
<li>De 4 a 10 años: cada 2 años.</li>
<li>Más de 10 años: cada año.</li>
</ul>
<p>Taxis, VTC, ambulancias y algunos industriales tienen periodicidad más corta. La fecha exacta está en la ficha técnica y en el informe anterior. La DGT suele enviar un recordatorio; no esperes a la carta.</p>
    `,
  ),
];
