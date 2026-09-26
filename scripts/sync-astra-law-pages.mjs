import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = join(repositoryRoot, 'promo');
const pagesDirectory = join(repositoryRoot, 'docs', 'promo');

const playerFiles = [
  'astra-law/astra-law-promo.html',
  'astra-law/astra-law-promo.css',
  'astra-law/astra-law-ui.css',
  'astra-law/astra-law-player.mjs',
  'astra-law/astra-law-motion-ir.mjs',
  'astra-law/astra-law-scenes.mjs',
  'astra-law/astra-law-timeline.mjs',
  'astra-law/astra-law-galaxy.mjs',
  'astra-law/astra-law-galaxy-points.mjs',
  'astra-law/astra-law-firm-motion.mjs',
  'astra-law/astra-law-late-motion.mjs',
  'astra-law/astra-law-partner-orbit.mjs',
  'astra-law/astra-law.motion.json',
  'astra-law/astra-law-tie.png',
  'astra-law/astra-law-scales.png',
  'shared/hyperframes-engine.mjs',
  'shared/hyperframes-extra-beats.mjs',
  'shared/hyperframes-motion-presets.mjs',
];

const mode = process.argv[2];
if (mode !== '--write' && mode !== '--check') {
  throw new Error('Usage: node scripts/sync-astra-law-pages.mjs --write|--check');
}

const icons = (await readdir(join(sourceDirectory, 'astra-law/astra-law-icons')))
  .filter((name) => name.endsWith('.svg'))
  .map((name) => join('astra-law/astra-law-icons', name));
const files = [...playerFiles, ...icons];
const failures = [];

for (const relativePath of files) {
  const sourcePath = join(sourceDirectory, relativePath);
  const pagesPath = join(pagesDirectory, relativePath);
  let expected = await readFile(sourcePath);
  if (relativePath === 'astra-law/astra-law-promo.html') {
    const html = expected.toString('utf8');
    const oldLink = 'href="../../docs/index.html"';
    if (html.split(oldLink).length !== 2) throw new Error('Astra player return link changed');
    expected = Buffer.from(html.replace(oldLink, 'href="../../index.html"'));
  }

  if (mode === '--write') {
    await mkdir(dirname(pagesPath), { recursive: true });
    await writeFile(pagesPath, expected);
    continue;
  }

  try {
    const actual = await readFile(pagesPath);
    if (!actual.equals(expected)) failures.push(relativePath);
  } catch {
    failures.push(relativePath);
  }
}

if (failures.length) {
  throw new Error(`GitHub Pages mirror is missing or stale: ${failures.join(', ')}`);
}
console.log(`${mode === '--write' ? 'Synced' : 'Verified'} ${files.length} Astra player files in docs/promo`);
