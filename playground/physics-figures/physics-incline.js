/*
 * 4. Inclined Plane & Friction (Mặt Phẳng Nghiêng & Khối Trượt)
 * Physical Concept: Phân tích lực trên mặt phẳng nghiêng:
 *   P∥ = P · sin(α) (thành phần kéo trượt dọc dốc)
 *   P⊥ = P · cos(α) (áp lực vuông góc mặt dốc)
 *   Fms_max = μ · P⊥ = μ · P · cos(α)
 *   Điều kiện trượt: tan(α) > μ (với μ ≈ 0.445 tương ứng góc giới hạn α_c ≈ 24°)
 * Geometry: Đế bệ phẳng vững chãi, mặt trượt có bản lề nâng góc α,
 *   thanh chống điều chỉnh, cữ chặn chân dốc, khối trượt lăng trụ đặc opaque.
 * Kinematics: Di chuột điều chỉnh góc dốc α từ 0° đến 45°.
 *   Khi α ≤ 24°: Khối trượt ở trạng thái cân bằng tĩnh (Fms triệt tiêu P∥).
 *   Khi α > 24°: Lực kéo trượt thắng ma sát nghỉ cực đại, khối trượt gia tốc trượt xuống chân dốc.
 */

export default {
  id: "physics-incline",
  title: "4. Mặt Phẳng Nghiêng (Inclined Plane & Friction)",
  concept: "Phân tích trọng lực trên dốc: P∥ = P·sin(α) vs Fms = μ·P·cos(α)",
  means: "Di chuột dọc để nâng/hạ góc nghiêng α từ 0° đến 45°. Khi góc dốc vượt góc ma sát giới hạn (α > 24°), lực kéo trượt vượt lực ma sát nghỉ cực đại, khối trượt gia tốc lao xuống chân dốc.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 15, 45],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-52, -22, 0], [52, 22, 38]], 200, 160);
    const P = HL.proj(C);

    // 1. Base Mat & Platform (Z: 0 to 2.5)
    const [matO, matI] = HL.rings(-48, -16, 48, 16, 3.0, 0.8);
    const matSol = HL.solid(svg);
    const front = HL.facing(C);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2.5));

    // Base guide rail & protractor base line
    HL.mk("line", {
      x1: HL.r2(P(-36, 12, 2.6)[0]), y1: HL.r2(P(-36, 12, 2.6)[1]),
      x2: HL.r2(P(36, 12, 2.6)[0]), y2: HL.r2(P(36, 12, 2.6)[1]),
      class: "lo", "stroke-width": 1.0
    }, svg);

    // Pivot support block at X = -32, Y: -10 to 10, Z: 2.5 to 7.0
    const pivotX = -30, pivotZ = 6.0;
    const pivotBlockSol = HL.solid(svg);
    const [pivO, pivI] = HL.rings(pivotX - 4, -10, pivotX + 4, 10, 1.0, 0.5);
    HL.put(pivotBlockSol, HL.prism(P, front, pivO, pivI, 2.5, pivotZ));

    // 2. Protractor Sector Arc (Front side Y = 10, radius 18 around pivot)
    const protractorGroup = HL.mk("g", {}, svg);
    const protractorArc = HL.mk("path", { class: "lo", "stroke-width": 1.0, "stroke-dasharray": "2 2" }, protractorGroup);
    // Critical angle marker tick (24 degrees - friction limit)
    const critLine = HL.mk("line", { class: "hi", "stroke-width": 1.2 }, protractorGroup);

    // Draw protractor arc ticks
    const arcR = 16.0;
    let arcD = "";
    for (let deg = 0; deg <= 45; deg += 3) {
      const rad = (deg * Math.PI) / 180;
      const px = pivotX + arcR * Math.cos(rad);
      const pz = pivotZ + arcR * Math.sin(rad);
      const pt = P(px, 10.2, pz);
      if (deg === 0) arcD += `M ${HL.r2(pt[0])} ${HL.r2(pt[1])}`;
      else arcD += ` L ${HL.r2(pt[0])} ${HL.r2(pt[1])}`;

      if (deg % 15 === 0 || deg === 24) {
        const pIn = P(pivotX + (arcR - 2.5) * Math.cos(rad), 10.2, pivotZ + (arcR - 2.5) * Math.sin(rad));
        HL.mk("line", {
          x1: HL.r2(pIn[0]), y1: HL.r2(pIn[1]),
          x2: HL.r2(pt[0]), y2: HL.r2(pt[1]),
          class: deg === 24 ? "hi" : "lo",
          "stroke-width": deg === 24 ? 1.4 : 0.8
        }, protractorGroup);
      }
    }
    protractorArc.setAttribute("d", arcD);

    // 3. Hinged Incline Ramp Plank
    const rampLength = 62.0;
    const rampW = 8.5; // Y from -rampW to +rampW
    const rampH = 2.2; // Thickness

    const rampGroup = HL.mk("g", {}, svg);
    const rampSol = HL.solid(rampGroup);

    // 4. Sliding Block (Khối trượt)
    const blockL = 12.0;
    const blockW = 6.5;
    const blockH = 6.0;
    const blockGroup = HL.mk("g", {}, svg);
    const blockSol = HL.solid(blockGroup);

    // 5. Support Strut (Thanh chống bên dưới mặt nghiêng)
    const strutGroup = HL.mk("g", {}, svg);
    const strutLine = HL.mk("line", { class: "sil", "stroke-width": 2.2, stroke: "var(--hl-edge)" }, strutGroup);

    // Kinematics Springs
    const initialDeg = initialV != null ? initialV : 15;
    const spAlpha = HL.spring((initialDeg * Math.PI) / 180, { k: 120, c: 14 });
    // Box position along ramp: u from 8 (bottom stop) to 48 (top rest)
    const spBoxU = HL.spring(46, { k: 70, c: 10 });

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

      // Update critical angle line
      const critRad = (24 * Math.PI) / 180;
      const cP0 = P(pivotX + 8 * Math.cos(critRad), 10.2, pivotZ + 8 * Math.sin(critRad));
      const cP1 = P(pivotX + 17 * Math.cos(critRad), 10.2, pivotZ + 17 * Math.sin(critRad));
      critLine.setAttribute("x1", HL.r2(cP0[0]));
      critLine.setAttribute("y1", HL.r2(cP0[1]));
      critLine.setAttribute("x2", HL.r2(cP1[0]));
      critLine.setAttribute("y2", HL.r2(cP1[1]));

      // A. Draw Hinged Ramp Plank
      // 8 vertices of the plank
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

      // Silhouette & creases of ramp
      let rSil = "";
      // Front side (+Y)
      rSil += HL.poly([r010, r110, r111, r011]);
      // Right end (+U)
      rSil += HL.poly([r110, r100, r101, r111]);
      // Top face
      rSil += HL.poly([r001, r101, r111, r011]);
      // Buffer block
      rSil += HL.poly([b01, b11, b11T, b01T]);
      rSil += HL.poly([b10, b11, b11T, b10T]);
      rSil += HL.poly([b00T, b10T, b11T, b01T]);

      let rCrease = "";
      rCrease += `M ${HL.r2(r011[0])} ${HL.r2(r011[1])} L ${HL.r2(r111[0])} ${HL.r2(r111[1])}`;
      rCrease += ` M ${HL.r2(r111[0])} ${HL.r2(r111[1])} L ${HL.r2(r101[0])} ${HL.r2(r101[1])}`;
      rCrease += ` M ${HL.r2(b01T[0])} ${HL.r2(b01T[1])} L ${HL.r2(b11T[0])} ${HL.r2(b11T[1])}`;

      HL.put(rampSol, { sil: rSil, crease: rCrease });

      // Support strut from base at (15, 0, 2.5) to ramp underside at u = 40
      const strutBase = P(15, 0, 2.5);
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
      // Front side (+Y)
      bkSil += HL.poly([bk010, bk110, bk111, bk011]);
      // Right face (+U)
      bkSil += HL.poly([bk110, bk100, bk101, bk111]);
      // Top face
      bkSil += HL.poly([bk001, bk101, bk111, bk011]);

      let bkCrease = "";
      bkCrease += `M ${HL.r2(bk011[0])} ${HL.r2(bk011[1])} L ${HL.r2(bk111[0])} ${HL.r2(bk111[1])}`;
      bkCrease += ` M ${HL.r2(bk111[0])} ${HL.r2(bk111[1])} L ${HL.r2(bk101[0])} ${HL.r2(bk101[1])}`;

      HL.put(blockSol, { sil: bkSil, crease: bkCrease });

      // Highlight block when sliding
      const isSliding = alphaDeg > 24.0;
      blockSol.sil.classList.toggle("hi", isSliding);

      // DOM Header calculation
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
      // Physical reaction: if angle exceeds 24 deg, target position slides to buffer (u = 12.5)
      // If angle <= 24 deg, target position returns to top section (u = 46)
      if (clamped > 24.0) {
        spBoxU.t = 12.5; // Slide to buffer
      } else {
        spBoxU.t = 46.0; // Rest at top
      }
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setAngle(15.0); // Default rest angle
        return;
      }
      // Vertical pointer dragging changes incline angle
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
