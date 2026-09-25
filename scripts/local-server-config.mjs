/**
 * local-server-config.mjs — single source of truth for this project's localhost server.
 *
 * The port is registered in `.project-agent.md` and `~/.config/project-localhost-ports.json`.
 * Every dev/export/audit/capture script imports it from here; never hardcode a port.
 */

import path from 'path';

export const LOCAL_SERVER_PORT = 4323;
export const LOCAL_SERVER_HOST = '127.0.0.1';
export const LOCAL_SERVER_ORIGIN = `http://${LOCAL_SERVER_HOST}:${LOCAL_SERVER_PORT}`;

/**
 * Map a request URL onto a file path strictly inside `rootDir`.
 * Returns null for malformed encodings, NUL bytes, or any path escaping the root
 * (`/../`, `%2e%2e/`, absolute-path tricks), so static servers cannot leak files outside it.
 */
export function resolvePathInsideRoot(rootDir, requestUrl) {
  let urlPath;
  try {
    urlPath = decodeURIComponent(String(requestUrl).split('?')[0].split('#')[0]);
  } catch {
    return null;
  }
  if (urlPath.includes('\0')) return null;

  const root = path.resolve(rootDir);
  const candidate = path.resolve(root, '.' + path.posix.normalize('/' + urlPath));
  const relative = path.relative(root, candidate);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return candidate;
}
