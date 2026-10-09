import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const appPath = path.resolve('playground/math-grade1-app.js');
const content = readFileSync(appPath, 'utf8');

// The 10 figure blocks are delimited by comment headers:
// // 1. Math Abacus
// // 2. Math Balance
// ...
// // 10. Math Bead String

const figureNames = [
  { id: 'math-abacus', file: 'math-abacus.js', startRegex: /\/\/ 1\. Math Abacus/ },
  { id: 'math-balance', file: 'math-balance.js', startRegex: /\/\/ 2\. Math Balance/ },
  { id: 'math-ten-frame', file: 'math-ten-frame.js', startRegex: /\/\/ 3\. Math Ten Frame/ },
  { id: 'math-number-blocks', file: 'math-number-blocks.js', startRegex: /\/\/ 4\. Math Number Blocks/ },
  { id: 'math-number-line', file: 'math-number-line.js', startRegex: /\/\/ 5\. Math Number Line/ },
  { id: 'math-dice', file: 'math-dice.js', startRegex: /\/\/ 6\. Math Dice/ },
  { id: 'math-clock', file: 'math-clock.js', startRegex: /\/\/ 7\. Math Clock/ },
  { id: 'math-shapes', file: 'math-shapes.js', startRegex: /\/\/ 8\. Math Shapes/ },
  { id: 'math-fraction-pie', file: 'math-fraction-pie.js', startRegex: /\/\/ 9\. Math Fraction Pie/ },
  { id: 'math-bead-string', file: 'math-bead-string.js', startRegex: /\/\/ 10\. Math Bead String/ },
];

const endRegex = /\/\/ App Controller & View Logic/;

const indices = figureNames.map(f => content.search(f.startRegex));
const endIndex = content.search(endRegex);

for (let i = 0; i < figureNames.length; i++) {
  const start = indices[i];
  const end = (i < figureNames.length - 1) ? indices[i + 1] : endIndex;
  let chunk = content.slice(start, end).trim();
  // chunk starts with comment and object definition: `{ id: ..., ... },`
  // remove trailing comma if present at the end
  if (chunk.endsWith(',')) chunk = chunk.slice(0, -1).trim();
  if (chunk.endsWith('];')) chunk = chunk.slice(0, -2).trim();
  
  // Format as export
  const fileContent = `export default ${chunk.replace(/^\/\/[^\n]+\n/, '').trim()};\n`;
  const targetPath = path.resolve(`playground/math-figures/${figureNames[i].file}`);
  writeFileSync(targetPath, fileContent, 'utf8');
  console.log(`Wrote ${targetPath} (${fileContent.length} bytes)`);
}

// App shell
const preamble = content.slice(0, indices[0]);
const postamble = content.slice(endIndex);
writeFileSync(path.resolve('playground/math-figures/runner.js'), postamble, 'utf8');
console.log('Split complete!');
