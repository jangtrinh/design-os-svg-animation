/* Subtitle sidecars for a pedagogy v2 project: one cue per voice sentence, timed by the same sentence table the picture and the mix use.
 *   node make-subtitles.mjs --project <dir>      writes out/<output>-vi.srt/.vtt (sentence `text`) and out/<output>-en.srt/.vtt (`text_en`)
 * The text is the voice, word for word: no burn-in, no paraphrase. Needs a real clip for every sentence (no estimates).
 * Offline; no network. Exit 0 ok, 1 refused (not v2, missing clip or text_en), 2 cannot run. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { flag, loadProject, loadTimeline } from './tutorial-project.mjs';

export const LANGS = { vi: 'text', en: 'text_en' };
const pad = (n, w = 2) => String(n).padStart(w, '0');
/** HH:MM:SS<sep>mmm; whole milliseconds, so a cue never rounds past the next one. */
export const stamp = (sec, sep) => {
  const ms = Math.round(sec * 1000);
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}${sep}${pad(ms % 1000, 3)}`;
};
const oneLine = (t) => String(t).replace(/\s+/g, ' ').trim();

/** [{id, t0, t1, text}] in film order for one language; sentences without that language's text are left out. */
export function buildCues(table, lang) {
  const field = LANGS[lang];
  return Object.values(table).sort((a, b) => a.t0 - b.t0 || a.i - b.i)
    .filter((s) => typeof s[field] === 'string' && s[field].trim()).map((s) => ({ id: s.id, t0: s.t0, t1: s.t1, text: oneLine(s[field]) }));
}
export const toSrt = (cues) => cues.map((c, i) => `${i + 1}\n${stamp(c.t0, ',')} --> ${stamp(c.t1, ',')}\n${c.text}\n`).join('\n');
export const toVtt = (cues) => `WEBVTT\n\n${cues.map((c) => `${stamp(c.t0, '.')} --> ${stamp(c.t1, '.')}\n${c.text}\n`).join('\n')}`;

const secs = (h, m, s, ms) => Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
const TIME = '(\\d{2}):(\\d{2}):(\\d{2})[,.](\\d{3})';
const CUE = new RegExp(`^${TIME} --> ${TIME}$`);
/** Parse SRT or VTT text into [{t0, t1, text}]; throws on a line that is neither a time line, text nor a cue number. */
export function parseCues(text) {
  const out = [];
  for (const block of text.replace(/\r/g, '').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)) {
    if (block === 'WEBVTT') continue;
    const rows = block.split('\n');
    const at = rows.findIndex((r) => CUE.test(r));
    if (at < 0) throw new Error(`no time line in cue block "${rows[0].slice(0, 40)}"`);
    const m = CUE.exec(rows[at]);
    out.push({ t0: secs(...m.slice(1, 5)), t1: secs(...m.slice(5, 9)), text: rows.slice(at + 1).join('\n') });
  }
  return out;
}

export const subtitlePaths = (project, lang) => ['srt', 'vtt'].map((ext) => path.join(project.dir, 'out', `${project.cfg.output}-${lang}.${ext}`));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const die = (code, msg) => { console.error(msg); process.exit(code); };
  let project;
  try { project = loadProject(flag(args, '--project')); } catch (e) { die(2, e.message); }
  if (project.cfg.pedagogy !== 'v2') die(1, 'make-subtitles: this project is not pedagogy v2 (config pedagogy), so it has no sentence table');
  const tl = loadTimeline(project);
  const est = Object.values(tl.SENT).filter((s) => s.est).map((s) => s.id);
  if (est.length) die(1, `make-subtitles: no clip yet for ${est.join(', ')}; timings would be guesses, make the voice clips first`);
  for (const lang of Object.keys(LANGS)) {
    const cues = buildCues(tl.SENT, lang);
    if (cues.length !== Object.keys(tl.SENT).length) die(1, `make-subtitles: ${Object.keys(tl.SENT).length - cues.length} sentence(s) have no ${LANGS[lang]}; every sentence needs it`);
    const [srt, vtt] = subtitlePaths(project, lang);
    fs.mkdirSync(path.dirname(srt), { recursive: true });
    fs.writeFileSync(srt, toSrt(cues)); fs.writeFileSync(vtt, toVtt(cues));
    console.log(`${path.relative(project.dir, srt)}, ${path.relative(project.dir, vtt)} (${cues.length} cues)`);
  }
}
