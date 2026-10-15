# Worker report: tutorial kit + es-tutorial-video skill (phases 1-4)

Worktree: `~/Products/design-os-svg-animation-wt-tutorial` · branch `feat/tutorial-video-skill` (from origin/main a88ddf6) · not pushed, no PR.
Scratch (renders, compare scripts, logs): `/private/tmp/claude-501/-Users-jang-Products-design-os-3d-blender/af52bebf-e56f-409e-a270-bc8e12565e3e/scratchpad/tut/`
Commits (focused, conventional, trailer on each):
```
e759da8 docs: point the tutorial workflow and README at the skill and the kit
f2769b6 test(skills): cover the tutorial skill and its host bundle sync
bf7b7b3 feat(skills): add the es-tutorial-video skill
2c4b4be refactor(promo): move the tutorial engine into a shared kit
```
`git status`: clean except `plans/261015-tutorial-video-skill/` (untracked plan copy, status line edited; deliberately not committed, the main checkout has the same untracked file). 72 files changed vs origin/main. No published MP4 touched, no audio committed, no network/ElevenLabs call, `docs/index.html` and `docs/promo/**` untouched, main checkout untouched except this report.

## NOT verified / limits (first)
1. **Beat comparison is not literally 0 on every run.** Chrome is nondeterministic on both the ORIGINAL and the kit code (details in section 2). Target "0, or every difference explained" is met for every frame except one class I can only infer (section 2, class C).
2. No full-length (3 to 5 min) MP4 re-render, by instruction. Full path (mix + 3 shards + join) was exercised end to end only on a 20 s fixture film: 1920x1080, 60 fps, video 20.000 s, audio 20.000 s, `ffmpeg -v error ... -f null -` printed nothing. Real voice mix with real clips was not run (placement table `mix --check` was run on both projects, passes).
3. CI log not observed (cannot). ci.yml runs `npm test` = same glob, so the new tests run there; tests needing ffmpeg/ffprobe or Chrome self-skip when absent, so on a runner without them the A5/A6 coverage silently shrinks. Unknown whether ubuntu-latest has ffprobe.
4. `look.mjs` and the kit render load Geist from Google Fonts (the `<link>` in the original tutorial.html, kept byte-for-byte in the kit template). Skill code itself makes no network call, but M12 "no network in look" is only true for the skill's own code. L1 fails the run if the fonts did not load. Not changed (would alter rendering; out of scope).
5. Eye-checks in look.md 1-7 are the owner's/controller's; I viewed the DC-01 sheet once (all chapters render, no clipping visible), that is not an owner review.

## 1. Baseline (original code, before edits)
Run from the original code in the worktree: `node render-tutorial.mjs --aspect <a> --beats` for ck-001 and dc-01, both aspects (4 parallel). Frames saved under scratch `base/<project>-<aspect>/` (ck 91 files = b00..b89 + first, dc 190 = b000..b188 + first). Logs: `aspect=landscape bar=2.00000s duration=177.080s fonts=Geist,Geist Mono` (ck), `bar=1.77778s duration=334.269s` (dc); beat sheets `(90 frames)` / `(189 frames)`. Tracked `out/beat-sheet-*.jpg` modified by the runs were restored with `git checkout`.

## 2. Beat-sheet comparison after migration (kit)
Command per frame: `compare -metric AE -fuzz 1% <baseline> <kit> null:`; frames matched by bar index (ck baseline used 2-digit names, kit 3-digit, so 3-digit rule is applied by kit; both = same bars). Kit rendered via `build.mjs render <project> --beats --out-dir <scratch>`.

Differing frames vs baseline-1, by run (count; frame numbers):
| run | ck-001 landscape | ck-001 portrait | dc-01 landscape | dc-01 portrait |
|---|---|---|---|---|
| kit run A | 1 (59: 43 px) | 1 (59: 232 px) | 1 (152: 9 px) | 2 (140: 141 px, 141: 167 px) |
| kit run B | 0 | 0 | 0 | 2 (140, 143: 219 px) |
| kit run 1/3 (final set) | 0 | 1 (59) | 0 | 2 (140, 141) |
| kit run 2/3 | 0 | 0 | 0 | 2 |
| kit run 3/3 | 90 (class B) | 0 | 3 (140, 141, 152) | 189 (class B) |
| serial original vs serial kit | 1 (59: 43 px) | 0 | 3 (140: 142, 141: 39, 152: 9) | 0 |

