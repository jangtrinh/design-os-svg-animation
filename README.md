# Design OS — SVG Animation Engine & Knowledge Base

> **Production-grade AI-powered SVG Animation Engine, Motion IR, and Comprehensive Vector Motion Knowledge Base.**

Part of the **Design OS** ecosystem (alongside `design-os-3d-blender` and `ease-design`).

---

## 🎯 Vision & Core Philosophy

Tự động hóa SVG Animation bằng AI đòi hỏi sự phân tách rạch ròi giữa **Ý định ngữ nghĩa (Semantic Intent)** và **Hình học tất định (Deterministic Geometry)**.

```
Prompt / Intent / Sketch
          │
          ▼
┌──────────────────────────────────────────────┐
│  AI / LLM Stage: Semantic Motion Planning    │
│  - Intent Understanding                      │
│  - Semantic Scene Graph Decomposition        │
│  - Motion Semantics & Timing Tokens          │
└──────────────────────┬───────────────────────┘
                       │ Motion IR (JSON/YAML)
                       ▼
┌──────────────────────────────────────────────┐
│  Deterministic Engine Stage: Geometry & Math │
│  - SVGO & Path Normalization                 │
│  - Cubic Bézier Conversion & Point Alignment │
│  - Morphing & Subpath Triangulation          │
│  - Multi-target Compilation                  │
└──────────────────────┬───────────────────────┘
                       │
       ┌───────────────┼───────────────┬───────────────┐
       ▼               ▼               ▼               ▼
Pure CSS Keyframes   GSAP Timeline   WAAPI Tracks   Lottie / SMIL
```

---

## 🏛️ Project Architecture

```
design-os-svg-animation/
├── docs/                              # Kiến trúc & Đặc tả kỹ thuật
│   ├── architecture-overview.md       # 7-Stage Hybrid Engine
│   ├── motion-ir-specification.md     # Đặc tả Motion Intermediate Representation
│   ├── ai-capabilities-and-limits.md  # Năng lực & Giới hạn của AI trong Vector Motion
│   ├── morphing-topology-strategy.md  # Kỹ thuật nội suy và ghép nối Path
│   └── quality-and-safety-gates.md    # Tiêu chuẩn kiểm duyệt JEV System One & A11y
├── knowledge/                         # 7 Trụ Cột Tri Thức Chuyên Sâu
│   ├── INDEX.md                       # Bản đồ tri thức & ma trận năng lực
│   ├── 01-svg-dom-and-geometry.md     # ViewBox, paths, transforms, winding rules
│   ├── 02-motion-semantics-physics.md # Easing, cubic-bezier, spring kinematics
│   ├── 03-morphing-interpolation.md   # Flubber, point resampling, topology alignment
│   ├── 04-animation-engines-targets.md# GSAP, CSS, WAAPI, Lottie SVG, SMIL so sánh
│   ├── 05-ai-svg-pipeline-motion-ir.md# Prompt decomposition, structured outputs
│   ├── 06-interactive-state-machines.md# Micro-interactions, hover/click/scroll triggers
│   └── 07-performance-optimization.md # GPU compositing, paint metrics, will-change
├── scripts/                           # Tooling tự động hóa & JEV System One
│   ├── jev-svg-curator.py             # Curate & audit tri thức qua JEV System One
│   ├── jev-svg-auditor.py             # Code review, AST & SVG animatability audit
│   └── motion-ir-compiler-demo.ts     # Prototype compiler Motion IR -> CSS & GSAP
├── research/                          # Báo cáo nghiên cứu & Debate logs
│   ├── 2026-09-codex-architecture.md  # Tham vấn kiến trúc Codex Web GPT-6-Astra
│   └── multi-persona-debate-log.md    # Biên bản tranh luận 5 chuyên gia
└── examples/                          # Các mẫu SVG và animation thực tế
```

---

## ⚡ Quickstart

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Chạy Demo Motion IR Compiler
```bash
npm run demo
```

### 3. Thẩm định Tri thức bằng JEV System One
```bash
npm run audit:knowledge
```

### 4. Kiểm duyệt File SVG bằng JEV SVG Auditor
```bash
npm run audit:svg
```

---

## 🤝 Ecosystem
- **Ecosystem**: Design OS
- **Target Runtimes**: Modern Browsers, React/Vue/Svelte, Web Components, Mobile Webviews
- **License**: MIT
