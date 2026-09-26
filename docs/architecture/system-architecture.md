# Design OS — Universal Multi-Platform AI Video Production & Marketing Engine

**Xây dựng một chương trình video có thể biên dịch thành nhiều bố cục, phát tương tác và xuất video từ cùng một mô hình thời gian xác định.**

Tài liệu này đề xuất kiến trúc mở rộng từ năng lực hiện tại bạn mô tả. Các đường dẫn, API và CLI mới bên dưới là **thiết kế mục tiêu**, chưa phải kết quả kiểm tra repository. Ba showcase hiện có đóng vai trò bộ kiểm thử hồi quy và nguồn trích xuất primitive.

Quyết định nền tảng:

> **AI soạn nội dung, cấu trúc cảnh và ý đồ chuyển động. Compiler giải quyết hình học, thời gian, bố cục và ràng buộc. Renderer chỉ đánh giá trạng thái tại một frame cụ thể.**

---

# 1. Kiến trúc phân tầng

## 1.1. Luồng dữ liệu tổng thể

```text
Video Brief + Brand Kit + Verified Product Claims
                       │
                       ▼
         Storyboard / Authoring Timeline
                       │
                       ▼
              Unified Motion IR v2
                       │
            Validate + Resolve Assets
                       │
                       ▼
         Layout Compiler per Aspect Ratio
                       │
                       ▼
      Choreography + Binding + Track Compiler
                       │
                       ▼
           Immutable Render Plan per Target
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
     Studio Preview         Headless Renderer
     RAF schedules          Integer frame loop
     frame evaluation       frame evaluation
            │                     │
            └──────────┬──────────┘
                       ▼
            Shared Frame Evaluator
                       │
                       ▼
       DOM / SVG / Canvas / Three.js Adapters
                       │
                       ▼
       Frame Capture → FFmpeg → Quality Gates
                       │
                       ▼
       MP4 + Captions + Contact Sheet + Report
```

Một authoring timeline có thể tạo nhiều render plan. Mỗi render plan thuộc về **một target xuất cụ thể**, với bố cục và timing đã được giải quyết.

Không để renderer tự chọn layout, tự tải font hay tự phân tích audio trong lúc xuất frame.

## 1.2. Năm hợp đồng xuyên suốt hệ thống

| Hợp đồng | Nội dung bắt buộc |
|---|---|
| `VideoProject` | Brief, loại video, ngôn ngữ, brand, nguồn claim, asset, các target |
| `MotionIR` | Scene, primitive, nội dung, layout intent, beat, track và binding |
| `RenderPlan` | Kích thước, FPS, frame count, layout, track và asset đã resolve |
| `FrameState` | Toàn bộ trạng thái có thể quan sát tại frame `n` |
| `RenderManifest` | Hash đầu vào, toolchain, kết quả gate và artifact đầu ra |

`RenderPlan` là artifact bất biến. Mọi thay đổi nội dung, asset, font, layout hoặc timing đều tạo fingerprint mới.

---

## Tầng 1 — Core Virtual Clock Runtime & Frame Quantizer

### Trách nhiệm

Tầng này định nghĩa thời gian duy nhất cho toàn bộ video:

- Scene xuất hiện ở frame nào.
- Camera và cursor ở đâu.
- Text, caption và ripple đang ở trạng thái nào.
- Shader, globe và audio-reactive effect nhận giá trị gì.
- Frame nào cần chụp tiếp theo.

### A. Integer frame là nguồn chân lý

Không dùng timestamp của `requestAnimationFrame` làm thời gian nội dung trực tiếp.

```ts
type FrameRate = {
  numerator: number;
  denominator: number;
};

type FrameContext = {
  frameIndex: number;
  fps: FrameRate;
  timeSeconds: number;
};
```

Với frame `n`:

```text
time(n) = n × fps.denominator / fps.numerator
```

Ở 60 fps:

```text
Frame 0  → 0.000000 s
Frame 1  → 0.016667 s
Frame 59 → 0.983333 s
```

**“Frame 1” trong ngôn ngữ biên tập tương ứng `frameIndex = 0` trong runtime.**

Một clip có `N` frame sẽ render:

```text
0, 1, 2, ..., N − 1
```

Khoảng thời gian video là:

```text
[0, N / fps)
```

Không xuất thêm frame ở đúng thời điểm kết thúc; tránh clip dài hơn một frame hoặc lặp frame cuối.

### B. Tách scheduler khỏi evaluator

```ts
evaluateFrame(plan, frameIndex): FrameState
applyFrameState(state): Promise<void>
```

`evaluateFrame()` không phụ thuộc:

```text
Date.now()
performance.now()
thứ tự seek trước đó
số lần RAF đã chạy
tốc độ máy
thời gian tải network
```

Hai chế độ sử dụng cùng evaluator:

| Chế độ | Ai chọn frame? | Được bỏ qua frame? |
|---|---|---|
| Studio playback | RAF scheduler dựa trên playhead | Có, để preview theo kịp thời gian |
| Headless export | Vòng lặp integer `0 → N−1` | Không |

`RAF` chỉ quyết định **khi nào cần vẽ**. `FrameContext` quyết định **vẽ trạng thái gì**.

### C. API tương thích và API nội bộ

Giữ API hiện tại:

```ts
window.__seekToTime(seconds)
```

Bổ sung hợp đồng chính xác hơn:

```ts
window.__motionRuntime = {
  ready,
  seekToFrame,
  getFrameReceipt,
  getManifest,
};
```

Đề xuất:

```ts
type FrameReceipt = {
  requestedFrame: number;
  appliedFrame: number;
  renderPlanHash: string;
  pendingAssets: number;
};
```

`seekToFrame(n)` chỉ hoàn tất khi:

1. Trạng thái frame đã được đánh giá.
2. DOM/SVG/style và camera đã được cập nhật.
3. Canvas/WebGL đã render frame tương ứng.
4. Adapter không còn công việc bất đồng bộ ảnh hưởng frame đó.

Renderer sau đó chụp ảnh bằng giao thức screenshot của browser. Không dùng `sleep(100)` làm bằng chứng frame đã sẵn sàng.

`__seekToTime(t)` chuyển sang frame bằng quy tắc quantize công khai, chẳng hạn nearest-frame với tie-break cố định, rồi gọi `seekToFrame()`.

### D. Chuyển động phải có khả năng random access

Sai:

```ts
position += velocity * deltaTime;
energy = energy * 0.9 + currentPeak * 0.1;
```

Kết quả phụ thuộc lịch sử playback.

Đúng:

```ts
position = evaluateTrajectory(frameIndex);
energy = audioEnvelope[frameIndex];
```

Spring dùng nghiệm giải tích hoặc lookup table được biên dịch trước. Particle dùng seed cố định và trạng thái tính trực tiếp theo tuổi particle; nếu cần simulation, bake thành cache có hash.

### E. Phạm vi determinism

Phải phân biệt:

| Mức | Cam kết |
|---|---|
| Timeline determinism | Cùng plan + frame → cùng giá trị track |
| Layout determinism | Cùng font, asset, target và toolchain → cùng hình học |
| Raster reproducibility | Kiểm chứng trong môi trường browser/GPU được khóa |
| Encoded output reproducibility | Cần khóa thêm encoder, flags và metadata |

Không cam kết pixel giống tuyệt đối giữa macOS, Linux, GPU driver khác nhau chỉ vì clock đã deterministic.

