#!/usr/bin/env node
/**
 * render-drone-404-deliverable.mjs — proofs + exports for the single-line 404 drone.
 *
 * Needs the dev server (`npm run dev`, port from local-server-config.mjs). Steps:
 *   1. fidelity   rasterise the traced geometry alone and diff it against the reference
 *   2. frames     timeline keyframes via window.__seekToTime -> contact sheet
 *   3. pages      page screenshots at 375 / 768 / 1440, dark scheme, reduced motion, theme switch
 *   3b. hover     live pointer interaction (spotted, too close, settled, CTA hover)
 *   4. video      1920x1080 60 fps MP4 (intro + one full search loop)
 *   5. gif        seamless 8 s search loop, 720 px, 20 fps
 *
 * Usage: node scripts/render-drone-404-deliverable.mjs [--skip-video]
 */

import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCAL_SERVER_ORIGIN } from './local-server-config.mjs';
import { DRONE_LINE_ART } from '../src/primitives/drone-404-line-art-geometry.mjs';
import { DRONE_TIMING } from '../src/primitives/drone-404-motion.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROMO_DIR = path.join(ROOT_DIR, 'promo');
const PROOF_DIR = path.join(PROMO_DIR, 'drone-404-proofs');
const REFERENCE = path.join(ROOT_DIR, 'research/drone-404/reference-single-line-drone.png');
const PAGE_URL = `${LOCAL_SERVER_ORIGIN}/promo/drone-404.html`;
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG_BIN = '/opt/homebrew/bin/ffmpeg';
const skipVideo = process.argv.includes('--skip-video');

const out = name => path.join(PROOF_DIR, name);
const log = msg => console.log(`[drone-404] ${msg}`);

async function openPage(browser, { width = 1920, height = 1080, scheme = 'light', reducedMotion = false, clean = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: scheme },
    { name: 'prefers-reduced-motion', value: reducedMotion ? 'reduce' : 'no-preference' },
  ]);
  await page.goto(`${PAGE_URL}${clean ? '?clean=true' : ''}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => typeof window.__seekToTime === 'function');
  await page.evaluate(() => document.fonts.ready);
  return page;
}

const seek = (page, t) => page.evaluate(time => window.__seekToTime(time), t);

async function fidelity(browser) {
  const { width, height, segments } = DRONE_LINE_ART;
  const paths = segments.map(s => `<path d="${s.d}"/>`).join('');
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;background:#fff"><svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg></body>`);
  await page.screenshot({ path: out('fidelity-trace-render.png') });
  await page.close();
  // Overlay: reference ink red, traced ink cyan. Where they coincide the multiply turns black,
  // so any red or cyan left visible is a mismatch.
  execFileSync('magick', [
    '(', REFERENCE, '-fuzz', '60%', '-fill', 'red', '-opaque', 'black', ')',
    '(', out('fidelity-trace-render.png'), '-fuzz', '60%', '-fill', 'cyan', '-opaque', 'black', ')',
    '-compose', 'multiply', '-composite', out('fidelity-overlay.png'),
  ]);
  let metric = '';
  try {
    execFileSync('magick', ['compare', '-metric', 'AE', '-fuzz', '30%', REFERENCE, out('fidelity-trace-render.png'), 'null:'], { stdio: 'pipe' });
  } catch (error) {
    metric = String(error.stderr); // `compare` exits 1 when images differ at all; the metric is on stderr
  }
  const changed = Number(metric.split(' ')[0]);
  const ratio = changed / (width * height);
  fs.writeFileSync(out('fidelity-metric.txt'), `pixels differing (fuzz 30%): ${changed} of ${width * height} = ${(ratio * 100).toFixed(3)}%\n`);
  log(`fidelity: ${(ratio * 100).toFixed(3)}% of reference pixels differ (fuzz 30%)`);
}

async function frames(browser) {
  const page = await openPage(browser, { clean: true });
  const times = [0.6, 1.4, 2.3, 3.0, 3.8, 5.4, 6.9, 9.9, 10.4, 11.1, 12.4, 13.5];
  const files = [];
  for (const t of times) {
    await seek(page, t);
    const file = out(`frame-t${t.toFixed(1)}.png`);
    await page.screenshot({ path: file });
    files.push(file);
  }
  await page.close();
  execFileSync('magick', ['montage', ...files, '-tile', '4x', '-geometry', '576x324+6+6', '-label', '%f', out('timeline-contact-sheet.png')]);
  log(`frames: ${times.length} keyframes + contact sheet`);
}

