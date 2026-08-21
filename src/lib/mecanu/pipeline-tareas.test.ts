import { describe, expect, it } from 'vitest';
import type { DeberTaller } from './deberes-taller';
import {
  PIPELINE_TAREAS_VACIO, aplicarMovimientoTarea, columnaPorDefecto, contarPendientesPipeline,
  puedeArrastrarTarea, puedeMoverTarea, proyectarPipelineTareas, reabrirTareaArchivada,
  reconciliarPipelineTareas, type TareaKanban,
} from './pipeline-tareas';

const ahora = new Date('2026-08-21T10:00:00');

function deber(over: Partial<DeberTaller> & Pick<DeberTaller, 'id' | 'tipo' | 'urgencia'>): DeberTaller {
  return {
    entidadKind: 'ruta',
    entidadId: 'TR-1',
    zona: 'ventana',
    titulo: over.titulo ?? over.id,
    detalle: 'detalle',
    cta: 'Hacer',
    hintNudge: 'aquí',
    ...over,
  };
}

function cardDe(d: DeberTaller, columna: TareaKanban['columna'] = 'pendiente'): TareaKanban {
  return { id: d.id, deber: d, columna, arrastrable: columna === 'pendiente' };
}

describe('columna por defecto', () => {
  it('toda tarea nueva entra en Pendiente', () => {
    expect(columnaPorDefecto()).toBe('pendiente');
  });
});

describe('reglas de arrastre', () => {
  it('solo Pendiente se arrastra', () => {
    expect(puedeArrastrarTarea('pendiente')).toBe(true);
    expect(puedeArrastrarTarea('hecho')).toBe(false);
    expect(puedeArrastrarTarea('cancelado')).toBe(false);
  });

  it('a Hecho no se llega arrastrando, salvo un seguimiento', () => {
    const no = puedeMoverTarea({ tipo: 'agendar', desde: 'pendiente', hacia: 'hecho' });
    expect(no.ok).toBe(false);
    if (!no.ok) expect(no.motivo).toMatch(/hecha/);
    expect(puedeMoverTarea({ tipo: 'recordar_oferta', desde: 'pendiente', hacia: 'hecho' })).toEqual({ ok: true });
  });

  it('a Cancelado sí, desde Pendiente', () => {
    expect(puedeMoverTarea({ tipo: 'agendar', desde: 'pendiente', hacia: 'cancelado' })).toEqual({ ok: true });
  });

  it('desde Hecho o Cancelado no se arrastra', () => {
    expect(puedeMoverTarea({ tipo: 'recordar_oferta', desde: 'hecho', hacia: 'pendiente' }).ok).toBe(false);
    expect(puedeMoverTarea({ tipo: 'agendar', desde: 'cancelado', hacia: 'pendiente' }).ok).toBe(false);
  });
});

