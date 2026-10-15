import { describe, expect, it } from 'vitest';
import {
  clearIdempotencyMemoryForTests,
  getIdempotentResponse,
  getIdempotentResponseAsync,
  nuevaClaveIdempotencia,
  saveIdempotentResponse,
  saveIdempotentResponseAsync,
} from './idempotency';

describe('idempotency memoria', () => {
  it('guarda y recupera', async () => {
    clearIdempotencyMemoryForTests();
    saveIdempotentResponse('k1', 200, { ok: true });
    expect(getIdempotentResponse('k1')?.body).toEqual({ ok: true });
    await saveIdempotentResponseAsync('k2', 422, { error: 'x' });
    const cached = await getIdempotentResponseAsync('k2');
    expect(cached?.status).toBe(422);
  });

  it('nuevaClaveIdempotencia no se repite (el seed puede rehacer el mismo traslado)', () => {
    const a = nuevaClaveIdempotencia('subestado-TS-1-en_camino_origen');
    const b = nuevaClaveIdempotencia('subestado-TS-1-en_camino_origen');
    expect(a).not.toBe(b);
    expect(a.startsWith('subestado-TS-1-en_camino_origen:')).toBe(true);
  });
});
