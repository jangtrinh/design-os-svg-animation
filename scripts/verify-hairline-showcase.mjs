import puppeteer from 'puppeteer-core';
import { serveFiles } from './astra-law-export-support.mjs';

const server = await serveFiles(process.cwd());
const port = server.address().port;
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu']
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100 });

const errors = [];
page.on('pageerror', err => errors.push(err.message));
page.on('response', res => {
  if (res.status() >= 400 && !res.url().includes('favicon')) {
    errors.push(`${res.status()} ${res.url()}`);
  }
});

const url = `http://127.0.0.1:${port}/playground/hairline-showcase.html`;
console.log('Navigating to:', url);
await page.goto(url, { waitUntil: 'networkidle0' });

if (errors.length > 0) {
  console.error('Page errors encountered:', errors);
  process.exit(1);
}

// Check mounted figures count
const mountedCount = await page.$$eval('.figure-card svg', svgs => svgs.length);
console.log('Mounted SVG figures:', mountedCount);

// Hover over Terrain (first figure) to trigger pointer kinematics
const terrainStage = await page.$('#stage-terrain');
if (terrainStage) {
  const box = await terrainStage.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.45);
    await new Promise(r => setTimeout(r, 250));
  }
}

// Hover over Riffle (second figure)
const riffleStage = await page.$('#stage-riffle');
if (riffleStage) {
  const box = await riffleStage.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5);
    await new Promise(r => setTimeout(r, 250));
  }
}

const artifactPath = '/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2/hairline-showcase-proof.png';
await page.screenshot({ path: artifactPath, fullPage: false });
console.log('Showcase proof screenshot captured:', artifactPath);

await browser.close();
server.close();
