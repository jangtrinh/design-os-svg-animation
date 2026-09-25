# CLAUDE.md — design-os-svg-animation

Context and guidelines for Claude Code and local assistant runners.

## Commands
- Install: `npm install`
- Typecheck: `npx tsc --noEmit`
- Run Demo: `npm run demo`
- JEV Knowledge Audit: `npm run audit:knowledge`
- JEV SVG Audit: `npm run audit:svg`

## Code Style
- Strict TypeScript (`strict: true`, ES2022).
- Kebab-case file names (`motion-ir-compiler.ts`, `svg-geometry-engine.ts`).
- Documentation in standard Markdown with KaTeX math and Mermaid diagrams.

## Mandatory Skills & Invariants
- **Product Designer (MUST-CALL)**: Activate `skills/product-designer/SKILL.md` (`/product-designer`) before designing, creating, or modifying any UI scene, motion mockup, or video component.
- **Motion Video Recreation**: Follow `skills/motion-video-recreation/SKILL.md` (`/motion-video-recreation`).
- **Line Art to Motion**: Animating a still reference drawing? Follow `skills/line-art-motion/SKILL.md` (`/line-art-motion`) and `docs/line-art-to-motion-pipeline.md`.
- **Zero Emojis**: Official Phosphor regular vectors only. SVGL (`https://svgl.app/`) for brand marks.
- **Anti-Flop Verification**: Run `python3 scripts/anti-flop-gate.py` (must pass 100% with exit code 0).
