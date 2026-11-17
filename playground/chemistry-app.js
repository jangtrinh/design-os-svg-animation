/*
 * 5 Chemistry Figures Definitions (Hairline 2:1 Axonometric Standard)
 * Modularized Architecture - Auto-bundled
 */

if (typeof HL !== "undefined" && HL.inject) {
  HL.inject(document);
}

const CHEMISTRY_FIGURES = [
/*
 * 1. Acid-Base Titration & Buret (Chuẩn Độ Axit - Bazơ & Buret Chuẩn Xác)
 * HCl 0.10 M (20.0 mL) titrated with NaOH 0.10 M (0..25 mL); equivalence at 20.0 mL (pH 7.00).
 */

{
  id: "chemistry-titration",
  title: "1. Chuẩn Độ Axit - Bazơ (Acid-Base Titration)",
  concept: "Phản ứng HCl + NaOH → NaCl + H₂O · Bước nhảy pH tại 20.0 mL · Chỉ thị Phenolphthalein pH 8.2",
  means: "Di chuột điều chỉnh khóa buret xả dung dịch NaOH (0 đến 25 mL). Tại đúng 20.0 mL (điểm tương đương), bước nhảy pH kích hoạt phenolphtalein chuyển hồng tức thì.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 10, 25],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 4.35);
    HL.fit(C, [[-16, -16, 0], [18, 14, 42]], 204, 162);
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

    // 1. Heavy Cast-Iron Retort Stand Base & White Ceramic Tile
    const standSol = HL.solid(svg);
    const [stO, stI] = HL.rings(-14, -15, 16, 12, 2.0, 0.6);
    HL.put(standSol, HL.prism(P, front, stO, stI, 0, 2.4));

    const [tileO, tileI] = HL.rings(-8.5, -5.5, 8.5, 8.5, 1.0, 0.4);
    const tileSol = HL.solid(svg);
    HL.put(tileSol, HL.prism(P, front, tileO, tileI, 2.4, 3.0));

    // Vertical Stand Rod offset cleanly to screen-left (u = 5.5, v = -11.0 => v - u = -16.5)
    const rodX = 5.5, rodY = -11.0;
    const rodSol = HL.solid(svg);
    HL.put(rodSol, HL.prism(P, front, circAt(rodX, rodY, 1.15, 16), circAt(rodX, rodY, 0.8, 16), 2.4, 41.0));

    const bossSol = HL.solid(svg);
    const [bshO, bshI] = HL.rings(rodX - 1.6, rodY - 1.6, rodX + 1.6, rodY + 1.6, 0.5, 0.25);
    HL.put(bossSol, HL.prism(P, front, bshO, bshI, 26.2, 28.6));

    // Horizontal clamp beam reaching from stand rod (5.5, -11.0) to buret (0, 0)
    const arm0 = P(rodX, rodY, 27.4), arm1 = P(0, 0, 27.4);
    const armTop0 = P(rodX, rodY, 28.2), armTop1 = P(0, 0, 28.2);
    HL.mk("path", { class: "sil", d: HL.poly([arm0, arm1, armTop1, armTop0]) }, svg);

    // 2. 3D Erlenmeyer Flask (Conical Frustum Body + Liquid Hull + Cylindrical Neck)
    const fX = 0, fY = 1.5, fBaseR = 7.2, fNeckR = 2.4;
    const fBaseRing = circAt(fX, fY, fBaseR, 28);
    const fNeckRing = circAt(fX, fY, fNeckR, 24);
    const flaskSol = HL.solid(svg);
    const bPts = HL.ringAt(P, fBaseRing, 3.0);
    const sPts = HL.ringAt(P, fNeckRing, 9.6);
    HL.put(flaskSol, { sil: HL.poly(HL.hull([...bPts, ...sPts])), crease: HL.poly(bPts) + HL.poly(sPts) });

    const flaskLiquid = HL.mk("path", { class: "lo" }, svg);
    const flaskMeniscus = HL.mk("path", { class: "lo" }, svg);

    const flaskNeckSol = HL.solid(svg);
    HL.put(flaskNeckSol, HL.prism(P, front, fNeckRing, circAt(fX, fY, fNeckR - 0.4, 24), 9.6, 12.8));

    const lipSol = HL.solid(svg);
    HL.put(lipSol, HL.prism(P, front, circAt(fX, fY, fNeckR + 0.45, 24), fNeckRing, 12.4, 13.0));

    // 3. Glass Buret & Graduations
    const buretR = 1.75;
    const buretSol = HL.solid(svg);
    HL.put(buretSol, HL.prism(P, front, circAt(0, 0, buretR, 20), circAt(0, 0, buretR - 0.35, 20), 16.0, 40.8));

    let tickD = "";
    for (let gz = 18.5; gz <= 39.5; gz += 1.5) {
      const isMaj = Math.round((gz - 18.5) * 10) % 30 === 0;
      const len = isMaj ? 1.3 : 0.75;
      tickD += HL.seg(P(-buretR * 0.6, buretR * 0.8, gz), P((-buretR + len) * 0.6, (buretR - len) * 0.8, gz));
    }
    HL.mk("path", { class: "nf lo", d: tickD }, svg);

    // 4. Front Clamp Finger (drawn AFTER buret for proper Painter's Order occlusion)
    const fingerFrontSol = HL.solid(svg);
    const [ffO, ffI] = HL.rings(-2.2, -0.6, 2.2, 2.3, 0.6, 0.25);
    HL.put(fingerFrontSol, HL.prism(P, front, ffO, ffI, 26.6, 28.2));

    // 5. Stopcock Valve, PTFE Handle & Tip
    const scHousingSol = HL.solid(svg);
    HL.put(scHousingSol, HL.prism(P, front, circAt(0, 0, 2.3, 16), circAt(0, 0, 1.8, 16), 15.0, 16.3));
    const stopcockHandle = HL.mk("path", { class: "nf hi" }, svg);
    // the handle ends on a dot at each tip so neither end floats
    const handleTips = [0, 1].map(() => HL.mk("circle", { r: 1.6, class: "dot m" }, svg));

    const tipSol = HL.solid(svg);
    HL.put(tipSol, HL.prism(P, front, circAt(0, 0, 0.85, 14), circAt(0, 0, 0.5, 14), 13.4, 15.0));

    const buretMeniscus = HL.mk("path", { class: "lo" }, svg);
    const droplet = HL.mk("path", { class: "nf hi" }, svg);

    const spVol = HL.spring(initialV != null ? initialV : 10.0, { k: 120, c: 15 });
    let lastKey = "";

    function computePH(v) {
      if (v < 20.0) return Math.max(1.0, -Math.log10((2.0 - 0.1 * v) / (20.0 + v)));
      if (Math.abs(v - 20.0) < 1e-4) return 7.0;
      return Math.min(13.0, 14.0 + Math.log10((0.1 * (v - 20.0)) / (20.0 + v)));
    }

    function draw() {
      const vol = spVol.x;
      const vel = Math.abs(spVol.v);
      const key = `${HL.r2(vol)}:${HL.r2(vel)}`;
      if (key === lastKey) return;
      lastKey = key;

      const pH = computePH(vol);
      const isEndpoint = pH >= 8.2;

      const flow = HL.clamp(vel * 0.15 + (vol > 0 ? 0.35 : 0), 0, 1);
      const ang = flow * (Math.PI / 2);
      const scLen = 3.8;
      const tipA = P(-scLen * Math.cos(ang), 1.2, 15.65 + scLen * Math.sin(ang));
      const tipB = P(scLen * Math.cos(ang), 1.2, 15.65 - scLen * Math.sin(ang));
      stopcockHandle.setAttribute("d", HL.seg(tipA, tipB));
      HL.place(handleTips[0], tipA);
      HL.place(handleTips[1], tipB);

      const menZ = 39.2 - (vol / 25.0) * 19.5;
      buretMeniscus.setAttribute("d", HL.poly(HL.ringAt(P, circAt(0, 0, buretR - 0.25, 18), menZ)));

      const liqZ = 4.4 + (vol / 25.0) * 2.6;
      const liqR = fBaseR - 0.35 - ((liqZ - 3.0) / (9.6 - 3.0)) * (fBaseR - fNeckR);
      const lBase = HL.ringAt(P, circAt(fX, fY, fBaseR - 0.35, 22), 3.15);
      const lTop = HL.ringAt(P, circAt(fX, fY, liqR, 22), liqZ);
      flaskLiquid.setAttribute("d", HL.poly(HL.hull([...lBase, ...lTop])));
      flaskMeniscus.setAttribute("d", HL.poly(lTop));

      const dropPhase = (vel > 0.05 || (vol > 0.2 && vol < 24.8)) ? ((vol * 2.5) % 1) : 0;
      const dropZ = 13.2 - dropPhase * (13.2 - liqZ - 0.8);
      const dpTop = P(0, fY * 0.4, dropZ + 0.7);
      const dpBot = P(0, fY * 0.4, dropZ - 0.5);
      droplet.setAttribute("d", HL.seg(dpTop, dpBot));

      flaskLiquid.classList.toggle("hi", isEndpoint);
      flaskMeniscus.classList.toggle("hi", isEndpoint);
      read.textContent = isEndpoint
        ? `V=${vol.toFixed(1)}mL · pH ${pH.toFixed(2)} [HỒNG]`
        : `V=${vol.toFixed(1)}mL · pH ${pH.toFixed(2)} [AXIT]`;
    }

    function setVol(val) {
      spVol.t = HL.clamp(val, 0, 25);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setVol(10.0); return; }
      const w = HL.unproj(C, pt[0], pt[1], 15.0);
      const norm = HL.clamp((w[0] - w[1] + 22) / 44, 0, 1);
      setVol(norm * 25.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spVol, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setVol(Number(v)); }, destroy: bag.dispose, dispose: bag.dispose };
  }
},
/*
 * 2. Alcohol Burner & Thermal Decomposition (Đèn Cồn & Ống Nghiệm Đun Nóng)
 * 2KMnO₄ ──t°──> K₂MnO₄ + MnO₂ + O₂↑; thermal activation threshold at t° ≥ 80°C.
 */

