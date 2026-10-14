/*
 * 1. Math Domino Addition Tiles (Thẻ Domino Số Học)
 * Pedagogical Goal: Place value & addition (10 + 3 = 13)
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
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.0);
    HL.fit(C, [[-50, -20, 0], [50, 20, 14]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    const [trayO, trayI] = HL.rings(-50, -20, 50, 20, 3.5, 1.0);
    HL.put(HL.solid(svg), HL.prism(P, front, trayO, trayI, 0, 3.5));

    for (const cx of [-25, 25]) {
      const [compO] = HL.rings(cx - 14, -18, cx + 14, 18, 2.5, 0.6);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, compO, 3.5)) }, svg);
    }

    const d1Sol = HL.solid(svg);
    const z1 = 2.0;
    const [t1O, t1I] = HL.rings(-37, -16, -13, 16, 2.5, 0.8);
    HL.put(d1Sol, HL.prism(P, front, t1O, t1I, z1, z1 + 5.0));

    const topZ1 = z1 + 5.1;
    const l0 = P(-36, 0, topZ1), l1 = P(-14, 0, topZ1);
    HL.mk("line", {
      x1: HL.r2(l0[0]), y1: HL.r2(l0[1]),
      x2: HL.r2(l1[0]), y2: HL.r2(l1[1]),
      class: "lo"
    }, svg);
    const pin1 = HL.flatDot(svg, C, 1.2, "dot m");
    HL.place(pin1, P(-25, 0, topZ1));

    const c1X = -25;
    const pips1Pos = [
      [c1X - 5.5, -11.5], [c1X + 5.5, -11.5], [c1X, -8.0], [c1X - 5.5, -4.5], [c1X + 5.5, -4.5],
      [c1X - 5.5, 4.5], [c1X + 5.5, 4.5], [c1X, 8.0], [c1X - 5.5, 11.5], [c1X + 5.5, 11.5]
    ];
    pips1Pos.forEach(([px, py]) => {
      const dot = HL.flatDot(svg, C, 1.4, "dot");
      HL.place(dot, P(px, py, topZ1));
    });

    const d2Sol = HL.solid(svg);
    const d2Lift = HL.spring(0, { k: 140, c: 14 });
    const div2 = HL.mk("line", { class: "lo" }, svg);
    const pin2 = HL.flatDot(svg, C, 1.2, "dot m");
    const d2Dots = Array.from({ length: 5 }, () => HL.flatDot(svg, C, 1.4, "dot"));

    let unitCount = initialV != null ? Math.round(HL.clamp(initialV, 1, 5)) : 3;
    let lastKey = "";

    function draw() {
      const key = `${unitCount}:${HL.r2(d2Lift.x)}`;
      if (key === lastKey) return;
      lastKey = key;

      const z2 = 2.0 + d2Lift.x;
      const [t2O, t2I] = HL.rings(13, -16, 37, 16, 2.5, 0.8);
      HL.put(d2Sol, HL.prism(P, front, t2O, t2I, z2, z2 + 5.0));

      const topZ2 = z2 + 5.1;
      const c2X = 25;
      const r0 = P(14, 0, topZ2), r1 = P(36, 0, topZ2);
      div2.setAttribute("x1", HL.r2(r0[0]));
      div2.setAttribute("y1", HL.r2(r0[1]));
      div2.setAttribute("x2", HL.r2(r1[0]));
      div2.setAttribute("y2", HL.r2(r1[1]));
      HL.place(pin2, P(c2X, 0, topZ2));

      const patterns = {
        1: [[c2X, -8.0]],
        2: [[c2X - 5.5, -11.5], [c2X + 5.5, -4.5]],
        3: [[c2X - 5.5, -11.5], [c2X, -8.0], [c2X + 5.5, -4.5]],
        4: [[c2X - 5.5, -11.5], [c2X + 5.5, -11.5], [c2X - 5.5, -4.5], [c2X + 5.5, -4.5]],
        5: [[c2X - 5.5, -11.5], [c2X + 5.5, -11.5], [c2X, -8.0], [c2X - 5.5, -4.5], [c2X + 5.5, -4.5]]
      };
      const pts = patterns[unitCount] || patterns[3];
      d2Dots.forEach((dot, i) => {
        const active = i < pts.length;
        dot.classList.toggle("off", !active);
        const target = active ? pts[i] : [c2X, 8.0];
        HL.place(dot, P(target[0], target[1], topZ2));
      });

      d2Sol.sil.classList.toggle("hi", true);
      read.textContent = `Domino: 10 + ${unitCount} = ${10 + unitCount}`;
    }

    function aim(pt) {
      if (!pt) {
        d2Lift.t = 0;
        reg.wake();
        return;
      }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 5.0);
      const near = wx > 0;
      d2Lift.t = near ? 3.0 : 0;
      if (near) {
        const norm = HL.clamp((wy + 16) / 32, 0, 1);
        unitCount = HL.clamp(Math.round(1 + norm * 4), 1, 5);
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
