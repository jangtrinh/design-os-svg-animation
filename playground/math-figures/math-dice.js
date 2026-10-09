/*
 * 6. Math Dice (Cặp Xúc Xắc Chấm Đố)
 * Pedagogical Goal: Number recognition & subitizing (3 + 4 = 7, opposite faces sum to 7)
 * Simplified Geometry: Clean chamfered cubes with solid bold pips on a minimalist mat
 * Meaningful Interaction: Moving pointer smoothly tilts/wobbles dice to explore 3D faces
 */

export default {
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
};
