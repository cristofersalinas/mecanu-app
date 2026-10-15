/**
 * Vista flota del panel General: próximas citas + marcadores del mapa
 * (autos en_ruta o en_taller).
 */

import { coordsDesdeCatalogo, type Coords } from './geocode';
import { urlFotoVehiculo } from './foto-vehiculo';
import type { Conductor, Tramo } from './types';

const DIA_MS = 86400000;
const EN_VIVO_MS = 2 * 60_000;

/** Forma mínima de ruta para el listado de citas (evita acoplar al RutaVista del mock). */
export type CitaRutaInput = {
  id: string;
  estado: string;
  fecha: Date | string | null;
  fechaPropuesta?: Date | string | null;
};

export type EstadoFlotaMapa = 'en_ruta' | 'en_taller';

export type MarcadorFlota = {
  id: string;
  /** Siempre la ruta: un pin = un auto en servicio. */
  rutaId: string;
  estado: EstadoFlotaMapa;
  /** Título corto en mapa / card (matrícula · modelo). */
  label: string;
  vehiculoLabel: string;
  conductorLabel: string | null;
  /** Dirección mostrada en la ficha. */
  direccion: string;
  lat: number;
  lng: number;
  actualizadaEn: Date | null;
  /** true si el ping GPS es reciente (< 2 min) */
  enVivo: boolean;
  /** Texto tipo Find My: «Ahora», «En ruta», «En taller»… */
  ultimaVezLabel: string;
  /** Marca y modelo del vehículo, si el panel ya los tiene. */
  marca: string | null;
  modelo: string | null;
  /** Foto del modelo; null si no hay marca y modelo. */
  fotoUrl: string | null;
};

export type VistaFlota = {
  taller: Coords & { label: string; direccion: string };
  marcadores: MarcadorFlota[];
};

export type RutaFlotaInput = {
  id: string;
  estado: string;
  conductorId: string | null;
  vehiculoLabel: string;
  conductorNombre: string | null;
  /** Dirección de card (origen / taller / destino según convenga al caller). */
  direccionCard: string | null;
  /** Del vehículo. Sin dato, null: no se inventa. */
  marca?: string | null;
  modelo?: string | null;
};

