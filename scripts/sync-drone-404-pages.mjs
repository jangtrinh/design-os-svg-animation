#!/usr/bin/env node
/**
 * sync-drone-404-pages.mjs — publish the single-line drone 404 page to GitHub Pages.
 *
 * The source page (promo/drone-404.html) imports its modules from ../src/. Pages serves
 * docs/ only, so this copies the page, its modules (same relative layout) and the demo
 * video into docs/promo/, rewriting the two things that differ on Pages:
 *   - module imports:  ../src/  ->  ./drone-404/
 *   - "Back to home":  href="/" ->  href="../index.html" (the site lives under a sub-path)
 *
 * Usage: node scripts/sync-drone-404-pages.mjs --write | --check
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = join(ROOT, 'docs', 'promo');

// [source relative to repo root, destination relative to docs/promo]
const FILES = [
  ['promo/drone-404.html', 'drone-404.html'],
  ['promo/drone-search-404.mp4', 'drone-search-404.mp4'],
  ...[
    'DroneSearch404.mjs',
    'drone-404-motion.mjs',
    'drone-404-flight-physics.mjs',
    'drone-404-flight-controller.mjs',
    'drone-404-interaction.mjs',
    'drone-404-line-art-geometry.mjs',
  ].map(name => [`src/primitives/${name}`, `drone-404/primitives/${name}`]),
  ['src/runtime/hyperframes-motion-presets.mjs', 'drone-404/runtime/hyperframes-motion-presets.mjs'],
];

function replaceExactly(text, from, to, times) {
  const count = text.split(from).length - 1;
  if (count !== times) throw new Error(`expected ${times}x "${from}" in drone-404.html, found ${count}; update the sync rules`);
  return text.split(from).join(to);
}

function forPages(source, relativePath) {
  if (relativePath !== 'promo/drone-404.html') return source;
  let html = source.toString('utf8');
  html = replaceExactly(html, "'../src/", "'./drone-404/", 2);
  html = replaceExactly(html, 'href="/"', 'href="../index.html"', 1);
  html = replaceExactly(html, "location.href = '/'", "location.href = '../index.html'", 1);
  return Buffer.from(html);
}

const mode = process.argv[2];
if (mode !== '--write' && mode !== '--check') throw new Error('Usage: node scripts/sync-drone-404-pages.mjs --write|--check');

const stale = [];
for (const [from, to] of FILES) {
  const expected = forPages(await readFile(join(ROOT, from)), from);
  const target = join(PAGES, to);
  if (mode === '--write') {
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, expected);
    continue;
  }
  const actual = await readFile(target).catch(() => null);
  if (!actual || !actual.equals(expected)) stale.push(to);
}

if (stale.length) {
  console.error(`docs/promo is out of date: ${stale.join(', ')}. Run: node scripts/sync-drone-404-pages.mjs --write`);
  process.exit(1);
}
console.log(`drone-404 pages ${mode === '--write' ? 'written' : 'in sync'}: ${FILES.length} files`);
