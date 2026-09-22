import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = '/Users/jang/.gemini/antigravity/brain/f89cf83b-4c7a-4c1f-be9d-65a033a2abd3';
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:3033/v0-generative-ui.html?clean=true';

const KEYFRAMES = [
  { time: 1.8,  name: 'proof_v0_s1_wireframe_logo.png', desc: 'Scene 1: v0 Wireframe Logo Drawing & Fill' },
  { time: 4.2,  name: 'proof_v0_s2_what_will_you_ship.png', desc: 'Scene 2: "What will you ship?" Title Card' },
  { time: 10.5, name: 'proof_v0_s3_prompt_reel.png', desc: 'Scene 3: Prompt Reel with Guillermo Avatar & Enter' },
  { time: 15.5, name: 'proof_v0_s4_dashboard_canvas.png', desc: 'Scene 4: Acme Inc Dashboard Canvas Stream' },
  { time: 20.5, name: 'proof_v0_s5_component_popover.png', desc: 'Scene 5: Component Blue Edit Popover' },
  { time: 24.0, name: 'proof_v0_s5_blue_logo_v1.png', desc: 'Scene 5: Blue Logo Morph & v1 Version Card' },
  { time: 29.5, name: 'proof_v0_s6_code_inspector.png', desc: 'Scene 6: Code Inspector & CLI View' },
  { time: 36.5, name: 'proof_v0_s7_stealth_mode_public.png', desc: 'Scene 7: Stealth Mode Public Selected' },
  { time: 40.5, name: 'proof_v0_s8_v0dev_title.png', desc: 'Scene 8: v0.dev Title Card' },
  { time: 45.0, name: 'proof_v0_s9_vercel_outro.png', desc: 'Scene 9: Vercel Equilateral Triangle & Wordmark' }
];

async function main() {
  console.log('Launching headless Chrome for v0 keyframe captures...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_BIN,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--hide-scrollbars'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    }
  });

  const page = await browser.newPage();
  console.log(`Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });

  for (const kf of KEYFRAMES) {
    console.log(`Seeking to t = ${kf.time}s (${kf.desc})...`);
    await page.evaluate((sec) => window.__seekToTime(sec), kf.time);
    await new Promise(r => setTimeout(r, 100)); // allow render tick

    const outPath = path.join(ARTIFACTS_DIR, kf.name);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`Saved proof: ${outPath}`);
  }

  await browser.close();
  console.log('✅ All keyframes captured successfully!');
}

main().catch(err => {
  console.error('Error capturing proofs:', err);
  process.exit(1);
});
