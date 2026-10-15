/* Full-page capture of a delivered review page (offline index.html) for a delivery-chapter scroll.
 *   node capture-review-page.mjs --project <dir> [--page <index.html>] [--out <jpg>]
 * --page / --out default to config reviewCapture.page / reviewCapture.out (~ expands to the home directory).
 * The page is read from disk only; nothing is fetched. Output is a 1600 px wide jpg. */
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import { flag, loadProject } from './tutorial-project.mjs';

const args = process.argv.slice(2);
const project = loadProject(flag(args, '--project'));
const rc = project.cfg.reviewCapture || {};
const pageArg = flag(args, '--page', rc.page), outArg = flag(args, '--out', rc.out);
if (!pageArg || !outArg) { console.error('need --page and --out (or config reviewCapture.page / reviewCapture.out)'); process.exit(2); }
const PAGE = path.resolve(pageArg.replace(/^~(?=\/)/, os.homedir()));
const OUT = path.resolve(project.dir, outArg);
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
await page.screenshot({ path: OUT, type: 'jpeg', quality: 88, fullPage: true });
console.log(`review page 1600x${h} -> ${path.relative(project.dir, OUT)}`);
await browser.close();
