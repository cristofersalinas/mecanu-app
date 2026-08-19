/** Talleres públicos de Madrid (norte y sur).
 *  Coordenadas via Nominatim/OSM. No son clientes de Mecanu: son pines de referencia. */
export type TallerMadrid = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export const TALLERES_MADRID: TallerMadrid[] = [
  {
    name: "Taller Mecánico Chamartín",
    address: "C. de Torrelara, 6, 28016 Madrid",
    lat: 40.4623551,
    lng: -3.6694771,
  },
  {
    name: "Talleres Jurado",
    address: "C. de la Infanta María Teresa, 12, 28016 Madrid",
    lat: 40.453884,
    lng: -3.6809349,
  },
  {
    name: "Talleres Honorio",
    address: "C. de Francisco Giralte, 1, 28002 Madrid",
    lat: 40.4404403,
    lng: -3.6781319,
  },
  {
    name: "Motor Príncipe de Vergara",
    address: "C. del Príncipe de Vergara, 207, 28002 Madrid",
    lat: 40.4502016,
    lng: -3.6782627,
  },
  {
    name: "Taller Chamberí",
    address: "C. de Bretón de los Herreros, 38, 28003 Madrid",
    lat: 40.4394001,
    lng: -3.6969246,
  },
  {
    name: "Talleres Miraz",
    address: "C. de Calvo Asensio, 11, 28015 Madrid",
    lat: 40.4323642,
    lng: -3.7123067,
  },
  {
    name: "Talleres Arevalillo",
    address: "C. de Cea Bermúdez, 47, 28003 Madrid",
    lat: 40.4388771,
    lng: -3.7136161,
  },
  {
    name: "Subaru Trade Gamboa",
    address: "C. de José Abascal, 2, 28003 Madrid",
    lat: 40.4384757,
    lng: -3.7033234,
  },
  {
    name: "Lunarapid",
    address: "C. de Luchana, 28, 28010 Madrid",
    lat: 40.4309957,
    lng: -3.6990518,
  },
  {
    name: "Rogasanz",
    address: "C. de Ríos Rosas, 11, 28003 Madrid",
    lat: 40.4421797,
    lng: -3.7024695,
  },
  {
    name: "Aluauto Motor",
    address: "C. de Espronceda, 22, 28003 Madrid",
    lat: 40.4405476,
    lng: -3.6959013,
  },
  {
    name: "Battinver Volvo",
    address: "C. del Padre Damián, 39, 28036 Madrid",
    lat: 40.4567372,
    lng: -3.6862129,
  },
  {
    name: "Premium Car",
    address: "C. del Padre Damián, 1, 28036 Madrid",
    lat: 40.4531259,
    lng: -3.6866471,
  },
  {
    name: "Superautomotor",
    address: "C. de Costa Rica, 12, 28016 Madrid",
    lat: 40.4582613,
    lng: -3.6753803,
  },
  {
    name: "Taller Costa Rica Motor",
    address: "C. de la Drácena, 22, 28016 Madrid",
    lat: 40.4630432,
    lng: -3.6713485,
  },
  {
    name: "Mack Auto",
    address: "C. Sierra de Segura, 19, 28038 Madrid",
    lat: 40.4037265,
    lng: -3.6639216,
  },
];
