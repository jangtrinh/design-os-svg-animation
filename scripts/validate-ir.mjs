import { readFile } from 'node:fs/promises';
import { validateMotionIR } from '../src/ir/validate-motion-ir.mjs';
try {
  const path = process.argv[2];
  if (!path) throw new Error('Usage: node scripts/validate-ir.mjs <motion.json>');
  const result = validateMotionIR(JSON.parse(await readFile(path, 'utf8')));
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exitCode = 1;
} catch (error) { console.error(error.message); process.exitCode = 1; }
