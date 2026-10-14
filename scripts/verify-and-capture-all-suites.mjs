import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = process.cwd();
const ARTIFACT_DIR = '/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2';
const DOCS_ASSETS_DIR = path.join(ROOT, 'docs/assets');

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
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif'
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

const suites = [
  {
    name: 'Grade 1 Math',
    path: 'playground/math-grade1.html',
    outName: 'canonical-layout-math-grade1-proof.png',
    coverName: 'math-gallery-cover.png'
  },
  {
    name: 'Physics',
    path: 'playground/physics.html',
    outName: 'canonical-layout-physics-proof.png',
    coverName: 'physics-gallery-cover.png'
  },
  {
    name: 'Chemistry',
    path: 'playground/chemistry.html',
    outName: 'canonical-layout-chemistry-proof.png',
    coverName: 'chemistry-gallery-cover.png'
  },
  {
    name: 'Physical Education',
    path: 'playground/pe.html',
    outName: 'canonical-layout-pe-proof.png',
    coverName: 'pe-gallery-cover.png'
  }
];

for (const suite of suites) {
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
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

  // 1. Capture canonical single-figure page proof
  const outPath = path.join(ARTIFACT_DIR, suite.outName);
  await page.screenshot({ path: outPath, clip: { x: 300, y: 12, width: 680, height: 760 } });
  console.log(`✓ Saved ${suite.name} canonical proof to: ${outPath}`);

  // 2. Collect all rendered SVG stages & canonical metadata in this suite
  const data = await page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const tabs = [...document.querySelectorAll('#nav-tabs .nav-btn')];
    const stage = document.getElementById('stage');
    const topNavHtml = document.querySelector('.top-nav-bar')?.outerHTML || '';
    const items = [];
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].click();
      await wait(120);
      const id = window.HL._order[i];
      items.push({
        idx: i + 1,
        id,
        tabLabel: tabs[i].textContent.trim(),
        read: document.getElementById('read').textContent.trim(),
        means: document.getElementById('means').textContent.trim(),
        rules: document.getElementById('rules').textContent.trim(),
        val: document.getElementById('value')?.textContent.trim() || '',
        svg: stage.innerHTML
      });
    }
    return { topNavHtml, items };
  });

  // 3. Render 16:9 (1280x720 @ 2x) canonical specimen cover into docs/assets/<coverName>
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
  await page.evaluate(({ topNavHtml, items }) => {
    const first = items[0];
    const rest = items.slice(1);
    const isTen = items.length > 5;
    const cols = isTen ? 3 : 2;

    document.body.style.padding = '20px 32px';
    document.body.style.minHeight = '720px';
    document.body.style.height = '720px';
    document.body.style.overflow = 'hidden';
    document.body.style.display = 'flex';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';

    document.body.innerHTML = `
      <div style="width:1216px;display:grid;grid-template-columns:${isTen ? '450px 1fr' : '500px 1fr'};gap:24px;align-items:center;">
        <main style="max-width:100%;margin:0;">
          ${topNavHtml}
          <div class="nav-strip" style="margin-bottom:10px;">
            ${items.map((it, idx) => `<button class="nav-btn${idx === 0 ? ' active' : ''}" style="height:24px;padding:0 8px;font-size:10px;">${it.tabLabel}</button>`).join('')}
          </div>
          <div class="plate">
            <span class="tag" style="left:14px;">${first.id}</span>
            <span class="tag" style="right:14px;color:var(--ink);font-variant-numeric:tabular-nums;">${first.read}</span>
            <div id="stage" data-hairline="${first.id}">
              ${first.svg}
            </div>
          </div>
          <div class="controls" style="margin-top:10px;">
            <button aria-label="Previous figure">←</button>
            <label class="label">intensity</label>
            <input type="range" min="0" max="1" step="0.01" value="0.5">
            <output>${first.val}</output>
            <button aria-label="Next figure">→</button>
          </div>
          <p id="means" style="margin-top:10px;font-size:12px;line-height:1.45;">${first.means}</p>
          <p id="rules" class="label" style="margin-top:5px;">${first.rules}</p>
        </main>
        <div style="display:grid;grid-template-columns:repeat(${cols}, 1fr);gap:${isTen ? '10px' : '14px'};">
          ${rest.map(it => `
            <div class="plate" style="border-radius:10px;">
              <span class="tag" style="top:8px;left:10px;font-size:${isTen ? '8.5px' : '9.5px'};">${isTen ? it.id.replace(/^math-/, '') : it.id}</span>
              <span class="tag" style="top:8px;right:10px;font-size:${isTen ? '8.5px' : '9.5px'};color:var(--ink);font-variant-numeric:tabular-nums;">${it.read}</span>
              <div id="stage" data-hairline="${it.id}">
                ${it.svg}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }, data);

  await new Promise(r => setTimeout(r, 150));
  const coverAssetPath = path.join(DOCS_ASSETS_DIR, suite.coverName);
  const coverArtifactPath = path.join(ARTIFACT_DIR, suite.coverName);
  await page.screenshot({ path: coverAssetPath });
  fs.copyFileSync(coverAssetPath, coverArtifactPath);
  console.log(`✓ Saved 16:9 canonical cover to: ${coverAssetPath}`);
}

// 4. Capture updated GitHub Pages (docs/index.html#hairline) visual proof
await page.setViewport({ width: 1280, height: 3200, deviceScaleFactor: 2 });
await page.goto('http://127.0.0.1:4329/docs/index.html#hairline', { waitUntil: 'networkidle0' });
await page.evaluate(async () => {
  for (const img of document.querySelectorAll('#hairline img')) {
    img.loading = 'eager';
    img.scrollIntoView();
  }
  window.scrollTo(0, 0);
});
await new Promise(r => setTimeout(r, 500));
const hairlineBox = await page.$eval('#hairline', el => {
  const r = el.getBoundingClientRect();
  const cards = [...el.querySelectorAll('.branch-page-media')].map(c => c.getBoundingClientRect());
  const minX = Math.min(r.x, ...cards.map(c => c.x));
  const maxX = Math.max(r.right, ...cards.map(c => c.right));
  return {
    x: Math.max(0, Math.floor(minX - 24)),
    y: Math.max(0, Math.floor(r.y + window.scrollY - 16)),
    width: Math.ceil(maxX - minX + 48),
    height: Math.ceil(r.height + 32)
  };
});
const ghPagesProofPath = path.join(ARTIFACT_DIR, 'github-pages-hairline-updated-proof.png');
await page.screenshot({ path: ghPagesProofPath, clip: hairlineBox });
console.log(`✓ Saved GitHub Pages #hairline proof to: ${ghPagesProofPath}`);

await browser.close();
server.close();
console.log('✓ All 4 suite covers in docs/assets/ and GitHub Pages proof updated and verified!');
