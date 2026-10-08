# Hairline Solid-First Kinematics Workflow (v2.0 Airtight)
> Quy chuẩn phổ quát sản xuất Figure Isometric 2:1 chuẩn Lucas Markes & Codex Astra (gpt-6.1-sol)

Mọi figure cơ khí, đồ gá hoặc hệ thống chuyển động tương tác trong hệ sinh thái DESIGN:OS / Hairline BẮT BUỘC tuân thủ 5 nguyên lý bất biến (invariants) dưới đây:

---

### 1. Động học Bậc tự do & Bảo toàn Biên va chạm (DOF & Clearance Invariants)
1. **Một Master State cho mỗi Bậc tự do Độc lập (1 Master State per Independent DOF)**:
   - Mỗi bậc tự do độc lập liên tục dùng duy nhất 1 `spring()` làm biến chủ đạo (`d = spring()`).
   - Mọi chuyển động phụ thuộc cơ học (vòng quay trục ren, góc nghiêng tay đòn, pha dịch chuyển bước ren) BẮT BUỘC suy ra bằng giải tích từ Master State, không chạy nhiều lò xo rời rạc:
     $$\theta = \theta_0 + (d - d_{ref}) \cdot \frac{2\pi}{p_{\text{lead}}}$$
     *(Lưu ý: $p_{\text{lead}}$ là bước tiến/vòng quay của trục vít).*
2. **Khống chế Biên hành trình & Đụng độ vật lý (Kinematic Clearance)**:
   - Tính toán khoảng hành trình thực tế từ kích thước chi tiết: khoá biên bằng `clamp(d, 0, reach)`.
   - Luôn bảo lưu khoảng hở an toàn ($\ge 8–10$ units) trước các khối cản cố định (gối đỡ, thành máy). Điểm chạm chủ đích (ví dụ má kẹp đóng hoàn toàn) phải chạm khít mặt tại $d = 0$ (zero clearance).
3. **Camera Swept Envelope**:
   - `fit(C, points, cx, cy)` chỉ thực hiện căn tâm (`center`), **không tự co giãn (`scale`)**.
   - Bounding points truyền vào `fit` phải bao trọn **toàn bộ quỹ đạo quét 360°** của các bộ phận quay (crank sweep envelope) cộng thêm dung sai nét viền, tránh văng ra khỏi khung hình `400 x 320`.

---

### 2. Bộ sinh Khối Rắn Hình học & Giới hạn Lồi (Solid Macros & Convexity)
1. **Macro Khối Rắn**:
   - **Khối lăng trụ đứng (`box`)**: Dùng `rings(x0, y0, x1, y1, r, b)` kết hợp `prism(P, front, ring, inner, z0, z1)`. Inset `b` phải nhỏ hơn 1/2 cạnh ngắn nhất để tránh lộn mặt crease.
   - **Khối trụ trục ngang X (`tube`)**:
     ```javascript
     const yz = (x, y, z, radius) => circ(radius, 32).map(q => P(x, y + q.u, z + q.v));
     const tube = (g, x0, x1, y, z, radius) => {
       const el = solid(g);
       put(el, {
         sil: poly(hull(yz(x0, y, z, radius).concat(yz(x1, y, z, radius)))),
         crease: poly(yz(x1 - 0.4, y, z, radius - 0.45)),
       });
       return el;
     };
     ```
2. **Tiền đề hình học & Giới hạn Convexity**:
   - Hàm `hull()` tạo bao lồi 2D: **tự động triệt tiêu các hốc lõm và lỗ rỗng**. Chi tiết có biên dạng lõm (chữ U, chữ C, bạc chẻ) phải ghép từ nhiều khối lồi thành phần.
   - Trục nghiêng hoặc trục theo trục Y/Z: Bắt buộc lấy các vành mẫu (`circ`) trên mặt phẳng trực giao với trục và xác định nắp nhìn thấy (visible cap) theo hướng camera.

