# Astra for Law — temporal motion audit

Reference: local 1920 × 1080, 30 fps, 77.594 s copy of the owner supplied video. The source and comparison frames stay in ignored `.cache/astra-for-law/temporal/`; this file records observations and implementation decisions without redistributing source frames. Sampled strips use 0.1 s frames near 23 scene boundaries and 0.3–0.6 s frames within longer scenes. Timing below is approximate to a sampled frame unless a frame boundary was inspected directly.

## Main finding

The previous cut treated every beat as an independent full-screen scene with a roughly 0.42 s parent opacity fade and a 12 px heading rise. That created gray intermediate frames at the black/white boundary and made connected objects vanish. The reference uses typography replacement, a growing circular matte, radial camera travel, object carry-over, progressive UI reveal, and selective defocus. The source is often *not* a crossfade.

## Transition map

| Source interval | Observed effect and camera | Motion contract for recreation |
| --- | --- | --- |
| 0–2.5 | Centered title holds its baseline while only “Law” changes color; clean white negative space. | Keep typography locked; change accent on sampled beats. Replace title without a full-screen opacity wash. |
| 2.5–5.35 | Frontier headline resolves in two clauses with the same white canvas and center axis. | Reveal clauses independently; preserve text anchor, avoid scene-wide dissolve. |
| 5.35–7.6 | “Powered by” gives way to a colored point. The point cycles orange → lavender → green → yellow → blue → black, then the black disk expands rapidly from the frame center until it covers the canvas around 7.6. | Animate the Motion IR disk through the cover radius, hold the white scene until coverage, then expose the dark scene. No gray overlap. |
| 7.6–10.65 | Dark-space camera rush: long radial streaks converge around the title, compress into a stream, then organize as a bright spiral. At 10.3–10.6 the spiral stretches radially again before the white text chapter. | Give stars distinct burst, stream, spiral and exit-warp phases; preserve focal center while changing apparent depth. Delay the white chapter until the exit warp. |
| 10.7–13.8 | “Build” → “Build your”; colored term changes through **expertise**, **precedents**, **methods** at the same baseline. At the exit, old text slides/crops left while “Into ChatGPT” builds. | Keep a shared typographic axis. Replace the term in place with a brief directional offset; do not fade the whole screen. |
| 13.8–18.7 | Firm headline builds phrase by phrase; five firm tiles enter sequentially from the right, track left beneath it, then depart left. A pointer settles on the Cooley tile; that tile remains briefly alone before the composer appears. | Stage text, tile train, pointer and Cooley handoff separately. Clear headline before the composer enters. |
| 18.7–25.4 | Composer appears small and centered, then the virtual camera pushes into the input and glides across the typed prompt and model controls at macro scale. By ~22.2 it pulls back to the full composer while text continues appearing. | Preserve a continuous camera path with independently timed typing, card growth, control emphasis and pullback. Avoid pausing the camera at the zoom apex. |
| 25.4–33.3 | Composer clears to a small “Thinking” state. “Worked for 34s” and the response type on; tool activity lines stack in sequence while the view travels down/right. | Treat as one document canvas with progressive content and a camera pan; status rows arrive individually. |
| 33.3–37.7 | Large response snaps to a denser view, scrolls down as text and attachment appear, then the file card remains foreground while the background changes to the Word gradient. Cursor follows the file card. | Add a file-card handoff overlay crossing the scene boundary and move/scale the underlying response. |
| 37.7–42.3 | The Word viewer first appears as a narrow left panel, expands to reveal the document, then holds with a gentle forward camera move. | Expand the window from a slim panel to the full two-column viewer; pace the document reveal separately from the gradient. |
| 42.3–49.7 | Word washes away to white. “Access…” writes in clauses. Small brand tiles enter in an arc, accumulate around the title and then peel away in staggered order. | Use a rapid high-key wash for Word; stagger radial tile entry and radial/arc exit. Keep title stable while orbit fills. |
| 49.7–54.7 | Orbit fragments give way to 27+ → 29+ → 34+ → 39+ → 40+; skill chips float into depth layers. At the exit chips defocus and move outward as the next message arrives. | Count cadence and chip trajectories must be virtual-clock driven. Exit through scale/translation/opacity plus restrained defocus. |
| 54.7–62.1 | Legal-grade trust line types in two clauses. “Your” is followed by a short cluster of animated blue dots before the private-data sentence types, then the second line types. | Stage clauses and loading dots before the typewriter; hold a steady center frame. |
| 62.1–65.8 | Blurred confidential document rises from below with blue particles floating around it; eye-slash mark emerges. Document defocuses out while “Automated safeguards. No human eyes.” writes in two beats. | Animate document depth and particle paths independently; transfer focus into staged headline. |
| 65.8–72.3 | Trust sentence expands from “So you” to full phrase; small checked document icon lands at the end. Next phrase cycles **expertise** blue → **ambitions** green → **value** lavender. | Reuse typographic baseline and give word replacement its own timing; icon arrives after final words. |
| 72.3–77.6 | Colored point pulses; charts, app, tie, scales and icons fly into a collage around a headline that grows “With” → “With OpenAI” → “With OpenAI for Law”. The whole collage contracts toward a center dot, which changes color and resolves into the OpenAI mark. | Stage each artifact on separate depth/timing tracks; contract all toward the same focal point before the final mark appears. |

