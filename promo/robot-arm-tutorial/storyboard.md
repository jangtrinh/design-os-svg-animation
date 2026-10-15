# Robot arm tutorial storyboard (draft for owner gate 1, 2026-10-15)
- **Rules:** pedagogy v2 (owner, 2026-10-15) per `plans/261015-tutorial-pedagogy-upgrade/plan.md`.
- **Format:**
  - On screen: one keyword line at a time.
  - Subtitles: exact VI and EN transcripts as .srt/.vtt sidecars.
  - Viewer: a curious newcomer. Glossary up front; every term defined at first use.
  - Three predict beats with 4 s of silence each (music muted); a blank-then-reveal recap per act.
  - Length: ~6:45, 3 acts, chapters of 15–35 s.
- **Evidence:** `plans/reports/robot-arm-tutorial-scout.md`. Every number below was re-checked by the controller against the build files on 2026-10-15.
  - PR = `builds/robot-arm-print-assembly`
  - OR = `builds/robot-arm-original-refined`
- **Music:** the same Pixabay track as DC-01 ("Technology", The_Mountain), looped. Owner may swap it.
- **Voice:** ElevenLabs Quang Toan, eleven_v4, one clip per sentence.

## Glossary (chapter 1, 6 terms)
| Term | On screen (VI) | One-line definition (voice) |
|---|---|---|
| Servo | servo | động cơ nhỏ quay tới đúng một góc được ra lệnh |
| Khớp | khớp · joint | chỗ hai phần của cánh tay xoay quanh nhau; cánh tay này có 6 đường servo |
| Va chạm | va chạm · clash | hai chi tiết chiếm cùng một chỗ trong không gian, đo bằng mi-li-mét khối |
| Cổng kiểm | cổng · gate | một script tự động trả lời PASS hoặc FAIL cho một điều kiện đo được |
| Bàn in | bàn in · plate | các chi tiết xếp lên mặt bàn máy in 3D để in một lượt |
| Khung hình | khung · frame | một tấm ảnh của phim; phim này chạy 24 khung mỗi giây |

## Act 1: from the reference video to a print kit (~2:30)
| # | Chapter | s | On screen (evidence, verbatim) | Voice (VI, by sentence) |
|---|---|---|---|---|
| 0 | Title | 12 | hero: PR assembly still | Xin chào, tôi là Jang. Đây là video thứ ba về repo DESIGN:OS 3D Blender. Lần này là một cánh tay robot sáu servo, in 3D được. |
| 1 | Glossary | 20 | glossary strip, 6 terms | Trước khi bắt đầu, sáu từ sẽ gặp lại nhiều lần. *(then one short line per term, as in the glossary table)* |
| 2 | Input | 25 | PR film frames · OR `plan.md` L3, L15 | Đầu vào lần này không phải ảnh, mà là một video lắp ráp dài năm mươi tám giây. Tôi chọn nó làm bản gốc, và chỉ sửa một điều: bỏ hộp nguồn màu đen nằm riêng. |
| 3 | Contract | 25 | PR README L5, L27, L29, L53 | Ba mươi tám chi tiết, trên năm bàn in: ba mươi hai bằng PETG, sáu bằng TPU dẻo. Bàn in hai trăm hai mươi mi-li-mét. Và một yêu cầu không được hạ: cánh tay phải nâng hai trăm năm mươi gam trong nhiều phút. |
| 4 | Print kit | 30 | plates-final still · export-check | Mỗi chi tiết được xoay sang hướng in ít phải chống đỡ nhất, rồi xếp lên bàn như xếp gạch, cách nhau tám mi-li-mét. Cổng kiểm chạy tám trăm ba mươi sáu bước và không bước nào thất bại. |
| R1 | Recap act 1 | 15 | recap: 3 blanks, then reveal | Thử nhớ lại: đầu vào là gì, bao nhiêu chi tiết, và yêu cầu nào không được hạ? *(4 s silence, then the answers)* |

