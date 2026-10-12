/*
 * 5 Chemistry Figures Definitions (Hairline 2:1 Axonometric Standard)
 * Modularized Architecture - Auto-bundled
 */

if (typeof HL !== "undefined" && HL.inject) {
  HL.inject(document);
}

const CHEMISTRY_FIGURES = [
/*
 * 1. Acid-Base Titration & Buret (Chuẩn Độ Axit - Bazơ & Buret)
 * Chemical Concept: Phản ứng trung hòa H⁺ + OH⁻ → H₂O:
 *   - Nồng độ C_HCl = 0.1 M, V_HCl = 20.0 mL trong bình tam giác.
 *   - Nhỏ từ từ dung dịch chuẩn NaOH 0.1 M từ buret xuống.
 *   - Điểm tương đương: V_NaOH = 20.0 mL (pH = 7.0).
 *   - Khi V_NaOH ≥ 20.0 mL: Dư một lượng vết OH⁻ làm phenolphtalein chuyển sang màu hồng bền (.hi).
 * Geometry: Đế giá sắt thí nghiệm, thanh đứng, kẹp giữ buret thủy tinh chia vạch,
 *   khóa van buret, giọt rơi, bình tam giác Erlenmeyer đặc đáy rộng (100% opaque).
 * Kinematics: Di chuột điều chỉnh khóa buret; thể tích xả NaOH tăng từ 0 đến 25 mL,
 *   mực chất lỏng buret hạ thấp, khi đạt 20.0 mL chất lỏng bình tam giác kích hoạt .hi rực rỡ.
 */

{
  id: "chemistry-titration",
  title: "1. Chuẩn Độ Axit - Bazơ (Acid-Base Titration)",
  concept: "Phản ứng trung hòa: H⁺ + OH⁻ → H₂O · Điểm tương đương pH = 7.0 (Chỉ thị phenolphtalein)",
  means: "Di chuột điều khiển xả dung dịch chuẩn NaOH từ buret xuống bình tam giác. Khi thể tích đạt đúng 20.0 mL (điểm tương đương), dung dịch lập tức đổi màu hồng cánh sen báo hiệu kết thúc chuẩn độ.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 10, 25],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 40]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Lab Stand Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // Stand Vertical Rod at (-18, 0, 2.5 to 38)
    const rodSol = HL.solid(svg);
    HL.put(rodSol, HL.prism(P, front, HL.circ(1.8, 16), HL.circ(1.4, 16), 2.5, 38, [-18, 0]));

    // Clamp Arm from rod (-18, 0, 26) to buret holder (0, 0, 26)
    const clampSol = HL.solid(svg);
    const [clO, clI] = HL.rings(-18, -1.2, 0, 1.2, 0.5, 0.2);
    HL.put(clampSol, HL.prism(P, front, clO, clI, 25.0, 27.0));

    // 2. Erlenmeyer Flask sitting at (0, 0, 2.5) - Solid Opaque Frustum
    const flaskGroup = HL.mk("g", {}, svg);
    const flaskBody = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);
    const flaskTopFace = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);
    const flaskLiquid = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);

    const flaskBaseR = 8.8;
    const flaskNeckR = 3.2;

    // Erlenmeyer 3D solid construction
    // Bottom points from theta = 135 deg to -45 deg (counter-clockwise)
    function buildFlaskPath() {
      const bPts = [];
      const N = 24;
      // Bottom front arc: from a = 9 (135 deg) down to -3 (-45 deg)
      for (let i = 0; i <= 12; i++) {
        const ang = (135 - i * 15) * Math.PI / 180;
        bPts.push(P(flaskBaseR * Math.cos(ang), flaskBaseR * Math.sin(ang), 2.5));
      }
      // Top neck front arc: from -45 deg to 135 deg
      const tPts = [];
      for (let i = 0; i <= 12; i++) {
        const ang = (-45 + i * 15) * Math.PI / 180;
        tPts.push(P(flaskNeckR * Math.cos(ang), flaskNeckR * Math.sin(ang), 10.5));
      }
      const allBodyPts = [...bPts, ...tPts];
      flaskBody.setAttribute("d", HL.poly(allBodyPts));

      // Neck top rim ellipse
      const rimPts = [];
      for (let a = 0; a < N; a++) {
        const ang = (a * 2 * Math.PI) / N;
        rimPts.push(P(flaskNeckR * Math.cos(ang), flaskNeckR * Math.sin(ang), 10.5));
      }
      flaskTopFace.setAttribute("d", HL.poly(rimPts));
    }
    buildFlaskPath();

    // 3. Glass Buret (Vertical cylinder at 0, 0, Z: 14 to 38)
    const buretGroup = HL.mk("g", {}, svg);
    const buretSol = HL.solid(buretGroup);
    const buretR = 2.4;
    HL.put(buretSol, HL.prism(P, front, HL.circ(buretR, 20), HL.circ(buretR - 0.4, 20), 14.5, 37.5));

    // Graduation scale ticks along buret front
    for (let gz = 16.5; gz <= 35.5; gz += 1.5) {
      const isMajor = (gz - 16.5) % 3 === 0;
      const tLen = isMajor ? 1.6 : 0.9;
      const ptA = P(buretR * Math.cos(0.5), buretR * Math.sin(0.5), gz);
      const ptB = P((buretR - tLen) * Math.cos(0.5), (buretR - tLen) * Math.sin(0.5), gz);
      HL.mk("line", {
        x1: HL.r2(ptA[0]), y1: HL.r2(ptA[1]),
        x2: HL.r2(ptB[0]), y2: HL.r2(ptB[1]),
        class: "lo", "stroke-width": 0.8
      }, buretGroup);
    }

    // Stopcock Valve at Z = 14.5
    const stopcockHandle = HL.mk("line", { class: "sil", "stroke-width": 2.4, stroke: "var(--hl-edge)" }, buretGroup);

    // Tip nozzle
    const tipPt0 = P(0, 0, 14.5);
    const tipPt1 = P(0, 0, 12.0);
    HL.mk("line", {
      x1: HL.r2(tipPt0[0]), y1: HL.r2(tipPt0[1]),
      x2: HL.r2(tipPt1[0]), y2: HL.r2(tipPt1[1]),
      class: "sil", "stroke-width": 1.4
    }, buretGroup);

    // Liquid Meniscus Disc inside Buret
    const buretMeniscus = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, buretGroup);

    // Droplet
    const dropGroup = HL.mk("circle", { cx: HL.r2(P(0, 0, 11.2)[0]), cy: HL.r2(P(0, 0, 11.2)[1]), r: 1.1, class: "dot" }, buretGroup);

    // Kinematics Springs
    const spVol = HL.spring(initialV != null ? initialV : 10, { k: 120, c: 14 });

    function draw() {
      const vol = spVol.x; // 0 to 25 mL
      const isEquiv = vol >= 20.0;

      // Stopcock rotation
      const valveAngle = HL.clamp(vol / 25, 0, 1) * (Math.PI / 2);
      const scL = 4.2;
      const scP0 = P(-scL * Math.cos(valveAngle), 0, 14.5 + scL * Math.sin(valveAngle));
      const scP1 = P(scL * Math.cos(valveAngle), 0, 14.5 - scL * Math.sin(valveAngle));
      stopcockHandle.setAttribute("x1", HL.r2(scP0[0]));
      stopcockHandle.setAttribute("y1", HL.r2(scP0[1]));
      stopcockHandle.setAttribute("x2", HL.r2(scP1[0]));
      stopcockHandle.setAttribute("y2", HL.r2(scP1[1]));

      // Meniscus inside buret: Z drops from 35.0 down to 18.0
      const menZ = 35.0 - (vol / 25.0) * 17.0;
      const menPts = [];
      for (let a = 0; a < 20; a++) {
        const ang = (a * 2 * Math.PI) / 20;
        menPts.push(P((buretR - 0.4) * Math.cos(ang), (buretR - 0.4) * Math.sin(ang), menZ));
      }
      buretMeniscus.setAttribute("d", HL.poly(menPts));

      // Liquid in flask
      const liqZ = 3.5 + (vol / 25.0) * 2.2;
      const liqR = flaskBaseR - ((liqZ - 2.5) / 8.0) * (flaskBaseR - flaskNeckR);
      const liqPts = [];
      for (let a = 0; a < 24; a++) {
        const ang = (a * 2 * Math.PI) / 24;
        liqPts.push(P(liqR * Math.cos(ang), liqR * Math.sin(ang), liqZ));
      }
      flaskLiquid.setAttribute("d", HL.poly(liqPts));

      // Droplet visibility
      dropGroup.setAttribute("opacity", (vol > 0.5 && vol < 24.5) ? 1 : 0);

      // Color indicator transition
      flaskLiquid.classList.toggle("hi", isEquiv);
      flaskBody.classList.toggle("hi", isEquiv);

      // pH calculation
      let ph = 1.0;
      if (vol < 19.8) {
        ph = 1.0 + (vol / 20.0) * 2.2;
      } else if (vol < 20.0) {
        ph = 3.2 + ((vol - 19.8) / 0.2) * 3.8;
      } else if (vol === 20.0) {
        ph = 7.0;
      } else {
        ph = 7.0 + Math.min(5.5, Math.log10(1 + (vol - 20.0) * 10) * 2.5);
      }

      const vStr = HL.r2(vol);
      const phStr = HL.r2(ph);
      if (isEquiv) {
        read.textContent = `Chuẩn độ: V_NaOH = ${vStr} mL · pH = ${phStr} · [ĐIỂM TƯƠNG ĐƯƠNG] Phenolphtalein đổi màu hồng cánh sen (.hi)`;
      } else {
        read.textContent = `Chuẩn độ: V_NaOH = ${vStr} mL · pH = ${phStr} · Môi trường axit (Không màu, pH < 7)`;
      }
    }

    function setVolume(v) {
      spVol.t = HL.clamp(v, 0, 25);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setVolume(10.0);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setVolume(norm * 25.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spVol, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setVolume(Number(v));
      },
      destroy: bag.dispose
    };
  }
},
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

