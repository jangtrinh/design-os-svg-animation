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
    // The source spiral is a textured cloud, not a single dotted contour.
    if (offset % 12 === 0) addStar(x + (random() - 0.5) * 20, y + (random() - 0.5) * 20,
      Math.max(1, size * 0.55), clamp(bytes[offset + 5] / 460, 0.18, 0.54));
  }
  for (let index = 0; index < 480; index++) {
    const x = random() * WIDTH, y = random() * HEIGHT;
    addStar(x, y, random() > 0.94 ? 2 : 1, 0.16 + random() * 0.36, true);
  }
  for (const [x, y, size] of [[81, 108, 13], [1654, 172, 13], [127, 704, 15], [392, 11, 4], [1775, 294, 4]]) {
    addStar(x, y, size, 1, true, size >= 13);
  }
  stars.glows = [[80, 110, 120, '#f3f0f4'], [110, 710, 155, '#ece9ef'],
    [575, 1035, 175, '#ffdfd6'], [1565, 930, 210, '#8ebcd0'],
    [1860, 340, 100, '#dce4ee']].map(([x, y, size, color]) => {
    const glow = document.createElement('i');
    glow.className = 'warp-glow';
    glow.style.width = `${size}px`;
    glow.style.height = `${size * 0.62}px`;
    glow.style.background = `radial-gradient(ellipse,${color} 0%,${color}88 28%,transparent 73%)`;
    root.append(glow);
    return { glow, x, y };
  });
  return stars;
}

export function renderGalaxy(stars, time, still) {
  if (time < 7.38 || time > 10.8) return;
  const burst = still ? 1 : progress(time, 7.7, 8.15);
  const spiral = still ? 1 : progress(time, 8.5, 9.2);
  const cinch = still ? 1 : progress(time, 8.05, 8.5);
  const stream = still ? 1 : progress(time, 8.05, 8.5);
  const reveal = still ? 1 : progress(time, 7.72, 8.6);
  const fieldArrival = still ? 1 : mix(0.08, 1, progress(time, 7.65, 7.9));
  const orbitTime = still ? 0 : clamp(time - 8.8, 0, 1.6);
  const exitWarp = still ? 0 : progress(time, 10.42, 10.55);
  const root = stars[0].dot.parentElement;
  root.classList.toggle('exit-warp', exitWarp > 0.05);
  root.style.filter = still ? 'none' : `blur(${(exitWarp * 3.5).toFixed(2)}px)`;
  for (const { glow, x, y } of stars.glows) {
    glow.style.opacity = still ? '0' : (0.75 * progress(time, 10.45, 10.58) * (1 - progress(time, 10.7, 10.8))).toFixed(3);
    glow.style.transform = `translate3d(${mix(960, x, exitWarp).toFixed(1)}px,${mix(540, y, exitWarp).toFixed(1)}px,0)`;
  }
  for (const star of stars) {
    const bx = 960 + Math.cos(star.burstAngle) * star.burstRadius * burst * mix(1, 0.48, cinch);
    const by = 540 + Math.sin(star.burstAngle) * star.burstRadius * burst * mix(1, 1.2, cinch);
    const dx = star.x - 960, dy = star.y - 540;
    const radius = Math.hypot(dx, dy);
    const drift = orbitTime * mix(-0.47, -0.18, clamp(radius / 900));
    const sx = 960 + dx * Math.cos(drift) - dy * Math.sin(drift);
    const sy = 540 + dx * Math.sin(drift) + dy * Math.cos(drift);
    const streamX = 960 + dx * 0.62 + star.streamOffsetX;
    const streamY = 540 + dy * 1.42 + star.streamOffsetY;
    const x = star.field ? star.x : mix(mix(bx, streamX, stream), sx, spiral);
    const y = star.field ? star.y : mix(mix(by, streamY, stream), sy, spiral);
    const flight = mix(1, 5.2, exitWarp);
    const warpedX = 960 + (x - 960) * flight;
    const warpedY = 540 + (y - 540) * flight;
    const length = mix(star.field ? 1 : mix(mix(10, 1, cinch), 1, spiral), star.field ? 12 : 46, exitWarp);
    const thickness = mix(star.field ? 1 : mix(0.38, 1, spiral), star.field ? 2.5 : 2.1, exitWarp);
    const rotation = exitWarp > 0 ? Math.atan2(y - 540, x - 960) * 180 / Math.PI
      : star.field ? 0 : star.burstAngle * 180 / Math.PI;
    star.dot.style.transform = `translate3d(${warpedX.toFixed(2)}px,${warpedY.toFixed(2)}px,0) rotate(${rotation.toFixed(2)}deg) scale(${length.toFixed(2)},${thickness.toFixed(2)})`;
    const entry = star.activation < reveal ? 1 : 0;
    const burstLight = 0.68 + 0.30 * Math.pow(1 - star.activation, 4);
    star.dot.style.opacity = ((star.field ? star.brightness * fieldArrival : clamp(star.brightness * entry * mix(burstLight * 1.2, 1, spiral))) * mix(1, 0.35, exitWarp)).toFixed(3);
  }
}
