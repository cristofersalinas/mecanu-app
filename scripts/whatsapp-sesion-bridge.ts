#!/usr/bin/env node
/**
 * Puente WhatsApp Web embebido (Baileys) — modo ligero.
 * Repo: https://github.com/WhiskeySockets/Baileys
 *
 *   npm run wa:bridge
 *
 * Alcance (a propósito):
 * - Solo chats 1:1 (nada de grupos / newsletters / estados).
 * - Sin historial completo de WhatsApp (poca RAM / CPU).
 * - Mensajes: desde la integración, y como mínimo el último día de chat.
 * - La lista prioriza contactos; el hilo se llena con lo reciente.
 *
 * Corre con Node (`--experimental-strip-types`), no con tsx.
 * Solo 127.0.0.1. Riesgo: protocolo no oficial.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  type WASocket,
} from 'baileys';
import QRCode from 'qrcode';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUTH_DIR = join(ROOT, '.whatsapp-sesiones');
const PORT = Number(process.env.WHATSAPP_BRIDGE_PORT || 3781);
const MAX = 5;
/** Tope por chat 1:1 (último día + post-integración). */
const MAX_MSGS_POR_CHAT = 120;
/** Tope de contactos en la bandeja (los más útiles primero). */
const MAX_CONTACTOS = 300;
/** Siempre conservamos al menos este tramo de conversación. */
const MIN_HISTORIAL_MS = 24 * 60 * 60 * 1000;

type Chat = {
  jid: string;
  nombre: string;
  telefono: string;
  ultimoTexto: string | null;
  actualizadoEn: string;
};

type Msg = {
  id: string;
  jid: string;
  direccion: 'salida' | 'entrada';
  texto: string;
  ts: string;
};

type Slot = {
  id: string;
  estado: 'idle' | 'qr' | 'open' | 'close' | 'error';
  qrDataUrl: string | null;
  /** Código de emparejamiento (alternativa al QR). */
  pairingCode: string | null;
  error: string | null;
  /** ISO: no guardamos mensajes anteriores a esta fecha. */
  desde: string;
  sock: WASocket | null;
  chats: Map<string, Chat>;
  mensajesByJid: Map<string, Msg[]>;
  nombres: Map<string, string>;
  lidToPn: Map<string, string>;
  pnToLid: Map<string, string>;
};

const slots = new Map<string, Slot>();

function metaPath(id: string): string {
  return join(AUTH_DIR, id, 'mecanu-meta.json');
}

function leerDesde(id: string, fallback: string): string {
  try {
    const raw = readFileSync(metaPath(id), 'utf8');
    const j = JSON.parse(raw) as { desde?: string };
    if (typeof j.desde === 'string' && j.desde.length > 8) return j.desde;
  } catch {
    /* */
  }
  return fallback;
}

function guardarDesde(id: string, desde: string) {
  mkdirSync(join(AUTH_DIR, id), { recursive: true });
  writeFileSync(metaPath(id), JSON.stringify({ desde }, null, 2), 'utf8');
}

/** Solo 1:1. Grupos y difusión: fuera (memoria y ruido). */
function esPrivado(jid: string): boolean {
  if (!jid) return false;
  if (jid === 'status@broadcast') return false;
  if (jid.endsWith('@g.us')) return false;
  if (jid.endsWith('@newsletter')) return false;
  if (jid.endsWith('@broadcast')) return false;
  return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@lid');
}

function telefonoDeJid(jid: string): string {
  if (jid.endsWith('@lid')) return '';
  return (jid.split('@')[0] ?? '').replace(/\D/g, '');
}

function userDeJid(jid: string): string {
  return jid.split('@')[0] ?? jid;
}

