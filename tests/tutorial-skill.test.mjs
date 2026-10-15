/* es-tutorial-video: skill shape, contract staleness, one broken fixture per validate check, owner gates, no-network, host bundle
 * drift, and the two worked examples (validate always; beats + look when Chrome is installed). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { contractIntact, configProblems } from '../promo/_tutorial-kit/tutorial-project.mjs';
import { writeBundle, bundleDrift } from '../scripts/sync-tutorial-skill-hosts.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = path.join(ROOT, 'skills', 'es-tutorial-video');
const GOOD = path.join(ROOT, 'tests', 'fixtures', 'tutorial', 'good');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const has = (bin) => !spawnSync(bin, ['-version']).error;
const HAS_FFMPEG = has('ffprobe') && has('ffmpeg');
const node = (args, opts = {}) => spawnSync(process.execPath, args, { encoding: 'utf8', cwd: ROOT, ...opts });
const read = (f) => fs.readFileSync(path.join(SKILL, f), 'utf8');
const tmpDirs = [];
const mkTmp = (p) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), `${p}-`)); tmpDirs.push(d); return d; };
test.after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }); });

/** Copy the good fixture into a fresh git repo so gitignore checks run for real. */
function fixtureProject() {
  const d = mkTmp('tutorial-fixture');
  fs.cpSync(GOOD, d, { recursive: true });
  fs.renameSync(path.join(d, 'gitignore.fixture'), path.join(d, '.gitignore'));
  assert.equal(spawnSync('git', ['init', '-q'], { cwd: d }).status, 0);
  return d;
}
const validate = (dir, extra = []) => node([path.join(SKILL, 'validate.mjs'), dir, ...extra]);
const lines = (r) => r.stdout.split('\n').filter(Boolean);

// ---------- A1 / A2: shape
test('SKILL.md: <=120 lines, name == folder, description "Use when" <=200 chars', () => {
  const text = read('SKILL.md');
  assert.ok(text.split('\n').length - 1 <= 120, 'SKILL.md is longer than 120 lines');
  const fm = text.match(/^---\n([\s\S]*?)\n---/)[1];
  assert.equal(fm.match(/^name: (.+)$/m)[1].trim(), 'es-tutorial-video');
  assert.equal(path.basename(SKILL), 'es-tutorial-video');
  const desc = fm.match(/^description: "(.+)"$/m)[1];
  assert.match(desc, /^Use when /);
  assert.ok(desc.length <= 200, `description is ${desc.length} chars`);
});

test('SKILL.md names every sibling file and every named file exists', () => {
  const text = read('SKILL.md');
  const projectLevel = new Set(['tutorial.config.json', 'storyboard.md', 'tutorial-timeline.js', 'evidence.js', 'tutorial-audio.wav', 'state.md']);
  const named = [...text.matchAll(/`([\w.-]+\.(?:md|mjs|json))`/g)].map((m) => m[1]).filter((n) => !projectLevel.has(n));
  assert.ok(named.length >= 8, `only ${named.length} files named`);
  for (const n of named) assert.ok(fs.existsSync(path.join(SKILL, n)) || fs.existsSync(path.join(SKILL, 'examples', n)), `${n} is named in SKILL.md but missing`);
  for (const e of fs.readdirSync(SKILL, { withFileTypes: true })) {
    if (e.name === 'SKILL.md' || e.name === '.DS_Store') continue;
    assert.ok(text.includes(e.isDirectory() ? `${e.name}/` : e.name), `${e.name} is not named in SKILL.md`);
  }
});

