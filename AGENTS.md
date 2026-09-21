# AGENTS.md — design-os-svg-animation

Guidance for AI agents (Antigravity, Codex, Claude Code) working inside `design-os-svg-animation`.

## Project Mission
`design-os-svg-animation` is the core vector animation engine and authoritative knowledge base for Design OS. It enables AI-assisted generation, optimization, and compilation of production-grade SVG animations.

## Core Rules
1. **Never let LLMs generate raw path animations directly**: Always pass through the Motion IR schema and deterministic geometry engine.
2. **Deterministic First**: Path manipulation, cubic Bézier alignment, and transform flattening must be handled by algorithmic libraries (`svgo`, `flubber`, `paper.js`), not generative stochastic tokens.
3. **Hardware Acceleration**: Always prioritize `transform` (`translate3d`, `rotate`, `scale`) and `opacity` over animating geometric layout attributes (`x`, `y`, `width`, `height`, `d`) whenever possible.
4. **Accessibility (A11y)**: Every animation output must support `@media (prefers-reduced-motion: reduce)` fallbacks.
5. **Zero Emojis / Official Vector Icons Only (HARDRULE)**: Never use raw Unicode emojis as UI icons, button graphics, or status badges. Always use official Phosphor Icons (`@phosphor-icons/core`) or Lucide Icons (`lucide-react`).
6. **JEV Quality Gate**: Knowledge files and generated code must pass JEV System One audits before being marked production-ready.

## Tooling & Scripts
- Knowledge Curation: `python3 scripts/jev-svg-curator.py audit-catalog`
- SVG & Code Review Audit: `python3 scripts/jev-svg-auditor.py audit-dir ./examples`
- Anti-Flop & QA Gate: `python3 scripts/anti-flop-gate.py`
- Headless Promo Exporter: `python3 scripts/export-promo-video.py`
- Compiler Prototype: `npx tsx scripts/motion-ir-compiler-demo.ts`

## Standards & Skills
- Motion Video Recreation Pipeline: `docs/motion-video-recreation-pipeline.md`
- Portable Universal Skill: `skills/motion-video-recreation/SKILL.md`
- Standalone Promo Player: `promo/claude-design-promo.html`
- Production R3F Suite: `src/components/`

