/** Normalized data only. Runtime validation is required for untrusted JSON. */
export type Vec2 = [number, number];
export type RGBA = [number, number, number, number];
export type Ease =
  | { kind: 'linear' | 'hold' }
  | { kind: 'cubic-bezier'; x1: number; y1: number; x2: number; y2: number };
export interface Vertex { p: Vec2; in: Vec2; out: Vec2 }
export interface CubicPath {
  fillRule: 'nonzero' | 'evenodd';
  contours: { id: string; closed: boolean; vertices: Vertex[] }[];
}
export interface SceneNode {
  id: string;
  parentId: string | null;
  path: CubicPath;
  transform: { translate: Vec2; scale: Vec2; rotate: number; pivot: Vec2 };
  style: { fill: RGBA; opacity: number };
}
export interface PropertyValues {
  opacity: number;
  translate: Vec2;
  scale: Vec2;
  rotate: number;
  fill: RGBA;
  path: CubicPath;
  trim: number;
}
export type Track = {
  [P in keyof PropertyValues]: {
    id: string;
    targetId: string;
    property: P;
    keyframes: { timeMs: number; value: PropertyValues[P]; ease: Ease }[];
  }
}[keyof PropertyValues];
export interface MotionIR {
  version: '0.1.0';
  scene: { viewBox: [number, number, number, number]; nodes: SceneNode[] };
  timeline: {
    durationMs: number;
    iterations: number | 'infinite';
    direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    fill: 'none' | 'forwards' | 'backwards' | 'both';
  };
  tracks: Track[];
  accessibility: { label: string; reducedMotion: { mode: 'static'; atMs: number } };
}
export type Backend = 'gsap' | 'css' | 'waapi' | 'lottie-svg' | 'smil';
export interface CapabilityDecision {
  backend: Backend;
  trackId: string;
  support: 'native' | 'baked' | 'host-required' | 'unsupported';
  reason: string;
}
