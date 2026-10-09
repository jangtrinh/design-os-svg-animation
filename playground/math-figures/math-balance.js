/*
 * 2. Math Balance Scale (Cân Thăng Bằng Số Học)
 * Authentic Meaningful Interaction: Direct Weight Drop / Removal Driving Real Equilibrium Physics
 * Left tray has 3 weights. Right tray starts with 2 weights (3 > 2, left heavy).
 * Clicking right tray / reserve weight adds a 3rd weight: beam oscillates & levels out at 3 = 3!
 */

export default {
  id: "math-balance",
  title: "2. Cân Thăng Bằng (Balance Scale)",
  concept: "So sánh lớn hơn, bé hơn, bằng nhau (3 > 2, 3 = 3, 3 < 4)",
  means: "Cân thăng bằng đo khối lượng: đĩa trái có 3 quả cân, đĩa phải có 2 quả cân (cân lệch trái); click vào đĩa phải hoặc quả cân dự trữ để thả thêm quả cân vào, dầm cân dao động lò xo rồi tự động thăng bằng 3 = 3.",
  rules: [1, 3, 4, 6, 7],
  range: [2, 3, 4],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-62, -22, 0], [62, 22, 60]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Base Pedestal
    const [baseO, baseI] = HL.rings(-24, -20, 24, 20, 4, 2);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 6));

    // Reserve weight stand on right side of desk (X: 34 to 46, Y: -6 to 6, Z: 0 to 2)
    const [resO, resI] = HL.rings(32, -8, 48, 8, 3, 0.8);
    const resBaseSol = HL.solid(svg);
    HL.put(resBaseSol, HL.prism(P, front, resO, resI, 0, 2.5));

    const resLabelPt = P(40, -11, 2.6);
    const resText = HL.mk("text", {
      x: resLabelPt[0], y: resLabelPt[1],
      fill: "#6f6f78", "font-size": "8px", "font-family": "ui-monospace, monospace",
      "text-anchor": "middle", "font-weight": "600"
    }, svg);
    resText.textContent = "+ BỎ THÊM";

    // 2. Vertical Mast Post
    const [mastO, mastI] = HL.rings(-4, -4, 4, 4, 4, 0.8);
    const mastSol = HL.solid(svg);
    HL.put(mastSol, HL.prism(P, front, mastO, mastI, 6, 40));

    // 3. Triangular Fulcrum Bracket & Axle Pin
    const fulcrumSol = HL.solid(svg);
    const [fO, fI] = HL.rings(-5, -3, 5, 3, 2, 0.6);
    HL.put(fulcrumSol, HL.prism(P, front, fO, fI, 39, 42));

    // 4. Trays Solids
    const leftTraySol = HL.solid(svg);
    const rightTraySol = HL.solid(svg);

    // Shallow Rims for Trays
    const leftRim = HL.mk("ellipse", { rx: HL.r2(11 * C.S), ry: HL.r2(11 * C.S * C.k), class: "lo nf" }, svg);
    const rightRim = HL.mk("ellipse", { rx: HL.r2(11 * C.S), ry: HL.r2(11 * C.S * C.k), class: "lo nf" }, svg);

    // Weights: 3 left + up to 4 right + 1 reserve = up to 7 weights
    const maxWeights = 7;
    const weightSols = Array.from({ length: maxWeights }, () => HL.solid(svg));
    const weightKnobs = Array.from({ length: maxWeights }, () => HL.mk("circle", { r: 1.5, fill: "#232327" }, svg));

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

    // State: number of weights on right tray (2, 3, or 4)
    let wRight = initialV !== undefined ? Math.round(HL.clamp(initialV, 2, 4)) : 2;

    // Harmonic spring for beam tilt driven purely by weight torque difference (wRight - 3)
    const tilt = HL.spring((wRight - 3) * 7.5, { k: 90, c: 10, m: 1.2 });

    function draw() {
      const rad = HL.rad(tilt.x);
      const span = 46;
      const halfW = 2.2;
      const halfH = 2.0;
      const pivotZ = 42;

      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);

      function bPt(lx, ly, lz) {
        const wx = lx * cosA - lz * sinA;
        const wy = ly;
        const wz = pivotZ + lx * sinA + lz * cosA;
        return [wx, wy, wz];
      }

      // 8 Corners of the 3D Box Beam
      const c_L_Bk_B = bPt(-span, -halfW, -halfH);
      const c_L_Bk_T = bPt(-span, -halfW,  halfH);
      const c_L_Fr_T = bPt(-span,  halfW,  halfH);
      const c_L_Fr_B = bPt(-span,  halfW, -halfH);
      const c_R_Bk_B = bPt( span, -halfW, -halfH);
      const c_R_Bk_T = bPt( span, -halfW,  halfH);
      const c_R_Fr_T = bPt( span,  halfW,  halfH);
      const c_R_Fr_B = bPt( span,  halfW, -halfH);

      // Beam Faces
      beamFront.setAttribute("points", [c_L_Fr_B, c_R_Fr_B, c_R_Fr_T, c_L_Fr_T].map(p => P(p[0], p[1], p[2]).join(",")).join(" "));
      beamRight.setAttribute("points", [c_R_Fr_B, c_R_Bk_B, c_R_Bk_T, c_R_Fr_T].map(p => P(p[0], p[1], p[2]).join(",")).join(" "));
      beamTop.setAttribute("points", [c_L_Fr_T, c_R_Fr_T, c_R_Bk_T, c_L_Bk_T].map(p => P(p[0], p[1], p[2]).join(",")).join(" "));

      const pScr = P(0, halfW + 0.1, pivotZ);
      pivotPin.setAttribute("cx", HL.r2(pScr[0]));
      pivotPin.setAttribute("cy", HL.r2(pScr[1]));

      // Suspension Hooks
      const hookPtL = bPt(-span, 0, -halfH);
      const hookPtR = bPt( span, 0, -halfH);
      const scrHookL = P(hookPtL[0], hookPtL[1], hookPtL[2]);
      const scrHookR = P(hookPtR[0], hookPtR[1], hookPtR[2]);
      hookPinL.setAttribute("cx", HL.r2(scrHookL[0])); hookPinL.setAttribute("cy", HL.r2(scrHookL[1]));
      hookPinR.setAttribute("cx", HL.r2(scrHookR[0])); hookPinR.setAttribute("cy", HL.r2(scrHookR[1]));

      const trayDrop = 22;
      const trayR = 11;
      const bridleAngles = [0, 2 * Math.PI / 3, 4 * Math.PI / 3];

      // Left Tray (always 3 weights)
      const leftTrayZ = hookPtL[2] - trayDrop;
      const leftTrayX = hookPtL[0];
      const [ltO, ltI] = HL.rings(leftTrayX - 13, -13, leftTrayX + 13, 13, 13, 1.5);
      HL.put(leftTraySol, HL.prism(P, front, ltO, ltI, leftTrayZ, leftTrayZ + 2.2));

      const ltCenterScr = P(leftTrayX, 0, leftTrayZ + 2.2);
      leftRim.setAttribute("cx", HL.r2(ltCenterScr[0]));
      leftRim.setAttribute("cy", HL.r2(ltCenterScr[1]));

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

      // Right Tray
      const rightTrayZ = hookPtR[2] - trayDrop;
      const rightTrayX = hookPtR[0];
      const [rtO, rtI] = HL.rings(rightTrayX - 13, -13, rightTrayX + 13, 13, 13, 1.5);
      HL.put(rightTraySol, HL.prism(P, front, rtO, rtI, rightTrayZ, rightTrayZ + 2.2));

      const rtCenterScr = P(rightTrayX, 0, rightTrayZ + 2.2);
      rightRim.setAttribute("cx", HL.r2(rtCenterScr[0]));
      rightRim.setAttribute("cy", HL.r2(rtCenterScr[1]));

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

      // --- 3 Weights on Left Tray ---
      const wLeftPos = [
        [leftTrayX - 4.5, -3.2, leftTrayZ + 2.2],
        [leftTrayX + 4.5, -3.2, leftTrayZ + 2.2],
        [leftTrayX, 4.0, leftTrayZ + 2.2]
      ];
      wLeftPos.forEach((pos, idx) => {
        const [wO, wI] = HL.rings(pos[0] - 3.5, pos[1] - 3.5, pos[0] + 3.5, pos[1] + 3.5, 3.5, 0.6);
        HL.put(weightSols[idx], HL.prism(P, front, wO, wI, pos[2], pos[2] + 6));
        const knobPt = P(pos[0], pos[1], pos[2] + 6.3);
        weightKnobs[idx].setAttribute("cx", HL.r2(knobPt[0]));
        weightKnobs[idx].setAttribute("cy", HL.r2(knobPt[1]));
      });

      // --- Weights on Right Tray (2, 3, or 4) ---
      let wRightPos = [];
      if (wRight === 2) {
        wRightPos = [
          [rightTrayX - 4.2, 0, rightTrayZ + 2.2],
          [rightTrayX + 4.2, 0, rightTrayZ + 2.2]
        ];
      } else if (wRight === 3) {
        wRightPos = [
          [rightTrayX - 4.5, -3.2, rightTrayZ + 2.2],
          [rightTrayX + 4.5, -3.2, rightTrayZ + 2.2],
          [rightTrayX, 4.0, rightTrayZ + 2.2]
        ];
      } else {
        wRightPos = [
          [rightTrayX - 4.5, -4.5, rightTrayZ + 2.2],
          [rightTrayX + 4.5, -4.5, rightTrayZ + 2.2],
          [rightTrayX - 4.5,  4.5, rightTrayZ + 2.2],
          [rightTrayX + 4.5,  4.5, rightTrayZ + 2.2]
        ];
      }

      // Render right tray weights (indices 3 to 3 + wRight - 1)
      for (let i = 0; i < 4; i++) {
        const solIdx = 3 + i;
        if (i < wRightPos.length) {
          weightSols[solIdx].g.style.display = "";
          weightKnobs[solIdx].style.display = "";
          const pos = wRightPos[i];
          const [wO, wI] = HL.rings(pos[0] - 3.5, pos[1] - 3.5, pos[0] + 3.5, pos[1] + 3.5, 3.5, 0.6);
          HL.put(weightSols[solIdx], HL.prism(P, front, wO, wI, pos[2], pos[2] + 6));
          const knobPt = P(pos[0], pos[1], pos[2] + 6.3);
          weightKnobs[solIdx].setAttribute("cx", HL.r2(knobPt[0]));
          weightKnobs[solIdx].setAttribute("cy", HL.r2(knobPt[1]));
        } else {
          weightSols[solIdx].g.style.display = "none";
          weightKnobs[solIdx].style.display = "none";
        }
      }

      // --- Reserve Weight on desk stand (Index 6) ---
      // When wRight < 4, a reserve weight sits on the desk stand at X=40, Y=0, Z=2.5
      const reserveSolIdx = 6;
      if (wRight < 4) {
        weightSols[reserveSolIdx].g.style.display = "";
        weightKnobs[reserveSolIdx].style.display = "";
        const [rwO, rwI] = HL.rings(40 - 3.5, -3.5, 40 + 3.5, 3.5, 3.5, 0.6);
        HL.put(weightSols[reserveSolIdx], HL.prism(P, front, rwO, rwI, 2.5, 8.5));
        const rKnobPt = P(40, 0, 8.8);
        weightKnobs[reserveSolIdx].setAttribute("cx", HL.r2(rKnobPt[0]));
        weightKnobs[reserveSolIdx].setAttribute("cy", HL.r2(rKnobPt[1]));
      } else {
        weightSols[reserveSolIdx].g.style.display = "none";
        weightKnobs[reserveSolIdx].style.display = "none";
      }

      // Pedagogical Readout based on actual weights
      if (wRight === 2) {
        read.textContent = "Bên trái nặng hơn: 3 > 2 (Cân lệch trái · Click để thêm quả cân)";
      } else if (wRight === 3) {
        read.textContent = "Thăng bằng hoàn hảo: 3 = 3 (Hai bên bằng nhau!)";
      } else {
        read.textContent = "Bên phải nặng hơn: 3 < 4 (Cân lệch phải · Click để bớt)";
      }
    }

    function toggleWeight() {
      // Cycle: 2 -> 3 -> 4 -> 2
      wRight = wRight === 2 ? 3 : (wRight === 3 ? 4 : 2);
      tilt.t = (wRight - 3) * 7.5;
      reg.wake();
    }

    function handleClick(e) {
      toggleWeight();
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(tilt, dt);
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
        wRight = Math.round(HL.clamp(v, 2, 4));
        tilt.t = (wRight - 3) * 7.5;
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
