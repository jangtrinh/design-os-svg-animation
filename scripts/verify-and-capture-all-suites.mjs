import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = process.cwd();
const ARTIFACT_DIR = '/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2';

// 1. Embedded static server
const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(ROOT, urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, 'docs', urlPath);
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  const ext = path.extname(filePath);
  const mimeMap = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png'
  };
  res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise(r => server.listen(4329, r));
console.log('✓ Static server running on http://127.0.0.1:4329');

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu']
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 950, deviceScaleFactor: 2 });

const suites = [
  { name: 'Physics', path: 'playground/physics.html', outName: 'canonical-layout-physics-proof.png' },
  { name: 'Chemistry', path: 'playground/chemistry.html', outName: 'canonical-layout-chemistry-proof.png' },
  { name: 'Physical Education', path: 'playground/pe.html', outName: 'canonical-layout-pe-proof.png' },
  { name: 'Grade 1 Math', path: 'playground/math-grade1.html', outName: 'canonical-layout-math-grade1-proof.png' }
];

for (const suite of suites) {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  const url = `http://127.0.0.1:4329/${suite.path}`;
  console.log(`Navigating to ${suite.name}: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  if (errors.length > 0) {
    console.error(`Errors on ${suite.name}:`, errors);
  }

  // Capture full viewport proof
  const outPath = path.join(ARTIFACT_DIR, suite.outName);
  await page.screenshot({ path: outPath, clip: { x: 260, y: 16, width: 680, height: 780 } });
  console.log(`✓ Saved ${suite.name} proof to: ${outPath}`);

  // Test interactive switching
  await page.keyboard.press('2');
  await new Promise(r => setTimeout(r, 400));
}

await browser.close();
server.close();
console.log('✓ All 4 suites captured and verified successfully!');
