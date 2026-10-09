/*
 * 10 Grade 1 Math Figures Definitions (Hairline 2:1 Axonometric Standard)
 * Modularized Architecture - Auto-bundled
 */

if (typeof HL !== "undefined" && HL.inject) {
  HL.inject(document);
}

const MATH_FIGURES = [
/*
 * 1. Math Domino Addition Tiles (Thẻ Domino Số Học)
 * Authentic Grade 1 Pedagogical Manipulative: Place Value & Addition (10 + 3 = 13)
 * Two precision bone/wood Domino tiles with engraved pips & brass spinner studs on a wooden tray
 */

{
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
},
/*
 * 2. Math Balance Scale (Cân Thăng Bằng Số Học)
 * Pure Hairline 2:1 Axonometric Line Art
 * Smooth pointer tilt response with harmonic damping spring physics
 * Zero SVG text - clean visual line art
 */

{
  id: "math-balance",
  title: "2. Cân Thăng Bằng (Balance Scale)",
  concept: "So sánh lớn hơn, bé hơn, bằng nhau",
  means: "Cân thăng bằng: dầm cân nghiêng tự nhiên theo vị trí con trỏ; khi thả chuột, dầm cân dao động lò xo tắt dần rồi trở về vị trí cân bằng ngang 0°.",
  rules: [1, 3, 4, 6, 7],
  range: [-1, 0, 1],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-55, -20, 0], [55, 20, 58]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Base Pedestal (Z: 0 to 6)
    const [baseO, baseI] = HL.rings(-24, -18, 24, 18, 4, 2);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 6));

    // 2. Vertical Mast Post (Z: 6 to 40)
    const [mastO, mastI] = HL.rings(-4, -4, 4, 4, 4, 0.8);
    const mastSol = HL.solid(svg);
    HL.put(mastSol, HL.prism(P, front, mastO, mastI, 6, 40));

    // 3. Central Fulcrum Bracket & Axle Pin (Z: 39 to 42)
    const fulcrumSol = HL.solid(svg);
    const [fO, fI] = HL.rings(-5, -3, 5, 3, 2, 0.6);
    HL.put(fulcrumSol, HL.prism(P, front, fO, fI, 39, 42));

    // 4. Trays & Suspensions
    const leftTraySol = HL.solid(svg);
    const rightTraySol = HL.solid(svg);

    const leftRim = HL.mk("ellipse", { rx: HL.r2(11 * C.S), ry: HL.r2(11 * C.S * C.k), class: "lo nf" }, svg);
    const rightRim = HL.mk("ellipse", { rx: HL.r2(11 * C.S), ry: HL.r2(11 * C.S * C.k), class: "lo nf" }, svg);

    // 6 Weights total: 3 on left pan, 3 on right pan
    const weightSols = Array.from({ length: 6 }, () => HL.solid(svg));
    const weightKnobs = Array.from({ length: 6 }, () => HL.mk("circle", { r: 1.5, fill: "#232327" }, svg));

    // Dynamic Beam Solid & Cords
    const beamSol = HL.solid(svg);
    const cords = HL.mk("path", { class: "lo", "stroke-width": 1.1 }, svg);

    // Harmonic spring for beam tilt angle (in radians)
    const tiltSpring = HL.spring(0, { k: 110, c: 12 });

    const beamLen = 38;
    const fulcrumZ = 40.5;
    const cordLen = 22;

    function renderWeightPrism(sol, knobEl, wx, wy, wz) {
      const [wO, wI] = HL.rings(wx - 3.2, wy - 3.2, wx + 3.2, wy + 3.2, 3.2, 0.5);
      HL.put(sol, HL.prism(P, front, wO, wI, wz, wz + 4.5));
      const knobScr = P(wx, wy, wz + 5.5);
      knobEl.setAttribute("cx", HL.r2(knobScr[0]));
      knobEl.setAttribute("cy", HL.r2(knobScr[1]));
    }

    function draw() {
      const theta = tiltSpring.x;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      // Beam ends: (+X right, -X left)
      const xR = beamLen * cosT;
      const zR = fulcrumZ + beamLen * sinT;
      const xL = -beamLen * cosT;
      const zL = fulcrumZ - beamLen * sinT;

      // 1. Draw Beam
      const [bO, bI] = HL.rings(-beamLen, -1.8, beamLen, 1.8, 1.8, 0.5);
      const beamPtsUpper = bO.map(q => {
        const rotX = q.u * cosT - 0.9 * sinT;
        const rotZ = fulcrumZ + q.u * sinT + 0.9 * cosT;
        return P(rotX, q.v, rotZ);
      });
      const beamPtsLower = bO.map(q => {
        const rotX = q.u * cosT - (-0.9) * sinT;
        const rotZ = fulcrumZ + q.u * sinT + (-0.9) * cosT;
        return P(rotX, q.v, rotZ);
      });
      const beamHull = HL.hull([...beamPtsUpper, ...beamPtsLower]);
      HL.put(beamSol, { sil: HL.poly(beamHull), crease: HL.poly(beamPtsUpper) });

      // 2. Pans hang plumb down
      const panRadius = 11;
      const trayH = 1.6;

      // Left Pan: hangs from (xL, 0, zL)
      const trayLZ = zL - cordLen;
      const [lO, lI] = HL.rings(xL - panRadius, -panRadius, xL + panRadius, panRadius, panRadius, 0.8);
      HL.put(leftTraySol, HL.prism(P, front, lO, lI, trayLZ, trayLZ + trayH));
      const lRimScr = P(xL, 0, trayLZ + trayH + 0.1);
      leftRim.setAttribute("cx", HL.r2(lRimScr[0]));
      leftRim.setAttribute("cy", HL.r2(lRimScr[1]));

      // Right Pan: hangs from (xR, 0, zR)
      const trayRZ = zR - cordLen;
      const [rO, rI] = HL.rings(xR - panRadius, -panRadius, xR + panRadius, panRadius, panRadius, 0.8);
      HL.put(rightTraySol, HL.prism(P, front, rO, rI, trayRZ, trayRZ + trayH));
      const rRimScr = P(xR, 0, trayRZ + trayH + 0.1);
      rightRim.setAttribute("cx", HL.r2(rRimScr[0]));
      rightRim.setAttribute("cy", HL.r2(rRimScr[1]));

      // 3. Three suspension cords per tray
      let cordD = "";
      const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

      // Left cords
      angles.forEach(a => {
        const px = xL + panRadius * 0.88 * Math.cos(a);
        const py = panRadius * 0.88 * Math.sin(a);
        cordD += HL.seg(P(xL, 0, zL), P(px, py, trayLZ + trayH));
      });

      // Right cords
      angles.forEach(a => {
        const px = xR + panRadius * 0.88 * Math.cos(a);
        const py = panRadius * 0.88 * Math.sin(a);
        cordD += HL.seg(P(xR, 0, zR), P(px, py, trayRZ + trayH));
      });
      cords.setAttribute("d", cordD);

      // 4. Weights: 3 weights on left pan, 3 weights on right pan
      const wOffsets = [
        [-3.8, -2.4],
        [ 3.8, -2.4],
        [   0,  4.2]
      ];

      // Left pan weights
      wOffsets.forEach(([ox, oy], idx) => {
        renderWeightPrism(weightSols[idx], weightKnobs[idx], xL + ox, oy, trayLZ + trayH);
      });

      // Right pan weights
      wOffsets.forEach(([ox, oy], idx) => {
        renderWeightPrism(weightSols[3 + idx], weightKnobs[3 + idx], xR + ox, oy, trayRZ + trayH);
      });

      // Readout
      const deg = (theta * 180) / Math.PI;
      if (Math.abs(deg) < 1.2) {
        read.textContent = "Cân thăng bằng: Hai bên bằng nhau (3 = 3)";
      } else if (deg < 0) {
        read.textContent = "Bên trái nặng hơn: Nghiêng trái";
      } else {
        read.textContent = "Bên phải nặng hơn: Nghiêng phải";
      }
    }

    function aim(pt) {
      if (!pt) {
        tiltSpring.t = 0;
        reg.wake();
        return;
      }
      const midScr = P(0, 0, fulcrumZ)[0];
      const norm = HL.clamp((pt[0] - midScr) / 100, -1, 1);
      // Continuous smooth tilt response: pointer left -> tilt left (-), pointer right -> tilt right (+)
      tiltSpring.t = norm * HL.rad(10);
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(tiltSpring, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => {
        tiltSpring.t = 0;
        reg.wake();
      }
    }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        tiltSpring.t = HL.clamp(v, -1, 1) * HL.rad(10);
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
},
{
  id: "math-ten-frame",
  title: "3. Khung 10 Ô (Ten Frame Counter)",
  concept: "Cấu trúc số 10 cơ số mười & Bổ số 10",
  means: "Khung 10 ô đếm số: khay gỗ 2 hàng 5 cột. Click vào ô để đặt hoặc bốc đồng xu; hiệu ứng thả rơi nảy chạm đáy hốc, hiển thị phép cộng bổ số 10 (vd: 7 + 3 = 10).",
  rules: [1, 2, 4, 7, 10],
  range: [0, 7, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-55, -24, 0], [55, 24, 30]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Frame Tray (Wooden tray: z = 0 to 4.0)
    const [trayO, trayI] = HL.rings(-52, -22, 52, 22, 3, 1.5);
    const traySol = HL.solid(svg);
    HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 4.0));

    // 10 Recessed Cavities / Pockets (2 rows, 5 columns)
    // Cavity floor is at z = 1.6 (recessed 2.4 units into tray)
    for (let r = 0; r < 2; r++) {
      const cy = r === 0 ? 10 : -10;
      for (let c = 0; c < 5; c++) {
        const cx = -40 + c * 20;

        // Top opening of cavity at z = 4.0
        const [lipO] = HL.rings(cx - 8.5, cy - 8.5, cx + 8.5, cy + 8.5, 2.5, 0.5);
        HL.mk("path", {
          class: "lo",
          d: HL.poly(HL.ringAt(P, lipO, 4.0))
        }, svg);

        // Floor of cavity at z = 1.6
        const [floorO] = HL.rings(cx - 8.0, cy - 8.0, cx + 8.0, cy + 8.0, 2.0, 0.5);
        HL.mk("path", {
          class: "nf lo",
          d: HL.poly(HL.ringAt(P, floorO, 1.6))
        }, svg);

        // Subtle 3D recessed wall drop edge at far corner
        const wallDrop = HL.seg(P(cx - 8.0, cy + 8.0, 4.0), P(cx - 8.0, cy + 8.0, 1.6));
        HL.mk("path", { class: "lo", d: wallDrop }, svg);
      }
    }

    // 10 Token Slots
    const tokens = [];
    let count = initialV != null ? Math.round(initialV) : 7;
    let slotIdx = 0;

    for (let r = 0; r < 2; r++) {
      const cy = r === 0 ? 10 : -10;
      for (let c = 0; c < 5; c++) {
        const cx = -40 + c * 20;
        const active = slotIdx < count;

        // Dashed circle on cavity floor (shown when empty)
        const emptyPts = [];
        for (let k = 0; k <= 32; k++) {
          const a = (k / 32) * Math.PI * 2;
          emptyPts.push(P(cx + 5.5 * Math.cos(a), cy + 5.5 * Math.sin(a), 1.6));
        }
        const emptyEl = HL.mk("path", {
          class: "nf lo dash",
          d: HL.poly(emptyPts)
        }, svg);

        // Contact shadow element on cavity floor for dropping/lifted token
        const shadowEl = HL.mk("path", {
          class: "nf lo dash",
          d: ""
        }, svg);

        // Drop line connecting token to floor during drop
        const dropLineEl = HL.mk("path", {
          class: "nf lo dash",
          d: ""
        }, svg);

        // Token solid
        const sol = HL.solid(svg);

        // Token spring: drop elevation in Z (starts at 0 if active, 16 if inactive)
        const dropSp = HL.spring(0, { k: 220, c: 16 });

        tokens.push({
          idx: slotIdx,
          cx,
          cy,
          active,
          dropSp,
          sol,
          emptyEl,
          shadowEl,
          dropLineEl
        });

        slotIdx++;
      }
    }

    function applyCount(newCount) {
      count = HL.clamp(newCount, 0, 10);
      tokens.forEach((tok, i) => {
        const wasActive = tok.active;
        const willBeActive = i < count;
        tok.active = willBeActive;
        if (willBeActive && !wasActive) {
          // Trigger drop animation from above
          tok.dropSp.x = 14;
          tok.dropSp.t = 0;
        } else if (!willBeActive && wasActive) {
          // Lift up and vanish
          tok.dropSp.t = 16;
        } else if (willBeActive) {
          tok.dropSp.t = 0;
        }
      });
      reg.wake();
    }

    function draw() {
      tokens.forEach(tok => {
        const dropZ = tok.dropSp.x;

        if (tok.active || dropZ < 15.5) {
          tok.emptyEl.style.display = "none";

          const z = 1.6 + Math.max(0, dropZ);

          // Token cylinder solid
          const [cO, cI] = HL.rings(tok.cx - 5.8, tok.cy - 5.8, tok.cx + 5.8, tok.cy + 5.8, 5.8, 0.7);
          HL.put(tok.sol, HL.prism(P, front, cO, cI, z, z + 2.5));

          // Contact shadow on the cavity floor at z = 1.6
          if (dropZ > 0.4) {
            tok.shadowEl.style.display = "";
            const shadowPts = [];
            const shadowScale = HL.clamp(1 - dropZ * 0.03, 0.5, 1);
            for (let k = 0; k <= 24; k++) {
              const a = (k / 24) * Math.PI * 2;
              shadowPts.push(P(tok.cx + 5.6 * shadowScale * Math.cos(a), tok.cy + 5.6 * shadowScale * Math.sin(a), 1.6));
            }
            tok.shadowEl.setAttribute("d", HL.poly(shadowPts));

            if (dropZ > 2.0) {
              tok.dropLineEl.style.display = "";
              tok.dropLineEl.setAttribute("d", HL.seg(P(tok.cx, tok.cy, z), P(tok.cx, tok.cy, 1.6)));
            } else {
              tok.dropLineEl.style.display = "none";
            }
          } else {
            tok.shadowEl.style.display = "none";
            tok.dropLineEl.style.display = "none";
          }
        } else {
          // Empty slot: show dashed circle on floor
          tok.emptyEl.style.display = "";
          tok.shadowEl.style.display = "none";
          tok.dropLineEl.style.display = "none";
          HL.put(tok.sol, { sil: "", crease: "" });
        }
      });

      const activeCount = count;
      const topCount = Math.min(5, activeCount);
      const botCount = Math.max(0, activeCount - 5);
      const emptyCount = 10 - activeCount;

      if (activeCount === 10) {
        read.textContent = "Khung đầy 10 ô: 5 + 5 = 10 (Trọn vẹn cơ số mười!)";
      } else if (activeCount === 0) {
        read.textContent = "Khung trống: 0 đồng xu · Cần 10 đồng xu để đầy 10!";
      } else {
        read.textContent = `${activeCount} đồng xu = ${topCount} (hàng trên) + ${botCount} (hàng dưới) · Còn thiếu ${emptyCount} để đủ 10! (${activeCount} + ${emptyCount} = 10)`;
      }
    }

    function aim(pt) {
      if (!pt) {
        applyCount(7);
        return;
      }
      const pLeft = P(-40, 0, 3)[0];
      const pRight = P(40, 0, 3)[0];
      const norm = HL.clamp((pt[0] - pLeft) / (pRight - pLeft), 0, 1);
      const targetCount = Math.round(norm * 10);
      applyCount(targetCount);
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      tokens.forEach(t => {
        if (HL.stepS(t.dropSp, dt)) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(
      HL.pointer(stage, {
        move: aim,
        leave: () => applyCount(7)
      })
    );
    bag.add(() => svg.replaceChildren());

    // Initial render
    draw();

    return {
      set(v) {
        applyCount(Math.round(v));
      },
      destroy: bag.dispose
    };
  }
},
{
  id: "math-number-blocks",
  title: "4. Tháp Khối Số Học (Unifix Number Blocks)",
  concept: "Phép cộng & bảo toàn số lượng khi ghép khối",
  means: "Tháp khối lập phương Unifix: hai tháp 3 khối và 2 khối. Click để bốc khối từ tháp này cắm sang tháp kia; chốt tròn cắm khít lỗ âm với đàn hồi snap-back, chứng minh 3 + 2 = 5.",
  rules: [1, 2, 3, 7, 9],
  range: [0, 2, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -18, 0], [50, 18, 76]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Base Board (z = 0 to 3)
    const [baseO, baseI] = HL.rings(-48, -16, 48, 16, 3, 1.5);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 3));

    // Base mounting studs on board at x = -20 and x = 20
    const [studAO, studAI] = HL.rings(-23.5, -3.5, -16.5, 3.5, 3.5, 0.6);
    const [studBO, studBI] = HL.rings( 16.5, -3.5,  23.5, 3.5, 3.5, 0.6);
    const baseStudASol = HL.solid(svg);
    const baseStudBSol = HL.solid(svg);
    HL.put(baseStudASol, HL.prism(P, front, studAO, studAI, 3, 5.5));
    HL.put(baseStudBSol, HL.prism(P, front, studBO, studBI, 3, 5.5));

    const blockH = 12; // Height of each unit block
    const TOTAL_BLOCKS = 5;

    // State: count on Tower A (starts at 3, Tower B has 5 - countA = 2)
    let countA = initialV != null ? HL.clamp(Math.round(initialV), 0, TOTAL_BLOCKS) : 3;

    // 5 physical blocks total.
    // Blocks 0, 1, 2 belong initially to Tower A.
    // Blocks 3, 4 belong initially to Tower B.
    // Each block has spring (x, y, z) position
    const blocks = [];
    for (let i = 0; i < TOTAL_BLOCKS; i++) {
      const isInitialA = i < 3;
      const targetTower = isInitialA ? -20 : 20;
      const targetStackIdx = isInitialA ? i : (i - 3);
      const targetZ = 3 + targetStackIdx * blockH;

      const blockSol = HL.solid(svg);
      const studSol = HL.solid(svg);

      // Dash socket rim when airborne
      const socketRimEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);

      blocks.push({
        idx: i,
        // Springs for smooth flight in X and Z
        spX: HL.spring(targetTower, { k: 180, c: 16 }),
        spZ: HL.spring(targetZ, { k: 220, c: 17 }),
        blockSol,
        studSol,
        socketRimEl
      });
    }

    function syncTargets() {
      // Tower A gets blocks 0 .. countA - 1
      for (let i = 0; i < countA; i++) {
        const b = blocks[i];
        b.spX.t = -20;
        b.spZ.t = 3 + i * blockH;
      }
      // Tower B gets blocks countA .. TOTAL_BLOCKS - 1
      let stackB = 0;
      for (let i = countA; i < TOTAL_BLOCKS; i++) {
        const b = blocks[i];
        b.spX.t = 20;
        b.spZ.t = 3 + stackB * blockH;
        stackB++;
      }
      reg.wake();
    }

    function draw() {
      blocks.forEach(b => {
        const curX = b.spX.x;
        const curZ = b.spZ.x;

        // Block cube prism (17 x 17 footprint, height 12)
        const [bO, bI] = HL.rings(curX - 8.5, -8.5, curX + 8.5, 8.5, 2, 1);
        HL.put(b.blockSol, HL.prism(P, front, bO, bI, curZ, curZ + blockH));

        // Interlocking stud on top face
        const [sO, sI] = HL.rings(curX - 3.5, -3.5, curX + 3.5, 3.5, 3.5, 0.6);
        HL.put(b.studSol, HL.prism(P, front, sO, sI, curZ + blockH, curZ + blockH + 2.5));

        // Socket dashed rim at bottom if airborne
        const isAirborne = Math.abs(curX - (-20)) > 2 && Math.abs(curX - 20) > 2;
        if (isAirborne) {
          const rimPts = [];
          for (let k = 0; k <= 24; k++) {
            const a = (k / 24) * Math.PI * 2;
            rimPts.push(P(curX + 3.6 * Math.cos(a), 3.6 * Math.sin(a), curZ));
          }
          b.socketRimEl.style.display = "";
          b.socketRimEl.setAttribute("d", HL.poly(rimPts));
        } else {
          b.socketRimEl.style.display = "none";
        }
      });

      const countB = TOTAL_BLOCKS - countA;
      if (countA === 5) {
        read.textContent = `Đã ghép trọn vẹn: Tháp A có 5 khối (3 + 2 = 5) · Tháp B trống!`;
      } else if (countA === 0) {
        read.textContent = `Chuyển hết sang tháp B: 0 + 5 = 5 khối · Tháp A trống!`;
      } else {
        read.textContent = `Phép cộng ghép khối: ${countA} khối (Tháp A) + ${countB} khối (Tháp B) = 5 khối (Bảo toàn tổng số)`;
      }
    }

    function aim(pt) {
      if (!pt) {
        countA = 3;
        syncTargets();
        return;
      }
      const pLeft = P(-20, 0, 10)[0];
      const pRight = P(20, 0, 10)[0];
      const norm = HL.clamp((pt[0] - pLeft) / (pRight - pLeft), 0, 1);
      // norm 0: countA = 1, norm 1: countA = 5
      countA = HL.clamp(Math.round(1 + norm * 4), 1, 5);
      syncTargets();
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      blocks.forEach(b => {
        const mx = HL.stepS(b.spX, dt);
        const mz = HL.stepS(b.spZ, dt);
        if (mx || mz) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => {
        countA = 3;
        syncTargets();
      }
    }));
    bag.add(() => svg.replaceChildren());

    // Initial positioning
    syncTargets();
    draw();

    return {
      set(v) {
        countA = HL.clamp(Math.round(v), 0, TOTAL_BLOCKS);
        syncTargets();
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 5. Number Line (Trục Số Nhảy Ếch)
 * Pure Hairline 2:1 Axonometric Line Art
 * Smooth continuous hopping along parabolic arcs
 * Zero SVG text - clean visual line art
 */

{
  id: "math-number-line",
  title: "5. Trục Số Nhảy Ếch (Number Line Jumps)",
  concept: "Cộng nhẩm bằng bước nhảy trục số (0 + 4 = 4; 4 + 3 = 7)",
  means: "Thước đo trục số chia vạch: di chuyển con trỏ để chú ếch origami bật nhảy theo các cung parabol mượt mà dọc theo các vạch số.",
  rules: [1, 3, 5, 7, 8],
  range: [0, 4, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-58, -14, 0], [58, 14, 40]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Ruler Body (z = 0 to 4.0)
    const [rO, rI] = HL.rings(-54, -8, 54, 8, 2, 1);
    const rulerSol = HL.solid(svg);
    HL.put(rulerSol, HL.prism(P, front, rO, rI, 0, 4.0));

    // Ticks on ruler surface
    const ticks = [];
    for (let i = 0; i <= 10; i++) {
      const x = -48 + i * 9.6;
      ticks.push(x);

      // Major ticks at 0, 5, 10; minor ticks at others
      const isMajor = i % 5 === 0;
      const isKey = i === 4 || i === 7;
      const yStart = isMajor ? -6.5 : (isKey ? -5.5 : -4.5);

      HL.mk("line", {
        x1: P(x, yStart, 4.0)[0], y1: P(x, yStart, 4.0)[1],
        x2: P(x, 1.0, 4.0)[0], y2: P(x, 1.0, 4.0)[1],
        stroke: "#232327",
        "stroke-width": (isMajor || isKey ? 1.4 : 1.0)
      }, svg);
    }

    // Parabolic Jump Arc 1: 0 -> 4
    const arc1Pts = [];
    for (let s = 0; s <= 24; s++) {
      const t = s / 24;
      const x = HL.lerp(ticks[0], ticks[4], t);
      const z = 4.0 + 4 * 18 * t * (1 - t);
      arc1Pts.push(P(x, 0, z));
    }
    const arc1Path = HL.mk("path", {
      d: HL.open(arc1Pts),
      stroke: "#6f6f78",
      "stroke-dasharray": "3 2",
      fill: "none",
      "stroke-width": 1.2
    }, svg);

    // Parabolic Jump Arc 2: 4 -> 7
    const arc2Pts = [];
    for (let s = 0; s <= 24; s++) {
      const t = s / 24;
      const x = HL.lerp(ticks[4], ticks[7], t);
      const z = 4.0 + 4 * 14 * t * (1 - t);
      arc2Pts.push(P(x, 0, z));
    }
    const arc2Path = HL.mk("path", {
      d: HL.open(arc2Pts),
      stroke: "#6f6f78",
      "stroke-dasharray": "3 2",
      fill: "none",
      "stroke-width": 1.2
    }, svg);

    // Origami Frog 3D Mesh
    const frogGroup = HL.mk("g", { id: "origami-frog" }, svg);
    const faceEls = [];
    for (let i = 0; i < 7; i++) {
      const poly = HL.mk("polygon", {
        fill: i < 2 ? "#e0e0e4" : "#ffffff",
        stroke: "#232327",
        "stroke-width": 1.1,
        "stroke-linejoin": "round"
      }, frogGroup);
      faceEls.push(poly);
    }

    // Frog Eyes
    const eyeDots = [
      HL.mk("circle", { r: 1.2, fill: "#232327" }, frogGroup),
      HL.mk("circle", { r: 1.2, fill: "#232327" }, frogGroup)
    ];

    // Contact shadow & drop line
    const shadowEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
    const dropLineEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);

    // Continuous parameter along the route: 0 -> 0.57 (arc 1) -> 1.0 (arc 2)
    const initT = initialV != null ? HL.clamp(initialV / 7, 0, 1) : 0.57;
    const jumpProgress = HL.spring(initT, { k: 120, c: 13 });

    function draw() {
      const t = HL.clamp(jumpProgress.x, 0, 1);
      let x, z, pitch;

      if (t <= 0.57) {
        // Arc 1: 0 -> 4 (+4 jump)
        const u = t / 0.57;
        x = HL.lerp(ticks[0], ticks[4], u);
        z = 4.0 + 4 * 18 * u * (1 - u);
        const slope = (4 * 18 * (1 - 2 * u)) / (ticks[4] - ticks[0]);
        pitch = Math.atan(slope) * 0.45;
      } else {
        // Arc 2: 4 -> 7 (+3 jump)
        const u = (t - 0.57) / 0.43;
        x = HL.lerp(ticks[4], ticks[7], u);
        z = 4.0 + 4 * 14 * u * (1 - u);
        const slope = (4 * 14 * (1 - 2 * u)) / (ticks[7] - ticks[4]);
        pitch = Math.atan(slope) * 0.45;
      }

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      function V(lx, ly, lz) {
        const rotX = lx * cosP - lz * sinP;
        const rotZ = lx * sinP + lz * cosP;
        return P(x + rotX, ly, z + rotZ);
      }

      const snout = V(7.0, 0, 1.6);
      const eyeL = V(3.2, -3.4, 4.6);
      const eyeR = V(3.2, 3.4, 4.6);
      const crown = V(3.8, 0, 4.2);
      const spine = V(-1.0, 0, 5.6);
      const tail = V(-6.2, 0, 1.4);
      const flankL = V(-1.0, -5.6, 2.0);
      const flankR = V(-1.0, 5.6, 2.0);
      const kneeL = V(-3.8, -6.6, 3.4);
      const kneeR = V(-3.8, 6.6, 3.4);
      const footL = V(-6.6, -7.0, 0);
      const footR = V(-6.6, 7.0, 0);

      const faces = [
        [flankL, kneeL, footL],
        [flankR, kneeR, footR],
        [spine, flankL, tail],
        [spine, tail, flankR],
        [crown, eyeL, flankL, spine],
        [crown, spine, flankR, eyeR],
        [snout, eyeR, crown, eyeL]
      ];

      faces.forEach((pts, i) => {
        const pointsStr = pts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" ");
        faceEls[i].setAttribute("points", pointsStr);
      });

      eyeDots[0].setAttribute("cx", HL.r2(eyeL[0]));
      eyeDots[0].setAttribute("cy", HL.r2(eyeL[1]));
      eyeDots[1].setAttribute("cx", HL.r2(eyeR[0]));
      eyeDots[1].setAttribute("cy", HL.r2(eyeR[1]));

      // Shadow on ruler
      const shadowPts = [];
      const sScale = HL.clamp(1 - (z - 4) * 0.03, 0.4, 1);
      for (let k = 0; k <= 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        shadowPts.push(P(x + 5.5 * sScale * Math.cos(a), 3.8 * sScale * Math.sin(a), 4.0));
      }
      shadowEl.setAttribute("d", HL.poly(shadowPts));

      if (z > 5.5) {
        dropLineEl.style.display = "";
        dropLineEl.setAttribute("d", HL.seg(P(x, 0, z), P(x, 0, 4.0)));
      } else {
        dropLineEl.style.display = "none";
      }

      const curVal = Math.round(t <= 0.57 ? (t / 0.57) * 4 : 4 + ((t - 0.57) / 0.43) * 3);
      read.textContent = "Bước nhảy ếch: 0 + 4 = 4; 4 + 3 = 7 (Vị trí: " + curVal + ")";
    }

    function aim(pt) {
      if (!pt) {
        jumpProgress.t = 0.57; // Rest at 4
        reg.wake();
        return;
      }
      const scr0 = P(ticks[0], 0, 4.0)[0];
      const scr7 = P(ticks[7], 0, 4.0)[0];
      const t = HL.clamp((pt[0] - scr0) / (scr7 - scr0), 0, 1);
      jumpProgress.t = t;
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(jumpProgress, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => {
        jumpProgress.t = 0.57;
        reg.wake();
      }
    }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        jumpProgress.t = HL.clamp(v / 7, 0, 1);
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
},
{
  id: "math-dice",
  title: "6. Cặp Xúc Xắc (Math Dice Pips)",
  concept: "Phép cộng & tung xúc xắc trực quan",
  means: "Hai khối xúc xắc trên thảm nỉ. Click để tung xúc xắc nảy xoay 3D và rơi ngẫu nhiên các cặp phép cộng lớp 1 (3+4=7, 2+5=7, 5+5=10, 4+2=6).",
  rules: [1, 2, 4, 6, 9],
  range: [0, 0, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-48, -22, 0], [48, 22, 42]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Felt Gaming Mat Base
    const [matO, matI] = HL.rings(-44, -18, 44, 18, 4, 1.5);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2));

    // Dice Groups
    const d1Group = HL.mk("g", { id: "die-1" }, svg);
    const d2Group = HL.mk("g", { id: "die-2" }, svg);

    // Faces for Die 1
    const d1FaceX = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d1Group);
    const d1FaceY = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d1Group);
    const d1FaceZ = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d1Group);

    // Faces for Die 2
    const d2FaceX = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d2Group);
    const d2FaceY = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d2Group);
    const d2FaceZ = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d2Group);

    // Dynamic Pip Holders (up to 21 pips per die)
    const d1Pips = [];
    for (let i = 0; i < 21; i++) {
      d1Pips.push(HL.mk("path", { style: "fill: #232327; stroke: none;" }, d1Group));
    }
    const d2Pips = [];
    for (let i = 0; i < 21; i++) {
      d2Pips.push(HL.mk("path", { style: "fill: #232327; stroke: none;" }, d2Group));
    }

    // 3D Springs for toss and bounce
    const wobbleX1 = HL.spring(0, { k: 140, c: 14 });
    const wobbleY1 = HL.spring(0, { k: 140, c: 14 });
    const lift1 = HL.spring(0, { k: 160, c: 13 });

    const wobbleX2 = HL.spring(0, { k: 140, c: 14 });
    const wobbleY2 = HL.spring(0, { k: 140, c: 14 });
    const lift2 = HL.spring(0, { k: 160, c: 13 });

    // Presets of educational Grade 1 dice rolls
    const ROLLS = [
      { val1: 3, val2: 4, label: "3 + 4 = 7" },
      { val1: 2, val2: 5, label: "2 + 5 = 7" },
      { val1: 5, val2: 5, label: "5 + 5 = 10 (Đôi năm tròn mười!)" },
      { val1: 4, val2: 2, label: "4 + 2 = 6" },
      { val1: 1, val2: 6, label: "1 + 6 = 7" },
      { val1: 6, val2: 3, label: "6 + 3 = 9" }
    ];

    let rollIdx = initialV != null ? HL.clamp(Math.round(initialV), 0, ROLLS.length - 1) : 0;

    // Standard Pip Positions on a 20x20 face
    const d = 5.2;
    const rStandard = 1.55;
    const rCenter = 1.75;

    function buildPipsForFace(axis, val) {
      const pips = [];
      if (val === 1) {
        pips.push({ axis, u: 0, v: 0, r: rCenter });
      } else if (val === 2) {
        pips.push({ axis, u: -d, v: -d, r: rStandard });
        pips.push({ axis, u:  d, v:  d, r: rStandard });
      } else if (val === 3) {
        pips.push({ axis, u: -d, v: -d, r: rStandard });
        pips.push({ axis, u:  0, v:  0, r: rCenter });
        pips.push({ axis, u:  d, v:  d, r: rStandard });
      } else if (val === 4) {
        pips.push({ axis, u: -d, v: -d, r: rStandard });
        pips.push({ axis, u:  d, v: -d, r: rStandard });
        pips.push({ axis, u: -d, v:  d, r: rStandard });
        pips.push({ axis, u:  d, v:  d, r: rStandard });
      } else if (val === 5) {
        pips.push({ axis, u: -d, v: -d, r: rStandard });
        pips.push({ axis, u:  d, v: -d, r: rStandard });
        pips.push({ axis, u:  0, v:  0, r: rCenter });
        pips.push({ axis, u: -d, v:  d, r: rStandard });
        pips.push({ axis, u:  d, v:  d, r: rStandard });
      } else if (val === 6) {
        pips.push({ axis, u: -d, v: -d, r: rStandard });
        pips.push({ axis, u:  d, v: -d, r: rStandard });
        pips.push({ axis, u: -d, v:  0, r: rStandard });
        pips.push({ axis, u:  d, v:  0, r: rStandard });
        pips.push({ axis, u: -d, v:  d, r: rStandard });
        pips.push({ axis, u:  d, v:  d, r: rStandard });
      }
      return pips;
    }

    function getDieConfig(topVal) {
      // Opposite faces sum to 7: top + bottom = 7
      // If top is 1: bottom 6, left 2, right 3
      // If top is 3: bottom 4, left 1, right 2
      // If top is 4: bottom 3, left 5, right 6
      let leftVal = 1, rightVal = 2;
      if (topVal === 1) { leftVal = 2; rightVal = 3; }
      else if (topVal === 2) { leftVal = 1; rightVal = 4; }
      else if (topVal === 3) { leftVal = 1; rightVal = 2; }
      else if (topVal === 4) { leftVal = 5; rightVal = 6; }
      else if (topVal === 5) { leftVal = 3; rightVal = 1; }
      else if (topVal === 6) { leftVal = 4; rightVal = 2; }

      return [
        ...buildPipsForFace('x', rightVal),
        ...buildPipsForFace('y', leftVal),
        ...buildPipsForFace('z', topVal)
      ];
    }

    function rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz) {
      const rx = HL.rad(rxDeg);
      const ry = HL.rad(ryDeg);
      const x1 = lx * Math.cos(ry) + lz * Math.sin(ry);
      const y1 = ly;
      const z1 = -lx * Math.sin(ry) + lz * Math.cos(ry);
      const x2 = x1;
      const y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
      return [cx + x2, cy + y2, cz + z2];
    }

    function projectPip(cu, cv, r, normalAxis, rxDeg, ryDeg, cx, cy, cz) {
      const N = 12;
      const pts = [];
      for (let i = 0; i < N; i++) {
        const theta = (i / N) * Math.PI * 2;
        const u = cu + r * Math.cos(theta);
        const v = cv + r * Math.sin(theta);
        let lx, ly, lz;
        if (normalAxis === 'z') {
          lx = u; ly = v; lz = 10.05;
        } else if (normalAxis === 'y') {
          lx = u; ly = 10.05; lz = v;
        } else {
          lx = 10.05; ly = u; lz = v;
        }
        const wPt = rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz);
        pts.push(P(...wPt));
      }
      return HL.poly(pts);
    }

    function drawDie(cx, baseZ, rxDeg, ryDeg, faceX, faceY, faceZ, pips, pipConfig) {
      const s = 10;
      const cz = baseZ + s;

      const c_000 = rotatePoint(-s, -s, -s, rxDeg, ryDeg, cx, 0, cz);
      const c_100 = rotatePoint( s, -s, -s, rxDeg, ryDeg, cx, 0, cz);
      const c_010 = rotatePoint(-s,  s, -s, rxDeg, ryDeg, cx, 0, cz);
      const c_110 = rotatePoint( s,  s, -s, rxDeg, ryDeg, cx, 0, cz);
      const c_001 = rotatePoint(-s, -s,  s, rxDeg, ryDeg, cx, 0, cz);
      const c_101 = rotatePoint( s, -s,  s, rxDeg, ryDeg, cx, 0, cz);
      const c_011 = rotatePoint(-s,  s,  s, rxDeg, ryDeg, cx, 0, cz);
      const c_111 = rotatePoint( s,  s,  s, rxDeg, ryDeg, cx, 0, cz);

      const ptsX = [P(...c_100), P(...c_110), P(...c_111), P(...c_101)];
      faceX.setAttribute("points", ptsX.map(p => p.map(HL.r2).join(",")).join(" "));

      const ptsY = [P(...c_010), P(...c_110), P(...c_111), P(...c_011)];
      faceY.setAttribute("points", ptsY.map(p => p.map(HL.r2).join(",")).join(" "));

      const ptsZ = [P(...c_001), P(...c_101), P(...c_111), P(...c_011)];
      faceZ.setAttribute("points", ptsZ.map(p => p.map(HL.r2).join(",")).join(" "));

      for (let i = 0; i < pips.length; i++) {
        if (i < pipConfig.length) {
          const cfg = pipConfig[i];
          const pathStr = projectPip(cfg.u, cfg.v, cfg.r, cfg.axis, rxDeg, ryDeg, cx, 0, cz);
          pips[i].style.display = "";
          pips[i].setAttribute("d", pathStr);
        } else {
          pips[i].style.display = "none";
        }
      }
    }

    function aim(pt) {
      if (!pt) {
        wobbleX1.t = 0; wobbleY1.t = 0; lift1.t = 0;
        wobbleX2.t = 0; wobbleY2.t = 0; lift2.t = 0;
        reg.wake();
        return;
      }
      const p1Scr = P(-22, 0, 12);
      const p2Scr = P( 22, 0, 12);
      const midX = (p1Scr[0] + p2Scr[0]) / 2;
      const midY = (p1Scr[1] + p2Scr[1]) / 2;

      const tiltX = HL.clamp((pt[1] - midY) * 0.3, -12, 12);
      const tiltY = HL.clamp(-(pt[0] - midX) * 0.3, -12, 12);

      wobbleX1.t = tiltX; wobbleY1.t = tiltY; lift1.t = 2.0;
      wobbleX2.t = tiltX; wobbleY2.t = tiltY; lift2.t = 2.0;
      reg.wake();
    }

    function draw() {
      const cfg1 = getDieConfig(3);
      const cfg2 = getDieConfig(4);

      const baseZ1 = 2 + Math.max(0, lift1.x);
      const baseZ2 = 2 + Math.max(0, lift2.x);

      drawDie(-22, baseZ1, wobbleX1.x, wobbleY1.x, d1FaceX, d1FaceY, d1FaceZ, d1Pips, cfg1);
      drawDie( 22, baseZ2, wobbleX2.x, wobbleY2.x, d2FaceX, d2FaceY, d2FaceZ, d2Pips, cfg2);

      read.textContent = "Xúc xắc 3D: Mặt trên 3 + 4 = 7 (Tổng các chấm tròn đối diện = 7)";
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(wobbleX1, dt) || HL.stepS(wobbleY1, dt) || HL.stepS(lift1, dt);
      const m2 = HL.stepS(wobbleX2, dt) || HL.stepS(wobbleY2, dt) || HL.stepS(lift2, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => {
        wobbleX1.t = 0; wobbleY1.t = 0; lift1.t = 0;
        wobbleX2.t = 0; wobbleY2.t = 0; lift2.t = 0;
        reg.wake();
      }
    }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        const t = (v - 2.5) / 2.5;
        wobbleY1.t = t * 10;
        wobbleY2.t = -t * 10;
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
},
{
    id: "math-clock",
    title: "7. Mặt Đồng Hồ Học Giờ (Teaching Clock)",
    concept: "Xem giờ đúng & tỷ lệ 12:1",
    means: "Đồng hồ kim: di chuột theo vòng tròn để quay kim phút; kim giờ chuyển động chính xác theo tỷ lệ bánh răng 12:1.",
    rules: [1, 2, 4, 6, 8],
    range: [0, 3, 12],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-46, -46, 0], [46, 46, 18]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Bezel Prism
      const [dialO, dialI] = HL.rings(-42, -42, 42, 42, 42, 3);
      const bezelSol = HL.solid(svg);
      HL.put(bezelSol, HL.prism(P, front, dialO, dialI, 0, 6));

      // Dial Face Inner Crease
      const dialInner = HL.mk("ellipse", { rx: HL.r2(39 * C.S), ry: HL.r2(39 * C.S * C.k), class: "lo nf" }, svg);
      const centerScr = P(0, 0, 6.2);
      dialInner.setAttribute("cx", HL.r2(centerScr[0]));
      dialInner.setAttribute("cy", HL.r2(centerScr[1]));

      // 60 Minute Ticks around rim (r = 35.5 to 38.0)
      for (let m = 0; m < 60; m++) {
        if (m % 5 === 0) continue; // Hour ticks drawn separately
        const alpha = -Math.PI / 2 + (m / 60) * Math.PI * 2;
        const phi = alpha - Math.PI / 4;
        const r1 = 36.0, r2 = 38.0;
        const p1 = P(Math.cos(phi) * r1, Math.sin(phi) * r1, 6.2);
        const p2 = P(Math.cos(phi) * r2, Math.sin(phi) * r2, 6.2);
        HL.mk("line", {
          x1: HL.r2(p1[0]), y1: HL.r2(p1[1]),
          x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
          class: "lo"
        }, svg);
      }

      // 12 Major Hour Ticks (r = 32.5 to 38.0)
      for (let h = 1; h <= 12; h++) {
        const alpha = -Math.PI / 2 + (h / 12) * Math.PI * 2;
        const phi = alpha - Math.PI / 4;
        const r1 = h % 3 === 0 ? 32.0 : 33.5;
        const r2 = 38.0;
        const p1 = P(Math.cos(phi) * r1, Math.sin(phi) * r1, 6.2);
        const p2 = P(Math.cos(phi) * r2, Math.sin(phi) * r2, 6.2);
        HL.mk("line", {
          x1: HL.r2(p1[0]), y1: HL.r2(p1[1]),
          x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
          stroke: "#232327",
          "stroke-width": h % 3 === 0 ? 1.6 : 1.1
        }, svg);
      }

      // Hour Hand (Short & broad, solid dark with sharp arrowhead pointing inside number ring)
      const hourPoly = HL.mk("polygon", {
        style: "fill: #232327; stroke: #111113; stroke-width: 0.8; stroke-linejoin: round;"
      }, svg);

      // Minute Hand (Long & slender, white plate with dark stroke & sharp arrowhead pointing at ticks)
      const minutePoly = HL.mk("polygon", {
        style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;"
      }, svg);

      // 12 Clock Face Numbers (1 to 12) placed on 2:1 axonometric circle at radius 22
      // Sits in clear channel between hour tip (15.5) and minute arrow base (26.5)
      for (let h = 1; h <= 12; h++) {
        const alpha = -Math.PI / 2 + (h / 12) * Math.PI * 2;
        const phi = alpha - Math.PI / 4;
        const rNum = 22.0;
        const nx = Math.cos(phi) * rNum;
        const ny = Math.sin(phi) * rNum;
        const pt = P(nx, ny, 6.4);

        const txt = HL.mk("text", {
          x: HL.r2(pt[0]),
          y: HL.r2(pt[1] + 2.8), // optical vertical alignment
          "text-anchor": "middle",
          style: `fill: #232327; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-size: ${h % 3 === 0 ? "9.5px" : "8px"}; font-weight: ${h % 3 === 0 ? "700" : "600"}; pointer-events: none;`
        }, svg);
        txt.textContent = String(h);
      }

      // Center Pin Housing & Axle Cap (covers hand roots)
      const centerPinOuter = HL.mk("ellipse", {
        rx: HL.r2(3.0 * C.S), ry: HL.r2(3.0 * C.S * C.k),
        style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2;"
      }, svg);
      const centerPinInner = HL.mk("ellipse", {
        rx: HL.r2(1.4 * C.S), ry: HL.r2(1.4 * C.S * C.k),
        style: "fill: #232327; stroke: none;"
      }, svg);
      centerPinOuter.setAttribute("cx", HL.r2(centerScr[0]));
      centerPinOuter.setAttribute("cy", HL.r2(centerScr[1]));
      centerPinInner.setAttribute("cx", HL.r2(centerScr[0]));
      centerPinInner.setAttribute("cy", HL.r2(centerScr[1]));

      // Clock State: default at 3:00
      const startHour = 3;
      const initialTurn = (initialV !== undefined ? (initialV - startHour) : 0) * Math.PI * 2;
      const rotSpring = HL.spring(initialTurn, { k: 120, c: 14 });

      // Generate hand polygon vertices projected on dial plane
      // handAngle: angle clockwise from 12 in dial coordinates
      // spec: { len, arrowBase, arrowW, bodyW, tailLen }
      function makeHandPolygon(handAngle, spec, zHeight) {
        const phi = (-Math.PI / 2 + handAngle) - Math.PI / 4;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);

        // Unit vector along hand (u) and perpendicular across (v)
        const ux = cosP, uy = sinP;
        const vx = -sinP, vy = cosP;

        function vertex(L, W) {
          const wx = L * ux + W * vx;
          const wy = L * uy + W * vy;
          return P(wx, wy, zHeight);
        }

        const pts = [
          vertex(-spec.tailLen, -spec.bodyW),
          vertex(-spec.tailLen,  spec.bodyW),
          vertex(spec.arrowBase, spec.bodyW),
          vertex(spec.arrowBase, spec.arrowW),
          vertex(spec.len,       0),
          vertex(spec.arrowBase, -spec.arrowW),
          vertex(spec.arrowBase, -spec.bodyW)
        ];

        return pts.map(p => p.map(HL.r2).join(",")).join(" ");
      }

      function draw() {
        const minRot = rotSpring.x;
        // Gear ratio: 12:1 exact clockwise coupling
        const hourRot = minRot / 12 + (startHour / 12) * Math.PI * 2;

        // Hour Hand: shorter (len=15.5, tip reaches inside number ring), wider (bodyW=1.8, arrowW=2.8)
        const hourSpec = { len: 15.5, arrowBase: 11.0, arrowW: 2.8, bodyW: 1.8, tailLen: 3.5 };
        hourPoly.setAttribute("points", makeHandPolygon(hourRot, hourSpec, 7.0));

        // Minute Hand: longer (len=32.5, arrowBase=26.5 outside numbers, tip reaches ticks at 33..38)
        const minSpec = { len: 32.5, arrowBase: 26.5, arrowW: 1.8, bodyW: 0.9, tailLen: 4.0 };
        minutePoly.setAttribute("points", makeHandPolygon(minRot, minSpec, 7.5));

        // Time Calculation
        const totalMinutes = (startHour * 60) + (minRot / (Math.PI * 2)) * 60;
        let posMinutes = Math.round(totalMinutes);
        while (posMinutes < 0) posMinutes += 12 * 60;
        const mins = posMinutes % 60;
        const hrs = ((Math.floor(posMinutes / 60) - 1) % 12 + 12) % 12 + 1;
        const minStr = mins < 10 ? "0" + mins : String(mins);
        read.textContent = `Đồng hồ: ${hrs}:${minStr} (Tỷ lệ bánh răng 12:1)`;
      }

      let lastClockAngle = null;
      let targetRot = initialTurn;

      function aim(pt) {
        if (!pt) {
          lastClockAngle = null;
          return;
        }

        // Project pointer relative to dial center, uncompressing 2:1 axonometric Y
        const dx = pt[0] - centerScr[0];
        const dy = (pt[1] - centerScr[1]) * 2;
        const curPointerAngle = Math.atan2(dy, dx);

        // Angle clockwise from 12 o'clock (-Math.PI / 2)
        let clockAngle = curPointerAngle - (-Math.PI / 2);
        while (clockAngle < 0) clockAngle += Math.PI * 2;
        while (clockAngle >= Math.PI * 2) clockAngle -= Math.PI * 2;

        if (lastClockAngle !== null) {
          let diff = clockAngle - lastClockAngle;
          if (diff < -Math.PI) diff += Math.PI * 2;
          else if (diff > Math.PI) diff -= Math.PI * 2;
          targetRot += diff;
        } else {
          // Snap targetRot to nearest equivalent of clockAngle
          const turns = Math.round((targetRot - clockAngle) / (Math.PI * 2));
          targetRot = turns * Math.PI * 2 + clockAngle;
        }

        lastClockAngle = clockAngle;
        rotSpring.t = targetRot;
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const moving = HL.stepS(rotSpring, dt);
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) {
          targetRot = (v - startHour) * Math.PI * 2;
          lastClockAngle = null;
          rotSpring.t = targetRot;
          reg.wake();
        },
        destroy: bag.dispose
      };
    }
  },
{
  id: "math-shapes",
  title: "8. Khối Hình Không Gian (3D Geometric Solids)",
  concept: "Nhận biết khối lập phương, khối trụ, khối nón & vết đáy 2D",
  means: "Ba khối hình học cơ bản: Khối lập phương, Khối trụ và Khối nón trên đế bàn. Click vào từng khối để nhấc bổng lên, làm lộ rõ vết in đáy hình học 2D (hình vuông, hình tròn).",
  rules: [1, 2, 4, 7, 9],
  range: [1, 2, 3],
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
    const sqFoot = HL.mk("polygon", { points: sqPts.map(p => p.join(",")).join(" "), stroke: "#232327", "stroke-width": 1.4, fill: "#e0e0e4" }, svg);

    // Cylinder footprint: Circle R=12 (center 0, 0)
    const circPts = [];
    for (let a = 0; a <= 48; a++) {
      const rad = (a / 48) * Math.PI * 2;
      circPts.push(P(Math.cos(rad) * 12, Math.sin(rad) * 12, 2.2));
    }
    const cyFoot = HL.mk("polygon", { points: circPts.map(p => p.join(",")).join(" "), stroke: "#232327", "stroke-width": 1.4, fill: "#e0e0e4" }, svg);

    // Cone footprint: Circle R=12 (center 36, 0)
    const coneFootPts = [];
    for (let a = 0; a <= 48; a++) {
      const rad = (a / 48) * Math.PI * 2;
      coneFootPts.push(P(36 + Math.cos(rad) * 12, Math.sin(rad) * 12, 2.2));
    }
    const coneFoot = HL.mk("polygon", { points: coneFootPts.map(p => p.join(",")).join(" "), stroke: "#232327", "stroke-width": 1.4, fill: "#e0e0e4" }, svg);

    // Drop guides when lifted
    const dropGuides = HL.mk("path", { class: "nf dash lo" }, svg);

    const cubeSol = HL.solid(svg);
    const cylSol = HL.solid(svg);
    const coneSol = HL.solid(svg);

    // Initial lifted shape: 1 = cube, 2 = cylinder, 3 = cone
    let activeShape = initialV != null ? HL.clamp(Math.round(initialV), 1, 3) : 2;

    const lift1 = HL.spring(activeShape === 1 ? 18 : 0, { k: 140, c: 14 });
    const lift2 = HL.spring(activeShape === 2 ? 18 : 0, { k: 140, c: 14 });
    const lift3 = HL.spring(activeShape === 3 ? 18 : 0, { k: 140, c: 14 });

    const cyRing = HL.circ(12, 48);
    const cyInner = HL.circ(11, 48);
    const coneBaseRing = HL.circ(12, 48).map(q => ({ u: 36 + q.u, v: q.v, nu: q.nu, nv: q.nv }));

    function setShape(shapeIdx) {
      activeShape = shapeIdx;
      lift1.t = activeShape === 1 ? 18 : 0;
      lift2.t = activeShape === 2 ? 18 : 0;
      lift3.t = activeShape === 3 ? 18 : 0;
      reg.wake();
    }

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
        guides += HL.seg(P(36, 0, z3), P(36, 0, 2.2));
      }

      dropGuides.setAttribute("d", guides);

      if (activeShape === 1) {
        read.textContent = "Khối Lập Phương nâng lên: Vết in đáy là Hình Vuông phẳng (4 cạnh bằng nhau)";
      } else if (activeShape === 2) {
        read.textContent = "Khối Trụ nâng lên: Vết in đáy là Hình Tròn phẳng (đường cong tròn không góc)";
      } else if (activeShape === 3) {
        read.textContent = "Khối Nón nâng lên: Đáy là Hình Tròn phẳng, đỉnh chóp thu về 1 Điểm Nhọn!";
      } else {
        read.textContent = "Click vào từng khối để nâng lên và xem vết in đáy 2D tương ứng!";
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
},
/*
 * 9. Fraction Pie (Bánh Phân Số 1/4, 1/2, 3/4, 4/4)
 * Pure Hairline 2:1 Axonometric Line Art
 * Smooth pointer tracking transferring quarter slices across
 * Zero SVG text - clean visual line art
 */

