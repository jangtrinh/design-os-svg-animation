# CK-001 tutorial: evidence inventory + storyboard (10 chapters, 276 s)

Repo (READ-ONLY): `design-os-3d-blender` (sibling checkout) (R). Build: `R/builds/reference-keyboard` (B).
Public: https://github.com/jangtrinh/design-os-3d-blender ; https://jangtrinh.github.io/design-os-3d-blender/reviews/ck-001/r02/
Scratch: `/private/tmp/claude-501/-Users-jang-Products-design-os-3d-blender/af52bebf-e56f-409e-a270-bc8e12565e3e/scratchpad/ck001-tutorial/` (S).
Repo untouched (git status shows only the pre-existing untracked set; nothing written under R).

## Not verified / caveats FIRST
- Rerun used CURRENT working-tree scripts (dirty: `scripts/production_gate/report.py` modified; untracked `production_gate/collision.py|connectivity.py|mating.py`). Rerun gate reports checker 1.0.2; the recorded B03 gate says 1.0.1. Rerun scene sha (`1a5d64d6...`) != recorded (`e4c54bb1...`, geometry stage) — .blend bytes are not deterministic. Never show rerun hashes as the delivered hashes.
- Public checkout has NO `runs/`, `delivery/` (B/README.md:3-8). Local R has them; on-screen paths to runs/ are local-only. Public equivalents: `docs/reviews/ck-001/r02/` (jpg stills, mp4, reports, reference/).
- Gate = 8 representative families, not all 781 meshes (B/README.md:53-56). Roundtrip = sampled frames 1/7/60, not Hausdorff proof. Only 4 MP4 frames human-viewed (runs/reference-review-B01/final-media-review.json).
- pass-B-fullhd NOT rerun (≈609 s per lessons doc; not re-measured). pass-09 NOT rerun (legacy).
- Deleted per brief: geometry-B01/B02, verification-B02, geometry-r03, verification-r02, geometry-B03 checkpoints. Cited runs below exist locally (checked by file listing): geometry-B03 (model.blend, gate), presentation-B03, verification-B03, fullhd-B02, reference-review-B01.

## Chapter list (outline kept; no change needed)
| # | Chapter | s |
|---|---|---|
| 1 | Input references | 22 |
| 2 | Purpose + contract | 28 |
| 3 | Layout pass | 22 |
| 4 | Geometry passes | 30 |
| 5 | Form gate | 30 |
| 6 | Interfaces and fit | 34 |
| 7 | Presentation | 28 |
| 8 | Export and reopen | 24 |
| 9 | Delivery + honest limits | 26 |
| 10 | Lessons + try it | 32 |
Total 276 s.

---
## Ch1 Input references (22 s)
**Claim:** photo = visual authority, blueprint = dimensional input; neither is a vendor drawing.
**Evidence**
- `B/state.md:38-40`:
```
User supplied a perspective photo, blueprint, 360-degree sheet and parts catalog. The photo
is the visual authority; explicit dimensions on the blueprint are dimensional
input. These are design references, not verified vendor manufacturing drawings.
```
- `B/state.md:47-51` (conflict kept, not hidden): `Blueprint maximum height is inconsistent (32 mm front/table, / 41 mm side). The later parts catalog repeats 32 mm ... The older 41 mm dimension remains recorded as a reference conflict.`
- `B/runs/reference-review-B01/references.json`: photo sha256 `808901aae162bfda8a0fd7fca7d7b50e1c4584fe0b6dcd0f24aa6ca60ca21817`, blueprint `a2f2a01b95243e913f3eae8e9632c165364a31bc7f2c3b51781f2c28e4f1e030`; provenance says hash identifies local bytes, not upload transport/vendor certification.
**Assets** (public copies, `R/docs/reviews/ck-001/r02/reference/`): `original-work-louder.png` 2048x1534 (photo); `blueprint-rev01.png` 1536x1024 (seen: shows 284.0, 92.0, 41.0 side, 32.0 front, key 14.0, switch 15.6/11.0, 9.5, Ø16.0/18.0); `360-product-view.png` 1536x1024; `parts-catalog-rev01.png` 1223x1286.
**VI:** "Ảnh quyết định hình dáng. Bản vẽ quyết định kích thước." **EN:** The photo rules the look; the blueprint rules the dimensions.
**New visual:** split screen photo | blueprint crop with 284.0 / 92.0 / 32.0 vs 41.0 callouts (crop from existing PNGs; no render).

