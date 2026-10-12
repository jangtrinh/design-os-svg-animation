/*
 * 3. Spring Dynamometer (Lực Kế Lò Xo - Định Luật Hooke)
 * Physical Concept: Định luật Hooke: Lực đàn hồi tỷ lệ thuận với độ giãn: F = k · Δl
 *   - Lực đo được: F = 0 N đến 5 N (tương ứng 0 đến 5 quả cân 1 N, m ≈ 102 g mỗi quả).
 *   - Độ dãn lò xo: Δl = F / k (tuyến tính tuyệt đối).
 *   - Độ cứng lò xo: k = 100 N/m ⇒ Mỗi 1 N dãn 10 mm.
 * Geometry (Precision Laboratory Instrument Discipline):
 *   - Bệ gang 3 chạc vững chãi (Cast-iron lab tripod/stand base) kèm cọc thép đứng và tay xà ngang có ốc siết.
 *   - Vỏ lực kế hình trụ trong suốt (transparent acrylic barrel) với nắp chụp kim loại 2 đầu.
 *   - Vạch khắc chia độ Newton 0–5 N trên thân vỏ.
 *   - Lò xo xoắn ốc axonometric biến dạng tuyến tính thực tế bên trong.
 *   - Đĩa kim chỉ thị màu nổi bật (indicator collar) gắn đồng trục với ti trượt và móc treo dưới.
 *   - Bộ quả cân đồng thau xẻ rãnh (slotted brass weights) 1 N xếp chồng tự nhiên dưới móc.
 * Meaningful Kinematics: Di chuột dọc để kéo móc tải trọng 0N–5N: lò xo dãn mượt mà theo phương trình đàn hồi,
 * kim chỉ thị trỏ chính xác từng vạch Newton, số đĩa cân 1 N tự động ăn khớp với lực đo.
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
    const C = HL.Cam(45, 0.5, 3.2);
    HL.fit(C, [[-26, -12, 0], [22, 12, 38]], 200, 160);
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

    // 1. Cast-Iron Laboratory Base (Z: 0 to 2.4)
    // Triangular heavy tripod base
    const baseSol = HL.solid(svg);
    const [bO, bI] = HL.rings(-28, -14, 24, 14, 2.4, 0.6);
    HL.put(baseSol, HL.prism(P, front, bO, bI, 0, 2.4));

    // Levelling thumb screws on base
    const lScrew1 = P(-24, -10, 2.5);
    const lScrew2 = P(-24, 10, 2.5);
    const lScrew3 = P(18, 0, 2.5);
    for (const pt of [lScrew1, lScrew2, lScrew3]) {
      HL.mk("circle", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 1.8, class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.0 }, svg);
      HL.mk("circle", { cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 0.6, class: "dot" }, svg);
    }

    // 2. Rigid Support Stand Rod & Cantilever Clamp Arm
    // Vertical steel column at X = -16, Y = 0 (Z: 2.4 to 34.5)
    const postSol = HL.solid(svg);
    const postO = circAt(-16, 0, 1.8, 16);
    const postI = circAt(-16, 0, 1.4, 16);
    HL.put(postSol, HL.prism(P, front, postO, postI, 2.4, 34.5));

    // Horizontal arm clamp boss at X = -16, Z = 32.5 to 34.5
    const clampSol = HL.solid(svg);
    const [clO, clI] = HL.rings(-18.5, -2.4, -13.5, 2.4, 0.6, 0.2);
    HL.put(clampSol, HL.prism(P, front, clO, clI, 32.2, 34.5));

    // Knurled thumbscrew on clamp
    const thumbPt = P(-16, -3.8, 33.3);
    HL.mk("circle", { cx: HL.r2(thumbPt[0]), cy: HL.r2(thumbPt[1]), r: 1.6, class: "hi", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.1 }, svg);

    // Cantilever arm extending to X = 0 at Z = 33.5
    const armSol = HL.solid(svg);
    const [armO, armI] = HL.rings(-14, -1.2, 2.0, 1.2, 0.5, 0.2);
    HL.put(armSol, HL.prism(P, front, armO, armI, 32.8, 34.2));

    // Top suspension loop at (0, 0, 33.0)
    const topPin = P(0, 0, 33.0);
    HL.mk("circle", {
      cx: HL.r2(topPin[0]), cy: HL.r2(topPin[1]), r: 2.0,
      class: "hi", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.2
    }, svg);

    // 3. Dynamometer Outer Casing (Z: 14.5 to 32.0)
    // Top chrome cap (Z: 30.5 to 32.0)
    const topCapSol = HL.solid(svg);
    const capO = circAt(0, 0, 4.4, 24);
    const capI = circAt(0, 0, 3.8, 24);
    HL.put(topCapSol, HL.prism(P, front, capO, capI, 30.5, 32.0));

    // Transparent cylindrical casing barrel (Z: 16.0 to 30.5)
    const barrelSol = HL.solid(svg);
    const barO = circAt(0, 0, 4.2, 24);
    const barI = circAt(0, 0, 3.6, 24);
    HL.put(barrelSol, HL.prism(P, front, barO, barI, 16.0, 30.5));

    // Bottom cap with guide collar (Z: 14.5 to 16.0)
    const botCapSol = HL.solid(svg);
    HL.put(botCapSol, HL.prism(P, front, capO, capI, 14.5, 16.0));

    // Graduation Scale Ticks on front barrel face (0N at Z = 26.5, 5N at Z = 16.5)
    // 2.0 units in Z per 1 Newton
    const scaleGroup = HL.mk("g", {}, svg);
    for (let i = 0; i <= 5; i++) {
      const tickZ = 26.5 - i * 2.0;
      // Front facing ticks
      const tA = P(3.2, 2.2, tickZ);
      const tB = P(4.4, 3.0, tickZ);
      HL.mk("line", {
        x1: HL.r2(tA[0]), y1: HL.r2(tA[1]),
        x2: HL.r2(tB[0]), y2: HL.r2(tB[1]),
        class: i === 0 || i === 5 ? "hi" : "lo",
        "stroke-width": i === 0 || i === 5 ? 1.4 : 0.8
      }, scaleGroup);

      // Minor half-newton ticks
      if (i < 5) {
        const halfZ = tickZ - 1.0;
        const hA = P(3.4, 2.3, halfZ);
        const hB = P(4.1, 2.8, halfZ);
        HL.mk("line", {
          x1: HL.r2(hA[0]), y1: HL.r2(hA[1]),
          x2: HL.r2(hB[0]), y2: HL.r2(hB[1]),
          class: "lo", "stroke-width": 0.6
        }, scaleGroup);
      }
    }

    // 4. Helical Spring inside the casing
    const springPath = HL.mk("path", { class: "hi nf", "stroke-width": 1.4 }, svg);

    // 5. Sliding Red Indicator Collar & Hook Rod
    const indCollar = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-hi)", "stroke-width": 1.5 }, svg);
    const hookLine = HL.mk("path", { class: "hi nf", "stroke-width": 1.4 }, svg);

    // 6. Stack of Slotted 1N Brass Weights
    const weightsGroup = HL.mk("g", {}, svg);
    const weightSols = [];
    for (let w = 0; w < 5; w++) {
      weightSols.push(HL.solid(weightsGroup));
    }

    // Kinematics spring for load force F (0 to 5 N)
    const currentF = initialV != null ? HL.clamp(initialV, 0, 5) : 2.0;
    const spF = HL.spring(currentF, { k: 140, c: 14 });

    function draw() {
      const fVal = spF.x;
      // Spring elongation: 2.0 units per 1 Newton
      const deltaZ = fVal * 2.0;
      const springTopZ = 29.5;
      const springBotZ = 26.5 - deltaZ;

      // Draw Helical Spring inside casing
      const coils = 9;
      const numSteps = coils * 14;
      const springR = 2.4;
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
      const colBot = springBotZ - 1.2;
      const colRing = circAt(0, 0, 3.4, 18);
      indCollar.setAttribute("d", HL.poly(HL.hull([
        ...colRing.map(q => P(q.u, q.v, colTop)),
        ...colRing.map(q => P(q.u, q.v, colBot))
      ])));

      // Hook Rod hanging below the collar (from colBot down through casing bottom to hook)
      const hookTopZ = colBot;
      const hookBotZ = hookTopZ - 5.5;
      const h0 = P(0, 0, hookTopZ);
      const h1 = P(0, 0, hookBotZ);
      const h2 = P(1.6, 0, hookBotZ - 1.4);
      const h3 = P(3.2, 0, hookBotZ - 0.2);
      hookLine.setAttribute("d", `M ${HL.r2(h0[0])} ${HL.r2(h0[1])} L ${HL.r2(h1[0])} ${HL.r2(h1[1])} C ${HL.r2(h2[0])} ${HL.r2(h2[1])}, ${HL.r2(h3[0])} ${HL.r2(h3[1])}, ${HL.r2(h3[0])} ${HL.r2(h3[1] - 1.2)}`);

      // Stacked Slotted 1N Weights (Quả cân đồng 1N)
      const activeWeights = Math.min(5, Math.max(0, Math.round(fVal)));
      const weightThickness = 1.4;
      const weightR = 5.4;
      const wRingO = circAt(0, 0, weightR, 20);
      const wRingI = circAt(0, 0, 1.2, 12);

      weightSols.forEach((sol, idx) => {
        if (idx < activeWeights) {
          const wz0 = hookBotZ - 1.8 - (idx + 1) * (weightThickness + 0.2);
          const wz1 = wz0 + weightThickness;
          HL.put(sol, HL.prism(P, front, wRingO, wRingI, wz0, wz1));
          sol.sil.style.display = "";
          sol.sil.classList.toggle("hi", idx === activeWeights - 1);
        } else {
          HL.put(sol, { sil: "", crease: "" });
        }
      });

      const measuredN = HL.r2(fVal);
      const deltaLmm = HL.r2(fVal * 10.0); // 10 mm per Newton (k = 100 N/m)
      read.textContent = `Lực kế lò xo: Tải trọng F = ${measuredN} N (${activeWeights} quả cân 1N) · Độ giãn Δl = ${deltaLmm} mm · Độ cứng k = 100 N/m (F = k·Δl)`;
    }

    function setForce(targetF) {
      spF.t = HL.clamp(targetF, 0, 5);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setForce(2.0); // Default rest at 2.0 N
        return;
      }
      const topScrY = P(0, 0, 26)[1];
      const botScrY = P(0, 0, 8)[1];
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
