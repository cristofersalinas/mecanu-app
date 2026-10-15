'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Map as MapLibreMap,
  setWorkerUrl,
  type GeoJSONSource,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Icon } from '@/components/ds/Icon';
import type { MarcadorFlota } from '@/lib/mecanu/flota-panel';
import { urlFotoVehiculo } from '@/lib/mecanu/foto-vehiculo';
import { tilesCartoRaster } from '@/lib/maps/carto-tiles';
import {
  ICONO_CONDUCTOR_DEFAULT,
  ICONOS_CONDUCTOR_FLOTA,
  type IconoConductorFlota,
} from './flota-icono-conductor';
import styles from '../panel.module.css';

function IconoVolante({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ flex: 'none', display: 'block' }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 3.5V9.5M5.8 16.2L9.2 13.6M18.2 16.2L14.8 13.6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function glifoIconoConductor(id: IconoConductorFlota, size = 16) {
  const opt = ICONOS_CONDUCTOR_FLOTA.find((x) => x.id === id);
  if (!opt?.icon) return <IconoVolante size={size} />;
  return <Icon name={opt.icon} size="sm" />;
}

const MAP_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster',
      tiles: tilesCartoRaster('light_all'),
      tileSize: 256,
      attribution: '© OpenStreetMap © CARTO',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

/** Contador fijo solo en el taller. En ruta: un icono por auto, sin cluster. */
const PIN_ICON_SIZE = 0.92; /* −20 % vs 1.15 */
const CONDUCTOR_ICON_SIZE = 0.52; /* −50 % vs 1.05 */
const FLOTA_ICON_ID = 'flota-conductor';

function coleccionVacia(): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return { type: 'FeatureCollection', features: [] };
}

function enRutaGeoJSON(marcadores: MarcadorFlota[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: marcadores
      .filter((m) => m.estado === 'en_ruta')
      .map((m) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
        properties: {
          id: m.id,
          rutaId: m.rutaId,
          label: m.label,
          estado: m.estado,
        },
      })),
  };
}

type TallerMapa = {
  lat: number;
  lng: number;
  label: string;
  direccion: string;
  countEnTaller: number;
};

function tallerGeoJSON(t: TallerMapa | null): GeoJSON.FeatureCollection<GeoJSON.Point> {
  if (!t) return coleccionVacia();
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [t.lng, t.lat] },
        properties: {
          kind: 'taller',
          count: t.countEnTaller,
          label: t.label,
          direccion: t.direccion,
        },
      },
    ],
  };
}

function seleccionGeoJSON(pt: { lat: number; lng: number } | null): GeoJSON.FeatureCollection {
  if (!pt) return coleccionVacia();
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [pt.lng, pt.lat] },
        properties: {},
      },
    ],
  };
}

const VISTA_MAX_ZOOM = 12.8;

