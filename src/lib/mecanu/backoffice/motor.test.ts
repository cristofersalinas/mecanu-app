import { describe, expect, it } from 'vitest';
import type { Campana, Conductor, Presupuesto, RutaVista, Solicitud, Tramo, UsuarioBackoffice } from '../types';
import { buildAlertas } from './alertas';
import { aplicarAutomatizaciones, proponerAutomatizaciones } from './automations';
import { huecosSinConductor, conflictoAlAsignar } from './cobertura';
import { buildAnalitica } from './analitica';
import type { MundoBackoffice } from './mundo';

const ahora = new Date('2026-08-20T12:00:00');

function pres(over: Partial<Presupuesto> & Pick<Presupuesto, 'id' | 'estado'>): Presupuesto {
  return {
    campanaId: over.campanaId ?? 'CA-1',
    vehiculoId: 'v1',
    rutaOrigenId: null,
    rutaGeneradaId: null,
    modo: 'detallado',
    lineas: [],
    ivaIncluido: true,
    creado: ahora,
    actualizado: ahora,
    total: 100,
    ...over,
  };
}

function mundo(over: Partial<MundoBackoffice> = {}): MundoBackoffice {
  return {
    ahora,
    rutas: [],
    tramos: [],
    logs: [],
    campanas: [],
    presupuestos: [],
    conductores: [],
    solicitudes: [],
    usuarios: [],
    ejecuciones: [],
    ...over,
  };
}

function tramo(over: Partial<Tramo> & Pick<Tramo, 'id'>): Tramo {
  return {
    rutaId: 'TR-1',
    orden: 1,
    rol: 'ida',
    paradaOrigenId: 'PD-1',
    paradaDestinoId: 'PD-2',
    conductorId: null,
    ventana: { fecha: ahora, inicio: '13:00', fin: '14:00' },
    ventanaPropuesta: null,
    ventanaModo: 'fija_taller',
    clienteConfirmo: true,
    estado: 'agendado',
    subestado: null,
    seguro: true,
    importe: 90,
    reprogramaciones: 0,
    comunicaAlCliente: true,
    ...over,
  };
}

const activo: Conductor = {
  id: 'd1', nombre: 'Javier', telefono: '611', red: 'Interna', furgoneta: 'x',
  proceso: 'activo', supervisados: 3, requeridos: 3, alta: ahora,
  calificacion: 4.9, valoraciones: 1,
  docs: { dni: true, carnet: true, iban: true, seguro: true }, incidencias: [],
};

describe('Bandeja y SLA', () => {
  it('no_rodante pasa a crítica a los 15 min', () => {
    const s: Solicitud = {
      id: 'SOL-1', trasladoId: 'TS-1', rutaId: 'TR-1', conductorId: 'd1',
      tipo: 'no_rodante', motivo: 'testigo aceite', nota: null,
      ts: new Date(ahora.getTime() - 16 * 60000),
      estado: 'pendiente', resolucion: null, resueltaEn: null,
    };
    const alertas = buildAlertas(mundo({ solicitudes: [s] }));
    expect(alertas[0]?.severidad).toBe('critica');
    expect(alertas[0]?.reglaId).toBe('escalar_no_rodante');
  });

  it('una solicitud de 5 min no genera alerta', () => {
    const s: Solicitud = {
      id: 'SOL-2', trasladoId: 'TS-1', rutaId: 'TR-1', conductorId: 'd1',
      tipo: 'reagenda', motivo: 'tráfico', nota: null,
      ts: new Date(ahora.getTime() - 5 * 60000),
      estado: 'pendiente', resolucion: null, resueltaEn: null,
    };
    expect(buildAlertas(mundo({ solicitudes: [s] }))).toHaveLength(0);
  });
});

