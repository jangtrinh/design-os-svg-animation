/*
 * 3. Ten Frame Counter (Khung 10 Ô Đếm Số)
 * Pedagogical Goal: Complements of 10 & base-10 structure (7 + 3 = 10)
 * Simplified Geometry: Clean 2x5 tray with 10 rounded pockets & clean circular counters
 * Meaningful Interaction: Moving pointer horizontally smoothly fills/empties counters with spring drop
 */

export default {
  id: "math-ten-frame",
  title: "3. Khung 10 Ô (Ten Frame Counter)",
  concept: "Cấu trúc số 10 cơ số mười & Bổ số 10",
  means: "Khung 10 ô đếm số tinh giản: khay gỗ 2 hàng 5 cột; di chuột ngang để đặt hoặc rút đồng xu cơ khí mượt mà, trực quan hóa bổ số 10 (7 + 3 = 10).",
  rules: [1, 2, 4, 7, 9],
  range: [0, 7, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-54, -24, 0], [54, 24, 30]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Wooden Tray (Z: 0 to 3.5)
    const [trayO, trayI] = HL.rings(-50, -20, 50, 20, 3.5, 1.0);
    const traySol = HL.solid(svg);
    HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 3.5));

    // 10 Clean Circular Cup Pockets (2 rows, 5 columns)
    for (let r = 0; r < 2; r++) {
      const cy = r === 0 ? 9.5 : -9.5;
      for (let c = 0; c < 5; c++) {
        const cx = -38 + c * 19;
        const pocketPts = [];
        for (let k = 0; k <= 24; k++) {
          const a = (k / 24) * Math.PI * 2;
          pocketPts.push(P(cx + 6.8 * Math.cos(a), cy + 6.8 * Math.sin(a), 3.5));
        }
        HL.mk("path", { class: "lo nf", d: HL.poly(pocketPts) }, svg);
      }
    }

    // Center divider groove separating row 1 and row 2
    HL.mk("line", {
      x1: HL.r2(P(-46, 0, 3.5)[0]), y1: HL.r2(P(-46, 0, 3.5)[1]),
      x2: HL.r2(P(46, 0, 3.5)[0]), y2: HL.r2(P(46, 0, 3.5)[1]),
      class: "lo", "stroke-width": 1.0, "stroke-dasharray": "3 2"
    }, svg);

    // 10 Clean Circular Coin Tokens
    const tokens = [];
    let count = initialV != null ? HL.clamp(Math.round(initialV), 0, 10) : 7;
    let slotIdx = 0;

    for (let r = 0; r < 2; r++) {
      const cy = r === 0 ? 9.5 : -9.5;
      for (let c = 0; c < 5; c++) {
        const cx = -38 + c * 19;
        const active = slotIdx < count;
        const sol = HL.solid(svg);

        tokens.push({
          idx: slotIdx,
          cx,
          cy,
          active,
          dropSp: HL.spring(active ? 0 : 16, { k: 200, c: 16 }),
          sol
        });

        slotIdx++;
      }
    }

    function applyCount(newCount) {
      count = HL.clamp(newCount, 0, 10);
      tokens.forEach((tok, i) => {
        const willBeActive = i < count;
        tok.active = willBeActive;
        tok.dropSp.t = willBeActive ? 0 : 16;
      });
      reg.wake();
    }

    function draw() {
      tokens.forEach((tok, i) => {
        const dropZ = tok.dropSp.x;
        if (tok.active || dropZ < 15.5) {
          const z = 2.0 + Math.max(0, dropZ);
          const [cO, cI] = HL.rings(tok.cx - 5.5, tok.cy - 5.5, tok.cx + 5.5, tok.cy + 5.5, 5.5, 0.6);
          HL.put(tok.sol, HL.prism(P, front, cO, cI, z, z + 2.5));

          const isFocal = (i === count - 1) && (dropZ < 1.0);
          tok.sol.sil.classList.toggle("hi", isFocal);
        } else {
          HL.put(tok.sol, { sil: "", crease: "" });
        }
      });

      const emptyCount = 10 - count;
      read.textContent = "Khung 10 ô: " + count + " (có) + " + emptyCount + " (trống) = 10";
    }

    function aim(pt) {
      if (!pt) {
        applyCount(7);
        return;
      }
      const pLeft = P(-38, 0, 3.5)[0];
      const pRight = P(38, 0, 3.5)[0];
      const norm = HL.clamp((pt[0] - pLeft) / (pRight - pLeft), 0, 1);
      applyCount(Math.round(norm * 10));
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      tokens.forEach(t => {
        if (HL.stepS(t.dropSp, dt)) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => applyCount(7) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        applyCount(Math.round(v));
      },
      destroy: bag.dispose
    };
  }
};
