/*
 * 5. Universal pH Scale & Porcelain Spot Plate (Thang Đo pH & Khay Giếng Sứ Thí Nghiệm)
 * pH = -log₁₀[H⁺] across 5 porcelain wells (pH 1.0, 3.0, 7.0, 9.5, 13.0); reactive only on contact.
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
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 4.35);
    HL.fit(C, [[-31, -15, 0], [31, 15, 27]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    function circRing(cx, cy, r, z, n = 22) {
      const pts = [];
      for (let a = 0; a < n; a++) {
        const rad = (a * 2 * Math.PI) / n;
        pts.push(P(cx + r * Math.cos(rad), cy + r * Math.sin(rad), z));
      }
      return HL.poly(pts);
    }

    // 1. Raised Calibrated pH Scale Stand Backboard (Y = -12 to -8, X = -30 to 30, Z = 0 to 10)
    const backSol = HL.solid(svg);
    const [bkO, bkI] = HL.rings(-30, -13, 30, -7, 1.5, 0.5);
    HL.put(backSol, HL.prism(P, front, bkO, bkI, 0, 9.5));

    const trackY = -10.0, trackZ = 9.6;
    let tickLoD = "", tickHiD = "";
    tickLoD += HL.seg(P(-28, trackY, trackZ), P(28, trackY, trackZ));
    for (let ph = 1; ph <= 14; ph++) {
      const tx = -28 + ((ph - 1) / 13) * 56;
      const isAnchor = ph === 1 || ph === 7 || ph === 14;
      const tLen = isAnchor ? 2.6 : 1.3;
      const seg = HL.seg(P(tx, trackY - tLen / 2, trackZ), P(tx, trackY + tLen / 2, trackZ));
      if (isAnchor) tickHiD += seg;
      else tickLoD += seg;
    }
    HL.mk("path", { class: "nf lo", d: tickLoD }, svg);
    HL.mk("path", { class: "nf hi", d: tickHiD }, svg);

    const needleSol = HL.solid(svg);

    // 2. White Porcelain Spot Plate (X = -30 to 30, Y = -5 to 14, Z = 0 to 5.0)
    const plateSol = HL.solid(svg);
    const [plO, plI] = HL.rings(-30, -5, 30, 14, 2.5, 0.7);
    HL.put(plateSol, HL.prism(P, front, plO, plI, 0, 5.0));

    const SAMPLES = [
      { short: "HCl [ĐỎ]", ph: 1.0, x: -22 },
      { short: "Citric [CAM]", ph: 3.0, x: -11 },
      { short: "H₂O [TÍM]", ph: 7.0, x: 0 },
      { short: "NaHCO₃ [XANH]", ph: 9.5, x: 11 },
      { short: "NaOH [LAM]", ph: 13.0, x: 22 }
    ];

    const wellR = 3.8, wellY = 4.5;
    const wellLiquids = [];

    SAMPLES.forEach(s => {
      HL.mk("path", { class: "nf lo", d: circRing(s.x, wellY, wellR, 5.05) }, svg);
      HL.mk("path", { class: "lo", d: circRing(s.x, wellY, wellR - 0.55, 5.02) }, svg);
      const liq = HL.mk("path", { class: "lo", d: circRing(s.x, wellY, wellR - 0.9, 3.4) }, svg);
      wellLiquids.push(liq);
    });

    // 3. Stainless Steel Tweezers & Universal Indicator Test Strip
    const paperDryBody = HL.mk("polygon", { class: "lo" }, svg);
    const paperTip = HL.mk("polygon", { class: "sil" }, svg);
    const tweezerArms = HL.mk("path", { class: "nf sil" }, svg);
    const tweezerPivot = HL.mk("path", { class: "sil" }, svg);

    const startX = initialV != null ? initialV : 0;
    const spX = HL.spring(startX, { k: 130, c: 15 });
    const spDip = HL.spring(1.0, { k: 160, c: 15 });
    let lastKey = "";

    function nearestSample(x) {
      let bestIdx = 0, minDis = 999;
      SAMPLES.forEach((s, idx) => {
        const dis = Math.abs(x - s.x);
        if (dis < minDis) { minDis = dis; bestIdx = idx; }
      });
      return { idx: bestIdx, sample: SAMPLES[bestIdx], dis: minDis };
    }

    function updateDipTarget(xTarget) {
      const { dis } = nearestSample(xTarget);
      spDip.t = dis <= 2.4 ? 1.0 : 0.0;
    }
    updateDipTarget(startX);
    spDip.x = spDip.t;

    function draw() {
      const curX = spX.x, dipVal = spDip.x;
      const key = `${HL.r2(curX)}:${HL.r2(dipVal)}`;
      if (key === lastKey) return;
      lastKey = key;

      const { idx: closestIdx, sample: nearest, dis: minDis } = nearestSample(curX);
      const isOverWell = minDis <= 2.4;

      const tipZ = 9.6 - dipVal * 6.8;
      const topZ = tipZ + 11.5;
      const subZ = tipZ + 2.6;
      const isSubmerged = isOverWell && tipZ <= 3.5;

      const pW = 1.55;
      const pTopL = P(curX - pW, wellY, topZ);
      const pTopR = P(curX + pW, wellY, topZ);
      const pMidL = P(curX - pW, wellY, subZ);
      const pMidR = P(curX + pW, wellY, subZ);
      const pBotL = P(curX - pW, wellY, tipZ);
      const pBotR = P(curX + pW, wellY, tipZ);

      paperDryBody.setAttribute("points", `${HL.r2(pTopL[0])},${HL.r2(pTopL[1])} ${HL.r2(pTopR[0])},${HL.r2(pTopR[1])} ${HL.r2(pMidR[0])},${HL.r2(pMidR[1])} ${HL.r2(pMidL[0])},${HL.r2(pMidL[1])}`);
      paperTip.setAttribute("points", `${HL.r2(pMidL[0])},${HL.r2(pMidL[1])} ${HL.r2(pMidR[0])},${HL.r2(pMidR[1])} ${HL.r2(pBotR[0])},${HL.r2(pBotR[1])} ${HL.r2(pBotL[0])},${HL.r2(pBotL[1])}`);

      const twPiv = P(curX, wellY, topZ + 5.8);
      tweezerArms.setAttribute("d", HL.seg(twPiv, pTopL) + HL.seg(twPiv, pTopR));
      tweezerPivot.setAttribute("d", circRing(curX, wellY, 1.4, topZ + 5.8, 14));

      // Sliding Indicator Needle on Calibrated pH Track
      const targetPH = isSubmerged ? nearest.ph : 7.0;
      const nx = -28 + ((targetPH - 1) / 13) * 56;
      const [ndO, ndI] = HL.rings(nx - 1.8, trackY - 2.2, nx + 1.8, trackY + 1.6, 0.5, 0.25);
      HL.put(needleSol, HL.prism(P, front, ndO, ndI, trackZ, trackZ + 2.4));

      wellLiquids.forEach((liq, idx) => liq.classList.toggle("hi", isSubmerged && idx === closestIdx));
      paperTip.classList.toggle("hi", isSubmerged);
      needleSol.sil.classList.toggle("hi", isSubmerged);

      read.textContent = isSubmerged
        ? `pH ${nearest.ph.toFixed(1)} · ${nearest.short}`
        : `Z=${tipZ.toFixed(1)} · Chưa nhúng`;
    }

    function setX(val) {
      const clamped = HL.clamp(val, -24, 24);
      spX.t = clamped;
      updateDipTarget(clamped);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setX(0); return; }
      const w = HL.unproj(C, pt[0], pt[1], 6.0);
      const norm = HL.clamp((w[0] - w[1] + 28) / 56, 0, 1);
      setX(-24 + norm * 48.0);
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(spX, dt);
      const m2 = HL.stepS(spDip, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setX(Number(v)); }, destroy: bag.dispose, dispose: bag.dispose };
  }
};
