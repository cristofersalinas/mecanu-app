import { describe, expect, it, beforeEach } from 'vitest';
import {
  MAX_SESIONES_WHATSAPP,
  confirmarSesion,
  crearSesion,
  desconectarSesion,
  enviarMensaje,
  insertarConversacionMemForTests,
  listarConversaciones,
  listarMensajes,
  listarSesiones,
  resetWhatsappPersonalMemForTests,
  sesionesActivasCount,
  sincronizarSesionesConPuente,
  waMeUrl,
} from './whatsapp-personal';

describe('whatsapp-personal (memoria)', () => {
  beforeEach(() => {
    resetWhatsappPersonalMemForTests();
  });

  it('tope de 5 sesiones activas o pendientes', async () => {
    const t = 'taller-test-wa';
    for (let i = 0; i < MAX_SESIONES_WHATSAPP; i++) {
      await crearSesion(t, `S${i + 1}`);
    }
    await expect(crearSesion(t)).rejects.toThrow(/Máximo 5/);
    expect(sesionesActivasCount(await listarSesiones(t))).toBe(5);
  });

  it('desconectar libera cupo', async () => {
    const t = 'taller-test-wa-2';
    const a = await crearSesion(t, 'A');
    await desconectarSesion(t, a.id);
    const b = await crearSesion(t, 'B');
    expect(b.etiqueta).toBe('B');
  });

  it('confirmar marca activa y no inventa chats', async () => {
    const t = 'taller-test-wa-3';
    const s = await crearSesion(t);
    const activa = await confirmarSesion(t, s.id);
    expect(activa.estado).toBe('activa');
    expect(await listarConversaciones(t)).toEqual([]);
  });

  it('enviar escribe en la bandeja propia', async () => {
    const t = 'taller-test-wa-4';
    insertarConversacionMemForTests(t);
    const enviado = await enviarMensaje(t, 'wac-test-1', 'Hola de prueba');
    expect(enviado.direccion).toBe('salida');
    expect(enviado.texto).toBe('Hola de prueba');
    const msgs = await listarMensajes(t, 'wac-test-1');
    expect(msgs.some((m) => m.texto === 'Hola de prueba')).toBe(true);
  });

  it('sin puente, sincronizar no cambia el estado', async () => {
    const t = 'taller-test-wa-5';
    await crearSesion(t, 'Local');
    const out = await sincronizarSesionesConPuente(t);
    expect(out.bridgeUp).toBe(false);
    expect(out.sesiones).toHaveLength(1);
    expect(out.sesiones[0].estado).toBe('pendiente');
  });

  it('taller demo incluye a Cristofer aunque no haya sync', async () => {
    const convs = await listarConversaciones('taller-rodriguez');
    expect(convs.some((c) => c.nombre === 'Cristofer' || c.clienteId === 'c15')).toBe(true);
    expect(convs[0]?.telefono.replace(/\D/g, '')).toMatch(/45088077/);
  });

  it('waMeUrl normaliza teléfono ES', () => {
    expect(waMeUrl('655 111 222')).toBe('https://wa.me/34655111222');
  });
});
