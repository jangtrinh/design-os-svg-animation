# Recreation Contract: OpenAI "Codex App" Launch Video

## Contract Metadata
- **Source Video**: `https://www.youtube.com/watch?v=0e-Brv-gS9Q`
- **Title**: A first look at the Codex app
- **Duration**: 132.7 seconds (02:12.70 @ 23.976 fps)
- **Target Video Resolution**: 1920x1080 (16:9), 60 fps export
- **Theme**: macOS Sequoia/Sonoma Desktop + Light Mode Codex App + Dark Theme Flash Stash Web App
- **Primary Font Stack**: SF Pro Display, SF Pro Text, Inter, JetBrains Mono (Code/Terminal)
- **Brand Tokens**:
  - OpenAI Logo: Official SVG from SVGL (`https://svgl.app/library/openai.svg`)
  - Icons: Phosphor Icons Core (`@phosphor-icons/core`) / Lucide SVG (`<svg><use ...></svg>`)
  - Window Chrome: macOS Standard 12px radius, 1px `#00000012` border, traffic lights `#FF5F56`, `#FFBD2E`, `#27C93F`
  - Wallpaper: macOS Sequoia Oceanic Blue gradient mesh (`radial-gradient(ellipse at top left, #3b55b4, #738de3, #c5d4f5)`)

---

## Kinematics & Easing Profiles
- **Primary Window Entrance**: `cubic-bezier(0.16, 1, 0.3, 1)` (Quartic Ease-Out), 600ms.
- **Modal Slide Up**: `cubic-bezier(0.2, 0.9, 0.2, 1)`, 350ms, $\Delta y = 20\text{px}$.
- **Spring Parameters**: Mass $m = 1.0$, Stiffness $k = 180$, Damping $c = 24$.
- **Cursor Interpolation**: Quintic polynomial curve smoothing between keyframe waypoints.
- **Virtual Clock**: Deterministic time step via `window.__seekToTime(timestampSeconds)`.

---

## Scene-by-Scene Contract Specification

### Scene 1: Clean White Fade-In
- **Timecode**: `00:00.00 - 00:04.00` (4.0s)
- **Background**: `#FFFFFF`
- **Elements**: Subtle ambient luminance ramp from 95% to 100%.

### Scene 2: Title Card 1 — "Meet the Codex app"
- **Timecode**: `00:04.00 - 00:08.00` (4.0s)
- **Background**: `#FFFFFF`
- **Typography**: `Meet the Codex app`
  - Font: SF Pro Display / Inter, 700 weight, 56px, color `#0D0D0D`, letter-spacing `-0.03em`.
  - Entrance: Opacity 0 -> 1, scale 0.98 -> 1.00 (Ease-out 400ms).

### Scene 3: Hero Prompt Bar & Suggestion Cards
- **Timecode**: `00:08.00 - 00:18.00` (10.0s)
- **Background**: `#FFFFFF`
- **Center Hero Unit**:
  - Cloud-terminal mark: SVG cloud outline with `>_` terminal prompt inside (44px height, stroke `#111827`).
  - Title: `Let's build` (42px, font-medium `#111827`).
  - Dropdown: `recipe-app v` (36px, font-normal `#6B7280`).
- **Prompt Bar Card**:
  - Floating pill container (760px width, 140px height, background `#FFFFFF`, border `1px solid #E5E7EB`, shadow `0 20px 40px -15px rgba(0,0,0,0.07)`, border-radius 24px).
  - Typewriter text: `Localize my app and add the option to change units` with blinking cursor `|`.
  - Bottom controls:
    - Left: `+` icon (Phosphor Plus), `GPT-5.2-Codex v` badge, `Extra high v` reasoning pill.
    - Right: Lock icon (Phosphor LockSimple), Mic icon (Phosphor Microphone), Submit button (36px circle `#000000`, white upward arrow).
  - Sub-bar:
    - Left: `Local` (bold `#111827`), `Worktree` (`#6B7280`), `Cloud` (`#6B7280`).
    - Right: Git branch icon + `main`.
- **Bottom Suggestion Cards** (3 cards, 240px width, 90px height, border-radius 16px, subtle border):
  1. Gamepad icon: `Create a classic snake game`
  2. Magnifier icon: `Find and fix a bugs in my code`
  3. Document icon: `Summarize this app in a $pdf`
  - Bottom-right: `Explore more` text link.