**Acceptance quan trọng:** seek đến cùng frame theo các thứ tự khác nhau phải cho cùng state; kiểm tra ảnh trong môi trường render chuẩn phải nằm trong sai số được công bố.

---

## Tầng 2 — Unified Motion IR v2 Schema & Compiler

### Trách nhiệm

IR là ranh giới giữa ý đồ sáng tạo và thực thi an toàn.

Nên có hai biểu diễn riêng:

```text
Authoring IR
  giàu ngữ nghĩa, dễ sửa
        ↓ compile
Normalized Render Plan
  cụ thể, bất biến, dễ đánh giá
```

Không ép người viết storyboard phải author hàng nghìn keyframe. Không bắt renderer diễn giải những chỉ dẫn như “reveal bùng nổ”.

### A. Authoring IR

Authoring IR mô tả:

```text
“Hiện kết quả ngay đầu video”
“Zoom vào panel kết quả trước click”
“Nhấn từ khóa khi voice đọc đến”
“Reveal logo tại transient được chọn”
```

Thông qua primitive, beat và timing anchor có schema.

```json
{
  "schemaVersion": "2.0",
  "projectId": "product-launch",
  "seed": 2718,
  "timeline": {
    "fps": {
      "numerator": 60,
      "denominator": 1
    },
    "durationFrames": 1800
  },
  "targets": [
    {
      "id": "vertical",
      "width": 1080,
      "height": 1920,
      "layoutProfile": "social-vertical"
    },
    {
      "id": "wide",
      "width": 1920,
      "height": 1080,
      "layoutProfile": "presentation-wide"
    }
  ],
  "scenes": [
    {
      "id": "result-hook",
      "startFrame": 0,
      "durationFrames": 180,
      "nodes": [
        {
          "id": "headline",
          "primitive": "KineticText",
          "props": {
            "text": "Từ ý tưởng đến giao diện chạy được"
          },
          "layout": {
            "role": "primary-message",
            "anchor": "content-safe-top"
          }
        }
      ],
      "beats": [
        {
          "id": "headline-emphasis",
          "type": "keyword-pop",
          "target": "headline",
          "startFrame": 12,
          "durationFrames": 24
        }
      ]
    }
  ]
}
```

Ví dụ trên minh họa cấu trúc; registry primitive và schema props tương ứng cần được định nghĩa đầy đủ khi triển khai.

### B. Normalized tracks

Compiler chuyển beat thành track cụ thể:

```ts
type NormalizedTrack = {
  nodeId: string;
  property: AnimatableProperty;
  segments: TrackSegment[];
};
```

Một segment chứa:

```text
startFrame
endFrameExclusive
from
to
interpolation
easing hoặc spring coefficients
```

Các đoạn timeline dùng quy ước thống nhất:

```text
[startFrame, endFrameExclusive)
```

Quy tắc bắt buộc:

- Một property chỉ có một writer tại một frame.
- Track overlap bị từ chối nếu chưa khai báo phép composition.
- Frame ngoài đoạn track có quy tắc hold/default rõ ràng.
- Giá trị đều hữu hạn; từ chối `NaN`, `Infinity`.
- Transform order được khóa, không phụ thuộc thứ tự khai báo CSS.

### C. Parameter bindings

Binding nối dữ liệu thời gian với tham số hiển thị:

```json
{
  "target": {
    "nodeId": "hero-glow",
    "parameter": "--audio-energy"
  },
  "source": {
    "kind": "audio-envelope",
    "assetId": "music-envelope",
    "channel": "rms"
  },
  "operators": [
    {
      "type": "clamp",
      "min": 0,
      "max": 1
    },
    {
      "type": "remap",
      "input": [0, 1],
      "output": [0.15, 0.85]
    }
  ]
}
```

Các nguồn chuẩn:

| Nguồn | Ví dụ sử dụng |
|---|---|
| Scene progress | `--progress`, reveal, diagram growth |
| Audio envelope | `--audio-energy`, glow, scale nhẹ |
| Word interval | Active word, karaoke highlight |
| Beat event | Trigger reveal, cut, accent |
| Semantic state | Selected tab, completed step, highlighted diff |

`--progress` cần định nghĩa rõ. Ví dụ với scene có `D` frame:

```text
progress = localFrame / max(1, D − 1)
```

Nhờ đó frame hiển thị cuối cùng của scene đạt `1`.

Không cho phép expression JavaScript tùy ý. Binding sử dụng DSL giới hạn với các phép như:

```text
clamp, remap, add, multiply, smoothstep
```

Binding có trạng thái như attack/release phải được bake trước hoặc có cách đánh giá random access đã xác định.

### D. Compiler passes

| Pass | Kết quả |
|---|---|
| Schema + semantic validation | Đúng kiểu, đúng reference, không cycle, không property conflict |
| Asset + text resolution | Font, ảnh, SVG, glyph và kích thước nội dung đã biết |
| Aspect layout resolution | Layout cụ thể cho từng target |
| Choreography + binding compilation | Camera, pointer, audio và beat thành track xác định |
| Static analysis + plan emission | Báo lỗi, manifest, normalized plan có hash |

Compiler cần phân biệt:

```text
ERROR   → không render production
WARNING → cần quyết định hoặc waiver có lý do
INFO    → dữ liệu chẩn đoán
```

Ví dụ:

```text
ERROR: cursor click target lies outside visible crop
ERROR: caption intersects forbidden overlay region
ERROR: camera and pointer movement overlap
WARNING: source screenshot undersamples the maximum zoom
WARNING: no meaningful visual change across a long interval
```

### E. Ranh giới bảo mật

IR không chứa:

- JavaScript, HTML hoặc shader tùy ý.
- Shell command hay FFmpeg argument do AI tự chèn.
- URL mạng không được resolve qua asset pipeline.
- CSS selector có thể tác động Studio UI.
- SVG chưa sanitize, external reference hoặc event handler.

Custom renderer/shader là extension **được tin cậy trong codebase**, không phải nội dung thực thi nhúng vào IR.

Validator schema chưa đủ để bảo đảm an toàn. Cần semantic validation, sanitizer, path confinement và giới hạn tài nguyên: số node, độ phức tạp SVG, số frame, độ phân giải, kích thước asset.

---

## Tầng 3 — Scene Graph & Multi-Aspect Viewport Engine

### Trách nhiệm

Tạo các composition thực sự phù hợp 16:9, 9:16 và 1:1.

**Không lấy bản 16:9 rồi thu nhỏ vào canvas dọc. Không letterbox để che việc thiếu layout.**

### A. Scene graph ngữ nghĩa

Mỗi node có vai trò bên cạnh tọa độ:

```ts
type LayoutRole =
  | "primary-message"
  | "product-surface"
  | "supporting-proof"
  | "caption"
  | "callout"
  | "brand"
  | "primary-cta";
```

Mỗi node khai báo:

```text
intrinsic size
anchor
min/max size
priority
safe-region policy
layout variant
crop policy
visibility policy
```

Một frame sản phẩm có thể dùng:

| Aspect | Composition |
|---|---|
| 16:9 | Headline bên trái, app bên phải |
| 9:16 | Headline trên, crop panel trọng tâm ở giữa, caption dưới |
| 1:1 | Headline gọn phía trên, app chiếm tâm, CTA cuối |

Đây là **recomposition**, không phải scale đồng loạt.

### B. Các không gian tọa độ

Phải phân biệt tối thiểu:

