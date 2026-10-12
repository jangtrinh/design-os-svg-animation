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
 * Physical Concept: Cân bằng mô-men lực: F1 · d1 = F2 · d2
 * Geometry: Bệ đỡ phẳng, điểm tựa nêm tam giác lăng trụ trượt ngang, thanh đòn cứng, 2 quả tải trọng
 * Meaningful Kinematics: Di chuột điều chỉnh vị trí điểm tựa; thanh đòn nghiêng theo chênh lệch mô-men;
 * đạt cân bằng ngang hoàn hảo khi tỉ lệ cánh tay đòn nghịch tỉ lệ khối lượng (d2/d1 = m1/m2 = 2).
 */

{
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
},
/*
 * 2. Simple Harmonic Pendulum (Con Lắc Đơn Dao Động Điều Hòa)
 * Physical Concept: Bảo toàn cơ năng — Thế năng cực đại tại biên, Động năng cực đại qua VTCB
 * Geometry: Bệ đỡ phẳng, cột và tay đòn giá treo chữ L, dây treo mảnh, quả nặng kim loại đặc
 * Meaningful Kinematics: Kéo thả quả nặng đến góc lệch biên; con lắc dao động tự do với tần số
 * thực ω = √(g/l), giảm chấn vật lý, vạch quỹ đạo cung tròn mượt mà.
 */

