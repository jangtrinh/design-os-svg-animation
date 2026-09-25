/**
 * drone-404-interaction.mjs — the drone notices the visitor.
 *
 * A live layer composed on top of the deterministic timeline pose (never used by the
 * exporter or the virtual clock):
 *   - attention: the gimbal camera and scan beam turn toward the pointer, or toward a
 *     hovered call-to-action ("Back to home" is lit like a runway);
 *   - surprise: the first time it spots you, the drone hops a little;
 *   - personal space: a pointer close to the airframe pushes it away. The push is a
 *     force, so the drone tilts, drifts, then its controller brings it back level
 *     (same damping as the flight model: one small swing, then stable).
 *
 * Units are stage (reference) pixels and seconds. step() takes the real frame dt.
 */

const TAU = Math.PI * 2;
const spring = (f, zeta) => ({ w2: (TAU * f) ** 2, c: 2 * zeta * TAU * f });
const RETURN = spring(0.9, 0.75); // how the drone comes back to its mission pose
const ATTITUDE = spring(3.2, 0.68);
const ATTENTION = spring(2.2, 0.85); // how quickly the camera commits to you
const GRAVITY = 8000; // keep in step with drone-404-motion.mjs
const PERSONAL_SPACE = 520; // px from the airframe centre where the push starts
const PUSH = 5200; // px/s^2 at contact
const HOP = -95; // px/s upward kick when the drone first spots you
const MAX_DT = 1 / 30; // a hidden tab must not make the springs explode
const LENS_OFFSET_X = 23; // lens sits this far right of the body pivot
const BEAM_REACH = 320; // keep in step with DroneSearch404.mjs beam foot spread

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function createDroneInteraction({ bodyPivot }) {
  const s = { x: 0, vx: 0, y: 0, vy: 0, tilt: 0, tiltRate: 0, attention: 0, vAttention: 0, look: 0, vLook: 0, aim: 0, vAim: 0 };
  let pointer = null; // { x, y } stage px, or null
  let focus = null; // { x, strength } a hovered call-to-action
  let noticed = false;

  const follow = (key, rate, target, k, dt) => {
    s[rate] += (k.w2 * (target - s[key]) - k.c * s[rate]) * dt;
    s[key] += s[rate] * dt;
  };

  return {
    /** Pointer in stage px, or null when it leaves the stage. */
    setPointer(point) {
      if (point && !pointer && !noticed) {
        s.vy += HOP;
        noticed = true;
      }
      pointer = point;
    },
    /** A hovered element to look at and light up (x in stage px), or null. */
    setFocus(target) {
      focus = target;
    },
    /** Advance the live springs by dt seconds, given the timeline pose. */
    step(dt, pose) {
      dt = clamp(dt, 0, MAX_DT);
      const cx = bodyPivot[0] + pose.x + s.x;
      const cy = bodyPivot[1] + pose.y + s.y;

      // Personal space: push away from the pointer, strongest at contact.
      let fx = 0;
      let fy = 0;
      if (pointer) {
        const dx = cx - pointer.x;
        const dy = cy - pointer.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < PERSONAL_SPACE) {
          const strength = PUSH * (1 - dist / PERSONAL_SPACE) ** 2;
          fx = (strength * dx) / dist;
          fy = (0.45 * strength * dy) / dist; // vertical thrust resists more than roll
        }
      }
      const ax = -RETURN.w2 * s.x - RETURN.c * s.vx + fx;
      s.vx += ax * dt;
      s.x += s.vx * dt;
      s.vy += (-RETURN.w2 * s.y - RETURN.c * s.vy + fy) * dt;
      s.y += s.vy * dt;
      follow('tilt', 'tiltRate', Math.atan(ax / GRAVITY), ATTITUDE, dt); // a push reads as a tilt

      // Attention: look at the focused call-to-action first, else at the pointer.
      const target = focus ?? pointer;
      follow('attention', 'vAttention', target ? 1 : 0, ATTENTION, dt);
      if (target) {
        // The camera turns within its gimbal limits; the beam lands right on the target.
        follow('look', 'vLook', clamp((target.x - cx) / 420, -1.35, 1.35), ATTENTION, dt);
        follow('aim', 'vAim', target.x - cx, ATTENTION, dt);
      }
    },
    /** Compose the live layer onto a timeline state (mutates and returns it). */
    apply(state) {
      const a = clamp(s.attention, 0, 1.2);
      state.drone.x += s.x;
      state.drone.y += s.y;
      state.drone.rotate += (s.tilt * 180) / Math.PI;
      state.gimbal.look += (s.look - state.gimbal.look) * Math.min(1, a);
      const beamLook = clamp((s.aim - LENS_OFFSET_X) / BEAM_REACH, -3, 3); // renderer: footX = lensX + look * reach
      state.beam.look += (beamLook - state.beam.look) * Math.min(1, a);
      const lit = focus ? 1 : 0.85;
      state.beam.opacity = Math.max(state.beam.opacity, Math.min(1, a) * lit);
      return state;
    },
  };
}
