'use client';

import { useEffect, useRef } from 'react';
import {
  Map as MapLibreMap,
  setWorkerUrl,
  type GeoJSONSource,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { UbicacionSeguimientoPublico } from '@/lib/mecanu/repo/repo';
import styles from './seguimiento.module.css';

const MAP_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap © CARTO',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

type Punto = { lat: number; lng: number; label?: string };

function fc(points: Punto[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: { label: p.label ?? '' },
    })),
  };
}

function setSource(map: MapLibreMap, id: string, points: Punto[]) {
  const src = map.getSource(id) as GeoJSONSource | undefined;
  if (src) src.setData(fc(points));
}

function fitPoints(map: MapLibreMap, points: Punto[]) {
  if (!points.length) return;
  if (points.length === 1) {
    map.easeTo({ center: [points[0].lng, points[0].lat], zoom: 14, duration: 400 });
    return;
  }
  const lngs = points.map((p) => p.lng);
  const lats = points.map((p) => p.lat);
  map.fitBounds(
    [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    { padding: 56, maxZoom: 15, duration: 400 },
  );
}

/** Pin clásico de destino (rojo). Ancla en la punta inferior. */
function iconoPinDestino(): ImageData {
  const w = 64;
  const h = 80;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new ImageData(w, h);

  ctx.beginPath();
  ctx.moveTo(32, 74);
  ctx.bezierCurveTo(32, 74, 8, 48, 8, 30);
  ctx.arc(32, 30, 24, Math.PI, 0, false);
  ctx.bezierCurveTo(56, 48, 32, 74, 32, 74);
  ctx.closePath();
  ctx.fillStyle = '#dc2626';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(32, 28, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  return ctx.getImageData(0, 0, w, h);
}

/** Origen: círculo slate con «A». */
function iconoOrigen(): ImageData {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new ImageData(size, size);

  ctx.beginPath();
  ctx.arc(32, 32, 26, 0, Math.PI * 2);
  ctx.fillStyle = '#334155';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', 32, 34);

  return ctx.getImageData(0, 0, size, size);
}

/** Vehículo: disco teal con volante. */
function iconoVolante(): ImageData {
  const size = 80;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new ImageData(size, size);

  // Halo suave
  ctx.beginPath();
  ctx.arc(40, 40, 38, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(13, 148, 136, 0.28)';
  ctx.fill();

  // Disco
  ctx.beginPath();
  ctx.arc(40, 40, 28, 0, Math.PI * 2);
  ctx.fillStyle = '#0d9488';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Volante
  const cx = 40;
  const cy = 40;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Aro exterior
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.stroke();

  // Aro interior (cubo)
  ctx.beginPath();
  ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  // Radios (3)
  for (const ang of [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6]) {
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * 5.5, cy + Math.sin(ang) * 5.5);
    ctx.lineTo(cx + Math.cos(ang) * 13.5, cy + Math.sin(ang) * 13.5);
    ctx.stroke();
  }

  return ctx.getImageData(0, 0, size, size);
}

type Props = {
  ubicacion: UbicacionSeguimientoPublico | null;
  calloutFallback?: string;
};

/**
 * Mapa vivo: origen (A), destino (pin rojo), vehículo (volante) + callout.
 */
export function SeguimientoMapa({ ubicacion, calloutFallback }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const fittedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [2.15, 41.39],
      zoom: 12,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on('load', () => {
      if (!map.hasImage('sg-origen')) map.addImage('sg-origen', iconoOrigen(), { pixelRatio: 2 });
      if (!map.hasImage('sg-destino')) {
        map.addImage('sg-destino', iconoPinDestino(), { pixelRatio: 2 });
      }
      if (!map.hasImage('sg-volante')) {
        map.addImage('sg-volante', iconoVolante(), { pixelRatio: 2 });
      }

      map.addSource('destino', { type: 'geojson', data: fc([]) });
      map.addSource('origen', { type: 'geojson', data: fc([]) });
      map.addSource('conductor', { type: 'geojson', data: fc([]) });

      map.addLayer({
        id: 'origen-icon',
        type: 'symbol',
        source: 'origen',
        layout: {
          'icon-image': 'sg-origen',
          'icon-size': 1,
          'icon-anchor': 'center',
          'icon-allow-overlap': true,
          'text-field': ['coalesce', ['get', 'label'], 'Origen'],
          'text-size': 11,
          'text-offset': [0, 1.55],
          'text-anchor': 'top',
          'text-font': ['Open Sans Regular'],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#334155',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.6,
        },
      });

      map.addLayer({
        id: 'destino-icon',
        type: 'symbol',
        source: 'destino',
        layout: {
          'icon-image': 'sg-destino',
          'icon-size': 1,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'text-field': ['coalesce', ['get', 'label'], 'Destino'],
          'text-size': 11,
          'text-offset': [0, 0.35],
          'text-anchor': 'top',
          'text-font': ['Open Sans Regular'],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#b91c1c',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.6,
        },
      });

      map.addLayer({
        id: 'conductor-icon',
        type: 'symbol',
        source: 'conductor',
        layout: {
          'icon-image': 'sg-volante',
          'icon-size': 1,
          'icon-anchor': 'center',
          'icon-allow-overlap': true,
          'text-field': 'Tu coche',
          'text-size': 12,
          'text-offset': [0, 1.7],
          'text-anchor': 'top',
          'text-font': ['Open Sans Regular'],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#0f766e',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.8,
        },
      });
    });

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      fittedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ubicacion) return;

    const apply = () => {
      const origen = ubicacion.origen
        ? [{ lat: ubicacion.origen.lat, lng: ubicacion.origen.lng, label: ubicacion.origen.label }]
        : [];
      const destino = ubicacion.destino
        ? [{ lat: ubicacion.destino.lat, lng: ubicacion.destino.lng, label: ubicacion.destino.label }]
        : [];
      const conductor =
        ubicacion.visible && ubicacion.conductor
          ? [{ lat: ubicacion.conductor.lat, lng: ubicacion.conductor.lng }]
          : [];

      setSource(map, 'origen', origen);
      setSource(map, 'destino', destino);
      setSource(map, 'conductor', conductor);

      const all = [...origen, ...destino, ...conductor];
      if (all.length && !fittedRef.current) {
        fitPoints(map, all);
        fittedRef.current = true;
      } else if (conductor.length === 1) {
        map.easeTo({
          center: [conductor[0].lng, conductor[0].lat],
          duration: 600,
        });
      }
    };

    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [ubicacion]);

  const callout =
    ubicacion?.callout ?? calloutFallback ?? 'Seguimiento del traslado';
  const sinCoords =
    !ubicacion?.destino && !ubicacion?.origen && !ubicacion?.conductor;

  return (
    <div className={styles.mapWrap}>
      <div ref={containerRef} className={styles.mapCanvas} role="img" aria-label="Mapa del traslado" />
      <div className={styles.mapCallout} role="status">
        <span className={styles.mapCalloutDot} aria-hidden />
        <p className={styles.mapCalloutText}>{callout}</p>
      </div>
      <ul className={styles.mapLegend} aria-label="Leyenda del mapa">
        <li>
          <span className={styles.legOrigen} aria-hidden>
            A
          </span>
          Origen
        </li>
        <li>
          <span className={styles.legDestino} aria-hidden>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <path
                fill="currentColor"
                d="M12 2.5c-3.6 0-6.5 2.8-6.5 6.3 0 4.7 5.4 11.2 6.1 12 .2.3.6.3.8 0 .7-.8 6.1-7.3 6.1-12 0-3.5-2.9-6.3-6.5-6.3Z"
              />
              <circle cx="12" cy="8.6" r="2.4" fill="#fff" />
            </svg>
          </span>
          Destino
        </li>
        <li>
          <span className={styles.legVolante} aria-hidden>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
              <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="2.2" fill="none" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 9.8V4.8M12 14.2v5M9.2 13.4 4.8 16M14.8 13.4 19.2 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          Vehículo
        </li>
      </ul>
      {sinCoords ? (
        <p className={styles.mapEmpty}>
          Aún no hay coordenadas para mostrar el recorrido. Cuando el conductor salga a ruta verás
          su posición aquí.
        </p>
      ) : null}
    </div>
  );
}
