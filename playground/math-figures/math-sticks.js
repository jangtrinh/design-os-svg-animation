/*
 * 1. Counting Sticks Bundle (Bó Que Tính Chục & Đơn Vị)
 * Pedagogical Goal: Place value in Grade 1 (Tens & Units, numbers 11 to 19)
 * Simplified Geometry: 1 bundle of 10 tied sticks (1 chục) + loose unit sticks on a clean desk mat
 * Meaningful Interaction: Moving pointer smoothly adds/removes loose unit sticks (1 to 5)
 */

export default {
  id: "math-sticks",
  title: "1. Bó Que Tính (Counting Sticks Bundle)",
  concept: "Chục và đơn vị · Các số từ 11 đến 19",
  means: "1 bó chục (10 que tính buộc đai) cùng các que tính rời trên mặt bàn: di chuột để thêm/bớt que rời từ 1 đến 5, trực quan hóa cấu tạo số (1 chục và 3 đơn vị = 13).",
  rules: [1, 2, 4, 7, 9],
  range: [1, 3, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-54, -20, 0], [54, 20, 26]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Desktop Mat (Z: 0 to 2.5)
    const [matO, matI] = HL.rings(-50, -16, 50, 16, 3.0, 0.8);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2.5));

    // Subtle divider groove between Tens (Left) and Units (Right)
    HL.mk("line", {
      x1: HL.r2(P(0, -14, 2.6)[0]), y1: HL.r2(P(0, -14, 2.6)[1]),
      x2: HL.r2(P(0, 14, 2.6)[0]), y2: HL.r2(P(0, 14, 2.6)[1]),
      class: "lo", "stroke-width": 1.0, "stroke-dasharray": "3 2"
    }, svg);

    // 2. The Bundle of 10 Sticks (Left side: X from -42 to -8)
    // Symmetrically arranged: 3 bottom, 4 middle, 3 top (3 + 4 + 3 = 10)
    const stickR = 1.6;
    const bundleYzs = [
      // Bottom layer 3 sticks (Z = 4.2)
      { y: -3.6, z: 4.2 }, { y: 0.0, z: 4.2 }, { y: 3.6, z: 4.2 },
      // Mid layer 4 sticks (Z = 7.0)
      { y: -5.4, z: 7.0 }, { y: -1.8, z: 7.0 }, { y: 1.8, z: 7.0 }, { y: 5.4, z: 7.0 },
      // Top layer 3 sticks (Z = 9.8)
      { y: -3.6, z: 9.8 }, { y: 0.0, z: 9.8 }, { y: 3.6, z: 9.8 }
    ];

    const yz = (x, y, z, radius) => HL.circ(radius, 24).map(q => P(x, y + q.u, z + q.v));

    // Render sticks sorted by depth (back to front) so front cylinders cleanly occlude back ones
    const sortedSticks = bundleYzs.slice().sort((a, b) => {
      const depthA = a.y * Math.SQRT1_2 + a.z * 0.5;
      const depthB = b.y * Math.SQRT1_2 + b.z * 0.5;
      return depthA - depthB;
    });

    sortedSticks.forEach(({ y, z }) => {
      const sol = HL.solid(svg);
      const x0 = -42, x1 = -8;
      const ring0 = yz(x0, y, z, stickR);
      const ring1 = yz(x1, y, z, stickR);
      HL.put(sol, {
        sil: HL.poly(HL.hull(ring0.concat(ring1))),
        crease: HL.poly(ring1)
      });
    });

    // Tight Tie Ribbon (Dải ruy-băng / Dây nơ ôm sát quanh thân bó que ở X = -25)
    // Curves over the visible front & top perimeter of the 3-4-3 stick bundle
    const bandLoopYZ = [
      [-7.2, 7.0], [-7.1, 6.4], [-6.8, 5.8], [-5.2, 3.2], [-4.8, 2.8], [-4.2, 2.5],
      [-3.6, 2.4], [0.0, 2.4], [3.6, 2.4], [4.2, 2.5], [4.8, 2.8], [5.2, 3.2],
      [6.8, 5.8], [7.1, 6.4], [7.2, 7.0], [7.1, 7.6], [6.8, 8.2], [5.2, 10.8],
      [4.8, 11.2], [4.2, 11.5], [3.6, 11.6], [0.0, 11.6], [-3.6, 11.6], [-4.2, 11.5],
      [-4.8, 11.2], [-5.2, 10.8], [-6.8, 8.2], [-7.1, 7.6]
    ];

    // Visible arc segments in front & top of the bundle (from bottom-front around to top-back)
    const frontArcYZ = bandLoopYZ.slice(10, 24);
    const bandX0 = -26.0, bandX1 = -24.0;
    const bandPts0 = frontArcYZ.map(p => P(bandX0, p[0], p[1]));
    const bandPts1 = frontArcYZ.map(p => P(bandX1, p[0], p[1]));

    const strapG = HL.mk("g", { class: "hi" }, svg);
    // Ribbon strap surface wrapping over the bundle
    HL.mk("path", {
      d: HL.poly([...bandPts0, ...bandPts1.slice().reverse()]),
      fill: "#ffffff", stroke: "#232327", "stroke-width": 1.2
    }, strapG);

    // Ribbon Knot & Bow on top of the bundle (Nút thắt nơ dây buộc ở đỉnh bó que)
    const knotCenter = P(-24.0, 0.0, 11.6);
    // Left and right bow loops
    HL.mk("path", {
      d: "M" + HL.r2(knotCenter[0]) + " " + HL.r2(knotCenter[1]) +
         " C" + HL.r2(knotCenter[0] - 6) + " " + HL.r2(knotCenter[1] - 4) +
         " " + HL.r2(knotCenter[0] - 8) + " " + HL.r2(knotCenter[1] + 2) +
         " " + HL.r2(knotCenter[0]) + " " + HL.r2(knotCenter[1]) +
         " C" + HL.r2(knotCenter[0] + 6) + " " + HL.r2(knotCenter[1] - 4) +
         " " + HL.r2(knotCenter[0] + 8) + " " + HL.r2(knotCenter[1] + 2) +
         " " + HL.r2(knotCenter[0]) + " " + HL.r2(knotCenter[1]),
      fill: "#ffffff", stroke: "#232327", "stroke-width": 1.0
    }, strapG);
    // Small center knot circle
    HL.mk("circle", {
      cx: HL.r2(knotCenter[0]), cy: HL.r2(knotCenter[1]), r: 1.6,
      fill: "#232327", stroke: "#ffffff", "stroke-width": 0.6
    }, strapG);



    // 3. Loose Unit Sticks (Right side: X from 8 to 42)
    // 5 single loose sticks arranged parallel
    const looseSticks = [];
    for (let i = 0; i < 5; i++) {
      const sol = HL.solid(svg);
      const y = -8.0 + i * 4.0;
      looseSticks.push({
        idx: i,
        y,
        spZ: HL.spring(0, { k: 160, c: 15 }),
        sol
      });
    }

    let unitCount = initialV != null ? HL.clamp(Math.round(initialV), 1, 5) : 3;

    function draw() {
      looseSticks.forEach((stk, i) => {
        const active = i < unitCount;
        const curZ = 4.2 + stk.spZ.x;

        if (active || stk.spZ.x > 0.2) {
          const x0 = 8, x1 = 42;
          const r0 = yz(x0, stk.y, curZ, stickR);
          const r1 = yz(x1, stk.y, curZ, stickR);
          HL.put(stk.sol, {
            sil: HL.poly(HL.hull(r0.concat(r1))),
            crease: HL.poly(r1)
          });
          stk.sol.sil.style.display = "";
        } else {
          HL.put(stk.sol, { sil: "", crease: "" });
        }
      });

      const total = 10 + unitCount;
      read.textContent = "Bó que tính: 1 bó chục (10) + " + unitCount + " que rời = " + total + " (1 chục và " + unitCount + " đơn vị)";
    }

    function aim(pt) {
      if (!pt) {
        unitCount = 3;
        looseSticks.forEach((stk, i) => { stk.spZ.t = i < unitCount ? 0 : -8; });
        reg.wake();
        return;
      }
      const sRight = P(25, 0, 5)[0];
      if (Math.abs(pt[0] - sRight) < 32) {
        const topY = P(25, -12, 5)[1];
        const botY = P(25, 12, 5)[1];
        const norm = HL.clamp((pt[1] - topY) / (botY - topY), 0, 1);
        unitCount = Math.min(5, Math.max(1, Math.round(1 + norm * 4)));
        looseSticks.forEach((stk, i) => {
          stk.spZ.t = i < unitCount ? 0 : -8;
        });
        reg.wake();
      }
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      looseSticks.forEach(stk => {
        if (HL.stepS(stk.spZ, dt)) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    // Initial state
    looseSticks.forEach((stk, i) => { stk.spZ.x = i < unitCount ? 0 : -8; stk.spZ.t = stk.spZ.x; });
    draw();

    return {
      set(v) {
        unitCount = HL.clamp(Math.round(v), 1, 5);
        looseSticks.forEach((stk, i) => { stk.spZ.t = i < unitCount ? 0 : -8; });
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
