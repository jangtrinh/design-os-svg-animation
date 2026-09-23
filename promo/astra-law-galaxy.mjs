import { GALAXY_POINTS_BASE64 } from './astra-law-galaxy-points.mjs';
import { clamp, mix, progress, randomGenerator } from './astra-law-timeline.mjs';

const WIDTH = 1920;
const HEIGHT = 1080;

export function createGalaxy() {
  const root = document.getElementById('spiral-stars');
  const random = randomGenerator(20260917);
  const binary = atob(GALAXY_POINTS_BASE64);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  const view = new DataView(bytes.buffer);
  const stars = [];
  function addStar(x, y, size, brightness, field = false, glint = false) {
    const dot = document.createElement('i');
    dot.className = `star${field ? ' star-field' : ''}${glint ? ' star-glint' : ''}`;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    if (size >= 5) dot.style.boxShadow = `0 0 ${Math.round(size * 2.4)}px ${Math.round(size / 2)}px #bdcfff55`;
    root.append(dot);
    const burstAngle = -Math.PI / 2 + (random() - 0.5) * Math.PI * 1.7;
    const burstRadius = 120 + random() * 850;
    stars.push({ dot, x, y, field, burstAngle, burstRadius, brightness,
      activation: random(), streamOffsetX: (random() - 0.5) * 320, streamOffsetY: (random() - 0.5) * 160 });
  }
  for (let offset = 0; offset < bytes.length; offset += 6) {
    const x = view.getUint16(offset, true);
    const y = view.getUint16(offset + 2, true);
    const size = bytes[offset + 4];
    addStar(x, y, size, clamp(bytes[offset + 5] / 260, 0.32, 1));
  }
  for (let index = 0; index < 480; index++) {
    const x = random() * WIDTH, y = random() * HEIGHT;
    addStar(x, y, random() > 0.94 ? 2 : 1, 0.16 + random() * 0.36, true);
  }
  for (const [x, y, size] of [[81, 108, 13], [1654, 172, 13], [127, 704, 15], [392, 11, 4], [1775, 294, 4]]) {
    addStar(x, y, size, 1, true, size >= 13);
  }
  return stars;
}

export function renderGalaxy(stars, time, still) {
  if (time < 7.38 || time > 10.65) return;
  const burst = still ? 1 : progress(time, 7.48, 8.05);
  const spiral = still ? 1 : progress(time, 8.5, 9.2);
  const cinch = still ? 1 : progress(time, 8.05, 8.5);
  const stream = still ? 1 : progress(time, 8.05, 8.5);
  const reveal = still ? 1 : progress(time, 7.55, 8.6);
  const drift = still ? 0 : (time - 9.2) * 0.018;
  for (const star of stars) {
    const bx = 960 + Math.cos(star.burstAngle) * star.burstRadius * burst * mix(1, 0.48, cinch);
    const by = 540 + Math.sin(star.burstAngle) * star.burstRadius * burst * mix(1, 1.2, cinch);
    const dx = star.x - 960, dy = star.y - 540;
    const sx = 960 + dx * Math.cos(drift) - dy * Math.sin(drift);
    const sy = 540 + dx * Math.sin(drift) + dy * Math.cos(drift);
    const streamX = 960 + dx * 0.62 + star.streamOffsetX;
    const streamY = 540 + dy * 1.42 + star.streamOffsetY;
    const x = star.field ? star.x : mix(mix(bx, streamX, stream), sx, spiral);
    const y = star.field ? star.y : mix(mix(by, streamY, stream), sy, spiral);
    const length = star.field ? 1 : mix(mix(10, 2.5, cinch), 1, spiral);
    const thickness = star.field ? 1 : mix(0.38, 1, spiral);
    const rotation = star.field ? 0 : star.burstAngle * 180 / Math.PI;
    star.dot.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${rotation.toFixed(2)}deg) scale(${length.toFixed(2)},${thickness.toFixed(2)})`;
    const entry = star.activation < reveal ? 1 : 0;
    const burstLight = 0.68 + 0.30 * Math.pow(1 - star.activation, 4);
    star.dot.style.opacity = (star.field ? star.brightness : clamp(star.brightness * entry * mix(burstLight * 1.2, 1, spiral))).toFixed(3);
  }
}
