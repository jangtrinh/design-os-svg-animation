import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { optimize } from 'svgo';
import config from '../svgo.config.mjs';
const input = new URL('../fixtures/source.svg', import.meta.url);
const result = optimize(await readFile(input, 'utf8'), { ...config, path: input.pathname });
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/source.optimized.svg', import.meta.url), result.data);
console.log('Wrote artifacts/source.optimized.svg; source preserved. This is optimization, not sanitization.');
