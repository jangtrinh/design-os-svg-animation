#!/usr/bin/env node
/**
 * dev-server.mjs — Design OS Motion Engine Local Dev Server
 * 
 * High-performance static server with Range support, CORS headers,
 * and unified routing across /promo and /docs.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LOCAL_SERVER_PORT, LOCAL_SERVER_HOST, LOCAL_SERVER_ORIGIN, resolvePathInsideRoot } from './local-server-config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PROMO_DIR = path.join(ROOT_DIR, 'promo');

const PORT = LOCAL_SERVER_PORT;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.ts': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function resolveFilePath(reqUrl) {
  const urlPath = reqUrl.split('?')[0];

  if (urlPath === '/' || urlPath === '') {
    return path.join(PROMO_DIR, 'design-os-tutorial.html');
  }

  // Check in promo directory first, then repo root (e.g. /docs/..., /src/...).
  // resolvePathInsideRoot rejects any request escaping its root directory.
  for (const rootDir of [PROMO_DIR, ROOT_DIR]) {
    const target = resolvePathInsideRoot(rootDir, reqUrl);
    if (target && fs.existsSync(target) && fs.statSync(target).isFile()) return target;
  }

  return null;
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', LOCAL_SERVER_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const filePath = resolveFilePath(req.url);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`404 Not Found: ${req.url}`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const stat = fs.statSync(filePath);

  // Handle Range requests for video seeking (.mp4)
  const range = req.headers.range;
  if (range && ext === '.mp4') {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = (end - start) + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType
    });

    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);
    return;
  }

  // Standard File Stream
  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache'
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Find the owner with: lsof -nP -iTCP:${PORT} -sTCP:LISTEN`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, LOCAL_SERVER_HOST, () => {
  console.log('='.repeat(70));
  console.log(` 🚀 DESIGN OS DEV SERVER RUNNING AT: ${LOCAL_SERVER_ORIGIN}`);
  console.log('='.repeat(70));
  console.log(` 📺 Tutorial (Codex Light):  ${LOCAL_SERVER_ORIGIN}/design-os-tutorial.html`);
  console.log(` 🤖 OpenAI Codex Promo:      ${LOCAL_SERVER_ORIGIN}/codex-app-promo.html`);
  console.log(` ⚡ Vercel v0 Generative UI:  ${LOCAL_SERVER_ORIGIN}/v0-generative-ui.html`);
  console.log(` 🌐 Claude Design 3D Globe:  ${LOCAL_SERVER_ORIGIN}/claude-design-promo.html`);
  console.log(` 📐 Architecture Dashboard:  ${LOCAL_SERVER_ORIGIN}/docs/architecture-dashboard.html`);
  console.log(` 🧩 Primitives Live Gallery:  ${LOCAL_SERVER_ORIGIN}/docs/primitives-showcase.html`);
  console.log('='.repeat(70));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
