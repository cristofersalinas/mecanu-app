/**
 * Persistencia WhatsApp en memoria (repo-mock).
 */
import { CANALES_SEED } from '@/lib/mecanu/mecanu-whatsapp';
import type { Campana, CanalWa, MensajeWa } from '@/lib/mecanu/types';
import type { RegistrarMensajeEntranteInput } from '@/lib/mecanu/repo/repo';
import { esBaja, mensajeEntrante, mensajeSistema } from '@/lib/mecanu/whatsapp-service';

const canalesWa: Record<string, CanalWa> = structuredClone(CANALES_SEED);

function canalVacio(): CanalWa {
  return { optIn: 'IN', mensajes: [] };
}

export function listCanalesWaMemoria(): Record<string, CanalWa> {
  return structuredClone(canalesWa);
}

export function getCanalWaMemoria(campanaId: string): CanalWa {
  return structuredClone(canalesWa[campanaId] ?? canalVacio());
}

export function guardarCanalWaMemoria(campanaId: string, canal: CanalWa): void {
  canalesWa[campanaId] = canal;
}

export function upsertMensajeCanal(campanaId: string, mensaje: MensajeWa): CanalWa {
  const actual = canalesWa[campanaId] ?? canalVacio();
  const idx = actual.mensajes.findIndex((m) => m.id === mensaje.id);
  const mensajes = idx >= 0
    ? actual.mensajes.map((m, i) => (i === idx ? mensaje : m))
    : [...actual.mensajes, mensaje];
  const canal = { ...actual, mensajes };
  canalesWa[campanaId] = canal;
  return structuredClone(canal);
}

export function actualizarEstadoMensajeMemoria(
  wamid: string,
  estado: MensajeWa['estado'],
  errorCode?: number,
): boolean {
  for (const campanaId of Object.keys(canalesWa)) {
    const canal = canalesWa[campanaId];
    const idx = canal.mensajes.findIndex((m) => m.id === wamid);
    if (idx >= 0) {
      canal.mensajes[idx] = {
        ...canal.mensajes[idx],
        estado: estado ?? canal.mensajes[idx].estado,
        error: errorCode ?? canal.mensajes[idx].error,
      };
      return true;
    }
  }
  return false;
}

export function registrarEntranteMemoria(
  campanas: Campana[],
  input: RegistrarMensajeEntranteInput,
): { campanaId: string; canal: CanalWa } | null {
  const tel = input.telefonoE164.replace(/\D/g, '');
  const candidatas = campanas.filter((c) =>
    ['nueva', 'valorada', 'enviada'].includes(c.estado),
  );
  const campana = candidatas.find((c) => {
    const canal = canalesWa[c.id];
    return canal?.mensajes.some((m) => m.dir === 'out');
  }) ?? candidatas[0];
  if (!campana) return null;

  const canal = canalesWa[campana.id] ?? canalVacio();
  if (canal.mensajes.some((m) => m.id === input.wamid)) {
    return { campanaId: campana.id, canal: structuredClone(canal) };
  }

  const mensajes = [...canal.mensajes, mensajeEntrante(input.wamid, input.texto, input.ts)];
  let optIn = canal.optIn;
  if (esBaja(input.texto)) {
    optIn = 'OUT';
    mensajes.push(mensajeSistema('El cliente se dio de baja de los avisos (BAJA).', input.ts));
  }

  const next: CanalWa = { optIn, mensajes };
  canalesWa[campana.id] = next;
  void tel;
  return { campanaId: campana.id, canal: structuredClone(next) };
}

/** Solo tests: resetea el store en memoria. */
export function resetCanalesWaMemoria(): void {
  for (const k of Object.keys(canalesWa)) delete canalesWa[k];
  Object.assign(canalesWa, structuredClone(CANALES_SEED));
}
