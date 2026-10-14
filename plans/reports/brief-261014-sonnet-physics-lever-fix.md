# Fix: physics-lever pilot on the vendored anatomy kit (Sonnet implementer)

Work context: /Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot (Orca worktree; uncommitted state is intentional — do not reset, stash, commit or push).
Report: plans/reports/sonnet-261014-physics-lever-fix-report.md (write before finishing).
Original brief (still binding for constraints): plans/reports/brief-261014-grok-physics-lever-iso-kit-pilot.md

## Load first
1. Skill `es-fable-thinking` (Skill tool), then skill `es-designer` (global rule for UI work) and read `skills/product-designer/SKILL.md` in the repo (project MUST-CALL). Project design system (Hairline + docs/hairline-solid-workflow.md) wins over generic skill advice.
2. Read: docs/hairline-solid-workflow.md (§6, §7), CONTEXT.md, vendor/anatomy/references/kit.md (§1–§8, §12), vendor/anatomy/references/craft.md (§1–§6), vendor/anatomy/examples/dial-indicator/build.mjs.
3. Current files: playground/physics-figures/physics-lever.js (57 lines), playground/physics-figures/physics-lever-geometry.mjs (173 lines), scripts/audit-physics-lever.mjs, scripts/bundle-physics.mjs, scripts/build-physics-page.mjs, tests/physics-suite.test.mjs. Before-version for legibility reference: `git show HEAD:playground/physics-figures/physics-lever.js`.

## Controller-verified state (FACT)
- audit passed (41 solids); physics #1 line ends 0 (earlier state); page builds with `HAIRLINE_KERNEL=/Users/jang/Products/.agents/skills/hairline-create/kernel.js node scripts/build-physics-page.mjs` (the default relative kernel path does not resolve from this worktree location — always set the env var when building here).
- Screenshot plans/reports/assets/pilot/after2-zoom.png shows the defects below.

## Defects to fix
1. Beam floats: the tall post is the pointer/scale, it stands in front of the beam; no support under the pivot. Put a real fulcrum (wedge / knife-edge on the sliding carriage) directly under the beam's pivot; the beam visibly rests on it; it slides with the fulcrum control.
2. Only one load visible. Model has two loads F1 at d1 and F2 at d2 (balance at d2 = 2·d1). Draw both stacks ON TOP of the beam at their true distances (not under it, where the near end hides them), tilting with the beam.
3. Must read as "lever and fulcrum" at 1x, like the before version (beam, wedge, two weights), plus anatomy craft (base on feet, ruler strip with ticks on its edge, rails + carriage, corner screws, label plate). 40–80 parts.
4. Figure-specific code (physics-lever.js + physics-lever-geometry.mjs) ≤ 150 lines total (owner ruling; vendor/anatomy is outside budget). Readable code — no minification tricks or many statements per line. If 150 is impossible without dropping required parts, stop at the smallest honest size and report the number and why.
5. Keep runner contract (id, title, concept, means, rules, range, mount({stage,svg,read}, v) → {set, destroy}), viewBox 0 0 400 320, self-contained page, one spring per DOF, reduced-motion still, offscreen stop, one lit accent that transfers to the driven part.

## May modify
Only the files listed in step 3 plus regenerated playground/physics.html and docs/playground/physics.html (via the build script), and the report. NOT vendor/**, other figures, CONTEXT.md, docs/*.md, package.json.

## Acceptance (rerun after your last edit; paste last lines verbatim in the report)
- `node scripts/audit-physics-lever.mjs` → `audit passed`
- `HAIRLINE_KERNEL=... node scripts/build-physics-page.mjs` → success
- `node scripts/check-hairline-line-ends.mjs physics --out plans/reports/assets/pilot-line-ends` → `physics #1  line ends: 0 of N` (#2–#5 stay as on main: 1,1,9,1 — do not fix)
- `npx tsc --noEmit` exit 0; `npm test` all pass; `python3 scripts/anti-flop-gate.py` exit 0
- Screenshots via `node vendor/anatomy/scripts/drive.mjs playground/physics.html '<actions>'`: plans/reports/assets/pilot/after3-rest.png (`["shot",file,".plate",1]`), after3-active.png (move pointer then shot), after3-zoom.png (`[".plate",3,[180,120,260,180]]` or a region centred on the fulcrum). READ each PNG yourself and confirm the beam sits on the wedge and both loads show.
- `wc -l` of the two figure files.

Operate under the Fable Loop (es:fable-thinking — load it with the Skill tool before starting):
- Keep an epistemic ledger: FACT (observed this session) / INFERENCE / ASSUMPTION / UNKNOWN. Verify load-bearing assumptions before building on them. Your own earlier "I verified X" is INFERENCE unless the observation is in front of you now.
- The task's stated bug location or prescribed solution is an ASSUMPTION (the requester's hypothesis), NOT a constraint. Diagnose independently and fix at the root cause. If the root cause lies outside the stated scope: say so in your report and fix at source anyway (two-way door) or stop and escalate (one-way door). NEVER engineer around a root cause you have already identified — a documented workaround is still a workaround.
- Scope is the deliverable: do not narrow, widen, or swap it. A pre-existing bug the task does not mention is a follow-up in your report, not a change. If one part is blocked, finish every other part in full and say exactly what you left out and why.
- Before implementing, sweep the repo's own documents for constraints. A conflict between the request and a repo constraint is stop-and-surface information.
- Treat delete / overwrite / in-place migrate / publish as one-way doors. No git reset/stash/checkout of files, no commit, no push.
- Before each consequential action, state PREDICT: <expected outcome>. Any surprise → stop, re-model; do not patch around it.
- After forming a hypothesis, run the cheapest experiment that could DISPROVE it.
- Run commands in the foreground; never background-and-wait.
- 2 failed fix attempts on the same problem → STOP, report BLOCKED with your ledger.
- Before reporting done: attack your work (edge inputs: fulcrum at both slider ends; re-runs; the ORIGINAL success test), then re-verify with the acceptance commands and screenshots. "Should work" is banned — verify or list as NOT verified.
- Do not end your turn on a plan or promise. End only when done or blocked.
- Report: what could NOT be verified stated FIRST; then conclusion; claims labeled FACT/INFERENCE/ASSUMPTION; weakest link in one line; unresolved questions at end.
Success test: the Acceptance bullets above, verbatim, plus defects 1–3 visibly fixed in after3-zoom.png.
Constraints: listed above.
Reversibility: two-way (isolated worktree, no commits).

End with:
Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
Summary: ...
Concerns/Blockers: ...
