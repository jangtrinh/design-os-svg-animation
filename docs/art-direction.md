# DESIGN:OS Hairline Art Direction Specification
> Chuẩn mực nghệ thuật & Chỉ dẫn thị giác cho toàn bộ hệ thống Isometric Line Figures.
> Kế thừa từ 27 nguyên mẫu của Lucas Markes và hệ thống Art Direction của Jang Personal Site.

---

## 1. Tuyên ngôn Cốt lõi (The One Sentence)

**Mọi hình ảnh là một bản vẽ kỹ thuật axonometric 2:1 của một vật thể cơ khí/hệ thống vật lý thực thụ — nét mảnh hairline, đơn sắc tuyệt đối, dựng từ các khối rắn bo góc với đúng một điểm sáng dẫn dắt, tương tác mượt mà qua động lực học lò xo.**

Không bao giờ là ảnh chụp. Không bao giờ là 3D render đổ bóng tả thực (Phong/PBR). Không màu mè trang trí. Không chứa bất kỳ chữ viết hay ký tự nào bên trong bản vẽ.

---

## 2. Các Bất Biến Bắt Buộc (Universal Invariants)

| Thuộc tính | Giá trị quy chuẩn | Ý nghĩa & Ràng buộc |
|---|---|---|
| **Projection** | 2:1 Axonometric `Cam(az=45°, k=0.5, S)` | Không có điểm tụ phối cảnh (zero perspective distortion). Tỷ lệ trục $X:Y$ hoàn hảo 2:1. |
| **Line Weight** | Uniform Hairline (1.1px–1.4px) | Một độ dày nét duy nhất cho toàn bộ hình thể; phân cấp chỉ qua độ tương phản (`opacity/stroke`). |
| **Palette** | Monochrome Greyscale (Zero Chroma) | **Dark**: Nền `#0c0c0e`, nét mờ `#ffffff26`, nét chính `#ffffff80`, điểm nhấn `#ffffff`.<br>**Light**: Nền `#ffffff`, nét mờ `#0000001f`, nét chính `#00000080`, điểm nhấn `#111111`. |
| **Stroke Hierarchy** | 4 cấp nét chuẩn: `sil`, `lo`, `dash`, `hi` | • `sil`: Viền bao khối đặc.<br>• `lo`: Vết gấp bề mặt (`crease`) hoặc trục trong.<br>• `dash`: Bước ren, vân nhám ca-rô, trục toạ độ.<br>• `hi`: **Điểm nhấn độc bản duy nhất**. |
| **Radius Discipline** | Bo góc toàn bộ ($r \ge 1.5$ units) | **Tuyệt đối không vẽ cạnh đứng dọc của khối hộp hay hình trụ**. Khối đặc là hull của 2 vành bo góc: 1 viền ngoài `sil` và 1 vết gấp chìm `crease`. |
| **Typography** | CẤM TUYỆT ĐỐI bên trong SVG | Mọi tên gọi, chỉ số, đơn vị đo BẮT BUỘC nằm ngoài SVG trên phần tử DOM `read.textContent`. Bản vẽ chỉ truyền tải danh tính bằng hình học thuần túy. |
| **People / Slop** | CẤM | Không hình người, không bóng đổ nhòe mờ, không gradient màu mè. |

---

## 3. Phân tầng Thiết kế (Two Tiers)

Học hỏi trực tiếp từ kiến trúc Art Direction của Jang Personal Site:

### Tier 1: `diagram` (Vật thể Cơ khí / Thiết bị Đơn lẻ)
- **Đối tượng**: Các máy móc, công cụ, đồ gá hoặc linh kiện cơ khí khép kín (`vise`, `padlock`, `vault`, `turntable`, `loupe`, `plug`).
- **Ngôn ngữ**: Một khối đế plinth bo góc nâng đỡ một cơ cấu truyền động chính. Chuyển động tập trung vào sự trượt, quay, ăn khớp bánh răng hoặc co giãn ren vít.
- **Mục tiêu**: Làm nổi bật tính chính xác cơ khí, khe hở dung sai lắp ghép và cảm giác xúc giác (tactile feedback).

### Tier 2: `system` (Hệ thống Xếp tầng / Cụm Phân rã Đa tầng)
- **Đối tượng**: Thiết bị điện tử, kiến trúc phần cứng, dữ liệu hoặc bảng giao diện phân lớp (`phone`, `cabinet`, `terminal`, `branches`, `patch`, `exploded`).
- **Ngôn ngữ**: Các tấm phẳng hoặc bo mạch song song xếp chồng theo phương thẳng đứng với cọc giằng định vị (`standoff posts`), đường bus dẫn hướng (`routed bus lines`), và các khay linh kiện dạng module trượt ra.
- **Mục tiêu**: Trực quan hóa cấu trúc kiến trúc bên trong, thứ tự lớp dữ liệu và mối quan hệ hệ thống.

---

## 4. Bảng Phân loại 6 Archetype Động học (Từ 27 Figures của Lucas)

Mọi figure mới khi khởi tạo BẮT BUỘC phải quy về 1 trong 6 archetype mẫu mực dưới đây:

