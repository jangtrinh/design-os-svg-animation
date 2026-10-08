# Hairline vise review evidence

Review date: 2026-10-08. Targets were not edited.

- `node scripts/create-hairline-figure.mjs validate playground/vise.html`: exit 0. Kernel and bench intact.
- In-memory negative control adding `fill: red` to the figure: rejected by paint check.
- `node plans/reports/hairline-vise-review/probe.cjs`: exit 0. Probe uses current embedded kernel and current figure with a fake SVG DOM and substituted register/pointer callbacks. It proves geometry/state calculations, not browser rendering, event dispatch, offscreen behavior or performance. Results in probe.json.
- `npx tsc --noEmit`: exit 0. Playground JavaScript is outside tsconfig coverage.
- `npm test`: exit 0, 40/40. Existing tests do not cover the vise.
- `python3 scripts/anti-flop-gate.py`: exit 1 at Gate 6, cannot bind 127.0.0.1:4323 (EPERM). Earlier gate output is not vise-specific acceptance.
- Fresh visual capture NOT VERIFIED: dev server bind denied (EPERM), headless Chrome launch failed; IAB unavailable; Chrome connector request-header policy failed.
- Existing browser screenshots copied into verify-pngs/prior-rest.png and prior-active.png from /Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2/. Both were visually inspected. They are historical evidence with no verified source hash, not fresh render proof.
- JEV: installed CLI inspected, status checked; no connected CDP session. Browser actions/model judgment NOT RUN.
- Laya MLX: installed project README and JEV adapter status inspected. Inference NOT RUN: typed-text classification would not establish the missing reference/visual comparison; numerical findings were checked deterministically.
- Generic ui/slop/accessibility browser gates and responsive/reduced-motion browser screenshots NOT RUN. Scope is implementation review, not production approval.
- Original reference drawing and alternative sol 6.1 implementation were not located. Architecture comparison is hypothetical; no model quality ranking established.

Design authority: requested Hairline rules and the installed hairline-create/rules.md control this surface. Generic Product Designer shadows/glass styling would violate Hairline's stroke-only contract and were not used as desired changes. Literal machining facets and Hairline's rounded-corner requirement need an explicit representation choice before revisions.
