"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
  type LngLatBounds,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Icon } from "@/components/ds/Icon";
import styles from "@/app/landing.module.css";
import type { LandingCopy } from "@/lib/landing/copy";
import {
  CIUDAD_INICIAL,
  CIUDADES_MAPA,
  TAMANO_CIUDAD,
  TAMANO_DISTRITO,
  ciudadPorId,
  type CiudadMapa,
  type CiudadMapaId,
  type TallerMapa,
} from "./ciudades-mapa";

const MAP_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap © CARTO",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const CITY_FIT_PADDING = 28;
/** Zoom por defecto: más cerca que el encaje del recuadro. */
const CITY_ZOOM_EXTRA = Math.log2(1.728);
/** Al seleccionar un taller: 10 % de la distancia original (90 % más cerca). */
const TALLER_DISTANCIA_RELATIVA = 0.1;

function talleresGeoJSON(talleres: TallerMapa[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: talleres.map((taller) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [taller.lng, taller.lat] },
      properties: { name: taller.name, address: taller.address },
    })),
  };
}

function distritosGeoJSON(ciudad: CiudadMapa): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: ciudad.distritos
      .filter((distrito) => distrito.name !== ciudad.omitDistrict)
      .map((distrito) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [distrito.lng, distrito.lat] },
        properties: { name: distrito.name },
      })),
  };
}

function ciudadGeoJSON(
  ciudad: CiudadMapa,
  nombre: string,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [ciudad.lng, ciudad.lat] },
        properties: { name: nombre },
      },
    ],
  };
}

function nombreCiudad(copy: LandingCopy["map"], ciudad: CiudadMapa): string {
  return copy.ciudades[ciudad.id] ?? ciudad.cityName;
}

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function streetViewUrl(taller: TallerMapa): string | null {
  // Sin key no hay proxy útil tampoco
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) return null;
  const params = new URLSearchParams({
    lat: String(taller.lat),
    lng: String(taller.lng),
  });
  if (taller.svHeading != null) params.set("heading", String(taller.svHeading));
  return `/api/v1/streetview?${params.toString()}`;
}

function zoomTaller(zoomOrigen: number, maxZoom: number): number {
  return Math.min(maxZoom, zoomOrigen + Math.log2(1 / TALLER_DISTANCIA_RELATIVA));
}

function padBounds(bounds: LngLatBounds, factor = 0.04): [[number, number], [number, number]] {
  const west = bounds.getWest();
  const east = bounds.getEast();
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const lngPad = (east - west) * factor;
  const latPad = (north - south) * factor;
  return [
    [west - lngPad, south - latPad],
    [east + lngPad, north + latPad],
  ];
}

function vistaCiudad(map: MapLibreMap, ciudad: CiudadMapa): { center: [number, number]; zoom: number } {
  const camera = map.cameraForBounds(ciudad.bounds, { padding: CITY_FIT_PADDING });
  return {
    center: [ciudad.lng, ciudad.lat],
    zoom: (camera?.zoom ?? map.getZoom()) + CITY_ZOOM_EXTRA,
  };
}

function bloquearVista(map: MapLibreMap) {
  map.setMaxBounds(padBounds(map.getBounds()));
  map.setMinZoom(map.getZoom());
}

let lockVistaId = 0;

function encajarCiudad(map: MapLibreMap, ciudad: CiudadMapa, duration: number): number {
  const lockId = ++lockVistaId;
  map.setMaxBounds(null);
  map.setMinZoom(1);
  const view = vistaCiudad(map, ciudad);
  if (duration <= 0) {
    map.jumpTo(view);
    bloquearVista(map);
  } else {
    map.once("moveend", () => {
      if (lockId !== lockVistaId) return;
      bloquearVista(map);
    });
    map.easeTo({ ...view, duration });
  }
  return view.zoom;
}

function aplicarFuentes(map: MapLibreMap, ciudad: CiudadMapa, nombre: string) {
  (map.getSource("distritos") as GeoJSONSource | undefined)?.setData(distritosGeoJSON(ciudad));
  (map.getSource("ciudad") as GeoJSONSource | undefined)?.setData(ciudadGeoJSON(ciudad, nombre));
  (map.getSource("talleres") as GeoJSONSource | undefined)?.setData(talleresGeoJSON(ciudad.talleres));
}

