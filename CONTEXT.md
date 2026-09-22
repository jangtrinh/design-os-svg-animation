# CONTEXT.md — Canonical Terminology & Boundaries

## Canonical Terms
- **Motion IR**: The intermediate representation representing semantic motion tracks, easing, and targets before code generation.
- **Semantic Scene Graph**: The structured tree of SVG nodes enriched with semantic roles, pivot anchors, and motion hierarchies.
- **Deterministic Repair**: Algorithmic fixes applied to AI-generated structures (e.g. Bézier resampling, viewBox bounding, winding correction).
- **Target Compiler**: A backend module that emits code for a specific runtime (CSS Keyframes, GSAP, WAAPI, Lottie, SMIL).
- **JEV System One**: Sub-100ms structured intelligence layer for quality scoring, validation gates, and AST audits.

## Terms to Avoid
- *AI-only Generator*: Do not use — implies LLM directly generating raw animation strings without deterministic safety.
- *Flash SVG*: Obsolete terminology.
- *SMIL-only Pipeline*: Do not use — SMIL has deprecation warnings and inconsistent engine support across modern frameworks.

## Durable Lessons
- **Screen-Space Decoupling & Vector Padding (2026-09-22)**: Fixed overlays (mouse cursor, click ripples, outro spring lockups) must reside in root screen-space outside `#camera-world` to prevent transform contamination, and all stroked vector glyphs must enforce inner padding $\ge \text{strokeWidth}/2$ from viewBox edges to eliminate clipping during headless multi-worker capture.
