# Bản Đồ Tri Thức (Knowledge Index) — SVG Animation & AI

Hệ thống tri thức hoàn chỉnh được phân loại thành 7 Trụ cột cốt lõi, được thẩm định và quản lý bởi **TypeSafe JEV System One Knowledge Curator**.

---

## 📚 7 Trụ Cột Tri Thức Chuyên Sâu

| STT | Trụ Cột Tri Thức | Nội Dung Trọng Tâm | Tệp Tài Liệu |
| :---: | :--- | :--- | :--- |
| **01** | **SVG DOM & Geometry Engine** | Không gian tọa độ `viewBox`, cấu trúc lệnh Path (`M`, `C`, `S`, `Q`, `A`, `Z`), transform matrix, fill-rules (`nonzero` vs `evenodd`), clipping & masking. | [`01-svg-dom-and-geometry.md`](file:///Users/jang/Products/design-os-svg-animation/knowledge/01-svg-dom-and-geometry.md) |
| **02** | **Motion Semantics & Physics** | Động học lò xo (Mass-Spring-Damper), đường cong Bézier Easing, 12 nguyên tắc Disney, choreography, staggers, overshoot. | [`02-motion-semantics-physics.md`](file:///Users/jang/Products/design-os-svg-animation/knowledge/02-motion-semantics-physics.md) |
| **03** | **Morphing & Path Interpolation** | Cân bằng số lượng đỉnh (Point resampling), căn chỉnh điểm bắt đầu (point-0 alignment), chia tách subpath, Flubber & Polymorph. | [`03-morphing-interpolation.md`](file:///Users/jang/Products/design-os-svg-animation/knowledge/03-morphing-interpolation.md) |
| **04** | **Animation Engines & Targets** | Ma trận so sánh tính năng & hiệu năng: Pure CSS Keyframes, GSAP Timeline, Web Animations API (WAAPI), Lottie SVG, SMIL. | [`04-animation-engines-targets.md`](file:///Users/jang/Products/design-os-svg-animation/knowledge/04-animation-engines-targets.md) |
| **05** | **AI Pipeline & Motion IR** | Prompt decomposition cho chuyển động, ép kiểu Structured Output bằng JSON Schema, thiết kế Motion IR, cơ chế deterministic repair. | [`05-ai-svg-pipeline-motion-ir.md`](file:///Users/jang/Products/design-os-svg-animation/knowledge/05-ai-svg-pipeline-motion-ir.md) |
| **06** | **Interactive State Machines** | Máy trạng thái vi tương tác (Micro-interactions: Idle, Hover, Active, Loading, Success, Error), Scroll-driven animations qua CSS ScrollTimeline. | [`06-interactive-state-machines.md`](file:///Users/jang/Products/design-os-svg-animation/knowledge/06-interactive-state-machines.md) |
| **07** | **Performance & Rendering Pipeline** | Chu trình kết xuất trình duyệt (Style -> Layout -> Paint -> Composite), tối ưu hóa GPU, will-change, containment, SVGO presets. | [`07-performance-optimization.md`](file:///Users/jang/Products/design-os-svg-animation/knowledge/07-performance-optimization.md) |

---

## 🚀 Chuyên Khảo Kỹ Thuật Hấp Thụ Từ Các Engine Đỉnh Cao (Techniques Deep-Dive)

| STT | Chuyên Khảo Kỹ Thuật | Kỹ Thuật Trọng Tâm Rút Tỉa | Tệp Tài Liệu |
| :---: | :--- | :--- | :--- |
| **T1** | **HyperFrames (HeyGen)** | Video-as-Code, Virtual Quantized Clock (\(t_k = k/\text{FPS}\)), Headless Frame Capture tất định. | [`techniques/01-hyperframes-deterministic-pipeline.md`](file:///Users/jang/Products/design-os-svg-animation/knowledge/techniques/01-hyperframes-deterministic-pipeline.md) |
| **T2** | **Lottie Motion (Bodymovin)** | Trim Paths (`s`, `e`, `o`) cho hiệu ứng Stroke Line-Drawing, phân tách tiếp tuyến Spatial vs Temporal. | [`techniques/02-lottie-motion-vectors.md`](file:///Users/jang/Products/design-os-svg-animation/knowledge/techniques/02-lottie-motion-vectors.md) |
| **T3** | **GSAP Choreography** | MorphSVG `shapeIndex` triệt tiêu xoắn vặn, DrawSVG, MotionPath bám đường dẫn, relative timeline sequencing (`<`, `+=0.2`). | [`techniques/03-gsap-advanced-choreography.md`](file:///Users/jang/Products/design-os-svg-animation/knowledge/techniques/03-gsap-advanced-choreography.md) |
| **T4** | **Anime.js Lightweight Physics** | Function-based dynamic values, native Spring ODE solver giải nghiệm vi phân, modularity zero-dependency. | [`techniques/04-animejs-lightweight-physics.md`](file:///Users/jang/Products/design-os-svg-animation/knowledge/techniques/04-animejs-lightweight-physics.md) |

---

## 🛡️ Thẩm Định Chất Lượng Bằng JEV System One
Toàn bộ các tài liệu trong thư mục này được kiểm định định kỳ qua script:
```bash
python3 scripts/jev-svg-curator.py audit-catalog
```
Mục tiêu tiêu chuẩn:
- **Engineering Rigor**: >= 2.5 / 3.0 (Production Grade).
- **Physical/Geometric Grounding**: Probability >= 0.8.
- **Cross-domain Compatibility**: Khớp nối hoàn hảo giữa các phân tầng.

