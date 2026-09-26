# Recreation Contract: Vercel "Introducing v0: Generative UI"

## Contract Metadata
- **Source Video**: `https://www.youtube.com/watch?v=By9wCB9IZp0`
- **Title**: Introducing v0: Generative UI
- **Duration**: 47.508 seconds (2,850 frames @ 60fps)
- **Target Resolution**: 1920x1080 (16:9), 60 fps broadcast export
- **Theme**: Vercel Minimalist Light/Dark Mode + Generative Canvas + Tailwind/Geist Typography
- **Primary Font Stack**: Geist Sans, Inter, JetBrains Mono (Code/Terminal)
- **Brand Tokens**:
  - v0 Logo: Geometric `v` stroke + `0` square/circle glyph (exact SVGL geometry)
  - Vercel Logo: Official SVGL equilateral black triangle (`d="M128 0L256 221.705H0L128 0Z"`) + Vercel wordmark
  - Icons: Phosphor Icons Core (`@phosphor-icons/core`) via SVG `<defs>` + `<use>`
  - Window Chrome: 1px `#E4E4E7` / `#27272A` border, subtle ambient drop shadows
  - Color Palette:
    - Pure White: `#FFFFFF`
    - Zinc Dark: `#09090B`, `#111113`, `#18181B`, `#27272A`
    - Accent Blue: `#0070F3`, `#3B82F6`, `#EBF5FF`
    - Amber Badge: `#FEF3C7`, `#FDE68A`, `#92400E`
    - Emerald Green: `#D1FAE5`, `#A7F3D0`, `#065F46`

---

## Kinematics & Easing Profiles
- **Primary Camera Motion**: $C^1$-continuous cubic lerp `cubic-bezier(0.22, 1, 0.36, 1)` with continuous velocity across scenes.
- **Radial Construction Guidelines**: Geometric 45°/135° ray projection with stroke-dash interpolation.
- **Vertical Drum Reel**: $C^1$ rolling cylinder with vertical Gaussian blur fade (`filter: blur(1.2px)`) on peripheral items.
- **Component Popover Springs**: Mass $m = 1.0$, Stiffness $k = 180$, Damping $c = 24$ ($\zeta = 0.65$).
- **Cursor Interpolation**: Quintic polynomial curve smoothing between keyframe waypoints, with hand pointer transition on interactive elements.
- **Virtual Clock**: Deterministic time step via `window.__seekToTime(timestampSeconds)`.

---

## Second-by-Second Scene Deconstruction & Implementation Specifications

### Scene 1: Geometric Wireframe Construction & Radial Guidelines (00:00.00 – 00:03.20)
- **Timecode**: `00:00.00 – 00:03.20` (3.2s)
- **Background**: `#FFFFFF`
- **Composition & Mechanics**:
  - `00:00.0 – 00:01.2`: Thin 1px black outline stroke of the geometric `v0` glyph draws in via `stroke-dashoffset`.
  - `00:01.2 – 00:02.5`: Radial construction guidelines emerge (light grey dashed lines `#D4D4D8`):
    - 45° and 135° diagonal rays radiating outward from the vertices of 'v' and '0'.
    - Vertical alignment guidelines along left, center stem, and right bounds.
    - Horizontal guidelines at baseline and cap height.
    - Light geometric framing square around '0'.
    - Diagonal scanline sweep across the '0' diagonal slash.
    - Solid black fill sweeps across from left to right as the glyph solidifies into `#000000`.
  - `00:02.5 – 00:03.2`: Radial guidelines fade out, leaving the solid black mark. Scale smoothly contracts (1.00 -> 0.96) before scene transition.

### Scene 2 & 3A: Title Morph to Pill Capsule (00:03.20 – 00:06.50)
- **Timecode**: `00:03.20 – 00:06.50` (3.3s)
- **Background**: `#FFFFFF`
- **Typography & Morphing**:
  - `00:03.2 – 00:04.5`: "What will you ship?" fades in centered.
    - "What will" is black `#000000`, "you ship?" is neutral grey `#666666` (54px bold, letter-spacing `-0.03em`).
  - `00:04.5 – 00:05.4`: A tight black pill capsule forms smoothly around "What will you ship?", and the text transitions to crisp white `#FFFFFF`.
  - `00:05.4 – 00:06.5`: The black pill capsule smoothly interpolates horizontally to become the full prompt input bar (width 780px, height 72px):
    - Left: Guillermo Rauch circular photo avatar (36px) with a subtle vertical 1px divider line (`rgba(255, 255, 255, 0.15)`).
    - Right: Two circular dark grey buttons (`#737373` / `#5A5A5E`): Lock icon + Return key (`↵`).

