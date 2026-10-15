# Rules for tutorial videos

Each rule: Statement, Keep it (how to comply), Rejected when (what fails it), Checked by (`validate:<check>` is mechanical,
`look:<n>` is an eye-check in `look.md`, `build:gate` is enforced by `build.mjs`, `review` is a human judgment).
The validator rejects facts only; taste stays in `look.md`.

## R1 Verbatim evidence only
Statement: every excerpt on screen is copied from the build record by a script.
Keep it: `extract-evidence.py` writes `data/evidence.js`; the timeline reads `E[key]` through `tl.ex` / `tl.val` / `tl.line`.
The `AGENT_OK` line is the LAST sentinel of its file. A terminal command is one that was really run (copy it from the receipt).
Rejected when: an evidence entry is not `{path, lines|value}`, or on-screen text was typed into the timeline by hand.
Checked by: validate:evidence-shape, review

## R2 No home path on screen or in committed media
Statement: no absolute home path appears in any committed file, image metadata or video metadata.
Keep it: the extractor asserts `'/Users/' not in text`; run `mogrify -strip` on Blender stills (Blender writes the absolute `.blend`
path into the image); keep Blender metadata stamps off in renders; then `git grep --cached -l "/Users/"` is empty.
Rejected when: `/Users/` occurs in the config, evidence, timeline, voice script, `assets/`, `data/`, `ref/` or a staged MP4/JPG/PNG.
Checked by: validate:no-home-path

## R3 The music licence file is never committed
Statement: the licence of the track forbids redistributing it as a standalone file, looped, or inside a mix.
Keep it: project `.gitignore` lists `audio/` and `out/*.wav`; keep a screenshot of the licence page under `data/` if the licence needs proof.
Rejected when: `music.file`, `music.bed` or `out/tutorial-audio.wav` is not git-ignored.
Checked by: validate:gitignore-music

## R4 A chapter clip fits its window
Statement: a voice clip must end at least 0.3 s before its chapter ends, after the 0.5 s lead (clip <= window - 0.8 s).
Keep it: widen the chapter with integer-bar `WARP` knots borrowed from a chapter with slack; the mix reads chapter times from the timeline.
Rejected when: a segment has no chapter, no clip, or `end > chapter end - 0.3`.
Checked by: validate:script-clips

## R5 The bar grid is measured, not guessed
Statement: beat times come from the music file, measured with numpy (comb filter, downbeat phase), on the bed that is actually mixed.
Keep it: record the method in `grid.measuredBy`; chapter boundaries sit on downbeats; loops splice on a downbeat (`build-music-bed.py`).
Rejected when: `grid.measuredBy` is empty or still says "not measured".
Checked by: validate:config-schema

## R6 Captions never overlap
Statement: each caption window exits before the next one enters.
Keep it: `tl.cap(a, z, vi, en)` windows are ordered and `z` of one is `<=` `a` of the next.
Rejected when: a caption's end is later than the next caption's start.
Checked by: validate:captions-overlap, look:1

## R7 Two owner gates, enforced by the build
Statement: the owner approves the storyboard and the voice script before any voice credit is spent, and approves the result before merge or publish.
Keep it: record who and when in `approvals.storyboard` and `approvals.script`; `build.mjs mix` and `render --full` refuse while either is `null`;
the build and the kit make no network call; this skill never pushes, opens a PR or touches `docs/index.html`.
Rejected when: `mix` or a full render runs with an approval null (the build refuses, exit 1), or a script in this skill calls a voice or network API.
Checked by: build:gate, review

## R8 Show with `display=''`, hide with `display:none`
Statement: a hard-coded `display:block` overrides the stylesheet and flattens `display:grid` cards.
Keep it: the kit scene does `style.display = ''`; project code never sets a display value to show an element.
Rejected when: a project script assigns `display = 'block'` or `display: block`.
Checked by: validate:display-block

