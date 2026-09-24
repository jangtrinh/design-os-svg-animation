#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { seekFrame } from './astra-law-capture.mjs';
import { renderedPixelDifference, serveFiles } from './astra-law-export-support.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DURATION = 77.594;
const FPS = 30;
const FRAMES = Math.ceil(DURATION * FPS);
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT = path.join(ROOT, '.cache/astra-for-law/astra-law-recreation.mp4');
const OUTPUT_PENDING = path.join(ROOT, '.cache/astra-for-law/astra-law-recreation.pending.mp4');
const PROOFS = path.join(ROOT, '.cache/astra-for-law/proofs');

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
  await page.evaluate(() => window.__seekToTime(18.8));
  assert.ok(await page.$eval('#composer-scene', element => Number(getComputedStyle(element).opacity)) > 0.95);
  assert.ok(await page.$eval('#firm-scene', element => Number(getComputedStyle(element).opacity)) < 0.05);
  assert.equal(await page.$eval('#composer-text', element => element.dataset.placeholder), 'Work on anything');
  await page.evaluate(() => window.__seekToTime(7.4));
  assert.ok(await page.$eval('#point-scene', element => Number(getComputedStyle(element).opacity)) > 0.95,
    'the growing black disk should remain opaque before the galaxy reveal');
  const irisDiameter = await page.$eval('#point-scene svg path:last-child', element => element.getBBox().width);
  assert.ok(irisDiameter >= 145 && irisDiameter <= 155, `7.4s iris diameter ${irisDiameter} differs from source`);
  for (const [time, minimum, maximum] of [[7.5, 12, 15], [7.55, 29, 30.5], [7.5667, 29, 30.5], [7.6, 47, 50]]) {
    await page.evaluate(value => window.__seekToTime(value), time);
    const disk = await page.$eval('#motion-ir-stage path', element => {
      const bounds = element.getBBox();
      return { scale: bounds.width / 36, opacity: Number(getComputedStyle(element).opacity) };
    });
    assert.ok(disk.scale >= minimum && disk.scale <= maximum && disk.opacity > 0.99,
      `disk coverage at ${time}s differs from the sampled source: ${JSON.stringify(disk)}`);
    assert.ok(await page.$eval('#point-scene', element => Number(getComputedStyle(element).opacity)) > 0.99,
      `white canvas must remain opaque around the disk at ${time}s`);
    assert.ok(await page.$eval('#galaxy-scene', element => Number(getComputedStyle(element).opacity)) < 0.01,
      `dark scene must wait for disk coverage at ${time}s`);
  }
  await page.evaluate(() => window.__seekToTime(7.65));
  assert.ok(await page.$eval('#galaxy-scene', element => Number(getComputedStyle(element).opacity)) > 0.99,
    'dark scene must cover the canvas after the iris');
  assert.equal(await page.$eval('#galaxy-scene h1', element => element.textContent), 'Astra',
    'galaxy title must begin with the single source word');
  await page.evaluate(() => window.__seekToTime(10.4));
  assert.ok(await page.$eval('#galaxy-scene', element => Number(getComputedStyle(element).opacity)) > 0.95,
    'the spiral should remain dark during its exit warp');
  await page.evaluate(() => window.__seekToTime(10.6));
  assert.ok(await page.$eval('#galaxy-scene', element => Number(getComputedStyle(element).opacity)) > 0.95,
    'the radial tunnel should still be on screen at 10.6s');
  assert.ok(await page.$eval('#methods-scene', element => Number(getComputedStyle(element).opacity)) < 0.05,
    'the white text chapter must wait for the tunnel exit');
  await page.evaluate(() => window.__seekToTime(18.4));
  assert.ok(await page.$eval('#firm-title', element => Number(getComputedStyle(element).opacity)) < 0.1,
    'the firm heading should clear while the last tile bridges into composer');
  await page.evaluate(() => window.__seekToTime(16));
  const firmRow = await page.$$eval('.firm-tiles>div', tiles => tiles.map(tile => {
    const { x, y, width } = tile.getBoundingClientRect();
    return { x, y, width };
  }));
  assert.ok(Math.abs(firmRow[0].x - 517) < 2 && Math.abs(firmRow[0].y - 595) < 2
    && firmRow.every(tile => Math.abs(tile.width - 200) < 2),
  `firm tile row must follow the measured 16s source geometry: ${JSON.stringify(firmRow)}`);
  await page.evaluate(() => window.__seekToTime(18.2));
  const cooley = await page.$eval('.firm-tiles>div:last-child', element => element.getBoundingClientRect().toJSON());
  assert.ok(Math.abs(cooley.x - 816) < 2 && Math.abs(cooley.y - 545) < 2 && Math.abs(cooley.width - 300) < 2,
    `Cooley handoff must land on the measured source geometry: ${JSON.stringify(cooley)}`);
  assert.ok(await page.$eval('#firm-cursor', element => Number(getComputedStyle(element).opacity)) > 0.95,
    'the source-matched pointer should remain at the Cooley handoff');
  await page.evaluate(() => window.__seekToTime(37.65));
  assert.ok(await page.$eval('#word-handoff-card', element => Number(getComputedStyle(element).opacity)) > 0.5,
    'the file card should carry across the Word transition');
  await page.evaluate(() => window.__seekToTime(38));
  assert.equal(await page.$eval('.word-window', element => /scale[XY]\(/.test(element.style.transform)), false,
    'Word window reveals by cropping instead of distorting its content');
  assert.equal(await page.$$eval('#partner-orbit .partner-tile', tiles => tiles.length), 31);
  assert.equal(await page.$$eval('#partner-orbit [data-asset-status="svgl-stand-in"]', tiles => tiles.length), 19);
  await page.evaluate(() => window.__seekToTime(47.8));
  assert.ok(await page.$eval('#partner-orbit', element => [...element.children].every(tile => Number(getComputedStyle(tile).opacity) > 0.98)),
    'all 31 orbit tiles should be settled before the clockwise exit');
  await page.evaluate(() => window.__seekToTime(58.5));
  assert.equal(await page.$eval('#privacy-first', element => element.textContent), 'Your');
  assert.ok(await page.$eval('#privacy-loading', element => Number(getComputedStyle(element).opacity)) > 0.5,
    'blue loading dots should precede the private-data typing');
  await page.evaluate(() => window.__seekToTime(60.8));
  assert.equal(await page.$eval('#privacy-break', element => getComputedStyle(element).display), 'inline');
  assert.ok(await page.$eval('#privacy-scene h1', element => {
    const first = element.querySelector('#privacy-first').getBoundingClientRect();
    const second = element.querySelector('#privacy-second').getBoundingClientRect();
    return second.top > first.top + first.height * 0.5;
  }), 'privacy promises must occupy distinct lines');
  await page.evaluate(() => window.__seekToTime(70.4));
  assert.equal(await page.$eval('#ambition-word', element => element.textContent), 'expertise');
  await page.evaluate(() => window.__seekToTime(73.8));
  assert.equal(await page.$eval('#with-openai-scene h1', element => element.textContent), 'With OpenAI');
  assert.equal(await page.$eval('#with-openai-scene h1', element => getComputedStyle(element).color), 'rgb(250, 192, 198)');
  await page.evaluate(() => window.__seekToTime(24.8));
  assert.ok(await page.$eval('#composer-text', element => [...element.children].every(span => span.style.opacity === '1')),
    'the source finishes typing the prompt by 24.8s');
  const composer = await page.$eval('#composer-scene .composer-card', element => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, width: rect.width, height: rect.height };
  });
  assert.ok(composer.left < 250 && composer.width > 1400 && composer.height > 350,
    `24.8s composer crop differs from reference: ${JSON.stringify(composer)}`);
  await page.evaluate(() => window.__seekToTime(50));
  assert.equal(await page.$eval('#skill-count', element => element.textContent), '27+');
  assert.ok(await page.$eval('#skill-phrase', element => Number(getComputedStyle(element).opacity)) < 0.05,
    '50s source shows the counter before the phrase');
  await page.evaluate(() => window.__seekToTime(49.8));
  assert.equal(await page.$eval('#skill-count', element => element.textContent), '25+');
  await page.evaluate(() => window.__seekToTime(50.2));
  assert.equal(await page.$eval('#skill-count', element => element.textContent), '29+');
  await page.evaluate(() => window.__seekToTime(76));
  assert.ok(await page.$eval('#outro-scene img', element => Number(getComputedStyle(element).opacity)) > 0.99,
    'the OpenAI mark should be fully present at the source 76s frame');
  await page.evaluate(() => window.__seekToTime(66));
  assert.equal(await page.$eval('#earned-scene h1', element => element.textContent.trim()), 'So you');
  for (const time of [8.5, 18.8, 21, 24.8, 45, 50, 66]) {
    await seekFrame(page, time);
    const firstPng = await page.screenshot({ type: 'png' });
    const firstState = createHash('sha256').update(await page.evaluate(() => [...document.querySelectorAll('#video-stage *')].map(element => element.getAttribute('style') || '').join('|'))).digest('hex');
    const first = createHash('sha256').update(firstPng).digest('hex');
    await seekFrame(page, 63);
    await seekFrame(page, time);
    const secondPng = await page.screenshot({ type: 'png' });
    const secondState = createHash('sha256').update(await page.evaluate(() => [...document.querySelectorAll('#video-stage *')].map(element => element.getAttribute('style') || '').join('|'))).digest('hex');
    assert.equal(secondState, firstState, `authored styles changed after out-of-order seek at ${time}s`);
    const second = createHash('sha256').update(secondPng).digest('hex');
    if (first !== second) {
      const directory = path.join(ROOT, '.cache/astra-for-law/seek-diff');
      mkdirSync(directory, { recursive: true });
      const firstPath = path.join(directory, `${time}-first.png`);
      const secondPath = path.join(directory, `${time}-second.png`);
      writeFileSync(firstPath, firstPng);
      writeFileSync(secondPath, secondPng);
      const difference = renderedPixelDifference(firstPath, secondPath);
      assert.ok(difference.pixels <= 350 && difference.maxChannelDelta <= 2,
        `out-of-order seek changed frame at ${time}s: ${JSON.stringify(difference)}`);
    }
  }
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluate(() => window.__seekToTime(45));
  assert.equal(await page.$eval('#tools-scene', element => Number(getComputedStyle(element).opacity)), 1);
  await page.evaluate(() => window.__seekToTime(4.5));
  assert.equal(await page.$eval('#motion-ir-stage path', element => Number(getComputedStyle(element).opacity)), 0);
  await page.evaluate(() => window.__seekToTime(3));
  assert.equal(await page.$eval('#frontier-scene h1', element => Number(getComputedStyle(element).opacity)), 1);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.evaluate(() => window.__seekToTime(6.7));
  assert.equal(await page.$eval('#motion-ir-stage path', element => getComputedStyle(element).fill), 'rgb(3, 183, 76)');
  await page.evaluate(() => window.__seekToTime(7));
  assert.equal(await page.$eval('#motion-ir-stage path', element => getComputedStyle(element).fill), 'rgb(3, 133, 253)');
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

