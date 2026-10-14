/*
 * 6. Ruler & Pencil Measurement (Đo Độ Dài Bút Chì)
 * Pedagogical Goal: Measuring length in centimeters (Grade 1 essential curriculum)
 */

export default {
  id: "math-ruler-pencil",
  title: "6. Thước Đo Bút Chì (Ruler Measurement)",
  concept: "Đo độ dài và đơn vị xăng-ti-mét (cm)",
  means: "Thước kẻ đo độ dài chia vạch cm: di chuột để kéo dài/ngắn chiếc bút chì đặt dọc theo thước, trực quan hóa bài học đọc độ dài từ vạch 0 đến đầu bút.",
  rules: [1, 2, 4, 7, 9],
  range: [2, 6, 8],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.15);
    HL.fit(C, [[-52, -15, 0], [52, 15, 14]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Desktop Mat (Z: 0 to 2.5)
    const [matO, matI] = HL.rings(-52, -15, 52, 15, 3.0, 0.8);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2.5));

    // 2. Centimeter Ruler (Z: 2.5 to 5.0, Y from 2 to 12)
    const [rO, rI] = HL.rings(-48, 2, 48, 12, 2.0, 0.8);
    const rulerSol = HL.solid(svg);
    HL.put(rulerSol, HL.prism(P, front, rO, rI, 2.5, 5.0));

    // 10 Station Ticks (0 to 10 cm) along the ruler edge (Y = 2)
    const ticks = [];
    const tickEls = [];
    for (let i = 0; i <= 10; i++) {
      const x = -44 + i * 8.8;
      ticks.push(x);

      const isMajor = (i === 0 || i === 5 || i === 10);
      const yLen = isMajor ? 5.5 : 3.5;
      const p0 = P(x, 2.2, 5.1), p1 = P(x, 2.2 + yLen, 5.1);

      const tLine = HL.mk("line", {
        x1: HL.r2(p0[0]), y1: HL.r2(p0[1]),
        x2: HL.r2(p1[0]), y2: HL.r2(p1[1]),
        class: i === 6 ? "hi" : (isMajor ? "sil" : "lo")
      }, svg);
      tickEls.push(tLine);
    }

    // 3. Sharpened Pencil (aligned with Vạch 0 at X = -44, Y = -4, Z = 5.0)
    const pencilSol = HL.solid(svg);
    const coneSol = HL.solid(svg);
    const leadTip = HL.mk("ellipse", { rx: 1.6, ry: 1.6, class: "dot" }, svg);
    const guideEl = HL.mk("path", { class: "nf hi dash", d: "" }, svg);

    const initLen = initialV != null ? HL.clamp(Math.round(initialV), 2, 8) : 6;
    const lenSpring = HL.spring(initLen, { k: 140, c: 14 });
    let lastKey = "";

    function draw() {
      const curL = lenSpring.x;
      const key = String(HL.r2(curL));
      if (key === lastKey) return;
      lastKey = key;

      const x0 = -44;
      const xBodyEnd = x0 + (curL - 0.8) * 8.8;
      const xTip = x0 + curL * 8.8;
      const yPencil = -4;
      const zPencil = 5.0;

      const [pO, pI] = HL.rings(x0, yPencil - 2.5, xBodyEnd, yPencil + 2.5, 2.0, 0.6);
      HL.put(pencilSol, HL.prism(P, front, pO, pI, zPencil, zPencil + 4.0));

      const tipCenterZ = zPencil + 2.0;
      const basePts = [];
      for (let k = 0; k <= 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        basePts.push(P(xBodyEnd, yPencil + 2.2 * Math.cos(a), tipCenterZ + 2.0 * Math.sin(a)));
      }
      const apexPt = P(xTip, yPencil, tipCenterZ);
      const coneSil = HL.poly(HL.hull([apexPt, ...basePts]));
      HL.put(coneSol, { sil: coneSil, crease: "" });

      HL.place(leadTip, apexPt);
      guideEl.setAttribute("d", HL.seg(apexPt, P(xTip, 2.2, 5.1)));

      const curIdx = Math.round(curL);
      tickEls.forEach((el, idx) => {
        el.classList.toggle("hi", idx === curIdx);
      });

      read.textContent = `Độ dài bút chì: ${curIdx} cm (0→${curIdx})`;
    }

    function aim(pt) {
      if (!pt) {
        lenSpring.t = 6;
        reg.wake();
        return;
      }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 5.0);
      const axis = (wx - wy) * Math.SQRT1_2;
      const norm = HL.clamp((axis + 32) / 64, 0, 1);
      lenSpring.t = HL.clamp(Math.round(norm * 10), 2, 8);
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const m = HL.stepS(lenSpring, dt);
      draw();
      return m;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        lenSpring.t = HL.clamp(Math.round(v), 2, 8);
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
