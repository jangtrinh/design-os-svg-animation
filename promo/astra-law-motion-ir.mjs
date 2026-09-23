const SVG_NS = 'http://www.w3.org/2000/svg';

function pointPlus(point, offset) { return [point[0] + offset[0], point[1] + offset[1]]; }

function contourPath(contour) {
  const vertices = contour.vertices;
  const commands = [`M${vertices[0].p.join(' ')}`];
  const count = contour.closed ? vertices.length : vertices.length - 1;
  for (let index = 0; index < count; index++) {
    const from = vertices[index];
    const to = vertices[(index + 1) % vertices.length];
    commands.push(`C${pointPlus(from.p, from.out).join(' ')} ${pointPlus(to.p, to.in).join(' ')} ${to.p.join(' ')}`);
  }
  if (contour.closed) commands.push('Z');
  return commands.join(' ');
}

function bezier(progress, { x1, y1, x2, y2 }) {
  const curve = (a, b, t) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
  let low = 0;
  let high = 1;
  for (let index = 0; index < 16; index++) {
    const mid = (low + high) / 2;
    if (curve(x1, x2, mid) < progress) low = mid;
    else high = mid;
  }
  return curve(y1, y2, (low + high) / 2);
}

export function sampleTrack(track, milliseconds) {
  const keys = track.keyframes;
  if (milliseconds <= keys[0].timeMs) return keys[0].value;
  if (milliseconds >= keys.at(-1).timeMs) return keys.at(-1).value;
  for (let index = 1; index < keys.length; index++) {
    const next = keys[index];
    if (milliseconds > next.timeMs) continue;
    const previous = keys[index - 1];
    const progress = (milliseconds - previous.timeMs) / (next.timeMs - previous.timeMs);
    const amount = next.ease.kind === 'hold' ? 0 : next.ease.kind === 'cubic-bezier' ? bezier(progress, next.ease) : progress;
    if (Array.isArray(next.value)) return next.value.map((value, component) => previous.value[component] + (value - previous.value[component]) * amount);
    return previous.value + (next.value - previous.value) * amount;
  }
  return keys.at(-1).value;
}

export async function loadMotionIR(svg) {
  const response = await fetch('astra-law.motion.json');
  if (!response.ok) throw new Error(`Motion IR load failed: HTTP ${response.status}`);
  const ir = await response.json();
  if (ir.version !== '0.1.0' || ir.timeline.durationMs !== 77594) throw new Error('Motion IR contract mismatch');
  const elements = new Map();
  for (const node of ir.scene.nodes) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', node.path.contours.map(contourPath).join(' '));
    path.setAttribute('fill-rule', node.path.fillRule);
    const rgba = node.style.fill;
    path.style.fill = `rgb(${rgba.slice(0, 3).map(value => Math.round(value * 255)).join(' ')})`;
    path.style.transformOrigin = `${node.transform.pivot[0]}px ${node.transform.pivot[1]}px`;
    path.style.transformBox = 'view-box';
    svg.append(path);
    elements.set(node.id, path);
  }
  return time => {
    const milliseconds = matchMedia('(prefers-reduced-motion: reduce)').matches && ir.accessibility.reducedMotion.mode === 'static'
      ? ir.accessibility.reducedMotion.atMs : time * 1000;
    for (const node of ir.scene.nodes) {
      const path = elements.get(node.id);
      const tracks = ir.tracks.filter(track => track.targetId === node.id);
      const values = Object.fromEntries(tracks.map(track => [track.property, sampleTrack(track, milliseconds)]));
      const [x, y] = values.translate || node.transform.translate;
      const [scaleX, scaleY] = values.scale || node.transform.scale;
      path.style.transform = `translate3d(${x}px,${y}px,0) scale(${scaleX},${scaleY}) rotate(${values.rotate || node.transform.rotate}deg)`;
      path.style.opacity = values.opacity ?? node.style.opacity;
    }
  };
}
