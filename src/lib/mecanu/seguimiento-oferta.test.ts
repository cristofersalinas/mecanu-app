import { describe, expect, it } from 'vitest';
import {
  intencionRespuestaCliente, modoContactoOferta, renderSeguimiento, sugerirRespuesta, ultimaEntradaCliente,
  type DatosCitaOferta,
} from './seguimiento-oferta';

const valores: DatosCitaOferta = {
  nombre: 'Ana',
  pendientes: 'el pulido de faros',
  sugeridos: 'el cambio de escobillas',
  vehiculo: 'Seat León',
  matricula: '1234 ABC',
  importe: '284,50 €',
};

describe('modoContactoOferta', () => {
  it('sin hilo y sin enviar es el primer recordatorio', () => {
    expect(modoContactoOferta({ estadoCampana: 'valorada', mensajes: [] })).toBe('primer_envio');
  });

  it('enviada o con salida, cliente en silencio, es seguimiento', () => {
    expect(modoContactoOferta({
      estadoCampana: 'enviada',
      mensajes: [{ dir: 'out', texto: 'Hola Ana. Ya es momento…' }],
    })).toBe('seguimiento');
    expect(modoContactoOferta({ estadoCampana: 'enviada', mensajes: [] })).toBe('seguimiento');
  });

  it('si el último mensaje es del cliente, hay que responder', () => {
    expect(modoContactoOferta({
      estadoCampana: 'enviada',
      mensajes: [
        { dir: 'out' },
        { dir: 'in', texto: '¿Cuánto tardaría?' },
      ],
    })).toBe('responder');
  });

  it('si ya contestamos, no hay deber de seguimiento', () => {
    expect(modoContactoOferta({
      estadoCampana: 'enviada',
      mensajes: [
        { dir: 'out' },
        { dir: 'in', texto: '¿El traslado va incluido?' },
        { dir: 'out', texto: 'Sí, el importe lleva traslado.' },
      ],
    })).toBe('al_dia');
  });
});

describe('intencionRespuestaCliente', () => {
  it('clasifica acepta, pregunta, pospone, rechaza y baja', () => {
    expect(intencionRespuestaCliente('SÍ, me viene bien')).toBe('acepta');
    expect(intencionRespuestaCliente('¿El presupuesto incluye el traslado?')).toBe('pregunta');
    expect(intencionRespuestaCliente('Lo dejo para más adelante')).toBe('pospone');
    expect(intencionRespuestaCliente('No me interesa')).toBe('rechaza');
    expect(intencionRespuestaCliente('BAJA')).toBe('baja');
  });
});

describe('textos', () => {
  it('el seguimiento cita importe y servicios, no el recordatorio original', () => {
    const t = renderSeguimiento(valores);
    expect(t).toMatch(/Te escribimos sobre el pulido de faros/);
    expect(t).toMatch(/284,50 €/);
    expect(t).not.toMatch(/Ya es momento de realizar/);
    expect(t).not.toMatch(/👋/);
  });

  it('la respuesta sugerida cubre la pregunta con el mismo presupuesto', () => {
    const t = sugerirRespuesta('pregunta', valores);
    expect(t).toMatch(/284,50 €/);
    expect(t).toMatch(/el pulido de faros/);
  });

  it('baja no sugiere texto: no se le vuelve a escribir', () => {
    expect(sugerirRespuesta('baja', valores)).toBe('');
  });

  it('ultimaEntradaCliente ignora el hilo saliente', () => {
    expect(ultimaEntradaCliente([
      { dir: 'out', texto: 'recordatorio' },
      { dir: 'in', texto: '¿Cuánto?' },
      { dir: 'out', texto: 'te contesto' },
    ])).toBe('¿Cuánto?');
  });
});
