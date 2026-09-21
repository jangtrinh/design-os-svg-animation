# Trụ Cột 04: Động Cơ Chuyển Động & Các Nền Tảng Đích (Animation Engines & Targets)

Phân tích, so sánh và định tuyến các nền tảng thực thi (Execution Runtimes) để biên dịch từ Motion IR sang code thực tế.

---

## 1. Ma Trận So Sánh Các Nền Tảng Đích

| Tiêu Chí | Pure CSS Keyframes | GSAP Timeline | Web Animations API (WAAPI) | Lottie SVG (Bodymovin) | SMIL (SVG Native) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Kích thước Runtime** | **0 KB** (Native) | ~60 KB (Gzip ~25KB) | **0 KB** (Native JS) | ~150 KB (lottie-web) | **0 KB** (Native XML) |
| **Hiệu năng GPU** | ⭐⭐⭐⭐⭐ Cực cao | ⭐⭐⭐⭐ Rất cao | ⭐⭐⭐⭐⭐ Cực cao | ⭐⭐⭐ Trung bình | ⭐⭐ Thấp |
| **Khả năng Điều Khiển** | Thấp (Play/Pause cơ bản) | ⭐⭐⭐⭐⭐ Tuyệt đối (Seek, Reverse, TimeScale) | ⭐⭐⭐⭐ Cao (Play, Pause, CurrentTime) | ⭐⭐⭐⭐ Cao | Kém |
| **Hỗ trợ Path Morphing** | Hạn chế (chỉ Chrome/Safari mới) | ⭐⭐⭐⭐⭐ Xuất sắc (với MorphSVG) | Hạn chế (yêu cầu cùng vertex count) | ⭐⭐⭐⭐ Tốt qua Bezier tracks | ⭐⭐⭐ Khá nhưng giật |
| **Tính Tương Thích Mobile** | 100% | 100% | > 97% | 100% (iOS/Android native) | Cảnh báo deprecation |
| **Phù Hợp Cho** | Micro-interactions, icon hover, loader | Storytelling, complex hero UI, morphing | Dynamic UI theo dữ liệu, game UI | Minh họa After Effects, onboarding | Không khuyến nghị |

---

## 2. Kỹ Thuật Biên Dịch Từng Nền Tảng

### 2.1 Target 1: Pure CSS Keyframes (Zero-JS Runtime)
Tối ưu hóa tuyệt đối cho các component UI độc lập, không tải thêm bất kỳ thư viện JS nào:
```css
@keyframes bell-ring {
  0%   { transform: rotate(0deg); }
  20%  { transform: rotate(15deg); }
  40%  { transform: rotate(-12deg); }
  60%  { transform: rotate(8deg); }
  80%  { transform: rotate(-3deg); }
  100% { transform: rotate(0deg); }
}

.bell-icon #bell-body {
  transform-box: fill-box;
  transform-origin: 24px 8px;
  animation: bell-ring 800ms cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .bell-icon #bell-body {
    animation: none;
  }
}
```

### 2.2 Target 2: GSAP Timeline (Phức Tạp & Điều Khiển Dòng Thời Gian)
Lý tưởng khi cần ghép nối chuỗi chuyển động tuần tự (Choreography) hoặc đồng bộ theo thanh cuộn (ScrollTrigger):
```typescript
import gsap from "gsap";

const tl = gsap.timeline({ repeat: -1, yoyo: true });

tl.to("#bell-body", {
  rotation: 15,
  transformOrigin: "24px 8px",
  duration: 0.2,
  ease: "power2.out"
})
.to("#bell-body", {
  rotation: -12,
  duration: 0.2,
  ease: "power2.inOut"
})
.to("#bell-clapper", {
  x: 4,
  duration: 0.15,
  ease: "elastic.out(1, 0.3)"
}, "-=0.1"); // Stagger overlap 100ms
```

### 2.3 Target 3: Web Animations API (WAAPI Native JS)
Sức mạnh của JavaScript kết hợp với hiệu năng chạy trên Compositor Thread của trình duyệt:
```typescript
const bellBody = document.querySelector("#bell-body") as SVGElement;

const animation = bellBody.animate(
  [
    { transform: "rotate(0deg)" },
    { transform: "rotate(15deg)" },
    { transform: "rotate(-12deg)" },
    { transform: "rotate(0deg)" }
  ],
  {
    duration: 800,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    iterations: Infinity
  }
);
```
