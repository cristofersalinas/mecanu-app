import { afterEach, describe, expect, it } from 'vitest';
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
