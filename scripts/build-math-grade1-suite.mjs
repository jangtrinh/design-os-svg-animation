import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const kernel = readFileSync(path.join(ROOT, '.agents/skills/hairline-create/kernel.js'), 'utf8');

const html = `<!doctype html>
<html lang="vi" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DESIGN:OS · Toán Học Lớp 1 (Grade 1 Elementary Math)</title>
<link rel="icon" href="data:,">
<style>
  :root {
    color-scheme: light !important;
    --ground: #ffffff;
    --ink: #232327;
    --muted: #6f6f78;
    --line: #e0e0e4;
    --accent: #111113;
    --card-bg: #fafafa;
    --pill-bg: #f4f4f6;
    --pill-active: #232327;
    --pill-text-active: #ffffff;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh;
    background: var(--ground); color: var(--ink);
    font: 13px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    padding: 32px 20px 60px;
    display: flex; flex-direction: column; align-items: center;
  }
  header { width: 100%; max-width: 840px; margin-bottom: 24px; text-align: left; }
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    font: 10px/1 ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.08em;
    padding: 4px 8px; border-radius: 4px; background: #eef0f4; color: var(--ink);
    border: 1px solid var(--line); margin-bottom: 10px;
  }
  h1 { font-size: 20px; font-weight: 600; margin: 0 0 6px; letter-spacing: -0.01em; }
  .subtitle { color: var(--muted); font-size: 13px; margin: 0; }

  /* Navigation Pills */
  .nav-strip {
    width: 100%; max-width: 840px; display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;
  }
  .nav-btn {
    font: 11px/1.2 ui-monospace, monospace; padding: 6px 12px; border-radius: 6px;
    border: 1px solid var(--line); background: var(--pill-bg); color: var(--ink);
    cursor: pointer; transition: all 0.15s ease;
  }
  .nav-btn:hover { background: #e8e8ec; }
  .nav-btn.active {
    background: var(--pill-active); color: var(--pill-text-active); border-color: var(--pill-active);
  }
  .view-mode-toggle {
    margin-left: auto; background: #ffffff; font-weight: 500;
  }

  /* Stage Container */
  .main-stage-wrapper {
    width: 100%; max-width: 840px; display: flex; flex-direction: column; gap: 16px;
  }
  .plate {
    position: relative; border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
    background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }
  .tag {
    position: absolute; top: 12px; z-index: 2; color: var(--muted); pointer-events: none;
    font: 11px/1 ui-monospace, monospace;
  }
  #name { left: 16px; font-weight: 600; color: var(--ink); }
  #read { right: 16px; color: var(--ink); font-variant-numeric: tabular-nums; }
  #stage { aspect-ratio: 400 / 320; width: 100%; display: block; }
  #stage svg { width: 100%; height: 100%; display: block; }

  /* Controls */
  .controls {
    display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
    padding: 12px 16px; background: var(--card-bg); border: 1px solid var(--line); border-radius: 8px;
  }
  .label { font: 11px/1 ui-monospace, monospace; color: var(--muted); }
  input[type="range"] {
    flex: 1 1 120px; min-width: 0; height: 28px; margin: 0; background: transparent; cursor: pointer;
    -webkit-appearance: none; appearance: none;
  }
  input[type="range"]::-webkit-slider-runnable-track { height: 1px; background: var(--muted); }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 13px; height: 13px; margin-top: -6px; border-radius: 50%;
    border: 1px solid var(--ink); background: var(--ground);
  }
  input[type="range"]:focus-visible, button:focus-visible { outline: 1.5px solid var(--ink); outline-offset: 2px; }
  output { font: 11px/1 ui-monospace, monospace; min-width: 4ch; text-align: right; font-variant-numeric: tabular-nums; }
  .btn-nav {
    height: 28px; padding: 0 10px; border: 1px solid var(--line); border-radius: 6px;
    background: #ffffff; color: var(--ink); font: 11px/1 ui-monospace, monospace; cursor: pointer;
  }
  .btn-nav:hover { background: #f0f0f4; }

  .meta-box {
    margin-top: 4px; padding: 14px 18px; border: 1px solid var(--line); border-radius: 8px;
    background: #ffffff;
  }
  .meta-title { font-size: 13px; font-weight: 600; margin: 0 0 4px; }
  .meta-desc { font-size: 12px; color: var(--muted); margin: 0; line-height: 1.5; }
  .meta-rule { font: 11px/1 ui-monospace, monospace; color: var(--muted); margin-top: 8px; }

  /* Gallery Grid View */
  #gallery-view {
    width: 100%; max-width: 840px; display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px; margin-top: 8px;
  }
  .grid-card {
    border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: #ffffff;
    display: flex; flex-direction: column; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .grid-card:hover {
    transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: #c0c0c6;
  }
  .grid-stage { aspect-ratio: 400 / 300; width: 100%; background: #ffffff; }
  .grid-stage svg { width: 100%; height: 100%; display: block; }
  .grid-meta { padding: 12px 14px; border-top: 1px solid var(--line); background: var(--card-bg); }
  .grid-name { font-weight: 600; font-size: 12px; margin: 0 0 2px; }
  .grid-desc { font-size: 11px; color: var(--muted); margin: 0; }

  [hidden] { display: none !important; }
</style>
</head>
<body>

<header>
  <div class="badge">DESIGN:OS · HAIRLINE KINEMATICS</div>
  <h1>Toán Học Lớp 1 — 10 Hình Tương Tác 2:1 Isometric</h1>
  <p class="subtitle">Bộ sưu tập mô hình tương tác trục đo 2:1 minh họa các khái niệm toán học nền tảng: đếm hạt, so sánh cân bằng, khung 10 ô, trục số, hình khối và phân số.</p>
</header>

<nav class="nav-strip" id="nav-tabs" aria-label="Danh mục 10 hình toán học">
  <!-- Dynamic buttons inserted here -->
</nav>

<!-- Single Figure Focus Mode -->
<div class="main-stage-wrapper" id="single-view">
  <div class="plate">
    <span class="tag" id="name"></span>
    <span class="tag" id="read"></span>
    <div id="stage"></div>
  </div>
  <div class="controls">
    <button class="btn-nav" id="btn-prev" aria-label="Hình trước">&larr; Trước</button>
    <label class="label" for="intensity">intensity</label>
    <input id="intensity" type="range" min="0" max="1" step="0.01" value="0.5">
    <output id="value" for="intensity">0.5</output>
    <button class="btn-nav" id="btn-next" aria-label="Hình kế tiếp">Kế tiếp &rarr;</button>
  </div>
  <div class="meta-box">
    <div class="meta-title" id="meta-title"></div>
    <p class="meta-desc" id="meta-desc"></p>
    <div class="meta-rule" id="meta-rule"></div>
  </div>
</div>

<!-- All Figures Gallery Mode -->
<div id="gallery-view" hidden>
  <!-- 10 figure cards rendered here -->
</div>

<script id="hl-kernel">
${kernel}
</script>

<script>
/*
 * 10 Grade 1 Math Figures Definitions (Hairline 2:1 Axonometric Standard)
 */
const MATH_FIGURES = [
  // 1. Math Abacus (Bàn tính Soroban đếm số)
  {
    id: "math-abacus",
    title: "1. Bàn Tính Đếm Hạt (Soroban Abacus)",
    means: "Bàn tính đếm hạt: di chuột để trượt các hạt tính dọc theo trục sắt, hạt trên = 5, mỗi hạt dưới = 1.",
    rules: [1, 2, 3, 5, 8],
    range: [0, 5, 10],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-50, -18, 0], [50, 18, 44]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Frame
      const [outerRing, innerRing] = HL.rings(-45, -18, 45, 18, 2, 1.5);
      const basePrism = HL.prism(P, front, outerRing, innerRing, 0, 4);
      const baseSol = HL.solid(svg);
      HL.put(baseSol, basePrism);

      // Top rail
      const [topOuter, topInner] = HL.rings(-45, -18, 45, 18, 2, 1.5);
      const topPrism = HL.prism(P, front, topOuter, topInner, 40, 44);
      const topSol = HL.solid(svg);
      HL.put(topSol, topPrism);

      // Divider beam
      const [divO, divI] = HL.rings(-44, -4, 44, 4, 1, 1);
      const divPrism = HL.prism(P, front, divO, divI, 26, 29);
      const divSol = HL.solid(svg);
      HL.put(divSol, divPrism);

      // 3 Rods: x = -24, 0, 24
      const rods = [-24, 0, 24];
      rods.forEach(rx => {
        HL.mk("line", {
          x1: P(rx, 0, 4)[0], y1: P(rx, 0, 4)[1],
          x2: P(rx, 0, 40)[0], y2: P(rx, 0, 40)[1],
          stroke: "#232327", "stroke-width": 1
        }, svg);
      });

      // Upper beads (1 per rod, z starts at 35, slides down to 30 when active)
      // Lower beads (4 per rod, start at z = 6, 10, 14, 18, slide up to 24, 20, 16, 12)
      const beads = [
        // Rod 0 (Hundreds)
        { rx: -24, upper: true, val: 5, sp: HL.spring(0, { k: 140, c: 14 }) },
        { rx: -24, upper: false, idx: 0, val: 1, sp: HL.spring(1, { k: 140, c: 14 }) },
        { rx: -24, upper: false, idx: 1, val: 1, sp: HL.spring(0, { k: 140, c: 14 }) },
        // Rod 1 (Tens)
        { rx: 0, upper: true, val: 5, sp: HL.spring(1, { k: 140, c: 14 }) },
        { rx: 0, upper: false, idx: 0, val: 1, sp: HL.spring(1, { k: 140, c: 14 }) },
        { rx: 0, upper: false, idx: 1, val: 1, sp: HL.spring(1, { k: 140, c: 14 }) },
        // Rod 2 (Units)
        { rx: 24, upper: true, val: 5, sp: HL.spring(0, { k: 140, c: 14 }) },
        { rx: 24, upper: false, idx: 0, val: 1, sp: HL.spring(1, { k: 140, c: 14 }) },
        { rx: 24, upper: false, idx: 1, val: 1, sp: HL.spring(1, { k: 140, c: 14 }) },
        { rx: 24, upper: false, idx: 2, val: 1, sp: HL.spring(1, { k: 140, c: 14 }) },
      ];

      const beadSols = beads.map(() => HL.solid(svg));

      function draw() {
        let total = 0;
        beads.forEach((b, i) => {
          let z;
          if (b.upper) {
            z = HL.lerp(35, 30, b.sp.x);
            if (b.sp.x > 0.5) total += b.val * (b.rx === -24 ? 100 : b.rx === 0 ? 10 : 1);
          } else {
            const restZ = 6 + b.idx * 4;
            const actZ = 22 - (3 - b.idx) * 4;
            z = HL.lerp(restZ, actZ, b.sp.x);
            if (b.sp.x > 0.5) total += b.val * (b.rx === -24 ? 100 : b.rx === 0 ? 10 : 1);
          }
          const [cRing, cIn] = HL.rings(b.rx - 5, -5, b.rx + 5, 5, 2.5, 0.8);
          const pr = HL.prism(P, front, cRing, cIn, z, z + 3.5);
          HL.put(beadSols[i], pr);
        });
        read.textContent = "Số đếm: " + total;
      }

      function aim(pt) {
        if (!pt) return;
        const [u, v] = pt;
        // Pointer X determines which beads are active
        beads.forEach((b, idx) => {
          const ptScr = P(b.rx, 0, 20);
          const dist = Math.abs(u - ptScr[0]);
          if (dist < 22) {
            b.sp.t = v < ptScr[1] ? 1 : 0;
          }
        });
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        let moving = false;
        beads.forEach(b => { if (HL.stepS(b.sp, dt)) moving = true; });
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => {} }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) {
          beads.forEach((b, i) => { b.sp.t = (i % 2 === 0 ? v / 10 : 1 - v / 10); });
          reg.wake();
        },
        destroy: bag.dispose
      };
    }
  },

  // 2. Math Balance (Cân thăng bằng số học)
  {
    id: "math-balance",
    title: "2. Cân Thăng Bằng (Balance Scale)",
    means: "Cân thăng bằng so sánh khối lượng: đĩa trái có 3 khối, đĩa phải có 2 khối; di chuột để dịch chuyển trọng tâm.",
    rules: [1, 3, 4, 6, 7],
    range: [-15, 0, 15],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.8);
      HL.fit(C, [[-60, -20, 0], [60, 20, 60]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Base Pedestal
      const [baseO, baseI] = HL.rings(-25, -25, 25, 25, 4, 2);
      const baseSol = HL.solid(svg);
      HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 6));

      // Mast
      const [mastO, mastI] = HL.rings(-3, -3, 3, 3, 1, 0.5);
      const mastSol = HL.solid(svg);
      HL.put(mastSol, HL.prism(P, front, mastO, mastI, 6, 44));

      // Beam, Trays, Weights
      const beamSol = HL.solid(svg);
      const leftTraySol = HL.solid(svg);
      const rightTraySol = HL.solid(svg);
      const weightSols = [HL.solid(svg), HL.solid(svg), HL.solid(svg), HL.solid(svg), HL.solid(svg)];

      const tilt = HL.spring(-8, { k: 120, c: 14 }); // Initial left heavy: 3 > 2

      function draw() {
        const rad = HL.rad(tilt.x);
        const span = 46;
        const dz = Math.sin(rad) * span;
        const dx = Math.cos(rad) * span;

        // Beam
        const pL = [-dx, 0, 44 + dz];
        const pR = [dx, 0, 44 - dz];
        const [bO, bI] = HL.rings(-dx, -2, dx, 2, 1, 0.5);
        HL.put(beamSol, HL.prism(P, front, bO, bI, 42, 45));

        // Left Tray (suspended by 20 units)
        const leftTrayZ = pL[2] - 22;
        const [ltO, ltI] = HL.rings(pL[0] - 14, -14, pL[0] + 14, 14, 14, 1.2);
        HL.put(leftTraySol, HL.prism(P, front, ltO, ltI, leftTrayZ, leftTrayZ + 2));

        // Right Tray
        const rightTrayZ = pR[2] - 22;
        const [rtO, rtI] = HL.rings(pR[0] - 14, -14, pR[0] + 14, 14, 14, 1.2);
        HL.put(rightTraySol, HL.prism(P, front, rtO, rtI, rightTrayZ, rightTrayZ + 2));

        // 3 Weights on Left Tray (3 cubes)
        const w3_pos = [
          [pL[0] - 5, -4, leftTrayZ + 2],
          [pL[0] + 5, -4, leftTrayZ + 2],
          [pL[0], 4, leftTrayZ + 2]
        ];
        w3_pos.forEach((pos, idx) => {
          const [wO, wI] = HL.rings(pos[0] - 4, pos[1] - 4, pos[0] + 4, pos[1] + 4, 1, 0.5);
          HL.put(weightSols[idx], HL.prism(P, front, wO, wI, pos[2], pos[2] + 8));
        });

        // 2 Weights on Right Tray (2 cubes)
        const w2_pos = [
          [pR[0] - 4, 0, rightTrayZ + 2],
          [pR[0] + 4, 0, rightTrayZ + 2]
        ];
        w2_pos.forEach((pos, idx) => {
          const [wO, wI] = HL.rings(pos[0] - 4, pos[1] - 4, pos[0] + 4, pos[1] + 4, 1, 0.5);
          HL.put(weightSols[3 + idx], HL.prism(P, front, wO, wI, pos[2], pos[2] + 8));
        });

        if (tilt.x < -3) {
          read.textContent = "Bên trái nặng hơn: 3 > 2";
        } else if (tilt.x > 3) {
          read.textContent = "Bên phải nâng: 2 < 3";
        } else {
          read.textContent = "Thăng bằng: 3 = 3";
        }
      }

      function aim(pt) {
        if (!pt) { tilt.t = -8; reg.wake(); return; }
        // Pointer X controls balance shift
        const normalized = (pt[0] - 200) / 100;
        tilt.t = HL.clamp(normalized * 14, -14, 14);
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const moving = HL.stepS(tilt, dt);
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) { tilt.t = v; reg.wake(); },
        destroy: bag.dispose
      };
    }
  },

  // 3. Math Ten Frame (Khung 10 ô đếm chấm)
  {
    id: "math-ten-frame",
    title: "3. Khung 10 Ô (Ten Frame Counter)",
    means: "Khung 10 ô đếm số: gồm 2 hàng 5 cột; di chuột lướt qua để các hạt tròn nảy lên sinh động.",
    rules: [1, 2, 4, 7, 10],
    range: [1, 7, 10],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.8);
      HL.fit(C, [[-55, -24, 0], [55, 24, 30]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Frame Tray
      const [trayO, trayI] = HL.rings(-52, -22, 52, 22, 3, 1.5);
      const traySol = HL.solid(svg);
      HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 5));

      // 10 Tokens (2 rows of 5)
      // Row 0: y = 10, Row 1: y = -10
      // Cols: x = -40, -20, 0, 20, 40
      const tokens = [];
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 5; c++) {
          const active = (r === 0) || (r === 1 && c < 2); // 7 active tokens
          tokens.push({
            cx: -40 + c * 20,
            cy: r === 0 ? 10 : -10,
            active,
            lift: HL.spring(0, { k: 160, c: 15 }),
            sol: HL.solid(svg)
          });
        }
      }

      function draw() {
        tokens.forEach(tok => {
          if (tok.active) {
            const z = 5 + tok.lift.x;
            const [cO, cI] = HL.rings(tok.cx - 6, tok.cy - 6, tok.cx + 6, tok.cy + 6, 6, 0.8);
            HL.put(tok.sol, HL.prism(P, front, cO, cI, z, z + 3));
          } else {
            // Empty dashed outline
            const [cO, cI] = HL.rings(tok.cx - 6, tok.cy - 6, tok.cx + 6, tok.cy + 6, 6, 0.8);
            HL.put(tok.sol, HL.prism(P, front, cO, cI, 5, 5.5));
          }
        });
        read.textContent = "7 = 5 (hàng trên) + 2 (hàng dưới) · 3 ô trống";
      }

      function aim(pt) {
        if (!pt) return;
        tokens.forEach(tok => {
          if (!tok.active) return;
          const scr = P(tok.cx, tok.cy, 5);
          const dist = Math.hypot(pt[0] - scr[0], pt[1] - scr[1]);
          tok.lift.t = dist < 25 ? 12 : 0;
        });
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        let moving = false;
        tokens.forEach(t => { if (HL.stepS(t.lift, dt)) moving = true; });
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => { tokens.forEach(t => t.lift.t = 0); reg.wake(); } }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) {
          const count = Math.round(v);
          tokens.forEach((t, i) => { t.active = i < count; });
          draw();
        },
        destroy: bag.dispose
      };
    }
  },

  // 4. Math Number Blocks (Tháp khối Unifix 1-5)
  {
    id: "math-number-blocks",
    title: "4. Tháp Khối Số Học (Unifix Number Blocks)",
    means: "Tháp khối lập phương Unifix: 3 tháp độ cao 1, 3 và 5; di chuột làm tháp nén nhún theo lò xo đàn hồi.",
    rules: [1, 2, 3, 7, 9],
    range: [1, 3, 5],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-50, -15, 0], [50, 15, 80]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Base Grid Platter
      const [baseO, baseI] = HL.rings(-48, -16, 48, 16, 3, 1.5);
      const baseSol = HL.solid(svg);
      HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 3));

      // 3 Towers: Tower 1 (height 1), Tower 2 (height 3), Tower 3 (height 5)
      const towers = [
        { x: -32, count: 1, sp: HL.spring(1, { k: 130, c: 12 }), sols: [] },
        { x: 0, count: 3, sp: HL.spring(1, { k: 130, c: 12 }), sols: [] },
        { x: 32, count: 5, sp: HL.spring(1, { k: 130, c: 12 }), sols: [] }
      ];

      towers.forEach(t => {
        for (let i = 0; i < t.count; i++) {
          t.sols.push(HL.solid(svg)); // Block
          t.sols.push(HL.solid(svg)); // Pip
        }
      });

      function draw() {
        const blockH = 13;
        towers.forEach(t => {
          const compH = blockH * t.sp.x;
          let solIdx = 0;
          for (let i = 0; i < t.count; i++) {
            const z0 = 3 + i * compH;
            const z1 = z0 + compH;
            // Block
            const [bO, bI] = HL.rings(t.x - 9, -9, t.x + 9, 9, 2, 1);
            HL.put(t.sols[solIdx++], HL.prism(P, front, bO, bI, z0, z1));
            // Connector pip on top
            const [pO, pI] = HL.rings(t.x - 3.5, -3.5, t.x + 3.5, 3.5, 3.5, 0.6);
            HL.put(t.sols[solIdx++], HL.prism(P, front, pO, pI, z1, z1 + 2.5));
          }
        });
        read.textContent = "1 + 3 + 5 = 9 khối lập phương";
      }

      function aim(pt) {
        if (!pt) { towers.forEach(t => t.sp.t = 1); reg.wake(); return; }
        towers.forEach(t => {
          const scr = P(t.x, 0, 20);
          const dist = Math.abs(pt[0] - scr[0]);
          t.sp.t = dist < 28 ? 0.78 : 1;
        });
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        let moving = false;
        towers.forEach(t => { if (HL.stepS(t.sp, dt)) moving = true; });
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) {
          const factor = HL.clamp(v / 5, 0.7, 1);
          towers.forEach(t => t.sp.t = factor);
          reg.wake();
        },
        destroy: bag.dispose
      };
    }
  },

  // 5. Math Number Line (Thước đo trục số nhảy ếch)
  {
    id: "math-number-line",
    title: "5. Trục Số Nhảy Ếch (Number Line Jumps)",
    means: "Thước đo trục số: vạch chia từ 0 đến 10; điểm đếm nhảy theo đường cong parabol minh họa phép cộng 0 + 4 = 4; 4 + 3 = 7.",
    rules: [1, 3, 5, 7, 8],
    range: [0, 4, 10],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-58, -12, 0], [58, 12, 35]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Wooden Ruler
      const [rO, rI] = HL.rings(-54, -8, 54, 8, 2, 1);
      const rulerSol = HL.solid(svg);
      HL.put(rSol => HL.put(rulerSol, HL.prism(P, front, rO, rI, 0, 4)));

      // Tick marks 0 to 10
      const ticks = [];
      for (let i = 0; i <= 10; i++) {
        const x = -48 + i * 9.6;
        ticks.push(x);
        HL.mk("line", {
          x1: P(x, -7, 4)[0], y1: P(x, -7, 4)[1],
          x2: P(x, 7, 4)[0], y2: P(x, 7, 4)[1],
          stroke: "#232327", "stroke-width": 1
        }, svg);
      }

      // Parabolic jump arcs: 0->4 and 4->7
      // Arc 1: 0 -> 4
      const arc1Pts = [];
      for (let s = 0; s <= 20; s++) {
        const t = s / 20;
        const x = HL.lerp(ticks[0], ticks[4], t);
        const z = 4 + 4 * 18 * t * (1 - t);
        arc1Pts.push(P(x, 0, z));
      }
      HL.mk("path", { d: HL.open(arc1Pts), stroke: "#6f6f78", "stroke-dasharray": "3 2", fill: "none", "stroke-width": 1.2 }, svg);

      // Arc 2: 4 -> 7
      const arc2Pts = [];
      for (let s = 0; s <= 20; s++) {
        const t = s / 20;
        const x = HL.lerp(ticks[4], ticks[7], t);
        const z = 4 + 4 * 14 * t * (1 - t);
        arc2Pts.push(P(x, 0, z));
      }
      HL.mk("path", { d: HL.open(arc2Pts), stroke: "#6f6f78", "stroke-dasharray": "3 2", fill: "none", "stroke-width": 1.2 }, svg);

      // Jumping Token
      const jumperSol = HL.solid(svg);
      const jumpProgress = HL.spring(0.5, { k: 100, c: 14 });

      function draw() {
        const t = jumpProgress.x; // 0 -> 1 along the path
        let x, z;
        if (t <= 0.57) {
          const subT = t / 0.57;
          x = HL.lerp(ticks[0], ticks[4], subT);
          z = 4 + 4 * 18 * subT * (1 - subT);
        } else {
          const subT = (t - 0.57) / 0.43;
          x = HL.lerp(ticks[4], ticks[7], subT);
          z = 4 + 4 * 14 * subT * (1 - subT);
        }
        const [jO, jI] = HL.rings(x - 4, -4, x + 4, 4, 4, 0.6);
        HL.put(jumperSol, HL.prism(P, front, jO, jI, z, z + 3));

        const curVal = Math.round(t <= 0.57 ? (t / 0.57) * 4 : 4 + ((t - 0.57) / 0.43) * 3);
        read.textContent = "Bước nhảy: 0 + 4 = 4; 4 + 3 = 7 (Vị trí: " + curVal + ")";
      }

      function aim(pt) {
        if (!pt) return;
        const scr0 = P(ticks[0], 0, 4)[0];
        const scr7 = P(ticks[7], 0, 4)[0];
        const t = HL.clamp((pt[0] - scr0) / (scr7 - scr0), 0, 1);
        jumpProgress.t = t;
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const moving = HL.stepS(jumpProgress, dt);
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => {} }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) { jumpProgress.t = HL.clamp(v / 7, 0, 1); reg.wake(); },
        destroy: bag.dispose
      };
    }
  },

  // 6. Math Dice (Cặp xúc xắc chấm tròn)
  {
    id: "math-dice",
    title: "6. Cặp Xúc Xắc (Math Dice Pips)",
    means: "Hai khối xúc xắc lập phương: mặt trên hiển thị 3 chấm và 4 chấm; di chuột để xúc xắc nghiêng xoay theo góc nhìn 3D.",
    rules: [1, 2, 4, 6, 9],
    range: [0, 3.5, 7],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-45, -20, 0], [45, 20, 36]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Dice Felt Mat
      const [matO, matI] = HL.rings(-42, -18, 42, 18, 4, 1.5);
      const matSol = HL.solid(svg);
      HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2));

      // Die 1 (Left: 3 pips on top)
      // Die 2 (Right: 4 pips on top)
      const die1Sol = HL.solid(svg);
      const die2Sol = HL.solid(svg);
      const tilt1 = HL.spring(0, { k: 140, c: 14 });
      const tilt2 = HL.spring(0, { k: 140, c: 14 });

      // Pips containers
      const pips = [];
      for (let i = 0; i < 7; i++) pips.push(HL.mk("circle", { r: 1.6, fill: "#232327" }, svg));

      function draw() {
        const z1 = 2 + tilt1.x;
        const z2 = 2 + tilt2.x;

        // Die 1
        const [d1O, d1I] = HL.rings(-32, -10, -12, 10, 2, 1);
        HL.put(die1Sol, HL.prism(P, front, d1O, d1I, z1, z1 + 20));

        // Die 2
        const [d2O, d2I] = HL.rings(12, -10, 32, 10, 2, 1);
        HL.put(die2Sol, HL.prism(P, front, d2O, d2I, z2, z2 + 20));

        // Die 1: 3 pips on diagonal of top face (z = z1 + 20)
        const topZ1 = z1 + 20.2;
        const d1_pips = [
          P(-27, -5, topZ1),
          P(-22, 0, topZ1),
          P(-17, 5, topZ1)
        ];
        d1_pips.forEach((pt, i) => {
          pips[i].setAttribute("cx", pt[0]);
          pips[i].setAttribute("cy", pt[1]);
        });

        // Die 2: 4 pips on 4 corners of top face (z = z2 + 20)
        const topZ2 = z2 + 20.2;
        const d2_pips = [
          P(17, -5, topZ2),
          P(27, -5, topZ2),
          P(17, 5, topZ2),
          P(27, 5, topZ2)
        ];
        d2_pips.forEach((pt, i) => {
          pips[3 + i].setAttribute("cx", pt[0]);
          pips[3 + i].setAttribute("cy", pt[1]);
        });

        read.textContent = "Mặt trên: 3 + 4 = 7 chấm tròn";
      }

      function aim(pt) {
        if (!pt) { tilt1.t = 0; tilt2.t = 0; reg.wake(); return; }
        const p1Scr = P(-22, 0, 10)[0];
        const p2Scr = P(22, 0, 10)[0];
        tilt1.t = Math.abs(pt[0] - p1Scr) < 25 ? 4 : 0;
        tilt2.t = Math.abs(pt[0] - p2Scr) < 25 ? 4 : 0;
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const m1 = HL.stepS(tilt1, dt);
        const m2 = HL.stepS(tilt2, dt);
        draw();
        return m1 || m2;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) { tilt1.t = v; tilt2.t = v * 0.8; reg.wake(); },
        destroy: bag.dispose
      };
    }
  },

  // 7. Math Clock (Đồng hồ học giờ 12:1)
  {
    id: "math-clock",
    title: "7. Mặt Đồng Hồ Học Giờ (Teaching Clock)",
    means: "Đồng hồ kim: di chuột theo vòng tròn để quay kim phút; kim giờ chuyển động chính xác theo tỷ lệ bánh răng 12:1.",
    rules: [1, 2, 4, 6, 8],
    range: [0, 6, 12],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-45, -45, 0], [45, 45, 16]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Bezel Base
      const [dialO, dialI] = HL.rings(-42, -42, 42, 42, 42, 3);
      const bezelSol = HL.solid(svg);
      HL.put(bezelSol, HL.prism(P, front, dialO, dialI, 0, 6));

      // 12 Hour Ticks
      for (let h = 0; h < 12; h++) {
        const ang = (h / 12) * Math.PI * 2 - Math.PI / 2;
        const r1 = 32, r2 = 38;
        const x1 = Math.cos(ang) * r1, y1 = Math.sin(ang) * r1;
        const x2 = Math.cos(ang) * r2, y2 = Math.sin(ang) * r2;
        HL.mk("line", {
          x1: P(x1, y1, 6)[0], y1: P(x1, y1, 6)[1],
          x2: P(x2, y2, 6)[0], y2: P(x2, y2, 6)[1],
          stroke: "#232327", "stroke-width": h % 3 === 0 ? 1.5 : 1
        }, svg);
      }

      // Hands
      const minuteLine = HL.mk("line", { stroke: "#232327", "stroke-width": 1.5 }, svg);
      const hourLine = HL.mk("line", { stroke: "#232327", "stroke-width": 2.5 }, svg);
      const centerPin = HL.mk("circle", { r: 3, fill: "#232327" }, svg);
      const pinPt = P(0, 0, 8);
      centerPin.setAttribute("cx", pinPt[0]);
      centerPin.setAttribute("cy", pinPt[1]);

      const angleSp = HL.spring(Math.PI * 0.5, { k: 100, c: 14 }); // Initial 3:00

      function draw() {
        const minAng = angleSp.x;
        const hourAng = minAng / 12 + Math.PI * 0.5; // Offset to start at 3:00

        // Minute hand tip
        const mLen = 30;
        const mx = Math.cos(minAng) * mLen, my = Math.sin(minAng) * mLen;
        const mPt = P(mx, my, 7.5);
        minuteLine.setAttribute("x1", pinPt[0]);
        minuteLine.setAttribute("y1", pinPt[1]);
        minuteLine.setAttribute("x2", mPt[0]);
        minuteLine.setAttribute("y2", mPt[1]);

        // Hour hand tip
        const hLen = 20;
        const hx = Math.cos(hourAng) * hLen, hy = Math.sin(hourAng) * hLen;
        const hPt = P(hx, hy, 7);
        hourLine.setAttribute("x1", pinPt[0]);
        hourLine.setAttribute("y1", pinPt[1]);
        hourLine.setAttribute("x2", hPt[0]);
        hourLine.setAttribute("y2", hPt[1]);

        // Calculate hours and minutes for readout
        let normMin = (minAng + Math.PI / 2) % (Math.PI * 2);
        if (normMin < 0) normMin += Math.PI * 2;
        const mins = Math.round((normMin / (Math.PI * 2)) * 60) % 60;
        const hrs = 3 + Math.floor(minAng / (Math.PI * 2));
        read.textContent = \`Đồng hồ: \${((hrs - 1) % 12) + 1}:\${String(mins).padStart(2, "0")}\`;
      }

      function aim(pt) {
        if (!pt) return;
        const dx = pt[0] - pinPt[0];
        const dy = (pt[1] - pinPt[1]) * 2; // Compensate for 2:1 axonometric compression
        const ang = Math.atan2(dy, dx);
        angleSp.t = ang;
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const moving = HL.stepS(angleSp, dt);
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => {} }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) { angleSp.t = (v / 12) * Math.PI * 2; reg.wake(); },
        destroy: bag.dispose
      };
    }
  },

  // 8. Math Shapes (Bộ 3 khối hình học: Hộp, Trụ, Nón)
  {
    id: "math-shapes",
    title: "8. Khối Hình Không Gian (3D Geometric Solids)",
    means: "Ba khối hình học cơ bản: Khối lập phương, Khối trụ và Khối nón; di chuột nâng từng khối lên để lộ hình phẳng đáy 2D.",
    rules: [1, 2, 4, 7, 9],
    range: [0, 10, 20],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.8);
      HL.fit(C, [[-55, -20, 0], [55, 20, 45]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Base Grid Plane
      const [gridO, gridI] = HL.rings(-52, -18, 52, 18, 2, 1);
      const gridSol = HL.solid(svg);
      HL.put(gridSol, HL.prism(P, front, gridO, gridI, 0, 2));

      // 2D Footprints on base (dashed paths)
      // Cube footprint: Square at x = -36
      const sqPts = [P(-48, -12, 2.2), P(-24, -12, 2.2), P(-24, 12, 2.2), P(-48, 12, 2.2)];
      HL.mk("polygon", { points: sqPts.map(p => p.join(",")).join(" "), stroke: "#6f6f78", "stroke-dasharray": "2 2", fill: "none" }, svg);

      // Cylinder footprint: Circle at x = 0
      const circPts = [];
      for (let a = 0; a <= 24; a++) {
        const rad = (a / 24) * Math.PI * 2;
        circPts.push(P(Math.cos(rad) * 12, Math.sin(rad) * 12, 2.2));
      }
      HL.mk("polygon", { points: circPts.map(p => p.join(",")).join(" "), stroke: "#6f6f78", "stroke-dasharray": "2 2", fill: "none" }, svg);

      // Cone footprint: Circle at x = 36
      const conePts = [];
      for (let a = 0; a <= 24; a++) {
        const rad = (a / 24) * Math.PI * 2;
        conePts.push(P(36 + Math.cos(rad) * 12, Math.sin(rad) * 12, 2.2));
      }
      HL.mk("polygon", { points: conePts.map(p => p.join(",")).join(" "), stroke: "#6f6f78", "stroke-dasharray": "2 2", fill: "none" }, svg);

      // 3 Shapes Solids
      const cubeSol = HL.solid(svg);
      const cylSol = HL.solid(svg);
      const coneSol = HL.solid(svg);

      const lift1 = HL.spring(0, { k: 130, c: 14 });
      const lift2 = HL.spring(0, { k: 130, c: 14 });
      const lift3 = HL.spring(0, { k: 130, c: 14 });

      function draw() {
        // 1. Cube at x = -36
        const z1 = 2 + lift1.x;
        const [cO, cI] = HL.rings(-48, -12, -24, 12, 2, 1);
        HL.put(cubeSol, HL.prism(P, front, cO, cI, z1, z1 + 24));

        // 2. Cylinder at x = 0
        const z2 = 2 + lift2.x;
        const [cyO, cyI] = HL.rings(-12, -12, 12, 12, 12, 1);
        HL.put(cylSol, HL.prism(P, front, cyO, cyI, z2, z2 + 24));

        // 3. Cone at x = 36
        const z3 = 2 + lift3.x;
        const [cnO, cnI] = HL.rings(24, -12, 48, 12, 12, 1);
        HL.put(coneSol, HL.prism(P, front, cnO, cnI, z3, z3 + 4));
        // Cone apex lines
        const apexPt = P(36, 0, z3 + 26);
        const lBase = P(24, 0, z3);
        const rBase = P(48, 0, z3);
        HL.mk("line", { x1: lBase[0], y1: lBase[1], x2: apexPt[0], y2: apexPt[1], stroke: "#232327", "stroke-width": 1 }, svg);
        HL.mk("line", { x1: rBase[0], y1: rBase[1], x2: apexPt[0], y2: apexPt[1], stroke: "#232327", "stroke-width": 1 }, svg);

        read.textContent = "Khối Lập Phương (Đáy Vuông) · Khối Trụ (Đáy Tròn) · Khối Nón";
      }

      function aim(pt) {
        if (!pt) { lift1.t = 0; lift2.t = 0; lift3.t = 0; reg.wake(); return; }
        const s1 = P(-36, 0, 10)[0];
        const s2 = P(0, 0, 10)[0];
        const s3 = P(36, 0, 10)[0];
        lift1.t = Math.abs(pt[0] - s1) < 24 ? 18 : 0;
        lift2.t = Math.abs(pt[0] - s2) < 24 ? 18 : 0;
        lift3.t = Math.abs(pt[0] - s3) < 24 ? 18 : 0;
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const m1 = HL.stepS(lift1, dt);
        const m2 = HL.stepS(lift2, dt);
        const m3 = HL.stepS(lift3, dt);
        draw();
        return m1 || m2 || m3;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) { lift1.t = v; lift2.t = v; lift3.t = v; reg.wake(); },
        destroy: bag.dispose
      };
    }
  },

  // 9. Math Fraction Pie (Đĩa phân số 1/4)
  {
    id: "math-fraction-pie",
    title: "9. Đĩa Phân Số 1/4 (Fraction Wheel)",
    means: "Đĩa tròn phân số chia 4 phần bằng nhau: di chuột làm 4 miếng bánh tách rời hướng tâm, minh họa 1/4 + 1/4 + 1/4 + 1/4 = 1.",
    rules: [1, 2, 4, 7, 8],
    range: [0, 8, 16],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-45, -45, 0], [45, 45, 20]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Base Tray
      const [trayO, trayI] = HL.rings(-44, -44, 44, 44, 44, 2);
      const traySol = HL.solid(svg);
      HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 3));

      // 4 Quadrant Slices
      const quarters = [
        { dx: 1, dy: 1, sol: HL.solid(svg) },
        { dx: -1, dy: 1, sol: HL.solid(svg) },
        { dx: -1, dy: -1, sol: HL.solid(svg) },
        { dx: 1, dy: -1, sol: HL.solid(svg) }
      ];

      const explode = HL.spring(0, { k: 120, c: 14 });

      function draw() {
        const d = explode.x;
        quarters.forEach((q, idx) => {
          const cx = q.dx * (16 + d);
          const cy = q.dy * (16 + d);
          const [qO, qI] = HL.rings(cx - 15, cy - 15, cx + 15, cy + 15, 15, 1.2);
          HL.put(q.sol, HL.prism(P, front, qO, qI, 3, 11));
        });
        read.textContent = "Phân số: 1/4 + 1/4 + 1/4 + 1/4 = 1 hình tròn";
      }

      function aim(pt) {
        if (!pt) { explode.t = 0; reg.wake(); return; }
        const center = P(0, 0, 5);
        const dist = Math.hypot(pt[0] - center[0], pt[1] - center[1]);
        explode.t = HL.clamp((1 - dist / 80) * 12, 0, 12);
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const moving = HL.stepS(explode, dt);
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) { explode.t = v; reg.wake(); },
        destroy: bag.dispose
      };
    }
  },

  // 10. Math Bead String (Chuỗi 10 hạt đếm trên cung uốn)
  {
    id: "math-bead-string",
    title: "10. Chuỗi 10 Hạt Đếm (Counting Bead String)",
    means: "Chuỗi 10 hạt đếm trên thanh uốn cong: 5 hạt đậm và 5 hạt nhạt; di chuột chia tách số 10 thành các cặp phép cộng (7 + 3, 6 + 4, 8 + 2).",
    rules: [1, 2, 3, 7, 10],
    range: [0, 5, 10],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-58, -16, 0], [58, 16, 45]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Wooden Base
      const [bO, bI] = HL.rings(-52, -14, 52, 14, 3, 1.5);
      const baseSol = HL.solid(svg);
      HL.put(baseSol, HL.prism(P, front, bO, bI, 0, 4));

      // Guide Wire (Arched Parabola)
      const wirePts = [];
      for (let s = 0; s <= 30; s++) {
        const t = s / 30;
        const x = HL.lerp(-44, 44, t);
        const z = 4 + 4 * 34 * t * (1 - t);
        wirePts.push(P(x, 0, z));
      }
      HL.mk("path", { d: HL.open(wirePts), stroke: "#232327", fill: "none", "stroke-width": 1.2 }, svg);

      // 10 Beads (5 dark group, 5 light group)
      const beads = [];
      for (let i = 0; i < 10; i++) {
        beads.push({
          idx: i,
          dark: i < 5,
          tSp: HL.spring(i / 9, { k: 120, c: 14 }),
          sol: HL.solid(svg)
        });
      }

      function draw() {
        beads.forEach(b => {
          const t = b.tSp.x;
          const x = HL.lerp(-44, 44, t);
          const z = 4 + 4 * 34 * t * (1 - t);
          const [bO, bI] = HL.rings(x - 3.8, -3.8, x + 3.8, 3.8, 3.8, 0.7);
          HL.put(b.sol, HL.prism(P, front, bO, bI, z, z + 5));
        });

        // Compute count groups based on gap between beads
        const leftCount = beads.filter(b => b.tSp.x < 0.5).length;
        const rightCount = 10 - leftCount;
        read.textContent = \`Tách gộp số 10: \${leftCount} + \${rightCount} = 10\`;
      }

      function aim(pt) {
        if (!pt) return;
        const scrLeft = P(-44, 0, 4)[0];
        const scrRight = P(44, 0, 4)[0];
        const norm = HL.clamp((pt[0] - scrLeft) / (scrRight - scrLeft), 0.1, 0.9);
        const splitIdx = Math.round(norm * 10);

        beads.forEach((b, i) => {
          if (i < splitIdx) {
            b.tSp.t = (i / (splitIdx || 1)) * (norm - 0.08);
          } else {
            const rightTotal = 10 - splitIdx;
            const subIdx = i - splitIdx;
            b.tSp.t = (norm + 0.08) + (subIdx / (rightTotal || 1)) * (1 - (norm + 0.08));
          }
        });
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        let moving = false;
        beads.forEach(b => { if (HL.stepS(b.tSp, dt)) moving = true; });
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => {} }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) {
          const split = Math.round(v);
          beads.forEach((b, i) => {
            b.tSp.t = i < split ? (i / split) * 0.4 : 0.6 + ((i - split) / (10 - split)) * 0.4;
          });
          reg.wake();
        },
        destroy: bag.dispose
      };
    }
  }
];

// App Controller & View Logic
(() => {
  const $ = id => document.getElementById(id);
  const navTabs = $("nav-tabs");
  const stage = $("stage");
  const slider = $("intensity");
  const valOut = $("value");
  const nameEl = $("name");
  const readEl = $("read");
  const metaTitle = $("meta-title");
  const metaDesc = $("meta-desc");
  const metaRule = $("meta-rule");
  const singleView = $("single-view");
  const galleryView = $("gallery-view");

  let currentIndex = 0;
  let currentHandle = null;
  let isGalleryMode = false;

  const readBridge = {
    get textContent() { return readEl.textContent; },
    set textContent(v) { readEl.textContent = v; }
  };

  function renderTabs() {
    navTabs.innerHTML = "";
    MATH_FIGURES.forEach((fig, idx) => {
      const btn = document.createElement("button");
      btn.className = "nav-btn" + (idx === currentIndex && !isGalleryMode ? " active" : "");
      btn.textContent = fig.title.split(" (")[0];
      btn.onclick = () => switchTo(idx);
      navTabs.appendChild(btn);
    });

    const galleryBtn = document.createElement("button");
    galleryBtn.className = "nav-btn view-mode-toggle" + (isGalleryMode ? " active" : "");
    galleryBtn.textContent = isGalleryMode ? "Tập Trung (Focus)" : "Xem Cả 10 Hình (Gallery)";
    galleryBtn.onclick = toggleGalleryMode;
    navTabs.appendChild(galleryBtn);
  }

  function switchTo(idx) {
    isGalleryMode = false;
    galleryView.hidden = true;
    singleView.hidden = false;
    currentIndex = idx;
    renderTabs();

    if (currentHandle) {
      currentHandle.destroy();
      currentHandle = null;
    }
    stage.replaceChildren();

    const fig = MATH_FIGURES[idx];
    nameEl.textContent = fig.id;
    metaTitle.textContent = fig.title;
    metaDesc.textContent = fig.means;
    metaRule.textContent = "Quy tắc Hairline: " + fig.rules.join(" · ");

    slider.min = fig.range[0];
    slider.max = fig.range[2];
    slider.value = fig.range[1];
    valOut.textContent = String(fig.range[1]);

    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    currentHandle = fig.mount({ stage, svg, read: readBridge }, fig.range[1]);
  }

  function toggleGalleryMode() {
    isGalleryMode = !isGalleryMode;
    if (isGalleryMode) {
      if (currentHandle) { currentHandle.destroy(); currentHandle = null; }
      singleView.hidden = true;
      galleryView.hidden = false;
      renderTabs();
      buildGallery();
    } else {
      switchTo(currentIndex);
    }
  }

  function buildGallery() {
    galleryView.innerHTML = "";
    MATH_FIGURES.forEach((fig, idx) => {
      const card = document.createElement("div");
      card.className = "grid-card";
      card.innerHTML = \`
        <div class="grid-stage" id="gstage-\${idx}"></div>
        <div class="grid-meta">
          <div class="grid-name">\${fig.title}</div>
          <div class="grid-desc">\${fig.means}</div>
        </div>
      \`;
      card.onclick = () => switchTo(idx);
      galleryView.appendChild(card);

      const gStage = card.querySelector(\`#gstage-\${idx}\`);
      const gSvg = HL.mk("svg", { viewBox: "0 0 400 300", "aria-hidden": "true" }, gStage);
      const dummyRead = { textContent: "" };
      fig.mount({ stage: gStage, svg: gSvg, read: dummyRead }, fig.range[1]);
    });
  }

  slider.oninput = () => {
    valOut.textContent = slider.value;
    if (currentHandle) currentHandle.set(Number(slider.value));
  };

  $("btn-prev").onclick = () => {
    switchTo((currentIndex - 1 + MATH_FIGURES.length) % MATH_FIGURES.length);
  };
  $("btn-next").onclick = () => {
    switchTo((currentIndex + 1) % MATH_FIGURES.length);
  };

  // Keyboard navigation
  window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") $("btn-prev").click();
    if (e.key === "ArrowRight") $("btn-next").click();
    if (e.key >= "1" && e.key <= "9") switchTo(Number(e.key) - 1);
    if (e.key === "0") switchTo(9);
  });

  // Init
  switchTo(0);
})();
</script>
</body>
</html>
`;

writeFileSync(path.join(ROOT, 'playground/math-grade1.html'), html);
console.log('Saved playground/math-grade1.html');
`;

writeFileSync(path.join(ROOT, 'scripts/build-math-grade1-suite.mjs'), script);
console.log('Created scripts/build-math-grade1-suite.mjs');
