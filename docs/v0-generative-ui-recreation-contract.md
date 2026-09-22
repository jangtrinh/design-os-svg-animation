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
  - Vercel Logo: Official SVGL equilateral black triangle (`d="M128 32 L224 208 H32 Z"`) + Vercel wordmark
  - Icons: Phosphor Icons Core (`@phosphor-icons/core`) via SVG `<defs>` + `<use>`
  - Window Chrome: 1px `#E4E4E7` / `#27272A` border, subtle ambient drop shadows
  - Color Palette:
    - Pure White: `#FFFFFF`
    - Zinc Dark: `#09090B`, `#18181B`, `#27272A`
    - Accent Blue: `#2563EB`, `#3B82F6`
    - Amber Badge: `#F59E0B`, `#FEF3C7`
    - Emerald Green: `#10B981`

---

## Kinematics & Easing Profiles
- **Primary Camera Motion**: $C^1$-continuous cubic lerp `cubic-bezier(0.22, 1, 0.36, 1)` with continuous velocity across scenes.
- **Component Popover Springs**: Mass $m = 1.0$, Stiffness $k = 180$, Damping $c = 24$ ($\zeta = 0.65$).
- **Cursor Interpolation**: Quintic polynomial curve smoothing between keyframe waypoints.
- **Virtual Clock**: Deterministic time step via `window.__seekToTime(timestampSeconds)`.

---

## Scene-by-Scene Contract Specification

### Scene 1: Animated v0 Wireframe Stroke Logo
- **Timecode**: `00:00.00 – 00:03.00` (3.0s)
- **Background**: `#FFFFFF`
- **Composition**:
  - Center geometric logo: `v` angle + `0` squircle stroke drawing via `stroke-dashoffset`.
  - At `00:01.8s`, wireframe stroke fills into solid black `#000000` with subtle spring pop.
  - Scale: 0.95 -> 1.00.

### Scene 2: Title Card — "What will you ship?"
- **Timecode**: `00:03.00 – 00:05.50` (2.5s)
- **Background**: `#FFFFFF`
- **Typography**: `What will you ship?`
  - Font: Geist Sans / Inter, 700 weight, 56px, color `#09090B`, letter-spacing `-0.03em`.
  - Entrance: Opacity 0 -> 1, scale 0.98 -> 1.00 (Ease-out 400ms).
  - Exit: Smoothly morphs/fades as the pill prompt bar emerges.

### Scene 3: Vertical Reel Prompt Bar
- **Timecode**: `00:05.50 – 00:12.50` (7.0s)
- **Background**: `#FFFFFF`
- **Center Prompt Container**:
  - Floating pill (780px width, 72px height, background `#09090B`, border `1px solid rgba(255,255,255,0.12)`, shadow `0 20px 40px -10px rgba(0,0,0,0.25)`, border-radius 9999px).
  - Left: Guillermo avatar circular badge (36px).
  - Middle: Vertical prompt reel cycling with kinetic ease:
    1. `A sleek pricing page` (`00:06.0 – 00:07.5`)
    2. `A flower shop` (`00:07.5 – 00:09.5`)
    3. `A SaaS dashboard layout` (`00:09.5 – 00:12.5`)
  - Right:
    - Lock badge: `Private` pill (`#27272A` background, `#A1A1AA` text).
    - Submit button: 36px white circle with black upward arrow (`Phosphor ArrowUp`).
- **Interaction**:
  - Smooth cursor moves from bottom-right to the submit button at `00:11.8s`.
  - Click event triggers at `00:12.2s` with scale bounce (0.92 -> 1.0).