// ---------- M3: every rule has a home
test('rules.md: every rule has Rejected when and a valid Checked by', () => {
  const rules = read('rules.md');
  const blocks = rules.split(/^## /m).slice(1);
  assert.ok(blocks.length >= 10);
  const checks = [...read('validate.mjs').matchAll(/^ \*   ([a-z-]+)\s{2,}\S/gm)].map((m) => m[1]);
  assert.ok(checks.length >= 13, `validate header lists ${checks.length} checks`);
  const lookItems = new Set([...read('look.md').matchAll(/^(\d+)\. \*\*/gm)].map((m) => m[1]));
  const lookMachine = new Set([...read('look.mjs').matchAll(/^ \*   (L\d)\s/gm)].map((m) => m[1]));
  const used = new Set();
  for (const b of blocks) {
    const title = b.split('\n')[0];
    assert.match(b, /^Rejected when: /m, `${title}: no "Rejected when"`);
    assert.match(b, /^Keep it: /m, `${title}: no "Keep it"`);
    const by = b.match(/^Checked by: (.+)$/m);
    assert.ok(by, `${title}: no "Checked by"`);
    for (const c of by[1].split(',').map((s) => s.trim())) {
      if (c === 'review' || c === 'build:gate') continue;
      const [kind, id] = c.split(':');
      if (kind === 'validate') { assert.ok(checks.includes(id), `${title}: unknown validate check ${id}`); used.add(id); }
      else if (kind === 'look') assert.ok(lookItems.has(id) || lookMachine.has(id), `${title}: unknown look item ${id}`);
      else assert.fail(`${title}: bad Checked by "${c}"`);
    }
  }
  for (const c of checks) assert.ok(used.has(c), `validate check ${c} has no rule in rules.md`);
});

// ---------- A3 / M4: contract
test('contract.json is current and carries its own digest', () => {
  const r = node([path.join(ROOT, 'scripts', 'build-tutorial-contract.mjs'), '--check']);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(contractIntact(JSON.parse(read('contract.json'))));
  const first = read('contract.json').split('\n')[1];
  assert.match(first, /"_sha256": "[0-9a-f]{64}"/);
});

test('contract lists every config key and element type of the kit', () => {
  const c = JSON.parse(read('contract.json'));
  for (const k of ['grid.bpm', 'music.bed', 'approvals.storyboard', 'timeline']) assert.ok(c.config.some((x) => x.key === k), `config key ${k}`);
  for (const t of ['img', 'wipe', 'seq', 'grid', 'file', 'json', 'term', 'callout', 'scroll', 'hero', 'repo']) assert.ok(c.element_types[t], `element ${t}`);
  assert.ok(c.cli['render-tutorial.mjs'].includes('--shard') && c.cli['render-tutorial.mjs'].includes('--beats'));
});

// ---------- M5 / A5: validate, one broken fixture per check
test('validate: the good fixture passes', { skip: !HAS_FFMPEG && 'ffprobe missing' }, () => {
  const r = validate(fixtureProject());
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^ok: 13 checks passed/);
});

test('validate: --help prints the check list and exits 0', () => {
  const r = validate('--help');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /contract-intact[\s\S]*beat-names/);
});

test('validate: a missing project exits 2', () => {
  assert.equal(validate(path.join(os.tmpdir(), 'no-such-tutorial-project')).status, 2);
});

