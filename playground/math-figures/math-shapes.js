/*
 * 8. 3D Geometric Solids (Khối Hình Không Gian)
 * Authentic Grade 1 Pedagogical Manipulative: Cube, Cylinder, Cone & 2D Footprint Invariance
 * Lucas Markes Hairline Standard:
 * - Turned hardwood workshop base with filleted corners (r=4.0, b=1.4) & 4 corner foot pads
 * - Three precision recessed nests with chamfered lips (square, circular, circular with dimple)
 * - Chamfered cube with inset face panel creases
 * - Turned cylinder with top & bottom rim bevel rings
 * - Turned cone with base rim crease, apex bead & tangent contour highlight
 * - Smooth hover lift kinematics with drop guidelines & focal highlight transfer
 * - Pure 2:1 axonometric line art, zero SVG text
 */

export default {
  id: "math-shapes",
  title: "8. Khối Hình Không Gian (3D Geometric Solids)",
  concept: "Nhận biết khối lập phương, khối trụ, khối nón & vết đáy 2D",
  means: "Ba khối hình học cơ bản tinh xảo trên bàn đế: Khối lập phương, Khối trụ và Khối nón; di chuột để nhấc bổng từng khối, để lộ hốc khắc vết đáy hình học 2D chính xác.",
  rules: [1, 2, 4, 7, 9],
  range: [1, 2, 3],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-60, -24, 0], [60, 24, 55]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Turned Hardwood Workshop Bed (Z: 0 to 4.5)
    const [baseO, baseI] = HL.rings(-56, -22, 56, 22, 4.0, 1.4);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 4.5));

    // Corner foot pads
    for (const [fx, fy] of [[-50, -17], [50, -17], [-50, 17], [50, 17]]) {
      const [fO] = HL.rings(fx - 3.2, fy - 3.2, fx + 3.2, fy + 3.2, 3.2, 0.5);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, fO, 0)) }, svg);
    }

    // 2. Three Precision Recessed Footprint Nests (Z = 4.5 down to 2.2)
    // Nest 1: Cube Square Pocket (-36, 0)
    const [nest1O] = HL.rings(-46.5, -10.5, -25.5, 10.5, 2.0, 0.6);
    HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, nest1O, 4.5)) }, svg);
    const [nest1Floor] = HL.rings(-45.5, -9.5, -26.5, 9.5, 1.5, 0.5);
    HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, nest1Floor, 2.2)) }, svg);

    // Nest 2: Cylinder Circular Pocket (0, 0)
    const nest2Rim = [], nest2Floor = [];
    for (let k = 0; k <= 32; k++) {
      const a = (k / 32) * Math.PI * 2;
      nest2Rim.push(P(10.8 * Math.cos(a), 10.8 * Math.sin(a), 4.5));
      nest2Floor.push(P(9.8 * Math.cos(a), 9.8 * Math.sin(a), 2.2));
    }
    HL.mk("path", { class: "lo nf", d: HL.poly(nest2Rim) }, svg);
    HL.mk("path", { class: "lo nf", d: HL.poly(nest2Floor) }, svg);

    // Nest 3: Cone Circular Pocket (36, 0)
    const nest3Rim = [], nest3Floor = [];
    for (let k = 0; k <= 32; k++) {
      const a = (k / 32) * Math.PI * 2;
      nest3Rim.push(P(36 + 10.8 * Math.cos(a), 10.8 * Math.sin(a), 4.5));
      nest3Floor.push(P(36 + 9.8 * Math.cos(a), 9.8 * Math.sin(a), 2.2));
    }
    HL.mk("path", { class: "lo nf", d: HL.poly(nest3Rim) }, svg);
    HL.mk("path", { class: "lo nf", d: HL.poly(nest3Floor) }, svg);
    // Dimple at center of cone nest
    HL.mk("circle", { cx: HL.r2(P(36, 0, 2.3)[0]), cy: HL.r2(P(36, 0, 2.3)[1]), r: 1.2, fill: "#232327" }, svg);

    // 3. Precision Geometric Solids
    const cubeSol = HL.solid(svg);
    const cubeFaceCrease1 = HL.mk("path", { class: "cr nf", d: "" }, svg);
    const cubeFaceCrease2 = HL.mk("path", { class: "cr nf", d: "" }, svg);

    const cylSol = HL.solid(svg);
    const cylTopRim = HL.mk("ellipse", { rx: HL.r2(8.8 * C.S), ry: HL.r2(8.8 * C.S * C.k), class: "cr nf" }, svg);

    const coneSol = HL.solid(svg);
    const coneBaseRim = HL.mk("ellipse", { rx: HL.r2(9.8 * C.S), ry: HL.r2(9.8 * C.S * C.k), class: "cr nf" }, svg);
    const coneApexDot = HL.mk("circle", { r: 1.2, fill: "#232327" }, svg);
    const coneContour = HL.mk("line", { class: "cr", "stroke-width": 0.8 }, svg);

    // Drop guidelines & shadows
    const dropGuides = HL.mk("path", { class: "nf dash lo" }, svg);

    // Lift springs
    let activeShape = initialV != null ? HL.clamp(Math.round(initialV), 0, 3) : 2;
    const lift1 = HL.spring(activeShape === 1 ? 20 : 0, { k: 140, c: 14 });
    const lift2 = HL.spring(activeShape === 2 ? 20 : 0, { k: 140, c: 14 });
    const lift3 = HL.spring(activeShape === 3 ? 20 : 0, { k: 140, c: 14 });

    const cyRing = HL.circ(10.0, 32);
    const cyInner = HL.circ(9.0, 32);
    const coneRing = HL.circ(10.0, 32).map(q => ({ u: 36 + q.u, v: q.v, nu: q.nu, nv: q.nv }));

    function setShape(shapeIdx) {
      activeShape = shapeIdx;
      lift1.t = activeShape === 1 ? 20 : 0;
      lift2.t = activeShape === 2 ? 20 : 0;
      lift3.t = activeShape === 3 ? 20 : 0;
      reg.wake();
    }

    function draw() {
      let guides = "";

      // --- 1. CUBE: at X = -36 ---
      const z1 = 2.4 + lift1.x;
      const [cO, cI] = HL.rings(-45, -9, -27, 9, 2.2, 0.9);
      HL.put(cubeSol, HL.prism(P, front, cO, cI, z1, z1 + 18));

      // Side face panel creases
      const fcZ0 = z1 + 2.0;
      const fcZ1 = z1 + 16.0;
      const fc1 = [
        P(-43, 9, fcZ0), P(-29, 9, fcZ0),
        P(-29, 9, fcZ1), P(-43, 9, fcZ1)
      ];
      cubeFaceCrease1.setAttribute("d", HL.poly(fc1));
      const fc2 = [
        P(-27, -7, fcZ0), P(-27, 7, fcZ0),
        P(-27, 7, fcZ1), P(-27, -7, fcZ1)
      ];
      cubeFaceCrease2.setAttribute("d", HL.poly(fc2));

      if (lift1.x > 1.0) {
        for (const [cx, cy] of [[-45, -9], [-27, -9], [-27, 9], [-45, 9]]) {
          guides += HL.seg(P(cx, cy, z1), P(cx, cy, 2.4));
        }
      }

      // --- 2. CYLINDER: at X = 0 ---
      const z2 = 2.4 + lift2.x;
      HL.put(cylSol, HL.prism(P, front, cyRing, cyInner, z2, z2 + 20));

      const cylTopCenter = P(0, 0, z2 + 20.1);
      cylTopRim.setAttribute("cx", HL.r2(cylTopCenter[0]));
      cylTopRim.setAttribute("cy", HL.r2(cylTopCenter[1]));

      if (lift2.x > 1.0) {
        const ext = HL.extremes(P, cyRing).slice(0, 2);
        ext.forEach(q => {
          guides += HL.seg(P(q.u, q.v, z2), P(q.u, q.v, 2.4));
        });
      }

      // --- 3. CONE: at X = 36 ---
      const z3 = 2.4 + lift3.x;
      const apex = P(36, 0, z3 + 22);
      const basePts = HL.ringAt(P, coneRing, z3);
      const coneSil = HL.poly(HL.hull([apex, ...basePts]));

      // Tangent crease from apex down the front face
      const frontPt = P(36 + 10.0 * Math.SQRT1_2, 10.0 * Math.SQRT1_2, z3);
      const coneCrease = HL.seg(apex, frontPt);
      HL.put(coneSol, { sil: coneSil, crease: coneCrease });

      const coneBaseCenter = P(36, 0, z3);
      coneBaseRim.setAttribute("cx", HL.r2(coneBaseCenter[0]));
      coneBaseRim.setAttribute("cy", HL.r2(coneBaseCenter[1]));

      coneApexDot.setAttribute("cx", HL.r2(apex[0]));
      coneApexDot.setAttribute("cy", HL.r2(apex[1]));

      if (lift3.x > 1.0) {
        const ext = HL.extremes(P, coneRing).slice(0, 2);
        ext.forEach(q => {
          guides += HL.seg(P(q.u, q.v, z3), P(q.u, q.v, 2.4));
        });
        guides += HL.seg(P(36, 0, z3), P(36, 0, 2.4));
      }

      dropGuides.setAttribute("d", guides);

      // Semantic highlight: cylinder at rest, or active lifted shape
      cubeSol.sil.classList.toggle("hi", activeShape === 1);
      cylSol.sil.classList.toggle("hi", activeShape === 2 || (activeShape === 0));
      coneSol.sil.classList.toggle("hi", activeShape === 3);

      if (activeShape === 1) {
        read.textContent = "Cube: Square 2D footprint (4 equal straight sides)";
      } else if (activeShape === 2) {
        read.textContent = "Cylinder: Circle 2D footprint (continuous smooth curve)";
      } else if (activeShape === 3) {
        read.textContent = "Cone: Circle 2D base tapering to 1 sharp apex vertex";
      } else {
        read.textContent = "Solids: Hover any shape to lift and inspect its 2D footprint";
      }
    }

    function aim(pt) {
      if (!pt) {
        setShape(0);
        return;
      }
      const s1 = P(-36, 0, 12)[0];
      const s2 = P(0, 0, 12)[0];
      const s3 = P(36, 0, 12)[0];

      const d1 = Math.abs(pt[0] - s1);
      const d2 = Math.abs(pt[0] - s2);
      const d3 = Math.abs(pt[0] - s3);

      if (d1 < 28) setShape(1);
      else if (d2 < 28) setShape(2);
      else if (d3 < 28) setShape(3);
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
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => setShape(0)
    }));
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
