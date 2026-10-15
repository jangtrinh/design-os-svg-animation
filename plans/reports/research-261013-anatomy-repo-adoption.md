# Research: adopt from wheresryan22/anatomy (2026-10-13)

Source: https://github.com/wheresryan22/anatomy — MIT, 7.1k stars, JS, updated 2026-10-13. Agent skill for interactive isometric SVG figures (+ optional WebGL shaders, beta 3D turning).
NOT verified: anatomy kit chạy thật trên máy này (chỉ đọc docs + tree, chưa clone/run).

## Progress check (FACT, run 2026-10-13)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npm test` | 82/82 pass |
| `python3 scripts/anti-flop-gate.py` | exit 0 |

- 20 commits since 2026-10-06, all playground suites (math grade1, physics, chemistry, PE — 5 figures each).
- `plans/roadmap.md` Giai đoạn 2 (parser, Flubber morph, spring engine, CSS/GSAP compiler): 0/4 done.
- Figures vượt budget chính mình: `docs/hairline-solid-workflow.md` §5 = ≤150 dòng; physics figures 226–353 dòng.

## Visual gap

- Local: [local-physics-lever-current.jpg](assets/pilot/before-fig1.png) — ~10 parts, figure ~35% card, no shading tones.
- Anatomy: [anatomy-dial-indicator-reference.png](assets/anatomy-dial-indicator-reference.png) — 40–80 parts, 55–65% fill, four-tone extrude shading, card `Fig n / TITLE / hint / readout`.

## What anatomy has that we lack

| # | Asset | File (upstream) | Value for us |
|---|---|---|---|
| 1 | Geometry audit: clearance, terminals, support, depth order, stand-in shapes, mid-flight pass-through → `audit passed` exit code | `kit/audit.mjs` (93KB) | High — deterministic gate, đúng triết lý anti-flop; thay "kiểm bằng mắt" painter's order (local Rule 06) |
| 2 | Line-end check: mọi tick/seam phải kết thúc trên stroke/dot/outline, rings failures PNG | `scripts/lines.mjs` + `line-ends.mjs` | High — rẻ, độc lập kit, chạy trên HTML build |
| 3 | Core kit: camera, `extrude` 4 tones, parts library (`knurl`, `coil`, `topTicks`, `radialTicks`, label plate), card/page builder | `kit/iso-kit.mjs` (35KB) | High — thay `prism/hull/solid` tự viết lặp trong từng figure → figure ngắn lại |
| 4 | Craft doctrine: size tiers (Figure 40–80 parts / Hero / Epic), parts list trước geometry, 4× close-up check, tone hierarchy, 1 `lit` accent | `SKILL.md`, `references/craft.md` | High — chỉ là docs, merge vào hairline workflow |
| 5 | Lathe (round parts any axis), tube/pipe routing | `kit/lathe.mjs`, `kit/tube.mjs` | Medium — cần cho chemistry (distillation, burner) |
| 6 | WebGL in-drawing shaders (fire, water caustics) | `kit/gl.mjs`, `references/webgl.md` | Later — chemistry burner, ripple |
| 7 | 3D turning mode | `kit/turn*.mjs` | Skip — beta, 15–20 min audit/figure |

## Conflicts with owner decisions (stop-and-surface)

1. Source budget ≤150 dòng/figure (local) vs anatomy build 15–70KB/figure.
2. CONTEXT.md cấm "Exploded CAD Slop" vs anatomy có exploded views (`apart` pose) như tính năng chuẩn.
3. Frame cố định 400×320 (local) vs anatomy fit 55–65% card, test 390px wide.
4. Accent: local `hi` duy nhất ↔ anatomy `lit` duy nhất — tương thích, chỉ đổi tên.

## Recommendation

Phase A (~half day): vendor `scripts/lines.mjs` + craft doctrine vào `docs/hairline-solid-workflow.md`; chạy line check lên 20 figures hiện có → đo số lỗi thật.
Phase B (~1–2 days): port 1 figure (physics-lever) sang `iso-kit.mjs` + `audit.mjs`, so sánh trước/sau bằng screenshot + số dòng.
Phase C: rollout cho 20 figures nếu Phase B thắng.
Attribution: giữ MIT LICENSE header khi vendor.

## Owner decisions (2026-10-14)
- Scope: gates + pilot 1 figure.
- Budget: ≤150 dòng code riêng/figure; kit vendor ngoài budget.
- Exploded/apart: cho phép chỉ khi tháo rời là khái niệm. Ghi tại CONTEXT.md + hairline workflow §7.

## Phase A result (FACT, 2026-10-14)
- Vendored unmodified: `vendor/anatomy/scripts/{drive,chrome-port,line-ends,lines}.mjs` @ e6600ff + LICENSE.
- Adapter: `scripts/check-hairline-line-ends.mjs` (`npm run audit:line-ends`), tags Hairline `.lo/.hi` texture → `iso-line`, skips solid crease.
- Baseline 25 figures: 6 pass (math #8 #9 #10, chemistry #2 #3, pe #4), 19 fail. Worst: physics-lever 21/32 ends float, math #5–#7 6–8 floats.
- Ringed proofs: `assets/line-ends/<suite>-<n>-line-ends.png`. Spot-check physics-lever: ruler ticks floating on base (no ruler strip), groove stopping mid-plate, pointer stopping mid-face → true positives.
- NOT wired into `audit:all` yet (would fail 19 figures); wire after fixes.

## Unresolved questions
- Phase B pilot (physics-lever → iso-kit + audit.mjs): ai build? (budget mode: grok/codex)
- Sửa 19 figure fail line-ends trước hay sau pilot?