describe('proyectar y reconciliar', () => {
  it('todas las nuevas caen en Pendiente; Hecho y Cancelado vacíos', () => {
    const derivados = [
      deber({ id: 'a', tipo: 'crear_ruta', urgencia: 'ahora' }),
      deber({ id: 'b', tipo: 'agendar', urgencia: 'hoy' }),
      deber({ id: 'c', tipo: 'recordar_oferta', urgencia: 'cuando_puedas', entidadKind: 'campana', entidadId: 'CP-1' }),
    ];
    const estado = reconciliarPipelineTareas(PIPELINE_TAREAS_VACIO, derivados, ahora);
    const cols = proyectarPipelineTareas(estado, derivados);
    expect(cols.pendiente.map((t) => t.id)).toEqual(['a', 'b', 'c']);
    expect(cols.hecho).toEqual([]);
    expect(cols.cancelado).toEqual([]);
    expect(contarPendientesPipeline(cols)).toBe(3);
  });

  it('dentro de Pendiente, la urgencia ordena (Urgente arriba) pero no cambia de columna', () => {
    const derivados = [
      deber({ id: 'tarde', tipo: 'agendar', urgencia: 'cuando_puedas', titulo: 'Z' }),
      deber({ id: 'ya', tipo: 'agendar', urgencia: 'ahora', titulo: 'A' }),
    ];
    const cols = proyectarPipelineTareas(
      reconciliarPipelineTareas(PIPELINE_TAREAS_VACIO, derivados, ahora),
      derivados,
    );
    expect(cols.pendiente.map((t) => t.id)).toEqual(['ya', 'tarde']);
  });

  it('arrastrar a Hecho una tarea de agendar no mueve la card', () => {
    const d = deber({ id: 'b', tipo: 'agendar', urgencia: 'hoy' });
    const estado = reconciliarPipelineTareas(PIPELINE_TAREAS_VACIO, [d], ahora);
    const card = proyectarPipelineTareas(estado, [d]).pendiente[0];
    const mov = aplicarMovimientoTarea(estado, card, 'hecho', ahora);
    expect(mov.ok).toBe(false);
    const cols = proyectarPipelineTareas(estado, [d]);
    expect(cols.pendiente[0]?.id).toBe('b');
    expect(cols.hecho).toEqual([]);
  });

  it('al desaparecer el deber (hueco cerrado), pasa a Hecho', () => {
    const d = deber({ id: 'agendar-TR-1', tipo: 'agendar', urgencia: 'hoy' });
    let estado = reconciliarPipelineTareas(PIPELINE_TAREAS_VACIO, [d], ahora);
    estado = reconciliarPipelineTareas(estado, [], ahora);
    const cols = proyectarPipelineTareas(estado, []);
    expect(cols.pendiente).toEqual([]);
    expect(cols.hecho).toHaveLength(1);
    expect(cols.hecho[0].via).toBe('accion');
    expect(cols.hecho[0].arrastrable).toBe(false);
  });

  it('si el hueco reaparece, vuelve a Pendiente', () => {
    const d = deber({ id: 'agendar-TR-1', tipo: 'agendar', urgencia: 'hoy' });
    let estado = reconciliarPipelineTareas(PIPELINE_TAREAS_VACIO, [d], ahora);
    estado = reconciliarPipelineTareas(estado, [], ahora);
    estado = reconciliarPipelineTareas(estado, [d], ahora);
    const cols = proyectarPipelineTareas(estado, [d]);
    expect(cols.hecho).toEqual([]);
    expect(cols.pendiente[0]?.id).toBe('agendar-TR-1');
  });

  it('archivar un seguimiento lo saca de pendientes', () => {
    const d = deber({
      id: 'seguir-CP-1', tipo: 'recordar_oferta', urgencia: 'cuando_puedas',
      entidadKind: 'campana', entidadId: 'CP-1',
    });
    let estado = reconciliarPipelineTareas(PIPELINE_TAREAS_VACIO, [d], ahora);
    const mov = aplicarMovimientoTarea(estado, cardDe(d, 'pendiente'), 'hecho', ahora);
    expect(mov.ok).toBe(true);
    if (!mov.ok) return;
    estado = reconciliarPipelineTareas(mov.estado, [d], ahora);
    const cols = proyectarPipelineTareas(estado, [d]);
    expect(cols.pendiente).toEqual([]);
    expect(cols.hecho[0]?.id).toBe('seguir-CP-1');
    expect(cols.hecho[0]?.via).toBe('archivada');
  });

  it('reabrir un archivado lo devuelve a Pendiente', () => {
    const d = deber({
      id: 'seguir-CP-1', tipo: 'recordar_oferta', urgencia: 'cuando_puedas',
      entidadKind: 'campana', entidadId: 'CP-1',
    });
    let estado = reconciliarPipelineTareas(PIPELINE_TAREAS_VACIO, [d], ahora);
    const mov = aplicarMovimientoTarea(estado, cardDe(d, 'pendiente'), 'hecho', ahora);
    if (!mov.ok) throw new Error('debería archivar');
    estado = reabrirTareaArchivada(mov.estado, d.id);
    const cols = proyectarPipelineTareas(estado, [d]);
    expect(cols.hecho).toEqual([]);
    expect(cols.pendiente[0]?.id).toBe(d.id);
  });

  it('cancelar saca la tarea del pipeline abierto y se puede reabrir', () => {
    const d = deber({ id: 'a', tipo: 'agendar', urgencia: 'hoy' });
    let estado = reconciliarPipelineTareas(PIPELINE_TAREAS_VACIO, [d], ahora);
    const mov = aplicarMovimientoTarea(estado, cardDe(d, 'pendiente'), 'cancelado', ahora);
    expect(mov.ok).toBe(true);
    if (!mov.ok) return;
    estado = reconciliarPipelineTareas(mov.estado, [d], ahora);
    let cols = proyectarPipelineTareas(estado, [d]);
    expect(cols.pendiente).toEqual([]);
    expect(cols.cancelado[0]?.id).toBe('a');
    expect(cols.cancelado[0]?.via).toBe('cancelada');
    expect(contarPendientesPipeline(cols)).toBe(0);

    estado = reabrirTareaArchivada(estado, d.id);
    cols = proyectarPipelineTareas(estado, [d]);
    expect(cols.cancelado).toEqual([]);
    expect(cols.pendiente[0]?.id).toBe('a');
  });

  it('reconciliar sin cambios devuelve el mismo objeto', () => {
    const d = deber({ id: 'a', tipo: 'agendar', urgencia: 'hoy' });
    const a = reconciliarPipelineTareas(PIPELINE_TAREAS_VACIO, [d], ahora);
    const b = reconciliarPipelineTareas(a, [d], ahora);
    expect(b).toBe(a);
  });
});
