/**
 * DroneSearch404.mjs — single-line drone for 404 pages.
 *
 * Geometry is traced from the reference drawing (drone-404-line-art-geometry.mjs);
 * motion is the pure timeline in drone-404-motion.mjs. This module only turns
 * both into SVG: renderDroneSVG() emits markup once, applyDroneState() writes one
 * frame. Ink is `currentColor`; `--d404-paper` and `--d404-numeral` come from the host.
 *
 * Depth, back to front: bold 404 -> scan beam -> drone. The drone's airframe carries a
 * paper-colored silhouette, so it occludes the numerals like a solid object.
 */

import { DRONE_LINE_ART } from './drone-404-line-art-geometry.mjs';
import { BODY_PIVOT, FLOOR_Y, sampleDroneState } from './drone-404-motion.mjs';

export { DRONE_TIMING, BODY_PIVOT, sampleDroneState } from './drone-404-motion.mjs';

const { width: W, height: H, rotors: ROTORS, segments: SEGMENTS, silhouette: SILHOUETTE } = DRONE_LINE_ART;
const ROTOR_IDS = Object.keys(ROTORS);
const LENS_CENTER = [1033, 739];
const NUMERAL_BASELINE = 880;
const BLADE_OPACITY_AT_SPEED = 0.3; // traced blades stay visible inside the blur disc
const DISC_OPACITY_AT_SPEED = 0.6;
const BLADE_FLATTEN_AT_SPEED = 0.42; // blades squash toward the flat rotor plane when spinning
const BLADE_WOBBLE_DEG = 5; // apparent angle swing as the tip travels the elliptical path
const BEAM_FOOT_HALF_WIDTH = 330;

export const DRONE_SEGMENT_LENGTHS = SEGMENTS.map(s => s.length);
// Reference frame widened for the search flight and extended below for the beam's floor.
export const DRONE_VIEWBOX = [-300, 60, W + 640, H + 160]; // measured envelope x -263…2302, y 77…948 (+ floor 1170); asserted in tests/line-art-pipeline.test.mjs

const drawnPath = seg => `<path d="${seg.d}" pathLength="1" data-order="${seg.order}"/>`;
const partPaths = part => SEGMENTS.filter(s => s.part === part).map(drawnPath).join('');

function rotorMarkup(id) {
  const { cx, cy, rx, ry } = ROTORS[id];
  const disc = `<ellipse class="d404-disc" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" pathLength="100" stroke-dasharray="34 16" opacity="0"/>`;
  return `<g class="d404-rotor" data-rotor="${id}">${disc}<g class="d404-blades">${partPaths(`blades:${id}`)}</g></g>`;
}

/** Static markup for the whole stage. Call once, then drive it with applyDroneState(). */
export function renderDroneSVG({ id = 'drone-404', title = 'Error 404: a line-drawn drone searching for the missing page' } = {}) {
  return `<svg id="${id}" class="d404" viewBox="${DRONE_VIEWBOX.join(' ')}" fill="none" stroke="currentColor"
  stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-title">
  <title id="${id}-title">${title}</title>
  <defs>
    <linearGradient id="${id}-beam-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="currentColor" stop-opacity="0.16"/>
      <stop offset="1" stop-color="currentColor" stop-opacity="0.03"/>
    </linearGradient>
  </defs>
  <g class="d404-numerals" opacity="0">
    <text x="${BODY_PIVOT[0]}" y="${NUMERAL_BASELINE}" text-anchor="middle" stroke="none" aria-hidden="true">404</text>
  </g>
  <g class="d404-beam" opacity="0">
    <path class="d404-beam-cone" fill="url(#${id}-beam-fade)" stroke="none"/>
    <path class="d404-beam-edges" opacity="0.35"/>
    <ellipse class="d404-beam-spot" rx="${BEAM_FOOT_HALF_WIDTH}" ry="34" fill="currentColor" fill-opacity="0.05" stroke-dasharray="2 12" opacity="0.8"/>
  </g>
  <g class="d404-drone">
    <path class="d404-silhouette" d="${SILHOUETTE}" stroke="none" style="fill: var(--d404-paper, #fff)"/>
    <g class="d404-airframe">${partPaths('airframe')}</g>
    <g class="d404-gimbal">
      <g class="d404-lens-frame">${partPaths('lens-frame')}</g>
      <g class="d404-lens-eye">${partPaths('lens-eye')}</g>
    </g>
    ${ROTOR_IDS.map(rotorMarkup).join('\n    ')}
  </g>
</svg>`;
}

const refs = new WeakMap();
const q = (svg, sel) => svg.querySelector(sel);

function collect(svg) {
  if (refs.has(svg)) return refs.get(svg);
  const drawn = [];
  svg.querySelectorAll('path[data-order]').forEach(p => { drawn[Number(p.dataset.order)] = p; });
  const found = {
    drawn,
    numerals: q(svg, '.d404-numerals'),
    drone: q(svg, '.d404-drone'),
    beam: q(svg, '.d404-beam'),
    cone: q(svg, '.d404-beam-cone'),
    edges: q(svg, '.d404-beam-edges'),
    spot: q(svg, '.d404-beam-spot'),
    gimbal: q(svg, '.d404-gimbal'),
    lensFrame: q(svg, '.d404-lens-frame'),
    lensEye: q(svg, '.d404-lens-eye'),
    rotors: ROTOR_IDS.map(rid => {
      const g = q(svg, `[data-rotor="${rid}"]`);
      return { ...ROTORS[rid], blades: g.querySelector('.d404-blades'), disc: g.querySelector('.d404-disc') };
    }),
  };
  refs.set(svg, found);
  return found;
}