function coleccionVacia(): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return { type: "FeatureCollection", features: [] };
}

function seleccionGeoJSON(taller: TallerMapa | null): GeoJSON.FeatureCollection<GeoJSON.Point> {
  if (!taller) return coleccionVacia();
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [taller.lng, taller.lat] },
        properties: {},
      },
    ],
  };
}

function aplicarSeleccion(map: MapLibreMap, taller: TallerMapa | null) {
  (map.getSource("seleccion") as GeoJSONSource | undefined)?.setData(seleccionGeoJSON(taller));
}

function iconoTaller(): ImageData {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new ImageData(size, size);
  ctx.fillStyle = "#ffffff";
  ctx.translate(8, 8);
  ctx.scale(48 / 24, 48 / 24);
  ctx.fill(new Path2D("M3 8.5 5 5h14l2 3.5V10H3V8.5Zm1 2.5h16v9H4v-9Zm6 9h4v-5h-4v5Z"));
  return ctx.getImageData(0, 0, size, size);
}

// Cache en memoria: url → blob URL (dura lo que dura la sesión de la página)
const photoCache = new Map<string, string | null>();

function preloadPhotos(talleres: TallerMapa[]) {
  for (const t of talleres) {
    const url = streetViewUrl(t);
    if (!url || photoCache.has(url)) continue;
    // Marcamos como "cargando" para no lanzar dos fetches del mismo taller
    photoCache.set(url, undefined as unknown as string);
    fetch(url)
      .then((r) => {
        if (!r.ok) { photoCache.set(url, null); return; }
        return r.blob();
      })
      .then((blob) => {
        if (!blob) return;
        photoCache.set(url, URL.createObjectURL(blob));
      })
      .catch(() => photoCache.set(url, null));
  }
}

function StreetViewPhoto({ taller }: { taller: TallerMapa }) {
  const rawUrl = streetViewUrl(taller);
  const cached = rawUrl ? photoCache.get(rawUrl) : undefined;
  // Si ya está en cache usamos el blob URL; si no, pedimos la URL del proxy directamente
  const src = cached ?? rawUrl ?? null;
  const failed = cached === null; // null explícito = error confirmado

  const [error, setError] = useState(failed);

  if (!src || error) {
    return (
      <div className={styles.mapPlacePhoto} aria-hidden="true">
        <Icon name="storefront" size="xl" />
      </div>
    );
  }

  return (
    <div className={styles.mapPlacePhoto}>
      <img
        src={src}
        alt={taller.name}
        className={styles.mapPlacePhotoImg}
        onError={() => setError(true)}
      />
    </div>
  );
}

