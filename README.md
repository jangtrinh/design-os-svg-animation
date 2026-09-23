# Design OS — SVG Animation Engine & Motion Video Pipeline

> **Deterministic vector animation and 1080p 60fps motion video pipeline for AI coding agents.**  
> **v0.2.0 — HyperFrames Edition**: Automated scene scoring, 50Hz audio envelopes, 20 HyperFrames beats, 1:1 dual-layer split sync, and Gate 6 concentricity.  
> Live Site: [https://jangtrinh.github.io/design-os-svg-animation/](https://jangtrinh.github.io/design-os-svg-animation/)

<p align="left">
  <a href="https://github.com/jangtrinh/design-os-svg-animation/releases"><img src="https://img.shields.io/badge/release-v0.2.0--hyperframes-202020?style=for-the-badge" alt="Release: v0.2.0" height="28"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-202020?style=for-the-badge" alt="License: MIT" height="28"></a>
  <img src="https://img.shields.io/badge/three.js-0.186-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js 0.186" height="28">
  <img src="https://img.shields.io/badge/react-19-202020?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React 19" height="28">
  <img src="https://img.shields.io/badge/headless-chromium-202020?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Headless Chromium" height="28">
  <img src="https://img.shields.io/badge/webcodecs-hardware_mp4-202020?style=for-the-badge" alt="WebCodecs: Hardware MP4" height="28">
  <img src="https://img.shields.io/badge/virtual_clock-deterministic_60fps-202020?style=for-the-badge" alt="Virtual Clock: Deterministic 60fps" height="28">
  <img src="https://img.shields.io/badge/anti--flop-7_gates_pass-202020?style=for-the-badge" alt="Anti-Flop: 7 Gates Pass" height="28">
</p>

---

## Visual Showcase & Promo Demos (v2.0 Upgraded)

| Metric / Demo | Example 1: Claude Design Master Promo | Example 2: SaaS 9:16 Vector Short | Example 3: OpenAI Codex App Promo | Example 4: Vercel v0 Generative UI |
| :--- | :---: | :---: | :---: | :---: |
| **Preview** | ![Claude Design 3D Globe](docs/assets/example-1-claude-design-globe.gif) | ![SaaS Vector Motion](docs/assets/example-2-saas-motion-engine.gif) | ![OpenAI Codex App Promo](docs/assets/example-3-codex-app-promo.gif) | ![Vercel v0 Generative UI](docs/assets/example-4-v0-generative-ui.gif) |
| **Interactive Runner** | [🚀 Launch Web Player](https://jangtrinh.github.io/design-os-svg-animation/promo/claude-design-promo.html) ([local](promo/claude-design-promo.html)) | [📱 Launch Web Player](https://jangtrinh.github.io/design-os-svg-animation/promo/saas-short.html) ([local](promo/saas-short.html)) | [⚡ Launch Web Player](https://jangtrinh.github.io/design-os-svg-animation/promo/codex-app-promo.html) ([local](promo/codex-app-promo.html)) | [▲ Launch Web Player](https://jangtrinh.github.io/design-os-svg-animation/promo/v0-generative-ui.html) ([local](promo/v0-generative-ui.html)) |
| **1:1 Dual-Layer Sync** | [🪞 Launch 1:1 Split Sync](https://jangtrinh.github.io/design-os-svg-animation/promo/claude-design-promo.html?split=true) | Built-in Motion IR sync | [🪞 Launch 1:1 Split Sync](promo/codex-app-promo.html?split=true) | [🪞 Launch 1:1 Split Sync](promo/v0-generative-ui.html?split=true) |
| **Deconstruction Assets** | [Contact Sheet](promo/claude-design-promo.contact-sheet.jpg) · [Waveform](promo/claude-design-promo.wave.json) | [Cuts JSON](docs/saas-short.cuts.json) · [Waveform](promo/saas-short.wave.json) | [Contact Sheet](promo/codex-app-promo.contact-sheet.jpg) · [Waveform](promo/codex-app-promo.wave.json) | [Contact Sheet](docs/v0-generative-ui.contact-sheet.jpg) · [Waveform](promo/v0-generative-ui.wave.json) |
| **Broadcast Video** | [🎬 1080p 60fps MP4 (13 MB)](promo/claude-design-promo.mp4) | [🎬 1080x1920 60fps MP4 (0.5 MB)](promo/saas-short.mp4) | [🎬 1080p 30fps MP4 (10 MB)](promo/codex-app-promo.mp4) | [🎬 1080p 60fps MP4 (2.4 MB)](promo/v0-generative-ui.mp4) |
| **Aspect & Duration** | 16:9 · 82.0 seconds | 9:16 Vertical · 11.5 seconds | 16:9 · 38.0 seconds | 16:9 · 47.5 seconds |
| **Key Motion Features** | Specular Glossy Pill, 2.5D CSS mini-bars, 3D Globe with Great-Circle arcs, live Tweaks, and audio-reactive aura | Shared-element card-to-pill morph, Phosphor vectors, C¹ continuous lerp camera zoom & zero blank frames | Native macOS window kinematics, multi-agent streaming execution, tactile diff review & photobooth preview | Official v0 wireframe drawing, reel prompt cycle, component popover edit, 3D code perspective card, Stealth Mode toggle, Vercel outro |

---

## ⚡ What's New in v2.0 (HyperFrames Architecture Upgrade)

Our recreation pipeline has been upgraded with core architectural breakthroughs:

1. **Automated Cut & Waveform Analysis (`npm run analyze:ref`)**:
   - Automated FFmpeg scene transition scoring (`select='gt(scene,0.18)'`) divides videos into logical scenes and renders 2-column contact sheets.
   - Raw 16-bit PCM mono audio extraction at 4000Hz aggregates into 50Hz peak envelopes (`.wave.json`), powering procedural `--audio-energy` reactive visuals.
2. **20 Declarative HyperFrames Beats (`src/runtime/hyperframes-engine.mjs`)**:
   - 20 high-speed atomic primitives (`text`, `logo`, `input`, `chat`, `window`, `phone`, `cards`, `list`, `chart`, `notify`, `icons`, `hub`, `cloud`, `collage`, `logos`, `shape`, `burst`, `grid`, `split`, `face`) to stage rough drafts in minutes.
3. **1:1 Dual-Layer Reference vs. Draft Synchronizer**:
   - Side-by-side split screen locking reference MP4 playback with live SVG/HTML canvas timelines for sub-frame verification.
4. **Obsidian Specular Tokens & 2.5D CSS Extrusions**:
   - High-gloss pill buttons with top specular highlight caps (`border-radius: 999px 999px 60% 60% / 999px 999px 80% 80%`) and 105° glint sweep.
   - 2.5D isometric pseudo-element extrusions (`skewY(-34deg)`) providing physical depth without Three.js overhead.
5. **Gate 6: Hotspot Concentricity (`npm run audit:hotspots`)**:
   - Automated physical alignment gate verifying that cursor tips hit exact button centroids within `Δ <= 1.0px`.
6. **In-Browser WebCodecs MP4 Exporter**:
   - Client-side hardware `VideoEncoder` (`avc1.640033`, 24Mbps, 60fps) + `mp4-muxer` with queue backpressure (`queue.length >= 2`).

---

## AI Agent Quick Reference & Ingestion Guide

If you are an AI coding agent reading this codebase, follow these rules and directives strictly:

### 1. The 9 Immutable Agent Invariants
1. **Mandatory Product Designer Skill (MUST-CALL)**: Before designing, creating, or modifying any animation scene, UI mockup, or video layout, agents MUST activate and consult [`skills/product-designer/SKILL.md`](skills/product-designer/SKILL.md) for EaseUI tactile depth, 1px subtle borders, authentic SVGL marks, and undistorted 3D projections.
2. **Never generate raw SVG path animations directly**: Always pass through the [Motion IR Schema](schemas/motion-ir.schema.json) and deterministic geometric compilation (`svgo`, `flubber`).
3. **Deterministic First**: Decouple temporal progression via the Virtual Clock (`window.__seekToTime(t)`). Never rely on non-deterministic real-time screen recordings.
4. **Finite Authored Timelines**: Child timelines MUST NOT contain infinite repeating tweens (`repeat: -1`). Unbounded timelines break deterministic Chromium seeking and WebCodecs encoders.
5. **GPU-Composited Transforms Only**: Animate `transform` (`translate3d`, `scale`, `rotate`) and `opacity`. Strictly avoid animating layout-thrashing attributes (`width`, `height`, `top`, `left`, `d`) during continuous motion.
6. **Mandatory A11y & Reduced Motion**: Every generated CSS/JS animation must provide `@media (prefers-reduced-motion: reduce)` fallbacks.
7. **Zero Emojis / Official Vector Icons Only (HARDRULE)**: Never use raw Unicode emojis as UI icons, button graphics, or status badges. Always use official Phosphor Icons (`@phosphor-icons/core`) or Lucide Icons (`lucide-react`) via SVG `<defs>` + `<use>` or React icon components. Sourced brand marks must come from SVGL (`https://svgl.app/`).
8. **Gate 6 Hotspot Concentricity (`Δ <= 1.0px`)**: Pointer tip coordinates must match button centroids precisely. All assets must pass `npm run audit:all` with exit code `0`.
9. **Unified Studio Runner UI & Parity Decoupling (HARDRULE)**: All interactive showcase runners MUST uniformly adopt the dark Studio Runner UI (`studio-runner.css`: `.studio-body`, `.studio-topbar`, rounded stage frame `#222225`, and `.studio-transport-bar` with restart, play/pause, timecode, scrubber, scene jump pills, speed toggles, fullscreen `⛶`, and keyboard shortcuts). Interactive runners must **NEVER** contain split-view side-by-side video comparison widgets (split view degrades viewport geometry and runner responsiveness). All 1:1 ground-truth vs. recreated video comparisons belong exclusively to marketing landing pages and documentation (`docs/index.html#parity-comparison`).

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
   # Demo 1: Claude Design 82s Promo (16:9, 1080p 60fps)
   python3 scripts/export-promo-video.py

   # Demo 2: SaaS Short 11.5s Motion Engine (9:16 Vertical, 1080x1920 60fps)
   python3 scripts/export-promo-video.py --url http://localhost:3033/saas-short.html --output promo/saas-short.mp4 --width 1080 --height 1920 --fps 60 --duration 11.5

   # Demo 3: OpenAI Codex App 38s Master Promo (16:9, 1080p 30fps)
   python3 scripts/export-promo-video.py --url http://localhost:3033/codex-app-promo.html --output promo/codex-app-promo.mp4 --fps 30 --duration 38

   # Demo 4: Vercel v0 Generative UI 47.5s Official Video (16:9, 1080p 60fps)
   node scripts/export-60fps-video.mjs v0
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
│   ├── claude-design-promo.html        # 82s Interactive Web Player (Claude Design + 16-Project Outro Montage)
│   ├── claude-design-promo.mp4         # 1080p 60fps Broadcast Video Output (13 MB)
│   ├── claude-design-engine.js         # Deterministic Virtual Clock Engine (Claude Design)
│   ├── claude-design.css               # Dynamic dark/light theme & easing tokens
│   ├── saas-short.html                 # 11.5s 9:16 Vertical Interactive Web Player (SaaS Product Demo)
│   ├── saas-short.mp4                  # 1080x1920 60fps Broadcast Video Output (0.5 MB)
│   ├── saas-short-engine.js            # Virtual Clock Engine (Continuous Camera Lerp, Phosphor Icons)
│   ├── saas-short.css                  # High-DPI mobile phone bezel & layout styles
│   ├── codex-app-promo.html            # 38s Interactive Web Player (OpenAI Codex App)
│   ├── codex-app-promo.mp4             # 1080p 30fps Broadcast Video Output (10 MB)
│   ├── codex-app-engine.js             # High-tempo macOS window & multi-agent engine
│   └── codex-app.css                   # macOS Sonoma dark theme & terminal styling
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
