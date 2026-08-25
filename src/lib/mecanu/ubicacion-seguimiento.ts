/**
 * Construye el payload público de ubicación para `/s/{token}`.
 * Sin trail ni PII — solo puntos para el mapa.
 */
import { calloutSeguimiento } from './gps-conductor';
import type { Parada, RutaVista, Tramo } from './types';
import type { UbicacionSeguimientoPublico } from './repo/repo';

function puntoParada(
  p: Parada | null | undefined,
  labelFallback: string,
): UbicacionSeguimientoPublico['origen'] {
  if (!p || p.lat == null || p.lng == null) return null;
  return {
    lat: p.lat,
    lng: p.lng,
    label: p.etiqueta || labelFallback,
  };
}

export function construirUbicacionSeguimiento(opts: {
  token: string;
  ruta: RutaVista;
  tramo: Tramo | null;
  origen: Parada | null;
  destino: Parada | null;
}): UbicacionSeguimientoPublico {
  const { token, ruta, tramo, origen, destino } = opts;
  const visible = ruta.estado === 'en_ruta';
  const cond =
    visible && tramo?.posLat != null && tramo.posLng != null
      ? {
          lat: tramo.posLat,
          lng: tramo.posLng,
          actualizadoEn: (tramo.posActualizadaEn ?? new Date()).toISOString(),
        }
      : null;

  return {
    token,
    rutaId: ruta.id,
    estadoId: ruta.estado,
    subestado: ruta.subestado,
    callout: calloutSeguimiento({
      estadoId: ruta.estado,
      subestado: ruta.subestado,
      hayConductor: Boolean(tramo?.conductorId),
    }),
    visible,
    conductor: cond,
    origen: puntoParada(origen, ruta.etiquetaOrigen ?? 'Origen'),
    destino: puntoParada(destino, ruta.etiquetaDestino ?? 'Destino'),
  };
}
