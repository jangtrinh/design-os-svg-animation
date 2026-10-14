# Physics lever fix round 3 (formatting only)

NOT verified: browser pointer interaction (only rest pose screenshotted); poses other than rest compared by markup string, not pixels.

## Result
- physics-lever.js 53 + physics-lever-geometry.mjs 147 = 200 lines (`wc -l`).
- `awk 'length>110'` on both files: empty (also empty under LC_ALL=C, i.e. bytes).
- Test: BUDGET=200, new MAX_LINE=110 assertion over both files (tests/physics-suite.test.mjs).
- Rebuilt via bundle-physics.mjs (physics-app.js, physics.html, docs/playground/physics.html).

## Dedupe used to stay at 200 (no re-compression)
- 4 corners (foot, washer, screw) share one sign table.
- base/carriage parts returned as one array (no push/forEach scaffolding).
- markup() and contribute() share one `drawn()` pass.
- Over-long comments shortened or made trailing; 4 blank lines dropped.

## Evidence
- Behaviour: old built bundle (pre-edit) vs new geometry, markup string at 6 poses x 2 accents: 0 diffs.
- audit-physics-lever: `audit passed` at xf=-20, -8, 15.
- check-hairline-line-ends physics: `physics #1  line ends: 0 of 100 ends on 6 lines float` (gate exits failed for figures #4/#5 etc, pre-existing, out of scope).
- `npx tsc --noEmit` exit 0; `npm test` exit 0 (89 pass, 0 fail); anti-flop-gate exit 0 (100% passed).
- Screenshot plans/reports/assets/pilot/after5-rest.png: byte-identical to after4-rest.png (`cmp`).
