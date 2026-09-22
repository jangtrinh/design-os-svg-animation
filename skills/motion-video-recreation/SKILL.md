---
name: motion-video-recreation
description: "Recreate UI/UX launch promo videos, SaaS product motion, and 3D vector animations with 99% kinematic, spatial, and timing parity using virtual clocks, R3F, and headless Chrome."
user-invocable: true
when_to_use: "Use when tasked with analyzing, breaking down, and recreating a high-fidelity UI promo video (YouTube/MP4/brief) into both an exact video export and interactive React/Three.js components."
category: frontend
keywords: [video-recreation, motion-design, promo-video, three-js, r3f, headless-chrome, ffmpeg, anti-flop, virtual-clock]
license: MIT
metadata:
  author: design-os
  version: "1.0.0"
---

# Motion Video Recreation Skill

## Multi-Agent Runtime Compatibility

This skill is certified across three primary AI coding runtimes:

| Capability | Claude Code (`.claude`) | Codex Native (`Codex CLI`) | Antigravity (`Gemini Agentic`) |
| :--- | :--- | :--- | :--- |
| **Skill Name** | `/motion-video-recreation` | Task / Goal in `AGENTS.md` | `ak:motion-video-recreation` |
| **Shell Command** | `Bash` | `shell_command` | `run_command` |
| **File Read** | `View` / `Read` | `read_file` | `view_file` |
| **File Write/Edit**| `WriteFile` / `FileEdit` | `file_edit` | `write_to_file` / `replace_file_content` |
| **User Dialog** | `AskUserQuestion` | `request_user_input` | `ask_question` |
| **Expert Consult**| Internal reasoning | GPT-6-Astra deep thinking | MCP `codex-chatgpt-web` |

---

## Immutable Hardrules
1. **Mandatory Product Designer Consultation (MUST-CALL)**: Before creating, refining, or modifying any animation scenes or UI mockups, agents MUST activate and follow the `product-designer` skill (`/product-designer` or `ak:product-designer`). Enforce EaseUI tactile depth, 1px subtle borders, authentic SVGL marks, and undistorted 3D projections.
2. **Zero Raw Emojis / Official Vector Icon Sets Only**: NEVER use raw Unicode emojis (e.g. 📦, 📄, 🚀, 🤖, 🎨) as UI icons, button graphics, indicators, or decorative markers in code or documentation. ALWAYS use official vector icon libraries (Phosphor Icons `@phosphor-icons/core` or Lucide Icons `lucide-react` via SVG `<defs>` + `<use>` or React icon components).
3. **Deterministic Virtual Clock**: All video/motion timelines must decouple from wall-clock time and expose a deterministic time hook (`window.__seekToTime(t)`).
4. **GPU-Composited Transforms Only**: Strictly limit active continuous animations to `transform` (`translate3d`, `scale`, `rotate`) and `opacity`. Avoid layout thrashing (`width`, `height`, `top`, `left`, `d`).
5. **Mandatory A11y Reduced Motion**: All animations must feature `@media (prefers-reduced-motion: reduce)` fallbacks.
6. **Zero Design Flop**: Generated assets and videos must pass `python3 scripts/anti-flop-gate.py` with exit code 0.

---

## The 5-Phase Workflow

### Phase 0: Mandatory Product Designer Alignment (Gate 0)
- Activate skill `product-designer` (`ak:product-designer` / `/product-designer`).
- Validate iconography against official Phosphor sets and brand marks against SVGL (`https://svgl.app/`).
- Inspect tactile depth, multi-layer ambient/key drop shadows, and 1px borders.
- Check 3D canvas aspect ratio dynamically to avoid oval/stretched projections.

### Phase 1: Temporal & Kinematic Deconstruction
1. **Timecode & Scene Table**: Partition the reference into scenes with exact start/end seconds and durations.
2. **Kinematic Curves**: Extract acceleration profiles:
   - Primary entrance easing: `cubic-bezier(0.16, 1, 0.3, 1)` (Quartic Ease-Out).
   - Spring dynamics: Mass $m=1.0$, Stiffness $k=180$, Damping $c=24$.
3. **Design Tokens**: Document colors (zinc-900 `#18181B`, paper-light `#FAF9F5`, coral `#D96B43`, emerald `#34D399`), typography, and border radials.

### Phase 2: Expert Consultation & Anti-Flop Pre-Flight
1. **Consultation**: Pass topological formulas and motion curves to Codex Native (`ask_codex_native` or GPT-6-Astra) or run a 5-persona debate (Architect, Motion Designer, GPU Engineer, Front-End Engineer, A11y Auditor).
2. **Motion IR Validation**: Structure animation sequences in JSON schema before emitting code.

### Phase 3: Dual-Target Implementation
1. **Target A — Standalone Virtual-Clock Web Engine**:
   - Create single-page or bundled player with explicit virtual clock `window.__seekToTime(t)`.
   - Never rely on `requestAnimationFrame` timing for video capture — rely strictly on step-based deterministic time.
2. **Target B — Production Component Suite**:
   - Modularize into production-ready components (`InteractiveGlobeWorkspace.tsx`, `ExpandingInput.tsx`, etc.).
   - Use `@react-three/fiber` and `@react-three/drei` for 3D elements, Framer Motion for UI state transitions.

### Phase 4: Headless Frame Capture & FFmpeg Rendering
1. Run local HTTP server hosting the virtual-clock player:
   ```bash
   python3 -m http.server 3033 --directory ./promo &
   ```
2. Execute the headless frame capture script:
   ```bash
   python3 scripts/export-promo-video.py
   ```
3. Encode high-profile MP4:
   ```bash
   ffmpeg -y -framerate 30 -i /tmp/frames/frame_%04d.png -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p output.mp4
   ```

### Phase 5: Anti-Flop & Quality Assurance Certification
Run the automated verification suite:
```bash
python3 scripts/anti-flop-gate.py
```
Ensure all 5 gates pass:
- [x] Official Phosphor / Lucide icons (no hand-drawn rough SVG hacks)
- [x] WCAG 2.2 AA Contrast & Typography Smoothing
- [x] Tactile Depth & 8pt/4pt Modular Spacing Grid
- [x] Accessibility & `@media (prefers-reduced-motion: reduce)`
- [x] Security, Coordinate Realism & Determinism
