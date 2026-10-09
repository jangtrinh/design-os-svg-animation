export default {
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
  };
