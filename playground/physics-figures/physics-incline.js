/*
 * 4. Inclined Plane & Friction (Mặt Phẳng Nghiêng & Khối Trượt)
 * Physical Concept: Phân tích lực trên mặt phẳng nghiêng & ma sát nghỉ:
 *   - Lực kéo trượt dọc dốc: P∥ = P · sin(α), Áp lực pháp tuyến: N = P · cos(α)
 *   - Góc ma sát giới hạn: α_c = 24° (tan 24° ≈ 0.445 = μ)
 */

export default {
  id: "physics-incline",
  title: "4. Mặt Phẳng Nghiêng (Inclined Plane & Friction)",
  concept: "Phân tích trọng lực trên dốc: P∥ = P·sin(α) vs Fms = μ·P·cos(α)",
  means: "Di chuột dọc để nâng/hạ góc nghiêng α từ 0° đến 45°. Khi góc dốc vượt góc ma sát giới hạn (α > 24°), lực kéo trượt vượt lực ma sát nghỉ cực đại, khối trượt gia tốc lao xuống chân dốc.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 16, 45],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.65);
    HL.fit(C, [[-40, -15, 0], [40, 15, 34]], 200, 148);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Heavy Test Bench Base (Z: 0 to 2.4)
    const baseSol = HL.solid(svg);
    const [baseO, baseI] = HL.rings(-40, -14, 40, 14, 2.2, 0.6);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.4));

    for (const [cx, cy] of [[-37, -11], [37, -11], [-37, 11], [37, 11]]) {
      const pt = P(cx, cy, 2.45);
      HL.mk("ellipse", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), rx: 1.8, ry: 1.4, class: "lo" }, svg);
      HL.mk("circle", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 0.7, class: "dot" }, svg);
    }

    // 2. Brass Hinge Bracket at X = -28 (Z: 2.4 to 6.0)
    const pivotX = -28.0, pivotZ = 6.0;
    const hingeSol = HL.solid(svg);
    const [hO, hI] = HL.rings(pivotX - 3.5, -9.0, pivotX + 3.5, 9.0, 0.8, 0.3);
    HL.put(hingeSol, HL.prism(P, front, hO, hI, 2.4, pivotZ));
    HL.mk("path", { d: HL.seg(P(pivotX, -9.5, pivotZ), P(pivotX, 9.5, pivotZ)), class: "sil nf" }, svg);

    // 3. Sector Protractor Plate (front face Y = 9.2)
    const protractorGroup = HL.mk("g", {}, svg);
    const arcR = 18.0;
    const arcPts = [];
    let tickLoD = "", tickHiD = "";
    for (let deg = 0; deg <= 45; deg += 3) {
      const rad = (deg * Math.PI) / 180;
      const pt = P(pivotX + arcR * Math.cos(rad), 9.2, pivotZ + arcR * Math.sin(rad));
      arcPts.push(pt);
      if (deg % 15 === 0 || deg === 24) {
        const pIn = P(pivotX + (arcR - 2.8) * Math.cos(rad), 9.2, pivotZ + (arcR - 2.8) * Math.sin(rad));
        if (deg === 24) tickHiD += HL.seg(pIn, pt);
        else tickLoD += HL.seg(pIn, pt);
      }
    }
    const angleArc = HL.mk("path", { d: HL.open(arcPts), class: "lo nf dash" }, protractorGroup);
    HL.mk("path", { d: tickLoD, class: "lo nf" }, protractorGroup);

    const critRad = (24 * Math.PI) / 180;
    tickHiD += HL.seg(
      P(pivotX + 6.0 * Math.cos(critRad), 9.2, pivotZ + 6.0 * Math.sin(critRad)),
      P(pivotX + (arcR + 1.5) * Math.cos(critRad), 9.2, pivotZ + (arcR + 1.5) * Math.sin(critRad))
    );
    HL.mk("path", { d: tickHiD, class: "hi nf" }, protractorGroup);

    // 4. Support Strut, Hinged Ramp Plank, Sliding Block & Force Vectors
    const strutLine = HL.mk("path", { class: "sil nf" }, svg);
    const rampSol = HL.solid(svg);
    const motionTicks = HL.mk("path", { class: "lo nf dash" }, svg);
    const blockSol = HL.solid(svg);
    const blockKnob = HL.mk("circle", { r: 1.5, class: "dot" }, svg);
    const vecP = HL.mk("path", { class: "hi nf" }, svg);
    const vecF = HL.mk("path", { class: "hi nf" }, svg);
    const vecN = HL.mk("path", { class: "lo nf" }, svg);

    const rampLength = 60.0, rampW = 8.4, rampH = 2.4;
    const blockL = 12.5, blockW = 6.6, blockH = 6.0;
    const initialDeg = initialV != null ? initialV : 16;
    const spAlpha = HL.spring((initialDeg * Math.PI) / 180, { k: 120, c: 14 });
    const spBoxU = HL.spring(44.0, { k: 70, c: 10 });
    let lastKey = "";

    function rPt(u, v, w, alpha) {
      const ca = Math.cos(alpha), sa = Math.sin(alpha);
      return P(pivotX + u * ca - w * sa, v, pivotZ + u * sa + w * ca);
    }

    function box3D(u0, u1, v0, v1, w0, w1, alpha) {
      const p000 = rPt(u0, v0, w0, alpha), p100 = rPt(u1, v0, w0, alpha);
      const p110 = rPt(u1, v1, w0, alpha), p010 = rPt(u0, v1, w0, alpha);
      const p001 = rPt(u0, v0, w1, alpha), p101 = rPt(u1, v0, w1, alpha);
      const p111 = rPt(u1, v1, w1, alpha), p011 = rPt(u0, v1, w1, alpha);
      const sil = HL.poly(HL.hull([p000, p100, p110, p010, p001, p101, p111, p011]));
      const crease = HL.seg(p011, p111) + HL.seg(p111, p101) + HL.seg(p111, p110);
      return { sil, crease };
    }

    function arrowSeg(p0, p1) {
      const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const nx = -uy, ny = ux;
      const aL = [p1[0] - ux * 4.5 + nx * 2.2, p1[1] - uy * 4.5 + ny * 2.2];
      const aR = [p1[0] - ux * 4.5 - nx * 2.2, p1[1] - uy * 4.5 - ny * 2.2];
      return HL.seg(p0, p1) + HL.open([aL, p1, aR]);
    }

    function draw() {
      const alpha = spAlpha.x, boxU = spBoxU.x;
      const key = `${HL.r2(alpha)}:${HL.r2(boxU)}`;
      if (key === lastKey) return;
      lastKey = key;

      const alphaDeg = (alpha * 180) / Math.PI;
      const rampBox = box3D(0, rampLength, -rampW, rampW, 0, rampH, alpha);
      const stopBox = box3D(4.2, 6.4, -rampW + 1.0, rampW - 1.0, rampH, rampH + 2.6, alpha);
      HL.put(rampSol, { sil: rampBox.sil + stopBox.sil, crease: rampBox.crease + stopBox.crease });

      strutLine.setAttribute("d", HL.seg(P(16, 6.5, 2.4), rPt(46, 6.5, 0, alpha)));
      motionTicks.setAttribute("d", HL.seg(rPt(10, 0, rampH + 0.1, alpha), rPt(54, 0, rampH + 0.1, alpha)));

      const blk = box3D(boxU - blockL / 2, boxU + blockL / 2, -blockW / 2, blockW / 2, rampH, rampH + blockH, alpha);
      HL.put(blockSol, blk);
      HL.place(blockKnob, rPt(boxU, 0, rampH + blockH + 0.2, alpha));

      // Force vectors from block front/top center along slope (P_parallel, F_ms) & normal (N)
      const cCenter = rPt(boxU, 0, rampH + blockH / 2, alpha);
      const pSlopeDown = rPt(boxU - 11.5, 0, rampH + blockH / 2, alpha);
      const pFricUp = rPt(boxU + 10.5, 0, rampH + blockH / 2, alpha);
      const pNorm = rPt(boxU, 0, rampH + blockH + 7.2, alpha);
      vecP.setAttribute("d", arrowSeg(cCenter, pSlopeDown));
      vecF.setAttribute("d", arrowSeg(cCenter, pFricUp));
      vecN.setAttribute("d", arrowSeg(rPt(boxU, 0, rampH + blockH, alpha), pNorm));
      angleArc.classList.toggle("lo", true);

      const isSliding = alphaDeg > 24.0;
      blockSol.sil.classList.toggle("hi", isSliding);
      const angleStr = alphaDeg.toFixed(1);
      read.textContent = isSliding ? `α=${angleStr}° > 24° · Trượt!` : `α=${angleStr}° ≤ 24° · Đứng yên`;
    }

    function setAngle(deg) {
      const clamped = HL.clamp(deg, 0, 45);
      spAlpha.t = (clamped * Math.PI) / 180;
      spBoxU.t = clamped > 24.0 ? 13.0 : 44.0;
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setAngle(16.0); return; }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 14);
      const norm = HL.clamp(1.0 - (wx + wy + 18) / 36, 0, 1);
      setAngle(norm * 45.0);
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(spAlpha, dt);
      const m2 = HL.stepS(spBoxU, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setAngle(Number(v)); }, destroy: bag.dispose };
  }
};
