/*
 * 6. Ruler & Pencil Measurement (Đo Độ Dài Bút Chì)
 * Pedagogical Goal: Measuring length in centimeters (Grade 1 essential curriculum)
 * Simplified Geometry: A clean centimeter ruler with graduation ticks (0..10) and a classic sharpened pencil
 * Meaningful Interaction: Moving pointer smoothly adjusts pencil length (2 to 8 cm) with active tick highlight
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
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-56, -18, 0], [56, 18, 32]], 200, 160);
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

      const tLine = HL.mk("line", {
        x1: HL.r2(P(x, 2.2, 5.1)[0]), y1: HL.r2(P(x, 2.2, 5.1)[1]),
        x2: HL.r2(P(x, 2.2 + yLen, 5.1)[0]), y2: HL.r2(P(x, 2.2 + yLen, 5.1)[1]),
        stroke: (isMajor ? "#111113" : "#6f6f78"),
        "stroke-width": (isMajor ? 1.4 : 0.9),
        class: (i === 6 ? "hi" : (isMajor ? "" : "lo"))
      }, svg);
      tickEls.push(tLine);
    }

    // 3. Sharpened Pencil (aligned with Vạch 0 at X = -44, Y = -4, Z = 5.0)
    // Pencil body is a prism from x0 = -44 to x1 = -44 + L
    const pencilSol = HL.solid(svg);
    const coneSol = HL.solid(svg);
    const leadTip = HL.mk("circle", { r: 1.2, fill: "#232327" }, svg);

    // Initial pencil length in cm (default: 6 cm)
    let lengthCm = initialV != null ? HL.clamp(Math.round(initialV), 2, 8) : 6;
    const lenSpring = HL.spring(lengthCm, { k: 140, c: 14 });

    function draw() {
      const curL = lenSpring.x;
      const x0 = -44;
      const xBodyEnd = x0 + (curL - 0.8) * 8.8;
      const xTip = x0 + curL * 8.8;
      const yPencil = -4;
      const zPencil = 5.0;

      // Hexagonal / rounded pencil shaft prism
      const [pO, pI] = HL.rings(x0, yPencil - 2.5, xBodyEnd, yPencil + 2.5, 2.0, 0.6);
      HL.put(pencilSol, HL.prism(P, front, pO, pI, zPencil, zPencil + 4.0));

      // Conical sharpened wooden tip (from xBodyEnd to xTip)
      const tipCenterZ = zPencil + 2.0;
      const basePts = [];
      for (let k = 0; k <= 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        basePts.push(P(xBodyEnd, yPencil + 2.2 * Math.cos(a), tipCenterZ + 2.0 * Math.sin(a)));
      }
      const apexPt = P(xTip, yPencil, tipCenterZ);
      const coneSil = HL.poly(HL.hull([apexPt, ...basePts]));
      HL.put(coneSol, { sil: coneSil, crease: "" });

      // Lead graphite tip dot
      leadTip.setAttribute("cx", HL.r2(apexPt[0]));
      leadTip.setAttribute("cy", HL.r2(apexPt[1]));

      // Active tick highlight
      const curIdx = Math.round(curL);
      tickEls.forEach((el, idx) => {
        el.classList.toggle("hi", idx === curIdx);
      });

      read.textContent = "Đo độ dài: Bút chì dài " + curIdx + " cm (từ vạch 0 đến vạch " + curIdx + ")";
    }

    function aim(pt) {
      if (!pt) {
        lenSpring.t = 6;
        reg.wake();
        return;
      }
      const scr0 = P(ticks[0], 0, 5)[0];
      const scr10 = P(ticks[10], 0, 5)[0];
      const norm = HL.clamp((pt[0] - scr0) / (scr10 - scr0), 0, 1);
      const targetCm = HL.clamp(Math.round(norm * 10), 2, 8);
      lenSpring.t = targetCm;
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
