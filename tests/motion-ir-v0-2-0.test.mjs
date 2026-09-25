import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateMotionIR } from '../src/ir/validate-motion-ir.mjs';

const fixture = JSON.parse(readFileSync(new URL('../fixtures/hotspot-camera.motion.json', import.meta.url)));

test('accepts 0.2.0 sample with viewport, camera, bindings and hotspots', () => {
  const result = validateMotionIR(fixture);
  assert.equal(result.valid, true, result.errors?.join('\n'));
});

const invalidCases = {
  '0.2.0 fields on 0.1.0 document': x => { x.version = '0.1.0'; },
  'unknown aspect': x => { x.viewport.aspect = '4:3'; },
  'missing aspect': x => { delete x.viewport.aspect; },
  'unexpected viewport field': x => { x.viewport.bleed = 10; },
  'negative safe zone': x => { x.viewport.safeZone.top = -1; },
  'zoom below minimum': x => { x.camera.zoom = 0; },
  'unexpected camera field': x => { x.camera.rotate = 5; },
  'non-string binding': x => { x.parameterBindings.title = 42; },
  'hotspot without center': x => { delete x.hotspots[0].center; },
  'unexpected hotspot field': x => { x.hotspots[0].onClick = 'alert(1)'; },
  'empty hotspot id': x => { x.hotspots[0].id = ''; },
  'duplicate hotspot id': x => { x.hotspots.push(structuredClone(x.hotspots[0])); },
  'unbound hotspot target': x => { x.hotspots[0].targetElement = 'absent'; },
  'hotspot center outside viewBox': x => { x.hotspots[0].center = [500, 64]; },
  'negative hotspot radius': x => { x.hotspots[0].radius = -1; }
};
for (const [name, mutate] of Object.entries(invalidCases)) test(`rejects ${name}`, () => {
  const input = structuredClone(fixture);
  mutate(input);
  assert.equal(validateMotionIR(input).valid, false);
});
