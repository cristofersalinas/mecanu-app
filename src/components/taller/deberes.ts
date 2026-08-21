import { deberesDelTaller } from '@/lib/mecanu/deberes-taller';
import { vehiculo, type Campana, type CanalWa, type RutaVista } from './data';

export function deberesDesdePanel(
  rutas: RutaVista[],
  campanas: Campana[],
  ahora: Date,
  canales: Record<string, CanalWa> = {},
) {
  return deberesDelTaller({
    rutas: rutas.map((r) => ({
      id: r.id,
      estado: r.estado,
      subestado: r.subestado,
      fecha: r.fecha,
      franja: r.franja,
      conductorId: r.conductorId,
      vehiculoId: r.vehiculoId,
      matriculaLead: r.matriculaLead,
    })),
    campanas: campanas.map((c) => ({
      id: c.id,
      estado: c.estado,
      vehiculoId: c.vehiculoId,
      rutaGeneradaId: c.rutaGeneradaId,
      mensajes: (canales[c.id]?.mensajes ?? []).map((m) => ({ dir: m.dir, texto: m.texto })),
    })),
    ahora,
    labelRuta: (r) => vehiculo(r.vehiculoId)?.matricula ?? r.matriculaLead ?? 'el traslado',
    labelCampana: (c) => vehiculo(c.vehiculoId)?.matricula ?? 'la oferta',
  });
}
