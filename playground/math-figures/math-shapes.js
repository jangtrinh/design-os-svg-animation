/*
 * 8. 3D Geometric Solids (Khối Hình Không Gian)
 * Pedagogical Goal: 3D solids (Cube, Cylinder, Cone) & their 2D bottom footprints
 * Simplified Geometry: Clean solids on a minimalist base with 3 distinct 2D footprint pockets
 * Meaningful Interaction: Hovering pointer lifts each solid straight up to reveal its 2D shape below
 */

export default {
  id: "math-shapes",
  title: "8. Khối Hình Không Gian (3D Geometric Solids)",
  concept: "Nhận biết khối lập phương, khối trụ, khối nón & vết đáy 2D",
  means: "Ba khối hình học cơ bản tinh giản trên bàn đế: Khối lập phương, Khối trụ và Khối nón; di chuột để nhấc bổng từng khối, để lộ rõ vết in đáy hình học 2D (Hình vuông, Hình tròn).",
  rules: [1, 2, 4, 7, 9],
  range: [1, 2, 3],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-56, -20, 0], [56, 20, 52]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Baseboard (Z: 0 to 3.5)
    const [baseO, baseI] = HL.rings(-52, -18, 52, 18, 3.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 3.5));

    // 2. Three 2D Footprint Inset Outlines on Baseboard (Z = 3.6)
    // Cube: Square (-36, 0)
    const [sqO] = HL.rings(-45, -9, -27, 9, 1.5, 0.5);
    HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, sqO, 3.6)) }, svg);

    // Cylinder: Circle (0, 0)
    const cyPts = [];
    for (let k = 0; k <= 32; k++) {
      const a = (k / 32) * Math.PI * 2;
      cyPts.push(P(9.5 * Math.cos(a), 9.5 * Math.sin(a), 3.6));
    }
    HL.mk("path", { class: "lo nf", d: HL.poly(cyPts) }, svg);

    // Cone: Circle (36, 0)
    const conePts = [];
    for (let k = 0; k <= 32; k++) {
      const a = (k / 32) * Math.PI * 2;
      conePts.push(P(36 + 9.5 * Math.cos(a), 9.5 * Math.sin(a), 3.6));
    }
    HL.mk("path", { class: "lo nf", d: HL.poly(conePts) }, svg);

    // 3. Three Clean Geometric Solids
    const cubeSol = HL.solid(svg);
    const cylSol = HL.solid(svg);
    const coneSol = HL.solid(svg);
    const dropGuides = HL.mk("path", { class: "nf dash lo" }, svg);

    let activeShape = initialV != null ? HL.clamp(Math.round(initialV), 0, 3) : 2;
    const lift1 = HL.spring(activeShape === 1 ? 18 : 0, { k: 140, c: 14 });
    const lift2 = HL.spring(activeShape === 2 ? 18 : 0, { k: 140, c: 14 });
    const lift3 = HL.spring(activeShape === 3 ? 18 : 0, { k: 140, c: 14 });

    const cyRing = HL.circ(9.5, 32);
    const cyInner = HL.circ(8.5, 32);
    const coneRing = HL.circ(9.5, 32).map(q => ({ u: 36 + q.u, v: q.v, nu: q.nu, nv: q.nv }));

    function setShape(shapeIdx) {
      activeShape = shapeIdx;
      lift1.t = activeShape === 1 ? 18 : 0;
      lift2.t = activeShape === 2 ? 18 : 0;
      lift3.t = activeShape === 3 ? 18 : 0;
      reg.wake();
    }

    function draw() {
      let guides = "";

      // Cube: at X = -36
      const z1 = 3.6 + lift1.x;
      const [cO, cI] = HL.rings(-45, -9, -27, 9, 2.0, 0.8);
      HL.put(cubeSol, HL.prism(P, front, cO, cI, z1, z1 + 18));
      if (lift1.x > 1.0) {
        for (const [cx, cy] of [[-45, -9], [-27, -9], [-27, 9], [-45, 9]]) {
          guides += HL.seg(P(cx, cy, z1), P(cx, cy, 3.6));
        }
      }

      // Cylinder: at X = 0
      const z2 = 3.6 + lift2.x;
      HL.put(cylSol, HL.prism(P, front, cyRing, cyInner, z2, z2 + 20));
      if (lift2.x > 1.0) {
        const ext = HL.extremes(P, cyRing).slice(0, 2);
        ext.forEach(q => {
          guides += HL.seg(P(q.u, q.v, z2), P(q.u, q.v, 3.6));
        });
      }

      // Cone: at X = 36
      const z3 = 3.6 + lift3.x;
      const apex = P(36, 0, z3 + 22);
      const basePts = HL.ringAt(P, coneRing, z3);
      const coneSil = HL.poly(HL.hull([apex, ...basePts]));
      HL.put(coneSol, { sil: coneSil, crease: "" });
      if (lift3.x > 1.0) {
        const ext = HL.extremes(P, coneRing).slice(0, 2);
        ext.forEach(q => {
          guides += HL.seg(P(q.u, q.v, z3), P(q.u, q.v, 3.6));
        });
        guides += HL.seg(P(36, 0, z3), P(36, 0, 3.6));
      }

      dropGuides.setAttribute("d", guides);

      cubeSol.sil.classList.toggle("hi", activeShape === 1);
      cylSol.sil.classList.toggle("hi", activeShape === 2 || activeShape === 0);
      coneSol.sil.classList.toggle("hi", activeShape === 3);

      if (activeShape === 1) {
        read.textContent = "Khối Lập Phương nâng lên: Vết in đáy là Hình Vuông phẳng (4 cạnh bằng nhau)";
      } else if (activeShape === 2) {
        read.textContent = "Khối Trụ nâng lên: Vết in đáy là Hình Tròn phẳng (đường cong tròn kín)";
      } else if (activeShape === 3) {
        read.textContent = "Khối Nón nâng lên: Đáy là Hình Tròn phẳng, thu về 1 đỉnh chóp nhọn";
      } else {
        read.textContent = "Khối không gian: Di chuột vào từng khối để nhấc lên xem vết đáy 2D";
      }
    }

    function aim(pt) {
      if (!pt) {
        setShape(0);
        return;
      }
      const s1 = P(-36, 0, 10)[0];
      const s2 = P(0, 0, 10)[0];
      const s3 = P(36, 0, 10)[0];

      const d1 = Math.abs(pt[0] - s1);
      const d2 = Math.abs(pt[0] - s2);
      const d3 = Math.abs(pt[0] - s3);

      if (d1 < 26) setShape(1);
      else if (d2 < 26) setShape(2);
      else if (d3 < 26) setShape(3);
      else setShape(0);
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(lift1, dt);
      const m2 = HL.stepS(lift2, dt);
      const m3 = HL.stepS(lift3, dt);
      draw();
      return m1 || m2 || m3;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => setShape(0) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setShape(HL.clamp(Math.round(v), 0, 3));
      },
      destroy: bag.dispose
    };
  }
};
