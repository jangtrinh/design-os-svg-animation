---
name: motion-video-recreation
description: "Recreate UI/UX launch promo videos, SaaS product motion, and 3D vector animations with 99% kinematic, spatial, and timing parity using virtual clocks, R3F, and headless Chrome."
user-invocable: true
when_to_use: "Use when tasked with analyzing, breaking down, and recreating a high-fidelity UI promo video (YouTube/MP4/brief) into both an exact video export and interactive React/Three.js components."
category: frontend
keywords: [video-recreation, motion-design, promo-video, three-js, r3f, headless-chrome, ffmpeg, anti-flop, virtual-clock]
license: MIT
metadata:
  author: design-os
  version: "2.0.0"
---

# Motion Video Recreation Skill (v2.0 - HyperFrames Architecture)

## Multi-Agent Runtime Compatibility

This skill is certified across three primary AI coding runtimes:

| Capability | Claude Code (`.claude`) | Codex Native (`Codex CLI`) | Antigravity (`Gemini Agentic`) |
| :--- | :--- | :--- | :--- |
| **Skill Name** | `/motion-video-recreation` | Task / Goal in `AGENTS.md` | `ak:motion-video-recreation` |
| **Shell Command** | `Bash` | `shell_command` | `run_command` |
| **File Read** | `View` / `Read` | `read_file` | `view_file` |
| **File Write/Edit**| `WriteFile` / `FileEdit` | `file_edit` | `write_to_file` / `replace_file_content` |
| **User Dialog** | `AskUserQuestion` | `request_user_input` | `ask_question` |
| **Expert Consult**| Internal reasoning | GPT-6-Astra deep thinking | MCP `codex-chatgpt-web` (`codex-web -m pro`) |

---

## Immutable Hardrules
1. **Mandatory Product Designer Consultation (MUST-CALL)**: Before creating, refining, or modifying any animation scenes or UI mockups, agents MUST activate and follow the `product-designer` skill (`/product-designer` or `ak:product-designer`). Enforce EaseUI tactile depth, 1px subtle borders, authentic SVGL marks, and undistorted 3D projections.
2. **Zero Raw Emojis / Official Vector Icon Sets Only**: NEVER use raw Unicode emojis (e.g. 📦, 📄, 🚀, 🤖, 🎨) as UI icons, button graphics, indicators, or decorative markers in code or documentation. ALWAYS use official vector icon libraries (Phosphor Icons `@phosphor-icons/core` or Lucide Icons `lucide-react` via SVG `<defs>` + `<use>` or React icon components).
3. **Deterministic Virtual Clock**: All video/motion timelines must decouple from wall-clock time and expose a deterministic time hook (`window.__seekToTime(t)` or `timeline.time(t)`).
4. **Finite Authored Timelines Invariant**: Child timelines MUST NOT contain infinite repeating tweens (`repeat: -1`). Unbounded child timelines break deterministic Chromium frame-seeking and WebCodecs encoders.
5. **Gate 6: Hotspot Concentricity (`Δ <= 1.0px`)**: For any cursor click animation, the pointer tip coordinate `(cursorX, cursorY)` must align with the target element's geometric centroid within `Δ <= 1.0px`.
6. **GPU-Composited Transforms Only**: Strictly limit active continuous animations to `transform` (`translate3d`, `scale`, `rotate`) and `opacity`. Avoid layout thrashing (`width`, `height`, `top`, `left`, `d`).
7. **Mandatory A11y Reduced Motion**: All animations must feature `@media (prefers-reduced-motion: reduce)` fallbacks.
8. **Zero Design Flop**: Generated assets and videos must pass `npm run audit:all` with exit code 0.
9. **Unified Studio Runner UI & Parity Decoupling (HARDRULE)**: All interactive showcase runners MUST uniformly adopt the dark Studio Runner UI (`studio-runner.css`: `.studio-body`, `.studio-topbar`, rounded stage frame with `#222225` border, and docked `.studio-transport-bar` with restart `↤`, play/pause, tabular timecode, smooth scrubber, scene jump pills, speed toggles, fullscreen `⛶`, and keyboard shortcuts). Interactive runners must **NEVER** contain split-view side-by-side video comparison widgets (split view degrades viewport geometry and runner responsiveness). All 1:1 ground-truth vs. recreated video comparisons belong exclusively to marketing landing pages and documentation (`docs/index.html#parity-comparison`).

