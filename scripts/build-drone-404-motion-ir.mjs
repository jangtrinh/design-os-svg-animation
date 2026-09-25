#!/usr/bin/env node
/**
 * build-drone-404-motion-ir.mjs — writes fixtures/drone-search-404.motion.json.
 *
 * The Motion IR is sampled from the same pure timeline the page renders
 * (src/primitives/drone-404-motion.mjs), so the IR can never drift from the page.
 * Node contours are the moving parts' bounds (rotor blur discs, lens, airframe box);
 * the traced line art itself lives in drone-404-line-art-geometry.mjs.
 *
 * Usage: node scripts/build-drone-404-motion-ir.mjs && node scripts/validate-ir.mjs fixtures/drone-search-404.motion.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRONE_LINE_ART } from '../src/primitives/drone-404-line-art-geometry.mjs';
import { DRONE_TIMING, BODY_PIVOT, sampleDroneState } from '../src/primitives/drone-404-motion.mjs';
import { DRONE_VIEWBOX, DRONE_SEGMENT_LENGTHS } from '../src/primitives/DroneSearch404.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_PATH = path.join(ROOT_DIR, 'fixtures/drone-search-404.motion.json');
const STEP_MS = 100;
const DURATION_MS = Math.round((DRONE_TIMING.seamlessFrom + DRONE_TIMING.loopPeriod) * 1000);
const INK = [0.067, 0.067, 0.067, 0]; // stroke-only art: nodes carry no fill

const r2 = v => Math.round(v * 100) / 100;
const K = 0.5523; // cubic handle ratio for a quarter ellipse

const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(p => ({ p, in: [0, 0], out: [0, 0] }));
const ellipse = (cx, cy, rx, ry) => [
  { p: [cx + rx, cy], in: [0, -ry * K], out: [0, ry * K] },
  { p: [cx, cy + ry], in: [rx * K, 0], out: [-rx * K, 0] },
  { p: [cx - rx, cy], in: [0, ry * K], out: [0, -ry * K] },
  { p: [cx, cy - ry], in: [-rx * K, 0], out: [rx * K, 0] },
].map(v => ({ p: v.p.map(r2), in: v.in.map(r2), out: v.out.map(r2) }));

const node = (id, parentId, vertices, pivot) => ({
  id,
  parentId,
  path: { fillRule: 'nonzero', contours: [{ id: `${id}-bounds`, closed: true, vertices }] },
  transform: { translate: [0, 0], scale: [1, 1], rotate: 0, pivot },
  style: { fill: INK, opacity: 1 },
});

function sampledTrack(id, targetId, property, valueAt) {
  const keyframes = [];
  for (let ms = 0; ms <= DURATION_MS; ms += STEP_MS) {
    keyframes.push({ timeMs: ms, value: valueAt(sampleDroneState(ms / 1000, { segmentLengths: DRONE_SEGMENT_LENGTHS })), ease: { kind: 'linear' } });
  }
  return { id, targetId, property, keyframes };
}

const rotorIds = Object.keys(DRONE_LINE_ART.rotors);
const nodes = [
  node('drone-root', null, rect(40, 180, 1905, 870), BODY_PIVOT),
  node('lens-eye', 'drone-root', ellipse(1033, 739, 26, 26), [1033, 739]),
  node('scan-beam', null, rect(560, 760, 1500, 1204), [1033, 760]),
  node('numerals-404', null, rect(260, 240, 1760, 900), BODY_PIVOT),
  ...rotorIds.map(id => {
    const { cx, cy, rx, ry } = DRONE_LINE_ART.rotors[id];
    return node(id, 'drone-root', ellipse(cx, cy, rx, ry), [cx, cy]);
  }),
];

const tracks = [
  sampledTrack('track-pen-draw', 'drone-root', 'trim', s => r2(s.draw.reduce((a, b) => a + b, 0) / s.draw.length)),
  sampledTrack('track-drone-flight', 'drone-root', 'translate', s => [r2(s.drone.x), r2(s.drone.y)]),
  sampledTrack('track-drone-bank', 'drone-root', 'rotate', s => r2(s.drone.rotate)),
  sampledTrack('track-drone-depth', 'drone-root', 'scale', s => [r2(s.drone.scale * 100) / 100, r2(s.drone.scale * 100) / 100]),
  sampledTrack('track-numerals-reveal', 'numerals-404', 'opacity', s => r2(s.numerals.opacity)),
  sampledTrack('track-gimbal-look', 'lens-eye', 'translate', s => [r2(s.gimbal.look * 13), r2(Math.abs(s.gimbal.look) * 1.5)]),
  sampledTrack('track-gimbal-level', 'lens-eye', 'rotate', s => r2(s.gimbal.level)),
  sampledTrack('track-scan-beam', 'scan-beam', 'opacity', s => r2(s.beam.opacity)),
  ...rotorIds.map((id, i) => sampledTrack(`track-${id}-spin`, id, 'scale', s => {
    const angle = s.rotors[i] * DRONE_LINE_ART.rotors[id].direction;
    return [r2(1 + (Math.cos(angle) - 1) * s.spin), r2(1 - 0.58 * s.spin)];
  })),
];

const ir = {
  version: '0.2.0',
  scene: { viewBox: DRONE_VIEWBOX, nodes },
  timeline: { durationMs: DURATION_MS, iterations: 1, direction: 'normal', fill: 'forwards' },
  tracks,
  accessibility: {
    label: 'Error 404: a single-line drone draws itself in front of a bold 404, lifts off and searches for the missing page',
    reducedMotion: { mode: 'static', atMs: Math.round(DRONE_TIMING.seamlessFrom * 1000) },
  },
  viewport: { aspect: '16:9', safeZone: { top: 24, bottom: 24, left: 32, right: 32 } },
  camera: { zoom: 1, pan: [0, 0] },
  parameterBindings: { title: 'Page not found' },
  hotspots: [{ id: 'drone-lens', targetElement: 'lens-eye', center: [1033, 739], radius: 40 }],
};

fs.writeFileSync(OUT_PATH, `${JSON.stringify(ir, null, 1)}\n`);
console.log(`wrote ${path.relative(ROOT_DIR, OUT_PATH)}: ${nodes.length} nodes, ${tracks.length} tracks, ${DURATION_MS} ms`);
