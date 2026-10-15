# Line ends, suite pe: report

NOT verified: no responsive captures (owner default skip). Dot style `dot m` on hoop floor lines judged by eye only.

| Fig | Floating before -> after | Change per end | Free-marked |
|---|---|---|---|
| #1 stopwatch | 1 -> 0 | split-sector arc start (r 21.6) 1.57 px off the inner dial ring: prepended a point on the ring (r 21.0, z 11.3) so it lands on it | none |
| #2 barbell | 3 -> 0 | platform rim lines (y=±12) ran x ±36, 6-7 px short of the plate edge: now x ±47.8, landing on the platform rim | none |
| #3 baton | 2 -> 0 | lane lines x ±44 sat 1.9 px off platform rim: now ±44.5 (44.2 left 1.4 px, 44.8 overshot 1.0 px; 44.5 passes) | none |
| #5 hoop | 4 -> 0 | key arc start now at the exact baseline crossing (asin(-12/15)), 12 even steps to 115 deg; the 3 open floor ends (baseline -26 and 22, arc end at 115 deg) end on 1.1 px terminal dots (`dot m`); none had an edge within reach | none (no line marked free) |

Gate after: `pe #1..#5 line ends: 0`, `line-end gate passed`.
tsc --noEmit exit 0; npm test exit 0 (fail 0); anti-flop-gate exit 0 (100% passed).
Files: playground/pe-figures/pe-{stopwatch,barbell,relay-baton,basketball-hoop}.js; regenerated playground/pe-app.js, playground/pe.html, docs/playground/pe.html.
Evidence: plans/reports/assets/line-ends-pe-before/pe-{1,2,3,5}-line-ends.png (ringed), plans/reports/assets/line-ends-pe-after/fig-{1,2,3,5}.png. Viewed each: same figure, nothing missing; stopwatch shows a tiny 0.6-unit radial jog at the arc start; hoop floor now shows three small dots.

Weakest link: hoop dots are a design choice (fallback rule); owner may prefer court boundary lines.
Unresolved: none.

## Fix round 1: slider extremes
Method: drive.mjs per figure: click tab, set #intensity 0 then 1 (input event), wait 3.5 s, tag texture lines (same rule as the gate), `lines` on #stage tolerance 1. Extremes confirmed live (stopwatch t=60.00s, hoop Shot 100%). Shots: plans/reports/assets/line-ends-pe-extremes/t{1,2,3,5}-v{0,1}.png.

| Fig | intensity 0 | intensity 1 |
|---|---|---|
| #1 | line ends: 0 of 2 | line ends: 0 of 2 |
| #2 | line ends: 0 of 4 | line ends: 0 of 4 |
| #3 | line ends: 0 of 6 | line ends: 0 of 6 |
| #5 | line ends: 0 of 148 | line ends: 0 of 148 |

All console: clean. No code change this round, so no rebuild/retake needed. Caveat: only the two extremes sampled, not intermediate poses (hoop swish window ~72-84% deflects the rim, which has no texture lines of mine).