## Ch2 Purpose + contract (28 s)
**Claim:** numbers are written down before any geometry exists.
**Evidence**
- `B/interfaces.json:4`: `"purpose": "both; digital prototype with physical qualification pending"`; `B/state.md:45` `purpose: assumed both (owner requested a production-grade workflow demonstration)`.
- `B/layout.json:4-8,15,18,41` (verbatim keys): `"width_mm": 284, "depth_mm": 92, "height_options_mm": [32,41], "height_mm": 32, "height_status": "catalog-latest-design-envelope"`, `"key_height_mm": 9.5`, `"key_travel_mm": 3.0`, `"knob_diameter_mm":16`.
- `B/spec-B.json:5-9,13-23`: `"print_volume_mm": [320,200,100]`, RK_BASE `"target_dims_mm": [284,92,4], "tol_mm": 0.05, "min_wall_mm": 1.2, "expected_shells": 1`.
- `B/spec-B.json:288-296` required_checks: non_manifold_edges, non_contiguous_edges, zero_area_faces, bbox_dims_mm, signed_volume_positive, scale_applied, wall_thickness_screen.
- Rule: `R/AGENTS.md:18-19` (step 0 contract before detail; 0b ask purpose). Spec families in spec-B: RK_BASE, RK_DIFFUSER, RK_MAIN_PLATE, RK_KEY_00, RK_KEY_41, RK_KNOB_1, RK_FOOT_0, RK_GUIDE_SLEEVE_0.
**Assets:** none needed; typographic JSON.
**VI:** "Hợp đồng trước: 284 × 92 × 32 mm, 58 phím, mục đích: cả hai." **EN:** Contract first: 284 x 92 x 32 mm, 58 keys, purpose both.
**New visual:** animated JSON highlight (motion graphic only).

## Ch3 Layout pass (22 s)
**Claim:** XY blockout first; unresolved Z is not acceptance.
**Evidence**
- `B/pass-01-layout.py:1` docstring `"""XY layout blockout only; unresolved final Z is not manufacturing acceptance."""`; lines 18-21 `g.assign(g.slab('RK_BASE',.284,.092,.004,0,.003),m['silver'])` ...
- AGENT_OK (rerun today, S/out/p01.log:4): `AGENT_OK {"error": null, "postconditions": {"depth_mm": 92, "keys": 58, "knobs": 5, "width_mm": 284}, "step": "reference-keyboard-layout"}`; same line recorded at `B/runs/layout-r01/steps/layout/attempt-0001/stdout.log:4`.
**Assets:** S/ck001-tutorial/repo/builds/reference-keyboard/out/p01/hero.png and top.png (512x384, viewed: grey blockout, 5 cylinders, wide spacebar).
**VI:** "Bố cục trước: chỉ mặt phẳng XY, chưa chi tiết." **EN:** Layout pass: XY blockout only.
**New visual:** re-render hero/top at 1920x1080 (pass-01 takes 2.5 s; needs `studio.capture` resolution override in a scratch wrapper).

## Ch4 Geometry passes (30 s)
**Claim:** every pass is one file ending in a numeric postcondition; success is read from the sentinel line.
**Evidence**
- `B/pass-02-geometry.py:59-60`: `emit_ok('reference-keyboard-geometry',keys=len(rows),knobs=5,mesh_objects=len(measurements['objects']),` / `gn_width_change_m=bpy.data.objects['RK_SWITCH_HOUSINGS']['gn_measured_width_change_m'])`.
- `B/runs/geometry-B03/steps/geometry/attempt-0001/stdout.log:135`: `AGENT_OK {"error": null, "postconditions": {"gn_width_change_m": 0.0005999952554702759, "keys": 58, "knobs": 5, "mesh_objects": 556}, "step": "reference-keyboard-geometry"}`
- Rule `R/AGENTS.md:34`: decide by last stdout line AGENT_OK/AGENT_FAIL, not "Code executed successfully".
- Build order in pass-02:23-44: chassis, spacers/screws, board supports, usb_mount, encoders, switches, keycaps (cross receiver), spacebar guides, knobs, feet.
**Assets:** NEW clay render `S/ck001-tutorial/out/geometry-stage-hero.png` (1920x1080, produced today from rerun geometry model.blend, viewed: white clay, 58 keys, 5 knobs). Final-stage comparison: `B/delivery/r02/CK-001-hero.png` (1920x1080).
**VI:** "Mỗi pass một file, kết thúc bằng một dòng AGENT_OK." **EN:** One file per pass, ending in an AGENT_OK line.
**New visual:** terminal capture of the AGENT_OK line; optional step-by-step build animation (needs new scratch script; not produced).

