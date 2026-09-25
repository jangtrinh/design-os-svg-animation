/**
 * flight-envelope.mjs — shared test helper: fly a case's outline through the shared timeline
 * and assert it never leaves the stage viewBox (a clipping bug was found twice by screenshots).
 */

import assert from 'node:assert/strict';
import { DRONE_TIMING, sampleDroneState } from '../../src/primitives/drone-404-motion.mjs';

/** Extreme points of the art in 32 directions: a tight hull that is cheap to fly. */
export function outline(paths) {
  const pts = [];
  for (const d of paths) {
    const n = d.match(/-?\d+\.?\d*/g).map(Number);
    for (let i = 0; i < n.length; i += 2) pts.push([n[i], n[i + 1]]);
  }
  return Array.from({ length: 32 }, (_, k) => {
    const [ux, uy] = [Math.cos((k * Math.PI) / 16), Math.sin((k * Math.PI) / 16)];
    return pts.reduce((best, p) => (p[0] * ux + p[1] * uy > best[0] * ux + best[1] * uy ? p : best));
  });
}

/** Every outline point, flown through the whole timeline (intro + one loop), stays inside the stage. */
export function assertEnvelope({ extent, pivot, viewBox, toUnits = d => d, label }) {
  const [vx, vy, vw, vh] = viewBox;
  for (let t = 0; t < DRONE_TIMING.seamlessFrom + DRONE_TIMING.loopPeriod; t += 0.02) {
    const s = sampleDroneState(t);
    const { x, y } = toUnits(s.drone);
    const r = (s.drone.rotate * Math.PI) / 180;
    for (const [px, py] of extent) {
      const dx = (px - pivot[0]) * s.drone.scale;
      const dy = (py - pivot[1]) * s.drone.scale;
      const X = pivot[0] + x + dx * Math.cos(r) - dy * Math.sin(r);
      const Y = pivot[1] + y + dx * Math.sin(r) + dy * Math.cos(r);
      assert.ok(X >= vx && X <= vx + vw && Y >= vy && Y <= vy + vh, `${label} leaves the stage at t=${t.toFixed(2)}: (${X.toFixed(0)}, ${Y.toFixed(0)})`);
    }
  }
}
