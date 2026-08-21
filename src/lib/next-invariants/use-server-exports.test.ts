import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { hallarExportsIlegalesEnUseServer } from './use-server-exports';

describe("'use server' solo exporta funciones async", () => {
  it('ningún archivo de src viola la regla (evita el 500 de backoffice)', () => {
    const malos = hallarExportsIlegalesEnUseServer();
    expect(
      malos,
      malos.map((m) => `${m.file}: ${m.snippet}`).join('\n') || undefined,
    ).toEqual([]);
  });

  it('detecta export const en un fixture temporal', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mecanu-use-server-'));
    const nested = path.join(dir, 'app');
    fs.mkdirSync(nested);
    fs.writeFileSync(
      path.join(nested, 'bad.ts'),
      `'use server';\n\nexport const X = 'y';\nexport async function ok() {}\n`,
    );
    fs.writeFileSync(
      path.join(nested, 'good.ts'),
      `'use server';\n\nexport async function ok() {}\nexport type T = string;\n`,
    );
    try {
      const malos = hallarExportsIlegalesEnUseServer(dir);
      expect(malos).toHaveLength(1);
      expect(malos[0].file).toContain('bad.ts');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
