const status = document.querySelector('#status');
const checks = [];
async function probe(name, task) {
  try { const result = await task(); checks.push(`${name}: PASS — ${result}`); }
  catch (error) { checks.push(`${name}: FAIL — ${error.message}`); }
  status.textContent = checks.join('\n');
}
await probe('Paper', async () => {
  const { default: paper } = await import('paper');
  const scope = new paper.PaperScope();
  scope.setup(new scope.Size(128, 128));
  const line = new scope.Path.Line(new scope.Point(0, 0), new scope.Point(3, 4));
  if (Math.abs(line.length - 5) > 1e-6) throw new Error('Expected 3-4-5 length');
  scope.project.remove();
  return 'path measurement';
});
await probe('Flubber', async () => {
  const module = await import('flubber');
  const api = module.default ?? module;
  const interpolate = api.interpolate([[0, 0], [10, 0], [5, 10]], [[0, 0], [10, 0], [10, 10], [0, 10]]);
  if (typeof interpolate(0.5) !== 'string') throw new Error('Expected SVG path');
  return 'single-contour interpolation';
});
await probe('Polymorph', async () => {
  const module = await import('polymorph-js');
  if (!Object.keys(module).length) throw new Error('Empty module');
  return 'import only; morph geometry NOT tested';
});
await probe('OpenType', async () => {
  const module = await import('opentype.js');
  const api = module.default ?? module;
  const path = new api.Path(); path.moveTo(0, 0); path.lineTo(10, 10);
  if (path.getBoundingBox().x2 !== 10) throw new Error('Expected x2=10');
  return 'path bounds; real-font shaping NOT tested';
});
await probe('Lottie', async () => {
  const module = await import('lottie-web');
  if (typeof (module.default ?? module).loadAnimation !== 'function') throw new Error('Missing loadAnimation');
  return 'player import only; rendering NOT tested';
});
await probe('GSAP', async () => {
  const { gsap } = await import('gsap');
  const proxy = { opacity: 0 };
  const tween = gsap.to(proxy, { opacity: 1, duration: 1, ease: 'none', paused: true });
  tween.progress(0.5);
  const ok = Math.abs(proxy.opacity - 0.5) < 1e-6;
  tween.kill();
  if (!ok) throw new Error('Expected midpoint opacity');
  return 'paused numeric tween';
});
await probe('WAAPI', async () => {
  const tile = document.querySelector('#tile');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'static pose selected for reduced motion';
  const animation = tile.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, fill: 'both' });
  animation.pause(); animation.currentTime = 500;
  animation.cancel();
  return 'create/pause/seek/cancel API calls; computed visual value NOT tested';
});
