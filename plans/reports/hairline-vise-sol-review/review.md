# Machine vise — independent Hairline implementation and critique

Date: 2026-10-08. Original files were preserved. Deliverables: `playground/vise-sol.js` (137 lines) and its self-contained generated HTML.

## Limits first

The figure was **not looked at in a browser**. Headless Chrome failed to launch; the computer-use browser inventory returned a request-header policy error; native Chrome access was denied. Anti-Flop failed at Gate 6 because the sandbox cannot bind `127.0.0.1:4323`. Browser event delivery, CSS rendering, offscreen scheduling, responsive page layout, keyboard/touch usability, and browser reduced-motion behavior are unverified.

The images in `verify-pngs/` are fresh **non-browser renders**: the actual embedded Hairline kernel and source run in a simulated SVG DOM; the resulting paths are rasterized with librsvg through the existing installed Sharp package. Explicit palette attributes reproduce the kernel's settled light/dark classes. This is evidence about geometry and paint order, not a replacement for the browser look. Geometry images at 375/768/1440/874/971 are scaled SVG images, not responsive browser screenshots.

Visual comparison below is a reviewer judgment, not a pixel-parity percentage, owner acceptance, model benchmark, or manufacturing-CAD certification. The CAD image supplies no dimensions or physical screw pitch.

## Evidence and authority

The user-specified Hairline rules, immutable kernel, and immutable bench govern this surface. Product Designer was consulted; its shadow/glass defaults conflict with Hairline rules 04/06 and were not applied. The requested Hairline build uses the kernel's deterministic geometry, not a new Motion IR/video/HyperFrames pipeline. No arbitrary authored SVG path strings, custom palette, timer, or frame loop was introduced.

Reference: `/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2/.user_uploaded/media_1791454104904_8c227485.png`, visually inspected. SHA-256: `e53a6342f781159735518b7ef0b0181dda2aede877ca25d3f1fa8b7affb8db40`.

| Artifact | SHA-256 |
| --- | --- |
| Original JS | `50c9ee7befe95955a7ec00e209382820e465c3251ee1af79def8f7205719bcf8` |
| Original HTML | `25b0021a2775516c1376f6cc0d2c51d66a281a054fed881a7480af93f38aeebf` |
| Solution JS | `820bffd8c5020324cc58e08563136fa0a2b7495b8615c3adcc1de0b7193d4486` |
| Solution HTML | `85290112cf4a1f92236558f98b26f7e8d329664e8875015a1a0fd7614e1e79b6` |

FACT: source byte-for-byte matches the embedded figure in each HTML. FACT: original and alternative both pass the Hairline static validator. INFERENCE: the alternative is a clearer Hairline interpretation of the CAD assembly. UNKNOWN: browser motion quality and exact source dimensions.

## Detailed original review

### What works

The original recognizes the right assembly: base, fixed jaw, stepped moving jaw, twin guides, threaded screw, bearing and offset crank. It uses the prescribed camera, shared projection/rounded-prism functions, `HL.pointer`, shared `register`, and a disposer. Both springs settle; the kernel's reduced-motion branch settles them immediately in the simulation; `destroy()` empties the SVG. At 194 lines, the source meets the length limit. It contains no SVG text or custom stroke/color values.

### Highest-impact defects

| Finding | Source | Evidence and effect |
| --- | --- | --- |
| Travel intersects the bearing | `vise.js:146`, range at 192 | At gap 56, jaw interval is `[30,50]`, bearing `[38,48]`: 10 units overlap. This is a model-space intersection, not merely a projected overlap. |
| Incorrect raised-surface input | `vise.js:175` | A point on the resting jaw top `[-4,0,46]` is unprojected to ground coordinates approximately `[-60.34,-56.34]`; it requests closure. The hit plane is stable, so this does not prove flicker, but it maps the visible jaw to the wrong travel. No Y-bound restricts interaction to the machine. |
| No rest focal mark | `vise.js:151` | Default rest contains zero `hi` paths. The 3D rest pose is composed, but rules 04/05 explicitly also require one bright starting mark. |
| Hidden face is drawn over the body | `vise.js:118` | The moving pad lies on the negative-X contact face. With the +X/+Y viewing direction it is behind the moving casting, yet it is appended after the opaque body. The resulting render shows the pad across the body silhouette. |
| Surface details bypass rounded-solid discipline | `vise.js:41`, 45, 115, 138 | Raw quadrilateral caps/pads/arm have sharp geometric corners; line 115 explicitly adds a vertical corner edge. Stroke-linejoin rounding does not turn these into the required rounded geometry. |

