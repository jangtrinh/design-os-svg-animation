import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateMotionIR } from '../src/ir/validate-motion-ir.mjs';
import { DRONE_LINE_ART } from '../src/primitives/drone-404-line-art-geometry.mjs';
import { DRONE_TIMING, sampleDroneState, missionCommand, FLIGHT_CONFIG, MISSION } from '../src/primitives/drone-404-motion.mjs';
import { createFlightController } from '../src/primitives/drone-404-flight-controller.mjs';
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

const FIELDS = s => [s.drone.x, s.drone.y, s.drone.rotate, s.drone.scale, s.gimbal.look, s.gimbal.level, s.beam.opacity, ...s.rotors.map(Math.cos)];
const sameState = (a, b, tol, msg) => FIELDS(a).forEach((v, i) => assert.ok(Math.abs(v - FIELDS(b)[i]) < tol, `${msg} field ${i}: ${v} vs ${FIELDS(b)[i]}`));

test('the loop closes across its wrap and the first-loop boundary (not the same table row twice)', () => {
  const { seamlessFrom: L0, loopPeriod: P } = DRONE_TIMING;
  sameState(sample(L0 + P - 1e-9), sample(L0), 1e-6, 'steady cycle end vs start');
  sameState(sample(L0 - 1 / 240), sample(L0), 0.1, 'transient -> steady boundary');
  sameState(sample(L0 + P / 3), sample(L0 + 2 * P + P / 3), 1e-9, 'two periods apart');
});

test('two independently built controllers produce identical flights (cache and simulation are deterministic)', () => {
  const a = createFlightController({ ...FLIGHT_CONFIG, command: missionCommand });
  const b = createFlightController({ ...FLIGHT_CONFIG, command: missionCommand });
  for (const u of [0.5, 3.3, 9.99, 12.5, 27.1]) assert.deepEqual(a(u), b(u));
});

test('rotor angle is continuous across the spin-up boundary', () => {
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

test('the drone tilts into a leg before it moves, and bank stays in the accepted range', () => {
  // Leg 1 (HOME -> left) spans loop time 1.2 - 2.9 s.
  const early = sample(L + 1.35);
  assert.ok(early.drone.rotate < -2, `expected lead bank left, got ${early.drone.rotate}`);
  assert.ok(Math.abs(early.drone.x - sample(L + 1.2).drone.x) < 15, 'tilt should come before real displacement');
  assert.ok(sample(L + 2.35).drone.rotate > 2, 'expected a flare to brake');
  let max = 0;
  for (let t = L; t < L + 10; t += 0.005) max = Math.max(max, Math.abs(sample(t).drone.rotate));
  assert.ok(max > 10 && max < 14, `owner-accepted max bank is about 12 deg, got ${max.toFixed(2)}`);
});

test('owner intent: after each leg, one small counter-swing, then stable within 0.35 s', () => {
  for (const [, end] of MISSION.legs) {
    let peak = 0;
    for (let u = end; u <= end + 0.3; u += 0.005) peak = Math.max(peak, Math.abs(sample(L + u).drone.rotate));
    assert.ok(peak > 1.5 && peak < 5, `leg ending ${end}: counter-swing ${peak.toFixed(2)} deg`);
    const stop = end < MISSION.gustAt && end + 1 > MISSION.gustAt ? MISSION.gustAt : end + 1;
    for (let u = end + 0.35; u <= stop; u += 0.005) {
      const bank = Math.abs(sample(L + u).drone.rotate);
      assert.ok(bank < 1.5, `leg ending ${end}: still ${bank.toFixed(2)} deg at +${(u - end).toFixed(2)} s`);
    }
  }
});

test('hover wobble comes from the air: it collapses when turbulence is switched off', () => {
  const spread = fly => {
    const banks = [];
    for (let u = 0.2; u <= 1.1; u += 0.01) banks.push(fly(DRONE_TIMING.loopPeriod + u).bank); // steady cycle, hovering at HOME
    return Math.max(...banks) - Math.min(...banks);
  };
  const withAir = spread(createFlightController({ ...FLIGHT_CONFIG, command: missionCommand }));
  const stillAir = spread(createFlightController({ ...FLIGHT_CONFIG, command: u => missionCommand(u, { turbulence: false }) }));
  assert.ok(withAir > 0.4 && withAir < 2, `hover wobble ${withAir.toFixed(2)} deg (owner: slight)`);
  assert.ok(stillAir < 0.3, `without turbulence the hover should be nearly still, got ${stillAir.toFixed(2)} deg`);
});

test('the gimbal counters the bank a few tens of milliseconds late', () => {
  const series = [];
  for (let u = 0; u < DRONE_TIMING.loopPeriod; u += 1 / 240) {
    const s = sample(L + u);
    series.push([s.drone.rotate, -s.gimbal.level]);
  }
  let best = [0, -Infinity];
  for (let lag = 0; lag <= 48; lag += 1) {
    let c = 0;
    for (let i = lag; i < series.length; i += 1) c += series[i - lag][0] * series[i][1];
    if (c > best[1]) best = [lag, c];
  }
  const ms = (best[0] / 240) * 1000;
  assert.ok(ms > 10 && ms < 120, `gimbal lag ${ms.toFixed(1)} ms`);
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
