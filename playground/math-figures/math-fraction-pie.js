/*
 * 9. Math Fraction Pie (Bánh Phân Số 1/4 & Một Nửa)
 * Authentic Meaningful Interaction: Taking Slices from Baking Tray to Serving Plate
 * Illustrates concrete part-whole fraction decomposition (4/4 = 1, 3/4, 2/4 = 1/2, 1/4)
 */

export default {
  id: "math-fraction-pie",
  title: "9. Bánh Phân Số 1/4 (Fraction Pie)",
  concept: "Phần tư (1/4) và Một nửa (1/2)",
  means: "Bánh tròn chia 4 miếng quạt 90°: khay nướng bên trái, đĩa ăn bên phải; click để bốc từng miếng bánh ra đĩa, trực quan hóa 4/4 = 1, 3/4, 2/4 = 1/2, 1/4.",
  rules: [1, 2, 4, 7, 8],
  range: [0, 1, 4],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-60, -26, 0], [60, 26, 25]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    const panX = -26;
    const plateX = 26;
    const R = 20;
    const z0 = 3;
    const z1 = 10;
    const numArc = 14;

    // 1. Left: Baking Tray (Khay nướng bánh)
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

    const panLabel = HL.mk("text", {
      x: P(panX, -20, 3.1)[0], y: P(panX, -20, 3.1)[1],
      fill: "#6f6f78", "font-size": "8px", "font-family": "ui-monospace, monospace",
      "text-anchor": "middle", "font-weight": "600"
    }, svg);
    panLabel.textContent = "KHAY BÁNH";

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

    const plateLabel = HL.mk("text", {
      x: P(plateX, -20, 3.1)[0], y: P(plateX, -20, 3.1)[1],
      fill: "#6f6f78", "font-size": "8px", "font-family": "ui-monospace, monospace",
      "text-anchor": "middle", "font-weight": "600"
    }, svg);
    plateLabel.textContent = "ĐĨA ĂN";

    // 3. 4 Slices (Quarter Wedges)
    // Slices order for Painter's algorithm depth:
    // Quadrant 2 (back: x<0, y<0), 1 (x<0, y>0), 3 (x>0, y<0), 0 (front: x>0, y>0)
    const renderOrder = [2, 1, 3, 0];
    let takenCount = initialV !== undefined ? Math.round(HL.clamp(initialV, 0, 4)) : 1;

    const pieces = renderOrder.map(i => {
      const a0 = i * Math.PI / 2;
      const a1 = (i + 1) * Math.PI / 2;
      const mid = (a0 + a1) / 2;
      return {
        idx: i,
        a0,
        a1,
        mid,
        // Harmonic spring for transferring from Pan (0) to Plate (1)
        sp: HL.spring(i < takenCount ? 1 : 0, { k: 110, c: 14 }),
        sol: HL.solid(svg)
      };
    });

    function draw() {
      pieces.forEach(pc => {
        const t = pc.sp.x;
        // Current center position: lerp from panX to plateX
        const curX = HL.lerp(panX, plateX, t);
        // Small radial displacement when landing or flying
        const curY = 0;
        // Arc lift height during flight
        const flightLift = 4 * 10 * t * (1 - t);
        const curZ0 = z0 + flightLift;
        const curZ1 = z1 + flightLift;

        // 2D sector boundary: apex (curX, curY) -> ray a0 -> circular arc -> ray a1 -> apex
        const sectorPts2D = [[curX, curY]];
        for (let k = 0; k <= numArc; k++) {
          const ang = pc.a0 + (pc.a1 - pc.a0) * (k / numArc);
          sectorPts2D.push([curX + R * Math.cos(ang), curY + R * Math.sin(ang)]);
        }

        const topPts = sectorPts2D.map(p => P(p[0], p[1], curZ1));
        const botPts = sectorPts2D.map(p => P(p[0], p[1], curZ0));

        // Convex hull of projected top and bottom vertices
        const sil = HL.poly(HL.hull(topPts.concat(botPts)));

        // Crease lines: top face + visible cut walls
        let crease = HL.poly(topPts);

        // Radial cut face 1 (along ray a0)
        if (front({ nu: Math.sin(pc.a0), nv: -Math.cos(pc.a0) })) {
          crease += HL.seg(P(curX, curY, curZ0), P(curX + R * Math.cos(pc.a0), curY + R * Math.sin(pc.a0), curZ0));
          crease += HL.seg(P(curX, curY, curZ0), P(curX, curY, curZ1));
          crease += HL.seg(P(curX + R * Math.cos(pc.a0), curY + R * Math.sin(pc.a0), curZ0), P(curX + R * Math.cos(pc.a0), curY + R * Math.sin(pc.a0), curZ1));
        }

        // Radial cut face 2 (along ray a1)
        if (front({ nu: -Math.sin(pc.a1), nv: Math.cos(pc.a1) })) {
          crease += HL.seg(P(curX, curY, curZ0), P(curX + R * Math.cos(pc.a1), curY + R * Math.sin(pc.a1), curZ0));
          crease += HL.seg(P(curX, curY, curZ0), P(curX, curY, curZ1));
          crease += HL.seg(P(curX + R * Math.cos(pc.a1), curY + R * Math.sin(pc.a1), curZ0), P(curX + R * Math.cos(pc.a1), curY + R * Math.sin(pc.a1), curZ1));
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

      // Pedagogical Readout based on actual slices taken vs remaining
      const inPanCount = 4 - takenCount;
      if (takenCount === 0) {
        read.textContent = "Bánh nguyên vẹn: 4/4 = 1 cái bánh (Click để bốc 1 miếng)";
      } else if (takenCount === 1) {
        read.textContent = "Bốc 1 miếng (1/4) ra đĩa: Trong khay còn 3/4 cái bánh";
      } else if (takenCount === 2) {
        read.textContent = "Bốc 2 miếng (2/4) ra đĩa: Trong khay còn đúng 1/2 cái bánh (một nửa)";
      } else if (takenCount === 3) {
        read.textContent = "Bốc 3 miếng (3/4) ra đĩa: Trong khay còn lại 1/4 cái bánh";
      } else {
        read.textContent = "Đã bốc hết 4/4 miếng: Khay bánh trống! (Click để làm bánh mới)";
      }
    }

    function toggleSlice() {
      // Cycle: 0 -> 1 -> 2 -> 3 -> 4 -> 0
      takenCount = (takenCount + 1) % 5;
      pieces.forEach(pc => {
        pc.sp.t = pc.idx < takenCount ? 1 : 0;
      });
      reg.wake();
    }

    function handleClick() {
      toggleSlice();
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
    stage.addEventListener("click", handleClick);
    bag.add(() => stage.removeEventListener("click", handleClick));
    bag.add(() => svg.replaceChildren());

    draw();
    return {
      set(v) {
        takenCount = Math.round(HL.clamp(v, 0, 4));
        pieces.forEach(pc => {
          pc.sp.t = pc.idx < takenCount ? 1 : 0;
        });
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