function asTime(v: Date | string | null | undefined): number | null {
  if (v == null) return null;
  const t = v instanceof Date ? v.getTime() : new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

export function esEstadoFlotaMapa(estado: string): estado is EstadoFlotaMapa {
  return estado === 'en_ruta' || estado === 'en_taller';
}

/** Texto relativo estilo «encontrar» / compartir ubicación. */
export function textoUltimaVez(actualizadaEn: Date | null, ahora: Date): string {
  if (!actualizadaEn) return 'Sin señal';
  const ms = ahora.getTime() - actualizadaEn.getTime();
  if (ms < 0) return 'Ahora';
  if (ms < 45_000) return 'Ahora';
  if (ms < EN_VIVO_MS) return 'En vivo';
  if (ms < 60_000) return 'hace 1 min';
  if (ms < 3600_000) return `hace ${Math.floor(ms / 60_000)} min`;
  if (ms < 24 * 3600_000) {
    const h = Math.floor(ms / 3600_000);
    return h === 1 ? 'hace 1 h' : `hace ${h} h`;
  }
  const ayer = new Date(ahora);
  ayer.setDate(ayer.getDate() - 1);
  const mismaAyer =
    actualizadaEn.getFullYear() === ayer.getFullYear()
    && actualizadaEn.getMonth() === ayer.getMonth()
    && actualizadaEn.getDate() === ayer.getDate();
  const hora = actualizadaEn.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  if (mismaAyer) return `Ayer ${hora}`;
  if (ms < 7 * DIA_MS) {
    const dia = actualizadaEn.toLocaleDateString('es-ES', { weekday: 'short' });
    return `${dia} ${hora}`;
  }
  return actualizadaEn.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ` ${hora}`;
}

/**
 * Citas del tablero General: hoy + próximos días (no solo «últimas 2 h»).
 * Incluye en_ruta aunque la ventana ya haya pasado; usa fecha o fechaPropuesta.
 */
export function proximasCitas<T extends CitaRutaInput>(
  rutas: T[],
  ahora: Date,
  { dias = 7, limite = 8 }: { dias?: number; limite?: number } = {},
): T[] {
  const inicioHoy = new Date(ahora);
  inicioHoy.setHours(0, 0, 0, 0);
  const fin = new Date(inicioHoy.getTime() + dias * DIA_MS);

  const scored = rutas.flatMap((r) => {
    if (r.estado === 'cancelado' || r.estado === 'completado') return [];
    const f = r.fecha ?? r.fechaPropuesta ?? null;
    const t = asTime(f);
    if (r.estado === 'en_ruta') {
      return [{ r, sort: t ?? ahora.getTime() - DIA_MS, prior: 0 }];
    }
    if (t == null) return [];
    if (t < inicioHoy.getTime() || t >= fin.getTime()) return [];
    if (r.estado !== 'agendado' && r.estado !== 'en_taller' && r.estado !== 'prospectos') return [];
    if (r.estado === 'prospectos' && !r.fechaPropuesta && !r.fecha) return [];
    return [{ r, sort: t, prior: 1 }];
  });

  return scored
    .sort((a, b) => a.prior - b.prior || a.sort - b.sort)
    .slice(0, limite)
    .map((x) => x.r);
}

/**
 * Conductores con ruta activa en el mapa (en_ruta o en_taller).
 * Útil para filtrar listados; el mapa usa `construirVistaFlota` por ruta.
 */
export function conductorIdsEnServicioTaller(
  rutas: { estado: string; conductorId?: string | null }[],
): string[] {
  const ids = new Set<string>();
  for (const r of rutas) {
    if (!r.conductorId) continue;
    if (esEstadoFlotaMapa(r.estado)) ids.add(r.conductorId);
  }
  return [...ids];
}

export function posSemillaConductor(conductorId: string, taller: Coords): Coords {
  let h = 0;
  for (let i = 0; i < conductorId.length; i++) h = (h * 31 + conductorId.charCodeAt(i)) >>> 0;
  const ang = ((h % 360) * Math.PI) / 180;
  const km = 0.4 + (h % 50) / 100; /* 0,4–0,9 km */
  const dLat = (km / 111) * Math.cos(ang);
  const dLng = (km / (111 * Math.cos((taller.lat * Math.PI) / 180))) * Math.sin(ang);
  return { lat: taller.lat + dLat, lng: taller.lng + dLng };
}

function edadAproxEnRutaMs(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 17 + seed.charCodeAt(i)) >>> 0;
  /* Entre 1 y 25 min: parece un viaje en curso sin ping fresco */
  return 60_000 + (h % 25) * 60_000;
}

export type PosicionConductorInput = {
  id: string;
  nombre: string;
  proceso?: Conductor['proceso'];
  /** Solo flota del taller: no mezclar conductores de otros talleres. */
  red?: Conductor['red'];
  posLat?: number | null;
  posLng?: number | null;
  posActualizadaEn?: Date | string | null;
};

type LivePos = { lat: number; lng: number; en: Date };

/**
 * Marcadores de autos en_ruta / en_taller (uno por ruta).
 * Sin pin fijo del taller: los de en_taller caen en sus coords.
 */
