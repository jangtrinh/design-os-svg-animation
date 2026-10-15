/* Full-page capture of the delivered DC-01 R03 review page (offline index.html) for the delivery chapter scroll.
 *   node capture-review-page.mjs  ->  assets/review/review-page-full.jpg (1600 px wide) */
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PAGE = path.join(os.homedir(), 'Products/design-os-3d-blender/builds/desktop-companion/delivery/R03/index.html');
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
  args: ['--allow-file-access-from-files', '--hide-scrollbars'], defaultViewport: { width: 1600, height: 1000 } });
const page = await browser.newPage();
await page.goto(pathToFileURL(PAGE).href, { waitUntil: 'load', timeout: 60000 });
// lazy images below the fold never load in a headless viewport, so force them eager and bound every wait
await page.evaluate(async () => {
  await document.fonts.ready;
  document.querySelectorAll('video').forEach((v) => v.pause());
  const imgs = [...document.images]; imgs.forEach((i) => { i.loading = 'eager'; });
  await Promise.all(imgs.map((i) => Promise.race([i.decode().catch(() => {}), new Promise((r) => setTimeout(r, 15000))])));
});
const h = await page.evaluate(() => document.documentElement.scrollHeight);
await page.screenshot({ path: path.join(HERE, 'assets/review/review-page-full.jpg'), type: 'jpeg', quality: 88, fullPage: true });
console.log(`review page 1600x${h}`);
await browser.close();
