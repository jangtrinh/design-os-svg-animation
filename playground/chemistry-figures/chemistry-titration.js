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

export default {
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
};
