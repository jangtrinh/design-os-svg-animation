# 2. AI capabilities, limitations và deterministic repair

Phân biệt FACT về định dạng/tool với INFERENCE về khả năng AI. Chưa benchmark model cụ thể; không gán tỷ lệ thành công hay tuyên bố AI đã hiểu physics.

## Phân chia trách nhiệm

AI hữu ích để chuyển brief thành choreography, chọn pattern có nguồn, đề xuất hierarchy/stagger, viết intent theo schema, giải thích diagnostics và đề xuất sửa theo constraints. Đây là giả thuyết thiết kế cần đánh giá trên held-out briefs. AI không giữ quyền quyết định tọa độ cuối, correspondence, topology, solver convergence hoặc tính hợp lệ của artifact.

| Điểm gãy | Tại sao gãy | Repair deterministic | Điều không được tự sửa |
|---|---|---|---|
| Morph point-count mismatch | LLM sinh path hợp cú pháp nhưng khác segments/commands/contours | Parse thành cubic; match contours; winding/start-index alignment; subdivision về cùng signature | Thêm/bỏ hole, split/merge semantic hoặc đoán contour correspondence khi nhiều đáp án |
| Coordinate hallucination | Không có grounding từ geometry thực, lẫn local/world/viewBox hoặc font baseline | SVG AST + CTM + measured bounds; symbolic anchors; giải constraints; reproject vào hệ tọa độ rõ ràng | Clamp mọi điểm vào viewBox; shadow/overshoot có thể cố ý vượt bounds |
| Easing “có vẻ vật lý” | Curve đẹp không bảo đảm velocity/acceleration/energy; cubic không tương đương spring | Analytic spring hoặc integrator fixed-step; validate params; sample theo sai số; đo x/v/a và endpoint | Clamp overshoot của spring rồi vẫn gọi là cùng physics; đổi mass/damping để làm test xanh |
| Cross-backend syntax/API | Tên thuộc tính đúng trên runtime này không có trên runtime khác | Capability registry versioned + deterministic emitters + fixtures | Im lặng bỏ track/filter hoặc fallback engine khác mà không báo |
| Visual judgment | Hình mid-frame ổn có thể che self-intersection/jerk ở thời điểm khác | Numeric sweep + critical-time renders + independent visual review | Đồng nhất schema/test pass với owner acceptance |

## Morph repair có điều kiện

1. **Normalize:** parse commands; absolute coordinates; lines/quadratics→cubic chính xác; arcs→cubic với tolerance (là approximation); giữ contour boundaries/closure/fill rule; không optimize mỗi frame độc lập.
2. **Correspond:** lập containment tree, phân outer/hole theo fill semantics; ghép topology-compatible bằng cost centroid/area/perimeter/landmarks + stable tie-break. Với evenodd, containment vẫn phải được giữ dù winding không quyết định fill. Cost gần hòa hoặc semantic không rõ → `NEEDS_MAPPING`.
3. **Equalize:** ưu tiên chia cubic bằng de Casteljau để giữ hình và landmarks. Arc-length resampling là fallback có geometry error; fit lại cubic nếu cần. Sau align cyclic start-index và direction, áp cùng correspondence xuyên toàn keyframe sequence, không match từng cặp riêng gây twist.
4. **Verify:** finite coordinates, identical signature, bounds/error, winding/containment, self-intersections tại nhiều mẫu và extrema; adaptive subdivision khi có nguy cơ giữa mẫu. Sampling không chứng minh không có collision ở mọi thời điểm; strict topology yêu cầu robust geometric checks hoặc flag chưa chứng minh.
5. **Record:** immutable input, algorithm+version, seed/tie-break, before/after hashes, changed contour/vertex IDs, metrics, budget và decision. Cùng input+config+version phải cùng output. Canonical input không cần repair lại phải idempotent.

`flubber` phù hợp soft morph một closed silhouette; API interpolate bỏ contour/hole còn lại ([upstream](https://github.com/veltman/flubber)). Vì vậy preflight phải reject compound path trước adapter này. `polymorph-js` upstream quảng bá hỗ trợ holes/variable path lengths, nhưng đây là vendor claim cần fixture kiểm tra ([upstream](https://github.com/notoriousb1t/polymorph)). Paper.js cung cấp primitives hình học để đo, subdivide, boolean; không tự giải semantic correspondence ([Path API](https://paperjs.org/reference/path/)). Không dùng ba thư viện cùng lúc cho mọi hình.

Nếu source có một contour và target có hai, “repair thành cùng số điểm” là không đủ. Chọn một policy được ghi rõ: từ chối, owner-supplied mapping, hoặc crossfade layers. Crossfade là đổi cách thể hiện chuyển động, không phải morph tương đương.

## Coordinate grounding

Tất cả placement references là node IDs và anchors: `center`, `bounds.minX`, `baseline`, `path.atLength`. Resolver dùng asset digest và đo fresh; `getBBox`/CTM browser có giới hạn với stroke/filter/invisible nodes nên lưu cả geometric bounds và rendered bounds. Fit viewBox dùng union bounds + intended padding, kiểm tra tại các thời điểm extrema. Không để LLM đo pixel bằng văn bản rồi biến thành authority.

Fonts: parse font thật bằng `opentype.js`, cố định font file hash, variation axes và glyph positions; chuyển font y-up sang SVG y-down đúng một lần. Outlining không thay thế shaping engine đầy đủ; complex scripts/combining marks phải kiểm nghiệm và dùng shaping adapter nếu cần. Giữ original text cho accessibility; không phân phối font nếu license không cho phép ([opentype.js](https://github.com/opentypejs/opentype.js)).

## Easing physics

Spring contract: `m*x'' + c*x' + k*(x-target)=0`; m>0, k>0, c≥0, x0/v0 rõ đơn vị. Damping ratio ζ=c/(2√km), natural frequency ωn=√(k/m). Giải riêng under/critical/over-damped; c=0 không settle, nên cần explicit duration hoặc reject auto-settle. Với target thay đổi, bảo toàn trạng thái x/v ở boundary; đây không phải generic keyframe ease.

Auto-settle: yêu cầu đồng thời |x-target|<εx và |v|<εv trong cửa sổ thời gian xác định, không chỉ tại một crossing. Nếu muốn snap ở cuối, snap là policy riêng có discontinuity report. Bake samples so với analytic oracle tại midpoint và extrema, refine đến error bound hoặc maxSamples. Opacity/trim phải nằm [0,1]; spring overshoot trên chúng phải reject hoặc property-specific clamp đã được owner chọn. Easing Bézier giải x(u)=time bằng bisection/Newton bounded trước khi lấy y(u), không lấy y(time) trực tiếp.

## Recovery và đánh giá

Validator đưa lỗi cấu trúc cho AI sửa intent tối đa một số vòng cố định; deterministic pipeline chịu geometry và time math. Không gửi repaired geometry ngược cho AI “làm đẹp” rồi bỏ provenance. Mỗi failure thêm regression case đã ẩn khỏi generation examples. Đo theo từng lớp: valid schema, solvable constraints, topology preserved, backend export, rendered error, bytes/frame-time, owner acceptance. Báo riêng các tỷ lệ; không tổng hợp thành một “quality score” che mất lỗi.

Fixtures trong scaffold là ví dụ cơ chế, chưa phải dataset người dùng thật. Release cần ít nhất một SVG thật được cho phép sử dụng, font hợp lệ nếu có text, và visual review độc lập sau mutation cuối.
