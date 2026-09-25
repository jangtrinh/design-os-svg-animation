#!/usr/bin/env node
/**
 * build-drone-404-geometry.mjs
 *
 * Turns the centerline trace of the reference drone (research/drone-404/) into the
 * animatable geometry module consumed by src/primitives/DroneSearch404.mjs.
 *
 * Every coordinate comes from the traced pixels. This script only:
 *   1. assigns traced points to moving parts (4 propeller blade sets, camera lens),
 *   2. smooths polylines into cubic Beziers (Catmull-Rom, tension 1/6),
 *   3. computes a pen order for the draw-on reveal.
 *
 * Usage:
 *   node scripts/build-drone-404-geometry.mjs            # writes the geometry module
 *   node scripts/build-drone-404-geometry.mjs --preview out.svg   # part-colored check render
 *   node scripts/build-drone-404-geometry.mjs --airframe-svg out.svg  # silhouette extractor input
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TRACE_PATH = path.join(ROOT_DIR, 'research/drone-404/drone-centerline-trace.json');
const OUT_PATH = path.join(ROOT_DIR, 'src/primitives/drone-404-line-art-geometry.mjs');
// Filled airframe outline (paper-colored) so the drone occludes the 404 behind it.
// Produced by scripts/extract-line-art-silhouette.py from the --airframe-svg render.
const SILHOUETTE_PATH = path.join(ROOT_DIR, 'research/drone-404/drone-airframe-silhouette.json');

// Rotor hubs (spinner-cone axis) measured on the reference, in reference pixels.
// rx/ry: the blur disc a spinning prop sweeps, sized to the traced blade span and
// flattened because the camera sits just above the rotor plane.
const ROTORS = {
  'rotor-top-left': { cx: 492, cy: 298, rx: 228, ry: 26, direction: 1 },
  'rotor-top-right': { cx: 1527, cy: 300, rx: 238, ry: 26, direction: -1 },
  'rotor-bottom-left': { cx: 342, cy: 493, rx: 292, ry: 38, direction: -1 },
  'rotor-bottom-right': { cx: 1662, cy: 505, rx: 262, ry: 38, direction: 1 },
};

// Blade lobes: polygons enclosing each blade, drawn around the traced loops and
// stopping short of the hub ring and spinner cone (those stay on the airframe).
const BLADE_REGIONS = [
  { rotor: 'rotor-top-left', poly: [[232, 268], [330, 262], [452, 283], [462, 300], [440, 312], [300, 360], [230, 352]] },
  { rotor: 'rotor-top-left', poly: [[523, 300], [530, 252], [600, 188], [690, 170], [725, 184], [705, 222], [600, 282], [545, 310]] },
  { rotor: 'rotor-top-right', poly: [[1288, 238], [1400, 250], [1480, 278], [1478, 296], [1440, 305], [1300, 345], [1284, 300]] },
  { rotor: 'rotor-top-right', poly: [[1574, 268], [1700, 274], [1795, 294], [1795, 345], [1640, 345], [1574, 322]] },
  { rotor: 'rotor-bottom-left', poly: [[40, 372], [150, 378], [260, 430], [300, 470], [298, 500], [200, 490], [40, 450]] },
  { rotor: 'rotor-bottom-left', poly: [[378, 478], [470, 470], [560, 495], [640, 555], [632, 592], [575, 590], [470, 540], [390, 500]] },
  { rotor: 'rotor-bottom-right', poly: [[1368, 540], [1420, 490], [1520, 470], [1600, 480], [1604, 505], [1520, 535], [1400, 568], [1368, 560]] },
  { rotor: 'rotor-bottom-right', poly: [[1702, 505], [1760, 420], [1850, 372], [1905, 385], [1900, 450], [1760, 505], [1722, 515]] },
];

// Straight arm strokes that pass through a blade polygon but belong to the airframe.
// Indices refer to research/drone-404/drone-centerline-trace.json.
const AIRFRAME_STROKES = new Set([3, 4, 7, 10, 18, 19, 20, 26, 31, 32, 34, 36, 41, 43, 55, 56, 60, 62, 66, 75, 77, 79, 80, 81]);

// Camera gimbal lens: the two rounded lens frames and the lens rings.
const LENS_FRAME_STROKES = new Set([22, 27]);
const LENS_EYE_STROKES = new Set([53, 58]);

const BODY_CENTER = [1010, 500];

function insidePolygon([x, y], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function partOfPoint(point, strokeIndex) {
  if (AIRFRAME_STROKES.has(strokeIndex)) return 'airframe';
  if (LENS_FRAME_STROKES.has(strokeIndex)) return 'lens-frame';
  if (LENS_EYE_STROKES.has(strokeIndex)) return 'lens-eye';
  const region = BLADE_REGIONS.find(r => insidePolygon(point, r.poly));
  return region ? `blades:${region.rotor}` : 'airframe';
}

/** Split a stroke into runs of consecutive points sharing a part; runs share their seam point. */
function splitByPart(points, strokeIndex) {
  const runs = [];
  let current = null;
  points.forEach((point, i) => {
    const part = partOfPoint(point, strokeIndex);
    if (!current || current.part !== part) {
      const seam = current ? [current.points.at(-1)] : [];
      current = { part, points: [...seam, point] };
      runs.push(current);
      if (i > 0 && seam.length === 0) current.points.unshift(points[i - 1]);
    } else {
      current.points.push(point);
    }
  });
  return runs.filter(run => run.points.length >= 2);
}

