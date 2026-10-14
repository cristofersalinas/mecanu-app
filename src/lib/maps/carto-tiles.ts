/**
 * Tiles raster CARTO para MapLibre.
 * Sin `NEXT_PUBLIC_CARTO_API_KEY` llegan con watermark «API KEY REQUIRED».
 * Key gratis: https://carto.com/basemaps/apikey
 */

export type CartoRasterStyle = 'light_all' | 'light_nolabels';

export function tilesCartoRaster(style: CartoRasterStyle): string[] {
  const key = process.env.NEXT_PUBLIC_CARTO_API_KEY?.trim();
  const q = key ? `?key=${encodeURIComponent(key)}` : '';
  return [
    `https://a.basemaps.cartocdn.com/${style}/{z}/{x}/{y}.png${q}`,
    `https://b.basemaps.cartocdn.com/${style}/{z}/{x}/{y}.png${q}`,
    `https://c.basemaps.cartocdn.com/${style}/{z}/{x}/{y}.png${q}`,
  ];
}
