/**
 * Spanning-Tree Rigid-Panel 3D Kinematic Solver & Occlusion-Clean Monochrome Renderer
 *
 * Solves arbitrary planar polygon trees folded across 3D hinge axes (`rotateAroundAxis`)
 * and renders them with back-to-front Painter's Algorithm perimeter stroking so hidden
 * back-face hinges never bleed through front faces.
 */

import { clamp01, gray50 } from '../runtime/velocity-blur.mjs';

/**
 * Rodrigues' rotation formula around an arbitrary 3D axis passing through a1 -> a2.
 */
export function rotateAroundAxis(pt, a1, a2, angleRad) {
  const ux = a2[0] - a1[0];
  const uy = a2[1] - a1[1];
  const uz = a2[2] - a1[2];
  const len = Math.hypot(ux, uy, uz) || 1;
  const kx = ux / len;
  const ky = uy / len;
  const kz = uz / len;

  const px = pt[0] - a1[0];
  const py = pt[1] - a1[1];
  const pz = pt[2] - a1[2];

  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  const dot = kx * px + ky * py + kz * pz;

  const cx = ky * pz - kz * py;
  const cy = kz * px - kx * pz;
  const cz = kx * py - ky * px;

  return [
    a1[0] + px * c + cx * s + kx * dot * (1 - c),
    a1[1] + py * c + cy * s + ky * dot * (1 - c),
    a1[2] + pz * c + cz * s + kz * dot * (1 - c)
  ];
}

export function polyNormal(pts) {
  if (!pts || pts.length < 3) return [0, 0, 1];
  const ax = pts[1][0] - pts[0][0];
  const ay = pts[1][1] - pts[0][1];
  const az = pts[1][2] - pts[0][2];
  const bx = pts[2][0] - pts[0][0];
  const by = pts[2][1] - pts[0][1];
  const bz = pts[2][2] - pts[0][2];
  const nx = ay * bz - az * by;
  const ny = az * bx - ax * bz;
  const nz = ax * by - ay * bx;
  const l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}

/**
 * Solves 3D vertex positions for a hinged polygon tree at foldProgress in [0, 1].
 */
export function solveRigidFold3D(model, foldProgress, signOverride = 1) {
  const p = clamp01(foldProgress);
  const childrenMap = new Map();
  for (const h of model.hinges || []) {
    if (!childrenMap.has(h.parent)) childrenMap.set(h.parent, []);
    childrenMap.get(h.parent).push(h);
  }

  const transforms = new Map();
  transforms.set(model.root_face, (pt) => pt);

  const queue = [model.root_face];
  const visited = new Set([model.root_face]);

  while (queue.length > 0) {
    const parentId = queue.shift();
    const parentFn = transforms.get(parentId);
    const edges = childrenMap.get(parentId) || [];
    for (const h of edges) {
      if (visited.has(h.child)) continue;
      visited.add(h.child);
      const rad = ((h.angle * Math.PI) / 180) * p * signOverride;
      const a1Base = [h.p1[0], h.p1[1], 0];
      const a2Base = [h.p2[0], h.p2[1], 0];
      const childFn = (pt) => {
        const a1 = parentFn(a1Base);
        const a2 = parentFn(a2Base);
        const pParent = parentFn(pt);
        return rotateAroundAxis(pParent, a1, a2, rad);
      };
      transforms.set(h.child, childFn);
      queue.push(h.child);
    }
  }

  return model.faces.map((f) => {
    const fn = transforms.get(f.id) || ((pt) => pt);
    const pts3d = f.poly.map(([x, y]) => fn([x, y, 0]));
    const holes3d = (f.holes || []).map((hole) => hole.map(([x, y]) => fn([x, y, 0])));
    return { id: f.id, label: f.label, pts3d, holes3d };
  });
}

/**
 * Renders a solved 3D face list onto a 2D Canvas context using 50 Shades of Gray
 * and per-face perimeter stroking (eliminating hidden-line X-ray bleed).
 */
export function renderMonochrome3D(ctx, faces3d, opts = {}) {
  const {
    cx = 960,
    cy = 520,
    scale = 2.0,
    az = -0.72,
    el = 0.52,
    theme = 'dark'
  } = opts;

  const ca = Math.cos(az), sa = Math.sin(az);
  const ce = Math.cos(el), se = Math.sin(el);

  const project = (pt) => {
    const rx = pt[0] * ca - pt[1] * sa;
    const ry = pt[0] * sa + pt[1] * ca;
    const rz = pt[2];
    const sx = rx;
    const sy = ry * se - rz * ce;
    const depth = ry * ce + rz * se;
    return [cx + sx * scale, cy + sy * scale, depth];
  };

  const sorted = faces3d.map((f) => {
    const proj = f.pts3d.map(project);
    const holesProj = f.holes3d.map((h) => h.map(project));
    const depth = proj.reduce((s, p) => s + p[2], 0) / Math.max(1, proj.length);
    const n = polyNormal(f.pts3d);
    const shade = clamp01(Math.abs(n[0] * -0.45 + n[1] * -0.35 + n[2] * 0.82));
    return { ...f, proj, holesProj, depth, shade };
  }).sort((a, b) => a.depth - b.depth);

  for (const f of sorted) {
    ctx.beginPath();
    f.proj.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
    ctx.closePath();
    for (const h of f.holesProj) {
      if (h.length < 3) continue;
      ctx.moveTo(h[0][0], h[0][1]);
      for (let i = 1; i < h.length; i++) ctx.lineTo(h[i][0], h[i][1]);
      ctx.closePath();
    }
    ctx.fillStyle = theme === 'light'
      ? gray50(0.08 + f.shade * 0.44)
      : gray50(0.24 + f.shade * 0.68);
    ctx.fill('evenodd');
    ctx.strokeStyle = theme === 'light' ? '#F4F4F2' : '#0A0A0A';
    ctx.lineWidth = 2.0;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}
