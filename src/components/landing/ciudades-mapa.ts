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

export type CiudadMapaId =
  | "madrid"
  | "barcelona"
  | "londres"
  | "zurich";

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

const LONDRES: CiudadMapa = {
  id: "londres",
  label: "London",
  cityName: "London",
  lng: -0.1278,
  lat: 51.5074,
  bounds: [
    [-0.22, 51.465],
    [-0.04, 51.56],
  ],
  omitDistrict: "Westminster",
  distritos: [
    { name: "Westminster", lng: -0.1357, lat: 51.4975 },
    { name: "Camden", lng: -0.1426, lat: 51.539 },
    { name: "Islington", lng: -0.1023, lat: 51.5465 },
    { name: "Hackney", lng: -0.055, lat: 51.545 },
    { name: "Tower Hamlets", lng: -0.03, lat: 51.515 },
    { name: "Southwark", lng: -0.088, lat: 51.503 },
    { name: "Lambeth", lng: -0.117, lat: 51.46 },
    { name: "Kensington", lng: -0.195, lat: 51.502 },
    { name: "Chelsea", lng: -0.169, lat: 51.487 },
    { name: "City", lng: -0.09, lat: 51.5155 },
    { name: "Wandsworth", lng: -0.192, lat: 51.457 },
    { name: "Hammersmith", lng: -0.224, lat: 51.492 },
  ],
  talleres: [
    {
      name: "Camden Service Centre",
      address: "139-147 Camden Road, London NW1 9HA",
      lat: 51.5459778,
      lng: -0.13337,
    },
    {
      name: "A W Motors",
      address: "134 Camley Street, London N1C 4PF",
      lat: 51.5363001,
      lng: -0.1298358,
    },
    {
      name: "Clerkenwell Motors",
      address: "14 Warner Street, London EC1R 5HA",
      lat: 51.5234079,
      lng: -0.1116371,
    },
    {
      name: "Millennium City Garages",
      address: "68-70 Great Suffolk Street, London SE1 0BL",
      lat: 51.5011124,
      lng: -0.1009343,
    },
    {
      name: "Cabfix",
      address: "100-102 Golding Street, London E1 1QH",
      lat: 51.5113365,
      lng: -0.0634914,
    },
    {
      name: "Tower Porsche Specialist",
      address: "56 Druid Street, London SE1 2HQ",
      lat: 51.5003346,
      lng: -0.076435,
    },
    {
      name: "Auto Car Repairs",
      address: "5 Boundary Lane, London SE17 2BH",
      lat: 51.4831798,
      lng: -0.0939101,
    },
    {
      name: "Chelsea Workshops",
      address: "Nell Gwynn House, 55-57 Sloane Avenue, London SW3 3JE",
      lat: 51.4923119,
      lng: -0.1653473,
    },
  ],
};

const ZURICH: CiudadMapa = {
  id: "zurich",
  label: "Zurich",
  cityName: "Zurich",
  lng: 8.5417,
  lat: 47.3769,
  bounds: [
    [8.47, 47.34],
    [8.61, 47.41],
  ],
  omitDistrict: "Altstadt",
  distritos: [
    { name: "Altstadt", lng: 8.5414, lat: 47.3717 },
    { name: "Enge", lng: 8.5295, lat: 47.3612 },
    { name: "Wiedikon", lng: 8.5186, lat: 47.3713 },
    { name: "Oerlikon", lng: 8.5453, lat: 47.4104 },
    { name: "Seefeld", lng: 8.5559, lat: 47.3605 },
    { name: "Zürich West", lng: 8.5141, lat: 47.3891 },
  ],
  talleres: [
    {
      name: "Letzigraben Garage",
      address: "77 Letzigraben, 8003 Zürich, Schweiz",
      lat: 47.378325,
      lng: 8.4999936,
    },
    {
      name: "Garage Zwicky",
      address: "23a Regensdorferstrasse, 8049 Zürich, Schweiz",
      lat: 47.4035611,
      lng: 8.4969407,
    },
    {
      name: "Corner Garage",
      address: "121 Wehntalerstrasse, 8057 Zürich, Schweiz",
      lat: 47.4036597,
      lng: 8.5335793,
    },
    {
      name: "Allenmoos Garage",
      address: "268 Hofwiesenstrasse, 8057 Zürich, Schweiz",
      lat: 47.4067451,
      lng: 8.5382781,
    },
    {
      name: "Lochergut-Garage AG",
      address: "5 Karl-Bürkli-Strasse, 8004 Zürich, Schweiz",
      lat: 47.3766981,
      lng: 8.5174914,
    },
    {
      name: "Garage Autoport AG",
      address: "Erikastrasse, 8004 Zürich, Schweiz",
      lat: 47.3720082,
      lng: 8.5216796,
    },
    {
      name: "Garage Pneuhaus Vilarino Rodriguez",
      address: "413 Hohlstrasse, 8048 Zürich, Schweiz",
      lat: 47.3863051,
      lng: 8.5031028,
    },
    {
      name: "Bernina-Garage Werkstatt",
      address: "10 Bremgartnerstrasse, 8003 Zürich, Schweiz",
      lat: 47.372582,
      lng: 8.5203218,
    },
  ],
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
  LONDRES,
  ZURICH,
];

export const CIUDAD_INICIAL = CIUDADES_MAPA[0];

export function ciudadPorId(id: CiudadMapaId): CiudadMapa {
  return CIUDADES_MAPA.find((ciudad) => ciudad.id === id) ?? CIUDAD_INICIAL;
}
