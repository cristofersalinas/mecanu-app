import { conflictoConductor } from '../mecanu-data';
import type { Conductor, Tramo } from '../types';
import { puedeTomarBolsa } from './ciclo-conductor';
import { SLA_HUECO_SIN_CONDUCTOR_H } from './reglas';
import { franjaDeVentana, inicioVentana, type MundoBackoffice } from './mundo';

export interface HuecoCobertura {
  tramoId: string;
  rutaId: string;
  etiqueta: string;
  franja: string | null;
  ventanaInicio: Date | null;
  horasHasta: number | null;
  urgente: boolean;
  motivo: 'sin_conductor' | 'sin_agenda';
}

export function huecosSinConductor(mundo: MundoBackoffice): HuecoCobertura[] {
  const { ahora, tramos, rutas } = mundo;
  const out: HuecoCobertura[] = [];
  for (const t of tramos) {
    if (t.estado === 'cancelado' || t.estado === 'completado') continue;
    const ruta = rutas.find((r) => r.id === t.rutaId);
    const etiqueta = ruta
      ? `${ruta.id} · ${ruta.etiquetaOrigen ?? 'Origen sin dato'} → ${ruta.etiquetaDestino ?? 'Destino sin dato'}`
      : t.id;
    if (t.estado === 'sin_agenda') {
      out.push({
        tramoId: t.id,
        rutaId: t.rutaId,
        etiqueta,
        franja: null,
        ventanaInicio: null,
        horasHasta: null,
        urgente: false,
        motivo: 'sin_agenda',
      });
      continue;
    }
    if (t.estado === 'agendado' && !t.conductorId) {
      const ini = inicioVentana(t);
      const horasHasta = ini ? (ini.getTime() - ahora.getTime()) / 3600000 : null;
      const urgente = horasHasta != null && horasHasta <= SLA_HUECO_SIN_CONDUCTOR_H;
      out.push({
        tramoId: t.id,
        rutaId: t.rutaId,
        etiqueta,
        franja: franjaDeVentana(t),
        ventanaInicio: ini,
        horasHasta,
        urgente,
        motivo: 'sin_conductor',
      });
    }
  }
  return out.sort((a, b) => {
    if (a.urgente !== b.urgente) return a.urgente ? -1 : 1;
    return (a.horasHasta ?? 9999) - (b.horasHasta ?? 9999);
  });
}

export function bolsaDisponibles(tramos: Tramo[]): Tramo[] {
  return tramos.filter((t) => t.estado === 'agendado' && !t.conductorId);
}

export function conflictoAlAsignar(
  mundo: MundoBackoffice,
  tramo: Tramo,
  conductorId: string,
): { ok: true } | { ok: false; motivo: string } {
  const conductor = mundo.conductores.find((c) => c.id === conductorId);
  if (!conductor) return { ok: false, motivo: 'Conductor no encontrado' };
  if (!puedeTomarBolsa(conductor)) {
    return { ok: false, motivo: 'Solo un conductor activo puede tomar o cubrir un tramo' };
  }
  const franja = franjaDeVentana(tramo) ?? mundo.rutas.find((r) => r.id === tramo.rutaId)?.franja;
  const fecha = tramo.ventana?.fecha ?? mundo.rutas.find((r) => r.id === tramo.rutaId)?.fecha;
  if (!fecha || !franja) {
    return { ok: false, motivo: 'Pendiente de agendar — no se inventa una ventana' };
  }
  const choque = conflictoConductor(mundo.rutas, conductorId, fecha, franja, tramo.rutaId);
  if (choque) {
    return { ok: false, motivo: `Solapa con ${choque.id} (${choque.franja ?? 'sin franja'})` };
  }
  return { ok: true };
}

export function conductoresCubriendoHoy(mundo: MundoBackoffice): Conductor[] {
  const ids = new Set(
    mundo.rutas
      .filter((r) => r.fecha && r.estado !== 'cancelado' && r.conductorId)
      .filter((r) => {
        const f = r.fecha!;
        const a = mundo.ahora;
        return f.getFullYear() === a.getFullYear() && f.getMonth() === a.getMonth() && f.getDate() === a.getDate();
      })
      .map((r) => r.conductorId as string),
  );
  return mundo.conductores.filter((c) => ids.has(c.id));
}

export function fmtHorasHasta(h: number | null): string {
  if (h == null) return 'Pendiente de agendar';
  if (h < 0) return `Hace ${Math.abs(Math.round(h))} h`;
  if (h < 1) return `${Math.round(h * 60)} min`;
  return `${h.toLocaleString('es-ES', { maximumFractionDigits: 1 })} h`;
}