async function verifyHyperFramesDraft(browser, port) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`http://127.0.0.1:${port}/promo/astra-law-hyperframes-draft.html`, { waitUntil: 'load' });
    await page.evaluate(() => window.__readyPromise);
    assert.deepEqual(errors, [], `HyperFrames draft page errors: ${errors.join('; ')}`);
    const contract = await page.evaluate(() => ({
      beatCount: window.__hyperFramesDraft.storyboard.length,
      duration: window.__hyperFramesDraft.timeline.duration(),
      paused: window.__hyperFramesDraft.timeline.paused()
    }));
    assert.equal(contract.beatCount, 23);
    assert.ok(contract.duration >= DURATION && contract.duration < DURATION + 1,
      `HyperFrames duration drifted: ${contract.duration}`);
    assert.equal(contract.paused, true);
    const presetSweep = await page.evaluate(async () => {
      const { BEAT_KINDS, buildHyperFramesDraft } = await import('../src/runtime/hyperframes-engine.mjs');
      const root = document.createElement('div');
      root.style.cssText = 'position:absolute;left:-9999px;top:0;width:640px;height:360px';
      document.body.append(root);
      try {
        const kinds = Object.keys(BEAT_KINDS);
        const timeline = buildHyperFramesDraft(root, kinds.map(kind => [kind, kind]), 40,
          { bg: '#ffffff' }, kinds.map((_, index) => index * 2));
        for (const time of [0, 11, 23, 39]) timeline.time(time, false);
        const result = { kinds: kinds.length, scenes: root.children.length, finite: Number.isFinite(timeline.duration()) };
        timeline.kill();
        return result;
      } finally { root.remove(); }
    });
    assert.deepEqual(presetSweep, { kinds: 20, scenes: 20, finite: true });
    for (const [time, id] of [[7.65, 'galaxy-scene'], [18.8, 'composer-scene'],
      [37.65, 'word-scene'], [49.2, 'tools-scene'], [74.8, 'with-openai-scene']]) {
      await page.evaluate(value => window.__seekToTime(value), time);
      const first = createHash('sha256').update(await page.$('#stage-shell').then(element => element.screenshot())).digest('hex');
      assert.ok(await page.$eval('#beat-name', (element, expected) => element.textContent.includes(expected), id),
        `HyperFrames draft active beat differs at ${time}s`);
      await page.evaluate(() => window.__seekToTime(63));
      await page.evaluate(value => window.__seekToTime(value), time);
      const second = createHash('sha256').update(await page.$('#stage-shell').then(element => element.screenshot())).digest('hex');
      assert.equal(second, first, `HyperFrames draft changed after out-of-order seek at ${time}s`);
    }
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.evaluate(() => window.__seekToTime(45));
    assert.ok(await page.$eval('#beat-name', element => element.textContent.includes('tools-scene')));
    process.stdout.write('HyperFrames draft verification passed: 20 presets, 23 source-timed beats, finite paused timeline, repeatable seeks, reduced motion.\n');
  } finally { await page.close(); }
}

