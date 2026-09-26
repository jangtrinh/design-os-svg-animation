import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadCase } from '../scripts/line-art-cases.mjs';
import { DRONE_LINE_ART } from '../src/primitives/drone-404-line-art-geometry.mjs';
import { DRONE_VIEWBOX } from '../src/primitives/DroneSearch404.mjs';
import { BODY_PIVOT } from '../src/primitives/drone-404-motion.mjs';
import { outline, assertEnvelope } from './helpers/flight-envelope.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCAFFOLD = path.join(ROOT, 'scripts/new-line-art-case.mjs');

test('drone 404 flight stays inside its stage at every moment', () => {
  assertEnvelope({ extent: outline(DRONE_LINE_ART.segments.map(s => s.d)), pivot: BODY_PIVOT, viewBox: DRONE_VIEWBOX, label: 'drone 404' });
});

test('the drone case loads from case.json and yields its fidelity geometry', async () => {
  const drone = loadCase('drone-404', ROOT);
  assert.equal(drone.selectors.body, '.d404-drone');
  const geometry = await drone.fidelityGeometry();
  assert.equal(geometry.segments.length, DRONE_LINE_ART.segments.length);
  assert.throws(() => loadCase('no-such-case', ROOT), /no case "no-such-case"/);
});

test('a new case is scaffolded in one command and is loadable', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'line-art-case-'));
  fs.mkdirSync(path.join(root, 'research'));
  const out = execFileSync('node', [SCAFFOLD, 'robot-arm', '--root', root], { encoding: 'utf8' });
  assert.match(out, /created research\/robot-arm\//);
  for (const file of ['research/robot-arm/case.json', 'research/robot-arm/robot-arm-parts.json', 'plans/cases/robot-arm.md']) {
    assert.ok(fs.existsSync(path.join(root, file)), `${file} missing`);
  }
  const spec = loadCase('robot-arm', root);
  assert.equal(spec.page, 'promo/robot-arm/robot-arm.html');
  assert.equal(spec.fidelity.export, 'ROBOT_ARM_GEOMETRY');
  const again = spawnSync('node', [SCAFFOLD, 'robot-arm', '--root', root], { encoding: 'utf8' });
  assert.equal(again.status, 1, 'must refuse to overwrite an existing case');
  assert.equal(spawnSync('node', [SCAFFOLD, 'Bad Name', '--root', root]).status, 1, 'must reject non-kebab names');
  fs.rmSync(root, { recursive: true, force: true });
});

test('a flipbook case is scaffolded with the flipbook fidelity sources', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'line-art-case-'));
  fs.mkdirSync(path.join(root, 'research'));
  execFileSync('node', [SCAFFOLD, 'quad-x', '--source', 'flipbook', '--root', root]);
  const spec = loadCase('quad-x', root);
  assert.deepEqual(spec.fidelity.segments, ['static', 'bladePoses.0']);
  assert.ok(!fs.existsSync(path.join(root, 'research/quad-x/quad-x-parts.json')), 'flipbook cases need no part map');
  fs.rmSync(root, { recursive: true, force: true });
});
