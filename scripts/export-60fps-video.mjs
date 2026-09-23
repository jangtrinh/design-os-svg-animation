#!/usr/bin/env node
/**
 * 60fps Broadcast Video Exporter for Facebook & Social Platforms
 * Renders deterministic, frame-accurate 60fps 1080p MP4 videos for Codex and Claude promo animations.
 * 
 * Features:
 * - Direct memory-piped MJPEG stream into FFmpeg (zero disk space consumed for temporary frames)
 * - H.264 High Profile 4.2, YUV420P, CRF 17, Rec.709 colorimetry
 * - Silent stereo AAC 44.1kHz audio track for 100% Facebook / IG upload compliance
 * - Faststart moov atom optimization for instant streaming
 */

import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PROMO_DIR = path.join(ROOT_DIR, 'promo');
const DOCS_PROMO_DIR = path.join(ROOT_DIR, 'docs', 'promo');

const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG_BIN = '/opt/homebrew/bin/ffmpeg';

const TARGETS = {
  codex: {
    name: 'OpenAI Codex App Promo',
    url: 'http://localhost:3033/codex-app-promo.html?clean=true&autoplay=false',
    duration: 38.0,
    fps: 60,
    width: 1920,
    height: 1080,
    outputFilename: 'codex-app-promo.mp4'
  },
  claude: {
    name: 'Claude Design Master Promo',
    url: 'http://localhost:3033/claude-design-promo.html?clean=true&autoplay=false',
    duration: 82.0,
    fps: 60,
    width: 1920,
    height: 1080,
    outputFilename: 'claude-design-promo.mp4'
  },
  v0: {
    name: 'Vercel v0: Generative UI Launch Video',
    url: 'http://localhost:3033/v0-generative-ui.html?clean=true&autoplay=false',
    duration: 47.5,
    fps: 60,
    width: 1920,
    height: 1080,
    outputFilename: 'v0-generative-ui.mp4'
  }
};

async function renderTarget(key, config) {
  console.log(`\n============================================================`);
  console.log(`🎬 STARTING 60FPS EXPORT: ${config.name}`);
  console.log(`Duration: ${config.duration}s | Target Framerate: ${config.fps} fps`);
  const totalFrames = Math.round(config.duration * config.fps);
  console.log(`Total Frames to Render: ${totalFrames.toLocaleString()}`);
  console.log(`============================================================\n`);

  const outputPath = path.join(PROMO_DIR, config.outputFilename);
  const docsOutputPath = path.join(DOCS_PROMO_DIR, config.outputFilename);

  const w = config.width || 1920;
  const h = config.height || 1080;

  // 1. Launch Puppeteer Headless Chrome
  const browser = await puppeteer.launch({
    executablePath: CHROME_BIN,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      `--window-size=${w},${h}`,
      '--hide-scrollbars',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ],
    defaultViewport: {
      width: w,
      height: h,
      deviceScaleFactor: 1
    }
  });

  const page = await browser.newPage();
  await page.goto(config.url, { waitUntil: 'load', timeout: 30000 });

  // 2. Spawn FFmpeg process with direct stdin pipe
  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(config.fps),
    '-i', '-',
    // Silent stereo audio track for Facebook upload compliance
    '-f', 'lavfi',
    '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-level', '4.2',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '17',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
    '-colorspace', 'bt709',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-shortest',
    '-movflags', '+faststart',
    outputPath
  ];

  const ffmpeg = spawn(FFMPEG_BIN, ffmpegArgs);
  let ffmpegErr = '';
  ffmpeg.stderr.on('data', (d) => {
    ffmpegErr += d.toString();
  });

  const startTime = Date.now();
  let lastLogTime = startTime;

  for (let frame = 0; frame < totalFrames; frame++) {
    const timeSec = frame / config.fps;
    
    // Seek deterministic virtual clock
    await page.evaluate((sec) => window.__seekToTime(sec), timeSec);

    // Capture crisp JPEG buffer (quality: 96 for visually lossless rendering)
    const buf = await page.screenshot({ type: 'jpeg', quality: 96 });

    // Handle backpressure on stdin stream
    const canContinue = ffmpeg.stdin.write(buf);
    if (!canContinue) {
      await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
    }

    const now = Date.now();
    if (now - lastLogTime > 2500 || frame === totalFrames - 1) {
      const elapsed = (now - startTime) / 1000;
      const currentFps = (frame + 1) / elapsed;
      const progress = (((frame + 1) / totalFrames) * 100).toFixed(1);
      const remainingSec = ((totalFrames - (frame + 1)) / currentFps).toFixed(0);
      process.stdout.write(`\r  [${frame + 1}/${totalFrames}] ${progress}% | ${currentFps.toFixed(1)} fps | Elapsed: ${elapsed.toFixed(0)}s | ETA: ${remainingSec}s `);
      lastLogTime = now;
    }
  }

  process.stdout.write('\n');
  console.log('Finalizing FFmpeg encoding...');
  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${ffmpegErr}`));
    });
  });

  await browser.close();

  // Sync to docs/promo for GitHub Pages showcase
  if (fs.existsSync(DOCS_PROMO_DIR)) {
    fs.copyFileSync(outputPath, docsOutputPath);
  }

  const stat = fs.statSync(outputPath);
  const mb = (stat.size / (1024 * 1024)).toFixed(2);
  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`✅ Success! Rendered in ${totalElapsed}s`);
  console.log(`📦 Output File: ${outputPath}`);
  console.log(`📦 Size:        ${mb} MB`);
  console.log(`📦 Framerate:   60 fps constant`);
}

async function main() {
  const targetArg = process.argv[2] || 'all';

  if (targetArg === 'codex' || targetArg === 'all') {
    await renderTarget('codex', TARGETS.codex);
  }

  if (targetArg === 'claude' || targetArg === 'all') {
    await renderTarget('claude', TARGETS.claude);
  }

  if (targetArg === 'v0' || targetArg === 'all') {
    await renderTarget('v0', TARGETS.v0);
  }

  console.log('\n🎉 ALL 60FPS VIDEO EXPORTS COMPLETED SUCCESSFULLY!\n');
}

main().catch((err) => {
  console.error('\n❌ Export Error:', err);
  process.exit(1);
});