| Archetype | Bản mẫu Lucas tiêu biểu | Bản chất Động học | Điểm nhấn lúc Nghỉ (`Rest`) $\rightarrow$ Tương tác (`Active`) |
|---|---|---|---|
| **1. The Exploded Stack** | `phone`, `exploded`, `sieve` | Các lớp tách rời theo trục $Z$ khi chuột rê theo trục $X$; trục $Y$ chọn lớp. | Lớp bo mạch ở giữa nhấc nhẹ (`hi`) $\rightarrow$ chuyển sang lớp được chọn. |
| **2. The Discrete Array** | `riffle`, `keyboard`, `drawer`, `lockers`, `cabinet` | Mảng linh kiện lặp lại; chuyển động độc lập trên đường cong 700ms cubic-bezier. | Một phần tử trung tâm hơi nhô ra (`hi`) $\rightarrow$ chuyển sang phần tử dưới con trỏ. |
| **3. The Kinematic Linkage** | `padlock`, `elevator`, `basket`, `vise` | Khớp nối cơ học, vít me, chốt then, puly dây cáp chuyển động theo lò xo $k=100, c=18$. | Điểm tựa cố định hoặc chốt khoá (`hi`) $\rightarrow$ chuyển sang tay quay / má trượt. |
| **4. The Wave / Surface** | `terrain`, `plot` | Trường bề mặt biến dạng liên tục theo hàm khoảng cách Gaussian falloff từ con trỏ. | Đỉnh nhô cao nhất của cồn cát mang cụm chấm `dot` (`hi`) $\rightarrow$ di chuyển theo chuột. |
| **5. The Angular Dial** | `dish`, `turntable`, `vault`, `query` | Mâm quay, đĩa số, trục xoay gimbal có quán tính ma sát và nấc dừng (`detents`). | Vạch khắc chỉ số tại góc dừng chuẩn (`hi`) $\rightarrow$ chuyển sang vành quay. |
| **6. The Instrument** | `loupe`, `phosphor`, `terminal`, `router` | Thấu kính phóng đại, đèn hiển thị phosphor, cửa sổ cuộn dòng lịch sử. | Mép vành kính hoặc đèn trạm router cuối (`hi`) $\rightarrow$ chuyển sang điểm trỏ. |

---

## 5. Quy tắc Điểm nhấn & Trạng thái (Rest vs Active Contract)

Mỗi figure là một **cặp trạng thái hoàn chỉnh**:

1. **Trạng thái Nghỉ (Designed Rest Pose - Rule 05)**:
   - Trạng thái nghỉ KHÔNG PHẢI là "chưa vẽ gì" hay "nằm phẳng lỳ". Nghỉ là một khung hình bố cục hoàn hảo (như một bức tranh tĩnh vật thu nhỏ): cửa tủ hé mở, thẻ bài nghiêng $12^\circ$, ê-tô mở $18\text{mm}$, đĩa số dừng ở góc $30^\circ$.
   - **Luôn có đúng 1 điểm sáng `hi` dẫn dắt thị giác** để người xem biết mắt cần nhìn vào đâu đầu tiên.
2. **Trạng thái Tương tác (Active Interactive Pose - Rule 04)**:
   - Điểm sáng ở trạng thái nghỉ BẮT BUỘC nhường lại cho bộ phận đang được tương tác.
   - Toàn bộ khung cảnh chỉ có **DUY NHẤT 1 ĐỐI TƯỢNG SÁNG TẠI MỘT THỜI ĐIỂM**. Điểm sáng mang ý nghĩa thông tin (Semantic), tuyệt đối không dùng để trang trí rải rác.

---

## 6. Tiêu chuẩn Kiểm định Đóng gói (Anti-Flop Gate Criteria)

Một figure chỉ được nghiệm thu khi vượt qua 6 cổng kiểm tra:

1. **Gate 1 - Silhouette Readability**: Bản vẽ phải đọc rõ hình thể ở kích thước thumbnail **240px wide**.
2. **Gate 2 - Zero Wireframe Glitches**: Mọi trục ống, khối trụ phải dùng khối rắn `tube`/`box` có fill đục để che khuất các nét phía sau; không để lọt nét thừa xuyên qua thân kim loại.
3. **Gate 3 - Clearance Reserved**: Bắt buộc kiểm tra biên cực hạn; bảo lưu tối thiểu $8\text{ units}$ trước chướng ngại vật cố định; không có va chạm đâm xuyên mô hình.
4. **Gate 4 - Single Clock Coupling**: Mọi chuyển động phụ thuộc phải giải tích từ 1 Master State; tay quay, bước ren và má trượt phải đồng bộ cơ học tuyệt đối.
5. **Gate 5 - Zero Idle Cost**: Khi con trỏ đứng yên hoặc rời sân khấu, số lần cập nhật DOM SVG trong hàm `draw()` phải bằng **0**.
6. **Gate 6 - Source Budget**: Toàn bộ mã nguồn hoàn chỉnh không vượt quá **150 dòng** (ngưỡng trần cơ học: 200 dòng).
