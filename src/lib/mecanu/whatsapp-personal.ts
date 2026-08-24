/**
 * WhatsApp personal embebido en el panel (QR + bandeja propios).
 * El protocolo vive en `scripts/whatsapp-sesion-bridge.ts` (Baileys).
 * Meta bloquea iframe de web.whatsapp.com; no se abre esa URL.
 *
 * Repo: https://github.com/WhiskeySockets/Baileys
 */
import { getSupabaseServer } from '@/lib/supabase/server';
import { e164 } from './mecanu-whatsapp';
import {
  conversacionIdDeJid,
  digitosEmparejarWhatsApp,
  jidDeTelefono,
  puenteActivo,
  puenteArrancar,
  puenteCerrar,
  puenteEnviar,
  puenteEstado,
  puenteMensajes,
  puentePedirCodigo,
  type ChatBridge,
  type MensajeBridge,
} from './whatsapp-bridge';

/** Contacto de prueba sembrado (fundador) para la bandeja sin depender del sync. */
export const WA_DEMO_CONTACTO = {
  telefono: '+56 9 4508 8077',
  nombre: 'Cristofer',
  clienteId: 'c15',
  jid: '56945088077@s.whatsapp.net',
} as const;

export const MAX_SESIONES_WHATSAPP = 5;

export type EstadoSesionWa = 'pendiente' | 'activa' | 'desconectada';

export interface SesionWaPersonal {
  id: string;
  tallerId: string;
  etiqueta: string;
  estado: EstadoSesionWa;
  creadaEn: string;
  ultimaActividad: string;
  qrDataUrl?: string | null;
  pairingCode?: string | null;
  errorPuente?: string | null;
}

export interface ConversacionWaPersonal {
  id: string;
  tallerId: string;
  sesionId: string | null;
  clienteId: string | null;
  nombre: string;
  telefono: string;
  actualizadoEn: string;
  ultimoTexto: string | null;
  jid?: string | null;
}

export interface MensajeWaPersonal {
  id: string;
  conversacionId: string;
  direccion: 'salida' | 'entrada';
  texto: string;
  ts: string;
}

type MemStore = {
  sesiones: SesionWaPersonal[];
  conversaciones: ConversacionWaPersonal[];
  mensajes: MensajeWaPersonal[];
};

const memByTaller = new Map<string, MemStore>();

function store(tallerId: string): MemStore {
  let s = memByTaller.get(tallerId);
  if (!s) {
    s = { sesiones: [], conversaciones: [], mensajes: [] };
    memByTaller.set(tallerId, s);
  }
  asegurarDemoContacto(s, tallerId);
  return s;
}

function asegurarDemoContacto(s: MemStore, tallerId: string): void {
  // Solo el taller demo del panel; los tests usan otros ids.
  if (tallerId !== 'taller-rodriguez') return;
  const id = conversacionIdDeJid(WA_DEMO_CONTACTO.jid);
  const prev = s.conversaciones.find((c) => c.id === id || telefonosDemo(c.telefono));
  if (prev) {
    prev.clienteId = prev.clienteId ?? WA_DEMO_CONTACTO.clienteId;
    prev.jid = prev.jid || WA_DEMO_CONTACTO.jid;
    if (!prev.nombre || /^\d+$/.test(prev.nombre.replace(/\D/g, ''))) {
      prev.nombre = WA_DEMO_CONTACTO.nombre;
    }
    return;
  }
  const ahora = new Date().toISOString();
  s.conversaciones.push({
    id,
    tallerId,
    sesionId: null,
    clienteId: WA_DEMO_CONTACTO.clienteId,
    nombre: WA_DEMO_CONTACTO.nombre,
    telefono: WA_DEMO_CONTACTO.telefono,
    actualizadoEn: ahora,
    ultimoTexto: 'Chat de prueba — escríbete desde este número',
    jid: WA_DEMO_CONTACTO.jid,
  });
}

