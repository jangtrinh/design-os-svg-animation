/*
 * 5. Universal pH Scale & Porcelain Spot Plate (Thang Đo pH & Khay Giếng Sứ Thí Nghiệm)
 * Chemical Concept: Thang đo nồng độ ion hydronium: pH = -log10[H⁺] (0 đến 14):
 *   - Giếng 1: HCl 0.10 M (Axit mạnh, [H⁺] = 10⁻¹ M, pH = 1.00) ──> Quỳ đỏ đậm (.hi)
 *   - Giếng 2: Nước chanh / Axit citric ([H⁺] ≈ 10⁻³ M, pH = 3.00) ──> Quỳ cam đỏ
 *   - Giếng 3: Nước cất tinh khiết ([H⁺] = 10⁻⁷ M, pH = 7.00) ──> Trung tính, quỳ không đổi màu
 *   - Giếng 4: Dung dịch NaHCO₃ / Xà phòng ([H⁺] ≈ 3·10⁻¹⁰ M, pH = 9.50) ──> Quỳ xanh da trời
 *   - Giếng 5: NaOH 0.10 M (Bazơ mạnh, [H⁺] = 10⁻¹³ M, pH = 13.00) ──> Quỳ xanh lam tím đậm (.hi)
 * Geometry (Hairline Specimen Discipline):
 *   - Khay sứ thử phản ứng màu 5 lỗ (5-well white porcelain spot plate) có lòng giếng lõm thật,
 *     thành miệng vát, đáy chứa dung dịch ở Z = 1.0 đến 2.5.
 *   - Thước thang chia độ chuẩn pH 1-14 phía sau với kim trượt định vị cơ học.
 *   - Nhíp kẹp thép không gỉ gắp dải giấy quỳ di động trên trục X.
 * Kinematics & Physical Contact Mandate:
 *   - Khi di chuyển qua lại, giấy quỳ được nhấc bổng an toàn (Z_tip = 8.5 > Z_well = 4.0).
 *   - Khi dừng trên miệng giếng, cơ chế nhúng (dipping) hạ đầu que quỳ xuống Z_tip = 1.8.
 *   - CHỈ KHI đầu giấy quỳ chạm và ngập trong mặt dung dịch (Z_tip ≤ 2.5), phản ứng hóa học
 *     mới kích hoạt, đầu giấy đổi màu và thang đo mới công nhận kết quả pH!
 */