## Measured handoff details

The following are visual measurements from exact local source frames, rounded to the nearest useful pixel. They specify the visible result, not the source project's unknown easing functions.

| Time | Source observation | Implemented track |
| --- | --- | --- |
| 7.50 | Black disk radius about 240 px on white; no dark-scene wash. | Motion IR point scale about 13.3, parent white scene fully opaque. |
| 7.55 nominal FFmpeg seek (decoded draft frame about 7.566) | Disk radius about 530 px, touching near the top and bottom. | Point scale 29.5 at 7.566 s, still on white; title starts later. |
| 7.60 | Disk radius about 870 px; white corners remain; “Astra” appears inside. | Point scale about 48.3; title carried by the point scene. |
| 7.65–7.70 | Full black field with sparse stars and only “Astra”. | Atomic scene transfer after disk coverage; star field enters in depth layers. |
| 7.75–7.86 | “for” and “Law” extend from the same left text anchor as camera streaks build. | Separate title states on a fixed x anchor; galaxy burst and reveal advance on independent virtual-clock tracks. |
| 10.40 | Spiral remains intact behind the full title. | Exit warp waits until after 10.42. |
| 10.60–10.80 | Spiral becomes a soft radial tunnel, then washes gray to white; “B” starts the next chapter. | Radial expansion plus defocus; dark-scene handoff continues through 10.70 and the white chapter resolves at 10.80. |
| 73.50–74.20 | “With” orange → “With OpenAI” pale pink → complete black title with lavender “Law”; objects arrive on distinct paths. | Phrase, color, position and artifact tracks are keyed separately. |
| 74.80 | Collage pieces have contracted near the title while text remains large and black. | Per-object offsets and scale converge toward the same center before the final point. |

## Micro interaction and camera analysis

| Scene | Visible micro interactions | Camera/depth interpretation used in this cut |
| --- | --- | --- |
| Firm tiles → composer | Tiles enter one after another, move left, and isolate the last Cooley tile under a pointer. The composer then reveals an empty placeholder before text types. | A tile remains in motion across the boundary; composer zoom, input height, text size, and typing use separate tracks instead of a parent fade. |
| Composer → response → Word | Typed prompt reveals characters; model controls change prominence at close crop; status lines stack; the attachment is clicked and held in the foreground. | Camera pushes into the composer, tracks across it, then pulls back. The file card persists while the response background gives way to Word; the Word window grows from a narrow panel. |
| Tools → skills | Orbit tiles enter and leave in staggered order around a stable headline. Numeric skills counter changes before chips populate. | Radial tile position, size and exit timing are independent. Skills chips occupy several apparent depths through scale and restrained blur. |
| Privacy → safeguards | “Your” precedes pulsing blue dots, then two lines type. A blurred document rises with drifting particles and an eye mark before two safeguards clauses appear. | Text stays on the central axis while the document advances in apparent depth; defocus transfers attention into the safeguards headline. |
| Closing | Headline extends word by word and changes color; chart, tie, scales, app and icons enter separately, then converge. | Title baseline stays stable while each artifact follows its own translation and scale trajectory into a shared focal point. |

## Verification targets

1. Inspect before/during/after strips at 7.4, 10.4, 18.4, 37.3, 42.2, 49.1, 54.4, 57.8, 62.0, 64.0, 72.3 and 74.7 s. The source must not be replaced by an invented visual similarity score.
2. Verify virtual seeks at those moments, in reverse order, and compare repeated screenshots for deterministic output.
3. Check all motion under reduced-motion preference; the current beat's content should remain readable.
4. Decode the final export and inspect temporal strips, not only representative stills. Owner acceptance remains pending.

## Limits

These are source observations from sampled frames and visual interpretation of layer/camera movement; exact original easing curves and authoring method are unknown. The source partner marks at ~45–49 s are still an asset-provenance issue and are outside this motion pass.
