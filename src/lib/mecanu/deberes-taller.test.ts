import { describe, expect, it } from 'vitest';
import {
  agruparDeberes, deberesDelTaller, deberSiguePendiente, type CampanaParaDeber, type RutaParaDeber,
} from './deberes-taller';

const ahora = new Date('2026-08-21T10:00:00');

function ruta(over: Partial<RutaParaDeber>): RutaParaDeber {
  return {
    id: 'TR-1', estado: 'prospectos', subestado: 'sin_fecha', fecha: null, franja: null,
    conductorId: null, vehiculoId: 'v1', matriculaLead: null, ...over,
  };
}

function campana(over: Partial<CampanaParaDeber>): CampanaParaDeber {
  return { id: 'CP-1', estado: 'nueva', vehiculoId: 'v1', rutaGeneradaId: null, mensajes: [], ...over };
}

const labels = {
  labelRuta: (r: RutaParaDeber) => r.matriculaLead ?? r.id,
  labelCampana: (c: CampanaParaDeber) => c.id,
};

describe('Deberes del taller', () => {
  it('prospectos sin fecha pide agendar, no asignar conductor', () => {
    const list = deberesDelTaller({ rutas: [ruta({})], campanas: [], ahora, ...labels });
    expect(list).toHaveLength(1);
    expect(list[0].tipo).toBe('agendar');
    expect(list[0].zona).toBe('ventana');
    expect(list[0].titulo).toBe('TR-1');
    expect(list[0].detalle).toBe('Sin ventana');
  });

  it('agendado sin conductor pide elegir conductor, urgente si es en 24 h', () => {
    const cerca = deberesDelTaller({
      rutas: [ruta({
        estado: 'agendado', subestado: 'sin_conductor',
        fecha: new Date('2026-08-21T16:00:00'), franja: '16:00 - 17:00',
      })],
      campanas: [], ahora, ...labels,
    });
    expect(cerca[0].tipo).toBe('asignar_conductor');
    expect(cerca[0].urgencia).toBe('ahora');
    expect(cerca[0].zona).toBe('conductor');

    const lejos = deberesDelTaller({
      rutas: [ruta({
        estado: 'agendado', subestado: 'sin_conductor',
        fecha: new Date('2026-08-25T10:00:00'), franja: '10:00 - 11:00',
      })],
      campanas: [], ahora, ...labels,
    });
    expect(lejos[0].urgencia).toBe('hoy');
  });

  it('en taller sin vuelta pide agendarla', () => {
    const list = deberesDelTaller({
      rutas: [ruta({ estado: 'en_taller', subestado: 'oportunidad_vuelta' })],
      campanas: [], ahora, ...labels,
    });
    expect(list[0].tipo).toBe('agendar_vuelta');
    expect(list[0].zona).toBe('vuelta');
  });

  it('campañas: valorar, enviar, recordar, crear ruta', () => {
    const list = deberesDelTaller({
      rutas: [],
      campanas: [
        campana({ id: 'a', estado: 'nueva' }),
        campana({ id: 'b', estado: 'valorada' }),
        campana({ id: 'c', estado: 'enviada' }),
        campana({ id: 'd', estado: 'aceptada', rutaGeneradaId: null }),
        campana({ id: 'e', estado: 'aceptada', rutaGeneradaId: 'TR-9' }),
      ],
      ahora, ...labels,
    });
    expect(list.map((d) => d.tipo)).toEqual([
      'crear_ruta', 'enviar_oferta', 'valorar_oferta', 'recordar_oferta',
    ]);
    expect(list[0].urgencia).toBe('ahora');
  });

  it('oferta enviada: seguimiento si calla, responder si escribió, nada si ya contestamos', () => {
    const silencio = deberesDelTaller({
      rutas: [],
      campanas: [campana({ estado: 'enviada', mensajes: [{ dir: 'out', texto: 'recordatorio' }] })],
      ahora, ...labels,
    });
    expect(silencio[0].tipo).toBe('recordar_oferta');
    expect(silencio[0].detalle).toBe('Sin respuesta');

    const espera = deberesDelTaller({
      rutas: [],
      campanas: [campana({
        estado: 'enviada',
        mensajes: [
          { dir: 'out', texto: 'recordatorio' },
          { dir: 'in', texto: '¿Cuánto tardaría?' },
        ],
      })],
      ahora, ...labels,
    });
    expect(espera[0].tipo).toBe('responder_oferta');
    expect(espera[0].urgencia).toBe('ahora');

    const alDia = deberesDelTaller({
      rutas: [],
      campanas: [campana({
        estado: 'enviada',
        mensajes: [
          { dir: 'out' },
          { dir: 'in', texto: '¿incluye traslado?' },
          { dir: 'out', texto: 'sí' },
        ],
      })],
      ahora, ...labels,
    });
    expect(alDia).toEqual([]);
  });

  it('no lista cancelados ni completados', () => {
    const list = deberesDelTaller({
      rutas: [
        ruta({ id: 'x', estado: 'cancelado', subestado: 'por_cliente' }),
        ruta({ id: 'y', estado: 'completado', subestado: 'cerrado' }),
      ],
      campanas: [], ahora, ...labels,
    });
    expect(list).toEqual([]);
  });

  it('deberSiguePendiente se apaga al asignar', () => {
    const d = deberesDelTaller({
      rutas: [ruta({ estado: 'agendado', subestado: 'sin_conductor', fecha: ahora, franja: '10:00 - 11:00' })],
      campanas: [], ahora, ...labels,
    })[0];
    expect(deberSiguePendiente(d, {
      rutas: [ruta({ estado: 'agendado', subestado: 'asignado', fecha: ahora, franja: '10:00 - 11:00', conductorId: 'd1' })],
      campanas: [], ahora, ...labels,
    })).toBe(false);
  });

  it('agrupa por urgencia sin grupos vacíos', () => {
    const list = deberesDelTaller({
      rutas: [ruta({})],
      campanas: [campana({ estado: 'enviada' })],
      ahora, ...labels,
    });
    const g = agruparDeberes(list);
    expect(g.map((x) => x.urgencia)).toEqual(['hoy', 'cuando_puedas']);
  });
});
