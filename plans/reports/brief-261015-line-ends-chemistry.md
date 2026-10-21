# Fix floating line ends: suite chemistry (Sonnet implementer)

Work context: /Users/jang/orca/workspaces/design-os-svg-animation/line-ends-chemistry (Orca worktree on branch from main; no commit, no push, no reset/stash).
Report: plans/reports/sonnet-261015-line-ends-chemistry-report.md (write before finishing).

## Goal
Make every figure in suite `chemistry` pass the line-end gate: every texture line (tick, seam, groove, pointer, rule) ends on a stroke, a dot or an outline. Figures to fix (index = tab order in the page): #1 chemistry-titration.js, #4 chemistry-distillation.js, #5 chemistry-ph-scale.js.
Other suites are owned by other workers — do not touch them.

## First
1. `bash scripts/setup-agent-worktree.sh` (links node_modules, prints the kernel path). If it fails, STOP and report BLOCKED.
2. Baseline: `node scripts/check-hairline-line-ends.mjs chemistry --out plans/reports/assets/line-ends-chemistry-before` — read every ringed PNG for your figures.
3. Read docs/hairline-solid-workflow.md §6 (craft doctrine: lines resolve; ticks hang from a ruler strip's edge; a texture ends on a real edge or fades) and CONTEXT.md. Read vendor/anatomy/references/craft.md §2–§3 only for recipes.

## How to fix (pick per floating end, in this order)
- Gap < 5 px: extend or trim the line so it lands on the nearest outline or stroke (fix the coordinates at the source, not by a fudge offset).
- Ticks/graduations floating on a face: give them the edge they belong to (ruler strip or scale plate), or hang them from an existing edge.
- A line that genuinely must stop (needle tip, rule line standing for printed text): mark it free the Hairline way only if the kernel supports it; otherwise end it on a terminal dot. Never mark a line free just to silence the gate; justify each one in the report.
- Never hide a line, lower its opacity, or change the adapter/gate to pass. Do not modify scripts/check-hairline-line-ends.mjs, vendor/**, the kernel, or other suites.
- Keep each figure's behaviour, motion and physics unchanged; keep files < 200 lines and lines ≤ 110 chars where you touch them.

## May modify
playground/chemistry-figures/*.js for the listed figures, then regenerate via `node scripts/bundle-chemistry.mjs` and `node scripts/build-chemistry-page.mjs` (generated: playground/chemistry-app.js, playground/chemistry.html, docs/playground/chemistry.html), plus the report and screenshots.

## Acceptance (rerun after your last edit; paste last lines verbatim)
- `node scripts/check-hairline-line-ends.mjs chemistry --out plans/reports/assets/line-ends-chemistry-after` → every figure `line ends: 0` and `line-end gate passed`.
- `npx tsc --noEmit` exit 0; `npm test` exit 0; `python3 scripts/anti-flop-gate.py` exit 0.
- Before/after screenshots per fixed figure: `node vendor/anatomy/scripts/drive.mjs playground/chemistry.html '[["wait",800],["eval","document.querySelectorAll(\"#nav-tabs button\")[IDX].click()"],["wait",1200],["shot","plans/reports/assets/line-ends-chemistry-after/fig-N.png",".plate",2]]'` (IDX = 0-based). Read each PNG: the figure must look the same apart from the line ends — no new floating parts, nothing missing.
- Report table: figure · floating ends before → after · what you changed per end · any free-marked line with reason.

Operate under the Fable Loop:
- Ledger FACT / INFERENCE / ASSUMPTION / UNKNOWN; verify load-bearing assumptions.
- The gate's ring is a symptom; diagnose which part the line belongs to before moving it.
- Scope is the deliverable: other floating lines outside your figures are follow-ups, not changes.
- PREDICT before each consequential action; surprise → stop and re-model.
- 2 failed fix attempts on the same line → STOP that figure, finish the others, report it as BLOCKED.
- Run commands in the foreground. Verify, never "should work". Report NOT-verified items first.

End with:
Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
Summary: ...
Concerns/Blockers: ...
