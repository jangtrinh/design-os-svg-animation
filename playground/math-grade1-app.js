/*
 * 10 Grade 1 Math Figures Definitions (Hairline 2:1 Axonometric Standard)
 * Modularized Architecture - Auto-bundled
 */

if (typeof HL !== "undefined" && HL.inject) {
  HL.inject(document);
}

const MATH_FIGURES = [
/*
 * 1. Math Counting Sticks (Bó Que Tính Chục & Đơn Vị)
 * Authentic Grade 1 Pedagogical Manipulative: Place Value (Tens & Units)
 * 10 sticks bundled with an accent band + loose unit sticks on wooden mat
 */

{
  id: "math-sticks",
  title: "1. Bó Que Tính (Counting Sticks Bundle)",
  concept: "Chục và đơn vị · Các số từ 11 đến 20",
  means: "1 bó chục (10 que tính buộc đai) cùng các que tính rời nằm phẳng trên mặt bàn; di chuột kéo que rời ra/vào để học cấu tạo số 1 chục và các đơn vị (10 + 3 = 13).",
  rules: [1, 2, 3, 5, 8],
  range: [0, 3, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-55, -20, 0], [55, 20, 30]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Desktop Wooden Mat
    const [matO, matI] = HL.rings(-52, -18, 52, 18, 3, 1.2);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2.5));

    // Divider groove line between Tens (Left) and Units (Right)
    HL.mk("line", {
      x1: P(0, -17, 2.6)[0], y1: P(0, -17, 2.6)[1],
      x2: P(0, 17, 2.6)[0], y2: P(0, 17, 2.6)[1],
      stroke: "#e0e0e4", "stroke-width": 1, "stroke-dasharray": "3 2"
    }, svg);

    // Labels etched on the mat
    const tensLabelPt = P(-26, -14, 2.6);
    const unitsLabelPt = P(26, -14, 2.6);
    const tText = HL.mk("text", {
      x: tensLabelPt[0], y: tensLabelPt[1],
      fill: "#6f6f78", "font-size": "9px", "font-family": "ui-monospace, monospace",
      "text-anchor": "middle", "font-weight": "600"
    }, svg);
    tText.textContent = "CHỤC (10)";

    const uText = HL.mk("text", {
      x: unitsLabelPt[0], y: unitsLabelPt[1],
      fill: "#6f6f78", "font-size": "9px", "font-family": "ui-monospace, monospace",
      "text-anchor": "middle", "font-weight": "600"
    }, svg);
    uText.textContent = "ĐƠN VỊ";

    // 2. The Bundle of 10 Sticks (Left side: x in [-46, -6])
    // 3 layers: Layer 1 (bottom: 4 sticks), Layer 2 (mid: 3 sticks), Layer 3 (top: 3 sticks)
    const bundleStickConfigs = [
      // Bottom layer (z: 2.6 to 4.8)
      { y: -6.6, z0: 2.6, z1: 4.8 },
      { y: -2.2, z0: 2.6, z1: 4.8 },
      { y: 2.2, z0: 2.6, z1: 4.8 },
      { y: 6.6, z0: 2.6, z1: 4.8 },
      // Middle layer (z: 4.8 to 7.0)
      { y: -4.4, z0: 4.8, z1: 7.0 },
      { y: 0.0, z0: 4.8, z1: 7.0 },
      { y: 4.4, z0: 4.8, z1: 7.0 },
      // Top layer (z: 7.0 to 9.2)
      { y: -4.4, z0: 7.0, z1: 9.2 },
      { y: 0.0, z0: 7.0, z1: 9.2 },
      { y: 4.4, z0: 7.0, z1: 9.2 }
    ];

    const bundleSols = bundleStickConfigs.map(() => HL.solid(svg));
    bundleStickConfigs.forEach((cfg, i) => {
      const [sO, sI] = HL.rings(-45, cfg.y - 1.8, -7, cfg.y + 1.8, 1.8, 0.5);
      HL.put(bundleSols[i], HL.prism(P, front, sO, sI, cfg.z0, cfg.z1));
    });

    // Tie Band around the bundle (at x in [-28, -24])
    const [bandO, bandI] = HL.rings(-28.5, -8.2, -23.5, 8.2, 2.5, 0.6);
    const bandSol = HL.solid(svg);
    bandSol.g.classList.add("hi");
    HL.put(bandSol, HL.prism(P, front, bandO, bandI, 2.6, 9.8));

    // 3. Loose Units Sticks (Right side: 5 sticks)
    // Spaced at y = -8, -4, 0, 4, 8
    const looseSticks = [];
    const unitYs = [-8, -4, 0, 4, 8];
    for (let i = 0; i < 5; i++) {
      looseSticks.push({
        idx: i,
        baseY: unitYs[i],
        active: i < 3, // Default: 3 loose sticks (10 + 3 = 13)
        spX: HL.spring(i < 3 ? 1 : 0, { k: 130, c: 14 }),
        sol: HL.solid(svg)
      });
    }

    function draw() {
      let activeCount = 0;
      looseSticks.forEach(st => {
        if (st.spX.x > 0.4) activeCount++;
        // When active, stick is aligned at rest x=[10, 46].
        // When inactive (or pulled back), stick slides slightly to the right x=[18, 54] or dims
        const slide = (1 - st.spX.x) * 10;
        const x0 = 8 + slide;
        const x1 = 44 + slide;
        const [sO, sI] = HL.rings(x0, st.baseY - 1.6, x1, st.baseY + 1.6, 1.6, 0.4);
        const z0 = 2.6 + st.spX.x * 0.4;
        const z1 = z0 + 2.2;
        HL.put(st.sol, HL.prism(P, front, sO, sI, z0, z1));

        if (st.spX.x > 0.6) {
          st.sol.g.style.opacity = "1";
        } else {
          st.sol.g.style.opacity = "0.35";
        }
      });

      const total = 10 + activeCount;
      const readouts = {
        10: "1 chục (10) + 0 đơn vị = 10 que tính",
        11: "1 chục (10) + 1 que rời = 11 (Mười một)",
        12: "1 chục (10) + 2 que rời = 12 (Mười hai)",
        13: "1 chục (10) + 3 que rời = 13 (Mười ba)",
        14: "1 chục (10) + 4 que rời = 14 (Mười bốn)",
        15: "1 chục (10) + 5 que rời = 15 (Mười lăm)"
      };
      read.textContent = readouts[total] || (total + " que tính");
    }

    function aim(pt) {
      if (!pt) return;
      const [u, v] = pt;
      // If pointer is on the right half, count based on how many sticks are hovered
      const scrU0 = P(8, 0, 3)[0];
      if (u < scrU0) {
        // Hovering on bundle: reset to 3
        return;
      }
      // Calculate how many sticks to activate based on Y or X position
      looseSticks.forEach(st => {
        const ptScr = P(26, st.baseY, 3);
        const distY = v - ptScr[1];
        // If pointer is above or near this stick in screen space
        st.spX.t = (v >= ptScr[1] - 12) ? 1 : 0;
      });
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      looseSticks.forEach(st => {
        if (HL.stepS(st.spX, dt)) moving = true;
      });
      draw();
      return moving;
    });
    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => {} }));
    bag.add(() => svg.replaceChildren());

    draw();
    return {
      set(v) {
        const count = Math.round(HL.clamp(v, 0, 5));
        looseSticks.forEach((st, i) => {
          st.spX.t = i < count ? 1 : 0;
        });
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
},
{
    id: "math-balance",
    title: "2. Cân Thăng Bằng (Balance Scale)",
    concept: "So sánh lớn hơn, bé hơn, bằng nhau",
    means: "Cân thăng bằng so sánh khối lượng: đĩa trái có 3 khối, đĩa phải có 2 khối; di chuột để dịch chuyển trọng tâm.",
    rules: [1, 3, 4, 6, 7],
    range: [-12, -7, 12],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.8);
      HL.fit(C, [[-62, -22, 0], [62, 22, 60]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Base Pedestal
      const [baseO, baseI] = HL.rings(-24, -20, 24, 20, 4, 2);
      const baseSol = HL.solid(svg);
      HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 6));

      // Vertical Mast Post
      const [mastO, mastI] = HL.rings(-4, -4, 4, 4, 4, 0.8);
      const mastSol = HL.solid(svg);
      HL.put(mastSol, HL.prism(P, front, mastO, mastI, 6, 40));

      // Triangular Fulcrum Bracket & Axle Pin
      const fulcrumSol = HL.solid(svg);
      const [fO, fI] = HL.rings(-5, -3, 5, 3, 2, 0.6);
      HL.put(fulcrumSol, HL.prism(P, front, fO, fI, 39, 42));

      // Trays Solids
      const leftTraySol = HL.solid(svg);
      const rightTraySol = HL.solid(svg);

      // Shallow Rims for Trays (inner decorative crease ring)
      const leftRim = HL.mk("ellipse", { rx: HL.r2(11 * C.S), ry: HL.r2(11 * C.S * C.k), class: "lo nf" }, svg);
      const rightRim = HL.mk("ellipse", { rx: HL.r2(11 * C.S), ry: HL.r2(11 * C.S * C.k), class: "lo nf" }, svg);

      // 5 Weights (3 left, 2 right)
      const weightSols = [
        HL.solid(svg), HL.solid(svg), HL.solid(svg),
        HL.solid(svg), HL.solid(svg)
      ];
      // Knob handles on top of weights
      const weightKnobs = [
        HL.mk("circle", { r: 1.5, fill: "#232327" }, svg),
        HL.mk("circle", { r: 1.5, fill: "#232327" }, svg),
        HL.mk("circle", { r: 1.5, fill: "#232327" }, svg),
        HL.mk("circle", { r: 1.5, fill: "#232327" }, svg),
        HL.mk("circle", { r: 1.5, fill: "#232327" }, svg)
      ];

      // Tripod Bridles (3 cords per tray for physical stability)
      const leftCords = [
        HL.mk("line", { stroke: "#232327", "stroke-width": 1 }, svg),
        HL.mk("line", { stroke: "#232327", "stroke-width": 1 }, svg),
        HL.mk("line", { stroke: "#232327", "stroke-width": 1 }, svg)
      ];
      const rightCords = [
        HL.mk("line", { stroke: "#232327", "stroke-width": 1 }, svg),
        HL.mk("line", { stroke: "#232327", "stroke-width": 1 }, svg),
        HL.mk("line", { stroke: "#232327", "stroke-width": 1 }, svg)
      ];

      // Solid 3D Box Beam (Front face, Right end cap, Top face)
      const beamFront = HL.mk("polygon", { fill: "#ffffff", stroke: "#232327", "stroke-width": 1.2, "stroke-linejoin": "round" }, svg);
      const beamRight = HL.mk("polygon", { fill: "#ffffff", stroke: "#232327", "stroke-width": 1.2, "stroke-linejoin": "round" }, svg);
      const beamTop = HL.mk("polygon", { fill: "#ffffff", stroke: "#232327", "stroke-width": 1.2, "stroke-linejoin": "round" }, svg);

      // Beam Pivot Axle Pin Cap at front
      const pivotPin = HL.mk("ellipse", { rx: HL.r2(2.2 * C.S), ry: HL.r2(2.2 * C.S * C.k), fill: "#232327" }, svg);

      // End hook pins on beam
      const hookPinL = HL.mk("circle", { r: 2, fill: "#232327" }, svg);
      const hookPinR = HL.mk("circle", { r: 2, fill: "#232327" }, svg);

      const tilt = HL.spring(initialV ?? -7, { k: 120, c: 14 });

      function draw() {
        const rad = HL.rad(tilt.x);
        const span = 46;
        const halfW = 2.2;
        const halfH = 2.0;
        const pivotZ = 42;

        const cosA = Math.cos(rad);
        const sinA = Math.sin(rad);

        // Helper to rotate local beam point (lx, ly, lz) around Y axis at (0, 0, pivotZ)
        // For rad < 0 (left heavy), sinA < 0 -> left (lx < 0) sinks down
        function bPt(lx, ly, lz) {
          const wx = lx * cosA - lz * sinA;
          const wy = ly;
          const wz = pivotZ + lx * sinA + lz * cosA;
          return [wx, wy, wz];
        }

        // 8 Corners of the 3D Box Beam
        // -x = left, +x = right; -y = back, +y = front; -z = bottom, +z = top
        const c_L_Bk_B = bPt(-span, -halfW, -halfH);
        const c_L_Bk_T = bPt(-span, -halfW,  halfH);
        const c_L_Fr_T = bPt(-span,  halfW,  halfH);
        const c_L_Fr_B = bPt(-span,  halfW, -halfH);

        const c_R_Bk_B = bPt( span, -halfW, -halfH);
        const c_R_Bk_T = bPt( span, -halfW,  halfH);
        const c_R_Fr_T = bPt( span,  halfW,  halfH);
        const c_R_Fr_B = bPt( span,  halfW, -halfH);

        // 1. Front face (+Y face): c_L_Fr_B -> c_R_Fr_B -> c_R_Fr_T -> c_L_Fr_T
        const frontScreen = [P(...c_L_Fr_B), P(...c_R_Fr_B), P(...c_R_Fr_T), P(...c_L_Fr_T)];
        beamFront.setAttribute("points", frontScreen.map(p => p.map(HL.r2).join(",")).join(" "));

        // 2. Right end cap (+X face): c_R_Bk_B -> c_R_Fr_B -> c_R_Fr_T -> c_R_Bk_T
        const rightScreen = [P(...c_R_Bk_B), P(...c_R_Fr_B), P(...c_R_Fr_T), P(...c_R_Bk_T)];
        beamRight.setAttribute("points", rightScreen.map(p => p.map(HL.r2).join(",")).join(" "));

        // 3. Top face (+Z face): c_L_Bk_T -> c_R_Bk_T -> c_R_Fr_T -> c_L_Fr_T
        const topScreen = [P(...c_L_Bk_T), P(...c_R_Bk_T), P(...c_R_Fr_T), P(...c_L_Fr_T)];
        beamTop.setAttribute("points", topScreen.map(p => p.map(HL.r2).join(",")).join(" "));

        // Pivot Axle Pin position (front of beam at y = halfW + 0.2)
        const pinScreen = P(0, halfW + 0.3, pivotZ);
        pivotPin.setAttribute("cx", HL.r2(pinScreen[0]));
        pivotPin.setAttribute("cy", HL.r2(pinScreen[1]));

        // Left & Right Hook suspension points (under the beam ends)
        const hookPtL = bPt(-span, 0, -halfH - 0.5);
        const hookPtR = bPt( span, 0, -halfH - 0.5);
        const scrHookL = P(...hookPtL);
        const scrHookR = P(...hookPtR);
        hookPinL.setAttribute("cx", HL.r2(scrHookL[0]));
        hookPinL.setAttribute("cy", HL.r2(scrHookL[1]));
        hookPinR.setAttribute("cx", HL.r2(scrHookR[0]));
        hookPinR.setAttribute("cy", HL.r2(scrHookR[1]));

        // Left Tray suspended
        const trayDrop = 24;
        const leftTrayZ = hookPtL[2] - trayDrop;
        const leftTrayX = hookPtL[0];
        const [ltO, ltI] = HL.rings(leftTrayX - 13, -13, leftTrayX + 13, 13, 13, 1.5);
        HL.put(leftTraySol, HL.prism(P, front, ltO, ltI, leftTrayZ, leftTrayZ + 2.2));

        const ltCenterScr = P(leftTrayX, 0, leftTrayZ + 2.2);
        leftRim.setAttribute("cx", HL.r2(ltCenterScr[0]));
        leftRim.setAttribute("cy", HL.r2(ltCenterScr[1]));

        // Tripod Bridle for Left Tray (3 cords at 0°, 120°, 240° for physical stability)
        const bridleAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
        const trayR = 12.2;
        bridleAngles.forEach((ang, idx) => {
          const bx = leftTrayX + Math.cos(ang) * trayR;
          const by = Math.sin(ang) * trayR;
          const bz = leftTrayZ + 2.2;
          const bScr = P(bx, by, bz);
          leftCords[idx].setAttribute("x1", HL.r2(scrHookL[0]));
          leftCords[idx].setAttribute("y1", HL.r2(scrHookL[1]));
          leftCords[idx].setAttribute("x2", HL.r2(bScr[0]));
          leftCords[idx].setAttribute("y2", HL.r2(bScr[1]));
        });

        // Right Tray suspended
        const rightTrayZ = hookPtR[2] - trayDrop;
        const rightTrayX = hookPtR[0];
        const [rtO, rtI] = HL.rings(rightTrayX - 13, -13, rightTrayX + 13, 13, 13, 1.5);
        HL.put(rightTraySol, HL.prism(P, front, rtO, rtI, rightTrayZ, rightTrayZ + 2.2));

        const rtCenterScr = P(rightTrayX, 0, rightTrayZ + 2.2);
        rightRim.setAttribute("cx", HL.r2(rtCenterScr[0]));
        rightRim.setAttribute("cy", HL.r2(rtCenterScr[1]));

        // Tripod Bridle for Right Tray
        bridleAngles.forEach((ang, idx) => {
          const bx = rightTrayX + Math.cos(ang) * trayR;
          const by = Math.sin(ang) * trayR;
          const bz = rightTrayZ + 2.2;
          const bScr = P(bx, by, bz);
          rightCords[idx].setAttribute("x1", HL.r2(scrHookR[0]));
          rightCords[idx].setAttribute("y1", HL.r2(scrHookR[1]));
          rightCords[idx].setAttribute("x2", HL.r2(bScr[0]));
          rightCords[idx].setAttribute("y2", HL.r2(bScr[1]));
        });

        // 3 Weights on Left Tray (triangle arrangement, neat on tray surface)
        const w3_pos = [
          [leftTrayX - 4.5, -3.2, leftTrayZ + 2.2],
          [leftTrayX + 4.5, -3.2, leftTrayZ + 2.2],
          [leftTrayX, 4.0, leftTrayZ + 2.2]
        ];
        w3_pos.forEach((pos, idx) => {
          const [wO, wI] = HL.rings(pos[0] - 3.5, pos[1] - 3.5, pos[0] + 3.5, pos[1] + 3.5, 3.5, 0.6);
          HL.put(weightSols[idx], HL.prism(P, front, wO, wI, pos[2], pos[2] + 6));
          const knobPt = P(pos[0], pos[1], pos[2] + 6.3);
          weightKnobs[idx].setAttribute("cx", HL.r2(knobPt[0]));
          weightKnobs[idx].setAttribute("cy", HL.r2(knobPt[1]));
        });

        // 2 Weights on Right Tray (neatly side by side)
        const w2_pos = [
          [rightTrayX - 4.2, 0, rightTrayZ + 2.2],
          [rightTrayX + 4.2, 0, rightTrayZ + 2.2]
        ];
        w2_pos.forEach((pos, idx) => {
          const [wO, wI] = HL.rings(pos[0] - 3.5, pos[1] - 3.5, pos[0] + 3.5, pos[1] + 3.5, 3.5, 0.6);
          HL.put(weightSols[3 + idx], HL.prism(P, front, wO, wI, pos[2], pos[2] + 6));
          const knobPt = P(pos[0], pos[1], pos[2] + 6.3);
          weightKnobs[3 + idx].setAttribute("cx", HL.r2(knobPt[0]));
          weightKnobs[3 + idx].setAttribute("cy", HL.r2(knobPt[1]));
        });

        const deg = Math.round(tilt.x);
        if (tilt.x < -2.5) {
          read.textContent = `Bên trái nặng hơn: 3 > 2 (nghiêng ${Math.abs(deg)}°)`;
        } else if (tilt.x > 2.5) {
          read.textContent = `Bên phải nâng: 2 < 3 (nghiêng +${deg}°)`;
        } else {
          read.textContent = "Thăng bằng cơ học: 3 = 3";
        }
      }

      function aim(pt) {
        if (!pt) { tilt.t = -7; reg.wake(); return; }
        const normalized = (pt[0] - 200) / 100;
        tilt.t = HL.clamp(normalized * 12, -12, 12);
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const moving = HL.stepS(tilt, dt);
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) { tilt.t = HL.clamp(v, -12, 12); reg.wake(); },
        destroy: bag.dispose
      };
    }
  },
{
  id: "math-ten-frame",
  title: "3. Khung 10 Ô (Ten Frame Counter)",
  concept: "Cấu trúc số 10 cơ số mười",
  means: "Khung 10 ô đếm số: khay gỗ với 10 hốc lõm 2 hàng 5 cột. Ô trống vẽ nét đứt; đồng xu nhấc nảy có bóng đổ tiếp xúc đáy hốc.",
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

        // Subtle 3D recessed wall drop edge at far corner (top-left in camera view)
        const wallDrop = HL.seg(P(cx - 8.0, cy + 8.0, 4.0), P(cx - 8.0, cy + 8.0, 1.6));
        HL.mk("path", { class: "lo", d: wallDrop }, svg);
      }
    }

    // 10 Token Slots
    const tokens = [];
    const initCount = initialV != null ? Math.round(initialV) : 7;
    let slotIdx = 0;

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 5; c++) {
        const cx = -40 + c * 20;
        const cy = r === 0 ? 10 : -10;
        const active = slotIdx < initCount;

        // Dashed circle on cavity floor (shown only when cell is empty)
        const emptyPts = [];
        for (let k = 0; k <= 32; k++) {
          const a = (k / 32) * Math.PI * 2;
          emptyPts.push(P(cx + 5.5 * Math.cos(a), cy + 5.5 * Math.sin(a), 1.6));
        }
        const emptyEl = HL.mk("path", {
          class: "nf lo dash",
          d: HL.poly(emptyPts)
        }, svg);

        // Contact shadow element on cavity floor for lifted token
        const shadowEl = HL.mk("path", {
          class: "nf lo dash",
          d: ""
        }, svg);

        // Vertical drop line connecting lifted token to its contact shadow
        const dropLineEl = HL.mk("path", {
          class: "nf lo dash",
          d: ""
        }, svg);

        // Token solid
        const sol = HL.solid(svg);

        tokens.push({
          idx: slotIdx,
          cx,
          cy,
          active,
          lift: HL.spring(0, { k: 160, c: 15 }),
          sol,
          emptyEl,
          shadowEl,
          dropLineEl
        });

        slotIdx++;
      }
    }

    function draw() {
      tokens.forEach(tok => {
        if (tok.active) {
          tok.emptyEl.style.display = "none";

          const liftAmount = tok.lift.x;
          const z = 1.6 + liftAmount;

          // Token cylinder solid
          const [cO, cI] = HL.rings(tok.cx - 5.8, tok.cy - 5.8, tok.cx + 5.8, tok.cy + 5.8, 5.8, 0.7);
          HL.put(tok.sol, HL.prism(P, front, cO, cI, z, z + 2.5));

          // Contact shadow on the cavity floor at z = 1.6
          if (liftAmount > 0.4) {
            tok.shadowEl.style.display = "";
            const shadowPts = [];
            for (let k = 0; k <= 28; k++) {
              const a = (k / 28) * Math.PI * 2;
              shadowPts.push(P(tok.cx + 5.6 * Math.cos(a), tok.cy + 5.6 * Math.sin(a), 1.6));
            }
            tok.shadowEl.setAttribute("d", HL.poly(shadowPts));

            // Vertical drop guide from token bottom to contact shadow
            if (liftAmount > 2.0) {
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
          // Empty slot: show gentle dashed circle on floor, NO extruded prism block
          tok.emptyEl.style.display = "";
          tok.shadowEl.style.display = "none";
          tok.dropLineEl.style.display = "none";
          HL.put(tok.sol, { sil: "", crease: "" });
        }
      });

      const activeCount = tokens.filter(t => t.active).length;
      const topCount = tokens.filter((t, i) => i < 5 && t.active).length;
      const botCount = tokens.filter((t, i) => i >= 5 && t.active).length;
      const emptyCount = 10 - activeCount;

      read.textContent = `${activeCount} = ${topCount} (hàng trên) + ${botCount} (hàng dưới) · ${emptyCount} ô trống`;
    }

    function aim(pt) {
      if (!pt) {
        tokens.forEach(t => (t.lift.t = 0));
        reg.wake();
        return;
      }
      tokens.forEach(tok => {
        if (!tok.active) return;
        const scr = P(tok.cx, tok.cy, 5);
        const dist = Math.hypot(pt[0] - scr[0], pt[1] - scr[1]);
        tok.lift.t = dist < 22 ? 14 : 0;
      });
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      tokens.forEach(t => {
        if (HL.stepS(t.lift, dt)) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(
      HL.pointer(stage, {
        move: aim,
        leave: () => {
          tokens.forEach(t => (t.lift.t = 0));
          reg.wake();
        }
      })
    );
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        const count = Math.round(HL.clamp(v, 0, 10));
        tokens.forEach((t, i) => {
          t.active = i < count;
        });
        draw();
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
},
{
  id: "math-number-blocks",
  title: "4. Tháp Khối Số Học (Unifix Number Blocks)",
  concept: "Thứ tự số tự nhiên & chiều cao",
  means: "Tháp khối lập phương Unifix: 3 tháp độ cao 1, 3 và 5. Bảo toàn thể tích; di chuột làm khối đỉnh tách rời lộ chốt tròn & lỗ cắm âm với đàn hồi snap-back.",
  rules: [1, 2, 3, 7, 9],
  range: [1, 3, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -15, 0], [50, 15, 84]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Base Board (z = 0 to 3)
    const [baseO, baseI] = HL.rings(-48, -16, 48, 16, 3, 1.5);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 3));

    const blockH = 13; // Strict invariant: unit cube height is 13, strictly conserved

    const towers = [
      { x: -32, count: 1, lift: HL.spring(0, { k: 170, c: 15 }) },
      { x: 0, count: 3, lift: HL.spring(0, { k: 170, c: 15 }) },
      { x: 32, count: 5, lift: HL.spring(0, { k: 170, c: 15 }) }
    ];

    // Build graphics holders for each tower
    towers.forEach(t => {
      // Base stud on board (revealed when tower with count 1 lifts)
      t.baseStudSol = HL.solid(svg);

      // Solids for blocks: each block gets 1 solid for cube body, 1 solid for stud
      t.blockSols = [];
      t.studSols = [];
      for (let i = 0; i < t.count; i++) {
        t.blockSols.push(HL.solid(svg));
        t.studSols.push(HL.solid(svg));
      }

      // Detach socket visuals for top block
      // 1. Socket rim at bottom face
      t.socketRimEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
      // 2. Socket cavity ceiling inside block
      t.socketDepthEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
      // 3. Vertical alignment axis guide connecting lower stud to upper socket
      t.alignGuideEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
    });

    function draw() {
      towers.forEach(t => {
        const liftZ = t.lift.x; // Detach elevation in Z
        const isDetached = liftZ > 0.5;

        // Base stud on board at (t.x, 0, z = 3)
        const [baseStudO, baseStudI] = HL.rings(t.x - 3.5, -3.5, t.x + 3.5, 3.5, 3.5, 0.6);
        if (t.count === 1 && isDetached) {
          HL.put(t.baseStudSol, HL.prism(P, front, baseStudO, baseStudI, 3, 5.5));
        } else {
          HL.put(t.baseStudSol, { sil: "", crease: "" });
        }

        // Render lower blocks (0 to count - 2)
        for (let i = 0; i < t.count - 1; i++) {
          const z0 = 3 + i * blockH;
          const z1 = z0 + blockH;

          // Block cube body (Strictly constant height blockH = 13, no volume squash)
          const [bO, bI] = HL.rings(t.x - 9, -9, t.x + 9, 9, 2, 1);
          HL.put(t.blockSols[i], HL.prism(P, front, bO, bI, z0, z1));

          // Connecting stud on block i:
          if (i === t.count - 2) {
            // Block directly beneath the detached top block:
            // Stud is revealed when top block lifts up
            if (isDetached) {
              const [sO, sI] = HL.rings(t.x - 3.5, -3.5, t.x + 3.5, 3.5, 3.5, 0.6);
              HL.put(t.studSols[i], HL.prism(P, front, sO, sI, z1, z1 + 2.5));
            } else {
              HL.put(t.studSols[i], { sil: "", crease: "" });
            }
          } else {
            // Hidden inside the block above
            HL.put(t.studSols[i], { sil: "", crease: "" });
          }
        }

        // Render Top Block (index: count - 1)
        const topIdx = t.count - 1;
        const topBaseZ = 3 + topIdx * blockH + liftZ;
        const topRoofZ = topBaseZ + blockH;

        // Top block cube body (Strictly blockH = 13)
        const [topO, topI] = HL.rings(t.x - 9, -9, t.x + 9, 9, 2, 1);
        HL.put(t.blockSols[topIdx], HL.prism(P, front, topO, topI, topBaseZ, topRoofZ));

        // Top stud of top block
        const [tsO, tsI] = HL.rings(t.x - 3.5, -3.5, t.x + 3.5, 3.5, 3.5, 0.6);
        HL.put(t.studSols[topIdx], HL.prism(P, front, tsO, tsI, topRoofZ, topRoofZ + 2.5));

        // Internal socket hole (lỗ cắm âm) at the bottom face of detached top block
        if (isDetached) {
          // Socket opening rim at bottom face (z = topBaseZ)
          const rimPts = [];
          for (let k = 0; k <= 28; k++) {
            const a = (k / 28) * Math.PI * 2;
            rimPts.push(P(t.x + 3.6 * Math.cos(a), 3.6 * Math.sin(a), topBaseZ));
          }
          t.socketRimEl.style.display = "";
          t.socketRimEl.setAttribute("d", HL.poly(rimPts));

          // Socket depth ceiling inside block (z = topBaseZ + 2.5)
          const ceilPts = [];
          for (let k = 0; k <= 28; k++) {
            const a = (k / 28) * Math.PI * 2;
            ceilPts.push(P(t.x + 3.6 * Math.cos(a), 3.6 * Math.sin(a), topBaseZ + 2.5));
          }
          t.socketDepthEl.style.display = "";
          t.socketDepthEl.setAttribute("d", HL.poly(ceilPts));

          // Vertical alignment axis between lower stud and upper socket
          const lowerStudPeakZ = t.count === 1 ? 5.5 : (3 + (t.count - 1) * blockH + 2.5);
          t.alignGuideEl.style.display = "";
          t.alignGuideEl.setAttribute(
            "d",
            HL.seg(P(t.x, 0, lowerStudPeakZ), P(t.x, 0, topBaseZ))
          );
        } else {
          t.socketRimEl.style.display = "none";
          t.socketDepthEl.style.display = "none";
          t.alignGuideEl.style.display = "none";
        }
      });

      const anyDetached = towers.some(t => t.lift.x > 1.5);
      if (anyDetached) {
        read.textContent = "1 + 3 + 5 = 9 khối (Tách rời: lộ chốt tròn & lỗ cắm âm Unifix)";
      } else {
        read.textContent = "1 + 3 + 5 = 9 khối lập phương (Bảo toàn thể tích chuẩn Unifix)";
      }
    }

    function aim(pt) {
      if (!pt) {
        towers.forEach(t => (t.lift.t = 0));
        reg.wake();
        return;
      }
      towers.forEach(t => {
        const scr = P(t.x, 0, 30);
        const dist = Math.abs(pt[0] - scr[0]);
        // Snap-lift when hovered, spring snaps back when pointer leaves
        t.lift.t = dist < 26 ? 16 : 0;
      });
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      towers.forEach(t => {
        if (HL.stepS(t.lift, dt)) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(
      HL.pointer(stage, {
        move: aim,
        leave: () => {
          towers.forEach(t => (t.lift.t = 0));
          reg.wake();
        }
      })
    );
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        // Slider sets target tower snap-lift
        const targetCount = Math.round(v);
        towers.forEach(t => {
          t.lift.t = t.count === targetCount ? 16 : 0;
        });
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
},
{
  id: "math-number-line",
  title: "5. Trục Số Nhảy Ếch (Number Line Jumps)",
  concept: "Cộng nhẩm bằng bước nhảy trục số",
  means: "Thước đo trục số: vạch chia đánh số từ 0 đến 10. Chú ếch origami với đầu mũi tên nhảy dọc cung parabol 0 -> 4 -> 7 hướng về phía trước.",
  rules: [1, 3, 5, 7, 8],
  range: [0, 4, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-58, -14, 0], [58, 14, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Ruler Body (z = 0 to 4.0)
    const [rO, rI] = HL.rings(-54, -8, 54, 8, 2, 1);
    const rulerSol = HL.solid(svg);
    HL.put(rulerSol, HL.prism(P, front, rO, rI, 0, 4.0));

    // Ticks & Number Labels 0 to 10
    const ticks = [];
    for (let i = 0; i <= 10; i++) {
      const x = -48 + i * 9.6;
      ticks.push(x);

      // Tick line on ruler surface (positioned in upper half: y = -6 to y = -1.2)
      HL.mk("line", {
        x1: P(x, -6.0, 4.0)[0], y1: P(x, -6.0, 4.0)[1],
        x2: P(x, -1.2, 4.0)[0], y2: P(x, -1.2, 4.0)[1],
        stroke: "#232327",
        "stroke-width": (i === 0 || i === 4 || i === 7 ? 1.4 : 1.0)
      }, svg);

      // Number Label 0, 1, 2, ..., 10 at lower half of ruler face
      const [tx, ty] = P(x, 3.6, 4.0);
      const textNode = HL.mk("text", {
        x: tx,
        y: ty + 4.0,
        "text-anchor": "middle",
        "font-family": "ui-monospace, monospace",
        "font-size": "7.5",
        "font-weight": (i === 0 || i === 4 || i === 7 ? "700" : "500"),
        fill: "#232327"
      }, svg);
      textNode.textContent = String(i);
    }

    // Parabolic Jump Arc 1: 0 -> 4 (+4)
    const arc1Pts = [];
    for (let s = 0; s <= 24; s++) {
      const t = s / 24;
      const x = HL.lerp(ticks[0], ticks[4], t);
      const z = 4.0 + 4 * 18 * t * (1 - t);
      arc1Pts.push(P(x, 0, z));
    }
    HL.mk("path", {
      d: HL.open(arc1Pts),
      stroke: "#6f6f78",
      "stroke-dasharray": "3 2",
      fill: "none",
      "stroke-width": 1.2
    }, svg);

    // Label "+4" above Arc 1 peak
    const apex1Scr = P((ticks[0] + ticks[4]) / 2, 0, 22.5);
    const label1 = HL.mk("text", {
      x: apex1Scr[0],
      y: apex1Scr[1] - 6,
      "text-anchor": "middle",
      "font-family": "ui-monospace, monospace",
      "font-size": "10",
      "font-weight": "700",
      fill: "#232327"
    }, svg);
    label1.textContent = "+4";

    // Parabolic Jump Arc 2: 4 -> 7 (+3)
    const arc2Pts = [];
    for (let s = 0; s <= 24; s++) {
      const t = s / 24;
      const x = HL.lerp(ticks[4], ticks[7], t);
      const z = 4.0 + 4 * 14 * t * (1 - t);
      arc2Pts.push(P(x, 0, z));
    }
    HL.mk("path", {
      d: HL.open(arc2Pts),
      stroke: "#6f6f78",
      "stroke-dasharray": "3 2",
      fill: "none",
      "stroke-width": 1.2
    }, svg);

    // Label "+3" above Arc 2 peak
    const apex2Scr = P((ticks[4] + ticks[7]) / 2, 0, 18.5);
    const label2 = HL.mk("text", {
      x: apex2Scr[0],
      y: apex2Scr[1] - 6,
      "text-anchor": "middle",
      "font-family": "ui-monospace, monospace",
      "font-size": "10",
      "font-weight": "700",
      fill: "#232327"
    }, svg);
    label2.textContent = "+3";

    // Contact shadow and vertical drop line on ruler
    const shadowEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
    const dropLineEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);

    // Origami / Vector Frog Pointer Group
    const frogG = HL.mk("g", {}, svg);
    const NUM_FACES = 7;
    const faceEls = [];
    for (let f = 0; f < NUM_FACES; f++) {
      faceEls.push(
        HL.mk("polygon", {
          fill: "#ffffff",
          stroke: "#232327",
          "stroke-width": "1.2",
          "stroke-linejoin": "round"
        }, frogG)
      );
    }
    const eyeDots = [
      HL.mk("circle", { r: 1.4, fill: "#232327" }, frogG),
      HL.mk("circle", { r: 1.4, fill: "#232327" }, frogG)
    ];

    const jumpProgress = HL.spring(0.57, { k: 110, c: 14 });

    function draw() {
      const t = jumpProgress.x;
      let x, z, dz, dx;

      if (t <= 0.57) {
        const subT = t / 0.57;
        x = HL.lerp(ticks[0], ticks[4], subT);
        z = 4.0 + 4 * 18 * subT * (1 - subT);
        dz = 72 * (1 - 2 * subT);
        dx = ticks[4] - ticks[0];
      } else {
        const subT = (t - 0.57) / 0.43;
        x = HL.lerp(ticks[4], ticks[7], subT);
        z = 4.0 + 4 * 14 * subT * (1 - subT);
        dz = 56 * (1 - 2 * subT);
        dx = ticks[7] - ticks[4];
      }

      // Smooth pitch rotation along parabolic trajectory
      const pitch = Math.atan2(dz, dx) * 0.4;
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      // Vertex transform helper (local frog space -> world -> projected screen)
      function V(lx, ly, lz) {
        const rotX = lx * cosP - lz * sinP;
        const rotZ = lx * sinP + lz * cosP;
        return P(x + rotX, ly, z + rotZ);
      }

      // Key 3D points of Origami Frog (pointing forward in +X jump direction)
      const snout = V(7.0, 0, 1.6);        // Arrowhead snout pointing along direction of jump (+X)
      const eyeL = V(3.2, -3.4, 4.6);
      const eyeR = V(3.2, 3.4, 4.6);
      const crown = V(3.8, 0, 4.2);
      const spine = V(-1.0, 0, 5.6);       // Folded dorsal ridge
      const tail = V(-6.2, 0, 1.4);        // Rear crease fold
      const flankL = V(-1.0, -5.6, 2.0);
      const flankR = V(-1.0, 5.6, 2.0);
      const kneeL = V(-3.8, -6.6, 3.4);
      const kneeR = V(-3.8, 6.6, 3.4);
      const footL = V(-6.6, -7.0, 0);
      const footR = V(-6.6, 7.0, 0);

      // Faces ordered back to front for 2:1 axonometric projection
      const faces = [
        [flankL, kneeL, footL],         // Left hind leg
        [flankR, kneeR, footR],         // Right hind leg
        [spine, flankL, tail],          // Left rear flank
        [spine, tail, flankR],          // Right rear flank
        [crown, eyeL, flankL, spine],   // Left dorsal facet
        [crown, spine, flankR, eyeR],   // Right dorsal facet
        [snout, eyeR, crown, eyeL]      // Front arrow-head snout face pointing forward
      ];

      faces.forEach((pts, i) => {
        const pointsStr = pts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" ");
        faceEls[i].setAttribute("points", pointsStr);
      });

      // Eyes
      eyeDots[0].setAttribute("cx", HL.r2(eyeL[0]));
      eyeDots[0].setAttribute("cy", HL.r2(eyeL[1]));
      eyeDots[1].setAttribute("cx", HL.r2(eyeR[0]));
      eyeDots[1].setAttribute("cy", HL.r2(eyeR[1]));

      // Contact shadow on the ruler face at z = 4.0
      const shadowPts = [];
      for (let k = 0; k <= 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        shadowPts.push(P(x + 5.5 * Math.cos(a), 3.8 * Math.sin(a), 4.0));
      }
      shadowEl.setAttribute("d", HL.poly(shadowPts));

      // Dashed vertical drop line from frog down to contact shadow
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
      if (!pt) return;
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
    bag.add(HL.pointer(stage, { move: aim, leave: () => {} }));
    bag.add(() => svg.replaceChildren());

    // Initialize
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
    concept: "Phép cộng trực quan bằng chấm đố",
    means: "Hai khối xúc xắc lập phương: mặt trên hiển thị 3 chấm và 4 chấm; di chuột để xúc xắc nghiêng xoay theo góc nhìn 3D.",
    rules: [1, 2, 4, 6, 9],
    range: [0, 3.5, 7],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-48, -22, 0], [48, 22, 38]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Felt Gaming Mat Base
      const [matO, matI] = HL.rings(-44, -18, 44, 18, 4, 1.5);
      const matSol = HL.solid(svg);
      HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2));

      // Dice Groups
      const d1Group = HL.mk("g", { id: "die-1" }, svg);
      const d2Group = HL.mk("g", { id: "die-2" }, svg);

      // Faces for Die 1: Front-Right (+X), Front-Left (+Y), Top (+Z)
      const d1FaceX = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d1Group);
      const d1FaceY = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d1Group);
      const d1FaceZ = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d1Group);

      // Faces for Die 2: Front-Right (+X), Front-Left (+Y), Top (+Z)
      const d2FaceX = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d2Group);
      const d2FaceY = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d2Group);
      const d2FaceZ = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d2Group);

      // Pips: Die 1 has Top(3), Left(1), Right(2) -> 6 pips
      const d1Pips = [];
      for (let i = 0; i < 6; i++) {
        d1Pips.push(HL.mk("path", { style: "fill: #232327; stroke: none;" }, d1Group));
      }

      // Pips: Die 2 has Top(4), Left(5), Right(6) -> 15 pips
      const d2Pips = [];
      for (let i = 0; i < 15; i++) {
        d2Pips.push(HL.mk("path", { style: "fill: #232327; stroke: none;" }, d2Group));
      }

      // 3D Springs for tilt/wobble and lift
      const wobbleX1 = HL.spring(0, { k: 120, c: 14 });
      const wobbleY1 = HL.spring(0, { k: 120, c: 14 });
      const lift1 = HL.spring(0, { k: 130, c: 15 });

      const wobbleX2 = HL.spring(0, { k: 120, c: 14 });
      const wobbleY2 = HL.spring(0, { k: 120, c: 14 });
      const lift2 = HL.spring(0, { k: 130, c: 15 });

      // 3D Rotation helper around cube center
      function rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz) {
        const rx = HL.rad(rxDeg);
        const ry = HL.rad(ryDeg);
        // Roll around Y
        const x1 = lx * Math.cos(ry) + lz * Math.sin(ry);
        const y1 = ly;
        const z1 = -lx * Math.sin(ry) + lz * Math.cos(ry);
        // Pitch around X
        const x2 = x1;
        const y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
        const z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
        return [cx + x2, cy + y2, cz + z2];
      }

      // Project a 3D circular pip in local plane coordinates to screen path
      // normalAxis: 'z' (top), 'y' (front-left), 'x' (front-right)
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
          } else { // 'x'
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

        // 8 Corners of the rotated cube
        const c_000 = rotatePoint(-s, -s, -s, rxDeg, ryDeg, cx, 0, cz);
        const c_100 = rotatePoint( s, -s, -s, rxDeg, ryDeg, cx, 0, cz);
        const c_010 = rotatePoint(-s,  s, -s, rxDeg, ryDeg, cx, 0, cz);
        const c_110 = rotatePoint( s,  s, -s, rxDeg, ryDeg, cx, 0, cz);
        const c_001 = rotatePoint(-s, -s,  s, rxDeg, ryDeg, cx, 0, cz);
        const c_101 = rotatePoint( s, -s,  s, rxDeg, ryDeg, cx, 0, cz);
        const c_011 = rotatePoint(-s,  s,  s, rxDeg, ryDeg, cx, 0, cz);
        const c_111 = rotatePoint( s,  s,  s, rxDeg, ryDeg, cx, 0, cz);

        // 1. Front-Right face (+X): c_100 -> c_110 -> c_111 -> c_101
        const ptsX = [P(...c_100), P(...c_110), P(...c_111), P(...c_101)];
        faceX.setAttribute("points", ptsX.map(p => p.map(HL.r2).join(",")).join(" "));

        // 2. Front-Left face (+Y): c_010 -> c_110 -> c_111 -> c_011
        const ptsY = [P(...c_010), P(...c_110), P(...c_111), P(...c_011)];
        faceY.setAttribute("points", ptsY.map(p => p.map(HL.r2).join(",")).join(" "));

        // 3. Top face (+Z): c_001 -> c_101 -> c_111 -> c_011
        const ptsZ = [P(...c_001), P(...c_101), P(...c_111), P(...c_011)];
        faceZ.setAttribute("points", ptsZ.map(p => p.map(HL.r2).join(",")).join(" "));

        // Render each pip projected onto its respective tilted face
        let pipIdx = 0;
        pipConfig.forEach(cfg => {
          const pathStr = projectPip(cfg.u, cfg.v, cfg.r, cfg.axis, rxDeg, ryDeg, cx, 0, cz);
          pips[pipIdx].setAttribute("d", pathStr);
          pipIdx++;
        });
      }

      // Standard Pip Positions on a 20x20 face
      const d = 5.2;
      const rStandard = 1.55;
      const rCenter = 1.75;

      // Die 1: Top=3 (axis z), Left=1 (axis y), Right=2 (axis x)
      const d1Config = [
        // Right face (+X): 2 pips
        { axis: 'x', u: -d, v:  d, r: rStandard },
        { axis: 'x', u:  d, v: -d, r: rStandard },
        // Left face (+Y): 1 pip
        { axis: 'y', u:  0, v:  0, r: rCenter },
        // Top face (+Z): 3 pips
        { axis: 'z', u: -d, v: -d, r: rStandard },
        { axis: 'z', u:  0, v:  0, r: rCenter },
        { axis: 'z', u:  d, v:  d, r: rStandard }
      ];

      // Die 2: Top=4 (axis z), Left=5 (axis y), Right=6 (axis x)
      const d2Config = [
        // Right face (+X): 6 pips
        { axis: 'x', u: -d, v: -d, r: rStandard },
        { axis: 'x', u:  d, v: -d, r: rStandard },
        { axis: 'x', u: -d, v:  0, r: rStandard },
        { axis: 'x', u:  d, v:  0, r: rStandard },
        { axis: 'x', u: -d, v:  d, r: rStandard },
        { axis: 'x', u:  d, v:  d, r: rStandard },
        // Left face (+Y): 5 pips
        { axis: 'y', u: -d, v: -d, r: rStandard },
        { axis: 'y', u:  d, v: -d, r: rStandard },
        { axis: 'y', u:  0, v:  0, r: rCenter },
        { axis: 'y', u: -d, v:  d, r: rStandard },
        { axis: 'y', u:  d, v:  d, r: rStandard },
        // Top face (+Z): 4 pips
        { axis: 'z', u: -d, v: -d, r: rStandard },
        { axis: 'z', u:  d, v: -d, r: rStandard },
        { axis: 'z', u: -d, v:  d, r: rStandard },
        { axis: 'z', u:  d, v:  d, r: rStandard }
      ];

      function draw() {
        const baseZ1 = 2 + lift1.x;
        const baseZ2 = 2 + lift2.x;

        drawDie(-22, baseZ1, wobbleX1.x, wobbleY1.x, d1FaceX, d1FaceY, d1FaceZ, d1Pips, d1Config);
        drawDie( 22, baseZ2, wobbleX2.x, wobbleY2.x, d2FaceX, d2FaceY, d2FaceZ, d2Pips, d2Config);

        read.textContent = "Xúc xắc 3D: Mặt trên 3 + 4 = 7 (Tổng 2 mặt đối diện = 7)";
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

        const dist1 = Math.hypot(pt[0] - p1Scr[0], pt[1] - p1Scr[1]);
        const dist2 = Math.hypot(pt[0] - p2Scr[0], pt[1] - p2Scr[1]);

        if (dist1 < 45) {
          wobbleX1.t = HL.clamp((pt[1] - p1Scr[1]) * 0.35, -8, 8);
          wobbleY1.t = HL.clamp(-(pt[0] - p1Scr[0]) * 0.35, -8, 8);
          lift1.t = 2.5;
        } else {
          wobbleX1.t = 0; wobbleY1.t = 0; lift1.t = 0;
        }

        if (dist2 < 45) {
          wobbleX2.t = HL.clamp((pt[1] - p2Scr[1]) * 0.35, -8, 8);
          wobbleY2.t = HL.clamp(-(pt[0] - p2Scr[0]) * 0.35, -8, 8);
          lift2.t = 2.5;
        } else {
          wobbleX2.t = 0; wobbleY2.t = 0; lift2.t = 0;
        }

        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const m1 = HL.stepS(wobbleX1, dt) || HL.stepS(wobbleY1, dt) || HL.stepS(lift1, dt);
        const m2 = HL.stepS(wobbleX2, dt) || HL.stepS(wobbleY2, dt) || HL.stepS(lift2, dt);
        draw();
        return m1 || m2;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) {
          const t = (v - 3.5) / 3.5;
          wobbleY1.t = t * 7;
          wobbleY2.t = -t * 7;
          lift1.t = Math.abs(t) * 2;
          lift2.t = Math.abs(t) * 2;
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
  },
{
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

      function setSplit(splitIdx) {
        const s = HL.clamp(splitIdx, 0, 10);
        beads.forEach((b, i) => {
          if (i < s) {
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
      bag.add(HL.pointer(stage, { move: aim, leave: () => {} }));
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
