export default {
  id: "math-dice",
  title: "6. Cặp Xúc Xắc (Math Dice Pips)",
  concept: "Phép cộng & tung xúc xắc trực quan",
  means: "Hai khối xúc xắc trên thảm nỉ. Click để tung xúc xắc nảy xoay 3D và rơi ngẫu nhiên các cặp phép cộng lớp 1 (3+4=7, 2+5=7, 5+5=10, 4+2=6).",
  rules: [1, 2, 4, 6, 9],
  range: [0, 0, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-48, -22, 0], [48, 22, 42]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Felt Gaming Mat Base
    const [matO, matI] = HL.rings(-44, -18, 44, 18, 4, 1.5);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2));

    // Dice Groups
    const d1Group = HL.mk("g", { id: "die-1" }, svg);
    const d2Group = HL.mk("g", { id: "die-2" }, svg);

    // Faces for Die 1
    const d1FaceX = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d1Group);
    const d1FaceY = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d1Group);
    const d1FaceZ = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d1Group);

    // Faces for Die 2
    const d2FaceX = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d2Group);
    const d2FaceY = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d2Group);
    const d2FaceZ = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d2Group);

    // Dynamic Pip Holders (up to 21 pips per die)
    const d1Pips = [];
    for (let i = 0; i < 21; i++) {
      d1Pips.push(HL.mk("path", { style: "fill: #232327; stroke: none;" }, d1Group));
    }
    const d2Pips = [];
    for (let i = 0; i < 21; i++) {
      d2Pips.push(HL.mk("path", { style: "fill: #232327; stroke: none;" }, d2Group));
    }

    // 3D Springs for toss and bounce
    const wobbleX1 = HL.spring(0, { k: 140, c: 14 });
    const wobbleY1 = HL.spring(0, { k: 140, c: 14 });
    const lift1 = HL.spring(0, { k: 160, c: 13 });

    const wobbleX2 = HL.spring(0, { k: 140, c: 14 });
    const wobbleY2 = HL.spring(0, { k: 140, c: 14 });
    const lift2 = HL.spring(0, { k: 160, c: 13 });

    // Presets of educational Grade 1 dice rolls
    const ROLLS = [
      { val1: 3, val2: 4, label: "3 + 4 = 7" },
      { val1: 2, val2: 5, label: "2 + 5 = 7" },
      { val1: 5, val2: 5, label: "5 + 5 = 10 (Đôi năm tròn mười!)" },
      { val1: 4, val2: 2, label: "4 + 2 = 6" },
      { val1: 1, val2: 6, label: "1 + 6 = 7" },
      { val1: 6, val2: 3, label: "6 + 3 = 9" }
    ];

    let rollIdx = initialV != null ? HL.clamp(Math.round(initialV), 0, ROLLS.length - 1) : 0;

    // Standard Pip Positions on a 20x20 face
    const d = 5.2;
    const rStandard = 1.55;
    const rCenter = 1.75;

    function buildPipsForFace(axis, val) {
      const pips = [];
      if (val === 1) {
        pips.push({ axis, u: 0, v: 0, r: rCenter });
      } else if (val === 2) {
        pips.push({ axis, u: -d, v: -d, r: rStandard });
        pips.push({ axis, u:  d, v:  d, r: rStandard });
      } else if (val === 3) {
        pips.push({ axis, u: -d, v: -d, r: rStandard });
        pips.push({ axis, u:  0, v:  0, r: rCenter });
        pips.push({ axis, u:  d, v:  d, r: rStandard });
      } else if (val === 4) {
        pips.push({ axis, u: -d, v: -d, r: rStandard });
        pips.push({ axis, u:  d, v: -d, r: rStandard });
        pips.push({ axis, u: -d, v:  d, r: rStandard });
        pips.push({ axis, u:  d, v:  d, r: rStandard });
      } else if (val === 5) {
        pips.push({ axis, u: -d, v: -d, r: rStandard });
        pips.push({ axis, u:  d, v: -d, r: rStandard });
        pips.push({ axis, u:  0, v:  0, r: rCenter });
        pips.push({ axis, u: -d, v:  d, r: rStandard });
        pips.push({ axis, u:  d, v:  d, r: rStandard });
      } else if (val === 6) {
        pips.push({ axis, u: -d, v: -d, r: rStandard });
        pips.push({ axis, u:  d, v: -d, r: rStandard });
        pips.push({ axis, u: -d, v:  0, r: rStandard });
        pips.push({ axis, u:  d, v:  0, r: rStandard });
        pips.push({ axis, u: -d, v:  d, r: rStandard });
        pips.push({ axis, u:  d, v:  d, r: rStandard });
      }
      return pips;
    }

    function getDieConfig(topVal) {
      // Opposite faces sum to 7: top + bottom = 7
      // If top is 1: bottom 6, left 2, right 3
      // If top is 3: bottom 4, left 1, right 2
      // If top is 4: bottom 3, left 5, right 6
      let leftVal = 1, rightVal = 2;
      if (topVal === 1) { leftVal = 2; rightVal = 3; }
      else if (topVal === 2) { leftVal = 1; rightVal = 4; }
      else if (topVal === 3) { leftVal = 1; rightVal = 2; }
      else if (topVal === 4) { leftVal = 5; rightVal = 6; }
      else if (topVal === 5) { leftVal = 3; rightVal = 1; }
      else if (topVal === 6) { leftVal = 4; rightVal = 2; }

      return [
        ...buildPipsForFace('x', rightVal),
        ...buildPipsForFace('y', leftVal),
        ...buildPipsForFace('z', topVal)
      ];
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
      const N = 12;
      const pts = [];
      for (let i = 0; i < N; i++) {
        const theta = (i / N) * Math.PI * 2;
        const u = cu + r * Math.cos(theta);
        const v = cv + r * Math.sin(theta);
        let lx, ly, lz;
        if (normalAxis === 'z') {
          lx = u; ly = v; lz = 10.05;
        } else if (normalAxis === 'y') {
          lx = u; ly = 10.05; lz = v;
        } else {
          lx = 10.05; ly = u; lz = v;
        }
        const wPt = rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz);
        pts.push(P(...wPt));
      }
      return HL.poly(pts);
    }

    function drawDie(cx, baseZ, rxDeg, ryDeg, faceX, faceY, faceZ, pips, pipConfig) {
      const s = 10;
      const cz = baseZ + s;

      const c_000 = rotatePoint(-s, -s, -s, rxDeg, ryDeg, cx, 0, cz);
      const c_100 = rotatePoint( s, -s, -s, rxDeg, ryDeg, cx, 0, cz);
      const c_010 = rotatePoint(-s,  s, -s, rxDeg, ryDeg, cx, 0, cz);
      const c_110 = rotatePoint( s,  s, -s, rxDeg, ryDeg, cx, 0, cz);
      const c_001 = rotatePoint(-s, -s,  s, rxDeg, ryDeg, cx, 0, cz);
      const c_101 = rotatePoint( s, -s,  s, rxDeg, ryDeg, cx, 0, cz);
      const c_011 = rotatePoint(-s,  s,  s, rxDeg, ryDeg, cx, 0, cz);
      const c_111 = rotatePoint( s,  s,  s, rxDeg, ryDeg, cx, 0, cz);

      const ptsX = [P(...c_100), P(...c_110), P(...c_111), P(...c_101)];
      faceX.setAttribute("points", ptsX.map(p => p.map(HL.r2).join(",")).join(" "));

      const ptsY = [P(...c_010), P(...c_110), P(...c_111), P(...c_011)];
      faceY.setAttribute("points", ptsY.map(p => p.map(HL.r2).join(",")).join(" "));

      const ptsZ = [P(...c_001), P(...c_101), P(...c_111), P(...c_011)];
      faceZ.setAttribute("points", ptsZ.map(p => p.map(HL.r2).join(",")).join(" "));

      for (let i = 0; i < pips.length; i++) {
        if (i < pipConfig.length) {
          const cfg = pipConfig[i];
          const pathStr = projectPip(cfg.u, cfg.v, cfg.r, cfg.axis, rxDeg, ryDeg, cx, 0, cz);
          pips[i].style.display = "";
          pips[i].setAttribute("d", pathStr);
        } else {
          pips[i].style.display = "none";
        }
      }
    }

    function aim(pt) {
      if (!pt) {
        wobbleX1.t = 0; wobbleY1.t = 0; lift1.t = 0;
        wobbleX2.t = 0; wobbleY2.t = 0; lift2.t = 0;
        reg.wake();
        return;
      }
      const p1Scr = P(-22, 0, 12);
      const p2Scr = P( 22, 0, 12);
      const midX = (p1Scr[0] + p2Scr[0]) / 2;
      const midY = (p1Scr[1] + p2Scr[1]) / 2;

      const tiltX = HL.clamp((pt[1] - midY) * 0.3, -12, 12);
      const tiltY = HL.clamp(-(pt[0] - midX) * 0.3, -12, 12);

      wobbleX1.t = tiltX; wobbleY1.t = tiltY; lift1.t = 2.0;
      wobbleX2.t = tiltX; wobbleY2.t = tiltY; lift2.t = 2.0;
      reg.wake();
    }

    function draw() {
      const cfg1 = getDieConfig(3);
      const cfg2 = getDieConfig(4);

      const baseZ1 = 2 + Math.max(0, lift1.x);
      const baseZ2 = 2 + Math.max(0, lift2.x);

      drawDie(-22, baseZ1, wobbleX1.x, wobbleY1.x, d1FaceX, d1FaceY, d1FaceZ, d1Pips, cfg1);
      drawDie( 22, baseZ2, wobbleX2.x, wobbleY2.x, d2FaceX, d2FaceY, d2FaceZ, d2Pips, cfg2);

      read.textContent = "Xúc xắc 3D: Mặt trên 3 + 4 = 7 (Tổng các chấm tròn đối diện = 7)";
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(wobbleX1, dt) || HL.stepS(wobbleY1, dt) || HL.stepS(lift1, dt);
      const m2 = HL.stepS(wobbleX2, dt) || HL.stepS(wobbleY2, dt) || HL.stepS(lift2, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => {
        wobbleX1.t = 0; wobbleY1.t = 0; lift1.t = 0;
        wobbleX2.t = 0; wobbleY2.t = 0; lift2.t = 0;
        reg.wake();
      }
    }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        const t = (v - 2.5) / 2.5;
        wobbleY1.t = t * 10;
        wobbleY2.t = -t * 10;
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
