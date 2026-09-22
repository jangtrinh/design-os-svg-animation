# CODEX WEB PRO CONTEXT & ADOPTION SPECIFICATION: NULLMOTION -> DESIGN-OS-SVG-ANIMATION

> **Target Agent**: OpenAI Codex Web Pro (`chatgpt-web/pro` or ChatGPT Pro with deep reasoning).  
> **Source Repository**: `blixvip/NullMotion` (Reference motion drafting engine).  
> **Destination Repository**: `design-os-svg-animation` (Production SVG/Motion IR generation platform).  
> **Mission**: Implement the complete architectural and kinematic adoption of all NullMotion subsystems, templates, export pipelines, and audio-reactive engines into `design-os-svg-animation`.

---

## 1. DESTINATION ENVIRONMENT & ARCHITECTURAL CONSTRAINTS

You are working on **`design-os-svg-animation`**, an elite SVG & HTML5 motion graphics framework built for zero-runtime dependencies, crisp vector fidelity at infinite zoom, and deterministic timeline rendering.

### Strict Anti-Flop Invariants & Quality Gates (MUST COMPLY)
1. **Gate 0: Zero Raw Emojis**: Never render raw Unicode emojis (`😀`, `🚀`, `🔥`). Use Phosphor icons (`ph-*`), Lucide SVG, or curated SVGL brand marks.
2. **Gate 1: SVG Vector Purity**: All icons, cursors, badges, and logos must be scalable vectors (`<svg>` / `<path>`), strictly sized on an 8pt grid (`16px`, `24px`, `32px`, `48px`).
3. **Gate 2: Finite Authored Timelines**: Child timelines must never use `repeat: -1` or infinite durations. Chromium deterministic frame-seeking and WebCodecs exporters desynchronize if child timelines are infinite.
4. **Gate 3: Hotspot Concentricity (Gate 6)**: For all cursor click animations, the pointer tip coordinate `(cursorX, cursorY)` must align with the target element's geometric centroid within `Δ <= 1.0px`.
5. **Gate 4: Dual-Ratio Responsive Viewport**: All animations must render with zero cropping or letterboxing artifact in both `16:9` (`1920×1080` / `1280×720`) and `9:16` (`1080×1920`).
6. **Gate 5: Contrast & Typography (WCAG AA)**: Minimum contrast ratio `4.5:1` for body text, `3:1` for large text against `--color-paper` (`oklch(14% 0.012 255)`).

---

## 2. NULLMOTION SUBSYSTEMS & TECHNICAL BLUEPRINTS TO ADOPT

### A. Dual-Layer Reference vs. Draft Synchronizer (`public/drafts.mjs`, `public/demo.mjs`)
- **Concept**: Split-screen or dual-viewport staging environment.
  - Left/Top: Reference target video (e.g. `v0-generative-ui.mp4` or user reference).
  - Right/Bottom: Synchronized live HTML/SVG draft timeline divided into distinct sections.
- **Sync Mechanism**: Master timeline drives `video.currentTime = t` while concurrently stepping GSAP child timelines:
  ```javascript
  function seekTo(t) {
    film.currentTime = t;
    sections.forEach(sec => {
      const localTime = Math.max(0, Math.min(sec.duration, t - sec.start));
      sec.timeline.time(localTime);
      sec.el.classList.toggle('active', t >= sec.start && t < sec.start + sec.duration);
    });
  }
  ```

