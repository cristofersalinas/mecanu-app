import { afterEach, describe, expect, it } from 'vitest';
import { POST as postSubestado } from '@/app/api/v1/traslados/[id]/subestado/route';
import { GET as getRuta } from '@/app/api/v1/panel/rutas/[id]/route';
import { RUTAS_VISTA, ruta, vistaRuta } from './mecanu-rutas';
import { mockRepo } from './repo/repo-mock';

const RUTA_ID = 'TR-1046';
const TRAMO_ID = 'TS-1046-1';

async function jsonOf(res: Response): Promise<Record<string, unknown>> {
  return res.json() as Promise<Record<string, unknown>>;
}

describe('HTTP: POST subestado persiste agendado → en_ruta', () => {
  afterEach(async () => {
    const r = await mockRepo.getRuta(RUTA_ID);
    const t = await mockRepo.getTramo(TRAMO_ID);
    if (r) {
      r.estado = 'agendado';
      r.subestado = 'aceptado';
    }
    if (t) {
      t.estado = 'agendado';
      t.subestado = null;
    }
    const live = ruta(RUTA_ID);
    const i = RUTAS_VISTA.findIndex((v) => v.id === RUTA_ID);
    if (live && i >= 0) RUTAS_VISTA[i] = vistaRuta(live);
  });

  it('tras iniciar el viaje, un GET de la ruta refleja en_ruta persistido', async () => {
    const antes = await getRuta(new Request(`http://localhost/api/v1/panel/rutas/${RUTA_ID}`), {
      params: Promise.resolve({ id: RUTA_ID }),
    });
    expect(antes.status).toBe(200);
    const bodyAntes = await jsonOf(antes);
    const rutaAntes = bodyAntes.ruta as { estado: string; subestado: string };
    expect(rutaAntes.estado).toBe('agendado');

    const post = await postSubestado(
      new Request(`http://localhost/api/v1/traslados/${TRAMO_ID}/subestado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 'en_camino_origen', triggerSource: 'conductor' }),
      }),
      { params: Promise.resolve({ id: TRAMO_ID }) },
    );
    expect(post.status).toBe(200);
    const tramo = await jsonOf(post);
    expect(tramo.estado).toBe('en_curso');
    expect(tramo.subestado).toBe('en_camino_origen');

    const despues = await getRuta(new Request(`http://localhost/api/v1/panel/rutas/${RUTA_ID}`), {
      params: Promise.resolve({ id: RUTA_ID }),
    });
    expect(despues.status).toBe(200);
    const bodyDespues = await jsonOf(despues);
    const ruta = bodyDespues.ruta as { estado: string; subestado: string };
    expect(ruta.estado).toBe('en_ruta');
    expect(ruta.subestado).toBe('en_camino_origen');
  });
});
