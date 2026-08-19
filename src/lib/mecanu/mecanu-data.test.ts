import { describe, it, expect } from 'vitest';
import {
  fmtDinero, maskTel, maskDireccion, nombreCorto, nombreCliente1,
  normalizePlate, fuzzyScore, buscarMatricula, franjasConflictan, parseFranja,
  localizarDireccion, verificarDireccion, CLIENTES, VEHICULOS, CONDUCTORES,
  SERVICIOS, IVA, OPORTUNIDADES_BASE,
} from './mecanu-data';
import { SERVICIO_TRASLADO_ID } from './mecanu-pipeline';

// Intl inserta un espacio *duro* (U+00A0, non-breaking space) antes de "€", no uno
// normal — es tipográficamente correcto (evita que el símbolo quede solo al final de
// línea) y así lo hacen los navegadores reales. \s en las regex de abajo cubre ambos.
describe('Dinero: siempre es-ES con símbolo €, nunca un número pelado', () => {
  it('formatea con coma decimal, separador de miles y símbolo de euro', () => {
    expect(fmtDinero(1234.56)).toMatch(/^1\.234,56\s€$/);
  });

  it('sin dato, nunca "0 €" ni "NaN" — se dice explícitamente que no hay dato', () => {
    expect(fmtDinero(null)).toBe('—');
    expect(fmtDinero(undefined)).toBe('—');
  });

  it('sinDecimales redondea (56 céntimos sube al entero siguiente) sin perder el símbolo de moneda', () => {
    expect(fmtDinero(1234.56, true)).toMatch(/^1\.235\s€$/);
  });
});

describe('RGPD: el teléfono se enmascara hasta que la tarea lo requiera', () => {
  it('conserva el prefijo pero oculta el resto', () => {
    expect(maskTel('655 111 222')).toBe('655 ••• •••');
  });

  it('sin teléfono, no hay nada que enmascarar ni inventar', () => {
    expect(maskTel(null)).toBe('—');
  });
});

describe('RGPD: la dirección se enmascara a "calle · CP" en listados', () => {
  it('quita el número de portal', () => {
    expect(maskDireccion('Carrer de Muntaner 340, 3ºB, 08021 Barcelona')).toBe('Carrer de Muntaner · 08021');
  });

  it('sin dirección, no inventa nada', () => {
    expect(maskDireccion(null)).toBe('—');
  });
});

describe('Nombre corto: primer nombre + apellido, nunca el nombre completo en una card', () => {
  it('una persona con nombre compuesto y 2 apellidos se abrevia a primer nombre + primer apellido + inicial del segundo', () => {
    expect(nombreCorto('María Dolores Ruiz Campos')).toBe('María Ruiz C.');
  });

  it('una persona con un solo nombre y un solo apellido se muestra completa (nada que abreviar)', () => {
    expect(nombreCorto('Ana López')).toBe('Ana López');
  });

  it('una empresa se muestra tal cual, nunca se abrevia', () => {
    expect(nombreCorto('Jardines Verdes S.L.')).toBe('Jardines Verdes S.L.');
  });

  it('nombreCliente1 da nombre + inicial del apellido, para el espacio más justo de una card', () => {
    expect(nombreCliente1('Antonio Guerrero Díaz')).toBe('Antonio G.');
  });
});

describe('Búsqueda de matrícula: tolerante a espacios, guiones y errores de tipeo', () => {
  it('normaliza espacios y mayúsculas antes de comparar', () => {
    expect(normalizePlate('4521 ktm')).toBe('4521KTM');
    expect(normalizePlate('4521-KTM')).toBe('4521KTM');
  });

  it('una matrícula exacta se encuentra siempre', () => {
    const { exactas } = buscarMatricula('4521 KTM');
    expect(exactas.map((v) => v.id)).toContain('v1');
  });

  it('un error de tipeo de una sola letra sigue encontrando la matrícula (tolerancia alta)', () => {
    const { exactas } = buscarMatricula('4521 KTN'); // KTN en vez de KTM: 1 letra de distancia
    expect(exactas.map((v) => v.id)).toContain('v1');
  });

  it('un texto sin ninguna matrícula parecida no sugiere nada al azar', () => {
    const { exactas, sugerida } = buscarMatricula('ZZZZ ZZZ');
    expect(exactas).toHaveLength(0);
    expect(sugerida).toBeNull();
  });

  it('fuzzyScore de una coincidencia exacta es 1', () => {
    expect(fuzzyScore('KTM', 'KTM')).toBe(1);
  });

  it('fuzzyScore de dos textos sin relación es bajo', () => {
    expect(fuzzyScore('KTM', 'ZZZZZZ')).toBeLessThan(0.3);
  });
});

