/*
 * 1. Math Domino Addition Tiles (Thẻ Domino Số Học)
 * Pedagogical Goal: Place value & addition (10 + 3 = 13)
 * Simplified Geometry: Clean rounded domino tiles on a minimalist wooden tray
 * Meaningful Interaction: Moving pointer smoothly adjusts unit dots (1 to 5) with spring bounce
 */

export default {
  id: "math-domino",
  title: "1. Thẻ Domino Số Học (Domino Addition Tiles)",
  concept: "Cộng số tròn chục & đơn vị (10 + 3 = 13)",
  means: "Hai quân cờ Domino tinh giản: quân trái luôn cố định 10 chấm (1 chục = 5+5), quân phải thay đổi từ 1 đến 5 đơn vị theo vị trí chuột; trực quan hóa 1 chục ghép với các đơn vị.",
  rules: [1, 2, 4, 7, 9],
  range: [1, 3, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-52, -22, 0], [52, 22, 24]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Clean Minimalist Wooden Tray (Z: 0 to 3.5)
    const [trayO, trayI] = HL.rings(-50, -20, 50, 20, 3.5, 1.0);
    const traySol = HL.solid(svg);
    HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 3.5));

    // Two clean recessed pockets on tray floor
    for (const cx of [-25, 25]) {
      const [compO] = HL.rings(cx - 14, -18, cx + 14, 18, 2.5, 0.6);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, compO, 3.5)) }, svg);
    }

    // Tile 1 (Left: 10 pips, 5 top + 5 bottom)
    const d1Sol = HL.solid(svg);
    const z1 = 2.0;
    const [t1O, t1I] = HL.rings(-37, -16, -13, 16, 2.5, 0.8);
    HL.put(d1Sol, HL.prism(P, front, t1O, t1I, z1, z1 + 5.0));

    // Tile 1 dividing groove & center pin
    const topZ1 = z1 + 5.1;
    HL.mk("line", {
      x1: HL.r2(P(-36, 0, topZ1)[0]), y1: HL.r2(P(-36, 0, topZ1)[1]),
      x2: HL.r2(P(-14, 0, topZ1)[0]), y2: HL.r2(P(-14, 0, topZ1)[1]),
      class: "lo", "stroke-width": 1.0
    }, svg);
    HL.mk("circle", { cx: HL.r2(P(-25, 0, topZ1)[0]), cy: HL.r2(P(-25, 0, topZ1)[1]), r: 1.4, fill: "#232327" }, svg);

    // Helper for clean projected dots
    function makeDot() {
      return HL.mk("ellipse", { rx: HL.r2(1.5 * C.S), ry: HL.r2(1.5 * C.S * C.k), fill: "#232327", stroke: "none" }, svg);
    }

    // 10 pips on Tile 1 (5 top, 5 bottom)
    const c1X = -25;
    const pips1Pos = [
      [c1X - 5.5, -11.5], [c1X + 5.5, -11.5],
      [c1X, -8.0],
      [c1X - 5.5, -4.5],  [c1X + 5.5, -4.5],
      [c1X - 5.5, 4.5],   [c1X + 5.5, 4.5],
      [c1X, 8.0],
      [c1X - 5.5, 11.5],  [c1X + 5.5, 11.5]
    ];
    pips1Pos.forEach(([px, py]) => {
      const pt = P(px, py, topZ1);
      const dot = makeDot();
      dot.setAttribute("cx", HL.r2(pt[0]));
      dot.setAttribute("cy", HL.r2(pt[1]));
    });

    // Tile 2 (Right: Units 1 to 5)
    const d2Sol = HL.solid(svg);
    const d2Lift = HL.spring(0, { k: 140, c: 14 });
    const div2 = HL.mk("line", { class: "lo", "stroke-width": 1.0 }, svg);
    const pin2 = HL.mk("circle", { r: 1.4, fill: "#232327" }, svg);
    const d2Dots = Array.from({ length: 5 }, makeDot);

    let unitCount = initialV != null ? Math.round(HL.clamp(initialV, 1, 5)) : 3;

    function draw() {
      const z2 = 2.0 + d2Lift.x;
      const [t2O, t2I] = HL.rings(13, -16, 37, 16, 2.5, 0.8);
      HL.put(d2Sol, HL.prism(P, front, t2O, t2I, z2, z2 + 5.0));

      const topZ2 = z2 + 5.1;
      const c2X = 25;

      div2.setAttribute("x1", HL.r2(P(14, 0, topZ2)[0]));
      div2.setAttribute("y1", HL.r2(P(14, 0, topZ2)[1]));
      div2.setAttribute("x2", HL.r2(P(36, 0, topZ2)[0]));
      div2.setAttribute("y2", HL.r2(P(36, 0, topZ2)[1]));

      const p2Center = P(c2X, 0, topZ2);
      pin2.setAttribute("cx", HL.r2(p2Center[0]));
      pin2.setAttribute("cy", HL.r2(p2Center[1]));

      const patterns = {
        1: [[c2X, -8.0]],
        2: [[c2X - 5.5, -11.5], [c2X + 5.5, -4.5]],
        3: [[c2X - 5.5, -11.5], [c2X, -8.0], [c2X + 5.5, -4.5]],
        4: [[c2X - 5.5, -11.5], [c2X + 5.5, -11.5], [c2X - 5.5, -4.5], [c2X + 5.5, -4.5]],
        5: [[c2X - 5.5, -11.5], [c2X + 5.5, -11.5], [c2X, -8.0], [c2X - 5.5, -4.5], [c2X + 5.5, -4.5]]
      };

      const pts = patterns[unitCount] || patterns[3];
      d2Dots.forEach((dot, i) => {
        if (i < pts.length) {
          dot.style.display = "";
          const p = P(pts[i][0], pts[i][1], topZ2);
          dot.setAttribute("cx", HL.r2(p[0]));
          dot.setAttribute("cy", HL.r2(p[1]));
        } else {
          dot.style.display = "none";
        }
      });

      d2Sol.sil.classList.toggle("hi", d2Lift.x > 0.5);
      read.textContent = "Domino: 10 + " + unitCount + " = " + (10 + unitCount) + " (1 chục và " + unitCount + " đơn vị)";
    }

    function aim(pt) {
      if (!pt) {
        d2Lift.t = 0;
        reg.wake();
        return;
      }
      const s2 = P(25, 0, 5)[0];
      const near = Math.abs(pt[0] - s2) < 35;
      d2Lift.t = near ? 3.0 : 0;

      if (near) {
        const topY = P(25, -16, 5)[1];
        const botY = P(25, 16, 5)[1];
        const norm = HL.clamp((pt[1] - topY) / (botY - topY), 0, 1);
        unitCount = Math.min(5, Math.max(1, Math.round(1 + norm * 4)));
      }
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const m = HL.stepS(d2Lift, dt);
      draw();
      return m;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        unitCount = HL.clamp(Math.round(v), 1, 5);
        draw();
      },
      destroy: bag.dispose
    };
  }
};
