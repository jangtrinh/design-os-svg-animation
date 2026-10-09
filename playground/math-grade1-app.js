/*
 * 10 Grade 1 Math Figures Definitions (Hairline 2:1 Axonometric Standard)
 */

// Inject Hairline CSS into document immediately
if (typeof HL !== "undefined" && HL.inject) {
  HL.inject(document);
}

const MATH_FIGURES = [
  // 1. Math Abacus (Bàn tính Soroban đếm số)
  {
    id: "math-abacus",
    title: "1. Bàn Tính Đếm Hạt (Soroban Abacus)",
    concept: "Cộng trừ trong phạm vi 10 & 100",
    means: "Bàn tính đếm hạt: di chuột để trượt các hạt tính dọc theo trục sắt, hạt trên = 5, mỗi hạt dưới = 1.",
    rules: [1, 2, 3, 5, 8],
    range: [0, 5, 10],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-50, -18, 0], [50, 18, 44]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Wooden Frame
      // Base rail
      const [baseO, baseI] = HL.rings(-46, -14, 46, 14, 2, 1);
      const baseSol = HL.solid(svg);
      HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 4));

      // Left post
      const [lpO, lpI] = HL.rings(-46, -14, -40, 14, 2, 1);
      const lpSol = HL.solid(svg);
      HL.put(lpSol, HL.prism(P, front, lpO, lpI, 4, 38));

      // Right post
      const [rpO, rpI] = HL.rings(40, -14, 46, 14, 2, 1);
      const rpSol = HL.solid(svg);
      HL.put(rpSol, HL.prism(P, front, rpO, rpI, 4, 38));

      // Top rail
      const [topO, topI] = HL.rings(-46, -14, 46, 14, 2, 1);
      const topSol = HL.solid(svg);
      HL.put(topSol, HL.prism(P, front, topO, topI, 38, 42));

      // Divider beam
      const [divO, divI] = HL.rings(-40, -6, 40, 6, 1, 0.8);
      const divSol = HL.solid(svg);
      HL.put(divSol, HL.prism(P, front, divO, divI, 24, 27));

      // 3 Steel Rods: x = -22, 0, 22
      const rods = [-22, 0, 22];
      rods.forEach(rx => {
        HL.mk("line", {
          x1: P(rx, 0, 4)[0], y1: P(rx, 0, 4)[1],
          x2: P(rx, 0, 38)[0], y2: P(rx, 0, 38)[1],
          stroke: "#232327", "stroke-width": 1.2
        }, svg);
      });

      // Upper beads (1 per rod, value 5)
      // Lower beads (4 per rod, value 1 each)
      const beads = [
        // Rod 0 (Hundreds)
        { rx: -22, upper: true, val: 5, mult: 100, sp: HL.spring(0, { k: 140, c: 14 }) },
        { rx: -22, upper: false, idx: 0, val: 1, mult: 100, sp: HL.spring(1, { k: 140, c: 14 }) },
        { rx: -22, upper: false, idx: 1, val: 1, mult: 100, sp: HL.spring(0, { k: 140, c: 14 }) },
        // Rod 1 (Tens)
        { rx: 0, upper: true, val: 5, mult: 10, sp: HL.spring(1, { k: 140, c: 14 }) },
        { rx: 0, upper: false, idx: 0, val: 1, mult: 10, sp: HL.spring(1, { k: 140, c: 14 }) },
        { rx: 0, upper: false, idx: 1, val: 1, mult: 10, sp: HL.spring(1, { k: 140, c: 14 }) },
        // Rod 2 (Units)
        { rx: 22, upper: true, val: 5, mult: 1, sp: HL.spring(0, { k: 140, c: 14 }) },
        { rx: 22, upper: false, idx: 0, val: 1, mult: 1, sp: HL.spring(1, { k: 140, c: 14 }) },
        { rx: 22, upper: false, idx: 1, val: 1, mult: 1, sp: HL.spring(1, { k: 140, c: 14 }) },
        { rx: 22, upper: false, idx: 2, val: 1, mult: 1, sp: HL.spring(1, { k: 140, c: 14 }) },
      ];

      const beadSols = beads.map(() => HL.solid(svg));

      function draw() {
        let total = 0;
        beads.forEach((b, i) => {
          let z;
          if (b.upper) {
            z = HL.lerp(33, 27.5, b.sp.x);
            if (b.sp.x > 0.5) total += b.val * b.mult;
          } else {
            const restZ = 4.5 + b.idx * 3.8;
            const actZ = 20 - (3 - b.idx) * 3.8;
            z = HL.lerp(restZ, actZ, b.sp.x);
            if (b.sp.x > 0.5) total += b.val * b.mult;
          }
          const [cRing, cIn] = HL.rings(b.rx - 5, -5, b.rx + 5, 5, 5, 0.8);
          const pr = HL.prism(P, front, cRing, cIn, z, z + 3.2);
          HL.put(beadSols[i], pr);
        });
        read.textContent = "Số đếm: " + total;
      }

      function aim(pt) {
        if (!pt) return;
        const [u, v] = pt;
        beads.forEach(b => {
          const ptScr = P(b.rx, 0, 20);
          const dist = Math.abs(u - ptScr[0]);
          if (dist < 20) {
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
    concept: "So sánh lớn hơn, bé hơn, bằng nhau",
    means: "Cân thăng bằng so sánh khối lượng: đĩa trái có 3 khối, đĩa phải có 2 khối; di chuột để dịch chuyển trọng tâm.",
    rules: [1, 3, 4, 6, 7],
    range: [-15, 0, 15],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.8);
      HL.fit(C, [[-60, -20, 0], [60, 20, 60]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Base Pedestal
      const [baseO, baseI] = HL.rings(-24, -20, 24, 20, 4, 2);
      const baseSol = HL.solid(svg);
      HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 6));

      // Triangular Fulcrum Post
      const [mastO, mastI] = HL.rings(-4, -4, 4, 4, 4, 0.8);
      const mastSol = HL.solid(svg);
      HL.put(mastSol, HL.prism(P, front, mastO, mastI, 6, 42));

      // Beam, Trays, Weights
      const beamPath = HL.mk("polygon", { fill: "#ffffff", stroke: "#232327", "stroke-width": 1.2 }, svg);
      const leftCord = HL.mk("line", { stroke: "#232327", "stroke-width": 1 }, svg);
      const rightCord = HL.mk("line", { stroke: "#232327", "stroke-width": 1 }, svg);
      const leftTraySol = HL.solid(svg);
      const rightTraySol = HL.solid(svg);
      const weightSols = [HL.solid(svg), HL.solid(svg), HL.solid(svg), HL.solid(svg), HL.solid(svg)];

      const tilt = HL.spring(-8, { k: 120, c: 14 });

      function draw() {
        const rad = HL.rad(tilt.x);
        const span = 46;
        const dz = Math.sin(rad) * span;
        const dx = Math.cos(rad) * span;

        // Beam polygon
        const pL = [-dx, 0, 42 + dz];
        const pR = [dx, 0, 42 - dz];
        const pts = [
          P(-dx, -2, 42 + dz),
          P(dx, -2, 42 - dz),
          P(dx, 2, 42 - dz),
          P(-dx, 2, 42 + dz)
        ];
        beamPath.setAttribute("points", pts.map(p => p.join(",")).join(" "));

        // Left Tray suspended
        const leftTrayZ = pL[2] - 22;
        leftCord.setAttribute("x1", P(pL[0], 0, pL[2])[0]);
        leftCord.setAttribute("y1", P(pL[0], 0, pL[2])[1]);
        leftCord.setAttribute("x2", P(pL[0], 0, leftTrayZ + 2)[0]);
        leftCord.setAttribute("y2", P(pL[0], 0, leftTrayZ + 2)[1]);

        const [ltO, ltI] = HL.rings(pL[0] - 14, -14, pL[0] + 14, 14, 14, 1.2);
        HL.put(leftTraySol, HL.prism(P, front, ltO, ltI, leftTrayZ, leftTrayZ + 2));

        // Right Tray suspended
        const rightTrayZ = pR[2] - 22;
        rightCord.setAttribute("x1", P(pR[0], 0, pR[2])[0]);
        rightCord.setAttribute("y1", P(pR[0], 0, pR[2])[1]);
        rightCord.setAttribute("x2", P(pR[0], 0, rightTrayZ + 2)[0]);
        rightCord.setAttribute("y2", P(pR[0], 0, rightTrayZ + 2)[1]);

        const [rtO, rtI] = HL.rings(pR[0] - 14, -14, pR[0] + 14, 14, 14, 1.2);
        HL.put(rightTraySol, HL.prism(P, front, rtO, rtI, rightTrayZ, rightTrayZ + 2));

        // 3 Weights on Left Tray
        const w3_pos = [
          [pL[0] - 5, -4, leftTrayZ + 2],
          [pL[0] + 5, -4, leftTrayZ + 2],
          [pL[0], 4, leftTrayZ + 2]
        ];
        w3_pos.forEach((pos, idx) => {
          const [wO, wI] = HL.rings(pos[0] - 4, pos[1] - 4, pos[0] + 4, pos[1] + 4, 1, 0.5);
          HL.put(weightSols[idx], HL.prism(P, front, wO, wI, pos[2], pos[2] + 7));
        });

        // 2 Weights on Right Tray
        const w2_pos = [
          [pR[0] - 4, 0, rightTrayZ + 2],
          [pR[0] + 4, 0, rightTrayZ + 2]
        ];
        w2_pos.forEach((pos, idx) => {
          const [wO, wI] = HL.rings(pos[0] - 4, pos[1] - 4, pos[0] + 4, pos[1] + 4, 1, 0.5);
          HL.put(weightSols[3 + idx], HL.prism(P, front, wO, wI, pos[2], pos[2] + 7));
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
    concept: "Cấu trúc số 10 cơ số mười",
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

      // Grid dividers
      for (let c = 1; c < 5; c++) {
        const x = -50 + c * 20;
        HL.mk("line", {
          x1: P(x, -20, 5.1)[0], y1: P(x, -20, 5.1)[1],
          x2: P(x, 20, 5.1)[0], y2: P(x, 20, 5.1)[1],
          stroke: "#e0e0e4", "stroke-width": 1
        }, svg);
      }
      HL.mk("line", {
        x1: P(-50, 0, 5.1)[0], y1: P(-50, 0, 5.1)[1],
        x2: P(50, 0, 5.1)[0], y2: P(50, 0, 5.1)[1],
        stroke: "#e0e0e4", "stroke-width": 1
      }, svg);

      // 10 Tokens
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
            const z = 5.2 + tok.lift.x;
            const [cO, cI] = HL.rings(tok.cx - 6, tok.cy - 6, tok.cx + 6, tok.cy + 6, 6, 0.8);
            HL.put(tok.sol, HL.prism(P, front, cO, cI, z, z + 3));
          } else {
            const [cO, cI] = HL.rings(tok.cx - 6, tok.cy - 6, tok.cx + 6, tok.cy + 6, 6, 0.8);
            HL.put(tok.sol, HL.prism(P, front, cO, cI, 5.1, 5.3));
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
          tok.lift.t = dist < 24 ? 12 : 0;
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
    concept: "Thứ tự số tự nhiên & chiều cao",
    means: "Tháp khối lập phương Unifix: 3 tháp độ cao 1, 3 và 5; di chuột làm tháp nén nhún theo lò xo đàn hồi.",
    rules: [1, 2, 3, 7, 9],
    range: [1, 3, 5],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-50, -15, 0], [50, 15, 80]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      const [baseO, baseI] = HL.rings(-48, -16, 48, 16, 3, 1.5);
      const baseSol = HL.solid(svg);
      HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 3));

      const towers = [
        { x: -32, count: 1, sp: HL.spring(1, { k: 130, c: 12 }), sols: [] },
        { x: 0, count: 3, sp: HL.spring(1, { k: 130, c: 12 }), sols: [] },
        { x: 32, count: 5, sp: HL.spring(1, { k: 130, c: 12 }), sols: [] }
      ];

      towers.forEach(t => {
        for (let i = 0; i < t.count; i++) {
          t.sols.push(HL.solid(svg));
          t.sols.push(HL.solid(svg));
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
            const [bO, bI] = HL.rings(t.x - 9, -9, t.x + 9, 9, 2, 1);
            HL.put(t.sols[solIdx++], HL.prism(P, front, bO, bI, z0, z1));
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
    concept: "Cộng nhẩm bằng bước nhảy trục số",
    means: "Thước đo trục số: vạch chia từ 0 đến 10; điểm đếm nhảy theo đường cong parabol minh họa phép cộng 0 + 4 = 4; 4 + 3 = 7.",
    rules: [1, 3, 5, 7, 8],
    range: [0, 4, 10],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-58, -12, 0], [58, 12, 35]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      const [rO, rI] = HL.rings(-54, -8, 54, 8, 2, 1);
      const rulerSol = HL.solid(svg);
      HL.put(rulerSol, HL.prism(P, front, rO, rI, 0, 4));

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

      const arc1Pts = [];
      for (let s = 0; s <= 20; s++) {
        const t = s / 20;
        const x = HL.lerp(ticks[0], ticks[4], t);
        const z = 4 + 4 * 18 * t * (1 - t);
        arc1Pts.push(P(x, 0, z));
      }
      HL.mk("path", { d: HL.open(arc1Pts), stroke: "#6f6f78", "stroke-dasharray": "3 2", fill: "none", "stroke-width": 1.2 }, svg);

      const arc2Pts = [];
      for (let s = 0; s <= 20; s++) {
        const t = s / 20;
        const x = HL.lerp(ticks[4], ticks[7], t);
        const z = 4 + 4 * 14 * t * (1 - t);
        arc2Pts.push(P(x, 0, z));
      }
      HL.mk("path", { d: HL.open(arc2Pts), stroke: "#6f6f78", "stroke-dasharray": "3 2", fill: "none", "stroke-width": 1.2 }, svg);

      const jumperSol = HL.solid(svg);
      const jumpProgress = HL.spring(0.5, { k: 100, c: 14 });

      function draw() {
        const t = jumpProgress.x;
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
    concept: "Phép cộng trực quan bằng chấm đố",
    means: "Hai khối xúc xắc lập phương: mặt trên hiển thị 3 chấm và 4 chấm; di chuột để xúc xắc nghiêng xoay theo góc nhìn 3D.",
    rules: [1, 2, 4, 6, 9],
    range: [0, 3.5, 7],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-45, -20, 0], [45, 20, 36]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      const [matO, matI] = HL.rings(-42, -18, 42, 18, 4, 1.5);
      const matSol = HL.solid(svg);
      HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2));

      const die1Sol = HL.solid(svg);
      const die2Sol = HL.solid(svg);
      const tilt1 = HL.spring(0, { k: 140, c: 14 });
      const tilt2 = HL.spring(0, { k: 140, c: 14 });

      const pips = [];
      for (let i = 0; i < 7; i++) pips.push(HL.mk("circle", { r: 1.6, fill: "#232327" }, svg));

      function draw() {
        const z1 = 2 + tilt1.x;
        const z2 = 2 + tilt2.x;

        const [d1O, d1I] = HL.rings(-32, -10, -12, 10, 2, 1);
        HL.put(die1Sol, HL.prism(P, front, d1O, d1I, z1, z1 + 20));

        const [d2O, d2I] = HL.rings(12, -10, 32, 10, 2, 1);
        HL.put(die2Sol, HL.prism(P, front, d2O, d2I, z2, z2 + 20));

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
    concept: "Xem giờ đúng & tỷ lệ 12:1",
    means: "Đồng hồ kim: di chuột theo vòng tròn để quay kim phút; kim giờ chuyển động chính xác theo tỷ lệ bánh răng 12:1.",
    rules: [1, 2, 4, 6, 8],
    range: [0, 6, 12],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-45, -45, 0], [45, 45, 16]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      const [dialO, dialI] = HL.rings(-42, -42, 42, 42, 42, 3);
      const bezelSol = HL.solid(svg);
      HL.put(bezelSol, HL.prism(P, front, dialO, dialI, 0, 6));

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

      const minuteLine = HL.mk("line", { stroke: "#232327", "stroke-width": 1.5 }, svg);
      const hourLine = HL.mk("line", { stroke: "#232327", "stroke-width": 2.5 }, svg);
      const centerPin = HL.mk("circle", { r: 3, fill: "#232327" }, svg);
      const pinPt = P(0, 0, 8);
      centerPin.setAttribute("cx", pinPt[0]);
      centerPin.setAttribute("cy", pinPt[1]);

      const angleSp = HL.spring(Math.PI * 0.5, { k: 100, c: 14 });

      function draw() {
        const minAng = angleSp.x;
        const hourAng = minAng / 12 + Math.PI * 0.5;

        const mLen = 30;
        const mx = Math.cos(minAng) * mLen, my = Math.sin(minAng) * mLen;
        const mPt = P(mx, my, 7.5);
        minuteLine.setAttribute("x1", pinPt[0]);
        minuteLine.setAttribute("y1", pinPt[1]);
        minuteLine.setAttribute("x2", mPt[0]);
        minuteLine.setAttribute("y2", mPt[1]);

        const hLen = 20;
        const hx = Math.cos(hourAng) * hLen, hy = Math.sin(hourAng) * hLen;
        const hPt = P(hx, hy, 7);
        hourLine.setAttribute("x1", pinPt[0]);
        hourLine.setAttribute("y1", pinPt[1]);
        hourLine.setAttribute("x2", hPt[0]);
        hourLine.setAttribute("y2", hPt[1]);

        let normMin = (minAng + Math.PI / 2) % (Math.PI * 2);
        if (normMin < 0) normMin += Math.PI * 2;
        const mins = Math.round((normMin / (Math.PI * 2)) * 60) % 60;
        const hrs = 3 + Math.floor(minAng / (Math.PI * 2));
        const finalHour = ((hrs - 1) % 12) + 1;
        read.textContent = "Đồng hồ: " + finalHour + ":" + (mins < 10 ? "0" + mins : mins);
      }

      function aim(pt) {
        if (!pt) return;
        const dx = pt[0] - pinPt[0];
        const dy = (pt[1] - pinPt[1]) * 2;
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
    concept: "Nhận biết khối lập phương, khối trụ, khối chóp",
    means: "Ba khối hình học cơ bản: Khối lập phương, Khối trụ và Khối nón; di chuột nâng từng khối lên để lộ hình phẳng đáy 2D.",
    rules: [1, 2, 4, 7, 9],
    range: [0, 10, 20],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.8);
      HL.fit(C, [[-55, -20, 0], [55, 20, 45]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      const [gridO, gridI] = HL.rings(-52, -18, 52, 18, 2, 1);
      const gridSol = HL.solid(svg);
      HL.put(gridSol, HL.prism(P, front, gridO, gridI, 0, 2));

      // 2D Footprints on base
      const sqPts = [P(-48, -12, 2.2), P(-24, -12, 2.2), P(-24, 12, 2.2), P(-48, 12, 2.2)];
      HL.mk("polygon", { points: sqPts.map(p => p.join(",")).join(" "), stroke: "#6f6f78", "stroke-dasharray": "2 2", fill: "none" }, svg);

      const circPts = [];
      for (let a = 0; a <= 24; a++) {
        const rad = (a / 24) * Math.PI * 2;
        circPts.push(P(Math.cos(rad) * 12, Math.sin(rad) * 12, 2.2));
      }
      HL.mk("polygon", { points: circPts.map(p => p.join(",")).join(" "), stroke: "#6f6f78", "stroke-dasharray": "2 2", fill: "none" }, svg);

      const conePts = [];
      for (let a = 0; a <= 24; a++) {
        const rad = (a / 24) * Math.PI * 2;
        conePts.push(P(36 + Math.cos(rad) * 12, Math.sin(rad) * 12, 2.2));
      }
      HL.mk("polygon", { points: conePts.map(p => p.join(",")).join(" "), stroke: "#6f6f78", "stroke-dasharray": "2 2", fill: "none" }, svg);

      const cubeSol = HL.solid(svg);
      const cylSol = HL.solid(svg);
      const coneSol = HL.solid(svg);

      const lift1 = HL.spring(0, { k: 130, c: 14 });
      const lift2 = HL.spring(0, { k: 130, c: 14 });
      const lift3 = HL.spring(0, { k: 130, c: 14 });

      function draw() {
        const z1 = 2 + lift1.x;
        const [cO, cI] = HL.rings(-48, -12, -24, 12, 2, 1);
        HL.put(cubeSol, HL.prism(P, front, cO, cI, z1, z1 + 24));

        const z2 = 2 + lift2.x;
        const [cyO, cyI] = HL.rings(-12, -12, 12, 12, 12, 1);
        HL.put(cylSol, HL.prism(P, front, cyO, cyI, z2, z2 + 24));

        const z3 = 2 + lift3.x;
        const [cnO, cnI] = HL.rings(24, -12, 48, 12, 12, 1);
        HL.put(coneSol, HL.prism(P, front, cnO, cnI, z3, z3 + 4));

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
    concept: "Khái niệm một phần tư và một phần hai",
    means: "Đĩa tròn phân số chia 4 phần bằng nhau: di chuột làm 4 miếng bánh tách rời hướng tâm, minh họa 1/4 + 1/4 + 1/4 + 1/4 = 1.",
    rules: [1, 2, 4, 7, 8],
    range: [0, 8, 16],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-45, -45, 0], [45, 45, 20]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      const [trayO, trayI] = HL.rings(-44, -44, 44, 44, 44, 2);
      const traySol = HL.solid(svg);
      HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 3));

      const quarters = [
        { dx: 1, dy: 1, sol: HL.solid(svg) },
        { dx: -1, dy: 1, sol: HL.solid(svg) },
        { dx: -1, dy: -1, sol: HL.solid(svg) },
        { dx: 1, dy: -1, sol: HL.solid(svg) }
      ];

      const explode = HL.spring(0, { k: 120, c: 14 });

      function draw() {
        const d = explode.x;
        quarters.forEach(q => {
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
    concept: "Tách gộp số 10 (bảng cộng phạm vi 10)",
    means: "Chuỗi 10 hạt đếm trên thanh uốn cong: 5 hạt đậm và 5 hạt nhạt; di chuột chia tách số 10 thành các cặp phép cộng (7 + 3, 6 + 4, 8 + 2).",
    rules: [1, 2, 3, 7, 10],
    range: [0, 5, 10],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-58, -16, 0], [58, 16, 45]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      const [bO, bI] = HL.rings(-52, -14, 52, 14, 3, 1.5);
      const baseSol = HL.solid(svg);
      HL.put(baseSol, HL.prism(P, front, bO, bI, 0, 4));

      const wirePts = [];
      for (let s = 0; s <= 30; s++) {
        const t = s / 30;
        const x = HL.lerp(-44, 44, t);
        const z = 4 + 4 * 34 * t * (1 - t);
        wirePts.push(P(x, 0, z));
      }
      HL.mk("path", { d: HL.open(wirePts), stroke: "#232327", fill: "none", "stroke-width": 1.2 }, svg);

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

        const leftCount = beads.filter(b => b.tSp.x < 0.5).length;
        const rightCount = 10 - leftCount;
        read.textContent = "Tách gộp số 10: " + leftCount + " + " + rightCount + " = 10";
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
    stage.setAttribute("data-hairline", fig.id);
    nameEl.textContent = fig.id;
    metaTitle.textContent = fig.title;
    metaDesc.textContent = fig.means;
    metaRule.textContent = "Khái niệm toán học: " + fig.concept + " · Quy tắc: " + fig.rules.join(", ");

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
      
      const gStage = document.createElement("div");
      gStage.className = "grid-stage";
      gStage.id = "gstage-" + idx;
      gStage.setAttribute("data-hairline", fig.id);

      const gMeta = document.createElement("div");
      gMeta.className = "grid-meta";
      
      const gName = document.createElement("div");
      gName.className = "grid-name";
      gName.textContent = fig.title;

      const gDesc = document.createElement("div");
      gDesc.className = "grid-desc";
      gDesc.textContent = fig.means;

      gMeta.appendChild(gName);
      gMeta.appendChild(gDesc);

      card.appendChild(gStage);
      card.appendChild(gMeta);
      card.onclick = () => switchTo(idx);
      galleryView.appendChild(card);

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

  window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") $("btn-prev").click();
    if (e.key === "ArrowRight") $("btn-next").click();
    if (e.key >= "1" && e.key <= "9") switchTo(Number(e.key) - 1);
    if (e.key === "0") switchTo(9);
  });

  switchTo(0);
})();
