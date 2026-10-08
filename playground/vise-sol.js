// A machine vise: one constrained screw drives the jaw and the offset crank.
const {
  Cam, circ, clamp, facing, fillet, fit, hull, mk, open, poly, prism,
  proj, put, rings, rrect, run, seg, solid, spring, stepS, unproj,
  disposer, pointer, register,
} = HL;

function mount({ stage, svg, read }, value) {
  const bag = disposer(), C = Cam(45, 0.5, 1.85);
  // Include the whole crank sweep, not just the angle shown at rest.
  fit(C, [[-66, -25, -5], [-66, 25, -5], [57, -25, -5],
    [57, 25, -5], [-55, -18, 56], [95, -25, 4], [95, 25, 54]], 200, 166);
  const P = proj(C), front = facing(C), root = mk("g", {}, svg);
  let reach = clamp(value, 16, 48), active = false, lastGap = NaN;
  const gap = spring(reach * 0.62);
  const box = (g, x0, y0, x1, y1, z0, z1, r = 2) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, 0.65);
    const el = solid(g); put(el, prism(P, front, ring, inner, z0, z1)); return el;
  };
  const line = (g, points) => mk("path", { d: open(points), class: "nf lo" }, g);
  const yz = (x, y, z, radius) => circ(radius, 32).map(q => P(x, y + q.u, z + q.v));
  const tube = (g, x0, x1, y, z, radius) => {
    const el = solid(g);
    put(el, { sil: poly(hull(yz(x0, y, z, radius).concat(yz(x1, y, z, radius)))),
      crease: poly(yz(x1 - 0.4, y, z, radius - 0.45)) });
    return el;
  };
  const screwMark = (g, x, y, z, r = 1.1) =>
    mk("path", { d: poly(yz(x, y, z, r)), class: "nf lo" }, g);
  const foot = (g, x) => {
    box(g, x - 5, -20, x + 10, 20, 0, 3, 2.5);
    // An actual reinforcing web, filleted in its own X/Z plane.
    const profile = fillet([[x - 3, 3], [x + 9, 3], [x + 4, 25], [x + 1, 25]], [1, 1, 1, 1]);
    const a = profile.map(q => P(q[0], 17, q[1])), b = profile.map(q => P(q[0], 19, q[1]));
    put(solid(g), { sil: poly(hull(a.concat(b))), crease: open(b.slice(1, 6)) });
    box(g, x - 2, 14, x + 3, 19, 3, 6, 1.6);
  };

  box(root, -66, -25, 57, 25, -5, 0, 4);
  for (const [x, y] of [[-59, -19], [49, -19], [-59, 19], [49, 19]]) {
    box(root, x - 3.4, y - 3.4, x + 3.4, y + 3.4, 0, 1.4, 3);
    box(root, x - 2.5, y - 2.5, x + 2.5, y + 2.5, 1.4, 4.8, 1.2);
  }
  for (const x of [-49, 39]) box(root, x - 1.3, 19, x + 1.3, 21.6, 0, 4, 1.2);

  const fixed = mk("g", {}, root);
  foot(fixed, -53);
  box(fixed, -55, -18, -43, 18, 3, 55, 2.2);
  // A thin jaw insert has a rounded face and a single thickness seam.
  const pad = rrect(-16, 40, 16, 54, 1.2, 6).map(q => P(-42.7, q.u, q.v));
  mk("path", { d: poly(pad), class: "sil" }, fixed);
  line(fixed, [P(-44, 16, 41), P(-44, 16, 53), P(-42.7, 16, 53)]);
  for (const y of [-10, 10]) screwMark(fixed, -42.6, y, 47, 1.4);
  for (const y of [-5, 0, 5]) line(fixed, [P(-42.6, y - 2, 41), P(-42.6, y + 2, 53)]);

  // Shafts are painted before the castings that conceal them.
  const shafts = mk("g", {}, root);
  for (const [y, z, r] of [[-12, 24, 2], [0, 29, 2.7], [12, 24, 2]]) {
    tube(shafts, -42, 48, y, z, r);
  }
  const thread = mk("path", { class: "nf lo" }, shafts);
  const moving = mk("g", {}, root);
  const sole = solid(moving), tower = solid(moving), shoulder = solid(moving), crown = solid(moving);
  const web = solid(moving), bolt = solid(moving);
  const bearing = mk("g", {}, root);
  box(bearing, 42, -9, 55, 9, 0, 5, 2);
  box(bearing, 45, -16, 53, 16, 5, 28, 2);
  tube(bearing, 43, 57, 0, 29, 6.5);
  screwMark(bearing, 53.1, 0, 11, 1.5);
  const crank = mk("g", {}, root);
  tube(crank, 57, 65, 0, 29, 4.5);
  screwMark(crank, 65.1, 0, 29, 1.3);
  const arm = solid(crank), grip = solid(crank);

  const updateBox = (el, x0, y0, x1, y1, z0, z1, r) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, 0.65);
    put(el, prism(P, front, ring, inner, z0, z1));
  };
  function draw() {
    const d = clamp(gap.x, 0, reach);
    if (d === lastGap) return;
    lastGap = d;
    const x = -42.7 + d;
    updateBox(sole, x, -20, x + 23, 20, 0, 3, 2.5);
    updateBox(tower, x, -18, x + 18, 18, 3, 49, 2.3);
    updateBox(shoulder, x + 18, -14, x + 26, 14, 3, 36, 2);
    // Tapered chamfered crown: different foot/top rings, no vertical corners.
    const low = rrect(x, -18, x + 21, 18, 2.3, 6);
    const top = rrect(x + 2, -16, x + 18, 16, 1.8, 6);
    const inner = rrect(x + 2.7, -15.3, x + 17.3, 15.3, 1.1, 6);
    put(crown, { sil: poly(hull(low.map(q => P(q.u, q.v, 49)).concat(top.map(q => P(q.u, q.v, 55))))),
      crease: open(run(inner, front).map(q => P(q.u, q.v, 55))) });
    const rib = fillet([[x + 16, 3], [x + 23, 3], [x + 20, 25], [x + 17, 25]], [1, 1, 1, 1]);
    put(web, { sil: poly(hull(rib.map(q => P(q[0], 19, q[1])).concat(rib.map(q => P(q[0], 17, q[1]))))), crease: "" });
    updateBox(bolt, x + 1, 14, x + 6, 19, 3, 6, 1.6);
    const marks = [];
    for (let sx = -43 + ((d % 3.5) + 3.5) % 3.5; sx < 43; sx += 3.5) {
      if (sx < -41) continue;
      if (sx > x - 1 && sx < x + 27) continue;
      marks.push(seg(P(sx, -2, 30.6), P(sx + 1.2, 2, 27.4)));
    }
    thread.setAttribute("d", marks.join(""));
    // Screw pitch couples jaw travel to rotation; the grip stays on its spindle.
    const angle = 0.9 + (d - 23.56) * Math.PI * 2 / 3.5;
    const y = 22 * Math.cos(angle), z = 29 - 22 * Math.sin(angle);
    const profile = fillet([[0, -2], [22, -1.7], [22, 1.7], [0, 2]], [1.4, 1.4, 1.4, 1.4]);
    const face = (xx) => profile.map(([u, v]) => P(xx, u * Math.cos(angle) - v * Math.sin(angle),
      29 - u * Math.sin(angle) - v * Math.cos(angle)));
    put(arm, { sil: poly(hull(face(63).concat(face(65)))), crease: "" });
    put(grip, { sil: poly(hull(yz(64, y, z, 2.5).concat(yz(84, y, z, 2.5)))),
      crease: poly(yz(83.6, y, z, 2)) });
  }
  // One semantic highlight: the jaw insert at rest, the sliding jaw on input.
  const restMark = mk("path", { d: open(pad.slice(0, 13)), class: "nf sil hi" }, fixed);
  function aim(p) {
    const q = p ? unproj(C, p[0], p[1], 55) : null;
    active = !!q && q[0] >= -44 && q[0] <= 31 && Math.abs(q[1]) <= 22;
    gap.t = active ? clamp(q[0] + 42.7, 0, reach) : reach * 0.62;
    restMark.classList.toggle("hi", !active);
    crown.sil.classList.toggle("hi", active);
    read.textContent = active ? "jaw" : "rest";
    B.wake();
  }
  draw(); read.textContent = "rest";
  const B = register(stage, dt => { const movingNow = stepS(gap, dt); draw(); return movingNow; });
  bag.add(B.unregister);
  bag.add(pointer(stage, { move: aim, leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());
  return { set: v => { reach = clamp(v, 16, 48); gap.t = active ? clamp(gap.t, 0, reach) : reach * 0.62; B.wake(); },
    destroy: bag.dispose };
}

hairline({
  name: "vise-sol",
  means: "A machine vise: the sliding jaw follows the pointer while the screw drives an offset crank.",
  rules: [1, 3, 4, 6, 7, 8, 9], range: [16, 38, 48], mount,
});