/** Garantiza a Cristofer en la lista aunque Supabase/el puente aún no lo traigan. */
function fusionarDemoContacto(
  tallerId: string,
  lista: ConversacionWaPersonal[],
): ConversacionWaPersonal[] {
  if (tallerId !== 'taller-rodriguez') return lista;
  const id = conversacionIdDeJid(WA_DEMO_CONTACTO.jid);
  const idx = lista.findIndex((c) => c.id === id || telefonosDemo(c.telefono));
  if (idx >= 0) {
    const c = lista[idx]!;
    const patched: ConversacionWaPersonal = {
      ...c,
      clienteId: c.clienteId ?? WA_DEMO_CONTACTO.clienteId,
      jid: c.jid || WA_DEMO_CONTACTO.jid,
      telefono: c.telefono || WA_DEMO_CONTACTO.telefono,
      nombre:
        !c.nombre || /^\d+$/.test(c.nombre.replace(/\D/g, ''))
          ? WA_DEMO_CONTACTO.nombre
          : c.nombre,
    };
    const rest = lista.filter((_, i) => i !== idx);
    return [patched, ...rest];
  }
  const ahora = new Date().toISOString();
  return [
    {
      id,
      tallerId,
      sesionId: null,
      clienteId: WA_DEMO_CONTACTO.clienteId,
      nombre: WA_DEMO_CONTACTO.nombre,
      telefono: WA_DEMO_CONTACTO.telefono,
      actualizadoEn: ahora,
      ultimoTexto: 'Chat de prueba — escríbete desde este número',
      jid: WA_DEMO_CONTACTO.jid,
    },
    ...lista,
  ];
}

