# CONTEXT.md — Canonical Terminology & Boundaries

## Canonical Terms
- **Motion IR**: The intermediate representation representing semantic motion tracks, easing, and targets before code generation.
- **Semantic Scene Graph**: The structured tree of SVG nodes enriched with semantic roles, pivot anchors, and motion hierarchies.
- **Deterministic Repair**: Algorithmic fixes applied to AI-generated structures (e.g. Bézier resampling, viewBox bounding, winding correction).
- **Target Compiler**: A backend module that emits code for a specific runtime (CSS Keyframes, GSAP, WAAPI, Lottie, SMIL).
- **JEV System One**: Sub-100ms structured intelligence layer for quality scoring, validation gates, and AST audits.
- **Hairline Figure**: Real-time 60fps 2:1 axonometric vector instrument rendered directly in SVG with spring-driven kinematics and physical interaction.
- **Meaningful Kinematics**: Motion where an instrument performs its authentic physical task (clamping, typing, inserting card) rather than arbitrary CAD disassembly / exploded floating slop.

## Terms to Avoid
- *AI-only Generator*: Do not use — implies LLM directly generating raw animation strings without deterministic safety.
- *Flash SVG*: Obsolete terminology.
- *SMIL-only Pipeline*: Do not use — SMIL has deprecation warnings and inconsistent engine support across modern frameworks.
- *Exploded CAD Slop*: Do not use — arbitrary vertical separation of disconnected parts that lack functional mechanical meaning.

## Durable Lessons
- **Hairline Meaningful Kinematics vs. Exploded CAD Slop (2026-10-08)**: Static 2-frame raster cross-fades and arbitrary exploded disassemblies fail Hairline Rule 06 (Honesty). Real bench instruments must perform their authentic physical function: a payment terminal accepts card insertion along its slot axis and depresses tactile buttons with spring return and localized `.hi` highlight, preserving solid chassis integrity and 60fps vector responsiveness.
- **Screen-Space Decoupling & Vector Padding (2026-09-22)**: Fixed overlays (mouse cursor, click ripples, outro spring lockups) must reside in root screen-space outside `#camera-world` to prevent transform contamination, and all stroked vector glyphs must enforce inner padding $\ge \text{strokeWidth}/2$ from viewBox edges to eliminate clipping during headless multi-worker capture.
- **C¹ Continuous Camera Lerp & Streaming Decoupling (2026-09-22)**: Camera transforms transitioning into focal pan/zoom must start at zero displacement $\Delta(0, 0)$ via $C^1$-continuous cubic-bezier lerp, and spatial camera punch must be deferred until character streaming opacity animations have fully settled to avoid visual text stuttering.
- **Virtual-Clock SVG Path Extraction & 3D Perspective Card (2026-09-22)**: Official SVGL geometry (`svgl.app`) enables pixel-perfect stroke drawing with `stroke-dasharray`/`stroke-dashoffset` when mapped to normalized viewBox scales, and 3D card perspectives (`rotateY(-8deg) rotateX(4deg)`) require explicit hardware-accelerated parent containers (`perspective: 1200px`) to eliminate subpixel raster aliasing during 60fps headless capture.

