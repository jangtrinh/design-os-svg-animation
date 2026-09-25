const clamp = value => Math.max(0, Math.min(1, value));

export function sampleHyperFrameProgress(time, start, end) {
  if (!Number.isFinite(time) || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new RangeError('HyperFrames progress requires finite time and an increasing interval');
  }
  const value = clamp((time - start) / (end - start));
  return value * value * (3 - 2 * value);
}

export function sampleHyperFrameStagger(time, start, index, spacing, duration) {
  return sampleHyperFrameProgress(time, start + index * spacing, start + index * spacing + duration);
}

export function sampleHyperFrameCarry(time, enterStart, enterEnd, exitStart, exitEnd) {
  return sampleHyperFrameProgress(time, enterStart, enterEnd)
    * (1 - sampleHyperFrameProgress(time, exitStart, exitEnd));
}

export function sampleHyperFramePulse(time, start, rise, fall) {
  return sampleHyperFrameCarry(time, start, start + rise, start + rise, start + rise + fall);
}

export function sampleHyperFrameKeyframes(time, keys) {
  if (keys.length < 2 || keys.some((key, index) => !Number.isFinite(key[0]) || (index && key[0] <= keys[index - 1][0]))) {
    throw new RangeError('HyperFrames keyframes require at least two strictly increasing times');
  }
  if (time <= keys[0][0]) return keys[0].slice(1);
  if (time >= keys.at(-1)[0]) return keys.at(-1).slice(1);
  const right = keys.findIndex(key => key[0] > time);
  const previous = keys[right - 1];
  const next = keys[right];
  const amount = sampleHyperFrameProgress(time, previous[0], next[0]);
  return previous.slice(1).map((value, index) => value + (next[index + 1] - value) * amount);
}