async function pages(browser) {
  const shots = [
    { name: 'page-375-light.png', width: 375, height: 812 },
    { name: 'page-768-light.png', width: 768, height: 1024 },
    { name: 'page-1440-light.png', width: 1440, height: 900 },
    { name: 'page-1440-dark.png', width: 1440, height: 900, scheme: 'dark' },
    { name: 'page-1440-reduced-motion.png', width: 1440, height: 900, reducedMotion: true },
  ];
  for (const shot of shots) {
    const page = await openPage(browser, shot);
    if (!shot.reducedMotion) await seek(page, 7.3);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await page.screenshot({ path: out(shot.name), fullPage: true });
    log(`page ${shot.name} (horizontal overflow ${overflow}px)`);
    await page.close();
  }

  // Theme toggle: capture the circular reveal mid-flight and the settled result.
  const page = await openPage(browser, { width: 1440, height: 900 });
  await seek(page, 7.3);
  await page.click('#theme-toggle');
  await new Promise(r => setTimeout(r, 180));
  await page.screenshot({ path: out('theme-switch-mid.png') });
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: out('theme-switch-done.png') });
  const theme = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, label: document.getElementById('theme-toggle').getAttribute('aria-label'), saved: localStorage.getItem('d404-theme') }));
  log(`theme toggle -> ${JSON.stringify(theme)}`);
  await page.close();
}

/** Live hover interaction (real time, not the virtual clock); a red dot marks the pointer. */
async function interaction(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await page.evaluateOnNewDocument(() => localStorage.removeItem('d404-theme')); // the theme test saved "dark"
  await page.goto(`${PAGE_URL}?hold=4.2`, { waitUntil: 'networkidle0' }); // hover at HOME; only the live layer moves
  await page.evaluate(() => {
    const dot = Object.assign(document.createElement('div'), { id: 'pointer-marker' });
    dot.style.cssText = 'position:fixed;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#e11;pointer-events:none;z-index:99';
    document.body.append(dot);
    addEventListener('pointermove', e => { dot.style.left = `${e.clientX}px`; dot.style.top = `${e.clientY}px`; });
  });
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const drone = await page.evaluate(() => {
    const box = document.querySelector('.d404-silhouette').getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2, w: box.width };
  });
  const shots = [
    ['interaction-1-spotted.png', drone.x + drone.w * 0.55, drone.y + 190, 900],
    ['interaction-2-too-close.png', drone.x - drone.w * 0.12, drone.y, 260],
    ['interaction-3-settled-away.png', drone.x - drone.w * 0.12, drone.y, 1300],
  ];
  const pose = () => page.evaluate(() => document.querySelector('.d404-drone').getAttribute('transform'));
  const rest = await pose();
  for (const [name, x, y, settle] of shots) {
    await page.mouse.move(x, y, { steps: 12 });
    await wait(settle);
    await page.screenshot({ path: out(name) });
    log(`${name}: drone transform ${await pose()}`);
  }
  log(`at rest: ${rest}`);
  await page.hover('.btn-primary');
  await wait(1200);
  await page.screenshot({ path: out('interaction-4-back-home.png') });
  await page.close();
  const files = ['interaction-1-spotted.png', 'interaction-2-too-close.png', 'interaction-3-settled-away.png', 'interaction-4-back-home.png'].map(out);
  execFileSync('magick', ['montage', ...files, '-tile', '2x', '-geometry', '720x450+6+6', out('interaction-contact-sheet.png')]);
  log('interaction: spotted / too close / settled / back-home hover + contact sheet');
}

async function encode(browser, { file, from, to, fps, filters }) {
  const page = await openPage(browser, { clean: true });
  const args = ['-y', '-f', 'image2pipe', '-vcodec', 'png', '-r', String(fps), '-i', 'pipe:0', ...filters, file];
  const ffmpeg = spawn(FFMPEG_BIN, args, { stdio: ['pipe', 'ignore', 'inherit'] });
  const done = new Promise((resolve, reject) => ffmpeg.on('close', code => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)))));
  const total = Math.round((to - from) * fps);
  for (let f = 0; f < total; f += 1) {
    await seek(page, from + f / fps);
    ffmpeg.stdin.write(await page.screenshot({ type: 'png' }));
  }
  ffmpeg.stdin.end();
  await done;
  await page.close();
  log(`${path.relative(ROOT_DIR, file)}: ${total} frames @ ${fps} fps`);
}

async function main() {
  fs.mkdirSync(PROOF_DIR, { recursive: true });
  const probe = await fetch(PAGE_URL).catch(() => null);
  if (!probe?.ok) throw new Error(`Dev server not reachable at ${PAGE_URL}. Start it with: npm run dev`);

  const browser = await puppeteer.launch({ executablePath: CHROME_BIN, headless: 'new', args: ['--hide-scrollbars'] });
  try {
    await fidelity(browser);
    await frames(browser);
    await pages(browser);
    await interaction(browser);
    if (!skipVideo) {
      const loopEnd = DRONE_TIMING.seamlessFrom + DRONE_TIMING.loopPeriod;
      await encode(browser, {
        file: path.join(PROMO_DIR, 'drone-search-404.mp4'), from: 0, to: loopEnd, fps: 60,
        filters: ['-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '22', '-preset', 'slow', '-movflags', '+faststart'],
      });
      await encode(browser, {
        file: path.join(PROMO_DIR, 'drone-search-404.gif'), from: DRONE_TIMING.seamlessFrom, to: loopEnd, fps: 20,
        filters: ['-filter_complex', '[0:v]scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=32[p];[b][p]paletteuse=dither=none', '-loop', '0'],
      });
    }
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(`[drone-404] export failed: ${error.message}`);
  process.exit(1);
});
