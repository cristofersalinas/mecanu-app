import { describe, it, expect } from 'vitest';
import {
  puedeEditar, esArrastrable, aceptaDrop, seComunicaAlCliente, subestadoMeta,
  ESTADO, ESTADOS, SUBESTADOS_FRIOS, PASOS_EN_RUTA, PRESUPUESTO_PENDIENTES,
  TAGS_DERIVADOS, TAGS_MANUALES,
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

describe('Label del subestado vs detalle', () => {
  it('la card y el badge usan el nombre corto; la frase larga vive en desc', () => {
    expect(subestadoMeta('en_ruta', 'en_camino_origen')?.label).toBe('En camino');
    expect(subestadoMeta('en_ruta', 'en_camino_origen')?.desc).toMatch(/recogida/);
    expect(subestadoMeta('en_taller', 'oportunidad_vuelta')?.label).toBe('Sin vuelta');
    expect(subestadoMeta('en_taller', 'esperando_agenda_vuelta')?.label).toBe('Vuelta sin fecha');
    expect(subestadoMeta('en_taller', 'pendiente_confirmar_retiro')?.label).toBe('Confirmar retiro');
  });

  it('ningún label de subestado es una frase de más de dos palabras largas', () => {
    for (const estado of Object.values(ESTADO)) {
      for (const sub of estado.subestados) {
        expect(sub.label.split(/\s+/).length, `${estado.id}.${sub.id}`).toBeLessThanOrEqual(3);
        expect(sub.desc.length, `${estado.id}.${sub.id}`).toBeGreaterThan(sub.label.length);
      }
    }
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

describe('Congelación de ids del pipeline', () => {
  it('estados: añadir, quitar o renombrar un id falla hasta actualizar esta lista', () => {
    expect(ESTADOS.map((e) => e.id)).toEqual([
      'prospectos', 'agendado', 'en_ruta', 'en_taller', 'completado', 'cancelado',
    ]);
  });

  it('subestados: añadir, quitar o renombrar un id falla hasta actualizar esta lista', () => {
    expect(ESTADOS.map((e) => ({ id: e.id, subestados: e.subestados.map((s) => s.id) }))).toEqual([
      { id: 'prospectos', subestados: ['sin_fecha', 'oferta_enviada', 'propuesto', 'caducado'] },
      { id: 'agendado', subestados: ['sin_conductor', 'asignado', 'aceptado'] },
      { id: 'en_ruta', subestados: ['en_camino_origen', 'en_origen', 'en_transito', 'en_destino'] },
      { id: 'en_taller', subestados: ['esperando_agenda_vuelta', 'oportunidad_vuelta', 'pendiente_confirmar_retiro'] },
      { id: 'completado', subestados: ['ok', 'retirado_por_cliente', 'con_incidencia', 'pendiente_cierre'] },
      { id: 'cancelado', subestados: ['por_cliente', 'por_taller', 'fallido_origen', 'fallido_ruta'] },
    ]);
  });

  it('tags derivados: añadir, quitar o renombrar un id falla hasta actualizar esta lista', () => {
    expect(TAGS_DERIVADOS.map((t) => t.id)).toEqual([
      'sin_conductor', 'en_riesgo', 'retrasado', 'entrega_en_riesgo',
      'oportunidad_vuelta', 'larga_custodia', 'sin_confirmar_cliente',
      'inestable', 'doc_pendiente',
    ]);
  });

  it('tags manuales: añadir, quitar o renombrar un id falla hasta actualizar esta lista', () => {
    expect(TAGS_MANUALES.map((t) => t.id)).toEqual([
      'urgente', 'vip', 'no_rodante', 'cobro_pendiente',
      'tg-att', 'tg-flota', 'tg-garantia',
    ]);
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
