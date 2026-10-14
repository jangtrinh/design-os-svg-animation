# Fix round 2: physics-lever pilot (Sonnet implementer)

Work context: /Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot (uncommitted state intentional — no reset/stash/commit/push).
Report: plans/reports/sonnet-261014-physics-lever-fix-round-2-report.md
Binding constraints: plans/reports/brief-261014-sonnet-physics-lever-fix.md (same files you may modify, same acceptance commands, same Fable Loop rules, HAIRLINE_KERNEL env for builds).
Review to address: plans/reports/argon-261014-physics-lever-review.md (independent reviewer, verdict DO_NOT_SHIP). Read it fully.

## Rule: reproduce before you fix
For EACH finding below, first reproduce it with evidence (DOM paint order via `node vendor/anatomy/scripts/drive.mjs playground/physics.html '[["wait",1200],["eval","..."]]'`, a node one-liner on the geometry module, or a 3x close-up shot). Record REPRODUCED / NOT REPRODUCED with the evidence in the report. Fix only what reproduces; for NOT REPRODUCED explain why the reviewer was wrong.

## Accepted findings (controller ruling)
1. Painter's order (Argon #1): plate vs far-side parts on top of it, feet vs plate, lever.bush.2 vs lever.deck, beam vs wedge front cheek while tilted. Fix with correct ordering (finer layers or the kit's settled keys from `A.settle`, applied at runtime) and make `scripts/audit-physics-lever.mjs` audit the SAME order `markup()` uses, at xf ∈ {-20, -8, 15} (tilted poses included). The audit must not be able to pass while the page draws a different order.
2. Load honesty (Argon #2): equal-radius discs, count ratio exactly 2:1 matching F1:F2 (e.g. 4 vs 2 or 2 vs 1), radius ≤ beam half-depth; discs seat on the tilted beam (rotate with the beam about the pivot, or sit on a spindle normal to the beam) — no sinking or floating edge.
3. Pointer mapping (Argon #3): pointer must use the same projection as rendering and map to the 1-D rail (y = 0, z = deck), so vertical pointer motion does not move the fulcrum and horizontal motion tracks the carriage under the cursor.
4. Balance logic (Argon #4): one balance threshold shared by readout, accent and set(); no sticky `hold` making balanced readout show with the wrong accent; tilt varies smoothly over the full slider range [-20, 15] (no hard saturation at xf = -2, no step at the threshold). Keep one spring per independent DOF.
5. `means` text (Argon #6, part): it promises a center pointer that does not exist. Either add a real, small center index mark that lights at balance, or rewrite `means` to describe the actual cue. Keep Vietnamese.
6. Tests (Argon #7): add assertions in tests/physics-suite.test.mjs for unbalanced poses (sign of theta at -20 and 15, balance at -8) and run the lever audit (all three poses) from the test suite.
7. Readability: no comma-chained multi-statement one-liners longer than ~110 chars. Budget stays ≤150 figure-specific lines (physics-lever.js + physics-lever-geometry.mjs). If readable code cannot fit 150, stop at the smallest honest readable size and report the number — do not compress to hit it.

## Rejected (do NOT change)
- "27-part base is over-busy" — conflicts with the 40–80 part doctrine.
- `free: true` rule lines on the label plate — anatomy allows free ends for rule lines standing for printed text.
- Kernel path `../.agents/...` (Argon #5) — pre-existing on main, out of scope; leave as is.

## Acceptance (rerun after last edit, paste last lines)
Same as the previous brief, plus: audit passes at all three poses; new tests pass; screenshots after4-rest.png, after4-left.png (xf=-20), after4-right.png (xf=15), after4-zoom.png (3x on wedge + loads, tilted pose) in plans/reports/assets/pilot/ — READ each one and state what it shows.

Fable Loop: same block as the previous brief applies verbatim (ledger, PREDICT, falsify, 2 failed fixes on one problem → STOP/BLOCKED, verify before done, NOT-verified first in report).

End with:
Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
Summary: ...
Concerns/Blockers: ...
