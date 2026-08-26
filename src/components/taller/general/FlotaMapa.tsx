'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  Map as MapLibreMap,
  setWorkerUrl,
  type GeoJSONSource,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Icon } from '@/components/ds/Icon';
import type { MarcadorFlota } from '@/lib/mecanu/flota-panel';

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

type Punto = { lat: number; lng: number; label?: string; sub?: string };

function fc(points: Punto[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: { label: p.label ?? '', sub: p.sub ?? '' },
    })),
  };
}

function setSource(map: MapLibreMap, id: string, points: Punto[]) {
  const src = map.getSource(id) as GeoJSONSource | undefined;
  if (src) src.setData(fc(points));
}

function vistaPorDefecto(map: MapLibreMap, points: Punto[]) {
  if (!points.length) return;
  if (points.length === 1) {
    map.easeTo({ center: [points[0].lng, points[0].lat], zoom: 14, duration: 450 });
    return;
  }
  const lngs = points.map((p) => p.lng);
  const lats = points.map((p) => p.lat);
  map.fitBounds(
    [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    { padding: 64, maxZoom: 14.5, duration: 450 },
  );
}

/** Pin clásico del taller (ancla en la punta). */
function iconoPinTaller(): ImageData {
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
  ctx.fillStyle = '#0B3D2E';
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

function iconoConductor(enVivo: boolean): ImageData {
  const size = 72;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new ImageData(size, size);
  if (enVivo) {
    ctx.beginPath();
    ctx.arc(36, 36, 34, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(13, 148, 136, 0.22)';
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(36, 36, 24, 0, Math.PI * 2);
  ctx.fillStyle = enVivo ? '#0d9488' : '#64748b';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(36, 36, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(36, 36, 3.5, 0, Math.PI * 2);
  ctx.stroke();
  for (const ang of [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6]) {
    ctx.beginPath();
    ctx.moveTo(36 + Math.cos(ang) * 4.5, 36 + Math.sin(ang) * 4.5);
    ctx.lineTo(36 + Math.cos(ang) * 10.5, 36 + Math.sin(ang) * 10.5);
    ctx.stroke();
  }
  return ctx.getImageData(0, 0, size, size);
}

type Props = {
  marcadores: MarcadorFlota[];
  style?: React.CSSProperties;
};

/** Mapa del dashboard: pin del taller + flota + botón Centrar. */
export function FlotaMapa({ marcadores, style }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const defaultPointsRef = useRef<Punto[]>([]);
  const fittedKeyRef = useRef('');

  const centrar = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    vistaPorDefecto(map, defaultPointsRef.current);
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [2.1381, 41.3836],
      zoom: 14,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on('load', () => {
      if (!map.hasImage('flota-taller')) {
        map.addImage('flota-taller', iconoPinTaller(), { pixelRatio: 2 });
      }
      if (!map.hasImage('flota-vivo')) map.addImage('flota-vivo', iconoConductor(true), { pixelRatio: 2 });
      if (!map.hasImage('flota-visto')) map.addImage('flota-visto', iconoConductor(false), { pixelRatio: 2 });

      map.addSource('taller', { type: 'geojson', data: fc([]) });
      map.addSource('vivos', { type: 'geojson', data: fc([]) });
      map.addSource('vistos', { type: 'geojson', data: fc([]) });

      map.addLayer({
        id: 'taller-icon',
        type: 'symbol',
        source: 'taller',
        layout: {
          'icon-image': 'flota-taller',
          'icon-size': 1,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'text-field': ['get', 'label'],
          'text-size': 12,
          'text-offset': [0, 0.4],
          'text-anchor': 'top',
          'text-font': ['Open Sans Regular'],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#0B3D2E',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.8,
        },
      });

      const labelLayout = {
        'text-size': 10,
        'text-offset': [0, 1.65] as [number, number],
        'text-anchor': 'top' as const,
        'text-font': ['Open Sans Regular'],
        'text-allow-overlap': true,
        'text-line-height': 1.15,
      };

      map.addLayer({
        id: 'vivos-icon',
        type: 'symbol',
        source: 'vivos',
        layout: {
          'icon-image': 'flota-vivo',
          'icon-size': 1,
          'icon-anchor': 'center',
          'icon-allow-overlap': true,
          'text-field': ['concat', ['get', 'label'], '\n', ['get', 'sub']],
          ...labelLayout,
        },
        paint: {
          'text-color': '#0f766e',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.6,
        },
      });

      map.addLayer({
        id: 'vistos-icon',
        type: 'symbol',
        source: 'vistos',
        layout: {
          'icon-image': 'flota-visto',
          'icon-size': 1,
          'icon-anchor': 'center',
          'icon-allow-overlap': true,
          'text-field': ['concat', ['get', 'label'], '\n', ['get', 'sub']],
          ...labelLayout,
        },
        paint: {
          'text-color': '#475569',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.6,
        },
      });
    });

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      fittedKeyRef.current = '';
      defaultPointsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      const taller = marcadores
        .filter((m) => m.kind === 'taller')
        .map((m) => ({ lat: m.lat, lng: m.lng, label: m.label }));
      const vivos = marcadores
        .filter((m) => m.kind === 'conductor' && m.enVivo)
        .map((m) => ({ lat: m.lat, lng: m.lng, label: m.label, sub: m.ultimaVezLabel }));
      const vistos = marcadores
        .filter((m) => m.kind === 'conductor' && !m.enVivo)
        .map((m) => ({ lat: m.lat, lng: m.lng, label: m.label, sub: m.ultimaVezLabel }));

      setSource(map, 'taller', taller);
      setSource(map, 'vivos', vivos);
      setSource(map, 'vistos', vistos);

      const all = [...taller, ...vivos, ...vistos];
      defaultPointsRef.current = all.length ? all : taller;
      const key = all.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join('|');
      if (all.length && key !== fittedKeyRef.current) {
        vistaPorDefecto(map, all);
        fittedKeyRef.current = key;
      }
    };

    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [marcadores]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 480,
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--mecanu-neutral-25)',
        ...style,
      }}
    >
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      <button
        type="button"
        onClick={centrar}
        aria-label="Centrar mapa en la vista por defecto"
        title="Centrar"
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 34,
          padding: '0 12px',
          border: '1px solid var(--mecanu-border)',
          borderRadius: 8,
          background: 'var(--mecanu-neutral-0)',
          boxShadow: '0 1px 4px rgba(15, 23, 42, 0.12)',
          font: 'inherit',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--mecanu-text-primary-light)',
          cursor: 'pointer',
        }}
      >
        <Icon name="my_location" size="sm" />
        Centrar
      </button>
    </div>
  );
}