/** Quita emoji e iconos del nombre (la ficha del taller no los necesita). */
function limpiarNombreWa(nombre: string): string {
  return nombre
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\uFE0F/g, '')
    .replace(/[\u200D\u200B\u2060]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function esNombreUtil(nombre: string | null | undefined, jid: string): boolean {
  const n = limpiarNombreWa(nombre ?? '');
  if (!n) return false;
  const user = userDeJid(jid);
  const tel = telefonoDeJid(jid);
  if (n === user || n === tel || n === jid) return false;
  if (/^\d{8,}$/.test(n.replace(/\D/g, '')) && !/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(n)) return false;
  return true;
}

function tsDeMensaje(raw: unknown): string {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return new Date().toISOString();
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
}

/** Corte efectivo: integración, o hace 24 h si acabas de vincular (el más antiguo). */
function corteVentana(slot: Slot): string {
  const haceMin = new Date(Date.now() - MIN_HISTORIAL_MS).toISOString();
  return slot.desde <= haceMin ? slot.desde : haceMin;
}

function dentroDeVentana(slot: Slot, iso: string): boolean {
  return iso >= corteVentana(slot);
}

function textoMensaje(msg: { message?: unknown } | undefined): string {
  const m = msg?.message as Record<string, unknown> | null | undefined;
  if (!m) return '';
  if (typeof m.conversation === 'string') return m.conversation;
  const ext = m.extendedTextMessage as { text?: string } | undefined;
  if (ext?.text) return ext.text;
  if (m.imageMessage) return '[imagen]';
  if (m.audioMessage) return '[audio]';
  if (m.videoMessage) return '[vídeo]';
  if (m.documentMessage) return '[archivo]';
  if (m.stickerMessage) return '[sticker]';
  return '';
}

function registrarLidPn(slot: Slot, lid: string, pn: string) {
  if (!lid.endsWith('@lid')) lid = `${lid.replace(/@.+$/, '')}@lid`;
  if (!pn.endsWith('@s.whatsapp.net')) {
    const digits = pn.replace(/\D/g, '');
    if (!digits) return;
    pn = `${digits}@s.whatsapp.net`;
  }
  slot.lidToPn.set(lid, pn);
  slot.pnToLid.set(pn, lid);
  const nomLid = slot.nombres.get(lid);
  const nomPn = slot.nombres.get(pn);
  if (nomLid && !nomPn) slot.nombres.set(pn, nomLid);
  if (nomPn && !nomLid) slot.nombres.set(lid, nomPn);
  const chatLid = slot.chats.get(lid);
  if (chatLid) {
    const prev = slot.chats.get(pn);
    slot.chats.set(pn, {
      jid: pn,
      nombre: nombreResuelto(slot, pn, prev?.nombre || chatLid.nombre),
      telefono: telefonoDeJid(pn),
      ultimoTexto: chatLid.ultimoTexto ?? prev?.ultimoTexto ?? null,
      actualizadoEn:
        chatLid.actualizadoEn > (prev?.actualizadoEn ?? '')
          ? chatLid.actualizadoEn
          : (prev?.actualizadoEn ?? chatLid.actualizadoEn),
    });
    slot.chats.delete(lid);
  }
  const msgsLid = slot.mensajesByJid.get(lid);
  if (msgsLid?.length) {
    const dest = slot.mensajesByJid.get(pn) ?? [];
    const seen = new Set(dest.map((m) => m.id));
    for (const m of msgsLid) {
      if (seen.has(m.id)) continue;
      dest.push({ ...m, jid: pn });
    }
    dest.sort((a, b) => a.ts.localeCompare(b.ts));
    if (dest.length > MAX_MSGS_POR_CHAT) dest.splice(0, dest.length - MAX_MSGS_POR_CHAT);
    slot.mensajesByJid.set(pn, dest);
    slot.mensajesByJid.delete(lid);
  }
}

function jidCanonico(slot: Slot, jid: string): string {
  if (jid.endsWith('@lid')) return slot.lidToPn.get(jid) ?? jid;
  return jid;
}

function guardarNombre(slot: Slot, jid: string, nombre: string | null | undefined) {
  if (!esNombreUtil(nombre, jid)) return;
  const n = limpiarNombreWa(nombre as string);
  if (!n) return;
  slot.nombres.set(jid, n);
  const canon = jidCanonico(slot, jid);
  if (canon !== jid) slot.nombres.set(canon, n);
  const lid = slot.pnToLid.get(canon);
  if (lid) slot.nombres.set(lid, n);
}

function nombreResuelto(slot: Slot, jid: string, fallback?: string): string {
  const canon = jidCanonico(slot, jid);
  for (const c of [slot.nombres.get(canon), slot.nombres.get(jid), fallback]) {
    if (c && esNombreUtil(c, canon)) return limpiarNombreWa(c);
  }
  return telefonoDeJid(canon) || userDeJid(canon) || jid;
}

function upsertChat(
  slot: Slot,
  jidRaw: string,
  nombre: string | undefined,
  texto: string | null,
  opts?: { soloContacto?: boolean },
) {
  if (!esPrivado(jidRaw)) return;
  if (nombre) guardarNombre(slot, jidRaw, nombre);
  const jid = jidCanonico(slot, jidRaw);
  const prev = slot.chats.get(jid);
  const tel = telefonoDeJid(jid) || (jid.endsWith('@lid') ? '' : telefonoDeJid(jidRaw));
  const ahora = new Date().toISOString();
  slot.chats.set(jid, {
    jid,
    nombre: nombreResuelto(slot, jid, prev?.nombre),
    telefono: tel || prev?.telefono || '',
    ultimoTexto: opts?.soloContacto
      ? (prev?.ultimoTexto ?? null)
      : (texto ?? prev?.ultimoTexto ?? null),
    actualizadoEn: opts?.soloContacto && prev ? prev.actualizadoEn : ahora,
  });
}

function pushMensaje(slot: Slot, msg: Msg) {
  if (!esPrivado(msg.jid)) return;
  if (!dentroDeVentana(slot, msg.ts)) return;
  const jid = jidCanonico(slot, msg.jid);
  const lista = slot.mensajesByJid.get(jid) ?? [];
  if (lista.some((m) => m.id === msg.id)) return;
  lista.push({ ...msg, jid });
  lista.sort((a, b) => a.ts.localeCompare(b.ts));
  if (lista.length > MAX_MSGS_POR_CHAT) lista.splice(0, lista.length - MAX_MSGS_POR_CHAT);
  slot.mensajesByJid.set(jid, lista);
}

function mensajesDe(slot: Slot, jidQuery: string): Msg[] {
  const canon = jidCanonico(slot, jidQuery);
  const tel = telefonoDeJid(canon) || telefonoDeJid(jidQuery);
  const keys = new Set<string>([jidQuery, canon]);
  if (tel) keys.add(`${tel}@s.whatsapp.net`);
  const lid = slot.pnToLid.get(canon) ?? slot.pnToLid.get(jidQuery);
  if (lid) keys.add(lid);
  const mapped = slot.lidToPn.get(jidQuery);
  if (mapped) keys.add(mapped);

  const out: Msg[] = [];
  const seen = new Set<string>();
  for (const k of keys) {
    for (const m of slot.mensajesByJid.get(k) ?? []) {
      if (!dentroDeVentana(slot, m.ts)) continue;
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      out.push(m);
    }
  }
  if (tel) {
    for (const [k, lista] of slot.mensajesByJid) {
      if (telefonoDeJid(k) !== tel) continue;
      for (const m of lista) {
        if (!dentroDeVentana(slot, m.ts)) continue;
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        out.push(m);
      }
    }
  }
  return out.sort((a, b) => a.ts.localeCompare(b.ts)).slice(-MAX_MSGS_POR_CHAT);
}

function snapshot(slot: Slot) {
  const ranked = [...slot.chats.values()]
    .filter((c) => esPrivado(c.jid))
    .map((c) => {
      const jid = jidCanonico(slot, c.jid);
      const msgs = mensajesDe(slot, jid);
      const last = msgs[msgs.length - 1];
      const nombre = nombreResuelto(slot, jid, c.nombre);
      const tieneNombre = esNombreUtil(nombre, jid);
      const tieneMsg = msgs.length > 0;
      return {
        jid,
        nombre,
        telefono: telefonoDeJid(jid) || c.telefono,
        ultimoTexto: last?.texto ?? null,
        actualizadoEn: last?.ts ?? c.actualizadoEn,
        _score: (tieneMsg ? 4 : 0) + (tieneNombre ? 2 : 0) + (c.telefono ? 1 : 0),
      };
    })
    .filter((c, i, arr) => arr.findIndex((x) => x.jid === c.jid) === i)
    .sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return b.actualizadoEn.localeCompare(a.actualizadoEn);
    })
    .slice(0, MAX_CONTACTOS)
    .map(({ _score: _, ...rest }) => rest);

  return {
    id: slot.id,
    estado: slot.estado,
    qrDataUrl: slot.qrDataUrl,
    pairingCode: slot.pairingCode,
    error: slot.error,
    desde: slot.desde,
    chats: ranked,
  };
}

