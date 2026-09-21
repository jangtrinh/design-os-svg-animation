# Kỹ Thuật 04: Anime.js (v4 / v3) & Động Học Vật Lý Tối Giản (Lightweight Physics)

Phân tích kiến trúc **Anime.js** của Julian Garnier, cơ chế **Function-based Values**, **Native Spring Physics**, và giải pháp xử lý SVG Line Drawing cực nhẹ.

---

## 1. Triết Lý Thiết Kế Của Anime.js

Trong khi GSAP có xu hướng toàn diện nhưng dung lượng lớn, Anime.js tập trung vào:
- **Zero Dependencies**: Thư viện độc lập hoàn toàn, kích thước cực kỳ nhỏ gọn (~14KB minified).
- **Hỗ Trợ SVG Tận Gốc**: Tích hợp sẵn cơ chế tính toán độ dài nét vẽ (`strokeDashoffset`), nội suy tọa độ đỉnh SVG morphing, và di chuyển theo đường dẫn SVG (`anime.path`).
- **Declarative Simplicity**: Cú pháp dạng đối tượng JSON gần gũi nhất với cấu trúc Motion IR.

---

## 2. Kỹ Thuật Tính Toán Giá Trị Động (Function-Based Values)

Anime.js cho phép mọi thuộc tính nhận vào một hàm callback nhận 3 tham số `(targetElement, index, totalTargets)`:

```typescript
anime({
  targets: ".flower-petal",
  rotate: (el, i) => i * (360 / 8), // Tự động xoay đều 8 cánh hoa theo góc 45 độ
  scale: [0, 1],
  delay: (el, i) => i * 80,         // Tự động phân tầng độ trễ (Stagger)
  duration: 800,
  easing: "easeOutElastic(1, .5)"
});
```

> [!TIP]
> **Ứng dụng vào AI Generation**: Khi người dùng yêu cầu "Làm 5 ngôi sao bay ra xung quanh", AI không cần phải tính toán 5 dòng keyframe riêng biệt. AI chỉ cần định nghĩa một quy tắc toán học `rotate: "i * 72"` và `delay: "i * 50"`. Bộ compiler sẽ tự động mở rộng (unroll) thành CSS hoặc GSAP timeline hoàn chỉnh.

---

## 3. Bộ Giải Nghiệm Dao Động Lò Xo Native (Spring ODE Solver)

Anime.js tích hợp sẵn thuật toán giải phương trình vi phân dao động của lò xo:
\[
m \ddot{x} + c \dot{x} + k x = 0
\]
Cú pháp:
```javascript
easing: "spring(mass, stiffness, damping, velocity)"
// Ví dụ:
easing: "spring(1, 80, 10, 0)" // Độ nảy mềm mại
easing: "spring(1, 200, 20, 0)" // Dứt khoát, ít dao động dư thừa
```

Khi biên dịch sang Pure CSS Keyframes (vốn không hỗ trợ phương trình vi phân trực tiếp trong CSS chuẩn), compiler của chúng ta lấy mẫu (sample) phương trình lò xo tại 10 mốc thời gian (từ 0% đến 100%) và nén thành một chuỗi `@keyframes` tương đương, mang lại hiệu ứng lò xo vật lý chân thực mà không cần nạp thư viện JS!
