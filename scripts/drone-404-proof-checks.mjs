/**
 * drone-404-proof-checks.mjs — proof steps that used to be run by hand, now part of
 * render-drone-404-deliverable.mjs so evidence can never mix revisions:
 *   - clearStaleProofs: remove every generated proof before a run (stale keyframes from an
 *     older timeline once reached a contact sheet and a commit);
 *   - flightProfile: plot bank angle and position over one loop — the chart the motion
 *     feel was tuned against ("wobble slightly, then stable");
 *   - fidelity: rasterise the traced geometry alone and diff it against the reference drawing;
 *   - encodedContactSheet: frames pulled from the ENCODED MP4 (not the browser), explicit list.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DRONE_TIMING, sampleDroneState } from '../src/primitives/drone-404-motion.mjs';

// Every file in the proofs dir must match this: anything else is a manual capture and belongs elsewhere.
const GENERATED = /^(frame-t[\d.]+|page-.*|interaction-.*|theme-switch-.*|fidelity-.*|flight-bank-profile|mp4-contact-sheet|timeline-contact-sheet)\.(png|txt)$/;

export function clearStaleProofs(dir, { keep = [] } = {}) {
  if (!fs.existsSync(dir)) return 0;
  const stale = fs.readdirSync(dir).filter(name => GENERATED.test(name) && !keep.includes(name));
  stale.forEach(name => fs.rmSync(path.join(dir, name)));
  return stale.length;
}

/** Bank angle (black) and horizontal position (grey) across one steady loop, as a PNG. */
export async function flightProfile(browser, file) {
  const { seamlessFrom: t0, loopPeriod: P } = DRONE_TIMING;
  const W = 1400;
  const H = 520;
  const pad = 60;
  const X = u => pad + (u / P) * (W - 2 * pad);
  const bankY = deg => H / 2 - deg * 12;
  const posY = x => H / 2 - x * 0.35;
  let bank = '';
  let pos = '';
  let maxBank = 0;
  for (let u = 0; u <= P; u += 0.01) {
    const s = sampleDroneState(t0 + u);
    maxBank = Math.max(maxBank, Math.abs(s.drone.rotate));
    bank += `${bank ? 'L' : 'M'}${X(u).toFixed(1)},${bankY(s.drone.rotate).toFixed(1)}`;
    pos += `${pos ? 'L' : 'M'}${X(u).toFixed(1)},${posY(s.drone.x).toFixed(1)}`;
  }
  const grid = [-10, -5, 0, 5, 10].map(d => `<line x1="${pad}" x2="${W - pad}" y1="${bankY(d)}" y2="${bankY(d)}" stroke="#e5e5e5"/><text x="10" y="${bankY(d) + 4}" font-size="12" fill="#888">${d}°</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + 40}" font-family="Arial"><rect width="100%" height="100%" fill="#fff"/>${grid}<path d="${pos}" fill="none" stroke="#bbb" stroke-width="2"/><path d="${bank}" fill="none" stroke="#111" stroke-width="2.5"/><text x="${pad}" y="${H + 25}" font-size="14" fill="#111">bank angle (black, deg) and horizontal position (grey, scaled) over one ${P} s loop · max |bank| ${maxBank.toFixed(1)}°</text></svg>`;
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H + 40 });
  await page.setContent(`<body style="margin:0">${svg}</body>`);
  await page.screenshot({ path: file });
  await page.close();
  return maxBank;
}

/** Contact sheet of frames decoded from the encoded video at the given times. */
export function encodedContactSheet(video, times, file, workDir, { crop = null } = {}) {
  fs.rmSync(workDir, { recursive: true, force: true });
  fs.mkdirSync(workDir, { recursive: true });
  const frames = times.map(t => {
    const frame = path.join(workDir, `t${t.toFixed(1)}.png`);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', video, '-frames:v', '1', '-vf', `${crop ? `crop=${crop},` : ''}scale=640:-1`, frame]);
    return frame;
  });
  execFileSync('magick', ['montage', ...frames, '-tile', '4x', '-geometry', '+4+4', file]);
  fs.rmSync(workDir, { recursive: true, force: true });
}

