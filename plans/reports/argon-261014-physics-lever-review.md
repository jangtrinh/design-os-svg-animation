Fix the layer/depth sorting bug in [`physics-lever-geometry.mjs:91`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever-geometry.mjs#L91) and the vertical-cylinder load tilt bug in [`physics-lever-geometry.mjs:45-49`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever-geometry.mjs#L45-L49) before shipping.

### Ranked Findings

1. **[CONFIRMED] Severe painter's-order corruption inside `base`, `carriage`, and `wedge`/`beam` layers (`markup` ignores `A.settle` and sorts coarse layers by 3D centroid depth)**
   - **Location:** [`playground/physics-figures/physics-lever-geometry.mjs:7`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever-geometry.mjs#L7), [`playground/physics-figures/physics-lever-geometry.mjs:31-44`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever-geometry.mjs#L31-L44), [`playground/physics-figures/physics-lever-geometry.mjs:91-92`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever-geometry.mjs#L91-L92), [`scripts/audit-physics-lever.mjs:11-13`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/scripts/audit-physics-lever.mjs#L11-L13)
   - **Evidence:**
     ```js
     const LAYER = { base: 0, carriage: 1, wedge: 2, beam: 3, load: 4 }; // painter's order, then depth inside a layer
     ...
     const items = partsOf(state).map((part) => ({ svg: draw(k, P, part, state, mark), rank: LAYER[part.layer] * 1e4 + k.depthOf(part.at, P) }));
     return items.sort((a, b) => a.rank - b.rank).map((item) => item.svg).join("");
     ```
   - **Why it breaks (Item 3):**
     - All 27 base parts (`stand.foot.*`, `base.plate`, `base.ruler`, `base.label`, `base.label-screw.*`, `base.washer.*`, `base.screw.*`, `base.rail.*`, `base.stop.*`) share `layer = "base"` (`0`). In `azimuth: 45, elevation: 30`, `k.depthOf(part.at, P)` is dominated by horizontal `(x, y)` coordinates (`±66`, `±22`) rather than `z` (`0..8`). Consequently, `base.plate` (`at = [0, 0, 3.3]`) has a higher `depthOf` than every top-mounted part on the far half of the plate (`base.rail.1` at `[0, -10, 5.5]`, `base.label` at `[0, -18.5, 5.15]`, `base.label-screw.*`, far `base.washer.*`/`base.screw.*`, and far `base.stop.*`), so `base.plate`'s opaque fill paints **over** those parts. Simultaneously, front-side feet (`stand.foot` at `z = 0..1.8`) have a higher `depthOf` than `base.plate` (`[0, 0, 3.3]`) and paint **on top of** the base plate they sit underneath.
     - In `layer = "carriage"` (`1`), `lever.bush.2` (`at = [xf, 10, 6.95]`, `z ∈ [6.2, 7.7]`) sits physically **under** `lever.deck` (`at = [xf, 0, 8.6]`, `z ∈ [7.7, 9.5]`, `y ∈ [-12, 12]`), but `depthOf([xf, 10, 6.95]) > depthOf([xf, 0, 8.6])`, so `lever.bush.2` paints **on top of** `lever.deck` in every frame.
     - Across `wedge` (`2`) and `beam` (`3`), `lever.wedge` has `half = 5` (`y ∈ [-5, 5]`) while `lever.beam` has `DY = 4.2` (`y ∈ [-4.2, 4.2]`). When the beam tilts (`th = ±0.16`), its downward side drops below `ZB = 18.6`, and because `LAYER.wedge < LAYER.beam`, the beam (`y = 4.2`) paints over the front cheek of the wedge (`y ∈ [4.2, 5]`) that is physically closer to the camera.
     - [`scripts/audit-physics-lever.mjs:11-13`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/scripts/audit-physics-lever.mjs#L11-L13) hides all of this because `contribute()` does not use `markup()`'s sort order and calls `A.settle(R, view.P)` before `A.auditOrExit`.
   - **Fix:** Split `LAYER` into true vertical/structural sub-layers (`feet: 0, plate: 1, deck_fixtures: 2, stops: 3, bush: 4, deck: 5, knob: 6, bolts: 7, wedge: 8, beam: 9, load: 10`), narrow `lever.wedge` `half` to `<= DY` (e.g. `3.6`) or recess the beam/wedge properly, and make `audit-physics-lever.mjs` audit the exact order used by `markup()` across `xf ∈ [-20, -8, 15]` without calling `A.settle` to mask ordering bugs.

2. **[CONFIRMED] Disc stacks do not honest-to-scale reflect the 2:1 force ratio and stay world-vertical when the beam tilts**
   - **Location:** [`playground/physics-figures/physics-lever-geometry.mjs:6`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever-geometry.mjs#L6), [`playground/physics-figures/physics-lever-geometry.mjs:45-49`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever-geometry.mjs#L45-L49)
   - **Evidence:**
     ```js
     const STACKS = [[X1, 3, 4.6], [X2, 2, 3.35]]; // x, discs, radius: F1 = 2 * F2 so d2 = 2 * d1 balances
     ...
     STACKS.forEach(([x, count, r], s) => {
       const [sx, sz] = turn(x, ZB + BH, xf, th); // seat on the beam top
       for (let i = 0; i < count; i++) parts.push(cyl(`lever.mass.${s}${i + 1}`, sx, 0, r, sz + i * DISC, DISC, "mid", "load"));
       parts.push(cyl(`lever.cap.${s}`, sx, 0, 1.3, sz + count * DISC, CAP, "hi", "load"));
     });
     ```
   - **Why it breaks (Items 1 & 6):**
     - **Force ratio honesty (Item 1):** Neither disc count (`3 : 2 = 1.5 : 1`) nor cylinder volume/mass ($3 \times 4.6^2 : 2 \times 3.35^2 = 63.48 : 22.445 \approx 2.83 : 1$) equals `F1 : F2 = 2 : 1`. Mixing both different disc counts (3 vs 2) and different radii (`4.6` vs `3.35`) makes the 2:1 ratio visually uncountable and volumetrically wrong (`2.83:1`).
     - **Parts sit on parts (Item 6):** `cyl(...)` constructs world-vertical cylinders (`+z` axis) stacked straight up at fixed `sx` (`sz + i * DISC`). When the beam tilts (`th = ±0.16`), the discs do not tilt with the beam: at `r = 4.6`, one edge of the bottom disc sinks into the sloped beam by $4.6 \sin(0.16) \approx 0.73$ units while the opposite edge floats $0.73$ units in the air. In addition, `r = 4.6 > DY = 4.2`, so the left stack overhangs the front and back edges of the beam.
     - **Note on the 3x zoom capture & tilt sign (Item 1):** In code, at the balanced pose (`xf = -8`), `d1 = -8 - (-24) = 16` and `d2 = 24 - (-8) = 32`, so the 3-disc stack at `X1 = -24` is always half as far from the wedge apex `[xf, ZB]` as the 2-disc stack at `X2 = +24`. The 3-disc stack only appears farther from the wedge when `xf > 0` (up to `xf = 15`, where `d1 = 39 > d2 = 9`), which is an unbalanced pose where the fulcrum has been slid to the right of center. Tilt direction matches net moment: when `net = M1 - M2 > 0` (`theta > 0`, left side heavier), `turn()` gives $z' = ZB + (x - x_f)\sin\theta$, so the left side ($x < x_f$) drops ($z' < ZB$) and the right side rises.
   - **Fix:** Use equal-radius unit discs in a true `2:1` count (e.g., `4` vs `2` discs or `2` vs `1` discs of radius `r = 3.8 <= DY = 4.2`), and either orient/extrude the discs along the tilted beam normal `( -sin(th), 0, cos(th) )` or seat each disc along the tilted spindle axis.

3. **[CONFIRMED] Camera projection mismatch (`HL.fit` on `200×160` + `C.ox/oy` overwrite) corrupts pointer unprojection**
   - **Location:** [`playground/physics-figures/physics-lever.js:14-18`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever.js#L14-L18), [`playground/physics-figures/physics-lever.js:36`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever.js#L36), [`playground/physics-figures/physics-lever-geometry.mjs:86-87`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever-geometry.mjs#L86-L87)
   - **Evidence:**
     ```js
     const view = L.frame(k);
     const C = HL.cam(45, 0.5, view.S);
     HL.fit(C, view.pts, 200, 160);
     C.ox = view.ox;
     C.oy = view.oy;
     ...
     const point = (pt) => (pt ? aim(HL.unproj(C, pt[0], pt[1], 9.5)[0], true) : aim(-8, false));
     ```
   - **Why it breaks (Item 2):**
     - `L.frame(k)` fits `view.P` to `400 × 320` with `{ pad: 42, azimuth: 45, elevation: 30 }` and computes `view.S = P.scale * Math.sqrt(1.6)`.
     - Line 16 then calls `HL.fit(C, view.pts, 200, 160)`, which **overwrites `C.s`** to fit a `200 × 160` viewport (roughly half the `400 × 320` scale), and lines 17–18 overwrite `C.ox` and `C.oy` with the `400 × 320` origin from `view.P`.
     - Furthermore, `HL.unproj(C, pt[0], pt[1], 9.5)[0]` unprojects screen `(u, v)` onto the full 2D plane `z = 9.5` at `azimuth = 45°`, meaning `worldX` depends on both screen `u` and screen `v`: moving the pointer vertically on the stage changes `xf` even when the cursor does not move horizontally, and moving along the rail axis `(x, y = 0, z = 9.5)` is skewed by the broken `C.s`.
   - **Fix:** Remove `HL.fit(C, view.pts, 200, 160)` (or project the pointer directly onto the 1D rail line `y = 0, z = DECK` using `k.iso([0, 0, DECK], view.P)` and `k.iso([1, 0, DECK], view.P)` so cursor projection uses the exact same `view.P` matrix as rendering and is purely 1D along the rail).

4. **[CONFIRMED] Three conflicting balance thresholds (`0.267`, `0.08`, `0.04`), sticky `hold` state from `set(v)`, and discontinuous `theta` clamp**
   - **Location:** [`playground/physics-figures/physics-lever.js:23-25`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever.js#L23-L25), [`playground/physics-figures/physics-lever.js:46`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever.js#L46), [`playground/physics-figures/physics-lever-geometry.mjs:10-12`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever-geometry.mjs#L10-L12)
   - **Evidence:**
     ```js
     // physics-lever-geometry.mjs:10-12
     const d1 = xf - X1, d2 = X2 - xf, M1 = F1 * d1 * 0.01, M2 = F2 * d2 * 0.01, net = M1 - M2;
     const theta = Math.abs(net) < 0.08 ? 0 : Math.max(-LIM, Math.min(LIM, (net / 1.8) * LIM));
     return { d1, d2, M1, M2, net, theta, balanced: Math.abs(net) < 0.08 };
     // physics-lever.js:25, 46
     const accent = hold || Math.abs(sp.x + 8) > 0.08 ? "wedge" : "beam";
     ...
     return { set(v) { aim(v, Math.abs(Number(v) + 8) > 0.04); }, destroy: bag.dispose };
     ```
   - **Why it breaks (Items 2 & 6):**
     - Since `net = 0.3 * (xf + 8)`, `posed.balanced` (`|net| < 0.08`) holds for `|xf + 8| < 0.2667`, whereas `paint()` switches `accent` to `"beam"` only when `|sp.x + 8| <= 0.08` and `!hold`, and `set(v)` sets `hold = true` whenever `|v + 8| > 0.04`.
     - If the slider sets `v` anywhere in `0.04 < |v + 8| < 0.2667` (e.g. `v = -7.9`), `posed.balanced` is `true` and `readout` displays `M₁=3.2 == M₂=3.2 N·m`, yet `accent` stays stuck on `"wedge"` instead of lighting `"beam"`.
     - `theta` is computed algebraically from `sp.x` (no rotational spring DOF), steps discontinuously at `|net| = 0.08`, and saturates hard at `|net| = 1.8` (`xf = -2`), leaving the beam tilt completely frozen across the entire right half of the slider range `xf ∈ [-2, 15]`.
     - If `hold` changes while `HL.r2(sp.x)` is unchanged and the spring is already at rest, `aim()` only calls `reg.wake()` without calling `paint()` synchronously; under reduced motion or settled springs where `HL.stepS` returns `false`, rely on `posed.balanced` directly and call `paint()` when `hold` changes.
   - **Fix:** Drive `accent` from `!hold && posed.balanced ? "beam" : "wedge"`, pass ` false` for `held` in `set(v)` (or `Math.abs(Number(v) + 8) >= 0.2667`), and widen the moment-to-tilt scaling so `theta` varies smoothly across the full `[-20, 15]` range without saturating at `xf = -2`.

5. **[CONFIRMED] Build script relies on parent-directory path `../.agents/...` and `process.cwd()`**
   - **Location:** [`scripts/build-physics-page.mjs:5-6`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/scripts/build-physics-page.mjs#L5-L6), [`scripts/bundle-physics.mjs:7`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/scripts/bundle-physics.mjs#L7)
   - **Evidence:**
     ```js
     const ROOT = process.cwd();
     const kernelPath = process.env.HAIRLINE_KERNEL || path.join(ROOT, '../.agents/skills/hairline-create/kernel.js');
     ```
   - **Why it breaks (Item 4):**
     - `path.join(ROOT, '../.agents/skills/hairline-create/kernel.js')` escapes the repository root into `..`, which only exists in a specific workspace nesting (`<parent>/.agents/...`) and fails in standard clones, CI, or differently nested git worktrees unless `HAIRLINE_KERNEL` is manually exported.
     - Using `process.cwd()` instead of `import.meta.dirname` fails when scripts are invoked from outside the repo root.
   - **Fix:** Vendor `kernel.js` under `vendor/` (matching `vendor/anatomy/kit/`) or resolve `HAIRLINE_KERNEL` -> `path.join(ROOT, '.agents/...')` -> `path.join(os.homedir(), '.agents/...')`, and anchor `ROOT` with `path.resolve(import.meta.dirname, '..')`.

6. **[CONFIRMED] Anatomy doctrine violations: `free: true` floating strokes on `base.label`, missing center indicator promised in `means`, and over-busy 27-part base**
   - **Location:** [`playground/physics-figures/physics-lever-geometry.mjs:69-70`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever-geometry.mjs#L69-L70), [`playground/physics-figures/physics-lever.js:5`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever.js#L5)
   - **Evidence:**
     ```js
     const rules = [-12, -4, 4].map((x) => k.lineOnTop([x, -19.2], [x + 5, -19.2], TOP + 0.78, P)).join("");
     return k.lineSvg(rules, { tone: "faint", free: true, className: "nf" }) + k.faceTextSvg(k.topMatrix([0, -18.6], TOP + 0.78, P), "1:2", { size: 2.4, tone: "mid", anchor: "middle" });
     ```
   - **Why it breaks (Item 6):**
     - `free: true` suppresses the anatomy audit's "lines end on something" rule for three unanchored decorative strokes floating at `z = TOP + 0.78` (`0.08` above `base.label`'s top face at `TOP + 0.7`).
     - `means` ([`physics-lever.js:5`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever.js#L5)) claims *"kim chỉ tâm kích hoạt trạng thái cân bằng"* (a center pointer/needle activates at equilibrium), which does not exist in the figure.
     - At `1x`, 27 base/fastener parts on a `152 × 52` plate visually compete with the lever itself.
   - **Fix:** Delete the `free: true` decorative lines on `base.label`, update `means` to match the actual beam-accent equilibrium cue (or add the center index mark on the wedge/beam), and trim non-essential base fasteners.

7. **[CONFIRMED] Line-budget test allows 150 combined lines packed via comma-chained one-liners while omitting geometry/order audit from `npm test`**
   - **Location:** [`tests/physics-suite.test.mjs:50-63`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/tests/physics-suite.test.mjs#L50-L63)
   - **Evidence:**
     ```js
     const lines = ['physics-lever.js', 'physics-lever-geometry.mjs']
       .map((file) => readFileSync(path.join(ROOT, 'playground/physics-figures', file), 'utf8').trimEnd().split('\n').length);
     assert.ok(lines[0] + lines[1] <= 150, `lever figure code is ${lines[0] + lines[1]} lines, over the 150-line budget`);
     ```
   - **Why it breaks (Item 5):**
     - Raising the single-file figure budget to a combined 150-line cap (`48 + 102 = 150`) encouraged packing multi-statement logic onto 150–175-character lines while only testing `model(-8)` (the rest pose) and never running the anatomy/order audit or testing `model()` at unbalanced poses in `physics-suite.test.mjs`.
   - **Fix:** Add assertions in `tests/physics-suite.test.mjs` for unbalanced poses (`model(-20).theta < 0`, `model(15).theta > 0`) and invoke the anatomy audit across `[-20, -8, 15]` inside the test suite.

Verdict: **DO_NOT_SHIP**

Next action: Edit [`playground/physics-figures/physics-lever-geometry.mjs:7`](file:///Users/jang/orca/workspaces/design-os-svg-animation/anatomy-lever-pilot/playground/physics-figures/physics-lever-geometry.mjs#L7) to replace the 5-bucket `LAYER` table with fine-grained structural layers (`feet` -> `plate` -> `fixtures` -> `stops` -> `bush` -> `deck` -> `knob` -> `bolts` -> `wedge` -> `beam` -> `load`) so `base.plate` and `lever.bush.2` stop painting over parts above them (~5 min).
