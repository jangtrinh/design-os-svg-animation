import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('Chemistry figures suite modules export valid contract', async () => {
  const figureFiles = [
    'chemistry-titration.js',
    'chemistry-burner.js',
    'chemistry-lattice.js',
    'chemistry-distillation.js',
    'chemistry-ph-scale.js'
  ];

  for (const file of figureFiles) {
    const modPath = path.join(ROOT, 'playground/chemistry-figures', file);
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

test('Chemistry suite HTML deliverables contain top-nav-bar and valid links', () => {
  const playgroundHtmlPath = path.join(ROOT, 'playground/chemistry.html');
  const docsHtmlPath = path.join(ROOT, 'docs/playground/chemistry.html');

  assert.ok(existsSync(playgroundHtmlPath), 'playground/chemistry.html should exist');
  assert.ok(existsSync(docsHtmlPath), 'docs/playground/chemistry.html should exist');

  const content = readFileSync(docsHtmlPath, 'utf8');
  assert.ok(content.includes('class="top-nav-bar"'), 'Should contain top-nav-bar');
  assert.ok(content.includes('href="../index.html"'), 'Should link back to parent index');
  assert.ok(content.includes('github.com/jangtrinh/design-os-svg-animation'), 'Should link to github repo');
  assert.ok(content.includes('[hidden] { display: none !important; }'), 'Should enforce [hidden] CSS display none');
});
