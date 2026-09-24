# Reference Video Recreation Contract (v2 / HyperFrames)

**Authority:** This is the entry point and acceptance contract for recreating a reference video in this repository. Read it before editing a scene. The [workflow guide](motion-video-recreation-workflow-guide.md) explains failures that led to these rules; it does not override them. The live schema, runtime, scripts, and tests own implementation details. A reference is the visual oracle; no document, preset, or self-assigned score can replace it.

**Goal:** Produce an inspectable, deterministic recreation whose exported video has been compared to the source across scenes *and transitions*. “100%” is an aspiration, not a measured result or a claim the pipeline can guarantee. Report what was compared, what differs, and what the owner accepted.

## 0. Start a session

1. Read `AGENTS.md`, `.project-agent.md` if present, this contract, `skills/product-designer/SKILL.md`, and `skills/motion-video-recreation/SKILL.md`. The Product Designer consultation is mandatory before scene, animation, or UI work. Read the active case plan/scene ledger and inspect `git status` in the **actual worktree** before editing. Preserve existing uncommitted work.
2. Locate the source and latest export, inspect their metadata and hashes, then open the latest proof and unresolved gap list. A browser preview is not evidence of the encoded video. If the reference is inaccessible, record that as a blocker to visual parity claims.
3. State the outcome, deliverable, scope, source of truth, owner decisions, acceptance checks, and next observable action. Reuse accepted decisions; ask only when an owner choice materially changes the deliverable or asset policy.
4. Work on the highest-impact open scene or transition. After the last edit, regenerate proof/export and review the *new* encoded output. Leave a handoff using §9 before switching sessions.

The [Astra for Law plan](../plans/astra-for-law-recreation.md) and [temporal audit](../plans/astra-law-temporal-audit.md) are a case record, not universal timing defaults.

## 1. Vocabulary and evidence authority

- **Source frame:** an exact frame index in the reference at its native frame rate. Record time as a convenience; frame index is the anchor. Scene intervals are `[start_frame, end_frame)` so neighboring scenes do not double-count a frame.
- **Variable frame rate:** if timestamps are not evenly spaced, retain each frame's presentation timestamp (PTS) beside its index. Compare by displayed time; never infer frame time solely from `index / nominal_fps`.
- **Observed / inferred / unknown:** label every important motion and asset claim. *Observed* has frame or playback evidence; *inferred* is a plausible reconstruction; *unknown* has no sufficient evidence. Never turn inference into measured fact in a later handoff.
- **Engineering pass:** deterministic seek, render, codec, accessibility, and repo gates passed. It does **not** mean visual parity.
- **Visual pass:** compared source and **final encoded output** at full size and in motion, with all material gaps resolved or expressly accepted by the owner.
- **Stand-in:** an intentionally substituted asset. It must be genuine and sourced according to repository rules; mark it as a stand-in. For Astra, the owner explicitly allowed arbitrary SVGL partner logos because exact marks were unreadable. That decision does not imply exact identity match.

Evidence order: source video + indexed frames → scene/transition ledger → HyperFrames draft and Motion IR → browser proof → encoded output proof → independent review → owner acceptance. A technical green check cannot overrule a visible mismatch or owner feedback.

## 2. Intake contract — required before implementation

Record in the case plan or a linked ledger:

