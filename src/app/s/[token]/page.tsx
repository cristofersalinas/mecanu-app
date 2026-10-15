import type { Metadata } from 'next';
import { SeguimientoRutaView } from '@/components/seguimiento/SeguimientoRutaView';
import { repo } from '@/lib/mecanu/repo';
import { mockRepo } from '@/lib/mecanu/repo/repo-mock';
import {
  campanasDeRutaPublica,
  cocheYConductorPorToken,
  rutaVistaPorLinkToken,
} from '@/lib/mecanu/repo/repo-supabase';
import {
  campanaOfertaDeRuta,
  construirSeguimientoPublico,
  rutaPorLinkToken,
} from '@/lib/mecanu/seguimiento-ruta';
import { supabaseServerConfigured } from '@/lib/supabase/server';
import type {
  Actividad,
  Conductor,
  Inspeccion,
  Parada,
  Presupuesto,
  RutaVista,
  Tramo,
  Vehiculo,
} from '@/lib/mecanu/types';

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ vista?: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  return {
    title: 'Seguimiento del traslado · Mecanu',
    description: 'Estado de tu traslado, presupuesto y check-in del vehículo.',
    robots: { index: false, follow: false },
    alternates: { canonical: `/s/${encodeURIComponent(token)}` },
  };
}

type Carga = {
  ruta: RutaVista | null;
  vehiculo: Vehiculo | null;
  conductor: Conductor | null;
  tramos: Tramo[];
  paradas: Parada[];
  actividad: Actividad[];
  inspecciones: Inspeccion[];
  presupuesto: Presupuesto | null;
  campanaOferta: { id: string; estado: string; presupuesto: Presupuesto } | null;
};

const CARGA_VACIA: Carga = {
  ruta: null,
  vehiculo: null,
  conductor: null,
  tramos: [],
  paradas: [],
  actividad: [],
  inspecciones: [],
  presupuesto: null,
  campanaOferta: null,
};

function supabaseActivo(): boolean {
  return process.env.MECANU_USE_SUPABASE === '1' && supabaseServerConfigured();
}

async function silencio<T>(p: Promise<T | null>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

async function armar(
  fuente: typeof repo,
  ruta: RutaVista,
  campanaOferta: Carga['campanaOferta'],
  ficha?: { vehiculo: Vehiculo | null; conductor: Conductor | null },
): Promise<Carga> {
  const [vehiculo, conductor, tramos, paradas, actividad, inspecciones, presupuesto] = await Promise.all([
    ficha
      ? Promise.resolve(ficha.vehiculo)
      : (ruta.vehiculoId ? silencio(fuente.getVehiculo(ruta.vehiculoId)) : Promise.resolve(null)),
    ficha
      ? Promise.resolve(ficha.conductor)
      : (ruta.conductorId ? silencio(fuente.getConductor(ruta.conductorId)) : Promise.resolve(null)),
    fuente.listTramosDeRuta(ruta.id),
    fuente.listParadasDeRuta(ruta.id),
    fuente.listActividadDeRuta(ruta.id),
    fuente.listInspeccionesDeRuta(ruta.id),
    ruta.presupuestoId
      ? fuente.getPresupuesto(ruta.presupuestoId)
      : Promise.resolve(ruta.presupuesto),
  ]);
  return {
    ruta,
    vehiculo,
    conductor,
    tramos,
    paradas,
    actividad,
    inspecciones,
    presupuesto: presupuesto ?? ruta.presupuesto,
    campanaOferta,
  };
}

/** Mock solo si Supabase no está o no responde. Un token ausente no se rellena. */
async function cargarMock(token: string): Promise<Carga> {
  try {
    const rutas = await mockRepo.listRutasVista();
    const ruta = rutaPorLinkToken(rutas, token);
    if (!ruta) return CARGA_VACIA;
    const campanas = await mockRepo.listCampanas();
    return armar(mockRepo, ruta, campanaOfertaDeRuta(campanas, ruta.id));
  } catch {
    return CARGA_VACIA;
  }
}

async function cargarPorToken(token: string): Promise<Carga> {
  if (!supabaseActivo()) return cargarMock(token);
  let ruta: RutaVista | null;
  try {
    ruta = await rutaVistaPorLinkToken(token);
  } catch {
    return cargarMock(token);
  }
  if (!ruta) return CARGA_VACIA;
  try {
    const [campanas, ficha] = await Promise.all([
      campanasDeRutaPublica(ruta.id),
      cocheYConductorPorToken(token),
    ]);
    return await armar(repo, ruta, campanaOfertaDeRuta(campanas, ruta.id), ficha);
  } catch {
    return { ...CARGA_VACIA, ruta };
  }
}

export default async function SeguimientoTokenPage({ params, searchParams }: Props) {
  const { token: raw } = await params;
  const sp = await searchParams;
  const token = decodeURIComponent(raw || '').trim();
  const carga = await cargarPorToken(token);
  const vistaInicial = sp.vista === 'presupuesto' ? 'presupuesto' : 'viaje';

  const data = construirSeguimientoPublico({
    token,
    ruta: carga.ruta,
    vehiculo: carga.vehiculo,
    conductor: carga.conductor,
    tallerNombre: 'Talleres Rodríguez',
    tramos: carga.tramos,
    paradas: carga.paradas,
    actividad: carga.actividad,
    inspecciones: carga.inspecciones,
    presupuesto: carga.presupuesto,
    campanaOferta: carga.campanaOferta,
  });

  return <SeguimientoRutaView data={data} vistaInicial={vistaInicial} />;
}