{
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
},
/*
 * 3. Crystal Lattice Structure (Mạng Tinh Thể Lập Phương NaCl)
 * Chemical Concept: Mạng tinh thể ion lập phương tâm mặt (FCC - Face-Centered Cubic):
 *   - Xen kẽ giữa cation Na⁺ (bán kính nhỏ r = 102 pm) và anion Cl⁻ (bán kính lớn r = 181 pm).
 *   - Lực liên kết ion: Cân bằng giữa lực hút tĩnh điện Coulomb F_hút ~ 1/r²
 *     và lực đẩy tương tác đám mây electron F_đẩy ~ 1/r¹² (Hố thế Born-Mayer).
 *   - Khoảng cách cân bằng bền: r₀ = 282 pm; Năng lượng mạng tinh thể: U = -786 kJ/mol.
 * Geometry: Bệ đỡ tiêu bản tròn/chữ nhật, 27 nút mạng ion đặc xen kẽ (Na⁺ & Cl⁻),
 *   các thanh liên kết tinh thể trực giao theo 3 trục không gian X, Y, Z.
 * Kinematics: Di chuột để kéo dãn hoặc nén mạng tinh thể; các liên kết co giãn đàn hồi theo HL.spring.
 *   Khi mạng đạt đúng khoảng cách cân bằng r₀, toàn bộ liên kết tâm kích hoạt trạng thái bền .hi.
 */

