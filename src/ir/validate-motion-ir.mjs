import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
const schema = JSON.parse(readFileSync(new URL('../../schemas/motion-ir.schema.json', import.meta.url), 'utf8'));
const validateSchema = new Ajv2020({ allErrors: true, strict: true }).compile(schema);

/** Structural + selected semantic checks, not geometry or visual certification. */
export function validateMotionIR(input) {
  if (!validateSchema(input)) return { valid: false, errors: validateSchema.errors.map(e => `${e.instancePath}: ${e.message}`) };
  const errors = [];
  const nodes = new Map();
  const checkPath = (path, label) => {
    const ids = path.contours.map(c => c.id);
    if (new Set(ids).size !== ids.length) errors.push(`${label}: duplicate contour ID`);
  };
  const signature = path => JSON.stringify([path.fillRule, path.contours.map(c => [c.id, c.closed, c.vertices.length])]);
  for (const node of input.scene.nodes) {
    if (nodes.has(node.id)) errors.push(`${node.id}: duplicate node ID`);
    nodes.set(node.id, node);
    checkPath(node.path, node.id);
  }
  for (const node of input.scene.nodes) {
    const seen = new Set([node.id]);
    let parent = node.parentId;
    while (parent !== null) {
      if (!nodes.has(parent)) { errors.push(`${node.id}: missing parent ${parent}`); break; }
      if (seen.has(parent)) { errors.push(`${node.id}: parent cycle`); break; }
      seen.add(parent);
      parent = nodes.get(parent).parentId;
    }
  }
  const tracks = new Set();
  const writers = new Set();
  for (const track of input.tracks) {
    if (tracks.has(track.id)) errors.push(`${track.id}: duplicate track ID`);
    tracks.add(track.id);
    const node = nodes.get(track.targetId);
    if (!node) errors.push(`${track.id}: unbound target`);
    const writer = `${track.targetId}:${track.property}`;
    if (writers.has(writer)) errors.push(`${track.id}: conflicting writer ${writer}`);
    writers.add(writer);
    let last = -1;
    for (const key of track.keyframes) {
      if (key.timeMs <= last || key.timeMs > input.timeline.durationMs) errors.push(`${track.id}: keyframe time not strictly increasing or outside timeline`);
      last = key.timeMs;
      if (track.property === 'path') {
        checkPath(key.value, track.id);
        if (node && signature(key.value) !== signature(node.path)) errors.push(`${track.id}: incompatible path topology signature`);
      }
    }
  }
  if (input.accessibility.reducedMotion.atMs > input.timeline.durationMs) errors.push('reducedMotion.atMs outside timeline');
  return { valid: errors.length === 0, errors };
}
