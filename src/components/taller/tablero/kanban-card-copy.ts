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

/**
 * Primera parte de la dirección con tipología abreviada (Av., C/, Pg.…).
 * Exportada para tests; la usa `refParadaKanban`.
 */
export function calleCorta(direccion: string | null | undefined): string | null {
  const first = direccion?.split(',')[0]?.trim() ?? null;
  if (!first) return null;

  const abreviaturas: [RegExp, string][] = [
    [/^Avinguda\s+/i, 'Av. '],
    [/^Avenida\s+/i, 'Av. '],
    [/^Avda\.?\s+/i, 'Av. '],
    [/^Calle\s+/i, 'C/ '],
    [/^Carrer\s+/i, 'C/ '],
    [/^Pasaje\s+/i, 'Pje. '],
    [/^Passatge\s+/i, 'Pje. '],
    [/^Passeig\s+/i, 'Pg. '],
    [/^Paseo\s+/i, 'Pg. '],
    [/^Plaza\s+/i, 'Pl. '],
    [/^Plaça\s+/i, 'Pl. '],
    [/^Camino\s+/i, 'Cam. '],
    [/^Camí\s+/i, 'Cam. '],
    [/^Ronda\s+/i, 'Rda. '],
    [/^Travessera\s+/i, 'Trav. '],
    [/^Traves[ií]a\s+/i, 'Trav. '],
    [/^Carretera\s+/i, 'Ctra. '],
    [/^Urbanizaci[oó]n\s+/i, 'Urb. '],
  ];

  for (const [re, abrev] of abreviaturas) {
    if (re.test(first)) return first.replace(re, abrev).replace(/\s+/g, ' ').trim();
  }
  return first;
}

/**
 * Referencia corta origen/destino en la card del kanban (dos filas).
 * - Taller: negrita «Taller» · sub distrito/zona.
 * - Resto: negrita zona · sub calle.
 */
export function refParadaKanban(p: Parada | null | undefined): { bold: string; sub: string | null } {
  if (!p) return { bold: '—', sub: null };

  if (esParadaTaller(p)) {
    const distrito = p.sublocalidad ?? p.localidad;
    return { bold: 'Taller', sub: distrito };
  }

  const zona = p.sublocalidad ?? p.localidad;
  const calle = calleCorta(p.direccion);
  if (zona) return { bold: zona, sub: calle };
  if (calle) return { bold: calle, sub: null };
  return { bold: p.etiqueta?.trim() || '—', sub: null };
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