export default function MadridMap({ copy }: { copy: LandingCopy["map"] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const defaultZoomRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);
  const [cityId, setCityId] = useState<CiudadMapaId>(CIUDAD_INICIAL.id);
  const [selected, setSelected] = useState<TallerMapa | null>(null);
  const cityRef = useRef(CIUDAD_INICIAL);
  const ciudad = ciudadPorId(cityId);
  const prevCityIdRef = useRef<CiudadMapaId | null>(null);

  useEffect(() => {
    cityRef.current = ciudad;
  }, [ciudad]);

  const clearResetTimer = () => {
    if (resetTimerRef.current == null) return;
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = null;
  };

  const scheduleReset = () => {
    clearResetTimer();
    resetTimerRef.current = window.setTimeout(() => {
      const map = mapRef.current;
      const destino = cityRef.current;
      if (map) {
        defaultZoomRef.current = encajarCiudad(map, destino, 900);
        aplicarSeleccion(map, null);
      }
      setSelected(null);
      resetTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

    const esTactil = window.matchMedia("(pointer: coarse)").matches;
    const map = new MapLibreMap({
      container,
      style: MAP_STYLE,
      bounds: CIUDAD_INICIAL.bounds,
      fitBoundsOptions: { padding: CITY_FIT_PADDING },
      maxZoom: 18,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      scrollZoom: false,
      boxZoom: false,
      dragRotate: false,
      touchPitch: false,
      doubleClickZoom: false,
      /* En móvil el mapa es tap + botones de zoom. El arrastre y el pinch
         se comen el primer scroll de la página (y el resize al esconderse
         la barra del navegador lo devuelve). */
      dragPan: !esTactil,
      touchZoomRotate: false,
      cooperativeGestures: false,
      trackResize: !esTactil,
    });

    map.touchZoomRotate.disableRotation();
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    const onTrackpadPinch = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const step = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 0.08 : 0.008;
      const zoom = Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), map.getZoom() - event.deltaY * step));
      map.jumpTo({ zoom });
    };
    container.addEventListener("wheel", onTrackpadPinch, { passive: false });

    const capasPines = ["talleres-pines", "talleres-clusters"] as const;

    const onLoad = () => {
      map.resize();
      map.addImage("taller-icono", iconoTaller(), { pixelRatio: 2 });
      // Precarga las fotos de Street View de Madrid en segundo plano
      preloadPhotos(CIUDAD_INICIAL.talleres);

      map.addSource("distritos", {
        type: "geojson",
        data: distritosGeoJSON(cityRef.current),
      });

      map.addLayer({
        id: "distritos-label",
        type: "symbol",
        source: "distritos",
        layout: {
          "text-field": ["get", "name"],
          "text-size": TAMANO_DISTRITO,
          "text-max-width": 8,
          "text-padding": 2,
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#6b7280",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.6,
        },
      });

      map.addSource("ciudad", {
        type: "geojson",
        data: ciudadGeoJSON(cityRef.current, nombreCiudad(copy, cityRef.current)),
      });

      map.addLayer({
        id: "ciudad-label",
        type: "symbol",
        source: "ciudad",
        layout: {
          "text-field": ["get", "name"],
          "text-size": TAMANO_CIUDAD,
          "text-letter-spacing": 0.04,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#0f0f0f",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        },
      });

      map.addSource("seleccion", {
        type: "geojson",
        data: coleccionVacia(),
      });

      map.addLayer({
        id: "seleccion-ring-outer",
        type: "circle",
        source: "seleccion",
        paint: {
          "circle-radius": 160,
          "circle-color": "#0f0f0f",
          "circle-opacity": 0.04,
        },
      });

      map.addLayer({
        id: "seleccion-ring-mid",
        type: "circle",
        source: "seleccion",
        paint: {
          "circle-radius": 100,
          "circle-color": "#0f0f0f",
          "circle-opacity": 0.09,
        },
      });

      map.addLayer({
        id: "seleccion-ring-inner",
        type: "circle",
        source: "seleccion",
        paint: {
          "circle-radius": 60,
          "circle-color": "#0f0f0f",
          "circle-opacity": 0.18,
        },
      });

      map.addSource("talleres", {
        type: "geojson",
        data: talleresGeoJSON(cityRef.current.talleres),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 26,
      });

      map.addLayer({
        id: "talleres-clusters",
        type: "circle",
        source: "talleres",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#ffffff",
          "circle-stroke-color": "#111111",
          "circle-stroke-width": 1,
          "circle-radius": [
            "min",
            40,
            ["+", 10, ["*", ["get", "point_count"], 3.5]],
          ],
        },
      });

      map.addLayer({
        id: "talleres-cluster-count",
        type: "symbol",
        source: "talleres",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": ["min", 18, ["+", 10, ["*", ["get", "point_count"], 0.9]]],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#111111",
        },
      });

      map.addLayer({
        id: "talleres-pines",
        type: "circle",
        source: "talleres",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#0f0f0f",
          "circle-radius": 16,
        },
      });

      map.addLayer({
        id: "talleres-iconos",
        type: "symbol",
        source: "talleres",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "taller-icono",
          "icon-size": 0.5,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      defaultZoomRef.current = encajarCiudad(map, cityRef.current, 0);

      const setPointer = () => {
        map.getCanvas().style.cursor = "pointer";
      };
      const clearPointer = () => {
        map.getCanvas().style.cursor = "";
      };
      for (const layer of capasPines) {
        map.on("mouseenter", layer, setPointer);
        map.on("mouseleave", layer, clearPointer);
      }
    };

    map.on("load", onLoad);

    map.on("click", (event) => {
      const target = event.originalEvent.target;
      if (target instanceof Element && target.closest("button")) return;

      const cluster = map.queryRenderedFeatures(event.point, { layers: ["talleres-clusters"] })[0];
      if (cluster?.geometry.type === "Point") {
        const clusterId = Number(cluster.properties?.cluster_id);
        const coordinates = cluster.geometry.coordinates as [number, number];
        const source = map.getSource("talleres") as GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({ center: coordinates, zoom });
        });
        return;
      }

      const pin = map.queryRenderedFeatures(event.point, { layers: ["talleres-pines"] })[0];
      if (pin?.properties?.name) {
        const taller = cityRef.current.talleres.find((item) => item.name === pin.properties?.name);
        if (taller) {
          setSelected(taller);
          const origen = defaultZoomRef.current ?? map.getZoom();
          map.easeTo({
            center: [taller.lng, taller.lat],
            zoom: zoomTaller(origen, map.getMaxZoom()),
            duration: 700,
          });
        }
        return;
      }

      // Clic en el vacío: cierra la ficha y vuelve al zoom de ciudad
      setSelected(null);
      defaultZoomRef.current = encajarCiudad(map, cityRef.current, 700);
      aplicarSeleccion(map, null);
    });

    let lastW = container.clientWidth;
    let lastH = container.clientHeight;
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      map.resize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener("wheel", onTrackpadPinch);
      clearResetTimer();
      mapRef.current = null;
      map.remove();
    };
  }, [copy]);

  useEffect(() => {
    if (prevCityIdRef.current === null) {
      prevCityIdRef.current = cityId;
      return;
    }
    if (prevCityIdRef.current === cityId) return;
    prevCityIdRef.current = cityId;
    cityRef.current = ciudad;
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    clearResetTimer();
    setSelected(null);
    aplicarFuentes(map, ciudad, nombreCiudad(copy, ciudad));
    aplicarSeleccion(map, null);
    defaultZoomRef.current = encajarCiudad(map, ciudad, 700);
  }, [cityId, ciudad, copy]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    aplicarSeleccion(map, selected);
  }, [selected]);

  return (
    <section
      className={styles.mapSection}
      aria-label={copy.sectionAria.replace("{city}", nombreCiudad(copy, ciudad))}
      onPointerEnter={clearResetTimer}
      onPointerLeave={scheduleReset}
    >
      <div className={styles.mapCitySwitch} role="radiogroup" aria-label={copy.citySwitchAria}>
        {CIUDADES_MAPA.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={item.id === cityId}
            className={item.id === cityId ? styles.mapCitySwitchActive : undefined}
            onClick={() => {
              cityRef.current = ciudadPorId(item.id);
              setCityId(item.id);
            }}
          >
            {copy.ciudades[item.id] ?? item.label}
          </button>
        ))}
      </div>
      <div ref={containerRef} className={styles.mapCanvas} />
      <div className={styles.mapZoomControls}>
        <button
          type="button"
          className={styles.mapResetBtn}
          aria-label="Volver a la vista de ciudad"
          onClick={() => {
            const map = mapRef.current;
            if (!map) return;
            clearResetTimer();
            setSelected(null);
            aplicarSeleccion(map, null);
            defaultZoomRef.current = encajarCiudad(map, cityRef.current, 700);
          }}
        >
          <Icon name="my_location" size="sm" />
        </button>
      </div>
      {selected ? (
        <article className={styles.mapPlaceCard} aria-live="polite">
          <StreetViewPhoto taller={selected} />
          <div className={styles.mapPlaceBody}>
            <strong>{selected.name}</strong>
            <p>{selected.address}</p>
            <div className={styles.mapPlaceActions}>
              <a
                className={styles.btnSecondary}
                href={mapsUrl(selected.address)}
                target="_blank"
                rel="noreferrer"
              >
                {copy.details}
              </a>
              <a className={styles.btnPrimary} href="#contacto">
                {copy.talk}
              </a>
            </div>
          </div>
        </article>
      ) : null}
    </section>
  );
}
