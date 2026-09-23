export const DURATION = 77.594;

export const BEATS = [
  { id: 'intro-scene', name: 'OpenAI for Law', start: 0, end: 2.5 },
  { id: 'frontier-scene', name: 'Frontier intelligence', start: 1.9, end: 5.52 },
  { id: 'powered-scene', name: 'Powered by', start: 5.35, end: 6.47 },
  { id: 'point-scene', name: 'Color point', start: 6.4, end: 7.58 },
  { id: 'galaxy-scene', name: 'Astra for Law', start: 7.47, end: 10.6 },
  { id: 'methods-scene', name: 'Your methods', start: 10.48, end: 13.78 },
  { id: 'firm-scene', name: 'Your firm', start: 13.65, end: 18.66 },
  { id: 'composer-scene', name: 'ChatGPT composer', start: 18.65, end: 25.38 },
  { id: 'thinking-scene', name: 'Thinking', start: 25.22, end: 27.45 },
  { id: 'response-scene', name: 'Provision mapping', start: 27.3, end: 37.52 },
  { id: 'tool-status-scene', name: 'Tool activity', start: 30.5, end: 33.32 },
  { id: 'word-scene', name: 'Word draft', start: 37.3, end: 42.35 },
  { id: 'tools-scene', name: 'Legal tools', start: 42.18, end: 49.38 },
  { id: 'skills-scene', name: 'Community skills', start: 49.22, end: 54.6 },
  { id: 'trust-scene', name: 'Trust and controls', start: 54.42, end: 58.12 },
  { id: 'privacy-scene', name: 'Private data', start: 57.96, end: 62.18 },
  { id: 'private-doc-scene', name: 'Zero data retention', start: 62.02, end: 64.28 },
  { id: 'safeguards-scene', name: 'Automated safeguards', start: 64.12, end: 65.88 },
  { id: 'earned-scene', name: 'Earned trust', start: 65.72, end: 69.78 },
  { id: 'ambitions-scene', name: 'Firm ambitions', start: 69.64, end: 72.28 },
  { id: 'closing-point-scene', name: 'Yellow point', start: 72.08, end: 73.78 },
  { id: 'with-openai-scene', name: 'With OpenAI for Law', start: 73.66, end: 74.95 },
  { id: 'outro-scene', name: 'OpenAI', start: 74.76, end: DURATION }
];

export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const ease = value => {
  const u = clamp(value);
  return u * u * (3 - 2 * u);
};

export const mix = (from, to, amount) => from + (to - from) * amount;
export const progress = (time, start, end) => ease((time - start) / (end - start));
export function randomGenerator(seed) {
  let state = seed;
  return () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296);
}

export function cameraAt(time) {
  const keys = [
    [18.65, 1.36, -580, -250], [19.35, 1.36, -580, -250],
    [20, 4, -2080, -1210], [21.15, 4.3, -3800, -1480],
    [22.15, 1, 350, 0], [24.3, 1.83, -796, -429],
    [25.38, 1.83, -796, -429]
  ];
  const right = keys.findIndex(key => key[0] > time);
  if (right < 1) return keys[right < 0 ? keys.length - 1 : 0].slice(1);
  const a = keys[right - 1], b = keys[right];
  const amount = progress(time, a[0], b[0]);
  return [mix(a[1], b[1], amount), mix(a[2], b[2], amount), mix(a[3], b[3], amount)];
}

export function beatOpacity(beat, time) {
  if (time < beat.start || time > beat.end) return 0;
  const fadeIn = beat.start === 0 ? 1 : ease((time - beat.start) / (beat.id === 'composer-scene' ? 0.12 : beat.id === 'firm-scene' ? 0.15 : beat.id === 'earned-scene' ? 0.18 : 0.42));
  const fadeOut = beat.end === DURATION ? 1 : ease((beat.end - time) / (beat.id === 'point-scene' ? 0.05 : beat.id === 'firm-scene' ? 0.08 : 0.42));
  return Math.min(fadeIn, fadeOut);
}

export function activeBeat(time) {
  return [...BEATS].reverse().find(beat => beatOpacity(beat, time) > 0.5) || BEATS[0];
}
