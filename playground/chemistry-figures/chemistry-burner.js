/*
 * 2. Alcohol Burner & Thermal Decomposition (Đèn Cồn & Ống Nghiệm Đun Nóng)
 * Chemical Concept: Phản ứng nhiệt phân & Chuyển pha:
 *   - Nhiệt lượng cung cấp: Q = m·c·Δt; Nhiệt độ tăng từ 25°C đến 100°C.
 *   - Khi t° ≥ 80°C: Năng lượng vượt qua hoạt hóa, phản ứng phân hủy sinh khí mãnh liệt:
 *     2KMnO₄ (rắn tím) ──t°──> K₂MnO₄ + MnO₂ + O₂↑ (Khí oxy thoát ra miệng ống).
 * Geometry: Đèn cồn thủy tinh tròn dẹp có bấc cháy, ngọn lửa hình giọt nhọn axonometric,
 *   giá sắt kẹp ống nghiệm nghiêng 45°, ống nghiệm đặc opaque chứa hóa chất và bọt khí sủi tăm.
 * Kinematics: Di chuột điều chỉnh độ lớn ngọn lửa đèn cồn; ngọn lửa bập bùng sinh động,
 *   nhiệt độ tăng vọt, bọt khí trong lòng ống nghiệm nổi lên liên tục và kích hoạt trạng thái phản ứng .hi.
 */