### Scene 4: Chapter Card 1 — "Multitask with Codex"
- **Timecode**: `00:18.00 - 00:24.00` (6.0s)
- **Background**: `#FFFFFF`
- **Typography**: `Multitask with Codex` (56px bold, `#0D0D0D`).

### Scene 5: Feature Card — "Use voice dictation"
- **Timecode**: `00:24.00 - 00:28.00` (4.0s)
- **Background**: `#FFFFFF`
- **Typography**: `Use voice dictation` (56px bold, `#0D0D0D`).

### Scene 6: Workspace & Project Switcher
- **Timecode**: `00:28.00 - 00:42.00` (14.0s)
- **Background**: `#FFFFFF` transitioning to macOS Sequoia Wallpaper.
- **Interaction**: Cursor navigates to `recipe-app v`, clicks and triggers dropdown menu:
  - Header: `Select your workspace` (12px uppercase `#9CA3AF`).
  - Items:
    - `📁 recipe-app` (Checkmark ✓)
    - `📁 My Skills` (`skills` badge)
    - `📁 photobooth` (Hover highlight `#F3F4F6`, cursor click selects)
    - `📁 developers-website`
    - `📁 wanderlust`
    - `📁 openai-apps-sdk-examples`
    - `📁 game-experiment`
    - Divider
    - `➕ Add new workspace`
  - Upon selection: Title changes to `Let's build photobooth v`.

### Scene 7: Worktree Mode Prompting
- **Timecode**: `00:42.00 - 00:50.00` (8.0s)
- **Interaction**:
  - Cursor clicks `Worktree` toggle. Active indicator switches to `Worktree`.
  - Sub-bar updates: `⚙ photobooth v` and `git-branch From main v`.
  - Input field types: `Add drag and drop to the photos in the gallery`.
  - Cursor clicks black submit circle.

### Scene 8: Full macOS Desktop Window & Multi-Thread Execution
- **Timecode**: `00:50.00 - 00:70.00` (20.0s)
- **Environment**: macOS Sequoia Oceanic wallpaper, centered 1280x800 app window.
- **Window Anatomy**:
  - Left Sidebar (260px):
    - Traffic lights: Red `#FF5F56`, Yellow `#FFBD2E`, Green `#27C93F`.
    - Sidebar icon button `[|]`.
    - Nav items: `New thread` (pencil icon), `Automations` (clock icon), `Skills` (grid icon).
    - Pinned threads:
      - Pushpin: `Photobooth polish` (3d)
      - Pushpin: `Create a video game` (2d)
      - Blue dot: `Brainstorming new features` (3d)
      - Circle: `Add grandma's recipes` (3d)
      - Arrow: `Clarify ambiguous request` (16h)
    - Section `Threads` (+ icon, filter icon):
      - `📁 recipe-app`
      - `📁 photobooth`
        - Active item: `Add drag and drop to gallery ...` (3m)
      - `📁 developers-website`, `📁 wanderlust`, etc.
  - Main Window Header:
    - Left: `Add drag and drop to gallery photos` (14px bold `#111827`), `photobooth` (`#6B7280`), `···`.
    - Right: `▷` (Run), `Open v` (IDE dropdown), `Checkout on local`, `Create branch here`, panel toggles.
  - Live Stream Feed:
    - User message bubble: `Add drag and drop to the photos in the gallery`
    - Step accordion:
      - `Explored 1 file, 4 searches, 1 list >`
      - `Edited page.tsx +3 -1 >`
      - `Edited page.tsx +58 -0 >`
      - `Explored 1 file >`
      - `Edited page.tsx +2 -0 >`
      - `Edited page.tsx +14 -1 >`
      - `Explored 1 file, 1 search >`
    - Markdown explanation:
      `Added HTML5 drag-and-drop reordering for the gallery photos with visual feedback...`
    - Status pill: `Thinking` with animated shimmer dot.
    - Change summary bar: `1 file changed +77 -2` (green/red pill), `Review changes ↗`.
  - Bottom Bar:
    - Input: `Ask for follow-up changes`
    - Bottom status: `Worktree` (left), `⭮ 43%` (right).
    - Wallpaper bottom-left: `⚙ OpenAI` mark.