```text
Asset pixel space
Node local space
Scene layout space
Camera-transformed viewport space
Encoded output pixel space
```

Một điểm hotspot đi qua chuỗi transform:

```text
p_output =
  M_output
  × M_viewport
  × M_camera
  × M_node
  × M_asset
  × p_asset
```

Mọi cursor target, callout connector, zoom region và click ripple đều sử dụng chuỗi transform chung này.

Không tính cursor theo một hệ tọa độ còn crop ảnh theo hệ khác.

### C. Semantic hotspots

Hotspot nên được gắn với node và tên chức năng:

```json
{
  "id": "generate-button",
  "nodeId": "app-screenshot",
  "coordinateSpace": "normalized-asset",
  "point": [0.82, 0.74]
}
```

Khi đổi crop hoặc aspect, compiler tự giải vị trí mới.

Nếu target không còn nhìn thấy:

1. Chuyển sang crop chứa target.
2. Dùng screenshot/panel variant tương ứng.
3. Báo lỗi nếu không có phương án hợp lệ.

Không tự “đẩy” click vào vùng nhìn thấy nhưng sai nút.

### D. Chiến lược layout

Ưu tiên hệ constraint đơn giản, có thứ tự:

```text
1. Chọn layout variant theo aspect.
2. Đo text bằng font đã resolve.
3. Đặt các node quan trọng trong content-safe region.
4. Giải crop và vùng zoom.
5. Kiểm tra overflow, overlap và readability.
```

Nếu nội dung không vừa, giải pháp lần lượt là:

```text
reflow → copy variant → scene split → báo lỗi
```

Không âm thầm giảm font đến mức không đọc được.

### E. Giữ ngữ nghĩa giữa các phiên bản

Các aspect được phép thay đổi:

- Vị trí và kích thước node.
- Crop UI.
- Ngắt dòng.
- Cách chia panel và callout.

Không được âm thầm thay đổi:

- Product claim.
- Kết quả thao tác.
- Thứ tự bước hướng dẫn.
- Đích CTA.
- Ý nghĩa caption.

Khi một aspect cần thời lượng khác, tạo **timing variant rõ ràng** và biên dịch lại caption/audio anchors; không kéo giãn lén timeline.

---

## Tầng 4 — Choreography & Camera/Cursor Kinematics

### Trách nhiệm

Tầng này quản lý sự chú ý: lúc nào người xem cần nhìn bố cục, theo cursor, đọc chữ hoặc quan sát kết quả.

### A. Camera và pointer là hai actor độc lập

```text
Camera actor
  pan, zoom, angle, settle

Pointer actor
  approach, hover, press, release, retreat
```

Một attention scheduler kiểm tra các cửa sổ hoạt động.

```text
Camera move
    ↓
Camera settle
    ↓
Pointer approach
    ↓
Pointer hover
    ↓
Click
    ↓
Product response
    ↓
Callout / observation hold
```

**Hardrule:** không có chuyển động camera và pointer cùng lúc trong một thao tác walkthrough.

Định nghĩa “camera đã settle” dựa trên sai số hình học và vận tốc tại độ phân giải đầu ra, không chỉ dựa vào tên easing.

Ví dụ preset ban đầu, cần điều chỉnh bằng review:

| Hành động | Khoảng gợi ý ở 60 fps |
|---|---:|
| Camera settle hold | 6–10 frame |
| Pointer approach | 18–36 frame |
| Hover trước click | 6–12 frame |
| Press/release | 4–8 frame |
| Hold quan sát kết quả | Theo lượng thông tin cần đọc |

Đây là preset craft, không phải quy luật cố định cho mọi scene.

### B. Pointer trajectory

Pointer path được tạo từ điểm đầu, điểm cuối và một số tham số chuyển động:

```text
distance
duration
curvature
easing
optional deterministic overshoot
```

Dùng cubic Bézier hoặc trajectory solver xác định.

Không yêu cầu LLM viết raw path animation. AI chọn ý đồ như `confident`, `gentle`, `direct`; solver tạo hình học.

Với path cong, dùng arc-length lookup nếu cần kiểm soát tốc độ dọc đường. Easing theo tham số Bézier đơn thuần có thể tạo vận tốc không mong muốn.

### C. Cursor tip tại `(0,0)`

Canonical cursor geometry:

```text
SVG tip = (0,0)
transform-origin = 0 0
pointer position = actual click hotspot
```

Nếu icon chính thức có tip nằm ở điểm khác, thực hiện normalization xác định bằng transform; không vẽ lại path bằng tay.

Cursor đặt ở overlay viewport giúp giữ kích thước dễ đọc khi camera zoom. Hotspot của sản phẩm vẫn được project từ scene sang overlay.

### D. Click ripple đồng tâm

```text
cursorTipOutput = project(hotspot)
rippleCenterOutput = project(hotspot)

delta = distance(cursorTipOutput, rippleCenterOutput)
```

Gate:

```text
delta ≤ 1.0 encoded output pixel
```

Đo sau toàn bộ transform và tại frame click.

Không đo trong CSS pixel nếu pipeline còn scale hoặc encode xuống độ phân giải khác.

Ripple:

- Neo vào hotspot của sản phẩm.
- Scale từ chính tâm đó.
- Không chạy theo cursor sau khi click.
- Không lệch do border, padding hoặc transform origin.

### E. UI response là timeline state

Click không nên kích hoạt business logic sống để quyết định frame tiếp theo.

```text
click event at frame 240
UI selected state from frame 244
result panel visible from frame 258
```

Trong video walkthrough, response là state được author hoặc trích từ fixture sản phẩm đã xác minh.

Nếu dùng UI thật, dữ liệu và network phải được đóng băng trước khi xuất. Synthetic cursor không chứng minh hệ thống thật đã thực thi thao tác.

---

## Tầng 5 — Audio-Visual Sync & Speech Alignment

### Trách nhiệm

Biến audio thành dữ liệu thời gian có thể kiểm tra và tái sử dụng.

```text
Source audio
    ↓ decode once
Canonical PCM
    ├── envelope
    ├── transient candidates
    ├── speech alignment
    └── export audio master
```

Tất cả dữ liệu phụ phải tham chiếu cùng audio master hoặc có phép ánh xạ timeline rõ ràng.

### A. `.wave.json`

Ví dụ cấu trúc:

```json
{
  "version": 1,
  "sourceHash": "sha256:...",
  "analysis": {
    "sampleRate": 48000,
    "hopSamples": 480,
    "windowSamples": 960,
    "timestampOrigin": "window-center",
    "channelMix": "mono",
    "normalization": "fixed-reference"
  },
  "timelineOffsetSamples": 0,
  "channels": {
    "peak": [0.02, 0.06, 0.18],
    "rms": [0.01, 0.04, 0.11]
  }
}
```

Đây là **envelope**, không phải PCM thô.

Cần phân biệt:

| Dữ liệu | Mục đích |
|---|---|
| Peak envelope | Waveform, accent nhanh |
| RMS envelope | Energy, glow, breathing scale |
| Band energy | Equalizer có ý nghĩa theo dải tần |
| Transient events | Cut, hit, reveal |

Không gọi các cột ngẫu nhiên là audio-reactive equalizer. Nếu chỉ có một energy channel, ghi rõ là energy visualization; nếu muốn frequency bars, phân tích band energy.

### B. Audio time → frame time

Với audio sample `s`:

```text
audioTime = s / sampleRate
timelineTime = audioTime + offset
frame = quantize(timelineTime × fps)
```

