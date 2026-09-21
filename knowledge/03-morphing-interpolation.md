# Trụ Cột 03: Biến Đổi Hình Dạng & Nội Suy Đường Cong (Morphing & Interpolation)

Nội suy đường cong (Path Morphing) là đỉnh cao kỹ thuật trong SVG Animation, cho phép biến đổi một hình học vector này sang một hình học hoàn toàn khác một cách mượt mà.

---

## 1. Điều Kiện Tiên Quyết Để Morphing Thành Công

Trong CSS Keyframes hoặc Web Animations API, thuộc tính `d: path(...)` chỉ có thể nội suy được nếu và chỉ nếu:
1. **Cùng số lượng lệnh path**.
2. **Cùng thứ tự các loại lệnh** (ví dụ: `M`, `C`, `C`, `C`, `Z`).
3. **Cùng số lượng tham số tọa độ** trên từng lệnh.

Nếu hai path không thỏa mãn 3 điều kiện trên, trình duyệt sẽ nhảy bước đột ngột (Snap) ở mốc 50% thay vì biến đổi mượt mà từng milimet.

---

## 2. Thuật Toán Chuẩn Hóa Đỉnh (Equidistant Resampling)

Để đưa hai đường path bất kỳ \(P_A\) và \(P_B\) về cùng cấu trúc, chúng ta áp dụng thuật toán chia đều độ dài cung:

```typescript
import { interpolate } from "flubber";

// Hàm Flubber tự động:
// 1. Phân tích độ dài cung của Path A và Path B.
// 2. Chèn thêm các đỉnh nội suy nhân tạo (Collinear control points) vào path có ít điểm hơn.
// 3. Đưa toàn bộ về dạng đường cong Cubic Bézier đồng nhất.
const interpolator = interpolate(pathA_d, pathB_d, {
  maxSegmentLength: 2, // Đảm bảo độ mượt hình học
  string: true
});

// Lấy path tại thời điểm progress t (0.0 -> 1.0)
const currentPath = interpolator(0.5);
```

---

## 3. Bài Toán Tối Ưu Hóa Điểm Bắt Đầu (Point-0 Alignment)

Khi morphing một đa giác đều (ví dụ từ tam giác sang ngũ giác), nếu điểm bắt đầu \(P_0\) của tam giác nằm ở đỉnh nhọn trên cùng, nhưng \(P_0\) của ngũ giác lại nằm ở góc dưới cùng bên phải, các đỉnh sẽ phải di chuyển chéo qua tâm hình, gây ra hiện tượng hình học bị **xoắn vặn tự thân (Twisting Artifact)**.

### Giải Thuật Greedy Alignment
Giả sử Path A và Path B đều đã được chia thành \(N\) đỉnh: \(A = \{a_0, a_1, \dots, a_{N-1}\}\) và \(B = \{b_0, b_1, \dots, b_{N-1}\}\).
Tìm độ dịch chuyển vòng \(k \in [0, N-1]\) sao cho tổng khoảng cách di chuyển giữa các đỉnh là nhỏ nhất:
\[
\text{Cost}(k) = \sum_{i=0}^{N-1} \sqrt{(a_{i,x} - b_{(i+k)\%N, x})^2 + (a_{i,y} - b_{(i+k)\%N, y})^2}
\]
\[
k^* = \arg\min_k \text{Cost}(k)
\]
Sau đó xoay vòng mảng đỉnh của Path B theo chỉ số \(k^*\) trước khi bắt đầu nội suy.

---

## 4. Xử Lý Đa Vùng Khép Kín (Subpath Splitting & Holes)

Khi một path chứa nhiều lệnh `M` (ví dụ hình cái kéo gồm 2 lưỡi và 2 quai):
- **Trường hợp \(M_A < M_B\)**: Số lượng subpath nguồn ít hơn đích.
  - *Kỹ thuật*: Tạo các "Zero-area Subpaths" (các điểm co cụm có diện tích bằng 0) nằm tại tâm hình học của path nguồn, sau đó phóng nở ra thành các subpath mới của path đích.
- **Trường hợp có lỗ rỗng (Compound Paths)**:
  - Bắt buộc kiểm tra `fill-rule`. Nếu dùng `nonzero`, subpath tạo lỗ phải có chiều quay ngược lại (ví dụ viền ngoài quay theo chiều kim đồng hồ, viền lỗ trong quay ngược chiều kim đồng hồ).
