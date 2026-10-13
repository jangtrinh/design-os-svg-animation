/*
 * 2. Simple Harmonic Pendulum & Energy Conservation (Con Lắc Đơn & Bảo Toàn Cơ Năng)
 * Physical Concept: Bảo toàn cơ năng & chuyển hóa năng lượng thực tế:
 *   - Cơ năng toàn phần: E = W_đ + W_t
 *   - Thế năng trọng trường: W_t = m·g·L(1 - cos θ)
 *   - Động năng: W_đ = 1/2·m·v² = 1/2·m·(L·ω)²
 *   - Tính toán động năng THẬT TỪ VẬN TỐC GÓC ω (rad/s), không dùng giả định W_đ = 100 - W_t.
 *   - Khi con lắc đứng yên tại VTCB (θ = 0, ω = 0): W_t = 0% VÀ W_đ = 0% (hệ nghỉ).
 *   - Phương trình vi phân dao động có cản: d²θ/dt² + 2β·dθ/dt + (g/L)·sin θ = 0
 * Geometry (Hairline Specimen Discipline):
 *   - Chân đế gang đúc chữ T vững chãi (Heavy T-frame cast-iron base).
 *   - Cột đứng thép đặc, tay đòn ngang vươn ra điểm treo chính giữa.
 *   - Quả nặng hình cầu kim loại đặc 3D thật (true spherical projection, không bị elip hóa dẹt).
 *   - Vạch cung quỹ đạo, vạch tâm dọi VTCB.
 */

export default {
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
};
