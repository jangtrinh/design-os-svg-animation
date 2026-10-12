/*
 * 5 Physics Figures Definitions (Hairline 2:1 Axonometric Standard)
 * Modularized Architecture - Auto-bundled
 */

if (typeof HL !== "undefined" && HL.inject) {
  HL.inject(document);
}

const PHYSICS_FIGURES = [
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

{
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
},
/*
 * 2. Simple Harmonic Pendulum & Energy Conservation (Con Lắc Đơn & Bảo Toàn Cơ Năng)
 * Physical Concept: Bảo toàn cơ năng & chuyển hóa năng lượng thực tế:
 *   - Cơ năng toàn phần: E = W_đ + W_t
 *   - Thế năng trọng trường: W_t = m·g·L(1 - cos θ)
 *   - Động năng: W_đ = 1/2·m·v² = 1/2·m·(L·ω)²
 *   - Tính toán động năng THẬT TỪ VẬN TỐC GÓC ω (rad/s), không dùng giả định W_đ = 100 - W_t.
 *   - Khi con lắc đứng yên tại VTCB (θ = 0, ω = 0): W_t = 0% VÀ W_đ = 0% (hệ nghỉ).
 *   - Phương trình vi phân dao động có cản: d²θ/dt² + 2β·dθ/dt + (g/L)·sin θ = 0
 * Geometry (Lucas Markes Specimen Discipline):
 *   - Chân đế gang đúc chữ T vững chãi (Heavy T-frame cast-iron base).
 *   - Cột đứng thép đặc, tay đòn ngang vươn ra điểm treo chính giữa.
 *   - Quả nặng hình cầu kim loại đặc 3D thật (true spherical projection, không bị elip hóa dẹt).
 *   - Vạch cung quỹ đạo, vạch tâm dọi VTCB.
 */

{
  id: "physics-pendulum",
  title: "2. Con Lắc Đơn (Harmonic Pendulum)",
  concept: "Bảo toàn cơ năng: E = W_t(θ) + W_đ(ω) · Tính từ vận tốc góc thực tế ω",
  means: "Kéo thả quả nặng đến góc lệch biên (±35°); con lắc dao động tự do với tần số thực ω = √(g/L), chuyển hóa thế năng và động năng thật, giảm chấn vật lý tắt dần.",
  rules: [1, 2, 4, 6, 8],
  range: [-35, 25, 35],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 3.2);
    HL.fit(C, [[-26, -10, 0], [22, 10, 42]], 200, 160);
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

    // 1. Heavy Cast-Iron T-Frame Base (Chân đế gang chữ T: X = -24 to -6, Y = -10 to 10, Z = 0 to 2.4)
    const baseSol = HL.solid(svg);
    // Main longitudinal foot
    const [bFootO, bFootI] = HL.rings(-26, -3, -6, 3, 1.2, 0.4);
    HL.put(baseSol, HL.prism(P, front, bFootO, bFootI, 0, 2.4));

    // Transverse cross foot at back (X = -26 to -20, Y = -10 to 10)
    const crossSol = HL.solid(svg);
    const [cFootO, cFootI] = HL.rings(-25.5, -9, -18.5, 9, 1.2, 0.4);
    HL.put(crossSol, HL.prism(P, front, cFootO, cFootI, 0, 2.2));

    // 2. Rigid Vertical Post & Cantilever Suspension Arm
    // Vertical post at X = -21, Y = 0 (Z: 2.4 to 40.0)
    const postSol = HL.solid(svg);
    const postO = circAt(-21, 0, 1.8, 18);
    const postI = circAt(-21, 0, 1.4, 18);
    HL.put(postSol, HL.prism(P, front, postO, postI, 2.4, 40.0));

    // Horizontal top cantilever arm: from X = -22 to X = 2 at Z = 38.5 to 40.5
    const armSol = HL.solid(svg);
    const [armO, armI] = HL.rings(-23, -1.8, 2.5, 1.8, 0.8, 0.3);
    HL.put(armSol, HL.prism(P, front, armO, armI, 38.5, 40.5));

    // Pivot suspension pin at (0, 0, 39.0)
    const pPivot = P(0, 0, 39.0);
    const pivotPin = HL.mk("circle", {
      cx: HL.r2(pPivot[0]), cy: HL.r2(pPivot[1]), r: 2.4,
      class: "hi", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4
    }, svg);

    // Equilibrium plumb reference line (Vạch chuẩn tâm VTCB)
    const plumbBot = P(0, 0, 5.0);
    HL.mk("line", {
      x1: HL.r2(pPivot[0]), y1: HL.r2(pPivot[1]),
      x2: HL.r2(plumbBot[0]), y2: HL.r2(plumbBot[1]),
      class: "lo", "stroke-width": 0.8, "stroke-dasharray": "2,2"
    }, svg);

    // Circular trajectory path arc
    const trajPath = HL.mk("path", { class: "lo", fill: "none", stroke: "var(--hl-edge)", "stroke-dasharray": "3,3", "stroke-width": 0.8 }, svg);

    // 3. String & True Spherical Pendulum Bob
    const L = 28.0; // String length (cm in scale)
    const bobR = 5.2; // Spherical bob radius

    const stringLine = HL.mk("line", { class: "hi", "stroke-width": 1.2, stroke: "var(--hl-edge)" }, svg);
    const bobGroup = HL.mk("g", {}, svg);
    const bobBody = HL.mk("circle", { r: bobR * C.S, class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, bobGroup);
    const bobEquator = HL.mk("path", { class: "lo", fill: "none", stroke: "var(--hl-edge)", "stroke-width": 0.8 }, bobGroup);
    const bobShine = HL.mk("circle", { r: 1.4, fill: "var(--hl-edge)", stroke: "none" }, bobGroup);

    // Physics State & Integrator
    let theta = initialV != null ? (initialV * Math.PI) / 180 : (25 * Math.PI) / 180;
    let omega = 0.0; // Angular velocity (rad/s)
    let isDragging = false;
    const g = 980.0; // cm/s^2
    const damping = 0.18; // Physical viscous air damping

    // Precalculate trajectory arc
    const arcPts = [];
    for (let deg = -38; deg <= 38; deg += 2) {
      const a = (deg * Math.PI) / 180;
      arcPts.push(P(L * Math.sin(a), 0, 39.0 - L * Math.cos(a)));
    }
    trajPath.setAttribute("d", "M " + arcPts.map(p => `${HL.r2(p[0])} ${HL.r2(p[1])}`).join(" L "));

    function draw() {
      // Bob center in 3D: (X = L * sin theta, Y = 0, Z = 39.0 - L * cos theta)
      const bx = L * Math.sin(theta);
      const bz = 39.0 - L * Math.cos(theta);
      const pBob = P(bx, 0, bz);

      // String line from pivot to bob top collar
      stringLine.setAttribute("x1", HL.r2(pPivot[0]));
      stringLine.setAttribute("y1", HL.r2(pPivot[1]));
      stringLine.setAttribute("x2", HL.r2(pBob[0]));
      stringLine.setAttribute("y2", HL.r2(pBob[1]));

      // True 3D Sphere in orthographic axonometric projection:
      // The silhouette of a 3D sphere is an exact 2D circle with screen radius R_scr = R * S!
      bobBody.setAttribute("cx", HL.r2(pBob[0]));
      bobBody.setAttribute("cy", HL.r2(pBob[1]));

      // 3D Equator Ellipse tilt:
      const eqW = bobR * C.S;
      const eqH = bobR * C.S * 0.35;
      bobEquator.setAttribute("d", `M ${HL.r2(pBob[0] - eqW)} ${HL.r2(pBob[1])} A ${HL.r2(eqW)} ${HL.r2(eqH)} 0 0 0 ${HL.r2(pBob[0] + eqW)} ${HL.r2(pBob[1])}`);

      // Specular highlight on upper-front quadrant
      const shineX = pBob[0] - eqW * 0.35;
      const shineY = pBob[1] - eqW * 0.35;
      bobShine.setAttribute("cx", HL.r2(shineX));
      bobShine.setAttribute("cy", HL.r2(shineY));

      // Physics Energy Calculations
      const degNow = (theta * 180) / Math.PI;
      const hMaxRef = L * (1 - Math.cos((35 * Math.PI) / 180)); // Height at max 35°
      const hCur = Math.max(0, L * (1 - Math.cos(theta)));
      const vCur = Math.abs(L * omega); // Linear velocity v = L * omega (cm/s)
      const vMaxRef = Math.sqrt(2 * g * hMaxRef);

      // True energies (per unit mass m = 1):
      const ep = g * hCur;
      const ek = 0.5 * vCur * vCur;
      const eRef = g * hMaxRef;

      const epPercent = Math.min(100, Math.round((ep / eRef) * 100));
      const ekPercent = Math.min(100, Math.round((ek / eRef) * 100));

      const isEquilibrium = Math.abs(degNow) < 1.0 && Math.abs(omega) < 0.1;
      const isThroughCenter = Math.abs(degNow) < 1.5 && Math.abs(omega) > 0.5;

      if (isDragging) {
        read.textContent = `Con lắc đơn: Kéo lệch θ = ${degNow.toFixed(1)}° · W_t = ${epPercent}% · W_đ = 0% · Thả chuột để giải phóng thế năng`;
      } else if (isEquilibrium) {
        read.textContent = `Con lắc đơn: Cân bằng tĩnh (θ = 0.0°, ω = 0 rad/s) · W_t = 0% · W_đ = 0% · Kéo chuột để kích thích dao động`;
      } else if (isThroughCenter) {
        read.textContent = `Con lắc đơn: θ = ${degNow.toFixed(1)}° · Vận tốc qua VTCB cực đại (v = ${(vCur / 100).toFixed(2)} m/s) · W_t = ${epPercent}% · W_đ = ${ekPercent}% (.hi)`;
      } else {
        read.textContent = `Con lắc đơn: θ = ${degNow.toFixed(1)}° · ω = ${omega.toFixed(2)} rad/s · W_t = ${epPercent}% ⇄ W_đ = ${ekPercent}% (Bảo toàn cơ năng)`;
      }

      if (isThroughCenter) {
        bobBody.classList.add("hi");
      } else {
        bobBody.classList.remove("hi");
      }
    }

    function setAngle(deg) {
      theta = HL.clamp((deg * Math.PI) / 180, -0.62, 0.62);
      omega = 0.0;
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        isDragging = false;
        reg.wake();
        return;
      }
      isDragging = true;
      omega = 0.0;
      const dx = pt[0] - pPivot[0];
      const dy = pt[1] - pPivot[1];
      const rawTheta = Math.atan2(dx, dy * 0.7);
      theta = HL.clamp(rawTheta, -0.62, 0.62);
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      let isMoving = false;
      if (!isDragging) {
        // RK2 / Verlet physical integration of pendulum equation
        // d²θ/dt² = -(g/L) * sin(θ) - damping * ω
        const timeStep = Math.min(dt, 0.032);
        const alpha1 = -(g / L) * Math.sin(theta) - damping * omega;
        const thetaMid = theta + 0.5 * omega * timeStep;
        const omegaMid = omega + 0.5 * alpha1 * timeStep;
        const alpha2 = -(g / L) * Math.sin(thetaMid) - damping * omegaMid;

        theta += omegaMid * timeStep;
        omega += alpha2 * timeStep;

        if (Math.abs(theta) > 1e-4 || Math.abs(omega) > 1e-4) {
          isMoving = true;
        }
      }
      draw();
      return isMoving || isDragging;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setAngle(Number(v));
      },
      destroy: bag.dispose,
      dispose: bag.dispose
    };
  }
},
/*
 * 3. Spring Dynamometer (Lực Kế Lò Xo - Định Luật Hooke)
 * Physical Concept: Định luật Hooke: Lực đàn hồi tỷ lệ thuận với độ giãn: F = k · Δl
 *   - Lực đo được: F = 0 N đến 5 N (tương ứng 0 đến 5 quả cân 1 N, m ≈ 102 g mỗi quả).
 *   - Độ dãn lò xo: Δl = F / k (tuyến tính tuyệt đối).
 *   - Độ cứng lò xo: k = 100 N/m ⇒ Mỗi 1 N dãn 10 mm.
 * Geometry (Precision Laboratory Instrument Discipline):
 *   - Bệ gang 3 chạc vững chãi (Cast-iron lab tripod/stand base) kèm cọc thép đứng và tay xà ngang có ốc siết.
 *   - Vỏ lực kế hình trụ trong suốt (transparent acrylic barrel) với nắp chụp kim loại 2 đầu.
 *   - Vạch khắc chia độ Newton 0–5 N trên thân vỏ.
 *   - Lò xo xoắn ốc axonometric biến dạng tuyến tính thực tế bên trong.
 *   - Đĩa kim chỉ thị màu nổi bật (indicator collar) gắn đồng trục với ti trượt và móc treo dưới.
 *   - Bộ quả cân đồng thau xẻ rãnh (slotted brass weights) 1 N xếp chồng tự nhiên dưới móc.
 * Meaningful Kinematics: Di chuột dọc để kéo móc tải trọng 0N–5N: lò xo dãn mượt mà theo phương trình đàn hồi,
 * kim chỉ thị trỏ chính xác từng vạch Newton, số đĩa cân 1 N tự động ăn khớp với lực đo.
 */

