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
};

export type DistritoMapa = {
  name: string;
  lng: number;
  lat: number;
};

export type CiudadMapaId =
  | "madrid"
  | "londres"
  | "sao-paulo"
  | "san-francisco"
  | "nueva-york";

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

const SAO_PAULO: CiudadMapa = {
  id: "sao-paulo",
  label: "São Paulo",
  cityName: "São Paulo",
  lng: -46.6339,
  lat: -23.5505,
  bounds: [
    [-46.73, -23.63],
    [-46.58, -23.49],
  ],
  omitDistrict: "Centro",
  distritos: [
    { name: "Centro", lng: -46.6333, lat: -23.5505 },
    { name: "Pinheiros", lng: -46.681, lat: -23.567 },
    { name: "Vila Madalena", lng: -46.691, lat: -23.553 },
    { name: "Jardins", lng: -46.66, lat: -23.57 },
    { name: "Moema", lng: -46.662, lat: -23.601 },
    { name: "Itaim", lng: -46.677, lat: -23.585 },
    { name: "Consolação", lng: -46.652, lat: -23.557 },
    { name: "Vila Mariana", lng: -46.634, lat: -23.589 },
    { name: "Perdizes", lng: -46.678, lat: -23.536 },
    { name: "Santana", lng: -46.629, lat: -23.503 },
    { name: "Ipiranga", lng: -46.611, lat: -23.589 },
    { name: "Cambuci", lng: -46.62, lat: -23.566 },
  ],
  talleres: [
    {
      name: "Auto Mecânica e Funilaria Pinheiros",
      address: "Rua dos Pinheiros, 1085, São Paulo, SP 05422-012",
      lat: -23.5678865,
      lng: -46.6881598,
    },
    {
      name: "Auto Mecânica J Costa",
      address: "Rua Ferreira de Araújo, 342, Pinheiros, São Paulo, SP",
      lat: -23.5607126,
      lng: -46.6980514,
    },
    {
      name: "Mecânica Madrii",
      address: "Rua Tabapuã, 994, Itaim Bibi, São Paulo, SP",
      lat: -23.5843343,
      lng: -46.6802088,
    },
    {
      name: "Navega Mecânica",
      address: "Rua Gaivota, 860, Moema, São Paulo, SP 04522-032",
      lat: -23.6033093,
      lng: -46.6675462,
    },
    {
      name: "Riveros Serviços Automotivos",
      address: "Rua Luís Góis, 187, Vila Mariana, São Paulo, SP",
      lat: -23.6042049,
      lng: -46.629315,
    },
    {
      name: "Aimbere Auto Comercial",
      address: "Rua Aimberê, 640, Perdizes, São Paulo, SP 05018-010",
      lat: -23.5359934,
      lng: -46.6805201,
    },
    {
      name: "2001 HP Serviços Automotivos",
      address: "Rua Clímaco Barbosa, 755, Cambuci, São Paulo, SP",
      lat: -23.5667428,
      lng: -46.6139163,
    },
  ],
};

const SAN_FRANCISCO: CiudadMapa = {
  id: "san-francisco",
  label: "San Francisco",
  cityName: "San Francisco",
  lng: -122.4194,
  lat: 37.7749,
  bounds: [
    [-122.515, 37.708],
    [-122.357, 37.812],
  ],
  omitDistrict: "Hayes Valley",
  distritos: [
    { name: "Mission", lng: -122.419, lat: 37.7599 },
    { name: "SoMa", lng: -122.403, lat: 37.778 },
    { name: "Castro", lng: -122.435, lat: 37.7609 },
    { name: "Richmond", lng: -122.483, lat: 37.78 },
    { name: "Sunset", lng: -122.494, lat: 37.753 },
    { name: "Marina", lng: -122.438, lat: 37.803 },
    { name: "Financial District", lng: -122.399, lat: 37.794 },
    { name: "Haight", lng: -122.447, lat: 37.769 },
    { name: "Potrero", lng: -122.397, lat: 37.759 },
    { name: "Noe Valley", lng: -122.433, lat: 37.75 },
    { name: "North Beach", lng: -122.409, lat: 37.806 },
    { name: "Hayes Valley", lng: -122.425, lat: 37.776 },
  ],
  talleres: [
    {
      name: "Sunset 76",
      address: "1700 Noriega Street, San Francisco, CA 94122",
      lat: 37.7543151,
      lng: -122.4821966,
    },
    {
      name: "Sunset Auto Reconstruction",
      address: "1270 20th Avenue, San Francisco, CA 94122",
      lat: 37.7640581,
      lng: -122.4779214,
    },
    {
      name: "Noe Valley Auto Works",
      address: "4050 24th Street, San Francisco, CA 94114",
      lat: 37.751549,
      lng: -122.4330126,
    },
    {
      name: "Popular Mechanix",
      address: "252 14th Street, San Francisco, CA 94103",
      lat: 37.7686451,
      lng: -122.4187192,
    },
    {
      name: "International Sport Motors",
      address: "440 9th Street, San Francisco, CA 94103",
      lat: 37.7716736,
      lng: -122.4097881,
    },
    {
      name: "Advance Auto Repair",
      address: "265 Eddy Street, San Francisco, CA 94102",
      lat: 37.7837231,
      lng: -122.4119676,
    },
    {
      name: "Eddy's Auto Service",
      address: "1501 Pacific Avenue, San Francisco, CA 94109",
      lat: 37.7950702,
      lng: -122.4203434,
    },
    {
      name: "Alouis Auto Repair",
      address: "1970 McAllister Street, San Francisco, CA 94115",
      lat: 37.7772933,
      lng: -122.4445318,
    },
  ],
};

