# 1. Motion IR và hợp đồng compiler

Trạng thái: đề xuất kiến trúc; schema 0.1.0 và validator scaffold đã có. Các compiler bên dưới là hợp đồng cần triển khai, chưa phải tính năng đã chạy. Chọn một IR semantic có capability negotiation; tránh IR là chuỗi GSAP và tránh ép toàn bộ hệ thống thành frame-by-frame ngay từ đầu.

## Hai lớp biểu diễn

```text
Brief + SVG assets + KB facts
          ↓ AI proposes intent, symbolic targets, constraints
Motion Intent (stagger, spring, follow-path, relative placement)
          ↓ deterministic resolver + geometry + timing solver
Canonical Motion IR (scene graph + typed tracks + explicit time/space)
          ↓ validate → capability preflight → backend-specific lowering
GSAP | CSS Keyframes | WAAPI | Lottie JSON/SVG renderer | SMIL
          ↓ fixed-time rendering + numeric/visual comparison
artifact + source map + repair log + capability report
```

Intent có thể chứa `after:label`, `align:center`, `spring:{mass,stiffness,damping,initialVelocity}`, `followPath:{pathId,speed,orient}`. Chỉ solver chuyển chúng thành số; compiler không gọi LLM. Intent và repair provenance ở sidecar, không cho nhét trường tùy ý vào normalized IR. Spring được bake có sai số định lượng trước khi đi vào schema 0.1.0.

## Contract dữ liệu

[Schema](../schemas/motion-ir.schema.json) là authority cho JSON. [Types](../src/ir/motion-ir.ts) mô tả cùng phiên bản, [fixture](../fixtures/opacity.motion.json) là một animation opacity 1 giây trên path vuông.

| Phần | Dữ liệu và invariant |
|---|---|
| `version` | Literal `0.1.0`; reject version lạ; migration là hàm thuần có source/destination version |
| `scene` | `viewBox=[minX,minY,width,height]`, width/height >0; node ID duy nhất; parentId tồn tại; không cycle |
| `node.path` | Contour có ID ổn định, `closed`, vertices `{p,in,out}`; `in/out` là vector handle tương đối với `p`; contour order có ý nghĩa |
| `node.transform` | translate/scale/rotate/pivot cụ thể; góc degree; số đo trong local SVG user units; không nhận `%`, `auto`, `currentColor` |
| `node.style` | Fill RGBA sRGB 0..1 và opacity 0..1; màu text/theme resolve trước compile |
| `timeline` | durationMs >0, iterations là số nguyên dương hoặc `infinite`, direction và fill toàn timeline |
| `tracks` | Một writer duy nhất cho mỗi `(targetId,property)`; keyframes có `timeMs` tuyệt đối tăng nghiêm ngặt trong [0,durationMs] |
| `ease` | Thuộc keyframe đầu của segment; `linear`, `hold`, hoặc cubic Bézier; ease của keyframe cuối bị bỏ qua |
| `accessibility` | Label + static reduced-motion pose tại `atMs`; host phải chọn pose này trước autoplay |

Properties 0.1: `opacity:number`, `translate:Vec2`, `scale:Vec2`, `rotate:number`, `fill:RGBA`, `path:CubicPath`, `trim:number` (tiến độ 0..1). Node là một path có thể có nhiều contours; parent path tạo hệ tọa độ cha qua wrapper group. General group/clip/filter/text/image là extension tương lai, không được giả như schema đã hỗ trợ.

Matrix convention: column vectors; `Mlocal = T(translate) T(pivot) R(rotate) S(scale) T(-pivot)`, world = parentWorld × local. Góc tăng theo hệ trục SVG y-down. Rotation 0→720 phải giữ hai vòng; không tự lấy đường góc ngắn nhất. Không flatten transform có animation vào geometry. Flatten static transform chỉ khi giữ stroke/mask semantics.