{
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
},
/*
 * 3. Crystal Lattice Structure (Mạng Tinh Thể Lập Phương NaCl)
 * Face-Centered Cubic (FCC) rock-salt lattice: Na⁺ (r = 102 pm) & Cl⁻ (r = 181 pm), r₀ = 282 pm, CN = 6.
 */

{
  id: "chemistry-lattice",
  title: "3. Mạng Tinh Thể NaCl (Crystal Lattice)",
  concept: "Cấu trúc tinh thể ion: Cation Na⁺ & Anion Cl⁻ xen kẽ · Cân bằng thế năng Coulomb & Born",
  means: "Di chuột co dãn khoảng cách giữa các ion trong ô mạng lập phương. Khi đạt khoảng cách cân bằng bền (r = 282 pm), thế năng liên kết ion đạt cực tiểu, mạng tinh thể đạt trạng thái bền vững tuyệt đối.",
  rules: [1, 2, 4, 6, 9],
  range: [220, 282, 340],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.65);
    HL.fit(C, [[-32, -18, 0], [32, 18, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Showcase Pedestal Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-30, -16, 30, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    HL.mk("path", {
      class: "nf dash",
      d: HL.seg(P(-22, 0, 2.6), P(22, 0, 2.6)) + HL.seg(P(0, -12, 2.6), P(0, 12, 2.6))
    }, svg);

    // 2. 3x3x3 Cubic Lattice Centered at (0, 0, 20.5)
    const centerZ = 20.5;
    const outerBondPath = HL.mk("path", { class: "nf lo" }, svg);
    const octaCagePath = HL.mk("path", { class: "nf dash" }, svg);
    const focalBondPath = HL.mk("path", { class: "nf hi" }, svg);
    const ionGroup = HL.mk("g", {}, svg);

    const spR = HL.spring(initialV != null ? initialV : 282, { k: 130, c: 15 });
    let hoveredIdx = -1;
    let lastKey = "";

    // 27 Ion Spheres sorted back-to-front in 2:1 axonometric depth (ix + iy + iz)
    const ions = [];
    for (let ix = -1; ix <= 1; ix++) {
      for (let iy = -1; iy <= 1; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          const isCl = (Math.abs(ix + iy + iz) % 2) === 1;
          const radius = isCl ? 4.2 : 2.6;
          const isCenter = ix === 0 && iy === 0 && iz === 0;
          ions.push({ ix, iy, iz, isCl, isCenter, radius });
        }
      }
    }

    ions.sort((a, b) => (a.ix + a.iy + a.iz * 0.85) - (b.ix + b.iy + b.iz * 0.85));

    ions.forEach((ion, idx) => {
      ion.idx = idx;
      const g = HL.mk("g", {}, ionGroup);
      ion.disc = HL.mk("path", { class: ion.isCenter ? "sil hi" : (ion.isCl ? "sil" : "lo") }, g);
      ion.latRing = HL.mk("path", { class: "nf lo" }, g);
    });

    function draw() {
      const r = spR.x;
      const key = `${HL.r2(r)}:${hoveredIdx}`;
      if (key === lastKey) return;
      lastKey = key;

      const d = (r / 282.0) * 9.6;
      const isEquil = Math.abs(r - 282) < 4.5;

      // Build lattice bonds: separate 6 central octahedral coordination bonds from outer lattice bonds
      let outD = "", focD = "";
      for (let axis = 0; axis < 3; axis++) {
        for (let a = -1; a <= 1; a++) {
          for (let b = -1; b <= 1; b++) {
            for (let c = -1; c <= 0; c++) {
              const p0 = axis === 0 ? P(c * d, a * d, centerZ + b * d)
                : axis === 1 ? P(a * d, c * d, centerZ + b * d)
                : P(a * d, b * d, centerZ + c * d);
              const p1 = axis === 0 ? P((c + 1) * d, a * d, centerZ + b * d)
                : axis === 1 ? P(a * d, (c + 1) * d, centerZ + b * d)
                : P(a * d, b * d, centerZ + (c + 1) * d);
              if (a === 0 && b === 0) {
                focD += HL.seg(p0, p1);
              } else {
                outD += HL.seg(p0, p1);
              }
            }
          }
        }
      }
      outerBondPath.setAttribute("d", outD);
      focalBondPath.setAttribute("d", focD);

      // Coordination Octahedron Cage connecting the 6 nearest neighbors of (0,0,0)
      const oct = [
        P(d, 0, centerZ), P(0, d, centerZ), P(-d, 0, centerZ), P(0, -d, centerZ),
        P(0, 0, centerZ + d), P(0, 0, centerZ - d)
      ];
      let cageD = HL.poly([oct[0], oct[1], oct[2], oct[3]]);
      for (let k = 0; k < 4; k++) {
        cageD += HL.seg(oct[4], oct[k]) + HL.seg(oct[5], oct[k]);
      }
      octaCagePath.setAttribute("d", cageD);
      octaCagePath.classList.toggle("hi", isEquil);

      // Update 27 Ion Spheres (Cl⁻: sil + nf lo latitude ring; Na⁺: lo; central/hovered: hi)
      ions.forEach(ion => {
        const pt = P(ion.ix * d, ion.iy * d, centerZ + ion.iz * d);
        const rv = ion.radius;
        const discPts = [], latPts = [];
        for (let a = 0; a < 18; a++) {
          const ang = (a * 2 * Math.PI) / 18;
          const ca = Math.cos(ang), sa = Math.sin(ang);
          discPts.push([pt[0] + rv * ca, pt[1] + rv * sa]);
          latPts.push([pt[0] + rv * 0.72 * ca, pt[1] + rv * 0.34 * sa]);
        }
        ion.disc.setAttribute("d", HL.poly(discPts));
        ion.latRing.setAttribute("d", ion.isCl ? HL.poly(latPts) : HL.seg([pt[0] - 0.9, pt[1]], [pt[0] + 0.9, pt[1]]));

        const isFoc = ion.isCenter || ion.idx === hoveredIdx;
        ion.disc.classList.toggle("hi", isFoc);
      });

      const ratio = 282.0 / r;
      const uLat = Math.round(-898.3 * (ratio - (1 / 8) * Math.pow(ratio, 8)));
      read.textContent = isEquil
        ? `r=${Math.round(r)}pm · U=${uLat}kJ [BỀN]`
        : `r=${Math.round(r)}pm · U=${uLat}kJ/mol`;
    }

    function setDistance(val) {
      spR.t = HL.clamp(val, 220, 340);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        hoveredIdx = -1;
        setDistance(282.0);
        return;
      }
      const w = HL.unproj(C, pt[0], pt[1], centerZ);
      const norm = HL.clamp((w[0] - w[1] + 24) / 48, 0, 1);
      setDistance(220 + norm * 120.0);

      const d = (spR.x / 282.0) * 9.6;
      let best = -1, bestDist = 14;
      ions.forEach(ion => {
        const p = P(ion.ix * d, ion.iy * d, centerZ + ion.iz * d);
        const dist = Math.hypot(pt[0] - p[0], pt[1] - p[1]);
        if (dist < bestDist) { bestDist = dist; best = ion.idx; }
      });
      hoveredIdx = best;
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spR, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setDistance(Number(v)); }, destroy: bag.dispose, dispose: bag.dispose };
  }
},
/*
 * 4. Distillation Apparatus & Liebig Condenser (Bộ Chưng Cất Phân Đoạn & Ống Sinh Hàn Liebig)
 * Binary mixture C₂H₅OH (bp = 78.3°C) + H₂O (bp = 100.0°C); counter-current Liebig condensation.
 */