---

### 3. Quy luật Che khuất & Hoán đổi Chiều sâu (Occlusion & Depth Reordering)
1. **Thứ tự vẽ tĩnh (Static Paint Order)**:
   - Chỉ hợp lệ khi các chi tiết chồng lấn **giữ nguyên thứ tự xa-gần trong toàn bộ hành trình chuyển động**:
     `Base & Hardware` $\rightarrow$ `Fixed Frame` $\rightarrow$ `Shafts/Rods` $\rightarrow$ `Moving Carriage` $\rightarrow$ `Bearing Support` $\rightarrow$ `Crank Assembly`.
2. **Hoán đổi Chiều sâu Động (Dynamic Depth Flips - Rule 06)**:
   - Công thức chiều sâu hệ camera 2:1 (`Cam(az, k, S)`):
     $$\text{depth} = \sqrt{1 - k^2} \cdot (x \sin(\text{az}) + y \cos(\text{az})) + k \cdot z$$
     *(Giá trị depth lớn hơn $\rightarrow$ gần mắt người xem hơn).*
   - Khi chi tiết A chuyển từ phía sau ra phía trước chi tiết B trong quá trình quay/trượt: BẮT BUỘC hoán đổi thứ tự DOM bằng `b.after(a)` thay vì vẽ lại.

---

### 4. Tương tác Ổn định & Chuyển giao Điểm sáng (Hit Stability & Accent Transfer)
1. **Hit-test Bất biến (Rule 01)**:
   - Tuyệt đối không tính va chạm chuột dựa trên toạ độ đang dịch chuyển trên màn hình.
   - Chiếu ngược chuột qua `unproj(C, p[0], p[1], z_target)` lên mặt phẳng nghỉ hoặc mặt phẳng tương tác của bộ phận mục tiêu ($Z_{\text{target}}$ tương ứng), kèm điều kiện giới hạn biên bao (bounding box) để tránh nhận nhầm chuột ngoài vùng máy.
2. **Điểm sáng Ngữ nghĩa Độc bản (Semantic Focal Accent - Rule 04 & 05)**:
   - Trạng thái nghỉ (`rest`): BẮT BUỘC có **duy nhất 1 đối tượng tiêu điểm** mang nét sáng `hi` (có thể gồm nhiều path thuộc về 1 bộ phận, ví dụ mép đệm má kẹp).
   - Trạng thái tương tác (`active`): Nét `hi` ở điểm nghỉ tắt đi, chuyển giao hoàn toàn sang bộ phận đang được người dùng thao tác.

---

### 5. Bộ nhớ Đệm Zero-Cost & Bộ Kiểm định Toàn diện (Zero-Cost Cache & Verification)
1. **Chặn ghi đè DOM SVG (Rule 07)**:
   ```javascript
   function draw() {
     const d = clamp(gap.x, 0, reach);
     // Cache key phải bao gồm TẤT CẢ các biến trạng thái ảnh hưởng đến hình học:
     if (d === lastGap && !dirty) return;
     lastGap = d;
     ...
   }
   ```
2. **Quy chuẩn Kiểm định Đóng gói (Verification Contract)**:
   - [x] **Source Budget**: Giới hạn $\le 150$ dòng code sạch (không vượt trần 200 dòng).
   - [x] **Static Validator**: Chạy `node scripts/create-hairline-figure.mjs validate <file.html>` đạt `Exit 0`.
   - [x] **Clearance Assertion**: Kiểm tra toán học tại $X_{\min}$ (tiếp xúc khít), $X_{\text{rest}}$ (khoảng hở thẩm mỹ), $X_{\max}$ (khoảng cách an toàn tới gối đỡ).
   - [x] **Visual Evidence Proof**: Chụp screenshot thực tế qua headless browser cả 2 trạng thái `rest` và `active`, nhúng trực tiếp bằng chứng trực quan vào artifact.
