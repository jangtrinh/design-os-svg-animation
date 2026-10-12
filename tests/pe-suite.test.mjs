import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('PE figures suite modules export valid contract', async () => {
  const figureFiles = [
    'pe-stopwatch.js',
    'pe-barbell.js',
    'pe-relay-baton.js',
    'pe-hurdle.js',
    'pe-basketball-hoop.js'
  ];

  for (const file of figureFiles) {
    const modPath = path.join(ROOT, 'playground/pe-figures', file);
    assert.ok(existsSync(modPath), `${file} should exist`);
    const mod = (await import(modPath)).default;

    assert.ok(mod.id && typeof mod.id === 'string', `${file} id should be a string`);
    assert.ok(mod.title && typeof mod.title === 'string', `${file} title should be a string`);
    assert.ok(mod.concept && typeof mod.concept === 'string', `${file} concept should be a string`);
    assert.ok(mod.means && typeof mod.means === 'string', `${file} means should be a string`);
    assert.ok(Array.isArray(mod.rules), `${file} rules should be an array`);
    assert.ok(Array.isArray(mod.range) && mod.range.length === 3, `${file} range should be [min, def, max]`);
    assert.equal(typeof mod.mount, 'function', `${file} mount should be a function`);

    // Invariant: zero text elements in SVG
    const rawContent = readFileSync(modPath, 'utf8');
    assert.ok(!rawContent.includes('HL.mk("text"'), `${file} must not create text tags in SVG (zero SVG text rule)`);
  }
});

test('PE suite HTML deliverables contain top-nav-bar and valid links', () => {
  const playgroundHtmlPath = path.join(ROOT, 'playground/pe.html');
  const docsHtmlPath = path.join(ROOT, 'docs/playground/pe.html');

  assert.ok(existsSync(playgroundHtmlPath), 'playground/pe.html should exist');
  assert.ok(existsSync(docsHtmlPath), 'docs/playground/pe.html should exist');

  const content = readFileSync(docsHtmlPath, 'utf8');
  assert.ok(content.includes('class="top-nav-bar"'), 'Should contain top-nav-bar');
  assert.ok(content.includes('href="../index.html"'), 'Should link back to parent index');
  assert.ok(content.includes('github.com/jangtrinh/design-os-svg-animation'), 'Should link to github repo');
  assert.ok(content.includes('[hidden] { display: none !important; }'), 'Should enforce [hidden] CSS display none');
});

test('Docs index page links to PE suite and cover image', () => {
  const indexPath = path.join(ROOT, 'docs/index.html');
  assert.ok(existsSync(indexPath), 'docs/index.html should exist');

  const content = readFileSync(indexPath, 'utf8');
  assert.ok(content.includes('playground/pe.html'), 'docs/index.html should link to playground/pe.html');
  assert.ok(content.includes('assets/pe-gallery-cover.png'), 'docs/index.html should reference pe-gallery-cover.png');
  assert.ok(existsSync(path.join(ROOT, 'docs/assets/pe-gallery-cover.png')), 'docs/assets/pe-gallery-cover.png should exist');
});
