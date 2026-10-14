export default {
  id: "math-abacus",
  title: "1. Bàn Tính Đếm Hạt (Soroban Abacus)",
  concept: "Cộng trừ trong phạm vi 10 & 100",
  means: "Bàn tính chuẩn Soroban: mỗi cột gồm đúng 1 hạt trời (giá trị 5) và 4 hạt đất (giá trị 1). Hạt vát kim cương có lỗ xỏ trục sắt.",
  rules: [1, 2, 3, 5, 8],
  range: [0, 5, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.0);
    HL.fit(C, [[-46, -14, 0], [46, 14, 42]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Wooden Frame
    const [baseO, baseI] = HL.rings(-46, -14, 46, 14, 2, 1);
    HL.put(HL.solid(svg), HL.prism(P, front, baseO, baseI, 0, 4));

    const [lpO, lpI] = HL.rings(-46, -14, -40, 14, 2, 1);
    HL.put(HL.solid(svg), HL.prism(P, front, lpO, lpI, 4, 38));

    const [rpO, rpI] = HL.rings(40, -14, 46, 14, 2, 1);
    HL.put(HL.solid(svg), HL.prism(P, front, rpO, rpI, 4, 38));

    const [topO, topI] = HL.rings(-46, -14, 46, 14, 2, 1);
    HL.put(HL.solid(svg), HL.prism(P, front, topO, topI, 38, 42));

    const [divO, divI] = HL.rings(-40, -6, 40, 6, 1, 0.8);
    HL.put(HL.solid(svg), HL.prism(P, front, divO, divI, 24, 27));

    const unitDot = HL.flatDot(svg, C, 0.6, "dot m");
    HL.place(unitDot, P(22, 0, 27.1));

    [-22, 0, 22].forEach(rx => {
      const p0 = P(rx, 0, 4), p1 = P(rx, 0, 38);
      HL.mk("line", {
        x1: HL.r2(p0[0]), y1: HL.r2(p0[1]),
        x2: HL.r2(p1[0]), y2: HL.r2(p1[1]),
        class: "sil"
      }, svg);
    });

    const rodsData = [
      { rx: -22, mult: 100 },
      { rx: 0, mult: 10 },
      { rx: 22, mult: 1 }
    ];

    const initNum = Math.round(HL.clamp(initialV ?? 5, 0, 999));
    const initDigits = [
      Math.floor(initNum / 100) % 10,
      Math.floor(initNum / 10) % 10,
      initNum % 10
    ];

    const allBeads = [];
    rodsData.forEach((r, rIdx) => {
      const d = initDigits[rIdx];
      const upper = {
        rx: r.rx, upper: true, val: 5, mult: r.mult,
        sp: HL.spring(d >= 5 ? 1 : 0, { k: 150, c: 15 }),
        sol: HL.solid(svg),
        dot: HL.flatDot(svg, C, 0.8, "dot m")
      };
      allBeads.push(upper);

      const lower = [];
      for (let i = 0; i < 4; i++) {
        const b = {
          rx: r.rx, upper: false, idx: i, val: 1, mult: r.mult,
          sp: HL.spring(i < (d % 5) ? 1 : 0, { k: 150, c: 15 }),
          sol: HL.solid(svg),
          dot: HL.flatDot(svg, C, 0.8, "dot m")
        };
        lower.push(b);
        allBeads.push(b);
      }
      r.upper = upper;
      r.lower = lower;
    });

    function makeSorobanBead(rx, z) {
      const N = 20;
      const ptsBottom = [], ptsEq = [], ptsEqFront = [], ptsTop = [], ptsHole = [];
      for (let k = 0; k < N; k++) {
        const a = (k / N) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        ptsBottom.push(P(rx + 2.8 * ca, 2.8 * sa, z));
        const eqScr = P(rx + 5.4 * ca, 5.4 * sa, z + 1.6);
        ptsEq.push(eqScr);
        if (ca + sa >= -0.15) ptsEqFront.push(eqScr);
        ptsTop.push(P(rx + 2.8 * ca, 2.8 * sa, z + 3.2));
        ptsHole.push(P(rx + 1.1 * ca, 1.1 * sa, z + 3.2));
      }
      const sil = HL.poly(HL.hull(ptsBottom.concat(ptsEq, ptsTop)));
      const crease = HL.open(ptsEqFront) + " " + HL.poly(ptsTop) + " " + HL.poly(ptsHole);
      return { sil, crease, holeCenter: P(rx, 0, z + 3.2) };
    }

    let lastKey = "";

    function draw() {
      const key = allBeads.map(b => HL.r2(b.sp.x)).join(",");
      if (key === lastKey) return;
      lastKey = key;

      let total = 0;
      rodsData.forEach(r => {
        let rodVal = r.upper.sp.x > 0.5 ? 5 : 0;
        r.lower.forEach(b => { if (b.sp.x > 0.5) rodVal += 1; });
        total += rodVal * r.mult;
      });

      allBeads.forEach(b => {
        const z = b.upper
          ? HL.lerp(34.2, 27.5, b.sp.x)
          : HL.lerp(13.4 - b.idx * 3.0, 20.6 - b.idx * 3.0, b.sp.x);
        const geom = makeSorobanBead(b.rx, z);
        HL.put(b.sol, geom);
        HL.place(b.dot, geom.holeCenter);
        b.sol.sil.classList.toggle("hi", b.sp.x > 0.5);
      });

      read.textContent = `Bàn tính Soroban: ${total}`;
    }

    function setFromNumber(v) {
      const n = Math.round(HL.clamp(v, 0, 999));
      const digits = [Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];
      rodsData.forEach((r, idx) => {
        const d = digits[idx];
        r.upper.sp.t = d >= 5 ? 1 : 0;
        r.lower.forEach((b, bIdx) => { b.sp.t = bIdx < (d % 5) ? 1 : 0; });
      });
      reg.wake();
    }

    function aim(pt) {
      if (!pt) return;
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 20);
      const axis = (wx - wy) * Math.SQRT1_2;
      const norm = HL.clamp((axis + 32) / 64, 0, 1);
      setFromNumber(Math.round(norm * 10));
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      allBeads.forEach(b => { if (HL.stepS(b.sp, dt)) moving = true; });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => setFromNumber(5) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) { setFromNumber(v); },
      destroy: bag.dispose
    };
  }
};
