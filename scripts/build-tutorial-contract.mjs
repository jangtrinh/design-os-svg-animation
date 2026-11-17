#!/usr/bin/env node
/* Generate skills/es-tutorial-video/contract.json from the tutorial kit's own source: the config schema
 * (promo/_tutorial-kit/tutorial-project.mjs), the element renderers and the fields each one reads
 * (tutorial-elements.js, tutorial-scene.js, tutorial-portrait-layout.js) and the CLI flags of every kit script.
 * "_sha256" is the hash of everything below it, so a hand-edited contract is refused by validate.mjs.
 *   node scripts/build-tutorial-contract.mjs            write the contract
 *   node scripts/build-tutorial-contract.mjs --check    exit 1 when the committed contract is stale */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG_SCHEMA, contractDigest, loadPedagogy } from '../promo/_tutorial-kit/tutorial-project.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KIT = path.join(ROOT, 'promo', '_tutorial-kit');
export const CONTRACT_PATH = path.join(ROOT, 'skills', 'es-tutorial-video', 'contract.json');
const read = (f) => fs.readFileSync(path.join(KIT, f), 'utf8');
const uniq = (a) => [...new Set(a)].sort();

/** Renderer blocks: "R.<type> = {" up to the next renderer; every `s.<field>` read inside is a spec field. */
export function elementTypes(src) {
  const marks = [...src.matchAll(/^\s*R\.(\w+) = \{/gm)];
  const out = {};
  marks.forEach((m, i) => {
    const body = src.slice(m.index, i + 1 < marks.length ? marks[i + 1].index : src.length);
    out[m[1]] = uniq([...body.matchAll(/\bs\.(\w+)/g)].map((x) => x[1]));
  });
  return out;
}

const KIT_SCRIPTS = ['render-tutorial.mjs', 'join-shards.mjs', 'capture-review-page.mjs', 'make-subtitles.mjs', 'voiceover/mix-voiceover.mjs'];
export const cliFlags = (src) => uniq([...src.matchAll(/(?:args\.includes\(|flag\(args, |argv\.includes\()'(--[a-z-]+)'/g)].map((m) => m[1]));

export function buildContract() {
  const common = uniq([...(read('tutorial-scene.js') + read('tutorial-portrait-layout.js') + read('pedagogy-core.js')).matchAll(/\bspec\.(\w+)/g)].map((m) => m[1]));
  const body = {
    generated_by: 'scripts/build-tutorial-contract.mjs',
    sources: Object.fromEntries(['tutorial-project.mjs', 'tutorial-elements.js', 'pedagogy-elements.js', 'pedagogy-core.js', 'tutorial-scene.js', 'tutorial-portrait-layout.js', ...KIT_SCRIPTS]
      .sort().map((f) => [`promo/_tutorial-kit/${f}`, crypto.createHash('sha256').update(read(f)).digest('hex').slice(0, 16)])),
    config_file: 'tutorial.config.json',
    config: CONFIG_SCHEMA.map(([key, type, required, doc]) => ({ key, type, required, doc })),
    element_common_fields: common,
    element_types: elementTypes(read('tutorial-elements.js') + '\n' + read('pedagogy-elements.js')),
    pedagogy_v2: { config_value: 'v2', budgets: loadPedagogy().BUDGETS, script_sentence_fields: ['id', 'text', 'text_en', 'hold_s'], binding: "element.at = 'sent:<id>' (until, delay, dur); predict.hold_s; recap lead_s/step_s" },
    cli: Object.fromEntries(KIT_SCRIPTS.map((f) => [f, cliFlags(read(f))])),
  };
  return { _sha256: contractDigest(body), ...body };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const text = JSON.stringify(buildContract(), null, 2) + '\n';
  if (process.argv.includes('--check')) {
    const have = fs.existsSync(CONTRACT_PATH) ? fs.readFileSync(CONTRACT_PATH, 'utf8') : '';
    if (have !== text) { console.error('contract: skills/es-tutorial-video/contract.json is stale. Run: node scripts/build-tutorial-contract.mjs'); process.exit(1); }
    console.log('contract: ok');
  } else {
    fs.mkdirSync(path.dirname(CONTRACT_PATH), { recursive: true });
    fs.writeFileSync(CONTRACT_PATH, text);
    console.log(`wrote ${path.relative(ROOT, CONTRACT_PATH)}`);
  }
}
