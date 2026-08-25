#!/usr/bin/env node
/**
 * `npm run entorno` — te dice en qué mundo estás y qué comando usar.
 * No hay staging que actualizar. La demo es `npm run demo` en tu Mac.
 */
import { PUERTO_DEMO, PUERTO_DEV } from './dev-puertos.mjs';

const env = process.env;
const vercelEnv = env.VERCEL_ENV ?? env.NEXT_PUBLIC_VERCEL_ENV;
const enVercel = env.VERCEL === '1' || !!vercelEnv;
const mundo =
  vercelEnv === 'production' ? 'produccion'
    : enVercel ? 'preview'
      : 'local';
const pidioDemo = env.MECANU_DEMO === '1' || env.NEXT_PUBLIC_MECANU_DEMO === '1';
const demo = mundo === 'local' && pidioDemo;

const lineas = [
  '',
  '  Mecanu · un solo mapa (no hay staging que mantener)',
  '  --------------------------------------------------',
  '',
  `  npm run dev      localhost:${PUERTO_DEV}  con login, sin Simular`,
  `  npm run demo     localhost:${PUERTO_DEMO}  sin login, con Simular`,
  '  npm run stop     libera 3000 y 3001',
  '  mecanu.com       producción: solo la landing',
  '',
  `  Ahora mismo:  mundo=${mundo}  demo=${demo ? 'sí' : 'no'}  vercel=${enVercel ? 'sí' : 'no'}`,
  '',
];

if (mundo === 'local' && !demo) {
  lineas.push(`  Panel con login: http://localhost:${PUERTO_DEV}/panel/entrar`);
  lineas.push(`  Para ver Simular: npm run demo → http://localhost:${PUERTO_DEMO}`);
  lineas.push('');
}
if (demo) {
  lineas.push('  Estás en demo local. Eso no se publica a mecanu.com.');
  lineas.push(`  Panel     http://localhost:${PUERTO_DEMO}/panel`);
  lineas.push(`  Conductor http://localhost:${PUERTO_DEMO}/conductor`);
  lineas.push(`  Backoffice http://localhost:${PUERTO_DEMO}/backoffice`);
  lineas.push('');
}

process.stdout.write(lineas.join('\n'));
