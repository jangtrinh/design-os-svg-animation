# Deep-Dive Analysis: NullMotion Architecture & Adoption Plan

An exhaustive architectural investigation of [`blixvip/NullMotion`](https://github.com/blixvip/NullMotion), analyzing every subsystem, mathematical kinematic model, client-side export pipeline, and 27 motion design templates for adoption into `design-os-svg-animation`.

---

## 1. System Architecture Overview

NullMotion is a high-performance, zero-runtime-dependency motion graphics staging and drafting engine. Its primary philosophy is **"From rough drafts to a finished ad"**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        REFERENCE VIDEO LAYER                           │
│  Plays full reference ad (MP4 byte-range streamed via HTTP 206)        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ video.currentTime sync
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    SYNCHRONIZED DRAFTS TIMELINE                        │
│  [Section 1: Hook] [Section 2: Reveal] [Section 3: App] [Section 4]   │
│  Orange active ring, 640×360 HyperFrames canvas, paused GSAP timelines │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ requestVideoFrameCallback + queue
┌──────────────────────────────────▼─────────────────────────────────────┐
│                  IN-BROWSER WEBCODECS MP4 EXPORTER                     │
│  Hardware AVC (24 Mbps) + AAC Audio + mp4-muxer ArrayBufferTarget      │
│  Pure client-side, zero frame dropping via backpressure pause          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Breakthroughs

### A. The Declarative HyperFrames Beat Engine (`public/drafts.mjs`)
- **Philosophy**: Strips away distracting color and complex assets to focus purely on layout, typography, and temporal motion.
- **20 Atomic Beat Primitives**:
  1. `text`: Word-by-word staggered entrance (`y: 24`, `opacity: 0`, `stagger: 0.09`, `power3.out`) with continuous linear drift.
  2. `logo`: Scaled rotating mark entrance (`scale: 0`, `rotation: -40`, `back.out(1.8)`) with `clipPath: inset(0 100% 0 0)` text reveal.
  3. `input`: Search/prompt bar with typewriter text reveal and pulse on submit circle.
  4. `chat`: Speech bubble pop-in with staggered typing placeholders and reply bar animation.
  5. `window`: macOS-styled window with traffic lights, sidebar items, content tiles, and SVG cursor sine glide.
  6. `phone`: Vertical phone frame with notch, camera island, and staggered app list items.
  7. `cards`: 2×3 grid of cards with staggered pop-in (`back.out(1.6)`).
  8. `list`: Animated checklist rows with bullet points transitioning from outline to solid accent.
  9. `chart`: Animated SVG line chart using `stroke-dashoffset` path-drawing with floating price callout pill.
  10. `notify`: iOS-style notification toast dropping with spring bounce (`back.out(1.3)`).
  11. `icons`: 3×5 grid of icons blooming outward from center (`stagger: { each: 0.04, from: 'center' }`).
  12. `hub`: Central glowing circular node with radiating satellite pills.
  13. `cloud`: Floating tag cloud with sine-wave vertical bobbing.
  14. `collage`: Multi-tilted photo card layout with rotation offsets.
  15. `logos`: Infinite dual-direction conveyor belt of company logo cards.
  16. `shape`: 3D perspective hero tile dropping with `rotationX: 50` and moving specular sheen highlight.
  17. `burst`: Star burst animation with horizontal expansion line.
  18. `grid`: 2×2 modular grid card layout with staggered scale entrance.
  19. `split`: Vertical split screen with sliding colored backdrop and staggered text bars.
  20. `face`: Minimalist animated character avatar with blinking eyes.

### B. Frame-Accurate WebCodecs + MP4-Muxer Export Pipeline (`public/demo.mjs`)
- **No Dropped Frames**: Eliminates `MediaRecorder` limitations (which drops frames when UI lags).
- **Backpressure Queue**:
  ```javascript
  const capture = (now, meta) => {
    if (meta.mediaTime > lastTime) {
      lastTime = meta.mediaTime;
      queue.push({ time: meta.mediaTime, frame: new VideoFrame(film, { timestamp: Math.round(meta.mediaTime * 1e6) }) });
    }
    if (queue.length >= 2) film.pause(); // Throttle decode if encoder is busy
    if (!ended) film.requestVideoFrameCallback(capture);
  };
  ```
- **SVG ForeignObject Rasterization**:
  ```javascript
  function rasterize(section) {
    const node = section.canvas.cloneNode(true);
    const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><foreignObject width="640" height="360">${new XMLSerializer().serializeToString(node)}</foreignObject></svg>`;
    const image = new Image();
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
    return image.decode().then(() => image, () => null);
  }
  ```

### C. Automated FFmpeg Scene Cut & Section Planner (`scripts/plan-sections.mjs`)
- Automatically detects scene transitions using FFmpeg's scene score metric:
  `scale=320:-2,select='gt(scene,0.18)',showinfo`
- Clusters cuts into 3–8 logical sections based on duration.
- Generates 2-column contact sheets sampling frames at 30% and 80% mark of each section.

### D. Zero-Latency Precomputed Waveform Envelopes (`scripts/build-waveforms.mjs`)
- Runs FFmpeg raw 16-bit PCM mono extraction at 4000Hz:
  `ffmpeg -i input.mp4 -vn -ac 1 -ar 4000 -f s16le pipe:1`
- Aggregates samples into 50Hz peak envelopes, saving a tiny JSON file (`{ rate: 50, peaks: [0..100] }`).
- Allows client-side scrubbers to render live waveform graphics without decoding hundreds of megabytes of video audio in the browser.

### E. Finite Authored Timelines Invariant (`public/19-phone-showcase/index.html`)
- **Crucial Rule**: Never use infinitely looping tweens (`repeat: -1`) inside child timelines:
  `// Keep the authored timeline finite. An infinitely repeating child tween makes deterministic frame seeking grow without bound in Chromium.`
