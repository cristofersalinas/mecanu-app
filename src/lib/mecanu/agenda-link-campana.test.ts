import { describe, expect, it } from 'vitest';
import {
  DETALLE_SEGUIR_AGENDA,
  HORAS_SEGUIR_AGENDA_LINK,
  esDeberAgendaCampana,
  esDeberSeguirAgenda,
  idDeberSeguirAgenda,
  mensajeLinkAgenda,
  tocaSeguirAgendaLink,
  tokenAgendaCampana,
  urlAgendaAutogestion,
} from './agenda-link-campana';

describe('agenda-link-campana', () => {
  it('arma token, url y mensaje', () => {
    expect(tokenAgendaCampana('CP-12')).toBe('ag-cp-12');
    expect(urlAgendaAutogestion('ag-cp-12')).toBe('https://mecanu.com/a/ag-cp-12');
    expect(mensajeLinkAgenda({ nombre: 'Diego', url: 'https://mecanu.com/a/x' })).toMatch(/Diego/);
    expect(mensajeLinkAgenda({ nombre: 'Diego', url: 'https://mecanu.com/a/x' })).toMatch(/https:\/\/mecanu.com\/a\/x/);
  });

  it('identifica deberes de agenda', () => {
    expect(esDeberSeguirAgenda(idDeberSeguirAgenda('CP-1'))).toBe(true);
    expect(esDeberAgendaCampana({ id: 'ruta-CP-1', tipo: 'crear_ruta' })).toBe(true);
    expect(esDeberAgendaCampana({ id: idDeberSeguirAgenda('CP-1'), tipo: 'recordar_oferta' })).toBe(true);
    expect(esDeberAgendaCampana({ id: 'seguir-CP-1', tipo: 'recordar_oferta' })).toBe(false);
  });

  it('toca seguimiento solo tras 12 h sin ayuda de ese ciclo', () => {
    const t0 = Date.parse('2026-08-26T10:00:00Z');
    expect(tocaSeguirAgendaLink(null, t0)).toBe(false);
    expect(tocaSeguirAgendaLink({ enviadoEn: t0, token: 'x' }, t0 + 11 * 3600000)).toBe(false);
    expect(tocaSeguirAgendaLink({ enviadoEn: t0, token: 'x' }, t0 + HORAS_SEGUIR_AGENDA_LINK * 3600000)).toBe(true);
    expect(tocaSeguirAgendaLink(
      { enviadoEn: t0, token: 'x', ayudaEn: t0 + 13 * 3600000 },
      t0 + 14 * 3600000,
    )).toBe(false);
    // Nuevo link tras la ayuda → vuelve a contar
    expect(tocaSeguirAgendaLink(
      { enviadoEn: t0 + 15 * 3600000, token: 'x', ayudaEn: t0 + 13 * 3600000 },
      t0 + 15 * 3600000 + HORAS_SEGUIR_AGENDA_LINK * 3600000,
    )).toBe(true);
    expect(DETALLE_SEGUIR_AGENDA).toBe('Link sin agendar');
  });
});
