/* Shared loader for the tutorial kit: reads <project>/tutorial.config.json, checks it against CONFIG_SCHEMA,
 * evaluates the project's timeline files the way the page does (vm, no browser), builds the voiceover
 * placement table, and writes the page that render-tutorial.mjs opens. Every kit script and the
 * es-tutorial-video skill go through this file, so the config surface is defined exactly once. */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const KIT = path.dirname(fileURLToPath(import.meta.url));
export const CONFIG_FILE = 'tutorial.config.json';
export const LEAD = 0.5;   // seconds of picture before the voice enters a chapter
export const GAP = 0.3;    // minimum clearance a clip must leave before its chapter ends

/* One row per config key: [path, type, required, what it means]. The contract is generated from this table. */
export const CONFIG_SCHEMA = [
  ['slug', 'string', true, 'kebab-case id of the build, e.g. dc-01'],
  ['title', 'string', true, 'page title'],
  ['lang', 'string', true, 'html lang of the page, e.g. vi'],
  ['output', 'string', true, 'MP4 base name; the render writes out/<output>-<aspect>.mp4'],
  ['duration', 'number', true, 'T, seconds: length of the music bed the timeline is authored against'],
  ['grid.bpm', 'number', true, 'measured tempo; one bar = 240 / bpm seconds'],
  ['grid.db0', 'number', true, 'measured time of the first downbeat, seconds'],
  ['grid.measuredBy', 'string', true, 'how the grid was measured (never guessed)'],
  ['music.credit', 'string', true, 'credit line drawn on screen'],
  ['music.file', 'string', true, 'source track, relative to the project; must be git-ignored'],
  ['music.bed', 'string', true, 'bed the mix starts from, relative to the project; must be git-ignored'],
  ['music.gain', 'number', true, 'bed gain before ducking'],
  ['music.bedParams.introBars', 'number', false, 'build-music-bed.py: bars kept as intro'],
  ['music.bedParams.bodyStart', 'number', false, 'build-music-bed.py: first body bar (looped)'],
  ['music.bedParams.bodyEnd', 'number', false, 'build-music-bed.py: bar after the last body bar'],
  ['music.bedParams.outroBar', 'number', false, 'build-music-bed.py: first outro bar'],
  ['music.bedParams.phrases', 'number', false, 'build-music-bed.py: number of 8-bar body phrases'],
  ['evidence', 'string', true, 'evidence file written by extract-evidence.py'],
  ['timeline', 'string[]', true, 'timeline script files, loaded in order after the evidence'],
  ['voiceover.script', 'string', true, 'script json: segments[{id,text,window_s}]'],
  ['voiceover.clips', 'string', true, 'folder with one <segment id>.mp3 per segment'],
  ['approvals.storyboard', 'string|null', true, 'owner gate 1a: who/when approved the storyboard (null until approved)'],
  ['approvals.script', 'string|null', true, 'owner gate 1b: who/when approved the voice script (null until approved)'],
  ['reviewCapture.page', 'string', false, 'capture-review-page.mjs: html page to capture (~ allowed)'],
  ['reviewCapture.out', 'string', false, 'capture-review-page.mjs: output jpg, relative to the project'],
];

const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
const typeOk = (v, t) => (t === 'string[]' ? Array.isArray(v) && v.every((x) => typeof x === 'string')
  : t === 'string|null' ? v === null || typeof v === 'string' : typeof v === t && (t !== 'number' || Number.isFinite(v)));

/** Problems with a parsed config, as human lines (empty array = fine). */
export function configProblems(cfg) {
  const out = [];
  for (const [key, type, required] of CONFIG_SCHEMA) {
    const v = getPath(cfg, key);
    if (v === undefined) { if (required) out.push(`${key} is missing (${type})`); continue; }
    if (!typeOk(v, type)) out.push(`${key} must be ${type}`);
  }
  if (typeof cfg.slug === 'string' && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(cfg.slug)) out.push('slug must be kebab-case');
  if (cfg.grid && !(cfg.grid.bpm > 0)) out.push('grid.bpm must be > 0');
  if (cfg.duration !== undefined && !(cfg.duration > 0)) out.push('duration must be > 0');
  if (Array.isArray(cfg.timeline) && cfg.timeline.length === 0) out.push('timeline must list at least one file');
  return out;
}