## Ch5 Form gate (30 s)
**Claim:** the gate checks the spec, with STL re-import, before any media.
**Evidence**
- `R/scripts/production-gate.py:3-5,12-14`: `Production gate: does this .blend satisfy its build spec?` ... `The last stdout line is always AGENT_OK <json> or AGENT_FAIL <json>.`; exit codes 0 pass / 1 requirement failed.
- `B/pass-03-gate.py:15-20` (gate call, `assert code==0,{'failed':...,'missing':...}`).
- `B/runs/geometry-B03/steps/gate/attempt-0001/stdout.log:3`: `AGENT_OK {"error": null, "postconditions": {"failed_parts": 0, "part_families": 8, "stl_files": 8}, "step": "reference-keyboard-digital-gate"}`
- gate-report.json: failed `[]`, required_checks_missing `[]`; RK_BASE bbox [284,92,4], wall_min 1.9957 mm vs limit 1.2; every part shells 1, non-manifold 0. Honest exclusions listed in report: "load capacity: not evaluated (no FEA, no coupon test)".
- Rule `R/AGENTS.md:37`: Form gate closes phase 2 before delivery media.
**Assets:** none; render JSON/terminal.
**VI:** "Cổng hình dạng: 8 họ chi tiết, 0 lỗi, đọc lại STL." **EN:** Form gate: 8 part families, 0 failures, STL re-imported.
**New visual:** terminal capture of rerun gate (S/repo/.../runs/geometry-rerun/.../stdout.log, gate 1 s).

## Ch6 Interfaces and fit (34 s)
**Claim:** receivers, guides and D shafts are real geometry, measured by evaluated-mesh predicates.
**Evidence**
- `B/interfaces.json:6-9,28,33` keycap/encoder/spacebar numbers: receiver_span 4.12, mating_cross_span 4.0, `"nominal_D_engagement": 5.0`, `"guide_offsets_x": [-11.9,11.9]`.
- `B/runs/verification-B03/steps/inspect/attempt-0001/fit-report.json`: `cells_checked: 58` (l.2092); `insertion_range_mm [3.0,3.0]` (l.2114); `ceiling_reserve_range_mm [0.2,0.2]` (l.2118); wide guides `collision_free: true`, `rest_engagement_range_mm [3.65,3.65]` (l.5967-5968); D: `pairs_checked: 5`, `matching_rotations_collision_free: true`, `negative_controls_detect_collision: true`, `engagement_range_mm [5.0,5.0]` (l.6108-6111); `travel_samples_mm [0.0,0.5,...,3.0]` (7 values); overlap `collision_pairs: 0` (l.1898).
- `B/pass-05-inspect.py:43-48` (verbatim asserts): `assert not interfaces['key_stem']['key_material_stem_collision_indices']` ... `assert interfaces['encoder_dshaft']['negative_controls_detect_collision']`.
- AGENT_OK `verification-B03/steps/inspect/attempt-0001/stdout.log:2`: `{"collision_pairs": 0, "layout_checks": 29, "meshes": 781, "sampled_key_travels": 7, "switch_cells": 58}`.
**Assets:** `B/delivery/r02/CK-001-receiver.png`, `CK-001-D-receiver.png`, `CK-001-spacebar-guides.png`, `CK-001-encoder-mount.png` (all 1920x1080; receiver viewed: cross receiver in boss).
**VI:** "58 phím × 7 vị trí hành trình: không va chạm." **EN:** 58 keys x 7 travel positions: zero collisions.
**New visual:** optional travel-sweep clip 0-3 mm (new scratch script; not produced). The fit-report is sampled, not continuous proof (limits field).

