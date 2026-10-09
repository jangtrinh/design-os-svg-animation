export default {
  id: "math-abacus",
  title: "1. Bàn Tính Đếm Hạt (Soroban Abacus)",
  concept: "Cộng trừ trong phạm vi 10 & 100",
  means: "Bàn tính chuẩn Soroban: mỗi cột gồm đúng 1 hạt trời (giá trị 5) và 4 hạt đất (giá trị 1). Hạt vát kim cương có lỗ xỏ trục sắt.",
  rules: [1, 2, 3, 5, 8],
  range: [0, 5, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    // Well-balanced vertical centering within 400x320 viewBox
    HL.fit(C, [[-48, -16, 0], [48, 16, 44]], 200, 150);
    const P = HL.proj(C), front = HL.facing(C);

    // Wooden Frame
    // Base rail (z = 0 to 4)
    const [baseO, baseI] = HL.rings(-46, -14, 46, 14, 2, 1);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 4));

    // Left post (z = 4 to 38)
    const [lpO, lpI] = HL.rings(-46, -14, -40, 14, 2, 1);
    const lpSol = HL.solid(svg);
    HL.put(lpSol, HL.prism(P, front, lpO, lpI, 4, 38));

    // Right post (z = 4 to 38)
    const [rpO, rpI] = HL.rings(40, -14, 46, 14, 2, 1);
    const rpSol = HL.solid(svg);
    HL.put(rpSol, HL.prism(P, front, rpO, rpI, 4, 38));

    // Top rail (z = 38 to 42)
    const [topO, topI] = HL.rings(-46, -14, 46, 14, 2, 1);
    const topSol = HL.solid(svg);
    HL.put(topSol, HL.prism(P, front, topO, topI, 38, 42));

    // Divider beam / Reckoning bar (z = 24 to 27)
    const [divO, divI] = HL.rings(-40, -6, 40, 6, 1, 0.8);
    const divSol = HL.solid(svg);
    HL.put(divSol, HL.prism(P, front, divO, divI, 24, 27));

    // Unit reckoning marker dot on divider beam above the units rod (x = 22)
    const unitDot = HL.flatDot(svg, C, 0.6, "dot m");
    HL.place(unitDot, P(22, 0, 27.1));

    // 3 Steel Rods: x = -22 (Hundreds), 0 (Tens), 22 (Units)
    const rodXList = [-22, 0, 22];
    rodXList.forEach(rx => {
      HL.mk("line", {
        x1: P(rx, 0, 4)[0], y1: P(rx, 0, 4)[1],
        x2: P(rx, 0, 38)[0], y2: P(rx, 0, 38)[1],
        stroke: "#232327", "stroke-width": 1.2
      }, svg);
    });

    // Soroban standard beads structure:
    // Exactly 1 upper bead (value 5) and exactly 4 lower beads (value 1 each) per rod
    const rodsData = [
      { rx: -22, mult: 100, name: "Trăm" },
      { rx: 0, mult: 10, name: "Chục" },
      { rx: 22, mult: 1, name: "Đơn vị" }
    ];

    const allBeads = [];
    rodsData.forEach(r => {
      // 1 Upper Bead (Heaven bead, val: 5)
      // Rest: z = 34.2 (up against top rail). Active: z = 27.5 (down against divider beam)
      const upper = {
        rx: r.rx,
        upper: true,
        val: 5,
        mult: r.mult,
        sp: HL.spring(0, { k: 150, c: 15 }),
        sol: HL.solid(svg),
        dot: HL.flatDot(svg, C, 0.8, "dot m")
      };
      allBeads.push(upper);

      // 4 Lower Beads (Earth beads, val: 1 each, idx: 0 is top-most near beam, 3 is bottom-most)
      // Rest: restZ = 13.4 - idx * 3.0 (down against base rail)
      // Active: actZ = 20.6 - idx * 3.0 (up against divider beam)
      const lower = [];
      for (let i = 0; i < 4; i++) {
        const b = {
          rx: r.rx,
          upper: false,
          idx: i,
          val: 1,
          mult: r.mult,
          sp: HL.spring(0, { k: 150, c: 15 }),
          sol: HL.solid(svg),
          dot: HL.flatDot(svg, C, 0.8, "dot m")
        };
        lower.push(b);
        allBeads.push(b);
      }

      r.upper = upper;
      r.lower = lower;
    });

    // Bi-conical diamond profile with center hole for steel rod
    function makeSorobanBead(rx, z) {
      const N = 24;
      const ptsBottom = [];
      const ptsEq = [];
      const ptsEqFront = [];
      const ptsTop = [];
      const ptsHole = [];

      for (let k = 0; k < N; k++) {
        const a = (k / N) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        ptsBottom.push(P(rx + 2.8 * ca, 2.8 * sa, z));

        const eqScr = P(rx + 5.4 * ca, 5.4 * sa, z + 1.6);
        ptsEq.push(eqScr);
        // Facing camera (az = 45 deg)
        if (ca + sa >= -0.15) {
          ptsEqFront.push(eqScr);
        }

        ptsTop.push(P(rx + 2.8 * ca, 2.8 * sa, z + 3.2));
        ptsHole.push(P(rx + 1.1 * ca, 1.1 * sa, z + 3.2));
      }

      const sil = HL.poly(HL.hull(ptsBottom.concat(ptsEq).concat(ptsTop)));
      const crease = HL.open(ptsEqFront) + " " + HL.poly(ptsTop) + " " + HL.poly(ptsHole);
      return { sil, crease, holeCenter: P(rx, 0, z + 3.2) };
    }

    function draw() {
      let total = 0;
      rodsData.forEach(r => {
        let rodVal = 0;
        if (r.upper.sp.x > 0.5) rodVal += 5;
        r.lower.forEach(b => {
          if (b.sp.x > 0.5) rodVal += 1;
        });
        total += rodVal * r.mult;
      });

      allBeads.forEach(b => {
        let z;
        if (b.upper) {
          // 0 is rest (up: 34.2), 1 is active (down touching beam: 27.5)
          z = HL.lerp(34.2, 27.5, b.sp.x);
        } else {
          // 0 is rest (down: 13.4 - idx*3), 1 is active (up touching beam: 20.6 - idx*3)
          const restZ = 13.4 - b.idx * 3.0;
          const actZ = 20.6 - b.idx * 3.0;
          z = HL.lerp(restZ, actZ, b.sp.x);
        }
        const geom = makeSorobanBead(b.rx, z);
        HL.put(b.sol, geom);
        HL.place(b.dot, geom.holeCenter);
      });

      read.textContent = "Số đếm Soroban: " + total;
    }

    function setFromNumber(v) {
      const n = Math.round(HL.clamp(v, 0, 999));
      const digits = [
        Math.floor(n / 100) % 10,
        Math.floor(n / 10) % 10,
        n % 10
      ];
      rodsData.forEach((r, idx) => {
        const d = digits[idx];
        r.upper.sp.t = d >= 5 ? 1 : 0;
        const lowCount = d % 5;
        r.lower.forEach((b, bIdx) => {
          b.sp.t = bIdx < lowCount ? 1 : 0;
        });
      });
      reg.wake();
    }

    function aim(pt) {
      if (!pt) return;
      const [u, v] = pt;
      rodsData.forEach(r => {
        const rx = r.rx;
        const scrCenter = P(rx, 0, 20);
        const dist = Math.abs(u - scrCenter[0]);
        if (dist < 18) {
          const topY = P(rx, 0, 38)[1];
          const beamY = P(rx, 0, 25.5)[1];
          const baseY = P(rx, 0, 4)[1];
          if (v < beamY) {
            // Upper deck: closer to beam -> active (down), closer to top -> inactive (up)
            r.upper.sp.t = v > (topY + beamY) / 2 ? 1 : 0;
          } else {
            // Lower deck: closer to beam -> more beads pushed up towards beam
            const t = HL.clamp((baseY - v) / (baseY - beamY), 0, 1);
            const count = Math.round(t * 4);
            r.lower.forEach((b, idx) => {
              b.sp.t = idx < count ? 1 : 0;
            });
          }
        }
      });
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      allBeads.forEach(b => {
        if (HL.stepS(b.sp, dt)) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => {} }));
    bag.add(() => svg.replaceChildren());

    // Initialize with initial value (e.g. 5)
    setFromNumber(initialV ?? 5);
    draw();

    return {
      set(v) {
        setFromNumber(v);
      },
      destroy: bag.dispose
    };
  }
};
