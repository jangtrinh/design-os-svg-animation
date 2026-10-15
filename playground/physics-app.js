globalThis.LEVER = (function () {
// Lever on the anatomy kit: one moment model tilts a beam that rests on a wedge riding two rails.
const F1 = 20, F2 = 10, X1 = -24, X2 = 24, REST = -8, LIM = 0.16, TOL = 0.03;
const TOP = 4.8, DECK = 9.5, ZB = 18.6, BH = 3.6, DY = 4.2, DISC = 2.15, CAP = 1.2, DISC_R = 3.8;
const RAILS = [-11.5, 8.5];
const STACKS = [[X1, 4], [X2, 2]]; // x, equal discs: F1 = 2 * F2, so d2 = 2 * d1 balances
// Painter's order: a part sits above earlier layers; depth only orders parts inside one layer.
const LAYER = { foot: 0, plate: 1, fitting: 2, screw: 3, bush: 4, deck: 5, upper: 6, beam: 7, load: 8 };
function model(xf) {
  const d1 = xf - X1, d2 = X2 - xf;
  const M1 = F1 * d1 * 0.01, M2 = F2 * d2 * 0.01, net = M1 - M2;
  return { d1, d2, M1, M2, net, theta: LIM * Math.tanh(net / 3.5), balanced: Math.abs(net) < TOL };
}
function readout(m) {
  const a = m.M1.toFixed(1), b = m.M2.toFixed(1);
  if (m.balanced) return `M₁=${a} == M₂=${b} N·m`;
  return m.theta > 0 ? `Lệch trái · M₁=${a}>${b}` : `Lệch phải · M₁=${a}<${b}`;
}
const turn = (x, z, xf, th) => [ // rotates (x, z) about the fulcrum apex (xf, ZB) in the x-z plane
  xf + (x - xf) * Math.cos(th) - (z - ZB) * Math.sin(th),
  ZB + (x - xf) * Math.sin(th) + (z - ZB) * Math.cos(th)
];
const beamPoly = (xf, th) =>
  [[-40, ZB], [40, ZB], [40, ZB + BH], [-40, ZB + BH]].map(([x, z]) => turn(x, z, xf, th));
const frameOf = (half) => ({ o: [0, half, 0], a: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] }); // along y
const mean = (poly, axis) => poly.reduce((sum, p) => sum + p[axis], 0) / poly.length;
const box = (name, x, y, w, d, z, h, tone, layer, r = 0.3) =>
  ({ name, plan: { x, y, w, d, r }, z, h, tone, layer, at: [x + w / 2, y + d / 2, z + h / 2] });
const cyl = (name, x, y, r, z, h, tone, layer) =>
  ({ name, cyl: [x, y, r, z, h], tone, layer, at: [x, y, z + h / 2] });
const prism = (name, poly, half, tone, layer) =>
  ({ name, poly, half, tone, layer, at: [mean(poly, 0), 0, mean(poly, 1)] });

function loadParts({ xf, theta: th }) { // discs ride the beam: axis = beam normal, seated on its top
  const n = [-Math.sin(th), 0, Math.cos(th)], u = [Math.cos(th), 0, Math.sin(th)];
  return STACKS.flatMap(([x, count], s) => {
    const [sx, sz] = turn(x, ZB + BH, xf, th);
    const F = { o: [sx, 0, sz], a: n, u, v: [0, 1, 0] };
    const slice = (name, s0, s1, r, tone, m = (s0 + s1) / 2) => ({
      name, disc: [s0, s1, r, F], tone, layer: "load", at: [sx + n[0] * m, 0, sz + n[2] * m]
    });
    const discs = Array.from({ length: count }, (_, i) =>
      slice(`lever.mass.${s}${i + 1}`, i * DISC, (i + 1) * DISC, DISC_R, "mid"));
    return [...discs, slice(`lever.cap.${s}`, count * DISC, count * DISC + CAP, 1.3, "hi")];
  });
}

function baseParts() {
  return [
    box("base.plate", -76, -26, 152, 52, 1.8, 3, "mid", "plate", 2.4),
    box("base.ruler", -66, 20.4, 132, 5.2, TOP, 1.8, "mid", "fitting"),
    box("base.label", -18, -22.5, 36, 8, TOP, 0.7, "mid", "fitting"),
    ...[-14, 14].map((x, i) =>
      cyl(`base.label-screw.${i + 1}`, x, -18.5, 0.65, TOP + 0.7, 0.55, "hi", "screw")),
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].flatMap(([sx, sy], i) => [ // foot, washer, screw per corner
      box(`stand.foot.${i + 1}`, sx * 60 - 6, sy * 14 - 4, 12, 8, 0, 1.8, "lo", "foot", 0.4),
      cyl(`base.washer.${i + 1}`, sx * 64, sy * 16, 2.05, TOP, 0.55, "mid", "fitting"),
      cyl(`base.screw.${i + 1}`, sx * 64, sy * 16, 1.2, TOP + 0.55, 0.9, "hi", "screw")
    ]),
    ...RAILS.flatMap((y, i) => [
      box(`base.rail.${i + 1}`, -62, y, 124, 3, TOP, 1.4, "mid", "fitting", 0.2),
      ...[-66, 62].flatMap((x) => [
        box(`base.stop.${i}${x}`, x, y, 4, 3, TOP, 2.6, "mid", "fitting", 0.15),
        cyl(`base.stop-screw.${i}${x}`, x + 2, y + 1.5, 0.7, TOP + 2.6, 0.7, "hi", "screw")
      ])
    ])
  ];
}

