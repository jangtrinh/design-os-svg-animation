/*
 * 3. Ten Frame Counter (Khung 10 Ô Đếm Số)
 * Authentic Grade 1 Pedagogical Manipulative: Base-10 Structure & Complements of 10
 * Lucas Markes Hairline Standard:
 * - Turned beechwood tray with filleted border (r=4.0, b=1.4) & corner foot pads
 * - 10 dished circular cup pockets with beveled rims
 * - Minted coin counters with concentric minted rims & center bosses
 * - Continuous pointer tracking across 10 slots with spring drop physics
 * - Semantic highlight (hi) on current count milestone, transferring on interaction
 * - Pure 2:1 axonometric line art, zero SVG text
 */

export default {
  id: "math-ten-frame",
  title: "3. Khung 10 Ô (Ten Frame Counter)",
  concept: "Cấu trúc số 10 cơ số mười & Bổ số 10",
  means: "Khung 10 ô đếm số: khay gỗ 2 hàng 5 cột; di chuột ngang để đặt hoặc rút đồng xu cơ khí, trực quan hóa bổ số 10 (7 + 3 = 10).",
  rules: [1, 2, 4, 7, 9],
  range: [0, 7, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-58, -26, 0], [58, 26, 32]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Turned Hardwood Tray (Z: 0 to 4.5)
    const [trayO, trayI] = HL.rings(-54, -24, 54, 24, 4.0, 1.4);
    const traySol = HL.solid(svg);
    HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 4.5));

    // Corner foot pads
    for (const [fx, fy] of [[-48, -19], [48, -19], [-48, 19], [48, 19]]) {
      const [fO] = HL.rings(fx - 3.2, fy - 3.2, fx + 3.2, fy + 3.2, 3.2, 0.5);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, fO, 0)) }, svg);
    }

    // Recessed tray floor opening (Z = 4.5)
    const [trayRecess] = HL.rings(-51, -21, 51, 21, 3.0, 0.6);
    HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, trayRecess, 4.5)) }, svg);

    // 10 Dished Circular Cup Pockets (2 rows, 5 columns)
    for (let r = 0; r < 2; r++) {
      const cy = r === 0 ? 10.5 : -10.5;
      for (let c = 0; c < 5; c++) {
        const cx = -40 + c * 20;

        // Beveled outer rim of pocket at Z = 4.5
        const rimOuter = [];
        const rimFloor = [];
        for (let k = 0; k <= 24; k++) {
          const a = (k / 24) * Math.PI * 2;
          rimOuter.push(P(cx + 7.5 * Math.cos(a), cy + 7.5 * Math.sin(a), 4.5));
          rimFloor.push(P(cx + 6.8 * Math.cos(a), cy + 6.8 * Math.sin(a), 1.8));
        }
        HL.mk("path", { class: "lo nf", d: HL.poly(rimOuter) }, svg);
        HL.mk("path", { class: "lo nf", d: HL.poly(rimFloor) }, svg);

        // Center crosshair tick inside empty socket
        HL.mk("line", {
          x1: HL.r2(P(cx - 2, cy, 1.9)[0]), y1: HL.r2(P(cx - 2, cy, 1.9)[1]),
          x2: HL.r2(P(cx + 2, cy, 1.9)[0]), y2: HL.r2(P(cx + 2, cy, 1.9)[1]),
          class: "lo"
        }, svg);
        HL.mk("line", {
          x1: HL.r2(P(cx, cy - 2, 1.9)[0]), y1: HL.r2(P(cx, cy - 2, 1.9)[1]),
          x2: HL.r2(P(cx, cy + 2, 1.9)[0]), y2: HL.r2(P(cx, cy + 2, 1.9)[1]),
          class: "lo"
        }, svg);
      }
    }

    // Center divider groove separating row 1 and row 2
    HL.mk("line", {
      x1: HL.r2(P(-49, 0, 4.5)[0]), y1: HL.r2(P(-49, 0, 4.5)[1]),
      x2: HL.r2(P(49, 0, 4.5)[0]), y2: HL.r2(P(49, 0, 4.5)[1]),
      class: "lo", "stroke-width": 1.0, "stroke-dasharray": "3 2"
    }, svg);

    // 10 Minted Coin Tokens
    const tokens = [];
    let count = initialV != null ? HL.clamp(Math.round(initialV), 0, 10) : 7;
    let slotIdx = 0;

    for (let r = 0; r < 2; r++) {
      const cy = r === 0 ? 10.5 : -10.5;
      for (let c = 0; c < 5; c++) {
        const cx = -40 + c * 20;
        const active = slotIdx < count;

        const sol = HL.solid(svg);
        const rimCrease = HL.mk("ellipse", { rx: HL.r2(4.6 * C.S), ry: HL.r2(4.6 * C.S * C.k), class: "lo nf" }, svg);
        const bossDot = HL.mk("circle", { r: 1.2, fill: "#232327" }, svg);
        const dropLineEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);

        tokens.push({
          idx: slotIdx,
          cx,
          cy,
          active,
          dropSp: HL.spring(active ? 0 : 16, { k: 210, c: 16 }),
          sol,
          rimCrease,
          bossDot,
          dropLineEl
        });

        slotIdx++;
      }
    }

    function applyCount(newCount) {
      count = HL.clamp(newCount, 0, 10);
      tokens.forEach((tok, i) => {
        const willBeActive = i < count;
        tok.active = willBeActive;
        if (willBeActive && tok.dropSp.t > 0) {
          tok.dropSp.t = 0;
        } else if (!willBeActive && tok.dropSp.t === 0) {
          tok.dropSp.t = 16;
        }
      });
      reg.wake();
    }

    function draw() {
      tokens.forEach((tok, i) => {
        const dropZ = tok.dropSp.x;

        if (tok.active || dropZ < 15.5) {
          const z = 1.9 + Math.max(0, dropZ);

          // Minted token prism (radius 6.0, height 2.6)
          const [cO, cI] = HL.rings(tok.cx - 6.0, tok.cy - 6.0, tok.cx + 6.0, tok.cy + 6.0, 6.0, 0.7);
          HL.put(tok.sol, HL.prism(P, front, cO, cI, z, z + 2.6));

          // Top face minted inner groove & center boss
          const topFaceZ = z + 2.7;
          const topScr = P(tok.cx, tok.cy, topFaceZ);
          tok.rimCrease.style.display = "";
          tok.rimCrease.setAttribute("cx", HL.r2(topScr[0]));
          tok.rimCrease.setAttribute("cy", HL.r2(topScr[1]));

          tok.bossDot.style.display = "";
          tok.bossDot.setAttribute("cx", HL.r2(topScr[0]));
          tok.bossDot.setAttribute("cy", HL.r2(topScr[1]));

          // Highlight the milestone boundary token (count - 1)
          const isFocal = (i === count - 1) && (dropZ < 1.0);
          tok.sol.sil.classList.toggle("hi", isFocal);
          tok.bossDot.classList.toggle("hi", isFocal);

          // Drop guideline if airborne
          if (dropZ > 1.5) {
            tok.dropLineEl.style.display = "";
            tok.dropLineEl.setAttribute("d", HL.seg(P(tok.cx, tok.cy, z), P(tok.cx, tok.cy, 1.9)));
          } else {
            tok.dropLineEl.style.display = "none";
          }
        } else {
          tok.rimCrease.style.display = "none";
          tok.bossDot.style.display = "none";
          tok.dropLineEl.style.display = "none";
          HL.put(tok.sol, { sil: "", crease: "" });
        }
      });

      const activeCount = count;
      const emptyCount = 10 - activeCount;
      read.textContent = "Ten Frame: " + activeCount + " + " + emptyCount + " = 10";
    }

    function aim(pt) {
      if (!pt) {
        applyCount(7);
        return;
      }
      const pLeft = P(-42, 0, 4)[0];
      const pRight = P(42, 0, 4)[0];
      const norm = HL.clamp((pt[0] - pLeft) / (pRight - pLeft), 0, 1);
      const targetCount = Math.round(norm * 10);
      applyCount(targetCount);
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
