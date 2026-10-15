/**
 * Persistencia WhatsApp en Postgres (repo-supabase).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Campana, CanalWa, MensajeWa, EstadoMensajeWa } from '@/lib/mecanu/types';
import type { RegistrarMensajeEntranteInput } from '@/lib/mecanu/repo/repo';
import { esBaja, mensajeEntrante, mensajeSistema } from '@/lib/mecanu/whatsapp-service';

function throwPg(error: { message: string } | null, ctx: string): void {
  if (error) throw new Error(`${ctx}: ${error.message}`);
}

function mapMensaje(row: Record<string, unknown>): MensajeWa {
  return {
    id: String(row.id),
    dir: row.dir as MensajeWa['dir'],
    tipo: String(row.tipo),
    texto: row.texto == null ? null : String(row.texto),
    ts: new Date(String(row.ts)),
    estado: row.estado == null ? null : row.estado as MensajeWa['estado'],
    error: row.error_code == null ? undefined : Number(row.error_code),
  };
}

export async function listCanalesWaSb(client: SupabaseClient): Promise<Record<string, CanalWa>> {
  const { data: canales, error: e1 } = await client.from('whatsapp_canales').select('*');
  throwPg(e1, 'whatsapp_canales');
  const { data: mensajes, error: e2 } = await client
    .from('whatsapp_mensajes')
    .select('*')
    .order('ts', { ascending: true });
  throwPg(e2, 'whatsapp_mensajes');

  const byCampana: Record<string, MensajeWa[]> = {};
  for (const row of mensajes ?? []) {
    const cid = String(row.campana_id);
    (byCampana[cid] ??= []).push(mapMensaje(row as Record<string, unknown>));
  }

  const out: Record<string, CanalWa> = {};
  for (const row of canales ?? []) {
    const id = String(row.campana_id);
    out[id] = {
      optIn: row.opt_in === 'OUT' ? 'OUT' : 'IN',
      mensajes: byCampana[id] ?? [],
    };
  }
  for (const cid of Object.keys(byCampana)) {
    if (!out[cid]) {
      out[cid] = { optIn: 'IN', mensajes: byCampana[cid] };
    }
  }
  return out;
}

export async function getCanalWaSb(client: SupabaseClient, campanaId: string): Promise<CanalWa> {
  const all = await listCanalesWaSb(client);
  return all[campanaId] ?? { optIn: 'IN', mensajes: [] };
}

export async function guardarMensajeSb(
  client: SupabaseClient,
  campanaId: string,
  tallerId: string,
  telefonoE164: string,
  mensaje: MensajeWa,
): Promise<CanalWa> {
  await client.from('whatsapp_canales').upsert({
    campana_id: campanaId,
    taller_id: tallerId,
    telefono_e164: telefonoE164,
    opt_in: 'IN',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'campana_id' });

  const { error } = await client.from('whatsapp_mensajes').upsert({
    id: mensaje.id,
    campana_id: campanaId,
    taller_id: tallerId,
    dir: mensaje.dir,
    tipo: mensaje.tipo,
    texto: mensaje.texto,
    estado: mensaje.estado,
    error_code: mensaje.error ?? null,
    ts: mensaje.ts.toISOString(),
  }, { onConflict: 'id' });
  throwPg(error, 'whatsapp_mensajes upsert');

  return getCanalWaSb(client, campanaId);
}

export async function actualizarEstadoMensajeSb(
  client: SupabaseClient,
  wamid: string,
  estado: EstadoMensajeWa,
  errorCode?: number,
): Promise<void> {
  const { error } = await client.from('whatsapp_mensajes').update({
    estado,
    error_code: errorCode ?? null,
  }).eq('id', wamid);
  throwPg(error, 'whatsapp_mensajes estado');
}

export async function registrarEntranteSb(
  client: SupabaseClient,
  campanas: Campana[],
  input: RegistrarMensajeEntranteInput,
): Promise<{ campanaId: string; canal: CanalWa } | null> {
  const tel = input.telefonoE164.replace(/\D/g, '');

  const { data: canalRow } = await client
    .from('whatsapp_canales')
    .select('*')
    .ilike('telefono_e164', `%${tel.slice(-9)}%`)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let campanaId = canalRow ? String(canalRow.campana_id) : null;
  if (!campanaId) {
    const candidata = campanas.find((c) => ['nueva', 'valorada', 'enviada'].includes(c.estado));
    campanaId = candidata?.id ?? null;
  }
  if (!campanaId) return null;

  const campana = campanas.find((c) => c.id === campanaId);
  if (!campana) return null;

  const { data: tallerRow } = await client.from('campanas').select('taller_id').eq('id', campanaId).maybeSingle();
  const tallerId = tallerRow ? String(tallerRow.taller_id) : 'taller-rodriguez';

  const entrante = mensajeEntrante(input.wamid, input.texto, input.ts);
  await guardarMensajeSb(client, campanaId, tallerId, input.telefonoE164, entrante);

  if (esBaja(input.texto)) {
    await client.from('whatsapp_canales').update({ opt_in: 'OUT' }).eq('campana_id', campanaId);
    const sys = mensajeSistema('El cliente se dio de baja de los avisos (BAJA).', input.ts);
    await client.from('whatsapp_mensajes').insert({
      id: sys.id,
      campana_id: campanaId,
      taller_id: tallerId,
      dir: sys.dir,
      tipo: sys.tipo,
      texto: sys.texto,
      estado: null,
      ts: sys.ts.toISOString(),
    });
    await client.from('whatsapp_canales').update({
      ultima_entrada_cliente: input.ts.toISOString(),
    }).eq('campana_id', campanaId);
  } else {
    await client.from('whatsapp_canales').update({
      ultima_entrada_cliente: input.ts.toISOString(),
    }).eq('campana_id', campanaId);
  }

  const canal = await getCanalWaSb(client, campanaId);
  return { campanaId, canal };
}
