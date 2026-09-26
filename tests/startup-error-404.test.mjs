import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCase } from '../scripts/line-art-cases.mjs';
import { STARTUP_ERROR_404_GEOMETRY as G } from '../src/primitives/startup-error-404-geometry.mjs';
import { STARTUP_ERROR_TIMING as T, STARTUP_ERROR_PIVOTS, sampleStartupErrorState } from '../src/primitives/startup-error-404-motion.mjs';
import { STARTUP_ERROR_VIEWBOX } from '../src/primitives/startup-error-404-renderer.mjs';
import { createStartupErrorInteraction } from '../src/primitives/startup-error-404-interaction.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUBBLES = ['bubble-question', 'bubble-error', 'bubble-alert'];
const SOURCE_ELEMENTS = 51; // source <path>/<ellipse> runs after the part split
const at = t => sampleStartupErrorState(t);
const loopT = u => T.loopStart + u;
const range = (from, to, step) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);
const numbers = state => Object.entries(state).flatMap(([part, v]) => Object.entries(v).map(([k, x]) => [`${part}.${k}`, x]));

test('the vector case splits the source into parts without losing an element', async () => {
  const parts = new Set(G.elements.map(e => e.part));
  assert.deepEqual([...parts].sort(), ['arm', 'body', 'bubble-alert', 'bubble-alert-glyph', 'bubble-error', 'bubble-error-glyph',
    'bubble-question', 'cheek-left', 'cheek-right', 'eyes', 'finger', 'head', 'laptop']);
  const source = G.elements.filter(e => !e.synthetic);
  assert.equal(source.length, SOURCE_ELEMENTS);
  assert.deepEqual(G.elements.filter(e => e.synthetic).map(e => `${e.part}:${e.fill}`).sort(),
    ['arm:paper', 'body:#FF8147', 'laptop:paper'], 'opaque forearm and laptop, and the shirt under the forearm');
  for (const group of ['body', 'head', ...BUBBLES]) assert.match(G.silhouettes[group] ?? '', /^M/, `${group} silhouette missing`);
  assert.ok(G.hiddenStrokes['bubble-alert'].length, 'the ring arc hidden behind the X bubble must be completed');
  const spec = loadCase('startup-error-404', ROOT);
  assert.equal((await spec.fidelityGeometry()).elements.length, SOURCE_ELEMENTS, 'fidelity renders source art only');
  assert.equal((await spec.timing()).loopPeriod, T.loopPeriod);
});

test('the loop repeats without a seam from seamlessFrom', () => {
  for (const x of range(0, T.loopPeriod, 0.05)) {
    const a = numbers(at(T.seamlessFrom + x));
    const b = Object.fromEntries(numbers(at(T.seamlessFrom + T.loopPeriod + x)));
    for (const [key, value] of a) assert.ok(Math.abs(value - b[key]) < 1e-6, `${key} differs at +${x.toFixed(2)}s`);
  }
});

test('the intro starts empty and ends with everything in place', () => {
  const start = at(0);
  assert.equal(start.figure.opacity, 0);
  for (const b of BUBBLES) assert.equal(start[b].sx, 0, `${b} must start closed`);
  const settled = at(T.seamlessFrom);
  for (const b of BUBBLES) {
    assert.ok(Math.abs(settled[b].sx - 1) < 0.01 && settled[b].opacity === 1, `${b} not open after the intro`);
  }
  const peak = Math.max(...range(0, T.loopStart, 1 / 120).flatMap(t => BUBBLES.map(b => at(t)[b].sx)));
  assert.ok(peak > 1.05 && peak < 1.2, `pop overshoot ${peak.toFixed(3)}: one small bounce, not a wobble`);
});

test('the X bubble buzzes at each error, the man flinches, and it is quiet in between', () => {
  const buzz = Math.max(...range(2.2, 2.7, 1 / 240).map(u => Math.abs(at(loopT(u))['bubble-error'].rot)));
  assert.ok(buzz > 2.5 && buzz < 5, `buzz ${buzz.toFixed(2)} deg`);
  const quiet = Math.max(...range(3.6, 6.1, 1 / 60).map(u => Math.abs(at(loopT(u))['bubble-error'].rot)));
  assert.ok(quiet < 0.05, `X bubble should be still between errors (${quiet.toFixed(3)} deg)`);
  const idle = u => -2.5 * Math.sin((2 * Math.PI * u) / T.loopPeriod);
  const flinch = Math.min(...range(2.3, 2.7, 1 / 240).map(u => at(loopT(u)).head.rot - idle(u)));
  assert.ok(flinch < -1.5, `he should jerk back (${flinch.toFixed(2)} deg)`);
  const pulse = Math.max(...range(2.5, 3.0, 1 / 240).map(u => at(loopT(u))['bubble-alert'].sx));
  assert.ok(pulse > 1.04, 'the "!" bubble pulses after the X');
});