{
  id: "chemistry-lattice",
  title: "3. Mạng Tinh Thể NaCl (Crystal Lattice)",
  concept: "Cấu trúc tinh thể ion: Cation Na⁺ & Anion Cl⁻ xen kẽ · Cân bằng thế năng Coulomb & Born",
  means: "Di chuột co dãn khoảng cách giữa các ion trong ô mạng lập phương. Khi đạt khoảng cách cân bằng bền (r = 282 pm), thế năng liên kết ion đạt cực tiểu, mạng tinh thể đạt trạng thái bền vững tuyệt đối.",
  rules: [1, 2, 4, 6, 9],
  range: [220, 282, 340],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 42]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Showcase Pedestal Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // Base coordinate grid lines
    HL.mk("line", {
      x1: HL.r2(P(-24, 0, 2.6)[0]), y1: HL.r2(P(-24, 0, 2.6)[1]),
      x2: HL.r2(P(24, 0, 2.6)[0]), y2: HL.r2(P(24, 0, 2.6)[1]),
      class: "lo", "stroke-width": 0.8, "stroke-dasharray": "3 2"
    }, svg);

    // 2. Crystal Lattice Nodes & Bonds
    // We construct a 3x3x3 cubic lattice centered at (0, 0, 22)
    // Indices i, j, k in [-1, 0, 1]
    const centerZ = 22.0;
    const bondGroup = HL.mk("g", {}, svg);
    const ionGroup = HL.mk("g", {}, svg);

    // Kinematics Springs
    const initialR = initialV != null ? initialV : 282;
    const spR = HL.spring(initialR, { k: 130, c: 14 });

    // Pre-create SVG elements for bonds and ions
    // Bonds: (3*3*2) * 3 = 54 bonds
    const bonds = [];
    for (let axis = 0; axis < 3; axis++) {
      for (let a = -1; a <= 1; a++) {
        for (let b = -1; b <= 1; b++) {
          for (let c = -1; c <= 0; c++) {
            const line = HL.mk("line", { class: "sil", "stroke-width": 1.2, stroke: "var(--hl-edge)" }, bondGroup);
            bonds.push({ line, axis, a, b, c });
          }
        }
      }
    }

    // 27 Ion Spheres
    // Sort order for isometric rendering: back-to-front in projection
    // For Cam(az=45), depth increases with (-X + Y)
    const ions = [];
    for (let ix = -1; ix <= 1; ix++) {
      for (let iy = -1; iy <= 1; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          const isNa = (ix + iy + iz) % 2 === 0;
          const radius = isNa ? 2.2 : 3.4; // Na+ is smaller, Cl- is larger
          const group = HL.mk("g", {}, ionGroup);
          const circle = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, group);
          const detail = HL.mk("circle", { r: isNa ? 0.8 : 1.2, class: isNa ? "dot" : "lo" }, group);
          ions.push({ group, circle, detail, ix, iy, iz, isNa, radius });
        }
      }
    }

    // Sort ions back-to-front
    ions.sort((a, b) => {
      const depthA = a.ix * Math.sin(Math.PI / 4) + a.iy * Math.cos(Math.PI / 4) + a.iz * 0.5;
      const depthB = b.ix * Math.sin(Math.PI / 4) + b.iy * Math.cos(Math.PI / 4) + b.iz * 0.5;
      return depthA - depthB;
    });

    function draw() {
      const r = spR.x; // pm (220 to 340)
      // Visual spacing: 282 pm maps to 10.5 units
      const d = (r / 282.0) * 10.5;
      const isEquil = Math.abs(r - 282) < 4.0;

      // Update Bonds
      bonds.forEach(b => {
        let p0, p1;
        if (b.axis === 0) {
          // X-axis
          p0 = P(b.c * d, b.a * d, centerZ + b.b * d);
          p1 = P((b.c + 1) * d, b.a * d, centerZ + b.b * d);
        } else if (b.axis === 1) {
          // Y-axis
          p0 = P(b.a * d, b.c * d, centerZ + b.b * d);
          p1 = P(b.a * d, (b.c + 1) * d, centerZ + b.b * d);
        } else {
          // Z-axis
          p0 = P(b.a * d, b.b * d, centerZ + b.c * d);
          p1 = P(b.a * d, b.b * d, centerZ + (b.c + 1) * d);
        }
        b.line.setAttribute("x1", HL.r2(p0[0]));
        b.line.setAttribute("y1", HL.r2(p0[1]));
        b.line.setAttribute("x2", HL.r2(p1[0]));
        b.line.setAttribute("y2", HL.r2(p1[1]));
        b.line.classList.toggle("hi", isEquil);
      });

      // Update Ions
      ions.forEach(ion => {
        const pt = P(ion.ix * d, ion.iy * d, centerZ + ion.iz * d);
        const rVisual = ion.radius;

        // Draw solid circle disc for sphere in projection
        const discPts = [];
        for (let a = 0; a < 20; a++) {
          const ang = (a * 2 * Math.PI) / 20;
          discPts.push([pt[0] + rVisual * Math.cos(ang), pt[1] + rVisual * Math.sin(ang)]);
        }
        ion.circle.setAttribute("d", HL.poly(discPts));

        // Center dot / equator detail
        ion.detail.setAttribute("cx", HL.r2(pt[0]));
        ion.detail.setAttribute("cy", HL.r2(pt[1]));

        ion.circle.classList.toggle("hi", isEquil);
      });

      // Header Readout
      const rStr = HL.r2(r);
      // Lattice energy approximation U(r)
      const uLattice = HL.r2(-786 * (282 / r));
      if (isEquil) {
        read.textContent = `Tinh thể NaCl: r = ${rStr} pm (Chuẩn r₀ = 282 pm) · U = ${uLattice} kJ/mol · [CÂN BẰNG BỀN] Lực hút Coulomb cân bằng lực đẩy Born (.hi)`;
      } else if (r < 282) {
        read.textContent = `Tinh thể NaCl: r = ${rStr} pm < 282 pm · Lực đẩy đám mây electron áp đảo (Mạng bị nén, thế năng tăng)`;
      } else {
        read.textContent = `Tinh thể NaCl: r = ${rStr} pm > 282 pm · Lực hút tĩnh điện Coulomb kéo về (Mạng bị giãn, thế năng tăng)`;
      }
    }

    function setDistance(val) {
      spR.t = HL.clamp(val, 220, 340);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setDistance(282.0); // Reset to equilibrium
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setDistance(220 + norm * 120.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spR, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setDistance(Number(v));
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 4. Distillation Apparatus & Liebig Condenser (Bộ Chưng Cất & Ống Sinh Hàn)
 * Chemical Concept: Phương pháp chưng cất tách chất theo nhiệt độ sôi:
 *   - Hỗn hợp Ethanol (t_sôi = 78.3°C) và Nước (t_sôi = 100°C).
 *   - Khi t° ≥ 78.3°C: Ethanol sôi bay hơi trước, qua nhánh bình cầu vào ống sinh hàn Liebig.
 *   - Nước làm mát tuần hoàn quanh áo ngoài hấp thụ nhiệt làm hơi ngưng tụ thành chất lỏng tinh khiết,
 *     nhỏ giọt đều đặn vào bình hứng Erlenmeyer (100% opaque).
 * Geometry: Bệ thí nghiệm phẳng, bình cầu chưng cất có nhiệt kế, ống sinh hàn 2 lớp nghiêng dốc,
 *   vòi nước làm mát, các giọt ngưng tụ chạy dọc lòng ống, bình hứng tam giác đặc.
 * Kinematics: Di chuột điều chỉnh nhiệt độ đun từ 50°C đến 95°C. Khi vượt 78.3°C,
 *   hơi bốc lên mãnh liệt, các giọt ngưng tụ chảy thành dòng nhịp nhàng và bình hứng kích hoạt .hi.
 */

{
  id: "chemistry-distillation",
  title: "4. Chưng Cất & Sinh Hàn (Distillation Apparatus)",
  concept: "Tách chất lỏng theo nhiệt độ sôi: Bay hơi C₂H₅OH (78.3°C) ──> Ngưng tụ trao đổi nhiệt",
  means: "Di chuột tăng nhiệt độ bình chưng cất. Khi vượt qua nhiệt độ sôi của ethanol (t° ≥ 78.3°C), hơi cồn bốc lên, đi qua ống sinh hàn Liebig làm mát ngưng tụ thành từng giọt chất lỏng nguyên chất chảy vào bình hứng.",
  rules: [1, 2, 4, 6, 9],
  range: [50, 78.3, 95],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Lab Bench Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // 2. Distillation Flask at Left (-22, 0)
    // Heating mantle base at (-22, 0, 2.5 to 7.0)
    const mantleSol = HL.solid(svg);
    HL.put(mantleSol, HL.prism(P, front, HL.circ(7.0, 20), HL.circ(6.2, 20), 2.5, 7.0, [-22, 0]));

    // Spherical Glass Bulb centered at (-22, 0, 12.0), radius 6.0
    const flaskGroup = HL.mk("g", {}, svg);
    const flaskGlass = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);
    const flaskNeck = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);
    const thermometer = HL.mk("line", { class: "lo", "stroke-width": 1.2 }, flaskGroup);

    // Distillation flask spherical profile
    const bulbPts = [];
    const bCenter = [-22, 0, 12.0];
    const bR = 6.0;
    for (let a = 0; a < 24; a++) {
      const ang = (a * 2 * Math.PI) / 24;
      bulbPts.push(P(bCenter[0] + bR * Math.cos(ang), 0, bCenter[2] + bR * Math.sin(ang)));
    }
    flaskGlass.setAttribute("d", HL.poly(bulbPts));

    // Vertical neck up to Z = 23.5 (width 4.0)
    const nP0 = P(-24, 0, 15.0), nP1 = P(-20, 0, 15.0);
    const nP2 = P(-20, 0, 23.5), nP3 = P(-24, 0, 23.5);
    flaskNeck.setAttribute("d", HL.poly([nP0, nP1, nP2, nP3]));

    // Thermometer mercury thread
    const th0 = P(-22, 0, 24.5), th1 = P(-22, 0, 14.5);
    thermometer.setAttribute("x1", HL.r2(th0[0]));
    thermometer.setAttribute("y1", HL.r2(th0[1]));
    thermometer.setAttribute("x2", HL.r2(th1[0]));
    thermometer.setAttribute("y2", HL.r2(th1[1]));

    // 3. Liebig Condenser (Ống sinh hàn nghiêng)
    // Runs from (-18, 0, 19) down to (+12, 0, 9.0)
    const condenserGroup = HL.mk("g", {}, svg);
    const jacketSol = HL.solid(condenserGroup);
    const innerTube = HL.mk("line", { class: "lo", "stroke-width": 1.4 }, condenserGroup);

    const cStart = [-18, 0, 19];
    const cEnd = [12, 0, 9.0];
    const cLen = Math.hypot(cEnd[0] - cStart[0], cEnd[2] - cStart[2]);
    const cDir = [(cEnd[0] - cStart[0]) / cLen, (cEnd[2] - cStart[2]) / cLen];
    const cNorm = [-cDir[1], cDir[0]];

    // Outer jacket cylinder polygon (solid opaque)
    const jR = 3.2;
    const j0 = P(cStart[0] + 3 * cDir[0] + jR * cNorm[0], 0, cStart[2] + 3 * cDir[1] + jR * cNorm[1]);
    const j1 = P(cStart[0] + 3 * cDir[0] - jR * cNorm[0], 0, cStart[2] + 3 * cDir[1] - jR * cNorm[1]);
    const j2 = P(cEnd[0] - 2 * cDir[0] - jR * cNorm[0], 0, cEnd[2] - 2 * cDir[1] - jR * cNorm[1]);
    const j3 = P(cEnd[0] - 2 * cDir[0] + jR * cNorm[0], 0, cEnd[2] - 2 * cDir[1] + jR * cNorm[1]);

    HL.put(jacketSol, { sil: HL.poly([j0, j1, j2, j3]), crease: "" });

    // Inner tube
    const pStart = P(...cStart), pEnd = P(...cEnd);
    innerTube.setAttribute("x1", HL.r2(pStart[0]));
    innerTube.setAttribute("y1", HL.r2(pStart[1]));
    innerTube.setAttribute("x2", HL.r2(pEnd[0]));
    innerTube.setAttribute("y2", HL.r2(pEnd[1]));

    // Condensation droplets running down inner tube
    const dropGroup = HL.mk("g", { class: "hi" }, condenserGroup);
    const dropDots = [];
    for (let d = 0; d < 4; d++) {
      const dot = HL.mk("circle", { r: 1.1, class: "dot", opacity: 0 }, dropGroup);
      dropDots.push(dot);
    }

    // 4. Receiving Flask (Bình hứng Erlenmeyer) at Right (+18, 0) - Solid Opaque Frustum
    const recGroup = HL.mk("g", {}, svg);
    const recBody = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, recGroup);
    const recTopFace = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, recGroup);
    const recLiquid = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, recGroup);

    const recBaseR = 7.2;
    const recNeckR = 2.6;

    // Erlenmeyer 3D solid construction at (+18, 0)
    function buildRecPath() {
      const bPts = [];
      for (let i = 0; i <= 12; i++) {
        const ang = (135 - i * 15) * Math.PI / 180;
        bPts.push(P(18 + recBaseR * Math.cos(ang), recBaseR * Math.sin(ang), 2.5));
      }
      const tPts = [];
      for (let i = 0; i <= 12; i++) {
        const ang = (-45 + i * 15) * Math.PI / 180;
        tPts.push(P(18 + recNeckR * Math.cos(ang), recNeckR * Math.sin(ang), 9.0));
      }
      recBody.setAttribute("d", HL.poly([...bPts, ...tPts]));

      const rimPts = [];
      for (let a = 0; a < 20; a++) {
        const ang = (a * 2 * Math.PI) / 20;
        rimPts.push(P(18 + recNeckR * Math.cos(ang), recNeckR * Math.sin(ang), 9.0));
      }
      recTopFace.setAttribute("d", HL.poly(rimPts));
    }
    buildRecPath();

    // Kinematics Springs
    const initialTemp = initialV != null ? initialV : 78.3;
    const spTemp = HL.spring(initialTemp, { k: 120, c: 14 });
    let animTime = 0;

    function draw() {
      const temp = spTemp.x;
      const isDistilling = temp >= 78.3;

      // Thermometer thread height
      const thZ = 14.5 + ((temp - 50) / 45.0) * 7.5;
      const thCur = P(-22, 0, thZ);
      thermometer.setAttribute("y2", HL.r2(thCur[1]));
      thermometer.classList.toggle("hi", isDistilling);

      // Droplets
      dropDots.forEach((dot, idx) => {
        if (!isDistilling) {
          dot.setAttribute("opacity", 0);
          return;
        }
        dot.setAttribute("opacity", 1);
        const progress = (animTime * 1.2 + idx * 0.25) % 1.0;
        const curX = cStart[0] + progress * (cEnd[0] - cStart[0]);
        const curZ = cStart[2] + progress * (cEnd[2] - cStart[2]);
        const pt = P(curX, 0, curZ);
        dot.setAttribute("cx", HL.r2(pt[0]));
        dot.setAttribute("cy", HL.r2(pt[1]));
      });

      // Liquid in receiving flask
      const recLiqH = isDistilling ? 4.5 : 3.0;
      const liqPts = [];
      const liqR = recBaseR - ((recLiqH - 2.5) / 6.5) * (recBaseR - recNeckR);
      for (let a = 0; a < 20; a++) {
        const ang = (a * 2 * Math.PI) / 20;
        liqPts.push(P(18 + liqR * Math.cos(ang), liqR * Math.sin(ang), recLiqH));
      }
      recLiquid.setAttribute("d", HL.poly(liqPts));
      recLiquid.classList.toggle("hi", isDistilling);
      recBody.classList.toggle("hi", isDistilling);

      // Header Readout
      const tStr = HL.r2(temp);
      if (isDistilling) {
        read.textContent = `Chưng cất: t° = ${tStr}°C ≥ 78.3°C · [NGƯNG TỤ ETHANOL] Hơi C₂H₅OH ngưng tụ qua sinh hàn Liebig thành giọt vào bình hứng (.hi)`;
      } else {
        read.textContent = `Chưng cất: t° = ${tStr}°C < 78.3°C · Chưa đạt nhiệt độ sôi của ethanol (Chưa bay hơi ngưng tụ)`;
      }
    }

    function setTemperature(t) {
      spTemp.t = HL.clamp(t, 50, 95);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setTemperature(78.3);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setTemperature(50 + norm * 45.0);
    }

    const reg = HL.register(stage, dt => {
      animTime += dt;
      const moving = HL.stepS(spTemp, dt);
      draw();
      return moving || spTemp.x >= 77.5;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setTemperature(Number(v));
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 5. Universal pH Scale & Litmus Test Strip (Thang Đo pH & Giấy Chỉ Thị)
 * Chemical Concept: Thang nồng độ ion hydronium: pH = -log[H⁺] (0 → 14):
 *   - Mẫu 1: Axit Clohydric HCl (pH = 1.0, [H⁺] = 0.1 M) ──> Quỳ đỏ rực
 *   - Mẫu 2: Nước chanh Citric (pH = 3.0, [H⁺] = 10⁻³ M) ──> Quỳ cam đỏ
 *   - Mẫu 3: Nước cất H₂O tinh khiết (pH = 7.0, [H⁺] = 10⁻⁷ M) ──> Trung tính
 *   - Mẫu 4: Dung dịch Xà phòng (pH = 9.5, [H⁺] ≈ 3·10⁻¹⁰ M) ──> Quỳ xanh da trời
 *   - Mẫu 5: Xút Natri hiđroxit NaOH (pH = 13.0, [H⁺] = 10⁻¹³ M) ──> Quỳ xanh lam đậm / tím
 * Geometry: Khay kiểm nghiệm 5 cốc thử hình trụ đặc (100% opaque), dải thang chia vạch chuẩn pH 1-14,
 *   nhíp kẹp nhúng giấy quỳ vào từng cốc, kim trượt định vị giá trị pH tức thì.
 * Kinematics: Di chuột ngang để di chuyển nhíp kẹp qua 5 giếng thử; que thử tự động nhúng
 *   sâu vào chất lỏng theo lò xo HL.spring, đầu giấy quỳ đổi màu và kim chỉ thang đo phản hồi.
 */

{
  id: "chemistry-ph-scale",
  title: "5. Thang Đo pH & Giấy Chỉ Thị (pH Scale & Indicator)",
  concept: "Định nghĩa pH = -log[H⁺] · Thang 0-14 (Axit < 7, Trung tính = 7, Bazơ > 7)",
  means: "Di chuột ngang để điều khiển nhíp gắp mẩu giấy quỳ nhúng vào 5 mẫu dung dịch. Đầu giấy quỳ lập tức đổi màu hóa học tương ứng với nồng độ ion [H⁺] và kim chỉ thang đo tự động trượt đến giá trị pH thực tế.",
  rules: [1, 2, 4, 6, 9],
  range: [-28, 0, 28],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Lab Testing Bench Plate (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // 2. pH Reference Track & Tick Marks along back edge (Y = -9, X: -36 to 36)
    const trackY = -9.0;
    HL.mk("line", {
      x1: HL.r2(P(-36, trackY, 2.6)[0]), y1: HL.r2(P(-36, trackY, 2.6)[1]),
      x2: HL.r2(P(36, trackY, 2.6)[0]), y2: HL.r2(P(36, trackY, 2.6)[1]),
      class: "lo", "stroke-width": 1.2
    }, svg);

    // 14 ticks along the track (pH 1 to 14)
    for (let ph = 1; ph <= 14; ph++) {
      const tx = -36 + ((ph - 1) / 13) * 72;
      const isAnchor = ph === 1 || ph === 7 || ph === 14;
      const tLen = isAnchor ? 2.5 : 1.2;
      const pA = P(tx, trackY - tLen / 2, 2.6);
      const pB = P(tx, trackY + tLen / 2, 2.6);
      HL.mk("line", {
        x1: HL.r2(pA[0]), y1: HL.r2(pA[1]),
        x2: HL.r2(pB[0]), y2: HL.r2(pB[1]),
        class: isAnchor ? "hi" : "lo",
        "stroke-width": isAnchor ? 1.4 : 0.8
      }, svg);
    }

    // Sliding Indicator Needle on track
    const needleGroup = HL.mk("g", {}, svg);
    const needleSol = HL.solid(needleGroup);

    // 3. 5 Solid Cylindrical Beakers (Cốc thử đặc 100% opaque)
    const SAMPLES = [
      { name: "HCl 0.1M (Axit mạnh)", ph: 1.0, x: -28, label: "pH 1" },
      { name: "Nước Chanh (Axit yếu)", ph: 3.0, x: -14, label: "pH 3" },
      { name: "Nước Cất H₂O (Trung tính)", ph: 7.0, x: 0, label: "pH 7" },
      { name: "Xà Phòng (Bazơ yếu)", ph: 9.5, x: 14, label: "pH 9.5" },
      { name: "NaOH 0.1M (Bazơ mạnh)", ph: 13.0, x: 28, label: "pH 13" }
    ];

    const beakerGroups = [];
    const bR = 4.8;
    const bZ0 = 2.5, bZ1 = 6.5;

    SAMPLES.forEach(s => {
      const group = HL.mk("g", {}, svg);
      const side = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, group);
      const top = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, group);
      const liquid = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, group);

      // Construct solid cylinder: bottom front arc from theta = 135 deg to -45 deg
      const bPts = [];
      for (let i = 0; i <= 12; i++) {
        const ang = (135 - i * 15) * Math.PI / 180;
        bPts.push(P(s.x + bR * Math.cos(ang), 3.0 + bR * Math.sin(ang), bZ0));
      }
      const tPts = [];
      for (let i = 0; i <= 12; i++) {
        const ang = (-45 + i * 15) * Math.PI / 180;
        tPts.push(P(s.x + bR * Math.cos(ang), 3.0 + bR * Math.sin(ang), bZ1));
      }
      side.setAttribute("d", HL.poly([...bPts, ...tPts]));

      // Top circle
      const topPts = [];
      for (let a = 0; a < 20; a++) {
        const ang = (a * 2 * Math.PI) / 20;
        topPts.push(P(s.x + bR * Math.cos(ang), 3.0 + bR * Math.sin(ang), bZ1));
      }
      top.setAttribute("d", HL.poly(topPts));

      // Inner liquid surface
      const liqPts = [];
      for (let a = 0; a < 20; a++) {
        const ang = (a * 2 * Math.PI) / 20;
        liqPts.push(P(s.x + (bR - 0.7) * Math.cos(ang), 3.0 + (bR - 0.7) * Math.sin(ang), bZ1 - 0.8));
      }
      liquid.setAttribute("d", HL.poly(liqPts));

      beakerGroups.push({ group, side, top, liquid, ...s });
    });

    // 4. Tweezers & Paper Test Strip
    const toolGroup = HL.mk("g", {}, svg);
    const tweezerArmL = HL.mk("line", { class: "sil", "stroke-width": 1.6, stroke: "var(--hl-edge)" }, toolGroup);
    const tweezerArmR = HL.mk("line", { class: "sil", "stroke-width": 1.6, stroke: "var(--hl-edge)" }, toolGroup);
    const paperStripSol = HL.solid(toolGroup);
    const paperTip = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, toolGroup);

    // Kinematics Springs
    const initialX = initialV != null ? initialV : 0;
    const spX = HL.spring(initialX, { k: 140, c: 15 });
    const spDip = HL.spring(0, { k: 160, c: 14 });

    function draw() {
      const curX = spX.x;
      const dip = spDip.x;

      let closestIdx = 0;
      let minDis = 999;
      SAMPLES.forEach((s, idx) => {
        const dis = Math.abs(curX - s.x);
        if (dis < minDis) {
          minDis = dis;
          closestIdx = idx;
        }
      });
      const activeSample = SAMPLES[closestIdx];
      const isOverWell = minDis < 3.5;

      // Needle on track
      const targetPH = activeSample.ph;
      const needleX = -36 + ((targetPH - 1) / 13) * 72;
      const nP0 = P(needleX - 2.0, trackY - 2.5, 2.6);
      const nP1 = P(needleX + 2.0, trackY - 2.5, 2.6);
      const nP2 = P(needleX, trackY + 1.5, 2.6);
      const nP0T = P(needleX - 2.0, trackY - 2.5, 5.0);
      const nP1T = P(needleX + 2.0, trackY - 2.5, 5.0);
      const nP2T = P(needleX, trackY + 1.5, 5.0);

      let nSil = "";
      nSil += HL.poly([nP0, nP1, nP1T, nP0T]);
      nSil += HL.poly([nP1, nP2, nP2T, nP1T]);
      nSil += HL.poly([nP0T, nP1T, nP2T]);
      HL.put(needleSol, { sil: nSil, crease: "" });
      needleSol.sil.classList.toggle("hi", isOverWell);

      // Tweezers & Paper Position
      const toolZ = 16.0 - dip * 5.0;
      const paperW = 2.4;
      const paperL = 12.0;

      const twTop = P(curX, 3.0, 30.0);
      const twL = P(curX - 1.2, 3.0, toolZ + paperL * 0.9);
      const twR = P(curX + 1.2, 3.0, toolZ + paperL * 0.9);
      tweezerArmL.setAttribute("x1", HL.r2(twTop[0]));
      tweezerArmL.setAttribute("y1", HL.r2(twTop[1]));
      tweezerArmL.setAttribute("x2", HL.r2(twL[0]));
      tweezerArmL.setAttribute("y2", HL.r2(twL[1]));

      tweezerArmR.setAttribute("x1", HL.r2(twTop[0]));
      tweezerArmR.setAttribute("y1", HL.r2(twTop[1]));
      tweezerArmR.setAttribute("x2", HL.r2(twR[0]));
      tweezerArmR.setAttribute("y2", HL.r2(twR[1]));

      const pp0 = P(curX - paperW / 2, 3.0, toolZ);
      const pp1 = P(curX + paperW / 2, 3.0, toolZ);
      const pp2 = P(curX + paperW / 2, 3.0, toolZ + paperL);
      const pp3 = P(curX - paperW / 2, 3.0, toolZ + paperL);
      HL.put(paperStripSol, { sil: HL.poly([pp0, pp1, pp2, pp3]), crease: "" });

      const tip0 = P(curX - paperW / 2, 3.0, toolZ);
      const tip1 = P(curX + paperW / 2, 3.0, toolZ);
      const tip2 = P(curX + paperW / 2, 3.0, toolZ + 3.5);
      const tip3 = P(curX - paperW / 2, 3.0, toolZ + 3.5);
      paperTip.setAttribute("d", HL.poly([tip0, tip1, tip2, tip3]));

      // Highlight effects
      paperTip.classList.toggle("hi", isOverWell);
      beakerGroups.forEach((b, idx) => {
        const isThisBeaker = idx === closestIdx && isOverWell;
        b.side.classList.toggle("hi", isThisBeaker);
        b.top.classList.toggle("hi", isThisBeaker);
        b.liquid.classList.toggle("hi", isThisBeaker);
      });

      // Header Readout
      const phVal = activeSample.ph;
      const hPlus = Math.pow(10, -phVal).toExponential(1);
      const desc = phVal < 7 ? "Môi trường AXIT (Quỳ hóa đỏ/cam)" : phVal === 7 ? "Môi trường TRUNG TÍNH (Quỳ không đổi)" : "Môi trường BAZƠ/KIỀM (Quỳ hóa xanh)";
      read.textContent = `Thang đo: ${activeSample.name} · pH = ${phVal} · [H⁺] = ${hPlus} M · ${desc} (.hi)`;
    }

    function setXPos(val) {
      const clamped = HL.clamp(val, -30, 30);
      spX.t = clamped;

      let nearWell = false;
      SAMPLES.forEach(s => {
        if (Math.abs(clamped - s.x) < 4.0) nearWell = true;
      });
      spDip.t = nearWell ? 1.0 : 0.0;
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setXPos(0);
        return;
      }
      const minScrX = 60, maxScrX = 340;
      const norm = HL.clamp((pt[0] - minScrX) / (maxScrX - minScrX), 0, 1);
      setXPos(-30 + norm * 60.0);
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(spX, dt);
      const m2 = HL.stepS(spDip, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setXPos(Number(v));
      },
      destroy: bag.dispose
    };
  }
},
];