Ở 60 fps và 48 kHz có 800 sample mỗi frame.

Với FPS hữu tỉ khác, không giả định sample/frame luôn nguyên. Tính từ tỷ lệ chính xác để tránh drift tích lũy.

Mọi offset, trim, stretch hoặc silence padding phải nằm trong edit map. Đổi audio edit thì envelope và caption alignment liên quan phải được invalidate.

### C. Transient và beat sync

Onset detector chỉ tạo candidate; candidate không tự động là một beat âm nhạc đúng.

Pipeline:

```text
Detect candidates
    ↓
Score strength + confidence
    ↓
Apply spacing / rhythm constraints
    ↓
Select or manually confirm editorial anchors
    ↓
Compile visual events
```

Cho phép anchor:

```json
{
  "id": "main-reveal",
  "source": "music-transients",
  "eventId": "transient-014",
  "offsetFrames": 0
}
```

Compiler lưu cả:

```text
source timestamp
selected frame
quantization error
editorial offset
```

Visual reveal có thể được author hơi trước âm thanh theo ý đồ dựng phim, nhưng offset phải minh bạch.

### D. Whisper và word-by-word captions

Không coi word timestamps từ ASR là ground truth tuyệt đối.

Pipeline phù hợp:

```text
Transcribe
    ↓
Correct transcript
    ↓
Align corrected text to audio
    ↓
Flag uncertain intervals
    ↓
Group words into readable caption phrases
```

Whisper cung cấp transcript và timestamp ước lượng; forced alignment có thể được dùng khi cần khớp bản chữ đã sửa với audio.

Cấu trúc:

```ts
type AlignedWord = {
  id: string;
  text: string;
  startSample: number;
  endSample: number;
  confidence?: number;
};
```

Compiler tạo frame interval và xử lý từ quá ngắn. Không âm thầm xóa từ có interval bị lượng tử hóa về 0 frame; gộp highlight hoặc báo trường hợp cần sửa.

### E. Kinetic captions

Caption và kinetic headline là hai primitive mode khác nhau.

Caption phải giữ:

- Nội dung đầy đủ và đúng thứ tự.
- Dấu câu, Unicode và dấu tiếng Việt.
- Cụm đọc ổn định.
- Active-word emphasis không làm đổi layout.
- Vị trí tránh overlay và vùng trọng tâm.

Một caption phrase được đo và layout trước. Từng từ đổi màu, opacity hoặc scale có kiểm soát; không reflow cả câu mỗi khi active word đổi.

Xuất đồng thời:

```text
Burned-in captions
SRT hoặc WebVTT
Transcript text
Alignment data
```

File subtitle ngoài giữ timestamp theo thời gian audio; không cần làm mất độ chính xác chỉ vì bản burn-in dùng frame grid.

---

## Tầng 6 — Universal Headless Render & Quality Gates Pipeline

### A. Render lifecycle

```text
Preflight
    ↓
Compile all target plans
    ↓
Resolve and lock ../assets
    ↓
Launch pinned browser
    ↓
Await runtime ready
    ↓
Seek → capture → stream with backpressure
    ↓
Encode and mux
    ↓
Inspect decoded output
    ↓
Generate evidence and publish artifacts
```

Preflight phải bắt lỗi trước khi chạy hàng nghìn frame.

### B. Browser environment

Khóa và ghi vào manifest:

```text
Chromium version
viewport / device scale factor
font hashes
asset hashes
color configuration
renderer backend
FFmpeg version / encoding profile
```

Không cho phép network không kiểm soát trong render phase. Mọi resource phải được resolve trước; request ngoài allowlist làm render thất bại.

Video texture, Canvas animation hoặc WebGL effect đều phải có seek adapter. Nếu chưa thể seek xác định, bake thành nguồn frame trước.

### C. FFmpeg pipe

Pipeline mặc định có thể dùng PNG frame qua `image2pipe`:

```text
Chromium screenshot
    → PNG bytes
    → ordered writable stream
    → FFmpeg image2pipe
    → video encoder
```

Raw RGBA chỉ dùng khi capture backend thực sự trả buffer với kích thước, stride và pixel format được đảm bảo.

Invariants:

- Một producer có thứ tự cho mỗi output.
- Không bỏ frame khi pipe đầy.
- Tôn trọng backpressure.
- FFmpeg lỗi thì dừng capture.
- Thiếu frame thì render thất bại, không tự lặp frame để che lỗi.

Encoding profile web phổ thông có thể chọn MP4/H.264, `yuv420p`, kích thước chẵn và fast-start. Codec/profile cần cấu hình theo mục tiêu giao hàng, không hardcode thành giới hạn kiến trúc.

Audio được trim/pad theo duration đã biên dịch. Không dùng “kết thúc theo stream ngắn nhất” để che duration mismatch.

### D. Multi-resolution

```text
Semantic composition
    ├── 1080×1920
    ├── 1920×1080
    └── 1080×1080
```

Các resolution cùng aspect có thể dùng cùng composition khi đảm bảo:

- Font và stroke vẫn đọc được.
- Raster source đủ độ phân giải.
- Pixel alignment phù hợp.
- Các threshold pixel được quy đổi đúng.

Aspect khác luôn cần layout pass riêng.

Nếu capture ở độ phân giải lớn rồi downsample, manifest phải ghi scale đó. Gate cursor/ripple và readability chạy trên kích thước đầu ra cuối cùng.

### E. Contact sheet validation

Contact sheet gồm:

```text
Frame đầu tiên
Các scene boundary
Các trạng thái trước / tại / sau click
Các điểm zoom lớn nhất
Caption dài nhất
CTA cuối
Các frame mẫu theo thời gian
```

Mỗi ô ghi:

```text
target
frame index
timecode
scene id
beat id
```

Contact sheet giúp kiểm tra composition và continuity, nhưng không chứng minh chuyển động mượt.

Bổ sung motion strip hoặc clip ngắn quanh camera move, click và transition. Kiểm tra timing trực tiếp bằng track/state; không suy diễn tất cả từ ảnh tĩnh.

### F. Artifact đầu ra

```text
video.mp4
captions.vtt
contact-sheet.jpg
render-manifest.json
audit-report.json
```

Manifest chứa bằng chứng như:

```text
expected / captured / decoded frame count
expected / measured duration
IR and asset fingerprints
compiler and renderer versions
gate results
warnings and approved waivers
```

Một process exit `0` chưa đủ. Phải kiểm tra file đầu ra giải mã được, đúng resolution, đúng số frame và không bị cắt audio.

---

# 2. Design Patterns & Invariants — Anti-Flop Hardrules

## 2.1. Safe zones là dữ liệu có phiên bản

Safe zone không nên là vài hằng số rải trong component.

```ts
type SafeZoneProfile = {
  id: string;
  version: string;
  aspectRatio: string;
  contentInsets: Insets;
  captionRegion: Rect;
  forbiddenOverlayRegions: Rect[];
  provenance: "internal-preset" | "verified-platform-profile";
  verifiedAt?: string;
};
```

Phải phân biệt:

- **Internal conservative preset:** quy ước thiết kế của engine.
- **Verified platform profile:** đã kiểm tra với placement cụ thể và có ngày xác minh.

Không có một vùng an toàn bất biến dùng đúng cho mọi TikTok, Reels, Shorts, quảng cáo và trạng thái app.

### Preset nội bộ khởi đầu

Các số dưới đây là đề xuất thiết kế, **không phải thông số chính thức của nền tảng**.

