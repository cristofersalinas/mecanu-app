import {
  ESTADO, SUBESTADO, PRESUPUESTO_META, conductor, type Campana, type RutaVista, type TagRuta,
  cliente, fmtTel,
} from '../data';
import { CICLO_VIDA_LABEL, type CicloVidaCliente } from '@/lib/mecanu/cliente-ciclo-vida';
import { etiquetaEnRutaKanban } from '@/lib/mecanu/etiqueta-en-ruta';
import { colorPillEstado } from '../tablero/kanban-card-copy';
import { nombreClienteTareas } from '../tablero/tarea-card-copy';
import type { BadgeFicha } from './resumen';

export interface PillFicha {
  id: string;
  label: string;
  color: string;
  title?: string;
}

/** Todas las píldoras visibles de un traslado: estado, subestado, tags y seguro. */
export function pillsDeRuta(r: RutaVista, tags: TagRuta[]): PillFicha[] {
  const est = ESTADO[r.estado];
  const sub = SUBESTADO[`${r.estado}.${r.subestado}`];
  const viva = etiquetaEnRutaKanban(r.estado, r.subestado, conductor(r.conductorId)?.nombre);
  const textoSub = viva ?? sub?.label;
  const pills: PillFicha[] = [];

  if (est?.label) {
    pills.push({
      id: 'estado',
      label: est.label,
      color: colorPillEstado(est.kind),
      title: est.desc,
    });
  }

  if (textoSub && textoSub !== est?.label) {
    pills.push({
      id: 'subestado',
      label: textoSub,
      color: colorPillEstado(est?.kind),
      title: sub?.desc,
    });
  }

  for (const t of tags) {
    pills.push({
      id: `tag-${t.id}`,
      label: t.label,
      color: t.color,
      title: t.derivado ? 'Etiqueta derivada (calculada por el sistema)' : 'Etiqueta manual',
    });
  }

  pills.push({
    id: 'seguro',
    label: r.seguro ? 'Asegurado' : 'Sin seguro',
    color: r.seguro ? colorPillEstado('positive') : colorPillEstado('neutral'),
    title: r.seguro ? 'Traslado con cobertura de seguro' : 'Sin cobertura de seguro',
  });

  return pills;
}

const CICLO_PILL: Record<CicloVidaCliente, string> = {
  prospecto: 'var(--mecanu-neutral-600)',
  registrado: 'var(--mecanu-electric-600)',
  nuevo: 'var(--mecanu-info)',
  recompra: 'var(--mecanu-positive)',
  fidelizado: 'var(--mecanu-positive)',
  en_riesgo: 'var(--mecanu-warning)',
  perdido: 'var(--mecanu-alert)',
};

/** Campaña / WhatsApp: presupuesto, ciclo de vida, opt-in y ventana 24 h. */
export function pillsDeCampana(
  campana: Campana,
  opts: {
    optIn: 'IN' | 'OUT';
    ventanaAbierta: boolean;
    /** Etiqueta viva (p. ej. «Ventana abierta · quedan 23 h»). */
    ventanaEtiqueta?: string;
    ventanaDetalle?: string;
    cicloVida?: CicloVidaCliente | null;
  },
): PillFicha[] {
  const meta = PRESUPUESTO_META[campana.estado];
  const pills: PillFicha[] = [];

  if (meta?.label) {
    pills.push({
      id: 'presupuesto',
      label: meta.label,
      color: colorPillEstado(meta.kind),
      title: 'Estado del presupuesto',
    });
  }

  const cl = cliente(campana.clienteId);
  const ciclo = opts.cicloVida ?? (cl as { cicloVida?: CicloVidaCliente } | null)?.cicloVida ?? null;
  if (ciclo && CICLO_VIDA_LABEL[ciclo]) {
    pills.push({
      id: 'ciclo-vida',
      label: CICLO_VIDA_LABEL[ciclo],
      color: CICLO_PILL[ciclo],
      title: 'Ciclo de vida del cliente',
    });
  }

  pills.push({
    id: 'opt-in',
    label: opts.optIn === 'IN' ? 'Opt-in activo' : 'Dado de baja',
    color: opts.optIn === 'IN' ? colorPillEstado('positive') : colorPillEstado('alert'),
    title: 'Consentimiento WhatsApp',
  });

  pills.push({
    id: 'ventana-wa',
    label: opts.ventanaEtiqueta
      ?? (opts.ventanaAbierta ? 'Ventana 24 h abierta' : 'Ventana cerrada'),
    color: opts.ventanaAbierta ? colorPillEstado('info') : colorPillEstado('neutral'),
    title: opts.ventanaDetalle ?? 'Ventana de mensajería WhatsApp (Cloud API)',
  });

  return pills;
}

export function lineaPersonaTelefono(nombre: string | null | undefined, telefono: string | null | undefined): string {
  const n = nombre?.trim() ? nombreClienteTareas(nombre) : '—';
  const t = telefono?.trim() ? fmtTel(telefono) : '—';
  return `${n} · ${t}`;
}

export function pillsDesdeBadges(badges: BadgeFicha[]): PillFicha[] {
  return badges.map((b, i) => ({
    id: `badge-${i}-${b.text}`,
    label: b.text,
    color: colorPillEstado(b.kind),
  }));
}
