# Motion Video Recreation: Lessons from the Astra Case

This is the **why and how-to-review** companion to the normative [v2 recreation contract](motion-video-recreation-pipeline.md). Start with that contract. The [Astra plan](../plans/astra-for-law-recreation.md) and [temporal audit](../plans/astra-law-temporal-audit.md) contain case-specific observations; source timestamps and design choices in them are not universal presets.

## 1. What failed despite green technical gates

The first Astra recreation passed player/export checks while the owner judged it roughly “20%” similar. That number was owner feedback, not a computed similarity score. A correct frame count, valid MP4, and passing anti-flop gate establish engineering health. They cannot detect an omitted word, a wrong camera crop, a weak galaxy silhouette, incorrect tile choreography, or a flat transition. Keep **technical status** and **visual acceptance** separate in every report.

A first pass sampled broad scenes but missed internal visual states. The title “Into ChatGPT for Your Firm” and five partner tiles existed; their motion was still visibly weak. Group translation and show/hide flags did not recreate the source's diagonal flow, stagger, color shifts, scale hierarchy, title rise, and cursor response. This is why the ledger records objects, camera, micro interactions, entrance, interior and exit per state, not just one screenshot per scene.

## 2. Transition inspection method

A scene detector found hard visual discontinuities but missed soft transitions. Manually inspect the whole reference. At each suspected boundary, gather source frames before, during and after, then annotate:

- What leaves, what enters, and which object persists?
- Does the transition use a mask/iris, camera rush, depth/defocus, typography replacement, object carry, or a true cut?
- When does the background change relative to foreground coverage?
- Does motion finish before the next event, or overlap it?
- What are the camera position, scale, crop and apparent depth on both sides?

For Astra, applying one 0.42 s parent fade and a small upward rise to every scene made the video feel like disconnected slides. The reference used a point iris into black, a galaxy rush, continuous UI camera travel, Word file-card carry, partner orbit, and an outro collage collapse. The exact transitions are recorded in the [temporal audit](../plans/astra-law-temporal-audit.md). Use the transition that the source demonstrates; a generic crossfade is a hypothesis that must be supported by source frames.

A useful review strip is three to seven aligned frames around a boundary at roughly 0.1 s spacing, followed by continuous playback at 0.25× and 1×. Increase density if a fast action occurs between samples. Review the final **encoded** video, not only the browser state.

## 3. HyperFrames and motion specification

The HyperFrames draft must exist **before** visual dressing. Use beat kinds from the [canonical engine](../src/runtime/hyperframes-engine.mjs) and sample timing through [pure presets](../src/runtime/hyperframes-motion-presets.mjs). In the scene ledger, name the beat and preset driving each track, plus any source-specific camera or micro-interaction track. A library import by itself is not evidence of use. `promo/astra-law-hyperframes-draft.html` and `tests/hyperframes.test.mjs` are the Astra example and regression gate.

Use [Motion IR schema](../schemas/motion-ir.schema.json) for vector intent and deterministic geometry; the [Astra Motion IR](../promo/astra-law.motion.json) is an actual instance. The old prose example in this guide described keys that were not in the live schema. Schema files and valid fixtures own the shape. Do not copy prose into generated output without validation.

The reference sets the style and timing. Obsidian gloss, 2.5D extrusions, 60 ms stagger and fixed spring numbers are **techniques**, not required defaults. Product Designer consultation is required by `AGENTS.md`, but the designer must judge the source instead of applying a house style over it.

## 4. Visual review that survives cheap-model delegation

A lower-cost reviewer can inspect aligned frame pairs and playback segments efficiently if asked for a narrow evidence report:

```text
Scope: exact reference frame/time range and current MP4 hash
Observation: what differs at full size, with source/output frame IDs
Inference: likely cause, explicitly tentative
Unknown: what the available frames cannot prove
Severity: blocker/major/minor and why it affects perceived similarity
Proposed acceptance: exact frames + playback interval to recheck
```

The controller verifies claims before modifying code. In the Astra review, one real Word overlay issue was found; two other flags were false positives after inspecting the exact full-size source and output frames. Do not convert every reviewer suggestion into a mutation. A reviewer of a scene should not be the sole grader of its own work.

Compare exact frame indices at the same aspect ratio and full resolution. Pixel difference is a regression clue, not a perception score; antialiasing, font rasterization and stand-in logos can inflate it, while bad timing may look acceptable in a selected still. Watch the scene as motion after the contact sheet. Report owner feedback as feedback, not a measurement.

## 5. Export and provenance traps

- A preview may be newer than the MP4. After the **last code change**, regenerate proof and MP4, record their hashes, decode the MP4, then compare source and output frames. The export script may guard against partial replacement, but it cannot make an old file current.
- The player must render the same frame for the same virtual-clock time after arbitrary seek order. Wait for painting, fonts and assets before capturing. The Astra capture helper waits after a seek; verify the output when changing capture behavior.
- Treat source video/audio as private local evidence unless publication rights are known. Keep reference copies out of the public repo. Do not assume the music or narration can be redistributed with the recreation.
- Mark a substituted brand asset explicitly. The Astra owner allowed arbitrary genuine SVGL logos in the partner scene because the source identities were unreadable; this resolves provenance and appearance, not identity parity.
- Scale CSS text and logos carefully. Transform scaling can blur rasterized content; a source-matched size/layout change can keep them crisp. Record the exception and verify full-size frames.

## 6. What a future session should open first

1. [The normative contract](motion-video-recreation-pipeline.md), plus `AGENTS.md` and the Product Designer skill.
2. The active case plan and temporal audit for source facts, owner decisions and open gaps.
3. `git status` in the active worktree; source/export metadata and hashes; the latest encoded proof.
4. The highest-impact unresolved transition or scene. Update its ledger, implement, re-export, compare, and report the acceptance state defined by the contract.

A session handoff that contains only “tests passed” or “looks close” is incomplete. It must point to the current artifact hash, compared frame ranges, open gaps and next executable action.
