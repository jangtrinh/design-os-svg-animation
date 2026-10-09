import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const figuresDir = path.join(ROOT, 'playground/math-figures');

const figureFiles = [
  'math-sticks.js',
  'math-balance.js',
  'math-ten-frame.js',
  'math-number-blocks.js',
  'math-number-line.js',
  'math-ruler-pencil.js',
  'math-clock.js',
  'math-shapes.js',
  'math-fraction-pie.js',
  'math-bead-string.js'
];

let appCode = `/*
 * 10 Grade 1 Math Figures Definitions (Hairline 2:1 Axonometric Standard)
 * Modularized Architecture - Auto-bundled
 */

if (typeof HL !== "undefined" && HL.inject) {
  HL.inject(document);
}

const MATH_FIGURES = [
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

writeFileSync(path.join(ROOT, 'playground/math-grade1-app.js'), appCode, 'utf8');
console.log('Bundled playground/math-grade1-app.js successfully!');

// Also trigger page builder
import('./build-math-grade1-page.mjs');