test('he blinks, and reduced motion is the still finished pose', () => {
  assert.ok(at(loopT(0.99)).eyes.sy < 0.2, 'eyes closed mid-blink');
  assert.equal(at(loopT(0.5)).eyes.sy, 1);
  const still = sampleStartupErrorState(0, { reducedMotion: true });
  for (const [key, value] of numbers(still)) {
    assert.equal(value, /\.(sx|sy|opacity)$/.test(key) ? 1 : 0, `${key} moves under reduced motion`);
  }
});

test('every bubble stays inside the stage for the whole timeline', () => {
  const [vx, vy, vw, vh] = STARTUP_ERROR_VIEWBOX;
  const corners = part => {
    const n = G.silhouettes[part].match(/-?\d+\.?\d*/g).map(Number);
    const xs = n.filter((_, i) => i % 2 === 0);
    const ys = n.filter((_, i) => i % 2 === 1);
    return [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.min(...ys)], [Math.min(...xs), Math.max(...ys)], [Math.max(...xs), Math.max(...ys)]];
  };
  for (const part of BUBBLES) {
    const [px, py] = STARTUP_ERROR_PIVOTS[part];
    for (const t of range(0, T.seamlessFrom + T.loopPeriod, 1 / 30)) {
      const s = at(t)[part];
      const r = (s.rot * Math.PI) / 180;
      for (const [x, y] of corners(part)) {
        const dx = (x - px) * s.sx;
        const dy = (y - py) * s.sy;
        const X = px + s.tx + dx * Math.cos(r) - dy * Math.sin(r);
        const Y = py + s.ty + dx * Math.sin(r) + dy * Math.cos(r);
        assert.ok(X >= vx && X <= vx + vw && Y >= vy && Y <= vy + vh, `${part} leaves the stage at t=${t.toFixed(2)}`);
      }
    }
  }
});

test('hover: a close pointer pushes a bubble away and it comes back; a click closes it and it reopens', () => {
  const live = createStartupErrorInteraction();
  live.setPointer({ x: 560, y: 800 }); // just left of the "?" bubble centre
  for (let i = 0; i < 30; i += 1) live.step(1 / 60);
  const pushed = live.apply(at(8))['bubble-question'].tx - at(8)['bubble-question'].tx;
  assert.ok(pushed > 20, `the "?" bubble should move away from the pointer (moved ${pushed.toFixed(1)})`);
  live.setPointer(null);
  for (let i = 0; i < 240; i += 1) live.step(1 / 60);
  assert.ok(Math.abs(live.apply(at(8))['bubble-question'].tx - at(8)['bubble-question'].tx) < 2, 'comes back home');

  live.dismiss('bubble-error');
  for (let i = 0; i < 30; i += 1) live.step(1 / 60);
  assert.ok(live.apply(at(8))['bubble-error'].sx < 0.15, 'closed after a click');
  for (let i = 0; i < 150; i += 1) live.step(1 / 60);
  assert.ok(Math.abs(live.apply(at(8))['bubble-error'].sx - 1) < 0.05, 'pops back open');

  live.step(10); // a hidden tab resumes: dt is clamped
  for (const [key, value] of numbers(live.apply(at(8)))) assert.ok(Number.isFinite(value), `${key} is not finite`);
});

/** Keystrokes = peaks of the hand's press signal that fall back by a clear margin (overlapping presses still count). */
function keystrokes(u0, u1) {
  let count = 0;
  let peak = -Infinity;
  let rising = false;
  let prev = null;
  for (const u of range(u0, u1, 1 / 480)) {
    const s = at(loopT(u));
    const v = s.arm.rot / 2.4 + s.finger.ty / 9;
    if (prev !== null) {
      if (v > prev) { rising = true; peak = Math.max(peak, v); } else if (rising && peak - v > 0.12) { count += 1; rising = false; peak = -Infinity; }
      if (!rising) peak = v;
    }
    prev = v;
  }
  return count / (u1 - u0);
}