Additional geometry issues: the fixed pad uses four tiny rectangular fasteners rather than the reference's two circular screw seats. The rings at line 52 have an X width of 0.6 and inset 0.4; the inner X interval reverses, violating the rule that inset stay below half the shorter side. The bearing cap at lines 60–61 is a vertical rounded prism, so it reads as a block rather than a horizontal shaft bearing. The guide rods are single dim centerlines, losing cylindrical volume. The grip body ends at X=72 while its end-face ring is drawn at X=74, leaving a visibly detached cap.

The “clamped 0mm” readout also overstates the geometry: the fixed face is X=-28 and the moving face bottoms out at X=-26, leaving 2 model units. There is no evidence those units are millimeters, no dimension calibration, and no resistance/torque model behind “tactile resistance.”

Motion and cost: both gap and rotation use custom spring constants `k=110,c=17` with no stated reason for overriding the required defaults. A second spring is unnecessary when rotation is a deterministic function of jaw travel. At minimum slider reach 20, the rest spring still targets 22 while displayed travel is clamped to 20, allowing displayed jaw and crank state to disagree. The callback returns false after settling, so the loop does sleep; nevertheless an unchanged tick rewrites 19 path attributes. That is rule 07's redundant-drawing failure, not an always-running RAF bug.

The dense dashed crosshatch adds detail but weakens the thumbnail hierarchy. Dashed construction guides and real knurling also become visually conflated. This is a Hairline adaptation problem, not evidence that texture should never be represented.

## Independent modeling decisions

1. **Model recognizable volumes before marks.** A tall fixed casting, stepped sliding casting, tapered crown, sole, reinforcing webs, and a separate bearing occupy distinct regions. The fixed contact insert keeps two round screw seats and three restrained machining marks. Its hidden opposing face is left occluded.
2. **Make all shafts actual axial solids.** `circ(...,32)` constructs Y/Z rings; the hull of two projected rings makes an opaque cylinder, with one inset end crease. This is a horizontal equivalent of the prescribed two-ring prism. The bearing and grip use the same helper and cannot develop unrelated floating end caps.
3. **Derive the crank from a single state.** One default `spring()` drives jaw travel. Crank angle is `0.9 + (gap - 23.56) × 2π / 3.5`; thread phase repeats every 3.5 model units. A filleted arm turns in its Y/Z plane, and the grip attaches at the same computed tip. The pitch is a modeling choice, not a measured property of the reference.
4. **Reserve physical travel.** Reach is clamped to 16–48. The fixed insert and closed moving face both lie at X=-42.7. The fixed foot ends at X=-43; the moving sole starts at or beyond -42.7. At maximum travel the rear jaw extent is 31.3 and the bearing foot starts at 42: 10.7 units of reserved clearance. Camera fitting includes the entire crank envelope.
5. **Use an explicit interaction and drawing contract.** A fixed Z=55 jaw-height sweep band maps the pointer to travel; it never reads the moving pose. The rest insert gives its highlight to the moving crown on input. Readout is `rest`/`jaw`, with no invented physical unit. `lastGap` suppresses unchanged geometry writes. The kernel owns events, spring settling, visibility scheduling and reduced-motion behavior.

Construction order is base/hardware → fixed casting → axial shafts/thread marks → moving casting → bearing → crank. Moving castings and the bearing hide the shafts behind them. Internal marks are `nf lo`; silhouettes retain their opaque ground fill. The bearing support was widened after the first render exposed an unattached near guide. The fixed foot/web and moving sole were also checked against closed-position contact so their volumes do not have to occupy the same space.

## Ten-rule accounting

