import type { Parada, Vehiculo } from '../data';

/** Marca abreviada para la card: «Mercedes-Benz» → «Mercedes». */
export function marcaCorta(marca: string | null | undefined): string {
  if (!marca) return '—';
  const m = marca.trim();
  if (/^mercedes/i.test(m)) return 'Mercedes';
  if (/^alfa romeo/i.test(m)) return 'Alfa Romeo';
  if (/^land rover/i.test(m)) return 'Land Rover';
  if (/^range rover/i.test(m)) return 'Range Rover';
  const guion = m.indexOf('-');
  if (guion > 0) return m.slice(0, guion).trim();
  return m.split(/\s+/)[0] ?? m;
}

export function tituloVehiculoKanban(v: Vehiculo | null, matriculaLead: string | null): string {
  const mat = v?.matricula ?? matriculaLead ?? '—';
  if (!v) return mat;
  return `${mat} · ${marcaCorta(v.marca)} ${v.modelo}`;
}

function esParadaTaller(p: Parada | null | undefined): boolean {
  return p?.tipo === 'proveedor' && p.subtipo === 'taller';
}

/** Referencia corta origen/destino en la card del kanban. */
export function refParadaKanban(p: Parada | null | undefined): { bold: string; sub: string | null } {
  if (!p) return { bold: '—', sub: null };

  if (esParadaTaller(p)) {
    const distrito = p.sublocalidad ?? p.localidad;
    return { bold: 'Taller', sub: distrito };
  }

  const calle = p.direccion?.split(',')[0]?.trim() ?? null;
  const bold = p.sublocalidad ?? calle ?? p.localidad ?? '—';
  const sub = p.sublocalidad
    ? (p.localidad ?? null)
    : (calle && p.localidad && calle !== p.localidad ? p.localidad : null);

  return { bold, sub };
}

const COLOR_POR_KIND: Record<string, string> = {
  brand: 'var(--mecanu-brand-primary-light)',
  info: 'var(--mecanu-electric-700, #1B4F9C)',
  warning: '#9C420B',
  positive: 'var(--mecanu-positive, #1E7300)',
  alert: '#A81823',
  neutral: 'var(--mecanu-neutral-700)',
};

export function colorPillEstado(kind: string | undefined): string {
  return COLOR_POR_KIND[kind ?? 'neutral'] ?? COLOR_POR_KIND.neutral;
}
