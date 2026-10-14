/*
 * 2. Alcohol Burner & Thermal Decomposition (Đèn Cồn & Ống Nghiệm Đun Nóng)
 * 2KMnO₄ ──t°──> K₂MnO₄ + MnO₂ + O₂↑; thermal activation threshold at t° ≥ 80°C.
 */

export default {
  id: "chemistry-burner",
  title: "2. Đèn Cồn & Ống Nghiệm (Burner & Heating)",
  concept: "Nhiệt phân hóa học: 2KMnO₄ ──t°──> K₂MnO₄ + MnO₂ + O₂↑ · Động học phản ứng theo nhiệt độ",
  means: "Di chuột đẩy ngọn lửa đèn cồn tiếp cận đáy ống nghiệm. Khi nhiệt độ vượt ngưỡng kích hoạt (t° ≥ 80°C), phản ứng nhiệt phân bùng nổ, bọt khí oxy sủi tăm mãnh liệt thoát ra miệng ống nghiệm.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 60, 100],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.55);
    HL.fit(C, [[-40, -16, 0], [40, 16, 38]], 200, 160);
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

    // 1. Lab Table Base & Retort Stand Rod + Clamp
    const [baseO, baseI] = HL.rings(-40, -15, 40, 15, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    const rodSol = HL.solid(svg);
    HL.put(rodSol, HL.prism(P, front, circAt(20, 0, 1.8, 16), circAt(20, 0, 1.35, 16), 2.5, 36.0));

    const clampSol = HL.solid(svg);
    const [clO, clI] = HL.rings(6, -1.3, 21.5, 1.3, 0.5, 0.2);
    HL.put(clampSol, HL.prism(P, front, clO, clI, 21.0, 23.0));

    // 2. Alcohol Burner at (-10, 0, 2.5)
    const bx = -10, by = 0;
    const burnerSol = HL.solid(svg);
    HL.put(burnerSol, HL.prism(P, front, circAt(bx, by, 7.6, 24), circAt(bx, by, 6.8, 24), 2.5, 7.8));

    const collarSol = HL.solid(svg);
    HL.put(collarSol, HL.prism(P, front, circAt(bx, by, 2.8, 16), circAt(bx, by, 2.1, 16), 7.8, 9.6));

    // 3. Flame Envelope & Inner Cone
    const flameOuter = HL.mk("path", { class: "sil hi" }, svg);
    const flameCore = HL.mk("path", { class: "nf lo" }, svg);

    // 4. Inclined Test Tube (45 deg)
    const cos45 = Math.SQRT1_2, sin45 = Math.SQRT1_2;
    const tubeR = 2.6;
    const bCenter = [-9.0, 0, 11.2];
    const mouthDist = 29.0;
    const mCenter = [bCenter[0] + mouthDist * cos45, 0, bCenter[2] + mouthDist * sin45];

    const tubeSol = HL.solid(svg);
    const tubeLiquid = HL.mk("path", { class: "lo" }, svg);
    const bubblesPath = HL.mk("path", { class: "nf lo" }, svg);
    const steamPath = HL.mk("path", { class: "nf dash" }, svg);

    function ringInclined(cx, cz, r, n = 20) {
      const pts = [];
      for (let a = 0; a < n; a++) {
        const ang = (a * 2 * Math.PI) / n;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        pts.push(P(cx - r * ca * sin45, r * sa, cz + r * ca * cos45));
      }
      return pts;
    }

    const bL = P(bCenter[0] - tubeR * sin45, 0, bCenter[2] + tubeR * cos45);
    const bR = P(bCenter[0] + tubeR * sin45, 0, bCenter[2] - tubeR * cos45);
    const mL = P(mCenter[0] - tubeR * sin45, 0, mCenter[2] + tubeR * cos45);
    const mR = P(mCenter[0] + tubeR * sin45, 0, mCenter[2] - tubeR * cos45);
    const bBot = P(bCenter[0] - tubeR * cos45 * 1.35, 0, bCenter[2] - tubeR * sin45 * 1.35);
    const mouthPts = ringInclined(mCenter[0], mCenter[2], tubeR, 20);
    const tubeD = `M ${HL.r2(bL[0])} ${HL.r2(bL[1])} Q ${HL.r2(bBot[0])} ${HL.r2(bBot[1])} ${HL.r2(bR[0])} ${HL.r2(bR[1])} L ${HL.r2(mR[0])} ${HL.r2(mR[1])} L ${HL.r2(mL[0])} ${HL.r2(mL[1])} Z`;
    HL.put(tubeSol, { sil: tubeD, crease: HL.poly(mouthPts) });

    // Front clamp finger gripping tube at s = 15.2
    const gripC = [bCenter[0] + 15.2 * cos45, 0, bCenter[2] + 15.2 * sin45];
    HL.mk("path", { class: "sil", d: HL.poly(ringInclined(gripC[0], gripC[2], tubeR + 0.45, 18)) }, svg);

    const spHeat = HL.spring(initialV != null ? initialV : 60, { k: 120, c: 15 });
    let lastKey = "";

    function draw() {
      const heat = spHeat.x;
      const key = `${HL.r2(heat)}`;
      if (key === lastKey) return;
      lastKey = key;

      const isActive = heat >= 80;
      const airRatio = heat / 100.0;

      // Deterministic flame envelope from airRatio + spring velocity
      const flameH = 3.8 + airRatio * 8.2;
      const flameW = 1.9 + airRatio * 2.8;
      const sway = Math.sin(heat * 0.18) * 0.45;
      const fBaseZ = 9.6, fTipZ = fBaseZ + flameH;

      const fP0 = P(bx - flameW, 0, fBaseZ);
      const fP1 = P(bx + flameW, 0, fBaseZ);
      const fTip = P(bx + sway, 0, fTipZ);
      const fMidL = P(bx - flameW * 1.12, 0, fBaseZ + flameH * 0.48);
      const fMidR = P(bx + flameW * 1.12, 0, fBaseZ + flameH * 0.48);
      flameOuter.setAttribute("d", `M ${HL.r2(fP0[0])} ${HL.r2(fP0[1])} Q ${HL.r2(fMidL[0])} ${HL.r2(fMidL[1])} ${HL.r2(fTip[0])} ${HL.r2(fTip[1])} Q ${HL.r2(fMidR[0])} ${HL.r2(fMidR[1])} ${HL.r2(fP1[0])} ${HL.r2(fP1[1])} Z`);

      const cP0 = P(bx - flameW * 0.5, 0, fBaseZ);
      const cP1 = P(bx + flameW * 0.5, 0, fBaseZ);
      const cTip = P(bx + sway * 0.5, 0, fBaseZ + flameH * 0.62);
      const cMidL = P(bx - flameW * 0.58, 0, fBaseZ + flameH * 0.3);
      const cMidR = P(bx + flameW * 0.58, 0, fBaseZ + flameH * 0.3);
      flameCore.setAttribute("d", `M ${HL.r2(cP0[0])} ${HL.r2(cP0[1])} Q ${HL.r2(cMidL[0])} ${HL.r2(cMidL[1])} ${HL.r2(cTip[0])} ${HL.r2(cTip[1])} Q ${HL.r2(cMidR[0])} ${HL.r2(cMidR[1])} ${HL.r2(cP1[0])} ${HL.r2(cP1[1])}`);

      // Reactant meniscus inside test tube
      const liqLen = 13.0 - airRatio * 1.2;
      const liqC = [bCenter[0] + liqLen * cos45, 0, bCenter[2] + liqLen * sin45];
      tubeLiquid.setAttribute("d", HL.poly(ringInclined(liqC[0], liqC[2], tubeR - 0.25, 18)));
      tubeLiquid.classList.toggle("hi", isActive);

      // Deterministic bubble rings & oxygen stream inside tube (never at 0,0)
      let bubD = "", stmD = "";
      const count = isActive ? 5 : 2;
      for (let b = 0; b < count; b++) {
        const prog = ((airRatio * 2.4 + b * 0.21) % 1.0);
        const sLen = 2.5 + prog * (liqLen - 3.2);
        const bxW = bCenter[0] + sLen * cos45;
        const bzW = bCenter[2] + sLen * sin45 + ((b % 2 === 0 ? 1 : -1) * 0.45);
        const rB = 0.55 + (b % 2) * 0.25;
        bubD += HL.poly(ringInclined(bxW, bzW, rB, 10));
      }
      for (let k = 0; k < 3; k++) {
        const s0 = liqLen + 2.0 + k * 4.5 + (airRatio * 2.0);
        const s1 = s0 + 2.6;
        const yOff = (k - 1) * 0.7;
        stmD += HL.seg(
          P(bCenter[0] + s0 * cos45, yOff, bCenter[2] + s0 * sin45),
          P(bCenter[0] + s1 * cos45, yOff, bCenter[2] + s1 * sin45)
        );
      }
      bubblesPath.setAttribute("d", bubD);
      bubblesPath.classList.toggle("hi", isActive);
      steamPath.setAttribute("d", stmD);

      const temp = Math.round(25 + airRatio * 75);
      read.textContent = isActive
        ? `t°=${temp}°C ≥80°C · O₂↑ [SÔI]`
        : `t°=${temp}°C · Đun nóng KMnO₄`;
    }

    function setHeat(h) {
      spHeat.t = HL.clamp(h, 0, 100);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setHeat(60.0); return; }
      const w = HL.unproj(C, pt[0], pt[1], 12.0);
      const norm = HL.clamp((w[0] - w[1] + 32) / 64, 0, 1);
      setHeat(norm * 100.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spHeat, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setHeat(Number(v)); }, destroy: bag.dispose, dispose: bag.dispose };
  }
};