---

## The 6-Stage Standard Workflow

### Stage 1: Automated Ingestion & Audio Deconstruction
1. **Automated Cut Detection**: Run FFmpeg scene scoring to extract scene timestamps and generate a visual contact sheet:
   ```bash
   node scripts/detect-scene-cuts.mjs <reference_video.mp4>
   ```
2. **Audio Waveform Envelope Extraction**: Extract raw 16-bit PCM at 4000Hz downsampled to 50Hz peak envelopes for audio-reactive triggers:
   ```bash
   node scripts/extract-audio-waveform.mjs <reference_video.mp4>
   ```

### Stage 2: Rapid Staging with 20 HyperFrames Beats
1. **Deconstruct with Declarative Beats**: Assemble the rough draft structure using the 20 atomic HyperFrames primitives (`src/runtime/hyperframes-engine.mjs`):
   - `text`, `logo`, `input`, `chat`, `window`, `phone`, `cards`, `list`, `chart`, `notify`, `icons`, `hub`, `cloud`, `collage`, `logos`, `shape`, `burst`, `grid`, `split`, `face`.
2. **Monochrome Layout Focus**: Keep drafts in dark/monochrome tones (`--color-paper: oklch(14% 0.012 255)`) to lock timing and spatial proportions before asset styling.

### Stage 3: Unified Studio Runner UI & Decoupled Parity Verification
1. Mount the recreation engine into the standardized Studio Runner UI (`studio-runner.css`, `.studio-topbar`, rounded stage frame `#222225`, and `.studio-transport-bar`).
2. Verify pure interactive performance: interactive runners must focus purely on live engine execution without split-view video widgets.
3. Conduct 1:1 Ground-Truth video parity verification on the documentation/marketing parity deck (`docs/index.html#parity-comparison`), comparing reference vs. recreated MP4 side-by-side.

### Stage 4: High-Fidelity Dressing & Kinematic Polishing
1. **Obsidian Specular Buttons**: Apply dark gradient pills with inset specular top highlight caps (`border-radius: 999px 999px 60% 60% / 999px 999px 80% 80%`).
2. **2.5D CSS Extrusions**: Utilize zero-Three.js CSS pseudo-element extrusion (`transform: skewY(-34deg)`) for charts and metric bars.
3. **Procedural Audio Reactivity**: Hook `--audio-energy` (0.0–1.0) and `--audio-tone` to drive glow spreads, scale bumps, and particle speed.

### Stage 5: Quality, Concentricity & Anti-Flop Gates
Run the comprehensive multi-gate audit:
```bash
npm run audit:all
```
Verification Checklist:
- [x] Gate 0: Official Phosphor / Lucide icons (zero Unicode emojis).
- [x] Gate 1: Scalable SVG vectors on 8pt/4pt modular grid.
- [x] Gate 2: Finite authored timelines (zero `repeat: -1`).
- [x] Gate 3: WCAG 2.2 AA Contrast & typography smoothing.
- [x] Gate 4: Dual-ratio responsive viewport (`16:9` and `9:16`).
- [x] Gate 5: GPU-composited transforms (`transform`, `opacity` only).
- [x] Gate 6: Cursor click hotspot concentricity `Δ <= 1.0px`.

### Stage 6: Dual-Engine Export
1. **In-Browser Hardware Export (WebCodecs)**: For instant client reviews without dropped frames, export directly via `VideoEncoder` (`avc1.640033`, 24Mbps, 60fps) + `mp4-muxer`.
2. **Broadcast Headless Export (Chrome CDP)**: For pixel-perfect broadcast release:
   ```bash
   node scripts/export-60fps-video.mjs
   ```
