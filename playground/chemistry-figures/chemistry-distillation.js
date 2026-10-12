/*
 * 4. Distillation Apparatus & Liebig Condenser (Bộ Chưng Cất & Ống Sinh Hàn)
 * Chemical Concept: Phương pháp chưng cất tách chất theo nhiệt độ sôi:
 *   - Hỗn hợp Ethanol (t_sôi = 78.3°C) và Nước (t_sôi = 100°C).
 *   - Khi t° ≥ 78.3°C: Ethanol sôi bay hơi trước, qua nhánh bình cầu vào ống sinh hàn Liebig.
 *   - Nước làm mát tuần hoàn quanh áo ngoài hấp thụ nhiệt làm hơi ngưng tụ thành chất lỏng tinh khiết,
 *     nhỏ giọt đều đặn vào bình hứng Erlenmeyer (100% opaque).
 * Geometry: Bệ thí nghiệm phẳng, bình cầu chưng cất có nhiệt kế, ống sinh hàn 2 lớp nghiêng dốc,
 *   vòi nước làm mát, các giọt ngưng tụ chạy dọc lòng ống, bình hứng tam giác đặc.
 * Kinematics: Di chuột điều chỉnh nhiệt độ đun từ 50°C đến 95°C. Khi vượt 78.3°C,
 *   hơi bốc lên mãnh liệt, các giọt ngưng tụ chảy thành dòng nhịp nhàng và bình hứng kích hoạt .hi.
 */