function carriageParts({ xf, theta: th }) {
  return [
    ...RAILS.map((y, i) => box(`lever.bush.${i + 1}`, xf - 7, y, 14, 3, TOP + 1.4, 1.5, "mid", "bush", 0.15)),
    box("lever.deck", xf - 8, -12, 16, 24, DECK - 1.8, 1.8, "mid", "deck"),
    box("lever.knob-neck", xf - 1.4, 12, 2.8, 2, DECK - 1.8, 1.8, "mid", "upper", 0.4),
    cyl("lever.knob", xf, 16.6, 2.6, DECK - 1.8, 4, "mid", "upper"),
    ...[-6.5, 6.5].map((dx, i) => cyl(`lever.bolt.${i + 1}`, xf + dx, -9, 1, DECK, 0.8, "hi", "upper")),
    prism("lever.wedge", [[xf - 8, DECK], [xf + 8, DECK], [xf, ZB]], 5, "hi", "upper"),
    prism("lever.beam", beamPoly(xf, th), DY, "hi", "beam")
  ];
}
const partsOf = (state) => [...baseParts(), ...carriageParts(state), ...loadParts(state)];
const rankOf = (k, P, part) => LAYER[part.layer] * 1e4 + k.depthOf(part.at, P); // the painter's key
const nf = (tone) => ({ tone, className: "nf" });
const INSET = { x: -68, y: -16, w: 136, d: 32, r: 1.4 };
const pair = (k, minor, major) => k.lineSvg(minor, nf("lo")) + k.lineSvg(major, nf("mid"));
function ticks(k, P, { xf, theta }) {
  const ruler = k.sideTicks(-60, 60, 4, 4, 25.6, TOP + 1.8, [1.15, 1.9], P), beam = { lo: [], hi: [] };
  for (let x = -36; x <= 36; x += 4) {
    const major = x % 8 === 0, [bx, bz] = turn(x, ZB + BH, xf, theta); // from the beam's near edge
    beam[major ? "hi" : "lo"].push(k.segment([bx, DY - (major ? 1.45 : 0.85), bz], [bx, DY, bz], P));
  }
  return { ruler: pair(k, ruler.minor, ruler.major), beam: pair(k, beam.lo.join(""), beam.hi.join("")) };
}
function detail(k, P, part, state, mark) {
  const at = (x, y, z) => k.iso([x, y, z], P);
  if (part.name === "base.plate") return k.lineSvg(k.planOutline(INSET, TOP + 0.02, P, 4), nf("faint"));
  if (part.name === "base.ruler")
    return mark.ruler + k.dotsSvg([-62, 62].map((x) => at(x, 25.6, TOP + 1.8)), { size: 0.7, tone: "hi" });
  if (part.name === "lever.beam") return mark.beam;
  if (part.name === "lever.deck") {
    const holes = [-9.5, 9.5].flatMap((y) => [-5, 5].map((x) => at(state.xf + x, y, DECK)));
    return k.dotsSvg(holes, { size: 0.55, tone: "mid" });
  }
  if (part.name !== "base.label") return "";
  const rules = [-12, -4, 4].map((x) => k.lineOnTop([x, -19.2], [x + 5, -19.2], TOP + 0.78, P)).join("");
  const text = k.faceTextSvg(k.topMatrix([0, -18.6], TOP + 0.78, P), "1:2",
    { size: 2.4, tone: "mid", anchor: "middle" });
  return k.lineSvg(rules, { ...nf("faint"), free: true }) + text;
}
function draw(k, P, part, state, mark) {
  const paths = part.poly ? k.prismOf(frameOf(part.half), part.poly, 0, 2 * part.half, P)
    : part.disc ? k.disc(...part.disc, P)
    : part.cyl ? k.cylinder(...part.cyl, P, 18)
    : k.slabOf(part.plan, part.z, part.h, P, 4);
  const solid = { lit: part.name === `lever.${state.accent}`, tone: part.tone,
    halo: part.name === "base.plate", inner: detail(k, P, part, state, mark) };
  return k.groupSvg(k.solidSvg(paths, solid), { "data-name": part.name });
}
function frame(k) {
  const pts = [[-78, -28, 0], [78, 28, 0], [-78, 28, 30], [78, -28, 30]];
  for (const xf of [-20, REST, 15]) {
    const state = { xf, theta: model(xf).theta };
    beamPoly(xf, state.theta).forEach(([x, z]) => pts.push([x, -DY, z], [x, DY, z]));
    loadParts(state).forEach(({ at, disc: [, , r] }) =>
      pts.push(at.map((c) => c - r), at.map((c) => c + r))); // a cube per disc sizes the view
  }
  const P = k.fitProjection(pts, 400, 320, { pad: 42, azimuth: 45, elevation: 30 });
  return { P, pts, S: P.scale * Math.sqrt(1.6) };
}
const drawn = (k, P, state) => {
  const mark = ticks(k, P, state);
  return partsOf(state).map((part) =>
    ({ part, svg: draw(k, P, part, state, mark), key: rankOf(k, P, part) }));
};
const markup = (k, P, state) =>
  drawn(k, P, state).sort((a, b) => a.key - b.key).map((d) => d.svg).join("");
const shapeOf = (A, part, meta) =>
  part.poly ? A.prism(frameOf(part.half), part.poly, 0, 2 * part.half, meta)
    : part.disc ? A.disc(part.disc[3], part.disc[0], part.disc[1], part.disc[2], meta)
    : part.cyl ? A.cylinder(...part.cyl, meta)
    : A.slab(part.plan, part.z, part.h, meta, 4);
function contribute(R, k, A, P, state) { // records each part under markup()'s own sort key
  for (const { part, svg, key } of drawn(k, P, state)) {
    const shapes = [R.solid(shapeOf(A, part, { name: part.name }))];
    R.put({ name: part.name, at: part.at, key, svg, shapes });
  }
}
const restFulcrum = REST, deckZ = DECK;

return { model, readout, frame, markup, contribute, restFulcrum, deckZ };
})();

/*
 * 5 Physics Figures Definitions (Hairline 2:1 Axonometric Standard)
 * Modularized Architecture - Auto-bundled
 */

if (typeof HL !== "undefined" && HL.inject) {
  HL.inject(document);
}

const PHYSICS_FIGURES = [
{
  id: "physics-lever",
  title: "1. Đòn Bẩy & Điểm Tựa (Lever & Fulcrum)",
  concept: "Quy tắc đòn bẩy: F₁ · d₁ = F₂ · d₂ (Cân bằng mô-men lực)",
  means:
    "Di chuột ngang để dịch điểm tựa nêm: thanh đòn nghiêng theo độ lệch mô-men. "
    + "Khi d₂ = 2d₁ (tải trái nặng gấp đôi tải phải), thanh đòn nằm ngang, "
    + "hai mô-men bằng nhau và chính thanh đòn sáng lên báo cân bằng.",
  rules: [1, 2, 4, 6, 9],
  range: [-20, -8, 15],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const k = globalThis.AK;
    const L = globalThis.LEVER;
    svg.setAttribute("class", "iso iso-svg");
    svg.setAttribute("data-theme", "light");
    const view = L.frame(k);
    const C = HL.cam(45, 0.5, view.S); // the drawing's camera: pointer and picture share one projection
    HL.fit(C, view.pts, 200, 160);
    const root = HL.mk("g", {}, svg);
    const sp = HL.spring(initialV != null ? initialV : L.restFulcrum, { k: 140, c: 15 });
    let last = "";
    const paint = () => {
      const posed = L.model(sp.x);
      read.textContent = L.readout(posed);
      const accent = posed.balanced ? "beam" : "wedge"; // lit: the beam at balance, else the wedge
      const key = `${HL.r2(sp.x)}:${accent}`;
      if (key === last) return;
      last = key;
      root.innerHTML = L.markup(k, view.P, { xf: sp.x, theta: posed.theta, accent });
    };
    const aim = (target) => {
      sp.t = HL.clamp(Number(target), -20, 15);
      reg.wake();
    };
    // Pointer column -> fulcrum on the rail (y = 0, deck height); the screen's vertical axis is ignored.
    const onRail = (sx) => {
      const a = HL.unproj(C, sx, 0, L.deckZ), b = HL.unproj(C, sx, 1, L.deckZ);
      return a[0] + ((b[0] - a[0]) * -a[1]) / (b[1] - a[1]);
    };
    const point = (pt) => aim(pt ? onRail(pt[0]) : L.restFulcrum);
    const reg = HL.register(stage, (dt) => {
      const moving = HL.stepS(sp, dt);
      paint();
      return moving;
    });
    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: point, down: point, leave: () => point(null) }));
    bag.add(() => svg.replaceChildren());
    paint();
    return { set: aim, destroy: bag.dispose };
  }
},
/*
 * 2. Simple Harmonic Pendulum & Energy Conservation (Con Lắc Đơn & Bảo Toàn Cơ Năng)
 * Physical Concept: Bảo toàn cơ năng: E = W_t(θ) + W_đ(ω)
 */