{
  id: "math-fraction-pie",
  title: "9. Bánh Phân Số 1/4 (Fraction Pie)",
  concept: "Phân số cơ bản: một phần tư (1/4), một nửa (1/2), toàn bộ (4/4)",
  means: "Bánh tròn chia 4 miếng quạt 90°: di chuyển con trỏ để nhấc các miếng bánh từ khay nướng sang đĩa ăn, trực quan hóa 1/4, 2/4 = 1/2, 3/4.",
  rules: [1, 2, 4, 7, 8],
  range: [0, 1, 4],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-58, -24, 0], [58, 24, 35]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    const R = 18;
    const H = 7;
    const panX = -26;
    const plateX = 26;

    // 1. Left: Baking Tray (Khay nướng)
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

    // 3. 4 Slices (Quarter Wedges)
    const renderOrder = [2, 1, 3, 0];
    let takenCount = initialV !== undefined ? Math.round(HL.clamp(initialV, 0, 4)) : 1;

    const pieces = renderOrder.map(i => {
      const a0 = (i * Math.PI) / 2;
      const a1 = ((i + 1) * Math.PI) / 2;
      const mid = (a0 + a1) / 2;
      return {
        idx: i,
        a0,
        a1,
        mid,
        sol: HL.solid(svg),
        sp: HL.spring(i < takenCount ? 1 : 0, { k: 140, c: 14 })
      };
    });

    function draw() {
      pieces.forEach(pc => {
        const u = pc.sp.x;

        // Path from pan to plate with gentle lifting arc in Z
        const curX = HL.lerp(panX, plateX, u);
        const curY = 0;
        const curZ0 = 3.0 + 4 * 14 * u * (1 - u);
        const curZ1 = curZ0 + H;

        const numArc = 14;
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

      if (takenCount === 0) {
        read.textContent = "Bánh nguyên vẹn: 4/4 = 1 cái bánh";
      } else if (takenCount === 1) {
        read.textContent = "Bốc 1 miếng (1/4) ra đĩa: Trong khay còn 3/4 cái bánh";
      } else if (takenCount === 2) {
        read.textContent = "Bốc 2 miếng (2/4) ra đĩa: Trong khay còn đúng 1/2 cái bánh (một nửa)";
      } else if (takenCount === 3) {
        read.textContent = "Bốc 3 miếng (3/4) ra đĩa: Trong khay còn lại 1/4 cái bánh";
      } else {
        read.textContent = "Đã bốc hết 4/4 miếng ra đĩa: Khay bánh trống";
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
      const pLeft = P(panX, 0, 3)[0];
      const pRight = P(plateX, 0, 3)[0];
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
},
{
    id: "math-bead-string",
    title: "10. Chuỗi 10 Hạt Đếm (Counting Bead String)",
    concept: "Tách gộp số 10 (bảng cộng phạm vi 10)",
    means: "Chuỗi 10 hạt đếm trên thanh uốn cong: 5 hạt đậm và 5 hạt nhạt; di chuột chia tách số 10 thành các cặp phép cộng (7 + 3, 6 + 4, 8 + 2).",
    rules: [1, 2, 3, 7, 10],
    range: [0, 5, 10],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-58, -16, 0], [58, 16, 45]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Wooden base (Z: 0 to 4)
      const [bO, bI] = HL.rings(-52, -14, 52, 14, 3, 1.5);
      const baseSol = HL.solid(svg);
      HL.put(baseSol, HL.prism(P, front, bO, bI, 0, 4));

      // Sockets for wire anchors on base
      HL.mk("circle", { cx: P(-44, 0, 4.1)[0], cy: P(-44, 0, 4.1)[1], r: 2.5, fill: "#232327" }, svg);
      HL.mk("circle", { cx: P(44, 0, 4.1)[0], cy: P(44, 0, 4.1)[1], r: 2.5, fill: "#232327" }, svg);

      // Parabolic Wire on X-Z plane: z = 4 + 136 * t * (1 - t)
      const wirePts = [];
      for (let s = 0; s <= 48; s++) {
        const t = s / 48;
        const x = HL.lerp(-44, 44, t);
        const z = 4 + 136 * t * (1 - t);
        wirePts.push(P(x, 0, z));
      }
      HL.mk("path", { d: HL.open(wirePts), stroke: "#232327", fill: "none", "stroke-width": 1.6 }, svg);

      // 10 Beads: 5 Dark (first 5) and 5 Light (last 5) for Base-5 grouping
      const beads = [];
      const R = 4.2;      // outer bead radius
      const L = 5.2;      // bead length along wire
      const r_hole = 1.3; // bead hole radius
      const N = 24;       // circular sampling points

      for (let i = 0; i < 10; i++) {
        const dark = i < 5;
        const sol = HL.solid(svg);
        if (dark) {
          sol.sil.style.fill = "#232327";
          sol.sil.style.stroke = "#111113";
          sol.sil.style.strokeWidth = "1.2px";
          sol.cr.style.stroke = "#e0e0e4";
          sol.cr.style.strokeWidth = "1px";
        } else {
          sol.sil.style.fill = "#ffffff";
          sol.sil.style.stroke = "#232327";
          sol.sil.style.strokeWidth = "1.2px";
          sol.cr.style.stroke = "#5b5d64";
          sol.cr.style.strokeWidth = "1px";
        }

        // Initial 5 + 5 split
        const initialT = i < 5 ? 0.06 + i * 0.048 : 0.94 - (9 - i) * 0.048;
        beads.push({
          idx: i,
          dark,
          tSp: HL.spring(initialT, { k: 130, c: 14 }),
          sol
        });
      }

      function draw() {
        beads.forEach(b => {
          const t = b.tSp.x;
          const x = -44 + 88 * t;
          const z = 4 + 136 * t * (1 - t);

          // Tangent vector along wire parabola
          const tx = 88;
          const tz = 136 * (1 - 2 * t);
          const len = Math.hypot(tx, tz);
          const utx = tx / len;
          const utz = tz / len;

          // Orthonormal basis:
          // Axis A = (utx, 0, utz) along the wire
          // Vy = (0, 1, 0)
          // Vn = (-utz, 0, utx)
          const end1 = [], end2 = [];
          const hole1 = [], hole2 = [];
          for (let k = 0; k < N; k++) {
            const ang = (k / N) * Math.PI * 2;
            const cosA = Math.cos(ang);
            const sinA = Math.sin(ang);

            // Outer rim End 1 (at -L/2)
            const p1x = x - (L / 2) * utx + R * sinA * (-utz);
            const p1y = R * cosA;
            const p1z = z - (L / 2) * utz + R * sinA * utx;
            end1.push(P(p1x, p1y, p1z));

            // Outer rim End 2 (at +L/2)
            const p2x = x + (L / 2) * utx + R * sinA * (-utz);
            const p2y = R * cosA;
            const p2z = z + (L / 2) * utz + R * sinA * utx;
            end2.push(P(p2x, p2y, p2z));

            // Hole End 1
            const h1x = x - (L / 2) * utx + r_hole * sinA * (-utz);
            const h1y = r_hole * cosA;
            const h1z = z - (L / 2) * utz + r_hole * sinA * utx;
            hole1.push(P(h1x, h1y, h1z));

            // Hole End 2
            const h2x = x + (L / 2) * utx + r_hole * sinA * (-utz);
            const h2y = r_hole * cosA;
            const h2z = z + (L / 2) * utz + r_hole * sinA * utx;
            hole2.push(P(h2x, h2y, h2z));
          }

          // Outer silhouette: convex hull of End 1 and End 2 rims
          const sil = HL.poly(HL.hull(end1.concat(end2)));

          // Visible end face based on dot product of A with camera vector (0.3536, 0.3536, 0.866)
          const dotEnd2 = utx * 0.3536 + utz * 0.866;
          const visRim = dotEnd2 > 0 ? end2 : end1;
          const visHole = dotEnd2 > 0 ? hole2 : hole1;

          // Crease: visible rim ellipse + visible center hole
          const crease = HL.poly(visRim) + HL.poly(visHole);

          HL.put(b.sol, { sil, crease });
        });

        const leftCount = beads.filter(b => b.tSp.x < 0.5).length;
        const rightCount = 10 - leftCount;
        const leftDark = Math.min(5, leftCount);
        const leftLight = Math.max(0, leftCount - 5);
        const rightDark = Math.max(0, 5 - leftCount);
        const rightLight = 5 - leftLight;
        read.textContent = "Tách gộp số 10: " + leftCount + " + " + rightCount + " = 10 (" + leftDark + " đậm, " + leftLight + " sáng | " + rightDark + " đậm, " + rightLight + " sáng)";
      }

      let curSplit = 5;

      function setSplit(splitIdx) {
        curSplit = HL.clamp(splitIdx, 0, 10);
        beads.forEach((b, i) => {
          if (i < curSplit) {
            b.tSp.t = 0.06 + i * 0.048;
          } else {
            b.tSp.t = 0.94 - (9 - i) * 0.048;
          }
        });
        reg.wake();
      }

      function aim(pt) {
        if (!pt) return;
        const scrLeft = P(-44, 0, 4)[0];
        const scrRight = P(44, 0, 4)[0];
        const norm = HL.clamp((pt[0] - scrLeft) / (scrRight - scrLeft), 0.05, 0.95);
        const splitIdx = Math.round(norm * 10);
        setSplit(splitIdx);
      }

      const reg = HL.register(stage, dt => {
        let moving = false;
        beads.forEach(b => { if (HL.stepS(b.tSp, dt)) moving = true; });
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, {
        move: aim,
        leave: () => setSplit(5)
      }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) {
          setSplit(Math.round(v));
        },
        destroy: bag.dispose
      };
    }
  },
];

