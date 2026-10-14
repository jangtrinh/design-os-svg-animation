/*
 * 2. Math Balance Scale (Cân Thăng Bằng Số Học)
 * Pedagogical Goal: Number comparison (lớn hơn, bé hơn, bằng nhau)
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
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.1);
    HL.fit(C, [[-48, -14, 0], [48, 14, 42]], 200, 165);
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
    HL.mk("ellipse", {
      cx: HL.r2(pinScr[0]), cy: HL.r2(pinScr[1]),
      rx: 3.2, ry: 3.2, class: "sil"
    }, svg);
    HL.mk("ellipse", {
      cx: HL.r2(pinScr[0]), cy: HL.r2(pinScr[1]),
      rx: 1.5, ry: 1.5, class: "dot"
    }, svg);

    // 3. Simple 3-tick indicator scale (-1, 0, +1)
    const tickMid = P(0, 3.4, 25);
    const tickMidTop = P(0, 3.4, 22.5);
    HL.mk("line", {
      x1: HL.r2(tickMid[0]), y1: HL.r2(tickMid[1]),
      x2: HL.r2(tickMidTop[0]), y2: HL.r2(tickMidTop[1]),
      class: "hi"
    }, svg);

    for (const sx of [-6, 6]) {
      const p1 = P(sx, 3.4, 25.5);
      const p2 = P(sx * 0.85, 3.4, 23.5);
      HL.mk("line", {
        x1: HL.r2(p1[0]), y1: HL.r2(p1[1]),
        x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
        class: "lo"
      }, svg);
    }

    // 4. Moving Balance Elements
    const beamSol = HL.solid(svg);
    const needleLine = HL.mk("line", { class: "hi" }, svg);
    const needleTip = HL.mk("ellipse", { rx: 1.8, ry: 1.8, class: "dot" }, svg);

    const leftPanSol = HL.solid(svg);
    const rightPanSol = HL.solid(svg);
    const cords = HL.mk("path", { class: "nf lo" }, svg);

    const leftWeights = Array.from({ length: 3 }, () => HL.solid(svg));
    const rightWeights = Array.from({ length: 3 }, () => HL.solid(svg));

    const initAngle = initialV != null ? HL.clamp(initialV * 0.16, -0.16, 0.16) : 0;
    const tiltSpring = HL.spring(initAngle, { k: 120, c: 13 });
    const beamLen = 38;
    const fulcrumZ = 38;
    const cordLen = 22;
    let lastKey = "";

    function draw() {
      const angle = tiltSpring.x;
      const key = String(HL.r2(angle));
      if (key === lastKey) return;
      lastKey = key;

      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);

      const lx = -beamLen * cosA;
      const lz = fulcrumZ - beamLen * sinA;
      const rx = beamLen * cosA;
      const rz = fulcrumZ + beamLen * sinA;

      const topPts = [
        P(lx, 0, lz),
        P(0, 0, fulcrumZ + 2.5),
        P(rx, 0, rz),
        P(0, 0, fulcrumZ - 2.5)
      ];
      const botPts = topPts.map(p => [p[0], p[1] + 2.0]);
      HL.put(beamSol, { sil: HL.poly(HL.hull([...topPts, ...botPts])), crease: HL.poly(topPts) });

      const nTipX = -14 * sinA;
      const nTipZ = fulcrumZ - 14 * cosA;
      const nBaseScr = P(0, 3.6, fulcrumZ);
      const nTipScr = P(nTipX, 3.6, nTipZ);
      needleLine.setAttribute("x1", HL.r2(nBaseScr[0]));
      needleLine.setAttribute("y1", HL.r2(nBaseScr[1]));
      needleLine.setAttribute("x2", HL.r2(nTipScr[0]));
      needleLine.setAttribute("y2", HL.r2(nTipScr[1]));
      HL.place(needleTip, nTipScr);

      const panRadius = 11;
      const lPanZ = lz - cordLen;
      const rPanZ = rz - cordLen;

      const [lpO, lpI] = HL.rings(lx - panRadius, -panRadius, lx + panRadius, panRadius, panRadius, 0.8);
      HL.put(leftPanSol, HL.prism(P, front, lpO, lpI, lPanZ, lPanZ + 1.8));

      const [rpO, rpI] = HL.rings(rx - panRadius, -panRadius, rx + panRadius, panRadius, panRadius, 0.8);
      HL.put(rightPanSol, HL.prism(P, front, rpO, rpI, rPanZ, rPanZ + 1.8));

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

      const wOffsets = [[-3.5, -2], [3.5, -2], [0, 3.5]];
      wOffsets.forEach(([ox, oy], i) => {
        const [wlO, wlI] = HL.rings(lx + ox - 2.6, oy - 2.6, lx + ox + 2.6, oy + 2.6, 2.6, 0.5);
        HL.put(leftWeights[i], HL.prism(P, front, wlO, wlI, lPanZ + 1.8, lPanZ + 8.5));

        const [wrO, wrI] = HL.rings(rx + ox - 2.6, oy - 2.6, rx + ox + 2.6, oy + 2.6, 2.6, 0.5);
        HL.put(rightWeights[i], HL.prism(P, front, wrO, wrI, rPanZ + 1.8, rPanZ + 8.5));
      });

      const isBalanced = Math.abs(angle) < 0.03;
      beamSol.sil.classList.toggle("hi", isBalanced);
      leftPanSol.sil.classList.toggle("hi", angle < -0.03);
      rightPanSol.sil.classList.toggle("hi", angle > 0.03);

      if (isBalanced) {
        read.textContent = "Cân bằng: 3 = 3";
      } else if (angle < -0.03) {
        read.textContent = "Nghiêng trái: 4 > 2";
      } else {
        read.textContent = "Nghiêng phải: 2 < 4";
      }
    }

    function aim(pt) {
      if (!pt) {
        tiltSpring.t = 0;
        reg.wake();
        return;
      }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], fulcrumZ);
      const axis = (wx - wy) * Math.SQRT1_2;
      tiltSpring.t = HL.clamp(axis * 0.0045, -0.16, 0.16);
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
