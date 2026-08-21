/**
 * Subida de evidencias a Storage (bucket `evidencias`).
 * Path: {tallerId}/{rutaId}/{nombre}
 */
import { getSupabaseServer, supabaseServerConfigured } from './server';

export async function subirEvidencia(input: {
  tallerId: string;
  rutaId: string;
  nombreArchivo: string;
  bytes: ArrayBuffer | Blob | Buffer;
  contentType: string;
}): Promise<{ path: string; publicUrl: string | null }> {
  if (!supabaseServerConfigured()) {
    throw new Error('Supabase no configurado');
  }
  const sb = getSupabaseServer();
  if (!sb) throw new Error('Supabase no configurado');

  const safe = input.nombreArchivo.replace(/[^\w.\-]+/g, '_');
  const path = `${input.tallerId}/${input.rutaId}/${Date.now()}-${safe}`;
  const { error } = await sb.storage.from('evidencias').upload(path, input.bytes, {
    contentType: input.contentType,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data: signed } = await sb.storage.from('evidencias').createSignedUrl(path, 60 * 60);
  return { path, publicUrl: signed?.signedUrl ?? null };
}
