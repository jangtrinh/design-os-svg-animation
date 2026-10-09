/*
 * 9. Fraction Pie (Bánh Phân Số Montessori 1/4, 1/2, 3/4, 4/4)
 * Pedagogical Goal: Part-whole fractions (1/4, 2/4 = 1/2, 3/4, 4/4)
 * Simplified Geometry: A single circular puzzle tray with 4 quadrant pieces sliding radially outward
 * Meaningful Interaction: Moving pointer smoothly separates 1, 2, 3, or 4 quarter pieces from the center
 */

export default {
  id: "math-fraction-pie",
  title: "9. Bánh Phân Số 1/4 (Fraction Pie)",
  concept: "Phân số cơ bản: một phần tư (1/4), một nửa (1/2), toàn bộ (4/4)",
  means: "Bánh tròn chia 4 miếng quạt 90° tinh giản trong 1 khay gỗ tròn: di chuột ngang để tách 1 đến 4 miếng trượt tỏa tròn ra ngoài, trực quan hóa 1/4, 2/4 = 1/2, 3/4.",
  rules: [1, 2, 4, 7, 9],
  range: [0, 1, 4],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-46, -46, 0], [46, 46, 25]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    const R = 22.0;
    const H = 6.0;

    // 1. Clean Circular Puzzle Tray (Z: 0 to 3.0)
    const [trayO, trayI] = HL.rings(-38, -38, 38, 38, 38, 2.0);
    const traySol = HL.solid(svg);
    HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 3.0));

    // Recessed circular puzzle nest rim at Z = 3.0
    const nestRim = [];
    for (let k = 0; k <= 36; k++) {
      const a = (k / 36) * Math.PI * 2;
      nestRim.push(P(34.0 * Math.cos(a), 34.0 * Math.sin(a), 3.0));
    }
    HL.mk("path", { class: "lo nf", d: HL.poly(nestRim) }, svg);

    // 2. Four Clean Quadrant Pieces (Render order: back to front)
    const quadrantOrder = [2, 1, 3, 0];
    let takenCount = initialV !== undefined ? Math.round(HL.clamp(initialV, 0, 4)) : 1;

    const pieces = quadrantOrder.map(i => {
      const a0 = (i * Math.PI) / 2;
      const a1 = ((i + 1) * Math.PI) / 2;
      const midA = (a0 + a1) / 2;
      const dirX = Math.cos(midA);
      const dirY = Math.sin(midA);

      const g = HL.mk("g", { class: "piece" }, svg);
      const sidePath = HL.mk("path", { class: "sil" }, g);
      const topPath = HL.mk("path", { class: "sil" }, g);

      return {
        idx: i,
        a0,
        a1,
        dirX,
        dirY,
        g,
        sidePath,
        topPath,
        spDist: HL.spring(i < takenCount ? 10.0 : 0.0, { k: 140, c: 14 })
      };
    });

    function draw() {
      pieces.forEach(pc => {
        const dist = pc.spDist.x;
        const cx = pc.dirX * dist;
        const cy = pc.dirY * dist;
        const z0 = 3.2;
        const z1 = z0 + H;

        const numArc = 16;
        const topPts = [P(cx, cy, z1)];
        const botPts = [P(cx, cy, z0)];

        for (let k = 0; k <= numArc; k++) {
          const ang = pc.a0 + (pc.a1 - pc.a0) * (k / numArc);
          topPts.push(P(cx + R * Math.cos(ang), cy + R * Math.sin(ang), z1));
          botPts.push(P(cx + R * Math.cos(ang), cy + R * Math.sin(ang), z0));
        }

        // 1. Visible Side Faces (Opaque white fill)
        // Outward normal for radial face at a0 (from center outward): (sin a0, -cos a0)
        const n0 = { nu: Math.sin(pc.a0), nv: -Math.cos(pc.a0) };
        // Outward normal for radial face at a1 (from outer rim inward): (-sin a1, cos a1)
        const n1 = { nu: -Math.sin(pc.a1), nv: Math.cos(pc.a1) };

        let sideD = "";
        const Tc = topPts[0], Bc = botPts[0];

        if (front(n0)) {
          const T0 = topPts[1], B0 = botPts[1];
          sideD += HL.poly([Tc, T0, B0, Bc]);
        }
        if (front(n1)) {
          const T1 = topPts[numArc + 1], B1 = botPts[numArc + 1];
          sideD += HL.poly([Tc, T1, B1, Bc]);
        }

        // Cylindrical outer wall for arc segments facing camera
        const frontTop = [], frontBot = [];
        for (let k = 0; k <= numArc; k++) {
          const ang = pc.a0 + (pc.a1 - pc.a0) * (k / numArc);
          if (front({ nu: Math.cos(ang), nv: Math.sin(ang) })) {
            frontTop.push(topPts[k + 1]);
            frontBot.push(botPts[k + 1]);
          }
        }
        if (frontTop.length > 1) {
          sideD += HL.poly([...frontTop, ...frontBot.slice().reverse()]);
        }

        pc.sidePath.setAttribute("d", sideD);

        // 2. Opaque Top Face (Rendered ON TOP of side faces to cleanly occlude all hidden lines)
        const topD = HL.poly(topPts);
        pc.topPath.setAttribute("d", topD);

        const isSeparated = dist > 2.0;
        const isTarget = isSeparated && pc.idx === takenCount - 1;
        pc.topPath.classList.toggle("hi", isTarget);
        pc.sidePath.classList.toggle("hi", isTarget);
      });


      if (takenCount === 0) {
        read.textContent = "Bánh nguyên vẹn: 4/4 = 1 cái bánh trọn vẹn";
      } else if (takenCount === 1) {
        read.textContent = "Tách 1 miếng (1/4): Còn lại 3/4 cái bánh";
      } else if (takenCount === 2) {
        read.textContent = "Tách 2 miếng (2/4): Còn lại đúng một nửa (1/2 cái bánh)";
      } else if (takenCount === 3) {
        read.textContent = "Tách 3 miếng (3/4): Còn lại 1/4 cái bánh";
      } else {
        read.textContent = "Tách cả 4 miếng: 4 phần tư (4/4)";
      }
    }

    function setSlices(count) {
      takenCount = HL.clamp(count, 0, 4);
      pieces.forEach(pc => {
        pc.spDist.t = pc.idx < takenCount ? 10.0 : 0.0;
      });
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setSlices(1);
        return;
      }
      const pLeft = P(-30, 0, 3)[0];
      const pRight = P(30, 0, 3)[0];
      const norm = HL.clamp((pt[0] - pLeft) / (pRight - pLeft), 0, 1);
      setSlices(Math.round(norm * 4));
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      pieces.forEach(pc => {
        if (HL.stepS(pc.spDist, dt)) moving = true;
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