{
  id: "chemistry-distillation",
  title: "4. Chưng Cất & Sinh Hàn (Liebig Distillation)",
  concept: "Chưng cất phân đoạn hỗn hợp C₂H₅OH - H₂O · t_sôi = 78.3°C · Trao đổi nhiệt đối lưu",
  means: "Di chuột tăng nhiệt độ bếp đun từ 50°C đến 95°C. Khi vượt 78.3°C (điểm sôi của ethanol), hơi bốc lên qua ống sinh hàn Liebig ngưng tụ thành dòng giọt chảy vào bình tam giác.",
  rules: [1, 2, 4, 6, 9],
  range: [50, 78.3, 95],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 5.15);
    HL.fit(C, [[-22, -12, 0], [22, 12, 30]], 200, 162);
    const P = HL.proj(C), front = HL.facing(C);

    function circAt(cx, cy, R, n = 24) {
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        out.push({ u: cx + R * ca, v: cy + R * sa, nu: ca, nv: sa });
      }
      return out;
    }

    // 1. Left Retort Stand & Electric Heating Mantle at (13, -6)
    const bX = 13.0, bY = -6.0;
    const stand1Sol = HL.solid(svg);
    const [st1O, st1I] = HL.rings(bX - 7, bY - 7, bX + 8, bY + 7, 1.5, 0.5);
    HL.put(stand1Sol, HL.prism(P, front, st1O, st1I, 0, 2.2));
    const rod1Sol = HL.solid(svg);
    HL.put(rod1Sol, HL.prism(P, front, circAt(bX + 5.5, bY - 4.5, 0.9, 16), circAt(bX + 5.5, bY - 4.5, 0.6, 16), 2.2, 30.5));
    const clamp1Arm = HL.mk("path", { class: "sil nf", d: HL.seg(P(bX + 5.5, bY - 4.5, 21.0), P(bX, bY, 21.0)) }, svg);

    const mantleSol = HL.solid(svg);
    HL.put(mantleSol, HL.prism(P, front, circAt(bX, bY, 6.2, 24), circAt(bX, bY, 5.0, 24), 2.2, 8.2));
    const bulbP = P(bX, bY, 12.6), bulbR = 23.0;
    HL.mk("ellipse", { cx: HL.r2(bulbP[0]), cy: HL.r2(bulbP[1]), rx: bulbR, ry: bulbR, class: "sil" }, svg);
    const flaskLiquid = HL.mk("path", { class: "lo" }, svg);
    const flaskNeckSol = HL.solid(svg);
    HL.put(flaskNeckSol, HL.prism(P, front, circAt(bX, bY, 1.85, 18), circAt(bX, bY, 1.4, 18), 16.5, 24.5));
    HL.mk("path", { class: "nf hi", d: HL.seg(P(bX, bY, 28.5), P(bX, bY, 18.0)) }, svg);
    HL.mk("circle", { cx: HL.r2(P(bX, bY, 18.0)[0]), cy: HL.r2(P(bX, bY, 18.0)[1]), r: 1.8, class: "dot" }, svg);
    // the stem top ends on a cap dot instead of floating above the neck
    HL.mk("circle", { cx: HL.r2(P(bX, bY, 28.5)[0]), cy: HL.r2(P(bX, bY, 28.5)[1]), r: 1.4, class: "dot m" }, svg);

    // 2. Right Retort Stand & Receiving Erlenmeyer Flask at (-14, 7)
    const rX = -14.0, rY = 7.0;
    const stand2Sol = HL.solid(svg);
    const [st2O, st2I] = HL.rings(rX - 7, rY - 7, rX + 7, rY + 7, 1.5, 0.5);
    HL.put(stand2Sol, HL.prism(P, front, st2O, st2I, 0, 2.2));

    const rod2Sol = HL.solid(svg);
    HL.put(rod2Sol, HL.prism(P, front, circAt(2.0, -7.0, 0.9, 16), circAt(2.0, -7.0, 0.6, 16), 2.2, 24.0));
    HL.mk("path", { class: "sil nf", d: HL.seg(P(2.0, -7.0, 15.8), P(-1.0, 0.5, 15.8)) }, svg);

    // 3. 3D Liebig Condenser sloping from left-top (bX - 2, bY + 2, 21.0) to right-bottom (rX + 3, rY - 2, 10.5)
    const cA = [bX - 1.8, bY + 1.8, 21.0], cB = [rX + 3.2, rY - 2.2, 10.8];
    const pCA = P(...cA), pCB = P(...cB);
    const sDx = pCB[0] - pCA[0], sDy = pCB[1] - pCA[1];
    const sLen = Math.hypot(sDx, sDy) || 1;
    const nx = -sDy / sLen, ny = sDx / sLen;

    // Sidearm connector from flask neck to condenser entry
    HL.mk("path", { class: "nf sil", d: HL.seg(P(bX, bY, 21.5), pCA) }, svg);

    // Outer water cooling jacket (20% to 82% along condenser) with wide 3D screen radius
    const j0 = [pCA[0] + sDx * 0.14, pCA[1] + sDy * 0.14];
    const j1 = [pCA[0] + sDx * 0.84, pCA[1] + sDy * 0.84];
    const jW = 8.5;
    const jacketPoly = [
      [j0[0] + nx * jW, j0[1] + ny * jW],
      [j1[0] + nx * jW, j1[1] + ny * jW],
      [j1[0] - nx * jW, j1[1] - ny * jW],
      [j0[0] - nx * jW, j0[1] - ny * jW]
    ];
    HL.mk("path", { class: "sil", d: HL.poly(jacketPoly) }, svg);
    HL.mk("ellipse", { cx: HL.r2(j0[0]), cy: HL.r2(j0[1]), rx: 3.2, ry: jW, class: "lo" }, svg);
    HL.mk("ellipse", { cx: HL.r2(j1[0]), cy: HL.r2(j1[1]), rx: 3.2, ry: jW, class: "lo" }, svg);

    // Coolant inlet (bottom-right) & outlet (top-left) nozzles
    const nozIn = [j1[0] - nx * jW, j1[1] - ny * jW];
    const nozOut = [j0[0] + nx * jW, j0[1] + ny * jW];
    const nozInTip = [nozIn[0] - nx * 8, nozIn[1] - ny * 8];
    const nozOutTip = [nozOut[0] + nx * 8, nozOut[1] + ny * 8];
    HL.mk("path", { class: "nf hi", d: HL.seg(nozIn, nozInTip) + HL.seg(nozOut, nozOutTip) }, svg);
    // hose barb dots close both nozzle tips
    for (const tip of [nozInTip, nozOutTip]) {
      HL.mk("circle", { cx: HL.r2(tip[0]), cy: HL.r2(tip[1]), r: 1.4, class: "dot m" }, svg);
    }

    // Inner vapor tube & curved distillate adapter to receiving flask
    HL.mk("path", { class: "nf lo", d: HL.seg(pCA, pCB) }, svg);
    const adaptTipWorld = [rX, rY, 8.8];
    const pT = P(...adaptTipWorld);
    HL.mk("path", {
      class: "nf sil",
      d: `M ${HL.r2(pCB[0])} ${HL.r2(pCB[1])} Q ${HL.r2(pT[0])} ${HL.r2(pCB[1])} ${HL.r2(pT[0])} ${HL.r2(pT[1])}`
    }, svg);

    // 4. Receiving 3D Erlenmeyer Flask at (rX, rY, 2.2..8.6)
    const recBaseRing = circAt(rX, rY, 5.4, 24);
    const recNeckRing = circAt(rX, rY, 2.0, 20);
    const recFlaskSol = HL.solid(svg);
    const rbPts = HL.ringAt(P, recBaseRing, 2.2);
    const rnPts = HL.ringAt(P, recNeckRing, 8.4);
    HL.put(recFlaskSol, { sil: HL.poly(HL.hull([...rbPts, ...rnPts])), crease: HL.poly(rbPts) + HL.poly(rnPts) });

    const recLiquid = HL.mk("path", { class: "lo" }, svg);
    const vaporArrows = HL.mk("path", { class: "nf dash" }, svg);
    const dripPath = HL.mk("path", { class: "nf hi" }, svg);
    // each falling drip ends on a drop-head dot at its lower tip
    const dripHeads = [0, 1].map(() => HL.mk("circle", { r: 1.2, class: "dot m" }, svg));

    const spTemp = HL.spring(initialV != null ? initialV : 78.3, { k: 120, c: 15 });
    let lastKey = "";

    function draw() {
      const temp = spTemp.x;
      const key = `${HL.r2(temp)}`;
      if (key === lastKey) return;
      lastKey = key;

      const isBoiling = temp >= 78.3;
      const tempNorm = HL.clamp((temp - 50.0) / 45.0, 0, 1);
      const boilNorm = HL.clamp((temp - 78.0) / 17.0, 0, 1);

      const flaskLiqZ = 12.2 - boilNorm * 1.2;
      flaskLiquid.setAttribute("d", HL.poly(HL.ringAt(P, circAt(bX, bY, 4.6, 20), flaskLiqZ)));

      const recZ = 3.0 + boilNorm * 2.6;
      const recR = 5.0 - ((recZ - 2.2) / 6.2) * 3.0;
      recLiquid.setAttribute("d", HL.poly(HL.ringAt(P, circAt(rX, rY, recR, 20), recZ)));
      recLiquid.classList.toggle("hi", isBoiling);

      let vapD = "", drpD = "";
      const headAt = [];
      for (let k = 0; k < 4; k++) {
        const s = 0.1 + ((tempNorm * 1.6 + k * 0.2) % 0.75);
        const vx0 = pCA[0] + s * sDx, vy0 = pCA[1] + s * sDy;
        const vx1 = pCA[0] + (s + 0.08) * sDx, vy1 = pCA[1] + (s + 0.08) * sDy;
        vapD += HL.seg([vx0, vy0], [vx1, vy1]);
      }
      if (isBoiling) {
        for (let d = 0; d < 2; d++) {
          const frac = ((tempNorm * 3.0 + d * 0.5) % 1);
          const dz = adaptTipWorld[2] - frac * (adaptTipWorld[2] - recZ - 0.4);
          drpD += HL.seg(P(rX, rY, dz + 0.45), P(rX, rY, dz - 0.35));
          headAt.push(P(rX, rY, dz - 0.35));
        }
      } else {
        drpD = HL.seg(P(rX, rY, adaptTipWorld[2]), P(rX, rY, adaptTipWorld[2] - 0.5));
        headAt.push(P(rX, rY, adaptTipWorld[2] - 0.5));
      }
      vaporArrows.setAttribute("d", vapD);
      dripPath.setAttribute("d", drpD);
      dripHeads.forEach((head, i) => {
        head.setAttribute("display", headAt[i] ? "inline" : "none");
        if (headAt[i]) HL.place(head, headAt[i]);
      });
      clamp1Arm.classList.toggle("sil", true);

      const volRec = (boilNorm * 18.5).toFixed(1);
      read.textContent = isBoiling
        ? `T=${temp.toFixed(1)}°C · C₂H₅OH ${volRec}mL`
        : `T=${temp.toFixed(1)}°C < 78.3°C [ĐUN]`;
    }

    function setTemp(val) {
      spTemp.t = HL.clamp(val, 50, 95);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setTemp(78.3); return; }
      const w = HL.unproj(C, pt[0], pt[1], 14.0);
      const norm = HL.clamp((w[1] - w[0] + 28) / 56, 0, 1);
      setTemp(50 + norm * 45.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spTemp, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setTemp(Number(v)); }, destroy: bag.dispose, dispose: bag.dispose };
  }
},
/*
 * 5. Universal pH Scale & Porcelain Spot Plate (Thang Đo pH & Khay Giếng Sứ Thí Nghiệm)
 * pH = -log₁₀[H⁺] across 5 porcelain wells (pH 1.0, 3.0, 7.0, 9.5, 13.0); reactive only on contact.
 */

