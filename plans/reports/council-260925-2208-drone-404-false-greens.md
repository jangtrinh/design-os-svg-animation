# Council review: drone-404 false greens (2026-09-25)

Scope: working tree (post-PR #6 + uncommitted refactor). `npm test` 60/60 pass; `sync --check` in sync (9 files). All numbers below measured with read-only probes against `sampleDroneState` / `createFlightController` / `createDroneInteraction`.

## Q1. Tests that pass with the named behaviour broken

| Test (file:line) | Claims | Actually proves | Evidence |
|---|---|---|---|
| seamless loop `tests/drone-404.test.mjs:31-45` | loop closes across the period | nothing: both samples land in the steady table at the same `local` (`flight-controller.mjs:93` `(u-period)%period`), so a == b by construction | offsets 0..9.99 all map t in [14,24) vs [24,34), same table row |
| hover never frozen `:87-92` | turbulence/drift keep hover alive | passes with TURBULENCE and DRIFT both zeroed: spread 0.574 deg from arrival ringing alone (bound is >0.5) | probe: same controller, `gust:0`, no drift |
| arrival overshoots `:80-85` | controller overshoots waypoint | commanded path alone reaches -406.8 (LEFT_FAR -400 + DRIFT 5+2 sin, `motion.mjs:45,58`); controller overshoot is 0.01 px (no drift: min x -400.01). Threshold -405 is met by the command, not the loop | actual min -407.94 vs commanded -406.82 |
| deterministic `:47-48` | reproducible | `deepEqual(sample(6.25), sample(6.25))` is true for any pure function; no cross-path (live vs seek vs IR) check | trivial |
| bank plausible `:77` | max bank plausible | bound 20 deg vs measured max 12.14 deg (plan:43 says 12) — 65% headroom | probe C3 |
| gimbal lag `:94-104` | "small lag" | accepts cancelling 50-98% of bank; measured ratio 0.215, i.e. gimbal leaves 21% of bank uncancelled — that is not "small" | probe D |
| frame-gap clamp `tests/drone-404-interaction.test.mjs:52-61` | no blow-up | `abs(y) < 20` after one clamped step; any state passes | `interaction.mjs:57` clamps to 1/30 |

## Q2. Thresholds loosened to fit the implementation

| Item | Owner intent (plan:35-43) | Asserted? | Measured |
|---|---|---|---|
| "one counter-swing (~4 deg) then level in ~0.3 s" | wobble slightly, then stable at once | **No test asserts settle time anywhere.** Interaction test gives 3 s (`interaction.test.mjs:28`); motion tests have no time-to-settle | after arrival at u=2.9: counter-swing -2.45 deg peak at 3.01, |bank|<1.5 by 3.10 (0.20 s). Plan's "~4 deg" is wrong; interaction release: tilt <0.5 deg by 0.83 s |
| hover wobble +-0.7 deg | slight | bound 0.5..8 deg spread (`:91`); 8 deg would be a visible rock | 1.36 deg in the test window (includes arrival tail); pure home hover 0.77 |
| max bank 12 deg | plausible | `< 20` (`:77`); `flightProfile` returns maxBank but only logs it (`render-drone-404-deliverable.mjs:170`) | 12.14 |
| peak-tilt instead of tilt-at-0.4 s (`interaction.test.mjs:13-20`) | modest tilt | 2..12 deg peak; no check that tilt has decayed by 0.4 s | not measured by test |
| lift overshoot reference -> reduced-motion y (`:116`) | damped, not linear | `min < -41` while actual -48.2 (8.2 px); this re-target is the one correct fix (loopStart y is -45.3, mid-transient) | OK, but no settle check (y at 6.2 = -42.7, bob) |

## Q3. Dead code / unproduced claims

| Item | Finding |
|---|---|
| `plans/drone-404-svg-animation.md:65` "`ui gate` PASS, axe 0 x3, render probe" | no script, artifact, or log in repo produces this; only `page-*.png` exist |
| plan:59 "logged drone transforms (rest 1.6 -> pushed 48.7 px)" | stdout only (`render-drone-404-deliverable.mjs:128-130`), not persisted; unverifiable after the run |
| plan:43 "counter-swing ~4 deg" | measured 2.45; chart PNG is the only evidence and is not machine-checked |
| `promo/proof_drone_404_{active_scan,altitude_inspect,patrol_enter}.png` (untracked) | no producer anywhere in repo; orphan artifacts |
| `promo/drone-404-proofs/marketing-card.png`, `pages-copy-live.png` | not in `GENERATED` regex (`proof-checks.mjs:17`), not produced by the exporter: survive `clearStaleProofs` forever, i.e. the exact stale-proof class the refactor was meant to kill |
| `docs/line-art-to-motion-pipeline.md` untracked | referenced by `CLAUDE.md:20`, `README.md:56`, `skills/line-art-motion/SKILL.md:16`; dangling until committed |
| `DRONE_LINE_ART.strokeWidth` (`build-line-art-geometry.mjs:119`) | emitted, read by nothing (page uses `fitStroke`, `drone-404.html:181-185`) |
| `rotorAngle` export (`motion.mjs:71`) | only internal use; harmless |
| Motion IR fixture (`build-drone-404-motion-ir.mjs:48`) | 100 ms linear keyframes of a 240 Hz controller; test only validates schema (`:12-16`), never fidelity to the timeline |

## Q4. Fidelity metric and Pages sync

| Check | Failure that reads as success |
|---|---|
| `fidelity()` `proof-checks.mjs:85-93` | metric normalised by the whole 2000x1120 canvas; reference ink is 2.4% of pixels (53.7k). **A blank render scores 2.4% "differ" = "97.6% fidelity"**; the reported 0.368% (8247 px) is ~15% of ink pixels differing. No threshold: only a log line + plan checkbox |
| same | `compare` killed/timed out -> `error.stderr` empty -> `Number('')` = 0 -> "0 pixels differ", finite, no throw (verified `Number('')===0`) |
| same | render stroke 2.2 px vs reference ~3 px (render ink 1.81% vs 2.40% of canvas): a chunk of the diff is width, not geometry; fuzz 30% hides the rest |
| `sync --check` `sync-drone-404-pages.mjs:54-65` | byte-equality only; never loads the page. A new import in any module (not in `FILES` :22-34) passes --check and 404s on Pages; a JS error in the source passes too |
| same | not wired: no npm script, `ci.yml` runs `verify:astra-pages` only (`:40`). Drift is invisible to CI |

## Q5. Determinism and loop boundary

| Question | Answer |
|---|---|
| Two renders of same t | identical in one process (pure lookup). Live path `drone-404.html:207-209` composes the interaction layer; `__seekToTime` :233 does not: intended, but `frames()`/`encode()` inherit the live-clock `render(0)` at :236 first (harmless). Cross-engine Node vs Chrome float drift: speculation, low risk |
| Loop closure at wrap (steady[end] vs steady[0]) | measured residual < 1e-10 px/deg (transient->steady boundary and wrap differ only by the 1e-9 s interpolation slope). Seamless in practice, **untested** (Q1 row 1) |
| First loop vs steady at same phase | y differs 0.25 px, bank 0.001 deg: MP4 loops 1 and 2 not identical, invisible |
| Grid interpolation | `k = min(steps-1, floor(local*HZ))` :95 safe at local -> period; `%` on floats fine for these values |

## Q6. Reduced motion

| Path | Animates under `prefers-reduced-motion: reduce`? |
|---|---|
| timeline / hover layer | no: `tick` returns `render(0)` :202, rAF never started :237 |
| theme icon swap `drone-404.html:107-116` | **yes**: 400 ms rotate(-90deg)+scale transform transition; no `@media (prefers-reduced-motion)` rule exists anywhere in the page |
| `.btn:active` / `.theme-toggle:active` transforms :87,96,105,118 | yes (120 ms translate/scale) |
| reduce switched OFF mid-session | page stays frozen forever (:234 only handles on; :237 runs once) — dead state, not a violation |

## Q7. Top 3 fixes by ROI

1. **Make the seamless test cross the wrap and the transient boundary** (`tests/drone-404.test.mjs:31-45`): compare `sample(L+P-1/240)` vs `sample(L-1/240)` and `sample(L+P)` vs `sample(L)`, plus `sample(L)` vs `sample(L+2P)`; tolerance 1e-6. ~10 min. Kills the tautology that would hide any future cache/period bug.
2. **Assert the owner's intent directly** (new test): after each leg end, `max|bank|` in [end, end+0.3] between 1.5 and 5 deg and `|bank| < 1.5` for all t in [end+0.35, end+1.0] except the gust window; overshoot test -> compare `drone.x` against the commanded path (export `command` or a min-x of LEGS+DRIFT), require controller overshoot > 0 px or delete the claim from plan:41. Hover test -> window [0,1.2] at HOME (spread 0.6..2). ~30 min; makes the three re-targeted thresholds unnecessary.
3. **Gate fidelity on ink, not canvas** (`proof-checks.mjs:91-95`): `ratio = changed / referenceInkPixels` (count via `magick ... -threshold 50% -format %[fx:1-mean]`), throw if `metric === ''`, and throw above a threshold (e.g. 0.20). Add `sync:drone-404-pages` / `verify:drone-404-pages` scripts and put verify in `ci.yml` next to `:40`. ~20 min.

Later: `@media (prefers-reduced-motion: reduce)` block disabling the icon/btn transitions; add `marketing-card|pages-copy-live` to `GENERATED` or delete them; commit `docs/line-art-to-motion-pipeline.md`; remove the three orphan `promo/proof_drone_404_*.png`.

## Assumptions
- Working tree (not HEAD) is the review target — high. Thresholds cited match HEAD (tests unmodified since 5b68f69), so the three re-targets happened inside the PR branch — high.
- The exporter's fidelity run used the current geometry (metric file 0.368% matches plan) — medium; not re-run (needs Chrome + dev server).
- Owner wording "wobble slightly, then stable at once" taken from plan:35 — high.

Status: DONE_WITH_CONCERNS: three green tests (seamless, hover-wobble, overshoot) are tautological or satisfied by the commanded path; fidelity has no gate and a blank render would read as 97.6%; sync --check is not in CI.
