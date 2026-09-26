# Engineering Journal: OpenAI Codex App Promo Recreation & Pipeline Hardening

- **Date**: 2026-09-22
- **Author**: Lead Motion Engineer & System Architect (Antigravity AI)
- **Collaborators**: Owner, Codex Web Pro, JEV System One
- **Project**: `design-os-svg-animation`
- **Output Artifacts**: `promo/codex-app/codex-app-promo.mp4`, `docs/assets/example-3-codex-app-promo.gif`, `docs/index.html`

---

## 1. Context & Objective

The goal of this session was to build, polish, audit, render, and publish a broadcast-fidelity 38-second high-tempo promo video (`00:00 – 00:38.0`) recreating the OpenAI Codex App launch experience. The video demonstrates:
1. **Beat 1 (00:00 – 00:02.8)**: Fast hero prompt entry, tool lock toggles, and submit ripple click.
2. **Beat 2 (00:02.8 – 00:10.5)**: Fluid window morph to macOS dark theme, sidebar thread selection, multi-agent execution, and streaming polish chat.
3. **Beat 3 (00:10.5 – 00:23.0)**: Review Changes dock click, code diff inspection, line 103 review comment click with green 'Resolved' chip, and checkout on local header button click.
4. **Beat 4 (00:23.0 – 00:33.8)**: Flash Stash live photobooth app preview, interactive polaroid drag-and-drop reordering with tactile shadow lift, and swapped gallery layout.
5. **Beat 5 (00:33.8 – 00:38.0)**: Red window close dot click, spatial recede, and authentic OpenAI flower mark & wordmark scaling from center with damped harmonic spring physics.

---

## 2. Chronological Trajectory of Owner Feedback & Engineering Resolutions

| # | Owner Critique / Input | Root Cause | Engineering Solution |
| :--- | :--- | :--- | :--- |
| **1** | *"Logo đã sử dụng https://svgl.app/ chưa? Cái này là hard rules của pipeline trong dự án này."* | Initial SVG asset drafted from approximate vector curves instead of official SVGL library. | Ingested exact vector geometries from `svgl.app` for Claude and OpenAI; added Gate 1 automated regression assertion in `scripts/anti-flop-gate.py`. |
| **2** | *"Không cần xuất video cho đến khi chốt xong với owner."* | Automated scripts ran premature video rendering before visual approval of keyframes. | Enforced an explicit approval gate: keyframe visual evidence proofs must be verified and approved by the Owner before running `export-codex-promo.py`. |
| **3** | *"Khi zoom vào thì chuột luôn đi theo cảnh zoom. Lúc click thì phải có ripple effect... Brainstorm và debate cùng creative agent. Hỏi Codex web Pro..."* | Camera pan and cursor track were decoupled; click states lacked tactile feedback. | Coupled cursor position to screen-space element coordinates during zoom; implemented `@keyframes clickRipple` expanding ring; consulted Codex Web Pro for screenplay structure. |
| **4** | *"Codex web không có context của dự án nên khi prompt hỏi nó thì phải cung cấp context lúc đó mới nhận được kết quả tốt chứ"* | Generic prompt sent to external LLM without codebase specifics, Motion IR schema, or project constraints. | Formatted comprehensive system context (virtual clock, anti-flop gates, SVGL mandate, tech stack) before invoking `ask_chatgpt_web`. |
| **5** | *"Mouse hiện tại không có chính xác tại vị trí của element được click. Cái đó là lỗi nghiêm trọng. Và hiện tại các animation bị giật cục, không mượt."* | Cursor keyframes used static arbitrary offsets; linear interpolation caused abrupt directional jumps. | Recomputed exact bounding box centers for all 6 target elements; replaced linear lerp with cubic-bezier smoothing and Catmull-Rom spline pathing. |
| **6** | *"Đoạn sau khi click vào photobooth polish thì phần content trong chat phải thay đổi cho phù hợp với nội dung demo, hiện tại nó không thực tế..."* | Chat feed contained generic boilerplate text unrelated to the upcoming photobooth demo. | Authored realistic context-specific summary: "Tidied photo tray layout and isolated button event propagation in `components/Photobooth.tsx`" with checkmarks for gallery polish, reordering, and model settings. |
| **7** | *"Phần icon này bị lỗi nên button đen thui không ý nghĩa gì"* | `<rect>` element placed directly inside `<button>` without `<svg>`, rendering as a raw black box. | Replaced with circular `.btn-submit-circle` containing `<svg viewBox="0 0 24 24"><use href="#icon-arrow-up"></use></svg>` with dynamic state toggle (`#icon-stop` during generation). |
| **8** | *"Phần Icon này bị crop 2 bên"* | SVG path bounds spanned $x \in [0, 24]$ with a 2px stroke, causing strokes at $x < 0$ and $x > 24$ to be clipped by the viewBox. | Scaled vector by $0.84$, applied `translate(1.92, 1.92)` to provide breathing room, and added `overflow: visible;` in CSS. |
| **9** | *"Đoạn outtro thì logo của openAI sẽ scale từ 0 tới 100% từ center chứ không chạy vào. Dùng spring với gentle friction để tạo hiệu ứng bounce nhẹ. Toàn bộ logo to ra."* | Outro container was accidentally nested inside `#camera-world`, causing camera shift; logo slid from offscreen; marks were small (80px/220px). | Moved outro to root screen-space overlay; enlarged marks (+75%); implemented damped harmonic oscillator $f(t) = 1 - e^{-\zeta \omega t}(\cos(\omega_d t) + \frac{\zeta \omega}{\omega_d}\sin(\omega_d t))$ with $\zeta=0.65, \omega=7.5$. |
| **10** | *"OK record video rồi đưa lên Github pages quảng cáo thôi."* | Final video and showcase needed for repository marketing and documentation. | Hardened `export-codex-promo.py` with non-blocking Popen, rendered 1080p MP4, generated 640x360 palettegen GIF, and updated `docs/index.html`. |