const mutate = (d, file, fn) => { const p = path.join(d, file); fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8'))); };
const broken = {
  'config-schema': (d) => mutate(d, 'tutorial.config.json', (t) => t.replace('"lang": "en",', '')),
  'timeline-eval': (d) => mutate(d, 'tutorial-timeline.js', (t) => t.replace("...ex('k')", "...ex('nope')")),
  'evidence-shape': (d) => mutate(d, 'data/evidence.js', (t) => t.replace('}};', '}, "bad": {"path": "x"}};')),
  'assets-exist': (d) => fs.rmSync(path.join(d, 'assets/a.png')),
  'script-authored': (d) => mutate(d, 'voiceover/script-vi.json', (t) => t.replace(/"segments": \[.*\]/, '"segments": []')),
  'script-clips': (d) => fs.rmSync(path.join(d, 'voiceover/clips/input.mp3')),
  'captions-overlap': (d) => mutate(d, 'tutorial-timeline.js', (t) => t.replace('cap(4, 6,', 'cap(3, 6,')),
  'display-block': (d) => mutate(d, 'tutorial-timeline.js', (t) => t.replace('Object.assign(D,', "const probe = { style: {} }; probe.style.display = 'block';\n  Object.assign(D,")),
  'no-home-path': (d) => fs.appendFileSync(path.join(d, 'assets/a.png'), '/Users/someone/build/state.blend'),
  'gitignore-music': (d) => fs.writeFileSync(path.join(d, '.gitignore'), 'audio/\n'),
  'beat-names': (d) => { fs.mkdirSync(path.join(d, 'out/beats-landscape'), { recursive: true }); fs.writeFileSync(path.join(d, 'out/beats-landscape/b01.jpg'), 'x'); },
};
for (const [check, breakIt] of Object.entries(broken)) {
  test(`validate: ${check} rejects its broken fixture with exactly one named line`, { skip: !HAS_FFMPEG && 'ffprobe missing' }, () => {
    const d = fixtureProject(); breakIt(d);
    const r = validate(d);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.deepEqual(lines(r).map((l) => l.split(':')[0]), [check], r.stdout);
    assert.match(lines(r)[0], /^[a-z-]+: \S/);
  });
}

test('validate: timeline-authored rejects an empty timeline', { skip: !HAS_FFMPEG && 'ffprobe missing' }, () => {
  const d = fixtureProject();
  mutate(d, 'tutorial-timeline.js', (t) => t.replace(/const CH = \[[\s\S]*?\]\.map/, 'const CH = [].map').replace(/  el\(\{ type[^\n]*\n/, '').replace(/  cap\(.*\n/g, ''));
  mutate(d, 'voiceover/script-vi.json', (t) => t.replace(/"segments": \[.*\]/, '"segments": []'));
  const r = validate(d);
  assert.equal(r.status, 1);
  assert.deepEqual(lines(r).map((l) => l.split(':')[0]), ['timeline-authored', 'script-authored']);
});

test('validate: script-clips rejects a clip that overruns its chapter', { skip: !HAS_FFMPEG && 'ffmpeg missing' }, () => {
  const d = fixtureProject();
  assert.equal(spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=22050:cl=mono', '-t', '9', '-q:a', '9', path.join(d, 'voiceover/clips/input.mp3')]).status, 0);
  const r = validate(d);
  assert.equal(r.status, 1);
  assert.match(lines(r)[0], /^script-clips: clip "input" ends 13\.50 s but its chapter ends 12\.00 s/);
  assert.equal(lines(r).length, 1);
});

test('validate: contract-intact refuses an edited contract', () => {
  const copy = mkTmp('tutorial-skill-copy');
  fs.cpSync(SKILL, path.join(copy, 'skill'), { recursive: true });
  const cp = path.join(copy, 'skill', 'contract.json');
  fs.writeFileSync(cp, fs.readFileSync(cp, 'utf8').replace('"required": true', '"required": false'));
  const r = node([path.join(copy, 'skill', 'validate.mjs'), '--only', 'contract-intact', GOOD], { env: { ...process.env, TUTORIAL_KIT: path.join(ROOT, 'promo', '_tutorial-kit') } });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /^contract-intact: contract\.json was edited by hand/);
});

test('kit config schema rejects wrong types and a bad slug', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(GOOD, 'tutorial.config.json'), 'utf8'));
  assert.deepEqual(configProblems(cfg), []);
  assert.ok(configProblems({ ...cfg, slug: 'Bad Slug' }).some((p) => p.includes('kebab-case')));
  assert.ok(configProblems({ ...cfg, duration: '20' }).some((p) => p.startsWith('duration')));
  assert.ok(configProblems({ ...cfg, approvals: { storyboard: 1, script: null } }).some((p) => p.startsWith('approvals.storyboard')));
});

// ---------- owner gates and no network
test('build: mix and render --full refuse without the owner approvals, and scaffold leaves them null', () => {
  const d = fixtureProject();
  mutate(d, 'tutorial.config.json', (t) => t.replace('"storyboard": "fixture", "script": "fixture"', '"storyboard": "fixture", "script": null'));
  for (const argv of [['mix', d], ['render', d, '--full']]) {
    const r = node([path.join(SKILL, 'build.mjs'), ...argv]);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stderr, /^gate: owner approval missing for script/);
  }
  const into = mkTmp('tutorial-scaffold');
  const s = node([path.join(SKILL, 'build.mjs'), 'scaffold', GOOD, 'demo-build', '--into', into]);
  assert.equal(s.status, 0, s.stderr);
  const cfg = JSON.parse(fs.readFileSync(path.join(into, 'demo-build-tutorial', 'tutorial.config.json'), 'utf8'));
  assert.deepEqual(cfg.approvals, { storyboard: null, script: null });
  assert.equal(node([path.join(SKILL, 'build.mjs'), 'scaffold', GOOD, 'demo-build', '--into', into]).status, 1, 'scaffold must not overwrite');
});

test('no skill or kit script makes a network call or names a voice API', () => {
  const files = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : /\.(mjs|js|py)$/.test(e.name) && files.push(p); } };
  walk(SKILL); walk(path.join(ROOT, 'promo', '_tutorial-kit')); files.push(path.join(ROOT, 'scripts', 'build-tutorial-contract.mjs'));
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    assert.doesNotMatch(text, /\bfetch\(|node:https?|from 'https?'|require\('https?'\)|urllib|requests\.|XMLHttpRequest/, `${path.relative(ROOT, f)} makes a network call`);
    assert.doesNotMatch(text, /elevenlabs\.io|xi-api-key|api\.elevenlabs/i, `${path.relative(ROOT, f)} names a voice API`);
  }
});

