/**
 * startup-error-404-motion.mjs — the timeline of the "startup errors" 404 illustration.
 *
 * Pure function of time (no state), so the page, the exporter and the tests all sample the
 * same pose. Units are the source SVG's (3000 x 3000 viewBox) and seconds.
 *
 *  - intro: the man rises in, the 404 surfaces behind him, then the three bubbles pop out of
 *    their tails one after another (damped step: one overshoot, then still);
 *  - loop (period 8 s): he types calmly; the X bubble buzzes like a failing build (its X
 *    punches), he flinches, lifts his hand off the keys, glances up at it and blushes; the
 *    "!" hops and its bubble pulses; then he leans in and types frantically, stops, stares
 *    and double-blinks; calm typing again; a second, shorter round. "?" floats throughout.
 *    Typing lives in startup-error-404-typing.mjs. Every periodic term divides the period and every impulse has decayed before the
 *    next one, so [seamlessFrom, seamlessFrom + loopPeriod) repeats without a seam.
 */

import { dampedStep } from './drone-404-flight-physics.mjs';
import { sampleTyping, LOOP_TYPING, INTRO_TYPING } from './startup-error-404-typing.mjs';

const TAU = Math.PI * 2;

export const STARTUP_ERROR_TIMING = Object.freeze({
  figureIn: 0.1,
  numeralsIn: 0.5,
  pops: { 'bubble-question': 0.9, 'bubble-error': 1.35, 'bubble-alert': 1.7 },
  loopStart: 2.4,
  loopPeriod: 8,
  /** The intro's damped transients are below 1e-6 here; the loop is seamless from this point. */
  seamlessFrom: 4.0,
});

/**
 * Pivots in source units: tail tips for bubbles, the neck for the head, between the eyes,
 * the elbow side of the forearm, the knee under the laptop, the knuckle for the middle finger, glyph centres.
 */
export const STARTUP_ERROR_PIVOTS = Object.freeze({
  head: [1300, 1262],
  eyes: [1415, 1005],
  'cheek-left': [1306, 1049],
  'cheek-right': [1491, 1067],
  arm: [1110, 1640], // between the two ends of the forearm outline: both joins move ~equally
  laptop: [2080, 1760], // where the laptop rests on the knee
  finger: [1716, 1396],
  'bubble-error-glyph': [2014, 741],
  'bubble-alert-glyph': [2352, 1020],
  'bubble-question': [714, 1133],
  'bubble-error': [2027, 1135],
  'bubble-alert': [2255, 1232],
});

const LOOP = Object.freeze({
  errorBuzz: [2.2, 6.2], // X bubble shakes (u, seconds into the loop)
  alertHop: [2.42, 6.42], // the "!" jumps...
  alertPulse: [2.5, 6.5], // ...and its bubble answers
  flinch: [2.3, 6.3], // the man jerks back at each error
  glance: [[2.25, 2.75], [6.25, 6.7]], // eyes up at the X while the hand is frozen
  blinks: [0.9, 4.6, 4.85, 7.2], // the double blink is the blank stare after the burst
});
const INTRO = Object.freeze({ glance: [1.4, 1.8] });
const FRANTIC = typing => typing.filter(w => w[3] === 1).map(([a, b]) => [a, b]);

const clamp01 = v => Math.min(1, Math.max(0, v));
const smooth = v => { const x = clamp01(v); return x * x * (3 - 2 * x); };
/** 0..1..0 over a window, eased at both ends. */
const hold = (x, [a, b], ease = 0.15) => smooth((x - a) / ease) * smooth((b - x) / ease);
/** Blush: rises and fades over `length` seconds, exactly 0 outside (no tail to break the loop). */
const bump = (tau, length) => (tau <= 0 || tau >= length ? 0 : Math.sin((Math.PI * tau) / length) ** 2);
/** Rise-and-fade pulse peaking at tau = peak (seconds), 1 at the peak. */
const alpha = (tau, peak) => (tau <= 0 ? 0 : (tau / peak) * Math.exp(1 - tau / peak));

/** Damped impulse response: starts at 0, swings, decays. Peak is about 1 for low zeta. */
function impulse(tau, frequencyHz, zeta) {
  if (tau <= 0) return 0;
  const wn = TAU * frequencyHz;
  return Math.exp(-zeta * wn * tau) * Math.sin(wn * Math.sqrt(1 - zeta * zeta) * tau);
}

/** Time since the latest occurrence of a loop event at u0 (period-wrapped). */
const since = (u, u0, period) => (((u - u0) % period) + period) % period;
const eventSum = (u, events, period, response) => events.reduce((sum, u0) => sum + response(since(u, u0, period)), 0);
const windowMax = (x, windows) => windows.reduce((m, w) => Math.max(m, hold(x, w)), 0);

function blink(u, period) {
  const DURATION = 0.18;
  const closed = LOOP.blinks.reduce((c, u0) => {
    const tau = since(u, u0, period);
    return Math.max(c, tau < DURATION ? Math.sin((Math.PI * tau) / DURATION) : 0);
  }, 0);
  return 1 - 0.9 * closed;
}

