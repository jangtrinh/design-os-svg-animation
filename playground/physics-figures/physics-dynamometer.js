/*
 * 3. Spring Dynamometer (Lực Kế Lò Xo - Định Luật Hooke)
 * Physical Concept: Định luật Hooke: Lực đàn hồi tỷ lệ thuận với độ giãn: F = k · Δl
 *   - Lực đo được: F = 0 N đến 5 N (0 đến 5 quả cân 1 N).
 *   - Độ cứng lò xo: k = 100 N/m ⇒ Mỗi 1 N dãn 10 mm.
 */

export default {
  id: "physics-dynamometer",
  title: "3. Lực Kế Lò Xo (Spring Dynamometer)",
  concept: "Định luật Hooke: F = k · Δl (Lực đàn hồi & Độ biến dạng tuyến tính)",
  means: "Di chuột dọc để kéo móc hoặc tăng tải trọng từ 0N đến 5N: lò xo xoắn ốc co giãn tuyến tính mượt mà qua chuyển động đàn hồi, các đĩa cân 1N tự động xếp chồng, kim đo trỏ chính xác vạch Newton tương ứng.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 2.0, 5.0],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.85);
    HL.fit(C, [[-28, -14, 0], [24, 14, 36]], 200, 160);
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

    // 1. Cast-Iron Laboratory Base (Z: 0 to 2.4)
    const baseSol = HL.solid(svg);
    const [bO, bI] = HL.rings(-28, -14, 24, 14, 2.4, 0.6);
    HL.put(baseSol, HL.prism(P, front, bO, bI, 0, 2.4));

    for (const pt of [P(-24, -10, 2.5), P(-24, 10, 2.5), P(18, 0, 2.5)]) {
      HL.mk("ellipse", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), rx: 1.8, ry: 1.4, class: "lo" }, svg);
      HL.mk("circle", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 0.7, class: "dot" }, svg);
    }

    // 2. Rigid Support Stand Rod & Cantilever Clamp Arm
    const postSol = HL.solid(svg);
    HL.put(postSol, HL.prism(P, front, circAt(-17, 0, 1.8, 16), circAt(-17, 0, 1.4, 16), 2.4, 34.5));

    const clampSol = HL.solid(svg);
    const [clO, clI] = HL.rings(-19.5, -2.4, -14.5, 2.4, 0.6, 0.2);
    HL.put(clampSol, HL.prism(P, front, clO, clI, 32.2, 34.5));

    const armSol = HL.solid(svg);
    const [armO, armI] = HL.rings(-15, -1.3, 2.5, 1.3, 0.5, 0.2);
    HL.put(armSol, HL.prism(P, front, armO, armI, 32.8, 34.2));

    const topPin = P(0, 0, 33.0);
    HL.mk("ellipse", { cx: HL.r2(topPin[0]), cy: HL.r2(topPin[1]), rx: 1.8, ry: 1.8, class: "sil" }, svg);

    // 3. Dynamometer Outer Casing (Z: 15.5 to 32.0)
    const capO = circAt(0, 0, 4.4, 22), capI = circAt(0, 0, 3.8, 22);
    const barO = circAt(0, 0, 4.2, 22), barI = circAt(0, 0, 3.6, 22);
    const topCapSol = HL.solid(svg);
    HL.put(topCapSol, HL.prism(P, front, capO, capI, 30.5, 32.0));
    const barrelSol = HL.solid(svg);
    HL.put(barrelSol, HL.prism(P, front, barO, barI, 16.8, 30.5));
    const botCapSol = HL.solid(svg);
    HL.put(botCapSol, HL.prism(P, front, capO, capI, 15.4, 16.8));

    // Scale graduation ticks (0N at Z = 27.0, 5N at Z = 18.0 -> 1.8 units/N)
    let ticksD = "";
    for (let i = 0; i <= 5; i++) {
      const tickZ = 27.0 - i * 1.8;
      ticksD += HL.seg(P(3.2, 2.2, tickZ), P(4.6, 3.1, tickZ));
      if (i < 5) {
        const halfZ = tickZ - 0.9;
        ticksD += HL.seg(P(3.4, 2.3, halfZ), P(4.2, 2.8, halfZ));
      }
    }
    const scaleTicks = HL.mk("path", { d: ticksD, class: "lo nf" }, svg);

    // 4. Helical Spring, Indicator Collar, Pointer Needle, Hook & Weights
    const springHelix = HL.mk("path", { class: "hi nf" }, svg);
    const indCollar = HL.mk("path", { class: "sil" }, svg);
    const pointerNeedle = HL.mk("path", { class: "hi nf" }, svg);
    const hookStem = HL.mk("path", { class: "sil nf" }, svg);
    const hookCurve = HL.mk("path", { class: "hi nf" }, svg);
    const forceArrow = HL.mk("path", { class: "hi nf" }, svg);

    const weightsGroup = HL.mk("g", {}, svg);
    const weightSols = Array.from({ length: 5 }, () => HL.solid(weightsGroup));

    const currentF = initialV != null ? HL.clamp(initialV, 0, 5) : 2.0;
    const spF = HL.spring(currentF, { k: 140, c: 14 });
    let lastKey = "";

    function draw() {
      const fVal = spF.x;
      const key = `${HL.r2(fVal)}`;
      if (key === lastKey) return;
      lastKey = key;

      const deltaZ = fVal * 1.8;
      const springTopZ = 29.8;
      const springBotZ = 27.0 - deltaZ;

      const coils = 8, numSteps = coils * 12, springR = 2.4;
      const spPts = [];
      for (let k = 0; k <= numSteps; k++) {
        const t = k / numSteps;
        const ang = t * coils * Math.PI * 2;
        spPts.push(P(springR * Math.cos(ang), springR * Math.sin(ang), springTopZ - t * (springTopZ - springBotZ)));
      }
      springHelix.setAttribute("d", HL.open(spPts));

      const colTop = springBotZ, colBot = springBotZ - 1.1;
      const colRing = circAt(0, 0, 3.3, 18);
      indCollar.setAttribute("d", HL.poly(HL.hull([
        ...colRing.map(q => P(q.u, q.v, colTop)),
        ...colRing.map(q => P(q.u, q.v, colBot))
      ])));
      pointerNeedle.setAttribute("d", HL.seg(P(2.6, 1.8, springBotZ), P(4.8, 3.3, springBotZ)));

      const hookTopZ = colBot, hookBotZ = hookTopZ - 4.2;
      const h0 = P(0, 0, hookTopZ), h1 = P(0, 0, hookBotZ);
      const h2 = P(1.6, 0, hookBotZ - 1.2), h3 = P(2.8, 0, hookBotZ - 0.2);
      hookStem.setAttribute("d", HL.seg(h0, h1));
      hookCurve.setAttribute("d", `M ${HL.r2(h1[0])} ${HL.r2(h1[1])} C ${HL.r2(h2[0])} ${HL.r2(h2[1])}, ${HL.r2(h3[0])} ${HL.r2(h3[1])}, ${HL.r2(h3[0])} ${HL.r2(h3[1] - 1.0)}`);

      const activeWeights = Math.min(5, Math.max(0, Math.round(fVal)));
      const weightThickness = 1.25;
      const wRingO = circAt(0, 0, 5.2, 20), wRingI = circAt(0, 0, 1.2, 12);

      weightSols.forEach((sol, idx) => {
        if (idx < activeWeights) {
          const wz0 = hookBotZ - 1.4 - (idx + 1) * (weightThickness + 0.15);
          HL.put(sol, HL.prism(P, front, wRingO, wRingI, wz0, wz0 + weightThickness));
          sol.sil.classList.toggle("hi", idx === activeWeights - 1);
        } else {
          HL.put(sol, { sil: "", crease: "" });
          sol.sil.classList.remove("hi");
        }
      });

      const arrTop = P(8.0, 0, 26.0), arrBot = P(8.0, 0, 25.0 - deltaZ);
      forceArrow.setAttribute("d", HL.seg(arrTop, arrBot) + HL.seg(P(7.0, 0, 26.0 - deltaZ), arrBot) + HL.seg(P(9.0, 0, 26.0 - deltaZ), arrBot));
      scaleTicks.classList.toggle("lo", true);

      const measuredN = fVal.toFixed(1);
      const deltaLmm = Math.round(fVal * 10);
      read.textContent = `F=${measuredN}N · Δl=${deltaLmm}mm (${activeWeights} quả)`;
    }

    function setForce(targetF) {
      spF.t = HL.clamp(targetF, 0, 5);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setForce(2.0); return; }
      const [, wy] = HL.unproj(C, pt[0], pt[1], 18);
      const norm = HL.clamp((wy + 12) / 24, 0, 1);
      setForce(norm * 5.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spF, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setForce(Number(v)); }, destroy: bag.dispose };
  }
};