| Canvas | Vùng an toàn ban đầu | Cách dùng |
|---|---|---|
| 9:16 — 1080×1920 | Trái 72, phải 180, trên 192, dưới 384 px | Dành chỗ cho controls bên phải và metadata phía dưới |
| 16:9 — 1920×1080 | Insets 5% mỗi cạnh | Headline, logo, CTA và nội dung cần đọc |
| 1:1 — 1080×1080 | Insets 10% mỗi cạnh | Thông điệp và proof tập trung ở trung tâm |

Safe zone áp dụng lên **bounding box đã transform**, không chỉ tọa độ anchor.

Background, glow và yếu tố trang trí có thể bleed. CTA, caption, claim và thao tác đang được giải thích phải nằm trong vùng hợp lệ.

Với square, “center square” là vùng trọng tâm nội bộ; không có nghĩa nhét bản widescreen nguyên vẹn vào giữa.

---

## 2.2. Camera vs Cursor motion discipline

Luật compile-time:

```text
cameraMotionWindow ∩ pointerMotionWindow = ∅
```

Khi camera di chuyển:

- Pointer ẩn hoặc ở trạng thái không tạo chỉ dẫn tương tác.
- Ripple của click trước đã kết thúc.
- Callout neo theo scene được transform nhất quán.

Khi pointer tiếp cận và click:

- Camera giữ nguyên.
- Target không chạy khỏi cursor.
- UI feedback xuất hiện theo timeline đã xác định.

Mục tiêu là người xem chỉ cần theo một tín hiệu chuyển động chính tại một thời điểm.

---

## 2.3. Three-second hook grammar & Frame 1 contract

**Ngay frame đầu tiên phải có một thông điệp đọc được và một hình ảnh cho thấy giá trị hoặc vấn đề.**

Không fade toàn bộ hook từ opacity `0` khiến vài frame đầu trống. Không mở bằng logo đơn độc nếu logo chưa truyền đạt nội dung video.

Cấu trúc gợi ý:

| Thời gian | Vai trò |
|---|---|
| 0.0–0.8s | Kết quả hoặc vấn đề xuất hiện ngay |
| 0.8–1.8s | Proof, tương phản hoặc thay đổi đáng quan sát |
| 1.8–3.0s | Thiết lập lý do để xem tiếp |

Ví dụ grammar:

```text
Kết quả → thao tác tạo kết quả → bằng chứng
Vấn đề → hậu quả trực quan → khả năng giải quyết
Trước/sau → một khác biệt nổi bật → cách đạt được
```

Con số “85% muted viewers” được xử lý như **giả định của brief**, chưa được xác minh ở đây. Quyết định kiến trúc vẫn rõ: video phải hiểu được khi tắt tiếng.

Frame 1 gate kiểm tra:

```text
primary message visible
contrast and font size valid
critical text inside safe region
no blank opening
visual claim matches approved content
```

Gate tự động kiểm tra khả năng nhìn thấy; con người vẫn cần đánh giá hook có đáng xem và claim có đúng hay không.

---

## 2.4. Pattern interrupts mỗi 2–4 giây

Đối với short-form marketing, dùng nhịp 2–4 giây làm **mặc định biên tập**, không thành máy phát hiệu ứng ngẫu nhiên.

Các dạng interrupt:

```text
zoom punch
camera pan
keyword emphasis
composition change
proof reveal
```

Một interrupt phải phục vụ thông tin mới hoặc thay đổi trọng tâm.

Không yêu cầu mọi interrupt đều là camera move. Khi người xem đang đọc caption hoặc thao tác nhiều bước, một highlight trạng thái có thể đủ.

Compiler chạy rhythm lint:

```text
Khoảng thời gian dài không có thay đổi trọng tâm?
Có quá nhiều motion event cạnh tranh?
Interrupt có cắt ngang reading hold?
Có tạo flash lặp gây khó chịu?
```

Video educational có thể giữ một diagram lâu hơn 4 giây nếu nội dung cần đọc. Waiver phải gắn lý do, không tự thêm zoom để vượt gate.

---

## 2.5. Screenshot beats Screen Recording

Với walkthrough dựng có kiểm soát, screenshot/state capture thường phù hợp hơn screen recording vì:

- Crop và zoom có thể xác định.
- Cursor độc lập với nội dung.
- Không có jitter thao tác thật.
- UI state và timing có thể tái dựng.
- Các aspect dùng lại cùng nguồn hình ảnh.

Screen recording vẫn có giá trị khi cần chứng minh hành vi thật, độ trễ hoặc chuyển động liên tục của sản phẩm. Khi dùng, phải có asset và timing contract tương ứng.

### Quy tắc độ phân giải đúng

DPR 2 không tự động bảo đảm mọi zoom 2× đều sắc nét.

```text
sourcePixelsPerAxis
  ≥ displayedOutputPixelsBeforeZoom
    × maximumZoom
```

Nếu tính trong CSS space:

```text
required source width
  ≥ base CSS display width
    × camera zoom
    × capture DPR
```

Sau đó xét thêm downsample về encoded output.

Ví dụ: ảnh rộng 1600 px được đặt rộng 800 output px; zoom 2× sẽ dùng đúng 1600 px. Nếu cùng ảnh được đặt rộng 1200 output px rồi zoom 2×, nguồn đã thiếu độ phân giải.

**Gate phải dựa trên effective sampling density**, không dựa riêng vào metadata “retina”.

---

## 2.6. Các hardrule bổ sung

| Nhóm | Invariant |
|---|---|
| Icons và brand | Không emoji thô; Phosphor/Lucide chính thức; brand asset từ SVGL hoặc nguồn đã phê duyệt |
| Typography | Font được bundle, glyph đầy đủ, không fallback âm thầm, không clipping |
| Grid | Layout rest-state theo hệ 8pt; cho phép subpixel trong animation để chuyển động mượt |
| Motion | Ưu tiên transform/opacity; geometry animation chỉ đi qua bộ xử lý xác định |
| Accessibility | Interactive output hỗ trợ reduced motion; MP4 cần bản ít chuyển động nếu thuộc phạm vi giao hàng |

`@media (prefers-reduced-motion: reduce)` chỉ tác động đến player/web output. Nó không thể thay đổi một MP4 đã encode.

Reduced-motion variant nên giữ nội dung và thứ tự thông tin, giảm camera travel, overshoot, parallax và zoom mạnh.

---

# 3. Atomic Primitive Beats — Motion Design System

## 3.1. Tách Primitive, Beat và Recipe

```text
Primitive = đối tượng có hình học và trạng thái
Beat      = một đơn vị hành động có thời gian
Recipe    = cách ghép beat thành đoạn kể chuyện
```

Ví dụ:

```text
AppFrame + SyntheticCursor + ZoomRegion
                ↓
focus → approach → click → result
                ↓
UI Walkthrough Recipe
```

Không đóng gói một ../promo dài thành component khổng lồ rồi gọi đó là primitive.

### Hợp đồng chung

Mỗi primitive cần:

```text
typed props + validation schema
measurement and layout contract
pure frame-state evaluation
renderer adapter
reduced-motion behavior + representative fixtures
```

Tách phần đo/layout khỏi phần đánh giá mỗi frame. Không đo text lại liên tục trong lúc render.

---

## 3.2. Catalog primitives

