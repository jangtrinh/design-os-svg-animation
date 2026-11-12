# line-ends chemistry report

NOT verified: motion/physics beyond static + default-state screenshots (only default state of each figure captured). Kernel has no `free` support, so none used.

| Figure | Floating before -> after | Change | Free-marked |
|---|---|---|---|
| #1 titration | 1 -> 0 | stopcock handle: terminal dot at each tip, placed in draw() with HL.place so dots follow the rotation | none |
| #4 distillation | 4 -> 0 | thermometer stem top: cap dot; coolant nozzle outer tips: barb dots; falling drips: drop-head dot at lower tip (2 dots, hidden via `display` attr when no drip drawn) | none |
| #5 ph-scale | 4 -> 0 | graduation ticks hang from the track rule (start on rule, length unchanged) instead of crossing it | none |

Acceptance (after last edit):
- `chemistry #1..#5 line ends: 0 ...` / `line-end gate passed`
- tsc exit 0; npm test exit 0 (first run failed audit `paint` rule on `.style`; switched to setAttribute("display")); anti-flop exit 0
- Files: playground/chemistry-figures/chemistry-{titration,distillation,ph-scale}.js (178/196/173 lines) + regenerated chemistry-app.js, chemistry.html, docs/playground/chemistry.html
- Screenshots: plans/reports/assets/line-ends-chemistry-{before,after}/ (fig-1/4/5.png in after); visually same figures, only dots/hanging ticks added.

Follow-ups: pH ticks at 1/7/14 now one-sided (hang toward front); dots on distillation drips add small beads (design choice).

Status: DONE
Summary: 9 floating ends across 3 chemistry figures closed with terminal dots or hung ticks; all gates pass.

## Fix round 1
1. Cold drip (reproduced at 50C, plans/reports/assets/line-ends-chemistry-round1/before-cold-4.png): stub drawn, no head. Gate still printed 0 (stub has one rooted end), but the lower end was visibly open. Fix: cold branch now pushes headAt for the stub end (z-0.5); second head hidden.
2. All new caps now `dot m` (stem cap, nozzle barbs, drip heads, titration handle tips); pre-existing neck dot stays the lit accent.

Poses (drive.mjs, slider #intensity + oninput, then lines gate; images in assets/line-ends-chemistry-round1/):
- fig4 50C: 0 of 10 float; default 78.3C: 0 of 12; 95C: 0 of 12
- fig1 V=0: 0 of 34; default 8.0: 0 of 34; V=25: 0 of 34; mid-motion (100 ms after set, V=15.5 / 6.3): 0 of 34
- Full suite: `chemistry #1..#5 line ends: 0`, `line-end gate passed`; tsc 0, npm test 0, anti-flop 0. After shots fig-1/fig-4 retaken and read.
- Note: titration stopcock angle only reaches ~vertical mid-motion; upper tip dot sits on the meniscus ellipse and blends visually (DOM confirms both dots placed at tips).
Status: DONE
