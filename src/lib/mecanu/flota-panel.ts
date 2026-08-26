/**
 * Vista flota del panel General: próximas citas + marcadores del mapa
 * (taller + conductores con última ubicación).
 */

import { coordsDesdeCatalogo, type Coords } from './geocode';
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

export type MarcadorFlota = {
  id: string;
  kind: 'taller' | 'conductor';
  label: string;
  lat: number;
  lng: number;
  /** ISO o Date de la última vez vista la app / GPS */
  actualizadaEn: Date | null;
  /** true si el ping es reciente (< 2 min) */
  enVivo: boolean;
  /** Texto tipo Find My: «Ahora», «hace 12 min», «Ayer 18:40» */
  ultimaVezLabel: string;
};

export type VistaFlota = {
  taller: Coords & { label: string; direccion: string };
  marcadores: MarcadorFlota[];
};

function asTime(v: Date | string | null | undefined): number | null {
  if (v == null) return null;
  const t = v instanceof Date ? v.getTime() : new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
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
 * Conductores con vehículo en movimiento del taller (en_ruta).
 * No incluye agendado/en_taller: el mapa es flota en calle, no agenda.
 */
export function conductorIdsEnServicioTaller(
  rutas: { estado: string; conductorId?: string | null }[],
): string[] {
  const ids = new Set<string>();
  for (const r of rutas) {
    if (!r.conductorId) continue;
    if (r.estado === 'en_ruta') ids.add(r.conductorId);
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

function edadAproxEnRutaMs(conductorId: string): number {
  let h = 0;
  for (let i = 0; i < conductorId.length; i++) h = (h * 17 + conductorId.charCodeAt(i)) >>> 0;
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

/**
 * Taller + conductores de ESTE taller en servicio en_ruta (GPS real o aprox.)
 * o con la app abierta en vivo. No pinta agendados ni la red entera.
 */
export function construirVistaFlota(opts: {
  tallerDireccion: string;
  tallerNombre: string;
  /** Conductores ya filtrados al taller (taller_id). */
  conductores: PosicionConductorInput[];
  tramos?: Pick<Tramo, 'conductorId' | 'estado' | 'posLat' | 'posLng' | 'posActualizadaEn'>[];
  /** Conductores en_ruta del taller. */
  conductorIdsActivos?: string[];
  ahora?: Date;
}): VistaFlota {
  const ahora = opts.ahora ?? new Date();
  const tallerCoords = coordsDesdeCatalogo(opts.tallerDireccion) ?? { lat: 41.3836, lng: 2.1381 };
  const taller: VistaFlota['taller'] = {
    ...tallerCoords,
    label: opts.tallerNombre,
    direccion: opts.tallerDireccion,
  };

  const enRuta = new Set(opts.conductorIdsActivos ?? []);
  for (const t of opts.tramos ?? []) {
    if (t.conductorId && t.estado === 'en_curso') enRuta.add(t.conductorId);
  }

  const liveByConductor = new Map<string, { lat: number; lng: number; en: Date }>();
  for (const t of opts.tramos ?? []) {
    if (!t.conductorId || t.posLat == null || t.posLng == null) continue;
    if (t.estado !== 'en_curso') continue;
    const en = t.posActualizadaEn
      ? (t.posActualizadaEn instanceof Date ? t.posActualizadaEn : new Date(t.posActualizadaEn))
      : ahora;
    if (Number.isNaN(en.getTime())) continue;
    const prev = liveByConductor.get(t.conductorId);
    if (!prev || en.getTime() > prev.en.getTime()) {
      liveByConductor.set(t.conductorId, { lat: t.posLat, lng: t.posLng, en });
    }
  }

  const marcadores: MarcadorFlota[] = [
    {
      id: 'taller',
      kind: 'taller',
      label: taller.label,
      lat: taller.lat,
      lng: taller.lng,
      actualizadaEn: null,
      enVivo: false,
      ultimaVezLabel: 'Taller',
    },
  ];

  for (const c of opts.conductores) {
    if (c.proceso === 'documentos_pendientes') continue;
    const live = liveByConductor.get(c.id);
    const enServicio = enRuta.has(c.id);
    let lat: number;
    let lng: number;
    let actualizadaEn: Date | null;
    let etiquetaFija: string | null = null;

    if (live) {
      lat = live.lat;
      lng = live.lng;
      actualizadaEn = live.en;
    } else if (c.posLat != null && c.posLng != null) {
      const raw = c.posActualizadaEn;
      actualizadaEn = raw
        ? (raw instanceof Date ? raw : new Date(raw))
        : null;
      if (actualizadaEn && Number.isNaN(actualizadaEn.getTime())) actualizadaEn = null;
      const age = actualizadaEn ? ahora.getTime() - actualizadaEn.getTime() : Infinity;
      const reciente = age >= 0 && age < EN_VIVO_MS;
      if (!enServicio && !reciente) continue;
      lat = c.posLat;
      lng = c.posLng;
    } else if (enServicio) {
      /* Servicio en ruta sin ping: aproximación cerca del taller para ver flota. */
      const seed = posSemillaConductor(c.id, tallerCoords);
      lat = seed.lat;
      lng = seed.lng;
      actualizadaEn = new Date(ahora.getTime() - edadAproxEnRutaMs(c.id));
      etiquetaFija = 'En ruta';
    } else {
      continue;
    }

    const age = actualizadaEn ? ahora.getTime() - actualizadaEn.getTime() : Infinity;
    const enVivo = !etiquetaFija && age >= 0 && age < EN_VIVO_MS;
    marcadores.push({
      id: c.id,
      kind: 'conductor',
      label: c.nombre.split(/\s+/).slice(0, 2).join(' '),
      lat,
      lng,
      actualizadaEn,
      enVivo,
      ultimaVezLabel: etiquetaFija ?? textoUltimaVez(actualizadaEn, ahora),
    });
  }

  return { taller, marcadores };
}