### Scene 3B: Vertical Cylindrical Prompt Reel (00:06.50 – 00:13.50)
- **Timecode**: `00:06.50 – 00:13.50` (7.0s)
- **Drum Reel Cycling**:
  - `00:06.5 – 00:08.2`: Inside the pill: `A sleek pricing page|` (white text with blinking cursor). Below the pill: `A flower shop` (light grey, Gaussian blurred with downward fade).
  - `00:08.2 – 00:10.2`: The text drum rolls upward! `A sleek pricing page` moves up and blurs upward. `A flower shop` rolls into center, sharp white. Below the pill: `A SaaS dashboard layout` appears in blurred grey.
  - `00:10.2 – 00:12.0`: The drum rolls upward again! `A flower shop` moves up and blurs out. `A SaaS dashboard layout` rolls into center, sharp white. Below the pill: `A newsletter form in dark mode` appears in blurred grey.
  - `00:12.0 – 00:13.5`: Mouse cursor (macOS black arrow pointer) enters from bottom right and glides to the Return (`↵`) button. At 12.8s, the cursor clicks the Return button; button scales to 0.92 with visual ripple.

### Scene 4: Canvas Initialization & Streaming Wireframe (00:13.50 – 00:17.00)
- **Timecode**: `00:13.50 – 00:17.00` (3.5s)
- **Canvas App Layout**:
  - Top Navigation:
    - Left: `v0` logo `/` Guillermo avatar `A SaaS dashboard layout` `1 hour ago` `🔒 Private` (amber badge: `#FEF3C7`, border `#FDE68A`, text `#92400E`).
    - Right: Credits badge `ⓥ 200` + Hamburger menu `=`.
  - Above Canvas Card:
    - Left: Guillermo avatar, speech bubble `A SaaS dashboard layout`, `1 hour ago`.
    - Right: Toolbar with `New +`, `☆ 23`, Thumbs down, Thumbs up, Flag, `Fork ⤤`, `Share ⤤`, and black `Code </` button.
  - Main Canvas Card:
    - Left sidebar: `Acme Inc` (storefront icon), Nav items: `Dashboard` (active grey background), `Orders`, `Products`, `Customers`, `Analytics`, `Support`, `Settings`.
    - Main content: Search bar `🔍 Search products...`, dashed wireframe placeholder boxes (banner card + large chart card with streaming metric cards and animated bar chart).
  - Right Drawer: Thumbnail card `v0` with blue border and tag `v0`.
  - Bottom Floating Prompt Bar: `Make the text larger...` with Return (`↵`) and sparkle/pointer edit button.
  - `00:16.0 – 00:17.0`: Cursor moves to edit button on bottom prompt bar. Tooltip **`Click & Edit`** pops up directly above button! Cursor clicks the button.

### Scene 5: Camera Punch, Component Inspect & Blue Update (00:17.00 – 00:26.50)
- **Timecode**: `00:17.00 – 00:26.50` (9.5s)
- **Component-Level Edit**:
  - `00:17.0 – 00:18.5`: Camera initiates continuous $C^1$ zoom into top-left `Acme Inc` section (`scale 1.65`). Cursor moves to `Acme Inc` element.
  - `00:18.5 – 00:19.5`: `Acme Inc` element gets a dashed blue bounding box with light blue translucent fill and a blue pill tag **`svg`** in top-left corner! Cursor turns into macOS pointing hand. Cursor clicks `Acme Inc`.
  - `00:19.5 – 00:21.5`: Floating popover dialog springs open at bottom right of `Acme Inc`:
    - Text input: `|Make this element larger, add an element, change colors`
    - Right button: Blue button with text `Update ↵`.
  - `00:21.5 – 00:23.5`: Text types out character by character: `Make the company logo color blue|`. Cursor moves to `Update` button.
  - `00:23.5 – 00:25.0`: Cursor clicks `Update`. Return arrow in `Update` immediately switches to a **circular loading spinner (`Update ⟳`)**!
  - `00:25.0 – 00:26.5`: Popover disappears. `Acme Inc` icon and text smoothly morph into vibrant blue (`#0070F3`)! Speech bubble above card updates to `Make the company logo color blue`. Version history drawer shows `v1` thumbnail card with blue border and `v1` tag.

### Scene 6: Code View Flip & 3D Perspective Tilt (00:26.50 – 00:32.50)
- **Timecode**: `00:26.50 – 00:32.50` (6.0s)
- **Interaction & Canvas Flip**:
  - `00:26.5 – 00:28.0`: Camera smoothly zooms back to 1.0 full canvas view. Cursor moves up to `Code </` button in toolbar and clicks it. Toolbar button text flips from `Code </` to **`Canvas 🖵`**!
  - `00:28.0 – 00:31.5`: Canvas card flips/tilts in 3D perspective (`perspective: 1200px; transform: rotateY(-8deg) rotateX(4deg);`). Inside dark card (`#111113`):
    - Header: `Add this component to your project`, `Note: By using this code or product you agree to the pre-release agreement.`
    - Right button: `Learn more ↗`
    - CLI terminal command box: `>_ npx v0 add KfhD9whj4vi` with copy button.
    - Tabs: `React` (active black pill) and `HTML` (grey).
    - Full Next.js React code with authentic syntax highlighting.
  - `00:31.5 – 00:32.5`: Cursor moves back to `Canvas 🖵` button and clicks it. Button flips back to `Code </`, and workspace returns to 2D canvas view.

