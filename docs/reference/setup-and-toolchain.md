# 4. Folder setup và toolchain

## Trạng thái integration

Một phiên khác đã thay package.json/README/tsconfig trong lúc setup. Các npm commands bên dưới thuộc [manifest đề xuất](../../plans/toolchain-package.proposed.json), **chưa được hợp nhất** vào package đang chạy. Xem [entry point bổ sung](../architecture/architecture-supplement.md). Các file src/scripts/schema/playground đã tồn tại; Node-only scripts chạy trực tiếp được.

## Structure đã tạo

```text
design-os-svg-animation/
├── README.md
├── package.json, tsconfig.json, svgo.config.mjs
├── docs/                         # bốn phần kiến trúc
├── schemas/motion-ir.schema.json # JSON contract 0.1.0
├── src/
│   ├── ir/                      # TypeScript types + schema/semantic validator
│   ├── compilers/               # design capability registry, chưa có emitters
│   ├── geometry/                # hợp đồng adapter, chưa có repair engine
│   └── runtime/                 # host/evaluator contract
├── fixtures/                    # SVG + normalized IR sample
├── scripts/                     # check, validation, optimize, research queue
├── tests/                       # positive + negative IR cases
├── playground/                  # browser dependency probe, không là engine demo
├── knowledge/{topics,claims,research}/
└── plans/{plan.md,reports/}      # delivery state và evidence
```

Một package private trước; chỉ tách npm workspaces khi có consumers hoặc release boundaries thật. Geometry nặng chạy worker khi đo được main-thread blocking. Browser player chỉ import backend cần dùng; compiler/KB không được bundle vào player. Toolchain probe cố ý import tất cả để bắt packaging incompatibility, không dùng bundle đó làm performance baseline.

## Dependency baseline

Exact pins đề xuất trong [manifest bổ sung](../../plans/toolchain-package.proposed.json), không dùng `latest` và không coi đây là phiên bản mới nhất. Semver pins cấp trực tiếp chưa khóa transitive tree; cần package-lock.json từ cài đặt thực.

| Package | Vai trò | Boundary |
|---|---|---|
| `svgo@4.0.0` | XML/SVG cleanup trước khi tạo bindings | Preserve viewBox, IDs, hierarchy và path geometry; config hiện chỉ bỏ comments/doctype/XML PI, không sanitize |
| `paper@0.12.18` | Bézier/path measurements và geometry operations | Browser-first; headless Node canvas/jsdom là profile riêng cần đo dependency native |
| `flubber@0.4.2` | Closed silhouette morph fallback | Reject compound/hole input trước interpolate; approximation budget |
| `polymorph-js@1.0.2` | Candidate morph adapter cho corpus khó | Tên npm đúng là polymorph-js; README support holes chưa thay test |
| `opentype.js@1.3.4` | Font parsing/outlines | Font thật + license + shaping tests; không tự thay full shaping engine |
| `lottie-web@5.13.0` | Phát Lottie JSON bằng SVG renderer | Không là general SVG-to-Lottie compiler |
| `gsap@3.13.0` | JS runtime backend | Plugin và license distribution cần kiểm tra theo artifact sử dụng; không suy license từ thời kỳ cũ |
| Ajv 8.17.1 / TypeScript 5.8.3 / Vite 6.1.0 | JSON Schema 2020-12, typecheck, browser probe/build | Baseline cố định; install/build qualification còn pending |

Version manifests đã đối chiếu: [SVGO](https://github.com/svg/svgo/blob/v4.0.0/package.json), [Paper](https://github.com/paperjs/paper.js/blob/v0.12.18/package.json), [Polymorph](https://github.com/notoriousb1t/polymorph/blob/master/package.json), [OpenType](https://github.com/opentypejs/opentype.js/blob/1.3.4/package.json), [Lottie](https://github.com/airbnb/lottie-web/blob/v5.13.0/package.json), [GSAP](https://github.com/greensock/GSAP/blob/3.13.0/package.json). Package resolution và compatibility vẫn cần successful npm install; không dùng source tag làm bằng chứng npm đã cài.

## Commands

```sh
cd /Users/jang/Products/design-os-svg-animation
node scripts/check-scaffold.mjs
node scripts/research-queue.mjs
# Sau khi hợp nhất manifest với owner của phiên đang ghi:
npm install --ignore-scripts
npm run check:ir
npm run optimize:svg
npm run build:toolchain
npm run dev:toolchain
```

`check:scaffold`: Node-only, parse JSON, syntax-check MJS, verify local Markdown links + capability count + minimal claim provenance. Không validate IR schema, không typecheck, không render.

`check:ir` (đề xuất): scaffold check + TypeScript + Ajv IR validation + negative tests. `optimize:svg` chỉ đọc fixture và ghi artifacts/source.optimized.svg, không sửa input. `build:toolchain` build browser probe bằng Vite. `dev:toolchain` bind localhost; mở URL được in để quan sát probe. `research:queue` offline read-only queue.

Sau install đầu, review dependency tree/advisories/licenses, giữ package-lock.json rồi dùng `npm ci --ignore-scripts` cho tái lập. Nếu dependency cần install script, review script cụ thể và cho phép theo scope; không tự bỏ policy. Vite/esbuild execution phải được xác minh sau install. Chưa tạo lockfile giả từ các version dự đoán.

## SVGO ordering

`untrusted input → XML parser/sanitizer → conservative SVGO → stable-ID bindings → geometry normalization → IR → emit`. Không chạy aggressive SVGO sau binding hoặc độc lập trên từng path keyframe: convertPathData/mergePaths/cleanupIds có thể phá correspondence hoặc target IDs. Nếu cần final optimization, chạy profile animation-aware rồi verify lại references và visuals. Config mặc định của SVGO có nhiều structural transformations ([preset](https://svgo.dev/docs/preset-default/)); explicit plugin allowlist giúp tránh vô tình kích hoạt chúng.

## Test tiers và trạng thái

Scaffold gates không cần dependency chạy riêng. IR validator và tests cần Ajv; browser toolchain cần các package và engine thật. Browser probe chỉ chứng minh một số APIs/imports, không chứng minh cross-backend parity hoặc deterministic repair. Những gates tiếp theo: compiler contract unit tests; CPU geometry tests; Playwright Chromium/Firefox/WebKit fixed-time captures; visual/numeric compare; actual SVG corpus + owner acceptance. Chưa thêm Playwright dependency và `test:visual` giả khi chưa có test suite.

Trong phiên setup, npm registry lookup bị `ENOTFOUND registry.npmjs.org` trong sandbox. Không nâng quyền hay thay network policy. Xem report để biết checks nào đã chạy. Không có code compiler giả trả output mẫu và không có daemon auto-research được bật.
