# DC-01 tutorial storyboard (draft, 2026-10-14)
Workflow: `docs/tutorial-video-workflow.md` · style v1 "Evidence Paper" · 16:9 first, then 9:16.
Evidence: `promo/dc-01-tutorial/data/evidence.json` (44 entries, extract-evidence.py) · scout: `plans/reports/dc01-tutorial-scout.md`.
Music: "Technology" by The_Mountain (Pixabay Content License, no Content ID badge, licence screenshot in `promo/dc-01-tutorial/audio/`).
Measured at 135.1 BPM, bar 1.7765 s, first downbeat 0.716 s. Intro bars 0–11, body bars 12–68 looped, outro 69–74.
Owner decisions: length ~6 min · Pixabay music, a loop is fine because the voice leads · reference photos missing, Claude searches (2026-10-14).

## Open owner gates
1. Approve this storyboard and the voice script below. Voice costs about 4,000 credits on eleven_v4, Quang Toan.
2. Reference photos: a hash search of 76,711 images on this Mac found none of the 5 registry files. Chapter 1 shows the registry and says so. Supply the photos later and they replace the registry card.

## Chapters (target ~5:40; bar counts are a draft and get widened to the voice per the workflow §5)
| # | Chapter | Bars | On screen (all evidence verbatim) | Voice (VI, read verbatim) |
|---|---|---|---|---|
| 0 | Title | 9 | hero: R03 assembled still · "DC-01 Desktop Companion, A → Z" | Xin chào, tôi là Jang. Đây là video thứ hai về repo DESIGN:OS 3D Blender. Lần này là DC-01, một robot để bàn có màn hình, nút bấm, pin và mạch điện. Video đi chi tiết hơn: hai mươi chín bản cơ khí, bốn lần chạy KiCad, và cả những chỗ chúng tôi đã sai. |
| 1 | Input | 14 | `reg_context`, the 5 SHA256 rows, `reg_disagree`, `state_generated` | Đầu vào là một tấm ảnh chụp và bốn tấm gen thêm: ba trăm sáu mươi độ, blueprint, exploded và catalog. Repo ghi mã hash của từng ảnh, nhưng chính file registry thừa nhận: các file đó chưa từng được chép về máy này. Một cái tên file không phải là bằng chứng. Các tấm gen còn mâu thuẫn nhau về số mảnh vỏ, số chân và dung lượng pin, nên danh sách chi tiết cơ khí thật mới là chuẩn. |
| 2 | Contract | 11 | `params` (lines 3–9), `params_duty` | Hợp đồng viết trước: vỏ tám mươi nhân sáu mươi tư nhân chín mươi tư mi-li-mét, tường danh định hai phẩy bốn, tối thiểu hai mi-li-mét, mục đích vừa render vừa in. Và ghi rõ: đây là kích thước đề xuất, không phải đo từ ảnh. Tải thiết kế ba trăm năm mươi gam, hai tay không có động cơ. |
| 3 | Blockout | 7 | 3 blockout heroes A01–A03 · `ok_blockout` terminal | Pass đầu tiên là blockout: mười hai mesh, thân cao chín mươi tư mi-li-mét, không có cạnh hở. Phải chạy ba lần thì khối mới đủ đúng để đi tiếp. |
| 4 | Mechanical ladder | 26 | wipe ladder M02 → M29 (same camera, wire → clay) with a gate tag per rung: `gate_M02`, `gate_M19` + `fit_M19`, `gate_M25/26/27` wall numbers, `gate_M28` + `fit_M28`, `gate_M29` + `fit_M29`, `freeze_M29` | Rồi đến cơ khí. Cùng một camera, đây là bậc thang từ M02 đến M29. M02 trượt cổng ngay: tường vỏ trên chỉ còn bốn mươi sáu phần nghìn mi-li-mét. M19 có tai, có tay, nhưng trượt cả hình dạng lẫn lắp ghép: vỏ dưới đâm vào trụ đỡ bên hai phẩy sáu mi-li-mét khối. Từ M25 đến M27, vỏ trên mỏng ở đúng một chỗ: không phẩy bảy chín, một phẩy sáu ba, một phẩy bảy chín, vẫn dưới mức hai mi-li-mét. Chúng tôi không hạ tiêu chuẩn tường, mà sửa hình. M28 qua cổng hình dạng, nhưng bu lông mạch sạc chạm vào linh kiện. M29: hình dạng đạt, lắp ghép đạt, một nghìn chín trăm sáu mươi sáu cặp, không một va chạm. |
| 5 | Sentinel trap | 8 | two terminals side by side: `ok_run_M19` vs `fail_fit_M19` | Có một cái bẫy đáng nhớ. Log chạy M19 kết thúc bằng agent OK, nhưng log kiểm tra lắp ghép của chính M19 là agent fail. Một bước chạy xong không có nghĩa là cổng đã qua. Phải đọc báo cáo của cổng. |
| 6 | Controls | 6 | `fail_controls_C01` → `ok_controls_C02` · R03 button still | Nút bấm cũng vậy: lần chạy đầu thất bại ở miếng giữ phía sau nút, lần hai mới qua, với bốn chi tiết in. |
| 7 | Electronics | 18 | ERC ladder a01→a04 terminal · PCB front/back previews · `el_faults`, `el_blocked` | Mạch điện làm bằng KiCad thật, phiên bản mười. Lần một, file schematic không mở được. Lần hai, tám mươi tư lỗi ERC. Lần ba, ERC sạch. Lần bốn, ERC không, DRC không, không đường nào chưa nối, không lệch giữa schematic và PCB. Năm lỗi được cố tình cài vào, và cả năm đều bị bắt. Nhưng chưa có mẫu thật nào, nên chế tạo và chạy bằng pin vẫn bị chặn. |
| 8 | Integration + harness | 18 | ladder I01 → I06 → H13 clay/wire · `i06_handoff` statuses · `ok_harness`, `ok_combined` · `lesson_h12` | Ghép cơ khí và mạch: bản I06 qua hình dạng cả mười tám chi tiết, qua lắp ghép trong phạm vi khai báo, và qua tháo lắp ở mức lấy mẫu. Dây nối là đường cong thật trong Blender: hai mươi sáu kết nối, năm mươi tư đường cong, hai trăm năm mươi hai vật cản. Có một lần cổng báo PASS sai: bộ lấy mẫu bỏ sót một phía của khớp nối, khoảng cách thật là hai phẩy chín chín sáu mi-li-mét, dưới mức ba. Một kiểm tra độc lập đã bắt được. |
| 9 | Print kit | 11 | `gate_P01` → `gate_P03` · PETG + TPU plate renders · `p03_plates`, `p03_noslicer` | Bộ kit in: lần đầu trượt ở khung mạch sạc và màng nút bấm. Lần ba, cả mười tám chi tiết qua cổng cuối: mười bảy chi tiết PETG và một màng TPU. Nhưng chưa có slicer, chưa có G-code, chưa in thật. |
| 10 | Presentation | 14 | R03 animatic frames (seq) · `lesson_film` · `lesson_metal` | Đến phim. Bản D05 qua mọi cổng số, nhưng bị chê không mượt: một trăm hai mươi tư thế, năm tư thế một giây, rồi nhân khung lên ba mươi. D06 render lại một nghìn một trăm bảy mươi khung, năm trăm tám mươi chín trạng thái khác nhau. Render bằng GPU nhanh gấp ba nhưng có vệt sọc quanh kính mặt, nên bị loại. |
| 11 | Delivery | 10 | review page scroll (desktop) + mobile capture · `completion`, `r03_blocked`, `readme_likeness` | Gói giao là một trang review chạy offline, sáu mươi lăm đường dẫn đều mở được. Trạng thái: demo số đã giao. Gia công: bị chặn. Mẫu vật lý: không có. Và độ giống ảnh gốc cũng chưa được chấp nhận. |
| 12 | Lessons | 12 | 4 lesson cards: sentinel, false PASS, `lesson_i05`, film states · `lesson_counts` | Bài học từ DC-01. Một: agent OK của một bước không phải là kết quả của cổng. Hai: cổng cũng có thể sai, nên cần kiểm tra độc lập. Ba: một bước dọn dẹp tuỳ chọn đã làm hỏng mesh mạch sạc, may mà có checkpoint. Bốn: phim phải đếm số trạng thái khác nhau, không chỉ số khung hình. |
| 13 | Outro | 6 | repo card + credit "Music: Technology by The_Mountain · Pixabay" | Toàn bộ DC-01 nằm trong repo DESIGN:OS 3D Blender, mã nguồn mở. Tôi là Jang, hẹn gặp lại ở bản build tiếp theo. |

Draft total: 180 bars ≈ 5:20, plus widening for the voice ≈ 5:40–6:00. Voice text ≈ 3,900 characters.

## Assets ready
- `assets/ladder/{M02,M03,M05,M17,M19,M25..M29,I01,I06,H13}/{wire,clay}/o000.jpg`: one look-at camera (`data/dc01-camera.json`), 1920x1080, all AGENT_OK.
- Copy at build time from the build:
  - R03 stills;
  - electronics previews;
  - P03 plates;
  - blockout heroes;
  - R03 browser captures;
  - animatic frames, extracted from `delivery/R03/dc01-native-animatic.mp4`.
