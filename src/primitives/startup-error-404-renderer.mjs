/**
 * startup-error-404-renderer.mjs — SVG markup and per-frame transforms for the
 * "startup errors" 404 illustration.
 *
 * Layers, back to front:
 *   1. the 404 numerals (far layer);
 *   2. the man: filled silhouettes (paper colour, hide the numerals), then his art in the
 *      source's own paint order, one <g> per run of consecutive elements of one part;
 *   3. the bubbles ("?", "!", X): their sticker edges first, then per bubble a paper fill,
 *      hidden strokes, art (its glyph in its own <g>). The X bubble is drawn last so it keeps
 *      covering the "!" ring as in the source, and no sticker edge cuts into the ring.
 * Child parts are composed with their parent: eyes and cheeks ride the head, the middle
 * finger rides the forearm, a glyph rides its bubble.
 * The silhouettes also carry a paper-coloured stroke: invisible on the light page, a die-cut
 * sticker edge on the dark one (--se404-sticker).
 */

import { STARTUP_ERROR_404_GEOMETRY as G } from './startup-error-404-geometry.mjs';
import { STARTUP_ERROR_PIVOTS, sampleStartupErrorState } from './startup-error-404-motion.mjs';

/** Art bounds plus room for the bob, buzz and pop overshoot. */
export const STARTUP_ERROR_VIEWBOX = Object.freeze([230, 330, 2540, 2300]);
const FIGURE_PARTS = ['body', 'laptop', 'arm', 'finger', 'head', 'eyes', 'cheek-left', 'cheek-right'];
const HEAD_CHILDREN = ['cheek-left', 'cheek-right'];
const BUBBLES = ['bubble-question', 'bubble-alert', 'bubble-error'];
const STICKER_EDGE = 36; // source units

/** fill "paper": a synthetic opaque fill that takes the page's paper/sticker colour. */
const paint = fill => (fill === 'paper' ? 'class="se404-paper"' : `fill="${fill}"`);
const drawElement = e => (e.ellipse
  ? `<ellipse ${Object.entries(e.ellipse).map(([k, v]) => `${k}="${v}"`).join(' ')} ${paint(e.fill)}/>`
  : `<path d="${e.d}" ${paint(e.fill)}/>`);
const silhouette = part => `<path class="se404-silhouette" d="${G.silhouettes[part]}"/>`;

/** Consecutive elements of the same part become one <g data-part>, preserving paint order. */
function runs(elements) {
  const out = [];
  for (const e of elements) {
    if (out.at(-1)?.part === e.part) out.at(-1).items.push(e);
    else out.push({ part: e.part, items: [e] });
  }
  return out.map(r => `<g data-part="${r.part}">${r.items.map(drawElement).join('')}</g>`).join('');
}

