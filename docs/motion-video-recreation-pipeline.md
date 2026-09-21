# Motion Video Recreation Pipeline Specification

> **Version**: 1.0.0  
> **Status**: Production Standard  
> **Ecosystem**: Design OS / AgentKit  
> **Compatible Runtimes**: Claude Code, Codex Native, Antigravity

---

## 1. Executive Overview

The **Motion Video Recreation Pipeline** is an end-to-end engineering methodology designed to recreate complex UI/UX launch promos, SaaS product demos, and vector/3D motion videos with **99% visual, kinematic, and timing parity** relative to a reference video (e.g., Anthropic Claude Design, Apple Keynote, Stripe Sessions).

### Why Traditional Generative AI Fails at Motion Video
1. **Kinematic Drift**: Pure LLM video generation hallucinates temporal progression, producing non-physical jumps and flickering interfaces.
2. **Layout Thrashing**: Animating non-composited CSS properties (`top`, `left`, `width`, `height`, `d`) causes browser repaint bottlenecks.
3. **Dropped Frames**: Real-time screen recording relies on variable system FPS. Dropped frames degrade fine spring animations.
4. **Disconnection from Production**: Pure video outputs cannot be exported as actual interactive React / Three.js UI components.

### The Solution: Hybrid Deterministic Vector Motion
By decoupling temporal progression into a **virtual clock**, extracting exact **cubic-bezier and spring curves**, compiling into **Motion IR**, and executing a **headless frame-stepping capture**, this pipeline produces both:
- **A 60fps 1080p full-fidelity broadcast video (MP4)**.
- **A fully functional, interactive production React / Three.js component suite**.

---

## 2. The 5-Stage Standard Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 1: Multimodal Temporal & Spatial Deconstruction                    │
│ - Timecode & Scene Breakdown (00:00 - MM:SS)                            │
│ - Kinematic Parameter Extraction (Cubic Bézier, Spring Mass/Damp)       │
│ - Design Tokens (Typography, Glassmorphism, Color Palettes)             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 2: Deterministic AI Motion IR & Expert Consultation               │
│ - Storyboard JSON schema validation (Tracks, Easing, Interpolations)   │
│ - Multi-Agent Review: Codex Native (Math/Topology) + JEV System One     │
│ - Anti-Flop Pre-flight Verification                                     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 3: Dual-Target Implementation Architecture                        │
│ ┌───────────────────────────────────┐ ┌───────────────────────────────┐ │
│ │ Target A: Virtual-Clock Web Engine│ │ Target B: Production R3F Suite│ │
│ │ - Standalone HTML/CSS/JS          │ │ - React 19 + Three.js (R3F)   │ │
│ │ - seekToTime(t) Determinism       │ │ - Framer Motion + Tailwind    │ │
│ └───────────────────────────────────┘ └───────────────────────────────┘ │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 4: Headless Frame-by-Frame Capture & FFmpeg Assembly              │
│ - Google Chrome Headless CDP Screenshot Stepping (zero dropped frames) │
│ - High-Profile FFmpeg Encoding (H.264 YUV420P, CRF 18, 60fps)          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 5: Anti-Flop & Quality Assurance Gate (5 Gates)                   │
│ - Phosphor / Lucide Icon Integrity                                     │
│ - WCAG 2.2 AA Contrast & Typography Smoothing                           │
│ - Tactile Depth & 8pt Grid Spacing                                      │
│ - A11y & prefers-reduced-motion Fallback                                │
│ - Security, Coordinate Realism & Determinism                            │
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

### Stage 3: Dual-Target Implementation

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
python3 -m http.server 3033 --directory ./promo &

# 2. Capture deterministic frames via Chrome DevTools
# For each timestamp t_k, run Chrome Headless screenshot
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --window-size=1920,1080 \
  --screenshot="/tmp/frames/frame_0001.png" \
  "http://localhost:3033/claude-design-promo.html?clean=true&t=0.5&autoplay=false"

# 3. Compile high-profile MP4 via FFmpeg
ffmpeg -y -framerate 30 -i /tmp/frames/frame_%04d.png \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  ./promo/claude-design-promo.mp4
```

### Stage 5: The Anti-Flop Gate (`scripts/anti-flop-gate.py`)
No video or component passes without satisfying the 5 validation gates:
1. **Gate 1 - Official Vector Glyphs**: Forbid approximate path drawings; require certified icon systems (Phosphor / Lucide).
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
