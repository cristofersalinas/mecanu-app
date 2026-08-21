import { describe, expect, it } from 'vitest';
import {
  clearIdempotencyMemoryForTests,
  getIdempotentResponse,
  getIdempotentResponseAsync,
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
});
