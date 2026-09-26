/**
 * startup-error-404-typing.mjs — the man's typing hand, as a pure function of time.
 *
 * Keystrokes are generated once, deterministically (hashed jitter, no Math.random), inside
 * typing windows: a calm rhythm while things work, a frantic burst right after each error
 * ("maybe if I type faster..."), nothing while he is frozen by the error. Each keystroke is
 * a short press (alpha pulse: fast down, soft release) given to one of two fingers:
 *   - index: the fingertip is the end of the arm outline, so the whole forearm dips about
 *     the elbow (up to ~2.6 deg). The forearm has its own opaque fill and the shirt under it
 *     is completed (synthetic fills), so it can move without opening a gap;
 *   - middle: its own stroke, so it curls and presses on its own, and drags the arm a little.
 * Every keystroke also tips the laptop on the knee it rests on: the keyboard end dips, the
 * lid rocks back a little (one direction only, never past its rest pose). The hand lifts off while he freezes.
 */

const PRESS = 0.04; // s to the bottom of a keystroke
const KNOCK = 0.05; // s to the bottom of the laptop's dip
const HORIZON = 0.5; // s after which a keystroke no longer contributes

/** Loop windows in seconds into the 8 s loop: [start, end, strokes per second, strength]. */
export const LOOP_TYPING = Object.freeze([
  [0.3, 1.9, 3.2, 0.5], // calm
  [2.75, 4.3, 8.5, 1], // frantic, after the first error
  [5.3, 6.0, 3.2, 0.5], // calm again
  [6.7, 7.5, 8.5, 1], // frantic, shorter, after the second error
]);
/** Intro windows in absolute seconds (before the loop starts at 2.4 s). */
export const INTRO_TYPING = Object.freeze([
  [0.5, 1.3, 3.2, 0.5],
  [1.8, 2.3, 8.5, 1],
]);
/** Hand lifted off the keys, frozen by an error: [start, end] in loop seconds. */
export const LOOP_FREEZE = Object.freeze([[2.25, 2.8], [6.25, 6.7]]);
export const INTRO_FREEZE = Object.freeze([[1.4, 1.8]]);

const hash = n => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const smooth = v => { const x = Math.min(1, Math.max(0, v)); return x * x * (3 - 2 * x); };

function strokes(windows, seed) {
  const out = [];
  windows.forEach(([a, b, rate, strength], w) => {
    for (let k = 0; ; k += 1) {
      const id = seed + w * 100 + k;
      const t = a + (k + 0.4 * (hash(id) - 0.5)) / rate;
      if (t > b) break;
      if (t < a) continue;
      const edge = smooth(Math.min(t - a, b - t) / 0.18); // bursts start and stop softly
      out.push({ t, finger: hash(id + 0.5) < 0.6 ? 'index' : 'middle', amp: strength * edge * (0.7 + 0.3 * hash(id + 0.25)) });
    }
  });
  return out;
}

const LOOP_STROKES = strokes(LOOP_TYPING, 1);
const INTRO_STROKES = strokes(INTRO_TYPING, 7);

const pulse = (tau, peak) => (tau <= 0 || tau > HORIZON ? 0 : (tau / peak) * Math.exp(1 - tau / peak));
/** 0..1..0 over a window, eased at both ends. */
const hold = (x, [a, b]) => smooth((x - a) / 0.15) * smooth((b - x) / 0.2);

/**
 * { arm: deg, finger: { rot, ty }, laptop: { ty, rot }, lift: 0..1 }. `u` is loop time (null before the loop),
 * `t` absolute time; `since(u, u0)` is the period-wrapped age of a loop event.
 */
export function sampleTyping(t, u, since) {
  let index = 0;
  let middle = 0;
  let lift = 0;
  let knock = 0;
  const add = (s, tau) => {
    const p = s.amp * pulse(tau, PRESS);
    if (s.finger === 'index') index += p; else middle += p;
    knock += s.amp * pulse(tau, KNOCK);
  };
  for (const s of INTRO_STROKES) add(s, t - s.t);
  for (const w of INTRO_FREEZE) lift = Math.max(lift, hold(t, w));
  if (u !== null) {
    for (const s of LOOP_STROKES) add(s, since(u, s.t));
    for (const w of LOOP_FREEZE) lift = Math.max(lift, hold(u, w));
  }
  const down = Math.min(knock, 1.3);
  return {
    // index presses dip the forearm, middle presses drag it; freezing lifts it off the keys
    arm: 2.4 * Math.min(index, 1.1) + 1.0 * Math.min(middle, 1.1) - 0.9 * lift,
    finger: { rot: 5 * Math.min(middle, 1.1), ty: 9 * Math.min(middle, 1.1) - 6 * lift },
    // the laptop rests on the knee: a keystroke tips its keyboard end down about that contact
    // (negative = counter-clockwise), so the edge by the knee, where the legs' lines end
    // behind it, barely moves; ty only settles it a hair onto the lap
    laptop: { ty: 1.5 * down, rot: -0.75 * down },
    lift,
  };
}