## Ch7 Presentation (28 s)
**Claim:** materials, light and motion are added only after the gate, bound to its hashes.
**Evidence**
- `B/pass-04-presentation.py:16-18`: `assert not gate['failed'] and not gate['required_checks_missing']` / `assert gate['inputs']['scene_sha256']==sha(source),'gate is bound to another scene'` / `...spec_sha256...'gate is bound to another spec'`.
- `B/runs/presentation-B03/steps/presentation/attempt-0001/stdout.log:9`: `{"drivers": 58, "legends": 58, "meshes": 781, "sampled_frames": 11, "views": 6}`.
- `B/scripts/fullhd.py:17` `SIZE=(1920,1080)`; ffprobe of mp4: 1920x1080, 24/1, 96 frames, 4.0 s. `fullhd-B02/.../stdout.log:132`: `{"frames": 96, "height": 1080, "stills": 11, "video_bytes": 1812132, "width": 1920}`.
- Render budget: `R/docs/native-build-pipeline-lessons.md:43` real render 609 s inside 2,400 s budget.
**Assets:** `B/delivery/r02/CK-001-hero.png`, `-top.png`, `-exploded.png`, `-key-detail.png`, `-knob-detail.png`, `-bottom.png`, `-usb-mount.png` (1920x1080); `CK-001-animation-FullHD.mp4` (1920x1080, 24 fps, 4 s). Public jpgs/mp4 in `docs/reviews/ck-001/r02/`.
**VI:** "Vật liệu, ánh sáng, Full HD 1920×1080, hoạt ảnh 4 giây." **EN:** Materials, light, native Full HD stills and a 4 s animation.
**New visual:** none required; reuse.

## Ch8 Export, reopen (24 s)
**Claim:** the GLB is re-imported and compared against the source scene.
**Evidence**
- `B/pass-06-export.py:31-35` settings (`'export_format':'GLB','use_selection':True,... 'export_animation_mode':'SCENE'`).
- `B/pass-07-reopen.py:11-14`: `assert result['pass'],'GLB surface/motion comparison failed; inspect glb-roundtrip.json'`.
- `verification-B03/.../reopen/.../stdout.log:728`: `{"frames": 3, "max_sample_surface_error_mm": 0.0, "mesh_names": 781}`; export `stdout.log:1457`: `{"animations": 1, "embedded_images": 1, "glb_bytes": 16614212, "meshes": 781, "source_frames": 3}`; final gate `final-gate/.../stdout.log:3`: `{"failed_parts": 0, "families": 8, "stl_files": 8}`; glb-roundtrip.json tolerances bbox/surface 0.05 mm; limits: "Sampled bidirectional distance is not a full Hausdorff proof."
**Assets:** `B/delivery/r02/CK-001-exploded.png`; CK-001.glb (public in docs/reviews).
**VI:** "Xuất GLB, mở lại: 781 mesh khớp, sai số mẫu 0,0 mm." **EN:** Export and re-import: 781 meshes match, 0.0 mm sampled error.
**New visual:** terminal capture of reopen AGENT_OK (rerun reproduced identical postconditions and glb_bytes).

## Ch9 Delivery + honest limits (26 s)
**Claim:** package is reviewed digital prototype; manufacture is BLOCKED and says why.
**Evidence**
- `B/delivery/r02/status.json:38-41`: `"media": "PASS_NATIVE_FULLHD"`, `"motion": "PASS_DECLARED_DIGITAL_SCOPE"`, `"fit": "PASS_DECLARED_DIGITAL_SCOPE"`, `"manufacture": "BLOCKED"`.
- `status.json:57+` physical_blockers (e.g. "Keycap/switch insertion, retention force, tolerance stack, wear and process shrinkage need physical coupons.").
- `delivery/r02/manifest.json`: `files` = 62 entries; scene_sha256 `de2251261c7d1c17c4150dd3cccc6e42f5a146036916d223801882c4f61c8e16`; glb `bc8c3c2f868b1052c7baa88f55d7533e2fa810dece21a0af8f39023a3633eb82`.
- `B/README.md:53-56`: 781 mesh count vs 8 gated families.
**Assets:** screenshot of `docs/reviews/ck-001/r02/review.html` or `index.html` (must capture; 11 stills + video); `B/delivery/r02/status.json`.
**VI:** "Giao hàng trung thực: gia công vẫn BỊ CHẶN." **EN:** Honest delivery: manufacture stays BLOCKED.
**New visual:** browser capture of review page + status.json overlay.

