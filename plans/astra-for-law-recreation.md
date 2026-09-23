# Astra for Law video recreation

Status: second visual recovery cut exported locally for owner review after the earlier cut was judged about 20% similar. Source: [OpenAI video](https://www.youtube.com/watch?v=YeeGHCixr7o), published 2026-09-17. Passing engineering gates does not establish visual acceptance.

## Outcome and boundary

Build a seekable 16:9 Studio Runner and deterministic 30 fps MP4 that recreate the reference's typography, visual sequence, UI walkthrough, motion rhythm, and final mark. Use this repository's Motion IR and geometry/virtual-clock approach. Keep the source download, its soundtrack, and reference frames local under ignored cache; do not publish or merge without owner review.

Observed reference: 1920x1080, 30 fps, 77.594 seconds. FFmpeg's 0.18 scene threshold found a black-field transition at 7.57-7.63 seconds but missed the frequent soft reveals. Even at 0.06, cut scoring caught only 5.2, 7.53-7.63, 10.67-10.77, 57.9, and 69.5 s, so frame sampling remains necessary. A 50 Hz waveform, keyframe sheets, and Product Designer audit are local evidence for this revision. Time ranges below are approximate semantic anchors, not exact cut claims.

| Time (s) | Visual beat |
| --- | --- |
| 0-4 | OpenAI for Law; frontier intelligence for professional legal work |
| 4-10 | Blue point into dark spiral; Astra for Law |
| 10-18 | Build your methods; ChatGPT for Your Firm and firm tiles |
| 18-25 | Prompt composer, model label, and typed S-1 request |
| 25-35 | Tool/thinking states, mapping response, attached Word file |
| 35-41 | ChatGPT for Word over coral/orange/lavender field |
| 41-49 | Legal tools heading and orbiting partner tiles |
| 49-53 | Community skills labels |
| 53-60 | Legal-grade trust and controls |
| 60-68 | Zero data retention and automated safeguards |
| 68-75 | Earned trust and firm ambitions |
| 75-77.594 | OpenAI mark |

## Acceptance

1. Scene structure, key text, background, and subject match the sampled reference at representative timepoints; mark visual differences honestly.
2. `window.__seekToTime(t)` yields the same frame for repeated or out-of-order seeks. The authored timeline is finite and reduced motion has a static fallback.
3. At least one vector element compiles from a schema-valid Motion IR, with transforms sampled from its tracks rather than raw animated path tokens.
4. Interactive Studio Runner includes play/pause, restart, scrub, chapter jumps, speed, fullscreen, and keyboard controls. The clean export frame remains 1920x1080.
5. Run Motion IR validation, project audits, representative frame capture, comparison review, and a complete local MP4 export. Keep reference assets and full video out of Git.

## Fidelity recovery targets

The [Product Designer audit](reports/astra-law-product-designer-audit.md) ranked five gaps: shot/word timing, ChatGPT camera and tool progression, galaxy silhouette, orbit stagger/counter, and accent/outro states. The first cut skipped “Powered by”, “knowledge”, “value”, and “With OpenAI for Law”; showed complete content at 21, 31, 45, and 73 s when the source showed different states; and used the wrong opening accent. Treat these as acceptance blockers. Compare the source and captured draft at matched timestamps with `python3 scripts/compare-astra-law-reference.py /tmp/astra-for-law-reference.mp4` after `node scripts/export-astra-law-video.mjs --proof`.

## Known fidelity limit

The source contains many third-party brand tiles. The partner orbit uses illustrative text labels and anonymous official pictograms whose membership was not independently verified. It preserves the composition without inventing logo geometry, but the 47-49 s orbit remains the largest visible mismatch in matched-frame review. The procedural galaxy uses deterministic star positions sampled from one source frame, while the transitions and other UI are rebuilt. Word/Excel marks came from SVGL; the final tie and scales are generated interpretations of the reference, not source cutouts. The reference soundtrack is included only in the ignored local MP4 and is excluded from Git.

## Local handoff

- Studio Runner: `promo/astra-law-promo.html`; serve the repository root with `python3 -m http.server 3033`.
- Motion source: `promo/astra-law.motion.json`; 19 scene beats in `promo/astra-law-timeline.mjs`.
- Icon provenance: 28 local SVGs match `@phosphor-icons/core/assets/{regular,fill}` byte for byte; `openai.svg` and the Microsoft Word/Excel marks come from SVGL. No partner logo geometry was synthesized.
- `node scripts/export-astra-law-video.mjs --verify` checks assets, 1920x1080 export geometry, Motion IR cubic path, representative scenes, repeated out-of-order seeks, reduced motion, transport controls, and responsive Runner geometry.
- `node scripts/export-astra-law-video.mjs --proof` writes sampled PNGs to `.cache/astra-for-law/proofs/`.
- `node scripts/export-astra-law-video.mjs` exports a silent MP4 to `.cache/astra-for-law/astra-law-recreation.mp4`. The private local review cut with the reference soundtrack uses `--reference-audio /tmp/astra-for-law-reference.mp4` when that local source file is present.

## Verification record

Prior reference comparison at 15, 39, and 63 seconds exposed large visual differences despite some similar coarse bounds. It did not cover missing intermediate shots or camera crops. The comparisons are in ignored `.cache/astra-for-law/`; source frames are not tracked. The owner rejected this first cut as insufficiently similar.

The first cut passed Motion IR validation, TypeScript build, project `audit:all`, 9/9 SVG icon audit, player/Runner verification, and production-only `npm audit --omit=dev --audit-level=high`. Those historical passes did not certify the revised cut. The first full 30 fps H.264/AAC local export decoded with FFmpeg and measured 1920x1080 at 77.600 seconds (frame-rounded from 77.594). The baseline development-only `svgo@4.0.0` advisory remains outside this recreation's scope.

The revised cut restores the missing word/point/closing states, source-timed ChatGPT camera crops and responses, an atomic 27+/36+/40+ sequence, and a staged radial burst to spiral. Product Designer reviewed and edited the visual scenes, including the Word viewer and final app/chart collage. Controller matched 39 draft frames to local reference frames and independently inspected the camera, Word, orbit, and closing boards. Pixel error was used only to locate differences, never as a similarity score. The macro composer now uses CSS layout zoom for crisp arbitrary seeks because Chromium intermittently rasterized transform-scaled text differently on repeated captures; the exporter waits for two animation frames before capture. Ten successive `--verify` stress runs passed after this fix.

After the owner's 20% assessment, a fresh read-only Product Designer audit ranked the remaining mismatches. The next cut replaces the uniform dotted galaxy with 1,697 deterministic source-sampled star centroids, a timed stream-to-spiral transform, and fixed glints; refits the 18.8/21 s composer crop, 60/71.5 s title metrics, and orbit tile scale; adds source-shaped dimensional tie/scales assets to the closing collage. At 8.5 s, sampled bright-pixel counts are closer to the reference, but that pixel check is only a local calibration and does not prove motion fidelity. A second independent Product Designer review found the composer, long title beats, and collage improved. It ranked the unsourced partner identity at 47-49 s as the largest mismatch. A final read-only check after the last light/camera edits found both 8.5 s and 21 s visibly improved, with smaller differences still present. The agent inspected still frames, not continuous motion; owner acceptance remains open.

For this recovery cut, controller verification passed: Motion IR schema validation, four successive `node scripts/export-astra-law-video.mjs --verify` runs after the last visual edit, 42 representative `--proof` frames, matched reference/draft boards, `npm run build`, `npm run audit:all`, all 31 local SVGs parsing, 28 Phosphor byte comparisons, and `git diff --check`. An authored-style hash confirms out-of-order seeks restore the same DOM state; the browser capture gate permits at most 350 pixels with up to two levels of color-channel difference to account for observed Chromium raster variation at the 21 s macro text. The current local H.264/AAC export decoded without FFmpeg errors: 1920×1080, 30 fps, 2,328 frames, 77.600 s, 9,325,378 bytes. Its path is `.cache/astra-for-law/astra-law-recreation.mp4`; reference audio and comparison assets remain ignored local files. The local Runner URL returned HTTP 200. The `audit:all` scripts primarily cover shared demos, so dedicated browser and frame checks carry this page's acceptance evidence. Source partner marks, exact Word interior, galaxy transition, and 74 s app collage still differ visibly; no numeric visual-fidelity score or owner approval is claimed.
