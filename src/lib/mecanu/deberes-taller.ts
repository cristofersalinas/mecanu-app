/**
 * Deberes del taller: lo que el operador puede (y debe) cerrar hoy.
 * Se derivan del estado de rutas y campañas; no se persisten. La UI canónica
 * es el kanban Tablero → Tareas (`pipeline-tareas.ts`): Pendiente hasta que
 * cierras el hueco, entonces Hecho. Cancelado = no la hago. La urgencia
 * vive en la card, no en la columna.
 */
import { modoContactoOferta } from './seguimiento-oferta';

export type TipoDeberTaller =
  | 'agendar'
  | 'asignar_conductor'
  | 'agendar_vuelta'
  | 'valorar_oferta'
  | 'enviar_oferta'
  | 'crear_ruta'
  | 'recordar_oferta'
  | 'responder_oferta';

export type ZonaNudge = 'ventana' | 'conductor' | 'vuelta' | 'campana_acciones';

export type UrgenciaDeber = 'ahora' | 'hoy' | 'cuando_puedas';

export interface DeberTaller {
  id: string;
  tipo: TipoDeberTaller;
  urgencia: UrgenciaDeber;
  entidadKind: 'ruta' | 'campana';
  entidadId: string;
  zona: ZonaNudge;
  titulo: string;
  detalle: string;
  cta: string;
  hintNudge: string;
}

export interface RutaParaDeber {
  id: string;
  estado: string;
  subestado: string;
  fecha: Date | null;
  franja: string | null;
  conductorId: string | null;
  vehiculoId: string | null;
  matriculaLead: string | null;
}

export interface CampanaParaDeber {
  id: string;
  estado: string;
  vehiculoId: string | null;
  rutaGeneradaId: string | null;
  mensajes: { dir: 'in' | 'out' | 'sistema'; texto?: string | null }[];
}

export const URGENCIA_LABEL: Record<UrgenciaDeber, string> = {
  ahora: 'Urgente',
  hoy: 'Prioritario',
  cuando_puedas: 'Importante',
};

export const URGENCIA_ETIQUETA: Record<UrgenciaDeber, { label: string; kind: 'alert' | 'warning' | 'info' }> = {
  ahora: { label: 'Urgente', kind: 'alert' },
  hoy: { label: 'Prioritario', kind: 'warning' },
  cuando_puedas: { label: 'Importante', kind: 'info' },
};

export const URGENCIA_ORDEN: UrgenciaDeber[] = ['ahora', 'hoy', 'cuando_puedas'];

const DIA_MS = 86400000;

function horasHasta(fecha: Date | null, ahora: Date): number | null {
  if (!fecha) return null;
  return (fecha.getTime() - ahora.getTime()) / 3600000;
}