{
  id: "chemistry-ph-scale",
  title: "5. Thang Đo pH & Giấy Chỉ Thị (pH Scale & Spot Plate)",
  concept: "Định nghĩa pH = -log₁₀[H⁺] · Khay giếng sứ 5 mẫu · Chỉ kích hoạt khi giấy tiếp xúc dung dịch",
  means: "Di chuột ngang qua 5 giếng thử. Giấy quỳ tự động nhúng sâu ngập vào chất lỏng; CHỈ KHI tiếp xúc thật sự thì phản ứng màu và thang đo pH mới hiển thị.",
  rules: [1, 2, 4, 6, 9],
  range: [-24, 0, 24],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 4.35);
    HL.fit(C, [[-31, -15, 0], [31, 15, 27]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    function circRing(cx, cy, r, z, n = 22) {
      const pts = [];
      for (let a = 0; a < n; a++) {
        const rad = (a * 2 * Math.PI) / n;
        pts.push(P(cx + r * Math.cos(rad), cy + r * Math.sin(rad), z));
      }
      return HL.poly(pts);
    }

    // 1. Raised Calibrated pH Scale Stand Backboard (Y = -12 to -8, X = -30 to 30, Z = 0 to 10)
    const backSol = HL.solid(svg);
    const [bkO, bkI] = HL.rings(-30, -13, 30, -7, 1.5, 0.5);
    HL.put(backSol, HL.prism(P, front, bkO, bkI, 0, 9.5));

    const trackY = -10.0, trackZ = 9.6;
    let tickLoD = "", tickHiD = "";
    tickLoD += HL.seg(P(-28, trackY, trackZ), P(28, trackY, trackZ));
    for (let ph = 1; ph <= 14; ph++) {
      const tx = -28 + ((ph - 1) / 13) * 56;
      const isAnchor = ph === 1 || ph === 7 || ph === 14;
      const tLen = isAnchor ? 2.6 : 1.3;
      // every graduation hangs from the track rule so one end always lands on a stroke
      const seg = HL.seg(P(tx, trackY, trackZ), P(tx, trackY + tLen, trackZ));
      if (isAnchor) tickHiD += seg;
      else tickLoD += seg;
    }
    HL.mk("path", { class: "nf lo", d: tickLoD }, svg);
    HL.mk("path", { class: "nf hi", d: tickHiD }, svg);

    const needleSol = HL.solid(svg);

    // 2. White Porcelain Spot Plate (X = -30 to 30, Y = -5 to 14, Z = 0 to 5.0)
    const plateSol = HL.solid(svg);
    const [plO, plI] = HL.rings(-30, -5, 30, 14, 2.5, 0.7);
    HL.put(plateSol, HL.prism(P, front, plO, plI, 0, 5.0));

    const SAMPLES = [
      { short: "HCl [ĐỎ]", ph: 1.0, x: -22 },
      { short: "Citric [CAM]", ph: 3.0, x: -11 },
      { short: "H₂O [TÍM]", ph: 7.0, x: 0 },
      { short: "NaHCO₃ [XANH]", ph: 9.5, x: 11 },
      { short: "NaOH [LAM]", ph: 13.0, x: 22 }
    ];

    const wellR = 3.8, wellY = 4.5;
    const wellLiquids = [];

    SAMPLES.forEach(s => {
      HL.mk("path", { class: "nf lo", d: circRing(s.x, wellY, wellR, 5.05) }, svg);
      HL.mk("path", { class: "lo", d: circRing(s.x, wellY, wellR - 0.55, 5.02) }, svg);
      const liq = HL.mk("path", { class: "lo", d: circRing(s.x, wellY, wellR - 0.9, 3.4) }, svg);
      wellLiquids.push(liq);
    });

    // 3. Stainless Steel Tweezers & Universal Indicator Test Strip
    const paperDryBody = HL.mk("polygon", { class: "lo" }, svg);
    const paperTip = HL.mk("polygon", { class: "sil" }, svg);
    const tweezerArms = HL.mk("path", { class: "nf sil" }, svg);
    const tweezerPivot = HL.mk("path", { class: "sil" }, svg);

    const startX = initialV != null ? initialV : 0;
    const spX = HL.spring(startX, { k: 130, c: 15 });
    const spDip = HL.spring(1.0, { k: 160, c: 15 });
    let lastKey = "";

    function nearestSample(x) {
      let bestIdx = 0, minDis = 999;
      SAMPLES.forEach((s, idx) => {
        const dis = Math.abs(x - s.x);
        if (dis < minDis) { minDis = dis; bestIdx = idx; }
      });
      return { idx: bestIdx, sample: SAMPLES[bestIdx], dis: minDis };
    }

    function updateDipTarget(xTarget) {
      const { dis } = nearestSample(xTarget);
      spDip.t = dis <= 2.4 ? 1.0 : 0.0;
    }
    updateDipTarget(startX);
    spDip.x = spDip.t;

    function draw() {
      const curX = spX.x, dipVal = spDip.x;
      const key = `${HL.r2(curX)}:${HL.r2(dipVal)}`;
      if (key === lastKey) return;
      lastKey = key;

      const { idx: closestIdx, sample: nearest, dis: minDis } = nearestSample(curX);
      const isOverWell = minDis <= 2.4;

      const tipZ = 9.6 - dipVal * 6.8;
      const topZ = tipZ + 11.5;
      const subZ = tipZ + 2.6;
      const isSubmerged = isOverWell && tipZ <= 3.5;

      const pW = 1.55;
      const pTopL = P(curX - pW, wellY, topZ);
      const pTopR = P(curX + pW, wellY, topZ);
      const pMidL = P(curX - pW, wellY, subZ);
      const pMidR = P(curX + pW, wellY, subZ);
      const pBotL = P(curX - pW, wellY, tipZ);
      const pBotR = P(curX + pW, wellY, tipZ);

      paperDryBody.setAttribute("points", `${HL.r2(pTopL[0])},${HL.r2(pTopL[1])} ${HL.r2(pTopR[0])},${HL.r2(pTopR[1])} ${HL.r2(pMidR[0])},${HL.r2(pMidR[1])} ${HL.r2(pMidL[0])},${HL.r2(pMidL[1])}`);
      paperTip.setAttribute("points", `${HL.r2(pMidL[0])},${HL.r2(pMidL[1])} ${HL.r2(pMidR[0])},${HL.r2(pMidR[1])} ${HL.r2(pBotR[0])},${HL.r2(pBotR[1])} ${HL.r2(pBotL[0])},${HL.r2(pBotL[1])}`);

      const twPiv = P(curX, wellY, topZ + 5.8);
      tweezerArms.setAttribute("d", HL.seg(twPiv, pTopL) + HL.seg(twPiv, pTopR));
      tweezerPivot.setAttribute("d", circRing(curX, wellY, 1.4, topZ + 5.8, 14));

      // Sliding Indicator Needle on Calibrated pH Track
      const targetPH = isSubmerged ? nearest.ph : 7.0;
      const nx = -28 + ((targetPH - 1) / 13) * 56;
      const [ndO, ndI] = HL.rings(nx - 1.8, trackY - 2.2, nx + 1.8, trackY + 1.6, 0.5, 0.25);
      HL.put(needleSol, HL.prism(P, front, ndO, ndI, trackZ, trackZ + 2.4));

      wellLiquids.forEach((liq, idx) => liq.classList.toggle("hi", isSubmerged && idx === closestIdx));
      paperTip.classList.toggle("hi", isSubmerged);
      needleSol.sil.classList.toggle("hi", isSubmerged);

      read.textContent = isSubmerged
        ? `pH ${nearest.ph.toFixed(1)} · ${nearest.short}`
        : `Z=${tipZ.toFixed(1)} · Chưa nhúng`;
    }

    function setX(val) {
      const clamped = HL.clamp(val, -24, 24);
      spX.t = clamped;
      updateDipTarget(clamped);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setX(0); return; }
      const w = HL.unproj(C, pt[0], pt[1], 6.0);
      const norm = HL.clamp((w[0] - w[1] + 28) / 56, 0, 1);
      setX(-24 + norm * 48.0);
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(spX, dt);
      const m2 = HL.stepS(spDip, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setX(Number(v)); }, destroy: bag.dispose, dispose: bag.dispose };
  }
},
];

