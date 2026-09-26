# Tiêu Chuẩn Kiểm Duyệt Chất Lượng & An Toàn (Quality & Safety Gates)

Tài liệu quy định các cổng kiểm duyệt bắt buộc (Quality Gates) cho mọi animation và tài liệu tri thức sinh ra trong dự án `design-os-svg-animation`, sử dụng **TypeSafe JEV System One** và các bộ linter kỹ thuật.

---

## 1. Cổng Đánh Giá JEV System One (Knowledge & Rigor Gate)

Mọi tài liệu và code module đều phải vượt qua bộ câu hỏi đánh giá có cấu trúc từ JEV System One:

1. **Engineering Rigor (Độ sâu kỹ thuật)**:
   - *Yêu cầu*: Đạt mức **Detailed** hoặc **Production Grade** (Score >= 2.5 / 3.0).
   - *Tiêu chí*: Phải chứa công thức toán học, thông số thời gian, ràng buộc DOM, và chế độ phục hồi lỗi (failure modes).
2. **Physical / Geometric Grounding (Cơ sở vật lý & hình học)**:
   - *Yêu cầu*: `Probability >= 0.8`.
   - *Tiêu chí*: Có định lượng cụ thể (milliseconds, pixels, degrees, cubic-bezier coordinates).
3. **Cross-Domain Interface Compatibility**:
   - *Yêu cầu*: Đảm bảo tính tương thích giữa SVG DOM ↔ Motion IR ↔ Runtime Compiler.

---

## 2. Cổng Kiểm Tra An Toàn Đồ Họa (SVG AST Auditor Gate)

Trước khi biên dịch, file SVG và mã animation phải qua kiểm tra tự động:

- [x] **Well-formed XML**: Không chứa thẻ chưa đóng, không có thuộc tính rác của phần mềm đồ họa (`inkscape:*`, `sketch:*`, `sodipodi:*`).
- [x] **ViewBox Validity**: `viewBox` có đủ 4 số thực dương cho width/height, không chứa `NaN`, `Infinity`, hoặc số âm cho kích thước.
- [x] **Path Coordinate Bounds**: Tọa độ của các điểm path không được vượt quá 200% biên `viewBox` trừ khi có clip-path chủ động.
- [x] **No Inline Script Injection**: Tuyệt đối không chứa thẻ `<script>` hoặc các handler sự kiện nguy hiểm (`onload`, `onclick` trong SVG XML).

---

## 3. Cổng Tiếp Cận (Accessibility / A11y Gate)

Tuân thủ nghiêm ngặt tiêu chuẩn WCAG 2.2:

1. **Reduced Motion**:
   Mọi animation CSS/JS đều phải có fallback tắt hoặc tối giản chuyển động khi người dùng bật chế độ nhạy cảm tiền đình:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .animated-svg * {
       animation: none !important;
       transition: opacity 0.2s ease !important;
     }
   }
   ```
2. **Semantic Description**:
   SVG phải chứa thẻ `<title>` và `<desc>` giải thích ý nghĩa animation cho Screen Reader (trừ trường hợp thuần trang trí với `aria-hidden="true"`).
3. **Flicker / Seizure Safety**:
   Tần số nhấp nháy ánh sáng hoặc màu sắc không được vượt quá **3 lần/giây (3 Hz)** để chống gây co giật do động kinh cảm quang (Photosensitive Epilepsy).

---

## 4. Ngân Sách Hiệu Năng (Performance Budget)

- **Frame Rate**: Tối thiểu 60 FPS liên tục trên thiết bị di động tầm trung.
- **GPU Compositing**: 100% animation vị trí phải dùng `transform` (hoặc `translate3d`), không dùng `top`, `left`, `margin`.
- **Bundle Size Overhead**: Mã CSS compile từ Motion IR không vượt quá 5KB gzip cho một component icon.
