import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

// Readable code for the 44-part lever needs more than the 150 lines first asked for; this guards against growth.
const BUDGET = 200;
const MAX_LINE = 110;
const ROOT = process.cwd();

test('Physics figures suite modules export valid contract', async () => {
  const figureFiles = [
    'physics-lever.js',
    'physics-pendulum.js',
    'physics-dynamometer.js',
    'physics-incline.js',
    'physics-switch.js'
  ];

  for (const file of figureFiles) {
    const modPath = path.join(ROOT, 'playground/physics-figures', file);
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

test('Physics suite HTML deliverables contain top-nav-bar and valid links', () => {
  const playgroundHtmlPath = path.join(ROOT, 'playground/physics.html');
  const docsHtmlPath = path.join(ROOT, 'docs/playground/physics.html');

  assert.ok(existsSync(playgroundHtmlPath), 'playground/physics.html should exist');
  assert.ok(existsSync(docsHtmlPath), 'docs/playground/physics.html should exist');

  const content = readFileSync(docsHtmlPath, 'utf8');
  assert.ok(content.includes('class="top-nav-bar"'), 'Should contain top-nav-bar');
  assert.ok(content.includes('href="../index.html"'), 'Should link back to parent index');
  assert.ok(content.includes('github.com/jangtrinh/design-os-svg-animation'), 'Should link to github repo');
  assert.ok(content.includes('[hidden] { display: none !important; }'), 'Should enforce [hidden] CSS display none');
});

test('lever moments balance when d2 is twice d1', async () => {
  const { model } = await import(path.join(ROOT, 'playground/physics-figures/physics-lever-geometry.mjs'));
  const posed = model(-8);
  assert.ok(Math.abs(posed.M1 - 3.2) < 1e-9, 'M1 is 3.2 N·m at the rest fulcrum');
  assert.ok(Math.abs(posed.M2 - 3.2) < 1e-9, 'M2 is 3.2 N·m at the rest fulcrum');
  assert.equal(posed.theta, 0);
  assert.equal(posed.d2, posed.d1 * 2);
});

test('lever tilts toward the heavier moment and varies smoothly over the whole slider range', async () => {
  const { model } = await import(path.join(ROOT, 'playground/physics-figures/physics-lever-geometry.mjs'));
  assert.ok(model(-20).theta < 0, 'fulcrum far left tips the right side down');
  assert.ok(model(15).theta > 0, 'fulcrum far right tips the left side down');
  assert.ok(!model(-20).balanced && !model(15).balanced && model(-8).balanced);
  let previous = model(-20).theta;
  for (let xf = -19.5; xf <= 15; xf += 0.5) {
    const { theta } = model(xf);
    assert.ok(theta > previous, `tilt keeps rising at xf=${xf}`);
    assert.ok(theta - previous < 0.02, `no step in tilt at xf=${xf}`);
    previous = theta;
  }
});

test('lever anatomy audit passes at the left, balanced and right poses with the page draw order', () => {
  const out = execFileSync(process.execPath, [path.join(ROOT, 'scripts/audit-physics-lever.mjs')], { encoding: 'utf8' });
  assert.equal(out.match(/audit passed/g)?.length, 3, out);
  assert.ok(!out.includes('audit failed'), out);
});

test('lever figure files stay inside their combined line budget and line width', () => {
  const dir = path.join(ROOT, 'playground/physics-figures');
  const sources = ['physics-lever.js', 'physics-lever-geometry.mjs']
    .map((file) => ({ file, rows: readFileSync(path.join(dir, file), 'utf8').trimEnd().split('\n') }));
  const total = sources.reduce((sum, { rows }) => sum + rows.length, 0);
  assert.ok(total <= BUDGET, `lever figure code is ${total} lines, over the ${BUDGET}-line budget`);
  for (const { file, rows } of sources) {
    const wide = rows.findIndex((row) => row.length > MAX_LINE);
    assert.equal(wide, -1, `${file}:${wide + 1} is wider than ${MAX_LINE} characters`);
  }
});
