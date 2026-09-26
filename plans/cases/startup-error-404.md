# Case: startup-error-404

Status: delivered 2026-09-26. Pipeline: docs/pipelines/line-art-to-motion-pipeline.md §1c (filled vector illustration). First case of the `--source vector` branch.

## 0. Intake (owner decisions)

| Decide | Owner answer |
|---|---|
| Source | Filled SVG "man-turned-on-his-laptop-and-startup-errors-appeared" (3000 x 3000, 30 paths + 3 ellipses), `research/startup-error-404/reference.svg` |
| Fidelity target and what may change | Geometry copied verbatim; the rest pose equals the source |
| Deliverables | Live page, 12 s 1080p60 MP4, 8 s loop GIF, Pages copy, README showcase; owner asked to commit and merge (2026-09-26) |
| Motion feel | Round 2: "when he hits the 404 his hand keeps trying to type; more subtle animation". Round 3: "the laptop bounces with each key, and the whole arm moves, not only the finger" |
| Theme / palette | Keep the illustration's palette (#882119, #FF8147, white); dark mode shows the art as a die-cut sticker |

## Story (8 s loop after a 2.4 s intro)

Calm typing, the X bubble buzzes and its X punches, he flinches, lifts his hand, glances up and blushes, the "!" hops, then frantic typing leaning in (forearm dips up to 2.7 deg, laptop tips on the knee up to 12.5 units at the keyboard end), a blank double blink, calm typing, a second shorter round. Hover: he looks at the pointer, bubbles dodge it, a clicked bubble closes and pops back 1.6 s later, hovering a button calms the errors.

## What the pipeline gained

- `scripts/build-vector-parts.mjs`: subpath split by region, `maxSize` for glyphs inside frames, `pins` by index, per-group silhouettes with `--mask` + `patch`, synthetic `fills` (inset, convex clip), `--list`.
- Exporter settings per case (`timing`, `render`), colour fidelity (per-channel max, 1 px edge tolerance), and the page rest-pose gate (`fidelity.page`), which found a sticker edge cutting the "!" ring that the module gate could not see.

## Acceptance (evidence in `promo/startup-error-404/proofs/`)
- [x] Colour fidelity of the part module: 100.00%; of the live page at rest: 100.00% (gate proven red at 75.00% with the 404 visible)
- [x] `npm test` (76/76), `npx tsc --noEmit`, `python3 scripts/anti-flop-gate.py` exit 0
- [x] Bubbles inside the stage for the whole timeline; arm and laptop limits asserted
- [x] `ui gate` exit 0, axe x3 zero violations, render probe 375/768/1440 clean, emoji probe clean
- [x] MP4 contact sheet decoded from the encoded file reviewed
- [ ] Owner visual acceptance of the round 3 motion
