import { BEATS, DURATION } from './astra-law-timeline.mjs';
import { BEAT_KINDS, buildHyperFramesDraft } from './hyperframes-engine.mjs';

// Monochrome staging map; final imagery stays in the Motion IR and scene renderer.
const STAGING = {
  'intro-scene': ['text', 'OpenAI for Law'],
  'frontier-scene': ['text', 'Frontier intelligence for legal work'],
  'powered-scene': ['text', 'Powered by'],
  'point-scene': ['burst', 'Color point'],
  'galaxy-scene': ['burst', 'Astra for Law', { bg: '#000000' }],
  'methods-scene': ['text', 'Build your methods'],
  'firm-scene': ['logos', 'ChatGPT for your firm'],
  'composer-scene': ['input', 'Draft S-1 shell mapping', { h: 'ChatGPT composer' }],
  'thinking-scene': ['notify', 'Thinking'],
  'response-scene': ['chat', 'Provision mapping'],
  'tool-status-scene': ['list', 'Loaded tool|Read VDR|Prepared mapping'],
  'word-scene': ['split', 'ChatGPT for Word'],
  'tools-scene': ['hub', 'Legal tools'],
  'skills-scene': ['cloud', 'Deposition Prep|NDA Review|Legal Research|Board Minutes|Matter Briefing|Privacy Review'],
  'trust-scene': ['text', 'Legal-grade trust and controls'],
  'privacy-scene': ['text', 'Your data stays private'],
  'private-doc-scene': ['window', 'Confidential document'],
  'safeguards-scene': ['text', 'Automated safeguards'],
  'earned-scene': ['text', 'Maintain trust'],
  'ambitions-scene': ['text', 'Scale your firm'],
  'closing-point-scene': ['burst', ''],
  'with-openai-scene': ['collage', 'With OpenAI for Law'],
  'outro-scene': ['logo', 'OpenAI']
};

export const ASTRA_HYPERFRAME_STORYBOARD = BEATS.map(beat => {
  const [kind, text, options = {}] = STAGING[beat.id] || [];
  if (!Object.hasOwn(BEAT_KINDS, kind)) throw new Error(`Missing HyperFrames preset for ${beat.id}: ${kind}`);
  return { id: beat.id, start: beat.start, end: beat.end, kind, text, options };
});

export const ASTRA_HYPERFRAME_DURATION = DURATION;

export function buildAstraHyperFrameDraft(root) {
  const beats = ASTRA_HYPERFRAME_STORYBOARD.map(({ kind, text, options }) => [kind, text, options]);
  const starts = ASTRA_HYPERFRAME_STORYBOARD.map(beat => beat.start);
  return buildHyperFramesDraft(root, beats, DURATION, { bg: '#ffffff' }, starts);
}