## Act 2: motion without collisions (~3:00)
| # | Chapter | s | On screen | Voice |
|---|---|---|---|---|
| 5 | Motion | 25 | saved-candidate-check: 402 meshes, 252 units, 121 events | Phim lắp ráp có hai trăm năm mươi hai cụm chi tiết và một trăm hai mươi mốt bước. Các chi tiết gắn cùng một khớp được nhóm lại, để chúng di chuyển như một khối. |
| 6 | Bug 1 + **PREDICT 1** | 35 | independent-review L35 · servo-motion-repair: 37 frames | Bản đầu có lỗi: đầu ra của khớp vai và khuỷu tới đích lệch tới một trăm mười mi-li-mét. **Đoán xem: phải dựng lại mô hình, hay chỉ sửa đường chuyển động?** *(4 s)* Chỉ sửa đường chuyển động, trên ba mươi bảy khung hình. Mô hình giữ nguyên. |
| 7 | Bug 2 | 30 | OR plan L21-23 · overlap-before frame 588 | Lần sau, chính tôi xem bản nháp và thấy hai chi tiết chồng lên nhau ở giây hai mươi tư. Kiểm tra từng khung xác nhận: khung năm trăm tám mươi tám, hai mặt đâm vào nhau. Bản render đang chạy bị dừng, và những khung đã render bị bỏ. |
| 8 | Bug 3 + **PREDICT 2** | 35 | OR plan L31 · lift-traverse-lower diagram | Sửa xong chỗ chờ, chi tiết được cho bay thẳng tới đích. **Đoán xem: đường thẳng có an toàn không?** *(4 s)* Không. Nó cắt ngang vỏ servo thật. Cách sửa: nhấc lên một trăm hai mươi mi-li-mét, đi ngang, rồi hạ thẳng xuống. |
| 9 | Checks | 25 | clearance-acceptance · overlap-repair-check 3031 frames | Rồi kiểm lại toàn bộ ba nghìn không trăm ba mươi mốt khung: không còn va chạm nào với vỏ servo thật. |
| 10 | Bug 4 | 20 | OR plan L33 · hero-prefix-reuse | Lỗi cuối nhỏ hơn: đầu ngón tay bị cắt khỏi khung hình. Mở rộng khung tám phần trăm, giữ lại hai nghìn chín trăm ba mươi mốt khung cũ, chỉ render lại tám mươi chín khung. |
| R2 | Recap act 2 | 15 | recap | Thử nhớ lại: vì sao đi thẳng không được, và cách nào an toàn? *(4 s, then the answers)* |

## Act 3: honest delivery (~1:15)
| # | Chapter | s | On screen | Voice |
|---|---|---|---|---|
| 11 | Film | 25 | OR film clip · media-check: 3020 frames, 24 fps | Phim cuối dài hai phút sáu giây, ba nghìn không trăm hai mươi khung, giải mã trọn vẹn không lỗi. |
| 12 | Limits + **PREDICT 3** | 35 | gate-spec L4 "M3 mounting bracket (gate example / positive fixture)" · delivery-check L9 | Cổng kiểm báo tám trăm ba mươi sáu bước đều qua. **Đoán xem: vậy đã in và dùng được chưa?** *(4 s)* Chưa. Cổng đó chạy với một spec mẫu, chưa phải spec của cánh tay, nên chưa kiểm độ dày tường. Tải hai trăm năm mươi gam chưa thử thật. Gia công vẫn bị chặn. |
| R3 | Recap + lessons | 20 | recap: 3 lessons blanked | Ba điều đáng nhớ. Một, sửa đúng chỗ hỏng: đường chuyển động, không phải mô hình. Hai, đường thẳng không an toàn: nhấc, đi ngang, hạ. Ba, PASS chỉ có nghĩa trong phạm vi spec mà nó kiểm. |
| 13 | Outro | 10 | repo card | Toàn bộ cánh tay này nằm trong repo DESIGN:OS 3D Blender, mã nguồn mở. Tôi là Jang, hẹn gặp lại. |

Total ≈ 6:40 (chapters 5:03, plus 12 s of predict holds and the chapter cards).

## Assets to render (gate 1 does not need them)
- **Ladder:** from one look-at camera, render PR `reports/assembly-before-servo-repair.blend` (c3861ff, FAIL), then PR `arm-step-assembly-corrected.blend` (20e27bc), then OR `arm-original-refined.blend` (06e248). The intermediate OR revisions (522afd, 11d88f, e9323) are not on disk.
- **Bug diagrams:** frame 588 from the failed scene if it renders, otherwise `renders/overlap-motion-check.png`. Draw the lift–traverse–lower path in the kit, on top of an OR still.
- **Film clips:** PR 58.5 s film (input); OR 125.8 s film (act 3).

## Open for the owner (gate 1)
1. Is the script OK? Voice is ~3,000 characters.
2. Does "chính tôi xem bản nháp" (ch. 7) fit? The owner reported the overlap.
3. Should the stale-provenance caveat (render-identity cites c3861ff) appear on screen, or stay in the report only?
