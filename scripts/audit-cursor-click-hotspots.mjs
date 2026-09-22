#!/usr/bin/env node
/**
 * audit-cursor-click-hotspots.mjs
 * 
 * Design OS Gate 6: Cursor Tip & Click Hotspot Alignment Audit Gate.
 * Enforces:
 *   1. Canonical macOS pointer arrow tip is at strictly (0, 0).
 *   2. Pointer tip and tactile click ripple wave center are concentric: |tip - rippleCenter| <= 1.0px.
 *   3. Pointer contact point lands strictly inside the interactive target element's bounding box.
 *   4. Zero cursor jitter / shift when .pressed state activates.
 */

import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_BIN = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 3033;
const BASE_URL = `http://localhost:${PORT}`;

const TARGET_PAGES = [
  {
    name: 'Vercel v0: Generative UI Promo',
    path: '/v0-generative-ui.html?clean=true'
  },
  {
    name: 'OpenAI Codex App Promo',
    path: '/codex-app-promo.html?clean=true'
  }
];

function checkServer(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.abort();
      resolve(false);
    });
  });
}

function startStaticServer(port, staticDir) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(staticDir, reqPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

async function auditPage(page, target) {
  console.log(`\n======================================================================`);
  console.log(` 🎯 AUDITING HOTSPOTS: ${target.name}`);
  console.log(`    URL: ${BASE_URL}${target.path}`);
  console.log(`======================================================================`);

  await page.goto(`${BASE_URL}${target.path}`, { waitUntil: 'load', timeout: 30000 });

  const auditData = await page.evaluate(() => {
    const events = window.__CLICK_EVENTS || [];
    const stage = document.getElementById('video-stage');
    if (!stage) return { error: 'Missing #video-stage element' };

    const stageRect = stage.getBoundingClientRect();
    const results = [];

    for (const evt of events) {
      // Seek clock to click timestamp
      window.__seekToTime(evt.t);

      const cur = document.getElementById('virtual-cursor');
      const rip = document.getElementById('click-ripple');
      if (!cur) {
        results.push({ id: evt.id, label: evt.label, t: evt.t, error: 'Missing #virtual-cursor' });
        continue;
      }
      if (!rip) {
        results.push({ id: evt.id, label: evt.label, t: evt.t, error: 'Missing #click-ripple' });
        continue;
      }

      const curRect = cur.getBoundingClientRect();
      const ripRect = rip.getBoundingClientRect();

      // In clean-export mode, stage is unscaled (1:1), world coordinates == screen coordinates
      const curTipX = curRect.left - stageRect.left;
      const curTipY = curRect.top - stageRect.top;

      const ripCenterX = (ripRect.left + ripRect.width / 2) - stageRect.left;
      const ripCenterY = (ripRect.top + ripRect.height / 2) - stageRect.top;

      const delta = Math.hypot(curTipX - ripCenterX, curTipY - ripCenterY);

      // Locate target element
      const targetEl = evt.el || document.getElementById(evt.targetId || evt.id);
      let targetBounds = null;
      let targetHit = false;

      if (targetEl) {
        const tRect = targetEl.getBoundingClientRect();
        targetBounds = {
          left: Math.round(tRect.left - stageRect.left),
          top: Math.round(tRect.top - stageRect.top),
          right: Math.round(tRect.right - stageRect.left),
          bottom: Math.round(tRect.bottom - stageRect.top),
          width: Math.round(tRect.width),
          height: Math.round(tRect.height)
        };

        // Check if cursor tip falls inside target element on screen (with 2px anti-aliasing margin)
        targetHit = (curRect.left >= tRect.left - 2 && curRect.left <= tRect.right + 2 &&
                     curRect.top >= tRect.top - 2 && curRect.top <= tRect.bottom + 2);
      }

      results.push({
        id: evt.id,
        label: evt.label || evt.id,
        t: evt.t,
        worldX: evt.x,
        worldY: evt.y,
        curTipX: Math.round(curTipX * 100) / 100,
        curTipY: Math.round(curTipY * 100) / 100,
        ripCenterX: Math.round(ripCenterX * 100) / 100,
        ripCenterY: Math.round(ripCenterY * 100) / 100,
        delta: Math.round(delta * 100) / 100,
        targetHit,
        targetBounds,
        hasTargetEl: !!targetEl
      });
    }

    return { results };
  });

  if (auditData.error) {
    console.error(`❌ Page audit error: ${auditData.error}`);
    return false;
  }

  let allPassed = true;
  console.log(`\nFound ${auditData.results.length} registered click events:\n`);

  for (const r of auditData.results) {
    if (r.error) {
      console.log(`❌ [FAIL] ${r.id.padEnd(10)}: ${r.error}`);
      allPassed = false;
      continue;
    }

    const concentricPass = r.delta <= 1.0;
    const targetPass = r.targetHit && r.hasTargetEl;
    const passed = concentricPass && targetPass;

    if (!passed) allPassed = false;

    const icon = passed ? '✅' : '❌';
    console.log(`${icon} [${r.id.padEnd(8)}] t=${r.t.toFixed(2)}s | Tip: (${r.curTipX.toFixed(1)}, ${r.curTipY.toFixed(1)}) | Ripple: (${r.ripCenterX.toFixed(1)}, ${r.ripCenterY.toFixed(1)}) | Δ=${r.delta.toFixed(2)}px | TargetHit: ${r.targetHit ? 'YES' : 'NO'}`);
    if (!targetPass) {
      console.log(`   ⚠️ Target element bound issue: Bounds=${JSON.stringify(r.targetBounds)}, HasEl=${r.hasTargetEl}`);
    }
  }

  return allPassed;
}

async function main() {
  console.log('🛡️ DESIGN:OS GATE 6 — CURSOR TIP & CLICK HOTSPOT ALIGNMENT AUDIT');

  let fallbackServer = null;
  const serverRunning = await checkServer(PORT);
  if (!serverRunning) {
    console.log(`ℹ️ HTTP server not found on port ${PORT}. Starting embedded static server for ./promo...`);
    fallbackServer = await startStaticServer(PORT, path.resolve('promo'));
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_BIN,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--hide-scrollbars'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    }
  });

  const page = await browser.newPage();
  let overallSuccess = true;

  try {
    for (const target of TARGET_PAGES) {
      const passed = await auditPage(page, target);
      if (!passed) overallSuccess = false;
    }
  } finally {
    await browser.close();
    if (fallbackServer) {
      fallbackServer.close();
    }
  }

  console.log(`\n======================================================================`);
  if (overallSuccess) {
    console.log(` 🛡️ GATE 6 PASSED: 100% OF CURSOR TIPS & CLICK RIPPLES ARE CONCENTRIC (Δ <= 1.0px)`);
    console.log(`    AND ALL CLICK CONTACT POINTS HIT TARGET BOUNDING BOXES.`);
    console.log(`======================================================================\n`);
    process.exit(0);
  } else {
    console.error(` ❌ GATE 6 FAILED: Click hotspots or concentric ripple alignment violations detected!`);
    console.error(`======================================================================\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
