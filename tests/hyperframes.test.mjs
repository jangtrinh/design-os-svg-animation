import test from 'node:test';
import assert from 'node:assert/strict';
import { BEAT_KINDS, sampleHyperFrameCarry, sampleHyperFrameKeyframes,
  sampleHyperFrameProgress, sampleHyperFrameStagger } from '../promo/hyperframes-engine.mjs';
import { ASTRA_HYPERFRAME_STORYBOARD, ASTRA_HYPERFRAME_DURATION } from '../promo/astra-law-hyperframes-beats.mjs';
import { BEATS, cameraAt } from '../promo/astra-law-timeline.mjs';
import { readFileSync } from 'node:fs';
import { BEAT_KINDS as CANONICAL_BEAT_KINDS } from '../src/runtime/hyperframes-engine.mjs';

test('the v2 draft exposes the complete 20-preset vocabulary and source-timed Astra beats', () => {
  assert.equal(Object.keys(BEAT_KINDS).length, 20);
  assert.deepEqual(Object.keys(CANONICAL_BEAT_KINDS), Object.keys(BEAT_KINDS));
  for (const file of ['hyperframes-engine.mjs', 'hyperframes-extra-beats.mjs', 'hyperframes-motion-presets.mjs']) {
    const source = readFileSync(new URL(`../src/runtime/${file}`, import.meta.url), 'utf8');
    for (const location of ['promo', 'docs/promo']) {
      assert.equal(readFileSync(new URL(`../${location}/${file}`, import.meta.url), 'utf8'), source,
        `${location}/${file} drifted from the canonical runtime`);
    }
  }
  assert.equal(ASTRA_HYPERFRAME_STORYBOARD.length, BEATS.length);
  assert.equal(ASTRA_HYPERFRAME_DURATION, 77.594);
  for (const [index, beat] of ASTRA_HYPERFRAME_STORYBOARD.entries()) {
    assert.equal(beat.id, BEATS[index].id);
    assert.equal(beat.start, BEATS[index].start);
    assert.equal(typeof BEAT_KINDS[beat.kind], 'function');
  }
});

test('pure motion presets stay finite and repeatable across arbitrary seeks', () => {
  assert.equal(sampleHyperFrameProgress(1, 2, 4), 0);
  assert.equal(sampleHyperFrameProgress(3, 2, 4), 0.5);
  assert.equal(sampleHyperFrameProgress(5, 2, 4), 1);
  assert.equal(sampleHyperFrameStagger(3.2, 3, 1, 0.2, 0.4), 0);
  assert.ok(Math.abs(sampleHyperFrameStagger(3.4, 3, 1, 0.2, 0.4) - 0.5) < 1e-12);
  assert.equal(sampleHyperFrameCarry(37.5, 37.33, 37.55, 37.83, 38.09),
    sampleHyperFrameProgress(37.5, 37.33, 37.55));
  const keys = [[0, 1, 0], [2, 3, 10], [4, 5, 20]];
  assert.deepEqual(sampleHyperFrameKeyframes(1, keys), [2, 5]);
  assert.deepEqual(sampleHyperFrameKeyframes(3, keys), [4, 15]);
  const first = cameraAt(21);
  cameraAt(4);
  assert.deepEqual(cameraAt(21), first);
  assert.throws(() => sampleHyperFrameProgress(2, 3, 3), RangeError);
  assert.throws(() => sampleHyperFrameKeyframes(1, [[0, 1], [0, 2]]), RangeError);
});