{
  id: "physics-pendulum",
  title: "2. Con Lắc Đơn (Harmonic Pendulum)",
  concept: "Bảo toàn cơ năng: E = W_t(θ) + W_đ(ω) · Chuyển hóa thế năng và động năng",
  means: "Kéo thả quả nặng đến góc lệch biên (±35°); con lắc chuyển hóa giữa thế năng trọng trường và động năng theo góc lệch θ, ổn định êm ái qua hệ đàn hồi.",
  rules: [1, 2, 4, 6, 8],
  range: [-35, 25, 35],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 4.25);
    HL.fit(C, [[-30, -15, 0], [26, 15, 42]], 204, 162);
    const P = HL.proj(C), front = HL.facing(C);

    function circAt(cx, cy, R, n = 20) {
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        out.push({ u: cx + R * ca, v: cy + R * sa, nu: ca, nv: sa });
      }
      return out;
    }

    // 1. Heavy Cast-Iron T-Frame Base (Z: 0 to 2.6)
    const baseSol = HL.solid(svg);
    const [bFootO, bFootI] = HL.rings(-29, -6, 20, 6, 1.4, 0.5);
    HL.put(baseSol, HL.prism(P, front, bFootO, bFootI, 0, 2.6));

    const crossSol = HL.solid(svg);
    const [cFootO, cFootI] = HL.rings(-29, -14, -18, 14, 1.4, 0.5);
    HL.put(crossSol, HL.prism(P, front, cFootO, cFootI, 0, 2.4));

    // 2. Rigid Vertical Post & Cantilever Suspension Arm
    const postSol = HL.solid(svg);
    HL.put(postSol, HL.prism(P, front, circAt(-22, 0, 2.0, 18), circAt(-22, 0, 1.5, 18), 2.6, 40.0));

    const armSol = HL.solid(svg);
    const [armO, armI] = HL.rings(-24, -2.0, 3.0, 2.0, 0.8, 0.3);
    HL.put(armSol, HL.prism(P, front, armO, armI, 38.2, 40.4));

    const pPivot = P(0, 0, 39.0);
    HL.mk("ellipse", { cx: HL.r2(pPivot[0]), cy: HL.r2(pPivot[1]), rx: 2.6, ry: 2.6, class: "sil" }, svg);
    HL.mk("circle", { cx: HL.r2(pPivot[0]), cy: HL.r2(pPivot[1]), r: 1.2, class: "dot" }, svg);

    // Equilibrium plumb line & circular trajectory swingArc
    const L = 29.0, bobR = 4.6;
    const plumbBot = P(0, 0, 4.5);
    HL.mk("path", { d: HL.seg(pPivot, plumbBot), class: "lo nf dash" }, svg);

    const arcPts = [];
    for (let deg = -38; deg <= 38; deg += 2) {
      const a = (deg * Math.PI) / 180;
      arcPts.push(P(L * Math.sin(a), 0, 39.0 - L * Math.cos(a)));
    }
    const swingArc = HL.mk("path", { d: HL.open(arcPts), class: "lo nf dash" }, svg);
    const heightLine = HL.mk("path", { class: "lo nf dash" }, svg);

    // 3. Cord & True Spherical Pendulum Bob (using <ellipse> so kernel CSS fills with --hl-plate)
    const cordMain = HL.mk("path", { class: "hi nf" }, svg);
    const bobGroup = HL.mk("g", {}, svg);
    const bobScreenR = HL.r2(bobR * C.S);
    const bobBody = HL.mk("ellipse", { rx: bobScreenR, ry: bobScreenR, class: "sil" }, bobGroup);
    const bobEquator = HL.mk("path", { class: "lo nf" }, bobGroup);
    const bobMeridian = HL.mk("path", { class: "lo nf" }, bobGroup);
    const bobShine = HL.mk("circle", { r: 1.5, class: "dot" }, bobGroup);

    const startDeg = initialV != null ? initialV : 25;
    const spDeg = HL.spring(startDeg, { k: 220, c: 18 });
    let lastKey = "";

    function draw() {
      const degNow = spDeg.x;
      const vel = Math.abs(spDeg.v);
      const key = `${HL.r2(degNow)}:${HL.r2(vel)}`;
      if (key === lastKey) return;
      lastKey = key;

      const theta = (degNow * Math.PI) / 180;
      const bx = L * Math.sin(theta);
      const bz = 39.0 - L * Math.cos(theta);
      const pBob = P(bx, 0, bz);
      const pAxisRef = P(0, 0, bz);

      cordMain.setAttribute("d", HL.seg(pPivot, pBob));
      heightLine.setAttribute("d", HL.seg(pAxisRef, pBob));

      HL.place(bobBody, pBob);
      const eqW = bobR * C.S;
      const eqH = bobR * C.S * 0.36;
      bobEquator.setAttribute(
        "d",
        `M ${HL.r2(pBob[0] - eqW)} ${HL.r2(pBob[1])} A ${HL.r2(eqW)} ${HL.r2(eqH)} 0 0 0 ${HL.r2(pBob[0] + eqW)} ${HL.r2(pBob[1])}`
      );
      bobMeridian.setAttribute(
        "d",
        `M ${HL.r2(pBob[0])} ${HL.r2(pBob[1] - eqW)} A ${HL.r2(eqH)} ${HL.r2(eqW)} 0 0 0 ${HL.r2(pBob[0])} ${HL.r2(pBob[1] + eqW)}`
      );
      HL.place(bobShine, [pBob[0] - eqW * 0.35, pBob[1] - eqW * 0.35]);

      const hMaxRef = L * (1 - Math.cos((35 * Math.PI) / 180));
      const hCur = Math.max(0, L * (1 - Math.cos(theta)));
      const epPercent = Math.min(100, Math.round((hCur / hMaxRef) * 100));
      const ekPercent = Math.max(0, 100 - epPercent);

      const isHighPotential = Math.abs(degNow) >= 15;
      bobBody.classList.toggle("hi", isHighPotential);
      swingArc.classList.toggle("hi", Math.abs(degNow) >= 28);

      read.textContent = `θ=${degNow.toFixed(1)}° · Wt=${epPercent}% · Wđ=${ekPercent}%`;
    }

    function setAngle(deg) {
      spDeg.t = HL.clamp(deg, -35, 35);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setAngle(25); return; }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 14);
      const disp = (wx - wy) * 0.7;
      setAngle(HL.clamp(disp * 1.4, -35, 35));
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spDeg, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setAngle(Number(v)); }, destroy: bag.dispose, dispose: bag.dispose };
  }
},
/*
 * 3. Spring Dynamometer (Lực Kế Lò Xo - Định Luật Hooke)
 * Physical Concept: Định luật Hooke: Lực đàn hồi tỷ lệ thuận với độ giãn: F = k · Δl
 *   - Lực đo được: F = 0 N đến 5 N (0 đến 5 quả cân 1 N).
 *   - Độ cứng lò xo: k = 100 N/m ⇒ Mỗi 1 N dãn 10 mm.
 */

