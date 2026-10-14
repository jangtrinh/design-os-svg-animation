/*
 * 4. Distillation Apparatus & Liebig Condenser (Bộ Chưng Cất Phân Đoạn & Ống Sinh Hàn Liebig)
 * Binary mixture C₂H₅OH (bp = 78.3°C) + H₂O (bp = 100.0°C); counter-current Liebig condensation.
 */

export default {
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
    HL.mk("path", {
      class: "nf hi",
      d: HL.seg(nozIn, [nozIn[0] - nx * 8, nozIn[1] - ny * 8]) +
         HL.seg(nozOut, [nozOut[0] + nx * 8, nozOut[1] + ny * 8])
    }, svg);

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
        }
      } else {
        drpD = HL.seg(P(rX, rY, adaptTipWorld[2]), P(rX, rY, adaptTipWorld[2] - 0.5));
      }
      vaporArrows.setAttribute("d", vapD);
      dripPath.setAttribute("d", drpD);
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
};
