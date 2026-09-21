# Trụ Cột 01: SVG DOM & Nền Tảng Hình Học (Geometry Engine)

Nền tảng hình học và cấu trúc DOM của SVG là cơ sở cốt lõi quyết định tính khả thi và hiệu năng của mọi chuyển động vector.

---

## 1. Không Gian Tọa Độ & `viewBox`

Cặp thuộc tính kích thước hiển thị (`width`, `height`) và hệ tọa độ nội tại (`viewBox`) định nghĩa cách thức render của SVG:

```xml
<svg width="200" height="200" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
  <!-- Nội dung vector sử dụng hệ tọa độ 100x100 -->
</svg>
```

- **Hệ tọa độ nội tại (User Units)**: Được định nghĩa bởi `minX minY width height` trong `viewBox`. Mọi phép tính animation nên thực hiện trên User Units để độc lập với kích thước render thực tế trên màn hình.
- **Tỉ lệ khung hình (`preserveAspectRatio`)**:
  - `none`: Kéo giãn vector làm méo tỉ lệ.
  - `xMidYMid meet` (Mặc định): Co giãn đều sao cho toàn bộ `viewBox` nằm trọn trong khung hiển thị mà không bị cắt xén.
  - `xMidYMid slice`: Phủ kín khung hiển thị, phần vượt quá sẽ bị cắt.

---

## 2. Cấu Trúc Lệnh Path (`d` attribute)

Thẻ `<path>` là phần tử linh hoạt nhất, có thể mô tả mọi hình dạng thông qua chuỗi lệnh mini-language:

| Lệnh (Tuyệt đối) | Lệnh (Tương đối) | Ý Nghĩa Kỹ Thuật | Tham Số Yêu Cầu |
| :---: | :---: | :--- | :--- |
| `M` | `m` | **Move to**: Di chuyển con trỏ vẽ mà không tạo nét. | `(x y)+` |
| `L` | `l` | **Line to**: Vẽ đoạn thẳng tới tọa độ đích. | `(x y)+` |
| `H` / `V` | `h` / `v` | **Horizontal / Vertical Line**: Đoạn thẳng ngang hoặc dọc. | `x+` hoặc `y+` |
| `C` | `c` | **Cubic Bézier**: Đường cong Bézier bậc ba với 2 điểm điều khiển. | `(x1 y1 x2 y2 x y)+` |
| `S` | `s` | **Smooth Cubic Bézier**: Tiếp nối mượt với điểm điều khiển đối xứng. | `(x2 y2 x y)+` |
| `Q` | `q` | **Quadratic Bézier**: Đường cong Bézier bậc hai với 1 điểm điều khiển. | `(x1 y1 x y)+` |
| `T` | `t` | **Smooth Quadratic Bézier**: Tiếp nối bậc hai đối xứng. | `(x y)+` |
| `A` | `a` | **Elliptical Arc**: Cung elip phức tạp. | `(rx ry x-axis-rotation large-arc sweep x y)+` |
| `Z` | `z` | **Close Path**: Đóng đường cong nối về điểm xuất phát. | Không có |

> [!IMPORTANT]
> **Quy tắc Chuẩn Hóa Hình Học**: Để phục vụ animation biến đổi hình dạng (Morphing), toàn bộ các lệnh `H`, `V`, `Q`, `S`, `T`, `A` **bắt buộc phải được chuyển đổi về lệnh chuẩn `C` (Cubic Bézier)**. Điều này loại bỏ hoàn toàn sự không tương thích về loại hàm khi tính toán nội suy.

---

## 3. Ma Trận Biến Đổi (Transform Matrix) & Điểm Tựa (Pivot Origin)

SVG hỗ trợ phép biến đổi affine 2D thông qua ma trận biến đổi bậc 3x3:
\[
\begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix} =
\begin{bmatrix} a & c & e \\ b & d & f \\ 0 & 0 & 1 \end{bmatrix}
\begin{bmatrix} x \\ y \\ 1 \end{bmatrix}
= \begin{bmatrix} ax + cy + e \\ bx + dy + f \\ 1 \end{bmatrix}
\]

Trong đó:
- `translate(tx, ty)`: \(e = tx, f = ty\).
- `scale(sx, sy)`: \(a = sx, d = sy\).
- `rotate(θ)`: \(a = \cos\theta, b = \sin\theta, c = -\sin\theta, d = \cos\theta\).

### Điểm Tựa Biến Đổi (`transform-origin`)
Trong CSS thông thường, `transform-origin` mặc định là `50% 50%` (tâm của phần tử). Tuy nhiên, trong SVG 1.1 truyền thống, `transform-origin` của các phần tử con mặc định là `(0, 0)` của cả file SVG!
Để đảm bảo chuyển động xoay quanh tâm phần tử chính xác:
```css
/* Bắt buộc chỉ định transform-box để 50% tính theo bounding box của chính phần tử */
.spinning-gear {
  transform-box: fill-box;
  transform-origin: center;
}
```

---

## 4. Fill Rules: `nonzero` vs `evenodd`

Quy tắc tô màu xác định vùng nào được coi là "bên trong" của một đường cong khép kín (đặc biệt là các shape có lỗ thủng như chữ "O" hay bánh donut):

- **`nonzero` (Mặc định)**: Vẽ một tia từ điểm đang xét ra vô cực. Nếu đường biên cắt tia từ trái qua phải (+1), từ phải qua trái (-1). Nếu tổng khác 0 thì thuộc vùng trong. Phụ thuộc vào chiều vẽ đường cong (Winding direction).
- **`evenodd`**: Đếm số lần đường biên cắt tia ra vô cực. Nếu số lần là số lẻ thì ở trong, số chẵn thì ở ngoài. Không phụ thuộc vào chiều vẽ đường cong.

> [!TIP]
> Khi morphing hình dạng phức tạp có lỗ thủng, ưu tiên sử dụng `fill-rule="evenodd"` để tránh hiện tượng vùng lỗ bị tô màu bất thường khi chiều quay của subpath bị đảo lộn.
