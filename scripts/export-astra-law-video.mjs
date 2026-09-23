#!/usr/bin/env node
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { createReadStream, mkdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DURATION = 77.594;
const FPS = 30;
const FRAMES = Math.ceil(DURATION * FPS);
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT = path.join(ROOT, '.cache/astra-for-law/astra-law-recreation.mp4');
const PROOFS = path.join(ROOT, '.cache/astra-for-law/proofs');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };

function serve() {
  const server = createServer((request, response) => {
    const decoded = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(ROOT, `.${decoded}`);
    if (!file.startsWith(`${ROOT}${path.sep}`)) { response.writeHead(403).end(); return; }
    try {
      if (!statSync(file).isFile()) throw new Error('not a file');
      response.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
      createReadStream(file).pipe(response);
    } catch { response.writeHead(404).end(); }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const proof = args.includes('--proof');
  const verify = args.includes('--verify');
  const reference = args.indexOf('--reference-audio');
  const audio = reference < 0 ? null : args[reference + 1];
  if (reference >= 0 && !audio) throw new Error('--reference-audio requires a file path');
  return { proof, verify, audio };
}

async function verifyPlayer(page) {
  const imageFailures = await page.$$eval('img', images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src));
  assert.deepEqual(imageFailures, [], `image load failures: ${imageFailures.join(', ')}`);
  const stage = await page.$eval('#video-stage', element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  assert.deepEqual(stage, { width: 1920, height: 1080 });
  assert.equal(await page.$eval('#motion-ir-stage path', element => element.getAttribute('d').includes('C')), true);
  for (const [time, id] of [[0.8, 'intro-scene'], [8.5, 'galaxy-scene'], [39, 'word-scene'], [63, 'private-doc-scene'], [76, 'outro-scene']]) {
    await page.evaluate(value => window.__seekToTime(value), time);
    const opacity = await page.$eval(`#${id}`, element => Number(getComputedStyle(element).opacity));
    assert.ok(opacity > 0.9, `${id} opacity ${opacity} at ${time}s`);
  }
  for (const time of [8.5, 21, 45]) {
    await page.evaluate(value => window.__seekToTime(value), time);
    const first = createHash('sha256').update(await page.screenshot({ type: 'png' })).digest('hex');
    await page.evaluate(value => window.__seekToTime(value), 63);
    await page.evaluate(value => window.__seekToTime(value), time);
    const second = createHash('sha256').update(await page.screenshot({ type: 'png' })).digest('hex');
    assert.equal(first, second, `out-of-order seek changed frame at ${time}s`);
  }
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluate(() => window.__seekToTime(45));
  assert.equal(await page.$eval('#tools-scene', element => Number(getComputedStyle(element).opacity)), 1);
  await page.evaluate(() => window.__seekToTime(4.5));
  assert.equal(await page.$eval('#motion-ir-stage path', element => Number(getComputedStyle(element).opacity)), 0);
  await page.evaluate(() => window.__seekToTime(1.9));
  assert.equal(await page.$eval('#frontier-scene h1', element => Number(getComputedStyle(element).opacity)), 1);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.evaluate(() => { window.__seekToTime(12); document.getElementById('btn-play-pause').click(); });
  await page.waitForFunction(() => Number(document.getElementById('video-scrubber').value) > 12.05);
  await page.evaluate(() => document.getElementById('btn-play-pause').click());
  assert.equal(await page.$eval('#btn-play-pause', button => button.textContent), 'Play');
  await page.$eval('#video-scrubber', input => { input.value = '29.5'; input.dispatchEvent(new Event('input', { bubbles: true })); });
  assert.equal(await page.$eval('#timecode', element => element.textContent.startsWith('00:29.5')), true);
  await page.$eval('[data-seek="76"]', button => button.click());
  assert.equal(await page.$eval('#scene-name', element => element.textContent), 'OpenAI');
  process.stdout.write('Player verification passed: assets, 1920x1080, Motion IR path, key scenes, repeatable seeks, reduced motion, transport controls.\n');
}

async function verifyRunner(browser, port) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${port}/promo/astra-law-promo.html`, { waitUntil: 'load' });
    await page.evaluate(() => window.__readyPromise);
    await page.evaluate(() => window.__seekToTime(0.8));
    const geometry = await page.evaluate(() => {
      const frame = document.getElementById('video-stage-frame').getBoundingClientRect();
      const stage = document.getElementById('video-stage').getBoundingClientRect();
      return { frame: [frame.x, frame.y, frame.width, frame.height], stage: [stage.x, stage.y, stage.width, stage.height] };
    });
    geometry.frame.forEach((value, index) => assert.ok(Math.abs(value - geometry.stage[index]) < 0.1, `Runner stage mismatch at ${index}: ${geometry}`));
    assert.ok(await page.$eval('#intro-scene h1', element => Number(getComputedStyle(element).opacity)) > 0.9);
    assert.equal(await page.$eval('#timecode', element => element.textContent.endsWith('01:17.6')), true);
    await page.$eval('[data-seek="8.5"]', button => button.click());
    assert.equal(await page.$eval('#timecode', element => element.textContent.startsWith('00:08.5')), true);
    mkdirSync(PROOFS, { recursive: true });
    await page.screenshot({ path: path.join(PROOFS, 'runner-1280.png'), type: 'png' });
    process.stdout.write('Studio Runner verification passed: responsive stage geometry, visible scene, rounded duration, chapter navigation.\n');
  } finally { await page.close(); }
}

async function writeFrame(page, output, second) {
  await page.evaluate(time => window.__seekToTime(time), second);
  await page.screenshot({ path: output, type: 'png' });
}

async function exportVideo(page, audio) {
  mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-r', String(FPS), '-i', 'pipe:0'];
  if (audio) args.push('-i', audio);
  args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS));
  if (audio) args.push('-map', '0:v:0', '-map', '1:a:0', '-c:a', 'aac', '-b:a', '192k');
  else args.push('-an');
  args.push('-t', String(DURATION), '-movflags', '+faststart', OUTPUT);
  const encoder = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'pipe'] });
  let errorLog = '';
  encoder.stderr.on('data', chunk => { errorLog += chunk.toString(); });
  const closed = new Promise((resolve, reject) => {
    encoder.on('error', reject);
    encoder.on('close', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}: ${errorLog.slice(-3000)}`)));
  });
  try {
    for (let frame = 0; frame < FRAMES; frame++) {
      await page.evaluate(time => window.__seekToTime(time), frame / FPS);
      const jpeg = await page.screenshot({ type: 'jpeg', quality: 94 });
      if (!encoder.stdin.write(jpeg)) await new Promise(resolve => encoder.stdin.once('drain', resolve));
      if (frame % 300 === 0 || frame === FRAMES - 1) process.stdout.write(`\rframes ${frame + 1}/${FRAMES}`);
    }
    encoder.stdin.end();
    await closed;
    process.stdout.write(`\n${OUTPUT}\n`);
  } catch (error) {
    encoder.kill();
    throw error;
  }
}

async function main() {
  const { proof, verify, audio } = parseArgs();
  if (audio && !statSync(audio).isFile()) throw new Error(`Missing reference audio: ${audio}`);
  const ffmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (ffmpeg.status !== 0) throw new Error('ffmpeg is unavailable');
  const server = await serve();
  let browser;
  try {
    browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-background-networking', '--hide-scrollbars'], defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 } });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const port = server.address().port;
    await page.goto(`http://127.0.0.1:${port}/promo/astra-law-promo.html?clean=true`, { waitUntil: 'load' });
    await page.evaluate(() => window.__readyPromise);
    if (errors.length) throw new Error(`Browser page error: ${errors.join('; ')}`);
    if (verify) { await verifyPlayer(page); await verifyRunner(browser, port); }
    else if (proof) {
      mkdirSync(PROOFS, { recursive: true });
      for (const second of [0.8, 2.8, 8.5, 15, 21, 31, 39, 45, 51, 56, 60, 63, 66, 69, 73, 76]) {
        const file = path.join(PROOFS, `frame-${String(second).replace('.', '-')}.png`);
        await writeFrame(page, file, second);
        process.stdout.write(`${second}s ${file}\n`);
      }
    } else await exportVideo(page, audio);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
