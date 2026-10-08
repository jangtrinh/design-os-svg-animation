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

const url = `http://127.0.0.1:${port}/playground/vise.html`;
await page.goto(url, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));

const ARTIFACT_DIR = '/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2';

// 1. Capture Rest Pose
await page.screenshot({ path: `${ARTIFACT_DIR}/vise-rest-proof.png` });
console.log('Saved vise-rest-proof.png');

// 2. Move mouse to trigger dynamic clamping interaction
const stage = await page.$('#stage') || await page.$('svg');
if (stage) {
  const box = await stage.boundingBox();
  // Move to right side to open more or to center
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.55);
  await new Promise(r => setTimeout(r, 400));
}
await page.screenshot({ path: `${ARTIFACT_DIR}/vise-active-proof.png` });
console.log('Saved vise-active-proof.png');

await browser.close();
server.close();
