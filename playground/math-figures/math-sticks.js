/*
 * 1. Counting Sticks Bundle (Bó Que Tính Chục & Đơn Vị)
 * Pedagogical Goal: Place value in Grade 1 (Tens & Units, numbers 11 to 19)
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
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.1);
    HL.fit(C, [[-50, -16, 0], [50, 16, 14]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Desktop Mat (Z: 0 to 2.5)
    const [matO, matI] = HL.rings(-50, -16, 50, 16, 3.0, 0.8);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2.5));

    // Divider groove between Tens (Left) and Units (Right)
    const d0 = P(0, -14, 2.6), d1 = P(0, 14, 2.6);
    HL.mk("line", {
      x1: HL.r2(d0[0]), y1: HL.r2(d0[1]),
      x2: HL.r2(d1[0]), y2: HL.r2(d1[1]),
      class: "lo dash"
    }, svg);

    // 2. The Bundle of 10 Sticks (Left side: X from -42 to -8)
    const stickR = 1.6;
    const bundleYzs = [
      { y: -3.6, z: 4.2 }, { y: 0.0, z: 4.2 }, { y: 3.6, z: 4.2 },
      { y: -5.4, z: 7.0 }, { y: -1.8, z: 7.0 }, { y: 1.8, z: 7.0 }, { y: 5.4, z: 7.0 },
      { y: -3.6, z: 9.8 }, { y: 0.0, z: 9.8 }, { y: 3.6, z: 9.8 }
    ];

    const yz = (x, y, z, radius) => HL.circ(radius, 24).map(q => P(x, y + q.u, z + q.v));

    const sortedSticks = bundleYzs.slice().sort((a, b) => {
      const depthA = a.y * Math.SQRT1_2 + a.z * 0.5;
      const depthB = b.y * Math.SQRT1_2 + b.z * 0.5;
      return depthA - depthB;
    });

    sortedSticks.forEach(({ y, z }) => {
      const sol = HL.solid(svg);
      const ring0 = yz(-42, y, z, stickR);
      const ring1 = yz(-8, y, z, stickR);
      HL.put(sol, {
        sil: HL.poly(HL.hull(ring0.concat(ring1))),
        crease: HL.poly(ring1)
      });
    });

    // Tight Tie Ribbon around bundle at X = -25
    const frontArcYZ = [
      [4.8, 2.8], [5.2, 3.2], [6.8, 5.8], [7.1, 6.4], [7.2, 7.0],
      [7.1, 7.6], [6.8, 8.2], [5.2, 10.8], [4.8, 11.2], [4.2, 11.5],
      [3.6, 11.6], [0.0, 11.6], [-3.6, 11.6], [-4.2, 11.5]
    ];
    const bandPts0 = frontArcYZ.map(p => P(-26.0, p[0], p[1]));
    const bandPts1 = frontArcYZ.map(p => P(-24.0, p[0], p[1]));
    HL.mk("path", {
      class: "hi",
      d: HL.poly([...bandPts0, ...bandPts1.slice().reverse()])
    }, svg);

    const kc = P(-24.0, 0.0, 11.6);
    HL.mk("path", {
      class: "hi",
      d: `M${HL.r2(kc[0])} ${HL.r2(kc[1])}C${HL.r2(kc[0] - 6)} ${HL.r2(kc[1] - 4)} ${HL.r2(kc[0] - 8)} ${HL.r2(kc[1] + 2)} ${HL.r2(kc[0])} ${HL.r2(kc[1])}C${HL.r2(kc[0] + 6)} ${HL.r2(kc[1] - 4)} ${HL.r2(kc[0] + 8)} ${HL.r2(kc[1] + 2)} ${HL.r2(kc[0])} ${HL.r2(kc[1])}Z`
    }, svg);
    const knotDot = HL.flatDot(svg, C, 1.0, "dot");
    HL.place(knotDot, kc);

    // 3. Loose Unit Sticks (Right side: X from 8 to 42)
    let unitCount = initialV != null ? HL.clamp(Math.round(initialV), 1, 5) : 3;
    const looseSticks = [];
    for (let i = 0; i < 5; i++) {
      const sol = HL.solid(svg);
      const initZ = i < unitCount ? 0 : -8;
      looseSticks.push({
        idx: i,
        y: -8.0 + i * 4.0,
        spZ: HL.spring(initZ, { k: 160, c: 15 }),
        sol
      });
    }

    let lastKey = "";

    function draw() {
      const key = `${unitCount}:${looseSticks.map(s => HL.r2(s.spZ.x)).join(",")}`;
      if (key === lastKey) return;
      lastKey = key;

      looseSticks.forEach((stk, i) => {
        const active = i < unitCount;
        const curZ = 4.2 + stk.spZ.x;
        if (active || stk.spZ.x > -7.5) {
          const r0 = yz(8, stk.y, curZ, stickR);
          const r1 = yz(42, stk.y, curZ, stickR);
          HL.put(stk.sol, {
            sil: HL.poly(HL.hull(r0.concat(r1))),
            crease: HL.poly(r1)
          });
          stk.sol.sil.classList.toggle("hi", i === unitCount - 1);
        } else {
          HL.put(stk.sol, { sil: "", crease: "" });
          stk.sol.sil.classList.remove("hi");
        }
      });

      read.textContent = `10 + ${unitCount} = ${10 + unitCount} (1 chục ${unitCount} đv)`;
    }

    function setUnits(n) {
      unitCount = HL.clamp(Math.round(n), 1, 5);
      looseSticks.forEach((stk, i) => {
        stk.spZ.t = i < unitCount ? 0 : -8;
      });
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setUnits(3);
        return;
      }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 4.2);
      if (wx > -10) {
        const norm = HL.clamp((wy + 10) / 20, 0, 1);
        setUnits(1 + norm * 4);
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

    draw();

    return {
      set(v) {
        setUnits(v);
      },
      destroy: bag.dispose
    };
  }
};
