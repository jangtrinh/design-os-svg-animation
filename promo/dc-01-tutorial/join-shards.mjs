/* Join the --shard outputs of one aspect into the final MP4 and mux the voiced mix.
 *   node join-shards.mjs landscape 3   ->  out/dc-01-tutorial-landscape.mp4 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out');
const [aspect, n] = [process.argv[2], Number(process.argv[3])];
const parts = Array.from({ length: n }, (_, i) => path.join(OUT, 'shards', `${aspect}-${i}.mp4`));
for (const p of parts) if (!fs.existsSync(p)) throw new Error(`missing shard ${p}`);
const list = path.join(OUT, 'shards', `${aspect}.txt`);
fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n') + '\n');
const out = path.join(OUT, `dc-01-tutorial-${aspect}.mp4`);
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-i', path.join(OUT, 'tutorial-audio.wav'),
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log(`joined ${n} shards -> ${path.relative(path.dirname(OUT), out)}`);
