# Universal Motion Video Recreation Pipeline & Workflow Guide

> **Ecosystem**: Design OS / AgentKit  
> **Status**: Production Reference Manual  
> **Target Audience**: AI Coding Agents (Claude Code, Codex Native, Antigravity) & Motion Engineers  
> **Reference Implementations**: `promo/claude-design-promo.html` (82s), `promo/codex-app-promo.html` (38s)

---

## 1. Executive Summary

This guide codifies the **Universal Motion Video Recreation Pipeline** developed across the Claude Design and OpenAI Codex App launch promo projects. It translates complex UI/UX video recordings into **broadcast-quality 1080p 60fps MP4 launch videos** and **interactive web showcases** with zero kinematic drift, zero dropped frames, and 100% deterministic reproducibility.

---

## 2. The 5 Golden Architectural Invariants

| # | Invariant | Enforcement Standard | Why It Matters |
| :--- | :--- | :--- | :--- |
| **1** | **Reference as Ground Truth** | Deconstruct video into timestamps, keyframe images, and audio waveforms before writing any code. | Prevents kinematic drift, pacing hallucinations, and misaligned transition cuts. |
| **2** | **Strict Asset Provenance** | 100% official brand marks from **SVGL** (`https://svgl.app/`); iconography strictly from **Phosphor** or **Lucide**. Strictly **0 raw emojis**. | System emojis render inconsistently across OSes; arbitrary SVGs violate brand guidelines. |
| **3** | **Single Deterministic Virtual Clock** | All animations, transitions, cursor moves, and spring physics must be algebraically bound to `window.__seekToTime(t)`. | Eliminates dropped frames, GPU jitter, and OS thread lag during video export. |
| **4** | **JEV Coordinate Safety** | Any vector with stroke-width $S$ in viewBox $W \times H$ must maintain inner boundary padding $\ge S / 2$. | Prevents clipped curves at the viewBox boundaries during scale or stroke expansion. |
| **5** | **Subprocess Failure Contract** | Headless Chrome runs with non-blocking polling, explicit timeouts, and isolated `--user-data-dir`. | Prevents headless Chrome hangs on macOS due to lingering audio/networking daemon threads. |

---

## 3. The 5-Phase Universal Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Multimodal Ingestion & Temporal Deconstruction                │
│ - ffprobe metadata, audio extraction, keyframe sequence sampling       │
│ - Fact/Inference ledger: camera bounds, colors, typography, pacing     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 2: Screenplay & Kinematic Specification                          │
│ - Narrative Beats (01..N), duration quotas, camera viewport anchors    │
│ - Cursor tracks, click ripple states, and spring parameter definitions │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Web-Tech Implementation (HTML5 / SVG / CSS / Three.js)       │
│ - Clean DOM hierarchy: separate #camera-world from root overlays       │
│ - SVGL vector symbols, EaseUI tactile depths, dynamic button states    │
│ - Algebraic virtual clock time-scrubbing: window.__seekToTime(t)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 4: Headless Frame Capture & Automated Quality Gating             │
│ - Frame extraction via Headless Chrome with non-blocking Popen         │
│ - 6 Automated Anti-Flop Gates: icons, typography, depth, A11y, bounds  │
│ - Owner Approval Gate: visual evidence proof snapshots before export   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 5: Broadcast Assembly & Multi-Surface Delivery                   │
│ - FFmpeg 1080p MP4 master encoding (H.264 YUV420P, CRF 18)             │
│ - Palette-optimized 640×360 GIF generation (palettegen/paletteuse)     │
│ - Publication to GitHub Pages showcase & documentation integration     │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Multimodal Ingestion & Temporal Deconstruction

1. **Extract Metadata & Audio Waveform**:
   ```bash
   ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,r_frame_rate reference.mp4
   ffmpeg -i reference.mp4 -vn -acodec pcm_s16le -ar 44100 research/audio.wav
   ```
2. **Sample Scene Keyframes**:
   ```bash
   ffmpeg -i reference.mp4 -vf "fps=2" -q:v 2 research/keyframes/f_%03d.jpg
   ```
3. **Establish Fact / Inference Ledger**:
   - Record exact cut timestamps: $t_0, t_1, \dots, t_n$.
   - Identify active work zones, zoom focal points, and typography scales.

---

### Phase 2: Screenplay & Kinematic Specification

1. **Narrative Beat Structure**:
   - Divide timeline into 4–6 high-tempo narrative beats (e.g., Hook $\to$ Morph $\to$ Review $\to$ Live App $\to$ Outro).
2. **Coordinate Planning**:
   - For every interactive click, calculate exact element center in screen space:
     $$X_{\text{screen}} = X_{\text{camera}} + (X_{\text{elem}} - X_{\text{camera\_origin}}) \cdot \text{scale}$$
   - Cursor paths must use cubic-bezier acceleration and deceleration (`ease-in-out` or Catmull-Rom spline interpolation).

