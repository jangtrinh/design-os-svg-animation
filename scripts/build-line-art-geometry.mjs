#!/usr/bin/env node
/**
 * build-line-art-geometry.mjs — traced line art -> animatable geometry module.
 *
 * Stage 3 of the line-art-to-motion pipeline (docs/line-art-to-motion-pipeline.md).
 * Input is a per-case part map (e.g. research/drone-404/drone-parts.json) that points
 * at the centerline trace. Every coordinate still comes from the traced pixels; this
 * script only:
 *   1. assigns traced points to moving parts: whole strokes by index (`strokeParts`),
 *      otherwise by region polygon (`regions`), else `defaultPart`;
 *   2. smooths polylines into cubic Beziers (Catmull-Rom, tension 1/6);
 *   3. computes a pen order for the draw-on reveal (distance from `penOrigin`);
 *   4. attaches the occlusion silhouette and any case data (`extras`, e.g. rotor pivots).
 *
 * Usage:
 *   node scripts/build-line-art-geometry.mjs <parts.json>                      # write the module
 *   node scripts/build-line-art-geometry.mjs <parts.json> --preview out.svg    # part-coloured check render
 *   node scripts/build-line-art-geometry.mjs <parts.json> --airframe-svg out.svg  # silhouette extractor input
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = process.argv[2];
if (!configPath || configPath.startsWith('--')) {
  console.error('Usage: node scripts/build-line-art-geometry.mjs <parts.json> [--preview out.svg | --airframe-svg out.svg]');
  process.exit(1);
}
const CFG = JSON.parse(fs.readFileSync(path.resolve(configPath), 'utf8'));
const fromRoot = rel => path.join(ROOT_DIR, rel);
const STROKE_PART = new Map(Object.entries(CFG.strokeParts ?? {}).flatMap(([part, ids]) => ids.map(id => [id, part])));
const REGIONS = CFG.regions ?? [];

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
  if (STROKE_PART.has(strokeIndex)) return STROKE_PART.get(strokeIndex);
  return REGIONS.find(r => insidePolygon(point, r.poly))?.part ?? CFG.defaultPart;
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
  const trace = JSON.parse(fs.readFileSync(fromRoot(CFG.trace), 'utf8'));
  const segments = [];
  trace.strokes.forEach((points, strokeIndex) => {
    for (const run of splitByPart(points, strokeIndex)) {
      const length = polylineLength(run.points);
      if (length < 2) continue;
      segments.push({ part: run.part, points: run.points, length });
    }
  });

  // Pen order: the line starts at penOrigin and travels outward.
  const [ox, oy] = CFG.penOrigin;
  const [wx, wy] = CFG.penAxisWeight ?? [1, 1];
  const distance = seg => {
    const [x, y] = seg.points[Math.floor(seg.points.length / 2)];
    return Math.hypot((x - ox) * wx, (y - oy) * wy);
  };
  segments.sort((a, b) => distance(a) - distance(b));

  const silhouettePath = CFG.silhouette && fromRoot(CFG.silhouette);
  const silhouette = silhouettePath && fs.existsSync(silhouettePath)
    ? JSON.parse(fs.readFileSync(silhouettePath, 'utf8')).polygons
      .map(poly => `M${poly.map(p => p.map(round).join(',')).join(' L')} Z`).join(' ')
    : '';

  return {
    width: trace.width,
    height: trace.height,
    strokeWidth: CFG.strokeWidth ?? 2.2,
    ...(CFG.extras ?? {}),
    silhouette,
    segments: segments.map((seg, order) => ({ part: seg.part, order, length: Math.round(seg.length), d: catmullRomPath(seg.points) })),
  };
}

function writeModule(geometry) {
  const banner = `/**
 * ${path.basename(CFG.output)} — GENERATED by scripts/build-line-art-geometry.mjs ${path.relative(ROOT_DIR, path.resolve(configPath))}.
 * Do not edit by hand. Source: ${CFG.reference}, traced by scripts/trace-line-art-centerline.py
 * into ${CFG.trace}. Coordinates are reference pixels (viewBox 0 0 ${geometry.width} ${geometry.height}).
 */
`;
  fs.writeFileSync(fromRoot(CFG.output), `${banner}export const ${CFG.exportName} = ${JSON.stringify(geometry, null, 1)};\n`);
  const counts = geometry.segments.reduce((acc, s) => ({ ...acc, [s.part]: (acc[s.part] || 0) + 1 }), {});
  console.log(`wrote ${CFG.output}: ${geometry.segments.length} segments`, counts);
}

const PALETTE = ['#e00', '#e70', '#00e', '#a0a', '#0a0', '#0aa', '#770', '#555'];

function writePreview(geometry, file) {
  const parts = [...new Set(geometry.segments.map(s => s.part))].filter(p => p !== CFG.defaultPart);
  const colour = part => (part === CFG.defaultPart ? '#000' : PALETTE[parts.indexOf(part) % PALETTE.length]);
  const regions = REGIONS.map(r => `<polygon points="${r.poly.map(p => p.join(',')).join(' ')}" fill="none" stroke="#999" stroke-dasharray="6 6"/>`).join('');
  const paths = geometry.segments.map(s => `<path d="${s.d}" fill="none" stroke="${colour(s.part)}" stroke-width="3" stroke-linecap="round"/>`).join('');
  const legend = parts.map((p, i) => `<text x="20" y="${30 + i * 22}" font-family="Arial" font-size="18" fill="${colour(p)}">${p}</text>`).join('');
  fs.writeFileSync(file, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${geometry.width} ${geometry.height}" width="${geometry.width}" height="${geometry.height}"><rect width="100%" height="100%" fill="#fff"/>${regions}${paths}${legend}</svg>`);
  console.log(`preview ${file}`);
}

/** Static parts only (default part + stroke-mapped parts, no region parts), black on white. */
function writeAirframeSvg(geometry, file) {
  const moving = new Set(REGIONS.map(r => r.part));
  const paths = geometry.segments.filter(s => !moving.has(s.part)).map(s => `<path d="${s.d}"/>`).join('');
  fs.writeFileSync(file, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${geometry.width} ${geometry.height}" width="${geometry.width}" height="${geometry.height}"><rect width="100%" height="100%" fill="#fff"/><g fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`);
  console.log(`airframe svg ${file}`);
}

const geometry = build();
const flag = name => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);
if (flag('--preview')) writePreview(geometry, flag('--preview'));
else if (flag('--airframe-svg')) writeAirframeSvg(geometry, flag('--airframe-svg'));
else writeModule(geometry);
