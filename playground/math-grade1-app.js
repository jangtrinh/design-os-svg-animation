/*
 * 10 Grade 1 Math Figures Definitions (Hairline 2:1 Axonometric Standard)
 * Modularized Architecture - Auto-bundled
 */

if (typeof HL !== "undefined" && HL.inject) {
  HL.inject(document);
}

const MATH_FIGURES = [
/*
 * 1. Math Domino Addition Tiles (Thẻ Domino Số Học)
 * Pedagogical Goal: Place value & addition (10 + 3 = 13)
 * Simplified Geometry: Clean rounded domino tiles on a minimalist wooden tray
 * Meaningful Interaction: Moving pointer smoothly adjusts unit dots (1 to 5) with spring bounce
 */

{
  id: "math-domino",
  title: "1. Thẻ Domino Số Học (Domino Addition Tiles)",
  concept: "Cộng số tròn chục & đơn vị (10 + 3 = 13)",
  means: "Hai quân cờ Domino tinh giản: quân trái luôn cố định 10 chấm (1 chục = 5+5), quân phải thay đổi từ 1 đến 5 đơn vị theo vị trí chuột; trực quan hóa 1 chục ghép với các đơn vị.",
  rules: [1, 2, 4, 7, 9],
  range: [1, 3, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-52, -22, 0], [52, 22, 24]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Clean Minimalist Wooden Tray (Z: 0 to 3.5)
    const [trayO, trayI] = HL.rings(-50, -20, 50, 20, 3.5, 1.0);
    const traySol = HL.solid(svg);
    HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 3.5));

    // Two clean recessed pockets on tray floor
    for (const cx of [-25, 25]) {
      const [compO] = HL.rings(cx - 14, -18, cx + 14, 18, 2.5, 0.6);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, compO, 3.5)) }, svg);
    }

    // Tile 1 (Left: 10 pips, 5 top + 5 bottom)
    const d1Sol = HL.solid(svg);
    const z1 = 2.0;
    const [t1O, t1I] = HL.rings(-37, -16, -13, 16, 2.5, 0.8);
    HL.put(d1Sol, HL.prism(P, front, t1O, t1I, z1, z1 + 5.0));

    // Tile 1 dividing groove & center pin
    const topZ1 = z1 + 5.1;
    HL.mk("line", {
      x1: HL.r2(P(-36, 0, topZ1)[0]), y1: HL.r2(P(-36, 0, topZ1)[1]),
      x2: HL.r2(P(-14, 0, topZ1)[0]), y2: HL.r2(P(-14, 0, topZ1)[1]),
      class: "lo", "stroke-width": 1.0
    }, svg);
    HL.mk("circle", { cx: HL.r2(P(-25, 0, topZ1)[0]), cy: HL.r2(P(-25, 0, topZ1)[1]), r: 1.4, fill: "#232327" }, svg);

    // Helper for clean projected dots
    function makeDot() {
      return HL.mk("ellipse", { rx: HL.r2(1.5 * C.S), ry: HL.r2(1.5 * C.S * C.k), fill: "#232327", stroke: "none" }, svg);
    }

    // 10 pips on Tile 1 (5 top, 5 bottom)
    const c1X = -25;
    const pips1Pos = [
      [c1X - 5.5, -11.5], [c1X + 5.5, -11.5],
      [c1X, -8.0],
      [c1X - 5.5, -4.5],  [c1X + 5.5, -4.5],
      [c1X - 5.5, 4.5],   [c1X + 5.5, 4.5],
      [c1X, 8.0],
      [c1X - 5.5, 11.5],  [c1X + 5.5, 11.5]
    ];
    pips1Pos.forEach(([px, py]) => {
      const pt = P(px, py, topZ1);
      const dot = makeDot();
      dot.setAttribute("cx", HL.r2(pt[0]));
      dot.setAttribute("cy", HL.r2(pt[1]));
    });

    // Tile 2 (Right: Units 1 to 5)
    const d2Sol = HL.solid(svg);
    const d2Lift = HL.spring(0, { k: 140, c: 14 });
    const div2 = HL.mk("line", { class: "lo", "stroke-width": 1.0 }, svg);
    const pin2 = HL.mk("circle", { r: 1.4, fill: "#232327" }, svg);
    const d2Dots = Array.from({ length: 5 }, makeDot);

    let unitCount = initialV != null ? Math.round(HL.clamp(initialV, 1, 5)) : 3;

    function draw() {
      const z2 = 2.0 + d2Lift.x;
      const [t2O, t2I] = HL.rings(13, -16, 37, 16, 2.5, 0.8);
      HL.put(d2Sol, HL.prism(P, front, t2O, t2I, z2, z2 + 5.0));

      const topZ2 = z2 + 5.1;
      const c2X = 25;

      div2.setAttribute("x1", HL.r2(P(14, 0, topZ2)[0]));
      div2.setAttribute("y1", HL.r2(P(14, 0, topZ2)[1]));
      div2.setAttribute("x2", HL.r2(P(36, 0, topZ2)[0]));
      div2.setAttribute("y2", HL.r2(P(36, 0, topZ2)[1]));

      const p2Center = P(c2X, 0, topZ2);
      pin2.setAttribute("cx", HL.r2(p2Center[0]));
      pin2.setAttribute("cy", HL.r2(p2Center[1]));

      const patterns = {
        1: [[c2X, -8.0]],
        2: [[c2X - 5.5, -11.5], [c2X + 5.5, -4.5]],
        3: [[c2X - 5.5, -11.5], [c2X, -8.0], [c2X + 5.5, -4.5]],
        4: [[c2X - 5.5, -11.5], [c2X + 5.5, -11.5], [c2X - 5.5, -4.5], [c2X + 5.5, -4.5]],
        5: [[c2X - 5.5, -11.5], [c2X + 5.5, -11.5], [c2X, -8.0], [c2X - 5.5, -4.5], [c2X + 5.5, -4.5]]
      };

      const pts = patterns[unitCount] || patterns[3];
      d2Dots.forEach((dot, i) => {
        if (i < pts.length) {
          dot.style.display = "";
          const p = P(pts[i][0], pts[i][1], topZ2);
          dot.setAttribute("cx", HL.r2(p[0]));
          dot.setAttribute("cy", HL.r2(p[1]));
        } else {
          dot.style.display = "none";
        }
      });

      d2Sol.sil.classList.toggle("hi", d2Lift.x > 0.5);
      read.textContent = "Domino: 10 + " + unitCount + " = " + (10 + unitCount) + " (1 chục và " + unitCount + " đơn vị)";
    }

    function aim(pt) {
      if (!pt) {
        d2Lift.t = 0;
        reg.wake();
        return;
      }
      const s2 = P(25, 0, 5)[0];
      const near = Math.abs(pt[0] - s2) < 35;
      d2Lift.t = near ? 3.0 : 0;

      if (near) {
        const topY = P(25, -16, 5)[1];
        const botY = P(25, 16, 5)[1];
        const norm = HL.clamp((pt[1] - topY) / (botY - topY), 0, 1);
        unitCount = Math.min(5, Math.max(1, Math.round(1 + norm * 4)));
      }
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const m = HL.stepS(d2Lift, dt);
      draw();
      return m;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        unitCount = HL.clamp(Math.round(v), 1, 5);
        draw();
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 2. Math Balance Scale (Cân Thăng Bằng Số Học)
 * Pedagogical Goal: Number comparison (lớn hơn, bé hơn, bằng nhau)
 * Simplified Geometry: Clean balance beam, center fulcrum mast, two hanging pans
 * Meaningful Interaction: Moving pointer left/right tilts scale with needle indicating =, >, <
 */

{
  id: "math-balance",
  title: "2. Cân Thăng Bằng (Balance Scale)",
  concept: "So sánh lớn hơn, bé hơn, bằng nhau",
  means: "Cân thăng bằng cơ học tinh giản: dầm cân với kim chỉ thị trung tâm; di chuột sang trái/phải để làm cân nghiêng trực quan (lớn hơn/nhỏ hơn), thả chuột cân tự cân bằng ở giữa.",
  rules: [1, 3, 4, 7, 9],
  range: [-1, 0, 1],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-54, -18, 0], [54, 18, 56]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Base Plinth (Z: 0 to 4)
    const [baseO, baseI] = HL.rings(-24, -16, 24, 16, 3.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 4));

    // 2. Clean Mast Pillar (Z: 4 to 38)
    const [mastO, mastI] = HL.rings(-3.2, -3.2, 3.2, 3.2, 3.2, 0.6);
    const mastSol = HL.solid(svg);
    HL.put(mastSol, HL.prism(P, front, mastO, mastI, 4, 38));

    // Center pivot pin
    const pinScr = P(0, 3.5, 38);
    HL.mk("circle", { cx: HL.r2(pinScr[0]), cy: HL.r2(pinScr[1]), r: 2.0, fill: "#ffffff", stroke: "#232327", "stroke-width": 1.2 }, svg);
    HL.mk("circle", { cx: HL.r2(pinScr[0]), cy: HL.r2(pinScr[1]), r: 1.0, fill: "#232327" }, svg);

    // 3. Simple 3-tick indicator scale (-1, 0, +1)
    const tickMid = P(0, 3.4, 25);
    const tickMidTop = P(0, 3.4, 22.5);
    HL.mk("line", {
      x1: HL.r2(tickMid[0]), y1: HL.r2(tickMid[1]),
      x2: HL.r2(tickMidTop[0]), y2: HL.r2(tickMidTop[1]),
      stroke: "#111113", "stroke-width": 1.4, class: "hi"
    }, svg);

    for (const sx of [-6, 6]) {
      const p1 = P(sx, 3.4, 25.5);
      const p2 = P(sx * 0.85, 3.4, 23.5);
      HL.mk("line", {
        x1: HL.r2(p1[0]), y1: HL.r2(p1[1]),
        x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
        stroke: "#6f6f78", "stroke-width": 0.8, class: "lo"
      }, svg);
    }

    // 4. Moving Balance Elements
    const beamSol = HL.solid(svg);
    const needleLine = HL.mk("line", { stroke: "#111113", "stroke-width": 1.4, "stroke-linecap": "round" }, svg);
    const needleTip = HL.mk("circle", { r: 1.2, fill: "#232327" }, svg);

    const leftPanSol = HL.solid(svg);
    const rightPanSol = HL.solid(svg);
    const cords = HL.mk("path", { class: "lo", "stroke-width": 1.0 }, svg);

    // Weights: 3 weights on left pan, 3 weights on right pan
    const leftWeights = Array.from({ length: 3 }, () => HL.solid(svg));
    const rightWeights = Array.from({ length: 3 }, () => HL.solid(svg));

    const tiltSpring = HL.spring(0, { k: 120, c: 13 });
    const beamLen = 38;
    const fulcrumZ = 38;
    const cordLen = 22;

    function draw() {
      const angle = tiltSpring.x; // Angle in radians
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);

      // Beam ends
      const lx = -beamLen * cosA;
      const lz = fulcrumZ - beamLen * sinA;
      const rx = beamLen * cosA;
      const rz = fulcrumZ + beamLen * sinA;

      // Diamond tapered beam prism
      const topPts = [
        P(-beamLen * cosA, 0, fulcrumZ - beamLen * sinA),
        P(0, 0, fulcrumZ + 2.5),
        P(beamLen * cosA, 0, fulcrumZ + beamLen * sinA),
        P(0, 0, fulcrumZ - 2.5)
      ];
      const botPts = topPts.map(p => [p[0], p[1] + 1.2]);
      HL.put(beamSol, { sil: HL.poly(HL.hull([...topPts, ...botPts])), crease: HL.poly(topPts) });

      // Indicator needle pointing downwards
      const nTipX = -14 * sinA;
      const nTipZ = fulcrumZ - 14 * cosA;
      const nBaseScr = P(0, 3.6, fulcrumZ);
      const nTipScr = P(nTipX, 3.6, nTipZ);
      needleLine.setAttribute("x1", HL.r2(nBaseScr[0]));
      needleLine.setAttribute("y1", HL.r2(nBaseScr[1]));
      needleLine.setAttribute("x2", HL.r2(nTipScr[0]));
      needleLine.setAttribute("y2", HL.r2(nTipScr[1]));
      needleTip.setAttribute("cx", HL.r2(nTipScr[0]));
      needleTip.setAttribute("cy", HL.r2(nTipScr[1]));

      // Pans hanging plumb
      const panRadius = 11;
      const lPanZ = lz - cordLen;
      const rPanZ = rz - cordLen;

      // Left pan prism
      const [lpO, lpI] = HL.rings(lx - panRadius, -panRadius, lx + panRadius, panRadius, panRadius, 0.8);
      HL.put(leftPanSol, HL.prism(P, front, lpO, lpI, lPanZ, lPanZ + 1.8));

      // Right pan prism
      const [rpO, rpI] = HL.rings(rx - panRadius, -panRadius, rx + panRadius, panRadius, panRadius, 0.8);
      HL.put(rightPanSol, HL.prism(P, front, rpO, rpI, rPanZ, rPanZ + 1.8));

      // 3 Suspension Cords per pan
      let cordD = "";
      for (const ang of [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]) {
        const pxL = lx + (panRadius - 1.2) * Math.cos(ang);
        const pyL = (panRadius - 1.2) * Math.sin(ang);
        cordD += HL.seg(P(lx, 0, lz), P(pxL, pyL, lPanZ + 1.6));

        const pxR = rx + (panRadius - 1.2) * Math.cos(ang);
        const pyR = (panRadius - 1.2) * Math.sin(ang);
        cordD += HL.seg(P(rx, 0, rz), P(pxR, pyR, rPanZ + 1.6));
      }
      cords.setAttribute("d", cordD);

      // Clean cylindrical weights
      const wOffsets = [[-3.5, -2], [3.5, -2], [0, 3.5]];
      wOffsets.forEach(([ox, oy], i) => {
        const [wlO, wlI] = HL.rings(lx + ox - 2.6, oy - 2.6, lx + ox + 2.6, oy + 2.6, 2.6, 0.5);
        HL.put(leftWeights[i], HL.prism(P, front, wlO, wlI, lPanZ + 1.8, lPanZ + 8.5));

        const [wrO, wrI] = HL.rings(rx + ox - 2.6, oy - 2.6, rx + ox + 2.6, oy + 2.6, 2.6, 0.5);
        HL.put(rightWeights[i], HL.prism(P, front, wrO, wrI, rPanZ + 1.8, rPanZ + 8.5));
      });

      // Semantic highlight
      const isBalanced = Math.abs(angle) < 0.03;
      beamSol.sil.classList.toggle("hi", isBalanced);

      if (isBalanced) {
        read.textContent = "Thăng bằng: Hai vế bằng nhau (3 = 3)";
      } else if (angle < -0.03) {
        read.textContent = "Nghiêng trái: Vế trái nặng hơn (> )";
      } else {
        read.textContent = "Nghiêng phải: Vế phải nặng hơn (< )";
      }
    }

    function aim(pt) {
      if (!pt) {
        tiltSpring.t = 0;
        reg.wake();
        return;
      }
      const midX = P(0, 0, 38)[0];
      const diffX = pt[0] - midX;
      // Clamp tilt between -0.16 and +0.16 radians
      tiltSpring.t = HL.clamp(diffX * 0.003, -0.16, 0.16);
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const m = HL.stepS(tiltSpring, dt);
      draw();
      return m;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        tiltSpring.t = HL.clamp(v * 0.16, -0.16, 0.16);
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 3. Ten Frame Counter (Khung 10 Ô Đếm Số)
 * Pedagogical Goal: Complements of 10 & base-10 structure (7 + 3 = 10)
 * Simplified Geometry: Clean 2x5 tray with 10 rounded pockets & clean circular counters
 * Meaningful Interaction: Moving pointer horizontally smoothly fills/empties counters with spring drop
 */

{
  id: "math-ten-frame",
  title: "3. Khung 10 Ô (Ten Frame Counter)",
  concept: "Cấu trúc số 10 cơ số mười & Bổ số 10",
  means: "Khung 10 ô đếm số tinh giản: khay gỗ 2 hàng 5 cột; di chuột ngang để đặt hoặc rút đồng xu cơ khí mượt mà, trực quan hóa bổ số 10 (7 + 3 = 10).",
  rules: [1, 2, 4, 7, 9],
  range: [0, 7, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-54, -24, 0], [54, 24, 30]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Wooden Tray (Z: 0 to 3.5)
    const [trayO, trayI] = HL.rings(-50, -20, 50, 20, 3.5, 1.0);
    const traySol = HL.solid(svg);
    HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 3.5));

    // 10 Clean Circular Cup Pockets (2 rows, 5 columns)
    for (let r = 0; r < 2; r++) {
      const cy = r === 0 ? 9.5 : -9.5;
      for (let c = 0; c < 5; c++) {
        const cx = -38 + c * 19;
        const pocketPts = [];
        for (let k = 0; k <= 24; k++) {
          const a = (k / 24) * Math.PI * 2;
          pocketPts.push(P(cx + 6.8 * Math.cos(a), cy + 6.8 * Math.sin(a), 3.5));
        }
        HL.mk("path", { class: "lo nf", d: HL.poly(pocketPts) }, svg);
      }
    }

    // Center divider groove separating row 1 and row 2
    HL.mk("line", {
      x1: HL.r2(P(-46, 0, 3.5)[0]), y1: HL.r2(P(-46, 0, 3.5)[1]),
      x2: HL.r2(P(46, 0, 3.5)[0]), y2: HL.r2(P(46, 0, 3.5)[1]),
      class: "lo", "stroke-width": 1.0, "stroke-dasharray": "3 2"
    }, svg);

    // 10 Clean Circular Coin Tokens
    const tokens = [];
    let count = initialV != null ? HL.clamp(Math.round(initialV), 0, 10) : 7;
    let slotIdx = 0;

    for (let r = 0; r < 2; r++) {
      const cy = r === 0 ? 9.5 : -9.5;
      for (let c = 0; c < 5; c++) {
        const cx = -38 + c * 19;
        const active = slotIdx < count;
        const sol = HL.solid(svg);

        tokens.push({
          idx: slotIdx,
          cx,
          cy,
          active,
          dropSp: HL.spring(active ? 0 : 16, { k: 200, c: 16 }),
          sol
        });

        slotIdx++;
      }
    }

    function applyCount(newCount) {
      count = HL.clamp(newCount, 0, 10);
      tokens.forEach((tok, i) => {
        const willBeActive = i < count;
        tok.active = willBeActive;
        tok.dropSp.t = willBeActive ? 0 : 16;
      });
      reg.wake();
    }

    function draw() {
      tokens.forEach((tok, i) => {
        const dropZ = tok.dropSp.x;
        if (tok.active || dropZ < 15.5) {
          const z = 2.0 + Math.max(0, dropZ);
          const [cO, cI] = HL.rings(tok.cx - 5.5, tok.cy - 5.5, tok.cx + 5.5, tok.cy + 5.5, 5.5, 0.6);
          HL.put(tok.sol, HL.prism(P, front, cO, cI, z, z + 2.5));

          const isFocal = (i === count - 1) && (dropZ < 1.0);
          tok.sol.sil.classList.toggle("hi", isFocal);
        } else {
          HL.put(tok.sol, { sil: "", crease: "" });
        }
      });

      const emptyCount = 10 - count;
      read.textContent = "Khung 10 ô: " + count + " (có) + " + emptyCount + " (trống) = 10";
    }

    function aim(pt) {
      if (!pt) {
        applyCount(7);
        return;
      }
      const pLeft = P(-38, 0, 3.5)[0];
      const pRight = P(38, 0, 3.5)[0];
      const norm = HL.clamp((pt[0] - pLeft) / (pRight - pLeft), 0, 1);
      applyCount(Math.round(norm * 10));
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      tokens.forEach(t => {
        if (HL.stepS(t.dropSp, dt)) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => applyCount(7) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        applyCount(Math.round(v));
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 4. Number Blocks Tower (Tháp Khối Số Học Unifix)
 * Pedagogical Goal: Part-whole addition & conservation of volume (3 + 2 = 5)
 * Simplified Geometry: Clean interlocking cubes with cylindrical top studs on a simple baseboard
 * Meaningful Interaction: Moving pointer smoothly transfers cubes across towers along a parabolic arc
 */

{
  id: "math-number-blocks",
  title: "4. Tháp Khối Số Học (Unifix Number Blocks)",
  concept: "Phép cộng & bảo toàn số lượng khi ghép khối (3 + 2 = 5)",
  means: "Tháp khối lập phương Unifix tinh giản: hai tháp 3 khối và 2 khối; di chuột để chuyển khối theo cung bay parabol mượt mà, trực quan hóa bảo toàn số lượng.",
  rules: [1, 2, 3, 7, 9],
  range: [1, 3, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -18, 0], [50, 18, 76]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Hardwood Baseboard (Z: 0 to 3.5)
    const [baseO, baseI] = HL.rings(-46, -16, 46, 16, 3.0, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 3.5));

    // Base mounting boss studs on board at x = -20 and x = 20
    for (const bx of [-20, 20]) {
      const [studO, studI] = HL.rings(bx - 3.5, -3.5, bx + 3.5, 3.5, 3.5, 0.5);
      const studSol = HL.solid(svg);
      HL.put(studSol, HL.prism(P, front, studO, studI, 3.5, 5.5));
    }

    const blockH = 12.0;
    const TOTAL_BLOCKS = 5;

    let countA = initialV != null ? HL.clamp(Math.round(initialV), 1, 5) : 3;

    // 5 physical Unifix unit blocks
    const blocks = [];
    for (let i = 0; i < TOTAL_BLOCKS; i++) {
      const isInitialA = i < 3;
      const targetTower = isInitialA ? -20 : 20;
      const targetStackIdx = isInitialA ? i : (i - 3);
      const targetZ = 3.5 + targetStackIdx * blockH;

      const blockSol = HL.solid(svg);
      const studSol = HL.solid(svg);

      blocks.push({
        idx: i,
        spX: HL.spring(targetTower, { k: 160, c: 15 }),
        spZ: HL.spring(targetZ, { k: 180, c: 16 }),
        blockSol,
        studSol
      });
    }

    function syncTargets() {
      // Tower A gets blocks 0 .. countA - 1
      for (let i = 0; i < countA; i++) {
        const b = blocks[i];
        b.spX.t = -20;
        b.spZ.t = 3.5 + i * blockH;
      }
      // Tower B gets blocks countA .. TOTAL_BLOCKS - 1
      let stackB = 0;
      for (let i = countA; i < TOTAL_BLOCKS; i++) {
        const b = blocks[i];
        b.spX.t = 20;
        b.spZ.t = 3.5 + stackB * blockH;
        stackB++;
      }
      reg.wake();
    }

    function draw() {
      blocks.forEach(b => {
        const curX = b.spX.x;
        const curZ = b.spZ.x;

        // Block cube prism (16 x 16 footprint, height 12)
        const [bO, bI] = HL.rings(curX - 8.0, -8.0, curX + 8.0, 8.0, 2.0, 0.8);
        HL.put(b.blockSol, HL.prism(P, front, bO, bI, curZ, curZ + blockH));

        // Interlocking stud on top face
        const [sO, sI] = HL.rings(curX - 3.5, -3.5, curX + 3.5, 3.5, 3.5, 0.5);
        HL.put(b.studSol, HL.prism(P, front, sO, sI, curZ + blockH, curZ + blockH + 2.4));

        // Airborne highlight
        const isAirborne = Math.abs(curX - (-20)) > 2 && Math.abs(curX - 20) > 2;
        b.blockSol.sil.classList.toggle("hi", isAirborne);
        b.studSol.sil.classList.toggle("hi", isAirborne);
      });

      const countB = TOTAL_BLOCKS - countA;
      read.textContent = "Khối ghép: " + countA + " khối + " + countB + " khối = 5 khối";
    }

    function aim(pt) {
      if (!pt) {
        countA = 3;
        syncTargets();
        return;
      }
      const pLeft = P(-20, 0, 10)[0];
      const pRight = P(20, 0, 10)[0];
      const norm = HL.clamp((pt[0] - pLeft) / (pRight - pLeft), 0, 1);
      countA = HL.clamp(Math.round(1 + norm * 4), 1, 5);
      syncTargets();
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      blocks.forEach(b => {
        const mx = HL.stepS(b.spX, dt);
        const mz = HL.stepS(b.spZ, dt);
        if (mx || mz) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => {
        countA = 3;
        syncTargets();
      }
    }));
    bag.add(() => svg.replaceChildren());

    syncTargets();
    draw();

    return {
      set(v) {
        countA = HL.clamp(Math.round(v), 1, TOTAL_BLOCKS);
        syncTargets();
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 5. Number Line (Trục Số Nhảy Cung Parabol)
 * Pedagogical Goal: Jump addition on number line (0 + 4 = 4; 4 + 3 = 7)
 * Simplified Geometry: Clean beveled scale ruler with 0..10 graduation ticks & parabolic jump arcs
 * Meaningful Interaction: Moving pointer smoothly drives hopper along parabolic arcs with spring tracking
 */

{
  id: "math-number-line",
  title: "5. Trục Số Nhảy Ếch (Number Line Jumps)",
  concept: "Cộng nhẩm bằng bước nhảy trục số (0 + 4 = 4; 4 + 3 = 7)",
  means: "Thước đo trục số chia vạch tinh giản: di chuột để chú ếch origami bật nhảy theo các cung parabol mượt mà dọc theo các vạch số, trực quan hóa phép cộng nhảy bước.",
  rules: [1, 3, 5, 7, 9],
  range: [0, 4, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-58, -14, 0], [58, 14, 42]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Graduated Scale Ruler (Z: 0 to 4.0)
    const [rO, rI] = HL.rings(-52, -8, 52, 8, 2.5, 0.8);
    const rulerSol = HL.solid(svg);
    HL.put(rulerSol, HL.prism(P, front, rO, rI, 0, 4.0));

    // 2. Graduation Station Ticks (0 to 10)
    const ticks = [];
    const tickEls = [];
    for (let i = 0; i <= 10; i++) {
      const x = -46 + i * 9.2;
      ticks.push(x);

      const isMajor = i % 5 === 0;
      const isKey = i === 4 || i === 7;
      const yStart = isMajor ? -6.5 : (isKey ? -5.5 : -4.0);

      const tLine = HL.mk("line", {
        x1: HL.r2(P(x, yStart, 4.1)[0]), y1: HL.r2(P(x, yStart, 4.1)[1]),
        x2: HL.r2(P(x, 1.0, 4.1)[0]), y2: HL.r2(P(x, 1.0, 4.1)[1]),
        stroke: (isMajor || isKey ? "#111113" : "#6f6f78"),
        "stroke-width": (isMajor || isKey ? 1.4 : 0.9),
        class: (i === 4 ? "hi" : (isMajor ? "" : "lo"))
      }, svg);
      tickEls.push(tLine);
    }

    // 3. Parabolic Jump Arcs
    // Arc 1: 0 -> 4 (+4 jump)
    const arc1Pts = [];
    for (let s = 0; s <= 28; s++) {
      const t = s / 28;
      const x = HL.lerp(ticks[0], ticks[4], t);
      const z = 4.1 + 4 * 16 * t * (1 - t);
      arc1Pts.push(P(x, 0, z));
    }
    HL.mk("path", {
      d: HL.open(arc1Pts),
      stroke: "#5b5d64",
      "stroke-dasharray": "2.5 2.0",
      fill: "none",
      "stroke-width": 1.2
    }, svg);

    // Arc 2: 4 -> 7 (+3 jump)
    const arc2Pts = [];
    for (let s = 0; s <= 28; s++) {
      const t = s / 28;
      const x = HL.lerp(ticks[4], ticks[7], t);
      const z = 4.1 + 4 * 13 * t * (1 - t);
      arc2Pts.push(P(x, 0, z));
    }
    HL.mk("path", {
      d: HL.open(arc2Pts),
      stroke: "#5b5d64",
      "stroke-dasharray": "2.5 2.0",
      fill: "none",
      "stroke-width": 1.2
    }, svg);

    // 4. Faceted Origami Hopper
    const frogGroup = HL.mk("g", { id: "origami-frog" }, svg);
    const faceEls = [];
    for (let i = 0; i < 7; i++) {
      const poly = HL.mk("polygon", {
        fill: i < 2 ? "#e0e0e4" : "#ffffff",
        stroke: "#232327",
        "stroke-width": 1.1,
        "stroke-linejoin": "round"
      }, frogGroup);
      faceEls.push(poly);
    }

    const eyeDots = [
      HL.mk("circle", { r: 1.2, fill: "#232327" }, frogGroup),
      HL.mk("circle", { r: 1.2, fill: "#232327" }, frogGroup)
    ];

    const shadowEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
    const dropLineEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);

    const initT = initialV != null ? HL.clamp(initialV / 7, 0, 1) : 0.57;
    const jumpProgress = HL.spring(initT, { k: 120, c: 13 });
    let active = false;

    function draw() {
      const t = HL.clamp(jumpProgress.x, 0, 1);
      let x, z, pitch;

      if (t <= 0.57) {
        const u = t / 0.57;
        x = HL.lerp(ticks[0], ticks[4], u);
        z = 4.1 + 4 * 16 * u * (1 - u);
        const slope = (4 * 16 * (1 - 2 * u)) / (ticks[4] - ticks[0]);
        pitch = Math.atan(slope) * 0.45;
      } else {
        const u = (t - 0.57) / 0.43;
        x = HL.lerp(ticks[4], ticks[7], u);
        z = 4.1 + 4 * 13 * u * (1 - u);
        const slope = (4 * 13 * (1 - 2 * u)) / (ticks[7] - ticks[4]);
        pitch = Math.atan(slope) * 0.45;
      }

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      function V(lx, ly, lz) {
        const rotX = lx * cosP - lz * sinP;
        const rotZ = lx * sinP + lz * cosP;
        return P(x + rotX, ly, z + rotZ);
      }

      const snout = V(6.5, 0, 1.5);
      const eyeL = V(3.0, -3.0, 4.2);
      const eyeR = V(3.0, 3.0, 4.2);
      const crown = V(3.5, 0, 3.8);
      const spine = V(-1.0, 0, 5.0);
      const tail = V(-5.5, 0, 1.2);
      const flankL = V(-1.0, -5.0, 1.8);
      const flankR = V(-1.0, 5.0, 1.8);
      const kneeL = V(-3.5, -6.0, 3.0);
      const kneeR = V(-3.5, 6.0, 3.0);
      const footL = V(-6.0, -6.2, 0);
      const footR = V(-6.0, 6.2, 0);

      const faces = [
        [flankL, kneeL, footL],
        [flankR, kneeR, footR],
        [spine, flankL, tail],
        [spine, tail, flankR],
        [crown, eyeL, flankL, spine],
        [crown, spine, flankR, eyeR],
        [snout, eyeR, crown, eyeL]
      ];

      faces.forEach((pts, i) => {
        faceEls[i].setAttribute("points", pts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));
      });

      eyeDots[0].setAttribute("cx", HL.r2(eyeL[0]));
      eyeDots[0].setAttribute("cy", HL.r2(eyeL[1]));
      eyeDots[1].setAttribute("cx", HL.r2(eyeR[0]));
      eyeDots[1].setAttribute("cy", HL.r2(eyeR[1]));

      // Shadow on ruler surface
      const shadowPts = [];
      const sScale = HL.clamp(1 - (z - 4.1) * 0.03, 0.4, 1);
      for (let k = 0; k <= 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        shadowPts.push(P(x + 5.0 * sScale * Math.cos(a), 3.5 * sScale * Math.sin(a), 4.1));
      }
      shadowEl.setAttribute("d", HL.poly(shadowPts));

      if (z > 5.5) {
        dropLineEl.style.display = "";
        dropLineEl.setAttribute("d", HL.seg(P(x, 0, z), P(x, 0, 4.1)));
      } else {
        dropLineEl.style.display = "none";
      }

      const curTickIdx = Math.round(t <= 0.57 ? (t / 0.57) * 4 : 4 + ((t - 0.57) / 0.43) * 3);
      tickEls.forEach((el, idx) => {
        const isHi = active ? (idx === curTickIdx) : (idx === 4);
        el.classList.toggle("hi", isHi);
      });

      read.textContent = "Trục số nhảy ếch: 0 + 4 = 4; 4 + 3 = 7 (Vị trí hiện tại: " + curTickIdx + ")";
    }

    function aim(pt) {
      if (!pt) {
        jumpProgress.t = 0.57;
        active = false;
        reg.wake();
        return;
      }
      const scr0 = P(ticks[0], 0, 4.1)[0];
      const scr7 = P(ticks[7], 0, 4.1)[0];
      const t = HL.clamp((pt[0] - scr0) / (scr7 - scr0), 0, 1);
      jumpProgress.t = t;
      active = true;
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(jumpProgress, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => {
        jumpProgress.t = 0.57;
        active = false;
        reg.wake();
      }
    }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        jumpProgress.t = HL.clamp(v / 7, 0, 1);
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 6. Math Dice (Cặp Xúc Xắc Chấm Đố)
 * Pedagogical Goal: Number recognition & subitizing (3 + 4 = 7, opposite faces sum to 7)
 * Simplified Geometry: Clean chamfered cubes with solid bold pips on a minimalist mat
 * Meaningful Interaction: Moving pointer smoothly tilts/wobbles dice to explore 3D faces
 */

{
  id: "math-dice",
  title: "6. Cặp Xúc Xắc (Math Dice Pips)",
  concept: "Phép cộng & nhận biết mặt xúc xắc 3D",
  means: "Hai khối xúc xắc bo góc vát mép tinh giản trên bàn đế: di chuột để nghiêng xoay 3D khám phá các mặt chấm tròn, nhận biết tổng hai mặt trên (3 + 4 = 7) và tính chất mặt đối diện bằng 7.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 3.5, 7],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-48, -20, 0], [48, 20, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Minimalist Mat (Z: 0 to 2.5)
    const [matO, matI] = HL.rings(-44, -16, 44, 16, 3.5, 0.8);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2.5));

    // 2. Dice Groups
    const d1Group = HL.mk("g", { id: "die-1" }, svg);
    const d2Group = HL.mk("g", { id: "die-2" }, svg);

    function makeDieGraphics(g) {
      return {
        faceX: HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.3; stroke-linejoin: round;" }, g),
        faceY: HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.3; stroke-linejoin: round;" }, g),
        faceZ: HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.3; stroke-linejoin: round;" }, g),
        pipDots: Array.from({ length: 16 }, () => HL.mk("polygon", { style: "fill: #232327; stroke: none;" }, g))
      };
    }

    const d1Gfx = makeDieGraphics(d1Group);
    const d2Gfx = makeDieGraphics(d2Group);

    // Springs for 3D tilt
    const wobbleX1 = HL.spring(0, { k: 140, c: 14 });
    const wobbleY1 = HL.spring(0, { k: 140, c: 14 });
    const lift1 = HL.spring(0, { k: 150, c: 14 });

    const wobbleX2 = HL.spring(0, { k: 140, c: 14 });
    const wobbleY2 = HL.spring(0, { k: 140, c: 14 });
    const lift2 = HL.spring(0, { k: 150, c: 14 });

    const d = 5.0;
    const rPip = 1.6;

    function buildPipsForFace(axis, val) {
      const pips = [];
      if (val === 1) pips.push({ axis, u: 0, v: 0, r: rPip * 1.2 });
      else if (val === 2) {
        pips.push({ axis, u: -d, v: -d, r: rPip }, { axis, u: d, v: d, r: rPip });
      } else if (val === 3) {
        pips.push({ axis, u: -d, v: -d, r: rPip }, { axis, u: 0, v: 0, r: rPip }, { axis, u: d, v: d, r: rPip });
      } else if (val === 4) {
        pips.push({ axis, u: -d, v: -d, r: rPip }, { axis, u: d, v: -d, r: rPip }, { axis, u: -d, v: d, r: rPip }, { axis, u: d, v: d, r: rPip });
      } else if (val === 5) {
        pips.push({ axis, u: -d, v: -d, r: rPip }, { axis, u: d, v: -d, r: rPip }, { axis, u: 0, v: 0, r: rPip }, { axis, u: -d, v: d, r: rPip }, { axis, u: d, v: d, r: rPip });
      } else if (val === 6) {
        pips.push({ axis, u: -d, v: -d, r: rPip }, { axis, u: d, v: -d, r: rPip }, { axis, u: -d, v: 0, r: rPip }, { axis, u: d, v: 0, r: rPip }, { axis, u: -d, v: d, r: rPip }, { axis, u: d, v: d, r: rPip });
      }
      return pips;
    }

    function rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz) {
      const rx = HL.rad(rxDeg);
      const ry = HL.rad(ryDeg);
      const x1 = lx * Math.cos(ry) + lz * Math.sin(ry);
      const y1 = ly;
      const z1 = -lx * Math.sin(ry) + lz * Math.cos(ry);
      const x2 = x1;
      const y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
      return [cx + x2, cy + y2, cz + z2];
    }

    function projectPip(cu, cv, r, normalAxis, rxDeg, ryDeg, cx, cy, cz) {
      const N = 10;
      const pts = [];
      for (let k = 0; k < N; k++) {
        const a = (k / N) * Math.PI * 2;
        let lx, ly, lz;
        if (normalAxis === 'Z') {
          lx = cu + r * Math.cos(a);
          ly = cv + r * Math.sin(a);
          lz = 10.0;
        } else if (normalAxis === 'X') {
          lx = 10.0;
          ly = cu + r * Math.cos(a);
          lz = cv + r * Math.sin(a);
        } else {
          lx = cu + r * Math.cos(a);
          ly = 10.0;
          lz = cv + r * Math.sin(a);
        }
        const w = rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz);
        pts.push(P(w[0], w[1], w[2]).map(HL.r2).join(","));
      }
      return pts.join(" ");
    }

    function renderDie(gfx, cx, cy, cz, rxDeg, ryDeg, faces) {
      const H = 10.0;
      const corners = [
        [-H, -H, -H], [H, -H, -H], [H, H, -H], [-H, H, -H],
        [-H, -H,  H], [H, -H,  H], [H, H,  H], [-H, H,  H]
      ].map(([lx, ly, lz]) => {
        const w = rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz);
        return P(w[0], w[1], w[2]);
      });

      // Face Z+ (top)
      const topPts = [corners[4], corners[5], corners[6], corners[7]];
      gfx.faceZ.setAttribute("points", topPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      // Face X+ (right)
      const rightPts = [corners[1], corners[2], corners[6], corners[5]];
      gfx.faceX.setAttribute("points", rightPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      // Face Y+ (front)
      const frontPts = [corners[3], corners[2], corners[6], corners[7]];
      gfx.faceY.setAttribute("points", frontPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      // Pips
      const allPips = [
        ...buildPipsForFace('Z', faces.top),
        ...buildPipsForFace('X', faces.right),
        ...buildPipsForFace('Y', faces.front)
      ];

      allPips.forEach((pip, i) => {
        if (i < gfx.pipDots.length) {
          gfx.pipDots[i].style.display = "";
          gfx.pipDots[i].setAttribute("points", projectPip(pip.u, pip.v, pip.r, pip.axis, rxDeg, ryDeg, cx, cy, cz));
        }
      });
      for (let i = allPips.length; i < gfx.pipDots.length; i++) {
        gfx.pipDots[i].style.display = "none";
      }
    }

    function draw() {
      // Die 1: Center at (-18, 0), Top=3, Right=2, Front=1
      renderDie(
        d1Gfx,
        -18, 0, 12.5 + lift1.x,
        wobbleX1.x, wobbleY1.x,
        { top: 3, right: 2, front: 1 }
      );

      // Die 2: Center at (18, 0), Top=4, Right=5, Front=6
      renderDie(
        d2Gfx,
        18, 0, 12.5 + lift2.x,
        wobbleX2.x, wobbleY2.x,
        { top: 4, right: 5, front: 6 }
      );

      read.textContent = "Xúc xắc: Mặt trên 3 + 4 = 7 chấm (Mặt đối diện: 3+4=7, 2+5=7, 1+6=7)";
    }

    function aim(pt) {
      if (!pt) {
        wobbleX1.t = 0; wobbleY1.t = 0; lift1.t = 0;
        wobbleX2.t = 0; wobbleY2.t = 0; lift2.t = 0;
        reg.wake();
        return;
      }
      const s1 = P(-18, 0, 12.5)[0];
      const s2 = P(18, 0, 12.5)[0];

      const h1 = Math.abs(pt[0] - s1) < 30;
      const h2 = Math.abs(pt[0] - s2) < 30;

      lift1.t = h1 ? 4.0 : 0;
      wobbleX1.t = h1 ? (pt[1] - P(-18, 0, 12.5)[1]) * 0.4 : 0;
      wobbleY1.t = h1 ? (pt[0] - s1) * 0.4 : 0;

      lift2.t = h2 ? 4.0 : 0;
      wobbleX2.t = h2 ? (pt[1] - P(18, 0, 12.5)[1]) * 0.4 : 0;
      wobbleY2.t = h2 ? (pt[0] - s2) * 0.4 : 0;

      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(wobbleX1, dt) || HL.stepS(wobbleY1, dt) || HL.stepS(lift1, dt);
      const m2 = HL.stepS(wobbleX2, dt) || HL.stepS(wobbleY2, dt) || HL.stepS(lift2, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        draw();
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 7. Teaching Clock (Mặt Đồng Hồ Học Giờ)
 * Pedagogical Goal: Telling time & 12:1 gear ratio
 * Simplified Geometry: Clean circular clock bezel on an angled stand with 12 hour ticks
 * Meaningful Interaction: Circling pointer smoothly drives minute hand; hour hand follows with exact 12:1 ratio
 */

{
  id: "math-clock",
  title: "7. Mặt Đồng Hồ Học Giờ (Teaching Clock)",
  concept: "Xem giờ đúng & tỷ lệ bánh răng 12:1",
  means: "Đồng hồ để bàn tinh giản: di chuột theo vòng tròn để quay kim phút; kim giờ chuyển động chính xác theo tỷ lệ bánh răng 12:1, hiển thị 12 cọc giờ rõ ràng trực quan.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 3, 12],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-44, -44, 0], [44, 44, 18]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Bezel Body (Z: 0 to 6)
    const [bezelO, bezelI] = HL.rings(-36, -36, 36, 36, 36, 2.5);
    const bezelSol = HL.solid(svg);
    HL.put(bezelSol, HL.prism(P, front, bezelO, bezelI, 0, 6));

    // Dial face rim line
    const dialRim = HL.mk("ellipse", {
      rx: HL.r2(33.0 * C.S), ry: HL.r2(33.0 * C.S * C.k),
      class: "lo nf"
    }, svg);
    const centerScr = P(0, 0, 6.2);
    dialRim.setAttribute("cx", HL.r2(centerScr[0]));
    dialRim.setAttribute("cy", HL.r2(centerScr[1]));

    // 2. 12 Clear Hour Ticks (No SVG Text)
    let marker12El;
    for (let h = 1; h <= 12; h++) {
      const alpha = -Math.PI / 2 + (h / 12) * Math.PI * 2;
      const phi = alpha - Math.PI / 4;
      const isCardinal = (h % 3 === 0);
      const is12 = (h === 12);

      const r1 = is12 ? 24.0 : (isCardinal ? 26.0 : 28.0);
      const r2 = 32.5;

      const p1 = P(Math.cos(phi) * r1, Math.sin(phi) * r1, 6.3);
      const p2 = P(Math.cos(phi) * r2, Math.sin(phi) * r2, 6.3);

      const tLine = HL.mk("line", {
        x1: HL.r2(p1[0]), y1: HL.r2(p1[1]),
        x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
        stroke: (is12 || isCardinal ? "#111113" : "#6f6f78"),
        "stroke-width": (is12 ? 2.0 : (isCardinal ? 1.5 : 1.0)),
        class: (is12 ? "hi" : "")
      }, svg);

      if (is12) marker12El = tLine;
    }

    // 3. Hands: Short & Broad Hour Hand, Long & Slender Minute Hand
    const hourPoly = HL.mk("polygon", {
      style: "fill: #232327; stroke: #111113; stroke-width: 1.0; stroke-linejoin: round;"
    }, svg);

    const minutePoly = HL.mk("polygon", {
      style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;"
    }, svg);

    // Center Axle Pin
    const centerPin = HL.mk("ellipse", {
      rx: HL.r2(2.5 * C.S), ry: HL.r2(2.5 * C.S * C.k),
      fill: "#232327", stroke: "none"
    }, svg);
    centerPin.setAttribute("cx", HL.r2(centerScr[0]));
    centerPin.setAttribute("cy", HL.r2(centerScr[1]));

    const startHour = initialV != null ? HL.clamp(initialV, 0, 12) : 3;
    const minuteAngleSp = HL.spring((startHour % 1) * Math.PI * 2, { k: 140, c: 14 });
    let totalMinutes = startHour * 60;
    let active = false;

    function draw() {
      const mRad = minuteAngleSp.x;
      const hRad = (totalMinutes / 720) * Math.PI * 2;

      const mPhi = mRad - Math.PI / 2 - Math.PI / 4;
      const hPhi = hRad - Math.PI / 2 - Math.PI / 4;

      const zH = 6.6;
      const zM = 7.0;

      // Minute hand: length 25, width 2.0
      const mCos = Math.cos(mPhi), mSin = Math.sin(mPhi);
      const mPerpX = -mSin, mPerpY = mCos;
      const mPts = [
        P(mCos * 25.0, mSin * 25.0, zM),
        P(mCos * 2.5 + mPerpX * 1.6, mSin * 2.5 + mPerpY * 1.6, zM),
        P(-mCos * 4.5, -mSin * 4.5, zM),
        P(mCos * 2.5 - mPerpX * 1.6, mSin * 2.5 - mPerpY * 1.6, zM)
      ];
      minutePoly.setAttribute("points", mPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      // Hour hand: length 16, width 3.0
      const hCos = Math.cos(hPhi), hSin = Math.sin(hPhi);
      const hPerpX = -hSin, hPerpY = hCos;
      const hPts = [
        P(hCos * 16.0, hSin * 16.0, zH),
        P(hCos * 2.5 + hPerpX * 2.4, hSin * 2.5 + hPerpY * 2.4, zH),
        P(-hCos * 3.5, -hSin * 3.5, zH),
        P(hCos * 2.5 - hPerpX * 2.4, hSin * 2.5 - hPerpY * 2.4, zH)
      ];
      hourPoly.setAttribute("points", hPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      if (marker12El) marker12El.classList.toggle("hi", !active);
      minutePoly.classList.toggle("hi", active);

      const hrs = Math.floor((totalMinutes % 720) / 60) || 12;
      const mins = Math.floor(totalMinutes % 60);
      const minStr = mins < 10 ? "0" + mins : mins;
      read.textContent = "Đồng hồ: " + hrs + ":" + minStr + " (Kim phút quay 1 vòng 360° = Kim giờ nhích 1 số)";
    }

    let lastAimAngle = null;

    function aim(pt) {
      if (!pt) {
        active = false;
        lastAimAngle = null;
        reg.wake();
        return;
      }
      const dx = pt[0] - centerScr[0];
      const dy = pt[1] - centerScr[1];
      const dist = Math.hypot(dx, dy);

      if (dist < 10 || dist > 110) return;

      active = true;
      let angle = Math.atan2(dy, dx) + Math.PI / 4 + Math.PI / 2;
      while (angle < 0) angle += Math.PI * 2;
      while (angle >= Math.PI * 2) angle -= Math.PI * 2;

      if (lastAimAngle != null) {
        let diff = angle - lastAimAngle;
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;

        totalMinutes += (diff / (Math.PI * 2)) * 60;
        if (totalMinutes < 0) totalMinutes += 720;
      }
      lastAimAngle = angle;

      minuteAngleSp.t = angle;
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(minuteAngleSp, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        totalMinutes = HL.clamp(v, 0, 12) * 60;
        const targetAng = ((totalMinutes % 60) / 60) * Math.PI * 2;
        minuteAngleSp.t = targetAng;
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 8. 3D Geometric Solids (Khối Hình Không Gian)
 * Pedagogical Goal: 3D solids (Cube, Cylinder, Cone) & their 2D bottom footprints
 * Simplified Geometry: Clean solids on a minimalist base with 3 distinct 2D footprint pockets
 * Meaningful Interaction: Hovering pointer lifts each solid straight up to reveal its 2D shape below
 */

{
  id: "math-shapes",
  title: "8. Khối Hình Không Gian (3D Geometric Solids)",
  concept: "Nhận biết khối lập phương, khối trụ, khối nón & vết đáy 2D",
  means: "Ba khối hình học cơ bản tinh giản trên bàn đế: Khối lập phương, Khối trụ và Khối nón; di chuột để nhấc bổng từng khối, để lộ rõ vết in đáy hình học 2D (Hình vuông, Hình tròn).",
  rules: [1, 2, 4, 7, 9],
  range: [1, 2, 3],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-56, -20, 0], [56, 20, 52]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Baseboard (Z: 0 to 3.5)
    const [baseO, baseI] = HL.rings(-52, -18, 52, 18, 3.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 3.5));

    // 2. Three 2D Footprint Inset Outlines on Baseboard (Z = 3.6)
    // Cube: Square (-36, 0)
    const [sqO] = HL.rings(-45, -9, -27, 9, 1.5, 0.5);
    HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, sqO, 3.6)) }, svg);

    // Cylinder: Circle (0, 0)
    const cyPts = [];
    for (let k = 0; k <= 32; k++) {
      const a = (k / 32) * Math.PI * 2;
      cyPts.push(P(9.5 * Math.cos(a), 9.5 * Math.sin(a), 3.6));
    }
    HL.mk("path", { class: "lo nf", d: HL.poly(cyPts) }, svg);

    // Cone: Circle (36, 0)
    const conePts = [];
    for (let k = 0; k <= 32; k++) {
      const a = (k / 32) * Math.PI * 2;
      conePts.push(P(36 + 9.5 * Math.cos(a), 9.5 * Math.sin(a), 3.6));
    }
    HL.mk("path", { class: "lo nf", d: HL.poly(conePts) }, svg);

    // 3. Three Clean Geometric Solids
    const cubeSol = HL.solid(svg);
    const cylSol = HL.solid(svg);
    const coneSol = HL.solid(svg);
    const dropGuides = HL.mk("path", { class: "nf dash lo" }, svg);

    let activeShape = initialV != null ? HL.clamp(Math.round(initialV), 0, 3) : 2;
    const lift1 = HL.spring(activeShape === 1 ? 18 : 0, { k: 140, c: 14 });
    const lift2 = HL.spring(activeShape === 2 ? 18 : 0, { k: 140, c: 14 });
    const lift3 = HL.spring(activeShape === 3 ? 18 : 0, { k: 140, c: 14 });

    const cyRing = HL.circ(9.5, 32);
    const cyInner = HL.circ(8.5, 32);
    const coneRing = HL.circ(9.5, 32).map(q => ({ u: 36 + q.u, v: q.v, nu: q.nu, nv: q.nv }));

    function setShape(shapeIdx) {
      activeShape = shapeIdx;
      lift1.t = activeShape === 1 ? 18 : 0;
      lift2.t = activeShape === 2 ? 18 : 0;
      lift3.t = activeShape === 3 ? 18 : 0;
      reg.wake();
    }

    function draw() {
      let guides = "";

      // Cube: at X = -36
      const z1 = 3.6 + lift1.x;
      const [cO, cI] = HL.rings(-45, -9, -27, 9, 2.0, 0.8);
      HL.put(cubeSol, HL.prism(P, front, cO, cI, z1, z1 + 18));
      if (lift1.x > 1.0) {
        for (const [cx, cy] of [[-45, -9], [-27, -9], [-27, 9], [-45, 9]]) {
          guides += HL.seg(P(cx, cy, z1), P(cx, cy, 3.6));
        }
      }

      // Cylinder: at X = 0
      const z2 = 3.6 + lift2.x;
      HL.put(cylSol, HL.prism(P, front, cyRing, cyInner, z2, z2 + 20));
      if (lift2.x > 1.0) {
        const ext = HL.extremes(P, cyRing).slice(0, 2);
        ext.forEach(q => {
          guides += HL.seg(P(q.u, q.v, z2), P(q.u, q.v, 3.6));
        });
      }

      // Cone: at X = 36
      const z3 = 3.6 + lift3.x;
      const apex = P(36, 0, z3 + 22);
      const basePts = HL.ringAt(P, coneRing, z3);
      const coneSil = HL.poly(HL.hull([apex, ...basePts]));
      HL.put(coneSol, { sil: coneSil, crease: "" });
      if (lift3.x > 1.0) {
        const ext = HL.extremes(P, coneRing).slice(0, 2);
        ext.forEach(q => {
          guides += HL.seg(P(q.u, q.v, z3), P(q.u, q.v, 3.6));
        });
        guides += HL.seg(P(36, 0, z3), P(36, 0, 3.6));
      }

      dropGuides.setAttribute("d", guides);

      cubeSol.sil.classList.toggle("hi", activeShape === 1);
      cylSol.sil.classList.toggle("hi", activeShape === 2 || activeShape === 0);
      coneSol.sil.classList.toggle("hi", activeShape === 3);

      if (activeShape === 1) {
        read.textContent = "Khối Lập Phương nâng lên: Vết in đáy là Hình Vuông phẳng (4 cạnh bằng nhau)";
      } else if (activeShape === 2) {
        read.textContent = "Khối Trụ nâng lên: Vết in đáy là Hình Tròn phẳng (đường cong tròn kín)";
      } else if (activeShape === 3) {
        read.textContent = "Khối Nón nâng lên: Đáy là Hình Tròn phẳng, thu về 1 đỉnh chóp nhọn";
      } else {
        read.textContent = "Khối không gian: Di chuột vào từng khối để nhấc lên xem vết đáy 2D";
      }
    }

    function aim(pt) {
      if (!pt) {
        setShape(0);
        return;
      }
      const s1 = P(-36, 0, 10)[0];
      const s2 = P(0, 0, 10)[0];
      const s3 = P(36, 0, 10)[0];

      const d1 = Math.abs(pt[0] - s1);
      const d2 = Math.abs(pt[0] - s2);
      const d3 = Math.abs(pt[0] - s3);

      if (d1 < 26) setShape(1);
      else if (d2 < 26) setShape(2);
      else if (d3 < 26) setShape(3);
      else setShape(0);
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(lift1, dt);
      const m2 = HL.stepS(lift2, dt);
      const m3 = HL.stepS(lift3, dt);
      draw();
      return m1 || m2 || m3;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => setShape(0) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setShape(HL.clamp(Math.round(v), 0, 3));
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 9. Fraction Pie (Bánh Phân Số 1/4, 1/2, 3/4, 4/4)
 * Pedagogical Goal: Basic fractions (1/4, 2/4 = 1/2, 3/4, 4/4)
 * Simplified Geometry: Clean round baking tray, clean round plate, 4 quarter pie slices
 * Meaningful Interaction: Moving pointer smoothly transfers 1 to 4 slices from tray to plate
 */

{
  id: "math-fraction-pie",
  title: "9. Bánh Phân Số 1/4 (Fraction Pie)",
  concept: "Phân số cơ bản: một phần tư (1/4), một nửa (1/2), toàn bộ (4/4)",
  means: "Bánh tròn chia 4 miếng quạt 90° tinh giản: di chuột để nhấc các miếng bánh từ khay nướng sang đĩa ăn theo cung bay 3D mượt mà, trực quan hóa 1/4, 2/4 = 1/2, 3/4.",
  rules: [1, 2, 4, 7, 9],
  range: [0, 1, 4],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-58, -24, 0], [58, 24, 35]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    const R = 18.0;
    const H = 7.0;
    const panX = -26;
    const plateX = 26;

    // 1. Clean Round Baking Tray at X = -26 (Z: 0 to 3.5)
    const [panO, panI] = HL.rings(panX - 22, -22, panX + 22, 22, 22, 1.5);
    const panSol = HL.solid(svg);
    HL.put(panSol, HL.prism(P, front, panO, panI, 0, 3.5));

    // 2. Clean Round Serving Plate at X = 26 (Z: 0 to 3.5)
    const [plateO, plateI] = HL.rings(plateX - 22, -22, plateX + 22, 22, 22, 1.5);
    const plateSol = HL.solid(svg);
    HL.put(plateSol, HL.prism(P, front, plateO, plateI, 0, 3.5));

    // 3. Four Clean Quarter Pie Slices
    const renderOrder = [2, 1, 3, 0];
    let takenCount = initialV !== undefined ? Math.round(HL.clamp(initialV, 0, 4)) : 1;

    const pieces = renderOrder.map(i => {
      const a0 = (i * Math.PI) / 2;
      const a1 = ((i + 1) * Math.PI) / 2;
      return {
        idx: i,
        a0,
        a1,
        sol: HL.solid(svg),
        sp: HL.spring(i < takenCount ? 1 : 0, { k: 140, c: 14 })
      };
    });

    function draw() {
      pieces.forEach(pc => {
        const u = pc.sp.x;

        const curX = HL.lerp(panX, plateX, u);
        const curY = 0;
        const curZ0 = 3.6 + 4 * 14 * u * (1 - u);
        const curZ1 = curZ0 + H;

        const numArc = 14;
        const topPts = [P(curX, curY, curZ1)];
        const botPts = [P(curX, curY, curZ0)];

        for (let k = 0; k <= numArc; k++) {
          const ang = pc.a0 + (pc.a1 - pc.a0) * (k / numArc);
          topPts.push(P(curX + R * Math.cos(ang), curY + R * Math.sin(ang), curZ1));
          botPts.push(P(curX + R * Math.cos(ang), curY + R * Math.sin(ang), curZ0));
        }

        const hullPts = HL.hull([...topPts, ...botPts]);
        const sil = HL.poly(hullPts);
        let crease = HL.poly(topPts);

        // Radial face 0
        const n0 = { nu: -Math.sin(pc.a0), nv: Math.cos(pc.a0) };
        if (front(n0)) {
          const pR0_bot = P(curX + R * Math.cos(pc.a0), curY + R * Math.sin(pc.a0), curZ0);
          crease += HL.seg(P(curX, curY, curZ0), pR0_bot);
        }

        // Radial face 1
        const n1 = { nu: Math.sin(pc.a1), nv: -Math.cos(pc.a1) };
        if (front(n1)) {
          const pR1_bot = P(curX + R * Math.cos(pc.a1), curY + R * Math.sin(pc.a1), curZ0);
          crease += HL.seg(P(curX, curY, curZ0), pR1_bot);
        }

        // Curved outer rim bottom arc
        const frontArc = [];
        for (let k = 0; k <= numArc; k++) {
          const ang = pc.a0 + (pc.a1 - pc.a0) * (k / numArc);
          if (front({ nu: Math.cos(ang), nv: Math.sin(ang) })) {
            frontArc.push(P(curX + R * Math.cos(ang), curY + R * Math.sin(ang), curZ0));
          }
        }
        if (frontArc.length > 1) {
          crease += HL.open(frontArc);
        }

        HL.put(pc.sol, { sil, crease });

        const isFocal = (pc.idx === takenCount - 1 && u >= 0.9) || (u > 0.1 && u < 0.9);
        pc.sol.sil.classList.toggle("hi", isFocal);
      });

      if (takenCount === 0) {
        read.textContent = "Bánh nguyên vẹn trong khay: 4/4 = 1 cái bánh";
      } else if (takenCount === 1) {
        read.textContent = "Bốc 1 miếng (1/4) ra đĩa: Trong khay còn lại 3/4 cái bánh";
      } else if (takenCount === 2) {
        read.textContent = "Bốc 2 miếng (2/4) ra đĩa: Đúng một nửa cái bánh (1/2)";
      } else if (takenCount === 3) {
        read.textContent = "Bốc 3 miếng (3/4) ra đĩa: Trong khay chỉ còn 1/4 cái bánh";
      } else {
        read.textContent = "Đã chuyển hết 4/4 miếng ra đĩa: Trọn vẹn 1 cái bánh";
      }
    }

    function setSlices(count) {
      takenCount = HL.clamp(count, 0, 4);
      pieces.forEach(pc => {
        pc.sp.t = pc.idx < takenCount ? 1 : 0;
      });
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setSlices(1);
        return;
      }
      const pLeft = P(panX, 0, 3)[0];
      const pRight = P(plateX, 0, 3)[0];
      const norm = HL.clamp((pt[0] - pLeft) / (pRight - pLeft), 0, 1);
      setSlices(Math.round(norm * 4));
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      pieces.forEach(pc => {
        if (HL.stepS(pc.sp, dt)) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => setSlices(1) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setSlices(Math.round(v));
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 10. Counting Bead String (Chuỗi 10 Hạt Đếm Số)
 * Pedagogical Goal: Part-whole decompositions of 10 (7+3, 6+4, 8+2)
 * Simplified Geometry: Clean wooden baseboard, arched wire, 10 beads (5 dark + 5 light)
 * Meaningful Interaction: Moving pointer smoothly divides beads into left and right groups
 */

{
  id: "math-bead-string",
  title: "10. Chuỗi 10 Hạt Đếm (Counting Bead String)",
  concept: "Tách gộp số 10 (bảng cộng phạm vi 10)",
  means: "Chuỗi 10 hạt đếm trên thanh uốn cong: 5 hạt ngà và 5 hạt gỗ mun; di chuột chia tách số 10 thành các cặp phép cộng (7 + 3, 6 + 4, 8 + 2) mượt mà.",
  rules: [1, 2, 3, 7, 9],
  range: [0, 5, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-58, -16, 0], [58, 16, 46]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Wooden Baseboard (Z: 0 to 4.0)
    const [bO, bI] = HL.rings(-52, -14, 52, 14, 3.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, bO, bI, 0, 4.0));

    // Anchor sockets for wire on base
    HL.mk("circle", { cx: HL.r2(P(-44, 0, 4.1)[0]), cy: HL.r2(P(-44, 0, 4.1)[1]), r: 2.0, fill: "#232327" }, svg);
    HL.mk("circle", { cx: HL.r2(P(44, 0, 4.1)[0]), cy: HL.r2(P(44, 0, 4.1)[1]), r: 2.0, fill: "#232327" }, svg);

    // 2. Parabolic Wire on X-Z Plane
    const wirePts = [];
    for (let s = 0; s <= 48; s++) {
      const t = s / 48;
      const x = HL.lerp(-44, 44, t);
      const z = 4.0 + 130 * t * (1 - t);
      wirePts.push(P(x, 0, z));
    }
    HL.mk("path", { d: HL.open(wirePts), stroke: "#232327", fill: "none", "stroke-width": 1.6 }, svg);

    // 3. Ten Clean Counting Beads (5 dark + 5 light)
    const beads = [];
    const R = 4.5;
    const L = 5.2;
    const r_hole = 1.2;
    const N = 20;

    for (let i = 0; i < 10; i++) {
      const dark = i < 5;
      const sol = HL.solid(svg);
      if (dark) {
        sol.sil.style.fill = "#232327";
        sol.sil.style.stroke = "#111113";
        sol.sil.style.strokeWidth = "1.2px";
        sol.cr.style.stroke = "#e0e0e4";
        sol.cr.style.strokeWidth = "1.0px";
      } else {
        sol.sil.style.fill = "#ffffff";
        sol.sil.style.stroke = "#232327";
        sol.sil.style.strokeWidth = "1.2px";
        sol.cr.style.stroke = "#5b5d64";
        sol.cr.style.strokeWidth = "1.0px";
      }

      // Initial 5 + 5 split
      const initialT = i < 5 ? 0.08 + i * 0.048 : 0.92 - (9 - i) * 0.048;
      beads.push({
        idx: i,
        dark,
        tSp: HL.spring(initialT, { k: 130, c: 14 }),
        sol
      });
    }

    let curSplit = 5;

    function draw() {
      beads.forEach(b => {
        const t = b.tSp.x;
        const x = -44 + 88 * t;
        const z = 4.0 + 130 * t * (1 - t);

        const tx = 88;
        const tz = 130 * (1 - 2 * t);
        const len = Math.hypot(tx, tz);
        const utx = tx / len;
        const utz = tz / len;

        const end1 = [], end2 = [];
        const hole1 = [], hole2 = [];

        for (let k = 0; k < N; k++) {
          const ang = (k / N) * Math.PI * 2;
          const cosA = Math.cos(ang);
          const sinA = Math.sin(ang);

          // End 1
          const p1x = x - (L / 2) * utx + R * sinA * (-utz);
          const p1y = R * cosA;
          const p1z = z - (L / 2) * utz + R * sinA * utx;
          end1.push(P(p1x, p1y, p1z));

          // End 2
          const p2x = x + (L / 2) * utx + R * sinA * (-utz);
          const p2y = R * cosA;
          const p2z = z + (L / 2) * utz + R * sinA * utx;
          end2.push(P(p2x, p2y, p2z));

          // Hole 1 & 2
          hole1.push(P(x - (L / 2) * utx + r_hole * sinA * (-utz), r_hole * cosA, z - (L / 2) * utz + r_hole * sinA * utx));
          hole2.push(P(x + (L / 2) * utx + r_hole * sinA * (-utz), r_hole * cosA, z + (L / 2) * utz + r_hole * sinA * utx));
        }

        const sil = HL.poly(HL.hull(end1.concat(end2)));
        const dotEnd2 = utx * 0.3536 + utz * 0.866;
        const visRim = dotEnd2 > 0 ? end2 : end1;
        const visHole = dotEnd2 > 0 ? hole2 : hole1;
        const crease = HL.poly(visRim) + HL.poly(visHole);

        HL.put(b.sol, { sil, crease });

        const isFocal = (b.idx === curSplit - 1);
        b.sol.sil.classList.toggle("hi", isFocal);
      });

      const leftCount = beads.filter(b => b.tSp.x < 0.5).length;
      const rightCount = 10 - leftCount;
      read.textContent = "Chuỗi hạt: " + leftCount + " (trái) + " + rightCount + " (phải) = 10";
    }

    function setSplit(splitIdx) {
      curSplit = HL.clamp(splitIdx, 0, 10);
      beads.forEach((b, i) => {
        if (i < curSplit) {
          b.tSp.t = 0.08 + i * 0.048;
        } else {
          b.tSp.t = 0.92 - (9 - i) * 0.048;
        }
      });
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setSplit(5);
        return;
      }
      const scrLeft = P(-44, 0, 8)[0];
      const scrRight = P(44, 0, 8)[0];
      const norm = HL.clamp((pt[0] - scrLeft) / (scrRight - scrLeft), 0.05, 0.95);
      setSplit(Math.round(norm * 10));
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      beads.forEach(b => { if (HL.stepS(b.tSp, dt)) moving = true; });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => setSplit(5) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setSplit(Math.round(v));
      },
      destroy: bag.dispose
    };
  }
},
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
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) return;
    if (e.key === "ArrowLeft") $("btn-prev").click();
    if (e.key === "ArrowRight") $("btn-next").click();
    if (e.key >= "1" && e.key <= "9") switchTo(Number(e.key) - 1);
    if (e.key === "0") switchTo(9);
  });

  switchTo(0);
})();