const fx = v => Math.round(v * 100) / 100;
const set = (el, name, value) => el.setAttribute(name, String(value));

/**
 * A blade turning in a flat rotor plane seen from just above: its span projects as
 * cos(angle), its height flattens toward the plane, and its apparent angle swings a
 * little as the tip rides the ellipse. All three fade in with rotor speed, so the
 * parked blades are exactly the reference drawing.
 */
function bladeTransform({ cx, cy }, angle, spin) {
  const sx = 1 + (Math.cos(angle) - 1) * spin;
  const sy = 1 - (1 - BLADE_FLATTEN_AT_SPEED) * spin;
  const tilt = BLADE_WOBBLE_DEG * Math.sin(angle) * spin;
  return `translate(${cx} ${cy}) rotate(${fx(tilt)}) scale(${fx(sx * 1000) / 1000} ${fx(sy * 1000) / 1000}) translate(${-cx} ${-cy})`;
}

/** Local drone point -> stage point, matching the drone group's transform. */
function toStage([px, py], { x, y, rotate, scale }) {
  const r = (rotate * Math.PI) / 180;
  const dx = (px - BODY_PIVOT[0]) * scale;
  const dy = (py - BODY_PIVOT[1]) * scale;
  return [BODY_PIVOT[0] + x + dx * Math.cos(r) - dy * Math.sin(r), BODY_PIVOT[1] + y + dx * Math.sin(r) + dy * Math.cos(r)];
}

/** Write one frame. `state` comes from sampleDroneState(); pass t instead to sample it here. */
export function applyDroneState(svg, stateOrTime, opts = {}) {
  const state = typeof stateOrTime === 'number'
    ? sampleDroneState(stateOrTime, { segmentLengths: DRONE_SEGMENT_LENGTHS, ...opts })
    : stateOrTime;
  const el = collect(svg);

  state.draw.forEach((p, i) => {
    const path = el.drawn[i];
    if (!path) return;
    path.style.strokeDasharray = p >= 1 ? 'none' : '1 1';
    path.style.strokeDashoffset = String(fx(1 - p));
  });

  const { numerals, drone, gimbal, beam } = state;
  const [px, py] = BODY_PIVOT;
  set(el.numerals, 'opacity', fx(numerals.opacity));
  set(el.numerals, 'transform', `translate(${fx(numerals.x)} 0) translate(${px} ${py}) scale(${fx(numerals.scale * 1000) / 1000}) translate(${-px} ${-py})`);
  set(el.drone, 'transform', `translate(${fx(drone.x)} ${fx(drone.y)}) translate(${px} ${py}) rotate(${fx(drone.rotate)}) scale(${fx(drone.scale * 1000) / 1000}) translate(${-px} ${-py})`);

  // Stabilised gimbal: the camera counter-rotates against the bank and pans to look.
  const [lx, ly] = LENS_CENTER;
  set(el.gimbal, 'transform', `rotate(${fx(gimbal.level)} ${lx} ${ly})`);
  set(el.lensFrame, 'transform', `translate(${fx(gimbal.look * 7)} 0)`);
  set(el.lensEye, 'transform', `translate(${fx(gimbal.look * 13)} ${fx(Math.abs(gimbal.look) * 1.5)})`);

  // Beam in stage space: from the lens to the floor, following where the camera looks.
  const [ax, ay] = toStage([lx + gimbal.look * 13, ly + 22], drone);
  const footX = ax + beam.look * 320;
  const half = BEAM_FOOT_HALF_WIDTH * drone.scale;
  const apex = 18 * drone.scale;
  set(el.cone, 'd', `M${fx(ax - apex)},${fx(ay)} L${fx(footX - half)},${FLOOR_Y} L${fx(footX + half)},${FLOOR_Y} L${fx(ax + apex)},${fx(ay)} Z`);
  set(el.edges, 'd', `M${fx(ax - apex)},${fx(ay)} L${fx(footX - half)},${FLOOR_Y} M${fx(ax + apex)},${fx(ay)} L${fx(footX + half)},${FLOOR_Y}`);
  set(el.spot, 'cx', fx(footX));
  set(el.spot, 'cy', FLOOR_Y);
  set(el.spot, 'rx', fx(half));
  set(el.beam, 'opacity', fx(beam.opacity));

  el.rotors.forEach((rotor, i) => {
    const angle = state.rotors[i] * rotor.direction;
    set(rotor.blades, 'transform', bladeTransform(rotor, angle, state.spin));
    set(rotor.blades, 'opacity', fx(1 - (1 - BLADE_OPACITY_AT_SPEED) * state.spin));
    // Dashes travel around the disc once per blade turn, which reads as rotation.
    rotor.disc.style.strokeDashoffset = String(fx((-angle / (2 * Math.PI)) * 100));
    set(rotor.disc, 'opacity', fx(DISC_OPACITY_AT_SPEED * state.spin));
  });
  return state;
}
