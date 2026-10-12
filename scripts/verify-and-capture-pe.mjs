import puppeteer from 'puppeteer-core';
import { copyFileSync } from 'node:fs';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu']
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });

const errors = [];
page.on('pageerror', err => errors.push(err.message));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

const url = 'http://127.0.0.1:4323/playground/pe.html';
console.log('Navigating to:', url);
await page.goto(url, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));

if (errors.length > 0) {
  console.error('Errors found on page:', errors);
  await browser.close();
  process.exit(1);
}

const artifactDir = '/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2';

// 1. Capture Single View (Figure 1: Olympic Stopwatch)
console.log('Capturing Figure 1: Olympic Mechanical Stopwatch...');
await page.evaluate(() => {
  const slider = document.getElementById('intensity');
  slider.value = 10.25; // 100m sprint timing
  slider.dispatchEvent(new Event('input'));
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/pe-01-stopwatch-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 2. Switch to Figure 2: Barbell & Weight Plates
console.log('Capturing Figure 2: Olympic Barbell & Weight Plates...');
await page.keyboard.press('2');
await new Promise(r => setTimeout(r, 500));
await page.evaluate(() => {
  const slider = document.getElementById('intensity');
  slider.value = 100; // 100kg heavy load with plate deflection
  slider.dispatchEvent(new Event('input'));
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/pe-02-barbell-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 3. Switch to Figure 3: Relay Baton & Exchange Zone
console.log('Capturing Figure 3: 4x100m Relay Baton & Exchange Zone...');
await page.keyboard.press('3');
await new Promise(r => setTimeout(r, 500));
await page.evaluate(() => {
  const slider = document.getElementById('intensity');
  slider.value = 2.0; // Valid exchange zone center
  slider.dispatchEvent(new Event('input'));
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/pe-03-relay-baton-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 4. Switch to Figure 4: Olympic Track Hurdle
console.log('Capturing Figure 4: Olympic Track Hurdle...');
await page.keyboard.press('4');
await new Promise(r => setTimeout(r, 500));
await page.evaluate(() => {
  const slider = document.getElementById('intensity');
  slider.value = 106.7; // 110m hurdles max height
  slider.dispatchEvent(new Event('input'));
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/pe-04-hurdle-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 5. Switch to Figure 5: Basketball Breakaway Rim
console.log('Capturing Figure 5: FIBA Basketball Breakaway Rim & Parabolic Shot...');
await page.keyboard.press('5');
await new Promise(r => setTimeout(r, 500));
await page.evaluate(() => {
  const slider = document.getElementById('intensity');
  slider.value = 76.0; // Swish instant!
  slider.dispatchEvent(new Event('input'));
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/pe-05-basketball-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 6. Switch to Gallery View (all 5 figures)
console.log('Capturing PE Suite Gallery View...');
await page.click('.view-mode-toggle');
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: `${artifactDir}/pe-gallery-proof.png`, fullPage: true });

// Copy gallery screenshot as specimen cover asset
copyFileSync(`${artifactDir}/pe-gallery-proof.png`, 'docs/assets/pe-gallery-cover.png');
console.log('Copied docs/assets/pe-gallery-cover.png');

await browser.close();
console.log('✓ All 5 physical education figures verified and captured successfully!');
