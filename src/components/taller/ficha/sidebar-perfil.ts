import { descripcionSidebarDeber, type DeberTaller } from '@/lib/mecanu/deberes-taller';
import type { CicloVidaCliente } from '@/lib/mecanu/cliente-ciclo-vida';
import {
  Campana, RutaVista, TagRuta, cliente, vehiculo,
} from '../data';
import { tituloVehiculoKanban } from '../tablero/kanban-card-copy';
import {
  lineaPersonaTelefono,
  pillsDeCampana,
  pillsDeRuta,
  pillsDesdeBadges,
  type PillFicha,
} from './ficha-pills';
import type { ResumenFicha } from './resumen';
import type { Seleccion } from '../store';

export interface PerfilSidebar {
  eyebrow: string;
  personaLinea: string;
  vehiculoLinea: string;
  descripcionTarea: string | null;
  pills: PillFicha[];
}

function descripcionDeber(deber: DeberTaller | null | undefined): string | null {
  if (!deber) return null;
  return descripcionSidebarDeber(deber);
}

export function perfilSidebarDeRuta(
  r: RutaVista,
  tags: TagRuta[],
  deber?: DeberTaller | null,
): PerfilSidebar {
  const v = vehiculo(r.vehiculoId);
  const c = cliente(r.clienteId);
  return {
    eyebrow: deber ? `Tarea · ${deber.cta}` : 'Traslado',
    personaLinea: lineaPersonaTelefono(c?.nombre, c?.telefono),
    vehiculoLinea: tituloVehiculoKanban(v, r.matriculaLead ?? null),
    descripcionTarea: descripcionDeber(deber),
    pills: pillsDeRuta(r, tags),
  };
}

export function perfilSidebarDeCampana(
  campana: Campana,
  opts: { optIn: 'IN' | 'OUT'; ventanaAbierta: boolean; deber?: DeberTaller | null },
): PerfilSidebar {
  const v = vehiculo(campana.vehiculoId);
  const c = cliente(campana.clienteId);
  const ciclo = (c as { cicloVida?: CicloVidaCliente } | null)?.cicloVida ?? null;
  return {
    eyebrow: opts.deber ? `Tarea · ${opts.deber.cta}` : 'WhatsApp Business',
    personaLinea: lineaPersonaTelefono(c?.nombre, c?.telefono),
    vehiculoLinea: tituloVehiculoKanban(v, null),
    descripcionTarea: descripcionDeber(opts.deber),
    pills: pillsDeCampana(campana, { ...opts, cicloVida: ciclo }),
  };
}

/** Otros tipos de ficha (cliente, vehículo, conductor…) con el mismo esquema visual. */
export function perfilSidebarDesdeResumen(resumen: ResumenFicha, sel: Seleccion): PerfilSidebar {
  if (sel.kind === 'cliente') {
    const tel = resumen.props.find((p) => p.label === 'Teléfono')?.value ?? '—';
    return {
      eyebrow: resumen.kindLabel,
      personaLinea: lineaPersonaTelefono(resumen.titulo, tel === '—' ? null : tel),
      vehiculoLinea: '—',
      descripcionTarea: null,
      pills: pillsDesdeBadges(resumen.badges),
    };
  }
  if (sel.kind === 'vehiculo') {
    const parts = resumen.subtitulo.split(' · ');
    const matricula = parts.length > 1 ? parts[parts.length - 1] : resumen.titulo;
    const modelo = parts.length > 1 ? parts.slice(0, -1).join(' · ') : resumen.subtitulo;
    return {
      eyebrow: resumen.kindLabel,
      personaLinea: '— · —',
      vehiculoLinea: `${matricula} · ${modelo}`,
      descripcionTarea: null,
      pills: pillsDesdeBadges(resumen.badges),
    };
  }
  return {
    eyebrow: resumen.kindLabel,
    personaLinea: resumen.titulo,
    vehiculoLinea: resumen.subtitulo,
    descripcionTarea: null,
    pills: pillsDesdeBadges(resumen.badges),
  };
}
