# Tutorial Video Workflow (style v1 · "Evidence Paper")
> Quy trình chuẩn dựng video hướng dẫn A → Z cho một build DESIGN:OS, rút từ bản CK-001
> (`promo/ck-001-tutorial/`, 2:57, 16:9 + 9:16, voice tiếng Việt). Style hiện tại là style duy nhất;
> style khác sẽ thêm vào §8 sau, không sửa các bước 1–7.

> **Công cụ.** Engine dùng chung nằm ở `promo/_tutorial-kit/` (render, mix, join shard, đồng hồ `seek(t)`, style v1); thủ tục, luật,
> `validate.mjs` và `look.mjs` nằm ở skill `skills/es-tutorial-video/` (`SKILL.md`, `rules.md`, `look.md`). Mỗi dự án
> (`promo/<slug>-tutorial/`) chỉ giữ dữ liệu của mình, cấu hình trong `tutorial.config.json`. Tạo dự án mới bằng
> `node skills/es-tutorial-video/build.mjs scaffold <thư-mục-build> <slug>`. Hai cổng owner (storyboard + script, rồi merge/publish)
> được build thực thi: `mix` và `render --full` từ chối chạy khi `approvals` trong config còn `null`.
> Host dùng plugin (Claude Code, Codex, Factory) đọc thẳng `skills/`. Host chỉ nhận thư mục skill: `node scripts/sync-tutorial-skill-hosts.mjs --host claude|codex|gemini|agents`
> sinh bản kèm kit; không sửa tay, `--check` báo lệch.

Nguyên tắc gốc: **video kể lại bằng chứng có thật, không minh hoạ.** Mỗi lệnh, mỗi dòng code, mỗi con số
trên màn hình phải đọc nguyên văn từ chính build (receipt, `state.md`, gate report). Không gõ tay, không
"làm cho đẹp", và có một chương nói thẳng về giới hạn.

---

## 1. Quy trình 7 bước và các cổng chờ owner

| # | Bước | Đầu ra | Cổng owner |
|---|---|---|---|
| 1 | Chốt khung | độ dài, khổ, ngôn ngữ, nhạc, có voice không | hỏi bằng AskUserQuestion |
| 2 | Storyboard | `plans/reports/<slug>-tutorial-storyboard.md`: chương, bar, bằng chứng từng chương | **duyệt trước khi dựng** |
| 3 | Gom bằng chứng | `data/evidence.js` (script trích), `assets/` (render cùng một camera) | – |
| 4 | Dựng trang `seek(t)` | timeline, beat sheet một khung mỗi bar | xem beat sheet |
| 5 | Voice | `voiceover/script-vi.json` → clip theo chương | **duyệt script, rồi A/B một câu** |
| 6 | Ghép và render | `out/tutorial-audio.wav` → MP4 60 fps | xem bản full |
| 7 | Bản dọc, commit | layout 9:16, MP4 thứ hai, commit và PR | duyệt trước khi merge |

Câu hỏi mặc định ở bước 1 (đề xuất ghi đầu tiên):
- **Độ dài:** bản dài khoảng 3:00 trước, bản ngắn sau.
- **Chữ:** song ngữ, tiếng Việt chính và tiếng Anh mono bên dưới.
- **Nội dung:** quy trình kèm bằng chứng thật, có chương giới hạn ngắn.
- **Khổ:** 16:9 trước, 9:16 sau.

## 2. Cấu trúc thư mục

Engine ở kit dùng chung `promo/_tutorial-kit/`; dự án chỉ giữ dữ liệu. Kit đọc dự án qua `--project <thư mục>`.

| File | Ở đâu | Vai trò |
|---|---|---|
| `motion-core.js`, `gh-mark.js`, `tutorial-scene.js`, `tutorial-elements.js`, `tutorial-portrait-layout.js`, `tutorial.css` | kit | spring, rail chương, caption, renderer (img, wipe, seq, grid, file, json, term, callout, scroll, hero, repo), layout dọc, token style v1 |
| `tutorial.template.html`, `tutorial-project.mjs` | kit | dựng trang từ config; nạp, kiểm config, chạy timeline trong vm |
| `render-tutorial.mjs`, `join-shards.mjs` | kit | Puppeteer: `--beats` / `--full` / `--shard i/n` (4 subframe, tmix, 60 fps), ghép shard |
| `voiceover/mix-voiceover.mjs`, `build-music-bed.py`, `capture-review-page.mjs` | kit | đặt clip theo chương và duck nhạc; lặp nhạc theo cụm 8 bar; chụp trang review |
| `tutorial.config.json` | dự án | slug, tiêu đề, T, lưới (`bpm`, `db0`, cách đo), nhạc, danh sách timeline, `approvals` |
| `extract-evidence.py`, `data/evidence.js` | dự án, **viết mới theo build** | trích excerpt nguyên văn |
| `tutorial-timeline*.js` | dự án, **viết mới theo build** | lưới bar, chương, phần tử, caption |
| `voiceover/script-vi.json`, `voiceover/clips*/` | dự án, **viết mới** | lời đọc từng chương và clip |