- Looping must be managed at the parent runner level or via URL `#play` trigger.

---

## 3. The 27 Motion Design Templates Catalog

| ID | Name | Aspect | Duration | Core Visual Technique |
| :--- | :--- | :--- | :--- | :--- |
| `01-cta-pill` | Chrome CTA | 16:9 | 4s | Glossy obsidian pill, specular top highlight cap, 105° moving glint sweep |
| `02-three-step` | Triple Sequence | 16:9 | 7s | Sequential 3-step feature card progression with active pill indicators |
| `03-slide-showcase` | Slide-In Showcase | 16:9 | 5s | Staggered headline entrance with backdrop blur overlay |
| `04-morph-panel` | Morph Panel | 16:9 | 6s | Pill button (`220×84`) smoothly morphing to modal card (`1200×600`) via `power4.inOut` |
| `05-app-icons` | App Icon Float | 9:16 | 5s | 4 brand marks rising on shallow arcs with balanced optical weights |
| `06-notification` | Notification Stack | 16:9 | 5s | Staggered iOS toasts falling into view with `back.out(1.4)` damping |
| `07-chat-sim` | AI Chat Sim | 9:16 | 7s | Typing bubble conversation simulation with dynamic height adjustment |
| `08-prompt-bar` | Prompt Bar | 9:16 | 5s | Virtual numeric typewriter animation (`this.targets()[0].n`) + blinking cursor |
| `09-grid-network` | Grid Network | 16:9 | 5s | Floating node connections with procedural SVG line links |
| `10-candlestick` | Stock Candlesticks | 16:9 | 5s | Seeded deterministic OHLC generator, glowing wicks, SVG path trend curve |
| `12-blur-reveal` | Blur Reveal | 16:9 | 5s | Multi-stage Gaussian unblur (`filter: blur(24px) -> 0px`) for brand marks |
| `13-compare-bars` | Compare Bars | 16:9 | 5s | Before/after metric comparison with staggered bar scale growth |
| `14-leaderboard` | Model Leaderboard | 16:9 | 5s | Ranked tool rows with dynamic badge re-ordering and highlight sheen |
| `15-bar-3d` | 3D Bar Hero | 16:9 | 5s | CSS 2.5D extrusion using `::after { skewY(-34deg) }` without Three.js overhead |
| `16-line-growth` | Line Growth | 16:9 | 5s | Exponential trend line growth with area fill gradient and metric counter |
| `17-integrations-grid` | Integrations Grid | 16:9 | 5s | 3D perspective grid of partner integrations fanning into alignment |
| `18-cta-click` | Button Click | 16:9 | 4s | Focused button compression (`scale: 0.94 -> 1`), focus ring shockwave |
| `19-phone-showcase` | Phone Showcase | 16:9 | 5s | 3D tilted metallic phone bezel (`rotateY: -42deg`) with sweeping glint highlight |
| `20-search-typing` | Search Typing | 16:9 | 5s | Autocomplete search query with dropdown suggestions appearing in lockstep |
| `21-connector-list` | Connector List | 16:9 | 5s | Interactive API connector selection with active state toggle |
| `22-kinetic-headline` | Kinetic Headline | 16:9 | 4s | Squash-and-stretch pill text, spark trajectory sweep, procedural `--audio-energy` |
| `23-prompt-composer` | Prompt Composer | 16:9 | 5s | Multimodal attachment chips + prompt expansion + send pulse |
| `24-showreel-notify` | Showreel Notify | 9:16 | 5s | Hero text lockup transitioning to phone notification alert |
| `26-null-manifesto` | Null Manifesto | 16:9 | 5s | Minimalist typography hierarchy with deep contrast ratio |
| `27-hud-overlay` | Cinematic HUD | 9:16 | 5s | Cyberpunk telemetry overlay, SVG fractal noise mask, depth orbs |
| `27-icon-stack-rise` | Icon Stack Rise | 9:16 | 5s | 3D card deck fanning out with front-to-back flip and contact shadow |

---

## 4. Concrete Adoption Actions for `design-os-svg-animation`

1. **Adopt Waveform Generator**: Create `scripts/extract-audio-waveform.mjs` using FFmpeg raw PCM pipe.
2. **Adopt Scene Cut & Contact Sheet Tool**: Create `scripts/detect-scene-cuts.mjs` for automated reference video analysis.
3. **Adopt HyperFrames Beat Engine**: Add `src/engine/hyperframes-beats.mjs` containing the 20 declarative motion beats.
4. **Adopt CSS 2.5D & Obsidian Tokens**: Incorporate NullMotion's obsidian pill gradients, specular highlights, and 3D bar extrusion into `promo/promo.css` and `src/components/tokens.css`.
5. **Add Showcase Gallery**: Include interactive examples of the best NullMotion templates in `docs/` and `examples/`.
