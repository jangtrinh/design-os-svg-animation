# Retro — single-line drone 404 → reusable line-art-to-motion pipeline

Session 2026-09-25, ~21:08–22:40, `design-os-svg-animation`. Shipped: PR #6 (merge `ac3040b`), live on Pages.
Owner goal for this retro: turn how it was built into a complete pipeline to learn from next time.

## 1. Measured cost (counts from the session, not impressions)

| Cost bucket | Count | Root cause (one clause) |
|---|---|---|
| Scans before first mutation | 4 | normal (project state, skills, tools, reference) — no proposal |
| Reruns from guessed tooling | 6 | no tracing recipe: pixel-walker graph (1,129 micro-strokes), `np.cross` 2-D, blank ImageMagick SVG render, lost function after string splice, 2 zsh traps |
| Hook / gate blocks | 3 | scout-block denies `node_modules`/`vendor` in Bash text (slop-detect never ran; a retro heredoc was blocked) |
| Infra flaps | 2 | mobbin MCP down; browser pane refused navigation late in session |
| Fix rounds only the final artifact revealed | 11 (+3 false-green tests and 1 misleading metric, found by council) | no envelope/evidence rules: ghost-blade scribbles, 375 px clipping (+8 px residue), pointer outside stage, theme leak between pages, stale frames ×2, 3 test re-targets, gust 22.7° |
| Owner steering messages / my questions | 9 / 0 | motion *feel* was never proposed as options: 3 of 9 were feel corrections ("rigid" → "should wobble" → "too much shaking") |

Top buckets → proposals: artifact-only fix rounds (11), feel iterations (3), tooling reruns (6).

## 2. Debate table

| # | Proposal | For | Against | Verdict | Destination |
|---|---|---|---|---|---|
| A | Canonical pipeline doc: stages, artifact + gate per stage, pitfalls table | owner asked; 9 stages repeated with ad-hoc commands | doc rot | **Done** | `docs/pipelines/line-art-to-motion-pipeline.md` |
| B | Generic geometry builder driven by a parts JSON | drone constants hard-coded in the builder | refactor risk | **Done with guard**: output byte-identical | `scripts/build-line-art-geometry.mjs`, `research/drone-404/drone-parts.json` |
| C | Exporter clears stale proofs + builds MP4 sheet + flight plot itself | stale frames hit a contact sheet and a commit (2 incidents); 2 manual steps | — | **Done** | `scripts/drone-404-proof-checks.mjs` |
| D | Project skill entry so agents pick the pipeline up | CLAUDE.md lists mandatory skills; none covered stills | skill sprawl | **Done**, thin: points at the doc | `skills/line-art-motion/SKILL.md`, CLAUDE.md line |
| E | Motion-feel taste rule | 3 owner corrections, quoted | taste may change | **Done** | memory `motion-feel-physics-over-keyframes` |
| F | Environment traps (zsh glob, PIPESTATUS, MSVG, hook words) | 6 reruns | generic, not project | **Done** | memory `shell-and-render-gotchas` |
| G | Flight envelope test (drone must stay inside viewBox) | clipping found only by the 375 px screenshot, twice | small | **Do** after council | `tests/` |
| H | es-designer: slop-detect path blocked by hook; no token row for physical scene motion | 2 incidents | not ours to edit | **Gap filed** | ledger `g-260925-2230-*`, `g-260925-2231-*` |
| I | Generic exporter (not drone-specific) | reuse | only one case exists | **Don't yet**: copy as a template, generalise on case #2 | pipeline doc §6 |

## 3. Behaviour changes (not files)

1. Motion feel is open-ended → show 2 tuned variants plus the angle plot *before* the full export. This would have saved ~2 export rounds (~2.5 min each + review).
2. Before claiming "fits at 375", measure the numeric envelope, not the screenshot. The screenshot caught it only after a render round.
3. A shared worktree holds another session's changes → stage an explicit file list and name what was left out. Done in PR #6, 0 foreign files shipped.

## 4. Saved where

- Pipeline: `docs/pipelines/line-art-to-motion-pipeline.md` · `skills/line-art-motion/SKILL.md` · README link · CLAUDE.md pointer.
- Code: `scripts/build-line-art-geometry.mjs` (+ `research/drone-404/drone-parts.json`), `scripts/drone-404-proof-checks.mjs`.
- Memory: `motion-feel-physics-over-keyframes`, `shell-and-render-gotchas`, `line-art-motion-pipeline`.
- Ledger: 2 es-designer gaps (recorded, skill not edited).

## 5. Council (false-green hunt, kongming)

Report: `council-260925-2208-drone-404-false-greens.md`. Verdict: DONE_WITH_CONCERNS, and every concern was valid.

| Finding | Evidence | Applied fix |
|---|---|---|
| Seamless test compared the steady table with itself | both samples in the same table row | now crosses the wrap (1e-6) and the transient boundary (0.1 px), plus two independently built controllers |
| Hover-wobble test passed with turbulence off | spread 0.57 from arrival ringing | counterfactual: with air 0.76°, without air 0.19° (must be < 0.3) |
| Overshoot test met by the commanded path | controller overshoot 0.01 px | claim removed everywhere; tests now assert the counter-swing 1.5–5° and < 1.5° within 0.35 s |
| No settle-time assertion; "~4°" in the plan was wrong | measured 1.9–4.0° | asserted; plan corrected |
| Fidelity normalised by the canvas: a blank render scored "97.6%" | ink is 2.4% of the canvas | ink recall/precision within 2 px (99.70% / 99.95%), throws below 98% or when no ink or metric is found; README and marketing claims corrected |
| `sync --check` not in CI | ci.yml | CI step added |
| Theme icon and button transforms animated under reduced motion | CSS | `prefers-reduced-motion` block |
| Manual captures in the proofs dir survived clearing | regex | moved to `plans/reports/drone-404-publish-evidence/` |
| Hover measurements only printed to stdout | exporter | now written to `interaction-measurements.txt` |

## 6. Owner decisions pending

- Visual acceptance of the drone's motion: the plan checkbox is still open.

## 7. Follow-ups (ROI order)

1. `sync --check` compares bytes only and never loads the page. Add a headless load of `docs/promo/drone-404/drone-404.html` in CI (~20 min; needs Chrome in CI).
2. The Motion IR fixture is validated for schema only, not for fidelity to the timeline. Add a sampled-equality test (~15 min).
3. Remove the 3 orphan `promo/proof_drone_404_*.png` files, which predate this work and are untracked. Owner call.
4. Generalise the exporter once a second case (MiniPro) exists. Not before.

## Reflect: the one lesson that generalises

"Rigid" is a dynamics problem, not an engine problem. Measure frame pacing first; if it is fine, simulate weight (controller or springs, ζ 0.65–0.8) and tune from a plotted curve.