// App Controller & View Logic for Chemistry Figures Suite (Hairline 2:1 Axonometric Standard)
(() => {
  const RULES = ["hit", "order", "reach", "accent", "rest", "honesty", "cost", "clock", "radius", "quiet"];
  const $ = id => document.getElementById(id);
  const navTabs = $("nav-tabs");
  const stage = $("stage");
  const slider = $("intensity");
  const valOut = $("value");
  const nameEl = $("name");
  const readEl = $("read");
  const meansEl = $("means");
  const rulesEl = $("rules");
  const btnPrev = $("btn-prev");
  const btnNext = $("btn-next");

  let currentIndex = 0;
  let currentHandle = null;

  const origSetPC = Element.prototype.setPointerCapture;
  const origRelPC = Element.prototype.releasePointerCapture;
  if (origSetPC) {
    Element.prototype.setPointerCapture = function (id) {
      try { return origSetPC.call(this, id); } catch {}
    };
  }
  if (origRelPC) {
    Element.prototype.releasePointerCapture = function (id) {
      try { return origRelPC.call(this, id); } catch {}
    };
  }

  HL.cam = HL.Cam;
  HL._order = CHEMISTRY_FIGURES.map(f => f.id);
  HL.figures = Object.fromEntries(CHEMISTRY_FIGURES.map(f => [f.id, f]));

  let picker = $("picker");
  if (!picker) {
    picker = document.createElement("div");
    picker.id = "picker";
    picker.hidden = true;
    document.body.appendChild(picker);
    CHEMISTRY_FIGURES.forEach((fig, idx) => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.onclick = () => switchTo(idx);
      picker.appendChild(chip);
    });
  }

  let scrub = $("scrub");
  if (!scrub) {
    scrub = document.createElement("input");
    scrub.id = "scrub";
    scrub.type = "range";
    scrub.min = "0";
    scrub.max = "1";
    scrub.step = "0.01";
    scrub.value = "0.5";
    scrub.hidden = true;
    document.body.appendChild(scrub);
    scrub.addEventListener("input", () => {
      slider.value = scrub.value;
      if (slider.oninput) slider.oninput();
    });
  }

  Object.defineProperty(stage, "children", {
    get() {
      const svg = stage.querySelector("svg");
      return svg ? svg.querySelectorAll("path, polygon, ellipse, circle, line") : [];
    }
  });

  const readBridge = {
    get textContent() { return readEl.textContent; },
    set textContent(v) {
      const s = String(v || "rest").trim();
      readEl.textContent = s.length > 28 ? s.slice(0, 28) : s;
    }
  };

  function renderTabs() {
    navTabs.innerHTML = "";
    CHEMISTRY_FIGURES.forEach((fig, idx) => {
      const btn = document.createElement("button");
      btn.className = "nav-btn" + (idx === currentIndex ? " active" : "");
      btn.textContent = (idx + 1) + ". " + fig.id.replace(/^chemistry-/, "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", idx === currentIndex ? "true" : "false");
      btn.onclick = () => switchTo(idx);
      navTabs.appendChild(btn);
    });
  }

  function switchTo(idx) {
    currentIndex = (idx + CHEMISTRY_FIGURES.length) % CHEMISTRY_FIGURES.length;
    renderTabs();

    if (currentHandle) {
      currentHandle.destroy();
      currentHandle = null;
    }
    stage.replaceChildren();

    const fig = CHEMISTRY_FIGURES[currentIndex];
    document.title = "Hairline · " + fig.id;
    stage.setAttribute("data-hairline", fig.id);
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", fig.means);
    nameEl.textContent = fig.id;
    meansEl.textContent = fig.means;
    rulesEl.textContent = (fig.rules || []).map(n => String(n).padStart(2, "0") + " " + RULES[n - 1]).join(" · ");

    slider.value = "0.5";
    scrub.value = "0.5";
    const [lo, mid, hi] = fig.range;
    const at = (i) => Math.round((i <= 0.5 ? lo + (i / 0.5) * (mid - lo) : mid + ((i - 0.5) / 0.5) * (hi - mid)) * 1000) / 1000;
    valOut.textContent = String(at(0.5));

    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    readEl.textContent = "rest";
    currentHandle = fig.mount({ stage, svg, read: readBridge }, at(0.5));

    slider.oninput = () => {
      const v = at(Number(slider.value));
      valOut.textContent = String(v);
      if (currentHandle && currentHandle.set) currentHandle.set(v);
    };
  }

  if (btnPrev) btnPrev.onclick = () => switchTo(currentIndex - 1);
  if (btnNext) btnNext.onclick = () => switchTo(currentIndex + 1);

  window.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "ArrowLeft") {
      switchTo(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      switchTo(currentIndex + 1);
    } else {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= CHEMISTRY_FIGURES.length) {
        switchTo(num - 1);
      }
    }
  });

  window.addEventListener("error", e => {
    const err = $("error");
    if (err) {
      err.hidden = false;
      err.textContent = String((e.error && e.error.message) || e.message);
    }
  });

  renderTabs();
  switchTo(0);
})();
