// Lever on the anatomy kit: one moment model tilts a beam that rests on a wedge riding two rails.
const F1 = 20, F2 = 10, X1 = -24, X2 = 24, REST = -8, LIM = 0.16, TOL = 0.03;
const TOP = 4.8, DECK = 9.5, ZB = 18.6, BH = 3.6, DY = 4.2, DISC = 2.15, CAP = 1.2, DISC_R = 3.8;
const RAILS = [-11.5, 8.5];
const STACKS = [[X1, 4], [X2, 2]]; // x, equal discs: F1 = 2 * F2, so d2 = 2 * d1 balances
// Painter's order: a part sits above earlier layers; depth only orders parts inside one layer.
const LAYER = { foot: 0, plate: 1, fitting: 2, screw: 3, bush: 4, deck: 5, upper: 6, beam: 7, load: 8 };
export function model(xf) {
  const d1 = xf - X1, d2 = X2 - xf;
  const M1 = F1 * d1 * 0.01, M2 = F2 * d2 * 0.01, net = M1 - M2;
  return { d1, d2, M1, M2, net, theta: LIM * Math.tanh(net / 3.5), balanced: Math.abs(net) < TOL };
}
export function readout(m) {
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
export const rankOf = (k, P, part) => LAYER[part.layer] * 1e4 + k.depthOf(part.at, P); // the painter's key
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
export function frame(k) {
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
export const markup = (k, P, state) =>
  drawn(k, P, state).sort((a, b) => a.key - b.key).map((d) => d.svg).join("");
const shapeOf = (A, part, meta) =>
  part.poly ? A.prism(frameOf(part.half), part.poly, 0, 2 * part.half, meta)
    : part.disc ? A.disc(part.disc[3], part.disc[0], part.disc[1], part.disc[2], meta)
    : part.cyl ? A.cylinder(...part.cyl, meta)
    : A.slab(part.plan, part.z, part.h, meta, 4);
export function contribute(R, k, A, P, state) { // records each part under markup()'s own sort key
  for (const { part, svg, key } of drawn(k, P, state)) {
    const shapes = [R.solid(shapeOf(A, part, { name: part.name }))];
    R.put({ name: part.name, at: part.at, key, svg, shapes });
  }
}
export const restFulcrum = REST, deckZ = DECK;
