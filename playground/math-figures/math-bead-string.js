/*
 * 10. Counting Bead String (Chuỗi 10 Hạt Đếm Số)
 * Pedagogical Goal: Part-whole decompositions of 10 (7+3, 6+4, 8+2)
 * Simplified Geometry: Clean wooden baseboard, arched wire, 10 beads (5 dark + 5 light)
 * Meaningful Interaction: Moving pointer smoothly divides beads into left and right groups
 */

export default {
  id: "math-bead-string",
  title: "10. Chuỗi 10 Hạt Đếm (Counting Bead String)",
  concept: "Tách gộp số 10 (bảng cộng phạm vi 10)",
  means: "Chuỗi 10 hạt đếm trên thanh uốn cong: 5 hạt ngà và 5 hạt gỗ mun; di chuột chia tách số 10 thành các cặp phép cộng (7 + 3, 6 + 4, 8 + 2) mượt mà.",
  rules: [1, 2, 3, 7, 9],
  range: [0, 5, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-58, -16, 0], [58, 16, 46]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Wooden Baseboard (Z: 0 to 4.0)
    const [bO, bI] = HL.rings(-52, -14, 52, 14, 3.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, bO, bI, 0, 4.0));

    // Anchor sockets for wire on base
    HL.mk("circle", { cx: HL.r2(P(-44, 0, 4.1)[0]), cy: HL.r2(P(-44, 0, 4.1)[1]), r: 2.0, fill: "#232327" }, svg);
    HL.mk("circle", { cx: HL.r2(P(44, 0, 4.1)[0]), cy: HL.r2(P(44, 0, 4.1)[1]), r: 2.0, fill: "#232327" }, svg);

    // 2. Parabolic Wire on X-Z Plane
    const wirePts = [];
    for (let s = 0; s <= 48; s++) {
      const t = s / 48;
      const x = HL.lerp(-44, 44, t);
      const z = 4.0 + 130 * t * (1 - t);
      wirePts.push(P(x, 0, z));
    }
    HL.mk("path", { d: HL.open(wirePts), stroke: "#232327", fill: "none", "stroke-width": 1.6 }, svg);

    // 3. Ten Clean Counting Beads (5 dark + 5 light)
    const beads = [];
    const R = 4.5;
    const L = 5.2;
    const r_hole = 1.2;
    const N = 20;

    for (let i = 0; i < 10; i++) {
      const dark = i < 5;
      const sol = HL.solid(svg);
      if (dark) {
        sol.sil.style.fill = "#232327";
        sol.sil.style.stroke = "#111113";
        sol.sil.style.strokeWidth = "1.2px";
        sol.cr.style.stroke = "#e0e0e4";
        sol.cr.style.strokeWidth = "1.0px";
      } else {
        sol.sil.style.fill = "#ffffff";
        sol.sil.style.stroke = "#232327";
        sol.sil.style.strokeWidth = "1.2px";
        sol.cr.style.stroke = "#5b5d64";
        sol.cr.style.strokeWidth = "1.0px";
      }

      // Initial 5 + 5 split
      const initialT = i < 5 ? 0.08 + i * 0.048 : 0.92 - (9 - i) * 0.048;
      beads.push({
        idx: i,
        dark,
        tSp: HL.spring(initialT, { k: 130, c: 14 }),
        sol
      });
    }

    let curSplit = 5;

    function draw() {
      beads.forEach(b => {
        const t = b.tSp.x;
        const x = -44 + 88 * t;
        const z = 4.0 + 130 * t * (1 - t);

        const tx = 88;
        const tz = 130 * (1 - 2 * t);
        const len = Math.hypot(tx, tz);
        const utx = tx / len;
        const utz = tz / len;

        const end1 = [], end2 = [];
        const hole1 = [], hole2 = [];

        for (let k = 0; k < N; k++) {
          const ang = (k / N) * Math.PI * 2;
          const cosA = Math.cos(ang);
          const sinA = Math.sin(ang);

          // End 1
          const p1x = x - (L / 2) * utx + R * sinA * (-utz);
          const p1y = R * cosA;
          const p1z = z - (L / 2) * utz + R * sinA * utx;
          end1.push(P(p1x, p1y, p1z));

          // End 2
          const p2x = x + (L / 2) * utx + R * sinA * (-utz);
          const p2y = R * cosA;
          const p2z = z + (L / 2) * utz + R * sinA * utx;
          end2.push(P(p2x, p2y, p2z));

          // Hole 1 & 2
          hole1.push(P(x - (L / 2) * utx + r_hole * sinA * (-utz), r_hole * cosA, z - (L / 2) * utz + r_hole * sinA * utx));
          hole2.push(P(x + (L / 2) * utx + r_hole * sinA * (-utz), r_hole * cosA, z + (L / 2) * utz + r_hole * sinA * utx));
        }

        const sil = HL.poly(HL.hull(end1.concat(end2)));
        const dotEnd2 = utx * 0.3536 + utz * 0.866;
        const visRim = dotEnd2 > 0 ? end2 : end1;
        const visHole = dotEnd2 > 0 ? hole2 : hole1;
        const crease = HL.poly(visRim) + HL.poly(visHole);

        HL.put(b.sol, { sil, crease });

        const isFocal = (b.idx === curSplit - 1);
        b.sol.sil.classList.toggle("hi", isFocal);
      });

      const leftCount = beads.filter(b => b.tSp.x < 0.5).length;
      const rightCount = 10 - leftCount;
      read.textContent = "Chuỗi hạt: " + leftCount + " (trái) + " + rightCount + " (phải) = 10";
    }

    function setSplit(splitIdx) {
      curSplit = HL.clamp(splitIdx, 0, 10);
      beads.forEach((b, i) => {
        if (i < curSplit) {
          b.tSp.t = 0.08 + i * 0.048;
        } else {
          b.tSp.t = 0.92 - (9 - i) * 0.048;
        }
      });
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setSplit(5);
        return;
      }
      const scrLeft = P(-44, 0, 8)[0];
      const scrRight = P(44, 0, 8)[0];
      const norm = HL.clamp((pt[0] - scrLeft) / (scrRight - scrLeft), 0.05, 0.95);
      setSplit(Math.round(norm * 10));
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      beads.forEach(b => { if (HL.stepS(b.tSp, dt)) moving = true; });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => setSplit(5) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setSplit(Math.round(v));
      },
      destroy: bag.dispose
    };
  }
};
