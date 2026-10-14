import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { enviarMensajeKapso, KapsoError } from './client';

describe('enviarMensajeKapso', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    process.env.KAPSO_API_KEY = 'test-key';
    process.env.KAPSO_PHONE_NUMBER_ID = '123456';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.KAPSO_API_KEY;
    delete process.env.KAPSO_PHONE_NUMBER_ID;
  });

  it('envía POST a Kapso con X-API-Key', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        messaging_product: 'whatsapp',
        contacts: [{ wa_id: '34600111222' }],
        messages: [{ id: 'wamid.TEST', message_status: 'accepted' }],
      }),
    });

    const payload = {
      messaging_product: 'whatsapp' as const,
      recipient_type: 'individual' as const,
      to: '34600111222',
      type: 'text' as const,
      text: { preview_url: false, body: 'Hola' },
    };

    const res = await enviarMensajeKapso(payload);
    expect(res.messages[0].id).toBe('wamid.TEST');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.kapso.ai/meta/whatsapp/123456/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-API-Key': 'test-key' }),
      }),
    );
  });

  it('mapea error HTTP de Kapso', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ error: { code: 131026, message: 'Sin WhatsApp' } }),
    });

    await expect(enviarMensajeKapso({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: '34600111222',
      type: 'text',
      text: { preview_url: false, body: 'Hola' },
    })).rejects.toBeInstanceOf(KapsoError);
  });
});