const NUEVA_YORK: CiudadMapa = {
  id: "nueva-york",
  label: "New York",
  cityName: "New York",
  lng: -73.9857,
  lat: 40.758,
  bounds: [
    [-74.04, 40.67],
    [-73.91, 40.83],
  ],
  omitDistrict: "Midtown",
  distritos: [
    { name: "Midtown", lng: -73.9857, lat: 40.7549 },
    { name: "Chelsea", lng: -74.0018, lat: 40.7465 },
    { name: "Village", lng: -74.002, lat: 40.7336 },
    { name: "Harlem", lng: -73.9465, lat: 40.8116 },
    { name: "Upper East Side", lng: -73.9665, lat: 40.7736 },
    { name: "Upper West Side", lng: -73.966, lat: 40.787 },
    { name: "Williamsburg", lng: -73.957, lat: 40.7081 },
    { name: "Downtown", lng: -74.006, lat: 40.7128 },
    { name: "East Village", lng: -73.9857, lat: 40.7265 },
    { name: "Brooklyn", lng: -73.99, lat: 40.685 },
    { name: "Long Island City", lng: -73.9442, lat: 40.7489 },
    { name: "Greenpoint", lng: -73.954, lat: 40.73 },
  ],
  talleres: [
    {
      name: "Quality Auto Services",
      address: "516 West 39th Street, New York, NY 10018",
      lat: 40.7578372,
      lng: -73.9974832,
    },
    {
      name: "Chelsea Auto Diagnostic",
      address: "616 West 47th Street, New York, NY 10036",
      lat: 40.7641093,
      lng: -73.9964835,
    },
    {
      name: "A&A Imported Motors",
      address: "307 East 92nd Street, New York, NY 10128",
      lat: 40.781599,
      lng: -73.9482515,
    },
    {
      name: "Chang's Auto Repair",
      address: "293 Bond Street, Brooklyn, NY 11231",
      lat: 40.6802844,
      lng: -73.9892079,
    },
    {
      name: "Alfa Motors",
      address: "547 Hicks Street, Brooklyn, NY 11231",
      lat: 40.6843919,
      lng: -74.0009284,
    },
    {
      name: "David's Auto Service",
      address: "321 McGuinness Boulevard, Brooklyn, NY 11222",
      lat: 40.733627,
      lng: -73.9524761,
    },
    {
      name: "T&A Auto Repair",
      address: "13-20 Jackson Avenue, Long Island City, NY 11101",
      lat: 40.7440914,
      lng: -73.9489261,
    },
    {
      name: "New Xcell Auto Repair",
      address: "Old Fulton Street, Dumbo, Brooklyn, NY 11201",
      lat: 40.702026,
      lng: -73.9929402,
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
  LONDRES,
  SAO_PAULO,
  SAN_FRANCISCO,
  NUEVA_YORK,
];

export const CIUDAD_INICIAL = CIUDADES_MAPA[0];

export function ciudadPorId(id: CiudadMapaId): CiudadMapa {
  return CIUDADES_MAPA.find((ciudad) => ciudad.id === id) ?? CIUDAD_INICIAL;
}
