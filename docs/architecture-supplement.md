# SVG Animation Engine — phần bổ sung kiến trúc

Trạng thái: bốn tài liệu hoàn chỉnh ở mức thiết kế + scaffold bổ sung; integration với prototype đang được phiên khác viết còn pending.

1. [Motion IR và năm compiler backends](motion-ir.md)
2. [AI capabilities và deterministic repair](ai-capabilities-and-repair.md)
3. [Knowledge Base và Auto-research](knowledge-and-auto-research.md)
4. [Folder setup và toolchain](setup-and-toolchain.md)

## Chạy ngay, không cần dependency

```sh
cd /Users/jang/Products/design-os-svg-animation
node scripts/check-scaffold.mjs
node scripts/research-queue.mjs
```

## Hai hợp đồng đang tồn tại

Trong lúc viết, một phiên khác tạo Git repo và thay README/package/tsconfig, thêm [authoring spec v1.0](motion-ir-specification.md) và prototype CSS/GSAP. Phần bổ sung này giữ nguyên artifacts đó. Schema [normalized 0.1.0](../schemas/motion-ir.schema.json) là proposed lower-level contract, không là migration/replacement của authoring v1.0. Version nằm trên hai lớp khác nhau; chưa có resolver nối chúng.

| Authoring v1.0 | Normalized 0.1.0 | Resolver cần làm |
|---|---|---|
| selectors + external SVG | scene nodes + targetId | Sanitize/import SVG; bind selector to stable IDs; reject ambiguous/missing targets |
| relative keyframe time + per-property duration/delay | absolute timeMs | Resolve schedule, boundaries và full duration |
| predefined/Bézier/spring | linear/hold/cubic | Resolve named curves; solve/bake spring có budgets |
| transformOrigin string/percent | explicit pivot local units | Measure geometry và resolve CTM/origin semantics |
| loop bool/number + fallback variants | total iterations + static atMs | Chốt repeat-count convention; resolve fade/simplified as separate intent or reject |

Không đưa `examples/notification-bell.motion.json` trực tiếp vào validator 0.1.0. Không gọi prototype là implementation của năm backend hay dùng output demo làm bằng chứng parity.

## Package integration pending

[Package proposal](../plans/toolchain-package.proposed.json) chứa đầy đủ toolchain/scaffold scripts. Đây là manifest đề xuất, không phải package.json đang chạy. Giữ các script `demo`, `audit:*`, `build` của phiên kia khi hợp nhất; dùng script names `*:ir` / `*:toolchain` để tránh đè. Resolve dependency version conflicts và bỏ duplicate svgo dependency/devDependency trước install. Chưa overwrite package hiện tại, chưa cài dependency, chưa tạo lockfile.

[Verification report](../plans/reports/verification.md) ghi rõ kết quả thực tế và blocker. Native independent reviewer chỉ đọc, không sửa artifacts.
