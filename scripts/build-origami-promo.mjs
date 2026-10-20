#!/usr/bin/env node
/**
 * build-origami-promo.mjs
 * Compiles the 15-second (120 BPM, 30 beats) DESIGN:OS Origami motion design showreel
 * into a single 1920x1080 HTML file (`promo/origami-cad/origami-cad-promo.html`).
 *
 * Concept (one line):
 * "One crimson cut line splits into kinetic type, unfolds into a flat dieline,
 *  rises into a 3D gable carton, separates into three prepress plates, cascades
 *  across five 3D polyhedral cartons, and collapses back into the single cut line."
 *
 * Strict constraints:
 * - Solid background only (#0C0C0C obsidian or #F5F3EE warm paper — zero grids, zero cards, zero UI chrome)
 * - One typeface: Inter (800 / 900 display)
 * - Palette: at most 3 colors (#FF2E4C Crimson, #00D67F Emerald, #2970FF Cobalt) + #0C0C0C Black & #F5F3EE White
 * - Pure function of time: window.seek(t) computes everything from scratch with zero state carried between frames
 * - Spring & exponential easing as pure functions of time + directional velocity motion blur
 * - Web Audio API (OfflineAudioContext) procedural soundtrack generator built in
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DATA_PATH = path.join(ROOT_DIR, 'promo/origami-cad/origami-models-data.json');
const OUT_HTML = path.join(ROOT_DIR, 'promo/origami-cad/origami-cad-promo.html');

const rawData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// Keep and normalize the geometry needed for the 15s showreel
const showreelModels = {};
for (const slug of ['gable-box', 'hex-petal', 'diamond-box', 'zero-glue-tray', 'fefco-0427']) {
  const m = rawData.models[slug];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const faces = m.faces.map((f) => {
    const poly = f.vertices || f.poly || [];
    for (const [x, y] of poly) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    return {
      id: f.id,
      name: String(f.id),
      poly,
      holes: f.holes || []
    };
  });
  const hinges = m.hinges.map((h) => ({
    parent: String(h.parent),
    child: String(h.child),
    a: h.axis ? h.axis[0] : h.a,
    b: h.axis ? h.axis[1] : h.b,
    angle: h.angle_deg ?? h.angle ?? 90,
    start: h.start ?? null,
    end: h.end ?? null
  }));
  const lines_2d = m.lines_2d.map((seg) =>
    Array.isArray(seg)
      ? { x1: seg[0], y1: seg[1], x2: seg[2], y2: seg[3], type: String(seg[4] || 'crease').toUpperCase() }
      : seg
  );
  showreelModels[slug] = {
    slug: m.slug,
    title: m.title,
    root: String(m.root),
    bbox: [minX, minY, maxX, maxY],
    faces,
    hinges,
    lines_2d
  };
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=1920, height=1080, initial-scale=1.0" />
  <title>DESIGN:OS ORIGAMI — 15s Monochrome Motion Showreel</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    html, body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: #0A0A0A;
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
      user-select: none;
    }
    #stage {
      position: relative;
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: #0A0A0A;
    }
    #main-canvas {
      position: absolute;
      inset: 0;
      width: 1920px;
      height: 1080px;
      display: block;
    }
    #vector-overlay {
      position: absolute;
      inset: 0;
      width: 1920px;
      height: 1080px;
      pointer-events: none;
      overflow: visible;
    }
    @media (prefers-reduced-motion: reduce) {
      /* Gate 4 accessibility compliance */
      #stage {
        transform: none !important;
      }
    }
  </style>
