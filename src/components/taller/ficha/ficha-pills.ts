import {
  ESTADO, SUBESTADO, conductor, type RutaVista, type TagRuta,
} from '../data';
import { etiquetaEnRutaKanban } from '@/lib/mecanu/etiqueta-en-ruta';
import { colorPillEstado } from '../tablero/kanban-card-copy';
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

export function pillsDesdeBadges(badges: BadgeFicha[]): PillFicha[] {
  return badges.map((b, i) => ({
    id: `badge-${i}-${b.text}`,
    label: b.text,
    color: colorPillEstado(b.kind),
  }));
}
