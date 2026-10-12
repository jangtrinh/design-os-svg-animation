/*
 * 2. Simple Harmonic Pendulum (Con Lắc Đơn Dao Động Điều Hòa)
 * Physical Concept: Bảo toàn cơ năng — Thế năng cực đại tại biên, Động năng cực đại qua VTCB
 * Geometry: Bệ đỡ phẳng, cột và tay đòn giá treo chữ L, dây treo mảnh, quả nặng kim loại đặc
 * Meaningful Kinematics: Kéo thả quả nặng đến góc lệch biên; con lắc dao động tự do với tần số
 * thực ω = √(g/l), giảm chấn vật lý, vạch quỹ đạo cung tròn mượt mà.
 */

export default {
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
};
