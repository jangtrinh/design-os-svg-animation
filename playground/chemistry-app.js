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
 * Chemical Concept: Đường cong chuẩn độ axit mạnh - bazơ mạnh (HCl 0.1 M + NaOH 0.1 M):
 *   - Bình tam giác: V_HCl = 20.0 mL, n_HCl = 2.00 mmol.
 *   - Buret: Dung dịch chuẩn NaOH 0.10 M.
 *   - Phương trình nồng độ trước điểm tương đương (V < 20.0 mL):
 *     [H⁺] = (2.00 - 0.10·V) / (20.0 + V)  ==> pH = -log10[H⁺]
 *     (V = 0 mL: pH = 1.00; V = 10.0 mL: pH = 1.48; V = 19.8 mL: pH = 3.30).
 *   - Điểm tương đương: V = 20.0 mL (pH = 7.00).
 *   - Bước nhảy pH (pH jump): Từ pH 3.30 vọt lên pH 10.0 chỉ trong 0.1 mL NaOH!
 *   - Chỉ thị phenolphtalein: Không màu ở pH < 8.2; chuyển sang màu hồng cánh sen bền
 *     tại khoảng pH 8.2 - 10.0 (kích hoạt .hi tại V ≥ 20.05 mL).
 * Geometry (Lucas Markes Specimen Discipline):
 *   - Chân đế giá thí nghiệm gang chữ nhật nặng, có tấm sứ trắng (white ceramic titration tile) lót dưới bình.
 *   - Trụ thép đứng gắn khớp nối bosshead và kẹp buret 3 chạc (3-prong clamp) kẹp chuẩn trục.
 *   - Bình tam giác Erlenmeyer chuẩn: Đáy rộng, vai nón côn, cổ cao, miệng loe rỗng.
 *   - Ống buret thủy tinh chia vạch rõ, van khóa PTFE ngang điều khiển dòng nhỏ giọt thật.
 *   - Hero scale chiếm 70% viewport, 100% opaque, không bug offset prism.
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
    const C = HL.Cam(45, 0.5, 3.2);
    HL.fit(C, [[-20, -18, 0], [20, 16, 44]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    function circAt(cx, cy, R, n = 28) {
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        out.push({ u: cx + R * ca, v: cy + R * sa, nu: ca, nv: sa });
      }
      return out;
    }

    // 1. Heavy Cast-Iron Retort Stand Base (X = -12 to 12, Y = -14 to 8, Z = 0 to 2.2)
    const standSol = HL.solid(svg);
    const [stO, stI] = HL.rings(-12, -14, 12, 8, 1.5, 0.4);
    HL.put(standSol, HL.prism(P, front, stO, stI, 0, 2.2));

    // White Ceramic Titration Tile (Tấm sứ trắng đặt bình tam giác X = -7 to 7, Y = -4 to 6, Z = 2.3)
    const tilePts = [
      P(-7, -4, 2.3), P(7, -4, 2.3), P(7, 6, 2.3), P(-7, 6, 2.3)
    ];
    HL.mk("polygon", {
      points: tilePts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "),
      class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 0.8
    }, svg);

    // Vertical Stand Rod at (X = -8.5, Y = -9.0, Z = 2.2 to 42.0)
    const rodSol = HL.solid(svg);
    const rodO = circAt(-8.5, -9.0, 1.0, 16);
    const rodI = circAt(-8.5, -9.0, 0.7, 16);
    HL.put(rodSol, HL.prism(P, front, rodO, rodI, 2.2, 42.0));

    // Bosshead Clamp at Z = 27.0
    const bossSol = HL.solid(svg);
    const [bshO, bshI] = HL.rings(-9.8, -10.2, -7.2, -7.8, 0.4, 0.2);
    HL.put(bossSol, HL.prism(P, front, bshO, bshI, 26.5, 28.5));

    // 3-Prong Buret Clamp extending from bosshead to buret at (0, 0)
    const clampArmSol = HL.solid(svg);
    const [caO, caI] = HL.rings(-8.0, -8.5, 0.0, -0.8, 0.5, 0.2);
    HL.put(clampArmSol, HL.prism(P, front, caO, caI, 27.0, 28.0));

    // Clamp fingers gripping buret at (0, 0, Z = 26.5 to 28.5)
    const fingersSol = HL.solid(svg);
    const fingO = circAt(0, 0, 2.4, 18);
    const fingI = circAt(0, 0, 1.8, 18);
    HL.put(fingersSol, HL.prism(P, front, fingO, fingI, 26.8, 28.2));

    // 2. Erlenmeyer Flask sitting at (0, 1.0, Z = 2.3 to 11.5)
    const flaskGroup = HL.mk("g", {}, svg);
    const flaskBody = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, flaskGroup);
    const flaskNeckSol = HL.solid(flaskGroup);
    const flaskLiquid = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);

    const fBaseR = 6.8;
    const fNeckR = 2.4;
    const fCenter = [0, 1.0];

    // Conical Body of Erlenmeyer Flask: from Base Z = 2.3 up to Shoulder Z = 8.5
    function buildFlask() {
      const bPts = [];
      const N = 24;
      for (let i = 0; i <= 12; i++) {
        const ang = (135 - i * 15) * Math.PI / 180;
        bPts.push(P(fCenter[0] + fBaseR * Math.cos(ang), fCenter[1] + fBaseR * Math.sin(ang), 2.3));
      }
      const tPts = [];
      for (let i = 0; i <= 12; i++) {
        const ang = (-45 + i * 15) * Math.PI / 180;
        tPts.push(P(fCenter[0] + fNeckR * Math.cos(ang), fCenter[1] + fNeckR * Math.sin(ang), 8.5));
      }
      flaskBody.setAttribute("d", HL.poly([...bPts, ...tPts]));

      // Cylindrical Neck: Z = 8.5 to 12.0
      const neckO = circAt(fCenter[0], fCenter[1], fNeckR, 20);
      const neckI = circAt(fCenter[0], fCenter[1], fNeckR - 0.4, 20);
      HL.put(flaskNeckSol, HL.prism(P, front, neckO, neckI, 8.5, 12.0));
    }
    buildFlask();

    // 3. Glass Buret (Vertical precision cylinder at 0, 0, Z = 15.0 to 42.0)
    const buretGroup = HL.mk("g", {}, svg);
    const buretSol = HL.solid(buretGroup);
    const buretR = 1.6;
    const buretO = circAt(0, 0, buretR, 20);
    const buretI = circAt(0, 0, buretR - 0.35, 20);
    HL.put(buretSol, HL.prism(P, front, buretO, buretI, 15.5, 41.5));

    // Graduation Scale Ticks along front face of buret
    const tickGroup = HL.mk("g", { class: "lo" }, buretGroup);
    for (let gz = 18.0; gz <= 40.0; gz += 1.2) {
      const isMajor = Math.round((gz - 18.0) * 10) % 60 === 0;
      const tLen = isMajor ? 1.4 : 0.8;
      const pA = P(buretR * 0.707, buretR * 0.707, gz);
      const pB = P((buretR - tLen) * 0.707, (buretR - tLen) * 0.707, gz);
      HL.mk("line", {
        x1: HL.r2(pA[0]), y1: HL.r2(pA[1]),
        x2: HL.r2(pB[0]), y2: HL.r2(pB[1]),
        stroke: "var(--hl-edge)", "stroke-width": 0.8
      }, tickGroup);
    }

    // Stopcock Valve Housing at Z = 15.5
    const scHousingSol = HL.solid(buretGroup);
    const scO = circAt(0, 0, 2.2, 16);
    const scI = circAt(0, 0, 1.8, 16);
    HL.put(scHousingSol, HL.prism(P, front, scO, scI, 14.8, 16.2));

    // PTFE Stopcock Handle (Horizontal pin rotated by valve flow)
    const stopcockHandle = HL.mk("line", { class: "hi", "stroke-width": 2.2, stroke: "var(--hl-edge)" }, buretGroup);

    // Dispensing Tip Nozzle (Z = 14.8 down to 12.8)
    const tipSol = HL.solid(buretGroup);
    const tipO = circAt(0, 0, 0.8, 12);
    const tipI = circAt(0, 0, 0.5, 12);
    HL.put(tipSol, HL.prism(P, front, tipO, tipI, 12.8, 14.8));

    // Liquid Meniscus inside Buret
    const buretMeniscus = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, buretGroup);

    // Falling Droplet from buret tip into flask
    const droplet = HL.mk("circle", { r: 1.1, class: "dot", opacity: 0 }, buretGroup);

    // Kinematic Springs & State
    const initialV_val = initialV != null ? initialV : 10.0;
    const spVol = HL.spring(initialV_val, { k: 120, c: 14 }); // NaOH added volume 0 to 25 mL
    let dropAnimT = 0;

    function computePH(v) {
      // Titration of 20.0 mL of 0.10 M HCl with 0.10 M NaOH
      if (v < 20.0) {
        const unreactedMoles = 2.00 - 0.10 * v; // mmol H+
        const totalV = 20.0 + v; // mL
        const hConc = unreactedMoles / totalV; // M
        return Math.max(1.00, -Math.log10(hConc));
      } else if (Math.abs(v - 20.0) < 1e-4) {
        return 7.00;
      } else {
        const excessMoles = 0.10 * (v - 20.0); // mmol OH-
        const totalV = 20.0 + v; // mL
        const ohConc = excessMoles / totalV; // M
        const pOH = -Math.log10(ohConc);
        return Math.min(13.00, 14.00 - pOH);
      }
    }

    function draw() {
      const vol = spVol.x;
      const pH = computePH(vol);
      const isEndpoint = pH >= 8.2; // Phenolphthalein color change at pH >= 8.2

      // Stopcock handle rotation: 0° (horizontal, closed) -> 90° (vertical, fast flow)
      const valveFlow = HL.clamp(Math.abs(spVol.v) * 0.15 + (vol > 0 ? 0.4 : 0), 0, 1);
      const ang = valveFlow * (Math.PI / 2);
      const scLen = 3.6;
      const scA = P(-scLen * Math.cos(ang), 0, 15.5 + scLen * Math.sin(ang));
      const scB = P(scLen * Math.cos(ang), 0, 15.5 - scLen * Math.sin(ang));
      stopcockHandle.setAttribute("x1", HL.r2(scA[0]));
      stopcockHandle.setAttribute("y1", HL.r2(scA[1]));
      stopcockHandle.setAttribute("x2", HL.r2(scB[0]));
      stopcockHandle.setAttribute("y2", HL.r2(scB[1]));

      // Meniscus inside Buret: Z drops from 40.0 down to 20.0 as vol goes 0 -> 25 mL
      const menZ = 40.0 - (vol / 25.0) * 20.0;
      const menPts = [];
      for (let a = 0; a < 20; a++) {
        const rad = (a * 2 * Math.PI) / 20;
        menPts.push(P((buretR - 0.3) * Math.cos(rad), (buretR - 0.3) * Math.sin(rad), menZ));
      }
      buretMeniscus.setAttribute("d", HL.poly(menPts));

      // Liquid level in Erlenmeyer flask rises slightly as vol increases
      const liqZ = 3.8 + (vol / 25.0) * 2.4;
      const liqPts = [];
      const liqR = fBaseR - ((liqZ - 2.3) / (8.5 - 2.3)) * (fBaseR - fNeckR);
      for (let a = 0; a < 20; a++) {
        const rad = (a * 2 * Math.PI) / 20;
        liqPts.push(P(fCenter[0] + liqR * Math.cos(rad), fCenter[1] + liqR * Math.sin(rad), liqZ));
      }
      flaskLiquid.setAttribute("d", HL.poly(liqPts));

      // Droplet animation
      if (Math.abs(spVol.v) > 0.05) {
        dropAnimT = (dropAnimT + 0.08) % 1;
        const dropZ = 12.8 - dropAnimT * 5.0;
        const dp = P(0, 0, dropZ);
        droplet.setAttribute("cx", HL.r2(dp[0]));
        droplet.setAttribute("cy", HL.r2(dp[1]));
        droplet.setAttribute("opacity", "1");
      } else {
        droplet.setAttribute("opacity", "0");
      }

      // Endpoint Phenolphthalein Indicator Highlight
      if (isEndpoint) {
        flaskLiquid.classList.add("hi");
        flaskLiquid.classList.remove("lo");
        flaskBody.classList.add("hi");
        read.textContent = `V_NaOH = ${vol.toFixed(2)} mL · pH = ${pH.toFixed(2)} (≥ 8.2) · [ĐIỂM TƯƠNG ĐƯƠNG] Phenolphthalein chuyển hồng sen bền (.hi)`;
      } else {
        flaskLiquid.classList.remove("hi");
        flaskLiquid.classList.add("lo");
        flaskBody.classList.remove("hi");
        read.textContent = `V_NaOH = ${vol.toFixed(2)} mL · pH = ${pH.toFixed(2)} · Axit dư [H⁺] · Dung dịch không màu (còn ${(20.0 - vol).toFixed(2)} mL đến ĐTĐ)`;
      }
    }

    function setVol(val) {
      spVol.t = HL.clamp(val, 0, 25);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setVol(10.0);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setVol(norm * 25.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spVol, dt);
      draw();
      return moving || Math.abs(spVol.v) > 0.05;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setVol(Number(v));
      },
      destroy: bag.dispose,
      dispose: bag.dispose
    };
  }
},
/*
 * 2. Alcohol Burner & Thermal Decomposition (Đèn Cồn & Ống Nghiệm Đun Nóng)
 * Chemical Concept: Phản ứng nhiệt phân & Chuyển pha:
 *   - Nhiệt lượng cung cấp: Q = m·c·Δt; Nhiệt độ tăng từ 25°C đến 100°C.
 *   - Khi t° ≥ 80°C: Năng lượng vượt qua hoạt hóa, phản ứng phân hủy sinh khí mãnh liệt:
 *     2KMnO₄ (rắn tím) ──t°──> K₂MnO₄ + MnO₂ + O₂↑ (Khí oxy thoát ra miệng ống).
 * Geometry: Đèn cồn thủy tinh tròn dẹp có bấc cháy, ngọn lửa hình giọt nhọn axonometric,
 *   giá sắt kẹp ống nghiệm nghiêng 45°, ống nghiệm đặc opaque chứa hóa chất và bọt khí sủi tăm.
 * Kinematics: Di chuột điều chỉnh độ lớn ngọn lửa đèn cồn; ngọn lửa bập bùng sinh động,
 *   nhiệt độ tăng vọt, bọt khí trong lòng ống nghiệm nổi lên liên tục và kích hoạt trạng thái phản ứng .hi.
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
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 38]], 200, 160);
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

    // 1. Lab Table Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // Stand Rod at (+20, 0, 2.5 to 36)
    const rodSol = HL.solid(svg);
    const rodO = circAt(20, 0, 1.8, 16);
    const rodI = circAt(20, 0, 1.4, 16);
    HL.put(rodSol, HL.prism(P, front, rodO, rodI, 2.5, 36));

    // Clamp holding test tube at (+20, 0, 22) -> (6, 0, 22)
    const clampSol = HL.solid(svg);
    const [clO, clI] = HL.rings(6, -1.2, 20, 1.2, 0.5, 0.2);
    HL.put(clampSol, HL.prism(P, front, clO, clI, 21.0, 23.0));

    // 2. Alcohol Burner sitting at (-8, 0, 2.5)
    const burnerCenter = [-8, 0];
    const burnerSol = HL.solid(svg);
    // Squat glass jar (radius 7.5, height 5.5 at -8, 0)
    const bJarO = circAt(-8, 0, 7.5, 24);
    const bJarI = circAt(-8, 0, 6.8, 24);
    HL.put(burnerSol, HL.prism(P, front, bJarO, bJarI, 2.5, 7.5));

    // Wick collar cylinder (radius 2.8, Z: 7.5 to 9.5 at -8, 0)
    const collarSol = HL.solid(svg);
    const bColO = circAt(-8, 0, 2.8, 16);
    const bColI = circAt(-8, 0, 2.2, 16);
    HL.put(collarSol, HL.prism(P, front, bColO, bColI, 7.5, 9.5));

    // 3. Flame Shape
    const flameGroup = HL.mk("g", {}, svg);
    const flameOuter = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flameGroup);
    const flameCore = HL.mk("path", { class: "lo", "stroke-width": 1.0, fill: "none" }, flameGroup);

    // 4. Inclined Test Tube (Ống nghiệm nghiêng 45 độ, đặc 100% opaque)
    const cos45 = Math.cos(Math.PI / 4);
    const sin45 = Math.sin(Math.PI / 4);
    const tubeR = 2.4;
    const bCenter = [-8.0, 0, 10.5]; // Bottom spherical cap center
    const mouthDist = 30.0;
    const mCenter = [bCenter[0] + mouthDist * cos45, 0, bCenter[2] + mouthDist * sin45];

    const tubeGroup = HL.mk("g", {}, svg);
    const tubeSol = HL.solid(tubeGroup);
    const tubeLiquid = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, tubeGroup);

    // Build solid test tube geometry
    const bL = P(bCenter[0] - tubeR * sin45, 0, bCenter[2] + tubeR * cos45);
    const bR = P(bCenter[0] + tubeR * sin45, 0, bCenter[2] - tubeR * cos45);
    const mL = P(mCenter[0] - tubeR * sin45, 0, mCenter[2] + tubeR * cos45);
    const mR = P(mCenter[0] + tubeR * sin45, 0, mCenter[2] - tubeR * cos45);
    const bBottom = P(bCenter[0] - tubeR * cos45, 0, bCenter[2] - tubeR * sin45);

    // Mouth ellipse
    const mouthPts = [];
    for (let a = 0; a < 20; a++) {
      const ang = (a * 2 * Math.PI) / 20;
      const ox = -tubeR * Math.cos(ang) * sin45;
      const oy = tubeR * Math.sin(ang);
      const oz = tubeR * Math.cos(ang) * cos45;
      mouthPts.push(P(mCenter[0] + ox, oy, mCenter[2] + oz));
    }

    const tubeD = `M ${HL.r2(bL[0])} ${HL.r2(bL[1])} Q ${HL.r2(bBottom[0])} ${HL.r2(bBottom[1])} ${HL.r2(bR[0])} ${HL.r2(bR[1])} L ${HL.r2(mR[0])} ${HL.r2(mR[1])} L ${HL.r2(mL[0])} ${HL.r2(mL[1])} Z`;
    HL.put(tubeSol, { sil: tubeD + " " + HL.poly(mouthPts), crease: "" });

    // Rising Bubbles inside test tube
    const bubblesGroup = HL.mk("g", { class: "hi" }, tubeGroup);
    const bubbleCircles = [];
    for (let b = 0; b < 5; b++) {
      const circ = HL.mk("circle", { r: 0.9, class: "dot", opacity: 0 }, bubblesGroup);
      bubbleCircles.push(circ);
    }

    // Kinematics Springs
    const initialHeat = initialV != null ? initialV : 60;
    const spHeat = HL.spring(initialHeat, { k: 120, c: 14 });
    let animTime = 0;

    function draw() {
      const heat = spHeat.x; // 0 to 100%
      const isActive = heat >= 80;

      // A. Flame flickers properly in 3D projection
      const flameH = 4.0 + (heat / 100.0) * 8.5;
      const flameW = 2.0 + (heat / 100.0) * 3.0;
      const flicker = Math.sin(animTime * 8) * 0.4;
      const fBaseZ = 9.5;
      const fTipZ = fBaseZ + flameH;

      const fP0 = P(burnerCenter[0] - flameW, 0, fBaseZ);
      const fP1 = P(burnerCenter[0] + flameW, 0, fBaseZ);
      const fTip = P(burnerCenter[0] + flicker, 0, fTipZ);
      const fMidL = P(burnerCenter[0] - flameW * 1.1, 0, fBaseZ + flameH * 0.5);
      const fMidR = P(burnerCenter[0] + flameW * 1.1, 0, fBaseZ + flameH * 0.5);

      flameOuter.setAttribute("d", `M ${HL.r2(fP0[0])} ${HL.r2(fP0[1])} Q ${HL.r2(fMidL[0])} ${HL.r2(fMidL[1])} ${HL.r2(fTip[0])} ${HL.r2(fTip[1])} Q ${HL.r2(fMidR[0])} ${HL.r2(fMidR[1])} ${HL.r2(fP1[0])} ${HL.r2(fP1[1])} Z`);

      // Core flame properly projected:
      const cP0 = P(burnerCenter[0] - flameW * 0.5, 0, fBaseZ);
      const cP1 = P(burnerCenter[0] + flameW * 0.5, 0, fBaseZ);
      const cTip = P(burnerCenter[0] + flicker * 0.6, 0, fBaseZ + flameH * 0.65);
      const cMidL = P(burnerCenter[0] - flameW * 0.6, 0, fBaseZ + flameH * 0.3);
      const cMidR = P(burnerCenter[0] + flameW * 0.6, 0, fBaseZ + flameH * 0.3);

      flameCore.setAttribute("d", `M ${HL.r2(cP0[0])} ${HL.r2(cP0[1])} Q ${HL.r2(cMidL[0])} ${HL.r2(cMidL[1])} ${HL.r2(cTip[0])} ${HL.r2(cTip[1])} Q ${HL.r2(cMidR[0])} ${HL.r2(cMidR[1])} ${HL.r2(cP1[0])} ${HL.r2(cP1[1])}`);

      flameOuter.classList.toggle("hi", heat > 40);

      // B. Liquid Column inside tube
      const liqLen = 13.0;
      const liqCenter = [bCenter[0] + liqLen * cos45, 0, bCenter[2] + liqLen * sin45];
      const liqPts = [];
      for (let a = 0; a < 20; a++) {
        const ang = (a * 2 * Math.PI) / 20;
        const ox = -tubeR * Math.cos(ang) * sin45;
        const oy = tubeR * Math.sin(ang);
        const oz = tubeR * Math.cos(ang) * cos45;
        liqPts.push(P(liqCenter[0] + ox, oy, liqCenter[2] + oz));
      }
      tubeLiquid.setAttribute("d", HL.poly(liqPts));
      tubeLiquid.classList.toggle("hi", isActive);

      // C. Rising Bubbles
      bubbleCircles.forEach((circ, idx) => {
        if (!isActive) {
          circ.setAttribute("opacity", 0);
          return;
        }
        circ.setAttribute("opacity", 1);
        const progress = (animTime * 1.5 + idx * 0.22) % 1.0;
        const bPosLen = 3.0 + progress * 9.5;
        const bX = bCenter[0] + bPosLen * cos45 + (Math.sin(animTime * 6 + idx) * 0.7);
        const bZ = bCenter[2] + bPosLen * sin45;
        const bPt = P(bX, 0, bZ);
        circ.setAttribute("cx", HL.r2(bPt[0]));
        circ.setAttribute("cy", HL.r2(bPt[1]));
      });

      // D. Temperature & Reaction Header
      const temp = 25 + (heat / 100.0) * 75;
      const tStr = HL.r2(temp);
      if (isActive) {
        read.textContent = `Nhiệt phân: t° = ${tStr}°C ≥ 80°C · SÔI & THOÁT KHÍ O₂: 2KMnO₄ ──t°──> K₂MnO₄ + MnO₂ + O₂↑ (.hi)`;
      } else {
        read.textContent = `Nhiệt phân: t° = ${tStr}°C < 80°C · Cung cấp nhiệt lượng Q = m·c·Δt (Đang gia nhiệt)`;
      }
    }

    function setHeat(h) {
      spHeat.t = HL.clamp(h, 0, 100);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setHeat(60.0);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setHeat(norm * 100.0);
    }

    const reg = HL.register(stage, dt => {
      animTime += dt;
      const moving = HL.stepS(spHeat, dt);
      draw();
      return moving || spHeat.x >= 75;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setHeat(Number(v));
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 3. Crystal Lattice Structure (Mạng Tinh Thể Lập Phương NaCl)
 * Chemical Concept: Mạng tinh thể ion lập phương tâm mặt (FCC - Face-Centered Cubic):
 *   - Xen kẽ giữa cation Na⁺ (bán kính nhỏ r = 102 pm) và anion Cl⁻ (bán kính lớn r = 181 pm).
 *   - Lực liên kết ion: Cân bằng giữa lực hút tĩnh điện Coulomb F_hút ~ 1/r²
 *     và lực đẩy tương tác đám mây electron F_đẩy ~ 1/r¹² (Hố thế Born-Mayer).
 *   - Khoảng cách cân bằng bền: r₀ = 282 pm; Năng lượng mạng tinh thể: U = -786 kJ/mol.
 * Geometry: Bệ đỡ tiêu bản tròn/chữ nhật, 27 nút mạng ion đặc xen kẽ (Na⁺ & Cl⁻),
 *   các thanh liên kết tinh thể trực giao theo 3 trục không gian X, Y, Z.
 * Kinematics: Di chuột để kéo dãn hoặc nén mạng tinh thể; các liên kết co giãn đàn hồi theo HL.spring.
 *   Khi mạng đạt đúng khoảng cách cân bằng r₀, toàn bộ liên kết tâm kích hoạt trạng thái bền .hi.
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
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 42]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Showcase Pedestal Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // Base coordinate grid lines
    HL.mk("line", {
      x1: HL.r2(P(-24, 0, 2.6)[0]), y1: HL.r2(P(-24, 0, 2.6)[1]),
      x2: HL.r2(P(24, 0, 2.6)[0]), y2: HL.r2(P(24, 0, 2.6)[1]),
      class: "lo", "stroke-width": 0.8, "stroke-dasharray": "3 2"
    }, svg);

    // 2. Crystal Lattice Nodes & Bonds
    // We construct a 3x3x3 cubic lattice centered at (0, 0, 22)
    // Indices i, j, k in [-1, 0, 1]
    const centerZ = 22.0;
    const bondGroup = HL.mk("g", {}, svg);
    const ionGroup = HL.mk("g", {}, svg);

    // Kinematics Springs
    const initialR = initialV != null ? initialV : 282;
    const spR = HL.spring(initialR, { k: 130, c: 14 });

    // Pre-create SVG elements for bonds and ions
    // Bonds: (3*3*2) * 3 = 54 bonds
    const bonds = [];
    for (let axis = 0; axis < 3; axis++) {
      for (let a = -1; a <= 1; a++) {
        for (let b = -1; b <= 1; b++) {
          for (let c = -1; c <= 0; c++) {
            const line = HL.mk("line", { class: "sil", "stroke-width": 1.2, stroke: "var(--hl-edge)" }, bondGroup);
            bonds.push({ line, axis, a, b, c });
          }
        }
      }
    }

    // 27 Ion Spheres
    // Sort order for isometric rendering: back-to-front in projection
    // For Cam(az=45), depth increases with (-X + Y)
    const ions = [];
    for (let ix = -1; ix <= 1; ix++) {
      for (let iy = -1; iy <= 1; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          const isNa = (ix + iy + iz) % 2 === 0;
          const radius = isNa ? 2.2 : 3.4; // Na+ is smaller, Cl- is larger
          const group = HL.mk("g", {}, ionGroup);
          const circle = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, group);
          const detail = HL.mk("circle", { r: isNa ? 0.8 : 1.2, class: isNa ? "dot" : "lo" }, group);
          ions.push({ group, circle, detail, ix, iy, iz, isNa, radius });
        }
      }
    }

    // Sort ions back-to-front
    ions.sort((a, b) => {
      const depthA = a.ix * Math.sin(Math.PI / 4) + a.iy * Math.cos(Math.PI / 4) + a.iz * 0.5;
      const depthB = b.ix * Math.sin(Math.PI / 4) + b.iy * Math.cos(Math.PI / 4) + b.iz * 0.5;
      return depthA - depthB;
    });

    function draw() {
      const r = spR.x; // pm (220 to 340)
      // Visual spacing: 282 pm maps to 10.5 units
      const d = (r / 282.0) * 10.5;
      const isEquil = Math.abs(r - 282) < 4.0;

      // Update Bonds
      bonds.forEach(b => {
        let p0, p1;
        if (b.axis === 0) {
          // X-axis
          p0 = P(b.c * d, b.a * d, centerZ + b.b * d);
          p1 = P((b.c + 1) * d, b.a * d, centerZ + b.b * d);
        } else if (b.axis === 1) {
          // Y-axis
          p0 = P(b.a * d, b.c * d, centerZ + b.b * d);
          p1 = P(b.a * d, (b.c + 1) * d, centerZ + b.b * d);
        } else {
          // Z-axis
          p0 = P(b.a * d, b.b * d, centerZ + b.c * d);
          p1 = P(b.a * d, b.b * d, centerZ + (b.c + 1) * d);
        }
        b.line.setAttribute("x1", HL.r2(p0[0]));
        b.line.setAttribute("y1", HL.r2(p0[1]));
        b.line.setAttribute("x2", HL.r2(p1[0]));
        b.line.setAttribute("y2", HL.r2(p1[1]));
        b.line.classList.toggle("hi", isEquil);
      });

      // Update Ions
      ions.forEach(ion => {
        const pt = P(ion.ix * d, ion.iy * d, centerZ + ion.iz * d);
        const rVisual = ion.radius;

        // Draw solid circle disc for sphere in projection
        const discPts = [];
        for (let a = 0; a < 20; a++) {
          const ang = (a * 2 * Math.PI) / 20;
          discPts.push([pt[0] + rVisual * Math.cos(ang), pt[1] + rVisual * Math.sin(ang)]);
        }
        ion.circle.setAttribute("d", HL.poly(discPts));

        // Center dot / equator detail
        ion.detail.setAttribute("cx", HL.r2(pt[0]));
        ion.detail.setAttribute("cy", HL.r2(pt[1]));

        // Focal highlight: highlight ONLY the central ion (0,0,0) and its 6 nearest neighbors
        const isCenter = ion.i === 0 && ion.j === 0 && ion.k === 0;
        const isCoordNeighbor = Math.abs(ion.i) + Math.abs(ion.j) + Math.abs(ion.k) === 1;
        const isFocalGroup = isCenter || isCoordNeighbor;

        if (isEquil && isFocalGroup) {
          ion.circle.classList.add("hi");
          ion.circle.classList.remove("lo");
        } else {
          ion.circle.classList.remove("hi");
          ion.circle.classList.add("lo");
        }
      });

      // Header Readout: True Born-Landé Potential Energy U(r) with minimum at r0 = 282 pm
      const rStr = HL.r2(r);
      const ratio = 282.0 / r;
      const nBorn = 8;
      // U(r) = -898.3 * [ (r0/r) - (1/n) * (r0/r)^n ] (kJ/mol)
      const uLattice = HL.r2(-898.3 * (ratio - (1 / nBorn) * Math.pow(ratio, nBorn)));
      // Restoring force F = -dU/dr
      const forceRel = HL.r2((Math.pow(ratio, 2) - Math.pow(ratio, nBorn + 1)) * 100);

      if (isEquil) {
        read.textContent = `Mạng tinh thể NaCl: r = ${rStr} pm (Cực tiểu r₀ = 282 pm) · U_min = ${uLattice} kJ/mol · [CÂN BẰNG BỀN] F_hút = F_đẩy (Số phối trí CN = 6) (.hi)`;
      } else if (r < 282) {
        read.textContent = `Mạng tinh thể NaCl: r = ${rStr} pm < 282 pm · U = ${uLattice} kJ/mol · Lực đẩy Born áp đảo (F_đẩy = +${Math.abs(forceRel)} N·rel, mạng bị nén)`;
      } else {
        read.textContent = `Mạng tinh thể NaCl: r = ${rStr} pm > 282 pm · U = ${uLattice} kJ/mol · Lực hút Coulomb áp đảo (F_hút = -${Math.abs(forceRel)} N·rel, kéo về cân bằng)`;
      }
    }

    function setDistance(val) {
      spR.t = HL.clamp(val, 220, 340);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setDistance(282.0); // Reset to equilibrium
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setDistance(220 + norm * 120.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spR, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setDistance(Number(v));
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 4. Distillation Apparatus & Liebig Condenser (Bộ Chưng Cất Phân Đoạn & Ống Sinh Hàn Liebig)
 * Chemical Concept: Phương pháp chưng cất tách chất theo nhiệt độ sôi (Fractional Distillation):
 *   - Hỗn hợp nhị phân: Ethanol (t_sôi = 78.3°C) và Nước (t_sôi = 100.0°C).
 *   - Khi đun tới t° ≥ 78.3°C: Áp suất hơi bão hòa p_et = 1 atm, ethanol sôi bay hơi trước.
 *   - Hơi cồn đi lên cổ bình, tiếp xúc bầu thủy ngân nhiệt kế (ghi nhận 78.3°C), rẽ vào ống sinh hàn Liebig.
 *   - Dòng nước làm mát đối lưu (Counter-current cooling: Nước vào ở đầu thấp, ra ở đầu cao)
 *     hấp thụ nhiệt hóa hơi (ΔH_vap = 38.56 kJ/mol), ngưng tụ hơi cồn thành dòng giọt lỏng tinh khiết.
 * Geometry (Lucas Markes Specimen Discipline):
 *   - Hai giá kẹp thí nghiệm độc lập (Retort Stands) bằng gang nặng với khớp nối bosshead và kẹp 3 chạc.
 *   - Bình cầu đáy tròn trong bếp gia nhiệt điện (Electric Heating Mantle).
 *   - Ống sinh hàn Liebig 2 lớp thủy tinh thật: Ống dẫn hơi bên trong, áo nước làm mát bên ngoài
 *     có 2 vòi nhánh dẫn nước vào (inlet) và nước ra (outlet).
 *   - Đầu nối cong (bent receiving adapter) dẫn giọt cồn vào bình tam giác Erlenmeyer.
 *   - 100% opaque, không polygon phẳng thay thế, không bug offset prism.
 * Kinematics:
 *   - Di chuột điều chỉnh nhiệt độ từ 50°C đến 95°C.
 *   - t° < 78.3°C: Hỗn hợp chỉ nóng lên, nhiệt kế dâng, bình hứng khô cạn (0 mL).
 *   - t° ≥ 78.3°C: Sôi mãnh liệt, hơi dâng, giọt ngưng tụ rơi liên tục vào bình tam giác,
 *     thể tích cồn thu hồi tích lũy thời gian thực.
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
    const C = HL.Cam(45, 0.5, 3.2);
    HL.fit(C, [[-27, -6, 0], [22, 6, 35]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    function circAt(cx, cy, R, n = 28) {
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        out.push({ u: cx + R * ca, v: cy + R * sa, nu: ca, nv: sa });
      }
      return out;
    }

    // 1. Two Independent Cast-Iron Retort Stands (Hai giá thí nghiệm gang)
    // Left Stand (holding heating mantle & flask): Base at X = -21, Y = 0, Z = 0 to 2.2
    const stand1Sol = HL.solid(svg);
    const [st1O, st1I] = HL.rings(-27, -5, -15, 5, 1.2, 0.4);
    HL.put(stand1Sol, HL.prism(P, front, st1O, st1I, 0, 2.2));

    // Stand 1 vertical rod at (-21, -3.5, Z = 2.2 to 34.0)
    const rod1Sol = HL.solid(svg);
    const rod1O = circAt(-21, -3.5, 0.9, 16);
    const rod1I = circAt(-21, -3.5, 0.6, 16);
    HL.put(rod1Sol, HL.prism(P, front, rod1O, rod1I, 2.2, 34.0));

    // Stand 1 Bosshead clamp at Z = 20.0 holding flask neck
    const clamp1Sol = HL.solid(svg);
    const [cl1O, cl1I] = HL.rings(-22.2, -4.5, -19.8, -2.5, 0.4, 0.2);
    HL.put(clamp1Sol, HL.prism(P, front, cl1O, cl1I, 19.5, 21.0));

    // Right Stand (holding angled Liebig condenser): Base at X = 7, Y = 0, Z = 0 to 2.2
    const stand2Sol = HL.solid(svg);
    const [st2O, st2I] = HL.rings(2, -5, 12, 5, 1.2, 0.4);
    HL.put(stand2Sol, HL.prism(P, front, st2O, st2I, 0, 2.2));

    // Stand 2 vertical rod at (7, -3.5, Z = 2.2 to 28.0)
    const rod2Sol = HL.solid(svg);
    const rod2O = circAt(7, -3.5, 0.9, 16);
    const rod2I = circAt(7, -3.5, 0.6, 16);
    HL.put(rod2Sol, HL.prism(P, front, rod2O, rod2I, 2.2, 28.0));

    // Stand 2 3-prong clamp at Z = 14.5 gripping condenser jacket
    const clamp2Sol = HL.solid(svg);
    const [cl2O, cl2I] = HL.rings(5.8, -4.5, 8.2, -2.5, 0.4, 0.2);
    HL.put(clamp2Sol, HL.prism(P, front, cl2O, cl2I, 14.0, 15.5));

    // 2. Electric Heating Mantle (Bếp gia nhiệt điện) at X = -21, Y = 0, Z = 2.2 to 8.5
    const mantleSol = HL.solid(svg);
    const mantleO = circAt(-21, 0, 6.4, 24);
    const mantleI = circAt(-21, 0, 5.2, 24);
    HL.put(mantleSol, HL.prism(P, front, mantleO, mantleI, 2.2, 8.5));

    // 3. Round-Bottom Distillation Flask (Bình cầu đáy tròn 250mL)
    // Spherical bulb centered at (-21, 0, 13.0) with radius 5.6
    const flaskGroup = HL.mk("g", {}, svg);
    const flaskBulb = HL.mk("circle", { r: 5.6 * 2.1, class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, flaskGroup);
    const flaskLiquid = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);
    const boilBubbles = HL.mk("g", { class: "lo" }, flaskGroup);

    // Position sphere center on screen
    const bulbP = P(-21, 0, 13.0);
    flaskBulb.setAttribute("cx", HL.r2(bulbP[0]));
    flaskBulb.setAttribute("cy", HL.r2(bulbP[1]));

    // Flask vertical neck from Z = 16.5 up to Z = 25.0 (width 3.2)
    const flaskNeckSol = HL.solid(flaskGroup);
    const neckO = circAt(-21, 0, 1.8, 18);
    const neckI = circAt(-21, 0, 1.4, 18);
    HL.put(flaskNeckSol, HL.prism(P, front, neckO, neckI, 16.5, 25.0));

    // Thermometer thread inside neck: rubber stopper at Z = 25.0, stem down to Z = 19.5
    const thStem = HL.mk("line", {
      x1: HL.r2(P(-21, 0, 27.0)[0]), y1: HL.r2(P(-21, 0, 27.0)[1]),
      x2: HL.r2(P(-21, 0, 19.0)[0]), y2: HL.r2(P(-21, 0, 19.0)[1]),
      class: "hi", stroke: "var(--hl-edge)", "stroke-width": 1.4
    }, flaskGroup);

    // 4. Liebig Condenser (Ống sinh hàn 2 lớp kính nghiêng)
    // Side arm from flask neck at (-21, 0, 21.0) branching to start of condenser at (-15, 0, 19.5)
    const condenserGroup = HL.mk("g", {}, svg);
    const sideArm = HL.mk("line", {
      x1: HL.r2(P(-21, 0, 21.0)[0]), y1: HL.r2(P(-21, 0, 21.0)[1]),
      x2: HL.r2(P(-15, 0, 19.5)[0]), y2: HL.r2(P(-15, 0, 19.5)[1]),
      class: "sil", stroke: "var(--hl-edge)", "stroke-width": 2.4
    }, condenserGroup);

    // Condenser span: from A(-15, 0, 19.5) down to B(13, 0, 8.5)
    const cA = [-15, 0, 19.5];
    const cB = [13, 0, 8.5];
    const cDx = cB[0] - cA[0], cDz = cB[2] - cA[2];
    const cLen = Math.hypot(cDx, cDz);
    const ux = cDx / cLen, uz = cDz / cLen;
    const nx = -uz, nz = ux; // 2D normal perpendicular to condenser axis

    // Outer cooling water jacket: from s = 3.0 to s = 25.0 along axis, radius 2.6
    const jStartS = 3.0, jEndS = 25.0;
    const jR = 2.6;
    const jP0 = P(cA[0] + jStartS * ux + jR * nx, 0, cA[2] + jStartS * uz + jR * nz);
    const jP1 = P(cA[0] + jStartS * ux - jR * nx, 0, cA[2] + jStartS * uz - jR * nz);
    const jP2 = P(cA[0] + jEndS * ux - jR * nx, 0, cA[2] + jEndS * uz - jR * nz);
    const jP3 = P(cA[0] + jEndS * ux + jR * nx, 0, cA[2] + jEndS * uz + jR * nz);

    const jacketPoly = HL.mk("polygon", {
      points: [jP0, jP1, jP2, jP3].map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "),
      class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4
    }, condenserGroup);

    // Water Inlet nozzle (near lower end, pointing down-forward)
    const inNozzleA = P(cA[0] + 22.0 * ux, 0, cA[2] + 22.0 * uz - jR);
    const inNozzleB = P(cA[0] + 22.0 * ux, 0, cA[2] + 22.0 * uz - (jR + 3.0));
    HL.mk("line", {
      x1: HL.r2(inNozzleA[0]), y1: HL.r2(inNozzleA[1]),
      x2: HL.r2(inNozzleB[0]), y2: HL.r2(inNozzleB[1]),
      class: "hi", stroke: "var(--hl-edge)", "stroke-width": 1.8
    }, condenserGroup);

    // Water Outlet nozzle (near upper end, pointing up-backward)
    const outNozzleA = P(cA[0] + 6.0 * ux, 0, cA[2] + 6.0 * uz + jR);
    const outNozzleB = P(cA[0] + 6.0 * ux, 0, cA[2] + 6.0 * uz + (jR + 3.0));
    HL.mk("line", {
      x1: HL.r2(outNozzleA[0]), y1: HL.r2(outNozzleA[1]),
      x2: HL.r2(outNozzleB[0]), y2: HL.r2(outNozzleB[1]),
      class: "hi", stroke: "var(--hl-edge)", "stroke-width": 1.8
    }, condenserGroup);

    // Inner vapor tube (inside condenser, extending through)
    const innerTube = HL.mk("line", {
      x1: HL.r2(P(cA[0], 0, cA[2])[0]), y1: HL.r2(P(cA[0], 0, cA[2])[1]),
      x2: HL.r2(P(cB[0], 0, cB[2])[0]), y2: HL.r2(P(cB[0], 0, cB[2])[1]),
      class: "lo", stroke: "var(--hl-edge)", "stroke-width": 1.2
    }, condenserGroup);

    // Bent Receiving Adapter (ống sừng bò cong) at condenser exit B -> Erlenmeyer flask
    const adaptTipWorld = [cB[0] + 3.0, 0, 5.0];
    const adaptTip = P(...adaptTipWorld);
    const adapterPath = HL.mk("path", {
      d: `M ${HL.r2(P(cB[0], 0, cB[2])[0])} ${HL.r2(P(cB[0], 0, cB[2])[1])} Q ${HL.r2(P(cB[0] + 2.5, 0, cB[2] - 1.0)[0])} ${HL.r2(P(cB[0] + 2.5, 0, cB[2] - 1.0)[1])} ${HL.r2(adaptTip[0])} ${HL.r2(adaptTip[1])}`,
      class: "sil", fill: "none", stroke: "var(--hl-edge)", "stroke-width": 1.6
    }, condenserGroup);

    // 5. Receiving Erlenmeyer Flask (Bình tam giác hứng sản phẩm) at X = 17, Y = 0, Z = 0 to 6.5
    const recGroup = HL.mk("g", {}, svg);
    const recBaseP0 = P(12.5, -4.0, 0.1), recBaseP1 = P(21.5, -4.0, 0.1);
    const recBaseP2 = P(21.5, 4.0, 0.1), recBaseP3 = P(12.5, 4.0, 0.1);
    const recNeckP0 = P(15.5, -1.8, 6.0), recNeckP1 = P(18.5, -1.8, 6.0);
    const recNeckP2 = P(18.5, 1.8, 6.0), recNeckP3 = P(15.5, 1.8, 6.0);

    // 3D Erlenmeyer flask prism body
    const recFlaskSol = HL.solid(recGroup);
    const recO = circAt(17, 0, 5.5, 24);
    const recI = circAt(17, 0, 4.4, 24);
    HL.put(recFlaskSol, HL.prism(P, front, recO, recI, 0, 6.0));

    const recLiquid = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, recGroup);

    // Droplets running down inner tube & dripping into flask
    const dropGroup = HL.mk("g", { class: "hi" }, svg);
    const dropDots = [];
    for (let d = 0; d < 5; d++) {
      const dot = HL.mk("circle", { r: 1.2, fill: "var(--hl-edge)", stroke: "none", opacity: 0 }, dropGroup);
      dropDots.push(dot);
    }

    // Kinematic Springs & State
    const initialT = initialV != null ? initialV : 78.3;
    const spTemp = HL.spring(initialT, { k: 120, c: 14 }); // Temperature 50°C -> 95°C
    let accumulatedVolume = 0; // Accumulated distillate volume (mL)
    let dropPhase = 0;

    function draw() {
      const temp = spTemp.x;
      const isBoiling = temp >= 78.3;

      // Rate of distillation increases with temperature above 78.3°C
      const boilIntensity = isBoiling ? Math.min(1.0, (temp - 78.3) / 12.0) : 0;

      // Update liquid in boiling flask (decreases slightly as distilled)
      const flaskLiqZ = 13.0 - (accumulatedVolume * 0.08);
      const flP0 = P(-25.5, 0, flaskLiqZ), flP1 = P(-16.5, 0, flaskLiqZ);
      flaskLiquid.setAttribute("d", `M ${HL.r2(flP0[0])} ${HL.r2(flP0[1])} L ${HL.r2(flP1[0])} ${HL.r2(flP1[1])}`);

      // Condensation Droplets Animation
      if (isBoiling) {
        dropPhase = (dropPhase + 0.04 * (1 + boilIntensity)) % 1;
        for (let d = 0; d < dropDots.length; d++) {
          const s = (dropPhase + d / dropDots.length) % 1;
          let curX, curZ;
          if (s < 0.75) {
            // Sliding down inner tube
            const frac = s / 0.75;
            curX = cA[0] + frac * cDx;
            curZ = cA[2] + frac * cDz;
          } else {
            // Free dripping from adapter tip into receiving flask
            const frac = (s - 0.75) / 0.25;
            curX = adaptTipWorld[0];
            curZ = adaptTipWorld[2] - frac * 3.5;
          }
          const dp = P(curX, 0, curZ);
          dropDots[d].setAttribute("cx", HL.r2(dp[0]));
          dropDots[d].setAttribute("cy", HL.r2(dp[1]));
          dropDots[d].setAttribute("opacity", "1");
        }
      } else {
        for (const dot of dropDots) {
          dot.setAttribute("opacity", "0");
        }
      }

      // Distillate volume in receiving flask
      const recLevelZ = 0.5 + Math.min(4.5, accumulatedVolume * 0.15);
      const rkP0 = P(14.0, 0, recLevelZ), rkP1 = P(20.0, 0, recLevelZ);
      recLiquid.setAttribute("d", `M ${HL.r2(rkP0[0])} ${HL.r2(rkP0[1])} L ${HL.r2(rkP1[0])} ${HL.r2(rkP1[1])}`);

      // Readout
      if (isBoiling) {
        const rate = (0.8 + boilIntensity * 1.6).toFixed(1);
        read.textContent = `T = ${temp.toFixed(1)}°C (≥ 78.3°C) · C₂H₅OH sôi & ngưng tụ · Tốc độ: ${rate} mL/min · Thu hồi: ${accumulatedVolume.toFixed(1)} mL (.hi)`;
      } else {
        const remain = (78.3 - temp).toFixed(1);
        read.textContent = `T = ${temp.toFixed(1)}°C (< 78.3°C) · Gia nhiệt hỗn hợp (cần thêm +${remain}°C để sôi) · Bình hứng: ${accumulatedVolume.toFixed(1)} mL`;
      }
    }

    function setTemp(val) {
      spTemp.t = HL.clamp(val, 50, 95);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setTemp(78.3);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setTemp(50 + norm * 45.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spTemp, dt);
      if (spTemp.x >= 78.3) {
        const rate = 0.5 + ((spTemp.x - 78.3) / 12.0) * 1.5;
        accumulatedVolume = Math.min(25.0, accumulatedVolume + rate * dt);
      }
      draw();
      return moving || spTemp.x >= 78.3;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setTemp(Number(v));
      },
      destroy: bag.dispose,
      dispose: bag.dispose
    };
  }
},
/*
 * 5. Universal pH Scale & Porcelain Spot Plate (Thang Đo pH & Khay Giếng Sứ Thí Nghiệm)
 * Chemical Concept: Thang đo nồng độ ion hydronium: pH = -log10[H⁺] (0 đến 14):
 *   - Giếng 1: HCl 0.10 M (Axit mạnh, [H⁺] = 10⁻¹ M, pH = 1.00) ──> Quỳ đỏ đậm (.hi)
 *   - Giếng 2: Nước chanh / Axit citric ([H⁺] ≈ 10⁻³ M, pH = 3.00) ──> Quỳ cam đỏ
 *   - Giếng 3: Nước cất tinh khiết ([H⁺] = 10⁻⁷ M, pH = 7.00) ──> Trung tính, quỳ không đổi màu
 *   - Giếng 4: Dung dịch NaHCO₃ / Xà phòng ([H⁺] ≈ 3·10⁻¹⁰ M, pH = 9.50) ──> Quỳ xanh da trời
 *   - Giếng 5: NaOH 0.10 M (Bazơ mạnh, [H⁺] = 10⁻¹³ M, pH = 13.00) ──> Quỳ xanh lam tím đậm (.hi)
 * Geometry (Lucas Markes Specimen Discipline):
 *   - Khay sứ thử phản ứng màu 5 lỗ (5-well white porcelain spot plate) có lòng giếng lõm thật,
 *     thành miệng vát, đáy chứa dung dịch ở Z = 1.0 đến 2.5.
 *   - Thước thang chia độ chuẩn pH 1-14 phía sau với kim trượt định vị cơ học.
 *   - Nhíp kẹp thép không gỉ gắp dải giấy quỳ di động trên trục X.
 * Kinematics & Physical Contact Mandate:
 *   - Khi di chuyển qua lại, giấy quỳ được nhấc bổng an toàn (Z_tip = 8.5 > Z_well = 4.0).
 *   - Khi dừng trên miệng giếng, cơ chế nhúng (dipping) hạ đầu que quỳ xuống Z_tip = 1.8.
 *   - CHỈ KHI đầu giấy quỳ chạm và ngập trong mặt dung dịch (Z_tip ≤ 2.5), phản ứng hóa học
 *     mới kích hoạt, đầu giấy đổi màu và thang đo mới công nhận kết quả pH!
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
    const C = HL.Cam(45, 0.5, 2.5);
    HL.fit(C, [[-34, -18, 0], [34, 18, 38]], 200, 160);
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

    // 1. pH Reference Track & Calibrated Ticks along back edge (Y = -10, X = -32 to 32, Z = 0)
    const trackY = -10.0;
    const trackGroup = HL.mk("g", { class: "lo" }, svg);
    HL.mk("line", {
      x1: HL.r2(P(-32, trackY, 0.1)[0]), y1: HL.r2(P(-32, trackY, 0.1)[1]),
      x2: HL.r2(P(32, trackY, 0.1)[0]), y2: HL.r2(P(32, trackY, 0.1)[1]),
      stroke: "var(--hl-edge)", "stroke-width": 1.2
    }, trackGroup);

    // 14 ticks along the track (pH 1 to 14)
    for (let ph = 1; ph <= 14; ph++) {
      const tx = -32 + ((ph - 1) / 13) * 64;
      const isAnchor = ph === 1 || ph === 7 || ph === 14;
      const tLen = isAnchor ? 2.8 : 1.4;
      const pA = P(tx, trackY - tLen / 2, 0.1);
      const pB = P(tx, trackY + tLen / 2, 0.1);
      HL.mk("line", {
        x1: HL.r2(pA[0]), y1: HL.r2(pA[1]),
        x2: HL.r2(pB[0]), y2: HL.r2(pB[1]),
        class: isAnchor ? "hi" : "lo",
        stroke: "var(--hl-edge)",
        "stroke-width": isAnchor ? 1.4 : 0.8
      }, trackGroup);
    }

    // Sliding Indicator Needle on Track
    const needleGroup = HL.mk("g", {}, svg);
    const needleSol = HL.solid(needleGroup);

    // 2. White Porcelain Spot Plate (Khay sứ thí nghiệm 5 giếng: X = -30 to 30, Y = -4 to 12, Z = 0 to 4.0)
    const plateSol = HL.solid(svg);
    const [plO, plI] = HL.rings(-30, -4, 30, 12, 2.5, 0.6);
    HL.put(plateSol, HL.prism(P, front, plO, plI, 0, 4.0));

    // 5 Concave Wells (Lòng giếng sứ lõm)
    const SAMPLES = [
      { name: "HCl 0.10 M (Axit mạnh)", ph: 1.0, x: -24, colorName: "Đỏ rực", formula: "[H⁺]=0.1 M" },
      { name: "Nước Chanh Citric (Axit yếu)", ph: 3.0, x: -12, colorName: "Cam đỏ", formula: "[H⁺]=10⁻³ M" },
      { name: "Nước Cất H₂O (Trung tính)", ph: 7.0, x: 0, colorName: "Tím nhạt (không đổi)", formula: "[H⁺]=10⁻⁷ M" },
      { name: "Xà Phòng NaHCO₃ (Bazơ yếu)", ph: 9.5, x: 12, colorName: "Xanh da trời", formula: "[H⁺]=3·10⁻¹⁰ M" },
      { name: "NaOH 0.10 M (Bazơ mạnh)", ph: 13.0, x: 24, colorName: "Xanh lam đậm", formula: "[H⁺]=10⁻¹³ M" }
    ];

    const wellGroup = HL.mk("g", {}, svg);
    const wellR = 3.6;
    const wellY = 4.0;

    SAMPLES.forEach(s => {
      // Well outer circular rim lip on top surface of porcelain plate (Z = 4.0)
      const rimPts = [];
      for (let a = 0; a <= 24; a++) {
        const rad = (a * 2 * Math.PI) / 24;
        rimPts.push(P(s.x + wellR * Math.cos(rad), wellY + wellR * Math.sin(rad), 4.05));
      }
      HL.mk("path", {
        d: "M " + rimPts.map(p => `${HL.r2(p[0])} ${HL.r2(p[1])}`).join(" L "),
        class: "lo", fill: "none", stroke: "var(--hl-edge)", "stroke-width": 1.0
      }, wellGroup);

      // Cavity wall inner circle (Z = 1.0 to 4.0)
      const innerPts = [];
      for (let a = 0; a <= 24; a++) {
        const rad = (a * 2 * Math.PI) / 24;
        innerPts.push(P(s.x + (wellR - 0.6) * Math.cos(rad), wellY + (wellR - 0.6) * Math.sin(rad), 4.02));
      }
      HL.mk("path", {
        d: "M " + innerPts.map(p => `${HL.r2(p[0])} ${HL.r2(p[1])}`).join(" L "),
        class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 0.8
      }, wellGroup);

      // Liquid puddle surface at Z = 2.4 inside cavity
      const liqPts = [];
      for (let a = 0; a <= 24; a++) {
        const rad = (a * 2 * Math.PI) / 24;
        liqPts.push(P(s.x + (wellR - 0.9) * Math.cos(rad), wellY + (wellR - 0.9) * Math.sin(rad), 2.4));
      }
      HL.mk("path", {
        d: "M " + liqPts.map(p => `${HL.r2(p[0])} ${HL.r2(p[1])}`).join(" L "),
        class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.0
      }, wellGroup);
    });

    // 3. Tweezers & Paper Test Strip (Nhíp gắp que thử quỳ tím)
    const toolGroup = HL.mk("g", {}, svg);
    const tweezerArmL = HL.mk("line", { class: "sil", "stroke-width": 1.8, stroke: "var(--hl-edge)" }, toolGroup);
    const tweezerArmR = HL.mk("line", { class: "sil", "stroke-width": 1.8, stroke: "var(--hl-edge)" }, toolGroup);
    const tweezerPivot = HL.mk("circle", { r: 1.8, class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.2 }, toolGroup);

    // Paper Strip Body (Dry portion, upper)
    const paperDryBody = HL.mk("polygon", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.0 }, toolGroup);
    // Paper Strip Submerged Tip (Reactive indicator portion, lower 2.5 units)
    const paperTip = HL.mk("polygon", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, toolGroup);

    // Kinematic Springs
    const initialX = initialV != null ? initialV : 0;
    const spX = HL.spring(initialX, { k: 130, c: 15 });
    const spDip = HL.spring(0, { k: 160, c: 14 }); // 0 = Lifted high (Z_tip = 8.5), 1 = Dipped in liquid (Z_tip = 1.8)

    function draw() {
      const curX = spX.x;

      // Find nearest well
      let closestIdx = 0;
      let minDis = 999;
      SAMPLES.forEach((s, idx) => {
        const dis = Math.abs(curX - s.x);
        if (dis < minDis) {
          minDis = dis;
          closestIdx = idx;
        }
      });
      const nearest = SAMPLES[closestIdx];
      const isDirectlyOverWell = minDis <= 2.2;

      // Automatic dipping kinematics: dip only when centered over a well
      if (isDirectlyOverWell) {
        spDip.t = 1.0;
      } else {
        spDip.t = 0.0;
      }

      // Vertical position of paper strip:
      // When lifted (dip = 0): tip is at Z = 8.5 (above plate Z = 4.0)
      // When dipped (dip = 1): tip is at Z = 1.8 (submerged in liquid Z_liq = 2.4!)
      const dipVal = spDip.x;
      const tipZ = 8.5 - dipVal * 6.7;
      const topZ = tipZ + 12.0;
      const submergeBoundaryZ = tipZ + 2.4; // Lower 2.4 units of paper is the reactive zone

      // Physical contact check: Tip must be submerged below liquid surface Z = 2.4
      const isSubmerged = isDirectlyOverWell && tipZ <= 2.4;

      // 1. Draw Paper Strip (Upper dry body & lower tip)
      const pW = 1.5;
      const pTopL = P(curX - pW, wellY, topZ);
      const pTopR = P(curX + pW, wellY, topZ);
      const pMidL = P(curX - pW, wellY, submergeBoundaryZ);
      const pMidR = P(curX + pW, wellY, submergeBoundaryZ);
      const pBotL = P(curX - pW, wellY, tipZ);
      const pBotR = P(curX + pW, wellY, tipZ);

      paperDryBody.setAttribute("points", `${HL.r2(pTopL[0])},${HL.r2(pTopL[1])} ${HL.r2(pTopR[0])},${HL.r2(pTopR[1])} ${HL.r2(pMidR[0])},${HL.r2(pMidR[1])} ${HL.r2(pMidL[0])},${HL.r2(pMidL[1])}`);
      paperTip.setAttribute("points", `${HL.r2(pMidL[0])},${HL.r2(pMidL[1])} ${HL.r2(pMidR[0])},${HL.r2(pMidR[1])} ${HL.r2(pBotR[0])},${HL.r2(pBotR[1])} ${HL.r2(pBotL[0])},${HL.r2(pBotL[1])}`);

      // 2. Draw Tweezers
      const twPivotPt = P(curX, wellY, topZ + 6.0);
      tweezerPivot.setAttribute("cx", HL.r2(twPivotPt[0]));
      tweezerPivot.setAttribute("cy", HL.r2(twPivotPt[1]));

      tweezerArmL.setAttribute("x1", HL.r2(twPivotPt[0]));
      tweezerArmL.setAttribute("y1", HL.r2(twPivotPt[1]));
      tweezerArmL.setAttribute("x2", HL.r2(pTopL[0]));
      tweezerArmL.setAttribute("y2", HL.r2(pTopL[1]));

      tweezerArmR.setAttribute("x1", HL.r2(twPivotPt[0]));
      tweezerArmR.setAttribute("y1", HL.r2(twPivotPt[1]));
      tweezerArmR.setAttribute("x2", HL.r2(pTopR[0]));
      tweezerArmR.setAttribute("y2", HL.r2(pTopR[1]));

      // 3. Sliding Indicator Needle on Reference Track
      const targetPH = isSubmerged ? nearest.ph : 7.0;
      const needleX = -32 + ((targetPH - 1) / 13) * 64;
      const nP0 = P(needleX - 1.8, trackY - 2.0, 0.1);
      const nP1 = P(needleX + 1.8, trackY - 2.0, 0.1);
      const nP2 = P(needleX, trackY + 1.2, 0.1);
      const nP0T = P(needleX - 1.8, trackY - 2.0, 2.5);
      const nP1T = P(needleX + 1.8, trackY - 2.0, 2.5);
      const nP2T = P(needleX, trackY + 1.2, 2.5);

      let nSil = "";
      nSil += HL.poly([nP0, nP1, nP1T, nP0T]);
      nSil += HL.poly([nP1, nP2, nP2T, nP1T]);
      nSil += HL.poly([nP0T, nP1T, nP2T]);
      HL.put(needleSol, { sil: nSil, crease: "" });

      // 4. Indicator Reaction & Readout
      if (isSubmerged) {
        paperTip.classList.add("hi");
        needleSol.sil.classList.add("hi");
        read.textContent = `[ĐÃ TIẾP XÚC DUNG DỊCH] Mẫu: ${nearest.name} · ${nearest.formula} · pH = ${nearest.ph.toFixed(1)} · Quỳ chuyển màu ${nearest.colorName} (.hi)`;
      } else {
        paperTip.classList.remove("hi");
        needleSol.sil.classList.remove("hi");
        read.textContent = `[CHƯA TIẾP XÚC DUNG DỊCH] Que quỳ đang ở độ cao Z = ${tipZ.toFixed(1)} (khô ráo) · Di chuyển vào tâm giếng thử để nhúng đo pH`;
      }
    }

    function setX(val) {
      spX.t = HL.clamp(val, -26, 26);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setX(0);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setX(-26 + norm * 52.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spX, dt) | HL.stepS(spDip, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setX(Number(v));
      },
      destroy: bag.dispose,
      dispose: bag.dispose
    };
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

  function formatReadout(str) {
    if (!str) return "rest";
    if (str.length <= 24) return str;
    const br = str.match(/\[(.*?)\]/);
    const eq = str.match(/[a-zA-Z_θ°\u0394][a-zA-Z_0-9°]*\s*=\s*[^·\n⇒=()]{1,12}/g);
    if (br && eq) {
      const tag = br[1].replace(/HOÀN HẢO|- KÍN|- HỞ/g, "").trim();
      return (tag + " · " + eq[0].trim()).slice(0, 24);
    }
    if (eq && eq.length >= 2) {
      return (eq[0].trim() + " · " + eq[1].trim()).slice(0, 24);
    }
    if (eq) return eq[0].trim().slice(0, 24);
    if (br) return br[1].slice(0, 24);
    const parts = str.split(":");
    if (parts.length > 1) return parts[1].trim().slice(0, 24);
    return str.slice(0, 24);
  }

  const readBridge = {
    get textContent() { return readEl.textContent; },
    set textContent(v) {
      if (!v) { readEl.textContent = "rest"; return; }
      const str = String(v);
      readEl.textContent = formatReadout(str);
      meansEl.textContent = str;
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
