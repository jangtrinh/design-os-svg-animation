/*
 * 1. Math Domino Addition Tiles (Thẻ Domino Số Học)
 * Authentic Grade 1 Pedagogical Manipulative: Place Value & Addition (10 + 3 = 13)
 * Two precision bone/wood Domino tiles with engraved pips & brass spinner studs on a wooden tray
 */

export default {
  id: "math-domino",
  title: "1. Thẻ Domino Số Học (Domino Addition Tiles)",
  concept: "Cộng số tròn chục & đơn vị (10 + 3 = 13)",
  means: "Hai quân cờ Domino tinh xảo trong khay gỗ: quân trái có 5 + 5 = 10 chấm tròn (1 chục), quân phải hiển thị các chấm đơn vị; di chuột để nghiêng lật quân cờ 3D chân thực.",
  rules: [1, 2, 4, 6, 9],
  range: [1, 3, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-55, -24, 0], [55, 24, 25]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Wooden Display Tray with Beveled Compartments
    const [trayO, trayI] = HL.rings(-52, -22, 52, 22, 4, 1.5);
    const traySol = HL.solid(svg);
    HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 3));

    // Two recessed carved pockets on the tray floor (Z = 2.6)
    const [p1O, p1I] = HL.rings(-40, -19, -12, 19, 3, 0.8);
    HL.put(HL.solid(svg), HL.prism(P, front, p1O, p1I, 2.5, 2.7));

    const [p2O, p2I] = HL.rings(12, -19, 40, 19, 3, 0.8);
    HL.put(HL.solid(svg), HL.prism(P, front, p2O, p2I, 2.5, 2.7));

    // Divider line between pockets
    HL.mk("line", {
      x1: P(0, -18, 3.1)[0], y1: P(0, -18, 3.1)[1],
      x2: P(0, 18, 3.1)[0], y2: P(0, 18, 3.1)[1],
      stroke: "#e0e0e4", "stroke-width": 1, "stroke-dasharray": "3 2"
    }, svg);

    // 2. Domino Tile 1 (Left: 10 Pips = 5 top + 5 bottom)
    const d1Sol = HL.solid(svg);
    const d1Lift = HL.spring(0, { k: 130, c: 14 });
    const d1Pitch = HL.spring(0, { k: 130, c: 14 });

    // 3. Domino Tile 2 (Right: Units = 1 to 5 pips)
    const d2Sol = HL.solid(svg);
    const d2Lift = HL.spring(0, { k: 130, c: 14 });
    const d2Pitch = HL.spring(0, { k: 130, c: 14 });

    // Central brass spinner pins
    const pin1 = HL.mk("circle", { r: 1.8, fill: "#232327" }, svg);
    const pin2 = HL.mk("circle", { r: 1.8, fill: "#232327" }, svg);

    // Divider grooves on tiles
    const div1 = HL.mk("line", { stroke: "#6f6f78", "stroke-width": 1.2 }, svg);
    const div2 = HL.mk("line", { stroke: "#6f6f78", "stroke-width": 1.2 }, svg);

    // Pips pool: 10 pips for Tile 1 + up to 5 pips for Tile 2 = 15 pips max
    // Helper to draw true 2:1 axonometric projected ellipse
    function makePip() {
      return HL.mk("polygon", { fill: "#232327", stroke: "none" }, svg);
    }

    const d1PipEls = Array.from({ length: 10 }, makePip);
    const d2PipEls = Array.from({ length: 5 }, makePip);

    function projectPip(cx, cy, z, r = 1.3) {
      // 8-point ellipse projected in 2:1 axonometry
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        pts.push(P(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z).join(","));
      }
      return pts.join(" ");
    }

    let unitCount = 3; // Default: 3 units (10 + 3 = 13)

    function draw() {
      // --- TILE 1 (Left: Tens = 10 pips) ---
      const z1 = 2.8 + d1Lift.x;
      const [t1O, t1I] = HL.rings(-38, -17, -14, 17, 2.5, 0.8);
      HL.put(d1Sol, HL.prism(P, front, t1O, t1I, z1, z1 + 5));

      const topZ1 = z1 + 5.1;
      const c1X = -26;

      // Brass spinner pin at center of Tile 1
      const pin1Scr = P(c1X, 0, topZ1);
      pin1.setAttribute("cx", pin1Scr[0]);
      pin1.setAttribute("cy", pin1Scr[1]);

      // Dividing groove line on Tile 1
      const g1Left = P(-37, 0, topZ1);
      const g1Right = P(-15, 0, topZ1);
      div1.setAttribute("x1", g1Left[0]); div1.setAttribute("y1", g1Left[1]);
      div1.setAttribute("x2", g1Right[0]); div1.setAttribute("y2", g1Right[1]);

      // 10 Pips layout on Tile 1: 5 pips on Top (y in [-15, -3]), 5 pips on Bottom (y in [3, 15])
      // Quincunx positions:
      const pips1Pos = [
        // Top half (5 pips)
        [c1X - 6, -12], [c1X + 6, -12],
        [c1X, -9],
        [c1X - 6, -6],  [c1X + 6, -6],
        // Bottom half (5 pips)
        [c1X - 6, 6],   [c1X + 6, 6],
        [c1X, 9],
        [c1X - 6, 12],  [c1X + 6, 12]
      ];

      pips1Pos.forEach((pos, i) => {
        d1PipEls[i].setAttribute("points", projectPip(pos[0], pos[1], topZ1, 1.4));
      });

      // --- TILE 2 (Right: Units = 1 to 5 pips) ---
      const z2 = 2.8 + d2Lift.x;
      const [t2O, t2I] = HL.rings(14, -17, 38, 17, 2.5, 0.8);
      HL.put(d2Sol, HL.prism(P, front, t2O, t2I, z2, z2 + 5));

      const topZ2 = z2 + 5.1;
      const c2X = 26;

      // Brass spinner pin at center of Tile 2
      const pin2Scr = P(c2X, 0, topZ2);
      pin2.setAttribute("cx", pin2Scr[0]);
      pin2.setAttribute("cy", pin2Scr[1]);

      // Dividing groove line on Tile 2
      const g2Left = P(15, 0, topZ2);
      const g2Right = P(37, 0, topZ2);
      div2.setAttribute("x1", g2Left[0]); div2.setAttribute("y1", g2Left[1]);
      div2.setAttribute("x2", g2Right[0]); div2.setAttribute("y2", g2Right[1]);

      // Units pips on Tile 2 (top half or centered)
      // Standard domino pip patterns for 1, 2, 3, 4, 5
      const unitPipsPatterns = {
        1: [[c2X, 0]],
        2: [[c2X - 5, -8], [c2X + 5, 8]],
        3: [[c2X - 5, -8], [c2X, 0], [c2X + 5, 8]],
        4: [[c2X - 5, -8], [c2X + 5, -8], [c2X - 5, 8], [c2X + 5, 8]],
        5: [[c2X - 5, -8], [c2X + 5, -8], [c2X, 0], [c2X - 5, 8], [c2X + 5, 8]]
      };

      const curPattern = unitPipsPatterns[unitCount] || unitPipsPatterns[3];
      d2PipEls.forEach((el, i) => {
        if (i < curPattern.length) {
          el.style.display = "";
          el.setAttribute("points", projectPip(curPattern[i][0], curPattern[i][1], topZ2, 1.4));
        } else {
          el.style.display = "none";
        }
      });

      const total = 10 + unitCount;
      read.textContent = "Domino: 10 chấm (5+5) + " + unitCount + " chấm = " + total + " (1 chục và " + unitCount + " đơn vị)";
    }

    function aim(pt) {
      if (!pt) {
        d1Lift.t = 0; d2Lift.t = 0;
        reg.wake();
        return;
      }
      const [u, v] = pt;
      const s1 = P(-26, 0, 5)[0];
      const s2 = P(26, 0, 5)[0];

      // Interactive hover tilt & lift
      d1Lift.t = Math.abs(u - s1) < 32 ? 3.5 : 0;
      d2Lift.t = Math.abs(u - s2) < 32 ? 3.5 : 0;

      // When hovering on right tile, adjust unit count based on Y position (1 to 5)
      if (Math.abs(u - s2) < 36) {
        const topY = P(26, -16, 5)[1];
        const botY = P(26, 16, 5)[1];
        const norm = HL.clamp((v - topY) / (botY - topY), 0, 1);
        unitCount = Math.min(5, Math.max(1, Math.round(1 + norm * 4)));
      }
      reg.wake();
    }

    function handleClick(pt) {
      unitCount = (unitCount % 5) + 1;
      d2Lift.x = 4.5;
      d2Lift.t = 0;
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(d1Lift, dt);
      const m2 = HL.stepS(d2Lift, dt);
      draw();
      return m1 || m2;
    });
    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: handleClick, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();
    return {
      set(v) {
        unitCount = Math.min(5, Math.max(1, Math.round(v)));
        draw();
      },
      destroy: bag.dispose
    };
  }
};
