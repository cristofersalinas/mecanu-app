/**
 * Búsqueda de contactos del backoffice (Equipo).
 * Prioriza coincidencias en nombre y DNI/documento; luego el resto de campos.
 */
export interface ContactoBusqueda {
  usuarioId: string;
  nombre: string;
  documento: string | null;
  email: string;
  telefono: string | null;
  rol: string;
  estado: string;
  tallerNombre: string | null;
  conductorId: string | null;
}

function norm(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

function normDoc(s: string | null | undefined): string {
  return (s ?? '').replace(/[\s.-]/g, '').toUpperCase();
}

function scoreCampo(
  valor: string,
  token: string,
  pesoPrefijo: number,
  pesoContiene: number,
): number {
  if (!valor || !token) return 0;
  if (valor.startsWith(token)) return pesoPrefijo;
  if (valor.includes(token)) return pesoContiene;
  return 0;
}

/**
 * Filtra y ordena contactos. Query vacío → lista original (mismo orden).
 * Varios tokens: todos deben matchear algo (AND); el score suma el mejor campo por token.
 */
export function buscarContactos(
  contactos: ContactoBusqueda[],
  query: string,
): ContactoBusqueda[] {
  const q = query.trim();
  if (!q) return contactos;

  const tokens = q.split(/\s+/).filter(Boolean).map((t) => ({
    raw: t,
    text: norm(t),
    doc: normDoc(t),
  }));

  const scored: { c: ContactoBusqueda; score: number }[] = [];

  for (const c of contactos) {
    const nombre = norm(c.nombre);
    const doc = normDoc(c.documento);
    const email = norm(c.email);
    const tel = norm(c.telefono?.replace(/\s/g, '') ?? '');
    const rol = norm(c.rol);
    const taller = norm(c.tallerNombre);
    const estado = norm(c.estado);

    let total = 0;
    let ok = true;
    for (const t of tokens) {
      const sNombre = scoreCampo(nombre, t.text, 100, 80);
      const sDoc = t.doc.length >= 2
        ? scoreCampo(doc, t.doc, 100, 80)
        : 0;
      const sEmail = scoreCampo(email, t.text, 40, 25);
      const sTel = scoreCampo(tel, t.text.replace(/\s/g, ''), 40, 25);
      const sRol = scoreCampo(rol, t.text, 20, 15);
      const sTaller = scoreCampo(taller, t.text, 20, 15);
      const sEstado = scoreCampo(estado, t.text, 10, 8);
      const best = Math.max(sNombre, sDoc, sEmail, sTel, sRol, sTaller, sEstado);
      if (best === 0) {
        ok = false;
        break;
      }
      total += best;
    }
    if (ok) scored.push({ c, score: total });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.c.nombre.localeCompare(b.c.nombre, 'es');
  });
  return scored.map((s) => s.c);
}
