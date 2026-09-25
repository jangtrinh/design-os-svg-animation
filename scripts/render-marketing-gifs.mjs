#!/usr/bin/env node
/**
 * render-marketing-gifs.mjs
 * High-performance, memory-piped GIF generator using persistent Puppeteer instance + FFmpeg.
 * Renders all 4 marketing showcase GIFs with optimal palettegen/paletteuse for zero banding.
 */

import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { LOCAL_SERVER_ORIGIN } from './local-server-config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'docs', 'assets');

const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG_BIN = '/opt/homebrew/bin/ffmpeg';

const DEMOS = [
  {
    id: 'example-1-claude-design-globe',
    name: 'Claude Design 3D Globe',
    url: `${LOCAL_SERVER_ORIGIN}/claude-design-promo.html?clean=true&autoplay=false`,
    start: 12.5,
    duration: 4.0,
    fps: 15,
    width: 640,
    height: 360,
    scale: '640:-1',
    viewport: { width: 1920, height: 1080 }
  },
  {
    id: 'example-3-codex-app-promo',
    name: 'OpenAI Codex App Promo',
    url: `${LOCAL_SERVER_ORIGIN}/codex-app-promo.html?clean=true&autoplay=false`,
    start: 0.5,
    duration: 4.0,
    fps: 15,
    width: 640,
    height: 360,
    scale: '640:-1',
    viewport: { width: 1920, height: 1080 }
  },
  {
    id: 'example-4-v0-generative-ui',
    name: 'Vercel v0 Generative UI',
    url: `${LOCAL_SERVER_ORIGIN}/v0-generative-ui.html?clean=true&autoplay=false`,
    start: 12.0,
    duration: 4.0,
    fps: 15,
    width: 640,
    height: 360,
    scale: '640:-1',
    viewport: { width: 1920, height: 1080 }
  }
];

async function renderGif(browser, demo) {
  console.log(`\n🎬 Rendering ${demo.name} (${demo.duration}s @ ${demo.fps}fps)...`);
  const page = await browser.newPage();
  await page.setViewport(demo.viewport);
  await page.goto(demo.url, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));

  const totalFrames = Math.round(demo.duration * demo.fps);
  const outPath = path.join(ASSETS_DIR, `${demo.id}.gif`);

  // FFmpeg command with optimal two-pass palettegen in filtergraph
  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-framerate', String(demo.fps),
    '-i', 'pipe:0',
    '-vf', `fps=${demo.fps},scale=${demo.scale}:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3`,
    outPath
  ];

  const ffmpeg = spawn(FFMPEG_BIN, ffmpegArgs, {
    stdio: ['pipe', 'ignore', 'pipe']
  });

  let ffmpegErr = '';
  ffmpeg.stderr.on('data', chunk => { ffmpegErr += chunk.toString(); });

  for (let i = 0; i < totalFrames; i++) {
    const t = demo.start + (i / demo.fps);
    await page.evaluate(sec => window.__seekToTime(sec), t);

    const buf = await page.screenshot({ type: 'png', omitBackground: true });
    ffmpeg.stdin.write(buf);

    if ((i + 1) % 15 === 0 || i === totalFrames - 1) {
      process.stdout.write(`   Frame ${i + 1}/${totalFrames} (t=${t.toFixed(2)}s)\r`);
    }
  }

  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg error code ${code}: ${ffmpegErr}`));
    });
  });

  await page.close();
  const sizeMb = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2);
  console.log(`\n   ✅ Generated: ${outPath} (${sizeMb} MB)`);
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_BIN,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  for (const demo of DEMOS) {
    await renderGif(browser, demo);
  }

  await browser.close();
  console.log('\n🎉 ALL 4 MARKETING SHOWCASE GIFS GENERATED SUCCESSFULLY!\n');
}

main().catch(err => {
  console.error('\n❌ Error generating GIFs:', err);
  process.exit(1);
});
