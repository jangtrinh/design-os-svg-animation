/* Mix the voiceover over the music bed (config music.bed): each chapter clip starts LEAD s after its chapter opens, music
 * ducks under the voice (sidechain), result -> out/tutorial-audio.wav, which render-tutorial.mjs muxes.
 * Chapter times are read from the project's timeline files, so the mix can never drift from the picture.
 * The clips are read, never generated: this script makes no network call.
 *   node voiceover/mix-voiceover.mjs --project <dir>            mix and print the placement table
 *   node voiceover/mix-voiceover.mjs --project <dir> --check    print the table only (no ffmpeg) */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { flag, loadProject, loadTimeline, placementTable, clipSeconds } from '../tutorial-project.mjs';

const args = process.argv.slice(2);
const project = loadProject(flag(args, '--project'));
const tl = loadTimeline(project);
const T = tl.T;
const rows = placementTable(project, tl);
let bad = 0;
for (const r of rows) {
  if (!r.chapter) { console.error(`no chapter for segment ${r.id}`); bad++; continue; }
  if (!r.clip) { console.error(`no clip for segment ${r.id}: ${path.relative(project.dir, r.file)}`); bad++; continue; }
  if (r.overrun) bad++;
  console.log(`${r.id.padEnd(9)} ${r.start.toFixed(2).padStart(7)} → ${r.end.toFixed(2).padStart(7)}  chapter ends ${r.limit.toFixed(2).padStart(7)}  slack ${r.slack.toFixed(2)}${r.overrun ? '  OVERRUN' : ''}`);
}
if (bad) { console.error(`${bad} segment(s) cannot be placed: widen the chapter in the timeline WARP, or fix the clip/segment`); process.exit(1); }
if (args.includes('--check')) process.exit(0);

// voice bus: every clip delayed to its slot; music ducked by the voice, then both summed
const bed = path.join(project.dir, project.cfg.music.bed);
if (!fs.existsSync(bed)) { console.error(`music bed ${bed} not found`); process.exit(2); }
const inputs = rows.flatMap((r) => ['-i', r.file]);
const delays = rows.map((r, i) => `[${i + 1}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round(r.start * 1000)}:all=1[v${i}]`);
const filter = [...delays,
  `${rows.map((_, i) => `[v${i}]`).join('')}amix=inputs=${rows.length}:normalize=0,apad=whole_dur=${T}[vo]`,
  '[vo]asplit=2[vkey][vmix]',
  `[0:a]aresample=48000,volume=${project.cfg.music.gain}[mus]`,
  '[mus][vkey]sidechaincompress=threshold=0.02:ratio=8:attack=40:release=700[duck]',
  `[duck][vmix]amix=inputs=2:normalize=0,atrim=0:${T},loudnorm=I=-16:TP=-1.5:LRA=11[out]`].join(';');
const out = path.join(project.dir, 'out', 'tutorial-audio.wav');
fs.mkdirSync(path.dirname(out), { recursive: true });
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', bed, ...inputs, '-filter_complex', filter, '-map', '[out]', '-ar', '48000', out], { stdio: 'inherit' });
console.log(`wrote ${path.relative(project.dir, out)} (${clipSeconds(out).toFixed(2)} s)`);