describe('Cobertura', () => {
  it('un tramo agendado sin conductor en las próximas 24 h es hueco urgente', () => {
    const t = tramo({ id: 'TS-H' });
    const huecos = huecosSinConductor(mundo({ tramos: [t], rutas: [] }));
    expect(huecos[0]?.urgente).toBe(true);
    expect(huecos[0]?.motivo).toBe('sin_conductor');
  });

  it('sin ventana no se inventa hora al asignar', () => {
    const t = tramo({ id: 'TS-H', ventana: null, estado: 'sin_agenda' });
    const r = conflictoAlAsignar(mundo({ tramos: [t], rutas: [], conductores: [activo] }), t, 'd1');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toMatch(/Pendiente de agendar/);
  });
});

describe('Automatizaciones', () => {
  it('caduca una oferta enviada hace 14 días y no la vuelve a tocar', () => {
    const p = pres({
      id: 'PR-OLD', estado: 'enviada',
      actualizado: new Date('2026-08-01T12:00:00'),
    });
    const camp = {
      id: 'CA-OLD', clienteId: 'c1', vehiculoId: 'v1', rutaOrigenId: null, rutaGeneradaId: null,
      inspeccionId: null, items: [], tipos: [], etiquetas: [], falla: 'x', evidencia: 'x',
      valor: 100, servicio: null, urgente: false, severidad: 'media', fecha: p.actualizado!,
      habito: '', motivoFecha: '', fotoUrl: null, estadoEnvio: 'enviada',
      presupuestoId: p.id, presupuesto: p, estado: 'enviada' as const, origenAutomatico: true,
    } satisfies Campana;
    const m = mundo({ campanas: [camp], presupuestos: [p] });
    const first = proponerAutomatizaciones(m);
    expect(first).toHaveLength(1);
    aplicarAutomatizaciones(m, first);
    expect(p.estado).toBe('caducada');
    expect(proponerAutomatizaciones(m)).toHaveLength(0);
  });

  it('escalar no_rodante es idempotente y no resuelve la solicitud sola', () => {
    const s: Solicitud = {
      id: 'SOL-R', trasladoId: 'TS-1', rutaId: 'TR-1', conductorId: 'd1',
      tipo: 'no_rodante', motivo: 'aceite', nota: null,
      ts: new Date(ahora.getTime() - 40 * 60000),
      estado: 'pendiente', resolucion: null, resueltaEn: null,
    };
    const m = mundo({ solicitudes: [s] });
    aplicarAutomatizaciones(m, proponerAutomatizaciones(m));
    expect(s.estado).toBe('pendiente');
    expect(m.ejecuciones).toHaveLength(1);
    expect(proponerAutomatizaciones(m)).toHaveLength(0);
  });
});

describe('Analítica de dinero', () => {
  it('el facturado cerrado suma importes de completado e indica IVA vía la etiqueta', () => {
    const rutas = [
      { estado: 'completado', importe: 374.5, fecha: ahora },
      { estado: 'en_ruta', importe: 90, fecha: ahora },
    ] as RutaVista[];
    const a = buildAnalitica(mundo({ rutas }), 0);
    expect(a.facturadoCerrado).toBe(374.5);
    expect(a.facturadoCerradoLabel).toMatch(/374,50\s€/);
    expect(a.trasladosHoy).toBe(2);
  });

  it('sin ofertas enviadas no se inventa una tasa de conversión', () => {
    const a = buildAnalitica(mundo(), 0);
    expect(a.conversionEnviadaPct).toBeNull();
    expect(a.conversionEnviadaLabel).toMatch(/Sin dato/);
  });
});

describe('Usuarios de fixture', () => {
  it('el tipo UsuarioBackoffice se usa en el mundo', () => {
    const u: UsuarioBackoffice = {
      id: 'u-1', nombre: 'A', email: 'a@b.c', telefono: null, rol: 'dueno',
      estado: 'activo', conductorId: null, invitadEn: ahora, activadoEn: ahora,
    };
    expect(u.rol).toBe('dueno');
  });
});
