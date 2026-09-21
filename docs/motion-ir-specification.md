# Motion IR (Intermediate Representation) Specification v1.0

Tài liệu đặc tả chuẩn dữ liệu trung gian **Motion IR**. Đây là định dạng chuẩn được sinh ra từ khâu Motion Planning và đưa vào các Target Compilers (CSS, GSAP, WAAPI, Lottie).

---

## 1. Triết Lý Thiết Kế
1. **Target-Agnostic**: Không phụ thuộc vào cú pháp của CSS, GSAP hay Lottie.
2. **Physics & Keyframe Hybrid**: Hỗ trợ đồng thời cả Keyframe-based interpolation và Physics-based Spring kinematics.
3. **Hardware-Friendly**: Cấu trúc rõ ràng các thuộc tính phần cứng (GPU transform) và hình học (Path morphing).
4. **Accessibility First**: Bắt buộc có khối fallback `reducedMotion`.

---

## 2. Cấu Trúc TypeScript Schema

```typescript
export interface MotionIRDocument {
  version: "1.0.0";
  metadata: {
    name: string;
    description?: string;
    author?: string;
    viewBox: [number, number, number, number]; // [minX, minY, width, height]
    frameRate: number; // e.g. 60
  };
  timeline: {
    durationMs: number;
    loop: boolean | number; // true, false, or repeat count
    direction: "normal" | "reverse" | "alternate";
  };
  tracks: MotionTrack[];
  reducedMotionFallback: {
    type: "fade" | "static" | "simplified";
    durationMs?: number;
  };
}

export interface MotionTrack {
  targetSelector: string; // CSS selector inside SVG (e.g. "#bell-clapper", ".wing-left")
  transformOrigin?: [number, number] | string; // e.g. [50, 10] or "50% 10%"
  stagger?: {
    eachMs: number;
    from?: "start" | "center" | "end";
  };
  properties: MotionProperty[];
}

export type MotionProperty = 
  | TransformProperty
  | OpacityProperty
  | MorphProperty
  | StrokeProperty
  | TrimPathProperty
  | MotionPathProperty;

export interface TrimPathProperty extends BaseProperty {
  type: "trim-path"; // Lottie-inspired stroke trimming
  totalLength: number;
  keyframes: {
    timePercent: number;
    startPercent: number; // 0 to 100%
    endPercent: number;   // 0 to 100%
    offsetAngle?: number; // 0 to 360 degrees
  }[];
}

export interface MotionPathProperty extends BaseProperty {
  type: "motion-path"; // GSAP-inspired path following
  pathSelector: string; // ID or selector of guide SVG path
  autoRotate?: boolean;
  alignOrigin?: [number, number] | string;
  keyframes: {
    timePercent: number;
    progressPercent: number; // 0 to 100% along the path
  }[];
}

export interface BaseProperty {
  delayMs?: number;
  durationMs: number;
  easing: EasingCurve;
}

export interface TransformProperty extends BaseProperty {
  type: "transform";
  transformType: "translate" | "rotate" | "scale" | "skew";
  keyframes: {
    timePercent: number; // 0.0 to 1.0
    value: number | [number, number]; // scalar or [x, y]
  }[];
}

export interface OpacityProperty extends BaseProperty {
  type: "opacity";
  keyframes: {
    timePercent: number;
    value: number; // 0.0 to 1.0
  }[];
}

export interface MorphProperty extends BaseProperty {
  type: "morph";
  fromPath: string; // SVG d-attribute string
  toPath: string;   // SVG d-attribute string
  morphAlgorithm: "flubber" | "polymorph" | "linear";
  precision?: number;
}

export interface StrokeProperty extends BaseProperty {
  type: "stroke-dash";
  totalLength: number;
  keyframes: {
    timePercent: number;
    dashOffset: number;
  }[];
}

export type EasingCurve = 
  | { type: "predefined"; name: "linear" | "ease-in" | "ease-out" | "ease-in-out" }
  | { type: "cubic-bezier"; points: [number, number, number, number] } // [x1, y1, x2, y2]
  | { type: "spring"; mass: number; stiffness: number; damping: number; initialVelocity?: number };
```

---

## 3. Ví Dụ File Motion IR Mẫu (`notification-bell.motion.json`)

```json
{
  "version": "1.0.0",
  "metadata": {
    "name": "notification-bell-ring",
    "viewBox": [0, 0, 48, 48],
    "frameRate": 60
  },
  "timeline": {
    "durationMs": 800,
    "loop": false,
    "direction": "normal"
  },
  "tracks": [
    {
      "targetSelector": "#bell-body",
      "transformOrigin": "24px 8px",
      "properties": [
        {
          "type": "transform",
          "transformType": "rotate",
          "durationMs": 800,
          "easing": {
            "type": "spring",
            "mass": 1.0,
            "stiffness": 180,
            "damping": 12
          },
          "keyframes": [
            { "timePercent": 0.0, "value": 0 },
            { "timePercent": 0.2, "value": 15 },
            { "timePercent": 0.4, "value": -12 },
            { "timePercent": 0.6, "value": 8 },
            { "timePercent": 0.8, "value": -3 },
            { "timePercent": 1.0, "value": 0 }
          ]
        }
      ]
    },
    {
      "targetSelector": "#bell-clapper",
      "transformOrigin": "24px 36px",
      "properties": [
        {
          "type": "transform",
          "transformType": "translate",
          "delayMs": 50,
          "durationMs": 750,
          "easing": {
            "type": "cubic-bezier",
            "points": [0.34, 1.56, 0.64, 1]
          },
          "keyframes": [
            { "timePercent": 0.0, "value": [0, 0] },
            { "timePercent": 0.3, "value": [-4, 0] },
            { "timePercent": 0.7, "value": [4, 0] },
            { "timePercent": 1.0, "value": [0, 0] }
          ]
        }
      ]
    }
  ],
  "reducedMotionFallback": {
    "type": "fade",
    "durationMs": 200
  }
}
```
