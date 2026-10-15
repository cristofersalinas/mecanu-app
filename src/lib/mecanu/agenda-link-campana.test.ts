import { describe, expect, it } from 'vitest';
import {
  DETALLE_SEGUIR_AGENDA,
  HORAS_NUDGE_AGENDA_LABORALES,
  HORAS_SEGUIR_AGENDA_LINK,
  esDeberAgendaCampana,
  esDeberSeguirAgenda,
  esDentroHorarioLaboral,
  esMensajeNudgeAgendaAutomatico,
  hayAgendamientoConfirmado,
  idDeberSeguirAgenda,
  mensajeLinkAgenda,
  mensajeNudgeAgendaAutomatico,
  msHastaNudgeAgendaLaboral,
  sumarHorasLaborales,
  tocaNudgeAgendaLaboral,
  tocaSeguirAgendaLink,
  tokenAgendaCampana,
  urlAgendaAutogestion,
} from './agenda-link-campana';

describe('agenda-link-campana', () => {
  it('arma token, url y mensaje', () => {
    expect(tokenAgendaCampana('CP-12')).toBe('ag-cp-12');
    expect(urlAgendaAutogestion('ag-cp-12')).toBe('https://mecanu.com/s/ag-cp-12');
    expect(mensajeLinkAgenda({ nombre: 'Diego', url: 'https://mecanu.com/s/x' })).toMatch(/Diego/);
    expect(mensajeLinkAgenda({ nombre: 'Diego', url: 'https://mecanu.com/s/x' })).toMatch(/https:\/\/mecanu.com\/s\/x/);
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
    expect(tocaSeguirAgendaLink(
      { enviadoEn: t0 + 15 * 3600000, token: 'x', ayudaEn: t0 + 13 * 3600000 },
      t0 + 15 * 3600000 + HORAS_SEGUIR_AGENDA_LINK * 3600000,
    )).toBe(true);
    expect(DETALLE_SEGUIR_AGENDA).toBe('Link sin agendar');
  });

  it('suma 3 h laborales y salta el fin de semana', () => {
    // Viernes 16:00 → 1 h el viernes + 2 h el lunes = lunes 11:00
    const viernes = new Date(2026, 7, 21, 16, 0, 0); // ago 2026, viernes
    expect(viernes.getDay()).toBe(5);
    const due = sumarHorasLaborales(viernes, HORAS_NUDGE_AGENDA_LABORALES);
    expect(due.getDay()).toBe(1);
    expect(due.getHours()).toBe(11);
    expect(due.getMinutes()).toBe(0);
  });

  it('nudge laboral: no manda si ya hay cita o fuera de horario', () => {
    const lunes10 = new Date(2026, 7, 24, 10, 0, 0); // lun
    const enviado = lunes10.getTime();
    const due = sumarHorasLaborales(lunes10, 3); // 13:00
    expect(due.getHours()).toBe(13);

    expect(tocaNudgeAgendaLaboral({
      linkEnviadoEn: enviado,
      ahoraMs: due.getTime(),
      hayAgendamiento: true,
    })).toBe(false);

    expect(tocaNudgeAgendaLaboral({
      linkEnviadoEn: enviado,
      ahoraMs: due.getTime(),
      hayAgendamiento: false,
      autoNudgeEnviadoEn: due.getTime(),
    })).toBe(false);

    expect(tocaNudgeAgendaLaboral({
      linkEnviadoEn: enviado,
      ahoraMs: due.getTime() - 1,
      hayAgendamiento: false,
    })).toBe(false);

    expect(tocaNudgeAgendaLaboral({
      linkEnviadoEn: enviado,
      ahoraMs: due.getTime(),
      hayAgendamiento: false,
    })).toBe(true);

    // Sábado a la misma hora wall-clock: no (fuera de laboral)
    const sabado = new Date(2026, 7, 22, 13, 0, 0);
    expect(esDentroHorarioLaboral(sabado)).toBe(false);
    expect(msHastaNudgeAgendaLaboral(enviado, lunes10.getTime())).toBe(3 * 3600000);
  });

  it('hayAgendamientoConfirmado y copy del nudge', () => {
    expect(hayAgendamientoConfirmado(null)).toBe(false);
    expect(hayAgendamientoConfirmado({ estado: 'prospectos', fecha: null })).toBe(false);
    expect(hayAgendamientoConfirmado({ estado: 'agendado', fecha: new Date() })).toBe(true);
    expect(hayAgendamientoConfirmado({ estado: 'en_ruta', fecha: new Date() })).toBe(true);
    const msg = mensajeNudgeAgendaAutomatico({ nombre: 'Diego' });
    expect(msg).toMatch(/Diego/);
    expect(esMensajeNudgeAgendaAutomatico(msg)).toBe(true);
  });
});
