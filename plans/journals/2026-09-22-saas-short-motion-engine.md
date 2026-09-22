# Engineering Journal: SaaS Short Motion Engine Polish & Universal Video Showcase

- **Date**: 2026-09-22
- **Author**: Lead Motion Engineer & System Architect (Antigravity AI)
- **Collaborators**: Owner, JEV System One, Product Designer
- **Project**: `design-os-svg-animation`
- **Output Artifacts**: `promo/saas-short.mp4` (60fps, 0.54 MB), `docs/assets/example-2-saas-motion-engine.gif` (433 KB), `docs/index.html`, `README.md`

---

## 1. Context & Objective

The objective of this engineering cycle was to eliminate transition artifacts, fix UI spacing cramping, and achieve broadcast-quality 60fps rendering for the 11.5-second vertical 9:16 SaaS Motion Short (`promo/saas-short.html`). The animation showcases a high-tempo generative UI interaction flow:
1. **Scene 1 (00:00 – 00:01.8)**: Centered interactive prompt card with typewriter text streaming.
2. **Scene 2 (00:01.8 – 00:03.2)**: Shared-element continuous morph from card into a compact input pill with live waveform and mic glyph.
3. **Scene 3 (00:03.2 – 00:04.8)**: Kinetic typography reveal ("REASONING CORE") with Phosphor vector glyphs.
4. **Scene 4 (00:04.8 – 00:07.2)**: Cascading 3-card processing stack with verified Phosphor icons, progress bars, and tactile elevation.
5. **Scene 5 (00:07.2 – 00:09.5)**: Document synthesis layout with smooth character-by-character text streaming and $C^1$-continuous camera punch zoom.
6. **Scene 6 (00:09.5 – 00:11.5)**: Centered OpenAI spring outro lockup with analytical damped harmonic bounce.

---

## 2. Chronological Trajectory of Owner Feedback & Engineering Resolutions

| # | Owner Critique / Input | Root Cause | Engineering Solution |
| :--- | :--- | :--- | :--- |
| **1** | *"Khá tốt rồi nhưng 1 số phần UI element đang nằm quá gần nhau."* | Fixed spacing offsets developed without dynamic multi-resolution clearance checks; text and icon badges crowded card borders. | Systematically re-spaced all scenes: S2 mic-waveform gap widened to 59px (was 24px); S3 badge buffer expanded to 70px; S4 card vertical gap widened to 60px; S5 document lowered to $y=420$ (>230px notch clearance); S6 outro clearance expanded to 116px. |
| **2** | *"Phần S5 đang transition lỗi"* | Camera stage coordinates had a 150px instantaneous discontinuity at $t = 1180\text{ms}$ (jumped directly from $(0, 0)$ to $(150, -30)$), creating a jarring visual snap. | Replaced instantaneous jump with $C^1$-continuous lerp: $\text{camX} = \text{lerp}(0, \text{targetCamX}, \text{easePunch})$ with cubic-bezier $(0.22, 1, 0.36, 1)$, guaranteeing $\Delta(0, 0)$ displacement at transition onset. |
| **3** | *"Cảnh này text bị giật không mượt."* | Text characters used an ultra-short 90ms linear opacity clamp that popped characters in abruptly during camera movement. | Replaced linear clamp with 240ms gradual `easeOutCubic` emergence, and delayed the camera zoom until $t = 1350\text{ms}$ so text streaming finishes settling before the camera moves. |
| **4** | *"OK commit, merge vào main. Update readme và github marketing page"* | Newly polished SaaS short runner and broadcast MP4 were not yet showcased in repository root documentation or the GitHub Pages landing site. | Enriched `README.md` showcase comparison table and export commands; upgraded `docs/index.html` carousel and 3-card `#showcase` section with direct runners and 60fps MP4 download links; verified via automated headless Chromium screenshot harness. |

---

## 3. Technical Hardening & Architectural Insights

### A. $C^1$-Continuous Camera Lerp ($G^1/C^1$ Geometric Smoothness)
In procedural camera stages, switching from a static wide shot $(X_0, Y_0)$ to a zoomed/panned region $(X_1, Y_1)$ must satisfy $C^0$ positional continuity and $C^1$ velocity continuity:
$$\mathbf{C}(t) = \mathbf{C}_0 + (\mathbf{C}_1 - \mathbf{C}_0) \cdot \text{ease}(u), \quad u = \frac{t - t_{\text{start}}}{t_{\text{end}} - t_{\text{start}}}$$
Where $\text{ease}(0) = 0$, $\text{ease}'(0) = 0$, $\text{ease}(1) = 1$, and $\text{ease}'(1) = 0$. Using cubic-bezier $(0.22, 1, 0.36, 1)$ ensures zero initial velocity snap and smooth deceleration into the focal region.

### B. Text Streaming vs. Spatial Motion Decoupling
Streaming text characters while simultaneously scaling the camera stage triggers visual aliasing and perceived stuttering. 
- **Rule**: Defer camera punch/zoom until character streaming opacity animations have 100% completed. The eye can track rapid text generation or rapid camera movement, but tracking both simultaneously creates high cognitive dissonance and perceived stutter.

### C. Notch & Safe-Area Clearance Boundary
For vertical 9:16 mobile mockups ($1080 \times 1920$), top content must maintain an absolute buffer:
$$\text{Top Offset} \ge \text{Dynamic Island Bottom} (180\text{px}) + \text{Padding} (40\text{px}) = 220\text{px}$$
S5 document container was repositioned to $y = 420\text{px}$, providing $240\text{px}$ of breathing room below the top camera island.

---

## 4. Production Metrics

- **Total Runtime**: 11.500 seconds (690 frames @ 60fps).
- **Video Format**: $1080 \times 1920$, 60.0 fps, H.264 (YUV420P), CRF 17, file size 0.54 MB.
- **Showcase GIF**: $300 \times 533$, 15.0 fps, file size 433 KB.
- **Anti-Flop Compliance**: 6/6 automated gates passed with 0 penalties (`npm run guard && npm run audit:anti-flop`).