| Field | Required evidence |
| --- | --- |
| Reference | Stable URL or local path, whether retrievable, local immutable copy when available, SHA-256, rights/usage boundary. Keep private source media out of public commits. |
| Media | `ffprobe` duration, video dimensions, frame rate, frame count or measured end frame, audio streams. Do not assume 60 fps, 16:9, fonts, or silent audio. |
| Output | Target dimensions, frame rate, duration tolerance, format/codecs, audio handling, preview URL/file, export path. Distinguish source properties from output choices. |
| Assets | For every visible mark/font/icon/illustration: exact source, approved stand-in, or unknown. Brand marks from [SVGL](https://svgl.app/); UI icons from Phosphor/Lucide per `AGENTS.md`. |
| Decisions | Owner choices and exceptions, dated and linked to the message or plan entry; current unresolved questions. |
| Comparison | Source frames and playback access, local proof destination, final MP4 access, reviewer, and acceptance state. |

**Stop condition:** if the source cannot be viewed at sufficient resolution, you may prototype and validate engineering, but must label visual fidelity **unverified**. Do not invent shot timing from a thumbnail, scene detector, or memory.

Run from the active worktree, substituting the actual local source path. Keep the source and extracted frames in ignored/private storage:

```bash
mkdir -p "$PRIVATE_FRAMES_DIR"
ffprobe -v error -show_entries format=duration -show_entries stream=index,codec_type,width,height,r_frame_rate,avg_frame_rate,nb_frames -of json "$REFERENCE_VIDEO"
shasum -a 256 "$REFERENCE_VIDEO"
ffprobe -v error -select_streams v:0 -show_entries frame=best_effort_timestamp_time -of csv=p=0 "$REFERENCE_VIDEO" > "$PRIVATE_FRAMES_DIR/frame-pts.txt"
ffmpeg -v error -i "$REFERENCE_VIDEO" -map 0:v:0 -fps_mode passthrough "$PRIVATE_FRAMES_DIR/frame-%06d.png"
```

Create the contact sheet from these **indexed** frames and record the mapping if the capture tool renumbers or drops frames. These commands are examples, not permission to check private frames into Git. `REFERENCE_VIDEO` and `PRIVATE_FRAMES_DIR` are task-specific paths chosen by the operator.

## 3. Scene and transition ledger — required before polishing

Create one row per meaningful visual state, including internal states within a long “scene”. The case plan may contain the ledger; do not create a duplicate authority. Use this record shape (Markdown/YAML is fine; this is **not** the Motion IR schema):

```text
id: firm-tiles-enter
range: [start_frame, end_frame) ; reference_fps: ...
source_evidence: frame indices / contact-sheet paths / playback time range
confidence: OBSERVED | INFERRED | UNKNOWN (per claim)
composition: background, text copy, font evidence, bounding boxes/anchors, color samples
objects: identity, starting/ending geometry, depth/order, opacity, shape and provenance
camera: position/scale/rotation/crop/defocus at sampled frames; fixed overlays
micro_interactions: cursor path, hover, click, response, stagger, overshoot, pauses
transition_in: outgoing layer, incoming layer, matte/iris/wipe/defocus/camera move,
               overlap interval, object carried across boundary, continuity anchor
transition_out: same fields for next boundary
hyperframes: beat kind, timing preset(s), source-specific tracks and exceptions
motion_ir: path to valid scene/geometry definition when vector animation applies
proof: browser frames + final encoded frames + playback review notes
status: SPECIFIED | DRAFTED | REVIEW_READY | ACCEPTED ; open gaps
```

For each boundary, capture source **before, during, and after**. Sample tightly around the change (about 0.1 s where frame rate permits) and sample scene interiors (about 0.3–0.6 s as needed). These are review sampling heuristics, not animation defaults. Automatic hard-cut detection only proposes boundaries: soft masks, continuous camera motion, shared objects, and typography replacement can evade it. Inspect the full video at 1× and difficult passages at 0.25×.

**Transition invariant:** the first rendered state after a boundary must be continuous with the last state before it unless the source visibly cuts. Specify the outgoing and incoming layers and any shared object. A uniform parent fade, fixed rise, or generic crossfade is prohibited as a fallback when the source uses a different transition. Match order, occlusion, acceleration, and camera crop. Preserve source states that happen between selected stills.

**Example from the Astra case:** the “Into ChatGPT for Your Firm” passage has a rising title and a diagonal stream of partner tiles, with changing tile colors, stagger, scaling and cursor response. A simple horizontal group translation plus binary tile visibility showed the right objects in isolated stills but failed in motion. The [case audit](../plans/astra-law-temporal-audit.md) records the actual source observations. Do not copy its times or curves into other projects.

## 4. Authoring contract — HyperFrames v2 and Motion IR

1. **Stage in HyperFrames first.** Map each state to a supported beat from `src/runtime/hyperframes-engine.mjs`; author the finite paused draft and review composition, timing, camera, and transition continuity before dressing. See `promo/astra-law-hyperframes-draft.html` for one case, not a universal template. The canonical beat list lives in the engine; tests verify its mirrored standalone copies.
2. **Use the timing presets deliberately.** `src/runtime/hyperframes-motion-presets.mjs` exposes pure sampling functions for progress, stagger, carry and keyframes. Record which preset drives each track. Presets provide reproducible timing vocabulary; they are not evidence that the source used that easing. Source-specific keyframes/camera tracks can refine the preset to observed motion. Never mark “HyperFrames used” merely because the runtime file exists.
3. **Use Motion IR for vector motion.** Validate against `schemas/motion-ir.schema.json`; `promo/astra-law.motion.json` is a real case instance. Do not copy example JSON from prose into production without schema validation. LLMs specify intent and constraints; deterministic geometry tooling handles SVG paths, morph alignment and transform flattening. Do not generate arbitrary raw path animation directly.
4. **Single virtual clock.** Every visible state, including cursor, particles and micro interactions, must be a pure function of requested time or a finite seekable timeline. Test seek order A→B→A, direct seeks, and reverse seeks; the same time must paint the same frame. Avoid unbounded child loops. Await paint/fonts/assets before screenshot capture.
5. **Scene craft.** Follow Product Designer skill and repo vector/icon rules. Animate `transform` and `opacity` first. If animating layout size is necessary to keep text or a logo sharp during scale, document and verify that exception in the scene ledger. Keep camera-world transforms separate from fixed overlays. Provide `prefers-reduced-motion` behavior that preserves readable content.

The source determines colors, easing, asset scale, frame rate and motion language. Do not apply a fixed dark theme, generic glossy buttons, universal 60 ms stagger, or a favorite spring to every reference.

## 5. Stage exits and hard fail conditions

| Stage | Required exit evidence | Fail / return to stage |
| --- | --- | --- |
| 1. Ingest | Intake record, metadata/hash, accessible source, indexed contact sheets and audio notes where audio matters. | Source missing/unreadable; guessed fps/duration; private media copied into release tree. |
| 2. Deconstruct | Complete state ledger and transition map; source frame anchors; observed/inferred/unknown tags; asset provenance. | Only hard cuts mapped; major source states skipped; no outgoing/incoming transition contract. |
| 3. Draft | HyperFrames beat mapping and paused seekable draft; full timeline scrub and boundary strips. | Beat kind chosen only by name; no preset actually sampled; generic fades hide discontinuities. |
| 4. Dress | Motion IR validity where used, authentic assets or declared stand-ins, camera/micro tracks, crisp full-size render, reduced-motion state. | Invented logo presented as exact; raw path animation; blurry scale; unreadable text. |
| 5. Verify | Browser proof **and newly encoded output** compared with reference at exact indices and in playback; issues logged; technical gates pass. | Self-score only; one still per scene; stale MP4; code export passed but visual gap remains. |
| 6. Deliver | Export decodes, media metadata checked, artifact hash recorded, report of accepted/open gaps, owner acceptance for visual claim or publication. | “100%”/“production ready” without owner review; unverified source audio/rights; unresolved severe mismatch. |

A stage can be revisited. Local export and proof generation are reversible work and should run before requesting visual acceptance. Publication, external delivery and private-source redistribution require their own authorization and project workflow.

## 6. Verification contract

For **every state** compare source and output at entrance, representative interior, and exit. For **every transition** compare a dense before/during/after strip and watch continuously at 0.25× and 1×. Use the same viewport and aspect ratio; inspect full-size frames for typography, crop, icon accuracy and blur. Compare position, apparent scale, color, z-order, camera, acceleration, micro interaction, audio synchronization, and carried objects. A contact sheet finds problems; playback decides whether motion works.

Record each discrepancy as:

```text
id / severity: BLOCKER | MAJOR | MINOR
source: frame indices and reference evidence
output: encoded-frame indices and artifact hash
observed delta: concrete position/shape/timing/camera/copy/motion difference
cause hypothesis: INFERRED or UNKNOWN until tested
fix owner + acceptance check: exact frames and playback segment to rerun
resolution: fixed with proof | owner accepted | open
```

Use independent review for material visual changes. A lower-cost reviewer may inspect frame pairs and report timestamped observations, but must separate observation from inference and unknowns. The controller checks each claim against the full-size source/output before editing. The reviewer must not grade its own implementation. Pixel-error scores and hand-written percentage scorecards are useful only for regression triage; they are not a similarity verdict. Owner feedback such as “20%” is feedback, not a computed measurement.

Run existing project gates after the **last mutation**, record commands and exit codes, and inspect outputs, not merely worker status. `npm run audit:all`, `python3 scripts/anti-flop-gate.py`, relevant tests/build, and `git diff --check` check technical contracts; none prove visual parity. Decode the MP4 with FFmpeg and inspect its metadata. If any gate fails, state the failure and the next fix; do not silently waive it.

For the current exported file, a minimum media check is:

```bash
ffprobe -v error -show_entries format=duration -show_entries stream=codec_name,codec_type,width,height,r_frame_rate,nb_frames -of json "$OUTPUT_VIDEO"
ffmpeg -v error -i "$OUTPUT_VIDEO" -f null -
shasum -a 256 "$OUTPUT_VIDEO"
```

Check the resulting duration, dimensions, frame rate, audio policy, and frame count against the **intake record**. A successful decode proves media integrity only; complete the source/output visual review before reporting `REVIEW_READY`.

### Astra case: executable references

These are current case-specific owners; check `--help`/source before reusing flags in another project:

- `scripts/detect-scene-cuts.mjs`, `scripts/extract-audio-waveform.mjs`: ingestion aids, not a complete transition oracle.
- `scripts/export-astra-law-video.mjs --verify` and `--proof`: browser scene/seek checks and browser proof frames. Run the exporter without these flags after code edits; then separately decode and inspect the **encoded** `.cache/astra-for-law/astra-law-recreation.mp4`.
- `scripts/astra-law-capture.mjs`: capture waits for painting after seek.
- `scripts/compare-astra-law-reference.py`: aligned source/browser-proof frame boards for inspection. It does not substitute for decoding and comparing the final MP4; numeric pixel error is not visual acceptance.
- `tests/hyperframes.test.mjs`: beat/preset/mirror and Astra mapping checks.

## 7. Acceptance states — report exactly one

- **ENGINEERING_READY:** implementation/export and technical gates pass; source comparison may be incomplete. Say which comparisons remain.
- **REVIEW_READY:** final encoded output has been compared scene by scene and transition by transition; all gaps are listed with evidence for owner decision.
- **VISUALLY_ACCEPTED:** owner has reviewed the current artifact/hash and accepted its remaining documented differences. Do not infer this from silence or from technical gates.
- **PUBLISHABLE:** visual acceptance plus rights, asset provenance, audio, release checks and explicit publication authorization are satisfied.

If a major mismatch remains, say “open” and name the next scene/transition. Do not report an unsupported numeric fidelity percentage or promise 99–100% parity.

## 8. Minimum review report

A report handed to another agent or the owner must include: source and export identity/hash; compared frame ranges and playback segments; what matches; ranked gaps with frame evidence; asset stand-ins and unknowns; exact technical commands/results after the last edit; acceptance state; next bounded action. Screenshots alone are not sufficient for a motion judgment.

## 9. Cross-session handoff contract

Before stopping, write or update the case plan/handoff with:

1. Worktree path, branch, `git status`, modified files, and any concurrent work ownership; do not imply another checkout contains the same edits.
2. Source URL/local private path, metadata/hash, final export path/hash, proof paths, and whether the export predates any code changes.
3. Owner decisions, non-goals, asset substitutions and approval state; preserve their provenance.
4. Ledger status by scene/transition, latest verified evidence, ranked open gaps, FACT/INFERENCE/UNKNOWN labels.
5. Exact post-edit commands and exit results, review method, acceptance state, and **one next executable action**.

A fresh session reads this contract and the handoff, verifies paths/hashes/status against the workspace, then continues at the named gap. If evidence is missing, reacquire it rather than filling the gap from memory.