export default {
  id: "chemistry-burner",
  title: "2. Đèn Cồn & Ống Nghiệm (Burner & Heating)",
  concept: "Nhiệt phân hóa học: 2KMnO₄ ──t°──> K₂MnO₄ + MnO₂ + O₂↑ · Động học phản ứng theo nhiệt độ",
  means: "Di chuột đẩy ngọn lửa đèn cồn tiếp cận đáy ống nghiệm. Khi nhiệt độ vượt ngưỡng kích hoạt (t° ≥ 80°C), phản ứng nhiệt phân bùng nổ, bọt khí oxy sủi tăm mãnh liệt thoát ra miệng ống nghiệm.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 60, 100],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Lab Table Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // Stand Rod at (+20, 0, 2.5 to 36)
    const rodSol = HL.solid(svg);
    HL.put(rodSol, HL.prism(P, front, HL.circ(1.8, 16), HL.circ(1.4, 16), 2.5, 36, [20, 0]));

    // Clamp holding test tube at (+20, 0, 22) -> (6, 0, 22)
    const clampSol = HL.solid(svg);
    const [clO, clI] = HL.rings(6, -1.2, 20, 1.2, 0.5, 0.2);
    HL.put(clampSol, HL.prism(P, front, clO, clI, 21.0, 23.0));

    // 2. Alcohol Burner sitting at (-8, 0, 2.5)
    const burnerCenter = [-8, 0];
    const burnerSol = HL.solid(svg);
    // Squat glass jar (radius 8.0, height 5.5)
    HL.put(burnerSol, HL.prism(P, front, HL.circ(7.5, 24), HL.circ(6.8, 24), 2.5, 7.5, burnerCenter));

    // Wick collar cylinder (radius 2.8, Z: 7.5 to 9.5)
    const collarSol = HL.solid(svg);
    HL.put(collarSol, HL.prism(P, front, HL.circ(2.8, 16), HL.circ(2.2, 16), 7.5, 9.5, burnerCenter));

    // 3. Flame Shape
    const flameGroup = HL.mk("g", {}, svg);
    const flameOuter = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flameGroup);
    const flameCore = HL.mk("path", { class: "lo", "stroke-width": 1.0, fill: "none" }, flameGroup);

    // 4. Inclined Test Tube (Ống nghiệm nghiêng 45 độ, đặc 100% opaque)
    const cos45 = Math.cos(Math.PI / 4);
    const sin45 = Math.sin(Math.PI / 4);
    const tubeR = 2.4;
    const bCenter = [-8.0, 0, 10.5]; // Bottom spherical cap center
    const mouthDist = 30.0;
    const mCenter = [bCenter[0] + mouthDist * cos45, 0, bCenter[2] + mouthDist * sin45];

    const tubeGroup = HL.mk("g", {}, svg);
    const tubeSol = HL.solid(tubeGroup);
    const tubeLiquid = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, tubeGroup);

    // Build solid test tube geometry
    const bL = P(bCenter[0] - tubeR * sin45, 0, bCenter[2] + tubeR * cos45);
    const bR = P(bCenter[0] + tubeR * sin45, 0, bCenter[2] - tubeR * cos45);
    const mL = P(mCenter[0] - tubeR * sin45, 0, mCenter[2] + tubeR * cos45);
    const mR = P(mCenter[0] + tubeR * sin45, 0, mCenter[2] - tubeR * cos45);
    const bBottom = P(bCenter[0] - tubeR * cos45, 0, bCenter[2] - tubeR * sin45);

    // Mouth ellipse
    const mouthPts = [];
    for (let a = 0; a < 20; a++) {
      const ang = (a * 2 * Math.PI) / 20;
      const ox = -tubeR * Math.cos(ang) * sin45;
      const oy = tubeR * Math.sin(ang);
      const oz = tubeR * Math.cos(ang) * cos45;
      mouthPts.push(P(mCenter[0] + ox, oy, mCenter[2] + oz));
    }

    const tubeD = `M ${HL.r2(bL[0])} ${HL.r2(bL[1])} Q ${HL.r2(bBottom[0])} ${HL.r2(bBottom[1])} ${HL.r2(bR[0])} ${HL.r2(bR[1])} L ${HL.r2(mR[0])} ${HL.r2(mR[1])} L ${HL.r2(mL[0])} ${HL.r2(mL[1])} Z`;
    HL.put(tubeSol, { sil: tubeD + " " + HL.poly(mouthPts), crease: "" });

    // Rising Bubbles inside test tube
    const bubblesGroup = HL.mk("g", { class: "hi" }, tubeGroup);
    const bubbleCircles = [];
    for (let b = 0; b < 5; b++) {
      const circ = HL.mk("circle", { r: 0.9, class: "dot", opacity: 0 }, bubblesGroup);
      bubbleCircles.push(circ);
    }

    // Kinematics Springs
    const initialHeat = initialV != null ? initialV : 60;
    const spHeat = HL.spring(initialHeat, { k: 120, c: 14 });
    let animTime = 0;

    function draw() {
      const heat = spHeat.x; // 0 to 100%
      const isActive = heat >= 80;

      // A. Flame flickers properly in 3D projection
      const flameH = 4.0 + (heat / 100.0) * 8.5;
      const flameW = 2.0 + (heat / 100.0) * 3.0;
      const flicker = Math.sin(animTime * 8) * 0.4;
      const fBaseZ = 9.5;
      const fTipZ = fBaseZ + flameH;

      const fP0 = P(burnerCenter[0] - flameW, 0, fBaseZ);
      const fP1 = P(burnerCenter[0] + flameW, 0, fBaseZ);
      const fTip = P(burnerCenter[0] + flicker, 0, fTipZ);
      const fMidL = P(burnerCenter[0] - flameW * 1.1, 0, fBaseZ + flameH * 0.5);
      const fMidR = P(burnerCenter[0] + flameW * 1.1, 0, fBaseZ + flameH * 0.5);

      flameOuter.setAttribute("d", `M ${HL.r2(fP0[0])} ${HL.r2(fP0[1])} Q ${HL.r2(fMidL[0])} ${HL.r2(fMidL[1])} ${HL.r2(fTip[0])} ${HL.r2(fTip[1])} Q ${HL.r2(fMidR[0])} ${HL.r2(fMidR[1])} ${HL.r2(fP1[0])} ${HL.r2(fP1[1])} Z`);

      // Core flame properly projected:
      const cP0 = P(burnerCenter[0] - flameW * 0.5, 0, fBaseZ);
      const cP1 = P(burnerCenter[0] + flameW * 0.5, 0, fBaseZ);
      const cTip = P(burnerCenter[0] + flicker * 0.6, 0, fBaseZ + flameH * 0.65);
      const cMidL = P(burnerCenter[0] - flameW * 0.6, 0, fBaseZ + flameH * 0.3);
      const cMidR = P(burnerCenter[0] + flameW * 0.6, 0, fBaseZ + flameH * 0.3);

      flameCore.setAttribute("d", `M ${HL.r2(cP0[0])} ${HL.r2(cP0[1])} Q ${HL.r2(cMidL[0])} ${HL.r2(cMidL[1])} ${HL.r2(cTip[0])} ${HL.r2(cTip[1])} Q ${HL.r2(cMidR[0])} ${HL.r2(cMidR[1])} ${HL.r2(cP1[0])} ${HL.r2(cP1[1])}`);

      flameOuter.classList.toggle("hi", heat > 40);

      // B. Liquid Column inside tube
      const liqLen = 13.0;
      const liqCenter = [bCenter[0] + liqLen * cos45, 0, bCenter[2] + liqLen * sin45];
      const liqPts = [];
      for (let a = 0; a < 20; a++) {
        const ang = (a * 2 * Math.PI) / 20;
        const ox = -tubeR * Math.cos(ang) * sin45;
        const oy = tubeR * Math.sin(ang);
        const oz = tubeR * Math.cos(ang) * cos45;
        liqPts.push(P(liqCenter[0] + ox, oy, liqCenter[2] + oz));
      }
      tubeLiquid.setAttribute("d", HL.poly(liqPts));
      tubeLiquid.classList.toggle("hi", isActive);

      // C. Rising Bubbles
      bubbleCircles.forEach((circ, idx) => {
        if (!isActive) {
          circ.setAttribute("opacity", 0);
          return;
        }
        circ.setAttribute("opacity", 1);
        const progress = (animTime * 1.5 + idx * 0.22) % 1.0;
        const bPosLen = 3.0 + progress * 9.5;
        const bX = bCenter[0] + bPosLen * cos45 + (Math.sin(animTime * 6 + idx) * 0.7);
        const bZ = bCenter[2] + bPosLen * sin45;
        const bPt = P(bX, 0, bZ);
        circ.setAttribute("cx", HL.r2(bPt[0]));
        circ.setAttribute("cy", HL.r2(bPt[1]));
      });

      // D. Temperature & Reaction Header
      const temp = 25 + (heat / 100.0) * 75;
      const tStr = HL.r2(temp);
      if (isActive) {
        read.textContent = `Nhiệt phân: t° = ${tStr}°C ≥ 80°C · SÔI & THOÁT KHÍ O₂: 2KMnO₄ ──t°──> K₂MnO₄ + MnO₂ + O₂↑ (.hi)`;
      } else {
        read.textContent = `Nhiệt phân: t° = ${tStr}°C < 80°C · Cung cấp nhiệt lượng Q = m·c·Δt (Đang gia nhiệt)`;
      }
    }

    function setHeat(h) {
      spHeat.t = HL.clamp(h, 0, 100);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setHeat(60.0);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setHeat(norm * 100.0);
    }

    const reg = HL.register(stage, dt => {
      animTime += dt;
      const moving = HL.stepS(spHeat, dt);
      draw();
      return moving || spHeat.x >= 75;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setHeat(Number(v));
      },
      destroy: bag.dispose
    };
  }
};
