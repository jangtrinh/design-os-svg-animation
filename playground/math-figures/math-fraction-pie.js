/*
 * 9. Fraction Pie (Bánh Phân Số Montessori 1/4, 1/2, 3/4, 4/4)
 * Pedagogical Goal: Part-whole fractions (1/4, 2/4 = 1/2, 3/4, 4/4)
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
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.4);
    HL.fit(C, [[-38, -38, 0], [38, 38, 14]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    const R = 22.0;
    const H = 7.5;

    // 1. Clean Circular Puzzle Tray (Z: 0 to 5.0)
    const [trayO, trayI] = HL.rings(-38, -38, 38, 38, 38, 2.0);
    const traySol = HL.solid(svg);
    HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 5.0));

    // Recessed circular puzzle nest rim at Z = 5.0
    const nestRim = [];
    for (let k = 0; k <= 36; k++) {
      const a = (k / 36) * Math.PI * 2;
      nestRim.push(P(34.0 * Math.cos(a), 34.0 * Math.sin(a), 5.0));
    }
    HL.mk("path", { class: "lo nf", d: HL.poly(nestRim) }, svg);

    // 2. Four Clean Quadrant Pieces (Render order: back to front)
    const quadrantOrder = [2, 1, 3, 0];
    let takenCount = initialV !== undefined ? Math.round(HL.clamp(initialV, 0, 4)) : 1;

    const pieces = quadrantOrder.map(i => {
      const a0 = (i * Math.PI) / 2;
      const a1 = ((i + 1) * Math.PI) / 2;
      const midA = (a0 + a1) / 2;
      const g = HL.mk("g", { class: "piece" }, svg);
      const sidePath = HL.mk("path", { class: "sil" }, g);
      const topPath = HL.mk("path", { class: "sil" }, g);

      return {
        idx: i,
        a0,
        a1,
        dirX: Math.cos(midA),
        dirY: Math.sin(midA),
        sidePath,
        topPath,
        spDist: HL.spring(i < takenCount ? 9.0 : 0.0, { k: 140, c: 14 })
      };
    });

    let lastKey = "";

    function draw() {
      const key = `${takenCount}:${pieces.map(p => HL.r2(p.spDist.x)).join(",")}`;
      if (key === lastKey) return;
      lastKey = key;

      pieces.forEach(pc => {
        const dist = pc.spDist.x;
        const cx = pc.dirX * dist;
        const cy = pc.dirY * dist;
        const z0 = 5.2;
        const z1 = z0 + H;

        const numArc = 16;
        const topPts = [P(cx, cy, z1)];
        const botPts = [P(cx, cy, z0)];

        for (let k = 0; k <= numArc; k++) {
          const ang = pc.a0 + (pc.a1 - pc.a0) * (k / numArc);
          topPts.push(P(cx + R * Math.cos(ang), cy + R * Math.sin(ang), z1));
          botPts.push(P(cx + R * Math.cos(ang), cy + R * Math.sin(ang), z0));
        }

        const n0 = { nu: Math.sin(pc.a0), nv: -Math.cos(pc.a0) };
        const n1 = { nu: -Math.sin(pc.a1), nv: Math.cos(pc.a1) };

        let sideD = "";
        const Tc = topPts[0], Bc = botPts[0];

        if (front(n0)) {
          sideD += HL.poly([Tc, topPts[1], botPts[1], Bc]);
        }
        if (front(n1)) {
          sideD += HL.poly([Tc, topPts[numArc + 1], botPts[numArc + 1], Bc]);
        }

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
        pc.topPath.setAttribute("d", HL.poly(topPts));

        const isTarget = takenCount === 0 ? pc.idx === 0 : pc.idx === takenCount - 1;
        pc.topPath.classList.toggle("hi", isTarget);
        pc.sidePath.classList.toggle("hi", isTarget);
      });

      const labels = [
        "4/4 = 1 bánh nguyên",
        "Tách 1/4 · Còn 3/4 bánh",
        "Tách 2/4 = 1/2 cái bánh",
        "Tách 3/4 · Còn 1/4 bánh",
        "Tách 4/4 = 4 phần tư"
      ];
      read.textContent = labels[takenCount];
    }

    function setSlices(count) {
      takenCount = HL.clamp(count, 0, 4);
      pieces.forEach(pc => {
        pc.spDist.t = pc.idx < takenCount ? 9.0 : 0.0;
      });
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setSlices(1);
        return;
      }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 5.0);
      const axis = (wx - wy) * Math.SQRT1_2;
      const norm = HL.clamp((axis + 28) / 56, 0, 1);
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
