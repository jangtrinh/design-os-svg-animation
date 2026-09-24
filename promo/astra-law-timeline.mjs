import { sampleHyperFrameKeyframes, sampleHyperFrameProgress } from './hyperframes-engine.mjs';

export const DURATION = 77.594;

export const BEATS = [
  { id: 'intro-scene', name: 'OpenAI for Law', start: 0, end: 2.5 },
  { id: 'frontier-scene', name: 'Frontier intelligence', start: 1.9, end: 5.52 },
  { id: 'powered-scene', name: 'Powered by', start: 5.35, end: 6.47 },
  { id: 'point-scene', name: 'Color point', start: 6.4, end: 7.65 },
  { id: 'galaxy-scene', name: 'Astra for Law', start: 7.65, end: 10.8 },
  { id: 'methods-scene', name: 'Your methods', start: 10.65, end: 13.78 },
  { id: 'firm-scene', name: 'Your firm', start: 13.65, end: 18.66 },
  { id: 'composer-scene', name: 'ChatGPT composer', start: 18.65, end: 25.38 },
  { id: 'thinking-scene', name: 'Thinking', start: 25.22, end: 27.45 },
  { id: 'response-scene', name: 'Provision mapping', start: 27.3, end: 37.52 },
  { id: 'tool-status-scene', name: 'Tool activity', start: 30.5, end: 33.32 },
  { id: 'word-scene', name: 'Word draft', start: 37.3, end: 42.5 },
  { id: 'tools-scene', name: 'Legal tools', start: 42.55, end: 49.78 },
  { id: 'skills-scene', name: 'Community skills', start: 49.55, end: 54.6 },
  { id: 'trust-scene', name: 'Trust and controls', start: 54.51, end: 58.08 },
  { id: 'privacy-scene', name: 'Private data', start: 57.84, end: 62.18 },
  { id: 'private-doc-scene', name: 'Zero data retention', start: 62.02, end: 64.28 },
  { id: 'safeguards-scene', name: 'Automated safeguards', start: 63.45, end: 65.88 },
  { id: 'earned-scene', name: 'Earned trust', start: 65.72, end: 69.78 },
  { id: 'ambitions-scene', name: 'Firm ambitions', start: 69.64, end: 72.28 },
  { id: 'closing-point-scene', name: 'Color point', start: 72.28, end: 73.42 },
  { id: 'with-openai-scene', name: 'With OpenAI for Law', start: 73.22, end: 75.08 },
  { id: 'outro-scene', name: 'OpenAI', start: 75.02, end: DURATION }
];

export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const ease = value => {
  const u = clamp(value);
  return u * u * (3 - 2 * u);
};

export const mix = (from, to, amount) => from + (to - from) * amount;
export const progress = sampleHyperFrameProgress;
export function randomGenerator(seed) {
  let state = seed;
  return () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296);
}

export function cameraAt(time) {
  const keys = [
    [18.65, 1.83, -788, -222], [19.0, 1.83, -788, -222],
    [19.8, 5.8, -3000, -1980], [21.15, 4.3, -3620, -1440],
    [21.98, 1.83, -796, -429], [24.3, 1.83, -796, -429],
    [25.38, 1.83, -796, -429]
  ];
  return sampleHyperFrameKeyframes(time, keys);
}

export function composerLayoutAt(time) {
  const keys = [
    [18.65, 126, 43, 479, 47, 24, 20],
    [19.0, 126, 43, 479, 47, 24, 20],
    [21.15, 235, 115, 590, 70, 26, 26],
    [24.3, 274, 160, 628, 80, 28, 30]
  ];
  return sampleHyperFrameKeyframes(time, keys);
}

export function beatOpacity(beat, time) {
  // The disk fully covers the white canvas before the dark scene replaces it.
  if (beat.id === 'point-scene') return Number(time >= beat.start && time < beat.end);
  if (beat.id === 'galaxy-scene' && time >= beat.start && time < beat.end - 0.1) return 1;
  if (time < beat.start || time > beat.end) return 0;
  // Scene opacity only transfers the canvas. Choreography belongs to the
  // individual objects so a transition does not produce a gray wash.
  const entrances = {
    'methods-scene': 0.15, 'composer-scene': 0.12,
    'word-scene': 0.06, 'skills-scene': 0.36,
    'trust-scene': 0.06, 'safeguards-scene': 0.08,
    'with-openai-scene': 0.2
  };
  const exits = {
    'galaxy-scene': 0.1,
    'firm-scene': 0.08, 'response-scene': 0.18,
    'word-scene': 0.08, 'tools-scene': 0.18,
    'skills-scene': 0.8, 'with-openai-scene': 0.18
  };
  const fadeIn = beat.start === 0 ? 1 : ease((time - beat.start) / (entrances[beat.id] ?? 0.08));
  const fadeOut = beat.end === DURATION ? 1 : ease((beat.end - time) / (exits[beat.id] ?? 0.08));
  return Math.min(fadeIn, fadeOut);
}

export function activeBeat(time) {
  return [...BEATS].reverse().find(beat => beatOpacity(beat, time) > 0.5) || BEATS[0];
}
