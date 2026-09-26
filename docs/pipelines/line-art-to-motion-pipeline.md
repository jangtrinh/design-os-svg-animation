# Line art to motion: reference drawing → animated, interactive SVG

A repeatable pipeline for turning one reference drawing or vector render (line art, a logo, a sketch) into a faithful, animated, interactive SVG page with video exports. It was distilled from the single-line drone 404 case (`plans/cases/drone-404-svg-animation.md`, PR #6). Each stage below lists the artifact it produces and the gate it must pass before the next stage starts.

> Fidelity rule: the drawing's geometry comes from its pixels, never from hand-typed paths. Motion may deform a part only while that part is moving, so the resting pose always equals the reference.

## Start a new case (one command)

```bash
node scripts/new-line-art-case.mjs <case> --source raster     # a drawing to trace
node scripts/new-line-art-case.mjs <case> --source vector     # a filled vector illustration (§1c)
node scripts/new-line-art-case.mjs <case> --source flipbook   # experimental: a vector render with rotor poses (§1b)
```

This creates `research/<case>/case.json` (page, proofs, video, selectors, fidelity source, timing module, Pages modules), a part-map template for raster and vector sources, and `plans/<case>.md` with the intake table and acceptance list. It then prints the exact next commands. Every later script takes `--case <case>`:

| Step | Command |
|---|---|
| Python tools (once) | `python3 -m venv .cache/line-art-venv && .cache/line-art-venv/bin/pip install -r scripts/requirements-line-art.txt` |
| Proofs, MP4, GIF | `node scripts/render-drone-404-deliverable.mjs --case <case> [--skip-video]` (needs `npm run dev`) |
| Pages copy | `node scripts/sync-line-art-pages.mjs --case <case> --write`, then `--check` in CI |
| Stage bounds | extend `tests/line-art-pipeline.test.mjs` with `assertEnvelope(...)` for the case |

The renderer, motion module and page are the only hand-written parts. Copy `src/primitives/DroneSearch404.mjs` + `promo/drone-404/drone-404.html` (traced art), `src/primitives/startup-error-404-renderer.mjs` + `promo/startup-error-404/startup-error-404.html` (filled vector art), or the flipbook renderer pattern in §1b. Reuse the shared springs (`dampedStep`), the theme toggle and the hover-layer pattern.

## 0. Intake (owner decisions first)

| Decide | Record in | Drone example |
|---|---|---|
| Fidelity target and what may change | `plans/<case>.md` | "99% the reference"; black and white; minimal |
| Deliverables | same | live page, 1080p60 MP4, loop GIF, Pages copy |
| Motion *feel* | same, plus memory when it is a taste rule | "wobble slightly, then stable at once" |

Store the reference in `research/<case>/`. Pick the verb up front: this is new work built from an asset, not a video recreation. For videos, use `docs/pipelines/motion-video-recreation-pipeline.md` instead.

## 1. Trace to centerline strokes

```bash
python3 scripts/trace-line-art-centerline.py research/<case>/reference.png research/<case>/<case>-centerline-trace.json \
  --upscale 3 --threshold 110 --spur 12 --epsilon 0.5 [--ignore x0,y0,x1,y1]
```

- Run it in a throwaway venv (numpy, pillow, scikit-image, scipy, skan). These are not runtime dependencies.
- **Gate (on ink, not canvas):** at least 98% of the reference's ink lies within 2 px of the trace (recall), and at least 98% of the trace's ink lies within 2 px of the reference (precision). Zoomed crops must also show no fused parallel lines. The drone scored 99.70% / 99.95% at threshold 110. Never normalise by the canvas: ink is about 2% of it, so a blank render would score "98%".
- Use centerlines, not filled outlines: only strokes can draw on, split into parts and move.

## 1b. Vector source with a rotor flipbook (instead of tracing) — experimental

> **Status: experimental.** The only case built this way (a 3D-rendered quadcopter, 2026-09-25) was rejected by the owner and removed. The tooling below works and is tested, but it has not yet produced an accepted page. The traced path (§1) is the proven one. Before reusing this branch, record in the case plan what the owner expects to differ.


When the source is already vector, such as a Blender Freestyle render of the 3D model, skip tracing. If it ships N rendered rotor poses, **do not ship the poses**: each one repeats the whole airframe (the trial flipbook was 12 MB). Keep only what changes:

```bash
python3 scripts/build-flipbook-rotor-geometry.py <flipbook.svg> research/<case>/<case>-geometry.json --origin <body x,y> \
  [--static-svg static.svg]            # then silhouette, as in §3
  --silhouette <silhouette.json> --module src/primitives/<case>-geometry.mjs --export <NAME>
```

- **Presence split:** presence is the share of other poses that still draw a stroke. On the trial case it was sharply bimodal: blades 0–0.3, airframe 0.7–1.0, and the few in between are hub rims and struts that blades often hide. Blades are below 0.3, airframe is 0.3 and above. Airframe hidden by pose-0 blades is recovered from other poses (≥ 0.7 only).
- **Result:** 324 KB instead of 12 MB. Against the source flipbook at 6 poses: recall 98.2–100%, precision 95–98.5%. Against the blueprint (pose 0): recall 100%, precision 98.6%.
- **Renderer pattern:** draw-on the airframe chunks (`pathLength="1"` dashes, skipping untouched chunks); give each blade pose its own `<path>` and show only the current one plus 2 trailing poses (opacity 0.32 and 0.14 × spin) as motion blur; show blades only once the pen finishes. Pick the pose from the shared rotor angle, with a whole number of flipbook cycles per loop so the loop stays seamless. Scale the shared timeline's reference px by one unit factor (art width ÷ 1,865), and convert pointer coordinates back the same way for the hover layer.
- **What failed first:** (a) fitting an affine rotor plane from swept points; occluded body lines flicker too, and twisted blades are not planar. (b) "Gone at both quarter turns" tests, which aliased or symmetric flipbooks defeat. Measure the presence histogram before choosing thresholds.

## 1c. Filled vector illustration (instead of tracing)

When the source is a filled SVG (a stock or brand illustration: `<path fill>` and `<ellipse>`, no strokes), nothing is traced or redrawn. The geometry is copied and only split by part. Worked case: `research/startup-error-404/` (a man at a laptop with three error bubbles, 30 paths + 3 ellipses).

```bash
node scripts/build-vector-parts.mjs research/<case>/<case>-parts.json --preview part-check.svg   # render in Chrome, inspect
node scripts/build-vector-parts.mjs <parts.json> --mask <group> mask.svg                        # one per silhouette group
# rasterise mask.svg with headless Chrome (viewBox x silhouettePxPerUnit), then:
.cache/line-art-venv/bin/python scripts/extract-line-art-silhouette.py mask.png <group file> --close 4 --min-area 200
node scripts/build-vector-parts.mjs <parts.json>                                                # writes the module
```

- **Split rule:** every path is cut into subpaths at `M`; each subpath goes to the first `regions` polygon containing its bounding-box centre, else `defaultPart`. Consecutive subpaths of one element and part are re-joined, so holes (the dot in "?", rings) keep their winding. Paint order is kept as one element list tagged by part. List small parts (eyes) before the region that surrounds them (head). A glyph that shares its frame's centre (the X inside its bubble) needs `maxSize: [w, h]` on its region. A part no polygon can isolate is pinned by index: `pins: { "<element>.<subpath>": part }`, indices as listed in document order (the forearm outlines of the worked case).
- **Silhouettes per moving group** (`silhouettes: { group: { parts, file } }`), not one static outline: each moving part carries its own paper fill. A group whose outline is open because another part covers it in the source (the "!" ring behind the X bubble) needs a `patch` polygon painted into its mask, or the flood fill leaks inside and returns only the ring. Check the polygon count: 1 per closed shape.
- **Hidden geometry:** where one moving part covers another in the source, the covered part was never drawn. Complete it in `extras.hiddenStrokes` (fit a circle to the visible arc and draw the missing arc) and paint the covering unit last, so the rest pose is unchanged and the gap never shows while the cover moves.
- **A limb drawn as one continuous outline** (shoulder to fingertip, with the shirt cut out around it) cannot move at the hand alone. Rotate the whole outline about a pivot midway between its two joins with static lines, so both joins move the same small amount (worked case: ±2.7° moves each join ~7 units, under half the stroke, while the fingertip travels ~37).
- **Synthetic fills** (`fills`: `{ part, fill: "paper" | colour, silhouette, before | after: <element>, inset, clip }`): a part left transparent in the source (the forearm, the laptop) gets an opaque paper fill that moves with it, and the surface hidden under it gets completed (the shirt under the forearm, clipped by a convex polygon to where the shirt really is). Inset fills ~5 units so a traced silhouette never peeks outside an outline, and place a paper fill *before* the static lines that border the part so they stay on top. Fills are tagged `synthetic`: the module check skips them, the page check below covers them.
- **Rigid props on a support tip about the contact** (the laptop on the knee), rather than dropping: the edge where hidden lines end behind the prop barely moves, so those ends never show.
- **Gate (colour, not ink):** `fidelity.mode: "color"` with `elements: "elements"`. Render the module and the source at the same frame, count pixels whose colour differs by more than 12% **on any channel** over the union of both painted areas, eroding 1 px first (anti-aliased edges). A luminance difference is not enough: a peach layer on white is 17% on blue but 9% in luminance. Exact copy: 100.00%. Head removed: 88.3%. Whole art shifted 30 units: 64.7%. Blank: throws.
- **Page rest-pose gate** (`fidelity.page: { selector, hide }`): the exporter loads the live page with reduced motion, reframes the SVG to the source viewBox, hides page-only layers (the 404) and runs the same colour match. It caught what the module check cannot: a sticker edge cutting a neighbour's outline, a hidden stroke's round cap, a paper fill covering a crease. Prove it red once (show the hidden layer: 75%).

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

`node scripts/render-drone-404-deliverable.mjs --case <name>` runs every case from `research/<case>/case.json`: page, proof dir, selectors, fidelity source, `timing` (module + export with `seamlessFrom` and `loopPeriod`: MP4 = 0 → seamlessFrom + loopPeriod, GIF = one loop) and optional `render` overrides (`frames`, `pageTime`, `videoFrames`, `videoCrop`, `flightProfile`, `themeKey`, `interaction.hold`, `interaction.shots` placed as `centre + at × box + px`). It:

1. clears stale proofs, so evidence never mixes revisions (manual captures live in `plans/reports/`, never in the proofs dir);
2. runs the fidelity overlay and the ink recall/precision gate (it throws below 98%), timeline keyframes and a contact sheet;
3. takes page shots at 375/768/1440, dark mode, reduced motion, and the theme switch mid-flight and done;
4. captures hover interactions on a held timeline (`?hold=<s>`), logging measured transforms as numbers;
5. plots the flight profile (`render.flightProfile`, drone only);
6. encodes the MP4 (CRF 22, slow) and the loop GIF, then builds a contact sheet **decoded from the encoded MP4**.

## 7. Publish

```bash
node scripts/sync-line-art-pages.mjs --case <case> --write && node scripts/sync-line-art-pages.mjs --case <case> --check   # docs/promo copy, imports verified self-contained
```

Add a README section and a marketing showcase card with a 640 px, 15 fps GIF. Branch, stage an **explicit file list** (the worktree may hold other sessions' changes), open a PR, merge, and confirm the Pages build.

## Pitfalls already paid for

| Incident (2026-09-25) | Rule | Enforced by |
|---|---|---|
| A pixel-walking skeleton gave 1,129 micro-strokes | Use the skan graph plus crossing re-chaining | `trace-line-art-centerline.py` |
| ImageMagick's SVG renderer produced a blank PNG | Rasterise SVG with headless Chrome | exporter / pipeline commands |
| Ghost blades read as scribbles | Use a blur disc plus faded, squashed blades | `DroneSearch404.mjs` |
| The drone clipped at 375 px during flight; the tip later still crossed the top by 2 units | Assert that every outline point, flown through the whole timeline, stays inside the viewBox | `tests/line-art-pipeline.test.mjs` + `tests/helpers/flight-envelope.mjs` |
| Stale frames reached a contact sheet and a commit | Clear generated proofs on every run | `drone-404-proof-checks.mjs` |
| Theme choice leaked between Puppeteer pages | Clear storage per evidence page | exporter |
| A hover proof pointer landed outside the stage | Place pointers from measured element boxes | exporter |
| Keyframes felt rigid, then the first physics pass shook too much | Use a controller with ζ 0.65–0.8 and tune from the plot | memory + §4 |
| The live clock was quantised to 1/60 s (judder at 120 Hz) | Live playback uses continuous time | `drone-404/drone-404.html` |
| Another session's edits sat in the same worktree | Stage an explicit file list and say what was left out | MANUAL |
| Tests passed for the wrong reason: a loop test compared a table with itself; a wobble test passed with turbulence off; an overshoot test was met by the command | Assert the intent with a counterfactual (turn the cause off and require the effect to vanish); cross real boundaries | council review, `tests/drone-404.test.mjs` |
| A fidelity metric normalised by the canvas would pass a blank render | Measure on ink with a tolerance, and throw on missing ink or a missing metric | `drone-404-proof-checks.mjs` |
| (2026-09-26) An occluded bubble's ring was an open arc: its silhouette came back as the ring outline only | Paint a `patch` into the group mask; one polygon per closed shape | `build-vector-parts.mjs --mask`, §1c |
| (2026-09-26) Colour fidelity of an exact copy scored 98.65%: only anti-aliased edges differed between two Chrome render paths | Erode mismatches by 1 px before counting; prove the gate with mutations (drop a part, shift, blank) | `drone-404-proof-checks.mjs` colour mode |
| (2026-09-26) A bubble's sticker edge cut 18 units off the neighbouring bubble's ring, unseen for two rounds: the fidelity gate rendered the module, not the page | Check the live page's rest pose too; draw all sticker edges below all bubble art | `pageRestFidelity`, renderer |
| (2026-09-26) The colour gate passed a visible peach 404 over the art (luminance difference 9% < 12%) | Compare the max channel difference, and prove each gate red with a real counterfactual | `drone-404-proof-checks.mjs` |
| (2026-09-26) The owner found the typing too timid: the arm was held to 1° by a shirt cut-out | Complete the hidden surface and give the moving part an opaque fill instead of shrinking the motion | `fills`, §1c |
| (2026-09-26) The MP4 contact sheet cut off a new case's figure: the crop was tuned to the drone's framing | Per-case `render` settings with neutral defaults; the drone keeps its values in its case.json | exporter + `research/drone-404/case.json` |