Why the diffs are not from the migration (FACT = observed this session):
- **A. Single-frame flakes, 4 to 232 px of 2 Mpx.** FACT: the ORIGINAL code, run unchanged 18 times, differs from its own first run at the same frames with the same pixel counts: ck-l 59 (43 px), ck-p 59 and 58, dc-l 140 (142), 141 (39), 152 (9), 139, dc-p 140 (141), 141 (167), 142 (118). Original vs original and kit vs original show identical counts (e.g. 43/142/39/9). Frames lie in the animation/image-sequence chapters (dc 139-152 = explode/reassembly stills, crop of dc-p 140 shows diff pixels scattered over the 3D render). INFERENCE: image decode of a just-swapped sequence frame races the screenshot.
- **B. Whole-run variant (every frame differs, text pixels only).** FACT: also happens on the ORIGINAL code: orig run 2 dc-l differs on all 189 frames (9079 px at b050), one original ck-l run differs on all frames. FACT: kit run 3 ck-l is pixel-identical to an original whole-run variant on 89 of 90 frames (the 90th is frame 59, class A). The diff map of kit run 3 dc-p b050 (5711 px) covers only text (rail label, captions, mono lines), not images. INFERENCE: Chrome text anti-aliasing varies per process (not tied to code).
- **C. Unproven.** dc-p kit run 3 whole-run variant (189 frames) matched none of 18 original dc-p runs: the original dc-p never showed class B in my samples. ASSUMPTION: same mechanism as the ck-l class B above; weakest link of this section. dc-p frame 143 (219 px, kit run B) was not seen in originals either (142 was); same chapter/sequence as 140-142.
- Not "fixed" by touching baseline. No frame differs in layout, position or content; the diffs are image-decode and text-AA noise.

Evidence of equal behaviour beyond frames: `build-music-bed.py` (now config driven) reproduces DC-01's `music-bed.wav` byte-identical (`cmp` BED_IDENTICAL, source mp3 copied read-only from the main checkout); `mix-voiceover.mjs --check` placement tables both pass (dc outro slack 8.93, ck outro slack 1.34).

## 3. `node --test tests/*.test.mjs`
`# tests 123 / pass 123 / fail 0 / skipped 0` (exit 0, 2 runs after final edit). No pre-existing failures. One flake fixed on the way: example test hit `Navigation timeout of 30000 ms` under suite load, so `page.goto` got `timeout: 120000` in kit render and look (no frame change). New file: `tests/tutorial-skill.test.mjs` (33 tests) + `tests/fixtures/tutorial/good/**`.

## 4. validate
```
$ node skills/es-tutorial-video/validate.mjs promo/ck-001-tutorial
ok: 13 checks passed for .../promo/ck-001-tutorial        (exit 0)
$ node skills/es-tutorial-video/validate.mjs promo/dc-01-tutorial
ok: 13 checks passed for .../promo/dc-01-tutorial        (exit 0)
```
(includes `no-home-path` scanning assets/data/ref/staged MP4 bytes: both clean.)

## 5. look
```
$ node skills/es-tutorial-video/look.mjs promo/dc-01-tutorial          (exit 0)
sheet: ~/Products/design-os-svg-animation-wt-tutorial/promo/dc-01-tutorial/out/look/look-sheet.png (32 shots x 2 aspects ...)
L1 fonts: ok  L2 edge: ok  L3 portrait: ok  L4 caption: ok  L5 requests: ok
```
Sheet: `~/Products/design-os-svg-animation-wt-tutorial/promo/dc-01-tutorial/out/look/look-sheet.png` (3008x1408, gitignored; same for ck-001, exit 0). Negative control: a fixture with an element off-stage makes look exit 1 with `L2 edge: FAIL` (test). First run of L3 flagged a full-bleed title background (bottom 1920); I narrowed L3 to exclude full-bleed elements, nothing else changed.

## 6. scaffold
```
$ node skills/es-tutorial-video/build.mjs scaffold ~/Products/design-os-3d-blender/builds/robot-arm-original-refined robot-arm
~/Products/design-os-svg-animation-wt-tutorial/promo/robot-arm-tutorial     (exit 0)
$ node skills/es-tutorial-video/validate.mjs promo/robot-arm-tutorial                 (exit 1)
config-schema: grid.measuredBy says the bar grid is not measured yet; measure it with numpy and record how (rules.md, grid rule)
timeline-authored: nothing authored yet (0 chapters, 0 elements, 0 captions); author the timeline from concepts.md
script-authored: voiceover/script-vi.json has no segments yet; write one segment per chapter after the owner approves the storyboard
```
Scaffold deleted afterwards (`ls promo | grep -c robot-arm` = 0). Gate enforcement shown on that scaffold: `build.mjs mix` and `render --full` exit 1 with `gate: owner approval missing for storyboard + script ... No voice credit is spent before that.`

