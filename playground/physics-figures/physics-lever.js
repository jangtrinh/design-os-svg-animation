/*
 * 1. Lever & Fulcrum (Đòn Bẩy & Điểm Tựa - Định Luật Đòn Bẩy Acsimet)
 * Physical Concept: Cân bằng mô-men lực: M₁ = F₁ · d₁ = M₂ = F₂ · d₂
 */

export default {
  id: "physics-lever",
  title: "1. Đòn Bẩy & Điểm Tựa (Lever & Fulcrum)",
  concept: "Quy tắc đòn bẩy: F₁ · d₁ = F₂ · d₂ (Cân bằng mô-men lực)",
  means: "Di chuột ngang để dịch chuyển vị trí điểm tựa nêm: thanh đòn nghiêng mượt mà theo độ lệch mô-men. Khi cánh tay đòn đạt đúng tỉ lệ 2:1 (d₂ = 2d₁), đòn bẩy thăng bằng tuyệt đối, kim chỉ tâm kích hoạt trạng thái cân bằng.",
  rules: [1, 2, 4, 6, 9],
  range: [-20, -8.0, 15],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.45);
    HL.fit(C, [[-42, -14, 0], [42, 14, 28]], 200, 156);
    const P = HL.proj(C), front = HL.facing(C);

    function circAt(cx, cy, R, n = 20) {
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        out.push({ u: cx + R * ca, v: cy + R * sa, nu: ca, nv: sa });
      }
      return out;
    }

    // 1. Cast-Iron Laboratory Balance Bed (Z: 0 to 2.6)
    const bedSol = HL.solid(svg);
    const [bedO, bedI] = HL.rings(-42, -13, 42, 13, 2.4, 0.6);
    HL.put(bedSol, HL.prism(P, front, bedO, bedI, 0, 2.6));

    // Longitudinal guide rail & graduation ticks on bed (Z = 2.65)
    let bedLoD = HL.seg(P(-36, 0, 2.65), P(36, 0, 2.65));
    let bedHiD = "";
    for (let gx = -24; gx <= 24; gx += 4) {
      const s = HL.seg(P(gx, -2.6, 2.65), P(gx, 2.6, 2.65));
      if (gx === -8 || gx === 0) bedHiD += s;
      else bedLoD += s;
    }
    HL.mk("path", { d: bedLoD, class: "lo nf" }, svg);
    HL.mk("path", { d: bedHiD, class: "hi nf" }, svg);

    // 2. Stepped 3D Pedestal + Knife-Edge Prism Fulcrum
    const pedSol = HL.solid(svg);
    const fulcrumGroup = HL.mk("g", {}, svg);
    const fulcrumHull = HL.mk("path", { class: "sil" }, fulcrumGroup);
    const fulcrumCr = HL.mk("path", { class: "lo nf" }, fulcrumGroup);
    const fulcrumZeroMark = HL.mk("path", { class: "hi nf" }, fulcrumGroup);

    // 3. Hanging Brass Calibration Weights & Suspension Hooks (hooks drawn AFTER weights so wire connects to top center)
    const load1Sol = HL.solid(svg);
    const load2Sol = HL.solid(svg);
    const hooksPath = HL.mk("path", { class: "sil nf" }, svg);
    const hook1Dot = HL.mk("circle", { r: 1.5, class: "dot m" }, svg);
    const hook2Dot = HL.mk("circle", { r: 1.5, class: "dot m" }, svg);

    // 4. Tilting Balance Beam & Plumb Needle
    const beamHalfL = 36.0, beamW = 5.2, beamH = 2.6;
    const beamGroup = HL.mk("g", {}, svg);
    const beamSide = HL.mk("path", { class: "sil" }, beamGroup);
    const beamTop = HL.mk("path", { class: "sil" }, beamGroup);
    const beamTicks = HL.mk("path", { class: "lo nf" }, beamGroup);
    const plumbNeedle = HL.mk("path", { class: "lo nf" }, beamGroup);
    const plumbBob = HL.mk("circle", { r: 1.6, class: "dot" }, beamGroup);

    const spXf = HL.spring(initialV != null ? initialV : -8.0, { k: 140, c: 15 });
    const spTheta = HL.spring(0, { k: 90, c: 14 });
    let lastKey = "";

    function draw() {
      const xf = spXf.x, th = spTheta.x;
      const key = `${HL.r2(xf)}:${HL.r2(th)}`;
      if (key === lastKey) return;
      lastKey = key;

      // A. Stepped Pedestal Base (Z: 2.6 to 8.0) + 3D Knife-Edge Prism (Z: 8.0 to 18.2)
      const [pedO, pedI] = HL.rings(xf - 5.0, -5.8, xf + 5.0, 5.8, 1.2, 0.4);
      HL.put(pedSol, HL.prism(P, front, pedO, pedI, 2.6, 8.0));

      const apexZ = 18.2;
      const fBL0 = P(xf - 3.8, -4.8, 8.0), fBL1 = P(xf - 3.8, 4.8, 8.0);
      const fBR0 = P(xf + 3.8, -4.8, 8.0), fBR1 = P(xf + 3.8, 4.8, 8.0);
      const fAp0 = P(xf, -4.8, apexZ), fAp1 = P(xf, 4.8, apexZ);
      fulcrumHull.setAttribute("d", HL.poly(HL.hull([fBL0, fBR0, fBR1, fBL1, fAp0, fAp1])));
      fulcrumCr.setAttribute("d", HL.seg(fBL1, fAp1) + HL.seg(fBR1, fAp1) + HL.seg(fAp0, fAp1));
      fulcrumZeroMark.setAttribute("d", HL.seg(P(xf, 4.8, 12.5), fAp1));

      // B. Tilting Beam around (xf, 0, apexZ + beamH/2)
      const cosT = Math.cos(th), sinT = Math.sin(th);
      const sMin = -beamHalfL - xf, sMax = beamHalfL - xf;
      const beamWorld = (s, y, zRel) => [
        xf + s * cosT - zRel * sinT,
        y,
        apexZ + beamH / 2 + s * sinT + zRel * cosT
      ];
      const beamPt = (s, y, zRel) => P(...beamWorld(s, y, zRel));

      const b0 = beamPt(sMin, -beamW / 2, -beamH / 2), b1 = beamPt(sMax, -beamW / 2, -beamH / 2);
      const b2 = beamPt(sMax, beamW / 2, -beamH / 2), b3 = beamPt(sMin, beamW / 2, -beamH / 2);
      const t0 = beamPt(sMin, -beamW / 2, beamH / 2), t1 = beamPt(sMax, -beamW / 2, beamH / 2);
      const t2 = beamPt(sMax, beamW / 2, beamH / 2), t3 = beamPt(sMin, beamW / 2, beamH / 2);

      const endFace = th < 0 ? HL.poly([b2, b1, t1, t2]) : HL.poly([b3, b0, t0, t3]);
      beamSide.setAttribute("d", HL.poly([b3, b2, t2, t3]) + endFace);
      beamTop.setAttribute("d", HL.poly([t0, t1, t2, t3]));

      let tickD = "";
      for (let s = -32; s <= 32; s += 4) {
        tickD += HL.seg(beamPt(s - xf, -beamW / 2 + 0.6, beamH / 2), beamPt(s - xf, beamW / 2 - 0.6, beamH / 2));
      }
      beamTicks.setAttribute("d", tickD);

      const plumbBase = beamPt(0, 0, beamH / 2);
      const plumbTip = beamPt(0, 0, beamH / 2 + 6.8);
      plumbNeedle.setAttribute("d", HL.seg(plumbBase, plumbTip));
      HL.place(plumbBob, plumbTip);

      // C. Hanging Brass Weights suspended by visible vertical hooks below the beam
      const s1 = -24.0 - xf, s2 = 24.0 - xf;
      const w1Top = beamWorld(s1, 0, -beamH / 2);
      const w2Top = beamWorld(s2, 0, -beamH / 2);
      const z1Top = w1Top[2] - 4.8, z2Top = w2Top[2] - 4.8;

      HL.put(load1Sol, HL.prism(P, front, circAt(w1Top[0], 0, 4.4, 20), circAt(w1Top[0], 0, 3.8, 20), z1Top - 6.6, z1Top));
      HL.put(load2Sol, HL.prism(P, front, circAt(w2Top[0], 0, 3.8, 20), circAt(w2Top[0], 0, 3.2, 20), z2Top - 4.4, z2Top));

      const p1Top = P(...w1Top), p1Bot = P(w1Top[0], 0, z1Top);
      const p2Top = P(...w2Top), p2Bot = P(w2Top[0], 0, z2Top);
      hooksPath.setAttribute("d", HL.seg(p1Top, p1Bot) + HL.seg(p2Top, p2Bot));
      HL.place(hook1Dot, p1Bot);
      HL.place(hook2Dot, p2Bot);

      // D. Balance & Readout
      const m1Torque = 20.0 * Math.abs(-24.0 - xf) * 0.01;
      const m2Torque = 10.0 * Math.abs(24.0 - xf) * 0.01;
      const isBalanced = Math.abs(m1Torque - m2Torque) < 0.08;

      beamTop.classList.toggle("hi", isBalanced);
      plumbNeedle.classList.toggle("hi", isBalanced);

      const t1Str = m1Torque.toFixed(1), t2Str = m2Torque.toFixed(1);
      if (isBalanced) read.textContent = `M₁=${t1Str} == M₂=${t2Str} N·m`;
      else if (th > 0) read.textContent = `Lệch trái · M₁=${t1Str}>${t2Str}`;
      else read.textContent = `Lệch phải · M₁=${t1Str}<${t2Str}`;
    }

    function setFulcrumX(targetX) {
      const clampedX = HL.clamp(targetX, -20, 15);
      spXf.t = clampedX;
      const netTorque = 20.0 * (clampedX + 24) * 0.01 - 10.0 * (24 - clampedX) * 0.01;
      const targetAngle = HL.clamp((netTorque / 1.8) * 0.16, -0.16, 0.16);
      spTheta.t = Math.abs(netTorque) < 0.08 ? 0.0 : targetAngle;
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setFulcrumX(-8.0); return; }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 14);
      setFulcrumX((wx - wy) * 0.65);
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(spXf, dt);
      const m2 = HL.stepS(spTheta, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setFulcrumX(Number(v)); }, destroy: bag.dispose };
  }
};