| Primitive | Trách nhiệm | Props / input chính | Invariant |
|---|---|---|---|
| `AppFrame` | Cửa sổ ứng dụng và vùng nội dung | `chrome`, `content`, `activeState`, `contentInsets` | Hotspot nội dung không bị lệch bởi chrome |
| `BrowserFrame` | Browser chrome và website surface | `urlLabel`, `tabs`, `viewport`, `scrollState` | Scroll/crop có transform map rõ ràng |
| `SyntheticCursor` | Pointer, hover, press và click | `trajectory`, `target`, `style`, `clickEvents` | Tip `(0,0)`; ripple delta ≤ 1 output px |
| `ZoomRegion` | Điều khiển camera đến vùng quan tâm | `targetBounds`, `padding`, `maxScale`, `duration` | Không overlap pointer move; kiểm tra raster density |
| `KineticText` | Headline, keyword pop và caption | `tokens`, `mode`, `alignment`, `emphasis` | Không reflow ngoài dự kiến; frame đầu đọc được |
| `DiagramNodeFlow` | Node, edge và flow reveal | `nodes`, `edges`, `layout`, `activationEvents` | Node/edge được giải hình học xác định |
| `WaveformEqualizer` | Waveform hoặc energy/frequency bars | `audioData`, `mode`, `gain`, `bandMap` | Dữ liệu phản ánh đúng loại phân tích audio |
| `CalloutBadge` | Giải thích và chỉ vùng chức năng | `anchor`, `text`, `placement`, `connector` | Không che target; nằm trong safe region |
| `EndCardCTA` | Chốt thông điệp và hành động | `headline`, `action`, `brand`, `destination` | Một CTA chính; đủ thời gian đọc |

---

## 3.3. Chi tiết từng primitive

### `AppFrame`

Nội dung hỗ trợ ba nguồn:

```text
static screenshot
deterministic DOM scene
captured state sequence
```

Chrome là variant riêng: macOS, browserless, neutral application.

Cần xuất `contentBounds` chính xác để cursor và callout không phải đoán offset titlebar.

Các beat:

```text
enter
focus-panel
switch-state
highlight-result
exit
```

### `BrowserFrame`

Browser chrome không dùng UI thật của headless browser. Nó là nội dung dựng trong scene.

URL hiển thị là text; không tự điều hướng hoặc truy cập mạng.

Nếu walkthrough cần scroll, scroll offset là track. Screenshot dài được crop bằng transform map; hotspot tiếp tục neo vào asset space.

### `SyntheticCursor`

Các trạng thái:

```text
hidden → moving → hovering → pressed → released
```

Click event có một ID dùng chung cho:

```text
pointer press
ripple
target feedback
optional sound effect
```

Nhờ đó audit đối chiếu được một thao tác xuyên suốt các hệ thống.

### `ZoomRegion`

Đầu vào là vùng semantic:

```text
“results-panel”
```

Compiler giải:

```text
target bounding box
safe padding
camera center
feasible scale
asset sampling limit
```

Nếu zoom mong muốn vượt chất lượng nguồn, compiler báo lỗi hoặc chọn asset variant đã khai báo. Không tự tăng sharpening để giả chất lượng.

### `KineticText`

Ba mode chính:

| Mode | Mục đích |
|---|---|
| `headline` | Thông điệp lớn, ngắn |
| `emphasis` | Nhấn một từ/cụm trong layout ổn định |
| `caption` | Cụm phụ đề gắn với speech |

Mọi text được giữ dưới dạng Unicode chuẩn; segmentation theo ngôn ngữ. Tránh cắt theo byte hoặc từng code unit làm hỏng dấu và grapheme.

### `DiagramNodeFlow`

Layout engine tạo tọa độ node và edge trước render.

Edge animation có thể dùng stroke reveal đã chuẩn hóa. Nếu cần morph, dùng geometry pipeline và thư viện thuật toán; không nhận chuỗi `d` sinh trực tiếp từ prompt.

Activation của node phải phản ánh logic câu chuyện, không chỉ xuất hiện tuần tự theo thứ tự mảng.

### `WaveformEqualizer`

Các mode:

```text
waveform-history
amplitude-bars
frequency-bands
```

Mỗi mode có nhãn dữ liệu rõ. Sampling window, smoothing và gain nằm trong manifest.

### `CalloutBadge`

Placement solver thử các vị trí hữu hạn:

```text
top → right → bottom → left
```

Chấm điểm theo:

```text
safe-zone violation
target occlusion
text collision
connector length
```

Tie-break cố định để layout không đổi giữa các lần compile.

### `EndCardCTA`

Một CTA chính, một destination rõ ràng.

Với MP4, button chỉ là hình ảnh; không mô tả như control có thể bấm trong video. Link hành động nằm ở placement/player hoặc destination text/QR nếu được yêu cầu.

CTA hold được tính theo lượng chữ và mục tiêu đọc, không chỉ hardcode 0.5 giây cuối.

---

## 3.4. Recipe layer cho năm nhóm video

| Recipe | Cấu trúc |
|---|---|
| Launch / sizzle | Hook → proof flashes → hero reveal → product value → CTA |
| UI walkthrough | Outcome → focus → action → response → explanation |
| Social short | Hook → one problem → one proof → one action |
| Explainer | Problem → Stakes → Solution → How It Works → CTA |
| Kinetic/audio | Text hierarchy → speech/beat anchors → emphasis → resolution |

Recipe xác định **trình tự và ràng buộc**, không áp đặt cùng một visual skin lên mọi thương hiệu.

Marketing brief cần lưu nguồn của metric, testimonial và claim. Engine không tự chế phần trăm hiệu quả hay bằng chứng để lấp chỗ trống trong script.

---

# 4. Tổ chức Codebase & Tích hợp vào Repo Hiện Tại

## 4.1. Cấu trúc mục tiêu

Chọn `projects/` cho video production mới. Giữ `../promo/` hiện tại trong giai đoạn chuyển tiếp để không phá showcase và đường dẫn cũ.

```text
design-os-svg-animation/
├── packages/
│   └── motion-engine/
│       ├── src/
│       │   ├── clock/
│       │   ├── compiler/
│       │   ├── scene-graph/
│       │   ├── layout/
│       │   ├── choreography/
│       │   ├── audio/
│       │   ├── renderers/
│       │   └── validation/
│       └── package.json
│
├── src/
│   ├── primitives/
│   │   ├── app-frame/
│   │   ├── browser-frame/
│   │   ├── synthetic-cursor/
│   │   ├── zoom-region/
│   │   ├── kinetic-text/
│   │   ├── diagram-node-flow/
│   │   ├── waveform-equalizer/
│   │   ├── callout-badge/
│   │   └── end-card-cta/
│   ├── recipes/
│   ├── studio/
│   └── components/                 # Giữ suite hiện tại khi chuyển đổi
│
├── schemas/
│   ├── motion-ir.schema.json
│   ├── motion-ir-v1.schema.json
│   ├── render-plan.schema.json
│   ├── video-project.schema.json
│   └── audio-analysis.schema.json
│
├── profiles/
│   ├── viewports/
│   ├── safe-zones/
│   └── encoding/
│
├── projects/
│   └── product-launch/
│       ├── video.project.json
│       ├── motion.ir.json
│       ├── content/
│       │   ├── script.md
│       │   └── claims.json
│       ├── ../assets/
│       ├── audio/
│       └── variants/
│
├── scripts/
│   ├── video-cli.ts
│   ├── anti-flop-gate.py
│   └── export-promo-video.py
│
├── tests/
│   ├── compiler/
│   ├── determinism/
│   ├── choreography/
│   └── visual-fixtures/
│
├── artifacts/                      # Generated; retention theo policy
├── ../promo/                          # Existing showcases
└── docs/
```

