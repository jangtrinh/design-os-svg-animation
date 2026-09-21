# Trụ Cột 02: Ngữ Nghĩa Chuyển Động & Động Học Vật Lý (Motion Semantics & Physics)

Chuyển động trong giao diện người dùng không thể cứng nhắc. Sự mượt mà, tự nhiên và thuyết phục phụ thuộc vào việc áp dụng chính xác các nguyên lý vật lý và ngữ nghĩa cảm xúc.

---

## 1. Đường Cong Easing: Toán Học Của `cubic-bezier`

Hầu hết các hiệu ứng chuyển động trong CSS/Web được biểu diễn bằng đường cong Bézier đơn vị với \(P_0 = (0,0)\) và \(P_3 = (1,1)\):
\[
x(t) = 3(1-t)^2 t x_1 + 3(1-t) t^2 x_2 + t^3
\]
\[
y(t) = 3(1-t)^2 t y_1 + 3(1-t) t^2 y_2 + t^3
\]
Trình duyệt giải phương trình \(x(t) = \text{progress}\) để tìm tham số \(t\), sau đó tính giá trị \(y(t)\) tương ứng.

### Thư Viện Motion Tokens Chuẩn (Design OS Tokens)
- **Standard Smooth**: `cubic-bezier(0.4, 0.0, 0.2, 1)` — Chuyển động giao diện mặc định, không gây chú ý quá mức.
- **Snappy / Acceleration**: `cubic-bezier(0.05, 0.7, 0.1, 1.0)` — Dành cho phản hồi nút bấm tức thời.
- **Overshoot / Elastic**: `cubic-bezier(0.34, 1.56, 0.64, 1.0)` — Điểm điều khiển \(y_1 > 1.0\) tạo hiệu ứng nảy nhẹ vượt quá đích đến rồi thu lại.
- **Deceleration Exit**: `cubic-bezier(0.0, 0.0, 0.2, 1.0)` — Phần tử rời khỏi màn hình với vận tốc tăng dần.

---

## 2. Động Học Lò Xo (Spring Physics Kinematics)

Thay vì cố định thời gian (Duration) và đường cong Bézier, các hệ thống UI hiện đại (iOS, Framer Motion) sử dụng phương trình vi phân dao động tắt dần của con lắc lò xo:
\[
m \frac{d^2 x}{dt^2} + c \frac{dx}{dt} + k x = 0
\]
Trong đó:
- \(m\) (**Mass - Khối lượng**): Độ nặng của vật thể. Khối lượng càng lớn, quán tính càng cao, thời gian dừng càng lâu.
- \(k\) (**Stiffness - Độ cứng**): Lực kéo của lò xo. Độ cứng càng cao, chuyển động càng nhanh và dứt khoát.
- \(c\) (**Damping - Hệ số cản**): Ma sát của môi trường.

### Phân Loại Trạng Thái Dao Động
- **Tỉ số cản (Damping Ratio)**:
  \[
  \zeta = \frac{c}{2 \sqrt{k \cdot m}}
  \]
  - \(\zeta > 1\) (**Over-damped**): Chuyển động chậm dần đều, không bao giờ dao động vượt ngưỡng.
  - \(\zeta = 1\) (**Critically-damped**): Đạt tới đích nhanh nhất mà không có overshoot. Lý tưởng cho đóng mở menu.
  - \(\zeta < 1\) (**Under-damped**): Dao động nảy qua nảy lại nhiều lần trước khi dừng (Bouncy/Playful).

---

## 3. 12 Nguyên Tắc Hoạt Hình Disney Ứng Dụng Trong SVG

1. **Squash and Stretch (Co và Giãn)**: Khi một quả bóng chạm đất, nó bẹp lại theo chiều dọc (\(\text{scaleY} < 1\)) và nở ra theo chiều ngang (\(\text{scaleX} > 1\)) để bảo toàn thể tích (\(\text{scaleX} \cdot \text{scaleY} = 1\)).
2. **Anticipation (Dự Cảm / Lấy Đà)**: Trước khi mũi tên bắn về phía trước, nó phải lùi nhẹ về phía sau 50ms.
3. **Staging (Dàn Cảnh)**: Không animate toàn bộ 10 phần tử cùng lúc; chỉ làm nổi bật 1 tiêu điểm duy nhất.
4. **Follow Through & Overlapping Action (Chuyển Động Nối Tiếp)**: Khi cánh tay dừng lại, bàn tay và ngón tay vẫn tiếp tục văng nhẹ theo quán tính.
5. **Slow In and Slow Out (Tăng Tốc và Giảm Tốc)**: Tránh chuyển động tuyến tính (`linear`) trừ khi là cánh quạt quay đều.
6. **Arc (Chuyển Động Theo Đường Cong)**: Vật thể tự nhiên hiếm khi chuyển động theo đường thẳng tắp; chúng bay theo đường parabol hoặc cung tròn.
7. **Secondary Action (Hành Động Thứ Cấp)**: Khi chuông lắc, viên bi bên trong (clapper) đập vào thành chuông tạo phản lực trễ.
8. **Timing (Nhịp Điệu)**: Thời lượng chuẩn cho micro-interaction UI nằm trong khoảng **150ms — 400ms**. Vượt quá 500ms người dùng sẽ cảm thấy chậm chạp.
9. **Exaggeration (Cường Điệu Hóa)**: Phóng đại độ nảy nhẹ để tăng tính biểu cảm.
10. **Solid Drawing (Vẽ Chắc Tay - Khối 3D)**: Bảo toàn phối cảnh khi xoay trong không gian 2D.
11. **Appeal (Sức Hút Cảm Xúc)**: Màu sắc hài hòa, animation mượt mà.
12. **Straight Ahead vs Pose to Pose**: Trong code, Pose to Pose tương ứng với việc xác định các Keyframe mốc (0%, 50%, 100%) và để engine nội suy giữa các pose.
