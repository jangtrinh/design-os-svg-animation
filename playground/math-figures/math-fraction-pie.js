/*
 * 9. Fraction Pie (Bánh Phân Số 1/4, 1/2, 3/4, 4/4)
 * Pure Hairline 2:1 Axonometric Line Art
 * Smooth pointer tracking transferring quarter slices across
 * Zero SVG text - clean visual line art
 */

export default {
  id: "math-fraction-pie",
  title: "9. Bánh Phân Số 1/4 (Fraction Pie)",
  concept: "Phân số cơ bản: một phần tư (1/4), một nửa (1/2), toàn bộ (4/4)",
  means: "Bánh tròn chia 4 miếng quạt 90°: di chuyển con trỏ để nhấc các miếng bánh từ khay nướng sang đĩa ăn, trực quan hóa 1/4, 2/4 = 1/2, 3/4.",
  rules: [1, 2, 4, 7, 8],
  range: [0, 1, 4],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-58, -24, 0], [58, 24, 35]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    const R = 18;
    const H = 7;
    const panX = -26;
    const plateX = 26;

    // 1. Left: Baking Tray (Khay nướng)
    const [panO, panI] = HL.rings(panX - 24, -24, panX + 24, 24, 24, 1.8);
    const panSol = HL.solid(svg);
    HL.put(panSol, HL.prism(P, front, panO, panI, 0, 3));

    // Tray etched guidelines (showing 4 quadrant slots)
    const trayCirc = [];
    for (let a = 0; a <= 36; a++) {
      const rad = (a / 36) * Math.PI * 2;
      trayCirc.push(P(panX + Math.cos(rad) * R, Math.sin(rad) * R, 3.1));
    }
    HL.mk("polygon", { points: trayCirc.map(p => p.join(",")).join(" "), stroke: "#d0d0d6", "stroke-dasharray": "2 2", fill: "none" }, svg);
    HL.mk("line", { x1: P(panX - R, 0, 3.1)[0], y1: P(panX - R, 0, 3.1)[1], x2: P(panX + R, 0, 3.1)[0], y2: P(panX + R, 0, 3.1)[1], stroke: "#d0d0d6", "stroke-dasharray": "2 2" }, svg);
    HL.mk("line", { x1: P(panX, -R, 3.1)[0], y1: P(panX, -R, 3.1)[1], x2: P(panX, R, 3.1)[0], y2: P(panX, R, 3.1)[1], stroke: "#d0d0d6", "stroke-dasharray": "2 2" }, svg);

    // 2. Right: Serving Plate (Đĩa ăn)
    const [plateO, plateI] = HL.rings(plateX - 24, -24, plateX + 24, 24, 24, 1.8);
    const plateSol = HL.solid(svg);
    HL.put(plateSol, HL.prism(P, front, plateO, plateI, 0, 3));

    const plateCirc = [];
    for (let a = 0; a <= 36; a++) {
      const rad = (a / 36) * Math.PI * 2;
      plateCirc.push(P(plateX + Math.cos(rad) * R, Math.sin(rad) * R, 3.1));
    }
    HL.mk("polygon", { points: plateCirc.map(p => p.join(",")).join(" "), stroke: "#d0d0d6", "stroke-dasharray": "2 2", fill: "none" }, svg);

    // 3. 4 Slices (Quarter Wedges)
    const renderOrder = [2, 1, 3, 0];
    let takenCount = initialV !== undefined ? Math.round(HL.clamp(initialV, 0, 4)) : 1;

    const pieces = renderOrder.map(i => {
      const a0 = (i * Math.PI) / 2;
      const a1 = ((i + 1) * Math.PI) / 2;
      const mid = (a0 + a1) / 2;
      return {
        idx: i,
        a0,
        a1,
        mid,
        sol: HL.solid(svg),
        sp: HL.spring(i < takenCount ? 1 : 0, { k: 140, c: 14 })
      };
    });

    function draw() {
      pieces.forEach(pc => {
        const u = pc.sp.x;

        // Path from pan to plate with gentle lifting arc in Z
        const curX = HL.lerp(panX, plateX, u);
        const curY = 0;
        const curZ0 = 3.0 + 4 * 14 * u * (1 - u);
        const curZ1 = curZ0 + H;

        const numArc = 14;
        const topPts = [P(curX, curY, curZ1)];
        const botPts = [P(curX, curY, curZ0)];

        for (let k = 0; k <= numArc; k++) {
          const ang = pc.a0 + (pc.a1 - pc.a0) * (k / numArc);
          topPts.push(P(curX + R * Math.cos(ang), curY + R * Math.sin(ang), curZ1));
          botPts.push(P(curX + R * Math.cos(ang), curY + R * Math.sin(ang), curZ0));
        }

        const hullPts = HL.hull([...topPts, ...botPts]);
        const sil = HL.poly(hullPts);

        let crease = HL.poly(topPts);

        // Radial face 0
        const n0 = { nu: -Math.sin(pc.a0), nv: Math.cos(pc.a0) };
        if (front(n0)) {
          const pR0_bot = P(curX + R * Math.cos(pc.a0), curY + R * Math.sin(pc.a0), curZ0);
          crease += HL.seg(P(curX, curY, curZ0), pR0_bot);
        }

        // Radial face 1
        const n1 = { nu: Math.sin(pc.a1), nv: -Math.cos(pc.a1) };
        if (front(n1)) {
          const pR1_bot = P(curX + R * Math.cos(pc.a1), curY + R * Math.sin(pc.a1), curZ0);
          crease += HL.seg(P(curX, curY, curZ0), pR1_bot);
        }

        // Curved outer rim: visible bottom arc
        const frontArc = [];
        for (let k = 0; k <= numArc; k++) {
          const ang = pc.a0 + (pc.a1 - pc.a0) * (k / numArc);
          if (front({ nu: Math.cos(ang), nv: Math.sin(ang) })) {
            frontArc.push(P(curX + R * Math.cos(ang), curY + R * Math.sin(ang), curZ0));
          }
        }
        if (frontArc.length > 1) {
          crease += HL.open(frontArc);
        }

        HL.put(pc.sol, { sil, crease });
      });

      if (takenCount === 0) {
        read.textContent = "Bánh nguyên vẹn: 4/4 = 1 cái bánh";
      } else if (takenCount === 1) {
        read.textContent = "Bốc 1 miếng (1/4) ra đĩa: Trong khay còn 3/4 cái bánh";
      } else if (takenCount === 2) {
        read.textContent = "Bốc 2 miếng (2/4) ra đĩa: Trong khay còn đúng 1/2 cái bánh (một nửa)";
      } else if (takenCount === 3) {
        read.textContent = "Bốc 3 miếng (3/4) ra đĩa: Trong khay còn lại 1/4 cái bánh";
      } else {
        read.textContent = "Đã bốc hết 4/4 miếng ra đĩa: Khay bánh trống";
      }
    }

    function setSlices(count) {
      takenCount = HL.clamp(count, 0, 4);
      pieces.forEach(pc => {
        pc.sp.t = pc.idx < takenCount ? 1 : 0;
      });
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setSlices(1);
        return;
      }
      const pLeft = P(panX, 0, 3)[0];
      const pRight = P(plateX, 0, 3)[0];
      const norm = HL.clamp((pt[0] - pLeft) / (pRight - pLeft), 0, 1);
      const targetSlices = Math.round(norm * 4);
      setSlices(targetSlices);
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      pieces.forEach(pc => {
        if (HL.stepS(pc.sp, dt)) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => setSlices(1)
    }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setSlices(Math.round(v));
      },
      destroy: bag.dispose
    };
  }
};
