import { NextResponse } from 'next/server';
import { exigirSesionPanelSiAplica } from '@/lib/kapso/sesion-panel';
import { getPerfilSesion } from '@/lib/supabase/auth-server';
import { repo } from '@/lib/mecanu/repo';
import { construirContextoContactoWa } from '@/lib/mecanu/whatsapp-contexto';
import { enriquecerConversaciones, statsClientePorTelefono } from '@/lib/mecanu/whatsapp-enriquecer';
import { guardarFichaDesdeWhatsApp } from '@/lib/mecanu/whatsapp-ficha';
import {
  confirmarSesion,
  crearSesion,
  desconectarSesion,
  enviarMensaje,
  listarConversaciones,
  listarMensajes,
  pedirCodigoEmparejamiento,
  sincronizarSesionesConPuente,
} from '@/lib/mecanu/whatsapp-personal';

const TALLER_DEFAULT = 'taller-rodriguez';

async function tallerId(): Promise<string> {
  const perfil = await getPerfilSesion();
  return perfil?.tallerId || TALLER_DEFAULT;
}

export async function GET(request: Request) {
  const bloqueo = await exigirSesionPanelSiAplica();
  if (bloqueo) return bloqueo;

  try {
    const tid = await tallerId();
    const url = new URL(request.url);
    const conversacionId = url.searchParams.get('conversacionId');
    const quiereContexto = url.searchParams.get('contexto') === '1';

    if (conversacionId && quiereContexto) {
      const [conversaciones, clientes, rutasVista, rutas, campanas, conductores] = await Promise.all([
        listarConversaciones(tid),
        repo.listClientes(),
        repo.listRutasVista(),
        repo.listRutas(),
        repo.listCampanas(),
        repo.listConductores(),
      ]);
      const conv = conversaciones.find((c) => c.id === conversacionId);
      if (!conv) {
        return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
      }
      const stats = statsClientePorTelefono(conv.telefono, clientes, rutas);
      const propias = stats.cliente
        ? rutasVista.filter((r) => r.clienteId === stats.cliente!.id)
        : [];
      const inspeccionesPorRuta: Record<string, Awaited<ReturnType<typeof repo.listInspeccionesDeRuta>>> =
        {};
      await Promise.all(
        propias.slice(0, 12).map(async (r) => {
          inspeccionesPorRuta[r.id] = await repo.listInspeccionesDeRuta(r.id);
        }),
      );
      const origin = url.origin.includes('localhost') ? 'https://mecanu.com' : url.origin;
      const contexto = construirContextoContactoWa({
        telefono: conv.telefono,
        cliente: stats.cliente,
        rutas: rutasVista,
        campanas,
        conductores,
        inspeccionesPorRuta,
        origin,
      });
      return NextResponse.json({ contexto });
    }

    if (conversacionId) {
      const mensajes = await listarMensajes(tid, conversacionId);
      return NextResponse.json({ mensajes });
    }

    const [{ bridgeUp, sesiones }, conversaciones, clientes, rutas] = await Promise.all([
      sincronizarSesionesConPuente(tid),
      listarConversaciones(tid),
      repo.listClientes(),
      repo.listRutas(),
    ]);

    const enriquecidas = enriquecerConversaciones(conversaciones, clientes, rutas);
    const activa = sesiones.some((s) => s.estado === 'activa');
    const pendiente = sesiones.find((s) => s.estado === 'pendiente');
    const reinicioTrasVinculo = Boolean(
      pendiente?.errorPuente &&
        /Reiniciando|Reintentando|caducó/i.test(pendiente.errorPuente) &&
        !pendiente.qrDataUrl &&
        !pendiente.pairingCode,
    );
    const fase = activa
      ? 'lista'
      : reinicioTrasVinculo
        ? 'sincronizando'
        : pendiente
          ? 'qr'
          : bridgeUp
            ? 'idle'
            : 'sin_puente';

    return NextResponse.json({
      bridgeUp,
      fase,
      sesiones,
      conversaciones: enriquecidas,
      conectado: activa,
      pendienteQr: Boolean(pendiente && !activa),
      qrDataUrl: pendiente?.qrDataUrl ?? null,
      pairingCode: pendiente?.pairingCode ?? null,
      desde: sesiones.find((s) => s.estado === 'activa' || s.estado === 'pendiente')?.creadaEn ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'whatsapp_error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type Body =
  | { action: 'crear_sesion'; etiqueta?: string }
  | { action: 'pedir_codigo'; sesionId: string; telefono: string }
  | { action: 'confirmar_sesion'; sesionId: string }
  | { action: 'desconectar'; sesionId: string }
  | { action: 'enviar'; conversacionId: string; texto: string }
  | {
      action: 'guardar_ficha';
      telefono: string;
      nombre?: string;
      email?: string;
      direccion?: string;
      crearSiFalta?: boolean;
    };

export async function POST(request: Request) {
  const bloqueo = await exigirSesionPanelSiAplica();
  if (bloqueo) return bloqueo;

  try {
    const tid = await tallerId();
    const body = (await request.json()) as Body;

    if (body.action === 'crear_sesion') {
      const sesion = await crearSesion(tid, body.etiqueta);
      const { bridgeUp, sesiones } = await sincronizarSesionesConPuente(tid);
      return NextResponse.json({
        sesion: sesiones.find((s) => s.id === sesion.id) ?? sesion,
        bridgeUp,
        fase: 'qr',
      });
    }

    if (body.action === 'pedir_codigo') {
      if (!body.sesionId) {
        return NextResponse.json({ error: 'Falta sesionId' }, { status: 400 });
      }
      const sesion = await pedirCodigoEmparejamiento(tid, body.sesionId, body.telefono ?? '');
      return NextResponse.json({
        sesion,
        pairingCode: sesion.pairingCode ?? null,
      });
    }

    if (body.action === 'confirmar_sesion') {
      if (!body.sesionId) {
        return NextResponse.json({ error: 'Falta sesionId' }, { status: 400 });
      }
      const sesion = await confirmarSesion(tid, body.sesionId);
      const conversaciones = await listarConversaciones(tid);
      return NextResponse.json({ sesion, conversaciones });
    }

    if (body.action === 'desconectar') {
      if (!body.sesionId) {
        return NextResponse.json({ error: 'Falta sesionId' }, { status: 400 });
      }
      const sesion = await desconectarSesion(tid, body.sesionId);
      return NextResponse.json({ sesion });
    }

    if (body.action === 'enviar') {
      if (!body.conversacionId) {
        return NextResponse.json({ error: 'Falta conversacionId' }, { status: 400 });
      }
      const mensaje = await enviarMensaje(tid, body.conversacionId, body.texto ?? '');
      return NextResponse.json({ mensaje });
    }

    if (body.action === 'guardar_ficha') {
      if (!body.telefono?.trim()) {
        return NextResponse.json({ error: 'Falta teléfono' }, { status: 400 });
      }
      const cliente = guardarFichaDesdeWhatsApp(
        body.telefono,
        {
          nombre: body.nombre,
          email: body.email,
          direccion: body.direccion,
        },
        { crearSiFalta: body.crearSiFalta === true || Boolean(body.nombre?.trim()) },
      );
      return NextResponse.json({ cliente });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'whatsapp_error';
    const status =
      /Máximo 5|no encontrada|Escribe|Arranca el puente|Teléfono inválido|ya está|Correo no válido|Nada que guardar|No hay ficha/i.test(
        message,
      )
        ? /Arranca el puente/i.test(message)
          ? 503
          : 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
