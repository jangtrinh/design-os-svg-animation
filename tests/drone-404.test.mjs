import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateMotionIR } from '../src/ir/validate-motion-ir.mjs';
import { DRONE_LINE_ART } from '../src/primitives/drone-404-line-art-geometry.mjs';
import { DRONE_TIMING, sampleDroneState } from '../src/primitives/drone-404-motion.mjs';
import { DRONE_SEGMENT_LENGTHS, renderDroneSVG } from '../src/primitives/DroneSearch404.mjs';

const sample = (t, opts = {}) => sampleDroneState(t, { segmentLengths: DRONE_SEGMENT_LENGTHS, ...opts });
const close = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg}: ${a} vs ${b}`);

test('drone Motion IR fixture validates against the 0.2.0 schema', () => {
  const ir = JSON.parse(readFileSync(new URL('../fixtures/drone-search-404.motion.json', import.meta.url)));
  const result = validateMotionIR(ir);
  assert.equal(result.valid, true, result.errors?.join('\n'));
});

test('every traced segment belongs to a known part and every rotor has blades', () => {
  const rotorParts = Object.keys(DRONE_LINE_ART.rotors).map(id => `blades:${id}`);
  const known = new Set(['airframe', 'lens-frame', 'lens-eye', ...rotorParts]);
  for (const seg of DRONE_LINE_ART.segments) assert.ok(known.has(seg.part), `unknown part ${seg.part}`);
  for (const part of rotorParts) assert.ok(DRONE_LINE_ART.segments.some(s => s.part === part), `${part} has no blades`);
});

test('the pen finishes drawing before the rotors reach full speed', () => {
  const state = sample(DRONE_TIMING.spinUpEnd);
  assert.ok(state.draw.every(p => p === 1), 'some segments are still being drawn');
  assert.ok(sample(0).draw.every(p => p === 0), 'nothing may be drawn at t=0');
});

test('the search loop is seamless from seamlessFrom onward', () => {
  for (const offset of [0, 1.37, 3.3, 5.02, 7.05, 9.99]) {
    const a = sample(DRONE_TIMING.seamlessFrom + offset);
    const b = sample(DRONE_TIMING.seamlessFrom + offset + DRONE_TIMING.loopPeriod);
    close(a.drone.x, b.drone.x, 'x');
    close(a.drone.y, b.drone.y, 'y');
    close(a.drone.rotate, b.drone.rotate, 'bank');
    close(a.drone.scale, b.drone.scale, 'depth');
    close(a.gimbal.look, b.gimbal.look, 'gimbal look');
    close(a.gimbal.level, b.gimbal.level, 'gimbal level');
    close(a.numerals.x, b.numerals.x, 'parallax');
    close(a.beam.opacity, b.beam.opacity, 'beam');
    a.rotors.forEach((angle, i) => close(Math.cos(angle), Math.cos(b.rotors[i]), `rotor ${i}`));
  }
});

test('timeline is deterministic and continuous across the spin-up boundary', () => {
  assert.deepEqual(sample(6.25), sample(6.25));
  const before = sample(DRONE_TIMING.spinUpEnd - 1e-4).rotors[0];
  const after = sample(DRONE_TIMING.spinUpEnd + 1e-4).rotors[0];
  assert.ok(Math.abs(after - before) < 0.01, 'rotor angle jumps at spin-up end');
});

test('reduced motion is a fully drawn, still pose', () => {
  const state = sample(3, { reducedMotion: true });
  assert.ok(state.draw.every(p => p === 1));
  assert.equal(state.spin, 0);
  assert.equal(state.beam.opacity, 0);
});

test('rendered SVG is accessible and emits one drawable path per segment', () => {
  const svg = renderDroneSVG();
  assert.match(svg, /role="img"/);
  assert.match(svg, /<title id="drone-404-title">Error 404/);
  assert.equal(svg.match(/data-order="/g).length, DRONE_LINE_ART.segments.length);
});

const L = DRONE_TIMING.seamlessFrom; // steady cycle; mission loop time u = t - L

test('the drone tilts into a leg before it accelerates, then flares to brake', () => {
  // Leg 1 (HOME -> left) spans loop time 1.2 - 2.9 s.
  const early = sample(L + 1.35);
  const braking = sample(L + 2.35);
  assert.ok(early.drone.rotate < -2, `expected lead bank left, got ${early.drone.rotate}`);
  assert.ok(Math.abs(early.drone.x - sample(L + 1.2).drone.x) < 15, 'tilt should come before real displacement');
  assert.ok(braking.drone.rotate > 2, `expected flare, got ${braking.drone.rotate}`);
  for (let t = L; t < L + 10; t += 0.05) assert.ok(Math.abs(sample(t).drone.rotate) < 20, 'bank stays plausible');
});

test('arrival overshoots the waypoint and settles back', () => {
  let furthest = 0;
  for (let t = L + 2.9; t < L + 4.4; t += 0.02) furthest = Math.min(furthest, sample(t).drone.x);
  assert.ok(furthest < -405, `expected overshoot past -400, got ${furthest}`);
  assert.ok(furthest > -460, `overshoot too large: ${furthest}`);
});

test('hovering is never frozen: the airframe keeps making small corrections', () => {
  const banks = [];
  for (let t = L + 3.4; t < L + 4.4; t += 0.02) banks.push(sample(t).drone.rotate);
  const spread = Math.max(...banks) - Math.min(...banks);
  assert.ok(spread > 0.5 && spread < 8, `hover wobble ${spread.toFixed(2)} deg`);
});

test('the gimbal counters the bank with a small lag', () => {
  let err = 0;
  let bank = 0;
  for (let t = L; t < L + 10; t += 0.02) {
    const s = sample(t);
    err += Math.abs(s.gimbal.level + s.drone.rotate);
    bank += Math.abs(s.drone.rotate);
  }
  assert.ok(err < 0.5 * bank, 'gimbal should cancel most of the bank');
  assert.ok(err > 0.02 * bank, 'a perfectly rigid gimbal reads as fake');
});

test('sampling stays cheap enough for every display frame', () => {
  sample(L); // builds the cached cycle
  const start = performance.now();
  for (let i = 0; i < 600; i += 1) sample(L + i / 60);
  assert.ok((performance.now() - start) / 600 < 0.5, 'more than 0.5 ms per frame');
});

test('lift-off overshoots before settling (damped, not linear)', () => {
  const ys = [];
  for (let t = DRONE_TIMING.liftStart; t < DRONE_TIMING.loopStart; t += 0.02) ys.push(sample(t).drone.y);
  const settled = sample(0, { reducedMotion: true }).drone.y; // hover height without bob
  assert.ok(Math.min(...ys) < settled - 1, 'no overshoot above hover height');
});

test('the airframe silhouette exists so the drone occludes the numerals', () => {
  assert.match(DRONE_LINE_ART.silhouette, /^M[\d.,-]+ L/);
  assert.match(renderDroneSVG(), /class="d404-silhouette"/);
});
