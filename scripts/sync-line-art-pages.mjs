#!/usr/bin/env node
/**
 * sync-line-art-pages.mjs — publish a line-art-to-motion case to GitHub Pages (docs/).
 *
 * Reads research/<case>/case.json: the page (promo/<project>/...), its demo video, and
 * `publish.modules` (repo-relative, under src/). Mirrors them into docs/promo/ with the same
 * project layout, modules under docs/promo/<project>/lib/<path under src>, rewriting what
 * differs on Pages:
 *   - module imports:  '<to repo root>/src/  ->  './lib/
 *   - "Back to home":  href="/" and location.href = '/'  ->  the site index (sub-path hosting)
 *
 * It also proves the copy is self-contained: every relative import in the page and in
 * each published module must resolve to a published file (a new import that was not added
 * to case.json would otherwise pass --check and 404 on Pages).
 *
 * Usage: node scripts/sync-line-art-pages.mjs --case <research folder> --write | --check
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { caseName, loadCase } from './line-art-cases.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = path.join(ROOT, 'docs', 'promo');
const mode = process.argv.find(a => a === '--write' || a === '--check');
if (!mode) throw new Error('Usage: node scripts/sync-line-art-pages.mjs --case <name> --write|--check');
const spec = loadCase(caseName(process.argv), ROOT);

const count = (text, needle) => text.split(needle).length - 1;
function replaceExactly(text, from, to, times, what) {
  if (count(text, from) !== times) throw new Error(`${what}: expected ${times}x "${from}", found ${count(text, from)}; update sync rules or case.json`);
  return text.split(from).join(to);
}

const pageDest = path.relative('promo', spec.page); // e.g. drone-404/drone-404.html
const srcPrefix = `'${path.posix.relative(path.posix.dirname(spec.page), '.')}/src/`; // e.g. '../../src/
const home = path.posix.relative(path.posix.dirname(path.posix.join('docs/promo', pageDest)), 'docs/index.html');

function pageForPages(source) {
  let html = source.toString('utf8');
  const imports = count(html, srcPrefix);
  if (!imports) throw new Error(`${spec.page}: no ${srcPrefix} imports found`);
  html = replaceExactly(html, srcPrefix, "'./lib/", imports, spec.page);
  html = replaceExactly(html, 'href="/"', `href="${home}"`, 1, spec.page);
  html = replaceExactly(html, "location.href = '/'", `location.href = '${home}'`, 1, spec.page);
  return Buffer.from(html);
}

// [repo source, docs/promo destination, transform]
const files = [
  [spec.page, pageDest, pageForPages],
  [path.relative(ROOT, spec.video), path.relative(path.join(ROOT, 'promo'), spec.video), b => b],
  ...spec.publish.modules.map(m => [m, path.join(path.dirname(pageDest), 'lib', path.relative('src', m)), b => b]),
];

// Self-containment: relative imports must land on published files.
const published = new Set(files.map(([, to]) => path.normalize(to)));
const IMPORT = /(?:import|export)\s[^'"]*?from\s*'([^']+)'|import\(\s*'([^']+)'\s*\)/g;
for (const [from, to, transform] of files.filter(([f]) => /\.(mjs|html)$/.test(f))) {
  const text = transform(fs.readFileSync(path.join(ROOT, from))).toString('utf8');
  for (const match of text.matchAll(IMPORT)) {
    const spec_ = match[1] ?? match[2];
    if (!spec_.startsWith('.')) continue;
    const target = path.normalize(path.join(path.dirname(to), spec_));
    if (!published.has(target)) throw new Error(`${from} imports '${spec_}', which the Pages copy does not publish; add it to publish.modules in case.json`);
  }
}

const stale = [];
for (const [from, to, transform] of files) {
  const expected = transform(fs.readFileSync(path.join(ROOT, from)));
  const target = path.join(PAGES, to);
  if (mode === '--write') {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, expected);
  } else if (!fs.existsSync(target) || !fs.readFileSync(target).equals(expected)) {
    stale.push(to);
  }
}
if (stale.length) {
  console.error(`docs/promo is out of date for ${spec.name}: ${stale.join(', ')}. Run: node scripts/sync-line-art-pages.mjs --case ${spec.name} --write`);
  process.exit(1);
}
console.log(`${spec.name} pages ${mode === '--write' ? 'written' : 'in sync'}: ${files.length} files, imports self-contained`);