## Ch10 Lessons + try it (32 s)
**Claim:** real mistakes were caught by the loop; every intended check must run.
**Evidence**
- r01 missing interfaces: `B/README-r01-history.md:71-72`: `The keycap shell has no qualified stem receiver, and the knob's circular 6 mm bore / has no sourced D-flat or qualified retention.` Cost: `R/docs/native-build-pipeline-lessons.md:39` (second full revision; 3 geometry + 3 presentation + 3 verification + 2 Full-HD cycles).
- First gate failed and was preserved: `B/state.md:70-72` `The first completed gate failed: long-plate axial probes exceeded the checker's / fixed 200 mm ray reach, and the knob carried 12 unreferenced vertices. Those / failures are preserved.`
- Never-run pass: `lessons.md:44` `CK-001 pass-B-rotation.py | authored, reviewed into the plan, never run`; `R/AGENTS.md:121`. Today in scratch: `check-pass-coverage.py builds/reference-keyboard` printed `11 authored, 10 declared by a manifest` / `UNREFERENCED pass-B-rotation.py — authored but no manifest step runs it` / `FAIL`. Standalone scratch run of pass-B-rotation: `AGENT_OK {... "encoder_pairs": 5, "frame": 18, "max_error_mm": 0.00012624573719222099, "mesh_names": 781, "step": "reference-keyboard-rotation-roundtrip"}` (not in the project record).
- Cap/cover (C03 series): `lessons.md:40` nominal 3.0 mm sweep vs 3.0 ± 0.2 mm; 3.2 mm touched 57 caps.
- Try it: clone repo; run `python3 scripts/native-pipeline.py run builds/reference-keyboard/geometry-pipeline-B01.json --run-dir <new dir>` (new run dir required; `B/README.md:85-89`).
**Assets:** terminal captures; repo URL card.
**VI:** "Bài học từ lỗi thật. Tự chạy lại trong repo." **EN:** Lessons from real mistakes. Try it in the repo.
**New visual:** terminal capture of check-pass-coverage FAIL then rotation AGENT_OK.

---
## Re-runnability of passes (scratch only)
Method: copied R/scripts, specs schema, and B json/py/scripts into S/…/repo (1.3 MB, same relative layout). Reason: `scripts/project.py:55` `assert out.is_relative_to(BUILD)` and `:56` empty-dir assert, so output cannot go to scratch against the real build; running inside real B would write into the build, so it was NOT done. Pipelines run via `scripts/native-pipeline.py run <manifest> --run-dir <scratch>`; presentation/verification manifests hard-code `runs/geometry-B03` / `runs/presentation-B03` paths, so scratch-copy manifests (sed-replaced) point at rerun dirs.
| Pass | Result | Time | Blockers |
|---|---|---|---|
| 01 layout | RAN, AGENT_OK (keys 58, knobs 5) | 2.5 s | none; 512x384 output, needs resolution override for HD |
| 02 geometry | RAN via geometry-pipeline-B01, AGENT_OK mesh_objects 556 | 28 s | needs pipeline-supplied `inputs['project']` (standalone run fails: "at least one evidence file is required") |
| 03 gate | RAN, AGENT_OK 8 families, 8 STL | 1 s | needs artifact from 02; gate checker 1.0.2 now vs 1.0.1 recorded |
| 04 presentation | RAN, AGENT_OK drivers 58 legends 58 meshes 781 | 11 s | manifest paths hard-coded to runs/geometry-B03 |
| 05 inspect | RAN, AGENT_OK collision_pairs 0, 29 checks | within 48 s verification total | hard-coded runs/presentation-B03 |
| 08 final gate | RAN, AGENT_OK 8 families | (same) | same |
| 06 export | RAN, AGENT_OK meshes 781, glb_bytes 16614212 (= recorded) | (same) | same |
| 07 reopen | RAN, AGENT_OK frames 3, error 0.0 | (same) | needs 06 artifacts |
| 09 media (legacy r01) | NOT RUN | - | superseded by pass-B-fullhd; media-pipeline.json refs deleted verification-r02; 1024x768 + 384x288 frames; needs ffmpeg |
| B-fullhd | NOT RUN | ≈609 s (doc) | long; Metal GPU; wants rerun hashes; reuse delivered media instead |
| B-rotation | RAN standalone (synthetic inputs map) AGENT_OK | few s | not in any manifest (that is the lesson) |
Total rerun chain 01-08: ≈1.5-2 min. Outputs only under S. Rerun pass-03/05 scene hashes differ from record (caveat above).

