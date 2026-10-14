/*
 * 5. Knife Switch & Electric Circuit (Cầu Dao & Mạch Điện Đèn Sáng)
 * Physical Concept: Mạch điện đóng / ngắt (Closed vs Open Circuit):
 *   - Định luật Ohm: I = U / R (U = 6.0 V, I = 1.50 A, P = 9.0 W khi đóng mạch)
 */

export default {
  id: "physics-switch",
  title: "5. Cầu Dao & Mạch Điện (Knife Switch & Circuit)",
  concept: "Mạch điện kín & hở: I = U/R · Công suất bóng đèn P = I²·R",
  means: "Di chuột hạ thấp cán cầm để đóng cầu dao. Khi lưỡi dao tiếp cận ngàm kẹp (góc < 5°), cơ cấu đàn hồi hút sập dao vào ngàm khép kín mạch điện: bóng đèn dây tóc lập tức rực sáng và dây dẫn chuyển trạng thái tích điện.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 32, 45],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.55);
    HL.fit(C, [[-42, -16, 0], [42, 16, 26]], 200, 152);
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

    // 1. Insulating Switchboard Base (Z: 0 to 2.4)
    const baseSol = HL.solid(svg);
    const [baseO, baseI] = HL.rings(-42, -15, 42, 15, 2.2, 0.6);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.4));

    for (const [cx, cy] of [[-39, -12], [39, -12], [-39, 12], [39, 12]]) {
      const pt = P(cx, cy, 2.45);
      HL.mk("ellipse", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), rx: 1.8, ry: 1.4, class: "lo" }, svg);
      HL.mk("circle", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 0.7, class: "dot" }, svg);
    }

    // 2. Battery Power Block at X = -32 (Z: 2.4 to 9.2)
    const batSol = HL.solid(svg);
    const [batO, batI] = HL.rings(-38, -6.5, -26, 6.5, 1.2, 0.4);
    HL.put(batSol, HL.prism(P, front, batO, batI, 2.4, 9.2));

    const postPlus = P(-35, 2.6, 9.3), postMinus = P(-35, -2.6, 9.3);
    HL.mk("ellipse", { cx: HL.r2(postPlus[0]), cy: HL.r2(postPlus[1]), rx: 1.8, ry: 1.4, class: "hi" }, svg);
    HL.mk("ellipse", { cx: HL.r2(postMinus[0]), cy: HL.r2(postMinus[1]), rx: 1.8, ry: 1.4, class: "lo" }, svg);

    // 3. Stamped Copper Circuit Traces along Base (Z = 2.5)
    const wireLoop = HL.mk("path", {
      d: HL.seg(P(-35, 2.5, 2.5), P(-14, 0, 2.5)) + HL.seg(P(10, 0, 2.5), P(24, 0, 2.5)) +
         HL.open([P(28, -4.5, 2.5), P(-35, -10.5, 2.5), P(-35, -2.5, 2.5)]),
      class: "lo nf"
    }, svg);

    // 4. Switch Trunnion Hinge Post at X = -14 & Twin Contact Jaws at X = 10
    const pivotX = -14.0, pivotZ = 7.2;
    const hingeSol = HL.solid(svg);
    const [hO, hI] = HL.rings(-16.5, -3.2, -11.5, 3.2, 0.8, 0.3);
    HL.put(hingeSol, HL.prism(P, front, hO, hI, 2.4, 7.8));
    const pivotFork = HL.mk("path", { d: HL.seg(P(-14, -3.6, pivotZ), P(-14, 3.6, pivotZ)), class: "sil nf" }, svg);

    const jaw1Sol = HL.solid(svg), jaw2Sol = HL.solid(svg);
    const [j1O, j1I] = HL.rings(8.5, -3.0, 11.5, -0.6, 0.4, 0.2);
    const [j2O, j2I] = HL.rings(8.5, 0.6, 11.5, 3.0, 0.4, 0.2);
    HL.put(jaw1Sol, HL.prism(P, front, j1O, j1I, 2.4, 9.2));
    HL.put(jaw2Sol, HL.prism(P, front, j2O, j2I, 2.4, 9.2));

    const clipJawL = HL.mk("path", { d: HL.open([P(8.5, -0.6, 9.2), P(8.5, -3.6, 10.4), P(11.5, -3.6, 10.4), P(11.5, -0.6, 9.2)]), class: "sil nf" }, svg);
    const clipJawR = HL.mk("path", { d: HL.open([P(8.5, 0.6, 9.2), P(8.5, 3.6, 10.4), P(11.5, 3.6, 10.4), P(11.5, 0.6, 9.2)]), class: "sil nf" }, svg);

    // 5. Porcelain Lamp Socket & 3D Spherical Lightbulb at X = 28 (using <ellipse> for warm plate fill)
    const socketSol = HL.solid(svg);
    HL.put(socketSol, HL.prism(P, front, circAt(28, 0, 5.0, 22), circAt(28, 0, 4.3, 22), 2.4, 5.8));
    const collarSol = HL.solid(svg);
    HL.put(collarSol, HL.prism(P, front, circAt(28, 0, 3.9, 18), circAt(28, 0, 3.3, 18), 5.8, 7.6));

    const bulbCenter = [28, 0, 13.8], bulbR = 5.4;
    const pCenter = P(...bulbCenter), bRad = HL.r2(bulbR * C.S);
    const bulbGlass = HL.mk("ellipse", { cx: HL.r2(pCenter[0]), cy: HL.r2(pCenter[1]), rx: bRad, ry: bRad, class: "sil" }, svg);
    const refR = bulbR * C.S * 0.72;
    HL.mk("path", {
      d: `M ${HL.r2(pCenter[0] - refR * 0.7)} ${HL.r2(pCenter[1] - refR * 0.5)} A ${HL.r2(refR)} ${HL.r2(refR)} 0 0 1 ${HL.r2(pCenter[0] - refR * 0.2)} ${HL.r2(pCenter[1] - refR * 0.85)}`,
      class: "lo nf"
    }, svg);

    const stemTop = P(28, 0, 8.6), fLeft = P(26.5, 0, 11.8), fRight = P(29.5, 0, 11.8), fPeak = P(28.0, 0, 14.6);
    const filament = HL.mk("path", {
      d: HL.seg([stemTop[0] - 1, stemTop[1]], fLeft) + HL.seg([stemTop[0] + 1, stemTop[1]], fRight) +
         `M ${HL.r2(fLeft[0])} ${HL.r2(fLeft[1])} Q ${HL.r2(fPeak[0])} ${HL.r2(fPeak[1])} ${HL.r2(fRight[0])} ${HL.r2(fRight[1])}`,
      class: "lo nf"
    }, svg);

    let activeRaysD = "";
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg * Math.PI) / 180;
      const r1 = P(bulbCenter[0] + (bulbR + 1.8) * Math.cos(rad), (bulbR + 1.8) * Math.sin(rad) * 0.4, bulbCenter[2] + (bulbR + 1.8) * Math.sin(rad));
      const r2 = P(bulbCenter[0] + (bulbR + 4.8) * Math.cos(rad), (bulbR + 4.8) * Math.sin(rad) * 0.4, bulbCenter[2] + (bulbR + 4.8) * Math.sin(rad));
      activeRaysD += HL.seg(r1, r2);
    }
    const glowRays = HL.mk("path", { class: "hi nf" }, svg);

    // 6. Knife Switch Blade & Turned Handle
    const bladeSol = HL.solid(svg);
    const handleSol = HL.solid(svg);
    const initialDeg = initialV != null ? initialV : 32;
    const spTheta = HL.spring((initialDeg * Math.PI) / 180, { k: 150, c: 14 });
    let lastKey = "";

    function bPt(u, v, w, theta) {
      const ct = Math.cos(theta), st = Math.sin(theta);
      return P(pivotX + u * ct - w * st, v, pivotZ + u * st + w * ct);
    }

    function boxBlade(u0, u1, v0, v1, w0, w1, theta) {
      const p000 = bPt(u0, v0, w0, theta), p100 = bPt(u1, v0, w0, theta);
      const p110 = bPt(u1, v1, w0, theta), p010 = bPt(u0, v1, w0, theta);
      const p001 = bPt(u0, v0, w1, theta), p101 = bPt(u1, v0, w1, theta);
      const p111 = bPt(u1, v1, w1, theta), p011 = bPt(u0, v1, w1, theta);
      return {
        sil: HL.poly(HL.hull([p000, p100, p110, p010, p001, p101, p111, p011])),
        crease: HL.seg(p011, p111) + HL.seg(p111, p101) + HL.seg(p111, p110)
      };
    }

    function draw() {
      const theta = spTheta.x;
      const key = `${HL.r2(theta)}`;
      if (key === lastKey) return;
      lastKey = key;

      const thetaDeg = (theta * 180) / Math.PI;
      const isClosed = thetaDeg <= 2.0;

      HL.put(bladeSol, boxBlade(0, 24.5, -0.8, 0.8, 0, 2.5, theta));
      HL.put(handleSol, boxBlade(23.5, 33.5, -2.2, 2.2, -0.6, 3.2, theta));

      bladeSol.sil.classList.toggle("hi", true);
      wireLoop.classList.toggle("hi", isClosed);
      filament.classList.toggle("hi", isClosed);
      bulbGlass.classList.toggle("hi", isClosed);
      glowRays.setAttribute("d", isClosed ? activeRaysD : "");
      pivotFork.classList.toggle("sil", true);
      clipJawL.classList.toggle("sil", true);
      clipJawR.classList.toggle("sil", true);

      const degStr = thetaDeg.toFixed(0);
      read.textContent = isClosed ? `Mạch kín · I=1.5A · P=9.0W` : `Mạch hở α=${degStr}° · I=0A`;
    }

    function setSwitch(deg) {
      const clamped = HL.clamp(deg, 0, 45);
      spTheta.t = clamped < 5.0 ? 0.0 : (clamped * Math.PI) / 180;
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setSwitch(32.0); return; }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 10);
      const norm = HL.clamp(1.0 - (wx + wy + 16) / 32, 0, 1);
      setSwitch(norm * 45.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spTheta, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setSwitch(Number(v)); }, destroy: bag.dispose };
  }
};