### Scene 7: Breadcrumb Stealth Mode & Privacy Dialog (00:32.50 – 00:36.50)
- **Timecode**: `00:32.50 – 00:36.50` (4.0s)
- **Interaction & Toggle**:
  - `00:32.5 – 00:34.0`: Camera zooms smoothly into top breadcrumb area (`scale 1.55`). Cursor moves up to `🔒 Private` badge in breadcrumb bar and clicks it.
  - `00:34.0 – 00:35.8`: Stealth Mode dropdown modal appears:
    - Header: `Stealth Mode`, `Who can view this generation?`
    - Option 1 (Public): Light blue circle with blue unlocked lock, `Public`, `Anyone with a link can see this.`, radio circle `○`.
    - Option 2 (Private): Light amber circle with amber locked lock, `Private`, `Only you can see this.`, radio circle with solid checkmark `✔`.
  - `00:35.8 – 00:36.5`: Cursor moves to radio button for `Public` and clicks it. Checkmark flips to `Public` (solid black circle with white checkmark `✔`), and `Private` radio becomes empty `○`. Breadcrumb badge flips from amber `🔒 Private` to green/emerald `Public`!

### Scene 8: The 12-Card Generative Wall Zoom-Out & "v0.dev" (00:36.50 – 00:43.00)
- **Timecode**: `00:36.50 – 00:43.00` (6.5s)
- **Expansive Grid & Outro Title**:
  - `00:36.5 – 00:39.5`: Camera rapidly pulls out, smoothly scaling down the single card. The card recedes into an expansive **4×3 generative wall of 12 real, rendered UI projects**, each with its unique user avatar and prompt speech bubble:
    1. `A SaaS dashboard layout` (Acme Inc)
    2. `A SaaS analytics dashboard layout` (Analytics metrics)
    3. `A sleek pricing page for a SaaS.` (3-column tiers)
    4. `A cookie consent banner` (Toggle preferences modal)
    5. `Hero section with an email input` (Dark mode headline)
    6. `A FAQ section` (Accordion list)
    7. `A note taking app` (Yellow notepad)
    8. `A table of financial invoices` (Data table)
    9. `A toolbar for a wysiwyg editor` (Rich editor bar)
    10. `A dashboard for a saas app` (Navy sidebar dashboard)
    11. `Vercel toolbar clone` (Floating dark pill)
    12. `A news website` (Editorial layout)
  - `00:39.5 – 00:43.0`: The grid fades cleanly into pure white. In center: `v0.dev` appears in bold black sans-serif (`#000000`, 58px, letter-spacing `-0.04em`).

### Scene 9: Official Vercel Outro (00:43.00 – 00:47.50)
- **Timecode**: `00:43.00 – 00:47.50` (4.5s)
- **Brand Lockup & Settle**:
  - `00:43.0 – 00:44.5`: Black equilateral Vercel triangle mark appears centered.
  - `00:44.5 – 00:46.5`: Triangle mark smoothly translates left while `Vercel` wordmark slides/fades in on right to form locked horizontal brandmark (`▲ Vercel`).
  - `00:46.5 – 00:47.5`: Clean, elegant fade to pure white (`#FFFFFF`).

---

## Anti-Flop & Quality Assurance Checklist
- [x] Official Phosphor Icons Core (`@phosphor-icons/core`) via SVG `<defs>` and `<use>`
- [x] Official Vercel & v0 SVGL brand marks (zero generic emojis)
- [x] 100% Deterministic Virtual Clock via `window.__seekToTime(sec)`
- [x] Radiating construction guide lines (45°/135° diagonals, vertical/horizontal alignment axes)
- [x] Vertical 3D drum reel with top and bottom peripheral blurred reflections
- [x] Click & Edit tooltip on floating bottom prompt bar
- [x] Component inspection bounding box with blue translucent fill and `svg` tag
- [x] Spinning circular loader inside `Update` button (`Update ⟳`)
- [x] 3D perspective card tilt with `Code </` flipping to `Canvas 🖵`
- [x] Stealth Mode dropdown modal with radio circle toggle and checkmark flip
- [x] 4×3 expansive grid wall of 12 real rendered generation cards with distinct avatars and chat bubbles
- [x] Dynamic Vercel triangle center-to-left translation and wordmark slide-in
- [x] GPU-composited transforms only (`transform`, `opacity`)
- [x] WCAG 2.2 AA Contrast Compliance across Light and Dark themes