export function construirVistaFlota(opts: {
  tallerDireccion: string;
  tallerNombre: string;
  rutas: RutaFlotaInput[];
  /** Posiciones GPS por conductor (fallback si el tramo no trae ping). */
  conductores?: PosicionConductorInput[];
  tramos?: Pick<Tramo, 'rutaId' | 'conductorId' | 'estado' | 'posLat' | 'posLng' | 'posActualizadaEn'>[];
  ahora?: Date;
}): VistaFlota {
  const ahora = opts.ahora ?? new Date();
  const tallerCoords = coordsDesdeCatalogo(opts.tallerDireccion) ?? { lat: 41.3836, lng: 2.1381 };
  const taller: VistaFlota['taller'] = {
    ...tallerCoords,
    label: opts.tallerNombre,
    direccion: opts.tallerDireccion,
  };

  const liveByRuta = new Map<string, LivePos>();
  const liveByConductor = new Map<string, LivePos>();
  for (const t of opts.tramos ?? []) {
    if (t.posLat == null || t.posLng == null) continue;
    if (t.estado !== 'en_curso') continue;
    const en = t.posActualizadaEn
      ? (t.posActualizadaEn instanceof Date ? t.posActualizadaEn : new Date(t.posActualizadaEn))
      : ahora;
    if (Number.isNaN(en.getTime())) continue;
    const pos = { lat: t.posLat, lng: t.posLng, en };
    const prevR = liveByRuta.get(t.rutaId);
    if (!prevR || en.getTime() > prevR.en.getTime()) liveByRuta.set(t.rutaId, pos);
    if (t.conductorId) {
      const prevC = liveByConductor.get(t.conductorId);
      if (!prevC || en.getTime() > prevC.en.getTime()) liveByConductor.set(t.conductorId, pos);
    }
  }

  const conductorById = new Map((opts.conductores ?? []).map((c) => [c.id, c]));
  const marcadores: MarcadorFlota[] = [];

  for (const r of opts.rutas) {
    if (!esEstadoFlotaMapa(r.estado)) continue;

    const vehiculoLabel = r.vehiculoLabel.trim() || r.id;
    const conductorLabel = r.conductorNombre
      ? r.conductorNombre.split(/\s+/).slice(0, 2).join(' ')
      : null;

    let lat: number;
    let lng: number;
    let actualizadaEn: Date | null;
    let ultimaVezLabel: string;
    let enVivo: boolean;

    if (r.estado === 'en_taller') {
      lat = tallerCoords.lat;
      lng = tallerCoords.lng;
      actualizadaEn = null;
      ultimaVezLabel = 'En taller';
      enVivo = false;
    } else {
      const live = liveByRuta.get(r.id)
        ?? (r.conductorId ? liveByConductor.get(r.conductorId) : undefined);
      const c = r.conductorId ? conductorById.get(r.conductorId) : undefined;

      if (live) {
        lat = live.lat;
        lng = live.lng;
        actualizadaEn = live.en;
        const age = ahora.getTime() - live.en.getTime();
        enVivo = age >= 0 && age < EN_VIVO_MS;
        ultimaVezLabel = textoUltimaVez(actualizadaEn, ahora);
      } else if (c?.posLat != null && c.posLng != null) {
        const raw = c.posActualizadaEn;
        actualizadaEn = raw
          ? (raw instanceof Date ? raw : new Date(raw))
          : null;
        if (actualizadaEn && Number.isNaN(actualizadaEn.getTime())) actualizadaEn = null;
        lat = c.posLat;
        lng = c.posLng;
        const age = actualizadaEn ? ahora.getTime() - actualizadaEn.getTime() : Infinity;
        enVivo = age >= 0 && age < EN_VIVO_MS;
        ultimaVezLabel = textoUltimaVez(actualizadaEn, ahora);
      } else {
        const seedId = r.conductorId ?? r.id;
        const seed = posSemillaConductor(seedId, tallerCoords);
        lat = seed.lat;
        lng = seed.lng;
        actualizadaEn = new Date(ahora.getTime() - edadAproxEnRutaMs(seedId));
        ultimaVezLabel = 'En ruta';
        enVivo = false;
      }
    }

    const direccion = (r.direccionCard?.trim() || taller.direccion);
    const marca = r.marca?.trim() || null;
    const modelo = r.modelo?.trim() || null;

    marcadores.push({
      id: r.id,
      rutaId: r.id,
      estado: r.estado,
      label: vehiculoLabel,
      vehiculoLabel,
      conductorLabel,
      direccion,
      lat,
      lng,
      actualizadaEn,
      enVivo,
      ultimaVezLabel,
      marca,
      modelo,
      fotoUrl: urlFotoVehiculo({ marca, modelo }),
    });
  }

  return { taller, marcadores };
}