{
  id: "physics-dynamometer",
  title: "3. Lực Kế Lò Xo (Spring Dynamometer)",
  concept: "Định luật Hooke: F = k · Δl (Lực đàn hồi & Độ biến dạng tuyến tính)",
  means: "Di chuột dọc để kéo móc hoặc tăng tải trọng từ 0N đến 5N: lò xo xoắn ốc co giãn tuyến tính mượt mà qua chuyển động đàn hồi, các đĩa cân 1N tự động xếp chồng, kim đo trỏ chính xác vạch Newton tương ứng.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 2.0, 5.0],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.85);
    HL.fit(C, [[-28, -14, 0], [24, 14, 36]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    function circAt(cx, cy, R, n = 20) {
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        out.push({ u: cx + R * ca, v: cy + R * sa, nu: ca, nv: sa });
      }
      return out;
    }

    // 1. Cast-Iron Laboratory Base (Z: 0 to 2.4)
    const baseSol = HL.solid(svg);
    const [bO, bI] = HL.rings(-28, -14, 24, 14, 2.4, 0.6);
    HL.put(baseSol, HL.prism(P, front, bO, bI, 0, 2.4));

    for (const pt of [P(-24, -10, 2.5), P(-24, 10, 2.5), P(18, 0, 2.5)]) {
      HL.mk("ellipse", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), rx: 1.8, ry: 1.4, class: "lo" }, svg);
      HL.mk("circle", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 0.7, class: "dot" }, svg);
    }

    // 2. Rigid Support Stand Rod & Cantilever Clamp Arm
    const postSol = HL.solid(svg);
    HL.put(postSol, HL.prism(P, front, circAt(-17, 0, 1.8, 16), circAt(-17, 0, 1.4, 16), 2.4, 34.5));

    const clampSol = HL.solid(svg);
    const [clO, clI] = HL.rings(-19.5, -2.4, -14.5, 2.4, 0.6, 0.2);
    HL.put(clampSol, HL.prism(P, front, clO, clI, 32.2, 34.5));

    const armSol = HL.solid(svg);
    const [armO, armI] = HL.rings(-15, -1.3, 2.5, 1.3, 0.5, 0.2);
    HL.put(armSol, HL.prism(P, front, armO, armI, 32.8, 34.2));

    const topPin = P(0, 0, 33.0);
    HL.mk("ellipse", { cx: HL.r2(topPin[0]), cy: HL.r2(topPin[1]), rx: 1.8, ry: 1.8, class: "sil" }, svg);

    // 3. Dynamometer Outer Casing (Z: 15.5 to 32.0)
    const capO = circAt(0, 0, 4.4, 22), capI = circAt(0, 0, 3.8, 22);
    const barO = circAt(0, 0, 4.2, 22), barI = circAt(0, 0, 3.6, 22);
    const topCapSol = HL.solid(svg);
    HL.put(topCapSol, HL.prism(P, front, capO, capI, 30.5, 32.0));
    const barrelSol = HL.solid(svg);
    HL.put(barrelSol, HL.prism(P, front, barO, barI, 16.8, 30.5));
    const botCapSol = HL.solid(svg);
    HL.put(botCapSol, HL.prism(P, front, capO, capI, 15.4, 16.8));

    // Scale graduation ticks (0N at Z = 27.0, 5N at Z = 18.0 -> 1.8 units/N)
    let ticksD = "";
    for (let i = 0; i <= 5; i++) {
      const tickZ = 27.0 - i * 1.8;
      ticksD += HL.seg(P(3.2, 2.2, tickZ), P(4.6, 3.1, tickZ));
      if (i < 5) {
        const halfZ = tickZ - 0.9;
        ticksD += HL.seg(P(3.4, 2.3, halfZ), P(4.2, 2.8, halfZ));
      }
    }
    const scaleTicks = HL.mk("path", { d: ticksD, class: "lo nf" }, svg);

    // 4. Helical Spring, Indicator Collar, Pointer Needle, Hook & Weights
    const springHelix = HL.mk("path", { class: "hi nf" }, svg);
    const indCollar = HL.mk("path", { class: "sil" }, svg);
    const pointerNeedle = HL.mk("path", { class: "hi nf" }, svg);
    const hookStem = HL.mk("path", { class: "sil nf" }, svg);
    const hookCurve = HL.mk("path", { class: "hi nf" }, svg);
    const forceArrow = HL.mk("path", { class: "hi nf" }, svg);

    const weightsGroup = HL.mk("g", {}, svg);
    const weightSols = Array.from({ length: 5 }, () => HL.solid(weightsGroup));

    const currentF = initialV != null ? HL.clamp(initialV, 0, 5) : 2.0;
    const spF = HL.spring(currentF, { k: 140, c: 14 });
    let lastKey = "";

    function draw() {
      const fVal = spF.x;
      const key = `${HL.r2(fVal)}`;
      if (key === lastKey) return;
      lastKey = key;

      const deltaZ = fVal * 1.8;
      const springTopZ = 29.8;
      const springBotZ = 27.0 - deltaZ;

      const coils = 8, numSteps = coils * 12, springR = 2.4;
      const spPts = [];
      for (let k = 0; k <= numSteps; k++) {
        const t = k / numSteps;
        const ang = t * coils * Math.PI * 2;
        spPts.push(P(springR * Math.cos(ang), springR * Math.sin(ang), springTopZ - t * (springTopZ - springBotZ)));
      }
      springHelix.setAttribute("d", HL.open(spPts));

      const colTop = springBotZ, colBot = springBotZ - 1.1;
      const colRing = circAt(0, 0, 3.3, 18);
      indCollar.setAttribute("d", HL.poly(HL.hull([
        ...colRing.map(q => P(q.u, q.v, colTop)),
        ...colRing.map(q => P(q.u, q.v, colBot))
      ])));
      pointerNeedle.setAttribute("d", HL.seg(P(2.6, 1.8, springBotZ), P(4.8, 3.3, springBotZ)));

      const hookTopZ = colBot, hookBotZ = hookTopZ - 4.2;
      const h0 = P(0, 0, hookTopZ), h1 = P(0, 0, hookBotZ);
      const h2 = P(1.6, 0, hookBotZ - 1.2), h3 = P(2.8, 0, hookBotZ - 0.2);
      hookStem.setAttribute("d", HL.seg(h0, h1));
      hookCurve.setAttribute("d", `M ${HL.r2(h1[0])} ${HL.r2(h1[1])} C ${HL.r2(h2[0])} ${HL.r2(h2[1])}, ${HL.r2(h3[0])} ${HL.r2(h3[1])}, ${HL.r2(h3[0])} ${HL.r2(h3[1] - 1.0)}`);

      const activeWeights = Math.min(5, Math.max(0, Math.round(fVal)));
      const weightThickness = 1.25;
      const wRingO = circAt(0, 0, 5.2, 20), wRingI = circAt(0, 0, 1.2, 12);

      weightSols.forEach((sol, idx) => {
        if (idx < activeWeights) {
          const wz0 = hookBotZ - 1.4 - (idx + 1) * (weightThickness + 0.15);
          HL.put(sol, HL.prism(P, front, wRingO, wRingI, wz0, wz0 + weightThickness));
          sol.sil.classList.toggle("hi", idx === activeWeights - 1);
        } else {
          HL.put(sol, { sil: "", crease: "" });
          sol.sil.classList.remove("hi");
        }
      });

      const arrTop = P(8.0, 0, 26.0), arrBot = P(8.0, 0, 25.0 - deltaZ);
      forceArrow.setAttribute("d", HL.seg(arrTop, arrBot) + HL.seg(P(7.0, 0, 26.0 - deltaZ), arrBot) + HL.seg(P(9.0, 0, 26.0 - deltaZ), arrBot));
      scaleTicks.classList.toggle("lo", true);

      const measuredN = fVal.toFixed(1);
      const deltaLmm = Math.round(fVal * 10);
      read.textContent = `F=${measuredN}N · Δl=${deltaLmm}mm (${activeWeights} quả)`;
    }

    function setForce(targetF) {
      spF.t = HL.clamp(targetF, 0, 5);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setForce(2.0); return; }
      const [, wy] = HL.unproj(C, pt[0], pt[1], 18);
      const norm = HL.clamp((wy + 12) / 24, 0, 1);
      setForce(norm * 5.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spF, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setForce(Number(v)); }, destroy: bag.dispose };
  }
},
/*
 * 4. Inclined Plane & Friction (Mặt Phẳng Nghiêng & Khối Trượt)
 * Physical Concept: Phân tích lực trên mặt phẳng nghiêng & ma sát nghỉ:
 *   - Lực kéo trượt dọc dốc: P∥ = P · sin(α), Áp lực pháp tuyến: N = P · cos(α)
 *   - Góc ma sát giới hạn: α_c = 24° (tan 24° ≈ 0.445 = μ)
 */

