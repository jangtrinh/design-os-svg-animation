import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDroneInteraction } from '../src/primitives/drone-404-interaction.mjs';

const PIVOT = [1010, 520];
const pose = () => ({ x: 0, y: 0 });
const blank = () => ({ drone: { x: 0, y: 0, rotate: 0 }, gimbal: { look: 0 }, beam: { opacity: 0, look: 0 } });
const run = (layer, seconds, dt = 1 / 60) => { for (let t = 0; t < seconds; t += dt) layer.step(dt, pose()); return layer.apply(blank()); };

test('a pointer close to the airframe pushes the drone away and tilts it', () => {
  const layer = createDroneInteraction({ bodyPivot: PIVOT });
  layer.setPointer({ x: PIVOT[0] - 150, y: PIVOT[1] }); // just left of the body
  let peakTilt = 0;
  for (let t = 0; t < 0.4; t += 1 / 60) {
    layer.step(1 / 60, pose());
    peakTilt = Math.max(peakTilt, layer.apply(blank()).drone.rotate);
  }
  const s = layer.apply(blank());
  assert.ok(s.drone.x > 5, `expected a push to the right, got ${s.drone.x}`);
  assert.ok(peakTilt > 2 && peakTilt < 12, `a push should read as a modest tilt, peak ${peakTilt}`);
});

test('after the pointer leaves, the drone returns level to its mission pose', () => {
  const layer = createDroneInteraction({ bodyPivot: PIVOT });
  layer.setPointer({ x: PIVOT[0] - 150, y: PIVOT[1] });
  run(layer, 0.6);
  layer.setPointer(null);
  const s = run(layer, 3);
  assert.ok(Math.abs(s.drone.x) < 1 && Math.abs(s.drone.y) < 1, `still displaced: ${s.drone.x}, ${s.drone.y}`);
  assert.ok(Math.abs(s.drone.rotate) < 0.2, `still tilted: ${s.drone.rotate}`);
});

test('released from a push, the tilt settles within about a second', () => {
  const layer = createDroneInteraction({ bodyPivot: PIVOT });
  layer.setPointer({ x: PIVOT[0] - 150, y: PIVOT[1] });
  run(layer, 0.6);
  layer.setPointer(null);
  const s = run(layer, 1.0);
  assert.ok(Math.abs(s.drone.rotate) < 0.5, `tilt ${s.drone.rotate.toFixed(2)} deg one second after release`);
  assert.ok(s.beam.opacity < 0.05, 'attention should fade once the visitor leaves');
});

test('the camera and beam turn toward the pointer', () => {
  const layer = createDroneInteraction({ bodyPivot: PIVOT });
  layer.setPointer({ x: PIVOT[0] + 900, y: 1100 }); // far right, outside personal space
  const s = run(layer, 1.5);
  assert.ok(s.gimbal.look > 0.8 && s.beam.look > 0.8, `look ${s.gimbal.look}`);
  assert.ok(s.beam.opacity > 0.7, 'the beam lights up on the visitor');
  assert.ok(Math.abs(s.drone.x) < 1, 'a distant pointer must not push the drone');
});

test('a hovered call-to-action wins over the pointer and lights the beam fully', () => {
  const layer = createDroneInteraction({ bodyPivot: PIVOT });
  layer.setPointer({ x: PIVOT[0] + 900, y: 1100 });
  layer.setFocus({ x: PIVOT[0] - 300, y: 1400 });
  const s = run(layer, 1.5);
  assert.ok(s.gimbal.look < -0.5, `should look at the button on the left, got ${s.gimbal.look}`);
  assert.ok(s.beam.opacity > 0.95);
});

test('first sighting makes the drone hop once; a huge frame gap cannot blow it up', () => {
  const layer = createDroneInteraction({ bodyPivot: PIVOT });
  layer.setPointer({ x: 3000, y: 3000 });
  layer.step(1 / 60, pose());
  const hop = layer.apply(blank()).drone.y;
  assert.ok(hop < 0, 'expected an upward hop');
  const twin = createDroneInteraction({ bodyPivot: PIVOT });
  twin.setPointer({ x: 3000, y: 3000 });
  twin.step(1 / 60, pose());
  layer.step(5, pose()); // tab was hidden for 5 s
  twin.step(1 / 30, pose()); // what the clamp should have turned it into
  assert.deepEqual(layer.apply(blank()), twin.apply(blank()), 'a 5 s gap must advance exactly one clamped step');
});
