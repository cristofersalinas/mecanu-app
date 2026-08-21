/**
 * Tras el primer login al panel: asegura taller + perfil + app_metadata.
 * service_role solo en servidor. Rol nunca desde user_metadata.
 */
import { getSupabaseServer } from './server';
import type { User } from '@supabase/supabase-js';

const ROL_PANEL_DEFAULT = 'operacion';

export async function ensurePerfilPanel(user: User): Promise<{ tallerId: string; rol: string }> {
  const sb = getSupabaseServer();
  if (!sb) throw new Error('Supabase no configurado');

  const { data: existente } = await sb
    .from('perfiles')
    .select('taller_id, rol')
    .eq('id', user.id)
    .maybeSingle();

  if (existente?.taller_id) {
    return { tallerId: existente.taller_id, rol: existente.rol };
  }

  const meta = user.app_metadata ?? {};
  let tallerId = typeof meta.taller_id === 'string' ? meta.taller_id : null;
  const rol =
    typeof meta.rol === 'string' && meta.rol !== 'conductor'
      ? meta.rol
      : ROL_PANEL_DEFAULT;

  const nombre =
    (typeof user.user_metadata?.nombre === 'string' && user.user_metadata.nombre)
    || user.email
    || 'Taller';
  const telefono =
    (typeof user.user_metadata?.telefono === 'string' && user.user_metadata.telefono)
    || user.phone
    || null;

  if (!tallerId) {
    tallerId = `taller-${user.id.replace(/-/g, '').slice(0, 12)}`;
    const { error: te } = await sb.from('talleres').upsert({
      id: tallerId,
      nombre: `Taller de ${nombre}`,
      direccion: '',
    });
    if (te) throw new Error(te.message);
  }

  const { error: pe } = await sb.from('perfiles').upsert({
    id: user.id,
    taller_id: tallerId,
    rol,
    nombre,
    email: user.email ?? `${user.id}@usuarios.mecanu.local`,
    telefono,
    estado: 'activo',
  });
  if (pe) throw new Error(pe.message);

  const { error: ae } = await sb.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...meta,
      taller_id: tallerId,
      rol,
      nombre,
    },
  });
  if (ae) throw new Error(ae.message);

  return { tallerId, rol };
}
