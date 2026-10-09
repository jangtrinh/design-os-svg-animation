/*
 * 1. Math Domino Addition Tiles (Thẻ Domino Số Học)
 * Authentic Grade 1 Pedagogical Manipulative: Place Value & Addition (10 + 3 = 13)
 * Lucas Markes Hairline Standard:
 * - Turned hardwood presentation tray with recessed compartments & foot pads
 * - Ivory domino tiles with filleted corners (r=3.2, b=1.0) & perimeter face creases
 * - Turned brass spinner rivets with collar rings & center domes
 * - Sunken double-ring pips (recess rim + core)
 * - Single focal accent (hi) at rest on left spinner, transferring to active tile
 * - Pure 2:1 axonometric line art, zero SVG text
 */

export default {
  id: "math-domino",
  title: "1. Thẻ Domino Số Học (Domino Addition Tiles)",
  concept: "Cộng số tròn chục & đơn vị (10 + 3 = 13)",
  means: "Hai quân cờ Domino ngà tinh xảo trên khay gỗ: quân trái đại diện 1 chục (5+5), quân phải là các đơn vị (1..5); di chuột để nhấc quân cờ 3D mượt mà với chốt đồng tâm.",
  rules: [1, 2, 4, 6, 9],
  range: [1, 3, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-58, -26, 0], [58, 26, 26]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Turned Hardwood Presentation Tray (Z: 0 to 4)
    const [trayO, trayI] = HL.rings(-54, -24, 54, 24, 4.5, 1.4);
    const traySol = HL.solid(svg);
    HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 4));

    // Four corner foot pads under tray
    for (const [fx, fy] of [[-48, -19], [48, -19], [-48, 19], [48, 19]]) {
      const [fO] = HL.rings(fx - 3.2, fy - 3.2, fx + 3.2, fy + 3.2, 3.2, 0.5);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, fO, 0)) }, svg);
    }

    // Two recessed compartments on tray floor (Z: 2.2 to 4.0)
    for (const cx of [-26, 26]) {
      const [compO] = HL.rings(cx - 15, -20, cx + 15, 20, 3.5, 0.6);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, compO, 4.0)) }, svg);
      const [compFloor] = HL.rings(cx - 14.2, -19.2, cx + 14.2, 19.2, 3.0, 0.5);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, compFloor, 2.2)) }, svg);
    }

    // Center divider bead between compartments
    HL.mk("line", {
      x1: HL.r2(P(0, -22, 4.1)[0]), y1: HL.r2(P(0, -22, 4.1)[1]),
      x2: HL.r2(P(0, 22, 4.1)[0]), y2: HL.r2(P(0, 22, 4.1)[1]),
      class: "lo", "stroke-width": 1.2
    }, svg);

    // 2. Domino Tile 1 (Left: Tens = 5 + 5 pips)
    const d1Sol = HL.solid(svg);
    const d1Lift = HL.spring(0, { k: 130, c: 14 });

    // 3. Domino Tile 2 (Right: Units = 1 to 5 pips)
    const d2Sol = HL.solid(svg);
    const d2Lift = HL.spring(0, { k: 130, c: 14 });

    // Central Brass Spinner Rivets (collar ring + dome core)
    const spinner1Collar = HL.mk("ellipse", { rx: HL.r2(2.6 * C.S), ry: HL.r2(2.6 * C.S * C.k), class: "lo nf" }, svg);
    const spinner1Dot = HL.mk("ellipse", { rx: HL.r2(1.3 * C.S), ry: HL.r2(1.3 * C.S * C.k), fill: "#232327", class: "hi" }, svg);

    const spinner2Collar = HL.mk("ellipse", { rx: HL.r2(2.6 * C.S), ry: HL.r2(2.6 * C.S * C.k), class: "lo nf" }, svg);
    const spinner2Dot = HL.mk("ellipse", { rx: HL.r2(1.3 * C.S), ry: HL.r2(1.3 * C.S * C.k), fill: "#232327" }, svg);

    // Milled dividing channels on tiles (double lines)
    const div1A = HL.mk("line", { class: "lo", "stroke-width": 1.0 }, svg);
    const div1B = HL.mk("line", { class: "lo", "stroke-width": 1.0 }, svg);
    const div2A = HL.mk("line", { class: "lo", "stroke-width": 1.0 }, svg);
    const div2B = HL.mk("line", { class: "lo", "stroke-width": 1.0 }, svg);

    // Sunken Double-Ring Pips Pool:
    // Outer recess ring (.lo) + Inner filled core dot
    function makePip() {
      const ring = HL.mk("polygon", { fill: "#ffffff", stroke: "#6f6f78", "stroke-width": 0.8 }, svg);
      const dot = HL.mk("polygon", { fill: "#232327", stroke: "none" }, svg);
      return { ring, dot };
    }

    const d1Pips = Array.from({ length: 10 }, makePip);
    const d2Pips = Array.from({ length: 5 }, makePip);

    function projectPipPolygon(cx, cy, z, r) {
      const pts = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        pts.push(P(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z).map(HL.r2).join(","));
      }
      return pts.join(" ");
    }

    let unitCount = initialV != null ? Math.round(HL.clamp(initialV, 1, 5)) : 3;
    let active = false;

    function draw() {
      // --- TILE 1 (Left: Tens = 10 pips) ---
      const z1 = 2.4 + d1Lift.x;
      const [t1O, t1I] = HL.rings(-38, -17.5, -14, 17.5, 3.2, 0.9);
      HL.put(d1Sol, HL.prism(P, front, t1O, t1I, z1, z1 + 5.2));

      const topZ1 = z1 + 5.3;
      const c1X = -26;

      // Spinner rivet 1
      const p1Scr = P(c1X, 0, topZ1);
      spinner1Collar.setAttribute("cx", HL.r2(p1Scr[0]));
      spinner1Collar.setAttribute("cy", HL.r2(p1Scr[1]));
      spinner1Dot.setAttribute("cx", HL.r2(p1Scr[0]));
      spinner1Dot.setAttribute("cy", HL.r2(p1Scr[1]));

      // Double divider channel on Tile 1
      const g1L = P(-37, -0.6, topZ1); const g1R = P(-15, -0.6, topZ1);
      const g2L = P(-37, 0.6, topZ1);  const g2R = P(-15, 0.6, topZ1);
      div1A.setAttribute("x1", HL.r2(g1L[0])); div1A.setAttribute("y1", HL.r2(g1L[1]));
      div1A.setAttribute("x2", HL.r2(g1R[0])); div1A.setAttribute("y2", HL.r2(g1R[1]));
      div1B.setAttribute("x1", HL.r2(g2L[0])); div1B.setAttribute("y1", HL.r2(g2L[1]));
      div1B.setAttribute("x2", HL.r2(g2R[0])); div1B.setAttribute("y2", HL.r2(g2R[1]));

      // 10 Pips layout on Tile 1 (5 top, 5 bottom)
      const pips1Pos = [
        // Top 5 pips
        [c1X - 6.2, -12.5], [c1X + 6.2, -12.5],
        [c1X, -9.2],
        [c1X - 6.2, -5.9],  [c1X + 6.2, -5.9],
        // Bottom 5 pips
        [c1X - 6.2, 5.9],   [c1X + 6.2, 5.9],
        [c1X, 9.2],
        [c1X - 6.2, 12.5],  [c1X + 6.2, 12.5]
      ];

      pips1Pos.forEach((pos, i) => {
        d1Pips[i].ring.setAttribute("points", projectPipPolygon(pos[0], pos[1], topZ1, 1.8));
        d1Pips[i].dot.setAttribute("points", projectPipPolygon(pos[0], pos[1], topZ1, 1.2));
      });

      // --- TILE 2 (Right: Units = 1 to 5 pips) ---
      const z2 = 2.4 + d2Lift.x;
      const [t2O, t2I] = HL.rings(14, -17.5, 38, 17.5, 3.2, 0.9);
      HL.put(d2Sol, HL.prism(P, front, t2O, t2I, z2, z2 + 5.2));

      const topZ2 = z2 + 5.3;
      const c2X = 26;

      // Spinner rivet 2
      const p2Scr = P(c2X, 0, topZ2);
      spinner2Collar.setAttribute("cx", HL.r2(p2Scr[0]));
      spinner2Collar.setAttribute("cy", HL.r2(p2Scr[1]));
      spinner2Dot.setAttribute("cx", HL.r2(p2Scr[0]));
      spinner2Dot.setAttribute("cy", HL.r2(p2Scr[1]));

      // Double divider channel on Tile 2
      const h1L = P(15, -0.6, topZ2); const h1R = P(37, -0.6, topZ2);
      const h2L = P(15, 0.6, topZ2);  const h2R = P(37, 0.6, topZ2);
      div2A.setAttribute("x1", HL.r2(h1L[0])); div2A.setAttribute("y1", HL.r2(h1L[1]));
      div2A.setAttribute("x2", HL.r2(h1R[0])); div2A.setAttribute("y2", HL.r2(h1R[1]));
      div2B.setAttribute("x1", HL.r2(h2L[0])); div2B.setAttribute("y1", HL.r2(h2L[1]));
      div2B.setAttribute("x2", HL.r2(h2R[0])); div2B.setAttribute("y2", HL.r2(h2R[1]));

      // Standard domino pip patterns for 1, 2, 3, 4, 5
      const unitPipsPatterns = {
        1: [[c2X, -9.2]],
        2: [[c2X - 5.5, -12.5], [c2X + 5.5, -5.9]],
        3: [[c2X - 5.5, -12.5], [c2X, -9.2], [c2X + 5.5, -5.9]],
        4: [[c2X - 5.5, -12.5], [c2X + 5.5, -12.5], [c2X - 5.5, -5.9], [c2X + 5.5, -5.9]],
        5: [[c2X - 5.5, -12.5], [c2X + 5.5, -12.5], [c2X, -9.2], [c2X - 5.5, -5.9], [c2X + 5.5, -5.9]]
      };

      const curPattern = unitPipsPatterns[unitCount] || unitPipsPatterns[3];
      d2Pips.forEach((pip, i) => {
        if (i < curPattern.length) {
          pip.ring.style.display = "";
          pip.dot.style.display = "";
          pip.ring.setAttribute("points", projectPipPolygon(curPattern[i][0], curPattern[i][1], topZ2, 1.8));
          pip.dot.setAttribute("points", projectPipPolygon(curPattern[i][0], curPattern[i][1], topZ2, 1.2));
        } else {
          pip.ring.style.display = "none";
          pip.dot.style.display = "none";
        }
      });

      const total = 10 + unitCount;
      read.textContent = "Domino: 10 + " + unitCount + " = " + total;
    }

    function aim(pt) {
      if (!pt) {
        d1Lift.t = 0; d2Lift.t = 0;
        active = false;
        spinner1Dot.classList.toggle("hi", true);
        d1Sol.sil.classList.toggle("hi", false);
        d2Sol.sil.classList.toggle("hi", false);
        reg.wake();
        return;
      }
      const [u, v] = pt;
      const s1 = P(-26, 0, 5)[0];
      const s2 = P(26, 0, 5)[0];

      const h1 = Math.abs(u - s1) < 36;
      const h2 = Math.abs(u - s2) < 36;

      d1Lift.t = h1 ? 4.5 : 0;
      d2Lift.t = h2 ? 4.5 : 0;
      active = h1 || h2;

      spinner1Dot.classList.toggle("hi", !active);
      d1Sol.sil.classList.toggle("hi", h1);
      d2Sol.sil.classList.toggle("hi", h2);

      if (h2) {
        const topY = P(26, -18, 5)[1];
        const botY = P(26, 18, 5)[1];
        const norm = HL.clamp((v - topY) / (botY - topY), 0, 1);
        unitCount = Math.min(5, Math.max(1, Math.round(1 + norm * 4)));
      }
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(d1Lift, dt);
      const m2 = HL.stepS(d2Lift, dt);
      draw();
      return m1 || m2;
    });
    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
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
