#!/usr/bin/env node
/**
 * render-tutorial-gif.mjs
 * Renders an animated GIF of the Design OS Tutorial Video (Codex Light Theme)
 * directly into the agent artifacts directory.
 */

import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACTS_DIR = '/Users/jang/.gemini/antigravity/brain/f89cf83b-4c7a-4c1f-be9d-65a033a2abd3';

const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG_BIN = '/opt/homebrew/bin/ffmpeg';

async function renderGif() {
  console.log(`🎬 Rendering Design OS Tutorial Walkthrough GIF (Codex Light Theme)...`);
  const outputPath = path.join(ARTIFACTS_DIR, 'proof_tutorial_walkthrough.gif');

  const browser = await puppeteer.launch({
    executablePath: CHROME_BIN,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  const htmlPath = path.join(ROOT_DIR, 'promo', 'design-os-tutorial.html');
  await page.goto(`file://${htmlPath}?clean=true`, { waitUntil: 'networkidle0' });

  const fps = 20;
  const startSec = 9.5;
  const durationSec = 6.0;
  const totalFrames = Math.round(durationSec * fps);

  // Set up FFmpeg pipe with palettegen / paletteuse
  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', fps.toString(),
    '-i', 'pipe:0',
    '-filter_complex', '[0:v] scale=720:-1:flags=lanczos,split [a][b]; [a] palettegen=reserve_transparent=0 [p]; [b][p] paletteuse=dither=bayer:bayer_scale=3',
    outputPath
  ];

  const ffmpeg = spawn(FFMPEG_BIN, ffmpegArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let f = 0; f < totalFrames; f++) {
    const t = startSec + (f / fps);
    await page.evaluate((time) => {
      window.__seekToTime(time);
    }, t);

    // Grab PNG buffer
    const buf = await page.screenshot({ type: 'png' });
    ffmpeg.stdin.write(buf);

    if (f % 20 === 0) {
      console.log(`   Frame ${f}/${totalFrames} (t=${t.toFixed(2)}s)`);
    }
  }

  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

  await browser.close();
  console.log(`✅ Animated GIF rendered successfully: ${outputPath}`);
}

renderGif().catch(console.error);