// App Controller & View Logic for Chemistry Figures Suite
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
    CHEMISTRY_FIGURES.forEach((fig, idx) => {
      const btn = document.createElement("button");
      btn.className = "nav-btn" + (idx === currentIndex && !isGalleryMode ? " active" : "");
      btn.textContent = fig.title.split(" (")[0];
      btn.onclick = () => switchTo(idx);
      navTabs.appendChild(btn);
    });

    const galleryBtn = document.createElement("button");
    galleryBtn.className = "nav-btn view-mode-toggle" + (isGalleryMode ? " active" : "");
    galleryBtn.textContent = isGalleryMode ? "Tập Trung (Focus)" : "Xem Cả 5 Hình (Gallery)";
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

    const fig = CHEMISTRY_FIGURES[idx];
    stage.setAttribute("data-hairline", fig.id);
    nameEl.textContent = fig.id;
    metaTitle.textContent = fig.title;
    metaDesc.textContent = fig.means;
    metaRule.textContent = "Khái niệm hóa học: " + fig.concept + " · Tiêu chuẩn: Hairline 2:1 Axonometric";

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
    CHEMISTRY_FIGURES.forEach((fig, idx) => {
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
      gDesc.textContent = fig.concept;

      const gRead = document.createElement("div");
      gRead.className = "grid-read";

      gMeta.appendChild(gName);
      gMeta.appendChild(gDesc);
      gMeta.appendChild(gRead);

      card.appendChild(gStage);
      card.appendChild(gMeta);
      card.onclick = () => switchTo(idx);
      galleryView.appendChild(card);

      const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, gStage);
      const readObj = {
        get textContent() { return gRead.textContent; },
        set textContent(v) { gRead.textContent = v; }
      };
      fig.mount({ stage: gStage, svg, read: readObj }, fig.range[1]);
    });
  }

  slider.oninput = e => {
    const val = Number(e.target.value);
    valOut.textContent = String(val);
    if (currentHandle && currentHandle.set) {
      currentHandle.set(val);
    }
  };

  window.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= CHEMISTRY_FIGURES.length) {
      switchTo(num - 1);
    } else if (e.key === "g" || e.key === "G") {
      toggleGalleryMode();
    }
  });

  // Initial boot
  renderTabs();
  switchTo(0);
})();
