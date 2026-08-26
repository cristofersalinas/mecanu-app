import type { Metadata } from 'next';
import { SeguimientoRutaView } from '@/components/seguimiento/SeguimientoRutaView';
import { repo } from '@/lib/mecanu/repo';
import { mockRepo } from '@/lib/mecanu/repo/repo-mock';
import {
  campanaOfertaDeRuta,
  construirSeguimientoPublico,
  rutaPorLinkToken,
} from '@/lib/mecanu/seguimiento-ruta';
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

async function cargarPorToken(token: string): Promise<Carga> {
  const vacio: Carga = {
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

  const tryFuente = async (fuente: typeof repo): Promise<Carga | null> => {
    const [rutas, conductores, campanas] = await Promise.all([
      fuente.listRutasVista(),
      fuente.listConductores(),
      fuente.listCampanas(),
    ]);
    const ruta = rutaPorLinkToken(rutas, token);
    if (!ruta) return null;

    const [vehiculo, tramos, paradas, actividad, inspecciones, presupuesto] = await Promise.all([
      ruta.vehiculoId ? fuente.getVehiculo(ruta.vehiculoId) : Promise.resolve(null),
      fuente.listTramosDeRuta(ruta.id),
      fuente.listParadasDeRuta(ruta.id),
      fuente.listActividadDeRuta(ruta.id),
      fuente.listInspeccionesDeRuta(ruta.id),
      ruta.presupuestoId
        ? fuente.getPresupuesto(ruta.presupuestoId)
        : Promise.resolve(ruta.presupuesto),
    ]);

    const conductor = ruta.conductorId
      ? (conductores.find((d) => d.id === ruta.conductorId) ?? null)
      : null;

    return {
      ruta,
      vehiculo,
      conductor,
      tramos,
      paradas,
      actividad,
      inspecciones,
      presupuesto: presupuesto ?? ruta.presupuesto,
      campanaOferta: campanaOfertaDeRuta(campanas, ruta.id),
    };
  };

  return (await tryFuente(repo)) ?? (await tryFuente(mockRepo)) ?? vacio;
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
