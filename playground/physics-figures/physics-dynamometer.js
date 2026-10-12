/*
 * 3. Spring Dynamometer (Lực Kế Lò Xo - Định Luật Hooke)
 * Physical Concept: Định luật Hooke: Lực đàn hồi tỷ lệ thuận với độ giãn: F = k · Δl
 * Geometry: Giá treo, ống vỏ lực kế có khe quan sát chia vạch Newton, lò xo xoắn ốc bên trong, móc treo và các đĩa cân
 * Meaningful Kinematics: Di chuột kéo móc tải trọng từ 0N đến 5N: lò xo giãn tuyến tính chính xác,
 * các quả cân xếp chồng lên móc, kim chỉ thị trỏ đúng vạch khắc Newton trên thân vỏ.
 */

export default {
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
};
