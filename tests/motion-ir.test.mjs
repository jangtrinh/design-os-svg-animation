import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateMotionIR } from '../src/ir/validate-motion-ir.mjs';
const fixture = JSON.parse(readFileSync(new URL('../fixtures/opacity.motion.json', import.meta.url)));
test('accepts normalized sample', () => assert.equal(validateMotionIR(fixture).valid, true));
const invalidCases = {
  'unknown version': x => { x.version = '99'; },
  'unexpected input field': x => { x.callback = 'alert(1)'; },
  'nonfinite coordinates': x => { x.scene.nodes[0].transform.rotate = Infinity; },
  'nonpositive viewport': x => { x.scene.viewBox[2] = 0; },
  'unbound target': x => { x.tracks[0].targetId = 'absent'; },
  'duplicate node': x => { x.scene.nodes.push(structuredClone(x.scene.nodes[0])); },
  'parent cycle': x => { x.scene.nodes[0].parentId = 'tile'; },
  'missing parent': x => { x.scene.nodes[0].parentId = 'missing'; },
  'duplicate writer': x => { x.tracks.push({ ...structuredClone(x.tracks[0]), id: 'second' }); },
  'duplicate time': x => { x.tracks[0].keyframes[1].timeMs = 0; },
  'keyframe beyond duration': x => { x.tracks[0].keyframes[1].timeMs = 1001; },
  'invalid ease control': x => { x.tracks[0].keyframes[0].ease = { kind: 'cubic-bezier', x1: -1, y1: 0, x2: 1, y2: 1 }; },
  'wrong typed value': x => { x.tracks[0].keyframes[0].value = [0, 1]; },
  'reduced motion outside timeline': x => { x.accessibility.reducedMotion.atMs = 1001; },
  'morph mismatch': x => {
    x.tracks[0].property = 'path';
    for (const k of x.tracks[0].keyframes) k.value = structuredClone(x.scene.nodes[0].path);
    x.tracks[0].keyframes[1].value.contours[0].vertices.pop();
  }
};
for (const [name, mutate] of Object.entries(invalidCases)) test(`rejects ${name}`, () => {
  const input = structuredClone(fixture);
  mutate(input);
  assert.equal(validateMotionIR(input).valid, false);
});
