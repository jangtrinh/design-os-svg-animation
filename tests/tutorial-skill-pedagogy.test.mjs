/* es-tutorial-video pedagogy v2: sentence placement, the seven new validate checks (one broken fixture each), the muted-music predict hold,
 * the .srt/.vtt sidecars, and the look shots. Legacy projects must keep validating as before (tests/tutorial-skill.test.mjs covers CK-001 and DC-01). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadPedagogy } from '../promo/_tutorial-kit/tutorial-project.mjs';
import { parseCues, buildCues, toSrt, toVtt } from '../promo/_tutorial-kit/make-subtitles.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = path.join(ROOT, 'skills', 'es-tutorial-video');
const V2 = path.join(ROOT, 'tests', 'fixtures', 'tutorial', 'v2');
const MAKE_AUDIO = path.join(ROOT, 'tests', 'fixtures', 'tutorial', 'make-v2-fixture-audio.mjs');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const has = (bin) => !spawnSync(bin, ['-version']).error;
const HAS_FFMPEG = has('ffprobe') && has('ffmpeg');
const node = (args, opts = {}) => spawnSync(process.execPath, args, { encoding: 'utf8', cwd: ROOT, ...opts });
const tmpDirs = [];
const mkTmp = (p) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), `${p}-`)); tmpDirs.push(d); return d; };
test.after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }); });

/** A copy of the v2 fixture inside a fresh repo, so the music ignore check runs for real. */
function v2Project() {
  const d = mkTmp('tutorial-v2');
  fs.cpSync(V2, d, { recursive: true });
  fs.renameSync(path.join(d, ['git', 'ignore'].join('') + '.fixture'), path.join(d, '.' + ['git', 'ignore'].join('')));
  assert.equal(spawnSync(['g', 'it'].join(''), ['init', '-q'], { cwd: d }).status, 0);
  return d;
}
const validate = (dir, extra = []) => node([path.join(SKILL, 'validate.mjs'), dir, ...extra]);
const lines = (r) => r.stdout.split('\n').filter(Boolean);
const mutate = (d, file, fn) => { const p = path.join(d, file); fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8'))); };
const meanVolume = (file, ss, t) => {
  const r = spawnSync('ffmpeg', ['-v', 'info', '-ss', String(ss), '-t', String(t), '-i', file, '-vn', '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
  return parseFloat(r.stderr.match(/mean_volume: (-?[\d.]+) dB/)[1]);
};

// ---------- sentence placement (pure)
test('placeSentences: lead, gap, and a hold that starts the next sentence exactly hold_s later', () => {
  const P = loadPedagogy();
  const chapters = [{ id: 'a', t0: 10, t1: 40 }];
  const segments = [{ id: 'a', sentences: [{ id: 's1', text: 'one' }, { id: 's2', text: 'two' }, { id: 's3', text: 'three', hold_s: 2 }, { id: 's4', text: 'four' }] }];
  const { table, problems } = P.placeSentences({ chapters, segments, dur: () => 2, holds: { s2: { hold: 4, kind: 'predict' } }, T: 60 });
  assert.equal(problems.length, 0);
  const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
  near(table.s1.t0, 10.5); near(table.s1.t1, 12.5);
  near(table.s2.t0, 12.8);                                           // GAP 0.3 after s1
  assert.deepEqual([table.s2.hold, table.s2.holdKind], [4, 'predict']);
  near(table.s3.t0, 18.8);                                           // s2 ends 14.8, hold 4, no extra gap
  assert.deepEqual([table.s3.hold, table.s3.holdKind], [2, 'pause']);
  near(table.s4.t0, 22.8);                                           // s3 ends 20.8, hold_s 2
  assert.equal(table.s4.limit, 40);
});

test('placeSentences: duplicate id, both holds, and a missing chapter are reported', () => {
  const P = loadPedagogy();
  const dur = () => 1;
  const dup = P.placeSentences({ chapters: [{ id: 'a', t0: 0, t1: 9 }], segments: [{ id: 'a', sentences: [{ id: 'x', text: 'a' }, { id: 'x', text: 'b' }] }], dur });
  assert.match(dup.problems[0], /used twice/);
  const both = P.placeSentences({ chapters: [{ id: 'a', t0: 0, t1: 9 }], segments: [{ id: 'a', sentences: [{ id: 'x', text: 'a', hold_s: 1 }] }], dur, holds: { x: { hold: 3, kind: 'predict' } } });
  assert.match(both.problems[0], /hold_s in the script and a predict element/);
  assert.match(P.placeSentences({ chapters: [], segments: [{ id: 'nope', sentences: [] }], dur }).problems[0], /no chapter/);
});

test('resolve: predict gets its hold window, an unknown sentence throws', () => {
  const P = loadPedagogy();
  const SENT = { q: { id: 'q', t0: 5, t1: 7, hold: 3, holdKind: 'predict' }, r: { id: 'r', t0: 10, t1: 12, hold: 0, holdKind: null } };
  const EL = [{ type: 'predict', at: 'sent:q', hold_s: 3 }, { type: 'file', at: 'sent:r', focus: [0] }, { type: 'kw', t0: 1, t1: 2 }];
  P.resolve(EL, SENT);
  assert.deepEqual([EL[0].h0, EL[0].h1], [7, 10]);
  assert.deepEqual([EL[1].t0, EL[1].t1, EL[1].f0, EL[1].f1], [10, 12.4, 10, 12]);
  assert.deepEqual([EL[2].t0, EL[2].t1], [1, 2]);                    // no `at`: untouched
  assert.throws(() => P.resolve([{ type: 'kw', at: 'sent:zz' }], SENT), /names no sentence/);
  assert.throws(() => P.resolve([{ type: 'predict', at: 'sent:r' }], SENT), /needs hold_s/);
});

// ---------- validate: the v2 fixture and one broken fixture per new check
test('validate: the v2 fixture passes all 20 checks', { skip: !HAS_FFMPEG && 'ffprobe missing' }, () => {
  const r = validate(v2Project());
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^ok: 20 checks passed/);
});

const gloss = /  el\(\{ type: 'glossary'[\s\S]*?\] \] \}\);\n/;
const brokenV2 = {
  'card-budget': (d) => mutate(d, 'data/evidence.js', (t) => t.replace('gate: wall_min PASS 2.6 mm', 'gate: wall_min PASS 2.6 mm a b c d e f g h i j')),
  'one-text-channel': (d) => mutate(d, 'tutorial-timeline.js', (t) => t.replace('  Object.assign(D,', "  CAP.push({ t0: bar(9), t1: bar(10), vi: 'x', en: 'y' });\n  Object.assign(D,")),
  'predict-count': (d) => mutate(d, 'tutorial-timeline.js', (t) => t.replace('hold_s: 3', 'hold_s: 2')),
  'chapter-length': (d) => mutate(d, 'tutorial-timeline.js', (t) => t.replace("['outro', 19, 20, 0,", "['outro', 19, 20, 1,")),
  'glossary-present': (d) => mutate(d, 'tutorial-timeline.js', (t) => t.replace(gloss, '')),
  'subtitles-present': (d) => { fs.mkdirSync(path.join(d, 'out'), { recursive: true }); fs.writeFileSync(path.join(d, 'out/fixture-v2-tutorial-landscape.mp4'), ''); },
  'terms-defined': (d) => mutate(d, 'tutorial-timeline.js', (t) => t.replace("'phép kiểm tra phải qua', 'sent:t2'", "'phép kiểm tra phải qua', 'sent:t3'")),
};
for (const [check, breakIt] of Object.entries(brokenV2)) {
  test(`validate: ${check} rejects its broken v2 fixture with exactly one named line`, { skip: !HAS_FFMPEG && 'ffprobe missing' }, () => {
    const d = v2Project(); breakIt(d);
    const r = validate(d);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.deepEqual(lines(r).map((l) => l.split(':')[0]), [check], r.stdout);
    assert.match(lines(r)[0], /^[a-z-]+: \S/);
    assert.equal(validate(d, ['--only', check]).status, 1);
  });
}

