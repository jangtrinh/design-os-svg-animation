/*
 * 6. Math Dice (Cặp Xúc Xắc Chấm Đố)
 * Pedagogical Goal: Number recognition & subitizing (3 + 4 = 7)
 */

export default {
  id: "math-dice",
  title: "6. Cặp Xúc Xắc (Math Dice Pips)",
  concept: "Phép cộng & nhận biết mặt xúc xắc 3D",
  means: "Hai khối xúc xắc bo góc vát mép tinh giản trên bàn đế: di chuột để nghiêng xoay 3D khám phá các mặt chấm tròn, nhận biết tổng hai mặt trên (3 + 4 = 7) và tính chất mặt đối diện bằng 7.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 3.5, 7],
  mount({ stage, svg, read }) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.0);
    HL.fit(C, [[-44, -16, 0], [44, 16, 26]], 200, 165);
    const P = HL.proj(C), front = HL.facing(C);

    const [matO, matI] = HL.rings(-44, -16, 44, 16, 3.5, 0.8);
    HL.put(HL.solid(svg), HL.prism(P, front, matO, matI, 0, 2.5));

    const d1Group = HL.mk("g", {}, svg);
    const d2Group = HL.mk("g", {}, svg);

    function makeDieGraphics(g, hiTop) {
      return {
        faceX: HL.mk("polygon", { class: "sil" }, g),
        faceY: HL.mk("polygon", { class: "sil" }, g),
        faceZ: HL.mk("polygon", { class: hiTop ? "hi" : "sil" }, g),
        pipDots: Array.from({ length: 15 }, () => HL.mk("polygon", { class: "dot" }, g))
      };
    }

    const d1Gfx = makeDieGraphics(d1Group, true);
    const d2Gfx = makeDieGraphics(d2Group, false);

    const wobbleX1 = HL.spring(0, { k: 140, c: 14 });
    const wobbleY1 = HL.spring(0, { k: 140, c: 14 });
    const lift1 = HL.spring(0, { k: 150, c: 14 });

    const wobbleX2 = HL.spring(0, { k: 140, c: 14 });
    const wobbleY2 = HL.spring(0, { k: 140, c: 14 });
    const lift2 = HL.spring(0, { k: 150, c: 14 });

    const d = 5.0;
    const rPip = 1.5;

    function buildPipsForFace(axis, val) {
      if (val === 1) return [{ axis, u: 0, v: 0, r: rPip * 1.2 }];
      if (val === 2) return [{ axis, u: -d, v: -d, r: rPip }, { axis, u: d, v: d, r: rPip }];
      if (val === 3) return [{ axis, u: -d, v: -d, r: rPip }, { axis, u: 0, v: 0, r: rPip }, { axis, u: d, v: d, r: rPip }];
      if (val === 4) return [{ axis, u: -d, v: -d, r: rPip }, { axis, u: d, v: -d, r: rPip }, { axis, u: -d, v: d, r: rPip }, { axis, u: d, v: d, r: rPip }];
      if (val === 5) return [{ axis, u: -d, v: -d, r: rPip }, { axis, u: d, v: -d, r: rPip }, { axis, u: 0, v: 0, r: rPip }, { axis, u: -d, v: d, r: rPip }, { axis, u: d, v: d, r: rPip }];
      return [{ axis, u: -d, v: -d, r: rPip }, { axis, u: d, v: -d, r: rPip }, { axis, u: -d, v: 0, r: rPip }, { axis, u: d, v: 0, r: rPip }, { axis, u: -d, v: d, r: rPip }, { axis, u: d, v: d, r: rPip }];
    }

    function rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz) {
      const rx = HL.rad(rxDeg), ry = HL.rad(ryDeg);
      const x1 = lx * Math.cos(ry) + lz * Math.sin(ry);
      const z1 = -lx * Math.sin(ry) + lz * Math.cos(ry);
      const y2 = ly * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = ly * Math.sin(rx) + z1 * Math.cos(rx);
      return [cx + x1, cy + y2, cz + z2];
    }

    function projectPip(cu, cv, r, normalAxis, rxDeg, ryDeg, cx, cy, cz) {
      const pts = [];
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        const lx = normalAxis === "X" ? 10.0 : cu + r * Math.cos(a);
        const ly = normalAxis === "Z" ? cv + r * Math.sin(a) : (normalAxis === "X" ? cu + r * Math.cos(a) : 10.0);
        const lz = normalAxis === "Z" ? 10.0 : cv + r * Math.sin(a);
        const w = rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz);
        pts.push(P(w[0], w[1], w[2]).map(HL.r2).join(","));
      }
      return pts.join(" ");
    }

    function renderDie(gfx, cx, cy, cz, rxDeg, ryDeg, faces) {
      const H = 10.0;
      const corners = [
        [-H, -H, -H], [H, -H, -H], [H, H, -H], [-H, H, -H],
        [-H, -H, H], [H, -H, H], [H, H, H], [-H, H, H]
      ].map(([lx, ly, lz]) => {
        const w = rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz);
        return P(w[0], w[1], w[2]);
      });

      gfx.faceZ.setAttribute("points", [corners[4], corners[5], corners[6], corners[7]].map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));
      gfx.faceX.setAttribute("points", [corners[1], corners[2], corners[6], corners[5]].map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));
      gfx.faceY.setAttribute("points", [corners[3], corners[2], corners[6], corners[7]].map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      const allPips = [
        ...buildPipsForFace("Z", faces.top),
        ...buildPipsForFace("X", faces.right),
        ...buildPipsForFace("Y", faces.front)
      ];
      allPips.forEach((pip, i) => {
        if (i < gfx.pipDots.length) {
          gfx.pipDots[i].setAttribute("points", projectPip(pip.u, pip.v, pip.r, pip.axis, rxDeg, ryDeg, cx, cy, cz));
        }
      });
    }

    let lastKey = "";

    function draw() {
      const key = [wobbleX1.x, wobbleY1.x, lift1.x, wobbleX2.x, wobbleY2.x, lift2.x].map(HL.r2).join(":");
      if (key === lastKey) return;
      lastKey = key;

      renderDie(d1Gfx, -18, 0, 12.5 + lift1.x, wobbleX1.x, wobbleY1.x, { top: 3, right: 2, front: 1 });
      renderDie(d2Gfx, 18, 0, 12.5 + lift2.x, wobbleX2.x, wobbleY2.x, { top: 4, right: 5, front: 6 });

      read.textContent = "Xúc xắc: 3 + 4 = 7 chấm";
    }

    function aim(pt) {
      if (!pt) {
        wobbleX1.t = 0; wobbleY1.t = 0; lift1.t = 0;
        wobbleX2.t = 0; wobbleY2.t = 0; lift2.t = 0;
        reg.wake();
        return;
      }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 12.5);
      const h1 = wx < 0;
      lift1.t = h1 ? 4.0 : 0;
      wobbleX1.t = h1 ? HL.clamp(wy * 0.8, -12, 12) : 0;
      wobbleY1.t = h1 ? HL.clamp((wx + 18) * 0.8, -12, 12) : 0;

      lift2.t = !h1 ? 4.0 : 0;
      wobbleX2.t = !h1 ? HL.clamp(wy * 0.8, -12, 12) : 0;
      wobbleY2.t = !h1 ? HL.clamp((wx - 18) * 0.8, -12, 12) : 0;
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
        lift1.t = v > 3.5 ? 3 : 0;
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
