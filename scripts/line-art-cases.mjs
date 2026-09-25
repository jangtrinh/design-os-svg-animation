/**
 * line-art-cases.mjs — load a line-art-to-motion case from research/<case>/case.json.
 *
 * A case is data, not code: its page, proof/video paths, the selectors the hover proofs
 * measure, how fidelity is checked, and which modules the Pages copy needs. Scripts take
 * `--case <folder>` (default drone-404). Create one with scripts/new-line-art-case.mjs.
 *
 * fidelity: { reference: PNG of the source,
 *             referenceSvg?: vector source rendered to `reference` on first use,
 *             module + export: the geometry module,
 *             segments: paths into the export, e.g. ["segments"] or ["static", "bladePoses.0"],
 *             width?/height?/viewBox?/strokeWidth?: render frame (defaults from the export) }
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const pick = (obj, dotted) => dotted.split('.').reduce((v, key) => v?.[key], obj);

export function caseName(argv, fallback = 'drone-404') {
  return argv.includes('--case') ? argv[argv.indexOf('--case') + 1] : fallback;
}

export function loadCase(name, rootDir) {
  const file = path.join(rootDir, 'research', name, 'case.json');
  if (!fs.existsSync(file)) {
    const known = fs.readdirSync(path.join(rootDir, 'research')).filter(d => fs.existsSync(path.join(rootDir, 'research', d, 'case.json')));
    throw new Error(`no case "${name}" (research/${name}/case.json); known: ${known.join(', ')}`);
  }
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const abs = rel => (rel ? path.join(rootDir, rel) : rel);
  const f = spec.fidelity;
  return {
    ...spec,
    name,
    proofDir: abs(spec.proofDir),
    video: abs(spec.video),
    gif: abs(spec.gif),
    reference: abs(f.reference),
    referenceSvg: abs(f.referenceSvg),
    /** Geometry for fidelity(): { width, height, viewBox?, strokeWidth?, segments: [{ d }] }. */
    async fidelityGeometry() {
      const exported = (await import(pathToFileURL(abs(f.module)).href))[f.export];
      const segments = f.segments.flatMap(source => {
        const value = pick(exported, source);
        return typeof value === 'string' ? [{ d: value }] : value;
      });
      return {
        width: f.width ?? exported.width,
        height: f.height ?? exported.height,
        viewBox: f.viewBox,
        strokeWidth: f.strokeWidth ?? exported.strokeWidth,
        segments,
      };
    },
  };
}
