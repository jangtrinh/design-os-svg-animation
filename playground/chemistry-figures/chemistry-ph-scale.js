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

export default {
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
};
