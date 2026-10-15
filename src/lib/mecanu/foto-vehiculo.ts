/**
 * Fotos de vehículo por marca/modelo.
 *
 * APIs de estudio (Imagin, CarImages API free, etc.) meten watermark sin plan
 * de pago. Usamos miniaturas de Wikipedia/Commons (sin watermark comercial).
 * Índice open-data útil: carimages.org + HF `carimages/carimages-rights`
 * (URLs Commons con licencia resuelta; CC0/PD sin atribución obligatoria).
 * La UI pide el proxy same-origin `/api/v1/vehicle-photo` (CSP).
 *
 * `v=wiki2` en la query rompe caché de respuestas antiguas (Imagin).
 */

export type FotoVehiculoOpts = {
  marca: string | null | undefined;
  modelo: string | null | undefined;
  /** Ancho de miniatura Wikipedia (píxeles). */
  width?: number;
};

function slugWiki(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .replace(/\s+/g, '_');
}

/**
 * Títulos de artículo EN (mejor cobertura de fotos) a partir de marca/modelo ES.
 */
export function titulosWikipediaVehiculo(marca: string, modelo: string): string[] {
  const marcaTrim = marca.trim();
  const modeloTrim = modelo.trim();
  if (!marcaTrim || !modeloTrim) return [];

  const makeSlug = slugWiki(marcaTrim);
  const modelSlug = slugWiki(modeloTrim);
  const out: string[] = [];

  const push = (t: string) => {
    if (t && !out.includes(t)) out.push(t);
  };

  /* Mercedes «Clase A» → Mercedes-Benz_A-Class */
  const clase = /^clase[_\s-]+([a-z0-9]+)$/i.exec(modeloTrim.replace(/\s+/g, '_'));
  if (/mercedes/i.test(marcaTrim) && clase) {
    push(`Mercedes-Benz_${clase[1]!.toUpperCase()}-Class`);
    push(`Mercedes-Benz_${clase[1]}-Class`);
  }

  /* BMW «Serie 1» → BMW_1_Series */
  const serie = /^serie[_\s-]+(\d+)$/i.exec(modeloTrim.replace(/\s+/g, '_'));
  if (/^bmw$/i.test(marcaTrim) && serie) {
    push(`BMW_${serie[1]}_Series`);
  }

  /* Seat León → SEAT_León / SEAT_Leon */
  if (/^seat$/i.test(marcaTrim)) {
    push(`SEAT_${modelSlug}`);
    push(`SEAT_${slugWiki(modeloTrim.normalize('NFC'))}`);
  }

  /* Škoda → Skoda_Octavia también */
  if (/skoda|škoda/i.test(marcaTrim)) {
    push(`Skoda_${modelSlug}`);
    push(`Škoda_${modelSlug}`);
  }

  /* Citroën */
  if (/citroen|citroën/i.test(marcaTrim)) {
    push(`Citroën_${modelSlug}`);
    push(`Citroen_${modelSlug}`);
  }

  /* Alfa Romeo Giulia */
  if (/alfa/i.test(marcaTrim)) {
    push(`Alfa_Romeo_${modelSlug}`);
  }

  /* Genérico Marca_Modelo */
  push(`${makeSlug}_${modelSlug}`);
  /* A veces el artículo es solo el modelo con marca en el texto */
  push(`${makeSlug} ${modeloTrim}`.replace(/\s+/g, '_'));

  return out;
}

/** URL para `<img>` en el panel: proxy same-origin. */
export function urlFotoVehiculo(opts: FotoVehiculoOpts): string | null {
  const marca = opts.marca?.trim();
  const modelo = opts.modelo?.trim();
  if (!marca || !modelo) return null;
  const params = new URLSearchParams({ marca, modelo, v: 'wiki2' });
  if (opts.width) params.set('width', String(opts.width));
  return `/api/v1/vehicle-photo?${params.toString()}`;
}

const WIKI_UA =
  'MecanuPanel/1.0 (https://mecanu.com; panel flota demo; cris@mecanu.com)';

type WikiPages = Record<string, {
  missing?: boolean;
  thumbnail?: { source: string };
  title?: string;
}>;

async function thumbDesdeTitulos(
  titles: string[],
  width: number,
  lang: 'en' | 'es',
): Promise<string | null> {
  if (!titles.length) return null;
  const api = `https://${lang}.wikipedia.org/w/api.php`;
  const params = new URLSearchParams({
    action: 'query',
    titles: titles.slice(0, 8).join('|'),
    prop: 'pageimages',
    pithumbsize: String(width),
    format: 'json',
    redirects: '1',
    origin: '*',
  });
  const res = await fetch(`${api}?${params.toString()}`, {
    headers: { 'User-Agent': WIKI_UA, Accept: 'application/json' },
    next: { revalidate: 86_400 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { query?: { pages?: WikiPages } };
  const pages = Object.values(data.query?.pages ?? {});
  for (const p of pages) {
    if (p.missing) continue;
    if (p.thumbnail?.source) return p.thumbnail.source;
  }
  return null;
}

/** Resuelve URL de miniatura Wikimedia (servidor). */
export async function resolverUrlFotoVehiculoUpstream(
  opts: FotoVehiculoOpts,
): Promise<string | null> {
  const marca = opts.marca?.trim();
  const modelo = opts.modelo?.trim();
  if (!marca || !modelo) return null;
  const width = opts.width ?? 640;
  const titles = titulosWikipediaVehiculo(marca, modelo);
  return (
    (await thumbDesdeTitulos(titles, width, 'en'))
    ?? (await thumbDesdeTitulos(titles, width, 'es'))
  );
}
