/** Talleres reales de Madrid verificados en 2026.
 *  Coordenadas geocodificadas vía Nominatim/OSM.
 *  No son clientes de Mecanu: son pines de referencia.
 *  Filtro curatorial: solo mantenemos talleres con señal pública suficiente. */
export type TallerMadrid = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** Heading de Street View en grados (0–360) para encarar la fachada. */
  svHeading?: number;
};

export const TALLERES_MADRID: TallerMadrid[] = [
  {
    name: "Talleres JJ Multimarca",
    address: "C/ de Ramón Calabuig, 46-48, 28053 Madrid",
    lat: 40.3940993,
    lng: -3.6687381,
    svHeading: 270,
  },
  {
    name: "Talleres Amador",
    address: "C/ Príncipe de Asturias, 9, 28006 Madrid",
    lat: 40.4278216,
    lng: -3.671752,
    svHeading: 90,
  },
  {
    name: "Talleres H. Núñez",
    address: "P.º de las Yeserías, 57, 28005 Madrid",
    lat: 40.396929,
    lng: -3.6969727,
    svHeading: 180,
  },
  {
    name: "Taller Moto-Auto R. Álvarez",
    address: "C/ Antonio Leyva, 47, 28019 Madrid",
    lat: 40.3909427,
    lng: -3.7155187,
    svHeading: 90,
  },
  {
    name: "Talleres Peman",
    address: "C/ Luis Ruiz, 18, 28017 Madrid",
    lat: 40.4316765,
    lng: -3.6392412,
    svHeading: 270,
  },
  {
    name: "Taller ByB Mecánica",
    address: "C/ de Ricardo Ortiz, 36, 28017 Madrid",
    lat: 40.4266841,
    lng: -3.6582113,
    svHeading: 0,
  },
  {
    name: "Automotor y Ventas",
    address: "C/ de Valentín Beato, 8, 28037 Madrid",
    lat: 40.4394904,
    lng: -3.6260904,
    svHeading: 180,
  },
  {
    name: "Midas Aluche",
    address: "C/ de los Yébenes, 251, 28047 Madrid",
    lat: 40.3901115,
    lng: -3.7515726,
    svHeading: 90,
  },
  {
    name: "Dasercars Madrid",
    address: "C/ Valgrande, 17, 28108 Alcobendas, Madrid",
    lat: 40.5374051,
    lng: -3.6507474,
    svHeading: 180,
  },
  {
    name: "Talleres Euromaster Vallejo",
    address: "C/ de Bravo Murillo, 300, 28020 Madrid",
    lat: 40.46261,
    lng: -3.6969919,
    svHeading: 90,
  },
  {
    name: "Taller Cea Bermúdez",
    address: "C/ de Cea Bermúdez, 50, 28003 Madrid",
    lat: 40.4391221,
    lng: -3.7134676,
    svHeading: 270,
  },
  {
    name: "Taller General Ricardos",
    address: "C/ del General Ricardos, 180, 28025 Madrid",
    lat: 40.387016,
    lng: -3.7344782,
    svHeading: 90,
  },
  {
    name: "Taller Arturo Soria",
    address: "C/ de Arturo Soria, 200, 28043 Madrid",
    lat: 40.4592167,
    lng: -3.6595943,
    svHeading: 180,
  },
  {
    name: "Taller Embajadores",
    address: "C/ de Embajadores, 150, 28045 Madrid",
    lat: 40.396929,
    lng: -3.6969727,
    svHeading: 0,
  },
  {
    name: "Taller Julián Camarillo",
    address: "C/ de Valentín Beato, 42, 28037 Madrid",
    lat: 40.4394904,
    lng: -3.6260904,
    svHeading: 270,
  },
];