/**
 * Rasterise traced geometry on its own and measure it against the reference drawing, on INK
 * (not canvas) pixels: recall = share of reference ink with traced ink within `tolerancePx`,
 * precision = the reverse. A blank or shifted trace scores near 0, so it cannot pass.
 * Writes fidelity-trace-render.png, fidelity-overlay.png (reference red, trace cyan,
 * agreement black) and fidelity-metric.txt. Throws below `minimum`.
 */
export async function fidelity(browser, { geometry, reference, outDir, tolerancePx = 2, minimum = 0.98 }) {
  if (geometry.elements) return colorFidelity(browser, { geometry, reference, outDir, minimum });
  const { width, height, segments, strokeWidth = 2.2, viewBox = [0, 0, width, height] } = geometry;
  const render = path.join(outDir, 'fidelity-trace-render.png');
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;background:#fff"><svg viewBox="${viewBox.join(' ')}" width="${width}" height="${height}" fill="none" stroke="#000" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${segments.map(s => `<path d="${s.d}"/>`).join('')}</svg></body>`);
  await page.screenshot({ path: render });
  await page.close();
  execFileSync('magick', [
    '(', reference, '-fuzz', '60%', '-fill', 'red', '-opaque', 'black', ')',
    '(', render, '-fuzz', '60%', '-fill', 'cyan', '-opaque', 'black', ')',
    '-compose', 'multiply', '-composite', path.join(outDir, 'fidelity-overlay.png'),
  ]);
  const ink = file => ['(', file, '-colorspace', 'gray', '-threshold', '50%', '-negate', ')'];
  const pixels = args => {
    const value = Number(String(execFileSync('magick', [...args, '-format', '%[fx:mean*w*h]', 'info:'])).trim());
    if (!Number.isFinite(value)) throw new Error('fidelity: could not read a pixel count from ImageMagick');
    return value;
  };
  const covered = (a, b) => pixels([...ink(a), '(', ...ink(b), '-morphology', 'Dilate', `Disk:${tolerancePx}`, ')', '-compose', 'multiply', '-composite']);
  const refInk = pixels(ink(reference));
  const traceInk = pixels(ink(render));
  if (!refInk || !traceInk) throw new Error(`fidelity: no ink found (reference ${refInk}, trace ${traceInk})`);
  const recall = covered(reference, render) / refInk;
  const precision = covered(render, reference) / traceInk;
  fs.writeFileSync(path.join(outDir, 'fidelity-metric.txt'),
    `reference ink within ${tolerancePx}px of the trace (recall): ${(recall * 100).toFixed(2)}%\ntrace ink within ${tolerancePx}px of the reference (precision): ${(precision * 100).toFixed(2)}%\nreference ink ${refInk}px, trace ink ${traceInk}px, minimum ${minimum * 100}%\n`);
  if (recall < minimum || precision < minimum) throw new Error(`fidelity below ${minimum * 100}%: recall ${(recall * 100).toFixed(2)}%, precision ${(precision * 100).toFixed(2)}%`);
  return { recall, precision };
}

/**
 * Color-mode fidelity for filled vector art: render the part module (every element, original
 * fills, original paint order) and count the pixels whose colour differs from the reference
 * by more than `fuzzPercent`, over the union of both images' painted (non-white) area. A
 * blank or shifted render fails because the union keeps the reference's own area. Mismatch
 * runs thinner than `tolerancePx` on each side (anti-aliased edges) are eroded away first.
 */
async function colorFidelity(browser, { geometry, reference, outDir, minimum, fuzzPercent = 12, tolerancePx = 1 }) {
  const { width, height, viewBox, elements } = geometry;
  const render = path.join(outDir, 'fidelity-trace-render.png');
  const draw = e => (e.ellipse
    ? `<ellipse ${Object.entries(e.ellipse).map(([k, v]) => `${k}="${v}"`).join(' ')} fill="${e.fill}"/>`
    : `<path d="${e.d}" fill="${e.fill}"/>`);
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;background:#fff"><svg viewBox="${viewBox.join(' ')}" width="${width}" height="${height}" style="display:block">${elements.filter(e => !e.synthetic).map(draw).join('')}</svg></body>`);
  await page.screenshot({ path: render });
  await page.close();
  const match = colorMatch(reference, render, { outDir, name: 'fidelity', minimum, fuzzPercent, tolerancePx });
  return { recall: match, precision: match, mode: 'color' };
}

