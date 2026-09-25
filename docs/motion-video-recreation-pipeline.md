# Motion Video Recreation Pipeline Specification

> **Version**: 2.0.0 (HyperFrames Architecture)  
> **Status**: Production Standard  
> **Ecosystem**: Design OS / AgentKit  
> **Compatible Runtimes**: Claude Code, Codex Native (`codex-web -m pro`), Antigravity

---

## 1. Executive Overview

The **Motion Video Recreation Pipeline** is an end-to-end engineering methodology designed to recreate complex UI/UX launch promos, SaaS product demos, and vector/3D motion videos with **99% visual, kinematic, and timing parity** relative to a reference video (e.g., Anthropic Claude Design, Apple Keynote, Stripe Sessions).

### Core Architectural Breakthroughs
1. **Automated Cut & Waveform Analysis**: Eliminates manual timecode guessing via FFmpeg scene scoring (`gt(scene,0.18)`) and 50Hz PCM audio peak extraction.
2. **20 HyperFrames Declarative Beats**: Rapid drafting in monochrome to lock timing and spatial choreography before high-fidelity asset rendering.
3. **Dual-Layer Synchronizer**: Locked side-by-side scrubbers aligning reference video with live GSAP/SVG draft timelines frame-by-frame.
4. **2.5D CSS Extrusions & Obsidian Tokens**: 3D geometric depth and glossy specular pill buttons without Three.js overhead.
5. **In-Browser WebCodecs Export Engine**: Hardware AVC + AAC client-side export with backpressure queue throttling (`queue.length >= 2`) alongside Headless Chrome.

---

## 2. The 6-Stage Standard Pipeline

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 1: Automated Multimodal Deconstruction                            │
│ - FFmpeg Scene Scoring (gt(scene, 0.18)) -> scene cuts & contact sheets │
│ - 50Hz PCM Waveform Envelope Extraction (ffmpeg raw s16le @ 4000Hz)     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 2: Declarative HyperFrames Beat Drafting                          │
│ - 20 Atomic Beat Primitives (text, chat, window, cards, chart, etc.)     │
│ - Fast monochrome staging (oklch(14% 0.012 255)) to lock timing        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 3: Unified Studio Runner UI & Decoupled Parity Verification       │
│ - Standardized dark Studio Runner UI (studio-runner.css + stage frame)  │
│ - Decoupled 1:1 ground-truth video parity on docs/index.html            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 4: High-Fidelity Dressing & Kinematic Polishing                   │
│ - Obsidian Specular Gloss Buttons & 2.5D CSS Extrusions (skewY(-34deg)) │
│ - Procedural Audio Reactivity (--audio-energy, --audio-tone)            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 5: Multi-Gate Anti-Flop & Concentricity Audit                     │
│ - Gate 0-5 Anti-Flop Standards (Zero Emojis, Vectors, WCAG AA, A11y)   │
│ - Gate 6 Hotspot Concentricity Audit (Δ <= 1.0px)                       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 6: Dual-Engine Export Architecture                                │
│ ┌───────────────────────────────────┐ ┌───────────────────────────────┐ │
│ │ Target A: In-Browser WebCodecs    │ │ Target B: Headless Chrome CDP │ │
│ │ - Hardware AVC (avc1.640033) 24M  │ │ - Chrome CDP Screenshot Step  │ │
│ │ - mp4-muxer ArrayBufferTarget     │ │ - FFmpeg High-Profile 60fps   │ │
│ └───────────────────────────────────┘ └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Stage Details & Specifications

### Stage 1: Multimodal Temporal & Spatial Deconstruction
Given a reference URL or video file:
1. **Scene Boundary Mapping**:
   Partition the video into discrete semantic scenes with millisecond timestamps:
   $$\text{Scene}_i = [t_{\text{start}}, t_{\text{end}}], \quad \Delta t_i = t_{\text{end}} - t_{\text{start}}$$