Đổi engine thì sửa kit, chạy `node scripts/build-tutorial-contract.mjs` và so từng khung beat với bản render cũ (khung nào khác phải giải thích được).

## 3. Bằng chứng (bước 3)

1. **Trích, không gõ.** Script đọc file nguồn theo đường dẫn và dòng, rồi ghi `{path, from, lines}`.
   - Dòng `AGENT_OK` lấy **sentinel cuối cùng** của file.
   - Script assert là không còn đường dẫn home (`/Users/...`).
2. **Lệnh trên terminal phải là lệnh đã chạy thật**, chép từ receipt. Có badge "chạy lại hôm nay: cùng kết quả"
   thì phải chạy lại thật ngay hôm đó.
3. **Một camera cho mọi giai đoạn.** Ghi camera ra `data/<slug>-camera.json` rồi render wire, clay, hifi của
   layout, geometry và presentation từ cùng góc đó (khoá `cam_json` trong đối số JSON của `render-orbit-passes.py`), để wipe chuyển
   giữa các giai đoạn không bị nhảy hình.
4. **Lịch sử build là tư liệu.** Bản r01 thiếu chi tiết, gate đầu FAIL, pass chưa từng chạy: giữ các run trung
   gian, đừng xoá khi dọn ổ đĩa. Chương "Bài học" sống nhờ chúng.
5. **Xoá metadata ảnh trước khi commit.** Blender ghi đường dẫn tuyệt đối của `.blend` vào ảnh render, nên
   chạy `mogrify -strip`, rồi `git grep --cached -l "/Users/"` phải trả về rỗng.

## 4. Thời gian theo nhạc (bước 4)

- **Đo lưới nhạc bằng numpy** (comb filter, pha downbeat), không đoán BPM.
  CK-001 dùng "Dawn": 119.99 BPM, bar = 2.000 s, downbeat đầu 1.559 s, `bar(n) = 1.559 + 2n`.
- **Ranh giới chương nằm trên downbeat.** Bar đầu mỗi chương là thẻ chương: số chương, tiêu đề lớn, ảnh xem trước.
- **Caption không chồng nhau.** Mỗi cửa sổ caption thoát ra trước khi cửa sổ sau vào.
- **Ẩn phần tử bằng `display:none` và hiện lại bằng `display=''`.** Không gán cứng `block`, vì nó đè mất `display:grid`.
- **Render chờ font:** `__framesReady` phải chờ `document.fonts.ready`. Glyph tiếng Việt tải lười, chụp sớm sẽ mất chữ.
- **Kiểm bằng beat sheet** (`node skills/es-tutorial-video/build.mjs render <dự án> --aspect <a> --beats`). Beat sheet chỉ lấy một khung mỗi bar,
  nên đoạn nào chuyển cảnh giữa hai bar thì phải chụp thêm khung ngay trong đoạn đó.

## 5. Voice (bước 5)

1. **Script mở đầu bằng người nói** ("Xin chào, tôi là Jang…") và nêu đây là video giới thiệu cách dùng repo.
   Mỗi chương một đoạn, đọc nguyên văn. Số đọc thành chữ ("hai trăm tám mươi tư"), đơn vị viết theo cách đọc ("mi-li-mét").
2. **Chọn model theo giọng, không theo độ mới.** Giọng clone (PVC) chỉ giữ đúng giọng trên các model nó được
   fine-tune. eleven_v3 làm giọng miền Nam PVC trôi sang giọng Bắc; eleven_v4 giữ đúng. Trước khi gen cả bài,
   A/B một câu trên 2–3 model và để owner chọn.
3. **Không retry khi gen lỗi**, vì mỗi lần gọi đều tính credit. Gen tất cả đoạn song song, gọi trạng thái một
   lần, rồi tải ngay (URL hết hạn sau 2 giờ). View trạng thái cắt prompt ở 200 ký tự, nên so khớp đoạn theo
   tiền tố sau chuẩn hoá NFC và kiểm độ dài bằng credit đã tính.
