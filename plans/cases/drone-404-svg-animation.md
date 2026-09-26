# Plan: Single-Line Drone 404 — SVG Animation

Status: delivered 2026-09-25 (awaiting owner visual acceptance)

## Outcome
Black & white, minimal 404 page whose hero is the owner's reference drawing (a continuous
single-line drone, front view) reproduced faithfully and animated.

## Constraints
- Drone geometry must match the reference (~99%); no hand-drawn approximations.
- Monochrome ink on paper; ink is `currentColor` so dark scheme inverts cleanly.
- Deterministic virtual clock (`window.__seekToTime`), reduced-motion static pose, Phosphor icons only.
- Non-goals: color accents, HUD/telemetry chrome, extra copy.

## Pipeline (all geometry from pixels)
1. `research/drone-404/reference-single-line-drone.png` — owner reference (2000x1120).
2. `scripts/trace-line-art-centerline.py` — 3x bicubic upscale, threshold, skeletonize (skan),
   prune crossing spurs, re-chain strokes through crossings, smooth + RDP
   -> `research/drone-404/drone-centerline-trace.json`. Needs a throwaway venv with numpy, pillow, scikit-image, skan.
3. `scripts/build-line-art-geometry.mjs` — assigns traced points to parts (4 blade sets, lens),
   Catmull-Rom -> cubic Beziers, pen order -> `src/primitives/drone-404-line-art-geometry.mjs` (generated).
4. `src/primitives/drone-404-motion.mjs` — pure timeline `sampleDroneState(t)` (HyperFrames easing).
5. `src/primitives/DroneSearch404.mjs` — `renderDroneSVG()` + `applyDroneState()`.
6. `scripts/build-drone-404-motion-ir.mjs` -> `fixtures/drone-search-404.motion.json` (Motion IR 0.2.0, sampled from step 4).
7. `promo/drone-404/drone-404.html` — the page. `scripts/render-drone-404-deliverable.mjs` — proofs, MP4, GIF.

## Timeline (rev 2, owner feedback 2026-09-25)
- 0.15–2.9 s pen draws the drone; 2.2–3.4 s bold 404 settles in *behind* it (drone occludes it
  via a paper-filled silhouette from `scripts/extract-line-art-silhouette.py`).
- 2.6–3.6 s rotors spin up: blades squash (cos θ span, 0.42 height) and swing ±5° as the tip rides
  the rotor ellipse, inside a hairline blur disc. Parked blades stay exactly the reference.
- 3.1 s lift-off = damped step (rises past hover height, settles). 4.0 s -> mission, period 10 s:
  hover, fly left + away, scan, swoop right + closer, scan, gust knock, return. Big beam lands on floor.

## Motion model (rev 3, owner: "too rigid" -> "wobble slightly, then stable at once")
- Diagnosis: not frame rate (60 Hz, 0.07 ms/frame) and not a tween-engine gap, so GSAP (3.15,
  already installed) was not adopted. Causes: channels moved in lockstep, dead-still holds, bank in
  phase with acceleration, rigid gimbal, live clock quantised to 1/60 s (judder on 120 Hz screens).
- `src/primitives/drone-404-flight-controller.mjs`: simulated PD flight controller at 240 Hz.
  Minimum-jerk path is the command; tilt leads motion; x'' = g tan(tilt) + gust + turbulence;
  height/depth/gimbal/look are damped springs. Transient + steady cycle cached, lookup per frame.
- Tuning: attitude zeta 0.68, position 0.78, gimbal 0.7 -> one counter-swing (measured 1.9–4.0 deg; asserted 1.5–5) then |bank| < 1.5 deg within 0.35 s (asserted);
  hover wobble spread 0.76 deg, 0.19 without turbulence (asserted); max bank 12.1 deg (asserted 10–14); gust peak 7 deg. Evidence: `flight-bank-profile.png`.
- Live playback uses continuous time; export seeks exact frames. Seamless from 14 s (loopStart + 1 period).

## Theme toggle (rev 4)
- Top-right icon button (Phosphor moon/sun, 44px, aria-label names the target theme).
- `data-theme` on <html> overrides the system scheme; choice saved in localStorage and applied
  before first paint. Switch = View Transitions circular reveal from the button (620 ms, ease-out
  token); fallback colour cross-fade; reduced motion switches instantly.
- Evidence: `theme-switch-mid.png`, `theme-switch-done.png` (toggle measured 44x44 at 375/768/1440).

## Hover interaction (rev 5) — `src/primitives/drone-404-interaction.mjs`
- Live layer on top of the timeline pose (never in export / virtual clock / reduced motion).
- Spotted: pointer over the stage -> camera turns (gimbal-limited), beam lands on the pointer;
  first sighting = small hop. Personal space: pointer within 520 px pushes the drone away as a
  force (tilts, then levels; same damping taste). CTA hover/focus: beam lights the button.
- `?start=<s>` skips the intro, `?hold=<s>` freezes the timeline while hover stays live (review).
- Evidence: `interaction-contact-sheet.png` + `interaction-measurements.txt` (rest 1.6 px -> pushed 48.7 px, level).

## Acceptance (evidence in `promo/drone-404/proofs/`)
- [x] Trace vs reference, on ink within 2 px: recall 99.70%, precision 99.95% (exporter throws below 98%) — `fidelity-overlay.png`, `fidelity-metric.txt`
- [x] `npm test` 62/62 (intent-level motion tests after the council review), `npx tsc --noEmit`, `python3 scripts/anti-flop-gate.py` exit 0
- [x] Motion IR valid (`node scripts/validate-ir.mjs fixtures/drone-search-404.motion.json`)
- [x] `ui gate` PASS, axe 0 violations x3, render probe clean at 375/768/1440 (manual runs; results in `plans/reports/retro-260925-2208-drone-404-line-art-pipeline.md`)
- [x] Screens: 375/768/1440 light, 1440 dark, reduced motion; MP4 1920x1080@60 (24 s), GIF 10 s loop
- [ ] Owner visual acceptance of motion