const REST = () => ({ tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, opacity: 1 });
const PARTS = ['figure', 'numerals', 'head', 'eyes', 'cheek-left', 'cheek-right', 'arm', 'finger', 'laptop',
  'bubble-question', 'bubble-error', 'bubble-alert', 'bubble-error-glyph', 'bubble-alert-glyph'];

/**
 * Pose at time t: { [part]: { tx, ty, rot (deg), sx, sy, opacity } } about each part's pivot
 * (figure and numerals: origin). Eyes and cheeks are relative to the head, the finger to
 * the arm, glyphs to their bubble; the renderer composes them.
 * reducedMotion: the finished still pose (everything in place, nothing moving).
 */
export function sampleStartupErrorState(t, { reducedMotion = false } = {}) {
  const state = Object.fromEntries(PARTS.map(p => [p, REST()]));
  if (reducedMotion) return state;
  const T = STARTUP_ERROR_TIMING;
  const P = T.loopPeriod;
  const looping = t >= T.loopStart;
  const u = looping ? since(t - T.loopStart, 0, P) : null; // wrapped loop time

  // Intro -----------------------------------------------------------------------------
  state.figure.opacity = smooth((t - T.figureIn) / 0.45);
  state.figure.ty = 70 * (1 - dampedStep(t - T.figureIn, 1.4, 0.72));
  state.numerals.opacity = smooth((t - T.numeralsIn) / 0.8);
  state.numerals.ty = 60 * (1 - dampedStep(t - T.numeralsIn, 1.1, 0.9));
  for (const [bubble, t0] of Object.entries(T.pops)) {
    const s = dampedStep(t - t0, 2.4, 0.5); // pops out of its tail with one overshoot
    state[bubble].sx = state[bubble].sy = s;
    state[bubble].opacity = clamp01((t - t0) / 0.08);
  }
  const firstError = T.pops['bubble-error'];
  state.head.rot = -3.5 * impulse(t - (firstError + 0.05), 2.5, 0.5); // startled by the first error
  let glance = hold(t, INTRO.glance);
  let lean = windowMax(t, FRANTIC(INTRO_TYPING));
  let blush = bump(t - (firstError + 0.05), 1.4);

  // Typing (intro and loop windows) ------------------------------------------------------
  const typing = sampleTyping(t, u, (x, x0) => since(x, x0, P));
  state.arm.rot = typing.arm;
  state.finger.rot = typing.finger.rot;
  state.finger.ty = typing.finger.ty;
  state.laptop.ty = typing.laptop.ty;
  state.laptop.rot = typing.laptop.rot;

  // Loop ------------------------------------------------------------------------------
  if (looping) {
    const ramp = smooth((t - T.loopStart) / 1.2); // idle terms fade in instead of starting at full speed

    const question = state['bubble-question'];
    question.ty += ramp * 12 * Math.sin((TAU * u) / 4);
    question.rot += ramp * 2.5 * Math.sin((TAU * u) / 8 + 0.6);

    const error = state['bubble-error'];
    error.ty += ramp * 7 * Math.sin((TAU * u) / 8 + 2.1);
    error.rot += 4 * eventSum(u, LOOP.errorBuzz, P, tau => impulse(tau, 5, 0.3));
    const errorKick = eventSum(u, LOOP.errorBuzz, P, tau => impulse(tau, 3, 0.45));
    error.sx *= 1 + 0.05 * errorKick;
    error.sy *= 1 + 0.05 * errorKick;
    const punch = 1 + 0.16 * eventSum(u, LOOP.errorBuzz, P, tau => alpha(tau, 0.06));
    state['bubble-error-glyph'].sx = state['bubble-error-glyph'].sy = punch;

    const alert = state['bubble-alert'];
    alert.ty += ramp * 7 * Math.sin((TAU * u) / 8 + 4.2);
    const pulse = eventSum(u, LOOP.alertPulse, P, tau => impulse(tau, 3, 0.35));
    alert.sx *= 1 + 0.08 * pulse;
    alert.sy *= 1 + 0.08 * pulse;
    const hop = eventSum(u, LOOP.alertHop, P, tau => alpha(tau, 0.1));
    state['bubble-alert-glyph'].ty = -26 * hop;
    state['bubble-alert-glyph'].sy = 1 + 0.08 * hop; // stretches on the way up

    state.head.rot += ramp * -2.5 * Math.sin((TAU * u) / 8)
      - 4 * eventSum(u, LOOP.flinch, P, tau => impulse(tau, 2.5, 0.5));
    state.eyes.sy = blink(u, P);
    glance = Math.max(glance, windowMax(u, LOOP.glance));
    lean = Math.max(lean, windowMax(u, FRANTIC(LOOP_TYPING)));
    blush += eventSum(u, LOOP.flinch, P, tau => bump(tau, 1.4));
  }

  // Shared reactions ----------------------------------------------------------------------
  state.head.rot += 1.8 * lean; // leans in toward the screen while typing frantically
  state.eyes.tx = 7 * glance; // up and right, at the X bubble
  state.eyes.ty = -8 * glance;
  for (const cheek of ['cheek-left', 'cheek-right']) state[cheek].sx = state[cheek].sy = 1 + 0.3 * blush;
  return state;
}