/** Load and check a project; throws Error with every problem on one line each. */
export function loadProject(dirArg) {
  if (!dirArg) throw new Error('--project <dir> is required');
  const dir = path.resolve(dirArg);
  const file = path.join(dir, CONFIG_FILE);
  if (!fs.existsSync(file)) throw new Error(`${file} not found`);
  let cfg;
  try { cfg = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { throw new Error(`${file}: ${e.message}`); }
  const problems = configProblems(cfg);
  if (problems.length) throw new Error(`${file}:\n  ${problems.join('\n  ')}`);
  return { dir, cfg, file, bar: 240 / cfg.grid.bpm };
}

/** Evaluate the project's evidence + timeline files in a vm (what the page does, minus the DOM). */
export function loadTimeline(project) {
  const win = { DOS: { CONFIG: project.cfg } }; win.window = win;
  vm.createContext(win);
  for (const f of [project.cfg.evidence, ...project.cfg.timeline]) {
    vm.runInContext(fs.readFileSync(path.join(project.dir, f), 'utf8'), win, { filename: f });
  }
  const D = win.DOS;
  return { CH: D.CH || [], EL: D.EL || [], CAP: D.CAP || [], T: D.T, DOS: D, evidence: win.EVIDENCE || {} };
}

export const clipSeconds = (file) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }));

/** One row per voiceover segment: where it starts, where it ends, when its chapter ends, slack. */
export function placementTable(project, tl = loadTimeline(project)) {
  const script = JSON.parse(fs.readFileSync(path.join(project.dir, project.cfg.voiceover.script), 'utf8'));
  return (script.segments || []).map((s) => {
    const c = tl.CH.find((x) => x.id === s.id);
    const file = path.join(project.dir, project.cfg.voiceover.clips, `${s.id}.mp3`);
    const row = { id: s.id, file, chapter: !!c, clip: fs.existsSync(file) };
    if (!c || !row.clip) return row;
    row.start = Math.max(c.t0, 0) + LEAD;
    row.end = row.start + clipSeconds(file);
    row.limit = Math.min(c.t1, tl.T);
    row.slack = row.limit - row.end;
    row.overrun = row.slack < GAP;
    return row;
  });
}

/** Write the page for a project into a temp dir and return {file, url, cleanup}. Kit files are loaded by absolute
 *  URL, project files through <base href>, so a project holds data only and the kit is never copied. */
export function writePage(project, aspect) {
  const tpl = fs.readFileSync(path.join(KIT, 'tutorial.template.html'), 'utf8');
  const kit = pathToFileURL(KIT).href;
  const base = pathToFileURL(project.dir + path.sep).href;
  const scripts = project.cfg.timeline.map((f) => `<script src="${f}"></script>`).join('\n');
  const cfgJson = JSON.stringify(project.cfg).replace(/</g, '\\u003c');
  const html = tpl.replaceAll('{{LANG}}', project.cfg.lang).replaceAll('{{TITLE}}', project.cfg.title)
    .replaceAll('{{BASE}}', base).replaceAll('{{KIT}}', kit).replaceAll('{{CONFIG}}', cfgJson)
    .replaceAll('{{EVIDENCE}}', project.cfg.evidence).replaceAll('{{TIMELINE}}', scripts);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `tutorial-page-${project.cfg.slug}-`));
  const file = path.join(tmp, 'tutorial.html');
  fs.writeFileSync(file, html);
  const url = pathToFileURL(file).href + `?render=1${aspect === 'portrait' ? '&aspect=portrait' : ''}`;
  return { file, url, cleanup: () => fs.rmSync(tmp, { recursive: true, force: true }) };
}

/** Parse "--flag value" style args; a bare flag is true. */
export function flag(args, name, fallback) {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
}

/** sha256 of a contract body (everything but "_sha256"); contract.json carries it as its first field. */
export const contractDigest = (body) => crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
/** True when `contract` carries the digest of its own body, i.e. nobody edited it by hand. */
export const contractIntact = (contract) => { const { _sha256, ...body } = contract; return _sha256 === contractDigest(body); };
