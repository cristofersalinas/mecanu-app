/** 21 distritos municipales. Etiquetas para el mapa de la landing. */
export const DISTRITOS_MADRID: { name: string; lng: number; lat: number }[] = [
  { name: "Centro", lng: -3.7049, lat: 40.41831 },
  { name: "Arganzuela", lng: -3.69866, lat: 40.40184 },
  { name: "Retiro", lng: -3.67724, lat: 40.41049 },
  { name: "Salamanca", lng: -3.67185, lat: 40.43369 },
  { name: "Chamartín", lng: -3.67574, lat: 40.458 },
  { name: "Tetuán", lng: -3.70119, lat: 40.4605 },
  { name: "Chamberí", lng: -3.70675, lat: 40.43921 },
  { name: "Fuencarral", lng: -3.72, lat: 40.498 },
  { name: "Moncloa", lng: -3.755, lat: 40.445 },
  { name: "Latina", lng: -3.758, lat: 40.388 },
  { name: "Carabanchel", lng: -3.73171, lat: 40.38853 },
  { name: "Usera", lng: -3.69449, lat: 40.37504 },
  { name: "Puente de Vallecas", lng: -3.662, lat: 40.386 },
  { name: "Moratalaz", lng: -3.64118, lat: 40.4087 },
  { name: "Ciudad Lineal", lng: -3.64962, lat: 40.44728 },
  { name: "Hortaleza", lng: -3.64, lat: 40.472 },
  { name: "Villaverde", lng: -3.692, lat: 40.347 },
  { name: "Villa de Vallecas", lng: -3.621, lat: 40.362 },
  { name: "Vicálvaro", lng: -3.608, lat: 40.404 },
  { name: "San Blas", lng: -3.612, lat: 40.436 },
  { name: "Barajas", lng: -3.577, lat: 40.473 },
];

/** Recuadro del término urbano, sin el monte de El Pardo. */
export const MADRID_BOUNDS: [[number, number], [number, number]] = [
  [-3.83, 40.33],
  [-3.54, 40.515],
];

export const ETIQUETA_MADRID = {
  name: "Madrid",
  lng: -3.7038,
  lat: 40.4168,
};

export const TAMANO_DISTRITO = 18;
export const TAMANO_CIUDAD = 30;