### Scene 4: Acme Inc Dashboard Canvas Streaming
- **Timecode**: `00:12.50 – 00:18.00` (5.5s)
- **Background**: `#F4F4F5`
- **Canvas App Layout**:
  - Top Navigation:
    - Left: v0 logo, `Acme Inc v` breadcrumb, `200 credits left` pill.
    - Right: `Fork`, `Share`, `Code </>` pill, `Private` amber badge.
  - Left Sidebar:
    - Navigation icons + labels: Dashboard (active), Orders, Products, Customers, Analytics, Support, Settings.
  - Main Dashboard Content (Progressive Wireframe Stream):
    - Top 4 Metric Cards: Total Revenue (`$45,231.89`), Subscriptions (`+2350`), Sales (`+12,234`), Active Now (`+573`).
    - Main Bar Chart: Animated SVG bar columns rising with staggered spring.
    - Recent Transactions Table: 5 table rows with user avatars, status badges, amounts.
  - Right Drawer:
    - History versions list: `v0` preview thumbnail card labeled "Initial prompt".

### Scene 5: Component-Level Blue Logo Edit
- **Timecode**: `00:18.00 – 00:26.00` (8.0s)
- **Interaction & Zoom**:
  - Camera zooms smoothly into the top-left `Acme Inc` header area (`scale 1.35`).
  - Cursor hovers over `Acme Inc` logo mark; vibrant blue outline snaps around the element with tag `svg`.
  - Cursor clicks logo at `00:19.5s`.
  - EaseUI popover dialog springs up:
    - Text: `Make the company logo color blue`
    - Button: `Update` with Sparkle icon.
  - Cursor clicks `Update` at `00:21.0s`:
    - Button switches to spinning loader.
    - At `00:23.0s`, update finishes: `Acme Inc` logo transitions to vibrant `#2563EB` blue.
    - Bottom chat stream registers user prompt + assistant confirmation.
    - Right history drawer animates `v1` version card appearing above `v0`.

### Scene 6: Code Inspector & CLI View
- **Timecode**: `00:26.00 – 00:33.00` (7.0s)
- **Interaction & Canvas Flip**:
  - Camera smoothly glides to top header. Cursor clicks `Code </>` at `00:27.0s`.
  - Workspace flips into dark IDE code view (`#0A0A0A`):
    - CLI Banner: `npx v0 add KfhD9whj4vi` with Phosphor Copy button.
    - Framework Switcher: `[React]` (active pill) and `[HTML]`.
    - Code Editor: Syntax-highlighted React component using Tailwind & shadcn/ui components (`Card`, `Button`, `Table`).

### Scene 7: Stealth Mode & Privacy Dialog
- **Timecode**: `00:33.00 – 00:38.50` (5.5s)
- **Interaction**:
  - Cursor glides to top-right `Private` badge and clicks at `00:34.0s`.
  - Modal popover appears:
    - Title: `Stealth Mode`
    - Subtitle: `Who can view this generation?`
    - Radio Options:
      - `Private` (Selected initially, lock icon, "Only you and your team")
      - `Public` (Globe icon, "Anyone with the link can view and fork")
  - Cursor moves to `Public` and selects it at `00:36.0s`.
  - Badge updates to `Public` with green status dot.

### Scene 8: "v0.dev" Title Screen
- **Timecode**: `00:38.50 – 00:43.00` (4.5s)
- **Background**: `#FFFFFF`
- **Typography**:
  - `v0.dev` (Geist Sans 700 bold, 64px, color `#09090B`, letter-spacing `-0.04em`).
  - Subtle breathing ambient glow.

### Scene 9: Vercel Outro
- **Timecode**: `00:43.00 – 00:47.50` (4.5s)
- **Background**: `#FFFFFF`
- **Animation**:
  - Vercel equilateral triangle logo (`M128 32 L224 208 H32 Z`) scales in from 0.85 -> 1.00 with spring damping.
  - "Vercel" wordmark fades in cleanly beneath the triangle.
  - Outro smoothly fades to clean white at `00:47.5s`.

---

## Anti-Flop & Quality Assurance Checklist
- [x] Official Phosphor Icons Core (`@phosphor-icons/core`) via SVG `<defs>` and `<use>`
- [x] Official Vercel & v0 SVGL brand marks (zero generic emojis)
- [x] 100% Deterministic Virtual Clock via `window.__seekToTime(sec)`
- [x] WCAG 2.2 AA Contrast Compliance across Light and Dark themes
- [x] GPU-composited transforms only (`transform`, `opacity`)
- [x] `@media (prefers-reduced-motion: reduce)` fallbacks
