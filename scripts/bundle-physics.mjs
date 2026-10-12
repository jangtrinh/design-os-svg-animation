import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const figuresDir = path.join(ROOT, 'playground/physics-figures');

const figureFiles = [
  'physics-lever.js',
  'physics-pendulum.js',
  'physics-dynamometer.js',
  'physics-incline.js',
  'physics-switch.js'
];

let appCode = `/*
 * 5 Physics Figures Definitions (Hairline 2:1 Axonometric Standard)
 * Modularized Architecture - Auto-bundled
 */

if (typeof HL !== "undefined" && HL.inject) {
  HL.inject(document);
}

const PHYSICS_FIGURES = [
`;

for (const file of figureFiles) {
  const filePath = path.join(figuresDir, file);
  let code = readFileSync(filePath, 'utf8').trim();
  code = code.replace(/export\s+default\s+/, '').trim();
  if (code.endsWith(';')) {
    code = code.slice(0, -1).trim();
  }
  appCode += code + ',\n';
}

appCode += '];\n\n';

const runnerPath = path.join(figuresDir, 'runner.js');
appCode += readFileSync(runnerPath, 'utf8');

writeFileSync(path.join(ROOT, 'playground/physics-app.js'), appCode, 'utf8');
console.log('Bundled playground/physics-app.js successfully!');

// Also trigger page builder
import('./build-physics-page.mjs');
