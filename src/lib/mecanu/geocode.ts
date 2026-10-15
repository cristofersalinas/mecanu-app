/**
 * Geocodificación de direcciones → lat/lng para paradas.
 * 1) Catálogo local de direcciones seed (Barcelona / taller).
 * 2) Google Geocoding si hay NEXT_PUBLIC_GOOGLE_MAPS_KEY.
 * 3) null si no hay resultado (no inventar coords).
 */

export type Coords = { lat: number; lng: number };

/** Coords aproximadas de direcciones del mock (Nominatim / conocimiento local). */
const CATALOGO: Record<string, Coords> = {
  'carrer de numancia 105, nau 3, 08029 barcelona': { lat: 41.3836, lng: 2.1381 },
  'carrer de numància 105, nau 3, 08029 barcelona': { lat: 41.3836, lng: 2.1381 },
  'carrer de muntaner 340, 3ob, 08021 barcelona': { lat: 41.4008, lng: 2.1432 },
  'carrer de muntaner 340, 3ºb, 08021 barcelona': { lat: 41.4008, lng: 2.1432 },
  'via augusta 128, 2oa, 08006 barcelona': { lat: 41.3975, lng: 2.1512 },
  'via augusta 128, 2ºa, 08006 barcelona': { lat: 41.3975, lng: 2.1512 },
  'carrer de balmes 340, 5oc, 08006 barcelona': { lat: 41.4012, lng: 2.1458 },
  'carrer de balmes 340, 5ºc, 08006 barcelona': { lat: 41.4012, lng: 2.1458 },
  'avinguda de pedralbes 25, 08034 barcelona': { lat: 41.3928, lng: 2.1135 },
  'passeig de la bonanova 42, 08017 barcelona': { lat: 41.4025, lng: 2.1298 },
  'carrer del capita arenas 18, 08034 barcelona': { lat: 41.3889, lng: 2.1201 },
  'carrer del capità arenas 18, 08034 barcelona': { lat: 41.3889, lng: 2.1201 },
  'carrer de sarria 95, 1oa, 08017 barcelona': { lat: 41.3981, lng: 2.1254 },
  'carrer de sarrià 95, 1ºa, 08017 barcelona': { lat: 41.3981, lng: 2.1254 },
  'carrer de calvet 30, 08021 barcelona': { lat: 41.3956, lng: 2.1412 },
  'carrer del doctor roux 55, 08017 barcelona': { lat: 41.3998, lng: 2.1276 },
  'carrer de modolell 40, 1od, 08006 barcelona': { lat: 41.4031, lng: 2.1405 },
  'carrer de modolell 40, 1ºd, 08006 barcelona': { lat: 41.4031, lng: 2.1405 },
  'carrer de mandri 12, 08022 barcelona': { lat: 41.4062, lng: 2.1388 },
  'carrer de ganduxer 88, 08021 barcelona': { lat: 41.3944, lng: 2.1362 },
  'carrer major de sarria 78, 08017 barcelona': { lat: 41.3972, lng: 2.1228 },
  'carrer major de sarrià 78, 08017 barcelona': { lat: 41.3972, lng: 2.1228 },
  'avinguda diagonal 640, 08017 barcelona': { lat: 41.3918, lng: 2.1284 },
  'carrer de balmes 145, 08006 barcelona': { lat: 41.3952, lng: 2.1521 },
  'carrer de provença 210, 2oa, 08036 barcelona': { lat: 41.3918, lng: 2.1604 },
  'carrer de provença 210, 08036 barcelona': { lat: 41.3918, lng: 2.1604 },
  'carrer de provenca 210, 2oa, 08036 barcelona': { lat: 41.3918, lng: 2.1604 },
  'carrer de provenca 210, 08036 barcelona': { lat: 41.3918, lng: 2.1604 },
};

function normalizarDireccion(dir: string): string {
  return dir
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[º°]/g, 'o')
    .replace(/\s+/g, ' ');
}

export function coordsDesdeCatalogo(direccion: string | null | undefined): Coords | null {
  if (!direccion?.trim()) return null;
  const key = normalizarDireccion(direccion);
  if (CATALOGO[key]) return CATALOGO[key];
  // Match por prefijo de calle + CP si el piso varía
  for (const [k, v] of Object.entries(CATALOGO)) {
    const calleCp = k.replace(/,\s*\d+[oa][^,]*,/, ',');
    if (key.includes(calleCp.split(',')[0]!) && key.includes(k.slice(-17))) return v;
  }
  return null;
}

async function geocodeGoogle(direccion: string): Promise<Coords | null> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY?.trim();
  if (!key) return null;
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', direccion);
  url.searchParams.set('key', key);
  url.searchParams.set('region', 'es');
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      status: string;
      results?: { geometry?: { location?: { lat: number; lng: number } } }[];
    };
    if (data.status !== 'OK' || !data.results?.[0]?.geometry?.location) return null;
    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  } catch {
    return null;
  }
}

/** Resuelve coords: catálogo → Google → null. */
export async function geocodificarDireccion(
  direccion: string | null | undefined,
): Promise<Coords | null> {
  const local = coordsDesdeCatalogo(direccion);
  if (local) return local;
  if (!direccion?.trim()) return null;
  return geocodeGoogle(direccion.trim());
}
