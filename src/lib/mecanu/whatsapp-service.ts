/**
 * Orquestación de envío WhatsApp (Kapso). Server-only.
 */
import { enviarMensajeKapso, toErrorWa, KapsoError } from '@/lib/kapso/client';
import { kapsoConfigurado } from '@/lib/kapso/config';
import { ApiError } from '@/lib/mecanu/api-helpers';
import { cliente } from '@/lib/mecanu/mecanu-data';
import {
  e164, MAX_CUERPO, payloadRecordatorio, payloadSeguimiento, payloadTexto,
  renderMensaje, valoresOportunidad, type PayloadWa,
} from '@/lib/mecanu/mecanu-whatsapp';
import { renderSeguimiento } from '@/lib/mecanu/seguimiento-oferta';
import type { Campana, CanalWa, MensajeWa } from '@/lib/mecanu/types';
import type { EnviarMensajeWaInput } from '@/lib/mecanu/repo/repo';

export function assertKapsoConfigurado(): void {
  if (!kapsoConfigurado()) {
    throw new ApiError(
      503,
      'whatsapp_no_configurado',
      'WhatsApp no está configurado en el servidor (KAPSO_API_KEY / KAPSO_PHONE_NUMBER_ID).',
    );
  }
}

export function telefonoClienteCampana(campana: Campana): string {
  const c = campana.clienteId ? cliente(campana.clienteId) : null;
  const tel = e164(c?.telefono ?? null);
  if (!tel) {
    throw new ApiError(422, 'sin_telefono', 'El cliente no tiene teléfono válido para WhatsApp.');
  }
  return tel.replace(/\D/g, '');
}

export function construirEnvioWa(
  campana: Campana,
  canal: CanalWa,
  input: EnviarMensajeWaInput,
  telefonoDigits: string,
): { cuerpo: string; payload: PayloadWa; tipoMensaje: string } {
  if (canal.optIn === 'OUT') {
    throw new ApiError(422, 'opt_out', 'El cliente se dio de baja (BAJA). No se puede escribir.');
  }
  if (!input.seleccion.length && input.tipo !== 'text') {
    throw new ApiError(422, 'sin_hallazgos', 'Marca al menos un hallazgo para enviar el mensaje.');
  }

  const valores = valoresOportunidad(campana, input.seleccion, input.overrides);
  let cuerpo: string;
  let payload: PayloadWa;
  let tipoMensaje: string;

  if (input.tipo === 'text') {
    cuerpo = (input.cuerpo ?? '').trim();
    if (!cuerpo) throw new ApiError(422, 'texto_vacio', 'Escribe un mensaje antes de enviar.');
    payload = payloadTexto(telefonoDigits, cuerpo);
    tipoMensaje = 'text';
  } else if (input.tipo === 'seguimiento') {
    cuerpo = (input.cuerpo ?? renderSeguimiento(valores)).trim();
    if (cuerpo.length > MAX_CUERPO) {
      throw new ApiError(422, 'mensaje_largo', `El cuerpo admite ${MAX_CUERPO} caracteres.`);
    }
    payload = payloadSeguimiento(telefonoDigits, valores, cuerpo);
    tipoMensaje = 'seguimiento';
  } else {
    cuerpo = renderMensaje(valores);
    if (cuerpo.length > MAX_CUERPO) {
      throw new ApiError(422, 'mensaje_largo', `El cuerpo admite ${MAX_CUERPO} caracteres.`);
    }
    payload = payloadRecordatorio(telefonoDigits, valores);
    tipoMensaje = 'recordatorio';
  }

  return { cuerpo, payload, tipoMensaje };
}

export async function despacharPorKapso(payload: PayloadWa): Promise<string> {
  assertKapsoConfigurado();
  try {
    const res = await enviarMensajeKapso(payload);
    const wamid = res.messages?.[0]?.id;
    if (!wamid) throw new Error('Kapso no devolvió id de mensaje');
    return wamid;
  } catch (err) {
    const wa = toErrorWa(err);
    if (err instanceof KapsoError && err.code) {
      throw new ApiError(422, `wa_${err.code}`, wa.message);
    }
    throw new ApiError(502, 'kapso_error', wa.message);
  }
}

export function mensajeSalientePendiente(
  localId: string,
  tipo: string,
  cuerpo: string,
): MensajeWa {
  return {
    id: localId,
    dir: 'out',
    tipo,
    texto: cuerpo,
    ts: new Date(),
    estado: 'pending',
  };
}

export function mensajeSalienteEnviado(
  wamid: string,
  tipo: string,
  cuerpo: string,
  ts: Date = new Date(),
): MensajeWa {
  return {
    id: wamid,
    dir: 'out',
    tipo,
    texto: cuerpo,
    ts,
    estado: 'sent',
  };
}

export function mensajeEntrante(
  wamid: string,
  texto: string,
  ts: Date,
): MensajeWa {
  return {
    id: wamid,
    dir: 'in',
    tipo: 'text',
    texto,
    ts,
    estado: null,
  };
}

export function mensajeSistema(texto: string, ts: Date = new Date()): MensajeWa {
  return {
    id: `sys-${Date.now()}`,
    dir: 'sistema',
    tipo: 'sistema',
    texto,
    ts,
    estado: null,
  };
}

export function esBaja(texto: string): boolean {
  return /^baja\b/i.test(texto.trim());
}
