# Decision: Hairline Meaningful Kinematics vs. Exploded CAD Slop

**Date:** 2026-10-08  
**Status:** Accepted  
**Scope:** `design-os-svg-animation`, `hairline-create`, `jang-personal-site`

## Context & Problem
Early vector figures and AI raster generation in `jang-personal-site` relied on "exploded views" — blowing assemblies apart along the vertical axis into floating slabs (standoffs, boards, faceplates). While visually complex, exploded disassembly violates Hairline Rule 06 (Honesty): real instruments on a bench do not fly apart into floating components during interaction.

Furthermore, static 2-frame raster AVIF cross-fades (200ms opacity swaps) suffered from pixel drift, lack of intermediate keyframes, and heavy asset sizes.

## Decision
1. **Meaningful Machine Interaction (Rule 06 Honesty):**
   - Replace arbitrary exploded views with the instrument's authentic working function on the bench.
   - For `case-terminal` (Payment Terminal): the device stays a solid, assembled chassis. Interaction drives **card insertion** along the reader slot axis ($-Y$) and **tactile button depression** on the 12-key keypad ($-Z$) with spring return and semantic highlight transfer (`.hi`).
2. **Solid-First Kinematics Pipeline:**
   - Enforce 2:1 axonometric isometric projection, zero inline styles, uniform hairline weights, and single-accent semantic hierarchy.
   - Master spring coupling ensures smooth, continuous 60fps response to reader touch/scrub.
3. **Artifact Portability:**
   - Every figure builds as a standalone, zero-dependency HTML/SVG file via `scripts/create-hairline-figure.mjs build` and validates against 10 strict mechanical rules via `validate.mjs`.

## Consequences
- **Positive:** Interactive figures read as tactile, physical instruments rather than sterile CAD diagrams.
- **Payload:** Replaces multi-frame raster AVIF assets with <160 lines of clean JS, rendering at 60fps with zero network requests.