### B. The 20 Atomic HyperFrames Beat Primitives
NullMotion defines 20 declarative, high-speed motion beats that decompose any UI commercial:
1. `text`: Staggered word reveal with cubic-bezier drift (`y: 24`, `opacity: 0`, `stagger: 0.09`).
2. `logo`: Scaled rotating mark entrance (`scale: 0`, `rotation: -40`, `back.out(1.8)`) + clipPath text reveal.
3. `input`: Typewriter prompt bar with blinking cursor and send button pulse.
4. `chat`: Staggered speech bubbles with animated typing indicators.
5. `window`: macOS-style window with traffic lights, sidebar items, and gliding cursor.
6. `phone`: 3D phone chassis with notch, dynamic island, and vertical card scroll.
7. `cards`: Staggered card grid pop-in with spring damping (`back.out(1.6)`).
8. `list`: Animated interactive checklist rows with checkbox fills.
9. `chart`: Smooth SVG path drawing (`stroke-dashoffset`) with floating data tooltip.
10. `notify`: iOS toast notification drop with elastic bounce (`back.out(1.4)`).
11. `icons`: Radial bloom icon cluster (`stagger: { each: 0.04, from: 'center' }`).
12. `hub`: Central pulsing nucleus with radiating connector lines and orbiting satellites.
13. `cloud`: Floating tag cloud with harmonic sine oscillation.
14. `collage`: Multi-tilted card deck fanning into view.
15. `logos`: Infinite dual-direction conveyor belts with smooth acceleration.
16. `shape`: 3D perspective hero plate with specular gradient sheen.
17. `burst`: Radial star burst with expanding accent shockwave.
18. `grid`: Modular 2×2 card layout with staggered diagonal entrance.
19. `split`: Dual-color sliding background slice with staggered typography.
20. `face`: Minimal geometric avatar with blinking eyes and expressions.

### C. In-Browser WebCodecs + MP4-Muxer Export Pipeline
- **Zero Dropped Frames**: Replaces lossy `MediaRecorder` with `VideoEncoder` + `mp4-muxer`.
- **Queue Backpressure**: Pauses video element during capture if encoder queue exceeds 2 frames:
  ```javascript
  const muxer = new Mp4Muxer.Muxer({
    target: new Mp4Muxer.ArrayBufferTarget(),
    video: { codec: 'avc', width: 1920, height: 1080 },
    audio: { codec: 'aac', sampleRate: 44100, numberOfChannels: 2 },
    fastStart: 'in-memory'
  });
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: e => console.error(e)
  });
  encoder.configure({
    codec: 'avc1.640033', // H.264 High Profile Level 5.1
    width: 1920,
    height: 1080,
    bitrate: 24_000_000,
    framerate: 60
  });
  ```
- **SVG ForeignObject Rasterization**: Converts live DOM layouts into crisp `<foreignObject>` canvas layers when hardware rasterization is required.

### D. CSS 2.5D Extrusions & Obsidian Specular Tokens (`public/tokens.css`)
- **Obsidian Gloss Buttons**:
  ```css
  .obsidian-pill {
    background: linear-gradient(180deg, #1c1d22 0%, #0d0e11 100%);
    box-shadow: inset 0 2px 1px rgba(255, 255, 255, 0.22),
                inset 0 -3px 6px rgba(0, 0, 0, 0.85),
                0 16px 32px rgba(0, 0, 0, 0.6);
    border-radius: 999px;
  }
  .obsidian-pill::before {
    content: "";
    position: absolute;
    top: 1px; left: 14px; right: 14px; height: 45%;
    border-radius: 999px 999px 60% 60% / 999px 999px 80% 80%;
    background: linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.03) 100%);
  }
  ```
- **2.5D CSS Extruded Bars** (Zero Three.js overhead):
  ```css
  .bar-3d {
    position: relative;
    transform-style: preserve-3d;
  }
  .bar-3d::after {
    content: "";
    position: absolute;
    top: 0; left: 100%; width: 22px; height: 100%;
    background: linear-gradient(180deg, #094a6b 0%, #042436 100%);
    transform: skewY(-34deg);
    transform-origin: top left;
  }
  ```

### E. Audio Reactivity & Waveform Envelopes
- **50Hz Peak Extraction**: Precomputed via `scripts/extract-audio-waveform.mjs` (FFmpeg PCM pipe at 4000Hz -> 50Hz peaks).
- **Runtime Audio Driver**: Custom property `--audio-energy` (0.0 to 1.0) and `--audio-tone` modulating glow intensity, scale bounce, and particle velocity.

