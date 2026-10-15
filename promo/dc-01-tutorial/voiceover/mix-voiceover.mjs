/* Mix the voiceover over the music bed (audio/music-bed.wav, built by build-music-bed.mjs): each chapter clip starts LEAD s after its chapter opens, music ducks
 * under the voice (sidechain), result -> out/tutorial-audio.wav, which render-tutorial.mjs muxes.
 * Chapter times are read from tutorial-timeline.js itself so the mix can never drift from the picture.
 *   node voiceover/mix-voiceover.mjs            mix and print the placement table
 *   node voiceover/mix-voiceover.mjs --check    print the table only (no ffmpeg) */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const LEAD = 0.5;      // seconds of picture before the voice enters each chapter
const GAP = 0.3;       // minimum clearance a clip must leave before its chapter ends
// bed gain per track: 'Technology' at 0.42 measured -17.9 dB (louder than the voice), 0.17 puts it near -26 dB
const MUSIC_GAIN = 0.17;

const ctx = { window: { DOS: {} } }; ctx.window.window = ctx.window;
vm.createContext(ctx.window);
for (const f of ['data/evidence.js', 'tutorial-timeline-core.js', 'tutorial-timeline-act1.js', 'tutorial-timeline-act2.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx.window);
const { CH, T } = ctx.window.DOS;

const script = JSON.parse(fs.readFileSync(path.join(HERE, 'script-vi.json'), 'utf8'));
const dur = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }));
const rows = script.segments.map((s) => {
  const c = CH.find((x) => x.id === s.id);
  if (!c) throw new Error(`no chapter for segment ${s.id}`);
  const file = path.join(HERE, 'clips', `${s.id}.mp3`);
  const start = Math.max(c.t0, 0) + LEAD, d = dur(file);
  return { id: s.id, file, start, end: start + d, limit: Math.min(c.t1, T) };
});
let bad = 0;
for (const r of rows) {
  const slack = r.limit - r.end;
  if (slack < GAP) bad++;
  console.log(`${r.id.padEnd(9)} ${r.start.toFixed(2).padStart(7)} → ${r.end.toFixed(2).padStart(7)}  chapter ends ${r.limit.toFixed(2).padStart(7)}  slack ${slack.toFixed(2)}${slack < GAP ? '  OVERRUN' : ''}`);
}
if (bad) { console.error(`${bad} clip(s) overrun their chapter: widen the chapter in tutorial-timeline.js WARP`); process.exit(1); }
if (process.argv.includes('--check')) process.exit(0);

// voice bus: every clip delayed to its slot; music ducked by the voice, then both summed
const inputs = rows.flatMap((r) => ['-i', r.file]);
const delays = rows.map((r, i) => `[${i + 1}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round(r.start * 1000)}:all=1[v${i}]`);
const filter = [...delays,
  `${rows.map((_, i) => `[v${i}]`).join('')}amix=inputs=${rows.length}:normalize=0,apad=whole_dur=${T}[vo]`,
  '[vo]asplit=2[vkey][vmix]',
  `[0:a]aresample=48000,volume=${MUSIC_GAIN}[mus]`,
  '[mus][vkey]sidechaincompress=threshold=0.02:ratio=8:attack=40:release=700[duck]',
  `[duck][vmix]amix=inputs=2:normalize=0,atrim=0:${T},loudnorm=I=-16:TP=-1.5:LRA=11[out]`].join(';');
const out = path.join(ROOT, 'out', 'tutorial-audio.wav');
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(ROOT, 'audio', 'music-bed.wav'), ...inputs, '-filter_complex', filter, '-map', '[out]', '-ar', '48000', out], { stdio: 'inherit' });
console.log(`wrote ${path.relative(ROOT, out)} (${dur(out).toFixed(2)} s)`);