4. **Khung chương nới theo lời đọc.** Độ dài nhạc không đổi; chương nào thiếu chỗ thì mượn bar từ chương dư,
   qua bảng `WARP` trong timeline (story bar sang music bar, các mốc là số bar nguyên). Bar đã viết trong
   timeline giữ nguyên.

## 6. Ghép, render, kiểm (bước 6)

1. `node skills/es-tutorial-video/build.mjs mix <dự án>` (chạy `promo/_tutorial-kit/voiceover/mix-voiceover.mjs`) đọc thời điểm chương **từ chính timeline** (`vm`), nên tiếng và hình không lệch nhau được.
   - Đặt mỗi clip vào lúc chương mở + 0,5 s. Đoạn nào còn dư dưới 0,3 s so với cuối chương thì script báo lỗi.
   - Nhạc đi qua `sidechaincompress` với voice làm key, voice được `apad` tới hết bài, cuối cùng `loudnorm` về −16 LUFS, true peak −1,5 dBFS.
2. `node skills/es-tutorial-video/build.mjs render <dự án> --aspect landscape --full`: khoảng 30 phút cho 3 phút video. Hai khổ render song song được, vì mỗi khổ ghi qua pipe riêng.
   Nhanh hơn: chia shard (kit có `--shard i/n` và `join-shards.mjs`; `build.mjs render <dự án> --full --shards N` chạy cả hai). 6 shard (3 cho mỗi khổ) chạy song song mỗi shard vẫn
   ~24 subframe/s, nên 5:34 phim render xong cả 2 khổ trong ~19 phút thay vì ~55 phút. Mối ghép chỉ ghép (concat `-c copy`), không encode lại;
   kiểm khung ở đúng mỗi mối ghép. Script render phải tự thoát (`browser.close()` có hạn chờ rồi `process.exit`), vì Chrome headless có lúc treo khi đóng.
3. Kiểm trên file thật, đủ cả 4 mục mới gọi là xong:
   - `ffmpeg -v error -i <mp4> -f null -` không in ra gì;
   - độ dài hình và tiếng khớp nhau;
   - `ebur128` đo được −16 LUFS;
   - contact sheet có khung rơi vào từng loại phần tử (grid, quạt ảnh, terminal, outro).
4. Gửi owner MP4 cùng contact sheet. Owner nghe trước, rồi mới commit.

## 7. Bản 9:16 và commit (bước 7)

- **Layout dọc.** Thêm `?aspect=portrait`, `tutorial-portrait-layout.js` đổi mọi rect và key:
  - cột trái của bản ngang lên vùng trên `[48,150,984,720]`;
  - cột phải xuống vùng dưới `[48,900,984,680]`;
  - phần tử full-width vào giữa `[48,400,984,760]`.

  Chỗ nào cần dàn riêng thì ghi `p:` ngay trên phần tử trong timeline.
- **Chữ dọc to hơn** khoảng 15–20%. Caption nằm ở đáy (bottom 96), nội dung không được xuống quá y ≈ 1600.
- **Git:**
  - commit code, asset dùng trong video, clip voice và MP4 cuối;
  - `.gitignore` loại nhạc gốc và mọi bản mix có nhạc (license Free To Use cấm phân phối lại file nhạc), cùng take bỏ đi, khung nháp và log;
  - ghi credit nhạc trên màn hình và trong mô tả bài đăng.

## 8. Style

### v1 · Evidence Paper (mặc định)
- **Nền và mực:** nền giấy ấm `#e9e7e3`, mực `#111`. Chỉ đen, trắng, xám; không có màu nhấn.
- **Font:** Geist cho chữ, Geist Mono cho code và nhãn.
- **Card:** card trắng bo 24 px với bóng nhiều lớp. Terminal nền `#111`; dòng `AGENT_OK` sáng lên khi xuất hiện.
- **Chuyển động:** spring đóng (closed-form), wipe hairline giữa các giai đoạn build, Ken Burns nhẹ (4,5%) trên ảnh tĩnh.
- **Nhịp:** thẻ chương đúng một bar, rail 10 đoạn đầy dần theo tiến độ chương, caption song ngữ ở đáy.

### Style sau này
Thêm một mục `### v2 · <tên>` ở đây: token CSS, renderer mới, quy tắc nhịp. Các bước 1–7 không đổi; style chỉ thay `tutorial.css` và có thể thêm renderer.
