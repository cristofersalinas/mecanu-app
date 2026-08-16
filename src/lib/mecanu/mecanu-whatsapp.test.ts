import { describe, it, expect } from 'vitest';
import {
  renderMensaje, estadoVentana, valoresOportunidad, enumerar, e164, fmtTel, VENTANA_MS,
} from './mecanu-whatsapp';
import { CAMPANAS } from './mecanu-rutas';

describe('Ventana de servicio de WhatsApp: 24h desde el último mensaje del cliente', () => {
  it('sin conversación previa, la ventana está cerrada (nunca se asume abierta)', () => {
    const estado = estadoVentana(null);
    expect(estado.abierta).toBe(false);
  });

  it('un mensaje de hace 1 minuto deja la ventana abierta', () => {
    const haceUnMinuto = new Date(Date.now() - 60_000);
    const estado = estadoVentana(haceUnMinuto);
    expect(estado.abierta).toBe(true);
  });

  it('un mensaje de hace 25 horas deja la ventana cerrada', () => {
    const hace25h = new Date(Date.now() - VENTANA_MS - 3_600_000);
    const estado = estadoVentana(hace25h);
    expect(estado.abierta).toBe(false);
  });
});

describe('Enumerar servicios en el mensaje: "A, B y C", nunca una coma colgando', () => {
  it('una lista vacía da string vacío', () => {
    expect(enumerar([])).toBe('');
  });

  it('un solo elemento se devuelve tal cual', () => {
    expect(enumerar(['el cambio de aceite'])).toBe('el cambio de aceite');
  });

  it('dos o más elementos usan "y" antes del último, comas entre el resto', () => {
    expect(enumerar(['A', 'B', 'C'])).toBe('A, B y C');
  });
});

describe('Teléfono en formato E.164 para la API real de WhatsApp', () => {
  it('un móvil español de 9 dígitos se antepone con +34', () => {
    expect(e164('655 111 222')).toBe('+34655111222');
  });

  it('sin teléfono, no hay nada que formatear', () => {
    expect(e164(null)).toBeNull();
  });

  it('fmtTel muestra el formato legible pero la API siempre recibe el E.164 sin espacios', () => {
    expect(fmtTel('655 111 222')).toBe('+34 655 111 222');
  });
});

describe('El mensaje de recordatorio se rellena con los datos reales de la campaña, nunca con {{holes}} sin resolver', () => {
  it('una campaña real produce un mensaje sin placeholders sin rellenar', () => {
    const campana = CAMPANAS[0];
    const seleccion = campana.items.map((it) => it.id);
    const valores = valoresOportunidad(campana, seleccion);
    const mensaje = renderMensaje(valores);
    expect(mensaje).not.toMatch(/\{\{\w+\}\}/);
  });

  it('el importe en el mensaje siempre lleva el símbolo €', () => {
    const campana = CAMPANAS[0];
    const seleccion = campana.items.map((it) => it.id);
    const valores = valoresOportunidad(campana, seleccion);
    expect(valores.importe).toMatch(/€/);
  });
});
