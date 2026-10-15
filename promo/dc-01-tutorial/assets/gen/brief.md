Task: generate three concept reference sheets of ONE product, the desk robot shown in reference.jpg (this folder), for a tutorial video. Use your image generation capability: invoke the `image-generator` subagent (or any image generation tool you have) with reference.jpg as the visual reference.

Files to read: reference.jpg (this folder).
Files you may create: ONLY these three, in this folder:
  1. turnaround-360.png — "360° product view" sheet: the same robot shown from 6 angles (front, front-3/4, side, rear-3/4, rear, top) on a clean light-grey studio background, small angle labels (0°, 45°, 90°, 135°, 180°, top), a sheet title "360° PRODUCT VIEW" top-left.
  2. parts-catalog.png — "parts catalog" sheet: the robot's parts laid out in a grid (upper shell, lower shell, dark face window, display, two ear caps, two arms, button, main PCB, battery, charger board, screws), each with a short label and part number like P01, P02…; title "PARTS CATALOG".
  3. blueprint.png — technical "blueprint" sheet: white or pale-blue drafting paper with dark line drawings of the robot: front, side and top orthographic views plus one exploded view, with dimension lines and a title block reading "DC-01 DESKTOP COMPANION · CONCEPT"; dimensions are illustrative only.
Acceptance criteria:
  1. All three files exist, are PNG, landscape orientation, at least 1200 px wide.
  2. The robot in every sheet keeps the reference design: white rounded body split in an upper and lower shell, large dark face window with two white pill-shaped eyes, two cylindrical ear caps on top, two rounded side arms, a pill-shaped button under the face.
  3. No other file is created or modified anywhere.
Non-goals: no 3D models, no code, no edits to reference.jpg, no text claiming the drawings are measured or manufacturable.
Report: write report.md in this folder: which tool/subagent produced each image, the exact prompt used for each, and the output of `file *.png` and `sips -g pixelWidth -g pixelHeight *.png`.

Do not ask questions and do not stop to confirm. Every question you might ask is answered above; if one is not, choose the reading the brief most directly supports, state it under ASSUMPTIONS in the report, and continue.
Write the report to report.md before your final message; the final message repeats the Status line only.
Your "done" is not evidence. End the report with the exact commands you ran and their exact output, pasted, not summarized.
End report.md with: Status: DONE | DONE_WITH_CONCERNS | BLOCKED
