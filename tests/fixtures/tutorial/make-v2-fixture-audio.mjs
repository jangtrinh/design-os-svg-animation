/* Placeholder audio for the pedagogy v2 fixture (tests/fixtures/tutorial/v2). No network, no voice API: ffmpeg sine tones only.
 *   node make-v2-fixture-audio.mjs --clips <v2-dir>        one short tone per sentence -> voiceover/clips/<id>.mp3 (committed: ~4 KB each)
 *   node make-v2-fixture-audio.mjs --bed <project-dir>     a 40 s synthetic bed -> audio/music-bed.wav (git-ignored, never committed)
 * The bed has a kick on every beat of 120 BPM plus a held tone, so it is clearly audible wherever the mix does not mute it. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const CLIPS = { t1: 1.8, t2: 2.2, t3: 2.8, t4: 2.2, t5: 2.4, i0: 1.5, c1: 3.7, c2: 2.0, c3: 3.6, c4: 1.3 };
const args = process.argv.slice(2);
const val = (n) => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };
const ff = (a) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...a], { stdio: 'inherit' });

if (val('--clips')) {
  const dir = path.join(path.resolve(val('--clips')), 'voiceover', 'clips');
  fs.mkdirSync(dir, { recursive: true });
  Object.entries(CLIPS).forEach(([id, d], i) => {
    ff(['-f', 'lavfi', '-i', `sine=frequency=${200 + 22 * i}:duration=${d}`, '-af', `volume=0.5,afade=t=in:d=0.03,afade=t=out:st=${(d - 0.06).toFixed(2)}:d=0.06`,
      '-ac', '1', '-ar', '22050', '-b:a', '24k', path.join(dir, `${id}.mp3`)]);
  });
  console.log(`${Object.keys(CLIPS).length} placeholder clips -> ${path.relative(process.cwd(), dir)}`);
}
if (val('--bed')) {
  const out = path.join(path.resolve(val('--bed')), 'audio', 'music-bed.wav');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  ff(['-f', 'lavfi', '-i', "aevalsrc='0.55*sin(2*PI*58*t)*exp(-9*mod(t,0.5))+0.12*sin(2*PI*196*t)*(0.6+0.4*sin(2*PI*0.25*t))':s=48000:d=40", '-ac', '2', '-ar', '48000', out]);
  console.log(`synthetic bed -> ${path.relative(process.cwd(), out)}`);
}
if (!val('--clips') && !val('--bed')) { console.error('give --clips <v2-dir> and/or --bed <project-dir>'); process.exit(2); }