Không cần chuyển toàn bộ repository thành monorepo trong một lần. Có thể bắt đầu với local package và dependency boundary rõ ràng, rồi hoàn thiện workspace tooling khi thực sự cần.

### Dependency direction

```text
projects / recipes
        ↓
primitives / studio / CLI
        ↓
motion-engine public API
        ↓
geometry, audio and renderer libraries
```

`motion-engine` không import một showcase cụ thể. Primitive không biết tên campaign hay đường dẫn project.

### Cấu trúc một primitive

```text
synthetic-cursor/
├── index.ts
├── synthetic-cursor-props.ts
├── synthetic-cursor-layout.ts
├── synthetic-cursor-evaluator.ts
├── synthetic-cursor-renderer.ts
└── synthetic-cursor.test.ts
```

Chỉ tách khi có trách nhiệm thật; không tạo file rỗng để hoàn thiện cây thư mục.

---

## 4.2. Mở rộng `schemas/motion-ir.schema.json`

Dùng schema version rõ ràng và `$defs` cho các hợp đồng dùng lại.

| Nhóm schema | Trường chính |
|---|---|
| Identity và timing | `schemaVersion`, `projectId`, `seed`, `timeline` |
| Assets và output | `../assets`, `targets`, `layoutProfiles`, `safeZoneProfiles` |
| Scene content | `scenes`, `nodes`, `hotspots`, `variants` |
| Motion và audio | `tracks`, `beats`, `bindings`, `audio`, `captions` |
| Quality và access | `accessibility`, `qualityPolicy`, `provenance` |

Quy tắc schema:

```text
additionalProperties: false tại các object được kiểm soát
enum cho primitive và animatable property
giới hạn số lượng/kích thước
integer cho frame
reference có định dạng rõ
```

Các kiểm tra không nên cố nhét vào JSON Schema:

```text
reference có tồn tại không
scene có overlap trái phép không
camera và cursor có di chuyển đồng thời không
text có vừa layout không
binding graph có cycle không
```

Chúng thuộc semantic validator và layout analyzer.

### Versioning và migration

```text
v1 authoring
    ↓ explicit migrator
v2 authoring
    ↓ compiler
render plan
```

Không tự suy schema version dựa vào sự có mặt của một field.

Migrator phải:

- Giữ bản gốc.
- Phát ra file mới hoặc diff review được.
- Báo các field không chuyển được.
- Không tự nhận migration thành công nếu mất semantic.
- Có fixture cho các mẫu hiện tại.

---

## 4.3. CLI chuẩn

### Tạo project

```bash
npm run create:video -- \
  --name product-launch \
  --recipe walkthrough \
  --targets 16:9,9:16,1:1
```

Kết quả:

```text
project manifest
IR skeleton
script skeleton
asset checklist
target configuration
```

Scaffold không điền testimonial, số liệu hoặc product proof giả.

### Preview

```bash
npm run preview:video -- --project product-launch
```

Studio Runner tiếp tục cung cấp transport, timecode, scrubber và shortcut.

Bổ sung:

```text
aspect switcher
safe-zone overlay
hotspot/ripple debug
audio/caption timeline
validation panel
```

Các overlay nằm ngoài production scene graph. `.clean-export` là một phần của export adapter, không chỉ là thao tác giấu vài nút bằng CSS.

### Render tất cả target

```bash
npm run render:all -- --project product-launch
```

Quy ước: “all” là mọi target trong manifest của project được chọn. Nếu muốn cả repository, cần flag riêng để tránh vô tình render hàng loạt project.

### Audit

```bash
npm run audit:all -- --project product-launch
```

Chạy static audit và kiểm tra artifact của đúng fingerprint hiện tại. Nếu artifact cũ hoặc thiếu, báo rõ; không dùng bản xuất trước để chứng nhận IR mới.

### Một entrypoint, nhiều module

CLI TypeScript có thể gọi pipeline Python hiện có qua adapter. Không cần viết lại công cụ đang hoạt động chỉ để đồng nhất ngôn ngữ.

Các script hiện tại tiếp tục làm façade tương thích trong giai đoạn di trú.

---

## 4.4. Tích hợp bảy Gate 0–6

Đây là **phân nhóm mục tiêu đề xuất**. Khi triển khai phải đối chiếu ý nghĩa Gate hiện hữu; không âm thầm đổi tên hoặc làm mất kiểm tra cũ.

| Gate | Trách nhiệm mục tiêu | Ví dụ lỗi chặn |
|---|---|---|
| **0 — IR & Input Safety** | Schema, reference, sanitizer, resource limits, claim provenance policy | IR chứa code, asset reference không hợp lệ |
| **1 — Visual Foundations** | Icon/brand policy, typography, grid, font/glyph | Emoji thô, missing font, clipping |
| **2 — Layout & Aspect** | Safe zone, overflow, crop, raster density | CTA bị overlay che, zoom thiếu pixel |
| **3 — Motion & Interaction** | Clock determinism, camera/pointer, click alignment | Seek khác kết quả, ripple lệch > 1 px |
| **4 — Audio & Narrative Timing** | Caption alignment, sync, hook, rhythm | Caption thiếu từ, offset lỗi, opening trống |
| **5 — Accessibility & Delivery** | Reduced-motion output, caption assets, decode, frame count | MP4 lỗi, thiếu frame, không có fallback yêu cầu |
| **6 — Visual Acceptance Evidence** | Contact sheet, motion samples, baselines, review record | Thiếu bằng chứng hoặc còn blocker chưa xử lý |

Không quy tất cả vào binary pixel diff.

Một số tiêu chí là machine-enforceable; số khác cần nhận xét của reviewer:

```text
Máy: cursor/ripple lệch 1.4 px → fail.
Máy: caption nằm ngoài safe region → fail.
Người: hook không truyền đạt giá trị → cần sửa.
Người: claim vượt bằng chứng → cần sửa.
```

`audit:all` có thể xác nhận các gate tự động đã pass nhưng phải báo `review-required` nếu policy yêu cầu review độc lập chưa có. Không gọi production-ready chỉ vì scanner không tìm thấy lỗi.

---

## 4.5. Bảo toàn ba showcase hiện tại

Chuyển đổi từng phần, không viết lại đồng loạt:

| Showcase | Phần nên trích xuất |
|---|---|
| Claude Design | Clock-driven Three.js, globe/arcs adapter, audio bindings |
| Codex App | AppFrame, synthetic interaction, code diff states, spring evaluator |
| Vercel v0 | BrowserFrame, text roll, popover choreography, perspective card |

Mỗi lần trích xuất phải so sánh với baseline được chụp **trước thay đổi**:

```text
critical frame images
scene boundary timing
camera/cursor positions
total frame count
audio alignment
```

Baseline chỉ là bằng chứng bảo toàn hiện trạng; không mặc định mọi lỗi có sẵn đều được chấp nhận.

---

# 5. Lộ trình Triển khai Thực tế

## Nguyên tắc chia việc

Một task triển khai nên có:

```text
một hợp đồng cần hoàn thiện
phạm vi file rõ
fixture hoặc project thật
lệnh kiểm tra chính xác
artifact có thể review
```

