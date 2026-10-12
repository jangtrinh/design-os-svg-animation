/*
 * 5. Knife Switch & Electric Circuit (Cầu Dao & Mạch Điện Đèn Sáng)
 * Physical Concept: Mạch điện đóng / ngắt (Closed vs Open Circuit):
 *   - Định luật Ohm: I = U / R.
 *   - Khi cầu dao mở (α > 2°): Mạch hở tại khe ngàm, điện trở vô cùng lớn (R → ∞), I = 0.00 A, đèn tắt.
 *   - Khi cầu dao sập đóng (α = 0°): Lưỡi dao đồng tiếp xúc khít giữa 2 ngàm đồng đàn hồi, mạch kín hoàn toàn,
 *     dòng điện I = 1.50 A chạy qua, dây tóc bóng đèn rực sáng (P = I²·R = 9.0 W).
 * Geometry (Hero Specimen Precision):
 *   - Bệ gỗ/sứ cách điện có 4 bu-lông đồng ở 4 góc.
 *   - Nguồn pin đôi 6V với 2 cọc đấu dây núm khía (+ và -).
 *   - Trụ bản lề ngàm U bằng đồng thau với trục chốt xoay ngang.
 *   - Lưỡi dao đồng dày dặn, chuôi cầm tiện gỗ cách điện có đai đồng.
 *   - Ngàm kẹp đồng đôi (twin brass jaws) vát mép mở ở đầu đón lưỡi dao.
 *   - Đui đèn sứ có ren kim loại đặt đúng vị trí bằng circAt.
 *   - Bóng đèn thủy tinh 3D dạng cầu thật với dây tóc vonfram và tia sáng tỏa nhiệt.
 * Meaningful Kinematics: Di chuột hạ cán dao. Khi góc < 5°, lực đàn hồi hút sập dao vào ngàm (snap-action).
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
    const C = HL.Cam(45, 0.5, 2.5);
    HL.fit(C, [[-40, -14, 0], [40, 14, 25]], 200, 160);
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

    // 1. Mahogany / Ceramic Insulating Switchboard Base (Z: 0 to 2.2)
    const baseSol = HL.solid(svg);
    const [baseO, baseI] = HL.rings(-42, -15, 42, 15, 2.2, 0.6);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.2));

    // 4 Corner Brass Mounting Screws
    const cornerPts = [
      [-39, -12], [39, -12],
      [-39, 12], [39, 12]
    ];
    for (const [cx, cy] of cornerPts) {
      const pt = P(cx, cy, 2.25);
      HL.mk("circle", {
        cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 1.8,
        class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.0
      }, svg);
      HL.mk("circle", {
        cx: HL.r2(pt[0]), cy: HL.r2(pt[1]), r: 0.6,
        class: "dot"
      }, svg);
    }

    // 2. Battery Power Block at X = -32, Y = 0 (Z: 2.2 to 8.5)
    const batSol = HL.solid(svg);
    const [batO, batI] = HL.rings(-38, -6, -26, 6, 1.2, 0.4);
    HL.put(batSol, HL.prism(P, front, batO, batI, 2.2, 8.5));

    // Battery terminals (+ and -)
    const postPlus = P(-35, 2.5, 8.6);
    const postMinus = P(-35, -2.5, 8.6);
    HL.mk("circle", {
      cx: HL.r2(postPlus[0]), cy: HL.r2(postPlus[1]), r: 1.6,
      class: "hi", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.1
    }, svg);
    HL.mk("circle", {
      cx: HL.r2(postMinus[0]), cy: HL.r2(postMinus[1]), r: 1.6,
      class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.1
    }, svg);

    // Terminal sign markers (+ and -)
    HL.mk("line", {
      x1: HL.r2(postPlus[0] - 1.2), y1: HL.r2(postPlus[1]),
      x2: HL.r2(postPlus[0] + 1.2), y2: HL.r2(postPlus[1]),
      class: "hi", "stroke-width": 1.0
    }, svg);
    HL.mk("line", {
      x1: HL.r2(postPlus[0]), y1: HL.r2(postPlus[1] - 1.2),
      x2: HL.r2(postPlus[0]), y2: HL.r2(postPlus[1] + 1.2),
      class: "hi", "stroke-width": 1.0
    }, svg);
    HL.mk("line", {
      x1: HL.r2(postMinus[0] - 1.2), y1: HL.r2(postMinus[1]),
      x2: HL.r2(postMinus[0] + 1.2), y2: HL.r2(postMinus[1]),
      class: "lo", "stroke-width": 1.0
    }, svg);

    // 3. Stamped Copper Circuit Traces along Base (Z = 2.3)
    const wireGroup = HL.mk("g", {}, svg);
    const trace1 = HL.mk("path", { class: "lo", "stroke-width": 1.6, fill: "none" }, wireGroup);
    const trace2 = HL.mk("path", { class: "lo", "stroke-width": 1.6, fill: "none" }, wireGroup);
    const traceReturn = HL.mk("path", { class: "lo", "stroke-width": 1.6, fill: "none" }, wireGroup);

    const ptPlus = P(-35, 2.5, 2.3);
    const ptHingeBase = P(-14, 0, 2.3);
    const ptJawBase = P(10, 0, 2.3);
    const ptLampIn = P(24, 0, 2.3);
    const ptLampOut = P(28, -4.5, 2.3);
    const ptCorner = P(-35, -10, 2.3);
    const ptMinus = P(-35, -2.5, 2.3);

    trace1.setAttribute("d", `M ${HL.r2(ptPlus[0])} ${HL.r2(ptPlus[1])} L ${HL.r2(ptHingeBase[0])} ${HL.r2(ptHingeBase[1])}`);
    trace2.setAttribute("d", `M ${HL.r2(ptJawBase[0])} ${HL.r2(ptJawBase[1])} L ${HL.r2(ptLampIn[0])} ${HL.r2(ptLampIn[1])}`);
    traceReturn.setAttribute("d", `M ${HL.r2(ptLampOut[0])} ${HL.r2(ptLampOut[1])} L ${HL.r2(ptCorner[0])} ${HL.r2(ptCorner[1])} L ${HL.r2(ptMinus[0])} ${HL.r2(ptMinus[1])}`);

    // 4. Brass Switch Trunnion Hinge Post at X = -14
    const hingeSol = HL.solid(svg);
    const [hO, hI] = HL.rings(-16.5, -3.2, -11.5, 3.2, 0.8, 0.3);
    HL.put(hingeSol, HL.prism(P, front, hO, hI, 2.2, 7.5));

    // Horizontal pivot pin through the trunnion
    const pinL = P(-14, -3.6, 6.8);
    const pinR = P(-14, 3.6, 6.8);
    HL.mk("line", {
      x1: HL.r2(pinL[0]), y1: HL.r2(pinL[1]),
      x2: HL.r2(pinR[0]), y2: HL.r2(pinR[1]),
      class: "hi", "stroke-width": 2.2, stroke: "var(--hl-edge)"
    }, svg);

    // 5. Twin Spring-Brass Contact Jaws at X = 10
    // Two vertical parallel leaves with flared lead-in mouths
    const jaw1Sol = HL.solid(svg);
    const jaw2Sol = HL.solid(svg);
    const [j1O, j1I] = HL.rings(8.5, -3.0, 11.5, -0.6, 0.4, 0.2);
    const [j2O, j2I] = HL.rings(8.5, 0.6, 11.5, 3.0, 0.4, 0.2);
    HL.put(jaw1Sol, HL.prism(P, front, j1O, j1I, 2.2, 8.8));
    HL.put(jaw2Sol, HL.prism(P, front, j2O, j2I, 2.2, 8.8));

    // Flared lips at top of jaws (Z = 8.8 to 9.8)
    const lip1A = P(8.5, -3.5, 9.8), lip1B = P(11.5, -3.5, 9.8);
    const lip2A = P(8.5, 3.5, 9.8), lip2B = P(11.5, 3.5, 9.8);
    const j1TopA = P(8.5, -0.6, 8.8), j1TopB = P(11.5, -0.6, 8.8);
    const j2TopA = P(8.5, 0.6, 8.8), j2TopB = P(11.5, 0.6, 8.8);
    HL.mk("path", { d: HL.poly([j1TopA, j1TopB, lip1B, lip1A]), class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, svg);
    HL.mk("path", { d: HL.poly([j2TopA, j2TopB, lip2B, lip2A]), class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, svg);

    // 6. Porcelain Lamp Socket at X = 28, Y = 0 (Z: 2.2 to 7.0)
    const socketSol = HL.solid(svg);
    const sockO = circAt(28, 0, 4.8, 24);
    const sockI = circAt(28, 0, 4.2, 24);
    HL.put(socketSol, HL.prism(P, front, sockO, sockI, 2.2, 5.4));

    // Threaded brass collar (Z: 5.4 to 7.2)
    const collarSol = HL.solid(svg);
    const collO = circAt(28, 0, 3.8, 20);
    const collI = circAt(28, 0, 3.3, 20);
    HL.put(collarSol, HL.prism(P, front, collO, collI, 5.4, 7.2));

    // 7. Lightbulb Assembly at X = 28, Y = 0
    const bulbCenter = [28, 0, 13.0];
    const bulbR = 5.2;
    const bulbGroup = HL.mk("g", {}, svg);

    // Glowing halo behind glass when circuit active
    const glowHalo = HL.mk("circle", {
      cx: HL.r2(P(bulbCenter[0], bulbCenter[1], bulbCenter[2])[0]),
      cy: HL.r2(P(bulbCenter[0], bulbCenter[1], bulbCenter[2])[1]),
      r: bulbR * C.S * 1.5,
      class: "hi", fill: "var(--hl-plate)", opacity: 0, "stroke-width": 0
    }, bulbGroup);

    // Glass bulb spherical contour
    const pCenter = P(bulbCenter[0], bulbCenter[1], bulbCenter[2]);
    const bulbGlass = HL.mk("circle", {
      cx: HL.r2(pCenter[0]), cy: HL.r2(pCenter[1]),
      r: bulbR * C.S,
      class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4
    }, bulbGroup);

    // Glass reflection curve
    const bulbReflect = HL.mk("path", {
      class: "lo", fill: "none", "stroke-width": 0.8
    }, bulbGroup);
    const refR = bulbR * C.S * 0.75;
    bulbReflect.setAttribute("d", `M ${HL.r2(pCenter[0] - refR * 0.7)} ${HL.r2(pCenter[1] - refR * 0.5)} A ${HL.r2(refR)} ${HL.r2(refR)} 0 0 1 ${HL.r2(pCenter[0] - refR * 0.2)} ${HL.r2(pCenter[1] - refR * 0.85)}`);

    // Exhaust pip at top of bulb
    HL.mk("circle", {
      cx: HL.r2(P(bulbCenter[0], bulbCenter[1], bulbCenter[2] + bulbR)[0]),
      cy: HL.r2(P(bulbCenter[0], bulbCenter[1], bulbCenter[2] + bulbR)[1]),
      r: 1.0, class: "dot"
    }, bulbGroup);

    // Internal tungsten filament loop & lead wires
    const leadGroup = HL.mk("g", {}, bulbGroup);
    const stemTop = P(28, 0, 8.2);
    const fLeft = P(26.6, 0, 11.2);
    const fRight = P(29.4, 0, 11.2);
    const fPeak = P(28.0, 0, 13.8);

    // Support wires from stem
    HL.mk("line", { x1: HL.r2(stemTop[0] - 1), y1: HL.r2(stemTop[1]), x2: HL.r2(fLeft[0]), y2: HL.r2(fLeft[1]), class: "lo", "stroke-width": 1.0 }, leadGroup);
    HL.mk("line", { x1: HL.r2(stemTop[0] + 1), y1: HL.r2(stemTop[1]), x2: HL.r2(fRight[0]), y2: HL.r2(fRight[1]), class: "lo", "stroke-width": 1.0 }, leadGroup);

    // Hairpin coiled filament
    const filament = HL.mk("path", { class: "lo", "stroke-width": 1.5, fill: "none" }, leadGroup);
    filament.setAttribute("d", `M ${HL.r2(fLeft[0])} ${HL.r2(fLeft[1])} Q ${HL.r2(fPeak[0])} ${HL.r2(fPeak[1])} ${HL.r2(fRight[0])} ${HL.r2(fRight[1])}`);

    // Radial ray bursts when bulb is on
    const glowRays = HL.mk("g", { class: "hi", opacity: 0 }, bulbGroup);
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg * Math.PI) / 180;
      const ray1 = P(bulbCenter[0] + (bulbR + 2.0) * Math.cos(rad), (bulbR + 2.0) * Math.sin(rad) * 0.4, bulbCenter[2] + (bulbR + 2.0) * Math.sin(rad));
      const ray2 = P(bulbCenter[0] + (bulbR + 5.5) * Math.cos(rad), (bulbR + 5.5) * Math.sin(rad) * 0.4, bulbCenter[2] + (bulbR + 5.5) * Math.sin(rad));
      HL.mk("line", {
        x1: HL.r2(ray1[0]), y1: HL.r2(ray1[1]),
        x2: HL.r2(ray2[0]), y2: HL.r2(ray2[1]),
        "stroke-width": 1.2
      }, glowRays);
    }

    // 8. Knife Switch Blade & Ergonomic Handle (Pivoting at (-14, 0, 6.8))
    const pivotX = -14.0, pivotZ = 6.8;
    const bladeLength = 24.5; // Distance to jaw contact (X = 10)
    const bladeH = 2.4;
    const bladeThick = 0.7;

    const bladeGroup = HL.mk("g", {}, svg);
    const bladeSide = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, bladeGroup);
    const bladeTop = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, bladeGroup);
    const bladeCrease = HL.mk("path", { class: "lo", fill: "none", "stroke-width": 0.8 }, bladeGroup);

    // Turned wooden handle with brass ferrule
    const handleGroup = HL.mk("g", {}, svg);
    const handleSol = HL.solid(handleGroup);

    // Kinematics Springs
    const initialDeg = initialV != null ? initialV : 32;
    const spTheta = HL.spring((initialDeg * Math.PI) / 180, { k: 150, c: 14 });

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
      const isClosed = thetaDeg <= 2.0;

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
      // Crease lines
      bladeCrease.setAttribute("d", `M ${HL.r2(b011[0])} ${HL.r2(b011[1])} L ${HL.r2(b111[0])} ${HL.r2(b111[1])} M ${HL.r2(b111[0])} ${HL.r2(b111[1])} L ${HL.r2(b110[0])} ${HL.r2(b110[1])}`);

      // B. Insulated Handle Grip (from u = 23.5 to 33.5)
      // Lathe-turned profile with brass collar
      const h0 = P(...transformBladePt(23.5, -2.2, bladeH / 2 - 1.2, theta));
      const h1 = P(...transformBladePt(33.5, -2.2, bladeH / 2 - 1.2, theta));
      const h2 = P(...transformBladePt(33.5, 2.2, bladeH / 2 - 1.2, theta));
      const h3 = P(...transformBladePt(23.5, 2.2, bladeH / 2 - 1.2, theta));

      const h0T = P(...transformBladePt(23.5, -2.2, bladeH / 2 + 2.6, theta));
      const h1T = P(...transformBladePt(33.5, -2.2, bladeH / 2 + 2.6, theta));
      const h2T = P(...transformBladePt(33.5, 2.2, bladeH / 2 + 2.6, theta));
      const h3T = P(...transformBladePt(23.5, 2.2, bladeH / 2 + 2.6, theta));

      let hSil = "";
      hSil += HL.poly([h3, h2, h2T, h3T]);
      hSil += HL.poly([h2, h1, h1T, h2T]);
      hSil += HL.poly([h0T, h1T, h2T, h3T]);
      HL.put(handleSol, { sil: hSil, crease: `M ${HL.r2(h3T[0])} ${HL.r2(h3T[1])} L ${HL.r2(h2T[0])} ${HL.r2(h2T[1])}` });

      // C. Circuit Activation & Electrical State
      bladeSide.classList.toggle("hi", isClosed);
      jaw1Sol.sil.classList.toggle("hi", isClosed);
      jaw2Sol.sil.classList.toggle("hi", isClosed);
      trace1.classList.toggle("hi", isClosed);
      trace2.classList.toggle("hi", isClosed);
      traceReturn.classList.toggle("hi", isClosed);
      filament.classList.toggle("hi", isClosed);
      filament.setAttribute("stroke-width", isClosed ? "2.2" : "1.2");
      glowRays.setAttribute("opacity", isClosed ? 1 : 0);
      glowHalo.setAttribute("opacity", isClosed ? 0.35 : 0);

      // D. Header Info & Physics
      const degStr = HL.r2(thetaDeg);
      if (isClosed) {
        read.textContent = `Cầu dao: [ĐÓNG MẠCH - KÍN] (α = 0°) · U = 6.0 V · I = 1.50 A · Công suất P = 9.00 W ⇒ Dòng điện chạy qua, bóng đèn rực sáng!`;
      } else {
        read.textContent = `Cầu dao: [NGẮT MẠCH - HỞ] (α = ${degStr}°) · Khe hở ngàm R → ∞ · Dòng điện I = 0.00 A · P = 0 W ⇒ Đèn tắt`;
      }
    }

    function setSwitch(deg) {
      const clamped = HL.clamp(deg, 0, 45);
      // Realistic knife-switch snap: if angle < 5 deg, magnetic/spring snaps to 0
      if (clamped < 5.0) {
        spTheta.t = 0.0;
      } else {
        spTheta.t = (clamped * Math.PI) / 180;
      }
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setSwitch(32.0); // Default open at 32 deg
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