2. **Kinematic Curve Extraction**:
   Extract exact acceleration and deceleration profiles:
   - **Smooth Deceleration (Enter)**: `cubic-bezier(0.16, 1, 0.3, 1)` (Quartic Ease-Out).
   - **Snappy Dynamic (Pills/Buttons)**: `cubic-bezier(0.2, 0.9, 0.3, 1)`.
   - **Spring Physics**: Mass $m = 1.0$, Stiffness $k = 180$, Damping $c = 24$.
3. **Spatial Choreography**:
   - Camera: Orthographic vs. Perspective projection, Field of View (FOV).
   - Coordinated motion: Stagger offsets $\delta = 60\text{ms}$ between list elements.

### Stage 2: Motion IR (Intermediate Representation)
Storyboards are expressed as strongly typed JSON structures. Never generate unrestrained code without an intermediate spec:

```json
{
  "$schema": "./schemas/motion-ir.schema.json",
  "version": "1.0.0",
  "metadata": { "fps": 60, "duration": 82.0, "width": 1920, "height": 1080 },
  "scenes": [
    {
      "id": "scene-01-input",
      "startTime": 0.0,
      "duration": 7.0,
      "tracks": [
        {
          "target": "#pill-button",
          "property": "transform",
          "keyframes": [
            { "time": 0.0, "value": "scale(1)", "easing": "ease-out" },
            { "time": 0.8, "value": "scale(1.08)", "easing": "cubic-bezier(0.16, 1, 0.3, 1)" }
          ]
        }
      ]
    }
  ]
}
```

### Stage 3: Unified Studio Runner UI & Decoupled Parity Verification

#### Standard 1: Unified Dark Studio Runner Specification
Every interactive showcase runner (`claude-design-promo.html`, `codex-app-promo.html`, `v0-generative-ui.html`) must strictly adhere to the unified Studio Runner design system (`studio-runner.css`):
1. **Studio Header Bar (`.studio-topbar`)**: Sticky 52px dark header (`rgba(11,11,12,0.88)` blur 12px) featuring brand logo, resolution/framerate/duration metadata badge, 1x/2x speed toggles, and direct MP4 download action.
2. **Stage Frame (`.studio-stage-frame`)**: 14px rounded canvas container with 1px border (`#222225`), deep drop shadow (`0 30px 80px -40px rgba(0,0,0,0.95)`), and clean headless isolation (`.clean-export`).
3. **Transport Bar (`.studio-transport-bar`)**: Docked controls below the stage providing restart (`↤`), play/pause, tabular-nums timecode, continuous slider scrubber, scene jump pills with active highlight, and fullscreen (`⛶`).
4. **Keyboard Shortcuts**: `Space` (Play/Pause), `ArrowLeft`/`ArrowRight` (Step 250ms / Shift: 2s), `Home`/`0` (Restart), `KeyF` (Fullscreen).

#### Standard 2: Decoupled 1:1 Parity Verification (HARDRULE)
- Interactive runners must **NEVER** embed split-view side-by-side reference video comparison widgets. Split-view drags down RAF framerates and distorts responsive stage geometry.
- 1:1 Ground-Truth vs. Recreated Video Parity verification belongs exclusively to marketing landing pages and documentation (`docs/index.html#parity-comparison`), allowing side-by-side synchronized hardware video playback without impacting interactive runner performance.

#### Target A: Virtual-Clock Web Engine (`promo/claude-design-promo.html`)
The engine decouples playback speed from hardware capabilities by exposing a deterministic global time hook:
```javascript
window.__seekToTime = function(seconds) {
  state.currentTime = Math.max(0, Math.min(seconds, state.totalDuration));
  renderSceneAtTime(state.currentTime);
};
```
Benefits:
- Rendering 1 frame can take 2 milliseconds or 500 milliseconds; the resulting video output is identical and frame-perfect.
- No third-party heavy dependencies; instant browser rendering.

