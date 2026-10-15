#!/usr/bin/env node
/**
 * Copia tokens del design system y un extracto HTML de referencia
 * para que los mockups del video se mantengan fieles al panel.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const out = join(__dirname, '../reference');
mkdirSync(out, { recursive: true });

const tokensDir = join(root, 'src/styles/ds/tokens');
for (const f of ['colors.css', 'typography.css', 'radius.css', 'spacing.css', 'elevation.css']) {
  const src = join(tokensDir, f);
  if (existsSync(src)) copyFileSync(src, join(out, f));
}

const panelCss = join(root, 'src/components/taller/panel.module.css');
if (existsSync(panelCss)) {
  const css = readFileSync(panelCss, 'utf8');
  const keep = css
    .split('\n')
    .filter((l) =>
      /\.(kanban|card|kanbanCol|cardPill|cardSection)/.test(l) ||
      l.startsWith('  ') ||
      l.trim() === '}' ||
      l.includes('--mecanu'),
    )
    .join('\n');
  writeFileSync(join(out, 'panel-kanban-extract.css'), keep);
}

writeFileSync(
  join(out, 'estructura-panel.html'),
  `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Referencia estructura panel Mecanu</title>
  <link rel="stylesheet" href="./colors.css" />
  <link rel="stylesheet" href="./panel-kanban-extract.css" />
  <style>
    body { font-family: "Plus Jakarta Sans", system-ui, sans-serif; margin: 24px; background: var(--mecanu-neutral-25, #F7F7F8); }
    .note { max-width: 720px; color: #636366; margin-bottom: 24px; line-height: 1.5; }
  </style>
</head>
<body>
  <p class="note">
    Extracto estructural del tablero (kanban + cards) para fidelidad visual del video Remotion.
    No es la app Next; los mockups en <code>remotion/src/mockups</code> siguen estos tokens.
  </p>
  <div class="kanban" style="display:flex;gap:8px">
    <div class="kanbanCol" style="width:260px;background:var(--mecanu-neutral-25,#F7F7F8);border-radius:12px;padding:8px">
      <div class="kanbanColHead"><strong>Agendado</strong></div>
      <div class="kanbanColBody">
        <div class="card">
          <div class="cardSection"><strong>Carlos Ruiz</strong></div>
          <div class="cardSection">VW Golf · 5678 DEF</div>
          <div class="cardSection"><span class="cardPill">Ventana confirmada</span></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`,
);

console.log('Snapshot DS → remotion/reference/');