---

### Phase 3: Web-Tech Implementation

1. **DOM Hierarchy Isolation**:
   - Keep world transformations separated from fixed screen-space overlays:
   ```html
   <div id="viewport-stage">
     <!-- Camera World: moves, scales, and zooms -->
     <div id="camera-world">
       <div id="main-window">...</div>
       <div id="preview-window">...</div>
     </div>
     
     <!-- Screen-Space Overlays: cursor and outro stay fixed to screen -->
     <div id="cursor-layer">
       <div id="mouse-cursor">...</div>
       <div id="click-ripple"></div>
     </div>
     <div id="outro-stage">
       <svg class="outro-logo">...</svg>
     </div>
   </div>
   ```

2. **Damped Harmonic Oscillator Spring Physics**:
   Use analytical harmonic equations keyed directly to elapsed time $\Delta t = t - t_{\text{start}}$:
   $$\omega_d = \omega \sqrt{1 - \zeta^2}$$
   $$s(\Delta t) = 1 - e^{-\zeta \omega \Delta t} \left( \cos(\omega_d \Delta t) + \frac{\zeta \omega}{\omega_d} \sin(\omega_d \Delta t) \right)$$
   ```javascript
   function springGentle(dt) {
     if (dt <= 0) return 0;
     const zeta = 0.65; // Damping ratio: subtle friction
     const omega = 7.5; // Natural frequency
     const omegaD = omega * Math.sqrt(1 - zeta * zeta);
     const decay = Math.exp(-zeta * omega * dt);
     return 1 - decay * (Math.cos(omegaD * dt) + (zeta * omega / omegaD) * Math.sin(omegaD * dt));
   }
   ```

3. **Dynamic Button Glyph & State Toggle**:
   Never render empty rectangles or raw text buttons. Use SVG `<use>` elements that transition smoothly between application states:
   ```html
   <button class="btn-submit-circle" id="chat-submit-btn">
     <svg viewBox="0 0 24 24" id="chat-composer-btn-icon">
       <use href="#icon-arrow-up"></use>
     </svg>
   </button>
   ```

---

### Phase 4: Headless Frame Capture & Automated Quality Gating

1. **Non-Blocking Headless Chrome Capture Engine**:
   ```python
   def capture_frame(url, target_path):
       user_data = f"/tmp/chrome_{int(time.time()*1000)}"
       cmd = [
           CHROME_BIN,
           "--headless",
           "--disable-gpu",
           "--no-first-run",
           "--no-default-browser-check",
           "--disable-background-networking",
           f"--user-data-dir={user_data}",
           "--window-size=1920,1080",
           "--virtual-time-budget=2000",
           "--run-all-compositor-stages-before-draw",
           f"--screenshot={target_path}",
           url
       ]
       proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
       t0 = time.time()
       while time.time() - t0 < 5.0:
           if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
               break
           time.sleep(0.1)
       proc.terminate()
       shutil.rmtree(user_data, ignore_errors=True)
   ```

2. **Run 5 Anti-Flop Gates**:
   - `python3 scripts/anti-flop-gate.py`
   - Gate 0: Mandatory Skill Invariant.
   - Gate 1: 0 Raw Emojis & 100% SVGL / Phosphor vectors.
   - Gate 2: Typography antialiasing & subpixel smoothing.
   - Gate 3: Tactile depth & 8pt modular grid.
   - Gate 4: WCAG 2.2 AA contrast & prefers-reduced-motion.
   - Gate 5: Deterministic virtual clock quantizing.

3. **Owner Approval Gate (Hard Rule)**:
   - Capture keyframe visual evidence proofs.
   - Present screenshots in walkthrough artifact.
   - Only execute full video export after explicit user sign-off.

---

### Phase 5: Broadcast Assembly & Multi-Surface Delivery

1. **Master 1080p MP4 Encoding**:
   ```bash
   ffmpeg -y -framerate 4.0 -i /tmp/frames/frame_%04d.png \
     -c:v libx264 -pix_fmt yuv420p -r 30 -preset fast -crf 18 output.mp4
   ```
2. **Palette-Optimized GitHub Pages GIF**:
   ```bash
   ffmpeg -y -i output.mp4 -vf "fps=8,scale=640:360:flags=lanczos,palettegen=stats_mode=diff" /tmp/palette.png
   ffmpeg -y -i output.mp4 -i /tmp/palette.png \
     -lavfi "fps=8,scale=640:360:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3" showcase.gif
   ```
3. **Publish to GitHub Pages**:
   - Embed animated showcase into `docs/index.html` under `#showcase`.
   - Register interactive runner in `#loop`.

---

## 4. Anti-Patterns vs. Best Practices

