# Retro 2026-10-15: adopt anatomy + pilot physics-lever

Scope: phiên 13–15/10 — research anatomy → Phase A (line-end gate) → pilot lever → PR #14 merged.

## 1. Đo chi phí (FACT, đếm từ transcript)

| Bucket | Số | Root cause |
|---|---|---|
| Lượt worker hỏng/bỏ | 2 (Grok build-fast 72 turn/26 phút; grok-4.7 30 turn/15 phút) | sandbox Grok không chạy được Chrome; brief yêu cầu gate cần Chrome |
| False green / false red của gate | 5 | adapter tính crease là texture (1); ISO_CSS làm nét mất màu → #2–#5 "0 nét" (1); audit chỉ chứng minh pose rest (1); worktree thiếu node_modules → tsc/test đỏ giả (2) |
| Infra flap | 5 | agy headless từ chối read_file/command (2); GitHub TLS timeout (1); git ref lock do fetch song song (1); background job quá 600s (1) |
| Lỗi chỉ lộ ra ở artifact cuối | 2 vòng | ảnh zoom: thanh đòn lơ lửng, 1 quả nặng (gate xanh); Argon: 6 lỗi thật (thứ tự vẽ khi nghiêng, tỉ lệ 2:1, pointer, ngưỡng) khi gate xanh |
| Vòng sửa Sonnet | 3 (1 thật, 1 theo review, 1 format) | review độc lập đến sau implement, không có checklist physics/order trong brief đầu |
| Câu hỏi owner | 7 vòng, 6 đổi kết quả | scope, budget 150→200, exploded, builder Grok→Claude, bỏ fix 19, merge mode |

Bucket cao nhất: false green (5) + infra (5) + worker hỏng (2).

## 2. Fix 19 figure còn loay hoay không? (FACT + INFERENCE)

- FACT: 59 đầu nét trôi / 19 figure (TB 3). Khoảng cách: 9 < 2px, 17 ở 2–5px, 29 > 5px, 4 không có gì gần.
- INFERENCE: đây là sửa nét trong figure hiện có (kéo nét tới cạnh, thêm dải thước, hoặc `free` cho kim/chữ in) — KHÔNG phải port sang kit như pilot. Không cần audit hình học/thứ tự vẽ.
- Các cái bẫy của pilot đã được gỡ: adapter đúng (crease + ISO_CSS), gate chạy ~19s/suite, memory "Grok không chạy Chrome".
- Còn 3 điểm sẽ gây loay hoay nếu không xử lý trước:
  1. Worktree mới thiếu `node_modules` và kernel `../.agents` → gate đỏ giả. Cần 1 bước setup cố định.
  2. Review Argon qua agy phải nhét code vào prompt (headless chặn tool) — chưa có công thức lưu.
  3. Gate line-ends không bắt "nhìn có đúng không" — vẫn cần ảnh trước/sau mỗi figure + soi 3×.
- Ước lượng: ~20–40 phút/suite với Sonnet; 4 suite có file rời nhau → chạy song song được.

## 3. Debate

| # | Đề xuất | Ủng hộ | Phản đối | Verdict | Đích |
|---|---|---|---|---|---|
| A | Script `scripts/setup-agent-worktree.sh`: symlink node_modules + export HAIRLINE_KERNEL theo git-common-dir | 3 lần đỏ giả/chặn build | thêm 1 file | Ask owner (đụng code) | project scripts |
| B | Kernel path resolve qua `git rev-parse --git-common-dir` thay `../.agents` | sửa tận gốc cho mọi worktree/CI | đụng 4 build script | Ask owner (gộp với A) | build scripts |
| C | Công thức review agy: code inline, `--mode plan`, không tool | 2 lần denied | — | Do | memory reference |
| D | Brief figure phải có checklist: tỉ lệ vật lý, thứ tự vẽ mọi pose, pointer, ảnh 3× | 6 lỗi chỉ Argon bắt | brief dài hơn | Do | hairline workflow §6 (1 dòng) |
| E | Agent `fullstack-developer` không có Skill tool → "load es-fable-thinking" trong brief vô hiệu | Sonnet báo không load được | — | Do | follow-up gap es:librarian |
| F | Gắn `audit:line-ends` vào `audit:all` sau khi 19 figure xanh | chặn tái phát | — | Do sau fix | package.json |

## 4. Thay đổi hành vi
- Gate xanh ≠ xong: luôn soi ảnh 3× + review độc lập trước khi báo xong (đã đúng ở vòng 2–3).
- Task cần Chrome: không giao worker sandbox tự kiểm; controller chạy gate browser.
- Grep/đo phân bố lỗi trước khi ước lượng (đã làm cho 19 figure).

## 5. Đã lưu ở đâu
- memory: `grok-sandbox-blocks-headless-chrome.md`, `agy-headless-review-inline-recipe.md` (C).
- docs/hairline-solid-workflow.md §6: dòng checklist (D).

## 6. Owner quyết
- A+B: chuẩn hoá setup worktree + kernel path trước khi fix 19 figure?
- Fix 19 figure: song song 4 suite (Sonnet ×4) hay tuần tự?

## Follow-ups
- E → es:librarian `record` gap (refs: báo cáo này).
- F sau khi 19 figure xanh.
