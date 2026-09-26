/**
 * drone-404-motion.mjs — deterministic timeline for the single-line 404 drone.
 *
 * sampleDroneState(t) is a pure function of time (seconds). The live page, the
 * virtual clock (window.__seekToTime), the Motion IR fixture and the video exporter
 * all read the same function, so every frame is reproducible.
 *
 * Story:
 *   0.15 – 2.9 s  one pen line draws the drone (fuselage outward to rotors)
 *   2.2 – 3.4 s   the bold 404 settles in behind it
 *   2.6 – 3.6 s   rotors spin up; 3.1 s lift-off with a damped settle
 *   4.0 s ->      search mission, period 10 s: hover, fly left and away, scan,
 *                 swoop right and closer, scan, get knocked by a gust, return.
 *                 A simulated flight controller (drone-404-flight-controller.mjs) flies
 *                 it: tilt leads motion, arrivals settle with one small counter-swing,
 *                 hover wobbles in turbulence.
 */

import { sampleHyperFrameProgress, sampleHyperFrameCarry } from '../runtime/hyperframes-motion-presets.mjs';
import { samplePath, dampedStep } from './drone-404-flight-physics.mjs';
import { createFlightController } from './drone-404-flight-controller.mjs';

export const DRONE_TIMING = Object.freeze({
  drawStart: 0.15,
  drawSpread: 1.55,
  numeralsIn: [2.2, 3.4],
  spinUpStart: 2.6,
  spinUpEnd: 3.6,
  liftStart: 3.1,
  loopStart: 4.0,
  loopPeriod: 10,
  /** First instant the timeline is purely periodic: [t, t + loopPeriod) loops seamlessly. */
  seamlessFrom: 14.0, // loopStart + one period: the controller has settled into its steady cycle
});

const TAU = Math.PI * 2;
const ROTOR_REV_PER_SECOND = 2.5; // 25 whole turns per 10 s loop keeps the loop seamless
const LIFT_HEIGHT = 40;
const GRAVITY = 8000; // px/s^2 in reference pixels; sets how hard the drone banks
const DEPTH_DROP = 300; // px the drone sinks on screen per unit of approach (ground perspective)
export const FLOOR_Y = 1170; // where the scan beam lands
export const BODY_PIVOT = [1010, 520];

// Mission legs: [start, end, from [x, y, depth], to [x, y, depth]] in loop seconds.
const HOME = [0, 0, 1];
const LEFT_FAR = [-400, 12, 0.9];
const RIGHT_NEAR = [330, -18, 1.08];
const LEGS = [
  [1.2, 2.9, HOME, LEFT_FAR],
  [4.5, 6.3, LEFT_FAR, RIGHT_NEAR],
  [7.8, 9.6, RIGHT_NEAR, HOME],
];
const SCANS = [[2.9, 4.5], [6.3, 7.8]]; // hovering holds where the beam sweeps
const GUST = { at: 7.0, width: 0.35, accel: 900 };

// Hover is never still. Station-keeping drift (command) and air turbulence (force) are
// sums of whole harmonics of the loop, so they repeat exactly every period.
// [harmonic, amplitude, phase]
const DRIFT = [[2, 5, 0], [5, 2, 0]];
const TURBULENCE = [[4, 50, 0.7], [7, 40, 2.1], [11, 30, 4.0]];
const HEAVE = [[5, 3, 0], [9, 1.5, 1]];

const smooth = (t, a, b) => sampleHyperFrameProgress(t, a, b);
const harmonics = (terms, u, P) => terms.reduce((acc, [k, amp, phase]) => {
  const w = (TAU * k) / P;
  const arg = w * u + phase;
  return { p: acc.p + amp * Math.sin(arg), v: acc.v + amp * w * Math.cos(arg), a: acc.a - amp * w * w * Math.sin(arg) };
}, { p: 0, v: 0, a: 0 });
const pulse = (tau, width) => (tau > 0 && tau < width ? Math.sin((Math.PI * tau) / width) ** 2 : 0);

/** Rotor angle: integral of a linearly ramped angular velocity, so spin-up has no jump. */
export function rotorAngle(t, phase = 0) {
  const { spinUpStart: a, spinUpEnd: b } = DRONE_TIMING;
  const w = TAU * ROTOR_REV_PER_SECOND;
  if (t <= a) return phase;
  if (t <= b) return phase + (w * (t - a) ** 2) / (2 * (b - a));
  return phase + (w * (b - a)) / 2 + w * (t - b);
}

