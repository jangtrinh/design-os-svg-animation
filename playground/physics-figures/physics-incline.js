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

export default {
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
};
