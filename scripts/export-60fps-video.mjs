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
import { LOCAL_SERVER_ORIGIN } from './local-server-config.mjs';

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
    url: `${LOCAL_SERVER_ORIGIN}/codex-app/codex-app-promo.html?clean=true&autoplay=false`,
    duration: 38.0,
    fps: 60,
    width: 1920,
    height: 1080,
    outputFilename: 'codex-app/codex-app-promo.mp4'
  },
  claude: {
    name: 'Claude Design Master Promo',
    url: `${LOCAL_SERVER_ORIGIN}/claude-design/claude-design-promo.html?clean=true&autoplay=false`,
    duration: 82.0,
    fps: 60,
    width: 1920,
    height: 1080,
    outputFilename: 'claude-design/claude-design-promo.mp4'
  },
  v0: {
    name: 'Vercel v0: Generative UI Launch Video',
    url: `${LOCAL_SERVER_ORIGIN}/v0-generative-ui/v0-generative-ui.html?clean=true&autoplay=false`,
    duration: 47.5,
    fps: 60,
    width: 1920,
    height: 1080,
    outputFilename: 'v0-generative-ui/v0-generative-ui.mp4'
  },
  tutorial: {
    name: 'Design OS Tutorial Explainer (OpenAI Templates Edition)',
    url: `${LOCAL_SERVER_ORIGIN}/design-os-tutorial/design-os-tutorial.html?clean=true&autoplay=false`,
    duration: 30.0,
    fps: 60,
    width: 1920,
    height: 1080,
    outputFilename: 'design-os-tutorial/design-os-tutorial.mp4'
  },
  origami: {
    name: 'DESIGN:OS Origami CAD — 15s 120BPM Monochrome Motion Showreel',
    url: `file://${path.join(PROMO_DIR, 'origami-cad', 'origami-cad-promo.html')}?clean=true&autoplay=false`,
    duration: 15.0,
    fps: 60,
    subframes: 3,
    bpm: 120,
    width: 1920,
    height: 1080,
    audioFilename: 'origami-cad/origami-cad-promo.wav',
    outputFilename: 'origami-cad/origami-cad-promo.mp4'
  }
};

async function seekPageClock(page, timeSec) {
  await page.evaluate((sec) => {
    if (typeof window.seek === 'function') {
      window.seek(sec);
    } else if (typeof window.__seekToTime === 'function') {
      window.__seekToTime(sec);
    }
  }, timeSec);
}

