mode=review model=grok-4.7 stop=end_turn turns=20 secs=799
tokens in=141442 cached=2070784 out=52788 session=01a13e02-8f6b-79c1-9f4f-62c0f45a40ce full=/Users/jang/.grok/runs/grok-review-2026-10-15T05-35-14-200Z.json
---
The inlined diff leaves one geometry question open: the relay center dash stays at x=±44 while the lane lines move. I'll read the figure sources and the line-end gate to see whether that end still floats.**SHIP.** No blocking findings.

The four source edits land on real strokes or on allowed terminal dots. Nothing in the diff hides a line, adds a per-frame node, or changes springs, pointers, or physics.

### What I checked

**Gate gaming.** The hoop dots are the allowed terminal close, not decoys. In `playground/pe-figures/pe-basketball-hoop.js` the baseline still runs `(-26,-12)` to `(22,-12)`, and the key arc now starts at `asin(-12/15)`, which is exactly `(9,-12)` on that segment. `HL.open` starts a second subpath; the line-end checker counts other subpaths of the same path, so that end meets a stroke with gap 0. The other three ends sit in open floor (about 6 world units, well over 5px, from the stand). The circles are centered on those ends, `r=1.1`, class `dot m`. A filled dot at the endpoint is a real cap (`vendor/anatomy/scripts/line-ends.mjs` treats a filled circle the point is inside as distance 0).

Baton `±44.5` and barbell `±47.8` are projection fits onto real edges, not a tolerance hack. With `Cam(45°, k=0.5)`:

- Baton left end `x=-44.5`, `z=2.6` is about **0.80px** from the outer rim at `x=-45`, `z=2.5` (`S=3.35`). The old `x=-44` was about **1.86px**, which matches the reported 1.9px and the two floating ends (the right ends already met the front crease).
- Barbell `x=±47.8`, `y=±12`, `z=2.6` is about **0.15px** (left) and **0.62px** (right) from the outer rim at `x=±48`. `y=±12` is still on the straight side (`|y| < 13.5` with corner radius 2.5).

The relay center dash stays at `x=±44` with class `nf dash`. The gate only tags `.lo` / `.hi` (`scripts/check-hairline-line-ends.mjs`), and that dash was not one of the two floating ends. It is unchanged.

**Motion.** No spring, pointer, or `draw()` control path changed. The stopwatch edit only does `arcPts.unshift(...)` and `setAttribute` on the existing sector path. The root stays at `baseDialAngle`; the sweep end still follows `secNorm`.

**Accent.** New geometry is `nf lo` or `dot m`. Kernel CSS sets `.dot` fill to `--hl-hi` and `.dot.m` fill to `--hl-edge`. No new `dot` (the black accent). The hoop rim’s existing `hi` strokes are untouched.

**Correctness.** Dots and lane paths are created once in `mount`. No new listeners. `destroy` still does `svg.replaceChildren()`. The stopwatch root is `r=21`, `z=11.3`, the same plane as the inner 36-gon. At 225° the point sits about **0.16px** outside the chord (sagitta of a 10° step), inside the 1px tolerance. The old 1.57px gap matches `r=21.6` at `z=11.35` against that ring.

**Report vs diff.** The same four hunks are in `pe-stopwatch.js`, `pe-barbell.js`, `pe-relay-baton.js`, `pe-basketball-hoop.js`, and the regenerated `playground/pe-app.js`, `playground/pe.html`, and `docs/playground/pe.html`. Figure files stay under 200 lines. The sentence “44.8 overshot 1.0px” does not match this projection: `|x|=44.8` on the left is about 0.16px from the rim, closer than 44.5. The value that shipped still passes, so that is a report slip, not a broken end.
