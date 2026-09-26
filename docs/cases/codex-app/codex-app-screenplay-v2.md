# Codex App Promo — High-Tempo 38.0s Cinematic Screenplay & Motion Architecture (V2)

## 1. Core Principles & Problem Solutions

| Problem in V1 | Cause | V2 Solution & Creative Architecture |
| :--- | :--- | :--- |
| **Pacing too slow (132s)** | Lingered unnecessarily on static states | **High-Tempo 38s Cut**: Concentrated into 5 high-impact beats with dynamic macro zooms ($1.35\times$ to $1.85\times$) and zero idle dead time. |
| **Disconnected scene cuts** | Abrupt opacity crossfades | **Cause-and-Effect Narrative**: Every transition is motivated by a mouse click (Submit -> App Window -> Select Thread -> Review Changes -> Split Diff -> Checkout -> Live App -> Drag Photo -> Close -> Outro). |
| **Aimless cursor drift** | Cursor moved independently from camera | **Mouse-Guided Camera Tracking**: Camera centers directly on the cursor's focus point (`cx = cursorX, cy = cursorY`) during all macro close-ups. Extended $-400\text{px}$ wallpaper bleed eliminates edge clamping. |
| **No tactile feedback** | Clicks lacked visual resonance | **Expanding Tactile Click Ripples**: $4\text{px} \to 48\text{px}$ expanding shockwaves on release with screen-space scale normalization, paired with $0.88$ button/cursor scale compression. |
| **Unverified brand marks** | Generic hand-drawn or approximate SVG | **100% SVGL Certified**: Official vectors from `https://svgl.app/` for OpenAI flower mark (`viewBox="0 0 611 611"`), OpenAI typography wordmark, and Codex logo. |
| **Reorder lacked proof** | Single card moved without swap | **Dual Polaroid Reorder**: Card 1 (Frog) drags across to Slot 2 while Card 2 (Retro Robot) simultaneously shifts to Slot 1, directly fulfilling the initial prompt. |

---

## 2. Master Choreography & Narrative Table (38.0s)

| Time (s) | Camera (cx, cy) | Zoom | Cursor (x, y) | Click Event | Narrative Action & Cause-and-Effect Transition |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **0.00 – 0.95** | (960, 540) $\to$ (1276, 572) | $1.00\times \to 1.70\times$ | (980, 572) $\to$ (1276, 572) | — | **Beat 1: Prompt Intent.** User types "Add drag and drop to the photos in the gallery". Cursor arcs onto Submit button. |
| **0.95** | (1276, 572) | $1.70\times$ | (1276, 572) | **CLICK: Submit** | **1 to 2 Transition.** Tactile green ripple emits. Submitting prompt triggers card to scale & morph into macOS Sequoia app window. |
| **1.00 – 2.80** | (960, 540) $\to$ (387, 314) | $1.05\times \to 1.80\times$ | (1276, 572) $\to$ (387, 314) | — | **Beat 2: Multi-Agent Parallelism.** Camera swoops into the left sidebar threads. |
| **2.80** | (387, 314) | $1.80\times$ | (387, 314) | **CLICK: Thread Select** | Blue ripple. Selection highlights "Photobooth polish" running in parallel with `recipe-app`. |
| **3.00 – 10.50** | (680, 460) $\to$ (720, 500) | $1.40\times \to 1.35\times$ | (680, 460) $\to$ (980, 620) | — | Center chat streams code generation (`Edited page.tsx +58 -0`, thinking status). Settle on completion card (`+77 -2`). |
| **10.80 – 13.00** | (1100, 650) $\to$ (1552, 803) | $1.25\times \to 1.65\times$ | (980, 620) $\to$ (1552, 803) | — | Cursor travels down to the "Review changes" button in bottom dock. |
| **13.00** | (1552, 803) | $1.65\times$ | (1552, 803) | **CLICK: Review Changes** | **2 to 3 Transition.** Green ripple. Clicking "Review changes" immediately flips pane into the Split Diff view. |
| **13.60 – 17.50** | (1200, 500) $\to$ (1318, 531) | $1.30\times \to 1.75\times$ | (1552, 803) $\to$ (1318, 531) | — | **Beat 3: Code Diff & Review.** Diff pane shows `app/page.tsx +648 -302`. Camera macro-zooms into line 103 review comment. |
| **17.50** | (1318, 531) | $1.75\times$ | (1318, 531) | **CLICK: Resolve Comment** | Green ripple. Comment switches to green "Resolved" badge with satisfying comprehension hold. |
| **18.20 – 21.00** | (1400, 300) $\to$ (1416, 163) | $1.45\times \to 1.75\times$ | (1318, 531) $\to$ (1416, 163) | — | Cursor travels up to toolbar button "Checkout on local". |
| **21.00** | (1416, 163) | $1.75\times$ | (1416, 163) | **CLICK: Checkout / Run** | **3 to 4 Transition.** Blue ripple. Checking out code launches the local web app window running at `localhost:3000`. |
| **21.80 – 25.80** | (800, 450) $\to$ (664, 619) | $1.20\times \to 1.85\times$ | (1416, 163) $\to$ (664, 619) | — | **Beat 4: Live App & Drag-and-Drop.** Hardware photobooth ("Flash Stash") renders. Camera zooms in on Card 1 (Frog) and Card 2 (Robot). |
| **25.80** | (664, 619) | $1.85\times$ | (664, 619) | **DOWN: Drag Start** | Green ripple. Photo 1 lifts with elevated shadow ($\Delta y = -14\text{px}$, scale $1.05$). |
| **25.80 – 28.20** | (664 $\to$ 849, 619) | $1.85\times$ | (664 $\to$ 849, 619) | **DRAG: Move Photo** | Camera tracks the dragged photo across ($\Delta x = +185\text{px}$). Photo 2 simultaneously slides left ($\Delta x = -185\text{px}$). |
| **28.20** | (849, 619) | $1.85\times$ | (849, 619) | **UP: Drop Photo** | Photo drops into Slot 2. Order is swapped! Clear, undeniable proof of feature completion. |
| **28.20 – 30.20** | (750, 619) | $1.70\times$ | (849, 619) | — | Still hold to admire the swapped gallery order (tension release & comprehension pause). |
| **30.50 – 32.50** | (960, 540) | $1.05\times$ | (849, 619) $\to$ (296, 163) | — | Camera pulls back to reveal the finished live app and companion window side by side. |
| **33.80** | (296, 163) | $1.60\times$ | (296, 163) | **CLICK: Close Window** | **4 to 5 Transition.** Red ripple. Clicking the red window dot closes workspace and motivates editorial dissolve to brand card. |
| **34.40 – 38.00** | (960, 540) | $1.00\times$ | (hidden) | — | **Beat 5: SVGL Brand Resolution.** Seamless dissolve to official SVGL OpenAI flower mark & typography wordmark. |

---

## 3. Kinematic Math & Ripple Specifications

1. **Camera Optical Zoom:**
   $$\log(s(t)) = \text{lerp}(\log(s_a), \log(s_b), u), \quad u = 6q^5 - 15q^4 + 10q^3$$
2. **Tactile Click Ripple:**
   - Origin: Contact point $(x_c, y_c)$ in world coordinates.
   - Screen-Space Normalization: $s_{\text{ripple}} = (1.0 + 5.5 \cdot u(q)) / (s_{\text{camera}} \cdot 0.75)$.
   - Opacity: $\alpha = 0.85 \cdot (1 - u(q))$.
   - Physical Compression: Button and inner cursor scale to $0.88$ for 120ms around contact time.
