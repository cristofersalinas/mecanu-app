import { describe, expect, it } from 'vitest';
import { at } from './mecanu-data';
import { RUTAS_VISTA } from './mecanu-rutas';
import {
  kpisCampanas,
  kpisTareas,
  kpisTraslados,
  metricasGeneralesRutas,
  mismoDiaCalendario,
  trasladosVentanaEnDia,
} from './kpis-panel';
import type { Campana, RutaVista } from './types';
import type { TareaKanban } from './pipeline-tareas';

describe('kpis-panel', () => {
  const ahora = at(12, 0, 0);

  it('mismoDiaCalendario ignora la hora', () => {
    const manana = at(8, 0, 0);
    const tarde = at(22, 30, 0);
    expect(mismoDiaCalendario(manana, tarde)).toBe(true);
  });

  it('trasladosVentanaEnDia excluye canceladas y sin ventana', () => {
    const rutas: RutaVista[] = [
      { ...RUTAS_VISTA[0]!, id: 'A', fecha: ahora, estado: 'agendado' },
      { ...RUTAS_VISTA[0]!, id: 'B', fecha: ahora, estado: 'cancelado' },
      { ...RUTAS_VISTA[0]!, id: 'C', fecha: null, estado: 'prospectos' },
      { ...RUTAS_VISTA[0]!, id: 'D', fecha: at(12, 0, 1), estado: 'agendado' },
    ];
    expect(trasladosVentanaEnDia(rutas, ahora)).toBe(1);
  });

  it('kpisTraslados coincide con conteos por estado del mock', () => {
    const vals = kpisTraslados(RUTAS_VISTA, ahora);
    const porId = Object.fromEntries(vals.map((k) => [k.id, k.value]));
    expect(Number(porId.hoy)).toBe(trasladosVentanaEnDia(RUTAS_VISTA, ahora));
    expect(Number(porId.agendado)).toBe(RUTAS_VISTA.filter((r) => r.estado === 'agendado').length);
    expect(Number(porId.en_taller)).toBe(RUTAS_VISTA.filter((r) => r.estado === 'en_taller').length);
    expect(Number(porId.prospectos)).toBe(RUTAS_VISTA.filter((r) => r.estado === 'prospectos').length);
  });

  it('metricasGeneralesRutas alinea traslados hoy con kpisTraslados', () => {
    const m = metricasGeneralesRutas(RUTAS_VISTA, ahora);
    const hoyKpi = kpisTraslados(RUTAS_VISTA, ahora).find((k) => k.id === 'hoy');
    expect(m.trasladosHoy).toBe(Number(hoyKpi?.value));
    expect(m.enTaller).toBe(RUTAS_VISTA.filter((r) => r.estado === 'en_taller').length);
  });

  it('kpisCampanas usa presupuesto.total o valor de respaldo', () => {
    const campanas: Campana[] = [{
      id: 'CMP-1',
      clienteId: null,
      vehiculoId: null,
      rutaOrigenId: null,
      rutaGeneradaId: null,
      inspeccionId: null,
      items: [],
      tipos: [],
      etiquetas: [],
      falla: 'Test',
      evidencia: '',
      valor: 100,
      servicio: null,
      urgente: false,
      severidad: 'info',
      fecha: ahora,
      habito: '',
      motivoFecha: '',
      fotoUrl: null,
      estadoEnvio: 'pendiente',
      presupuestoId: 'PR-1',
      presupuesto: {
        id: 'PR-1',
        campanaId: 'CMP-1',
        vehiculoId: null,
        rutaOrigenId: null,
        modo: 'detallado',
        estado: 'nueva',
        lineas: [],
        total: 250,
        creado: ahora,
        actualizado: ahora,
      },
      estado: 'nueva',
      origenAutomatico: false,
    }];
    const kpis = kpisCampanas(campanas);
    expect(kpis.find((k) => k.id === 'pendientes')?.value).toBe('1');
    expect(Number(kpis.find((k) => k.id === 'monto-activo')?.value)).toBe(250);
  });

  it('kpisTareas cuenta columnas del pipeline', () => {
    const deber = {
      tipo: 'agendar' as const,
      entidadKind: 'ruta' as const,
      entidadId: 'TR-1',
      titulo: 'T',
      detalle: '',
      cta: '',
      urgencia: 'ahora' as const,
      zona: 'ventana' as const,
      hintNudge: '',
    };
    const card = (id: string, urgencia: 'ahora' | 'normal' = 'normal'): TareaKanban => ({
      id,
      deber: { ...deber, urgencia },
      columna: 'pendiente',
      cancelacion: null,
    });
    const porColumna = {
      pendiente: [card('1', 'ahora'), card('2')],
      hecho: [card('3')],
      cancelado: [],
    };
    const kpis = kpisTareas(porColumna);
    expect(kpis.find((k) => k.id === 'pendientes')?.value).toBe('2');
    expect(kpis.find((k) => k.id === 'urgentes')?.value).toBe('1');
    expect(kpis.find((k) => k.id === 'hechas')?.value).toBe('1');
  });
});
