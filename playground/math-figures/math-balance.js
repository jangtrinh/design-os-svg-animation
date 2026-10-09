/*
 * 2. Math Balance Scale (Cân Thăng Bằng Số Học)
 * Pedagogical Goal: Number comparison (lớn hơn, bé hơn, bằng nhau)
 * Simplified Geometry: Clean balance beam, center fulcrum mast, two hanging pans
 * Meaningful Interaction: Moving pointer left/right tilts scale with needle indicating =, >, <
 */

export default {
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
};
