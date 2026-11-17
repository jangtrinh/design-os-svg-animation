# Tutorial kit + skill: pedagogy upgrade
Status: implemented on branch feat/tutorial-pedagogy-v2, awaiting controller verification · research: `plans/reports/pedagogy-tutorial-video-research.md` (design-os-pedagogy, graded).
Owner decisions 2026-10-15 (AskUserQuestion), binding for every new tutorial:
1. **On-screen text = one keyword line** (the number or term the voice is saying). Full VI and EN subtitles that transcribe the voice exactly ship as `.srt` + `.vtt` sidecars, not burned in. This applies the redundancy principle.
2. **Viewer = a curious newcomer.** Define each term at its first use, and open with a short glossary strip.
3. **Three "predict before reveal" prompts** per video, each with a 3–5 s silent beat during which the music drops out. A blank-then-reveal recap per act replaces the read-aloud Lessons chapter. This is retrieval practice (grade A in P).
4. **Robot arm runs ~7 min in 3 acts.** Chapters are 15–35 s, and there is a silent hold after any passage with more than 4 new quantities.
CK-001 and DC-01 stay as published (legacy). The new rules apply when `config.pedagogy` is `"v2"`; legacy projects keep validating as before.

## Kit (`promo/_tutorial-kit/`)
- **Per-sentence voice.** `voiceover/script-vi.json` segments gain an optional `sentences: [{id, text}]`. The mix places each sentence clip in order and keeps every one inside its chapter. Each element can be bound to a sentence (`at: 'sent:<id>'`), so a card appears when its sentence starts.
- **Keyword caption.** Element `kw` (or a `cap` mode): at most 6 words, in one language (VI), bound to a sentence.
- **Signaling.** On `file` and `json` cards, `focus: [lineIndex]` plus `at: 'sent:<id>'` makes a visible highlight and zoom of the cited line while that sentence plays. Other lines dim to ~40%.
- **Predict beat.** Element `predict`: a question card (VI, ≤14 words) and a countdown hairline lasting `hold_s` (3–5). Audio: no voice during the hold, and the music bed ducks to −inf, i.e. muted with 0.3 s fades. The reveal follows as the next sentence.
- **Recap.** Element `recap`: 3–4 cue lines with answers blanked; the answers reveal one by one after a beat.
- **Glossary.** Element `glossary`: 4–6 term → one-line definition, shown 15–20 s near the start.
- **Subtitles.** `make-subtitles.mjs` writes `out/<name>-vi.srt/.vtt` and `-en.srt/.vtt` from sentence timings. The voice text gives VI; a `text_en` per sentence gives EN.
- Keep everything deterministic `seek(t)` and the existing render, shard and join path.

## Skill (`skills/es-tutorial-video/`)
- `rules.md`: new numbered rules for decisions 1–4 and the budgets below, each with a "Rejected when".
- `validate.mjs`: new checks for `pedagogy: "v2"` projects:
  - `card-budget`: a card shows ≤12 focus tokens per cited line and stays ≥4 s; non-focus text ≤20 tokens visible at once (the research labels these numbers as assumptions; record them in rules.md as provisional and calibrate after the first viewing);
  - `one-text-channel`: no full-sentence caption burned in; keyword captions ≤6 words;
  - `predict-count`: ≥3 predict beats, each 3–5 s with no voice inside;
  - `chapter-length`: 15–35 s;
  - `glossary-present`;
  - `subtitles-present` (after render);
  - `terms-defined`: every term in a project glossary list appears in the glossary before its first use.
- `look.md` and `look.mjs`: add shots for one predict beat, one signaling moment and the recap reveal.
- `concepts.md`: the act and chapter template for a newcomer audience (glossary → problem → predict → reveal → recap).
- Update SKILL.md (still ≤120 lines), the contract and the tests (one broken fixture per new check), and resync the Claude bundle.

## Acceptance (controller re-runs)
1. `node --test tests/*.test.mjs` green.
2. `validate` exits 0 on CK-001 and DC-01 (legacy, unchanged).
3. A v2 fixture with every new element passes `validate`; one broken fixture per new check gives exactly that line.
4. A 30–40 s v2 demo film (fixture) renders through the kit with ≥1 predict beat (music silent during the hold, which a waveform/RMS check of that window proves), signaling and recap. The `.srt` and `.vtt` validate (timestamps monotonic, text equals the voice sentences).
5. `look` on the demo shows the new shots.