export default {
  id: "chemistry-ph-scale",
  title: "5. Thang Đo pH & Giấy Chỉ Thị (pH Scale & Spot Plate)",
  concept: "Định nghĩa pH = -log₁₀[H⁺] · Khay giếng sứ 5 mẫu · Chỉ kích hoạt khi giấy tiếp xúc dung dịch",
  means: "Di chuột ngang qua 5 giếng thử. Giấy quỳ tự động nhúng sâu ngập vào chất lỏng; CHỈ KHI tiếp xúc thật sự thì phản ứng màu và thang đo pH mới hiển thị.",
  rules: [1, 2, 4, 6, 9],
  range: [-24, 0, 24],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 2.5);
    HL.fit(C, [[-34, -18, 0], [34, 18, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    function circAt(cx, cy, R, n = 24) {
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        out.push({ u: cx + R * ca, v: cy + R * sa, nu: ca, nv: sa });
      }
      return out;
    }

    // 1. pH Reference Track & Calibrated Ticks along back edge (Y = -10, X = -32 to 32, Z = 0)
    const trackY = -10.0;
    const trackGroup = HL.mk("g", { class: "lo" }, svg);
    HL.mk("line", {
      x1: HL.r2(P(-32, trackY, 0.1)[0]), y1: HL.r2(P(-32, trackY, 0.1)[1]),
      x2: HL.r2(P(32, trackY, 0.1)[0]), y2: HL.r2(P(32, trackY, 0.1)[1]),
      stroke: "var(--hl-edge)", "stroke-width": 1.2
    }, trackGroup);

    // 14 ticks along the track (pH 1 to 14)
    for (let ph = 1; ph <= 14; ph++) {
      const tx = -32 + ((ph - 1) / 13) * 64;
      const isAnchor = ph === 1 || ph === 7 || ph === 14;
      const tLen = isAnchor ? 2.8 : 1.4;
      const pA = P(tx, trackY - tLen / 2, 0.1);
      const pB = P(tx, trackY + tLen / 2, 0.1);
      HL.mk("line", {
        x1: HL.r2(pA[0]), y1: HL.r2(pA[1]),
        x2: HL.r2(pB[0]), y2: HL.r2(pB[1]),
        class: isAnchor ? "hi" : "lo",
        stroke: "var(--hl-edge)",
        "stroke-width": isAnchor ? 1.4 : 0.8
      }, trackGroup);
    }

    // Sliding Indicator Needle on Track
    const needleGroup = HL.mk("g", {}, svg);
    const needleSol = HL.solid(needleGroup);

    // 2. White Porcelain Spot Plate (Khay sứ thí nghiệm 5 giếng: X = -30 to 30, Y = -4 to 12, Z = 0 to 4.0)
    const plateSol = HL.solid(svg);
    const [plO, plI] = HL.rings(-30, -4, 30, 12, 2.5, 0.6);
    HL.put(plateSol, HL.prism(P, front, plO, plI, 0, 4.0));

    // 5 Concave Wells (Lòng giếng sứ lõm)
    const SAMPLES = [
      { name: "HCl 0.10 M (Axit mạnh)", ph: 1.0, x: -24, colorName: "Đỏ rực", formula: "[H⁺]=0.1 M" },
      { name: "Nước Chanh Citric (Axit yếu)", ph: 3.0, x: -12, colorName: "Cam đỏ", formula: "[H⁺]=10⁻³ M" },
      { name: "Nước Cất H₂O (Trung tính)", ph: 7.0, x: 0, colorName: "Tím nhạt (không đổi)", formula: "[H⁺]=10⁻⁷ M" },
      { name: "Xà Phòng NaHCO₃ (Bazơ yếu)", ph: 9.5, x: 12, colorName: "Xanh da trời", formula: "[H⁺]=3·10⁻¹⁰ M" },
      { name: "NaOH 0.10 M (Bazơ mạnh)", ph: 13.0, x: 24, colorName: "Xanh lam đậm", formula: "[H⁺]=10⁻¹³ M" }
    ];

    const wellGroup = HL.mk("g", {}, svg);
    const wellR = 3.6;
    const wellY = 4.0;

    SAMPLES.forEach(s => {
      // Well outer circular rim lip on top surface of porcelain plate (Z = 4.0)
      const rimPts = [];
      for (let a = 0; a <= 24; a++) {
        const rad = (a * 2 * Math.PI) / 24;
        rimPts.push(P(s.x + wellR * Math.cos(rad), wellY + wellR * Math.sin(rad), 4.05));
      }
      HL.mk("path", {
        d: "M " + rimPts.map(p => `${HL.r2(p[0])} ${HL.r2(p[1])}`).join(" L "),
        class: "lo", fill: "none", stroke: "var(--hl-edge)", "stroke-width": 1.0
      }, wellGroup);

      // Cavity wall inner circle (Z = 1.0 to 4.0)
      const innerPts = [];
      for (let a = 0; a <= 24; a++) {
        const rad = (a * 2 * Math.PI) / 24;
        innerPts.push(P(s.x + (wellR - 0.6) * Math.cos(rad), wellY + (wellR - 0.6) * Math.sin(rad), 4.02));
      }
      HL.mk("path", {
        d: "M " + innerPts.map(p => `${HL.r2(p[0])} ${HL.r2(p[1])}`).join(" L "),
        class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 0.8
      }, wellGroup);

      // Liquid puddle surface at Z = 2.4 inside cavity
      const liqPts = [];
      for (let a = 0; a <= 24; a++) {
        const rad = (a * 2 * Math.PI) / 24;
        liqPts.push(P(s.x + (wellR - 0.9) * Math.cos(rad), wellY + (wellR - 0.9) * Math.sin(rad), 2.4));
      }
      HL.mk("path", {
        d: "M " + liqPts.map(p => `${HL.r2(p[0])} ${HL.r2(p[1])}`).join(" L "),
        class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.0
      }, wellGroup);
    });

    // 3. Tweezers & Paper Test Strip (Nhíp gắp que thử quỳ tím)
    const toolGroup = HL.mk("g", {}, svg);
    const tweezerArmL = HL.mk("line", { class: "sil", "stroke-width": 1.8, stroke: "var(--hl-edge)" }, toolGroup);
    const tweezerArmR = HL.mk("line", { class: "sil", "stroke-width": 1.8, stroke: "var(--hl-edge)" }, toolGroup);
    const tweezerPivot = HL.mk("circle", { r: 1.8, class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.2 }, toolGroup);

    // Paper Strip Body (Dry portion, upper)
    const paperDryBody = HL.mk("polygon", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.0 }, toolGroup);
    // Paper Strip Submerged Tip (Reactive indicator portion, lower 2.5 units)
    const paperTip = HL.mk("polygon", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, toolGroup);

    // Kinematic Springs
    const initialX = initialV != null ? initialV : 0;
    const spX = HL.spring(initialX, { k: 130, c: 15 });
    const spDip = HL.spring(0, { k: 160, c: 14 }); // 0 = Lifted high (Z_tip = 8.5), 1 = Dipped in liquid (Z_tip = 1.8)

    function draw() {
      const curX = spX.x;

      // Find nearest well
      let closestIdx = 0;
      let minDis = 999;
      SAMPLES.forEach((s, idx) => {
        const dis = Math.abs(curX - s.x);
        if (dis < minDis) {
          minDis = dis;
          closestIdx = idx;
        }
      });
      const nearest = SAMPLES[closestIdx];
      const isDirectlyOverWell = minDis <= 2.2;

      // Automatic dipping kinematics: dip only when centered over a well
      if (isDirectlyOverWell) {
        spDip.t = 1.0;
      } else {
        spDip.t = 0.0;
      }

      // Vertical position of paper strip:
      // When lifted (dip = 0): tip is at Z = 8.5 (above plate Z = 4.0)
      // When dipped (dip = 1): tip is at Z = 1.8 (submerged in liquid Z_liq = 2.4!)
      const dipVal = spDip.x;
      const tipZ = 8.5 - dipVal * 6.7;
      const topZ = tipZ + 12.0;
      const submergeBoundaryZ = tipZ + 2.4; // Lower 2.4 units of paper is the reactive zone

      // Physical contact check: Tip must be submerged below liquid surface Z = 2.4
      const isSubmerged = isDirectlyOverWell && tipZ <= 2.4;

      // 1. Draw Paper Strip (Upper dry body & lower tip)
      const pW = 1.5;
      const pTopL = P(curX - pW, wellY, topZ);
      const pTopR = P(curX + pW, wellY, topZ);
      const pMidL = P(curX - pW, wellY, submergeBoundaryZ);
      const pMidR = P(curX + pW, wellY, submergeBoundaryZ);
      const pBotL = P(curX - pW, wellY, tipZ);
      const pBotR = P(curX + pW, wellY, tipZ);

      paperDryBody.setAttribute("points", `${HL.r2(pTopL[0])},${HL.r2(pTopL[1])} ${HL.r2(pTopR[0])},${HL.r2(pTopR[1])} ${HL.r2(pMidR[0])},${HL.r2(pMidR[1])} ${HL.r2(pMidL[0])},${HL.r2(pMidL[1])}`);
      paperTip.setAttribute("points", `${HL.r2(pMidL[0])},${HL.r2(pMidL[1])} ${HL.r2(pMidR[0])},${HL.r2(pMidR[1])} ${HL.r2(pBotR[0])},${HL.r2(pBotR[1])} ${HL.r2(pBotL[0])},${HL.r2(pBotL[1])}`);

      // 2. Draw Tweezers
      const twPivotPt = P(curX, wellY, topZ + 6.0);
      tweezerPivot.setAttribute("cx", HL.r2(twPivotPt[0]));
      tweezerPivot.setAttribute("cy", HL.r2(twPivotPt[1]));

      tweezerArmL.setAttribute("x1", HL.r2(twPivotPt[0]));
      tweezerArmL.setAttribute("y1", HL.r2(twPivotPt[1]));
      tweezerArmL.setAttribute("x2", HL.r2(pTopL[0]));
      tweezerArmL.setAttribute("y2", HL.r2(pTopL[1]));

      tweezerArmR.setAttribute("x1", HL.r2(twPivotPt[0]));
      tweezerArmR.setAttribute("y1", HL.r2(twPivotPt[1]));
      tweezerArmR.setAttribute("x2", HL.r2(pTopR[0]));
      tweezerArmR.setAttribute("y2", HL.r2(pTopR[1]));

      // 3. Sliding Indicator Needle on Reference Track
      const targetPH = isSubmerged ? nearest.ph : 7.0;
      const needleX = -32 + ((targetPH - 1) / 13) * 64;
      const nP0 = P(needleX - 1.8, trackY - 2.0, 0.1);
      const nP1 = P(needleX + 1.8, trackY - 2.0, 0.1);
      const nP2 = P(needleX, trackY + 1.2, 0.1);
      const nP0T = P(needleX - 1.8, trackY - 2.0, 2.5);
      const nP1T = P(needleX + 1.8, trackY - 2.0, 2.5);
      const nP2T = P(needleX, trackY + 1.2, 2.5);

      let nSil = "";
      nSil += HL.poly([nP0, nP1, nP1T, nP0T]);
      nSil += HL.poly([nP1, nP2, nP2T, nP1T]);
      nSil += HL.poly([nP0T, nP1T, nP2T]);
      HL.put(needleSol, { sil: nSil, crease: "" });

      // 4. Indicator Reaction & Readout
      if (isSubmerged) {
        paperTip.classList.add("hi");
        needleSol.sil.classList.add("hi");
        read.textContent = `[ĐÃ TIẾP XÚC DUNG DỊCH] Mẫu: ${nearest.name} · ${nearest.formula} · pH = ${nearest.ph.toFixed(1)} · Quỳ chuyển màu ${nearest.colorName} (.hi)`;
      } else {
        paperTip.classList.remove("hi");
        needleSol.sil.classList.remove("hi");
        read.textContent = `[CHƯA TIẾP XÚC DUNG DỊCH] Que quỳ đang ở độ cao Z = ${tipZ.toFixed(1)} (khô ráo) · Di chuyển vào tâm giếng thử để nhúng đo pH`;
      }
    }

    function setX(val) {
      spX.t = HL.clamp(val, -26, 26);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setX(0);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setX(-26 + norm * 52.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spX, dt) | HL.stepS(spDip, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setX(Number(v));
      },
      destroy: bag.dispose,
      dispose: bag.dispose
    };
  }
};