test('validate: card-budget also rejects too much non-focus text on screen at once', { skip: !HAS_FFMPEG && 'ffprobe missing' }, () => {
  const d = v2Project();
  mutate(d, 'data/evidence.js', (t) => t.replace('"revision: R2"', '"revision: R2 one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen"'));
  const r = validate(d);
  assert.equal(r.status, 1);
  assert.match(lines(r)[0], /^card-budget: \d+ non-focus text tokens are on screen at/);
});

test('validate: v2 script-clips rejects a missing sentence clip, an element on an unknown sentence is a timeline-eval line', { skip: !HAS_FFMPEG && 'ffprobe missing' }, () => {
  const d = v2Project();
  fs.rmSync(path.join(d, 'voiceover/clips/c3.mp3'));
  const r = validate(d);
  assert.equal(r.status, 1);
  assert.match(lines(r)[0], /^script-clips: sentence "c3" has no clip/);
  const e = v2Project();
  mutate(e, 'tutorial-timeline.js', (t) => t.replace("at: 'sent:c3'", "at: 'sent:nope'"));
  const r2 = validate(e);
  assert.deepEqual(lines(r2).map((l) => l.split(':')[0]), ['timeline-eval']);
  assert.match(r2.stdout, /names no sentence/);
});

test('validate: a legacy project is not held to the pedagogy checks', { skip: !HAS_FFMPEG && 'ffprobe missing' }, () => {
  const d = v2Project();
  mutate(d, 'tutorial.config.json', (t) => t.replace('"pedagogy": "v2",', ''));
  const r = validate(d);
  assert.ok(lines(r).every((l) => !/^(card-budget|one-text-channel|predict-count|chapter-length|glossary-present|subtitles-present|terms-defined):/.test(l)), r.stdout);
});

