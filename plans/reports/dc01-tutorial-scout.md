# DC-01 tutorial scout (2026-10-14)
Read-only scout of `design-os-3d-blender/builds/desktop-companion` (B), done by an Explore agent on Haiku; the controller saved this summary.
Quotes are verbatim from the agent's report. Re-grep before you quote any number: state.md loses spaces in tool output.

## Facts that drive the storyboard
- **Inputs:** `references/source-registry.json` lists REF01 (owner photo, 335x597) and REF02–05 (generated turnaround, blueprint, exploded, parts catalog; 1448x1086) with SHA256 values, all `local_copy_exists: false`.
  - A hash search of 76,711 images on this Mac (2026-10-14) found none of them; a name and pixel-size search also found nothing.
  - So the reference images are NOT available.
- **Contract** (`design-parameters.json`):
  - purpose `both`;
  - shell 80 x 64 x 94 mm, wall nominal 2.4, wall min 2.0;
  - overall target 96 x 76 x 116 mm;
  - "proposed engineering dimensions, not measured from image".
- **Mechanical ladder M01–M29:**
  - failures: M02 and M03 shell gate FAIL; M19 form FAIL + E02 fit FAIL; M25, M26 and M27 form FAIL (thin upper shell 0.79 / 1.63 / 1.79 mm); M28 form PASS but fit FAIL (charger bolt/washer vs EL04_X3);
  - M29: form PASS, E02 fit PASS (1,367 meshes, 1,966 candidate pairs, 0 above 0.001 mm³), visual_fidelity NOT_ACCEPTED, manufacture BLOCKED.
- **Images per revision:** only M19, M28 and M29 have `verification/front.png` + `rear.png` (512 px).
- **Electronics** (native KiCad 10.0.6):
  - A01: schematic failed to load;
  - A02: 84 ERC violations;
  - A03: ERC 0;
  - A04: ERC 0 / DRC 0 / unconnected 0 / parity 0;
  - fabrication BLOCKED, 0 physical samples.
- **Print kit:**
  - P01 FAIL (CHARGER_FRAME, BUTTON_DIAPHRAGM);
  - P02 and P03 PASS on all 18 parts, 17 PETG + 1 TPU;
  - no slicer or G-code; physical print BLOCKED.
- **Integration:**
  - I06 delta-fit PASS and service-sequence PASS;
  - harness H13 routes 26 connections (54 curves);
  - the H12 "PASS" was false: 2.996432 mm against 3 mm (lessons doc line 38).
- **Delivery R03:**
  - DIGITAL_DEMO_DELIVERED, 65 links verified, archive 66,782,285 bytes;
  - animatic 1920x1080, 30 fps, 39.0 s, 1,170 frames, 589 distinct states (D06);
  - the D05 film (120 poses at 5 fps, repeated to 30 fps) was rejected by the owner.
- **Usable media:**
  - `delivery/R03/stills/*` (1920x1080);
  - `delivery/R03/dc01-native-animatic.mp4`;
  - `electronics/previews/*`;
  - `integration/engineering/I06/verification/*`;
  - `print-kit/P03/verification/plate-*.png`;
  - `runs/blockout-A0*/.../{hero,front,side,back}.png`;
  - `presentation/D01-D04/preflight/*`;
  - `delivery/R03-browser-review/{desktop,mobile,player}.png`.
- **Lessons** (`docs/native-build-pipeline-lessons.md`):
  - line 37: D05 film;
  - line 38: false H12 PASS;
  - line 41: I05 cleanup broke the charger mesh;
  - line 42: Metal render rejected;
  - line 104: an unmanifested pass script.
- **Sentinel trap:** `mechanical/run-M19.log` is AGENT_OK while `mechanical/M19/fit.log` is AGENT_FAIL. An AGENT_OK step is not a gate pass.

## Open
- Reference images: ask the owner to supply them later. The Input chapter uses the registry plus the blockout renders, and states that the photos are not on disk.
- The P01 → P02 fix is not documented in any folder file. Read final-gate.json diffs before scripting it.
- Height: state.md:25 says ~112 mm, while design-parameters.json says height_max 116 mm. Quote the parameter file.
