import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { resolvePathInsideRoot } from '../scripts/local-server-config.mjs';

const root = path.resolve('/srv/site');

test('maps normal request paths inside the root', () => {
  assert.equal(resolvePathInsideRoot(root, '/index.html?clean=true#x'), path.join(root, 'index.html'));
  assert.equal(resolvePathInsideRoot(root, '/docs/a%20b.html'), path.join(root, 'docs/a b.html'));
});

for (const [name, url] of Object.entries({
  'raw dot-dot': '/../../etc/passwd',
  'encoded dot-dot': '/%2e%2e/%2e%2e/etc/passwd',
  'encoded slash': '/..%2f..%2fetc/passwd',
  'malformed encoding': '/%ZZ',
  'nul byte': '/index.html%00.png'
})) test(`rejects ${name}`, () => {
  const resolved = resolvePathInsideRoot(root, url);
  assert.ok(resolved === null || resolved.startsWith(root + path.sep), `${url} escaped to ${resolved}`);
  if (name !== 'raw dot-dot' && name !== 'encoded dot-dot' && name !== 'encoded slash') assert.equal(resolved, null);
});