## Numbers/claims to show (VERIFIED = seen in a file this session)
| Claim | Source | Status |
|---|---|---|
| 284 x 92 x 32 mm | layout.json:4-7; status.json contract | VERIFIED |
| 58 keys, 5 knobs | pass-01/02 AGENT_OK | VERIFIED |
| 41 mm side conflict | state.md:49-51; layout.json:6 | VERIFIED |
| key 14.0 top/9.5 high/3.0 travel | layout.json:13,15,18 | VERIFIED |
| 556 meshes (geometry) -> 781 (final) | geometry stdout:135; presentation stdout:9 | VERIFIED |
| 8 families, 0 failed, 8 STL | gate/final-gate stdout:3 | VERIFIED |
| wall 1.9957 mm RK_BASE vs 1.2 | gate-report.json | VERIFIED |
| stem insert 3.0 mm, reserve 0.2 mm | fit-report.json:2114,2118 | VERIFIED |
| spacebar rest 3.65 mm, 2 guides | fit-report:5968; README:26-27 | VERIFIED |
| D engagement 5.0 mm, 5 pairs, negative control detects | fit-report:6108-6111 | VERIFIED |
| 58 cells x 7 positions 0..3 mm, 0 collisions | fit-report:1897-1898; stdout:2 | VERIFIED |
| 29 layout checks | layout-checks.json; stdout:2 | VERIFIED |
| GLB 781 names, frames 1/7/60, 0.0 mm sampled | reopen stdout:728; glb-roundtrip.json | VERIFIED |
| 11 stills 1920x1080; 96 frames 24 fps 4 s | fullhd stdout:132; ffprobe; file | VERIFIED |
| manifest 62 files; manufacture BLOCKED | manifest.json; status.json:41 | VERIFIED |
| scene/GLB sha (de2251..., bc8c3c...) | manifest.json/status.json | VERIFIED |
| 609 s render | lessons.md:43 | VERIFIED in doc, not re-measured |
| rotation max_error 0.000126 mm at frame 18 | scratch run today | VERIFIED (scratch, not in record) |
| "Weight ~600 g", legend/logo claims | blueprint image | do NOT show (README disclaims) |
| Gate catches errors "before delivery" | general | INFERENCE |

## Produced scratch assets (S = scratchpad/ck001-tutorial)
- `S/out/geometry-stage-hero.png` (1920x1080 clay render)
- `S/repo/builds/reference-keyboard/out/p01/{hero,top}.png` (512x384)
- `S/repo/builds/reference-keyboard/runs/{geometry,presentation,verification}-rerun/` incl. presentation stills 512x384, glb, STL
- `S/repo/builds/reference-keyboard/out/rot/*.json`; logs in `S/out/*.log`

## Unresolved questions
- Show rerun (current checker 1.0.2) or recorded (1.0.1) numbers on screen? Recommend recorded, with rerun as "reproduces".
- Include Ch10 C03 cap-overtravel lesson (manufacturing series, outside r02)? Currently one line only.
- Need Full HD layout/geometry-stage stills for Ch3/Ch4 via scratch wrapper — approve a longer render?
- Public viewers cannot see runs/ paths: use docs/reviews/ck-001/r02 equivalents for on-screen file paths?

---
## Revision 2026-10-14 (owner decisions)
- Length: ~3:00 to fit the whole track "Dawn" by Alegend (177.08 s, 120 BPM measured; freetouse Free To Use, attribution required). Chapters snap to bar boundaries (2.0 s per bar).
- Ch1 must show asset preparation: from one owner photo, image generation produced the 360-degree sheet, parts catalog and blueprint as secondary references. Record wording: "Secondary sheets remain derivative design guides" (B/state.md:20); the photo stays the visual authority. Teaching point: the generated blueprint contradicts itself (41 mm side vs 32 mm front) and the contract records the conflict instead of hiding it (B/state.md:47-51).
- On-screen numbers: recorded delivery values (checker 1.0.1) with the line "chạy lại hôm nay ra cùng kết quả / re-run today, same result". On-screen paths: public `docs/reviews/ck-001/r02/`.

| # | Chapter | s |
|---|---|---|
| 0 | Title | 6 |
| 1 | Input + generated reference sheets | 22 |
| 2 | Purpose + contract | 16 |
| 3 | Layout pass | 12 |
| 4 | Geometry passes | 18 |
| 5 | Form gate | 18 |
| 6 | Interfaces and fit | 20 |
| 7 | Presentation | 16 |
| 8 | Export and reopen | 12 |
| 9 | Delivery + honest limits | 14 |
| 10 | Lessons + try it | 18 |
| 11 | Outro (repo) | 5 |
Total 177 s.

Ch1 VI: "Từ 1 ảnh, gen thêm 360°, catalog, blueprint làm tham khảo." EN: From one photo, we generated 360° views, a parts catalog and a blueprint as references.