export function renderStartupErrorSVG() {
  const figureArt = runs(G.elements.filter(e => FIGURE_PARTS.includes(e.part)));
  // Two layers per bubble, one transform: all sticker edges first (they may not cut into a
  // neighbour's outline), then per bubble an edgeless paper fill (the X still covers the
  // hidden part of the "!" ring), its hidden strokes and its art.
  const bubbleEdge = part => `<g class="se404-bubble-edge" data-part="${part}">${silhouette(part)}</g>`;
  const bubble = part => {
    const hidden = (G.hiddenStrokes?.[part] ?? [])
      .map(s => `<path d="${s.d}" fill="none" stroke="${s.stroke}" stroke-width="${s.strokeWidth}" stroke-linecap="round"/>`).join('');
    const art = runs(G.elements.filter(e => e.part === part || e.part === `${part}-glyph`));
    return `<g class="se404-bubble" data-part="${part}"><path class="se404-paper" d="${G.silhouettes[part]}"/>${hidden}${art}</g>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${STARTUP_ERROR_VIEWBOX.join(' ')}" role="img" aria-labelledby="se404-title" class="se404">
<title id="se404-title">A man on a folding chair stares at his laptop while error bubbles pop up around him: a question mark, a red X and an exclamation mark.</title>
<style>.se404-paper{fill:var(--se404-sticker,#fff)}.se404-silhouette{fill:var(--se404-sticker,#fff);stroke:var(--se404-sticker,#fff);stroke-width:${STICKER_EDGE};stroke-linejoin:round}</style>
<g class="se404-numerals" aria-hidden="true"><text x="1500" y="1930" text-anchor="middle">404</text></g>
<g class="se404-figure">${silhouette('body')}<g data-part="head">${silhouette('head')}</g>${figureArt}</g>
${BUBBLES.map(bubbleEdge).join('')}
${BUBBLES.map(bubble).join('\n')}
</svg>`;
}

const fmt = v => (Math.abs(v) < 1e-4 ? 0 : Number(v.toFixed(3)));

/** transform attribute for { tx, ty, rot, sx, sy } about pivot [px, py]. */
export function partTransform({ tx = 0, ty = 0, rot = 0, sx = 1, sy = 1 }, [px, py] = [0, 0]) {
  return `translate(${fmt(px + tx)} ${fmt(py + ty)}) rotate(${fmt(rot)}) scale(${fmt(sx)} ${fmt(sy)}) translate(${-px} ${-py})`;
}

/** Eyes (relative to the head): look (translate), then blink about their own centre. */
function eyesTransform(eyes) {
  const [ex, ey] = STARTUP_ERROR_PIVOTS.eyes;
  return `translate(${fmt(eyes.tx)} ${fmt(eyes.ty)}) translate(${ex} ${ey}) scale(1 ${fmt(eyes.sy)}) translate(${-ex} ${-ey})`;
}

const nodeCache = new WeakMap();
function nodes(svg) {
  if (!nodeCache.has(svg)) {
    const all = sel => [...svg.querySelectorAll(sel)];
    nodeCache.set(svg, {
      figure: svg.querySelector('.se404-figure'),
      numerals: svg.querySelector('.se404-numerals'),
      parts: Object.fromEntries(FIGURE_PARTS.map(p => [p, all(`.se404-figure [data-part="${p}"]`)])),
      bubbles: Object.fromEntries(BUBBLES.map(b => [b, all(`.se404-bubble[data-part="${b}"], .se404-bubble-edge[data-part="${b}"]`)])),
      glyphs: Object.fromEntries(BUBBLES.map(b => [b, all(`[data-part="${b}-glyph"]`)])),
    });
  }
  return nodeCache.get(svg);
}

/** Apply a state from sampleStartupErrorState (optionally plus the live layer). */
export function applyStartupErrorState(svg, state) {
  const n = nodes(svg);
  n.figure.setAttribute('transform', partTransform(state.figure));
  n.figure.style.opacity = fmt(state.figure.opacity);
  n.numerals.setAttribute('transform', partTransform(state.numerals));
  n.numerals.style.opacity = fmt(state.numerals.opacity);
  const set = (part, transform) => n.parts[part].forEach(g => g.setAttribute('transform', transform));
  const head = partTransform(state.head, STARTUP_ERROR_PIVOTS.head);
  const arm = partTransform(state.arm, STARTUP_ERROR_PIVOTS.arm);
  set('head', head);
  set('eyes', `${head} ${eyesTransform(state.eyes)}`);
  for (const cheek of HEAD_CHILDREN) set(cheek, `${head} ${partTransform(state[cheek], STARTUP_ERROR_PIVOTS[cheek])}`);
  set('laptop', partTransform(state.laptop, STARTUP_ERROR_PIVOTS.laptop));
  set('arm', arm);
  set('finger', `${arm} ${partTransform(state.finger, STARTUP_ERROR_PIVOTS.finger)}`);
  for (const b of BUBBLES) {
    const transform = partTransform(state[b], STARTUP_ERROR_PIVOTS[b]);
    n.bubbles[b].forEach(g => { g.setAttribute('transform', transform); g.style.opacity = fmt(state[b].opacity); });
    const glyph = state[`${b}-glyph`];
    if (glyph) n.glyphs[b].forEach(g => g.setAttribute('transform', partTransform(glyph, STARTUP_ERROR_PIVOTS[`${b}-glyph`])));
  }
}

export const renderStartupErrorAt = (svg, t, options) => applyStartupErrorState(svg, sampleStartupErrorState(t, options));
