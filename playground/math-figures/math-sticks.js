/*
 * 1. Math Counting Sticks (Bó Que Tính Chục & Đơn Vị)
 * Authentic Grade 1 Pedagogical Manipulative: Place Value (Tens & Units)
 * 10 sticks bundled with an accent band + loose unit sticks on wooden mat
 */

export default {
  id: "math-sticks",
  title: "1. Bó Que Tính (Counting Sticks Bundle)",
  concept: "Chục và đơn vị · Các số từ 11 đến 20",
  means: "1 bó chục (10 que tính buộc đai) cùng các que tính rời nằm phẳng trên mặt bàn; di chuột kéo que rời ra/vào để học cấu tạo số 1 chục và các đơn vị (10 + 3 = 13).",
  rules: [1, 2, 3, 5, 8],
  range: [0, 3, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-55, -20, 0], [55, 20, 30]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Desktop Wooden Mat
    const [matO, matI] = HL.rings(-52, -18, 52, 18, 3, 1.2);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2.5));

    // Divider groove line between Tens (Left) and Units (Right)
    HL.mk("line", {
      x1: P(0, -17, 2.6)[0], y1: P(0, -17, 2.6)[1],
      x2: P(0, 17, 2.6)[0], y2: P(0, 17, 2.6)[1],
      stroke: "#e0e0e4", "stroke-width": 1, "stroke-dasharray": "3 2"
    }, svg);

    // Labels etched on the mat
    const tensLabelPt = P(-26, -14, 2.6);
    const unitsLabelPt = P(26, -14, 2.6);
    const tText = HL.mk("text", {
      x: tensLabelPt[0], y: tensLabelPt[1],
      fill: "#6f6f78", "font-size": "9px", "font-family": "ui-monospace, monospace",
      "text-anchor": "middle", "font-weight": "600"
    }, svg);
    tText.textContent = "CHỤC (10)";

    const uText = HL.mk("text", {
      x: unitsLabelPt[0], y: unitsLabelPt[1],
      fill: "#6f6f78", "font-size": "9px", "font-family": "ui-monospace, monospace",
      "text-anchor": "middle", "font-weight": "600"
    }, svg);
    uText.textContent = "ĐƠN VỊ";

    // 2. The Bundle of 10 Sticks (Left side: x in [-46, -6])
    // 3 layers: Layer 1 (bottom: 4 sticks), Layer 2 (mid: 3 sticks), Layer 3 (top: 3 sticks)
    const bundleStickConfigs = [
      // Bottom layer (z: 2.6 to 4.8)
      { y: -6.6, z0: 2.6, z1: 4.8 },
      { y: -2.2, z0: 2.6, z1: 4.8 },
      { y: 2.2, z0: 2.6, z1: 4.8 },
      { y: 6.6, z0: 2.6, z1: 4.8 },
      // Middle layer (z: 4.8 to 7.0)
      { y: -4.4, z0: 4.8, z1: 7.0 },
      { y: 0.0, z0: 4.8, z1: 7.0 },
      { y: 4.4, z0: 4.8, z1: 7.0 },
      // Top layer (z: 7.0 to 9.2)
      { y: -4.4, z0: 7.0, z1: 9.2 },
      { y: 0.0, z0: 7.0, z1: 9.2 },
      { y: 4.4, z0: 7.0, z1: 9.2 }
    ];

    const bundleSols = bundleStickConfigs.map(() => HL.solid(svg));
    bundleStickConfigs.forEach((cfg, i) => {
      const [sO, sI] = HL.rings(-45, cfg.y - 1.8, -7, cfg.y + 1.8, 1.8, 0.5);
      HL.put(bundleSols[i], HL.prism(P, front, sO, sI, cfg.z0, cfg.z1));
    });

    // Tie Band around the bundle (at x in [-28, -24])
    const [bandO, bandI] = HL.rings(-28.5, -8.2, -23.5, 8.2, 2.5, 0.6);
    const bandSol = HL.solid(svg);
    bandSol.g.classList.add("hi");
    HL.put(bandSol, HL.prism(P, front, bandO, bandI, 2.6, 9.8));

    // 3. Loose Units Sticks (Right side: 5 sticks)
    // Spaced at y = -8, -4, 0, 4, 8
    const looseSticks = [];
    const unitYs = [-8, -4, 0, 4, 8];
    for (let i = 0; i < 5; i++) {
      looseSticks.push({
        idx: i,
        baseY: unitYs[i],
        active: i < 3, // Default: 3 loose sticks (10 + 3 = 13)
        spX: HL.spring(i < 3 ? 1 : 0, { k: 130, c: 14 }),
        sol: HL.solid(svg)
      });
    }

    function draw() {
      let activeCount = 0;
      looseSticks.forEach(st => {
        if (st.spX.x > 0.4) activeCount++;
        // When active, stick is aligned at rest x=[10, 46].
        // When inactive (or pulled back), stick slides slightly to the right x=[18, 54] or dims
        const slide = (1 - st.spX.x) * 10;
        const x0 = 8 + slide;
        const x1 = 44 + slide;
        const [sO, sI] = HL.rings(x0, st.baseY - 1.6, x1, st.baseY + 1.6, 1.6, 0.4);
        const z0 = 2.6 + st.spX.x * 0.4;
        const z1 = z0 + 2.2;
        HL.put(st.sol, HL.prism(P, front, sO, sI, z0, z1));

        if (st.spX.x > 0.6) {
          st.sol.g.style.opacity = "1";
        } else {
          st.sol.g.style.opacity = "0.35";
        }
      });

      const total = 10 + activeCount;
      const readouts = {
        10: "1 chục (10) + 0 đơn vị = 10 que tính",
        11: "1 chục (10) + 1 que rời = 11 (Mười một)",
        12: "1 chục (10) + 2 que rời = 12 (Mười hai)",
        13: "1 chục (10) + 3 que rời = 13 (Mười ba)",
        14: "1 chục (10) + 4 que rời = 14 (Mười bốn)",
        15: "1 chục (10) + 5 que rời = 15 (Mười lăm)"
      };
      read.textContent = readouts[total] || (total + " que tính");
    }

    function aim(pt) {
      if (!pt) return;
      const [u, v] = pt;
      // If pointer is on the right half, count based on how many sticks are hovered
      const scrU0 = P(8, 0, 3)[0];
      if (u < scrU0) {
        // Hovering on bundle: reset to 3
        return;
      }
      // Calculate how many sticks to activate based on Y or X position
      looseSticks.forEach(st => {
        const ptScr = P(26, st.baseY, 3);
        const distY = v - ptScr[1];
        // If pointer is above or near this stick in screen space
        st.spX.t = (v >= ptScr[1] - 12) ? 1 : 0;
      });
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      looseSticks.forEach(st => {
        if (HL.stepS(st.spX, dt)) moving = true;
      });
      draw();
      return moving;
    });
    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => {} }));
    bag.add(() => svg.replaceChildren());

    draw();
    return {
      set(v) {
        const count = Math.round(HL.clamp(v, 0, 5));
        looseSticks.forEach((st, i) => {
          st.spX.t = i < count ? 1 : 0;
        });
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