async function renderBeatSheet(page, key, config) {
  const bpm = config.bpm || 120;
  const beatSec = 60 / bpm;
  const totalBeats = Math.round(config.duration / beatSec);
  const beatDir = `/tmp/design_os_beats_${key}`;
  fs.mkdirSync(beatDir, { recursive: true });

  console.log(`🎼 Rendering ${totalBeats}-beat pre-flight contact sheet (${bpm} BPM)...`);
  for (let b = 0; b < totalBeats; b++) {
    const t = b === totalBeats - 1 ? config.duration : b * beatSec + beatSec * 0.5;
    await seekPageClock(page, t);
    const frameFile = path.join(beatDir, `beat_${String(b).padStart(2, '0')}.png`);
    await page.screenshot({ path: frameFile, type: 'png' });
  }

  const sheetPath = path.join(PROMO_DIR, path.dirname(config.outputFilename), `${key}-beat-sheet.png`);
  await new Promise((resolve, reject) => {
    const cols = 6;
    const rows = Math.ceil(totalBeats / cols);
    const ff = spawn(FFMPEG_BIN, [
      '-y',
      '-framerate', '1',
      '-i', path.join(beatDir, 'beat_%02d.png'),
      '-vf', `scale=384:216,tile=${cols}x${rows}:padding=4:margin=4:color=0x1A1A1A`,
      '-frames:v', '1',
      sheetPath
    ]);
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Beat sheet FFmpeg exited ${code}`))));
  });
  console.log(`✅ Beat sheet saved: ${sheetPath}`);
}

async function renderTarget(key, config, cliFlags = {}) {
  const subframes = cliFlags.subframes || config.subframes || 1;
  const captureFps = config.fps * subframes;
  const totalFrames = Math.round(config.duration * config.fps);
  const totalSubframes = totalFrames * subframes;

  console.log(`\n============================================================`);
  console.log(`🎬 STARTING 60FPS EXPORT: ${config.name}`);
  console.log(`Duration: ${config.duration}s | Output: ${config.fps} fps | Subframes: ${subframes}x (${captureFps} fps)`);
  console.log(`Total Subframes to Render: ${totalSubframes.toLocaleString()}`);
  console.log(`============================================================\n`);

  const outputPath = path.join(PROMO_DIR, config.outputFilename);
  const docsOutputPath = path.join(DOCS_PROMO_DIR, config.outputFilename);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

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

  if (cliFlags.beatSheet) {
    await renderBeatSheet(page, key, config);
    if (cliFlags.beatSheetOnly) {
      await browser.close();
      return;
    }
  }

  const audioPath = config.audioFilename ? path.join(PROMO_DIR, config.audioFilename) : null;
  const hasAudioFile = audioPath && fs.existsSync(audioPath);

  const weights = subframes === 3 ? '1 2 1' : Array.from({ length: subframes }, () => '1').join(' ');
  const vfFilter = subframes > 1
    ? ['-vf', `tmix=frames=${subframes}:weights='${weights}',fps=${config.fps}`]
    : [];

  // 2. Spawn FFmpeg process with direct stdin pipe
  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(captureFps),
    '-i', '-',
    ...(hasAudioFile
      ? ['-i', audioPath]
      : ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100']),
    ...vfFilter,
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
    '-b:a', hasAudioFile ? '192k' : '128k',
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

  for (let sf = 0; sf < totalSubframes; sf++) {
    const timeSec = sf / captureFps;

    // Seek deterministic virtual clock (window.seek or window.__seekToTime)
    await seekPageClock(page, timeSec);

    // Capture crisp JPEG buffer (quality: 96 for visually lossless rendering)
    const buf = await page.screenshot({ type: 'jpeg', quality: 96 });

    // Handle backpressure on stdin stream
    const canContinue = ffmpeg.stdin.write(buf);
    if (!canContinue) {
      await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
    }

    const now = Date.now();
    if (now - lastLogTime > 2500 || sf === totalSubframes - 1) {
      const elapsed = (now - startTime) / 1000;
      const currentFps = (sf + 1) / elapsed;
      const progress = (((sf + 1) / totalSubframes) * 100).toFixed(1);
      const remainingSec = ((totalSubframes - (sf + 1)) / currentFps).toFixed(0);
      process.stdout.write(`\r  [${sf + 1}/${totalSubframes}] ${progress}% | ${currentFps.toFixed(1)} sf/s | Elapsed: ${elapsed.toFixed(0)}s | ETA: ${remainingSec}s `);
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
    fs.mkdirSync(path.dirname(docsOutputPath), { recursive: true });
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
  const args = process.argv.slice(2);
  const positional = args.filter((a) => !a.startsWith('--'));
  const targetArg = positional[0] || 'all';
  const subIdx = args.indexOf('--subframes');
  const cliFlags = {
    beatSheet: args.includes('--beat-sheet') || args.includes('--beat-sheet-only'),
    beatSheetOnly: args.includes('--beat-sheet-only'),
    subframes: subIdx !== -1 ? Number(args[subIdx + 1]) || 3 : undefined
  };

  for (const key of ['codex', 'claude', 'v0', 'tutorial', 'origami']) {
    if (targetArg === key || targetArg === 'all') {
      await renderTarget(key, TARGETS[key], cliFlags);
    }
  }

  console.log('\n🎉 ALL 60FPS VIDEO EXPORTS COMPLETED SUCCESSFULLY!\n');
}

main().catch((err) => {
  console.error('\n❌ Export Error:', err);
  process.exit(1);
});

