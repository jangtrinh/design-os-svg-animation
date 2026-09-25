# Line art to motion: reference drawing → animated, interactive SVG

A repeatable pipeline for turning one reference drawing (line art, a logo, a sketch) into a faithful, animated, interactive SVG page with video exports. It was distilled from the single-line drone 404 case (`plans/drone-404-svg-animation.md`, PR #6). Each stage below lists the artifact it produces and the gate it must pass before the next stage starts.

> Fidelity rule: the drawing's geometry comes from its pixels, never from hand-typed paths. Motion may deform a part only while that part is moving, so the resting pose always equals the reference.

## 0. Intake (owner decisions first)

| Decide | Record in | Drone example |
|---|---|---|
| Fidelity target and what may change | `plans/<case>.md` | "99% the reference"; black and white; minimal |
| Deliverables | same | live page, 1080p60 MP4, loop GIF, Pages copy |
| Motion *feel* | same, plus memory when it is a taste rule | "wobble slightly, then stable at once" |

Store the reference in `research/<case>/`. Pick the verb up front: this is new work built from an asset, not a video recreation. For videos, use `docs/motion-video-recreation-pipeline.md` instead.

## 1. Trace to centerline strokes

```bash
python3 scripts/trace-line-art-centerline.py research/<case>/reference.png research/<case>/<case>-centerline-trace.json \
  --upscale 3 --threshold 110 --spur 12 --epsilon 0.5 [--ignore x0,y0,x1,y1]
```

- Run it in a throwaway venv (numpy, pillow, scikit-image, scipy, skan). These are not runtime dependencies.
- **Gate (on ink, not canvas):** at least 98% of the reference's ink lies within 2 px of the trace (recall), and at least 98% of the trace's ink lies within 2 px of the reference (precision). Zoomed crops must also show no fused parallel lines. The drone scored 99.70% / 99.95% at threshold 110. Never normalise by the canvas: ink is about 2% of it, so a blank render would score "98%".
- Use centerlines, not filled outlines: only strokes can draw on, split into parts and move.

## 2. Part map (what moves)

Write `research/<case>/<case>-parts.json`, using `research/drone-404/drone-parts.json` as the template:

- `strokeParts`: whole strokes pinned to a part, by trace index. Use this for straight lines that cross a moving region, such as arms through a blade.
- `regions`: polygons whose points belong to a moving part. Split a stroke at region edges.
- `penOrigin`: where the draw-on starts. `extras`: case data such as pivots, which is copied into the module.

```bash
node scripts/build-line-art-geometry.mjs research/<case>/<case>-parts.json --preview part-check.svg   # render in Chrome, inspect
```

**Gate:** in the part-coloured preview, every moving part is fully coloured and nothing static is. To find which strokes a polygon catches, list the trace indices inside it. Fix by index, never by eye.

## 3. Occlusion silhouette (only if something sits behind the art)

```bash
node scripts/build-line-art-geometry.mjs <parts.json> --airframe-svg static.svg   # static parts only
# rasterise static.svg with headless Chrome at the reference size, then:
python3 scripts/extract-line-art-silhouette.py static.png research/<case>/<case>-silhouette.json
node scripts/build-line-art-geometry.mjs <parts.json>                            # writes the geometry module
```

**Gate:** the art hides a test block behind it, and moving parts (spinning props) stay see-through.

## 4. Motion model

| Kind of motion | Technique | Why |
|---|---|---|
| Intro reveals (draw-on, fade-in, spin-up) | closed-form, HyperFrames easing (`sampleHyperFrameProgress`) | exact and cheap |
| Travel with weight (flight, drift, arrival) | simulated controller: a minimum-jerk path as the command, PD position loop, tilt = atan(a/g), springs for secondary parts | tilt leads motion; braking gives one counter-swing, then level |
| Continuous life (hover, turbulence) | forces made of whole harmonics of the loop period | keeps the loop exactly periodic |

- **Determinism:** simulate on a fixed 240 Hz grid, cache the transient period and the steady period, and look up and interpolate per frame. Time comes only from `sampleXState(t)`. The live page passes continuous time; exporters call `window.__seekToTime(t)`.
- **Seamless loop:** start the steady table from the state after one full period. Every whole-harmonic term then repeats exactly.
- **Tuning feel:** plot angle against time (`flight-bank-profile.png`) and tune from the curve, not by eye. The owner-accepted band is damping ζ 0.65–0.8, one counter-swing of 1.5–5° after each leg, under 1.5° within 0.35 s, a hover wobble spread under 2° that collapses without turbulence, and a max bank of 10–14°. Every number here is asserted in `tests/drone-404.test.mjs`, so test the intent, not the current output.
- **Rest-pose invariant:** multiply every deformation (squash, tilt, blur) by the part's activity (`spin`). The parked pose then equals the reference.
- A tween engine (GSAP) does not fix "rigid" motion; dynamics do. Measure frame pacing first: if it is fine, the problem is the choreography.

## 5. Page and interaction

- The renderer emits markup once, and `apply(state)` writes each frame. Ink is `currentColor`; paper and fill colours come in as CSS variables.
- The live interaction layer sits *on top of* the timeline state and is never exported. It needs a pointer-to-stage transform (`getScreenCTM().inverse()`), springs with a clamped `dt` so a hidden tab cannot break them, and reduced motion turned off.
- Theme toggle: `data-theme` overrides the system setting and is saved before first paint; use View Transitions for the reveal, with a fallback and a reduced-motion path.
- Run the es-designer gates before calling it done: `ui gate`, `a11y-audit` 3×, `probe-render` at 375/768/1440, the emoji probe.

## 6. Proofs and export (one command, after the last edit)

`node scripts/render-drone-404-deliverable.mjs` is the template. Copy it per case. It:

1. clears stale proofs, so evidence never mixes revisions (manual captures live in `plans/reports/`, never in the proofs dir);
2. runs the fidelity overlay and the ink recall/precision gate (it throws below 98%), timeline keyframes and a contact sheet;
3. takes page shots at 375/768/1440, dark mode, reduced motion, and the theme switch mid-flight and done;
4. captures hover interactions on a held timeline (`?hold=<s>`), logging measured transforms as numbers;
5. plots the flight profile;
6. encodes the MP4 (CRF 22, slow) and the loop GIF, then builds a contact sheet **decoded from the encoded MP4**.

## 7. Publish

```bash
node scripts/sync-drone-404-pages.mjs --write && node scripts/sync-drone-404-pages.mjs --check   # docs/promo copy
```

Add a README section and a marketing showcase card with a 640 px, 15 fps GIF. Branch, stage an **explicit file list** (the worktree may hold other sessions' changes), open a PR, merge, and confirm the Pages build.

## Pitfalls already paid for

| Incident (2026-09-25) | Rule | Enforced by |
|---|---|---|
| A pixel-walking skeleton gave 1,129 micro-strokes | Use the skan graph plus crossing re-chaining | `trace-line-art-centerline.py` |
| ImageMagick's SVG renderer produced a blank PNG | Rasterise SVG with headless Chrome | exporter / pipeline commands |
| Ghost blades read as scribbles | Use a blur disc plus faded, squashed blades | `DroneSearch404.mjs` |
| The drone clipped at 375 px during flight | Measure the flight envelope numerically before fixing the viewBox | MANUAL → add a test |
| Stale frames reached a contact sheet and a commit | Clear generated proofs on every run | `drone-404-proof-checks.mjs` |
| Theme choice leaked between Puppeteer pages | Clear storage per evidence page | exporter |
| A hover proof pointer landed outside the stage | Place pointers from measured element boxes | exporter |
| Keyframes felt rigid, then the first physics pass shook too much | Use a controller with ζ 0.65–0.8 and tune from the plot | memory + §4 |
| The live clock was quantised to 1/60 s (judder at 120 Hz) | Live playback uses continuous time | `drone-404.html` |
| Another session's edits sat in the same worktree | Stage an explicit file list and say what was left out | MANUAL |
| Tests passed for the wrong reason: a loop test compared a table with itself; a wobble test passed with turbulence off; an overshoot test was met by the command | Assert the intent with a counterfactual (turn the cause off and require the effect to vanish); cross real boundaries | council review, `tests/drone-404.test.mjs` |
| A fidelity metric normalised by the canvas would pass a blank render | Measure on ink with a tolerance, and throw on missing ink or a missing metric | `drone-404-proof-checks.mjs` |
