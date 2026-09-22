# Design OS — SVG Animation Engine & Motion Video Pipeline

> **Deterministic vector animation and 1080p 60fps motion video pipeline for AI coding agents.**
> Live Site: [https://jangtrinh.github.io/design-os-svg-animation/](https://jangtrinh.github.io/design-os-svg-animation/)

<p align="left">
  <a href="https://github.com/jangtrinh/design-os-svg-animation/releases"><img src="https://img.shields.io/badge/release-v0.1.0-202020?style=for-the-badge" alt="Release: v0.1.0" height="28"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-202020?style=for-the-badge" alt="License: MIT" height="28"></a>
  <img src="https://img.shields.io/badge/three.js-0.186-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js 0.186" height="28">
  <img src="https://img.shields.io/badge/react-19-202020?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React 19" height="28">
  <img src="https://img.shields.io/badge/headless-chromium-202020?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Headless Chromium" height="28">
  <img src="https://img.shields.io/badge/virtual_clock-deterministic_60fps-202020?style=for-the-badge" alt="Virtual Clock: Deterministic 60fps" height="28">
  <img src="https://img.shields.io/badge/anti--flop-5_gates_pass-202020?style=for-the-badge" alt="Anti-Flop: 5 Gates Pass" height="28">
</p>

---

## Visual Showcase & Promo Demos

| Example 1: Claude Design 3D Globe (16:9) | Example 2: SaaS 9:16 Vector Short | Example 3: OpenAI Codex App 38s Promo (16:9) |
| :---: | :---: | :---: |
| ![Claude Design 3D Globe](docs/assets/example-1-claude-design-globe.gif) | ![SaaS Vector Motion](docs/assets/example-2-saas-motion-engine.gif) | ![OpenAI Codex App Promo](docs/assets/example-3-codex-app-promo.gif) |
| *Orthographic 3D Globe with glowing arcs & live Tweaks* | *Shared-element morph, Phosphor vectors & kinetics* | *Native macOS window morph, multi-agent stream, code diff review & spring outro* |

---

## AI Agent Quick Reference & Ingestion Guide

If you are an AI coding agent reading this codebase, follow these rules and directives strictly:

### 1. The 7 Immutable Agent Invariants
1. **Mandatory Product Designer Skill (MUST-CALL)**: Before designing, creating, or modifying any animation scene, UI mockup, or video layout, agents MUST activate and consult [`skills/product-designer/SKILL.md`](skills/product-designer/SKILL.md) for EaseUI tactile depth, 1px subtle borders, authentic SVGL marks, and undistorted 3D projections.
2. **Never generate raw SVG path animations directly**: Always pass through the [Motion IR Schema](schemas/motion-ir.schema.json) and deterministic geometric compilation (`svgo`, `flubber`).
3. **Deterministic First**: Decouple temporal progression via the Virtual Clock (`window.__seekToTime(t)`). Never rely on non-deterministic real-time screen recordings.
4. **GPU-Composited Transforms Only**: Animate `transform` (`translate3d`, `scale`, `rotate`) and `opacity`. Strictly avoid animating layout-thrashing attributes (`width`, `height`, `top`, `left`, `d`) during continuous motion.
5. **Mandatory A11y & Reduced Motion**: Every generated CSS/JS animation must provide `@media (prefers-reduced-motion: reduce)` fallbacks.
6. **Zero Emojis / Official Vector Icons Only (HARDRULE)**: Never use raw Unicode emojis as UI icons, button graphics, or status badges. Always use official Phosphor Icons (`@phosphor-icons/core`) or Lucide Icons (`lucide-react`) via SVG `<defs>` + `<use>` or React icon components. Sourced brand marks must come from SVGL (`https://svgl.app/`).
7. **Zero Design Flop & Proactive Pre-Flight**: Generated assets and videos must pass the proactive pre-flight guard (`npm run guard`) and all anti-flop verification gates (`npm run audit:anti-flop`) with exit code `0`.

---

## Multi-Agent Runtime Commands & Mappings

| Action | Claude Code (`.claude`) | Codex Native (`Codex CLI`) | Antigravity (`Gemini Agentic`) |
| :--- | :--- | :--- | :--- |
| **Product Designer (MUST-CALL)** | `/product-designer` | Role in `AGENTS.md` | `ak:product-designer` |
| **Motion Video Skill** | `/motion-video-recreation` | Task referenced in `AGENTS.md` | `ak:motion-video-recreation` |
| **Pre-Flight Guard & Auto-Fix** | `bash: npm run guard:fix` | `shell: npm run guard:fix` | `run_command: npm run guard:fix` |
| **Verify Anti-Flop Gates** | `bash: npm run audit:anti-flop` | `shell: npm run audit:anti-flop` | `run_command: npm run audit:anti-flop` |
| **Export MP4 Video**| `bash: python3 scripts/export-promo-video.py` | `shell: python3 scripts/export-promo-video.py` | `run_command: python3 scripts/export-promo-video.py` |
| **Compile Motion IR**| `bash: npx tsx scripts/motion-ir-compiler-demo.ts` | `shell: npx tsx scripts/motion-ir-compiler-demo.ts` | `run_command: npx tsx scripts/motion-ir-compiler-demo.ts` |
| **Audit SVGs / AST**| `bash: python3 scripts/jev-svg-auditor.py` | `shell: python3 scripts/jev-svg-auditor.py` | `run_command: python3 scripts/jev-svg-auditor.py` |

---

## AI Agent Installation & Setup

### 1. Install Project Dependencies
```bash
npm install
```

### 2. Verify System Tooling Prerequisites
- **Python 3.10+**: `python3 --version`
- **Google Chrome** (Headless rendering): `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- **FFmpeg**: `which ffmpeg` (or `/opt/homebrew/bin/ffmpeg`)

### 3. Install Skills for Your Current Agent Harness
- **For Claude Code / Workspace Agents**:
  ```bash
  mkdir -p /Users/jang/Products/.agents/skills/product-designer
  cp skills/product-designer/SKILL.md /Users/jang/Products/.agents/skills/product-designer/SKILL.md
  mkdir -p /Users/jang/Products/.agents/skills/motion-video-recreation
  cp skills/motion-video-recreation/SKILL.md /Users/jang/Products/.agents/skills/motion-video-recreation/SKILL.md
  ```
- **For Antigravity Global Agent**:
  ```bash
  mkdir -p ~/.gemini/config/skills/ak-product-designer
  cp skills/product-designer/SKILL.md ~/.gemini/config/skills/ak-product-designer/SKILL.md
  mkdir -p ~/.gemini/config/skills/ak-motion-video-recreation
  cp skills/motion-video-recreation/SKILL.md ~/.gemini/config/skills/ak-motion-video-recreation/SKILL.md
  ```

---

## Deterministic AI Agent Workflows

### Workflow A: Recreating Promo Video with 99% Parity
1. **Start Virtual-Clock Local Server**:
   ```bash
   python3 -m http.server 3033 --directory ./promo &
   ```
2. **Capture Deterministic Frames & Assemble Broadcast MP4**:
   ```bash
   python3 scripts/export-promo-video.py
   # Output: promo/claude-design-promo.mp4 (1080p 60fps, CRF 18)
   ```
3. **Run Proactive Pre-Flight & Anti-Flop Audits**:
   ```bash
   npm run guard          # Proactive pre-flight invariant check
   npm run audit:anti-flop # 6-Gate Design:OS quality verification
   # Both must exit with code 0
   ```

### Workflow B: Compiling Motion IR to Production Code
1. Inspect or modify animation storyboard: `fixtures/saas-short.motion.json`.
2. Compile to pure CSS keyframes & GSAP timeline:
   ```bash
   npx tsx scripts/motion-ir-compiler-demo.ts
   ```

### Workflow C: Universal 5-Phase Motion Video Recreation Pipeline
For any UI/UX or product launch video (e.g. OpenAI Codex App, Apple Keynote, Stripe Sessions):
1. **Consult Full Guide**: [`docs/motion-video-recreation-workflow-guide.md`](docs/motion-video-recreation-workflow-guide.md)
2. **Review Session Learnings**: [`plans/journals/2026-09-22-codex-app-promo-pipeline.md`](plans/journals/2026-09-22-codex-app-promo-pipeline.md)
3. **Auto-Fix & Verify Before Commit**:
   ```bash
   npm run guard:fix
   npm run audit:anti-flop
   ```

---

## Repository Architecture & Entrypoints

```
design-os-svg-animation/
├── docs/                               # Canonical Engineering Specifications
│   ├── motion-video-recreation-workflow-guide.md # Universal 5-Phase Pipeline & Architectural Invariants Guide
│   ├── motion-video-recreation-pipeline.md  # 5-Stage Universal Motion Pipeline Spec
│   ├── architecture-overview.md        # 7-Stage Hybrid Engine Architecture
│   ├── motion-ir-specification.md      # Formal Motion IR Schema Spec
│   └── quality-and-safety-gates.md     # JEV System One & A11y Standards
├── plans/journals/                     # Engineering Retros & Session History
│   └── 2026-09-22-codex-app-promo-pipeline.md # Codex App Session Retro & Root Cause Analysis
├── skills/                             # Universal Portable Agent Skills
│   ├── product-designer/               # EaseUI tactile depth & SVGL brand marks
│   └── motion-video-recreation/        # Multi-agent motion video recreation skill
├── promo/                              # Virtual-Clock Engine & Rendered Broadcast Assets
│   ├── claude-design-promo.html        # 82s Interactive Web Player (Claude Design)
│   ├── claude-design-promo.mp4         # 1080p 60fps Broadcast Video Output
│   ├── codex-app-promo.html            # 38s Interactive Web Player (OpenAI Codex App)
│   ├── codex-app-promo.mp4             # 1080p 30fps Broadcast Video Output
│   ├── claude-design-engine.js         # Deterministic Virtual Clock Engine
│   └── claude-design.css               # Dynamic dark/light theme & easing tokens
├── src/components/                     # Production React Three Fiber Suite
│   ├── InteractiveGlobeWorkspace.tsx   # 3D Orthographic Globe + Great-Circle Arcs
│   ├── ExpandingInput.tsx              # Morphing pill-to-form + Claude star spinner
│   ├── MeditationAppWorkspace.tsx      # Pulsing Enso ring timer + iOS device mockup
│   ├── InlineEditingWorkspace.tsx      # Guide layout + Typography knobs + Spline chart
│   ├── ExportHandoffModal.tsx          # Design-to-code CLI handoff card
│   └── ClaudeDesignShowcase.tsx        # Unified master showcase container
├── scripts/                            # Deterministic Tooling & Verification Gates
│   ├── motion-preflight-guard.py       # Proactive Pre-Flight Quality Guard & Auto-Fix CLI
│   ├── anti-flop-gate.py               # 6-Gate automated quality & a11y auditor
│   ├── export-promo-video.py           # Headless Chrome + FFmpeg frame capture pipeline
│   ├── jev-svg-auditor.py              # SVG AST & animatability auditor
│   └── motion-ir-compiler-demo.ts      # Motion IR -> CSS & GSAP prototype compiler
├── schemas/
│   └── motion-ir.schema.json           # JSON Schema for motion timeline tracks
└── package.json                        # Dependencies & verified npm scripts (guard, audit)
```

---

## Anti-Flop & Quality Gates Reference

| Gate | Target | Pass Condition |
| :--- | :--- | :--- |
| **Pre-Flight** | Invariant Self-Healing | Stroke boundary $\ge 4\text{px}$, button glyphs with explicit fill, DOM camera decoupling, damped harmonic springs. |
| **Gate 0** | Mandatory Product Designer | Product designer skill verified and active for tactile depth and authentic SVGL marks. |
| **Gate 1** | Icon System & Zero Emoji | Official Phosphor / Lucide symbols only in `<defs>` / `<use>` / React components. Zero raw emojis allowed. |
| **Gate 2** | Typography & Contrast | `-webkit-font-smoothing: antialiased`, WCAG 2.2 AA compliant contrast ratios. |
| **Gate 3** | Tactile Spatial Depth | 8pt/4pt modular grid, multi-layered diffuse drop shadows. |
| **Gate 4** | A11y & Motion Safety | `@media (prefers-reduced-motion: reduce)` fallbacks, valid ARIA tags. |
| **Gate 5** | Security & Determinism | No XSS strings, no `NaN` or unclosed coordinates, valid Motion IR syntax. |

---

## Ecosystem
- **Ecosystem**: Design OS
- **Target Runtimes**: Modern Browsers, React 19 / Three.js / R3F, Headless Chromium, Web Components
- **License**: MIT