export default {
  id: "chemistry-distillation",
  title: "4. Chưng Cất & Sinh Hàn (Distillation Apparatus)",
  concept: "Tách chất lỏng theo nhiệt độ sôi: Bay hơi C₂H₅OH (78.3°C) ──> Ngưng tụ trao đổi nhiệt",
  means: "Di chuột tăng nhiệt độ bình chưng cất. Khi vượt qua nhiệt độ sôi của ethanol (t° ≥ 78.3°C), hơi cồn bốc lên, đi qua ống sinh hàn Liebig làm mát ngưng tụ thành từng giọt chất lỏng nguyên chất chảy vào bình hứng.",
  rules: [1, 2, 4, 6, 9],
  range: [50, 78.3, 95],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Lab Bench Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // 2. Distillation Flask at Left (-22, 0)
    // Heating mantle base at (-22, 0, 2.5 to 7.0)
    const mantleSol = HL.solid(svg);
    HL.put(mantleSol, HL.prism(P, front, HL.circ(7.0, 20), HL.circ(6.2, 20), 2.5, 7.0, [-22, 0]));

    // Spherical Glass Bulb centered at (-22, 0, 12.0), radius 6.0
    const flaskGroup = HL.mk("g", {}, svg);
    const flaskGlass = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);
    const flaskNeck = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);
    const thermometer = HL.mk("line", { class: "lo", "stroke-width": 1.2 }, flaskGroup);

    // Distillation flask spherical profile
    const bulbPts = [];
    const bCenter = [-22, 0, 12.0];
    const bR = 6.0;
    for (let a = 0; a < 24; a++) {
      const ang = (a * 2 * Math.PI) / 24;
      bulbPts.push(P(bCenter[0] + bR * Math.cos(ang), 0, bCenter[2] + bR * Math.sin(ang)));
    }
    flaskGlass.setAttribute("d", HL.poly(bulbPts));

    // Vertical neck up to Z = 23.5 (width 4.0)
    const nP0 = P(-24, 0, 15.0), nP1 = P(-20, 0, 15.0);
    const nP2 = P(-20, 0, 23.5), nP3 = P(-24, 0, 23.5);
    flaskNeck.setAttribute("d", HL.poly([nP0, nP1, nP2, nP3]));

    // Thermometer mercury thread
    const th0 = P(-22, 0, 24.5), th1 = P(-22, 0, 14.5);
    thermometer.setAttribute("x1", HL.r2(th0[0]));
    thermometer.setAttribute("y1", HL.r2(th0[1]));
    thermometer.setAttribute("x2", HL.r2(th1[0]));
    thermometer.setAttribute("y2", HL.r2(th1[1]));

    // 3. Liebig Condenser (Ống sinh hàn nghiêng)
    // Runs from (-18, 0, 19) down to (+12, 0, 9.0)
    const condenserGroup = HL.mk("g", {}, svg);
    const jacketSol = HL.solid(condenserGroup);
    const innerTube = HL.mk("line", { class: "lo", "stroke-width": 1.4 }, condenserGroup);

    const cStart = [-18, 0, 19];
    const cEnd = [12, 0, 9.0];
    const cLen = Math.hypot(cEnd[0] - cStart[0], cEnd[2] - cStart[2]);
    const cDir = [(cEnd[0] - cStart[0]) / cLen, (cEnd[2] - cStart[2]) / cLen];
    const cNorm = [-cDir[1], cDir[0]];

    // Outer jacket cylinder polygon (solid opaque)
    const jR = 3.2;
    const j0 = P(cStart[0] + 3 * cDir[0] + jR * cNorm[0], 0, cStart[2] + 3 * cDir[1] + jR * cNorm[1]);
    const j1 = P(cStart[0] + 3 * cDir[0] - jR * cNorm[0], 0, cStart[2] + 3 * cDir[1] - jR * cNorm[1]);
    const j2 = P(cEnd[0] - 2 * cDir[0] - jR * cNorm[0], 0, cEnd[2] - 2 * cDir[1] - jR * cNorm[1]);
    const j3 = P(cEnd[0] - 2 * cDir[0] + jR * cNorm[0], 0, cEnd[2] - 2 * cDir[1] + jR * cNorm[1]);

    HL.put(jacketSol, { sil: HL.poly([j0, j1, j2, j3]), crease: "" });

    // Inner tube
    const pStart = P(...cStart), pEnd = P(...cEnd);
    innerTube.setAttribute("x1", HL.r2(pStart[0]));
    innerTube.setAttribute("y1", HL.r2(pStart[1]));
    innerTube.setAttribute("x2", HL.r2(pEnd[0]));
    innerTube.setAttribute("y2", HL.r2(pEnd[1]));

    // Condensation droplets running down inner tube
    const dropGroup = HL.mk("g", { class: "hi" }, condenserGroup);
    const dropDots = [];
    for (let d = 0; d < 4; d++) {
      const dot = HL.mk("circle", { r: 1.1, class: "dot", opacity: 0 }, dropGroup);
      dropDots.push(dot);
    }

    // 4. Receiving Flask (Bình hứng Erlenmeyer) at Right (+18, 0) - Solid Opaque Frustum
    const recGroup = HL.mk("g", {}, svg);
    const recBody = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, recGroup);
    const recTopFace = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, recGroup);
    const recLiquid = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, recGroup);

    const recBaseR = 7.2;
    const recNeckR = 2.6;

    // Erlenmeyer 3D solid construction at (+18, 0)
    function buildRecPath() {
      const bPts = [];
      for (let i = 0; i <= 12; i++) {
        const ang = (135 - i * 15) * Math.PI / 180;
        bPts.push(P(18 + recBaseR * Math.cos(ang), recBaseR * Math.sin(ang), 2.5));
      }
      const tPts = [];
      for (let i = 0; i <= 12; i++) {
        const ang = (-45 + i * 15) * Math.PI / 180;
        tPts.push(P(18 + recNeckR * Math.cos(ang), recNeckR * Math.sin(ang), 9.0));
      }
      recBody.setAttribute("d", HL.poly([...bPts, ...tPts]));

      const rimPts = [];
      for (let a = 0; a < 20; a++) {
        const ang = (a * 2 * Math.PI) / 20;
        rimPts.push(P(18 + recNeckR * Math.cos(ang), recNeckR * Math.sin(ang), 9.0));
      }
      recTopFace.setAttribute("d", HL.poly(rimPts));
    }
    buildRecPath();

    // Kinematics Springs
    const initialTemp = initialV != null ? initialV : 78.3;
    const spTemp = HL.spring(initialTemp, { k: 120, c: 14 });
    let animTime = 0;

    function draw() {
      const temp = spTemp.x;
      const isDistilling = temp >= 78.3;

      // Thermometer thread height
      const thZ = 14.5 + ((temp - 50) / 45.0) * 7.5;
      const thCur = P(-22, 0, thZ);
      thermometer.setAttribute("y2", HL.r2(thCur[1]));
      thermometer.classList.toggle("hi", isDistilling);

      // Droplets
      dropDots.forEach((dot, idx) => {
        if (!isDistilling) {
          dot.setAttribute("opacity", 0);
          return;
        }
        dot.setAttribute("opacity", 1);
        const progress = (animTime * 1.2 + idx * 0.25) % 1.0;
        const curX = cStart[0] + progress * (cEnd[0] - cStart[0]);
        const curZ = cStart[2] + progress * (cEnd[2] - cStart[2]);
        const pt = P(curX, 0, curZ);
        dot.setAttribute("cx", HL.r2(pt[0]));
        dot.setAttribute("cy", HL.r2(pt[1]));
      });

      // Liquid in receiving flask
      const recLiqH = isDistilling ? 4.5 : 3.0;
      const liqPts = [];
      const liqR = recBaseR - ((recLiqH - 2.5) / 6.5) * (recBaseR - recNeckR);
      for (let a = 0; a < 20; a++) {
        const ang = (a * 2 * Math.PI) / 20;
        liqPts.push(P(18 + liqR * Math.cos(ang), liqR * Math.sin(ang), recLiqH));
      }
      recLiquid.setAttribute("d", HL.poly(liqPts));
      recLiquid.classList.toggle("hi", isDistilling);
      recBody.classList.toggle("hi", isDistilling);

      // Header Readout
      const tStr = HL.r2(temp);
      if (isDistilling) {
        read.textContent = `Chưng cất: t° = ${tStr}°C ≥ 78.3°C · [NGƯNG TỤ ETHANOL] Hơi C₂H₅OH ngưng tụ qua sinh hàn Liebig thành giọt vào bình hứng (.hi)`;
      } else {
        read.textContent = `Chưng cất: t° = ${tStr}°C < 78.3°C · Chưa đạt nhiệt độ sôi của ethanol (Chưa bay hơi ngưng tụ)`;
      }
    }

    function setTemperature(t) {
      spTemp.t = HL.clamp(t, 50, 95);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setTemperature(78.3);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setTemperature(50 + norm * 45.0);
    }

    const reg = HL.register(stage, dt => {
      animTime += dt;
      const moving = HL.stepS(spTemp, dt);
      draw();
      return moving || spTemp.x >= 77.5;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setTemperature(Number(v));
      },
      destroy: bag.dispose
    };
  }
};