/** Lift-off: damped step to hover height; the last of the ring is faded out before the loop starts. */
function liftOffset(t) {
  const { liftStart, loopStart } = DRONE_TIMING;
  const step = dampedStep(t - liftStart, 0.8, 0.45);
  const settle = smooth(t, loopStart + 1.2, loopStart + 2.2);
  return -LIFT_HEIGHT * (step + (1 - step) * settle);
}

/**
 * What the pilot asks for at loop time u in [0, P): the controller has to make it happen.
 * `turbulence: false` exists so tests can prove the hover wobble comes from the air, not from ringing.
 */
export function missionCommand(u, { turbulence = true } = {}) {
  const P = DRONE_TIMING.loopPeriod;
  const path = samplePath(u, P, LEGS, v => v[0]);
  const drift = harmonics(DRIFT, u, P);
  const scanIndex = SCANS.findIndex(([a, b]) => u >= a && u <= b);
  let look = Math.max(-1, Math.min(1, path.v / 520)) * 0.55; // travelling: look ahead
  if (scanIndex > -1) {
    const [a, b] = SCANS[scanIndex];
    look = (scanIndex === 0 ? 1 : -1) * 0.95 * Math.sin((TAU * (u - a)) / (b - a)); // sweep out and back
  }
  return {
    x: path.p + drift.p,
    v: path.v + drift.v,
    a: path.a + drift.a,
    y: samplePath(u, P, LEGS, v => v[1]).p + harmonics(HEAVE, u, P).p,
    depth: samplePath(u, P, LEGS, v => v[2]).p,
    look,
    gust: GUST.accel * pulse(u - GUST.at, GUST.width) + (turbulence ? harmonics(TURBULENCE, u, P).p : 0),
  };
}

export const FLIGHT_CONFIG = Object.freeze({ period: DRONE_TIMING.loopPeriod, gravity: GRAVITY });
export const MISSION = Object.freeze({ legs: LEGS, scans: SCANS, gustAt: GUST.at });
const flight = createFlightController({ ...FLIGHT_CONFIG, command: missionCommand });

/**
 * @param {number} t seconds
 * @param {{segmentLengths?: number[], reducedMotion?: boolean}} opts
 */
export function sampleDroneState(t, { segmentLengths = [], reducedMotion = false } = {}) {
  if (reducedMotion) {
    return {
      draw: segmentLengths.map(() => 1),
      rotors: [0, 0, 0, 0],
      spin: 0,
      drone: { x: 0, y: -LIFT_HEIGHT, rotate: 0, scale: 1 },
      gimbal: { look: 0, level: 0 },
      beam: { opacity: 0, look: 0 },
      numerals: { opacity: 1, x: 0, scale: 1 },
    };
  }
  const T = DRONE_TIMING;
  const maxLength = Math.max(1, ...segmentLengths);
  const n = segmentLengths.length;
  const draw = segmentLengths.map((length, order) => {
    const start = T.drawStart + (n > 1 ? order / (n - 1) : 0) * T.drawSpread;
    return smooth(t, start, start + 0.4 + 0.8 * Math.sqrt(length / maxLength));
  });

  // Before the mission the controller sits at rest at HOME; it takes over at loopStart.
  const u = Math.max(0, t - T.loopStart);
  const f = flight(u);
  const w = u % T.loopPeriod;
  const beam = SCANS.reduce((sum, [a, b]) => sum + sampleHyperFrameCarry(w, a, a + 0.4, b - 0.4, b), 0);
  const numerals = smooth(t, ...T.numeralsIn);

  return {
    draw,
    rotors: [0, 1.3, 2.4, 0.7].map(phase => rotorAngle(t, phase)),
    spin: smooth(t, T.spinUpStart, T.spinUpEnd),
    drone: { x: f.x, y: liftOffset(t) + f.y + (f.depth - 1) * DEPTH_DROP, rotate: f.bank, scale: f.depth },
    gimbal: { look: f.look, level: f.level },
    beam: { opacity: beam, look: f.look },
    numerals: { opacity: numerals, x: -0.06 * f.x, scale: 1.06 - 0.06 * numerals },
  };
}
