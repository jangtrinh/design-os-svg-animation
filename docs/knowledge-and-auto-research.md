# 3. Knowledge Base và Auto-research

Mục tiêu: mỗi quyết định compiler có nguồn, scope/version và phép thử; research cập nhật tri thức mà không tự biến nội dung web thành production code. Bắt đầu filesystem + JSON/Markdown + deterministic index. Chưa cần vector DB, graph DB hay service riêng. Embeddings là lớp retrieval bổ sung sau khi đo lexical search không đủ.

## Taxonomy theo năm topic families

Đây là operational index bổ sung cho bảy trụ cột hiện có trong knowledge/INDEX.md: pillars 01+03 → geometry; 02+06 → motion (interactive state nằm host layer); 04 → backends; 05 → research/IR; 07 → verification/performance. Giữ tài liệu pillar hiện có, link bằng claim IDs; không thay phân loại của phiên kia.

| Topic | Modules | Consumers |
|---|---|---|
| Geometry | SVG AST, units/CTM/viewBox, cubic Bézier, fill/topology, morph correspondence, font/shaping | importer, constraints, repair |
| Motion | timeline composition, easing, spring/kinematics, path following, choreography recipes | intent planner, timing solver |
| Backends | GSAP, CSS, WAAPI, Lottie SVG, SMIL; version/browser capability matrix | preflight, lowerers, runtime host |
| Verification | geometry/visual differential tests, performance budgets, reduced motion, SVG sanitization | evaluator, CI, release gate |
| Research operations | source registry, claims, experiments, promotion, contradiction/deprecation | researcher, curator, retrieval |

[Machine-readable topic index](../knowledge/topics/index.json). Tags là axes xuyên topic: `feature`, `backend`, `libraryVersion`, `browserVersion`, `geometryClass`, `failureCode`, `license`, `confidence`. Không tạo bản sao cùng kiến thức trong mọi backend folder: một claim ID, nhiều relations.

## Các loại record

| Record | Nội dung tối thiểu |
|---|---|
| Source | ID, primary URL, title/section, upstream version/commit nếu có, fetchedAt, content hash, license/quoting restrictions, reviewAfter |
| Claim | ID, statement, FACT/INFERENCE/UNKNOWN, scope, source refs, status, contradictions, supersedes, checkedAt, reviewAfterDays |
| Recipe | intent pattern, preconditions, contraindications, parameter ranges, normalized IR example, source refs, required capabilities |
| Experiment | hypothesis, falsifier, input hashes, exact command, dependency lock hash, environment, metrics, outputs, pass criteria, observed result |
| Failure case | minimal reproduction, failure code, expected/actual, owning stage, regression test, permitted repair/fallback |

Các claim seed hiện là `documented`: nguồn primary đã đọc, chưa tái hiện runtime. Không có benchmark giả. Trong scaffold chưa tạo raw snapshots/content hashes vì chưa có ingestion pipeline; khi thêm phải gắn hash thật, không hash do LLM tưởng tượng. Record format hiện nhẹ; schema hóa cả KB là một acceptance item cho research executor tiếp theo.

## Luồng retrieval → generation

Request → parse intent/features → filter scope/backend/version → lexical/BM25 search → retrieve authoritative claims + counterexamples → contextualize → AI emits Motion Intent → deterministic pipeline. Chỉ retrieve minimum relevant chunks và provenance; không nạp toàn bộ KB vào prompt. Ưu tiên qualified/reproduced nhưng không giấu mâu thuẫn. Claim hết review window gắn `stale`, không xóa; thông tin version khác có thể tham khảo nhưng không dùng để tuyên bố support.

Chỉ compiler capability registry được quyết định hỗ trợ runtime; prose trong research không được override. Query “CSS morph donut” phải trả cả browser qualification và counterexample về compound paths, không chỉ một demo thành công.

## Auto-research state machine (thiết kế)

```text
backlog → select → fetch primary sources → extract candidate claims
       → deduplicate → propose falsification experiment
       → isolated experiment → independent review → promote/reject
       → indexed KB + versioned capability evidence
```

Triggers: dependency/version change, browser release, unresolved failure code, stale claim, hoặc explicit question. Prioritize blockers và contradiction trước; sau đó impact × uncertainty × freshness / estimated cost. Mỗi job có `queued/running/blocked/review/accepted/rejected` + attempts + budget + checkpoint. Cache key = source content hash + tool/version + experiment config. Retry idempotent read có backoff giới hạn; failed experiment không biến thành accepted.

Budget khởi đầu là policy đề xuất: tối đa 3 nguồn/job, 2 experiment attempts, wall time 10 phút, CPU/memory/download limits theo sandbox. Vượt budget → blocked với bằng chứng và next action. Không có daemon/schedule được cài trong scaffold. `node scripts/research-queue.mjs` chỉ đọc backlog và in việc tiếp theo, không duyệt web hay sửa claims.

Promotion gates: nguồn primary còn truy cập được; claim có exact scope/version; negative case chạy; artifact hashes và commands tái lập; reviewer khác generator; rendered evidence nếu claim liên quan visual; dependency license reviewed. `documented → reproduced → qualified` là các mức bằng chứng khác nhau. “Qualified” phải nêu browser/OS/player matrix đã chạy; không suy rộng từ Chromium sang Safari.

## Ranh giới module và ownership

`research/fetch` chỉ đọc nguồn allowlist, lưu raw evidence bất biến và receipt. `research/extract` tạo candidate untrusted. `experiments/runner` chạy code đã được kiểm tra trong sandbox, network mặc định tắt; nội dung nguồn không được phát lệnh shell hay thay approval policy. `curation` có quyền promote claims/index nhưng không sửa compiler implementation. `compiler/capabilities` chỉ nhận reviewed patch có tests. Generator không tự chấm output của mình.

MVP dùng file queue với một executor để tránh race. Khi tăng workers: file locks/leases, atomic writes, stale-lease recovery và immutable run IDs; mỗi claim có revision/optimistic concurrency. Provenance/index được build từ records; index có thể rebuild và không là source of truth. Chưa cần event bus phân tán.

## Research backlog đã tạo

[Backlog](../knowledge/research/backlog.json) có năm câu hỏi cụ thể: opacity parity, compound morph, spring bake error, SVG origins, font outlines. Mỗi câu có falsifiable experiment. Kết quả phải chứa cả fail, không chỉ gallery đẹp.

Acceptance cho executor tương lai: offline replay một job; fail đúng khi nguồn thiếu/mâu thuẫn; không promote khi không có evidence; budget exhaustion có receipt; cùng content hash không tạo duplicate; one real user-authorized SVG run; update index không làm mất record cũ. Khi package thay đổi, các qualification phụ thuộc version cũ phải chuyển stale cho đến khi chạy lại.