/**
 * The live page's rest pose must equal the reference, not just the geometry module: the
 * renderer adds layers (paper silhouettes, synthetic fills, hidden strokes) that could cover
 * source art. Load the page with reduced motion (the still rest pose) in the light scheme,
 * reframe `selector` to the reference's viewBox and size, hide the page-only layers
 * (`hide`, e.g. the 404 numerals), screenshot it and run the colour match.
 */
export async function pageRestFidelity(browser, { url, selector, hide = [], viewBox, width, height, reference, outDir, minimum = 0.98 }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'light' },
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ]);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(({ selector, hide, viewBox, width, height }) => {
    document.body.style.background = '#fff';
    const svg = document.querySelector(selector);
    svg.setAttribute('viewBox', viewBox.join(' '));
    Object.assign(svg.style, { position: 'fixed', left: '0', top: '0', width: `${width}px`, height: `${height}px`, maxWidth: 'none', zIndex: '1000', background: '#fff' });
    for (const sel of hide) document.querySelectorAll(sel).forEach(node => { node.style.display = 'none'; });
  }, { selector, hide, viewBox, width, height });
  const render = path.join(outDir, 'page-rest-render.png');
  await page.screenshot({ path: render, clip: { x: 0, y: 0, width, height } });
  await page.close();
  return colorMatch(reference, render, { outDir, name: 'page-rest-fidelity', minimum });
}

/**
 * Share of painted pixels (union of both images' non-white area) whose colour is within
 * `fuzzPercent` of the reference on every channel, after eroding mismatch runs thinner than `tolerancePx`
 * (anti-aliased edges). Writes <name>-overlay.png and <name>-metric.txt; throws below minimum.
 */
function colorMatch(reference, render, { outDir, name, minimum, fuzzPercent = 12, tolerancePx = 1 }) {
  const count = args => {
    const value = Number(String(execFileSync('magick', [...args, '-format', '%[fx:mean*w*h]', 'info:'])).trim());
    if (!Number.isFinite(value)) throw new Error(`${name}: could not read a pixel count from ImageMagick`);
    return value;
  };
  const painted = file => ['(', file, '-alpha', 'off', '-fuzz', '4%', '-fill', 'black', '-opaque', 'white', '-fuzz', '0', '-fill', 'white', '+opaque', 'black', '-colorspace', 'gray', ')'];
  const union = ['(', ...painted(reference), ...painted(render), '-compose', 'lighten', '-composite', ')'];
  const area = count(union);
  const refArea = count(painted(reference));
  if (!refArea || !count(painted(render))) throw new Error(`${name}: nothing painted in the reference or the render`);
  // per-channel max, not luminance: a pale layer of another hue (a peach 404 on white) is a
  // ~17% blue-channel difference but only ~9% in luminance, and must not pass
  const differs = ['(', reference, '-alpha', 'off', render, '-alpha', 'off', '-compose', 'difference', '-composite',
    '-separate', '-evaluate-sequence', 'max', '-threshold', `${fuzzPercent}%`, '-morphology', 'Erode', `Square:${tolerancePx}`, ')'];
  const mismatch = count([...differs, ...union, '-compose', 'multiply', '-composite']);
  execFileSync('magick', [reference, render, '-compose', 'difference', '-composite', '-negate', path.join(outDir, `${name}-overlay.png`)]);
  const match = 1 - mismatch / area;
  fs.writeFileSync(path.join(outDir, `${name}-metric.txt`),
    `painted pixels matching the reference colour within ${fuzzPercent}% (edge tolerance ${tolerancePx}px): ${(match * 100).toFixed(2)}%\nmismatched ${mismatch}px of ${area}px painted (reference ${refArea}px), minimum ${minimum * 100}%\n`);
  if (match < minimum) throw new Error(`${name} below ${minimum * 100}%: colour match ${(match * 100).toFixed(2)}%`);
  return match;
}
