import { describe, it, expect } from 'vitest';
import {
  puedeEditar, esArrastrable, aceptaDrop, seComunicaAlCliente, subestadoMeta,
  ESTADO, SUBESTADOS_FRIOS, PASOS_EN_RUTA, PRESUPUESTO_PENDIENTES,
  colorDeKind, kindDeSubestado,
} from './mecanu-pipeline';

describe('Solo Prospectos es arrastrable en el kanban', () => {
  it('Prospectos se puede arrastrar', () => {
    expect(esArrastrable('prospectos')).toBe(true);
  });

  it('Agendado, En ruta, En taller, Completado y Cancelado NO se pueden arrastrar', () => {
    for (const estado of ['agendado', 'en_ruta', 'en_taller', 'completado', 'cancelado']) {
      expect(esArrastrable(estado)).toBe(false);
    }
  });
});

describe('Soltar una card en el kanban', () => {
  it('soltar en Agendado abre el asistente de agendar', () => {
    expect(aceptaDrop('agendado')).toBe(true);
    expect(ESTADO.agendado.dropAccion).toBe('agendar');
  });

  it('soltar en Cancelado exige un motivo', () => {
    expect(aceptaDrop('cancelado')).toBe(true);
    expect(ESTADO.cancelado.exigeMotivo).toBe(true);
  });

  it('En ruta y En taller no aceptan que se les suelte una card', () => {
    expect(aceptaDrop('en_ruta')).toBe(false);
    expect(aceptaDrop('en_taller')).toBe(false);
  });
});

describe('Qué se puede editar según el estado de la ruta', () => {
  it('en Prospectos se puede editar todo', () => {
    expect(puedeEditar('prospectos', 'ventana')).toBe(true);
    expect(puedeEditar('prospectos', 'conductor')).toBe(true);
  });

  it('en estados bloqueados (En ruta, Completado) solo se pueden editar los tags', () => {
    expect(puedeEditar('en_ruta', 'tags')).toBe(true);
    expect(puedeEditar('en_ruta', 'ventana')).toBe(false);
    expect(puedeEditar('completado', 'tags')).toBe(true);
    expect(puedeEditar('completado', 'conductor')).toBe(false);
  });

  it('en Agendado solo se puede editar ventana, conductor y tags', () => {
    expect(puedeEditar('agendado', 'ventana')).toBe(true);
    expect(puedeEditar('agendado', 'conductor')).toBe(true);
    expect(puedeEditar('agendado', 'tags')).toBe(true);
    expect(puedeEditar('agendado', 'clienteTieneAuto')).toBe(false);
  });

  it('un estado inexistente no permite editar nada', () => {
    expect(puedeEditar('estado_que_no_existe', 'ventana')).toBe(false);
  });
});

describe('Los 4 subestados de EN RUTA solo los mueve el conductor', () => {
  it('en_ruta está marcado soloConductor', () => {
    expect(ESTADO.en_ruta.soloConductor).toBe(true);
  });

  it('el orden de avance es en_camino_origen → en_origen → en_transito → en_destino', () => {
    expect(PASOS_EN_RUTA).toEqual(['en_camino_origen', 'en_origen', 'en_transito', 'en_destino']);
  });

  it('ningún otro estado está marcado soloConductor', () => {
    for (const estado of ['prospectos', 'agendado', 'en_taller', 'completado', 'cancelado']) {
      expect(ESTADO[estado].soloConductor).toBeFalsy();
    }
  });
});

describe('Un traslado se comunica al cliente si el origen o el destino es una parada de cliente', () => {
  it('cliente → taller: se comunica (es la recogida)', () => {
    expect(seComunicaAlCliente({ tipo: 'cliente' } as never, { tipo: 'proveedor' } as never)).toBe(true);
  });

  it('taller → cliente: se comunica (es la devolución)', () => {
    expect(seComunicaAlCliente({ tipo: 'proveedor' } as never, { tipo: 'cliente' } as never)).toBe(true);
  });

  it('taller → taller (movimiento interno, p.ej. al chapista): NO se comunica al cliente', () => {
    expect(seComunicaAlCliente({ tipo: 'proveedor' } as never, { tipo: 'proveedor' } as never)).toBe(false);
  });
});

