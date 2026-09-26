# Plan: repository structure cleanup + README

Status: done 2026-09-26, pending Pages verification of the Jekyll page redirects (owner approved: whole repo · redirect stubs for old public URLs · public-repo README format)

## Outcome
Every folder answers "what is this" at a glance. Projects live in their own folders, and shared engines live apart from them. Old public Pages URLs keep working through redirect stubs.

## Constraints / non-goals
- Do not touch another session's uncommitted work: `package.json`, `package-lock.json`, `knowledge/INDEX.md`, and the untracked raster-to-SVG files. That is also why `scripts/` stays flat for now (regrouping it needs `package.json` edits).
- Keep basenames, and move whole project groups, so that relative references inside a project are unchanged.
- No behaviour change: identical pages, gates and exports, at new paths.

## Mapping
| From | To |
|---|---|
| `promo/hyperframes-*.mjs`, `promo/studio-runner.css` | `promo/shared/` |
| `promo/index.html`, `promo-engine.js`, `promo.css`, `promo-storyboard.svg` | `promo/design-os-promo/` (the old `promo/index.html` becomes a stub) |
| `promo/claude-design*` | `promo/claude-design/` |
| `promo/codex-app*` | `promo/codex-app/` |
| `promo/v0-generative-ui*`, `guillermo.png` | `promo/v0-generative-ui/` |
| `promo/design-os-tutorial*`, `promo/assets/` | `promo/design-os-tutorial/` |
| `promo/astra-law*` (incl. `astra-law-icons/`) | `promo/astra-law/` |
| `promo/drone-404.html`, `drone-search-404.*`, `drone-404-proofs/` | `promo/drone-404/` (`proofs/`) |
| `promo/sample-*.html`, `hyperframes-demo.html` | `promo/samples/` |
| `docs/promo/*` (Pages mirror) | same layout as `promo/`, plus stubs at the old URLs |
| `docs/architecture-*.md`, `system-architecture.md`, `architecture-dashboard.html` | `docs/architecture/` |
| `docs/*-pipeline.md`, `motion-video-recreation-workflow-guide.md` | `docs/pipelines/` |
| motion IR, gates, toolchain, AI capability and knowledge docs, `gates-audit-proof.html`, `primitives-showcase.html` | `docs/reference/` |
| `docs/codex-app-*`, `docs/v0-generative-ui*`, `docs/saas-short.contact-sheet.jpg` | `docs/cases/<project>/` |
| `research/2026-09-codex-*.md` | `research/codex-app/` |
| `research/multi-persona-debate-log.md` | `research/notes/` |
| `plans/astra-*.md`, `plans/drone-404-svg-animation.md` | `plans/cases/` |

## Method
1. `plans/260926-repo-structure/restructure.mjs` (a one-off, kept as the record) does the `git mv`, then rewrites every path token that resolves to a moved file. Tokens are resolved relative to the referencing file, the repo root, `promo/` (dev-server URLs), the `docs/` site root (github.io URLs), and `.html` → `.md` for Jekyll pages. It then writes redirect stubs.
2. Hand edits for paths built dynamically: the scaffold templates, the sync publish layout, the dev-server default page, and `export-60fps-video` output names.
3. README rewritten in public-repo format.

## Verification
- `npm test`, `npx tsc --noEmit`, `python3 scripts/anti-flop-gate.py`, Astra and drone Pages checks, CI
- Crawl every page in `promo/` and `docs/` on the dev server and require 0 failed requests; every redirect stub must land on a 200
- Relative-link check over README and docs
- `render-drone-404-deliverable --case drone-404 --skip-video` still passes

## Rollback
One PR; revert its merge commit.
