import {
  DISTRITOS_MADRID,
  ETIQUETA_MADRID,
  MADRID_BOUNDS,
} from "./distritos-madrid";
import { TALLERES_MADRID } from "./talleres-madrid";

/** Pines de referencia públicos (OSM / directorios). No son clientes de Mecanu. */
export type TallerMapa = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  svHeading?: number;
};

export type DistritoMapa = {
  name: string;
  lng: number;
  lat: number;
};

export type CiudadMapaId = "madrid" | "barcelona";

export type CiudadMapa = {
  id: CiudadMapaId;
  /** Texto del selector. */
  label: string;
  cityName: string;
  lng: number;
  lat: number;
  bounds: [[number, number], [number, number]];
  /** Barrio que quedaría debajo del nombre de la ciudad. */
  omitDistrict: string;
  distritos: DistritoMapa[];
  talleres: TallerMapa[];
};

export const TAMANO_DISTRITO = 18;
export const TAMANO_CIUDAD = 30;

const BARCELONA: CiudadMapa = {
  id: "barcelona",
  label: "Barcelona",
  cityName: "Barcelona",
  lng: 2.1734,
  lat: 41.3851,
  bounds: [
    [2.07, 41.32],
    [2.25, 41.45],
  ],
  omitDistrict: "Eixample",
  distritos: [
    { name: "Eixample", lng: 2.163, lat: 41.39 },
    { name: "Gràcia", lng: 2.158, lat: 41.403 },
    { name: "Sants", lng: 2.14, lat: 41.375 },
    { name: "Poblenou", lng: 2.2, lat: 41.403 },
    { name: "Sant Andreu", lng: 2.189, lat: 41.436 },
    { name: "Les Corts", lng: 2.129, lat: 41.387 },
    { name: "Sarrià", lng: 2.121, lat: 41.401 },
    { name: "Barceloneta", lng: 2.191, lat: 41.379 },
  ],
  talleres: [],
};

export const CIUDADES_MAPA: CiudadMapa[] = [
  {
    id: "madrid",
    label: "Madrid",
    cityName: ETIQUETA_MADRID.name,
    lng: ETIQUETA_MADRID.lng,
    lat: ETIQUETA_MADRID.lat,
    bounds: MADRID_BOUNDS,
    omitDistrict: "Centro",
    distritos: DISTRITOS_MADRID,
    talleres: TALLERES_MADRID,
  },
  BARCELONA,
];

export const CIUDAD_INICIAL = CIUDADES_MAPA[0];

export function ciudadPorId(id: CiudadMapaId): CiudadMapa {
  return CIUDADES_MAPA.find((ciudad) => ciudad.id === id) ?? CIUDAD_INICIAL;
}