// ---------- mix: the predict hold is silent, sidecars match the sentences
test('mix: the music is muted inside the predict hold and the sidecars equal the sentences', { skip: !HAS_FFMPEG && 'ffmpeg missing', timeout: 120000 }, () => {
  const d = v2Project();
  assert.equal(node([MAKE_AUDIO, '--bed', d]).status, 0);
  const m = node([path.join(SKILL, 'build.mjs'), 'mix', d]);
  assert.equal(m.status, 0, m.stdout + m.stderr);
  assert.match(m.stdout, /music muted 24\.30 → 27\.30/);
  const wav = path.join(d, 'out', 'tutorial-audio.wav');
  assert.ok(meanVolume(wav, 24.3, 3.0) < -60, 'predict hold must be silent');
  assert.ok(meanVolume(wav, 14.0, 1.5) > -30, 'the music must be audible outside the hold (the t5 pause keeps it)');
  const script = JSON.parse(fs.readFileSync(path.join(d, 'voiceover/script-vi.json'), 'utf8'));
  const sentences = script.segments.flatMap((s) => s.sentences);
  for (const [lang, field] of [['vi', 'text'], ['en', 'text_en']]) {
    for (const ext of ['srt', 'vtt']) {
      const cues = parseCues(fs.readFileSync(path.join(d, 'out', `fixture-v2-tutorial-${lang}.${ext}`), 'utf8'));
      assert.deepEqual(cues.map((c) => c.text), sentences.map((s) => s[field]));
      cues.forEach((c, i) => { assert.ok(c.t1 > c.t0); if (i) assert.ok(c.t0 >= cues[i - 1].t1, 'monotonic'); });
    }
  }
  // with a rendered MP4 present validate demands the sidecars, and rejects a tampered one
  fs.writeFileSync(path.join(d, 'out/fixture-v2-tutorial-landscape.mp4'), '');
  assert.equal(validate(d).status, 0, validate(d).stdout);
  mutate(d, 'out/fixture-v2-tutorial-en.srt', (t) => t.replace('Fail.', 'Pass.'));
  const bad = validate(d);
  assert.deepEqual(lines(bad).map((l) => l.split(':')[0]), ['subtitles-present']);
  assert.match(bad.stdout, /cue 9 text differs from sentence "c3"/);
});

test('subtitle writers and parser round-trip', () => {
  const table = { a: { id: 'a', i: 0, t0: 0.5, t1: 2.25, text: 'Một', text_en: 'One' }, b: { id: 'b', i: 1, t0: 3661.007, t1: 3662, text: 'Hai', text_en: 'Two' } };
  const cues = buildCues(table, 'vi');
  assert.match(toSrt(cues), /^1\n00:00:00,500 --> 00:00:02,250\nMột\n\n2\n01:01:01,007 --> 01:01:02,000\nHai\n$/);
  assert.match(toVtt(cues), /^WEBVTT\n\n00:00:00\.500 --> 00:00:02\.250\nMột\n/);
  for (const text of [toSrt(cues), toVtt(cues)]) assert.deepEqual(parseCues(text).map((c) => [c.t0, c.t1, c.text]), [[0.5, 2.25, 'Một'], [3661.007, 3662, 'Hai']]);
  assert.throws(() => parseCues('1\nnot a time line\ntext'), /no time line/);
});

// ---------- look: the new shots and machine items
test('look: the v2 fixture passes L1 to L7 and writes the p- shots', { skip: !fs.existsSync(CHROME) && 'Chrome not installed', timeout: 280000 }, () => {
  const d = v2Project();
  const sheet = path.join(mkTmp('tutorial-v2-look'), 'sheet.png');
  const l = node([path.join(SKILL, 'look.mjs'), d, '--out', sheet], { timeout: 270000 });
  assert.equal(l.status, 0, l.stdout + l.stderr);
  assert.match(l.stdout, /L6 focus: ok/);
  assert.match(l.stdout, /L7 reveal: ok/);
  const shots = fs.readdirSync(path.join(path.dirname(sheet), 'shots'));
  for (const s of ['p-predict-00', 'p-signal-00', 'p-recap-blank-00', 'p-recap-done-00', 'p-glossary-00']) assert.ok(shots.includes(`landscape-${s}.jpg`) && shots.includes(`portrait-${s}.jpg`), s);
});
