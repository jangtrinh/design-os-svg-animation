# Full project review — 2026-09-25

Scope: read-only review of the working tree (HEAD 6b09d56 + uncommitted changes). No code changed.

## Gate results (run this session)
- `npx tsc --noEmit` → exit 0 (note: `.mjs`/`.js` not type-checked; no `allowJs`)
- `python3 scripts/anti-flop-gate.py` → all 9 gates PASS, exit 0
- `node --test tests/motion-ir.test.mjs` → 16/16 pass
- `motion-preflight-guard.py`, `audit-cursor-click-hotspots.mjs` → pass

## Do now (ranked)
1. **Path traversal + LAN exposure in `scripts/dev-server.mjs`** — `resolveFilePath` does `path.join(ROOT_DIR, urlPath)` with no containment check; `server.listen(PORT)` binds all interfaces; CORS `*`. `path.join('/R/promo','/../../../etc/passwd')` → `/etc/passwd` (verified). Same pattern in `scripts/audit-cursor-click-hotspots.mjs:60`. Fix: decode, `path.resolve`, reject if not under root; `listen(PORT, '127.0.0.1')`.
2. **Port contract violated** — no `.project-agent.md`; ports 3033 (dev/export/proofs) and 3036 (capture-marketing-proof) not in `~/.config/project-localhost-ports.json` and outside 4100–4999. Hardcoded in ~8 scripts. Fix: allocate one port, register, centralize in one module.
3. **Tests not wired** — no `npm test` script; CI (`.github/workflows/ci.yml`) runs anti-flop + build only. The 16 IR validator tests never run in CI.
4. **Uncommitted schema v0.2.0** — adds `viewport`, `camera`, `parameterBindings`, `hotspots`; no 0.2.0 fixture, no test, validator semantic checks ignore new fields (e.g. hotspot `targetElement` not bound to a node).
5. **Dependency hygiene** — unused: `three`, `@react-three/fiber`, `@react-three/drei`, `flubber`, `paper`, `@phosphor-icons/core` (0 imports). `lucide-react` used in 10 components → conflicts with CLAUDE.md "Official Phosphor vectors only". `svgo` declared twice (`^3.3.2` deps, `4.0.0` dev). `react` used but undeclared. `main: dist/index.js` points to nothing.

## Later
6. Duplication: `promo/hyperframes-engine.mjs` identical to `src/runtime/hyperframes-engine.mjs`; 4 MP4s duplicated in `promo/` and `docs/promo/` (~29 MB each set); `.git` = 78 MB → consider Git LFS or a single source.
7. Size: `promo/claude-design-engine.js` 1275 lines, `v0-generative-ui-engine.js` 820, `codex-app-engine.js` 764, 3 TSX >400; `docs/system-architecture.md` 1927 lines (> docs.maxLoc 800).
8. Gate strength: Gate 1/9 mostly string-presence checks (`"updateViewportScale" in content`) — pass even if logic breaks. Capture scripts hardcode macOS Chrome path (only hotspot audit reads `CHROME_BIN`).
9. ~25 untracked files (player, primitives, recipes, tutorial promo) — large uncommitted surface.

## Unresolved questions
- How Gate 6 launches Chrome on ubuntu CI with a macOS default path (CI run 35961123803 shows it passed) — not verified.
- Is `lucide-react` intentional for React showcase components, or should they migrate to Phosphor?
- Which port should the project own?

## Follow-up — fixes applied (same day)
Owner chose: fix 1, 3, 4, 5; allocate new port; migrate icons to Phosphor.

- **1 fixed**: `scripts/local-server-config.mjs` (`resolvePathInsideRoot`) used by dev-server, hotspot audit, marketing proof server; all bind `127.0.0.1`; dev-server CORS limited to own origin. Live curl: `/../../etc/passwd`, `%2e%2e`, `..%2f`, `%ZZ` → 404; normal pages 200.
- **Port**: 4323 registered in `~/.config/project-localhost-ports.json` (backup `.bak-260925`) + `.project-agent.md`; 15 scripts/docs switched off 3033/3035/3036.
- **3 fixed**: `npm test` (`node --test tests/*.test.mjs`) + CI step "Run Unit Tests".
- **4 fixed**: fixture `fixtures/hotspot-camera.motion.json`, 16 new tests; schema objects closed (`additionalProperties: false`, `viewport.aspect` required, non-empty hotspot id); validator: 0.2.0-only fields rejected on 0.1.0, duplicate hotspot id, unbound `targetElement`, center outside viewBox; `MotionIR` TS type extended.
- **5 corrected**: original claim was WRONG for `three`/`@react-three/*` (used, double-quoted imports missed by grep), `paper`/`flubber` (used by `playground/toolchain-probe.mjs`), `@phosphor-icons/core` (documented vector source in recreation contracts) — all kept. Actual changes: `svgo` dev-only (4.0.0, already the installed version), `react` declared, `lucide-react` removed, `@phosphor-icons/react` added.
- **Icons**: 39 icons across 10 components → Phosphor regular. Evidence: `visuals/260925-icon-mapping-lucide-to-phosphor.png`, `visuals/260925-components-after-icon-swap-{1440,768,375}.png` (SSR render, no horizontal overflow).
- Gates after last edit: tsc 0 errors · `npm test` 38/38 · anti-flop 10/10 gates exit 0 · preflight guard exit 0.

Still open: Lucide still listed as allowed in `skills/product-designer/SKILL.md:60` and `scripts/anti-flop-gate.py:111` (contradicts CLAUDE.md "Phosphor only"); `FlashStashPhotobooth` keeps `rotate-45` on PushPin (Phosphor pin already diagonal → now near-vertical); dev-server Range header not validated (malformed range → stream error).
