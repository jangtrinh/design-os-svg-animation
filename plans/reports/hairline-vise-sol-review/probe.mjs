import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import sharp from '/Users/jang/Products/ease-design/node_modules/sharp/lib/index.js';
import { assemble } from '/Users/jang/Products/.agents/skills/hairline-create/build.mjs';
import { validate } from '/Users/jang/Products/.agents/skills/hairline-create/validate.mjs';

const out = 'plans/reports/hairline-vise-sol-review';
fs.mkdirSync(`${out}/verify-pngs`, { recursive: true });
class El {
  constructor(tag) {
    this.tag = tag; this.attrs = {}; this.children = []; this.writes = 0;
    this.classList = { toggle: (c, v) => {
      const s = new Set((this.attrs.class || '').split(' ').filter(Boolean));
      v ? s.add(c) : s.delete(c); this.attrs.class = [...s].join(' ');
    } };
  }
  setAttribute(k, v) { this.attrs[k] = String(v); this.writes++; }
  appendChild(e) { this.children.push(e); return e; }
  replaceChildren() { this.children = []; }
}
const all = e => [e, ...e.children.flatMap(all)];
function load(name, value) {
  const code = fs.readFileSync(`playground/${name}.js`, 'utf8');
  const html = fs.readFileSync(`playground/${name}.html`, 'utf8');
  const ctx = vm.createContext({ document: { createElementNS: (_, t) => new El(t) }, console });
  vm.runInContext(html.match(/<script id="hl-kernel">([\s\S]*?)<\/script>/)[1], ctx);
  let C, tick, input, config, now = 0;
  const realCam = ctx.HL.Cam;
  const H = { ...ctx.HL, Cam: (...a) => (C = realCam(...a)),
    register: (_, t) => { tick = t; t(0, now); return { wake() {}, unregister() {} }; },
    pointer: (_, on) => { input = on; return () => {}; } };
  ctx.HL = H; ctx.hairline = f => { config = f; }; vm.runInContext(code, ctx);
  const svg = new El('svg'), read = { textContent: '' };
  const handle = config.mount({ stage: {}, svg, read }, value);
  const settle = () => { let n = 0; do { now += 1000 / 60; n++; }
    while (tick(1 / 60, now) && n < 600); assert.ok(n < 600); return n; };
  const target = (x, y = 0, z = 55) => { input.move(H.proj(C)(x, y, z)); return settle(); };
  const paths = () => all(svg).filter(e => e.tag === 'path');
  const stats = () => {
    const pts = paths().flatMap(e => [...(e.attrs.d || '').matchAll(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map(m => [+m[1], +m[2]]));
    const box = [Math.min(...pts.map(p => p[0])), Math.min(...pts.map(p => p[1])),
      Math.max(...pts.map(p => p[0])), Math.max(...pts.map(p => p[1]))];
    return { read: read.textContent, highlight: paths().filter(e => e.attrs.class?.split(' ').includes('hi')).length,
      paths: paths().length, box, finite: paths().every(e => !/NaN|Infinity/.test(e.attrs.d || '')) };
  };
  return { code, html, H, svg, handle, input, paths, stats, target, settle, tick: () => tick(0, now) };
}
function serialize(e, dark = false) {
  const palette = dark ? ['#08090a', '#3e3e44', '#5b5d64', '#29292d', '#d0d6e0'] : ['#ffffff', '#c3c3c9', '#a4a4ac', '#e0e0e4', '#232327'];
  const c = new Set((e.attrs.class || '').split(' ')), attrs = { ...e.attrs };
  if (e.tag === 'path') {
    attrs.fill = c.has('nf') ? 'none' : palette[0];
    attrs.stroke = c.has('hi') ? palette[4] : c.has('lo') ? palette[3] : c.has('sil') ? palette[2] : palette[1];
    attrs['stroke-width'] = '.9'; attrs['stroke-linejoin'] = 'round'; attrs['stroke-linecap'] = 'round';
    if (c.has('dash')) attrs['stroke-dasharray'] = '1 3';
  }
  return `<${e.tag} ${Object.entries(attrs).map(([k,v]) => `${k}="${v}"`).join(' ')}>${e.children.map(q => serialize(q, dark)).join('')}</${e.tag}>`;
}
async function render(model, name, { dark = false, width = 800 } = {}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="${width}" height="${width * .8}"><rect width="400" height="320" fill="${dark ? '#08090a' : '#fff'}"/>${model.svg.children.map(e => serialize(e, dark)).join('')}</svg>`;
  fs.writeFileSync(`${out}/verify-pngs/${name}.svg`, svg);
  await sharp(Buffer.from(svg)).png().toFile(`${out}/verify-pngs/${name}.png`);
}
const original = load('vise', 38), sol = load('vise-sol', 38);
const evidence = { method: 'Actual kernel geometry in a simulated SVG DOM; librsvg rasterization, NOT browser evidence', original: {}, solution: {} };
for (const [name, m, z] of [['original', original, 46], ['solution', sol, 55]]) {
  evidence[name].sourceMatchesEmbedded = m.html === assemble(m.code);
  evidence[name].lines = m.code.trimEnd().split('\n').length;
  evidence[name].rest = m.stats(); await render(m, `${name}-rest`);
  m.target(-43, 0, z); evidence[name].closed = m.stats(); await render(m, `${name}-closed`);
  m.handle.set(name === 'original' ? 56 : 48);
  m.target(name === 'original' ? 31 : 15, 0, name === 'original' ? 0 : z); evidence[name].maximum = m.stats(); await render(m, `${name}-maximum`);
  const before = m.paths().reduce((n,p) => n + p.writes, 0);
  evidence[name].idleReturns = m.tick();
  evidence[name].idlePathWrites = m.paths().reduce((n,p) => n + p.writes, 0) - before;
}
assert.equal(sol.stats().highlight, 1); assert.equal(evidence.solution.idlePathWrites, 0);
assert.equal(evidence.solution.lines < 200, true);
evidence.solution.sweep = [];
for (const reach of [16, 30, 48]) {
  sol.handle.set(reach);
  for (const x of [-44, -43, -25, -5, 15, 31]) {
    sol.target(x); const s = sol.stats();
    assert.ok(s.finite && s.box[0] > 0 && s.box[1] > 0 && s.box[2] < 400 && s.box[3] < 320);
    assert.equal(s.highlight, 1); evidence.solution.sweep.push({ reach, x, ...s });
  }
}
evidence.solution.crankSweep = { poses: 0, minimumMargin: 400 };
sol.handle.set(48);
for (let gap = 0; gap <= 48; gap += 0.5) {
  sol.target(gap - 42.7); const s = sol.stats();
  const margin = Math.min(s.box[0], s.box[1], 400 - s.box[2], 320 - s.box[3]);
  assert.ok(margin > 0 && s.finite);
  evidence.solution.crankSweep.poses++;
  evidence.solution.crankSweep.minimumMargin = Math.min(evidence.solution.crankSweep.minimumMargin, margin);
}
evidence.solution.geometryContract = { fixedContactX: -42.7, movingClosedFaceX: -42.7,
  fixedFootEndX: -43, movingFootMinimumX: -42.7, maximumMovingEndX: -42.7 + 48 + 26,
  bearingFootStartsX: 42, minimumBearingClearance: 42 - (-42.7 + 48 + 26) };
assert.ok(evidence.solution.geometryContract.minimumBearingClearance > 0);
sol.handle.set(38); sol.target(-29); await render(sol, 'solution-active');
await render(sol, 'solution-active-dark', { dark: true });
sol.input.leave(); sol.settle(); assert.equal(sol.stats().read, 'rest'); assert.equal(sol.stats().highlight, 1);
for (const width of [240, 375, 768, 874, 971, 1440]) await render(sol, `solution-rest-${width}`, { width });
const first = JSON.stringify(sol.paths().map(e => e.attrs.d));
sol.target(15); sol.input.leave(); sol.settle();
assert.equal(JSON.stringify(sol.paths().map(e => e.attrs.d)), first);
sol.H.setReducedMotion(true); sol.target(-43); evidence.solution.reduced = sol.stats();
sol.handle.destroy(); assert.equal(sol.svg.children.length, 0); evidence.solution.destroyChildren = 0;
const negative = validate(assemble(sol.code.replace('class: "nf lo"', 'class: "nf lo", fill: "red"')));
assert.ok(negative.some(x => x.startsWith('paint:'))); evidence.negativePaintControl = negative;
fs.writeFileSync(`${out}/probe.json`, JSON.stringify(evidence, null, 2) + '\n');
const images = ['original-rest', 'solution-rest', 'original-maximum', 'solution-maximum'];
const tiles = await Promise.all(images.map(async (name, i) => {
  const label = Buffer.from(`<svg width="800" height="40"><rect width="800" height="40" fill="#f1f1f1"/><text x="16" y="27" font-family="sans-serif" font-size="19">${name} — kernel geometry / non-browser render</text></svg>`);
  return [{ input: `${out}/verify-pngs/${name}.png`, left: i % 2 * 800, top: Math.floor(i / 2) * 680 + 40 },
    { input: label, left: i % 2 * 800, top: Math.floor(i / 2) * 680 }];
}));
await sharp({ create: { width: 1600, height: 1360, channels: 4, background: '#fff' } }).composite(tiles.flat()).png().toFile(`${out}/verify-pngs/comparison.png`);
console.log(JSON.stringify({ ...evidence, solution: { ...evidence.solution, sweep: `18 geometry poses passed; see ${out}/probe.json` } }, null, 2));
