#!/usr/bin/env node
/**
 * render-drone-404-deliverable.mjs — proofs + exports for an animated line-art 404 case.
 * A case (page, proof dir, selectors, fidelity source, timing, render settings) is
 * research/<case>/case.json; `render` fields fall back to the defaults below.
 *
 * Needs the dev server (`npm run dev`, port from local-server-config.mjs). Steps:
 *   1. fidelity   rasterise the geometry alone and diff it against the reference (ink or color mode)
 *   2. frames     timeline keyframes via window.__seekToTime -> contact sheet
 *   3. pages      page screenshots at 375 / 768 / 1440, dark scheme, reduced motion, theme switch
 *   3b. hover     live pointer interaction (render.interaction.shots, then CTA hover)
 *   4. video      1920x1080 60 fps MP4 (intro up to seamlessFrom + one loop)
 *   5. gif        one seamless loop, 720 px, 20 fps
 *   6. checks     flight bank profile chart (render.flightProfile); contact sheet decoded from the MP4
 *
 * Usage: node scripts/render-drone-404-deliverable.mjs [--case <research folder>] [--skip-video]
 */

import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCAL_SERVER_ORIGIN } from './local-server-config.mjs';
import { clearStaleProofs, fidelity, pageRestFidelity, flightProfile, encodedContactSheet } from './drone-404-proof-checks.mjs';
import { caseName, loadCase } from './line-art-cases.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CASE = loadCase(caseName(process.argv), ROOT_DIR);
const PROOF_DIR = CASE.proofDir;
const PAGE_URL = `${LOCAL_SERVER_ORIGIN}/${CASE.page}`;
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG_BIN = '/opt/homebrew/bin/ffmpeg';
const skipVideo = process.argv.includes('--skip-video');
const TIMING = await CASE.timing();
const LOOP_END = TIMING.seamlessFrom + TIMING.loopPeriod;
const spread = (n, from, to) => Array.from({ length: n }, (_, i) => Number((from + ((to - from) * (i + 0.5)) / n).toFixed(1)));
/** Exporter settings; a case overrides any field in case.json `render`. */
const RENDER = {
  frames: spread(12, 0, LOOP_END), // timeline keyframes for the contact sheet
  pageTime: Number((TIMING.seamlessFrom + TIMING.loopPeriod / 3).toFixed(1)), // pose for page screenshots
  videoFrames: spread(8, 0, LOOP_END), // frames decoded back out of the MP4
  videoCrop: null, // ffmpeg crop w:h:x:y applied to those frames, e.g. to zoom on the subject
  flightProfile: false, // drone only: bank-angle chart + the ~12 deg ceiling
  themeKey: null, // localStorage key the theme toggle writes; cleared before the hover run
  interaction: {
    hold: TIMING.seamlessFrom, // ?hold=<t>: freeze the timeline so only the live layer moves
    // pointer = target centre + at * target size + px; settle = ms before the screenshot
    shots: [
      { name: 'interaction-1-approach.png', at: [0.6, 0], settle: 900 },
      { name: 'interaction-2-on-target.png', at: [0, 0], settle: 260 },
      { name: 'interaction-3-settled.png', at: [0, 0], settle: 1300 },
    ],
  },
  ...CASE.render,
};

const out = name => path.join(PROOF_DIR, name);
const log = msg => console.log(`[${CASE.label}] ${msg}`);

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

async function frames(browser) {
  const page = await openPage(browser, { clean: true });
  const times = RENDER.frames;
  const files = [];
  for (const t of times) {
    await seek(page, t);
    const file = out(`frame-t${Number.isInteger(Math.round(t * 1000) / 100) ? t.toFixed(1) : t.toFixed(2)}.png`); // 3.0 -> 3.0, 4.65 -> 4.65
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
    if (!shot.reducedMotion) await seek(page, RENDER.pageTime);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await page.screenshot({ path: out(shot.name), fullPage: true });
    log(`page ${shot.name} (horizontal overflow ${overflow}px)`);
    await page.close();
  }

  // Theme toggle: capture the circular reveal mid-flight and the settled result.
  const page = await openPage(browser, { width: 1440, height: 900 });
  await seek(page, RENDER.pageTime);
  await page.click('#theme-toggle');
  await new Promise(r => setTimeout(r, 180));
  await page.screenshot({ path: out('theme-switch-mid.png') });
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: out('theme-switch-done.png') });
  const theme = await page.evaluate(key => ({ theme: document.documentElement.dataset.theme, label: document.getElementById('theme-toggle').getAttribute('aria-label'), saved: key && localStorage.getItem(key) }), RENDER.themeKey);
  log(`theme toggle -> ${JSON.stringify(theme)}`);
  await page.close();
}