{
  id: "physics-dynamometer",
  title: "3. Lực Kế Lò Xo (Spring Dynamometer)",
  concept: "Định luật Hooke: F = k · Δl (Lực đàn hồi & Độ biến dạng tuyến tính)",
  means: "Di chuột dọc để kéo móc hoặc tăng tải trọng từ 0N đến 5N: lò xo xoắn ốc co giãn tuyến tính mượt mà qua chuyển động đàn hồi, các đĩa cân 1N tự động xếp chồng, kim đo trỏ chính xác vạch Newton tương ứng.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 2.0, 5.0],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 3.2);
    HL.fit(C, [[-26, -12, 0], [22, 12, 38]], 200, 160);
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

    // 1. Cast-Iron Laboratory Base (Z: 0 to 2.4)
    // Triangular heavy tripod base
    const baseSol = HL.solid(svg);
    const [bO, bI] = HL.rings(-28, -14, 24, 14, 2.4, 0.6);
    HL.put(baseSol, HL.prism(P, front, bO, bI, 0, 2.4));

    // Levelling thumb screws on base
    const lScrew1 = P(-24, -10, 2.5);
    const lScrew2 = P(-24, 10, 2.5);
    const lScrew3 = P(18, 0, 2.5);
    for (const pt of [lScrew1, lScrew2, lScrew3]) {
      HL.mk("circle", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 1.8, class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.0 }, svg);
      HL.mk("circle", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 0.6, class: "dot" }, svg);
    }

    // 2. Rigid Support Stand Rod & Cantilever Clamp Arm
    // Vertical steel column at X = -16, Y = 0 (Z: 2.4 to 34.5)
    const postSol = HL.solid(svg);
    const postO = circAt(-16, 0, 1.8, 16);
    const postI = circAt(-16, 0, 1.4, 16);
    HL.put(postSol, HL.prism(P, front, postO, postI, 2.4, 34.5));

    // Horizontal arm clamp boss at X = -16, Z = 32.5 to 34.5
    const clampSol = HL.solid(svg);
    const [clO, clI] = HL.rings(-18.5, -2.4, -13.5, 2.4, 0.6, 0.2);
    HL.put(clampSol, HL.prism(P, front, clO, clI, 32.2, 34.5));

    // Knurled thumbscrew on clamp
    const thumbPt = P(-16, -3.8, 33.3);
    HL.mk("circle", { cx: HL.r2(thumbPt[0]), cy: HL.r2(thumbPt[1]), r: 1.6, class: "hi", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.1 }, svg);

    // Cantilever arm extending to X = 0 at Z = 33.5
    const armSol = HL.solid(svg);
    const [armO, armI] = HL.rings(-14, -1.2, 2.0, 1.2, 0.5, 0.2);
    HL.put(armSol, HL.prism(P, front, armO, armI, 32.8, 34.2));

    // Top suspension loop at (0, 0, 33.0)
    const topPin = P(0, 0, 33.0);
    HL.mk("circle", {
      cx: HL.r2(topPin[0]), cy: HL.r2(topPin[1]), r: 2.0,
      class: "hi", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.2
    }, svg);

    // 3. Dynamometer Outer Casing (Z: 14.5 to 32.0)
    // Top chrome cap (Z: 30.5 to 32.0)
    const topCapSol = HL.solid(svg);
    const capO = circAt(0, 0, 4.4, 24);
    const capI = circAt(0, 0, 3.8, 24);
    HL.put(topCapSol, HL.prism(P, front, capO, capI, 30.5, 32.0));

    // Transparent cylindrical casing barrel (Z: 16.0 to 30.5)
    const barrelSol = HL.solid(svg);
    const barO = circAt(0, 0, 4.2, 24);
    const barI = circAt(0, 0, 3.6, 24);
    HL.put(barrelSol, HL.prism(P, front, barO, barI, 16.0, 30.5));

    // Bottom cap with guide collar (Z: 14.5 to 16.0)
    const botCapSol = HL.solid(svg);
    HL.put(botCapSol, HL.prism(P, front, capO, capI, 14.5, 16.0));

    // Graduation Scale Ticks on front barrel face (0N at Z = 26.5, 5N at Z = 16.5)
    // 2.0 units in Z per 1 Newton
    const scaleGroup = HL.mk("g", {}, svg);
    for (let i = 0; i <= 5; i++) {
      const tickZ = 26.5 - i * 2.0;
      // Front facing ticks
      const tA = P(3.2, 2.2, tickZ);
      const tB = P(4.4, 3.0, tickZ);
      HL.mk("line", {
        x1: HL.r2(tA[0]), y1: HL.r2(tA[1]),
        x2: HL.r2(tB[0]), y2: HL.r2(tB[1]),
        class: i === 0 || i === 5 ? "hi" : "lo",
        "stroke-width": i === 0 || i === 5 ? 1.4 : 0.8
      }, scaleGroup);

      // Minor half-newton ticks
      if (i < 5) {
        const halfZ = tickZ - 1.0;
        const hA = P(3.4, 2.3, halfZ);
        const hB = P(4.1, 2.8, halfZ);
        HL.mk("line", {
          x1: HL.r2(hA[0]), y1: HL.r2(hA[1]),
          x2: HL.r2(hB[0]), y2: HL.r2(hB[1]),
          class: "lo", "stroke-width": 0.6
        }, scaleGroup);
      }
    }

    // 4. Helical Spring inside the casing
    const springPath = HL.mk("path", { class: "hi nf", "stroke-width": 1.4 }, svg);

    // 5. Sliding Red Indicator Collar & Hook Rod
    const indCollar = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-hi)", "stroke-width": 1.5 }, svg);
    const hookLine = HL.mk("path", { class: "hi nf", "stroke-width": 1.4 }, svg);

    // 6. Stack of Slotted 1N Brass Weights
    const weightsGroup = HL.mk("g", {}, svg);
    const weightSols = [];
    for (let w = 0; w < 5; w++) {
      weightSols.push(HL.solid(weightsGroup));
    }

    // Kinematics spring for load force F (0 to 5 N)
    const currentF = initialV != null ? HL.clamp(initialV, 0, 5) : 2.0;
    const spF = HL.spring(currentF, { k: 140, c: 14 });

    function draw() {
      const fVal = spF.x;
      // Spring elongation: 2.0 units per 1 Newton
      const deltaZ = fVal * 2.0;
      const springTopZ = 29.5;
      const springBotZ = 26.5 - deltaZ;

      // Draw Helical Spring inside casing
      const coils = 9;
      const numSteps = coils * 14;
      const springR = 2.4;
      const spPts = [];

      for (let k = 0; k <= numSteps; k++) {
        const t = k / numSteps;
        const ang = t * coils * Math.PI * 2;
        const curZ = springTopZ - t * (springTopZ - springBotZ);
        spPts.push(P(springR * Math.cos(ang), springR * Math.sin(ang), curZ));
      }
      springPath.setAttribute("d", HL.open(spPts));

      // Indicator Collar at spring bottom (Z = springBotZ)
      const colTop = springBotZ;
      const colBot = springBotZ - 1.2;
      const colRing = circAt(0, 0, 3.4, 18);
      indCollar.setAttribute("d", HL.poly(HL.hull([
        ...colRing.map(q => P(q.u, q.v, colTop)),
        ...colRing.map(q => P(q.u, q.v, colBot))
      ])));

      // Hook Rod hanging below the collar (from colBot down through casing bottom to hook)
      const hookTopZ = colBot;
      const hookBotZ = hookTopZ - 5.5;
      const h0 = P(0, 0, hookTopZ);
      const h1 = P(0, 0, hookBotZ);
      const h2 = P(1.6, 0, hookBotZ - 1.4);
      const h3 = P(3.2, 0, hookBotZ - 0.2);
      hookLine.setAttribute("d", `M ${HL.r2(h0[0])} ${HL.r2(h0[1])} L ${HL.r2(h1[0])} ${HL.r2(h1[1])} C ${HL.r2(h2[0])} ${HL.r2(h2[1])}, ${HL.r2(h3[0])} ${HL.r2(h3[1])}, ${HL.r2(h3[0])} ${HL.r2(h3[1] - 1.2)}`);

      // Stacked Slotted 1N Weights (Quả cân đồng 1N)
      const activeWeights = Math.min(5, Math.max(0, Math.round(fVal)));
      const weightThickness = 1.4;
      const weightR = 5.4;
      const wRingO = circAt(0, 0, weightR, 20);
      const wRingI = circAt(0, 0, 1.2, 12);

      weightSols.forEach((sol, idx) => {
        if (idx < activeWeights) {
          const wz0 = hookBotZ - 1.8 - (idx + 1) * (weightThickness + 0.2);
          const wz1 = wz0 + weightThickness;
          HL.put(sol, HL.prism(P, front, wRingO, wRingI, wz0, wz1));
          sol.sil.style.display = "";
          sol.sil.classList.toggle("hi", idx === activeWeights - 1);
        } else {
          HL.put(sol, { sil: "", crease: "" });
        }
      });

      const measuredN = HL.r2(fVal);
      const deltaLmm = HL.r2(fVal * 10.0); // 10 mm per Newton (k = 100 N/m)
      read.textContent = `Lực kế lò xo: Tải trọng F = ${measuredN} N (${activeWeights} quả cân 1N) · Độ giãn Δl = ${deltaLmm} mm · Độ cứng k = 100 N/m (F = k·Δl)`;
    }

    function setForce(targetF) {
      spF.t = HL.clamp(targetF, 0, 5);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setForce(2.0); // Default rest at 2.0 N
        return;
      }
      const topScrY = P(0, 0, 26)[1];
      const botScrY = P(0, 0, 8)[1];
      const norm = HL.clamp((pt[1] - topScrY) / (botScrY - topScrY), 0, 1);
      setForce(norm * 5.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spF, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setForce(Number(v));
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 4. Inclined Plane & Friction (Mặt Phẳng Nghiêng & Khối Trượt)
 * Physical Concept: Phân tích lực trên mặt phẳng nghiêng & ma sát nghỉ:
 *   - Lực kéo trượt dọc dốc: P∥ = P · sin(α)
 *   - Áp lực pháp tuyến: P⊥ = P · cos(α)
 *   - Lực ma sát nghỉ cực đại: Fms_max = μ · P⊥ = μ · P · cos(α)
 *   - Điều kiện trượt: tan(α) > μ (với hệ số ma sát gỗ/gỗ μ ≈ 0.445 ⇒ góc giới hạn α_c = 24°).
 * Geometry (Precision Classical Mechanics Apparatus Discipline):
 *   - Khung bệ gỗ/kim loại thí nghiệm có 4 bu-lông chân đế.
 *   - Cụm bản lề đồng thau chắc chắn có trục chốt xoay ngang tại chân dốc.
 *   - Thước góc độ cung tròn (quadrant protractor plate) với vạch chia 0°–45° và vạch đỏ tại góc ma sát giới hạn 24°.
 *   - Mặt phẳng nghiêng có cữ chặn cao su chân dốc.
 *   - Khối trượt lăng trụ đặc kèm móc kéo và tạ chì trung tâm.
 *   - Thanh chống đỡ nâng hạ cơ học liên kết giữa bệ và mặt nghiêng.
 * Meaningful Kinematics: Di chuột điều chỉnh góc dốc α từ 0° đến 45°.
 *   - α ≤ 24°: Cân bằng tĩnh tuyệt đối, khối trượt đứng yên trên dốc.
 *   - α > 24°: Lực kéo trượt thắng ma sát nghỉ cực đại, khối trượt gia tốc lao xuống cữ chặn chân dốc!
 */

{
  id: "physics-incline",
  title: "4. Mặt Phẳng Nghiêng (Inclined Plane & Friction)",
  concept: "Phân tích trọng lực trên dốc: P∥ = P·sin(α) vs Fms = μ·P·cos(α)",
  means: "Di chuột dọc để nâng/hạ góc nghiêng α từ 0° đến 45°. Khi góc dốc vượt góc ma sát giới hạn (α > 24°), lực kéo trượt vượt lực ma sát nghỉ cực đại, khối trượt gia tốc lao xuống chân dốc.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 16, 45],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 2.5);
    HL.fit(C, [[-40, -14, 0], [40, 14, 34]], 200, 160);
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

    // 1. Heavy Wooden/Metal Test Bench Base (Z: 0 to 2.2)
    const baseSol = HL.solid(svg);
    const [baseO, baseI] = HL.rings(-42, -14, 42, 14, 2.2, 0.6);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.2));

    // 4 Corner Mounting Screws on base
    const cornerPts = [
      [-39, -11], [39, -11],
      [-39, 11], [39, 11]
    ];
    for (const [cx, cy] of cornerPts) {
      const pt = P(cx, cy, 2.25);
      HL.mk("circle", {
        cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 1.8,
        class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.0
      }, svg);
      HL.mk("circle", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 0.6, class: "dot" }, svg);
    }

    // 2. Brass Hinge Bracket at X = -28, Y = 0 (Z: 2.2 to 6.2)
    const pivotX = -28.0, pivotZ = 5.8;
    const hingeSol = HL.solid(svg);
    const [hO, hI] = HL.rings(pivotX - 3.5, -9.0, pivotX + 3.5, 9.0, 0.8, 0.3);
    HL.put(hingeSol, HL.prism(P, front, hO, hI, 2.2, pivotZ));

    // Horizontal pivot axle pin
    const pinL = P(pivotX, -9.5, pivotZ);
    const pinR = P(pivotX, 9.5, pivotZ);
    HL.mk("line", {
      x1: HL.r2(pinL[0]), y1: HL.r2(pinL[1]),
      x2: HL.r2(pinR[0]), y2: HL.r2(pinR[1]),
      class: "hi", "stroke-width": 2.2, stroke: "var(--hl-edge)"
    }, svg);

    // 3. Steel Sector Protractor Plate (Cung đo góc gắn tại mặt trước Y = 9.2)
    const protractorGroup = HL.mk("g", {}, svg);
    const protractorArc = HL.mk("path", { class: "lo", "stroke-width": 1.0, fill: "none", "stroke-dasharray": "2,2" }, protractorGroup);
    const critLine = HL.mk("line", { class: "hi", "stroke-width": 1.4 }, protractorGroup);

    // Protractor arc ticks
    const arcR = 17.0;
    let arcD = "";
    for (let deg = 0; deg <= 45; deg += 3) {
      const rad = (deg * Math.PI) / 180;
      const px = pivotX + arcR * Math.cos(rad);
      const pz = pivotZ + arcR * Math.sin(rad);
      const pt = P(px, 9.2, pz);
      if (deg === 0) arcD += `M ${HL.r2(pt[0])} ${HL.r2(pt[1])}`;
      else arcD += ` L ${HL.r2(pt[0])} ${HL.r2(pt[1])}`;

      if (deg % 15 === 0 || deg === 24) {
        const pIn = P(pivotX + (arcR - 2.8) * Math.cos(rad), 9.2, pivotZ + (arcR - 2.8) * Math.sin(rad));
        HL.mk("line", {
          x1: HL.r2(pIn[0]), y1: HL.r2(pIn[1]),
          x2: HL.r2(pt[0]), y2: HL.r2(pt[1]),
          class: deg === 24 ? "hi" : "lo",
          "stroke-width": deg === 24 ? 1.6 : 0.8
        }, protractorGroup);
      }
    }
    protractorArc.setAttribute("d", arcD);

    // Critical 24 degree line
    const critRad = (24 * Math.PI) / 180;
    const cP0 = P(pivotX + 6.0 * Math.cos(critRad), 9.2, pivotZ + 6.0 * Math.sin(critRad));
    const cP1 = P(pivotX + (arcR + 1.5) * Math.cos(critRad), 9.2, pivotZ + (arcR + 1.5) * Math.sin(critRad));
    critLine.setAttribute("x1", HL.r2(cP0[0]));
    critLine.setAttribute("y1", HL.r2(cP0[1]));
    critLine.setAttribute("x2", HL.r2(cP1[0]));
    critLine.setAttribute("y2", HL.r2(cP1[1]));

    // 4. Hinged Incline Ramp Plank
    const rampLength = 60.0;
    const rampW = 8.0; // Y from -rampW to +rampW
    const rampH = 2.2; // Thickness in Z

    const rampGroup = HL.mk("g", {}, svg);
    const rampSol = HL.solid(rampGroup);

    // 5. Sliding Block on Ramp
    const blockL = 12.0;
    const blockW = 6.2;
    const blockH = 5.5;
    const blockGroup = HL.mk("g", {}, svg);
    const blockSol = HL.solid(blockGroup);
    const blockKnob = HL.mk("circle", { r: 1.4, class: "dot" }, blockGroup);

    // 6. Adjustable Support Strut
    const strutGroup = HL.mk("g", {}, svg);
    const strutLine = HL.mk("line", { class: "sil", "stroke-width": 2.2, stroke: "var(--hl-edge)" }, strutGroup);

    // Kinematics Springs
    const initialDeg = initialV != null ? initialV : 16;
    const spAlpha = HL.spring((initialDeg * Math.PI) / 180, { k: 120, c: 14 });
    const spBoxU = HL.spring(45.0, { k: 70, c: 10 });

    function transformRampPt(u, v, w, alpha) {
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);
      const x = pivotX + u * cosA - w * sinA;
      const y = v;
      const z = pivotZ + u * sinA + w * cosA;
      return [x, y, z];
    }

    function draw() {
      const alpha = spAlpha.x;
      const alphaDeg = (alpha * 180) / Math.PI;
      const boxU = spBoxU.x;

      // A. Draw Hinged Ramp Plank
      const r000 = P(...transformRampPt(0, -rampW, 0, alpha));
      const r100 = P(...transformRampPt(rampLength, -rampW, 0, alpha));
      const r110 = P(...transformRampPt(rampLength, rampW, 0, alpha));
      const r010 = P(...transformRampPt(0, rampW, 0, alpha));

      const r001 = P(...transformRampPt(0, -rampW, rampH, alpha));
      const r101 = P(...transformRampPt(rampLength, -rampW, rampH, alpha));
      const r111 = P(...transformRampPt(rampLength, rampW, rampH, alpha));
      const r011 = P(...transformRampPt(0, rampW, rampH, alpha));

      // Stop buffer at u = 5.0
      const b00 = P(...transformRampPt(4.5, -rampW + 0.8, rampH, alpha));
      const b10 = P(...transformRampPt(6.5, -rampW + 0.8, rampH, alpha));
      const b11 = P(...transformRampPt(6.5, rampW - 0.8, rampH, alpha));
      const b01 = P(...transformRampPt(4.5, rampW - 0.8, rampH, alpha));
      const b00T = P(...transformRampPt(4.5, -rampW + 0.8, rampH + 2.5, alpha));
      const b10T = P(...transformRampPt(6.5, -rampW + 0.8, rampH + 2.5, alpha));
      const b11T = P(...transformRampPt(6.5, rampW - 0.8, rampH + 2.5, alpha));
      const b01T = P(...transformRampPt(4.5, rampW - 0.8, rampH + 2.5, alpha));

      let rSil = "";
      rSil += HL.poly([r010, r110, r111, r011]);
      rSil += HL.poly([r110, r100, r101, r111]);
      rSil += HL.poly([r001, r101, r111, r011]);
      rSil += HL.poly([b01, b11, b11T, b01T]);
      rSil += HL.poly([b10, b11, b11T, b10T]);
      rSil += HL.poly([b00T, b10T, b11T, b01T]);

      let rCrease = "";
      rCrease += `M ${HL.r2(r011[0])} ${HL.r2(r011[1])} L ${HL.r2(r111[0])} ${HL.r2(r111[1])}`;
      rCrease += ` M ${HL.r2(r111[0])} ${HL.r2(r111[1])} L ${HL.r2(r101[0])} ${HL.r2(r101[1])}`;
      rCrease += ` M ${HL.r2(b01T[0])} ${HL.r2(b01T[1])} L ${HL.r2(b11T[0])} ${HL.r2(b11T[1])}`;

      HL.put(rampSol, { sil: rSil, crease: rCrease });

      // Support strut from base at (15, 0, 2.2) to ramp underside at u = 40
      const strutBase = P(15, 0, 2.2);
      const strutUnder = P(...transformRampPt(40, 0, 0, alpha));
      strutLine.setAttribute("x1", HL.r2(strutBase[0]));
      strutLine.setAttribute("y1", HL.r2(strutBase[1]));
      strutLine.setAttribute("x2", HL.r2(strutUnder[0]));
      strutLine.setAttribute("y2", HL.r2(strutUnder[1]));

      // B. Draw Sliding Block on top face (w = rampH)
      const u0 = boxU - blockL / 2;
      const u1 = boxU + blockL / 2;
      const v0 = -blockW / 2;
      const v1 = blockW / 2;
      const w0 = rampH;
      const w1 = rampH + blockH;

      const bk000 = P(...transformRampPt(u0, v0, w0, alpha));
      const bk100 = P(...transformRampPt(u1, v0, w0, alpha));
      const bk110 = P(...transformRampPt(u1, v1, w0, alpha));
      const bk010 = P(...transformRampPt(u0, v1, w0, alpha));

      const bk001 = P(...transformRampPt(u0, v0, w1, alpha));
      const bk101 = P(...transformRampPt(u1, v0, w1, alpha));
      const bk111 = P(...transformRampPt(u1, v1, w1, alpha));
      const bk011 = P(...transformRampPt(u0, v1, w1, alpha));

      let bkSil = "";
      bkSil += HL.poly([bk010, bk110, bk111, bk011]);
      bkSil += HL.poly([bk110, bk100, bk101, bk111]);
      bkSil += HL.poly([bk001, bk101, bk111, bk011]);

      let bkCrease = "";
      bkCrease += `M ${HL.r2(bk011[0])} ${HL.r2(bk011[1])} L ${HL.r2(bk111[0])} ${HL.r2(bk111[1])}`;
      bkCrease += ` M ${HL.r2(bk111[0])} ${HL.r2(bk111[1])} L ${HL.r2(bk101[0])} ${HL.r2(bk101[1])}`;

      HL.put(blockSol, { sil: bkSil, crease: bkCrease });

      // Brass center cylinder knob on top of block
      const knobPt = P(...transformRampPt(boxU, 0, w1 + 0.2, alpha));
      blockKnob.setAttribute("cx", HL.r2(knobPt[0]));
      blockKnob.setAttribute("cy", HL.r2(knobPt[1]));

      // Highlight block when sliding
      const isSliding = alphaDeg > 24.0;
      blockSol.sil.classList.toggle("hi", isSliding);

      // Calculations for read header
      const sinA = Math.sin(alpha);
      const cosA = Math.cos(alpha);
      const mu = 0.445; // tan(24 deg)
      const pParallel = HL.r2(sinA);
      const fmsMax = HL.r2(mu * cosA);
      const angleStr = HL.r2(alphaDeg);

      if (isSliding) {
        read.textContent = `Mặt phẳng nghiêng: α = ${angleStr}° > 24° (Vượt góc ma sát) · Lực kéo P∥ = ${pParallel}·P > Fms_max = ${fmsMax}·P ⇒ Khối trượt gia tốc xuống dốc!`;
      } else {
        read.textContent = `Mặt phẳng nghiêng: α = ${angleStr}° ≤ 24° · Lực kéo P∥ = ${pParallel}·P ≤ Fms_max = ${fmsMax}·P ⇒ Cân bằng tĩnh (Khối đứng yên)`;
      }
    }

    function setAngle(deg) {
      const clamped = HL.clamp(deg, 0, 45);
      spAlpha.t = (clamped * Math.PI) / 180;
      // If angle exceeds 24 deg, target position slides to buffer (u = 12.5)
      // If angle <= 24 deg, target position returns to top section (u = 45.0)
      if (clamped > 24.0) {
        spBoxU.t = 12.5;
      } else {
        spBoxU.t = 45.0;
      }
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setAngle(16.0); // Default rest angle
        return;
      }
      const minY = 30, maxY = 130;
      const norm = HL.clamp(1.0 - (pt[1] - minY) / (maxY - minY), 0, 1);
      setAngle(norm * 45.0);
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(spAlpha, dt);
      const m2 = HL.stepS(spBoxU, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setAngle(Number(v));
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 5. Knife Switch & Electric Circuit (Cầu Dao & Mạch Điện Đèn Sáng)
 * Physical Concept: Mạch điện đóng / ngắt (Closed vs Open Circuit):
 *   - Định luật Ohm: I = U / R.
 *   - Khi cầu dao mở (α > 2°): Mạch hở tại khe ngàm, điện trở vô cùng lớn (R → ∞), I = 0.00 A, đèn tắt.
 *   - Khi cầu dao sập đóng (α = 0°): Lưỡi dao đồng tiếp xúc khít giữa 2 ngàm đồng đàn hồi, mạch kín hoàn toàn,
 *     dòng điện I = 1.50 A chạy qua, dây tóc bóng đèn rực sáng (P = I²·R = 9.0 W).
 * Geometry (Hero Specimen Precision):
 *   - Bệ gỗ/sứ cách điện có 4 bu-lông đồng ở 4 góc.
 *   - Nguồn pin đôi 6V với 2 cọc đấu dây núm khía (+ và -).
 *   - Trụ bản lề ngàm U bằng đồng thau với trục chốt xoay ngang.
 *   - Lưỡi dao đồng dày dặn, chuôi cầm tiện gỗ cách điện có đai đồng.
 *   - Ngàm kẹp đồng đôi (twin brass jaws) vát mép mở ở đầu đón lưỡi dao.
 *   - Đui đèn sứ có ren kim loại đặt đúng vị trí bằng circAt.
 *   - Bóng đèn thủy tinh 3D dạng cầu thật với dây tóc vonfram và tia sáng tỏa nhiệt.
 * Meaningful Kinematics: Di chuột hạ cán dao. Khi góc < 5°, lực đàn hồi hút sập dao vào ngàm (snap-action).
 */

{
  id: "physics-switch",
  title: "5. Cầu Dao & Mạch Điện (Knife Switch & Circuit)",
  concept: "Mạch điện kín & hở: I = U/R · Công suất bóng đèn P = I²·R",
  means: "Di chuột hạ thấp cán cầm để đóng cầu dao. Khi lưỡi dao tiếp cận ngàm kẹp (góc < 5°), cơ cấu đàn hồi hút sập dao vào ngàm khép kín mạch điện: bóng đèn dây tóc lập tức rực sáng và dây dẫn chuyển trạng thái tích điện.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 32, 45],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 2.5);
    HL.fit(C, [[-40, -14, 0], [40, 14, 25]], 200, 160);
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

    // 1. Mahogany / Ceramic Insulating Switchboard Base (Z: 0 to 2.2)
    const baseSol = HL.solid(svg);
    const [baseO, baseI] = HL.rings(-42, -15, 42, 15, 2.2, 0.6);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.2));

    // 4 Corner Brass Mounting Screws
    const cornerPts = [
      [-39, -12], [39, -12],
      [-39, 12], [39, 12]
    ];
    for (const [cx, cy] of cornerPts) {
      const pt = P(cx, cy, 2.25);
      HL.mk("circle", {
        cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 1.8,
        class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.0
      }, svg);
      HL.mk("circle", {
        cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 0.6,
        class: "dot"
      }, svg);
    }

    // 2. Battery Power Block at X = -32, Y = 0 (Z: 2.2 to 8.5)
    const batSol = HL.solid(svg);
    const [batO, batI] = HL.rings(-38, -6, -26, 6, 1.2, 0.4);
    HL.put(batSol, HL.prism(P, front, batO, batI, 2.2, 8.5));

    // Battery terminals (+ and -)
    const postPlus = P(-35, 2.5, 8.6);
    const postMinus = P(-35, -2.5, 8.6);
    HL.mk("circle", {
      cx: HL.r2(postPlus[0]), cy: HL.r2(postPlus[1]), r: 1.6,
      class: "hi", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.1
    }, svg);
    HL.mk("circle", {
      cx: HL.r2(postMinus[0]), cy: HL.r2(postMinus[1]), r: 1.6,
      class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.1
    }, svg);

    // Terminal sign markers (+ and -)
    HL.mk("line", {
      x1: HL.r2(postPlus[0] - 1.2), y1: HL.r2(postPlus[1]),
      x2: HL.r2(postPlus[0] + 1.2), y2: HL.r2(postPlus[1]),
      class: "hi", "stroke-width": 1.0
    }, svg);
    HL.mk("line", {
      x1: HL.r2(postPlus[0]), y1: HL.r2(postPlus[1] - 1.2),
      x2: HL.r2(postPlus[0]), y2: HL.r2(postPlus[1] + 1.2),
      class: "hi", "stroke-width": 1.0
    }, svg);
    HL.mk("line", {
      x1: HL.r2(postMinus[0] - 1.2), y1: HL.r2(postMinus[1]),
      x2: HL.r2(postMinus[0] + 1.2), y2: HL.r2(postMinus[1]),
      class: "lo", "stroke-width": 1.0
    }, svg);

    // 3. Stamped Copper Circuit Traces along Base (Z = 2.3)
    const wireGroup = HL.mk("g", {}, svg);
    const trace1 = HL.mk("path", { class: "lo", "stroke-width": 1.6, fill: "none" }, wireGroup);
    const trace2 = HL.mk("path", { class: "lo", "stroke-width": 1.6, fill: "none" }, wireGroup);
    const traceReturn = HL.mk("path", { class: "lo", "stroke-width": 1.6, fill: "none" }, wireGroup);

    const ptPlus = P(-35, 2.5, 2.3);
    const ptHingeBase = P(-14, 0, 2.3);
    const ptJawBase = P(10, 0, 2.3);
    const ptLampIn = P(24, 0, 2.3);
    const ptLampOut = P(28, -4.5, 2.3);
    const ptCorner = P(-35, -10, 2.3);
    const ptMinus = P(-35, -2.5, 2.3);

    trace1.setAttribute("d", `M ${HL.r2(ptPlus[0])} ${HL.r2(ptPlus[1])} L ${HL.r2(ptHingeBase[0])} ${HL.r2(ptHingeBase[1])}`);
    trace2.setAttribute("d", `M ${HL.r2(ptJawBase[0])} ${HL.r2(ptJawBase[1])} L ${HL.r2(ptLampIn[0])} ${HL.r2(ptLampIn[1])}`);
    traceReturn.setAttribute("d", `M ${HL.r2(ptLampOut[0])} ${HL.r2(ptLampOut[1])} L ${HL.r2(ptCorner[0])} ${HL.r2(ptCorner[1])} L ${HL.r2(ptMinus[0])} ${HL.r2(ptMinus[1])}`);

    // 4. Brass Switch Trunnion Hinge Post at X = -14
    const hingeSol = HL.solid(svg);
    const [hO, hI] = HL.rings(-16.5, -3.2, -11.5, 3.2, 0.8, 0.3);
    HL.put(hingeSol, HL.prism(P, front, hO, hI, 2.2, 7.5));

    // Horizontal pivot pin through the trunnion
    const pinL = P(-14, -3.6, 6.8);
    const pinR = P(-14, 3.6, 6.8);
    HL.mk("line", {
      x1: HL.r2(pinL[0]), y1: HL.r2(pinL[1]),
      x2: HL.r2(pinR[0]), y2: HL.r2(pinR[1]),
      class: "hi", "stroke-width": 2.2, stroke: "var(--hl-edge)"
    }, svg);

    // 5. Twin Spring-Brass Contact Jaws at X = 10
    // Two vertical parallel leaves with flared lead-in mouths
    const jaw1Sol = HL.solid(svg);
    const jaw2Sol = HL.solid(svg);
    const [j1O, j1I] = HL.rings(8.5, -3.0, 11.5, -0.6, 0.4, 0.2);
    const [j2O, j2I] = HL.rings(8.5, 0.6, 11.5, 3.0, 0.4, 0.2);
    HL.put(jaw1Sol, HL.prism(P, front, j1O, j1I, 2.2, 8.8));
    HL.put(jaw2Sol, HL.prism(P, front, j2O, j2I, 2.2, 8.8));

    // Flared lips at top of jaws (Z = 8.8 to 9.8)
    const lip1A = P(8.5, -3.5, 9.8), lip1B = P(11.5, -3.5, 9.8);
    const lip2A = P(8.5, 3.5, 9.8), lip2B = P(11.5, 3.5, 9.8);
    const j1TopA = P(8.5, -0.6, 8.8), j1TopB = P(11.5, -0.6, 8.8);
    const j2TopA = P(8.5, 0.6, 8.8), j2TopB = P(11.5, 0.6, 8.8);
    HL.mk("path", { d: HL.poly([j1TopA, j1TopB, lip1B, lip1A]), class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, svg);
    HL.mk("path", { d: HL.poly([j2TopA, j2TopB, lip2B, lip2A]), class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, svg);

    // 6. Porcelain Lamp Socket at X = 28, Y = 0 (Z: 2.2 to 7.0)
    const socketSol = HL.solid(svg);
    const sockO = circAt(28, 0, 4.8, 24);
    const sockI = circAt(28, 0, 4.2, 24);
    HL.put(socketSol, HL.prism(P, front, sockO, sockI, 2.2, 5.4));

    // Threaded brass collar (Z: 5.4 to 7.2)
    const collarSol = HL.solid(svg);
    const collO = circAt(28, 0, 3.8, 20);
    const collI = circAt(28, 0, 3.3, 20);
    HL.put(collarSol, HL.prism(P, front, collO, collI, 5.4, 7.2));

    // 7. Lightbulb Assembly at X = 28, Y = 0
    const bulbCenter = [28, 0, 13.0];
    const bulbR = 5.2;
    const bulbGroup = HL.mk("g", {}, svg);

    // Glowing halo behind glass when circuit active
    const glowHalo = HL.mk("circle", {
      cx: HL.r2(P(bulbCenter[0], bulbCenter[1], bulbCenter[2])[0]),
      cy: HL.r2(P(bulbCenter[0], bulbCenter[1], bulbCenter[2])[1]),
      r: bulbR * C.S * 1.5,
      class: "hi", fill: "var(--hl-plate)", opacity: 0, "stroke-width": 0
    }, bulbGroup);

    // Glass bulb spherical contour
    const pCenter = P(bulbCenter[0], bulbCenter[1], bulbCenter[2]);
    const bulbGlass = HL.mk("circle", {
      cx: HL.r2(pCenter[0]), cy: HL.r2(pCenter[1]),
      r: bulbR * C.S,
      class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4
    }, bulbGroup);

    // Glass reflection curve
    const bulbReflect = HL.mk("path", {
      class: "lo", fill: "none", "stroke-width": 0.8
    }, bulbGroup);
    const refR = bulbR * C.S * 0.75;
    bulbReflect.setAttribute("d", `M ${HL.r2(pCenter[0] - refR * 0.7)} ${HL.r2(pCenter[1] - refR * 0.5)} A ${HL.r2(refR)} ${HL.r2(refR)} 0 0 1 ${HL.r2(pCenter[0] - refR * 0.2)} ${HL.r2(pCenter[1] - refR * 0.85)}`);

    // Exhaust pip at top of bulb
    HL.mk("circle", {
      cx: HL.r2(P(bulbCenter[0], bulbCenter[1], bulbCenter[2] + bulbR)[0]),
      cy: HL.r2(P(bulbCenter[0], bulbCenter[1], bulbCenter[2] + bulbR)[1]),
      r: 1.0, class: "dot"
    }, bulbGroup);

    // Internal tungsten filament loop & lead wires
    const leadGroup = HL.mk("g", {}, bulbGroup);
    const stemTop = P(28, 0, 8.2);
    const fLeft = P(26.6, 0, 11.2);
    const fRight = P(29.4, 0, 11.2);
    const fPeak = P(28.0, 0, 13.8);

    // Support wires from stem
    HL.mk("line", { x1: HL.r2(stemTop[0] - 1), y1: HL.r2(stemTop[1]), x2: HL.r2(fLeft[0]), y2: HL.r2(fLeft[1]), class: "lo", "stroke-width": 1.0 }, leadGroup);
    HL.mk("line", { x1: HL.r2(stemTop[0] + 1), y1: HL.r2(stemTop[1]), x2: HL.r2(fRight[0]), y2: HL.r2(fRight[1]), class: "lo", "stroke-width": 1.0 }, leadGroup);

    // Hairpin coiled filament
    const filament = HL.mk("path", { class: "lo", "stroke-width": 1.5, fill: "none" }, leadGroup);
    filament.setAttribute("d", `M ${HL.r2(fLeft[0])} ${HL.r2(fLeft[1])} Q ${HL.r2(fPeak[0])} ${HL.r2(fPeak[1])} ${HL.r2(fRight[0])} ${HL.r2(fRight[1])}`);

    // Radial ray bursts when bulb is on
    const glowRays = HL.mk("g", { class: "hi", opacity: 0 }, bulbGroup);
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg * Math.PI) / 180;
      const ray1 = P(bulbCenter[0] + (bulbR + 2.0) * Math.cos(rad), (bulbR + 2.0) * Math.sin(rad) * 0.4, bulbCenter[2] + (bulbR + 2.0) * Math.sin(rad));
      const ray2 = P(bulbCenter[0] + (bulbR + 5.5) * Math.cos(rad), (bulbR + 5.5) * Math.sin(rad) * 0.4, bulbCenter[2] + (bulbR + 5.5) * Math.sin(rad));
      HL.mk("line", {
        x1: HL.r2(ray1[0]), y1: HL.r2(ray1[1]),
        x2: HL.r2(ray2[0]), y2: HL.r2(ray2[1]),
        "stroke-width": 1.2
      }, glowRays);
    }

    // 8. Knife Switch Blade & Ergonomic Handle (Pivoting at (-14, 0, 6.8))
    const pivotX = -14.0, pivotZ = 6.8;
    const bladeLength = 24.5; // Distance to jaw contact (X = 10)
    const bladeH = 2.4;
    const bladeThick = 0.7;

    const bladeGroup = HL.mk("g", {}, svg);
    const bladeSide = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, bladeGroup);
    const bladeTop = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, bladeGroup);
    const bladeCrease = HL.mk("path", { class: "lo", fill: "none", "stroke-width": 0.8 }, bladeGroup);

    // Turned wooden handle with brass ferrule
    const handleGroup = HL.mk("g", {}, svg);
    const handleSol = HL.solid(handleGroup);

    // Kinematics Springs
    const initialDeg = initialV != null ? initialV : 32;
    const spTheta = HL.spring((initialDeg * Math.PI) / 180, { k: 150, c: 14 });

    function transformBladePt(u, v, w, theta) {
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const x = pivotX + u * cosT - w * sinT;
      const y = v;
      const z = pivotZ + u * sinT + w * cosT;
      return [x, y, z];
    }

    function draw() {
      const theta = spTheta.x;
      const thetaDeg = (theta * 180) / Math.PI;
      const isClosed = thetaDeg <= 2.0;

      // A. Blade Solid Poly
      const b000 = P(...transformBladePt(0, -bladeThick, 0, theta));
      const b100 = P(...transformBladePt(bladeLength, -bladeThick, 0, theta));
      const b110 = P(...transformBladePt(bladeLength, bladeThick, 0, theta));
      const b010 = P(...transformBladePt(0, bladeThick, 0, theta));

      const b001 = P(...transformBladePt(0, -bladeThick, bladeH, theta));
      const b101 = P(...transformBladePt(bladeLength, -bladeThick, bladeH, theta));
      const b111 = P(...transformBladePt(bladeLength, bladeThick, bladeH, theta));
      const b011 = P(...transformBladePt(0, bladeThick, bladeH, theta));

      // Blade Front side (+Y)
      bladeSide.setAttribute("d", HL.poly([b010, b110, b111, b011]));
      // Blade Top Face (+Z)
      bladeTop.setAttribute("d", HL.poly([b001, b101, b111, b011]));
      // Crease lines
      bladeCrease.setAttribute("d", `M ${HL.r2(b011[0])} ${HL.r2(b011[1])} L ${HL.r2(b111[0])} ${HL.r2(b111[1])} M ${HL.r2(b111[0])} ${HL.r2(b111[1])} L ${HL.r2(b110[0])} ${HL.r2(b110[1])}`);

      // B. Insulated Handle Grip (from u = 23.5 to 33.5)
      // Lathe-turned profile with brass collar
      const h0 = P(...transformBladePt(23.5, -2.2, bladeH / 2 - 1.2, theta));
      const h1 = P(...transformBladePt(33.5, -2.2, bladeH / 2 - 1.2, theta));
      const h2 = P(...transformBladePt(33.5, 2.2, bladeH / 2 - 1.2, theta));
      const h3 = P(...transformBladePt(23.5, 2.2, bladeH / 2 - 1.2, theta));

      const h0T = P(...transformBladePt(23.5, -2.2, bladeH / 2 + 2.6, theta));
      const h1T = P(...transformBladePt(33.5, -2.2, bladeH / 2 + 2.6, theta));
      const h2T = P(...transformBladePt(33.5, 2.2, bladeH / 2 + 2.6, theta));
      const h3T = P(...transformBladePt(23.5, 2.2, bladeH / 2 + 2.6, theta));

      let hSil = "";
      hSil += HL.poly([h3, h2, h2T, h3T]);
      hSil += HL.poly([h2, h1, h1T, h2T]);
      hSil += HL.poly([h0T, h1T, h2T, h3T]);
      HL.put(handleSol, { sil: hSil, crease: `M ${HL.r2(h3T[0])} ${HL.r2(h3T[1])} L ${HL.r2(h2T[0])} ${HL.r2(h2T[1])}` });

      // C. Circuit Activation & Electrical State
      bladeSide.classList.toggle("hi", isClosed);
      jaw1Sol.sil.classList.toggle("hi", isClosed);
      jaw2Sol.sil.classList.toggle("hi", isClosed);
      trace1.classList.toggle("hi", isClosed);
      trace2.classList.toggle("hi", isClosed);
      traceReturn.classList.toggle("hi", isClosed);
      filament.classList.toggle("hi", isClosed);
      filament.setAttribute("stroke-width", isClosed ? "2.2" : "1.2");
      glowRays.setAttribute("opacity", isClosed ? 1 : 0);
      glowHalo.setAttribute("opacity", isClosed ? 0.35 : 0);

      // D. Header Info & Physics
      const degStr = HL.r2(thetaDeg);
      if (isClosed) {
        read.textContent = `Cầu dao: [ĐÓNG MẠCH - KÍN] (α = 0°) · U = 6.0 V · I = 1.50 A · Công suất P = 9.00 W ⇒ Dòng điện chạy qua, bóng đèn rực sáng!`;
      } else {
        read.textContent = `Cầu dao: [NGẮT MẠCH - HỞ] (α = ${degStr}°) · Khe hở ngàm R → ∞ · Dòng điện I = 0.00 A · P = 0 W ⇒ Đèn tắt`;
      }
    }

    function setSwitch(deg) {
      const clamped = HL.clamp(deg, 0, 45);
      // Realistic knife-switch snap: if angle < 5 deg, magnetic/spring snaps to 0
      if (clamped < 5.0) {
        spTheta.t = 0.0;
      } else {
        spTheta.t = (clamped * Math.PI) / 180;
      }
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setSwitch(32.0); // Default open at 32 deg
        return;
      }
      // Dragging vertically: bottom closes switch, top opens switch
      const minY = 35, maxY = 135;
      const norm = HL.clamp((pt[1] - minY) / (maxY - minY), 0, 1);
      setSwitch((1.0 - norm) * 45.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spTheta, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setSwitch(Number(v));
      },
      destroy: bag.dispose
    };
  }
},
];

// App Controller & View Logic for Physics Figures Suite
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
    PHYSICS_FIGURES.forEach((fig, idx) => {
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

    const fig = PHYSICS_FIGURES[idx];
    stage.setAttribute("data-hairline", fig.id);
    nameEl.textContent = fig.id;
    metaTitle.textContent = fig.title;
    metaDesc.textContent = fig.means;
    metaRule.textContent = "Khái niệm vật lý: " + fig.concept + " · Tiêu chuẩn: Hairline 2:1 Axonometric";

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
    PHYSICS_FIGURES.forEach((fig, idx) => {
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
    if (num >= 1 && num <= PHYSICS_FIGURES.length) {
      switchTo(num - 1);
    } else if (e.key === "g" || e.key === "G") {
      toggleGalleryMode();
    }
  });

  // Initial boot
  renderTabs();
  switchTo(0);
})();
