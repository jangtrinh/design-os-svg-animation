# Kỹ Thuật 02: Lottie Motion (Bodymovin) & Nghệ Thuật Vector Keyframes

Giải mã cấu trúc chuẩn của **Lottie (Bodymovin JSON)**, phân tích kỹ thuật **Trim Paths** đỉnh cao và sự phân tách giữa tiếp tuyến không gian (Spatial) và thời gian (Temporal) để đưa vào SVG Animation Engine.

---

## 1. Cấu Trúc Dữ Liệu Cốt Lõi Của Lottie JSON

Lottie lưu trữ đồ họa vector dưới dạng cây phân cấp:
- **`layers`**: Danh sách các lớp (Shape Layer, Solid, Null, Precomp).
- **`shapes`**: Cấu trúc các hình vẽ bên trong một layer:
  - `gr` (Group): Nhóm các shape.
  - `sh` (Path Shape): Đường cong Bézier với các đỉnh (`v`), tiếp tuyến vào (`in`), tiếp tuyến ra (`out`).
  - `rc` / `el`: Hình chữ nhật / Hình tròn.
  - `fl` / `st`: Thuộc tính Tô màu (Fill) / Đường viền (Stroke).
  - `tm` (**Trim Paths**): Bộ cắt xén đường viền theo thời gian.
  - `tr` (Transform): Vị trí (`p`), Tỉ lệ (`s`), Điểm tựa (`a`), Góc xoay (`r`), Độ mờ (`o`).

---

## 2. Kỹ Thuật Trim Paths (`tm`): Vũ Khí Tối Thượng Cho Nét Vẽ SVG

Trong After Effects và Lottie, **Trim Path** là công cụ tạo ra hầu hết các hiệu ứng vẽ tay (Line Drawing), viền loading vòng tròn, và animation mở ra/khép lại của icon.

Trim Path có 3 thuộc tính chính:
- `s` (**Start**): Điểm bắt đầu vẽ nét (tính từ 0% đến 100%).
- `e` (**End**): Điểm kết thúc nét vẽ (tính từ 0% đến 100%).
- `o` (**Offset**): Dịch chuyển góc bắt đầu dọc theo chu vi đường path (tính bằng độ: -360° đến +360°).

### Ánh Xạ Trim Paths Sang Thuần SVG & CSS:
Trong SVG native, thuộc tính tương đương là `stroke-dasharray` và `stroke-dashoffset`:
\[
L = \text{path.getTotalLength()}
\]
\[
\text{dashLength} = L \cdot \frac{e - s}{100}
\]
\[
\text{dashGap} = L
\]
\[
\text{dashOffset} = -L \cdot \frac{s + \frac{o}{360} \cdot 100}{100}
\]

```css
/* Mô phỏng Trim Path từ Start: 0% -> 100%, End: 0% -> 100% */
@keyframes trim-path-draw {
  0% {
    stroke-dashoffset: 500;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.lottie-style-stroke {
  stroke-dasharray: 500;
  stroke-dashoffset: 500;
  animation: trim-path-draw 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

---

## 3. Tách Rời Tiếp Tuyến Không Gian (Spatial) và Thời Gian (Temporal)

Lottie phân biệt rạch ròi giữa 2 loại đường cong:

1. **Temporal Easing (`i`, `o`)**:
   - Xác định vận tốc chuyển động (Tăng tốc / Giảm tốc).
   - Biểu diễn bằng tọa độ 2D của cubic-bezier easing: `i: { x: [0.4], y: [1.0] }`, `o: { x: [0.2], y: [0.0] }`.
2. **Spatial Tangents (`ti`, `to`)**:
   - Xác định hình dạng quỹ đạo vật lý mà vật thể di chuyển trong không gian 2D (ví dụ quả bóng bay theo đường cung cong thay vì đường thẳng chéo).
   - `to`: Tiếp tuyến đi ra từ keyframe trước.
   - `ti`: Tiếp tuyến đi vào keyframe sau.

> [!TIP]
> Trong Motion IR của chúng ta, chúng ta kế thừa sự phân tách này bằng cách hỗ trợ thuộc tính `motionPath` (quỹ đạo không gian) độc lập với thuộc tính `easing` (động học thời gian).