| Domain | ❌ Anti-Pattern | ✅ Best Practice |
| :--- | :--- | :--- |
| **Icons & Brand** | Raw Unicode emoji (`📁`, `⚙️`, `🤖`) or unverified vector paths. | Official **Phosphor** vectors & **SVGL** brand marks (`svgl.app`). |
| **SVG Bounds** | Path touching outer viewBox edges ($x=0$ or $x=24$) with stroke. | Scaled vector with $S/2$ padding + CSS `overflow: visible;`. |
| **Buttons** | Raw un-styled `<rect>` or empty container rendering pitch-black. | Circular styled container with SVG `<use>` and dynamic icon toggle. |
| **Camera & Cursor** | Disconnected camera zooms with cursor jumping abruptly. | Camera tracks cursor; click triggers expanding ripple animation. |
| **Demo Content** | Lorem ipsum boilerplate or unrelated text strings. | Context-authentic code, file paths, and semantic task descriptions. |
| **Outro Transition** | Flying/sliding in from screen margins or off-center zoom. | Centered screen-space overlay scaling $0 \to 100\%$ with damped spring bounce. |
| **Video Export** | Blocking `subprocess.run` on macOS Chrome headless. | Non-blocking `Popen` with polling, timeout, and process cleanup. |

---

## 5. DESIGN:OS Motion Quality Scorecard (0–100 Points)

| Category | Max Pts | Evaluation Criteria |
| :--- | :--- | :--- |
| **Temporal & Kinematic Parity** | 25 | Timing matches reference cuts within $\pm 0.1\text{s}$; cubic-bezier and spring easings feel natural; zero layout jitter. |
| **Asset & Brand Integrity** | 20 | 100% SVGL brand marks; zero raw emojis; zero SVG viewBox stroke clipping. |
| **Tactile Depth & Micro-interactions** | 20 | Cursor tracking coordinates exact; click ripples visible; macOS dark window borders and shadows render authentic depth. |
| **Determinism & Engineering Safety** | 20 | Passes all 5 Anti-Flop Gates; deterministic `__seekToTime(t)`; non-blocking export pipeline with clean error contracts. |
| **Delivery & Showcase Quality** | 15 | 1080p MP4 broadcast export; high-fidelity lightweight GIF preview; documentation showcase integration. |
| **Total** | **100** | **Minimum Passing Score: 90 / 100** |

---

## 6. Polished Delivery: Proactive Prevention & Self-Healing Guard

> **Core Philosophy**: *Never wait for bugs to manifest during video rendering or user review. Detect, suggest, and auto-heal known failure modes before the first frame is captured.*

### A. Pre-Flight Quality Guard Command
Run the proactive pre-flight guard at any point during motion implementation:
```bash
# Proactively inspect code and print actionable suggestions
npm run guard
# or: python3 scripts/motion-preflight-guard.py --suggest

# Proactively auto-heal fixable flaws across SVG, buttons, and DOM
npm run guard:fix
# or: python3 scripts/motion-preflight-guard.py --fix
```

### B. Automated Self-Healing Matrix

| Failure Mode | Proactive Detection | Auto-Healing Action (`--fix`) | Manual Recommendation |
| :--- | :--- | :--- | :--- |
| **SVG Stroke Boundary Clipping** | JEV AST scan finds stroke paths reaching viewBox limits ($x \le 0$ or $x \ge W$). | Injects inner scaling group: `<g transform="translate(S/2, S/2) scale(1 - S/W)">` and `overflow: visible;`. | Maintain $S/2$ margin inside viewBox for any path with `stroke-width="S"`. |
| **Pitch-Black Button Bug** | Unstyled `<rect>` or empty container inside `<button>`. | Replaces with `.btn-submit-circle` + `<svg><use href="#icon-arrow-up"/></svg>`. | Always wrap icons in `<svg>` with verified `<use>` references. |
| **DOM Camera Transform Contamination** | Fixed overlays (`#outro-stage`, `#cursor-layer`) nested inside `#camera-world`. | Relocates overlays to root screen-space layer outside `#camera-world`. | Camera world must only contain zoomable elements; overlays stay fixed. |
| **Unstable Outro Spring** | Spring damping ratio $\zeta \notin [0.5, 0.85]$ or missing decay envelope. | Auto-suggests calibrated damped harmonic oscillator parameters ($\zeta=0.65, \omega=7.5$). | Use analytical harmonic equation: $s(t) = 1 - e^{-\zeta\omega t}(\dots)$. |
| **Headless Chrome Deadlock** | Synchronous `subprocess.run(CHROME_BIN)` without timeout or polling. | Flags risk and outputs non-blocking `subprocess.Popen` drop-in snippet. | Always poll screenshot file size ($>1000\text{B}$) with timeout-triggered `proc.terminate()`. |