/** Live hover interaction (real time, not the virtual clock); a red dot marks the pointer. */
async function interaction(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  if (RENDER.themeKey) await page.evaluateOnNewDocument(key => localStorage.removeItem(key), RENDER.themeKey); // the theme test saved "dark"
  await page.goto(`${PAGE_URL}?hold=${RENDER.interaction.hold}`, { waitUntil: 'networkidle0' }); // only the live layer moves
  await page.evaluate(() => {
    const dot = Object.assign(document.createElement('div'), { id: 'pointer-marker' });
    dot.style.cssText = 'position:fixed;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#e11;pointer-events:none;z-index:99';
    document.body.append(dot);
    addEventListener('pointermove', e => { dot.style.left = `${e.clientX}px`; dot.style.top = `${e.clientY}px`; });
  });
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const target = await page.evaluate(sel => {
    const box = document.querySelector(sel).getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2, w: box.width, h: box.height };
  }, CASE.selectors.silhouette);
  const shots = RENDER.interaction.shots.map(({ name, at = [0, 0], px = [0, 0], settle }) => (
    [name, target.x + at[0] * target.w + px[0], target.y + at[1] * target.h + px[1], settle]));
  const pose = () => page.evaluate(sel => document.querySelector(sel).getAttribute('transform'), CASE.selectors.body);
  const rest = await pose();
  const measurements = [`at rest: ${rest}`];
  for (const [name, x, y, settle] of shots) {
    await page.mouse.move(x, y, { steps: 12 });
    await wait(settle);
    await page.screenshot({ path: out(name) });
    measurements.push(`${name}: ${await pose()}`);
  }
  fs.writeFileSync(out('interaction-measurements.txt'), `${measurements.join('\n')}\n`);
  await page.hover('.btn-primary');
  await wait(1200);
  await page.screenshot({ path: out('interaction-4-back-home.png') });
  await page.close();
  const files = [...shots.map(([name]) => name), 'interaction-4-back-home.png'].map(out);
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
  // Video proofs survive a --skip-video run; everything else is regenerated from scratch.
  log(`cleared ${clearStaleProofs(PROOF_DIR, { keep: skipVideo ? ['mp4-contact-sheet.png'] : [] })} stale proofs`);
  const probe = await fetch(PAGE_URL).catch(() => null);
  if (!probe?.ok) throw new Error(`Dev server not reachable at ${PAGE_URL}. Start it with: npm run dev`);

  const browser = await puppeteer.launch({ executablePath: CHROME_BIN, headless: 'new', args: ['--hide-scrollbars'] });
  try {
    const geometry = await CASE.fidelityGeometry();
    if (CASE.referenceSvg && !fs.existsSync(CASE.reference)) { // vector source: rasterise it once at the fidelity frame size
      execFileSync(CHROME_BIN, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${geometry.width},${geometry.height}`, `--screenshot=${CASE.reference}`, `file://${CASE.referenceSvg}`], { stdio: 'ignore' });
    }
    const fit = await fidelity(browser, { geometry, reference: CASE.reference, outDir: PROOF_DIR });
    log(fit.mode === 'color'
      ? `fidelity: colour match ${(fit.recall * 100).toFixed(2)}% (painted area, 1 px edge tolerance)`
      : `fidelity: recall ${(fit.recall * 100).toFixed(2)}%, precision ${(fit.precision * 100).toFixed(2)}% (ink within 2 px)`);
    if (CASE.fidelity.page) { // the live renderer's rest pose, with every page-only layer it adds
      const match = await pageRestFidelity(browser, {
        url: `${PAGE_URL}?clean=true`, ...CASE.fidelity.page,
        viewBox: geometry.viewBox, width: geometry.width, height: geometry.height, reference: CASE.reference, outDir: PROOF_DIR,
      });
      log(`page rest-pose fidelity: colour match ${(match * 100).toFixed(2)}%`);
    }
    await frames(browser);
    await pages(browser);
    await interaction(browser);
    if (RENDER.flightProfile) {
      const maxBank = await flightProfile(browser, out('flight-bank-profile.png'));
      if (maxBank > 14) throw new Error(`max bank ${maxBank.toFixed(1)} deg exceeds the owner-accepted ~12 deg`);
      log(`flight profile: max |bank| ${maxBank.toFixed(1)} deg`);
    }
    if (!skipVideo) {
      await encode(browser, {
        file: CASE.video, from: 0, to: LOOP_END, fps: 60,
        filters: ['-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '22', '-preset', 'slow', '-movflags', '+faststart'],
      });
      await encode(browser, {
        file: CASE.gif, from: TIMING.seamlessFrom, to: LOOP_END, fps: 20,
        filters: ['-filter_complex', '[0:v]scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=32[p];[b][p]paletteuse=dither=none', '-loop', '0'],
      });
      encodedContactSheet(CASE.video, RENDER.videoFrames, out('mp4-contact-sheet.png'), path.join(ROOT_DIR, '.cache', `${CASE.label}-mp4-frames`), { crop: RENDER.videoCrop });
      log('mp4 contact sheet from the encoded video');
    }
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(`[${CASE.label}] export failed: ${error.message}`);
  process.exit(1);
});
