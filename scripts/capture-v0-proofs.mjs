import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { LOCAL_SERVER_ORIGIN } from './local-server-config.mjs';

const ARTIFACTS_DIR = '/Users/jang/.gemini/antigravity/brain/f89cf83b-4c7a-4c1f-be9d-65a033a2abd3';
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = `${LOCAL_SERVER_ORIGIN}/v0-generative-ui.html?clean=true`;

const KEYFRAMES = [
  { time: 2.0,  name: 'proof_v0_s1_wireframe_guidelines.png', desc: 'Scene 1: v0 Wireframe + Radiating Guidelines' },
  { time: 4.8,  name: 'proof_v0_s2_title_pill_morph.png', desc: 'Scene 2: "What will you ship?" Pill Morph' },
  { time: 8.5,  name: 'proof_v0_s3_3d_drum_reel.png', desc: 'Scene 3: Vertical 3D Drum Reel with Blur Reflection' },
  { time: 16.2, name: 'proof_v0_s4_click_and_edit.png', desc: 'Scene 4: Acme Dashboard Canvas & "Click & Edit" Tooltip' },
  { time: 18.8, name: 'proof_v0_s5_camera_zoom_inspect.png', desc: 'Scene 5: Camera Punch Zoom, Dashed Bounding Box & svg Tag' },
  { time: 23.8, name: 'proof_v0_s5_popover_update_spinner.png', desc: 'Scene 5: Interactive Popover with Update ⟳ Spinner' },
  { time: 25.5, name: 'proof_v0_s5_blue_logo_v1.png', desc: 'Scene 5: Blue Logo Morph & v1 Version Card in Drawer' },
  { time: 29.5, name: 'proof_v0_s6_3d_code_inspector.png', desc: 'Scene 6: 3D Perspective Tilt Code Inspector & Canvas Button' },
  { time: 34.8, name: 'proof_v0_s7_stealth_mode_dropdown.png', desc: 'Scene 7: Camera Zoom Breadcrumb & Stealth Mode Dialog' },
  { time: 36.2, name: 'proof_v0_s7_stealth_public_selected.png', desc: 'Scene 7: Public Option Selected with Radio Checkmark' },
  { time: 38.5, name: 'proof_v0_s8_12_card_grid_wall.png', desc: 'Scene 8: Expansive 4x3 Generative Wall of 12 Projects' },
  { time: 41.5, name: 'proof_v0_s8_v0dev_title.png', desc: 'Scene 8: Centered v0.dev Title Lockup' },
  { time: 45.5, name: 'proof_v0_s9_vercel_outro.png', desc: 'Scene 9: Official Vercel Brand Lockup' }
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
    await new Promise(r => setTimeout(r, 120)); // allow render tick

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
