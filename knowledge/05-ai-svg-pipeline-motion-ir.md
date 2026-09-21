# Trụ Cột 05: Pipeline Tích Hợp AI & Motion IR (AI Pipeline & Motion IR)

Phương pháp luận chuẩn hóa quy trình sử dụng các mô hình AI (LLMs & VLMs) để phân tích ngữ nghĩa, phân rã đối tượng và sinh cấu trúc Motion IR an toàn.

---

## 1. Kỹ Thuật Phân Rã Ý Định (Prompt Decomposition)

Không bao giờ hỏi LLM: *"Hãy viết code animate cái icon này"*. Thay vào đó, quy trình chia nhỏ câu hỏi thành các prompt chuyên biệt:

```
Input: "Làm icon trái tim đập thình thịch khi người dùng nhấn like"
                      │
                      ▼
[Prompt 1: Intent & Semantic Extraction]
-> Output: Subject=heart, Trigger=click, Action=pulse, Personality=warm/energetic
                      │
                      ▼
[Prompt 2: Structural Decomposition & Roles]
-> Output: Layer-1: main-heart (scale & squash), Layer-2: sparkles (burst & fade)
                      │
                      ▼
[Prompt 3: Motion IR Synthesis with Strict Schema]
-> Output: JSON Motion IR Document (Tracks, Keyframes, Tokens)
```

---

## 2. Ép Kiểu Structured Output Bằng JSON Schema

Sử dụng tính năng Function Calling / Structured Outputs của OpenAI, Gemini, hoặc TypeSafe AI để bảo đảm 100% LLM trả về đúng JSON Schema của Motion IR:

```json
{
  "name": "generate_motion_ir",
  "description": "Generate a valid Motion IR document for SVG elements",
  "parameters": {
    "type": "object",
    "properties": {
      "timeline": {
        "type": "object",
        "properties": {
          "durationMs": { "type": "integer", "minimum": 100, "maximum": 5000 },
          "loop": { "type": "boolean" }
        },
        "required": ["durationMs", "loop"]
      },
      "tracks": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "targetSelector": { "type": "string" },
            "transformOrigin": { "type": "string" },
            "properties": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "type": { "type": "string", "enum": ["transform", "opacity", "morph"] },
                  "durationMs": { "type": "integer" },
                  "keyframes": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "timePercent": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
                        "value": { "type": ["number", "array"] }
                      },
                      "required": ["timePercent", "value"]
                    }
                  }
                },
                "required": ["type", "durationMs", "keyframes"]
              }
            }
          },
          "required": ["targetSelector", "properties"]
        }
      }
    },
    "required": ["timeline", "tracks"]
  }
}
```

---

## 3. Cầu Nối Deterministic Repair Giữa AI và Trình Biên Dịch

Khi LLM sinh ra Motion IR, trước khi đưa vào compiler, dữ liệu bắt buộc đi qua tầng sửa lỗi tự động:

```typescript
export function repairMotionIR(rawIR: MotionIRDocument, svgDom: SVGElement): MotionIRDocument {
  const repaired = { ...rawIR };

  for (const track of repaired.tracks) {
    const el = svgDom.querySelector(track.targetSelector);
    if (!el) {
      console.warn(`[Repair] Target element ${track.targetSelector} not found!`);
      continue;
    }

    // 1. Tự động sửa transform-origin nếu AI tính sai
    if (!track.transformOrigin || track.transformOrigin === "auto") {
      const bbox = (el as SVGGraphicsElement).getBBox();
      track.transformOrigin = `${bbox.x + bbox.width / 2}px ${bbox.y + bbox.height / 2}px`;
    }

    // 2. Tự động clamp thời gian keyframes trong khoảng [0.0, 1.0]
    for (const prop of track.properties) {
      if ("keyframes" in prop) {
        prop.keyframes.forEach(kf => {
          kf.timePercent = Math.max(0.0, Math.min(1.0, kf.timePercent));
        });
        // Sắp xếp keyframes theo thứ tự thời gian tăng dần
        prop.keyframes.sort((a, b) => a.timePercent - b.timePercent);
      }
    }
  }

  return repaired;
}
```
