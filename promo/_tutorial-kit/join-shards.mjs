/* Join the --shard outputs of one aspect into the final MP4 and mux the voiced mix.
 *   node join-shards.mjs --project <dir> <aspect> <n>   ->  out/<output>-<aspect>.mp4 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { flag, loadProject } from './tutorial-project.mjs';
const args = process.argv.slice(2);
const project = loadProject(flag(args, '--project'));
const rest = args.filter((a, i) => a !== '--project' && args[i - 1] !== '--project');
const [aspect, n] = [rest[0], Number(rest[1])];
if (!['landscape', 'portrait'].includes(aspect) || !(n >= 1)) { console.error('usage: join-shards.mjs --project <dir> <landscape|portrait> <n>'); process.exit(2); }
const OUT = path.join(project.dir, 'out');
const parts = Array.from({ length: n }, (_, i) => path.join(OUT, 'shards', `${aspect}-${i}.mp4`));
for (const p of parts) if (!fs.existsSync(p)) throw new Error(`missing shard ${p}`);
const audio = path.join(OUT, 'tutorial-audio.wav');
if (!fs.existsSync(audio)) throw new Error(`missing ${audio}: run voiceover/mix-voiceover.mjs first`);
const list = path.join(OUT, 'shards', `${aspect}.txt`);
fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n') + '\n');
const out = path.join(OUT, `${project.cfg.output}-${aspect}.mp4`);
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-i', audio,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log(`joined ${n} shards -> ${path.relative(project.dir, out)}`);
