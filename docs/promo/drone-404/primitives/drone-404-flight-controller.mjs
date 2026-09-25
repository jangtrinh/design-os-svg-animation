/**
 * drone-404-flight-controller.mjs — a small simulated flight controller.
 *
 * Why simulate: keyframed motion starts, stops and turns all channels in lockstep,
 * which reads as rigid. A quadrotor cannot do that. It must tilt first, and the tilt
 * then produces acceleration. So the drone lags its commanded path a little,
 * overshoots on arrival, and corrects. Here that happens for real:
 *
 *   command     minimum-jerk mission path (+ slow station-keeping drift)
 *   position    PD loop -> desired tilt = atan(a_cmd / g)
 *   attitude    2nd-order loop chases the desired tilt (the tilt leads the motion)
 *   dynamics    x'' = g * tan(tilt) + gust force
 *   secondary   height, depth, gimbal level and camera look are damped springs
 *
 * Determinism: fixed 240 Hz grid from the loop start. The transient first period
 * (from rest) and the steady-state period are each simulated once and cached;
 * any time is a table lookup with linear interpolation between grid states.
 * The steady period starts from the state after one full period, where every mode
 * has decayed below 1e-14, so the loop is seamless by construction.
 */

const TAU = Math.PI * 2;
const HZ = 240;
const DT = 1 / HZ;

const spring = (f, zeta) => ({ w2: (TAU * f) ** 2, c: 2 * zeta * TAU * f });
const POSITION = spring(0.85, 0.78); // how tightly the drone tracks its path
const ATTITUDE = spring(3.2, 0.68); // how fast it can change tilt: one small overshoot, then level
const HEIGHT = spring(1.3, 0.7);
const DEPTH = spring(0.65, 0.8);
const GIMBAL = spring(4.5, 0.7); // stabiliser: slight lag behind the body, no ringing
const LOOK = spring(1.6, 0.7);

// Fields of one grid state, in order.
const FIELDS = ['x', 'v', 'tilt', 'tiltRate', 'y', 'vy', 'depth', 'vDepth', 'level', 'vLevel', 'look', 'vLook'];
const N = FIELDS.length;
const I = Object.fromEntries(FIELDS.map((f, i) => [f, i]));

/**
 * @param {object} cfg
 * @param {number} cfg.period loop length in seconds (period * 240 must be an integer)
 * @param {number} cfg.gravity px/s^2
 * @param {(u: number) => {x:number,v:number,a:number,y:number,depth:number,look:number,gust:number}} cfg.command
 */
export function createFlightController({ period, gravity, command }) {
  const steps = Math.round(period * HZ);
  let transient = null;
  let steady = null;

  function step(s, u) {
    const c = command(u);
    const aCmd = c.a + POSITION.w2 * (c.x - s[I.x]) + POSITION.c * (c.v - s[I.v]);
    const tiltWanted = Math.atan(aCmd / gravity);
    s[I.tiltRate] += (ATTITUDE.w2 * (tiltWanted - s[I.tilt]) - ATTITUDE.c * s[I.tiltRate]) * DT;
    s[I.tilt] += s[I.tiltRate] * DT;
    s[I.v] += (gravity * Math.tan(s[I.tilt]) + c.gust) * DT;
    s[I.x] += s[I.v] * DT;
    const follow = (p, dp, target, k) => {
      s[dp] += (k.w2 * (target - s[p]) - k.c * s[dp]) * DT;
      s[p] += s[dp] * DT;
    };
    follow(I.y, I.vy, c.y, HEIGHT);
    follow(I.depth, I.vDepth, c.depth, DEPTH);
    follow(I.level, I.vLevel, -s[I.tilt], GIMBAL);
    follow(I.look, I.vLook, c.look, LOOK);
  }

  function simulate(start) {
    const table = new Float64Array((steps + 1) * N);
    const s = Float64Array.from(start);
    table.set(s, 0);
    for (let k = 0; k < steps; k += 1) {
      step(s, k * DT);
      table.set(s, (k + 1) * N);
    }
    return table;
  }

  function tables() {
    if (!transient) {
      const rest = new Float64Array(N);
      rest[I.depth] = 1;
      transient = simulate(rest);
      steady = simulate(transient.subarray(steps * N, (steps + 1) * N));
    }
    return { transient, steady };
  }

  /** State at u seconds after the loop start (u >= 0). */
  return function sample(u) {
    const { transient: first, steady: loop } = tables();
    const inFirst = u < period;
    const local = inFirst ? Math.max(0, u) : (u - period) % period;
    const table = inFirst ? first : loop;
    const k = Math.min(steps - 1, Math.floor(local * HZ));
    const f = local * HZ - k;
    const at = field => table[k * N + I[field]] * (1 - f) + table[(k + 1) * N + I[field]] * f;
    return {
      x: at('x'),
      y: at('y'),
      depth: at('depth'),
      bank: (at('tilt') * 180) / Math.PI,
      level: (at('level') * 180) / Math.PI,
      look: at('look'),
    };
  };
}
