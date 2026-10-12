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

export default {
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
};