function aplicarContacto(
  slot: Slot,
  c: {
    id?: string | null;
    name?: string | null;
    notify?: string | null;
    verifiedName?: string | null;
    phoneNumber?: string | null;
  },
) {
  if (!c.id || !esPrivado(c.id)) return;
  const nombre = c.name || c.notify || c.verifiedName || undefined;
  if (c.phoneNumber) {
    const pn = c.phoneNumber.includes('@')
      ? c.phoneNumber
      : `${String(c.phoneNumber).replace(/\D/g, '')}@s.whatsapp.net`;
    if (c.id.endsWith('@lid')) registrarLidPn(slot, c.id, pn);
    guardarNombre(slot, pn, nombre);
    upsertChat(slot, pn, nombre, null, { soloContacto: true });
  }
  guardarNombre(slot, c.id, nombre);
  upsertChat(slot, c.id, nombre, null, { soloContacto: true });
}

function ingerirMensaje(
  slot: Slot,
  m: {
    key: { remoteJid?: string | null; id?: string | null; fromMe?: boolean | null };
    pushName?: string | null;
    messageTimestamp?: unknown;
    message?: unknown;
  },
) {
  const jid = m.key.remoteJid;
  if (!jid || !esPrivado(jid)) return;
  const ts = tsDeMensaje(m.messageTimestamp);
  if (!dentroDeVentana(slot, ts)) return;
  const texto = textoMensaje(m);
  if (m.pushName && !m.key.fromMe) guardarNombre(slot, jid, m.pushName);
  upsertChat(slot, jid, m.pushName ?? undefined, texto || null);
  if (!texto) return;
  pushMensaje(slot, {
    id: m.key.id || `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    jid,
    direccion: m.key.fromMe ? 'salida' : 'entrada',
    texto,
    ts,
  });
}

async function arrancar(id: string, desdeHint?: string): Promise<Slot> {
  let slot = slots.get(id);
  if (slot?.estado === 'open' || slot?.estado === 'qr') {
    if (desdeHint && desdeHint < slot.desde) {
      slot.desde = desdeHint;
      guardarDesde(id, slot.desde);
    }
    return slot;
  }
  const abiertos = [...slots.values()].filter((s) => s.estado === 'qr' || s.estado === 'open').length;
  if (!slot && abiertos >= MAX) {
    throw new Error(`Máximo ${MAX} sesiones de WhatsApp`);
  }

  mkdirSync(join(AUTH_DIR, id), { recursive: true });
  const desdeDefault = desdeHint || new Date().toISOString();
  const desde = existsSync(metaPath(id)) ? leerDesde(id, desdeDefault) : desdeDefault;
  if (!existsSync(metaPath(id))) guardarDesde(id, desde);

  const { state, saveCreds } = await useMultiFileAuthState(join(AUTH_DIR, id));
  const { version } = await fetchLatestBaileysVersion();

  slot = {
    id,
    estado: 'idle',
    qrDataUrl: null,
    pairingCode: slot?.pairingCode ?? null,
    error: null,
    desde,
    sock: null,
    chats: slot?.chats ?? new Map(),
    mensajesByJid: slot?.mensajesByJid ?? new Map(),
    nombres: slot?.nombres ?? new Map(),
    lidToPn: slot?.lidToPn ?? new Map(),
    pnToLid: slot?.pnToLid ?? new Map(),
  };
  slots.set(id, slot);

  const sock = makeWASocket({
    version,
    auth: state,
    browser: Browsers.macOS('Chrome'),
    // No pedir años de historial; sí dejar que Baileys sincronice el bootstrap
    // (LID mappings). Sin eso el móvil muestra «check your connection».
    syncFullHistory: false,
    markOnlineOnConnect: false,
    shouldSyncHistoryMessage: () => true,
  });
  slot.sock = sock;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (u) => {
    const actual = slots.get(id);
    if (!actual) return;
    if (u.qr) {
      actual.estado = 'qr';
      actual.qrDataUrl = await QRCode.toDataURL(u.qr, { width: 280, margin: 1 });
      actual.error = null;
    }
    if (u.connection === 'open') {
      actual.estado = 'open';
      actual.qrDataUrl = null;
      actual.pairingCode = null;
      actual.error = null;
      console.log(`[wa] sesión ${id} abierta`);
    }
    if (u.connection === 'close') {
      const err = u.lastDisconnect?.error as
        | { output?: { statusCode?: number }; message?: string }
        | undefined;
      const code = err?.output?.statusCode;
      actual.qrDataUrl = null;
      try {
        actual.sock?.end(undefined);
      } catch {
        /* */
      }
      actual.sock = null;

      if (code === DisconnectReason.loggedOut) {
        actual.estado = 'close';
        actual.error = 'Sesión cerrada en el móvil';
        console.log(`[wa] ${id} loggedOut`);
        return;
      }

      // 515: tras escanear el QR WhatsApp pide reinicio inmediato (normal).
      if (code === DisconnectReason.restartRequired) {
        actual.estado = 'idle';
        actual.error = 'Reiniciando tras vincular…';
        console.log(`[wa] ${id} restartRequired → reconectar`);
        setTimeout(() => {
          void arrancar(id).catch((e) => {
            console.error(`[wa] re-arranque ${id}`, e);
          });
        }, 800);
        return;
      }

      if (code === DisconnectReason.badSession) {
        actual.estado = 'error';
        actual.error = 'Sesión corrupta. Desconecta y vuelve a escanear el QR.';
        console.log(`[wa] ${id} badSession`);
        return;
      }

      actual.estado = 'error';
      actual.error =
        code === DisconnectReason.timedOut || /QR refs/i.test(String(err?.message ?? ''))
          ? 'El QR caducó. Generamos uno nuevo…'
          : 'Conexión perdida. Reintentando…';
      console.log(`[wa] ${id} close code=${code ?? '?'} → retry`);
      setTimeout(() => {
        void arrancar(id).catch(() => undefined);
      }, 2000);
    }
  });

  sock.ev.on('lid-mapping.update', (map) => {
    const actual = slots.get(id);
    if (!actual) return;
    if (map.lid && map.pn) registrarLidPn(actual, map.lid, map.pn);
  });

  // Contactos = base de la bandeja.
  sock.ev.on('contacts.upsert', (contacts) => {
    const actual = slots.get(id);
    if (!actual) return;
    for (const c of contacts) aplicarContacto(actual, c);
  });

  sock.ev.on('contacts.update', (contacts) => {
    const actual = slots.get(id);
    if (!actual) return;
    for (const c of contacts) aplicarContacto(actual, c);
  });

  sock.ev.on('chats.upsert', (chats) => {
    const actual = slots.get(id);
    if (!actual) return;
    for (const c of chats) {
      if (!c.id || !esPrivado(c.id)) continue;
      upsertChat(actual, c.id, c.name ?? undefined, null, { soloContacto: true });
    }
  });

  // Baileys necesita procesar history sync (LID). Solo 1:1; mensajes desde
  // integración o al menos el último día — grupos / histórico largo fuera.
  sock.ev.on('messaging-history.set', ({ chats, contacts, messages }) => {
    const actual = slots.get(id);
    if (!actual) return;
    for (const c of contacts ?? []) aplicarContacto(actual, c);
    for (const c of chats) {
      if (!c.id || !esPrivado(c.id)) continue;
      upsertChat(actual, c.id, c.name ?? undefined, null, { soloContacto: true });
    }
    for (const m of messages) ingerirMensaje(actual, m);
  });

  sock.ev.on('messages.upsert', ({ messages }) => {
    const actual = slots.get(id);
    if (!actual) return;
    for (const m of messages) ingerirMensaje(actual, m);
  });

  return slot;
}

async function cerrar(id: string) {
  const slot = slots.get(id);
  if (!slot) return;
  try {
    await slot.sock?.logout();
  } catch {
    /* */
  }
  try {
    slot.sock?.end(undefined);
  } catch {
    /* */
  }
  slot.sock = null;
  slot.estado = 'close';
  slot.qrDataUrl = null;
  slot.pairingCode = null;
}

/** Solo dígitos con prefijo de país (sin +). */
function digitosEmparejar(raw: string): string | null {
  const d = raw.replace(/\D/g, '');
  if (d.length < 10 || d.length > 15) return null;
  return d;
}

async function pedirCodigoEmparejamiento(slot: Slot, telefono: string): Promise<string> {
  const digits = digitosEmparejar(telefono);
  if (!digits) {
    throw new Error('Teléfono inválido. Usa prefijo de país, solo números (ej. 34655111222).');
  }
  if (!slot.sock) throw new Error('La sesión no está arrancada');
  if (slot.estado === 'open') throw new Error('La sesión ya está conectada');
  if (slot.sock.authState.creds.registered) {
    throw new Error('Esta sesión ya está registrada. Desconecta y crea otra.');
  }
  // Baileys necesita el socket listo un instante antes del pairing.
  await new Promise((r) => setTimeout(r, 1200));
  if (!slot.sock) throw new Error('La sesión se cerró');
  const code = await slot.sock.requestPairingCode(digits);
  const formatted = code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
  slot.pairingCode = formatted;
  slot.estado = 'qr';
  slot.error = null;
  return formatted;
}

function leerBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>);
      } catch {
        resolve({});
      }
    });
  });
}

function json(res: ServerResponse, status: number, body: unknown) {
  const raw = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(raw),
  });
  res.end(raw);
}

const server = createServer(async (req, res) => {
  const host = req.headers.host ?? '';
  if (!host.startsWith('127.0.0.1') && !host.startsWith('localhost')) {
    json(res, 403, { error: 'Solo localhost' });
    return;
  }

  const url = new URL(req.url ?? '/', `http://${host}`);
  const path = url.pathname;

  try {
    if (req.method === 'GET' && path === '/health') {
      json(res, 200, { ok: true, sesiones: slots.size, modo: 'ligero-1a1' });
      return;
    }

    if (req.method === 'POST' && path === '/sessions') {
      const body = await leerBody(req);
      const id = typeof body.id === 'string' ? body.id.trim() : '';
      const desde = typeof body.desde === 'string' ? body.desde : undefined;
      if (!id) {
        json(res, 400, { error: 'Falta id' });
        return;
      }
      const slot = await arrancar(id, desde);
      json(res, 200, snapshot(slot));
      return;
    }

    const m = path.match(/^\/sessions\/([^/]+)(?:\/(messages|send|pair))?$/);
    if (!m) {
      json(res, 404, { error: 'no encontrado' });
      return;
    }
    const id = decodeURIComponent(m[1]);
    const extra = m[2];
    const slot = slots.get(id);

    if (req.method === 'GET' && !extra) {
      if (!slot) {
        json(res, 404, { error: 'Sesión no encontrada' });
        return;
      }
      json(res, 200, snapshot(slot));
      return;
    }

    if (req.method === 'POST' && extra === 'pair') {
      const body = await leerBody(req);
      const desde = typeof body.desde === 'string' ? body.desde : undefined;
      const tel =
        typeof body.telefono === 'string'
          ? body.telefono
          : typeof body.phone === 'string'
            ? body.phone
            : '';
      const actual = slot ?? (await arrancar(id, desde));
      const code = await pedirCodigoEmparejamiento(actual, tel);
      json(res, 200, { ...snapshot(actual), pairingCode: code });
      return;
    }

    if (req.method === 'GET' && extra === 'messages') {
      if (!slot) {
        json(res, 404, { error: 'Sesión no encontrada' });
        return;
      }
      const jid = url.searchParams.get('jid') ?? '';
      if (!jid) {
        json(res, 400, { error: 'Falta jid' });
        return;
      }
      json(res, 200, { mensajes: mensajesDe(slot, jid), desde: slot.desde });
      return;
    }

    if (req.method === 'POST' && extra === 'send') {
      if (!slot?.sock || slot.estado !== 'open') {
        json(res, 409, { error: 'La sesión no está conectada' });
        return;
      }
      const body = await leerBody(req);
      const jidRaw = typeof body.jid === 'string' ? body.jid : '';
      const texto = typeof body.texto === 'string' ? body.texto.trim() : '';
      if (!jidRaw || !texto) {
        json(res, 400, { error: 'Faltan jid o texto' });
        return;
      }
      if (!esPrivado(jidRaw)) {
        json(res, 400, { error: 'Solo chats 1:1 (sin grupos)' });
        return;
      }
      const jid = jidCanonico(slot, jidRaw);
      const sent = await slot.sock.sendMessage(jid, { text: texto });
      const ts = new Date().toISOString();
      upsertChat(slot, jid, undefined, texto);
      pushMensaje(slot, {
        id: sent?.key?.id || `out-${Date.now()}`,
        jid,
        direccion: 'salida',
        texto,
        ts,
      });
      json(res, 200, { ok: true, id: sent?.key?.id ?? null });
      return;
    }

    if (req.method === 'DELETE' && !extra) {
      await cerrar(id);
      json(res, 200, { ok: true });
      return;
    }

    json(res, 404, { error: 'no encontrado' });
  } catch (e) {
    json(res, 500, { error: e instanceof Error ? e.message : 'bridge_error' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`WhatsApp puente ligero (1:1, sin grupos) en http://127.0.0.1:${PORT}`);
  console.log('Historial: desde integración, mínimo último día. Contactos primero.');
});
