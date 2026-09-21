import { readFile } from 'node:fs/promises';
const queue = JSON.parse(await readFile(new URL('../knowledge/research/backlog.json', import.meta.url), 'utf8'));
const pending = queue.filter(x => x.status === 'pending').sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
console.log(JSON.stringify({ mode: 'read-only-queue', pending: pending.length, next: pending[0] ?? null }, null, 2));
