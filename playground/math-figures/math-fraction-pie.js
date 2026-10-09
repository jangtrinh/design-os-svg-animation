/*
 * 9. Fraction Pie (Bánh Phân Số 1/4, 1/2, 3/4, 4/4)
 * Pedagogical Goal: Basic fractions (1/4, 2/4 = 1/2, 3/4, 4/4)
 * Simplified Geometry: Clean round baking tray, clean round plate, 4 quarter pie slices
 * Meaningful Interaction: Moving pointer smoothly transfers 1 to 4 slices from tray to plate
 */

export default {
  id: "math-fraction-pie",
  title: "9. Bánh Phân Số 1/4 (Fraction Pie)",
  concept: "Phân số cơ bản: một phần tư (1/4), một nửa (1/2), toàn bộ (4/4)",
  means: "Bánh tròn chia 4 miếng quạt 90° tinh giản: di chuột để nhấc các miếng bánh từ khay nướng sang đĩa ăn theo cung bay 3D mượt mà, trực quan hóa 1/4, 2/4 = 1/2, 3/4.",
  rules: [1, 2, 4, 7, 9],
  range: [0, 1, 4],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-58, -24, 0], [58, 24, 35]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    const R = 18.0;
    const H = 7.0;
    const panX = -26;
    const plateX = 26;

    // 1. Clean Round Baking Tray at X = -26 (Z: 0 to 3.5)
    const [panO, panI] = HL.rings(panX - 22, -22, panX + 22, 22, 22, 1.5);
    const panSol = HL.solid(svg);
    HL.put(panSol, HL.prism(P, front, panO, panI, 0, 3.5));

    // 2. Clean Round Serving Plate at X = 26 (Z: 0 to 3.5)
    const [plateO, plateI] = HL.rings(plateX - 22, -22, plateX + 22, 22, 22, 1.5);
    const plateSol = HL.solid(svg);
    HL.put(plateSol, HL.prism(P, front, plateO, plateI, 0, 3.5));

    // 3. Four Clean Quarter Pie Slices
    const renderOrder = [2, 1, 3, 0];
    let takenCount = initialV !== undefined ? Math.round(HL.clamp(initialV, 0, 4)) : 1;

    const pieces = renderOrder.map(i => {
      const a0 = (i * Math.PI) / 2;
      const a1 = ((i + 1) * Math.PI) / 2;
      return {
        idx: i,
        a0,
        a1,
        sol: HL.solid(svg),
        sp: HL.spring(i < takenCount ? 1 : 0, { k: 140, c: 14 })
      };
    });

    function draw() {
      pieces.forEach(pc => {
        const u = pc.sp.x;

        const curX = HL.lerp(panX, plateX, u);
        const curY = 0;
        const curZ0 = 3.6 + 4 * 14 * u * (1 - u);
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

        // Curved outer rim bottom arc
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

        const isFocal = (pc.idx === takenCount - 1 && u >= 0.9) || (u > 0.1 && u < 0.9);
        pc.sol.sil.classList.toggle("hi", isFocal);
      });

      if (takenCount === 0) {
        read.textContent = "Bánh nguyên vẹn trong khay: 4/4 = 1 cái bánh";
      } else if (takenCount === 1) {
        read.textContent = "Bốc 1 miếng (1/4) ra đĩa: Trong khay còn lại 3/4 cái bánh";
      } else if (takenCount === 2) {
        read.textContent = "Bốc 2 miếng (2/4) ra đĩa: Đúng một nửa cái bánh (1/2)";
      } else if (takenCount === 3) {
        read.textContent = "Bốc 3 miếng (3/4) ra đĩa: Trong khay chỉ còn 1/4 cái bánh";
      } else {
        read.textContent = "Đã chuyển hết 4/4 miếng ra đĩa: Trọn vẹn 1 cái bánh";
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
      setSlices(Math.round(norm * 4));
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
    bag.add(HL.pointer(stage, { move: aim, leave: () => setSlices(1) }));
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