// ---------- M11 / A8: host bundles
test('host bundle is generated from skills/ + the kit and drift is detected', () => {
  const dest = mkTmp('tutorial-bundle');
  writeBundle(dest);
  assert.deepEqual(bundleDrift(dest), []);
  assert.ok(fs.existsSync(path.join(dest, 'es-tutorial-video', 'kit', 'tutorial-project.mjs')));
  fs.appendFileSync(path.join(dest, 'es-tutorial-video', 'rules.md'), '\nhand edit\n');
  fs.rmSync(path.join(dest, 'es-tutorial-video', 'kit', 'gh-mark.js'));
  assert.deepEqual(bundleDrift(dest).sort(), ['changed: rules.md', 'missing: kit/gh-mark.js']);
  const r = node([path.join(ROOT, 'scripts', 'sync-tutorial-skill-hosts.mjs'), '--check', '--dest', dest]);
  assert.equal(r.status, 1);
});

test('a bundle validates a project on its own (kit found at ./kit)', { skip: !HAS_FFMPEG && 'ffprobe missing' }, () => {
  const dest = mkTmp('tutorial-bundle-run');
  writeBundle(dest);
  const r = node([path.join(dest, 'es-tutorial-video', 'validate.mjs'), fixtureProject()]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('plugin hosts ship skills/ straight from the repo (no per-host copy to drift)', () => {
  const codex = JSON.parse(fs.readFileSync(path.join(ROOT, '.codex-plugin', 'plugin.json'), 'utf8'));
  assert.equal(codex.skills, './skills/');
  for (const f of ['.claude-plugin/marketplace.json', '.agents/plugins/marketplace.json']) assert.ok(fs.readFileSync(path.join(ROOT, f), 'utf8').includes('"./"'), `${f} source is the repo root`);
  assert.ok(fs.existsSync(path.join(ROOT, 'promo', '_tutorial-kit', 'tutorial-project.mjs')), 'the kit ships in the same plugin tree');
});

// ---------- M7: the two worked examples
for (const name of ['ck-001', 'dc-01']) {
  const ex = JSON.parse(fs.readFileSync(path.join(SKILL, 'examples', `${name}.json`), 'utf8'));
  const project = path.join(ROOT, ex.project);
  test(`example ${name}: validate exits 0`, { skip: !HAS_FFMPEG && 'ffprobe missing' }, () => {
    const r = validate(project);
    assert.equal(r.status, 0, r.stdout + r.stderr);
  });
  test(`example ${name}: build --beats then look exit 0`, { skip: !fs.existsSync(CHROME) && 'Chrome not installed', timeout: 300000 }, () => {
    const out = mkTmp(`tutorial-${name}`);
    const b = node([path.join(SKILL, 'build.mjs'), 'render', project, '--beats', '--out-dir', out]);
    assert.equal(b.status, 0, b.stderr);
    const expected = Math.round(JSON.parse(fs.readFileSync(path.join(project, 'tutorial.config.json'), 'utf8')).duration / (240 / JSON.parse(fs.readFileSync(path.join(project, 'tutorial.config.json'), 'utf8')).grid.bpm)) + 1;
    for (const a of ['landscape', 'portrait']) {
      const frames = fs.readdirSync(path.join(out, `beats-${a}`)).filter((f) => /^b\d{3}\.jpg$/.test(f));
      assert.equal(frames.length, expected, `${a} beat frames`);
      assert.ok(fs.statSync(path.join(out, `beat-sheet-${a}.jpg`)).size > 10000);
    }
    const sheet = path.join(out, 'look', 'look-sheet.png');
    const l = node([path.join(SKILL, 'look.mjs'), project, '--out', sheet], { timeout: 280000 });
    assert.equal(l.status, 0, l.stdout + l.stderr);
    assert.ok(fs.statSync(sheet).size > 50000);
  });
}

test('look: an element sticking out of the stage fails machine item L2 with exit 1', { skip: !fs.existsSync(CHROME) && 'Chrome not installed', timeout: 120000 }, () => {
  const d = fixtureProject();
  mutate(d, 'tutorial-timeline.js', (t) => t.replace('rect: [72, 132, 1010, 640]', 'rect: [1500, 132, 1010, 640]'));
  const l = node([path.join(SKILL, 'look.mjs'), d, '--out', path.join(mkTmp('tutorial-look'), 'sheet.png')]);
  assert.equal(l.status, 1, l.stdout + l.stderr);
  assert.match(l.stdout, /L2 edge: FAIL/);
  assert.match(l.stdout, /L1 fonts: ok/);
});
