import puppeteer from 'puppeteer-core';
import path from 'node:path';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu']
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });

// 1. Capture Payment Terminal Specimen
console.log('Capturing case-terminal...');
await page.goto('http://127.0.0.1:4323/playground/case-terminal.html?theme=light', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));
const stage = await page.$('#stage');
if (stage) {
  const box = await stage.boundingBox();
  // Move pointer over key 5
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.48);
  await new Promise(r => setTimeout(r, 600));
}
await page.screenshot({ path: 'docs/assets/hairline-case-terminal.png' });
console.log('Saved docs/assets/hairline-case-terminal.png');

// 2. Capture Machine Vise Specimen
console.log('Capturing vise-sol...');
await page.goto('http://127.0.0.1:4323/playground/vise-sol.html?theme=light', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));
const viseStage = await page.$('#stage');
if (viseStage) {
  const box = await viseStage.boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
  await new Promise(r => setTimeout(r, 600));
}
await page.screenshot({ path: 'docs/assets/hairline-vise-sol.png' });
console.log('Saved docs/assets/hairline-vise-sol.png');

await browser.close();
console.log('Done capturing docs assets!');