async function writeFrame(page, output, second) {
  await seekFrame(page, second);
  await page.screenshot({ path: output, type: 'png' });
}

async function writeHyperFramesProof(browser, port) {
  const page = await browser.newPage();
  try {
    await page.goto(`http://127.0.0.1:${port}/promo/astra-law-hyperframes-draft.html`, { waitUntil: 'load' });
    await page.evaluate(() => window.__readyPromise);
    for (const second of [7.65, 18.8, 37.65, 49.2, 74.8]) {
      await page.evaluate(value => window.__seekToTime(value), second);
      const output = path.join(PROOFS, `hyperframe-${String(second).replace('.', '-')}.png`);
      await (await page.$('#stage-shell')).screenshot({ path: output, type: 'png' });
      process.stdout.write(`HyperFrames ${second}s ${output}\n`);
    }
  } finally { await page.close(); }
}

async function exportVideo(page, audio) {
  mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-r', String(FPS), '-i', 'pipe:0'];
  if (audio) args.push('-i', audio);
  args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS));
  if (audio) args.push('-map', '0:v:0', '-map', '1:a:0', '-c:a', 'aac', '-b:a', '192k');
  else args.push('-an');
  args.push('-t', String(DURATION), '-movflags', '+faststart', OUTPUT_PENDING);
  const encoder = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'pipe'] });
  let errorLog = '';
  encoder.stderr.on('data', chunk => { errorLog += chunk.toString(); });
  const closed = new Promise((resolve, reject) => {
    encoder.on('error', reject);
    encoder.on('close', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}: ${errorLog.slice(-3000)}`)));
  });
  try {
    for (let frame = 0; frame < FRAMES; frame++) {
      await seekFrame(page, frame / FPS);
      const jpeg = await page.screenshot({ type: 'jpeg', quality: 94 });
      if (!encoder.stdin.write(jpeg)) await new Promise(resolve => encoder.stdin.once('drain', resolve));
      if (frame % 300 === 0 || frame === FRAMES - 1) process.stdout.write(`\rframes ${frame + 1}/${FRAMES}`);
    }
    encoder.stdin.end();
    await closed;
    renameSync(OUTPUT_PENDING, OUTPUT);
    process.stdout.write(`\n${OUTPUT}\n`);
  } catch (error) {
    encoder.stdin.destroy();
    encoder.kill();
    await closed.catch(() => {});
    rmSync(OUTPUT_PENDING, { force: true });
    throw error;
  }
}

async function main() {
  const { proof, verify, audio } = parseArgs();
  if (audio && !statSync(audio).isFile()) throw new Error(`Missing reference audio: ${audio}`);
  const ffmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (ffmpeg.status !== 0) throw new Error('ffmpeg is unavailable');
  const server = await serveFiles(ROOT);
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
    if (verify) { await verifyPlayer(page); await verifyRunner(browser, port); await verifyHyperFramesDraft(browser, port); }
    else if (proof) {
      mkdirSync(PROOFS, { recursive: true });
      for (const second of [
        0.8, 1, 2.8, 4.8, 5.8, 6.7, 7, 7.4, 7.5, 7.55, 7.5667, 7.6, 7.65, 7.7, 8, 8.5,
        9.2, 9.8, 10.4, 10.6, 10.8, 12, 13, 14, 15, 15.4, 16, 16.6, 17.2, 17.8, 18.2, 18.4, 18.8, 19.8, 21, 21.15, 22, 22.2,
        24.8, 25.4, 28.8, 31, 34.8, 37.4, 37.5, 37.65, 38, 39, 42.4, 42.8,
        45, 47, 47.8, 49, 49.2, 50, 51, 52, 54.5, 54.6, 55.2, 56, 58.5, 60, 60.8, 61.2, 62.5,
        63, 63.6, 64, 66, 69, 70.4, 71.5, 72.5, 73, 73.5, 73.8, 74.2,
        74.8, 75.1, 75.2, 76
      ]) {
        const file = path.join(PROOFS, `frame-${String(second).replace('.', '-')}.png`);
        await writeFrame(page, file, second);
        process.stdout.write(`${second}s ${file}\n`);
      }
      await writeHyperFramesProof(browser, port);
    } else await exportVideo(page, audio);
  } finally {
    if (browser?.connected) await browser.close();
    else browser?.process()?.kill();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
