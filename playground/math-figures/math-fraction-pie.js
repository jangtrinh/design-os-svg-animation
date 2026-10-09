/*
 * 9. Fraction Pie (Bánh Phân Số Montessori 1/4, 1/2, 3/4, 4/4)
 * Authentic Grade 1 Pedagogical Manipulative: Fractions of a Whole & Visual Partitioning
 * Lucas Markes Hairline Standard:
 * - Turned hardwood baking tray with recessed circular pocket, stepped rim & center locator pin
 * - Turned wooden serving plate with dished concave profile & concentric rim turning lines
 * - Precision Montessori quadrant tiles with filleted corners, top perimeter bevel creases & radial creases
 * - Smooth parabolic transfer flight with spring kinematics & drop guidelines
 * - Semantic highlight (hi) on airborne / transferred quadrant
 * - Pure 2:1 axonometric line art, zero SVG text
 */

export default {
  id: "math-fraction-pie",
  title: "9. Bánh Phân Số 1/4 (Fraction Pie)",
  concept: "Phân số cơ bản: một phần tư (1/4), một nửa (1/2), toàn bộ (4/4)",
  means: "Bánh tròn chia 4 miếng quạt 90° tinh xảo: di chuột để nhấc các miếng bánh từ khay nướng sang đĩa ăn theo cung bay 3D mượt mà, trực quan hóa 1/4, 2/4 = 1/2, 3/4.",
  rules: [1, 2, 4, 7, 9],
  range: [0, 1, 4],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-60, -26, 0], [60, 26, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    const R = 18.5;
    const H = 7.5;
    const panX = -27;
    const plateX = 27;

    // 1. Turned Hardwood Baking Tray at X = -27 (Z: 0 to 4.5)
    const [panO, panI] = HL.rings(panX - 25, -25, panX + 25, 25, 25, 2.0);
    const panSol = HL.solid(svg);
    HL.put(panSol, HL.prism(P, front, panO, panI, 0, 4.5));

    // Foot pads under baking tray
    for (const [fx, fy] of [[panX - 18, -18], [panX + 18, -18], [panX - 18, 18], [panX + 18, 18]]) {
      const [fO] = HL.rings(fx - 2.8, fy - 2.8, fx + 2.8, fy + 2.8, 2.8, 0.5);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, fO, 0)) }, svg);
    }

    // Recessed circular pocket in baking tray (Z = 4.5 down to 2.2)
    const panRim = [], panFloor = [];
    for (let k = 0; k <= 36; k++) {
      const a = (k / 36) * Math.PI * 2;
      panRim.push(P(panX + 20.5 * Math.cos(a), 20.5 * Math.sin(a), 4.5));
      panFloor.push(P(panX + 19.5 * Math.cos(a), 19.5 * Math.sin(a), 2.2));
    }
    HL.mk("path", { class: "lo nf", d: HL.poly(panRim) }, svg);
    HL.mk("path", { class: "lo nf", d: HL.poly(panFloor) }, svg);

    // Center locator pin in baking tray
    HL.mk("circle", { cx: HL.r2(P(panX, 0, 2.3)[0]), cy: HL.r2(P(panX, 0, 2.3)[1]), r: 1.4, fill: "#232327" }, svg);

    // Etched quadrant crosshair in tray floor
    HL.mk("line", {
      x1: HL.r2(P(panX - 18, 0, 2.3)[0]), y1: HL.r2(P(panX - 18, 0, 2.3)[1]),
      x2: HL.r2(P(panX + 18, 0, 2.3)[0]), y2: HL.r2(P(panX + 18, 0, 2.3)[1]),
      class: "lo", "stroke-dasharray": "2 2"
    }, svg);
    HL.mk("line", {
      x1: HL.r2(P(panX, -18, 2.3)[0]), y1: HL.r2(P(panX, -18, 2.3)[1]),
      x2: HL.r2(P(panX, 18, 2.3)[0]), y2: HL.r2(P(panX, 18, 2.3)[1]),
      class: "lo", "stroke-dasharray": "2 2"
    }, svg);

    // 2. Turned Hardwood Serving Plate at X = 27 (Z: 0 to 4.5)
    const [plateO, plateI] = HL.rings(plateX - 25, -25, plateX + 25, 25, 25, 2.0);
    const plateSol = HL.solid(svg);
    HL.put(plateSol, HL.prism(P, front, plateO, plateI, 0, 4.5));

    // Foot pads under plate
    for (const [fx, fy] of [[plateX - 18, -18], [plateX + 18, -18], [plateX - 18, 18], [plateX + 18, 18]]) {
      const [fO] = HL.rings(fx - 2.8, fy - 2.8, fx + 2.8, fy + 2.8, 2.8, 0.5);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, fO, 0)) }, svg);
    }

    // Dished concentric turning rings on serving plate
    for (const rPlate of [20.5, 18.5, 14.0]) {
      const plateRing = [];
      for (let k = 0; k <= 36; k++) {
        const a = (k / 36) * Math.PI * 2;
        plateRing.push(P(plateX + rPlate * Math.cos(a), rPlate * Math.sin(a), 4.5));
      }
      HL.mk("path", { class: "lo nf", d: HL.poly(plateRing) }, svg);
    }

    // 3. Four Precision Montessori Quadrant Tiles
    // Render order from back to front for proper isometric occlusion
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
        faceCrease: HL.mk("path", { class: "cr nf", d: "" }, svg),
        sp: HL.spring(i < takenCount ? 1 : 0, { k: 140, c: 14 })
      };
    });

    function draw() {
      pieces.forEach(pc => {
        const u = pc.sp.x;

        // Path from pan to plate with gentle lifting arc in Z
        const curX = HL.lerp(panX, plateX, u);
        const curY = 0;
        const curZ0 = 2.4 + 4 * 16 * u * (1 - u);
        const curZ1 = curZ0 + H;

        const numArc = 16;
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

        // Inset face crease on top surface for light-catching bevel
        const rInner = R - 1.6;
        const innerTopPts = [P(curX + 1.2 * Math.cos((pc.a0 + pc.a1) / 2), curY + 1.2 * Math.sin((pc.a0 + pc.a1) / 2), curZ1 + 0.1)];
        for (let k = 0; k <= numArc; k++) {
          const ang = pc.a0 + 0.05 + (pc.a1 - pc.a0 - 0.1) * (k / numArc);
          innerTopPts.push(P(curX + rInner * Math.cos(ang), curY + rInner * Math.sin(ang), curZ1 + 0.1));
        }
        pc.faceCrease.setAttribute("d", HL.poly(innerTopPts));

        // Focal highlight: active flying or transferred quadrant
        const isAirborne = u > 0.05 && u < 0.95;
        const isFocal = (pc.idx === takenCount - 1 && u >= 0.95) || isAirborne;
        pc.sol.sil.classList.toggle("hi", isFocal);
      });

      if (takenCount === 0) {
        read.textContent = "Fraction Pie: 4/4 = 1 Whole";
      } else if (takenCount === 1) {
        read.textContent = "Fraction Pie: 1/4 on plate, 3/4 remaining in tray";
      } else if (takenCount === 2) {
        read.textContent = "Fraction Pie: 2/4 = 1/2 on plate (One Half)";
      } else if (takenCount === 3) {
        read.textContent = "Fraction Pie: 3/4 on plate, 1/4 in tray";
      } else {
        read.textContent = "Fraction Pie: 4/4 transferred (Whole Pie on Plate)";
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
      const pLeft = P(panX, 0, 4)[0];
      const pRight = P(plateX, 0, 4)[0];
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
