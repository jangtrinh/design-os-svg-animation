#!/usr/bin/env node
/**
 * build-vector-parts.mjs — filled vector illustration -> animatable part module.
 *
 * The `--source vector` branch of the line-art-to-motion pipeline
 * (docs/pipelines/line-art-to-motion-pipeline.md §1c). The source is already vector, so
 * geometry is copied, never redrawn. This script only:
 *   1. splits every <path> into its subpaths and assigns each to a part: a `pins` entry
 *      ("<element>.<subpath>": part, element = index among <path>/<ellipse> in document
 *      order) wins; else the first region polygon containing the subpath's bounding-box
 *      centre (and, when the region has `maxSize: [w, h]`, a box no larger than that: a
 *      glyph inside a frame with the same centre), else `defaultPart`;
 *   2. re-joins consecutive subpaths of the same element and part into one path, so
 *      nonzero-winding holes (letters, rings) stay intact;
 *   3. keeps the original paint order (one element list, each item tagged with its part),
 *      so parts can move without changing what overlaps what.
 * <ellipse> elements are kept as ellipses and assigned by their centre.
 * Occlusion: each silhouette group (config `silhouettes`: { group: { parts, file } }) gets
 * its own filled outline, so a moving part carries its own fill (see --mask). A group whose
 * outline is open because another part hides it (a bubble tucked behind another) takes a
 * `patch` polygon in SVG units, painted into the mask to close it before the flood fill.
 *
 * Usage:
 *   node scripts/build-vector-parts.mjs <parts.json>                    # write the module
 *   node scripts/build-vector-parts.mjs <parts.json> --preview out.svg  # part-coloured check render
 *   node scripts/build-vector-parts.mjs <parts.json> --mask <group> out.svg  # black mask of a silhouette group
 *   node scripts/build-vector-parts.mjs <parts.json> --list [x0,y0,x1,y1]   # subpath ids (for pins), part, fill, bbox
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = process.argv[2];
if (!configPath || configPath.startsWith('--')) {
  console.error('Usage: node scripts/build-vector-parts.mjs <parts.json> [--preview out.svg]');
  process.exit(1);
}
const CFG = JSON.parse(fs.readFileSync(path.resolve(configPath), 'utf8'));
const svg = fs.readFileSync(path.join(ROOT, CFG.reference), 'utf8');
const viewBox = svg.match(/viewBox="([^"]+)"/)[1].split(/[\s,]+/).map(Number);

function insidePolygon([x, y], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const partAt = (point, size = [0, 0]) => (CFG.regions ?? []).find(r => insidePolygon(point, r.poly)
  && (!r.maxSize || (size[0] <= r.maxSize[0] && size[1] <= r.maxSize[1])))?.part ?? CFG.defaultPart;

/** Bounding box of an absolute-command path (M L H V C S Q T Z; the flat-illustration subset). */
function bbox(d) {
  const tokens = d.match(/[MLHVCSQTZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
  const xs = [];
  const ys = [];
  let cmd = null;
  let x = 0;
  let y = 0;
  for (let i = 0; i < tokens.length;) {
    if (/[a-z]/i.test(tokens[i])) {
      cmd = tokens[i];
      i += 1;
      if (/[a-z]/.test(cmd) && cmd !== 'z') throw new Error(`relative command "${cmd}" is not supported; export absolute paths`);
      if (cmd.toUpperCase() === 'Z') continue;
    }
    const take = n => tokens.slice(i, i + n).map(Number);
    if (cmd === 'H') { [x] = take(1); i += 1; } else if (cmd === 'V') { [y] = take(1); i += 1; } else {
      const n = { M: 2, L: 2, T: 2, C: 6, S: 4, Q: 4 }[cmd];
      const values = take(n);
      for (let k = 0; k < n; k += 2) { xs.push(values[k]); ys.push(values[k + 1]); }
      [x, y] = values.slice(-2);
      i += n;
    }
    xs.push(x);
    ys.push(y);
  }
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
const centre = ([x0, y0, x1, y1]) => [(x0 + x1) / 2, (y0 + y1) / 2];

const elements = [];
const ELEMENT = /<(path|ellipse)\b([^>]*?)\/?>(?:<\/\1>)?/g;
const attr = (attrs, name) => attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
let index = -1;
const listing = []; // every subpath with its pin id, for --list
const sourceOf = new Map(); // output element -> source element index (for `fills` placement)
for (const [, tag, attrs] of svg.matchAll(ELEMENT)) {
  index += 1;
  const fill = attr(attrs, 'fill') ?? '#000';
  if (tag === 'ellipse') {
    const e = Object.fromEntries(['cx', 'cy', 'rx', 'ry', 'transform'].map(k => [k, attr(attrs, k)]).filter(([, v]) => v !== undefined));
    elements.push({ part: partAt([Number(e.cx), Number(e.cy)]), fill, ellipse: e });
    sourceOf.set(elements.at(-1), index);
    continue;
  }
  const subpaths = attr(attrs, 'd').trim().split(/(?=M)/).map(s => s.trim()).filter(Boolean);
  let run = null;
  for (const [k, sub] of subpaths.entries()) {
    const box = bbox(sub);
    const part = CFG.pins?.[`${index}.${k}`] ?? partAt(centre(box), [box[2] - box[0], box[3] - box[1]]);
    listing.push({ id: `${index}.${k}`, part, fill, box: box.map(Math.round) });
    if (run && run.part === part) run.d += sub;
    else { run = { part, fill, d: sub }; elements.push(run); sourceOf.set(run, index); }
  }
}

const counts = elements.reduce((acc, e) => ({ ...acc, [e.part]: (acc[e.part] || 0) + 1 }), {});
const geometry = { viewBox, elements, ...(CFG.extras ?? {}) };
const k = CFG.silhouettePxPerUnit ?? 1;
const toPath = polygons => polygons
  .map(poly => `M${poly.map(([x, y]) => `${(x / k + viewBox[0]).toFixed(1)},${(y / k + viewBox[1]).toFixed(1)}`).join(' L')} Z`).join(' ');
geometry.silhouettes = {};
const silhouettePolygons = {}; // group -> polygons in SVG units
for (const [group, { file }] of Object.entries(CFG.silhouettes ?? {})) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) continue;
  const polygons = JSON.parse(fs.readFileSync(full, 'utf8')).polygons;
  geometry.silhouettes[group] = toPath(polygons);
  silhouettePolygons[group] = polygons.map(poly => poly.map(([x, y]) => [x / k + viewBox[0], y / k + viewBox[1]]));
}

/** Sutherland-Hodgman: clip a (possibly concave) polygon by a convex one. */
function clipPolygon(subject, clip) {
  const area = clip.reduce((a, [x, y], i) => { const [x2, y2] = clip[(i + 1) % clip.length]; return a + x * y2 - x2 * y; }, 0);
  const inside = ([px, py], [ax, ay], [bx, by]) => Math.sign(area) * ((bx - ax) * (py - ay) - (by - ay) * (px - ax)) >= 0;
  const cross = ([px, py], [qx, qy], [ax, ay], [bx, by]) => {
    const d = (px - qx) * (ay - by) - (py - qy) * (ax - bx);
    const t = ((px - ax) * (ay - by) - (py - ay) * (ax - bx)) / d;
    return [px + t * (qx - px), py + t * (qy - py)];
  };
  let out = subject;
  for (let i = 0; i < clip.length && out.length; i += 1) {
    const a = clip[i];
    const b = clip[(i + 1) % clip.length];
    const input = out;
    out = [];
    input.forEach((p, j) => {
      const q = input[(j + input.length - 1) % input.length];
      if (inside(p, a, b)) { if (!inside(q, a, b)) out.push(cross(q, p, a, b)); out.push(p); } else if (inside(q, a, b)) out.push(cross(q, p, a, b));
    });
  }
  return out;
}

/**
 * Move every vertex `d` units inward along its averaged edge normal. Silhouettes are traced
 * at silhouettePxPerUnit and simplified, so their edge can sit a few units outside an
 * outline; an inset keeps a synthetic fill's edge under the outline stroke.
 */
function insetPolygon(poly, d) {
  const area = poly.reduce((a, [x, y], i) => { const [x2, y2] = poly[(i + 1) % poly.length]; return a + x * y2 - x2 * y; }, 0);
  const inward = Math.sign(area); // +1: normals (-dy, dx) point inside for this winding
  const normal = ([ax, ay], [bx, by]) => { const len = Math.hypot(bx - ax, by - ay) || 1; return [(-(by - ay) / len) * inward, ((bx - ax) / len) * inward]; };
  return poly.map((p, i) => {
    const prev = poly[(i + poly.length - 1) % poly.length];
    const next = poly[(i + 1) % poly.length];
    const [n1x, n1y] = normal(prev, p);
    const [n2x, n2y] = normal(p, next);
    const [nx, ny] = [n1x + n2x, n1y + n2y];
    const len = Math.hypot(nx, ny) || 1;
    return [p[0] + (nx / len) * d, p[1] + (ny / len) * d];
  });
}

/*
 * Synthetic fills (`fills`): paint that the source never needed but motion does, built from a
 * silhouette, optionally inset (`inset`, units) and clipped by a convex polygon (`clip`): an opaque fill for a part whose
 * interior was left transparent (it must hide what it moves over), or the surface hidden
 * under a moving part (the shirt under the arm). Placed `before`/`after` a source element
 * index, tagged `synthetic` so fidelity renders the source elements only.
 */
for (const f of CFG.fills ?? []) {
  const polygons = (silhouettePolygons[f.silhouette] ?? [])
    .map(poly => (f.inset ? insetPolygon(poly, f.inset) : poly))
    .map(poly => (f.clip ? clipPolygon(poly, f.clip) : poly)).filter(poly => poly.length > 2);
  if (!polygons.length) { console.warn(`fills: silhouette "${f.silhouette}" missing or clipped away`); continue; }
  const d = polygons.map(poly => `M${poly.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')} Z`).join(' ');
  const at = f.before !== undefined
    ? elements.findIndex(e => sourceOf.get(e) === f.before)
    : elements.findLastIndex(e => sourceOf.get(e) === f.after) + 1;
  if (at < 0) throw new Error(`fills: no source element ${f.before ?? f.after}`);
  elements.splice(at, 0, { part: f.part, fill: f.fill, d, synthetic: true });
}
const sourceElements = elements.filter(e => !e.synthetic);

const drawElement = (e, fill) => (e.ellipse
  ? `<ellipse ${Object.entries(e.ellipse).map(([key, v]) => `${key}="${v}"`).join(' ')} fill="${fill}"/>`
  : `<path d="${e.d}" fill="${fill}"/>`);

const flag = name => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);
if (process.argv.includes('--list')) {
  // --list [x0,y0,x1,y1]: subpaths whose bbox centre lies in the window (default: all)
  const win = flag('--list')?.includes(',') ? flag('--list').split(',').map(Number) : null;
  for (const { id, part, fill, box } of listing) {
    const [cx, cy] = centre(box);
    if (!win || (cx >= win[0] && cx <= win[2] && cy >= win[1] && cy <= win[3])) console.log(id.padEnd(6), part.padEnd(20), fill, box.join(','));
  }
} else if (flag('--mask')) {
  const group = CFG.silhouettes?.[flag('--mask')];
  if (!group) throw new Error(`no silhouette group "${flag('--mask')}" in ${configPath}`);
  const out = process.argv[process.argv.indexOf('--mask') + 2];
  const patch = group.patch ? `<polygon points="${group.patch.map(p => p.join(',')).join(' ')}" fill="#000"/>` : '';
  const body = sourceElements.filter(e => group.parts.includes(e.part)).map(e => drawElement(e, '#000')).join('') + patch;
  fs.writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.join(' ')}" width="${viewBox[2] * k}" height="${viewBox[3] * k}"><rect x="${viewBox[0]}" y="${viewBox[1]}" width="${viewBox[2]}" height="${viewBox[3]}" fill="#fff"/>${body}</svg>`);
  console.log(`mask ${flag('--mask')} -> ${out} (${viewBox[2] * k}x${viewBox[3] * k})`);
} else if (flag('--preview')) {
  const palette = ['#e00', '#e70', '#00c', '#0a0', '#a0a', '#0aa', '#770', '#f0c', '#06f', '#960', '#6c0', '#c06'];
  const parts = Object.keys(counts).filter(p => p !== CFG.defaultPart);
  const colour = p => (p === CFG.defaultPart ? '#bbb' : palette[parts.indexOf(p) % palette.length]);
  const body = sourceElements.map(e => drawElement(e, colour(e.part))).join('');
  const regions = (CFG.regions ?? []).map(r => `<polygon points="${r.poly.map(p => p.join(',')).join(' ')}" fill="none" stroke="#999" stroke-width="4" stroke-dasharray="16 12"/>`).join('');
  const legend = parts.map((p, i) => `<text x="40" y="${80 + i * 70}" font-size="56" font-family="Arial" fill="${colour(p)}">${p}</text>`).join('');
  fs.writeFileSync(flag('--preview'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.join(' ')}" width="1500" height="${(1500 * viewBox[3]) / viewBox[2]}"><rect x="${viewBox[0]}" y="${viewBox[1]}" width="${viewBox[2]}" height="${viewBox[3]}" fill="#fff"/>${regions}${body}${legend}</svg>`);
  console.log(`preview ${flag('--preview')}`, counts);
} else {
  const banner = `/**\n * ${path.basename(CFG.output)} — GENERATED by scripts/build-vector-parts.mjs ${path.relative(ROOT, path.resolve(configPath))}.\n * Do not edit by hand. Source: ${CFG.reference} (geometry copied verbatim, split by part).\n */\n`;
  fs.writeFileSync(path.join(ROOT, CFG.output), `${banner}export const ${CFG.exportName} = ${JSON.stringify(geometry, null, 1)};\n`);
  console.log(`wrote ${CFG.output}: ${elements.length} elements`, counts);
}
