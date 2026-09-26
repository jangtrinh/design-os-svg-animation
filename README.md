# Design OS SVG Animation

**Deterministic SVG animation and 1080p 60 fps motion video, built for AI coding agents.** Every scene is driven by one seekable virtual clock, so each frame can be reproduced, tested and exported exactly.

Live site: [jangtrinh.github.io/design-os-svg-animation](https://jangtrinh.github.io/design-os-svg-animation/)

<p align="left">
  <a href="https://github.com/jangtrinh/design-os-svg-animation/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/jangtrinh/design-os-svg-animation/ci.yml?branch=main&style=for-the-badge&label=CI" alt="CI status" height="28"></a>
  <a href="https://github.com/jangtrinh/design-os-svg-animation/releases"><img src="https://img.shields.io/badge/release-v0.2.0-202020?style=for-the-badge" alt="Release v0.2.0" height="28"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-202020?style=for-the-badge" alt="License: MIT" height="28"></a>
  <img src="https://img.shields.io/badge/virtual_clock-deterministic_60fps-202020?style=for-the-badge" alt="Virtual clock: deterministic 60 fps" height="28">
  <img src="https://img.shields.io/badge/anti--flop-10_gates-202020?style=for-the-badge" alt="Anti-flop: 10 gates" height="28">
</p>

![Single-line drone 404: the drone draws itself, lifts off in front of a bold 404 and scans for the missing page](docs/assets/example-5-drone-404.gif)

---

## At a glance

| | |
| :--- | :--- |
| **Repository** | [jangtrinh/design-os-svg-animation](https://github.com/jangtrinh/design-os-svg-animation) |
| **Requires** | Node 22, Python 3.10+, Google Chrome (headless capture), FFmpeg |
| **Interface** | Browser players, Node/Python CLI scripts, Motion IR JSON schema |
| **Rendering** | SVG / DOM / Three.js, driven by `window.__seekToTime(t)`, exported frame by frame through FFmpeg |
| **Privacy** | Local only: a loopback dev server on port 4323, no telemetry |
| **License** | MIT |

## Why this engine, compared with the alternatives

- **One clock for everything.** Pages, tests, Motion IR fixtures and video exports all sample the same pure time function, so a frame at 7.3 s is identical in the browser and in the MP4.
- **Geometry from evidence.** Traced line art is gated on ink fidelity (for example, 99.7% of a reference's ink within 2 px), and recreations are compared against the encoded export.
- **Physics instead of keyframes, where motion has weight.** A simulated flight controller gives tilt-before-move and settle, tested against the owner's intent.
- **Gates that can fail.** Ten anti-flop gates plus intent-level tests; a blank render or an unpublished import fails the build.

> **Where others win, and it is not close:** After Effects plus Lottie is better for designer-authored motion edited by hand on a timeline. Remotion is better when your team already writes React and wants a video framework with a hosted render farm. Choose this repository when an AI agent should build, verify and export deterministic motion from code.

## Install

```bash
git clone https://github.com/jangtrinh/design-os-svg-animation.git
cd design-os-svg-animation
npm install
npm run dev   # http://127.0.0.1:4323
```

The Python tools used for tracing, silhouettes and flipbooks are build-time only: `python3 -m venv .cache/line-art-venv && .cache/line-art-venv/bin/pip install -r scripts/requirements-line-art.txt`.

## First safe use

1. **Look.** With `npm run dev` running, open `http://127.0.0.1:4323/promo/drone-404/drone-404.html?start=8`.
2. **Verify, read-only.** Run `npm test && npx tsc --noEmit && python3 scripts/anti-flop-gate.py`; all three must exit 0.
3. **Start a case, without overwriting anything.** Run `node scripts/new-line-art-case.mjs my-drawing --source raster`. It creates `research/my-drawing/`, `plans/cases/my-drawing.md`, and prints the next commands.

---

## Showcase

| | Claude Design promo | OpenAI Codex App promo | Vercel v0 recreation | Single-line drone 404 |
| :--- | :---: | :---: | :---: | :---: |
| **Preview** | ![Claude Design 3D globe](docs/assets/example-1-claude-design-globe.gif) | ![Codex App promo](docs/assets/example-3-codex-app-promo.gif) | ![v0 generative UI](docs/assets/example-4-v0-generative-ui.gif) | ![Drone 404](docs/assets/example-5-drone-404.gif) |
| **Live player** | [Open](https://jangtrinh.github.io/design-os-svg-animation/promo/claude-design/claude-design-promo.html) | [Open](https://jangtrinh.github.io/design-os-svg-animation/promo/codex-app/codex-app-promo.html) | [Open](https://jangtrinh.github.io/design-os-svg-animation/promo/v0-generative-ui/v0-generative-ui.html) | [Open](https://jangtrinh.github.io/design-os-svg-animation/promo/drone-404/drone-404.html) |
| **Source** | [`promo/claude-design/`](promo/claude-design/) | [`promo/codex-app/`](promo/codex-app/) | [`promo/v0-generative-ui/`](promo/v0-generative-ui/) | [`promo/drone-404/`](promo/drone-404/) |
| **Video** | [MP4, 82 s](promo/claude-design/claude-design-promo.mp4) | [MP4, 38 s](promo/codex-app/codex-app-promo.mp4) | [MP4, 47.5 s](promo/v0-generative-ui/v0-generative-ui.mp4) | [MP4, 24 s](promo/drone-404/drone-search-404.mp4) |
| **What to look at** | 3D globe with great-circle arcs, live tweaks, 16-project outro | macOS window kinematics, multi-agent streaming, diff review | SVGL wireframe drawing, prompt reel, 3D code card | traced single-line drone, flight physics, hover interaction, theme reveal |

Work in progress: the [Astra for Law study](https://jangtrinh.github.io/design-os-svg-animation/promo/astra-law/astra-law-promo.html) (`promo/astra-law/`) is a 77.6 s reference recreation. Its visual acceptance is still open, and its partner logos are declared SVGL stand-ins. Record: [plans/cases/astra-for-law-recreation.md](plans/cases/astra-for-law-recreation.md).

## Pipelines

| Pipeline | Use it when | Contract | Agent skill |
| :--- | :--- | :--- | :--- |
| **Motion video recreation** | Recreating a reference promo video | [docs/pipelines/motion-video-recreation-pipeline.md](docs/pipelines/motion-video-recreation-pipeline.md) (lessons: [workflow guide](docs/pipelines/motion-video-recreation-workflow-guide.md)) | [`skills/motion-video-recreation`](skills/motion-video-recreation/SKILL.md) |
| **Line art to motion** | Animating a still drawing (for example, a 404 hero) | [docs/pipelines/line-art-to-motion-pipeline.md](docs/pipelines/line-art-to-motion-pipeline.md) | [`skills/line-art-motion`](skills/line-art-motion/SKILL.md) |
| **Motion IR** | Declaring vector motion as typed JSON tracks | [docs/reference/motion-ir-specification.md](docs/reference/motion-ir-specification.md), [schema](schemas/motion-ir.schema.json) | — |

Every scene, animation or UI change starts with the [Product Designer skill](skills/product-designer/SKILL.md). Agents read [`AGENTS.md`](AGENTS.md) first.

## Repository structure

```text
design-os-svg-animation/
├── promo/                      Browser players and rendered videos, one folder per project
│   ├── claude-design/          82 s Claude Design promo (engine, styles, MP4, waveform, contact sheet)
│   ├── codex-app/              38 s OpenAI Codex App promo
│   ├── v0-generative-ui/       47.5 s Vercel v0 recreation
│   ├── astra-law/              Astra for Law recreation study (work in progress)
│   ├── design-os-tutorial/     Tutorial player (the dev server's landing page)
│   ├── design-os-promo/        22 s Design OS promo
│   ├── drone-404/              Single-line drone 404 page, video and proofs/
│   ├── samples/                Gate and HyperFrames sample deliverables
│   └── shared/                 HyperFrames engine copies and the studio runner stylesheet
├── src/                        Runtime, primitives, IR compiler, React/Three.js components
├── scripts/                    Exporters, capture tools, gates, line-art pipeline tools
├── tests/                      node --test suites (motion intent, pipeline, IR, server safety)
├── schemas/                    Motion IR JSON schema
├── fixtures/                   Motion IR fixtures used by tests
├── examples/                   Small standalone motion examples
├── research/                   Source evidence per case (references, traces, keyframes)
├── plans/                      cases/ (build records), reports/, journals/, roadmap
├── docs/                       GitHub Pages site
│   ├── architecture/           System and engine architecture
│   ├── pipelines/              Normative pipeline contracts
│   ├── reference/              Motion IR, gates, toolchain, capability notes, showcases
│   ├── cases/                  Per-project contracts and deconstruction assets
│   └── promo/                  Published mirror of promo/ (old flat URLs redirect)
├── knowledge/                  Research knowledge base and technique notes
├── skills/                     Portable agent skills
└── playground/                 Toolchain probe
```

## Quality gates

| Check | Command | Guards |
| :--- | :--- | :--- |
| Tests | `npm test` | Loop seamlessness, motion intent, flight envelope, scaffold, Motion IR, server path safety |
| Types | `npx tsc --noEmit` | Strict TypeScript |
| Anti-flop | `python3 scripts/anti-flop-gate.py` | Gates 0–9: designer skill, Phosphor icons and zero emoji, typography, depth, reduced motion and ARIA, determinism and IR validity, cursor concentricity, multi-aspect safe zones, decoupled motion, studio player standard |
| Pages mirrors | `node scripts/sync-line-art-pages.mjs --case drone-404 --check`, `npm run verify:astra-pages` | Published copies match their sources and imports are self-contained |
| Line-art fidelity | `node scripts/render-drone-404-deliverable.mjs --case <case>` | Ink recall and precision of at least 98% against the reference |

A passing gate is a technical claim. Visual acceptance of a recreation belongs to its owner.

## FAQ

<details>
<summary>What is Design OS SVG Animation?</summary>

A repository of deterministic SVG and DOM animation tooling, browser players and exporters that lets AI coding agents build motion scenes and export them as 1080p 60 fps video from one seekable virtual clock.
</details>

<details>
<summary>How do I install it?</summary>

Clone the repository, run `npm install`, then `npm run dev` to serve the players on `http://127.0.0.1:4323`. Chrome and FFmpeg are needed only for capture and video export.
</details>

<details>
<summary>How is it different from Lottie, After Effects or Remotion?</summary>

It is code-first and agent-first: timelines are pure functions of time, gated by tests and quality checks, and exported frame by frame. For hand-authored timeline motion, After Effects plus Lottie is the better tool.
</details>

<details>
<summary>Does it send telemetry or need a cloud service?</summary>

No. Everything runs locally on a loopback dev server, and nothing is sent anywhere.
</details>

<details>
<summary>What license is it released under?</summary>

MIT.
</details>

## Design OS ecosystem

- [design-os](https://jangtrinh.github.io/design-os/): the CLI and workflow automation.
- [design-os-figma-plugin](https://jangtrinh.github.io/design-os-figma-plugin/): a live Figma canvas bridge.
- [design-os-3d-blender](https://jangtrinh.github.io/design-os-3d-blender/): worked 3D builds with a Three.js CAD viewer.
- [design-os-drone-showcase](https://jangtrinh.github.io/design-os-drone-showcase/): a 249 g indoor drone and its hardware teardown.
- [design-os-pedagogy](https://jangtrinh.github.io/design-os-pedagogy/): the agent teacher curriculum.

## Read next

- [Architecture overview](docs/architecture/architecture-overview.md)
- [Motion video recreation contract](docs/pipelines/motion-video-recreation-pipeline.md)
- [Line art to motion pipeline](docs/pipelines/line-art-to-motion-pipeline.md)
- [Quality and safety gates](docs/reference/quality-and-safety-gates.md)
- [License](LICENSE)