{
  id: "physics-incline",
  title: "4. Mặt Phẳng Nghiêng (Inclined Plane & Friction)",
  concept: "Phân tích trọng lực trên dốc: P∥ = P·sin(α) vs Fms = μ·P·cos(α)",
  means: "Di chuột dọc để nâng/hạ góc nghiêng α từ 0° đến 45°. Khi góc dốc vượt góc ma sát giới hạn (α > 24°), lực kéo trượt vượt lực ma sát nghỉ cực đại, khối trượt gia tốc lao xuống chân dốc.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 16, 45],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.65);
    HL.fit(C, [[-40, -15, 0], [40, 15, 34]], 200, 148);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Heavy Test Bench Base (Z: 0 to 2.4)
    const baseSol = HL.solid(svg);
    const [baseO, baseI] = HL.rings(-40, -14, 40, 14, 2.2, 0.6);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.4));

    for (const [cx, cy] of [[-37, -11], [37, -11], [-37, 11], [37, 11]]) {
      const pt = P(cx, cy, 2.45);
      HL.mk("ellipse", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), rx: 1.8, ry: 1.4, class: "lo" }, svg);
      HL.mk("circle", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 0.7, class: "dot" }, svg);
    }

    // 2. Brass Hinge Bracket at X = -28 (Z: 2.4 to 6.0)
    const pivotX = -28.0, pivotZ = 6.0;
    const hingeSol = HL.solid(svg);
    const [hO, hI] = HL.rings(pivotX - 3.5, -9.0, pivotX + 3.5, 9.0, 0.8, 0.3);
    HL.put(hingeSol, HL.prism(P, front, hO, hI, 2.4, pivotZ));
    HL.mk("path", { d: HL.seg(P(pivotX, -9.5, pivotZ), P(pivotX, 9.5, pivotZ)), class: "sil nf" }, svg);

    // 3. Sector Protractor Plate (front face Y = 9.2)
    const protractorGroup = HL.mk("g", {}, svg);
    const arcR = 18.0;
    const arcPts = [];
    let tickLoD = "", tickHiD = "";
    for (let deg = 0; deg <= 45; deg += 3) {
      const rad = (deg * Math.PI) / 180;
      const pt = P(pivotX + arcR * Math.cos(rad), 9.2, pivotZ + arcR * Math.sin(rad));
      arcPts.push(pt);
      if (deg % 15 === 0 || deg === 24) {
        const pIn = P(pivotX + (arcR - 2.8) * Math.cos(rad), 9.2, pivotZ + (arcR - 2.8) * Math.sin(rad));
        if (deg === 24) tickHiD += HL.seg(pIn, pt);
        else tickLoD += HL.seg(pIn, pt);
      }
    }
    const angleArc = HL.mk("path", { d: HL.open(arcPts), class: "lo nf dash" }, protractorGroup);
    HL.mk("path", { d: tickLoD, class: "lo nf" }, protractorGroup);

    const critRad = (24 * Math.PI) / 180;
    tickHiD += HL.seg(
      P(pivotX + 6.0 * Math.cos(critRad), 9.2, pivotZ + 6.0 * Math.sin(critRad)),
      P(pivotX + (arcR + 1.5) * Math.cos(critRad), 9.2, pivotZ + (arcR + 1.5) * Math.sin(critRad))
    );
    HL.mk("path", { d: tickHiD, class: "hi nf" }, protractorGroup);

    // 4. Support Strut, Hinged Ramp Plank, Sliding Block & Force Vectors
    const strutLine = HL.mk("path", { class: "sil nf" }, svg);
    const rampSol = HL.solid(svg);
    const motionTicks = HL.mk("path", { class: "lo nf dash" }, svg);
    const blockSol = HL.solid(svg);
    const blockKnob = HL.mk("circle", { r: 1.5, class: "dot" }, svg);
    const vecP = HL.mk("path", { class: "hi nf" }, svg);
    const vecF = HL.mk("path", { class: "hi nf" }, svg);
    const vecN = HL.mk("path", { class: "lo nf" }, svg);

    const rampLength = 60.0, rampW = 8.4, rampH = 2.4;
    const blockL = 12.5, blockW = 6.6, blockH = 6.0;
    const initialDeg = initialV != null ? initialV : 16;
    const spAlpha = HL.spring((initialDeg * Math.PI) / 180, { k: 120, c: 14 });
    const spBoxU = HL.spring(44.0, { k: 70, c: 10 });
    let lastKey = "";

    function rPt(u, v, w, alpha) {
      const ca = Math.cos(alpha), sa = Math.sin(alpha);
      return P(pivotX + u * ca - w * sa, v, pivotZ + u * sa + w * ca);
    }

    function box3D(u0, u1, v0, v1, w0, w1, alpha) {
      const p000 = rPt(u0, v0, w0, alpha), p100 = rPt(u1, v0, w0, alpha);
      const p110 = rPt(u1, v1, w0, alpha), p010 = rPt(u0, v1, w0, alpha);
      const p001 = rPt(u0, v0, w1, alpha), p101 = rPt(u1, v0, w1, alpha);
      const p111 = rPt(u1, v1, w1, alpha), p011 = rPt(u0, v1, w1, alpha);
      const sil = HL.poly(HL.hull([p000, p100, p110, p010, p001, p101, p111, p011]));
      const crease = HL.seg(p011, p111) + HL.seg(p111, p101) + HL.seg(p111, p110);
      return { sil, crease };
    }

    function arrowSeg(p0, p1) {
      const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const nx = -uy, ny = ux;
      const aL = [p1[0] - ux * 4.5 + nx * 2.2, p1[1] - uy * 4.5 + ny * 2.2];
      const aR = [p1[0] - ux * 4.5 - nx * 2.2, p1[1] - uy * 4.5 - ny * 2.2];
      return HL.seg(p0, p1) + HL.open([aL, p1, aR]);
    }

    function draw() {
      const alpha = spAlpha.x, boxU = spBoxU.x;
      const key = `${HL.r2(alpha)}:${HL.r2(boxU)}`;
      if (key === lastKey) return;
      lastKey = key;

      const alphaDeg = (alpha * 180) / Math.PI;
      const rampBox = box3D(0, rampLength, -rampW, rampW, 0, rampH, alpha);
      const stopBox = box3D(4.2, 6.4, -rampW + 1.0, rampW - 1.0, rampH, rampH + 2.6, alpha);
      HL.put(rampSol, { sil: rampBox.sil + stopBox.sil, crease: rampBox.crease + stopBox.crease });

      strutLine.setAttribute("d", HL.seg(P(16, 6.5, 2.4), rPt(46, 6.5, 0, alpha)));
      motionTicks.setAttribute("d", HL.seg(rPt(10, 0, rampH + 0.1, alpha), rPt(54, 0, rampH + 0.1, alpha)));

      const blk = box3D(boxU - blockL / 2, boxU + blockL / 2, -blockW / 2, blockW / 2, rampH, rampH + blockH, alpha);
      HL.put(blockSol, blk);
      HL.place(blockKnob, rPt(boxU, 0, rampH + blockH + 0.2, alpha));

      // Force vectors from block front/top center along slope (P_parallel, F_ms) & normal (N)
      const cCenter = rPt(boxU, 0, rampH + blockH / 2, alpha);
      const pSlopeDown = rPt(boxU - 11.5, 0, rampH + blockH / 2, alpha);
      const pFricUp = rPt(boxU + 10.5, 0, rampH + blockH / 2, alpha);
      const pNorm = rPt(boxU, 0, rampH + blockH + 7.2, alpha);
      vecP.setAttribute("d", arrowSeg(cCenter, pSlopeDown));
      vecF.setAttribute("d", arrowSeg(cCenter, pFricUp));
      vecN.setAttribute("d", arrowSeg(rPt(boxU, 0, rampH + blockH, alpha), pNorm));
      angleArc.classList.toggle("lo", true);

      const isSliding = alphaDeg > 24.0;
      blockSol.sil.classList.toggle("hi", isSliding);
      const angleStr = alphaDeg.toFixed(1);
      read.textContent = isSliding ? `α=${angleStr}° > 24° · Trượt!` : `α=${angleStr}° ≤ 24° · Đứng yên`;
    }

    function setAngle(deg) {
      const clamped = HL.clamp(deg, 0, 45);
      spAlpha.t = (clamped * Math.PI) / 180;
      spBoxU.t = clamped > 24.0 ? 13.0 : 44.0;
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setAngle(16.0); return; }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 14);
      const norm = HL.clamp(1.0 - (wx + wy + 18) / 36, 0, 1);
      setAngle(norm * 45.0);
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(spAlpha, dt);
      const m2 = HL.stepS(spBoxU, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setAngle(Number(v)); }, destroy: bag.dispose };
  }
},
/*
 * 5. Knife Switch & Electric Circuit (Cầu Dao & Mạch Điện Đèn Sáng)
 * Physical Concept: Mạch điện đóng / ngắt (Closed vs Open Circuit):
 *   - Định luật Ohm: I = U / R (U = 6.0 V, I = 1.50 A, P = 9.0 W khi đóng mạch)
 */