| Rule | Alternative implementation | Evidence boundary |
| --- | --- | --- |
| 01 hit | Static jaw-height band, bounded Y, no rendered-pose reads | Source and simulated input; real pointer events unverified |
| 02 order | One mechanically coupled continuous mechanism; no independent list or spread | Distance staggering is inapplicable to this concept; no ordered queue is introduced |
| 03 reach | Bounded travel and full crank envelope | 18 slider/input cases plus 97 sampled travel/rotation poses; minimum frame margin 55.98 viewBox units |
| 04 accent | Kernel classes only; one semantic highlight transfers | Exactly one `hi` path at rest/active; custom-paint negative control rejected |
| 05 rest | Open assembly at 62% reach, offset crank, bright jaw insert | Fresh rest render inspected, including 240px geometry thumbnail |
| 06 honesty | Opaque solids and deliberate occlusion order | Source and fresh path render reviewed; not a general CAD hidden-surface solver |
| 07 cost | Shared register, return spring motion state, unchanged-draw guard | Idle tick returns false with zero path writes; browser offscreen behavior unverified |
| 08 clock | Default spring for continuous position; no discrete item choices | No tween follows a pointer; no item-selection spring or invented constants |
| 09 radius | Rounded rings, filleted webs/arm, inset dim creases | Source and fresh renders reviewed; literal sharp CAD facets intentionally softened |
| 10 quiet | Geometry only; concise external readout | No SVG text, labels, digits, arrows or decorative icons |

Rule 02 and the discrete half of rule 08 are conditional: adding an unrelated exploded-stack gesture simply to use a stagger/tween would weaken the requested machine-vise concept. This accounting does not claim all ten rules have been certified in a browser.

## Comparison and verdict

| Metric | Original | Alternative |
| --- | --- | --- |
| Source length | 194 lines | 137 lines |
| Static Hairline validator | Pass | Pass |
| Rest highlights | 0 | 1 |
| Maximum jaw/bearing relation | 10-unit intersection | 10.7-unit clearance to bearing foot |
| Unchanged-tick path writes | 19 | 0 |
| SVG paths | 55 | 71 |
| Guide representation | Centerlines | Opaque cylinders |
| Contact readout | Unsupported millimeter/closure claim | Semantic `jaw`/`rest` |

**Reviewer judgment:** the alternative is the stronger Hairline implementation. Its advantage comes from consistent solid construction, honest visibility, reserved travel, a designed highlight, and one coherent motion state. The original spends more code and visual attention on surface detail while leaving assembly and interaction defects unresolved.

The alternative is still a stylized recreation. Rounded-square fasteners substitute for the source's hexagonal nuts; three marks substitute for dense diamond knurling; the bearing support, jaw step and gussets simplify the exact machined profiles; thread marks indicate a screw rather than constructing a full Acme helix. It also has more SVG paths, so fewer lines and zero idle rewrites do **not** establish lower active-frame CPU cost. No performance benchmark or general model-quality ranking is claimed.

## Verification and tool receipts

`verification.log` contains the final-source command output and direct exits:

| Check | Result |
| --- | --- |
| Requested build | Exit 0 |
| Requested validate | Exit 0; kernel/bench intact |
| Targeted geometry probe | Exit 0; 18 endpoint/input cases + 97 crank/travel cases, finite in-frame geometry, one highlight, repeatable return to rest, reduced-motion settling, empty destroy, paint negative control |
| TypeScript | Exit 0; playground JS is outside TypeScript coverage |
| Repository tests | Exit 0; 40/40; not vise-specific |
| Anti-Flop | Exit 1; Gate 6 sandbox bind denied (EPERM, port 4323) |
| Static `ui gate` | Exit 0; 0 errors, 1 inherited `100vh` warning |
| Static slop scan | Exit 0; JSON `[]`; a small contrast/linear-transition control also returned `[]`, so sensitivity to those defects was not established |
| `ui gate` negative control | Exit 1; 8 errors in a deliberately malformed temporary fixture |
| Emoji source scan | No matches in new figure |
| Browser look, rendered a11y/layout gates | NOT RUN successfully; browser limitations above |

JEV: installed driver inspected and `jev-browser status --json` run; returned `connected:false` on CDP port 9222. Browser actions and model judgment NOT RUN. Laya MLX/System One: installed README and JEV adapter status inspected; typed-decision inference NOT APPLICABLE to establishing visual fidelity, and numerical claims were checked directly. No models/providers were installed or downloaded.

The immutable bench has inherited 32px-high controls and a `100vh` layout warning. It was not modified; mobile safety-floor acceptance and responsive screenshots remain open. No server or browser process remained running from this task. No commit, push, deployment, Figma write, or changes to original files were made.

**Status: DONE_WITH_CONCERNS.** Requested implementation/build/static validation and structured critique are delivered. Browser visual acceptance remains unverified. Next concrete action: open `playground/vise-sol.html` beside `playground/vise.html` in an authorized browser and run the eight-state Hairline look before production acceptance.