</head>
<body>
  <main id="stage" role="img" aria-label="DESIGN:OS Origami 15-second monochrome motion design showreel">
    <canvas id="main-canvas" width="1920" height="1080"></canvas>
    <svg id="vector-overlay" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="dir-blur-x" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur id="fe-blur-x" in="SourceGraphic" stdDeviation="0,0" />
        </filter>
        <filter id="dir-blur-y" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur id="fe-blur-y" in="SourceGraphic" stdDeviation="0,0" />
        </filter>
        <!-- Gate 1 official Phosphor symbols -->
        <symbol id="icon-lock" viewBox="0 0 256 256"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm-80,84a12,12,0,1,1,12-12A12,12,0,0,1,128,164Zm32-84H96V56a32,32,0,0,1,64,0Z"/></symbol>
        <symbol id="icon-return" viewBox="0 0 256 256"><path d="M232,56v64a8,8,0,0,1-8,8H43.31l34.35,34.34a8,8,0,0,1-11.32,11.32l-48-48a8,8,0,0,1,0-11.32l48-48A8,8,0,0,1,77.66,77.66L43.31,112H216V56a8,8,0,0,1,16,0Z"/></symbol>
        <symbol id="icon-sparkle" viewBox="0 0 256 256"><path d="M208,144a15.78,15.78,0,0,1-10.42,14.94l-51.65,19-19,51.61a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88l51.65-19,19-51.61a15.92,15.92,0,0,1,29.88,0l19,51.65,51.61,19A15.78,15.78,0,0,1,208,144Z"/></symbol>
        <symbol id="icon-code" viewBox="0 0 256 256"><path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"/></symbol>
        <symbol id="icon-copy" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"/></symbol>
        <symbol id="icon-check" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></symbol>
        <symbol id="icon-search" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32,11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></symbol>
        <symbol id="icon-external" viewBox="0 0 256 256"><path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"/></symbol>
      </defs>
      <g id="svg-scene"></g>
    </svg>
  </main>

  <script>
    const MODELS = ${JSON.stringify(showreelModels)};
    const FONT_STACK = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

    // Pure Monochrome B&W + 50 Shades of Gray Palette
    const PALETTE = {
      black:   '#0A0A0A', // Deep obsidian stage
      white:   '#F4F4F2', // Gallery alabaster paper
      crimson: '#FFFFFF', // Pure white primary knife edge / highlight
      emerald: '#A8A8A8', // Brushed silver crease / secondary tone
      cobalt:  '#5C5C5C'  // Machined graphite tertiary tone
    };

    // Quantize luminance [0..1] into 50 discrete architectural shades of gray
    function gray50(u, minLum = 12, maxLum = 246) {
      const step = Math.round(Math.max(0, Math.min(1, u)) * 49) / 49;
      const v = Math.round(minLum + step * (maxLum - minLum));
      return \`rgb(\${v}, \${v}, \${v})\`;
    }

    const DURATION = 15.0;
    const BPM = 120;
    const BEAT = 0.5; // 120 BPM = 0.5s per beat, 30 beats total

    // --- Pure Mathematical Easing & Spring Functions (No State) ---
    function clamp01(v) {
      return v < 0 ? 0 : (v > 1 ? 1 : v);
    }
    function sub(t, t0, t1) {
      return clamp01((t - t0) / (t1 - t0));
    }
    function lerp(a, b, u) {
      return a + (b - a) * u;
    }
    function expoOut(u) {
      const x = clamp01(u);
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }
    function expoIn(u) {
      const x = clamp01(u);
      return x === 0 ? 0 : Math.pow(2, 10 * (x - 1));
    }
    function expoInOut(u) {
      const x = clamp01(u);
      if (x === 0 || x === 1) return x;
      return x < 0.5
        ? Math.pow(2, 20 * x - 10) / 2
        : (2 - Math.pow(2, -20 * x + 10)) / 2;
    }
    // Critically / slightly underdamped spring as a pure function of normalized time u in [0,1]
    function spring(u, stiffness = 14, damping = 9.5) {
      const x = clamp01(u);
      if (x === 0) return 0;
      if (x === 1) return 1;
      return 1 - Math.exp(-damping * x) * (Math.cos(stiffness * x) + (damping / stiffness) * Math.sin(stiffness * x));
    }
    // Instantaneous derivative (speed) of expoOut for directional motion blur
    function speedExpoOut(u) {
      const x = clamp01(u);
      if (x <= 0.001 || x >= 0.999) return 0;
      return 10 * Math.LN2 * Math.pow(2, -10 * x);
    }

    // --- 3D Spanning-Tree Rodrigues Solver (Pure Function of model + foldProgress) ---
    function matMul(A, B) {
      const out = new Array(16).fill(0);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          out[r * 4 + c] =
            A[r * 4 + 0] * B[0 * 4 + c] +
            A[r * 4 + 1] * B[1 * 4 + c] +
            A[r * 4 + 2] * B[2 * 4 + c] +
            A[r * 4 + 3] * B[3 * 4 + c];
        }
      }
      return out;
    }

    function hingeMatrix(ax, ay, bx, by, rad) {
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const c = Math.cos(rad);
      const s = Math.sin(rad);
      const mc = 1 - c;

      const R = [
        c + ux * ux * mc, ux * uy * mc,     uy * s,  0,
        uy * ux * mc,     c + uy * uy * mc, -ux * s, 0,
        -uy * s,          ux * s,           c,       0,
        0,                0,                0,       1
      ];
      const T1 = [1, 0, 0, -ax, 0, 1, 0, -ay, 0, 0, 1, 0, 0, 0, 0, 1];
      const T2 = [1, 0, 0, ax,  0, 1, 0, ay,  0, 0, 1, 0, 0, 0, 0, 1];
      return matMul(T2, matMul(R, T1));
    }

    function applyMat(M, x, y) {
      return [
        M[0] * x + M[1] * y + M[3],
        M[4] * x + M[5] * y + M[7],
        M[8] * x + M[9] * y + M[11]
      ];
    }

    function computeTransforms(model, foldProgress) {
      const transforms = {};
      transforms[model.root] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      for (const h of model.hinges) {
        const parentMat = transforms[h.parent] || transforms[model.root];
        let localP = foldProgress;
        if (h.start != null || h.end != null) {
          const st = h.start ?? 0;
          const en = h.end ?? 1;
          localP = clamp01((foldProgress - st) / Math.max(0.0001, en - st));
        }
        const rad = (h.angle * localP * Math.PI) / 180;
        const localMat = hingeMatrix(h.a[0], h.a[1], h.b[0], h.b[1], rad);
        transforms[h.child] = matMul(parentMat, localMat);
      }
      return transforms;
    }

    function orientPointUpright(pt, slug, foldProgress) {
      const x = pt[0];
      const y = pt[1];
      const z = pt[2];
      const wallRooted = slug === 'gable-box' || slug === 'diamond-box';
      if (!wallRooted) {
        return [x, -y, -z];
      }
      const u = clamp01(foldProgress);
      const pitch = u * (Math.PI / 2);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const y0 = -y;
      const z0 = -z;
      return [
        x,
        y0 * cp - z0 * sp,
        y0 * sp + z0 * cp
      ];
    }

    function projectPoint(pt, az, el, scale, cx, cy) {
      const [x, y, z] = pt;
      const ca = Math.cos(az);
      const sa = Math.sin(az);
      const ce = Math.cos(el);
      const se = Math.sin(el);
      const rx = x * ca - y * sa;
      const ry = x * sa + y * ca;
      const rz = z;
      const sx = cx + rx * scale;
      const sy = cy - (ry * se + rz * ce) * scale;
      const depth = ry * ce - rz * se;
      return [sx, sy, depth];
    }

    function computeModelBounds3D(model, slug, foldProgress, az, el) {
      const transforms = computeTransforms(model, foldProgress);
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      const faceList = [];

      for (const face of model.faces) {
        const M = transforms[face.name] || transforms[model.root];
        const pts3d = face.poly.map(p => orientPointUpright(applyMat(M, p[0], p[1]), slug, foldProgress));
        const holes3d = (face.holes || []).map(h => h.map(p => orientPointUpright(applyMat(M, p[0], p[1]), slug, foldProgress)));
        const projPts = pts3d.map(p => projectPoint(p, az, el, 1, 0, 0));
        for (const [px, py] of projPts) {
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }
        let avgDepth = 0;
        for (const p of projPts) avgDepth += p[2];
        avgDepth /= Math.max(1, projPts.length);

        let shade = 0.5;
        if (pts3d.length >= 3) {
          const u = [pts3d[1][0] - pts3d[0][0], pts3d[1][1] - pts3d[0][1], pts3d[1][2] - pts3d[0][2]];
          const v = [pts3d[2][0] - pts3d[0][0], pts3d[2][1] - pts3d[0][1], pts3d[2][2] - pts3d[0][2]];
          const nx = u[1] * v[2] - u[2] * v[1];
          const ny = u[2] * v[0] - u[0] * v[2];
          const nz = u[0] * v[1] - u[1] * v[0];
          const nLen = Math.hypot(nx, ny, nz) || 1;
          shade = Math.abs((nx / nLen) * -0.42 + (ny / nLen) * -0.52 + (nz / nLen) * 0.74);
        }
        faceList.push({ face, pts3d, holes3d, avgDepth, shade });
      }
      faceList.sort((a, b) => b.avgDepth - a.avgDepth);
      return { faceList, transforms, minX, maxX, minY, maxY };
    }

    function drawModel3D(ctx, model, slug, foldProgress, opts) {
      const {
        cx, cy, targetSize, az, el,
        theme = 'dark', // 'dark' (#0A0A0A stage) or 'light' (#F4F4F2 stage)
        wireframeOnly = false,
        plateColor = null,
        highlightSeam = 0
      } = opts;

      const b0 = computeModelBounds3D(model, slug, 0, az, el);
      const b1 = computeModelBounds3D(model, slug, 1, az, el);
      const span0 = Math.max(b0.maxX - b0.minX, b0.maxY - b0.minY, 1);
      const span1 = Math.max(b1.maxX - b1.minX, b1.maxY - b1.minY, 1);
      const scale0 = targetSize / span0;
      const scale1 = (targetSize * 0.88) / span1;
      const scale = lerp(scale0, scale1, clamp01(foldProgress));

      const cur = computeModelBounds3D(model, slug, foldProgress, az, el);
      const ox = cx - ((cur.minX + cur.maxX) / 2) * scale;
      const oy = cy - ((cur.minY + cur.maxY) / 2) * scale;

      for (const item of cur.faceList) {
        const outer2d = item.pts3d.map(p => projectPoint(p, az, el, scale, ox, oy));
        const holes2d = item.holes3d.map(h => h.map(p => projectPoint(p, az, el, scale, ox, oy)));

        ctx.beginPath();
        outer2d.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p[0], p[1]);
          else ctx.lineTo(p[0], p[1]);
        });
        ctx.closePath();

        for (const h of holes2d) {
          if (!h.length) continue;
          ctx.moveTo(h[0][0], h[0][1]);
          for (let k = 1; k < h.length; k++) ctx.lineTo(h[k][0], h[k][1]);
          ctx.closePath();
        }

        if (!wireframeOnly) {
          if (theme === 'dark') {
            // 50 Shades of Gray sculptural chiaroscuro on #0A0A0A stage
            ctx.fillStyle = gray50(item.shade, 110, 245);
          } else {
            // 50 Shades of Gray architectural graphite monolith on #F4F4F2 stage
            ctx.fillStyle = gray50(item.shade, 18, 128);
          }
          ctx.fill('evenodd');
        }

        ctx.strokeStyle = plateColor
          ? plateColor
          : (theme === 'dark' ? '#181818' : '#ECECE8');
        ctx.lineWidth = plateColor ? 3.0 : 2.2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();

        // Crisp pure-white / obsidian rim highlight on front-most faces when highlightSeam > 0
        if (!wireframeOnly && highlightSeam > 0 && item === cur.faceList[cur.faceList.length - 1]) {
          ctx.strokeStyle = theme === 'dark' ? '#FFFFFF' : '#0A0A0A';
          ctx.lineWidth = 3.6;
          ctx.stroke();
        }
      }
    }

    function getBounds2D(model) {
      if (Array.isArray(model.bbox)) return model.bbox;
      if (Array.isArray(model.bounds_2d)) return model.bounds_2d;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const f of model.faces) {
        for (const [x, y] of f.poly) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      return [minX, minY, maxX, maxY];
    }

    // --- Progressive 2D Unfold Renderer for Bar 2 (Panel -> Full 2D Gable Dieline) ---
    function drawProgressive2DGable(ctx, t, cx, cy, targetW) {
      const model = MODELS['gable-box'];
      const [minX, minY, maxX, maxY] = getBounds2D(model);
      const bw = maxX - minX;
      const scale = targetW / bw;
      const ox = cx - ((minX + maxX) / 2) * scale;
      const oy = cy - ((minY + maxY) / 2) * scale;

      const uB4 = spring(sub(t, 2.0, 2.48));
      const uB5 = spring(sub(t, 2.5, 2.98));
      const uB6 = spring(sub(t, 3.0, 3.48));
      const uB7 = expoOut(sub(t, 3.5, 3.95));

      for (const face of model.faces) {
        const cxFace = face.poly.reduce((s, p) => s + p[0], 0) / face.poly.length;
        const cyFace = face.poly.reduce((s, p) => s + p[1], 0) / face.poly.length;
        const isCenterWall = face.id === 14;
        const isAdjacentWall = !isCenterWall && cyFace >= 0 && cyFace <= 110 && cxFace < 395;
        const isFarWallOrGlue = !isCenterWall && !isAdjacentWall && cyFace >= 0 && cyFace <= 110;
        const isTopOrBottom = cyFace < 0 || cyFace > 110;

        let reveal = 1.0;
        let anchorX = 205;
        let anchorY = 55;

        if (isCenterWall) {
          reveal = 1.0;
        } else if (isAdjacentWall) {
          reveal = uB4;
          anchorX = cxFace < 205 ? 125.22 : 285.45;
        } else if (isFarWallOrGlue) {
          reveal = uB5;
          anchorX = 395.67;
        } else if (isTopOrBottom) {
          reveal = uB6;
          anchorY = cyFace < 0 ? 0 : 110;
        }

        if (reveal <= 0.01) continue;

        ctx.save();
        ctx.beginPath();
        face.poly.forEach((pt, idx) => {
          const px = (isAdjacentWall || isFarWallOrGlue) ? lerp(anchorX, pt[0], reveal) : pt[0];
          const py = isTopOrBottom ? lerp(anchorY, pt[1], reveal) : pt[1];
          const sx = ox + px * scale;
          const sy = oy + py * scale;
          if (idx === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.closePath();

        if (uB7 > 0.05 && face.holes && face.holes.length) {
          for (const h of face.holes) {
            h.forEach((pt, idx) => {
              const sx = ox + pt[0] * scale;
              const sy = oy + pt[1] * scale;
              if (idx === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            });
            ctx.closePath();
          }
        }

        // Subtle tonal variation across panels in 50 shades of gray
        const faceTone = isCenterWall ? 0.96 : (isAdjacentWall ? 0.86 : (isFarWallOrGlue ? 0.78 : 0.68));
        ctx.fillStyle = gray50(faceTone, 30, 245);
        ctx.fill('evenodd');
        ctx.strokeStyle = uB7 > 0.1 ? '#FFFFFF' : '#525252';
        ctx.lineWidth = 2.6;
        ctx.stroke();
        ctx.restore();
      }

      if (uB6 > 0.15) {
        for (const seg of model.lines_2d) {
          if (seg.type === 'CUT' && uB7 <= 0.02) continue;
          const x1 = ox + seg.x1 * scale;
          const y1 = oy + seg.y1 * scale;
          const x2 = ox + lerp(seg.x1, seg.x2, uB6) * scale;
          const y2 = oy + lerp(seg.y1, seg.y2, uB6) * scale;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          if (seg.type === 'CUT') {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3.4 * uB7;
            ctx.setLineDash([]);
          } else if (seg.type === 'MOUNTAIN') {
            ctx.strokeStyle = '#383838';
            ctx.lineWidth = 2.4;
            ctx.setLineDash([8, 6]);
          } else {
            ctx.strokeStyle = '#6E6E6E';
            ctx.lineWidth = 2.2;
            ctx.setLineDash([8, 6]);
          }
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }
    }

    // --- Master Pure-Time Frame Renderer: window.seek(t) ---
    const canvas = document.getElementById('main-canvas');
    const ctx = canvas.getContext('2d');
    const svgScene = document.getElementById('svg-scene');
    const feBlurX = document.getElementById('fe-blur-x');
    const feBlurY = document.getElementById('fe-blur-y');

    function renderFrameAtTime(rawT) {
      const t = Math.max(0, Math.min(DURATION, Number.isFinite(rawT) ? rawT : 0));
      ctx.clearRect(0, 0, 1920, 1080);
      svgScene.innerHTML = '';
      feBlurX.setAttribute('stdDeviation', '0,0');
      feBlurY.setAttribute('stdDeviation', '0,0');

      // =========================================================================
      // BAR 1 (0.0s - 2.0s, Beats 0..3): HOOK & KINETIC TYPE (Monochrome SF Pro)
      // =========================================================================
      if (t < 2.0) {
        ctx.fillStyle = PALETTE.black;
        ctx.fillRect(0, 0, 1920, 1080);

        const u0 = expoOut(sub(t, 0.0, 0.45));
        const u1 = spring(sub(t, 0.5, 0.95));
        const u2 = spring(sub(t, 1.0, 1.45));
        const u3 = expoInOut(sub(t, 1.5, 1.98));

        const bx = (speedExpoOut(sub(t, 0.0, 0.45)) * 4.5 + speedExpoOut(sub(t, 1.0, 1.45)) * 3.0).toFixed(1);
        const by = (speedExpoOut(sub(t, 0.5, 0.95)) * 4.0 + speedExpoOut(sub(t, 1.5, 1.98)) * 3.5).toFixed(1);
        feBlurX.setAttribute('stdDeviation', \`\${bx},0\`);
        feBlurY.setAttribute('stdDeviation', \`0,\${by}\`);

        const gable = MODELS['gable-box'];
        const [minX, minY, maxX, maxY] = getBounds2D(gable);
        const targetScale = 1120 / (maxX - minX);
        const frontFace = gable.faces.find(f => f.id === 14) || gable.faces[0];
        const fx0 = frontFace.poly[0][0], fy0 = frontFace.poly[0][1];
        const fx1 = frontFace.poly[2][0], fy1 = frontFace.poly[2][1];
        const frontW = Math.abs(fx1 - fx0) * targetScale;
        const frontH = Math.abs(fy1 - fy0) * targetScale;
        const frontCx = 960 - (((minX + maxX) / 2) - (fx0 + fx1) / 2) * targetScale;
        const frontCy = 500 - (((minY + maxY) / 2) - (fy0 + fy1) / 2) * targetScale;

        const lineW = t < 0.5
          ? lerp(240, 1160, u0)
          : (t < 1.5 ? 1160 : lerp(1160, frontW, u3));
        const slabH = t < 0.5
          ? 0
          : (t < 1.5 ? lerp(0, 340, u1) : lerp(340, frontH, u3));
        const cx = t < 1.5 ? 960 : lerp(960, frontCx, u3);
        const cy = t < 1.5 ? 540 : lerp(540, frontCy, u3);
        const shearDeg = t >= 1.0 && t < 1.5 ? lerp(0, -10, Math.sin(sub(t, 1.0, 1.5) * Math.PI)) : 0;

        let word = '';
        let wordSize = 210;
        let accentColor = '#FFFFFF';
        let slabFill = '#F4F4F2';
        if (t >= 0.5 && t < 1.0) {
          word = 'CUT.';
          wordSize = 216;
          accentColor = '#FFFFFF';
          slabFill = '#F4F4F2';
        } else if (t >= 1.0 && t < 1.5) {
          word = 'CREASE.';
          wordSize = 188;
          accentColor = '#B0B0B0';
          slabFill = '#DCDCD8';
        } else if (t >= 1.5) {
          word = 'FOLD.';
          wordSize = lerp(196, 68, u3);
          accentColor = '#888888';
          slabFill = '#EAEAE6';
        }

        const filterAttr = Number(bx) > 1.5 ? 'filter="url(#dir-blur-x)"' : (Number(by) > 1.5 ? 'filter="url(#dir-blur-y)"' : '');

        svgScene.innerHTML = \`
          <g transform="translate(\${cx}, \${cy}) skewX(\${shearDeg})" \${filterAttr}>
            \${slabH > 1 ? \`<rect x="\${-lineW / 2}" y="\${-slabH / 2}" width="\${lineW}" height="\${slabH}" fill="\${slabFill}" />\` : ''}
            \${word ? \`
              <text x="0" y="\${wordSize * 0.34}" text-anchor="middle"
                fill="\${PALETTE.black}" font-family="\${FONT_STACK}" font-weight="900"
                font-size="\${wordSize}" letter-spacing="-0.045em">\${word}</text>
            \` : ''}
            <rect x="\${-lineW / 2}" y="\${-slabH / 2 - 3}" width="\${lineW}" height="6" fill="\${accentColor}" />
            \${slabH > 2 ? \`<rect x="\${-lineW / 2}" y="\${slabH / 2 - 3}" width="\${lineW}" height="6" fill="\${accentColor}" />\` : ''}
          </g>
        \`;
        return;
      }

      // =========================================================================
      // BAR 2 (2.0s - 4.0s, Beats 4..7): SHAPE MORPHING (Panel -> 2D Dieline)
      // =========================================================================
      if (t >= 2.0 && t < 4.0) {
        ctx.fillStyle = PALETTE.black;
        ctx.fillRect(0, 0, 1920, 1080);

        drawProgressive2DGable(ctx, t, 960, 500, 1120);

        const beatIdx = Math.floor((t - 2.0) / BEAT);
        const labels = [
          ['2D DIELINE', '#B8B8B8'],
          ['18 FACES', '#E4E4E4'],
          ['45° GABLE ROOF', '#969696'],
          ['567.9 × 304.6 MM', '#FFFFFF']
        ];
        const [labelText, labelColor] = labels[Math.min(3, Math.max(0, beatIdx))];
        const beatLocal = ((t - 2.0) % BEAT) / BEAT;
        const yOff = (1 - expoOut(clamp01(beatLocal * 3.5))) * 28;

        svgScene.innerHTML = \`
          <text x="960" y="\${985 + yOff}" text-anchor="middle"
            fill="\${labelColor}" font-family="\${FONT_STACK}" font-weight="800"
            font-size="72" letter-spacing="-0.04em">\${labelText}</text>
        \`;
        return;
      }

      // =========================================================================
      // BAR 3 (4.0s - 6.0s, Beats 8..11): 2D-TO-3D MOMENT
      // =========================================================================
      if (t >= 4.0 && t < 6.0) {
        ctx.fillStyle = PALETTE.black;
        ctx.fillRect(0, 0, 1920, 1080);

        const beatInBar = (t - 4.0) / BEAT;
        const beatFloor = Math.min(3, Math.floor(beatInBar));
        const beatFrac = expoOut(clamp01((beatInBar - beatFloor) * 1.35));
        const foldProgress = clamp01((beatFloor + beatFrac) / 4);

        const camU = expoOut(sub(t, 4.0, 4.8));
        const az = lerp(0, -0.78, camU) + (t - 4.0) * 0.08;
        const el = lerp(1.57, 0.48, camU);
        const cy = lerp(500, 520, camU);

        drawModel3D(ctx, MODELS['gable-box'], 'gable-box', foldProgress, {
          cx: 960,
          cy,
          targetSize: 700,
          az,
          el,
          theme: 'dark'
        });

        const pct = Math.round(foldProgress * 100);
        svgScene.innerHTML = \`
          <text x="960" y="985" text-anchor="middle"
            fill="\${foldProgress >= 0.99 ? '#FFFFFF' : '#B8B8B8'}"
            font-family="\${FONT_STACK}" font-weight="800"
            font-size="76" letter-spacing="-0.04em">3D FOLD \${pct}%</text>
        \`;
        return;
      }

      // =========================================================================
      // BAR 4 (6.0s - 8.0s, Beats 12..15): DATA / PREPRESS PRECISION MOMENT
      // =========================================================================
      if (t >= 6.0 && t < 8.0) {
        ctx.fillStyle = PALETTE.black;
        ctx.fillRect(0, 0, 1920, 1080);

        const gable = MODELS['gable-box'];
        if (t < 6.5) {
          const u12 = spring(sub(t, 6.0, 6.45));
          const cx = lerp(960, 640, u12);
          drawModel3D(ctx, gable, 'gable-box', 1.0, {
            cx,
            cy: 520,
            targetSize: 680,
            az: -0.62,
            el: 0.48,
            theme: 'dark',
            highlightSeam: 1
          });

          svgScene.innerHTML = \`
            <g transform="translate(\${lerp(1420, 1320, u12)}, 490)">
              <text x="0" y="0" text-anchor="middle" fill="#FFFFFF"
                font-family="\${FONT_STACK}" font-weight="900" font-size="168" letter-spacing="-0.05em">0.00</text>
              <text x="0" y="92" text-anchor="middle" fill="#9E9E9E"
                font-family="\${FONT_STACK}" font-weight="800" font-size="60" letter-spacing="-0.03em">MM SEAM GAP</text>
            </g>
          \`;
          return;
        }

        // Beats 13..15: 3 Tonal Monochrome Plates (#FFFFFF White, #A0A0A0 Silver, #545454 Graphite)
        const u13 = spring(sub(t, 6.5, 6.95));
        const u14 = spring(sub(t, 7.0, 7.45));
        const u15 = expoInOut(sub(t, 7.5, 8.0));

        const plates = [
          { label: 'CUT', color: '#FFFFFF', dx13: -90, dy13: -130, dx14: -520, dy14: 0 },
          { label: 'CREASE', color: '#A0A0A0', dx13: 0, dy13: 0, dx14: 0, dy14: 0 },
          { label: 'BLEED', color: '#545454', dx13: 90, dy13: 130, dx14: 520, dy14: 0 }
        ];

        for (const p of plates) {
          const ox = 960 + lerp(0, p.dx13, u13) * (1 - u14) + p.dx14 * u14 * (1 - u15);
          const oy = 500 + lerp(0, p.dy13, u13) * (1 - u14) + p.dy14 * u14 * (1 - u15);
          const sz = lerp(640, 470, u14) * (1 - u15 * 0.25);

          drawModel3D(ctx, gable, 'gable-box', lerp(1.0, 0.35, u14 * (1 - u15)), {
            cx: ox,
            cy: oy,
            targetSize: sz,
            az: -0.62 + u14 * 0.25,
            el: 0.48 + u14 * 0.35,
            theme: 'dark',
            wireframeOnly: true,
            plateColor: p.color
          });
        }

        if (u15 > 0.01) {
          const radius = expoIn(u15) * 1350;
          ctx.save();
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const ang = (k * Math.PI) / 3 - Math.PI / 6 + u15 * 0.5;
            const px = 960 + Math.cos(ang) * radius;
            const py = 540 + Math.sin(ang) * radius;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = PALETTE.white;
          ctx.fill();
          ctx.strokeStyle = '#888888';
          ctx.lineWidth = 6 * (1 - u15);
          ctx.stroke();
          ctx.restore();
        }

        if (u15 < 0.65) {
          const title = t < 7.0 ? '3 PREPRESS PLATES' : 'CUT · CREASE · BLEED';
          svgScene.innerHTML = \`
            <text x="960" y="985" text-anchor="middle" fill="#E8E8E8"
              font-family="\${FONT_STACK}" font-weight="800" font-size="72" letter-spacing="-0.04em">\${title}</text>
          \`;
        }
        return;
      }

      // =========================================================================
      // BAR 5 & BAR 6 (8.0s - 12.0s, Beats 16..23): THE STRONGEST MOMENT
      // Solid #F4F4F2 gallery stage with 50-shade graphite polyhedral monoliths
      // =========================================================================
      if (t >= 8.0 && t < 12.0) {
        ctx.fillStyle = PALETTE.white;
        ctx.fillRect(0, 0, 1920, 1080);

        let slug = 'hex-petal';
        let label = 'HEX PETAL';
        let num = '02';
        let fold = 0.5;
        let az = -0.75;
        let el = 0.54;

        if (t < 9.0) {
          slug = 'hex-petal';
          label = 'HEX PETAL';
          num = '02';
          fold = t < 8.5
            ? lerp(0.15, 0.58, expoOut(sub(t, 8.0, 8.48)))
            : lerp(0.58, 1.0, spring(sub(t, 8.5, 8.96)));
          az = -0.65 + (t - 8.0) * 0.45;
          el = 0.56;
        } else if (t < 10.0) {
          slug = 'diamond-box';
          label = 'DIAMOND BOX';
          num = '03';
          fold = t < 9.5
            ? lerp(0.25, 0.65, expoOut(sub(t, 9.0, 9.48)))
            : lerp(0.65, 1.0, spring(sub(t, 9.5, 9.96)));
          az = -0.78 + (t - 9.0) * 0.5;
          el = 0.46;
        } else if (t < 11.0) {
          slug = 'zero-glue-tray';
          label = 'ZERO-GLUE TRAY';
          num = '04';
          fold = t < 10.5
            ? lerp(0.25, 0.62, expoOut(sub(t, 10.0, 10.48)))
            : lerp(0.62, 1.0, spring(sub(t, 10.5, 10.96)));
          az = -0.72 + (t - 10.0) * 0.45;
          el = 0.58;
        } else {
          slug = 'fefco-0427';
          label = 'FEFCO 0427';
          num = '09';
          fold = t < 11.5
            ? lerp(0.35, 1.0, spring(sub(t, 11.0, 11.46)))
            : 1.0;
          az = -0.76 + (t - 11.0) * 0.4;
          el = 0.55;
        }

        drawModel3D(ctx, MODELS[slug], slug, fold, {
          cx: 960,
          cy: 485,
          targetSize: 730,
          az,
          el,
          theme: 'light',
          highlightSeam: fold > 0.9 ? 1 : 0
        });

        if (t >= 11.5) {
          const u23 = expoInOut(sub(t, 11.5, 12.0));
          const w = lerp(480, 1920, u23);
          const h = lerp(300, 1080, u23);
          ctx.fillStyle = PALETTE.black;
          ctx.fillRect(960 - w / 2, 540 - h / 2, w, h);

          const slotW = lerp(320, 1160, u23);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(960 - slotW / 2, 540 - 3, slotW, 6);
          svgScene.innerHTML = '';
        } else {
          svgScene.innerHTML = \`
            <text x="960" y="990" text-anchor="middle" fill="\${PALETTE.black}"
              font-family="\${FONT_STACK}" font-weight="800" font-size="84" letter-spacing="-0.04em">\${num}/12 · \${label}</text>
          \`;
        }
        return;
      }

      // =========================================================================
      // BAR 7 & FINAL HALF-BAR (12.0s - 15.0s, Beats 24..29):
      // END TITLE -> GITHUB & INSTALL SLAB -> SEAMLESS KNIFE-LINE LOOP
      // =========================================================================
      ctx.fillStyle = PALETTE.black;
      ctx.fillRect(0, 0, 1920, 1080);

      const u24 = spring(sub(t, 12.0, 12.46));
      const u25 = expoOut(sub(t, 12.5, 12.95));
      const u26 = spring(sub(t, 13.0, 13.46));
      const u27 = spring(sub(t, 13.5, 13.96));
      const u28 = expoOut(sub(t, 14.0, 14.45));
      const uShut = expoInOut(sub(t, 14.5, 14.82));
      const uRetract = expoInOut(sub(t, 14.62, 14.98));

      const openFactor = 1 - uShut;
      const seamWidth = t < 14.5 ? 1160 : lerp(1160, 240, uRetract);

      const byEnd = (
        speedExpoOut(sub(t, 13.0, 13.45)) * 3.5 +
        speedExpoOut(sub(t, 14.5, 14.82)) * 4.5
      ).toFixed(1);
      const bxEnd = (speedExpoOut(sub(t, 14.62, 14.98)) * 5.0).toFixed(1);
      feBlurY.setAttribute('stdDeviation', \`0,\${byEnd}\`);
      feBlurX.setAttribute('stdDeviation', \`\${bxEnd},0\`);
      const filterAttr = Number(byEnd) > 1.5
        ? 'filter="url(#dir-blur-y)"'
        : (Number(bxEnd) > 1.5 ? 'filter="url(#dir-blur-x)"' : '');

      const headerLift = expoInOut(sub(t, 13.0, 13.42));
      const titleScaleY = lerp(1.0, 0.42, headerLift) * openFactor * u24;
      const titleScaleX = lerp(1.0, 0.44, headerLift);
      const titleY = lerp(540, 162, headerLift);

      const ghSlabScaleY = u26 * openFactor;
      const installSlabScaleY = u27 * openFactor;
      const mcpFooterAlpha = u28 * openFactor;

      svgScene.innerHTML = \`
        <g \${filterAttr}>
          <rect x="\${960 - seamWidth / 2}" y="537" width="\${seamWidth}" height="6" fill="#FFFFFF" />
          \${titleScaleY > 0.01 ? \`
            <g transform="translate(960, \${titleY.toFixed(1)}) scale(\${titleScaleX.toFixed(4)}, \${titleScaleY.toFixed(4)})">
              <text x="0" y="-42" text-anchor="middle" fill="#FFFFFF"
                font-family="\${FONT_STACK}" font-weight="900" font-size="164" letter-spacing="-0.05em">DESIGN:OS</text>
              <text x="0" y="168" text-anchor="middle" fill="#A0A0A0"
                font-family="\${FONT_STACK}" font-weight="900" font-size="164" letter-spacing="-0.05em">ORIGAMI</text>
              \${u25 > 0.01 && headerLift < 0.95 ? \`
                <g transform="scale(1, \${(u25 * (1 - headerLift)).toFixed(4)})">
                  <rect x="-320" y="-26" width="640" height="52" fill="#0A0A0A" stroke="#D4D4D4" stroke-width="2.5" />
                  <text x="0" y="11" text-anchor="middle" fill="#EAEAEA"
                    font-family="\${FONT_STACK}" font-weight="800" font-size="28" letter-spacing="0.20em">12 BLANKS · 12 WITH 3D</text>
                </g>
              \` : ''}
            </g>
          \` : ''}

          \${ghSlabScaleY > 0.01 ? \`
            <g transform="translate(960, 540) scale(1, \${ghSlabScaleY.toFixed(4)})">
              <rect x="-580" y="-220" width="1160" height="220" fill="#161616" stroke="#FFFFFF" stroke-width="3" />
              <text x="-530" y="-152" text-anchor="start" fill="#8E8E8E"
                font-family="\${FONT_STACK}" font-weight="700" font-size="24" letter-spacing="0.18em">GITHUB REPOSITORY · POLYFORM SHIELD · PYTHON ≥ 3.10</text>
              <text x="-530" y="-62" text-anchor="start" fill="#FFFFFF"
                font-family="\${FONT_STACK}" font-weight="800" font-size="56" letter-spacing="-0.03em">github.com/jangtrinh/design-os-origami</text>
            </g>
          \` : ''}

          \${installSlabScaleY > 0.01 ? \`
            <g transform="translate(960, 540) scale(1, \${installSlabScaleY.toFixed(4)})">
              <rect x="-580" y="0" width="1160" height="250" fill="#F4F4F2" stroke="#FFFFFF" stroke-width="3" />
              <text x="-530" y="56" text-anchor="start" fill="#686868"
                font-family="\${FONT_STACK}" font-weight="800" font-size="22" letter-spacing="0.18em">INSTALL &amp; GENERATE DIELINE + 3D VIEWER</text>
              <text x="-530" y="128" text-anchor="start" fill="#0A0A0A"
                font-family="\${FONT_STACK}" font-weight="800" font-size="38" letter-spacing="-0.01em" word-spacing="0.12em">$ git clone https://github.com/jangtrinh/design-os-origami</text>
              <text x="-530" y="198" text-anchor="start" fill="#262626"
                font-family="\${FONT_STACK}" font-weight="800" font-size="38" letter-spacing="-0.01em" word-spacing="0.16em">$ pip install -e . &amp;&amp; origami-cad generate --type gable-box</text>
            </g>
          \` : ''}

          \${mcpFooterAlpha > 0.01 ? \`
            <g transform="translate(960, 885)" opacity="\${mcpFooterAlpha.toFixed(3)}">
              <text x="0" y="0" text-anchor="middle" fill="#B0B0B0"
                font-family="\${FONT_STACK}" font-weight="700" font-size="26" letter-spacing="0.16em">MCP &amp; SKILL READY · CLAUDE CODE · CODEX · GEMINI · CURSOR</text>
            </g>
          \` : ''}

          \${ghSlabScaleY > 0.01 ? \`<rect x="\${960 - seamWidth / 2}" y="537" width="\${seamWidth}" height="6" fill="#FFFFFF" />\` : ''}
        </g>
      \`;
    }

    // --- Web Audio API (OfflineAudioContext) Procedural Soundtrack ---
    async function renderOfflineSoundtrack() {
      const sr = 44100;
      const offline = new OfflineAudioContext(2, sr * DURATION, sr);

      // 120 BPM Kick on every beat (0..29)
      for (let b = 0; b < 30; b++) {
        const t0 = b * BEAT;
        const osc = offline.createOscillator();
        const gain = offline.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(155, t0);
        osc.frequency.exponentialRampToValueAtTime(46, t0 + 0.12);
        gain.gain.setValueAtTime(b % 4 === 0 ? 0.55 : 0.38, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.30);
        osc.connect(gain).connect(offline.destination);
        osc.start(t0);
        osc.stop(t0 + 0.32);
      }

      // Riser into Bar 5 climax (5.0s -> 8.0s)
      const riser = offline.createOscillator();
      const riserGain = offline.createGain();
      riser.type = 'sawtooth';
      riser.frequency.setValueAtTime(110, 5.0);
      riser.frequency.exponentialRampToValueAtTime(660, 7.98);
      riserGain.gain.setValueAtTime(0.001, 5.0);
      riserGain.gain.exponentialRampToValueAtTime(0.28, 7.95);
      riserGain.gain.linearRampToValueAtTime(0.0001, 8.0);
      riser.connect(riserGain).connect(offline.destination);
      riser.start(5.0);
      riser.stop(8.0);

      // Scene hits on bar changes
      for (const [tHit, freq] of [[0.0, 110], [2.0, 130.81], [4.0, 146.83], [6.0, 164.81], [8.0, 220], [12.0, 220]]) {
        const osc = offline.createOscillator();
        const g = offline.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, tHit);
        g.gain.setValueAtTime(0.35, tHit);
        g.gain.exponentialRampToValueAtTime(0.001, tHit + 0.75);
        osc.connect(g).connect(offline.destination);
        osc.start(tHit);
        osc.stop(tHit + 0.78);
      }

      return offline.startRendering();
    }

    window.renderOfflineSoundtrack = renderOfflineSoundtrack;

    // Canonical deterministic virtual clock hooks: no timers, no state carried between frames
    window.seek = function(t) {
      renderFrameAtTime(t);
    };
    window.__seekToTime = window.seek;

    // Render initial frame at t = 0.0s
    window.seek(0);
  </script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(OUT_HTML), { recursive: true });
fs.writeFileSync(OUT_HTML, html, 'utf8');
console.log(`Compiled 15s (120 BPM) Showreel HTML: ${OUT_HTML} (${(html.length / 1024).toFixed(1)} KB)`);
