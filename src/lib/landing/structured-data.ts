import { copyFor } from "./copy";
import { LOCALES, LOCALE_META, pathFor, type Locale } from "./locales";
import { absoluteUrl } from "./site";

/**
 * JSON-LD de la landing.
 *
 * `Organization` + `SoftwareApplication`, nunca `LocalBusiness`: Mecanu no es
 * un negocio con local al que se va, es un servicio de logística con producto
 * de software. Marcar `LocalBusiness` pediría dirección y horario de atención
 * al público y sería declarar algo falso.
 *
 * Sin `aggregateRating` ni `review`: no hay reseñas reales que respalden esos
 * campos, e inventarlos es motivo de penalización manual de Google.
 */

const ORGANIZATION_ID = absoluteUrl("/#organizacion");
const SOFTWARE_ID = absoluteUrl("/#producto");

function organizacion(locale: Locale) {
  const copy = copyFor(locale);
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Mecanu",
    url: absoluteUrl(pathFor(locale)),
    description: copy.meta.description,
    slogan: copy.hero.headline,
    areaServed: { "@type": "Country", name: "España" },
  };
}

function producto(locale: Locale) {
  const copy = copyFor(locale);
  return {
    "@type": "SoftwareApplication",
    "@id": SOFTWARE_ID,
    name: "Mecanu",
    url: absoluteUrl(pathFor(locale)),
    description: copy.meta.description,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Logistics",
    operatingSystem: "Web",
    inLanguage: LOCALES.map((id) => LOCALE_META[id].hreflang),
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Un solo `@graph` en lugar de varios bloques sueltos: así los dos nodos se
 * referencian entre sí por `@id` y los validadores los leen como una entidad
 * y su producto, no como dos cosas sin relación.
 */
export function landingJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [organizacion(locale), producto(locale)],
  };
}
