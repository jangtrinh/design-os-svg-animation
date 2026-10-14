import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = process.cwd();

test('Grade 1 Math figures suite modules export valid contract', async () => {
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

  for (const file of figureFiles) {
    const modPath = path.join(ROOT, 'playground/math-figures', file);
    assert.ok(existsSync(modPath), `${file} should exist`);
    const mod = (await import(modPath)).default;

    assert.ok(mod.id && typeof mod.id === 'string', `${file} id should be a string`);
    assert.ok(mod.title && typeof mod.title === 'string', `${file} title should be a string`);
    assert.ok(mod.concept && typeof mod.concept === 'string', `${file} concept should be a string`);
    assert.ok(mod.means && typeof mod.means === 'string', `${file} means should be a string`);
    assert.ok(Array.isArray(mod.rules), `${file} rules should be an array`);
    assert.ok(Array.isArray(mod.range) && mod.range.length === 3, `${file} range should be [min, def, max]`);
    assert.equal(typeof mod.mount, 'function', `${file} mount should be a function`);

    const rawContent = readFileSync(modPath, 'utf8');
    assert.ok(!rawContent.includes('HL.mk("text"'), `${file} must not create text tags in SVG (zero SVG text rule)`);
  }
});

test('Grade 1 Math suite HTML deliverables contain top-nav-bar and valid links', () => {
  const playgroundHtmlPath = path.join(ROOT, 'playground/math-grade1.html');
  const docsHtmlPath = path.join(ROOT, 'docs/playground/math-grade1.html');

  assert.ok(existsSync(playgroundHtmlPath), 'playground/math-grade1.html should exist');
  assert.ok(existsSync(docsHtmlPath), 'docs/playground/math-grade1.html should exist');

  const content = readFileSync(docsHtmlPath, 'utf8');
  assert.ok(content.includes('class="top-nav-bar"'), 'Should contain top-nav-bar');
  assert.ok(content.includes('href="../index.html"'), 'Should link back to parent index');
  assert.ok(content.includes('github.com/jangtrinh/design-os-svg-animation'), 'Should link to github repo');
  assert.ok(content.includes('[hidden] { display: none !important; }'), 'Should enforce [hidden] CSS display none');
});

test('All 25 interactive figures pass static Hairline quality gate', () => {
  const out = execFileSync(process.execPath, [
    path.join(ROOT, 'scripts/audit-suite-quality.mjs'),
    'all',
    '--static-only'
  ], { encoding: 'utf8' });
  assert.ok(out.includes('AUDIT PASSED'), 'Static audit across all 25 figures should pass');
});

test('README.md and docs/index.html reference all 4 interactive suites and updated cover screenshots', () => {
  const readme = readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const docsIndex = readFileSync(path.join(ROOT, 'docs/index.html'), 'utf8');
  const covers = [
    'math-gallery-cover.png',
    'physics-gallery-cover.png',
    'chemistry-gallery-cover.png',
    'pe-gallery-cover.png'
  ];
  const pages = [
    'playground/math-grade1.html',
    'playground/physics.html',
    'playground/chemistry.html',
    'playground/pe.html'
  ];
  for (const c of covers) {
    assert.ok(existsSync(path.join(ROOT, 'docs/assets', c)), `docs/assets/${c} should exist`);
    assert.ok(readme.includes(`docs/assets/${c}`), `README.md should embed docs/assets/${c}`);
    assert.ok(docsIndex.includes(`assets/${c}`), `docs/index.html should embed assets/${c}`);
  }
  for (const p of pages) {
    assert.ok(readme.includes(p), `README.md should link to ${p}`);
    assert.ok(docsIndex.includes(p), `docs/index.html should link to ${p}`);
  }
});
