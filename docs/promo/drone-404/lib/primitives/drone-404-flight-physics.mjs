/**
 * drone-404-flight-physics.mjs — closed-form flight dynamics for the 404 drone.
 *
 * Everything is an analytic function of time (no integration state), so any frame
 * can be sampled directly and the export stays deterministic.
 *
 *  - Waypoint legs follow minimum-jerk trajectories (the standard for smooth
 *    quadrotor motion); position, velocity and acceleration are exact. They are the
 *    command the flight controller (drone-404-flight-controller.mjs) tracks.
 *  - Lift-off is a damped harmonic oscillator step response.
 */

const TAU = Math.PI * 2;

/** Minimum-jerk blend on s in [0,1]: value, first and second derivative (per unit s). */
function minimumJerk(s) {
  const s2 = s * s;
  const s3 = s2 * s;
  return {
    p: s3 * (10 - 15 * s + 6 * s2),
    v: 30 * s2 * (1 - s) * (1 - s),
    a: 60 * s * (1 - s) * (1 - 2 * s),
  };
}

/**
 * Sample a periodic waypoint path. `legs` are [startTime, endTime, fromValue, toValue];
 * between legs the value holds. Returns { p, v, a } for one scalar channel.
 */
export function samplePath(time, period, legs, pick) {
  const u = ((time % period) + period) % period;
  let hold = pick(legs.at(-1)[3]);
  for (const leg of legs) {
    const [t0, t1, from, to] = leg;
    if (u < t0) break;
    if (u <= t1) {
      const span = t1 - t0;
      const mj = minimumJerk((u - t0) / span);
      const delta = pick(to) - pick(from);
      return { p: pick(from) + delta * mj.p, v: (delta * mj.v) / span, a: (delta * mj.a) / (span * span) };
    }
    hold = pick(to);
  }
  return { p: hold, v: 0, a: 0 };
}

/**
 * Unit step response of a damped oscillator: rises from 0 to 1 with overshoot.
 * zeta < 1 gives the small "settle" a drone shows after a height change.
 */
export function dampedStep(tau, frequencyHz, zeta) {
  if (tau <= 0) return 0;
  const wn = TAU * frequencyHz;
  const wd = wn * Math.sqrt(1 - zeta * zeta);
  const decay = Math.exp(-zeta * wn * tau);
  return 1 - decay * (Math.cos(wd * tau) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * tau));
}