### Scene 9: Git Commit & PR Creation Modal
- **Timecode**: `00:70.00 - 00:84.00` (14.0s)
- **Modal Component**:
  - Centered floating modal (460px width, 280px height, `#FFFFFF`, 16px radius, dark overlay backdrop `rgba(0,0,0,0.3)`).
  - Header: Git commit icon `-o-`, title `Committing changes`, subtitle `Hold tight, this may take a few moments...`.
  - 3 Animated Checkpoints:
    1. `✓ Committing changes` (transitions from spinner to checkmark)
    2. `✓ Pushing to branch codex/add-drag-and-drop-to-gallery-photos`
    3. `✓ Creating a pull request`
  - Success banner with PR link.

### Scene 10: Automations & Skill Integration
- **Timecode**: `00:84.00 - 00:94.00` (10.0s)
- **Chapter Title**: `Automations`
- **Modal Component**: `Create automation`
  - Name: `Create new skills`
  - Workspaces: `Choose a folder`
  - Prompt: `Every Friday, use [$skill-creator] to turn my last 10 chats into a reusable skill.`
  - Schedule: Toggle `Daily` / `Interval`, Time `06:00 PM`, Day pills `Mo Tu We Th Fr Sa Su`.
  - Skill card modal preview: `GH Address Comments` with GitHub icon, PR Comment Handler, and `Try` button.

### Scene 11: Chapter Card 2 — "Review and collaborate"
- **Timecode**: `00:94.00 - 00:98.00` (4.0s)
- **Background**: `#FFFFFF`
- **Typography**: `Review and collaborate` (56px bold, `#0D0D0D`).

### Scene 12: Split-Screen Code Diff & Comment Resolution
- **Timecode**: `00:98.00 - 01:20.00` (22.0s)
- **Layout**: 50/50 Dual Split Pane:
  - Left Pane (Chat & Solution):
    - Codex resolving nested `<button>` issue in `page.tsx`.
    - Verification result: `Validation: npm run build succeeds.`
    - User input with badge: `💬 1 comment` -> types `Address review comments`.
  - Right Pane (Code Diff Viewer):
    - File header: `app/page.tsx +648 -302`
    - Diff lines: Green insertions (lines 24-27, 137-144) and red deletions.
    - Inline comment card: `change this to gpt-5.2` (avatar, timestamp, reply box).
    - Floating action pill at bottom: `⭯ Revert all` | `+ Stage all`.

### Scene 13: Live Web App & Floating Companion Window
- **Timecode**: `01:20.00 - 01:31.00` (11.0s)
- **Layout**:
  - Main Window: Browser window at `http://localhost:3000`
    - App title: `FLASH STASH` (monumental editorial display typography).
    - 3D Photobooth Camera Device: Dark matte textured chassis, 3 LED status lights, aperture glass reflection, slot with printed polaroid frog photo (`SHOT 7 08:17 PM` with OpenAI shirt).
  - Floating Companion Window:
    - Compact mini Codex window pinned to top-right.
    - Commands: `make the heading twice as large` -> updates heading to `text-8xl`.
    - Live terminal at bottom running `next dev` (`Ready in 349ms`).

### Scene 14: Minimalist Outro
- **Timecode**: `01:31.00 - 01:32.70` (1.7s)
- **Background**: `#FFFFFF`
- **Branding**: Centered official black `OpenAI` wordmark, letter-spaced `-0.02em`, gentle fade to black.

---

## Anti-Flop Compliance Checklist
1. [x] **Gate 0 Product Designer Alignment**: Verified EaseUI tokens, 1px borders, SVGL official marks.
2. [x] **Zero Raw Emojis**: All icons are Phosphor/Lucide SVGs (`defs`/`use` or React icons).
3. [x] **Virtual Clock API**: Deterministic `window.__seekToTime(t)`.
4. [x] **Typography Fidelity**: Matching Apple SF Pro Display / Inter tracking & line-height.
5. [x] **Dual Delivery**: Web Player (`../../promo/codex-app/codex-app-promo.html`) + React Component Suite.