{
  id: "physics-pendulum",
  title: "2. Con Lắc Đơn (Harmonic Pendulum)",
  concept: "Dao động điều hòa & Bảo toàn cơ năng: E = W_t + W_đ = const",
  means: "Di chuột để kéo quả nặng lệch khỏi vị trí cân bằng (tối đa ±35°), thả chuột để con lắc dao động điều hòa tự do qua lại: trực quan hóa sự chuyển hóa nhịp nhàng giữa thế năng (tại biên) và động năng (qua tâm).",
  rules: [1, 2, 4, 6, 8],
  range: [-35, 25, 35],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-45, -22, 0], [45, 22, 32]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Desktop Mat (Z: 0 to 2.5)
    const [matO, matI] = HL.rings(-42, -18, 42, 18, 3.0, 0.8);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2.5));

    // 2. Rigid Suspension Stand (Giá đỡ chữ L vững chãi)
    // Vertical post at X = -24, Y = 0 (Z: 2.5 to 28)
    const postRing = HL.circ(2.2, 16).map(q => ({ u: -24 + q.u, v: q.v, nu: q.nu, nv: q.nv }));
    const postSol = HL.solid(svg);
    HL.put(postSol, HL.prism(P, front, postRing, null, 2.5, 28));

    // Horizontal top arm from X = -24 to X = 0 at Z = 28
    const armO = HL.rrect(-26, -2.0, 2.0, 2.0, 1.5);
    const armSol = HL.solid(svg);
    HL.put(armSol, HL.prism(P, front, armO, null, 26.5, 29.0));

    // Suspension pivot pin at (0, 0, 27.5)
    const pivotPin = HL.mk("circle", {
      cx: HL.r2(P(0, 0, 27.5)[0]), cy: HL.r2(P(0, 0, 27.5)[1]), r: 1.6,
      fill: "#ffffff", stroke: "#232327", "stroke-width": 1.2
    }, svg);

    // Equilibrium plumb reference line (Vạch chuẩn tâm VTCB)
    HL.mk("line", {
      x1: HL.r2(P(0, 0, 27.5)[0]), y1: HL.r2(P(0, 0, 27.5)[1]),
      x2: HL.r2(P(0, 0, 5.5)[0]), y2: HL.r2(P(0, 0, 5.5)[1]),
      class: "lo", "stroke-width": 0.8, "stroke-dasharray": "2 2"
    }, svg);

    // Circular trajectory path arc
    const trajPath = HL.mk("path", { class: "lo nf", "stroke-dasharray": "3 3" }, svg);

    // 3. String & Pendulum Bob
    const L = 21.0; // String length
    const bobR = 3.6; // Spherical bob radius

    const stringLine = HL.mk("line", { class: "hi", "stroke-width": 1.0 }, svg);
    const bobGroup = HL.mk("g", {}, svg);
    const bobSil = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, bobGroup);
    const bobEquator = HL.mk("path", { class: "nf lo" }, bobGroup);
    const bobShine = HL.mk("circle", { r: 1.0, class: "dot" }, bobGroup);

    // Physics State
    let theta = initialV != null ? (initialV * Math.PI) / 180 : 0.42; // radians
    let omega = 0.0; // angular velocity (rad/s)
    let isDragging = false;
    const gravity = 9.8;
    const omega0 = Math.sqrt(gravity / (L * 0.05)); // natural frequency ~4.8 rad/s
    const damping = 0.45; // gentle physical decay

    // Build trajectory arc
    const arcPts = [];
    for (let deg = -40; deg <= 40; deg += 4) {
      const a = (deg * Math.PI) / 180;
      arcPts.push(P(L * Math.sin(a), 0, 27.5 - L * Math.cos(a)));
    }
    trajPath.setAttribute("d", HL.open(arcPts));

    function draw() {
      // Bob center in 3D
      const bx = L * Math.sin(theta);
      const bz = 27.5 - L * Math.cos(theta);
      const pPivot = P(0, 0, 27.5);
      const pBob = P(bx, 0, bz);

      // String line
      stringLine.setAttribute("x1", HL.r2(pPivot[0]));
      stringLine.setAttribute("y1", HL.r2(pPivot[1]));
      stringLine.setAttribute("x2", HL.r2(pBob[0]));
      stringLine.setAttribute("y2", HL.r2(pBob[1]));

      // Solid sphere projection for the bob:
      // A sphere in axonometric projection is a circle on screen
      const rScreen = bobR * C.S;
      const sphereRing = HL.circ(bobR, 32).map(q => P(bx + q.u, q.v, bz));
      const sphereHull = HL.poly(sphereRing);
      bobSil.setAttribute("d", sphereHull);

      // Equator crease
      const equatorPts = [];
      for (let k = 0; k <= 18; k++) {
        const a = (k / 18) * Math.PI;
        equatorPts.push(P(bx + bobR * Math.cos(a), bobR * Math.sin(a) * 0.4, bz));
      }
      bobEquator.setAttribute("d", HL.open(equatorPts));

      // Specular highlight dot
      const shinePt = P(bx - 1.2, -1.2, bz + 1.8);
      bobShine.setAttribute("cx", HL.r2(shinePt[0]));
      bobShine.setAttribute("cy", HL.r2(shinePt[1]));

      // Physics readouts
      const degNow = HL.r2((theta * 180) / Math.PI);
      const hMax = L * (1 - Math.cos(0.55));
      const hCur = L * (1 - Math.cos(theta));
      const epPercent = Math.min(100, Math.max(0, Math.round((hCur / (hMax || 1)) * 100)));
      const ekPercent = 100 - epPercent;

      const isCenter = Math.abs(degNow) < 1.5;
      bobSil.classList.toggle("hi", isCenter);

      if (isDragging) {
        read.textContent = `Con lắc đơn: Đang kéo lệch góc θ = ${degNow}° (Thế năng: ${epPercent}%, Động năng: 0%). Thả chuột để dao động.`;
      } else {
        read.textContent = `Con lắc đơn: θ = ${degNow}° | Thế năng W_t: ${epPercent}% ⇄ Động năng W_đ: ${ekPercent}% | ${isCenter ? "VẬN TỐC CỰC ĐẠI (qua VTCB)" : "Đang dao động"}`;
      }
    }

    function aim(pt) {
      if (!pt) {
        isDragging = false;
        reg.wake();
        return;
      }
      isDragging = true;
      omega = 0;
      const pivotScr = P(0, 0, 27.5);
      const dx = pt[0] - pivotScr[0];
      const dy = pt[1] - pivotScr[1];

      // Approximate angle from screen displacement
      const rawTheta = Math.atan2(dx, dy * 0.7);
      theta = HL.clamp(rawTheta, -0.62, 0.62); // Max +-35 deg
      reg.wake();
    }

    const reg = HL.register(stage, (dt, now) => {
      if (isDragging) {
        draw();
        return true;
      }

      // Numerical integration (Euler-Cromer) of nonlinear pendulum:
      // d^2(theta)/dt^2 = - (g/L) sin(theta) - damping * omega
      const substeps = 4;
      const subDt = Math.min(dt, 0.05) / substeps;

      for (let s = 0; s < substeps; s++) {
        const alpha = - (omega0 * omega0) * Math.sin(theta) - damping * omega;
        omega += alpha * subDt;
        theta += omega * subDt;
      }

      draw();

      // Keep awake if still swinging with energy
      const energy = 0.5 * omega * omega + (omega0 * omega0) * (1 - Math.cos(theta));
      return energy > 0.002;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        theta = (Number(v) * Math.PI) / 180;
        omega = 0;
        isDragging = false;
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 3. Spring Dynamometer (Lực Kế Lò Xo - Định Luật Hooke)
 * Physical Concept: Định luật Hooke: Lực đàn hồi tỷ lệ thuận với độ giãn: F = k · Δl
 * Geometry: Giá treo, ống vỏ lực kế có khe quan sát chia vạch Newton, lò xo xoắn ốc bên trong, móc treo và các đĩa cân
 * Meaningful Kinematics: Di chuột kéo móc tải trọng từ 0N đến 5N: lò xo giãn tuyến tính chính xác,
 * các quả cân xếp chồng lên móc, kim chỉ thị trỏ đúng vạch khắc Newton trên thân vỏ.
 */

{
  id: "physics-dynamometer",
  title: "3. Lực Kế Lò Xo (Spring Dynamometer)",
  concept: "Định luật Hooke: F = k · Δl (Lực đàn hồi & Độ biến dạng)",
  means: "Di chuột dọc để kéo móc hoặc tăng tải trọng từ 0N đến 5N: lò xo xoắn ốc co giãn tuyến tính mượt mà qua chuyển động đàn hồi, các đĩa cân 1N tự động xếp chồng, kim đo trỏ chính xác vạch Newton tương ứng.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 2, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-40, -20, 0], [40, 20, 36]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Desktop Mat (Z: 0 to 2.5)
    const [matO, matI] = HL.rings(-36, -16, 36, 16, 3.0, 0.8);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2.5));

    // 2. Rigid Support Stand (Cột và móc treo trên đỉnh Z = 34)
    // Pillar at X = -18, Y = 0 (Z: 2.5 to 35)
    const postRing = HL.circ(2.0, 16).map(q => ({ u: -18 + q.u, v: q.v, nu: q.nu, nv: q.nv }));
    const postSol = HL.solid(svg);
    HL.put(postSol, HL.prism(P, front, postRing, null, 2.5, 35));

    // Horizontal arm from X = -18 to X = 0 at Z = 35
    const armRing = HL.rrect(-20, -1.8, 1.5, 1.8, 1.2);
    const armSol = HL.solid(svg);
    HL.put(armSol, HL.prism(P, front, armRing, null, 33.5, 35.5));

    // Top suspension loop
    HL.mk("circle", {
      cx: HL.r2(P(0, 0, 34.0)[0]), cy: HL.r2(P(0, 0, 34.0)[1]), r: 1.5,
      fill: "#ffffff", stroke: "#232327", "stroke-width": 1.2
    }, svg);

    // 3. Dynamometer Outer Casing (Ống vỏ lực kế hình trụ Z: 14 to 32)
    // Slotted window in front allows seeing the spring and indicator inside
    const caseRadius = 4.2;
    const caseTopZ = 32.5;
    const caseBotZ = 16.0;

    const caseSol = HL.solid(svg);
    const caseRingO = HL.circ(caseRadius, 24);
    const caseRingI = HL.circ(caseRadius - 0.8, 24);
    HL.put(caseSol, HL.prism(P, front, caseRingO, caseRingI, caseBotZ, caseTopZ));

    // Graduation Scale Ticks on front casing (0N at Z = 25, 5N at Z = 17)
    // Each Newton is 1.6 units in Z
    const scaleGroup = HL.mk("g", {}, svg);
    for (let i = 0; i <= 5; i++) {
      const tickZ = 25.5 - i * 1.6;
      const tStart = P(caseRadius * 0.7, caseRadius * 0.7, tickZ);
      const tEnd = P(caseRadius * 0.7 + 2.5, caseRadius * 0.7, tickZ);
      HL.mk("line", {
        x1: HL.r2(tStart[0]), y1: HL.r2(tStart[1]),
        x2: HL.r2(tEnd[0]), y2: HL.r2(tEnd[1]),
        class: i === 0 || i === 5 ? "hi" : "lo",
        "stroke-width": i === 0 || i === 5 ? 1.2 : 0.8
      }, scaleGroup);
    }

    // 4. Helical Spring (Lò xo xoắn ốc axonometric)
    const springPath = HL.mk("path", { class: "hi nf", "stroke-width": 1.2 }, svg);

    // 5. Red Indicator Collar & Hanging Hook
    const indCollar = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-hi)", "stroke-width": 1.4 }, svg);
    const hookLine = HL.mk("path", { class: "hi nf", "stroke-width": 1.4 }, svg);

    // 6. Stack of Slotted 1N Weights (Các quả cân 1N treo dưới móc)
    const weightsGroup = HL.mk("g", {}, svg);
    const weightSols = [];
    for (let w = 0; w < 5; w++) {
      weightSols.push(HL.solid(weightsGroup));
    }

    // Kinematics spring for load force F (0 to 5 N)
    const currentF = initialV != null ? HL.clamp(initialV, 0, 5) : 2.0;
    const spF = HL.spring(currentF, { k: 150, c: 15 });

    function draw() {
      const fVal = spF.x;
      // Spring elongation: 1.6 units per 1 Newton
      const deltaZ = fVal * 1.6;
      const springTopZ = 29.5;
      const springBotZ = 25.5 - deltaZ;

      // Draw Helical Spring inside the case
      const coils = 8;
      const numSteps = coils * 12;
      const springR = 2.2;
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
      const colBot = springBotZ - 1.0;
      const colRing = HL.circ(3.2, 16);
      indCollar.setAttribute("d", HL.poly(HL.hull([
        ...colRing.map(q => P(q.u, q.v, colTop)),
        ...colRing.map(q => P(q.u, q.v, colBot))
      ])));

      // Hook hanging below the collar (from springBotZ - 1.0 down to springBotZ - 4.5)
      const hookTopZ = springBotZ - 1.0;
      const hookBotZ = hookTopZ - 4.5;
      const h0 = P(0, 0, hookTopZ);
      const h1 = P(0, 0, hookBotZ);
      const h2 = P(1.5, 0, hookBotZ - 1.2);
      const h3 = P(3.0, 0, hookBotZ);
      hookLine.setAttribute("d", `M${HL.r2(h0[0])} ${HL.r2(h0[1])} L${HL.r2(h1[0])} ${HL.r2(h1[1])} C${HL.r2(h2[0])} ${HL.r2(h2[1])}, ${HL.r2(h3[0])} ${HL.r2(h3[1])}, ${HL.r2(h3[0])} ${HL.r2(h3[1]-1)}`);

      // Stacked Slotted Weights (Quả cân 1N hình đĩa)
      const activeWeights = Math.min(5, Math.max(0, Math.round(fVal)));
      const weightThickness = 1.4;
      const weightR = 5.2;
      const wRingO = HL.circ(weightR, 20);
      const wRingI = HL.circ(1.2, 12);

      weightSols.forEach((sol, idx) => {
        if (idx < activeWeights) {
          const wz0 = hookBotZ - 1.5 - (idx + 1) * weightThickness;
          const wz1 = wz0 + weightThickness;
          HL.put(sol, HL.prism(P, front, wRingO, wRingI, wz0, wz1));
          sol.sil.style.display = "";
          sol.sil.classList.toggle("hi", idx === activeWeights - 1);
        } else {
          HL.put(sol, { sil: "", crease: "" });
        }
      });

      const measuredN = HL.r2(fVal);
      const deltaLmm = HL.r2(fVal * 8.0); // 8mm per Newton
      read.textContent = `Lực kế lò xo: Tải trọng F = ${measuredN} N (${activeWeights} quả cân 1N) · Độ giãn Δl = ${deltaLmm} mm · Độ cứng k = 125 N/m (F = k·Δl)`;
    }

    function setForce(targetF) {
      spF.t = HL.clamp(targetF, 0, 5);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setForce(2.0); // Default rest at 2N
        return;
      }
      const topScrY = P(0, 0, 26)[1];
      const botScrY = P(0, 0, 10)[1];
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

