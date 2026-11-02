import { NextResponse } from 'next/server';
import { mensajeProductoOInterno, MENSAJE_ERROR_INTERNO } from '@/lib/security/controles';
import { exigirSesionPanelSiAplica } from '@/lib/kapso/sesion-panel';
import { getPerfilSesion } from '@/lib/supabase/auth-server';
import { crearSesion, sincronizarSesionesConPuente } from '@/lib/mecanu/whatsapp-personal';

const TALLER_DEFAULT = 'taller-rodriguez';

/**
 * Crea una sesión pendiente y arranca el puente Baileys (QR embebido).
 */
export async function POST(request: Request) {
  const bloqueo = await exigirSesionPanelSiAplica();
  if (bloqueo) return bloqueo;

  try {
    let etiqueta: string | undefined;
    try {
      const body = await request.json();
      if (body && typeof body.etiqueta === 'string') etiqueta = body.etiqueta;
    } catch {
      /* sin body */
    }

    const perfil = await getPerfilSesion();
    const tid = perfil?.tallerId || TALLER_DEFAULT;
    const sesion = await crearSesion(tid, etiqueta);
    const { bridgeUp, sesiones } = await sincronizarSesionesConPuente(tid);
    const live = sesiones.find((s) => s.id === sesion.id) ?? sesion;
    return NextResponse.json({
      sesion: live,
      bridgeUp,
      qrDataUrl: live.qrDataUrl ?? null,
    });
  } catch (e) {
    console.error('[panel/whatsapp/setup]', e);
    const seguro = mensajeProductoOInterno(e, /Máximo 5|Arranca el puente/i);
    const status = !seguro ? 500 : /Arranca el puente/i.test(seguro) ? 503 : 400;
    return NextResponse.json({ error: seguro ?? MENSAJE_ERROR_INTERNO }, { status });
  }
}
