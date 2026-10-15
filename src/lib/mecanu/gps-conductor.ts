/**
 * GPS del conductor: permiso, watch throttled y criterio de envío.
 * La UI solo pide estado; no conoce Geolocation API.
 */

export type GpsPermiso = 'pendiente' | 'concedido' | 'denegado' | 'no_soportado';

export type GpsPunto = {
  lat: number;
  lng: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  ts: string;
};

export type GpsGateEstado = {
  permiso: GpsPermiso;
  punto: GpsPunto | null;
  error: string | null;
};

/** Throttle por tiempo (ms) o distancia (m): se envía si se cumple cualquiera. */
export const GPS_THROTTLE_MS = 20_000;
export const GPS_THROTTLE_M = 50;

const R_EARTH_M = 6_371_000;

export function distanciaMetros(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function debeEnviarPing(
  ultimo: GpsPunto | null,
  actual: GpsPunto,
  ahoraMs = Date.parse(actual.ts),
  opts: { throttleMs?: number; throttleM?: number } = {},
): boolean {
  const throttleMs = opts.throttleMs ?? GPS_THROTTLE_MS;
  const throttleM = opts.throttleM ?? GPS_THROTTLE_M;
  if (!ultimo) return true;
  const dt = ahoraMs - Date.parse(ultimo.ts);
  if (dt >= throttleMs) return true;
  return distanciaMetros(ultimo, actual) >= throttleM;
}

export function puntoDesdePosition(pos: GeolocationPosition): GpsPunto {
  const c = pos.coords;
  return {
    lat: c.latitude,
    lng: c.longitude,
    accuracy: Number.isFinite(c.accuracy) ? c.accuracy : null,
    heading: c.heading != null && Number.isFinite(c.heading) ? c.heading : null,
    speed: c.speed != null && Number.isFinite(c.speed) ? c.speed : null,
    ts: new Date(pos.timestamp).toISOString(),
  };
}

export function mensajeErrorGps(code: number | null | undefined): string {
  switch (code) {
    case 1:
      return 'Has denegado el acceso a la ubicación. Actívalo en Ajustes del navegador para usar Mecanu Conductor.';
    case 2:
      return 'No se pudo obtener la ubicación. Comprueba que el GPS del teléfono esté activado.';
    case 3:
      return 'La ubicación tarda demasiado. Sal al exterior o reintenta.';
    default:
      return 'Sin ubicación no puedes usar la app del conductor.';
  }
}

const GPS_POS_AUSENTE =
  /pos_actualizada_en|pos_lat|pos_lng|traslado_ubicaciones|schema cache|does not exist|Could not find|PGRST204|PGRST205/i;

/** La columna de posición en el tramo aún no está migrada: el trail sí puede guardarse. */
export function gpsPosicionEsquemaAusente(mensaje: string): boolean {
  return GPS_POS_AUSENTE.test(mensaje);
}

export function geolocationDisponible(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.geolocation !== 'undefined';
}

/** Opciones estrictas: alta precisión, sin cache vieja. */
export const GPS_WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 5_000,
  timeout: 20_000,
};

export function calloutSeguimiento(opts: {
  estadoId: string;
  subestado: string;
  hayConductor: boolean;
}): string {
  if (opts.estadoId === 'completado') return 'Traslado completado';
  if (opts.estadoId === 'cancelado') return 'Traslado cancelado';
  if (opts.estadoId === 'en_taller') return 'El vehículo está en el taller';
  if (opts.estadoId !== 'en_ruta') {
    return opts.hayConductor ? 'Conductor asignado' : 'Pendiente de salir a ruta';
  }
  switch (opts.subestado) {
    case 'en_camino_origen':
      return 'En camino a recogerte';
    case 'en_origen':
      return 'Recogiendo el vehículo';
    case 'en_transito':
      return 'En camino al destino';
    case 'en_destino':
      return 'En el punto de entrega';
    default:
      return 'En ruta';
  }
}
