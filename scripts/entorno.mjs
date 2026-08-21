#!/usr/bin/env node
/**
 * `npm run entorno` — te dice en qué mundo estás y qué comando usar.
 * No hay staging que actualizar. La demo es `npm run demo` en tu Mac.
 */
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
  '  npm run demo     tu Mac + botones Simular + cinta amarilla',
  '  npm run dev      tu Mac, mismas apps, sin Simular',
  '  mecanu.com       producción: solo la landing',
  '',
  `  Ahora mismo:  mundo=${mundo}  demo=${demo ? 'sí' : 'no'}  vercel=${enVercel ? 'sí' : 'no'}`,
  '',
];

if (mundo === 'local' && !demo) {
  lineas.push('  Para ver Simular: cierra esto y arranca `npm run demo`.');
  lineas.push('');
}
if (demo) {
  lineas.push('  Estás en demo local. Eso no se publica a mecanu.com.');
  lineas.push('  Panel    http://localhost:3000/panel');
  lineas.push('  Conductor http://localhost:3000/conductor');
  lineas.push('  Backoffice http://localhost:3000/backoffice');
  lineas.push('');
}

process.stdout.write(lineas.join('\n'));