describe('Conflicto de agenda de un conductor: dos franjas necesitan 1h de margen entre sí', () => {
  it('dos franjas consecutivas sin hueco entran en conflicto (no da tiempo a desplazarse)', () => {
    expect(franjasConflictan('09:00 - 10:00', '10:00 - 11:00')).toBe(true);
  });

  it('dos franjas con 1h exacta de margen NO entran en conflicto', () => {
    expect(franjasConflictan('09:00 - 10:00', '11:00 - 12:00')).toBe(false);
  });

  it('dos franjas solapadas entran en conflicto', () => {
    expect(franjasConflictan('09:00 - 11:00', '10:00 - 12:00')).toBe(true);
  });

  it('parseFranja separa inicio y fin en horas', () => {
    expect(parseFranja('09:00 - 10:00')).toEqual({ start: 9, end: 10 });
  });
});

describe('Barrio y ciudad se derivan de la dirección — nunca es un campo separado que se pueda desincronizar', () => {
  it('un código postal conocido de Barcelona resuelve el barrio', () => {
    const { sublocalidad, localidad } = localizarDireccion('Carrer de Numància 105, Nau 3, 08029 Barcelona');
    expect(sublocalidad).toBe('Les Corts');
    expect(localidad).toBe('Barcelona');
  });

  it('sin dirección, no hay barrio que inventar', () => {
    expect(localizarDireccion(null)).toEqual({ sublocalidad: null, localidad: null });
  });

  it('un código postal fuera del mapa conocido da barrio null, nunca un valor inventado', () => {
    const { sublocalidad } = localizarDireccion('Calle Falsa 123, 99999 Ciudad Inexistente');
    expect(sublocalidad).toBeNull();
  });
});

describe('Verificación de dirección: simula un geocoder real', () => {
  it('rechaza una dirección demasiado corta para ser real', () => {
    expect(verificarDireccion('abc').ok).toBe(false);
  });
});

describe('El traslado es un ítem más del tempario del taller, no un concepto aparte', () => {
  it('SV-11 existe en el catálogo de servicios y es el id oficial del traslado', () => {
    const traslado = SERVICIOS.find((s) => s.id === SERVICIO_TRASLADO_ID);
    expect(traslado).toBeDefined();
    expect(traslado?.categoria).toBe('Traslado');
  });

  it('el total con IVA de cualquier servicio es mano de obra + materiales, con el 21% aplicado', () => {
    for (const s of SERVICIOS) {
      const totalEsperado = Math.round((s.manoObra + s.materiales) * (1 + IVA) * 100) / 100;
      expect(s.totalIva).toBeCloseTo(totalEsperado, 2);
    }
  });
});

describe('Volumen de datos sembrados coincide con lo documentado en CLAUDE.md', () => {
  it('14 clientes', () => expect(CLIENTES).toHaveLength(14));
  it('18 vehículos', () => expect(VEHICULOS).toHaveLength(18));
  it('6 conductores', () => expect(CONDUCTORES).toHaveLength(6));
});

describe('Fixtures de Campañas: la tabla puede enseñar cada estado de la demo', () => {
  it('incluye un servicio vencido, uno vigente dentro de 60 días y un auto con varios tipos', () => {
    const items = OPORTUNIDADES_BASE.flatMap((o) => o.items);
    const tiposDeLaDemo = new Set(items.map((item) => item.tipo));

    expect(items.some((item) => item.dias < 0)).toBe(true);
    expect(items.some((item) => item.dias > 45 && item.dias < 60)).toBe(true);
    expect(tiposDeLaDemo.size).toBeGreaterThanOrEqual(6);
  });
});
