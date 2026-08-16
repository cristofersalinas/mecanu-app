import { describe, it, expect } from 'vitest';
import {
  RUTAS, RUTAS_VISTA, CAMPANAS, ruta, presupuesto, tramosDeRuta, paradasDeRuta,
  tramoActivo, tagsDeRuta, vistaRuta, ubicacionVehiculo, contactosDeVehiculo,
} from './mecanu-rutas';

describe('El total del presupuesto SIEMPRE incluye la línea de traslado (decisión cerrada, CLAUDE.md #1)', () => {
  it('TR-1042 = 284,50 reparación + 90 traslados = 374,50 €', () => {
    const pres = presupuesto('PR-TR-1042');
    expect(pres).not.toBeNull();
    expect(pres!.total).toBeCloseTo(374.5, 2);
    const lineaTraslado = pres!.lineas.filter((l) => l.origen === 'traslado');
    expect(lineaTraslado.length).toBeGreaterThan(0);
  });

  it('nunca hay un presupuesto sin al menos su línea de traslado si la ruta tiene tramos', () => {
    for (const r of RUTAS) {
      const tramos = tramosDeRuta(r.id);
      if (tramos.length === 0) continue;
      const pres = presupuesto(r.presupuestoId);
      const lineasTraslado = pres!.lineas.filter((l) => l.origen === 'traslado');
      expect(lineasTraslado.length).toBe(tramos.length);
    }
  });

  it('el total del presupuesto es exactamente la suma de sus líneas', () => {
    for (const r of RUTAS) {
      const pres = presupuesto(r.presupuestoId)!;
      const sumaLineas = Math.round(pres.lineas.reduce((a, l) => a + l.importe, 0) * 100) / 100;
      expect(pres.total).toBeCloseTo(sumaLineas, 2);
    }
  });
});

describe('Tag derivado "sin_conductor": ruta agendada cuyo tramo activo no tiene conductor', () => {
  it('TR-1055 (agendado, sin_conductor) lleva el tag', () => {
    const r = ruta('TR-1055')!;
    const tags = tagsDeRuta(r, Date.now());
    expect(tags.some((t) => t.id === 'sin_conductor')).toBe(true);
  });

  it('una ruta agendada CON conductor asignado no lleva el tag', () => {
    const r = ruta('TR-1046')!; // agendado, con conductorId
    const tags = tagsDeRuta(r, Date.now());
    expect(tags.some((t) => t.id === 'sin_conductor')).toBe(false);
  });

  it('los tags derivados nunca se persisten — no aparecen en tagsManual', () => {
    const r = ruta('TR-1055')!;
    expect(r.tagsManual).not.toContain('sin_conductor');
  });
});

describe('Tag derivado "oportunidad_vuelta": en taller sin tramo de vuelta creado', () => {
  it('TR-1044 (solo ida completada, sin vuelta) lleva el tag', () => {
    const r = ruta('TR-1044')!;
    const tags = tagsDeRuta(r, Date.now());
    expect(tags.some((t) => t.id === 'oportunidad_vuelta')).toBe(true);
  });

  it('TR-1042 (ida y vuelta completadas) NO lleva el tag', () => {
    const r = ruta('TR-1042')!;
    const tags = tagsDeRuta(r, Date.now());
    expect(tags.some((t) => t.id === 'oportunidad_vuelta')).toBe(false);
  });
});

describe('Tag derivado "inestable": algún tramo con 2 o más reprogramaciones', () => {
  it('TR-1047 (reprogramaciones: 2) lleva el tag', () => {
    const r = ruta('TR-1047')!;
    const tags = tagsDeRuta(r, Date.now());
    expect(tags.some((t) => t.id === 'inestable')).toBe(true);
  });

  it('una ruta sin reprogramaciones no lleva el tag', () => {
    const r = ruta('TR-1042')!;
    const tags = tagsDeRuta(r, Date.now());
    expect(tags.some((t) => t.id === 'inestable')).toBe(false);
  });
});

