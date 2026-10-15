/* Pure-time motion primitives for the DESIGN:OS 3D Blender promo.
 * Every value is a function of t only: no timers, no state carried between frames. */
(function (root) {
  const D = (root.DOS = root.DOS || {});

  /** Closed-form step response of a damped spring (0 -> 1). zeta < 1 gives a tiny overshoot. */
  D.spring = function (dt, omega, zeta) {
    if (dt <= 0) return 0;
    const r = Math.sqrt(1 - zeta * zeta);
    const wd = omega * r;
    const e = Math.exp(-zeta * omega * dt);
    return 1 - e * (Math.cos(wd * dt) + (zeta / r) * Math.sin(wd * dt));
  };

  /** A value that changes target many times = sum of one spring per change: keys [[t, v], ...]. */
  D.track = function (keys, t, omega = 22, zeta = 0.86) {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      v += (keys[i][1] - keys[i - 1][1]) * D.spring(t - keys[i][0], omega, zeta);
    }
    return v;
  };

  /** Latest key whose time is <= t (step function, used for discrete content like frame index). */
  D.step = function (keys, t) {
    let v = keys[0][1];
    for (const [kt, kv] of keys) if (t >= kt) v = kv;
    return v;
  };

  D.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  D.ramp = (t, a, b) => D.clamp((t - a) / (b - a));
  D.smooth = (x) => x * x * (3 - 2 * x);
  D.lerp = (a, b, k) => a + (b - a) * k;

  /** Visibility window: fades in after tin, fades out after tout (null = never leaves). */
  D.vis = function (t, tin, tout, fin = 0.16, fout = 0.12) {
    const enter = D.smooth(D.ramp(t, tin, tin + fin));
    const exit = tout == null ? 1 : 1 - D.smooth(D.ramp(t, tout, tout + fout));
    return Math.min(enter, exit);
  };

  /** Apply a content-swap look: opacity + short blur + small lift. */
  D.applyVis = function (el, v, lift = 6) {
    el.style.opacity = v.toFixed(4);
    el.style.filter = v >= 0.999 ? 'none' : `blur(${((1 - v) * 7).toFixed(2)}px)`;
    el.style.transform = `translateY(${((1 - v) * lift).toFixed(2)}px)`;
    el.style.visibility = v <= 0.001 ? 'hidden' : 'visible';
  };

  D.gray = (l) => {
    const c = Math.round(D.clamp(l, 0, 255));
    return `rgb(${c},${c},${c})`;
  };
})(typeof window !== 'undefined' ? window : globalThis);