// App Controller & View Logic
(() => {
  const $ = id => document.getElementById(id);
  const navTabs = $("nav-tabs");
  const stage = $("stage");
  const slider = $("intensity");
  const valOut = $("value");
  const nameEl = $("name");
  const readEl = $("read");
  const metaTitle = $("meta-title");
  const metaDesc = $("meta-desc");
  const metaRule = $("meta-rule");
  const singleView = $("single-view");
  const galleryView = $("gallery-view");

  let currentIndex = 0;
  let currentHandle = null;
  let isGalleryMode = false;

  const readBridge = {
    get textContent() { return readEl.textContent; },
    set textContent(v) { readEl.textContent = v; }
  };

  function renderTabs() {
    navTabs.innerHTML = "";
    MATH_FIGURES.forEach((fig, idx) => {
      const btn = document.createElement("button");
      btn.className = "nav-btn" + (idx === currentIndex && !isGalleryMode ? " active" : "");
      btn.textContent = fig.title.split(" (")[0];
      btn.onclick = () => switchTo(idx);
      navTabs.appendChild(btn);
    });

    const galleryBtn = document.createElement("button");
    galleryBtn.className = "nav-btn view-mode-toggle" + (isGalleryMode ? " active" : "");
    galleryBtn.textContent = isGalleryMode ? "Tập Trung (Focus)" : "Xem Cả 10 Hình (Gallery)";
    galleryBtn.onclick = toggleGalleryMode;
    navTabs.appendChild(galleryBtn);
  }

  function switchTo(idx) {
    isGalleryMode = false;
    galleryView.hidden = true;
    singleView.hidden = false;
    currentIndex = idx;
    renderTabs();

    if (currentHandle) {
      currentHandle.destroy();
      currentHandle = null;
    }
    stage.replaceChildren();

    const fig = MATH_FIGURES[idx];
    stage.setAttribute("data-hairline", fig.id);
    nameEl.textContent = fig.id;
    metaTitle.textContent = fig.title;
    metaDesc.textContent = fig.means;
    metaRule.textContent = "Khái niệm toán học: " + fig.concept + " · Quy tắc: " + fig.rules.join(", ");

    slider.min = fig.range[0];
    slider.max = fig.range[2];
    slider.value = fig.range[1];
    valOut.textContent = String(fig.range[1]);

    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    currentHandle = fig.mount({ stage, svg, read: readBridge }, fig.range[1]);
  }

  function toggleGalleryMode() {
    isGalleryMode = !isGalleryMode;
    if (isGalleryMode) {
      if (currentHandle) { currentHandle.destroy(); currentHandle = null; }
      singleView.hidden = true;
      galleryView.hidden = false;
      renderTabs();
      buildGallery();
    } else {
      switchTo(currentIndex);
    }
  }

  function buildGallery() {
    galleryView.innerHTML = "";
    MATH_FIGURES.forEach((fig, idx) => {
      const card = document.createElement("div");
      card.className = "grid-card";
      
      const gStage = document.createElement("div");
      gStage.className = "grid-stage";
      gStage.id = "gstage-" + idx;
      gStage.setAttribute("data-hairline", fig.id);

      const gMeta = document.createElement("div");
      gMeta.className = "grid-meta";
      
      const gName = document.createElement("div");
      gName.className = "grid-name";
      gName.textContent = fig.title;

      const gDesc = document.createElement("div");
      gDesc.className = "grid-desc";
      gDesc.textContent = fig.means;

      gMeta.appendChild(gName);
      gMeta.appendChild(gDesc);

      card.appendChild(gStage);
      card.appendChild(gMeta);
      card.onclick = () => switchTo(idx);
      galleryView.appendChild(card);

      const gSvg = HL.mk("svg", { viewBox: "0 0 400 300", "aria-hidden": "true" }, gStage);
      const dummyRead = { textContent: "" };
      fig.mount({ stage: gStage, svg: gSvg, read: dummyRead }, fig.range[1]);
    });
  }

  slider.oninput = () => {
    valOut.textContent = slider.value;
    if (currentHandle) currentHandle.set(Number(slider.value));
  };

  $("btn-prev").onclick = () => {
    switchTo((currentIndex - 1 + MATH_FIGURES.length) % MATH_FIGURES.length);
  };
  $("btn-next").onclick = () => {
    switchTo((currentIndex + 1) % MATH_FIGURES.length);
  };

  window.addEventListener("keydown", e => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) return;
    if (e.key === "ArrowLeft") $("btn-prev").click();
    if (e.key === "ArrowRight") $("btn-next").click();
    if (e.key >= "1" && e.key <= "9") switchTo(Number(e.key) - 1);
    if (e.key === "0") switchTo(9);
  });

  switchTo(0);
})();
