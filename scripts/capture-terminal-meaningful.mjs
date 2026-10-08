import puppeteer from 'puppeteer-core';
import path from 'node:path';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu']
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 900 });

const ARTIFACT_DIR = '/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2';

// 1. Capture Rest State: Card out waiting to be inserted
await page.goto('http://127.0.0.1:4323/playground/case-terminal.html?theme=light', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: `${ARTIFACT_DIR}/case-terminal-meaningful-rest.png` });
console.log('Saved case-terminal-meaningful-rest.png');

// 2. Capture Card Inserting / Seated
const stage = await page.$('#stage');
if (stage) {
  const box = await stage.boundingBox();
  // Hover over card area in front (viewBox x ~ 180, y ~ 220)
  await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.7);
  await new Promise(r => setTimeout(r, 600));
}
await page.screenshot({ path: `${ARTIFACT_DIR}/case-terminal-meaningful-inserted.png` });
console.log('Saved case-terminal-meaningful-inserted.png');

// 3. Capture Key Press Interaction on Keypad (e.g. Key 5 in center)
if (stage) {
  const box = await stage.boundingBox();
  // Move pointer right over key 5 (viewBox x ~ 200, y ~ 160)
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.48);
  await new Promise(r => setTimeout(r, 600));
}
await page.screenshot({ path: `${ARTIFACT_DIR}/case-terminal-meaningful-keypress.png` });
console.log('Saved case-terminal-meaningful-keypress.png');

// 4. Capture Dark Mode Keypress
await page.goto('http://127.0.0.1:4323/playground/case-terminal.html?theme=dark', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));
const stageDark = await page.$('#stage');
if (stageDark) {
  const box = await stageDark.boundingBox();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.48);
  await new Promise(r => setTimeout(r, 600));
}
await page.screenshot({ path: `${ARTIFACT_DIR}/case-terminal-meaningful-dark.png` });
console.log('Saved case-terminal-meaningful-dark.png');

await browser.close();