{
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
},
/*
 * 5. Knife Switch & Electric Circuit (Cầu Dao & Mạch Điện Đèn Sáng)
 * Physical Concept: Mạch điện đóng / ngắt (Closed vs Open Circuit):
 *   - Định luật Ohm: I = U / R.
 *   - Khi cầu dao mở (α > 5°): Mạch hở tại khe ngàm, điện trở vô cùng lớn (R → ∞), I = 0 A, đèn tắt.
 *   - Khi cầu dao sập đóng (α = 0°): Lưỡi dao đồng tiếp xúc khít ngàm kẹp, mạch kín hoàn toàn,
 *     dòng điện I = 1.5 A chạy qua, dây tóc bóng đèn rực sáng (P = I²·R = 9.0 W).
 * Geometry: Bệ sứ cách điện phẳng, đường dây đồng âm bệ, trụ bản lề đồng thau,
 *   ngàm kẹp đôi đàn hồi, lưỡi dao gập có cán cầm cách điện, đui đèn và bóng đèn dây tóc.
 * Meaningful Kinematics: Di chuột hoặc kéo cán dao để đóng/ngắt. Khi góc gập < 8°,
 *   lực cơ cấu đàn hồi hút sập dứt khoát lưỡi dao vào ngàm (snap action). Toàn bộ đèn và dây bừng sáng .hi.
 */

