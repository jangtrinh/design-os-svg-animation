# Fix round 1: physics-lever pilot (same worktree, continue from current files)

Work context: /Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot
Original brief (still binding): plans/reports/brief-261014-grok-physics-lever-iso-kit-pilot.md
Report path: plans/reports/grok-261014-physics-lever-pilot-report.md (write it before finishing — the previous run never wrote it).

## Controller verification of the current state (FACT, rerun by controller)
- `node scripts/audit-physics-lever.mjs` → audit passed (40 solids).
- `node scripts/check-hairline-line-ends.mjs physics` → physics #1 `0 of 106`; #2–#5 unchanged vs main (expected, do not fix them).
- `npx tsc --noEmit` 0, `npm test` 87/87, `python3 scripts/anti-flop-gate.py` 0.
- Screenshots: plans/reports/assets/pilot/after-fig1.png, after-fig1-zoom.png (3x), before-fig1.png.

## Defects to fix (seen in after-fig1-zoom.png)
1. The beam is not carried by the fulcrum. The upright post stands in FRONT of the beam and ends below it; the beam floats. Rebuild the fulcrum as a real support: a wedge / knife-edge (or a post with a pivot bearing) directly UNDER the beam's pivot point, beam resting on it, pivot pin through beam and bearing. The reader must see what holds the beam.
2. Only one weight is visible. The model is two loads (F1 at d1, F2 at d2; balance when d2 = 2·d1). Both weight stacks must be drawn hanging from or sitting on the beam at their true distances, moving with the beam tilt.
3. The figure no longer reads as "lever and fulcrum" at 1x. Keep the before version's legibility (beam, wedge, two weights) and add the anatomy craft on top (base on feet, ruler strip, rails, carriage for the sliding fulcrum, screws, label plate).
4. Figure-specific code is 231 lines (physics-lever.js 66 + physics-lever-geometry.mjs 165). Owner ruling: ≤150 lines of figure-specific code; only `vendor/anatomy/` is outside the budget. Get both files together to ≤150 lines by leaning on kit helpers. If 150 is impossible without dropping required parts, stop at the smallest honest size and say so with the number.
5. `scripts/build-physics-page.mjs` gained a fallback kernel path `~/.grok/skills/hairline-create/kernel.js`. That is machine-specific. Remove it; keep the original single path `../.agents/skills/hairline-create/kernel.js`. For building inside this worktree only, pass the kernel path through an env var `HAIRLINE_KERNEL` (default = original path) — do not hardcode any home-dir path.

## Acceptance (rerun all after the last edit, paste last lines in the report)
- audit passed; physics #1 `line ends: 0`; tsc 0; npm test all pass; anti-flop 0.
- New screenshots rest + active (pointer moved) + 3x close-up of the fulcrum: plans/reports/assets/pilot/after2-*.png (use `node vendor/anatomy/scripts/drive.mjs`).
- `wc -l` of figure-specific files in the report.
Do NOT modify vendor/anatomy/**, other figures, CONTEXT.md, docs. No commit, no push.

Operate under the Fable Loop (ledger FACT/INFERENCE/ASSUMPTION; PREDICT before consequential actions; 2 failed fixes on the same problem → STOP and report BLOCKED; verify, never "should work"; report what was NOT verified first).

End the report with:
Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
Summary: ...
Concerns/Blockers: ...
