#!/usr/bin/env node
/**
 * capture-tutorial-proofs.mjs
 * 
 * Captures visual proof screenshots for Design OS Explainer & Walkthrough
 * (OpenAI Templates Edition) across all 6 beats.
 */

import puppeteer from 'puppeteer-core';
import path from 'path';
import { LOCAL_SERVER_ORIGIN } from './local-server-config.mjs';

const CHROME_BIN = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/jang/.gemini/antigravity/brain/f89cf83b-4c7a-4c1f-be9d-65a033a2abd3';

const SHOTS = [
  { time: 1.5, name: 'proof_openai_beat1_hook.png', desc: 'Beat 1: Instant Hook ("Your ideas. In motion.")' },
  { time: 5.5, name: 'proof_openai_beat2_discovery.png', desc: 'Beat 2: Template Discovery Gallery (3 Cards)' },
  { time: 11.3, name: 'proof_openai_beat3_walkthrough.png', desc: 'Beat 3: Interactive Walkthrough & Decoupled Click' },
  { time: 17.5, name: 'proof_openai_beat4_audio_sync.png', desc: 'Beat 4: Audio-Visual PCM Equalizer & Poster Breathing' },
  { time: 23.5, name: 'proof_openai_beat5_multiaspect.png', desc: 'Beat 5: Multi-Aspect Safe Zones (16:9, 9:16, 1:1)' },
  { time: 27.5, name: 'proof_openai_beat6_outro_cta.png', desc: 'Beat 6: Conversion Outro CTA ("Make your next move.")' }
];

async function run() {
  console.log('🚀 Launching Chrome for Visual Proof Captures...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_BIN,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // 1. Capture clean export frames (1920x1080 pure render)
  console.log('📸 Navigating to clean render mode...');
  await page.goto(`${LOCAL_SERVER_ORIGIN}/design-os-tutorial.html?clean=true`, { waitUntil: 'networkidle0' });

  // Wait for images and fonts
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 600));

  for (const shot of SHOTS) {
    console.log(`📸 Seeking to t = ${shot.time}s (${shot.desc})...`);
    await page.evaluate((t) => {
      window.__seekToTime(t);
    }, shot.time);

    await new Promise(r => setTimeout(r, 300));
    const outPath = path.join(ARTIFACT_DIR, shot.name);
    await page.screenshot({ path: outPath });
    console.log(`   Saved: ${shot.name}`);
  }

  // 2. Capture player UI mode (showing Universal Studio Player chrome)
  console.log('📸 Navigating to interactive player mode...');
  await page.goto(`${LOCAL_SERVER_ORIGIN}/design-os-tutorial.html`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => window.__seekToTime(11.3));
  await new Promise(r => setTimeout(r, 300));

  const playerProofPath = path.join(ARTIFACT_DIR, 'proof_openai_studio_player_ui.png');
  await page.screenshot({ path: playerProofPath });
  console.log(`   Saved: proof_openai_studio_player_ui.png`);

  await browser.close();
  console.log('✅ All visual proof screenshots captured successfully!');
}

run().catch((err) => {
  console.error('❌ Error during capture:', err);
  process.exit(1);
});
