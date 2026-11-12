# Concepts: from a build folder to chapters

A tutorial retells a build that already exists. The concept is the ordered list of chapters, each backed by one or two
evidence entries and one picture. If a chapter has no evidence in the build record, it is not a chapter.

## Request to concept, in order
Ask the owner only what the build cannot answer (length, aspects, language, music, voice or not). Everything else comes from the build folder.

| # | Chapter | Evidence to pull (verbatim) | Picture |
|---|---------|------------------------------|---------|
| 0 | Title | build name, purpose, one-line scope from the README | hero still |
| 1 | Input | the source registry or reference list, with what was NOT verified | the reference image(s) |
| 2 | Contract | the spec (`spec.json` / design parameters): dimensions, tolerances, purpose | none, or the blueprint |
| 3 | Passes / revision ladder | the revision list (A01, B01, M02...), one `AGENT_OK` or `AGENT_FAIL` line per step (LAST sentinel) | clay or wire stills from one camera |
| 4 | Gates | gate report heads: failed parts, thinnest wall, verdict | none; the JSON is the picture |
| 5 | Fit | the interface or collision report, nominal and extreme | fit render |
| 6 | Presentation | the materials, light and motion receipts | hero still, animation frames |
| 7 | Delivery | the delivery manifest, honest status per row (media, motion, fit, manufacture) | the review page capture |
| 8 | Honest limits | the sentences the build itself writes about what is blocked or unproven | none |
| 9 | Lessons | failures with their cost, from the lessons file | none |
| 10 | Outro | the repo and the re-run command (`repo` element, with `cmd`) | none |

Chapters 3 to 6 repeat per phase when the build has several; keep one chapter per phase that changed the decision.
A build with a failed gate or a discarded run gets that failure as a chapter beat: history is material (do not delete intermediate runs).

## Build order
1. Frame and storyboard with the owner (gate 1 includes the voice script text).
2. Evidence: `extract-evidence.py`, then stills from ONE camera (`data/<slug>-camera.json`) for every phase; strip image metadata.
3. Grid: measure the music with numpy (comb filter on the bed, downbeat phase); put `grid`, `duration`, `music` in the config.
   For a looped bed run `promo/_tutorial-kit/build-music-bed.py <project>` with Blender's python (it has numpy).
4. Timeline: chapter bars first, then elements, then captions; adjust `WARP` once the real clip lengths are known.
5. Beats, then voice (after gate 1), mix, full render (shards), check, hand over (gate 2).

## Weak concepts (reject at the storyboard)
- A chapter with a nice picture and no receipt behind it.
- A summary written for the video instead of copied from the record ("our robust pipeline...").
- One long chapter (more than ~30 s of voice) with no element change: split it.
- A claim of manufacture, strength or load the build never measured.
- Re-rendering a published MP4 to "refresh" it without the owner asking.

## Newcomer template (pedagogy v2)
The audience is a curious newcomer (owner decision 2026-10-15). One film is 2 or 3 acts; one act is the loop below, repeated. Chapters run 15 to 35 s (R23);
the table above still decides which evidence backs each chapter.

| Step | Element | Voice | Silence |
|------|---------|-------|---------|
| Glossary (first, once) | `glossary`: 4 to 6 terms, about 15 s | one short sentence per term | a hold after the last term |
| Problem | evidence card with `focus` on the cited line, plus a `kw` | the sentence that names the number | none |
| Predict | `predict`: question of at most 14 words, hairline over `hold_s` 3 to 5 s | the question, then nothing | the hold, music muted |
| Reveal | the next evidence card, `focus` on the answering line | the answer sentence | none |
| Recap (end of the act) | `recap`: 3 or 4 cues, answers blank then revealed | one short lead-in sentence | the reveal hold |

Pick the predict prompts where the build has a real misconception (a sentinel that says OK while a gate fails, a limit that must never be lowered): the viewer commits, then the
evidence corrects. Define a term in the glossary, then use it; a chapter with more than 4 new quantities ends in a `hold_s` pause. Weak: a predict whose answer is a yes/no
the voice already gave, a glossary of words the viewer knows, a recap that repeats the lessons in the same words.
