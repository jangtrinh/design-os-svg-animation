import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const ARTIFACTS_DIR = '/Users/jang/.gemini/antigravity/brain/f89cf83b-4c7a-4c1f-be9d-65a033a2abd3';
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 3036;

// Simple static file server
function startServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.gif': 'image/gif',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0].split('#')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(DOCS_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`Docs static server listening on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function main() {
  const server = await startServer();

  console.log('Launching headless Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_BIN,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1440,1200'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 2 });

  console.log(`Navigating to http://localhost:${PORT}/index.html...`);
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });

  // 1. Capture Hero Carousel Slide 0 (Claude Design)
  const heroEl = await page.$('#hero-carousel');
  if (heroEl) {
    const p1 = path.join(ARTIFACTS_DIR, 'proof_marketing_hero_claude.png');
    await heroEl.screenshot({ path: p1 });
    console.log(`✓ Saved ${p1}`);
  }

  // 2. Click Tab 1 (SaaS Short 11.5s)
  await page.evaluate(() => {
    const tab1 = document.querySelectorAll('.carousel-tab')[1];
    if (tab1) tab1.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  if (heroEl) {
    const p2 = path.join(ARTIFACTS_DIR, 'proof_marketing_hero_saas.png');
    await heroEl.screenshot({ path: p2 });
    console.log(`✓ Saved ${p2}`);
  }

  // 3. Click Tab 2 (OpenAI Codex App 38s)
  await page.evaluate(() => {
    const tab2 = document.querySelectorAll('.carousel-tab')[2];
    if (tab2) tab2.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  if (heroEl) {
    const p3 = path.join(ARTIFACTS_DIR, 'proof_marketing_hero_codex.png');
    await heroEl.screenshot({ path: p3 });
    console.log(`✓ Saved ${p3}`);
  }

  // 4. Scroll to #showcase and capture Showcase Builds section
  const showcaseEl = await page.$('#showcase');
  if (showcaseEl) {
    await page.evaluate(() => {
      document.getElementById('showcase').scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 600));

    const p4 = path.join(ARTIFACTS_DIR, 'proof_marketing_showcase_section.png');
    await showcaseEl.screenshot({ path: p4 });
    console.log(`✓ Saved ${p4}`);
  }

  // 5. Full Top Header + Hero Capture
  const topHeader = await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'proof_marketing_page_full_hero.png'),
    clip: { x: 0, y: 0, width: 1440, height: 1100 }
  });
  console.log(`✓ Saved full hero viewport proof`);

  await browser.close();
  server.close();
  console.log('All visual marketing proofs generated successfully!');
}

main().catch((err) => {
  console.error('Fatal error capturing proofs:', err);
  process.exit(1);
});
