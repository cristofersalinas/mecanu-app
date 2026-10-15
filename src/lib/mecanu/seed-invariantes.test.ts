import { describe, expect, it } from 'vitest';
import {
  CLIENTES, CONDUCTORES, VEHICULOS, franjasConflictan, normalizePlate,
} from './mecanu-data';
import { CAMPANAS, RUTAS, TRASLADOS } from './mecanu-rutas';

const ABIERTOS = new Set(['prospectos', 'agendado', 'en_ruta', 'en_taller']);

function placaDeRuta(rutaId: string): string | null {
  const r = RUTAS.find((x) => x.id === rutaId);
  if (!r) return null;
  if (r.matriculaLead) return normalizePlate(r.matriculaLead);
  const v = VEHICULOS.find((x) => x.id === r.vehiculoId);
  return v ? normalizePlate(v.matricula) : null;
}

/** Pares origen→generada de una campaña: el mismo coche en historial + siguiente visita. */
function placasLigadasPorCampana(): Set<string> {
  const out = new Set<string>();
  for (const c of CAMPANAS) {
    if (!c.rutaOrigenId || !c.rutaGeneradaId) continue;
    const a = placaDeRuta(c.rutaOrigenId);
    const b = placaDeRuta(c.rutaGeneradaId);
    if (a && b && a === b) out.add(a);
  }
  return out;
}

describe('Seed mock: cada card del kanban es un caso distinto, no un copy-paste', () => {
  it('matrículas de flota únicas', () => {
    const placas = VEHICULOS.map((v) => normalizePlate(v.matricula));
    expect(new Set(placas).size).toBe(placas.length);
  });

  it('ids, teléfonos y emails de clientes únicos (el vacío de c15 no cuenta)', () => {
    expect(new Set(CLIENTES.map((c) => c.id)).size).toBe(CLIENTES.length);
    const tels = CLIENTES.map((c) => c.telefono.replace(/\s+/g, ''));
    expect(new Set(tels).size).toBe(tels.length);
    const mails = CLIENTES.map((c) => c.email.trim().toLowerCase()).filter(Boolean);
    expect(new Set(mails).size).toBe(mails.length);
  });

  it('ids y teléfonos de conductores únicos', () => {
    expect(new Set(CONDUCTORES.map((d) => d.id)).size).toBe(CONDUCTORES.length);
    const tels = CONDUCTORES.map((d) => d.telefono.replace(/\s+/g, ''));
    expect(new Set(tels).size).toBe(tels.length);
  });

  it('las placas de las furgonetas no coinciden con las de los coches del taller', () => {
    const coches = new Set(VEHICULOS.map((v) => normalizePlate(v.matricula)));
    for (const d of CONDUCTORES) {
      const m = d.furgoneta.match(/(\d{4}\s*[A-Z]{3})/i);
      if (!m) continue;
      expect(coches.has(normalizePlate(m[1]))).toBe(false);
    }
  });

  it('un vehículo tiene como máximo una ruta abierta (no puede estar en dos sitios)', () => {
    const abiertas = new Map<string, string[]>();
    for (const r of RUTAS) {
      if (!r.vehiculoId || !ABIERTOS.has(r.estado)) continue;
      const list = abiertas.get(r.vehiculoId) ?? [];
      list.push(`${r.id}:${r.estado}`);
      abiertas.set(r.vehiculoId, list);
    }
    for (const [vid, list] of abiertas) {
      expect(list, `${vid} abierta en ${list.join(', ')}`).toHaveLength(1);
    }
  });

  it('R1: un conductor tiene como máximo un tramo en_curso', () => {
    const enCurso = new Map<string, string[]>();
    for (const t of TRASLADOS) {
      if (t.estado !== 'en_curso' || !t.conductorId) continue;
      const list = enCurso.get(t.conductorId) ?? [];
      list.push(t.id);
      enCurso.set(t.conductorId, list);
    }
    for (const [did, list] of enCurso) {
      expect(list, `${did} en_curso: ${list.join(', ')}`).toHaveLength(1);
    }
  });

  it('la misma matrícula no sale en dos cards, salvo origen+generada de una campaña', () => {
    const ligadas = placasLigadasPorCampana();
    const porPlaca = new Map<string, string[]>();
    for (const r of RUTAS) {
      const placa = placaDeRuta(r.id);
      if (!placa) continue;
      const list = porPlaca.get(placa) ?? [];
      list.push(r.id);
      porPlaca.set(placa, list);
    }
    for (const [placa, ids] of porPlaca) {
      if (ids.length <= 1) continue;
      expect(
        ligadas.has(placa),
        `${placa} en ${ids.join(', ')} sin vínculo de campaña`,
      ).toBe(true);
    }
  });

  it('tramos vivos del mismo conductor el mismo día no se pisan (1 h de margen)', () => {
    const vivos = TRASLADOS.filter((t) =>
      t.conductorId && t.ventana
      && t.estado !== 'cancelado' && t.estado !== 'completado',
    );
    const franjaDe = (t: typeof vivos[number]) =>
      `${t.ventana!.inicio} - ${t.ventana!.fin}`;
    for (let i = 0; i < vivos.length; i++) {
      for (let j = i + 1; j < vivos.length; j++) {
        const a = vivos[i];
        const b = vivos[j];
        if (a.conductorId !== b.conductorId) continue;
        if (a.ventana!.fecha.toDateString() !== b.ventana!.fecha.toDateString()) continue;
        expect(
          franjasConflictan(franjaDe(a), franjaDe(b)),
          `${a.conductorId}: ${a.id} ${franjaDe(a)} vs ${b.id} ${franjaDe(b)}`,
        ).toBe(false);
      }
    }
  });
});