{
  id: "physics-switch",
  title: "5. Cầu Dao & Mạch Điện (Knife Switch & Circuit)",
  concept: "Mạch điện kín & hở: I = U/R · Công suất bóng đèn P = I²·R",
  means: "Di chuột hạ thấp cán cầm để đóng cầu dao. Khi lưỡi dao tiếp cận ngàm kẹp (góc < 5°), cơ cấu đàn hồi hút sập dao vào ngàm khép kín mạch điện: bóng đèn dây tóc lập tức rực sáng và dây dẫn chuyển trạng thái tích điện.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 32, 45],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.55);
    HL.fit(C, [[-42, -16, 0], [42, 16, 26]], 200, 152);
    const P = HL.proj(C), front = HL.facing(C);

    function circAt(cx, cy, R, n = 20) {
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        out.push({ u: cx + R * ca, v: cy + R * sa, nu: ca, nv: sa });
      }
      return out;
    }

    // 1. Insulating Switchboard Base (Z: 0 to 2.4)
    const baseSol = HL.solid(svg);
    const [baseO, baseI] = HL.rings(-42, -15, 42, 15, 2.2, 0.6);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.4));

    for (const [cx, cy] of [[-39, -12], [39, -12], [-39, 12], [39, 12]]) {
      const pt = P(cx, cy, 2.45);
      HL.mk("ellipse", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), rx: 1.8, ry: 1.4, class: "lo" }, svg);
      HL.mk("circle", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 0.7, class: "dot" }, svg);
    }

    // 2. Battery Power Block at X = -32 (Z: 2.4 to 9.2)
    const batSol = HL.solid(svg);
    const [batO, batI] = HL.rings(-38, -6.5, -26, 6.5, 1.2, 0.4);
    HL.put(batSol, HL.prism(P, front, batO, batI, 2.4, 9.2));

    const postPlus = P(-35, 2.6, 9.3), postMinus = P(-35, -2.6, 9.3);
    HL.mk("ellipse", { cx: HL.r2(postPlus[0]), cy: HL.r2(postPlus[1]), rx: 1.8, ry: 1.4, class: "hi" }, svg);
    HL.mk("ellipse", { cx: HL.r2(postMinus[0]), cy: HL.r2(postMinus[1]), rx: 1.8, ry: 1.4, class: "lo" }, svg);

    // 3. Stamped Copper Circuit Traces along Base (Z = 2.5)
    const wireLoop = HL.mk("path", {
      d: HL.seg(P(-35, 2.5, 2.5), P(-14, 0, 2.5)) + HL.seg(P(10, 0, 2.5), P(24, 0, 2.5)) +
         HL.open([P(28, -4.5, 2.5), P(-35, -10.5, 2.5), P(-35, -2.5, 2.5)]),
      class: "lo nf"
    }, svg);

    // 4. Switch Trunnion Hinge Post at X = -14 & Twin Contact Jaws at X = 10
    const pivotX = -14.0, pivotZ = 7.2;
    const hingeSol = HL.solid(svg);
    const [hO, hI] = HL.rings(-16.5, -3.2, -11.5, 3.2, 0.8, 0.3);
    HL.put(hingeSol, HL.prism(P, front, hO, hI, 2.4, 7.8));
    const pivotFork = HL.mk("path", { d: HL.seg(P(-14, -3.6, pivotZ), P(-14, 3.6, pivotZ)), class: "sil nf" }, svg);

    const jaw1Sol = HL.solid(svg), jaw2Sol = HL.solid(svg);
    const [j1O, j1I] = HL.rings(8.5, -3.0, 11.5, -0.6, 0.4, 0.2);
    const [j2O, j2I] = HL.rings(8.5, 0.6, 11.5, 3.0, 0.4, 0.2);
    HL.put(jaw1Sol, HL.prism(P, front, j1O, j1I, 2.4, 9.2));
    HL.put(jaw2Sol, HL.prism(P, front, j2O, j2I, 2.4, 9.2));

    const clipJawL = HL.mk("path", { d: HL.open([P(8.5, -0.6, 9.2), P(8.5, -3.6, 10.4), P(11.5, -3.6, 10.4), P(11.5, -0.6, 9.2)]), class: "sil nf" }, svg);
    const clipJawR = HL.mk("path", { d: HL.open([P(8.5, 0.6, 9.2), P(8.5, 3.6, 10.4), P(11.5, 3.6, 10.4), P(11.5, 0.6, 9.2)]), class: "sil nf" }, svg);

    // 5. Porcelain Lamp Socket & 3D Spherical Lightbulb at X = 28 (using <ellipse> for warm plate fill)
    const socketSol = HL.solid(svg);
    HL.put(socketSol, HL.prism(P, front, circAt(28, 0, 5.0, 22), circAt(28, 0, 4.3, 22), 2.4, 5.8));
    const collarSol = HL.solid(svg);
    HL.put(collarSol, HL.prism(P, front, circAt(28, 0, 3.9, 18), circAt(28, 0, 3.3, 18), 5.8, 7.6));

    const bulbCenter = [28, 0, 13.8], bulbR = 5.4;
    const pCenter = P(...bulbCenter), bRad = HL.r2(bulbR * C.S);
    const bulbGlass = HL.mk("ellipse", { cx: HL.r2(pCenter[0]), cy: HL.r2(pCenter[1]), rx: bRad, ry: bRad, class: "sil" }, svg);
    const refR = bulbR * C.S * 0.72;
    HL.mk("path", {
      d: `M ${HL.r2(pCenter[0] - refR * 0.7)} ${HL.r2(pCenter[1] - refR * 0.5)} A ${HL.r2(refR)} ${HL.r2(refR)} 0 0 1 ${HL.r2(pCenter[0] - refR * 0.2)} ${HL.r2(pCenter[1] - refR * 0.85)}`,
      class: "lo nf"
    }, svg);

    const stemTop = P(28, 0, 8.6), fLeft = P(26.5, 0, 11.8), fRight = P(29.5, 0, 11.8), fPeak = P(28.0, 0, 14.6);
    const filament = HL.mk("path", {
      d: HL.seg([stemTop[0] - 1, stemTop[1]], fLeft) + HL.seg([stemTop[0] + 1, stemTop[1]], fRight) +
         `M ${HL.r2(fLeft[0])} ${HL.r2(fLeft[1])} Q ${HL.r2(fPeak[0])} ${HL.r2(fPeak[1])} ${HL.r2(fRight[0])} ${HL.r2(fRight[1])}`,
      class: "lo nf"
    }, svg);

    let activeRaysD = "";
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg * Math.PI) / 180;
      const r1 = P(bulbCenter[0] + (bulbR + 1.8) * Math.cos(rad), (bulbR + 1.8) * Math.sin(rad) * 0.4, bulbCenter[2] + (bulbR + 1.8) * Math.sin(rad));
      const r2 = P(bulbCenter[0] + (bulbR + 4.8) * Math.cos(rad), (bulbR + 4.8) * Math.sin(rad) * 0.4, bulbCenter[2] + (bulbR + 4.8) * Math.sin(rad));
      activeRaysD += HL.seg(r1, r2);
    }
    const glowRays = HL.mk("path", { class: "hi nf" }, svg);

    // 6. Knife Switch Blade & Turned Handle
    const bladeSol = HL.solid(svg);
    const handleSol = HL.solid(svg);
    const initialDeg = initialV != null ? initialV : 32;
    const spTheta = HL.spring((initialDeg * Math.PI) / 180, { k: 150, c: 14 });
    let lastKey = "";

    function bPt(u, v, w, theta) {
      const ct = Math.cos(theta), st = Math.sin(theta);
      return P(pivotX + u * ct - w * st, v, pivotZ + u * st + w * ct);
    }

    function boxBlade(u0, u1, v0, v1, w0, w1, theta) {
      const p000 = bPt(u0, v0, w0, theta), p100 = bPt(u1, v0, w0, theta);
      const p110 = bPt(u1, v1, w0, theta), p010 = bPt(u0, v1, w0, theta);
      const p001 = bPt(u0, v0, w1, theta), p101 = bPt(u1, v0, w1, theta);
      const p111 = bPt(u1, v1, w1, theta), p011 = bPt(u0, v1, w1, theta);
      return {
        sil: HL.poly(HL.hull([p000, p100, p110, p010, p001, p101, p111, p011])),
        crease: HL.seg(p011, p111) + HL.seg(p111, p101) + HL.seg(p111, p110)
      };
    }

    function draw() {
      const theta = spTheta.x;
      const key = `${HL.r2(theta)}`;
      if (key === lastKey) return;
      lastKey = key;

      const thetaDeg = (theta * 180) / Math.PI;
      const isClosed = thetaDeg <= 2.0;

      HL.put(bladeSol, boxBlade(0, 24.5, -0.8, 0.8, 0, 2.5, theta));
      HL.put(handleSol, boxBlade(23.5, 33.5, -2.2, 2.2, -0.6, 3.2, theta));

      bladeSol.sil.classList.toggle("hi", true);
      wireLoop.classList.toggle("hi", isClosed);
      filament.classList.toggle("hi", isClosed);
      bulbGlass.classList.toggle("hi", isClosed);
      glowRays.setAttribute("d", isClosed ? activeRaysD : "");
      pivotFork.classList.toggle("sil", true);
      clipJawL.classList.toggle("sil", true);
      clipJawR.classList.toggle("sil", true);

      const degStr = thetaDeg.toFixed(0);
      read.textContent = isClosed ? `Mạch kín · I=1.5A · P=9.0W` : `Mạch hở α=${degStr}° · I=0A`;
    }

    function setSwitch(deg) {
      const clamped = HL.clamp(deg, 0, 45);
      spTheta.t = clamped < 5.0 ? 0.0 : (clamped * Math.PI) / 180;
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setSwitch(32.0); return; }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 10);
      const norm = HL.clamp(1.0 - (wx + wy + 16) / 32, 0, 1);
      setSwitch(norm * 45.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spTheta, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setSwitch(Number(v)); }, destroy: bag.dispose };
  }
},
];

