import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
import { createReadStream, statSync } from 'node:fs';
import path from 'node:path';

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png'
};

export function serveFiles(root) {
  const server = createServer((request, response) => {
    const decoded = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, `.${decoded}`);
    if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
    try {
      if (!statSync(file).isFile()) throw new Error('not a file');
      response.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
      createReadStream(file).pipe(response);
    } catch { response.writeHead(404).end(); }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

export function renderedPixelDifference(firstPath, secondPath) {
  const decode = file => spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 8 * 1024 * 1024 });
  const first = decode(firstPath), second = decode(secondPath);
  if (first.status !== 0 || second.status !== 0 || first.stdout.length !== second.stdout.length) {
    throw new Error('Could not compare rendered seek frames');
  }
  let pixels = 0, maxChannelDelta = 0;
  for (let index = 0; index < first.stdout.length; index += 3) {
    let changed = false;
    for (let channel = 0; channel < 3; channel++) {
      const delta = Math.abs(first.stdout[index + channel] - second.stdout[index + channel]);
      if (delta) changed = true;
      maxChannelDelta = Math.max(maxChannelDelta, delta);
    }
    if (changed) pixels++;
  }
  return { pixels, maxChannelDelta };
}