#### Target B: Production R3F Suite (`src/components/`)
Translates the visual assets into production React code:
- **`InteractiveGlobeWorkspace.tsx`**: Three.js orthographic sphere with Great-Circle bezier arcs, floating city nodes, and live tweak sliders.
- **`ExpandingInput.tsx`**: Morphing button-to-form animation with typewriter prompt simulation and Claude coral star spinner.
- **`MeditationAppWorkspace.tsx`**: Device frame mockup with live dark/light mode transition and pulsing Enso breathing ring.
- **`InlineEditingWorkspace.tsx`**: Visual guide layout with live typography knob adjustments and spline bar charts.
- **`ExportHandoffModal.tsx`**: Design-to-code CLI copy card with interactive toast feedback.

### Stage 4: Headless Frame Capture & FFmpeg Pipeline
Run the deterministic headless exporter (`scripts/export-promo-video.py`):
```bash
# 1. Start local server serving the virtual-clock player
npm run dev &

# 2. Capture deterministic frames via Chrome DevTools
# For each timestamp t_k, run Chrome Headless screenshot
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --window-size=1920,1080 \
  --screenshot="/tmp/frames/frame_0001.png" \
  "http://127.0.0.1:4323/claude-design-promo.html?clean=true&t=0.5&autoplay=false"

# 3. Compile high-profile MP4 via FFmpeg
ffmpeg -y -framerate 30 -i /tmp/frames/frame_%04d.png \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  ./promo/claude-design-promo.mp4
```

### Stage 5: The Anti-Flop Gate (`scripts/anti-flop-gate.py`)
No video or component passes without satisfying the 5 validation gates:
1. **Gate 1 - Official Vector Glyphs & Zero Raw Emojis (HARDRULE)**: Strictly forbid approximate path drawings and raw Unicode emojis in UI templates, buttons, or indicators; require certified icon systems (Phosphor / Lucide).
2. **Gate 2 - Typography & Contrast**: Font smoothing (`-webkit-font-smoothing: antialiased`), WCAG 2.2 AA compliant foreground/background ratios.
3. **Gate 3 - Spatial Hierarchy**: 8pt/4pt modular layout grid, layered soft shadows (`box-shadow: 0 20px 40px -12px rgba(...)`).
4. **Gate 4 - Accessibility (A11y)**: `@media (prefers-reduced-motion: reduce)` fallbacks that preserve content legibility.
5. **Gate 5 - Coordinate Determinism**: Forbid `NaN`, `undefined`, unclosed SVG paths, and layout-thrashing animations.

---

## 4. Multi-Agent Cross-Runtime Protocol

| Feature | Claude Code (`.claude`) | Codex Native (`Codex CLI`) | Antigravity (`Gemini Agentic`) |
| :--- | :--- | :--- | :--- |
| **Invocation** | `/motion-video-recreation` | Goal / Task via `AGENTS.md` | `ak:motion-video-recreation` |
| **Execution Tool** | `Bash` | `shell_command` | `run_command` |
| **File Editing** | `FileEdit` / `WriteFile` | `file_edit` | `write_to_file` / `replace_file_content` |
| **Inspection** | `Glob` / `Grep` | `file_search` / `grep` | `find_by_name` / `grep_search` |
| **Consultation** | Claude internal reasoning | GPT-6-Astra deep thinking | MCP `codex-chatgpt-web` |
| **Confirmation** | `AskUserQuestion` | `request_user_input` | `ask_question` |

---

## 5. Practical Workflow Reference & User Guide

For the full step-by-step user implementation guide, analytical spring formulas, headless Chrome failure contracts, and the 0–100 Quality Scorecard synthesized from production sessions, see:
- [Universal Motion Video Recreation Pipeline & Workflow Guide](motion-video-recreation-workflow-guide.md)
- [OpenAI Codex App Session Engineering Journal](../plans/journals/2026-09-22-codex-app-promo-pipeline.md)