---

## 3. Technical Hardening & Architectural Insights

### A. Chrome Headless Subprocess Contract (macOS)
Running `subprocess.run(CHROME_BIN, ...)` synchronously on macOS often blocks indefinitely because Chrome's background networking and CoreAudio threads do not cleanly terminate in headless mode.
- **Solution**: Use `subprocess.Popen` with a 100ms polling loop checking for output file size (`os.path.getsize(target) > 1000`), followed by immediate `proc.terminate()` and `proc.kill()` fallback.
- **Flags**: `--virtual-time-budget=2000`, `--run-all-compositor-stages-before-draw`, `--no-first-run`, `--disable-background-networking`, isolated `--user-data-dir`.

### B. SVG Coordinate & Stroke Margin Rule (JEV Invariant)
For any stroked vector icon enclosed within a `viewBox="0 0 W H"`:
$$\text{Padding} \ge \frac{\text{stroke-width}}{2}$$
If an icon path reaches the boundary $x = 0$ or $x = W$ with stroke-width $S$, the stroke extends to $x = -S/2$ and $x = W + S/2$, which gets clipped unless either:
1. Inner path is scaled down and centered: $\text{scale}(1 - S/W)$, `translate(S/2, S/2)`.
2. Or the container has `overflow: visible;`.

### C. Damped Harmonic Spring Physics for Motion Outro
Pure cubic-bezier easings cannot produce physical inertia bounce without hardcoded multi-step keyframe hacks. The analytical damped harmonic oscillator provides exact, reproducible bounce:
$$\omega_d = \omega \sqrt{1 - \zeta^2}$$
$$s(t) = 1 - e^{-\zeta \omega t} \left( \cos(\omega_d t) + \frac{\zeta \omega}{\omega_d} \sin(\omega_d t) \right)$$
- $\zeta = 0.65$ (damping ratio — gentle friction, single subtle overshoot of $1.06\times$).
- $\omega = 7.5\text{ rad/s}$ (natural frequency — settles in ~0.65 seconds).

---

## 4. Production Metrics

- **Total Runtime**: 38.000 seconds.
- **Video Format**: 1920×1080, 30.0 fps, H.264 (YUV420P), CRF 18, file size 3.49 MB.
- **Showcase GIF**: 640×360, 8.0 fps, palettegen diff mode, file size 4.88 MB.
- **Frame Render Performance**: 153 frames captured in 64.4 seconds (~2.37 frames/sec across 6 parallel Chrome workers).
- **Anti-Flop Compliance**: 6/6 automated gates passed with 0 penalties.
