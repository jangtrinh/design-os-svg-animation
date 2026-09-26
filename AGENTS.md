# AGENTS.md — design-os-svg-animation

Guidance for AI agents (Antigravity, Codex, Claude Code) working inside `design-os-svg-animation`.

## Project Mission
`design-os-svg-animation` is the core vector animation engine and authoritative knowledge base for Design OS. It enables AI-assisted generation, optimization, and compilation of production-grade SVG animations.

## Core Rules
1. **Mandatory Product Designer Skill (MUST-CALL)**: Before creating, modifying, or auditing ANY animation, UI mockup, scene, or video element in this repository, agents MUST activate and consult `skills/product-designer/SKILL.md` (`ak:product-designer` or `/product-designer`). Generic template UI, hand-drawn rough icons, or unstaged layouts are strictly rejected.
2. **Never let LLMs generate raw path animations directly**: Always pass through the Motion IR schema and deterministic geometry engine.
3. **Deterministic First**: Path manipulation, cubic Bézier alignment, and transform flattening must be handled by algorithmic libraries (`svgo`, `flubber`, `paper.js`), not generative stochastic tokens.
4. **Hardware Acceleration**: Always prioritize `transform` (`translate3d`, `rotate`, `scale`) and `opacity` over animating geometric layout attributes (`x`, `y`, `width`, `height`, `d`) whenever possible.
5. **Accessibility (A11y)**: Every animation output must support `@media (prefers-reduced-motion: reduce)` fallbacks.
6. **Zero Emojis / Official Vector Icons Only (HARDRULE)**: Never use raw Unicode emojis as UI icons, button graphics, or status badges. Always use official Phosphor Icons (`@phosphor-icons/core`) or Lucide Icons (`lucide-react`). Sourced brand marks must come from SVGL (`https://svgl.app/`).
7. **JEV & Anti-Flop Quality Gate**: Knowledge files and generated code must pass all 5 Anti-Flop Gates via `python3 scripts/anti-flop-gate.py` (exit code 0) before being marked production-ready.

## Tooling & Scripts
- Knowledge Curation: `python3 scripts/jev-svg-curator.py audit-catalog`
- SVG & Code Review Audit: `python3 scripts/jev-svg-auditor.py audit-dir ./examples`
- Anti-Flop & QA Gate: `python3 scripts/anti-flop-gate.py`
- Headless Promo Exporter: `python3 scripts/export-promo-video.py`
- Compiler Prototype: `npx tsx scripts/motion-ir-compiler-demo.ts`

## Standards & Skills
- **Product Designer (MUST-CALL)**: `skills/product-designer/SKILL.md` (EaseUI & Linear/Stripe-caliber UI craft)
- **Reference Recreation Contract (MUST-READ)**: `docs/pipelines/motion-video-recreation-pipeline.md`. It owns the source evidence, scene/transition ledger, HyperFrames v2 staging, export review, acceptance states, and session handoff. Technical gates do not establish visual parity.
- Lessons and review method: `docs/pipelines/motion-video-recreation-workflow-guide.md`
- Portable Universal Skill: `skills/motion-video-recreation/SKILL.md`
- Standalone Promo Player: `promo/claude-design/claude-design-promo.html`
- Production R3F Suite: `src/components/`
