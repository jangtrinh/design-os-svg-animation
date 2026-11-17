---
name: es-tutorial-video
description: "Use when turning a finished DESIGN:OS build folder into an A-to-Z tutorial video (16:9 + 9:16, evidence on screen, optional voice): storyboard, kit render, validate, look, owner gates."
user-invocable: true
when_to_use: "Use when the owner wants a how-we-built-it video from a build's own receipts, gate reports and renders. Not for a launch promo or a reference-video recreation."
category: video
keywords: [tutorial-video, evidence-paper, seek-t, puppeteer, voiceover, beat-sheet, owner-gate]
license: PolyForm Shield 1.0.0 (see LICENSE)
metadata:
  author: design-os
  version: "1.1.0"
---

# Tutorial video from a build folder

The video retells evidence that exists. Every command, line and number on screen is read verbatim from the build
(receipt, `state.md`, gate report); nothing is typed or made prettier. Style v1 "Evidence Paper" is the only style.
Shared engine: `promo/_tutorial-kit/` (read `docs/tutorial-video-workflow.md` for the why behind each step).
Worked projects (both pass `validate.mjs` and `look.mjs`): `promo/ck-001-tutorial`, `promo/dc-01-tutorial` (legacy: published before pedagogy v2).
A new tutorial is **pedagogy v2** (config `pedagogy: "v2"`): see the section below; legacy projects keep the old rules and are never checked by the new ones.

## Pedagogy v2 (every new tutorial)
The viewer is a curious newcomer. Rules R18 to R24 in `rules.md`, template in `concepts.md`:
- **Voice is one clip per sentence** (`sentences` in the script, `voiceover/clips/<sentence id>.mp3`); elements bind with `at: 'sent:<id>'`.
- **One text channel:** a `kw` keyword line (6 words at most), no burned-in caption; `build.mjs mix` also writes the exact voice text as `.srt`/`.vtt` (vi and en).
- **Newcomer loop:** `glossary` first, `focus` on the cited line, `predict` (3 to 5 s, no voice, music muted), `recap` (blank answers, then reveal), chapters 15 to 35 s.
- The numbers are provisional budgets (`pedagogy-core.js`); a short film under 60 s may lower `predictMin`. `validate.mjs` runs 7 more checks; `look.mjs` adds L6, L7 and 5 shots.

## Two owner gates (never skipped, never merged into one)
1. **Storyboard + voice script.** Stop after the storyboard and the script. No voice is generated and no credit spent
   until the owner approves both and the approval is recorded in `tutorial.config.json` (`approvals`). `build.mjs mix`
   and `build.mjs render --full` refuse while either is `null`. `build.mjs` never calls a voice API; clips are made
   elsewhere, after gate 1, and only read here.
2. **Merge / publish.** Hand the MP4s and the look sheet to the owner. The owner listens first, then commits, merges
   or publishes. This skill never pushes, opens a PR or edits `docs/index.html`.

## Procedure

### 1. Concept
Read `concepts.md`. Ask the owner (AskUserQuestion, recommended option first): length, aspects, language, music,
voice or not. Write `storyboard.md` in the project (chapters, bars, evidence key to source lines, honest-limits
chapter) and the voice script text. **Gate 1: stop and wait.**

### 2. Build
1. `node skills/es-tutorial-video/build.mjs scaffold <build-dir> <slug>` creates `promo/<slug>-tutorial/`.
2. Fill `extract-evidence.py` (excerpts only, verbatim) and run it; render stills from one camera (rules.md R12).
3. Measure the bar grid with numpy; set `grid`, `duration`, `music` in `tutorial.config.json` (R5, R3).
4. Author `tutorial-timeline.js` from the storyboard (elements `tl.el`, captions `tl.cap`, `WARP` for chapter fit).
5. `node skills/es-tutorial-video/build.mjs render <project> --beats` and read the beat sheets.
6. After gate 1 and with clips in `voiceover/clips/`: `build.mjs mix <project>`, then
   `build.mjs render <project> --full --shards 3` (shards run in parallel, then join; about 19 min for 5:34 of film).

