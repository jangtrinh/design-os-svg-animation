# Kịch Bản Chi Tiết Video Promo (22 Giây): Design OS SVG Animation

- **Nguồn tham vấn**: Codex Web (GPT-6-Astra / chatgpt-web)
- **Thời lượng**: 22 Giây (Master Timeline)
- **Tỉ lệ khung hình**: 16:9 (1920 × 1080 Full HD)
- **Ngôn ngữ hình ảnh**: SVG-first, Dark Tech Theme (`#080808`), Accent Blue (`#3B82F6`), Muted Red (`#EF4444` cho Scene 1 lỗi).
- **Nguyên lý**: Toàn bộ video là một SVG Composition liên tục, không dùng video raster giả lập.

---

## Dòng Chảy Kể Chuyện (Narrative Arc)

```
Scene 1 (0s - 4s)  : CHAOS     → AI vẽ thì đẹp nhưng animate thì gãy vụn (Bézier broken, topology collapse).
Scene 2 (4s - 10s) : STRUCTURE → Tách rời Intent và Geometry (Design OS 7-Stage Pipeline).
Scene 3 (10s - 18s): MOTION    → 4 Siêu năng lực: Trim Path, Spring Physics, Perfect Morph, GPU 120 FPS.
Scene 4 (18s - 22s): IDENTITY  → Dựng hình Logo & Wordmark: "Intent in. Perfect motion out."
```

---

## Chi Tiết Kỹ Thuật Từng Cảnh

### Scene 1: Broken AI Animation (00:00 – 00:04)
- **Tiêu đề**: `AI CAN DRAW. BUT CAN IT MOVE?` (Phụ đề: *Raw SVG animation breaks.*)
- **Visual**:
  - Xuất hiện một hình đường cong ribbon sạch sẽ với 6 đỉnh Bézier.
  - Con trỏ AI gõ lệnh `animate this shape`.
  - Ngay lập tức các control point Bézier bị lệch (P3 handle +18px, tangent bị gãy, xuất hiện góc nhọn cusp).
  - Shape cố morph sang shape 2 nhưng lệch điểm neo khiến hình bị xoắn 180°.
  - FPS drop giật cục (16ms → 44ms).
  - Xuất hiện nhãn cảnh báo: `PATH TOPOLOGY MISMATCH`.
  - 3.5s - 4.0s: Toàn bộ geometry sụp đổ thành một đường ngang phẳng (Transition sang Scene 2).

### Scene 2: Deterministic Pipeline (00:04 – 00:10)
- **Tiêu đề**: `INTENT ≠ GEOMETRY` → `DESIGN OS MAKES MOTION DETERMINISTIC`.
- **Visual**:
  - Đường ngang tách thành 3 khối pipeline: `AI INTENT` → `MOTION IR` → `GEOMETRY ENGINE`.
  - Lệnh người dùng: `Morph circle into bolt icon`.
  - Khối Intent biên dịch thành Motion IR (duration: 800ms, easing: spring).
  - Số lượng đỉnh được cân bằng tự động: A (8 anchors) & B (13 anchors) → Chuẩn hóa thành 16:16.
  - Đưa vào Geometry Engine: làm phẳng transform, căn chỉnh winding.
  - Tia quét laser chạy qua, đóng dấu chứng nhận: `DETERMINISTIC ✓`.
  - Camera zoom xuyên qua tâm mở ra Scene 3.

### Scene 3: Motion Superpowers (00:10 – 00:18)
- **Tiêu đề**: `ONE VECTOR. REAL MOTION.`
- **Bốn phân đoạn liên hoàn**:
  1. *10.0s – 11.8s (Trim Path)*: Một đường viền kỹ thuật vẽ mở ra từ 0% → 100% bằng Lottie Trim Path (`stroke-dashoffset`). Nhãn: `TRIM PATH (1 path · infinite resolution)`.
  2. *11.8s – 13.6s (Spring Physics)*: Thu về một hình tròn nảy bung với phương trình lò xo thật (stiffness: 280, damping: 20, mass: 0.8), overshoot 114% → 96% → 100%. Nhãn: `SPRING PHYSICS`.
  3. *13.6s – 15.7s (Deterministic Morph)*: Biến hình mượt mà không xoắn: Circle → Droplet → Star → Glyph. Nhãn: `PERFECT MORPH (Matched cubic topology)`.
  4. *15.7s – 18.0s (GPU Composite 120 FPS)*: Bung nổ thành 20 hạt vector chuyển động bằng `transform: translate3d/rotate/scale`. Bộ đếm FPS nhảy vọt từ 24 → 60 → 90 → khóa ở `120 FPS`. Nhãn: `GPU COMPOSITED`.

### Scene 4: Logo Reveal & Brand Lockup (00:18 – 00:22)
- **Tiêu đề**: `DESIGN OS SVG ANIMATION`
- **Tagline**: `Intent in. Perfect motion out.`
- **Visual**:
  - 20 hạt vector hội tụ về tâm màn hình.
  - Một đường nét duy nhất vẽ nên biểu tượng logo Design OS bằng Trim Path.
  - Bung màu fill và bung chữ "DESIGN OS SVG ANIMATION" theo hiệu ứng Stagger từng ký tự.
  - Thanh gạch chân lướt qua dưới tagline kết thúc bằng một cú spring snap tinh tế.
