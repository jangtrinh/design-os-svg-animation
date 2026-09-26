
import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACTS_DIR = '/Users/jang/.gemini/antigravity/brain/f89cf83b-4c7a-4c1f-be9d-65a033a2abd3';
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const FRAMES = [
  ['tutorial_beat1_hook.png', 1.2],
  ['tutorial_beat2_diagram_flow.png', 5.0],
  ['tutorial_beat3_app_window.png', 9.5],
  ['tutorial_beat3_concentric_click.png', 11.3],
  ['tutorial_beat3_callout_badge.png', 13.0],
  ['tutorial_beat4_waveform_sync.png', 18.0],
  ['tutorial_beat5_multi_aspect.png', 23.0],
  ['tutorial_beat6_outro_cta.png', 26.5]
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_BIN,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  const htmlPath = path.join(ROOT_DIR, 'promo', 'design-os-tutorial/design-os-tutorial.html');
  await page.goto(`file://${htmlPath}?clean=true`, { waitUntil: 'networkidle0' });

  for (const [filename, timeSec] of FRAMES) {
    await page.evaluate((t) => {
      window.__seekToTime(t);
    }, timeSec);
    await new Promise(r => setTimeout(r, 80)); // Allow render stage flush
    const outPath = path.join(ARTIFACTS_DIR, filename);
    await page.screenshot({ path: outPath });
    console.log(`✓ Captured ${filename} at t=${timeSec}s`);
  }

  await browser.close();
}

run().catch(console.error);
