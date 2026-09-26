# Báo Cáo Tham Vấn Kiến Trúc: Codex Web (GPT-6-Astra)

- **Thời gian**: 2026-09-21
- **Công cụ thực hiện**: `codex-chatgpt-web` (`ask_chatgpt_web` & `ask_codex_native`)
- **Chủ đề**: Kiến trúc tổng thể, Motion IR, Direction và Pipeline tích hợp AI cho SVG Animation.

---

## 1. Tóm Tắt Khuyến Nghị Trọng Yếu Từ Codex Web

1. **Từ bỏ mô hình trực tiếp (End-to-End LLM Generation)**:
   Mô hình `Prompt → LLM → GSAP code` là ngõ cụt kiến trúc (dead end). Dù có thể tạo ra các demo ấn tượng ban đầu, nó hoàn toàn thất bại khi gặp các ca sử dụng thực tế vì tính phi tất định (stochastic), ảo giác tọa độ và không kiểm soát được hiệu năng DOM.

2. **Chốt hạ Motion IR (Intermediate Representation) làm trung tâm**:
   Tách hệ thống thành 2 nửa rõ rệt:
   - **Thượng tầng (Front-end/Upstream)**: AI chỉ tham gia vào việc phân tích ý định (Intent Understanding), bóc tách ngữ nghĩa các layer/element của SVG, và chọn các motion token phù hợp.
   - **Hạ tầng (Back-end/Downstream)**: Bộ máy hình học tất định (Deterministic Geometry Engine) phụ trách tính toán tọa độ, làm phẳng transform, resample Bézier, căn chỉnh điểm bắt đầu của path, và biên dịch ra các runtime khác nhau (CSS Keyframes, GSAP Timeline, WAAPI, Lottie).

3. **7-Stage Processing Pipeline**:
   - *Stage A*: Intent Understanding (JSON/YAML: subject, action, personality, trigger, constraints).
   - *Stage B*: Semantic Scene Graph (Parse DOM thành tree có nhãn ngữ nghĩa, roles, và anchors).
   - *Stage C*: Geometry Normalization (SVGO cleanup, flatten matrix, convert primitives to cubic Bézier).
   - *Stage D*: Motion Planning (Sinh Motion IR với tracks, timing, spring physics).
   - *Stage E*: Morphing & Topology Alignment (Flubber/resampling, point-0 alignment, winding synchronization).
   - *Stage F*: Target Compilers (Pure CSS, GSAP, WAAPI, Lottie SVG).
   - *Stage G*: Quality & Safety Gate (Thẩm định JEV System One, Layout shift, A11y).

4. **Khắc phục điểm yếu của AI bằng Deterministic Repair**:
   - Thuật toán tự động tìm tâm xoay `transform-origin` bằng Bounding Box và Centroid.
   - Thuật toán Greedy/Hungarian tìm điểm xuất phát tối ưu cho Path Morphing để triệt tiêu hiện tượng xoắn đường cong.
   - Tự động fallback sang `@media (prefers-reduced-motion: reduce)`.
