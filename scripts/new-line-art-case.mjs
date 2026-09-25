#!/usr/bin/env node
/**
 * new-line-art-case.mjs — start a line-art-to-motion case in one command.
 *
 * Creates (never overwrites):
 *   research/<case>/case.json          page, proofs, video, selectors, fidelity, Pages modules
 *   research/<case>/<case>-parts.json  part map template (raster sources)
 *   plans/<case>.md                    intake: owner decisions + acceptance checklist
 * and prints the next commands for the chosen source kind. Pipeline doc:
 * docs/line-art-to-motion-pipeline.md.
 *
 * Usage: node scripts/new-line-art-case.mjs <case> [--source raster|flipbook] [--root <repo root>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const name = args[0];
const option = (flag, fallback) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback);
const source = option('--source', 'raster');
const root = path.resolve(option('--root', path.join(path.dirname(fileURLToPath(import.meta.url)), '..')));

if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  console.error('Usage: node scripts/new-line-art-case.mjs <kebab-case-name> [--source raster|flipbook]');
  process.exit(1);
}
if (!['raster', 'flipbook'].includes(source)) {
  console.error(`--source must be raster (a drawing to trace) or flipbook (a vector render with rotor poses), got ${source}`);
  process.exit(1);
}

const dir = path.join(root, 'research', name);
const plan = path.join(root, 'plans', `${name}.md`);
for (const existing of [dir, plan]) {
  if (fs.existsSync(existing)) {
    console.error(`${path.relative(root, existing)} already exists; pick another name or continue that case`);
    process.exit(1);
  }
}

const exportName = `${name.replace(/-/g, '_').toUpperCase()}_GEOMETRY`;
const geometryModule = `src/primitives/${name}-geometry.mjs`;
const caseSpec = {
  label: name,
  page: `promo/${name}.html`,
  proofDir: `promo/${name}-proofs`,
  video: `promo/${name}.mp4`,
  gif: `promo/${name}.gif`,
  selectors: { silhouette: 'TODO: the silhouette path selector', body: 'TODO: the transformed drone/body group selector' },
  fidelity: source === 'raster'
    ? { reference: `research/${name}/reference.png`, module: geometryModule, export: exportName, segments: ['segments'] }
    : { reference: `research/${name}/reference.png`, referenceSvg: `research/${name}/reference.svg`, module: geometryModule, export: exportName, segments: ['static', 'bladePoses.0'], width: 1600, height: 1000, viewBox: 'TODO: the reference SVG viewBox as [x, y, w, h]', strokeWidth: 0.72 },
  publish: { modules: [geometryModule, 'src/runtime/hyperframes-motion-presets.mjs'] },
};

const partsTemplate = {
  description: 'Part map. Coordinates are reference pixels; stroke indices refer to the trace file. See docs/line-art-to-motion-pipeline.md §2.',
  reference: `research/${name}/reference.png`,
  trace: `research/${name}/${name}-centerline-trace.json`,
  silhouette: `research/${name}/${name}-silhouette.json`,
  output: geometryModule,
  exportName,
  strokeWidth: 2.2,
  defaultPart: 'airframe',
  penOrigin: [0, 0],
  penAxisWeight: [1, 1],
  strokeParts: {},
  regions: [],
  extras: {},
};

const intake = `# Plan: ${name}

Status: intake. Pipeline: docs/line-art-to-motion-pipeline.md. Worked case: plans/drone-404-svg-animation.md.

## 0. Intake (owner decisions first)

| Decide | Owner answer |
|---|---|
| Fidelity target and what may change | TODO |
| Deliverables (page, MP4, GIF, Pages) and whether assets may be public | TODO |
| Motion feel (default: wobble slightly, then stable; zeta 0.65-0.8) | TODO |
| Theme / palette | TODO |

## Acceptance (evidence in \`promo/${name}-proofs/\`)
- [ ] Fidelity on ink within 2 px: recall and precision >= 98% (exporter gate)
- [ ] \`npm test\`, \`npx tsc --noEmit\`, \`python3 scripts/anti-flop-gate.py\` exit 0
- [ ] Flight envelope inside the stage (envelope test extended to this case)
- [ ] \`ui gate\`, axe x3, render probe 375/768/1440
- [ ] MP4 contact sheet decoded from the encoded file reviewed
- [ ] Owner visual acceptance
`;

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'case.json'), `${JSON.stringify(caseSpec, null, 2)}\n`);
if (source === 'raster') fs.writeFileSync(path.join(dir, `${name}-parts.json`), `${JSON.stringify(partsTemplate, null, 1)}\n`);
fs.mkdirSync(path.dirname(plan), { recursive: true });
fs.writeFileSync(plan, intake);

const venv = '.cache/line-art-venv/bin/python';
const steps = source === 'raster'
  ? [
    `put the drawing at research/${name}/reference.png`,
    `python3 -m venv .cache/line-art-venv && .cache/line-art-venv/bin/pip install -r scripts/requirements-line-art.txt`,
    `${venv} scripts/trace-line-art-centerline.py research/${name}/reference.png research/${name}/${name}-centerline-trace.json --upscale 3 --threshold 110 --spur 12 --epsilon 0.5`,
    `fill research/${name}/${name}-parts.json, then: node scripts/build-line-art-geometry.mjs research/${name}/${name}-parts.json --preview part-check.svg`,
    `node scripts/build-line-art-geometry.mjs research/${name}/${name}-parts.json   # geometry module (silhouette: pipeline §3)`,
  ]
  : [
    `put the vector render at research/${name}/reference.svg (pose 0) and keep the flipbook SVG outside the repo`,
    `python3 -m venv .cache/line-art-venv && .cache/line-art-venv/bin/pip install -r scripts/requirements-line-art.txt`,
    `${venv} scripts/build-flipbook-rotor-geometry.py <flipbook.svg> research/${name}/${name}-geometry.json --origin <body x,y> --static-svg static.svg`,
    `rasterise static.svg, run scripts/extract-line-art-silhouette.py, then rerun with --silhouette ... --module ${geometryModule} --export ${exportName}`,
  ];
console.log(`created research/${name}/ and plans/${name}.md (${source} source)\nnext:`);
steps.forEach((step, i) => console.log(`  ${i + 1}. ${step}`));
console.log(`  then: renderer + page (templates: src/primitives/DroneSearch404.mjs, promo/drone-404.html), fill the TODOs in case.json,\n        node scripts/render-drone-404-deliverable.mjs --case ${name}, node scripts/sync-line-art-pages.mjs --case ${name} --write`);
