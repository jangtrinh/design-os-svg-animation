# Kế Hoạch Phát Triển (Roadmap) — design-os-svg-animation

Lộ trình từng bước đưa dự án từ nền tảng tri thức (Knowledge Base) đến bộ công cụ Engine và SDK hoàn thiện.

---

## Giai Đoạn 1: Nền Tảng Tri Thức & Khảo Sát Kỹ Thuật (Hiện Tại)
- [x] Thiết lập cấu trúc dự án `design-os-svg-animation` theo tiêu chuẩn Products workspace.
- [x] Tham vấn chuyên sâu kiến trúc cùng Codex Web GPT-6-Astra và ghi nhận 7-Stage Hybrid Pipeline.
- [x] Tổ chức tranh luận đa chiều 5 Persona giải quyết xung đột toán học - nghệ thuật - hiệu năng - an toàn.
- [x] Soạn thảo đặc tả Motion IR v1.0.
- [x] Soạn thảo 7 Trụ cột Tri thức chuyên sâu trong thư mục `knowledge/`.
- [x] Xây dựng bộ công cụ thẩm định tự động `scripts/jev-svg-curator.py` và `scripts/jev-svg-auditor.py`.
- [x] Xây dựng nguyên mẫu trình biên dịch `scripts/motion-ir-compiler-demo.ts`.

---

## Giai Đoạn 2: Xây Dựng Core Engine & Parser (Q4/2026)
- [ ] Xây dựng SVG Semantic Scene Graph Parser trích xuất nhãn đối tượng tự động.
- [ ] Tích hợp thuật toán Flubber & Paper.js giải quyết bài toán Shape Morphing và Subpath Pairing.
- [ ] Xây dựng Spring Physics Engine tính toán dao động chuyển động không phụ thuộc thời gian (frame-rate independent).
- [ ] Hoàn thiện Target Compiler cho Pure CSS và GSAP Timeline.

---

## Giai Đoạn 3: Tích Hợp AI Agent & Tự Động Hóa Workflow (Q1/2027)
- [ ] Kết nối API LLM (Claude / OpenAI / Gemini) với Prompt Template bóc tách Intent sang Motion IR.
- [ ] Triển khai Visual Diff Regression Testing trong headless browser (Playwright + Pixelmatch).
- [ ] Xây dựng thư viện component UI (React / Vue / Web Components) tích hợp trực tiếp các animation xuất từ engine.