### 3. Check
- `node skills/es-tutorial-video/validate.mjs <project>`: exit 0 or fix every printed `<check>: <fix>` line.
- `node skills/es-tutorial-video/look.mjs <project>`: exit 0, then do the eye-checks in `look.md` on the sheet PNG it prints.
- On the MP4s themselves: `ffmpeg -v error -i <mp4> -f null -` prints nothing; audio and video lengths match;
  `ebur128` reads -16 LUFS; the contact sheet has a frame from every element type; for pedagogy v2 also `volumedetect` on each predict hold (below -60 dB).

### 4. Hand over
Reply with exactly these, in this order (rules.md R13):
1. NOT verified first (no browser, no voice clips, music not listened to, 9:16 not looked at, ...).
2. Output paths: the MP4s, the look sheet PNG, the beat sheets.
3. What was verified, each with its command and its real result (validate exit code, look items L1-L5, ffmpeg checks).
4. Which owner gate is open ("waiting for: gate 1" or "waiting for: listen, then merge").
Banned words: "should work", "looks good", "verified" without the command. Visual proof is the sheet, not a sentence.

### 5. Adjust
The owner's note names a chapter or a frame: change the timeline or the evidence, never the engine. Re-run
`validate.mjs` and `look.mjs`, re-render only the aspect that changed. An engine change goes in the kit and needs
`node scripts/build-tutorial-contract.mjs` plus a per-frame beat comparison against the old render.

## Files in this skill
- `rules.md`: numbered rules, each with Keep it / Rejected when / Checked by.
- `concepts.md`: how a build folder becomes chapters, and the weak-concept list.
- `look.md`: the eye-checks (numbered) and the "Without a browser" clause.
- `contract.json`: GENERATED by `scripts/build-tutorial-contract.mjs` (config keys, element types, CLI flags); never edit.
- `build.mjs`: `scaffold`, `render`, `mix`; owner-gate enforcement. `validate.mjs`, `look.mjs`: see their headers.
- `validate-pedagogy.mjs`: the 7 pedagogy v2 checks that `validate.mjs` calls (it is not run on its own).
- `kit-path.mjs`: finds the kit (`./kit` in a host bundle, else `promo/_tutorial-kit`).
- `templates/`: what `scaffold` copies (config, timeline skeleton, extractor skeleton, script, storyboard, gitignore).
- `examples/`: `ck-001.json`, `dc-01.json` pointers to the two migrated projects (CI runs build, validate, look on both).
- `ATTRIBUTION.md`: music, voice and image sources with licences.

## What goes wrong
| Symptom | Do this instead | Rule |
|---|---|---|
| `/Users/<you>/...` visible in a terminal card or in image metadata | fix the extractor, `mogrify -strip` the stills, Blender metadata stamps off | R2 |
| Music file or a mix shows up in `git status` | add `audio/` and `out/*.wav` to the project `.gitignore` | R3 |
| Voice clip is cut off at the chapter end | widen the chapter with `WARP` knots on integer bars | R4 |
| Beats drift from the music after a loop | measure the grid on the bed with numpy, never from the title's BPM | R5 |
| Two captions fight for the same second | end the first before the next starts | R6 |
| Grid cells collapse to one column | `display=''` to show, `display:none` to hide | R8 |
| Montage sorts bar 100 before bar 20 | beat names are `bNNN.jpg`, 3 digits | R9 |
| Wipe between build phases jumps | render every phase from the one camera json | R12 |
| Owner asks for "just generate the voice" before approving | stop; gate 1 first, then `mix` | R7 |
| Silence in a predict hold has music in it | the bed is muted by `mix`; re-run `mix`, then `ffmpeg volumedetect` on the hold window (below -60 dB) | R20 |
| A text card is dense and nobody can find the number | `focus` the cited line, cite fewer lines, keep the card 4 s or more | R22 |
