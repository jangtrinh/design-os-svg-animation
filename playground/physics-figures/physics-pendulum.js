/*
 * 2. Simple Harmonic Pendulum & Energy Conservation (Con Lắc Đơn & Bảo Toàn Cơ Năng)
 * Physical Concept: Bảo toàn cơ năng: E = W_t(θ) + W_đ(ω)
 */

export default {
  id: "physics-pendulum",
  title: "2. Con Lắc Đơn (Harmonic Pendulum)",
  concept: "Bảo toàn cơ năng: E = W_t(θ) + W_đ(ω) · Chuyển hóa thế năng và động năng",
  means: "Kéo thả quả nặng đến góc lệch biên (±35°); con lắc chuyển hóa giữa thế năng trọng trường và động năng theo góc lệch θ, ổn định êm ái qua hệ đàn hồi.",
  rules: [1, 2, 4, 6, 8],
  range: [-35, 25, 35],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 4.25);
    HL.fit(C, [[-30, -15, 0], [26, 15, 42]], 204, 162);
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

    // 1. Heavy Cast-Iron T-Frame Base (Z: 0 to 2.6)
    const baseSol = HL.solid(svg);
    const [bFootO, bFootI] = HL.rings(-29, -6, 20, 6, 1.4, 0.5);
    HL.put(baseSol, HL.prism(P, front, bFootO, bFootI, 0, 2.6));

    const crossSol = HL.solid(svg);
    const [cFootO, cFootI] = HL.rings(-29, -14, -18, 14, 1.4, 0.5);
    HL.put(crossSol, HL.prism(P, front, cFootO, cFootI, 0, 2.4));

    // 2. Rigid Vertical Post & Cantilever Suspension Arm
    const postSol = HL.solid(svg);
    HL.put(postSol, HL.prism(P, front, circAt(-22, 0, 2.0, 18), circAt(-22, 0, 1.5, 18), 2.6, 40.0));

    const armSol = HL.solid(svg);
    const [armO, armI] = HL.rings(-24, -2.0, 3.0, 2.0, 0.8, 0.3);
    HL.put(armSol, HL.prism(P, front, armO, armI, 38.2, 40.4));

    const pPivot = P(0, 0, 39.0);
    HL.mk("ellipse", { cx: HL.r2(pPivot[0]), cy: HL.r2(pPivot[1]), rx: 2.6, ry: 2.6, class: "sil" }, svg);
    HL.mk("circle", { cx: HL.r2(pPivot[0]), cy: HL.r2(pPivot[1]), r: 1.2, class: "dot" }, svg);

    // Equilibrium plumb line & circular trajectory swingArc
    const L = 29.0, bobR = 4.6;
    const plumbBot = P(0, 0, 4.5);
    HL.mk("path", { d: HL.seg(pPivot, plumbBot), class: "lo nf dash" }, svg);

    const arcPts = [];
    for (let deg = -38; deg <= 38; deg += 2) {
      const a = (deg * Math.PI) / 180;
      arcPts.push(P(L * Math.sin(a), 0, 39.0 - L * Math.cos(a)));
    }
    const swingArc = HL.mk("path", { d: HL.open(arcPts), class: "lo nf dash" }, svg);
    const heightLine = HL.mk("path", { class: "lo nf dash" }, svg);

    // 3. Cord & True Spherical Pendulum Bob (using <ellipse> so kernel CSS fills with --hl-plate)
    const cordMain = HL.mk("path", { class: "hi nf" }, svg);
    const bobGroup = HL.mk("g", {}, svg);
    const bobScreenR = HL.r2(bobR * C.S);
    const bobBody = HL.mk("ellipse", { rx: bobScreenR, ry: bobScreenR, class: "sil" }, bobGroup);
    const bobEquator = HL.mk("path", { class: "lo nf" }, bobGroup);
    const bobMeridian = HL.mk("path", { class: "lo nf" }, bobGroup);
    const bobShine = HL.mk("circle", { r: 1.5, class: "dot" }, bobGroup);

    const startDeg = initialV != null ? initialV : 25;
    const spDeg = HL.spring(startDeg, { k: 220, c: 18 });
    let lastKey = "";

    function draw() {
      const degNow = spDeg.x;
      const vel = Math.abs(spDeg.v);
      const key = `${HL.r2(degNow)}:${HL.r2(vel)}`;
      if (key === lastKey) return;
      lastKey = key;

      const theta = (degNow * Math.PI) / 180;
      const bx = L * Math.sin(theta);
      const bz = 39.0 - L * Math.cos(theta);
      const pBob = P(bx, 0, bz);
      const pAxisRef = P(0, 0, bz);

      cordMain.setAttribute("d", HL.seg(pPivot, pBob));
      heightLine.setAttribute("d", HL.seg(pAxisRef, pBob));

      HL.place(bobBody, pBob);
      const eqW = bobR * C.S;
      const eqH = bobR * C.S * 0.36;
      bobEquator.setAttribute(
        "d",
        `M ${HL.r2(pBob[0] - eqW)} ${HL.r2(pBob[1])} A ${HL.r2(eqW)} ${HL.r2(eqH)} 0 0 0 ${HL.r2(pBob[0] + eqW)} ${HL.r2(pBob[1])}`
      );
      bobMeridian.setAttribute(
        "d",
        `M ${HL.r2(pBob[0])} ${HL.r2(pBob[1] - eqW)} A ${HL.r2(eqH)} ${HL.r2(eqW)} 0 0 0 ${HL.r2(pBob[0])} ${HL.r2(pBob[1] + eqW)}`
      );
      HL.place(bobShine, [pBob[0] - eqW * 0.35, pBob[1] - eqW * 0.35]);

      const hMaxRef = L * (1 - Math.cos((35 * Math.PI) / 180));
      const hCur = Math.max(0, L * (1 - Math.cos(theta)));
      const epPercent = Math.min(100, Math.round((hCur / hMaxRef) * 100));
      const ekPercent = Math.max(0, 100 - epPercent);

      const isHighPotential = Math.abs(degNow) >= 15;
      bobBody.classList.toggle("hi", isHighPotential);
      swingArc.classList.toggle("hi", Math.abs(degNow) >= 28);

      read.textContent = `θ=${degNow.toFixed(1)}° · Wt=${epPercent}% · Wđ=${ekPercent}%`;
    }

    function setAngle(deg) {
      spDeg.t = HL.clamp(deg, -35, 35);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setAngle(25); return; }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 14);
      const disp = (wx - wy) * 0.7;
      setAngle(HL.clamp(disp * 1.4, -35, 35));
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spDeg, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setAngle(Number(v)); }, destroy: bag.dispose, dispose: bag.dispose };
  }
};
