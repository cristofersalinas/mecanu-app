import { NextResponse } from 'next/server';
import { repo } from '@/lib/mecanu/repo';
import { leerKapsoConfig } from '@/lib/kapso/config';
import { parsearEventosKapso, verificarFirmaKapso } from '@/lib/kapso/webhook';

/** POST /api/v1/webhooks/kapso — mensajes entrantes y estados de entrega. */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const cfg = leerKapsoConfig();
  const eventName = request.headers.get('X-Webhook-Event') ?? '';

  if (cfg?.webhookSecret) {
    const firma = request.headers.get('X-Webhook-Signature');
    if (!verificarFirmaKapso(rawBody, firma, cfg.webhookSecret)) {
      return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
    }
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const eventos = parsearEventosKapso(eventName, payload);

  try {
    for (const ev of eventos) {
      if (ev.kind === 'mensaje') {
        await repo.registrarMensajeEntranteWa({
          telefonoE164: ev.telefonoE164,
          wamid: ev.wamid,
          texto: ev.texto,
          ts: ev.ts,
        });
      } else {
        await repo.actualizarEstadoMensajeWa(ev.wamid, ev.estado, ev.errorCode);
      }
    }
  } catch (err) {
    console.error('[kapso webhook]', err);
    // Kapso requiere 200; el error queda en logs para reintento manual.
  }

  return NextResponse.json({ ok: true, processed: eventos.length });
}