describe('Leads fríos: el subestado "caducado" sale del pipeline activo', () => {
  it('prospectos.caducado está marcado fueraDelPipeline', () => {
    expect(SUBESTADOS_FRIOS).toContain('prospectos.caducado');
  });

  it('caducado no es lo mismo que cancelado — sigue siendo un prospecto, solo que frío', () => {
    const meta = subestadoMeta('prospectos', 'caducado');
    expect(meta?.estadoId).toBe('prospectos');
  });

  it('ningún subestado de otro estado está marcado fuera del pipeline', () => {
    const otros = SUBESTADOS_FRIOS.filter((s) => !s.startsWith('prospectos.'));
    expect(otros).toHaveLength(0);
  });
});

describe('Badge de la pestaña Campañas: qué estados de presupuesto cuentan como pendientes del taller', () => {
  it('nueva y valorada son pendientes del taller', () => {
    expect(PRESUPUESTO_PENDIENTES).toContain('nueva');
    expect(PRESUPUESTO_PENDIENTES).toContain('valorada');
  });

  it('enviada, aceptada, rechazada y caducada NO cuentan (ya no requieren acción del taller)', () => {
    for (const estado of ['enviada', 'aceptada', 'rechazada', 'caducada']) {
      expect(PRESUPUESTO_PENDIENTES).not.toContain(estado);
    }
  });
});

describe('Semáforo de columnas y subestados', () => {
  it('las columnas siguen el ciclo: espera, en curso, en taller, alerta', () => {
    expect(ESTADO.prospectos.kind).toBe('neutral');
    expect(ESTADO.agendado.kind).toBe('neutral');
    expect(ESTADO.en_ruta.kind).toBe('positive');
    expect(ESTADO.en_taller.kind).toBe('info');
    expect(ESTADO.completado.kind).toBe('positive');
    expect(ESTADO.cancelado.kind).toBe('alert');
  });

  it('el taller debe atender: sin fecha, sin conductor y cierre pendiente', () => {
    expect(kindDeSubestado('prospectos', 'sin_fecha')).toBe('alert');
    expect(kindDeSubestado('agendado', 'sin_conductor')).toBe('alert');
    expect(kindDeSubestado('completado', 'pendiente_cierre')).toBe('alert');
  });

  it('esperar al cliente es neutro', () => {
    expect(kindDeSubestado('prospectos', 'oferta_enviada')).toBe('neutral');
    expect(kindDeSubestado('prospectos', 'propuesto')).toBe('neutral');
  });

  it('en curso es verde y en taller es azul', () => {
    for (const sub of PASOS_EN_RUTA) {
      expect(kindDeSubestado('en_ruta', sub)).toBe('positive');
    }
    expect(kindDeSubestado('en_taller', 'esperando_agenda_vuelta')).toBe('info');
    expect(kindDeSubestado('en_taller', 'oportunidad_vuelta')).toBe('info');
  });

  it('un problema o alerta no usa el color de ciclo', () => {
    expect(kindDeSubestado('prospectos', 'caducado')).toBe('alert');
    expect(kindDeSubestado('completado', 'con_incidencia')).toBe('alert');
    expect(kindDeSubestado('cancelado', 'fallido_origen')).toBe('alert');
  });

  it('colorDeKind traduce info a azul y alert a rojo', () => {
    expect(colorDeKind('info')).toBe('var(--mecanu-info)');
    expect(colorDeKind('alert')).toBe('var(--mecanu-alert)');
    expect(colorDeKind('positive')).toBe('var(--mecanu-positive)');
    expect(colorDeKind('neutral')).toBe('var(--mecanu-neutral-300)');
  });
});
