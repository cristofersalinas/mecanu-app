import { afterEach, describe, expect, it } from 'vitest';
import { POST as postCheckin } from '@/app/api/v1/traslados/[id]/checkin/route';
import { POST as postEntrega } from '@/app/api/v1/traslados/[id]/entrega/route';
import { GET as getRuta } from '@/app/api/v1/panel/rutas/[id]/route';
import { RUTAS_VISTA, ruta, vistaRuta } from './mecanu-rutas';
import { mockRepo } from './repo/repo-mock';

const RUTA_ID = 'TR-1056';
const TRAMO_ID = 'TS-1056-1';

async function jsonOf(res: Response): Promise<Record<string, unknown>> {
  return res.json() as Promise<Record<string, unknown>>;
}

describe('HTTP: POST entrega mueve la ruta a en_taller', () => {
  afterEach(async () => {
    const r = await mockRepo.getRuta(RUTA_ID);
    const t = await mockRepo.getTramo(TRAMO_ID);
    if (r) {
      r.estado = 'en_ruta';
      r.subestado = 'en_camino_origen';
    }
    if (t) {
      t.estado = 'en_curso';
      t.subestado = 'en_camino_origen';
    }
    const live = ruta(RUTA_ID);
    const i = RUTAS_VISTA.findIndex((v) => v.id === RUTA_ID);
    if (live && i >= 0) RUTAS_VISTA[i] = vistaRuta(live);
  });

  it('tras entregar en taller, el GET de la ruta refleja en_taller', async () => {
    const post = await postEntrega(
      new Request(`http://localhost/api/v1/traslados/${TRAMO_ID}/entrega`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fotos: [
            { slot: 'estado', url: 'data:image/gif;base64,xxx' },
            { slot: 'entorno', url: 'data:image/gif;base64,yyy' },
          ],
          firmaCliente: null,
        }),
      }),
      { params: Promise.resolve({ id: TRAMO_ID }) },
    );
    expect(post.status).toBe(200);

    const despues = await getRuta(new Request(`http://localhost/api/v1/panel/rutas/${RUTA_ID}`), {
      params: Promise.resolve({ id: RUTA_ID }),
    });
    expect(despues.status).toBe(200);
    const body = await jsonOf(despues);
    const rutaRes = body.ruta as { estado: string; subestado: string };
    expect(rutaRes.estado).toBe('en_taller');
    expect(rutaRes.subestado).toBe('esperando_agenda_vuelta');
  });
});

describe('HTTP: POST check-in sin inspección previa', () => {
  it('TS-1056-1 responde 200 y deja la inspección, sin mover la ruta', async () => {
    const rutaAntes = await mockRepo.getRuta(RUTA_ID);
    const tramoAntes = await mockRepo.getTramo(TRAMO_ID);

    const post = await postCheckin(
      new Request(`http://localhost/api/v1/traslados/${TRAMO_ID}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          km: 19840,
          combustible: '3/4',
          combustiblePct: 75,
          limpieza: 'Limpio',
          fotos: [
            { slot: 'frontal', url: 'https://example.test/frontal.jpg' },
            { slot: 'trasera', url: 'https://example.test/trasera.jpg' },
            { slot: 'izq', url: 'https://example.test/izq.jpg' },
            { slot: 'der', url: 'https://example.test/der.jpg' },
          ],
          videoUrl: null,
          testigos: { temp: false, aceite: false },
          itemsInspeccion: { plumillas: 1, focos: 2 },
          ruedas: { di: 1, dd: 1, ti: 2, td: 1 },
          nota: 'Rayón en el paragolpes',
          notaVozUrl: null,
          firmaConductor: 'data:image/png;base64,firma',
        }),
      }),
      { params: Promise.resolve({ id: TRAMO_ID }) },
    );

    expect(post.status).toBe(200);
    const body = await jsonOf(post);
    const inspeccion = body.inspeccion as {
      id: string;
      tipo: string;
      rutaId: string;
      trasladoId: string;
      km: number;
      combustible: string;
      combustiblePct: number;
      limpieza: string;
      firmas: { conductor: string | null; cliente: string | null };
    };
    expect(inspeccion.tipo).toBe('check-in');
    expect(inspeccion.rutaId).toBe(RUTA_ID);
    expect(inspeccion.trasladoId).toBe(TRAMO_ID);
    expect(inspeccion.km).toBe(19840);
    expect(inspeccion.combustible).toBe('3/4');
    expect(inspeccion.combustiblePct).toBe(75);
    expect(inspeccion.limpieza).toBe('Limpio');
    expect(inspeccion.firmas.conductor).toBe('data:image/png;base64,firma');
    expect(inspeccion.firmas.cliente).toBeNull();

    const rutaDespues = await mockRepo.getRuta(RUTA_ID);
    const tramoDespues = await mockRepo.getTramo(TRAMO_ID);
    expect(rutaDespues?.estado).toBe(rutaAntes?.estado);
    expect(rutaDespues?.subestado).toBe(rutaAntes?.subestado);
    expect(tramoDespues?.estado).toBe(tramoAntes?.estado);
    expect(tramoDespues?.subestado).toBe(tramoAntes?.subestado);

    const lista = await mockRepo.listInspeccionesDeRuta(RUTA_ID);
    expect(lista.some((i) => i.id === inspeccion.id && i.km === 19840)).toBe(true);
  });

  it('una ruta sin vehículo deja matrícula y modelo en Sin dato', async () => {
    const res = await mockRepo.checkin({
      trasladoId: 'TS-1052-1',
      km: 0,
      combustible: 'Sin dato',
      combustiblePct: 0,
      limpieza: 'Sin dato',
      fotos: [
        { slot: 'frontal', url: 'https://example.test/frontal.jpg' },
        { slot: 'trasera', url: 'https://example.test/trasera.jpg' },
        { slot: 'izq', url: 'https://example.test/izq.jpg' },
        { slot: 'der', url: 'https://example.test/der.jpg' },
      ],
      videoUrl: null,
      testigos: {},
      itemsInspeccion: {},
      ruedas: {},
      nota: null,
      notaVozUrl: null,
      firmaConductor: null,
    });
    expect(res.inspeccion.vehiculo.matricula).toBe('Sin dato');
    expect(res.inspeccion.vehiculo.modelo).toBe('Sin dato');
  });
});
