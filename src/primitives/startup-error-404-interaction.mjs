/**
 * startup-error-404-interaction.mjs — the illustration notices the visitor.
 *
 * A live layer composed on top of the deterministic timeline pose (never used by the
 * exporter or the virtual clock):
 *   - attention: the man tilts his head and looks toward the pointer (or a hovered button);
 *   - personal space: a bubble near the pointer is pushed away, sways, and springs back;
 *   - dismiss: clicking a bubble closes it, and it pops right back 1.6 s later (the error
 *     is still there);
 *   - calm: hovering or focusing a call-to-action shrinks and fades the errors a little.
 *
 * Units are source SVG units and seconds; step() takes the real frame dt.
 */

import { STARTUP_ERROR_PIVOTS } from './startup-error-404-motion.mjs';

const TAU = Math.PI * 2;
const spring = (f, zeta) => ({ w2: (TAU * f) ** 2, c: 2 * zeta * TAU * f });
const ATTENTION = spring(1.6, 0.85);
const RETURN = spring(1.3, 0.6); // one visible swing, then home
const POP = spring(2.4, 0.5); // same feel as the intro pop
const CALM = spring(1.8, 0.9);
const MAX_DT = 1 / 30; // a hidden tab must not make the springs explode
const PERSONAL_SPACE = 460; // units from a bubble's centre where the push starts
const PUSH = 9000; // units/s^2 at contact
const SWAY = 55; // deg/s^2 of sway per unit of push
const REOPEN_AFTER = 1.6;
const BUBBLE_CENTRES = { 'bubble-question': [640, 800], 'bubble-error': [2000, 690], 'bubble-alert': [2390, 880] };

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function createStartupErrorInteraction() {
  const s = { head: 0, vHead: 0, lookX: 0, vLookX: 0, lookY: 0, vLookY: 0, calm: 0, vCalm: 0 };
  const bubbles = Object.fromEntries(Object.keys(BUBBLE_CENTRES).map(b => [b, {
    x: 0, vx: 0, y: 0, vy: 0, rot: 0, vRot: 0, scale: 1, vScale: 0, closedAt: null,
  }]));
  let pointer = null;
  let focus = null;
  let clock = 0;

  const follow = (o, key, rate, target, k, dt) => {
    o[rate] += (k.w2 * (target - o[key]) - k.c * o[rate]) * dt;
    o[key] += o[rate] * dt;
  };

  function step(rawDt) {
    const dt = clamp(rawDt, 0, MAX_DT);
    clock += dt;
    const target = focus ?? pointer;
    const [hx] = STARTUP_ERROR_PIVOTS.head;
    const [ex, ey] = STARTUP_ERROR_PIVOTS.eyes;
    follow(s, 'head', 'vHead', target ? clamp(((target.x - hx) / 1500) * 5, -5, 5) : 0, ATTENTION, dt);
    follow(s, 'lookX', 'vLookX', target ? clamp(((target.x - ex) / 1400) * 10, -10, 10) : 0, ATTENTION, dt);
    follow(s, 'lookY', 'vLookY', target ? clamp(((target.y - ey) / 1400) * 8, -6, 8) : 0, ATTENTION, dt);
    follow(s, 'calm', 'vCalm', focus ? 1 : 0, CALM, dt);

    for (const [name, b] of Object.entries(bubbles)) {
      const [cx, cy] = BUBBLE_CENTRES[name];
      let fx = 0;
      let fy = 0;
      if (pointer) {
        const dx = cx + b.x - pointer.x;
        const dy = cy + b.y - pointer.y;
        const d = Math.hypot(dx, dy) || 1;
        const strength = clamp(1 - d / PERSONAL_SPACE, 0, 1) ** 2;
        fx = (PUSH * strength * dx) / d;
        fy = (PUSH * strength * dy) / d;
      }
      b.vx += (fx - RETURN.w2 * b.x - RETURN.c * b.vx) * dt;
      b.vy += (fy - RETURN.w2 * b.y - RETURN.c * b.vy) * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vRot += ((SWAY * fx) / PUSH * 10 - RETURN.w2 * b.rot - RETURN.c * b.vRot) * dt;
      b.rot += b.vRot * dt;
      if (b.closedAt !== null && clock - b.closedAt > REOPEN_AFTER) b.closedAt = null;
      follow(b, 'scale', 'vScale', b.closedAt === null ? 1 : 0, POP, dt);
    }
  }

  /** Compose onto a timeline state (returns a new object; the input is not mutated). */
  function apply(state) {
    const out = structuredClone(state);
    out.head.rot += s.head;
    out.eyes.tx += s.lookX;
    out.eyes.ty += s.lookY;
    for (const [name, b] of Object.entries(bubbles)) {
      const scale = Math.max(0, b.scale) * (1 - 0.12 * s.calm);
      out[name].tx += b.x;
      out[name].ty += b.y;
      out[name].rot = out[name].rot * (1 - 0.8 * s.calm) + b.rot;
      out[name].sx *= scale;
      out[name].sy *= scale;
      out[name].opacity *= 1 - 0.4 * s.calm;
    }
    return out;
  }

  return {
    step,
    apply,
    setPointer(p) { pointer = p; },
    setFocus(p) { focus = p; },
    dismiss(name) { if (bubbles[name] && bubbles[name].closedAt === null) bubbles[name].closedAt = clock; },
    /** For tests and proofs: the live offsets. */
    snapshot: () => structuredClone({ s, bubbles }),
  };
}
