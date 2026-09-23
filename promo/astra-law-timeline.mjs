export const DURATION = 77.594;

export const BEATS = [
  { id: 'intro-scene', name: 'OpenAI for Law', start: 0, end: 2.1 },
  { id: 'frontier-scene', name: 'Frontier intelligence', start: 1.9, end: 4.55 },
  { id: 'point-scene', name: 'Blue point', start: 4.1, end: 7.55 },
  { id: 'galaxy-scene', name: 'Astra for Law', start: 7.3, end: 10.05 },
  { id: 'methods-scene', name: 'Your methods', start: 9.85, end: 12.9 },
  { id: 'firm-scene', name: 'Your firm', start: 12.65, end: 17.75 },
  { id: 'composer-scene', name: 'ChatGPT composer', start: 17.5, end: 23.6 },
  { id: 'thinking-scene', name: 'Thinking', start: 23.35, end: 28.2 },
  { id: 'response-scene', name: 'Provision mapping', start: 27.85, end: 35.9 },
  { id: 'word-scene', name: 'Word draft', start: 35.65, end: 41.75 },
  { id: 'tools-scene', name: 'Legal tools', start: 41.5, end: 48.85 },
  { id: 'skills-scene', name: 'Community skills', start: 48.6, end: 53.95 },
  { id: 'trust-scene', name: 'Trust and controls', start: 53.7, end: 59.0 },
  { id: 'privacy-scene', name: 'Private data', start: 58.75, end: 62.25 },
  { id: 'private-doc-scene', name: 'Zero data retention', start: 62.0, end: 64.85 },
  { id: 'safeguards-scene', name: 'Automated safeguards', start: 64.6, end: 67.65 },
  { id: 'earned-scene', name: 'Earned trust', start: 67.4, end: 71.25 },
  { id: 'ambitions-scene', name: 'Firm ambitions', start: 71.0, end: 75.15 },
  { id: 'outro-scene', name: 'OpenAI', start: 74.9, end: DURATION }
];

export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const ease = value => {
  const u = clamp(value);
  return u * u * (3 - 2 * u);
};

export function beatOpacity(beat, time) {
  if (time < beat.start || time > beat.end) return 0;
  const fadeIn = beat.start === 0 ? 1 : ease((time - beat.start) / 0.42);
  const fadeOut = beat.end === DURATION ? 1 : ease((beat.end - time) / 0.42);
  return Math.min(fadeIn, fadeOut);
}

export function activeBeat(time) {
  return [...BEATS].reverse().find(beat => beatOpacity(beat, time) > 0.5) || BEATS[0];
}