// App Controller & View Logic for Physics Figures Suite (Hairline 2:1 Axonometric Standard)
(() => {
  const RULES = ["hit", "order", "reach", "accent", "rest", "honesty", "cost", "clock", "radius", "quiet"];
  const $ = id => document.getElementById(id);
  const navTabs = $("nav-tabs");
  const stage = $("stage");
  const slider = $("intensity");
  const valOut = $("value");
  const nameEl = $("name");
  const readEl = $("read");
  const meansEl = $("means");
  const rulesEl = $("rules");
  const btnPrev = $("btn-prev");
  const btnNext = $("btn-next");

  let currentIndex = 0;
  let currentHandle = null;

  HL.cam = HL.Cam;
  HL._order = PHYSICS_FIGURES.map(f => f.id);
  HL.figures = Object.fromEntries(PHYSICS_FIGURES.map(f => [f.id, f]));

  let picker = $("picker");
  if (!picker) {
    picker = document.createElement("div");
    picker.id = "picker";
    picker.hidden = true;
    document.body.appendChild(picker);
    PHYSICS_FIGURES.forEach((fig, idx) => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.onclick = () => switchTo(idx);
      picker.appendChild(chip);
    });
  }

  let scrub = $("scrub");
  if (!scrub) {
    scrub = document.createElement("input");
    scrub.id = "scrub";
    scrub.type = "range";
    scrub.min = "0";
    scrub.max = "1";
    scrub.step = "0.01";
    scrub.value = "0.5";
    scrub.hidden = true;
    document.body.appendChild(scrub);
    scrub.addEventListener("input", () => {
      slider.value = scrub.value;
      if (slider.oninput) slider.oninput();
    });
  }

  Object.defineProperty(stage, "children", {
    get() {
      const svg = stage.querySelector("svg");
      return svg ? svg.querySelectorAll("path, polygon, ellipse, circle, line") : [];
    }
  });

  const origSetPC = stage.setPointerCapture;
  const origRelPC = stage.releasePointerCapture;
  if (origSetPC) stage.setPointerCapture = function(id) { try { origSetPC.call(this, id); } catch {} };
  if (origRelPC) stage.releasePointerCapture = function(id) { try { origRelPC.call(this, id); } catch {} };

  const readBridge = {
    get textContent() { return readEl.textContent; },
    set textContent(v) {
      const s = String(v || "rest").trim();
      readEl.textContent = s.length > 28 ? s.slice(0, 28) : s;
    }
  };

  function renderTabs() {
    navTabs.innerHTML = "";
    PHYSICS_FIGURES.forEach((fig, idx) => {
      const btn = document.createElement("button");
      btn.className = "nav-btn" + (idx === currentIndex ? " active" : "");
      btn.textContent = (idx + 1) + ". " + fig.id.replace(/^physics-/, "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", idx === currentIndex ? "true" : "false");
      btn.onclick = () => switchTo(idx);
      navTabs.appendChild(btn);
    });
  }

  function switchTo(idx) {
    currentIndex = (idx + PHYSICS_FIGURES.length) % PHYSICS_FIGURES.length;
    renderTabs();

    if (currentHandle) {
      currentHandle.destroy();
      currentHandle = null;
    }
    stage.replaceChildren();

    const fig = PHYSICS_FIGURES[currentIndex];
    document.title = "Hairline · " + fig.id;
    stage.setAttribute("data-hairline", fig.id);
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", fig.means);
    nameEl.textContent = fig.id;
    meansEl.textContent = fig.means;
    rulesEl.textContent = (fig.rules || []).map(n => String(n).padStart(2, "0") + " " + RULES[n - 1]).join(" · ");

    slider.value = "0.5";
    const [lo, mid, hi] = fig.range;
    const at = (i) => Math.round((i <= 0.5 ? lo + (i / 0.5) * (mid - lo) : mid + ((i - 0.5) / 0.5) * (hi - mid)) * 1000) / 1000;
    valOut.textContent = String(at(0.5));

    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    readEl.textContent = "rest";
    currentHandle = fig.mount({ stage, svg, read: readBridge }, at(0.5));

    slider.oninput = () => {
      const v = at(Number(slider.value));
      valOut.textContent = String(v);
      if (currentHandle && currentHandle.set) currentHandle.set(v);
    };
  }

  if (btnPrev) btnPrev.onclick = () => switchTo(currentIndex - 1);
  if (btnNext) btnNext.onclick = () => switchTo(currentIndex + 1);

  window.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "ArrowLeft") {
      switchTo(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      switchTo(currentIndex + 1);
    } else {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= PHYSICS_FIGURES.length) {
        switchTo(num - 1);
      }
    }
  });

  window.addEventListener("error", e => {
    const err = $("error");
    if (err) {
      err.hidden = false;
      err.textContent = String((e.error && e.error.message) || e.message);
    }
  });

  renderTabs();
  switchTo(0);
})();