Giữ các task engine, primitive, audio và render tách theo boundary. Chỉ chạy song song sau khi hợp đồng dùng chung đã ổn định.

Không ước lượng lịch cứng từ tài liệu này khi chưa kiểm tra code hiện hữu. Thứ tự và điều kiện hoàn thành dưới đây là cam kết kỹ thuật; thời lượng cần được hiệu chỉnh sau inventory.

---

## Phase 1 — Core Engine & Multi-Aspect Adapter

### Mục tiêu

Cùng một video program chạy được qua clock chuẩn và xuất ba aspect với composition hợp lệ.

### Hạng mục

1. Ghi baseline của ba showcase; lập inventory clock, renderer, schema và export pipeline.
2. Chuẩn hóa `FrameContext`, `seekToFrame()` và readiness receipt.
3. Tạo IR v2 tối thiểu, compiler và immutable render plan.
4. Xây viewport, safe-zone profile, coordinate mapping và aspect layout.
5. Chuyển một đoạn showcase thật sang engine mới, render đủ ba target.

### Phạm vi IR tối thiểu

```text
scene
asset
text/image node
transform/opacity track
hotspot
aspect layout variant
```

Không đưa toàn bộ audio intelligence hoặc recipe generator vào Phase 1.

### Acceptance

| Kiểm tra | Điều kiện đạt |
|---|---|
| Random seek | Cùng frame cho cùng state khi seek tiến, lùi và thứ tự ngẫu nhiên |
| Frame boundary | Không thiếu/thừa frame đầu hoặc cuối |
| Multi-aspect | 16:9, 9:16, 1:1 có layout riêng, không letterbox |
| Existing content | Showcase baseline không có regression ngoài thay đổi đã chấp nhận |
| Evidence | Một đoạn nội dung thật được encode, decode và xuất contact sheet |

### Kết quả bàn giao

Core runtime, compiler tối thiểu, viewport adapter và một project mẫu đã kiểm chứng.

**Chưa tuyên bố:** mọi hiệu ứng cũ đã được di trú hoặc render giống pixel giữa mọi môi trường.

---

## Phase 2 — Primitive Beats Catalog & UI Walkthrough Builder

### Mục tiêu

Biến screenshot hoặc các UI state đã capture thành walkthrough có cursor, zoom, click và callout.

### Hạng mục

1. Hoàn thiện `AppFrame`, `BrowserFrame`, `SyntheticCursor` và `ZoomRegion`.
2. Xây semantic hotspot authoring và coordinate projector dùng chung.
3. Thêm choreography scheduler và kiểm tra camera/pointer.
4. Hoàn thiện `CalloutBadge`, `KineticText` cơ bản và `EndCardCTA`.
5. Tạo walkthrough recipe từ các bước `focus → action → response → explain`.

### Input authoring

```json
{
  "stepId": "generate-interface",
  "surface": "builder-screen",
  "focusRegion": "prompt-panel",
  "action": {
    "type": "click",
    "hotspot": "generate-button"
  },
  "responseState": "generated-result",
  "callout": "Xem trước kết quả ngay trong workspace"
}
```

Builder biên dịch input này thành timeline. Không để recipe tự quyết định tọa độ click bằng text matching không kiểm chứng.

### Acceptance

| Kiểm tra | Điều kiện đạt |
|---|---|
| Alignment | Cursor/ripple delta ≤ 1 output px tại mọi click, mọi target |
| Motion discipline | Không có camera move chồng pointer move |
| Image quality | Source density đạt yêu cầu tại maximum zoom |
| Layout | Callout không che target, caption/CTA nằm trong safe region |
| Usability | Một walkthrough sản phẩm thật có thể review khi tắt tiếng |

### Kết quả bàn giao

Primitive gallery có fixture, walkthrough builder và project demo đa aspect.

---

## Phase 3 — Short-Form & Explainer Pipeline

### Mục tiêu

Sản xuất video ngắn có speech alignment, audio-driven beats và cấu trúc kể chuyện.

### Hạng mục

1. Tạo canonical PCM pipeline, `.wave.json` và audio edit map.
2. Tích hợp transcript correction, word alignment và caption grouping.
3. Thêm transient candidate detection và editorial beat anchors.
4. Hoàn thiện `DiagramNodeFlow`, `WaveformEqualizer` và kinetic caption modes.
5. Xây short-form/explainer recipes với hook, proof và CTA contracts.

### Acceptance

| Kiểm tra | Điều kiện đạt |
|---|---|
| Audio provenance | Analysis hash khớp audio master dùng để xuất |
| Caption integrity | Không thiếu từ; dấu tiếng Việt và phrase layout đúng |
| Sync | Sai số quantize được đo; các đoạn speech alignment nghi ngờ được review |
| Narrative | Frame đầu hiểu được khi mute; explainer đủ các phần yêu cầu |
| Real-data evidence | Một short-form có nhạc và một explainer có voice được xuất đủ target |

Không dùng độ chính xác frame của compiler để tuyên bố ASR đã chính xác. Hai loại sai số này phải được báo riêng.

### Kết quả bàn giao

Audio/caption pipeline, hai recipe hoàn chỉnh và transcript/subtitle artifacts đi kèm video.

---

## Phase 4 — Production Automation & Quality Auditing

### Mục tiêu

Biến render thành quy trình có thể lặp lại, phát hiện lỗi và cung cấp bằng chứng trước khi giao video.

### Hạng mục

1. Hoàn thiện CLI create, preview, render và audit.
2. Khóa render environment; triển khai backpressure, cancellation và resource limits.
3. Gắn bảy gate với report machine-readable và review evidence.
4. Tạo contact sheet, motion samples và kiểm tra decoded output.
5. Chạy regression cho ba showcase cùng các recipe mới; hoàn thiện tài liệu vận hành.

### Failure recovery

Job giữ lại:

```text
input fingerprint
last successful stage
stderr/log location
partial artifact status
next executable recovery action
```

Không append tùy tiện vào một MP4 đang encode dở.

Hai chế độ recovery hợp lệ:

- **Pipe mode:** render lại output bị lỗi từ đầu.
- **Frame-cache mode:** tái sử dụng frame đã kiểm tra hash, rồi encode lại.

Frame cache là tối ưu tùy chọn theo nhu cầu, không bắt buộc ngay từ Phase 1.

### Acceptance

| Kiểm tra | Điều kiện đạt |
|---|---|
| CLI | Project mới scaffold được; render/audit nhận đúng project và target |
| Export correctness | Resolution, FPS, frame count, duration và audio mapping đúng |
| Failure handling | Encoder lỗi, missing font hoặc asset mismatch tạo lỗi rõ, không giao file như thành công |
| Quality evidence | Mọi target có report, contact sheet và trạng thái review |
| Regression | Ba showcase và recipe production được kiểm tra sau thay đổi cuối |

### Định nghĩa production-ready

Một output chỉ được đánh dấu production-ready khi:

```text
IR và asset hợp lệ
+ render từ đúng fingerprint
+ automated gates pass
+ decoded output kiểm tra đạt
+ required visual review hoàn tất
```

Điểm còn cần xác minh khi bắt đầu triển khai: version schema hiện hữu, ý nghĩa chính xác của Gate 0–6, khả năng seek của các adapter Three.js/video hiện tại, và môi trường browser/FFmpeg chuẩn.

**Bước đầu tiên: tạo task Phase 1 “Baseline clock và một scene trên ba aspect”, dùng một đoạn showcase hiện có làm fixture hồi quy.**