function vistaPorDefecto(
  map: MapLibreMap,
  points: { lat: number; lng: number }[],
  taller: { lat: number; lng: number } | null,
  opts?: { duration?: number },
) {
  const pts = points.length ? points : (taller ? [taller] : []);
  if (!pts.length) return;
  const duration = opts?.duration ?? 450;
  if (pts.length === 1) {
    map.easeTo({ center: [pts[0].lng, pts[0].lat], zoom: Math.min(14, VISTA_MAX_ZOOM + 0.5), duration });
    return;
  }
  const lngs = pts.map((p) => p.lng);
  const lats = pts.map((p) => p.lat);
  map.fitBounds(
    [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    { padding: 72, maxZoom: VISTA_MAX_ZOOM, duration },
  );
}

function aplicarSeleccion(map: MapLibreMap, pt: { lat: number; lng: number } | null) {
  (map.getSource('seleccion') as GeoJSONSource | undefined)?.setData(seleccionGeoJSON(pt));
}

/** Pin rojo tipo Maps (gota + punto blanco). */
function iconoPinRojo(): ImageData {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new ImageData(size, size);

  const cx = 64;
  const headY = 52;
  const headR = 38;
  const tipY = 118;

  /* Sombra */
  ctx.fillStyle = 'rgba(15,15,15,0.18)';
  ctx.beginPath();
  ctx.ellipse(cx, tipY - 2, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Cuerpo gota */
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.bezierCurveTo(cx - 6, tipY - 18, cx - headR, headY + headR * 0.55, cx - headR, headY);
  ctx.arc(cx, headY, headR, Math.PI, 0, false);
  ctx.bezierCurveTo(cx + headR, headY + headR * 0.55, cx + 6, tipY - 18, cx, tipY);
  ctx.closePath();
  ctx.fill();

  /* Borde sutil */
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 2;
  ctx.stroke();

  /* Punto interior */
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, headY, 15, 0, Math.PI * 2);
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
}

/** Volante negro sobre fondo blanco (conductores en ruta). */
function iconoVolante(): ImageData {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new ImageData(size, size);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f0f0f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#0f0f0f';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(64, 64, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(64, 64, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(64, 24);
  ctx.lineTo(64, 50);
  ctx.moveTo(36, 80);
  ctx.lineTo(54, 68);
  ctx.moveTo(92, 80);
  ctx.lineTo(74, 68);
  ctx.stroke();
  return ctx.getImageData(0, 0, size, size);
}

/** Auto negro sobre fondo blanco. */
function iconoAuto(): ImageData {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new ImageData(size, size);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f0f0f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#0f0f0f';
  /* carrocería */
  ctx.beginPath();
  ctx.moveTo(28, 72);
  ctx.lineTo(36, 56);
  ctx.lineTo(52, 48);
  ctx.lineTo(78, 48);
  ctx.lineTo(94, 58);
  ctx.lineTo(100, 72);
  ctx.closePath();
  ctx.fill();
  /* habitáculo (recorte claro) */
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(48, 56);
  ctx.lineTo(54, 52);
  ctx.lineTo(74, 52);
  ctx.lineTo(82, 58);
  ctx.lineTo(48, 58);
  ctx.closePath();
  ctx.fill();
  /* ruedas */
  ctx.fillStyle = '#0f0f0f';
  ctx.beginPath();
  ctx.arc(44, 74, 9, 0, Math.PI * 2);
  ctx.arc(84, 74, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(44, 74, 3.5, 0, Math.PI * 2);
  ctx.arc(84, 74, 3.5, 0, Math.PI * 2);
  ctx.fill();
  return ctx.getImageData(0, 0, size, size);
}

/** Persona negra sobre fondo blanco. */
function iconoPersona(): ImageData {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new ImageData(size, size);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f0f0f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#0f0f0f';
  ctx.beginPath();
  ctx.arc(64, 44, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(64, 60);
  ctx.bezierCurveTo(40, 60, 34, 78, 34, 96);
  ctx.lineTo(94, 96);
  ctx.bezierCurveTo(94, 78, 88, 60, 64, 60);
  ctx.closePath();
  ctx.fill();
  return ctx.getImageData(0, 0, size, size);
}

function imagenConductor(kind: IconoConductorFlota): ImageData {
  if (kind === 'volante') return iconoVolante();
  if (kind === 'persona') return iconoPersona();
  return iconoAuto();
}

function mapsUrlQuery(q: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function mapsUrlMarcador(m: MarcadorFlota): string {
  const q = m.direccion?.trim() ? m.direccion : `${m.lat},${m.lng}`;
  return mapsUrlQuery(q);
}

function FlotaPlacePhoto({ marcador }: { marcador: MarcadorFlota }) {
  const src = marcador.fotoUrl
    ?? (marcador.marca && marcador.modelo
      ? urlFotoVehiculo({ marca: marcador.marca, modelo: marcador.modelo })
      : null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const error = failedSrc != null && failedSrc === src;

  if (!src || error) {
    return (
      <div className={styles.flotaMapPlacePhoto} aria-hidden>
        <Icon name="directions_car" size="xl" />
      </div>
    );
  }

  return (
    <div className={styles.flotaMapPlacePhoto}>
      <img
        className={styles.flotaMapPlacePhotoImg}
        src={src}
        alt={marcador.marca && marcador.modelo
          ? `${marcador.marca} ${marcador.modelo}`
          : ''}
        onError={() => { if (src) setFailedSrc(src); }}
      />
    </div>
  );
}

type Selected =
  | { kind: 'ruta'; marcador: MarcadorFlota }
  | { kind: 'taller'; count: number; label: string; direccion: string; lat: number; lng: number };

type Props = {
  marcadores: MarcadorFlota[];
  tallerFallback?: { lat: number; lng: number; label?: string; direccion?: string } | null;
  onAbrirRuta?: (rutaId: string) => void;
  /** Icono de pines en ruta. Por defecto auto. */
  iconoConductor?: IconoConductorFlota;
  onIconoConductorChange?: (id: IconoConductorFlota) => void;
  style?: React.CSSProperties;
};

function tallerDesdeProps(
  marcadores: MarcadorFlota[],
  tallerFallback: Props['tallerFallback'],
): TallerMapa | null {
  if (!tallerFallback) return null;
  return {
    lat: tallerFallback.lat,
    lng: tallerFallback.lng,
    label: tallerFallback.label ?? 'Taller',
    direccion: tallerFallback.direccion ?? '',
    countEnTaller: marcadores.filter((m) => m.estado === 'en_taller').length,
  };
}

/** Mapa del dashboard: icono de conductor en ruta, pin rojo + contador fijo en taller. */
export function FlotaMapa({
  marcadores,
  tallerFallback = null,
  onAbrirRuta,
  iconoConductor = ICONO_CONDUCTOR_DEFAULT,
  onIconoConductorChange,
  style,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const marcadoresRef = useRef(marcadores);
  const defaultPointsRef = useRef<{ lat: number; lng: number }[]>([]);
  const tallerRef = useRef(tallerDesdeProps(marcadores, tallerFallback));
  const iconoConductorRef = useRef(iconoConductor);
  const fittedKeyRef = useRef('');
  const cursorEnMapaRef = useRef(false);
  const recenterTimerRef = useRef<number | null>(null);
  /** Si el usuario pan/zoom a mano, no robamos el encuadre al hidratar datos. */
  const mapaMovidoPorUsuarioRef = useRef(false);
  const iconMenuRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [iconMenuOpen, setIconMenuOpen] = useState(false);

  useEffect(() => {
    marcadoresRef.current = marcadores;
    tallerRef.current = tallerDesdeProps(marcadores, tallerFallback);
    iconoConductorRef.current = iconoConductor;
  }, [marcadores, tallerFallback, iconoConductor]);

  const cancelarRecentrar = useCallback(() => {
    if (recenterTimerRef.current != null) {
      window.clearTimeout(recenterTimerRef.current);
      recenterTimerRef.current = null;
    }
  }, []);

  const centrar = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    mapaMovidoPorUsuarioRef.current = false;
    setSelected(null);
    aplicarSeleccion(map, null);
    vistaPorDefecto(map, defaultPointsRef.current, tallerRef.current);
  }, []);

  const zoomIn = useCallback(() => {
    mapaMovidoPorUsuarioRef.current = true;
    mapRef.current?.zoomIn({ duration: 200 });
  }, []);

  const zoomOut = useCallback(() => {
    mapaMovidoPorUsuarioRef.current = true;
    mapRef.current?.zoomOut({ duration: 200 });
  }, []);

  const onMapPointerEnter = useCallback(() => {
    cursorEnMapaRef.current = true;
    cancelarRecentrar();
  }, [cancelarRecentrar]);

  const onMapPointerLeave = useCallback(() => {
    cursorEnMapaRef.current = false;
    cancelarRecentrar();
    /* Solo recentrar si el cursor lleva 5 s fuera del mapa. */
    recenterTimerRef.current = window.setTimeout(() => {
      recenterTimerRef.current = null;
      if (cursorEnMapaRef.current) return;
      const map = mapRef.current;
      if (!map?.isStyleLoaded()) return;
      mapaMovidoPorUsuarioRef.current = false;
      setSelected(null);
      aplicarSeleccion(map, null);
      vistaPorDefecto(map, defaultPointsRef.current, tallerRef.current);
    }, 5_000);
  }, [cancelarRecentrar]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;
    setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
    const map = new MapLibreMap({
      container: el,
      style: MAP_STYLE,
      center: [2.1381, 41.3836],
      zoom: 12,
      attributionControl: { compact: true },
      /* Rueda/trackpad → scroll de la página, no zoom (como la landing). */
      scrollZoom: false,
    });
    mapRef.current = map;

    const capasClick = ['flota-hit', 'flota-iconos', 'taller-count-text', 'taller-pin'] as const;

    const montarCapas = () => {
      try {
        if (!map.hasImage(FLOTA_ICON_ID)) {
          map.addImage(FLOTA_ICON_ID, imagenConductor(iconoConductorRef.current), { pixelRatio: 2 });
        } else {
          map.removeImage(FLOTA_ICON_ID);
          map.addImage(FLOTA_ICON_ID, imagenConductor(iconoConductorRef.current), { pixelRatio: 2 });
        }
        if (!map.hasImage('taller-pin-rojo')) {
          map.addImage('taller-pin-rojo', iconoPinRojo(), { pixelRatio: 2 });
        }

        if (!map.getSource('seleccion')) {
          map.addSource('seleccion', { type: 'geojson', data: coleccionVacia() });
          map.addLayer({
            id: 'seleccion-ring-outer',
            type: 'circle',
            source: 'seleccion',
            paint: {
              'circle-radius': 140,
              'circle-color': '#0f0f0f',
              'circle-opacity': 0.05,
            },
          });
          map.addLayer({
            id: 'seleccion-ring-mid',
            type: 'circle',
            source: 'seleccion',
            paint: {
              'circle-radius': 100,
              'circle-color': '#0f0f0f',
              'circle-opacity': 0.09,
            },
          });
          map.addLayer({
            id: 'seleccion-ring-inner',
            type: 'circle',
            source: 'seleccion',
            paint: {
              'circle-radius': 60,
              'circle-color': '#0f0f0f',
              'circle-opacity': 0.18,
            },
          });
        }

        if (!map.getSource('taller')) {
          map.addSource('taller', {
            type: 'geojson',
            data: tallerGeoJSON(tallerRef.current),
          });

          map.addLayer({
            id: 'taller-pin',
            type: 'symbol',
            source: 'taller',
            layout: {
              'icon-image': 'taller-pin-rojo',
              'icon-size': PIN_ICON_SIZE,
              'icon-anchor': 'bottom',
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
            },
          });

          /* Número centrado debajo del pin. */
          map.addLayer({
            id: 'taller-count-text',
            type: 'symbol',
            source: 'taller',
            filter: ['>', ['get', 'count'], 0],
            layout: {
              'text-field': ['to-string', ['get', 'count']],
              'text-size': 20,
              'text-font': ['Open Sans Bold'],
              'text-anchor': 'top',
              'text-offset': [0, 0.2],
              'text-allow-overlap': true,
              'text-ignore-placement': true,
            },
            paint: {
              'text-color': '#111111',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2.5,
              'text-halo-blur': 0,
            },
          });
        }

        if (!map.getSource('flota')) {
          map.addSource('flota', {
            type: 'geojson',
            data: enRutaGeoJSON(marcadoresRef.current),
          });

          /* Hit area invisible (más fácil de clicar que el icono). */
          map.addLayer({
            id: 'flota-hit',
            type: 'circle',
            source: 'flota',
            paint: {
              'circle-color': '#0f0f0f',
              'circle-radius': 12,
              'circle-opacity': 0,
            },
          });

          map.addLayer({
            id: 'flota-iconos',
            type: 'symbol',
            source: 'flota',
            layout: {
              'icon-image': FLOTA_ICON_ID,
              'icon-size': CONDUCTOR_ICON_SIZE,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
            },
          });

          const setPointer = () => {
            map.getCanvas().style.cursor = 'pointer';
          };
          const clearPointer = () => {
            map.getCanvas().style.cursor = '';
          };
          for (const layer of capasClick) {
            map.on('mouseenter', layer, setPointer);
            map.on('mouseleave', layer, clearPointer);
          }
        }
      } catch (err) {
        console.error('[FlotaMapa] capas', err);
      }

      map.resize();
      const t = tallerRef.current;
      const enRuta = marcadoresRef.current.filter((m) => m.estado === 'en_ruta');
      const pts = [
        ...enRuta.map((m) => ({ lat: m.lat, lng: m.lng })),
        ...(t ? [{ lat: t.lat, lng: t.lng }] : []),
      ];
      defaultPointsRef.current = pts;
      if (pts.length) {
        fittedKeyRef.current = [
          t ? `taller:${t.countEnTaller}` : '',
          ...enRuta.map((m) => `${m.rutaId}:${m.lat.toFixed(4)},${m.lng.toFixed(4)}`),
        ].join('|');
        /* Primer encuadre = mismo que Centrar (sin animación para no ver zoom 12). */
        vistaPorDefecto(map, pts, t, { duration: 0 });
      }
    };

    map.on('load', montarCapas);
    map.on('error', (e) => {
      console.error('[FlotaMapa]', e.error ?? e);
    });

    if (map.isStyleLoaded()) montarCapas();

    map.on('dragstart', () => {
      mapaMovidoPorUsuarioRef.current = true;
    });

    map.on('click', (event) => {
      const target = event.originalEvent.target;
      if (target instanceof Element && target.closest('button, a')) return;

      const tallerHit = map.queryRenderedFeatures(event.point, {
        layers: ['taller-pin', 'taller-count-text'],
      })[0];
      if (tallerHit) {
        const t = tallerRef.current;
        if (t) {
          setSelected({
            kind: 'taller',
            count: t.countEnTaller,
            label: t.label,
            direccion: t.direccion,
            lat: t.lat,
            lng: t.lng,
          });
          aplicarSeleccion(map, t);
        }
        return;
      }

      const pin = map.queryRenderedFeatures(event.point, {
        layers: ['flota-hit', 'flota-iconos'],
      })[0];
      const rutaId = pin?.properties?.rutaId as string | undefined;
      if (rutaId) {
        const m = marcadoresRef.current.find((x) => x.rutaId === rutaId) ?? null;
        if (m) {
          setSelected({ kind: 'ruta', marcador: m });
          aplicarSeleccion(map, m);
        }
        return;
      }

      setSelected(null);
      aplicarSeleccion(map, null);
      /* No recentrar al hacer click en vacío: solo botón Centrar o cursor fuera 5 s. */
    });

    const ro = new ResizeObserver(() => {
      map.resize();
    });
    ro.observe(el);
    const t1 = window.setTimeout(() => map.resize(), 50);
    const t2 = window.setTimeout(() => map.resize(), 300);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      if (recenterTimerRef.current != null) {
        window.clearTimeout(recenterTimerRef.current);
        recenterTimerRef.current = null;
      }
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      fittedKeyRef.current = '';
      defaultPointsRef.current = [];
    };
  }, []);

  /* Cambia el dibujo del pin de conductor sin recrear el mapa. */
  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    try {
      if (map.hasImage(FLOTA_ICON_ID)) map.removeImage(FLOTA_ICON_ID);
      map.addImage(FLOTA_ICON_ID, imagenConductor(iconoConductor), { pixelRatio: 2 });
      if (map.getLayer('flota-iconos')) {
        map.setLayoutProperty('flota-iconos', 'icon-image', FLOTA_ICON_ID);
      }
    } catch (err) {
      console.error('[FlotaMapa] icono conductor', err);
    }
  }, [iconoConductor]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const taller = tallerDesdeProps(marcadores, tallerFallback);

    const apply = () => {
      map.resize();
      (map.getSource('flota') as GeoJSONSource | undefined)?.setData(enRutaGeoJSON(marcadores));
      (map.getSource('taller') as GeoJSONSource | undefined)?.setData(tallerGeoJSON(taller));

      const enRuta = marcadores.filter((m) => m.estado === 'en_ruta');
      const pts = [
        ...enRuta.map((m) => ({ lat: m.lat, lng: m.lng })),
        ...(taller ? [{ lat: taller.lat, lng: taller.lng }] : []),
      ];
      defaultPointsRef.current = pts;
      const key = [
        taller ? `taller:${taller.countEnTaller}` : '',
        ...enRuta.map((m) => `${m.rutaId}:${m.lat.toFixed(4)},${m.lng.toFixed(4)}`),
      ].join('|');
      if (key !== fittedKeyRef.current) {
        const primera = !fittedKeyRef.current;
        fittedKeyRef.current = key;
        /* Al entrar / hidratar: mismo encuadre que Centrar. Si el usuario ya movió el mapa, no lo pisamos. */
        if (pts.length && !mapaMovidoPorUsuarioRef.current) {
          vistaPorDefecto(map, pts, taller, { duration: primera ? 0 : 450 });
        }
      }
    };

    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [marcadores, tallerFallback]);

  useEffect(() => {
    if (!selected) return;
    if (selected.kind === 'taller') {
      const t = tallerDesdeProps(marcadores, tallerFallback);
      if (!t || t.countEnTaller !== selected.count) {
        queueMicrotask(() => setSelected(null));
        const map = mapRef.current;
        if (map?.isStyleLoaded()) aplicarSeleccion(map, null);
      }
      return;
    }
    if (!marcadores.some((m) => m.rutaId === selected.marcador.rutaId && m.estado === 'en_ruta')) {
      queueMicrotask(() => setSelected(null));
      const map = mapRef.current;
      if (map?.isStyleLoaded()) aplicarSeleccion(map, null);
    }
  }, [marcadores, selected, tallerFallback]);

  useEffect(() => {
    if (!iconMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const el = iconMenuRef.current;
      if (el && !el.contains(e.target as Node)) setIconMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIconMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [iconMenuOpen]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    if (!selected) {
      aplicarSeleccion(map, null);
      return;
    }
    if (selected.kind === 'taller') {
      aplicarSeleccion(map, selected);
    } else {
      aplicarSeleccion(map, selected.marcador);
    }
  }, [selected]);

  const cardRuta = selected?.kind === 'ruta' ? selected.marcador : null;
  const cardTaller = selected?.kind === 'taller' ? selected : null;
  const subtituloRuta = cardRuta
    ? ['En ruta', cardRuta.conductorLabel, cardRuta.direccion].filter(Boolean).join(' · ')
    : '';

  return (
    <div
      className={styles.flotaMapRoot}
      style={style}
      onMouseEnter={onMapPointerEnter}
      onMouseLeave={onMapPointerLeave}
    >
      <div ref={containerRef} className={styles.flotaMapCanvas} />
      <div className={styles.flotaMapControls}>
        <button
          type="button"
          onClick={centrar}
          aria-label="Centrar mapa en la vista por defecto"
          title="Centrar"
          className={styles.flotaMapCentrar}
        >
          <Icon name="my_location" size="sm" />
        </button>
        <div className={styles.flotaMapZoomGroup}>
          <button
            type="button"
            className={styles.flotaMapZoomBtn}
            onClick={zoomIn}
            aria-label="Acercar"
            title="Acercar"
          >
            +
          </button>
          <button
            type="button"
            className={styles.flotaMapZoomBtn}
            onClick={zoomOut}
            aria-label="Alejar"
            title="Alejar"
          >
            −
          </button>
        </div>
        {onIconoConductorChange ? (
          <div ref={iconMenuRef} className={styles.flotaIconMenu}>
            <button
              type="button"
              className={styles.flotaIconMenuTrigger}
              aria-label="Cambiar icono de conductor"
              aria-expanded={iconMenuOpen}
              aria-haspopup="menu"
              title="Icono de conductor"
              onClick={() => setIconMenuOpen((v) => !v)}
            >
              {glifoIconoConductor(iconoConductor, 15)}
            </button>
            {iconMenuOpen ? (
              <div className={styles.flotaIconMenuPanel} role="menu" aria-label="Icono de conductor">
                {ICONOS_CONDUCTOR_FLOTA.map((opt) => {
                  const on = iconoConductor === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={on}
                      className={`${styles.flotaIconMenuItem}${on ? ` ${styles.flotaIconMenuItemOn}` : ''}`}
                      title={opt.label}
                      aria-label={opt.label}
                      onClick={() => {
                        onIconoConductorChange(opt.id);
                        setIconMenuOpen(false);
                      }}
                    >
                      {glifoIconoConductor(opt.id, 15)}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {cardRuta ? (
        <article className={styles.flotaMapPlaceCard} aria-live="polite">
          <FlotaPlacePhoto marcador={cardRuta} />
          <div className={styles.flotaMapPlaceBody}>
            <strong>{cardRuta.vehiculoLabel}</strong>
            <p>{subtituloRuta}</p>
            <div className={styles.flotaMapPlaceActions}>
              <button
                type="button"
                className={styles.flotaMapBtnSecondary}
                onClick={() => onAbrirRuta?.(cardRuta.rutaId)}
              >
                Detalles
              </button>
              <a
                className={styles.flotaMapBtnPrimary}
                href={mapsUrlMarcador(cardRuta)}
                target="_blank"
                rel="noreferrer"
              >
                Ver en Maps
              </a>
            </div>
          </div>
        </article>
      ) : null}

      {cardTaller ? (
        <article className={styles.flotaMapPlaceCard} aria-live="polite">
          <div className={styles.flotaMapPlacePhoto} aria-hidden>
            <Icon name="storefront" size="xl" />
          </div>
          <div className={styles.flotaMapPlaceBody}>
            <strong>{cardTaller.label}</strong>
            <p>
              {cardTaller.count === 0
                ? 'Sin autos en taller'
                : `${cardTaller.count} ${cardTaller.count === 1 ? 'auto' : 'autos'} en taller`}
              {cardTaller.direccion ? ` · ${cardTaller.direccion}` : ''}
            </p>
            <div className={styles.flotaMapPlaceActions}>
              <span />
              <a
                className={styles.flotaMapBtnPrimary}
                href={mapsUrlQuery(cardTaller.direccion || `${cardTaller.lat},${cardTaller.lng}`)}
                target="_blank"
                rel="noreferrer"
              >
                Ver en Maps
              </a>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}