function telefonosDemo(tel: string): boolean {
  const d = tel.replace(/\D/g, '');
  return d.endsWith('945088077') || d.includes('56945088077');
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function useDb(): boolean {
  return !!getSupabaseServer() && process.env.MECANU_USE_SUPABASE === '1';
}

function isMissingTable(err: { message?: string } | null): boolean {
  const m = err?.message ?? '';
  return /does not exist|Could not find the table|schema cache/i.test(m);
}

function puenteEnEsteProceso(): boolean {
  return process.env.VITEST !== 'true' && process.env.MECANU_WA_BRIDGE !== '0';
}

export function waMeUrl(telefono: string, texto?: string): string | null {
  const e = e164(telefono);
  if (!e) return null;
  const digits = e.replace(/\D/g, '');
  const base = `https://wa.me/${digits}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

export function sesionesActivasCount(sesiones: SesionWaPersonal[]): number {
  return sesiones.filter((s) => s.estado === 'pendiente' || s.estado === 'activa').length;
}

function mapSesion(row: Record<string, unknown>): SesionWaPersonal {
  return {
    id: String(row.id),
    tallerId: String(row.taller_id),
    etiqueta: String(row.etiqueta),
    estado: row.estado as EstadoSesionWa,
    creadaEn: String(row.creada_en),
    ultimaActividad: String(row.ultima_actividad),
  };
}

export async function listarSesiones(tallerId: string): Promise<SesionWaPersonal[]> {
  if (!useDb()) {
    return [...store(tallerId).sesiones].sort(
      (a, b) => b.ultimaActividad.localeCompare(a.ultimaActividad),
    );
  }
  const sb = getSupabaseServer()!;
  const { data, error } = await sb
    .from('whatsapp_sesiones')
    .select('*')
    .eq('taller_id', tallerId)
    .order('ultima_actividad', { ascending: false });
  if (error) {
    if (isMissingTable(error)) {
      return [...store(tallerId).sesiones].sort(
        (a, b) => b.ultimaActividad.localeCompare(a.ultimaActividad),
      );
    }
    throw new Error(error.message);
  }
  return (data ?? []).map((r) => mapSesion(r));
}

export async function crearSesion(
  tallerId: string,
  etiqueta?: string,
): Promise<SesionWaPersonal> {
  const existentes = await listarSesiones(tallerId);
  if (sesionesActivasCount(existentes) >= MAX_SESIONES_WHATSAPP) {
    throw new Error(`Máximo ${MAX_SESIONES_WHATSAPP} sesiones de WhatsApp por taller`);
  }
  const ahora = new Date().toISOString();
  const n = existentes.filter((s) => s.estado !== 'desconectada').length + 1;
  const sesion: SesionWaPersonal = {
    id: newId('was'),
    tallerId,
    etiqueta: (etiqueta?.trim() || `WhatsApp ${n}`).slice(0, 80),
    estado: 'pendiente',
    creadaEn: ahora,
    ultimaActividad: ahora,
  };

  if (!useDb()) {
    store(tallerId).sesiones.push(sesion);
    await arrancarPuente(sesion);
    return sesion;
  }

  const sb = getSupabaseServer()!;
  const { error } = await sb.from('whatsapp_sesiones').insert({
    id: sesion.id,
    taller_id: tallerId,
    etiqueta: sesion.etiqueta,
    estado: sesion.estado,
    creada_en: ahora,
    ultima_actividad: ahora,
  });
  if (error) {
    if (isMissingTable(error)) {
      store(tallerId).sesiones.push(sesion);
      await arrancarPuente(sesion);
      return sesion;
    }
    throw new Error(error.message);
  }
  await arrancarPuente(sesion);
  return sesion;
}

async function arrancarPuente(sesion: SesionWaPersonal): Promise<void> {
  if (!puenteEnEsteProceso()) return;
  try {
    const live = await puenteArrancar(sesion.id, { desde: sesion.creadaEn });
    aplicarLive(sesion, live);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'puente';
    if (/Máximo 5/i.test(msg)) throw e;
    sesion.errorPuente = msg;
  }
}

function aplicarLive(
  sesion: SesionWaPersonal,
  live: {
    estado: string;
    qrDataUrl: string | null;
    pairingCode?: string | null;
    error: string | null;
  },
): void {
  sesion.qrDataUrl = live.qrDataUrl;
  sesion.pairingCode = live.pairingCode ?? sesion.pairingCode ?? null;
  sesion.errorPuente = live.error;
  if (live.estado === 'open') {
    sesion.estado = 'activa';
    sesion.qrDataUrl = null;
    sesion.pairingCode = null;
  }
  // Tras escanear, Baileys pasa por idle/error «Reiniciando…» antes de open.
  if (live.estado === 'idle' && live.error && /Reiniciando|Reintentando|caducó/i.test(live.error)) {
    sesion.qrDataUrl = null;
  }
}

export async function pedirCodigoEmparejamiento(
  tallerId: string,
  sesionId: string,
  telefono: string,
): Promise<SesionWaPersonal> {
  const sesiones = await listarSesiones(tallerId);
  const sesion = sesiones.find((s) => s.id === sesionId);
  if (!sesion || sesion.tallerId !== tallerId) throw new Error('Sesión no encontrada');
  const digits = digitosEmparejarWhatsApp(telefono);
  if (!digits) {
    throw new Error('Teléfono inválido. Incluye prefijo de país (ej. 34655111222).');
  }
  if (!puenteEnEsteProceso()) {
    throw new Error('Arranca el puente: npm run wa:bridge');
  }
  await arrancarPuente(sesion);
  const live = await puentePedirCodigo(sesion.id, digits);
  aplicarLive(sesion, live);
  sesion.pairingCode = live.pairingCode ?? null;
  return sesion;
}

function aplicarChatsMem(tallerId: string, sesionId: string, chats: ChatBridge[]): void {
  const s = store(tallerId);
  for (const ch of chats) {
    const id = conversacionIdDeJid(ch.jid);
    const esDemo = telefonosDemo(ch.telefono) || telefonosDemo(ch.jid);
    const prev = s.conversaciones.find(
      (c) => c.id === id || (esDemo && telefonosDemo(c.telefono)),
    );
    if (prev) {
      // No pisar ficha demo / nombre útil con basura del puente.
      if (ch.nombre && !/^\d+$/.test(ch.nombre.replace(/\D/g, ''))) {
        prev.nombre = ch.nombre;
      }
      prev.telefono = ch.telefono || prev.telefono;
      prev.ultimoTexto = ch.ultimoTexto ?? prev.ultimoTexto;
      prev.actualizadoEn = ch.actualizadoEn;
      prev.sesionId = sesionId;
      prev.jid = ch.jid.endsWith('@s.whatsapp.net') ? ch.jid : prev.jid || ch.jid;
      if (esDemo) prev.clienteId = prev.clienteId ?? WA_DEMO_CONTACTO.clienteId;
    } else {
      s.conversaciones.push({
        id: esDemo ? conversacionIdDeJid(WA_DEMO_CONTACTO.jid) : id,
        tallerId,
        sesionId,
        clienteId: esDemo ? WA_DEMO_CONTACTO.clienteId : null,
        nombre: esDemo
          ? ch.nombre && !/^\d+$/.test(ch.nombre.replace(/\D/g, ''))
            ? ch.nombre
            : WA_DEMO_CONTACTO.nombre
          : ch.nombre,
        telefono: ch.telefono || (esDemo ? WA_DEMO_CONTACTO.telefono : ''),
        actualizadoEn: ch.actualizadoEn,
        ultimoTexto: ch.ultimoTexto,
        jid: esDemo ? WA_DEMO_CONTACTO.jid : ch.jid,
      });
    }
  }
  asegurarDemoContacto(s, tallerId);
}

async function aplicarChatsDb(
  tallerId: string,
  sesionId: string,
  chats: ChatBridge[],
): Promise<void> {
  const sb = getSupabaseServer();
  if (!sb) return;
  if (!chats.length && tallerId !== 'taller-rodriguez') return;
  const rows = chats.map((ch) => {
    const esDemo = telefonosDemo(ch.telefono) || telefonosDemo(ch.jid);
    return {
      id: esDemo ? conversacionIdDeJid(WA_DEMO_CONTACTO.jid) : conversacionIdDeJid(ch.jid),
      taller_id: tallerId,
      sesion_id: sesionId,
      cliente_id: esDemo ? WA_DEMO_CONTACTO.clienteId : null,
      nombre: esDemo
        ? ch.nombre && !/^\d+$/.test(ch.nombre.replace(/\D/g, ''))
          ? ch.nombre
          : WA_DEMO_CONTACTO.nombre
        : ch.nombre,
      telefono:
        ch.telefono ||
        (esDemo ? WA_DEMO_CONTACTO.telefono : conversacionIdDeJid(ch.jid).replace('wac-jid-', '')),
      actualizado_en: ch.actualizadoEn,
    };
  });
  // Asegura fila demo aunque el puente no traiga ese chat aún.
  if (tallerId === 'taller-rodriguez' && !rows.some((r) => telefonosDemo(String(r.telefono)))) {
    rows.unshift({
      id: conversacionIdDeJid(WA_DEMO_CONTACTO.jid),
      taller_id: tallerId,
      sesion_id: sesionId,
      cliente_id: WA_DEMO_CONTACTO.clienteId,
      nombre: WA_DEMO_CONTACTO.nombre,
      telefono: WA_DEMO_CONTACTO.telefono,
      actualizado_en: new Date().toISOString(),
    });
  }
  const { error } = await sb.from('whatsapp_conversaciones').upsert(rows);
  if (error) {
    if (isMissingTable(error)) return;
    throw new Error(error.message);
  }
  // No volcamos previews como mensajes: el historial llega del puente (solo post-integración).
}

async function aplicarChats(
  tallerId: string,
  sesionId: string,
  chats: ChatBridge[],
): Promise<void> {
  aplicarChatsMem(tallerId, sesionId, chats);
  if (useDb()) {
    try {
      await aplicarChatsDb(tallerId, sesionId, chats);
    } catch (e) {
      if (!(e instanceof Error && isMissingTable(e))) throw e;
    }
  }
}

export async function sincronizarSesionesConPuente(tallerId: string): Promise<{
  bridgeUp: boolean;
  sesiones: SesionWaPersonal[];
}> {
  const sesiones = await listarSesiones(tallerId);
  if (!puenteEnEsteProceso()) return { bridgeUp: false, sesiones };

  const bridgeUp = await puenteActivo();
  if (!bridgeUp) return { bridgeUp, sesiones };

  for (const sesion of sesiones) {
    if (sesion.estado === 'desconectada') continue;
    let live = await puenteEstado(sesion.id);
    if (!live && sesion.estado === 'pendiente') {
      try {
        live = await puenteArrancar(sesion.id);
      } catch (e) {
        sesion.errorPuente = e instanceof Error ? e.message : 'puente';
        continue;
      }
    }
    if (!live) continue;
    const eraActiva = sesion.estado === 'activa';
    aplicarLive(sesion, live);
    if (live.estado === 'open') {
      if (!eraActiva) {
        await confirmarSesion(tallerId, sesion.id);
      }
      sesion.estado = 'activa';
      await aplicarChats(tallerId, sesion.id, live.chats);
    } else if (live.estado === 'close' || live.estado === 'error') {
      if (eraActiva) sesion.estado = 'pendiente';
    }
  }
  return { bridgeUp, sesiones };
}

export async function confirmarSesion(
  tallerId: string,
  sesionId: string,
): Promise<SesionWaPersonal> {
  const ahora = new Date().toISOString();
  if (!useDb()) {
    const s = store(tallerId).sesiones.find((x) => x.id === sesionId);
    if (!s || s.tallerId !== tallerId) throw new Error('Sesión no encontrada');
    s.estado = 'activa';
    s.ultimaActividad = ahora;
    s.qrDataUrl = null;
    return s;
  }
  const sb = getSupabaseServer()!;
  const { data, error } = await sb
    .from('whatsapp_sesiones')
    .update({ estado: 'activa', ultima_actividad: ahora })
    .eq('id', sesionId)
    .eq('taller_id', tallerId)
    .select('*')
    .maybeSingle();
  if (error) {
    if (isMissingTable(error)) {
      const s = store(tallerId).sesiones.find((x) => x.id === sesionId);
      if (!s) throw new Error('Sesión no encontrada');
      s.estado = 'activa';
      s.ultimaActividad = ahora;
      s.qrDataUrl = null;
      return s;
    }
    throw new Error(error.message);
  }
  if (!data) throw new Error('Sesión no encontrada');
  return mapSesion(data);
}

export async function desconectarSesion(
  tallerId: string,
  sesionId: string,
): Promise<SesionWaPersonal> {
  if (puenteEnEsteProceso()) {
    await puenteCerrar(sesionId);
  }
  const ahora = new Date().toISOString();
  if (!useDb()) {
    const s = store(tallerId).sesiones.find((x) => x.id === sesionId);
    if (!s || s.tallerId !== tallerId) throw new Error('Sesión no encontrada');
    s.estado = 'desconectada';
    s.ultimaActividad = ahora;
    s.qrDataUrl = null;
    return s;
  }
  const sb = getSupabaseServer()!;
  const { data, error } = await sb
    .from('whatsapp_sesiones')
    .update({ estado: 'desconectada', ultima_actividad: ahora })
    .eq('id', sesionId)
    .eq('taller_id', tallerId)
    .select('*')
    .maybeSingle();
  if (error) {
    if (isMissingTable(error)) {
      const s = store(tallerId).sesiones.find((x) => x.id === sesionId);
      if (!s) throw new Error('Sesión no encontrada');
      s.estado = 'desconectada';
      s.ultimaActividad = ahora;
      s.qrDataUrl = null;
      return s;
    }
    throw new Error(error.message);
  }
  if (!data) throw new Error('Sesión no encontrada');
  return mapSesion(data);
}

function jidDeConv(c: ConversacionWaPersonal): string | null {
  return c.jid || jidDeTelefono(c.telefono);
}

export async function listarConversaciones(tallerId: string): Promise<ConversacionWaPersonal[]> {
  if (!useDb()) {
    const s = store(tallerId);
    const mem = [...s.conversaciones]
      .map((c) => {
        const last = s.mensajes
          .filter((m) => m.conversacionId === c.id)
          .sort((a, b) => b.ts.localeCompare(a.ts))[0];
        return { ...c, ultimoTexto: last?.texto ?? c.ultimoTexto };
      })
      .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn));
    return fusionarDemoContacto(tallerId, mem);
  }
  const sb = getSupabaseServer()!;
  const { data, error } = await sb
    .from('whatsapp_conversaciones')
    .select('*')
    .eq('taller_id', tallerId)
    .order('actualizado_en', { ascending: false });
  if (error) {
    if (isMissingTable(error)) {
      return fusionarDemoContacto(tallerId, listarConversacionesMem(tallerId));
    }
    throw new Error(error.message);
  }
  const out: ConversacionWaPersonal[] = [];
  for (const row of data ?? []) {
    const { data: msgs } = await sb
      .from('whatsapp_mensajes')
      .select('texto')
      .eq('conversacion_id', row.id)
      .order('ts', { ascending: false })
      .limit(1);
    const telefono = String(row.telefono);
    out.push({
      id: String(row.id),
      tallerId: String(row.taller_id),
      sesionId: row.sesion_id == null ? null : String(row.sesion_id),
      clienteId: row.cliente_id == null ? null : String(row.cliente_id),
      nombre: String(row.nombre),
      telefono,
      actualizadoEn: String(row.actualizado_en),
      ultimoTexto: msgs?.[0] ? String(msgs[0].texto) : null,
      jid: jidDeTelefono(telefono),
    });
  }
  return fusionarDemoContacto(tallerId, out);
}

function listarConversacionesMem(tallerId: string): ConversacionWaPersonal[] {
  const s = store(tallerId);
  return [...s.conversaciones]
    .map((c) => {
      const last = s.mensajes
        .filter((m) => m.conversacionId === c.id)
        .sort((a, b) => b.ts.localeCompare(a.ts))[0];
      return { ...c, ultimoTexto: last?.texto ?? c.ultimoTexto };
    })
    .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn));
}

function fusionarMensajes(
  conversacionId: string,
  local: MensajeWaPersonal[],
  remote: MensajeBridge[],
): MensajeWaPersonal[] {
  const map = new Map<string, MensajeWaPersonal>();
  for (const m of local) map.set(m.id, m);
  for (const m of remote) {
    map.set(m.id, {
      id: m.id,
      conversacionId,
      direccion: m.direccion,
      texto: m.texto,
      ts: m.ts,
    });
  }
  return [...map.values()].sort((a, b) => a.ts.localeCompare(b.ts));
}

async function conversacionDe(
  tallerId: string,
  conversacionId: string,
): Promise<ConversacionWaPersonal | null> {
  const mem = store(tallerId).conversaciones.find((c) => c.id === conversacionId);
  if (mem) return mem;
  const todas = await listarConversaciones(tallerId);
  return todas.find((c) => c.id === conversacionId) ?? null;
}

export async function listarMensajes(
  tallerId: string,
  conversacionId: string,
): Promise<MensajeWaPersonal[]> {
  let local: MensajeWaPersonal[] = [];
  if (!useDb()) {
    const s = store(tallerId);
    const conv = s.conversaciones.find((c) => c.id === conversacionId);
    if (!conv) throw new Error('Conversación no encontrada');
    local = s.mensajes
      .filter((m) => m.conversacionId === conversacionId)
      .sort((a, b) => a.ts.localeCompare(b.ts));
    return fusionarConPuente(conv, local);
  }
  const sb = getSupabaseServer()!;
  const { data: convRow, error: cErr } = await sb
    .from('whatsapp_conversaciones')
    .select('*')
    .eq('id', conversacionId)
    .eq('taller_id', tallerId)
    .maybeSingle();
  if (cErr) throw new Error(cErr.message);
  if (!convRow) throw new Error('Conversación no encontrada');
  const { data, error } = await sb
    .from('whatsapp_mensajes')
    .select('*')
    .eq('conversacion_id', conversacionId)
    .order('ts', { ascending: true });
  if (error) throw new Error(error.message);
  local = (data ?? []).map((r) => ({
    id: String(r.id),
    conversacionId: String(r.conversacion_id),
    direccion: r.direccion as 'salida' | 'entrada',
    texto: String(r.texto),
    ts: String(r.ts),
  }));
  const conv: ConversacionWaPersonal = {
    id: String(convRow.id),
    tallerId: String(convRow.taller_id),
    sesionId: convRow.sesion_id == null ? null : String(convRow.sesion_id),
    clienteId: convRow.cliente_id == null ? null : String(convRow.cliente_id),
    nombre: String(convRow.nombre),
    telefono: String(convRow.telefono),
    actualizadoEn: String(convRow.actualizado_en),
    ultimoTexto: null,
    jid: jidDeTelefono(String(convRow.telefono)),
  };
  return fusionarConPuente(conv, local);
}

async function fusionarConPuente(
  conv: ConversacionWaPersonal,
  local: MensajeWaPersonal[],
): Promise<MensajeWaPersonal[]> {
  if (!puenteEnEsteProceso() || !conv.sesionId) return local;
  const jid = jidDeConv(conv);
  if (!jid) return local;
  const remote = await puenteMensajes(conv.sesionId, jid);
  return fusionarMensajes(conv.id, local, remote);
}

export async function enviarMensaje(
  tallerId: string,
  conversacionId: string,
  texto: string,
): Promise<MensajeWaPersonal> {
  const body = texto.trim();
  if (!body) throw new Error('Escribe un mensaje');
  if (body.length > 4096) throw new Error('Mensaje demasiado largo');
  const ahora = new Date().toISOString();
  const msg: MensajeWaPersonal = {
    id: newId('wam'),
    conversacionId,
    direccion: 'salida',
    texto: body,
    ts: ahora,
  };

  const conv = await conversacionDe(tallerId, conversacionId);
  if (!conv) throw new Error('Conversación no encontrada');

  if (puenteEnEsteProceso()) {
    const jid = jidDeConv(conv);
    if (conv.sesionId && jid) {
      await puenteEnviar(conv.sesionId, jid, body);
    }
  }

  if (!useDb()) {
    const s = store(tallerId);
    s.mensajes.push(msg);
    conv.actualizadoEn = ahora;
    conv.ultimoTexto = body;
    return msg;
  }

  const sb = getSupabaseServer()!;
  const { error } = await sb.from('whatsapp_mensajes').insert({
    id: msg.id,
    conversacion_id: conversacionId,
    direccion: 'salida',
    texto: body,
    ts: ahora,
  });
  if (error) throw new Error(error.message);
  await sb
    .from('whatsapp_conversaciones')
    .update({ actualizado_en: ahora })
    .eq('id', conversacionId);
  return msg;
}

/** Solo tests. */
export function resetWhatsappPersonalMemForTests(): void {
  memByTaller.clear();
}

/** Solo tests: conversación en memoria para probar el envío sin puente. */
export function insertarConversacionMemForTests(
  tallerId: string,
  extra?: Partial<ConversacionWaPersonal>,
): ConversacionWaPersonal {
  const c: ConversacionWaPersonal = {
    id: extra?.id ?? 'wac-test-1',
    tallerId,
    sesionId: extra?.sesionId ?? null,
    clienteId: extra?.clienteId ?? null,
    nombre: extra?.nombre ?? 'Prueba',
    telefono: extra?.telefono ?? '+34655111222',
    actualizadoEn: extra?.actualizadoEn ?? new Date().toISOString(),
    ultimoTexto: extra?.ultimoTexto ?? null,
    jid: extra?.jid ?? jidDeTelefono(extra?.telefono ?? '+34655111222'),
  };
  store(tallerId).conversaciones.push(c);
  return c;
}
