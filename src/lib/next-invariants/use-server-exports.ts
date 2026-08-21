/**
 * Next.js: un archivo con `'use server'` solo puede exportar funciones async.
 * Exportar `const` / `function` sync / clase rompe la página en runtime (500)
 * sin que TypeScript se queje. Este chequeo corre en `npm test`.
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC_ROOT = path.join(process.cwd(), 'src');

const EXPORT_PROHIBIDO =
  /^\s*export\s+(?:const|let|var|class|enum)\b|^\s*export\s+function\b|^\s*export\s+default\s+(?!async\b)/m;

function esArchivoUseServer(contenido: string): boolean {
  const sinBom = contenido.replace(/^\uFEFF/, '');
  const lineas = sinBom.split(/\r?\n/);
  for (const linea of lineas) {
    const t = linea.trim();
    if (!t || t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) continue;
    return t === "'use server';" || t === '"use server";';
  }
  return false;
}

function listarTs(dir: string, out: string[] = []): string[] {
  for (const nombre of fs.readdirSync(dir)) {
    const full = path.join(dir, nombre);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (nombre === 'node_modules' || nombre === '.next') continue;
      listarTs(full, out);
    } else if (/\.(ts|tsx)$/.test(nombre) && !nombre.endsWith('.test.ts') && !nombre.endsWith('.test.tsx')) {
      out.push(full);
    }
  }
  return out;
}

export function hallarExportsIlegalesEnUseServer(root = SRC_ROOT): { file: string; snippet: string }[] {
  const malos: { file: string; snippet: string }[] = [];
  for (const file of listarTs(root)) {
    const contenido = fs.readFileSync(file, 'utf8');
    if (!esArchivoUseServer(contenido)) continue;
    const m = contenido.match(EXPORT_PROHIBIDO);
    if (m) {
      malos.push({
        file: path.relative(process.cwd(), file),
        snippet: m[0].trim(),
      });
    }
  }
  return malos;
}
