export default {
    id: "math-shapes",
    title: "8. Khối Hình Không Gian (3D Geometric Solids)",
    concept: "Nhận biết khối lập phương, khối trụ, khối chóp",
    means: "Ba khối hình học cơ bản: Khối lập phương, Khối trụ và Khối nón; di chuột nâng từng khối lên để lộ hình phẳng đáy 2D.",
    rules: [1, 2, 4, 7, 9],
    range: [0, 10, 20],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.8);
      HL.fit(C, [[-55, -20, 0], [55, 20, 52]], 200, 178);
      const P = HL.proj(C), front = HL.facing(C);

      const [gridO, gridI] = HL.rings(-52, -18, 52, 18, 2, 1);
      const gridSol = HL.solid(svg);
      HL.put(gridSol, HL.prism(P, front, gridO, gridI, 0, 2));

      // 2D Footprints on base (z = 2.2)
      // Cube footprint: Square 24x24
      const sqPts = [P(-48, -12, 2.2), P(-24, -12, 2.2), P(-24, 12, 2.2), P(-48, 12, 2.2)];
      HL.mk("polygon", { points: sqPts.map(p => p.join(",")).join(" "), stroke: "#6f6f78", "stroke-dasharray": "2 2", fill: "none" }, svg);

      // Cylinder footprint: Circle R=12 (center 0, 0)
      const circPts = [];
      for (let a = 0; a <= 48; a++) {
        const rad = (a / 48) * Math.PI * 2;
        circPts.push(P(Math.cos(rad) * 12, Math.sin(rad) * 12, 2.2));
      }
      HL.mk("polygon", { points: circPts.map(p => p.join(",")).join(" "), stroke: "#6f6f78", "stroke-dasharray": "2 2", fill: "none" }, svg);

      // Cone footprint: Circle R=12 (center 36, 0)
      const coneFootPts = [];
      for (let a = 0; a <= 48; a++) {
        const rad = (a / 48) * Math.PI * 2;
        coneFootPts.push(P(36 + Math.cos(rad) * 12, Math.sin(rad) * 12, 2.2));
      }
      HL.mk("polygon", { points: coneFootPts.map(p => p.join(",")).join(" "), stroke: "#6f6f78", "stroke-dasharray": "2 2", fill: "none" }, svg);

      // Drop guides when lifted
      const dropGuides = HL.mk("path", { class: "nf dash lo" }, svg);

      const cubeSol = HL.solid(svg);
      const cylSol = HL.solid(svg);
      const coneSol = HL.solid(svg);

      const lift1 = HL.spring(0, { k: 130, c: 14 });
      const lift2 = HL.spring(0, { k: 130, c: 14 });
      const lift3 = HL.spring(0, { k: 130, c: 14 });

      const cyRing = HL.circ(12, 48);
      const cyInner = HL.circ(11, 48);
      const coneBaseRing = HL.circ(12, 48).map(q => ({ u: 36 + q.u, v: q.v, nu: q.nu, nv: q.nv }));

      function draw() {
        let guides = "";

        // 1. Cube: 24x24 base, height 24
        const z1 = 2 + lift1.x;
        const [cO, cI] = HL.rings(-48, -12, -24, 12, 2, 1);
        HL.put(cubeSol, HL.prism(P, front, cO, cI, z1, z1 + 24));
        if (lift1.x > 0.8) {
          const corners = [[-48, -12], [-24, -12], [-24, 12], [-48, 12]];
          corners.forEach(([cx, cy]) => {
            guides += HL.seg(P(cx, cy, z1), P(cx, cy, 2.2));
          });
        }

        // 2. Cylinder: Circle R=12, height 24
        const z2 = 2 + lift2.x;
        HL.put(cylSol, HL.prism(P, front, cyRing, cyInner, z2, z2 + 24));
        if (lift2.x > 0.8) {
          const ext = HL.extremes(P, cyRing).slice(0, 2);
          ext.forEach(q => {
            guides += HL.seg(P(q.u, q.v, z2), P(q.u, q.v, 2.2));
          });
        }

        // 3. Cone: Base circle R=12 at z3, Apex at (36, 0, z3 + 24)
        const z3 = 2 + lift3.x;
        const apex = P(36, 0, z3 + 24);
        const basePts = HL.ringAt(P, coneBaseRing, z3);
        const coneSil = HL.poly(HL.hull([apex, ...basePts]));
        HL.put(coneSol, { sil: coneSil, crease: "" });
        if (lift3.x > 0.8) {
          const ext = HL.extremes(P, coneBaseRing).slice(0, 2);
          ext.forEach(q => {
            guides += HL.seg(P(q.u, q.v, z3), P(q.u, q.v, 2.2));
          });
          // Center axis drop
          guides += HL.seg(P(36, 0, z3), P(36, 0, 2.2));
        }

        dropGuides.setAttribute("d", guides);
        read.textContent = "Khối Lập Phương (Đáy Vuông) · Khối Trụ (Đáy Tròn) · Khối Nón (Đáy Tròn, Đỉnh Nhọn)";
      }

      function aim(pt) {
        if (!pt) { lift1.t = 0; lift2.t = 0; lift3.t = 0; reg.wake(); return; }
        const s1 = P(-36, 0, 10)[0];
        const s2 = P(0, 0, 10)[0];
        const s3 = P(36, 0, 10)[0];
        lift1.t = Math.abs(pt[0] - s1) < 24 ? 18 : 0;
        lift2.t = Math.abs(pt[0] - s2) < 24 ? 18 : 0;
        lift3.t = Math.abs(pt[0] - s3) < 24 ? 18 : 0;
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const m1 = HL.stepS(lift1, dt);
        const m2 = HL.stepS(lift2, dt);
        const m3 = HL.stepS(lift3, dt);
        draw();
        return m1 || m2 || m3;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) { lift1.t = v; lift2.t = v; lift3.t = v; reg.wake(); },
        destroy: bag.dispose
      };
    }
  };
