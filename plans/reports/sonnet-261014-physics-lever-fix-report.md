# Physics lever fix report

Not verified: real touch input / keyboard (runner unchanged); reduced-motion and offscreen stop rely on unchanged HL.register/runner (not re-exercised); no independent verifier run (self-report is not completion evidence; controller to rerun gates).

## Result
- Beam now rests on a wedge (prism, apex at pivot ZB) on a carriage deck riding two rails; fulcrum slides with the pointer. Tall pointer/scale post removed.
- Both loads on TOP of the beam at true x (F1: 3 discs at -24, F2: 2 discs at +24), tilt with beam, bolt caps.
- 43 solids (feet, plate, ruler+ticks, label plate, 4 washer+screw, 2 rails, 4 stops+screws, 2 bushes, deck, knob, 2 bolts, wedge, beam, 5 discs, 2 caps).
- Root cause of float (FACT): old hull-meshed wedge + a pointer post read as the support; beam had no visible contact. Replaced by kit `prismOf` (vendor lathe.mjs) for beam and wedge, which removed the custom mesh/hull/spin code and made the 150-line budget reachable.

## Line budget
physics-lever.js 48 + physics-lever-geometry.mjs 102 = 150 (<=150). Test updated to assert combined <=150 (was 150 / <200 split).

## Files modified
- playground/physics-figures/physics-lever.js, physics-lever-geometry.mjs (rewritten)
- scripts/build-physics-page.mjs: inlines lathe.mjs in its own scope, adds prismOf to AK (lathe shares names oriented/runsOf/signedArea with iso-kit)
- scripts/audit-physics-lever.mjs: passes `{...k, prismOf}` to geometry
- tests/physics-suite.test.mjs: combined budget test
- regenerated playground/physics-app.js, playground/physics.html, docs/playground/physics.html

## Acceptance (after last edit)
- audit: `audit · 0 tubes · 43 solids · 43 items · 1 depth states · 111 overlaps · 111 order rules · 0.2 s` / `audit passed`
- build: `✓ Successfully generated playground/physics.html & docs/playground/physics.html`
- line ends: `physics #1  line ends: 0 of 100 ends on 6 lines float`; #2..#5 = 1, 1, 9, 1 (unchanged, not touched)
- `npx tsc --noEmit` exit 0; `npm test` 87 pass / 0 fail; anti-flop-gate exit 0 (100% PASSED)
- wc -l: 102 + 48 = 150
- Screenshots (read by me): plans/reports/assets/pilot/after3-rest.png, after3-active.png, after3-zoom.png, after3-edge-left.png (xf=-20), after3-edge-right.png (xf=15). Confirmed: beam on wedge apex, both loads visible on top, tilt direction matches moment imbalance at both slider ends, console clean.

## Deviations / notes
- Pointer unproject plane changed 6.2 -> 9.5 (deck height) so the cursor tracks the carriage.
- Painter's order in live markup = layer (base, carriage, wedge, beam, load) then depth; audit's settled keys cover rest pose only (INFERENCE: live tilted frames not audited, checked by eye at both ends).
- Discs stay vertical on the tilted beam (max ~0.7 unit edge overhang at 0.16 rad); visually negligible.

Weakest link: depth order in tilted frames is layer-based, not audit-proven.

Unresolved: none.

Status: DONE_WITH_CONCERNS
