/*
 * 1. Lever & Fulcrum (Đòn Bẩy & Điểm Tựa - Định Luật Đòn Bẩy Acsimet)
 * Physical Concept: Cân bằng mô-men lực: M₁ = F₁ · d₁ = M₂ = F₂ · d₂
 *   - Lực trọng trường: F₁ = m₁·g = 20 N (m₁ = 2.0 kg), F₂ = m₂·g = 10 N (m₂ = 1.0 kg)
 *   - Cánh tay đòn: d₁ = |x₁ - x_f|, d₂ = |x₂ - x_f|
 *   - Khi d₂ / d₁ = F₁ / F₂ = 2: Mô-men triệt tiêu hoàn toàn (M₁ == M₂ = 3.20 N·m), đòn bẩy thăng bằng tuyệt đối.
 * Geometry (Precision Analytical Balance Discipline):
 *   - Bệ gang kép vững chãi (Dual-foot cast-iron balance bed) với rãnh trượt khắc vạch mm.
 *   - Điểm tựa nêm dao thép tôi (hardened knife-edge fulcrum) với kim chỉ thị độ lệch.
 *   - Thanh đòn bẩy hợp kim xẻ rãnh chia vạch cm, có kim dọi tâm thẳng đứng (vertical plumb needle).
 *   - 2 quả cân chuẩn bằng đồng thau có núm cầm tiện tròn (knurled knob weights).
 * Meaningful Kinematics: Di chuột trượt điểm tựa nêm; thanh đòn bẩy nghiêng theo chênh lệch mô-men.
 * Khi dịch điểm tựa về x_f = -8.0 cm (tỉ lệ 2:1), đòn bẩy lập tức thăng bằng, kim dọi trùng vạch tâm, kích hoạt trạng thái cân bằng.
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
    const C = HL.Cam(45, 0.5, 2.5);
    HL.fit(C, [[-44, -14, 0], [44, 14, 25]], 200, 160);
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

    // 1. Cast-Iron Laboratory Balance Bed (Z: 0 to 2.4)
    // Heavy dual-leg chassis with precision slider guideway
    const bedSol = HL.solid(svg);
    const [bedO, bedI] = HL.rings(-44, -14, 44, 14, 2.4, 0.6);
    HL.put(bedSol, HL.prism(P, front, bedO, bedI, 0, 2.4));

    // Longitudinal precision guide rail on bed (Z = 2.45)
    HL.mk("line", {
      x1: HL.r2(P(-36, 0, 2.45)[0]), y1: HL.r2(P(-36, 0, 2.45)[1]),
      x2: HL.r2(P(36, 0, 2.45)[0]), y2: HL.r2(P(36, 0, 2.45)[1]),
      class: "lo", "stroke-width": 1.2
    }, svg);

    // Bed Scale graduation ticks (-24 to +24 cm)
    for (let gx = -24; gx <= 24; gx += 4) {
      const p1 = P(gx, -2.5, 2.45);
      const p2 = P(gx, 2.5, 2.45);
      HL.mk("line", {
        x1: HL.r2(p1[0]), y1: HL.r2(p1[1]),
        x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
        class: gx === -8 || gx === 0 ? "hi" : "lo",
        "stroke-width": gx === -8 || gx === 0 ? 1.2 : 0.6
      }, svg);
    }

    // 2. Triangular Knife-Edge Fulcrum (Điểm tựa nêm dao thép)
    const fulcrumGroup = HL.mk("g", {}, svg);
    const fulcrumSide = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, fulcrumGroup);
    const fulcrumTop = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, fulcrumGroup);
    const fulcrumIndexNeedle = HL.mk("line", { class: "hi", "stroke-width": 1.4 }, fulcrumGroup);

    // 3. Tilting Balance Beam (Thanh đòn bẩy chia vạch)
    const beamHalfL = 36.0; // Total length 72.0 (-36 to +36)
    const beamW = 5.2;      // Width Y: -2.6 to +2.6
    const beamH = 2.4;      // Height in Z

    const beamGroup = HL.mk("g", {}, svg);
    const beamSide = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, beamGroup);
    const beamTop = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, beamGroup);
    const beamTicks = HL.mk("path", { class: "lo", fill: "none", "stroke-width": 0.8 }, beamGroup);

    // Center Plumb Needle & Indicator Arch (Kim dọi tâm thẳng đứng)
    const plumbNeedle = HL.mk("line", { class: "lo", "stroke-width": 1.4, stroke: "var(--hl-edge)" }, beamGroup);
    const plumbBob = HL.mk("circle", { r: 1.5, class: "dot" }, beamGroup);
    const plumbZeroMark = HL.mk("line", { class: "hi", "stroke-width": 1.2 }, fulcrumGroup);

    // 4. Two Brass Precision Calibration Weights
    // Mass 1: 2.0 kg (Weight F1 = 20 N) at relative lever position x = -24
    // Mass 2: 1.0 kg (Weight F2 = 10 N) at relative lever position x = +24
    const load1Sol = HL.solid(svg);
    const load2Sol = HL.solid(svg);

    // Kinematics Springs
    // Initial fulcrum position
    const spXf = HL.spring(initialV != null ? initialV : -8.0, { k: 140, c: 15 });
    // Beam tilt angle (radians)
    const spTheta = HL.spring(0, { k: 90, c: 14 });

    function draw() {
      const xf = spXf.x;
      const th = spTheta.x;

      // A. Draw Sliding Wedge Fulcrum (Apex at X = xf, Z = 9.8)
      const apexZ = 9.8;
      const fBaseL0 = P(xf - 4.5, -5.5, 2.4), fBaseL1 = P(xf - 4.5, 5.5, 2.4);
      const fBaseR0 = P(xf + 4.5, -5.5, 2.4), fBaseR1 = P(xf + 4.5, 5.5, 2.4);
      const fApex0 = P(xf, -5.5, apexZ), fApex1 = P(xf, 5.5, apexZ);

      // Fulcrum surfaces
      let fSideD = "";
      // Front triangular face at Y = 5.5
      fSideD += HL.poly([fBaseL1, fBaseR1, fApex1]);
      // Right sloped facet
      fSideD += HL.poly([fBaseR1, fApex1, fApex0, fBaseR0]);
      fulcrumSide.setAttribute("d", fSideD);
      // Left sloped facet
      fulcrumTop.setAttribute("d", HL.poly([fBaseL0, fApex0, fApex1, fBaseL1]));

      // Fulcrum vernier indicator mark on base
      fulcrumIndexNeedle.setAttribute("x1", HL.r2(fApex1[0]));
      fulcrumIndexNeedle.setAttribute("y1", HL.r2(fApex1[1]));
      fulcrumIndexNeedle.setAttribute("x2", HL.r2(fApex1[0]));
      fulcrumIndexNeedle.setAttribute("y2", HL.r2(fApex1[1] + 5));

      // Plumb zero index on fulcrum
      const fZero0 = P(xf, 5.5, apexZ);
      const fZero1 = P(xf, 5.5, apexZ + 5.0);
      plumbZeroMark.setAttribute("x1", HL.r2(fZero0[0]));
      plumbZeroMark.setAttribute("y1", HL.r2(fZero0[1]));
      plumbZeroMark.setAttribute("x2", HL.r2(fZero1[0]));
      plumbZeroMark.setAttribute("y2", HL.r2(fZero1[1]));

      // B. Draw Tilting Beam
      // Pivot point is at (xf, 0, apexZ + beamH/2)
      const cosT = Math.cos(th), sinT = Math.sin(th);
      const sMin = -beamHalfL - xf; // Left end relative to fulcrum
      const sMax = beamHalfL - xf;  // Right end relative to fulcrum

      const beamPt = (s, y, zRel) => {
        const x = xf + s * cosT - zRel * sinT;
        const z = apexZ + beamH / 2 + s * sinT + zRel * cosT;
        return P(x, y, z);
      };

      const b0 = beamPt(sMin, -beamW / 2, -beamH / 2);
      const b1 = beamPt(sMax, -beamW / 2, -beamH / 2);
      const b2 = beamPt(sMax, beamW / 2, -beamH / 2);
      const b3 = beamPt(sMin, beamW / 2, -beamH / 2);

      const t0 = beamPt(sMin, -beamW / 2, beamH / 2);
      const t1 = beamPt(sMax, -beamW / 2, beamH / 2);
      const t2 = beamPt(sMax, beamW / 2, beamH / 2);
      const t3 = beamPt(sMin, beamW / 2, beamH / 2);

      let bSideD = "";
      bSideD += HL.poly([b3, b2, t2, t3]); // Front longitudinal wall
      if (th < 0) {
        bSideD += HL.poly([b2, b1, t1, t2]); // Right end face
      } else {
        bSideD += HL.poly([b3, b0, t0, t3]); // Left end face
      }
      beamSide.setAttribute("d", bSideD);
      beamTop.setAttribute("d", HL.poly([t0, t1, t2, t3]));

      // Engraved graduation lines along beam
      let tickD = "";
      for (let s = -32; s <= 32; s += 4) {
        const pA = beamPt(s - xf, -beamW / 2 + 0.6, beamH / 2);
        const pB = beamPt(s - xf, beamW / 2 - 0.6, beamH / 2);
        tickD += `M ${HL.r2(pA[0])} ${HL.r2(pA[1])} L ${HL.r2(pB[0])} ${HL.r2(pB[1])} `;
      }
      beamTicks.setAttribute("d", tickD);

      // Center Plumb Needle pointing upwards from beam midpoint
      const plumbBase = beamPt(-xf, 0, beamH / 2);
      const plumbTip = beamPt(-xf, 0, beamH / 2 + 7.5);
      plumbNeedle.setAttribute("x1", HL.r2(plumbBase[0]));
      plumbNeedle.setAttribute("y1", HL.r2(plumbBase[1]));
      plumbNeedle.setAttribute("x2", HL.r2(plumbTip[0]));
      plumbNeedle.setAttribute("y2", HL.r2(plumbTip[1]));
      plumbBob.setAttribute("cx", HL.r2(plumbTip[0]));
      plumbBob.setAttribute("cy", HL.r2(plumbTip[1]));

      // C. Draw 2 Brass Calibration Weights on the Beam
      // M1 (2.0 kg, F1 = 20 N) at absolute beam station s = -24
      const s1 = -24.0 - xf;
      const m1BaseZ = apexZ + beamH / 2 + s1 * sinT + (beamH / 2) * cosT;
      const m1BaseX = xf + s1 * cosT - (beamH / 2) * sinT;
      const m1RingO = circAt(m1BaseX, 0, 3.4, 20);
      const m1RingI = circAt(m1BaseX, 0, 3.0, 20);
      HL.put(load1Sol, HL.prism(P, front, m1RingO, m1RingI, m1BaseZ, m1BaseZ + 7.5));

      // M2 (1.0 kg, F2 = 10 N) at absolute beam station s = +24
      const s2 = 24.0 - xf;
      const m2BaseZ = apexZ + beamH / 2 + s2 * sinT + (beamH / 2) * cosT;
      const m2BaseX = xf + s2 * cosT - (beamH / 2) * sinT;
      const m2RingO = circAt(m2BaseX, 0, 3.4, 20);
      const m2RingI = circAt(m2BaseX, 0, 3.0, 20);
      HL.put(load2Sol, HL.prism(P, front, m2RingO, m2RingI, m2BaseZ, m2BaseZ + 4.2));

      // D. Physics Balance Calculation
      const d1Cm = Math.abs(-24.0 - xf);
      const d2Cm = Math.abs(24.0 - xf);
      const d1M = d1Cm / 100.0;
      const d2M = d2Cm / 100.0;
      const m1Torque = 20.0 * d1M; // F1 * d1 (N*m)
      const m2Torque = 10.0 * d2M; // F2 * d2 (N*m)
      const isBalanced = Math.abs(m1Torque - m2Torque) < 0.08;

      beamTop.classList.toggle("hi", isBalanced);
      plumbNeedle.classList.toggle("hi", isBalanced);
      plumbZeroMark.classList.toggle("hi", isBalanced);

      const d1Str = HL.r2(d1Cm);
      const d2Str = HL.r2(d2Cm);
      const t1Str = HL.r2(m1Torque);
      const t2Str = HL.r2(m2Torque);

      if (isBalanced) {
        read.textContent = `Đòn bẩy: [CÂN BẰNG HOÀN HẢO] M₁ = 20N×${d1Str}cm = ${t1Str} N·m == M₂ = 10N×${d2Str}cm = ${t2Str} N·m (d₂ = 2·d₁)`;
      } else if (th > 0) {
        read.textContent = `Đòn bẩy: Lệch trái! M₁ (${t1Str} N·m) > M₂ (${t2Str} N·m) · Kéo điểm tựa sang trái để cân bằng`;
      } else {
        read.textContent = `Đòn bẩy: Lệch phải! M₁ (${t1Str} N·m) < M₂ (${t2Str} N·m) · Kéo điểm tựa sang phải để cân bằng`;
      }
    }

    function setFulcrumX(targetX) {
      const clampedX = HL.clamp(targetX, -20, 16);
      spXf.t = clampedX;

      // Physical torque:
      // M1 = 20N at x = -24 => arm d1 = clampedX - (-24) = clampedX + 24
      // M2 = 10N at x = +24 => arm d2 = 24 - clampedX
      // Torque clockwise (positive tilts left down):
      const t1 = 20.0 * (clampedX + 24) * 0.01;
      const t2 = 10.0 * (24 - clampedX) * 0.01;
      const netTorque = t1 - t2;

      // Mechanical stops at +- 11 degrees
      const targetAngle = HL.clamp((netTorque / 1.8) * 0.19, -0.19, 0.19);
      // Snap to exact zero when within balance tolerance
      spTheta.t = Math.abs(netTorque) < 0.08 ? 0.0 : targetAngle;

      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setFulcrumX(-8.0); // Exact physical balance position
        return;
      }
      const sMinX = P(-24, 0, 5)[0];
      const sMaxX = P(20, 0, 5)[0];
      const norm = HL.clamp((pt[0] - sMinX) / (sMaxX - sMinX), 0, 1);
      const targetX = -20 + norm * 36;
      setFulcrumX(targetX);
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(spXf, dt);
      const m2 = HL.stepS(spTheta, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setFulcrumX(Number(v));
      },
      destroy: bag.dispose
    };
  }
};
