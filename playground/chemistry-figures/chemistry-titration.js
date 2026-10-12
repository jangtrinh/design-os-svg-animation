/*
 * 1. Acid-Base Titration & Buret (Chuẩn Độ Axit - Bazơ & Buret)
 * Chemical Concept: Phản ứng trung hòa H⁺ + OH⁻ → H₂O:
 *   - Nồng độ C_HCl = 0.1 M, V_HCl = 20.0 mL trong bình tam giác.
 *   - Nhỏ từ từ dung dịch chuẩn NaOH 0.1 M từ buret xuống.
 *   - Điểm tương đương: V_NaOH = 20.0 mL (pH = 7.0).
 *   - Khi V_NaOH ≥ 20.0 mL: Dư một lượng vết OH⁻ làm phenolphtalein chuyển sang màu hồng bền (.hi).
 * Geometry: Đế giá sắt thí nghiệm, thanh đứng, kẹp giữ buret thủy tinh chia vạch,
 *   khóa van buret, giọt rơi, bình tam giác Erlenmeyer đặc đáy rộng (100% opaque).
 * Kinematics: Di chuột điều chỉnh khóa buret; thể tích xả NaOH tăng từ 0 đến 25 mL,
 *   mực chất lỏng buret hạ thấp, khi đạt 20.0 mL chất lỏng bình tam giác kích hoạt .hi rực rỡ.
 */