Trong một iteration: trước keyframe đầu dùng giá trị đầu track; sau keyframe cuối giữ giá trị cuối track. `fill` kiểm soát trước/sau toàn effect, không đổi cách hold trong track. Direction áp lên sample time; iterations là tổng số lượt, không phải số lần lặp thêm. Seek cuối timeline hữu hạn dùng endpoint của lượt cuối; start lượt kế tiếp theo direction. Một evaluator thuần `evaluate(ir,timeMs)` là oracle dự kiến cho cả năm backend.

Geometry: mọi contour nội suy cần cùng closed flag, ID/order và số vertices ở tất cả keyframes và base path. Native SVG cần cùng số, loại và thứ tự command, không chỉ cùng số điểm ([SVG paths](https://www.w3.org/TR/SVG/paths.html)). Serializer canonical xuất M/C/Z nhất quán; đoạn đóng contour cũng phải ổn định. `fillRule` giữ nguyên suốt morph. Equal count chỉ là điều kiện cấu trúc, không bảo đảm đúng correspondence/thẩm mỹ.

## Pipeline compile

1. Parse và sanitize SVG theo allowlist; resolve IDs, styles, transforms và references. SVGO chỉ tối ưu trước binding, không là sanitizer.
2. Validate schema + semantic invariants; resolve intent; chuẩn hóa geometry/timing; lưu hash input và repair provenance.
3. Preflight theo `(backend, version, browser, feature)`; trả `native`, `baked`, `host-required`, hoặc `unsupported`. Strict là mặc định. Approximation cần error/size budget đã được chấp nhận.
4. Lower thành target graph và emit code/JSON/XML; escape theo cú pháp đích, scope selector theo root instance; không eval input. Source map nối artifact → track → SVG node.
5. Render tại fixed times, kiểm tra bounds/topology và visual diff; xuất report. Chỉ promote backend/version đã được test.

Artifact contract dự kiến: `{files, entrypoint, assets, diagnostics, sourceMap, requiredRuntime, capabilityDecisions, irHash, compilerVersion}`. Error phải có code + nodeId + trackId + backend + remedy. Ví dụ `E_TOPOLOGY_CHANGE`, `E_UNSUPPORTED_FILTER`, `E_BAKE_BUDGET`, `E_UNBOUND_TARGET`. Không trả success kèm track đã bị lặng lẽ bỏ.

## Mapping năm backend

| Backend | Timeline/easing | Geometry/transform | Giới hạn và output |
|---|---|---|---|
| GSAP | ms→seconds; timeline positions tuyệt đối; `repeat=iterations-1`; direction/reverse/yoyo do wrapper map chính xác; Bézier qua CustomEase hoặc bake | `attr.d` với normalized commands; MorphSVG là adapter tùy chọn; scalar transform proxy dựng matrix canonical hoặc wrapper transform components | JS module nhận root, cleanup/revert; callbacks chỉ trong host, không executable code trong IR |
| CSS | `% = 100*timeMs/durationMs`; thêm boundary holds; easing trên keyframe áp segment sau; fill/direction/iteration map trực tiếp | Gộp translate/rotate/scale của cùng node thành một transform track sau resample; origin được explicit; `d:path(...)` chỉ khi profile browser xác nhận | SVG + stylesheet scope theo instance; event graph/seek control cần host; không coi arbitrary SVG attributes là CSS properties |
| WAAPI | `KeyframeEffect`/`Element.animate`; offsets normalized; synchronize `startTime` chung trên DocumentTimeline; seek bằng `currentTime` chung | Chung lowering CSS; kiểm tra animatable CSS property, không có generic setAttribute animation | JS module với play/pause/seek/dispose; arbitrary attributes/morph unsupported → reject hoặc explicit JS driver làm thay đổi runtime contract |
| Lottie SVG | Emit Lottie JSON; `frames=ms*fps/1000`; `ip/op/fr`; opacity và scale ×100; timeline direction/loop/fill do wrapper hoặc bake hữu hạn | Cubic vertices→`v`, relative handles→`i/o`, closure→`c`; preserve grouping, fill-rule, draw order, parent transform/anchor; easing handles là temporal, khác spatial handles | `lottie-web` là player, không converter SVG→Lottie; SVG renderer tạo DOM. No arbitrary DOM/CSS/filter parity. JSON validation + rendered output đều bắt buộc |
| SMIL | `<animate>`, `<animateTransform>`, `<animateMotion>`; keyTimes normalized; cubic→keySplines/calcMode=spline; hold/mixed easing có thể split/bake | `d` values cùng M/C/Z; g wrappers giữ transform order; draw-on qua dash attributes sau đo length | Standalone animated SVG; reverse/yoyo phải bake hoặc host; prefers-reduced-motion cần static export/host vì CSS không đáng tin để tắt SMIL |

GSAP easing plugin/shape features theo [MorphSVG docs](https://gsap.com/docs/v3/Plugins/MorphSVGPlugin/). CSS/WAAPI semantics theo [Web Animations](https://www.w3.org/TR/web-animations-1/) và [CSS Easing](https://www.w3.org/TR/css-easing-1/). SMIL mapping theo [SVG Animations](https://w3c.github.io/svgwg/specs/animations/). Lottie path conventions theo [shape specification](https://lottie.github.io/lottie-spec/latest/specs/shapes/); supported feature scope cần đối chiếu [renderer matrix](https://github.com/airbnb/lottie-web/wiki/Features).

Một ví dụ easing liên nền tảng: cubic `{x1:0.42,y1:0,x2:0.58,y2:1}` → CSS `cubic-bezier(.42,0,.58,1)`; SMIL `keySplines=".42 0 .58 1"`; Lottie outgoing/incoming temporal handles theo spec; GSAP CustomEase sau kiểm chứng version. Bézier y có thể vượt 0..1 nhưng x phải trong 0..1; SMIL keySplines giới hạn control coordinates nên overshoot phải bake hoặc reject. Chỉ dùng một easing chung không thể biểu diễn mọi hệ spring.

## Baking và compatibility

Spring/path-following lowering lấy mẫu thích ứng theo sai số, không mặc định 60 fps cho mọi trường hợp. Cap số keyframes, bytes và compute; vượt cap trả lỗi. Giữ mẫu ở discontinuities và extrema; không dùng decimation làm mất hold/corner. Lottie frame quantization thêm error budget thời gian và phải kiểm tra pose tại `op-ε` vì out-point là exclusive. Nếu final pose cần giữ, wrapper/static pose hoặc hold extension phải explicit.

Trim semantics: tiến độ arc length trên contours theo thứ tự. Closed/open multi-contour, stroke joins/caps và `pathLength` cần fixture riêng; hiện schema mô tả progress nhưng chưa có stroke style, nên compiler scaffold **không tuyên bố hỗ trợ trim rendering**. Fill interpolation cần lựa chọn color space và clamp policy thống nhất; native defaults không đủ làm bằng chứng parity. Profile đầu nên chỉ linear/hold/cubic trong gamut; bake khi browser/player khác biệt.

Filters, masks, blend modes, responsive reflow, event/state machines và dynamic text không nằm trong portable core. Native extensions có namespace + version + fallback explicit; portable export reject nếu không có lowering. Text outlining cần giữ accessible label và font-license record.

## Acceptance khi triển khai compiler

Reference suite: opacity, nested transform, nonzero viewBox origin, 720° rotation, open/closed cubic morph, donut hole, unequal contour counts, overshooting spring, finite/infinite alternate, hold discontinuity, reduced-motion, two instances on same page. Sampling kiểm tra start/end, keyframe±ε, extrema, loop boundary và midpoint. Cần render Chromium/Firefox/WebKit thực tế; support table từ docs chỉ là evidence nguồn, chưa là kết quả test.

Tolerance ban đầu là proposed policy: geometry ≤0.25 viewBox units tại scale tham chiếu, timeline ≤0.5 output frame, không thay đổi topology ngoài transition được cho phép. Đây không phải benchmark đã đạt; chọn lại theo yêu cầu art và viewport trước khi khóa acceptance.
