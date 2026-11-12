mode=review model=grok-4.7 stop=end_turn turns=1 secs=471
tokens in=70034 cached=1920 out=31836 session=01a13e02-90a9-75f0-87da-2565f93b3583 full=/Users/jang/.grok/runs/grok-review-2026-10-15T05-29-46-465Z.json
---
SHIP_WITH_FIXES

The cold distillation path still draws an open `nf hi` segment and hides the caps that were added to close it. Default temperature is boiling, which is the only pose the report checked, so a green rest-state gate does not cover this branch.

### 1. Major — cold drip stays open while its caps are hidden
`playground/chemistry-figures/chemistry-distillation.js:155` and `:160`  
CONFIRMED. Same logic is copied in `playground/chemistry-app.js`, `playground/chemistry.html`, and `docs/playground/chemistry.html`.

Evidence: `isBoiling` is `temp >= 78.3`. The spring is constructed at `78.3`, so the first frame takes the boiling branch and places both drip heads. `setTemp` clamps to `50..95`, and the readout already has a `< 78.3°C` branch, so the cold pose is a normal interaction.

```155:161:playground/chemistry-figures/chemistry-distillation.js
drpD = HL.seg(P(rX, rY, adaptTipWorld[2]), P(rX, rY, adaptTipWorld[2] - 0.5));
// ...
head.setAttribute("display", headAt[i] ? "inline" : "none");
```

The cold segment still runs from the adapter tip `(rX, rY, 8.8)` down to `(rX, rY, 8.3)`. The top meets the adapter. The bottom is the flask centerline, 2.0 world units inside the neck ring at z=8.4, so it does not land on that outline. `headAt` is only filled inside `if (isBoiling)`, so both heads get `display="none"` and nothing terminates that end.

Failure: set the temperature to 50°C. One `nf hi` end floats, and the terminal dots are not painted. The report says those dots are hidden “when no drip drawn”. The else branch does draw a drip.

Fix: keep the stub (it was already there) and cap the point that is actually drawn, e.g. push `P(rX, rY, adaptTipWorld[2] - 0.5)` into `headAt` in the else branch. Leave the second head hidden. Re-run the line-end gate after `setTemp(50)`, not only at the default 78.3°C pose.

### 2. Minor — every new terminal is a lit `dot`
CONFIRMED

| Location | What |
|---|---|
| `chemistry-distillation.js:48` | stem cap `class: "dot"` |
| `chemistry-distillation.js:92` | both nozzle barbs `class: "dot"` |
| `chemistry-distillation.js:116` | both drip heads `class: "dot"` |
| `chemistry-titration.js:94` | both handle tips `class: "dot"` |

`dot` is the hi/black accent; `dot m` is the edge tone. At distillation’s default pose (78.3°C, boiling) the figure shows the pre-existing neck `dot` plus five new black dots, including two beads that travel with the drips. Titration adds two more black dots on the stopcock. These sit on real endpoints (stem top, hose tips, drip bottoms, handle tips), so they are not checker-only decoys. They do multiply the lit accent the task allows one of.

Fix: give the new caps `class: "dot m"` and leave the existing neck `dot` as the single lit accent. `dot m` still closes a line end.

### Checked, not filed

- No gate-only geometry. Stem, nozzle, and handle dots use the same points as the segment endpoints. pH ticks changed from centered to one-sided, length still `tLen`, start on the track rule `P(tx, trackY, trackZ)`. Hang is +Y, toward the plate.
- Motion and physics. Stopcock angle, `scLen`, springs, `computePH`, boil/temp norms, and drip `dz` are unchanged. New dots are placed in the same `draw()` that updates the path, after the `lastKey` return.
- No per-frame DOM, no new listeners, no missing teardown. `handleTips` and `dripHeads` are created once. `display` is a presentation attribute, which matches the paint-audit constraint that rejected `.style`.
- Boiling drip upper ends (`dz + 0.45`) are geometrically free, but that is the pose reported as line-end 0. Pre-existing vapor dashes are the same kind of open mark, so this is not filed against the green default run.
- Source hunks and the three generated copies match. No `free` marks.

Verdict: **SHIP_WITH_FIXES**. Cap the cold stub, then re-check line ends below 78.3°C. Switch the new terminals to `dot m` if this suite is holding the single lit accent.
