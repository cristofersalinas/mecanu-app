import { NextResponse } from 'next/server';
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
    const message = e instanceof Error ? e.message : 'whatsapp_setup_error';
    const status = /Máximo 5/i.test(message) ? 400 : /Arranca el puente/i.test(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