const round = v => Math.round(v * 10) / 10;

function catmullRomPath(points) {
  if (points.length < 3) return `M${points.map(p => p.map(round).join(',')).join(' L')}`;
  const closed = Math.hypot(points[0][0] - points.at(-1)[0], points[0][1] - points.at(-1)[1]) < 0.05;
  const n = points.length;
  let d = `M${round(points[0][0])},${round(points[0][1])}`;
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = i > 0 ? points[i - 1] : closed ? points[n - 2] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < n ? points[i + 2] : closed ? points[1] : p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${round(c1[0])},${round(c1[1])} ${round(c2[0])},${round(c2[1])} ${round(p2[0])},${round(p2[1])}`;
  }
  return d;
}

const polylineLength = pts => pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

function build() {
  const trace = JSON.parse(fs.readFileSync(TRACE_PATH, 'utf8'));
  const segments = [];
  trace.strokes.forEach((points, strokeIndex) => {
    for (const run of splitByPart(points, strokeIndex)) {
      const length = polylineLength(run.points);
      if (length < 2) continue;
      segments.push({ source: strokeIndex, part: run.part, points: run.points, length });
    }
  });

  // Pen order: the line starts at the fuselage and travels outward to the rotors.
  const distance = seg => {
    const [x, y] = seg.points[Math.floor(seg.points.length / 2)];
    return Math.hypot((x - BODY_CENTER[0]) * 0.8, y - BODY_CENTER[1]);
  };
  segments.sort((a, b) => distance(a) - distance(b));

  const silhouette = fs.existsSync(SILHOUETTE_PATH)
    ? JSON.parse(fs.readFileSync(SILHOUETTE_PATH, 'utf8')).polygons
      .map(poly => `M${poly.map(p => p.map(round).join(',')).join(' L')} Z`).join(' ')
    : '';

  return {
    width: trace.width,
    height: trace.height,
    strokeWidth: 2.2,
    rotors: ROTORS,
    silhouette,
    segments: segments.map((seg, order) => ({
      part: seg.part,
      order,
      length: Math.round(seg.length),
      d: catmullRomPath(seg.points),
    })),
  };
}

function writeModule(geometry) {
  const banner = `/**
 * drone-404-line-art-geometry.mjs — GENERATED by scripts/build-drone-404-geometry.mjs.
 * Do not edit by hand. Source: research/drone-404/reference-single-line-drone.png,
 * traced by scripts/trace-line-art-centerline.py into drone-centerline-trace.json.
 * Coordinates are reference pixels (viewBox 0 0 ${geometry.width} ${geometry.height}).
 */
`;
  const body = `export const DRONE_LINE_ART = ${JSON.stringify(geometry, null, 1)};\n`;
  fs.writeFileSync(OUT_PATH, banner + body);
  const counts = geometry.segments.reduce((acc, s) => ({ ...acc, [s.part]: (acc[s.part] || 0) + 1 }), {});
  console.log(`wrote ${path.relative(ROOT_DIR, OUT_PATH)}: ${geometry.segments.length} segments`, counts);
}

function writePreview(geometry, file) {
  const colors = {
    airframe: '#000',
    'lens-frame': '#0a0',
    'lens-eye': '#0c6',
    'blades:rotor-top-left': '#e00',
    'blades:rotor-top-right': '#e70',
    'blades:rotor-bottom-left': '#00e',
    'blades:rotor-bottom-right': '#a0a',
  };
  const regions = BLADE_REGIONS.map(r => `<polygon points="${r.poly.map(p => p.join(',')).join(' ')}" fill="none" stroke="#999" stroke-dasharray="6 6"/>`).join('');
  const paths = geometry.segments.map(s => `<path d="${s.d}" fill="none" stroke="${colors[s.part]}" stroke-width="3" stroke-linecap="round"/>`).join('');
  fs.writeFileSync(file, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${geometry.width} ${geometry.height}" width="${geometry.width}" height="${geometry.height}"><rect width="100%" height="100%" fill="#fff"/>${regions}${paths}</svg>`);
  console.log(`preview ${file}`);
}

/** Airframe + lens only (no blades), black on white: input for the silhouette extractor. */
function writeAirframeSvg(geometry, file) {
  const paths = geometry.segments.filter(s => !s.part.startsWith('blades:'))
    .map(s => `<path d="${s.d}"/>`).join('');
  fs.writeFileSync(file, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${geometry.width} ${geometry.height}" width="${geometry.width}" height="${geometry.height}"><rect width="100%" height="100%" fill="#fff"/><g fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`);
  console.log(`airframe svg ${file}`);
}

const geometry = build();
const flag = name => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);
if (flag('--preview')) writePreview(geometry, flag('--preview'));
else if (flag('--airframe-svg')) writeAirframeSvg(geometry, flag('--airframe-svg'));
else writeModule(geometry);