## R9 Beat frames have 3-digit names
Statement: a long film has more than 99 bars and the montage sorts by name.
Keep it: render beats with the kit (`bNNN.jpg`, plus `first.jpg`).
Rejected when: a file in `out/beats-*/` is not `first.jpg` or `bNNN.jpg`.
Checked by: validate:beat-names

## R10 Every image the timeline names exists
Statement: evidence without its picture is a claim.
Keep it: sequences are `pattern` with `%03d`, first and last frame must exist.
Rejected when: a path in a chapter card or element does not exist under the project.
Checked by: validate:assets-exist

## R11 Fonts are ready before any capture
Statement: Vietnamese glyph subsets load lazily; an early capture loses letters.
Keep it: the kit's `__framesReady` awaits `document.fonts.ready`; do not capture around it.
Rejected when: Geist or Geist Mono is not loaded at capture time.
Checked by: look:L1

## R12 One camera for every phase of a build
Statement: wire, clay and hi-fi stills of different phases come from the same camera, so wipes do not jump.
Keep it: write the camera to `data/<slug>-camera.json` and pass it to every render pass.
Rejected when: a wipe between phases shows the part at a different angle or scale.
Checked by: look:3

## R13 The hand-over states what was not verified
Statement: a report that only says "done" is not evidence.
Keep it: follow the hand-over block in `SKILL.md` (not verified first, paths, command and result per claim, open gate).
Rejected when: the hand-over lacks the NOT-verified line, a command result, or says "should work" / "looks good".
Checked by: review

## R14 Grid, duration and credit live in the config only
Statement: one place per fact; the timeline reads `D.CONFIG`, the mix and the bed builder read the same file.
Keep it: change `tutorial.config.json`, then re-run the contract check; never copy a BPM or a duration into a script.
Rejected when: the config fails the kit schema, lists a missing file, or `contract.json` was hand-edited.
Checked by: validate:config-schema, validate:contract-intact, validate:timeline-eval

## R15 There is a chapter that says what the build does not prove
Statement: the video must state the limits of the build (what is not measured, not manufactured, not accepted).
Keep it: copy the limit sentences from the build's own README/state, as evidence entries.
Rejected when: no chapter or caption carries a limit from the build record.
Checked by: look:6

## R16 Voice generation is one deliberate batch
Statement: every generation call spends credit, and a clone voice drifts between models.
Keep it: A/B one sentence on 2-3 models and let the owner choose; generate all segments once, fetch them at once; never retry a failed call automatically.
Rejected when: a second generation of the same segment is requested without the owner's word.
Checked by: review

## R17 A scaffold is not a tutorial
Statement: a project with no chapter, no element or no voice segment is unfinished work and is not handed over.
Keep it: author the timeline from the approved storyboard and the script from the approved text before validating for hand-over.
Rejected when: the timeline has no chapter or no element, or the voice script has no segment.
Checked by: validate:timeline-authored, validate:script-authored

**Pedagogy v2 (R18 to R24)** applies when `tutorial.config.json` has `pedagogy: "v2"`. A legacy project (CK-001, DC-01) keeps R1 to R17 only and is never checked by these.
Owner decisions 2026-10-15: the viewer is a curious newcomer; one keyword line on screen; three predict prompts; blank-then-reveal recaps; chapters 15 to 35 s.
Evidence and grades: `plans/reports/pedagogy-tutorial-video-research.md`. **Every number below is provisional** (the research labels the reading-speed budgets as
assumptions): calibrate them after the first viewing and change them in `promo/_tutorial-kit/pedagogy-core.js` BUDGETS, which `contract.json` and `validate` both read.

## R18 One text channel: a keyword on screen, the full text in the sidecars
Statement: the voice is one channel and the screen text a second; a third (a burned-in sentence) makes the viewer read instead of watch (redundancy).
Keep it: `tl.cap` stays empty; use element `kw` (`at: 'sent:<id>'`, `text` of at most 6 words, one language) for the number or term the voice is saying; the exact voice text
ships as `out/<output>-vi.srt/.vtt` and `-en.srt/.vtt` (`make-subtitles.mjs`, run by `build.mjs mix`), written from the script sentences and never from the timeline.
Rejected when: a caption is burned in, a `kw` has more than 6 words, repeats a whole sentence, has no `at`, overlaps another `kw`, or a sentence lacks `text_en`; after a render, a sidecar is missing, not monotonic or differs from the sentences.
Checked by: validate:one-text-channel, validate:subtitles-present