---

## 3. MASTER IMPLEMENTATION PLAN (5 MODULAR TRACKS)

### Track 1: Dual-Layer Synchronizer UI & Runner Staging
- **Goal**: Integrate the split reference-vs-draft synchronizer into `promo/runner.html` and `docs/index.html`.
- **Files**:
  - `promo/runner.html`: Add split-view mode toggle (`[Split] | [Reference Only] | [Draft Only]`).
  - `src/runtime/sync-controller.mjs`: Create controller linking reference video time to Motion IR timeline.
- **Acceptance**: Scrubbing timeline scrubber simultaneously updates reference video frame and SVG Motion IR canvas without jitter.

### Track 2: In-Browser WebCodecs MP4 Exporter
- **Goal**: Enable direct client-side MP4 generation in `promo/` with zero backend dependencies.
- **Files**:
  - `vendor/mp4-muxer.js`: Bundle standalone `mp4-muxer` library.
  - `src/runtime/webcodecs-recorder.mjs`: Implement backpressure queue + frame-accurate export (`VideoEncoder` + `AudioEncoder`).
  - `promo/index.html`: Add "Export 60fps MP4 (WebCodecs)" button.
- **Acceptance**: Exporting a 15-second animation generates a pristine `1920x1080` 60fps MP4 file in under 8 seconds on Apple Silicon.

### Track 3: 20 Beat Primitives & Template Catalog Expansion
- **Goal**: Port all 20 HyperFrames primitives and 27 NullMotion templates into standard Motion IR and reusable Web Components.
- **Files**:
  - `src/runtime/hyperframes-engine.mjs`: Expose all 20 beat primitives with Motion IR serialization support.
  - `src/components/obsidian-pill.mjs`: Web component for obsidian glossy button with glint animation.
  - `src/components/bar-3d.mjs`: 2.5D CSS extruded chart bar.
  - `fixtures/templates/`: Add 27 JSON templates (`01-cta-pill.json` through `27-cinematic-hud.json`).
- **Acceptance**: `npm run test` validates that all 27 templates instantiate valid GSAP timelines and pass all Anti-Flop gates.

### Track 4: Procedural Audio Reactivity & Waveform Scrubber
- **Goal**: Add audio peak visualization and `--audio-energy` CSS variable drive to timeline scrubbers.
- **Files**:
  - `src/runtime/audio-reactive.mjs`: Audio envelope subscriber updating CSS variables.
  - `promo/components/waveform-scrubber.mjs`: Canvas/SVG waveform scrubber rendering precomputed `.wave.json`.
- **Acceptance**: Waveform scrubber renders peaks; animation elements expand proportionally to audio beats.

### Track 5: Anti-Flop & Hotspot Telemetry Integration
- **Goal**: Enforce Gate 6 Hotspot Concentricity and zero-emoji compliance on all newly added components.
- **Files**:
  - `scripts/audit-cursor-click-hotspots.mjs`: Ensure all click-based templates (`18-cta-click`, `20-search-typing`, etc.) maintain `Δ <= 1.0px`.
  - `scripts/anti-flop-gate.py`: Add verification for 2.5D and WebCodecs output.
- **Acceptance**: `npm run guard && npm run audit:hotspots && npm run audit:anti-flop` returns exit code 0.

---

## 4. INVOCATION & RUNTIME INSTRUCTIONS FOR CODEX

When executing each track:
1. Generate clean, modular, modern ES Modules (`.mjs`) or TypeScript without bundler magic.
2. Adhere strictly to the existing codebase patterns in `src/runtime/` and `scripts/`.
3. Provide unit verification tests for every newly created module.
4. Execute `npm run audit:hotspots && npm run audit:anti-flop` before finalizing any change.