describe('Tag derivado "doc_pendiente": completado con subestado pendiente_cierre', () => {
  it('TR-1065 (pendiente_cierre) lleva el tag', () => {
    const r = ruta('TR-1065')!;
    const tags = tagsDeRuta(r, Date.now());
    expect(tags.some((t) => t.id === 'doc_pendiente')).toBe(true);
  });

  it('una ruta completada con subestado "ok" no lleva el tag', () => {
    const r = ruta('TR-1042')!;
    expect(r.subestado).toBe('ok');
    const tags = tagsDeRuta(r, Date.now());
    expect(tags.some((t) => t.id === 'doc_pendiente')).toBe(false);
  });
});

describe('Tags manuales (VIP, Flota...) sí persisten y siempre se leen de tagsManual', () => {
  it('TR-1042 tiene el tag manual "vip" persistido', () => {
    const r = ruta('TR-1042')!;
    expect(r.tagsManual).toContain('vip');
    const tags = tagsDeRuta(r, Date.now());
    const vip = tags.find((t) => t.id === 'vip');
    expect(vip).toBeDefined();
    expect(vip!.derivado).toBe(false);
  });
});

describe('Tramo activo: el primero no completado ni cancelado', () => {
  it('en una ruta con ida completada y vuelta sin agenda, el activo es la vuelta', () => {
    const activo = tramoActivo('TR-1043');
    expect(activo?.rol).toBe('vuelta');
    expect(activo?.estado).not.toBe('completado');
  });

  it('en una ruta completamente cerrada, el activo es el último tramo (ya completado)', () => {
    const activo = tramoActivo('TR-1042');
    expect(activo?.estado).toBe('completado');
    const tramos = tramosDeRuta('TR-1042');
    expect(activo?.id).toBe(tramos[tramos.length - 1].id);
  });
});

describe('vistaRuta: fachada de lectura que aplana tramo activo, ventana, seguro y presupuesto', () => {
  it('el seguro de la vista es true solo si TODOS los tramos llevan seguro', () => {
    const vista = vistaRuta(ruta('TR-1040')!); // ida y vuelta con seguro:false
    expect(vista.seguro).toBe(false);
  });

  it('la ventana nunca es una hora exacta: siempre trae inicio y fin en la franja', () => {
    const vista = vistaRuta(ruta('TR-1046')!);
    expect(vista.franja).toMatch(/^\d{2}:\d{2} - \d{2}:\d{2}$/);
  });

  it('el importe de la vista es el total del presupuesto, con la línea de traslado ya incluida', () => {
    const vista = vistaRuta(ruta('TR-1042')!);
    expect(vista.importe).toBeCloseTo(374.5, 2);
  });
});

describe('RUTAS_VISTA cubre las 29 rutas documentadas en CLAUDE.md, sin excepción', () => {
  it('tiene exactamente 29 entradas', () => {
    expect(RUTAS_VISTA).toHaveLength(29);
  });

  it('11 campañas, como documenta CLAUDE.md', () => {
    expect(CAMPANAS).toHaveLength(11);
  });
});

describe('Contactos del vehículo son derivados de la relación m2m — nunca un campo propio duplicado', () => {
  it('un vehículo con varios usuarios expone todos como contactos', () => {
    const contactos = contactosDeVehiculo('v1'); // 3 usuarios en el seed
    expect(contactos.length).toBeGreaterThanOrEqual(2);
  });

  it('cada contacto lleva su relación real, no un valor genérico', () => {
    const contactos = contactosDeVehiculo('v1');
    const relaciones = contactos.map((c) => c.relacion);
    expect(new Set(relaciones).size).toBeGreaterThan(1);
  });
});

describe('Ubicación del vehículo: derivada de si hay una ruta abierta y en qué estado está', () => {
  it('un vehículo sin ruta abierta está "con_cliente"', () => {
    // v17 no tiene ninguna ruta activa en el seed (solo aparece en 1 campaña)
    const u = ubicacionVehiculo('v17');
    expect(u.ubicacionActual).toBe('con_cliente');
  });

  it('el vehículo de una ruta en_ruta está "en_viaje"', () => {
    const u = ubicacionVehiculo('v12'); // TR-1056, en_ruta
    expect(u.ubicacionActual).toBe('en_viaje');
  });
});

describe('Paradas: sin dirección, no se inventa nada (nunca datos de relleno)', () => {
  it('un lead sin cliente confirmado tiene la parada de cliente sin dirección', () => {
    const paradas = paradasDeRuta('TR-1051');
    expect(paradas[0].direccion).toBeNull();
  });
});