export default {
  id: "chemistry-titration",
  title: "1. Chuẩn Độ Axit - Bazơ (Acid-Base Titration)",
  concept: "Phản ứng trung hòa: H⁺ + OH⁻ → H₂O · Điểm tương đương pH = 7.0 (Chỉ thị phenolphtalein)",
  means: "Di chuột điều khiển xả dung dịch chuẩn NaOH từ buret xuống bình tam giác. Khi thể tích đạt đúng 20.0 mL (điểm tương đương), dung dịch lập tức đổi màu hồng cánh sen báo hiệu kết thúc chuẩn độ.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 10, 25],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 40]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Lab Stand Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // Stand Vertical Rod at (-18, 0, 2.5 to 38)
    const rodSol = HL.solid(svg);
    HL.put(rodSol, HL.prism(P, front, HL.circ(1.8, 16), HL.circ(1.4, 16), 2.5, 38, [-18, 0]));

    // Clamp Arm from rod (-18, 0, 26) to buret holder (0, 0, 26)
    const clampSol = HL.solid(svg);
    const [clO, clI] = HL.rings(-18, -1.2, 0, 1.2, 0.5, 0.2);
    HL.put(clampSol, HL.prism(P, front, clO, clI, 25.0, 27.0));

    // 2. Erlenmeyer Flask sitting at (0, 0, 2.5) - Solid Opaque Frustum
    const flaskGroup = HL.mk("g", {}, svg);
    const flaskBody = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);
    const flaskTopFace = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);
    const flaskLiquid = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);

    const flaskBaseR = 8.8;
    const flaskNeckR = 3.2;

    // Erlenmeyer 3D solid construction
    // Bottom points from theta = 135 deg to -45 deg (counter-clockwise)
    function buildFlaskPath() {
      const bPts = [];
      const N = 24;
      // Bottom front arc: from a = 9 (135 deg) down to -3 (-45 deg)
      for (let i = 0; i <= 12; i++) {
        const ang = (135 - i * 15) * Math.PI / 180;
        bPts.push(P(flaskBaseR * Math.cos(ang), flaskBaseR * Math.sin(ang), 2.5));
      }
      // Top neck front arc: from -45 deg to 135 deg
      const tPts = [];
      for (let i = 0; i <= 12; i++) {
        const ang = (-45 + i * 15) * Math.PI / 180;
        tPts.push(P(flaskNeckR * Math.cos(ang), flaskNeckR * Math.sin(ang), 10.5));
      }
      const allBodyPts = [...bPts, ...tPts];
      flaskBody.setAttribute("d", HL.poly(allBodyPts));

      // Neck top rim ellipse
      const rimPts = [];
      for (let a = 0; a < N; a++) {
        const ang = (a * 2 * Math.PI) / N;
        rimPts.push(P(flaskNeckR * Math.cos(ang), flaskNeckR * Math.sin(ang), 10.5));
      }
      flaskTopFace.setAttribute("d", HL.poly(rimPts));
    }
    buildFlaskPath();

    // 3. Glass Buret (Vertical cylinder at 0, 0, Z: 14 to 38)
    const buretGroup = HL.mk("g", {}, svg);
    const buretSol = HL.solid(buretGroup);
    const buretR = 2.4;
    HL.put(buretSol, HL.prism(P, front, HL.circ(buretR, 20), HL.circ(buretR - 0.4, 20), 14.5, 37.5));

    // Graduation scale ticks along buret front
    for (let gz = 16.5; gz <= 35.5; gz += 1.5) {
      const isMajor = (gz - 16.5) % 3 === 0;
      const tLen = isMajor ? 1.6 : 0.9;
      const ptA = P(buretR * Math.cos(0.5), buretR * Math.sin(0.5), gz);
      const ptB = P((buretR - tLen) * Math.cos(0.5), (buretR - tLen) * Math.sin(0.5), gz);
      HL.mk("line", {
        x1: HL.r2(ptA[0]), y1: HL.r2(ptA[1]),
        x2: HL.r2(ptB[0]), y2: HL.r2(ptB[1]),
        class: "lo", "stroke-width": 0.8
      }, buretGroup);
    }

    // Stopcock Valve at Z = 14.5
    const stopcockHandle = HL.mk("line", { class: "sil", "stroke-width": 2.4, stroke: "var(--hl-edge)" }, buretGroup);

    // Tip nozzle
    const tipPt0 = P(0, 0, 14.5);
    const tipPt1 = P(0, 0, 12.0);
    HL.mk("line", {
      x1: HL.r2(tipPt0[0]), y1: HL.r2(tipPt0[1]),
      x2: HL.r2(tipPt1[0]), y2: HL.r2(tipPt1[1]),
      class: "sil", "stroke-width": 1.4
    }, buretGroup);

    // Liquid Meniscus Disc inside Buret
    const buretMeniscus = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, buretGroup);

    // Droplet
    const dropGroup = HL.mk("circle", { cx: HL.r2(P(0, 0, 11.2)[0]), cy: HL.r2(P(0, 0, 11.2)[1]), r: 1.1, class: "dot" }, buretGroup);

    // Kinematics Springs
    const spVol = HL.spring(initialV != null ? initialV : 10, { k: 120, c: 14 });

    function draw() {
      const vol = spVol.x; // 0 to 25 mL
      const isEquiv = vol >= 20.0;

      // Stopcock rotation
      const valveAngle = HL.clamp(vol / 25, 0, 1) * (Math.PI / 2);
      const scL = 4.2;
      const scP0 = P(-scL * Math.cos(valveAngle), 0, 14.5 + scL * Math.sin(valveAngle));
      const scP1 = P(scL * Math.cos(valveAngle), 0, 14.5 - scL * Math.sin(valveAngle));
      stopcockHandle.setAttribute("x1", HL.r2(scP0[0]));
      stopcockHandle.setAttribute("y1", HL.r2(scP0[1]));
      stopcockHandle.setAttribute("x2", HL.r2(scP1[0]));
      stopcockHandle.setAttribute("y2", HL.r2(scP1[1]));

      // Meniscus inside buret: Z drops from 35.0 down to 18.0
      const menZ = 35.0 - (vol / 25.0) * 17.0;
      const menPts = [];
      for (let a = 0; a < 20; a++) {
        const ang = (a * 2 * Math.PI) / 20;
        menPts.push(P((buretR - 0.4) * Math.cos(ang), (buretR - 0.4) * Math.sin(ang), menZ));
      }
      buretMeniscus.setAttribute("d", HL.poly(menPts));

      // Liquid in flask
      const liqZ = 3.5 + (vol / 25.0) * 2.2;
      const liqR = flaskBaseR - ((liqZ - 2.5) / 8.0) * (flaskBaseR - flaskNeckR);
      const liqPts = [];
      for (let a = 0; a < 24; a++) {
        const ang = (a * 2 * Math.PI) / 24;
        liqPts.push(P(liqR * Math.cos(ang), liqR * Math.sin(ang), liqZ));
      }
      flaskLiquid.setAttribute("d", HL.poly(liqPts));

      // Droplet visibility
      dropGroup.setAttribute("opacity", (vol > 0.5 && vol < 24.5) ? 1 : 0);

      // Color indicator transition
      flaskLiquid.classList.toggle("hi", isEquiv);
      flaskBody.classList.toggle("hi", isEquiv);

      // pH calculation
      let ph = 1.0;
      if (vol < 19.8) {
        ph = 1.0 + (vol / 20.0) * 2.2;
      } else if (vol < 20.0) {
        ph = 3.2 + ((vol - 19.8) / 0.2) * 3.8;
      } else if (vol === 20.0) {
        ph = 7.0;
      } else {
        ph = 7.0 + Math.min(5.5, Math.log10(1 + (vol - 20.0) * 10) * 2.5);
      }

      const vStr = HL.r2(vol);
      const phStr = HL.r2(ph);
      if (isEquiv) {
        read.textContent = `Chuẩn độ: V_NaOH = ${vStr} mL · pH = ${phStr} · [ĐIỂM TƯƠNG ĐƯƠNG] Phenolphtalein đổi màu hồng cánh sen (.hi)`;
      } else {
        read.textContent = `Chuẩn độ: V_NaOH = ${vStr} mL · pH = ${phStr} · Môi trường axit (Không màu, pH < 7)`;
      }
    }

    function setVolume(v) {
      spVol.t = HL.clamp(v, 0, 25);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setVolume(10.0);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setVolume(norm * 25.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spVol, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setVolume(Number(v));
      },
      destroy: bag.dispose
    };
  }
};