## 7. A1-A9 (tool-product profile)
| ID | Result | Evidence |
|---|---|---|
| A1 | pass | `wc -l SKILL.md` = 86 (<=120); `name: es-tutorial-video` == folder; description starts "Use when", 184 chars (<=200) |
| A2 | pass | test "SKILL.md names every sibling file and every named file exists" (green); lists rules, concepts, look, contract, build, validate, look.mjs, kit-path, templates/, examples/, ATTRIBUTION |
| A3 | pass | `node scripts/build-tutorial-contract.mjs --check` -> `contract: ok`, exit 0; test refuses an edited copy (`contract-intact`) |
| A4 | pass | examples ck-001 + dc-01: `validate` exit 0 "ok: 13 checks passed"; `build.mjs render --beats` (tests) 91/190 frames per aspect named `bNNN.jpg` + beat sheets; the full MP4 build of the two was not re-run (instruction); full path proven on the fixture film |
| A5 | pass | 14 tests, one broken fixture per check (config-schema, timeline-eval, evidence-shape, assets-exist, script-authored, script-clips x2, captions-overlap, display-block, no-home-path, gitignore-music, beat-names, timeline-authored+script-authored, contract-intact): exit 1, exactly the named line(s) |
| A6 | pass (attach is yours) | look on dc-01 exit 0, sheet PNG path in section 5 |
| A7 | pass locally | `node --test tests/*.test.mjs` 123/123 includes the skill tests; CI log not observed |
| A8 | pass | `sync-tutorial-skill-hosts.mjs --dest <tmp>` then `--check` exit 0; `diff -rq skills/es-tutorial-video <bundle>` = only `kit/` extra (by design); `diff -rq promo/_tutorial-kit <bundle>/kit` empty; drift test detects a hand edit + a deleted kit file; bundle validates a project on its own |
| A9 | pass | `ATTRIBUTION.md`: Pixabay "Technology", Free To Use "Dawn", ElevenLabs, Antigravity generator, Geist (OFL), hairline layout (MIT), tooling |

## What changed vs the plan (decisions I made)
- Kit = DC-01 copies + config loader `tutorial-project.mjs` (config schema, vm timeline loader, voice placement table, page writer, contract digest). Page is generated in a temp dir with `<base href=project>`; kit files by absolute URL; no copy of the kit into projects. `render-tutorial.mjs` also gets `--out-dir` (tests render to scratch, never into the tracked `out/`).
- Config holds `grid.bpm` (bar = 240/bpm; CK-001 bpm 120 because its timeline uses bar = 2.000 s exactly), `db0`, `measuredBy`, `duration` (T), music, timeline files, voice paths, `approvals`. CK-001 `cmd` for the `repo` element and credit fade-in time (`CREDIT_IN`, default = last chapter + 0.4 s, CK-001 sets `bar(84.2)` to keep its old timing) were the only kit-vs-CK-001 behavioural differences; both preserved.
- Gate 1 enforcement: `approvals.storyboard` / `approvals.script` must be non-null for `mix` and `render --full`; `--beats` and scaffold never need them. CK-001 and DC-01 carry `"legacy: published before the owner gates existed"` (not a real approval; the owner may prefer real names/dates). Gate 2 (merge/publish) is policy in SKILL.md + rule R7: nothing in the skill pushes, PRs or edits docs/index.html. A test greps every skill/kit script for network calls and voice API names.
- Plugin hosts need no copy: `.codex-plugin` already has `"skills": "./skills/"`, Claude/agents/factory manifests source `./`. `.claude-plugin/*` left unchanged (auto-discovery); a test asserts this. Non-plugin hosts get a generated bundle (skill + `kit/`) from `scripts/sync-tutorial-skill-hosts.mjs --host claude|codex|gemini|agents`.
- `llms.txt` and `.github/workflows/ci.yml` not edited (outside my file list): consider an llms.txt entry and `apt-get install ffmpeg` in CI.
- Pre-existing, not changed: `render-tutorial.mjs --events` calls `DOS.soundEvents()` which the tutorial page does not define (dead flag, copied as is).

Unresolved questions
- Replace the two "legacy" approval markers with real owner names/dates?
- Add ffmpeg to CI so the A5 fixtures cannot skip, and an llms.txt line for the skill?
- Vendor Geist locally so render/look need no network (would change text raster; needs its own before/after comparison)?

Status: DONE_WITH_CONCERNS
