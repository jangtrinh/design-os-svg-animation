/**
 * Deterministic Pure-Time Easing, Velocity-Driven SVG Blur & 50-Shade Gray Quantizer
 *
 * Designed for stateless `window.seek(t)` / `window.__seekToTime(t)` motion showreels:
 * - Zero carried state between frames
 * - Analytical derivative `speedExpoOut(u)` drives `<feGaussianBlur stdDeviation="bx,by">`
 * - 50-step monochrome luminance quantizer (`gray50`) between `#0A0A0A` and `#FFFFFF`
 */

export const clamp01 = (x) => Math.max(0, Math.min(1, x));

export const lerp = (a, b, u) => a + (b - a) * u;

export const sub = (t, t0, t1) => clamp01((t - t0) / Math.max(1e-6, t1 - t0));

export const expoOut = (u) => {
  const x = clamp01(u);
  return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

export const expoIn = (u) => {
  const x = clamp01(u);
  return x <= 0 ? 0 : Math.pow(2, 10 * (x - 1));
};

export const expoInOut = (u) => {
  const x = clamp01(u);
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x < 0.5
    ? 0.5 * Math.pow(2, 20 * x - 10)
    : 1 - 0.5 * Math.pow(2, -20 * x + 10);
};

/**
 * Critically damped / lightly underdamped analytical spring(u) in [0, 1].
 * Boundary-exact: spring(0) === 0, spring(1) === 1.
 */
export const spring = (u, stiffness = 14, frequency = 11) => {
  const x = clamp01(u);
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 - Math.exp(-stiffness * x) * Math.cos(frequency * x);
};

/**
 * Normalized instantaneous velocity of expoOut(u) in [0, 1] for directional blur.
 */
export const speedExpoOut = (u) => {
  const x = clamp01(u);
  if (x <= 0 || x >= 1) return 0;
  return Math.min(1, 6.93 * Math.pow(2, -10 * x));
};

/**
 * Computes directional SVG `<feGaussianBlur>` stdDeviation tuple from horizontal/vertical speeds.
 */
export function computeDirectionalBlur(vx, vy, maxSigma = 6.0) {
  const bx = Math.min(maxSigma, Math.max(0, Math.abs(vx))).toFixed(1);
  const by = Math.min(maxSigma, Math.max(0, Math.abs(vy))).toFixed(1);
  return {
    stdDeviationX: `${bx},0`,
    stdDeviationY: `0,${by}`,
    activeAxis: Number(bx) >= Number(by) && Number(bx) > 1.2
      ? 'x'
      : (Number(by) > 1.2 ? 'y' : null)
  };
}

/**
 * Quantizes continuous luminance u in [0, 1] into 50 discrete architectural shades of gray
 * spanning #0A0A0A (10) to #FFFFFF (255).
 */
export function gray50(u) {
  const step = Math.round(clamp01(u) * 49) / 49;
  const v = Math.round(10 + step * 245);
  const hex = v.toString(16).padStart(2, '0').toUpperCase();
  return `#${hex}${hex}${hex}`;
}
