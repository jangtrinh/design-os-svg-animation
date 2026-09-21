# Trụ Cột 07: Tối Ưu Hóa Hiệu Năng & Quy Trình Render (Performance Optimization)

Để đạt tốc độ mượt mà 60 FPS / 120 FPS mà không gây nóng máy hoặc hao pin thiết bị người dùng, kỹ sư cần hiểu tường tận cách trình duyệt kết xuất đồ họa vector.

---

## 1. Chu Trình Kết Xuất Của Trình Duyệt (Rendering Pipeline)

```
DOM + CSSOM 
    │
    ▼
[Recalculate Style] ──► [Layout / Reflow] ──► [Paint / Rasterize] ──► [Composite Layers] (GPU)
```

1. **Layout / Reflow (Đắt đỏ nhất)**: Tính toán kích thước và vị trí hình học của các phần tử. Xảy ra khi animate: `width`, `height`, `x`, `y`, `cx`, `cy`, `r`.
2. **Paint / Rasterize (Đắt thứ nhì)**: Vẽ các vector pixel vào bitmap bộ nhớ. Xảy ra khi animate: `d` (path morphing), `fill`, `stroke`, `stroke-dashoffset`.
3. **Composite Layers (Rẻ nhất - GPU Native)**: GPU chỉ việc ghép và biến đổi các texture bitmap đã được rasterize sẵn. Xảy ra khi animate: `transform` (`translate3d`, `rotate`, `scale`) và `opacity`.

> [!CAUTION]
> **Quy Tắc Sống Còn**: Luôn chuyển đổi mọi animation dịch chuyển, phóng to, xoay về thuộc tính CSS `transform`. Tránh tuyệt đối animate các tọa độ hình học trực tiếp của thẻ SVG (`x`, `y`, `cx`, `cy`) trong quá trình loop.

---

## 2. Kỹ Thuật Đẩy Lớp Lên GPU (`will-change`)

Khi một phần tử SVG chuẩn bị animate:
```css
.animated-layer {
  will-change: transform, opacity;
  /* Kích hoạt phần cứng compositing trên Safari/WebKit */
  transform: translateZ(0);
}
```
- **Lưu ý**: Không lạm dụng `will-change` cho toàn bộ các node SVG vì sẽ làm cạn kiệt VRAM của GPU. Chỉ bật khi phần tử sắp chuyển động và gỡ bỏ khi animation kết thúc.

---

## 3. Cấu Hình SVGO Chuẩn Cho Hoạt Hình (Animation-Safe SVGO Config)

Các preset minification mặc định của SVGO thường làm hỏng animation do:
- Gom gộp các thẻ `<path>` rời rạc làm một (`mergePaths: true`).
- Xóa bỏ các `id` mà code JS/CSS đang dùng để query selector (`cleanupIds: true`).
- Làm phẳng ma trận transform gốc khiến tâm xoay bị dịch chuyển (`convertTransform: true`).

### File Cấu Hình Khuyến Nghị (`svgo.config.js`)
```javascript
export default {
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // BẮT BUỘC TẮT các plugin sau để bảo vệ animation:
          cleanupIds: false,        // Giữ nguyên ID để gắn targetSelector
          mergePaths: false,        // Giữ nguyên các layer độc lập để animate
          convertTransform: false,  // Không làm xáo trộn điểm tựa transform gốc
          removeHiddenElems: false, // Giữ các subpath ẩn phục vụ morphing
          collapseGroups: false     // Giữ cấu trúc nhóm <g>
        }
      }
    },
    "removeTitle",
    "removeComments",
    "removeMetadata",
    "removeUselessDefs",
    "cleanupNumericValues"
  ]
};
```
