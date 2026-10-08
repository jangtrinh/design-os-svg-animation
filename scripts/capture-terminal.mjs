import puppeteer from 'puppeteer-core';
import { serveFiles } from './astra-law-export-support.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = await serveFiles(ROOT);
const port = server.address().port;

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu']
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 900 });

const ARTIFACT_DIR = '/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2';

// 1. Capture Rest / Seated Pose
await page.goto(`http://127.0.0.1:${port}/playground/case-terminal.html`, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: `${ARTIFACT_DIR}/case-terminal-rest-proof.png` });
console.log('Saved case-terminal-rest-proof.png');

// 2. Active Exploded State (Pointer moving up on stage)
const stage = await page.$('#stage');
if (stage) {
  const box = await stage.boundingBox();
  // Move to top center of stage (y = 80 in viewBox)
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.25);
  await new Promise(r => setTimeout(r, 600));
}
await page.screenshot({ path: `${ARTIFACT_DIR}/case-terminal-active-proof.png` });
console.log('Saved case-terminal-active-proof.png');

// 3. Hover State on PCB Processor IC (y = 145 in viewBox)
if (stage) {
  const box = await stage.boundingBox();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.45);
  await new Promise(r => setTimeout(r, 600));
}
await page.screenshot({ path: `${ARTIFACT_DIR}/case-terminal-hover-proof.png` });
console.log('Saved case-terminal-hover-proof.png');

await browser.close();
server.close();