## R19 The viewer is a newcomer: a glossary first, every term defined before use
Statement: undefined jargon is carried through the whole film.
Keep it: one `glossary` element (4 to 6 terms, a one-line definition of at most 12 words each, shown about 15 s at the start, each term tied to the sentence that explains it);
list the terms the film introduces in config `glossary`; no sentence, card or keyword uses a listed term before the glossary shows it.
Rejected when: there is no glossary element, it has fewer than 4 or more than 6 terms, or a listed term is used earlier than its entry appears.
Checked by: validate:glossary-present, validate:terms-defined

## R20 Predict before reveal, with real silence
Statement: committing to an answer first is retrieval practice (grade A in the research); a video can only approximate it, so the beat must be real: no voice, no music.
Keep it: three `predict` elements per film (a film shorter than 60 s may set config `predictMin`), each bound to the sentence that asks (`at`), `hold_s` 3 to 5 s on the element,
a question of at most 14 words; the next sentence of the chapter is the reveal. `mix-voiceover.mjs` mutes the music bed to silence inside each hold (0.3 s fades).
Rejected when: fewer predict beats than required, a hold outside 3 to 5 s, a sentence playing inside a hold, no sentence after it to reveal the answer, or music in the hold (`ffmpeg volumedetect` on that window must read below -60 dB).
Checked by: validate:predict-count, review

## R21 A blank-then-reveal recap replaces the read-aloud lessons
Statement: reading four lessons aloud re-exposes what was just seen; recall with feedback is what sticks.
Keep it: one `recap` per act, bound to a sentence that has `hold_s` in the script: 3 or 4 cues with blank answers, revealed one by one (`lead_s`, `step_s`) inside that silent hold.
Rejected when: a recap has fewer than 3 or more than 4 cues, its reveals do not fit the hold, or its answers are visible before the reveal.
Checked by: validate:card-budget, look:L7

## R22 Card budget: a card shows what the voice cites
Statement: a card is read while it is heard, so the cited number must be findable.
Keep it: on a `file` or `json` card give `focus: [lineIndex]` and bind it with `at`: while that sentence plays the cited line is highlighted and zoomed and the other lines dim to 40%;
a focus line has at most 12 tokens (cite the number, not the whole object); a text card stays at least 4 s; at most 20 tokens of non-focus text are on screen at once across cards.
Rejected when: a focus line is longer than 12 tokens or out of range, `focus` has no `at`, a text card stays under 4 s, or more than 20 non-focus tokens are visible at one time.
Checked by: validate:card-budget, look:L6

## R23 Chapters are 15 to 35 s, and a dense passage ends in a silence
Statement: more than 4 new quantities in one passage overloads working memory.
Keep it: split a chapter before it passes 35 s; after a passage with more than 4 new quantities put `hold_s` on its last sentence (a silent pause, music kept).
Rejected when: a numbered chapter (not the title or outro) runs under 15 s or over 35 s, or a passage with more than 4 new quantities has no hold.
Checked by: validate:chapter-length, review

## R24 Each element appears when its sentence starts
Statement: a picture shown while its narration plays (contiguity) beats one placed on a music bar.
Keep it: `voiceover/script-vi.json` segments carry `sentences: [{id, text, text_en, hold_s?}]`, one clip `voiceover/clips/<sentence id>.mp3` each (ids unique across the script);
elements take `at: 'sent:<id>'` (optional `until`, `delay`, `dur`); times come from `pedagogy-core.js`, never typed in.
Rejected when: a v2 segment has no `sentences`, a sentence has no clip or repeats an id, a sentence ends less than 0.3 s before its chapter does, or an element names a sentence that does not exist.
Checked by: validate:script-clips, validate:timeline-eval