export function deberesDelTaller(opts: {
  rutas: RutaParaDeber[];
  campanas: CampanaParaDeber[];
  ahora: Date;
  labelRuta: (r: RutaParaDeber) => string;
  labelCampana: (c: CampanaParaDeber) => string;
}): DeberTaller[] {
  const out: DeberTaller[] = [];

  for (const r of opts.rutas) {
    if (r.estado === 'cancelado' || r.estado === 'completado') continue;
    const label = opts.labelRuta(r);

    if (r.estado === 'prospectos') {
      out.push({
        id: `agendar-${r.id}`,
        tipo: 'agendar',
        urgencia: r.subestado === 'caducado' ? 'ahora' : 'hoy',
        entidadKind: 'ruta',
        entidadId: r.id,
        zona: 'ventana',
        titulo: label,
        detalle: r.subestado === 'caducado'
          ? 'Oferta caducada'
          : 'Sin ventana',
        cta: 'Agendar',
        hintNudge: 'Elige día y una franja de 1 hora.',
      });
      continue;
    }

    if (r.estado === 'agendado' && !r.conductorId) {
      const h = horasHasta(r.fecha, opts.ahora);
      out.push({
        id: `conductor-${r.id}`,
        tipo: 'asignar_conductor',
        urgencia: h != null && h <= 24 ? 'ahora' : 'hoy',
        entidadKind: 'ruta',
        entidadId: r.id,
        zona: 'conductor',
        titulo: label,
        detalle: r.franja ?? '',
        cta: 'Asignar',
        hintNudge: 'Elige flota del taller o Red Mecanu.',
      });
    }

    if (
      r.estado === 'en_taller' &&
      (r.subestado === 'oportunidad_vuelta' || r.subestado === 'esperando_agenda_vuelta')
    ) {
      out.push({
        id: `vuelta-${r.id}`,
        tipo: 'agendar_vuelta',
        urgencia: 'hoy',
        entidadKind: 'ruta',
        entidadId: r.id,
        zona: 'vuelta',
        titulo: label,
        detalle: r.subestado === 'oportunidad_vuelta' ? 'Falta la devolución' : 'Sin ventana de vuelta',
        cta: 'Agendar',
        hintNudge: 'Pon fecha de devolución (ventana de 1 hora).',
      });
    }
  }

  for (const c of opts.campanas) {
    const label = opts.labelCampana(c);
    if (c.estado === 'nueva') {
      out.push({
        id: `valorar-${c.id}`,
        tipo: 'valorar_oferta',
        urgencia: 'hoy',
        entidadKind: 'campana',
        entidadId: c.id,
        zona: 'campana_acciones',
        titulo: label,
        detalle: '',
        cta: 'Valorar',
        hintNudge: 'Márcala valorada cuando tenga precio.',
      });
    } else if (c.estado === 'valorada') {
      out.push({
        id: `enviar-${c.id}`,
        tipo: 'enviar_oferta',
        urgencia: 'hoy',
        entidadKind: 'campana',
        entidadId: c.id,
        zona: 'campana_acciones',
        titulo: label,
        detalle: '',
        cta: 'Enviar',
        hintNudge: 'Envía el recordatorio al cliente.',
      });
    } else if (c.estado === 'enviada') {
      const modo = modoContactoOferta({ estadoCampana: c.estado, mensajes: c.mensajes ?? [] });
      if (modo === 'al_dia') continue;
      if (modo === 'responder') {
        out.push({
          id: `responder-${c.id}`,
          tipo: 'responder_oferta',
          urgencia: 'ahora',
          entidadKind: 'campana',
          entidadId: c.id,
          zona: 'campana_acciones',
          titulo: label,
          detalle: '',
          cta: 'Responder',
          hintNudge: 'Contéstale en el chat.',
        });
      } else {
        out.push({
          id: `seguir-${c.id}`,
          tipo: 'recordar_oferta',
          urgencia: 'cuando_puedas',
          entidadKind: 'campana',
          entidadId: c.id,
          zona: 'campana_acciones',
          titulo: label,
          detalle: 'Sin respuesta',
          cta: 'Seguir',
          hintNudge: 'Envía el seguimiento.',
        });
      }
    } else if (c.estado === 'aceptada' && !c.rutaGeneradaId) {
      out.push({
        id: `ruta-${c.id}`,
        tipo: 'crear_ruta',
        urgencia: 'ahora',
        entidadKind: 'campana',
        entidadId: c.id,
        zona: 'campana_acciones',
        titulo: label,
        detalle: 'Aceptada',
        cta: 'Crear',
        hintNudge: 'Crea la ruta (taller, ITV o chapista).',
      });
    }
  }

  const peso: Record<UrgenciaDeber, number> = { ahora: 0, hoy: 1, cuando_puedas: 2 };
  const tipoPeso: Record<TipoDeberTaller, number> = {
    crear_ruta: 0,
    asignar_conductor: 1,
    agendar: 2,
    agendar_vuelta: 3,
    enviar_oferta: 4,
    valorar_oferta: 5,
    responder_oferta: 0,
    recordar_oferta: 6,
  };
  return out.sort((a, b) => peso[a.urgencia] - peso[b.urgencia] || tipoPeso[a.tipo] - tipoPeso[b.tipo]);
}

export function deberSiguePendiente(
  d: DeberTaller,
  opts: { rutas: RutaParaDeber[]; campanas: CampanaParaDeber[]; ahora: Date; labelRuta: (r: RutaParaDeber) => string; labelCampana: (c: CampanaParaDeber) => string },
): boolean {
  return deberesDelTaller(opts).some((x) => x.id === d.id);
}

export function agruparDeberes(list: DeberTaller[]): { urgencia: UrgenciaDeber; items: DeberTaller[] }[] {
  return URGENCIA_ORDEN
    .map((urgencia) => ({ urgencia, items: list.filter((d) => d.urgencia === urgencia) }))
    .filter((g) => g.items.length > 0);
}

/** Horas de margen para pintar «ahora» en un agendado sin conductor. Exportado por si la UI lo muestra. */
export const HORAS_ASIGNAR_URGENTE = 24;
export { DIA_MS as DEBER_DIA_MS };
