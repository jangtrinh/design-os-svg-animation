/*
 * 1. Lever & Fulcrum (Đòn Bẩy & Điểm Tựa - Định Luật Đòn Bẩy Acsimet)
 * Physical Concept: Cân bằng mô-men lực: F1 · d1 = F2 · d2
 * Geometry: Bệ đỡ phẳng, điểm tựa nêm tam giác lăng trụ trượt ngang, thanh đòn cứng, 2 quả tải trọng
 * Meaningful Kinematics: Di chuột điều chỉnh vị trí điểm tựa; thanh đòn nghiêng theo chênh lệch mô-men;
 * đạt cân bằng ngang hoàn hảo khi tỉ lệ cánh tay đòn nghịch tỉ lệ khối lượng (d2/d1 = m1/m2 = 2).
 */

export default {
  id: "physics-lever",
  title: "1. Đòn Bẩy & Điểm Tựa (Lever & Fulcrum)",
  concept: "Quy tắc đòn bẩy: F₁ · d₁ = F₂ · d₂ (Cân bằng mô-men lực)",
  means: "Di chuột ngang để dịch chuyển vị trí điểm tựa nêm: thanh đòn nghiêng mượt mà theo độ lệch mô-men. Khi cánh tay đòn đạt đúng tỉ lệ 2:1 (d₂ = 2d₁), đòn bẩy thăng bằng tuyệt đối, kim chỉ tâm kích hoạt trạng thái cân bằng.",
  rules: [1, 2, 4, 6, 9],
  range: [-20, -10.7, 15],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-52, -22, 0], [52, 22, 28]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Desktop Mat (Z: 0 to 2.5)
    const [matO, matI] = HL.rings(-48, -16, 48, 16, 3.0, 0.8);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2.5));

    // Guide groove along the fulcrum slider track
    HL.mk("line", {
      x1: HL.r2(P(-24, 0, 2.6)[0]), y1: HL.r2(P(-24, 0, 2.6)[1]),
      x2: HL.r2(P(20, 0, 2.6)[0]), y2: HL.r2(P(20, 0, 2.6)[1]),
      class: "lo", "stroke-width": 1.0, "stroke-dasharray": "3 2"
    }, svg);

    // Scale graduation ticks on the mat
    for (let gx = -20; gx <= 16; gx += 4) {
      HL.mk("line", {
        x1: HL.r2(P(gx, -2.5, 2.6)[0]), y1: HL.r2(P(gx, -2.5, 2.6)[1]),
        x2: HL.r2(P(gx, 2.5, 2.6)[0]), y2: HL.r2(P(gx, 2.5, 2.6)[1]),
        class: "lo", "stroke-width": 0.8
      }, svg);
    }

    // 2. Triangular Wedge Fulcrum (Điểm tựa tam giác lăng trụ di động)
    const fulcrumGroup = HL.mk("g", {}, svg);
    const fulcrumSide = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, fulcrumGroup);
    const fulcrumTop = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, fulcrumGroup);
    const fulcrumNeedle = HL.mk("line", { class: "hi", "stroke-width": 1.4 }, fulcrumGroup);

    // 3. Tilting Lever Beam (Thanh đòn bẩy)
    const beamLength = 72; // X from -36 to +36 relative to lever center
    const beamWidth = 6.0;  // Y from -3.0 to +3.0
    const beamH = 2.2;      // Thickness in Z

    const beamGroup = HL.mk("g", {}, svg);
    const beamSide = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, beamGroup);
    const beamTop = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, beamGroup);
    const centerIndicator = HL.mk("circle", { r: 1.4, class: "dot" }, beamGroup);

    // 4. Two Loads: Mass 1 (2 kg, Left end) & Mass 2 (1 kg, Right end)
    const load1Group = HL.mk("g", {}, svg);
    const load1Sol = HL.solid(load1Group);
    const load2Group = HL.mk("g", {}, svg);
    const load2Sol = HL.solid(load2Group);

    // Mass dimensions:
    // M1 = 2kg (taller cylinder, r=3.2, h=7.0 at relative X = -31)
    // M2 = 1kg (shorter cylinder, r=3.2, h=3.5 at relative X = +31)
    const cylRing = HL.circ(3.2, 24);
    const cylInner = HL.circ(2.8, 24);

    // Kinematics springs
    // Fulcrum X position
    const spXf = HL.spring(initialV != null ? initialV : -10.7, { k: 140, c: 15 });
    // Beam tilt angle (radians)
    const spTheta = HL.spring(0, { k: 100, c: 14 });

    function draw() {
      const xf = spXf.x;
      const th = spTheta.x; // Tilt angle

      // A. Draw Sliding Wedge Fulcrum
      // Base: X from xf - 4 to xf + 4, Y: -6 to 6, Z: 2.5
      // Apex ridge: X = xf, Y: -6 to 6, Z: 10.5
      const apexZ = 10.5;
      const fBaseL0 = P(xf - 4.5, -6.0, 2.5), fBaseL1 = P(xf - 4.5, 6.0, 2.5);
      const fBaseR0 = P(xf + 4.5, -6.0, 2.5), fBaseR1 = P(xf + 4.5, 6.0, 2.5);
      const fApex0 = P(xf, -6.0, apexZ), fApex1 = P(xf, 6.0, apexZ);

      // Fulcrum sides
      let fSideD = "";
      // Front triangular end at Y = 6.0
      fSideD += HL.poly([fBaseL1, fBaseR1, fApex1]);
      // Right sloped face
      fSideD += HL.poly([fBaseR1, fApex1, fApex0, fBaseR0]);
      fulcrumSide.setAttribute("d", fSideD);

      // Left sloped face
      fulcrumTop.setAttribute("d", HL.poly([fBaseL0, fApex0, fApex1, fBaseL1]));

      // Fulcrum reference mark
      fulcrumNeedle.setAttribute("x1", HL.r2(fApex1[0]));
      fulcrumNeedle.setAttribute("y1", HL.r2(fApex1[1]));
      fulcrumNeedle.setAttribute("x2", HL.r2(fApex1[0]));
      fulcrumNeedle.setAttribute("y2", HL.r2(fApex1[1] + 6));

      // B. Draw Tilting Beam
      // Pivot point is at (xf, 0, apexZ + beamH/2)
      // Any point along beam at relative distance s from fulcrum:
      // X = xf + s * cos(th), Z = apexZ + beamH/2 + s * sin(th)
      const cosT = Math.cos(th), sinT = Math.sin(th);
      const sMin = -36 - xf; // Left end relative to fulcrum
      const sMax = 36 - xf;  // Right end relative to fulcrum

      const beamPt = (s, y, zRel) => {
        const x = xf + s * cosT - zRel * sinT;
        const z = apexZ + 1.1 + s * sinT + zRel * cosT;
        return P(x, y, z);
      };

      // 8 corners of the beam box:
      const b0 = beamPt(sMin, -3.0, -1.1); // Left-back-bottom
      const b1 = beamPt(sMax, -3.0, -1.1); // Right-back-bottom
      const b2 = beamPt(sMax, 3.0, -1.1);  // Right-front-bottom
      const b3 = beamPt(sMin, 3.0, -1.1);  // Left-front-bottom

      const t0 = beamPt(sMin, -3.0, 1.1);  // Left-back-top
      const t1 = beamPt(sMax, -3.0, 1.1);  // Right-back-top
      const t2 = beamPt(sMax, 3.0, 1.1);   // Right-front-top
      const t3 = beamPt(sMin, 3.0, 1.1);   // Left-front-top

      // Front side & right/left ends
      let bSideD = "";
      bSideD += HL.poly([b3, b2, t2, t3]); // Front longitudinal wall
      if (th < 0) {
        bSideD += HL.poly([b2, b1, t1, t2]); // Right end face
      } else {
        bSideD += HL.poly([b3, b0, t0, t3]); // Left end face
      }
      beamSide.setAttribute("d", bSideD);

      // Top face
      beamTop.setAttribute("d", HL.poly([t0, t1, t2, t3]));

      // Center indicator dot at beam midpoint (s = -xf)
      const centerPt = beamPt(-xf, 0, 1.15);
      centerIndicator.setAttribute("cx", HL.r2(centerPt[0]));
      centerIndicator.setAttribute("cy", HL.r2(centerPt[1]));

      // C. Draw Masses on Beam
      // M1 (2kg) at absolute X = -31, relative s1 = -31 - xf
      const s1 = -31 - xf;
      const m1BaseZ = apexZ + 1.1 + s1 * sinT + 1.1 * cosT;
      const m1BaseX = xf + s1 * cosT - 1.1 * sinT;
      const m1Ring = cylRing.map(q => ({ u: m1BaseX + q.u, v: q.v, nu: q.nu, nv: q.nv }));
      HL.put(load1Sol, HL.prism(P, front, m1Ring, cylInner, m1BaseZ, m1BaseZ + 7.5));

      // M2 (1kg) at absolute X = +31, relative s2 = 31 - xf
      const s2 = 31 - xf;
      const m2BaseZ = apexZ + 1.1 + s2 * sinT + 1.1 * cosT;
      const m2BaseX = xf + s2 * cosT - 1.1 * sinT;
      const m2Ring = cylRing.map(q => ({ u: m2BaseX + q.u, v: q.v, nu: q.nu, nv: q.nv }));
      HL.put(load2Sol, HL.prism(P, front, m2Ring, cylInner, m2BaseZ, m2BaseZ + 4.0));

      // Balance status & highlight
      const isBalanced = Math.abs(th) < 0.015;
      beamTop.classList.toggle("hi", isBalanced);
      fulcrumNeedle.classList.toggle("hi", isBalanced);

      const d1 = HL.r2(Math.abs(-31 - xf));
      const d2 = HL.r2(Math.abs(31 - xf));
      const torque1 = HL.r2(2 * d1);
      const torque2 = HL.r2(1 * d2);

      if (isBalanced) {
        read.textContent = `Đòn bẩy: CÂN BẰNG HOÀN HẢO! M₁·d₁ = 2×${d1} = ${torque1} N·cm == M₂·d₂ = 1×${d2} = ${torque2} N·cm (d₂ = 2·d₁)`;
      } else if (th > 0) {
        read.textContent = `Đòn bẩy: Lệch trái! M₁·d₁ (${torque1}) > M₂·d₂ (${torque2}). Di chuyển điểm tựa sang trái để cân bằng.`;
      } else {
        read.textContent = `Đòn bẩy: Lệch phải! M₁·d₁ (${torque1}) < M₂·d₂ (${torque2}). Di chuyển điểm tựa sang phải để cân bằng.`;
      }
    }

    function setFulcrumX(targetX) {
      const clampedX = HL.clamp(targetX, -22, 16);
      spXf.t = clampedX;

      // Compute physical torque:
      // M1 = 2kg at X = -31, arm d1 = clampedX - (-31) = clampedX + 31
      // M2 = 1kg at X = 31, arm d2 = 31 - clampedX
      // Torque clockwise (positive tilts left):
      const t1 = 2 * (clampedX + 31);
      const t2 = 1 * (31 - clampedX);
      const netTorque = t1 - t2; // >0: left drops, <0: right drops

      // Physical angle with mechanical stops at +- 11 degrees (+- 0.19 rad)
      const targetAngle = HL.clamp((netTorque / 40) * 0.19, -0.19, 0.19);
      // Snap to exact zero when within balance tolerance
      spTheta.t = Math.abs(netTorque) < 1.8 ? 0 : targetAngle;

      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setFulcrumX(-10.7); // Reset to exact physical balance
        return;
      }
      const sMinX = P(-24, 0, 5)[0];
      const sMaxX = P(20, 0, 5)[0];
      const norm = HL.clamp((pt[0] - sMinX) / (sMaxX - sMinX), 0, 1);
      const targetX = -22 + norm * 38;
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
