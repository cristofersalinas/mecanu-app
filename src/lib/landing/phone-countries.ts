export type PhoneCountry = {
  code: string;       // ISO 3166-1 alpha-2
  name: string;       // nombre en español
  prefix: string;     // e.g. "+34"
  placeholder: string; // formato local orientativo
  pattern: string;    // regex string para validación básica (dígitos)
  minLen: number;     // mínimo de dígitos (sin el prefijo)
};

/** Europa completa + EE.UU. + Chile, ordenados: España primero, luego alfabético */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  // España primero (default)
  { code: "ES", name: "España",          prefix: "+34",  placeholder: "612 345 678",   pattern: "^[679]\\d{8}$",        minLen: 9  },
  // Europa (alfabético)
  { code: "AL", name: "Albania",         prefix: "+355", placeholder: "066 123 4567",  pattern: "^\\d{9,10}$",          minLen: 9  },
  { code: "AD", name: "Andorra",         prefix: "+376", placeholder: "312 345",        pattern: "^\\d{6,9}$",           minLen: 6  },
  { code: "AT", name: "Austria",         prefix: "+43",  placeholder: "0664 123456",   pattern: "^\\d{7,13}$",          minLen: 7  },
  { code: "BY", name: "Bielorrusia",     prefix: "+375", placeholder: "029 123 4567",  pattern: "^\\d{9,10}$",          minLen: 9  },
  { code: "BE", name: "Bélgica",         prefix: "+32",  placeholder: "0470 12 34 56", pattern: "^\\d{8,9}$",           minLen: 8  },
  { code: "BA", name: "Bosnia",          prefix: "+387", placeholder: "061 123 456",   pattern: "^\\d{8,9}$",           minLen: 8  },
  { code: "BG", name: "Bulgaria",        prefix: "+359", placeholder: "087 123 4567",  pattern: "^\\d{9,10}$",          minLen: 9  },
  { code: "CY", name: "Chipre",          prefix: "+357", placeholder: "96 123456",     pattern: "^\\d{8}$",             minLen: 8  },
  { code: "HR", name: "Croacia",         prefix: "+385", placeholder: "091 234 5678",  pattern: "^\\d{8,9}$",           minLen: 8  },
  { code: "DK", name: "Dinamarca",       prefix: "+45",  placeholder: "20 12 34 56",   pattern: "^\\d{8}$",             minLen: 8  },
  { code: "SK", name: "Eslovaquia",      prefix: "+421", placeholder: "0901 123 456",  pattern: "^\\d{9,10}$",          minLen: 9  },
  { code: "SI", name: "Eslovenia",       prefix: "+386", placeholder: "040 123 456",   pattern: "^\\d{8,9}$",           minLen: 8  },
  { code: "EE", name: "Estonia",         prefix: "+372", placeholder: "5123 4567",     pattern: "^\\d{7,8}$",           minLen: 7  },
  { code: "FI", name: "Finlandia",       prefix: "+358", placeholder: "041 234 5678",  pattern: "^\\d{9,10}$",          minLen: 9  },
  { code: "FR", name: "Francia",         prefix: "+33",  placeholder: "06 12 34 56 78",pattern: "^[67]\\d{8}$",         minLen: 9  },
  { code: "GR", name: "Grecia",          prefix: "+30",  placeholder: "697 123 4567",  pattern: "^\\d{10}$",            minLen: 10 },
  { code: "HU", name: "Hungría",         prefix: "+36",  placeholder: "06 30 123 4567",pattern: "^\\d{9,10}$",          minLen: 9  },
  { code: "IE", name: "Irlanda",         prefix: "+353", placeholder: "085 123 4567",  pattern: "^\\d{9,10}$",          minLen: 9  },
  { code: "IS", name: "Islandia",        prefix: "+354", placeholder: "611 2345",      pattern: "^\\d{7}$",             minLen: 7  },
  { code: "IT", name: "Italia",          prefix: "+39",  placeholder: "312 345 6789",  pattern: "^3\\d{9,10}$",         minLen: 9  },
  { code: "LV", name: "Letonia",         prefix: "+371", placeholder: "2123 4567",     pattern: "^\\d{8}$",             minLen: 8  },
  { code: "LI", name: "Liechtenstein",   prefix: "+423", placeholder: "660 1234",      pattern: "^\\d{7,9}$",           minLen: 7  },
  { code: "LT", name: "Lituania",        prefix: "+370", placeholder: "612 34567",     pattern: "^\\d{8}$",             minLen: 8  },
  { code: "LU", name: "Luxemburgo",      prefix: "+352", placeholder: "621 123 456",   pattern: "^\\d{9}$",             minLen: 9  },
  { code: "MK", name: "Macedonia",       prefix: "+389", placeholder: "070 123 456",   pattern: "^\\d{8,9}$",           minLen: 8  },
  { code: "MT", name: "Malta",           prefix: "+356", placeholder: "9912 3456",     pattern: "^\\d{8}$",             minLen: 8  },
  { code: "MD", name: "Moldavia",        prefix: "+373", placeholder: "069 123 456",   pattern: "^\\d{8}$",             minLen: 8  },
  { code: "MC", name: "Mónaco",          prefix: "+377", placeholder: "06 12 34 56 78",pattern: "^\\d{8,9}$",           minLen: 8  },
  { code: "ME", name: "Montenegro",      prefix: "+382", placeholder: "067 123 456",   pattern: "^\\d{8,9}$",           minLen: 8  },
  { code: "NO", name: "Noruega",         prefix: "+47",  placeholder: "412 34 567",    pattern: "^\\d{8}$",             minLen: 8  },
  { code: "NL", name: "Países Bajos",    prefix: "+31",  placeholder: "06 12345678",   pattern: "^6\\d{8}$",            minLen: 9  },
  { code: "PL", name: "Polonia",         prefix: "+48",  placeholder: "501 123 456",   pattern: "^\\d{9}$",             minLen: 9  },
  { code: "PT", name: "Portugal",        prefix: "+351", placeholder: "912 345 678",   pattern: "^[9]\\d{8}$",          minLen: 9  },
  { code: "GB", name: "Reino Unido",     prefix: "+44",  placeholder: "07911 123456",  pattern: "^7\\d{9}$",            minLen: 10 },
  { code: "CZ", name: "Rep. Checa",      prefix: "+420", placeholder: "601 123 456",   pattern: "^\\d{9}$",             minLen: 9  },
  { code: "RO", name: "Rumanía",         prefix: "+40",  placeholder: "0712 345 678",  pattern: "^7\\d{8}$",            minLen: 9  },
  { code: "RU", name: "Rusia",           prefix: "+7",   placeholder: "912 345-67-89", pattern: "^\\d{10}$",            minLen: 10 },
  { code: "SM", name: "San Marino",      prefix: "+378", placeholder: "0549 123456",   pattern: "^\\d{6,10}$",          minLen: 6  },
  { code: "RS", name: "Serbia",          prefix: "+381", placeholder: "060 1234567",   pattern: "^\\d{8,10}$",          minLen: 8  },
  { code: "SE", name: "Suecia",          prefix: "+46",  placeholder: "070-123 45 67", pattern: "^7\\d{8}$",            minLen: 9  },
  { code: "CH", name: "Suiza",           prefix: "+41",  placeholder: "076 123 45 67", pattern: "^7\\d{8}$",            minLen: 9  },
  { code: "TR", name: "Turquía",         prefix: "+90",  placeholder: "0532 123 4567", pattern: "^5\\d{9}$",            minLen: 10 },
  { code: "UA", name: "Ucrania",         prefix: "+380", placeholder: "067 123 4567",  pattern: "^\\d{9,10}$",          minLen: 9  },
  { code: "VA", name: "Vaticano",        prefix: "+39",  placeholder: "06 698 12345",  pattern: "^\\d{6,11}$",          minLen: 6  },
  // Fuera de Europa
  { code: "CL", name: "Chile",           prefix: "+56",  placeholder: "9 1234 5678",   pattern: "^9\\d{8}$",            minLen: 9  },
  { code: "US", name: "EE.UU.",          prefix: "+1",   placeholder: "(555) 867-5309",pattern: "^[2-9]\\d{9}$",        minLen: 10 },
];

export const DEFAULT_COUNTRY = PHONE_COUNTRIES[0]; // España
