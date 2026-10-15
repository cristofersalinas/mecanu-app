import { describe, expect, it, vi, afterEach } from 'vitest';
import { COLA_STORAGE_KEY, escribirCola, leerCola } from '@/lib/mecanu/cola-offline';
import { flushColaPendiente, postConCola } from '@/components/conductor/escritura-api';

function memoria(): { store: Record<string, string>; api: Storage } {
  const store: Record<string, string> = {};
  return {
    store,
    api: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      length: 0,
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      key: () => null,
    },
  };
}

describe('postConCola / flushCola', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ok no encola y avisa', async () => {
    const { api } = memoria();
    vi.stubGlobal('localStorage', api);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );
    const onCola = vi.fn();
    const r = await postConCola({
      url: '/api/v1/traslados/x/subestado',
      prefijoClave: 'subestado-x',
      body: { a: 'en_camino_origen' },
      online: true,
      tipoCola: 'subestado',
      onCola,
    });
    expect(r).toEqual({ tipo: 'ok' });
    expect(leerCola(api)).toHaveLength(0);
  });

  it('422 no encola (rechazo permanente)', async () => {
    const { api } = memoria();
    vi.stubGlobal('localStorage', api);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ error: { code: 'validation_error', message: 'fotos: min' } }), {
          status: 422,
        }),
      ),
    );
    const onCola = vi.fn();
    const r = await postConCola({
      url: '/api/v1/traslados/x/checkin',
      prefijoClave: 'checkin-x',
      body: {},
      online: true,
      tipoCola: 'checkin',
      onCola,
    });
    expect(r.tipo).toBe('error');
    if (r.tipo === 'error') expect(r.mensaje).toMatch(/fotos/i);
    expect(leerCola(api)).toHaveLength(0);
    expect(onCola).not.toHaveBeenCalled();
  });

  it('500 sí encola para reintentar', async () => {
    const { api } = memoria();
    vi.stubGlobal('localStorage', api);
    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: api },
      configurable: true,
    });
    vi.stubGlobal('fetch', vi.fn(async () => new Response('fail', { status: 500 })));
    const onCola = vi.fn();
    const r = await postConCola({
      url: '/api/v1/traslados/x/subestado',
      prefijoClave: 'subestado-x',
      body: { a: 'en_camino_origen' },
      online: true,
      tipoCola: 'subestado',
      onCola,
    });
    expect(r).toEqual({ tipo: 'cola' });
    expect(onCola).toHaveBeenCalled();
    expect(onCola.mock.calls[0]![0]).toBeGreaterThan(0);
  });

  it('un hallazgo sin red queda en la cola y el flush lo reenvía con la misma clave', async () => {
    const { api } = memoria();
    vi.stubGlobal('localStorage', api);
    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: api },
      configurable: true,
    });
    let urlEnviada = '';
    let metodoEnviado = '';
    let claveEnviada = '';
    let bodyEnviado = '';
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      urlEnviada = url;
      metodoEnviado = init?.method ?? '';
      const headers = init?.headers as Record<string, string> | undefined;
      claveEnviada = headers?.['Idempotency-Key'] ?? '';
      bodyEnviado = String(init?.body ?? '');
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    const onCola = vi.fn();
    const body = {
      rutaId: 'TR-1056',
      trasladoId: 'TS-1056-1',
      testigo: 'presion',
      nivel: 3,
    };
    const r = await postConCola({
      url: '/api/v1/campanas/hallazgos',
      prefijoClave: 'hallazgo-presion-TS-1056-1',
      body,
      online: false,
      tipoCola: 'hallazgo',
      onCola,
    });
    expect(r).toEqual({ tipo: 'cola' });
    expect(fetchMock).not.toHaveBeenCalled();
    const cola = leerCola(api);
    expect(cola).toHaveLength(1);
    expect(cola[0]?.tipo).toBe('hallazgo');
    const clave = cola[0]?.idempotencyKey;
    expect(clave).toMatch(/^hallazgo-presion-TS-1056-1:/);
    const payload = cola[0]?.payload as { url?: string; body?: unknown };
    expect(payload.url).toBe('/api/v1/campanas/hallazgos');
    expect(payload.body).toEqual(body);

    const quedan = await flushColaPendiente(api);
    expect(quedan).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(urlEnviada).toBe('/api/v1/campanas/hallazgos');
    expect(metodoEnviado).toBe('POST');
    expect(claveEnviada).toBe(clave);
    expect(JSON.parse(bodyEnviado)).toEqual(body);
    expect(leerCola(api)).toHaveLength(0);
  });

  it('flush descarta 422 y limpia la cola', async () => {
    const { api } = memoria();
    escribirCola(
      [
        {
          id: 'q-1',
          tipo: 'checkin',
          creado: '2026-08-20T10:00:00Z',
          payload: { url: '/api/bad', body: {} },
          idempotencyKey: 'k1',
        },
      ],
      api,
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ error: { message: 'no' } }), { status: 422 }),
      ),
    );
    const quedan = await flushColaPendiente(api);
    expect(quedan).toBe(0);
    expect(api.getItem(COLA_STORAGE_KEY)).toBeNull();
  });
});
