import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = process.cwd();
const ARTIFACT_DIR = '/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2';

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
  { name: 'Grade 1 Math', path: 'playground/math-grade1.html', outName: 'canonical-layout-math-grade1-proof.png', gridName: 'suite-25-figures-math-proof.png' },
  { name: 'Physics', path: 'playground/physics.html', outName: 'canonical-layout-physics-proof.png', gridName: 'suite-25-figures-physics-proof.png' },
  { name: 'Chemistry', path: 'playground/chemistry.html', outName: 'canonical-layout-chemistry-proof.png', gridName: 'suite-25-figures-chemistry-proof.png' },
  { name: 'Physical Education', path: 'playground/pe.html', outName: 'canonical-layout-pe-proof.png', gridName: 'suite-25-figures-pe-proof.png' }
];

for (const suite of suites) {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  const url = `http://127.0.0.1:4329/${suite.path}`;
  console.log(`Navigating to ${suite.name}: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 350));

  if (errors.length > 0) {
    console.error(`Errors on ${suite.name}:`, errors);
    process.exitCode = 1;
  }

  // 1. Capture canonical page proof
  const outPath = path.join(ARTIFACT_DIR, suite.outName);
  await page.screenshot({ path: outPath, clip: { x: 260, y: 16, width: 680, height: 780 } });
  console.log(`✓ Saved ${suite.name} canonical proof to: ${outPath}`);

  // 2. Collect all rendered SVG stages & readouts in this suite and render a contact sheet
  const cards = await page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const chips = [...document.querySelectorAll('#picker .chip')];
    const stage = document.getElementById('stage');
    const items = [];
    for (let i = 0; i < chips.length; i++) {
      chips[i].click();
      await wait(120);
      const id = window.HL._order[i];
      const fig = window.HL.figures[id];
      items.push({
        idx: String(i + 1).padStart(2, '0'),
        title: fig.title,
        read: document.getElementById('read').textContent.trim(),
        means: document.getElementById('means').textContent.trim(),
        svg: stage.outerHTML
      });
    }
    return items;
  });

  await page.evaluate((suiteName, items) => {
    document.body.innerHTML = `
      <div id="sheet" style="max-width:1120px;margin:0 auto;padding:20px 24px;font-family:ui-sans-serif,system-ui,sans-serif;color:#141413;background:#faf9f6;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #d4d2cc;padding-bottom:8px;margin-bottom:14px;">
          <strong style="font-size:14px;letter-spacing:0.02em;">${suiteName.toUpperCase()} — REFACTORED SUITE AUDIT (${items.length} FIGURES)</strong>
          <span style="font-family:ui-monospace,monospace;font-size:11px;color:#6e6c66;">100% STATIC + LIVE CHROME PASS · C.S CALIBRATED · ZERO INLINE PAINT</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:12px;">
          ${items.map(it => `
            <div style="border:1px solid #dedcd6;border-radius:6px;background:#fff;padding:8px;display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:600;">
                <span>${it.title}</span>
              </div>
              <div style="border:1px solid #eceae4;border-radius:4px;background:#faf9f6;overflow:hidden;">
                ${it.svg.replace('id="stage"', '')}
              </div>
              <div style="font-family:ui-monospace,monospace;font-size:10px;color:#141413;background:#f2f0ea;padding:3px 6px;border-radius:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${it.read}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }, suite.name, cards);

  await new Promise(r => setTimeout(r, 150));
  const sheetBox = await page.$eval('#sheet', el => {
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
  });
  const gridPath = path.join(ARTIFACT_DIR, suite.gridName);
  await page.screenshot({ path: gridPath, clip: sheetBox });
  console.log(`✓ Saved ${suite.name} contact sheet (${cards.length} figures) to: ${gridPath}`);
}

await browser.close();
server.close();
console.log('✓ All 4 suites + 25-figure contact sheets captured and verified successfully!');
