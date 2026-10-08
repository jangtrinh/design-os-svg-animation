#!/usr/bin/env node
/**
 * DESIGN:OS Hairline Figure Pipeline Engine
 *
 * End-to-end generator, builder, and validator for custom 2:1 isometric
 * vector line figures that answer the pointer.
 *
 * Usage:
 *   node scripts/create-hairline-figure.mjs build <figure.js> [out.html]
 *   node scripts/create-hairline-figure.mjs validate <figure.html>
 *   node scripts/create-hairline-figure.mjs capture <figure.html> [proof.png]
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL_DIR = path.resolve(ROOT, '../.agents/skills/hairline-create');

const [,, command, target, output] = process.argv;

if (!command || !target) {
  console.log(`
Usage:
  node scripts/create-hairline-figure.mjs build <figure.js> [out.html]
  node scripts/create-hairline-figure.mjs validate <figure.html>
  node scripts/create-hairline-figure.mjs capture <figure.html> [proof.png]
`);
  process.exit(1);
}

if (command === 'build') {
  const figPath = path.resolve(process.cwd(), target);
  const outPath = output ? path.resolve(process.cwd(), output) : figPath.replace(/\.js$/, '.html');
  const res = spawnSync('node', [path.join(SKILL_DIR, 'build.mjs'), figPath, outPath], { stdio: 'inherit' });
  if (res.status !== 0) process.exit(res.status);
  console.log(`[✓] Assembled deliverable: ${outPath}`);
} else if (command === 'validate') {
  const htmlPath = path.resolve(process.cwd(), target);
  const res = spawnSync('node', [path.join(SKILL_DIR, 'validate.mjs'), htmlPath], { stdio: 'inherit' });
  process.exit(res.status);
} else if (command === 'capture') {
  const htmlPath = path.resolve(process.cwd(), target);
  const proofPath = output ? path.resolve(process.cwd(), output) : htmlPath.replace(/\.html$/, '-proof.png');
  
  import('puppeteer-core').then(async ({ default: puppeteer }) => {
    import('./astra-law-export-support.mjs').then(async ({ serveFiles }) => {
      const server = await serveFiles(ROOT);
      const port = server.address().port;
      const browser = await puppeteer.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-gpu']
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 900 });

      const relPath = path.relative(ROOT, htmlPath);
      const url = `http://127.0.0.1:${port}/${relPath}`;
      console.log(`[*] Capturing: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle0' });

      // Move mouse to trigger rest -> answer kinematics
      const stage = await page.$('#stage') || await page.$('svg');
      if (stage) {
        const box = await stage.boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4);
          await new Promise(r => setTimeout(r, 300));
        }
      }

      await page.screenshot({ path: proofPath });
      console.log(`[✓] Saved visual proof: ${proofPath}`);

      await browser.close();
      server.close();
    });
  });
}