{
  id: "physics-switch",
  title: "5. Cầu Dao & Mạch Điện (Knife Switch & Circuit)",
  concept: "Mạch điện kín & hở: I = U/R · Công suất bóng đèn P = I²·R",
  means: "Di chuột hạ thấp cán cầm để đóng cầu dao. Khi lưỡi dao tiếp cận ngàm kẹp (góc < 8°), cơ cấu đàn hồi hút sập dao vào ngàm khép kín mạch điện: bóng đèn dây tóc lập tức rực sáng và dây dẫn chuyển trạng thái tích điện.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 35, 45],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-52, -22, 0], [52, 22, 32]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Porcelain Insulating Base Platform (Z: 0 to 2.5)
    const [matO, matI] = HL.rings(-48, -16, 48, 16, 3.0, 0.8);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2.5));

    // 2. Copper Circuit Traces along Base (Z = 2.6)
    // Left: Source terminal at (-36, 0)
    // Hinge at (-16, 0)
    // Jaw at (8, 0)
    // Lamp at (32, 0)
    // Return trace along Y = -10
    const wireGroup = HL.mk("g", {}, svg);
    const trace1 = HL.mk("path", { class: "lo", "stroke-width": 1.4 }, wireGroup);
    const traceReturn = HL.mk("path", { class: "lo", "stroke-width": 1.4 }, wireGroup);

    // Embossed circuit traces
    const ptSrc = P(-36, 0, 2.6);
    const ptHinge = P(-16, 0, 2.6);
    const ptJaw = P(8, 0, 2.6);
    const ptLampIn = P(27, 0, 2.6);
    const ptLampOut = P(32, -6, 2.6);
    const ptReturnCorner = P(-36, -10, 2.6);
    const ptSrcReturn = P(-36, -4, 2.6);

    trace1.setAttribute("d", `M ${HL.r2(ptSrc[0])} ${HL.r2(ptSrc[1])} L ${HL.r2(ptHinge[0])} ${HL.r2(ptHinge[1])} M ${HL.r2(ptJaw[0])} ${HL.r2(ptJaw[1])} L ${HL.r2(ptLampIn[0])} ${HL.r2(ptLampIn[1])}`);
    traceReturn.setAttribute("d", `M ${HL.r2(ptLampOut[0])} ${HL.r2(ptLampOut[1])} L ${HL.r2(ptReturnCorner[0])} ${HL.r2(ptReturnCorner[1])} L ${HL.r2(ptSrcReturn[0])} ${HL.r2(ptSrcReturn[1])}`);

    // Source Battery Pack Block at (-36, 0, 2.5 to 8.5)
    const [batO, batI] = HL.rings(-42, -5, -30, 5, 1.2, 0.5);
    const batSol = HL.solid(svg);
    HL.put(batSol, HL.prism(P, front, batO, batI, 2.5, 8.5));

    // Terminal screws on battery
    const batPost1 = P(-38, 0, 8.6);
    const batPost2 = P(-34, -2, 8.6);
    HL.mk("circle", { cx: HL.r2(batPost1[0]), cy: HL.r2(batPost1[1]), r: 1.5, class: "dot" }, svg);
    HL.mk("circle", { cx: HL.r2(batPost2[0]), cy: HL.r2(batPost2[1]), r: 1.5, class: "dot" }, svg);

    // 3. Switch Posts (Hinge & Contact Jaw)
    // Hinge Post at X = -16
    const [hingeO, hingeI] = HL.rings(-18.5, -3.5, -13.5, 3.5, 0.8, 0.4);
    const hingeSol = HL.solid(svg);
    HL.put(hingeSol, HL.prism(P, front, hingeO, hingeI, 2.5, 8.0));

    // Contact Jaw Post at X = 8 (two parallel vertical brass leaves)
    const [jaw1O, jaw1I] = HL.rings(6.5, -3.2, 10.5, -0.8, 0.5, 0.2);
    const [jaw2O, jaw2I] = HL.rings(6.5, 0.8, 10.5, 3.2, 0.5, 0.2);
    const jaw1Sol = HL.solid(svg);
    const jaw2Sol = HL.solid(svg);
    HL.put(jaw1Sol, HL.prism(P, front, jaw1O, jaw1I, 2.5, 9.0));
    HL.put(jaw2Sol, HL.prism(P, front, jaw2O, jaw2I, 2.5, 9.0));

    // 4. Lamp Assembly at X = 32
    // Ceramic socket cylinder (radius 5.0, Z: 2.5 to 6.5)
    const sockSol = HL.solid(svg);
    HL.put(sockSol, HL.prism(P, front, HL.circ(5.0, 24), HL.circ(4.4, 24), 2.5, 6.5, [32, 0]));

    // Bulb glass dome (Sphere / pear outline centered at 32, 0, 13.5)
    const bulbGroup = HL.mk("g", {}, svg);
    const bulbGlass = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, bulbGroup);
    const filament = HL.mk("path", { class: "lo", "stroke-width": 1.4, fill: "none" }, bulbGroup);
    const glowRays = HL.mk("g", { class: "hi", opacity: 0 }, bulbGroup);

    // Construct bulb 3D profile
    const bulbCenter = [32, 0, 13.5];
    const bulbR = 5.8;
    // Glass silhouette circle in projection
    const glassPoints = [];
    for (let a = 0; a < 32; a++) {
      const ang = (a * 2 * Math.PI) / 32;
      const gx = bulbCenter[0] + bulbR * Math.cos(ang);
      const gz = bulbCenter[2] + bulbR * Math.sin(ang);
      glassPoints.push(P(gx, 0, gz));
    }
    bulbGlass.setAttribute("d", HL.poly(glassPoints));

    // Filament loop inside
    const fA = P(30.5, 0, 10.5);
    const fTop = P(32.0, 0, 13.0);
    const fB = P(33.5, 0, 10.5);
    filament.setAttribute("d", `M ${HL.r2(fA[0])} ${HL.r2(fA[1])} L ${HL.r2(fTop[0])} ${HL.r2(fTop[1])} L ${HL.r2(fB[0])} ${HL.r2(fB[1])}`);

    // Glow radiant tick rays
    for (let rDeg = 0; rDeg < 360; rDeg += 45) {
      const rRad = (rDeg * Math.PI) / 180;
      const ray1 = P(bulbCenter[0] + (bulbR + 2.5) * Math.cos(rRad), 0, bulbCenter[2] + (bulbR + 2.5) * Math.sin(rRad));
      const ray2 = P(bulbCenter[0] + (bulbR + 5.5) * Math.cos(rRad), 0, bulbCenter[2] + (bulbR + 5.5) * Math.sin(rRad));
      HL.mk("line", {
        x1: HL.r2(ray1[0]), y1: HL.r2(ray1[1]),
        x2: HL.r2(ray2[0]), y2: HL.r2(ray2[1]),
        "stroke-width": 1.2
      }, glowRays);
    }

    // 5. Knife Switch Blade & Handle (Pivoting at (-16, 0, 7.5))
    const pivotX = -16.0, pivotZ = 7.5;
    const bladeLength = 26.0; // Distance to jaw contact
    const totalLength = 33.0; // Length including handle
    const bladeH = 2.4;       // Blade height in local Z
    const bladeThick = 0.8;   // Blade thickness in Y

    const bladeGroup = HL.mk("g", {}, svg);
    const bladeSide = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, bladeGroup);
    const bladeTop = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, bladeGroup);

    // Insulated handle grip at the end
    const handleGroup = HL.mk("g", {}, svg);
    const handleSol = HL.solid(handleGroup);

    // Kinematics Springs
    const initialDeg = initialV != null ? initialV : 35;
    const spTheta = HL.spring((initialDeg * Math.PI) / 180, { k: 140, c: 14 });

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
      const isClosed = thetaDeg <= 4.0;

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

      // B. Insulated Handle Grip (from u = 25 to 33, radius 2.2)
      // Cylindrical handle along blade arm
      const h0 = P(...transformBladePt(25, -2.0, bladeH / 2, theta));
      const h1 = P(...transformBladePt(33, -2.0, bladeH / 2, theta));
      const h2 = P(...transformBladePt(33, 2.0, bladeH / 2, theta));
      const h3 = P(...transformBladePt(25, 2.0, bladeH / 2, theta));

      const h0T = P(...transformBladePt(25, -2.0, bladeH / 2 + 3.0, theta));
      const h1T = P(...transformBladePt(33, -2.0, bladeH / 2 + 3.0, theta));
      const h2T = P(...transformBladePt(33, 2.0, bladeH / 2 + 3.0, theta));
      const h3T = P(...transformBladePt(25, 2.0, bladeH / 2 + 3.0, theta));

      let hSil = "";
      hSil += HL.poly([h3, h2, h2T, h3T]);
      hSil += HL.poly([h2, h1, h1T, h2T]);
      hSil += HL.poly([h0T, h1T, h2T, h3T]);
      HL.put(handleSol, { sil: hSil, crease: "" });

      // C. Circuit Activation & Electrical State
      bladeSide.classList.toggle("hi", isClosed);
      jaw1Sol.sil.classList.toggle("hi", isClosed);
      jaw2Sol.sil.classList.toggle("hi", isClosed);
      trace1.classList.toggle("hi", isClosed);
      traceReturn.classList.toggle("hi", isClosed);
      filament.classList.toggle("hi", isClosed);
      glowRays.setAttribute("opacity", isClosed ? 1 : 0);

      // D. Header Info
      const degStr = HL.r2(thetaDeg);
      if (isClosed) {
        read.textContent = `Cầu dao: [ĐÓNG MẠCH - KÍN] (α = 0°) · U = 6.0 V · I = 1.50 A · Công suất đèn P = 9.0 W ⇒ Mạch kín liên tục, bóng đèn rực sáng!`;
      } else {
        read.textContent = `Cầu dao: [NGẮT MẠCH - HỞ] (α = ${degStr}°) · Khe hở ngàm R → ∞ · Dòng điện I = 0.00 A · P = 0 W ⇒ Đèn tắt`;
      }
    }

    function setSwitch(deg) {
      const clamped = HL.clamp(deg, 0, 45);
      // Realistic knife-switch snap: if angle < 9 deg, magnetic/spring snaps to 0
      if (clamped < 9.0) {
        spTheta.t = 0.0;
      } else {
        spTheta.t = (clamped * Math.PI) / 180;
      }
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setSwitch(35.0); // Default open at 35 deg
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
