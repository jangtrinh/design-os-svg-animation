export default {
    id: "math-fraction-pie",
    title: "9. Đĩa Phân Số 1/4 (Fraction Wheel)",
    concept: "Khái niệm một phần tư và một phần hai",
    means: "Đĩa tròn phân số chia 4 phần bằng nhau: di chuột làm 4 miếng bánh tách rời hướng tâm, minh họa 1/4 + 1/4 + 1/4 + 1/4 = 1.",
    rules: [1, 2, 4, 7, 8],
    range: [0, 8, 16],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-45, -45, 0], [45, 45, 20]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Base tray (Z: 0 to 3)
      const [trayO, trayI] = HL.rings(-44, -44, 44, 44, 44, 2);
      const traySol = HL.solid(svg);
      HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 3));

      // 2D Footprint guidelines on tray surface (Z: 3.1)
      const trayCircPts = [];
      for (let a = 0; a <= 48; a++) {
        const rad = (a / 48) * Math.PI * 2;
        trayCircPts.push(P(Math.cos(rad) * 30, Math.sin(rad) * 30, 3.1));
      }
      HL.mk("polygon", { points: trayCircPts.map(p => p.join(",")).join(" "), stroke: "#c3c3c9", "stroke-dasharray": "2 2", fill: "none" }, svg);
      HL.mk("line", { x1: P(-30, 0, 3.1)[0], y1: P(-30, 0, 3.1)[1], x2: P(30, 0, 3.1)[0], y2: P(30, 0, 3.1)[1], stroke: "#c3c3c9", "stroke-dasharray": "2 2" }, svg);
      HL.mk("line", { x1: P(0, -30, 3.1)[0], y1: P(0, -30, 3.1)[1], x2: P(0, 30, 3.1)[0], y2: P(0, 30, 3.1)[1], stroke: "#c3c3c9", "stroke-dasharray": "2 2" }, svg);

      // 4 Quadrant pieces (90° sectors), created in back-to-front depth order for SVG painter's algorithm
      // Order: quadrant 2 (back: x<0, y<0), 1 (x<0, y>0), 3 (x>0, y<0), 0 (front: x>0, y>0)
      const renderOrder = [2, 1, 3, 0];
      const pieces = renderOrder.map(i => {
        const a0 = i * Math.PI / 2;
        const a1 = (i + 1) * Math.PI / 2;
        const mid = (a0 + a1) / 2;
        return {
          idx: i,
          a0,
          a1,
          dx: Math.cos(mid),
          dy: Math.sin(mid),
          sol: HL.solid(svg)
        };
      });

      const explode = HL.spring(0, { k: 130, c: 14 });
      const R = 30;
      const numArc = 16;
      const z0 = 3;
      const z1 = 12;

      function draw() {
        const d = explode.x;
        pieces.forEach(pc => {
          const cx = pc.dx * d;
          const cy = pc.dy * d;

          // 2D sector boundary: apex (cx, cy) -> ray a0 -> circular arc -> ray a1 -> apex
          const sectorPts2D = [[cx, cy]];
          for (let k = 0; k <= numArc; k++) {
            const ang = pc.a0 + (pc.a1 - pc.a0) * (k / numArc);
            sectorPts2D.push([cx + R * Math.cos(ang), cy + R * Math.sin(ang)]);
          }

          const topPts = sectorPts2D.map(p => P(p[0], p[1], z1));
          const botPts = sectorPts2D.map(p => P(p[0], p[1], z0));

          // Silhouette: convex hull of top and bottom face vertices
          const sil = HL.poly(HL.hull(topPts.concat(botPts)));

          // Internal creases: top sector outline + visible cut faces + visible bottom curved arc
          let crease = HL.poly(topPts);

          // Face 1 (along ray a0): normal (sin a0, -cos a0)
          if (front({ nu: Math.sin(pc.a0), nv: -Math.cos(pc.a0) })) {
            crease += HL.seg(P(cx, cy, z0), P(cx + R * Math.cos(pc.a0), cy + R * Math.sin(pc.a0), z0));
            crease += HL.seg(P(cx, cy, z0), P(cx, cy, z1));
            crease += HL.seg(P(cx + R * Math.cos(pc.a0), cy + R * Math.sin(pc.a0), z0), P(cx + R * Math.cos(pc.a0), cy + R * Math.sin(pc.a0), z1));
          }

          // Face 2 (along ray a1): normal (-sin a1, cos a1)
          if (front({ nu: -Math.sin(pc.a1), nv: Math.cos(pc.a1) })) {
            crease += HL.seg(P(cx, cy, z0), P(cx + R * Math.cos(pc.a1), cy + R * Math.sin(pc.a1), z0));
            crease += HL.seg(P(cx, cy, z0), P(cx, cy, z1));
            crease += HL.seg(P(cx + R * Math.cos(pc.a1), cy + R * Math.sin(pc.a1), z0), P(cx + R * Math.cos(pc.a1), cy + R * Math.sin(pc.a1), z1));
          }

          // Curved face: visible bottom arc
          const frontArc = [];
          for (let k = 0; k <= numArc; k++) {
            const ang = pc.a0 + (pc.a1 - pc.a0) * (k / numArc);
            if (front({ nu: Math.cos(ang), nv: Math.sin(ang) })) {
              frontArc.push(P(cx + R * Math.cos(ang), cy + R * Math.sin(ang), z0));
            }
          }
          if (frontArc.length > 1) {
            crease += HL.open(frontArc);
          }

          HL.put(pc.sol, { sil, crease });
        });

        read.textContent = "Phân số: 1/4 + 1/4 + 1/4 + 1/4 = 1 hình tròn (4 góc vuông 90°)";
      }

      function aim(pt) {
        if (!pt) { explode.t = 0; reg.wake(); return; }
        const center = P(0, 0, 7.5);
        const dist = Math.hypot(pt[0] - center[0], pt[1] - center[1]);
        explode.t = HL.clamp((1 - dist / 80) * 14, 0, 14);
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const moving = HL.stepS(explode, dt);
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) { explode.t = v; reg.wake(); },
        destroy: bag.dispose
      };
    }
  };
