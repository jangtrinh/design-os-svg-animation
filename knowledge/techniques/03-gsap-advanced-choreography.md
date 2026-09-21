# Kỹ Thuật 03: GSAP (GreenSock) & Nghệ Thuật Điều Phối Chuyển Động (Choreography)

Phân tích các kỹ thuật tinh hoa từ hệ sinh thái GSAP: **MorphSVG ShapeIndex**, **DrawSVG**, **MotionPath**, và cơ chế **Timeline Sequencing** tương đối.

---

## 1. GSAP MorphSVG & Bí Mật Của `shapeIndex`

MorphSVG của GSAP là giải pháp thương mại thành công nhất thế giới về biến đổi hình học SVG. Bí quyết của nó nằm ở cơ chế **`shapeIndex`**:
- Khi nội suy giữa 2 đường path khép kín có cùng số đỉnh, điểm bắt đầu \(P_0\) của hình nguồn phải kết nối với điểm nào trên hình đích?
- Nếu chọn sai điểm xuất phát, hình học sẽ bị xoắn vặn (twisted).
- `shapeIndex` là một số nguyên đại diện cho vị trí đỉnh bắt đầu trên path đích. MorphSVG tự động duyệt qua tất cả các đỉnh và tính toán giá trị `shapeIndex` tối ưu sao cho tổng khoảng cách di chuyển giữa các điểm điều khiển là nhỏ nhất:
  \[
  \text{shapeIndex}^* = \arg\min_k \sum_{i} \| P_{A, i} - P_{B, (i+k)} \|
  \]

---

## 2. Kỹ Thuật Điều Phối Timeline Tương Đối (Relative Sequencing)

Thay vì tính toán thủ công từng milisecond mốc bắt đầu của mỗi layer (điều mà AI rất hay tính sai số học), GSAP phát minh ra cú pháp vị trí tương đối cực kỳ thanh lịch:

```typescript
const tl = gsap.timeline();

tl.to("#icon-envelope", { y: -20, duration: 0.4 })
  // "<" : Bắt đầu ĐỒNG THỜI với tween trước đó
  .to("#icon-letter", { opacity: 1, duration: 0.3 }, "<")
  // "-=0.15" : Bắt đầu trước khi tween trước đó kết thúc 150ms (Overlapping)
  .to("#letter-flap", { rotationX: 180, duration: 0.5 }, "-=0.15")
  // ">+0.1" : Bắt đầu sau khi toàn bộ chuỗi trước đó kết thúc 100ms
  .to("#check-stamp", { scale: 1.2, duration: 0.2 }, ">+0.1");
```

> [!IMPORTANT]
> **Ứng dụng vào Motion IR**: Thay vì bắt AI phải cộng dồn thời gian tuyệt đối (`startTimeMs: 1250`), chúng ta cho phép khai báo `relativeOffset`: `"with_previous"`, `"overlap(150ms)"`, `"after(100ms)"`. Compiler sẽ tự động tính toán ra keyframes tuyệt đối.

---

## 3. Phân Rã Độ Trễ Nâng Cao (Advanced Staggers)

Khi animate một lưới các icon hoặc các phần tử lặp lại (ví dụ 16 ô vuông trong menu):
```typescript
gsap.to(".grid-item", {
  scale: 1,
  opacity: 1,
  stagger: {
    each: 0.05,        // Mỗi phần tử cách nhau 50ms
    from: "center",    // Lan tỏa từ tâm ra ngoài biên
    grid: [4, 4],      // Lưới 4 hàng 4 cột
    ease: "power2.out" // Gia tốc lan truyền
  }
});
```
- **From options**: `"start"` (trái sang phải), `"end"` (phải sang trái), `"center"` (tâm lan ra), `"edges"` (từ biên ép vào tâm).
- Hiệu ứng này tạo cảm giác giao diện sống động và đẳng cấp vượt trội so với chuyển động đồng loạt đơn điệu.
