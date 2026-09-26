#!/usr/bin/env node
/**
 * crawl.mjs — load every tracked HTML page under promo/ and docs/ on the dev server and
 * record failed requests (HTTP >= 400 or network failure). Run before and after the
 * restructure; the diff must be empty (or only fixes).
 * Usage: node plans/260926-repo-structure/crawl.mjs <out.json>
 */

import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { LOCAL_SERVER_ORIGIN } from '../../scripts/local-server-config.mjs';

const pages = String(execFileSync('git', ['ls-files', 'promo/*.html', 'promo/**/*.html', 'docs/*.html', 'docs/**/*.html']))
  .split('\n').filter(Boolean).filter((p, i, a) => a.indexOf(p) === i);
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
const report = {};
for (const file of pages) {
  const page = await browser.newPage();
  const failed = new Set();
  page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) failed.add(`${r.status()} ${r.url().replace(LOCAL_SERVER_ORIGIN, '')}`); });
  page.on('requestfailed', r => { const reason = r.failure()?.errorText ?? ''; if (!reason.includes('ERR_ABORTED')) failed.add(`failed ${r.url().replace(LOCAL_SERVER_ORIGIN, '')} ${reason}`); });
  page.on('pageerror', e => failed.add(`pageerror ${e.message.slice(0, 120)}`));
  try {
    await page.goto(`${LOCAL_SERVER_ORIGIN}/${file}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 400));
  } catch (error) {
    failed.add(`goto ${error.message.slice(0, 80)}`);
  }
  report[file] = { finalUrl: page.url().replace(LOCAL_SERVER_ORIGIN, ''), failed: [...failed].sort() };
  await page.close();
}
await browser.close();
fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 1));
const bad = Object.entries(report).filter(([, v]) => v.failed.length);
console.log(`${pages.length} pages, ${bad.length} with failures`);
for (const [file, v] of bad) console.log(`  ${file}: ${v.failed.join(' | ')}`);
