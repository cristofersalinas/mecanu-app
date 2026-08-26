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
import styles from '../panel.module.css';

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

const CLUSTER_MAX_ZOOM = 14;
const CLUSTER_RADIUS = 26;

function coleccionVacia(): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

function flotaGeoJSON(marcadores: MarcadorFlota[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: marcadores.map((m) => ({
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

function seleccionGeoJSON(m: MarcadorFlota | null): GeoJSON.FeatureCollection {
  if (!m) return coleccionVacia();
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
        properties: {},
      },
    ],
  };
}

function vistaPorDefecto(map: MapLibreMap, points: { lat: number; lng: number }[], taller: { lat: number; lng: number } | null) {
  const pts = points.length ? points : (taller ? [taller] : []);
  if (!pts.length) return;
  if (pts.length === 1) {
    map.easeTo({ center: [pts[0].lng, pts[0].lat], zoom: 14, duration: 450 });
    return;
  }
  const lngs = pts.map((p) => p.lng);
  const lats = pts.map((p) => p.lat);
  map.fitBounds(
    [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    { padding: 64, maxZoom: 14.5, duration: 450 },
  );
}

function aplicarSeleccion(map: MapLibreMap, m: MarcadorFlota | null) {
  (map.getSource('seleccion') as GeoJSONSource | undefined)?.setData(seleccionGeoJSON(m));
}

/** Icono storefront blanco (mismo trazo que la landing). */
function iconoPinFlota(): ImageData {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new ImageData(size, size);
  ctx.fillStyle = '#ffffff';
  ctx.translate(8, 8);
  ctx.scale(48 / 24, 48 / 24);
  ctx.fill(new Path2D('M3 8.5 5 5h14l2 3.5V10H3V8.5Zm1 2.5h16v9H4v-9Zm6 9h4v-5h-4v5Z'));
  return ctx.getImageData(0, 0, size, size);
}

function mapsUrl(m: MarcadorFlota): string {
  const q = m.direccion?.trim()
    ? m.direccion
    : `${m.lat},${m.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function streetViewUrl(m: MarcadorFlota): string | null {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) return null;
  const params = new URLSearchParams({
    lat: String(m.lat),
    lng: String(m.lng),
  });
  return `/api/v1/streetview?${params.toString()}`;
}

function FlotaPlacePhoto({ marcador }: { marcador: MarcadorFlota }) {
  const src = marcador.fotoUrl ?? streetViewUrl(marcador);
  const [error, setError] = useState(!src);

  if (!src || error) {
    return (
      <div className={styles.flotaMapPlacePhoto} aria-hidden>
        <Icon name={marcador.estado === 'en_taller' ? 'storefront' : 'directions_car'} size="xl" />
      </div>
    );
  }

  return (
    <div className={styles.flotaMapPlacePhoto}>
      {/* Street View proxy o foto del marcador */}
      <img
        className={styles.flotaMapPlacePhotoImg}
        src={src}
        alt=""
        onError={() => setError(true)}
      />
    </div>
  );
}

type Props = {
  marcadores: MarcadorFlota[];
  /** Centro fallback si no hay pines (coords del taller). */
  tallerFallback?: { lat: number; lng: number } | null;
  onAbrirRuta?: (rutaId: string) => void;
  style?: React.CSSProperties;
};

/** Mapa del dashboard: cluster como landing + ficha al clic. */
export function FlotaMapa({ marcadores, tallerFallback = null, onAbrirRuta, style }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const marcadoresRef = useRef(marcadores);
  const defaultPointsRef = useRef<{ lat: number; lng: number }[]>([]);
  const tallerRef = useRef(tallerFallback);
  const fittedKeyRef = useRef('');
  const [selected, setSelected] = useState<MarcadorFlota | null>(null);

  marcadoresRef.current = marcadores;
  tallerRef.current = tallerFallback;

  const centrar = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    setSelected(null);
    aplicarSeleccion(map, null);
    vistaPorDefecto(map, defaultPointsRef.current, tallerRef.current);
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

    const capasClick = ['flota-clusters', 'flota-pines'] as const;

    map.on('load', () => {
      if (!map.hasImage('flota-pin')) {
        map.addImage('flota-pin', iconoPinFlota(), { pixelRatio: 2 });
      }

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

      map.addSource('flota', {
        type: 'geojson',
        data: flotaGeoJSON(marcadoresRef.current),
        cluster: true,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
        clusterRadius: CLUSTER_RADIUS,
      });

      map.addLayer({
        id: 'flota-clusters',
        type: 'circle',
        source: 'flota',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#ffffff',
          'circle-stroke-color': '#111111',
          'circle-stroke-width': 1,
          'circle-radius': [
            'min',
            40,
            ['+', 10, ['*', ['get', 'point_count'], 3.5]],
          ],
        },
      });

      map.addLayer({
        id: 'flota-cluster-count',
        type: 'symbol',
        source: 'flota',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-size': ['min', 18, ['+', 10, ['*', ['get', 'point_count'], 0.9]]],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: { 'text-color': '#111111' },
      });

      map.addLayer({
        id: 'flota-pines',
        type: 'circle',
        source: 'flota',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#0f0f0f',
          'circle-radius': 16,
        },
      });

      map.addLayer({
        id: 'flota-iconos',
        type: 'symbol',
        source: 'flota',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': 'flota-pin',
          'icon-size': 0.5,
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
    });

    map.on('click', (event) => {
      const target = event.originalEvent.target;
      if (target instanceof Element && target.closest('button, a')) return;

      const cluster = map.queryRenderedFeatures(event.point, { layers: ['flota-clusters'] })[0];
      if (cluster?.geometry.type === 'Point') {
        const clusterId = Number(cluster.properties?.cluster_id);
        const coordinates = cluster.geometry.coordinates as [number, number];
        const source = map.getSource('flota') as GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({ center: coordinates, zoom });
        });
        return;
      }

      const pin = map.queryRenderedFeatures(event.point, { layers: ['flota-pines'] })[0];
      const rutaId = pin?.properties?.rutaId as string | undefined;
      if (rutaId) {
        const m = marcadoresRef.current.find((x) => x.rutaId === rutaId) ?? null;
        if (m) {
          setSelected(m);
          aplicarSeleccion(map, m);
          const origen = map.getZoom();
          map.easeTo({
            center: [m.lng, m.lat],
            zoom: Math.min(map.getMaxZoom(), origen + 1.2),
            duration: 700,
          });
        }
        return;
      }

      setSelected(null);
      aplicarSeleccion(map, null);
      vistaPorDefecto(map, defaultPointsRef.current, tallerRef.current);
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
      const src = map.getSource('flota') as GeoJSONSource | undefined;
      if (src) src.setData(flotaGeoJSON(marcadores));

      defaultPointsRef.current = marcadores.map((m) => ({ lat: m.lat, lng: m.lng }));
      const key = marcadores.map((m) => `${m.rutaId}:${m.lat.toFixed(4)},${m.lng.toFixed(4)}`).join('|');
      if (key !== fittedKeyRef.current) {
        vistaPorDefecto(map, defaultPointsRef.current, tallerFallback);
        fittedKeyRef.current = key;
        setSelected(null);
        aplicarSeleccion(map, null);
      }
    };

    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [marcadores, tallerFallback]);

  useEffect(() => {
    if (!selected) return;
    if (marcadores.some((m) => m.rutaId === selected.rutaId)) return;
    setSelected(null);
    const map = mapRef.current;
    if (map?.isStyleLoaded()) aplicarSeleccion(map, null);
  }, [marcadores, selected]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    aplicarSeleccion(map, selected);
  }, [selected]);

  const subtitulo = selected
    ? [
        selected.estado === 'en_taller' ? 'En taller' : 'En ruta',
        selected.conductorLabel,
        selected.direccion,
      ].filter(Boolean).join(' · ')
    : '';

  return (
    <div
      ref={wrapRef}
      className={styles.flotaMapRoot}
      style={{
        minHeight: 480,
        ...style,
      }}
    >
      <div ref={containerRef} className={styles.flotaMapCanvas} />
      <button
        type="button"
        onClick={centrar}
        aria-label="Centrar mapa en la vista por defecto"
        title="Centrar"
        className={styles.flotaMapCentrar}
      >
        <Icon name="my_location" size="sm" />
        Centrar
      </button>

      {selected ? (
        <article className={styles.flotaMapPlaceCard} aria-live="polite">
          <FlotaPlacePhoto marcador={selected} />
          <div className={styles.flotaMapPlaceBody}>
            <strong>{selected.vehiculoLabel}</strong>
            <p>{subtitulo}</p>
            <div className={styles.flotaMapPlaceActions}>
              <button
                type="button"
                className={styles.flotaMapBtnSecondary}
                onClick={() => onAbrirRuta?.(selected.rutaId)}
              >
                Detalles
              </button>
              <a
                className={styles.flotaMapBtnPrimary}
                href={mapsUrl(selected)}
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
