#!/usr/bin/env node
/* Render the DESIGN:OS 3D Blender promo from its pure seek(t) page.
 *   node render-promo.mjs --aspect landscape|portrait --beats      one frame per beat -> contact sheet
 *   node render-promo.mjs --aspect landscape|portrait --full       4 subframes/frame, tmix motion blur, 60 fps
 *   node render-promo.mjs --events                                 UI sound events JSON for the audio mix */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG = '/opt/homebrew/bin/ffmpeg';
const args = process.argv.slice(2);
const aspect = args.includes('--aspect') ? args[args.indexOf('--aspect') + 1] : 'landscape';
const portrait = aspect === 'portrait';
const [W, H] = portrait ? [1080, 1920] : [1920, 1080];
const OUT = path.join(HERE, 'out');
fs.mkdirSync(OUT, { recursive: true });

function run(bin, a, input) {
  return new Promise((res, rej) => {
    const p = spawn(bin, a, { stdio: [input ? 'pipe' : 'ignore', 'ignore', 'pipe'] });
    let err = ''; p.stderr.on('data', (d) => (err += d));
    p.on('close', (c) => (c === 0 ? res() : rej(new Error(`${bin} ${c}\n${err.slice(-2000)}`))));
    if (input) input(p);
  });
}

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: ['--hide-scrollbars', '--allow-file-access-from-files', '--disable-background-timer-throttling', '--force-color-profile=srgb'],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
const url = pathToFileURL(path.join(HERE, 'promo.html')).href + `?render=1${portrait ? '&aspect=portrait' : ''}`;
await page.goto(url, { waitUntil: 'networkidle0' });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => (i.complete ? i.decode().catch(() => {}) : new Promise((r) => (i.onload = r)))));
});
const meta = await page.evaluate(() => ({ B: DOS.B, T: DOS.T, fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family) }));
console.log(`aspect=${aspect} beat=${meta.B.toFixed(5)}s duration=${meta.T.toFixed(3)}s fonts=${[...new Set(meta.fonts)].join(',')}`);
const shot = async (t) => {
  await page.evaluate(async (x) => { window.seek(x); if (window.__framesReady) await window.__framesReady(); }, t);
  return page.screenshot({ type: 'jpeg', quality: 95 });
};

if (args.includes('--events')) {
  const ev = await page.evaluate(() => DOS.soundEvents());
  fs.writeFileSync(path.join(OUT, 'sound-events.json'), JSON.stringify(ev, null, 1));
  console.log(`events ${ev.length}`);
}

if (args.includes('--beats')) {
  const dir = path.join(OUT, `beats-${aspect}`);
  fs.mkdirSync(dir, { recursive: true });
  const n = Math.round(meta.T / meta.B);
  for (let i = 0; i <= n; i++) {
    const t = i === n ? meta.T : i * meta.B + meta.B * 0.5; // mid-beat shows the settled state of that beat
    fs.writeFileSync(path.join(dir, `b${String(i).padStart(2, '0')}.jpg`), await shot(t));
  }
  fs.writeFileSync(path.join(dir, 'first.jpg'), await shot(0));
  const tile = portrait ? '13x6' : '8x10';
  await run('/opt/homebrew/bin/montage', [...fs.readdirSync(dir).filter((f) => /^b\d+/.test(f)).sort().map((f) => path.join(dir, f)),
    '-tile', tile, '-geometry', portrait ? '216x384+4+4' : '384x216+4+4', '-background', '#cfccc6', path.join(OUT, `beat-sheet-${aspect}.jpg`)]);
  console.log(`beat sheet -> out/beat-sheet-${aspect}.jpg (${n + 1} frames)`);
}

if (args.includes('--full')) {
  const sub = 4, fps = 60, total = Math.round(meta.T * fps) * sub;
  const audio = path.join(OUT, 'promo-audio.wav');
  const out = path.join(OUT, `design-os-3d-blender-promo-${aspect}.mp4`);
  const t0 = Date.now();
  await run(FFMPEG, ['-y', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-r', String(fps * sub), '-i', '-',
    ...(fs.existsSync(audio) ? ['-i', audio] : []),
    '-vf', `tmix=frames=${sub}:weights='1 1 1 1',fps=${fps}`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
    '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    ...(fs.existsSync(audio) ? ['-c:a', 'aac', '-b:a', '256k', '-shortest'] : []), '-movflags', '+faststart', out],
  async (p) => {
    for (let i = 0; i < total; i++) {
      // subframes sample the shutter interval centred on each output frame
      const buf = await shot(Math.min(meta.T, (i + 0.5) / (fps * sub)));
      if (!p.stdin.write(buf)) await new Promise((r) => p.stdin.once('drain', r));
      if (i % 480 === 0) console.log(`  ${i}/${total} subframes ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    p.stdin.end();
  });
  console.log(`video -> ${out} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
