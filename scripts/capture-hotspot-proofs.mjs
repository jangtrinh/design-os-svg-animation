import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACTS_DIR = '/Users/jang/.gemini/antigravity/brain/f89cf83b-4c7a-4c1f-be9d-65a033a2abd3';
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:3033/v0-generative-ui.html?clean=true';

const HOTSPOT_CLICKS = [
  { t: 12.88, name: 'proof_hotspot_click_1_enter.png', desc: 'Click 1: Submit Prompt button (enter)' },
  { t: 16.78, name: 'proof_hotspot_click_2_sparkle.png', desc: 'Click 2: Click & Edit floating sparkle button' },
  { t: 19.48, name: 'proof_hotspot_click_3_inspect.png', desc: 'Click 3: Inspect Acme Brand logo' },
  { t: 23.58, name: 'proof_hotspot_click_4_update.png', desc: 'Click 4: Update Component button in Popover' },
  { t: 26.58, name: 'proof_hotspot_click_5_code.png', desc: 'Click 5: Code toggle button' },
  { t: 32.08, name: 'proof_hotspot_click_6_canvas.png', desc: 'Click 6: Canvas return button' },
  { t: 33.88, name: 'proof_hotspot_click_7_stealth.png', desc: 'Click 7: Stealth mode toggle badge' },
  { t: 35.88, name: 'proof_hotspot_click_8_public.png', desc: 'Click 8: Public radio option select' }
];

async function main() {
  console.log('Capturing proof screenshots for all 8 tactile click hotspots...');
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
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });

  for (const item of HOTSPOT_CLICKS) {
    console.log(`Seeking to t = ${item.t}s (${item.desc})...`);
    await page.evaluate((sec) => window.__seekToTime(sec), item.t);
    await new Promise(r => setTimeout(r, 120));

    const outPath = path.join(ARTIFACTS_DIR, item.name);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`Saved proof: ${outPath}`);
  }

  await browser.close();
  console.log('✅ All 8 hotspot click proof screenshots captured successfully!');
}

main().catch(err => {
  console.error('Error capturing proofs:', err);
  process.exit(1);
});
