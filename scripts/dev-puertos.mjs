#!/usr/bin/env node
/**
 * Puertos fijos de desarrollo. Next, si no le pasas --port, salta solo al
 * siguiente libre; aquí el puerto es el modo, y si está ocupado se falla.
 *
 *   npm run dev   → 3000 (login, sin Simular)
 *   npm run demo  → 3001 (sin login, con Simular)
 *   npm run stop  → mata lo que escuche en 3000 y 3001
 */
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PUERTO_DEV = 3000;
export const PUERTO_DEMO = 3001;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NEXT_BIN = join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');

const MODOS = {
  dev: {
    puerto: PUERTO_DEV,
    etiqueta: 'npm run dev',
    paraQue: 'modo normal, con login',
    env: {},
  },
  demo: {
    puerto: PUERTO_DEMO,
    etiqueta: 'npm run demo',
    paraQue: 'modo demo, sin login, con Simular',
    env: {
      MECANU_DEMO: '1',
      NEXT_PUBLIC_MECANU_DEMO: '1',
    },
  },
};

function esPrincipal() {
  const entry = process.argv[1];
  if (!entry) return false;
  return fileURLToPath(import.meta.url) === resolve(entry);
}

function listenersEnPuerto(puerto) {
  try {
    const out = execFileSync(
      'lsof',
      ['-nP', `-iTCP:${puerto}`, '-sTCP:LISTEN'],
      { encoding: 'utf8' },
    );
    const lineas = out.trim().split('\n').slice(1);
    const vistos = new Map();
    for (const linea of lineas) {
      const partes = linea.trim().split(/\s+/);
      const command = partes[0];
      const pid = Number(partes[1]);
      if (!pid || pid === process.pid) continue;
      vistos.set(pid, { pid, command });
    }
    return [...vistos.values()];
  } catch (err) {
    if (err.status === 1) return [];
    return null;
  }
}

function intentaEscuchar(puerto, host) {
  return new Promise((resolveOk) => {
    const server = createServer();
    server.once('error', (err) => {
      resolveOk(err.code === 'EADDRINUSE');
    });
    server.once('listening', () => {
      server.close(() => resolveOk(false));
    });
    server.listen(puerto, host);
  });
}

async function puertoOcupado(puerto) {
  const listeners = listenersEnPuerto(puerto);
  if (listeners && listeners.length > 0) return { ocupado: true, listeners };
  const v4 = await intentaEscuchar(puerto, '127.0.0.1');
  if (v4) return { ocupado: true, listeners: listeners ?? [] };
  const v6 = await intentaEscuchar(puerto, '::1');
  if (v6) return { ocupado: true, listeners: listeners ?? [] };
  return { ocupado: false, listeners: [] };
}

function describirOcupantes(listeners) {
  if (!listeners.length) return 'hay algo corriendo ahí';
  return listeners
    .map((p) => `PID ${p.pid} (${p.command})`)
    .join(', ');
}

async function start(modoId) {
  const modo = MODOS[modoId];
  const { ocupado, listeners } = await puertoOcupado(modo.puerto);
  if (ocupado) {
    console.error('');
    console.error(`  El puerto ${modo.puerto} está ocupado (${describirOcupantes(listeners)}).`);
    console.error(`  ${modo.etiqueta} siempre usa ${modo.puerto} (${modo.paraQue}); no voy a saltar a otro.`);
    console.error('  Para liberarlo: npm run stop');
    console.error('');
    process.exit(1);
  }

  const extra = process.argv.slice(3);
  const child = spawn(
    process.execPath,
    [NEXT_BIN, 'dev', '--port', String(modo.puerto), ...extra],
    {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, ...modo.env },
    },
  );
  const reenviar = (senal) => {
    if (!child.killed) child.kill(senal);
  };
  process.on('SIGINT', () => reenviar('SIGINT'));
  process.on('SIGTERM', () => reenviar('SIGTERM'));
  child.on('error', (err) => {
    console.error(err);
    process.exit(1);
  });
  child.on('exit', (code, signal) => {
    if (signal) process.exit(0);
    process.exit(code ?? 1);
  });
}

function sleep(ms) {
  return new Promise((ok) => setTimeout(ok, ms));
}

function matar(pid, senal) {
  try {
    process.kill(pid, senal);
    return true;
  } catch (err) {
    if (err.code === 'ESRCH') return false;
    throw err;
  }
}

async function stop() {
  const puertos = [PUERTO_DEV, PUERTO_DEMO];
  const porPid = new Map();
  for (const puerto of puertos) {
    const listeners = listenersEnPuerto(puerto);
    if (listeners === null) {
      console.error(`No pude listar el puerto ${puerto} (hace falta lsof).`);
      process.exit(1);
    }
    for (const proc of listeners) {
      const prev = porPid.get(proc.pid) ?? { command: proc.command, puertos: [] };
      prev.puertos.push(puerto);
      porPid.set(proc.pid, prev);
    }
  }

  if (porPid.size === 0) {
    console.log('Nada escuchando en 3000 ni 3001.');
    return;
  }

  for (const [pid, info] of porPid) {
    if (matar(pid, 'SIGTERM')) {
      console.log(`Terminado PID ${pid} (${info.command}) en ${info.puertos.join(' y ')}.`);
    }
  }

  await sleep(400);

  const quedan = new Map();
  for (const puerto of puertos) {
    for (const proc of listenersEnPuerto(puerto) ?? []) {
      quedan.set(proc.pid, proc);
    }
  }
  for (const [pid, proc] of quedan) {
    if (matar(pid, 'SIGKILL')) {
      console.log(`Forzado PID ${pid} (${proc.command}).`);
    }
  }
}

function fallo(err) {
  console.error(err);
  process.exit(1);
}

if (esPrincipal()) {
  const comando = process.argv[2];
  if (comando === 'dev' || comando === 'demo') {
    start(comando).catch(fallo);
  } else if (comando === 'stop') {
    stop().catch(fallo);
  } else {
    console.error('Uso: node scripts/dev-puertos.mjs <dev|demo|stop>');
    process.exit(1);
  }
}