test('he types calmly, freezes at the error, then types frantically', () => {
  const calm = keystrokes(0.3, 1.9);
  const frantic = keystrokes(2.8, 4.3);
  assert.ok(calm > 1.5, `calm typing ${calm.toFixed(1)} strokes/s`);
  assert.ok(frantic > 2 * calm, `frantic ${frantic.toFixed(1)} vs calm ${calm.toFixed(1)} strokes/s`);
  for (const u of range(2.35, 2.65, 1 / 120)) {
    const s = at(loopT(u));
    assert.ok(s.arm.rot < 0 && s.finger.ty <= 0, `hand should be lifted off the keys at u=${u.toFixed(2)}`);
    assert.ok(s.eyes.ty < -5, 'eyes glance up at the X while frozen');
  }
  assert.ok(Math.abs(at(loopT(3.5)).eyes.ty) < 1e-9, 'eyes back on the screen while typing');
  assert.ok(Math.max(...range(2.8, 4.3, 1 / 60).map(u => at(loopT(u)).head.rot + 2.5 * Math.sin((2 * Math.PI * u) / 8))) > 1.2, 'leans in');
});

test('the whole forearm types and the laptop takes the knocks', () => {
  const [px, py] = STARTUP_ERROR_PIVOTS.arm;
  const tip = rot => { const r = (rot * Math.PI) / 180; const [x, y] = [1900 - px, 1420 - py]; return x * Math.sin(r) + y * (Math.cos(r) - 1); };
  let maxTip = 0;
  for (const t of range(0, T.seamlessFrom + T.loopPeriod, 1 / 240)) {
    const s = at(t);
    // the elbow joins sit ~160 units from the pivot: 2.8 deg keeps them within half a stroke
    assert.ok(s.arm.rot <= 2.8 && s.arm.rot >= -1.0, `arm ${s.arm.rot.toFixed(2)} deg at t=${t.toFixed(3)}`);
    assert.ok(s.laptop.ty >= 0 && s.laptop.ty <= 2.5 && s.laptop.rot <= 0 && s.laptop.rot >= -1.2,
      `laptop only tips its keyboard end down (ty ${s.laptop.ty.toFixed(2)}, rot ${s.laptop.rot.toFixed(2)} at t=${t.toFixed(3)})`);
    maxTip = Math.max(maxTip, tip(s.arm.rot));
  }
  assert.ok(maxTip > 30, `the fingertip should travel visibly with the forearm (${maxTip.toFixed(1)} units)`);
  // keyboard corner (1460, 1700): how far it dips at the deepest knock
  const [lx, ly] = STARTUP_ERROR_PIVOTS.laptop;
  const cornerDip = s => { const r = (s.laptop.rot * Math.PI) / 180; return s.laptop.ty + (1460 - lx) * Math.sin(r) + (1700 - ly) * (Math.cos(r) - 1); };
  const knock = Math.max(...range(2.8, 4.3, 1 / 240).map(u => cornerDip(at(loopT(u)))));
  assert.ok(knock > 7, `the keyboard end knocks down while typing frantically (${knock.toFixed(1)} units)`);
  const frozen = Math.max(...range(2.4, 2.6, 1 / 240).map(u => Math.abs(at(loopT(u)).laptop.rot)));
  assert.ok(frozen < 0.05, `laptop is still while his hand is lifted (${frozen.toFixed(3)} deg)`);
});

test('the glyphs react to the errors', () => {
  const hop = Math.min(...range(2.42, 2.8, 1 / 240).map(u => at(loopT(u))['bubble-alert-glyph'].ty));
  assert.ok(hop < -20, `the "!" hops (${hop.toFixed(1)})`);
  const punch = Math.max(...range(2.2, 2.4, 1 / 240).map(u => at(loopT(u))['bubble-error-glyph'].sx));
  assert.ok(punch > 1.1 && punch < 1.2, `the X punches (${punch.toFixed(3)})`);
  const blush = Math.max(...range(2.3, 3.7, 1 / 60).map(u => at(loopT(u))['cheek-left'].sx));
  assert.ok(blush > 1.2, 'he blushes at the error');
  assert.equal(at(loopT(1.0))['cheek-left'].sx, 1, 'no blush while calm');
});
