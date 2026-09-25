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
export function encodedContactSheet(video, times, file, workDir) {
  fs.rmSync(workDir, { recursive: true, force: true });
  fs.mkdirSync(workDir, { recursive: true });
  const frames = times.map(t => {
    const frame = path.join(workDir, `t${t.toFixed(1)}.png`);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', video, '-frames:v', '1', '-vf', 'crop=1500:840:210:40,scale=640:-1', frame]);
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
  const { width, height, segments, strokeWidth = 2.2 } = geometry;
  const render = path.join(outDir, 'fidelity-trace-render.png');
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;background:#fff"><svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" fill="none" stroke="#000" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${segments.map(s => `<path d="${s.d}"/>`).join('')}</svg></body>`);
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
