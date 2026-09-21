import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'artifacts'].includes(entry.name)) continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) await walk(path); else if (entry.isFile()) files.push(path);
  }
}
await walk(root);
const failures = [];
for (const path of files) {
  const text = await readFile(path, 'utf8');
  if (extname(path) === '.json') {
    try { JSON.parse(text); } catch (e) { failures.push(`${path}: ${e.message}`); }
  }
  if (extname(path) === '.mjs') {
    const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
    if (result.status !== 0) failures.push(`${path}: ${result.stderr || result.error}`);
  }
  if (extname(path) === '.md') {
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      const link = match[1].split('#')[0];
      if (!link || /^[a-z]+:/i.test(link)) continue;
      try { await access(resolve(dirname(path), link)); } catch { failures.push(`${relative(root, path)}: broken link ${link}`); }
    }
  }
}
const capabilities = JSON.parse(await readFile(resolve(root, 'src/compilers/capabilities.json')));
if (Object.keys(capabilities.backends).length !== 5) failures.push('Expected five backend contracts');
const claimsDir = resolve(root, 'knowledge/claims');
for (const name of await readdir(claimsDir)) {
  const claim = JSON.parse(await readFile(resolve(claimsDir, name)));
  if (!['documented', 'reproduced', 'qualified', 'deprecated'].includes(claim.status)) failures.push(`${name}: unknown status`);
  if (!claim.sourceUrl?.startsWith('https://') || !claim.checkedAt || !claim.scope) failures.push(`${name}: missing provenance`);
  if (['reproduced', 'qualified'].includes(claim.status) && !claim.evidence?.length) failures.push(`${name}: status lacks experiment evidence`);
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${files.length} files; JSON parse, MJS syntax, local Markdown links, backend count, claim provenance. No dependency/runtime/render validation claimed.`);
